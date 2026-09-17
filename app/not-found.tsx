
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


import PageErreur from '@/components/layout/pageErreur';
import { useClientSnapshot } from '@/hooks/useClientSnapshot';
import { readPrefersDarkTheme } from '@/lib/theme-preference';
// Hors du layout : la police doit être appliquée ici aussi (Poppins, lib/fonts.ts).
import { fontVariables, poppins } from '@/lib/fonts';
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
    message: "Cette adresse ne correspond à aucune page du site. Elle a peut-être été déplacée, ou l’adresse comporte une erreur de frappe.",
  },
  en: {
    title: 'Page not found',
    message: 'This address does not match any page on the site. It may have moved, or the address contains a typo.',
  },
} as const;

type NotFoundLocale = keyof typeof NOT_FOUND_MESSAGES;

/** Langue de repli, alignée sur la locale par défaut de l'application. */
const FALLBACK_LOCALE: NotFoundLocale = 'fr';

/** Langue déclarée par le navigateur, si elle fait partie des langues du site. */
const readBrowserLocale = (): NotFoundLocale => {
  const browserLocale = navigator.language.slice(0, 2);
  return browserLocale in NOT_FOUND_MESSAGES ? (browserLocale as NotFoundLocale) : FALLBACK_LOCALE;
};

export default function NotFound() {
  /*
   * Langue et thème ne sont connus que dans le navigateur. Au rendu serveur :
   * français et thème sombre (identité par défaut du site) ; ensuite, la
   * préférence réelle, lue sans écart d'hydratation (hooks/useClientSnapshot.ts).
   * Le thème n'est plus forcé à `dark` pour un visiteur en mode clair.
   */
  const locale = useClientSnapshot(readBrowserLocale, FALLBACK_LOCALE);
  const isDark = useClientSnapshot(readPrefersDarkTheme, true);

  const { title, message } = NOT_FOUND_MESSAGES[locale];

  return (
    <html lang={locale} className={`${fontVariables}${isDark ? ' dark' : ''}`} data-theme={isDark ? 'dark' : 'light'} style={{ colorScheme: isDark ? 'dark' : 'light' }}>
      <body className={poppins.className}>
        <PageErreur code="404" title={title} message={message} />
      </body>
    </html>
  );
}