"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Dumbbell, Plus, Trash2, Save, Loader2, PlaySquare, ChevronDown, ChevronUp, Copy, GripVertical } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Exercise = {
  id?: string;
  name: string;
  sets_reps: string;
  rest: string;
  videoUrl: string;
  _uid?: string;
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

const formatDateUTC = (dateString: string | null) => {
  if (!dateString) return "";
  try {
    const datePart = typeof dateString === 'string' ? dateString.split('T')[0] : new Date(dateString).toISOString().split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year}`;
  } catch (e) {
    return new Date(dateString).toLocaleDateString();
  }
};

export default function StudentRoutinesPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingNewItem, setSavingNewItem] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [expandedRoutines, setExpandedRoutines] = useState<Record<string, boolean>>({});
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const [draggingEx, setDraggingEx] = useState<{ dayIndex: number, exIndex: number } | null>(null);
  const [dragOverEx, setDragOverEx] = useState<{ dayIndex: number, exIndex: number } | null>(null);

  const toggleRoutine = (id: string) => {
    setExpandedRoutines(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDay = (id: string) => {
    setExpandedDays(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [exerciseLibrary, setExerciseLibrary] = useState<{id: string, name: string, videoUrl: string | null}[]>([]);

  const [newExerciseModal, setNewExerciseModal] = useState<{isOpen: boolean, dayIndex: number, exIndex: number} | null>(null);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseVideoUrl, setNewExerciseVideoUrl] = useState("");
  
  const [formData, setFormData] = useState<RoutineFormData>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days: []
  });

  useEffect(() => {
    fetchRoutines();
    fetchLibrary();
  }, [studentId]);

  const fetchLibrary = async () => {
    try {
      const res = await fetch('/api/exercise-library');
      setExerciseLibrary(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

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
      days: prev.days.filter((_, i) => i !== dayIndex).map((d, idx) => ({...d, order: idx}))
    }));
  };

  const handleDuplicateDay = (dayIndex: number) => {
    setFormData(prev => {
      const dayToCopy = prev.days[dayIndex];
      const newDay = {
        ...dayToCopy,
        dayName: `Día ${prev.days.length + 1}`,
        id: undefined,
        exercises: dayToCopy.exercises.map(ex => ({ ...ex, id: undefined }))
      };
      
      const newDays = [...prev.days, newDay];
      
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      
      return { 
        ...prev, 
        days: newDays.map((d, idx) => ({...d, order: idx})) 
      };
    });
  };

  const handleAddExercise = (dayIndex: number) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        exercises: [...newDays[dayIndex].exercises, { name: "", sets_reps: "", rest: "", videoUrl: "", _uid: Math.random().toString(36).substr(2, 9) }]
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

  const saveNewExerciseName = async () => {
    if (!newExerciseName) return;
    setSavingNewItem(true);
    try {
      const payload = { name: newExerciseName, videoUrl: newExerciseVideoUrl || null };
      const res = await fetch('/api/exercise-library', { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        const data = await res.json();
        setExerciseLibrary(prev => [...prev, data].sort((a,b) => a.name.localeCompare(b.name)));
        if (newExerciseModal) {
          setFormData(prev => {
            const newDays = [...prev.days];
            const newExercises = [...newDays[newExerciseModal.dayIndex].exercises];
            newExercises[newExerciseModal.exIndex] = { 
              ...newExercises[newExerciseModal.exIndex], 
              name: data.name,
              videoUrl: data.videoUrl || ""
            };
            newDays[newExerciseModal.dayIndex] = { ...newDays[newExerciseModal.dayIndex], exercises: newExercises };
            return { ...prev, days: newDays };
          });
        }
        setNewExerciseModal(null);
        setNewExerciseName("");
        setNewExerciseVideoUrl("");
      } else {
        alert("Error al guardar, tal vez el nombre ya existe.");
      }
    } catch (e) { console.error(e); } finally { setSavingNewItem(false); }
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
          videoUrl: ex.videoUrl,
          _uid: Math.random().toString(36).substr(2, 9)
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

  const handleDragStart = (e: React.DragEvent, dayIndex: number, exIndex: number) => {
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data to drag
    e.dataTransfer.setData('text/plain', '');
    setDraggingEx({ dayIndex, exIndex });
  };

  const handleDragOver = (e: React.DragEvent, dayIndex: number, exIndex: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggingEx?.dayIndex === dayIndex) {
      setDragOverEx({ dayIndex, exIndex });
    }
  };

  const handleDrop = (e: React.DragEvent, targetDayIndex: number, targetExIndex: number) => {
    e.preventDefault();
    if (!draggingEx) return;
    
    if (draggingEx.dayIndex === targetDayIndex && draggingEx.exIndex !== targetExIndex) {
      setFormData(prev => {
        const newDays = [...prev.days];
        const newExercises = [...newDays[targetDayIndex].exercises];
        
        const [draggedItem] = newExercises.splice(draggingEx.exIndex, 1);
        newExercises.splice(targetExIndex, 0, draggedItem);
        
        newDays[targetDayIndex] = { ...newDays[targetDayIndex], exercises: newExercises };
        return { ...prev, days: newDays };
      });
    }
    
    setDraggingEx(null);
    setDragOverEx(null);
  };

  const handleDragEnd = () => {
    setDraggingEx(null);
    setDragOverEx(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <Link href="/admin/students" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Rutinas del Alumno</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Asigna y gestiona las rutinas de entrenamiento</p>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-6 transition-colors">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{editingRoutineId ? "Editar Rutina" : "Crear Nueva Rutina"}</h2>
            <button onClick={() => { setIsCreating(false); setEditingRoutineId(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Cancelar</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Inicio</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:text-gray-100 color-scheme-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Fin</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:text-gray-100 color-scheme-dark" />
            </div>
          </div>

          <div className="space-y-6">
            {formData.days.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <input 
                    type="text" 
                    value={day.dayName} 
                    onChange={e => {
                      const newDays = [...formData.days];
                      newDays[dayIndex] = { ...newDays[dayIndex], dayName: e.target.value };
                      setFormData({...formData, days: newDays});
                    }}
                    className="px-3 py-1.5 font-bold text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDuplicateDay(dayIndex)} title="Duplicar día" className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRemoveDay(dayIndex)} title="Eliminar día" className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {day.exercises.map((ex, exIndex) => {
                    const isDragging = draggingEx?.dayIndex === dayIndex && draggingEx?.exIndex === exIndex;
                    const isDragOver = dragOverEx?.dayIndex === dayIndex && dragOverEx?.exIndex === exIndex;
                    
                    return (
                      <div 
                        key={ex.id || ex._uid || exIndex} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, dayIndex, exIndex)}
                        onDragOver={(e) => handleDragOver(e, dayIndex, exIndex)}
                        onDrop={(e) => handleDrop(e, dayIndex, exIndex)}
                        onDragEnd={handleDragEnd}
                        className={`flex flex-wrap md:flex-nowrap gap-2 items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm transition-all duration-200
                          ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
                          ${isDragOver && !isDragging ? (draggingEx!.exIndex > exIndex ? 'border-t-2 border-t-purple-500' : 'border-b-2 border-b-purple-500') : ''}
                        `}
                      >
                        <div className="cursor-grab hover:text-purple-600 dark:hover:text-purple-400 active:cursor-grabbing p-1 text-gray-400 dark:text-gray-500">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <select 
                          value={ex.name}  
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'ADD_NEW') {
                            setNewExerciseModal({isOpen: true, dayIndex, exIndex});
                          } else {
                            // Find the selected exercise to auto-populate videoUrl
                            const selected = exerciseLibrary.find(x => x.name === val);
                            setFormData(prev => {
                              const newDays = [...prev.days];
                              const newExercises = [...newDays[dayIndex].exercises];
                              newExercises[exIndex] = { 
                                ...newExercises[exIndex], 
                                name: val,
                                videoUrl: selected?.videoUrl || newExercises[exIndex].videoUrl // Keep existing if not found, or overwrite if found
                              };
                              // If selected has a videoUrl, always overwrite. If it doesn't, we can clear it or leave it. 
                              // It's better to clear it if it's tied to the exercise, but for now we'll just set it to selected?.videoUrl || ""
                              newExercises[exIndex].videoUrl = selected?.videoUrl || "";
                              
                              newDays[dayIndex] = { ...newDays[dayIndex], exercises: newExercises };
                              return { ...prev, days: newDays };
                            });
                          }
                        }} 
                        className="flex-1 min-w-[150px] text-sm px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-gray-100"
                      >
                        <option value="">Seleccionar Ejercicio</option>
                        {exerciseLibrary.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                        <option value="ADD_NEW" className="font-bold text-purple-600 dark:text-purple-400">+ Agregar nuevo...</option>
                      </select>
                      
                      <input placeholder="Series x Reps" value={ex.sets_reps} onChange={e => handleExerciseChange(dayIndex, exIndex, 'sets_reps', e.target.value)} className="w-32 text-sm px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-gray-100" />
                      <input placeholder="Descanso" value={ex.rest} onChange={e => handleExerciseChange(dayIndex, exIndex, 'rest', e.target.value)} className="w-24 text-sm px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-gray-100" />
                      
                      <div className="flex-1 min-w-[150px] relative">
                        <PlaySquare className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        <input 
                          placeholder="Video URL" 
                          value={ex.videoUrl} 
                          onChange={e => handleExerciseChange(dayIndex, exIndex, 'videoUrl', e.target.value)} 
                          className="w-full text-sm pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-gray-100" 
                        />
                      </div>
                      
                      <button onClick={() => handleRemoveExercise(dayIndex, exIndex)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    );
                  })}
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
          <div ref={bottomRef} />
        </motion.div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 px-2">Historial de Rutinas</h3>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" /></div>
        ) : routines.filter((r: any) => r.id !== editingRoutineId).length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-gray-100 dark:border-slate-800 text-center transition-colors">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No hay rutinas asignadas a este alumno.</p>
          </div>
        ) : (
          routines.filter((r: any) => r.id !== editingRoutineId).map((routine: any) => (
            <div key={routine.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div 
                className="bg-gray-50 dark:bg-slate-800/50 p-4 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-2 justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => toggleRoutine(routine.id)}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-bold text-gray-800 dark:text-gray-100">
                    {formatDateUTC(routine.startDate)} al {formatDateUTC(routine.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                    {routine.days.length} días
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); handleEditRoutine(routine); }} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteRoutine(routine.id); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-gray-400 ml-2">
                    {expandedRoutines[routine.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {expandedRoutines[routine.id] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {routine.days.map((day: any) => (
                        <div key={day.id} className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-colors">
                          <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                            onClick={() => toggleDay(day.id)}
                          >
                            <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                              {day.dayName}
                            </h4>
                            <div className="flex items-center gap-3">
                              {day.completedAt && <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">Completado: {new Date(day.completedAt).toLocaleDateString()}</span>}
                              <div className="text-gray-400">
                                {expandedDays[day.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {expandedDays[day.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 pt-0 overflow-x-auto border-t border-gray-100 dark:border-slate-800">
                                  <table className="w-full text-sm text-left mt-2">
                                    <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50">
                                      <tr>
                                        <th className="px-3 py-2 rounded-l-lg">Ejercicio</th>
                                        <th className="px-3 py-2">Series x Reps</th>
                                        <th className="px-3 py-2">Descanso</th>
                                        <th className="px-3 py-2">Peso Usado</th>
                                        <th className="px-3 py-2">Observaciones</th>
                                        <th className="px-3 py-2 rounded-r-lg">Video</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {day.exercises.map((ex: any) => (
                                        <tr key={ex.id} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0 hover:bg-purple-50/50 dark:hover:bg-slate-800/50 hover:shadow-sm transition-all duration-200">
                                          <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{ex.name}</td>
                                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{ex.sets_reps}</td>
                                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{ex.rest}</td>
                                          <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-medium">
                                            {(() => {
                                              let parsedSets = [];
                                              try { if (ex.loggedSets) parsedSets = JSON.parse(ex.loggedSets); } catch(e) {}
                                              if (parsedSets.length > 0) {
                                                return (
                                                  <div className="flex flex-col gap-1 text-xs">
                                                    {parsedSets.map((s: any, i: number) => (
                                                      <span key={i} className="whitespace-nowrap">S{i+1}: {s.reps || '-'}x{s.weight || '-'}kg</span>
                                                    ))}
                                                  </div>
                                                );
                                              }
                                              return ex.weight || "-";
                                            })()}
                                          </td>
                                          <td className="px-3 py-2 text-gray-500 dark:text-gray-500 italic text-xs max-w-[150px] truncate" title={ex.observations}>{ex.observations || "-"}</td>
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
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {newExerciseModal?.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Agregar Nuevo Ejercicio</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Ejercicio <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Ej: Press Banca" 
                  value={newExerciseName} 
                  onChange={e => setNewExerciseName(e.target.value)} 
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:text-gray-100" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL del Video (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="https://youtube.com/..." 
                  value={newExerciseVideoUrl} 
                  onChange={e => setNewExerciseVideoUrl(e.target.value)} 
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:text-gray-100" 
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-8">
              <button onClick={() => setNewExerciseModal(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium">Cancelar</button>
              <button onClick={saveNewExerciseName} disabled={savingNewItem || !newExerciseName.trim()} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50">
                {savingNewItem ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar y Usar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
