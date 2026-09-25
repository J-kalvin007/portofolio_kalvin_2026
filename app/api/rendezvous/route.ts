/**
 * @file app/api/rendezvous/route.ts
 * @description Demandes de rendez-vous : lecture des créneaux libres (GET) et
 * réservation (POST).
 *
 * @architecture
 * Tout le calcul des disponibilités vit **ici**, côté serveur. Le navigateur ne
 * reçoit qu'une liste de créneaux libres : il n'a aucune règle à appliquer,
 * aucun fuseau à convertir, et il ne peut donc rien proposer qui n'existe pas.
 *
 * La source des plages occupées est Google Agenda (`lib/booking/google-calendar`).
 * Si l'agenda n'est pas branché ou ne répond pas, la page continue de
 * fonctionner : les créneaux sont alors ceux des règles seules, et la demande
 * reste une **demande**, confirmée par Kalvin — c'est ce que dit la page.
 *
 * Un rendez-vous accepté produit trois choses, dans cet ordre :
 *  1. un événement dans l'agenda (si branché) — ce qui rend le créneau occupé
 *     pour le visiteur suivant, sans base de données ;
 *  2. un e-mail à Kalvin, avec le fichier `.ics` en pièce jointe ;
 *  3. le même `.ics` renvoyé au visiteur, qui peut l'ajouter à son agenda.
 *
 * @remarks Le créneau est **revérifié avant écriture**. Une page laissée
 * ouverte une heure affiche des créneaux qui ne sont peut-être plus libres ;
 * sans cette vérification, deux visiteurs pourraient réserver le même.
 */

import { NextResponse, type NextRequest } from 'next/server';
import nodemailer, { type Transporter } from 'nodemailer';
import { z } from 'zod';
import { escapeHtml } from '@/lib/html-escape';
import { CONTACT, SITE_NAME, SITE_URL } from '@/lib/site';
import { clientIdentifier, createRateLimiter } from '@/lib/rate-limit';
import { EMAIL_PATTERN, HONEYPOT_FIELD } from '@/lib/contact';
import {
  BOOKING_RULES,
  SLOT_MS,
  bookingWindow,
  freeSlots,
  isSlotBookable,
  slotInstant,
  type BusyInterval,
} from '@/lib/booking/availability';
import { BOOKING_LIMITS, BOOKING_MAX_BODY_BYTES, MEETING_CHANNELS, type MeetingChannel } from '@/lib/booking/contract';
import { buildInvite } from '@/lib/booking/ics';
import { fetchBusy, createEvent } from '@/lib/booking/google-calendar';

/** `nodemailer` et `node:crypto` ouvrent des sockets : runtime Node obligatoire. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ QUOTAS
   Une demande de rendez-vous est un geste rare : trois par heure et par adresse
   suffisent largement, là où le formulaire de contact en tolère cinq.
   ═══════════════════════════════════════════════════════════════════════════ */
const limiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3 });

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ PLAGES OCCUPÉES, EN CACHE COURT
   ───────────────────────────────────────────────────────────────────────────
   Le calendrier interroge cette route à chaque ouverture de page et à chaque
   changement de mois. Sans ce cache, chaque visiteur déclencherait un appel à
   Google : soixante secondes suffisent à absorber une rafale de visites tout en
   restant fidèle à l'agenda.
   ═══════════════════════════════════════════════════════════════════════════ */
const BUSY_CACHE_MS = 60_000;
let busyCache: { at: number; busy: BusyInterval[] | null } | null = null;

