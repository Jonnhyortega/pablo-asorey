export const dynamic = 'force-dynamic';

import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { getAdminMetrics } from "@/lib/admin-metrics";
import { Badge, Card, PageHeader, StatTile } from "@/components/ui";
import { cn } from "@/lib/cn";

export default async function AdminDashboard() {
  const [metrics, recentMessages] = await Promise.all([
    getAdminMetrics(),
    prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader eyebrow={today} title="Buen día, Pablo" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Alumnos activos" value={metrics.activeStudents} suffix={`/ ${metrics.totalStudents}`} />
        <StatTile label="Pagos pendientes" value={metrics.pendingPayments} tone={metrics.pendingPayments > 0 ? "gold" : "default"} />
        <StatTile label="Mensajes (Leads)" value={metrics.messages} />
        <StatTile label="Suscriptores" value={metrics.subscribers} />
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4 md:px-6">
          <h2 className="font-display text-xl uppercase text-text">Últimos Mensajes</h2>
          <Link href="/admin/leads" className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-gold transition-colors hover:text-text">
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentMessages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <Inbox className="h-8 w-8 text-muted" strokeWidth={1.25} />
            <p className="text-sm text-muted">Aún no tienes mensajes nuevos en tu bandeja de entrada.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {recentMessages.map((msg) => (
              <li
                key={msg.id}
                className={cn("flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center md:px-6", !msg.read && "bg-gold/[0.03]")}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="truncate font-medium text-text">{msg.name}</span>
                    {!msg.read && <Badge tone="gold">Nuevo</Badge>}
                  </div>
                  <p className="truncate text-sm text-muted">{msg.message}</p>
                </div>
                <div className="flex shrink-0 flex-col sm:items-end">
                  <span className="text-xs text-muted">
                    {msg.createdAt.toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <a href={`mailto:${msg.email}`} className="mt-1 max-w-[16rem] truncate text-sm text-text underline decoration-line underline-offset-4 hover:decoration-gold">
                    {msg.email}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
