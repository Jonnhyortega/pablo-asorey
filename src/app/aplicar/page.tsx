"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle, Loader2, Camera, Dumbbell, Clock, Activity, Target, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button, Input, Select, Textarea, Wordmark } from "@/components/ui";
import { cn } from "@/lib/cn";

export default function StudentForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    trainingDays: "",
    sessionDuration: "",
    birthDate: "",
    height: "",
    weight: "",
    sportsExperience: "",
    injuries: "",
    lastTraining: "",
    gym: "",
  });

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [specificGoal, setSpecificGoal] = useState("");

  const GOAL_OPTIONS = [
    "Pérdida de grasa / Bajar de peso",
    "Ganancia de masa muscular (Hipertrofia)",
    "Ganancia de fuerza máxima",
    "Tonificación / Recomposición corporal",
    "Mantener estilo de vida saludable",
    "Acondicionamiento físico / Mejorar estado general",
    "Recuperación de lesiones / Rehabilitación",
    "Rendimiento deportivo",
    "Preparación para carreras / Resistencia",
    "Objetivo Específico / Otro"
  ];

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"; // Usually a default preset if not configured

    if (!CLOUD_NAME) {
      setError("Por favor, configura tu NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en el archivo .env.local para subir fotos.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error(err);
      setError("Hubo un error al subir las imágenes. Revisa que tu Cloud Name y Upload Preset de Cloudinary sean correctos y permitan uploads sin firma.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const finalGoals = selectedGoals.includes("Objetivo Específico / Otro") 
        ? [...selectedGoals.filter(g => g !== "Objetivo Específico / Otro"), `Otro: ${specificGoal}`].filter(Boolean).join(" | ")
        : selectedGoals.join(" | ");

      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, goals: finalGoals || "Sin especificar", photos }),
      });

      if (!response.ok) throw new Error("Error submitting form");

      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al enviar el formulario. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md border border-line bg-surface p-10 text-center"
        >
          <CheckCircle className="mx-auto h-12 w-12 text-gold" strokeWidth={1.25} />
          <h2 className="mt-6 font-display text-3xl uppercase text-text">¡Formulario Enviado!</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Tus datos han sido registrados correctamente. Pronto nos pondremos en contacto contigo para comenzar a entrenar.
          </p>
          <Button href="/" variant="secondary" className="mt-8 rounded-brand">
            Volver al inicio
          </Button>
        </motion.div>
      </div>
    );
  }

  const sectionTitle = "flex items-center gap-3 border-b border-line pb-4 font-display text-2xl uppercase text-text";
  const sectionIcon = "h-5 w-5 text-gold";
  const fieldLabel = "flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted";

  return (
    <div className="min-h-screen bg-bg px-5 pb-24 pt-10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" aria-label="Inicio" className="inline-block">
          <Wordmark size="md" />
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border-b border-line py-14 md:py-20">
          <h1 className="font-display uppercase leading-[0.9] text-text" style={{ fontSize: "clamp(3rem, 9vw, 6rem)" }}>
            Comenzá tu <span className="text-gold">Transformación</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
            Completá este formulario para conocerte mejor y diseñar un plan de entrenamiento 100% adaptado a tus objetivos y necesidades.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="space-y-14 pt-12">
            {/* Datos Personales */}
            <section className="space-y-6">
              <h2 className={sectionTitle}>
                <Activity className={sectionIcon} strokeWidth={1.5} />
                Datos Personales
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                <Input label="Nombre Completo" required name="name" value={formData.name} onChange={handleInputChange} placeholder="Ej: Juan Pérez" />
                <Input label="Email" required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="ejemplo@correo.com" />
                <Input label="Fecha de Nacimiento" required type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                <Input label="Altura (cm)" required type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder="Ej: 175" />
                <Input label="Peso aproximado (kg)" required type="number" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="Ej: 70" />
              </div>
            </section>

            {/* Entrenamiento */}
            <section className="space-y-6">
              <h2 className={sectionTitle}>
                <Dumbbell className={sectionIcon} strokeWidth={1.5} />
                Preferencias de Entrenamiento
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                <Select label="¿Cuántos días querés entrenar por semana?" required name="trainingDays" value={formData.trainingDays} onChange={handleInputChange}>
                  <option value="" disabled>Selecciona una opción</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={`${num} día${num > 1 ? 's' : ''}`}>{num} día{num > 1 ? 's' : ''}</option>
                  ))}
                </Select>
                <Select label="¿Cuánto tiempo querés que dure cada sesión?" required name="sessionDuration" value={formData.sessionDuration} onChange={handleInputChange}>
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="1hs">1 hora</option>
                  <option value="2hs">2 horas</option>
                  <option value="3hs">3 horas</option>
                  <option value="Mas horas">Más de 3 horas</option>
                </Select>
              </div>
              <Textarea label="Experiencia en deportes" required name="sportsExperience" value={formData.sportsExperience} onChange={handleInputChange} rows={3} placeholder="¿Qué deportes practicaste y por cuánto tiempo?" />
              <div className="space-y-1.5">
                <label htmlFor="injuries" className={fieldLabel}>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Lesiones y/o cirugías
                </label>
                <Textarea id="injuries" required name="injuries" value={formData.injuries} onChange={handleInputChange} rows={3} placeholder="Detalla cualquier lesión o cirugía relevante para tu entrenamiento" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastTraining" className={fieldLabel}>
                  <Clock className="h-3.5 w-3.5" />
                  Último entrenamiento (¿cuándo fue y qué hiciste?)
                </label>
                <Textarea id="lastTraining" required name="lastTraining" value={formData.lastTraining} onChange={handleInputChange} rows={3} placeholder="Cuentanos sobre tu última sesión de entrenamiento..." />
              </div>
            </section>

            {/* Objetivos y Entorno */}
            <section className="space-y-6">
              <h2 className={sectionTitle}>
                <Target className={sectionIcon} strokeWidth={1.5} />
                Objetivos y Entorno
              </h2>
              <div className="space-y-3">
                <p className={fieldLabel}>Selecciona tus objetivos (puedes elegir varios)</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        aria-pressed={isSelected}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-panel border px-4 py-3 text-left text-sm transition-colors",
                          isSelected ? "border-gold bg-gold/10 text-text" : "border-line bg-surface text-muted hover:border-muted"
                        )}
                      >
                        {goal}
                        {isSelected && <CheckCircle className="h-4 w-4 shrink-0 text-gold" />}
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {selectedGoals.includes("Objetivo Específico / Otro") && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3">
                        <Textarea
                          label="Detalla tu objetivo específico"
                          required
                          value={specificGoal}
                          onChange={(e) => setSpecificGoal(e.target.value)}
                          rows={2}
                          placeholder="Ej: Llegar a levantar 250kg en sentadilla, o competir en Diciembre..."
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Textarea label="Gimnasio en donde entrenás / entrenarías" required name="gym" value={formData.gym} onChange={handleInputChange} rows={3} placeholder="Describe el gimnasio o los materiales que tienes disponibles en casa." />

              {/* Upload de Fotos */}
              <div className="space-y-3">
                <p className={fieldLabel}>
                  <Camera className="h-3.5 w-3.5" />
                  Fotos y videos del gym o materiales (Opcional)
                </p>
                <div className="flex flex-wrap gap-3">
                  <AnimatePresence>
                    {photos.map((url, idx) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={idx}
                        className="relative h-24 w-24 overflow-hidden rounded-panel border border-line"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Upload ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          aria-label="Quitar foto"
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-bg/80 text-text hover:text-danger"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-panel border border-dashed border-line text-muted transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5" strokeWidth={1.5} />
                        <span className="text-[11px] uppercase tracking-[0.2em]">Subir</span>
                      </>
                    )}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*,video/*" className="hidden" />
                </div>
              </div>
            </section>

            {error && <div className="border border-danger/40 px-4 py-3 text-sm text-danger">{error}</div>}

            <div className="border-t border-line pt-8">
              <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full rounded-brand md:w-auto">
                {isSubmitting ? "Enviando..." : "Enviar Formulario"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
