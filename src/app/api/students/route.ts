import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
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
      photos
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Generar contraseña aleatoria (6 dígitos numéricos)
    const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // 2. Crear el usuario (verificar si ya existe)
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "STUDENT"
        }
      });
    } else {
      // Si el usuario ya existía (ej. falló un registro a la mitad), le actualizamos la contraseña para que coincida
      user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
    }

    // 3. Crear el estudiante vinculado
    const student = await prisma.student.create({
      data: {
        userId: user.id,
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
        photos: JSON.stringify(photos || []),
        generatedPassword // Para que el profe lo vea y se lo pase
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
