/**
 * @file next.config.ts
 * @description Réglages de compilation et de service du site.
 *
 * @architecture
 * Ce fichier est lu **au moment du build**, puis embarqué dans le serveur. Il
 * décide de quatre choses :
 *
 *  1. **la forme du build** — paquet autonome pour un serveur classique, ou
 *     build standard quand c'est Vercel qui compile ;
 *  2. **les en-têtes de sécurité** envoyés avec chaque réponse ;
 *  3. **la durée de vie en cache** des fichiers de `public/` ;
 *  4. **les limites du moteur d'images** de Next.js.
 *
 * Tout est écrit pour fonctionner à l'identique dans les deux cibles visées :
 * Vercel (offre gratuite) et un conteneur Docker chez un hébergeur gratuit.
 * Les rares différences entre les deux passent par `isVercel`, et chacune est
 * expliquée à l'endroit où elle s'applique.
 */

import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ REPÈRES D'ENVIRONNEMENT
   ═══════════════════════════════════════════════════════════════════════════ */

/** Serveur de développement (`npm run dev`). */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Build exécuté par Vercel. La plateforme définit toujours `VERCEL=1` pendant
 * la compilation ; ailleurs — machine locale, Docker, hébergeur gratuit — la
 * variable n'existe pas.
 */
const isVercel = Boolean(process.env.VERCEL);

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ GARDE-FOU : L'ADRESSE PUBLIQUE DU SITE
   ───────────────────────────────────────────────────────────────────────────
   `lib/site.ts` construit toutes les URL absolues du site — balises
   canoniques, `hreflang`, `sitemap.xml`, `robots.txt`, aperçus de partage — à
   partir de `NEXT_PUBLIC_SITE_URL`. Si la variable manque au build, le site se
   rabat sur le domaine écrit en dur dans ce fichier : les pages s'affichent
   normalement, mais elles déclarent aux moteurs de recherche des adresses qui
   ne sont peut-être pas les vôtres. La panne est silencieuse et coûteuse —
   d'où cet avertissement, au moment précis où la valeur est figée.
   ═══════════════════════════════════════════════════════════════════════════ */
