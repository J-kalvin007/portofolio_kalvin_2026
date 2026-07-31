// 'use client';

// import React, { useRef, useState } from 'react';
// import Image from 'next/image';
// import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
// import { Terminal, Globe, Cpu, Shield, ArrowRight, Download, Briefcase, GraduationCap, MapPin, Calendar, ChevronDown } from 'lucide-react';
// import { useTranslations } from 'next-intl';
// import { Link } from '@/i18n/navigation';
// import FadeIn from '@/components/animations/FadeIn';
// import MagneticWrapper from '@/components/animations/MagneticWrapper';
// import { type TimelineItem } from '@/lib/data/experience';
// import StardustCursor from '@/components/animations/StardustCursor';
// import { AnimatedCounter, ScrollWord, MarqueeRow } from './AboutAnimations';
// import TimelineCard from './TimelineCard';

// export default function AboutPage() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const visionRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
//   const { scrollYProgress: visionProgress } = useScroll({ target: visionRef, offset: ['start 0.8', 'end 0.3'] });
//   const yParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);
//   const imgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
//   const imgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });

//   const handleMouseMove = (e: React.MouseEvent) => {
//     mouseX.set(e.clientX / window.innerWidth - 0.5);
//     mouseY.set(e.clientY / window.innerHeight - 0.5);
//   };

//   const t = useTranslations('about_page');
//   const tExp = useTranslations('experience');
//   const tTest = useTranslations('testimonials');

//   const VALUES = [
//     { icon: Terminal, title: t('values.excellence'), desc: t('values.excellence_desc') },
//     { icon: Globe, title: t('values.vision'), desc: t('values.vision_desc') },
//     { icon: Cpu, title: t('values.innovation'), desc: t('values.innovation_desc') },
//     { icon: Shield, title: t('values.reliability'), desc: t('values.reliability_desc') },
//   ];

//   const EXPERIENCE: TimelineItem[] = [
//     { title: tExp('job1_title'), subtitle: tExp('job1_subtitle'), period: tExp('job1_period'), description: tExp('job1_description'), tags: ['Architecture', 'Next.js', 'Node.js', 'Leadership'], location: tExp('job1_location'), type: 'work' },
//     { title: tExp('job2_title'), subtitle: tExp('job2_subtitle'), period: tExp('job2_period'), description: tExp('job2_description'), tags: ['Full-Stack', 'React Native', 'Django', 'B2B'], location: tExp('job2_location'), type: 'work' },
//   ];

//   const EDUCATION: TimelineItem[] = [
//     { title: tExp('edu1_title'), subtitle: tExp('edu1_subtitle'), period: tExp('edu1_period'), description: tExp('edu1_description'), location: tExp('edu1_location'), type: 'education' },
//     { title: tExp('edu2_title'), subtitle: tExp('edu2_subtitle'), period: tExp('edu2_period'), description: tExp('edu2_description'), location: tExp('edu2_location'), type: 'education' },
//   ];

//   const TESTIMONIALS = [
//     { quote: tTest('t1_quote'), author: tTest('t1_author'), role: tTest('t1_role'), company: tTest('t1_company') },
//     { quote: tTest('t2_quote'), author: tTest('t2_author'), role: tTest('t2_role'), company: tTest('t2_company') },
//     { quote: tTest('t3_quote'), author: tTest('t3_author'), role: tTest('t3_role'), company: tTest('t3_company') },
//   ];

//   const nameChars = 'Kalvin'.split('');
//   const visionText = `${t('vision.p1')} ${t('vision.p2')}`.split(' ');
//   const visionP3 = t('vision.p3').split(' ');

//   const [spotPos, setSpotPos] = useState({ x: 0, y: 0 });

//   return (
//     <div ref={containerRef} onMouseMove={handleMouseMove} className="min-h-screen bg-base-100 text-base-content overflow-x-hidden relative">
//       <StardustCursor />

