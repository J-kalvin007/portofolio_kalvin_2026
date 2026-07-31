// 'use client';

// /**
//  * @file StarField.tsx
//  * @description Champ stellaire animé pour le fond spatial de la modale projet.
//  * 
//  * @design
//  * - 800+ étoiles réparties sur 3 couches de profondeur (parallax)
//  * - Rotation/dérive lente différenciée par couche
//  * - Nébuleuses pulsantes en arrière-plan (radial gradients CSS)
//  * - Performance : CSS animations pures, will-change optimisé
//  * 
//  * @layers
//  * - Layer 1 : Étoiles lointaines (petites, lentes)
//  * - Layer 2 : Étoiles moyennes
//  * - Layer 3 : Étoiles proches (grandes, rapides)
//  */

// import React from 'react';
// import { motion } from 'framer-motion';
// import { useStarField } from '@/hooks/useStarField';

// const StarField = React.memo(function StarField() {
//   const stars = useStarField();

//   return (
//     <div className="fixed inset-0 z-0 overflow-hidden bg-base-100 dark:bg-[#070510]" aria-hidden="true">
//       {/* ── Nébuleuses pulsantes (CSS radial gradients) ── */}
//       <div className="absolute inset-0">
//         {/* Nébuleuse cyan — coin supérieur droit */}
//         <div
//           className="absolute w-[600px] h-[600px] rounded-full animate-[nebula-pulse_8s_ease-in-out_infinite]"
//           style={{
//             top: '10%',
//             right: '15%',
//             background: 'radial-gradient(circle, rgba(79,195,247,0.08) 0%, transparent 70%)',
//           }}
//         />
//         {/* Nébuleuse violette — coin inférieur gauche */}
//         <div
//           className="absolute w-[500px] h-[500px] rounded-full animate-[nebula-pulse_10s_ease-in-out_infinite_2s]"
//           style={{
//             bottom: '15%',
//             left: '10%',
//             background: 'radial-gradient(circle, rgba(206,147,216,0.06) 0%, transparent 70%)',
//           }}
//         />
//         {/* Nébuleuse or — centre */}
//         <div
//           className="absolute w-[400px] h-[400px] rounded-full animate-[nebula-pulse_12s_ease-in-out_infinite_4s]"
//           style={{
//             top: '40%',
//             left: '45%',
//             transform: 'translate(-50%, -50%)',
//             background: 'radial-gradient(circle, rgba(240,165,0,0.04) 0%, transparent 70%)',
//           }}
//         />
//       </div>

//       {/* ── Étoiles par couche ── */}
//       {[1, 2, 3].map((layer) => {
//         // Parallax drift directionnel selon la couche
//         const xDrift = layer === 1 ? ['0%', '-3%', '2%', '0%'] : layer === 2 ? ['0%', '3%', '-2%', '0%'] : ['0%', '-5%', '3%', '0%'];
//         const yDrift = layer === 1 ? ['0%', '2%', '-3%', '0%'] : layer === 2 ? ['0%', '-2%', '4%', '0%'] : ['0%', '4%', '-2%', '0%'];

//         return (
//           <motion.div
//             key={layer}
//             className="absolute inset-0"
//             animate={{ x: xDrift, y: yDrift }}
//             transition={{ duration: 120 - layer * 20, ease: 'linear', repeat: Infinity }}
//           >
//             {stars
//               .filter((s) => s.layer === layer)
//               .map((star) => (
//                 <motion.div
//                   key={star.id}
//                   className="absolute rounded-full bg-[#F0A500]/60 dark:bg-white"
//                   style={{
//                     left: `${star.x}%`,
//                     top: `${star.y}%`,
//                     width: `${star.size}px`,
//                     height: `${star.size}px`,
//                     willChange: 'transform, opacity',
//                   }}
//                   animate={{
//                     x: star.moveX,
//                     y: star.moveY,
//                     opacity: [star.opacity * 0.1, star.opacity, star.opacity * 0.1],
//                   }}
//                   transition={{
//                     duration: star.duration,
//                     ease: 'easeInOut',
//                     repeat: Infinity,
//                     delay: star.delay,
//                   }}
//                 />
//               ))}
//           </motion.div>
//         );
//       })}
//     </div>
//   );
// });

// export default StarField;



















'use client';

/**
 * @file StarField.tsx
 * @description Champ stellaire animé pour le fond spatial de la modale projet.
 * 
 * @design
 * - 350 étoiles réparties sur 3 couches de profondeur (parallax)
 * - Rotation/dérive lente différenciée par couche
 * - Nébuleuses pulsantes en arrière-plan (radial gradients CSS)
 * - Performance : CSS animations pures, will-change optimisé
 * 
 * @layers
 * - Layer 1 : Étoiles lointaines (petites, lentes)
 * - Layer 2 : Étoiles moyennes
 * - Layer 3 : Étoiles proches (grandes, rapides)
 *
 * @remarks **Correctif de performance.**
 * Le commentaire annonçait « CSS animations pures » ; le code montait en réalité
 * un `motion.div` Framer Motion **par étoile**, chacun avec sa propre animation
 * infinie. Trois cent cinquante animations pilotées par JavaScript sur le fil
 * principal, réévaluées à chaque image — et ce composant sert aussi bien la
 * modale projet que la page d'erreur.
 *
 * Les étoiles sont devenues de simples `<div>` animés par CSS : `opacity` et
 * `transform` sont pris en charge par le fil de composition, le fil principal
 * reste libre. Seules les trois couches de parallaxe restent pilotées par
 * Framer — trois animations au lieu de trois cent cinquante.
 *
 * @remarks **Correctif de ma propre livraison précédente.**
 * `star.moveX` et `star.moveY` sont des **trajectoires** (`number[]` de quatre
 * points), pas des scalaires. Ma première version les interpolait telles quelles
 * dans une variable CSS, ce qui produisait `"0,45,-30,0px"` — une valeur
 * invalide, silencieusement ignorée par le navigateur : les étoiles scintillaient
 * mais ne dérivaient plus. Les deux points intermédiaires alimentent désormais
 * deux paliers distincts de la keyframe.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useStarField } from '@/hooks/useStarField';

/** Largeur de viewport en deçà de laquelle la densité stellaire est réduite. */
const COMPACT_VIEWPORT = 768;

