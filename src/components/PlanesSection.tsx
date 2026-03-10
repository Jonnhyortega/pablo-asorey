import Image from 'next/image';
import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';
import { 
  Laptop, Dumbbell, Flame, UserCheck, 
  CheckCircle2, RefreshCw, Search, Apple, 
  Video, Trophy, Building2, Handshake, Calendar
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'laptop': <Laptop className="w-8 h-8" strokeWidth={2.5} />,
  'dumbbell': <Dumbbell className="w-8 h-8" strokeWidth={2.5} />,
  'flame': <Flame className="w-8 h-8" strokeWidth={2.5} />,
  'user-check': <UserCheck className="w-8 h-8" strokeWidth={2.5} />,
  'check': <CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={2.5} />,
  'refresh': <RefreshCw className="w-5 h-5 text-blue-400" strokeWidth={2.5} />,
  'search': <Search className="w-5 h-5 text-purple-400" strokeWidth={2.5} />,
  'apple': <Apple className="w-5 h-5 text-red-500" strokeWidth={2.5} />,
  'video': <Video className="w-5 h-5 text-sky-400" strokeWidth={2.5} />,
  'trophy': <Trophy className="w-5 h-5 text-yellow-500" strokeWidth={2.5} />,
  'building': <Building2 className="w-5 h-5 text-orange-500" strokeWidth={2.5} />,
  'handshake': <Handshake className="w-5 h-5 text-teal-400" strokeWidth={2.5} />,
  'calendar': <Calendar className="w-5 h-5 text-pink-400" strokeWidth={2.5} />,
};

export default function PlanesSection() {
  const { planes } = siteConfig;

  return (
    <section 
      id="planes"
      className="relative w-full py-24 px-6 md:px-12 overflow-hidden shadow-2xl"
      style={{
        backgroundColor: '#2d0b3f',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        
        {/* Header de la seccion */}
        <FadeIn direction="down" duration={0.8} className="flex flex-col items-center text-center mb-16">
          {siteConfig.logo && (
            <div className="w-24 h-24 md:w-32 md:h-32 mb-6 rounded-full bg-black/20 p-2 shadow-[0_0_30px_rgba(221,161,36,0.2)] flex items-center justify-center">
              <Image 
                src={siteConfig.logo} 
                alt="Logo" 
                width={100} 
                height={100} 
                className="object-contain"
              />
            </div>
          )}
          <h2 className="text-[#dda124] text-3xl md:text-5xl font-black italic tracking-widest drop-shadow-lg mb-2">
            {planes.title}
          </h2>
          <h3 className="text-white text-xl md:text-3xl font-extrabold italic tracking-widest drop-shadow-md">
            {planes.subtitle}
          </h3>
          <div className="w-32 h-[3px] bg-[#dda124] mt-6 rounded-full shadow-[0_0_10px_rgba(221,161,36,0.6)]"></div>
        </FadeIn>

        {/* Grilla de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8 w-full max-w-[1400px]">
          {planes.items.map((plan, index) => (
            <FadeIn 
              key={plan.id}
              direction="up" 
              delay={0.2 * (index + 1)} 
              duration={0.8}
              className={`flex flex-col relative rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 ${
                plan.highlight 
                  ? 'border-2 border-[#dda124] bg-white text-[#2d0b3f] -translate-y-4 shadow-[0_20px_50px_rgba(221,161,36,0.3)]' 
                  : 'bg-black/20 border border-white/10 text-white backdrop-blur-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 w-full bg-[#dda124] text-white text-center py-1 text-xs font-black tracking-[3px] italic">
                  RECOMENDADO
                </div>
              )}
              
              {/* Card Header */}
              <div className={`p-4 md:p-6 mt-4 md:mt-0 ${plan.highlight ? 'pt-8' : ''}`}>
                <div className="flex justify-between items-center mb-4 min-h-[56px]">
                  <h4 className={`text-lg lg:text-md xl:text-lg font-black italic tracking-wider leading-tight ${plan.highlight ? 'text-[#2d0b3f]' : 'text-[#dda124]'}`}>
                    {plan.name}
                  </h4>
                  <div className={`ml-2 flex items-center justify-center ${plan.highlight ? 'text-[#2d0b3f]' : 'text-[#dda124]'}`}>
                    {plan.id === "plan-3" ? <Image src="https://res.cloudinary.com/do87isqjr/image/upload/v1772829694/logo-savage-removebg-preview_cpcela.png" alt="Logo" width={70} height={70} className="object-contain" /> : (iconMap[plan.icon] || <span>{plan.icon}</span>)}
                  </div>
                </div>
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#dda124] to-transparent opacity-50 mb-6"></div>
                <div className="text-center mb-4 flex flex-col items-center">
                  <span className={`text-4xl md:text-5xl font-black tracking-tighter drop-shadow-md ${plan.highlight ? 'text-[#2d0b3f]' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-xs mt-2 font-bold uppercase tracking-widest ${plan.highlight ? 'text-gray-500' : 'text-gray-400'}`}>
                    ARS / MENSUAL
                  </span>
                </div>
              </div>

              {/* Card Features */}
              <div className={`flex-1 p-4 md:p-6 pt-0 flex flex-col justify-between ${plan.highlight ? 'bg-gray-50' : 'bg-black/10'}`}>
                <ul className="flex flex-col gap-3 mb-8 mt-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center justify-between text-sm md:text-base font-medium">
                      <span className={`mr-2 flex-1 ${plan.highlight ? 'text-gray-800' : 'text-gray-200'}`}>
                        {feature.text}
                      </span>
                      <div className="ml-2 flex flex-shrink-0">
                        {iconMap[feature.icon] || <span className="text-lg opacity-90 drop-shadow-sm">{feature.icon}</span>}
                      </div>
                    </li>
                  ))}
                </ul>

                <a 
                  href="https://wa.me/541160218709"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full block text-center py-4 rounded-xl font-extrabold italic tracking-widest transition-all duration-300 hover:-translate-y-1 shadow-lg ${
                    plan.highlight
                      ? 'bg-[#dda124] text-white hover:bg-[#c78f1e] hover:shadow-[0_10px_20px_rgba(221,161,36,0.3)]'
                      : 'bg-white text-[#2d0b3f] hover:bg-gray-100 hover:shadow-[0_10px_20px_rgba(255,255,255,0.2)]'
                  }`}
                >
                  ELEGIR PLAN
                </a>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Footer info (Contacto etc) */}
        <FadeIn direction="up" delay={0.8} className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-3xl">
          <a 
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-1 items-center gap-4 px-6 py-4 w-full sm:w-auto rounded-2xl bg-black/40 border border-[#dda124]/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-[#dda124]/10 hover:border-[#dda124] hover:shadow-[0_10px_30px_rgba(221,161,36,0.2)]"
          >
            <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-gray-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">SÍGUENOS EN</span>
              <span className="text-white text-sm md:text-base font-black italic tracking-wider group-hover:text-[#dda124] transition-colors">{planes.contactInfo.instagram}</span>
            </div>
          </a>

          <a
            href={`https://wa.me/${planes.contactInfo.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-1 items-center gap-4 px-6 py-4 w-full sm:w-auto rounded-2xl bg-black/40 border border-[#dda124]/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-[#dda124]/10 hover:border-[#dda124] hover:shadow-[0_10px_30px_rgba(221,161,36,0.2)]"
          >|
            <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-gray-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">ESCRIBIME AL</span>
              <span className="text-white text-sm md:text-base font-black italic tracking-wider group-hover:text-[#dda124] transition-colors">{planes.contactInfo.whatsapp}</span>
            </div>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
