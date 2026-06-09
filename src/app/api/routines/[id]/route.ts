import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: routineId } = await params;
    const body = await request.json();
    const { startDate, endDate, days } = body;

    if (!startDate || !endDate || !days) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Obtener la rutina actual para saber qué IDs existían y cuáles borrar
    const existingRoutine = await prisma.routine.findUnique({
      where: { id: routineId },
      include: { days: { include: { exercises: true } } }
    });

    if (!existingRoutine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    // Identificar los days que vinieron en la petición para no borrarlos
    const incomingDayIds = days.filter((d: any) => d.id).map((d: any) => d.id);
    const existingDayIds = existingRoutine.days.map((d: any) => d.id);
    const daysToDelete = existingDayIds.filter(id => !incomingDayIds.includes(id));

    await prisma.routine.update({
      where: { id: routineId },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: {
          deleteMany: daysToDelete.length > 0 ? { id: { in: daysToDelete } } : undefined,
          update: days.filter((d: any) => d.id).map((day: any, index: number) => {
            const incomingExIds = day.exercises.filter((ex: any) => ex.id).map((ex: any) => ex.id);
            const existingDayData = existingRoutine.days.find(d => d.id === day.id);
            const existingExIds = existingDayData ? existingDayData.exercises.map(ex => ex.id) : [];
            const exercisesToDelete = existingExIds.filter(id => !incomingExIds.includes(id));

            return {
              where: { id: day.id },
              data: {
                dayName: day.dayName,
                order: index,
                exercises: {
                  deleteMany: exercisesToDelete.length > 0 ? { id: { in: exercisesToDelete } } : undefined,
                  update: day.exercises.filter((ex: any) => ex.id).map((ex: any) => ({
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
                  create: day.exercises.filter((ex: any) => !ex.id).map((ex: any) => ({
                    name: ex.name,
                    sets_reps: ex.sets_reps,
                    rest: ex.rest,
                    videoUrl: ex.videoUrl || "",
                    trackingType: ex.trackingType || "REPS",
                    weight: ex.weight || "",
                    observations: ex.observations || ""
                  }))
                }
              }
            };
          }),
          create: days.filter((d: any) => !d.id).map((day: any, index: number) => ({
            dayName: day.dayName,
            order: index,
            exercises: {
              create: day.exercises.map((ex: any) => ({
                name: ex.name,
                sets_reps: ex.sets_reps,
                rest: ex.rest,
                videoUrl: ex.videoUrl || "",
                trackingType: ex.trackingType || "REPS",
                weight: ex.weight || "",
                observations: ex.observations || ""
              }))
            }
          }))
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating routine:", error);
    return NextResponse.json({ error: "Failed to update routine" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: routineId } = await params;
    await prisma.routine.delete({
      where: { id: routineId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting routine:", error);
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
  }
}
