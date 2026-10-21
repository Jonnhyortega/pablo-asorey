export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import { Users } from "lucide-react";
import { Badge, Card, PageHeader, Table } from "@/components/ui";

export default async function SubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow={`${subscribers.length} total`} title="Suscriptores" />

      {subscribers.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <Users className="h-8 w-8 text-muted" strokeWidth={1.25} />
          <p className="text-sm text-muted">Nadie se ha suscrito a tu newsletter por el momento.</p>
        </Card>
      ) : (
        <Table stackOnMobile>
          <Table.Head>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Correo Electrónico</Table.HeadCell>
            <Table.HeadCell className="text-right">Fecha de Suscripción</Table.HeadCell>
          </Table.Head>
          <tbody>
            {subscribers.map((sub) => (
              <Table.Row key={sub.id}>
                <Table.Cell label="Status">
                  {sub.active ? <Badge tone="success">Activo</Badge> : <Badge tone="danger">Inactivo</Badge>}
                </Table.Cell>
                <Table.Cell label="Correo Electrónico" className="font-medium">
                  <span className="block max-w-[16rem] truncate md:max-w-none">{sub.email}</span>
                </Table.Cell>
                <Table.Cell label="Fecha de Suscripción" className="text-right text-muted">
                  {sub.createdAt.toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </Table.Cell>
              </Table.Row>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
