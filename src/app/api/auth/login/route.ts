import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secreto-cambiar-en-produccion';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'El email y la contraseÃ±a son requeridos' },
        { status: 400 }
      );
    }

    // Buscamos al usuario en la base de datos (normalizando el email)
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Credenciales invÃ¡lidas' },
        { status: 401 }
      );
    }

    // Verificamos la contraseÃ±a
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Credenciales invÃ¡lidas' },
        { status: 401 }
      );
    }

    // Generamos el token JWT
    const token = jwt.sign(
      { id: user.id, userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '1d' }
    );

    // 5. Configurar la respuesta con la cookie
    const response = NextResponse.json(
      { message: "Login exitoso", user: { id: user.id, name: user.name, role: user.role } },
      { status: 200 }
    );

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 dÃ­as o 1 dÃ­a

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
