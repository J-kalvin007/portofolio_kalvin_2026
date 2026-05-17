'use client';

/**
 * @file StarField.tsx
 * @description Champ stellaire animé pour le fond spatial de la modale projet.
 * 
 * @design
 * - 800+ étoiles réparties sur 3 couches de profondeur (parallax)
 * - Rotation/dérive lente différenciée par couche
 * - Nébuleuses pulsantes en arrière-plan (radial gradients CSS)
 * - Performance : CSS animations pures, will-change optimisé
 * 
 * @layers
 * - Layer 1 : Étoiles lointaines (petites, lentes)
 * - Layer 2 : Étoiles moyennes
 * - Layer 3 : Étoiles proches (grandes, rapides)
 */

import React from 'react';
import { useStarField } from '@/hooks/useStarField';

const StarField = React.memo(function StarField() {
  const stars = useStarField({ count: 800 });

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
      {/* ── Nébuleuses pulsantes (CSS radial gradients) ── */}
      <div className="absolute inset-0">
        {/* Nébuleuse cyan — coin supérieur droit */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-[nebula-pulse_8s_ease-in-out_infinite]"
          style={{
            top: '10%',
            right: '15%',
            background: 'radial-gradient(circle, rgba(79,195,247,0.08) 0%, transparent 70%)',
          }}
        />
        {/* Nébuleuse violette — coin inférieur gauche */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-[nebula-pulse_10s_ease-in-out_infinite_2s]"
          style={{
            bottom: '15%',
            left: '10%',
            background: 'radial-gradient(circle, rgba(206,147,216,0.06) 0%, transparent 70%)',
          }}
        />
        {/* Nébuleuse or — centre */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full animate-[nebula-pulse_12s_ease-in-out_infinite_4s]"
          style={{
            top: '40%',
            left: '45%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(240,165,0,0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Étoiles par couche ── */}
      {[1, 2, 3].map((layer) => (
        <div
          key={layer}
          className="absolute inset-0"
          style={{
            animation: `star-drift-${layer} ${80 - layer * 15}s linear infinite`,
          }}
        >
          {stars
            .filter((s) => s.layer === layer)
            .map((star) => (
              <div
                key={star.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  animation: `star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                  willChange: 'opacity',
                }}
              />
            ))}
        </div>
      ))}
    </div>
  );
});

export default StarField;
