import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const exercises = await prisma.exerciseLibrary.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, videoUrl } = body;

    if (!name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const existing = await prisma.exerciseLibrary.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: "Ya existe un ejercicio con ese nombre" }, { status: 400 });
    }

    const newExercise = await prisma.exerciseLibrary.create({
      data: {
        name,
        videoUrl: videoUrl || "",
      },
    });

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
