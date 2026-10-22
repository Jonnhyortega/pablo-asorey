import Image from 'next/image';
import {
  Laptop, Dumbbell, Flame, UserCheck,
  Check, RefreshCw, Search, Apple,
  Video, Trophy, Building2, Handshake, Calendar,
  type LucideIcon,
} from 'lucide-react';
import { getSiteContent } from '@/lib/content';
import { Badge, Button, SectionLabel } from '@/components/ui';
import { cn } from '@/lib/cn';
import FadeIn from './animations/FadeIn';

const iconMap: Record<string, LucideIcon> = {
  laptop: Laptop,
  dumbbell: Dumbbell,
  flame: Flame,
  'user-check': UserCheck,
  check: Check,
  refresh: RefreshCw,
  search: Search,
  apple: Apple,
  video: Video,
  trophy: Trophy,
  building: Building2,
  handshake: Handshake,
  calendar: Calendar,
};

export default async function PlanesSection() {
  const { planes, social } = await getSiteContent();
  const whatsappUrl = `https://wa.me/${planes.contactInfo.whatsapp.replace(/\D/g, '')}`;

  return (
    <section id="planes" className="border-t border-line bg-bg py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <FadeIn direction="up" className="mb-12 md:mb-16">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-10 bg-gold" aria-hidden />
            <SectionLabel>{planes.subtitle}</SectionLabel>
          </div>
          <h2 className="font-display text-5xl uppercase leading-[0.92] text-text md:text-7xl">{planes.title}</h2>
        </FadeIn>

        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
          {planes.items.map((plan, index) => {
            const PlanIcon = iconMap[plan.icon];
            const logo = (plan as { logo?: string }).logo;
            return (
              <FadeIn
                key={plan.id}
                direction="up"
                delay={0.08 * index}
                className={cn(
                  'relative flex min-w-[85%] snap-center flex-col border bg-surface p-6 md:min-w-0 md:p-7',
                  plan.highlight ? 'border-gold' : 'border-line'
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-6 bg-bg px-1">
                    <Badge tone="gold">{planes.recommendedLabel}</Badge>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[11px] font-medium uppercase leading-relaxed tracking-[0.2em] text-muted">{plan.name}</h3>
                  {logo ? (
                    <Image src={logo} alt="" width={48} height={48} className="h-10 w-10 shrink-0 object-contain opacity-80" />
                  ) : (
                    PlanIcon && <PlanIcon className="h-6 w-6 shrink-0 text-gold" strokeWidth={1.25} />
                  )}
                </div>

                <div className="mt-8 border-b border-line pb-8">
                  <p className={cn('font-display text-5xl leading-none tabular-nums', plan.highlight ? 'text-gold' : 'text-text')}>{plan.price}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted">{planes.priceSuffix}</p>
                </div>

                <ul className="mt-8 flex-1 space-y-4">
                  {plan.features.map((feature) => {
                    const FeatureIcon = iconMap[feature.icon] ?? Check;
                    return (
                      <li key={feature.text} className="flex gap-3 text-sm leading-snug text-text/90">
                        <FeatureIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} />
                        <span>{feature.text}</span>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  variant={plan.highlight ? 'primary' : 'secondary'}
                  href={planes.ctaHref}
                  external
                  className="mt-10 w-full rounded-brand"
                >
                  {planes.ctaText}
                </Button>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn direction="up" className="mt-12 flex flex-col gap-px border border-line bg-line sm:flex-row">
          <a
            href={social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 flex-col gap-1 bg-bg px-6 py-5 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">{planes.followLabel}</span>
            <span className="font-display text-lg text-text">{planes.contactInfo.instagram}</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 flex-col gap-1 bg-bg px-6 py-5 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">{planes.writeLabel}</span>
            <span className="font-display text-lg text-text">{planes.contactInfo.whatsapp}</span>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
