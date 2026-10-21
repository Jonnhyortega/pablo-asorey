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

  const [activeStudents, totalStudents, pendingPayments, messages, subscribers] = await Promise.all([
    prisma.student.count({ where: { lastActivityDate: { gte: activeSince } } }),
    prisma.student.count(),
    prisma.student.count({ where: { paymentStatus: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.contactMessage.count(),
    prisma.newsletterSubscriber.count(),
  ]);

  return { activeStudents, totalStudents, pendingPayments, messages, subscribers };
}
