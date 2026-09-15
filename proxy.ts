/**
 * @file proxy.ts
 * @description Intercepteur de requêtes (anciennement `middleware.ts`).
 *
 * @architecture
 * Next.js 16 renomme la convention `middleware` en `proxy` : l'ancien nom reste
 * pris en charge mais déclenche un avertissement de dépréciation à chaque build.
 * Le rôle est inchangé : le middleware de next-intl détecte la langue, redirige
 * `/` vers `/fr` (ou `/en` selon le navigateur) et ajoute le préfixe de langue
 * aux URL qui n'en ont pas (`/propos` → `/fr/propos`).
 */

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Exclut les routes d'API, les fichiers internes de Next.js et tout chemin
  // contenant un point (fichiers statiques : images, robots.txt, sitemap.xml…).
  //
  // ⚠️ Le double antislash est indispensable : dans la chaîne JavaScript, `\\.`
  // devient `\.` dans l'expression régulière, soit un point littéral. Avec un
  // seul antislash, le point redevient « n'importe quel caractère » et
  // `.*..*` exclut TOUT chemin de deux caractères ou plus : le proxy ne
  // s'exécutait plus que sur `/`, et `/propos` répondait 404 au lieu de
  // rediriger vers `/fr/propos`.
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
