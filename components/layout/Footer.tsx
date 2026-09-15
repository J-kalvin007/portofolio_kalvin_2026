

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

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo from './Logo';
import MagneticWrapper from '../animations/MagneticWrapper';

/** Or « Void & Or », en composantes RVB — pour composer les dégradés en ligne. */
const GOLD_RGB = '240,165,0';

/** Décélération franche, sans rebond. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

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

/** Style commun aux trois intitulés de colonne. */
const COLUMN_HEADING_CLASSES =
  'text-base-content/80 font-bold text-[11px] mb-8 uppercase tracking-[0.28em] w-full text-center md:text-left';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();

  const NAV_LINKS = [
    { label: tNav('home'), href: '/' as const },
    { label: tNav('projects'), href: '/projets' as const },
    { label: tNav('about'), href: '/propos' as const },
    { label: tNav('contact'), href: '/contact' as const },
  ];

  const [activeHover, setActiveHover] = useState<string | null>(null);

  const scrollToTop = () => {
    // Le défilement programmatique respecte la préférence système.
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ SPOTLIGHT DES BLOCS DE CONTACT
     ───────────────────────────────────────────────────────────────────────
     Cinquième occurrence du même motif dans le projet : la position du curseur
     était stockée dans un état unique, partagé par les trois blocs. Survoler
     le premier déplaçait le reflet des deux autres, avec des coordonnées
     relatives à une autre boîte — donc hors cadre — et chaque `mousemove`
     re-rendait le pied de page entier, y compris les huit liens sociaux et
     leurs enveloppes magnétiques.
     Coordonnées écrites en variables CSS sur le nœud survolé : zéro rendu React.
     ═══════════════════════════════════════════════════════════════════════ */
  const handleCardPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  }, []);

  /* ── Libellés hors catalogue i18n (aucune clé nouvelle n'est requise) ───── */
  const isFrench = locale === 'fr';
  const scrollTopLabel = isFrench ? 'Remonter en haut de page' : 'Back to top';

  /** Blocs de contact. `href` absent ⇒ information non actionnable (l'adresse postale). */
  const CONTACT_ITEMS = [
    { icon: '/svg/location_01.svg', text: 'Lomé, Togo', href: undefined },
    { icon: '/svg/email_02.svg', text: 'takoudjoumoisecalvin@gmail.com', href: 'mailto:takoudjoumoisecalvin@gmail.com' },
    { icon: '/svg/phone_02.svg', text: '+228 92 51 56 85', href: 'tel:+22892515685' },
  ];

  /** Habillage partagé par les blocs de contact, actionnables ou non. */
  const contactShellClasses =
    `group relative block p-3 rounded-2xl overflow-hidden
     bg-base-100/60 dark:bg-white/[0.022]
     border border-base-content/[0.07] dark:border-white/[0.06]
     hover:border-primary/30
     transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`;

  return (
    <footer className="relative mt-auto border-t border-base-content/[0.06] dark:border-white/5 bg-base-100/60 dark:bg-base-100/80 backdrop-blur-3xl overflow-hidden z-10">

      {/* ── Background Effects ── */}
      {/* Filet lumineux supérieur : matérialise la couture entre le contenu et le pied de page. */}
      <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Une seule nappe lumineuse — deux orbes flous plein écran empilés
          s'annulaient visuellement tout en coûtant deux compositions GPU. */}
      <div aria-hidden="true" className="absolute -top-40 left-1/2 -translate-x-1/2 w-[min(900px,110vw)] h-[420px] bg-primary/[0.045] rounded-full blur-[140px] pointer-events-none" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28">

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 mb-20">

          {/* Column 1: Brand & Contact */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            className="lg:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-10"
          >
            <Logo size={48} />
            <p className="text-base-content/50 leading-[1.75] max-w-md font-light text-sm sm:text-base text-pretty">
              {t('description')}
            </p>

            {/* Spotlight Contact Links */}
            {/* Chaque bloc actionnable est une vraie ancre. Auparavant, c'était un
                `div` avec `onClick` + `window.open(href, '_self')` : inatteignable
                au clavier, invisible comme lien pour un lecteur d'écran, et sans
                clic droit ni ouverture dans un nouvel onglet. */}
            <ul className="space-y-4 w-full max-w-sm list-none p-0">
              {CONTACT_ITEMS.map((item) => (
                <li key={item.text}>
                  {item.href ? (
                    <a
                      href={item.href}
                      onPointerMove={handleCardPointerMove}
                      style={{ '--spot-x': '50%', '--spot-y': '50%' } as React.CSSProperties}
                      className={`${contactShellClasses} cursor-pointer
                                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100`}
                    >
                      <ContactBody item={item} />
                    </a>
                  ) : (
                    <div
                      onPointerMove={handleCardPointerMove}
                      style={{ '--spot-x': '50%', '--spot-y': '50%' } as React.CSSProperties}
                      className={`${contactShellClasses} cursor-default`}
                    >
                      <ContactBody item={item} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT_EXPO }}
            className="lg:col-span-3 flex flex-col items-center md:items-start text-center md:text-left"
          >
            {/* Titre en couleur pleine. Le dégradé `base-content → base-content/50`
                atténuait le bas de chaque glyphe : sur du 11 px capitale espacé à
                0,28 em, cela suffit à faire perdre la moitié de la lisibilité. */}
            <h3 className={COLUMN_HEADING_CLASSES}>
              {t('navigation')}
            </h3>
            <nav aria-label={t('navigation')} className="space-y-2 w-full flex flex-col items-center md:items-start">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setActiveHover(link.href)}
                  onMouseLeave={() => setActiveHover(null)}
                  onFocus={() => setActiveHover(link.href)}
                  onBlur={() => setActiveHover(null)}
                  className="cursor-pointer group flex items-center gap-4 py-2 px-3 rounded-lg hover:bg-base-content/5 dark:hover:bg-white/5 transition-colors duration-300 w-fit
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                >
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 motion-reduce:transform-none ${activeHover === link.href ? 'bg-primary scale-125' : 'bg-base-content/20'}`}
                  />
                  <span className="text-base-content/60 group-hover:text-base-content text-sm font-medium transition-colors">
                    {link.label}
                  </span>
                  <ArrowUpRight aria-hidden="true" className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300 motion-reduce:transform-none" />
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Column 3: Socials & Legal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
            className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-12"
          >
            <div className="w-full flex flex-col items-center md:items-start">
              <h3 className={COLUMN_HEADING_CLASSES}>
                {t('followMe')}
              </h3>
              <ul className="flex flex-wrap justify-center md:justify-start gap-3 list-none p-0">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <MagneticWrapper strength={0.2}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="cursor-pointer relative group w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden
                                   bg-base-100/70 dark:bg-white/[0.03]
                                   border border-base-content/[0.07] dark:border-white/[0.06]
                                   hover:border-primary/40
                                   transition-[border-color] duration-500
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                      >
                        <Image
                          src={social.icon}
                          alt=""
                          aria-hidden="true"
                          width={20}
                          height={20}
                          className="w-5 h-5 relative z-10 transition-[transform,opacity] duration-500 group-hover:scale-110 motion-reduce:transform-none opacity-60 group-hover:opacity-100 dark:invert dark:group-hover:invert-0"
                        />
                      </a>
                    </MagneticWrapper>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full flex flex-col items-center md:items-start">
              <h3 className={`${COLUMN_HEADING_CLASSES} mb-6`}>
                {t('legal')}
              </h3>
              {/* Ces deux mentions étaient stylées comme des liens — `cursor-pointer`
                  et changement de couleur au survol — mais ne menaient nulle part.
                  Une affordance qui ne tient pas sa promesse est plus coûteuse
                  qu'une absence d'affordance. Elles restent du texte tant que les
                  pages correspondantes n'existent pas. */}
              <div className="flex gap-6 text-sm text-base-content/40">
                <p className="font-medium">{t('privacy')}</p>
                <p className="font-medium">{t('terms')}</p>
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
                className="w-10 h-10 rounded-full bg-base-100 border border-base-content/10 dark:border-white/10
                           shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-12px_rgba(0,0,0,0.4)]
                           flex items-center justify-center text-base-content/50
                           hover:text-primary hover:border-primary/40 transition-colors duration-300 group cursor-pointer
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                aria-label={scrollTopLabel}
              >
                <ArrowUp aria-hidden="true" className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300 motion-reduce:transform-none" />
              </button>
            </MagneticWrapper>
          </div>

          <p className="text-sm text-base-content/40 font-medium text-center md:text-left">
            © {currentYear}{' '}
            <span className="text-base-content font-bold tracking-wide">
              Takoudjou Moïse Kalvin
            </span>
            <span className="hidden sm:inline">. {t('copyright')}</span>
          </p>

          <div className="text-[11px] font-bold text-base-content/30 uppercase tracking-[0.18em] text-center md:text-right flex items-center gap-2">
            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse motion-reduce:animate-none" />
            {t('bottomTerms')}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CONTENU D'UN BLOC DE CONTACT
   Extrait pour être partagé par les deux enveloppes — ancre ou simple bloc —
   sans dupliquer le balisage.
   ═══════════════════════════════════════════════════════════════════════════ */
function ContactBody({ item }: { item: { icon: string; text: string; href?: string } }) {
  return (
    <>
      {/* Reflet ancré sur le curseur, alimenté par les variables CSS posées
          sur l'enveloppe par `handleCardPointerMove`. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(200px circle at var(--spot-x) var(--spot-y), rgba(${GOLD_RGB},0.1), transparent 50%)` }}
      />

      <span className="relative z-10 flex items-center gap-4">
        <span className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center
                         bg-base-200/70 dark:bg-white/[0.045]
                         border border-base-content/[0.05] dark:border-white/[0.05]
                         group-hover:bg-primary group-hover:border-primary
                         transition-colors duration-500">
          {/* `alt` vidé : l'icône répétait l'adresse e-mail, qu'un lecteur d'écran
              annonçait donc deux fois de suite. */}
          <Image
            src={item.icon}
            alt=""
            aria-hidden="true"
            width={16}
            height={16}
            className="w-4 h-4 opacity-60 group-hover:brightness-0 group-hover:opacity-100 transition-[opacity,filter] duration-500"
          />
        </span>
        <span className="font-medium tracking-wide text-sm text-base-content/70 group-hover:text-base-content transition-colors break-all sm:break-normal">
          {item.text}
        </span>
      </span>
    </>
  );
}