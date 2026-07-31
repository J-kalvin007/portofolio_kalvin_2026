// /**
//  * @file route.ts (API sendEmail)
//  * @description Point d'entrée Backend pour l'envoi d'e-mails sécurisé via SMTP.
//  * Traite les requêtes POST provenant de la page de contact du client.
//  * 
//  * @architecture
//  * - Reçoit le JSON depuis la page frontend.
//  * - Effectue une seconde validation de sécurité avec Zod côté serveur (Ne jamais faire confiance au frontend).
//  * - Nettoie (Sanitize) les données pour éviter l'injection de scripts XSS et de Header Injection.
//  * - Utilise `nodemailer` pour expédier le mail via le compte Gmail configuré dans `.env.local`.
//  * - Construit et envoie un e-mail HTML au design ultra-premium (Or Solaire).
//  */

// import { NextRequest, NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import { z } from 'zod';
// import { escapeHtml } from '@/lib/html-escape';
// import path from 'path';

// /**
//  * Utilitaire de sécurité : Strip Header Injection
//  * Empêche l'attaquant d'insérer des retours à la ligne illégaux (`\r\n`) 
//  * dans le sujet ou le nom pour manipuler les headers SMTP (BCC, etc.).
//  */
// function stripHeaderInjection(s: string): string {
//   return s.replace(/[\r\n]/g, ' ').trim();
// }

// /**
//  * Schéma Zod côté Serveur.
//  * Pourquoi : On duplique la logique du frontend ici car un attaquant peut contourner le navigateur 
//  * et envoyer des données corrompues directement avec cURL ou Postman.
//  */
// const contactSchema = z.object({
//   name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom est trop long'),
//   email: z.string().email('Email invalide'),
//   subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères').max(200, 'Le sujet est trop long'),
//   message: z.string().min(10, 'Le message doit contenir au moins 10 caractères').max(2000, 'Le message est trop long'),
// });

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     // 1. Validation de sécurité Zod (Lèvera une erreur si les données sont incorrectes)
//     const validatedData = contactSchema.parse(body);

//     // 2. Nettoyage strict (Sanitization)
//     // Sécurisation de l'en-tête de l'e-mail (From / Subject)
//     const safeName = stripHeaderInjection(validatedData.name).replace(/"/g, "'").slice(0, 200);
//     const safeSubject = stripHeaderInjection(validatedData.subject).slice(0, 500);

//     // Échappement HTML pour prévenir les injections XSS si le client de messagerie affiche du HTML non filtré
//     const htmlName = escapeHtml(validatedData.name);
//     const htmlEmail = escapeHtml(validatedData.email);
//     const htmlSubject = escapeHtml(validatedData.subject);
//     const htmlMessage = escapeHtml(validatedData.message);

//     // Récupération de l'origine pour générer une URL absolue pour l'image
//     const origin = request.headers.get('origin') || 'https://portofolio-kalvin-2.vercel.app';
//     const logoUrl = `${origin}/logo/kal_04_nobg.jpeg`;

//     /**
//      * 3. Création du transporteur SMTP (Nodemailer)
//      * Utilise le service sécurisé de Gmail via le port 465.
//      * Récupère les identifiants en toute sécurité depuis les variables d'environnement secrètes du serveur.
//      */
//     const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true, // `true` signifie SSL implicite pour le port 465
//       auth: {
//         user: process.env.EMAIL_HOST_USER, // Exemple: takoudjoumoisecalvin@gmail.com
//         pass: process.env.EMAIL_HOST_PASSWORD,
//       },
//     });

//     // Optionnel mais recommandé : Vérifie que le serveur SMTP est bien en ligne avant d'essayer d'envoyer
//     await transporter.verify();

//     /**
//      * 4. Envoi de l'e-mail
//      * - "from" : Expédie avec ton adresse pour s'assurer que Gmail ne rejette pas l'e-mail (Politique DMARC).
//      * - "to" : S'envoie à toi-même.
//      * - "replyTo" : L'adresse du client. Si tu cliques sur "Répondre", ça écrira directement au client.
//      */
//     await transporter.sendMail({
//       from: `"${safeName}" <${process.env.EMAIL_HOST_USER}>`,
//       to: process.env.EMAIL_HOST_USER,
//       subject: `Nouveau Message Portfolio : ${safeSubject}`,
//       text: `Vous avez reçu un nouveau message de ${validatedData.name} (${validatedData.email})\n\nSujet: ${validatedData.subject}\n\nMessage:\n${validatedData.message}`,
//       html: `
//         <!DOCTYPE html>
//         <html lang="fr">
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         </head>
//         <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 40px 20px; color: #1a1a1a;">

