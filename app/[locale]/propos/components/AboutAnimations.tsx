// 'use client';
// import React, { useRef, useState, useEffect } from 'react';
// import { motion, useTransform, useInView, type MotionValue } from 'framer-motion';
// import { Quote } from 'lucide-react';

// /* ── Compteur Animé ── */
// export function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
//   const [count, setCount] = useState(0);
//   const ref = useRef<HTMLSpanElement>(null);
//   const isInView = useInView(ref, { once: true, margin: '-100px' });

//   useEffect(() => {
//     if (!isInView) return;
//     const startTime = performance.now();
//     const step = (now: number) => {
//       const p = Math.min((now - startTime) / (duration * 1000), 1);
//       setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
//       if (p < 1) requestAnimationFrame(step);
//     };
//     requestAnimationFrame(step);
//   }, [isInView, target, duration]);

//   return <span ref={ref}>{count}{suffix}</span>;
// }

// /* ── Mot révélé au scroll ── */
// const GOLD_WORDS = ['qualité', 'sublimer', 'ambassadeurs', 'précieux', 'sophistication', 'quality', 'elevate'];

// export function ScrollWord({ children, progress, index, total }: { children: string; progress: MotionValue<number>; index: number; total: number }) {
//   const start = index / total;
//   const end = Math.min(start + 3 / total, 1);
//   const opacity = useTransform(progress, [start, end], [0.12, 1]);
//   const clean = children.toLowerCase().replace(/[.,!?"""'']/g, '');
//   const isGold = GOLD_WORDS.includes(clean);

//   return (
//     <motion.span style={{ opacity }} className={`inline-block mr-[0.25em] ${isGold ? 'text-primary font-semibold' : ''}`}>
//       {children}
//     </motion.span>
//   );
// }

// /* ── Rangée Marquee Témoignages ── */
// export function MarqueeRow({ items, direction = 'left', speed = 35 }: { items: { quote: string; author: string; role: string; company: string }[]; direction?: 'left' | 'right'; speed?: number }) {
//   const tripled = [...items, ...items, ...items];
//   return (
//     <div className="flex overflow-hidden group/mq">
//       <div
//         className="flex gap-6 shrink-0 group-hover/mq:[animation-play-state:paused]"
//         style={{ animation: `marquee-${direction} ${speed}s linear infinite` }}
//       >
//         {tripled.map((t, i) => (
//           <div key={i} className="group/c w-[360px] shrink-0 p-7 rounded-[2rem] bg-white/80 dark:bg-white/[0.03] border border-base-content/[0.06] dark:border-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-700 hover:-translate-y-2">
//             <Quote className="w-7 h-7 text-primary/30 mb-3 group-hover/c:text-primary transition-colors duration-500" />
//             <p className="text-sm leading-relaxed text-base-content/65 dark:text-white/65 font-light mb-5 italic line-clamp-4">{t.quote}</p>
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#FFD166] flex items-center justify-center font-bold text-black text-sm shadow-[0_0_12px_rgba(240,165,0,0.4)]">{t.author.charAt(0)}</div>
//               <div>
//                 <div className="font-bold text-sm text-base-content dark:text-white">{t.author}</div>
//                 <div className="text-[10px] text-primary/70 font-semibold uppercase tracking-wider">{t.role}, {t.company}</div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


















'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { Quote } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ MÉCANIQUE DU RAIL DE TÉMOIGNAGES
   ───────────────────────────────────────────────────────────────────────────
   Le rail était piloté par des keyframes CSS globales (`marquee-left` /
   `marquee-right`) définies ailleurs dans le projet. Deux fragilités :
     — le raccord de boucle dépend d'une valeur de translation invisible depuis
       ce fichier : si le keyframe déplace de −50 % alors que le contenu est
       triplé, une couture apparaît à chaque tour ;
     — impossible d'honorer `prefers-reduced-motion` depuis la CSS globale.
   Le composant est désormais autonome : il calcule lui-même son cycle, et
   décélère au survol au lieu de s'arrêter net.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Amplitude du cycle, en % de la largeur de piste. 3 copies → un tiers est un raccord invisible. */
