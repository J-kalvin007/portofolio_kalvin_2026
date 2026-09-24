'use client';

/**
 * @file TicketGallery.tsx
 * @description Visuel d'un billet de projet, qui ouvre la visionneuse plein écran.
 *
 * Deux variantes :
 *  - `cover` (accueil) : la capture de couverture et le nombre de captures ;
 *  - `full` (page Projets) : la couverture et une rangée de vignettes, chacune
 *    ouvrant la visionneuse sur sa propre capture.
 *
 * @remarks La série affichée commence par la couverture, suivie des captures du
 * projet, sans doublon. La couverture ne figurait pas toujours dans la série :
 * cliquer dessus ouvrait alors la visionneuse sur une autre image.
 */

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
/* Les styles de la galerie voyagent avec son balisage : la feuille était
   importée par le billet de projet seulement, et la galerie se retrouvait sans
   dimensions partout ailleurs — son image, posée en `fill`, débordait alors sur
   tout son conteneur. */
import './project.css';

/** Visionneuse chargée au premier clic seulement (voir LightboxLayer). */
const LightboxLayer = dynamic(() => import('./LightboxLayer'), { ssr: false });

/** Nombre maximal de vignettes sous la couverture (variante complète). */
const MAX_THUMBNAILS = 5;

interface TicketGalleryProps {
  title: string;
  cover: string;
  images: string[];
  variant?: 'cover' | 'full';
}

export default function TicketGallery({ title, cover, images, variant = 'cover' }: TicketGalleryProps) {
  const tGallery = useTranslations('gallery');

  const gallery = [...new Set([cover, ...images])];
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  // Tant que la galerie n'a jamais été ouverte, la couche n'est pas montée (ni téléchargée).
  const [hasOpened, setHasOpened] = useState(false);

  const openAt = (position: number) => {
    setIndex(position);
    setOpen(true);
    setHasOpened(true);
  };
  const count = gallery.length;
  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const goTo = useCallback((position: number) => setIndex(position), []);

  const coverButton = (
    <button type="button" className="tk-media" onClick={() => openAt(0)} aria-label={tGallery('open', { title })}>
      <Image
        src={cover}
        alt=""
        fill
        sizes={variant === 'full' ? '(max-width: 640px) 100vw, (max-width: 1152px) 42vw, 460px' : '(max-width: 640px) 100vw, (max-width: 1152px) 38vw, 380px'}
      />
      <span className="tk-media-count" aria-hidden="true">{tGallery('count', { count })}</span>
    </button>
  );

  const thumbnails = gallery.slice(1, MAX_THUMBNAILS + 1);
  const hiddenCount = gallery.length - 1 - thumbnails.length;

  return (
    <>
      {variant === 'cover' ? (
        coverButton
      ) : (
        <div className="tk-gallery">
          {coverButton}
          {thumbnails.length > 0 && (
            <ul className="tk-thumbs" aria-label={tGallery('imagesLabel')}>
              {thumbnails.map((source, i) => {
                const position = i + 1;
                const isLast = i === thumbnails.length - 1;
                return (
                  <li key={source}>
                    <button
                      type="button"
                      className="tk-thumb"
                      onClick={() => openAt(position)}
                      aria-label={tGallery('openAt', { title, position: position + 1 })}
                    >
                      <Image src={source} alt="" fill sizes="(max-width: 640px) 20vw, 96px" />
                      {isLast && hiddenCount > 0 && (
                        <span className="tk-thumb-more" aria-hidden="true">+{hiddenCount}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {hasOpened && (
        <LightboxLayer
          open={open}
          title={title}
          images={gallery}
          index={index}
          onClose={close}
          onNext={next}
          onPrev={prev}
          onGoTo={goTo}
        />
      )}
    </>
  );
}
