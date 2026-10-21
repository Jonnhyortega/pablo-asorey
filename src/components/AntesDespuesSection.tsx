import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getSiteContent } from '@/lib/content';
import { Button, SectionLabel } from '@/components/ui';
import FadeIn from './animations/FadeIn';

export default function AntesDespuesSection() {
  const { antesYDespues } = getSiteContent();

  return (
    <section id="antes-despues" className="border-t border-line bg-bg py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <FadeIn direction="up" className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-10 bg-gold" aria-hidden />
              <SectionLabel>{antesYDespues.subtitle}</SectionLabel>
            </div>
            <h2 className="whitespace-pre-line font-display text-5xl uppercase leading-[0.92] text-text md:text-7xl">{antesYDespues.title}</h2>
          </div>
          <Button variant="secondary" size="lg" href={antesYDespues.ctaHref} external className="group shrink-0 self-start rounded-brand md:self-auto">
            {antesYDespues.ctaText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </FadeIn>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {antesYDespues.images.map((src, i) => (
            <FadeIn key={src} direction="up" delay={0.1 * (i + 1)} className={i === 1 ? 'md:mt-16' : ''}>
              <figure className="relative overflow-hidden border border-line bg-surface">
                <Image
                  src={src}
                  alt={antesYDespues.imageAlts[i] ?? ''}
                  width={800}
                  height={900}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
                <figcaption className="absolute bottom-0 left-0 border-r border-t border-line bg-bg px-4 py-2 font-display text-sm text-gold">
                  {String(i + 1).padStart(2, '0')}
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
