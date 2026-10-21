import { cn } from "@/lib/cn";

export function SectionLabel({ tone = "gold", className, children }: { tone?: "gold" | "muted"; className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("text-[11px] md:text-xs font-medium uppercase tracking-[0.3em]", tone === "gold" ? "text-gold" : "text-muted", className)}>
      {children}
    </p>
  );
}
