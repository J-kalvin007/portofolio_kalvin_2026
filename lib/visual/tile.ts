/**
 * @file lib/visual/tile.ts
 * @description Fabrique la tuile SVG du fond à partir du motif configuré.
 *
 * @architecture
 * Le fond du site est une **image CSS répétée** : une petite tuile, dessinée une
 * fois, que le navigateur recopie sur toute la page sans aucun script. C'est le
 * procédé d'origine (`--ds-grain`) ; ce fichier le rend paramétrable.
 *
 * Trois tuiles sortent d'ici, toutes de **mêmes dimensions et de même géométrie** :
 *  - la tuile éteinte — le fond de base ;
 *  - la tuile allumée — le même motif, dans la couleur des lumières et entouré
 *    de son halo. Les lumières (`LightField`) la peignent par-dessus la
 *    première, à travers un masque : les deux se superposent au pixel près
 *    précisément parce qu'elles sortent de la même fonction ;
 *  - le masque de scintillement — des cases plus ou moins opaques.
 *
 * @remarks **Régularité et variété.** Une grille parfaite tient dans une tuile
 * d'un seul motif. Dès qu'un réglage demande de la variété — dispersion,
 * profondeur, seconde couleur — la tuile s'agrandit à 5 × 5 mailles, et chaque
 * motif y reçoit ses propres écarts. Ces écarts sont **pseudo-aléatoires mais
 * déterministes** : tirés d'un générateur semé par la position du motif, ils
 * sont identiques sur le serveur et dans le navigateur, d'une visite à l'autre.
 * `Math.random()` produirait un fond différent à chaque rendu, donc un écart
 * d'hydratation.
 */

import type { VisualConfig } from './config';
import { motifShape } from './motifs';

/** Nombre de mailles par côté d'une tuile variée. */
const VARIED_REPEATS = 5;

/** Rapport de hauteur d'une ligne en quinconce (réseau triangulaire). */
const STAGGER_RATIO = Math.sqrt(3) / 2;

export interface TileSize {
  width: number;
  height: number;
}

