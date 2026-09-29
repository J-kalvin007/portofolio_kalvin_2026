/**
 * @file ArchitectureDiagram.tsx
 * @description Schéma d'architecture animé d'un projet : composants, liaisons,
 * zones d'exécution et cote de stack.
 *
 * @architecture
 * Composant **serveur** : le SVG est calculé et rendu au build (HTML statique,
 * lisible par les moteurs et sans JavaScript). Seule l'animation passe par
 * l'enveloppe client `ArchitectureFigure`, qui ne manipule que des attributs.
 *
 *  - Géométrie : `lib/architecture/layout.ts` (fonction pure).
 *  - Données   : `lib/data/architectures.ts` (un schéma par projet, typé).
 *  - Styles    : `architecture.css` (tracé, apparition, flux, survol).
 *
 * @accessibility Le dessin est décoratif pour les technologies d'assistance
 * (`aria-hidden`) ; son contenu est restitué en texte, dans une liste des
 * composants et une liste des liaisons, lisibles par un lecteur d'écran.
 */

import { useTranslations } from 'next-intl';
import type { Project } from '@/lib/data/projects';
import { ARCHITECTURES } from '@/lib/data/architectures';
import { DIMENSION_LINE_HEIGHT, layoutArchitecture, type PlacedNode } from '@/lib/architecture/layout';
import TechIcon from '@/components/ui/TechIcon';
import ArchitectureFigure from './ArchitectureFigure';
import './architecture.css';

/** Rayon d'angle des boîtes, et des acteurs (forme de pastille). */
const BOX_RADIUS = 6;

/** Longueur maximale d'une ligne de la cote de stack, en caractères. */
const STACK_LINE_MAX = 72;

/**
 * Largeur du logo et de son écart, exprimée en caractères.
 *
 * Volontairement généreuse : ce nombre ne sert qu'à **réserver** la hauteur du
 * schéma, et se tromper n'a pas le même prix dans les deux sens. Trop grand, on
 * prévoit une ligne de plus que nécessaire — quelques pixels de blanc sous la
 * cote. Trop petit, la cote déborde du cadre et vient chevaucher ce qui suit.
 */
const ICON_WIDTH_IN_CHARACTERS = 3;

/**
 * Nombre de lignes qu'occupera la cote de stack.
 *
 * @remarks **Pourquoi une estimation, et non une mesure.**
 * La cote est composée par le navigateur (voir le `<foreignObject>` plus bas),
 * qui seul connaît les largeurs réelles de Poppins. Mais la hauteur du schéma,
 * elle, doit être connue **avant** le rendu, puisqu'elle entre dans le
 * `viewBox`. On estime donc le nombre de lignes au caractère près ici, et l'on
 * arrondit toujours dans le sens qui laisse de la place.
 */
function stackLineCount(techStack: string[]): number {
  let lines = 1;
  let used = 0;

  for (const tech of techStack) {
    const width = tech.length + ICON_WIDTH_IN_CHARACTERS;
    if (used > 0 && used + width > STACK_LINE_MAX) {
      lines += 1;
      used = width;
    } else {
      used += width;
    }
  }

  return lines;
}

