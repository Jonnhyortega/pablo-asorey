import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getSiteContent } from '@/lib/content';
import { Button } from '@/components/ui';
import FadeIn from './animations/FadeIn';

export default async function UniteAhoraSection() {
  const { uniteAhora, planes } = await getSiteContent();
  const whatsappUrl = `https://wa.me/${planes.contactInfo.whatsapp.replace(/\D/g, '')}`;

  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden border-t border-line">
      <Image src={uniteAhora.image} alt={uniteAhora.title} fill sizes="100vw" className="object-cover saturate-[.6]" />
      <div className="absolute inset-0 bg-bg/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/60 to-transparent" />

      <FadeIn direction="up" className="relative mx-auto w-full max-w-[1200px] px-5 py-24 md:px-8">
        <h2 className="font-display uppercase leading-[0.88] text-text" style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)' }}>
          {uniteAhora.title}
        </h2>
        <p className="mt-6 max-w-md text-base text-muted md:text-lg">{uniteAhora.subtitle}</p>
        <Button variant="primary" size="lg" href={whatsappUrl} external className="group mt-10 rounded-brand">
          {uniteAhora.ctaText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </FadeIn>
    </section>
  );
}
