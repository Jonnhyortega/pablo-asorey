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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Biblioteca de Ejercicios</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Catálogo global de ejercicios y videos</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
              placeholder="Buscar ejercicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Ejercicio
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 dark:text-purple-400" />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell className="w-16 h-16 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No hay ejercicios</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {searchTerm ? "La búsqueda no arrojó resultados." : "Agrega tu primer ejercicio al catálogo."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-200 font-semibold border-b border-gray-200 dark:border-slate-800 transition-colors">
                <tr>
                  <th className="px-6 py-4">Nombre del Ejercicio</th>
                  <th className="px-6 py-4">Video de Referencia</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredExercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {ex.name}
                    </td>
                    <td className="px-6 py-4">
                      {ex.videoUrl ? (
                        <a 
                          href={ex.videoUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 w-max"
                        >
                          <PlaySquare className="w-4 h-4" /> Ver Video
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(ex)} 
                          className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors" 
                          title="Editar Ejercicio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setExerciseToDelete(ex)} 
                          className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-colors" 
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
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingExercise ? "Editar Ejercicio" : "Nuevo Ejercicio"}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Ejercicio <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:text-gray-100"
                    placeholder="Ej. Press de Banca Plano"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enlace de Video (Opcional)</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:text-gray-100"
                    placeholder="Ej. https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Este link se mostrará al alumno para guiarlo.</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
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
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-800"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar ejercicio?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Estás a punto de eliminar <strong className="text-gray-800 dark:text-gray-200">{exerciseToDelete.name}</strong> del catálogo global. Esta acción no se puede deshacer.
                </p>
                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 p-3 rounded-lg text-xs text-left mb-6 border border-orange-200 dark:border-orange-800/50">
                  <strong>Tranquilo:</strong> Borrar esto no afectará a los alumnos que ya tienen este ejercicio en su rutina. Solo lo quitará del catálogo para futuras asignaciones.
                </div>
                <div className="mb-6 text-left">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Por seguridad, escribí <strong>Quiero borrar este ejercicio</strong> para confirmar:
                  </label>
                  <input 
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
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
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-slate-700 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleDelete(exerciseToDelete.id)}
                    disabled={isDeleting || deleteConfirmationText !== "Quiero borrar este ejercicio"}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
