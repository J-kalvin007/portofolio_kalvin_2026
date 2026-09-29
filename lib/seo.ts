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
import { CONTACT, SITE_NAME, SITE_ROUTES, SITE_URL, SOCIAL_LINKS } from '@/lib/site';
import { mostUsedTechnologies } from '@/lib/data/projects';

/**
 * Déploiement de **préversion** (une branche déployée sur Vercel).
 *
 * @remarks Sans cette distinction, chaque préversion est un site complet,
 * indexable, au contenu identique à la production : Google y voit des doublons
 * et peut choisir d'indexer l'adresse de préversion à la place du domaine. Les
 * pages d'une préversion portent donc `noindex`.
 *
 * Variable **serveur** : elle ne vaut quelque chose que dans les métadonnées et
 * `robots.txt`, qui sont produits sur le serveur. Lue depuis un composant
 * client, elle serait `undefined` — d'où la lecture ici, dans un module que
 * seuls les rendus serveur importent.
 */
export const IS_PREVIEW_DEPLOYMENT = process.env.VERCEL_ENV === 'preview';

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

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ DONNÉES STRUCTURÉES (JSON-LD)
   ───────────────────────────────────────────────────────────────────────────
   Les balises `<meta>` disent à un moteur comment afficher une page ; le
   JSON-LD lui dit **de qui et de quoi elle parle**. Pour un portfolio, c'est la
   différence entre « une page qui contient le mot Kalvin Takoudjou » et « la
   page officielle de la personne Kalvin Takoudjou, ingénieur logiciel à Lomé,
   dont voici les profils publics ». C'est ce qui permet à Google de relier le
   site, le profil LinkedIn et le compte GitHub à une seule et même entité.

   Deux règles tenues ici :
    - **aucun fait inventé.** Tout vient de `lib/site.ts`, des projets réels ou
      des catalogues de traduction déjà affichés sur le site ;
    - **rien qui contredise la page.** Une donnée structurée qui annonce ce que
      la page ne montre pas est une infraction aux consignes de Google, et se
      paie par une perte de confiance sur l'ensemble du domaine.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Nombre de technologies déclarées dans `knowsAbout`. */
const EXPERTISE_COUNT = 8;

/** Code ISO 3166-1 alpha-2 du pays, exigé par `PostalAddress`. */
const COUNTRY_CODE = 'TG';

interface StructuredDataInput {
  locale: Locale;
  /** Intitulé du poste, traduit (`home.receipt.role`). */
  jobTitle: string;
  /** Description du site, traduite (`seo.site.description`). */
  description: string;
  /** Employeur affiché sur la fiche de profil (`home.receipt.positionValue`). */
  employer?: string;
}

/**
 * Graphe décrivant la personne et le site.
 *
 * Les deux nœuds se citent par `@id` plutôt que de se recopier : un moteur
 * comprend alors qu'il s'agit d'un seul auteur, et non d'une personne et d'un
 * éditeur qui porteraient le même nom.
 */
export function structuredData({ locale, jobTitle, description, employer }: StructuredDataInput) {
  const personId = `${SITE_URL}/#kalvin`;
  const siteId = `${SITE_URL}/#site`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: 'Kalvin Takoudjou',
        url: `${SITE_URL}/${locale}`,
        jobTitle,
        description,
        image: `${SITE_URL}${SHARE_IMAGE.url}`,
        email: `mailto:${CONTACT.email}`,
        // Forme internationale, sans espace : c'est celle que les moteurs
        // savent rapprocher d'une fiche existante.
        telephone: CONTACT.phones[0].href.replace('tel:', ''),
        address: {
          '@type': 'PostalAddress',
          addressLocality: CONTACT.city,
          addressCountry: COUNTRY_CODE,
        },
        knowsLanguage: [...routing.locales],
        // Les technologies réellement employées par les projets publiés : la
        // liste suit les données, elle ne se rédige pas à la main.
        knowsAbout: mostUsedTechnologies(EXPERTISE_COUNT),
        ...(employer ? { worksFor: { '@type': 'Organization', name: employer } } : {}),
        /* `sameAs` sert à dire « c'est la même personne, ailleurs ». On n'y met
           donc que des profils publics : un lien WhatsApp est un moyen de
           contact, pas une identité, et l'y faire figurer brouille le signal. */
        sameAs: SOCIAL_LINKS.filter((link) => !link.href.includes('wa.me')).map((link) => link.href),
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        url: `${SITE_URL}/${locale}`,
        name: SITE_NAME,
        description,
        inLanguage: locale,
        author: { '@id': personId },
        publisher: { '@id': personId },
      },
    ],
  };
}
