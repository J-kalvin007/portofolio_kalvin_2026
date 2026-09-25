'use client';

/**
 * @file ProjectCard.tsx
 * @description Carte d'un projet sur la page Projets, avec sa désintégration.
 *
 * @architecture
 * La carte est un **lien** vers l'ancre de sa fiche (`#projet-…`). Sans
 * JavaScript, le clic révèle donc la fiche complète (voir `showcase.css`) ;
 * avec JavaScript, `ProjectShowcase` intercepte le clic, joue la
 * désintégration, puis ouvre la modale. Un seul élément interactif par carte :
 * un seul arrêt de tabulation, un seul nom accessible.
 *
 * @animation
 * L'effet reprend celui d'avant la refonte — la carte éclate en fragments qui
 * s'envolent — avec deux différences :
 *  1. les fragments portent **la capture du projet**, découpée en 35 tuiles :
 *     c'est la carte elle-même qui se brise, au lieu d'une pluie de carrés
 *     colorés posée par-dessus ;
 *  2. tout est en CSS (`showcase.css`), piloté par un seul attribut
 *     `data-phase`. Aucune image n'est calculée en JavaScript, et la
 *     préférence « mouvement réduit » désactive l'effet entièrement.
 *
 * Les trajectoires sont tirées d'un générateur déterministe, semé par le nom du
 * projet : elles sont donc identiques d'un rendu à l'autre, et deux cartes
 * voisines n'éclatent jamais de la même façon.
 */

import { useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Arrow from '@/components/ui/Arrow';
import TechIcon from '@/components/ui/TechIcon';
import { TECH_ICONS } from '@/components/ui/tech-icons';

/**
 * Découpe de la carte en fragments : 6 × 4 = 24 tuiles.
 *
 * Volontairement grossière : des tuiles larges laissent reconnaître l'image
 * pendant tout le vol, là où un grain fin se lit comme une simple poussière.
 */
const SHATTER_COLS = 6;
const SHATTER_ROWS = 4;

/**
 * Durée d'une phase de désintégration.
 *
 * Valeur unique, déclarée ici et transmise au CSS par la variable
 * `--pj-shatter-duration` : les minuteries de `ProjectShowcase` et les
 * animations de `showcase.css` ne peuvent pas se désynchroniser.
 */
export const SHATTER_DURATION_MS = 520;

/** Nombre maximal de logos affichés avant le compteur « +N ». */
const MAX_VISIBLE_TECHS = 5;

export type ShatterPhase = 'idle' | 'out' | 'in';

export interface ProjectCardData {
  /** Ancre de la fiche complète (`projet-atelier`). */
  anchor: string;
  /** Numéro affiché sur le visuel (« 01 »). */
  number: string;
  title: string;
  /** Catégorie déjà traduite. */
  category: string;
  year?: string;
  cover: string;
  /** Description courte, deux lignes au plus à l'écran. */
  summary: string;
  techStack: string[];
  /** Le produit tourne en ligne : il reçoit le tampon « En production ». */
  isLive: boolean;
}

interface ProjectCardProps extends ProjectCardData {
  phase: ShatterPhase;
  /** Ouverture demandée (clic ou clavier) : le parent décide de la suite. */
  onOpen: (anchor: string) => void;
  /** Position dans la grille : n'influence que la priorité de chargement. */
  index: number;
}

/**
 * Suite pseudo-aléatoire déterministe, semée par une chaîne : la même carte
 * éclate toujours de la même façon, sans jamais dépendre de `Math.random`
 * (qui différerait entre le rendu serveur et le navigateur).
 */
function seededRandom(seed: string) {
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) % 2147483647;

  return () => {
    state = (state * 1103515245 + 12345) % 2147483647;
    return state / 2147483647;
  };
}

