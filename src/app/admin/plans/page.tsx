"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Archive, ArchiveRestore, Edit2, EyeOff, Loader2, Plus, Tag, Trash2, Users, X } from "lucide-react";
import { Badge, Button, Dialog, Input, PageHeader, Select } from "@/components/ui";
import { PLAN_ICONS, formatPlanPrice, type PlanErrors, type PlanRecord, type PlanValues } from "@/lib/plans";

const emptyPlan: PlanValues = {
  name: "",
  price: 0,
  icon: "dumbbell",
  features: [{ text: "", icon: "check" }],
  highlight: false,
  showOnLanding: true,
  active: true,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<PlanRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PlanValues>(emptyPlan);
  const [errors, setErrors] = useState<PlanErrors>({});
  const [saving, setSaving] = useState(false);

  const [planToDelete, setPlanToDelete] = useState<PlanRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (Array.isArray(data)) setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openModal = (plan?: PlanRecord) => {
    setErrors({});
    setEditing(plan ?? null);
    setFormData(
      plan
        ? {
            name: plan.name,
            price: plan.price,
            icon: plan.icon,
            features: plan.features.length ? plan.features : [{ text: "", icon: "check" }],
            highlight: plan.highlight,
            showOnLanding: plan.showOnLanding,
            active: plan.active,
          }
        : emptyPlan,
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditing(null);
  };

  const savePlan = async (values: PlanValues, plan: PlanRecord | null, successMessage: string) => {
    const res = await fetch(plan ? `/api/plans/${plan.id}` : "/api/plans", {
      method: plan ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setErrors(data?.fields ?? {});
      toast.error(data?.error ?? "No se pudo guardar el plan");
      return false;
    }
    toast.success(successMessage);
    await fetchPlans();
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await savePlan(formData, editing, editing ? "Plan actualizado" : "Plan creado");
      if (ok) {
        setIsModalOpen(false);
        setEditing(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleArchived = async (plan: PlanRecord) => {
    const values: PlanValues = {
      name: plan.name,
      price: plan.price,
      icon: plan.icon,
      features: plan.features,
      highlight: plan.highlight,
      showOnLanding: plan.showOnLanding,
      active: !plan.active,
    };
    await savePlan(values, plan, plan.active ? "Plan archivado" : "Plan reactivado");
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/plans/${planToDelete.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "No se pudo borrar el plan");
        return;
      }
      toast.success("Plan eliminado");
      setPlanToDelete(null);
      await fetchPlans();
    } finally {
      setDeleting(false);
    }
  };

  const updateFeature = (index: number, patch: Partial<PlanValues["features"][number]>) => {
    setFormData({
      ...formData,
      features: formData.features.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Mensualidades y servicios"
        title="Planes"
        actions={
          <Button variant="primary" onClick={() => openModal()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nuevo Plan
          </Button>
        }
      />

      <p className="mb-6 max-w-3xl text-sm text-muted">
        Cada plan tiene su precio mensual. Los planes visibles se muestran en la sección de planes de tu web, y el precio del plan asignado a cada alumno es el monto que él ve para pagar su cuota.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-panel border border-line bg-surface py-20 text-center">
          <Tag className="mx-auto mb-4 h-16 w-16 text-muted" />
          <h3 className="text-lg font-medium text-text">No hay planes</h3>
          <p className="mt-1 text-muted">Creá tu primer plan con su precio mensual.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const students = plan._count?.students ?? 0;
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-panel border bg-surface p-5 transition-colors ${plan.active ? "border-line" : "border-dashed border-line opacity-70"}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {plan.highlight && <Badge tone="gold">Destacado</Badge>}
                  {!plan.showOnLanding && plan.active && <Badge><EyeOff className="h-3 w-3" /> Oculto en la web</Badge>}
                  {!plan.active && <Badge>Archivado</Badge>}
                </div>
                <h3 className="mt-3 text-sm font-medium uppercase tracking-[0.12em] text-text">{plan.name}</h3>
                <p className="mt-2 font-display text-4xl leading-none tabular-nums text-text">
                  {formatPlanPrice(plan.price)}
                  <span className="ml-2 font-sans text-xs uppercase tracking-[0.2em] text-muted">/ mes</span>
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                  <Users className="h-4 w-4" strokeWidth={1.5} />
                  {students} alumno{students === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-sm text-muted">{plan.features.length} beneficio{plan.features.length === 1 ? "" : "s"}</p>

                <div className="mt-5 flex gap-2 border-t border-line pt-4">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => openModal(plan)}>
                    <Edit2 className="h-4 w-4" /> Editar
                  </Button>
                  <button
                    onClick={() => toggleArchived(plan)}
                    title={plan.active ? "Archivar plan" : "Reactivar plan"}
                    aria-label={plan.active ? "Archivar plan" : "Reactivar plan"}
                    className="flex h-9 w-9 items-center justify-center rounded-panel border border-line text-muted transition-colors hover:border-gold hover:text-gold"
                  >
                    {plan.active ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setPlanToDelete(plan)}
                    title="Eliminar plan"
                    aria-label="Eliminar plan"
                    className="flex h-9 w-9 items-center justify-center rounded-panel border border-line text-muted transition-colors hover:border-danger hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Crear / editar */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        title={editing ? "Editar Plan" : "Nuevo Plan"}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" form="plan-form" variant="primary" loading={saving}>Guardar</Button>
          </>
        }
      >
        <form id="plan-form" onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre del plan *"
            required
            value={formData.name}
            error={errors.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej. Plan 1 - Online Total"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Precio mensual en pesos *"
              type="number"
              min={0}
              step={1}
              required
              value={formData.price ? String(formData.price) : ""}
              error={errors.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              placeholder="Ej. 45000"
            />
            <Select label="Ícono" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })}>
              {PLAN_ICONS.map((icon) => (
                <option key={icon.value} value={icon.value}>{icon.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Beneficios (se muestran en la web)</p>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  aria-label={`Ícono del beneficio ${index + 1}`}
                  className="w-32 shrink-0"
                  value={feature.icon}
                  onChange={(e) => updateFeature(index, { icon: e.target.value })}
                >
                  {PLAN_ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </Select>
                <Input
                  aria-label={`Beneficio ${index + 1}`}
                  value={feature.text}
                  onChange={(e) => updateFeature(index, { text: e.target.value })}
                  placeholder="Ej. Plan nutricional"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })}
                  aria-label={`Quitar beneficio ${index + 1}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-panel border border-line text-muted transition-colors hover:border-danger hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {errors.features && <p className="text-xs text-danger">{errors.features}</p>}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setFormData({ ...formData, features: [...formData.features, { text: "", icon: "check" }] })}
            >
              <Plus className="h-4 w-4" /> Agregar beneficio
            </Button>
          </div>

          <div className="space-y-3 rounded-panel border border-line bg-surface-2 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--gold)]"
                checked={formData.showOnLanding}
                onChange={(e) => setFormData({ ...formData, showOnLanding: e.target.checked })}
              />
              <span className="text-sm">
                <span className="font-medium text-text">Mostrar en la web</span>
                <span className="block text-muted">Desactivalo para planes internos, por ejemplo un precio especial que no querés publicar.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--gold)]"
                checked={formData.highlight}
                onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
              />
              <span className="text-sm">
                <span className="font-medium text-text">Destacar como recomendado</span>
                <span className="block text-muted">Se muestra resaltado en dorado en la web.</span>
              </span>
            </label>
          </div>
        </form>
      </Dialog>

      {/* Eliminar */}
      <Dialog
        open={!!planToDelete}
        onClose={() => !deleting && setPlanToDelete(null)}
        title="¿Eliminar plan?"
        footer={
          <>
            <Button variant="ghost" disabled={deleting} onClick={() => setPlanToDelete(null)}>Cancelar</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              {!deleting && <Trash2 className="h-4 w-4" />}
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Vas a eliminar <strong className="text-text">{planToDelete?.name}</strong>. Solo se pueden borrar planes sin alumnos asignados; si tiene alumnos, archivalo: deja de mostrarse y de ofrecerse, pero sus alumnos lo conservan.
        </p>
      </Dialog>
    </div>
  );
}
