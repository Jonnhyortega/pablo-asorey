import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const notification = await prisma.adminNotification.findUnique({
      where: { id }
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Si es notificación de pago y tiene studentId asociado
    if (notification.type === "PAYMENT_REQUEST" && notification.studentId) {
      const student = await prisma.student.findUnique({ where: { id: notification.studentId } });
      
      if (student) {
        // Logica para sumar 1 mes o setear a hoy + 30 dias si no tenia fecha valida
        const now = new Date();
        let newPaymentDate = new Date();
        
        if (student.paymentDate && student.paymentDate > now) {
          // Si estaba pago por adelantado o al dia
          newPaymentDate = new Date(student.paymentDate);
          newPaymentDate.setMonth(newPaymentDate.getMonth() + 1);
        } else {
          // Si estaba vencido, cuenta 1 mes desde hoy
          newPaymentDate.setMonth(newPaymentDate.getMonth() + 1);
        }

        // Actualizamos al estudiante
        await prisma.student.update({
          where: { id: student.id },
          data: {
            paymentStatus: "UP_TO_DATE",
            paymentDate: newPaymentDate
          }
        });

        // Notificar al estudiante que su pago fue confirmado
        await prisma.studentNotification.create({
          data: {
            type: "PAYMENT_CONFIRMED",
            title: "Pago Confirmado",
            message: "Tu pago mensual ha sido verificado por el administrador. ¡Gracias!",
            studentId: student.id
          }
        });
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