/** Une étoile sur trois est conservée sur petit écran. */
const COMPACT_STEP = 3;

/**
 * Keyframe unique, injectée une seule fois par le composant (mémoïsé, monté une
 * fois par modale). À déplacer dans `globals.css` si vous préférez centraliser.
 *
 * Les quatre paliers reproduisent la trajectoire d'origine `[0, p1, p2, 0]`.
 */
const STAR_KEYFRAMES = `
@keyframes star-twinkle-drift {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: var(--star-min);
  }
  33% {
    transform: translate3d(var(--star-dx1, 0px), var(--star-dy1, 0px), 0);
    opacity: var(--star-max);
  }
  66% {
    transform: translate3d(var(--star-dx2, 0px), var(--star-dy2, 0px), 0);
    opacity: var(--star-max);
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: var(--star-min);
  }
}`;

/** Dérive de parallaxe par couche — la plus proche bouge le plus. */
const LAYER_DRIFT = {
  1: { x: ['0%', '-3%', '2%', '0%'], y: ['0%', '2%', '-3%', '0%'] },
  2: { x: ['0%', '3%', '-2%', '0%'], y: ['0%', '-2%', '4%', '0%'] },
  3: { x: ['0%', '-5%', '3%', '0%'], y: ['0%', '4%', '-2%', '0%'] },
} as const;

/** Extrait un point de trajectoire en toute sécurité, quelle que soit la longueur du tableau. */
const trajectoryPoint = (trajectory: number[] | undefined, index: number): string =>
  `${trajectory?.[index] ?? 0}px`;

const StarField = React.memo(function StarField() {
  const stars = useStarField();
  const shouldReduceMotion = useReducedMotion();

  /**
   * Densité adaptative : l'appareil qui a le plus de mal à composer des centaines
   * de calques est aussi celui dont l'écran en montre le moins.
   */
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${COMPACT_VIEWPORT}px)`);
    const sync = () => setIsCompact(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const visibleStars = useMemo(
    () => (isCompact ? stars.filter((_, i) => i % COMPACT_STEP === 0) : stars),
    [stars, isCompact]
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-base-100 dark:bg-[#070510]" aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: STAR_KEYFRAMES }} />

      {/* ── Nébuleuses pulsantes (CSS radial gradients) ──
          Les teintes cyan et violet clair d'origine étaient hors palette : le
          design system « Void & Or » ne comporte que de l'or, un violet profond
          de fond et un ivoire. Les trois nappes reprennent ces valeurs. */}
      <div className="absolute inset-0">
        {/* Nébuleuse froide — coin supérieur droit */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-[nebula-pulse_8s_ease-in-out_infinite] motion-reduce:animate-none"
          style={{
            top: '10%',
            right: '15%',
            background: 'radial-gradient(circle, rgba(123,111,160,0.10) 0%, transparent 70%)',
          }}
        />
        {/* Nébuleuse profonde — coin inférieur gauche */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-[nebula-pulse_10s_ease-in-out_infinite_2s] motion-reduce:animate-none"
          style={{
            bottom: '15%',
            left: '10%',
            background: 'radial-gradient(circle, rgba(44,34,69,0.28) 0%, transparent 70%)',
          }}
        />
        {/* Nébuleuse or — centre */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full animate-[nebula-pulse_12s_ease-in-out_infinite_4s] motion-reduce:animate-none"
          style={{
            top: '40%',
            left: '45%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(240,165,0,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Étoiles par couche ── */}
      {[1, 2, 3].map((layer) => {
        // Parallax drift directionnel selon la couche
        const drift = LAYER_DRIFT[layer as keyof typeof LAYER_DRIFT];

        return (
          <motion.div
            key={layer}
            className="absolute inset-0"
            animate={shouldReduceMotion ? undefined : { x: drift.x, y: drift.y }}
            transition={{ duration: 120 - layer * 20, ease: 'linear', repeat: Infinity }}
          >
            {visibleStars
              .filter((s) => s.layer === layer)
              .map((star) => (
                // Plus de `motion.div` ici : un nœud statique, une animation CSS.
                <div
                  key={star.id}
                  className="absolute rounded-full bg-[#F0A500]/60 dark:bg-white"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: shouldReduceMotion ? star.opacity : undefined,
                    '--star-min': star.opacity * 0.1,
                    '--star-max': star.opacity,
                    // Points 1 et 2 de la trajectoire `[0, p1, p2, 0]`.
                    '--star-dx1': trajectoryPoint(star.moveX, 1),
                    '--star-dy1': trajectoryPoint(star.moveY, 1),
                    '--star-dx2': trajectoryPoint(star.moveX, 2),
                    '--star-dy2': trajectoryPoint(star.moveY, 2),
                    animation: shouldReduceMotion
                      ? undefined
                      : `star-twinkle-drift ${star.duration}s ease-in-out ${star.delay}s infinite`,
                    willChange: 'transform, opacity',
                  } as React.CSSProperties}
                />
              ))}
          </motion.div>
        );
      })}
    </div>
  );
});

export default StarField;