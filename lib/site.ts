/**
 * @file lib/site.ts
 * @description Constantes d'identité du site, partagées par le SEO, le sitemap,
 * le fichier robots et l'API d'envoi d'e-mails.
 *
 * @remarks **Pourquoi ce fichier existe.**
 * L'URL de base était redéclarée dans trois fichiers, avec trois valeurs de repli
 * différentes :
 *
 * | Fichier              | Repli utilisé                              |
 * |----------------------|--------------------------------------------|
 * | `[locale]/layout.tsx`| `http://localhost:3000`                    |
 * | `robots.ts` / `sitemap.ts` | `https://kalvin-portfolio.com`        |
 * | `api/sendEmail/route.ts`   | `https://portofolio-kalvin-2.vercel.app` |
 *
 * Conséquence concrète : si `NEXT_PUBLIC_SITE_URL` n'est pas défini au moment du
 * build — ce qui arrive facilement sur un environnement de préversion — le
 * sitemap déclare à Google des URL sur un domaine qui n'est pas le vôtre,
 * pendant que les balises canoniques pointent vers `localhost`. Une seule
 * déclaration supprime la classe entière de ce problème.
 */

/** Domaine de production. À aligner sur le domaine réellement servi. */
const PRODUCTION_URL = 'https://portofolio-kalvin-2.vercel.app';

/**
 * URL absolue du site, sans barre oblique finale.
 * Priorité : variable d'environnement explicite → URL fournie par Vercel → domaine de production.
 */
export const SITE_URL: string = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    PRODUCTION_URL
).replace(/\/+$/, '');

/** Langues servies par l'application. Doit rester aligné sur `i18n/routing.ts`. */
export const SITE_LOCALES = ['fr', 'en'] as const;

/** Langue par défaut, utilisée comme cible `x-default` dans le sitemap. */
export const DEFAULT_LOCALE: (typeof SITE_LOCALES)[number] = 'fr';

/** Chemins publics indexables, hors préfixe de langue. */
export const SITE_ROUTES = ['', '/propos', '/projets', '/contact'] as const;

/**
 * Date de dernière révision éditoriale du contenu.
 *
 * Volontairement figée : `new Date()` produisait un `lastmod` égal à l'instant du
 * build, ce qui déclarait à chaque déploiement que les quatre pages venaient
 * d'être modifiées. Les moteurs finissent par ignorer un `lastmod` qui change
 * sans que le contenu bouge. À mettre à jour lors d'une vraie révision.
 */
export const CONTENT_LAST_MODIFIED = new Date('2026-07-01T00:00:00.000Z');

/** Nom affiché du site (OpenGraph, e-mails transactionnels). */
export const SITE_NAME = 'Kalvin Portfolio';