//           <!-- Conteneur Principal de la Carte Email -->
//           <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid #eaeaea;">

//             <!-- En-tête (Header) avec Logo et Titre Sensationnel -->
//             <div style="padding: 48px 40px 32px 40px; text-align: center; border-bottom: 1px solid #f4f4f5; background: linear-gradient(to bottom, #ffffff, #fafafa);">
//               <!-- URL absolue de l'image pour un affichage correct sur tous les clients mails -->
//               <img src="${logoUrl}" alt="Kalvin Logo" style="width: 88px; height: 88px; border-radius: 50%; object-fit: cover; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(200, 144, 10, 0.25); border: 2px solid #fff;" />
//               <h1 style="margin: 0; font-size: 26px; font-weight: 300; letter-spacing: 2px; color: #111827; text-transform: uppercase;">
//                 Nouvelle <span style="font-weight: 800; color: #C8900A;">Connexion</span>
//               </h1>
//               <p style="margin: 12px 0 0 0; font-size: 15px; color: #6b7280; font-weight: 400;">
//                 Un visiteur d'exception souhaite échanger avec vous.
//               </p>
//             </div>

//             <!-- Corps du Message (Body) -->
//             <div style="padding: 40px;">

//               <!-- Bloc d'Information de l'Expéditeur -->
//               <div style="background-color: #f9fafb; border-radius: 14px; padding: 28px; margin-bottom: 32px; border: 1px solid #f0f0f0;">
//                 <table style="width: 100%; border-collapse: collapse;">
//                   <tr>
//                     <td style="padding-bottom: 20px;">
//                       <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700;">Profil de l'expéditeur</p>
//                       <p style="margin: 6px 0 0 0; font-size: 17px; color: #111827; font-weight: 600;">${htmlName}</p>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700;">Email de contact</p>
//                       <p style="margin: 6px 0 0 0; font-size: 16px;">
//                         <a href="mailto:${encodeURIComponent(validatedData.email)}" style="color: #C8900A; text-decoration: none; font-weight: 600;">${htmlEmail}</a>
//                       </p>
//                     </td>
//                   </tr>
//                 </table>
//               </div>

//               <!-- Bloc Sujet -->
//               <div style="margin-bottom: 24px;">
//                 <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700;">Objet de la requête</p>
//                 <h2 style="margin: 8px 0 0 0; font-size: 20px; color: #111827; font-weight: 700;">${htmlSubject}</h2>
//               </div>

//               <!-- Bloc Contenu du Message -->
//               <div>
//                 <p style="margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700;">Contenu du message</p>
//                 <div style="background-color: #ffffff; padding: 28px; border-radius: 14px; border: 1px solid #e5e7eb; border-left: 4px solid #C8900A; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">
//                   <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #374151; white-space: pre-wrap;">${htmlMessage}</p>
//                 </div>
//               </div>

//               <!-- Bouton d'Action Haut de Gamme -->
//               <div style="text-align: center; margin-top: 48px;">
//                 <a href="mailto:${encodeURIComponent(validatedData.email)}" style="display: inline-block; padding: 16px 40px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 40px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(17, 24, 39, 0.2);">
//                   Répondre à ${htmlName}
//                 </a>
//               </div>

//             </div>

//             <!-- Pied de page (Footer) discret et professionnel -->
//             <div style="background-color: #f9fafb; padding: 28px; text-align: center; border-top: 1px solid #eaeaea;">
//               <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
//                 Portfolio Kalvin &copy; ${new Date().getFullYear()}
//               </p>
//               <p style="margin: 10px 0 0 0; font-size: 12px; color: #d1d5db; line-height: 1.5;">
//                 Ce message a été transmis de manière sécurisée et chiffrée depuis votre plateforme web officielle.
//               </p>
//             </div>

//           </div>
//         </body>
//         </html>
//       `,
//       replyTo: validatedData.email, // Indispensable pour que le bouton "Répondre" de Gmail fonctionne.
//     });

//     // Retourne une réponse JSON HTTP 200 (OK) au client.
//     return NextResponse.json(
//       { success: true, message: 'Message envoyé avec succès !' },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Email sending error:', error);

//     // Si Zod a détecté une faille dans la validation
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { success: false, message: 'Données invalides', errors: error.issues },
//         { status: 400 } // Bad Request
//       );
//     }

