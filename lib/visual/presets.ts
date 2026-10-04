/**
 * @file lib/visual/presets.ts
 * @description Préréglages de la régie : des configurations complètes, prêtes à
 * essayer puis à retoucher.
 *
 * @architecture
 * Un préréglage ne décrit que **ce qui le distingue** des valeurs par défaut.
 * Il est fusionné avec elles puis validé (`sanitizeVisualConfig`) : un réglage
 * ajouté plus tard au schéma prend donc sa valeur par défaut dans tous les
 * préréglages existants, sans qu'il faille les réécrire.
 *
 * @remarks **Ajouter un préréglage** : une entrée dans `PRESET_SOURCES`.
 */

import { sanitizeVisualConfig, type VisualConfig } from './config';

/** Version partielle de la configuration : chaque section peut être incomplète. */
type VisualConfigPatch = {
  [Key in keyof VisualConfig]?: VisualConfig[Key] extends object ? Partial<VisualConfig[Key]> : VisualConfig[Key];
};

interface PresetSource {
  id: string;
  label: string;
  /** Une phrase : l'intention du préréglage. */
  description: string;
  values: VisualConfigPatch;
}

const PRESET_SOURCES: PresetSource[] = [
  {
    id: 'origine',
    label: 'Origine',
    description: 'Le site tel qu’il était : fond de points, lumières éteintes.',
    values: {},
  },
  {
    id: 'discret',
    label: 'Discret',
    description: 'Un halo court et léger sous le curseur, rien d’autre.',
    values: {
      enabled: true,
      light: { intensity: 0.6, halo: 0.3 },
      cursor: { radius: 150, intensity: 0.6, smoothing: 0.25, trail: 0, falloff: 'soft' },
      buttons: { style: 'halo', intensity: 0.4, spread: 12, linked: false },
    },
  },
  {
    id: 'elegant',
    label: 'Élégant',
    description: 'Halo diffus, légère traîne et reflet qui traverse les boutons.',
    values: {
      enabled: true,
      light: { intensity: 0.85, halo: 0.5 },
      cursor: { radius: 220, intensity: 0.85, smoothing: 0.4, trail: 0.45, falloff: 'soft' },
      ambient: { mode: 'steady', level: 0.12 },
      buttons: { style: 'sheen', intensity: 0.6, duration: 420 },
    },
  },
  {
    id: 'luxe',
    label: 'Luxe',
    description: 'Losanges en quinconce, touches dorées et bordure lumineuse.',
    values: {
      enabled: true,
      pattern: { motif: 'diamond', size: 3, spacing: 44, layout: 'staggered' },
      light: { secondaryShare: 0.25, intensity: 0.95, halo: 0.7 },
      cursor: { radius: 260, intensity: 0.95, smoothing: 0.45, trail: 0.5, falloff: 'soft' },
      ambient: { mode: 'breathe', level: 0.2, duration: 9 },
      buttons: { style: 'border', intensity: 0.8, spread: 20, duration: 520 },
    },
  },
  {
    id: 'interactif',
    label: 'Interactif',
    description: 'Un grand halo réactif ; la lumière suit le curseur jusque dans les boutons.',
    values: {
      enabled: true,
      light: { intensity: 1, halo: 0.6 },
      cursor: { radius: 320, intensity: 1, smoothing: 0.2, trail: 0.7, falloff: 'even' },
      buttons: { style: 'follow', intensity: 0.8, spread: 26 },
      comfort: { touch: true },
    },
  },
  {
    id: 'nuit',
    label: 'Nuit',
    description: 'Étincelles dispersées qui scintillent : pensé pour le thème sombre.',
    values: {
      enabled: true,
      pattern: { motif: 'spark', size: 5, spacing: 46, scatter: 0.45, depth: 0.5 },
      light: { colorDark: '#a9b8ff', intensity: 0.95, halo: 0.8 },
      cursor: { radius: 240, intensity: 0.9, smoothing: 0.4, trail: 0.5, falloff: 'soft' },
      ambient: { mode: 'twinkle', level: 0.35, duration: 8 },
      buttons: { style: 'halo', intensity: 0.7, spread: 22 },
    },
  },
];

export interface VisualPreset {
  id: string;
  label: string;
  description: string;
  config: VisualConfig;
}

/** Préréglages validés, dans l'ordre d'affichage de la régie. */
export const VISUAL_PRESETS: VisualPreset[] = PRESET_SOURCES.map(({ id, label, description, values }) => ({
  id,
  label,
  description,
  config: sanitizeVisualConfig(values),
}));
