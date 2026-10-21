import { getSiteContent } from '@/lib/content';
import FadeIn from './animations/FadeIn';

export default function FeaturesSection() {
  const { features } = getSiteContent();

  return (
    <section className="border-t border-line bg-bg">
      <div className="mx-auto grid max-w-[1200px] md:grid-cols-3">
        {features.map((feature, i) => (
          <FadeIn
            key={feature.title}
            direction="up"
            delay={0.1 * i}
            className="border-b border-line px-5 py-14 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:py-20 md:last:border-r-0"
          >
            <span className="font-display text-sm text-gold">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-6 whitespace-pre-line font-display text-3xl uppercase leading-[0.95] text-text md:text-4xl">{feature.title}</h3>
            <p className="mt-6 text-sm leading-relaxed text-muted">{feature.description}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
