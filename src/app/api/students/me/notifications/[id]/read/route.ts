import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secreto-cambiar-en-produccion'
);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
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

    const notification = await prisma.studentNotification.findUnique({
      where: { id }
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (notification.studentId !== student.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedNotification = await prisma.studentNotification.update({
      where: { id },
      data: { read: true }
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error reading notification:", error);
    return NextResponse.json({ error: "Failed to read notification" }, { status: 500 });
  }
}
