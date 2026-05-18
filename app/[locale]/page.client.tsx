'use client';

/**
 * @file page.tsx (Home Page)
 * @description Page d'accueil principale du portfolio (Root Page).
 * 
 * @architecture
 * - Conçue comme une landing page immersive (Hero, Teaser, Skills, Featured Projects, Stats, CTA).
 * - Utilisation avancée de Framer Motion pour des animations complexes :
 *   - Scroll Parallax (`useScroll`, `useTransform`)
 *   - Effets de texte (Typewriter)
 *   - Carrousels infinis (`MarqueeRow`)
 *   - Apparitions au défilement (`FadeIn`, `StaggerChildren`)
 *   - Animations partagées (`layout` id) pour la modale Lightbox.
 * - S'appuie sur `next-intl` pour une traduction intégrale de tout le contenu textuel.
 */

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowDown, Code2, Rocket, Eye,
  Shield, Download, ChevronLeft, ChevronRight, X, Github,
  Star
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import FadeIn from '@/components/animations/FadeIn';
import StaggerChildren, { StaggerItem } from '@/components/animations/StaggerChildren';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { FEATURED_PROJECTS } from '@/lib/data/projects';
import { SKILLS } from '@/lib/data/skills';
import { StarField } from '@/components/projects';
import StardustCursor from '@/components/animations/StardustCursor';
import TypewriterText from './components/TypewriterText';
import MarqueeRow from './components/MarqueeRow';
import FeaturedProjectCard from './components/FeaturedProjectCard ';

/* ═══════════════════════════════════════════════
   COMPOSANTS INTERNES À LA PAGE D'ACCUEIL
   ═══════════════════════════════════════════════ */









/* ═══════════════════════════════════════════════
   COMPOSANT PAGE PRINCIPALE (HOME PAGE)
   ═══════════════════════════════════════════════ */

