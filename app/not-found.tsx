// 'use client';

// /**
//  * @file not-found.tsx (Root)
//  * @description Page 404 globale de l'application (hors du scope [locale]).
//  * 
//  * @architecture
//  * Ce fichier est déclenché par Next.js lorsqu'une URL est tapée mais qu'elle ne correspond 
//  * à RIEN dans l'application (ex: une route complètement hors du dossier `[locale]`).
//  * Parce qu'il est à la racine, et qu'il n'y a pas de layout.tsx racine (seulement dans [locale]), 
//  * il doit impérativement fournir ses propres balises `<html>` et `<body>`.
//  * 
//  * Pourquoi : Évite l'erreur fatale "Missing <html> and <body> tags" de Next.js pour les mauvaises URLs globales.
//  */

// import PageErreur from '@/components/layout/pageErreur';
// import './globals.css';

// export default function NotFound() {
//   return (
//     <html lang="fr" className="dark">
//       <body>
//         <PageErreur 
//           title="Page Introuvable" 
//           message="Désolé, la page que vous recherchez n'existe pas ou a été déplacée. Vous allez être redirigé vers l'accueil." 
//         />
//       </body>
//     </html>
//   );
// }




























'use client';

/**
 * @file not-found.tsx (Root)
 * @description Page 404 globale de l'application (hors du scope [locale]).
 * 
 * @architecture
 * Ce fichier est déclenché par Next.js lorsqu'une URL est tapée mais qu'elle ne correspond 
 * à RIEN dans l'application (ex: une route complètement hors du dossier `[locale]`).
 * Parce qu'il est à la racine, et qu'il n'y a pas de layout.tsx racine (seulement dans [locale]), 
 * il doit impérativement fournir ses propres balises `<html>` et `<body>`.
 * 
 * Pourquoi : Évite l'erreur fatale "Missing <html> and <body> tags" de Next.js pour les mauvaises URLs globales.
 */

import { useEffect, useState } from 'react';
import PageErreur from '@/components/layout/pageErreur';
import './globals.css';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ MESSAGES
   ───────────────────────────────────────────────────────────────────────────
   Cette page vit hors du segment `[locale]` : il n'y a ni provider i18n, ni
   locale dans l'URL. La seule information de langue disponible est la
   préférence déclarée par le navigateur.

   Le message annonçait « Vous allez être redirigé vers l'accueil ». Si
   `PageErreur` ne programme pas réellement cette redirection, la phrase promet
   quelque chose qui n'arrive jamais — et l'utilisateur reste à attendre. La
   formulation retenue décrit ce qui est certain.
   ═══════════════════════════════════════════════════════════════════════════ */
const NOT_FOUND_MESSAGES = {
  fr: {
    title: 'Page introuvable',
    message: "Cette adresse ne correspond à aucune page du site. Elle a peut-être été déplacée, ou l'adresse comporte une erreur de frappe.",
  },
  en: {
    title: 'Page not found',
    message: 'This address does not match any page on the site. It may have moved, or the address contains a typo.',
  },
} as const;

type NotFoundLocale = keyof typeof NOT_FOUND_MESSAGES;

/** Langue de repli, alignée sur la locale par défaut de l'application. */
const FALLBACK_LOCALE: NotFoundLocale = 'fr';

export default function NotFound() {
  const [locale, setLocale] = useState<NotFoundLocale>(FALLBACK_LOCALE);

  /** `dark` au rendu serveur — identité « Void & Or » — puis préférence réelle au montage. */
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const browserLocale = navigator.language.slice(0, 2);
    if (browserLocale in NOT_FOUND_MESSAGES) setLocale(browserLocale as NotFoundLocale);

    try {
      const stored = localStorage.getItem('theme') || 'system';
      setIsDark(stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    } catch {
      /* localStorage indisponible : on garde le repli sombre. */
    }
  }, []);

  const { title, message } = NOT_FOUND_MESSAGES[locale];

  return (
    <html lang={locale} className={isDark ? 'dark' : undefined} data-theme={isDark ? 'dark' : 'light'} style={{ colorScheme: isDark ? 'dark' : 'light' }}>
      <body>
        <PageErreur
          title={title}
          message={message}
        />
      </body>
    </html>
  );
}