import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processGamification, checkWeightMilestone } from "@/lib/gamification";

function extractMaxWeight(weightStr?: any, loggedSetsStr?: any): number {
  let max = 0;
  if (weightStr) {
    const w = parseFloat(String(weightStr).replace(/[^\d.]/g, ''));
    if (!isNaN(w) && w > max) max = w;
  }
  if (loggedSetsStr) {
    try {
      const sets = typeof loggedSetsStr === 'string' ? JSON.parse(loggedSetsStr) : loggedSetsStr;
      if (Array.isArray(sets)) {
        sets.forEach((set: any) => {
          if (set.weight) {
            const w = parseFloat(String(set.weight).replace(/[^\d.]/g, ''));
            if (!isNaN(w) && w > max) max = w;
          }
        });
      }
    } catch(e) {}
  }
  return max;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { completedAt, isSkipped, exercises } = body;

    const dataToUpdate: any = {};
    if (completedAt !== undefined) dataToUpdate.completedAt = completedAt ? new Date(completedAt) : null;
    if (isSkipped !== undefined) dataToUpdate.isSkipped = isSkipped;

    // Actualizar el día (fecha completado o omitido)
    let day = null;
    if (Object.keys(dataToUpdate).length > 0) {
      day = await prisma.routineDay.update({
        where: { id },
        data: dataToUpdate
      });
    }

    const { recordsBroken, studentId, studentName } = body;

    // Actualizar los ejercicios si vienen (peso, observaciones)
    if (exercises && Array.isArray(exercises)) {
      for (const ex of exercises) {
        if (ex.id) {
          const updatedEx = await prisma.exercise.update({
            where: { id: ex.id },
            data: {
              weight: ex.weight !== undefined ? ex.weight : undefined,
              loggedSets: ex.loggedSets !== undefined ? ex.loggedSets : undefined,
              observations: ex.observations !== undefined ? ex.observations : undefined,
              isCompleted: ex.isCompleted !== undefined ? ex.isCompleted : undefined
            }
          });

          if (studentId && (completedAt || ex.isCompleted)) {
             const maxW = extractMaxWeight(ex.weight, ex.loggedSets);
             if (maxW > 0) {
               checkWeightMilestone(studentId, updatedEx.name, maxW).catch(err => console.error("Milestone err:", err));
             }
          }
        }
      }
    }

    // --- REVERSIÓN INTELIGENTE ---
    // Siempre purgamos las notificaciones anteriores de este día para evitar duplicados o falsos positivos (si el usuario editó o desmarcó el día)
    if (studentId) {
      await prisma.studentNotification.deleteMany({
        where: {
          studentId: studentId,
          relatedDayId: id,
          type: { in: ["DAY_COMPLETED", "RECORD"] }
        }
      });
      await prisma.adminNotification.deleteMany({
        where: {
          studentId: studentId,
          relatedDayId: id,
          type: "SYSTEM",
          title: { in: ["Día Completado", "Nuevo Récord"] }
        }
      });
    }

    // Si se marcó como omitido, rompemos la racha
    if (isSkipped === true && studentId) {
      processGamification(studentId, new Date(), true).catch(err => console.error("Gamification skip error:", err));
    }

    // Crear notificaciones si se completó el día (o si es una edición que mantiene el completado y trae records)
    if (completedAt && studentId) {
      // PROCESAR GAMIFICACIÓN
      const activityDate = new Date(completedAt);
      processGamification(studentId, activityDate).catch(err => console.error("Gamification error:", err));

      // 1. Notificación al alumno de día completado
      await prisma.studentNotification.create({
        data: {
          type: "DAY_COMPLETED",
          title: "Día Completado",
          message: "¡Excelente trabajo! Has completado tu entrenamiento del día. Sigue así.",
          studentId: studentId,
          relatedDayId: id
        }
      });

      // 2. Notificación al admin de que el alumno entrenó
      await prisma.adminNotification.create({
        data: {
          type: "SYSTEM",
          title: "Día Completado",
          message: `El alumno ${studentName || "desconocido"} ha completado su entrenamiento.`,
          studentId: studentId,
          relatedDayId: id
        }
      });

      // 3. Notificaciones de récords rotos (ambos)
      if (recordsBroken && Array.isArray(recordsBroken)) {
        for (const record of recordsBroken) {
          // Alumno
          await prisma.studentNotification.create({
            data: {
              type: "RECORD",
              title: "¡Nuevo Récord Personal!",
              message: `¡Felicidades! Has levantado ${record.weight} kg en ${record.name}, estableciendo un nuevo récord.`,
              studentId: studentId,
              relatedDayId: id
            }
          });
          
          // Admin
          await prisma.adminNotification.create({
            data: {
              type: "SYSTEM",
              title: "Nuevo Récord",
              message: `El alumno ${studentName || "desconocido"} ha roto su récord en ${record.name} con ${record.weight} kg.`,
              studentId: studentId,
              relatedDayId: id
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
