
import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { IS_PREVIEW_DEPLOYMENT } from '@/lib/seo';

/**
 * @file robots.ts
 * @description Directives d'exploration servies sur `/robots.txt`.
 *
 * @remarks L'URL de base provient de `lib/site.ts`, elle-même alimentée par
 * `NEXT_PUBLIC_SITE_URL` (voir `.env`). Elle était auparavant redéclarée ici
 * avec un repli (`https://kalvin-portfolio.com`) différent de celui du layout
 * et de celui de l'API d'envoi d'e-mails : le sitemap annoncé pointait alors
 * vers un domaine qui n'est pas le vôtre.
 *
 * @remarks **Une préversion interdit tout.** Un déploiement de branche sert le
 * site entier sur une autre adresse. Laissé ouvert, il est exploré, indexé, et
 * entre en concurrence avec le domaine sur ses propres mots. Le `noindex` des
 * métadonnées ne suffit pas à lui seul : il faut que la page soit lue pour être
 * vu, alors que `robots.txt` est consulté avant toute exploration.
 */
export default function robots(): MetadataRoute.Robots {
  if (IS_PREVIEW_DEPLOYMENT) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

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