/**
 * @file proxy.ts
 * @description Intercepteur de requêtes (anciennement `middleware.ts`).
 *
 * @architecture
 * Next.js 16 renomme la convention `middleware` en `proxy` : l'ancien nom reste
 * pris en charge mais déclenche un avertissement de dépréciation à chaque build.
 * Deux rôles, dans cet ordre :
 *
 *  1. **Domaine canonique** — une requête arrivée sur le sous-domaine Vercel est
 *     renvoyée en 308 vers le domaine du portfolio (voir plus bas) ;
 *  2. **Langue** — le middleware de next-intl détecte la langue, redirige `/`
 *     vers `/fr` (ou `/en` selon le navigateur) et ajoute le préfixe de langue
 *     aux URL qui n'en ont pas (`/propos` → `/fr/propos`).
 */

import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { CANONICAL_HOST } from './lib/site';

const handleLocale = createMiddleware(routing);

/**
 * Suffixe des adresses attribuées par Vercel.
 *
 * @remarks **Pourquoi la redirection ne vise que ce suffixe.**
 * Rediriger dès que l'hôte diffère du domaine canonique serait plus court — et
 * casserait tout le reste : `localhost:3000` en développement, `127.0.0.1` dans
 * les suites de tests, l'adresse interne d'un conteneur derrière un répartiteur
 * de charge, et toute future adresse de secours. On ne vise donc que le cas réel
 * à traiter : le sous-domaine `*.vercel.app`, qui sert le même site et se
 * retrouve indexé en double.
 */
const VERCEL_DOMAIN_SUFFIX = '.vercel.app';

/**
 * 308 vers le domaine canonique, ou `null` s'il n'y a rien à faire.
 *
 * **308 et non 302** : seule une redirection permanente transmet l'antériorité
 * de référencement acquise par l'ancienne adresse. Et 308 plutôt que 301 parce
 * qu'elle garantit que la méthode HTTP est conservée — une requête `POST` vers
 * une route d'API ne se transformerait pas en `GET` si le cas se présentait.
 */
function canonicalRedirect(request: NextRequest): NextResponse | null {
  const host = request.headers.get('host') ?? '';
  if (!host.endsWith(VERCEL_DOMAIN_SUFFIX) || host === CANONICAL_HOST) return null;

  const destination = new URL(request.url);
  destination.protocol = 'https:';
  destination.host = CANONICAL_HOST;
  destination.port = '';

  return NextResponse.redirect(destination, 308);
}

export default function proxy(request: NextRequest) {
  return canonicalRedirect(request) ?? handleLocale(request);
}

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
  //
  // Conséquence pour la redirection de domaine : `robots.txt` et `sitemap.xml`
  // restent servis par le sous-domaine Vercel. Ce n'est pas un défaut — leur
  // contenu est construit à partir de `SITE_URL`, donc ils y annoncent déjà le
  // domaine canonique et son plan de site, ce qui est exactement le signal
  // attendu.
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
