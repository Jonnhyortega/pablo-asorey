"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Wordmark } from "./Wordmark";

export type NavItem = {
  href?: string;
  onSelect?: () => void;
  label: string;
  icon: LucideIcon;
  active: boolean;
  group?: string;
};

// Un slot puede depender de si la sidebar está colapsada
type Slot = React.ReactNode | ((collapsed: boolean) => React.ReactNode);

const renderSlot = (slot: Slot, collapsed: boolean) => (typeof slot === "function" ? slot(collapsed) : slot);

type AppShellProps = {
  brand?: React.ReactNode;
  nav: NavItem[];
  title: string;
  headerActions?: React.ReactNode;
  sidebarTop?: Slot;
  sidebarFooter?: Slot;
  mobileNav?: "drawer" | "bottom";
  children: React.ReactNode;
};

function groupNav(nav: NavItem[]) {
  const groups: { name?: string; items: NavItem[] }[] = [];
  for (const item of nav) {
    const last = groups[groups.length - 1];
    if (last && last.name === item.group) last.items.push(item);
    else groups.push({ name: item.group, items: [item] });
  }
  return groups;
}

function NavEntry({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  const classes = cn(
    "relative flex h-10 w-full items-center rounded-panel text-sm transition-colors",
    collapsed ? "justify-center" : "gap-3 px-3",
    item.active ? "bg-surface-2 text-text" : "text-muted hover:bg-surface-2/60 hover:text-text"
  );
  const content = (
    <>
      {item.active && <span className="absolute inset-y-2 left-0 w-[2px] bg-gold" aria-hidden />}
      <Icon className={cn("h-[18px] w-[18px] shrink-0", item.active && "text-gold")} strokeWidth={1.5} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </>
  );
  const common = { className: classes, title: collapsed ? item.label : undefined, "aria-current": item.active ? ("page" as const) : undefined };

  if (item.href) {
    return (
      <Link href={item.href} onClick={onNavigate} {...common}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        item.onSelect?.();
        onNavigate?.();
      }}
      {...common}
    >
      {content}
    </button>
  );
}

export function AppShell({ brand, nav, title, headerActions, sidebarTop, sidebarFooter, mobileNav = "drawer", children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const groups = groupNav(nav);
  const isBottom = mobileNav === "bottom";

  const sidebarBody = (isCollapsed: boolean, onNavigate?: () => void) => (
    <>
      {sidebarTop && <div className={cn("border-b border-line py-5", isCollapsed ? "px-2" : "px-4")}>{renderSlot(sidebarTop, isCollapsed)}</div>}
      <nav className={cn("flex-1 space-y-6 overflow-y-auto py-6", isCollapsed ? "px-2" : "px-3")}>
        {groups.map((g, i) => (
          <div key={g.name ?? i} className="space-y-1">
            {g.name &&
              (isCollapsed ? (
                <div className="mx-2 mb-2 border-t border-line" />
              ) : (
                <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.25em] text-muted/70">{g.name}</p>
              ))}
            {g.items.map((item) => (
              <NavEntry key={item.label} item={item} collapsed={isCollapsed} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>
      {sidebarFooter && <div className={cn("space-y-1 border-t border-line py-4", isCollapsed ? "flex flex-col items-center px-2" : "px-3")}>{renderSlot(sidebarFooter, isCollapsed)}</div>}
    </>
  );

  return (
    <div data-panel className="flex h-[100svh] overflow-hidden">
      {/* Sidebar escritorio */}
      <aside className={cn("hidden shrink-0 flex-col border-r border-line bg-bg transition-[width] duration-200 lg:flex", collapsed ? "w-20" : "w-64")}>
        <div className={cn("flex h-16 shrink-0 items-center border-b border-line", collapsed ? "justify-center" : "px-6")}>
          {collapsed ? <span className="font-display text-xl text-text">A<span className="text-gold">.</span></span> : (brand ?? <Wordmark />)}
        </div>
        {sidebarBody(collapsed)}
      </aside>

      {/* Drawer móvil */}
      {!isBottom && drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawerOpen(false)} />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-line bg-bg">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              {brand ?? <Wordmark />}
              <button onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú" className="p-1 text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarBody(false, () => setDrawerOpen(false))}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line bg-bg px-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {!isBottom && (
              <button onClick={() => setDrawerOpen(true)} aria-label="Abrir menú" className="-ml-1 p-1 text-muted hover:text-text lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
            )}
            {isBottom && <span className="lg:hidden">{brand ?? <Wordmark size="sm" />}</span>}
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
              className="-ml-1 hidden p-1 text-muted hover:text-text lg:block"
            >
              {collapsed ? <PanelLeftOpen className="h-5 w-5" strokeWidth={1.5} /> : <PanelLeftClose className="h-5 w-5" strokeWidth={1.5} />}
            </button>
            <h1 className={cn("truncate font-display text-xl uppercase leading-none text-text", isBottom && "hidden lg:block")}>{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
        </header>

        <main className={cn("flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8", isBottom && "pb-28 lg:pb-8")}>{children}</main>
      </div>

      {/* Barra inferior móvil */}
      {isBottom && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navegación principal">
          <ul className="flex">
            {nav.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const cls = cn("flex h-16 w-full flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.12em] transition-colors", item.active ? "text-gold" : "text-muted");
              const inner = (
                <>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  <span className="max-w-full truncate px-1">{item.label}</span>
                </>
              );
              return (
                <li key={item.label} className="flex-1">
                  {item.href ? (
                    <Link href={item.href} className={cls} aria-current={item.active ? "page" : undefined}>
                      {inner}
                    </Link>
                  ) : (
                    <button type="button" onClick={item.onSelect} className={cls} aria-current={item.active ? "page" : undefined}>
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
