"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Calendar, Activity, Dumbbell, Wallet, CheckCircle, ChevronDown, ChevronUp, PlaySquare, Loader2, Save, X, Ban, Edit2, Trash2, Settings, Upload, User } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [expandedCompletedDayId, setExpandedCompletedDayId] = useState<string | null>(null);
  const [exerciseEdits, setExerciseEdits] = useState<{ [key: string]: { weight: string, observations: string, isCompleted: boolean, loggedSets?: any[] } }>({});
  
  // Overlay state
  const [completingDayId, setCompletingDayId] = useState<string | null>(null);
  const [skippingDayId, setSkippingDayId] = useState<string | null>(null);
  const [editingDateDayId, setEditingDateDayId] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // Stats State
  const [stats, setStats] = useState<Record<string, {date: string, maxWeight: number}[]>>({});
  const [activeStatExercise, setActiveStatExercise] = useState<string | null>(null);
  const [adherenceStats, setAdherenceStats] = useState<{
    adherence: { completed: number, skipped: number, total: number, percentage: number } | null,
    missedDaysOfWeek: { name: string, count: number }[] | null
  }>({ adherence: null, missedDaysOfWeek: null });

  // Collapsible Sections State
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isSkippedExpanded, setIsSkippedExpanded] = useState(false);
  const [isAdherenceExpanded, setIsAdherenceExpanded] = useState(true);
  const [isProgressionExpanded, setIsProgressionExpanded] = useState(true);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [settingsForm, setSettingsForm] = useState<{weight: string, goals: string[], profilePicture: string, birthDate: string}>({ weight: "", goals: [], profilePicture: "", birthDate: "" });

  const GOAL_OPTIONS = [
    "Pérdida de Grasa",
    "Aumento de Masa Muscular",
    "Aumento de Fuerza",
    "Mantenimiento",
    "Recomposición Corporal",
    "Salud y Bienestar General",
    "Rendimiento Deportivo",
    "Recuperación / Rehabilitación"
  ];

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

  // Prevent body scroll when any modal is open
  const isAnyModalOpen = showSettings || completingDayId || skippingDayId || editingDateDayId || selectedVideoUrl;
  
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAnyModalOpen]);

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
            let parsedLoggedSets = [];
            try {
              if (localEx?.loggedSets) parsedLoggedSets = localEx.loggedSets;
              else if (ex.loggedSets) parsedLoggedSets = JSON.parse(ex.loggedSets);
            } catch(e) {}

            initialEdits[ex.id] = { 
              weight: localEx?.weight !== undefined ? localEx.weight : (ex.weight || ""), 
              observations: localEx?.observations !== undefined ? localEx.observations : (ex.observations || ""),
              isCompleted: localEx?.isCompleted !== undefined ? localEx.isCompleted : (ex.isCompleted || false),
              loggedSets: parsedLoggedSets
            };
          });
        });
      });
      setExerciseEdits(initialEdits);

      // Fetch stats
      const statsRes = await fetch(`/api/students/${data.id}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.weightProgression || {});
        if (statsData.weightProgression && Object.keys(statsData.weightProgression).length > 0) {
          setActiveStatExercise(Object.keys(statsData.weightProgression)[0]);
        }
        setAdherenceStats({
          adherence: statsData.adherence || null,
          missedDaysOfWeek: statsData.missedDaysOfWeek || null
        });
      }
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

  const addSet = (exId: string) => {
    setExerciseEdits(prev => {
      const currentSets = prev[exId]?.loggedSets || [];
      return {
        ...prev,
        [exId]: { ...prev[exId], loggedSets: [...currentSets, { reps: "", weight: "" }] }
      };
    });
  };

  const removeSet = (exId: string, index: number) => {
    setExerciseEdits(prev => {
      const currentSets = prev[exId]?.loggedSets || [];
      return {
        ...prev,
        [exId]: { ...prev[exId], loggedSets: currentSets.filter((_, i) => i !== index) }
      };
    });
  };

  const updateSet = (exId: string, index: number, field: 'reps' | 'weight', value: string) => {
    setExerciseEdits(prev => {
      const currentSets = [...(prev[exId]?.loggedSets || [])];
      currentSets[index] = { ...currentSets[index], [field]: value };
      return {
        ...prev,
        [exId]: { ...prev[exId], loggedSets: currentSets }
      };
    });
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
          isCompleted: exerciseEdits[ex.id]?.isCompleted,
          loggedSets: exerciseEdits[ex.id]?.loggedSets ? JSON.stringify(exerciseEdits[ex.id].loggedSets) : "[]"
        }));
        
        // Clean localStorage if it's a success
        if (student) {
          const savedLocal = localStorage.getItem(`student_edits_${student.id}`);
          if (savedLocal) {
            let localEdits = {};
            try { localEdits = JSON.parse(savedLocal); } catch(e) {}
            // Remove the exercises from this day
            day.exercises.forEach((ex: any) => {
              delete (localEdits as any)[ex.id];
            });
            localStorage.setItem(`student_edits_${student.id}`, JSON.stringify(localEdits));
          }
        }
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
        toast.success("¡Entrenamiento completado!");
      } else {
        toast.error("Error al completar el entrenamiento");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  const handleSkipDay = async () => {
    if (!skippingDayId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/routines/days/${skippingDayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSkipped: true, completedAt: null })
      });
      if (res.ok) {
        setSkippingDayId(null);
        fetchMe();
        toast.success("Día omitido");
      } else {
        toast.error("Error al omitir el día");
      }
    } catch (err) { console.error(err); toast.error("Ocurrió un error"); } finally { setSaving(false); }
  };

  const handleRevertDay = async (dayId: string) => {
    try {
      const res = await fetch(`/api/routines/days/${dayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSkipped: false, completedAt: null })
      });
      if (res.ok) { fetchMe(); toast.success("Día restaurado"); }
      else { toast.error("Error al restaurar"); }
    } catch (err) { console.error(err); toast.error("Ocurrió un error"); }
  };

  const handleEditDate = async () => {
    if (!editingDateDayId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/routines/days/${editingDateDayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: completionDate })
      });
      if (res.ok) {
        setEditingDateDayId(null);
        fetchMe();
        toast.success("Fecha de completado actualizada");
      } else {
        toast.error("Error al actualizar la fecha");
      }
    } catch (err) { console.error(err); toast.error("Ocurrió un error"); } finally { setSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

    if (!CLOUD_NAME) {
      toast.error("Faltan configurar las variables de entorno de Cloudinary.");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setSettingsForm(prev => ({ ...prev, profilePicture: data.secure_url }));
        // Mantenemos uploadingImage en true hasta que el <img> dispare onLoad
      } else {
        setUploadingImage(false);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir imagen");
      setUploadingImage(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        weight: settingsForm.weight,
        goals: settingsForm.goals.join(', '),
        profilePicture: settingsForm.profilePicture,
        birthDate: settingsForm.birthDate ? new Date(settingsForm.birthDate) : null
      };
      const res = await fetch("/api/students/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowSettings(false);
        fetchMe();
        toast.success("Perfil actualizado correctamente");
      } else {
        toast.error("Error al actualizar perfil");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  if (!student) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Estudiante no encontrado</div>;

  // Separar días pendientes y completados de la rutina actual y anteriores
  let pendingDays: any[] = [];
  let completedDays: any[] = [];
  let skippedDays: any[] = [];
  
  student.routines.forEach((routine: any) => {
    const sortedDays = [...routine.days].sort((a: any, b: any) => {
      const matchA = a.dayName.match(/D[ií]a\s+(\d+)/i);
      const matchB = b.dayName.match(/D[ií]a\s+(\d+)/i);
      if (matchA && matchB) {
        return parseInt(matchA[1]) - parseInt(matchB[1]);
      }
      return a.order - b.order;
    });

    sortedDays.forEach((day: any) => {
      const dayWithRoutineInfo = { ...day, routineDates: `${formatDateUTC(routine.startDate)} al ${formatDateUTC(routine.endDate)}` };
      if (day.isSkipped) {
        skippedDays.push(dayWithRoutineInfo);
      } else if (day.completedAt) {
        completedDays.push(dayWithRoutineInfo);
      } else {
        pendingDays.push(dayWithRoutineInfo);
      }
    });
  });

  // Ordenar completados por fecha de completado (descendente, más reciente primero)
  completedDays.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] text-gray-900 dark:text-white font-sans pb-12 transition-colors duration-300">
      {/* Header Tecnológico / Moderno */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f0f13]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-colors duration-300 shadow-sm dark:shadow-none">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            {student.profilePicture ? (
              <img src={student.profilePicture} alt="Profile" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-md shrink-0" />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-md shrink-0">
                {student.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg leading-tight text-gray-900 dark:text-white truncate">
                Hola, {student.name.split(' ')[0]}
              </h1>
              <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider truncate">
                Panel Atleta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button 
              onClick={() => {
                setSettingsForm({
                  weight: student.weight || "",
                  goals: student.goals ? student.goals.split(', ').filter(Boolean) : [],
                  profilePicture: student.profilePicture || "",
                  birthDate: student.birthDate ? student.birthDate.split('T')[0] : ""
                });
                setShowSettings(true);
              }}
              className="p-2 sm:p-2.5 text-gray-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
              title="Configuración"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="scale-90 sm:scale-100 origin-right">
              <ThemeToggle />
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2 sm:p-2.5 text-gray-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Resumen y Pagos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-700 dark:text-neutral-300">Tus Datos</h3>
            </div>
            <p className="text-2xl font-bold">{student.weight} kg</p>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Meta: {student.goals.length > 30 ? student.goals.substring(0, 30) + '...' : student.goals}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className={`w-5 h-5 ${!student.paymentDate ? 'text-orange-500 dark:text-orange-400' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400')}`} />
              <h3 className="font-semibold text-gray-700 dark:text-neutral-300">Estado de Cuota</h3>
            </div>
            <p className={`text-xl font-bold ${!student.paymentDate ? 'text-orange-500 dark:text-orange-400' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400')}`}>
              {!student.paymentDate ? 'Pendiente' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'Deuda' : 'Al Día')}
            </p>
            {student.paymentDate && <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Vence: {formatDateUTC(student.paymentDate)}</p>}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-700 dark:text-neutral-300">Progreso</h3>
            </div>
            <p className="text-2xl font-bold">{completedDays.length}</p>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Sesiones completadas</p>
          </div>
        </div>

        {/* Próximas Rutinas */}
        <section>
          <div 
            className="flex items-center justify-between mb-4 cursor-pointer select-none"
            onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
          >
            <div className="flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Próximos Entrenamientos</h2>
            </div>
            <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
              {isUpcomingExpanded ? <ChevronUp className="w-6 h-6 text-gray-500 dark:text-neutral-400" /> : <ChevronDown className="w-6 h-6 text-gray-500 dark:text-neutral-400" />}
            </div>
          </div>
          
          <AnimatePresence initial={false}>
            {isUpcomingExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
            {pendingDays.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-8 text-center text-gray-500 dark:text-neutral-500 transition-colors">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tienes rutinas pendientes. ¡Buen trabajo!</p>
              </div>
            ) : (
              pendingDays.map((day) => (
                <div key={day.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden transition-all shadow-sm dark:shadow-lg hover:border-gray-300 dark:hover:border-neutral-700">
                  <button 
                    onClick={() => setExpandedDayId(expandedDayId === day.id ? null : day.id)}
                    className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{day.dayName}</h3>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">Rutina: {day.routineDates}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">{day.exercises.length} Ejercicios</span>
                      {expandedDayId === day.id ? <ChevronUp className="w-5 h-5 text-gray-400 dark:text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-gray-400 dark:text-neutral-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedDayId === day.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-5 pt-0 border-t border-gray-100 dark:border-neutral-800 space-y-6 mt-4 transition-colors">
                          {day.exercises.map((ex: any) => (
                            <div key={ex.id} className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 mt-8 transition-colors">
                              <div className="flex justify-between items-start gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-2 mb-1.5">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4 rounded border-gray-300 dark:border-neutral-700 text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-neutral-900 cursor-pointer mt-1 shrink-0 transition-colors"
                                      checked={exerciseEdits[ex.id]?.isCompleted || false}
                                      onChange={(e) => handleExerciseChange(ex.id, 'isCompleted', e.target.checked)}
                                    />
                                    <h4 className={`font-bold text-base transition-colors leading-tight break-words ${exerciseEdits[ex.id]?.isCompleted ? 'text-gray-400 dark:text-neutral-500 line-through' : 'text-red-500 dark:text-white'}`}>{ex.name}</h4>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-gray-500 dark:text-neutral-400 pl-6">
                                    <span className="text-purple-600 dark:text-purple-400 break-words max-w-full">
                                      {ex.trackingType === 'TIME' ? 'Tiempo: ' : ex.trackingType === 'CIRCUIT' ? 'Circuito: ' : ex.trackingType === 'HIIT' ? 'Intervalos: ' : ''}{ex.sets_reps}
                                    </span>
                                    {ex.weight && (
                                      <>
                                        <span className="text-gray-300 dark:text-neutral-600">•</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 break-words max-w-full font-bold">
                                          {ex.trackingType === 'TIME' ? 'Intensidad: ' : ex.trackingType === 'CIRCUIT' ? 'Detalle de Carga: ' : ex.trackingType === 'HIIT' ? 'Carga/Intensidad: ' : 'Peso: '}{ex.weight}
                                        </span>
                                      </>
                                    )}
                                    <span className="text-gray-300 dark:text-neutral-600">•</span>
                                    <span className="break-words max-w-full">Descanso: {ex.rest}</span>
                                    {ex.observations && (
                                      <>
                                        <span className="text-gray-300 dark:text-neutral-600">•</span>
                                        <span className="break-words max-w-full text-xs italic text-gray-400">Obs: {ex.observations}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {ex.videoUrl && (
                                  <button 
                                    onClick={() => setSelectedVideoUrl(ex.videoUrl)}
                                    className="shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors mt-0.5">
                                    <PlaySquare className="w-3.5 h-3.5" /> Ver Video
                                  </button>
                                )}
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800 transition-colors">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-neutral-500 mb-2 uppercase tracking-wider">Registro de Series</label>
                                <div className="space-y-2 mb-3">
                                  {exerciseEdits[ex.id]?.loggedSets?.map((set: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <div className="w-8 flex-shrink-0 text-center text-xs font-bold text-gray-400 dark:text-neutral-500">
                                        #{idx + 1}
                                      </div>
                                      <div className="flex-1 flex gap-2">
                                        <div className="flex-1">
                                          <input 
                                            type={ex.trackingType === 'TIME' ? 'text' : 'number'} 
                                            placeholder={ex.trackingType === 'TIME' ? 'Duración (ej: 15m)' : 'Reps'}
                                            value={set.reps}
                                            onChange={(e) => updateSet(ex.id, idx, 'reps', e.target.value)}
                                            className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <input 
                                            type="text" 
                                            placeholder={ex.trackingType === 'TIME' ? 'Intensidad / Distancia' : 'Peso Usado (kg)'}
                                            value={set.weight}
                                            onChange={(e) => updateSet(ex.id, idx, 'weight', e.target.value)}
                                            className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
                                          />
                                        </div>
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => removeSet(ex.id, idx)}
                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                                        title="Eliminar serie"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => addSet(ex.id)}
                                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 mb-4 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  + Añadir Serie
                                </button>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 dark:text-neutral-500 mb-1">Feedback Privado (opcional)</label>
                                  <input 
                                    type="text" 
                                    placeholder="Ej: Costó la última serie"
                                    value={exerciseEdits[ex.id]?.observations || ""}
                                    onChange={(e) => handleExerciseChange(ex.id, 'observations', e.target.value)}
                                    className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button 
                              onClick={() => setCompletingDayId(day.id)}
                              className="w-full sm:flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/20"
                            >
                              <CheckCircle className="w-5 h-5" />
                              Marcar Día como Realizado
                            </button>
                            <button 
                              onClick={() => setSkippingDayId(day.id)}
                              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                              <Ban className="w-5 h-5 opacity-70" />
                              <span className="hidden sm:inline">No realicé esta clase</span>
                              <span className="sm:hidden">Omitir</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Historial de Rutinas Realizadas */}
        {(completedDays.length > 0 || skippedDays.length > 0) && (
          <section className="space-y-8">
            {completedDays.length > 0 && (
              <div>
                <div 
                  className="flex items-center justify-between mb-4 cursor-pointer select-none"
                  onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rutinas Realizadas</h2>
                  </div>
                  <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    {isHistoryExpanded ? <ChevronUp className="w-6 h-6 text-gray-500 dark:text-neutral-400" /> : <ChevronDown className="w-6 h-6 text-gray-500 dark:text-neutral-400" />}
                  </div>
                </div>
                
                <AnimatePresence initial={false}>
                  {isHistoryExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                  {completedDays.map((day) => (
                    <div key={day.id} className="bg-white dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden transition-all shadow-sm dark:shadow-none">
                      <button 
                        onClick={() => setExpandedCompletedDayId(expandedCompletedDayId === day.id ? null : day.id)}
                        className="w-full flex justify-between items-center p-4 text-left focus:outline-none hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-gray-900 dark:text-white">{day.dayName}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-gray-500 dark:text-neutral-400">Realizado el: {formatDateUTC(day.completedAt)}</p>
                              <div 
                                onClick={(e) => { e.stopPropagation(); setCompletionDate(day.completedAt.split('T')[0]); setEditingDateDayId(day.id); }}
                                className="p-1 text-gray-400 hover:text-blue-500 dark:text-neutral-500 dark:hover:text-blue-400 bg-gray-100 hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </div>
                        {expandedCompletedDayId === day.id ? <ChevronUp className="w-5 h-5 text-gray-400 dark:text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-gray-400 dark:text-neutral-500" />}
                      </button>

                      <AnimatePresence>
                        {expandedCompletedDayId === day.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="p-4 pt-0 border-t border-gray-100 dark:border-neutral-800/50 space-y-3 mt-2 transition-colors">
                              {day.exercises.map((ex: any) => (
                                <div key={ex.id} className="bg-gray-50 dark:bg-neutral-950/50 border border-gray-100 dark:border-neutral-800/50 rounded-lg p-3 text-sm transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                    {ex.isCompleted ? (
                                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-neutral-600 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-neutral-600 rounded-full"></div>
                                      </div>
                                    )}
                                    <h4 className={`font-bold ${ex.isCompleted ? 'text-gray-800 dark:text-neutral-300' : 'text-gray-500 dark:text-neutral-500'}`}>{ex.name}</h4>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-neutral-500 mb-2 pl-6">{ex.sets_reps}</p>
                                  {(() => {
                                    let parsedSets = [];
                                    try { if (ex.loggedSets) parsedSets = JSON.parse(ex.loggedSets); } catch(e) {}
                                    const hasOldWeight = !!ex.weight;
                                    const hasObs = !!ex.observations;
                                    const hasSets = parsedSets.length > 0;
                                    
                                    if (!hasOldWeight && !hasObs && !hasSets) {
                                      return <span className="text-xs text-gray-400 dark:text-neutral-600 italic mt-2 block pt-2 border-t border-gray-200 dark:border-neutral-800/50 transition-colors">Sin registro de series ni observaciones</span>;
                                    }

                                    return (
                                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-neutral-800/50 transition-colors">
                                        {hasSets && (
                                          <div className="mb-2 space-y-1">
                                            {parsedSets.map((s: any, i: number) => (
                                              <div key={i} className="text-xs text-gray-600 dark:text-neutral-400 flex gap-2">
                                                <span className="font-bold text-gray-400">Serie {i+1}:</span>
                                                <span>{s.reps || '-'} reps</span>
                                                <span className="text-gray-300 dark:text-neutral-700">|</span>
                                                <span>{s.weight || '-'} kg</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {!hasSets && hasOldWeight && <div className="text-xs text-gray-600 dark:text-neutral-400 mb-1"><span className="text-gray-400 dark:text-neutral-500 font-bold">Peso antiguo:</span> {ex.weight}</div>}
                                        {hasObs && <div className="text-xs text-gray-600 dark:text-neutral-400"><span className="text-gray-400 dark:text-neutral-500 font-bold">Obs:</span> {ex.observations}</div>}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {skippedDays.length > 0 && (
              <div>
                <div 
                  className="flex items-center justify-between mb-4 cursor-pointer select-none"
                  onClick={() => setIsSkippedExpanded(!isSkippedExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <Ban className="w-6 h-6 text-gray-500 dark:text-neutral-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Clases Omitidas</h2>
                  </div>
                  <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                    {isSkippedExpanded ? <ChevronUp className="w-6 h-6 text-gray-500 dark:text-neutral-400" /> : <ChevronDown className="w-6 h-6 text-gray-500 dark:text-neutral-400" />}
                  </div>
                </div>
                
                <AnimatePresence initial={false}>
                  {isSkippedExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                  {skippedDays.map((day) => (
                    <div key={day.id} className="bg-white dark:bg-neutral-900/40 border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors shadow-sm dark:shadow-none">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-500 dark:text-neutral-500">
                          <Ban className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-gray-700 dark:text-neutral-300">{day.dayName}</h3>
                          <p className="text-xs text-gray-500 dark:text-neutral-500 mt-0.5">{day.routineDates} • Marcado como no realizado</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRevertDay(day.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-medium rounded-lg text-sm transition-colors"
                      >
                        Revertir a Pendiente
                      </button>
                    </div>
                  ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        )}

        {/* Adherencia y Días Fallados */}
        {adherenceStats.adherence && adherenceStats.adherence.total > 0 && (
          <section className="space-y-4">
            <div 
              className="flex items-center justify-between mb-2 cursor-pointer select-none"
              onClick={() => setIsAdherenceExpanded(!isAdherenceExpanded)}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adherencia y Consistencia</h2>
              </div>
              <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                {isAdherenceExpanded ? <ChevronUp className="w-6 h-6 text-gray-500 dark:text-neutral-400" /> : <ChevronDown className="w-6 h-6 text-gray-500 dark:text-neutral-400" />}
              </div>
            </div>
            
            <AnimatePresence initial={false}>
              {isAdherenceExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                >
              {/* Gráfico de Torta - Adherencia General */}
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col items-center">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-4 w-full text-left">Tasa de Adherencia</h3>
                <div className="h-48 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completados', value: adherenceStats.adherence.completed },
                          { name: 'Omitidos', value: adherenceStats.adherence.skipped }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#10B981" /> {/* Emerald 500 */}
                        <Cell fill="#EF4444" /> {/* Red 500 */}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--tw-colors-neutral-900)' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{adherenceStats.adherence.percentage}%</span>
                    <span className="text-xs font-medium text-gray-500">Completado</span>
                  </div>
                </div>
                <div className="w-full flex justify-between px-4 mt-4 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Completados ({adherenceStats.adherence.completed})</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div>Omitidos ({adherenceStats.adherence.skipped})</div>
                </div>
              </div>

              {/* Gráfico de Barras - Días Fallados */}
              {adherenceStats.missedDaysOfWeek && adherenceStats.adherence.skipped > 0 && (
                <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-4">Días que sueles fallar</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={adherenceStats.missedDaysOfWeek} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                        <XAxis 
                          dataKey="name" 
                          tickFormatter={(val) => val.substring(0, 3)}
                          tick={{fontSize: 10}} 
                          stroke="#9CA3AF"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{fontSize: 10}} 
                          stroke="#9CA3AF"
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--tw-colors-neutral-900)' }}
                          itemStyle={{ color: '#EF4444', fontWeight: 'bold' }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#EF4444" 
                          radius={[4, 4, 0, 0]} 
                          name="Omitidos"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Progreso de Fuerza */}
        <section className="space-y-4">
          <div 
              className="flex items-center justify-between mb-2 cursor-pointer select-none"
              onClick={() => setIsProgressionExpanded(!isProgressionExpanded)}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tu Progreso de Fuerza</h2>
              </div>
              <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                {isProgressionExpanded ? <ChevronUp className="w-6 h-6 text-gray-500 dark:text-neutral-400" /> : <ChevronDown className="w-6 h-6 text-gray-500 dark:text-neutral-400" />}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isProgressionExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-sm transition-colors overflow-hidden"
                >
              {Object.keys(stats).length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-neutral-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aún no tienes suficientes datos de pesos registrados.</p>
                  <p className="text-xs mt-1">Registrá tus pesos al completar ejercicios para ver tu evolución aquí.</p>
                </div>
              ) : (
                <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">Seleccionar Ejercicio</label>
                <div className="relative">
                  <select
                    value={activeStatExercise || ""}
                    onChange={(e) => setActiveStatExercise(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  >
                    {Object.keys(stats).map(exName => (
                      <option key={exName} value={exName}>{exName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              {activeStatExercise && stats[activeStatExercise] && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats[activeStatExercise]} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(val) => formatDateUTC(val).substring(0, 5)} 
                        tick={{fontSize: 12}} 
                        stroke="#9CA3AF"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{fontSize: 12}} 
                        stroke="#9CA3AF"
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-neutral-900)' }}
                        itemStyle={{ color: '#60A5FA', fontWeight: 'bold' }}
                        labelFormatter={(val) => formatDateUTC(val)}
                        formatter={(value: any) => [`${value} kg`, 'Peso Máximo']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="maxWeight" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                        activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2, fill: "#fff" }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
                </>
              )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
      </main>

      {/* Overlay de Confirmación de Fecha de Completado */}
      <AnimatePresence>
        {completingDayId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setCompletingDayId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Día Completado!</h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">Selecciona qué día realizaste esta rutina.</p>
              
              <div className="w-full text-left mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">Fecha de realización</label>
                <input 
                  type="date" 
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>

              <div className="w-full flex gap-3">
                <button 
                  onClick={() => setCompletingDayId(null)}
                  className="flex-1 py-3 text-gray-500 dark:text-neutral-400 font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
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

      {/* Overlay de Confirmación de Omisión */}
      <AnimatePresence>
        {skippingDayId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setSkippingDayId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                <Ban className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Omitir clase?</h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">Esta clase no aparecerá más en tus pendientes. Podrás revertir esto más tarde si te equivocaste.</p>
              
              <div className="w-full flex gap-3">
                <button 
                  onClick={() => setSkippingDayId(null)}
                  className="flex-1 py-3 text-gray-500 dark:text-neutral-400 font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSkipDay}
                  disabled={saving}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overlay de Edición de Fecha */}
      <AnimatePresence>
        {editingDateDayId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setEditingDateDayId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Editar fecha</h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">Modifica el día en el que realizaste esta clase.</p>
              
              <div className="w-full text-left mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">Nueva fecha</label>
                <input 
                  type="date" 
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                />
              </div>

              <div className="w-full flex gap-3">
                <button 
                  onClick={() => setEditingDateDayId(null)}
                  className="flex-1 py-3 text-gray-500 dark:text-neutral-400 font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleEditDate}
                  disabled={saving}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Configuración */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-sm"
              onClick={() => !savingSettings && !uploadingImage && setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto flex flex-col transition-colors"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" /> Configuración de Perfil
                </h2>
                <button 
                  onClick={() => !savingSettings && !uploadingImage && setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  disabled={uploadingImage}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Foto de Perfil */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 flex items-center justify-center relative">
                      {settingsForm.profilePicture ? (
                        <img 
                          src={settingsForm.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                          onLoad={() => setUploadingImage(false)}
                          onError={() => setUploadingImage(false)}
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400 dark:text-neutral-600" />
                      )}
                      
                      <label className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white transition-opacity ${uploadingImage ? 'opacity-100 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100 cursor-pointer'}`}>
                        {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                        <span className="text-[10px] font-bold mt-1 uppercase">{uploadingImage ? 'Subiendo...' : 'Cambiar'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-neutral-500 font-medium">Toca para actualizar tu foto</p>
                </div>

                {/* Peso y Fecha Nacimiento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">Peso actual (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Ej. 75.5"
                      value={settingsForm.weight}
                      onChange={(e) => setSettingsForm({ ...settingsForm, weight: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">F. Nacimiento</label>
                    <input 
                      type="date" 
                      value={settingsForm.birthDate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, birthDate: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors color-scheme-dark"
                    />
                  </div>
                </div>

                {/* Objetivos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">Tus objetivos principales</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map(goal => {
                      const isSelected = settingsForm.goals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSettingsForm({ ...settingsForm, goals: settingsForm.goals.filter(g => g !== goal) });
                            } else {
                              setSettingsForm({ ...settingsForm, goals: [...settingsForm.goals, goal] });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                              : 'bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-400 hover:border-gray-400 dark:hover:border-neutral-500'
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Guardar */}
                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={savingSettings || uploadingImage}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cambios"}
                  </button>
                </div>
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
              className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedVideoUrl(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl aspect-video bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-2xl z-10 transition-colors"
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
