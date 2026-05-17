/* ═══════════════════════════════════════════════
   EXPERIENCE & EDUCATION DATA
   ═══════════════════════════════════════════════ */

export interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  description: string;
  tags?: string[];
  location: string;
  type: 'work' | 'education';
}

export const EXPERIENCE: TimelineItem[] = [
  {
    title: 'Consultant - Développeur Full Stack',
    subtitle: 'Myriade Groupe',
    period: '2024 — Présent',
    description: 'Pilotage de refontes architecturales complexes. Leadership technique sur des stacks Next.js/Node.js. Conception et déploiement de solutions SaaS.',
    tags: ['Architecture', 'Next.js', 'Node.js', 'Leadership'],
    location: 'Paris, France',
    type: 'work',
  },
  {
    title: 'Développeur Freelance Full-Stack',
    subtitle: 'Projets Indépendants',
    period: '2022 — 2024',
    description: 'Développement de solutions sur-mesure pour startups et PME. Focus UX/UI premium et optimisation des performances.',
    tags: ['Full-Stack', 'React Native', 'Django', 'B2B'],
    location: 'Remote',
    type: 'work',
  },
];

export const EDUCATION: TimelineItem[] = [
  {
    title: 'MBA Big Data et Intelligence Artificielle',
    subtitle: 'STUDI France',
    period: '2026 — En cours',
    description: 'Spécialisation en architectures de données massives, machine learning et intégration de l\'IA dans les processus métier.',
    location: 'En ligne',
    type: 'education',
  },
  {
    title: 'Licence Pro. Systèmes Informatiques et Logiciels',
    subtitle: 'Lucas University College',
    period: '2020 — 2024',
    description: 'Formation solide en génie logiciel, algorithmique, bases de données, architectures réseaux et sécurité informatique.',
    location: 'Accra, Ghana',
    type: 'education',
  },
];
