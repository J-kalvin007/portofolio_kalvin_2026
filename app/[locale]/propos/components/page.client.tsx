'use client';

/**
 * @file propos/components/page.client.tsx (About Page)
 * @description Page « À propos » : portrait, chiffres clés, vision, valeurs,
 * parcours (expérience + formation), témoignages et appel à l'action.
 *
 * @architecture
 * - Rendue par `app/[locale]/propos/page.tsx` (Server Component qui ne produit que les metadata).
 * - Tout le contenu textuel provient de `next-intl` (`about_page`, `experience`, `testimonials`).
 * - Les animations spécifiques à la page vivent dans `./AboutAnimations`
 *   (compteur, mot révélé au défilement, rail de témoignages) et la frise dans `./TimelineCard`.
 *
 * @remarks **Restauration (étape 0 de la refonte).**
 * Ce fichier contenait une copie exacte de la page d'accueil, dont les imports
 * relatifs (`./components/TypewriterText`…) ne pouvaient pas se résoudre depuis
 * ce dossier : `next build` échouait, le site entier était non déployable.
 * La page a été restaurée depuis sa dernière version fonctionnelle (commit
 * `0c2f9ef`), avec la même mise en page, et six défauts corrigés :
 *
 *  1. **Portrait introuvable en production** — `/images/m9.JPG` alors que le
 *     fichier s'appelle `m9.jpg`. Windows ignore la casse, Linux (Vercel, Docker)
 *     non : l'image répondait 404 une fois déployée.
 *  2. **Reflet partagé entre les cartes de valeurs** — un unique `useState`
 *     stockait la position du curseur pour les quatre cartes : survoler l'une
 *     déplaçait le reflet des autres, et chaque `mousemove` re-rendait la page
 *     entière. Remplacé par des variables CSS écrites sur la carte survolée
 *     (motif déjà employé par `Footer` et `TimelineCard`).
 *  3. **Or du mode sombre imposé en mode clair** — `#FFD166` et
 *     `rgba(240,165,0,…)` étaient écrits en dur. Remplacés par les tokens du
 *     thème (`primary`, `accent`, `--glow-color*`).
 *  4. **Indicateur de défilement décentré** — la keyframe `scroll-pulse` centrait
 *     l'icône elle-même : décentrée dès que l'animation était coupée
 *     (`prefers-reduced-motion`). Le centrage est désormais porté par la classe,
 *     la keyframe n'anime plus que la pulsation (voir `globals.css`).
 *  5. **Titre épelé par les lecteurs d'écran** — « Kalvin » est découpé en six
 *     `span` animés ; le titre porte désormais son nom accessible entier.
 *  6. **Décors annoncés** — icônes et guillemet décoratifs masqués aux
 *     technologies d'assistance ; imports inutilisés retirés.
 */

