'use client';

/**
 * @file DescriptionRain.tsx
 * @description Carrousel infini vertical de texte défilant (effet pluie).
 * 
 * @design
 * - Texte de description qui défile continuellement de haut en bas ("rainfall")
 * - Vitesse lente et méditative (~40px/s)
 * - Texte segmenté en blocs de ~15 mots pour une lecture naturelle
 * - Masques dégradés en haut et en bas pour effet de profondeur
 * - Police serif élégante (Playfair Display) pour contraste typographique
 * 
 * @animation CSS @keyframes marquee infini — pas de JS pour le défilement
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DescriptionRainProps {
  /** Texte complet de la description du projet */
  description: string;
}

/**
 * Segmente un texte en blocs de `wordsPerChunk` mots.
 * Chaque bloc est une unité de lecture naturelle dans le carrousel.
 */
function splitIntoChunks(text: string, wordsPerChunk: number = 12): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }

  return chunks;
}

export default function DescriptionRain({ description }: DescriptionRainProps) {
  // Segmente la description en blocs lisibles
  const chunks = useMemo(() => splitIntoChunks(description, 12), [description]);

  // On duplique les chunks 4x pour un défilement infini sans trous
  const repeatedChunks = useMemo(
    () => [...chunks, ...chunks, ...chunks, ...chunks],
    [chunks]
  );

  // Durée d'animation proportionnelle au contenu
  const duration = Math.max(chunks.length * 6, 20);

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {/* ── Masque dégradé supérieur (fade out) ── */}
      <div className="absolute top-0 left-0 right-0 h-24 z-10
        bg-gradient-to-b from-black to-transparent pointer-events-none" />

      {/* ── Masque dégradé inférieur (fade out) ── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 z-10
        bg-gradient-to-t from-black to-transparent pointer-events-none" />

      {/* ── Conteneur de défilement infini (haut → bas) ── */}
      <motion.div
        animate={{ y: ['-25%', '-75%'] }}
        transition={{ duration: duration, ease: 'linear', repeat: Infinity }}
        className="will-change-transform"
      >
        {repeatedChunks.map((chunk, i) => (
          <div
            key={`desc-${i}`}
            className="py-6 px-4 flex flex-col items-center"
          >
            <p className="font-display text-lg sm:text-xl lg:text-2xl leading-relaxed
              text-white/80 dark:text-white/80 text-center
              tracking-wide italic drop-shadow-md">
              {chunk}
            </p>
            {/* Séparateur décoratif subtil entre les blocs */}
            {i < repeatedChunks.length - 1 && (
              <div className="flex justify-center mt-4">
                <div className="w-8 h-px bg-white/10" />
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
