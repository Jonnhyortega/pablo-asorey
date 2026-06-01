"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, Settings, GraduationCap, Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function ClientAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Si estamos en la página de login, no renderizamos el dashboard shell.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#2d0b3f] text-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between lg:justify-center">
          <h2 className="text-2xl font-black italic tracking-wider text-primary-orange">
            OMEGA<span className="text-white">ADMIN</span>
          </h2>
          <button onClick={closeMobileMenu} className="lg:hidden text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-200 hover:text-white">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link href="/admin/leads" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-200 hover:text-white">
            <MessageSquare size={20} />
            <span className="font-medium">Mensajes / Leads</span>
          </Link>

          <Link href="/admin/subscribers" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-200 hover:text-white">
            <Users size={20} />
            <span className="font-medium">Suscriptores</span>
          </Link>

          <Link href="/admin/students" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-200 hover:text-white">
            <GraduationCap size={20} />
            <span className="font-medium">Alumnos</span>
          </Link>

          <Link href="/admin/settings" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-200 hover:text-white">
            <Settings size={20} />
            <span className="font-medium">Configuración Web</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 min-w-0">
        <header className="h-16 bg-white shadow-sm flex items-center px-4 lg:px-8 shrink-0 gap-4">
          <button onClick={toggleMobileMenu} className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 truncate">Panel de Control</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
