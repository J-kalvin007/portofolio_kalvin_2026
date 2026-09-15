// 'use client';

// /**
//  * @file ProjectModal.tsx
//  * @description Modale spatiale plein écran pour l'affichage détaillé d'un projet.
//  * 
//  * @architecture
//  * Layout 3 colonnes :
//  * - GAUCHE  : DescriptionRain — texte défilant de haut en bas (effet pluie)
//  * - CENTRE  : ImageCarousel — images flottantes en anti-gravité dans un cadre ovale morphing
//  * - DROITE  : TechStackRain — icônes SVG défilant de bas en haut (direction inversée)
//  * 
//  * @backdrop
//  * - Fond spatial noir avec champ stellaire animé (800+ étoiles, 3 couches parallax)
//  * - Nébuleuses pulsantes en arrière-plan
//  * 
//  * @interactions
//  * - Fermeture : clic extérieur, touche Escape, bouton X
//  * - Navigation images : swipe horizontal, flèches clavier
//  * - Responsive : layout empilé sur mobile (< 768px)
//  * 
//  * @accessibility
//  * - role="dialog", aria-modal, aria-label
//  * - Focus trap implicite (body scroll lock via useProjectModal)
//  * - Navigation clavier complète
//  */

// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X, ExternalLink, Github } from 'lucide-react';
// import { useTranslations } from 'next-intl';
// import type { Project } from '@/lib/data/projects';
// import { SLUG_MAP, TECH_SVG_MAP_CARD } from '@/types/project.types';
// import StarField from './StarField';
// import ImageCarousel from './ImageCarousel';
// import DescriptionRain from './DescriptionRain';
// import TechStackRain from './TechStackRain';

// interface ProjectModalProps {
//   /** Projet à afficher (null si modale fermée) */
//   project: Project | null;
//   /** Si true, la modale est visible */
//   isOpen: boolean;
//   /** Callback de fermeture */
//   onClose: () => void;
// }

// export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
//   const t = useTranslations('projects_page');
//   const tData = useTranslations('projects_data');

//   if (!project) return null;

//   const key = SLUG_MAP[project.slug] || 'challenger';
//   const fullDescription = tData(`${key}.full`);

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.5 }}
//           className="fixed inset-0 z-50 overflow-hidden"
//           role="dialog"
//           aria-modal="true"
//           aria-label={`${t('projectDetails')} : ${project.title}`}
//           onClick={onClose}
//         >
//           {/* ── Fond Spatial Étoilé ── */}
//           <StarField />

//           {/* ── Couche de contenu (empêche la propagation du clic) ── */}
//           <div
//             className="relative z-10 flex flex-col w-full h-full overflow-y-auto md:overflow-hidden"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* ═══════════════════════════════════════
//                HEADER — Titre + Boutons d'action
//                ═══════════════════════════════════════ */}
//             <motion.header
//               initial={{ y: -30, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ delay: 0.3, duration: 0.5 }}
//               className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 sm:px-10 pt-6 pb-2 md:py-6 shrink-0 gap-4 md:gap-0"
//             >
//               {/* Titre et catégorie */}
//               <div className="w-full flex justify-between items-start md:w-auto md:block">
//                 <div>
//                   <span className="inline-block px-3 py-1 rounded-full
//                     bg-[var(--primary)]/20 text-[var(--primary)]
//                     text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
//                     {tData(`${key}.category`)} · {project.year}
//                   </span>
//                   <h2 className="text-2xl sm:text-3xl font-bold text-base-content dark:text-white tracking-tight">
//                     {project.title}
//                   </h2>
//                 </div>
//                 {/* Bouton de fermeture sur mobile (en haut à droite) */}
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   aria-label={t('closeModal')}
//                   className="md:hidden cursor-pointer p-2.5 rounded-full bg-base-content/5 hover:bg-base-content/10 dark:bg-white/10 dark:hover:bg-white/20
//                     text-base-content/70 dark:text-white/70 hover:text-base-content dark:hover:text-white transition-all shrink-0"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Actions : liens + fermeture (sur desktop) */}
//               <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
//                 {project.liveUrl && (
//                   <a
//                     href={project.liveUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="cursor-pointer px-4 py-2 rounded-full bg-[var(--primary)] text-black
//                       text-xs font-bold flex items-center gap-2
//                       hover:shadow-[0_0_20px_var(--primary)] transition-shadow"
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     <ExternalLink className="w-3.5 h-3.5 shrink-0" />
//                     <span>{t('viewSite')}</span>
//                   </a>
//                 )}
//                 {project.githubUrl && (
//                   <a
//                     href={project.githubUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="cursor-pointer px-4 py-2 rounded-full border border-base-content/20 dark:border-white/20
//                       text-base-content/70 dark:text-white/70 text-xs font-bold flex items-center gap-2
//                       hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-all"
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     <Github className="w-3.5 h-3.5 shrink-0" />
//                     <span>{t('sourceCode')}</span>
//                   </a>
//                 )}
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   aria-label={t('closeModal')}
//                   className="hidden md:flex cursor-pointer p-2.5 rounded-full bg-base-content/5 hover:bg-base-content/10 dark:bg-white/10 dark:hover:bg-white/20
//                     text-base-content/70 dark:text-white/70 hover:text-base-content dark:hover:text-white transition-all ml-2 shrink-0"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </motion.header>