import React, { useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Terminal, Globe, Cpu, Shield, ArrowRight, Download, Briefcase, GraduationCap, ChevronDown, Infinity as InfinityIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import FadeIn from '@/components/animations/FadeIn';
import MagneticWrapper from '@/components/animations/MagneticWrapper';
import StardustCursor from '@/components/animations/StardustCursor';
import type { TimelineItem } from '@/lib/data/experience';
import type { Testimonial } from '@/lib/data/testimonials';
import { AnimatedCounter, ScrollWord, MarqueeRow } from './AboutAnimations';
import TimelineCard from './TimelineCard';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ TOKENS DE LA PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

/** Courbe « luxe » d'origine des apparitions de lettres du titre. */
const EASE_REVEAL = [0.21, 0.47, 0.32, 0.98] as const;

/** Courbe du dévoilement circulaire du portrait. */
const EASE_PORTRAIT = [0.77, 0, 0.175, 1] as const;

/** Amplitude du déplacement parallaxe du portrait au défilement (px). */
const PORTRAIT_PARALLAX_DISTANCE = -80;

/** Amplitude du suivi de souris de l'image dans son cadre (px). */
const PORTRAIT_MOUSE_TRAVEL = 15;

/** Ressort du suivi de souris : fluide, sans oscillation visible. */
const PORTRAIT_SPRING = { stiffness: 150, damping: 20 } as const;

/**
 * Mots « tampons » ajoutés au total du texte révélé : ils ménagent la place du
 * bloc de citation entre les deux paragraphes dans la progression du défilement.
 */
const SCROLL_REVEAL_QUOTE_GAP = 5;

export default function AboutPage() {
  /* ── Défilement : parallaxe du portrait + révélation du texte « vision » ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const { scrollYProgress: visionProgress } = useScroll({ target: visionRef, offset: ['start 0.8', 'end 0.3'] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, PORTRAIT_PARALLAX_DISTANCE]);

  /* ── Suivi de souris du portrait (valeurs de mouvement : aucun rendu React) ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const imgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [PORTRAIT_MOUSE_TRAVEL, -PORTRAIT_MOUSE_TRAVEL]), PORTRAIT_SPRING);
  const imgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [PORTRAIT_MOUSE_TRAVEL, -PORTRAIT_MOUSE_TRAVEL]), PORTRAIT_SPRING);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX / window.innerWidth - 0.5);
    mouseY.set(e.clientY / window.innerHeight - 0.5);
  };

  /**
   * Reflet des cartes de valeurs.
   * Les coordonnées sont écrites en variables CSS sur la carte survolée :
   * chaque carte a son propre reflet et React ne re-rend rien (voir @remarks n° 2).
   */
  const handleValueCardPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;

    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();

    card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  }, []);

  /* ── Dictionnaires i18n ── */
  const t = useTranslations('about_page');
  const tExp = useTranslations('experience');
  const tTest = useTranslations('testimonials');

  const VALUES = [
    { icon: Terminal, title: t('values.excellence'), desc: t('values.excellence_desc') },
    { icon: Globe, title: t('values.vision'), desc: t('values.vision_desc') },
    { icon: Cpu, title: t('values.innovation'), desc: t('values.innovation_desc') },
    { icon: Shield, title: t('values.reliability'), desc: t('values.reliability_desc') },
  ];

  const EXPERIENCE: TimelineItem[] = [
    { title: tExp('job1_title'), subtitle: tExp('job1_subtitle'), period: tExp('job1_period'), description: tExp('job1_description'), tags: ['Architecture', 'Next.js', 'Node.js', 'Leadership'], location: tExp('job1_location'), type: 'work' },
    { title: tExp('job2_title'), subtitle: tExp('job2_subtitle'), period: tExp('job2_period'), description: tExp('job2_description'), tags: ['Full-Stack', 'React Native', 'Django', 'B2B'], location: tExp('job2_location'), type: 'work' },
  ];

  const EDUCATION: TimelineItem[] = [
    { title: tExp('edu1_title'), subtitle: tExp('edu1_subtitle'), period: tExp('edu1_period'), description: tExp('edu1_description'), location: tExp('edu1_location'), type: 'education' },
    { title: tExp('edu2_title'), subtitle: tExp('edu2_subtitle'), period: tExp('edu2_period'), description: tExp('edu2_description'), location: tExp('edu2_location'), type: 'education' },
  ];

  const TESTIMONIALS: Testimonial[] = [
    { quote: tTest('t1_quote'), author: tTest('t1_author'), role: tTest('t1_role'), company: tTest('t1_company') },
    { quote: tTest('t2_quote'), author: tTest('t2_author'), role: tTest('t2_role'), company: tTest('t2_company') },
    { quote: tTest('t3_quote'), author: tTest('t3_author'), role: tTest('t3_role'), company: tTest('t3_company') },
  ];

  const STATS = [
    { target: 3, suffix: '+', label: t('stats.years') },
    { target: 20, suffix: '+', label: t('stats.projects') },
    { target: 100, suffix: '%', label: t('stats.engagement') },
  ];

  /* ── Découpages pour les animations de texte ── */
  const displayName = 'Kalvin';
  const nameChars = displayName.split('');
  const visionText = `${t('vision.p1')} ${t('vision.p2')}`.split(' ');
  const visionP3 = t('vision.p3').split(' ');
  const scrollRevealTotal = visionText.length + visionP3.length + SCROLL_REVEAL_QUOTE_GAP;

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className="min-h-screen bg-base-100 text-base-content overflow-x-hidden relative">
      <StardustCursor />

      {/* ═══ SECTION 1 — HERO CINÉMATIQUE ═══ */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-primary/5 blur-[180px] pointer-events-none" />
        <div aria-hidden="true" className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          {/* Colonne gauche — texte */}
          <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold tracking-[0.2em] uppercase text-base-content/60">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--glow-color-strong)]" />
              {t('badge')}
            </motion.div>

            <div className="overflow-hidden">
              {/* Nom accessible entier : sans lui, certains lecteurs d'écran
                  épelaient les six lettres animées une à une. */}
              <h1 aria-label={displayName} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
                {nameChars.map((c, i) => (
                  <motion.span key={i} aria-hidden="true" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.5, ease: EASE_REVEAL }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-primary to-accent drop-shadow-[0_0_20px_var(--glow-color-strong)]">
                    {c}
                  </motion.span>
                ))}
              </h1>
            </div>

            <motion.h2 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content leading-tight">
              {t('titleLine1')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {t('titleLine2')} {t('titleLine3')}
              </span>
            </motion.h2>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.8 }}
              className="text-lg text-base-content/50 max-w-lg font-light leading-relaxed mx-auto lg:mx-0">
              {t('description')}
            </motion.p>
          </div>

          {/* Colonne droite — portrait dévoilé en cercle */}
          <div className="order-1 lg:order-2 flex justify-center perspective-[2000px]">
            <motion.div
              initial={{ clipPath: 'circle(0% at 50% 50%)' }}
              animate={{ clipPath: 'circle(75% at 50% 50%)' }}
              transition={{ delay: 0.6, duration: 1.8, ease: EASE_PORTRAIT }}
              style={{ y: yParallax, rotateX: 3, rotateY: -3 }}
              whileHover={{ rotateX: 0, rotateY: 0, scale: 1.02 }}
              className="relative w-full max-w-md aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_var(--glow-color-strong)] group"
            >
              <motion.div style={{ x: imgX, y: imgY }} className="absolute inset-[-30px] w-[calc(100%+60px)] h-[calc(100%+60px)]">
                <Image src="/images/m9.webp" alt="Kalvin — Portrait" fill sizes="(max-width: 448px) 100vw, 448px" className="object-cover transition-transform duration-[3s] group-hover:scale-105" priority />
              </motion.div>
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div aria-hidden="true" className="absolute inset-0 bg-primary/15 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-700" />
              <div className="absolute bottom-6 left-6 z-10">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary drop-shadow-sm">{t('subtitle')}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Indicateur de défilement — décoratif.
            Centrage par `-translate-x-1/2` (propriété `translate`), pulsation par
            la keyframe `scroll-pulse` (propriété `transform`) : les deux ne se
            marchent plus dessus. */}
        <div aria-hidden="true" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" style={{ animation: 'scroll-pulse 2s ease-in-out infinite' }}>
          <ChevronDown className="w-6 h-6 text-primary" />
        </div>
      </section>

      {/* ═══ SECTION 2 — COMPTEURS ANIMÉS ═══ */}
      <section className="py-20 border-y border-base-content/5 bg-base-200/30 dark:bg-white/[0.01] relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1} className="text-center group">
              <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-base-content to-base-content/50 group-hover:from-primary group-hover:to-accent transition-all duration-500">
                <AnimatedCounter target={s.target} suffix={s.suffix} />
              </div>
              <div aria-hidden="true" className="w-8 h-[2px] bg-primary/30 group-hover:bg-primary group-hover:w-12 transition-all duration-500 mx-auto mb-2" />
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 group-hover:text-primary/80 transition-colors duration-500">{s.label}</div>
            </FadeIn>
          ))}
          <FadeIn delay={0.3} className="text-center group">
            <motion.div initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }}
              transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
              className="text-4xl md:text-5xl mb-2 flex justify-center text-base-content/80 group-hover:text-primary transition-colors duration-500">
              {/* Icône et non caractère « ∞ » : Poppins ne contient pas ce signe,
                  qui s'affichait dans une police système. */}
              <InfinityIcon aria-hidden="true" strokeWidth={2} className="h-[1em] w-[1em]" />
            </motion.div>
            <div aria-hidden="true" className="w-8 h-[2px] bg-primary/30 group-hover:bg-primary group-hover:w-12 transition-all duration-500 mx-auto mb-2" />
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 group-hover:text-primary/80 transition-colors">{t('stats.passion')}</div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 3 — VISION RÉVÉLÉE AU DÉFILEMENT ═══ */}
      <section ref={visionRef} className="py-28 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span aria-hidden="true" className="w-8 h-[2px] rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{t('vision.eyebrow')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight mb-16">{t('vision.title')}</h2>
          </FadeIn>

          <div className="text-xl sm:text-2xl leading-relaxed text-base-content font-light mb-12">
            {visionText.map((word, i) => (
              <ScrollWord key={i} progress={visionProgress} index={i} total={scrollRevealTotal}>
                {word}
              </ScrollWord>
            ))}
          </div>

          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-8 sm:p-10 rounded-[2rem] glass border-l-4 border-primary my-12 shadow-xl"
          >
            <div aria-hidden="true" className="absolute -top-4 -left-2 text-6xl text-primary/20 font-display">&ldquo;</div>
            <p className="text-xl sm:text-2xl text-base-content/80 italic font-light leading-relaxed">{t('vision.quote')}</p>
          </motion.blockquote>

          <div className="text-xl sm:text-2xl leading-relaxed text-base-content font-light">
            {visionP3.map((word, i) => (
              <ScrollWord key={i} progress={visionProgress} index={visionText.length + SCROLL_REVEAL_QUOTE_GAP + i} total={scrollRevealTotal}>
                {word}
              </ScrollWord>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4 — VALEURS (cartes à reflet) ═══ */}
      <section className="py-24 px-4 sm:px-6 bg-base-200/30 dark:bg-white/[0.01] relative overflow-hidden">
        <div aria-hidden="true" className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2.5 mb-6 mx-auto">
              <span aria-hidden="true" className="w-8 h-[2px] rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{t('values_section.eyebrow')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight">{t('values_section.title')}</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.12}>
                <div
                  onPointerMove={handleValueCardPointerMove}
                  style={{ '--spot-x': '50%', '--spot-y': '50%' } as React.CSSProperties}
                  className="group relative p-7 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-base-content/[0.06] dark:border-base-content/[0.04] hover:border-primary/40 transition-all duration-700 shadow-md hover:shadow-2xl hover:shadow-primary/10 overflow-hidden h-full cursor-default"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: 'radial-gradient(350px circle at var(--spot-x) var(--spot-y), color-mix(in srgb, var(--primary) 12%, transparent), transparent 50%)' }}
                  />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-base-200 dark:bg-white/5 flex items-center justify-center mb-5 text-base-content/50 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent group-hover:text-primary-content group-hover:shadow-[0_0_25px_var(--glow-color-strong)] transition-all duration-500">
                      <v.icon className="w-7 h-7" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-lg text-base-content mb-2 group-hover:text-primary transition-colors">{v.title}</h3>
                    <p className="text-sm text-base-content/55 leading-relaxed font-light">{v.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5 — FRISE DU PARCOURS ═══ */}
      <section className="py-28 px-4 sm:px-6 relative">
        <div aria-hidden="true" className="absolute top-0 bottom-0 left-[calc(50%-1px)] w-[2px] bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span aria-hidden="true" className="w-8 h-[2px] rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{t('timeline.eyebrow')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight mb-16">{t('timeline.title')}</h2>
          </FadeIn>

          <div className="flex items-center gap-3 mb-10">
            <div aria-hidden="true" className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_var(--glow-color)]">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-2xl text-base-content">{t('timeline.experience')}</h3>
          </div>
          <div className="space-y-6">{EXPERIENCE.map((item, i) => <TimelineCard key={item.title} item={item} index={i} />)}</div>

          <div className="flex items-center gap-3 mb-10 mt-20">
            <div aria-hidden="true" className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_var(--glow-color)]">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-2xl text-base-content">{t('timeline.education')}</h3>
          </div>
          <div className="space-y-6">{EDUCATION.map((item, i) => <TimelineCard key={item.title} item={item} index={i} />)}</div>
        </div>
      </section>

      {/* ═══ SECTION 6 — RAIL DE TÉMOIGNAGES ═══ */}
      <section className="py-28 bg-base-200/50 dark:bg-base-100 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div aria-hidden="true" className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />

        <div className="relative z-10">
          <FadeIn className="text-center mb-14 px-6">
            <h2 className="text-4xl md:text-6xl font-bold text-base-content/90 dark:text-white/90">{t('testimonials.title')}</h2>
          </FadeIn>
          <div className="space-y-6">
            <MarqueeRow items={TESTIMONIALS} direction="left" speed={30} />
            <MarqueeRow items={TESTIMONIALS} direction="right" speed={35} />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7 — APPEL À L'ACTION ═══ */}
      <section className="py-28 sm:py-36 px-4 sm:px-6 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <motion.div aria-hidden="true" className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px]" />
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-base-content leading-tight tracking-tight">
              {t('cta.title1')}<br />
              <span className="text-primary font-bold">{t('cta.title2')}</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-base-content/50 font-light max-w-xl mx-auto">{t('cta.description')}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12">
              <MagneticWrapper strength={0.3}>
                <div className="relative">
                  {/* Anneau orbital décoratif */}
                  <div aria-hidden="true" className="absolute -inset-3 rounded-full border border-primary/20 pointer-events-none" style={{ animation: 'orbital-spin 8s linear infinite' }}>
                    <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--glow-color-strong)]" />
                  </div>
                  <Link href="/contact" className="relative group overflow-hidden cursor-pointer flex justify-center items-center px-10 py-5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-content font-extrabold text-lg shadow-[0_0_30px_var(--glow-color-strong)] hover:shadow-[0_0_50px_var(--glow-color-strong)] transition-all duration-500 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100">
                    <div aria-hidden="true" className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-3">
                      {t('cta.ctaPrimary')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </span>
                  </Link>
                </div>
              </MagneticWrapper>

              <MagneticWrapper strength={0.2}>
                <a href="/cv/cv_kalvin.pdf" download className="relative overflow-hidden cursor-pointer flex justify-center items-center px-10 py-5 rounded-full border border-base-content/10 bg-base-200/50 dark:bg-white/5 backdrop-blur-xl hover:border-primary/50 hover:bg-primary/10 text-base-content/80 hover:text-primary font-bold text-lg transition-all duration-500 shadow-sm hover:shadow-[0_0_20px_var(--glow-color-strong)] gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100">
                  <Download className="w-5 h-5" aria-hidden="true" />
                  <span className="relative z-10">{t('cta.ctaSecondary')}</span>
                </a>
              </MagneticWrapper>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
