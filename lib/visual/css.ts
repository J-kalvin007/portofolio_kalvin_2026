/**
 * @file lib/visual/css.ts
 * @description Traduit une configuration en CSS : variables, tuiles du fond et
 * attributs d'état. C'est l'unique passerelle entre les réglages et l'affichage.
 *
 * @architecture
 * Le moteur ne modifie aucune règle de style existante : il **renseigne des
 * variables**, que lisent `components/visual/visual.css` et le fond du site.
 * Deux destinations pour le même résultat :
 *
 *  - **le site public** — `visualStyleSheet()` produit une petite feuille,
 *    injectée dans le `<head>` par le serveur. Le visiteur reçoit donc la bonne
 *    apparence dès le premier affichage, sans attendre un script ;
 *  - **l'aperçu de la régie** — `visualInlineStyle()` rend les mêmes variables
 *    sous forme d'objet `style`, posé sur la zone d'aperçu seulement. Les
 *    réglages en cours d'essai ne débordent pas sur le reste de la page.
 *
 * @remarks **Avec les réglages par défaut, rien n'est émis.** La feuille est
 * vide, aucun attribut n'est posé : le site est rendu exactement comme avant
 * l'existence du moteur.
 */

import { isDefaultPattern, type VisualConfig } from './config';
import { buildTile, buildTwinkleMask, tileSize, twinkleSize } from './tile';

export type VisualTheme = 'light' | 'dark';

/**
 * Encre du motif éteint, par thème. Ce sont les valeurs d'origine de
 * `--ds-grain` (`app/design-system.css`) : à présence 100 %, la tuile
 * fabriquée est celle du site.
 */
const BASE_INK: Record<VisualTheme, { color: string; opacity: number }> = {
  light: { color: '#11161d', opacity: 0.105 },
  dark: { color: '#e7eaed', opacity: 0.07 },
};

/** Profil du halo du curseur : opacité du masque, du centre vers le bord. */
const CURSOR_MASKS: Record<VisualConfig['cursor']['falloff'], string> = {
  soft: 'radial-gradient(closest-side, #000 0%, rgb(0 0 0 / 0.62) 32%, rgb(0 0 0 / 0.2) 68%, transparent 100%)',
  even: 'radial-gradient(closest-side, #000 0%, transparent 100%)',
  sharp: 'radial-gradient(closest-side, #000 0%, #000 58%, transparent 100%)',
};

export interface ResolvedVisual {
  /** Variables identiques dans les deux thèmes. */
  shared: Record<string, string>;
  /** Variables propres à chaque thème : tuiles et couleur des lumières. */
  themed: Record<VisualTheme, Record<string, string>>;
  /** Attributs `data-vx-*` à poser sur la racine (`<html>`, ou la zone d'aperçu). */
  attributes: Record<string, string>;
  /** `true` si la tuile d'origine du site doit être remplacée. */
  overridesPattern: boolean;
  /** `true` si les lumières ont quelque chose à afficher. */
  hasLights: boolean;
}

const lightColorOf = (config: VisualConfig, theme: VisualTheme): string =>
  theme === 'dark' ? config.light.colorDark : config.light.color;

/** Rayon du halo d'un motif : borné par l'espacement, pour que deux halos voisins ne fusionnent pas. */
const haloRadiusOf = (config: VisualConfig): number =>
  config.light.halo * Math.min(config.pattern.spacing * 0.48, config.pattern.size * 4 + 6);

