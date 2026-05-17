'use client';

/**
 * @file useTheme.ts
 * @description Store global pour la gestion du thème (Clair/Sombre) et de la langue via Zustand.
 * 
 * @architecture
 * - Utilise `zustand` pour créer un état global ultra-performant sans avoir besoin du Context API de React (évite les re-renders inutiles).
 * - Implémente une synchronisation persistante avec le `localStorage` du navigateur.
 * - Modifie directement l'arbre DOM (`document.documentElement.classList`) pour appliquer le mode sombre instantanément.
 * 
 * Pourquoi : La gestion du thème est critique pour l'UX. Ce store garantit que le choix de l'utilisateur
 * est mémorisé entre ses visites et que le basculement est parfaitement fluide et global à toute l'app.
 */

import { create } from 'zustand';
import { useEffect } from 'react';

// Définition des types stricts pour éviter les erreurs de manipulation
type ThemeMode = 'light' | 'dark';
type Language = 'fr' | 'en';

// Interface définissant la structure de notre store global
interface AppState {
  theme: ThemeMode;
  isDark: boolean; // Sucre syntaxique pour faciliter les conditions dans les composants
  language: Language;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
}

/**
 * Utilitaire pour déduire le booléen `isDark` à partir du thème.
 */
const resolveIsDark = (theme: ThemeMode): boolean => {
  return theme === 'dark';
};

/**
 * Applique concrètement le thème sur la balise <html> du DOM.
 * @param isDark - Si true, ajoute la classe "dark" à <html> (déclenchant Tailwind dark:).
 */
const applyThemeToDOM = (isDark: boolean): void => {
  if (typeof document === 'undefined') return; // Protection SSR (Next.js)
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

/**
 * Création du Store Zustand.
 * C'est le cœur du système. Les variables définies ici sont accessibles de partout.
 */
export const useThemeStore = create<AppState>((set) => {
  // Récupération sécurisée du thème depuis le localStorage (protection SSR)
  // On force le thème 'dark' par défaut pour coller à l'esthétique "Void & Or"
  const savedTheme = typeof window !== 'undefined'
    ? (localStorage.getItem('theme') as ThemeMode) || 'dark'
    : 'dark';
    
  const savedLanguage = typeof window !== 'undefined'
    ? (localStorage.getItem('language') as Language) || 'fr'
    : 'fr';

  const isDark = resolveIsDark(savedTheme);

  return {
    theme: savedTheme,
    isDark,
    language: savedLanguage,
    
    // Fonction appelée par les composants pour changer le thème
    setTheme: (theme: ThemeMode) => {
      const newIsDark = resolveIsDark(theme);
      localStorage.setItem('theme', theme); // Sauvegarde persistante
      applyThemeToDOM(newIsDark); // Mise à jour visuelle instantanée
      set({ theme, isDark: newIsDark }); // Mise à jour de l'état React
    },
    
    // Fonction appelée par les composants pour changer la langue stockée (hors i18n router)
    setLanguage: (language: Language) => {
      localStorage.setItem('language', language);
      set({ language });
    }
  };
});

/**
 * Hook d'initialisation du thème.
 * @description Doit être appelé UNE SEULE FOIS dans le layout racine pour s'assurer 
 * que le DOM est synchronisé avec le localStorage au montage de l'application.
 */
export function useThemeInit(): void {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Appliqué uniquement côté client lors du montage
    applyThemeToDOM(resolveIsDark(theme));
  }, [theme]);
}

/**
 * @function useTheme
 * Hook de commodité offrant une API propre aux composants pour lire/écrire le thème.
 * @returns { theme, isDark, setTheme }
 */
export function useTheme() {
  const { theme, isDark, setTheme } = useThemeStore();
  return { theme, isDark, setTheme };
}

/**
 * @function useLanguage
 * Hook de commodité pour lire/écrire la préférence de langue locale.
 */
export function useLanguage() {
  const { language, setLanguage } = useThemeStore();
  return { language, setLanguage };
}