//       {/* ═══ SECTION 1 — CINEMATIC HERO ═══ */}
//       <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
//         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-primary/5 blur-[180px] pointer-events-none" />
//         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px] pointer-events-none" />

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
//           {/* Left — Text */}
//           <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold tracking-[0.2em] uppercase text-base-content/60">
//               <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(240,165,0,0.6)]" />
//               {t('badge')}
//             </motion.div>

//             <div className="overflow-hidden">
//               <motion.h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
//                 {nameChars.map((c, i) => (
//                   <motion.span key={i} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.4 + i * 0.07, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
//                     className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-primary to-[#FFD166] drop-shadow-[0_0_20px_rgba(240,165,0,0.3)]">
//                     {c}
//                   </motion.span>
//                 ))}
//               </motion.h1>
//             </div>

//             <motion.h2 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 1, duration: 0.7 }}
//               className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content leading-tight">
//               {t('titleLine1')}
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FFD166]">
//                 {t('titleLine2')} {t('titleLine3')}
//               </span>
//             </motion.h2>

//             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.8 }}
//               className="text-lg text-base-content/50 max-w-lg font-light leading-relaxed mx-auto lg:mx-0">
//               {t('description')}
//             </motion.p>
//           </div>

//           {/* Right — Portrait with clip-path reveal */}
//           <div className="order-1 lg:order-2 flex justify-center perspective-[2000px]">
//             <motion.div
//               initial={{ clipPath: 'circle(0% at 50% 50%)' }}
//               animate={{ clipPath: 'circle(75% at 50% 50%)' }}
//               transition={{ delay: 0.6, duration: 1.8, ease: [0.77, 0, 0.175, 1] }}
//               style={{ y: yParallax, rotateX: 3, rotateY: -3 }}
//               whileHover={{ rotateX: 0, rotateY: 0, scale: 1.02 }}
//               className="relative w-full max-w-md aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(240,165,0,0.2)] group"
//             >
//               <motion.div style={{ x: imgX, y: imgY }} className="absolute inset-[-30px] w-[calc(100%+60px)] h-[calc(100%+60px)]">
//                 <Image src="/images/m9.JPG" alt="Kalvin — Portrait" fill sizes="(max-width: 448px) 100vw, 448px" className="object-cover transition-transform duration-[3s] group-hover:scale-105" priority />
//               </motion.div>
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
//               <div className="absolute inset-0 bg-primary/15 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-700" />
//               <div className="absolute bottom-6 left-6 z-10">
//                 <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary drop-shadow-sm">{t('subtitle')}</p>
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         {/* Scroll indicator */}
//         <div className="absolute bottom-8 left-1/2 z-10" style={{ animation: 'scroll-pulse 2s ease-in-out infinite' }}>
//           <ChevronDown className="w-6 h-6 text-primary" />
//         </div>
//       </section>

//       {/* ═══ SECTION 2 — ANIMATED COUNTERS ═══ */}
//       <section className="py-20 border-y border-base-content/5 bg-base-200/30 dark:bg-white/[0.01] relative overflow-hidden">
//         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
//         <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
//           {[
//             { target: 3, suffix: '+', label: t('stats.years') },
//             { target: 20, suffix: '+', label: t('stats.projects') },
//             { target: 100, suffix: '%', label: t('stats.engagement') },
//           ].map((s, i) => (
//             <FadeIn key={s.label} delay={i * 0.1} className="text-center group">
//               <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-base-content to-base-content/50 group-hover:from-primary group-hover:to-[#FFD166] transition-all duration-500">
//                 <AnimatedCounter target={s.target} suffix={s.suffix} />
//               </div>
//               <div className="w-8 h-[2px] bg-primary/30 group-hover:bg-primary group-hover:w-12 transition-all duration-500 mx-auto mb-2" />
//               <div className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 group-hover:text-primary/80 transition-colors duration-500">{s.label}</div>
//             </FadeIn>
//           ))}
//           <FadeIn delay={0.3} className="text-center group">
//             <motion.div initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }}
//               transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
//               className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-base-content to-base-content/50 group-hover:from-primary group-hover:to-[#FFD166] transition-all duration-500">
//               ∞
//             </motion.div>
//             <div className="w-8 h-[2px] bg-primary/30 group-hover:bg-primary group-hover:w-12 transition-all duration-500 mx-auto mb-2" />
//             <div className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 group-hover:text-primary/80 transition-colors">{t('stats.passion')}</div>
//           </FadeIn>
//         </div>
//       </section>

