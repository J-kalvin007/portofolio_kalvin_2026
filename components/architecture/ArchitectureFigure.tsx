'use client';

/**
 * @file ArchitectureFigure.tsx
 * @description Enveloppe interactive d'un schéma d'architecture : animation
 * d'apparition, pause des flux hors écran, mise en évidence au survol.
 *
 * @architecture
 * Le schéma lui-même est rendu côté serveur (`ArchitectureDiagram`) et arrive
 * ici en `children`. Ce composant ne fait que piloter des attributs `data-*`
 * sur l'élément `<figure>` ; toute l'animation est en CSS
 * (`architecture.css`). Aucun état React n'est modifié : un défilement ou un
 * survol ne provoque aucun rendu.
 *
 * États de `data-reveal` :
 *  - `static`  : valeur rendue par le serveur. Le schéma est entièrement visible
 *                — sans JavaScript, en mouvement réduit, ou s'il est déjà à
 *                l'écran au chargement.
 *  - `pending` : posé au montage si le schéma est encore hors écran. Les
 *                composants et liaisons sont masqués, en attente.
 *  - `play`    : posé quand le schéma entre à l'écran. Les composants
 *                apparaissent, puis les liaisons se dessinent, puis la cote.
 *
 * `data-visible` suspend les flux animés des schémas hors écran : jusqu'à huit
 * schémas sur la page, qui n'ont pas à être redessinés en permanence.
 */

import { useEffect, useRef, type ReactNode } from 'react';

/** Part du schéma qui doit être visible pour lancer l'animation. */
const REVEAL_THRESHOLD = 0.2;

export default function ArchitectureFigure({ label, children }: { label: string; children: ReactNode }) {
  const figureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;

    const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Apparition : seulement pour un schéma qui n'est pas déjà visible ──
       Un schéma replié dans un <details> a une hauteur nulle : il attend lui
       aussi, et s'anime à l'ouverture de la ligne. */
    const bounds = figure.getBoundingClientRect();
    const alreadyVisible = bounds.height > 0 && bounds.top < window.innerHeight && bounds.bottom > 0;
    if (motionAllowed && !alreadyVisible) figure.dataset.reveal = 'pending';

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          figure.toggleAttribute('data-visible', entry.isIntersecting);
          if (entry.isIntersecting && figure.dataset.reveal === 'pending') figure.dataset.reveal = 'play';
        }
      },
      { threshold: REVEAL_THRESHOLD },
    );
    observer.observe(figure);

    /* ── Survol : les liaisons d'un composant ressortent, le reste s'estompe ── */
    const svg = figure.querySelector('svg');
    const related = new Set<Element>();

    const clearFocus = () => {
      related.forEach((element) => element.classList.remove('is-related'));
      related.clear();
      delete figure.dataset.focus;
    };

    const handlePointerOver = (event: PointerEvent) => {
      const node = (event.target as Element).closest('[data-node]');
      if (!node) return;
      const id = node.getAttribute('data-node')!;
      if (figure.dataset.focus === id) return;

      clearFocus();
      figure.dataset.focus = id;
      related.add(node);
      figure.querySelectorAll(`[data-from="${id}"], [data-to="${id}"]`).forEach((edge) => {
        related.add(edge);
        const otherId = edge.getAttribute('data-from') === id ? edge.getAttribute('data-to') : edge.getAttribute('data-from');
        const other = figure.querySelector(`[data-node="${otherId}"]`);
        if (other) related.add(other);
      });
      related.forEach((element) => element.classList.add('is-related'));
    };

    svg?.addEventListener('pointerover', handlePointerOver);
    svg?.addEventListener('pointerleave', clearFocus);

    return () => {
      observer.disconnect();
      svg?.removeEventListener('pointerover', handlePointerOver);
      svg?.removeEventListener('pointerleave', clearFocus);
    };
  }, []);

  return (
    <figure ref={figureRef} className="arch" data-reveal="static" aria-label={label}>
      {children}
    </figure>
  );
}
