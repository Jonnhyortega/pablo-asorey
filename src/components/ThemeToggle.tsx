"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const subscribeNoop = () => () => {};

export function ThemeToggle({ isCollapsed }: { isCollapsed?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  if (!mounted) {
    return <div className="h-10 w-10" />;
  }

  const isDark = resolvedTheme !== "light";
  const label = isDark ? "Modo claro" : "Modo oscuro";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex h-10 items-center rounded-panel text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text",
        isCollapsed ? "w-10 justify-center" : "w-full gap-3 px-3"
      )}
      title={label}
      aria-label={label}
    >
      {isDark ? <Sun className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} /> : <Moon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />}
      {!isCollapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
