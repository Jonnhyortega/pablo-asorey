"use client";

import { useState } from "react";
import { Badge, Button, Card, Dialog, Input, PageHeader, SectionLabel, Select, StatTile, Table, Textarea } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";

const rows = [
  { name: "Lucía Fernández", plan: "Plan 1", status: "gold" as const, label: "Pendiente" },
  { name: "Maximiliano Alejandro González Rodríguez", plan: "Plan 3", status: "success" as const, label: "Al día" },
  { name: "Sofía Ruiz", plan: "Presencial", status: "danger" as const, label: "Vencido" },
];

export default function UiKit() {
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);

  return (
    <div data-panel className="min-h-screen px-4 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-12">
        <PageHeader eyebrow="Desarrollo" title="UI kit" actions={<ThemeToggle />} />

        <section className="space-y-4">
          <SectionLabel>Botones</SectionLabel>
          {(["primary", "secondary", "ghost", "danger"] as const).map((v) => (
            <div key={v} className="flex flex-wrap items-center gap-3">
              <Button variant={v} size="sm">{v} sm</Button>
              <Button variant={v}>{v} md</Button>
              <Button variant={v} size="lg">{v} lg</Button>
              <Button variant={v} loading>Cargando</Button>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <SectionLabel>Métricas</SectionLabel>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile label="Alumnos activos" value={32} suffix="/ 48" />
            <StatTile label="Pagos pendientes" value={5} tone="gold" />
            <StatTile label="Racha actual" value={12} suffix="días" progress={0.7} />
            <StatTile label="Nivel" value={7} suffix="2.340 XP" progress={0.4} />
          </div>
        </section>

        <section className="space-y-4">
          <SectionLabel>Badges</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="gold">Nuevo</Badge>
            <Badge tone="success">Al día</Badge>
            <Badge tone="danger">Vencido</Badge>
          </div>
        </section>

        <section className="space-y-4">
          <SectionLabel>Formularios</SectionLabel>
          <Card className="grid gap-4 md:grid-cols-2">
            <Input label="Nombre" placeholder="Juan Pérez" />
            <Input label="Email" placeholder="nombre@mail.com" error="Ingresá un email válido." />
            <Select label="Plan">
              <option>Plan 1</option>
              <option>Plan 2</option>
            </Select>
            <Textarea label="Mensaje" placeholder="Contanos tu objetivo" />
          </Card>
        </section>

        <section className="space-y-4">
          <SectionLabel>Tabla</SectionLabel>
          <Table stackOnMobile>
            <Table.Head>
              <Table.HeadCell>Alumno</Table.HeadCell>
              <Table.HeadCell>Plan</Table.HeadCell>
              <Table.HeadCell>Estado</Table.HeadCell>
            </Table.Head>
            <tbody>
              {rows.map((r) => (
                <Table.Row key={r.name}>
                  <Table.Cell label="Alumno">
                    <span className="block truncate max-w-[16rem] md:max-w-xs">{r.name}</span>
                  </Table.Cell>
                  <Table.Cell label="Plan" className="text-muted">{r.plan}</Table.Cell>
                  <Table.Cell label="Estado"><Badge tone={r.status}>{r.label}</Badge></Table.Cell>
                </Table.Row>
              ))}
            </tbody>
          </Table>
        </section>

        <section className="space-y-4">
          <SectionLabel>Diálogos</SectionLabel>
          <div className="flex gap-3">
            <Button onClick={() => setModal(true)}>Abrir modal</Button>
            <Button onClick={() => setSheet(true)}>Abrir sheet</Button>
          </div>
        </section>
      </div>

      <Dialog
        open={modal}
        onClose={() => setModal(false)}
        title="¿Eliminar alumno?"
        description="Esta acción no se puede deshacer."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
            <Button variant="danger" onClick={() => setModal(false)}>Eliminar</Button>
          </>
        }
      >
        <Input label="Escribí el nombre para confirmar" />
      </Dialog>

      <Dialog open={sheet} onClose={() => setSheet(false)} title="Configuración" variant="sheet" footer={<Button variant="primary" onClick={() => setSheet(false)}>Guardar</Button>}>
        <div className="space-y-4">
          <Input label="Peso (kg)" inputMode="decimal" />
          <Textarea label="Objetivos" />
        </div>
      </Dialog>
    </div>
  );
}
