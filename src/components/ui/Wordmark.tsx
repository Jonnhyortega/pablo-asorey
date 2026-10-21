import { cn } from "@/lib/cn";

const sizes = {
  sm: "text-base tracking-[0.08em]",
  md: "text-xl tracking-[0.08em]",
  lg: "text-3xl tracking-[0.06em]",
  xl: "text-[clamp(4rem,14vw,12rem)] tracking-[0.02em]",
};

export function Wordmark({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span className={cn("font-display uppercase leading-none text-text", sizes[size], className)}>
      ASOREY<span className="text-gold">.</span>
    </span>
  );
}