const LOOP_SPAN = 100 / 3;

/** Raideur du lissage vitesse pleine ↔ arrêt. */
const SPEED_DAMPING = 4.5;

/** Delta maximal pris en compte (ms) : évite le bond au retour d'un onglet inactif. */
const MAX_FRAME_DELTA = 64;

/** Ramène la position dans l'intervalle où le raccord de boucle est invisible. */
const wrapLoopPosition = (value: number): number =>
  (((value % LOOP_SPAN) + LOOP_SPAN) % LOOP_SPAN) - LOOP_SPAN;

/* ── Compteur Animé ── */
export function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;

    // Mouvement réduit : la valeur est une information, elle s'affiche directement.
    if (shouldReduceMotion) {
      setCount(target);
      return;
    }

    // La boucle d'origine n'était jamais annulée : quitter la page en cours de
    // comptage laissait `requestAnimationFrame` appeler `setCount` sur un
    // composant démonté. On conserve l'identifiant pour pouvoir l'interrompre.
    let frameId = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const p = Math.min((now - startTime) / (duration * 1000), 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, target, duration, shouldReduceMotion]);

  // `tabular-nums` fige la chasse des chiffres : sans lui, le nombre se dilate
  // et se contracte pendant tout le comptage.
  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>;
}

/* ── Mot révélé au scroll ── */
const GOLD_WORDS = ['qualité', 'sublimer', 'ambassadeurs', 'précieux', 'sophistication', 'quality', 'elevate'];

