/**
 * @file TechIconSprite.tsx
 * @description Réserve de logos : chaque tracé n'apparaît **qu'une fois** dans
 * la page, et chaque usage n'en porte qu'une référence.
 *
 * @architecture
 * Un logo de marque est un long tracé (jusqu'à 5 Ko pour PostgreSQL ou Linux).
 * Inséré tel quel à chaque apparition, il coûtait cher : sur la page Projets,
 * les logos reviennent une centaine de fois — cartes puis fiches — ce qui
 * pesait près de 40 Ko compressés, comptés deux fois (le HTML et les données
 * de rendu de React contiennent le même arbre).
 *
 * Ici, les tracés sont déclarés une seule fois dans des `<symbol>`, et
 * `TechIcon` se contente d'un `<use href="#…">` de quelques octets. Le procédé
 * est la « feuille de sprites » SVG, en version interne au document : aucune
 * requête supplémentaire, aucune dépendance au support des références
 * externes.
 *
 * La réserve doit être rendue **une fois par page**, avant les usages.
 * Elle n'affiche rien par elle-même : un `<symbol>` n'est jamais peint
 * directement.
 */

import { TECH_ICONS } from './tech-icons';
import { techSymbolId } from './techSymbolId';

interface TechIconSpriteProps {
  /**
   * Technologies à embarquer. Par défaut, toutes celles du catalogue : sur une
   * page qui les montre presque toutes, trier coûterait plus que cela ne
   * rapporte.
   */
  names?: string[];
}

export default function TechIconSprite({ names }: TechIconSpriteProps) {
  // Doublons écartés, et noms inconnus ignorés : la réserve suit les usages.
  const used = [...new Set(names ?? Object.keys(TECH_ICONS))].filter((name) => name in TECH_ICONS);

  return (
    <svg aria-hidden="true" focusable="false" style={{ display: 'none' }}>
      {used.map((name) => {
        const icon = TECH_ICONS[name];
        const shapes = icon.paths.map((d, index) => <path key={index} d={d} />);

        return (
          <symbol
            key={name}
            id={techSymbolId(name)}
            viewBox="0 0 24 24"
            /* Le mode de peinture appartient au symbole : un glyphe en traits
               (PayDunya) et un logo plein ne se peignent pas de la même façon,
               et l'héritage depuis l'élément qui les appelle ne suffirait pas. */
            {...(icon.stroke
              ? { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
              : { fill: 'currentColor', fillRule: icon.fillRule })}
          >
            {icon.transform ? <g transform={icon.transform}>{shapes}</g> : shapes}
          </symbol>
        );
      })}
    </svg>
  );
}
