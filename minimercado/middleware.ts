import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  // 🟢 Acessando o pathname de forma direta e garantindo que ele exista
  const pathname = request.nextUrl.pathname;

  // Por enquanto, mantemos como true para você conseguir navegar
  const userHasToken = true; 
  const userRole = 'ADMIN'; 

  // Proteção da Área Logada
  // Usamos uma verificação simples para evitar erros de tipo
  if (pathname.includes('/caixa') || 
      pathname.includes('/extratos') || 
      pathname.startsWith('/admin') ||
      pathname.includes('/meu-historico')) {
    
    if (!userHasToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Proteção Especial para a Área Admin
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/caixa?error=acesso-negado', request.url));
  }

  return NextResponse.next();
}

// 🟢 Ajustamos o matcher para ignorar QUALQUER arquivo que tenha extensão (como .map, .js, .css)
// Isso evita que o middleware tente "revistar" os arquivos internos do Next.js
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg|fundologin.svg|.*\\..*$).*)',
  ],
};