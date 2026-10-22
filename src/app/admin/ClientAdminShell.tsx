"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, Settings, GraduationCap, BookOpen, Tag } from "lucide-react";
import { AppShell, type NavItem } from "@/components/ui";
import LogoutButton from "./LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import AdminNotificationsBell from "./AdminNotificationsBell";

const TITLES: [string, string][] = [
  ["/admin/students", "Alumnos"],
  ["/admin/plans", "Planes"],
  ["/admin/exercises", "Ejercicios"],
  ["/admin/leads", "Mensajes"],
  ["/admin/subscribers", "Suscriptores"],
  ["/admin/settings", "Configuración"],
];

export default function ClientAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Si estamos en la página de login, no renderizamos el dashboard shell.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const title = TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Resumen";

  const nav: NavItem[] = [
    { href: "/admin", label: "Resumen", icon: LayoutDashboard, active: pathname === "/admin" },
    { href: "/admin/students", label: "Alumnos", icon: GraduationCap, active: pathname.startsWith("/admin/students"), group: "Gestión" },
    { href: "/admin/plans", label: "Planes", icon: Tag, active: pathname.startsWith("/admin/plans"), group: "Gestión" },
    { href: "/admin/exercises", label: "Bibl. Ejercicios", icon: BookOpen, active: pathname.startsWith("/admin/exercises"), group: "Gestión" },
    { href: "/admin/leads", label: "Mensajes / Leads", icon: MessageSquare, active: pathname.startsWith("/admin/leads"), group: "Gestión" },
    { href: "/admin/subscribers", label: "Suscriptores", icon: Users, active: pathname.startsWith("/admin/subscribers"), group: "Gestión" },
    { href: "/admin/settings", label: "Configuración", icon: Settings, active: pathname.startsWith("/admin/settings"), group: "Sistema" },
  ];

  return (
    <AppShell
      nav={nav}
      title={title}
      mobileNav="drawer"
      headerActions={<AdminNotificationsBell />}
      sidebarFooter={(collapsed) => (
        <>
          <ThemeToggle isCollapsed={collapsed} />
          <LogoutButton isCollapsed={collapsed} />
        </>
      )}
    >
      {children}
    </AppShell>
  );
}
