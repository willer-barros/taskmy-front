// middleware.ts (na raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Apenas redireciona para login se tentar acessar rotas protegidas
  // A verificação real do token será feita no cliente
  const pathname = request.nextUrl.pathname;
  
  // Se está na raiz, redireciona para login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/task/:path*', '/dashboards/:path*', '/suporte/:path*', '/settings/:path*'],
};