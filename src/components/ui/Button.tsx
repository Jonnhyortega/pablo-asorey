import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
  external?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variants: Record<Variant, string> = {
  primary: "bg-gold text-bg hover:brightness-110",
  secondary: "border border-line text-text hover:border-gold hover:text-gold",
  ghost: "text-muted hover:text-text hover:bg-surface-2",
  danger: "border border-danger/40 text-danger hover:bg-danger hover:text-bg",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs gap-2",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-14 px-8 text-sm gap-3",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  href,
  external = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-panel font-medium uppercase tracking-[0.15em] transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className
  );

  const content = (
    <>
      {loading && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span className="sr-only">Cargando</span>
        </>
      )}
      {children}
    </>
  );

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
