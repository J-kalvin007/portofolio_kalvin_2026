// 'use client';

// /**
//  * @file projets/page.tsx
//  * @description Page ultra-premium listant l'ensemble des projets réalisés.
//  * 
//  * @architecture
//  * - Component-driven : tous les composants UI sont isolés dans `components/projects/`
//  * - Custom Hooks : `useProjectModal` (état modale), `useDisintegrationGrid` (animation grille)
//  * - Séparation stricte : données (lib/data), logique (hooks), présentation (components)
//  * - i18n : toutes les chaînes via `useTranslations()` — zéro texte en dur
//  * - Dark/Light : variables CSS du design system "Void & Or" via Tailwind `dark:` variants
//  * 
//  * @features
//  * 1. Cartes glassmorphisme avec hover 3D et shimmer holographique
//  * 2. Animation de désintégration/téléportation toutes les 10 secondes
//  * 3. Modale spatiale plein écran avec champ stellaire, carrousel d'images flottant,
//  *    pluie de description et cascade inversée de technologies
//  */

// import React, { useState, useMemo, useRef } from 'react';
// import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
// import { Sparkles } from 'lucide-react';
// import { useTranslations } from 'next-intl';
// import FadeIn from '@/components/animations/FadeIn';
// import StardustCursor from '@/components/animations/StardustCursor';
// import { PROJECTS, PROJECT_CATEGORIES } from '@/lib/data/projects';
// import { useProjectModal } from '@/hooks/useProjectModal';
// import { ProjectsGrid, ProjectModal } from '@/components/projects';

// export default function ProjetsPage() {
//   /* ── État local : filtre de catégorie ── */
//   const [activeFilter, setActiveFilter] = useState<string>('__all__');

//   /* ── Hooks personnalisés ── */
//   const { modalState, openModal, closeModal } = useProjectModal();

//   /* ── Dictionnaires i18n ── */
//   const t = useTranslations('projects_page');

//   /* ── Filtres dynamiques ── */
//   const filters = useMemo(
//     () => [{ key: '__all__', label: t('filterAll') }, ...PROJECT_CATEGORIES.map((c) => ({ key: c, label: c }))],
//     [t]
//   );

//   /* ── Projets filtrés par catégorie ── */
//   const filteredProjects = useMemo(
//     () => activeFilter === '__all__' ? PROJECTS : PROJECTS.filter((p) => p.category === activeFilter),
//     [activeFilter]
//   );

//   return (
//     <div className="min-h-screen bg-base-100 text-base-content pt-28 sm:pt-36 relative">
//       {/* ── Cursor Stardust Ultra-Premium ── */}
//       <StardustCursor />

//       {/* ═══════════════════════════════════════
//          SECTION HERO — Titre de la page
//          ═══════════════════════════════════════ */}
//       <section className="px-4 sm:px-6 pb-16">

//         <div className="max-w-6xl mx-auto text-center">

//           {/* <FadeIn>
//             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
//               bg-primary/[0.08] border border-primary/15
//               text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-6">
//               <Sparkles className="w-3.5 h-3.5" /> {t('badge')}
//             </span>
//           </FadeIn> */}

//           <FadeIn delay={0.1}>

//             <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[0.95] tracking-tight">
//               {t('title1')}
//               {/* <span className="text-primary font-display italic font-normal">{t('title2')}</span> */}
//               <span className="text-primary font-bold">{t('title2')}</span>
//             </h1>

//           </FadeIn>

//           {/* <FadeIn delay={0.2}>
//             <p className="mt-6 text-lg sm:text-xl text-base-content/50 font-light max-w-2xl mx-auto">
//               {t('description')}
//             </p>
//           </FadeIn> */}

//         </div>

//       </section>

//       {/* ═══════════════════════════════════════
//          SECTION FILTRES — Pilules glassmorphisme
//          ═══════════════════════════════════════ */}
//       <section className="px-4 sm:px-6 pb-8">

//         <div className="max-w-6xl mx-auto flex justify-center">

//           <FadeIn delay={0.3}>

//             <div className="flex flex-wrap justify-center gap-2 p-2 sm:p-2.5 rounded-[1.5rem] sm:rounded-full glass mx-auto w-fit max-w-full">

