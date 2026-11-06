import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/**
 * @file manifest.ts
 * @description Web App Manifest — servi sur `/manifest.webmanifest`.
 *
 * @architecture
 * Généré par Next.js App Router (convention de fichier).
 * Couvre Android Chrome (PWA « Add to Home Screen »), Safari iOS (balise
 * `<link rel="apple-touch-icon">` complète ce manifest), et les navigateurs
 * de bureau qui proposent l'installation de la Progressive Web App.
 *
 * Toutes les icônes pointent vers la **même source** : `app/icon.png`,
 * dont les dérivés ont été générés par `sharp` dans `public/logo/`.
 * Les tailles déclarées correspondent aux dérivés effectivement présents
 * sur le disque — aucun navigateur ne cherchera une taille fantôme.
 *
 * @remarks
 * - `display: 'standalone'` : l'application s'ouvre sans barre d'adresse, ce
 *   qui lui donne l'apparence d'une application native sur mobile.
 * - `theme_color` et `background_color` sont alignés sur `--ds-canvas`
 *   (app/design-system.css) et sur les valeurs `themeColor` du viewport
 *   (`app/[locale]/layout.tsx`).
 * - `start_url` pointe vers la locale par défaut pour que le splash screen
 *   ouvre la bonne page, même sans cookie de préférence de langue.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kalvin Takoudjou — Portfolio',
    short_name: 'Kalvin',
    description: 'Portfolio de Kalvin Takoudjou — Ingénieur logiciel full-stack & mobile basé à Lomé, Togo.',
    start_url: `${SITE_URL}/fr`,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',

    /* ── Couleurs ──────────────────────────────────────────────────────────
       Alignées sur `--ds-canvas` (design-system.css) et les `themeColor`
       du viewport (`app/[locale]/layout.tsx`).
       ───────────────────────────────────────────────────────────────────── */
    background_color: '#0E1115',   // fond sombre par défaut (couleur dominante du splash)
    theme_color: '#EEF0EF',        // correspond à la themeColor light — la barre de statut

    /* ── Icônes ────────────────────────────────────────────────────────────
       Chaque entrée correspond à un fichier physique présent dans `public/`.
       `purpose: 'any maskable'` permet aux lanceurs Android de recadrer
       l'icône à volonté (cercle, squircle, etc.) sans bord blanc.
       ───────────────────────────────────────────────────────────────────── */
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo/kal_logo_01.png',
        sizes: '1080x1080',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],

    /* ── Catégorie ─────────────────────────────────────────────────────────
       Utilisée par les app stores et les lanceurs compatibles (Chrome sur
       Android) pour classifier l'application dans les recherches. */
    categories: ['portfolio', 'business'],

    /* ── Langue ─────────────────────────────────────────────────────────── */
    lang: 'fr',
    dir: 'ltr',
  };
}

