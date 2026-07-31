// 'use client';

// import { useRef, useState, useEffect } from 'react';
// import { useInView } from 'framer-motion';

// /* ═══════════════════════════════════════════════
//    ANIMATED COUNTER — Scroll-triggered count-up
//    ═══════════════════════════════════════════════ */

// interface AnimatedCounterProps {
//   value: number;
//   suffix?: string;
//   prefix?: string;
//   duration?: number;
//   className?: string;
// }

// export default function AnimatedCounter({
//   value,
//   suffix = '',
//   prefix = '',
//   duration = 2000,
//   className = '',
// }: AnimatedCounterProps) {
//   const ref = useRef<HTMLSpanElement>(null);
//   const isInView = useInView(ref, { once: true, margin: '-50px' });
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     if (!isInView) return;

//     const startTime = Date.now();
//     let animationFrame: number;

//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       // Ease-out cubic for smooth deceleration
//       const eased = 1 - Math.pow(1 - progress, 3);
//       setCount(Math.floor(eased * value));

//       if (progress < 1) {
//         animationFrame = requestAnimationFrame(animate);
//       }
//     };

//     animationFrame = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(animationFrame);
//   }, [isInView, value, duration]);

//   return (
//     <span ref={ref} className={`tabular-nums ${className}`}>
//       {prefix}{count}{suffix}
//     </span>
//   );
// }














'use client';

import { useRef, useState, useEffect } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER — Scroll-triggered count-up
   ═══════════════════════════════════════════════ */

/**
 * @remarks ⚠️ Il existe un **second** `AnimatedCounter` dans
 * `app/[locale]/propos/components/AboutAnimations.tsx`, dont la prop `duration`
 * s'exprime en **secondes** là où celle-ci s'exprime en **millisecondes**.
 * Même nom, même prop, unités opposées : c'est le genre de divergence qui
 * produit une animation de deux millisecondes ou de trente-trois minutes selon
 * le fichier depuis lequel on importe. À unifier — voir la note de livraison.
 */

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  /** Durée du comptage, en **millisecondes**. */
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Le nombre est une information, pas une décoration : en mouvement réduit,
    // il s'affiche directement.
    if (shouldReduceMotion) {
      setCount(value);
      return;
    }

    let animationFrame: number;

    /**
     * `requestAnimationFrame` fournit son propre horodatage, issu de la même
     * horloge monotone que le compositeur. `Date.now()` suit l'horloge système :
     * un ajustement NTP ou un changement de fuseau pendant l'animation pouvait
     * produire une progression négative, donc un compteur qui recule.
     */
    const animate = (now: number, startTime: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      // `Math.round` sur le dernier palier : `Math.floor` laissait un compteur à
      // 89 pour une cible de 89,4 — et surtout ratait la valeur exacte pour
      // toute cible non entière.
      setCount(progress === 1 ? value : Math.floor(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame((t) => animate(t, startTime));
      }
    };

    animationFrame = requestAnimationFrame((t) => animate(t, t));
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration, shouldReduceMotion]);

  return (
    // `tabular-nums` fige la chasse des chiffres : sans lui, le nombre se dilate
    // et se contracte pendant tout le comptage, et les blocs voisins bougent avec.
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{count}{suffix}
    </span>
  );
}