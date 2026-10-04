'use client';

/**
 * @file LightField.tsx
 * @description Les lumières du fond : le halo qui suit le curseur, sa traîne,
 * et la lueur des motifs autour d'un bouton survolé.
 *
 * @architecture
 * Le composant rend un calque (`.vx-field`) dans son **élément parent**, qui
 * doit être positionné : `<main>` sur le site, la zone d'aperçu dans la régie.
 * Il n'a aucun état React : un mouvement de souris ne provoque **aucun rendu**.
 * Tout passe par trois éléments déplacés à la main, dans une boucle
 * `requestAnimationFrame` qui ne tourne que pendant le mouvement.
 *
 * ```
 *   pointermove ──► cible (coordonnées du curseur)
 *                      │  une image plus tard
 *                      ▼
 *   boucle ──► position lissée ──► transform + background-position
 *                      │
 *                      └─► arrivée à destination : la boucle s'arrête
 * ```
 *
 * @remarks **Pourquoi le halo reste superposé au motif éteint.**
 * Le halo est un carré qui porte la tuile *allumée*. Le fond de la page porte
 * la tuile *éteinte*, de mêmes dimensions (`lib/visual/tile.ts`). À chaque
 * déplacement, la tuile du halo est décalée de l'opposé de sa position :
 * chaque motif allumé retombe exactement sur son jumeau éteint. Le halo est de
 * plus un enfant du flux de la page — il défile avec elle, nativement : pendant
 * un défilement, les motifs allumés ne glissent jamais par rapport au fond.
 *
 * @remarks **Coût.** Un écouteur `pointermove` passif, une lecture de géométrie
 * et quatre écritures de style par image, sur des éléments que le navigateur
 * compose sans recalculer la mise en page. Souris immobile : rien ne tourne.
 * Écran tactile : aucun halo de curseur (il n'y a pas de curseur). Mouvement
 * réduit demandé : le halo se place sans inertie ni traîne.
 */

import { useEffect, useRef } from 'react';
import type { LightFieldSettings } from '@/lib/visual/css';
import './visual.css';

/** La traîne est un peu plus large que le halo : elle déborde derrière lui. */
const TRAIL_SCALE = 1.3;

/** En dessous de cet écart (px), le halo est considéré comme arrivé. */
const SETTLED_DISTANCE = 0.3;

/** Durée d'affichage de la lumière après un toucher, en millisecondes. */
const TOUCH_GLOW_MS = 900;

/** Mesures remontées à la régie (mode diagnostic). */
export interface LightFieldStats {
  /** Images par seconde pendant le dernier mouvement, ou `null` au repos. */
  fps: number | null;
}

interface LightFieldProps {
  /** Réglages calculés par `lightFieldSettings()` ; `null` : rien à afficher. */
  settings: LightFieldSettings | null;
  /**
   * Origine de la tuile du fond. `page` : le fond est celui de la page (site).
   * `host` : le fond est celui de l'élément parent (aperçu de la régie).
   */
  origin?: 'page' | 'host';
  onStats?: (stats: LightFieldStats) => void;
}

/** Reste toujours positif, contrairement à `%` sur un nombre négatif. */
const modulo = (value: number, divisor: number): number => ((value % divisor) + divisor) % divisor;

