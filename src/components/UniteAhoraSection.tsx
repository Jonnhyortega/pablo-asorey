import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';
import Image from 'next/image';

export default function UniteAhoraSection() {
  const { uniteAhora, planes } = siteConfig;
  const whatsappUrl = `https://wa.me/${planes.contactInfo.whatsapp.replace(/\D/g, '')}`;

  return (
    <section className="relative w-full min-h-[50vh] md:min-h-[60vh] flex items-center justify-center my-20 overflow-hidden 
      [clip-path:polygon(0_10%,100%_0%,100%_90%,0%_100%)] md:[clip-path:polygon(0_15%,100%_0%,100%_85%,0%_100%)]">
      
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Usamos next/image que maneja mejor la carga en iOS y eliminamos animations de hardware acceleration problematicas en Safari */}
        <div className="absolute inset-0 md:fixed w-full h-full -z-10">
          <Image 
            src={uniteAhora.image}
            alt={uniteAhora.title}
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.8)_100%)] z-10"></div>
      </div>
      
      <FadeIn direction="up" duration={1} className="relative z-20 text-center text-white p-8 max-w-4xl flex flex-col items-center">
        <h2 className="text-5xl md:text-[5rem] font-black italic tracking-widest leading-none mb-4 drop-shadow-[2px_2px_15px_rgba(0,0,0,0.5)]">
          {uniteAhora.title}
        </h2>
        <p className="text-lg md:text-xl font-normal mb-10 drop-shadow-[1px_1px_5px_rgba(0,0,0,0.8)] text-gray-200">
          {uniteAhora.subtitle}
        </p>
        
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gradient-to-r from-[#dda124] to-[#dda124] text-white border-none px-12 py-4 text-base font-extrabold italic tracking-[3px] rounded-full shadow-[0_10px_20px_rgba(221,161,36,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(221,161,36,0.6)] transition-all duration-300"
        >
          {uniteAhora.ctaText} &rarr;
        </a>
      </FadeIn>
    </section>
  );
}
