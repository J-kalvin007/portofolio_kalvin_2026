/* ═══════════════════════════════════════════════
   SKILLS DATA — Grouped by category
   ═══════════════════════════════════════════════ */

export interface Skill {
  name: string;
  icon: string; // path to SVG or icon name
  level: number; // 1-5
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export const SKILLS: SkillCategory[] = [
  {
    title: 'Frontend',
    skills: [
      { name: 'React.js', icon: '/svg/react_02.svg', level: 4 },
      { name: 'Next.js', icon: '/svg/next_02.svg', level: 4 },
      { name: 'TypeScript', icon: '/svg/typescript.svg', level: 4 },
      { name: 'Tailwind CSS', icon: '/svg/tailwind.svg', level: 4 },
      { name: 'Flutter', icon: '/svg/flutter.svg', level: 4 },
    ],
  },
  {
    title: 'Backend',
    skills: [
      { name: 'Node.js', icon: '/svg/node.svg', level: 4 },
      { name: 'Django', icon: '/svg/django.svg', level: 4 },
      { name: 'Python', icon: '/svg/python_02.svg', level: 4 },
      { name: '.NET', icon: '/svg/dotnet.svg', level: 3 },
    ],
  },
  {
    title: 'Base de données',
    skills: [
      { name: 'PostgreSQL', icon: '/svg/postgresql.svg', level: 4 },
      { name: 'Supabase', icon: '/svg/supabase.svg', level: 3 },
      { name: 'Redis', icon: '/svg/redis.svg', level: 2 },
    ],
  },
  {
    title: 'DevOps & Outils',
    skills: [
      { name: 'Docker', icon: '/svg/docker.svg', level: 3 },
      { name: 'Git', icon: '/svg/github.svg', level: 4 },
      // { name: 'CI/CD', icon: '/svg/github.svg', level: 2 },
      { name: 'Vercel', icon: '/svg/vercel.svg', level: 3 },
      { name: 'Linux', icon: '/svg/linux_02.svg', level: 3 },
    ],
  },
];
