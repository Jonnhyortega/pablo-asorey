import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';

export default function EntrenaSection() {
  return (
    <section className="relative bg-white pt-32 px-6 pb-20 overflow-hidden flex justify-center w-full" id="empresa">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] md:text-[18vw] font-black italic text-black/5 z-0 pointer-events-none whitespace-nowrap tracking-tighter">
        {siteConfig.entrena.watermark}
      </div>
      
      <FadeIn direction="up" duration={0.6} className="relative z-10 w-full max-w-6xl mx-auto flex flex-col">
        <div className="mb-12 flex flex-col text-center md:text-left">
          <h3 className="text-sm tracking-[5px] text-[#4a154b] font-extrabold italic mb-3 drop-shadow-sm uppercase">
            {siteConfig.entrena.subtitle}
          </h3>
          <div className="w-[150px] h-1 bg-[#dda124] mx-auto md:mx-0 rounded-full"></div>
        </div>
        
        <div className="flex flex-col gap-8">
          <p className="text-xl md:text-3xl font-bold italic text-[#2d0b3f] max-w-5xl leading-relaxed tracking-wide text-center md:text-left drop-shadow-sm">
            {siteConfig.entrena.description}
          </p>
          <div className="flex justify-center md:justify-end mt-8">
            <a 
              href="https://wa.me/541160218709"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#dda124] text-white border border-black/5 py-4 px-12 text-sm font-extrabold italic tracking-[2px] rounded-full shadow-lg hover:bg-[#2d0b3f] hover:text-white hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(221,161,36,0.3)] transition-all duration-300"
            >
              {siteConfig.entrena.ctaText} &rarr;
            </a>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
