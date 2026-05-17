/* ═══════════════════════════════════════════════
   TESTIMONIALS DATA
   ═══════════════════════════════════════════════ */

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Kalvin a transformé notre vision floue en une plateforme digitale d\'exception. Son expertise technique n\'a d\'égal que sa sensibilité produit.',
    author: 'Thomas D.',
    role: 'CEO',
    company: 'TechStart',
  },
  {
    quote: 'Rarement vu un développeur avec un tel sens du détail. Le résultat dépasse nos attentes les plus optimistes, tant en performance qu\'en design.',
    author: 'Sophie M.',
    role: 'Directrice Artistique',
    company: 'Studio Créatif',
  },
  {
    quote: 'Un professionnel rigoureux et créatif. Kalvin a su proposer des solutions architecturales innovantes qui ont considérablement amélioré notre produit.',
    author: 'Marc L.',
    role: 'CTO',
    company: 'DataFlow',
  },
];
