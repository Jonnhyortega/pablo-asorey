"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Calendar,
  Activity,
  Dumbbell,
  Wallet,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  PlaySquare,
  Loader2,
  Save,
  X,
  Ban,
  Edit2,
  Trash2,
  Settings,
  Upload,
  User,
  DollarSign,
  Menu,
  MessageSquare,
  Flame,
  Medal,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppShell, Badge, Button, Card, Dialog, StatTile, type NavItem } from "@/components/ui";
import { chartTheme, tooltipStyle } from "@/lib/chart-theme";
import StudentNotificationsBell from "./StudentNotificationsBell";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Escala de metales para niveles y medallas: bronce → plata → oro → oro macizo
const METAL = {
  bronze: "border-bronze/60 bg-bronze/10 text-bronze",
  silver: "border-silver/60 bg-silver/10 text-silver",
  gold: "border-gold bg-gold/10 text-gold",
  solid: "border-gold bg-gold text-bg",
};

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [expandedCompletedDayId, setExpandedCompletedDayId] = useState<
    string | null
  >(null);
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: string]: boolean }>({});
  const [exerciseEdits, setExerciseEdits] = useState<{
    [key: string]: {
      weight: string;
      observations: string;
      isCompleted: boolean;
      loggedSets?: any[];
    };
  }>({});

  // Navigation State
  const [activeView, setActiveView] = useState<
    "dashboard" | "upcoming" | "history" | "progress" | "support"
  >("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Overlay state
  const [completingDayId, setCompletingDayId] = useState<string | null>(null);
  const [skippingDayId, setSkippingDayId] = useState<string | null>(null);
  const [editingDateDayId, setEditingDateDayId] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [saving, setSaving] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // Stats State
  const [stats, setStats] = useState<
    Record<string, { date: string; maxWeight: number }[]>
  >({});
  const [activeStatExercise, setActiveStatExercise] = useState<string | null>(
    null,
  );
  const [adherenceStats, setAdherenceStats] = useState<{
    adherence: {
      completed: number;
      skipped: number;
      total: number;
      percentage: number;
    } | null;
    missedDaysOfWeek: { name: string; count: number }[] | null;
  }>({ adherence: null, missedDaysOfWeek: null });

  // Collapsible Sections State
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isSkippedExpanded, setIsSkippedExpanded] = useState(false);
  const [isAdherenceExpanded, setIsAdherenceExpanded] = useState(true);
  const [isProgressionExpanded, setIsProgressionExpanded] = useState(true);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [settingsForm, setSettingsForm] = useState<{
    weight: string;
    goals: string[];
    profilePicture: string;
    birthDate: string;
    selectedBadge: string;
  }>({ weight: "", goals: [], profilePicture: "", birthDate: "", selectedBadge: "" });

  const GOAL_OPTIONS = [
    "Pérdida de Grasa",
    "Aumento de Masa Muscular",
    "Aumento de Fuerza",
    "Mantenimiento",
    "Recomposición Corporal",
    "Salud y Bienestar General",
    "Rendimiento Deportivo",
    "Recuperación / Rehabilitación",
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
    } catch (e) {
      return url;
    }
  };

  const formatDateUTC = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const datePart =
        typeof dateString === "string"
          ? dateString.split("T")[0]
          : new Date(dateString).toISOString().split("T")[0];
      const [year, month, day] = datePart.split("-");
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
      localStorage.setItem(
        `student_edits_${student.id}`,
        JSON.stringify(exerciseEdits),
      );
    }
  }, [exerciseEdits, student]);

  // Prevent body scroll when any modal is open
  const isAnyModalOpen =
    showSettings ||
    completingDayId ||
    skippingDayId ||
    editingDateDayId ||
    selectedVideoUrl;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
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
        } catch (e) {}
      }

      data.routines.forEach((r: any) => {
        r.days.forEach((d: any) => {
          d.exercises.forEach((ex: any) => {
            const localEx = localEdits[ex.id];
            let parsedLoggedSets = [];
            try {
              if (localEx?.loggedSets) parsedLoggedSets = localEx.loggedSets;
              else if (ex.loggedSets)
                parsedLoggedSets = JSON.parse(ex.loggedSets);
            } catch (e) {}

            initialEdits[ex.id] = {
              weight:
                localEx?.weight !== undefined
                  ? localEx.weight
                  : ex.weight || "",
              observations:
                localEx?.observations !== undefined
                  ? localEx.observations
                  : ex.observations || "",
              isCompleted:
                localEx?.isCompleted !== undefined
                  ? localEx.isCompleted
                  : ex.isCompleted || false,
              loggedSets: parsedLoggedSets,
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
        if (
          statsData.weightProgression &&
          Object.keys(statsData.weightProgression).length > 0
        ) {
          setActiveStatExercise(Object.keys(statsData.weightProgression)[0]);
        }
        setAdherenceStats({
          adherence: statsData.adherence || null,
          missedDaysOfWeek: statsData.missedDaysOfWeek || null,
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
    document.cookie =
      "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const handleExerciseChange = (
    exId: string,
    field: "weight" | "observations" | "isCompleted",
    value: any,
  ) => {
    setExerciseEdits((prev) => ({
      ...prev,
      [exId]: { ...prev[exId], [field]: value },
    }));
  };

  const addSet = (exId: string) => {
    setExerciseEdits((prev) => {
      const currentSets = prev[exId]?.loggedSets || [];
      return {
        ...prev,
        [exId]: {
          ...prev[exId],
          loggedSets: [...currentSets, { reps: "", weight: "" }],
        },
      };
    });
  };

  const removeSet = (exId: string, index: number) => {
    setExerciseEdits((prev) => {
      const currentSets = prev[exId]?.loggedSets || [];
      return {
        ...prev,
        [exId]: {
          ...prev[exId],
          loggedSets: currentSets.filter((_, i) => i !== index),
        },
      };
    });
  };

  const updateSet = (
    exId: string,
    index: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    setExerciseEdits((prev) => {
      const currentSets = [...(prev[exId]?.loggedSets || [])];
      currentSets[index] = { ...currentSets[index], [field]: value };
      return {
        ...prev,
        [exId]: { ...prev[exId], loggedSets: currentSets },
      };
    });
  };

  const addDropToSet = (exId: string, setIndex: number) => {
    setExerciseEdits((prev) => {
      const currentSets = [...(prev[exId]?.loggedSets || [])];
      if (currentSets[setIndex] && currentSets[setIndex].drops) {
        currentSets[setIndex] = {
          ...currentSets[setIndex],
          drops: [...currentSets[setIndex].drops, { reps: "", weight: "" }],
        };
      }
      return { ...prev, [exId]: { ...prev[exId], loggedSets: currentSets } };
    });
  };

  const removeDropFromSet = (
    exId: string,
    setIndex: number,
    dropIndex: number,
  ) => {
    setExerciseEdits((prev) => {
      const currentSets = [...(prev[exId]?.loggedSets || [])];
      if (currentSets[setIndex] && currentSets[setIndex].drops) {
        currentSets[setIndex] = {
          ...currentSets[setIndex],
          drops: currentSets[setIndex].drops.filter(
            (_: any, i: number) => i !== dropIndex,
          ),
        };
      }
      return { ...prev, [exId]: { ...prev[exId], loggedSets: currentSets } };
    });
  };

  const updateDropInSet = (
    exId: string,
    setIndex: number,
    dropIndex: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    setExerciseEdits((prev) => {
      const currentSets = [...(prev[exId]?.loggedSets || [])];
      if (currentSets[setIndex] && currentSets[setIndex].drops) {
        const newDrops = [...currentSets[setIndex].drops];
        newDrops[dropIndex] = { ...newDrops[dropIndex], [field]: value };
        currentSets[setIndex] = {
          ...currentSets[setIndex],
          drops: newDrops,
        };
      }
      return { ...prev, [exId]: { ...prev[exId], loggedSets: currentSets } };
    });
  };

  const getHistoricalStatsForExercise = (exerciseName: string) => {
    const trimmedName = exerciseName.trim();
    if (!stats || !stats[trimmedName] || stats[trimmedName].length === 0)
      return null;
    const history = stats[trimmedName];
    // Como history ya viene ordenado por fecha de más antiguo a más reciente desde el backend
    const maxWeight = Math.max(...history.map((entry) => entry.maxWeight));
    const lastWeight = history[history.length - 1].maxWeight;
    return { maxWeight, lastWeight };
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
          loggedSets: exerciseEdits[ex.id]?.loggedSets
            ? JSON.stringify(exerciseEdits[ex.id].loggedSets)
            : "[]",
        }));

        // Clean localStorage if it's a success
        if (student) {
          const savedLocal = localStorage.getItem(
            `student_edits_${student.id}`,
          );
          if (savedLocal) {
            let localEdits = {};
            try {
              localEdits = JSON.parse(savedLocal);
            } catch (e) {}
            // Remove the exercises from this day
            day.exercises.forEach((ex: any) => {
              delete (localEdits as any)[ex.id];
            });
            localStorage.setItem(
              `student_edits_${student.id}`,
              JSON.stringify(localEdits),
            );
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
          exercises: exercisesToUpdate,
        }),
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
        body: JSON.stringify({ isSkipped: true, completedAt: completionDate }),
      });
      if (res.ok) {
        setSkippingDayId(null);
        fetchMe();
        toast.success("Día omitido");
      } else {
        toast.error("Error al omitir el día");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  const handleRevertDay = async (dayId: string) => {
    try {
      const res = await fetch(`/api/routines/days/${dayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSkipped: false, completedAt: null }),
      });
      if (res.ok) {
        fetchMe();
        toast.success("Día restaurado");
      } else {
        toast.error("Error al restaurar");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error");
    }
  };

  const handleEditDate = async () => {
    if (!editingDateDayId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/routines/days/${editingDateDayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: completionDate }),
      });
      if (res.ok) {
        setEditingDateDayId(null);
        fetchMe();
        toast.success("Fecha de completado actualizada");
      } else {
        toast.error("Error al actualizar la fecha");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    const UPLOAD_PRESET =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

    if (!CLOUD_NAME) {
      toast.error("Faltan configurar las variables de entorno de Cloudinary.");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (data.secure_url) {
        setSettingsForm((prev) => ({
          ...prev,
          profilePicture: data.secure_url,
        }));
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
        goals: settingsForm.goals.join(", "),
        profilePicture: settingsForm.profilePicture,
        selectedBadge: settingsForm.selectedBadge,
        birthDate: settingsForm.birthDate
          ? new Date(settingsForm.birthDate)
          : null,
      };
      const res = await fetch("/api/students/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const handlePaymentReport = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/students/me/payment-request", {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Pago reportado con éxito. En espera de confirmación.");
        fetchMe();
      } else {
        toast.error("Error al reportar pago");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div data-panel className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  if (!student)
    return (
      <div data-panel className="min-h-screen bg-bg flex items-center justify-center text-text">
        Estudiante no encontrado
      </div>
    );

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
      const dayWithRoutineInfo = {
        ...day,
        routineDates: `${formatDateUTC(routine.startDate)} al ${formatDateUTC(routine.endDate)}`,
      };
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
  completedDays.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  // Agrupar por semanas
  const groupedCompletedDays: Record<string, any[]> = {};
  completedDays.forEach((day) => {
    const d = new Date(day.completedAt);
    const dayOfWeek = d.getDay();
    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    const weekKey = `Semana del ${startOfWeek.toLocaleDateString()}`;
    if (!groupedCompletedDays[weekKey]) {
      groupedCompletedDays[weekKey] = [];
    }
    groupedCompletedDays[weekKey].push(day);
  });

  const toggleWeek = (week: string) => {
    setExpandedWeeks((prev) => ({ ...prev, [week]: !prev[week] }));
  };

  const currentLevel = student.level || 1;
  const levelBorderColor = currentLevel < 36 ? "border-bronze" : currentLevel < 108 ? "border-silver" : "border-gold";
  const levelTextColor = currentLevel < 36 ? "text-bronze" : currentLevel < 108 ? "text-silver" : "text-gold";

  const openSettings = () => {
    setSettingsForm({
      weight: student.weight || "",
      goals: student.goals
        ? student.goals.split(", ").filter(Boolean)
        : [],
      profilePicture: student.profilePicture || "",
      selectedBadge: student.selectedBadge || "",
      birthDate: student.birthDate
        ? student.birthDate.split("T")[0]
        : "",
    });
    setShowSettings(true);
  };

  const viewTitles: Record<typeof activeView, string> = {
    dashboard: "Resumen General",
    upcoming: "Próximos Entrenamientos",
    history: "Historial de Rutinas",
    progress: "Tus Progresos",
    support: "Soporte y Chat",
  };

  const studentNav: NavItem[] = [
    { label: "Resumen", icon: Activity, active: activeView === "dashboard", onSelect: () => setActiveView("dashboard") },
    { label: "Entrenamientos", icon: Calendar, active: activeView === "upcoming", onSelect: () => setActiveView("upcoming") },
    { label: "Historial", icon: CheckCircle, active: activeView === "history", onSelect: () => setActiveView("history") },
    { label: "Progresos", icon: Dumbbell, active: activeView === "progress", onSelect: () => setActiveView("progress") },
    { label: "Soporte", icon: MessageSquare, active: activeView === "support", onSelect: () => setActiveView("support") },
  ];

  const avatar = (
    <div className="relative shrink-0">
      {student.profilePicture ? (
        <img src={student.profilePicture} alt="Profile" className="h-11 w-11 rounded-full border border-gold-line object-cover" />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-line bg-surface-2 font-display text-lg text-gold">
          {student.name.charAt(0)}
        </div>
      )}
      {student.selectedBadge && (
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-bg bg-gold text-bg">
          <Medal className="h-3 w-3" />
        </span>
      )}
    </div>
  );

  return (
    <AppShell
      nav={studentNav}
      title={viewTitles[activeView]}
      mobileNav="bottom"
      sidebarTop={(collapsed) =>
        collapsed ? (
          <div className="flex justify-center">{avatar}</div>
        ) : (
          <div className="flex items-center gap-3">
            {avatar}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">Hola, {student.name.split(" ")[0]}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Atleta Activo</p>
            </div>
          </div>
        )
      }
      headerActions={
        <>
          <StudentNotificationsBell />
          <button onClick={openSettings} aria-label="Configuración" className="flex h-10 w-10 items-center justify-center rounded-panel text-muted transition-colors hover:bg-surface-2 hover:text-text">
            <Settings className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="hidden sm:block">
            <ThemeToggle isCollapsed />
          </div>
          <button onClick={handleLogout} aria-label="Cerrar Sesión" className="flex h-10 w-10 items-center justify-center rounded-panel text-muted transition-colors hover:bg-surface-2 hover:text-danger">
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </>
      }
      sidebarFooter={(collapsed) => <ThemeToggle isCollapsed={collapsed} />}
    >
          <div className="mx-auto w-full max-w-5xl space-y-8">
            {activeView === "dashboard" ? (
              <>
                {/* Próximo entrenamiento */}
                {(() => {
                  const nextDay = pendingDays[0] ?? null;
                  return (
                    <Card className="relative overflow-hidden border-gold-line">
                      <span className="pointer-events-none absolute -right-4 -top-6 select-none font-display text-[9rem] leading-none text-gold/[0.06]" aria-hidden>
                        {pendingDays.length}
                      </span>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Hoy toca</p>
                      {nextDay ? (
                        <>
                          <h2 className="mt-2 font-display text-4xl uppercase leading-none text-text md:text-5xl">{nextDay.dayName}</h2>
                          <p className="mt-2 text-sm text-muted">
                            {nextDay.exercises?.length ?? 0} ejercicios · {nextDay.routineDates}
                          </p>
                          <Button
                            variant="primary"
                            size="lg"
                            className="mt-6 w-full sm:w-auto"
                            onClick={() => {
                              setActiveView("upcoming");
                              setExpandedDayId(nextDay.id);
                            }}
                          >
                            Empezar entrenamiento
                          </Button>
                        </>
                      ) : (
                        <>
                          <h2 className="mt-2 font-display text-3xl uppercase leading-none text-text">Sin entrenamientos pendientes</h2>
                          <p className="mt-2 text-sm text-muted">Cuando el profe cargue tu próxima rutina la vas a ver acá.</p>
                        </>
                      )}
                    </Card>
                  );
                })()}

                {/* Resumen y Pagos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface border border-line rounded-panel p-5 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-5 h-5 text-gold" />
                      <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
                        Tus Datos
                      </h3>
                    </div>
                    <p className="font-display text-4xl leading-none tabular-nums">{student.weight} <span className="font-sans text-sm text-muted">kg</span></p>
                    <p className="text-sm text-muted mt-1">
                      Meta:{" "}
                      {student.goals.length > 30
                        ? student.goals.substring(0, 30) + "..."
                        : student.goals}
                    </p>
                  </div>

                  <div className="bg-surface border border-line rounded-panel p-5 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Wallet
                          className={`w-5 h-5 ${student.paymentStatus === "VERIFYING" ? "text-gold" : !student.paymentDate ? "text-gold" : new Date(student.paymentDate).setHours(23, 59, 59, 999) < new Date().getTime() ? "text-danger" : "text-success"}`}
                        />
                        <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
                          Estado de Cuota
                        </h3>
                      </div>
                      <p
                        className={`font-display text-3xl uppercase leading-none ${student.paymentStatus === "VERIFYING" ? "text-gold" : !student.paymentDate ? "text-gold" : new Date(student.paymentDate).setHours(23, 59, 59, 999) < new Date().getTime() ? "text-danger" : "text-success"}`}
                      >
                        {student.paymentStatus === "VERIFYING"
                          ? "En Verificación"
                          : !student.paymentDate
                            ? "Pendiente"
                            : new Date(student.paymentDate).setHours(
                                  23,
                                  59,
                                  59,
                                  999,
                                ) < new Date().getTime()
                              ? "Deuda"
                              : "Al Día"}
                      </p>
                      {student.paymentDate && (
                        <p className="text-sm text-muted mt-1">
                          Vence: {formatDateUTC(student.paymentDate)}
                        </p>
                      )}
                    </div>

                    {student.paymentStatus !== "VERIFYING" &&
                      (!student.paymentDate ||
                        new Date(student.paymentDate).setHours(
                          23,
                          59,
                          59,
                          999,
                        ) < new Date().getTime()) && (
                        <button
                          onClick={handlePaymentReport}
                          disabled={saving}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-panel border border-gold py-2.5 text-xs uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-bg"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <DollarSign className="w-4 h-4" />
                          )}
                          Ya pagué
                        </button>
                      )}

                    {student.paymentStatus === "VERIFYING" && (
                      <p className="mt-3 text-xs font-semibold text-gold bg-gold/10 py-2 px-3 rounded-panel text-center">
                        El profe está revisando tu pago
                      </p>
                    )}
                  </div>

                  <div className="bg-surface border border-line rounded-panel p-5 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-gold" />
                      <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">
                        Progreso
                      </h3>
                    </div>
                    <p className="font-display text-4xl leading-none tabular-nums">{completedDays.length}</p>
                    <p className="text-sm text-muted mt-1">
                      Sesiones completadas
                    </p>
                  </div>
                </div>

                {/* --- SECCIÓN DE GAMIFICACIÓN --- */}
                <div className="mt-8">
                  <h2 className="mb-4 font-display text-2xl uppercase text-text">Tu Progreso como Atleta</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Widget Nivel / XP */}
                    <Card className="relative overflow-hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className={`text-[11px] uppercase tracking-[0.2em] ${levelTextColor}`}>Nivel {student.level || 1}</p>
                          <h3 className="mt-2 flex items-center gap-2 font-display text-3xl uppercase leading-none text-text">
                            {(student.level || 1) < 36 ? "Principiante" : (student.level || 1) < 108 ? "Intermedio" : (student.level || 1) < 216 ? "Avanzado" : "Atleta"}
                            <button onClick={() => setShowXPModal(true)} className="rounded-full p-1 text-muted transition-colors hover:text-gold" title="Sistema de XP" aria-label="Sistema de XP">
                              <Info className="h-4 w-4" />
                            </button>
                          </h3>
                        </div>
                        <p className="shrink-0 font-display text-3xl leading-none tabular-nums text-text">
                          {student.xp || 0} <span className="font-sans text-xs text-gold">XP</span>
                        </p>
                      </div>
                      {/* Barra de progreso de XP (cada nivel son 100 XP) */}
                      <div className="mt-6 h-[3px] w-full bg-line">
                        <div className="h-full bg-gold transition-all duration-1000 ease-out" style={{ width: `${((student.xp || 0) % 100)}%` }} />
                      </div>
                      <p className="mt-2 text-right text-xs text-muted">{100 - ((student.xp || 0) % 100)} XP para Nivel {(student.level || 1) + 1}</p>
                    </Card>

                    {/* Widget Racha */}
                    <Card className="flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-panel border border-gold-line text-gold">
                            <Flame className="h-6 w-6" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Racha Actual</p>
                            <h3 className="mt-1 flex items-baseline gap-2 font-display text-3xl leading-none text-text">
                              {student.currentStreak || 0} <span className="font-sans text-sm text-muted">días</span>
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Récord</p>
                          <p className="mt-1 font-display text-xl text-text">{student.longestStreak || 0} días</p>
                        </div>
                      </div>
                      <p className="mt-auto border-t border-line pt-3 text-center text-xs text-muted">
                        Si pasas +4 días sin entrenar perderás tu racha
                      </p>
                    </Card>
                  </div>

                  {/* Vitrina de Medallas */}
                  <div className="mt-4 bg-surface border border-line rounded-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="flex items-center gap-2 font-display text-xl uppercase text-text">
                        <Medal className="h-5 w-5 text-gold" strokeWidth={1.5} /> Vitrina de Medallas
                      </h3>
                      <button onClick={() => setShowBadgesModal(true)} className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-muted transition-colors hover:text-gold">
                        <Info className="w-4 h-4" /> ¿Cómo ganar más?
                      </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                      {student.badges && student.badges.length > 0 ? (
                        (() => {
                          const renderBadges: any[] = [];
                          let bullCount = 0;
                          
                          // Primero agrupamos los toros
                          student.badges.forEach((b: any) => {
                            if (b.badgeId.startsWith("BULL_PROGRESS_") || b.badgeId === "STRENGTH_10KG") {
                              bullCount++;
                            } else {
                              renderBadges.push(b);
                            }
                          });

                          // Agregamos el toro agrupado si existe
                          if (bullCount > 0) {
                            renderBadges.push({ badgeId: "BULL_GROUPED", count: bullCount });
                          }

                          return renderBadges.map((badge: any, i: number) => {
                            const badgeData = badge.badgeId === "FIRST_WORKOUT" 
                              ? { name: "Primer Paso", color: METAL.bronze, shadow: "", icon: Medal }
                              : badge.badgeId === "STREAK_7"
                              ? { name: "Racha de Fuego", color: METAL.silver, shadow: "", icon: Flame }
                              : badge.badgeId === "CENTURION"
                              ? { name: "Centurión", color: METAL.gold, shadow: "", icon: Medal }
                              : badge.badgeId === "BULL_GROUPED"
                              ? { name: `Toro`, color: METAL.silver, shadow: "", icon: Dumbbell }
                              : badge.badgeId === "BEAST_MODE"
                              ? { name: "Bestia", color: METAL.gold, shadow: "", icon: Flame }
                              : badge.badgeId === "MUTANT_MODE"
                              ? { name: "Mutante", color: METAL.solid, shadow: "", icon: Dumbbell }
                              : { name: badge.badgeId, color: METAL.bronze, shadow: "", icon: Medal };

                            const Icon = badgeData.icon;

                            return (
                              <div key={i} className="flex flex-col items-center min-w-[90px] group">
                                <div className={`w-16 h-16 rounded-full border ${badgeData.color} flex items-center justify-center mb-3 transform transition-transform group-hover:scale-110 group-hover:-translate-y-1 relative`}>
                                  <Icon className="w-8 h-8" />
                                  {badge.badgeId === "BULL_GROUPED" && badge.count > 1 && (
                                    <div className="absolute -top-1 -right-1 bg-surface text-success text-[10px] font-semibold w-6 h-6 rounded-full flex items-center justify-center border-2 border-success/40">
                                      x{badge.count}
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-text text-center leading-tight">
                                  {badgeData.name}
                                </span>
                              </div>
                            );
                          });
                        })()
                      ) : (
                        <div className="text-center w-full bg-surface-2 rounded-panel border border-dashed border-line p-6">
                          <Medal className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
                          <p className="text-muted text-sm font-medium">Todavía no has obtenido medallas.</p>
                          <p className="text-muted text-xs mt-1">¡Completa tu primer entrenamiento para empezar tu colección!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* --- FIN GAMIFICACIÓN --- */}
              </>
            ) : activeView === "upcoming" ? (
              <>
                {/* Próximas Rutinas */}
                <section>
                  <div
                    className="flex items-center justify-between mb-4 cursor-pointer select-none"
                    onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-6 h-6 text-success" />
                      <h2 className="text-xl font-bold text-text">
                        Próximos Entrenamientos
                      </h2>
                    </div>
                    <div className="p-1 rounded-full hover:bg-surface-2 transition-colors">
                      {isUpcomingExpanded ? (
                        <ChevronUp className="w-6 h-6 text-muted" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-muted" />
                      )}
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
                          <div className="bg-surface border border-line rounded-panel p-8 text-center text-muted transition-colors">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No tienes rutinas pendientes. ¡Buen trabajo!</p>
                          </div>
                        ) : (
                          pendingDays.map((day) => (
                            <div
                              key={day.id}
                              className="bg-surface border border-line rounded-panel overflow-hidden transition-all"
                            >
                              <button
                                onClick={() =>
                                  setExpandedDayId(
                                    expandedDayId === day.id ? null : day.id,
                                  )
                                }
                                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                              >
                                <div>
                                  <h3 className="font-bold text-lg text-text">
                                    {day.dayName}
                                  </h3>
                                  <p className="text-xs text-muted mt-1">
                                    Rutina: {day.routineDates}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gold/10 text-gold">
                                    {day.exercises.length} Ejercicios
                                  </span>
                                  {expandedDayId === day.id ? (
                                    <ChevronUp className="w-5 h-5 text-muted" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-muted" />
                                  )}
                                </div>
                              </button>

                              <AnimatePresence>
                                {expandedDayId === day.id && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-5 pt-0 border-t border-line space-y-6 mt-4 transition-colors">
                                      {day.exercises.map((ex: any) => (
<div
                                          key={ex.id}
                                          className="bg-surface-2 border border-line rounded-panel p-4 mt-8 transition-colors"
                                        >
                                          <div className="flex justify-between items-start gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex flex-col mb-1.5">
                                                <label className="flex items-start gap-3 cursor-pointer group select-none">
                                                  <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                                                    <input
                                                      type="checkbox"
                                                      className="sr-only"
                                                      checked={
                                                        exerciseEdits[ex.id]?.isCompleted || false
                                                      }
                                                      onChange={(e) =>
                                                        handleExerciseChange(
                                                          ex.id,
                                                          "isCompleted",
                                                          e.target.checked,
                                                        )
                                                      }
                                                    />
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${exerciseEdits[ex.id]?.isCompleted ? "bg-success border-success/40 text-bg" : "border-line text-transparent group-hover:border-success/40"}`}>
                                                      <CheckCircle className="w-4 h-4" />
                                                    </div>
                                                  </div>
                                                  <h4
                                                    className={`font-bold text-base transition-colors leading-tight break-words pt-0.5 ${exerciseEdits[ex.id]?.isCompleted ? "text-muted line-through" : "text-text group-hover:text-gold"}`}
                                                  >
                                                    {ex.name}
                                                  </h4>
                                                </label>
                                                <div className="flex flex-col mt-2">
                                                  {(() => {
                                                    const hist =
                                                      getHistoricalStatsForExercise(
                                                        ex.name,
                                                      );
                                                    if (hist) {
                                                      return (
                                                        <div className="text-[10px] font-semibold mt-1 mb-0.5 flex flex-wrap items-center gap-2">
                                                          <span className="bg-gold/10 text-gold px-1.5 py-0.5 rounded">
                                                            Último:{" "}
                                                            {hist.lastWeight}kg
                                                          </span>
                                                          <span className="bg-success/10 text-success px-1.5 py-0.5 rounded">
                                                            Récord:{" "}
                                                            {hist.maxWeight}kg
                                                          </span>
                                                        </div>
                                                      );
                                                    }
                                                    return null;
                                                  })()}
                                                </div>
                                              </div>
                                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-muted pl-6">
                                                <span className="text-gold break-words max-w-full">
                                                  {ex.trackingType === "TIME"
                                                    ? "Tiempo: "
                                                    : ex.trackingType ===
                                                        "CIRCUIT"
                                                      ? "Circuito: "
                                                      : ex.trackingType ===
                                                          "HIIT"
                                                        ? "Intervalos: "
                                                        : ex.trackingType ===
                                                            "DROP_SET"
                                                          ? "Súper Serie/Drop: "
                                                          : ""}
                                                  {ex.sets_reps}
                                                </span>
                                                {ex.weight && (
                                                  <>
                                                    <span className="text-muted">
                                                      •
                                                    </span>
                                                    <span className="text-success break-words max-w-full font-bold">
                                                      {ex.trackingType ===
                                                      "TIME"
                                                        ? "Intensidad: "
                                                        : ex.trackingType ===
                                                            "CIRCUIT"
                                                          ? "Detalle de Carga: "
                                                          : ex.trackingType ===
                                                              "HIIT"
                                                            ? "Carga/Intensidad: "
                                                            : ex.trackingType ===
                                                                "DROP_SET"
                                                              ? "Cargas: "
                                                              : "Peso: "}
                                                      {ex.weight}
                                                    </span>
                                                  </>
                                                )}
                                                <span className="text-muted">
                                                  •
                                                </span>
                                                <span className="break-words max-w-full">
                                                  Descanso: {ex.rest}
                                                </span>
                                                {ex.observations && (
                                                  <>
                                                    <span className="text-muted">
                                                      •
                                                    </span>
                                                    <span className="break-words max-w-full text-xs italic text-muted">
                                                      Obs: {ex.observations}
                                                    </span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                            {ex.videoUrl && (
                                              <button
                                                onClick={() =>
                                                  setSelectedVideoUrl(
                                                    ex.videoUrl,
                                                  )
                                                }
                                                className="shrink-0 flex items-center gap-1.5 border border-line px-2.5 py-1.5 rounded-panel text-xs text-muted transition-colors hover:border-gold hover:text-gold mt-0.5"
                                              >
                                                <PlaySquare className="w-3.5 h-3.5" />{" "}
                                                Ver Video
                                              </button>
                                            )}
                                          </div>

                                          <div className="mt-4 pt-4 border-t border-line transition-colors">
                                            <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">
                                              Registro de Series
                                            </label>
                                            <div className="space-y-3 mb-3">
                                              {exerciseEdits[
                                                ex.id
                                              ]?.loggedSets?.map(
                                                (set: any, idx: number) => (
                                                  <div
                                                    key={idx}
                                                    className={`flex flex-col gap-2 ${set.drops ? "bg-surface-2 p-3 rounded-panel border border-line" : "flex-row items-center"}`}
                                                  >
                                                    <div
                                                      className={`${set.drops ? "w-full text-left mb-1 text-sm" : "w-8 text-center text-xs"} flex-shrink-0 font-bold text-muted`}
                                                    >
                                                      {set.drops
                                                        ? `Serie #${idx + 1}`
                                                        : `#${idx + 1}`}
                                                    </div>

                                                    {set.drops ? (
                                                      <div className="flex flex-col gap-2 w-full">
                                                        {set.drops.map(
                                                          (
                                                            drop: any,
                                                            dIdx: number,
                                                          ) => (
                                                            <div
                                                              key={dIdx}
                                                              className="flex items-center gap-2 w-full"
                                                            >
                                                              <div className="w-5 text-center text-[10px] font-bold text-gold flex-shrink-0">
                                                                D{dIdx + 1}
                                                              </div>
                                                              <div className="flex-1 flex gap-2">
                                                                <div className="flex-1">
                                                                  <input
                                                                    type="number"
                                                                    inputMode="numeric"
                                                                    placeholder="Reps"
                                                                    value={
                                                                      drop.reps
                                                                    }
                                                                    onChange={(
                                                                      e,
                                                                    ) =>
                                                                      updateDropInSet(
                                                                        ex.id,
                                                                        idx,
                                                                        dIdx,
                                                                        "reps",
                                                                        e.target
                                                                          .value,
                                                                      )
                                                                    }
                                                                    className="h-11 w-full rounded-panel border border-line bg-bg px-2 text-base text-text outline-none transition-colors placeholder:text-muted focus:border-gold sm:text-sm"
                                                                  />
                                                                </div>
                                                                <div className="flex-1">
                                                                  <input
                                                                    type="text"
                                                                    placeholder="Peso"
                                                                    value={
                                                                      drop.weight
                                                                    }
                                                                    onChange={(
                                                                      e,
                                                                    ) =>
                                                                      updateDropInSet(
                                                                        ex.id,
                                                                        idx,
                                                                        dIdx,
                                                                        "weight",
                                                                        e.target
                                                                          .value,
                                                                      )
                                                                    }
                                                                    className="h-11 w-full rounded-panel border border-line bg-bg px-2 text-base text-text outline-none transition-colors placeholder:text-muted focus:border-gold sm:text-sm"
                                                                  />
                                                                </div>
                                                              </div>
                                                              <button
                                                                type="button"
                                                                onClick={() =>
                                                                  removeDropFromSet(
                                                                    ex.id,
                                                                    idx,
                                                                    dIdx,
                                                                  )
                                                                }
                                                                className="p-1.5 text-danger hover:bg-danger/10 rounded-panel transition-colors shrink-0"
                                                                title="Eliminar Drop"
                                                              >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                              </button>
                                                            </div>
                                                          ),
                                                        )}
                                                        <div className="flex justify-between items-center mt-1">
                                                          <button
                                                            type="button"
                                                            onClick={() =>
                                                              addDropToSet(
                                                                ex.id,
                                                                idx,
                                                              )
                                                            }
                                                            className="text-xs font-semibold text-gold hover:brightness-125 flex items-center gap-1 transition-colors"
                                                          >
                                                            + Añadir Drop
                                                          </button>
                                                          <button
                                                            type="button"
                                                            onClick={() =>
                                                              removeSet(
                                                                ex.id,
                                                                idx,
                                                              )
                                                            }
                                                            className="text-xs text-danger transition-colors"
                                                          >
                                                            Eliminar Serie
                                                            Completa
                                                          </button>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <>
                                                        <div className="flex-1 flex gap-2">
                                                          <div className="flex-1">
                                                            <input
                                                              type={
                                                                ex.trackingType ===
                                                                "TIME"
                                                                  ? "text"
                                                                  : "number"
                                                              }
                                                              placeholder={
                                                                ex.trackingType ===
                                                                "TIME"
                                                                  ? "Duración (ej: 15m)"
                                                                  : "Reps"
                                                              }
                                                              value={set.reps}
                                                              onChange={(e) =>
                                                                updateSet(
                                                                  ex.id,
                                                                  idx,
                                                                  "reps",
                                                                  e.target
                                                                    .value,
                                                                )
                                                              }
                                                              className="h-11 w-full rounded-panel border border-line bg-bg px-3 text-base text-text outline-none transition-colors placeholder:text-muted focus:border-gold sm:text-sm"
                                                            />
                                                          </div>
                                                          <div className="flex-1">
                                                            <input
                                                              type="text"
                                                              placeholder={
                                                                ex.trackingType ===
                                                                "TIME"
                                                                  ? "Intensidad / Distancia"
                                                                  : "Peso Usado (kg)"
                                                              }
                                                              value={set.weight}
                                                              onChange={(e) =>
                                                                updateSet(
                                                                  ex.id,
                                                                  idx,
                                                                  "weight",
                                                                  e.target
                                                                    .value,
                                                                )
                                                              }
                                                              className="h-11 w-full rounded-panel border border-line bg-bg px-3 text-base text-text outline-none transition-colors placeholder:text-muted focus:border-gold sm:text-sm"
                                                            />
                                                          </div>
                                                        </div>
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            removeSet(
                                                              ex.id,
                                                              idx,
                                                            )
                                                          }
                                                          className="p-2 text-danger hover:bg-danger/10 rounded-panel transition-colors shrink-0"
                                                          title="Eliminar serie"
                                                        >
                                                          <Trash2 className="w-4 h-4" />
                                                        </button>
                                                      </>
                                                    )}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (
                                                  ex.trackingType === "DROP_SET"
                                                ) {
                                                  setExerciseEdits((prev) => {
                                                    const currentSets =
                                                      prev[ex.id]?.loggedSets ||
                                                      [];
                                                    return {
                                                      ...prev,
                                                      [ex.id]: {
                                                        ...prev[ex.id],
                                                        loggedSets: [
                                                          ...currentSets,
                                                          {
                                                            drops: [
                                                              {
                                                                reps: "",
                                                                weight: "",
                                                              },
                                                              {
                                                                reps: "",
                                                                weight: "",
                                                              },
                                                            ],
                                                          },
                                                        ],
                                                      },
                                                    };
                                                  });
                                                } else {
                                                  addSet(ex.id);
                                                }
                                              }}
                                              className="text-xs font-semibold text-success flex items-center gap-1 mb-4 bg-success/10 px-3 py-1.5 rounded-panel transition-colors"
                                            >
                                              + Añadir Serie
                                            </button>

                                            <div>
                                              <label className="block text-xs font-medium text-muted mb-1">
                                                Feedback Privado (opcional)
                                              </label>
                                              <input
                                                type="text"
                                                placeholder="Ej: Costó la última serie"
                                                value={
                                                  exerciseEdits[ex.id]
                                                    ?.observations || ""
                                                }
                                                onChange={(e) =>
                                                  handleExerciseChange(
                                                    ex.id,
                                                    "observations",
                                                    e.target.value,
                                                  )
                                                }
                                                className="h-11 w-full rounded-panel border border-line bg-bg px-3 text-base text-text outline-none transition-colors placeholder:text-muted focus:border-gold sm:text-sm"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                        <button
                                          onClick={() =>
                                            setCompletingDayId(day.id)
                                          }
                                          className="flex h-14 w-full items-center justify-center gap-2 rounded-panel bg-gold text-sm font-medium uppercase tracking-[0.15em] text-bg transition-all hover:brightness-110 sm:flex-1"
                                        >
                                          <CheckCircle className="w-5 h-5" />
                                          Marcar Día como Realizado
                                        </button>
                                        <button
                                          onClick={() =>
                                            setSkippingDayId(day.id)
                                          }
                                          className="flex h-14 w-full items-center justify-center gap-2 rounded-panel border border-line px-6 text-sm uppercase tracking-[0.15em] text-muted transition-colors hover:text-text sm:w-auto"
                                        >
                                          <Ban className="w-5 h-5 opacity-70" />
                                          <span className="hidden sm:inline">
                                            No realicé esta clase
                                          </span>
                                          <span className="sm:hidden">
                                            Omitir
                                          </span>
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
              </>
            ) : activeView === "history" ? (
              <>
                {/* Historial de Rutinas Realizadas */}
                {(completedDays.length > 0 || skippedDays.length > 0) && (
                  <section className="space-y-8">
                    {completedDays.length > 0 && (
                      <div>
                        <div
                          className="flex items-center justify-between mb-4 cursor-pointer select-none"
                          onClick={() =>
                            setIsHistoryExpanded(!isHistoryExpanded)
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-gold" />
                            <h2 className="text-xl font-bold text-text">
                              Rutinas Realizadas
                            </h2>
                          </div>
                          <div className="p-1 rounded-full hover:bg-surface-2 transition-colors">
                            {isHistoryExpanded ? (
                              <ChevronUp className="w-6 h-6 text-muted" />
                            ) : (
                              <ChevronDown className="w-6 h-6 text-muted" />
                            )}
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
                              {Object.entries(groupedCompletedDays).map(([week, daysInWeek]) => (
                                <div key={week} className="border border-line rounded-panel overflow-hidden mb-4">
                                  <div 
                                    className="bg-surface-2 px-4 py-3 flex items-center justify-between cursor-pointer select-none"
                                    onClick={() => toggleWeek(week)}
                                  >
                                    <h3 className="font-bold text-text">{week}</h3>
                                    <div className="p-1 rounded-full hover:bg-line transition-colors">
                                      {expandedWeeks[week] ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
                                    </div>
                                  </div>
                                  <AnimatePresence initial={false}>
                                    {expandedWeeks[week] && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-surface"
                                      >
                                        <div className="p-4 space-y-4">
                                          {daysInWeek.map((day) => (
                                <div
                                  key={day.id}
                                  className="bg-surface border border-line rounded-panel overflow-hidden transition-all"
                                >
                                  <button
                                    onClick={() =>
                                      setExpandedCompletedDayId(
                                        expandedCompletedDayId === day.id
                                          ? null
                                          : day.id,
                                      )
                                    }
                                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none hover:bg-surface-2 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                                        <CheckCircle className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-base text-text">
                                          {day.dayName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <p className="text-xs text-muted">
                                            Realizado el:{" "}
                                            {formatDateUTC(day.completedAt)}
                                          </p>
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setCompletionDate(
                                                day.completedAt.split("T")[0],
                                              );
                                              setEditingDateDayId(day.id);
                                            }}
                                            className="p-1 text-muted hover:text-gold bg-surface-2 hover:bg-gold/10 rounded transition-colors cursor-pointer"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {expandedCompletedDayId === day.id ? (
                                      <ChevronUp className="w-5 h-5 text-muted" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-muted" />
                                    )}
                                  </button>

                                  <AnimatePresence>
                                    {expandedCompletedDayId === day.id && (
                                      <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="p-4 pt-0 border-t border-line space-y-3 mt-2 transition-colors">
                                          {day.exercises.map((ex: any) => (
                                            <div
                                              key={ex.id}
                                              className="bg-surface-2 border border-line rounded-panel p-3 text-sm transition-colors"
                                            >
                                              <div className="flex items-center gap-2 mb-1">
                                                {ex.isCompleted ? (
                                                  <CheckCircle className="w-4 h-4 text-success" />
                                                ) : (
                                                  <div className="w-4 h-4 rounded-full border-2 border-line flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-surface-2 rounded-full"></div>
                                                  </div>
                                                )}
                                                <h4
                                                  className={`font-bold ${ex.isCompleted ? "text-text" : "text-muted"}`}
                                                >
                                                  {ex.name}
                                                </h4>
                                              </div>
                                              <p className="text-xs text-muted mb-2 pl-6">
                                                {ex.sets_reps}
                                              </p>
                                              {(() => {
                                                let parsedSets = [];
                                                try {
                                                  if (ex.loggedSets)
                                                    parsedSets = JSON.parse(
                                                      ex.loggedSets,
                                                    );
                                                } catch (e) {}
                                                const hasOldWeight =
                                                  !!ex.weight;
                                                const hasObs =
                                                  !!ex.observations;
                                                const hasSets =
                                                  parsedSets.length > 0;

                                                if (
                                                  !hasOldWeight &&
                                                  !hasObs &&
                                                  !hasSets
                                                ) {
                                                  return (
                                                    <span className="text-xs text-muted italic mt-2 block pt-2 border-t border-line transition-colors">
                                                      Sin registro de series ni
                                                      observaciones
                                                    </span>
                                                  );
                                                }

                                                return (
                                                  <div className="mt-2 pt-2 border-t border-line transition-colors">
                                                    {hasSets && (
                                                      <div className="mb-2 space-y-1">
                                                        {parsedSets.map(
                                                          (
                                                            s: any,
                                                            i: number,
                                                          ) => (
                                                            <div
                                                              key={i}
                                                              className="text-xs text-muted flex gap-2"
                                                            >
                                                              <span className="font-bold text-muted">
                                                                Serie {i + 1}:
                                                              </span>
                                                              <span>
                                                                {s.reps || "-"}{" "}
                                                                reps
                                                              </span>
                                                              <span className="text-muted">
                                                                |
                                                              </span>
                                                              <span>
                                                                {s.weight ||
                                                                  "-"}{" "}
                                                                kg
                                                              </span>
                                                            </div>
                                                          ),
                                                        )}
                                                      </div>
                                                    )}
                                                    {!hasSets &&
                                                      hasOldWeight && (
                                                        <div className="text-xs text-muted mb-1">
                                                          <span className="text-muted font-bold">
                                                            Peso antiguo:
                                                          </span>{" "}
                                                          {ex.weight}
                                                        </div>
                                                      )}
                                                    {hasObs && (
                                                      <div className="text-xs text-muted">
                                                        <span className="text-muted font-bold">
                                                          Obs:
                                                        </span>{" "}
                                                        {ex.observations}
                                                      </div>
                                                    )}
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
                          onClick={() =>
                            setIsSkippedExpanded(!isSkippedExpanded)
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Ban className="w-6 h-6 text-muted" />
                            <h2 className="text-xl font-bold text-text">
                              Clases Omitidas
                            </h2>
                          </div>
                          <div className="p-1 rounded-full hover:bg-surface-2 transition-colors">
                            {isSkippedExpanded ? (
                              <ChevronUp className="w-6 h-6 text-muted" />
                            ) : (
                              <ChevronDown className="w-6 h-6 text-muted" />
                            )}
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
                                <div
                                  key={day.id}
                                  className="bg-surface border border-dashed border-line rounded-panel p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-muted">
                                      <Ban className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-base text-text">
                                        {day.dayName}
                                      </h3>
                                      <p className="text-xs text-muted mt-0.5">
                                        {day.routineDates} • Marcado como no
                                        realizado
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRevertDay(day.id)}
                                    className="w-full sm:w-auto px-4 py-2 bg-surface-2 hover:bg-line text-text font-medium rounded-panel text-sm transition-colors"
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
              </>
            ) : activeView === "progress" ? (
              <>
                {/* Adherencia y Días Fallados */}
                {adherenceStats.adherence &&
                  adherenceStats.adherence.total > 0 && (
                    <section className="space-y-4">
                      <div
                        className="flex items-center justify-between mb-2 cursor-pointer select-none"
                        onClick={() =>
                          setIsAdherenceExpanded(!isAdherenceExpanded)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Activity className="w-6 h-6 text-gold" />
                          <h2 className="text-xl font-bold text-text">
                            Adherencia y Consistencia
                          </h2>
                        </div>
                        <div className="p-1 rounded-full hover:bg-surface-2 transition-colors">
                          {isAdherenceExpanded ? (
                            <ChevronUp className="w-6 h-6 text-muted" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-muted" />
                          )}
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
                            <div className="bg-surface border border-line rounded-panel p-4 sm:p-6 flex flex-col items-center">
                              <h3 className="text-sm font-semibold text-text mb-4 w-full text-left">
                                Tasa de Adherencia
                              </h3>
                              <div className="h-48 w-full relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={[
                                        {
                                          name: "Completados",
                                          value:
                                            adherenceStats.adherence.completed,
                                        },
                                        {
                                          name: "Omitidos",
                                          value:
                                            adherenceStats.adherence.skipped,
                                        },
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                      stroke="none"
                                    >
                                      <Cell fill="var(--gold)" />
                                      {/* Emerald 500 */}
                                      <Cell fill="var(--line)" />
                                    </Pie>
                                    <Tooltip
                                      contentStyle={{
                                        borderRadius: "6px",
                                        border: "1px solid var(--line)",
                                        backgroundColor:
                                          "var(--surface)",
                                      }}
                                      itemStyle={{
                                        color: "var(--text)",
                                        fontWeight: "bold",
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                  <span className="font-display text-4xl leading-none text-text">
                                    {adherenceStats.adherence.percentage}%
                                  </span>
                                  <span className="text-xs font-medium text-muted">
                                    Completado
                                  </span>
                                </div>
                              </div>
                              <div className="w-full flex justify-between px-4 mt-4 text-xs font-medium text-muted">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-success"></div>
                                  Completados (
                                  {adherenceStats.adherence.completed})
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-danger"></div>
                                  Omitidos ({adherenceStats.adherence.skipped})
                                </div>
                              </div>
                            </div>

                            {/* Gráfico de Barras - Días Fallados */}
                            {adherenceStats.missedDaysOfWeek &&
                              adherenceStats.adherence.skipped > 0 && (
                                <div className="bg-surface border border-line rounded-panel p-4 sm:p-6">
                                  <h3 className="text-sm font-semibold text-text mb-4">
                                    Días que sueles fallar
                                  </h3>
                                  <div className="h-48 w-full">
                                    <ResponsiveContainer
                                      width="100%"
                                      height="100%"
                                    >
                                      <BarChart
                                        data={adherenceStats.missedDaysOfWeek}
                                        margin={{
                                          top: 10,
                                          right: 10,
                                          left: -25,
                                          bottom: 0,
                                        }}
                                      >
                                        <CartesianGrid
                                          strokeDasharray="3 3"
                                          vertical={false}
                                          stroke="var(--line)"
                                          opacity={0.2}
                                        />
                                        <XAxis
                                          dataKey="name"
                                          tickFormatter={(val) =>
                                            val.substring(0, 3)
                                          }
                                          tick={{ fontSize: 10 }}
                                          stroke="var(--muted)"
                                          axisLine={false}
                                          tickLine={false}
                                        />
                                        <YAxis
                                          tick={{ fontSize: 10 }}
                                          stroke="var(--muted)"
                                          axisLine={false}
                                          tickLine={false}
                                          allowDecimals={false}
                                        />
                                        <Tooltip
                                          contentStyle={{
                                            borderRadius: "6px",
                                            border: "none",
                                            backgroundColor:
                                              "var(--surface)",
                                          }}
                                          itemStyle={{
                                            color: "var(--danger)",
                                            fontWeight: "bold",
                                          }}
                                          cursor={{ fill: "transparent" }}
                                        />
                                        <Bar
                                          dataKey="count"
                                          fill="var(--muted)"
                                          radius={[2, 2, 0, 0]}
                                          name="Omitidos"
                                        >
                                          {adherenceStats.missedDaysOfWeek.map((d: { name: string; count: number }) => (
                                            <Cell
                                              key={d.name}
                                              fill={d.count > 0 && d.count === Math.max(...adherenceStats.missedDaysOfWeek!.map((x: { count: number }) => x.count)) ? "var(--danger)" : "var(--muted)"}
                                            />
                                          ))}
                                        </Bar>
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
                    onClick={() =>
                      setIsProgressionExpanded(!isProgressionExpanded)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Activity className="w-6 h-6 text-gold" />
                      <h2 className="text-xl font-bold text-text">
                        Tu Progreso de Fuerza
                      </h2>
                    </div>
                    <div className="p-1 rounded-full hover:bg-surface-2 transition-colors">
                      {isProgressionExpanded ? (
                        <ChevronUp className="w-6 h-6 text-muted" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-muted" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isProgressionExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-surface border border-line rounded-panel p-4 sm:p-6 transition-colors overflow-hidden"
                      >
                        {Object.keys(stats).length === 0 ? (
                          <div className="py-8 text-center text-muted">
                            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>
                              Aún no tienes suficientes datos de pesos
                              registrados.
                            </p>
                            <p className="text-xs mt-1">
                              Registrá tus pesos al completar ejercicios para
                              ver tu evolución aquí.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-text mb-2">
                                Seleccionar Ejercicio
                              </label>
                              <div className="relative">
                                <select
                                  value={activeStatExercise || ""}
                                  onChange={(e) =>
                                    setActiveStatExercise(e.target.value)
                                  }
                                  className="w-full appearance-none bg-surface-2 border border-line rounded-panel px-4 py-3 pr-10 text-text focus:ring-2 focus:ring-gold outline-none transition-colors"
                                >
                                  {Object.keys(stats).map((exName) => (
                                    <option key={exName} value={exName}>
                                      {exName}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                              </div>
                            </div>

                            {activeStatExercise &&
                              stats[activeStatExercise] && (
                                <div className="h-64 w-full">
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                  >
                                    <LineChart
                                      data={stats[activeStatExercise]}
                                      margin={{
                                        top: 5,
                                        right: 10,
                                        left: -20,
                                        bottom: 5,
                                      }}
                                    >
                                      <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="var(--line)"
                                        opacity={0.2}
                                      />
                                      <XAxis
                                        dataKey="date"
                                        tickFormatter={(val) =>
                                          formatDateUTC(val).substring(0, 5)
                                        }
                                        tick={{ fontSize: 12 }}
                                        stroke="var(--muted)"
                                        axisLine={false}
                                        tickLine={false}
                                      />
                                      <YAxis
                                        tick={{ fontSize: 12 }}
                                        stroke="var(--muted)"
                                        axisLine={false}
                                        tickLine={false}
                                      />
                                      <Tooltip
                                        contentStyle={{
                                          borderRadius: "6px",
                                          border: "none",
                                          boxShadow:
                                            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                                          backgroundColor:
                                            "var(--surface)",
                                        }}
                                        itemStyle={{
                                          color: "var(--gold)",
                                          fontWeight: "bold",
                                        }}
                                        labelFormatter={(val) =>
                                          formatDateUTC(val)
                                        }
                                        formatter={(value: any) => [
                                          `${value} kg`,
                                          "Peso Máximo",
                                        ]}
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="maxWeight"
                                        stroke="var(--gold)"
                                        strokeWidth={3}
                                        dot={{
                                          r: 4,
                                          strokeWidth: 2,
                                          fill: "var(--bg)",
                                        }}
                                        activeDot={{
                                          r: 6,
                                          stroke: "var(--gold)",
                                          strokeWidth: 2,
                                          fill: "var(--bg)",
                                        }}
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
              </>
            ) : activeView === "support" ? (
              <div className="bg-surface border border-line rounded-panel p-8 text-center">
                <MessageSquare className="w-16 h-16 text-gold mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl font-bold text-text mb-2">
                  Soporte y Chat
                </h2>
                <p className="text-muted max-w-md mx-auto mb-6">
                  Contactar por whatsapp directo al desarrollador de esta aplicacion en caso de urgencias, sugerencias o dudas.
                </p>
                <a 
                  href="https://wa.me/5491176513862" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:brightness-110 text-bg font-bold rounded-panel transition-colors mx-auto"
                >
                  <MessageSquare className="w-5 h-5" />
                  Whatsapp: +54 9 11 7651-3862
                </a>
              </div>
            ) : null}
          </div>

      {/* Overlay de Confirmación de Fecha de Completado */}
      <AnimatePresence>
        {completingDayId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setCompletingDayId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface border border-line rounded-panel w-full max-w-sm p-6 flex flex-col items-center text-center transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-text mb-2">
                ¡Día Completado!
              </h2>
              <p className="text-sm text-muted mb-6">
                Selecciona qué día realizaste esta rutina.
              </p>

              <div className="w-full text-left mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  Fecha de realización
                </label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full bg-surface-2 border border-line rounded-panel px-4 py-3 text-text focus:border-gold outline-none transition-colors"
                />
              </div>

              <div className="w-full flex gap-3">
                <button
                  onClick={() => setCompletingDayId(null)}
                  className="flex-1 py-3 text-muted font-medium hover:bg-surface-2 rounded-panel transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCompleteDay}
                  disabled={saving}
                  className="flex-1 py-3 bg-success hover:brightness-110 text-bg font-bold rounded-panel transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirmar"
                  )}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setSkippingDayId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface border border-line rounded-panel w-full max-w-sm p-6 flex flex-col items-center text-center transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
                <Ban className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-text mb-2">
                ¿Omitir clase?
              </h2>
              <p className="text-sm text-muted mb-6">
                Esta clase no aparecerá más en tus pendientes. Podrás revertir
                esto más tarde si te equivocaste.
              </p>

              <div className="w-full text-left mb-6">
                <label className="block text-sm font-semibold text-text mb-2">
                  ¿Qué día te tocaba realizarla?
                </label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full p-3 bg-surface-2 border border-line rounded-panel focus:ring-2 focus:ring-danger font-medium text-text outline-none"
                />
              </div>

              <div className="w-full flex gap-3">
                <button
                  onClick={() => setSkippingDayId(null)}
                  className="flex-1 py-3 text-muted font-medium hover:bg-surface-2 rounded-panel transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSkipDay}
                  disabled={saving}
                  className="flex-1 py-3 bg-danger hover:brightness-110 text-bg font-bold rounded-panel transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirmar"
                  )}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setEditingDateDayId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface border border-line rounded-panel w-full max-w-sm p-6 flex flex-col items-center text-center transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-text mb-2">
                Editar fecha
              </h2>
              <p className="text-sm text-muted mb-6">
                Modifica el día en el que realizaste esta clase.
              </p>

              <div className="w-full text-left mb-6">
                <label className="block text-sm font-medium text-text mb-2">
                  Nueva fecha
                </label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full bg-surface-2 border border-line rounded-panel px-4 py-3 text-text focus:ring-2 focus:ring-gold outline-none transition-colors"
                />
              </div>

              <div className="w-full flex gap-3">
                <button
                  onClick={() => setEditingDateDayId(null)}
                  className="flex-1 py-3 text-muted font-medium hover:bg-surface-2 rounded-panel transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditDate}
                  disabled={saving}
                  className="flex-1 py-3 bg-gold hover:brightness-110 text-bg font-bold rounded-panel transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Guardar"
                  )}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() =>
                !savingSettings && !uploadingImage && setShowSettings(false)
              }
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface border border-line rounded-panel w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto flex flex-col transition-colors"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gold" /> Configuración
                  de Perfil
                </h2>
                <button
                  onClick={() =>
                    !savingSettings && !uploadingImage && setShowSettings(false)
                  }
                  className="p-2 text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors disabled:opacity-50"
                  disabled={uploadingImage}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Foto de Perfil */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer">
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${levelBorderColor} bg-surface-2 flex items-center justify-center relative`}>
                      {settingsForm.profilePicture ? (
                        <img
                          src={settingsForm.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onLoad={() => setUploadingImage(false)}
                          onError={() => setUploadingImage(false)}
                        />
                      ) : (
                        <User className="w-10 h-10 text-muted" />
                      )}

                      <label
                        className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white transition-opacity ${uploadingImage ? "opacity-100 cursor-not-allowed" : "opacity-0 group-hover:opacity-100 cursor-pointer"}`}
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                        <span className="text-[10px] font-bold mt-1 uppercase">
                          {uploadingImage ? "Subiendo..." : "Cambiar"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-muted font-medium">
                    Toca para actualizar tu foto
                  </p>
                </div>

                {/* Peso y Fecha Nacimiento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1.5">
                      Peso actual (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ej. 75.5"
                      value={settingsForm.weight}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          weight: e.target.value,
                        })
                      }
                      className="w-full bg-surface-2 border border-line rounded-panel px-4 py-3 text-text focus:ring-2 focus:ring-gold outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1.5">
                      F. Nacimiento
                    </label>
                    <input
                      type="date"
                      value={settingsForm.birthDate}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          birthDate: e.target.value,
                        })
                      }
                      className="w-full bg-surface-2 border border-line rounded-panel px-4 py-3 text-text focus:ring-2 focus:ring-gold outline-none transition-colors color-scheme-dark"
                    />
                  </div>
                </div>

                {/* Objetivos */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Tus objetivos principales
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((goal) => {
                      const isSelected = settingsForm.goals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSettingsForm({
                                ...settingsForm,
                                goals: settingsForm.goals.filter(
                                  (g) => g !== goal,
                                ),
                              });
                            } else {
                              setSettingsForm({
                                ...settingsForm,
                                goals: [...settingsForm.goals, goal],
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                            isSelected
                              ? "bg-gold border-gold text-bg"
                              : "bg-surface border-line text-muted"
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Medalla de Perfil */}
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Medalla de Perfil
                  </label>
                  <p className="text-xs text-muted mb-3">Elige qué medalla desbloqueada mostrar junto a tu foto.</p>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin items-start">
                    <div 
                      onClick={() => setSettingsForm({ ...settingsForm, selectedBadge: "" })}
                      className={`flex flex-col items-center min-w-[70px] cursor-pointer group ${settingsForm.selectedBadge === "" ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
                    >
                      <div className={`w-14 h-14 rounded-full bg-line flex items-center justify-center text-muted mb-2 transition-all ${settingsForm.selectedBadge === "" ? "ring-2 ring-gold ring-offset-2 scale-110" : ""}`}>
                        <Ban className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-center">Ninguna</span>
                    </div>

                    {/* Mapeo de medallas desbloqueadas */}
                    {(() => {
                          const renderBadges: any[] = [];
                          let bullCount = 0;
                          student.badges?.forEach((b: any) => {
                            if (b.badgeId.startsWith("BULL_PROGRESS_") || b.badgeId === "STRENGTH_10KG") {
                              bullCount++;
                            } else {
                              renderBadges.push(b);
                            }
                          });
                          if (bullCount > 0) {
                            renderBadges.push({ badgeId: "BULL_GROUPED", count: bullCount });
                          }

                          return renderBadges.map((badge: any, i: number) => {
                            const badgeData = badge.badgeId === "FIRST_WORKOUT" 
                              ? { name: "Primer Paso", color: METAL.bronze, icon: Medal }
                              : badge.badgeId === "STREAK_7"
                              ? { name: "Racha", color: METAL.silver, icon: Flame }
                              : badge.badgeId === "CENTURION"
                              ? { name: "Centurión", color: METAL.gold, icon: Medal }
                              : badge.badgeId === "BULL_GROUPED"
                              ? { name: `Toro`, color: METAL.silver, icon: Dumbbell }
                              : badge.badgeId === "BEAST_MODE"
                              ? { name: "Bestia", color: METAL.gold, icon: Flame }
                              : badge.badgeId === "MUTANT_MODE"
                              ? { name: "Mutante", color: METAL.solid, icon: Dumbbell }
                              : { name: badge.badgeId, color: METAL.bronze, icon: Medal };

                            const Icon = badgeData.icon;
                            const isSelected = settingsForm.selectedBadge === badge.badgeId;

                            return (
                              <div key={i} onClick={() => setSettingsForm({ ...settingsForm, selectedBadge: badge.badgeId })} className={`flex flex-col items-center min-w-[70px] cursor-pointer group transition-all ${isSelected ? "opacity-100" : "opacity-50 hover:opacity-100"}`}>
                                <div className={`w-14 h-14 rounded-full border ${badgeData.color} flex items-center justify-center mb-2 transition-all relative ${isSelected ? "ring-2 ring-gold ring-offset-2 scale-110" : ""}`}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold text-center leading-tight max-w-[70px] truncate">
                                  {badgeData.name}
                                </span>
                              </div>
                            );
                          });
                    })()}
                  </div>
                </div>

                {/* Guardar */}
                <div className="pt-4 border-t border-line">
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings || uploadingImage}
                    className="w-full py-3.5 bg-gold hover:brightness-110 text-bg font-medium uppercase tracking-[0.15em] text-sm rounded-panel transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingSettings ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Guardar Cambios"
                    )}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setSelectedVideoUrl(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl aspect-video bg-surface rounded-panel overflow-hidden z-10 transition-colors"
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

      {/* Overlay Info de XP */}
      <AnimatePresence>
        {showXPModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowXPModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface rounded-panel overflow-hidden z-10 transition-colors p-6"
            >
              <button
                onClick={() => setShowXPModal(false)}
                className="absolute top-4 right-4 p-2 text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Medal className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-text">
                  Sistema de Niveles
                </h2>
              </div>
              
              <div className="space-y-4 text-sm text-muted">
                <p>El sistema de experiencia (XP) está diseñado para recompensar tu constancia. Así es como funciona:</p>
                
                <div className="bg-surface-2 rounded-panel p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text">Completar un día</span>
                    <span className="text-gold font-bold">+50 XP</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-line pt-3">
                    <span className="font-semibold text-text">Subir de nivel</span>
                    <span className="text-gold font-bold">Cada 100 XP</span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-bold text-text mb-2">Rangos:</h4>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-success"></span> <strong>Principiante:</strong> Niveles 1 al 35</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gold"></span> <strong>Intermedio:</strong> Niveles 36 al 107</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gold"></span> <strong>Avanzado:</strong> Niveles 108 al 215</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gold"></span> <strong>Atleta:</strong> Nivel 216+</li>
                  </ul>
                  <div className="text-xs text-muted bg-gold/10 p-3 rounded-panel border border-gold-line flex gap-2 items-start">
                    <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <p>
                      Estos niveles representan los datos ingresados en el sistema en el día a día del entrenamiento, no representan tu nivel en la vida real. Si ya sos un atleta avanzado no le prestes atención, este sistema es con fines lúdicos y de motivación.
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowXPModal(false)}
                className="mt-8 w-full py-3 bg-gold hover:brightness-110 text-bg font-bold rounded-panel transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Overlay Info de Medallas */}
      <AnimatePresence>
        {showBadgesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowBadgesModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface rounded-panel overflow-hidden z-10 transition-colors p-6"
            >
              <button
                onClick={() => setShowBadgesModal(false)}
                className="absolute top-4 right-4 p-2 text-muted hover:text-text rounded-full hover:bg-surface-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Medal className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-text">
                  Trofeos Disponibles
                </h2>
              </div>
              
              <div className="space-y-4 text-sm text-muted max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                <p>Colecciona estas medallas a medida que superas tus límites. ¡Acá tenés lo que se requiere para obtenerlas!</p>
                
                <div className="bg-surface-2 rounded-panel p-4 space-y-4">
                  {/* Primer Entrenamiento */}
                  <div className="flex gap-4 items-start">
                    <div className={`w-12 h-12 rounded-full border ${METAL.bronze} flex items-center justify-center flex-shrink-0`}>
                      <Medal className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text">Primer Paso</h4>
                      <p className="text-xs mt-1 text-muted">Completa tu primer entrenamiento. ¡El viaje comienza!</p>
                    </div>
                  </div>

                  {/* Racha 7 */}
                  <div className="flex gap-4 items-start border-t border-line pt-4">
                    <div className={`w-12 h-12 rounded-full border ${METAL.silver} flex items-center justify-center flex-shrink-0`}>
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text">Racha de Fuego</h4>
                      <p className="text-xs mt-1 text-muted">Mantén una racha activa de 7 días consecutivos completando tus rutinas sin fallar.</p>
                    </div>
                  </div>

                  {/* Centurión */}
                  <div className="flex gap-4 items-start border-t border-line pt-4">
                    <div className={`w-12 h-12 rounded-full border ${METAL.gold} flex items-center justify-center flex-shrink-0`}>
                      <Medal className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text">Centurión</h4>
                      <p className="text-xs mt-1 text-muted">Completa un total de 100 entrenamientos a lo largo de tu trayectoria. Eres una leyenda.</p>
                    </div>
                  </div>

                  {/* Fuerza Desatada */}
                  <div className="flex gap-4 items-start border-t border-line pt-4">
                    <div className={`w-12 h-12 rounded-full border ${METAL.silver} flex items-center justify-center flex-shrink-0`}>
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text">Progreso Toro</h4>
                      <p className="text-xs mt-1 text-muted">Aumenta 10 kg en algún ejercicio respecto a tu marca inicial. ¡Acumulable por cada ejercicio distinto!</p>
                    </div>
                  </div>

                  {/* Bestia */}
                  <div className="flex gap-4 items-start border-t border-line pt-4">
                    <div className={`w-12 h-12 rounded-full border ${METAL.gold} flex items-center justify-center flex-shrink-0`}>
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text">Bestia</h4>
                      <p className="text-xs mt-1 text-muted">¡Colecciona 10 medallas de Toro para desbloquear este nivel de fuerza brutal!</p>
                    </div>
                  </div>

                  {/* Mutante */}
                  <div className="flex gap-4 items-start border-t border-line pt-4">
                    <div className={`w-12 h-12 rounded-full border ${METAL.solid} flex items-center justify-center flex-shrink-0`}>
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text">Mutante</h4>
                      <p className="text-xs mt-1 text-muted">¡El nivel máximo! Desbloqueable al juntar 50 medallas de Toro. Solo para leyendas absolutas.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowBadgesModal(false)}
                className="mt-6 w-full py-3 bg-gold hover:brightness-110 text-bg font-bold rounded-panel transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
