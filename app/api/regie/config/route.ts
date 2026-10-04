/**
 * @file route.ts (API regie/config)
 * @description Lecture et enregistrement de la configuration visuelle publiée.
 *
 *  - `GET` — la configuration en vigueur et le type de stockage.
 *  - `PUT` — enregistre une configuration, puis fait régénérer les pages.
 *
 * Les deux méthodes exigent une session valide : la configuration publiée est
 * visible de tous dans le HTML du site, mais seule la régie peut la modifier.
 *
 * @architecture **La configuration reçue n'est jamais enregistrée telle quelle.**
 * Elle passe par `unwrapVisualConfig` → `sanitizeVisualConfig`, qui borne chaque
 * nombre, vérifie chaque couleur et écarte tout champ inconnu. Ce qui est écrit
 * dans le stockage — et injecté ensuite dans une feuille de style — est donc
 * toujours une configuration que le serveur a lui-même reconstruite.
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { clientIdentifier, createRateLimiter } from '@/lib/rate-limit';
import { VISUAL_CONFIG_MAX_BYTES, unwrapVisualConfig } from '@/lib/visual/config';
import { SESSION_COOKIE, isSameOrigin, isValidSessionToken, readBoundedBody } from '@/lib/visual/session';
import {
  VISUAL_CONFIG_TAG,
  VisualStorageUnavailableError,
  readPublishedVisualConfig,
  visualStorageKind,
  writePublishedVisualConfig,
} from '@/lib/visual/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Trente enregistrements par minute : largement plus qu'une main ne peut en faire. */
const limiter = createRateLimiter({ windowMs: 60 * 1000, max: 30 });

const NO_STORE = { 'Cache-Control': 'no-store' };

const reply = (body: Record<string, unknown>, status: number, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });

const hasSession = (request: NextRequest): boolean => isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value);

/** Réponse commune à toute requête sans session valide. */
const unauthorized = () => reply({ ok: false, message: 'Session expirée. Reconnectez-vous.' }, 401);

export async function GET(request: NextRequest) {
  if (!hasSession(request)) return unauthorized();

  return reply({ ok: true, config: await readPublishedVisualConfig({ fresh: true }), storage: visualStorageKind() }, 200);
}

export async function PUT(request: NextRequest) {
  if (!isSameOrigin(request)) return reply({ ok: false, message: 'Requête refusée.' }, 403);
  if (!hasSession(request)) return unauthorized();

  const { limited, retryAfterSeconds } = limiter.check(clientIdentifier(request));
  if (limited) {
    return reply({ ok: false, message: 'Trop d’enregistrements. Patientez un instant.' }, 429, { 'Retry-After': String(retryAfterSeconds) });
  }

  const rawBody = await readBoundedBody(request, VISUAL_CONFIG_MAX_BYTES);
  if (rawBody === null) return reply({ ok: false, message: 'Configuration trop volumineuse.' }, 413);

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return reply({ ok: false, message: 'Configuration illisible.' }, 400);
  }

  const config = unwrapVisualConfig(body);

  try {
    await writePublishedVisualConfig(config);
  } catch (error) {
    if (error instanceof VisualStorageUnavailableError) {
      console.error('[regie] Enregistrement impossible :', error.message);
      return reply({ ok: false, message: error.message }, 503);
    }
    console.error('[regie] Échec de l’enregistrement :', error instanceof Error ? error.message : error);
    return reply({ ok: false, message: 'L’enregistrement a échoué. Réessayez.' }, 500);
  }

  /* Les pages sont pré-rendues avec la configuration : il faut les périmer.
      - l'étiquette vise la lecture mise en cache (magasin Upstash) ; `expire: 0`
        la rend caduque tout de suite, la prochaine visite relit la valeur ;
      - le chemin vise les pages elles-mêmes, quel que soit le magasin. */
  revalidateTag(VISUAL_CONFIG_TAG, { expire: 0 });
  revalidatePath('/', 'layout');

  return reply({ ok: true, config, storage: visualStorageKind() }, 200);
}
