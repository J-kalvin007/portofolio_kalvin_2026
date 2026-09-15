// 'use client';

// /**
//  * @file TechStackRain.tsx
//  * @description Carrousel infini vertical inversé des technologies (défilement bas → haut).
//  * 
//  * @design
//  * - SVG des technologies défilant de bas en haut (direction inverse au texte)
//  * - Chaque item : grande icône SVG + nom de la technologie
//  * - Flottement individuel subtil par index (offset)
//  * - Filtre holographique au hover sur les SVGs
//  * - Masques dégradés haut/bas pour effet de profondeur
//  * 
//  * @fallback Technologies sans SVG affichées avec un cercle coloré + texte
//  */

// import React, { useMemo } from 'react';
// import Image from 'next/image';
// import { motion } from 'framer-motion';
// import { TECH_SVG_MAP } from '@/types/project.types';

// interface TechStackRainProps {
//   /** Tableau des noms de technologies du projet */
//   techStack: string[];
// }

// export default function TechStackRain({ techStack }: TechStackRainProps) {
//   // On répète la liste 5x pour un défilement infini continu
//   const repeatedTech = useMemo(
//     () => [...techStack, ...techStack, ...techStack, ...techStack, ...techStack],
//     [techStack]
//   );

//   // Durée proportionnelle au nombre de techs
//   const duration = Math.max(techStack.length * 5, 18);

//   return (
//     <div className="relative h-full w-full overflow-hidden select-none">
//       {/* ── Masque dégradé supérieur ── */}
//       <div className="absolute top-0 left-0 right-0 h-24 z-10
//         bg-gradient-to-b from-base-100 dark:from-[#070510] to-transparent pointer-events-none" />

//       {/* ── Masque dégradé inférieur ── */}
//       <div className="absolute bottom-0 left-0 right-0 h-24 z-10
//         bg-gradient-to-t from-base-100 dark:from-[#070510] to-transparent pointer-events-none" />

//       {/* ── Conteneur de défilement infini (bas → haut) ── */}
//       <motion.div
//         animate={{ y: ['-75%', '-25%'] }}
//         transition={{ duration: duration, ease: 'linear', repeat: Infinity }}
//         className="will-change-transform"
//       >
//         {repeatedTech.map((tech, i) => {
//           const svgPath = TECH_SVG_MAP[tech] || '';

//           return (
//             <div
//               key={`tech-${i}`}
//               className="flex flex-col items-center py-5 px-2 group/tech"
//               style={{
//                 // Flottement individuel léger décalé par index
//                 animation: `float ${3 + (i % 3)}s ease-in-out ${(i % 5) * 0.4}s infinite`,
//               }}
//             >
//               {/* ── Icône SVG ou fallback ── */}
//               {svgPath ? (
//                 <div className="relative w-12 h-12 sm:w-16 sm:h-16 transition-all duration-300
//                   group-hover/tech:scale-110 group-hover/tech:drop-shadow-[0_0_15px_var(--primary)]">
//                   <Image
//                     src={svgPath}
//                     alt={tech}
//                     fill
//                     className="object-contain brightness-0 dark:invert opacity-90
//                       group-hover/tech:opacity-100 transition-opacity duration-300"
//                   />
//                 </div>
//               ) : (
//                 /* Fallback : cercle coloré avec initiale */
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl
//                   bg-base-content/5 dark:bg-white/10 border border-base-content/10 dark:border-white/10
//                   flex items-center justify-center
//                   text-base-content/50 dark:text-white/50 text-sm font-bold font-mono
//                   group-hover/tech:border-[var(--primary)]/30 transition-colors">
//                   {tech.charAt(0)}
//                 </div>
//               )}

//               {/* ── Nom de la technologie ── */}
//               <span className="mt-3 text-sm sm:text-base font-mono font-bold uppercase tracking-widest
//                 text-base-content/70 dark:text-white/70 group-hover/tech:text-[var(--primary)] transition-colors duration-300 drop-shadow-md">
//                 {tech}
//               </span>
//             </div>
//           );
//         })}
//       </motion.div>
//     </div>
//   );
// }












































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
import { motion, useReducedMotion } from 'framer-motion';
import { TECH_SVG_MAP } from '@/types/project.types';

interface TechStackRainProps {
  /** Tableau des noms de technologies du projet */
  techStack: string[];
}

/**
 * Nombre de copies de la liste empilées.
 *
 * ⚠️ **Correctif de boucle.** La valeur précédente était 5. L'animation parcourt
 * 50 % de la hauteur totale, soit la moitié des copies : avec cinq copies, cela
 * représente deux copies et demie. Le point d'arrivée ne coïncidait donc pas
 * avec un début de copie, et un saut visible se produisait à chaque tour.
 * Un nombre **pair** garantit un raccord invisible.
 */
