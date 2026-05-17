'use client';

/**
 * @file DisintegrationOverlay.tsx
 * @description Overlay de particules-cubes pour l'effet de désintégration/reformation.
 * 
 * @architecture
 * Rendu au-dessus de chaque carte pendant les phases 'disintegrating' et 'reforming'.
 * Utilise des animations CSS pures (pas Framer Motion) pour les particules individuelles
 * afin de maximiser les performances (compositor thread).
 * 
 * @grid 8 colonnes × 6 lignes = 48 micro-cubes par carte
 * @animation
 * - Désintégration : cubes s'envolent du bas vers le haut (stagger par ligne)
 * - Reformation : cubes convergent du haut vers le bas
 */

import React, { useMemo } from 'react';
import type { DisintegrationPhase } from '@/types/project.types';

interface DisintegrationOverlayProps {
  /** Phase actuelle de l'animation */
  phase: DisintegrationPhase;
  /** Index de la carte (pour varier les couleurs) */
  cardIndex: number;
}

/** Dimensions de la grille de cubes */
const COLS = 12;
const ROWS = 10;
const TOTAL_CUBES = COLS * ROWS;

/**
 * Génère un cube individuel avec ses propriétés de positionnement et d'animation.
 * Chaque cube a une trajectoire légèrement randomisée pour un effet organique.
 */
function generateCubeStyles(row: number, col: number, phase: DisintegrationPhase, cardIndex: number) {
  // Seed pseudo-aléatoire basé sur la position (déterministe pour éviter les re-renders)
  const seed = (row * COLS + col + cardIndex * 7) * 13.37;
  const pseudoRandom = (n: number) => ((Math.sin(seed + n) + 1) / 2);

  // Trajectoire de vol : direction aléatoire avec tendance vers le haut
  const dx = (pseudoRandom(1) - 0.5) * 200; // -100px → +100px horizontal
  const dy = -(50 + pseudoRandom(2) * 150);  // -50px → -200px vertical (vers le haut)

  // Délai basé sur la ligne : les lignes du bas partent en premier pour la désintégration
  const rowDelay = phase === 'disintegrating'
    ? (ROWS - 1 - row) * 0.035 // Bas → haut
    : row * 0.035;              // Reformation : haut → bas

  // Délai supplémentaire aléatoire pour casser la régularité
  const jitter = pseudoRandom(3) * 0.08;

  return {
    // Positionnement dans la grille
    left: `${(col / COLS) * 100}%`,
    top: `${(row / ROWS) * 100}%`,
    width: `${100 / COLS}%`,
    height: `${100 / ROWS}%`,
    // Variables CSS pour l'animation (utilisées par les keyframes)
    '--cube-dx': `${dx}px`,
    '--cube-dy': `${dy}px`,
    '--cube-rotate': `${pseudoRandom(4) * 360}deg`,
    // Timing d'animation
    animationDelay: `${rowDelay + jitter}s`,
    animationDuration: phase === 'disintegrating' ? '0.5s' : '0.5s',
    animationFillMode: 'both' as const,
    animationTimingFunction: phase === 'disintegrating'
      ? 'cubic-bezier(0.36, 0.07, 0.19, 0.97)'
      : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  } as React.CSSProperties;
}

const DisintegrationOverlay = React.memo(function DisintegrationOverlay({
  phase,
  cardIndex,
}: DisintegrationOverlayProps) {
  // Ne rend rien pendant les phases idle et void
  if (phase === 'idle' || phase === 'void') return null;

  const animationName = phase === 'disintegrating' ? 'cube-disintegrate-local' : 'cube-reform-local';

  // Couleurs des cubes alternant entre les accents du design system
  const colors = [
    'var(--primary)',
    'var(--accent)',
    'var(--secondary)',
  ];

  // Génération des cubes mémoïsée (ne change qu'avec la phase)
  const cubes = useMemo(() => {
    return Array.from({ length: TOTAL_CUBES }, (_, i) => {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      return { id: i, row, col };
    });
  }, []);

  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-visible" aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cube-disintegrate-local {
          0% { transform: translateX(0) translateY(0) rotateX(0deg) rotateZ(0deg) scale(1); opacity: 1; }
          100% { transform: translateX(var(--cube-dx)) translateY(var(--cube-dy)) rotateX(90deg) rotateZ(var(--cube-rotate)) scale(0); opacity: 0; filter: blur(2px); }
        }
        @keyframes cube-reform-local {
          0% { transform: translateX(var(--cube-dx)) translateY(var(--cube-dy)) rotateX(-90deg) rotateZ(calc(var(--cube-rotate) * -1)) scale(0); opacity: 0; filter: blur(2px); }
          100% { transform: translateX(0) translateY(0) rotateX(0deg) rotateZ(0deg) scale(1); opacity: 1; filter: blur(0px); }
        }
        @keyframes sparkle-local {
          0% { transform: scale(0) translateY(0); opacity: 1; }
          50% { transform: scale(1.5) translateY(-30px); opacity: 0.8; }
          100% { transform: scale(0) translateY(-60px); opacity: 0; }
        }
      `}} />
      {cubes.map(({ id, row, col }) => (
        <div
          key={id}
          className="absolute"
          style={{
            ...generateCubeStyles(row, col, phase, cardIndex),
            animationName,
          }}
        >
          <div
            className="w-full h-full rounded-sm"
            style={{
              backgroundColor: colors[(row + col + cardIndex) % colors.length],
              opacity: 0.6 + ((row + col) % 3) * 0.15,
            }}
          />
        </div>
      ))}

      {/* Particules scintillantes résiduelles */}
      {phase === 'disintegrating' && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute w-1 h-1 rounded-full bg-[var(--primary)]"
              style={{
                left: `${15 + i * 10}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `sparkle-local 0.8s ease-out forwards ${0.2 + i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default DisintegrationOverlay;
