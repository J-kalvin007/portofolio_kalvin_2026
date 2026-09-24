'use client';

/**
 * @file ProjectCarousel.tsx
 * @description Carrousel des captures d'un projet, au centre de sa scène.
 *
 * @architecture
 * Le défilement est **natif** : les captures sont posées côte à côte dans un
 * conteneur qui défile horizontalement, avec `scroll-snap` pour qu'il s'arrête
 * toujours pile sur une capture. Conséquences directes :
 *  - le glissement du doigt, l'inertie, le pavé tactile et la molette
 *    horizontale fonctionnent sans une ligne de JavaScript ;
 *  - le navigateur ne télécharge chaque capture qu'au moment où elle approche
 *    du bord, au lieu de les charger toutes à l'ouverture ;
 *  - rien ne peut se désynchroniser : la position réelle du conteneur **est**
 *    l'état du carrousel.
 *
 * JavaScript ne sert qu'à trois choses : lire la capture actuellement au
 * centre, déplacer la vue quand on clique une commande, et ouvrir la
 * visionneuse plein écran.
 *
 * @remarks L'ancien carrousel simulait tout cela avec framer-motion : geste au
 * doigt reconstitué, transitions d'entrée et de sortie, position en mémoire.
 * C'était une soixantaine de kilo-octets de JavaScript pour reproduire — moins
 * bien, sans inertie — ce que le navigateur fait nativement. La bibliothèque
 * n'est plus chargée que par la visionneuse plein écran, au premier clic.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { padNumber } from '@/lib/format';

/** Visionneuse chargée au premier agrandissement seulement. */
const LightboxLayer = dynamic(() => import('./LightboxLayer'), { ssr: false });

/**
 * Déplacement toléré entre l'appui et le relâchement, en pixels.
 * Au-delà, le geste est un glissement (on fait défiler), pas un clic (on
 * agrandit) — même règle que dans la visionneuse.
 */
const CLICK_DRAG_TOLERANCE = 8;

interface ProjectCarouselProps {
  title: string;
  /** Captures du projet, couverture comprise, sans doublon. */
  images: string[];
}

