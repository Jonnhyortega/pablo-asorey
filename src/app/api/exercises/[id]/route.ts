import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, videoUrl } = body;

    if (!name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    // Check if another exercise has the same name
    const existing = await prisma.exerciseLibrary.findUnique({
      where: { name },
    });

    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Ya existe otro ejercicio con ese nombre" }, { status: 400 });
    }

    const updatedExercise = await prisma.exerciseLibrary.update({
      where: { id },
      data: {
        name,
        videoUrl: videoUrl || "",
      },
    });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.exerciseLibrary.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
