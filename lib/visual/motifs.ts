/**
 * @file lib/visual/motifs.ts
 * @description Registre des motifs du fond : chaque motif est un tracé SVG
 * dessiné dans un carré de côté `size`, centré sur l'origine.
 *
 * @architecture
 * Un motif est une **fonction pure** : une taille en entrée, un tracé en sortie.
 * Il ne connaît ni la couleur, ni la position, ni la rotation — c'est la tuile
 * (`lib/visual/tile.ts`) qui le pose, le tourne et l'encre. Le même tracé sert
 * donc au fond éteint, au fond allumé et aux vignettes de la régie.
 *
 * @remarks **Ajouter un motif** : une entrée dans `MOTIFS`, rien d'autre.
 * Son identifiant rejoint `MotifId`, la validation l'accepte, la tuile sait le
 * dessiner et la régie l'affiche dans son sélecteur.
 *
 * Deux natures de tracé :
 *  - **plein** (`stroke` absent) — carré, losange, étoile… rempli d'encre ;
 *  - **au trait** (`stroke` = épaisseur en pixels) — anneau, croix, chevron…
 *    dessiné d'un filet. L'épaisseur est bornée par le bas : sous un pixel, un
 *    filet disparaît à l'écran.
 */

export interface MotifShape {
  /** Tracé SVG (`d`), dans un repère centré sur le motif. */
  d: string;
  /** Épaisseur du filet, en pixels. Absent : le tracé est rempli. */
  stroke?: number;
}

export interface Motif {
  /** Nom affiché dans la régie. */
  label: string;
  /** Tracé du motif pour un côté de `size` pixels. */
  shape: (size: number) => MotifShape;
}

/** Deux décimales : assez pour un tracé net, peu d'octets dans la tuile. */
const n = (value: number): string => String(Math.round(value * 100) / 100);

/** Polygone régulier ou étoilé : sommets alternant deux rayons, départ en haut. */
function polygon(points: number, outer: number, inner = outer): string {
  const step = Math.PI / points;
  const total = inner === outer ? points : points * 2;
  const angleStep = inner === outer ? step * 2 : step;
  const segments: string[] = [];

  for (let index = 0; index < total; index++) {
    const radius = inner !== outer && index % 2 === 1 ? inner : outer;
    const angle = index * angleStep - Math.PI / 2;
    segments.push(`${index === 0 ? 'M' : 'L'}${n(Math.cos(angle) * radius)} ${n(Math.sin(angle) * radius)}`);
  }
  return `${segments.join('')}z`;
}

/** Cercle de rayon `radius`, en deux arcs. */
const circle = (radius: number): string =>
  `M${n(-radius)} 0a${n(radius)} ${n(radius)} 0 1 0 ${n(radius * 2)} 0a${n(radius)} ${n(radius)} 0 1 0 ${n(-radius * 2)} 0z`;

/** Carré de côté `side`, dont le coin haut-gauche est en (`x`, `y`). */
const square = (x: number, y: number, side: number): string => `M${n(x)} ${n(y)}h${n(side)}v${n(side)}h${n(-side)}z`;

/** Épaisseur d'un filet : une fraction du côté, jamais sous `floor` pixel. */
const line = (size: number, ratio: number, floor = 1): number => Math.max(floor, Math.round(size * ratio * 100) / 100);

export const MOTIFS = {
  /* Le motif d'origine du site : le tampon carré, réduit à un grain. */
  square: {
    label: 'Carré',
    shape: (size) => ({ d: square(-size / 2, -size / 2, size) }),
  },
  dot: {
    label: 'Point',
    shape: (size) => ({ d: circle(size / 2) }),
  },
  ring: {
    label: 'Anneau',
    shape: (size) => {
      const stroke = line(size, 0.16);
      return { d: circle(Math.max(0.5, size / 2 - stroke / 2)), stroke };
    },
  },
  plus: {
    label: 'Croix droite',
    shape: (size) => ({ d: `M${n(-size / 2)} 0H${n(size / 2)}M0 ${n(-size / 2)}V${n(size / 2)}`, stroke: line(size, 0.18) }),
  },
  cross: {
    label: 'Croix oblique',
    shape: (size) => {
      const reach = (size / 2) * 0.82;
      return { d: `M${n(-reach)} ${n(-reach)}L${n(reach)} ${n(reach)}M${n(reach)} ${n(-reach)}L${n(-reach)} ${n(reach)}`, stroke: line(size, 0.18) };
    },
  },
  diamond: {
    label: 'Losange',
    shape: (size) => ({ d: polygon(4, size / 2) }),
  },
  triangle: {
    label: 'Triangle',
    shape: (size) => ({ d: polygon(3, size / 2) }),
  },
  hexagon: {
    label: 'Hexagone',
    shape: (size) => ({ d: polygon(6, size / 2) }),
  },
  star: {
    label: 'Étoile',
    shape: (size) => ({ d: polygon(5, size / 2, (size / 2) * 0.42) }),
  },
  /* Étincelle : quatre branches effilées, tracées par des courbes qui passent
     toutes par le centre. */
  spark: {
    label: 'Étincelle',
    shape: (size) => {
      const reach = n(size / 2);
      return { d: `M0 -${reach}Q0 0 ${reach} 0Q0 0 0 ${reach}Q0 0 -${reach} 0Q0 0 0 -${reach}z` };
    },
  },
  dash: {
    label: 'Tiret',
    shape: (size) => ({ d: `M${n(-size / 2)} 0H${n(size / 2)}`, stroke: line(size, 0.2) }),
  },
  chevron: {
    label: 'Chevron',
    shape: (size) => ({
      d: `M${n(-size / 2)} ${n(size * 0.22)}L0 ${n(-size * 0.22)}L${n(size / 2)} ${n(size * 0.22)}`,
      stroke: line(size, 0.18),
    }),
  },
  /* Les deux motifs propres à l'identité « Reçu » du site. */
  /* Perforation : trois carrés en colonne — le bord d'un ticket, celui du
     logotype. */
  perforation: {
    label: 'Perforation',
    shape: (size) => {
      const side = size * 0.24;
      const pitch = side + size * 0.14;
      return { d: [0, 1, 2].map((row) => square(-side / 2, -size / 2 + row * pitch, side)).join('') };
    },
  },
  /* Tampon : deux cadres emboîtés, comme le filet double des tampons du site. */
  stamp: {
    label: 'Tampon',
    shape: (size) => {
      const stroke = line(size, 0.09, 0.75);
      const outer = size - stroke;
      const inner = size * 0.46;
      return { d: square(-outer / 2, -outer / 2, outer) + square(-inner / 2, -inner / 2, inner), stroke };
    },
  },
} as const satisfies Record<string, Motif>;

export type MotifId = keyof typeof MOTIFS;

/** Identifiants des motifs, dans l'ordre du sélecteur de la régie. */
export const MOTIF_IDS = Object.keys(MOTIFS) as MotifId[];

/** Tracé d'un motif. */
export const motifShape = (id: MotifId, size: number): MotifShape => MOTIFS[id].shape(size);
