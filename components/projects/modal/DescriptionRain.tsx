// 'use client';

// /**
//  * @file DescriptionRain.tsx
//  * @description Carrousel infini vertical de texte défilant (effet pluie).
//  * 
//  * @design
//  * - Texte de description qui défile continuellement de haut en bas ("rainfall")
//  * - Vitesse lente et méditative (~40px/s)
//  * - Texte segmenté en blocs de ~15 mots pour une lecture naturelle
//  * - Masques dégradés en haut et en bas pour effet de profondeur
//  * - Police serif élégante (Playfair Display) pour contraste typographique
//  * 
//  * @animation CSS @keyframes marquee infini — pas de JS pour le défilement
//  */

// import React, { useMemo } from 'react';
// import { motion } from 'framer-motion';

// interface DescriptionRainProps {
//   /** Texte complet de la description du projet */
//   description: string;
// }

// /**
//  * Segmente un texte en blocs de `wordsPerChunk` mots.
//  * Chaque bloc est une unité de lecture naturelle dans le carrousel.
//  */
// function splitIntoChunks(text: string, wordsPerChunk: number = 12): string[] {
//   const words = text.split(/\s+/);
//   const chunks: string[] = [];

//   for (let i = 0; i < words.length; i += wordsPerChunk) {
//     chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
//   }

//   return chunks;
// }

// export default function DescriptionRain({ description }: DescriptionRainProps) {
//   // Segmente la description en blocs lisibles
//   const chunks = useMemo(() => splitIntoChunks(description, 12), [description]);

//   // On duplique les chunks 4x pour un défilement infini sans trous
//   const repeatedChunks = useMemo(
//     () => [...chunks, ...chunks, ...chunks, ...chunks],
//     [chunks]
//   );

//   // Durée d'animation proportionnelle au contenu
//   const duration = Math.max(chunks.length * 6, 20);

//   return (
//     <div className="relative h-full w-full overflow-hidden select-none">
//       {/* ── Masque dégradé supérieur (fade out) ── */}
//       <div className="absolute top-0 left-0 right-0 h-24 z-10
//         bg-gradient-to-b from-base-100 dark:from-[#070510] to-transparent pointer-events-none" />

//       {/* ── Masque dégradé inférieur (fade out) ── */}
//       <div className="absolute bottom-0 left-0 right-0 h-24 z-10
//         bg-gradient-to-t from-base-100 dark:from-[#070510] to-transparent pointer-events-none" />

//       {/* ── Conteneur de défilement infini (haut → bas) ── */}
//       <motion.div
//         animate={{ y: ['-25%', '-75%'] }}
//         transition={{ duration: duration, ease: 'linear', repeat: Infinity }}
//         className="will-change-transform"
//       >
//         {repeatedChunks.map((chunk, i) => (
//           <div
//             key={`desc-${i}`}
//             className="py-6 px-4 flex flex-col items-center"
//           >
//             {/* <p className="font-display text-lg sm:text-xl lg:text-2xl leading-relaxed
//               text-base-content/80 dark:text-white/80 text-center
//               tracking-wide italic drop-shadow-md">
//               {chunk}
//             </p> */}

//             <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed
//               text-base-content/80 dark:text-white/80 text-center font-bold
//               tracking-wide drop-shadow-md">
//               {chunk}
//             </p>

//             {/* Séparateur décoratif subtil entre les blocs */}
//             {i < repeatedChunks.length - 1 && (

//               <div className="flex justify-center mt-4">
//                 <div className="w-8 h-px bg-base-content/10 dark:bg-white/10" />
//               </div>

//             )}

//           </div>

//         ))}

//       </motion.div>

//     </div>

//   );

// }




































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
import { motion, useReducedMotion } from 'framer-motion';

interface DescriptionRainProps {
  /** Texte complet de la description du projet */
  description: string;
}

