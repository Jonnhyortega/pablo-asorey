import Link from "next/link";
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2d0b3f] text-white flex flex-col shadow-xl flex-shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-center">
          <h2 className="text-2xl font-black italic tracking-wider text-[#dda124]">
            OMEGA<span className="text-white">ADMIN</span>
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-200 hover:text-white">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link href="/admin/leads" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-200 hover:text-white">
            <MessageSquare size={20} />
            <span className="font-medium">Mensajes / Leads</span>
          </Link>

          <Link href="/admin/subscribers" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-200 hover:text-white">
            <Users size={20} />
            <span className="font-medium">Suscriptores</span>
          </Link>

          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-gray-200 hover:text-white">
            <Settings size={20} />
            <span className="font-medium">Configuración Web</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <header className="h-16 bg-white shadow-sm flex items-center px-8 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800">Panel de Control</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
