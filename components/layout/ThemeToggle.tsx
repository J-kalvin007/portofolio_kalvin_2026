// 'use client';

// /**
//  * @file ThemeToggle.tsx
//  * @description Bouton d'interface permettant à l'utilisateur de basculer manuellement entre le mode clair et sombre.
//  * 
//  * @architecture
//  * - Se connecte au store global Zustand via `useTheme()` pour récupérer et modifier l'état instantanément.
//  * - Utilise `framer-motion` et `AnimatePresence` pour créer une animation de rotation/fondu élégante
//  *   lorsque l'icône change (Soleil <-> Lune).
//  * 
//  * Pourquoi : Offre un contrôle total à l'utilisateur sur l'esthétique du site. Le design "Void & Or" 
//  * repose beaucoup sur le mode sombre, mais l'accessibilité exige qu'un mode clair soit disponible.
//  */

// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Sun, Moon } from 'lucide-react';
// import { useTheme } from '@/lib/useTheme';

// // Les différents modes de thème disponibles dans le cycle du bouton
// const THEME_CYCLE = ['light', 'dark'] as const;

// // Mapping (Dictionnaire) liant un mode à son icône Lucide correspondante
// const ICONS = {
//   light: Sun,
//   dark: Moon,
// } as const;

// export default function ThemeToggle({ className = '' }: { className?: string }) {
//   // Extraction de l'état actuel et de la fonction de mutation depuis Zustand
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   /**
//    * @function cycleTheme
//    * @description Calcule mathématiquement le prochain thème dans le tableau `THEME_CYCLE`.
//    * Permet de faire boucler la sélection indéfiniment.
//    */
//   const cycleTheme = () => {
//     const currentIndex = THEME_CYCLE.indexOf(theme as typeof THEME_CYCLE[number]);
//     const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
//     setTheme(THEME_CYCLE[nextIndex]);
//   };

//   // Résolution dynamique de l'icône à afficher en fonction du thème actif (Fallback sur Lune par sécurité)
//   const Icon = ICONS[theme as keyof typeof ICONS] || Moon;

//   if (!mounted) {
//     return (
//       <button
//         className={`
//           cursor-pointer relative p-2.5 rounded-xl
//           bg-base-200/50 hover:bg-base-200
//           dark:bg-white/5 dark:hover:bg-white/10
//           border border-base-300/50 dark:border-white/10
//           text-base-content/60 hover:text-primary
//           transition-all duration-300
//           ${className}
//         `}
//       >
//         <div className="w-[18px] h-[18px]" />
//       </button>
//     );
//   }

//   return (
//     <motion.button
//       onClick={cycleTheme}
//       // Animations de micro-interactions "Void & Or"
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       // Styles Glassmorphism avec prise en charge avancée du mode sombre (dark:...)
//       className={`
//         cursor-pointer relative p-2.5 rounded-xl
//         bg-base-200/50 hover:bg-base-200
//         dark:bg-white/5 dark:hover:bg-white/10
//         border border-base-300/50 dark:border-white/10
//         text-base-content/60 hover:text-primary
//         transition-all duration-300
//         ${className}
//       `}
//       aria-label={`Theme: ${theme}. Click to change.`} // Accessibilité pour les lecteurs d'écran
//       title={`Thème: ${theme === 'light' ? 'Clair' : 'Sombre'}`} // Bulle d'aide au survol
//     >
//       {/* 
//         AnimatePresence mode="wait" : 
//         Attend que l'icône sortante disparaisse complètement avant d'afficher la nouvelle.
//         Cela empêche les icônes de se superposer disgracieusement pendant la transition.
//       */}
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={theme} // La clé force React à recréer le div lors du changement, déclenchant l'animation
//           initial={{ y: -12, opacity: 0, rotate: -90 }} // Départ d'en haut à gauche
//           animate={{ y: 0, opacity: 1, rotate: 0 }} // Position centrale parfaite
//           exit={{ y: 12, opacity: 0, rotate: 90 }} // Sortie vers le bas à droite
//           transition={{ duration: 0.2 }}
//         >
//           <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
//         </motion.div>
//       </AnimatePresence>
//     </motion.button>
//   );
// }











'use client';

