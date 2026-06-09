"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("saved_student_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
        if (rememberMe) {
          localStorage.setItem("saved_student_email", email);
        } else {
          localStorage.removeItem("saved_student_email");
        }
        
        if (data.user?.role === 'ADMIN') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/student";
        }
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Acceso Alumnos</h1>
            <p className="text-neutral-400">Ingresa a tu panel de entrenamiento</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 text-blue-500 focus:ring-blue-500 bg-neutral-950 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-neutral-400 cursor-pointer select-none">
                Recordarme en este dispositivo
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>Ingresar <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-400">
              ¿No tienes cuenta? <Link href="/aplicar" className="text-blue-400 hover:underline">Aplicar ahora</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
