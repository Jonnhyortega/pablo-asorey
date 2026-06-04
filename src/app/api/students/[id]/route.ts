import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      email,
      whatsapp,
      trainingDays,
      sessionDuration,
      birthDate,
      height,
      weight,
      sportsExperience,
      injuries,
      lastTraining,
      goals,
      gym,
      photos,
      paymentStatus,
      paymentDate
    } = body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        name,
        email,
        whatsapp,
        trainingDays,
        sessionDuration,
        birthDate: birthDate ? new Date(birthDate) : null,
        height: Number(height),
        weight: Number(weight),
        sportsExperience,
        injuries,
        lastTraining,
        goals,
        gym,
        photos: typeof photos === "string" ? photos : JSON.stringify(photos || []),
        paymentStatus,
        paymentDate: paymentDate ? new Date(paymentDate) : null
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.student.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
