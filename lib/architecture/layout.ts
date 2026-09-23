/**
 * @file layout.ts
 * @description Géométrie des schémas d'architecture : place les composants,
 * trace les liaisons orthogonales, calcule les zones et la cote de stack.
 *
 * @architecture
 * Fonction **pure** : elle ne dépend ni de React ni du navigateur. Le composant
 * serveur `ArchitectureDiagram` l'appelle pour produire le SVG ; elle peut être
 * testée seule. Les données (`lib/data/architectures.ts`) ne décrivent que des
 * positions de composants et des liaisons « de → vers » : tous les tracés en
 * découlent.
 *
 * Règles de tracé :
 *  - Une liaison part du côté de la boîte source qui fait face à la cible
 *    (droite, gauche, haut ou bas) et arrive sur le côté opposé de la cible.
 *  - Quand plusieurs liaisons partagent un même côté, leurs points d'ancrage
 *    sont répartis régulièrement le long de ce côté, dans l'ordre de position
 *    de l'autre extrémité : les lignes ne se croisent pas au départ.
 *  - Quand plusieurs liaisons traversent le même couloir entre deux colonnes,
 *    leurs segments verticaux sont répartis dans ce couloir.
 */

import type { Architecture, ArchEdge, ArchNode, ArchNodeKind } from '@/lib/data/architectures';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ DIMENSIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Largeur de la zone de dessin (unités SVG). La hauteur dépend du contenu. */
export const VIEW_WIDTH = 820;

/** Dimensions par défaut d'un composant. */
export const NODE_WIDTH = 176;
export const NODE_HEIGHT = 72;

/** Écart minimal entre deux boîtes pour qu'une liaison horizontale soit possible. */
const MIN_HORIZONTAL_GAP = 24;

/** Marge intérieure des zones (Docker, Vercel…) autour de leurs composants. */
const ZONE_PADDING = 20;

/** Distance entre le bas du schéma et la cote de stack. */
const DIMENSION_GAP = 30;

/** Marge laissée sous la cote pour son texte. */
const BOTTOM_MARGIN = 20;

/** Marge latérale de la cote. */
const SIDE_MARGIN = 24;

/** Interligne du texte de la cote, quand la stack tient sur plusieurs lignes. */
export const DIMENSION_LINE_HEIGHT = 15;

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ TYPES DU RÉSULTAT
   ═══════════════════════════════════════════════════════════════════════════ */

type Side = 'left' | 'right' | 'top' | 'bottom';

export interface PlacedNode {
  id: string;
  kind: ArchNodeKind;
  label: ArchNode['label'];
  tech?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Ordre d'apparition dans l'animation (de gauche à droite, puis de haut en bas). */
  order: number;
}

export interface PlacedEdge {
  from: string;
  to: string;
  label?: ArchEdge['label'];
  /** Tracé SVG orthogonal, de l'ancrage source à l'ancrage cible. */
  d: string;
  labelX: number;
  labelY: number;
  order: number;
}

export interface PlacedZone {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  labelX: number;
  labelY: number;
}

