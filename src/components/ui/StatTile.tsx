import { cn } from "@/lib/cn";

type StatTileProps = {
  label: string;
  value: string | number;
  suffix?: React.ReactNode;
  tone?: "default" | "gold";
  progress?: number;
  className?: string;
};

export function StatTile({ label, value, suffix, tone = "default", progress, className }: StatTileProps) {
  const pct = progress === undefined ? undefined : Math.min(1, Math.max(0, progress)) * 100;

  return (
    <div className={cn("bg-surface border border-line rounded-panel p-4 md:p-5 min-w-0", className)}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted truncate">{label}</p>
      <p className="mt-2 flex items-baseline gap-2 min-w-0">
        <span className={cn("font-display text-3xl md:text-4xl leading-none tabular-nums", tone === "gold" ? "text-gold" : "text-text")}>
          {value}
        </span>
        {suffix && <span className="text-xs text-muted truncate">{suffix}</span>}
      </p>
      {pct !== undefined && (
        <div className="mt-4 h-[3px] bg-line" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
