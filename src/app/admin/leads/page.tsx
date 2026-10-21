export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import { Inbox } from "lucide-react";
import { Badge, Card, PageHeader, Table } from "@/components/ui";

export default async function LeadsPage() {
  const leads = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow={`${leads.length} total`} title="Mensajes y Leads" />

      {leads.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <Inbox className="h-8 w-8 text-muted" strokeWidth={1.25} />
          <p className="text-sm text-muted">No tienes mensajes en la bandeja de entrada.</p>
        </Card>
      ) : (
        <Table stackOnMobile>
          <Table.Head>
            <Table.HeadCell>Fecha</Table.HeadCell>
            <Table.HeadCell>Nombre / Lead</Table.HeadCell>
            <Table.HeadCell>Contacto</Table.HeadCell>
            <Table.HeadCell>Mensaje Original</Table.HeadCell>
            <Table.HeadCell className="text-center">Estado</Table.HeadCell>
          </Table.Head>
          <tbody>
            {leads.map((lead) => (
              <Table.Row key={lead.id}>
                <Table.Cell label="Fecha" className="whitespace-nowrap text-muted">
                  {lead.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  <span className="block text-xs text-muted/70">{lead.createdAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                </Table.Cell>
                <Table.Cell label="Nombre / Lead" className="font-medium">
                  <span className="block max-w-[14rem] truncate">{lead.name}</span>
                </Table.Cell>
                <Table.Cell label="Contacto">
                  <a href={`mailto:${lead.email}`} className="block max-w-[14rem] truncate underline decoration-line underline-offset-4 hover:decoration-gold">
                    {lead.email}
                  </a>
                </Table.Cell>
                <Table.Cell label="Mensaje Original" className="text-muted">
                  <span className="block max-w-[18rem] truncate" title={lead.message}>{lead.message}</span>
                </Table.Cell>
                <Table.Cell label="Estado" className="md:text-center">
                  {!lead.read ? <Badge tone="gold">Nuevo</Badge> : <Badge>Leído</Badge>}
                </Table.Cell>
              </Table.Row>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
