import Image from 'next/image';
import { getSiteContent } from '@/lib/content';
import { SectionLabel } from '@/components/ui';
import FadeIn from './animations/FadeIn';

export default async function CasoExitoSection() {
  const { casoExito } = await getSiteContent();

  return (
    <section className="border-t border-line bg-bg py-24 md:py-32">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 md:px-8 lg:grid-cols-2">
        <FadeIn direction="up">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-10 bg-gold" aria-hidden />
            <SectionLabel>{casoExito.subtitle}</SectionLabel>
          </div>
          <h2 className="font-display text-5xl uppercase leading-[0.92] text-text md:text-7xl">
            {casoExito.titlePrefix}
            <br />
            <span className="text-gold">{casoExito.name}</span>
          </h2>
        </FadeIn>
        <FadeIn direction="up" delay={0.15}>
          <Image
            src={casoExito.image}
            alt={casoExito.name}
            width={600}
            height={500}
            className="h-auto w-full border border-line object-cover"
          />
        </FadeIn>
      </div>
    </section>
  );
}
