"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import { Save, AlertCircle } from "lucide-react";
import { Button, Card, Input, PageHeader, Textarea } from "@/components/ui";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    phone: siteConfig.contact.phoneLink,
    email: siteConfig.contact.email,
    instagram: siteConfig.social.instagram,
    youtube: siteConfig.social.youtube,
    tagline: siteConfig.tagline,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Connect with API to save
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Sitio web" title="Configuración Web" />

      <Card className="mb-6 flex gap-3 border-gold-line">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
        <p className="text-sm text-muted">
          <strong className="font-medium text-text">Panel en construcción de demostración.</strong> Aquí el administrador podrá cambiar sus datos sociales y textos clave del sitio web sin necesidad de tocar código.
        </p>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-5">
            <h3 className="border-b border-line pb-3 font-display text-xl uppercase text-text">Datos de Contacto</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input label="WhatsApp (Sin '+', código de país primero)" type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Input label="Email Oficial" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <Input label="Enlace a Instagram" type="url" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
              <Input label="Enlace a YouTube" type="url" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} />
            </div>
          </section>

          <section className="space-y-5">
            <h3 className="border-b border-line pb-3 font-display text-xl uppercase text-text">Textos Clave</h3>
            <Textarea
              label="Eslogan / Tagline SEO (Aparece en las tarjetas al compartir url)"
              rows={3}
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="resize-none"
            />
          </section>

          <div className="flex flex-col items-end gap-3 border-t border-line pt-6">
            <Button type="submit" variant="primary" loading={saving}>
              {saving ? "Guardando..." : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
            {saved && <p className="text-sm text-success">¡Cambios guardados exitosamente! (Demo)</p>}
          </div>
        </form>
      </Card>
    </div>
  );
}
