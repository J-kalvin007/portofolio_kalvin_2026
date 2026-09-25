'use client';

/**
 * @file PortraitViewer.tsx
 * @description Le portrait de la fiche d'identité, qui s'ouvre en plein écran.
 *
 * @architecture
 * L'agrandissement n'est **pas** une animation écrite à la main : c'est une
 * *transition de vue* du navigateur (`document.startViewTransition`). Le
 * principe est de photographier la page avant et après le changement, de
 * reconnaître l'élément qui porte le même `view-transition-name` des deux
 * côtés, puis d'interpoler sa position, sa taille et son cadrage. La photo de
 * la fiche **devient** la photo plein écran, d'un seul mouvement continu —
 * quelque chose qu'aucune animation CSS ne sait faire entre deux éléments
 * distincts, puisqu'ils n'existent pas au même endroit de l'arbre.
 *
 * Trois conséquences pratiques :
 *  - le mouvement est calculé et composé par le navigateur, donc fluide même
 *    pendant le rendu de React ;
 *  - il n'y a aucune mesure à faire, aucun `getBoundingClientRect`, aucune
 *    dépendance ;
 *  - la sortie est le même mouvement, joué à l'envers, sans une ligne de plus.
 *
 * @remarks **Le nom de transition ne doit jamais être porté deux fois.** Si la
 * vignette et la vue plein écran l'exposaient en même temps, le navigateur
 * abandonnerait la transition. La vignette le rend donc à l'ouverture, et le
 * reprend à la fermeture.
 *
 * @remarks **Rendu dans un portail.** La fiche est inclinée
 * (`transform: rotate(-1.2deg)`), et un ancêtre transformé fait de tout
 * `position: fixed` descendant un élément positionné **par rapport à lui** : la
 * vue « plein écran » se serait retrouvée enfermée dans le badge.
 *
 * @remarks Sans prise en charge des transitions de vue (Firefox à ce jour), ou
 * si le visiteur demande moins d'animations, l'ouverture est immédiate et
 * l'habillage se contente d'un fondu : la fonction reste entière.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Expand, X } from 'lucide-react';
import { useIsClient } from '@/hooks/useClientSnapshot';

/** Nom partagé par la vignette et la vue plein écran (voir `about.css`). */
const TRANSITION_NAME = 'portrait';

interface PortraitViewerProps {
  src: string;
  alt: string;
}

export default function PortraitViewer({ src, alt }: PortraitViewerProps) {
  const t = useTranslations('about_page.card');
  const isClient = useIsClient();

  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  /**
   * Charge et **décode** la photo grandeur nature.
   *
   * ⚠️ Sans cette attente, la transition partait d'une image et arrivait sur un
   * cadre vide : le navigateur photographie l'état d'arrivée dès que le DOM est
   * à jour, c'est-à-dire avant que la grande image n'ait eu le temps d'être
   * décodée. Le mouvement était donc un agrandissement… du néant.
   *
   * Le fichier d'origine pèse 36 Ko et fait déjà 720 × 1080 : il est servi tel
   * quel, ce qui rend cette adresse connue d'avance — la version optimisée,
   * elle, dépend de la hauteur de la fenêtre.
   */
  const primeImage = useCallback(async () => {
    const image = new window.Image();
    image.src = src;
    try {
      await image.decode();
    } catch {
      /* Image indisponible : on ouvrira quand même, le navigateur affichera ce
         qu'il peut. Mieux vaut une vue imparfaite qu'un bouton qui ne fait rien. */
    }
  }, [src]);

  /** Bascule l'état en confiant le mouvement au navigateur quand il sait le faire. */
  const toggle = useCallback(
    async (next: boolean) => {
      if (next) await primeImage();

      const apply = () => flushSync(() => setOpen(next));

      const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (lessMotion || typeof document.startViewTransition !== 'function') {
        apply();
        return;
      }

      document.startViewTransition(apply);
    },
    [primeImage],
  );

  /* Échap ferme, et le défilement de la page est verrouillé pendant l'affichage. */
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    // Le bouton d'ouverture est retenu maintenant : au nettoyage, la référence
    // pourrait désigner un autre nœud (ou plus rien du tout).
    const opener = openerRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        void toggle(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      opener?.focus({ preventScroll: true });
    };
  }, [open, toggle]);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="idc-photo"
        onClick={() => void toggle(true)}
        /* Le survol et la prise de focus préparent la photo : au clic, elle est
           déjà décodée et la transition démarre au premier rendu. */
        onPointerEnter={() => void primeImage()}
        onFocus={() => void primeImage()}
        /* Le nom est rendu à la vue plein écran pendant qu'elle est ouverte. */
        style={{ viewTransitionName: open ? 'none' : TRANSITION_NAME }}
      >
        <Image src={src} alt={alt} fill priority sizes="(max-width: 380px) 96px, 120px" />
        <span className="sr-only"> {t('zoom')}</span>
        <span className="idc-photo-hint" aria-hidden="true">
          <Expand className="h-3.5 w-3.5" />
        </span>
      </button>

      {isClient && open && createPortal(
        <div className="pv" role="dialog" aria-modal="true" aria-label={alt} onClick={() => void toggle(false)}>
          <div className="pv-veil" aria-hidden="true" />

          <figure className="pv-frame" style={{ viewTransitionName: TRANSITION_NAME }}>
            {/* Le fichier d'origine, servi tel quel : c'est lui qui a été décodé
                avant la transition. La photo est décrite par le dialogue
                lui-même, son `alt` reste donc vide. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
          </figure>

          <button ref={closeRef} type="button" className="pv-close" onClick={() => void toggle(false)} aria-label={t('close')}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}
