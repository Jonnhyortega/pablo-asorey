import Image from "next/image";
import { siteConfig } from "@/config/site";
import FadeIn from "./animations/FadeIn";

export default function HistoriaTimeline() {
  const { historia } = siteConfig;

  return (
    <section className="bg-[#1e232e] py-16 md:py-24 px-6 md:px-12 w-full overflow-hidden">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center">
        
        {/* Header Title */}
        <FadeIn direction="down" duration={1} className="w-full text-center mb-24 lg:mb-32">
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black italic tracking-tighter drop-shadow-xl text-white mb-4">
            {historia.heroTitle}
          </h1>
          <h2 className="text-sm md:text-lg text-[#ff4a11] uppercase tracking-[5px] md:tracking-[8px] font-extrabold">
            {historia.heroSubtitle}
          </h2>
          <div className="w-24 h-[2px] bg-[#ff4a11] mx-auto mt-8 opacity-80 shadow-[0_0_10px_rgba(255,74,17,0.8)]"></div>
        </FadeIn>

        {/* Timeline Timeline */}
        <div className="w-full flex flex-col gap-24 md:gap-40 relative">
          
          {/* Timeline central line trace hidden in smaller screens */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2 z-0"></div>

          {historia.timeline.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <div key={index} className={`relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 md:gap-16 lg:gap-24 w-full z-10`}>
                
                {/* Year Badge at Center for Large Screens */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-[#1e232e] border-4 border-[#ff4a11] rounded-full items-center justify-center z-20 shadow-[0_0_20px_rgba(255,74,17,0.3)]">
                  <span className="text-white font-black italic text-sm">{index + 1}</span>
                </div>

                {/* Text Content */}
                <div className={`w-full lg:w-1/2 flex flex-col ${isEven ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'}`}>
                  <FadeIn direction={isEven ? "right" : "left"} duration={1} delay={0.2}>
                    <span 
                      className="block text-[#ff4a11] text-5xl md:text-6xl font-black mb-2 italic drop-shadow-md"
                      style={{ WebkitTextStroke: '1px rgba(255,74,17,0.5)', color: 'transparent' }}
                    >
                      {item.year}
                    </span>
                    <h3 className="text-2xl md:text-4xl font-black italic mb-6 text-white drop-shadow-md uppercase">
                      {item.title}
                    </h3>
                    <div className="flex flex-col gap-4 text-gray-300 text-base md:text-lg leading-relaxed relative">
                      {item.paragraphs.map((text, i) => (
                        <p key={i}>{text}</p>
                      ))}
                    </div>
                  </FadeIn>
                </div>

                {/* Imagery Grid Box */}
                <div className="w-full lg:w-1/2 flex justify-center lg:block relative">
                  <FadeIn direction={isEven ? "left" : "right"} duration={1} delay={0.4} className="w-full relative">
                      {/* Generando el mosaico dinamico según cantidad de imagenes */}
                      <div className={`grid gap-4 w-full h-[400px] md:h-[500px] ${item.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {item.images.map((img, idx) => {
                              // Si son 3 imágenes, la primera domina arriba y las otras dos abajo
                              const isFirstOfThree = item.images.length === 3 && idx === 0;
                              return (
                                <div 
                                    key={idx} 
                                    className={`relative rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.6)] group bg-black/50 border border-white/5 ${isFirstOfThree ? 'col-span-2 row-span-2' : ''}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1e232e]/80 z-10"></div>
                                    <Image 
                                      src={img} 
                                      alt={`${item.title} - Imagen Gráfica ${idx + 1}`} 
                                      fill 
                                      className="object-cover object-center group-hover:scale-110 group-hover:rotate-1 transition-all duration-[800ms] ease-out"
                                    />
                                </div>
                              );
                          })}
                      </div>
                  </FadeIn>
                </div>

              </div>
            );
          })}
        </div>

        {/* Final CTA Foot */}
        <FadeIn direction="up" duration={1} delay={0.5} className="mt-32 mb-10 w-full flex justify-center">
            <a 
              href="https://wa.me/541160218709"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#fc581e] to-[#fb4208] text-white px-10 py-5 text-sm md:text-base font-black italic tracking-[4px] rounded-[40px] shadow-[0_15px_30px_rgba(255,74,17,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,74,17,0.7)] hover:scale-105 transition-all duration-300 flex items-center gap-3 relative overflow-hidden group border-none"
            >
              <span className="relative z-10">QUIERO CREAR MI HISTORIA</span>
              <span className="text-xl md:text-2xl font-normal relative z-10 group-hover:translate-x-1 transition-transform">&rarr;</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
        </FadeIn>

      </div>
    </section>
  );
}
