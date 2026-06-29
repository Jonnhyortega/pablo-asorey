import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secreto-cambiar-en-produccion'
);

export async function GET(request: Request) {
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

    const notifications = await prisma.studentNotification.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching student notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
