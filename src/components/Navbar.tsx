"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '@/components/SiteContentProvider';
import { Button, Wordmark } from '@/components/ui';
import { useFocusTrap } from '@/components/ui/useFocusTrap';
import { cn } from '@/lib/cn';

export default function Navbar() {
  const { nav, hero } = useSiteContent();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useFocusTrap(isOpen, navRef, () => setIsOpen(false));

  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      ref={navRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled || isOpen ? 'border-b border-line bg-bg' : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:h-20 md:px-8">
        <Link href="/" onClick={closeMenu} aria-label="Inicio">
          <Wordmark size="md" />
        </Link>

        <ul className="hidden items-center gap-8 xl:flex">
          {nav.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" href={hero.ctaHref} external className="hidden rounded-brand sm:inline-flex">
            {hero.ctaText}
          </Button>
          <button
            className="p-1 text-text xl:hidden"
            onClick={() => setIsOpen((o) => !o)}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-16 flex flex-col justify-between gap-8 overflow-y-auto bg-bg px-5 pb-10 pt-8 md:top-20 xl:hidden"
          >
            <ul className="space-y-1">
              {nav.map((link, i) => (
                <li key={link.href} className="border-b border-line">
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-baseline gap-4 py-4 font-display text-4xl uppercase text-text transition-colors hover:text-gold"
                  >
                    <span className="font-sans text-xs text-gold">{String(i + 1).padStart(2, '0')}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button variant="primary" size="lg" href={hero.ctaHref} external className="w-full rounded-brand">
              {hero.ctaText}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
