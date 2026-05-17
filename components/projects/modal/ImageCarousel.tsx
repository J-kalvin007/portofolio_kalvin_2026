'use client';

/**
 * @file ImageCarousel.tsx
 * @description Carrousel d'images flottant avec effet anti-gravité spatiale.
 * 
 * @design
 * - Cadre ovale morphing animé (border-radius en mutation continue)
 * - Flottement anti-gravité : oscillation Y (-15px → +15px) + rotation Z (±2°)
 * - Pulse glow : halo coloré qui pulse en synchronisation avec le flottement
 * - Navigation par swipe (Framer Motion drag="x") tactile et souris
 * - Crossfade fluide entre les images (AnimatePresence mode="wait")
 * 
 * @accessibility Navigation clavier (flèches gauche/droite)
 */

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  /** Tableau de chemins d'images du projet */
  images: string[];
  /** Titre du projet (pour les attributs alt) */
  title: string;
}

/** Seuil de vélocité/distance pour déclencher un changement d'image au swipe */
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 500;

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  /** Navigue vers l'image suivante */
  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  /** Navigue vers l'image précédente */
  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  /** Gestion du swipe (drag end) */
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY) {
        goNext();
      } else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY) {
        goPrev();
      }
    },
    [goNext, goPrev]
  );

  /** Navigation clavier */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  // Variants pour le crossfade directionnel
  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full relative px-12 md:px-20">
      {/* ── Bouton Précédent ── */}
      <button
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        className="cursor-pointer hidden md:flex absolute left-0 lg:left-8 z-20 items-center justify-center w-14 h-14 rounded-full
          bg-base-content/5 dark:bg-black/20 backdrop-blur-xl border border-base-content/20 dark:border-white/20 text-base-content/70 dark:text-white/70 hover:text-base-content dark:hover:text-white
          hover:bg-base-content/10 dark:hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        aria-label="Image précédente"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* ── Conteneur flottant anti-gravité ── */}
      <motion.div
        animate={{
          y: [-15, 15, -15],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10"
      >
        {/* ── Halo pulsant ── */}
        <div
          className="absolute -inset-4 bg-[var(--primary)]/15 blur-3xl rounded-3xl"
          style={{ animation: 'pulse-glow 4s ease-in-out infinite alternate' }}
        />

        {/* ── Cadre d'image rectangulaire avec bords arrondis ── */}
        {/* <div
          className="relative w-[85vw] max-w-[450px] lg:max-w-[600px] h-[55vh] min-h-[350px] max-h-[600px] lg:h-[65vh] lg:max-h-[750px]
            overflow-hidden shadow-[0_0_60px_-15px_var(--primary),0_0_120px_-30px_var(--glow-color-strong)]
            rounded-3xl"
        > */}
        <div
          className="relative w-[85vw] max-w-[450px] lg:max-w-[600px] h-[55vh] min-h-[350px] max-h-[600px] lg:h-[65vh] lg:max-h-[750px]
            overflow-hidden
            rounded-3xl"
        >
          {/* Zone de swipe + images */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <Image
                src={images[currentIndex]}
                alt={`${title} — image ${currentIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                priority={currentIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Bordure intérieure luminescente */}
          <div className="absolute inset-0 rounded-[inherit] border-2 border-base-content/10 dark:border-white/20 pointer-events-none" />
        </div>
      </motion.div>

      {/* ── Bouton Suivant ── */}
      <button
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        className="cursor-pointer hidden md:flex absolute right-0 lg:right-8 z-20 items-center justify-center w-14 h-14 rounded-full
          bg-base-content/5 dark:bg-black/20 backdrop-blur-xl border border-base-content/20 dark:border-white/20 text-base-content/70 dark:text-white/70 hover:text-base-content dark:hover:text-white
          hover:bg-base-content/10 dark:hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        aria-label="Image suivante"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* ── Indicateurs de pagination ── */}
      <div className="flex items-center gap-2" role="tablist">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
            className={`cursor-pointer rounded-full transition-all duration-300 ${i === currentIndex
              ? 'w-6 h-2 bg-[var(--primary)]'
              : 'w-2 h-2 bg-base-content/20 hover:bg-base-content/40 dark:bg-white/30 dark:hover:bg-white/50'
              }`}
            role="tab"
            aria-selected={i === currentIndex}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
