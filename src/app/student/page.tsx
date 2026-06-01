"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle, Loader2, Camera, Dumbbell, Clock, Activity, Target, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function StudentForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    trainingDays: "",
    sessionDuration: "",
    age: "",
    height: "",
    weight: "",
    sportsExperience: "",
    injuries: "",
    lastTraining: "",
    goals: "",
    gym: "",
  });

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
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, photos }),
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
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">¡Formulario Enviado!</h2>
          <p className="text-neutral-400 mb-8">
            Tus datos han sido registrados correctamente. Pronto nos pondremos en contacto contigo para comenzar a entrenar.
          </p>
          <Link href="/" className="inline-block bg-white text-black font-semibold py-3 px-8 rounded-full hover:bg-neutral-200 transition-colors">
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Comenzá tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Transformación</span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Completá este formulario para conocerte mejor y diseñar un plan de entrenamiento 100% adaptado a tus objetivos y necesidades.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-lg p-6 sm:p-10 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Datos Personales */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                Datos Personales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Nombre Completo</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-neutral-600" placeholder="Ej: Juan Pérez" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Email (Opcional)</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-neutral-600" placeholder="ejemplo@correo.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Edad</label>
                  <input required type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-neutral-600" placeholder="Años" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Altura (cm)</label>
                  <input required type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-neutral-600" placeholder="Ej: 175" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-300">Peso aproximado (kg)</label>
                  <input required type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-neutral-600" placeholder="Ej: 70" />
                </div>
              </div>
            </section>

            {/* Entrenamiento */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2 flex items-center gap-2 mt-8">
                <Dumbbell className="w-6 h-6 text-emerald-400" />
                Preferencias de Entrenamiento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">¿Cuántos días querés entrenar por semana?</label>
                  <select required name="trainingDays" value={formData.trainingDays} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white appearance-none">
                    <option value="" disabled>Selecciona una opción</option>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={`${num} día${num > 1 ? 's' : ''}`}>{num} día{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">¿Cuánto tiempo querés que dure cada sesión?</label>
                  <select required name="sessionDuration" value={formData.sessionDuration} onChange={handleInputChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white appearance-none">
                    <option value="" disabled>Selecciona una opción</option>
                    <option value="1hs">1 hora</option>
                    <option value="2hs">2 horas</option>
                    <option value="3hs">3 horas</option>
                    <option value="Mas horas">Más de 3 horas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Experiencia en deportes</label>
                <textarea required name="sportsExperience" value={formData.sportsExperience} onChange={handleInputChange} rows={3} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-neutral-600 resize-none" placeholder="¿Qué deportes practicaste y por cuánto tiempo?" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Lesiones y/o cirugías
                </label>
                <textarea required name="injuries" value={formData.injuries} onChange={handleInputChange} rows={3} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white placeholder:text-neutral-600 resize-none" placeholder="Detalla cualquier lesión o cirugía relevante para tu entrenamiento" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  Último entrenamiento (¿cuándo fue y qué hiciste?)
                </label>
                <textarea required name="lastTraining" value={formData.lastTraining} onChange={handleInputChange} rows={3} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-white placeholder:text-neutral-600 resize-none" placeholder="Cuentanos sobre tu última sesión de entrenamiento..." />
              </div>
            </section>

            {/* Objetivos y Entorno */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2 flex items-center gap-2 mt-8">
                <Target className="w-6 h-6 text-purple-400" />
                Objetivos y Entorno
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Objetivos</label>
                <textarea required name="goals" value={formData.goals} onChange={handleInputChange} rows={3} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder:text-neutral-600 resize-none" placeholder="¿Qué esperas lograr con este entrenamiento? (Ej: Perder peso, ganar masa muscular, mejorar rendimiento)" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Gimnasio en donde entrenás / entrenarías</label>
                <textarea required name="gym" value={formData.gym} onChange={handleInputChange} rows={3} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder:text-neutral-600 resize-none" placeholder="Describe el gimnasio o los materiales que tienes disponibles en casa." />
              </div>

              {/* Upload de Fotos */}
              <div className="space-y-4 pt-4">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-neutral-400" />
                  Fotos y videos del gym o materiales (Opcional)
                </label>
                
                <div className="flex flex-wrap gap-4">
                  <AnimatePresence>
                    {photos.map((url, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={idx} 
                        className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-700 group"
                      >
                        <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="text-white w-6 h-6" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors bg-neutral-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs">Subir</span>
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                  />
                </div>
              </div>
            </section>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 shadow-lg shadow-blue-900/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Enviar Formulario"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