export default function LightField({ settings, origin = 'page', onStats }: LightFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const host = field?.parentElement;
    if (!settings || !field || !host) return;

    const core = coreRef.current;
    const trail = trailRef.current;
    const target = targetRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const size = settings.radius * 2;

    if (core) core.style.width = core.style.height = `${size}px`;
    if (trail) trail.style.width = trail.style.height = `${size * TRAIL_SCALE}px`;

    /* ── État de la boucle (hors React : le modifier ne rend rien) ──────────── */
    const pointer = { x: 0, y: 0, known: false };
    const corePosition = { x: 0, y: 0 };
    const trailPosition = { x: 0, y: 0 };
    let frame = 0;
    let previousTime = 0;
    let hovered: HTMLElement | null = null;
    let touchTimer: ReturnType<typeof setTimeout> | undefined;
    let framesCounted = 0;
    let countingSince = 0;

    /** Pose un halo, centré sur un point de la fenêtre, et recale sa tuile. */
    const place = (element: HTMLElement, bounds: DOMRect, clientX: number, clientY: number, width: number, height: number) => {
      // Positions entières : une tuile peinte à cheval sur deux pixels est floue,
      // et ne se superposerait plus au motif éteint.
      const left = Math.round(clientX - bounds.left - width / 2);
      const top = Math.round(clientY - bounds.top - height / 2);
      const phaseX = origin === 'page' ? left + bounds.left + window.scrollX : left;
      const phaseY = origin === 'page' ? top + bounds.top + window.scrollY : top;

      element.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      element.style.backgroundPosition = `${-modulo(Math.round(phaseX), settings.tileWidth)}px ${-modulo(Math.round(phaseY), settings.tileHeight)}px`;
    };

    const tick = (time: number) => {
      frame = 0;
      // Après une pause, l'écart de temps serait énorme : on le plafonne.
      const elapsed = Math.min(64, time - previousTime);
      previousTime = time;

      const bounds = host.getBoundingClientRect();
      const reach = settings.radius;
      const inside =
        pointer.known &&
        pointer.x >= bounds.left - reach &&
        pointer.x <= bounds.right + reach &&
        pointer.y >= bounds.top - reach &&
        pointer.y <= bounds.bottom + reach;
      field.toggleAttribute('data-active', inside);

      // Lissage exponentiel, indépendant de la cadence d'affichage : à 60 ou à
      // 144 images par seconde, le halo met le même temps à rejoindre le curseur.
      const instant = reducedMotion.matches || settings.smoothing === 0;
      const coreEase = instant ? 1 : 1 - Math.exp(-elapsed / (40 + settings.smoothing * 260));
      const trailEase = instant ? 1 : 1 - Math.exp(-elapsed / (220 + settings.smoothing * 700));

      corePosition.x += (pointer.x - corePosition.x) * coreEase;
      corePosition.y += (pointer.y - corePosition.y) * coreEase;
      trailPosition.x += (pointer.x - trailPosition.x) * trailEase;
      trailPosition.y += (pointer.y - trailPosition.y) * trailEase;

      if (core) place(core, bounds, corePosition.x, corePosition.y, size, size);
      if (trail) place(trail, bounds, trailPosition.x, trailPosition.y, size * TRAIL_SCALE, size * TRAIL_SCALE);

      if (onStats) {
        framesCounted += 1;
        if (time - countingSince >= 500) {
          onStats({ fps: Math.round((framesCounted * 1000) / (time - countingSince)) });
          framesCounted = 0;
          countingSince = time;
        }
      }

      const follower = trail ? trailPosition : corePosition;
      const settled = Math.abs(pointer.x - follower.x) < SETTLED_DISTANCE && Math.abs(pointer.y - follower.y) < SETTLED_DISTANCE;
      if (settled) onStats?.({ fps: null });
      else schedule();
    };

    const schedule = () => {
      if (frame !== 0) return;
      previousTime = performance.now();
      countingSince = previousTime;
      framesCounted = 0;
      frame = requestAnimationFrame(tick);
    };

    /** Mémorise la position du curseur ; la première fois, le halo y naît. */
    const aim = (clientX: number, clientY: number) => {
      if (!pointer.known) {
        corePosition.x = trailPosition.x = clientX;
        corePosition.y = trailPosition.y = clientY;
      }
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.known = true;
      schedule();
    };

    /* ── Lueur des motifs autour d'un bouton ─────────────────────────────── */
    const highlight = (button: HTMLElement | null) => {
      if (!target || !settings.linked) return;
      if (!button) {
        target.removeAttribute('data-on');
        return;
      }
      const bounds = host.getBoundingClientRect();
      const rect = button.getBoundingClientRect();
      const width = rect.width + settings.linkedSpread * 2;
      const height = rect.height + settings.linkedSpread * 2;
      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
      place(target, bounds, rect.left + rect.width / 2, rect.top + rect.height / 2, width, height);
      target.setAttribute('data-on', '');
    };

    const buttonAt = (node: EventTarget | null): HTMLElement | null => {
      const button = node instanceof Element ? node.closest<HTMLElement>('.vx-glow') : null;
      return button && host.contains(button) ? button : null;
    };

    /* ── Écouteurs ───────────────────────────────────────────────────────── */
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (settings.cursor) aim(event.clientX, event.clientY);

      if (settings.follow && hovered) {
        const rect = hovered.getBoundingClientRect();
        hovered.style.setProperty('--vx-mx', `${Math.round(event.clientX - rect.left)}px`);
        hovered.style.setProperty('--vx-my', `${Math.round(event.clientY - rect.top)}px`);
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const button = buttonAt(event.target);
      if (button === hovered) return;
      hovered = button;
      highlight(button);
    };

    const handleFocusIn = (event: FocusEvent) => {
      const button = buttonAt(event.target);
      // Seul le focus clavier allume : un clic de souris donne aussi le focus,
      // mais le survol s'en charge déjà.
      if (button?.matches(':focus-visible')) highlight(button);
    };
    const handleFocusOut = () => highlight(hovered);

    /** Le curseur a quitté la fenêtre : tout s'éteint. */
    const handleLeave = () => {
      pointer.known = false;
      hovered = null;
      field.removeAttribute('data-active');
      highlight(null);
    };

    /** Écran tactile : la lumière naît sous le doigt, puis s'éteint seule. */
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !settings.touch) return;
      pointer.known = false; // le halo naît sur place, sans glisser depuis l'ancien point
      aim(event.clientX, event.clientY);
      clearTimeout(touchTimer);
      touchTimer = setTimeout(handleLeave, TOUCH_GLOW_MS);
    };

    const options = { passive: true } as const;
    window.addEventListener('pointermove', handlePointerMove, options);
    window.addEventListener('pointerdown', handlePointerDown, options);
    // Défilement : le curseur n'a pas bougé, mais la page a glissé sous lui.
    window.addEventListener('scroll', schedule, options);
    document.addEventListener('pointerover', handlePointerOver, options);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.documentElement.addEventListener('pointerleave', handleLeave);
    window.addEventListener('blur', handleLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener('blur', handleLeave);
      cancelAnimationFrame(frame);
      clearTimeout(touchTimer);
      field.removeAttribute('data-active');
      target?.removeAttribute('data-on');
    };
  }, [settings, origin, onStats]);

  if (!settings) return null;

  return (
    <div ref={fieldRef} className="vx-field" aria-hidden="true">
      <div className="vx-ambient" />
      {settings.cursor && settings.trail && <div ref={trailRef} className="vx-spot vx-spot--trail" />}
      {(settings.cursor || settings.touch) && <div ref={coreRef} className="vx-spot vx-spot--core" />}
      {settings.linked && <div ref={targetRef} className="vx-spot vx-spot--target" />}
    </div>
  );
}
