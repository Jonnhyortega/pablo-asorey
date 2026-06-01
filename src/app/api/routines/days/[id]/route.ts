import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { completedAt, exercises } = body;

    // Actualizar el día (fecha completado)
    const day = await prisma.routineDay.update({
      where: { id },
      data: {
        completedAt: completedAt ? new Date(completedAt) : null,
      }
    });

    // Actualizar los ejercicios si vienen (peso, observaciones)
    if (exercises && Array.isArray(exercises)) {
      for (const ex of exercises) {
        if (ex.id) {
          await prisma.exercise.update({
            where: { id: ex.id },
            data: {
              weight: ex.weight !== undefined ? ex.weight : undefined,
              observations: ex.observations !== undefined ? ex.observations : undefined,
              isCompleted: ex.isCompleted !== undefined ? ex.isCompleted : undefined
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true, day });
  } catch (error) {
    console.error("Error updating routine day:", error);
    return NextResponse.json({ error: "Failed to update routine day" }, { status: 500 });
  }
}