const REPEAT_COUNT_DEFAULT = 4;
const REPEAT_COUNT_SPARSE = 6;

/** En deçà de ce nombre de technologies, on empile davantage de copies pour remplir la colonne. */
const SPARSE_THRESHOLD = 5;

/** Tailles servies par le pipeline d'images Next.js pour les icônes de la colonne. */
const TECH_ICON_SIZES = '(max-width: 640px) 48px, 64px';

export default function TechStackRain({ techStack }: TechStackRainProps) {
  const shouldReduceMotion = useReducedMotion();

  // On répète la liste pour un défilement infini continu
  const repeatedTech = useMemo(() => {
    const repeatCount = techStack.length < SPARSE_THRESHOLD ? REPEAT_COUNT_SPARSE : REPEAT_COUNT_DEFAULT;
    return Array.from({ length: repeatCount }, () => techStack).flat();
  }, [techStack]);

  // Durée proportionnelle au nombre de techs
  const duration = Math.max(techStack.length * 5, 18);

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ VARIANTE MOUVEMENT RÉDUIT
     ═══════════════════════════════════════════════════════════════════════ */
  if (shouldReduceMotion) {
    return (
      <div className="h-full w-full overflow-y-auto [scrollbar-width:thin]">
        <ul className="list-none p-0">
          {techStack.map((tech) => (
            <li key={tech} className="flex flex-col items-center py-5 px-2">
              <TechIcon tech={tech} />
              <span className="mt-3 text-sm font-mono font-bold uppercase tracking-widest text-base-content/70 dark:text-white/70">
                {tech}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      /* Comme pour la colonne de description, les deux dégradés opaques
         peignaient des bandes de couleur pleine par-dessus le champ stellaire.
         Le masque CSS efface sans peindre. */
      className="relative h-full w-full overflow-hidden select-none
                 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_18%,#000_82%,transparent_100%)]
                 [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_18%,#000_82%,transparent_100%)]"
    >
      {/* ── Conteneur de défilement infini (bas → haut) ── */}
      <motion.div
        aria-hidden="true"
        animate={{ y: ['-75%', '-25%'] }}
        transition={{ duration: duration, ease: 'linear', repeat: Infinity }}
        className="will-change-transform"
      >
        {repeatedTech.map((tech, i) => (
          <div
            key={`tech-${i}`}
            className="flex flex-col items-center py-5 px-2 group/tech"
            style={{
              // Flottement individuel léger décalé par index
              animation: `float ${3 + (i % 3)}s ease-in-out ${(i % 5) * 0.4}s infinite`,
            }}
          >
            <TechIcon tech={tech} />

            {/* ── Nom de la technologie ── */}
            <span className="mt-3 text-sm sm:text-base font-mono font-bold uppercase tracking-widest
              text-base-content/70 dark:text-white/70 group-hover/tech:text-[var(--primary)] transition-colors duration-300">
              {tech}
            </span>
          </div>
        ))}
      </motion.div>

      {/* La pile est répétée quatre fois : on l'écarte des lecteurs d'écran et on
          expose la liste réelle une seule fois. */}
      <ul className="sr-only">
        {techStack.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ ICÔNE D'UNE TECHNOLOGIE
   Extraite pour être partagée par la piste animée et le repli accessible.
   ═══════════════════════════════════════════════════════════════════════════ */
function TechIcon({ tech }: { tech: string }) {
  const svgPath = TECH_SVG_MAP[tech] || '';

  if (!svgPath) {
    /* Fallback : cercle coloré avec initiale */
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl
        bg-base-content/5 dark:bg-white/10 border border-base-content/10 dark:border-white/10
        flex items-center justify-center
        text-base-content/50 dark:text-white/50 text-sm font-bold font-mono
        group-hover/tech:border-[var(--primary)]/30 transition-colors">
        {tech.charAt(0)}
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12 sm:w-16 sm:h-16 transition-transform duration-300
      group-hover/tech:scale-110 motion-reduce:transform-none">
      {/* `sizes` manquait : avec `fill`, Next.js servait chaque icône dans sa
          résolution maximale, pour un rendu final de 48 à 64 pixels. */}
      <Image
        src={svgPath}
        alt=""
        aria-hidden="true"
        fill
        sizes={TECH_ICON_SIZES}
        className="object-contain brightness-0 dark:invert opacity-90
          group-hover/tech:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
}