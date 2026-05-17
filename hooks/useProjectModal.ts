'use client';

/**
 * @file useProjectModal.ts
 * @description Hook personnalisé gérant l'état de la modale projet spatiale.
 * 
 * @responsibilities
 * - Gestion de l'état ouverture/fermeture
 * - Navigation clavier (Escape pour fermer)
 * - Verrouillage du scroll body quand la modale est active
 * - Respect de l'accessibilité (focus trap prêt)
 */

import { useState, useCallback, useEffect } from 'react';
import type { Project } from '@/lib/data/projects';
import type { ModalState } from '@/types/project.types';

export function useProjectModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    project: null,
  });

  /** Ouvre la modale avec le projet sélectionné */
  const openModal = useCallback((project: Project) => {
    setModalState({ isOpen: true, project });
  }, []);

  /** Ferme la modale et réinitialise l'état */
  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, project: null });
  }, []);

  /**
   * Side-effects liés à l'état de la modale :
   * 1. Écoute la touche Escape
   * 2. Verrouille le scroll du body
   */
  useEffect(() => {
    if (!modalState.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    // Verrouille le scroll du body
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalState.isOpen, closeModal]);

  return { modalState, openModal, closeModal };
}
