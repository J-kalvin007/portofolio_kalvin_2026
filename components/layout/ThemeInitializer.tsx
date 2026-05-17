'use client';

/**
 * @file ThemeInitializer.tsx
 * @description Composant utilitaire invisible (headless) chargé d'initialiser le thème Zustand au lancement de l'application.
 * 
 * @architecture
 * Ce composant est un "Client Component" (`'use client'`) qui doit être monté le plus haut possible dans 
 * l'arbre DOM (généralement dans le `<body>` de `layout.tsx`).
 * 
 * Pourquoi : Il fait le pont entre le code serveur (SSR) et le navigateur du client. Il appelle le hook `useThemeInit` 
 * qui va lire le `localStorage` de l'utilisateur et injecter dynamiquement la classe CSS `dark` sur la balise `<html>` 
 * AVANT que l'utilisateur ne puisse voir un flash blanc gênant (Flash of Unstyled Content - FOUC).
 */

import { useThemeInit } from '@/lib/useTheme';

export default function ThemeInitializer() {
  // Déclenche l'effet de synchronisation DOM <-> Zustand dès le premier rendu côté client
  useThemeInit();
  
  // Ce composant ne rend aucune interface visuelle (Headless component)
  return null;
}
