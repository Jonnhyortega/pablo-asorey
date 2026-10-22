"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, Info } from "lucide-react";
import { Button, Card, Input, PageHeader, Textarea } from "@/components/ui";
import { defaultSiteSettings, type SiteSettingsErrors, type SiteSettingsValues } from "@/lib/site-settings";

export default function SettingsPage() {
  const [formData, setFormData] = useState<SiteSettingsValues>(defaultSiteSettings);
  const [errors, setErrors] = useState<SiteSettingsErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: SiteSettingsValues) => setFormData(data))
      .catch(() => toast.error("No se pudo cargar la configuración"))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof SiteSettingsValues, value: string) => {
    setFormData({ ...formData, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.fields ?? {});
        toast.error(data.error ?? "No se pudo guardar");
        return;
      }
      setFormData(data);
      setErrors({});
      toast.success("Cambios guardados y publicados en la web");
    } catch {
      toast.error("Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Sitio web" title="Configuración Web" />

      <Card className="mb-6 flex gap-3 border-gold-line">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
        <p className="text-sm text-muted">
          Estos datos se muestran en la página pública: botones de WhatsApp, contacto, footer y redes. Al guardar, la web se actualiza al instante.
        </p>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          <fieldset disabled={loading} className="space-y-8">
            <section className="space-y-5">
              <h3 className="border-b border-line pb-3 font-display text-xl uppercase text-text">Datos de Contacto</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input label="WhatsApp (con código de país, ej: +54 9 11 2395-7479)" type="tel" value={formData.whatsapp} error={errors.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
                <Input label="Email Oficial" type="email" value={formData.email} error={errors.email} onChange={(e) => update("email", e.target.value)} />
                <Input label="Enlace a Instagram" type="url" value={formData.instagram} error={errors.instagram} onChange={(e) => update("instagram", e.target.value)} />
                <Input label="Enlace a YouTube" type="url" value={formData.youtube} error={errors.youtube} onChange={(e) => update("youtube", e.target.value)} />
              </div>
            </section>

            <section className="space-y-5">
              <h3 className="border-b border-line pb-3 font-display text-xl uppercase text-text">Textos Clave</h3>
              <Textarea
                label="Eslogan / Tagline SEO (Aparece en el footer y en las tarjetas al compartir url)"
                rows={3}
                value={formData.tagline}
                error={errors.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="resize-none"
              />
            </section>
          </fieldset>

          <div className="flex flex-col items-end gap-3 border-t border-line pt-6">
            <Button type="submit" variant="primary" loading={saving} disabled={loading}>
              {saving ? "Guardando..." : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
