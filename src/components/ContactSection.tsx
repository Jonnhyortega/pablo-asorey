'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { FormHoneypot, useFormGuard } from '@/components/FormHoneypot';
import { useSiteContent } from '@/components/SiteContentProvider';
import { Button, Input, SectionLabel, Textarea } from '@/components/ui';
import FadeIn from './animations/FadeIn';

export default function ContactSection() {
  const { contactForm, contact, footer, planes } = useSiteContent();
  const whatsappUrl = `https://wa.me/${planes.contactInfo.whatsapp.replace(/\D/g, '')}`;

  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const guard = useFormGuard();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactData, ...guard.fields() }),
      });
      if (res.ok) {
        // El formulario queda cerrado: se reemplaza por el mensaje de confirmación.
        setContactStatus('success');
        setContactData({ name: '', email: '', message: '' });
      } else {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.message ?? '');
        setContactStatus('error');
      }
    } catch {
      setErrorMessage('');
      setContactStatus('error');
    }
  };

  const details = [
    { label: footer.emailLabel, value: contact.email, href: `mailto:${contact.email}` },
    { label: footer.whatsappLabel, value: contact.phoneDisplay, href: whatsappUrl },
    { label: footer.addressLabel, value: contact.address },
  ];

  return (
    <section id="contacto" className="border-t border-line bg-bg py-24 md:py-32">
      <div className="mx-auto grid max-w-[1200px] gap-14 px-5 md:px-8 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <FadeIn direction="up">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-10 bg-gold" aria-hidden />
            <SectionLabel>{footer.contactTitle}</SectionLabel>
          </div>
          <h2 className="font-display text-5xl uppercase leading-[0.92] text-text md:text-7xl">{contactForm.title}</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">{contactForm.subtitle}</p>

          <dl className="mt-12 border-t border-line">
            {details.map((d) => (
              <div key={d.label} className="flex items-baseline justify-between gap-6 border-b border-line py-5">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted">{d.label}</dt>
                <dd className="min-w-0 truncate text-right text-sm text-text">
                  {d.href ? (
                    <a href={d.href} target={d.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="transition-colors hover:text-gold">
                      {d.value}
                    </a>
                  ) : (
                    d.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </FadeIn>

        <FadeIn direction="up" delay={0.15}>
          {contactStatus === 'success' ? (
            <div role="status" className="flex h-full flex-col items-center justify-center gap-4 border border-line bg-surface p-10 text-center md:p-14">
              <CheckCircle className="h-12 w-12 text-gold" strokeWidth={1.25} />
              <h3 className="font-display text-3xl uppercase text-text">{contactForm.successText}</h3>
              <p className="max-w-sm text-sm leading-relaxed text-muted">Te vamos a responder a la brevedad al email que dejaste.</p>
            </div>
          ) : (
          <form onSubmit={handleContactSubmit} className="relative space-y-6 border border-line bg-surface p-6 md:p-10">
            <FormHoneypot inputRef={guard.honeypotRef} />
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label={contactForm.nameLabel}
                id="name"
                required
                value={contactData.name}
                onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                placeholder={contactForm.namePlaceholder}
                className="rounded-brand bg-bg"
              />
              <Input
                label={contactForm.emailLabel}
                id="contact-email"
                type="email"
                required
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                placeholder={contactForm.emailPlaceholder}
                className="rounded-brand bg-bg"
              />
            </div>
            <Textarea
              label={contactForm.messageLabel}
              id="message"
              required
              rows={5}
              value={contactData.message}
              onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
              placeholder={contactForm.messagePlaceholder}
              className="rounded-brand bg-bg"
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p role="status" className="text-sm">
                {contactStatus === 'error' && <span className="text-danger">{errorMessage || contactForm.errorText}</span>}
              </p>
              <Button type="submit" variant="primary" size="lg" loading={contactStatus === 'loading'} className="rounded-brand">
                {contactStatus === 'loading' ? contactForm.sendingText : contactForm.ctaText}
              </Button>
            </div>
          </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
