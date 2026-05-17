'use client';

/**
 * @file ProjectCard.tsx
 * @description Carte projet ultra-premium avec glassmorphisme multi-couches.
 * 
 * @design
 * - Glassmorphism tier : backdrop-blur-2xl, surfaces translucides avec fuites de lumière colorées
 * - Hover 3D : tilt subtil avec useMotionValue + useTransform (perspective)
 * - Shimmer holographique sur l'image au survol
 * - Bordure chromatic glow animée
 * - CTA magnétique avec slide-in au survol
 * 
 * @animation Masterclass Disintegration Mix :
 * 1. Scroll Reveal : Se reforme en entrant dans le viewport
 * 2. Filter Change : Se désintègre avant de disparaître
 * 3. Click : Se désintègre pour s'ouvrir
 * 
 * @dark_mode Adapté automatiquement via les variables CSS du design system "Void & Or"
 * @light_mode Verre dépoli sur dégradé doux, ultra-clean
 */

import React, { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, useSpring, usePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Project } from '@/lib/data/projects';
import { SLUG_MAP, TECH_SVG_MAP_CARD } from '@/types/project.types';
import DisintegrationOverlay from './DisintegrationOverlay';
import type { DisintegrationPhase } from '@/types/project.types';

interface ProjectCardProps {
  /** Données du projet à afficher */
  project: Project;
  /** Callback déclenché au clic sur la carte */
  onSelect: (project: Project) => void;
  /** Index pour le stagger d'animation */
  index: number;
  /** Indique si la carte doit être floutée/réduite (quand une autre carte est survolée) */
  isDimmed?: boolean;
  /** Callback quand la souris entre sur la carte */
  onMouseEnter?: () => void;
  /** Callback quand la souris quitte la carte */
  onMouseLeave?: () => void;
}

/**
 * @component ProjectCard
 * Carte individuelle avec glassmorphisme, 3D tilt hover et shimmer holographique.
 */
