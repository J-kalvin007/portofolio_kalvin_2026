/**
 * @file TechIcon.tsx
 * @description Logo d'une technologie, inséré dans le texte.
 *
 * @architecture
 * Composant serveur : le logo part dans le HTML, il n'y a ni requête d'image,
 * ni JavaScript, ni temps d'attente avant l'affichage. Il est peint avec
 * `currentColor` et mesuré en `em` : il suit la couleur et la taille du texte
 * qui l'entoure, dans les deux thèmes.
 *
 * Le tracé lui-même n'est pas répété ici : il vit dans la réserve de la page
 * (`TechIconSprite`), et chaque logo n'en porte qu'une référence de quelques
 * octets. Sans cela, la page Projets embarquait une centaine de tracés
 * complets — près de 40 Ko compressés.
 *
 * ⚠️ La réserve doit être rendue une fois dans la page, sinon les logos
 * n'affichent rien : `<use>` ne peut pointer que sur un symbole présent.
 *
 * `vertical-align` (dans les feuilles des pages) pose le logo sur la ligne
 * d'écriture plutôt que sur le bas de la ligne : il reste collé au premier mot
 * du nom, même quand celui-ci passe à la ligne.
 */

import { TECH_ICONS } from './tech-icons';
import { techSymbolId } from './techSymbolId';

interface TechIconProps {
  /** Nom exact de la technologie, tel qu'il figure dans `lib/data/skills.ts`. */
  name: string;
  className?: string;
}

export default function TechIcon({ name, className = '' }: TechIconProps) {
  // Une technologie sans tracé n'affiche rien — mieux qu'un carré vide.
  if (!(name in TECH_ICONS)) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      /* Décoratif : le nom de la technologie est juste à côté, en texte. */
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <use href={`#${techSymbolId(name)}`} />
    </svg>
  );
}
