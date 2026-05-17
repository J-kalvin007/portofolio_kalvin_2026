'use client';

/**
 * @file TechStackRain.tsx
 * @description Carrousel infini vertical inversé des technologies (défilement bas → haut).
 * 
 * @design
 * - SVG des technologies défilant de bas en haut (direction inverse au texte)
 * - Chaque item : grande icône SVG + nom de la technologie
 * - Flottement individuel subtil par index (offset)
 * - Filtre holographique au hover sur les SVGs
 * - Masques dégradés haut/bas pour effet de profondeur
 * 
 * @fallback Technologies sans SVG affichées avec un cercle coloré + texte
 */

import React, { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TECH_SVG_MAP } from '@/types/project.types';

interface TechStackRainProps {
  /** Tableau des noms de technologies du projet */
  techStack: string[];
}

export default function TechStackRain({ techStack }: TechStackRainProps) {
  // On répète la liste 5x pour un défilement infini continu
  const repeatedTech = useMemo(
    () => [...techStack, ...techStack, ...techStack, ...techStack, ...techStack],
    [techStack]
  );

  // Durée proportionnelle au nombre de techs
  const duration = Math.max(techStack.length * 5, 18);

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {/* ── Masque dégradé supérieur ── */}
      <div className="absolute top-0 left-0 right-0 h-24 z-10
        bg-gradient-to-b from-black to-transparent pointer-events-none" />

      {/* ── Masque dégradé inférieur ── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 z-10
        bg-gradient-to-t from-black to-transparent pointer-events-none" />

      {/* ── Conteneur de défilement infini (bas → haut) ── */}
      <motion.div
        animate={{ y: ['-75%', '-25%'] }}
        transition={{ duration: duration, ease: 'linear', repeat: Infinity }}
        className="will-change-transform"
      >
        {repeatedTech.map((tech, i) => {
          const svgPath = TECH_SVG_MAP[tech] || '';

          return (
            <div
              key={`tech-${i}`}
              className="flex flex-col items-center py-5 px-2 group/tech"
              style={{
                // Flottement individuel léger décalé par index
                animation: `float ${3 + (i % 3)}s ease-in-out ${(i % 5) * 0.4}s infinite`,
              }}
            >
              {/* ── Icône SVG ou fallback ── */}
              {svgPath ? (
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 transition-all duration-300
                  group-hover/tech:scale-110 group-hover/tech:drop-shadow-[0_0_15px_var(--primary)]">
                  <Image
                    src={svgPath}
                    alt={tech}
                    fill
                    className="object-contain brightness-0 invert opacity-90
                      group-hover/tech:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ) : (
                /* Fallback : cercle coloré avec initiale */
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl
                  bg-white/10 border border-white/10
                  flex items-center justify-center
                  text-white/50 text-sm font-bold font-mono
                  group-hover/tech:border-[var(--primary)]/30 transition-colors">
                  {tech.charAt(0)}
                </div>
              )}

              {/* ── Nom de la technologie ── */}
              <span className="mt-3 text-sm sm:text-base font-mono font-bold uppercase tracking-widest
                text-white/70 group-hover/tech:text-[var(--primary)] transition-colors duration-300 drop-shadow-md">
                {tech}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
