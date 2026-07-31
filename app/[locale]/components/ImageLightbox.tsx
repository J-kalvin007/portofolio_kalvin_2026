// import { motion } from "framer-motion";
// import { ChevronLeft, ChevronRight, X } from "lucide-react";
// import { useEffect } from "react";
// import Image from "next/image";

// /**
//  * @component ImageLightbox
//  * @description Visionneuse d'images en plein écran (modale).
//  * Bloque le défilement de l'arrière-plan lorsqu'elle est ouverte.
//  */
// const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }: any) => {
//     if (!images || images.length === 0) return null;

//     // Verrouillage du scroll du corps de la page
//     useEffect(() => {
//         document.body.style.overflow = 'hidden';
//         return () => { document.body.style.overflow = ''; };
//     }, []);

//     return (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-base-100/95 backdrop-blur-xl cursor-zoom-out"
//             onClick={onClose} // Clic sur le fond = fermeture
//         >
//             <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-6 right-6 p-3 bg-base-content/10 hover:bg-primary text-base-content hover:text-primary-content rounded-full transition-colors z-[110] cursor-pointer">
//                 <X className="w-6 h-6" />
//             </button>

//             {images.length > 1 && (
//                 <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 sm:left-10 p-4 bg-base-content/10 hover:bg-primary text-base-content hover:text-primary-content rounded-full transition-colors z-[110] cursor-pointer">
//                     <ChevronLeft className="w-8 h-8" />
//                 </button>
//             )}

//             {/* Conteneur de l'image (désactive le clic de fermeture) */}
//             <div className="relative w-full max-w-7xl h-[80vh] mx-4 sm:mx-24 rounded-2xl overflow-hidden shadow-2xl cursor-default" onClick={e => e.stopPropagation()}>
//                 <Image src={images[currentIndex]} alt="Fullscreen view" fill className="object-contain" />
//             </div>

//             {images.length > 1 && (
//                 <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 sm:right-10 p-4 bg-base-content/10 hover:bg-primary text-base-content hover:text-primary-content rounded-full transition-colors z-[110] cursor-pointer">
//                     <ChevronRight className="w-8 h-8" />
//                 </button>
//             )}
//         </motion.div>
//     );
// };

// export default ImageLightbox;
































"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CONSTANTES D'INTERACTION
   ═══════════════════════════════════════════════════════════════════════════ */

/** Course horizontale (px) au-delà de laquelle le geste change d'image. */
const SWIPE_DISTANCE_THRESHOLD = 90;

/** Vitesse (px/s) qui déclenche le changement d'image même sur un geste court. */
const SWIPE_VELOCITY_THRESHOLD = 550;

/** Course verticale (px) au-delà de laquelle le geste ferme la visionneuse. */
const DISMISS_DISTANCE_THRESHOLD = 140;

/** Amplitude du couplage geste vertical → opacité / échelle. */
const DISMISS_FADE_RANGE = 320;

