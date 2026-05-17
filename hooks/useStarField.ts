'use client';

/**
 * @file useStarField.ts
 * @description Hook de génération du champ stellaire pour le fond spatial.
 * Crée un tableau d'étoiles réparties sur 3 couches de profondeur (parallax).
 * 
 * @hydration-fix: Génération repoussée au client (`useEffect`) pour éviter les erreurs
 * de mismatch SSR/Client causées par `Math.random()`.
 */

import { useState, useEffect } from 'react';
import type { Star } from '@/types/project.types';

interface UseStarFieldOptions {
  /** Nombre total d'étoiles à générer — défaut : 350 (optimisé pour l'animation) */
  count?: number;
}

export function useStarField({ count = 350 }: UseStarFieldOptions = {}): Star[] {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars: Star[] = [];
    const sizeByLayer: Record<number, number> = { 1: 1, 2: 1.5, 3: 2.5 };
    const speedByLayer: Record<number, number> = { 1: 80, 2: 50, 3: 30 };

    for (let i = 0; i < count; i++) {
      const layer = ((i % 3) + 1) as 1 | 2 | 3;

      generatedStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: sizeByLayer[layer] * (0.5 + Math.random() * 0.8),
        opacity: 0.15 + Math.random() * 0.85,
        duration: speedByLayer[layer] + Math.random() * 40,
        delay: Math.random() * -60,
        layer,
        moveX: [0, Math.random() * 200 - 100, Math.random() * 200 - 100, 0],
        moveY: [0, Math.random() * 200 - 100, Math.random() * 200 - 100, 0],
      });
    }

    setStars(generatedStars);
  }, [count]);

  return stars;
}
