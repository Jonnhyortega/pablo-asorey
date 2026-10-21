import { SectionLabel } from "./SectionLabel";

export function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 md:mb-8">
      <div className="min-w-0">
        {eyebrow && <SectionLabel tone="muted" className="mb-2">{eyebrow}</SectionLabel>}
        <h1 className="font-display text-3xl md:text-4xl uppercase leading-none text-text truncate">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
