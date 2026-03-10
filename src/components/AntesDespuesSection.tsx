import Image from 'next/image';
import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';

export default function AntesDespuesSection() {
  const { antesYDespues } = siteConfig;

  return (
    <section className="bg-white py-24 px-8 w-full overflow-hidden" id="antes-despues">
      <div className="w-full max-w-7xl mx-auto">
        
        <FadeIn direction="down" className="flex flex-col md:flex-row justify-between md:items-end mb-20 relative">
          <div className="flex-1">
            <h3 className="text-sm tracking-[5px] text-[#4a154b] font-extrabold italic mb-3 mt-8 uppercase">
              {antesYDespues.subtitle}
            </h3>
            <div className="w-24 h-1 bg-[#dda124] mb-6"></div>
            <h2 className="text-5xl md:text-7xl font-black italic leading-[1] tracking-wide text-[#2d0b3f] whitespace-pre-line">
              {antesYDespues.title}
            </h2>
          </div>
          
          <div className="mt-8 md:mt-0 flex justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#dda124]/40 blur-xl group-hover:bg-[#dda124]/50 transition-colors duration-300 rounded-full scale-125"></div>
              <a 
                href="https://wa.me/541160218709"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-block bg-[#dda124] text-white px-10 py-4 text-base font-extrabold italic tracking-[2px] rounded-full shadow-[0_10px_30px_rgba(221,161,36,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(221,161,36,0.5)] transition-all duration-300"
              >
                {antesYDespues.ctaText} &rarr;
              </a>
            </div>
          </div>
        </FadeIn>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center md:items-end">
          <FadeIn direction="up" delay={0.2} duration={0.8} className="relative overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.1)] w-full max-w-[500px] rounded-t-[150px] md:rounded-t-[300px] rounded-b-xl hover:scale-[1.02] transition-transform duration-500">
            <Image 
              src={antesYDespues.images[0]}
              alt="Transformación Alumno 1"
              width={500}
              height={500}
              className="w-full h-auto object-cover"
            />
          </FadeIn>
          
          <FadeIn direction="up" delay={0.4} duration={0.8} className="relative overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.1)] w-full max-w-[400px] rounded-tl-[100px] rounded-tr-xl rounded-b-xl hover:scale-[1.02] transition-transform duration-500">
            <Image 
              src={antesYDespues.images[1]}
              alt="Transformación Alumno 2"
              width={400}
              height={550}
              className="w-full h-auto object-cover object-top"
            />
          </FadeIn>
        </div>
        
      </div>
    </section>
  );
}
