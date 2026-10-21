"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/cn";

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
      className={cn(
        "flex h-10 items-center rounded-panel text-sm text-muted transition-colors hover:bg-surface-2 hover:text-danger",
        isCollapsed ? "w-10 justify-center" : "w-full gap-3 px-3"
      )}
      title={isCollapsed ? "Cerrar Sesión" : undefined}
    >
      <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
      {!isCollapsed && <span className="truncate">Cerrar Sesión</span>}
    </button>
  );
}
