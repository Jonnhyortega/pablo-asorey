import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { guardPublicForm } from '@/lib/form-guard';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const success = (message = 'Te has suscrito correctamente al newsletter') =>
  NextResponse.json({ message, success: true }, { status: 200 });

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const blocked = await guardPublicForm(request, body, 'newsletter', () => success());
    if (blocked) return blocked;

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ message: 'Ingresá un email válido' }, { status: 400 });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing?.active) {
      return success('Ya estabas suscripto al newsletter');
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email }
    });

    return success();
  } catch (error) {
    console.error('Error en suscripción al newsletter:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al procesar la suscripción' },
      { status: 500 }
    );
  }
}
