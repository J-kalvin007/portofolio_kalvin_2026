'use client';

/**
 * @file Navbar.tsx
 * @description Barre de navigation du site — direction « Reçu ».
 *
 * @architecture
 * Une barre fixe de 4 rem : logotype typographique, liens, langue, thème et
 * action principale. Sur mobile, un panneau plein écran reprend les liens sous
 * forme de lignes de reçu.
 *
 * Toutes les animations sont en CSS, pilotées par des attributs (`data-*`,
 * `aria-expanded`) : la barre n'embarque plus framer-motion, qui représentait
 * à lui seul une grande partie du JavaScript de chaque page.
 *
 * Comportements conservés de la version précédente (et testés) :
 *  - verrouillage du défilement pendant l'ouverture du menu, avec restauration
 *    de la valeur précédente et compensation de la barre de défilement ;
 *  - `Échap` ferme le menu et rend le focus au bouton ;
 *  - le focus reste dans la barre et le panneau tant que le menu est ouvert ;
 *  - le menu se ferme à chaque changement de page ;
 *  - la langue proposée est déduite de `routing`, et le bouton porte `lang`.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { CONTACT } from '@/lib/site';
import Arrow from '@/components/ui/Arrow';
import ContactIcon from '@/components/ui/ContactIcon';
import Logotype from './Logotype';
import ThemeToggle from './ThemeToggle';
import '@/components/ui/contact-icons.css';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ SEUILS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Défilement (px) au-delà duquel la barre reçoit son filet et son fond flouté. */
const SCROLLED_THRESHOLD = 8;

/** Défilement (px) au-delà duquel la barre s'escamote quand on descend. */
const HIDE_THRESHOLD = 240;

/** Largeur (px) à partir de laquelle la navigation de bureau remplace le menu. */
const DESKTOP_QUERY = '(min-width: 768px)';

/** Éléments pouvant recevoir le focus, pour le piège de focus du menu. */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ STYLES PARTAGÉS
   ═══════════════════════════════════════════════════════════════════════════ */

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

