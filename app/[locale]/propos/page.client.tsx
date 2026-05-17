'use client';

/**
 * @file propos/page.tsx
 * @description Page "À Propos" du portfolio. Présente l'ingénieur, sa vision, son expérience et ses références.
 * 
 * @architecture
 * - Utilise `useScroll` et `useTransform` (Framer Motion) pour générer un effet de "Parallax" 
 *   sur l'image de portrait (l'image bouge à une vitesse différente du reste du site).
 * - Componentisation locale : `TimelineCard` est créé dans ce fichier car il n'est utilisé qu'ici.
 * - Utilisation massive de `StaggerChildren` pour orchestrer l'apparition d'éléments multiples (Valeurs, Témoignages).
 * - S'appuie intégralement sur les clés de traduction (i18n) pour la gestion du texte.
 */

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Terminal, Globe, Cpu, Shield, Quote, ArrowRight, Download, Briefcase, GraduationCap, MapPin, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import FadeIn from '@/components/animations/FadeIn';
import StaggerChildren, { StaggerItem } from '@/components/animations/StaggerChildren';
import SectionHeader from '@/components/ui/SectionHeader';
import TimelineCard from './components/TimelineCard';
import { type TimelineItem } from '@/lib/data/experience';
import { StarField } from '@/components/projects';



