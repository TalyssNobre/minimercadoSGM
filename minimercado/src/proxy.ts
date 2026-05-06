import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const operatorLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(40, '10 s'),
});

const adminLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '10 s'),
});

export async function proxy(request: NextRequest) {

  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

 const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'public';

  if (user) {
    const { data: dbUser } = await supabase.from('User').select('profile').eq('user_id', user.id).single();
  }

  const limiter = (userRole === 'Admin') ? adminLimiter : operatorLimiter;
  const identifier = user ? user.id : (request.headers.get('x-forwarded-for') ?? '127.0.0.1');
  const { success } = await limiter.limit(identifier);

  if (!success) {
    return new NextResponse("Muitas requisições . Espere um pouco", { status: 429 });
  }

  const pathname = request.nextUrl.pathname;

  const rotasProtegidas = ['/caixa', '/extratos', '/admin', '/meu-historico'];
  const isRotaProtegida = rotasProtegidas.some(rota => pathname.startsWith(rota));

  if (isRotaProtegida && !user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/admin') && user) {
    const { data: dbUser } = await supabase.from('User').select('profile').eq('user_id', user.id).single();

    const userRole = dbUser?.profile; 
    if (userRole !== 'Admin') {
      return NextResponse.redirect(new URL('/caixa?error=acesso-negado', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|fundologin.svg|.*\\..*$).*)',
  ],
};