export default function ProjectCard({
  anchor,
  number,
  title,
  category,
  year,
  cover,
  summary,
  techStack,
  isLive,
  phase,
  onOpen,
  index,
}: ProjectCardProps) {
  const t = useTranslations('project');

  /* ── Fragments : calculés une fois par carte, jamais pendant l'animation ── */
  const pieces = useMemo(() => {
    const random = seededRandom(anchor);

    return Array.from({ length: SHATTER_COLS * SHATTER_ROWS }, (_, id) => {
      const col = id % SHATTER_COLS;
      const row = Math.floor(id / SHATTER_COLS);

      // Envol vers le haut, avec une dérive latérale qui suit la colonne :
      // les fragments s'écartent du centre au lieu de partir dans tous les sens.
      const drift = (col / (SHATTER_COLS - 1) - 0.5) * 2;

      return {
        id,
        col,
        row,
        dx: `${Math.round(drift * 90 + (random() - 0.5) * 60)}px`,
        dy: `${-Math.round(40 + random() * 150)}px`,
        rot: `${Math.round((random() - 0.5) * 220)}deg`,
        // La vague part du bas : les dernières lignes s'envolent en premier.
        delay: `${((SHATTER_ROWS - 1 - row) * 0.045 + random() * 0.06).toFixed(3)}s`,
      };
    });
  }, [anchor]);

  const visibleTechs = techStack.filter((tech) => tech in TECH_ICONS).slice(0, MAX_VISIBLE_TECHS);
  const hiddenTechCount = techStack.length - visibleTechs.length;

  return (
    <>
      {/* Fragments : présents seulement pendant une phase animée. */}
      {phase !== 'idle' && (
        <div
          className="pj-shatter"
          aria-hidden="true"
          style={
            {
              '--cols': SHATTER_COLS,
              '--rows': SHATTER_ROWS,
              // Les fragments sont peints avec la capture du projet.
              '--pj-image': `url("${cover}")`,
            } as React.CSSProperties
          }
        >
          {pieces.map(({ id, col, row, dx, dy, rot, delay }) => (
            <div
              key={id}
              className="pj-piece"
              style={
                {
                  '--col': col,
                  '--row': row,
                  '--dx': dx,
                  '--dy': dy,
                  '--rot': rot,
                  animationDelay: delay,
                } as React.CSSProperties
              }
            />
          ))}
          {phase === 'out' && <div className="pj-scan" />}
        </div>
      )}

      <a
        href={`#${anchor}`}
        className="pj-card"
        onClick={(event) => {
          // Le lien reste vrai (clic milieu, « ouvrir dans un onglet », sans
          // JavaScript) ; seul le clic simple est repris par la modale.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
          event.preventDefault();
          onOpen(anchor);
        }}
      >
        <div className="pj-card-media">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 45vw, 30rem"
            /* Les deux premières cartes sont visibles d'emblée : elles ne sont
               pas différées, les suivantes le sont. */
            priority={index < 2}
          />
          <p className="pj-card-number" aria-hidden="true">{number}</p>
          <ul className="pj-card-chips">
            <li className="pj-card-chip">{category}</li>
            {year && <li className="pj-card-chip">{year}</li>}
            {isLive && <li className="pj-card-chip pj-card-chip--live">{t('inProduction')}</li>}
          </ul>
        </div>

        <div className="pj-card-body">
          <h3 className="pj-card-title">{title}</h3>
          <p className="pj-card-text">{summary}</p>

          {visibleTechs.length > 0 && (
            <ul className="pj-card-stack" aria-label={t('technologies')}>
              {visibleTechs.map((tech) => (
                <li key={tech} title={tech}>
                  <TechIcon name={tech} />
                </li>
              ))}
              {hiddenTechCount > 0 && (
                <li className="pj-card-stack-more" aria-hidden="true">+{hiddenTechCount}</li>
              )}
            </ul>
          )}

          <p className="pj-card-cta">
            {t('details')}
            <Arrow />
          </p>
        </div>
      </a>
    </>
  );
}
