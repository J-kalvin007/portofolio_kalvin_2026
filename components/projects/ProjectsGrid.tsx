'use client';

/**
 * @file ProjectsGrid.tsx
 * @description Grille orchestratrice des cartes projet.
 * 
 * @architecture
 * - Affiche la liste des projets filtrés.
 * - Confie l'animation de désintégration directement à chaque `ProjectCard`.
 * - `AnimatePresence` + `layout` pour les transitions de filtre fluides.
 */

import React, { useRef, useState } from 'react';
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.project-card-spotlight');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <motion.div
      ref={gridRef}
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredIndex(null)}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
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
