"use client";

import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si scrollea hacia arriba, o está muy arriba, muestra
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } 
      // Si scrollea hacia abajo y ya pasó los 50px, oculta
      else if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        setIsVisible(false);
        setIsOpen(false); // Cierra menú móvil al escrolear para abajo
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 shadow-lg transition-transform duration-300 backdrop-blur-md bg-[#2d0b3f]/75 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`
      }}
    >
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex justify-between items-center">
        <div className="flex flex-col items-center">
          <Link href="/" className="flex flex-col items-center drop-shadow-sm hover:scale-105 transition-transform duration-300">
            {siteConfig.logo ? (
              <Image src={siteConfig.logo} alt={siteConfig.name} width={50} height={50} className="object-contain drop-shadow-md" priority />
            ) : (
              <>
                <span className="text-3xl font-funnel font-black tracking-tighter leading-none text-white drop-shadow-md">
                  {siteConfig.shortName}
                </span>
                <span className="text-xs font-extrabold tracking-widest text-gray-300">
                  {siteConfig.subtitle}
                </span>
              </>
            )}
          </Link>
        </div>
        
        <ul className="hidden md:flex gap-8 m-0 p-0 list-none items-center">
          <li>
            <Link href="/mi-historia" className="text-white drop-shadow-md font-extrabold italic text-sm tracking-wide transition-colors duration-300 hover:text-[#dda124]">
              MI HISTORIA
            </Link>
          </li>
          <li>
            <Link href="/#empresa" className="text-white drop-shadow-md font-extrabold italic text-sm tracking-wide transition-colors duration-300 hover:text-[#dda124]">
              COMO TRABAJO
            </Link>
          </li>
          <li>
            <Link href="/#antes-despues" className="text-white drop-shadow-md font-extrabold italic text-sm tracking-wide transition-colors duration-300 hover:text-[#dda124]">
              ANTES Y DESPUÉS
            </Link>
          </li>
          <li>
            <Link href="/#planes" className="text-white drop-shadow-md font-extrabold italic text-sm tracking-wide transition-colors duration-300 hover:text-[#dda124]">
              NUESTROS PLANES
            </Link>
          </li>
          <li>
            <Link href="/#contacto" className="text-white drop-shadow-md font-extrabold italic text-sm tracking-wide transition-colors duration-300 hover:text-[#dda124]">
              CONTACTO
            </Link>
          </li>
        </ul>

        {/* --- MOBILE HAMBURGER BUTTON --- */}
        <button 
          className="md:hidden text-white hover:text-[#dda124] transition-colors z-50 p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full bg-[#2d0b3f] border-t border-white/10 shadow-2xl md:hidden z-40 overflow-hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`
            }}
          >
            <ul className="flex flex-col items-center gap-6 py-10 list-none m-0">
              <li>
                <Link href="/mi-historia" onClick={closeMenu} className="text-white drop-shadow-md font-black italic text-lg tracking-widest transition-colors duration-300 hover:text-[#dda124] block py-2">
                  MI HISTORIA
                </Link>
              </li>
              <li>
                <Link href="/#empresa" onClick={closeMenu} className="text-white drop-shadow-md font-black italic text-lg tracking-widest transition-colors duration-300 hover:text-[#dda124] block py-2">
                  COMO TRABAJO
                </Link>
              </li>
              <li>
                <Link href="/#antes-despues" onClick={closeMenu} className="text-white drop-shadow-md font-black italic text-lg tracking-widest transition-colors duration-300 hover:text-[#dda124] block py-2">
                  ANTES Y DESPUÉS
                </Link>
              </li>
              <li>
                <Link href="/#planes" onClick={closeMenu} className="text-white drop-shadow-md font-black italic text-lg tracking-widest transition-colors duration-300 hover:text-[#dda124] block py-2">
                  NUESTROS PLANES
                </Link>
              </li>
              <li>
                <Link href="/#contacto" onClick={closeMenu} className="text-white drop-shadow-md font-black italic text-lg tracking-widest transition-colors duration-300 hover:text-[#dda124] block py-2">
                  CONTACTO
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
