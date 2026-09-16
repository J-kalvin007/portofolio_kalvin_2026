'use client';

/**
 * @file pageErreur.tsx
 * @description Page d'erreur commune (404 et erreurs d'exécution) — direction « Reçu ».
 *
 * @architecture
 * - Utilisé par `app/[locale]/not-found.tsx` (adresse inconnue, dans le layout).
 * - Utilisé par `app/[locale]/error.tsx` (erreur d'affichage, dans le layout).
 * - Utilisé par `app/not-found.tsx` et `app/global-error.tsx` (hors layout).
 *
 * Présentée comme un billet refusé : code, tampon, explication, actions.
 * Les couleurs suivent le thème du visiteur (l'ancienne version imposait un
 * fond noir et un or codé en dur, un robot animé Lottie et un champ
 * d'étoiles). Tous les styles propres à cette page sont dans `globals.css`
 * (`.err-*`) : Next.js intègre les écrans d'erreur à chaque page, une feuille
 * dédiée serait préchargée partout sans être utilisée.
 *
 * Aucun hook de traduction, volontairement : ce composant sert aussi
 * `global-error.tsx`, qui s'affiche précisément quand le fournisseur i18n a
 * échoué. La langue est lue sur l'attribut `lang` du document.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useClientSnapshot } from '@/hooks/useClientSnapshot';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ MINUTERIE DE REDIRECTION (page 404 uniquement)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Durée du compte à rebours, en secondes. */
const REDIRECT_DELAY = 5;

/** Périmètre du cercle de progression : 2 × π × r, pour r = 10. */
const RING_CIRCUMFERENCE = 62.83;

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ LIBELLÉS
   ═══════════════════════════════════════════════════════════════════════════ */
const UI_STRINGS = {
  fr: {
    defaultTitle: 'Page introuvable',
    defaultMessage: "Cette adresse ne correspond à aucune page du site. Elle a peut-être été déplacée, ou l'adresse comporte une erreur de frappe.",
    stampNotFound: 'Introuvable',
    stampError: 'Erreur',
    home: "Retour à l'accueil",
    retry: 'Réessayer',
    previous: 'Page précédente',
    redirectIn: (s: number) => `Redirection vers l'accueil dans ${s} s`,
    cancel: 'Annuler la redirection',
  },
  en: {
    defaultTitle: 'Page not found',
    defaultMessage: 'This address does not match any page on the site. It may have moved, or the address contains a typo.',
    stampNotFound: 'Not found',
    stampError: 'Error',
    home: 'Back to home',
    retry: 'Try again',
    previous: 'Previous page',
    redirectIn: (s: number) => `Redirecting to the home page in ${s}s`,
    cancel: 'Cancel redirect',
  },
} as const;

type ErrorLocale = keyof typeof UI_STRINGS;
const FALLBACK_LOCALE: ErrorLocale = 'fr';

/** Langue posée sur `<html lang>` par l'appelant, si elle est connue. */
const readDocumentLocale = (): ErrorLocale => {
  const documentLocale = document.documentElement.lang;
  return documentLocale in UI_STRINGS ? (documentLocale as ErrorLocale) : FALLBACK_LOCALE;
};

/** Réglages d'une animation d'entrée (`.err-rise`, voir `app/globals.css`). */
const rise = (delay: number, shift = '0px') =>
  ({ '--err-delay': `${delay}s`, '--err-shift': shift }) as React.CSSProperties;

/** Actions sur le papier du billet : même contraste dans les deux thèmes. */
const ACTION_BASE =
  'inline-flex items-center justify-center rounded-control px-5 py-3 text-[0.9375rem] font-semibold cursor-pointer transition-colors duration-(--motion-fast) ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp';
const ACTION_PRIMARY = `${ACTION_BASE} bg-stamp text-white hover:bg-stamp/90`;
const ACTION_SECONDARY = `${ACTION_BASE} border border-paper-line text-paper-ink hover:border-paper-ink`;

interface PageErreurProps {
  /** Code affiché en grand (« 404 »). Absent pour une erreur d'exécution. */
  code?: string;
  title?: string;
  message?: string;
  /** Fourni par un périmètre d'erreur Next.js : propose de réessayer. */
  reset?: () => void;
}

