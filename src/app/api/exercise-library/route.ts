import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const exercises = await prisma.exerciseLibrary.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercise library:', error);
    return NextResponse.json({ error: 'Failed to fetch exercise library' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, videoUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newExercise = await prisma.exerciseLibrary.create({
      data: {
        name,
        videoUrl: videoUrl || null,
      },
    });

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error: any) {
    console.error('Error creating exercise:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Exercise name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 });
  }
}
