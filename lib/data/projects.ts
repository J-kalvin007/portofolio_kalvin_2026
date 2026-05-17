/* ═══════════════════════════════════════════════
   PROJECTS DATA
   ═══════════════════════════════════════════════ */

export interface Project {
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  images: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  metrics?: { label: string; value: string }[];
  featured: boolean;
  year: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'challenger-app',
    title: 'Challenger App',
    category: 'Logiciel Windows',
    shortDescription: 'Logiciel Windows de calcul du temps de travail des employés.',
    fullDescription: 'Logiciel Windows de pointage et de calcul du temps de travail des employés.',
    coverImage: '/images_projets/challenger00.jpeg',
    images: ['/images_projets/challenger00.jpeg', '/images_projets/challenger_04.jpg', '/images_projets/challenger_01.jpg', '/images_projets/challenger_02.jpg', '/images_projets/challenger_03.jpg',],
    techStack: ['Dart', 'Flutter'],
    githubUrl: 'https://github.com/J-kalvin007',
    metrics: [{ label: 'Utilisateurs', value: '20+' }, { label: 'Événements', value: '20+' }],
    featured: true,
    year: '2024',
  },
  {
    slug: 'Sheem!',
    title: 'Sheem!',
    category: 'Application Mobile',
    shortDescription: 'Application mobile Android et IOS de gestion événementielle avec vente de billets, paiement mobile, génération de QR codes et tableau de bord administrateur.',
    fullDescription: 'Application mobile Android et IOS de gestion événementielle avec vente de billets, paiement mobile, génération de QR codes et tableau de bord administrateur.',
    coverImage: '/images_projets/event_09.jpg',
    images: ['/images_projets/event_04.jpg', '/images_projets/event_13.jpg', '/images_projets/event_12.jpg', '/images_projets/event_02.jpg', '/images_projets/event_05.jpg',],
    techStack: ['Flutter', 'Django', 'PostgreSQL', 'QR Code', 'Mobile Money', 'Docker'],
    githubUrl: 'https://github.com/J-kalvin007',
    metrics: [{ label: 'Utilisateurs', value: '100+' }, { label: 'Événements', value: '50+' }],
    featured: true,
    year: '2026',
  },
  {
    slug: 'mboashop-ecommerce',
    title: 'MboaShop & Dashboard',
    category: 'Application Web',
    shortDescription: 'E-commerce complet avec panier dynamique, paiement intégré et dashboard admin.',
    fullDescription: 'Plateforme e-commerce full-stack avec catalogue riche, panier dynamique, paiement multi-canal et dashboard analytics.',
    coverImage: '/images_projets/shop_04.jpg',
    images: ['/images_projets/shop_04.jpg', '/images_projets/shop_01.jpg', '/images_projets/shop_02.jpg', '/images_projets/shop_03.jpg',],
    techStack: ['Django', "HTML/CSS", 'PostgreSQL', 'Stripe', 'Docker', "Next.js", "Tailwind CSS"],
    githubUrl: 'https://github.com/J-kalvin007',
    metrics: [{ label: 'Produits', value: '2000+' }, { label: 'Commandes/mois', value: '300+' }],
    featured: true,
    year: '2024',
  },
  {
    slug: 'myriade-groupe',
    title: 'Myriade Groupe',
    category: 'Application Web',
    shortDescription: 'Site vitrine corporate premium pour un groupe de services B2B & B2C multi-secteurs.',
    fullDescription: 'Plateforme institutionnelle moderne avec architecture SSG, animations cinématiques, spatial et optimisation SEO.',
    coverImage: '/images_projets/site_05.jpg',
    images: ['/images_projets/site_01.jpg', '/images_projets/site_02.jpg', '/images_projets/site_03.jpg', '/images_projets/site_06.jpg', '/images_projets/site_04.jpg'],
    techStack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'SEO', 'Vercel'],
    liveUrl: 'https://myriade-groupe.com',
    metrics: [{ label: 'Lighthouse', value: '98' }, { label: 'Load Time', value: '1.2s' }],
    featured: true,
    year: '2025',
  },
  {
    slug: 'stock-manager',
    title: 'Stock Manager Pro',
    category: 'SaaS',
    shortDescription: 'Gestion de stock en temps réel avec alertes automatiques et reporting avancé.',
    fullDescription: 'SaaS de gestion d\'inventaire avec suivi temps réel, alertes de réapprovisionnement et codes-barres.',
    coverImage: '/images_projets/stockManager_02.jpg',
    images: ['/images_projets/stockManager_01.jpg', '/images_projets/stockManager_02.jpg', '/images_projets/stockManager_03.jpg'],
    techStack: ['React.js', 'Node.js', 'Prisma ORM', 'WebSocket', 'Chart.js'],
    githubUrl: 'https://github.com/J-kalvin007',
    featured: false,
    year: '2025',
  },
  {
    slug: 'green-Challenger',
    title: 'Challenger App',
    category: 'Mobile + Web + API',
    shortDescription: 'Plateforme de gestion complète de plantation et suivi des activités.',
    fullDescription: 'Plateforme complète de gestion de plantation et suivi des activités avec pipeline de données, API RESTful et visualisations interactives.',
    coverImage: '/images_projets/greenChallenger00.jpeg',
    images: ['/images_projets/greenChallenger00.jpeg', '/images_projets/greenChallenger_08.jpg', '/images_projets/greenChallenger_02.jpg', '/images_projets/greenChallenger_06.jpg', '/images_projets/greenChallenger_07.jpg', '/images_projets/greenChallenger_03.jpg'],
    techStack: ['Python', 'Django', 'PostgreSQL', 'D3.js', 'Docker', "Next.js", "Tailwind CSS", "Flutter"],
    githubUrl: 'https://github.com/J-kalvin007',
    featured: false,
    year: '2025',
  },
  {
    slug: 'locamanager',
    title: 'LocaManager',
    category: 'Application Mobile',
    shortDescription: 'Application mobile Android et IOS de gestion complète de biens immobiliers mis en location.',
    fullDescription: 'Application mobile Android et IOS complète de gestion de biens immobiliers mis en location avec pipeline de données, API RESTful et visualisations interactives.',
    coverImage: '/images_projets/locaManger_02.jpg',
    images: ['/images_projets/locaManger_02.jpg', '/images_projets/locaManger_03.jpg', '/images_projets/locaManger_01.jpg'],
    techStack: ["Flutter", "Dart", 'Django', 'PostgreSQL', 'Docker'],
    githubUrl: 'https://github.com/J-kalvin007',
    featured: false,
    year: '2025',
  },
  {
    slug: 'Lotus',
    title: 'Lotus pro',
    category: 'Application Web',
    shortDescription: 'Plateforme multi-tenant de gestion complète de gestion complete de magasins et boutiques.',
    fullDescription: 'Plateforme multi-tenant complète de gestion de promotion maganisiniere avec pipeline de données, API RESTful et visualisations interactives.',
    coverImage: '/images_projets/lotus_01.jpg',
    images: ['/images_projets/lotus_01.jpg', '/images_projets/lotus_04.jpg', '/images_projets/lotus_03.jpg', '/images_projets/lotus_05.jpg', '/images_projets/lotus_06.jpg'],
    techStack: ["Next.js", 'Prisma ORM', 'Docker', "Chart.js", "Tailwind CSS"],
    githubUrl: 'https://github.com/J-kalvin007',
    featured: false,
    year: '2026',
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
export const PROJECT_CATEGORIES = [...new Set(PROJECTS.map((p) => p.category))];
