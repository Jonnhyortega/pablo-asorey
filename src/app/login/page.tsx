"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button, Input } from "@/components/ui";
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
    <AuthLayout
      eyebrow="Ingresa a tu panel de entrenamiento"
      title="Acceso Alumnos"
      footer={
        <p>
          ¿No tienes cuenta?{" "}
          <Link href="/aplicar" className="text-gold transition-colors hover:text-text">
            Aplicar ahora
          </Link>
        </p>
      }
    >
      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleLogin} className="space-y-5">
        <Input label="Email" type="email" required placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center text-muted hover:text-text"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <label htmlFor="remember" className="flex cursor-pointer items-center gap-3 text-sm text-muted">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 accent-[var(--gold)]"
          />
          Recordarme en este dispositivo
        </label>

        {error && <p role="alert" className="border border-danger/40 px-4 py-3 text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" size="lg" loading={loading} className="group w-full">
          {!loading && (
            <>
              Ingresar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </motion.form>
    </AuthLayout>
  );
}
