import { cn } from "@/lib/cn";

type CardProps = {
  as?: "div" | "section" | "article";
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export function Card({ as: Tag = "div", padded = true, className, children, ...props }: CardProps) {
  return (
    <Tag className={cn("bg-surface border border-line rounded-panel", padded && "p-5 md:p-6", className)} {...props}>
      {children}
    </Tag>
  );
}
