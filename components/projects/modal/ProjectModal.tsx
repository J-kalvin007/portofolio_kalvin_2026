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
import { SLUG_MAP } from '@/types/project.types';
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
            className="relative z-10 flex flex-col w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ═══════════════════════════════════════
               HEADER — Titre + Boutons d'action
               ═══════════════════════════════════════ */}
            <motion.header
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center justify-between px-6 sm:px-10 py-6 shrink-0"
            >
              {/* Titre et catégorie */}
              <div>
                <span className="inline-block px-3 py-1 rounded-full
                  bg-[var(--primary)]/20 text-[var(--primary)]
                  text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                  {tData(`${key}.category`)} · {project.year}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {project.title}
                </h2>
              </div>

              {/* Actions : liens + fermeture */}
              <div className="flex items-center gap-3">
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
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t('viewSite')}
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer px-4 py-2 rounded-full border border-white/20
                      text-white/70 text-xs font-bold flex items-center gap-2
                      hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="w-3.5 h-3.5" />
                    {t('sourceCode')}
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('closeModal')}
                  className="cursor-pointer p-2.5 rounded-full bg-white/10 hover:bg-white/20
                    text-white/70 hover:text-white transition-all ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.header>

            {/* ═══════════════════════════════════════
               BODY — Layout 3 colonnes
               [ Description Rain | Image Carousel | Tech Stack Rain ]
               ═══════════════════════════════════════ */}
            <div className="flex-1 flex flex-col md:flex-row items-stretch overflow-visible px-4 sm:px-6 pb-6 gap-4">
              
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
                className="flex-1 flex items-center justify-center min-h-[50vh] md:min-h-0"
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
            <div className="md:hidden px-6 pb-8 space-y-6 overflow-y-auto max-h-[40vh]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
                  Description
                </h3>
                <p className="text-sm text-white/60 leading-relaxed font-display italic">
                  {fullDescription}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
                  {t('technologies')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 rounded-full bg-white/10 text-white/60
                      text-xs font-mono font-bold uppercase tracking-wider">
                      {tech}
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
