import prisma from "@/lib/prisma";

export async function processGamification(studentId: string, activityDate: Date = new Date(), isSkipped: boolean = false) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { badges: true }
    });

    if (!student) return null;

    let { xp, level, currentStreak, longestStreak, lastActivityDate } = student;
    const earnedBadges: string[] = [];

    // Si el día fue marcado como omitido/no realizado, se rompe la racha.
    if (isSkipped) {
      currentStreak = 0;
      const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: { currentStreak }
      });
      return { updatedStudent, leveledUp: false, earnedBadges: [] };
    }

    // 1. Calcular Racha (Streak) al completar un día
    activityDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día local
    
    if (lastActivityDate) {
      const lastDate = new Date(lastActivityDate);
      lastDate.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(activityDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 4) {
        // Pasaron más de 4 días sin entrenar, pierde la racha.
        currentStreak = 1;
      } else if (diffDays >= 1) {
        // Entrenó en un día calendario distinto, dentro del margen de gracia.
        currentStreak += 1;
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

export async function awardBadgeToStudent(studentId: string, badgeId: string, title: string, message: string) {
  try {
    const existing = await prisma.studentBadge.findFirst({
      where: { studentId, badgeId }
    });
    
    if (!existing) {
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
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error awarding badge:", e);
    return false;
  }
}

export async function checkWeightMilestone(studentId: string, exerciseName: string, currentWeight: number) {
  try {
    // Si el peso es muy bajo, lo ignoramos para evitar falsos positivos
    if (!currentWeight || currentWeight <= 0) return false;

    // Buscar el peso mínimo registrado históricamente para este ejercicio por el estudiante.
    // Solo buscamos ejercicios pasados (completados) con el mismo nombre
    const pastExercises = await prisma.exercise.findMany({
      where: {
        name: exerciseName,
        routineDay: {
          routine: { studentId },
          completedAt: { not: null }
        }
      }
    });

    if (pastExercises.length === 0) return false;

    let minHistoricalWeight = Infinity;

    for (const ex of pastExercises) {
      let maxInEx = 0;
      let hasValidWeight = false;

      // Buscar en el peso directo
      if (ex.weight) {
        const w = parseFloat(ex.weight.replace(/[^\d.]/g, ''));
        if (!isNaN(w) && w > 0) {
          maxInEx = w;
          hasValidWeight = true;
        }
      }

      // Buscar en loggedSets
      if (ex.loggedSets) {
        try {
          const sets = JSON.parse(ex.loggedSets);
          if (Array.isArray(sets)) {
            sets.forEach((set: any) => {
              if (set.weight) {
                const w = parseFloat(set.weight.toString().replace(/[^\d.]/g, ''));
                if (!isNaN(w) && w > maxInEx) {
                  maxInEx = w;
                  hasValidWeight = true;
                }
              }
            });
          }
        } catch (e) {}
      }

      if (hasValidWeight && maxInEx < minHistoricalWeight) {
        minHistoricalWeight = maxInEx;
      }
    }

    if (minHistoricalWeight !== Infinity && minHistoricalWeight > 0) {
      if (currentWeight - minHistoricalWeight >= 10) {
        const safeName = exerciseName.replace(/[^a-zA-Z0-9_-]/g, "_").toUpperCase().substring(0, 30);
        const badgeId = `BULL_PROGRESS_${safeName}`;
        
        const awarded = await awardBadgeToStudent(
          studentId,
          badgeId,
          "Progreso Toro",
          `¡Aumentaste 10 kg en ${exerciseName}! Toma tu medalla de Toro.`
        );

        if (awarded) {
          // Evaluar cuántos toros tiene
          const totalBulls = await prisma.studentBadge.count({
            where: {
              studentId,
              badgeId: { startsWith: "BULL_PROGRESS_" }
            }
          });

          if (totalBulls >= 50) {
            await awardBadgeToStudent(
              studentId,
              "MUTANT_MODE",
              "Mutante",
              "¡Has coleccionado 50 medallas de Toro! Eres un Mutante, el nivel máximo de progreso."
            );
          } else if (totalBulls >= 10) {
            await awardBadgeToStudent(
              studentId,
              "BEAST_MODE",
              "Bestia",
              "¡Has coleccionado 10 medallas de Toro! Te has convertido en una Bestia."
            );
          }
        }
        
        return awarded;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking weight milestone:", error);
    return false;
  }
}

