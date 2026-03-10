export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validación básica
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Nombre, email y mensaje son campos requeridos' },
        { status: 400 }
      );
    }

    // Save to the database using Prisma
    const messageRecord = await prisma.contactMessage.create({
      data: { name, email, message }
    });

    console.log('Nuevo mensaje de contacto guardado:', messageRecord.id);
    
    // Simulación de respuesta exitosa
    return NextResponse.json({
      message: 'Tu mensaje ha sido enviado correctamente. Te contactaremos a la brevedad.',
      success: true
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: 'Error interno del servidor al procesar el mensaje' },
      { status: 500 }
    );
  }
}
