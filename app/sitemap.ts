// import { MetadataRoute } from 'next';

// export default function sitemap(): MetadataRoute.Sitemap {
//   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kalvin-portfolio.com';

//   const routes = ['', '/propos', '/projets', '/contact'];

//   return routes.map((route) => ({
//     url: `${baseUrl}/fr${route}`,
//     lastModified: new Date(),
//     changeFrequency: route === '' ? 'weekly' : 'monthly',
//     priority: route === '' ? 1 : 0.8,
//     alternates: {
//       languages: {
//         fr: `${baseUrl}/fr${route}`,
//         en: `${baseUrl}/en${route}`,
//       },
//     },
//   }));
// }













import { MetadataRoute } from 'next';
import { SITE_URL, SITE_LOCALES, SITE_ROUTES, DEFAULT_LOCALE, CONTENT_LAST_MODIFIED } from '@/lib/site';

/**
 * @file sitemap.ts
 * @description Plan du site servi sur `/sitemap.xml`.
 *
 * @remarks Trois corrections par rapport à la version précédente.
 *
 * **1. Les pages anglaises n'étaient pas déclarées.** Seules les quatre URL
 * `/fr/*` figuraient comme entrées ; l'anglais n'apparaissait qu'en `alternates`.
 * Or une balise `alternate` signale une correspondance, elle ne demande pas
 * l'exploration. Les quatre pages `/en/*` n'étaient donc jamais soumises
 * directement — d'où une découverte et une indexation nettement plus lentes.
 * Chaque langue a maintenant ses propres entrées, avec des `alternates`
 * réciproques.
 *
 * **2. `lastModified: new Date()`** produisait l'instant du build. Chaque
 * déploiement, même purement technique, déclarait que les quatre pages venaient
 * d'être modifiées. Un `lastmod` qui bouge sans que le contenu bouge finit par
 * être ignoré par les moteurs. La date est désormais une constante éditoriale.
 *
 * **3. `x-default` était absent.** Sans lui, aucune version n'est désignée pour
 * les visiteurs dont la langue ne correspond à aucune de vos locales.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /** Correspondances de langue, identiques pour toutes les entrées d'un même chemin. */
  const buildAlternates = (route: string) => ({
    languages: {
      ...Object.fromEntries(SITE_LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}${route}`])),
      'x-default': `${SITE_URL}/${DEFAULT_LOCALE}${route}`,
    },
  });

  return SITE_LOCALES.flatMap((locale) =>
    SITE_ROUTES.map((route) => {
      const isHomePage = route === '';

      return {
        url: `${SITE_URL}/${locale}${route}`,
        lastModified: CONTENT_LAST_MODIFIED,
        changeFrequency: isHomePage ? ('weekly' as const) : ('monthly' as const),
        // La langue par défaut porte la priorité pleine ; les traductions se
        // situent juste en dessous, ce qui reflète leur rôle réel.
        priority: isHomePage
          ? (locale === DEFAULT_LOCALE ? 1 : 0.9)
          : (locale === DEFAULT_LOCALE ? 0.8 : 0.7),
        alternates: buildAlternates(route),
      };
    })
  );
}