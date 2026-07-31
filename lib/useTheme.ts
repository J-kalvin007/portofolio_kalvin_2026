// 'use client';

// /**
//  * @file useTheme.ts
//  * @description Store global pour la gestion du thème (Clair/Sombre) et de la langue via Zustand.
//  * 
//  * @architecture
//  * - Utilise `zustand` pour créer un état global ultra-performant sans avoir besoin du Context API de React (évite les re-renders inutiles).
//  * - Implémente une synchronisation persistante avec le `localStorage` du navigateur.
//  * - Modifie directement l'arbre DOM (`document.documentElement.classList`) pour appliquer le mode sombre instantanément.
//  * 
//  * Pourquoi : La gestion du thème est critique pour l'UX. Ce store garantit que le choix de l'utilisateur
//  * est mémorisé entre ses visites et que le basculement est parfaitement fluide et global à toute l'app.
//  */

// import { create } from 'zustand';
// import { useEffect } from 'react';

// // Définition des types stricts pour éviter les erreurs de manipulation
// type ThemeMode = 'light' | 'dark';
// type Language = 'fr' | 'en';

// // Interface définissant la structure de notre store global
// interface AppState {
//   theme: ThemeMode;
//   isDark: boolean; // Sucre syntaxique pour faciliter les conditions dans les composants
//   language: Language;
//   setTheme: (theme: ThemeMode) => void;
//   setLanguage: (lang: Language) => void;
// }

// /**
//  * Utilitaire pour déduire le booléen `isDark` à partir du thème.
//  */
// const resolveIsDark = (theme: ThemeMode): boolean => {
//   return theme === 'dark';
// };

// /**
//  * Applique concrètement le thème sur la balise <html> du DOM.
//  * @param isDark - Si true, ajoute la classe "dark" à <html> (déclenchant Tailwind dark:).
//  */
// const applyThemeToDOM = (isDark: boolean): void => {
//   if (typeof document === 'undefined') return; // Protection SSR (Next.js)
//   const root = document.documentElement;
//   if (isDark) {
//     root.classList.add('dark');
//   } else {
//     root.classList.remove('dark');
//   }
// };

// /**
//  * Création du Store Zustand.
//  * C'est le cœur du système. Les variables définies ici sont accessibles de partout.
//  */
// export const useThemeStore = create<AppState>((set) => {
//   // Récupération sécurisée du thème depuis le localStorage (protection SSR)
//   // On force le thème 'dark' par défaut pour coller à l'esthétique "Void & Or"
//   const savedTheme = typeof window !== 'undefined'
//     ? (localStorage.getItem('theme') as ThemeMode) || 'dark'
//     : 'dark';

//   const savedLanguage = typeof window !== 'undefined'
//     ? (localStorage.getItem('language') as Language) || 'fr'
//     : 'fr';

//   const isDark = resolveIsDark(savedTheme);

//   return {
//     theme: savedTheme,
//     isDark,
//     language: savedLanguage,

//     // Fonction appelée par les composants pour changer le thème
//     setTheme: (theme: ThemeMode) => {
//       const newIsDark = resolveIsDark(theme);
//       localStorage.setItem('theme', theme); // Sauvegarde persistante
//       applyThemeToDOM(newIsDark); // Mise à jour visuelle instantanée
//       set({ theme, isDark: newIsDark }); // Mise à jour de l'état React
//     },

//     // Fonction appelée par les composants pour changer la langue stockée (hors i18n router)
//     setLanguage: (language: Language) => {
//       localStorage.setItem('language', language);
//       set({ language });
//     }
//   };
// });

// /**
//  * Hook d'initialisation du thème.
//  * @description Doit être appelé UNE SEULE FOIS dans le layout racine pour s'assurer 
//  * que le DOM est synchronisé avec le localStorage au montage de l'application.
//  */
// export function useThemeInit(): void {
//   const { theme } = useThemeStore();

//   useEffect(() => {
//     // Appliqué uniquement côté client lors du montage
//     applyThemeToDOM(resolveIsDark(theme));
//   }, [theme]);
// }

// /**
//  * @function useTheme
//  * Hook de commodité offrant une API propre aux composants pour lire/écrire le thème.
//  * @returns { theme, isDark, setTheme }
//  */
// export function useTheme() {
//   const { theme, isDark, setTheme } = useThemeStore();
//   return { theme, isDark, setTheme };
// }

// /**
//  * @function useLanguage
//  * Hook de commodité pour lire/écrire la préférence de langue locale.
//  */
// export function useLanguage() {
//   const { language, setLanguage } = useThemeStore();
//   return { language, setLanguage };
// }











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
 * Valeurs initiales, identiques sur le serveur et sur le client.
 *
 * ⚠️ **Correctif d'hydratation.** Le store lisait auparavant `localStorage` au
 * moment de sa création, c'est-à-dire à l'évaluation du module. L'état initial
 * différait donc entre le rendu serveur (repli) et le rendu client (valeur
 * stockée). Tout composant s'appuyant sur `theme` pour choisir ses classes — le
 * `Badge`, par exemple — produisait un balisage différent de part et d'autre et
 * déclenchait un écart d'hydratation.
 *
 * L'état de départ est désormais constant ; la préférence réelle est lue dans
 * `useThemeInit`, côté client uniquement.
 */
const INITIAL_THEME: ThemeMode = 'dark';
const INITIAL_LANGUAGE: Language = 'fr';

