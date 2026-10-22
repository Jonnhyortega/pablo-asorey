import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { guardPublicForm } from "@/lib/form-guard";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Formulario público "Aplicar": a un bot detectado se le responde como si se hubiera creado.
    const blocked = await guardPublicForm(request, body, "aplicar", () =>
      NextResponse.json({ id: "ok" }, { status: 201 })
    );
    if (blocked) return blocked;

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

    // El login busca el email en minúsculas, así que lo guardamos igual
    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Generar contraseña aleatoria (6 dígitos numéricos)
    const generatedPassword = randomInt(100000, 1000000).toString();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // 2. Crear el usuario (verificar si ya existe)
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { student: true }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name,
          role: "STUDENT"
        },
        include: { student: true }
      });
    } else if (user.role === "STUDENT" && !user.student) {
      // Registro que falló a la mitad: le actualizamos la contraseña para que coincida
      user = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
        include: { student: true }
      });
    } else {
      // Nunca pisar la contraseña de una cuenta existente (incluida la del admin)
      return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
    }

    // 3. Crear el estudiante vinculado
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        name,
        email: normalizedEmail,
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

    // Formulario público: no devolver la contraseña ni los datos cargados
    return NextResponse.json({ id: student.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      include: { plan: { select: { id: true, name: true, price: true } } }
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
