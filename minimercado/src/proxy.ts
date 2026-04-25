import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(40, '10 s'),
});

export async function proxy(request: NextRequest) {
  
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  // Se o utilizador fez mais de 15 pedidos em 10 segundos, bloqueia!
  if (!success) {
    return new NextResponse('Muitas requisições. Tente novamente em instantes.', { status: 429 });
  }

  // 🟢 2. CONFIGURAÇÃO DO SUPABASE
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

  // Pega o utilizador REAL do Supabase
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // 🟢 3. VERIFICAÇÃO BÁSICA (Está logado?)
  const rotasProtegidas = ['/caixa', '/extratos', '/admin', '/meu-historico'];
  const isRotaProtegida = rotasProtegidas.some(rota => pathname.startsWith(rota));

  if (isRotaProtegida && !user) {
    // Não tem utilizador? Manda para o login.
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 🟢 4. TRAVA ESPECÍFICA PARA ADMIN
  if (pathname.startsWith('/admin') && user) {
    // O proxy vai à tabela 'User' confirmar o cargo!
    const { data: dbUser } = await supabase
      .from('User')
      .select('profile')
      .eq('user_id', user.id)
      .single();

    // Pegamos o perfil retornado do banco
    const userRole = dbUser?.profile; 

    // Verificamos exatamente a palavra "Admin"
    if (userRole !== 'Admin') {
      // Se for diferente de "Admin", expulsa para o caixa
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