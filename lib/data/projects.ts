/* ═══════════════════════════════════════════════
   PROJECTS DATA
   ═══════════════════════════════════════════════ */

import type fr from '@/messages/fr.json';

/**
 * Clé du projet dans `messages/*.json → projects_data`.
 *
 * Le type est **dérivé du catalogue de traductions** : déclarer un projet avec
 * une clé qui n'y figure pas est une erreur de compilation.
 *
 * @remarks Pourquoi ce champ existe. La correspondance projet → traduction était
 * reconstituée à partir du `slug` dans trois tables distinctes, avec deux replis
 * différents (`'green'` sur l'accueil, `'challenger'` sur la page Projets).
 * LocaManager et Lotus, absents des tables et du catalogue, affichaient donc
 * silencieusement la description d'un autre projet — une autre selon la page.
 */
export type ProjectI18nKey = keyof (typeof fr)['projects_data'];

/**
 * Catégorie de filtre, clé de `messages/*.json → project.categories`.
 *
 * @remarks Les catégories étaient des libellés français (`'Application Web'`) :
 * les filtres restaient en français sur la version anglaise, et ne
 * correspondaient pas au libellé affiché sur les cartes (`'Web'`). Une clé
 * unique sert désormais au filtrage **et** à l'affichage, dans les deux langues.
 */
export type ProjectCategory = keyof (typeof fr)['project']['categories'];

export interface Project {
  /** Identifiant stable, utilisé comme clé de rendu React. */
  slug: string;
  i18nKey: ProjectI18nKey;
  title: string;
  category: ProjectCategory;
  coverImage: string;
  images: string[];
  techStack: string[];
  liveUrl?: string;
  /**
   * Lien GitHub. Affiché comme « Code source » uniquement s'il désigne un
   * dépôt (`github.com/compte/dépôt`) — voir `repositoryUrl`.
   */
  githubUrl?: string;
  featured: boolean;
  year: string;
}

/*
 * Les chiffres par projet (« 2000+ produits », « Lighthouse 98 »…) ont été
 * retirés : aucun écran ne les affichait, leurs libellés étaient écrits en
 * français dans le code, et aucun n'était sourcé. Un chiffre revient ici le
 * jour où il peut être vérifié.
 *
 * Les descriptions (`shortDescription`, `fullDescription`) ont été retirées de
 * ces données : aucun composant ne les lisait, l'affichage passe par les
 * traductions. Garder une seconde version française ici, c'était garantir
 * qu'elle diverge un jour de celle que les visiteurs lisent.
 */
