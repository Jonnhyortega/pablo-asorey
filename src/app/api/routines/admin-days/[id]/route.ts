import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: routineDayId } = await params;
    const body = await request.json();
    const { dayName, order, exercises } = body;

    if (!dayName || !exercises) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Identificar qué ejercicios borrar
    const existingDay = await prisma.routineDay.findUnique({
      where: { id: routineDayId },
      include: { exercises: true }
    });

    if (!existingDay) {
      return NextResponse.json({ error: "Routine day not found" }, { status: 404 });
    }

    const incomingExIds = exercises.filter((ex: any) => ex.id).map((ex: any) => ex.id);
    const existingExIds = existingDay.exercises.map(ex => ex.id);
    const exercisesToDelete = existingExIds.filter(id => !incomingExIds.includes(id));

    const updatedDay = await prisma.routineDay.update({
      where: { id: routineDayId },
      data: {
        dayName,
        order: order !== undefined ? order : existingDay.order,
        exercises: {
          deleteMany: exercisesToDelete.length > 0 ? { id: { in: exercisesToDelete } } : undefined,
          update: exercises.filter((ex: any) => ex.id).map((ex: any) => ({
            where: { id: ex.id },
            data: {
              name: ex.name,
              sets_reps: ex.sets_reps,
              rest: ex.rest,
              videoUrl: ex.videoUrl || "",
              trackingType: ex.trackingType || "REPS",
              weight: ex.weight || "",
              observations: ex.observations || ""
            }
          })),
          create: exercises.filter((ex: any) => !ex.id).map((ex: any) => ({
            name: ex.name,
            sets_reps: ex.sets_reps,
            rest: ex.rest,
            videoUrl: ex.videoUrl || "",
            trackingType: ex.trackingType || "REPS",
            weight: ex.weight || "",
            observations: ex.observations || ""
          }))
        }
      },
      include: {
        exercises: true
      }
    });

    return NextResponse.json({ success: true, day: updatedDay });
  } catch (error) {
    console.error("Error updating routine day:", error);
    return NextResponse.json({ error: "Failed to update routine day" }, { status: 500 });
  }
}
