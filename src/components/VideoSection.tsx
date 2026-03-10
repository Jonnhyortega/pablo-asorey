import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';

export default function VideoSection() {
  return (
    <section className="w-full bg-[#1e232e] py-16 md:py-24 relative overflow-hidden">
      {/* Decorative gradient background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff4a11] to-transparent opacity-40"></div>
      
      <div className="container mx-auto px-4 lg:px-8 max-w-[1200px] relative z-10">
        <FadeIn direction="up" duration={1} className="w-full">
          <div className="w-full aspect-video rounded-xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800 bg-black relative">
            <iframe
              src={siteConfig.video.url}
              title="Pablo Asorey Video"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