export function ScrollWord({ children, progress, index, total }: { children: string; progress: MotionValue<number>; index: number; total: number }) {
  const shouldReduceMotion = useReducedMotion();

  const start = index / total;
  const end = Math.min(start + 3 / total, 1);
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const clean = children.toLowerCase().replace(/[.,!?"""'']/g, '');
  const isGold = GOLD_WORDS.includes(clean);

  return (
    // En mouvement réduit, le texte est pleinement lisible d'emblée : sans cette
    // garde, un utilisateur qui ne déclenche jamais la plage de défilement
    // attendue reste devant un paragraphe à 12 % d'opacité.
    <motion.span
      style={{ opacity: shouldReduceMotion ? 1 : opacity }}
      className={`inline-block mr-[0.25em] ${isGold ? 'text-primary font-semibold' : ''}`}
    >
      {children}
    </motion.span>
  );
}

/* ── Rangée Marquee Témoignages ── */
export function MarqueeRow({ items, direction = 'left', speed = 35 }: { items: { quote: string; author: string; role: string; company: string }[]; direction?: 'left' | 'right'; speed?: number }) {
  const tripled = useMemo(() => [...items, ...items, ...items], [items]);

  const shouldReduceMotion = useReducedMotion();

  /* ── État d'animation hors React : aucun rendu par image ────────────────── */
  const baseX = useMotionValue(-LOOP_SPAN);
  const translateX = useTransform(baseX, (value) => `${value}%`);

  const currentSpeedFactor = useRef(1);
  const targetSpeedFactor = useRef(1);

  useAnimationFrame((_timestamp, delta) => {
    if (shouldReduceMotion) return;

    const elapsedSeconds = Math.min(delta, MAX_FRAME_DELTA) / 1000;

    // Décélération lissée : le rail glisse jusqu'à l'arrêt.
    currentSpeedFactor.current +=
      (targetSpeedFactor.current - currentSpeedFactor.current) * Math.min(1, elapsedSeconds * SPEED_DAMPING);

    if (Math.abs(targetSpeedFactor.current - currentSpeedFactor.current) < 0.001) {
      currentSpeedFactor.current = targetSpeedFactor.current;
    }
    if (currentSpeedFactor.current === 0) return;

    // `speed` conserve sa sémantique : secondes par cycle complet.
    const distance = (LOOP_SPAN / speed) * elapsedSeconds * currentSpeedFactor.current;
    baseX.set(wrapLoopPosition(baseX.get() + (direction === 'right' ? distance : -distance)));
  });

  const pauseTrack = useCallback(() => { targetSpeedFactor.current = 0; }, []);
  const resumeTrack = useCallback(() => { targetSpeedFactor.current = 1; }, []);

  /* Mouvement réduit : une piste que l'on parcourt soi-même, avec accroche magnétique. */
  if (shouldReduceMotion) {
    return (
      <div className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-6 w-max px-6 snap-x snap-mandatory">
          {items.map((t, i) => (
            <div key={i} className="snap-center">
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex overflow-hidden group/mq
                 [mask-image:linear-gradient(to_right,transparent_0%,#000_7%,#000_93%,transparent_100%)]
                 [-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_7%,#000_93%,transparent_100%)]"
      onPointerEnter={pauseTrack}
      onPointerLeave={resumeTrack}
      onFocusCapture={pauseTrack}
      onBlurCapture={resumeTrack}
    >
      <motion.div aria-hidden="true" style={{ x: translateX }} className="flex gap-6 shrink-0 w-max will-change-transform">
        {tripled.map((t, i) => (
          <TestimonialCard key={i} testimonial={t} />
        ))}
      </motion.div>

      {/* La piste est triplée : on l'écarte des lecteurs d'écran et on expose
          les témoignages une seule fois. */}
      <ul className="sr-only">
        {items.map((t, i) => (
          <li key={i}>{t.quote} — {t.author}, {t.role}, {t.company}</li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CARTE DE TÉMOIGNAGE
   ───────────────────────────────────────────────────────────────────────────
   Extraite de la boucle : le même balisage servait au rail animé et devait
   servir au repli accessible. Une seule définition, deux usages.

   Le guillemet ouvrant est composé en Playfair Display (`font-display`) —
   la police à empattements est déjà chargée par le layout ; l'employer sur un
   unique signe typographique lui donne enfin une raison d'être.
   ═══════════════════════════════════════════════════════════════════════════ */
function TestimonialCard({ testimonial }: { testimonial: { quote: string; author: string; role: string; company: string } }) {
  return (
    <figure
      className="group/c w-[320px] sm:w-[360px] shrink-0 p-7 rounded-[1.75rem] flex flex-col
                 bg-base-100/80 dark:bg-white/[0.03] backdrop-blur-xl
                 border border-base-content/[0.07] dark:border-white/[0.08]
                 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_1px_2px_-1px_rgba(0,0,0,0.05)]
                 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
                 hover:border-primary/30 hover:-translate-y-1.5 motion-reduce:transform-none
                 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_20px_40px_-24px_rgba(0,0,0,0.45)]
                 transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <Quote className="w-6 h-6 text-primary/30 mb-3 shrink-0 group-hover/c:text-primary transition-colors duration-500" aria-hidden="true" />

      <blockquote className="text-sm leading-[1.7] text-base-content/65 dark:text-white/65 font-light mb-5 line-clamp-4">
        {testimonial.quote}
      </blockquote>

      <figcaption className="flex items-center gap-3 mt-auto">
        {/* Monogramme : matière pleine plutôt que dégradé + halo.
            Une initiale n'a pas besoin d'être éclairée pour se lire. */}
        <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center
                        bg-primary text-primary-content font-bold text-sm
                        shadow-[0_1px_2px_rgba(0,0,0,0.18)]">
          {testimonial.author.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-base-content dark:text-white truncate">{testimonial.author}</div>
          <div className="text-[10px] text-primary/70 font-semibold uppercase tracking-[0.14em] truncate">
            {testimonial.role}, {testimonial.company}
          </div>
        </div>
      </figcaption>
    </figure>
  );
}