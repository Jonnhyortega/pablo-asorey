"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Calendar, Activity, Dumbbell, Wallet, CheckCircle, ChevronDown, ChevronUp, PlaySquare, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [expandedCompletedDayId, setExpandedCompletedDayId] = useState<string | null>(null);
  const [exerciseEdits, setExerciseEdits] = useState<{ [key: string]: { weight: string, observations: string, isCompleted: boolean } }>({});
  
  // Overlay state
  const [completingDayId, setCompletingDayId] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes("youtube.com/shorts/")) {
        const videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      // Convertir url normal de embed de instagram u otros
      return url;
    } catch(e) {
      return url;
    }
  };

  const router = useRouter();

  useEffect(() => {
    fetchMe();
  }, []);

  // Save edits to localStorage automatically
  useEffect(() => {
    if (student && Object.keys(exerciseEdits).length > 0) {
      localStorage.setItem(`student_edits_${student.id}`, JSON.stringify(exerciseEdits));
    }
  }, [exerciseEdits, student]);

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/students/me");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }
      const data = await res.json();
      setStudent(data);
      
      // Initialize local state for exercise inputs
      const initialEdits: any = {};
      const savedLocal = localStorage.getItem(`student_edits_${data.id}`);
      let localEdits: any = {};
      if (savedLocal) {
        try {
          localEdits = JSON.parse(savedLocal);
        } catch(e) {}
      }

      data.routines.forEach((r: any) => {
        r.days.forEach((d: any) => {
          d.exercises.forEach((ex: any) => {
            const localEx = localEdits[ex.id];
            initialEdits[ex.id] = { 
              weight: localEx?.weight !== undefined ? localEx.weight : (ex.weight || ""), 
              observations: localEx?.observations !== undefined ? localEx.observations : (ex.observations || ""),
              isCompleted: localEx?.isCompleted !== undefined ? localEx.isCompleted : (ex.isCompleted || false)
            };
          });
        });
      });
      setExerciseEdits(initialEdits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Para simplificar, simplemente borramos el cookie mediante redirección o llamada a API
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const handleExerciseChange = (exId: string, field: 'weight' | 'observations' | 'isCompleted', value: any) => {
    setExerciseEdits(prev => ({
      ...prev,
      [exId]: { ...prev[exId], [field]: value }
    }));
  };

  const handleCompleteDay = async () => {
    if (!completingDayId) return;
    setSaving(true);
    
    // Buscar los ejercicios del día
    let exercisesToUpdate = [];
    for (const routine of student.routines) {
      const day = routine.days.find((d: any) => d.id === completingDayId);
      if (day) {
        exercisesToUpdate = day.exercises.map((ex: any) => ({
          id: ex.id,
          weight: exerciseEdits[ex.id]?.weight,
          observations: exerciseEdits[ex.id]?.observations,
          isCompleted: exerciseEdits[ex.id]?.isCompleted
        }));
        break;
      }
    }

    try {
      const res = await fetch(`/api/routines/days/${completingDayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedAt: completionDate,
          exercises: exercisesToUpdate
        })
      });
      if (res.ok) {
        setCompletingDayId(null);
        fetchMe(); // Recargar datos
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  if (!student) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Estudiante no encontrado</div>;

  // Separar días pendientes y completados de la rutina actual y anteriores
  let pendingDays: any[] = [];
  let completedDays: any[] = [];
  
  student.routines.forEach((routine: any) => {
    routine.days.forEach((day: any) => {
      const dayWithRoutineInfo = { ...day, routineDates: `${new Date(routine.startDate).toLocaleDateString()} al ${new Date(routine.endDate).toLocaleDateString()}` };
      if (day.completedAt) {
        completedDays.push(dayWithRoutineInfo);
      } else {
        pendingDays.push(dayWithRoutineInfo);
      }
    });
  });

  // Ordenar completados por fecha de completado (descendente, más reciente primero)
  completedDays.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans pb-12">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Hola, {student.name.split(' ')[0]}</h1>
              <p className="text-xs text-neutral-400">Panel de Entrenamiento</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Resumen y Pagos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-neutral-300">Tus Datos</h3>
            </div>
            <p className="text-2xl font-bold">{student.weight} kg</p>
            <p className="text-sm text-neutral-400 mt-1">Meta: {student.goals.length > 30 ? student.goals.substring(0, 30) + '...' : student.goals}</p>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className={`w-5 h-5 ${!student.paymentDate ? 'text-orange-400' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'text-red-400' : 'text-emerald-400')}`} />
              <h3 className="font-semibold text-neutral-300">Estado de Cuota</h3>
            </div>
            <p className={`text-xl font-bold ${!student.paymentDate ? 'text-orange-400' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'text-red-400' : 'text-emerald-400')}`}>
              {!student.paymentDate ? 'Pendiente' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'Deuda' : 'Al Día')}
            </p>
            {student.paymentDate && <p className="text-sm text-neutral-400 mt-1">Vence: {new Date(student.paymentDate).toLocaleDateString()}</p>}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-neutral-300">Progreso</h3>
            </div>
            <p className="text-2xl font-bold">{completedDays.length}</p>
            <p className="text-sm text-neutral-400 mt-1">Sesiones completadas</p>
          </div>
        </div>

        {/* Próximas Rutinas */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold">Próximos Entrenamientos</h2>
          </div>
          
          <div className="space-y-4">
            {pendingDays.length === 0 ? (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tienes rutinas pendientes. ¡Buen trabajo!</p>
              </div>
            ) : (
              pendingDays.map((day) => (
                <div key={day.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden transition-all shadow-lg hover:border-neutral-700">
                  <button 
                    onClick={() => setExpandedDayId(expandedDayId === day.id ? null : day.id)}
                    className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-white">{day.dayName}</h3>
                      <p className="text-xs text-neutral-400 mt-1">Rutina: {day.routineDates}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">{day.exercises.length} Ejercicios</span>
                      {expandedDayId === day.id ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedDayId === day.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-5 pt-0 border-t border-neutral-800 space-y-4 mt-2">
                          {day.exercises.map((ex: any) => (
                            <div key={ex.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                              <div className="flex justify-between items-start gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-2 mb-1.5">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4 rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500 bg-neutral-900 cursor-pointer mt-1 shrink-0"
                                      checked={exerciseEdits[ex.id]?.isCompleted || false}
                                      onChange={(e) => handleExerciseChange(ex.id, 'isCompleted', e.target.checked)}
                                    />
                                    <h4 className={`font-bold text-base transition-colors leading-tight break-words ${exerciseEdits[ex.id]?.isCompleted ? 'text-neutral-500 line-through' : 'text-white'}`}>{ex.name}</h4>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-neutral-400 pl-6">
                                    <span className="text-purple-400 break-words max-w-full">{ex.sets_reps}</span>
                                    <span className="text-neutral-600">•</span>
                                    <span className="break-words max-w-full">Descanso: {ex.rest}</span>
                                  </div>
                                </div>
                                {ex.videoUrl && (
                                  <button 
                                    onClick={() => setSelectedVideoUrl(ex.videoUrl)}
                                    className="shrink-0 text-blue-400 hover:text-blue-300 flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors mt-0.5">
                                    <PlaySquare className="w-3.5 h-3.5" /> Ver Video
                                  </button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-neutral-800">
                                <div>
                                  <label className="block text-xs font-medium text-neutral-500 mb-1">Peso utilizado</label>
                                  <input 
                                    type="text" 
                                    placeholder="Ej: 20kg por lado"
                                    value={exerciseEdits[ex.id]?.weight || ""}
                                    onChange={(e) => handleExerciseChange(ex.id, 'weight', e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-neutral-600"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-neutral-500 mb-1">Observaciones</label>
                                  <input 
                                    type="text" 
                                    placeholder="Ej: Costó la última serie"
                                    value={exerciseEdits[ex.id]?.observations || ""}
                                    onChange={(e) => handleExerciseChange(ex.id, 'observations', e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-neutral-600"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <button 
                            onClick={() => setCompletingDayId(day.id)}
                            className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Marcar Día como Realizado
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Historial de Rutinas Realizadas */}
        {completedDays.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Rutinas Realizadas</h2>
            </div>
            
            <div className="space-y-3">
              {completedDays.map((day) => (
                <div key={day.id} className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setExpandedCompletedDayId(expandedCompletedDayId === day.id ? null : day.id)}
                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white">{day.dayName}</h3>
                        <p className="text-xs text-neutral-400 mt-0.5">Realizado el: {new Date(day.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {expandedCompletedDayId === day.id ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
                  </button>

                  <AnimatePresence>
                    {expandedCompletedDayId === day.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-4 pt-0 border-t border-neutral-800/50 space-y-3 mt-2">
                          {day.exercises.map((ex: any) => (
                            <div key={ex.id} className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg p-3 text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                {ex.isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-neutral-600 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></div>
                                  </div>
                                )}
                                <h4 className={`font-bold ${ex.isCompleted ? 'text-neutral-300' : 'text-neutral-500'}`}>{ex.name}</h4>
                              </div>
                              <p className="text-xs text-neutral-500 mb-2 pl-6">{ex.sets_reps}</p>
                              {(ex.weight || ex.observations) ? (
                                <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-neutral-800/50">
                                  {ex.weight && <div className="text-neutral-400"><span className="text-neutral-500">Peso:</span> {ex.weight}</div>}
                                  {ex.observations && <div className="text-neutral-400"><span className="text-neutral-500">Obs:</span> {ex.observations}</div>}
                                </div>
                              ) : (
                                <span className="text-xs text-neutral-600 italic mt-2 block pt-2 border-t border-neutral-800/50">Sin notas de peso o observaciones</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Overlay de Confirmación de Fecha */}
      <AnimatePresence>
        {completingDayId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setCompletingDayId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¡Día Completado!</h2>
              <p className="text-sm text-neutral-400 mb-6">Selecciona qué día realizaste esta rutina.</p>
              
              <div className="w-full text-left mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Fecha de realización</label>
                <input 
                  type="date" 
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="w-full flex gap-3">
                <button 
                  onClick={() => setCompletingDayId(null)}
                  className="flex-1 py-3 text-neutral-400 font-medium hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCompleteDay}
                  disabled={saving}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overlay de Video */}
      <AnimatePresence>
        {selectedVideoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedVideoUrl(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl aspect-video bg-neutral-900 rounded-xl overflow-hidden shadow-2xl z-10"
            >
              <button 
                onClick={() => setSelectedVideoUrl(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full z-20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <iframe
                src={getEmbedUrl(selectedVideoUrl)}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
