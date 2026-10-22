import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { guardPublicForm } from '@/lib/form-guard';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const success = () =>
  NextResponse.json({
    message: 'Tu mensaje ha sido enviado correctamente. Te contactaremos a la brevedad.',
    success: true
  }, { status: 200 });

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const blocked = await guardPublicForm(request, body, 'contact', success);
    if (blocked) return blocked;

    const str = (key: string) => (typeof body?.[key] === 'string' ? (body[key] as string).trim() : '');
    const name = str('name');
    const email = str('email').toLowerCase();
    const message = str('message');

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Nombre, email y mensaje son campos requeridos' },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email) || name.length > 100 || email.length > 254 || message.length > 2000) {
      return NextResponse.json(
        { message: 'Revisá los datos: email válido, nombre hasta 100 caracteres y mensaje hasta 2000' },
        { status: 400 }
      );
    }

    // El mismo mensaje dos veces seguidas (doble clic, reintento) se guarda una sola vez.
    const duplicate = await prisma.contactMessage.findFirst({
      where: { email, message, createdAt: { gte: new Date(Date.now() - 60 * 60_000) } },
      select: { id: true }
    });
    if (!duplicate) {
      await prisma.contactMessage.create({ data: { name, email, message } });
    }

    return success();
  } catch (error) {
    console.error('Error guardando mensaje de contacto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al procesar el mensaje' },
      { status: 500 }
    );
  }
}
