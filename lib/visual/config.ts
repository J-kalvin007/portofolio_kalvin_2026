/**
 * @file lib/visual/config.ts
 * @description Configuration du moteur visuel : le motif du fond, les lumières,
 * le halo du curseur, l'ambiance et l'éclairage des boutons.
 *
 * @architecture **Source de vérité unique.** Tout ce qui se règle depuis la
 * régie (`app/regie`) est décrit ici, et nulle part ailleurs :
 *
 * ```
 *   VisualConfig (ce fichier)
 *        │  sanitizeVisualConfig() — toute valeur entrante passe par là
 *        ▼
 *   lib/visual/tile.ts      motif → tuile SVG du fond (éteinte, allumée)
 *   lib/visual/css.ts       configuration → variables CSS et attributs
 *        ▼
 *   components/visual/      LightField (halo du curseur), visual.css (boutons)
 * ```
 *
 * Ce fichier ne dépend ni de React ni de Next.js : il est importé à
 * l'identique par le serveur (layout, routes d'API) et par le navigateur
 * (régie, lumières). Une même configuration produit donc le même rendu des
 * deux côtés — c'est ce qui évite tout écart d'hydratation.
 *
 * @remarks **Ajouter un réglage** tient en trois gestes :
 *  1. déclarer le champ dans `VisualConfig` ;
 *  2. lui donner un descripteur dans `VISUAL_FIELDS` — TypeScript refuse de
 *     compiler tant qu'il manque, et c'est lui qui fournit la valeur par
 *     défaut, les bornes et le libellé de la régie ;
 *  3. le lire là où il agit (`tile.ts`, `css.ts` ou `LightField.tsx`).
 * La validation, la valeur par défaut, l'import, l'export et le contrôle de la
 * régie en découlent sans une ligne de plus.
 */

import { MOTIF_IDS, type MotifId } from './motifs';

/** Version du schéma, enregistrée avec la configuration publiée. */
export const VISUAL_CONFIG_VERSION = 1;

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ FORME DE LA CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

export type PatternLayout = 'grid' | 'staggered';
export type PatternTint = 'ink' | 'light';
export type CursorFalloff = 'soft' | 'even' | 'sharp';
export type AmbientMode = 'off' | 'steady' | 'breathe' | 'twinkle';
export type ButtonGlowStyle = 'halo' | 'border' | 'sheen' | 'follow';

export interface VisualConfig {
  /**
   * Interrupteur général des lumières. Éteint, le site garde le fond d'origine :
   * aucun halo, aucune ambiance, aucun écouteur, aucun calcul.
   */
  enabled: boolean;

  /** Le motif répété sur le fond des pages. */
  pattern: {
    motif: MotifId;
    /** Côté du motif, en pixels. */
    size: number;
    /** Distance entre deux motifs voisins, en pixels. */
    spacing: number;
    /** Rotation de chaque motif, en degrés. */
    rotation: number;
    /** Présence du motif éteint : 1 = l'encre d'origine du site. */
    strength: number;
    /** Grille droite, ou quinconce (une ligne sur deux décalée). */
    layout: PatternLayout;
    /** Dispersion : 0 = positions exactes, 1 = semis irrégulier. */
    scatter: number;
    /** Profondeur : 0 = motifs identiques, 1 = tailles et encres variées. */
    depth: number;
    /** Encre du motif éteint : celle du thème, ou la couleur des lumières. */
    tint: PatternTint;
  };

  /** La lumière elle-même : sa couleur et sa force. */
  light: {
    /** Couleur des lumières sur le thème clair. */
    color: string;
    /** Couleur des lumières sur le thème sombre. */
    colorDark: string;
    /** Seconde couleur, portée par une partie des motifs. */
    secondary: string;
    /** Part des motifs allumés dans la seconde couleur (0 = aucun). */
    secondaryShare: number;
    /** Éclat d'un motif allumé. */
    intensity: number;
    /** Taille du halo diffus autour de chaque motif (0 = motif nu). */
    halo: number;
  };

  /** Le halo qui suit le curseur de la souris. */
  cursor: {
    enabled: boolean;
    /** Rayon du halo, en pixels. */
    radius: number;
    /** Force du halo au centre. */
    intensity: number;
    /** Inertie : 0 = collé au curseur, 1 = suit avec retard. */
    smoothing: number;
    /** Traîne : lumière résiduelle laissée derrière le curseur. */
    trail: number;
    /** Profil d'atténuation du centre vers le bord. */
    falloff: CursorFalloff;
  };

