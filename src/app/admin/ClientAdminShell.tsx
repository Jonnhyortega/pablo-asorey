"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, Settings, GraduationCap, Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ClientAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

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
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.05)] dark:shadow-none border-r border-gray-100 dark:border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${isDesktopCollapsed ? 'lg:w-20 w-64' : 'w-64'}`}>
        <div className={`h-16 border-b border-gray-100 dark:border-slate-800 flex items-center shrink-0 transition-all duration-300 ${isDesktopCollapsed ? 'justify-center px-0' : 'justify-between lg:justify-center px-6'}`}>
          {!isDesktopCollapsed && (
            <h2 className="text-xl font-black italic tracking-wider text-[#dda124] lg:block">
              OMEGA<span className="text-gray-800 dark:text-white">ADMIN</span>
            </h2>
          )}
          {isDesktopCollapsed && (
            <h2 className="text-xl font-black italic tracking-wider text-[#dda124] hidden lg:block">
              O<span className="text-gray-800 dark:text-white">A</span>
            </h2>
          )}
          <button onClick={closeMobileMenu} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        
        <nav className={`flex-1 py-6 space-y-6 overflow-y-auto overflow-x-hidden ${isDesktopCollapsed ? 'px-2' : 'px-4'}`}>
          {/* Dashboard */}
          <div>
            <Link 
              href="/admin" 
              onClick={closeMobileMenu} 
              className={`flex items-center rounded-lg transition-colors ${isDesktopCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'} ${
                pathname === '/admin' 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold' 
                  : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium'
              }`}
              title={isDesktopCollapsed ? "Dashboard" : undefined}
            >
              <LayoutDashboard size={20} strokeWidth={pathname === '/admin' ? 2.5 : 2} className="shrink-0" />
              {!isDesktopCollapsed && <span className="truncate">Dashboard</span>}
            </Link>
          </div>

          {/* Gestión */}
          <div>
            {!isDesktopCollapsed ? (
              <div className="px-3 mb-2 text-xs font-bold text-gray-400 dark:text-gray-500 truncate">Gestión</div>
            ) : (
              <div className="mb-2 border-t border-gray-100 dark:border-slate-800 w-full" />
            )}
            <div className="space-y-1">
              <Link 
                href="/admin/alumnos" 
                onClick={closeMobileMenu} 
                className={`flex items-center rounded-lg transition-colors ${isDesktopCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'} ${
                  pathname.startsWith('/admin/alumnos') || pathname.startsWith('/admin/students')
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold' 
                    : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium'
                }`}
                title={isDesktopCollapsed ? "Alumnos" : undefined}
              >
                <GraduationCap size={20} strokeWidth={pathname.startsWith('/admin/students') ? 2.5 : 2} className="shrink-0" />
                {!isDesktopCollapsed && <span className="truncate">Alumnos</span>}
              </Link>
              <Link 
                href="/admin/leads" 
                onClick={closeMobileMenu} 
                className={`flex items-center rounded-lg transition-colors ${isDesktopCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'} ${
                  pathname.startsWith('/admin/leads')
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold' 
                    : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium'
                }`}
                title={isDesktopCollapsed ? "Mensajes / Leads" : undefined}
              >
                <MessageSquare size={20} strokeWidth={pathname.startsWith('/admin/leads') ? 2.5 : 2} className="shrink-0" />
                {!isDesktopCollapsed && <span className="truncate">Mensajes / Leads</span>}
              </Link>
              <Link 
                href="/admin/subscribers" 
                onClick={closeMobileMenu} 
                className={`flex items-center rounded-lg transition-colors ${isDesktopCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'} ${
                  pathname.startsWith('/admin/subscribers')
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold' 
                    : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium'
                }`}
                title={isDesktopCollapsed ? "Suscriptores" : undefined}
              >
                <Users size={20} strokeWidth={pathname.startsWith('/admin/subscribers') ? 2.5 : 2} className="shrink-0" />
                {!isDesktopCollapsed && <span className="truncate">Suscriptores</span>}
              </Link>
            </div>
          </div>

          {/* Sistema */}
          <div>
            {!isDesktopCollapsed ? (
              <div className="px-3 mb-2 text-xs font-bold text-gray-400 dark:text-gray-500 truncate">Sistema</div>
            ) : (
              <div className="mb-2 border-t border-gray-100 dark:border-slate-800 w-full" />
            )}
            <div className="space-y-1">
              <Link 
                href="/admin/settings" 
                onClick={closeMobileMenu} 
                className={`flex items-center rounded-lg transition-colors ${isDesktopCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'} ${
                  pathname.startsWith('/admin/settings')
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold' 
                    : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium'
                }`}
                title={isDesktopCollapsed ? "Configuración" : undefined}
              >
                <Settings size={20} strokeWidth={pathname.startsWith('/admin/settings') ? 2.5 : 2} className="shrink-0" />
                {!isDesktopCollapsed && <span className="truncate">Configuración</span>}
              </Link>
            </div>
          </div>
        </nav>
        
        <div className={`p-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3 ${isDesktopCollapsed ? 'items-center' : ''}`}>
          <ThemeToggle isCollapsed={isDesktopCollapsed} />
          <LogoutButton isCollapsed={isDesktopCollapsed} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-[#0f0f13] min-w-0 transition-colors duration-300">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileMenu} className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu size={24} />
            </button>
            <button onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} className="hidden lg:flex p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">Panel de Control</h1>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
