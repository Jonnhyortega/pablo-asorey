"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Search, Calendar, Target, Activity, Dumbbell, ShieldAlert, Clock, Loader2, X, Edit2, Trash2, Key, Wallet, ArrowRight, ChevronDown, Check } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Badge, Button, Dialog, Input, PageHeader } from "@/components/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

type Student = {
  id: string;
  name: string;
  email: string | null;
  trainingDays: string;
  sessionDuration: string;
  birthDate: string | null;
  height: number;
  weight: number;
  sportsExperience: string;
  injuries: string;
  lastTraining: string;
  goals: string;
  gym: string;
  photos: string; // JSON string
  paymentDate: string | null;
  paymentStatus: string;
  generatedPassword: string | null;
  profilePicture: string | null;
  createdAt: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterDebt, setFilterDebt] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error("API Error (not an array):", data);
        setStudents([]);
      }
    } catch (err) {
      console.error("Network or parsing error:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id: string) => {
    setIsDeleting(true);
    try {
      await fetch(`/api/students/${id}`, { method: "DELETE" });
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setStudentToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;
      if (filterDebt) {
        return s.paymentDate && new Date(s.paymentDate).setHours(23,59,59,999) < new Date().getTime();
      }
      return true;
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestiona los formularios de registro de nuevos alumnos"
        title="Alumnos"
        actions={
          <>
            <button
              onClick={() => setFilterDebt(!filterDebt)}
              aria-pressed={filterDebt}
              className={`flex h-11 items-center gap-2 rounded-panel border px-4 text-xs uppercase tracking-[0.15em] transition-colors ${filterDebt ? 'border-danger/40 bg-danger/10 text-danger' : 'border-line text-muted hover:text-text'}`}
            >
              <Wallet className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Solo Deudores</span>
              <span className="sm:hidden">Deudores</span>
            </button>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="text"
                aria-label="Buscar alumno"
                className="pl-9"
                placeholder="Buscar alumno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </>
        }
      />

      <div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gold" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text">No hay alumnos</h3>
            <p className="text-muted mt-1">Todavía no hay registros o la búsqueda no arrojó resultados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredStudents.map((student) => (
              <StudentCard 
                key={student.id} 
                student={student} 
                onEdit={() => setEditingStudent(student)} 
                onDelete={() => setStudentToDelete(student)} 
                onViewImage={setViewingImage}
                onPaymentResolved={fetchStudents}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!studentToDelete}
        onClose={() => !isDeleting && setStudentToDelete(null)}
        title="¿Eliminar alumno?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStudentToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" loading={isDeleting} onClick={() => studentToDelete && deleteStudent(studentToDelete.id)}>
              {!isDeleting && <Trash2 className="h-4 w-4" />}
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Estás a punto de eliminar a <strong className="text-text">{studentToDelete?.name}</strong>. Esta acción no se puede deshacer y se borrarán todas sus rutinas y datos físicos.
        </p>
      </Dialog>

      <AnimatePresence>
        {editingStudent && (
          <EditStudentModal
            student={editingStudent}
            onClose={() => setEditingStudent(null)}
            onSave={(updated) => {
              setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
              setEditingStudent(null);
            }}
          />
        )}
        
        {viewingImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setViewingImage(null)}
          >
            <button onClick={() => setViewingImage(null)} aria-label="Cerrar" className="absolute top-6 right-6 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={viewingImage} 
              alt="Vista ampliada" 
              className="max-w-full max-h-[90vh] object-contain rounded-panel"
              onClick={(e) => e.stopPropagation()} // Evita que al hacer click en la foto se cierre
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StudentActions({ studentId, onEdit, onDelete, labeled = false }: { studentId: string; onEdit: () => void; onDelete: () => void; labeled?: boolean }) {
  const base = `flex h-10 items-center justify-center gap-2 rounded-panel border border-line text-muted transition-colors ${labeled ? "min-w-0 flex-1 px-2 text-sm" : "w-10"}`;
  return (
    <>
      <Link href={`/admin/students/${studentId}/routines`} className={`${base} hover:border-gold hover:text-gold`} title="Cargar Rutina">
        <Dumbbell className="h-4 w-4" strokeWidth={1.5} />
        {labeled && "Rutina"}
      </Link>
      <button onClick={onEdit} className={`${base} hover:border-gold hover:text-gold`} title="Editar Alumno">
        <Edit2 className="h-4 w-4" strokeWidth={1.5} />
        {labeled && "Editar"}
      </button>
      <button onClick={onDelete} className={`${base} hover:border-danger hover:text-danger`} title="Eliminar">
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        {labeled && "Eliminar"}
      </button>
    </>
  );
}

function StudentCard({ student, onEdit, onDelete, onViewImage, onPaymentResolved }: { student: Student; onEdit: () => void; onDelete: () => void; onViewImage: (url: string) => void; onPaymentResolved: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [stats, setStats] = useState<Record<string, {date: string, maxWeight: number}[]> | null>(null);
  const [activeStatExercise, setActiveStatExercise] = useState<string | null>(null);
  const [adherenceStats, setAdherenceStats] = useState<{
    adherence: { completed: number, skipped: number, total: number, percentage: number } | null,
    missedDaysOfWeek: { name: string, count: number }[] | null
  }>({ adherence: null, missedDaysOfWeek: null });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isExpanded && !stats && !loadingStats) {
      setLoadingStats(true);
      fetch(`/api/students/${student.id}/stats`)
        .then(res => res.json())
        .then(data => {
          setStats(data.weightProgression || {});
          if (data.weightProgression && Object.keys(data.weightProgression).length > 0) {
            setActiveStatExercise(Object.keys(data.weightProgression)[0]);
          }
          setAdherenceStats({
            adherence: data.adherence || null,
            missedDaysOfWeek: data.missedDaysOfWeek || null
          });
        })
        .finally(() => setLoadingStats(false));
    }
  }, [isExpanded, stats, student.id, loadingStats]);

  const photos = (() => {
    try {
      return JSON.parse(student.photos);
    } catch {
      return [];
    }
  })();

  const [resolvingPayment, setResolvingPayment] = useState<"approve" | "reject" | null>(null);

  const resolvePayment = async (action: "approve" | "reject") => {
    setResolvingPayment(action);
    try {
      const res = await fetch(`/api/students/${student.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "Pago aceptado: se renovó el mes." : "Pago rechazado: se le avisó al alumno.");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "No se pudo resolver el pago");
      }
      onPaymentResolved();
    } catch {
      toast.error("Error inesperado");
    } finally {
      setResolvingPayment(null);
    }
  };

  const isVerifying = student.paymentStatus === 'VERIFYING';
  const isPending = !student.paymentDate;
  const isDebt = student.paymentDate && new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime();
  const paymentStatusText = isVerifying ? 'Verificando' : (isPending ? 'Pendiente' : (isDebt ? 'Deuda' : 'Al Día'));
  const paymentStatusTone = isVerifying ? 'neutral' : (isPending ? 'gold' : (isDebt ? 'danger' : 'success')) as 'neutral' | 'gold' | 'danger' | 'success';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface border border-line rounded-panel transition-all group flex flex-col overflow-hidden"
    >
      <div 
        className="flex items-center justify-between p-4 sm:p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {student.profilePicture ? (
            <img src={student.profilePicture} alt={student.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-line shrink-0" />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gold-line bg-surface-2 flex items-center justify-center font-display text-xl sm:text-2xl text-gold shrink-0">
               {student.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-medium text-text sm:text-lg">{student.name}</h3>
              <Badge tone={paymentStatusTone} className="max-sm:hidden">{paymentStatusText}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {student.email && <p className="text-xs sm:text-sm text-muted truncate">{student.email}</p>}
              <Badge tone={paymentStatusTone} className="sm:hidden">{paymentStatusText}</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0" onClick={e => e.stopPropagation()}>
          {/* En celular las acciones viven dentro del detalle expandido */}
          <div className="hidden gap-2 sm:flex">
            <StudentActions studentId={student.id} onEdit={onEdit} onDelete={onDelete} />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Contraer" : "Expandir"}
            className="p-1 text-muted transition-colors hover:text-text sm:p-2"
          >
            <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-line"
          >
            <div className="p-4 sm:p-6 bg-surface-2">
              <div className="mb-5 flex gap-2 sm:hidden">
                <StudentActions studentId={student.id} onEdit={onEdit} onDelete={onDelete} labeled />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1 bg-surface p-4 rounded-panel border border-line">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-gold" />
                    Perfil Físico
                  </div>
                  <p className="text-sm text-text font-medium pt-1">
                    {student.birthDate ? Math.floor((new Date().getTime() - new Date(student.birthDate).getTime()) / 31557600000) : '-'} años • {student.height} cm • {student.weight} kg
                  </p>
                </div>
                
                <div className="space-y-1 bg-surface p-4 rounded-panel border border-line">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-success" />
                    Plan de Entrenamiento
                  </div>
                  <p className="text-sm text-text font-medium pt-1">
                    {student.trainingDays} • {student.sessionDuration}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    <Target className="w-4 h-4 text-gold" />
                    Objetivos principales
                  </div>
                  <p className="text-sm text-text bg-surface p-4 rounded-panel border border-line">
                    {student.goals}
                  </p>
                </div>
                
                {photos.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                      Fotos Físicas
                    </div>
                    <div className="flex gap-3">
                      {photos.map((url: string, i: number) => (
                        <button key={i} onClick={() => onViewImage(url)} className="w-16 h-16 sm:w-20 sm:h-20 rounded-panel overflow-hidden border-2 border-line cursor-zoom-in hover:border-gold transition-all focus:outline-none">
                          <img src={url} alt="gym" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adherence Charts */}
                {adherenceStats.adherence && adherenceStats.adherence.total > 0 && (
                  <div className="pt-4 mt-2 border-t border-line">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider mb-4">
                      <Activity className="w-4 h-4 text-gold" />
                      Adherencia y Consistencia
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* PieChart */}
                      <div className="bg-surface p-4 rounded-panel border border-line flex flex-col items-center">
                        <h4 className="text-xs font-semibold text-text w-full text-left mb-2">Tasa de Adherencia</h4>
                        <div className="h-32 w-full relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Completados', value: adherenceStats.adherence.completed },
                                  { name: 'Omitidos', value: adherenceStats.adherence.skipped }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              >
                                <Cell fill="var(--gold)" />
                                <Cell fill="var(--line)" />
                              </Pie>
                              <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'var(--surface)', fontSize: '12px' }}
                                itemStyle={{ color: 'var(--text)', fontWeight: 'bold' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-black text-text">{adherenceStats.adherence.percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full flex justify-between px-2 mt-2 text-[10px] font-medium text-muted">
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gold"></div>Completados ({adherenceStats.adherence.completed})</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-line"></div>Omitidos ({adherenceStats.adherence.skipped})</div>
                        </div>
                      </div>

                      {/* BarChart */}
                      {adherenceStats.missedDaysOfWeek && adherenceStats.adherence.skipped > 0 && (
                        <div className="bg-surface p-4 rounded-panel border border-line">
                          <h4 className="text-xs font-semibold text-text mb-2">Días de fallo frecuentes</h4>
                          <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={adherenceStats.missedDaysOfWeek} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" opacity={0.2} />
                                <XAxis 
                                  dataKey="name" 
                                  tickFormatter={(val) => val.substring(0, 3)}
                                  tick={{fontSize: 9}} 
                                  stroke="var(--muted)"
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis 
                                  tick={{fontSize: 9}} 
                                  stroke="var(--muted)"
                                  axisLine={false}
                                  tickLine={false}
                                  allowDecimals={false}
                                />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'var(--surface)', fontSize: '12px' }}
                                  itemStyle={{ color: 'var(--danger)', fontWeight: 'bold' }}
                                  cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" fill="var(--muted)" radius={[2, 2, 0, 0]}>
                                  {adherenceStats.missedDaysOfWeek.map((d) => (
                                    <Cell
                                      key={d.name}
                                      fill={d.count > 0 && d.count === Math.max(...adherenceStats.missedDaysOfWeek!.map((x) => x.count)) ? "var(--danger)" : "var(--muted)"}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Chart */}
                {stats && Object.keys(stats).length > 0 && (
                  <div className="pt-4 mt-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
                        <Dumbbell className="w-4 h-4 text-gold" />
                        Progreso de Fuerza
                      </div>
                      <select
                        value={activeStatExercise || ""}
                        onChange={(e) => setActiveStatExercise(e.target.value)}
                        className="text-xs sm:text-sm bg-surface-2 border border-line rounded-panel px-2 py-1.5 text-text outline-none w-full sm:w-auto"
                      >
                        {Object.keys(stats).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                      </select>
                    </div>
                    {activeStatExercise && stats[activeStatExercise] && (
                      <div className="h-48 sm:h-56 w-full bg-surface p-2 sm:p-4 rounded-panel border border-line">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats[activeStatExercise]} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" opacity={0.2} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(val) => {
                                try {
                                  const d = val.split('-');
                                  return `${d[2]}/${d[1]}`;
                                } catch (e) {
                                  return val;
                                }
                              }}
                              tick={{fontSize: 10}} 
                              stroke="var(--muted)"
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{fontSize: 10}} 
                              stroke="var(--muted)"
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', fontSize: '12px', backgroundColor: 'var(--surface)' }}
                              itemStyle={{ color: 'var(--gold)', fontWeight: 'bold' }}
                              labelFormatter={(val) => val}
                              formatter={(value: any) => [`${value} kg`, 'Máx']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="maxWeight" 
                              stroke="var(--gold)" 
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: "var(--bg)" }}
                              activeDot={{ r: 5, stroke: "var(--gold)" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-line">
                  <div className="bg-surface p-4 rounded-panel border border-line">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className={`w-4 h-4 ${student.paymentStatus === 'VERIFYING' ? 'text-gold' : !student.paymentDate ? 'text-gold' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'text-danger' : 'text-success')}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${student.paymentStatus === 'VERIFYING' ? 'text-gold' : !student.paymentDate ? 'text-gold' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'text-danger' : 'text-success')}`}>
                        {student.paymentStatus === 'VERIFYING' ? 'En Verificación' : !student.paymentDate ? 'Pendiente' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'Deuda' : 'Al Día')}
                      </span>
                    </div>
                    {student.paymentDate ? (
                      <p className="text-sm text-muted font-medium">Vence: {new Date(student.paymentDate).toLocaleDateString("es-AR", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    ) : (
                      <p className="text-sm text-muted italic">No hay fecha registrada</p>
                    )}
                    {isVerifying && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted">El alumno informó que pagó. ¿Lo recibiste?</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary" className="flex-1" loading={resolvingPayment === "approve"} disabled={resolvingPayment !== null} onClick={() => resolvePayment("approve")}>
                            <Check className="h-4 w-4" /> Aceptar
                          </Button>
                          <Button size="sm" variant="secondary" className="flex-1" loading={resolvingPayment === "reject"} disabled={resolvingPayment !== null} onClick={() => resolvePayment("reject")}>
                            <X className="h-4 w-4" /> Rechazar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-surface p-4 rounded-panel border border-line flex flex-col justify-center">
                    {student.generatedPassword ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-4 h-4 text-muted" />
                          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Clave Temporal</span>
                        </div>
                        <span className="text-sm font-mono text-text font-bold bg-surface-2 px-2 py-1 rounded inline-block w-max">
                          {student.generatedPassword}
                        </span>
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">Sin clave temporal activa</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-center text-muted pt-2">
                  Registrado en la plataforma el {new Date(student.createdAt).toLocaleDateString("es-AR", { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EditStudentModal({ student, onClose, onSave }: { student: Student; onClose: () => void; onSave: (s: Student) => void }) {
  const [formData, setFormData] = useState({ ...student });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      onSave(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Editar Alumno: ${student.name}`}
      className="max-w-4xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-student-form" variant="primary" loading={saving}>
            Guardar Cambios
          </Button>
        </>
      }
    >
          <form id="edit-student-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Nombre</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Email</label>
                <input value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Fecha de Nacimiento</label>
                <input type="date" value={formData.birthDate ? formData.birthDate.split('T')[0] : ""} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Altura (cm)</label>
                <input required type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Peso (kg)</label>
                <input required type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Días de Entrenamiento</label>
                <select required value={formData.trainingDays} onChange={e => setFormData({...formData, trainingDays: e.target.value})} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none">
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={`${n} día${n > 1 ? 's' : ''}`}>{n} día{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Duración Sesión</label>
                <select required value={formData.sessionDuration} onChange={e => setFormData({...formData, sessionDuration: e.target.value})} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none">
                  <option value="1hs">1 hora</option>
                  <option value="2hs">2 horas</option>
                  <option value="3hs">3 horas</option>
                  <option value="Mas horas">Más horas</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Fecha de último pago realizado</label>
                <input 
                  type="date" 
                  value={formData.paymentDate ? (() => { 
                    const d = new Date(formData.paymentDate); 
                    d.setDate(d.getDate() - 31); 
                    return d.toISOString().split('T')[0]; 
                  })() : ''} 
                  onChange={e => {
                    if (e.target.value) {
                      const selectedDate = new Date(e.target.value);
                      selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset()); // Fix timezone offset
                      selectedDate.setDate(selectedDate.getDate() + 31); // +31 días
                      setFormData({...formData, paymentDate: selectedDate.toISOString(), paymentStatus: 'UP_TO_DATE'});
                    } else {
                      setFormData({...formData, paymentDate: null, paymentStatus: 'PENDING'});
                    }
                  }} 
                  className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" 
                />
                <span className="text-[10px] text-muted mt-1 block">El vencimiento se calcula automáticamente a 31 días.</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-line">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Experiencia en deportes</label>
                <textarea required value={formData.sportsExperience} onChange={e => setFormData({...formData, sportsExperience: e.target.value})} rows={2} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Lesiones / Cirugías</label>
                <textarea required value={formData.injuries} onChange={e => setFormData({...formData, injuries: e.target.value})} rows={2} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Último entrenamiento</label>
                <textarea required value={formData.lastTraining} onChange={e => setFormData({...formData, lastTraining: e.target.value})} rows={2} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Objetivos</label>
                <textarea required value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} rows={2} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted">Gimnasio / Materiales</label>
                <textarea required value={formData.gym} onChange={e => setFormData({...formData, gym: e.target.value})} rows={2} className="w-full rounded-panel border border-line bg-bg px-3.5 py-2.5 text-sm text-text focus:border-gold focus:outline-none" />
              </div>
            </div>
            
            {/* Show photos in edit modal but not editable directly via this simple modal for now, or just display them */}
            {(() => {
              let photos = [];
              try { photos = JSON.parse(formData.photos); } catch {}
              if (photos.length > 0) {
                return (
                  <div className="space-y-1 pt-4 border-t border-line">
                    <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted">Fotos subidas</label>
                    <div className="flex flex-wrap gap-4">
                      {photos.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-panel overflow-hidden border border-line hover:opacity-80 transition-opacity">
                          <img src={url} alt="gym" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

          </form>
    </Dialog>
  );
}