export default function ArchitectureDiagram({ project }: { project: Project }) {
  const t = useTranslations('architecture');
  const tCategories = useTranslations('project.categories');

  const architecture = ARCHITECTURES[project.i18nKey];
  const stackLines = stackLineCount(project.techStack);
  const layout = layoutArchitecture(architecture, stackLines);
  const markerId = `arch-arrow-${project.i18nKey}`;

  const nodeLabel = (node: PlacedNode) => t(`nodes.${node.label}`);
  const labelOf = new Map(layout.nodes.map((node) => [node.id, nodeLabel(node)]));

  return (
    <ArchitectureFigure label={t('summary', { title: project.title })}>
      <figcaption className="arch-caption">
        <span>{t('caption')}</span>
        <strong>{project.title}</strong>
        <span>{[tCategories(project.category), project.year].filter(Boolean).join(' · ')}</span>
      </figcaption>

      <div className="arch-scroll">
        <svg
          className="arch-svg"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {/* ── Zones d'exécution (conteneurs, hébergement) ── */}
          {layout.zones.map((zone) => (
            <g key={zone.name} className="arch-zone">
              <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx={BOX_RADIUS} />
              <text x={zone.labelX} y={zone.labelY} textAnchor="end">{zone.name.toUpperCase()}</text>
            </g>
          ))}

          {/* ── Liaisons : trait dessiné, flux animé, étiquette ── */}
          {layout.edges.map((edge) => (
            <g
              key={`${edge.from}-${edge.to}`}
              className="arch-edge"
              data-from={edge.from}
              data-to={edge.to}
              style={{ '--i': edge.order } as React.CSSProperties}
            >
              <path className="arch-line" d={edge.d} pathLength={1} markerEnd={`url(#${markerId})`} />
              <path className="arch-flow" d={edge.d} />
              {edge.label && (
                <text className="arch-label" x={edge.labelX} y={edge.labelY}>
                  {t(`edges.${edge.label}`)}
                </text>
              )}
            </g>
          ))}

          {/* ── Composants ── */}
          {layout.nodes.map((node) => {
            const isActor = node.kind === 'actor';
            const padding = isActor ? 26 : 16;
            const caption = node.tech ?? (node.kind === 'external' ? t('external') : undefined);

            return (
              <g
                key={node.id}
                className="arch-node"
                data-node={node.id}
                data-kind={node.kind}
                style={{ '--i': node.order } as React.CSSProperties}
              >
                <rect
                  className="arch-box"
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={isActor ? node.height / 2 : BOX_RADIUS}
                />
                {/* Stockage : deux filets en tête de boîte évoquent un registre. */}
                {node.kind === 'data' && (
                  <path
                    className="arch-mark"
                    d={`M ${node.x + node.width - 30} ${node.y + 14} H ${node.x + node.width - 14} M ${node.x + node.width - 30} ${node.y + 20} H ${node.x + node.width - 14}`}
                  />
                )}
                <text className="arch-title" x={node.x + padding} y={node.y + (caption ? 31 : 41)}>
                  {labelOf.get(node.id)}
                </text>
                {caption && (
                  <text className="arch-tech" x={node.x + padding} y={node.y + 52}>
                    {caption.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          {/* ── Cote : la stack déclarée du projet, de bout en bout ── */}
          <g className="arch-dim">
            <path
              d={`M ${layout.dimension.x1} ${layout.dimension.y} H ${layout.dimension.x2} M ${layout.dimension.x1} ${layout.dimension.y - 6} V ${layout.dimension.y + 6} M ${layout.dimension.x2} ${layout.dimension.y - 6} V ${layout.dimension.y + 6}`}
            />
            {/* La stack est composée en HTML, dans le dessin.

                Un `<text>` SVG ne peut pas contenir d'image : pour poser un
                logo devant chaque nom, il faudrait calculer soi-même la
                largeur de chaque mot — donc connaître les métriques de Poppins
                — puis placer chaque élément à la main. Le `<foreignObject>`
                rend la composition au navigateur, qui mesure juste et replie
                les lignes tout seul. La hauteur, elle, est réservée d'avance
                par `stackLineCount()` : c'est la seule valeur que le `viewBox`
                exige de connaître avant le rendu.

                `overflow="visible"` est la sécurité qui va avec : si la stack
                se replie sur une ligne de plus que prévu, elle dépasse du cadre
                réservé plutôt que d'être coupée. */}
            <foreignObject
              x={layout.dimension.x1}
              y={layout.dimension.y - DIMENSION_LINE_HEIGHT / 2}
              width={layout.dimension.x2 - layout.dimension.x1}
              height={stackLines * DIMENSION_LINE_HEIGHT}
              overflow="visible"
            >
              <ul className="arch-stack">
                {project.techStack.map((tech) => (
                  <li key={tech}>
                    <TechIcon name={tech} className="arch-stack-icon" />
                    {tech}
                  </li>
                ))}
              </ul>
            </foreignObject>
          </g>
        </svg>
      </div>

      {/* ── Restitution textuelle pour les lecteurs d'écran ── */}
      <div className="sr-only">
        <p>{t('components')}</p>
        <ul>
          {layout.nodes.map((node) => (
            <li key={node.id}>{labelOf.get(node.id)}{node.tech ? ` (${node.tech})` : ''}</li>
          ))}
        </ul>
        <p>{t('connections')}</p>
        <ul>
          {layout.edges.map((edge) => (
            <li key={`${edge.from}-${edge.to}`}>
              {t('link', { from: labelOf.get(edge.from) ?? edge.from, to: labelOf.get(edge.to) ?? edge.to })}
              {edge.label ? ` — ${t(`edges.${edge.label}`)}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </ArchitectureFigure>
  );
}
