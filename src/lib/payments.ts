import prisma from "@/lib/prisma";
import { defaultPaymentSettings, type PaymentSettingsValues } from "@/lib/site-settings";

// Flujo de "Ya pagué": el alumno informa (VERIFYING), puede cancelarlo,
// y el profe lo acepta (renueva un mes) o lo rechaza (vuelve al estado anterior).
// Cada transición solo aplica si el alumno sigue en VERIFYING, así un doble
// clic o dos pestañas no renuevan dos meses.

export type PaymentResult = { ok: true } | { ok: false; status: number; error: string };

const VERIFYING = "VERIFYING";

// Al salir de VERIFYING sin aprobar, el estado depende de si tiene fecha cargada
// (la UI calcula "Deuda" / "Al Día" a partir de paymentDate).
function statusWithoutApproval(paymentDate: Date | null) {
  return paymentDate ? "UP_TO_DATE" : "PENDING";
}

function nextPaymentDate(current: Date | null): Date {
  const now = new Date();
  // Si estaba al día suma un mes a su vencimiento; si estaba vencido, un mes desde hoy.
  const next = current && current > now ? new Date(current) : now;
  next.setMonth(next.getMonth() + 1);
  return next;
}

async function closePaymentRequests(studentId: string) {
  await prisma.adminNotification.updateMany({
    where: { studentId, type: "PAYMENT_REQUEST", read: false },
    data: { read: true },
  });
}

const notVerifying: PaymentResult = {
  ok: false,
  status: 409,
  error: "Este pago ya fue resuelto o el alumno canceló el aviso",
};

export async function reportPayment(studentId: string): Promise<PaymentResult> {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return { ok: false, status: 404, error: "Alumno no encontrado" };

  const { count } = await prisma.student.updateMany({
    where: { id: studentId, paymentStatus: { not: VERIFYING } },
    data: { paymentStatus: VERIFYING },
  });
  if (count === 0) return { ok: false, status: 409, error: "Ya informaste tu pago" };

  await prisma.adminNotification.create({
    data: {
      type: "PAYMENT_REQUEST",
      title: "Pago Reportado",
      message: `El alumno ${student.name} ha reportado que realizó el pago de su cuota.`,
      studentId,
    },
  });
  return { ok: true };
}

export async function cancelPaymentReport(studentId: string): Promise<PaymentResult> {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return { ok: false, status: 404, error: "Alumno no encontrado" };

  const { count } = await prisma.student.updateMany({
    where: { id: studentId, paymentStatus: VERIFYING },
    data: { paymentStatus: statusWithoutApproval(student.paymentDate) },
  });
  if (count === 0) return { ok: false, status: 409, error: "El profe ya revisó tu pago" };

  // El aviso nunca existió para el profe: se borra en lugar de marcarse leído.
  await prisma.adminNotification.deleteMany({
    where: { studentId, type: "PAYMENT_REQUEST", read: false },
  });
  return { ok: true };
}

export async function approvePayment(studentId: string): Promise<PaymentResult> {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return { ok: false, status: 404, error: "Alumno no encontrado" };

  const { count } = await prisma.student.updateMany({
    where: { id: studentId, paymentStatus: VERIFYING },
    data: { paymentStatus: "UP_TO_DATE", paymentDate: nextPaymentDate(student.paymentDate) },
  });
  if (count === 0) return notVerifying;

  await prisma.studentNotification.create({
    data: {
      type: "PAYMENT_CONFIRMED",
      title: "Pago Confirmado",
      message: "Tu pago mensual ha sido verificado por el administrador. ¡Gracias!",
      studentId,
    },
  });
  await closePaymentRequests(studentId);
  return { ok: true };
}

export async function rejectPayment(studentId: string): Promise<PaymentResult> {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return { ok: false, status: 404, error: "Alumno no encontrado" };

  const { count } = await prisma.student.updateMany({
    where: { id: studentId, paymentStatus: VERIFYING },
    data: { paymentStatus: statusWithoutApproval(student.paymentDate) },
  });
  if (count === 0) return notVerifying;

  await prisma.studentNotification.create({
    data: {
      type: "PAYMENT_REJECTED",
      title: "Pago no confirmado",
      message: "Tu profe no pudo confirmar tu pago. Si ya pagaste, escribile para revisarlo.",
      studentId,
    },
  });
  await closePaymentRequests(studentId);
  return { ok: true };
}

export async function getPaymentSettings(): Promise<PaymentSettingsValues> {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!row) return defaultPaymentSettings;
  return {
    paymentAlias: row.paymentAlias?.trim() ?? "",
    debtLockEnabled: row.debtLockEnabled,
    debtLockDays: row.debtLockDays,
  };
}

// Bloqueo por deuda: solo si el admin lo activó, el alumno tiene vencimiento
// cargado, pasaron más de debtLockDays días desde que venció y no informó el pago
// (mientras está en verificación se le da el beneficio de la duda).
export function isPaymentLocked(
  student: { paymentStatus: string; paymentDate: Date | null },
  settings: PaymentSettingsValues,
  now = new Date(),
): boolean {
  if (!settings.debtLockEnabled || !student.paymentDate || student.paymentStatus === VERIFYING) return false;
  const lockFrom = new Date(student.paymentDate);
  lockFrom.setHours(23, 59, 59, 999);
  lockFrom.setDate(lockFrom.getDate() + settings.debtLockDays);
  return now > lockFrom;
}