/** Courbe d'entrée/sortie — décélération franche, sans rebond. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Variantes de translation latérale, orientées par le sens de navigation. */
const slideVariants = {
    enter: (direction: number) => ({ opacity: 0, x: direction * 48, scale: 0.985 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (direction: number) => ({ opacity: 0, x: direction * -48, scale: 0.985 }),
};

/**
 * @component ImageLightbox
 * @description Lightbox en plein écran pour visualiser les images d'un projet.
 * Supporte la navigation (précédent/suivant) et la fermeture.
 *
 * @remarks Trois corrections structurelles :
 *  1. La racine est un `motion.div` — `AnimatePresence` ne pouvait pas jouer
 *     l'animation de sortie sur un `div` standard.
 *  2. Le rendu passe par un portail sur `document.body` : `position: fixed`
 *     est neutralisé dès qu'un ancêtre porte un `transform`, ce qui est le cas
 *     de toutes les cartes animées de la page.
 *  3. Les raccourcis clavier annoncés en bas d'écran sont désormais réellement
 *     implémentés (ils ne l'étaient pas).
 */
interface ImageLightboxProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: (e?: React.MouseEvent) => void;
    onPrev: (e?: React.MouseEvent) => void;
}

const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }: ImageLightboxProps) => {
    const locale = useLocale();
    const tLightbox = useTranslations('lightbox');

    const shouldReduceMotion = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    /* ── Portail : monté uniquement côté client ────────────────────────────── */
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    /* ── Sens de navigation, déduit de la variation d'index ────────────────── */
    const previousIndexRef = useRef(currentIndex);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const delta = currentIndex - previousIndexRef.current;
        const total = images.length;

        // Un saut d'amplitude maximale correspond à un bouclage : le sens réel est inversé.
        const isWrapAround = total > 2 && Math.abs(delta) === total - 1;
        setDirection(delta === 0 ? 0 : isWrapAround ? -Math.sign(delta) : Math.sign(delta));

        previousIndexRef.current = currentIndex;
    }, [currentIndex, images.length]);

    /* ── Geste vertical couplé à l'opacité et à l'échelle ──────────────────── */
    const dragY = useMotionValue(0);
    const backdropOpacity = useTransform(dragY, [-DISMISS_FADE_RANGE, 0, DISMISS_FADE_RANGE], [0, 1, 0]);
    const contentScale = useTransform(dragY, [-DISMISS_FADE_RANGE, 0, DISMISS_FADE_RANGE], [0.86, 1, 0.86]);

    const handleDragEnd = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            const { offset, velocity } = info;

            // Le geste dominant décide : vertical → fermeture, horizontal → navigation.
            if (Math.abs(offset.y) > Math.abs(offset.x)) {
                if (Math.abs(offset.y) > DISMISS_DISTANCE_THRESHOLD || Math.abs(velocity.y) > SWIPE_VELOCITY_THRESHOLD) {
                    onClose();
                }
                return;
            }

            const isDecisiveSwipe =
                Math.abs(offset.x) > SWIPE_DISTANCE_THRESHOLD || Math.abs(velocity.x) > SWIPE_VELOCITY_THRESHOLD;

            if (!isDecisiveSwipe) return;
            if (offset.x < 0) onNext();
            else onPrev();
        },
        [onClose, onNext, onPrev]
    );

    /* ═══════════════════════════════════════════════════════════════════════
       ▌ VERROUILLAGE DU DÉFILEMENT
       La largeur de la barre de défilement est compensée : sans cela, le fond
       de page se décale d'une dizaine de pixels à l'ouverture.
       ═══════════════════════════════════════════════════════════════════════ */
    useEffect(() => {
        const { body, documentElement } = document;
        const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
        const previousOverflow = body.style.overflow;
        const previousPaddingRight = body.style.paddingRight;

        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            body.style.overflow = previousOverflow;
            body.style.paddingRight = previousPaddingRight;
        };
    }, []);

    /* ═══════════════════════════════════════════════════════════════════════
       ▌ CLAVIER — navigation, fermeture, et confinement du focus
       ═══════════════════════════════════════════════════════════════════════ */
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'Escape':
                    event.preventDefault();
                    onClose();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    onNext();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    onPrev();
                    break;
                case 'Tab': {
                    // Piège de focus : la tabulation tourne en boucle dans la modale.
                    const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
                        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
                    );
                    if (!focusables || focusables.length === 0) return;

                    const first = focusables[0];
                    const last = focusables[focusables.length - 1];

                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first.focus();
                    }
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev]);

    /* ── Prise de focus à l'ouverture, restitution à la fermeture ──────────── */
    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        containerRef.current?.focus({ preventScroll: true });

        return () => previouslyFocused?.focus?.({ preventScroll: true });
    }, []);

    /* ── Préchargement des images adjacentes : la navigation paraît instantanée ── */
    useEffect(() => {
        if (images.length < 2) return;

        const neighbours = [
            images[(currentIndex + 1) % images.length],
            images[(currentIndex - 1 + images.length) % images.length],
        ];

        neighbours.forEach((source) => {
            const preloader = new window.Image();
            preloader.src = source;
        });
    }, [currentIndex, images]);

    /* ── Libellés hors catalogue i18n : même stratégie que le texte d'aide existant ── */
    const isFrench = locale === 'fr';
    const galleryLabel = isFrench ? 'Galerie du projet' : 'Project gallery';
    const thumbnailLabel = (position: number) =>
        isFrench ? `Aller à l'image ${position}` : `Go to image ${position}`;

    if (!isMounted) return null;

    return createPortal(
        <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={galleryLabel}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 outline-none"
            onClick={onClose}
        >
            {/* ── Fond : sa densité suit le geste de fermeture ──────────────── */}
            <motion.div
                aria-hidden="true"
                style={{ opacity: shouldReduceMotion ? 1 : backdropOpacity }}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Conteneur principal de l'image avec animation de transition */}
            <motion.div
                className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                onClick={(e) => e.stopPropagation()}
                drag={shouldReduceMotion ? false : true}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ y: dragY, scale: shouldReduceMotion ? 1 : contentScale }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.36, ease: EASE_OUT_EXPO }}
            >
                {/* Image affichée avec mode 'contain' pour s'assurer qu'elle rentre dans l'écran */}
                <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                    <motion.img
                        key={currentIndex}
                        custom={direction}
                        src={images[currentIndex]}
                        alt={`Galerie ${currentIndex + 1}`}
                        draggable={false}
                        variants={shouldReduceMotion ? undefined : slideVariants}
                        initial={shouldReduceMotion ? { opacity: 0 } : "enter"}
                        animate={shouldReduceMotion ? { opacity: 1 } : "center"}
                        exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
                        transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
                        className="max-w-full max-h-full object-contain rounded-2xl select-none
                                   shadow-[0_40px_120px_-24px_rgba(0,0,0,0.9)]"
                    />
                </AnimatePresence>

                {/* Flèches de navigation (gauche et droite) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={onPrev}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full
                                       bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10
                                       text-white transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                                       hover:scale-105 active:scale-95 motion-reduce:transform-none
                                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40
                                       cursor-pointer"
                            aria-label={tLightbox('previous')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>

                        <button
                            onClick={onNext}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full
                                       bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10
                                       text-white transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                                       hover:scale-105 active:scale-95 motion-reduce:transform-none
                                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40
                                       cursor-pointer"
                            aria-label={tLightbox('next')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Compteur d'images et bouton de fermeture */}
                <div className="absolute bottom-4 right-4">
                    {/* Affichage du compteur d'images et du bouton de fermeture groupés */}
                    <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white">
                        {/* Compteur d'images — `tabular-nums` fige la largeur, le bloc ne tressaute pas */}
                        <span className="text-sm font-semibold tabular-nums tracking-wide">
                            <span className="text-white">{currentIndex + 1}</span>
                            <span className="text-white/40 mx-1">/</span>
                            <span className="text-white/60">{images.length}</span>
                        </span>

                        <span aria-hidden="true" className="w-px h-4 bg-white/15" />

                        {/* Bouton de fermeture */}
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-white/10 transition-colors
                                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                                       cursor-pointer"
                            aria-label={tLightbox('close')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── Rail de vignettes : donne la profondeur de la série d'un coup d'œil ── */}
            {images.length > 1 && (
                <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2
                               p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 max-w-[70vw] overflow-x-auto
                               [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {images.map((source, position) => (
                        <button
                            key={`${source}-${position}`}
                            onClick={() => {
                                // Navigation par pas successifs : l'état d'index reste piloté
                                // par le parent, aucun nouveau contrat de props n'est introduit.
                                const distance = position - currentIndex;
                                const step = distance > 0 ? onNext : onPrev;
                                for (let i = 0; i < Math.abs(distance); i += 1) step();
                            }}
                            aria-label={thumbnailLabel(position + 1)}
                            aria-current={position === currentIndex}
                            className={`relative shrink-0 h-12 w-16 rounded-lg overflow-hidden
                                        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                                        cursor-pointer ${position === currentIndex
                                    ? 'ring-2 ring-white opacity-100 scale-100'
                                    : 'opacity-40 hover:opacity-80 scale-95 hover:scale-100'
                                }`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={source} alt="" className="h-full w-full object-cover" draggable={false} />
                        </button>
                    ))}
                </div>
            )}

            {/* Message d'indication pour les utilisateurs de clavier */}
            <div className="absolute bottom-8 md:bottom-[5.5rem] left-1/2 -translate-x-1/2 pointer-events-none
                            text-white/60 text-[11px] tracking-[0.14em] uppercase font-medium whitespace-nowrap">
                {isFrench ? '←/→ pour naviguer, Échap pour fermer' : '←/→ to navigate, Esc to close'}
            </div>
        </motion.div>,
        document.body
    );
};

export default ImageLightbox;