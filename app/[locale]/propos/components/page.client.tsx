'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Terminal, Globe, Cpu, Shield, ArrowRight, Download, Briefcase, GraduationCap, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import FadeIn from '@/components/animations/FadeIn';
import MagneticWrapper from '@/components/animations/MagneticWrapper';
import { type TimelineItem } from '@/lib/data/experience';
import StardustCursor from '@/components/animations/StardustCursor';
import { AnimatedCounter, ScrollWord, MarqueeRow } from './AboutAnimations';
import TimelineCard from './TimelineCard';

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const { scrollYProgress: visionProgress } = useScroll({ target: visionRef, offset: ['start 0.8', 'end 0.3'] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const imgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
  const imgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX / window.innerWidth - 0.5);
    mouseY.set(e.clientY / window.innerHeight - 0.5);
  };

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

  const TESTIMONIALS = [
    { quote: tTest('t1_quote'), author: tTest('t1_author'), role: tTest('t1_role'), company: tTest('t1_company') },
    { quote: tTest('t2_quote'), author: tTest('t2_author'), role: tTest('t2_role'), company: tTest('t2_company') },
    { quote: tTest('t3_quote'), author: tTest('t3_author'), role: tTest('t3_role'), company: tTest('t3_company') },
  ];

  const nameChars = 'Kalvin'.split('');
  const visionText = `${t('vision.p1')} ${t('vision.p2')}`.split(' ');
  const visionP3 = t('vision.p3').split(' ');

  const [spotPos, setSpotPos] = useState({ x: 0, y: 0 });

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className="min-h-screen bg-base-100 text-base-content overflow-x-hidden relative">
      <StardustCursor />

      {/* ═══ SECTION 1 — CINEMATIC HERO ═══ */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-primary/5 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left — Text */}
          <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold tracking-[0.2em] uppercase text-base-content/60">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(240,165,0,0.6)]" />
              {t('badge')}
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
                {nameChars.map((c, i) => (
                  <motion.span key={i} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-primary to-[#FFD166] drop-shadow-[0_0_20px_rgba(240,165,0,0.3)]">
                    {c}
                  </motion.span>
                ))}
              </motion.h1>
            </div>

            <motion.h2 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content leading-tight">
              {t('titleLine1')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FFD166]">
                {t('titleLine2')} {t('titleLine3')}
              </span>
            </motion.h2>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.8 }}
              className="text-lg text-base-content/50 max-w-lg font-light leading-relaxed mx-auto lg:mx-0">
              {t('description')}
            </motion.p>
          </div>

          {/* Right — Portrait with clip-path reveal */}
          <div className="order-1 lg:order-2 flex justify-center perspective-[2000px]">
            <motion.div
              initial={{ clipPath: 'circle(0% at 50% 50%)' }}
              animate={{ clipPath: 'circle(75% at 50% 50%)' }}
              transition={{ delay: 0.6, duration: 1.8, ease: [0.77, 0, 0.175, 1] }}
              style={{ y: yParallax, rotateX: 3, rotateY: -3 }}
              whileHover={{ rotateX: 0, rotateY: 0, scale: 1.02 }}
              className="relative w-full max-w-md aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(240,165,0,0.2)] group"
            >
              <motion.div style={{ x: imgX, y: imgY }} className="absolute inset-[-30px] w-[calc(100%+60px)] h-[calc(100%+60px)]">
                <Image src="/images/m9.JPG" alt="Kalvin — Portrait" fill sizes="(max-width: 448px) 100vw, 448px" className="object-cover transition-transform duration-[3s] group-hover:scale-105" priority />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-primary/15 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-700" />
              <div className="absolute bottom-6 left-6 z-10">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary drop-shadow-sm">{t('subtitle')}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 z-10" style={{ animation: 'scroll-pulse 2s ease-in-out infinite' }}>
          <ChevronDown className="w-6 h-6 text-primary" />
        </div>
      </section>

      {/* ═══ SECTION 2 — ANIMATED COUNTERS ═══ */}
      <section className="py-20 border-y border-base-content/5 bg-base-200/30 dark:bg-white/[0.01] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
          {[
            { target: 3, suffix: '+', label: t('stats.years') },
            { target: 20, suffix: '+', label: t('stats.projects') },
            { target: 100, suffix: '%', label: t('stats.engagement') },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1} className="text-center group">
              <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-base-content to-base-content/50 group-hover:from-primary group-hover:to-[#FFD166] transition-all duration-500">
                <AnimatedCounter target={s.target} suffix={s.suffix} />
              </div>
              <div className="w-8 h-[2px] bg-primary/30 group-hover:bg-primary group-hover:w-12 transition-all duration-500 mx-auto mb-2" />
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 group-hover:text-primary/80 transition-colors duration-500">{s.label}</div>
            </FadeIn>
          ))}
          <FadeIn delay={0.3} className="text-center group">
            <motion.div initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }}
              transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
              className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-base-content to-base-content/50 group-hover:from-primary group-hover:to-[#FFD166] transition-all duration-500">
              ∞
            </motion.div>
            <div className="w-8 h-[2px] bg-primary/30 group-hover:bg-primary group-hover:w-12 transition-all duration-500 mx-auto mb-2" />
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 group-hover:text-primary/80 transition-colors">{t('stats.passion')}</div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 3 — SCROLL REVEAL VISION ═══ */}
      <section ref={visionRef} className="py-28 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span className="w-8 h-[2px] rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{t('vision.eyebrow')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight mb-16">{t('vision.title')}</h2>
          </FadeIn>

          <div className="text-xl sm:text-2xl leading-relaxed text-base-content font-light mb-12">
            {visionText.map((word, i) => (
              <ScrollWord key={i} progress={visionProgress} index={i} total={visionText.length + visionP3.length + 5}>
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
            <div className="absolute -top-4 -left-2 text-6xl text-primary/20 font-serif">&ldquo;</div>
            <p className="text-xl sm:text-2xl text-base-content/80 italic font-light leading-relaxed">{t('vision.quote')}</p>
          </motion.blockquote>

          <div className="text-xl sm:text-2xl leading-relaxed text-base-content font-light">
            {visionP3.map((word, i) => (
              <ScrollWord key={i} progress={visionProgress} index={visionText.length + 5 + i} total={visionText.length + visionP3.length + 5}>
                {word}
              </ScrollWord>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4 — VALUES (Spotlight Cards) ═══ */}
      <section className="py-24 px-4 sm:px-6 bg-base-200/30 dark:bg-white/[0.01] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2.5 mb-6 mx-auto">
              <span className="w-8 h-[2px] rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{t('values_section.eyebrow')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight">{t('values_section.title')}</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div
                  onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSpotPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
                  className="group relative p-7 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-base-content/[0.06] dark:border-base-content/[0.04] hover:border-primary/40 transition-all duration-700 shadow-md hover:shadow-2xl hover:shadow-primary/10 overflow-hidden h-full cursor-default"
                >
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: `radial-gradient(350px circle at ${spotPos.x}px ${spotPos.y}px, rgba(240,165,0,0.12), transparent 50%)` }} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-base-200 dark:bg-white/5 flex items-center justify-center mb-5 text-base-content/50 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-[#FFD166] group-hover:text-black group-hover:shadow-[0_0_25px_rgba(240,165,0,0.4)] transition-all duration-500">
                      <v.icon className="w-7 h-7" strokeWidth={1.5} />
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

      {/* ═══ SECTION 5 — TIMELINE ═══ */}
      <section className="py-28 px-4 sm:px-6 relative">
        <div className="absolute top-0 bottom-0 left-[calc(50%-1px)] w-[2px] bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span className="w-8 h-[2px] rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{t('timeline.eyebrow')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight mb-16">{t('timeline.title')}</h2>
          </FadeIn>

          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(240,165,0,0.2)]">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-2xl text-base-content">{t('timeline.experience')}</h3>
          </div>
          <div className="space-y-6">{EXPERIENCE.map((item, i) => <TimelineCard key={i} item={item} index={i} />)}</div>

          <div className="flex items-center gap-3 mb-10 mt-20">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(240,165,0,0.2)]">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-2xl text-base-content">{t('timeline.education')}</h3>
          </div>
          <div className="space-y-6">{EDUCATION.map((item, i) => <TimelineCard key={i} item={item} index={i} />)}</div>
        </div>
      </section>

      {/* ═══ SECTION 6 — MARQUEE TESTIMONIALS ═══ */}
      <section className="py-28 bg-base-200/50 dark:bg-[#070510] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />

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

      {/* ═══ SECTION 7 — GRAVITATIONAL CTA ═══ */}
      <section className="py-28 sm:py-36 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <motion.div className="absolute inset-0 opacity-20 pointer-events-none"
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
                  {/* Orbital ring */}
                  <div className="absolute -inset-3 rounded-full border border-primary/20 pointer-events-none" style={{ animation: 'orbital-spin 8s linear infinite' }}>
                    <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(240,165,0,0.8)]" />
                  </div>
                  <Link href="/contact" className="relative group overflow-hidden cursor-pointer flex justify-center items-center px-10 py-5 rounded-full bg-gradient-to-r from-primary to-[#FFD166] text-black font-extrabold text-lg shadow-[0_0_30px_rgba(240,165,0,0.3)] hover:shadow-[0_0_50px_rgba(240,165,0,0.5)] transition-all duration-500 hover:scale-105">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-3">
                      {t('cta.ctaPrimary')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>
              </MagneticWrapper>

              <MagneticWrapper strength={0.2}>
                <a href="/cv/cv_kalvin.pdf" download className="relative overflow-hidden cursor-pointer flex justify-center items-center px-10 py-5 rounded-full border border-base-content/10 bg-base-200/50 dark:bg-white/5 backdrop-blur-xl hover:border-primary/50 hover:bg-primary/10 text-base-content/80 hover:text-primary font-bold text-lg transition-all duration-500 shadow-sm hover:shadow-[0_0_20px_rgba(240,165,0,0.2)] gap-3">
                  <Download className="w-5 h-5" />
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
