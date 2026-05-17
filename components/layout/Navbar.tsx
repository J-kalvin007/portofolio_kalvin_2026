'use client';

/**
 * @file Navbar.tsx
 * @description Barre de navigation principale de l'application. Hautement interactive et responsive.
 * 
 * @architecture
 * - Navigation basée sur le défilement (Scroll-Aware) : Se cache lors du défilement vers le bas et réapparaît au défilement vers le haut (`useScroll` & `useMotionValueEvent` de framer-motion).
 * - "Glassmorphism" au scroll : La barre devient semi-transparente avec un effet de flou (`backdrop-blur-2xl`) dès qu'on quitte le sommet de la page.
 * - Gestion du menu mobile en plein écran (`AnimatePresence` pour démonter/monter avec animation).
 * - Bascule de langue (i18n) et bascule de thème clair/sombre (`ThemeToggle`).
 * - Indicateur actif dynamique sur les liens via `layoutId` (Framer Motion).
 */

import { useState, useEffect } from 'react';
import { usePathname as useNextPathname } from 'next/navigation';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  // Récupération des hooks nécessaires à l'état de la navigation et de la traduction
  const nextPathname = useNextPathname();
  const intlPathname = usePathname(); // Hook next-intl garantissant un chemin neutre de la langue
  const router = useRouter(); // Routeur next-intl
  const locale = useLocale(); // 'fr' ou 'en'
  const t = useTranslations('nav'); // Chargement des clés du dictionnaire 'nav'

  // Définition statique des liens (facilite la boucle map)
  const NAV_LINKS = [
    { href: '/' as const, label: t('home') },
    { href: '/projets' as const, label: t('projects') },
    { href: '/propos' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
  ];

  // États de l'interface
  const [menuOpen, setMenuOpen] = useState(false); // État du menu hamburger (mobile)
  const [isScrolled, setIsScrolled] = useState(false); // Est-on descendu sur la page ?
  const [isHidden, setIsHidden] = useState(false); // La navbar doit-elle se cacher ?

  // Hook Framer Motion pour écouter la position du scroll de manière très performante (hors du cycle de rendu classique)
  const { scrollY } = useScroll();

  /**
   * @function toggleLanguage
   * Change la langue du site à la volée tout en conservant l'URL actuelle.
   */
  const toggleLanguage = () => {
    const nextLocale = locale === 'fr' ? 'en' : 'fr';
    router.replace(intlPathname, { locale: nextLocale });
  };

  /**
   * @effect Écouteur de défilement (Scroll Listener).
   * Pourquoi : Évite les lourdeurs de performance d'un écouteur window.addEventListener classique.
   */
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Si on a scrollé de plus de 50px, on applique l'effet Glassmorphism
    setIsScrolled(latest > 50);
    // Si on descend (latest > previous) de plus de 200px et que le menu mobile n'est pas ouvert, on cache la navbar
    if (latest > 200 && latest > previous && !menuOpen) {
      setIsHidden(true);
    } else {
      // Si on remonte, on l'affiche
      setIsHidden(false);
    }
  });

  /**
   * @effect Verrouillage du scroll (Scroll Lock).
   * Pourquoi : Quand le menu mobile est ouvert, on empêche le corps de la page de défiler derrière lui.
   */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; }; // Nettoyage lors du démontage
  }, [menuOpen]);

  /**
   * Vérifie si un lien de la navbar correspond à la route actuelle.
   */
  const isActive = (href: string) => {
    if (href === '/') return intlPathname === '/';
    return intlPathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isHidden ? -100 : 0 }} // Cache ou montre la navbar
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 inset-x-0 z-50 px-6 lg:px-12 py-4
          transition-all duration-500
          ${isScrolled
            ? 'bg-white/80 dark:bg-[#070510]/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-slate-200/50 dark:border-white/[0.05]'
            : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          {/* Section Gauche : Logo */}
          <div className="relative z-[60]">
            {/* Le texte du logo disparaît subtilement au scroll pour laisser place à une Navbar minimaliste */}
            <Logo size={36} showText={!isScrolled} />
          </div>

          {/* Section Centrale : Navigation Desktop */}
          <nav className={`
            hidden md:flex relative items-center gap-2 px-3 py-2 rounded-full border transition-all duration-500
            ${isScrolled
              ? 'bg-white/50 dark:bg-white/5 border-slate-200/50 dark:border-white/10 shadow-sm'
              : 'bg-transparent border-transparent'
            }
          `}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="cursor-pointer relative px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-colors duration-300 group"
                >
                  {/* Indicateur de lien actif (Pastille animée par Framer Motion `layoutId`) */}
                  {active && (
                    <motion.div
                      layoutId="nav-active-indicator" // Connecte l'animation entre tous les éléments partageant cet ID
                      className="absolute inset-0 bg-slate-100 dark:bg-white/10 rounded-full"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 ${active
                      ? 'text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Section Droite : Actions Desktop (Bouton Contact, Langue, Thème) */}
          <div className="hidden md:flex items-center gap-4 relative z-[60]">
            <button
              onClick={toggleLanguage}
              className="cursor-pointer text-xs font-bold tracking-widest uppercase text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
            <ThemeToggle />
            <Link
              href="/contact"
              className="cursor-pointer group relative overflow-hidden px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-[#070510] transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {/* Effet bouton "Void & Or" avec remplissage interactif */}
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]" />
              <span className="relative z-10 font-bold text-sm tracking-wide group-hover:text-primary-content transition-colors duration-500">
                {t('contactBtn')}
              </span>
            </Link>
          </div>

          {/* Section Mobile : Bouton Hamburger animé + Actions Rapides */}
          <div className="flex md:hidden items-center gap-3 relative z-[60]">
            <button
              onClick={toggleLanguage}
              className="cursor-pointer text-xs font-bold tracking-widest uppercase text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mr-1"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
            <ThemeToggle />

            {/* Menu Hamburger animé (transforme 3 lignes en croix) */}
            <button
              className="cursor-pointer p-2 -mr-2 text-slate-900 dark:text-white flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-6 h-[2px] bg-current block transition-all"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-6 h-[2px] bg-current block transition-all"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-6 h-[2px] bg-current block transition-all"
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Interface Menu Mobile (Affichage en plein écran par-dessus la page) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-white/95 dark:bg-[#070510]/95 backdrop-blur-3xl md:hidden flex flex-col"
          >
            {/* Ambiances de fond luxueuses pour le menu */}
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex flex-col justify-center h-full px-8 pb-20 items-center">
              <nav className="flex flex-col gap-8 items-center text-center">
                {NAV_LINKS.map(({ href, label }, i) => (
                  <div key={href} className="overflow-hidden">
                    {/* Les liens entrent en cascade (Stagger effect) grâce au "delay" basé sur l'index "i" */}
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{
                        delay: menuOpen ? 0.1 + i * 0.08 : 0,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)} // Ferme le menu après un clic
                        className="cursor-pointer group relative inline-flex items-center text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-white transition-colors duration-300"
                      >
                        <span className={`relative z-10 transition-colors duration-500 ${isActive(href) ? 'text-primary' : 'group-hover:text-primary'}`}>
                          {label}
                        </span>
                        {/* Barre de soulignement au survol */}
                        <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-primary transition-all duration-500 ease-[0.22,1,0.36,1] group-hover:w-full" />
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </nav>

              {/* Mentions de copyright du menu mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute bottom-8 left-0 right-0 text-center text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase font-medium"
              >
                Takoudjou Moïse Kalvin © {new Date().getFullYear()}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
