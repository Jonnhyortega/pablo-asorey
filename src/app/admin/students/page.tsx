"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Search, Calendar, Target, Activity, Dumbbell, ShieldAlert, Clock, Loader2, X, Edit2, Trash2 } from "lucide-react";

type Student = {
  id: string;
  name: string;
  email: string | null;
  trainingDays: string;
  sessionDuration: string;
  age: number;
  height: number;
  weight: number;
  sportsExperience: string;
  injuries: string;
  lastTraining: string;
  goals: string;
  gym: string;
  photos: string; // JSON string
  createdAt: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

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
    if (!confirm("¿Estás seguro de que deseas eliminar este alumno?")) return;
    try {
      await fetch(`/api/students/${id}`, { method: "DELETE" });
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Alumnos</h1>
            <p className="text-gray-500 text-sm">Gestiona los formularios de registro de nuevos alumnos</p>
          </div>
        </div>
        
        <div className="relative w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
            placeholder="Buscar alumno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay alumnos</h3>
            <p className="text-gray-500 mt-1">Todavía no hay registros o la búsqueda no arrojó resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {filteredStudents.map((student) => (
              <StudentCard 
                key={student.id} 
                student={student} 
                onEdit={() => setEditingStudent(student)} 
                onDelete={() => deleteStudent(student.id)} 
              />
            ))}
          </div>
        )}
      </div>

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
      </AnimatePresence>
    </div>
  );
}

function StudentCard({ student, onEdit, onDelete }: { student: Student; onEdit: () => void; onDelete: () => void }) {
  const photos = (() => {
    try {
      return JSON.parse(student.photos);
    } catch {
      return [];
    }
  })();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
          {student.email && <p className="text-sm text-gray-500">{student.email}</p>}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            Físico
          </div>
          <p className="text-sm text-gray-700 font-medium">{student.age} años • {student.height}cm • {student.weight}kg</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            Rutina
          </div>
          <p className="text-sm text-gray-700 font-medium">{student.trainingDays} • {student.sessionDuration}</p>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Target className="w-3.5 h-3.5 text-purple-500" />
            Objetivos
          </div>
          <p className="text-sm text-gray-700 line-clamp-2" title={student.goals}>{student.goals}</p>
        </div>
        
        {photos.length > 0 && (
          <div className="flex gap-2 pt-2">
            {photos.slice(0, 3).map((url: string, i: number) => (
              <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt="gym" className="w-full h-full object-cover" />
              </div>
            ))}
            {photos.length > 3 && (
              <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-500">
                +{photos.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
        Registrado el: {new Date(student.createdAt).toLocaleDateString("es-AR", { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
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
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-purple-600" />
            Editar Alumno: {student.name}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="edit-student-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Nombre</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Edad</label>
                <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Altura (cm)</label>
                <input required type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Peso (kg)</label>
                <input required type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Días de Entrenamiento</label>
                <select required value={formData.trainingDays} onChange={e => setFormData({...formData, trainingDays: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={`${n} día${n > 1 ? 's' : ''}`}>{n} día{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Duración Sesión</label>
                <select required value={formData.sessionDuration} onChange={e => setFormData({...formData, sessionDuration: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="1hs">1 hora</option>
                  <option value="2hs">2 horas</option>
                  <option value="3hs">3 horas</option>
                  <option value="Mas horas">Más horas</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Experiencia en deportes</label>
                <textarea required value={formData.sportsExperience} onChange={e => setFormData({...formData, sportsExperience: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Lesiones / Cirugías</label>
                <textarea required value={formData.injuries} onChange={e => setFormData({...formData, injuries: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Último entrenamiento</label>
                <textarea required value={formData.lastTraining} onChange={e => setFormData({...formData, lastTraining: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Objetivos</label>
                <textarea required value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Gimnasio / Materiales</label>
                <textarea required value={formData.gym} onChange={e => setFormData({...formData, gym: e.target.value})} rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            
            {/* Show photos in edit modal but not editable directly via this simple modal for now, or just display them */}
            {(() => {
              let photos = [];
              try { photos = JSON.parse(formData.photos); } catch {}
              if (photos.length > 0) {
                return (
                  <div className="space-y-1 pt-4 border-t border-gray-100">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Fotos subidas</label>
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

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors">
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
