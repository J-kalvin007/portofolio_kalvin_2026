'use client';

/**
 * @file RainColumn.tsx
 * @description Colonne de « pluie » : une liste qui défile sans fin, vers le
 * haut ou vers le bas. Elle sert deux fois dans la scène d'un projet — la
 * description à gauche, les technologies à droite, en sens contraires.
 *
 * @architecture
 * Le défilement est **entièrement en CSS** : une seule animation par colonne,
 * aucun JavaScript pendant le mouvement. Le navigateur confie la piste au
 * compositeur (`transform` seul, aucune propriété qui provoque un recalcul de
 * mise en page) et le fil principal reste libre.
 *
 * Le raccord invisible tient à une règle simple : **la piste contient deux
 * moitiés identiques**, et l'animation la translate d'exactement 50 % de sa
 * propre hauteur. À la fin du cycle, la seconde moitié occupe la place exacte
 * qu'occupait la première : la boucle est indécelable, et rien n'a eu besoin
 * d'être mesuré.
 *
 * @remarks Trois défauts de la version d'avant la refonte, corrigés ici.
 *
 * **1. La couture.** L'ancienne piste empilait quatre à six copies et
 * translatait de −25 % à −75 %. Ce parcours ne tombe sur un début de copie que
 * si le nombre de copies est pair ; il l'était par accident, et un commentaire
 * du code signalait déjà le saut constaté avec cinq copies. Ici, la structure
 * elle-même garantit le raccord, quel que soit le nombre de copies.
 *
 * **2. La vitesse.** La durée valait `nombre d'éléments × 5 s`, mais le
 * parcours couvrait la moitié de **toute la pile**. Deux projets aux listes de
 * tailles différentes défilaient donc à des vitesses très différentes. Durée et
 * parcours portent désormais sur la même quantité — une moitié — donc la
 * vitesse apparente est la même d'un projet à l'autre.
 *
 * **3. L'illisibilité.** Le texte ne s'arrêtait jamais. La colonne se fige au
 * survol et à la prise de focus clavier (voir `scene.css`), ce qui la rend
 * lisible sans avoir à cliquer.
 *
 * @accessibility La piste est décorative : elle répète un contenu présent en
 * clair dans la fiche (description longue, liste des technologies). Elle est
 * donc masquée aux lecteurs d'écran, qui annonceraient sinon la même phrase
 * une dizaine de fois.
 */

import type { ReactNode } from 'react';

/**
 * Nombre d'éléments visés dans **une moitié** de piste.
 *
 * Une liste courte est répétée davantage : sans cela, un projet à deux
 * technologies laisserait la colonne à moitié vide sur un grand écran. La
 * valeur couvre une colonne de 1 200 px de haut pour des éléments d'environ
 * 100 px.
 */
const ITEMS_PER_HALF = 14;

export interface RainColumnProps {
  /** Éléments de la liste, dans l'ordre d'affichage. */
  items: ReactNode[];
  /** Sens du défilement : `down` fait descendre le contenu. */
  direction: 'up' | 'down';
  /**
   * Temps alloué à un élément, en secondes. Règle la vitesse apparente :
   * un élément d'environ 110 px en 3,4 s donne ~32 px/s, soit un mouvement
   * perceptible mais jamais pressé.
   */
  secondsPerItem: number;
  className?: string;
}

export default function RainColumn({ items, direction, secondsPerItem, className = '' }: RainColumnProps) {
  // Une liste vide n'a pas de piste : mieux vaut aucune colonne qu'une colonne vide.
  if (items.length === 0) return null;

  /* Une moitié = la liste répétée autant de fois qu'il le faut pour remplir la
     colonne. Les deux moitiés sont ensuite empilées à l'identique. */
  const copiesPerHalf = Math.max(2, Math.ceil(ITEMS_PER_HALF / items.length));
  const halfLength = copiesPerHalf * items.length;

  const track = Array.from({ length: 2 * halfLength }, (_, position) => ({
    key: position,
    node: items[position % items.length],
  }));

  return (
    <div className={`pj-rain ${className}`.trim()} aria-hidden="true">
      <ul
        className="pj-rain-track"
        data-direction={direction}
        style={{ '--pj-rain-duration': `${(halfLength * secondsPerItem).toFixed(1)}s` } as React.CSSProperties}
      >
        {track.map(({ key, node }) => (
          <li key={key} className="pj-rain-item">
            {node}
          </li>
        ))}
      </ul>
    </div>
  );
}
