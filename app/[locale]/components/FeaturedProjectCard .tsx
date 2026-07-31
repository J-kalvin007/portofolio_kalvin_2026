// import FadeIn from "@/components/animations/FadeIn";
// import { AnimatePresence, motion } from "framer-motion";
// import { ArrowRight, ChevronLeft, ChevronRight, Github } from "lucide-react";
// import { useTranslations, useLocale } from 'next-intl';
// import { Link } from '@/i18n/navigation';
// import { useState } from "react";
// import Image from "next/image";
// import ImageLightbox from "./ImageLightbox";


// /**
//  * @component FeaturedProjectCard
//  * @description Carte "Mise en avant" d'un projet sur la page d'accueil.
//  * Dispose d'un carrousel d'images intégré et ouvre une Lightbox au clic sur l'image.
//  */
// const FeaturedProjectCard = ({ project, index, tProjects }: { project: any, index: number, tProjects: any }) => {
//     const [currentImg, setCurrentImg] = useState(0);
//     const [isLightboxOpen, setIsLightboxOpen] = useState(false);
//     const images = project.images && project.images.length > 0 ? project.images : [project.coverImage];

//     const nextImg = (e?: React.MouseEvent) => {
//         e?.stopPropagation();
//         setCurrentImg((prev) => (prev + 1) % images.length);
//     };

//     const prevImg = (e?: React.MouseEvent) => {
//         e?.stopPropagation();
//         setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
//     };

//     // Alterne l'affichage (Image à gauche, Texte à droite -> ou inversement) pour casser la monotonie visuelle
//     const isEven = index % 2 === 0;

//     return (
//         <>
//             <div className={`relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center`}>
//                 {/* Section Image (Glassmorphism) */}
//                 <div className="w-full lg:w-3/5 group relative rounded-[2.5rem] p-3 sm:p-5 bg-gradient-to-br from-base-200/50 to-base-100/10 dark:from-white/[0.03] dark:to-transparent backdrop-blur-3xl border border-base-content/[0.05] dark:border-white/[0.05] shadow-2xl overflow-hidden">
//                     {/* Halo ambiant */}
//                     <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

//                     {/* Wrapper cliquable (Zoom In) */}
//                     <div className="relative aspect-[16/10] sm:aspect-video rounded-[1.5rem] overflow-hidden cursor-zoom-in shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] bg-base-300/20" onClick={() => setIsLightboxOpen(true)}>

//                         <AnimatePresence mode="wait">
//                             <motion.div
//                                 key={currentImg}
//                                 initial={{ opacity: 0, scale: 1.05 }}
//                                 animate={{ opacity: 1, scale: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 transition={{ duration: 0.5 }}
//                                 className="absolute inset-0"
//                             >
//                                 <Image src={images[currentImg]} alt={`${project.title} screenshot`} fill className="object-cover" />
//                             </motion.div>
//                         </AnimatePresence>

//                         {/* Contrôles du Carrousel (Flèches et Points) */}
//                         {images.length > 1 && (
//                             <>
//                                 <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer">
//                                     <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
//                                 </button>
//                                 <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer">
//                                     <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
//                                 </button>
//                                 {/* Points de navigation */}
//                                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
//                                     {images.map((_: any, i: number) => (
//                                         <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }} className="cursor-pointer p-2 -m-2 group/dot">
//                                             <div className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImg ? 'w-8 bg-primary shadow-[0_0_8px_var(--glow-color-strong)]' : 'w-2.5 bg-white/40 group-hover/dot:bg-white/70 group-hover/dot:w-4'}`} />
//                                         </button>
//                                     ))}
//                                 </div>
//                             </>
//                         )}

//                         {/* Icône d'indication d'agrandissement au survol */}
//                         <div className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
//                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Section Contenu (Titre, Description, Technos) */}
//                 <div className="w-full lg:w-2/5 flex flex-col justify-center">
//                     <FadeIn direction={isEven ? 'left' : 'right'}>

//                         {/* Badge de Catégorie (Ex: E-Commerce) traduit dynamiquement */}
//                         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/50 dark:bg-white/5 border border-base-content/10 mb-6">
//                             <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
//                                 {tProjects(`${project.slug === 'challenger-app' ? 'challenger' : project.slug === 'Sheem!' ? 'sheem' : project.slug === 'mboashop-ecommerce' ? 'mboashop' : project.slug === 'myriade-groupe' ? 'myriade' : project.slug === 'stock-manager' ? 'stock' : 'green'}.category`)}
//                             </span>
//                         </div>