export default function PageErreur({ code, title, message, reset }: PageErreurProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const [isPaused, setIsPaused] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  // Repli au rendu serveur, langue réelle ensuite, sans écart d'hydratation.
  const locale = useClientSnapshot(readDocumentLocale, FALLBACK_LOCALE);
  const strings = UI_STRINGS[locale];
  // Accueil dans la langue courante : « / » repassait par la détection de langue.
  const homeUrl = `/${locale}`;

  /**
   * La présence de `reset` signifie que l'appelant est un périmètre d'erreur :
   * le visiteur a une action à sa disposition — réessayer — et l'emmener
   * ailleurs de force la lui retirerait. La redirection automatique ne
   * concerne donc que la page 404.
   */
  const shouldAutoRedirect = !reset;
  const showCountdown = shouldAutoRedirect && !isCancelled;

  /** Décompte seconde par seconde : un délai par tic, arrêté à zéro ou en pause. */
  useEffect(() => {
    if (!shouldAutoRedirect || isCancelled || isPaused || countdown <= 0) return;
    const timeout = setTimeout(() => setCountdown((previous) => previous - 1), 1000);
    return () => clearTimeout(timeout);
  }, [countdown, isPaused, isCancelled, shouldAutoRedirect]);

  /**
   * Redirection à zéro. `replace` et non `push` : sinon, revenir en arrière
   * depuis l'accueil ramenait sur la 404, qui relançait le décompte.
   */
  useEffect(() => {
    if (!shouldAutoRedirect || isCancelled || countdown > 0) return;
    router.replace(homeUrl);
  }, [countdown, isCancelled, shouldAutoRedirect, homeUrl, router]);

  const goHome = () => {
    setIsCancelled(true);
    router.replace(homeUrl);
  };

  /** Toute interaction avec le billet suspend le décompte (WCAG 2.2.1). */
  const pauseCountdown = useCallback(() => setIsPaused(true), []);
  const resumeCountdown = useCallback(() => setIsPaused(false), []);

  const progress = (REDIRECT_DELAY - countdown) / REDIRECT_DELAY;

  return (
    <div className="grid min-h-[calc(100svh-4rem)] place-items-center bg-canvas px-4 pb-16 pt-28 text-ink sm:px-6">
      <div
        className="err-rise err-ticket w-full max-w-[30rem]"
        style={rise(0, '16px')}
        onPointerEnter={pauseCountdown}
        onPointerLeave={resumeCountdown}
        onFocusCapture={pauseCountdown}
      >
        <div className="err-paper">
          <div className="flex items-start justify-between gap-4">
            {code && <p className="err-code" aria-hidden="true">{code}</p>}
            <p className="err-stamp err-rise" style={rise(0.35)}>
              {code ? strings.stampNotFound : strings.stampError}
            </p>
          </div>

          <h1 className="mt-4 text-heading font-bold text-balance">{title ?? strings.defaultTitle}</h1>
          <p className="mt-3 text-pretty text-paper-muted">{message ?? strings.defaultMessage}</p>

          {showCountdown && (
            <div className="mt-6 flex items-center gap-3 border-y border-dashed border-paper-line py-3">
              <svg className="h-6 w-6 shrink-0 -rotate-90" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-paper-line" />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
                  className="err-ring text-stamp"
                />
              </svg>
              <span aria-live="polite" className="flex-1 text-caption font-medium tabular-nums">
                {strings.redirectIn(countdown)}
              </span>
              <button
                type="button"
                onClick={() => setIsCancelled(true)}
                aria-label={strings.cancel}
                title={strings.cancel}
                className="cursor-pointer rounded-control p-1.5 text-paper-muted transition-colors hover:text-paper-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={goHome} className={ACTION_PRIMARY}>
              {strings.home}
            </button>
            {reset ? (
              <button type="button" onClick={reset} className={ACTION_SECONDARY}>
                {strings.retry}
              </button>
            ) : (
              <button type="button" onClick={() => window.history.back()} className={ACTION_SECONDARY}>
                {strings.previous}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
