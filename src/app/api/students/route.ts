import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      trainingDays,
      sessionDuration,
      age,
      height,
      weight,
      sportsExperience,
      injuries,
      lastTraining,
      goals,
      gym,
      photos
    } = body;

    const student = await prisma.student.create({
      data: {
        name,
        email,
        trainingDays,
        sessionDuration,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        sportsExperience,
        injuries,
        lastTraining,
        goals,
        gym,
        photos: JSON.stringify(photos || [])
      }
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
