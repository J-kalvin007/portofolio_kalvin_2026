
"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CONSTANTES D'INTERACTION
   ═══════════════════════════════════════════════════════════════════════════ */

const SWIPE_DISTANCE_THRESHOLD = 90;
const SWIPE_VELOCITY_THRESHOLD = 550;
const DISMISS_DISTANCE_THRESHOLD = 140;
const DISMISS_FADE_RANGE = 320;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Dimensions servies par le pipeline d'images Next.js selon la largeur de viewport. */
const LIGHTBOX_IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1280px";

const slideVariants = {
    enter: (direction: number) => ({ opacity: 0, x: direction * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (direction: number) => ({ opacity: 0, x: direction * -40 }),
};

interface ImageLightboxProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: (e?: React.MouseEvent) => void;
    onPrev: (e?: React.MouseEvent) => void;
}

/**
 * @component ImageLightbox
 * @description Visionneuse d'images en plein écran (modale).
 * Bloque le défilement de l'arrière-plan lorsqu'elle est ouverte.
 *
 * @remarks **Correction critique** : le `return null` anticipé se trouvait avant
 * le `useEffect` de verrouillage du scroll. Un rendu avec `images` vide sautait
 * donc un hook et faisait diverger l'ordre des hooks entre deux rendus — React
 * lève « Rendered fewer hooks than expected » et démonte l'arbre. La garde est
 * désormais placée après tous les hooks.
 *
 * La mise en page adopte un cadre « passe-partout » : l'image est posée sur une
 * marge neutre, comme un tirage encadré. C'est ce qui distingue une visionneuse
 * de galerie d'une simple superposition plein écran.
 */
const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }: ImageLightboxProps) => {
    const locale = useLocale();
    const tLightbox = useTranslations('lightbox');

    const shouldReduceMotion = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    /** Normalisation défensive : tous les hooks ci-dessous s'exécutent inconditionnellement. */
    const hasImages = Array.isArray(images) && images.length > 0;
    const safeImages = hasImages ? images : [];
    const safeIndex = hasImages ? Math.min(Math.max(currentIndex, 0), safeImages.length - 1) : 0;

    /* ── Portail : monté uniquement côté client ────────────────────────────── */
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    /* ── Sens de navigation, déduit de la variation d'index ────────────────── */
    const previousIndexRef = useRef(safeIndex);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const delta = safeIndex - previousIndexRef.current;
        const total = safeImages.length;
        const isWrapAround = total > 2 && Math.abs(delta) === total - 1;

        setDirection(delta === 0 ? 0 : isWrapAround ? -Math.sign(delta) : Math.sign(delta));
        previousIndexRef.current = safeIndex;
    }, [safeIndex, safeImages.length]);

    /* ── Geste : glisser vers le haut ou le bas pour fermer ────────────────── */
    const dragY = useMotionValue(0);
    const backdropOpacity = useTransform(dragY, [-DISMISS_FADE_RANGE, 0, DISMISS_FADE_RANGE], [0, 1, 0]);
    const frameScale = useTransform(dragY, [-DISMISS_FADE_RANGE, 0, DISMISS_FADE_RANGE], [0.88, 1, 0.88]);

    const handleDragEnd = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            const { offset, velocity } = info;

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
       ▌ Verrouillage du défilement du corps de la page
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
       ▌ CLAVIER — navigation, fermeture, confinement du focus
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

    /* ── Prise puis restitution du focus ───────────────────────────────────── */
    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        containerRef.current?.focus({ preventScroll: true });

        return () => previouslyFocused?.focus?.({ preventScroll: true });
    }, []);

    const isFrench = locale === 'fr';
    const galleryLabel = isFrench ? 'Galerie du projet' : 'Project gallery';

    /* Garde placée après l'intégralité des hooks — l'ordre des hooks reste stable. */
    if (!isMounted || !hasImages) return null;

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
            className="fixed inset-0 z-[100] flex items-center justify-center cursor-zoom-out outline-none"
            onClick={onClose} // Clic sur le fond = fermeture
        >
            {/* ── Passe-partout : fond neutre, densité pilotée par le geste ──── */}
            <motion.div
                aria-hidden="true"
                style={{ opacity: shouldReduceMotion ? 1 : backdropOpacity }}
                className="absolute inset-0 bg-base-100/95 backdrop-blur-xl"
            />

            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-6 right-6 p-3 rounded-full z-[110] cursor-pointer
                           bg-base-content/[0.07] hover:bg-primary text-base-content hover:text-primary-content
                           border border-base-content/10 backdrop-blur-md
                           transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                           hover:scale-105 active:scale-95 motion-reduce:transform-none
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                aria-label={tLightbox('close')}
            >
                <X className="w-6 h-6" aria-hidden="true" />
            </button>

            {safeImages.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 sm:left-10 p-4 rounded-full z-[110] cursor-pointer
                               bg-base-content/[0.07] hover:bg-primary text-base-content hover:text-primary-content
                               border border-base-content/10 backdrop-blur-md
                               transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                               hover:scale-105 active:scale-95 motion-reduce:transform-none
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                    aria-label={tLightbox('previous')}
                >
                    <ChevronLeft className="w-8 h-8" aria-hidden="true" />
                </button>
            )}

            {/* Conteneur de l'image (désactive le clic de fermeture) */}
            <motion.div
                className="relative w-full max-w-7xl h-[80vh] mx-4 sm:mx-24 rounded-2xl overflow-hidden cursor-default touch-none
                           shadow-[0_48px_120px_-32px_rgba(0,0,0,0.45)] ring-1 ring-base-content/[0.06]"
                onClick={e => e.stopPropagation()}
                drag={shouldReduceMotion ? false : true}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.12}
                onDragEnd={handleDragEnd}
                style={{ y: dragY, scale: shouldReduceMotion ? 1 : frameScale }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            >
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={safeIndex}
                        custom={direction}
                        variants={shouldReduceMotion ? undefined : slideVariants}
                        initial={shouldReduceMotion ? { opacity: 0 } : "enter"}
                        animate={shouldReduceMotion ? { opacity: 1 } : "center"}
                        exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
                        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={safeImages[safeIndex]}
                            alt={isFrench ? `Image ${safeIndex + 1} sur ${safeImages.length}` : `Image ${safeIndex + 1} of ${safeImages.length}`}
                            fill
                            sizes={LIGHTBOX_IMAGE_SIZES}
                            priority
                            draggable={false}
                            className="object-contain select-none"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Cartouche de position — discret, aligné en bas, chiffres à chasse fixe */}
                {safeImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full
                                    bg-base-100/80 backdrop-blur-md border border-base-content/10
                                    text-xs font-semibold tabular-nums tracking-[0.12em] text-base-content/70">
                        {safeIndex + 1} <span className="text-base-content/30">/</span> {safeImages.length}
                    </div>
                )}
            </motion.div>

            {safeImages.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 sm:right-10 p-4 rounded-full z-[110] cursor-pointer
                               bg-base-content/[0.07] hover:bg-primary text-base-content hover:text-primary-content
                               border border-base-content/10 backdrop-blur-md
                               transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                               hover:scale-105 active:scale-95 motion-reduce:transform-none
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                    aria-label={tLightbox('next')}
                >
                    <ChevronRight className="w-8 h-8" aria-hidden="true" />
                </button>
            )}
        </motion.div>,
        document.body
    );
};

export default ImageLightbox;