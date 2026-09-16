/**
 * @file styles.ts
 * @description Recettes de classes partagées par toutes les pages.
 *
 * @remarks Ces chaînes étaient définies localement dans chaque fichier ;
 * trois pages de plus les auraient recopiées trois fois. Une seule
 * définition garantit qu'un bouton principal a le même aspect partout.
 * Toutes les valeurs viennent des rôles du système de design
 * (`app/design-system.css`).
 */

/** Conteneur de largeur de contenu, avec la gouttière latérale du site. */
export const CONTAINER = 'mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8';

/** Anneau de focus clavier (le contour global de `globals.css` sert de filet). */
export const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

/** Bouton principal : le bleu du tampon, réservé aux actions. */
export const BUTTON_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-control bg-brand px-5 py-3.5 text-[0.9375rem] font-semibold text-brand-ink shadow-e1 cursor-pointer ' +
  'transition-[transform,box-shadow] duration-(--motion-fast) ease-emphasized hover:-translate-y-0.5 hover:shadow-e2 motion-reduce:transform-none ' +
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-e1 ' +
  FOCUS_RING;

/** Bouton secondaire : contour, même gabarit que le bouton principal. */
export const BUTTON_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-control border border-line-strong px-5 py-3.5 text-[0.9375rem] font-semibold text-ink cursor-pointer ' +
  'transition-colors duration-(--motion-fast) hover:border-ink hover:bg-surface-sunken ' +
  FOCUS_RING;

/** Lien secondaire souligné d'un filet. */
export const LINK_SECONDARY =
  'inline-flex items-center gap-1.5 border-b border-line-strong pb-1 text-[0.9375rem] font-medium text-ink ' +
  'transition-colors duration-(--motion-fast) hover:border-brand-text hover:text-brand-text ' +
  FOCUS_RING;

/** Surtitre : petite capitale espacée, au-dessus d'un titre. */
export const OVERLINE = 'text-overline font-semibold uppercase text-ink-muted';

/** Intitulé de colonne : capitales grasses sur un filet d'encre. */
export const COLUMN_HEADING = 'border-b border-ink pb-3 text-caption font-bold uppercase tracking-[0.1em] text-ink';