//                         <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content mb-6 leading-tight tracking-tight cursor-text">
//                             {project.title}
//                         </h3>

//                         <p className="text-base sm:text-lg text-base-content/60 leading-relaxed mb-8 cursor-text">
//                             {tProjects(`${project.slug === 'challenger-app' ? 'challenger' : project.slug === 'Sheem!' ? 'sheem' : project.slug === 'mboashop-ecommerce' ? 'mboashop' : project.slug === 'myriade-groupe' ? 'myriade' : project.slug === 'stock-manager' ? 'stock' : 'green'}.short`)}
//                         </p>

//                         <div className="flex flex-wrap gap-2.5 mb-10">
//                             {project.techStack.map((tech: string) => (
//                                 <span key={tech} className="px-4 py-2 rounded-2xl bg-base-200/50 dark:bg-white/[0.03] border border-base-content/[0.05] text-xs sm:text-sm font-bold text-base-content/80 shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:-translate-y-0.5 cursor-default">
//                                     {tech}
//                                 </span>
//                             ))}
//                         </div>

//                         <div className="flex items-center gap-4">
//                             <Link href="/projets" className="cursor-pointer group px-8 py-4 rounded-full bg-base-content text-base-100 hover:bg-primary hover:text-primary-content transition-all duration-300 font-bold flex items-center gap-2 shadow-lg hover:shadow-primary/20">
//                                 Voir le projet
//                                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                             </Link>
//                             {project.githubUrl && (
//                                 <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer p-4 rounded-full border border-base-content/10 hover:border-base-content/30 text-base-content/70 hover:text-base-content hover:bg-base-200 dark:hover:bg-white/5 transition-all">
//                                     <Github className="w-5 h-5" />
//                                 </a>
//                             )}
//                         </div>
//                     </FadeIn>
//                 </div>
//             </div>

//             {/* Rendu de la Lightbox au-dessus du composant si déclenchée */}
//             <AnimatePresence>
//                 {isLightboxOpen && (
//                     <ImageLightbox images={images} currentIndex={currentImg} onClose={() => setIsLightboxOpen(false)} onNext={nextImg} onPrev={prevImg} />
//                 )}
//             </AnimatePresence>
//         </>
//     );
// };
// export default FeaturedProjectCard;





























"use client";

import FadeIn from "@/components/animations/FadeIn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Github, Maximize2 } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCallback, useState } from "react";
import Image from "next/image";
import ImageLightbox from "./ImageLightbox";

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CORRESPONDANCE SLUG → CLÉ DE TRADUCTION
   ───────────────────────────────────────────────────────────────────────────
   La même chaîne de six ternaires imbriqués était dupliquée pour la catégorie
   et pour le résumé : toute évolution du catalogue exigeait deux modifications
   parfaitement synchrones. La règle est extraite ici, déclarée une seule fois,
   à portée de module (aucune réallocation par rendu).
   Le comportement est strictement identique, repli `green` compris.
   ═══════════════════════════════════════════════════════════════════════════ */
const PROJECT_TRANSLATION_KEYS: Record<string, string> = {
    'challenger-app': 'challenger',
    'Sheem!': 'sheem',
    'mboashop-ecommerce': 'mboashop',
    'myriade-groupe': 'myriade',
    'stock-manager': 'stock',
};

/** Clé de repli lorsqu'un slug n'est pas répertorié — comportement d'origine conservé. */
const FALLBACK_TRANSLATION_KEY = 'green';

const resolveProjectTranslationKey = (slug: string): string =>
    PROJECT_TRANSLATION_KEYS[slug] ?? FALLBACK_TRANSLATION_KEY;

/* ── Tokens de mouvement partagés par la carte ─────────────────────────────── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Tailles servies par le pipeline d'images Next.js (le visuel occupe 3/5 de la grille ≥ lg). */
const PROJECT_IMAGE_SIZES = "(max-width: 1024px) 100vw, 60vw";

/**
 * @component FeaturedProjectCard
 * @description Carte "Mise en avant" d'un projet sur la page d'accueil.
 * Dispose d'un carrousel d'images intégré et ouvre une Lightbox au clic sur l'image.
 *
 * @remarks Le visuel est traité comme une **planche de présentation** : une plaque
 * mate, une arête supérieure spéculaire d'un pixel, une ombre de contact qui
 * pose l'objet au lieu de le faire flotter. L'empilement de flou et de dégradés
 * a été remplacé par cette matière unique — c'est la différence entre un objet
 * fabriqué et un effet appliqué.
 */
