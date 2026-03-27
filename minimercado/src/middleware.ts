import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

  // Pega o usuário REAL do Supabase
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // 1. VERIFICAÇÃO BÁSICA (Está logado?)
  const rotasProtegidas = ['/caixa', '/extratos', '/admin', '/meu-historico'];
  const isRotaProtegida = rotasProtegidas.some(rota => pathname.startsWith(rota));
  

  if (isRotaProtegida && !user) {
    // Não tem usuário? Manda pro login.
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 🟢 2. TRAVA ESPECÍFICA PARA ADMIN
  if (pathname.startsWith('/admin') && user) {
    // Pegamos o perfil exatamente como ele vem do banco (ex: "Admin" ou "OPERADOR")
    const userRole = user.user_metadata?.profile; 

    // Verificamos exatamente a palavra "Admin"
    if (userRole !== 'Admin') {
      // Se for diferente de "Admin", chuta pro caixa
      return NextResponse.redirect(new URL('/caixa?error=acesso-negado', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg|fundologin.svg|.*\\..*$).*)',
  ],
};