//       {/* ═══ SECTION 3 — SCROLL REVEAL VISION ═══ */}
//       <section ref={visionRef} className="py-28 px-4 sm:px-6 relative">
//         <div className="max-w-4xl mx-auto">
//           <FadeIn>
//             <div className="inline-flex items-center gap-2.5 mb-6">
//               <span className="w-8 h-[2px] rounded-full bg-primary" />
//               <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{t('vision.eyebrow')}</span>
//             </div>
//             <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight mb-16">{t('vision.title')}</h2>
//           </FadeIn>

//           <div className="text-xl sm:text-2xl leading-relaxed text-base-content font-light mb-12">
//             {visionText.map((word, i) => (
//               <ScrollWord key={i} progress={visionProgress} index={i} total={visionText.length + visionP3.length + 5}>
//                 {word}
//               </ScrollWord>
//             ))}
//           </div>

//           <motion.blockquote
//             initial={{ opacity: 0, scale: 0.95 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//             className="relative p-8 sm:p-10 rounded-[2rem] glass border-l-4 border-primary my-12 shadow-xl"
//           >
//             <div className="absolute -top-4 -left-2 text-6xl text-primary/20 font-serif">&ldquo;</div>
//             <p className="text-xl sm:text-2xl text-base-content/80 italic font-light leading-relaxed">{t('vision.quote')}</p>
//           </motion.blockquote>

//           <div className="text-xl sm:text-2xl leading-relaxed text-base-content font-light">
//             {visionP3.map((word, i) => (
//               <ScrollWord key={i} progress={visionProgress} index={visionText.length + 5 + i} total={visionText.length + visionP3.length + 5}>
//                 {word}
//               </ScrollWord>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ═══ SECTION 4 — VALUES (Spotlight Cards) ═══ */}
//       <section className="py-24 px-4 sm:px-6 bg-base-200/30 dark:bg-white/[0.01] relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
//         <div className="max-w-6xl mx-auto relative z-10">
//           <FadeIn className="text-center mb-16">
//             <div className="inline-flex items-center gap-2.5 mb-6 mx-auto">
//               <span className="w-8 h-[2px] rounded-full bg-primary" />
//               <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{t('values_section.eyebrow')}</span>
//             </div>
//             <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight">{t('values_section.title')}</h2>
//           </FadeIn>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
//             {VALUES.map((v, i) => (
//               <FadeIn key={i} delay={i * 0.12}>
//                 <div
//                   onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSpotPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
//                   className="group relative p-7 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-base-content/[0.06] dark:border-base-content/[0.04] hover:border-primary/40 transition-all duration-700 shadow-md hover:shadow-2xl hover:shadow-primary/10 overflow-hidden h-full cursor-default"
//                 >
//                   <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
//                     style={{ background: `radial-gradient(350px circle at ${spotPos.x}px ${spotPos.y}px, rgba(240,165,0,0.12), transparent 50%)` }} />
//                   <div className="relative z-10">
//                     <div className="w-14 h-14 rounded-2xl bg-base-200 dark:bg-white/5 flex items-center justify-center mb-5 text-base-content/50 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-[#FFD166] group-hover:text-black group-hover:shadow-[0_0_25px_rgba(240,165,0,0.4)] transition-all duration-500">
//                       <v.icon className="w-7 h-7" strokeWidth={1.5} />
//                     </div>
//                     <h3 className="font-bold text-lg text-base-content mb-2 group-hover:text-primary transition-colors">{v.title}</h3>
//                     <p className="text-sm text-base-content/55 leading-relaxed font-light">{v.desc}</p>
//                   </div>
//                 </div>
//               </FadeIn>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ═══ SECTION 5 — TIMELINE ═══ */}
//       <section className="py-28 px-4 sm:px-6 relative">
//         <div className="absolute top-0 bottom-0 left-[calc(50%-1px)] w-[2px] bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />
//         <div className="max-w-4xl mx-auto relative z-10">
//           <FadeIn>
//             <div className="inline-flex items-center gap-2.5 mb-6">
//               <span className="w-8 h-[2px] rounded-full bg-primary" />
//               <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{t('timeline.eyebrow')}</span>
//             </div>
//             <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight mb-16">{t('timeline.title')}</h2>
//           </FadeIn>

