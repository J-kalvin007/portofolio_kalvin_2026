/**
 * @file route.ts (API regie/session)
 * @description Ouverture et fermeture de la session de la régie.
 *
 *  - `POST`   — reçoit le mot de passe saisi, le compare **sur le serveur**, et
 *               pose le cookie de session s'il est juste.
 *  - `DELETE` — efface le cookie (déconnexion).
 *
 * @architecture Toute la logique de vérification et de signature vit dans
 * `lib/visual/session.ts`. Cette route ne fait que l'habiller : quota de
 * tentatives, lecture bornée du corps, réponses sans détail exploitable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clientIdentifier, createRateLimiter } from '@/lib/rate-limit';
import {
  SESSION_COOKIE,
  createSessionToken,
  isAdminConfigured,
  isSameOrigin,
  readBoundedBody,
  sessionCookieOptions,
  verifyPassword,
} from '@/lib/visual/session';

/** `node:crypto` n'existe pas sur le runtime Edge. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Huit tentatives par quart d'heure et par adresse IP. Un mot de passe ne se
 * devine pas en huit essais, et quelqu'un qui se trompe de touche n'est pas
 * bloqué pour autant. (Limites de ce compteur en mémoire : `lib/rate-limit.ts`.)
 */
const limiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8 });

/** Un mot de passe tient en quelques dizaines d'octets : au-delà, ce n'en est pas un. */
const MAX_BODY_BYTES = 2 * 1024;

const NO_STORE = { 'Cache-Control': 'no-store' };

const reply = (body: { ok: boolean; message?: string }, status: number, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return reply({ ok: false, message: 'Requête refusée.' }, 403);

  if (!isAdminConfigured()) {
    return reply({ ok: false, message: 'La régie n’est pas configurée : la variable VISUAL_ADMIN_PASSWORD est absente.' }, 503);
  }

  const { limited, retryAfterSeconds } = limiter.check(clientIdentifier(request));
  if (limited) {
    return reply({ ok: false, message: 'Trop de tentatives. Réessayez dans quelques minutes.' }, 429, { 'Retry-After': String(retryAfterSeconds) });
  }

  const rawBody = await readBoundedBody(request, MAX_BODY_BYTES);
  if (rawBody === null) return reply({ ok: false, message: 'Requête refusée.' }, 413);

  let password: unknown;
  try {
    password = (JSON.parse(rawBody) as { password?: unknown }).password;
  } catch {
    return reply({ ok: false, message: 'Requête illisible.' }, 400);
  }

  // Une seule réponse pour « champ absent » et « mot de passe faux » : rien ne
  // distingue les deux aux yeux de qui essaie.
  if (typeof password !== 'string' || !verifyPassword(password)) {
    return reply({ ok: false, message: 'Mot de passe incorrect.' }, 401);
  }

  const token = createSessionToken();
  if (token === null) return reply({ ok: false, message: 'La régie n’est pas configurée.' }, 503);

  const response = reply({ ok: true }, 200);
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return reply({ ok: false, message: 'Requête refusée.' }, 403);

  const response = reply({ ok: true }, 200);
  // Même chemin et mêmes attributs qu'à la pose : sans cela, le navigateur
  // considère qu'il s'agit d'un autre cookie et garde l'ancien.
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