/**
 * @file ThemeToggle.tsx
 * @description Bouton d'interface permettant à l'utilisateur de basculer manuellement entre le mode clair et sombre.
 * 
 * @architecture
 * - Se connecte au store global Zustand via `useTheme()` pour récupérer et modifier l'état instantanément.
 * - Utilise `framer-motion` et `AnimatePresence` pour créer une animation de rotation/fondu élégante
 *   lorsque l'icône change (Soleil <-> Lune).
 * 
 * Pourquoi : Offre un contrôle total à l'utilisateur sur l'esthétique du site. Le design "Void & Or" 
 * repose beaucoup sur le mode sombre, mais l'accessibilité exige qu'un mode clair soit disponible.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useTheme } from '@/lib/useTheme';

// Les différents modes de thème disponibles dans le cycle du bouton
const THEME_CYCLE = ['light', 'dark'] as const;

// Mapping (Dictionnaire) liant un mode à son icône Lucide correspondante
const ICONS = {
  light: Sun,
  dark: Moon,
} as const;

/**
 * Libellés bilingues.
 * `aria-label` annonçait « Theme: dark. Click to change. » à un visiteur
 * francophone, et l'infobulle était francophone pour un visiteur anglophone :
 * les deux étaient figés, chacun dans une langue différente.
 * Un libellé de bascule doit décrire **l'action à venir**, pas l'état courant —
 * « Passer en mode clair » est actionnable, « Thème : sombre » ne l'est pas.
 */
const TOGGLE_LABELS = {
  fr: { toLight: 'Passer en mode clair', toDark: 'Passer en mode sombre' },
  en: { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
} as const;

export default function ThemeToggle({ className = '' }: { className?: string }) {
  // Extraction de l'état actuel et de la fonction de mutation depuis Zustand
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * @function cycleTheme
   * @description Calcule mathématiquement le prochain thème dans le tableau `THEME_CYCLE`.
   * Permet de faire boucler la sélection indéfiniment.
   */
  const cycleTheme = () => {
    const currentIndex = THEME_CYCLE.indexOf(theme as typeof THEME_CYCLE[number]);
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex]);
  };

  // Résolution dynamique de l'icône à afficher en fonction du thème actif (Fallback sur Lune par sécurité)
  const Icon = ICONS[theme as keyof typeof ICONS] || Moon;

  const labels = TOGGLE_LABELS[locale === 'en' ? 'en' : 'fr'];
  const actionLabel = theme === 'dark' ? labels.toLight : labels.toDark;

  /** Habillage partagé par le repli d'hydratation et le bouton réel. */
  const shellClasses = `
    cursor-pointer relative p-2.5 rounded-xl
    bg-base-200/50 hover:bg-base-200
    dark:bg-white/5 dark:hover:bg-white/10
    border border-base-300/50 dark:border-white/10
    text-base-content/60 hover:text-primary
    transition-colors duration-300
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
    ${className}
  `;

  if (!mounted) {
    return (
      // Repli d'hydratation : `disabled` et `aria-hidden` l'écartent du parcours
      // clavier. Il était auparavant focalisable et annoncé comme un bouton
      // sans nom, qui ne réagissait à aucun clic.
      <button
        type="button"
        disabled
        aria-hidden="true"
        tabIndex={-1}
        className={`${shellClasses} cursor-default`}
      >
        <div className="w-[18px] h-[18px]" />
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={cycleTheme}
      // Animations de micro-interactions "Void & Or"
      whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
      // Styles Glassmorphism avec prise en charge avancée du mode sombre (dark:...)
      className={shellClasses}
      aria-label={actionLabel} // Accessibilité pour les lecteurs d'écran
      title={actionLabel} // Bulle d'aide au survol
    >
      {/* 
        AnimatePresence mode="wait" : 
        Attend que l'icône sortante disparaisse complètement avant d'afficher la nouvelle.
        Cela empêche les icônes de se superposer disgracieusement pendant la transition.
      */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme} // La clé force React à recréer le nœud lors du changement, déclenchant l'animation
          initial={{ y: -12, opacity: 0, rotate: -90 }} // Départ d'en haut à gauche
          animate={{ y: 0, opacity: 1, rotate: 0 }} // Position centrale parfaite
          exit={{ y: 12, opacity: 0, rotate: 90 }} // Sortie vers le bas à droite
          transition={{ duration: 0.2 }}
          className="block"
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={2} aria-hidden="true" />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}