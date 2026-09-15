/* ═══════════════════════════════════════════════
   EXPERIENCE & EDUCATION — Types
   ═══════════════════════════════════════════════ */

/**
 * @remarks Ce fichier ne contient plus que le type. Les tableaux `EXPERIENCE`
 * et `EDUCATION` qui s'y trouvaient n'étaient lus par aucun composant : la page
 * « À propos » construit la frise depuis les traductions (`messages/*.json →
 * experience.*`), seule source affichée. Garder une seconde copie en français
 * dans le code, c'était garantir qu'elle diverge un jour de la version affichée.
 */
export interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  description: string;
  tags?: string[];
  location: string;
  type: 'work' | 'education';
}