//             {/* ═══════════════════════════════════════
//                BODY — Layout 3 colonnes
//                [ Description Rain | Image Carousel | Tech Stack Rain ]
//                ═══════════════════════════════════════ */}
//             <div className="shrink-0 md:flex-1 flex flex-col md:flex-row items-stretch overflow-visible px-4 sm:px-6 pb-6 gap-4">

//               {/* ── GAUCHE : Pluie de description (défilement ↓) ── */}
//               <motion.div
//                 initial={{ x: -60, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.5, duration: 0.6 }}
//                 className="hidden md:block md:w-1/4 lg:w-[22%] h-[70vh]"
//               >
//                 <DescriptionRain description={fullDescription} />
//               </motion.div>

//               {/* ── CENTRE : Carrousel d'images flottant ── */}
//               <motion.div
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
//                 className="w-full md:flex-1 flex items-center justify-center min-h-[40vh] md:min-h-0 py-4 md:py-0"
//               >
//                 <ImageCarousel images={project.images} title={project.title} />
//               </motion.div>

//               {/* ── DROITE : Pluie de technologies (défilement ↑) ── */}
//               <motion.div
//                 initial={{ x: 60, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.5, duration: 0.6 }}
//                 className="hidden md:block md:w-1/4 lg:w-[22%] h-[70vh]"
//               >
//                 <TechStackRain techStack={project.techStack} />
//               </motion.div>
//             </div>

//             {/* ── MOBILE : Description + Tech sous l'image ── */}
//             <div className="md:hidden px-6 pb-12 space-y-8 shrink-0">
//               <div>
//                 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
//                   Description
//                 </h3>
//                 <p className="text-sm text-base-content/80 dark:text-white/80 leading-relaxed font-display italic">
//                   {fullDescription}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
//                   {t('technologies')}
//                 </h3>
//                 <div className="flex flex-wrap gap-2">
//                   {project.techStack.map((tech) => (
//                     <span key={tech} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-content/5 dark:bg-white/10 border border-base-content/10 dark:border-white/5 text-base-content/80 dark:text-white/80
//                       text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
//                       {TECH_SVG_MAP_CARD[tech] && (
//                         <img src={TECH_SVG_MAP_CARD[tech]} alt={tech} className="w-3.5 h-3.5" />
//                       )}
//                       <span>{tech}</span>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }












'use client';

