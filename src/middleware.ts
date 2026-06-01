import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secreto-cambiar-en-produccion'
);

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isStudentRoute = request.nextUrl.pathname.startsWith('/student');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/login';

  if (!isAdminRoute && !isStudentRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token && !isLoginRoute) {
    const loginPath = isAdminRoute ? '/admin/login' : '/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      
      if (isLoginRoute) {
        const redirectPath = payload.role === 'ADMIN' ? '/admin' : '/student';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      return NextResponse.next();
    } catch (error) {
      console.error('Invalid token in middleware', error);
      if (!isLoginRoute) {
        const loginPath = isAdminRoute ? '/admin/login' : '/login';
        const response = NextResponse.redirect(new URL(loginPath, request.url));
        response.cookies.delete('auth-token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*'],
};
