'use client';

/**
 * @file StaggerChildren.tsx
 * @description Conteneur intelligent orchestrant des animations en cascade (Stagger Effect).
 * 
 * @architecture
 * - Utilise la puissance des "Variants" de Framer Motion.
 * - Le composant parent (`StaggerChildren`) contrôle l'état (caché/visible) et dicte
 *   aux enfants (`StaggerItem`) à quel moment s'animer (via `staggerChildren`).
 * 
 * Pourquoi : Indispensable pour l'affichage de grilles (ex: liste de compétences, cartes projets).
 * Évite de devoir calculer manuellement un `delay` pour chaque élément d'une liste.
 */

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface StaggerChildrenProps {
  children: ReactNode; // Les enfants (qui doivent être enveloppés dans des <StaggerItem>)
  staggerDelay?: number; // Le délai entre l'apparition de chaque enfant (0.1s par défaut)
  className?: string;
  once?: boolean;
}

/**
 * Variantes d'animation du conteneur parent.
 * C'est ici qu'on définit la règle de délai en cascade (`staggerChildren`).
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay, // Délai entre chaque enfant
      delayChildren: 0.1, // Délai avant le début du premier enfant
    },
  }),
};

/**
 * Variantes d'animation des éléments enfants.
 * Ils n'ont pas besoin de `initial` et `animate`, ils héritent des états
 * "hidden" et "visible" invoqués par le parent.
 */
export const staggerItemVariants = {
  hidden: { opacity: 0, y: 30 }, // Descendu et invisible
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98] as const, // Courbe "Premium"
    },
  },
};

export default function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className = '',
  once = true,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Observation du défilement. Déclenchement à 60px après l'entrée dans l'écran.
  const isInView = useInView(ref, { once, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      custom={staggerDelay} // Passe la variable dynamique à la variante `visible`
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * @component StaggerItem
 * @description Wrapper obligatoire pour tout élément direct d'un conteneur `StaggerChildren`.
 * Il connecte l'élément au système de variantes du parent.
 */
export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
