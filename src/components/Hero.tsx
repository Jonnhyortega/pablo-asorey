import Image from 'next/image';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { getSiteContent } from '@/lib/content';
import { Button, SectionLabel } from '@/components/ui';
import FadeIn from './animations/FadeIn';

export default async function Hero() {
  const { hero, name } = await getSiteContent();

  return (
    <section className="relative flex min-h-[100svh] w-full items-end overflow-hidden bg-bg md:items-center">
      {/* Foto: detrás del texto en móvil, mitad derecha en escritorio */}
      <div className="absolute inset-0 md:left-auto md:w-[58%]">
        <Image
          src={hero.image}
          alt={name}
          fill
          priority
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover object-top saturate-[.7] contrast-[1.05] opacity-60 md:opacity-100 [mask-image:linear-gradient(to_bottom,black_45%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_40%)]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent md:hidden" />
      </div>

      {/* Línea vertical decorativa */}
      <div className="absolute left-5 top-0 hidden h-full w-px bg-line md:left-8 lg:block" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 pb-16 pt-32 md:px-8 md:pb-0 md:pt-20 lg:pl-20">
        <FadeIn direction="up" duration={0.9}>
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-10 bg-gold" aria-hidden />
            <SectionLabel>{hero.subtitle}</SectionLabel>
          </div>

          <h1 className="font-display uppercase leading-[0.88] text-text" style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}>
            {hero.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-6 text-xs uppercase tracking-[0.35em] text-muted md:text-sm">{hero.secondarySubtitle}</p>

          <div className="mt-10">
            <Button variant="primary" size="lg" href={hero.ctaHref} external className="group rounded-brand">
              {hero.ctaText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </FadeIn>
      </div>

      <a
        href="#empresa"
        aria-label="Bajar"
        className="absolute bottom-8 left-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 items-center justify-center border border-line text-muted transition-colors hover:border-gold hover:text-gold md:flex"
      >
        <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
      </a>
    </section>
  );
}
