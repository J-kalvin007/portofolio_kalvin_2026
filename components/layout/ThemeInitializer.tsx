// 'use client';

// /**
//  * @file ThemeInitializer.tsx
//  * @description Composant utilitaire invisible (headless) chargé d'initialiser le thème Zustand au lancement de l'application.
//  * 
//  * @architecture
//  * Ce composant est un "Client Component" (`'use client'`) qui doit être monté le plus haut possible dans 
//  * l'arbre DOM (généralement dans le `<body>` de `layout.tsx`).
//  * 
//  * Pourquoi : Il fait le pont entre le code serveur (SSR) et le navigateur du client. Il appelle le hook `useThemeInit` 
//  * qui va lire le `localStorage` de l'utilisateur et injecter dynamiquement la classe CSS `dark` sur la balise `<html>` 
//  * AVANT que l'utilisateur ne puisse voir un flash blanc gênant (Flash of Unstyled Content - FOUC).
//  */

// import { useThemeInit } from '@/lib/useTheme';

// export default function ThemeInitializer() {
//   // Déclenche l'effet de synchronisation DOM <-> Zustand dès le premier rendu côté client
//   useThemeInit();

//   // Ce composant ne rend aucune interface visuelle (Headless component)
//   return null;
// }



















'use client';

/**
 * @file ThemeInitializer.tsx
 * @description Composant utilitaire invisible (headless) chargé de synchroniser le store Zustand
 * du thème avec l'état réel du document au lancement de l'application.
 *
 * @architecture
 * Ce composant est un "Client Component" (`'use client'`) qui doit être monté le plus haut possible
 * dans l'arbre DOM (dans le `<body>` de `app/[locale]/layout.tsx`).
 *
 * @remarks **Correction de documentation.** Le commentaire précédent lui attribuait la prévention
 * du FOUC (Flash of Unstyled Content). Ce n'est pas le cas, et ce ne peut pas l'être : un composant
 * React ne s'exécute qu'après l'hydratation, donc **après** le premier rendu visuel. À ce moment,
 * un éventuel flash blanc a déjà eu lieu.
 *
 * La prévention du FOUC est assurée par le script en ligne injecté dans le `<head>` de
 * `app/[locale]/layout.tsx` : synchrone et bloquant, il pose la classe `dark`, l'attribut
 * `data-theme` et `color-scheme` sur `<html>` avant que le navigateur ne peigne quoi que ce soit.
 *
 * Le rôle réel de ce composant est complémentaire et néanmoins nécessaire : faire savoir au store
 * Zustand quel thème le script a appliqué, afin que `ThemeToggle` affiche la bonne icône et que le
 * cycle de bascule parte du bon état.
 */

import { useThemeInit } from '@/lib/useTheme';

export default function ThemeInitializer() {
  // Aligne l'état Zustand sur ce que le script anti-FOUC a déjà posé sur le document.
  useThemeInit();

  // Ce composant ne rend aucune interface visuelle (Headless component)
  return null;
}