//     // Capture des autres exceptions (Erreur réseau, Serveur SMTP en panne, etc.)
//     return NextResponse.json(
//       { success: false, message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
//       { status: 500 } // Internal Server Error
//     );
//   }
// }




















/**
 * @file route.ts (API sendEmail)
 * @description Point d'entrée Backend pour l'envoi d'e-mails sécurisé via SMTP.
 * Traite les requêtes POST provenant de la page de contact du client.
 * 
 * @architecture
 * - Reçoit le JSON depuis la page frontend.
 * - Effectue une seconde validation de sécurité avec Zod côté serveur (Ne jamais faire confiance au frontend).
 * - Nettoie (Sanitize) les données pour éviter l'injection de scripts XSS et de Header Injection.
 * - Utilise `nodemailer` pour expédier le mail via le compte Gmail configuré dans `.env.local`.
 * - Construit et envoie un e-mail HTML au design ultra-premium (Or Solaire).
 */

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { z } from 'zod';
import { escapeHtml } from '@/lib/html-escape';
import { SITE_URL, SITE_NAME } from '@/lib/site';

/**
 * `nodemailer` ouvre des sockets TCP : il ne peut pas tourner sur le runtime Edge.
 * La déclaration est explicite pour qu'une migration de runtime échoue au build
 * plutôt qu'en production, à la première soumission de formulaire.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ LIMITATION DE DÉBIT
   ───────────────────────────────────────────────────────────────────────────
   Le point d'entrée était totalement ouvert. Un script trivial pouvait le
   marteler et, en quelques minutes, atteindre le quota d'envoi SMTP de Gmail
   (500 messages par jour) — quota dépassé, le compte cesse d'émettre pour
   24 heures, y compris pour votre courrier personnel.

   ⚠️ Cette implémentation garde son état en mémoire du processus. Sur une
   plateforme sans serveur, chaque instance a donc son propre compteur, et
   l'état disparaît au refroidissement. Elle arrête les floods naïfs, pas un
   attaquant déterminé. Pour une protection réelle, adosser ce compteur à un
   magasin partagé (Vercel KV, Upstash Redis) — la signature de
   `isRateLimited` est prévue pour ce remplacement.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Fenêtre d'observation glissante. */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 heure

/** Nombre de messages autorisés par adresse IP et par fenêtre. */
const RATE_LIMIT_MAX_REQUESTS = 5;

/** Au-delà de ce nombre d'IP suivies, on purge les entrées expirées. */
const RATE_LIMIT_CLEANUP_THRESHOLD = 500;

/** Horodatages des requêtes récentes, indexés par adresse IP. */
const requestTimestamps = new Map<string, number[]>();

/** Extrait l'adresse cliente derrière le proxy de la plateforme. */
function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** Purge les IP dont toutes les requêtes sont sorties de la fenêtre. */
function pruneExpiredEntries(now: number): void {
  for (const [identifier, timestamps] of requestTimestamps) {
    const stillRelevant = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (stillRelevant.length === 0) requestTimestamps.delete(identifier);
    else requestTimestamps.set(identifier, stillRelevant);
  }
}

/** Retourne `true` si l'appelant a épuisé son quota, et le délai avant réouverture. */
function isRateLimited(identifier: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  if (requestTimestamps.size > RATE_LIMIT_CLEANUP_THRESHOLD) pruneExpiredEntries(now);

  const recent = (requestTimestamps.get(identifier) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = Math.min(...recent);
    return { limited: true, retryAfterSeconds: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000) };
  }

  recent.push(now);
  requestTimestamps.set(identifier, recent);
  return { limited: false, retryAfterSeconds: 0 };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ RÉPONSES LOCALISÉES
   ───────────────────────────────────────────────────────────────────────────
   Les messages étaient renvoyés uniquement en français, et le frontend les
   affiche en priorité sur ses propres traductions
   (`result.message || t('notification.successMessage')`). Un visiteur
   anglophone lisait donc « Message envoyé avec succès ! ».

   La langue est déduite, dans l'ordre : champ `locale` du corps de requête →
   en-tête `Accept-Language` → français. Le champ est facultatif : l'ancien
   contrat de requête reste valide.
   ═══════════════════════════════════════════════════════════════════════════ */
