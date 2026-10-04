/**
 * @file lib/visual/session.ts
 * @description Accès à la régie : vérification du mot de passe et session
 * signée. **Module serveur** — il lit une variable d'environnement secrète et
 * ne doit jamais être importé par un composant client.
 *
 * @architecture
 * La page de la régie est introuvable par la navigation (dix clics sur le
 * logotype du pied de page), mais **ce secret n'est pas une protection** : une
 * adresse finit toujours par se savoir. La protection est ici.
 *
 *  1. **Le mot de passe ne quitte jamais le serveur.** Il vit dans
 *     `VISUAL_ADMIN_PASSWORD`, sans préfixe `NEXT_PUBLIC_` : il n'est donc
 *     inscrit dans aucun fichier envoyé au navigateur. Le formulaire envoie sa
 *     saisie à `/api/regie/session`, qui compare et répond oui ou non.
 *  2. **Aucun mot de passe de repli dans le code.** Si la variable manque, la
 *     régie reste fermée (`isAdminConfigured()` → `false`). Un repli écrit ici
 *     serait lisible par quiconque ouvre le dépôt.
 *  3. **La session est un jeton signé**, posé dans un cookie que JavaScript ne
 *     peut pas lire (`HttpOnly`) et que le navigateur n'envoie jamais depuis un
 *     autre site (`SameSite=Strict`). Le jeton porte sa date d'expiration et sa
 *     signature : le serveur le vérifie sans rien stocker, ce qui convient à
 *     une plateforme sans serveur où aucune mémoire n'est partagée.
 *  4. **Changer le mot de passe déconnecte tout le monde** : la clé de
 *     signature en est dérivée, les anciens jetons deviennent invalides.
 */

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/** Nom du cookie de session. */
export const SESSION_COOKIE = 'regie_session';

/** Durée d'une session : huit heures, puis le mot de passe est redemandé. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

/** Version du format de jeton : la changer invalide toutes les sessions. */
const TOKEN_VERSION = 'v1';

const sha256 = (value: string): Buffer => createHash('sha256').update(value).digest();

/** Mot de passe configuré, ou `null` s'il est absent ou vide. */
function configuredPassword(): string | null {
  const value = process.env.VISUAL_ADMIN_PASSWORD;
  return value ? value : null;
}

/** `true` si la régie peut être ouverte (le mot de passe est défini). */
export const isAdminConfigured = (): boolean => configuredPassword() !== null;

/**
 * Compare la saisie au mot de passe configuré.
 *
 * Les deux valeurs sont d'abord réduites à leur empreinte SHA-256, puis
 * comparées à **temps constant** : une comparaison ordinaire s'arrête au
 * premier caractère différent, et sa durée renseigne un attaquant patient sur
 * le nombre de caractères justes. Les empreintes ont de plus la même longueur,
 * ce qu'exige `timingSafeEqual`.
 */
export function verifyPassword(candidate: string): boolean {
  const expected = configuredPassword();
  if (expected === null) return false;
  return timingSafeEqual(sha256(candidate), sha256(expected));
}

/** Clé de signature, dérivée du mot de passe — jamais le mot de passe lui-même. */
function signingKey(): Buffer | null {
  const password = configuredPassword();
  return password === null ? null : sha256(`regie-session-key:${password}`);
}

const sign = (expiresAt: number, key: Buffer): string =>
  createHmac('sha256', key).update(`${TOKEN_VERSION}.${expiresAt}`).digest('base64url');

/** Nouveau jeton de session, ou `null` si la régie n'est pas configurée. */
export function createSessionToken(now: number = Date.now()): string | null {
  const key = signingKey();
  if (key === null) return null;

  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;
  return `${TOKEN_VERSION}.${expiresAt}.${sign(expiresAt, key)}`;
}

/** `true` si le jeton est authentique et encore valable. */
export function isValidSessionToken(token: string | undefined, now: number = Date.now()): boolean {
  const key = signingKey();
  if (key === null || !token) return false;

  const [version, rawExpiry, signature, ...rest] = token.split('.');
  if (version !== TOKEN_VERSION || !rawExpiry || !signature || rest.length > 0) return false;

  const expiresAt = Number(rawExpiry);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;

  const expected = Buffer.from(sign(expiresAt, key));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Attributs du cookie de session. */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  // En local, le site est servi en HTTP : un cookie `Secure` n'y serait jamais renvoyé.
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ GARDE-FOUS DES REQUÊTES
   Communs aux routes d'API de la régie (`app/api/regie/…`).
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * `true` si la requête vient du site lui-même.
 *
 * Défense en profondeur : `SameSite=Strict` empêche déjà un autre site
 * d'envoyer le cookie. Cette vérification refuse en plus toute requête dont
 * l'en-tête `Origin` désigne un autre hôte. Une requête sans `Origin` (outil en
 * ligne de commande) n'est pas un navigateur piégé : elle est jugée sur son
 * cookie seul.
 *
 * L'hôte attendu est lu dans `Host`, ou dans `X-Forwarded-Host` quand un
 * répartiteur de charge réécrit `Host` avant de transmettre la requête
 * (conteneur derrière un proxy). Une page piégée ne peut fixer ni l'un ni
 * l'autre : le navigateur interdit le premier, et le second déclencherait un
 * contrôle préalable (CORS) auquel ces routes ne répondent pas.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    const { host } = new URL(origin);
    return host === request.headers.get('host') || host === request.headers.get('x-forwarded-host');
  } catch {
    return false;
  }
}

/**
 * Corps de la requête, ou `null` s'il dépasse `maxBytes`.
 *
 * La taille annoncée (`Content-Length`) est contrôlée d'abord : un envoi
 * démesuré est refusé sans être lu. Elle peut toutefois être absente ou
 * fausse ; la taille réelle est donc vérifiée ensuite. Même principe que la
 * route de contact (`app/api/sendEmail/route.ts`).
 */
export async function readBoundedBody(request: Request, maxBytes: number): Promise<string | null> {
  if (Number(request.headers.get('content-length') ?? 0) > maxBytes) return null;

  const body = await request.text();
  return Buffer.byteLength(body) > maxBytes ? null : body;
}
