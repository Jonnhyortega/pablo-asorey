"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button, Input } from "@/components/ui";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user?.role === 'STUDENT') {
          window.location.href = "/student";
        } else {
          window.location.href = "/admin"; // Forzamos una recarga completa para que el middleware reciba la cookie
        }
      } else {
        setError(data.message || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Panel de Control Restringido"
      title="Administración"
      footer={<p className="text-[11px] uppercase tracking-[0.2em]">Seguridad Encriptada &middot; Acceso Privado</p>}
    >
      <form onSubmit={handleLogin} className="space-y-5">
        {error && <p role="alert" className="border border-danger/40 px-4 py-3 text-sm text-danger">{error}</p>}
        <Input
          label="Correo Electrónico"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo Electrónico"
          autoComplete="email"
        />
        <Input
          label="Contraseña"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoComplete="current-password"
        />
        <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
          {!isLoading && (
            <>
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
