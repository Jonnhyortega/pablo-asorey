import Image from 'next/image';
import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';

export default function CasoExitoSection() {
  const { casoExito } = siteConfig;

  return (
    <section className="bg-white py-16 md:py-32 px-6 md:px-12 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-16">
        
        <FadeIn direction="left" className="flex-1 max-w-2xl w-full">
          <div className="mb-8">
            <h3 className="text-sm tracking-[5px] text-[#4a154b] font-extrabold italic mb-4 uppercase">
              {casoExito.subtitle}
            </h3>
            <div className="w-24 h-[2px] bg-[#dda124]"></div>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic leading-[1] text-[#2d0b3f]">
            {casoExito.titlePrefix}<br />
            <span className="font-light tracking-[4px] block mt-2 text-[#dda124]">
              {casoExito.name}
            </span>
          </h2>
        </FadeIn>

        <FadeIn direction="right" delay={0.2} className="flex-1 flex justify-end relative w-full">
          <div className="relative overflow-hidden rounded-tl-[150px] md:rounded-tl-[400px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] w-full max-w-[600px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-shadow duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
            <Image 
              src={casoExito.image}
              alt={casoExito.name}
              width={600}
              height={500}
              className="w-full h-auto block object-cover transform hover:scale-105 transition-transform duration-700"
            />
          </div>
        </FadeIn>
        
      </div>
    </section>
  );
}
