import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    await prisma.$transaction(async (tx) => {
      // 1. Borrar days huérfanos (sus ejercicios se borran en cascada por esquema)
      if (daysToDelete.length > 0) {
        await tx.routineDay.deleteMany({
          where: { id: { in: daysToDelete } }
        });
      }

      // 2. Actualizar fechas de la rutina base
      await tx.routine.update({
        where: { id: routineId },
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        }
      });

      // 3. Upsert de Días y Ejercicios
      for (const [dayIndex, day] of days.entries()) {
        let currentDayId = day.id;

        if (currentDayId) {
          // Update existente
          await tx.routineDay.update({
            where: { id: currentDayId },
            data: { dayName: day.dayName, order: dayIndex }
          });
        } else {
          // Crear nuevo día
          const newDay = await tx.routineDay.create({
            data: {
              routineId: routineId,
              dayName: day.dayName,
              order: dayIndex
            }
          });
          currentDayId = newDay.id;
        }

        // Obtener el día actual de existingRoutine para procesar los ejercicios huérfanos
        const existingDayData = existingRoutine.days.find(d => d.id === currentDayId);
        
        if (existingDayData) {
          const incomingExIds = day.exercises.filter((ex: any) => ex.id).map((ex: any) => ex.id);
          const existingExIds = existingDayData.exercises.map(ex => ex.id);
          const exercisesToDelete = existingExIds.filter(id => !incomingExIds.includes(id));
          
          if (exercisesToDelete.length > 0) {
            await tx.exercise.deleteMany({
              where: { id: { in: exercisesToDelete } }
            });
          }
        }

        // Upsert de ejercicios
        if (day.exercises && day.exercises.length > 0) {
          for (const ex of day.exercises) {
            if (ex.id) {
              await tx.exercise.update({
                where: { id: ex.id },
                data: {
                  name: ex.name,
                  sets_reps: ex.sets_reps,
                  rest: ex.rest,
                  videoUrl: ex.videoUrl
                }
              });
            } else {
              await tx.exercise.create({
                data: {
                  routineDayId: currentDayId,
                  name: ex.name,
                  sets_reps: ex.sets_reps,
                  rest: ex.rest,
                  videoUrl: ex.videoUrl || ""
                }
              });
            }
          }
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
