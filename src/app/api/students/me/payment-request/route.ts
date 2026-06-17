import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secreto-cambiar-en-produccion'
);

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    if (!payload || payload.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = await prisma.student.findUnique({
      where: { userId: payload.id as string }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Cambiar estado a VERIFYING
    await prisma.student.update({
      where: { id: student.id },
      data: { paymentStatus: "VERIFYING" }
    });

    // Crear notificación para el Admin
    await prisma.adminNotification.create({
      data: {
        type: "PAYMENT_REQUEST",
        title: "Pago Reportado",
        message: `El alumno ${student.name} ha reportado que realizó el pago de su cuota.`,
        studentId: student.id
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error creating payment request:", error);
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 });
  }
}
