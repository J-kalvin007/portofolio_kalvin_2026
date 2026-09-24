/**
 * @file TechIcon.tsx
 * @description Logo d'une technologie, inséré dans le texte.
 *
 * @architecture
 * Composant serveur : le tracé part dans le HTML, il n'y a ni requête d'image,
 * ni JavaScript, ni temps d'attente avant l'affichage. Le logo est peint avec
 * `currentColor` et mesuré en `em` : il suit la couleur et la taille du texte
 * qui l'entoure, dans les deux thèmes.
 *
 * `vertical-align` le pose sur la ligne d'écriture plutôt que sur le bas de la
 * ligne : le logo reste collé au premier mot du nom, même quand celui-ci passe
 * à la ligne (« Django REST Framework »).
 *
 * Les tracés et leur provenance sont dans `tech-icons.ts`. Une technologie
 * sans tracé n'affiche rien — mieux qu'un carré vide ou un logo approximatif.
 */

import { TECH_ICONS } from './tech-icons';

interface TechIconProps {
  /** Nom exact de la technologie, tel qu'il figure dans `lib/data/skills.ts`. */
  name: string;
  className?: string;
}

export default function TechIcon({ name, className = '' }: TechIconProps) {
  const icon = TECH_ICONS[name];
  if (!icon) return null;

  // La règle de remplissage est posée sur chaque tracé, et non sur le `svg` :
  // héritée depuis la racine, elle n'était pas appliquée par le navigateur.
  const shapes = icon.paths.map((d, index) => <path key={index} d={d} fillRule={icon.fillRule} />);

  // Les glyphes en traits (`stroke`) ne dépendent d'aucune règle de remplissage :
  // c'est plus sûr pour un dessin fin affiché à 18 px.
  const painting = icon.stroke
    ? ({ fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const)
    : ({ fill: 'currentColor' } as const);

  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...painting}
      /* Décoratif : le nom de la technologie est juste à côté, en texte. */
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {icon.scale ? <g transform={`scale(${icon.scale})`}>{shapes}</g> : shapes}
    </svg>
  );
}
