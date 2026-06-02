"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import { Save, AlertCircle } from "lucide-react";

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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Configuración Web
        </h2>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-r-md">
        <div className="flex gap-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-500 mt-0.5" size={20} />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Panel en construcción de demostración.</strong> Aquí el administrador podrá cambiar sus datos sociales y textos clave del sitio web sin necesidad de tocar código. 
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-4 sm:p-8 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-slate-700 pb-2 mb-4">Datos de Contacto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">WhatsApp (Sin '+', código de país primero)</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#dda124] focus:border-[#dda124] text-gray-900 dark:text-gray-100 transition-all outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email Oficial</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#dda124] focus:border-[#dda124] text-gray-900 dark:text-gray-100 transition-all outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Enlace a Instagram</label>
              <input 
                type="url" 
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#dda124] focus:border-[#dda124] text-gray-900 dark:text-gray-100 transition-all outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Enlace a YouTube</label>
              <input 
                type="url" 
                value={formData.youtube}
                onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#dda124] focus:border-[#dda124] text-gray-900 dark:text-gray-100 transition-all outline-none" 
              />
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 mt-8">Textos Clave</h3>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Eslogan / Tagline SEO (Aparece en las tarjetas al compartir url)</label>
            <textarea 
              rows={3}
              value={formData.tagline}
              onChange={(e) => setFormData({...formData, tagline: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#dda124] focus:border-[#dda124] text-gray-900 dark:text-gray-100 transition-all outline-none resize-none" 
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 bg-[#2d0b3f] hover:bg-[#dda124] text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              {saving ? (
                <span className="animate-pulse">Guardando...</span>
              ) : (
                <>
                  <Save size={20} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
          {saved && (
            <div className="text-right text-green-600 font-bold text-sm">
              ¡Cambios guardados exitosamente! (Demo)
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
