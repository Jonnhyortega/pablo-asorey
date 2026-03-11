import Image from 'next/image';
import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';
import { CheckCircle2 } from 'lucide-react';

export default function ValoresSection() {
  const { valores } = siteConfig;

  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-[#2d0b3f]" id="valores">
      
      {/* Contenedor de la Imagen de Fondo */}
      <div className="absolute top-0 right-0 w-full md:w-[60%] h-full z-0 opacity-80 md:opacity-100">
          <Image 
            src={valores.image}
            alt={valores.title}
            fill
            className="object-cover object-center md:object-right"
          />
          {/* Overlay oscuro suave para fundir suavemente solo en los bordes y proteger la lectura */}
          <div className="absolute inset-0 bg-linear-to-b md:bg-linear-to-r from-[#2d0b3f] via-[#2d0b3f]/70 to-transparent"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col p-8 md:p-16 lg:p-24 pointer-events-none">
        <FadeIn direction="right" duration={0.8} className="flex flex-col justify-center max-w-2xl text-white pointer-events-auto">
          <div className="mb-10 md:mb-14">
            <h3 className="text-xs md:text-sm tracking-[6px] text-[#dda124] font-extrabold italic mb-4 uppercase drop-shadow-md">
              {valores.subtitle}
            </h3>
            <div className="w-16 h-[3px] bg-[#fc581e] mb-6 shadow-[0_0_10px_rgba(252,88,30,0.6)]"></div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black italic leading-[0.95] tracking-tight text-white drop-shadow-2xl whitespace-pre-line">
              {valores.title}
            </h2>
          </div>
          
          <ul className="flex flex-col gap-6 md:gap-8 mb-12 list-none p-0">
            {valores.items.map((valor, index) => (
              <li key={index} className="flex items-start md:items-center text-gray-100 font-bold text-lg md:text-xl lg:text-2xl tracking-wide group">
                <CheckCircle2 className="text-[#fc581e] w-6 h-6 md:w-8 md:h-8 mr-4 md:mr-6 flex-shrink-0 mt-1 md:mt-0 drop-shadow-[0_0_8px_rgba(252,88,30,0.6)] group-hover:scale-110 group-hover:text-[#dda124] transition-all duration-300" />
                <span className="drop-shadow-lg text-white/95">{valor}</span>
              </li>
            ))}
          </ul>
          
          <a 
            href="https://wa.me/541160218709"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start inline-flex items-center gap-3 bg-gradient-to-r from-[#fc581e] to-[#fb4208] text-white px-10 md:px-12 py-4 md:py-5 text-xs md:text-sm font-black italic tracking-[3px] md:tracking-[4px] rounded-full shadow-[0_15px_30px_rgba(252,88,30,0.4)] hover:scale-105 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border-2 border-transparent hover:border-white/20"
          >
            <span className="relative z-10">{valores.ctaText}</span>
            <span className="text-xl md:text-2xl font-normal relative z-10 group-hover:translate-x-1 transition-transform">&rarr;</span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
