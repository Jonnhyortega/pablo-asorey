import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { approvePayment, rejectPayment } from "@/lib/payments";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;

    const notification = await prisma.adminNotification.findUnique({
      where: { id }
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Los avisos de pago se aceptan o rechazan; el resto solo se marca como leído.
    if (notification.type === "PAYMENT_REQUEST" && notification.studentId) {
      const body = await request.json().catch(() => null);
      const action = body?.action;
      if (action !== "approve" && action !== "reject") {
        return NextResponse.json({ error: "Indicá si aceptás o rechazás el pago" }, { status: 400 });
      }

      const result = action === "approve"
        ? await approvePayment(notification.studentId)
        : await rejectPayment(notification.studentId);
      if (!result.ok) {
        // Ya resuelto por otro lado: cerramos el aviso igual para que no quede colgado.
        await prisma.adminNotification.update({ where: { id }, data: { read: true } });
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
    }

    // Finalmente marcamos la notificación como leída
    const updatedNotification = await prisma.adminNotification.update({
      where: { id },
      data: { read: true }
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error resolving notification:", error);
    return NextResponse.json({ error: "Failed to resolve notification" }, { status: 500 });
  }
}
