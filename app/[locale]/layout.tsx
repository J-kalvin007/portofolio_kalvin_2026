
/**
 * @file layout.tsx
 * @description Layout racine (Root Layout) de l'application Next.js (portée locale).
 * 
 * @architecture
 * - Définit le shell HTML/Body de base pour l'application.
 * - Configure la génération dynamique des balises SEO (Metadata) en fonction de la langue.
 * - Applique la police unique du site, Poppins (`lib/fonts.ts`), à tout le document.
 * - Encapsule l'application dans `NextIntlClientProvider` pour fournir les traductions aux composants enfants.
 * - Injecte un script "anti-FOUC" (Flash of Unstyled Content) pour le mode sombre.
 * - Applique la configuration visuelle publiée depuis la régie (motif du fond, lumières) :
 *   `VisualStyle` dans le `<head>`, `LightField` dans `<main>`. Avec les réglages par
 *   défaut, ni l'un ni l'autre ne rend quoi que ce soit.
 */

import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { resolveLocale, type LocaleParams } from '@/i18n/params';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { IS_PREVIEW_DEPLOYMENT, OPEN_GRAPH_LOCALES, SHARE_IMAGE, TITLE_TEMPLATE } from '@/lib/seo';
import { fontVariables, poppins } from '@/lib/fonts';
import '../globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StructuredData from '@/components/layout/StructuredData';
import ThemeInitializer from '@/components/layout/ThemeInitializer';
import LightField from '@/components/visual/LightField';
import VisualStyle from '@/components/visual/VisualStyle';
import { lightFieldSettings, visualAttributes } from '@/lib/visual/css';
import { readPublishedVisualConfig } from '@/lib/visual/store';

/* ═══════════════════════════════════════════════
   COULEURS DE L'INTERFACE SYSTÈME
   Doivent correspondre à `--ds-canvas` (app/design-system.css).
   ═══════════════════════════════════════════════ */

const LIGHT_BACKGROUND = '#EEF0EF';
const DARK_BACKGROUND = '#0E1115';

/**
 * @constant viewport
 * @description Depuis Next 14, `themeColor` et `colorScheme` doivent être exportés
 * séparément des `metadata`. Leur absence laissait la barre d'adresse mobile en
 * gris système au-dessus d'un site sombre — la rupture la plus visible entre
 * l'application et le téléphone qui l'affiche.
 */
export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: LIGHT_BACKGROUND },
    { media: '(prefers-color-scheme: dark)', color: DARK_BACKGROUND },
  ],
};


/**
 * Mots-clés du site : le nom, le métier et les technologies réellement
 * employées dans les projets présentés. « Fintech », « Luxe » et « Premium Web
 * Design » ont été retirés : aucun projet ne les justifiait.
 */
const KEYWORDS = [
  'Kalvin Takoudjou', 'Software Engineer', 'Ingénieur logiciel', 'Développeur full-stack', 'Développeur mobile',
  'Next.js', 'React', 'TypeScript', 'Django', 'Flutter', 'PostgreSQL', 'Docker', 'Lomé', 'Togo',
];

