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
 * - Focus trap implicite (body scroll lock via useProjectModal)
 * - Navigation clavier complète
 */

import React from 'react';
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
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label={`${t('projectDetails')} : ${project.title}`}
          onClick={onClose}
        >
          {/* ── Fond Spatial Étoilé ── */}
          <StarField />

          {/* ── Couche de contenu (empêche la propagation du clic) ── */}
          <div
            className="relative z-10 flex flex-col w-full h-full overflow-y-auto md:overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ═══════════════════════════════════════
               HEADER — Titre + Boutons d'action
               ═══════════════════════════════════════ */}
            <motion.header
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 sm:px-10 pt-6 pb-2 md:py-6 shrink-0 gap-4 md:gap-0"
            >
              {/* Titre et catégorie */}
              <div className="w-full flex justify-between items-start md:w-auto md:block">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full
                    bg-[var(--primary)]/20 text-[var(--primary)]
                    text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                    {tData(`${key}.category`)} · {project.year}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-base-content dark:text-white tracking-tight">
                    {project.title}
                  </h2>
                </div>
                {/* Bouton de fermeture sur mobile (en haut à droite) */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('closeModal')}
                  className="md:hidden cursor-pointer p-2.5 rounded-full bg-base-content/5 hover:bg-base-content/10 dark:bg-white/10 dark:hover:bg-white/20
                    text-base-content/70 dark:text-white/70 hover:text-base-content dark:hover:text-white transition-all shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions : liens + fermeture (sur desktop) */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer px-4 py-2 rounded-full bg-[var(--primary)] text-black
                      text-xs font-bold flex items-center gap-2
                      hover:shadow-[0_0_20px_var(--primary)] transition-shadow"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
                      hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('sourceCode')}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('closeModal')}
                  className="hidden md:flex cursor-pointer p-2.5 rounded-full bg-base-content/5 hover:bg-base-content/10 dark:bg-white/10 dark:hover:bg-white/20
                    text-base-content/70 dark:text-white/70 hover:text-base-content dark:hover:text-white transition-all ml-2 shrink-0"
                >
                  <X className="w-5 h-5" />
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
                transition={{ delay: 0.5, duration: 0.6 }}
                className="hidden md:block md:w-1/4 lg:w-[22%] h-[70vh]"
              >
                <DescriptionRain description={fullDescription} />
              </motion.div>

              {/* ── CENTRE : Carrousel d'images flottant ── */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full md:flex-1 flex items-center justify-center min-h-[40vh] md:min-h-0 py-4 md:py-0"
              >
                <ImageCarousel images={project.images} title={project.title} />
              </motion.div>

              {/* ── DROITE : Pluie de technologies (défilement ↑) ── */}
              <motion.div
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="hidden md:block md:w-1/4 lg:w-[22%] h-[70vh]"
              >
                <TechStackRain techStack={project.techStack} />
              </motion.div>
            </div>

            {/* ── MOBILE : Description + Tech sous l'image ── */}
            <div className="md:hidden px-6 pb-12 space-y-8 shrink-0">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
                  Description
                </h3>
                <p className="text-sm text-base-content/80 dark:text-white/80 leading-relaxed font-display italic">
                  {fullDescription}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
                  {t('technologies')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-content/5 dark:bg-white/10 border border-base-content/10 dark:border-white/5 text-base-content/80 dark:text-white/80
                      text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                      {TECH_SVG_MAP_CARD[tech] && (
                        <img src={TECH_SVG_MAP_CARD[tech]} alt={tech} className="w-3.5 h-3.5" />
                      )}
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
