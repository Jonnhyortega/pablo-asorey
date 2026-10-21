import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import { Button, SectionLabel } from "@/components/ui";
import { cn } from "@/lib/cn";
import FadeIn from "./animations/FadeIn";

export default function HistoriaTimeline() {
  const { historia } = getSiteContent();

  return (
    <section className="bg-bg pb-24 md:pb-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <FadeIn direction="up" className="border-b border-line py-20 md:py-28">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-10 bg-gold" aria-hidden />
            <SectionLabel>{historia.heroSubtitle}</SectionLabel>
          </div>
          <h1 className="font-display uppercase leading-[0.88] text-text" style={{ fontSize: "clamp(4rem, 12vw, 10rem)" }}>
            {historia.heroTitle}
          </h1>
        </FadeIn>

        <ol>
          {historia.timeline.map((item, index) => (
            <li key={item.year + item.title} className="grid gap-10 border-b border-line py-16 md:grid-cols-[200px_1fr] md:gap-12 md:py-24 lg:grid-cols-[240px_1fr_1fr]">
              <FadeIn direction="up" className="md:sticky md:top-28 md:self-start">
                <span className="font-display text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-2 font-display text-4xl uppercase leading-none text-gold md:text-5xl">{item.year}</p>
              </FadeIn>

              <FadeIn direction="up" delay={0.1}>
                <h2 className="font-display text-3xl uppercase leading-tight text-text md:text-4xl">{item.title}</h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
                  {item.paragraphs.map((text, i) => (
                    <p key={i}>{text}</p>
                  ))}
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={0.2} className="md:col-span-2 lg:col-span-1">
                <div className={cn("grid gap-2", item.images.length > 1 && "grid-cols-2")}>
                  {item.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "relative overflow-hidden border border-line bg-surface",
                        item.images.length === 3 && idx === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${item.title} - Imagen Gráfica ${idx + 1}`}
                        fill
                        sizes="(min-width: 1024px) 30vw, 90vw"
                        className="object-cover saturate-[.75] transition-transform duration-700 hover:scale-[1.03]"
                      />
                    </div>
                  ))}
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>

        <FadeIn direction="up" className="pt-16 md:pt-24">
          <Button variant="primary" size="lg" href={historia.ctaHref} external className="group rounded-brand">
            {historia.ctaText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