//               {filters.map(({ key, label }) => (
//                 <MagneticButton key={key} active={activeFilter === key} onClick={() => setActiveFilter(key)}>
//                   {label}
//                 </MagneticButton>
//               ))}

//             </div>

//           </FadeIn>

//         </div>

//       </section>

//       {/* ═══════════════════════════════════════
//          SECTION GRILLE — Cartes avec désintégration
//          ═══════════════════════════════════════ */}
//       <section className="px-4 sm:px-6 pb-32">

//         <div className="max-w-6xl mx-auto">

//           <ProjectsGrid
//             projects={filteredProjects}
//             onSelectProject={openModal}
//             isModalOpen={modalState.isOpen}
//           />

//         </div>

//       </section>

//       {/* ═══════════════════════════════════════
//          MODALE SPATIALE — Plein écran
//          ═══════════════════════════════════════ */}
//       <ProjectModal
//         project={modalState.project}
//         isOpen={modalState.isOpen}
//         onClose={closeModal}
//       />

//     </div>

//   );

// }

// /* ── COMPOSANT MAGNÉTIQUE POUR LES FILTRES ── */
// function MagneticButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
//   const ref = useRef<HTMLButtonElement>(null);

//   // Position locale de la souris
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   // Animation fluide (spring) pour l'effet magnétique
//   const magneticX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
//   const magneticY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

//   const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
//     const { clientX, clientY } = e;
//     const { height, width, left, top } = ref.current!.getBoundingClientRect();
//     const middleX = clientX - (left + width / 2);
//     const middleY = clientY - (top + height / 2);
//     x.set(middleX * 0.4); // Force de l'attraction (0.4 = 40% du mouvement)
//     y.set(middleY * 0.4);
//   };

//   const reset = () => {
//     x.set(0);
//     y.set(0);
//   };

//   return (
//     <motion.button
//       ref={ref}
//       onClick={onClick}
//       onMouseMove={handleMouse}
//       onMouseLeave={reset}
//       animate={{ x: 0, y: 0 }}
//       style={{ x: magneticX, y: magneticY }}
//       className={`relative cursor-pointer px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 z-10 ${active ? 'text-[#070510]' : 'text-base-content/60 hover:text-[#F0A500]'
//         }`}
//     >
//       {active && (
//         <motion.div
//           layoutId="activeFilterBg"
//           className="absolute inset-0 bg-gradient-to-r from-[#F0A500] to-[#FFD166] rounded-full shadow-[0_0_20px_rgba(240,165,0,0.4)]"
//           initial={false}
//           transition={{ type: "spring", stiffness: 400, damping: 30 }}
//         />
//       )}
//       <span className="relative z-10">{children}</span>
//     </motion.button>
//   );
// }


























'use client';

/**
 * @file projets/page.tsx
 * @description Page ultra-premium listant l'ensemble des projets réalisés.
 * 
 * @architecture
 * - Component-driven : tous les composants UI sont isolés dans `components/projects/`
 * - Custom Hooks : `useProjectModal` (état modale), `useDisintegrationGrid` (animation grille)
 * - Séparation stricte : données (lib/data), logique (hooks), présentation (components)
 * - i18n : toutes les chaînes via `useTranslations()` — zéro texte en dur
 * - Dark/Light : variables CSS du design system "Void & Or" via Tailwind `dark:` variants
 * 
 * @features
 * 1. Cartes glassmorphisme avec hover 3D et shimmer holographique
 * 2. Animation de désintégration/téléportation toutes les 10 secondes
 * 3. Modale spatiale plein écran avec champ stellaire, carrousel d'images flottant,
 *    pluie de description et cascade inversée de technologies
 *
 * @remarks Direction artistique : « Catalogue ».
 * La page a une seule fonction — permettre de trouver un projet — et un seul
 * moment mémorable : la pastille dorée qui glisse d'un filtre à l'autre
 * (`layoutId`). Toute l'audace est dépensée là. Le reste se tait : plus de halo
 * néon sous la pastille, plus de dégradé sur un élément déjà doré.
 */

