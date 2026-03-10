'use client';

import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="bg-[#2d0b3f] text-white pt-20 pb-10 px-8 w-full border-t-[8px] border-[#dda124]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Logo Column */}
          <div className="flex flex-col items-center md:items-start col-span-1 md:col-span-1">
            <Link href="/" className="flex flex-col items-center md:items-start mb-6 hover:scale-105 transition-transform duration-300">
              {siteConfig.logo ? (
                <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm">
                  <Image src={siteConfig.logo} alt={siteConfig.name} width={100} height={100} className="object-contain drop-shadow-md" />
                </div>
              ) : (
                <>
                  <span className="text-4xl font-funnel font-black tracking-tighter leading-none text-white italic drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                    {siteConfig.shortName}
                  </span>
                  <span className="text-xs font-extrabold tracking-widest text-gray-300 italic">
                    {siteConfig.subtitle}
                  </span>
                </>
              )}
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed text-center md:text-left max-w-xs font-medium">
              {siteConfig.tagline}
            </p>
          </div>
          
          {/* Enlaces Rápidos */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-black italic tracking-widest mb-6 text-white uppercase relative inline-block">
              EXPLORAR
              <span className="absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-8 h-[2px] bg-[#dda124]"></span>
            </h4>
            <ul className="flex flex-col gap-3 font-semibold text-gray-300">
              <li><Link href="#empresa" className="py-1 inline-block hover:text-[#dda124] hover:translate-x-1 transition-all">La Empresa</Link></li>
              <li><Link href="#antes-despues" className="py-1 inline-block hover:text-[#dda124] hover:translate-x-1 transition-all">Antes y Después</Link></li>
              <li><Link href="#planes" className="py-1 inline-block hover:text-[#dda124] hover:translate-x-1 transition-all">Nuestros Planes</Link></li>
              <li><Link href="#blog" className="py-1 inline-block hover:text-[#dda124] hover:translate-x-1 transition-all">Blog</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-black italic tracking-widest mb-6 text-white uppercase relative inline-block">
              CONTACTO
              <span className="absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-8 h-[2px] bg-[#dda124]"></span>
            </h4>
            <ul className="flex flex-col gap-4 font-semibold text-gray-300 text-sm text-center md:text-left">
              <li className="flex flex-col">
                <span className="text-[#dda124] text-xs font-bold tracking-widest uppercase mb-1">Email</span>
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white transition-colors">{siteConfig.contact.email}</a>
              </li>
              <li className="flex flex-col">
                <span className="text-[#dda124] text-xs font-bold tracking-widest uppercase mb-1">WhatsApp</span>
                <a 
                  href={`https://wa.me/${siteConfig.planes.contactInfo.whatsapp.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.planes.contactInfo.whatsapp}
                </a>
              </li>
              <li className="flex flex-col">
                <span className="text-[#dda124] text-xs font-bold tracking-widest uppercase mb-1">Dirección</span>
                <span className="text-gray-400">{siteConfig.contact.address}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-black italic tracking-widest mb-6 text-white uppercase relative inline-block">
              SÍGUENOS
              <span className="absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-8 h-[2px] bg-[#dda124]"></span>
            </h4>
            <div className="flex gap-4">
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-[#4a154b] flex items-center justify-center hover:bg-[#dda124] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              {(siteConfig.social as Record<string, string>).facebook && (
                <a href={(siteConfig.social as Record<string, string>).facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-[#4a154b] flex items-center justify-center hover:bg-[#dda124] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-full bg-[#4a154b] flex items-center justify-center hover:bg-[#dda124] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            
            <div className="mt-8 bg-[#4a154b]/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm w-full">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#dda124] mb-1 block text-center md:text-left">
                NEWSLETTER
              </span>
              <p className="text-xs text-gray-400 mb-3 text-center md:text-left">Suscríbete para recibir tips y rutinas exclusivas.</p>
              <form className="flex" onSubmit={(e) => { e.preventDefault(); }}>
                <input 
                  type="email" 
                  placeholder="Tu correo" 
                  className="bg-[#2d0b3f] text-white px-3 py-2 rounded-l-lg outline-none text-sm w-full border border-gray-700 border-r-0 focus:border-[#dda124] transition-colors"
                />
                <button type="submit" className="bg-[#dda124] text-white px-3 py-2 rounded-r-lg font-bold text-sm hover:bg-[#b88114] transition-colors">
                  &rarr;
                </button>
              </form>
            </div>
          </div>
          
        </div>
        
        {/* Divider & Copyright */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Términos y Condiciones</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
