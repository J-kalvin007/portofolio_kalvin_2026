// 'use client';

// /**
//  * @file ProjectsGrid.tsx
//  * @description Grille orchestratrice des cartes projet.
//  * 
//  * @architecture
//  * - Affiche la liste des projets filtrés.
//  * - Confie l'animation de désintégration directement à chaque `ProjectCard`.
//  * - `AnimatePresence` + `layout` pour les transitions de filtre fluides.
//  */

// import React, { useRef, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import type { Project } from '@/lib/data/projects';
// import ProjectCard from './ProjectCard';

// interface ProjectsGridProps {
//   /** Liste filtrée des projets à afficher */
//   projects: Project[];
//   /** Callback quand un projet est sélectionné */
//   onSelectProject: (project: Project) => void;
//   /** Si true, pause les animations (modale ouverte) - Ignoré dans la nouvelle architecture */
//   isModalOpen: boolean;
// }

// export default function ProjectsGrid({ projects, onSelectProject }: ProjectsGridProps) {
//   const gridRef = useRef<HTMLDivElement>(null);
//   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!gridRef.current) return;
//     const cards = gridRef.current.querySelectorAll('.project-card-spotlight');
//     for (const card of cards) {
//       const rect = card.getBoundingClientRect();
//       const x = e.clientX - rect.left;
//       const y = e.clientY - rect.top;
//       (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
//       (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
//     }
//   };

//   return (
//     <motion.div
//       ref={gridRef}
//       layout
//       onMouseMove={handleMouseMove}
//       onMouseLeave={() => setHoveredIndex(null)}
//       className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
//     >
//       <AnimatePresence mode="popLayout">
//         {projects.map((project, index) => (
//           <ProjectCard
//             key={project.slug}
//             project={project}
//             onSelect={onSelectProject}
//             index={index}
//             isDimmed={hoveredIndex !== null && hoveredIndex !== index}
//             onMouseEnter={() => setHoveredIndex(index)}
//             onMouseLeave={() => setHoveredIndex(null)}
//           />
//         ))}
//       </AnimatePresence>
//     </motion.div>
//   );
// }



















'use client';

/**
 * @file ProjectsGrid.tsx
 * @description Grille orchestratrice des cartes projet.
 * 
 * @architecture
 * - Affiche la liste des projets filtrés.
 * - Confie l'animation de désintégration directement à chaque `ProjectCard`.
 * - `AnimatePresence` + `layout` pour les transitions de filtre fluides.
 *
 * @remarks Deux correctifs majeurs, détaillés à leur emplacement :
 *  1. la classe `group/grid` manquait — les deux calques de halo de `ProjectCard`
 *     étaient conditionnés à `group-hover/grid:opacity-100` et ne se sont donc
 *     jamais affichés ;
 *  2. le suivi du curseur mesurait chaque carte à chaque mouvement de souris,
 *     forçant autant de recalculs de mise en page synchrones.
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '@/lib/data/projects';
import ProjectCard from './ProjectCard';

interface ProjectsGridProps {
  /** Liste filtrée des projets à afficher */
  projects: Project[];
  /** Callback quand un projet est sélectionné */
  onSelectProject: (project: Project) => void;
  /** Si true, pause les animations (modale ouverte) - Ignoré dans la nouvelle architecture */
  isModalOpen: boolean;
}

export default function ProjectsGrid({ projects, onSelectProject }: ProjectsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  /**
   * Rectangles des cartes, mis en cache.
   *
   * L'implémentation précédente appelait `getBoundingClientRect()` sur chaque
   * carte à chaque `mousemove`. Cette méthode force un recalcul de mise en page
   * synchrone : avec neuf cartes et un pointeur qui produit une soixantaine
   * d'événements par seconde, cela représentait plus de cinq cents recalculs
   * forcés par seconde — le poste de dépense principal de la page.
   *
   * Les rectangles ne changent qu'au redimensionnement, au défilement et lors
   * d'un changement de filtre : on les mesure à ces moments-là, une seule fois.
   */
  const cardRectsRef = useRef<Array<{ element: HTMLElement; rect: DOMRect }>>([]);
  const frameRef = useRef<number | null>(null);

  const measureCards = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>('.project-card-spotlight');
    cardRectsRef.current = Array.from(cards, (element) => ({ element, rect: element.getBoundingClientRect() }));
  }, []);

  // `useLayoutEffect` : la mesure doit précéder le premier repaint, sinon le
  // halo reste ancré à l'origine tant que le pointeur n'a pas bougé.
  useLayoutEffect(() => {
    measureCards();
  }, [measureCards, projects]);

  useEffect(() => {
    const handleInvalidate = () => measureCards();

    window.addEventListener('resize', handleInvalidate);
    window.addEventListener('scroll', handleInvalidate, { passive: true });

    return () => {
      window.removeEventListener('resize', handleInvalidate);
      window.removeEventListener('scroll', handleInvalidate);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [measureCards]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;

    // Une seule écriture de styles par image affichée, jamais plus.
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;

      for (const { element, rect } of cardRectsRef.current) {
        element.style.setProperty('--mouse-x', `${clientX - rect.left}px`);
        element.style.setProperty('--mouse-y', `${clientY - rect.top}px`);
      }
    });
  };

  return (
    <motion.div
      ref={gridRef}
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredIndex(null)}
      /* `group/grid` : c'est la pièce manquante. Les deux calques de halo de
         `ProjectCard` sont conditionnés à `group-hover/grid:opacity-100`, un
         sélecteur qui ne peut se résoudre que si un ancêtre porte `group/grid`.
         Aucun ne le portait : les deux effets restaient invisibles, alors même
         que les variables `--mouse-x` / `--mouse-y` étaient correctement mises
         à jour juste au-dessus. */
      className="group/grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
    >
      <AnimatePresence mode="popLayout">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            onSelect={onSelectProject}
            index={index}
            isDimmed={hoveredIndex !== null && hoveredIndex !== index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}