/**
 * @file lib/mailer.ts
 * @description Envoi des e-mails du site, par l'un ou l'autre transport.
 *
 * @architecture
 * Les deux formulaires (message et rendez-vous) appellent `sendMail`. Le choix
 * du transport se fait **à la configuration**, jamais dans les routes :
 *
 *  1. `BREVO_API_KEY` présente → **l'API HTTP de Brevo**. Une seule requête
 *     HTTPS, une réponse en quelques centaines de millisecondes.
 *  2. Sinon, `EMAIL_HOST_USER` + `EMAIL_HOST_PASSWORD` → **SMTP** (Gmail), par
 *     nodemailer, avec une connexion gardée ouverte dans la portée du module.
 *  3. Sinon → `MailerNotConfiguredError`, que les routes traduisent en « service
 *     momentanément indisponible » (503).
 *
 * @remarks **Pourquoi deux transports plutôt qu'un.**
 * Le SMTP est parfait sur un serveur qui tourne en continu : la connexion se
 * réutilise, la latence disparaît. Sur une plateforme sans serveur, il est
 * fragile pour trois raisons mesurables :
 *
 *  - chaque invocation froide refait une poignée de main TLS **et** une
 *    authentification, soit une à trois secondes avant le premier octet utile,
 *    sur une fonction dont le temps d'exécution est plafonné ;
 *  - Google refuse régulièrement les connexions venues d'adresses de centres de
 *    données (`535-5.7.8 Username and Password not accepted`), même avec un mot
 *    de passe d'application valide ;
 *  - le quota d'envoi de Gmail (500 messages par jour) s'applique au compte
 *    personnel tout entier.
 *
 * L'API HTTP n'a aucun de ces trois problèmes : elle est conçue pour être
 * appelée depuis un centre de données. Le site garde donc les deux, et prend
 * celui qui est configuré.
 *
 * @remarks **Configuration de Brevo.** Créer un compte (offre gratuite :
 * 300 e-mails par jour), valider l'adresse d'expédition — celle de
 * `EMAIL_HOST_USER` — dans *Expéditeurs et adresses IP*, puis créer une clé
 * d'API v3 et la poser dans `BREVO_API_KEY`.
 */

import nodemailer, { type Transporter } from 'nodemailer';

/** Adresse d'expédition **et** de réception : Kalvin s'écrit à lui-même. */
const mailbox = () => process.env.EMAIL_HOST_USER;

/** Levée quand aucun transport n'est configuré : la route répond alors 503. */
export class MailerNotConfiguredError extends Error {
  constructor() {
    super("Aucun transport d'e-mail configuré : définir BREVO_API_KEY, ou EMAIL_HOST_USER et EMAIL_HOST_PASSWORD.");
    this.name = 'MailerNotConfiguredError';
  }
}

export interface MailAttachment {
  filename: string;
  /** Contenu textuel du fichier (le transport se charge de l'encodage). */
  content: string;
  contentType: string;
}

export interface MailMessage {
  /** Nom affiché de l'expéditeur — le visiteur, pour que la boîte le montre. */
  senderName: string;
  subject: string;
  text: string;
  html: string;
  /** Adresse à laquelle « Répondre » doit écrire. */
  replyTo?: { name: string; email: string };
  attachments?: MailAttachment[];
}

/** Transport retenu, pour les journaux et les vérifications. */
export type MailTransport = 'brevo' | 'smtp' | 'none';

export function mailTransport(): MailTransport {
  if (process.env.BREVO_API_KEY && mailbox()) return 'brevo';
  if (mailbox() && process.env.EMAIL_HOST_PASSWORD) return 'smtp';
  return 'none';
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ TRANSPORT 1 — API HTTP (Brevo)
   ═══════════════════════════════════════════════════════════════════════════ */

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const BREVO_TIMEOUT_MS = 8_000;

async function sendWithBrevo(message: MailMessage, apiKey: string, address: string): Promise<void> {
  const response = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: message.senderName, email: address },
      to: [{ email: address }],
      replyTo: message.replyTo ? { name: message.replyTo.name, email: message.replyTo.email } : undefined,
      subject: message.subject,
      textContent: message.text,
      htmlContent: message.html,
      attachment: message.attachments?.map((file) => ({
        name: file.filename,
        content: Buffer.from(file.content, 'utf8').toString('base64'),
      })),
    }),
    signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
  });

  if (!response.ok) {
    // Le corps porte le motif exact du refus (expéditeur non validé, clé
    // révoquée, quota atteint) : il part au journal, jamais au visiteur.
    const detail = await response.text().catch(() => '');
    throw new Error(`[mailer] Brevo a refusé l'envoi (${response.status}) ${detail.slice(0, 300)}`);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ TRANSPORT 2 — SMTP (Gmail)
   ───────────────────────────────────────────────────────────────────────────
   Une seule instance dans la portée du module : sur une plateforme sans
   serveur, cette portée survit entre deux invocations chaudes, et la connexion
   est réellement réutilisée.
   ═══════════════════════════════════════════════════════════════════════════ */

let cachedTransporter: Transporter | null = null;

function transporter(address: string, password: string): Transporter {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL implicite sur le port 465
    auth: { user: address, pass: password },
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return cachedTransporter;
}

async function sendWithSmtp(message: MailMessage, address: string, password: string): Promise<void> {
  await transporter(address, password).sendMail({
    // L'expéditeur reste l'adresse du compte : envoyer au nom du visiteur ferait
    // échouer la politique DMARC de son domaine. Son nom s'affiche, son adresse
    // est dans `replyTo`.
    from: `"${message.senderName}" <${address}>`,
    to: address,
    replyTo: message.replyTo ? `"${message.replyTo.name}" <${message.replyTo.email}>` : undefined,
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: message.attachments?.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
    })),
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ POINT D'ENTRÉE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Envoie un message à la boîte de Kalvin par le transport configuré.
 *
 * @throws {MailerNotConfiguredError} si aucun transport n'est configuré.
 * @throws {Error} si le transport refuse l'envoi.
 */
export async function sendMail(message: MailMessage): Promise<MailTransport> {
  const address = mailbox();
  const apiKey = process.env.BREVO_API_KEY;
  const password = process.env.EMAIL_HOST_PASSWORD;

  if (!address || (!apiKey && !password)) throw new MailerNotConfiguredError();

  if (apiKey) {
    await sendWithBrevo(message, apiKey, address);
    return 'brevo';
  }

  await sendWithSmtp(message, address, password as string);
  return 'smtp';
}
