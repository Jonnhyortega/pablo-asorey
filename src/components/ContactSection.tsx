'use client';

import { useState } from 'react';
import { siteConfig } from '@/config/site';
import FadeIn from './animations/FadeIn';

export default function ContactSection() {
  const { contactForm, newsletter } = siteConfig;

  // Estado para el formulario de contacto
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Estado para el newsletter
  const [newsEmail, setNewsEmail] = useState('');
  const [newsStatus, setNewsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Manejador del submit de contacto
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('loading');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      
      if (res.ok) {
        setContactStatus('success');
        setContactData({ name: '', email: '', message: '' });
        setTimeout(() => setContactStatus('idle'), 5000);
      } else {
        setContactStatus('error');
      }
    } catch (error) {
      setContactStatus('error');
    }
  };

  // Manejador del submit del newsletter
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsStatus('loading');
    
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsEmail })
      });
      
      if (res.ok) {
        setNewsStatus('success');
        setNewsEmail('');
        setTimeout(() => setNewsStatus('idle'), 5000);
      } else {
        setNewsStatus('error');
      }
    } catch (error) {
      setNewsStatus('error');
    }
  };

  return (
    <section className="relative w-full py-24 bg-zinc-950 overflow-hidden" id="contacto">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#dda124] to-transparent opacity-30"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#dda124] rounded-full blur-[150px] opacity-10"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#dda124] rounded-full blur-[150px] opacity-10"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Formulario de Contacto */}
          <FadeIn direction="right" duration={0.8} delay={0.2}>
            <div className="flex flex-col">
              <h2 className="text-4xl md:text-5xl font-black italic tracking-widest leading-none mb-4 text-white">
                {contactForm.title}
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                {contactForm.subtitle}
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    {contactForm.nameLabel}
                  </label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={contactData.name}
                    onChange={(e) => setContactData({...contactData, name: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#dda124] focus:ring-1 focus:ring-[#dda124] transition-all duration-300 placeholder-zinc-600"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    {contactForm.emailLabel}
                  </label>
                  <input 
                    type="email" 
                    id="contact-email"
                    required
                    value={contactData.email}
                    onChange={(e) => setContactData({...contactData, email: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#dda124] focus:ring-1 focus:ring-[#dda124] transition-all duration-300 placeholder-zinc-600"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    {contactForm.messageLabel}
                  </label>
                  <textarea 
                    id="message"
                    required
                    rows={4}
                    value={contactData.message}
                    onChange={(e) => setContactData({...contactData, message: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#dda124] focus:ring-1 focus:ring-[#dda124] transition-all duration-300 resize-none placeholder-zinc-600"
                    placeholder="Dejanos tu consulta..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={contactStatus === 'loading'}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#dda124] to-[#f5b83d] text-zinc-950 font-black italic tracking-widest px-8 py-4 rounded-lg hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(221,161,36,0.3)] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {contactStatus === 'loading' ? 'ENVIANDO...' : contactForm.ctaText}
                </button>
                
                {contactStatus === 'success' && (
                  <p className="text-green-500 font-medium text-sm mt-2">¡Mensaje enviado con éxito!</p>
                )}
                {contactStatus === 'error' && (
                  <p className="text-red-500 font-medium text-sm mt-2">Ocurrió un error. Intentá de nuevo.</p>
                )}
              </form>
            </div>
          </FadeIn>

          {/* Newsletter Panel */}
          <FadeIn direction="left" duration={0.8} delay={0.4}>
            <div className="h-full flex flex-col justify-center bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-8 md:p-12 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#dda124]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <span className="inline-block bg-[#dda124]/10 text-[#dda124] font-bold tracking-widest text-xs px-3 py-1 rounded-full mb-6">
                  COMUNIDAD
                </span>
                <h3 className="text-3xl md:text-4xl font-black italic tracking-wider text-white mb-4">
                  {newsletter.title}
                </h3>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  {newsletter.subtitle}
                </p>

                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow">
                    <input 
                      type="email" 
                      required
                      value={newsEmail}
                      onChange={(e) => setNewsEmail(e.target.value)}
                      className="w-full bg-zinc-950/50 border border-zinc-700 text-white rounded-lg px-4 py-4 focus:outline-none focus:border-[#dda124] focus:ring-1 focus:ring-[#dda124] transition-all duration-300 placeholder-zinc-500"
                      placeholder={newsletter.placeholder}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={newsStatus === 'loading'}
                    className="bg-transparent border-2 border-[#dda124] text-[#dda124] hover:bg-[#dda124] hover:text-zinc-950 font-black italic tracking-widest px-8 py-4 rounded-lg transition-all duration-300 whitespace-nowrap disabled:opacity-70 disabled:hover:bg-transparent disabled:hover:text-[#dda124]"
                  >
                    {newsStatus === 'loading' ? 'CARGANDO' : newsletter.ctaText}
                  </button>
                </form>

                {newsStatus === 'success' && (
                  <p className="text-green-500 font-medium text-sm mt-4">¡Te suscribiste correctamente!</p>
                )}
                {newsStatus === 'error' && (
                  <p className="text-red-500 font-medium text-sm mt-4">Hubo un error al suscribirte.</p>
                )}
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
