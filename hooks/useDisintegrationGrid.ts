'use client';

/**
 * @file useDisintegrationGrid.ts
 * @description Hook personnalisé orchestrant le cycle de désintégration/téléportation des cartes.
 * 
 * @animation_cycle (toutes les 10 secondes)
 * Phase 1 — Désintégration (0s → 1.2s)  : Cartes se fragmentent en cubes, du bas vers le haut
 * Phase 2 — Void (1.2s → 1.5s)          : Bref vide quantique, poussière de particules
 * Phase 3 — Reformation (1.5s → 2.8s)   : Cartes se reforment aux nouvelles positions
 * 
 * @algorithm Fisher-Yates shuffle pour le mélange des positions
 * @accessibility Respecte `prefers-reduced-motion` — animations désactivées si activé
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DisintegrationPhase } from '@/types/project.types';

/**
 * Algorithme de mélange Fisher-Yates (in-place, O(n)).
 * Garantit une distribution uniforme des permutations.
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface UseDisintegrationGridOptions {
  /** Nombre total d'éléments dans la grille */
  itemCount: number;
  /** Intervalle entre chaque cycle (ms) — défaut : 10000 */
  intervalMs?: number;
  /** Si true, pause les animations (ex: modale ouverte) */
  isPaused?: boolean;
}

export function useDisintegrationGrid({
  itemCount,
  intervalMs = 10000,
  isPaused = false,
}: UseDisintegrationGridOptions) {
  // Ordre d'affichage courant (indices des cartes dans l'ordre rendu)
  const [displayOrder, setDisplayOrder] = useState<number[]>(
    () => Array.from({ length: itemCount }, (_, i) => i)
  );

  // Phase actuelle de l'animation
  const [phase, setPhase] = useState<DisintegrationPhase>('idle');

  // Refs pour le nettoyage des timers
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Détection prefers-reduced-motion
  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }, []);

  /** Lance un cycle complet de désintégration → void → reformation */
  const triggerCycle = useCallback(() => {
    if (prefersReducedMotion.current || isPaused) return;

    // Phase 1 : Désintégration (0.8s)
    setPhase('disintegrating');

    const t1 = setTimeout(() => {
      // Phase 2 : Void (0.2s) — les positions sont mélangées pendant le vide
      setPhase('void');
      setDisplayOrder(prev => fisherYatesShuffle(prev));
    }, 800);

    const t2 = setTimeout(() => {
      // Phase 3 : Reformation (0.8s)
      setPhase('reforming');
    }, 1000);

    const t3 = setTimeout(() => {
      // Retour au repos
      setPhase('idle');
    }, 1800);

    timeoutsRef.current = [t1, t2, t3];
  }, [isPaused]);

  /** Met en place l'intervalle de déclenchement */
  useEffect(() => {
    // Nettoyage préventif
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPaused || prefersReducedMotion.current) return;

    intervalRef.current = setInterval(triggerCycle, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [triggerCycle, intervalMs, isPaused]);

  /** Réinitialise l'ordre quand le nombre d'items change */
  useEffect(() => {
    setDisplayOrder(Array.from({ length: itemCount }, (_, i) => i));
  }, [itemCount]);

  return { displayOrder, phase };
}