//           <div className="flex items-center gap-3 mb-10">
//             <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(240,165,0,0.2)]">
//               <Briefcase className="w-6 h-6 text-primary" />
//             </div>
//             <h3 className="font-bold text-2xl text-base-content">{t('timeline.experience')}</h3>
//           </div>
//           <div className="space-y-6">{EXPERIENCE.map((item, i) => <TimelineCard key={i} item={item} index={i} />)}</div>

//           <div className="flex items-center gap-3 mb-10 mt-20">
//             <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(240,165,0,0.2)]">
//               <GraduationCap className="w-6 h-6 text-primary" />
//             </div>
//             <h3 className="font-bold text-2xl text-base-content">{t('timeline.education')}</h3>
//           </div>
//           <div className="space-y-6">{EDUCATION.map((item, i) => <TimelineCard key={i} item={item} index={i} />)}</div>
//         </div>
//       </section>

//       {/* ═══ SECTION 6 — MARQUEE TESTIMONIALS ═══ */}
//       <section className="py-28 bg-base-200/50 dark:bg-[#070510] relative overflow-hidden">
//         <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
//         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />

//         <div className="relative z-10">
//           <FadeIn className="text-center mb-14 px-6">
//             <h2 className="text-4xl md:text-6xl font-bold text-base-content/90 dark:text-white/90">{t('testimonials.title')}</h2>
//           </FadeIn>
//           <div className="space-y-6">
//             <MarqueeRow items={TESTIMONIALS} direction="left" speed={30} />
//             <MarqueeRow items={TESTIMONIALS} direction="right" speed={35} />
//           </div>
//         </div>
//       </section>

//       {/* ═══ SECTION 7 — GRAVITATIONAL CTA ═══ */}
//       <section className="py-28 sm:py-36 px-4 sm:px-6 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
//         <motion.div className="absolute inset-0 opacity-20 pointer-events-none"
//           animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
//           transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px]" />
//         </motion.div>

//         <div className="relative z-10 max-w-4xl mx-auto text-center">
//           <FadeIn>
//             <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-base-content leading-tight tracking-tight">
//               {t('cta.title1')}<br />
//               <span className="text-primary font-bold">{t('cta.title2')}</span>
//             </h2>
//             <p className="mt-6 text-base sm:text-lg text-base-content/50 font-light max-w-xl mx-auto">{t('cta.description')}</p>

//             <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12">
//               <MagneticWrapper strength={0.3}>
//                 <div className="relative">
//                   {/* Orbital ring */}
//                   <div className="absolute -inset-3 rounded-full border border-primary/20 pointer-events-none" style={{ animation: 'orbital-spin 8s linear infinite' }}>
//                     <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(240,165,0,0.8)]" />
//                   </div>
//                   <Link href="/contact" className="relative group overflow-hidden cursor-pointer flex justify-center items-center px-10 py-5 rounded-full bg-gradient-to-r from-primary to-[#FFD166] text-black font-extrabold text-lg shadow-[0_0_30px_rgba(240,165,0,0.3)] hover:shadow-[0_0_50px_rgba(240,165,0,0.5)] transition-all duration-500 hover:scale-105">
//                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
//                     <span className="relative z-10 flex items-center gap-3">
//                       {t('cta.ctaPrimary')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                     </span>
//                   </Link>
//                 </div>
//               </MagneticWrapper>