const API_MESSAGES = {
  fr: {
    success: 'Message envoyé avec succès !',
    invalid: 'Données invalides.',
    rateLimited: 'Trop de messages envoyés. Merci de réessayer plus tard.',
    failure: "Erreur lors de l'envoi du message. Veuillez réessayer.",
    misconfigured: "Le service d'envoi est momentanément indisponible.",
  },
  en: {
    success: 'Message sent successfully.',
    invalid: 'Invalid data.',
    rateLimited: 'Too many messages sent. Please try again later.',
    failure: 'The message could not be sent. Please try again.',
    misconfigured: 'The mail service is temporarily unavailable.',
  },
} as const;

type ApiLocale = keyof typeof API_MESSAGES;

function resolveLocale(request: NextRequest, bodyLocale?: string): ApiLocale {
  if (bodyLocale && bodyLocale in API_MESSAGES) return bodyLocale as ApiLocale;

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  return acceptLanguage.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

/**
 * Utilitaire de sécurité : Strip Header Injection
 * Empêche l'attaquant d'insérer des retours à la ligne illégaux (`\r\n`) 
 * dans le sujet ou le nom pour manipuler les headers SMTP (BCC, etc.).
 */
function stripHeaderInjection(s: string): string {
  return s.replace(/[\r\n]/g, ' ').trim();
}

/**
 * Schéma Zod côté Serveur.
 * Pourquoi : On duplique la logique du frontend ici car un attaquant peut contourner le navigateur 
 * et envoyer des données corrompues directement avec cURL ou Postman.
 */
const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom est trop long'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères').max(200, 'Le sujet est trop long'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères').max(2000, 'Le message est trop long'),

  /** Langue de l'interface, facultative — voir `resolveLocale`. */
  locale: z.string().max(5).optional(),

  /**
   * Pot de miel : champ invisible que seuls les robots remplissent.
   * Facultatif côté schéma pour rester rétrocompatible ; s'il arrive rempli,
   * la requête est abandonnée en silence (voir plus bas).
   */
  website: z.string().max(0).optional().or(z.literal('')),
});

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ TRANSPORTEUR SMTP MUTUALISÉ
   ───────────────────────────────────────────────────────────────────────────
   Le transporteur était reconstruit à chaque requête, suivi d'un
   `transporter.verify()` : deux poignées de main TLS complètes avant même de
   commencer l'envoi, soit une à trois secondes ajoutées à chaque soumission.

   Ici, une seule instance est conservée dans la portée du module. Sur une
   plateforme sans serveur, cette portée survit entre deux invocations chaudes :
   la connexion est réellement réutilisée. `pool: true` maintient la session
   ouverte, les délais d'attente empêchent une fonction de rester bloquée si
   Gmail ne répond pas.
   ═══════════════════════════════════════════════════════════════════════════ */
let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.EMAIL_HOST_USER;
  const pass = process.env.EMAIL_HOST_PASSWORD;

  // Échec explicite : sans cette garde, nodemailer produisait une erreur
  // d'authentification opaque, à l'exécution, difficile à relier à un `.env`
  // incomplet sur un environnement de préversion.
  if (!user || !pass) {
    throw new Error('EMAIL_HOST_USER ou EMAIL_HOST_PASSWORD manquant dans les variables d\'environnement.');
  }

  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // `true` signifie SSL implicite pour le port 465
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

