"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Search, Calendar, Target, Activity, Dumbbell, ShieldAlert, Clock, Loader2, X, Edit2, Trash2, Key, Wallet, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Alumnos</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Gestiona los formularios de registro de nuevos alumnos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterDebt(!filterDebt)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border flex items-center gap-1.5 ${filterDebt ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Solo Deudores</span>
            <span className="sm:hidden">Deudores</span>
          </button>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
            placeholder="Buscar alumno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 dark:text-purple-400" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No hay alumnos</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Todavía no hay registros o la búsqueda no arrojó resultados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            {filteredStudents.map((student) => (
              <StudentCard 
                key={student.id} 
                student={student} 
                onEdit={() => setEditingStudent(student)} 
                onDelete={() => setStudentToDelete(student)} 
                onViewImage={setViewingImage}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setStudentToDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-800"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar alumno?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Estás a punto de eliminar a <strong className="text-gray-800 dark:text-gray-200">{studentToDelete.name}</strong>. Esta acción no se puede deshacer y se borrarán todas sus rutinas y datos físicos.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setStudentToDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-slate-700 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => deleteStudent(studentToDelete.id)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Sí, eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

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
            <button onClick={() => setViewingImage(null)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={viewingImage} 
              alt="Vista ampliada" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Evita que al hacer click en la foto se cierre
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StudentCard({ student, onEdit, onDelete, onViewImage }: { student: Student; onEdit: () => void; onDelete: () => void; onViewImage: (url: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [stats, setStats] = useState<Record<string, {date: string, maxWeight: number}[]> | null>(null);
  const [activeStatExercise, setActiveStatExercise] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isExpanded && !stats && !loadingStats) {
      setLoadingStats(true);
      fetch(`/api/students/${student.id}/stats`)
        .then(res => res.json())
        .then(data => {
          setStats(data);
          if (Object.keys(data).length > 0) {
            setActiveStatExercise(Object.keys(data)[0]);
          }
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

  const isPending = !student.paymentDate;
  const isDebt = student.paymentDate && new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime();
  const paymentStatusText = isPending ? 'Pendiente' : (isDebt ? 'Deuda' : 'Al Día');
  const paymentStatusClass = isPending ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : (isDebt ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col overflow-hidden"
    >
      <div 
        className="flex items-center justify-between p-4 sm:p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {student.profilePicture ? (
            <img src={student.profilePicture} alt={student.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-sm shrink-0" />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-sm shrink-0">
               {student.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">{student.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block ${paymentStatusClass}`}>
                {paymentStatusText}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {student.email && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{student.email}</p>}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider sm:hidden ${paymentStatusClass}`}>
                {paymentStatusText}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0" onClick={e => e.stopPropagation()}>
          <div className="flex gap-1.5 sm:gap-2">
            <Link href={`/admin/students/${student.id}/routines`} className="p-2 sm:p-2.5 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl transition-colors flex items-center justify-center" title="Cargar Rutina">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <button onClick={onEdit} className="p-2 sm:p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors flex items-center justify-center" title="Editar Alumno">
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={onDelete} className="p-2 sm:p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-colors flex items-center justify-center" title="Eliminar">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
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
            className="border-t border-gray-100 dark:border-slate-800"
          >
            <div className="p-4 sm:p-6 bg-gray-50/50 dark:bg-slate-800/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    Perfil Físico
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium pt-1">
                    {student.birthDate ? Math.floor((new Date().getTime() - new Date(student.birthDate).getTime()) / 31557600000) : '-'} años • {student.height} cm • {student.weight} kg
                  </p>
                </div>
                
                <div className="space-y-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    Plan de Entrenamiento
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium pt-1">
                    {student.trainingDays} • {student.sessionDuration}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    <Target className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    Objetivos principales
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                    {student.goals}
                  </p>
                </div>
                
                {photos.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Fotos Físicas
                    </div>
                    <div className="flex gap-3">
                      {photos.map((url: string, i: number) => (
                        <button key={i} onClick={() => onViewImage(url)} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-slate-700 cursor-zoom-in hover:border-purple-500 transition-all focus:outline-none shadow-sm">
                          <img src={url} alt="gym" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Chart */}
                {stats && Object.keys(stats).length > 0 && (
                  <div className="pt-4 mt-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        Progreso de Fuerza
                      </div>
                      <select
                        value={activeStatExercise || ""}
                        onChange={(e) => setActiveStatExercise(e.target.value)}
                        className="text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white outline-none w-full sm:w-auto"
                      >
                        {Object.keys(stats).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                      </select>
                    </div>
                    {activeStatExercise && stats[activeStatExercise] && (
                      <div className="h-48 sm:h-56 w-full bg-white dark:bg-slate-800/50 p-2 sm:p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats[activeStatExercise]} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
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
                              stroke="#9CA3AF"
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{fontSize: 10}} 
                              stroke="#9CA3AF"
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px', backgroundColor: 'var(--tw-colors-slate-900)' }}
                              itemStyle={{ color: '#60A5FA', fontWeight: 'bold' }}
                              labelFormatter={(val) => val}
                              formatter={(value: any) => [`${value} kg`, 'Máx']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="maxWeight" 
                              stroke="#8B5CF6" 
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: "#fff" }}
                              activeDot={{ r: 5, stroke: "#8B5CF6" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className={`w-4 h-4 ${!student.paymentDate ? 'text-orange-500' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'text-red-500' : 'text-emerald-500')}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${!student.paymentDate ? 'text-orange-600 dark:text-orange-400' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400')}`}>
                        {!student.paymentDate ? 'Pendiente' : (new Date(student.paymentDate).setHours(23,59,59,999) < new Date().getTime() ? 'Deuda' : 'Al Día')}
                      </span>
                    </div>
                    {student.paymentDate ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Vence: {new Date(student.paymentDate).toLocaleDateString("es-AR", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-500 italic">No hay fecha registrada</p>
                    )}
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 flex flex-col justify-center">
                    {student.generatedPassword ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clave Temporal</span>
                        </div>
                        <span className="text-sm font-mono text-gray-800 dark:text-gray-200 font-bold bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded inline-block w-max">
                          {student.generatedPassword}
                        </span>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-500 italic">Sin clave temporal activa</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Editar Alumno: {student.name}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="edit-student-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                <input value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha de Nacimiento</label>
                <input type="date" value={formData.birthDate ? formData.birthDate.split('T')[0] : ""} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent color-scheme-dark" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Altura (cm)</label>
                <input required type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Peso (kg)</label>
                <input required type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Días de Entrenamiento</label>
                <select required value={formData.trainingDays} onChange={e => setFormData({...formData, trainingDays: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={`${n} día${n > 1 ? 's' : ''}`}>{n} día{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Duración Sesión</label>
                <select required value={formData.sessionDuration} onChange={e => setFormData({...formData, sessionDuration: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="1hs">1 hora</option>
                  <option value="2hs">2 horas</option>
                  <option value="3hs">3 horas</option>
                  <option value="Mas horas">Más horas</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha de último pago realizado</label>
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
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                />
                <span className="text-[10px] text-gray-500 mt-1 block">El vencimiento se calcula automáticamente a 31 días.</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Experiencia en deportes</label>
                <textarea required value={formData.sportsExperience} onChange={e => setFormData({...formData, sportsExperience: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lesiones / Cirugías</label>
                <textarea required value={formData.injuries} onChange={e => setFormData({...formData, injuries: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Último entrenamiento</label>
                <textarea required value={formData.lastTraining} onChange={e => setFormData({...formData, lastTraining: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Objetivos</label>
                <textarea required value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gimnasio / Materiales</label>
                <textarea required value={formData.gym} onChange={e => setFormData({...formData, gym: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            
            {/* Show photos in edit modal but not editable directly via this simple modal for now, or just display them */}
            {(() => {
              let photos = [];
              try { photos = JSON.parse(formData.photos); } catch {}
              if (photos.length > 0) {
                return (
                  <div className="space-y-1 pt-4 border-t border-gray-100">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Fotos subidas</label>
                    <div className="flex flex-wrap gap-4">
                      {photos.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity">
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
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Cancelar
          </button>
          <button type="submit" form="edit-student-form" disabled={saving} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </div>
  );
}
