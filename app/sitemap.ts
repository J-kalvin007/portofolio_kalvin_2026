import { MetadataRoute } from 'next';
import { SITE_URL, DEFAULT_LOCALE } from '@/lib/site';

/**
 * @file sitemap.ts
 * @description Plan du site XML dynamique servi sur `/sitemap.xml`.
 *
 * Conforme aux spécifications officielles des moteurs de recherche (Google, Bing)
 * et aux standards Next.js App Router (MetadataRoute.Sitemap).
 *
 * Structure retournée :
 * - Tableau d'objets typés contenant : url, lastModified, changeFrequency, priority et alternates.
 * - 8 entrées complètes : 4 pages (Accueil, Projets, À propos, Contact) x 2 langues (FR et EN).
 * - Correspondances multilingues réciproques (hreflang 'fr', 'en' et 'x-default').
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Déclaration explicite des routes indexables du portfolio
  const routes = [
    {
      path: '',
      changeFrequency: 'weekly' as const,
      priorityFr: 1.0,
      priorityEn: 0.9,
    },
    {
      path: '/projets',
      changeFrequency: 'monthly' as const,
      priorityFr: 0.8,
      priorityEn: 0.8,
    },
    {
      path: '/propos',
      changeFrequency: 'monthly' as const,
      priorityFr: 0.8,
      priorityEn: 0.8,
    },
    {
      path: '/contact',
      changeFrequency: 'monthly' as const,
      priorityFr: 0.8,
      priorityEn: 0.8,
    },
  ];

  return routes.flatMap(({ path, changeFrequency, priorityFr, priorityEn }) => {
    // Balises hreflang réciproques pour le référencement international (Google SEO)
    const alternates = {
      languages: {
        fr: `${SITE_URL}/fr${path}`,
        en: `${SITE_URL}/en${path}`,
        'x-default': `${SITE_URL}/${DEFAULT_LOCALE}${path}`,
      },
    };

    return [
      {
        url: `${SITE_URL}/fr${path}`,
        lastModified: currentDate,
        changeFrequency,
        priority: priorityFr,
        alternates,
      },
      {
        url: `${SITE_URL}/en${path}`,
        lastModified: currentDate,
        changeFrequency,
        priority: priorityEn,
        alternates,
      },
    ];
  });
}