/**
 * @function generateMetadata
 * @description Génère les balises `<meta>` du site pour le référencement et le
 * partage social (OpenGraph, Twitter). Les pages complètent ou remplacent ces valeurs.
 * @param params Contient la locale ('fr' ou 'en') provenant de l'URL.
 */
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'seo.site' });

  // Textes SEO traduits (catalogue `seo.site`)
  const title = t('title');
  const description = t('description');

  return {
    // Source unique de l'URL du site (`lib/site.ts`). Le repli local
    // `http://localhost:3000` produisait des balises canoniques et OpenGraph
    // pointant vers localhost dès que la variable d'environnement manquait.
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: TITLE_TEMPLATE, // Modèle des sous-pages : « Contact | Kalvin Takoudjou »
    },
    description,
    keywords: KEYWORDS,
    authors: [{ name: 'Kalvin Takoudjou', url: 'https://github.com/J-kalvin007' }],
    creator: 'Kalvin Takoudjou',
    publisher: 'Kalvin Takoudjou',
    formatDetection: { email: false, address: false, telephone: false }, // Empêche iOS de transformer les textes en liens moches
    // Adresse canonique et versions linguistiques : déclarées par CHAQUE page
    // (lib/seo.ts). Déclarées ici, elles s'appliquaient à toutes les pages —
    // Projets, À propos, Contact et même la page 404 désignaient l'accueil
    // comme leur version canonique.
    icons: {
      icon: '/logo/kal_logo_01.png',
      shortcut: '/logo/kal_logo_01.png',
      apple: '/logo/kal_logo_01.png',
    },
    // Aperçu de partage par défaut (LinkedIn, WhatsApp, Facebook…). Chaque page le
    // redéclare en entier (lib/seo.ts) : Next.js remplace cet objet, il ne le complète pas.
    openGraph: {
      type: 'website',
      locale: OPEN_GRAPH_LOCALES[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OPEN_GRAPH_LOCALES[l]),
      title,
      description,
      siteName: SITE_NAME,
      images: [{ ...SHARE_IMAGE, alt: t('imageAlt') }],
    },
    // Configuration Twitter Cards — format carré, cohérent avec l'image actuelle
    twitter: {
      card: 'summary',
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
    // Instructions pour les robots d'indexation (GoogleBot).
    //
    // Un déploiement de préversion est un site complet au contenu identique à
    // la production : indexable, il devient un doublon, et Google peut préférer
    // son adresse au domaine. Une préversion est donc explicitement exclue —
    // `follow` reste vrai pour que les liens continuent d'être suivis lors d'un
    // contrôle manuel.
    robots: {
      index: !IS_PREVIEW_DEPLOYMENT,
      follow: true,
      googleBot: {
        index: !IS_PREVIEW_DEPLOYMENT,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * @function generateStaticParams
 * @description Indique à Next.js quelles langues doivent être pré-rendues statiquement lors du build.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * @component LocaleLayout
 * Le véritable point d'entrée visuel de l'application.
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  // Validation de sécurité : une langue non supportée déclenche une 404,
  // et la valeur renvoyée est typée `Locale` (voir `i18n/params.ts`).
  const locale = await resolveLocale(params);

  // Permet d'activer les API statiques next-intl dans ce layout Server Component
  setRequestLocale(locale);

  // Charge les dictionnaires JSON
  const messages = await getMessages();

  /** Libellé du lien d'évitement. */
  const skipLabel = (await getTranslations({ locale, namespace: 'a11y' }))('skipToContent');

  /* Données structurées : les valeurs viennent des mêmes catalogues que le
     texte affiché, jamais d'une rédaction séparée qui pourrait en diverger. */
  const tSeo = await getTranslations({ locale, namespace: 'seo.site' });
  const tReceipt = await getTranslations({ locale, namespace: 'home.receipt' });

  /* Configuration visuelle publiée depuis la régie (motif du fond, lumières).
     La lecture ne lève jamais d'erreur : sans stockage, ou s'il est illisible,
     elle rend les réglages par défaut — le site d'origine. Elle est mise en
     cache et la page reste pré-rendue ; la régie invalide ce cache quand elle
     publie (voir `lib/visual/store.ts`). */
  const visualConfig = await readPublishedVisualConfig();
  /** `null` tant que les lumières sont éteintes : rien n'est alors ajouté à la page. */
  const lightSettings = lightFieldSettings(visualConfig);

  return (
    <html
      lang={locale}
      suppressHydrationWarning // Nécessaire car le script thème (ci-dessous) modifie le HTML avant l'hydratation React
      className={fontVariables}
      // Attributs `data-vx-*` : ils activent les règles de `visual.css`. Aucun avec les réglages par défaut.
      {...visualAttributes(visualConfig)}
    >
      <head>
        {/*
          Données structurées (schema.org) : qui est l'auteur, quel est ce site,
          et quels profils publics désignent la même personne.

          L'employeur est extrait de la ligne « Poste » du reçu — « Ingénieur ·
          Myriade Groupe » — dont la seconde moitié porte l'organisation. Une
          traduction qui abandonnerait ce séparateur laisse simplement le champ
          vide : rien ne casse, et surtout rien n'est inventé.
        */}
        <StructuredData
          locale={locale}
          jobTitle={tReceipt('role')}
          description={tSeo('description')}
          employer={tReceipt('positionValue').split(' · ')[1]}
        />

        {/*
          Script Injecté : Anti-FOUC (Flash of Unstyled Content)
          S'exécute de façon synchrone et bloquante avant le rendu du body.
          Vérifie le localStorage et force le mode sombre si nécessaire.

          Ajout : `style.colorScheme`. Sans lui, les éléments rendus par le
          système — barres de défilement, champs de saisie natifs, sélecteurs de
          date — restent en clair au-dessus d'une interface sombre.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme') || 'system';
                  var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (d) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                  document.documentElement.style.colorScheme = d ? 'dark' : 'light';
                } catch(e) {}
              })();
            `,
          }}
        />

        {/* Variables CSS du moteur visuel : tuiles du fond, couleur des lumières.
            Ne rend rien avec les réglages par défaut. */}
        <VisualStyle config={visualConfig} />
      </head>
      <body className={`${poppins.className} antialiased`}>
        {/*
          Lien d'évitement : invisible jusqu'à ce qu'il reçoive le focus.
          Sans lui, un utilisateur au clavier doit traverser l'intégralité de la
          navigation à chaque changement de page avant d'atteindre le contenu.
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-[200]
                     focus:rounded-control focus:bg-brand focus:px-5 focus:py-3 focus:font-semibold focus:text-brand-ink focus:shadow-e2
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {skipLabel}
        </a>

        {/* Fournisseur de contexte pour la traduction */}
        {/* `locale` transmis explicitement : sans lui, next-intl le déduit du
            contexte de requête, ce qui échoue dans un rendu purement statique. */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeInitializer />
          <Navbar />
          {/* `relative` seulement quand des lumières existent : leur calque se
              positionne par rapport à <main>. Lumières éteintes, la balise est
              rendue exactement comme avant. */}
          <main id="main" className={lightSettings ? 'relative' : undefined}>
            <LightField settings={lightSettings} />
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}