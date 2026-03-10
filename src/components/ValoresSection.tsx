import Image from 'next/image';
import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';

export default function ValoresSection() {
  const { valores } = siteConfig;

  return (
    <section className="relative w-full min-h-[80vh] flex overflow-hidden bg-[#dda124]" id="valores">
      {/* Background shape */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#dda124] to-[#dda124] z-10 
        [clip-path:polygon(0_0,100%_0,100%_85%,0%_100%)] md:[clip-path:ellipse(150%_100%_at_-20%_0%)]"></div>
      
      <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col md:flex-row p-8 md:p-16">
        <FadeIn direction="right" duration={0.8} className="flex-1 flex flex-col justify-center max-w-2xl text-white">
          <div className="mb-8 md:ml-5">
            <h3 className="text-sm tracking-[5px] text-white font-extrabold italic mb-2 uppercase drop-shadow-md">
              {valores.subtitle}
            </h3>
            <div className="w-10 h-1 bg-white mb-4"></div>
            <h2 className="text-4xl md:text-6xl font-black italic leading-[1.1] tracking-wide text-white drop-shadow-[0_4px_15px_rgba(255,255,255,0.4)] whitespace-pre-line">
              {valores.title}
            </h2>
          </div>
          
          <ul className="flex flex-col gap-6 mb-12 list-none p-0">
            {valores.items.map((valor, index) => (
              <li key={index} className="flex items-center text-white font-bold text-lg md:text-xl tracking-wide group">
                <span className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                </span>
                {valor}
              </li>
            ))}
          </ul>
          
          <a 
            href="https://wa.me/541160218709"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start inline-block bg-white text-[#dda124] border-none px-10 py-4 text-base font-extrabold italic tracking-[2px] rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(0,0,0,0.25)] transition-all duration-300"
          >
            {valores.ctaText} &rarr;
          </a>
        </FadeIn>
        
        <FadeIn direction="left" delay={0.3} duration={1} className="flex-1 right-0 top-0 absolute md:relative w-full h-full -z-10 md:z-0">
          <Image 
            src={valores.image}
            alt={valores.title}
            fill
            className="object-cover object-right-top w-full h-full"
          />
        </FadeIn>
      </div>
    </section>
  );
}
