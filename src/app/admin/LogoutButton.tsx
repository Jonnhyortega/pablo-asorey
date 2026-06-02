"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({ isCollapsed }: { isCollapsed?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className={`flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 dark:hover:bg-red-900/20 dark:text-gray-400 dark:hover:text-red-400 transition-colors ${isCollapsed ? 'p-2.5 w-auto' : 'gap-3 px-4 py-2.5 w-full'}`}
      title={isCollapsed ? "Cerrar Sesión" : undefined}
    >
      <LogOut size={20} className="shrink-0" />
      {!isCollapsed && <span className="font-medium truncate">Cerrar Sesión</span>}
    </button>
  );
}
