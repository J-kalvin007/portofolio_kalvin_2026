// 'use client';

// /**
//  * @file global-error.tsx
//  * @description Périmètre de sécurité d'ultime recours (Global Error Boundary) pour Next.js.
//  * 
//  * @architecture
//  * Ce fichier est appelé EXCLUSIVEMENT lorsque le layout racine principal (`app/[locale]/layout.tsx`) 
//  * plante (ex: erreur fatale lors du SSR, de l'hydratation ou d'un Provider React).
//  * Il DOIT posséder ses propres balises `<html>` et `<body>` car le layout principal est considéré comme détruit ou corrompu.
//  * 
//  * Pourquoi : Évite l'écran blanc de la mort (White Screen of Death) en production et garantit 
//  * que l'utilisateur verra toujours une page d'erreur premium, même en cas de panne critique du framework.
//  */

// import PageErreur from '@/components/layout/pageErreur';
// import './globals.css'; // Essentiel pour avoir Tailwind actif si le layout plante

// export default function GlobalError({
//   error,
//   reset,
// }: {
//   error: Error & { digest?: string };
//   reset: () => void;
// }) {
//   return (
//     <html lang="fr" className="dark">
//       <body>
//         <PageErreur 
//           title="Erreur Globale Système"
//           message="Une erreur système fatale est survenue au niveau du layout. L'application va redémarrer automatiquement."
//           reset={reset}
//         />
//       </body>
//     </html>
//   );
// }









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

import { useEffect, useState } from 'react';
import PageErreur from '@/components/layout/pageErreur';
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
    message: "L'application n'a pas pu se charger correctement. Réessayez — si le problème persiste, revenez dans quelques instants.",
  },
  en: {
    title: 'System error',
    message: 'The application failed to load. Try again — if the problem persists, come back in a few moments.',
  },
} as const;

type ErrorLocale = keyof typeof GLOBAL_ERROR_MESSAGES;

/** Langue de repli, alignée sur la locale par défaut de l'application. */
const FALLBACK_LOCALE: ErrorLocale = 'fr';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<ErrorLocale>(FALLBACK_LOCALE);

  /**
   * Le thème était forcé à `dark` en dur : un visiteur en mode clair recevait
   * une page d'erreur sombre, sans rapport avec le reste de sa session.
   * `dark` reste la valeur du rendu serveur — elle correspond à l'identité
   * « Void & Or » et évite tout scintillement pour la majorité des visiteurs —
   * puis la préférence réelle est appliquée dès le montage.
   */
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Langue : préférence du navigateur, seul signal encore disponible.
    const browserLocale = navigator.language.slice(0, 2);
    if (browserLocale in GLOBAL_ERROR_MESSAGES) setLocale(browserLocale as ErrorLocale);

    // Thème : même logique que le script anti-FOUC du layout principal.
    try {
      const stored = localStorage.getItem('theme') || 'system';
      setIsDark(stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    } catch {
      /* localStorage indisponible (navigation privée stricte) : on garde le repli sombre. */
    }
  }, []);

  useEffect(() => {
    console.error('Erreur fatale interceptée par global-error.tsx :', error);
  }, [error]);

  const { title, message } = GLOBAL_ERROR_MESSAGES[locale];

  return (
    <html lang={locale} className={isDark ? 'dark' : undefined} data-theme={isDark ? 'dark' : 'light'} style={{ colorScheme: isDark ? 'dark' : 'light' }}>
      <body>
        <PageErreur
          title={title}
          message={message}
          reset={reset}
        />
      </body>
    </html>
  );
}