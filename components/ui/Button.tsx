// 'use client';

// import React from 'react';
// import { LucideIcon, Loader2 } from 'lucide-react';
// import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';

// type ButtonOwnProps = {
//   variant?: 'default' | 'outline' | 'ghost' | 'glass' | 'danger' | 'link';
//   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
//   isLoading?: boolean;
//   fullWidth?: boolean;
//   icon?: LucideIcon;
//   iconPosition?: 'left' | 'right';
//   pulse?: boolean;
//   rounded?: 'default' | 'full' | 'xl';
// };

// export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> &
//   ButtonOwnProps & {
//     children?: React.ReactNode;
//   };

// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
//   children,
//   variant = 'default',
//   size = 'md',
//   isLoading = false,
//   fullWidth = false,
//   icon: Icon,
//   iconPosition = 'left',
//   pulse = false,
//   rounded = 'default',
//   className = '',
//   disabled,
//   ...props
// }, ref) => {
//   const baseStyles = `
//     inline-flex items-center justify-center
//     font-semibold
//     relative overflow-hidden
//     disabled:opacity-50 disabled:cursor-not-allowed
//     outline-none
//   `;

//   const sizeClasses = {
//     xs: 'h-8 px-3 text-xs gap-1.5',
//     sm: 'h-10 px-4 text-sm gap-2',
//     md: 'h-12 px-6 text-base gap-2.5',
//     lg: 'h-14 px-8 text-lg gap-3',
//     xl: 'h-16 px-10 text-xl gap-3.5',
//     icon: 'h-10 w-10 p-2',
//   };

//   const roundedClasses = {
//     default: 'rounded-xl',
//     full: 'rounded-full',
//     xl: 'rounded-2xl',
//   };

//   const variantClasses = {
//     default: `
//       bg-primary
//       text-primary-content
//       shadow-lg shadow-primary/20
//       hover:bg-primary/90
//       border border-transparent
//     `,
//     outline: `
//       bg-transparent
//       border-2 border-primary
//       text-primary
//       hover:bg-primary/10
//     `,
//     ghost: `
//       bg-transparent
//       text-base-content/60
//       hover:text-base-content
//       hover:bg-base-200
//     `,
//     glass: `
//       bg-base-100/10 dark:bg-white/[0.03]
//       backdrop-blur-md
//       border border-base-content/10 dark:border-white/10
//       text-base-content
//       hover:bg-base-100/20 dark:hover:bg-white/[0.05]
//       shadow-xl shadow-base-content/5
//     `,
//     danger: `
//       bg-red-600
//       text-white
//       shadow-lg shadow-red-600/20
//       hover:bg-red-700
//     `,
//     link: `
//       bg-transparent
//       text-primary
//       underline-offset-4
//       hover:underline
//       shadow-none
//       border-none
//     `
//   };

//   return (
//     <motion.button
//       ref={ref}
//       whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
//       whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
//       className={`
//         ${baseStyles}
//         ${sizeClasses[size]}
//         ${roundedClasses[rounded]}
//         ${variantClasses[variant]}
//         ${fullWidth ? 'w-full' : ''}
//         ${className}
//       `}
//       disabled={disabled || isLoading}
//       {...props}
//     >
//       {/* Glow Effect for Primary Variant */}
//       {variant === 'default' && !disabled && (
//         <motion.div
//           className="absolute inset-0 bg-white/10"
//           initial={{ x: '-100%', skewX: -15 }}
//           whileHover={{ x: '200%' }}
//           transition={{ duration: 0.7, ease: "easeInOut" }}
//         />
//       )}

//       {/* Content */}
//       <span className="relative z-10 flex items-center justify-center">
//         <AnimatePresence mode="wait">
//           {isLoading ? (
//             <motion.div
//               key="loading"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               className="flex items-center gap-2"
//             >
//               <Loader2 className="w-4 h-4 animate-spin" />
//               <span>Chargement...</span>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="content"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               className="flex items-center gap-2"
//             >
//               {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
//               {children}
//               {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </span>

//       {/* Pulse Effect */}
//       {pulse && (
//         <span className="absolute right-0 top-0 -mr-1 -mt-1 flex h-3 w-3">
//           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//           <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
//         </span>
//       )}
//     </motion.button>
//   );
// });

// Button.displayName = 'Button';

// export default Button;







'use client';

/**
 * @file Button.tsx
 * @description Primitive de bouton du design system « Void & Or ».
 *
 * @remarks **Correctif d'accessibilité prioritaire.** Les styles de base
 * contenaient `outline-none` **sans anneau de remplacement**. Ce composant étant
 * la primitive sur laquelle reposent tous les boutons de l'application, chaque
 * bouton construit à partir d'elle était invisible à la navigation clavier :
 * on tabulait dessus sans qu'aucun signal n'apparaisse. Manquement au critère
 * WCAG 2.4.7, propagé à l'échelle du projet.
 */

import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Libellé de chargement, bilingue.
 * « Chargement… » était codé en dur dans une application traduite : un visiteur
 * anglophone voyait le mot français apparaître au moment le plus critique de son
 * parcours, la soumission d'un formulaire.
 */