/** Encre d'une tuile : couleur, opacité, et ce qui entoure le motif. */
export interface TilePaint {
  /** Couleur du motif, hexadécimale. */
  color: string;
  /** Opacité du motif, de 0 à 1. */
  opacity: number;
  /** Seconde couleur, portée par `secondaryShare` des motifs. */
  secondary?: string;
  secondaryShare?: number;
  /** Rayon du halo autour de chaque motif, en pixels (0 ou absent : aucun). */
  haloRadius?: number;
  /** Opacité du halo en son centre. */
  haloOpacity?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ GÉOMÉTRIE
   ═══════════════════════════════════════════════════════════════════════════ */

/** `true` si la tuile doit porter plusieurs mailles pour varier ses motifs. */
const needsVariety = (config: VisualConfig): boolean =>
  config.pattern.scatter > 0 || config.pattern.depth > 0 || config.light.secondaryShare > 0;

/**
 * Maille : le plus petit rectangle qui, répété, reproduit la disposition.
 *
 * Le premier motif est posé **dans le coin haut-gauche** de la maille, comme
 * dans la tuile d'origine du site (un carré de 2 px en 0,0). Avec les réglages
 * par défaut, la tuile fabriquée ici est donc identique, au pixel près, à
 * `--ds-grain` : activer les lumières ne déplace pas le fond d'un pixel.
 */
function unitOf(pattern: VisualConfig['pattern']): { width: number; height: number; points: { x: number; y: number }[] } {
  const { spacing } = pattern;
  const corner = pattern.size / 2;

  if (pattern.layout === 'staggered') {
    // Deux lignes par maille, la seconde décalée d'un demi-pas. Hauteur
    // arrondie au pixel : une tuile de hauteur fractionnaire se répète flou.
    const rowHeight = Math.round(spacing * STAGGER_RATIO);
    return {
      width: spacing,
      height: rowHeight * 2,
      points: [
        { x: corner, y: corner },
        { x: corner + spacing / 2, y: corner + rowHeight },
      ],
    };
  }

  return { width: spacing, height: spacing, points: [{ x: corner, y: corner }] };
}

/** Dimensions de la tuile, en pixels. Partagées par le CSS et par les lumières. */
export function tileSize(config: VisualConfig): TileSize {
  const unit = unitOf(config.pattern);
  const repeats = needsVariety(config) ? VARIED_REPEATS : 1;
  return { width: unit.width * repeats, height: unit.height * repeats };
}

/** Dimensions du masque de scintillement : toujours 5 × 5 mailles. */
export function twinkleSize(config: VisualConfig): TileSize {
  const unit = unitOf(config.pattern);
  return { width: unit.width * VARIED_REPEATS, height: unit.height * VARIED_REPEATS };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ HASARD DÉTERMINISTE
   ═══════════════════════════════════════════════════════════════════════════ */

/** Générateur « mulberry32 » : une suite reproductible à partir d'une graine. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Graine propre à un motif : sa maille et son rang dans la maille. */
const seedOf = (column: number, row: number, point: number): number =>
  (Math.imul(column + 1, 73856093) ^ Math.imul(row + 1, 19349663) ^ Math.imul(point + 1, 83492791)) >>> 0;

interface PlacedMotif {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  /** Atténuation propre au motif (profondeur), de 0 à 1. */
  alpha: number;
  /** `true` : le motif porte la seconde couleur. */
  secondary: boolean;
}

/** Tous les motifs d'une tuile, avec leurs écarts individuels. */
function placeMotifs(config: VisualConfig, secondaryShare: number): PlacedMotif[] {
  const { pattern } = config;
  const unit = unitOf(pattern);
  const repeats = needsVariety(config) ? VARIED_REPEATS : 1;
  const placed: PlacedMotif[] = [];

  for (let row = 0; row < repeats; row++) {
    for (let column = 0; column < repeats; column++) {
      unit.points.forEach((point, index) => {
        const random = seededRandom(seedOf(column, row, index));
        // L'ordre des tirages est fixe : en ajouter un à la fin ne déplace pas
        // les motifs déjà publiés.
        const jitterX = (random() - 0.5) * pattern.spacing * 0.9 * pattern.scatter;
        const jitterY = (random() - 0.5) * pattern.spacing * 0.9 * pattern.scatter;
        const turn = (random() - 0.5) * 180 * pattern.scatter;
        const distance = random() * pattern.depth;
        const isSecondary = random() < secondaryShare;

        placed.push({
          x: column * unit.width + point.x + jitterX,
          y: row * unit.height + point.y + jitterY,
          rotation: pattern.rotation + turn,
          scale: 1 - distance * 0.5,
          alpha: 1 - distance * 0.6,
          secondary: isSecondary,
        });
      });
    }
  }
  return placed;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ DESSIN
   ═══════════════════════════════════════════════════════════════════════════ */

/** Longueurs et angles : deux décimales suffisent. */
const n = (value: number): string => String(Math.round(value * 100) / 100);

/**
 * Opacités : trois décimales. L'encre d'origine du site vaut 0,105 ; arrondie à
 * deux décimales, elle deviendrait 0,11 et le fond par défaut ne serait plus
 * tout à fait celui du site.
 */
const alphaOf = (value: number): string => String(Math.round(value * 1000) / 1000);

/**
 * Cale un centre de motif pour que ses bords tombent sur des pixels entiers.
 * Un carré de 2 px centré sur 20,5 serait peint à cheval sur trois pixels,
 * donc flou ; centré sur 20, il est net.
 */
const snap = (center: number, size: number): number => Math.round(center - size / 2) + size / 2;

/**
 * Copies d'un motif de l'autre côté de la tuile, s'il en dépasse.
 * Un motif coupé par le bord gauche doit réapparaître au bord droit : sans cette
 * copie, la répétition de la tuile montrerait des moitiés de motifs.
 */
function wrapOffsets(x: number, y: number, reach: number, size: TileSize): { dx: number; dy: number }[] {
  const horizontal = [0, ...(x - reach < 0 ? [size.width] : []), ...(x + reach > size.width ? [-size.width] : [])];
  const vertical = [0, ...(y - reach < 0 ? [size.height] : []), ...(y + reach > size.height ? [-size.height] : [])];
  return horizontal.flatMap((dx) => vertical.map((dy) => ({ dx, dy })));
}

/** Balisage SVG complet de la tuile. */
function tileMarkup(config: VisualConfig, paint: TilePaint): string {
  const size = tileSize(config);
  const { pattern } = config;
  const haloRadius = paint.haloRadius ?? 0;
  const hasHalo = haloRadius > 0 && (paint.haloOpacity ?? 0) > 0;
  const motifs = placeMotifs(config, paint.secondaryShare ?? 0);
  const usesSecondary = Boolean(paint.secondary) && motifs.some((motif) => motif.secondary);

  const halo = (id: string, color: string) =>
    `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${alphaOf(paint.haloOpacity ?? 0)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
  const defs = hasHalo ? `<defs>${halo('a', paint.color)}${usesSecondary ? halo('b', paint.secondary!) : ''}</defs>` : '';

  const halos: string[] = [];
  const shapes: string[] = [];

  for (const motif of motifs) {
    const motifSize = pattern.size * motif.scale;
    const shape = motifShape(pattern.motif, motifSize);
    const color = motif.secondary && paint.secondary ? paint.secondary : paint.color;
    const opacity = alphaOf(paint.opacity * motif.alpha);
    const x = snap(motif.x, motifSize);
    const y = snap(motif.y, motifSize);
    // Portée du motif autour de son centre : son demi-côté s'il est droit, sa
    // demi-diagonale s'il est tourné — ou son halo, quand il en a un.
    const half = motif.rotation % 90 === 0 ? motifSize / 2 : motifSize * 0.75;
    const reach = Math.max(half, hasHalo ? haloRadius * motif.scale : 0);

    for (const { dx, dy } of wrapOffsets(x, y, reach, size)) {
      const at = `translate(${n(x + dx)} ${n(y + dy)})`;
      if (hasHalo) {
        halos.push(`<circle transform="${at}" r="${n(haloRadius * motif.scale)}" fill="url(#${motif.secondary && usesSecondary ? 'b' : 'a'})" opacity="${alphaOf(motif.alpha)}"/>`);
      }
      const turn = motif.rotation % 360 === 0 ? '' : ` rotate(${n(motif.rotation)})`;
      shapes.push(
        shape.stroke === undefined
          ? `<path transform="${at}${turn}" d="${shape.d}" fill="${color}" fill-opacity="${opacity}"/>`
          : `<path transform="${at}${turn}" d="${shape.d}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${n(shape.stroke)}" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    }
  }

  // Les halos d'abord : les motifs sont toujours dessinés par-dessus la lueur.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n(size.width)}" height="${n(size.height)}">${defs}${halos.join('')}${shapes.join('')}</svg>`;
}

/**
 * Transforme un balisage SVG en valeur CSS `url("data:…")`.
 * Seuls les caractères qui casseraient l'URL ou la chaîne CSS sont encodés :
 * c'est plus court, et plus lisible dans les outils du navigateur, qu'un
 * encodage complet ou qu'une base64.
 */
function toCssUrl(svg: string): string {
  const encoded = svg.replace(/"/g, "'").replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E');
  return `url("data:image/svg+xml,${encoded}")`;
}

/** Tuile du fond, prête à servir de `background-image`. */
export function buildTile(config: VisualConfig, paint: TilePaint): string {
  return toCssUrl(tileMarkup(config, paint));
}

/**
 * Masque de scintillement : une case par maille, plus ou moins opaque.
 * Les phases `0` et `1` sont complémentaires — là où l'une montre le motif,
 * l'autre le cache. Animées à contretemps, elles font scintiller le fond sans
 * qu'aucun motif ne soit animé individuellement.
 */
export function buildTwinkleMask(config: VisualConfig, phase: 0 | 1): string {
  const unit = unitOf(config.pattern);
  const size = twinkleSize(config);
  const cells: string[] = [];

  for (let row = 0; row < VARIED_REPEATS; row++) {
    for (let column = 0; column < VARIED_REPEATS; column++) {
      const level = seededRandom(seedOf(column, row, 97))();
      // Élevée au carré : peu de cases très lumineuses, beaucoup de discrètes.
      const alpha = (phase === 0 ? level : 1 - level) ** 2;
      cells.push(`<rect x="${n(column * unit.width)}" y="${n(row * unit.height)}" width="${n(unit.width)}" height="${n(unit.height)}" fill-opacity="${alphaOf(alpha)}"/>`);
    }
  }
  return toCssUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${n(size.width)}" height="${n(size.height)}">${cells.join('')}</svg>`);
}
