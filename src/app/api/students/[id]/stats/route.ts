import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secreto-cambiar-en-produccion'
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { payload } = await jwtVerify(token, secret);
    
    // Validate if user has right to view this
    if (payload.role !== "ADMIN" && payload.id !== id && payload.studentId !== id) {
      // It might be a student fetching their own stats via their student ID
      // Let's verify if payload.id is the user ID of the student.
      const requestingStudent = await prisma.student.findUnique({ where: { userId: payload.id as string } });
      if (!requestingStudent || requestingStudent.id !== id) {
        if (payload.role !== "ADMIN") {
          return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
      }
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        routines: {
          include: {
            days: {
              where: {
                completedAt: { not: null }
              },
              include: {
                exercises: true
              },
              orderBy: {
                completedAt: 'asc'
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Process stats
    // We want: grouped by exercise name
    // Result: { "Sentadilla": [ { date: "YYYY-MM-DD", weight: 100 }, ... ] }
    const stats: Record<string, { date: string; maxWeight: number }[]> = {};

    student.routines.forEach(routine => {
      routine.days.forEach(day => {
        if (!day.completedAt) return;
        const dateStr = day.completedAt.toISOString().split('T')[0];

        day.exercises.forEach(ex => {
          // Normalize name to group accurately
          const exName = ex.name.trim();
          let maxWeightForExThisDay = 0;
          let hasWeight = false;

          // Parse logged sets
          try {
            if (ex.loggedSets) {
              const sets = JSON.parse(ex.loggedSets);
              if (Array.isArray(sets)) {
                sets.forEach((set: any) => {
                  if (set.weight) {
                    const weightNum = parseFloat(set.weight.toString().replace(/[^\d.]/g, ''));
                    if (!isNaN(weightNum)) {
                      if (weightNum > maxWeightForExThisDay) {
                        maxWeightForExThisDay = weightNum;
                      }
                      hasWeight = true;
                    }
                  }
                });
              }
            }
          } catch (e) {
            // ignore parse error
          }

          // If no sets logged, maybe they put it in the observations or it was empty. We skip.
          if (hasWeight && maxWeightForExThisDay > 0) {
            if (!stats[exName]) {
              stats[exName] = [];
            }
            // Check if this date already has an entry for this exercise (e.g. they did it twice in a day, rare but possible)
            const existingEntry = stats[exName].find(s => s.date === dateStr);
            if (existingEntry) {
              if (maxWeightForExThisDay > existingEntry.maxWeight) {
                existingEntry.maxWeight = maxWeightForExThisDay;
              }
            } else {
              stats[exName].push({
                date: dateStr,
                maxWeight: maxWeightForExThisDay
              });
            }
          }
        });
      });
    });

    // Only return exercises that have at least 2 data points to actually draw a progression line
    const filteredStats: Record<string, { date: string; maxWeight: number }[]> = {};
    for (const [name, data] of Object.entries(stats)) {
      if (data.length > 1) {
        // Sort by date just in case
        filteredStats[name] = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    }

    return NextResponse.json(filteredStats);
  } catch (error: any) {
    console.error("Error fetching student stats:", error);
    return NextResponse.json({ error: "Error interno", details: error.message }, { status: 500 });
  }
}
