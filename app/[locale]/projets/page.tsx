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
 */

import React, { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import { PROJECTS, PROJECT_CATEGORIES } from '@/lib/data/projects';
import { useProjectModal } from '@/hooks/useProjectModal';
import { ProjectsGrid, ProjectModal } from '@/components/projects';

export default function ProjetsPage() {
  /* ── État local : filtre de catégorie ── */
  const [activeFilter, setActiveFilter] = useState<string>('__all__');

  /* ── Hooks personnalisés ── */
  const { modalState, openModal, closeModal } = useProjectModal();

  /* ── Dictionnaires i18n ── */
  const t = useTranslations('projects_page');

  /* ── Filtres dynamiques ── */
  const filters = useMemo(
    () => [{ key: '__all__', label: t('filterAll') }, ...PROJECT_CATEGORIES.map((c) => ({ key: c, label: c }))],
    [t]
  );

  /* ── Projets filtrés par catégorie ── */
  const filteredProjects = useMemo(
    () => activeFilter === '__all__' ? PROJECTS : PROJECTS.filter((p) => p.category === activeFilter),
    [activeFilter]
  );

  return (
    <div className="min-h-screen bg-base-100 text-base-content pt-28 sm:pt-36">

      {/* ═══════════════════════════════════════
         SECTION HERO — Titre de la page
         ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto text-center">

          {/* <FadeIn>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-primary/[0.08] border border-primary/15
              text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-3.5 h-3.5" /> {t('badge')}
            </span>
          </FadeIn> */}

          <FadeIn delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-base-content leading-[0.95] tracking-tight">
              {t('title1')}
              <span className="text-primary font-display italic font-normal">{t('title2')}</span>
            </h1>
          </FadeIn>
          {/* <FadeIn delay={0.2}>
            <p className="mt-6 text-lg sm:text-xl text-base-content/50 font-light max-w-2xl mx-auto">
              {t('description')}
            </p>
          </FadeIn> */}
        </div>
      </section>

      {/* ═══════════════════════════════════════
         SECTION FILTRES — Pilules glassmorphisme
         ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto flex justify-center">
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap justify-center gap-2 p-2 sm:p-2.5 rounded-[1.5rem] sm:rounded-full glass mx-auto w-fit max-w-full">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`cursor-pointer px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${activeFilter === key
                    ? 'bg-primary text-primary-content shadow-lg shadow-primary/20'
                    : 'text-base-content/50 hover:text-base-content hover:bg-base-200/50'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         SECTION GRILLE — Cartes avec désintégration
         ═══════════════════════════════════════ */}
      <section className="px-4 sm:px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <ProjectsGrid
            projects={filteredProjects}
            onSelectProject={openModal}
            isModalOpen={modalState.isOpen}
          />
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
