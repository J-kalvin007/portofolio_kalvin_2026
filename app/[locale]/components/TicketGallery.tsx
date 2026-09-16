'use client';

/**
 * @file TicketGallery.tsx
 * @description Visuel d'un billet de projet : la capture de couverture, qui
 * ouvre la galerie complète en plein écran.
 */

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

/** Visionneuse chargée au premier clic seulement (voir LightboxLayer). */
const LightboxLayer = dynamic(() => import('./LightboxLayer'), { ssr: false });

interface TicketGalleryProps {
  title: string;
  cover: string;
  images: string[];
}

export default function TicketGallery({ title, cover, images }: TicketGalleryProps) {
  const tGallery = useTranslations('gallery');
  const tProjects = useTranslations('home.projects');

  const gallery = images.length > 0 ? images : [cover];
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  // Tant que la galerie n'a jamais été ouverte, la couche n'est pas montée (ni téléchargée).
  const [hasOpened, setHasOpened] = useState(false);

  const openGallery = () => {
    setIndex(0);
    setOpen(true);
    setHasOpened(true);
  };
  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(() => setIndex((i) => (i + 1) % gallery.length), [gallery.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + gallery.length) % gallery.length), [gallery.length]);

  return (
    <>
      <button type="button" className="tk-media" onClick={openGallery} aria-label={tGallery('open', { title })}>
        <Image src={cover} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1152px) 38vw, 380px" />
        <span className="tk-media-count" aria-hidden="true">{tProjects('images', { count: gallery.length })}</span>
      </button>

      {hasOpened && (
        <LightboxLayer open={open} images={gallery} index={index} onClose={close} onNext={next} onPrev={prev} />
      )}
    </>
  );
}