export function resolveVisual(config: VisualConfig): ResolvedVisual {
  /* La tuile d'origine est remplacée dès que le motif change — et aussi dès
     que les lumières sont allumées, même avec le motif d'origine. Raison : le
     fond du site dimensionne sa tuile en `rem` (2,5 rem), les lumières en
     pixels. Chez un visiteur dont le navigateur grossit le texte, 2,5 rem ne
     valent plus 40 px, et les motifs allumés ne tomberaient plus sur les
     motifs éteints. Fabriquées ensemble, les deux tuiles ont toujours les
     mêmes dimensions. Avec le motif d'origine, la tuile fabriquée est
     identique à `--ds-grain` : rien ne change à l'œil. */
  const overridesPattern = config.enabled || !isDefaultPattern(config);
  const hasLights =
    config.enabled &&
    (config.cursor.enabled || config.ambient.mode !== 'off' || (config.buttons.enabled && config.buttons.linked) || config.comfort.touch);

  const tile = tileSize(config);
  const shared: Record<string, string> = {
    '--vx-tile-w': `${tile.width}px`,
    '--vx-tile-h': `${tile.height}px`,
  };

  if (config.enabled) {
    shared['--vx-spot-size'] = `${config.cursor.radius * 2}px`;
    shared['--vx-spot-mask'] = CURSOR_MASKS[config.cursor.falloff];
    shared['--vx-cursor-level'] = String(config.cursor.intensity);
    shared['--vx-trail-level'] = String(Number((config.cursor.intensity * config.cursor.trail * 0.6).toFixed(3)));
    shared['--vx-ambient-level'] = String(config.ambient.level);
    shared['--vx-ambient-duration'] = `${config.ambient.duration}s`;
    shared['--vx-btn-level'] = String(config.buttons.intensity);
    shared['--vx-btn-spread'] = `${config.buttons.spread}px`;
    shared['--vx-btn-duration'] = `${config.buttons.duration}ms`;

    if (config.ambient.mode === 'twinkle') {
      const twinkle = twinkleSize(config);
      shared['--vx-twinkle-w'] = `${twinkle.width}px`;
      shared['--vx-twinkle-h'] = `${twinkle.height}px`;
      shared['--vx-twinkle-a'] = buildTwinkleMask(config, 0);
      shared['--vx-twinkle-b'] = buildTwinkleMask(config, 1);
    }
  }

  const themed = { light: {}, dark: {} } as Record<VisualTheme, Record<string, string>>;
  for (const theme of ['light', 'dark'] as const) {
    const light = lightColorOf(config, theme);

    if (overridesPattern) {
      const ink = BASE_INK[theme];
      // Une encre colorée demande un peu plus d'opacité qu'un gris pour la même présence.
      const tinted = config.pattern.tint === 'light';
      themed[theme]['--ds-grain'] = buildTile(config, {
        color: tinted ? light : ink.color,
        opacity: Math.min(1, ink.opacity * (tinted ? 2 : 1) * config.pattern.strength),
      });
    }

    if (config.enabled) {
      themed[theme]['--vx-light'] = light;
      if (hasLights) {
        themed[theme]['--vx-lit'] = buildTile(config, {
          color: light,
          opacity: config.light.intensity,
          secondary: config.light.secondary,
          secondaryShare: config.light.secondaryShare,
          haloRadius: haloRadiusOf(config),
          haloOpacity: 0.55 * config.light.intensity,
        });
      }
    }
  }

  const attributes: Record<string, string> = {};
  if (config.enabled) {
    attributes['data-vx'] = 'on';
    if (config.ambient.mode !== 'off') attributes['data-vx-ambient'] = config.ambient.mode;
    if (config.buttons.enabled) attributes['data-vx-buttons'] = config.buttons.style;
    if (!config.comfort.mobileAmbient) attributes['data-vx-calm'] = '';
  }

  return { shared, themed, attributes, overridesPattern, hasLights };
}

const declarations = (variables: Record<string, string>): string =>
  Object.entries(variables)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');

/**
 * Feuille de style du site public, ou chaîne vide s'il n'y a rien à changer.
 *
 * Les sélecteurs sont préfixés par `html` : ils l'emportent ainsi sur `:root`
 * et `.dark` de `design-system.css` quel que soit l'ordre de chargement des
 * feuilles, sans recourir à `!important`.
 */
export function visualStyleSheet(config: VisualConfig): string {
  const resolved = resolveVisual(config);
  if (!config.enabled && !resolved.overridesPattern) return '';

  const rules = [
    `html:root{${declarations({ ...resolved.shared, ...resolved.themed.light })}}`,
    `html.dark{${declarations(resolved.themed.dark)}}`,
  ];
  if (resolved.overridesPattern) {
    // `body` et la fiche projet peignent `--ds-grain` avec une taille de tuile
    // fixe (2,5 rem) : seule cette taille doit suivre la nouvelle tuile.
    rules.push('html body,html .pj-stage{background-size:var(--vx-tile-w) var(--vx-tile-h)}');
  }
  return rules.join('');
}

/** Les mêmes variables, pour un seul thème, sous forme d'objet `style`. */
export function visualInlineStyle(config: VisualConfig, theme: VisualTheme): Record<string, string> {
  const resolved = resolveVisual(config);
  return { ...resolved.shared, ...resolved.themed[theme] };
}

/** Attributs `data-vx-*` de la racine. */
export function visualAttributes(config: VisualConfig): Record<string, string> {
  return resolveVisual(config).attributes;
}

/** Ce que les lumières doivent savoir, et rien de plus : envoyé au navigateur. */
export interface LightFieldSettings {
  tileWidth: number;
  tileHeight: number;
  cursor: boolean;
  radius: number;
  smoothing: number;
  trail: boolean;
  /** Allume les motifs autour du bouton survolé. */
  linked: boolean;
  /** Portée de cette lueur autour du bouton, en pixels. */
  linkedSpread: number;
  /** Le bouton survolé reçoit la position du curseur (effet « suivi »). */
  follow: boolean;
  touch: boolean;
}

/** Réglages des lumières, ou `null` s'il n'y a rien à afficher. */
export function lightFieldSettings(config: VisualConfig): LightFieldSettings | null {
  const resolved = resolveVisual(config);
  const follow = config.enabled && config.buttons.enabled && config.buttons.style === 'follow';
  if (!resolved.hasLights && !follow) return null;

  const tile = tileSize(config);
  return {
    tileWidth: tile.width,
    tileHeight: tile.height,
    cursor: config.cursor.enabled,
    radius: config.cursor.radius,
    smoothing: config.cursor.smoothing,
    trail: config.cursor.trail > 0,
    linked: config.buttons.enabled && config.buttons.linked,
    linkedSpread: config.buttons.spread * 2.5 + 24,
    follow,
    touch: config.comfort.touch,
  };
}
