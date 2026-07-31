// 'use client';

// import React from 'react';
// import { useTheme } from '@/lib/useTheme';
// import { motion } from 'framer-motion';

// interface BadgeProps {
//   status: 'success' | 'error' | 'warning' | 'info' | 'default';
//   text: string;
//   icon?: React.ReactNode;
//   pulse?: boolean;
// }

// const Badge: React.FC<BadgeProps> = ({ status, text, icon, pulse = false }) => {
//   const { theme } = useTheme();
//   const isDark = theme === 'dark';

//   const statusConfig = {
//     success: {
//       bg: isDark ? 'bg-[#23BE31]/10' : 'bg-green-50',
//       text: isDark ? 'text-[#23BE31]' : 'text-green-700',
//       border: isDark ? 'border-[#23BE31]/20' : 'border-green-200',
//       dot: 'bg-[#23BE31]'
//     },
//     error: {
//       bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
//       text: isDark ? 'text-red-400' : 'text-red-700',
//       border: isDark ? 'border-red-500/20' : 'border-red-200',
//       dot: 'bg-red-500'
//     },
//     warning: {
//       bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
//       text: isDark ? 'text-amber-400' : 'text-amber-700',
//       border: isDark ? 'border-amber-500/20' : 'border-amber-200',
//       dot: 'bg-amber-500'
//     },
//     info: {
//       bg: isDark ? 'bg-primary/10' : 'bg-primary/5',
//       text: isDark ? 'text-primary' : 'text-primary',
//       border: isDark ? 'border-primary/20' : 'border-primary/20',
//       dot: 'bg-primary'
//     },
//     default: {
//       bg: isDark ? 'bg-gray-500/10' : 'bg-gray-100',
//       text: isDark ? 'text-gray-400' : 'text-gray-700',
//       border: isDark ? 'border-gray-500/20' : 'border-gray-200',
//       dot: 'bg-gray-500'
//     }
//   };

//   const config = statusConfig[status] || statusConfig.default;

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className={`
//         inline-flex items-center gap-1.5 px-3 py-1 
//         rounded-full text-xs font-semibold
//         border backdrop-blur-sm
//         ${config.bg} ${config.text} ${config.border}
//       `}
//     >
//       {pulse ? (
//         <span className="relative flex h-2 w-2">
//           <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}></span>
//           <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
//         </span>
//       ) : icon ? (
//         <span className="w-3 h-3">{icon}</span>
//       ) : (
//         <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
//       )}
//       <span>{text}</span>
//     </motion.div>
//   );
// };

// export default Badge;








'use client';

/**
 * @file Badge.tsx
 * @description Pastille d'état du design system « Void & Or ».
 *
 * @remarks **Correctif d'hydratation.** Le composant lisait le thème dans le
 * store Zustand (`useTheme()`) pour choisir entre deux jeux de classes. Or ce
 * store initialisait son état depuis `localStorage` à l'évaluation du module :
 * le serveur rendait donc les classes du thème sombre pendant que le client
 * rendait celles du thème réellement stocké. Écart d'hydratation garanti pour
 * tout visiteur en mode clair, avec le clignotement qui l'accompagne.
 *
 * Les variantes `dark:` de Tailwind règlent la question sans une ligne de
 * JavaScript : elles dépendent de la classe `.dark` posée sur `<html>` par le
 * script bloquant, **avant le premier rendu**. Plus de lecture d'état, plus de
 * re-rendu au changement de thème, plus d'écart possible.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'default';
  text: string;
  icon?: React.ReactNode;
  pulse?: boolean;
  /** Classes additionnelles — fusionnées par `twMerge`, comme sur `Button`. */
  className?: string;
}

/**
 * Palette par état.
 * Chaque entrée décrit le mode clair, puis sa variante sombre en préfixe `dark:`.
 * Le vert `#23BE31` d'origine est remplacé par `emerald`, aligné sur les autres
 * couleurs sémantiques de l'application et sur les notifications de la page Contact.
 */
const statusConfig = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-500/20',
    dot: 'bg-red-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-500/20',
    dot: 'bg-amber-500',
  },
  info: {
    bg: 'bg-primary/5 dark:bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    dot: 'bg-primary',
  },
  default: {
    bg: 'bg-base-200 dark:bg-white/[0.06]',
    text: 'text-base-content/70 dark:text-base-content/60',
    border: 'border-base-content/10 dark:border-white/10',
    dot: 'bg-base-content/40',
  },
} as const;

const Badge: React.FC<BadgeProps> = ({ status, text, icon, pulse = false, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  const config = statusConfig[status] ?? statusConfig.default;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1',
        'rounded-full text-xs font-semibold tracking-[0.01em]',
        'border backdrop-blur-sm',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {pulse ? (
        <span aria-hidden="true" className="relative flex h-2 w-2 shrink-0">
          <span className={cn('animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full opacity-75', config.dot)} />
          <span className={cn('relative inline-flex rounded-full h-2 w-2', config.dot)} />
        </span>
      ) : icon ? (
        // `shrink-0` et le centrage manquaient : une icône plus large que 12 px
        // écrasait le texte au lieu d'être contrainte.
        <span aria-hidden="true" className="w-3 h-3 shrink-0 inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
          {icon}
        </span>
      ) : (
        <span aria-hidden="true" className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      )}
      <span>{text}</span>
    </motion.div>
  );
};

export default Badge;