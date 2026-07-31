// import { MetadataRoute } from 'next';

// export default function robots(): MetadataRoute.Robots {
//   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kalvin-portfolio.com';

//   return {
//     rules: {
//       userAgent: '*',
//       allow: '/',
//     },
//     sitemap: `${baseUrl}/sitemap.xml`,
//   };
// }








import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * @file robots.ts
 * @description Directives d'exploration servies sur `/robots.txt`.
 *
 * @remarks L'URL de base provient désormais de `lib/site.ts`. Elle était
 * auparavant redéclarée ici avec un repli (`https://kalvin-portfolio.com`)
 * différent de celui du layout et de celui de l'API d'envoi d'e-mails : sans
 * `NEXT_PUBLIC_SITE_URL` au build, le sitemap annoncé pointait vers un domaine
 * qui n'est pas le vôtre.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Les routes d'API ne renvoient aucun contenu indexable : les exclure
      // évite d'user le budget d'exploration sur des réponses 405.
      disallow: ['/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}