export default function HomePage() {
  // Hooks pour l'effet Parallax du bloc Hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // Transforme la progression du scroll en un mouvement et une opacité (Le Hero disparaît doucement)
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Récupération des dictionnaires de traduction i18n
  const locale = useLocale();
  const t = useTranslations('hero');
  const tTeaser = useTranslations('about_teaser');
  const tValues = useTranslations('values');
  const tSkills = useTranslations('skills');
  const tFeatured = useTranslations('featured');
  const tStats = useTranslations('stats');
  const tCta = useTranslations('cta');
  const tProjects = useTranslations('projects_data');

  // Mots pour l'effet "Machine à écrire"
  const typewriterWords = [t('words.engineer'), t('words.architect'), t('words.artisan')];

  // Tri des compétences pour les carrousels (Frontend en haut, le reste en bas)
  const frontendSkills = SKILLS.find(c => c.title === 'Frontend')?.skills || [];
  const backendSkills = SKILLS.filter(c => c.title !== 'Frontend').flatMap(c => c.skills);

  // Valeurs de l'entreprise
  const VALUES = [
    { icon: Code2, title: tValues('solid'), desc: tValues('solid_desc') },
    { icon: Rocket, title: tValues('perf'), desc: tValues('perf_desc') },
    { icon: Eye, title: tValues('design'), desc: tValues('design_desc') },
    { icon: Shield, title: tValues('reliability'), desc: tValues('reliability_desc') },
  ];

  // Statistiques à animer
  const STATS = [
    { value: 3, suffix: '+', label: tStats('years') },
    { value: 10, suffix: '+', label: tStats('projects') },
    { value: 8, suffix: '+', label: tStats('technologies') },
    { value: 89, suffix: '%', label: tStats('engagement') },
  ];

  return (

    <div className="min-h-screen bg-base-100 text-base-content overflow-x-hidden relative">
      <StardustCursor />

      {/* ── Fond Spatial Étoilé ── */}
      {/* <StarField /> */}

      {/* ═══════════════════ SECTION : HERO ═══════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center">

        {/* Arrière-plan complexe avec des Orbes Lumineuses Floues */}
        <div className="absolute inset-0">

          <div className="absolute inset-0 bg-base-100" />

          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.06] dark:opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }} />
          <div className="absolute -bottom-32 -right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04] dark:opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }} />

          {/* Motif de grille en pointillés */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '48px 48px' }} />

          {/* Dégradé bas pour la fusion parfaite avec la section suivante */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-base-100 to-transparent pointer-events-none" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">

          {/* Colonne Gauche : Titre et Description */}
          <div className="text-left space-y-8 max-w-2xl">

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-base-content leading-[1.05] tracking-tight">

                {t('greeting')} <span className="text-gradient">Kalvin</span><br />

                <span className="whitespace-nowrap inline-flex items-center gap-2 sm:gap-3 lg:gap-4 mt-1 sm:mt-2">

                  {locale === 'fr' ? (

                    <>

                      {/* <span className="font-display italic font-normal text-gradient"> */}
                      <span className="text-gradient">
                        <TypewriterText words={typewriterWords} />
                      </span>
                      <span>{t('titleLine1')}</span>

                    </>

                  ) : (

                    <>
                      <span>{t('titleLine1')}</span>
                      <span className="text-gradient">
                        <TypewriterText words={typewriterWords} />
                      </span>
                    </>

                  )}

                </span>

              </h1>

            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg sm:text-xl text-base-content/60 font-light leading-relaxed max-w-xl"
            >
              {t.rich('description', {
                bold1: (chunks) => <span className="text-base-content/90 font-medium">{chunks}</span>,
                bold2: (chunks) => <span className="text-base-content/90 font-medium">{chunks}</span>,
              })}
            </motion.p>

            {/* Boutons d'Appel à l'Action (CTAs) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-4"
            >

              <Link href="/projets"
                className="cursor-pointer group flex justify-center items-center gap-2 px-8 py-3.5 sm:px-8 sm:py-4 rounded-full bg-base-content text-base-100 dark:bg-primary dark:text-primary-content font-bold shadow-xl shadow-base-content/10 dark:shadow-primary/20 hover:shadow-base-content/20 dark:hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 w-[240px] sm:w-auto"
              >
                {t('ctaPrimary')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/contact"
                className="cursor-pointer flex justify-center items-center px-8 py-3.5 sm:px-8 sm:py-4 rounded-full border border-base-content/10 hover:border-base-content/30 hover:bg-base-200/30 text-base-content/80 font-bold transition-all duration-300 w-[240px] sm:w-auto"
              >
                {t('ctaSecondary')}
              </Link>

            </motion.div>

          </div>

          {/* Colonne Droite : Visuels (Portrait et Orbites) */}
          <div className="relative flex justify-center items-center h-[400px] sm:h-[500px] lg:h-[600px] mt-10 lg:mt-0">
            {/* Anneaux orbitaux tournants (`animate-[spin_...]`) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] rounded-full border border-base-content/[0.05] border-dashed animate-[spin_40s_linear_infinite]" />
              <div className="absolute w-[380px] h-[380px] sm:w-[550px] sm:h-[550px] rounded-full border border-base-content/[0.03] border-dashed animate-[spin_60s_linear_infinite_reverse]" />
            </div>

            {/* Portrait central (Glowing Image) */}
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className="relative z-10">
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full overflow-hidden ring-1 ring-base-content/10 ring-offset-[16px] ring-offset-base-100 shadow-[0_0_80px_-20px_var(--glow-color-strong)]">
                <Image src="/images/Kalvin.jpg" alt="Kalvin" fill className="object-cover" priority />
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] pointer-events-none" />
              </div>
            </motion.div>

            {/* Badges Flottants (Animés en suspension avec y: [-10, 10, -10]) */}
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-[10%] right-[5%] sm:right-[15%] z-20 bg-base-100/80 backdrop-blur-xl border border-base-content/10 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2">
              <div className="p-1 rounded-full bg-accent/10"><Rocket className="w-3.5 h-3.5 text-accent" /></div>
              <span className="text-xs font-bold text-base-content/80">{t('floatingBadge1')}</span>
            </motion.div>

            <motion.div animate={{ y: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute bottom-[15%] left-[5%] sm:left-[10%] z-20 bg-base-100/80 backdrop-blur-xl border border-base-content/10 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2">
              <div className="p-1 rounded-full bg-primary/10"><Code2 className="w-3.5 h-3.5 text-primary" /></div>
              <span className="text-xs font-bold text-base-content/80">{t('floatingBadge2')}</span>
            </motion.div>

            <motion.div animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }} className="absolute top-[40%] -left-[5%] sm:-left-[10%] z-20 bg-base-100/80 backdrop-blur-xl border border-base-content/10 px-3 py-3 rounded-full shadow-2xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-base-content/60" />
            </motion.div>

          </div>

          {/* Indicateur de Défilement Visuel (Petite souris animée en bas) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} className="w-6 h-10 border-2 border-base-content/20 rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-base-content/40 rounded-full" />
            </motion.div>
          </motion.div>

        </motion.div>

      </section>

      {/* ═══════════════════ SECTION : TEASER (À PROPOS) ═══════════════════ */}
      <section className="pt-48 pb-2 sm:pt-64 sm:pb-2 px-4 sm:px-6 relative z-10">

        <div className="max-w-6xl mx-auto">

          <div className="grid md:grid-cols-2 gap-16 items-center">

            <FadeIn direction="left">

              <SectionHeader eyebrow={tTeaser('eyebrow')} title={tTeaser('title')} />

              <div className="space-y-5 text-lg text-base-content/60 font-light leading-relaxed">

                <p>
                  {tTeaser.rich('p1', { bold: (chunks) => <strong className="text-base-content/90 font-medium">{chunks}</strong> })}
                </p>

                <p>
                  {tTeaser.rich('p2', { bold: (chunks) => <strong className="text-base-content/90 font-medium">{chunks}</strong> })}
                </p>

              </div>

              <Link href="/propos" className="cursor-pointer inline-flex items-center gap-2 mt-8 text-primary font-bold hover:gap-3 transition-all duration-300">
                {tTeaser('cta')} <ArrowRight className="w-4 h-4" />
              </Link>

            </FadeIn>

            <FadeIn direction="right" delay={0.2} className="w-full">

              {/* Utilisation de StaggerChildren pour faire apparaître les blocs 1 par 1 */}
              <StaggerChildren staggerDelay={0.12} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {VALUES.map((val, i) => (

                  <StaggerItem key={i}>

                    <div className="group p-5 sm:p-6 rounded-2xl bg-base-200/30 dark:bg-white/[0.03] border border-base-content/[0.04] hover:border-primary/20 transition-all duration-500 hover-glow h-full flex flex-col justify-center">
                      <val.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-sm sm:text-base text-base-content mb-1">{val.title}</h3>
                      <p className="text-[11px] sm:text-xs text-base-content/50 leading-relaxed">{val.desc}</p>
                    </div>

                  </StaggerItem>

                ))}

              </StaggerChildren>

            </FadeIn>

          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION : COMPÉTENCES (CARROUSELS) ═══════════════════ */}
      <section className="py-24 sm:py-40 relative overflow-hidden bg-base-100">

        {/* Glow de fond */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-[150px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-accent/[0.02] blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 mb-16 sm:mb-24">
          <FadeIn>
            <SectionHeader eyebrow={tSkills('eyebrow')} title={tSkills('title')} description={tSkills('description')} align="center" />
          </FadeIn>
        </div>

        {/* Lignes défilantes (Marquee) vers la gauche et vers la droite */}
        <div className="relative z-10 flex flex-col gap-8 sm:gap-12 w-full">
          {frontendSkills.length > 0 && <MarqueeRow skills={frontendSkills} tSkills={tSkills} speed={45} />}
          {backendSkills.length > 0 && <MarqueeRow skills={backendSkills} reverse={true} tSkills={tSkills} speed={55} />}
        </div>

      </section>

      {/* ═══════════════════ SECTION : PROJETS PHARES ═══════════════════ */}
      <section className="py-24 sm:py-32 px-4 sm:px-6">

        <div className="max-w-6xl mx-auto">

          <FadeIn>
            <SectionHeader eyebrow={tFeatured('eyebrow')} title={tFeatured('title')} description={tFeatured('description')} />
          </FadeIn>

          {/* Liste des projets générée dynamiquement */}
          <div className="flex flex-col gap-24 sm:gap-32 mt-16">

            {FEATURED_PROJECTS.map((project, index) => (
              <FeaturedProjectCard key={project.slug} project={project} index={index} tProjects={tProjects} />
            ))}

          </div>

          <FadeIn delay={0.4} className="text-center mt-12">
            <Link href="/projets" className="cursor-pointer group inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-primary/20 text-primary font-bold hover:bg-primary hover:text-primary-content transition-all duration-300">
              {tFeatured('viewAll')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ SECTION : STATISTIQUES ═══════════════════ */}
      <section className="py-20 px-4 sm:px-6 border-y border-base-content/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-base-content tracking-tight">
                  {/* Composant local qui compte de 0 à la valeur cible quand il entre à l'écran */}
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mt-2">
                  {stat.label}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION : APPEL À L'ACTION (CTA FINAL) ═══════════════════ */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">

        <div className="relative z-10 max-w-4xl mx-auto text-center">

          <FadeIn>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-base-content leading-tight tracking-tight">
              {tCta('title1')}
              <br />
              {/* <span className="font-display italic text-primary font-normal">{tCta('title2')}</span> */}
              <span className="text-primary">{tCta('title2')}</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-base-content/50 font-light max-w-xl mx-auto">
              {tCta('description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">

              <Link href="/contact"
                className="cursor-pointer group flex items-center justify-center gap-2 sm:gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full bg-primary/80 text-primary-content font-bold text-base sm:text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-[260px] sm:w-auto"
              >
                {tCta('ctaPrimary')}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Le CV est lié à un fichier PDF stocké dans le dossier `public/cv/` */}
              <a href="/cv/cv_kalvin.pdf" download
                className="cursor-pointer flex items-center justify-center gap-2 px-8 py-4 sm:px-8 sm:py-4 rounded-full border-2 border-base-content/10 hover:border-primary/30 text-base-content/60 hover:text-primary font-bold text-base sm:text-lg transition-all duration-300 w-[260px] sm:w-auto"
              >
                <Download className="w-4 h-4" />
                {tCta('ctaSecondary')}
              </a>

            </div>

          </FadeIn>

        </div>

      </section>

    </div>
  );
}
