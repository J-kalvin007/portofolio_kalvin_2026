

'use client';

/**
 * @file global-error.tsx
 * @description Périmètre de sécurité d'ultime recours (Global Error Boundary) pour Next.js.
 * 
 * @architecture
 * Ce fichier est appelé EXCLUSIVEMENT lorsque le layout racine principal (`app/[locale]/layout.tsx`) 
 * plante (ex: erreur fatale lors du SSR, de l'hydratation ou d'un Provider React).
 * Il DOIT posséder ses propres balises `<html>` et `<body>` car le layout principal est considéré comme détruit ou corrompu.
 * 
 * Pourquoi : Évite l'écran blanc de la mort (White Screen of Death) en production et garantit 
 * que l'utilisateur verra toujours une page d'erreur premium, même en cas de panne critique du framework.
 */

import { useEffect } from 'react';
import PageErreur from '@/components/layout/pageErreur';
import { useClientSnapshot } from '@/hooks/useClientSnapshot';
import { readPrefersDarkTheme } from '@/lib/theme-preference';
// Hors du layout : la police doit être appliquée ici aussi (Poppins, lib/fonts.ts).
import { fontVariables, poppins } from '@/lib/fonts';
import './globals.css'; // Essentiel pour avoir Tailwind actif si le layout plante

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ MESSAGES
   ───────────────────────────────────────────────────────────────────────────
   Les textes étaient figés en français. Aucun hook de traduction n'est utilisé
   ici, volontairement : ce composant se déclenche précisément quand le layout —
   et donc le fournisseur i18n — a échoué. Y appeler `useTranslations`
   provoquerait une seconde exception à l'intérieur du gestionnaire d'erreur, et
   l'écran blanc que ce fichier existe pour empêcher.

   Le layout étant détruit, l'attribut `lang` du document n'est pas fiable non
   plus : on se rabat sur la préférence déclarée par le navigateur.
   ═══════════════════════════════════════════════════════════════════════════ */
const GLOBAL_ERROR_MESSAGES = {
  fr: {
    title: 'Erreur système',
    message: "L’application n’a pas pu se charger correctement. Réessayez — si le problème persiste, revenez dans quelques instants.",
  },
  en: {
    title: 'System error',
    message: 'The application failed to load. Try again — if the problem persists, come back in a few moments.',
  },
} as const;

type ErrorLocale = keyof typeof GLOBAL_ERROR_MESSAGES;

/** Langue de repli, alignée sur la locale par défaut de l'application. */
const FALLBACK_LOCALE: ErrorLocale = 'fr';

/** Langue déclarée par le navigateur, si elle fait partie des langues du site. */
const readBrowserLocale = (): ErrorLocale => {
  const browserLocale = navigator.language.slice(0, 2);
  return browserLocale in GLOBAL_ERROR_MESSAGES ? (browserLocale as ErrorLocale) : FALLBACK_LOCALE;
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /*
   * Langue et thème ne sont connus que dans le navigateur. Au rendu serveur :
   * français et thème sombre (identité par défaut du site) ; ensuite, la
   * préférence réelle, lue sans écart d'hydratation (hooks/useClientSnapshot.ts).
   * Le thème n'est plus forcé à `dark` pour un visiteur en mode clair.
   */
  const locale = useClientSnapshot(readBrowserLocale, FALLBACK_LOCALE);
  const isDark = useClientSnapshot(readPrefersDarkTheme, true);

  useEffect(() => {
    console.error('Erreur fatale interceptée par global-error.tsx :', error);
  }, [error]);

  const { title, message } = GLOBAL_ERROR_MESSAGES[locale];

  return (
    <html lang={locale} className={`${fontVariables}${isDark ? ' dark' : ''}`} data-theme={isDark ? 'dark' : 'light'} style={{ colorScheme: isDark ? 'dark' : 'light' }}>
      <body className={poppins.className}>
        <PageErreur
          title={title}
          message={message}
          reset={reset}
        />
      </body>
    </html>
  );
}