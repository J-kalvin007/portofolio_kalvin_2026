'use client';

/**
 * @file Footer.tsx
 * @description Pied de page (Footer) de l'application. 
 * 
 * @architecture
 * - Affiche le logo "Void & Or", les liens de navigation, les liens sociaux et les informations légales.
 * - Utilise `backdrop-blur-3xl` pour créer un effet de transparence luxueux (Glassmorphism).
 * - Intègre des micro-animations interactives (Framer Motion) au défilement et au survol.
 * - S'appuie sur `next-intl` pour la traduction dynamique des textes (copyright, rubriques).
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo from './Logo';
import MagneticWrapper from '../animations/MagneticWrapper';

const SOCIAL_LINKS = [
  { icon: '/svg/whatsapp_02.svg', href: 'https://wa.me/22892515685', label: 'WhatsApp' },
  { icon: '/svg/instagram.svg', href: 'https://instagram.com/', label: 'Instagram' },
  { icon: '/svg/snapchat.svg', href: 'https://snapchat.com/', label: 'Snapchat' },
  { icon: '/svg/telegram_02.svg', href: 'https://t.me/yourusername', label: 'Telegram' },
  { icon: '/svg/facebook.svg', href: 'https://facebook.com/', label: 'Facebook' },
  { icon: '/svg/tiktok.svg', href: 'https://tiktok.com/', label: 'TikTok' },
  { icon: '/svg/github.svg', href: 'https://github.com/J-kalvin007', label: 'GitHub' },
  { icon: '/svg/linkedin.svg', href: 'https://linkedin.com/', label: 'LinkedIn' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  const NAV_LINKS = [
    { label: tNav('home'), href: '/' as const },
    { label: tNav('projects'), href: '/projets' as const },
    { label: tNav('about'), href: '/propos' as const },
    { label: tNav('contact'), href: '/contact' as const },
  ];

  const [spotPos, setSpotPos] = useState({ x: 0, y: 0 });
  const [activeHover, setActiveHover] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-auto border-t border-base-content/5 dark:border-white/5 bg-base-100/50 dark:bg-[#030208]/80 backdrop-blur-3xl overflow-hidden z-10">

      {/* ── Background Effects ── */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#FFD166]/50 to-transparent blur-[2px] opacity-50" />

      {/* Ambient orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28">

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 mb-20">

          {/* Column 1: Brand & Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-10"
          >
            <Logo size={48} />
            <p className="text-base-content/50 leading-relaxed max-w-md font-light text-sm sm:text-base">
              {t('description')}
            </p>

            {/* Spotlight Contact Links */}
            <div className="space-y-4 w-full max-w-sm">
              {[
                { icon: '/svg/location_01.svg', text: 'Lomé, Togo', type: 'text' },
                { icon: '/svg/email_02.svg', text: 'takoudjoumoisecalvin@gmail.com', href: 'mailto:takoudjoumoisecalvin@gmail.com', type: 'link' },
                { icon: '/svg/phone_02.svg', text: '+228 92 51 56 85', href: 'tel:+22892515685', type: 'link' },
              ].map((item, i) => (
                <div
                  key={i}
                  onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSpotPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
                  className="group relative p-3 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-base-content/[0.06] dark:border-white/[0.06] hover:border-primary/30 transition-all duration-500 overflow-hidden cursor-pointer"
                  onClick={() => item.href && window.open(item.href, '_self')}
                >
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: `radial-gradient(200px circle at ${spotPos.x}px ${spotPos.y}px, rgba(240,165,0,0.1), transparent 50%)` }} />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-base-200/80 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-[#FFD166] group-hover:shadow-[0_0_15px_rgba(240,165,0,0.3)] transition-all duration-500">
                      <Image src={item.icon} alt={item.text} width={16} height={16} className="w-4 h-4 opacity-60 group-hover:brightness-0 group-hover:opacity-100 transition-all duration-500" />
                    </div>
                    <span className="font-medium tracking-wide text-sm text-base-content/70 group-hover:text-base-content dark:group-hover:text-white transition-colors">
                      {item.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-3 flex flex-col items-center md:items-start text-center md:text-left"
          >
            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-base-content to-base-content/50 font-bold text-xs mb-8 uppercase tracking-[0.25em] w-full text-center md:text-left">
              {t('navigation')}
            </h3>
            <nav className="space-y-2 w-full flex flex-col items-center md:items-start">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setActiveHover(link.href)}
                  onMouseLeave={() => setActiveHover(null)}
                  className="cursor-pointer group flex items-center gap-4 py-2 px-3 rounded-lg hover:bg-base-content/5 dark:hover:bg-white/5 transition-all duration-300 w-fit"
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeHover === link.href ? 'bg-primary scale-125 shadow-[0_0_8px_rgba(240,165,0,0.8)]' : 'bg-base-content/20'}`} />
                  <span className="text-base-content/60 group-hover:text-base-content dark:group-hover:text-white text-sm font-medium transition-colors">
                    {link.label}
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300" />
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Column 3: Socials & Legal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-12"
          >
            <div className="w-full flex flex-col items-center md:items-start">
              <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-base-content to-base-content/50 font-bold text-xs mb-8 uppercase tracking-[0.25em] w-full text-center md:text-left">
                {t('followMe')}
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <MagneticWrapper key={social.label} strength={0.2}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="cursor-pointer relative group w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-base-content/[0.06] dark:border-white/[0.06] flex items-center justify-center text-base-content/50 hover:text-primary hover:border-primary/40 hover:shadow-[0_0_20px_rgba(240,165,0,0.2)] transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Image src={social.icon} alt={social.label} width={20} height={20} className="w-5 h-5 relative z-10 transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-100 dark:invert dark:group-hover:invert-0" />
                    </a>
                  </MagneticWrapper>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col items-center md:items-start">
              <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-base-content to-base-content/50 font-bold text-xs mb-6 uppercase tracking-[0.25em] w-full text-center md:text-left">
                {t('legal')}
              </h3>
              <div className="flex gap-6 text-sm text-base-content/40">
                <p className="font-medium cursor-pointer hover:text-base-content dark:hover:text-white transition-colors duration-300">{t('privacy')}</p>
                <p className="font-medium cursor-pointer hover:text-base-content dark:hover:text-white transition-colors duration-300">{t('terms')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="relative pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-base-content/10 dark:border-white/10">

          {/* Scroll to top button (centered on mobile, positioned absolute on desktop) */}
          <div className="md:absolute md:left-1/2 md:-translate-x-1/2 md:-top-5 z-20">
            <MagneticWrapper strength={0.4}>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 rounded-full bg-base-100 dark:bg-[#030208] border border-base-content/10 dark:border-white/10 shadow-sm flex items-center justify-center text-base-content/50 hover:text-primary hover:border-primary/40 hover:shadow-[0_0_15px_rgba(240,165,0,0.3)] transition-all duration-300 group"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </MagneticWrapper>
          </div>

          <p className="text-sm text-base-content/40 font-medium text-center md:text-left">
            © {currentYear}{' '}
            <span className="text-base-content dark:text-white font-bold tracking-wide">
              Takoudjou Moïse Kalvin
            </span>
            <span className="hidden sm:inline">. {t('copyright')}</span>
          </p>

          <div className="text-xs font-bold text-base-content/30 uppercase tracking-wider text-center md:text-right flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(240,165,0,0.6)]" />
            {t('bottomTerms')}
          </div>
        </div>
      </div>
    </footer>
  );
}
