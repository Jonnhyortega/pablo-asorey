import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // ValidaciÃ³n bÃ¡sica
    if (!email) {
      return NextResponse.json(
        { message: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Save to the database using Prisma
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email }
    });

    console.log('Nuevo suscriptor a newsletter guardado:', subscriber.email);
    
    // SimulaciÃ³n de respuesta exitosa
    return NextResponse.json({
      message: 'Te has suscrito correctamente al newsletter',
      success: true
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: 'Error interno del servidor al procesar la suscripciÃ³n' },
      { status: 500 }
    );
  }
}
