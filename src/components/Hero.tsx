import Image from 'next/image';
import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';
import Hero3DLogo from './Hero3DLogo';

export default function Hero() {
  return (
    <section className="relative w-full h-[100vh] min-h-[700px] overflow-hidden bg-[#2d0b3f] flex flex-col items-center pt-[15vh] md:pt-[20vh]">
      
      {/* RUIDO SUTIL DE FONDO (Opcional para dar textura) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      ></div>

      {/* CONTENIDO PRINCIPAL TEXTOS */}
      <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center px-6 pointer-events-none">
        
        <FadeIn direction="down" duration={1} delay={0.2} className="flex flex-col items-center w-full">
          
          {/* Subtítulo Superior con líneas doradas */}
          <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-6">
              <div className="w-8 md:w-16 h-[2px] bg-[#dda124] shadow-[0_0_5px_rgba(221,161,36,0.5)]"></div>
              <h3 className="text-white text-[9px] md:text-sm tracking-[3px] md:tracking-[8px] font-black italic drop-shadow-md whitespace-nowrap">
                  {siteConfig.hero.subtitle}
              </h3>
              <div className="w-8 md:w-16 h-[2px] bg-[#dda124] shadow-[0_0_5px_rgba(221,161,36,0.5)]"></div>
          </div>

          {/* GRAN TÍTULO PRINCIPAL DIVIDIDO */}
          <div className="flex flex-col items-center">
            <h1 
                className="text-white font-black italic m-0 p-0 leading-[0.95] tracking-tight text-center drop-shadow-[5px_10px_15px_rgba(0,0,0,0.6)]"
                style={{ fontSize: 'clamp(4rem, 16vw, 12rem)' }}
            >
                PABLO
            </h1>

            <h1 
                className="text-white font-black italic m-0 p-0 leading-[0.95] tracking-tight text-center drop-shadow-[5px_10px_15px_rgba(0,0,0,0.6)]"
                style={{ fontSize: 'clamp(4rem, 16vw, 12rem)' }}
            >
                ASOREY
            </h1>
          </div>

          {/* Subtítulo Inferior */}
          <h2 className="text-gray-300 text-[9px] md:text-xs tracking-[4px] md:tracking-[7px] font-medium mt-4 md:mt-6 uppercase drop-shadow-lg opacity-90 z-20 text-center">
              {siteConfig.hero.secondarySubtitle}
          </h2>

          {/* Botón Call to Action Intercalado */}
          <div className="mt-8 md:mt-10 pointer-events-auto z-50">
            <a 
                href="https://wa.me/541160218709"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-[#fc581e] to-[#fb4208] text-white px-8 md:px-10 py-3 md:py-4 text-xs md:text-sm font-black italic tracking-[3px] md:tracking-[4px] rounded-[30px] shadow-[0_15px_30px_rgba(252,88,30,0.5)] hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 relative overflow-hidden group border-2 border-transparent hover:border-white/20"
            >
                <span className="relative z-10">{siteConfig.hero.ctaText}</span>
                <span className="text-lg md:text-xl font-normal relative z-10 group-hover:translate-x-1 transition-transform">&rarr;</span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
          </div>

        </FadeIn>
      </div>

      {/* LOGO 3D (Z-10 para quedar debajo de los textos si se asoma o simplemente en el fondo) */}
      <div className="absolute bottom-[-15%] md:bottom-[-25%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] pointer-events-auto z-10 flex items-center justify-center">
          <Hero3DLogo />
      </div>

      {/* GRADIENTE DE SOMBRA INFERIOR PARA INTEGRAR CON LA SIGUIENTE SECCIÓN */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[rgba(0,0,0,0.5)] to-transparent z-20 pointer-events-none"></div>

    </section>
  );
}
