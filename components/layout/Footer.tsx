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

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo from './Logo';
import { StarField } from '../projects';

// Constante globale des réseaux sociaux (facilite la maintenance si on veut ajouter Twitter/X par exemple)
const SOCIAL_LINKS = [
  { icon: Github, href: 'https://github.com/J-kalvin007', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:takoudjoumoisecalvin@gmail.com', label: 'Email' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer'); // Dictionnaire 'footer'
  const tNav = useTranslations('nav'); // Dictionnaire 'nav' (pour réutiliser les mêmes noms de liens qu'en haut)

  const NAV_LINKS = [
    { label: tNav('home'), href: '/' as const },
    { label: tNav('projects'), href: '/projets' as const },
    { label: tNav('about'), href: '/propos' as const },
    { label: tNav('contact'), href: '/contact' as const },
  ];

  return (
    // `mt-auto` assure que le footer pousse toujours vers le bas même si la page est très courte
    <footer className="relative mt-auto border-t border-base-content/5 dark:border-white/5 bg-base-100/50 dark:bg-[#030208]/80 backdrop-blur-3xl overflow-hidden z-10">

      {/* 
        Trait métallique de séparation (Metallic glow line) 
        Créé via des gradients linéaires superposés pour simuler le reflet d'une lumière sur une surface en or.
      */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F0A500]/30 dark:via-[#F0A500]/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#FFD166]/50 dark:via-[#FFD166] to-transparent blur-[2px] opacity-50" />

      {/* Orbes lumineuses décoratives dans les coins pour la profondeur ("Luxury Ambient Orbs") */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#F0A500]/5 dark:bg-[#F0A500]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/5 rounded-full blur-[150px] pointer-events-none" />


      {/* ── Fond Spatial Étoilé ── */}
      {/* <StarField /> */}


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-28">

        {/* Grille principale responsive (1 colonne sur mobile, 3 sur Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 mb-20">

          {/* ── Colonne 1 : Marque et Contact ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} // Ne s'anime qu'une seule fois quand on scrolle
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-8"
          >
            <Logo size={48} />

            <p className="text-base-content/60 leading-relaxed max-w-md font-light text-sm sm:text-base">
              {t('description')}
            </p>

            {/* Liste des coordonnées (Adresse, Email, Téléphone) alignée à gauche mais centrée globalement sur mobile */}
            <div className="space-y-4 pt-4 w-fit mx-auto md:mx-0 flex flex-col items-start">

              <div className="flex items-center gap-4 text-base-content/60 text-sm group">
                <div className="w-10 h-10 rounded-[14px] bg-base-200 dark:bg-white/5 border border-base-content/5 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors duration-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-medium tracking-wide">Lomé, Togo</span>
              </div>

              <a href="mailto:takoudjoumoisecalvin@gmail.com" className="cursor-pointer flex items-center gap-4 text-base-content/60 hover:text-[#F0A500] transition-all duration-500 text-sm group">
                <div className="w-10 h-10 rounded-[14px] bg-base-200 dark:bg-white/5 border border-base-content/5 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:border-[#F0A500]/40 group-hover:bg-[#F0A500]/10 transition-all duration-500">
                  <Mail className="w-4 h-4 group-hover:scale-110 group-hover:text-[#F0A500] transition-transform duration-500" />
                </div>
                <span className="font-medium tracking-wide break-all text-left group-hover:text-base-content dark:group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(240,165,0,0.3)]">takoudjoumoisecalvin@gmail.com</span>
              </a>

              <a href="tel:+22892515685" className="cursor-pointer flex items-center gap-4 text-base-content/60 hover:text-[#F0A500] transition-all duration-500 text-sm group">
                <div className="w-10 h-10 rounded-[14px] bg-base-200 dark:bg-white/5 border border-base-content/5 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:border-[#F0A500]/40 group-hover:bg-[#F0A500]/10 transition-all duration-500">
                  <Phone className="w-4 h-4 group-hover:scale-110 group-hover:text-[#F0A500] transition-transform duration-500" />
                </div>
                <span className="font-medium tracking-wide group-hover:text-base-content dark:group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(240,165,0,0.3)]">+228 92 51 56 85</span>
              </a>

            </div>
          </motion.div>

          {/* ── Colonne 2 : Liens de Navigation Rapide ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} // Délai en cascade pour un effet naturel
            className="lg:col-span-3 flex flex-col items-center md:items-start text-center md:text-left"
          >
            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-base-content to-base-content/50 font-bold text-sm mb-8 uppercase tracking-[0.25em] w-full text-center md:text-left">
              {t('navigation')}
            </h3>
            <nav className="space-y-4 w-fit mx-auto md:mx-0 flex flex-col items-start">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="cursor-pointer group flex items-center gap-3 text-base-content/50 hover:text-[#F0A500] transition-all duration-500 text-sm font-medium"
                >
                  {/* Ligne d'ornement qui s'allonge au survol */}
                  <div className="w-6 h-[1px] bg-base-content/20 dark:bg-white/20 group-hover:w-10 group-hover:bg-[#F0A500] transition-all duration-500" />
                  <span className="group-hover:translate-x-1 transition-transform duration-500 group-hover:text-base-content dark:group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(240,165,0,0.3)]">
                    {link.label}
                  </span>
                  {/* Flèche d'ouverture qui apparaît (ArrowUpRight) */}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* ── Colonne 3 : Réseaux Sociaux & Mentions Légales ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} // Troisième délai
            className="lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-12"
          >
            <div className="w-full flex flex-col items-center md:items-start">
              <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-base-content to-base-content/50 font-bold text-sm mb-8 uppercase tracking-[0.25em] w-full text-center md:text-left">
                {t('followMe')}
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="cursor-pointer relative group w-12 h-12 rounded-2xl bg-base-200 dark:bg-white/5 border border-base-content/5 dark:border-white/10 flex items-center justify-center text-base-content/60 hover:text-[#F0A500] hover:border-[#F0A500]/40 transition-all duration-500 shrink-0 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#F0A500]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <social.icon className="w-5 h-5 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(240,165,0,0.8)]" />
                  </a>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col items-center md:items-start">
              <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-base-content to-base-content/50 font-bold text-sm mb-6 uppercase tracking-[0.25em] w-full text-center md:text-left mt-8 md:mt-0">
                {t('legal')}
              </h3>
              <div className="space-y-3 text-sm text-base-content/50 flex flex-col items-center md:items-start">
                <p className="font-medium cursor-pointer hover:text-base-content transition-colors duration-300">{t('privacy')}</p>
                <p className="font-medium cursor-pointer hover:text-base-content transition-colors duration-300">{t('terms')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 
          Ligne de séparation finale avec un ornement central (pastille qui clignote) 
          Esthétique "Tableau de Bord / Machine de Luxe"
        */}
        <div className="relative mb-8 pt-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-base-content/5 dark:border-white/5" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-base-100 dark:bg-[#030208] px-6 py-2 rounded-full border border-base-content/5 dark:border-white/5 shadow-[0_0_15px_rgba(240,165,0,0.05)] dark:shadow-[0_0_15px_rgba(240,165,0,0.1)]">
              <div className="w-2 h-2 bg-[#F0A500] rounded-full animate-pulse shadow-[0_0_10px_rgba(240,165,0,0.8)]" />
            </div>
          </div>
        </div>

        {/* Mentions de Copyright de bas de page */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-base-content/40">
          <p className="font-medium text-center md:text-left">
            © {currentYear}{' '}
            <span className="text-base-content hover:text-[#F0A500] transition-colors duration-300 font-bold cursor-default">
              Takoudjou Moïse Kalvin
            </span>
            . {t('copyright')}
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-center md:text-right uppercase tracking-wider">
            <span>{t('bottomTerms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