const ProjectCard = React.memo(function ProjectCard({ project, onSelect, index, isDimmed, onMouseEnter, onMouseLeave }: ProjectCardProps) {
  const tData = useTranslations('projects_data');
  const t = useTranslations('projects_page');
  const key = SLUG_MAP[project.slug] || 'challenger';

  /* ── Masterclass Disintegration Logic ── */
  const [isPresent, safeToRemove] = usePresence();
  const [localPhase, setLocalPhase] = useState<DisintegrationPhase>('idle');
  const [hasRevealed, setHasRevealed] = useState(false);

  // 1. Unmount (Changement de Filtre) : La carte se désintègre avant de disparaître
  useEffect(() => {
    if (!isPresent) {
      setLocalPhase('disintegrating');
      const timer = setTimeout(() => {
        safeToRemove();
      }, 500); // Durée de l'animation CSS des cubes
      return () => clearTimeout(timer);
    }
  }, [isPresent, safeToRemove]);

  // 2. Scroll Reveal : La carte se reforme lorsqu'elle entre à l'écran
  const handleViewportEnter = useCallback(() => {
    if (!hasRevealed) {
      setHasRevealed(true);
      setLocalPhase('reforming');
      setTimeout(() => setLocalPhase('idle'), 500);
    }
  }, [hasRevealed]);

  // 3. Click (Portal Effect) : La carte se désintègre pour s'ouvrir
  const handleClick = useCallback(() => {
    setLocalPhase('disintegrating');
    setTimeout(() => {
      onSelect(project);
      setLocalPhase('idle'); // Réinitialisation silencieuse
    }, 450); // Un peu plus rapide que l'animation pour plus de fluidité
  }, [onSelect, project]);

  /* ── 3D Tilt Effect via MotionValues ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transformation des coordonnées souris en rotation 3D (subtile : ±4°)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 });

  /** Calcule la position relative de la souris sur la carte (normalisée -0.5 → 0.5) */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  /** Réinitialise le tilt quand la souris quitte la carte */
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    if (onMouseLeave) onMouseLeave();
  }, [mouseX, mouseY, onMouseLeave]);

  return (
    <motion.div
      layout
      layoutId={`project-card-${project.slug}`}
      initial={{ opacity: 0, y: 100, rotateX: 30, scale: 0.9, translateZ: -100 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1, translateZ: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      onViewportEnter={handleViewportEnter}
      transition={{ duration: 0.8, type: 'spring', bounce: 0.4, delay: index * 0.1 }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className={`group relative cursor-pointer project-card-spotlight transition-all duration-700 ease-out ${
        isDimmed ? 'opacity-40 scale-[0.96] grayscale-[50%] blur-[2px]' : 'opacity-100 scale-100 grayscale-0 blur-0'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${t('viewProject')} : ${project.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      {/* ── Spotlight Global Hover Glow ── */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover/grid:opacity-100 z-50 mix-blend-screen"
        style={{
          background: `radial-gradient(500px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(240,165,0,0.12), transparent 40%)`
        }}
      />
      {/* ── Spotlight Global Hover Border ── */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover/grid:opacity-100 z-50"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(240,165,0,0.8), transparent 40%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px'
        }}
      />

      {/* ── Overlay de Désintégration Local ── */}
      <DisintegrationOverlay phase={localPhase} cardIndex={index} />

      {/* ── Conteneur Glassmorphisme ── */}
      <div className={`relative rounded-2xl overflow-hidden
        bg-white/[0.45] dark:bg-white/[0.03]
        backdrop-blur-2xl
        border border-black/[0.06] dark:border-white/[0.08]
        shadow-lg shadow-black/[0.04] dark:shadow-black/[0.3]
        transition-all duration-500 ease-out
        group-hover:border-[var(--primary)]/30
        group-hover:shadow-[0_0_40px_-10px_var(--glow-color-strong),0_20px_60px_-20px_rgba(0,0,0,0.3)]
        group-hover:-translate-y-3 group-hover:scale-[1.02]
        ${localPhase === 'disintegrating' ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'}
      `}>
        {/* ── Lumière colorée interne (light leak) ── */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)] opacity-[0.06]" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_70%)] opacity-[0.04]" />
        </div>

        {/* ── Image Thumbnail (16:9) ── */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Dégradé bas → lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#070510] via-transparent to-transparent opacity-70" />

          {/* ── Shimmer Holographique au hover ── */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
            bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.15)_45%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.15)_55%,transparent_70%)]
            dark:bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.08)_45%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.08)_55%,transparent_70%)]
            animate-[shimmer_2s_ease-in-out_infinite]
          " />

          {/* Badge catégorie */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 rounded-full bg-[var(--primary)]/20 backdrop-blur-md text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
              {tData(`${key}.category`)}
            </span>
          </div>

          {/* Badge année */}
          <div className="absolute top-4 right-4 z-10">
            <span className="px-2.5 py-1 rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md text-white/80 text-[10px] font-mono font-bold tracking-wider">
              {project.year}
            </span>
          </div>
        </div>

        {/* ── Corps de la carte ── */}
        <div className="relative p-6 z-10">
          {/* Titre avec gradient subtil */}
          <h3 className="font-bold text-lg text-base-content mb-2 group-hover:text-gradient transition-colors duration-300 tracking-tight">
            {project.title}
          </h3>

          {/* Description courte */}
          <p className="text-sm text-base-content/50 leading-relaxed line-clamp-2 mb-4">
            {tData(`${key}.short`)}
          </p>

          {/* ── Stack technique (SVG icons row) ── */}
          <div className="flex items-center gap-2 mb-4">
            {project.techStack.slice(0, 4).map((tech) => {
              const svgPath = TECH_SVG_MAP_CARD[tech];
              return svgPath ? (
                <div key={tech} className="w-5 h-5 relative opacity-50 group-hover:opacity-80 transition-opacity" title={tech}>
                  <Image src={svgPath} alt={tech} fill className="object-contain dark:invert-[0.15]" />
                </div>
              ) : (
                <span key={tech} className="text-[9px] font-bold uppercase tracking-wider text-base-content/30 px-1.5 py-0.5 rounded bg-base-200/50 dark:bg-white/5">
                  {tech}
                </span>
              );
            })}
            {project.techStack.length > 4 && (
              <span className="text-[10px] font-mono text-base-content/30">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>

          {/* ── CTA Ghost Button — Effet magnétique ── */}
          <div className="overflow-hidden">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em]
                text-base-content/40 group-hover:text-[var(--primary)] transition-colors duration-500"
            >
              <span>{t('viewProject')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ProjectCard;