  /** Lumière d'ambiance, indépendante du curseur. */
  ambient: {
    mode: AmbientMode;
    /** Niveau d'éclairage des motifs. */
    level: number;
    /** Durée d'un cycle, en secondes (respiration, scintillement). */
    duration: number;
  };

  /** Éclairage des boutons au survol et à la prise de focus. */
  buttons: {
    enabled: boolean;
    style: ButtonGlowStyle;
    intensity: number;
    /** Portée de la lueur autour du bouton, en pixels. */
    spread: number;
    /** Durée de l'allumage, en millisecondes. */
    duration: number;
    /** Allume aussi les motifs du fond autour du bouton survolé. */
    linked: boolean;
  };

  /** Confort : ce que le moteur s'autorise sur les petits écrans tactiles. */
  comfort: {
    /** Éclaire les motifs sous le doigt, sur écran tactile. */
    touch: boolean;
    /** Garde les ambiances animées sur téléphone (sinon : lumière fixe). */
    mobileAmbient: boolean;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ DESCRIPTEURS DE CHAMPS
   ───────────────────────────────────────────────────────────────────────────
   Un descripteur dit tout d'un réglage : sa nature, sa valeur par défaut, ses
   bornes, et ce que la régie affiche. La validation et l'interface le lisent
   toutes deux — elles ne peuvent donc pas diverger.
   ═══════════════════════════════════════════════════════════════════════════ */

interface FieldText {
  /** Libellé du contrôle, dans la régie. */
  label: string;
  /** Une phrase : ce que le réglage change à l'écran. */
  hint?: string;
}

export interface NumberField extends FieldText {
  kind: 'number';
  default: number;
  min: number;
  max: number;
  step: number;
  /** Unité affichée après la valeur (« px », « s », « ° »…). */
  unit?: string;
  /** Affiche la valeur en pourcentage (0,35 → 35 %). */
  percent?: boolean;
}

export interface BooleanField extends FieldText {
  kind: 'boolean';
  default: boolean;
}

export interface ChoiceField extends FieldText {
  kind: 'choice';
  default: string;
  /** Valeurs admises, avec leur libellé. */
  options: readonly { value: string; label: string }[];
}

export interface ColorField extends FieldText {
  kind: 'color';
  /** Couleur hexadécimale à six chiffres, en minuscules (`#1f3bcc`). */
  default: string;
}

/** Le motif a son propre sélecteur dans la régie : il se choisit à l'œil. */
export interface MotifField extends FieldText {
  kind: 'motif';
  default: MotifId;
}

export type VisualField = NumberField | BooleanField | ChoiceField | ColorField | MotifField;

/** Sections de la configuration (tout sauf l'interrupteur général). */
export type VisualSection = Exclude<keyof VisualConfig, 'enabled'>;

/**
 * Chemin d'un réglage : `enabled`, ou `section.champ`.
 * Dérivé de `VisualConfig` : un champ ajouté à l'interface apparaît ici, et
 * `VISUAL_FIELDS` ne compile plus tant qu'il n'a pas son descripteur.
 */
export type VisualFieldPath =
  | 'enabled'
  | { [Section in VisualSection]: `${Section}.${keyof VisualConfig[Section] & string}` }[VisualSection];

export const VISUAL_FIELDS = {
  enabled: {
    kind: 'boolean',
    default: false,
    label: 'Lumières du site',
    hint: 'Éteint, le site garde son fond d’origine : aucun halo, aucune animation, aucun calcul.',
  },

  /* ── Motif ──────────────────────────────────────────────────────────────── */
  'pattern.motif': {
    kind: 'motif',
    default: 'square',
    label: 'Motif',
    hint: 'La forme répétée sur le fond des pages.',
  },
  'pattern.size': {
    kind: 'number',
    default: 2,
    min: 1,
    max: 14,
    step: 0.5,
    unit: 'px',
    label: 'Taille',
    hint: 'Côté du motif. Le fond d’origine utilise un carré de 2 px.',
  },
  'pattern.spacing': {
    kind: 'number',
    default: 40,
    min: 16,
    max: 96,
    step: 2,
    unit: 'px',
    label: 'Espacement',
    hint: 'Distance entre deux motifs. Plus elle est courte, plus le fond est dense.',
  },
  'pattern.rotation': {
    kind: 'number',
    default: 0,
    min: 0,
    max: 180,
    step: 5,
    unit: '°',
    label: 'Rotation',
  },
  'pattern.strength': {
    kind: 'number',
    default: 1,
    min: 0,
    max: 3,
    step: 0.05,
    percent: true,
    label: 'Présence',
    hint: '100 % correspond à l’encre d’origine. À 0 %, le motif éteint disparaît.',
  },
  'pattern.layout': {
    kind: 'choice',
    default: 'grid',
    options: [
      { value: 'grid', label: 'Grille' },
      { value: 'staggered', label: 'Quinconce' },
    ],
    label: 'Disposition',
  },
  'pattern.scatter': {
    kind: 'number',
    default: 0,
    min: 0,
    max: 1,
    step: 0.05,
    percent: true,
    label: 'Dispersion',
    hint: 'Écarte chaque motif de sa place, toujours de la même façon d’une visite à l’autre.',
  },
  'pattern.depth': {
    kind: 'number',
    default: 0,
    min: 0,
    max: 1,
    step: 0.05,
    percent: true,
    label: 'Profondeur',
    hint: 'Fait varier la taille et l’encre des motifs, comme s’ils étaient à des distances différentes.',
  },
  'pattern.tint': {
    kind: 'choice',
    default: 'ink',
    options: [
      { value: 'ink', label: 'Encre du thème' },
      { value: 'light', label: 'Couleur des lumières' },
    ],
    label: 'Encre du motif éteint',
  },

  /* ── Lumière ────────────────────────────────────────────────────────────── */
  'light.color': {
    kind: 'color',
    default: '#1f3bcc',
    label: 'Couleur — thème clair',
    hint: 'Par défaut : le bleu du tampon.',
  },
  'light.colorDark': {
    kind: 'color',
    default: '#8398ff',
    label: 'Couleur — thème sombre',
    hint: 'Une teinte plus claire reste lisible sur fond sombre.',
  },
  'light.secondary': {
    kind: 'color',
    default: '#f0d861',
    label: 'Seconde couleur',
    hint: 'Par défaut : le jaune de la souche des billets.',
  },
  'light.secondaryShare': {
    kind: 'number',
    default: 0,
    min: 0,
    max: 0.6,
    step: 0.05,
    percent: true,
    label: 'Part de la seconde couleur',
    hint: 'Proportion de motifs qui s’allument dans la seconde couleur.',
  },
  'light.intensity': {
    kind: 'number',
    default: 0.85,
    min: 0.1,
    max: 1,
    step: 0.05,
    percent: true,
    label: 'Éclat',
  },
  'light.halo': {
    kind: 'number',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.05,
    percent: true,
    label: 'Halo',
    hint: 'Lueur diffuse autour de chaque motif allumé. À 0 %, seul le motif change de couleur.',
  },

  /* ── Curseur ────────────────────────────────────────────────────────────── */
  'cursor.enabled': {
    kind: 'boolean',
    default: true,
    label: 'Halo du curseur',
    hint: 'Les motifs proches de la souris s’allument. Sans effet sur écran tactile.',
  },
  'cursor.radius': {
    kind: 'number',
    default: 220,
    min: 80,
    max: 420,
    step: 10,
    unit: 'px',
    label: 'Rayon',
  },
  'cursor.intensity': {
    kind: 'number',
    default: 0.9,
    min: 0.1,
    max: 1,
    step: 0.05,
    percent: true,
    label: 'Force',
  },
  'cursor.smoothing': {
    kind: 'number',
    default: 0.35,
    min: 0,
    max: 1,
    step: 0.05,
    percent: true,
    label: 'Inertie',
    hint: 'À 0 %, le halo colle au curseur. Plus haut, il le suit avec un léger retard.',
  },
  'cursor.trail': {
    kind: 'number',
    default: 0.4,
    min: 0,
    max: 1,
    step: 0.05,
    percent: true,
    label: 'Traîne',
    hint: 'Lumière résiduelle derrière le curseur : les motifs s’éteignent progressivement.',
  },
  'cursor.falloff': {
    kind: 'choice',
    default: 'soft',
    options: [
      { value: 'soft', label: 'Diffus' },
      { value: 'even', label: 'Régulier' },
      { value: 'sharp', label: 'Net' },
    ],
    label: 'Atténuation',
  },

  /* ── Ambiance ───────────────────────────────────────────────────────────── */
  'ambient.mode': {
    kind: 'choice',
    default: 'off',
    options: [
      { value: 'off', label: 'Éteinte' },
      { value: 'steady', label: 'Fixe' },
      { value: 'breathe', label: 'Respiration' },
      { value: 'twinkle', label: 'Scintillement' },
    ],
    label: 'Ambiance',
    hint: 'Éclaire tous les motifs, sans attendre le curseur.',
  },
  'ambient.level': {
    kind: 'number',
    default: 0.25,
    min: 0.05,
    max: 1,
    step: 0.05,
    percent: true,
    label: 'Niveau',
  },
  'ambient.duration': {
    kind: 'number',
    default: 7,
    min: 2,
    max: 20,
    step: 0.5,
    unit: 's',
    label: 'Durée d’un cycle',
  },

  /* ── Boutons ────────────────────────────────────────────────────────────── */
  'buttons.enabled': {
    kind: 'boolean',
    default: true,
    label: 'Éclairage des boutons',
    hint: 'Au survol et à la prise de focus clavier.',
  },
  'buttons.style': {
    kind: 'choice',
    default: 'halo',
    options: [
      { value: 'halo', label: 'Halo' },
      { value: 'border', label: 'Bordure' },
      { value: 'sheen', label: 'Reflet' },
      { value: 'follow', label: 'Suivi du curseur' },
    ],
    label: 'Effet',
  },
  'buttons.intensity': {
    kind: 'number',
    default: 0.6,
    min: 0.1,
    max: 1,
    step: 0.05,
    percent: true,
    label: 'Force',
  },
  'buttons.spread': {
    kind: 'number',
    default: 18,
    min: 4,
    max: 40,
    step: 1,
    unit: 'px',
    label: 'Portée',
  },
  'buttons.duration': {
    kind: 'number',
    default: 320,
    min: 120,
    max: 900,
    step: 20,
    unit: 'ms',
    label: 'Durée de l’allumage',
  },
  'buttons.linked': {
    kind: 'boolean',
    default: true,
    label: 'Allumer aussi le fond',
    hint: 'Les motifs situés autour du bouton survolé s’allument avec lui.',
  },

  /* ── Confort ────────────────────────────────────────────────────────────── */
  'comfort.touch': {
    kind: 'boolean',
    default: false,
    label: 'Lumière au toucher',
    hint: 'Sur écran tactile, les motifs s’allument un instant sous le doigt.',
  },
  'comfort.mobileAmbient': {
    kind: 'boolean',
    default: false,
    label: 'Ambiance animée sur téléphone',
    hint: 'Désactivée, l’ambiance reste fixe sur les petits écrans : la batterie est épargnée.',
  },
} as const satisfies Record<VisualFieldPath, VisualField>;

/** Tous les chemins de réglage, dans l'ordre de déclaration. */
export const VISUAL_FIELD_PATHS = Object.keys(VISUAL_FIELDS) as VisualFieldPath[];

/** Descripteur d'un réglage, typé largement (les valeurs littérales sont oubliées). */
export const fieldOf = (path: VisualFieldPath): VisualField => VISUAL_FIELDS[path];

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ LECTURE ET ÉCRITURE PAR CHEMIN
   ═══════════════════════════════════════════════════════════════════════════ */

export type VisualValue = boolean | number | string;

const splitPath = (path: VisualFieldPath): [string, string | undefined] => {
  const [head, tail] = path.split('.');
  return [head, tail];
};

/** Valeur d'un réglage dans une configuration. */
export function readField(config: VisualConfig, path: VisualFieldPath): VisualValue {
  const [head, tail] = splitPath(path);
  const root = config as unknown as Record<string, unknown>;
  const value = tail === undefined ? root[head] : (root[head] as Record<string, unknown>)[tail];
  return value as VisualValue;
}

/** Nouvelle configuration, identique à `config` sauf pour un réglage. */
export function writeField(config: VisualConfig, path: VisualFieldPath, value: VisualValue): VisualConfig {
  const [head, tail] = splitPath(path);
  const root = config as unknown as Record<string, unknown>;
  const next = tail === undefined ? { ...root, [head]: value } : { ...root, [head]: { ...(root[head] as object), [tail]: value } };
  // Repasse par la validation : une valeur hors bornes ne survit jamais.
  return sanitizeVisualConfig(next);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ VALIDATION
   ───────────────────────────────────────────────────────────────────────────
   `sanitizeVisualConfig` accepte n'importe quoi — un fichier importé, le corps
   d'une requête, une valeur relue du stockage — et rend toujours une
   configuration complète et bornée. Un champ absent, d'un mauvais type ou hors
   limites reprend sa valeur par défaut ; un nombre hors bornes est ramené dans
   l'intervalle. Une configuration corrompue ne peut donc pas casser le site.
   ═══════════════════════════════════════════════════════════════════════════ */

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Ramène un nombre dans ses bornes et sur son pas. */
function clampNumber(value: number, field: NumberField): number {
  const bounded = Math.min(field.max, Math.max(field.min, value));
  const stepped = Math.round((bounded - field.min) / field.step) * field.step + field.min;
  // Les pas décimaux (0,05) accumulent des erreurs binaires : 0,30000000000000004.
  return Number(Math.min(field.max, stepped).toFixed(4));
}

function sanitizeValue(raw: unknown, field: VisualField): VisualValue {
  switch (field.kind) {
    case 'boolean':
      return typeof raw === 'boolean' ? raw : field.default;
    case 'number':
      return typeof raw === 'number' && Number.isFinite(raw) ? clampNumber(raw, field) : field.default;
    case 'choice':
      return typeof raw === 'string' && field.options.some((option) => option.value === raw) ? raw : field.default;
    case 'color':
      return typeof raw === 'string' && HEX_COLOR.test(raw) ? raw.toLowerCase() : field.default;
    case 'motif':
      return typeof raw === 'string' && (MOTIF_IDS as readonly string[]).includes(raw) ? raw : field.default;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

export function sanitizeVisualConfig(input: unknown): VisualConfig {
  const source = isRecord(input) ? input : {};
  const result: Record<string, unknown> = {};

  for (const path of VISUAL_FIELD_PATHS) {
    const [head, tail] = splitPath(path);
    const field = fieldOf(path);

    if (tail === undefined) {
      result[head] = sanitizeValue(source[head], field);
      continue;
    }

    const section = isRecord(source[head]) ? (source[head] as Record<string, unknown>) : {};
    const target = (result[head] ??= {}) as Record<string, unknown>;
    target[tail] = sanitizeValue(section[tail], field);
  }

  /* Chaque chemin de `VISUAL_FIELDS` a reçu une valeur valide, et ces chemins
     couvrent exactement `VisualConfig` (garanti par `satisfies`, plus haut) :
     l'objet construit a donc bien cette forme. */
  return result as unknown as VisualConfig;
}

/** Configuration par défaut : lumières éteintes, fond d'origine du site. */
export const DEFAULT_VISUAL_CONFIG: VisualConfig = sanitizeVisualConfig({});

/** `true` si deux configurations décrivent le même rendu. */
export function sameVisualConfig(a: VisualConfig, b: VisualConfig): boolean {
  return VISUAL_FIELD_PATHS.every((path) => readField(a, path) === readField(b, path));
}

/** `true` si le motif est celui d'origine : le fond du site n'a pas à être remplacé. */
export function isDefaultPattern(config: VisualConfig): boolean {
  return VISUAL_FIELD_PATHS.filter((path) => path.startsWith('pattern.')).every(
    (path) => readField(config, path) === readField(DEFAULT_VISUAL_CONFIG, path),
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ ENVELOPPE D'ENREGISTREMENT
   La configuration voyage (stockage, export) accompagnée de la version du
   schéma et de sa date : une future version saura d'où elle part.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface VisualConfigEnvelope {
  version: number;
  /** Date d'enregistrement, ISO 8601. */
  savedAt: string;
  config: VisualConfig;
}

export function wrapVisualConfig(config: VisualConfig): VisualConfigEnvelope {
  return { version: VISUAL_CONFIG_VERSION, savedAt: new Date().toISOString(), config };
}

/** Accepte une enveloppe (`{ version, config }`) ou une configuration nue. */
export function unwrapVisualConfig(input: unknown): VisualConfig {
  return sanitizeVisualConfig(isRecord(input) && isRecord(input.config) ? input.config : input);
}

/** Taille maximale du corps JSON d'un enregistrement, en octets. */
export const VISUAL_CONFIG_MAX_BYTES = 8 * 1024;