/**
 * Nombre de copies de la liste empilées pour donner l'illusion de l'infini.
 *
 * La valeur doit rester **paire** : l'animation parcourt 50 % de la hauteur
 * totale, soit exactement la moitié des copies. Avec un nombre impair, ce
 * parcours tombe entre deux copies et une couture apparaît à chaque tour.
 */
const REPEAT_COUNT_DEFAULT = 4;
const REPEAT_COUNT_SPARSE = 6;

/** En deçà de ce nombre de blocs, on empile davantage de copies pour remplir la colonne. */
const SPARSE_THRESHOLD = 4;

/** Nombre de mots par bloc de lecture. */
const WORDS_PER_CHUNK = 12;

/**
 * Segmente un texte en blocs de `wordsPerChunk` mots.
 * Chaque bloc est une unité de lecture naturelle dans le carrousel.
 */
function splitIntoChunks(text: string, wordsPerChunk: number = WORDS_PER_CHUNK): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }

  return chunks;
}

export default function DescriptionRain({ description }: DescriptionRainProps) {
  const shouldReduceMotion = useReducedMotion();

  // Segmente la description en blocs lisibles
  const chunks = useMemo(() => splitIntoChunks(description, WORDS_PER_CHUNK), [description]);

  // On duplique les chunks pour un défilement infini sans trous
  const repeatedChunks = useMemo(() => {
    const repeatCount = chunks.length < SPARSE_THRESHOLD ? REPEAT_COUNT_SPARSE : REPEAT_COUNT_DEFAULT;
    return Array.from({ length: repeatCount }, () => chunks).flat();
  }, [chunks]);

  // Durée d'animation proportionnelle au contenu
  const duration = Math.max(chunks.length * 6, 20);

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ VARIANTE MOUVEMENT RÉDUIT
     Le texte est la substance de cette colonne : on l'affiche simplement,
     en une seule occurrence, parcourable à la main.
     ═══════════════════════════════════════════════════════════════════════ */
  if (shouldReduceMotion) {
    return (
      <div className="h-full w-full overflow-y-auto [scrollbar-width:thin]">
        <p className="py-6 px-4 text-lg leading-[1.7] text-base-content/80 dark:text-white/80 text-center font-bold tracking-wide">
          {description}
        </p>
      </div>
    );
  }

  return (
    <div
      /* Les deux dégradés d'origine peignaient une bande opaque de `base-100`
         sur 96 px en haut et en bas — au-dessus du champ stellaire. Il en
         résultait deux rectangles de couleur pleine posés sur les étoiles,
         parfaitement visibles. Un masque CSS efface les extrémités du texte
         sans rien peindre : les étoiles restent visibles derrière. */
      className="relative h-full w-full overflow-hidden select-none
                 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_18%,#000_82%,transparent_100%)]
                 [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_18%,#000_82%,transparent_100%)]"
    >
      {/* ── Conteneur de défilement infini ── */}
      <motion.div
        aria-hidden="true"
        animate={{ y: ['-25%', '-75%'] }}
        transition={{ duration: duration, ease: 'linear', repeat: Infinity }}
        className="will-change-transform"
      >
        {repeatedChunks.map((chunk, i) => (
          <div
            key={`desc-${i}`}
            className="py-6 px-4 flex flex-col items-center"
          >
            <p className="text-lg sm:text-xl lg:text-2xl leading-[1.6]
              text-base-content/80 dark:text-white/80 text-center font-bold
              tracking-wide">
              {chunk}
            </p>

            {/* Séparateur décoratif subtil entre les blocs */}
            {i < repeatedChunks.length - 1 && (
              <div className="flex justify-center mt-4">
                <div className="w-8 h-px bg-base-content/10 dark:bg-white/10" />
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* La description est répétée quatre fois dans la piste : on l'écarte des
          lecteurs d'écran, qui l'annonçaient quatre fois de suite, et on l'expose
          une seule fois sous forme lisible. */}
      <p className="sr-only">{description}</p>
    </div>
  );
}