import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";



// GET /api/routines?studentId=123
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const routines = await prisma.routine.findMany({
      where: { studentId },
      include: {
        days: {
          include: {
            exercises: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return NextResponse.json(routines);
  } catch (error) {
    console.error("Error fetching routines:", error);
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 });
  }
}

// POST /api/routines
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, startDate, endDate, days } = body;

    // days is an array of { dayName, order, exercises: [{ name, sets_reps, rest, videoUrl }] }
    const routine = await prisma.routine.create({
      data: {
        studentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: {
          create: days.map((day: any, index: number) => ({
            dayName: day.dayName,
            order: day.order || index,
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
      },
      include: {
        days: {
          include: {
            exercises: true
          }
        }
      }
    });

    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error("Error creating routine:", error);
    return NextResponse.json({ error: "Failed to create routine" }, { status: 500 });
  }
}
