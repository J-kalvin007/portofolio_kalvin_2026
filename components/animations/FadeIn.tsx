'use client';

/**
 * @file FadeIn.tsx
 * @description Composant utilitaire d'animation au défilement (Scroll Reveal).
 * 
 * @architecture
 * - Encapsule `framer-motion` (`motion.div` et `useInView`).
 * - Se déclenche uniquement lorsque l'élément entre dans le champ de vision (viewport).
 * - Offre plusieurs directions d'apparition ('up', 'down', 'left', 'right') configurables via des décalages vectoriels (OFFSETS).
 * 
 * Pourquoi : Évite de surcharger les composants avec du code d'animation complexe.
 * Ce composant réutilisable standardise les apparitions douces "Glassmorphism / Luxe" dans toute l'app.
 */

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

// Interface définissant les propriétés (Props) strictes attendues par le composant
interface FadeInProps {
  children: ReactNode; // Le contenu à animer
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'; // Le sens d'origine du mouvement
  delay?: number; // Retard avant le début de l'animation (pratique pour des listes)
  duration?: number; // Durée de la transition
  className?: string; // Classes CSS optionnelles
  once?: boolean; // Si true, l'animation ne se joue qu'une fois (recommandé pour les performances)
}

// Dictionnaire des décalages d'origine pour l'animation (ex: "up" signifie que l'élément part d'en bas y:40)
const OFFSETS = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { y: 0, x: 40 },
  right: { y: 0, x: -40 },
  none: { y: 0, x: 0 },
};

export default function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className = '',
  once = true,
}: FadeInProps) {
  // Référence DOM pour permettre au hook useInView d'observer cet élément précis
  const ref = useRef<HTMLDivElement>(null);
  
  // `useInView` retourne un booléen (true/false) si l'élément croise l'écran.
  // margin: '-80px' signifie que l'animation se déclenchera 80px APRÈS son entrée dans l'écran (rendu plus naturel).
  const isInView = useInView(ref, { once, margin: '-80px' });
  const offset = OFFSETS[direction];

  return (
    <motion.div
      ref={ref}
      // État initial (Invisible et décalé)
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      // État animé (Si en vue, ramène opacity à 1 et coordonnées à 0)
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
      // Courbe de Bézier [0.21, 0.47, 0.32, 0.98] customisée pour un effet "Luxury Ease Out" 
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
