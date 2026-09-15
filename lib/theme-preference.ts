/**
 * @file theme-preference.ts
 * @description Lecture de la préférence de thème réellement en vigueur, pour les
 * écrans qui vivent hors du layout principal (`app/not-found.tsx`,
 * `app/global-error.tsx`) et ne bénéficient donc pas du script anti-FOUC.
 *
 * @remarks Même logique que le script en ligne de `app/[locale]/layout.tsx` —
 * qui, étant une chaîne injectée avant React, ne peut pas importer ce module.
 * Toute évolution de l'une doit être reportée dans l'autre.
 */

/** Clé de stockage partagée avec `lib/useTheme.ts` et le script anti-FOUC. */
export const THEME_STORAGE_KEY = 'theme';

/**
 * `true` si le thème sombre doit s'appliquer : choix explicite `dark`, ou
 * préférence système sombre en l'absence de choix explicite.
 * En cas de stockage inaccessible (navigation privée stricte), repli sombre —
 * l'identité par défaut du site.
 */
export function readPrefersDarkTheme(): boolean {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
    return stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch {
    return true;
  }
}
