import prisma from "@/lib/prisma";

const ACTIVE_WINDOW_DAYS = 14;

export type AdminMetrics = {
  activeStudents: number;
  totalStudents: number;
  pendingPayments: number;
  messages: number;
  subscribers: number;
};

export async function getAdminMetrics(now: Date = new Date()): Promise<AdminMetrics> {
  const activeSince = new Date(now.getTime() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const [activeStudents, totalStudents, pendingPayments, messages, subscribers] = await Promise.all([
    prisma.student.count({ where: { lastActivityDate: { gte: activeSince } } }),
    prisma.student.count(),
    // Misma regla que la lista de alumnos: sin fecha de pago (Pendiente) o vencida (Deuda), excepto en verificación
    prisma.student.count({
      where: {
        paymentStatus: { not: "VERIFYING" },
        OR: [{ paymentDate: null }, { paymentDate: { lt: startOfToday } }],
      },
    }),
    prisma.contactMessage.count(),
    prisma.newsletterSubscriber.count(),
  ]);

  return { activeStudents, totalStudents, pendingPayments, messages, subscribers };
}
