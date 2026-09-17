/* ═══════════════════════════════════════════════
   SKILLS DATA — Grouped by category
   ═══════════════════════════════════════════════ */

/**
 * Une compétence du relevé de l'accueil.
 *
 * @remarks Le nom doit être **identique** à celui employé dans les stacks des
 * projets (`lib/data/projects.ts → techStack`) : c'est lui qui sert à compter
 * les projets qui l'utilisent. Les anciens champs `icon` et `level` (niveau
 * sur 5) ont été retirés : aucun écran ne les affichait, et une note auto-
 * attribuée n'apprend rien à un recruteur, contrairement au nombre de projets.
 */
export interface Skill {
  name: string;
}

export interface SkillCategory {
  /**
   * Clé de traduction du groupe (`home.stack.categories`). Remplace l'ancien
   * titre en français (`'Base de données'`), qui servait à la fois de libellé et
   * d'identifiant : la page d'accueil filtrait sur `title === 'Frontend'`.
   */
  key: 'frontend' | 'backend' | 'database' | 'devops';
  skills: Skill[];
}

export const SKILLS: SkillCategory[] = [
  {
    key: 'frontend',
    skills: [
      { name: 'Next.js' },
      { name: 'TypeScript' },
      { name: 'React.js' },
      { name: 'Tailwind CSS' },
      { name: 'Flutter' },
      { name: 'Dart' },
    ],
  },
  {
    key: 'backend',
    skills: [
      { name: 'Python' },
      { name: 'Django' },
      { name: 'Django REST Framework' },
      { name: 'Celery' },
      { name: 'Stripe' },
      { name: 'PayDunya' },
      { name: 'Node.js' },
      { name: '.NET' },
    ],
  },
  {
    key: 'database',
    skills: [
      { name: 'PostgreSQL' },
      { name: 'Redis' },
      { name: 'Isar' },
      { name: 'Supabase' },
    ],
  },
  {
    key: 'devops',
    skills: [
      { name: 'Docker' },
      { name: 'Traefik' },
      { name: 'Linux' },
      { name: 'Git' },
      { name: 'Vercel' },
    ],
  },
];
