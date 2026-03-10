import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';

export default function FeaturesSection() {
  const { features } = siteConfig;

  return (
    <section className="bg-white py-16 md:py-32 px-6 flex justify-center w-full" >
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 text-center md:text-left">
          
          <FadeIn direction="up" delay={0.1} className="flex flex-col items-center group">
            <div className="w-20 h-20 bg-[#dda124] rounded-full flex items-center justify-center mb-8 text-white shadow-[0_10px_20px_rgba(221,161,36,0.2)] group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-[0_15px_25px_rgba(221,161,36,0.4)] transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-3xl md:text-4xl font-black italic leading-[1.1] tracking-wide text-[#2d0b3f] mb-6 text-center whitespace-pre-line">
              {features[0].title}
            </h3>
            <p className="text-base text-gray-600 leading-relaxed font-normal text-center">
              {features[0].description}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.3} className="flex flex-col items-center group">
            <div className="w-20 h-20 bg-[#dda124] rounded-full flex items-center justify-center mb-8 text-white shadow-[0_10px_20px_rgba(221,161,36,0.2)] group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-[0_15px_25px_rgba(221,161,36,0.4)] transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M5.6 5.6l12.8 12.8"></path>
                <path d="M18.4 5.6L5.6 18.4"></path>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"></path>
                <path d="M2 12a15.3 15.3 0 0 1 10-4 15.3 15.3 0 0 1 10 4"></path>
              </svg>
            </div>
            <h3 className="text-3xl md:text-4xl font-black italic leading-[1.1] tracking-wide text-[#2d0b3f] mb-6 text-center whitespace-pre-line">
              {features[1].title}
            </h3>
            <p className="text-base text-gray-600 leading-relaxed font-normal text-center">
              {features[1].description}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.5} className="flex flex-col items-center group">
            <div className="w-20 h-20 bg-[#dda124] rounded-full flex items-center justify-center mb-8 text-white shadow-[0_10px_20px_rgba(221,161,36,0.2)] group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-[0_15px_25px_rgba(221,161,36,0.4)] transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </div>
            <h3 className="text-3xl md:text-4xl font-black italic leading-[1.1] tracking-wide text-[#2d0b3f] mb-6 text-center whitespace-pre-line">
              {features[2].title}
            </h3>
            <p className="text-base text-gray-600 leading-relaxed font-normal text-center">
              {features[2].description}
            </p>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