/**
 * Utilitaire pour déduire le booléen `isDark` à partir du thème.
 */
const resolveIsDark = (theme: ThemeMode): boolean => {
  return theme === 'dark';
};

/**
 * Lit la préférence réellement en vigueur, avec la **même logique que le script
 * anti-FOUC** injecté dans le `<head>` par `app/[locale]/layout.tsx`.
 *
 * ⚠️ **Correctif visible.** L'ancienne version repliait sur `'dark'` en dur quand
 * `localStorage` était vide. Or le script, lui, résout `'system'` via
 * `matchMedia`. Conséquence pour un premier visiteur dont le système est en mode
 * clair : le script appliquait correctement le thème clair avant le premier
 * rendu, puis `useThemeInit` réappliquait `'dark'` juste après l'hydratation.
 * **Le site basculait en sombre sous les yeux de l'utilisateur, contre sa
 * préférence système.** Les deux logiques sont maintenant alignées.
 */
const readPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return INITIAL_THEME;

  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage indisponible (navigation privée stricte) : on suit le système. */
  }

  // Ni 'light' ni 'dark' en mémoire — y compris la valeur 'system' que le script
  // utilise par défaut : on interroge le système d'exploitation.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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

  // Le script anti-FOUC pose également ces deux attributs ; ne pas les mettre à
  // jour ici les laissait périmés dès le premier basculement manuel. `data-theme`
  // sert aux sélecteurs de thème, et `color-scheme` aux éléments rendus par le
  // système : barres de défilement, champs natifs, sélecteurs de date.
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.style.colorScheme = isDark ? 'dark' : 'light';
};

/**
 * Création du Store Zustand.
 * C'est le cœur du système. Les variables définies ici sont accessibles de partout.
 */
export const useThemeStore = create<AppState>((set) => ({
  theme: INITIAL_THEME,
  isDark: resolveIsDark(INITIAL_THEME),
  language: INITIAL_LANGUAGE,

  // Fonction appelée par les composants pour changer le thème
  setTheme: (theme: ThemeMode) => {
    const newIsDark = resolveIsDark(theme);

    try {
      localStorage.setItem('theme', theme); // Sauvegarde persistante
    } catch {
      /* Écriture impossible : le thème reste appliqué pour la session en cours. */
    }

    applyThemeToDOM(newIsDark); // Mise à jour visuelle instantanée
    set({ theme, isDark: newIsDark }); // Mise à jour de l'état React
  },

  // Fonction appelée par les composants pour changer la langue stockée (hors i18n router)
  setLanguage: (language: Language) => {
    try {
      localStorage.setItem('language', language);
    } catch {
      /* Écriture impossible : la préférence reste en mémoire. */
    }

    set({ language });
  },
}));

/**
 * Hook d'initialisation du thème.
 * @description Doit être appelé UNE SEULE FOIS dans le layout racine pour s'assurer 
 * que le DOM est synchronisé avec le localStorage au montage de l'application.
 *
 * @remarks C'est ici, et non à la création du store, que la préférence est lue.
 * Le hook se contente d'**aligner l'état React sur ce que le script anti-FOUC a
 * déjà appliqué au document** — il ne repeint rien si les deux concordent.
 */
export function useThemeInit(): void {
  useEffect(() => {
    const preferred = readPreferredTheme();
    const { theme, setTheme } = useThemeStore.getState();

    // Le script a déjà posé la bonne classe : on se contente de synchroniser
    // l'état, sans réécrire le DOM ni le localStorage.
    if (preferred === theme) {
      applyThemeToDOM(resolveIsDark(theme));
      return;
    }

    setTheme(preferred);
  }, []);

  /**
   * Suit les changements de préférence système tant que l'utilisateur n'a pas
   * fait de choix explicite. Sans cela, basculer son OS en mode sombre ne
   * produisait aucun effet avant un rechargement complet.
   */
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      let hasExplicitChoice = false;
      try {
        const stored = localStorage.getItem('theme');
        hasExplicitChoice = stored === 'light' || stored === 'dark';
      } catch {
        /* Illisible : on considère qu'aucun choix explicite n'a été fait. */
      }

      if (hasExplicitChoice) return;

      const nextIsDark = event.matches;
      applyThemeToDOM(nextIsDark);
      useThemeStore.setState({ theme: nextIsDark ? 'dark' : 'light', isDark: nextIsDark });
    };

    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);
}

/**
 * @function useTheme
 * Hook de commodité offrant une API propre aux composants pour lire/écrire le thème.
 * @returns { theme, isDark, setTheme }
 *
 * @remarks Les sélecteurs sont individuels : abonner le composant à l'objet
 * entier le faisait re-rendre à chaque changement de `language`, sans rapport
 * avec le thème.
 */
export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const isDark = useThemeStore((state) => state.isDark);
  const setTheme = useThemeStore((state) => state.setTheme);

  return { theme, isDark, setTheme };
}

/**
 * @function useLanguage
 * Hook de commodité pour lire/écrire la préférence de langue locale.
 *
 * @remarks Cette préférence fait doublon avec la locale de `next-intl`, qui est
 * la seule source de vérité pour l'affichage (elle vient de l'URL). Si aucun
 * appelant n'en dépend, `language` et `setLanguage` peuvent être retirés du store.
 */
export function useLanguage() {
  const language = useThemeStore((state) => state.language);
  const setLanguage = useThemeStore((state) => state.setLanguage);

  return { language, setLanguage };
}