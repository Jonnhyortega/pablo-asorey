import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validación básica
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
    
    // Simulación de respuesta exitosa
    return NextResponse.json({
      message: 'Te has suscrito correctamente al newsletter',
      success: true
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: 'Error interno del servidor al procesar la suscripción' },
      { status: 500 }
    );
  }
}