const LOADING_LABELS = { fr: 'Chargement…', en: 'Loading…' } as const;

type ButtonOwnProps = {
  variant?: 'default' | 'outline' | 'ghost' | 'glass' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  pulse?: boolean;
  rounded?: 'default' | 'full' | 'xl';
};

export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> &
  ButtonOwnProps & {
    children?: React.ReactNode;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'default',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  pulse = false,
  rounded = 'default',
  className = '',
  disabled,
  ...props
}, ref) => {
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();

  const loadingLabel = LOADING_LABELS[locale === 'en' ? 'en' : 'fr'];
  const isInactive = disabled || isLoading;

  const baseStyles = `
    inline-flex items-center justify-center
    font-semibold
    relative overflow-hidden
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-[filter,background-color,border-color,color] duration-300
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-primary
    focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
  `;

  const sizeClasses = {
    xs: 'h-8 px-3 text-xs gap-1.5',
    sm: 'h-10 px-4 text-sm gap-2',
    md: 'h-12 px-6 text-base gap-2.5',
    lg: 'h-14 px-8 text-lg gap-3',
    xl: 'h-16 px-10 text-xl gap-3.5',
    icon: 'h-10 w-10 p-2',
  };

  const roundedClasses = {
    default: 'rounded-xl',
    full: 'rounded-full',
    xl: 'rounded-2xl',
  };

  const variantClasses = {
    // Ombre de contact plutôt que halo coloré : le bouton est posé, il ne rayonne pas.
    default: `
      bg-primary
      text-primary-content
      shadow-[0_1px_2px_rgba(0,0,0,0.14),0_12px_28px_-16px_rgba(0,0,0,0.6)]
      hover:brightness-[1.06]
      border border-transparent
    `,
    outline: `
      bg-transparent
      border border-primary
      text-primary
      hover:bg-primary/10
    `,
    ghost: `
      bg-transparent
      text-base-content/60
      hover:text-base-content
      hover:bg-base-200
    `,
    glass: `
      bg-base-100/10 dark:bg-white/[0.03]
      backdrop-blur-md
      border border-base-content/10 dark:border-white/10
      text-base-content
      hover:bg-base-100/20 dark:hover:bg-white/[0.05]
      shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_8px_24px_-16px_rgba(0,0,0,0.4)]
    `,
    danger: `
      bg-red-600
      text-white
      shadow-[0_1px_2px_rgba(0,0,0,0.14),0_12px_28px_-16px_rgba(127,29,29,0.7)]
      hover:bg-red-700
    `,
    link: `
      bg-transparent
      text-primary
      underline-offset-4
      hover:underline
      shadow-none
      border-none
    `
  };

  return (
    <motion.button
      ref={ref}
      whileHover={shouldReduceMotion || isInactive ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion || isInactive ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      /* `cn()` — qui existe déjà dans `lib/utils.ts` — n'était pas utilisé ici.
         Les classes étaient simplement concaténées : passer `className="rounded-full"`
         à un bouton en `rounded="default"` produisait `rounded-xl rounded-full`,
         et le gagnant dépendait de l'ordre du CSS compilé, pas de l'intention.
         `twMerge` tranche correctement le conflit. */
      className={cn(
        baseStyles,
        sizeClasses[size],
        roundedClasses[rounded],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      disabled={isInactive}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {/* Balayage lumineux — variante primaire uniquement.
          La transition est asymétrique : le reflet traverse le bouton à l'entrée
          du pointeur, puis se replace instantanément hors champ. Auparavant, il
          rejouait le trajet **à l'envers** au moment où la souris quittait le
          bouton, ce qui donnait un aller-retour parasite. */}
      {variant === 'default' && !isInactive && !shouldReduceMotion && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 bg-white/10 pointer-events-none"
          variants={{
            initial: { x: '-100%', skewX: -15, transition: { duration: 0 } },
            hover: { x: '200%', skewX: -15, transition: { duration: 0.7, ease: 'easeInOut' } },
          }}
          initial="initial"
          animate="initial"
          whileHover="hover"
        />
      )}

      {/* Content */}
      {/* Le contenu reste monté pendant le chargement, à opacité nulle : c'est lui
          qui continue de dicter la largeur du bouton. La version précédente le
          démontait (`AnimatePresence mode="wait"`), et le bouton s'effondrait
          à la largeur du seul indicateur avant de se rétablir — un saut de mise
          en page au moment précis où l'utilisateur vient de cliquer. */}
      <span className="relative z-10 inline-flex items-center justify-center">
        <span
          className={cn(
            'inline-flex items-center gap-2 transition-opacity duration-200',
            isLoading && 'opacity-0'
          )}
          aria-hidden={isLoading || undefined}
        >
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />}
        </span>

        <AnimatePresence>
          {isLoading && (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
              <span>{loadingLabel}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* Pulse Effect */}
      {pulse && (
        <span aria-hidden="true" className="absolute right-0 top-0 -mr-1 -mt-1 flex h-3 w-3">
          <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;