/**
 * @file SectionHead.tsx
 * @description En-tête de section : surtitre, titre de niveau 2, chapeau facultatif.
 *
 * Composant sans état ni hook : utilisable côté serveur comme côté client.
 * L'`id` du titre sert d'étiquette à la section (`aria-labelledby`).
 */

import { OVERLINE } from './styles';

interface SectionHeadProps {
  id: string;
  overline: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SectionHead({ id, overline, title, description, className = '' }: SectionHeadProps) {
  return (
    <header className={`mb-block grid max-w-reading gap-3 ${className}`}>
      <p className={OVERLINE}>{overline}</p>
      <h2 id={id} className="text-heading font-bold text-balance text-ink">{title}</h2>
      {description && <p className="text-lead text-pretty text-ink-soft">{description}</p>}
    </header>
  );
}