import React, { useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import StardustCursor from '@/components/animations/StardustCursor';
import { PROJECTS, PROJECT_CATEGORIES } from '@/lib/data/projects';
import { useProjectModal } from '@/hooks/useProjectModal';
import { ProjectsGrid, ProjectModal } from '@/components/projects';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ TOKENS DE LA PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

/** Clé du filtre « tous les projets ». Extraite : elle apparaissait trois fois en littéral. */
const ALL_FILTER_KEY = '__all__';

/**
 * Force de l'attraction magnétique, en fraction du déplacement du curseur.
 * Ramenée de 0,4 à 0,22 : à 40 % le bouton fuyait le pointeur, ce qui rend la
 * cible difficile à atteindre. À 22 %, il s'incline vers la main sans se dérober.
 */
const MAGNETIC_STRENGTH = 0.22;

/** Ressort du déplacement magnétique — léger, sans oscillation résiduelle. */
const MAGNETIC_SPRING = { stiffness: 170, damping: 18, mass: 0.1 } as const;

/** Ressort de la pastille active partagée entre les filtres (`layoutId`). */
const PILL_SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const;

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function ProjetsPage() {
  /* ── État local : filtre de catégorie ── */
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER_KEY);

  /* ── Hooks personnalisés ── */
  const { modalState, openModal, closeModal } = useProjectModal();

  /* ── Dictionnaires i18n ── */
  const t = useTranslations('projects_page');
  const locale = useLocale();
  const isFrench = locale === 'fr';

  /* ── Filtres dynamiques ── */
  const filters = useMemo(
    () => [{ key: ALL_FILTER_KEY, label: t('filterAll') }, ...PROJECT_CATEGORIES.map((c) => ({ key: c, label: c }))],
    [t]
  );

  /* ── Projets filtrés par catégorie ── */
  const filteredProjects = useMemo(
    () => activeFilter === ALL_FILTER_KEY ? PROJECTS : PROJECTS.filter((p) => p.category === activeFilter),
    [activeFilter]
  );

  /* ── Libellés hors catalogue i18n (aucune clé nouvelle n'est requise) ───── */
  const projectCountLabel = isFrench
    ? `${filteredProjects.length} projet${filteredProjects.length > 1 ? 's' : ''}`
    : `${filteredProjects.length} project${filteredProjects.length > 1 ? 's' : ''}`;

  const emptyTitle = isFrench ? 'Aucun projet dans cette catégorie' : 'No projects in this category';
  const emptyAction = isFrench ? 'Voir tous les projets' : 'View all projects';
  const filtersLabel = isFrench ? 'Filtrer par catégorie' : 'Filter by category';

  return (
    <div className="min-h-screen bg-base-100 text-base-content pt-28 sm:pt-36 relative">
      {/* ── Cursor Stardust Ultra-Premium ── */}
      <StardustCursor />

      {/* ═══════════════════════════════════════
         SECTION HERO — Titre de la page
         ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pb-14">

        <div className="max-w-6xl mx-auto text-center">

          <FadeIn delay={0.1}>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[0.98] tracking-[-0.035em] text-balance">
              {t('title1')}
              <span className="relative inline-block text-primary font-bold">
                {t('title2')}
                {/* Filet dessiné à l'ouverture : il souligne le mot porteur
                    sans recourir au dégradé lumineux, qui brouillait les contours. */}
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.1, delay: 0.45, ease: EASE_OUT_EXPO }}
                  className="absolute -bottom-1 left-0 right-0 h-[2px] origin-left bg-primary/35 rounded-full"
                />
              </span>
            </h1>

          </FadeIn>

        </div>

      </section>

      {/* ═══════════════════════════════════════
         SECTION FILTRES — Pilules glassmorphisme
         ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pb-10">

        <div className="max-w-6xl mx-auto flex flex-col items-center gap-5">

          <FadeIn delay={0.3}>

            <div
              role="group"
              aria-label={filtersLabel}
              className="flex flex-wrap justify-center gap-1.5 p-1.5 sm:p-2 rounded-[1.5rem] sm:rounded-full glass mx-auto w-fit max-w-full"
            >

              {filters.map(({ key, label }) => (
                <MagneticButton key={key} active={activeFilter === key} onClick={() => setActiveFilter(key)}>
                  {label}
                </MagneticButton>
              ))}

            </div>

          </FadeIn>

          {/* Compteur : le filtre doit répondre. Sans lui, cliquer une catégorie
              qui ne change presque rien à la grille ne produit aucun retour lisible. */}
          <FadeIn delay={0.35}>
            <div className="flex items-center gap-2.5 text-base-content/35">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={projectCountLabel}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                  className="text-[11px] font-bold uppercase tracking-[0.24em] tabular-nums"
                >
                  {projectCountLabel}
                </motion.span>
              </AnimatePresence>
            </div>
          </FadeIn>

        </div>

      </section>

      {/* ═══════════════════════════════════════
         SECTION GRILLE — Cartes avec désintégration
         ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pb-32">

        <div className="max-w-6xl mx-auto">

          {filteredProjects.length > 0 ? (
            <ProjectsGrid
              projects={filteredProjects}
              onSelectProject={openModal}
              isModalOpen={modalState.isOpen}
            />
          ) : (
            /* Un écran vide est une invitation à agir, pas un cul-de-sac :
               il nomme ce qui s'est passé et propose la sortie. */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className="mx-auto max-w-md text-center py-20 px-8 rounded-[2rem]
                         border border-dashed border-base-content/[0.14]"
            >
              <p className="text-lg font-bold text-base-content/70 tracking-[-0.02em]">{emptyTitle}</p>
              <button
                onClick={() => setActiveFilter(ALL_FILTER_KEY)}
                className="cursor-pointer mt-6 inline-flex items-center px-6 py-2.5 rounded-full
                           bg-primary text-primary-content text-sm font-bold
                           shadow-[0_1px_2px_rgba(0,0,0,0.14),0_12px_24px_-14px_rgba(0,0,0,0.6)]
                           hover:brightness-[1.06] transition-[filter] duration-300
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
              >
                {emptyAction}
              </button>
            </motion.div>
          )}

        </div>

      </section>

      {/* ═══════════════════════════════════════
         MODALE SPATIALE — Plein écran
         ═══════════════════════════════════════ */}
      <ProjectModal
        project={modalState.project}
        isOpen={modalState.isOpen}
        onClose={closeModal}
      />

    </div>

  );

}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ COMPOSANT MAGNÉTIQUE POUR LES FILTRES
   ───────────────────────────────────────────────────────────────────────────
   Correction : `animate={{ x: 0, y: 0 }}` cohabitait avec
   `style={{ x: magneticX, y: magneticY }}`. Les deux pilotent la même
   transformation — l'animation déclarative luttait en permanence contre le
   ressort, ce qui écrasait l'attraction de façon intermittente. La prop
   `animate` a été retirée : les valeurs de mouvement sont la seule source.
   ═══════════════════════════════════════════════════════════════════════════ */
function MagneticButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Position locale de la souris
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Animation fluide (spring) pour l'effet magnétique
  const magneticX = useSpring(x, MAGNETIC_SPRING);
  const magneticY = useSpring(y, MAGNETIC_SPRING);

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Garde explicite plutôt qu'une assertion non-nulle : le ref peut être vide
    // pendant un démontage concurrent, et l'assertion levait alors une exception.
    const node = ref.current;
    if (!node || shouldReduceMotion) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = node.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * MAGNETIC_STRENGTH); // Force de l'attraction
    y.set(middleY * MAGNETIC_STRENGTH);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      aria-pressed={active}
      style={{ x: magneticX, y: magneticY }}
      className={`relative cursor-pointer px-4 sm:px-6 py-2 sm:py-2.5 rounded-full
                  text-xs sm:text-sm font-bold whitespace-nowrap z-10
                  transition-colors duration-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
                  ${active ? 'text-primary-content' : 'text-base-content/55 hover:text-base-content'}`}
    >
      {active && (
        /* La pastille glisse d'un filtre à l'autre : c'est le seul moment
           spectaculaire de la page, et il porte une information réelle.
           Or plein + ombre de contact — le halo néon d'origine faisait bavure. */
        <motion.div
          layoutId="activeFilterBg"
          className="absolute inset-0 bg-primary rounded-full
                     shadow-[0_1px_2px_rgba(0,0,0,0.18),0_8px_20px_-10px_rgba(0,0,0,0.55)]"
          initial={false}
          transition={PILL_SPRING}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}