"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Search, Plus, Edit2, Trash2, X, Loader2, PlaySquare, ShieldAlert } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  videoUrl: string | null;
  createdAt: string;
};

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({ name: "", videoUrl: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await fetch("/api/exercises");
      const data = await res.json();
      if (Array.isArray(data)) {
        setExercises(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (ex?: Exercise) => {
    setError("");
    if (ex) {
      setEditingExercise(ex);
      setFormData({ name: ex.name, videoUrl: ex.videoUrl || "" });
    } else {
      setEditingExercise(null);
      setFormData({ name: "", videoUrl: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExercise(null);
    setFormData({ name: "", videoUrl: "" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const url = editingExercise ? `/api/exercises/${editingExercise.id}` : "/api/exercises";
      const method = editingExercise ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el ejercicio");
      }

      await fetchExercises();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExercises((prev) => prev.filter((ex) => ex.id !== id));
        setExerciseToDelete(null);
        setDeleteConfirmationText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface p-4 sm:p-6 rounded-panel border border-line gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gold/10 text-gold rounded-panel">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-3xl uppercase leading-none text-text">Biblioteca de Ejercicios</h1>
            <p className="text-muted text-xs sm:text-sm">Catálogo global de ejercicios y videos</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-line rounded-panel leading-5 bg-surface-2 text-text placeholder-muted focus:outline-none focus:outline-none focus:border-gold sm:text-sm transition-all"
              placeholder="Buscar ejercicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto px-4 py-2 bg-gold hover:brightness-110 text-bg font-medium rounded-panel transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Ejercicio
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-panel border border-line overflow-hidden transition-colors">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gold" />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text">No hay ejercicios</h3>
            <p className="text-muted mt-1">
              {searchTerm ? "La búsqueda no arrojó resultados." : "Agrega tu primer ejercicio al catálogo."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-2 text-text font-semibold border-b border-line transition-colors">
                <tr>
                  <th className="px-6 py-4">Nombre del Ejercicio</th>
                  <th className="px-6 py-4">Video de Referencia</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredExercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-surface-2 transition-colors group">
                    <td className="px-6 py-4 font-medium text-text">
                      {ex.name}
                    </td>
                    <td className="px-6 py-4">
                      {ex.videoUrl ? (
                        <a 
                          href={ex.videoUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-gold hover:underline flex items-center gap-1.5 w-max"
                        >
                          <PlaySquare className="w-4 h-4" /> Ver Video
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(ex)} 
                          className="p-2 text-gold bg-gold/10 hover:bg-gold/10 rounded-panel transition-colors" 
                          title="Editar Ejercicio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setExerciseToDelete(ex)} 
                          className="p-2 text-danger bg-danger/10 hover:bg-danger/10 rounded-panel transition-colors" 
                          title="Eliminar Ejercicio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {/* Modal de Crear/Editar */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-panel w-full max-w-lg overflow-hidden border border-line"
            >
              <div className="flex justify-between items-center p-6 border-b border-line">
                <h3 className="text-xl font-bold text-text">
                  {editingExercise ? "Editar Ejercicio" : "Nuevo Ejercicio"}
                </h3>
                <button onClick={handleCloseModal} className="text-muted hover:text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {error && (
                  <div className="bg-danger/10 text-danger p-3 rounded-panel text-sm font-medium">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Nombre del Ejercicio <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-surface-2 border border-line rounded-panel focus:outline-none"
                    placeholder="Ej. Press de Banca Plano"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Enlace de Video (Opcional)</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-surface-2 border border-line rounded-panel focus:outline-none"
                    placeholder="Ej. https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted mt-1">Este link se mostrará al alumno para guiarlo.</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-line rounded-panel text-text font-medium hover:bg-surface-2 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-gold hover:brightness-110 text-bg rounded-panel font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal de Eliminar */}
        {exerciseToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setExerciseToDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-panel w-full max-w-md overflow-hidden border border-line"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4 text-danger">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">¿Eliminar ejercicio?</h3>
                <p className="text-sm text-muted mb-4">
                  Estás a punto de eliminar <strong className="text-text">{exerciseToDelete.name}</strong> del catálogo global. Esta acción no se puede deshacer.
                </p>
                <div className="bg-gold/10 text-gold p-3 rounded-panel text-xs text-left mb-6 border border-gold-line">
                  <strong>Tranquilo:</strong> Borrar esto no afectará a los alumnos que ya tienen este ejercicio en su rutina. Solo lo quitará del catálogo para futuras asignaciones.
                </div>
                <div className="mb-6 text-left">
                  <label className="block text-xs font-medium text-text mb-2">
                    Por seguridad, escribí <strong>Quiero borrar este ejercicio</strong> para confirmar:
                  </label>
                  <input 
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-2 border border-line rounded-panel text-sm text-text focus:ring-2 focus:ring-danger focus:border-transparent outline-none transition-all"
                    placeholder="Quiero borrar este ejercicio"
                  />
                </div>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => {
                      setExerciseToDelete(null);
                      setDeleteConfirmationText("");
                    }}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 rounded-panel border border-line font-medium text-text hover:bg-surface-2 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleDelete(exerciseToDelete.id)}
                    disabled={isDeleting || deleteConfirmationText !== "Quiero borrar este ejercicio"}
                    className="flex-1 py-2.5 px-4 rounded-panel bg-danger hover:brightness-110 text-bg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Sí, eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
