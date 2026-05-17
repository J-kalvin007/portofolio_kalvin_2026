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

import React, { useState, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import StardustCursor from '@/components/animations/StardustCursor';
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
    <div className="min-h-screen bg-base-100 text-base-content pt-28 sm:pt-36 relative">
      {/* ── Cursor Stardust Ultra-Premium ── */}
      <StardustCursor />

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

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[0.95] tracking-tight">
              {t('title1')}
              {/* <span className="text-primary font-display italic font-normal">{t('title2')}</span> */}
              <span className="text-primary font-bold">{t('title2')}</span>
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
                <MagneticButton key={key} active={activeFilter === key} onClick={() => setActiveFilter(key)}>
                  {label}
                </MagneticButton>
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

/* ── COMPOSANT MAGNÉTIQUE POUR LES FILTRES ── */
function MagneticButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  // Position locale de la souris
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Animation fluide (spring) pour l'effet magnétique
  const magneticX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const magneticY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.4); // Force de l'attraction (0.4 = 40% du mouvement)
    y.set(middleY * 0.4);
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
      animate={{ x: 0, y: 0 }}
      style={{ x: magneticX, y: magneticY }}
      className={`relative cursor-pointer px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 z-10 ${active ? 'text-[#070510]' : 'text-base-content/60 hover:text-[#F0A500]'
        }`}
    >
      {active && (
        <motion.div
          layoutId="activeFilterBg"
          className="absolute inset-0 bg-gradient-to-r from-[#F0A500] to-[#FFD166] rounded-full shadow-[0_0_20px_rgba(240,165,0,0.4)]"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
