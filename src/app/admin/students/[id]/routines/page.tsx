"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Dumbbell, Plus, Trash2, Save, Loader2, PlaySquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Exercise = {
  id?: string;
  name: string;
  sets_reps: string;
  rest: string;
  videoUrl: string;
};

type RoutineDay = {
  id?: string;
  dayName: string;
  order: number;
  exercises: Exercise[];
};

type RoutineFormData = {
  startDate: string;
  endDate: string;
  days: RoutineDay[];
};

export default function StudentRoutinesPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RoutineFormData>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days: []
  });

  useEffect(() => {
    fetchRoutines();
  }, [studentId]);

  const fetchRoutines = async () => {
    try {
      const res = await fetch(`/api/routines?studentId=${studentId}`);
      const data = await res.json();
      setRoutines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDay = () => {
    setFormData(prev => ({
      ...prev,
      days: [...prev.days, { dayName: `Día ${prev.days.length + 1}`, order: prev.days.length, exercises: [] }]
    }));
  };

  const handleRemoveDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== dayIndex)
    }));
  };

  const handleAddExercise = (dayIndex: number) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        exercises: [...newDays[dayIndex].exercises, { name: "", sets_reps: "", rest: "", videoUrl: "" }]
      };
      return { ...prev, days: newDays };
    });
  };

  const handleRemoveExercise = (dayIndex: number, exIndex: number) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        exercises: newDays[dayIndex].exercises.filter((_, i) => i !== exIndex)
      };
      return { ...prev, days: newDays };
    });
  };

  const handleExerciseChange = (dayIndex: number, exIndex: number, field: keyof Exercise, value: string) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      const newExercises = [...newDays[dayIndex].exercises];
      newExercises[exIndex] = { ...newExercises[exIndex], [field]: value };
      newDays[dayIndex] = { ...newDays[dayIndex], exercises: newExercises };
      return { ...prev, days: newDays };
    });
  };

  const handleEditRoutine = (routine: any) => {
    setFormData({
      startDate: new Date(routine.startDate).toISOString().split('T')[0],
      endDate: new Date(routine.endDate).toISOString().split('T')[0],
      days: routine.days.map((d: any) => ({
        id: d.id,
        dayName: d.dayName,
        order: d.order,
        exercises: d.exercises.map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          sets_reps: ex.sets_reps,
          rest: ex.rest,
          videoUrl: ex.videoUrl
        }))
      }))
    });
    setEditingRoutineId(routine.id);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta rutina entera? Se perderá el progreso de los ejercicios que el alumno haya marcado como completados.")) return;
    try {
      const res = await fetch(`/api/routines/${routineId}`, { method: "DELETE" });
      if (res.ok) fetchRoutines();
    } catch (err) { console.error(err); }
  };

  const handleSaveRoutine = async () => {
    if (formData.days.length === 0) return alert("Añade al menos un día a la rutina");
    setSaving(true);
    try {
      const url = editingRoutineId ? `/api/routines/${editingRoutineId}` : "/api/routines";
      const method = editingRoutineId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRoutineId ? { startDate: formData.startDate, endDate: formData.endDate, days: formData.days } : { studentId, ...formData })
      });
      if (res.ok) {
        setIsCreating(false);
        setEditingRoutineId(null);
        setFormData({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          days: []
        });
        fetchRoutines();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/students" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Rutinas del Alumno</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Asigna y gestiona las rutinas de entrenamiento</p>
          </div>
        </div>
        
        {!isCreating && (
          <button 
            onClick={() => { setIsCreating(true); setEditingRoutineId(null); setFormData({ startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], days: [] }); }}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Rutina
          </button>
        )}
      </div>

      {isCreating && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-800">{editingRoutineId ? "Editar Rutina" : "Crear Nueva Rutina"}</h2>
            <button onClick={() => { setIsCreating(false); setEditingRoutineId(null); }} className="text-gray-400 hover:text-gray-600">Cancelar</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div className="space-y-6">
            {formData.days.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <input 
                    type="text" 
                    value={day.dayName} 
                    onChange={e => {
                      const newDays = [...formData.days];
                      newDays[dayIndex] = { ...newDays[dayIndex], dayName: e.target.value };
                      setFormData({...formData, days: newDays});
                    }}
                    className="px-3 py-1.5 font-bold text-gray-800 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button onClick={() => handleRemoveDay(dayIndex)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="space-y-3">
                  {day.exercises.map((ex, exIndex) => (
                    <div key={exIndex} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <input placeholder="Ejercicio (ej: Press Banca)" value={ex.name} onChange={e => handleExerciseChange(dayIndex, exIndex, 'name', e.target.value)} className="flex-1 min-w-[150px] text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
                      <input placeholder="Series x Reps" value={ex.sets_reps} onChange={e => handleExerciseChange(dayIndex, exIndex, 'sets_reps', e.target.value)} className="w-32 text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
                      <input placeholder="Descanso" value={ex.rest} onChange={e => handleExerciseChange(dayIndex, exIndex, 'rest', e.target.value)} className="w-24 text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
                      <div className="flex-1 min-w-[150px] relative">
                        <PlaySquare className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input placeholder="Video URL" value={ex.videoUrl} onChange={e => handleExerciseChange(dayIndex, exIndex, 'videoUrl', e.target.value)} className="w-full text-sm pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <button onClick={() => handleRemoveExercise(dayIndex, exIndex)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => handleAddExercise(dayIndex)} className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2">
                    <Plus className="w-3 h-3" /> Añadir Ejercicio
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleAddDay} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-purple-600 hover:border-purple-300 transition-colors flex items-center justify-center gap-2 font-medium">
            <Plus className="w-5 h-5" />
            Añadir Día de Entrenamiento
          </button>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button onClick={handleSaveRoutine} disabled={saving} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Rutina
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 px-2">Historial de Rutinas</h3>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
        ) : routines.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay rutinas asignadas a este alumno.</p>
          </div>
        ) : (
          routines.map((routine: any) => (
            <div key={routine.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-800">
                    {new Date(routine.startDate).toLocaleDateString()} al {new Date(routine.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                    {routine.days.length} días
                  </span>
                  <button onClick={() => handleEditRoutine(routine)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDeleteRoutine(routine.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {routine.days.map((day: any) => (
                  <div key={day.id} className="border border-gray-100 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                      {day.dayName}
                      {day.completedAt && <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">Completado: {new Date(day.completedAt).toLocaleDateString()}</span>}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 rounded-l-lg">Ejercicio</th>
                            <th className="px-3 py-2">Series x Reps</th>
                            <th className="px-3 py-2">Descanso</th>
                            <th className="px-3 py-2 rounded-r-lg">Video</th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.exercises.map((ex: any) => (
                            <tr key={ex.id} className="border-b border-gray-50 last:border-0">
                              <td className="px-3 py-2 font-medium text-gray-800">{ex.name}</td>
                              <td className="px-3 py-2 text-gray-600">{ex.sets_reps}</td>
                              <td className="px-3 py-2 text-gray-600">{ex.rest}</td>
                              <td className="px-3 py-2">
                                {ex.videoUrl ? (
                                  <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                    <PlaySquare className="w-3 h-3" /> Link
                                  </a>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
