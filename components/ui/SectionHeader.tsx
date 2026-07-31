// 'use client';

// import { useRef } from 'react';
// import { motion, useInView } from 'framer-motion';

// /* ═══════════════════════════════════════════════
//    SECTION HEADER — Reusable premium section title
//    Includes: eyebrow tag, main title, optional description
//    ═══════════════════════════════════════════════ */

// interface SectionHeaderProps {
//   eyebrow: string;
//   title: string;
//   description?: string;
//   align?: 'left' | 'center';
//   className?: string;
// }

// export default function SectionHeader({
//   eyebrow,
//   title,
//   description,
//   align = 'left',
//   className = '',
// }: SectionHeaderProps) {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, margin: '-80px' });

//   return (
//     <div
//       ref={ref}
//       className={`mb-16 md:mb-20 ${align === 'center' ? 'text-center mx-auto' : ''} ${className}`}
//     >
//       {/* Eyebrow */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={isInView ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.6 }}
//         className={`inline-flex items-center gap-2.5 mb-6 ${align === 'center' ? 'mx-auto' : ''}`}
//       >
//         <span className="w-8 h-[2px] rounded-full bg-primary" />
//         <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
//           {eyebrow}
//         </span>
//       </motion.div>

//       {/* Title */}
//       <motion.h2
//         initial={{ opacity: 0, y: 30 }}
//         animate={isInView ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.7, delay: 0.1 }}
//         className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight"
//       >
//         {title}
//       </motion.h2>

//       {/* Description */}
//       {description && (
//         <motion.p
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.7, delay: 0.2 }}
//           className={`mt-6 text-lg text-base-content/60 leading-relaxed font-light ${align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-xl'
//             }`}
//         >
//           {description}
//         </motion.p>
//       )}
//     </div>
//   );
// }







'use client';

import { motion, useReducedMotion } from 'framer-motion';

/* ═══════════════════════════════════════════════
   SECTION HEADER — Reusable premium section title
   Includes: eyebrow tag, main title, optional description
   ═══════════════════════════════════════════════ */

/** Décélération franche, sans rebond — identique sur toute l'application. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Marge de déclenchement : le bloc s'anime un peu avant d'être pleinement visible. */
const VIEWPORT_MARGIN = '-80px';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  /**
   * Niveau du titre rendu. `h2` par défaut, ce qui convient à toutes les
   * sections placées sous le `h1` de la page. À passer à `h3` si l'en-tête est
   * imbriqué dans une section déjà titrée : un niveau sauté est le défaut le
   * plus fréquemment relevé par les audits d'accessibilité.
   */
  as?: 'h2' | 'h3';
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
  as: Heading = 'h2',
}: SectionHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  /**
   * `whileInView` remplace le couple `useRef` + `useInView` + `animate={isInView ? … : {}}`.
   * La cible vide `{}` signifiait « aucune propriété à animer » : cela
   * fonctionnait par effet de bord — l'élément restait sur son état `initial` —
   * mais confiait la lisibilité du texte à une absence de valeur. La forme
   * déclarative est explicite et supprime deux hooks.
   */
  const reveal = (delay: number) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: VIEWPORT_MARGIN },
    transition: { duration: 0.7, delay, ease: EASE_OUT_EXPO },
  });

  const isCentered = align === 'center';

  return (
    <div className={`mb-16 md:mb-20 ${isCentered ? 'text-center' : ''} ${className}`}>
      {/* Eyebrow */}
      <motion.div
        {...reveal(0)}
        className={`inline-flex items-center gap-2.5 mb-6 ${isCentered ? 'mx-auto' : ''}`}
      >
        <span aria-hidden="true" className="w-8 h-[2px] rounded-full bg-primary shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </span>
      </motion.div>

      {/* Title */}
      <motion.div {...reveal(0.1)}>
        {/* `tracking-tight` (-0.025em) est calibré pour du texte courant.
            À 60 px, le crénage doit être nettement plus serré : sans cela, les
            grands titres paraissent relâchés à côté du reste de la page. */}
        <Heading className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.06] tracking-[-0.035em] text-balance">
          {title}
        </Heading>
      </motion.div>

      {/* Description */}
      {description && (
        <motion.p
          {...reveal(0.2)}
          className={`mt-6 text-lg text-base-content/60 leading-[1.75] font-light text-pretty ${isCentered ? 'max-w-2xl mx-auto' : 'max-w-xl'
            }`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}