const FeaturedProjectCard = ({ project, index, tProjects }: { project: any, index: number, tProjects: any }) => {
    const [currentImg, setCurrentImg] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const images = project.images && project.images.length > 0 ? project.images : [project.coverImage];

    const locale = useLocale();
    const shouldReduceMotion = useReducedMotion();

    const nextImg = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImg((prev) => (prev + 1) % images.length);
    };

    const prevImg = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
    };

    // Alterne l'affichage (Image à gauche, Texte à droite -> ou inversement) pour casser la monotonie visuelle
    const isEven = index % 2 === 0;

    /** Clé i18n du projet, résolue une seule fois pour la catégorie et le résumé. */
    const translationKey = resolveProjectTranslationKey(project.slug);

    /* ── Libellés hors catalogue i18n (aucune clé nouvelle n'est requise) ───── */
    const isFrench = locale === 'fr';
    const viewProjectLabel = isFrench ? 'Voir le projet' : 'View project';
    const openGalleryLabel = isFrench
        ? `Agrandir la galerie de ${project.title}`
        : `Open ${project.title} gallery`;

    /** Ouverture au clavier : la zone d'image doit être actionnable sans souris. */
    const handleImageKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        setIsLightboxOpen(true);
    }, []);

    return (
        <>
            <div className={`relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center`}>

                {/* ═══════════════════════════════════════════════════════════
                    ▌ PLANCHE DE PRÉSENTATION
                    ═══════════════════════════════════════════════════════════ */}
                <div className="w-full lg:w-3/5 group relative rounded-[2.25rem] p-3 sm:p-4
                                bg-base-200/40 dark:bg-white/[0.025]
                                border border-base-content/[0.07] dark:border-white/[0.06]
                                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),0_2px_4px_-2px_rgba(0,0,0,0.06),0_32px_64px_-32px_rgba(0,0,0,0.35)]
                                dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_32px_72px_-32px_rgba(0,0,0,0.8)]
                                transition-shadow duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                                hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_2px_4px_-2px_rgba(0,0,0,0.06),0_44px_88px_-36px_var(--glow-color-strong)]">

                    {/* Arête lumineuse supérieure : matérialise l'épaisseur de la plaque */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
                    />

                    {/* Wrapper cliquable (Zoom In) */}
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label={openGalleryLabel}
                        onClick={() => setIsLightboxOpen(true)}
                        onKeyDown={handleImageKeyDown}
                        className="relative aspect-[16/10] sm:aspect-video rounded-[1.5rem] overflow-hidden cursor-zoom-in
                                   bg-base-300/20 ring-1 ring-inset ring-base-content/[0.06] dark:ring-white/[0.07]
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                    >
                        {/* Fondu enchaîné réel : les deux images coexistent le temps de la transition.
                            (`mode="wait"` provoquait un noir intermédiaire d'un quart de seconde.) */}
                        <AnimatePresence initial={false}>
                            <motion.div
                                key={currentImg}
                                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.04 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={images[currentImg]}
                                    alt={`${project.title} screenshot`}
                                    fill
                                    sizes={PROJECT_IMAGE_SIZES}
                                    priority={index === 0}
                                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                                               group-hover:scale-[1.025] motion-reduce:transform-none"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Voile bas : garantit le contraste des contrôles sur toute capture d'écran */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        />

                        {/* ── Contrôles du carrousel ─────────────────────────── */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImg}
                                    aria-label={isFrench ? 'Image précédente' : 'Previous image'}
                                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full
                                               bg-black/35 hover:bg-black/65 backdrop-blur-md border border-white/15 text-white
                                               opacity-0 group-hover:opacity-100 focus-visible:opacity-100
                                               transition-[opacity,background-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                                               hover:scale-105 active:scale-95 motion-reduce:transform-none
                                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80
                                               cursor-pointer"
                                >
                                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                                </button>

                                <button
                                    onClick={nextImg}
                                    aria-label={isFrench ? 'Image suivante' : 'Next image'}
                                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full
                                               bg-black/35 hover:bg-black/65 backdrop-blur-md border border-white/15 text-white
                                               opacity-0 group-hover:opacity-100 focus-visible:opacity-100
                                               transition-[opacity,background-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                                               hover:scale-105 active:scale-95 motion-reduce:transform-none
                                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80
                                               cursor-pointer"
                                >
                                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                                </button>

                                {/* Rail segmenté : indique la position ET la profondeur de la série.
                                    Un chapelet de points dit « il y en a d'autres » ;
                                    un rail dit « il y en a quatre, vous êtes à la deuxième ». */}
                                <div
                                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 w-[min(55%,220px)]"
                                    role="tablist"
                                    aria-label={isFrench ? 'Images du projet' : 'Project images'}
                                >
                                    {images.map((_: any, i: number) => (
                                        <button
                                            key={i}
                                            role="tab"
                                            aria-selected={i === currentImg}
                                            aria-label={isFrench ? `Image ${i + 1}` : `Image ${i + 1}`}
                                            onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }}
                                            className="group/seg flex-1 h-6 flex items-center cursor-pointer
                                                       focus-visible:outline-none"
                                        >
                                            <span
                                                className={`block w-full h-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                                                            group-focus-visible/seg:ring-2 group-focus-visible/seg:ring-white/80 ${i === currentImg
                                                        ? 'bg-primary shadow-[0_0_10px_var(--glow-color-strong)]'
                                                        : 'bg-white/35 group-hover/seg:bg-white/70'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Affordance d'agrandissement */}
                        <div
                            aria-hidden="true"
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full
                                       bg-black/35 backdrop-blur-md border border-white/15 text-white
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    ▌ COLONNE ÉDITORIALE
                    ═══════════════════════════════════════════════════════════ */}
                <div className="w-full lg:w-2/5 flex flex-col justify-center">
                    <FadeIn direction={isEven ? 'left' : 'right'}>

                        {/* Surtitre : un filet précède la catégorie plutôt qu'une pastille.
                            Le trait mène l'œil au texte au lieu de l'enfermer. */}
                        <div className="flex items-center gap-3 mb-6">
                            <span aria-hidden="true" className="h-px w-8 bg-primary/60" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
                                {tProjects(`${translationKey}.category`)}
                            </span>
                        </div>

                        <h3 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-base-content mb-5
                                       leading-[1.08] tracking-[-0.03em] text-balance">
                            {project.title}
                        </h3>

                        <p className="text-base sm:text-[1.0625rem] text-base-content/60 leading-[1.75] mb-9 max-w-prose text-pretty">
                            {tProjects(`${translationKey}.short`)}
                        </p>

                        {/* Pile technique : étiquettes en filet, pas en pavé.
                            L'information est secondaire, sa matière l'est aussi. */}
                        <ul className="flex flex-wrap gap-2 mb-10 list-none p-0">
                            {project.techStack.map((tech: string) => (
                                <li
                                    key={tech}
                                    className="px-3.5 py-1.5 rounded-full
                                               border border-base-content/[0.12] dark:border-white/[0.09]
                                               bg-base-200/30 dark:bg-white/[0.02]
                                               text-[13px] font-semibold text-base-content/70
                                               transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                                               hover:text-primary hover:border-primary/40 hover:-translate-y-0.5
                                               motion-reduce:transform-none cursor-default"
                                >
                                    {tech}
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/projets"
                                className="group/cta relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full
                                           bg-base-content text-base-100 font-bold overflow-hidden
                                           transition-[background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                                           hover:bg-primary hover:text-primary-content
                                           shadow-[0_1px_2px_rgba(0,0,0,0.12),0_12px_28px_-16px_rgba(0,0,0,0.6)]
                                           hover:shadow-[0_1px_2px_rgba(0,0,0,0.12),0_20px_40px_-18px_var(--glow-color-strong)]
                                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
                                           cursor-pointer"
                            >
                                {viewProjectLabel}
                                <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
                            </Link>

                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={isFrench ? `Code source de ${project.title} sur GitHub` : `${project.title} source code on GitHub`}
                                    className="inline-flex p-3.5 rounded-full border border-base-content/[0.12]
                                               text-base-content/60 hover:text-base-content hover:border-base-content/30
                                               hover:bg-base-200/60 dark:hover:bg-white/[0.05]
                                               transition-colors duration-300
                                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
                                               cursor-pointer"
                                >
                                    <Github className="w-5 h-5" aria-hidden="true" />
                                </a>
                            )}
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* Rendu de la Lightbox au-dessus du composant si déclenchée */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <ImageLightbox images={images} currentIndex={currentImg} onClose={() => setIsLightboxOpen(false)} onNext={nextImg} onPrev={prevImg} />
                )}
            </AnimatePresence>
        </>
    );
};

export default FeaturedProjectCard;