const LANGUAGE_BUTTON =
  `inline-flex h-9 items-center gap-1 rounded-control px-2 text-caption font-medium tracking-[0.04em] text-ink-muted ` +
  `transition-colors duration-(--motion-fast) hover:text-ink cursor-pointer ${FOCUS_RING}`;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');
  const tBrand = useTranslations('brand');

  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hiddenByScroll, setHiddenByScroll] = useState(false);

  /** Englobe la barre et le panneau : périmètre du piège de focus. */
  const shellRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* ── Liens ─────────────────────────────────────────────────────────── */
  const desktopLinks = [
    { href: '/projets' as const, label: t('projects') },
    { href: '/propos' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
  ];
  // Le menu mobile ajoute l'accueil : le logotype est petit sur un téléphone.
  const mobileLinks = [{ href: '/' as const, label: t('home') }, ...desktopLinks];

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  /* ── Langue ────────────────────────────────────────────────────────── */
  /*
   * Langue proposée : l'autre langue déclarée dans `routing`, et non un
   * `'fr' ? 'en' : 'fr'` écrit en dur. Le libellé `switchLanguage` est rédigé
   * dans la langue CIBLE (« Switch to English » sur la version française) :
   * l'attribut `lang` du bouton le fait prononcer correctement. Le code de
   * langue visible (« EN ») figure aussi dans le nom accessible, pour qu'un
   * utilisateur de commande vocale puisse dire « cliquer EN ».
   */
  const nextLocale = routing.locales.find((candidate) => candidate !== locale) ?? routing.defaultLocale;
  const languageLabel = `${t('switchLanguage')} (${nextLocale.toUpperCase()})`;
  const switchLanguage = () => router.replace(pathname, { locale: nextLocale });

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ DÉFILEMENT
     Un seul écouteur passif, limité à une lecture par image. `setState` avec
     une valeur identique ne provoque aucun rendu : la barre ne se re-rend que
     lorsqu'un seuil est franchi.
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    let previousY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setIsScrolled(y > SCROLLED_THRESHOLD);
      // S'escamote en descendant, réapparaît dès que l'on remonte.
      setHiddenByScroll(y > HIDE_THRESHOLD && y > previousY);
      previousY = y;
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    // Première lecture : la page peut être chargée déjà défilée (retour arrière, ancre).
    frame = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ VERROUILLAGE DU DÉFILEMENT
     La valeur précédente est restaurée (et non `'unset'`) : un autre composant
     ayant verrouillé la page — la visionneuse d'images — garde son verrou. La
     largeur de la barre de défilement est compensée pour éviter un décalage.
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!menuOpen) return;

    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [menuOpen]);

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ CLAVIER ET REDIMENSIONNEMENT PENDANT L'OUVERTURE
     `Échap` ferme le menu. La tabulation boucle entre la barre et le panneau :
     sans cela, elle parcourrait la page masquée derrière. Si la fenêtre passe
     en largeur bureau, le panneau disparaît (`md:hidden`) : le menu est fermé
     pour ne pas laisser la page verrouillée.
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = Array.from(shellRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
        // Ignore les éléments masqués (liens de la navigation de bureau, par exemple).
        .filter((element) => element.offsetParent !== null);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const focusIsInside = shellRef.current?.contains(active) ?? false;

      if (event.shiftKey && (active === first || !focusIsInside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !focusIsInside)) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu();
    };

    window.addEventListener('keydown', handleKeyDown);
    desktop.addEventListener('change', handleViewportChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      desktop.removeEventListener('change', handleViewportChange);
    };
  }, [menuOpen, closeMenu]);

  /**
   * Ferme le menu à chaque changement de page.
   *
   * Motif « ajuster l'état quand une prop change » (documentation React) : la
   * comparaison a lieu pendant le rendu. Un `useEffect` produirait d'abord un
   * rendu avec le menu encore ouvert sur la nouvelle page.
   */
  const [pathnameOfLastRender, setPathnameOfLastRender] = useState(pathname);
  if (pathnameOfLastRender !== pathname) {
    setPathnameOfLastRender(pathname);
    setMenuOpen(false);
  }

  /** Jamais escamotée menu ouvert, ni quand un élément de la barre a le focus (voir `focus-within`). */
  const isHidden = hiddenByScroll && !menuOpen;

  return (
    <div ref={shellRef}>
      <header
        data-scrolled={isScrolled || menuOpen}
        data-hidden={isHidden}
        className="fixed inset-x-0 top-0 z-50 h-16 border-b border-transparent bg-canvas
                   transition-[translate,background-color,border-color] duration-(--motion-base) ease-emphasized
                   data-[scrolled=true]:border-line data-[scrolled=true]:bg-canvas/90 data-[scrolled=true]:backdrop-blur-md
                   data-[hidden=true]:not-focus-within:-translate-y-full
                   motion-reduce:transition-none"
      >
        <div className="mx-auto flex h-full w-full max-w-content items-center gap-5 px-4 sm:px-6 lg:px-8">
          {/* Logotype : perforation de reçu + nom sur deux lignes (Logotype.tsx). */}
          <Link href="/" aria-label={tBrand('homeLabel')} className={`rounded-control ${FOCUS_RING}`}>
            <Logotype />
          </Link>

          {/* Navigation de bureau */}
          <nav aria-label={t('mainNavigation')} className="ml-auto hidden md:block">
            <ul className="flex items-center gap-1">
              {desktopLinks.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`relative inline-flex h-9 items-center rounded-control px-3 text-[0.875rem] transition-colors duration-(--motion-fast)
                                  after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current
                                  after:transition-transform after:duration-(--motion-base) after:ease-emphasized hover:after:scale-x-100
                                  aria-[current=page]:font-semibold aria-[current=page]:text-ink aria-[current=page]:after:scale-x-100
                                  text-ink-soft hover:text-ink ${FOCUS_RING}`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-2 md:gap-2">
            <button type="button" onClick={switchLanguage} aria-label={languageLabel} lang={nextLocale} className={LANGUAGE_BUTTON}>
              {routing.locales.map((code, index) => (
                <span key={code} aria-hidden="true" className="inline-flex items-center gap-1">
                  {index > 0 && <span className="text-ink-faint">/</span>}
                  <span className={code === locale ? 'font-semibold text-ink' : undefined}>{code.toUpperCase()}</span>
                </span>
              ))}
            </button>

            <ThemeToggle />

            <Link
              href="/contact"
              className={`ml-2 hidden h-9 items-center rounded-control bg-brand px-3.5 text-[0.8125rem] font-semibold text-brand-ink shadow-e1
                          transition-[transform,box-shadow] duration-(--motion-fast) ease-emphasized hover:-translate-y-px hover:shadow-e2
                          motion-reduce:transform-none md:inline-flex ${FOCUS_RING}`}
            >
              {t('contactBtn')}
            </Link>

            {/* Bouton du menu mobile : deux traits qui se croisent à l'ouverture */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={`group/menu relative -mr-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-control text-ink md:hidden ${FOCUS_RING}`}
            >
              <span aria-hidden="true" className="absolute h-[1.5px] w-5 -translate-y-[3.5px] bg-current transition-transform duration-(--motion-base) ease-emphasized group-aria-expanded/menu:translate-y-0 group-aria-expanded/menu:rotate-45" />
              <span aria-hidden="true" className="absolute h-[1.5px] w-5 translate-y-[3.5px] bg-current transition-transform duration-(--motion-base) ease-emphasized group-aria-expanded/menu:translate-y-0 group-aria-expanded/menu:-rotate-45" />
            </button>
          </div>
        </div>
      </header>

      {/*
        Panneau mobile — toujours présent dans le DOM pour permettre la
        transition CSS. Fermé, il est `inert` : ni focalisable, ni lu par les
        lecteurs d'écran, ni cliquable. Il est placé hors du <header>, dont le
        flou d'arrière-plan créerait un bloc conteneur pour `position: fixed`.
      */}
      <div
        id="mobile-menu"
        data-open={menuOpen}
        inert={!menuOpen}
        className="group/panel invisible fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col overflow-y-auto bg-canvas px-4 pb-8 pt-4 opacity-0
                   transition-[opacity,visibility] duration-(--motion-base) ease-emphasized
                   data-[open=true]:visible data-[open=true]:opacity-100 sm:px-6 md:hidden motion-reduce:transition-none"
      >
        <nav aria-label={t('mainNavigation')}>
          <ol className="border-t border-ink">
            {mobileLinks.map(({ href, label }, index) => (
              <li
                key={href}
                style={{ '--i': index } as React.CSSProperties}
                className="translate-y-2 border-b border-line opacity-0 transition-[opacity,translate] duration-(--motion-slow) ease-emphasized
                           [transition-delay:calc(var(--i)*45ms)]
                           group-data-[open=true]/panel:translate-y-0 group-data-[open=true]/panel:opacity-100
                           motion-reduce:translate-y-0 motion-reduce:transition-none"
              >
                <Link
                  href={href}
                  onClick={closeMenu}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`group/link flex items-baseline gap-3 py-4 text-ink ${FOCUS_RING}`}
                >
                  <span className="text-caption font-semibold tabular-nums text-ink-muted">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em] group-aria-[current=page]/link:text-brand-text">
                    {label}
                  </span>
                  <span aria-hidden="true" className="flex-1 -translate-y-1.5 border-b border-dotted border-line-strong" />
                  <Arrow className="text-ink-muted" />
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <Link
          href="/contact"
          onClick={closeMenu}
          className={`mt-8 inline-flex items-center justify-center rounded-control bg-brand px-5 py-3.5 font-semibold text-brand-ink shadow-e1 ${FOCUS_RING}`}
        >
          {t('contactBtn')}
        </Link>

        {/* Coordonnées en pied de panneau. Sur un téléphone, ce sont les seules
            accessibles sans ouvrir la page Contact : les deux lignes y figurent
            donc, chacune composable d'une touche. */}
        <ul className="mt-auto grid gap-2 pt-10 text-caption text-ink-muted">
          <li>
            <ContactIcon name="mail" className="mr-2 size-[1.15em]" />
            <a href={`mailto:${CONTACT.email}`} className={`break-all text-ink-soft underline decoration-line-strong underline-offset-4 ${FOCUS_RING}`}>
              {CONTACT.email}
            </a>
          </li>
          {CONTACT.phones.map(({ display, href }) => (
            <li key={href}>
              <ContactIcon name="phone" className="mr-2 size-[1.15em]" />
              <a href={href} className={`text-ink-soft underline decoration-line-strong underline-offset-4 ${FOCUS_RING}`}>
                {display}
              </a>
            </li>
          ))}
          <li>
            <ContactIcon name="location" className="mr-2 size-[1.15em]" />
            {CONTACT.city}, {CONTACT.country}
          </li>
        </ul>
      </div>
    </div>
  );
}