/**
 * @file ProjectModal.tsx
 * @description Modale spatiale plein écran pour l'affichage détaillé d'un projet.
 * 
 * @architecture
 * Layout 3 colonnes :
 * - GAUCHE  : DescriptionRain — texte défilant de haut en bas (effet pluie)
 * - CENTRE  : ImageCarousel — images flottantes en anti-gravité dans un cadre ovale morphing
 * - DROITE  : TechStackRain — icônes SVG défilant de bas en haut (direction inversée)
 * 
 * @backdrop
 * - Fond spatial noir avec champ stellaire animé (800+ étoiles, 3 couches parallax)
 * - Nébuleuses pulsantes en arrière-plan
 * 
 * @interactions
 * - Fermeture : clic extérieur, touche Escape, bouton X
 * - Navigation images : swipe horizontal, flèches clavier
 * - Responsive : layout empilé sur mobile (< 768px)
 * 
 * @accessibility
 * - role="dialog", aria-modal, aria-label
 * - Piège de focus explicite, restitution du focus à la fermeture
 * - Navigation clavier complète
 *
 * @remarks Le bloc `@interactions` décrivait deux comportements qui n'existaient
 * pas dans le code.
 *
 * **La touche Échap n'était écoutée nulle part.** Aucun `keydown` n'était posé.
 * Si `useProjectModal` s'en charge déjà de son côté, le gestionnaire ajouté ici
 * est redondant mais inoffensif — les deux appellent `onClose`.
 *
 * **Le clic extérieur ne pouvait pas fonctionner.** `onClick={onClose}` était posé
 * sur la racine, mais la couche de contenu qui la recouvre — `w-full h-full` —
 * arrêtait la propagation sur toute la surface de l'écran. Il n'existait
 * littéralement aucun pixel « extérieur » à cliquer. La logique est inversée :
 * la fermeture est portée par la couche de contenu, et seuls les blocs réellement
 * porteurs d'information arrêtent la propagation.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Project } from '@/lib/data/projects';
import { SLUG_MAP, TECH_SVG_MAP_CARD } from '@/types/project.types';
import StarField from './StarField';
import ImageCarousel from './ImageCarousel';
import DescriptionRain from './DescriptionRain';
import TechStackRain from './TechStackRain';

interface ProjectModalProps {
  /** Projet à afficher (null si modale fermée) */
  project: Project | null;
  /** Si true, la modale est visible */
  isOpen: boolean;
  /** Callback de fermeture */
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const t = useTranslations('projects_page');
  const tData = useTranslations('projects_data');

  const dialogRef = useRef<HTMLDivElement>(null);

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ CLAVIER — fermeture et confinement du focus
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      // Sans piège de focus, la tabulation quitte la modale dès le dernier
      // bouton et parcourt la grille de projets masquée derrière — hors champ,
      // sans que rien ne l'indique.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  /* ── Prise de focus à l'ouverture, restitution à la fermeture ──────────── */
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });

    return () => previouslyFocused?.focus?.({ preventScroll: true });
  }, [isOpen]);

  /** Empêche un clic sur un bloc de contenu de refermer la modale. */
  const stopClose = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  if (!project) return null;

  const key = SLUG_MAP[project.slug] || 'challenger';
  const fullDescription = tData(`${key}.full`);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-50 overflow-hidden outline-none"
          role="dialog"
          aria-modal="true"
          aria-label={`${t('projectDetails')} : ${project.title}`}
          tabIndex={-1}
          ref={dialogRef}
        >
          {/* ── Fond Spatial Étoilé ── */}
          <StarField />

          {/* ── Couche de contenu ──
              C'est elle qui porte désormais la fermeture au clic : les zones
              vides autour du carrousel referment la modale, les blocs de contenu
              arrêtent la propagation. */}
          <div
            className="relative z-10 flex flex-col w-full h-full overflow-y-auto md:overflow-hidden"
            onClick={onClose}
          >
            {/* ═══════════════════════════════════════
               HEADER — Titre + Boutons d'action
               ═══════════════════════════════════════ */}
            <motion.header
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              onClick={stopClose}
              className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 sm:px-10 pt-6 pb-2 md:py-6 shrink-0 gap-4 md:gap-0"
            >
              {/* Titre et catégorie */}
              <div className="w-full flex justify-between items-start md:w-auto md:block">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full
                    bg-[var(--primary)]/20 text-[var(--primary)]
                    text-[10px] font-bold uppercase tracking-[0.2em] mb-2 tabular-nums">
                    {tData(`${key}.category`)} · {project.year}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-base-content dark:text-white tracking-[-0.03em]">
                    {project.title}
                  </h2>
                </div>
                {/* Bouton de fermeture sur mobile (en haut à droite) */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('closeModal')}
                  className="md:hidden cursor-pointer p-2.5 rounded-full bg-base-content/5 hover:bg-base-content/10 dark:bg-white/10 dark:hover:bg-white/20
                    text-base-content/70 dark:text-white/70 hover:text-base-content dark:hover:text-white transition-colors shrink-0
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Actions : liens + fermeture (sur desktop) */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    /* `text-black` était codé en dur : en mode clair, l'encre de
                       marque est blanche. Le token `text-primary-content` — rendu
                       fonctionnel par l'ajout de `--color-primary-content` dans
                       `@theme` — s'en charge. */
                    className="cursor-pointer px-4 py-2 rounded-full bg-[var(--primary)] text-primary-content
                      text-xs font-bold flex items-center gap-2
                      shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_20px_-12px_rgba(0,0,0,0.7)]
                      hover:brightness-[1.08] transition-[filter] duration-300
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{t('viewSite')}</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer px-4 py-2 rounded-full border border-base-content/20 dark:border-white/20
                      text-base-content/70 dark:text-white/70 text-xs font-bold flex items-center gap-2
                      hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                  >
                    <Github className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{t('sourceCode')}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('closeModal')}
                  className="hidden md:flex cursor-pointer p-2.5 rounded-full bg-base-content/5 hover:bg-base-content/10 dark:bg-white/10 dark:hover:bg-white/20
                    text-base-content/70 dark:text-white/70 hover:text-base-content dark:hover:text-white transition-colors ml-2 shrink-0
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </motion.header>

            {/* ═══════════════════════════════════════
               BODY — Layout 3 colonnes
               [ Description Rain | Image Carousel | Tech Stack Rain ]
               ═══════════════════════════════════════ */}
            <div className="shrink-0 md:flex-1 flex flex-col md:flex-row items-stretch overflow-visible px-4 sm:px-6 pb-6 gap-4">

              {/* ── GAUCHE : Pluie de description (défilement ↓) ── */}
              <motion.div
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                onClick={stopClose}
                className="hidden md:block md:w-1/4 lg:w-[22%] h-[70vh]"
              >
                <DescriptionRain description={fullDescription} />
              </motion.div>

              {/* ── CENTRE : Carrousel d'images flottant ── */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={stopClose}
                className="w-full md:flex-1 flex items-center justify-center min-h-[40vh] md:min-h-0 py-4 md:py-0"
              >
                <ImageCarousel images={project.images} title={project.title} />
              </motion.div>

              {/* ── DROITE : Pluie de technologies (défilement ↑) ── */}
              <motion.div
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                onClick={stopClose}
                className="hidden md:block md:w-1/4 lg:w-[22%] h-[70vh]"
              >
                <TechStackRain techStack={project.techStack} />
              </motion.div>
            </div>

            {/* ── MOBILE : Description + Tech sous l'image ── */}
            <div className="md:hidden px-6 pb-12 space-y-8 shrink-0" onClick={stopClose}>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
                  Description
                </h3>
                <p className="text-sm text-base-content/80 dark:text-white/80 leading-[1.7] font-display italic text-pretty">
                  {fullDescription}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
                  {t('technologies')}
                </h3>
                <ul className="flex flex-wrap gap-2 list-none p-0">
                  {project.techStack.map((tech) => (
                    <li key={tech} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-content/5 dark:bg-white/10 border border-base-content/10 dark:border-white/5 text-base-content/80 dark:text-white/80
                      text-xs font-mono font-bold uppercase tracking-wider">
                      {TECH_SVG_MAP_CARD[tech] && (
                        /* `alt={tech}` doublait le nom déjà présent dans le
                           `<span>` voisin : un lecteur d'écran annonçait chaque
                           technologie deux fois de suite. */
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={TECH_SVG_MAP_CARD[tech]} alt="" aria-hidden="true" width={14} height={14} className="w-3.5 h-3.5" />
                      )}
                      <span>{tech}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}