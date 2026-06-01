import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secreto-cambiar-en-produccion'
);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        routines: {
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
        }
      }
    });

    if (!student) {
      // DEBUG LOG
      const allStudents = await prisma.student.findMany();
      return NextResponse.json({ error: "Estudiante no encontrado", userId_from_token: userId, all_students: allStudents.map(s => s.userId) }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error: any) {
    console.error("Error fetching me:", error);
    return NextResponse.json({ error: "Error interno", details: error.message }, { status: 500 });
  }
}
