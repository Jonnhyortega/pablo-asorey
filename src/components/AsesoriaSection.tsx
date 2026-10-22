import { ArrowRight } from 'lucide-react';
import { getSiteContent } from '@/lib/content';
import { Button, SectionLabel } from '@/components/ui';
import FadeIn from './animations/FadeIn';
import LiteYouTube from './LiteYouTube';

export default async function AsesoriaSection() {
  const { entrena, video } = await getSiteContent();

  return (
    <section id="empresa" className="relative overflow-hidden border-t border-line bg-bg py-24 md:py-32">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-6 right-0 select-none font-display text-[clamp(6rem,20vw,16rem)] uppercase leading-none text-transparent [-webkit-text-stroke:1px_var(--line)]"
      >
        {entrena.watermark}
      </span>

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 md:px-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <FadeIn direction="up">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-10 bg-gold" aria-hidden />
            <SectionLabel>{entrena.subtitle}</SectionLabel>
          </div>
          <p className="text-base leading-relaxed text-muted md:text-lg">{entrena.description}</p>
          <Button variant="secondary" size="lg" href={entrena.ctaHref} external className="group mt-10 rounded-brand">
            {entrena.ctaText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </FadeIn>

        <FadeIn direction="up" delay={0.15}>
          <div className="relative border border-line p-2 md:p-3">
            <span className="absolute -left-px -top-px h-6 w-6 border-l border-t border-gold" aria-hidden />
            <span className="absolute -bottom-px -right-px h-6 w-6 border-b border-r border-gold" aria-hidden />
            <LiteYouTube url={video.url} title={video.title} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