async function busyIntervals(from: number, to: number): Promise<BusyInterval[] | null> {
  if (busyCache && Date.now() - busyCache.at < BUSY_CACHE_MS) return busyCache.busy;

  const busy = await fetchBusy(from, to);
  busyCache = { at: Date.now(), busy };
  return busy;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ RÉPONSES LOCALISÉES
   ═══════════════════════════════════════════════════════════════════════════ */
const API_MESSAGES = {
  fr: {
    success: 'Demande envoyée. Vous recevrez la confirmation sous 24 heures.',
    invalid: 'Données invalides.',
    taken: 'Ce créneau vient d’être réservé. Choisissez-en un autre.',
    rateLimited: 'Trop de demandes envoyées. Merci de réessayer plus tard.',
    tooLarge: 'La demande envoyée est trop volumineuse.',
    failure: 'Erreur lors de l’envoi de la demande. Veuillez réessayer.',
    misconfigured: 'Le service de rendez-vous est momentanément indisponible.',
  },
  en: {
    success: 'Request sent. You will receive confirmation within 24 hours.',
    invalid: 'Invalid data.',
    taken: 'That slot has just been taken. Please choose another one.',
    rateLimited: 'Too many requests sent. Please try again later.',
    tooLarge: 'The submitted request is too large.',
    failure: 'The request could not be sent. Please try again.',
    misconfigured: 'The booking service is temporarily unavailable.',
  },
} as const;

type ApiLocale = keyof typeof API_MESSAGES;

/** Libellés des canaux, pour l'e-mail et l'événement d'agenda. */
const CHANNEL_LABELS: Record<MeetingChannel, { fr: string; en: string }> = {
  video: { fr: 'Visioconférence', en: 'Video call' },
  phone: { fr: 'Appel téléphonique', en: 'Phone call' },
  whatsapp: { fr: 'WhatsApp', en: 'WhatsApp' },
  onsite: { fr: `Sur place · ${CONTACT.city}`, en: `On site · ${CONTACT.city}` },
};

function resolveLocale(request: NextRequest, bodyLocale?: string): ApiLocale {
  if (bodyLocale && bodyLocale in API_MESSAGES) return bodyLocale as ApiLocale;

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  return acceptLanguage.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ GET — les créneaux libres
   ═══════════════════════════════════════════════════════════════════════════ */

export async function GET() {
  const { from, to } = bookingWindow();
  const busy = await busyIntervals(from, to);

  return json(
    {
      timeZone: BOOKING_RULES.timeZone,
      slotMinutes: BOOKING_RULES.slotMinutes,
      noticeHours: BOOKING_RULES.noticeHours,
      /** `true` si les créneaux tiennent compte de l'agenda réel. */
      synced: busy !== null,
      days: freeSlots(busy ?? [], Date.now()),
    },
    200,
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ POST — réserver un créneau
   ═══════════════════════════════════════════════════════════════════════════ */

const bookingSchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  name: z.string().min(BOOKING_LIMITS.nameMin).max(BOOKING_LIMITS.nameMax),
  email: z.string().regex(EMAIL_PATTERN),
  phone: z.string().max(BOOKING_LIMITS.phoneMax).optional(),
  channel: z.enum(MEETING_CHANNELS),
  subject: z.string().min(BOOKING_LIMITS.subjectMin).max(BOOKING_LIMITS.subjectMax),
  message: z.string().max(BOOKING_LIMITS.messageMax).optional(),
  locale: z.string().max(5).optional(),
  /* Pot de miel : accepté, jamais refusé — un robot ne doit pas apprendre
     qu'il a été repéré (même raisonnement que la route de contact). */
  [HONEYPOT_FIELD]: z.string().max(500).optional(),
});

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.EMAIL_HOST_USER;
  const pass = process.env.EMAIL_HOST_PASSWORD;
  if (!user || !pass) throw new Error('EMAIL_HOST_USER ou EMAIL_HOST_PASSWORD manquant dans les variables d\'environnement.');

  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return cachedTransporter;
}

/** Retire tout retour à la ligne d'une valeur destinée à un en-tête SMTP. */
const stripHeaderInjection = (value: string) => value.replace(/[\r\n]/g, ' ').trim();

export async function POST(request: NextRequest) {
  let locale: ApiLocale = resolveLocale(request);

  try {
    /* ── 0. Quota ────────────────────────────────────────────────────────── */
    const { limited, retryAfterSeconds } = limiter.check(clientIdentifier(request));
    if (limited) {
      return json({ success: false, message: API_MESSAGES[locale].rateLimited }, 429, {
        'Retry-After': String(retryAfterSeconds),
      });
    }

    /* ── 1. Corps borné, puis JSON valide ────────────────────────────────── */
    if (Number(request.headers.get('content-length') ?? 0) > BOOKING_MAX_BODY_BYTES) {
      return json({ success: false, message: API_MESSAGES[locale].tooLarge }, 413);
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody) > BOOKING_MAX_BODY_BYTES) {
      return json({ success: false, message: API_MESSAGES[locale].tooLarge }, 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json({ success: false, message: API_MESSAGES[locale].invalid }, 400);
    }

    if (body && typeof body === 'object' && 'locale' in body && typeof body.locale === 'string') {
      locale = resolveLocale(request, body.locale);
    }

    const data = bookingSchema.parse(body);

    /* ── 2. Pot de miel : succès silencieux ──────────────────────────────── */
    if (data[HONEYPOT_FIELD]) {
      return json({ success: true, message: API_MESSAGES[locale].success }, 200);
    }

    /* ── 3. Le créneau est-il encore libre ? ───────────────────────────────
       Lecture **sans cache** : à l'instant d'écrire, une minute de retard
       suffirait à laisser deux visiteurs réserver le même créneau. Le cache de
       soixante secondes reste réservé à l'affichage, où il absorbe les rafales
       de visites sans conséquence. */
    const { from, to } = bookingWindow();
    const busy = await fetchBusy(from, to);
    if (!isSlotBookable(data.day, data.time, busy ?? [], Date.now())) {
      return json({ success: false, message: API_MESSAGES[locale].taken }, 409);
    }

    /* ── 4. Mise en forme du rendez-vous ─────────────────────────────────── */
    const start = new Date(slotInstant(data.day, data.time));
    const end = new Date(start.getTime() + SLOT_MS);
    const channelLabel = CHANNEL_LABELS[data.channel][locale];

    const format = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { timeZone: BOOKING_RULES.timeZone, ...options }).format(start);
    const longDate = format({ dateStyle: 'full' });
    const clock = `${data.time}–${new Intl.DateTimeFormat('fr-FR', { timeZone: BOOKING_RULES.timeZone, hour: '2-digit', minute: '2-digit' }).format(end)}`;

    const safeName = stripHeaderInjection(data.name).replace(/"/g, "'").slice(0, 200);
    const safeSubject = stripHeaderInjection(data.subject).slice(0, 300);

    const details = [
      `${longDate} · ${clock} (${BOOKING_RULES.timeZone}, UTC+0)`,
      `${channelLabel}`,
      ``,
      `${data.name} <${data.email}>`,
      data.phone ? `Téléphone : ${data.phone}` : null,
      ``,
      `Sujet : ${data.subject}`,
      data.message ? `\n${data.message}` : null,
    ]
      .filter((line) => line !== null)
      .join('\n');

    /* ── 5. Agenda : l'événement occupe le créneau pour les suivants ─────── */
    const eventLink = await createEvent({
      summary: `Rendez-vous · ${safeName}`,
      description: `${details}\n\nDemandé depuis ${SITE_URL}`,
      start,
      end,
      timeZone: BOOKING_RULES.timeZone,
    });

    /* ── 6. Invitation .ics, pour Kalvin et pour le visiteur ─────────────── */
    const invite = buildInvite({
      uid: `${data.day}-${data.time.replace(':', '')}-${Buffer.from(data.email).toString('hex').slice(0, 12)}@kalvin-takoudjou`,
      start,
      end,
      summary: locale === 'en' ? `Meeting · ${safeName}` : `Rendez-vous · ${safeName}`,
      description: details,
      location: channelLabel,
      organizerEmail: CONTACT.email,
      organizerName: SITE_NAME,
    });

    /* ── 7. E-mail : la pièce maîtresse, toujours envoyée ────────────────── */
    await getTransporter().sendMail({
      from: `"${safeName}" <${process.env.EMAIL_HOST_USER}>`,
      to: process.env.EMAIL_HOST_USER,
      replyTo: `"${safeName}" <${data.email}>`,
      subject: `Rendez-vous demandé · ${longDate} à ${data.time} · ${safeSubject}`,
      text: [
        'Demande de rendez-vous',
        '──────────────────────',
        '',
        details,
        '',
        eventLink ? `Ajouté à votre agenda : ${eventLink}` : 'Agenda non branché : le rendez-vous n’a pas été inscrit automatiquement.',
        '',
        'Répondre directement à cet e-mail pour joindre le demandeur.',
      ].join('\n'),
      html: buildBookingEmail({
        name: escapeHtml(data.name),
        email: escapeHtml(data.email),
        phone: data.phone ? escapeHtml(data.phone) : null,
        subject: escapeHtml(data.subject),
        message: data.message ? escapeHtml(data.message) : null,
        channel: escapeHtml(channelLabel),
        longDate: escapeHtml(longDate),
        clock: escapeHtml(clock),
        eventLink,
      }),
      attachments: [{ filename: 'rendez-vous.ics', content: invite, contentType: 'text/calendar; charset=utf-8; method=PUBLISH' }],
    });

    // Le cache des plages occupées est périmé : le créneau vient d'être pris.
    busyCache = null;

    return json({ success: true, message: API_MESSAGES[locale].success, invite }, 200);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ success: false, message: API_MESSAGES[locale].invalid }, 400);
    }

    if (error instanceof Error && error.message.includes('EMAIL_HOST_')) {
      console.error('[rendezvous] configuration manquante :', error.message);
      return json({ success: false, message: API_MESSAGES[locale].misconfigured }, 503);
    }

    console.error('[rendezvous] échec :', error instanceof Error ? error.message : error);
    return json({ success: false, message: API_MESSAGES[locale].failure }, 500);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ E-MAIL — le billet de rendez-vous
   ───────────────────────────────────────────────────────────────────────────
   Tableaux imbriqués et styles en ligne : Outlook pour Windows rend le HTML
   avec le moteur de Word, qui ignore `border-radius`, `box-shadow` et la
   plupart des mises en page modernes. Le pré-en-tête masqué contrôle la ligne
   d'aperçu affichée dans la boîte de réception.
   ═══════════════════════════════════════════════════════════════════════════ */

