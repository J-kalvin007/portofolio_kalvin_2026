/**
 * @file regie/layout.tsx
 * @description Document de la régie : la page d'administration des lumières et
 * du fond du site.
 *
 * @architecture
 * La régie vit **hors du segment `[locale]`**. Elle fournit donc son propre
 * document (`<html>`, `<body>`), comme `app/not-found.tsx`, et n'hérite ni de la
 * barre de navigation, ni du pied de page, ni du fournisseur de traductions :
 * c'est un outil, en français, réservé au propriétaire du site. `proxy.ts`
 * l'exclut du routage par langue.
 *
 * @remarks **Introuvable par un moteur de recherche.** La page est marquée
 * `noindex` ici même. Elle n'est volontairement **pas** citée dans
 * `robots.txt` : ce fichier est public, et y écrire `/regie` reviendrait à
 * afficher l'adresse qu'on cherche à ne pas montrer. Aucune page du site ne
 * pointe vers elle ; `noindex` couvre le cas où quelqu'un publierait le lien.
 */

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontVariables, poppins } from '@/lib/fonts';
import ThemeInitializer from '@/components/layout/ThemeInitializer';
import '../globals.css';
import './regie.css';

export const metadata: Metadata = {
  title: 'Centre de contrôle avancé secret',
  // Le pictogramme d'onglet du site. Sans lui, le navigateur demande
  // `/favicon.ico`, qui n'existe pas dans ce projet : une erreur 404 à chaque visite.
  icons: { icon: '/logo/kal_logo_01.png' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
};

/**
 * Applique le thème avant le premier affichage, pour éviter un éclair clair ou
 * sombre. Même logique que le script du layout public
 * (`app/[locale]/layout.tsx`) et que `lib/theme-preference.ts` : c'est une
 * chaîne injectée avant React, elle ne peut importer aucun module. Toute
 * évolution de l'une doit être reportée dans les autres.
 */
const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.setAttribute('data-theme',d?'dark':'light');r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RegieLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={fontVariables}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className={`${poppins.className} antialiased`}>
        {/* Aligne l'état du thème (Zustand) sur ce que le script vient d'appliquer. */}
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