export default function ProjectCarousel({ title, images }: ProjectCarouselProps) {
  const t = useTranslations('gallery');

  const [index, setIndex] = useState(0);
  /** Capture ouverte en plein écran, ou `null`. */
  const [zoomed, setZoomed] = useState<number | null>(null);
  /** Tant qu'aucun agrandissement n'a eu lieu, la visionneuse n'est pas chargée. */
  const [hasZoomed, setHasZoomed] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);

  const count = images.length;
  const isFirst = index === 0;
  const isLast = index === count - 1;

  const prefersLessMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Déplacement de la vue ───────────────────────────────────────────────
     Une seule façon de bouger : on déplace le conteneur, et le suivi de
     position en déduit l'état. Les commandes, les vignettes et le clavier
     passent tous par ici. */
  const goTo = useCallback(
    (position: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const clamped = Math.min(Math.max(position, 0), count - 1);
      viewport.scrollTo({
        left: clamped * viewport.clientWidth,
        behavior: prefersLessMotion() ? 'auto' : 'smooth',
      });
    },
    [count],
  );

  /* ── Suivi de la capture au centre ───────────────────────────────────────
     Une division suffit : les captures occupent toute la largeur du conteneur,
     et `scroll-snap` garantit que la position finale est un multiple exact. */
  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth === 0) return;

    const position = Math.round(viewport.scrollLeft / viewport.clientWidth);
    setIndex((current) => (current === position ? current : Math.min(Math.max(position, 0), count - 1)));
  };

  /* ── Clavier : flèches gauche et droite ──────────────────────────────────
     L'écoute est posée sur la fenêtre, et non sur le carrousel : le visiteur
     n'a pas à deviner qu'il faut d'abord cliquer dedans. Elle est retirée
     pendant l'agrandissement, où la visionneuse a ses propres flèches — sans
     quoi une pression ferait avancer les deux. */
  useEffect(() => {
    if (zoomed !== null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // Une flèche dans un champ de saisie déplace le curseur : on ne la vole pas.
      if ((event.target as HTMLElement | null)?.closest('input, textarea, select')) return;

      event.preventDefault();
      goTo(index + (event.key === 'ArrowRight' ? 1 : -1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goTo, index, zoomed]);

  /* La vignette active est ramenée dans la bande visible. `block: 'nearest'`
     est indispensable : sans lui, le navigateur ferait aussi défiler la modale
     entière pour centrer la vignette verticalement. */
  useEffect(() => {
    const active = thumbsRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  /* ── Agrandissement ──────────────────────────────────────────────────── */
  const rememberPointer = (event: React.PointerEvent) => {
    pointerOrigin.current = { x: event.clientX, y: event.clientY };
  };

  const zoomIfNotDragging = (position: number) => (event: React.MouseEvent) => {
    const origin = pointerOrigin.current;
    const travelled = origin ? Math.hypot(event.clientX - origin.x, event.clientY - origin.y) : 0;
    if (travelled > CLICK_DRAG_TOLERANCE) return;

    setZoomed(position);
    setHasZoomed(true);
  };

  /* À la fermeture, le carrousel reprend sur la capture regardée en plein
     écran : le visiteur retrouve exactement où il en était. */
  const closeZoom = useCallback(() => {
    if (zoomed !== null) goTo(zoomed);
    setZoomed(null);
  }, [goTo, zoomed]);

  const zoomNext = useCallback(() => setZoomed((position) => ((position ?? 0) + 1) % count), [count]);
  const zoomPrev = useCallback(() => setZoomed((position) => ((position ?? 0) - 1 + count) % count), [count]);
  const zoomGoTo = useCallback((position: number) => setZoomed(position), []);

  return (
    <div className="pj-carousel">
      {/* ── Les captures ─────────────────────────────────────────────────── */}
      <div className="pj-carousel-frame">
        <div className="pj-carousel-viewport" ref={viewportRef} onScroll={handleScroll}>
          {images.map((source, position) => (
            <div key={source} className="pj-carousel-slide">
              <button
                type="button"
                className="pj-carousel-zoom"
                onPointerDown={rememberPointer}
                onClick={zoomIfNotDragging(position)}
                aria-label={t('openAt', { title, position: position + 1 })}
              >
                <Image
                  src={source}
                  alt=""
                  fill
                  sizes="(max-width: 64rem) 92vw, 52vw"
                  /* La capture affichée et ses deux voisines sont chargées tout de
                     suite, les autres à l'approche.

                     ⚠️ `loading="lazy"` ne suffit pas ici : Chrome ne déclenche pas
                     le chargement d'une image placée dans un conteneur à
                     défilement horizontal, même lorsqu'elle est amenée au centre.
                     La capture suivante restait donc désespérément vide. */
                  loading={Math.abs(position - index) <= 1 ? 'eager' : 'lazy'}
                  draggable={false}
                />
                <span className="pj-carousel-zoom-hint" aria-hidden="true">
                  <Maximize2 className="h-4 w-4" />
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Commandes : posées au-dessus du cadre, désactivées aux extrémités —
            une flèche qui ne fait rien est plus déroutante qu'une flèche
            visiblement éteinte. */}
        <button
          type="button"
          className="pj-carousel-nav pj-carousel-nav--prev"
          onClick={() => goTo(index - 1)}
          disabled={isFirst}
          aria-label={t('previous')}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pj-carousel-nav pj-carousel-nav--next"
          onClick={() => goTo(index + 1)}
          disabled={isLast}
          aria-label={t('next')}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* ── Compteur et vignettes ────────────────────────────────────────── */}
      <div className="pj-carousel-bar">
        <p className="pj-carousel-count" aria-hidden="true">
          <span>{padNumber(index + 1)}</span>
          <span className="pj-carousel-count-sep">/</span>
          <span>{padNumber(count)}</span>
        </p>

        {count > 1 && (
          <ul className="pj-carousel-thumbs" ref={thumbsRef} aria-label={t('imagesLabel')}>
            {images.map((source, position) => (
              <li key={source}>
                <button
                  type="button"
                  className="pj-carousel-thumb"
                  onClick={() => goTo(position)}
                  aria-current={position === index ? 'true' : undefined}
                  aria-label={t('goTo', { position: position + 1 })}
                >
                  {/* Chargement immédiat : six vignettes de 72 px pèsent quelques
                      kilo-octets, et le report paresseux ne se déclenchait pas
                      dans la bande à défilement (même cause que ci-dessus). */}
                  <Image src={source} alt="" fill sizes="72px" loading="eager" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasZoomed && (
        <LightboxLayer
          open={zoomed !== null}
          title={title}
          images={images}
          index={zoomed ?? 0}
          onClose={closeZoom}
          onNext={zoomNext}
          onPrev={zoomPrev}
          onGoTo={zoomGoTo}
        />
      )}
    </div>
  );
}