export interface ArchitectureLayout {
  width: number;
  height: number;
  nodes: PlacedNode[];
  edges: PlacedEdge[];
  zones: PlacedZone[];
  dimension: { y: number; x1: number; x2: number };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CALCUL
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param stackLineCount Nombre de lignes du texte de la cote (une stack longue
 * est répartie sur plusieurs lignes) : la hauteur du schéma en tient compte.
 */
export function layoutArchitecture(architecture: Architecture, stackLineCount = 1): ArchitectureLayout {
  /* ── 1. Boîtes, ordonnées de gauche à droite puis de haut en bas ────────── */
  const sorted = [...architecture.nodes].sort((a, b) => a.x - b.x || a.y - b.y);
  const nodes: PlacedNode[] = sorted.map((node, order) => ({
    id: node.id,
    kind: node.kind,
    label: node.label,
    tech: node.tech,
    x: node.x,
    y: node.y,
    width: node.width ?? NODE_WIDTH,
    height: NODE_HEIGHT,
    order,
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const find = (id: string): PlacedNode => {
    const node = byId.get(id);
    if (!node) throw new Error(`Schéma d'architecture : composant inconnu « ${id} ».`);
    return node;
  };

  /* ── 2. Côtés de départ et d'arrivée de chaque liaison ──────────────────── */
  const routed = architecture.edges.map((edge) => {
    const source = find(edge.from);
    const target = find(edge.to);
    let sourceSide: Side;
    let targetSide: Side;

    if (target.x >= source.x + source.width + MIN_HORIZONTAL_GAP) {
      sourceSide = 'right';
      targetSide = 'left';
    } else if (target.x + target.width + MIN_HORIZONTAL_GAP <= source.x) {
      sourceSide = 'left';
      targetSide = 'right';
    } else if (target.y >= source.y + source.height) {
      sourceSide = 'bottom';
      targetSide = 'top';
    } else if (target.y + target.height <= source.y) {
      sourceSide = 'top';
      targetSide = 'bottom';
    } else {
      throw new Error(`Schéma d'architecture : « ${edge.from} » et « ${edge.to} » se chevauchent, liaison impossible à tracer.`);
    }

    return { edge, source, target, sourceSide, targetSide };
  });

  /* ── 3. Répartition des ancrages le long de chaque côté ─────────────────── */
  const center = (node: PlacedNode) => ({ x: node.x + node.width / 2, y: node.y + node.height / 2 });
  const anchorFraction = new Map<string, number>(); // clé : `${index}:source|target`

  const groups = new Map<string, { key: string; along: number }[]>();
  routed.forEach(({ source, target, sourceSide, targetSide }, index) => {
    const push = (node: PlacedNode, side: Side, other: PlacedNode, role: 'source' | 'target') => {
      const groupKey = `${node.id}:${side}`;
      const otherCenter = center(other);
      const along = side === 'left' || side === 'right' ? otherCenter.y : otherCenter.x;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)!.push({ key: `${index}:${role}`, along });
    };
    push(source, sourceSide, target, 'source');
    push(target, targetSide, source, 'target');
  });

  for (const entries of groups.values()) {
    entries.sort((a, b) => a.along - b.along);
    entries.forEach((entry, i) => anchorFraction.set(entry.key, (i + 1) / (entries.length + 1)));
  }

  const anchor = (node: PlacedNode, side: Side, fraction: number) => {
    switch (side) {
      case 'right': return { x: node.x + node.width, y: node.y + node.height * fraction };
      case 'left': return { x: node.x, y: node.y + node.height * fraction };
      case 'bottom': return { x: node.x + node.width * fraction, y: node.y + node.height };
      case 'top': return { x: node.x + node.width * fraction, y: node.y };
    }
  };

  const points = routed.map(({ source, target, sourceSide, targetSide }, index) => ({
    start: anchor(source, sourceSide, anchorFraction.get(`${index}:source`)!),
    end: anchor(target, targetSide, anchorFraction.get(`${index}:target`)!),
    horizontal: sourceSide === 'left' || sourceSide === 'right',
  }));

  /* ── 4. Répartition des segments dans les couloirs partagés ─────────────── */
  const corridor = new Map<string, number[]>();
  points.forEach((point, index) => {
    const key = point.horizontal
      ? `h:${Math.round(point.start.x)}:${Math.round(point.end.x)}`
      : `v:${Math.round(point.start.y)}:${Math.round(point.end.y)}`;
    if (!corridor.has(key)) corridor.set(key, []);
    corridor.get(key)!.push(index);
  });

  const middle = new Map<number, number>();
  for (const [key, indices] of corridor) {
    const horizontal = key.startsWith('h:');
    indices.sort((a, b) => (horizontal ? points[a].start.y - points[b].start.y : points[a].start.x - points[b].start.x));
    indices.forEach((edgeIndex, i) => {
      const { start, end } = points[edgeIndex];
      const fraction = (i + 1) / (indices.length + 1);
      middle.set(edgeIndex, horizontal ? start.x + (end.x - start.x) * fraction : start.y + (end.y - start.y) * fraction);
    });
  }

  /* ── 5. Tracés et étiquettes ────────────────────────────────────────────── */
  const round = (value: number) => Math.round(value * 10) / 10;

  const edges: PlacedEdge[] = routed.map(({ edge, source }, index) => {
    const { start, end, horizontal } = points[index];
    const mid = middle.get(index)!;
    let d: string;
    let labelX: number;
    let labelY: number;

    if (horizontal) {
      d = start.y === end.y
        ? `M ${round(start.x)} ${round(start.y)} H ${round(end.x)}`
        : `M ${round(start.x)} ${round(start.y)} H ${round(mid)} V ${round(end.y)} H ${round(end.x)}`;
      // Étiquette au-dessus du premier segment, côté départ.
      labelX = start.x < end.x ? start.x + 8 : start.x - 8;
      labelY = start.y - 8;
    } else {
      d = start.x === end.x
        ? `M ${round(start.x)} ${round(start.y)} V ${round(end.y)}`
        : `M ${round(start.x)} ${round(start.y)} V ${round(mid)} H ${round(end.x)} V ${round(end.y)}`;
      // Étiquette à droite du segment vertical, à mi-hauteur.
      labelX = end.x + 10;
      labelY = (start.y + end.y) / 2 + 4;
    }

    return {
      from: edge.from,
      to: edge.to,
      label: edge.label,
      d,
      labelX: round(labelX),
      labelY: round(labelY),
      order: source.order,
    };
  });

  /* ── 6. Zones (conteneurs, hébergement) ─────────────────────────────────── */
  const zones: PlacedZone[] = (architecture.zones ?? []).map((zone) => {
    const members = zone.nodes.map(find);
    const minX = Math.min(...members.map((n) => n.x)) - ZONE_PADDING;
    const minY = Math.min(...members.map((n) => n.y)) - ZONE_PADDING;
    const maxX = Math.max(...members.map((n) => n.x + n.width)) + ZONE_PADDING;
    const maxY = Math.max(...members.map((n) => n.y + n.height)) + ZONE_PADDING;
    return {
      name: zone.name,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      labelX: maxX - 10,
      labelY: maxY - 8,
    };
  });

  /* ── 7. Cote de stack et hauteur totale ─────────────────────────────────── */
  const contentBottom = Math.max(
    ...nodes.map((n) => n.y + n.height),
    ...zones.map((z) => z.y + z.height),
  );
  const dimensionY = contentBottom + DIMENSION_GAP;

  return {
    width: VIEW_WIDTH,
    height: dimensionY + BOTTOM_MARGIN + (Math.max(1, stackLineCount) - 1) * DIMENSION_LINE_HEIGHT,
    nodes,
    edges,
    zones,
    dimension: { y: dimensionY, x1: SIDE_MARGIN, x2: VIEW_WIDTH - SIDE_MARGIN },
  };
}