function buildBookingEmail(fields: {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string | null;
  channel: string;
  longDate: string;
  clock: string;
  eventLink: string | null;
}): string {
  const INK = '#11161d';
  const MUTED = '#5a636e';
  const LINE = '#c9ced4';
  const BRAND = '#1f3bcc';

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px dashed ${LINE};font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:${MUTED};font-weight:700;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px dashed ${LINE};font-size:14px;color:${INK};vertical-align:top;">${value}</td>
    </tr>`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Demande de rendez-vous</title>
</head>
<body style="margin:0;padding:0;background:#eef0ef;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${fields.longDate} à ${fields.clock} — ${fields.name}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0ef;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#fbfbf8;border:1px solid ${LINE};">
          <tr>
            <td style="padding:22px 26px 0;">
              <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};font-weight:700;">Demande de rendez-vous</p>
              <p style="margin:10px 0 0;font-size:24px;line-height:1.2;font-weight:800;color:${INK};">${fields.longDate}</p>
              <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:${BRAND};">${fields.clock} · ${fields.channel}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 26px 6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row('Demandeur', `${fields.name}<br /><a href="mailto:${fields.email}" style="color:${BRAND};">${fields.email}</a>`)}
                ${fields.phone ? row('Téléphone', fields.phone) : ''}
                ${row('Sujet', fields.subject)}
                ${fields.message ? row('Contexte', fields.message.replace(/\n/g, '<br />')) : ''}
                ${row('Agenda', fields.eventLink
                  ? `<a href="${fields.eventLink}" style="color:${BRAND};">Ouvrir l’événement</a>`
                  : 'Non inscrit automatiquement — voir la pièce jointe')}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 26px 24px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
                Répondez directement à cet e-mail pour confirmer au demandeur.
                La pièce jointe <strong style="color:${INK};">rendez-vous.ics</strong> ajoute le créneau à n’importe quel agenda.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:14px 0 0;font-size:11px;color:${MUTED};">${SITE_NAME} · ${SITE_URL}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
