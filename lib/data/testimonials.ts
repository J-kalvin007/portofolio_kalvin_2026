/* ═══════════════════════════════════════════════
   TESTIMONIALS — Type
   ═══════════════════════════════════════════════ */

/**
 * @remarks Ce fichier ne contient plus que le type. Le tableau `TESTIMONIALS`
 * n'était importé nulle part : les témoignages affichés proviennent des
 * traductions (`messages/*.json → testimonials.*`). Le type reste la référence
 * partagée par la page « À propos » et le rail `AboutAnimations`.
 */
export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}
