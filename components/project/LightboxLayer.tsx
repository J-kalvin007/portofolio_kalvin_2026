'use client';

/**
 * @file LightboxLayer.tsx
 * @description Couche d'affichage de la visionneuse, chargée à la demande.
 *
 * @remarks Ce module importe framer-motion (animations d'entrée et de sortie de
 * `ImageLightbox`). Il n'est chargé qu'au premier clic sur une galerie
 * (`next/dynamic` dans `TicketGallery`) : les pages n'embarquent pas
 * cette bibliothèque tant que personne n'ouvre une image.
 */

import { AnimatePresence } from 'framer-motion';
import ImageLightbox from './ImageLightbox';

interface LightboxLayerProps {
  open: boolean;
  title: string;
  images: string[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
}

export default function LightboxLayer({ open, title, images, index, onClose, onNext, onPrev, onGoTo }: LightboxLayerProps) {
  return (
    <AnimatePresence>
      {open && (
        <ImageLightbox title={title} images={images} currentIndex={index} onClose={onClose} onNext={onNext} onPrev={onPrev} onGoTo={onGoTo} />
      )}
    </AnimatePresence>
  );
}
