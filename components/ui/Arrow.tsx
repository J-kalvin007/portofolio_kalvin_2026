/**
 * @file Arrow.tsx
 * @description Flèche dessinée au trait, qui remplace les caractères ↓ → ↗.
 *
 * @remarks Poppins, la police unique du site, ne contient pas ces flèches : le
 * navigateur les empruntait à une police système (Arial, Segoe UI Symbol), avec
 * une graisse et une hauteur différentes du texte voisin. Ce SVG prend la
 * couleur (`currentColor`) et la taille (`1em`) du texte qui l'entoure. Il est
 * décoratif (`aria-hidden`) : le libellé du lien porte le sens.
 *
 * Composant sans état ni hook : utilisable côté serveur comme côté client.
 */

/** Tracés dans une grille 16 × 16. */
const PATHS = {
  right: 'M3 8h10M9 4l4 4-4 4',
  down: 'M8 3v10M4 9l4 4 4-4',
  'up-right': 'M4.5 11.5l7-7M5.5 4.5h6v6',
} as const;

export type ArrowDirection = keyof typeof PATHS;

export default function Arrow({ direction = 'right', className = '' }: { direction?: ArrowDirection; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`inline-block shrink-0 align-[-0.125em] ${className}`}
    >
      <path d={PATHS[direction]} />
    </svg>
  );
}
