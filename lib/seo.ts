/**
 * @file seo.ts
 * @description Métadonnées complètes d'une page : titre, description, adresse
 * canonique, versions linguistiques, aperçu de partage (OpenGraph) et carte X.
 *
 * @remarks **Pourquoi un utilitaire commun — quatre défauts corrigés.**
 * Next.js fusionne les métadonnées du layout et de la page *clé par clé, sans
 * fusion profonde* : une page qui déclare `openGraph` remplace intégralement
 * celui du layout. Mesuré sur le HTML produit avant correction :
 *
 *  1. la balise canonique de TOUTES les pages désignait l'accueil (`/fr`) —
 *     Google pouvait traiter Projets, À propos et Contact comme des doublons
 *     de l'accueil et ne pas les indexer ;
 *  2. les versions linguistiques (`hreflang`) des sous-pages pointaient vers
 *     les accueils, et `x-default` manquait ;
 *  3. aucune page n'avait d'image de partage, de nom de site ni de type
 *     OpenGraph : l'objet `openGraph` de chaque page effaçait celui du layout ;
 *  4. la carte X (Twitter) affichait le titre du site sur toutes les pages.
 *
 * Chaque page déclare désormais l'ensemble, construit ici.
 */

import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { SITE_NAME, SITE_ROUTES } from '@/lib/site';

/** Correspondance langue de l'URL → locale OpenGraph (format `langue_PAYS`). */
export const OPEN_GRAPH_LOCALES = { fr: 'fr_FR', en: 'en_US' } as const satisfies Record<Locale, string>;

/**
 * Image de partage actuelle : le monogramme, **carré 1080 × 1080**, d'où la
 * carte X au format `summary`. Une carte 1200 × 630 pourra la remplacer.
 */
export const SHARE_IMAGE = { url: '/logo/kal_logo_01.png', width: 1080, height: 1080 } as const;

/** Modèle des titres de page : « Projets | Kalvin Takoudjou ». */
export const TITLE_TEMPLATE = '%s | Kalvin Takoudjou';

/** Chemin public d'une page, sans préfixe de langue. */
export type SitePath = (typeof SITE_ROUTES)[number];

interface PageMetadataInput {
  locale: Locale;
  path: SitePath;
  title: string;
  description: string;
  /** Texte alternatif de l'image de partage. */
  imageAlt: string;
  /**
   * `true` : le titre est utilisé tel quel (accueil). Sinon, le modèle
   * « %s | Kalvin Takoudjou » du layout s'applique.
   */
  absoluteTitle?: boolean;
}

export function pageMetadata({ locale, path, title, description, imageAlt, absoluteTitle = false }: PageMetadataInput): Metadata {
  const url = `/${locale}${path}`;
  // Titre complet, identique à l'onglet : les réseaux n'appliquent pas le modèle.
  const socialTitle = absoluteTitle ? title : TITLE_TEMPLATE.replace('%s', title);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(routing.locales.map((candidate) => [candidate, `/${candidate}${path}`])),
        'x-default': `/${routing.defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      locale: OPEN_GRAPH_LOCALES[locale],
      alternateLocale: routing.locales.filter((candidate) => candidate !== locale).map((candidate) => OPEN_GRAPH_LOCALES[candidate]),
      images: [{ ...SHARE_IMAGE, alt: imageAlt }],
    },
    twitter: {
      card: 'summary',
      title: socialTitle,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
