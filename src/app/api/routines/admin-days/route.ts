import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { routineId, dayName, order, exercises } = body;

    if (!routineId || !dayName || !exercises) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newDay = await prisma.routineDay.create({
      data: {
        routineId,
        dayName,
        order: order || 0,
        exercises: {
          create: exercises.map((ex: any) => ({
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
        exercises: true,
        routine: true
      }
    });

    if (newDay.routine) {
      await prisma.studentNotification.create({
        data: {
          studentId: newDay.routine.studentId,
          type: "NEW_ROUTINE",
          title: "Nuevo Día de Entrenamiento",
          message: `El profesor ha agregado el día "${dayName}" a tu rutina.`,
          relatedDayId: newDay.id
        }
      });
    }

    return NextResponse.json({ success: true, day: newDay });
  } catch (error) {
    console.error("Error creating routine day:", error);
    return NextResponse.json({ error: "Failed to create routine day" }, { status: 500 });
  }
}
