/**
 * @file PageHeader.tsx
 * @description En-tête des pages intérieures (Projets, À propos, Contact) :
 * surtitre, titre de niveau 1, chapeau, et un emplacement libre à droite.
 *
 * @remarks Le haut réserve la hauteur de la barre de navigation fixe (4 rem),
 * comme le hero de l'accueil. Composant sans état : utilisable partout.
 */

import type { ReactNode } from 'react';
import { CONTAINER, OVERLINE } from './styles';

interface PageHeaderProps {
  overline: string;
  title: string;
  lead: string;
  /** Contenu sous le chapeau (boutons, liens). */
  actions?: ReactNode;
  /** Ligne de faits sous les actions (lieu, statut, chiffres). */
  meta?: ReactNode;
  /** Objet affiché à droite sur grand écran (fiche, reçu…). */
  aside?: ReactNode;
  /** Classe posée sur l'en-tête, pour un habillage propre à une page. */
  className?: string;
}

export default function PageHeader({ overline, title, lead, actions, meta, aside, className = '' }: PageHeaderProps) {
  return (
    <header className={`border-b border-line ${className}`.trim()}>
      <div
        className={`${CONTAINER} grid items-center gap-12 pb-16 pt-28 sm:pt-32 ${aside ? 'lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] lg:gap-16' : ''}`}
      >
        <div className="grid gap-6">
          <p className={OVERLINE}>{overline}</p>
          <h1 className="max-w-[20ch] text-title font-bold text-balance text-ink">{title}</h1>
          <p className="max-w-[52ch] text-lead text-pretty text-ink-soft">{lead}</p>
          {actions && <div className="mt-2 flex flex-wrap items-center gap-x-7 gap-y-4">{actions}</div>}
          {meta}
        </div>
        {aside}
      </div>
    </header>
  );
}
