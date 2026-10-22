"use client";

import { useState, useEffect } from "react";
import { Button, Dialog, Input, PageHeader } from "@/components/ui";
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
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Catálogo global de ejercicios y videos"
        title="Biblioteca de Ejercicios"
        actions={
          <>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="text"
                aria-label="Buscar ejercicio"
                className="pl-9"
                placeholder="Buscar ejercicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={() => handleOpenModal()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nuevo Ejercicio
            </Button>
          </>
        }
      />

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
              <thead className="border-b border-line text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
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
                          className="flex w-max items-center gap-1.5 text-muted transition-colors hover:text-gold"
                        >
                          <PlaySquare className="w-4 h-4" /> Ver Video
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(ex)} 
                          className="flex h-9 w-9 items-center justify-center rounded-panel border border-line text-muted transition-colors hover:border-gold hover:text-gold" 
                          title="Editar Ejercicio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setExerciseToDelete(ex)} 
                          className="flex h-9 w-9 items-center justify-center rounded-panel border border-line text-muted transition-colors hover:border-danger hover:text-danger" 
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

      {/* Modal de Crear/Editar */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingExercise ? "Editar Ejercicio" : "Nuevo Ejercicio"}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" form="exercise-form" variant="primary" loading={isSaving}>
              Guardar
            </Button>
          </>
        }
      >
        <form id="exercise-form" onSubmit={handleSave} className="space-y-4">
          {error && <p className="border border-danger/40 px-3 py-2 text-sm text-danger">{error}</p>}
          <Input
            label="Nombre del Ejercicio *"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej. Press de Banca Plano"
          />
          <div>
            <Input
              label="Enlace de Video (Opcional)"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="Ej. https://youtube.com/watch?v=..."
            />
            <p className="mt-1.5 text-xs text-muted">Este link se mostrará al alumno para guiarlo.</p>
          </div>
        </form>
      </Dialog>

      {/* Modal de Eliminar */}
      <Dialog
        open={!!exerciseToDelete}
        onClose={() => {
          if (isDeleting) return;
          setExerciseToDelete(null);
          setDeleteConfirmationText("");
        }}
        title="¿Eliminar ejercicio?"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={isDeleting}
              onClick={() => {
                setExerciseToDelete(null);
                setDeleteConfirmationText("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              disabled={deleteConfirmationText !== "Quiero borrar este ejercicio"}
              onClick={() => exerciseToDelete && handleDelete(exerciseToDelete.id)}
            >
              {!isDeleting && <Trash2 className="h-4 w-4" />}
              Sí, eliminar
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-muted">
            Estás a punto de eliminar <strong className="text-text">{exerciseToDelete?.name}</strong> del catálogo global. Esta acción no se puede deshacer.
          </p>
          <p className="border border-gold-line px-3 py-2 text-xs leading-relaxed text-muted">
            <strong className="text-gold">Tranquilo:</strong> Borrar esto no afectará a los alumnos que ya tienen este ejercicio en su rutina. Solo lo quitará del catálogo para futuras asignaciones.
          </p>
          <div>
            <p className="mb-2 text-xs text-muted">
              Por seguridad, escribí <strong className="text-text">Quiero borrar este ejercicio</strong> para confirmar:
            </p>
            <Input
              type="text"
              aria-label="Confirmación de borrado"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Quiero borrar este ejercicio"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