export const PROJECTS: Project[] = [
  {
    slug: 'challenger-app',
    i18nKey: 'challenger',
    title: 'Challenger App',
    category: 'desktop',
    coverImage: '/images_projets/challenger00.webp',
    images: ['/images_projets/challenger00.webp', '/images_projets/challenger_04.webp', '/images_projets/challenger_01.webp', '/images_projets/challenger_02.webp', '/images_projets/challenger_03.webp'],
    techStack: ['Dart', 'Flutter'],
<<<<<<< HEAD
    githubUrl: 'https://github.com/J-kalvin007',
=======
    // githubUrl: 'https://gchallenger.com',
    liveUrl: 'https://www.gchallenger.com/',
    metrics: [{ label: 'Utilisateurs', value: '20+' }, { label: 'Événements', value: '20+' }],
>>>>>>> 9ceb0326881fd46210a7e89028991f3abf6b1532
    featured: true,
    year: '2024',
  },
  {
<<<<<<< HEAD
    slug: 'Sheem!',
    i18nKey: 'sheem',
    title: 'Sheem!',
    category: 'mobile',
    coverImage: '/images_projets/event_09.webp',
    images: ['/images_projets/event_04.webp', '/images_projets/event_13.webp', '/images_projets/event_12.webp', '/images_projets/event_02.webp', '/images_projets/event_05.webp'],
    techStack: ['Flutter', 'Django', 'PostgreSQL', 'QR Code', 'Mobile Money', 'Docker'],
    githubUrl: 'https://github.com/J-kalvin007',
=======
    slug: 'Shemm!',
    title: 'Shemm!',
    category: 'Application Mobile',
    shortDescription: 'Application mobile Android et IOS de gestion événementielle avec vente de billets, paiement mobile, génération de QR codes et tableau de bord administrateur.',
    fullDescription: 'Application mobile Android et IOS de gestion événementielle avec vente de billets, paiement mobile, génération de QR codes et tableau de bord administrateur.',
    coverImage: '/images_projets/event_09.jpg',
    images: ['/images_projets/event_04.jpg', '/images_projets/event_13.jpg', '/images_projets/event_12.jpg', '/images_projets/event_02.jpg', '/images_projets/event_05.jpg',],
    techStack: ['Flutter', 'Django', 'PostgreSQL', 'QR Code', 'Mobile Money', 'Docker'],
    // githubUrl: 'https://shemm.live',
    liveUrl: 'https://shemm.live',
    metrics: [{ label: 'Utilisateurs', value: '100+' }, { label: 'Événements', value: '50+' }],
>>>>>>> 9ceb0326881fd46210a7e89028991f3abf6b1532
    featured: true,
    year: '2026',
  },
  {
<<<<<<< HEAD
    slug: 'mboashop-ecommerce',
    i18nKey: 'mboashop',
    title: 'MboaShop & Dashboard',
    category: 'web',
    coverImage: '/images_projets/shop_04.webp',
    images: ['/images_projets/shop_04.webp', '/images_projets/shop_01.webp', '/images_projets/shop_02.webp', '/images_projets/shop_03.webp'],
    techStack: ['Django', 'HTML/CSS', 'PostgreSQL', 'Stripe', 'Docker', 'Next.js', 'Tailwind CSS'],
    githubUrl: 'https://github.com/J-kalvin007',
=======
    slug: 'Atelier du terroir',
    title: 'Atelier du Terroir - Ferme solime',
    category: 'Application Web',
    shortDescription: 'Site e-commerce profesionnel et complet avec panier dynamique, paiement intégré et dashboard admin et client.',
    fullDescription: 'Plateforme e-commerce full-stack avec catalogue riche, panier dynamique, paiement multi-canal et dashboard analytics.',
    coverImage: '/images_projets/shop_04.jpg',
    images: ['/images_projets/shop_04.jpg', '/images_projets/shop_01.jpg', '/images_projets/shop_02.jpg', '/images_projets/shop_03.jpg',],
    techStack: ['Django', "HTML/CSS", 'PostgreSQL', 'Stripe', 'Docker', "Next.js", "Tailwind CSS", "PayDunya"],
    // githubUrl: 'https://atelierterroirsolime.vercel.app/',
    liveUrl: 'https://atelierterroirsolime.vercel.app/',
    metrics: [{ label: 'Produits', value: '2000+' }, { label: 'Commandes/mois', value: '30+' }],
>>>>>>> 9ceb0326881fd46210a7e89028991f3abf6b1532
    featured: true,
    year: '2026',
  },
  {
    slug: 'myriade-groupe',
    i18nKey: 'myriade',
    title: 'Myriade Groupe',
    category: 'web',
    coverImage: '/images_projets/site_05.webp',
    images: ['/images_projets/site_01.webp', '/images_projets/site_02.webp', '/images_projets/site_03.webp', '/images_projets/site_06.webp', '/images_projets/site_04.webp'],
    techStack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'SEO', 'Vercel'],
    liveUrl: 'https://myriade-groupe.com',
    featured: true,
    year: '2025',
  },
  {
    slug: 'stock-manager',
    i18nKey: 'stock',
    title: 'Stock Manager Pro',
    category: 'saas',
    coverImage: '/images_projets/stockManager_02.webp',
    images: ['/images_projets/stockManager_01.webp', '/images_projets/stockManager_02.webp', '/images_projets/stockManager_03.webp'],
    techStack: ['React.js', 'Node.js', 'Prisma ORM', 'WebSocket', 'Chart.js'],
    githubUrl: 'https://github.com/J-kalvin007',
    featured: false,
    year: '2025',
  },
  {
    slug: 'green-Challenger',
    i18nKey: 'green',
    title: 'Challenger App',
<<<<<<< HEAD
    category: 'platform',
    coverImage: '/images_projets/greenChallenger00.webp',
    images: ['/images_projets/greenChallenger00.webp', '/images_projets/greenChallenger_08.webp', '/images_projets/greenChallenger_02.webp', '/images_projets/greenChallenger_06.webp', '/images_projets/greenChallenger_07.webp', '/images_projets/greenChallenger_03.webp'],
    techStack: ['Python', 'Django', 'PostgreSQL', 'D3.js', 'Docker', 'Next.js', 'Tailwind CSS', 'Flutter'],
    githubUrl: 'https://github.com/J-kalvin007',
=======
    category: 'Mobile + Web + API',
    shortDescription: 'Plateforme de gestion complète de plantation et suivi des activités.',
    fullDescription: 'Plateforme complète de gestion de plantation et suivi des activités avec pipeline de données, API RESTful et visualisations interactives.',
    coverImage: '/images_projets/greenChallenger00.jpeg',
    images: ['/images_projets/greenChallenger00.jpeg', '/images_projets/greenChallenger_08.jpg', '/images_projets/greenChallenger_02.jpg', '/images_projets/greenChallenger_06.jpg', '/images_projets/greenChallenger_07.jpg', '/images_projets/greenChallenger_03.jpg'],
    techStack: ['Python', 'Django', 'PostgreSQL', 'D3.js', 'Docker', "Next.js", "Tailwind CSS", "Flutter"],
    // githubUrl: 'https://github.com/J-kalvin007',
    githubUrl: 'https://www.gchallenger.com/',
>>>>>>> 9ceb0326881fd46210a7e89028991f3abf6b1532
    featured: false,
    year: '2025 - 2026',
  },
  {
    slug: 'locamanager',
    i18nKey: 'locamanager',
    title: 'LocaManager',
    category: 'mobile',
    coverImage: '/images_projets/locaManger_02.webp',
    images: ['/images_projets/locaManger_02.webp', '/images_projets/locaManger_03.webp', '/images_projets/locaManger_01.webp'],
    techStack: ['Flutter', 'Dart', 'Django', 'PostgreSQL', 'Docker'],
    githubUrl: 'https://github.com/J-kalvin007',
    featured: false,
    year: '2025',
  },
  {
    slug: 'Lotus',
    i18nKey: 'lotus',
    title: 'Lotus pro',
<<<<<<< HEAD
    category: 'web',
    coverImage: '/images_projets/lotus_01.webp',
    images: ['/images_projets/lotus_01.webp', '/images_projets/lotus_04.webp', '/images_projets/lotus_03.webp', '/images_projets/lotus_05.webp', '/images_projets/lotus_06.webp'],
    techStack: ['Next.js', 'Prisma ORM', 'Docker', 'Chart.js', 'Tailwind CSS'],
    githubUrl: 'https://github.com/J-kalvin007',
=======
    category: 'Application Web',
    shortDescription: 'Plateforme multi-tenant de gestion complète de gestion complete de magasins et boutiques.',
    fullDescription: 'Plateforme multi-tenant complète de gestion de promotion maganisiniere avec pipeline de données, API RESTful et visualisations interactives.',
    coverImage: '/images_projets/lotus_01.jpg',
    images: ['/images_projets/lotus_01.jpg', '/images_projets/lotus_04.jpg', '/images_projets/lotus_03.jpg', '/images_projets/lotus_05.jpg', '/images_projets/lotus_06.jpg'],
    techStack: ["Next.js", 'Prisma ORM', 'Docker', "Chart.js", "Tailwind CSS"],
    // githubUrl: 'https://www.lgi-logiciel.net/',
    liveUrl: 'https://www.lgi-logiciel.net/',
>>>>>>> 9ceb0326881fd46210a7e89028991f3abf6b1532
    featured: false,
    year: '2026',
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);

