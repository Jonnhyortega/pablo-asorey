import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getSiteContent } from '@/lib/content';
import { Button, SectionLabel } from '@/components/ui';
import FadeIn from './animations/FadeIn';

export default function ValoresSection() {
  const { valores } = getSiteContent();

  return (
    <section id="valores" className="relative overflow-hidden border-t border-line bg-bg py-24 md:py-32">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 md:px-8 lg:grid-cols-[7fr_5fr]">
        <FadeIn direction="up">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-10 bg-gold" aria-hidden />
            <SectionLabel>{valores.subtitle}</SectionLabel>
          </div>
          <h2 className="font-display text-5xl uppercase leading-[0.92] text-text md:text-7xl">{valores.title}</h2>

          <ol className="mt-12 border-t border-line">
            {valores.items.map((valor, i) => (
              <li key={valor} className="group flex items-baseline gap-6 border-b border-line py-5 md:py-6">
                <span className="w-8 shrink-0 font-display text-sm text-gold">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-2xl uppercase leading-tight text-text transition-colors group-hover:text-gold md:text-3xl">
                  {valor}
                </span>
              </li>
            ))}
          </ol>

          <Button variant="primary" size="lg" href={valores.ctaHref} external className="group mt-12 rounded-brand">
            {valores.ctaText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </FadeIn>

        <FadeIn direction="up" delay={0.15} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute inset-x-6 bottom-0 top-16 border border-line bg-surface" aria-hidden />
          <Image
            src={valores.image}
            alt={valores.title}
            width={600}
            height={800}
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="relative h-auto w-full object-contain saturate-[.8]"
          />
        </FadeIn>
      </div>
    </section>
  );
}