if (!isDevelopment && !process.env.NEXT_PUBLIC_SITE_URL && !process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  console.warn(
    [
      "",
      "  NEXT_PUBLIC_SITE_URL n'est pas définie pour ce build.",
      "  Les adresses canoniques, le sitemap et les aperçus de partage porteront",
      "  le domaine de repli inscrit dans lib/site.ts. Définissez la variable dans",
      "  les réglages de la plateforme (ou dans .env.local) avant de déployer.",
      "",
    ].join("\n"),
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ 1. POLITIQUE DE SÉCURITÉ DU CONTENU (CSP)
   ───────────────────────────────────────────────────────────────────────────
   Chaque directive restreint ce que le navigateur accepte de charger ou
   d'exécuter. Tout est limité à l'origine du site (`'self'`) : le projet
   n'utilise aucun script, police ni API tiers (les polices Google sont
   auto-hébergées par next/font au moment du build).

   ⚖️ Compromis assumé : `'unsafe-inline'` pour les scripts et les styles.
   Next.js injecte des scripts en ligne (données de rendu React), le layout
   contient le script anti-flash du thème, et framer-motion anime via des
   attributs `style`. L'alternative stricte — un jeton (« nonce ») par requête
   — impose un rendu dynamique de chaque page et supprimerait la génération
   statique (SSG) qui rend ce site rapide. Pour un portfolio sans contenu saisi
   par des tiers, le gain ne justifie pas ce coût. La politique bloque
   néanmoins tout script d'une autre origine, les plugins, les cadres, les
   travailleurs de fond, l'intégration du site dans une autre page et l'envoi
   de formulaires vers un domaine externe.

   En développement uniquement : `'unsafe-eval'` et `blob:` (rechargement à
   chaud de React, surcouche d'erreurs) et `ws:` (connexion du serveur de
   développement).

   ⚠️ `upgrade-insecure-requests` n'est **pas** ajoutée, bien qu'elle figure
   dans la plupart des exemples : elle forcerait le navigateur à redemander en
   HTTPS toutes les ressources d'une page servie en HTTP. Sur un hébergeur
   gratuit testé en `http://` avant l'installation du certificat, la page se
   retrouverait sans styles ni images. HSTS, plus bas, couvre le vrai besoin
   sans ce risque.
   ═══════════════════════════════════════════════════════════════════════════ */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval' blob:" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  // `data:` : images en ligne (aperçus). `blob:` : images construites en
  // mémoire par la visionneuse plein écran.
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDevelopment ? ' ws:' : ''}`,
  "media-src 'self'",
  /* Le site n'affiche aucun greffon, aucun cadre et n'ouvre aucun travailleur
     de fond : ces trois capacités sont interdites, et non simplement
     restreintes à l'origine. */
  "object-src 'none'",
  "frame-src 'none'",
  "worker-src 'none'",
  // Interdit de réécrire la base des URL relatives, donc de détourner d'un
  // coup tous les liens et toutes les ressources de la page.
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ 2. EN-TÊTES DE SÉCURITÉ — appliqués à toutes les réponses
   ═══════════════════════════════════════════════════════════════════════════ */
const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // Interdit l'intégration dans une <iframe> (clickjacking). Doublon volontaire
  // de `frame-ancestors` pour les navigateurs qui ignorent la CSP.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Empêche le navigateur de réinterpréter un fichier sous un autre type MIME.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Les sites externes reçoivent l'origine, jamais le chemin complet visité.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Désactive les API sensibles dont le site n'a aucun usage.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  // Isole la fenêtre des pages ouvertes depuis d'autres origines.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  /* Empêche un autre site d'afficher directement vos fichiers (captures, CV)
     depuis ses propres pages. Deux effets : personne ne consomme à votre place
     la bande passante de l'hébergement gratuit, et les captures des projets ne
     sont pas republiées telles quelles ailleurs. Les aperçus de partage
     (WhatsApp, LinkedIn, X) ne sont pas concernés : leurs robots récupèrent
     l'image côté serveur, où cet en-tête ne s'applique pas — il n'est lu que
     par les navigateurs.
     ⚠️ À retirer le jour où une image de ce site doit s'afficher sur un autre
     domaine (article de blog, plateforme de mise en avant). */
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  // HTTPS obligatoire pendant 2 ans une fois le site visité en HTTPS
  // (ignoré par les navigateurs sur http://localhost). `preload` n'est pas
  // ajouté : c'est un engagement à déclarer volontairement sur hstspreload.org.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ 3. CACHE DES FICHIERS DE `public/`
   ───────────────────────────────────────────────────────────────────────────
   Les fichiers produits par le build (`/_next/static/…`) portent une empreinte
   dans leur nom : Next.js les déclare déjà immuables pour un an, il n'y a rien
   à faire. Ceux de `public/` gardent en revanche leur nom d'origine, et sont
   servis **sans aucune consigne de cache** : le navigateur les redemande à
   chaque visite. Sur ce site, cela représente les captures des projets, le
   monogramme, les pictogrammes et le CV.

   Consigne retenue : une journée de cache ferme, puis une semaine pendant
   laquelle le navigateur affiche la copie conservée **et** la renouvelle en
   arrière-plan (`stale-while-revalidate`). Le visiteur n'attend donc jamais,
   et une image corrigée se propage en un jour au plus.

   ⚠️ Pour remplacer un fichier immédiatement, changez son nom (et sa référence
   dans `lib/data/projects.ts`) : une adresse neuve n'a aucun cache.
   ═══════════════════════════════════════════════════════════════════════════ */
const PUBLIC_ASSET_CACHE = 'public, max-age=86400, stale-while-revalidate=604800';

/** Dossiers de `public/` servis tels quels, et mis en cache à ce titre. */
const CACHED_PUBLIC_DIRECTORIES = ['/images_projets', '/images', '/logo', '/svg', '/cv'];

const nextConfig: NextConfig = {
  /* ─────────────────────────────────────────────────────────────────────────
     FORME DU BUILD
     `standalone` produit `.next/standalone/` : le serveur et les seules
     dépendances réellement atteintes par le code, prêts à être copiés dans une
     image Docker (voir Dockerfile). Vercel n'en a aucun usage — la plateforme
     découpe elle-même l'application — et cette copie lui coûterait plusieurs
     dizaines de secondes de build pour rien.
     ───────────────────────────────────────────────────────────────────────── */
  output: isVercel ? undefined : 'standalone',

  // Ne révèle pas la technologie du serveur (`X-Powered-By: Next.js`).
  poweredByHeader: false,

  /* Double exécution des composants en développement, pour révéler les effets
     qui ne supportent pas d'être rejoués : abonnement non désinscrit, minuteur
     non annulé, écouteur laissé en place. Sans aucun effet en production. */
  reactStrictMode: true,

  /* Aucun fichier de correspondance n'accompagne le JavaScript envoyé au
     navigateur : le code source du site n'est pas publié. À passer
     temporairement à `true` seulement pour déboguer une erreur qu'on ne
     reproduit qu'en production. */
  productionBrowserSourceMaps: false,

  /* Le build échoue à la moindre erreur de types. C'est la valeur par défaut :
     elle est écrite ici pour qu'on ne la désactive pas « juste pour déployer »
     un jour de hâte. */
  typescript: { ignoreBuildErrors: false },

  /* ─────────────────────────────────────────────────────────────────────────
     DÉPENDANCES LAISSÉES HORS DU PAQUET SERVEUR
     `nodemailer` ouvre des connexions réseau et charge certains de ses modules
     par des chemins calculés à l'exécution. Compilé avec le reste du serveur,
     ces chemins peuvent se perdre — et la panne n'apparaîtrait qu'au premier
     message envoyé depuis le formulaire, en production. Déclaré ici, il reste
     un module Node ordinaire, simplement recopié dans le paquet autonome.
     ───────────────────────────────────────────────────────────────────────── */
  serverExternalPackages: ['nodemailer'],

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ 4. MOTEUR D'IMAGES
     ─────────────────────────────────────────────────────────────────────────
     `next/image` retaille et reconvertit les images à la demande, puis
     conserve le résultat. Chaque combinaison (fichier, largeur, qualité) est
     un calcul : sur Vercel il est décompté du quota gratuit, sur un petit
     serveur il occupe le processeur et le disque. Les réglages ci-dessous
     ramènent le nombre de combinaisons possibles à celles qui servent
     réellement.
     ═══════════════════════════════════════════════════════════════════════ */
  images: {
    /* Largeurs proposées aux images qui suivent la largeur de l'écran. Les
       deux plus grandes valeurs par défaut (2048 et 3840) ont été retirées :
       aucune source du site ne dépasse 1600 px de large, ces largeurs ne
       produiraient donc que des copies de la même image. Le `srcset` de chaque
       balise est d'autant plus court, sur une page qui en compte des dizaines. */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],

    /* Largeurs proposées aux images de taille fixe : vignettes du sommaire
       (44 px), miniatures des galeries (96 px), portrait de la page À propos
       (120 px). Les valeurs 32 et 64 ne sont jamais retenues par ces tailles,
       elles ont été retirées. */
    imageSizes: [48, 96, 128, 256, 384],

    /* Seule la qualité 75 est acceptée — la seule que le site demande. Sans
       cette liste, `/_next/image?q=…` accepterait cent qualités différentes
       pour une même image : cent calculs et cent entrées de cache à la demande
       d'un simple visiteur. C'est la valeur par défaut de Next.js 16 ; elle
       est écrite ici pour que la protection soit visible et le reste. */
    qualities: [75],

    /* Seuls ces dossiers peuvent passer par le moteur d'images. Sans cette
       liste, n'importe qui peut lui faire retailler n'importe quel fichier de
       `public/` — y compris les captures d'origine, bien plus lourdes — et
       saturer le processeur ou le quota de la plateforme.
       ⚠️ Toute nouvelle image affichée avec `next/image` doit vivre dans l'un
       de ces dossiers, faute de quoi la page échoue **au build**, avec un
       message explicite (et non en production, devant un visiteur).
       `search: ''` interdit en prime les adresses avec paramètres. */
    localPatterns: [
      { pathname: '/images_projets/**', search: '' },
      { pathname: '/images/**', search: '' },
    ],

    /* Durée pendant laquelle une image retaillée est réutilisée telle quelle
       au lieu d'être recalculée : 30 jours, contre 4 heures par défaut. Les
       captures de projets ne changent pas.
       ⚠️ Cette durée est aussi celle du cache du navigateur. Une image
       remplacée **sous le même nom** peut donc rester visible jusqu'à 30 jours
       chez un visiteur déjà venu : changez son nom de fichier pour la
       remplacer sur-le-champ. */
    minimumCacheTTL: 60 * 60 * 24 * 30,

    /* AVIF pèse environ un quart de moins que WebP, mais il est bien plus long
       à encoder. Sur Vercel, ce calcul a lieu une fois sur l'infrastructure de
       la plateforme, puis le résultat est diffusé par son réseau : le gain est
       net et gratuit pour le visiteur. Sur un petit serveur, le premier
       visiteur paierait cette attente — on s'en tient alors à WebP, qui est
       déjà le format des fichiers d'origine. */
    formats: isVercel ? ['image/avif', 'image/webp'] : ['image/webp'],

    /* Plafond du cache d'images sur disque (128 Mio) pour un serveur autonome.
       Les hébergements gratuits offrent peu d'espace, et ce cache grandit sans
       limite par défaut ; les entrées les plus anciennes sont désormais
       effacées d'elles-mêmes. Sans objet sur Vercel, qui gère son propre
       cache. */
    maximumDiskCacheSize: 128 * 1024 * 1024,
  },

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ 5. EN-TÊTES DES RÉPONSES
     ═══════════════════════════════════════════════════════════════════════ */
  async headers() {
    return [
      // Sécurité : toutes les réponses, pages comme fichiers.
      { source: '/:path*', headers: securityHeaders },
      // Cache : seulement les dossiers de fichiers publics listés plus haut.
      ...CACHED_PUBLIC_DIRECTORIES.map((directory) => ({
        source: `${directory}/:file*`,
        headers: [{ key: 'Cache-Control', value: PUBLIC_ASSET_CACHE }],
      })),
    ];
  },
};

export default withNextIntl(nextConfig);
