// 'use client';

// /**
//  * @file useProjectModal.ts
//  * @description Hook personnalisé gérant l'état de la modale projet spatiale.
//  * 
//  * @responsibilities
//  * - Gestion de l'état ouverture/fermeture
//  * - Navigation clavier (Escape pour fermer)
//  * - Verrouillage du scroll body quand la modale est active
//  * - Respect de l'accessibilité (focus trap prêt)
//  */

// import { useState, useCallback, useEffect } from 'react';
// import type { Project } from '@/lib/data/projects';
// import type { ModalState } from '@/types/project.types';

// export function useProjectModal() {
//   const [modalState, setModalState] = useState<ModalState>({
//     isOpen: false,
//     project: null,
//   });

//   /** Ouvre la modale avec le projet sélectionné */
//   const openModal = useCallback((project: Project) => {
//     setModalState({ isOpen: true, project });
//   }, []);

//   /** Ferme la modale et réinitialise l'état */
//   const closeModal = useCallback(() => {
//     setModalState({ isOpen: false, project: null });
//   }, []);

//   /**
//    * Side-effects liés à l'état de la modale :
//    * 1. Écoute la touche Escape
//    * 2. Verrouille le scroll du body
//    */
//   useEffect(() => {
//     if (!modalState.isOpen) return;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') closeModal();
//     };

//     // Verrouille le scroll du body
//     document.body.style.overflow = 'hidden';
//     window.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.body.style.overflow = '';
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [modalState.isOpen, closeModal]);

//   return { modalState, openModal, closeModal };
// }






'use client';

/**
 * @file useProjectModal.ts
 * @description Hook personnalisé gérant l'état de la modale projet spatiale.
 * 
 * @responsibilities
 * - Gestion de l'état ouverture/fermeture
 * - Navigation clavier (Escape pour fermer)
 * - Verrouillage du scroll body quand la modale est active
 * - Conservation du projet le temps de l'animation de sortie
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Project } from '@/lib/data/projects';
import type { ModalState } from '@/types/project.types';

/**
 * Durée de l'animation de sortie de `ProjectModal`, en millisecondes.
 * Le projet reste en mémoire pendant ce laps de temps : au-delà, l'état est purgé.
 */
const EXIT_ANIMATION_MS = 500;

export function useProjectModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    project: null,
  });

  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Ouvre la modale avec le projet sélectionné */
  const openModal = useCallback((project: Project) => {
    // Une réouverture rapide doit annuler la purge programmée de la précédente.
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    setModalState({ isOpen: true, project });
  }, []);

  /**
   * Ferme la modale et réinitialise l'état.
   *
   * ⚠️ **Correctif.** `closeModal` remettait `project` à `null` dans le même
   * rendu que `isOpen: false`. Or `ProjectModal` commence par
   * `if (!project) return null` : l'arbre disparaissait instantanément, et
   * `AnimatePresence` n'avait plus aucun enfant à faire sortir. **L'animation de
   * fermeture ne s'est donc jamais jouée** — la modale s'évanouissait d'un coup.
   *
   * Le projet est désormais conservé le temps de la sortie, puis purgé.
   */
  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));

    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setModalState({ isOpen: false, project: null });
      exitTimerRef.current = null;
    }, EXIT_ANIMATION_MS);
  }, []);

  /** Annulation de la purge si le composant est démonté entre-temps. */
  useEffect(() => () => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
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

    /**
     * ⚠️ **Correctif du verrou.** La version précédente restaurait
     * `overflow = ''` en dur au lieu de rendre la valeur qui précédait. Un autre
     * composant ayant verrouillé le défilement — la visionneuse d'images ou le
     * menu mobile — voyait son verrou levé par la simple fermeture de cette
     * modale, et la page se remettait à défiler derrière lui.
     *
     * La largeur de la barre de défilement est en outre compensée : sans cela,
     * toute la page se décalait d'une dizaine de pixels à l'ouverture.
     */
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalState.isOpen, closeModal]);

  return { modalState, openModal, closeModal };
}