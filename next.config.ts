import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDevelopment = process.env.NODE_ENV === 'development';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ POLITIQUE DE SÉCURITÉ DU CONTENU (CSP)
   ───────────────────────────────────────────────────────────────────────────
   Chaque directive restreint ce que le navigateur accepte de charger ou
   d'exécuter. Tout est limité à l'origine du site (`'self'`) : le projet
   n'utilise aucun script, police ni API tiers (les polices Google sont
   auto-hébergées par next/font au moment du build).

   ⚖️ Compromis assumé : `'unsafe-inline'` pour les scripts et les styles.
   Next.js injecte des scripts en ligne (données de rendu React), le layout
   contient le script anti-flash du thème, et framer-motion anime via des
   attributs `style`. L'alternative stricte — un nonce par requête — impose
   un rendu dynamique de chaque page et supprimerait la génération statique
   (SSG) qui rend ce site rapide. Pour un portfolio sans contenu saisi par des
   tiers, le gain ne justifie pas ce coût. La politique bloque néanmoins tout
   script d'une autre origine, les plugins, l'intégration du site dans une
   autre page et l'envoi de formulaires vers un domaine externe.

   En développement uniquement : `'unsafe-eval'` (rechargement à chaud de React)
   et `ws:` (connexion du serveur de développement).
   ═══════════════════════════════════════════════════════════════════════════ */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDevelopment ? ' ws:' : ''}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ EN-TÊTES DE SÉCURITÉ — appliqués à toutes les réponses
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
  // HTTPS obligatoire pendant 2 ans une fois le site visité en HTTPS
  // (ignoré par les navigateurs sur http://localhost). `preload` n'est pas
  // ajouté : c'est un engagement à déclarer volontairement sur hstspreload.org.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  // Build autonome, copié tel quel dans l'image Docker (voir Dockerfile).
  output: 'standalone',

  // Ne révèle pas la technologie du serveur (`X-Powered-By: Next.js`).
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
