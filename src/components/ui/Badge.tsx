import { cn } from "@/lib/cn";

type Tone = "neutral" | "gold" | "success" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-line text-muted",
  gold: "border-gold-line text-gold",
  success: "border-success/40 text-success",
  danger: "border-danger/40 text-danger",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] whitespace-nowrap rounded-[2px]", tones[tone], className)}>
      {children}
    </span>
  );
}
