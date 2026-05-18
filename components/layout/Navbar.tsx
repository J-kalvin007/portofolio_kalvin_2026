'use client';

/**
 * @file Navbar.tsx — Ultra-Premium Navigation V2
 * @description Barre de navigation cinématique avec glassmorphism avancé,
 * indicateur doré magnétique, menu mobile théâtral et micro-interactions premium.
 */

import { useState, useEffect } from 'react';
import { usePathname as useNextPathname } from 'next/navigation';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const nextPathname = useNextPathname();
  const intlPathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');

  const NAV_LINKS = [
    { href: '/' as const, label: t('home') },
    { href: '/projets' as const, label: t('projects') },
    { href: '/propos' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
  ];

  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { scrollY } = useScroll();

  const toggleLanguage = () => {
    const nextLocale = locale === 'fr' ? 'en' : 'fr';
    router.replace(intlPathname, { locale: nextLocale });
  };

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setIsScrolled(latest > 50);
    if (latest > 200 && latest > previous && !menuOpen) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === '/') return intlPathname === '/';
    return intlPathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 inset-x-0 z-50 transition-all duration-700
          ${isScrolled
            ? 'py-2.5 px-4 lg:px-8'
            : 'py-4 px-6 lg:px-12'
          }
        `}
      >
        {/* Glassmorphic Background Layer */}
        <motion.div
          className="absolute inset-0 transition-all duration-700"
          style={{ opacity: isScrolled ? 1 : 0 }}
        >
          <div className="absolute inset-x-3 inset-y-0 rounded-2xl bg-white/70 dark:bg-[#070510]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/50 dark:border-white/[0.06]" />
        </motion.div>

        <div className="max-w-[1400px] mx-auto flex justify-between items-center relative z-10">
          {/* Logo */}
          <div className="relative z-[60]">
            <Logo size={isScrolled ? 32 : 36} showText={!isScrolled} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex relative items-center gap-1 px-2 py-1.5 rounded-full">
            {/* Hover indicator (gold glow pill) */}
            <AnimatePresence>
              {hoveredLink && (
                <motion.div
                  layoutId="nav-hover-glow"
                  className="absolute inset-y-1 rounded-full bg-primary/[0.08] dark:bg-primary/[0.12] border border-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
            </AnimatePresence>

            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onMouseEnter={() => setHoveredLink(href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="cursor-pointer relative px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 group"
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/25 shadow-[0_0_15px_rgba(240,165,0,0.1)]"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                    />
                  )}

                  <span className={`relative z-10 transition-all duration-300 ${
                    active
                      ? 'text-primary font-bold drop-shadow-[0_0_8px_rgba(240,165,0,0.3)]'
                      : 'text-base-content/60 group-hover:text-primary'
                  }`}>
                    {label}
                  </span>

                  {/* Active dot */}
                  {active && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_rgba(240,165,0,0.8)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 relative z-[60]">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="cursor-pointer relative px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase text-base-content/50 hover:text-primary border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>

            <ThemeToggle />

            {/* CTA Button with shimmer */}
            <Link
              href="/contact"
              className="cursor-pointer group relative overflow-hidden px-7 py-2.5 rounded-full bg-gradient-to-r from-primary to-[#FFD166] text-black transition-all duration-500 hover:scale-105 hover:shadow-[0_0_25px_rgba(240,165,0,0.4)] active:scale-95"
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 font-bold text-sm tracking-wide">
                {t('contactBtn')}
              </span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2.5 relative z-[60]">
            <button
              onClick={toggleLanguage}
              className="cursor-pointer text-xs font-bold tracking-widest uppercase text-base-content/50 hover:text-primary transition-colors"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
            <ThemeToggle />

            {/* Animated hamburger */}
            <button
              className="cursor-pointer p-2 -mr-2 text-base-content flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7, backgroundColor: 'rgb(240,165,0)' } : { rotate: 0, y: 0 }}
                className="w-6 h-[2px] bg-current block origin-center"
                transition={{ duration: 0.3 }}
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                className="w-6 h-[2px] bg-current block"
                transition={{ duration: 0.2 }}
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7, backgroundColor: 'rgb(240,165,0)' } : { rotate: 0, y: 0 }}
                className="w-6 h-[2px] bg-current block origin-center"
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ═══ MOBILE MENU — Theatrical Full-Screen ═══ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 md:hidden flex flex-col overflow-hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-white/95 dark:bg-[#070510]/95 backdrop-blur-3xl"
            />

            {/* Ambient orbs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
            />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

            <div className="flex flex-col justify-center h-full px-8 pb-20 items-center relative z-10">
              <nav className="flex flex-col gap-3 items-center text-center w-full max-w-xs">
                {NAV_LINKS.map(({ href, label }, i) => (
                  <div key={href} className="overflow-hidden w-full">
                    <motion.div
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '100%', opacity: 0 }}
                      transition={{
                        delay: 0.1 + i * 0.08,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className={`cursor-pointer group relative flex items-center justify-center py-4 px-6 rounded-2xl text-2xl sm:text-3xl font-bold tracking-tight transition-all duration-500 ${
                          isActive(href)
                            ? 'text-primary bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(240,165,0,0.1)]'
                            : 'text-base-content hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        {/* Active glow line */}
                        {isActive(href) && (
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-primary shadow-[0_0_10px_rgba(240,165,0,0.6)]" />
                        )}
                        {label}
                      </Link>
                    </motion.div>
                  </div>
                ))}

                {/* Mobile CTA */}
                <motion.div
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full mt-4"
                >
                  <Link
                    href="/contact"
                    onClick={() => setMenuOpen(false)}
                    className="cursor-pointer flex items-center justify-center py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-[#FFD166] text-black font-bold text-lg tracking-wide shadow-[0_0_20px_rgba(240,165,0,0.3)] hover:shadow-[0_0_30px_rgba(240,165,0,0.5)] transition-all duration-500"
                  >
                    {t('contactBtn')}
                  </Link>
                </motion.div>
              </nav>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute bottom-8 left-0 right-0 text-center text-[10px] text-base-content/30 tracking-[0.3em] uppercase font-bold"
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
