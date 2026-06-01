import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define the secret correctly for Edge compatibility
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secreto-cambiar-en-produccion'
);

export async function middleware(request: NextRequest) {
  // Solo proteger rutas que empiezan con /admin
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  // Si no hay token y quiere entrar a /admin o subrutas (no login), redirigir
  if (!token && !isLoginRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Verificar la validez del token si existe
  if (token) {
    try {
      // Usamos jose (jwtVerify) que es compatible con el Edge Runtime de Next.js
      await jwtVerify(token, secret);
      
      // Si el token es válido y está en /admin/login, redirigir al admin de inmediato
      if (isLoginRoute) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    } catch (error) {
      console.error('Invalid token in middleware', error);
      // Si el token está corrupto / expirado pero intenta entrar a /admin
      if (!isLoginRoute) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('auth-token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