export default function AboutPage() {
  // Setup du Parallax : On surveille le défilement (scrollY) du composant racine.
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

  // Transforme la progression du scroll (0 à 1) en un déplacement vertical (0px à -80px).
  // Donne l'impression que la photo de portrait est plus lointaine/plus lente que le reste.
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);

  // Récupération des hooks i18n
  const t = useTranslations('about_page');
  const tExp = useTranslations('experience');
  const tTest = useTranslations('testimonials');

  // Dictionnaire des valeurs (Soft skills & Philosophie)
  const VALUES = [
    { icon: Terminal, title: t('values.excellence'), desc: t('values.excellence_desc') },
    { icon: Globe, title: t('values.vision'), desc: t('values.vision_desc') },
    { icon: Cpu, title: t('values.innovation'), desc: t('values.innovation_desc') },
    { icon: Shield, title: t('values.reliability'), desc: t('values.reliability_desc') },
  ];

  // Extraction et structuration des expériences professionnelles
  const EXPERIENCE: TimelineItem[] = [
    {
      title: tExp('job1_title'),
      subtitle: tExp('job1_subtitle'),
      period: tExp('job1_period'),
      description: tExp('job1_description'),
      tags: ['Architecture', 'Next.js', 'Node.js', 'Leadership'],
      location: tExp('job1_location'),
      type: 'work',
    },
    {
      title: tExp('job2_title'),
      subtitle: tExp('job2_subtitle'),
      period: tExp('job2_period'),
      description: tExp('job2_description'),
      tags: ['Full-Stack', 'React Native', 'Django', 'B2B'],
      location: tExp('job2_location'),
      type: 'work',
    },
  ];

  // Extraction et structuration du parcours académique
  const EDUCATION: TimelineItem[] = [
    {
      title: tExp('edu1_title'),
      subtitle: tExp('edu1_subtitle'),
      period: tExp('edu1_period'),
      description: tExp('edu1_description'),
      location: tExp('edu1_location'),
      type: 'education',
    },
    {
      title: tExp('edu2_title'),
      subtitle: tExp('edu2_subtitle'),
      period: tExp('edu2_period'),
      description: tExp('edu2_description'),
      location: tExp('edu2_location'),
      type: 'education',
    },
  ];

  // Données des témoignages (Clients / Collègues)
  const TESTIMONIALS = [
    { quote: tTest('t1_quote'), author: tTest('t1_author'), role: tTest('t1_role'), company: tTest('t1_company') },
    { quote: tTest('t2_quote'), author: tTest('t2_author'), role: tTest('t2_role'), company: tTest('t2_company') },
    { quote: tTest('t3_quote'), author: tTest('t3_author'), role: tTest('t3_role'), company: tTest('t3_company') },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#070510] text-base-content overflow-x-hidden relative">
      {/* Modification de l'index Z pour s'assurer que le fond spatial reste derrière */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <StarField />
      </div>

      <div className="relative z-10">
        {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-20 overflow-hidden">
        {/* Glows d'ambiance spatiale */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#F0A500]/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#F0A500]/[0.03] blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">

          <FadeIn>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold tracking-[0.2em] uppercase text-base-content/60 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
              {t('badge')}
            </span>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-base-content leading-[0.95] tracking-tight mb-8">
              {t('titleLine1')}
              <br />
              <span className="font-display italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#F0A500] to-[#FFD166] drop-shadow-[0_0_15px_rgba(240,165,0,0.5)]">
                {t('titleLine2')}
              </span>
              <br />
              {t('titleLine3')}
            </h1>
          </FadeIn>

          {/* 
            Description enrichie avec des balises <bold>
            Utilise `t.rich` qui permet d'injecter des éléments React (comme <strong>) au milieu d'une chaîne i18n
          */}
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-base-content/50 max-w-2xl mx-auto leading-relaxed font-light">
              {t.rich('description', {
                bold1: (chunks) => <strong className="text-base-content/80 font-medium">{chunks}</strong>,
                bold2: (chunks) => <strong className="text-base-content/80 font-medium">{chunks}</strong>,
              })}
            </p>
          </FadeIn>

          {/* 
            Image de Portrait avec Effet Parallax (`style={{ y: yParallax }}`) et 3D Spatiale
          */}
          <FadeIn delay={0.4} className="mt-16 perspective-[2000px]">
            <motion.div 
               style={{ y: yParallax, rotateX: 5, rotateY: -5 }} 
               whileHover={{ rotateX: 0, rotateY: 0, scale: 1.02 }}
               transition={{ duration: 0.5, ease: "easeOut" }}
               className="relative max-w-4xl mx-auto aspect-[21/9] rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(240,165,0,0.15)] hover:shadow-[0_30px_80px_-15px_rgba(240,165,0,0.3)] group"
            >
              <Image src="/images/b2.JPG" alt="Kalvin — Portrait" fill className="object-cover object-[50%_20%] transition-transform duration-[3s] group-hover:scale-110" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-700 pointer-events-none" />

              <div className="absolute bottom-8 left-8 text-left z-10 transition-transform duration-700 group-hover:-translate-y-2">
                <p className="font-display italic text-3xl text-white/90 drop-shadow-[0_0_15px_rgba(240,165,0,0.8)]">Kalvin</p>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#F0A500] mt-1 drop-shadow-sm">{t('subtitle')}</p>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ STATISTIQUES EN CHIFFRES ═══════ */}
      <section className="py-16 border-y border-base-content/5 bg-base-200/30 dark:bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center md:justify-around gap-8 md:gap-0">
          {[
            { value: '3+', label: t('stats.years') },
            { value: '20+', label: t('stats.projects') },
            { value: '100%', label: t('stats.engagement') },
            { value: '∞', label: t('stats.passion') },
          ].map((s) => (
            <FadeIn key={s.label} className="text-center px-4 group">
              <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-base-content to-base-content/50 group-hover:from-[#F0A500] group-hover:to-[#FFD166] transition-all duration-500 drop-shadow-sm group-hover:drop-shadow-[0_0_15px_rgba(240,165,0,0.5)]">
                {s.value}
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 group-hover:text-primary/80 transition-colors duration-500">{s.label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════ VISION ET PHILOSOPHIE ═══════ */}
      <section className="py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn><SectionHeader eyebrow={t('vision.eyebrow')} title={t('vision.title')} /></FadeIn>

          <div className="grid md:grid-cols-[1fr_2fr] gap-12 items-start">

            {/* Colonne Gauche : Mantra Collant (Sticky Sidebar) */}
            <FadeIn direction="left" className="hidden md:block sticky top-32">
              <span className="block w-12 h-[2px] bg-primary mb-4" />
              <p className="text-sm font-bold text-base-content/30 uppercase tracking-widest leading-loose">
                {t('vision.sidebarMantra')}<br />
                {t('vision.sidebarApproach')}<br />
                {t('vision.sidebarStandard')}
              </p>
            </FadeIn>

            {/* Colonne Droite : Texte Long */}
            <FadeIn direction="right">
              <div className="space-y-6 text-lg leading-relaxed text-base-content/60 font-light">
                <p>{t.rich('vision.p1', { bold: (chunks) => <strong className="text-base-content/90 font-medium">{chunks}</strong> })}</p>
                <p>{t.rich('vision.p2', { bold: (chunks) => <strong className="text-base-content/90 font-medium">{chunks}</strong> })}</p>

                <blockquote className="pl-6 border-l-4 border-primary italic text-base-content/80 text-2xl font-display py-2 my-8">
                  {t('vision.quote')}
                </blockquote>

                <p>{t('vision.p3')}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ VALEURS FONDAMENTALES ═══════ */}
      <section className="py-24 px-4 sm:px-6 bg-base-200/30 dark:bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <FadeIn><SectionHeader eyebrow={t('values_section.eyebrow')} title={t('values_section.title')} align="center" /></FadeIn>

          <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 group/values">
            {VALUES.map((v, i) => (
              <StaggerItem key={i}>
                <div className="group p-8 rounded-[2rem] bg-base-100 dark:bg-white/[0.02] border border-base-content/[0.04] hover:border-[#F0A500]/50 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(240,165,0,0.3)] h-full hover:!opacity-100 group-hover/values:opacity-40">
                  <div className="w-14 h-14 rounded-2xl bg-base-200 dark:bg-white/5 flex items-center justify-center mb-6 text-base-content/60 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#F0A500] group-hover:to-[#FFD166] group-hover:text-black group-hover:shadow-[0_0_20px_rgba(240,165,0,0.4)] transition-all duration-500">
                    <v.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-xl text-base-content mb-3 group-hover:text-[#F0A500] transition-colors">{v.title}</h3>
                  <p className="text-sm text-base-content/60 leading-relaxed font-light">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════ PARCOURS (TIMELINE) ═══════ */}
      <section className="py-28 px-4 sm:px-6 relative">
        {/* Traînée lumineuse verticale (le fil de la timeline) */}
        <div className="absolute top-0 bottom-0 left-[calc(50%-1px)] w-[2px] bg-gradient-to-b from-transparent via-[#F0A500]/20 to-transparent hidden md:block" />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeIn><SectionHeader eyebrow={t('timeline.eyebrow')} title={t('timeline.title')} /></FadeIn>

          {/* Expériences Pro */}
          <div className="flex items-center justify-center md:justify-start gap-3 mb-12">
            <div className="p-3 rounded-2xl bg-[#F0A500]/10 border border-[#F0A500]/20 shadow-[0_0_15px_rgba(240,165,0,0.2)]">
              <Briefcase className="w-6 h-6 text-[#F0A500]" />
            </div>
            <h3 className="font-bold text-2xl text-base-content tracking-tight">{t('timeline.experience')}</h3>
          </div>
          <div className="space-y-6">
            {EXPERIENCE.map((item, i) => <TimelineCard key={i} item={item} index={i} />)}
          </div>

          {/* Formations */}
          <div className="flex items-center justify-center md:justify-start gap-3 mb-12 mt-24">
            <div className="p-3 rounded-2xl bg-[#F0A500]/10 border border-[#F0A500]/20 shadow-[0_0_15px_rgba(240,165,0,0.2)]">
              <GraduationCap className="w-6 h-6 text-[#F0A500]" />
            </div>
            <h3 className="font-bold text-2xl text-base-content tracking-tight">{t('timeline.education')}</h3>
          </div>
          <div className="space-y-6">
            {EDUCATION.map((item, i) => <TimelineCard key={i} item={item} index={i} />)}
          </div>
        </div>
      </section>

      {/* ═══════ TÉMOIGNAGES ═══════ */}
      <section className="py-28 bg-[#070510] text-white relative overflow-hidden">
        {/* Motif de fond : Grille subtile en pointillés */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <FadeIn><h2 className="text-4xl md:text-6xl font-display italic text-center text-white/90 mb-16">{t('testimonials.title')}</h2></FadeIn>

          <StaggerChildren staggerDelay={0.15} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, i) => (
              <StaggerItem key={i}>
                <motion.div whileHover={{ y: -10, scale: 1.02 }} className="group/test relative p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl h-full flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_0_40px_-10px_rgba(240,165,0,0.2)] hover:border-white/20 transition-all duration-700 overflow-hidden">
                  
                  {/* Holographic Shimmer Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F0A500]/10 via-transparent to-transparent opacity-0 group-hover/test:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="absolute -inset-[100%] animate-[spin_10s_linear_infinite] opacity-0 group-hover/test:opacity-[0.02] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#F0A500_100%)] pointer-events-none" />

                  <div className="relative z-10 flex-1 flex flex-col">
                    <Quote className="w-10 h-10 text-[#F0A500] mb-6 opacity-40 group-hover/test:opacity-80 group-hover/test:scale-110 transition-all duration-500 drop-shadow-[0_0_10px_rgba(240,165,0,0.5)]" />
                    <p className="text-lg leading-relaxed text-white/80 font-light flex-1 mb-8 italic">{testimonial.quote}</p>

                    <div className="flex items-center gap-4">
                      {/* Avatar généré avec l'initiale de l'auteur */}
                      <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-[#F0A500] to-[#FFD166] flex items-center justify-center font-extrabold text-[#070510] text-xl shadow-[0_0_15px_rgba(240,165,0,0.5)]">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-base">{testimonial.author}</div>
                        <div className="text-xs text-[#F0A500]/80 font-medium tracking-wide uppercase mt-0.5">{testimonial.role}, {testimonial.company}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ═══════ APPEL À L'ACTION (CTA FINAL) ═══════ */}
      <section className="py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-tight tracking-tight">
              {t('cta.title1')}<br />
              <span className="font-display italic text-primary font-normal">{t('cta.title2')}</span>
            </h2>
            <p className="mt-6 text-lg text-base-content/50 font-light max-w-xl mx-auto">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">

              {/* Bouton CTA Principal ultra-premium */}
              <Link href="/contact" className="relative group overflow-hidden cursor-pointer px-10 py-5 rounded-full bg-gradient-to-r from-[#F0A500] to-[#FFD166] text-black font-extrabold text-lg shadow-[0_0_30px_rgba(240,165,0,0.3)] hover:shadow-[0_0_50px_rgba(240,165,0,0.5)] transition-all duration-500 hover:scale-105 flex items-center gap-3">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-3">
                  {t('cta.ctaPrimary')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Bouton Secondaire Premium */}
              <a href="/cv/cv_kalvin.pdf" download className="relative overflow-hidden cursor-pointer px-8 py-5 rounded-full border border-base-content/10 bg-base-200/50 dark:bg-white/5 backdrop-blur-xl hover:border-[#F0A500]/50 hover:bg-[#F0A500]/10 text-base-content/80 hover:text-[#F0A500] font-bold transition-all duration-500 flex items-center gap-3 shadow-sm hover:shadow-[0_0_20px_rgba(240,165,0,0.2)]">
                <Download className="w-5 h-5" /> 
                <span className="relative z-10">{t('cta.ctaSecondary')}</span>
              </a>

            </div>
          </FadeIn>
        </div>
      </section>

      </div>
    </div>
  );
}

