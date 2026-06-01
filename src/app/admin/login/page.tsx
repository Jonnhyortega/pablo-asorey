"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Lock, Mail, Loader2 } from "lucide-react";

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

      if (res.ok) {
        window.location.href = "/admin"; // Forzamos una recarga completa para que el middleware reciba la cookie
      } else {
        const data = await res.json();
        setError(data.message || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15041f] flex items-center justify-center p-4">
      {/* Círculos de fondo decorativos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#dda124]/10 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#fc581e]/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-[#dda124] to-[#fc581e] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#fc581e]/30">
              <Lock className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black italic text-white tracking-widest text-center">
              OMEGA<span className="text-[#dda124]">ADMIN</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium tracking-wide">Panel de Control Restringido</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 flex items-center justify-center rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#dda124] transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#dda124] focus:border-transparent transition-all sm:text-sm"
                  placeholder="Correo Electrónico"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#dda124] transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#dda124] focus:border-transparent transition-all sm:text-sm"
                  placeholder="Contraseña"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-black italic tracking-widest text-[#15041f] bg-gradient-to-r from-[#dda124] to-[#f5b838] hover:from-[#c28e1f] hover:to-[#dda124] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#15041f] focus:ring-[#dda124] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase hover:-translate-y-1 hover:shadow-lg hover:shadow-[#dda124]/30"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Footer del login */}
        <div className="bg-white/5 border-t border-white/10 px-8 py-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                Seguridad Encriptada &middot; Acceso Privado
            </p>
        </div>
      </div>
    </div>
  );
}