//               <MagneticWrapper strength={0.2}>
//                 <a href="/cv/cv_kalvin.pdf" download className="relative overflow-hidden cursor-pointer flex justify-center items-center px-10 py-5 rounded-full border border-base-content/10 bg-base-200/50 dark:bg-white/5 backdrop-blur-xl hover:border-primary/50 hover:bg-primary/10 text-base-content/80 hover:text-primary font-bold text-lg transition-all duration-500 shadow-sm hover:shadow-[0_0_20px_rgba(240,165,0,0.2)] gap-3">
//                   <Download className="w-5 h-5" />
//                   <span className="relative z-10">{t('cta.ctaSecondary')}</span>
//                 </a>
//               </MagneticWrapper>
//             </div>
//           </FadeIn>
//         </div>
//       </section>
//     </div>
//   );
// }






























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
 *
 * @remarks Direction artistique : « Atelier ».
 * Le hero conserve son seul élément vraiment distinctif — les anneaux orbitaux
 * autour du portrait, qui disent quelque chose de vrai sur le métier
 * d'architecte. Tout le reste a été mis au silence : le calque de fond redondant,
 * l'auréole du portrait, le verre empilé des badges. Un seul geste spectaculaire,
 * exécuté avec précision, vaut mieux que six effets qui se disputent l'attention.
 */

import React, { useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Code2, Rocket, Eye, Shield, Download } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import FadeIn from '@/components/animations/FadeIn';
import StaggerChildren, { StaggerItem } from '@/components/animations/StaggerChildren';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { FEATURED_PROJECTS } from '@/lib/data/projects';
import { SKILLS } from '@/lib/data/skills';
import StardustCursor from '@/components/animations/StardustCursor';
import TypewriterText from './components/TypewriterText';
import MarqueeRow from './components/MarqueeRow';
// ⚠️ L'espace avant l'extension est intentionnellement conservé : le fichier
// s'appelle littéralement « FeaturedProjectCard .tsx ». Renommer les deux
// (fichier + import) est vivement recommandé — voir la note de livraison.
import FeaturedProjectCard from './components/FeaturedProjectCard ';

/* ═══════════════════════════════════════════════
   TOKENS DE LA PAGE D'ACCUEIL
   ═══════════════════════════════════════════════ */

/** Décélération franche, sans rebond — identique sur toute l'application. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Amplitude du glissement parallaxe du hero, en pixels. */
const HERO_PARALLAX_DISTANCE = 150;

/* ═══════════════════════════════════════════════
   COMPOSANT PAGE PRINCIPALE (HOME PAGE)
   ═══════════════════════════════════════════════ */