export async function POST(request: NextRequest) {
  // La locale est résolue avant tout traitement : même une erreur précoce doit
  // pouvoir répondre dans la bonne langue.
  let locale: ApiLocale = resolveLocale(request);

  try {
    /* ── 0. Quota par adresse IP ────────────────────────────────────────── */
    const { limited, retryAfterSeconds } = isRateLimited(getClientIdentifier(request));

    if (limited) {
      return NextResponse.json(
        { success: false, message: API_MESSAGES[locale].rateLimited },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds), 'Cache-Control': 'no-store' } }
      );
    }

    const body = await request.json();

    // 1. Validation de sécurité Zod (Lèvera une erreur si les données sont incorrectes)
    const validatedData = contactSchema.parse(body);
    locale = resolveLocale(request, validatedData.locale);

    /* ── 1 bis. Pot de miel ─────────────────────────────────────────────────
       Un robot remplit tous les champs qu'il trouve. On répond succès pour ne
       pas lui apprendre qu'il a été repéré, et on n'envoie rien. */
    if (validatedData.website) {
      return NextResponse.json(
        { success: true, message: API_MESSAGES[locale].success },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // 2. Nettoyage strict (Sanitization)
    // Sécurisation de l'en-tête de l'e-mail (From / Subject)
    const safeName = stripHeaderInjection(validatedData.name).replace(/"/g, "'").slice(0, 200);
    const safeSubject = stripHeaderInjection(validatedData.subject).slice(0, 500);

    // Échappement HTML pour prévenir les injections XSS si le client de messagerie affiche du HTML non filtré
    const htmlName = escapeHtml(validatedData.name);
    const htmlEmail = escapeHtml(validatedData.email);
    const htmlSubject = escapeHtml(validatedData.subject);
    const htmlMessage = escapeHtml(validatedData.message);

    /* L'en-tête `Origin` est fourni par le client : un appel forgé avec
       `Origin: https://exemple-malveillant.test` faisait charger le logo depuis
       un domaine tiers dans votre propre boîte de réception. L'URL du site est
       désormais lue côté serveur, elle n'est plus négociable. */
    const logoUrl = `${SITE_URL}/logo/kal_04_nobg.jpeg`;

    // 3. Transporteur mutualisé (voir plus haut)
    const transporter = getTransporter();

    const receivedAt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Africa/Lome',
    }).format(new Date());

    /**
     * 4. Envoi de l'e-mail
     * - "from" : Expédie avec ton adresse pour s'assurer que Gmail ne rejette pas l'e-mail (Politique DMARC).
     * - "to" : S'envoie à toi-même.
     * - "replyTo" : L'adresse du client. Si tu cliques sur "Répondre", ça écrira directement au client.
     */
    await transporter.sendMail({
      from: `"${safeName}" <${process.env.EMAIL_HOST_USER}>`,
      to: process.env.EMAIL_HOST_USER,
      subject: `Nouveau Message Portfolio : ${safeSubject}`,
      text: [
        `Nouveau message depuis le portfolio`,
        `───────────────────────────────────`,
        ``,
        `De      : ${validatedData.name} <${validatedData.email}>`,
        `Sujet   : ${validatedData.subject}`,
        `Reçu le : ${receivedAt}`,
        ``,
        `Message :`,
        validatedData.message,
        ``,
        `───────────────────────────────────`,
        `Répondre directement à cet e-mail pour joindre l'expéditeur.`,
      ].join('\n'),
      html: buildEmailHtml({ htmlName, htmlEmail, htmlSubject, htmlMessage, logoUrl, receivedAt }),
      replyTo: `"${safeName}" <${validatedData.email}>`, // Indispensable pour que le bouton "Répondre" de Gmail fonctionne.
    });

    // Retourne une réponse JSON HTTP 200 (OK) au client.
    return NextResponse.json(
      { success: true, message: API_MESSAGES[locale].success },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );

  } catch (error) {
    // Si Zod a détecté une faille dans la validation
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: API_MESSAGES[locale].invalid, errors: error.issues },
        { status: 400, headers: { 'Cache-Control': 'no-store' } } // Bad Request
      );
    }

    // Configuration serveur incomplète : le message distingué évite de faire
    // chercher une panne réseau là où il manque une variable d'environnement.
    if (error instanceof Error && error.message.includes('EMAIL_HOST_')) {
      console.error('[sendEmail] Configuration manquante :', error.message);
      return NextResponse.json(
        { success: false, message: API_MESSAGES[locale].misconfigured },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Capture des autres exceptions (Erreur réseau, Serveur SMTP en panne, etc.)
    console.error('[sendEmail] Échec de l\'envoi :', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, message: API_MESSAGES[locale].failure },
      { status: 500, headers: { 'Cache-Control': 'no-store' } } // Internal Server Error
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ GABARIT HTML DE L'E-MAIL
   ───────────────────────────────────────────────────────────────────────────
   Réécrit en tableaux imbriqués. Le rendu précédent reposait sur des `div`
   avec `max-width`, `border-radius` et `box-shadow` : Outlook pour Windows
   utilise le moteur de rendu de Word, qui ignore ces trois propriétés. La carte
   s'y affichait donc pleine largeur, à angles droits et sans relief.

   Trois ajouts qui distinguent un e-mail professionnel d'un e-mail correct :
     — un **pré-en-tête** masqué, qui contrôle la ligne d'aperçu dans la boîte
       de réception (elle affichait jusqu'ici les premiers mots trouvés au hasard) ;
     — `color-scheme: light`, qui empêche Gmail et Apple Mail d'inverser
       arbitrairement la palette en thème sombre ;
     — les attributs `width` / `height` en HTML sur l'image, qu'Outlook exige
       en plus du CSS.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Or Impérial — la teinte du mode clair, seule pertinente sur un fond d'e-mail blanc. */
const EMAIL_GOLD = '#C8900A';
const EMAIL_INK = '#111827';
const EMAIL_MUTED = '#9ca3af';
const EMAIL_SURFACE = '#f9fafb';
const EMAIL_CANVAS = '#f4f6f9';

function buildEmailHtml({
  htmlName,
  htmlEmail,
  htmlSubject,
  htmlMessage,
  logoUrl,
  receivedAt,
}: {
  htmlName: string;
  htmlEmail: string;
  htmlSubject: string;
  htmlMessage: string;
  logoUrl: string;
  receivedAt: string;
}): string {
  /** Style commun à toutes les étiquettes de section. */
  const labelStyle = `margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${EMAIL_MUTED};font-weight:700;`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Nouveau message depuis le portfolio</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_CANVAS};color:${EMAIL_INK};-webkit-font-smoothing:antialiased;">

  <!-- Pré-en-tête : contrôle la ligne d'aperçu affichée dans la liste des messages. -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${EMAIL_CANVAS};opacity:0;">
    ${htmlName} — ${htmlSubject}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${EMAIL_CANVAS};">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- Carte principale — 600 px, la largeur sûre sur tous les clients -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:20px;border:1px solid #eaeaea;overflow:hidden;">

          <!-- En-tête -->
          <tr>
            <td align="center" style="padding:48px 40px 32px 40px;background-color:#fafafa;border-bottom:1px solid #f4f4f5;">
              <img src="${logoUrl}" alt="" width="88" height="88" style="display:block;width:88px;height:88px;border-radius:50%;object-fit:cover;margin:0 auto 24px auto;border:2px solid #ffffff;" />
              <h1 style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:26px;font-weight:300;letter-spacing:2px;color:${EMAIL_INK};text-transform:uppercase;">
                Nouvelle <span style="font-weight:800;color:${EMAIL_GOLD};">Connexion</span>
              </h1>
              <p style="margin:12px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#6b7280;">
                Un visiteur souhaite échanger avec vous.
              </p>
              <p style="margin:6px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:${EMAIL_MUTED};">
                ${receivedAt}
              </p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:40px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

              <!-- Profil de l'expéditeur -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${EMAIL_SURFACE};border-radius:14px;border:1px solid #f0f0f0;">
                <tr>
                  <td style="padding:28px 28px 20px 28px;">
                    <p style="${labelStyle}">Profil de l'expéditeur</p>
                    <p style="margin:6px 0 0 0;font-size:17px;color:${EMAIL_INK};font-weight:600;">${htmlName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px 28px;">
                    <p style="${labelStyle}">Email de contact</p>
                    <p style="margin:6px 0 0 0;font-size:16px;">
                      <!-- encodeURIComponent transformait l'arobase en %40 :
                           l'adresse restait cliquable mais arrivait déformée
                           dans certains clients. -->
                      <a href="mailto:${htmlEmail}" style="color:${EMAIL_GOLD};text-decoration:none;font-weight:600;">${htmlEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Objet -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:32px 0 0 0;">
                    <p style="${labelStyle}">Objet de la requête</p>
                    <h2 style="margin:8px 0 0 0;font-size:20px;color:${EMAIL_INK};font-weight:700;">${htmlSubject}</h2>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 0 0 0;">
                    <p style="${labelStyle}margin-bottom:12px;">Contenu du message</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#ffffff;padding:28px;border-radius:14px;border:1px solid #e5e7eb;border-left:4px solid ${EMAIL_GOLD};">
                    <p style="margin:0;font-size:15px;line-height:1.8;color:#374151;white-space:pre-wrap;">${htmlMessage}</p>
                  </td>
                </tr>
              </table>

              <!-- Action -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:48px 0 0 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" bgcolor="${EMAIL_INK}" style="border-radius:40px;">
                          <a href="mailto:${htmlEmail}?subject=${encodeURIComponent('Re: ')}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;border-radius:40px;font-weight:600;font-size:15px;letter-spacing:0.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                            Répondre à ${htmlName}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td align="center" style="background-color:${EMAIL_SURFACE};padding:28px;border-top:1px solid #eaeaea;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <p style="margin:0;font-size:12px;color:${EMAIL_MUTED};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
                ${SITE_NAME} &copy; ${new Date().getFullYear()}
              </p>
              <p style="margin:10px 0 0 0;font-size:12px;color:#d1d5db;line-height:1.5;">
                Message transmis depuis le formulaire de contact de votre site.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}