/** Ancre d'un projet sur la page Projets : `/projets#projet-sheem`. */
export const projectAnchor = (project: Project): string => `projet-${project.i18nKey}`;

/**
 * Adresse du dépôt de code, si `githubUrl` en désigne un.
 *
 * @remarks Tous les projets pointaient vers la racine du profil
 * (`github.com/J-kalvin007`), présentée comme « Code source » : un visiteur
 * qui voulait lire le code d'un projet arrivait sur la liste des dépôts. Le
 * profil reste accessible depuis le pied de page ; un lien « Code source »
 * n'apparaît que pour une adresse de dépôt réelle.
 */
export function repositoryUrl(project: Project): string | undefined {
  if (!project.githubUrl) return undefined;
  try {
    const { hostname, pathname } = new URL(project.githubUrl);
    const segments = pathname.split('/').filter(Boolean);
    return hostname === 'github.com' && segments.length >= 2 ? project.githubUrl : undefined;
  } catch {
    return undefined;
  }
}

/** Catégories effectivement représentées, dans l'ordre de première apparition. */
export const PROJECT_CATEGORIES: ProjectCategory[] = [...new Set(PROJECTS.map((p) => p.category))];

/* ═══════════════════════════════════════════════
   STATISTIQUES DÉRIVÉES
   Calculées à partir de PROJECTS : elles ne peuvent pas se désynchroniser
   des projets présentés (les anciens compteurs « 10+ projets », « 89 % »
   étaient écrits à la main).
   ═══════════════════════════════════════════════ */

/** Nombre de projets par catégorie, dans l'ordre de `PROJECT_CATEGORIES`. */
export const PROJECT_COUNT_BY_CATEGORY: { category: ProjectCategory; count: number }[] =
  PROJECT_CATEGORIES.map((category) => ({
    category,
    count: PROJECTS.filter((p) => p.category === category).length,
  }));

/** Nombre de projets présentés qui utilisent chaque technologie. */
export const TECH_USAGE: ReadonlyMap<string, number> = PROJECTS.reduce((usage, project) => {
  for (const tech of project.techStack) usage.set(tech, (usage.get(tech) ?? 0) + 1);
  return usage;
}, new Map<string, number>());

/**
 * Technologies les plus employées, de la plus fréquente à la moins fréquente
 * (à égalité : ordre alphabétique, pour un résultat stable d'un build à l'autre).
 */
export function mostUsedTechnologies(limit: number): string[] {
  return [...TECH_USAGE.entries()]
    .sort(([nameA, countA], [nameB, countB]) => countB - countA || nameA.localeCompare(nameB))
    .slice(0, limit)
    .map(([name]) => name);
}
