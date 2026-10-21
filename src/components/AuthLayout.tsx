import Link from "next/link";
import { SectionLabel, Wordmark } from "@/components/ui";

// Pantalla dividida para los logins de alumno y profesor
export default function AuthLayout({ eyebrow, title, footer, children }: { eyebrow: string; title: string; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div data-panel className="grid min-h-[100svh] lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-bg p-12 lg:flex">
        <Link href="/" aria-label="Inicio">
          <Wordmark size="md" />
        </Link>
        <div>
          <span className="mb-8 block h-px w-16 bg-gold" aria-hidden />
          <Wordmark size="xl" className="block" />
        </div>
      </div>

      <div className="flex flex-col justify-center bg-surface px-5 py-12 sm:px-10 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" aria-label="Inicio" className="mb-14 inline-block lg:hidden">
            <Wordmark size="md" />
          </Link>
          <SectionLabel className="mb-3">{eyebrow}</SectionLabel>
          <h1 className="font-display text-4xl uppercase leading-none text-text md:text-5xl">{title}</h1>
          <div className="mt-10">{children}</div>
          {footer && <div className="mt-10 border-t border-line pt-6 text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
