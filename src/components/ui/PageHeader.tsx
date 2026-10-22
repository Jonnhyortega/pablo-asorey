import { SectionLabel } from "./SectionLabel";

export function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow && <SectionLabel tone="muted" className="mb-2">{eyebrow}</SectionLabel>}
        <h1 className="font-display text-3xl md:text-4xl uppercase leading-[0.95] text-text text-balance">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 xl:shrink-0">{actions}</div>}
    </div>
  );
}
