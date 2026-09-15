'use client';

/**
 * @file useStarField.ts
 * @description Hook de génération du champ stellaire pour le fond spatial.
 * Crée un tableau d'étoiles réparties sur 3 couches de profondeur (parallax).
 *
 * @remarks **Pourquoi un générateur pseudo-aléatoire à graine.**
 * `Math.random()` produit des valeurs différentes au rendu serveur et au rendu
 * client : l'ancienne version reportait donc la génération dans un `useEffect`,
 * ce qui imposait un premier rendu sans étoiles puis un second rendu complet
 * (règle ESLint `react-hooks/set-state-in-effect`).
 *
 * Avec une graine fixe, la séquence est identique partout : les étoiles sont
 * calculées une seule fois, dès le premier rendu, sans écart d'hydratation.
 * Le ciel reste « aléatoire » à l'œil — il est simplement le même à chaque visite.
 */

import { useMemo } from 'react';
import type { Star } from '@/types/project.types';

interface UseStarFieldOptions {
  /** Nombre total d'étoiles à générer — défaut : 350 (optimisé pour l'animation) */
  count?: number;
  /** Graine du générateur : changer la valeur donne un autre ciel, toujours stable. */
  seed?: number;
}

/**
 * Mulberry32 : générateur 32 bits minimal, rapide et bien distribué —
 * largement suffisant pour positionner des étoiles (pas pour de la cryptographie).
 */
function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SIZE_BY_LAYER: Record<Star['layer'], number> = { 1: 1, 2: 1.5, 3: 2.5 };
const SPEED_BY_LAYER: Record<Star['layer'], number> = { 1: 80, 2: 50, 3: 30 };

export function generateStars(count: number, seed: number): Star[] {
  const random = createSeededRandom(seed);

  return Array.from({ length: count }, (_, i) => {
    const layer = ((i % 3) + 1) as Star['layer'];

    return {
      id: i,
      x: random() * 100,
      y: random() * 100,
      size: SIZE_BY_LAYER[layer] * (0.5 + random() * 0.8),
      opacity: 0.15 + random() * 0.85,
      duration: SPEED_BY_LAYER[layer] + random() * 40,
      delay: random() * -60,
      layer,
      moveX: [0, random() * 200 - 100, random() * 200 - 100, 0],
      moveY: [0, random() * 200 - 100, random() * 200 - 100, 0],
    };
  });
}

export function useStarField({ count = 350, seed = 20260915 }: UseStarFieldOptions = {}): Star[] {
  return useMemo(() => generateStars(count, seed), [count, seed]);
}
