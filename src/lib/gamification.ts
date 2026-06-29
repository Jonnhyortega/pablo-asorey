import prisma from "@/lib/prisma";

export async function processGamification(studentId: string, activityDate: Date = new Date()) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { badges: true }
    });

    if (!student) return null;

    let { xp, level, currentStreak, longestStreak, lastActivityDate } = student;
    const earnedBadges: string[] = [];

    // 1. Calcular Racha (Streak)
    activityDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día local
    
    if (lastActivityDate) {
      const lastDate = new Date(lastActivityDate);
      lastDate.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(activityDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Entrenó días consecutivos
        currentStreak += 1;
      } else if (diffDays > 1) {
        // Perdió la racha
        currentStreak = 1;
      }
      // Si diffDays === 0, entrenó dos veces hoy, la racha se mantiene igual
    } else {
      currentStreak = 1; // Primer entrenamiento
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // 2. Sumar XP (Ej: +50 por clase)
    const XP_PER_CLASS = 50;
    xp += XP_PER_CLASS;

    // 3. Calcular Nivel (Ej: 100 XP por nivel, entonces Nivel = floor(XP / 100) + 1)
    const newLevel = Math.floor(xp / 100) + 1;
    let leveledUp = false;
    if (newLevel > level) {
      level = newLevel;
      leveledUp = true;
    }

    // 4. Badges (Medallas)
    const existingBadges = student.badges.map(b => b.badgeId);
    
    // Función auxiliar para otorgar badge
    const awardBadge = async (badgeId: string, title: string, message: string) => {
      if (!existingBadges.includes(badgeId)) {
        await prisma.studentBadge.create({
          data: { studentId, badgeId }
        });
        await prisma.studentNotification.create({
          data: {
            studentId,
            type: "SYSTEM",
            title: `¡Nueva Medalla: ${title}!`,
            message
          }
        });
        earnedBadges.push(badgeId);
      }
    };

    // Medalla: Primer Entrenamiento
    await awardBadge("FIRST_WORKOUT", "Primer Paso", "Has completado tu primer entrenamiento. ¡El viaje comienza!");

    // Medalla: Racha 7 días
    if (currentStreak >= 7) {
      await awardBadge("STREAK_7", "Racha de Fuego", "¡Has entrenado 7 días seguidos! Increíble constancia.");
    }

    // Medalla: Centurión (100 clases)
    // Contar cuántos RoutineDay completó
    const completedDaysCount = await prisma.routineDay.count({
      where: {
        routine: { studentId },
        completedAt: { not: null },
        isSkipped: false
      }
    });

    // Se suma 1 porque el actual todavía no está contado (lo estamos procesando ahora)
    if (completedDaysCount + 1 >= 100) {
      await awardBadge("CENTURION", "Centurión", "¡Increíble! Has completado 100 clases. Eres una leyenda.");
    }

    // 5. Guardar en DB
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        xp,
        level,
        currentStreak,
        longestStreak,
        lastActivityDate: activityDate
      }
    });

    if (leveledUp) {
      await prisma.studentNotification.create({
        data: {
          studentId,
          type: "SYSTEM",
          title: `¡Subiste al Nivel ${level}!`,
          message: `Has ganado suficiente experiencia para alcanzar el nivel ${level}. ¡Sigue así!`
        }
      });
    }

    return { updatedStudent, leveledUp, earnedBadges };

  } catch (error) {
    console.error("Error procesando gamificación:", error);
    return null;
  }
}