export default function HomePage() {
  // Hooks pour l'effet Parallax du bloc Hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  const shouldReduceMotion = useReducedMotion();

  // Transforme la progression du scroll en un mouvement et une opacité (Le Hero disparaît doucement)
  const heroY = useTransform(scrollYProgress, [0, 1], [0, HERO_PARALLAX_DISTANCE]);
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
  // Mémoïsé : le tableau alimente une dépendance d'effet dans `TypewriterText`.
  // Recréé à chaque rendu, il relançait le minuteur de frappe à chaque fois.
  const typewriterWords = useMemo(
    () => [t('words.engineer'), t('words.architect'), t('words.artisan')],
    [t]
  );

  // Tri des compétences pour les carrousels (Frontend en haut, le reste en bas)
  const frontendSkills = useMemo(() => SKILLS.find(c => c.title === 'Frontend')?.skills || [], []);
  const backendSkills = useMemo(() => SKILLS.filter(c => c.title !== 'Frontend').flatMap(c => c.skills), []);

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

  /** Libellé hors catalogue i18n pour l'indicateur de défilement. */
  const scrollHint = locale === 'fr' ? 'Faire défiler vers le contenu' : 'Scroll to content';

  /** Le défilement programmatique respecte lui aussi la préférence système. */
  const handleScrollToContent = () =>
    window.scrollTo({ top: window.innerHeight, behavior: shouldReduceMotion ? 'auto' : 'smooth' });

  return (

    <div className="min-h-screen bg-base-100 text-base-content overflow-x-hidden relative">
      <StardustCursor />

      {/* ═══════════════════ SECTION : HERO ═══════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center">

        {/* Arrière-plan complexe avec des Orbes Lumineuses Floues */}
        <div className="absolute inset-0" aria-hidden="true">

          {/* Le calque `bg-base-100` plein écran a été retiré : la racine porte
              déjà cette couleur, il ne faisait que doubler une peinture. */}

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

        <motion.div
          style={{ y: shouldReduceMotion ? 0 : heroY, opacity: shouldReduceMotion ? 1 : heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]"
        >

          {/* Colonne Gauche : Titre et Description */}
          <div className="text-left space-y-8 max-w-2xl">

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-base-content leading-[1.06] tracking-[-0.035em]">

                {t('greeting')} <span className="text-gradient">Kalvin</span><br />

                {/* `whitespace-nowrap` retiré sous le point de rupture `sm` :
                    avec la largeur désormais réservée pour le mot le plus long,
                    la ligne débordait de l'écran sur les téléphones étroits —
                    et `overflow-x-hidden` la coupait silencieusement. */}
                <span className="inline-flex flex-wrap sm:flex-nowrap sm:whitespace-nowrap items-center gap-2 sm:gap-3 lg:gap-4 mt-1 sm:mt-2">

                  {locale === 'fr' ? (

                    <>

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
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: EASE_OUT_EXPO }}
              className="text-lg sm:text-xl text-base-content/60 font-light leading-[1.75] max-w-xl text-pretty"
            >
              {t.rich('description', {
                bold1: (chunks) => <span className="text-base-content/90 font-medium">{chunks}</span>,
                bold2: (chunks) => <span className="text-base-content/90 font-medium">{chunks}</span>,
              })}
            </motion.p>

            {/* Boutons d'Appel à l'Action (CTAs) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8, ease: EASE_OUT_EXPO }}
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-4"
            >

              <Link href="/projets"
                className="cursor-pointer group flex justify-center items-center gap-2 px-8 py-3.5 sm:px-8 sm:py-4 rounded-full
                           bg-base-content text-base-100 dark:bg-primary dark:text-primary-content font-bold
                           shadow-[0_1px_2px_rgba(0,0,0,0.14),0_16px_32px_-18px_rgba(0,0,0,0.6)]
                           hover:shadow-[0_1px_2px_rgba(0,0,0,0.14),0_24px_44px_-20px_rgba(0,0,0,0.7)]
                           hover:-translate-y-0.5 motion-reduce:transform-none
                           transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
                           w-[240px] sm:w-auto"
              >
                {t('ctaPrimary')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" aria-hidden="true" />
              </Link>

              <Link href="/contact"
                className="cursor-pointer flex justify-center items-center px-8 py-3.5 sm:px-8 sm:py-4 rounded-full
                           border border-base-content/[0.12] hover:border-base-content/30 hover:bg-base-200/40
                           text-base-content/80 font-bold transition-colors duration-300
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
                           w-[240px] sm:w-auto"
              >
                {t('ctaSecondary')}
              </Link>

            </motion.div>

          </div>

          {/* Colonne Droite : Visuels (Portrait et Orbites) */}
          <div className="relative flex justify-center items-center h-[400px] sm:h-[500px] lg:h-[600px] mt-10 lg:mt-0">

            {/* Anneaux orbitaux tournants (`animate-[spin_...]`) — l'élément
                signature de la page. Deux orbites seulement, en trait continu :
                le pointillé les faisait lire comme un placeholder. */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] rounded-full border border-base-content/[0.07] animate-[spin_40s_linear_infinite] motion-reduce:animate-none" />
              <div className="absolute w-[380px] h-[380px] sm:w-[550px] sm:h-[550px] rounded-full border border-base-content/[0.04] animate-[spin_60s_linear_infinite_reverse] motion-reduce:animate-none" />
            </div>

            {/* Portrait central */}
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.5, ease: EASE_OUT_EXPO }} className="relative z-10">
              {/* Auréole remplacée par une ombre de contact : le portrait est
                  posé dans la page, il ne rayonne pas. */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full overflow-hidden
                              ring-1 ring-base-content/10 ring-offset-[14px] ring-offset-base-100
                              shadow-[0_32px_64px_-28px_rgba(0,0,0,0.55)]">
                <Image src="/images/Kalvin.jpg" alt="Kalvin" fill sizes="(max-width: 640px) 224px, 288px" className="object-cover" priority />
                <div aria-hidden="true" className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.18)] pointer-events-none" />
              </div>
            </motion.div>

            {/* Badges Flottants (Animés en suspension avec y: [-10, 10, -10]) */}
            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-[10%] right-[5%] sm:right-[15%] z-20 flex items-center gap-2
                         bg-base-100/85 backdrop-blur-xl border border-base-content/[0.09] px-4 py-2.5 rounded-full
                         shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_32px_-20px_rgba(0,0,0,0.45)]"
            >
              <div className="p-1 rounded-full bg-accent/10"><Rocket className="w-3.5 h-3.5 text-accent" aria-hidden="true" /></div>
              <span className="text-xs font-bold text-base-content/80 whitespace-nowrap">{t('floatingBadge1')}</span>
            </motion.div>

            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[15%] left-[5%] sm:left-[10%] z-20 flex items-center gap-2
                         bg-base-100/85 backdrop-blur-xl border border-base-content/[0.09] px-4 py-2.5 rounded-full
                         shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_32px_-20px_rgba(0,0,0,0.45)]"
            >
              <div className="p-1 rounded-full bg-primary/10"><Code2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" /></div>
              <span className="text-xs font-bold text-base-content/80 whitespace-nowrap">{t('floatingBadge2')}</span>
            </motion.div>

            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
              className="absolute top-[40%] -left-[5%] sm:-left-[10%] z-20 flex items-center justify-center
                         bg-base-100/85 backdrop-blur-xl border border-base-content/[0.09] p-3 rounded-full
                         shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_32px_-20px_rgba(0,0,0,0.45)]"
              aria-hidden="true"
            >
              <Shield className="w-4 h-4 text-base-content/60" />
            </motion.div>

          </div>

          {/* Indicateur de Défilement Visuel (Petite souris animée en bas) */}
          {/* Devenu un vrai `<button>` : c'était un `div` cliquable, inaccessible
              au clavier et invisible aux technologies d'assistance. */}
          <motion.button
            type="button"
            onClick={handleScrollToContent}
            aria-label={scrollHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer
                       rounded-full p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
          >
            <motion.span
              animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-6 h-10 border-2 border-base-content/20 rounded-full flex justify-center p-1"
              aria-hidden="true"
            >
              <span className="w-1 h-2 bg-base-content/40 rounded-full" />
            </motion.span>
          </motion.button>

        </motion.div>

      </section>

      {/* ═══════════════════ SECTION : TEASER (À PROPOS) ═══════════════════ */}
      <section className="pt-48 pb-2 sm:pt-64 sm:pb-2 px-4 sm:px-6 relative z-10">

        <div className="max-w-6xl mx-auto">

          <div className="grid md:grid-cols-2 gap-16 items-center">

            <FadeIn direction="left">

              <SectionHeader eyebrow={tTeaser('eyebrow')} title={tTeaser('title')} />

              <div className="space-y-5 text-lg text-base-content/60 font-light leading-[1.75]">

                <p className="text-pretty">
                  {tTeaser.rich('p1', { bold: (chunks) => <strong className="text-base-content/90 font-medium">{chunks}</strong> })}
                </p>

                <p className="text-pretty">
                  {tTeaser.rich('p2', { bold: (chunks) => <strong className="text-base-content/90 font-medium">{chunks}</strong> })}
                </p>

              </div>

              {/* `hover:gap-3` faisait grandir le bouton au survol et poussait la
                  page : c'est la flèche seule qui avance désormais. */}
              <Link
                href="/propos"
                className="cursor-pointer group inline-flex items-center gap-2 mt-8 text-primary font-bold
                           rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
              >
                {tTeaser('cta')}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
              </Link>

            </FadeIn>

            <FadeIn direction="right" delay={0.2} className="w-full">

              {/* Utilisation de StaggerChildren pour faire apparaître les blocs 1 par 1 */}
              <StaggerChildren staggerDelay={0.12} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {VALUES.map((val, i) => (

                  <StaggerItem key={i}>

                    <div className="group p-5 sm:p-6 rounded-[1.5rem] h-full flex flex-col justify-center
                                    bg-base-100 dark:bg-white/[0.028]
                                    border border-base-content/[0.07] dark:border-white/[0.05]
                                    shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_1px_2px_-1px_rgba(0,0,0,0.04)]
                                    dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]
                                    hover:border-primary/25
                                    hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_16px_32px_-24px_rgba(0,0,0,0.3)]
                                    transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      <val.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-500 motion-reduce:transform-none" aria-hidden="true" />
                      <h3 className="font-bold text-sm sm:text-base text-base-content mb-1 tracking-[-0.015em]">{val.title}</h3>
                      <p className="text-[11px] sm:text-xs text-base-content/50 leading-[1.6]">{val.desc}</p>
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden" aria-hidden="true">
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
            <Link
              href="/projets"
              className="cursor-pointer group inline-flex items-center gap-2 px-8 py-4 rounded-full
                         border border-primary/25 text-primary font-bold
                         hover:bg-primary hover:text-primary-content hover:border-primary
                         transition-colors duration-300
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            >
              {tFeatured('viewAll')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" aria-hidden="true" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ SECTION : STATISTIQUES ═══════════════════ */}
      <section className="py-20 px-4 sm:px-6 border-y border-base-content/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-base-content tracking-[-0.035em] tabular-nums">
                  {/* Composant local qui compte de 0 à la valeur cible quand il entre à l'écran */}
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-base-content/40 mt-2">
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

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-[-0.035em] text-balance">
              {tCta('title1')}
              <br />
              <span className="text-primary">{tCta('title2')}</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-base-content/50 font-light max-w-xl mx-auto leading-[1.7] text-pretty">
              {tCta('description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">

              {/* `bg-primary/80` : un aplat de marque à 80 % d'opacité laisse
                  transparaître le fond et change de teinte entre les thèmes.
                  L'or est désormais plein. */}
              <Link href="/contact"
                className="cursor-pointer group flex items-center justify-center gap-2 sm:gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full
                           bg-primary text-primary-content font-bold text-base sm:text-lg
                           shadow-[0_2px_4px_rgba(0,0,0,0.16),0_24px_48px_-24px_rgba(0,0,0,0.65)]
                           hover:brightness-[1.06] hover:-translate-y-1 motion-reduce:transform-none
                           transition-[filter,transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
                           w-[260px] sm:w-auto"
              >
                {tCta('ctaPrimary')}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" aria-hidden="true" />
              </Link>

              {/* Le CV est lié à un fichier PDF stocké dans le dossier `public/cv/` */}
              <a href="/cv/cv_kalvin.pdf" download
                className="cursor-pointer flex items-center justify-center gap-2 px-8 py-4 sm:px-8 sm:py-5 rounded-full
                           border border-base-content/[0.12] hover:border-primary/40
                           text-base-content/60 hover:text-primary font-bold text-base sm:text-lg
                           transition-colors duration-300
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
                           w-[260px] sm:w-auto"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                {tCta('ctaSecondary')}
              </a>

            </div>

          </FadeIn>

        </div>

      </section>

    </div>
  );
}