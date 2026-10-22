import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getPaymentSettings, isPaymentLocked } from "@/lib/payments";
import { formatPlanPrice } from "@/lib/plans";


export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        routines: {
          include: {
            days: {
              include: {
                exercises: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        badges: true,
        plan: { select: { name: true, price: true } }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    const settings = await getPaymentSettings();
    const locked = isPaymentLocked(student, settings);
    // Con bloqueo por deuda no se envían los días pendientes: el historial sigue visible.
    const routines = locked
      ? student.routines.map((routine) => ({
          ...routine,
          days: routine.days.filter((day) => day.completedAt || day.isSkipped),
        }))
      : student.routines;

    return NextResponse.json({
      ...student,
      routines,
      payment: {
        alias: settings.paymentAlias,
        amount: student.plan ? formatPlanPrice(student.plan.price) : "",
        planName: student.plan?.name ?? "",
        locked,
      },
    });
  } catch (error: any) {
    console.error("Error fetching me:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.id as string;

    const body = await request.json();
    const { weight, goals, profilePicture, birthDate, selectedBadge } = body;

    const dataToUpdate: any = {};
    if (weight !== undefined) dataToUpdate.weight = Number(weight);
    if (goals !== undefined) dataToUpdate.goals = goals;
    if (profilePicture !== undefined) dataToUpdate.profilePicture = profilePicture;
    if (birthDate !== undefined) dataToUpdate.birthDate = birthDate;
    if (selectedBadge !== undefined) dataToUpdate.selectedBadge = selectedBadge;

    const student = await prisma.student.update({
      where: { userId },
      data: dataToUpdate
    });

    return NextResponse.json(student);
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
