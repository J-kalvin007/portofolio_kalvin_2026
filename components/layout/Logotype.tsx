/**
 * @file Logotype.tsx
 * @description Logotype du site : perforation de reçu + nom sur deux lignes.
 *
 * @architecture
 * Composant serveur, sans image ni police supplémentaire : du texte réel, donc
 * net à toutes les tailles, sélectionnable, traduisible et indexable. Seule la
 * perforation est décorative (un dégradé répété, aucun élément en plus).
 *
 * @design
 * L'ancien logotype — « K·Takoudjou » en capitales, avec un point coloré —
 * n'avait aucun lien avec l'identité du site et se retrouve à l'identique sur
 * des milliers de portfolios. Celui-ci reprend le seul motif propre à la
 * direction « Reçu » : le **bord perforé d'un ticket**, rendu par une colonne
 * de carrés bleus, contre laquelle le nom est aligné.
 *
 * La hiérarchie est celle d'un en-tête de journal (« masthead ») : le prénom en
 * petites capitales très espacées, posé au-dessus du nom de famille en gras
 * serré. C'est le nom qu'on retient, pas l'initiale.
 *
 * Deux tailles : `bar` pour la barre de navigation (hauteur 4 rem), `footer`
 * pour le pied de page, où le logotype peut respirer.
 */

import './logotype.css';

interface LogotypeProps {
  /** `bar` : barre de navigation. `footer` : pied de page, plus grand. */
  size?: 'bar' | 'footer';
  className?: string;
}

export default function Logotype({ size = 'bar', className = '' }: LogotypeProps) {
  return (
    <span className={`lg ${size === 'footer' ? 'lg--footer' : ''} ${className}`}>
      {/* Bord perforé du ticket : purement décoratif. */}
      <span className="lg-perf" aria-hidden="true" />
      <span className="lg-name">
        <span className="lg-first">Kalvin</span>
        <span className="lg-last">Takoudjou</span>
      </span>
    </span>
  );
}
