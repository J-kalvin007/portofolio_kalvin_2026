/**
 * @file lib/booking/google-calendar.ts
 * @description Lecture des plages occupées et écriture des rendez-vous dans
 * Google Agenda, **sans aucune dépendance**.
 *
 * @architecture
 * La bibliothèque officielle (`googleapis`) pèse plus de cent mégaoctets une
 * fois installée, pour deux appels HTTP. Ici, l'authentification est faite à la
 * main, avec ce que Node fournit déjà :
 *
 *  1. un jeton JWT est signé en RS256 avec la clé privée du **compte de
 *     service** (`node:crypto`) ;
 *  2. Google l'échange contre un jeton d'accès valable une heure, gardé en
 *     mémoire du module — une poignée de main pour plusieurs requêtes ;
 *  3. les deux points d'entrée REST utilisés sont appelés avec `fetch`.
 *
 * @remarks **Configuration.** Trois variables d'environnement, toutes
 * facultatives : sans elles, le site continue de fonctionner (voir
 * `isCalendarConfigured`), les créneaux ne sont simplement plus confrontés à
 * l'agenda.
 *
 * | Variable                       | Où la trouver                                   |
 * |--------------------------------|-------------------------------------------------|
 * | `GOOGLE_CALENDAR_ID`           | Agenda Google → Paramètres → Identifiant         |
 * | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Clé JSON du compte de service (`client_email`)   |
 * | `GOOGLE_PRIVATE_KEY`           | Clé JSON du compte de service (`private_key`)    |
 *
 * L'agenda doit être **partagé** avec l'adresse du compte de service, avec le
 * droit « Apporter des modifications aux événements ».
 *
 * @remarks **Pourquoi aucun invité n'est ajouté à l'événement.** Google refuse
 * qu'un compte de service invite des participants sans délégation à l'échelle
 * du domaine — une configuration réservée à Google Workspace. Les coordonnées
 * du visiteur figurent donc dans la description de l'événement, et l'e-mail de
 * notification reste la pièce maîtresse.
 */

import { createSign } from 'node:crypto';
import type { BusyInterval } from './availability';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const SCOPE = 'https://www.googleapis.com/auth/calendar';

/** Au-delà, on considère que Google ne répondra pas : mieux vaut dégrader. */
const REQUEST_TIMEOUT_MS = 8_000;

/** Marge de sécurité avant l'expiration du jeton, en secondes. */
const TOKEN_EARLY_REFRESH_SECONDS = 120;

interface Credentials {
  calendarId: string;
  clientEmail: string;
  privateKey: string;
}

/** Lit la configuration, ou `null` si elle est incomplète. */
function credentials(): Credentials | null {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!calendarId || !clientEmail || !privateKey) return null;

  return {
    calendarId,
    clientEmail,
    /* Les variables d'environnement ne transportent pas de retours à la ligne :
       la clé y est écrite avec des `\n` littéraux, qu'il faut rendre au format
       PEM avant de signer quoi que ce soit. */
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
}

/** `true` si l'agenda est branché. */
export function isCalendarConfigured(): boolean {
  return credentials() !== null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ JETON D'ACCÈS
   ═══════════════════════════════════════════════════════════════════════════ */

let cachedToken: { value: string; expiresAt: number } | null = null;

const base64url = (input: Buffer | string): string =>
  Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function accessToken(account: Credentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - TOKEN_EARLY_REFRESH_SECONDS > now) return cachedToken.value;

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: account.clientEmail,
      scope: SCOPE,
      aud: TOKEN_ENDPOINT,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(account.privateKey);
  const assertion = `${header}.${claims}.${base64url(signature)}`;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`[agenda] jeton refusé (${response.status})`);
  }

  const payload = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: payload.access_token, expiresAt: now + payload.expires_in };
  return payload.access_token;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ PLAGES OCCUPÉES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Plages occupées de l'agenda entre deux instants.
 *
 * Renvoie `null` — et non une liste vide — lorsque l'agenda n'est pas
 * configuré ou qu'il ne répond pas : l'appelant peut ainsi distinguer
 * « aucun rendez-vous » de « je ne sais pas ».
 */
export async function fetchBusy(from: number, to: number): Promise<BusyInterval[] | null> {
  const account = credentials();
  if (!account) return null;

  try {
    const token = await accessToken(account);
    const response = await fetch(`${CALENDAR_API}/freeBusy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeMin: new Date(from).toISOString(),
        timeMax: new Date(to).toISOString(),
        items: [{ id: account.calendarId }],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`freeBusy ${response.status}`);

    const payload = (await response.json()) as {
      calendars?: Record<string, { busy?: { start: string; end: string }[]; errors?: { reason: string }[] }>;
    };
    const calendar = payload.calendars?.[account.calendarId];

    // Un agenda inaccessible (non partagé avec le compte de service) répond
    // 200 avec une liste d'erreurs : c'est une absence d'information, pas une
    // absence de rendez-vous.
    if (!calendar || calendar.errors?.length) throw new Error(calendar?.errors?.[0]?.reason ?? 'agenda inaccessible');

    return (calendar.busy ?? []).map((interval) => ({
      start: Date.parse(interval.start),
      end: Date.parse(interval.end),
    }));
  } catch (error) {
    console.error('[agenda] lecture des plages occupées impossible :', error instanceof Error ? error.message : error);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CRÉATION D'UN RENDEZ-VOUS
   ═══════════════════════════════════════════════════════════════════════════ */

export interface CalendarEventInput {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  timeZone: string;
}

/**
 * Inscrit le rendez-vous dans l'agenda et renvoie son adresse, ou `null` si
 * l'agenda n'est pas branché ou refuse l'écriture.
 *
 * L'échec n'est jamais fatal : l'e-mail de demande part de toute façon, avec
 * la pièce jointe `.ics` qui permet d'ajouter le rendez-vous en un clic.
 */
export async function createEvent(event: CalendarEventInput): Promise<string | null> {
  const account = credentials();
  if (!account) return null;

  try {
    const token = await accessToken(account);
    const response = await fetch(`${CALENDAR_API}/calendars/${encodeURIComponent(account.calendarId)}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start.toISOString(), timeZone: event.timeZone },
        end: { dateTime: event.end.toISOString(), timeZone: event.timeZone },
        // Deux rappels, pour ne pas découvrir le rendez-vous en l'ouvrant.
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }, { method: 'email', minutes: 1440 }] },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`events.insert ${response.status}`);

    const payload = (await response.json()) as { htmlLink?: string };
    return payload.htmlLink ?? null;
  } catch (error) {
    console.error('[agenda] création du rendez-vous impossible :', error instanceof Error ? error.message : error);
    return null;
  }
}
