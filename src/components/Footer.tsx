'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSiteContent } from '@/components/SiteContentProvider';
import { SectionLabel, Wordmark } from '@/components/ui';
import LazyLogo3D from './LazyLogo3D';

const linkClass = 'text-sm text-muted transition-colors hover:text-text';

export default function Footer() {
  const { name, tagline, footer, contact, planes, social, newsletter } = useSiteContent();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const whatsappUrl = `https://wa.me/${planes.contactInfo.whatsapp.replace(/\D/g, '')}`;
  const extraSocial = social as Record<string, string>;

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success(newsletter.successText);
      setEmail('');
    } catch {
      toast.error(newsletter.errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 pt-20 md:px-8 md:pt-28">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Newsletter */}
          <div className="md:col-span-5">
            <SectionLabel className="mb-4">{newsletter.title}</SectionLabel>
            <p className="max-w-sm text-sm leading-relaxed text-muted">{newsletter.subtitle}</p>
            <form onSubmit={handleNewsletter} className="mt-6 flex max-w-sm border-b border-line focus-within:border-gold">
              <label htmlFor="footer-newsletter" className="sr-only">
                {newsletter.placeholder}
              </label>
              <input
                id="footer-newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={newsletter.placeholder}
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-text placeholder:text-muted/70 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                aria-label={newsletter.ctaText}
                className="flex h-12 w-12 items-center justify-center text-gold transition-transform hover:translate-x-1 disabled:opacity-50"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted/80">{tagline}</p>
          </div>

          {/* Explorar */}
          <div className="md:col-span-2">
            <SectionLabel tone="muted" className="mb-5">{footer.exploreTitle}</SectionLabel>
            <ul className="space-y-3">
              {footer.exploreLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="md:col-span-3">
            <SectionLabel tone="muted" className="mb-5">{footer.contactTitle}</SectionLabel>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted/70">{footer.emailLabel}</dt>
                <dd>
                  <a href={`mailto:${contact.email}`} className="text-text transition-colors hover:text-gold">
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted/70">{footer.whatsappLabel}</dt>
                <dd>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-text transition-colors hover:text-gold">
                    {planes.contactInfo.whatsapp}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted/70">{footer.addressLabel}</dt>
                <dd className="text-text">{contact.address}</dd>
              </div>
            </dl>
          </div>

          {/* Redes */}
          <div className="md:col-span-2">
            <SectionLabel tone="muted" className="mb-5">{footer.socialTitle}</SectionLabel>
            <ul className="space-y-3">
              <li>
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Instagram
                </a>
              </li>
              {extraSocial.facebook && (
                <li>
                  <a href={extraSocial.facebook} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    Facebook
                  </a>
                </li>
              )}
              <li>
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Wordmark grande + logo 3D */}
        <div className="mt-20 grid items-end gap-4 border-t border-line pt-10 md:mt-28 md:grid-cols-[1fr_320px]">
          <Link href="/" aria-label={name} className="block overflow-hidden">
            <Wordmark size="xl" />
          </Link>
          <div className="hidden md:block">
            <LazyLogo3D />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-8 text-xs text-muted md:flex-row md:items-center md:justify-between">
          {/* El año puede diferir entre servidor y navegador justo en Año Nuevo */}
          <p suppressHydrationWarning>
            &copy; {new Date().getFullYear()} {name}. {footer.rights}
          </p>
          <div className="flex gap-6">
            {footer.legalLinks.map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-text">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
