'use server';

/**
 * @file mail.ts
 * @description Utilitaire serveur (Server Action / Server-side) pour l'envoi d'e-mails.
 * 
 * @architecture
 * - Utilise `nodemailer` pour se connecter au serveur SMTP (ici Gmail).
 * - Implémente des fonctions utilitaires pour nettoyer les données entrantes et éviter
 *   les attaques par injection de headers (Header Injection).
 * - Formate les e-mails avec un template HTML "Premium" (similaire à l'UI du site).
 * - Échappe les caractères HTML (`escapeHtml`) pour prévenir les attaques XSS.
 * 
 * @security
 * - Fonctionne uniquement côté serveur (`'use server'`) pour protéger les identifiants SMTP.
 * - Validation stricte des variables d'environnement (`GMAIL_USERNAME`, `GMAIL_PASSWORD`).
 */

import nodemailer from 'nodemailer';
import { escapeHtml } from '@/lib/html-escape';

/**
 * @function stripHeaderInjection
 * @description Nettoie les chaînes de caractères (noms, objets) pour empêcher un attaquant
 * de forger de faux en-têtes (Bcc, Cc, etc.) en injectant des sauts de ligne.
 */
function stripHeaderInjection(s: string): string {
  return s.replace(/[\r\n]/g, ' ').trim();
}

type EmailResponse = { success: boolean; message: string };

/* ═══════════════════════════════════════════════
   ENVOI D'E-MAIL DE CONTACT (Depuis le portfolio)
   ═══════════════════════════════════════════════ */

/**
 * @function sendContactEmail
 * @description Envoie un e-mail au propriétaire du portfolio lorsqu'un visiteur remplit le formulaire de contact.
 * 
 * @param sender Informations du visiteur (Nom, Email, Message)
 * @param recipient Adresse e-mail de réception (L'e-mail de l'ingénieur)
 */
export async function sendContactEmail(
  sender: { name: string; email: string; message: string },
  recipient: string
): Promise<EmailResponse> {
  // 1. Validation basique des champs
  if (!sender.name || !sender.email || !sender.message || !recipient) {
    return { success: false, message: 'Tous les champs sont obligatoires' };
  }

  // 2. Validation stricte du format de l'e-mail (Regex de base)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sender.email) || !emailRegex.test(recipient)) {
    return { success: false, message: 'Format d’email invalide' };
  }

  // 3. Vérification de la présence des variables d'environnement critiques
  if (!process.env.GMAIL_USERNAME || !process.env.GMAIL_PASSWORD) {
    return { success: false, message: 'Configuration serveur incomplète' };
  }

  // 4. Initialisation du transporteur SMTP (Nodemailer)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true pour le port 465, false pour les autres ports (587 utilise STARTTLS)
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  try {
    // 5. Nettoyage et Échappement des entrées utilisateurs (Sanitization anti-XSS et anti-Injection)
    const safeFromName = stripHeaderInjection(sender.name).replace(/"/g, "'").slice(0, 200);
    const htmlName = escapeHtml(sender.name);
    const htmlEmail = escapeHtml(sender.email);
    const htmlMessage = escapeHtml(sender.message);

    // 6. Construction du Template HTML (Design moderne, fond sombre/clair)
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Inter', sans-serif; background: #f4f6f9; padding: 20px;">
          <div style="max-width:600px; margin:0 auto; background:white; border-radius:24px; overflow:hidden; box-shadow:0 20px 40px -10px rgba(0,0,0,0.15);">
            <div style="background:#0a0a0a; padding:32px 24px; text-align:center; color:white;">
              <h1 style="margin:0; font-size:28px;">📬 Nouveau message</h1>
              <p style="color:#a0a0a0;">Quelqu'un souhaite vous contacter</p>
            </div>
            <div style="padding:40px 32px;">
              <div style="background:#f9fafb; border-radius:20px; padding:24px; margin-bottom:24px;">
                <p><strong>Nom :</strong> ${htmlName}</p>
                <p><strong>Email :</strong> ${htmlEmail}</p>
              </div>
              <div style="border:1px solid #eaeef2; border-radius:20px; padding:24px;">
                <h3 style="margin-top:0;">Message</h3>
                <p style="white-space:pre-wrap;">${htmlMessage}</p>
              </div>
              <div style="text-align:center; margin-top:32px;">
                <a href="mailto:${encodeURIComponent(sender.email)}" style="display:inline-block; background:#0a0a0a; color:white; padding:14px 32px; border-radius:40px; text-decoration:none;">✉️ Répondre</a>
              </div>
            </div>
            <div style="background:#f9fafb; padding:24px; text-align:center; color:#6b7280; font-size:13px;">
              <p>© ${new Date().getFullYear()} Kalvin — Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 7. Envoi de l'e-mail via SMTP
    await transporter.sendMail({
      from: `"${safeFromName}" <${process.env.GMAIL_USERNAME}>`, // Masque d'expédition
      to: recipient, // Destinataire final (l'ingénieur)
      subject: stripHeaderInjection(`Nouveau message de ${sender.name} via votre portfolio`).slice(0, 998),
      html,
      replyTo: sender.email, // Permet de répondre directement à l'expéditeur en cliquant sur "Répondre" dans Gmail
    });

    return { success: true, message: 'Message envoyé avec succès' };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, message: "Erreur lors de l'envoi" };
  } finally {
    // 8. Fermeture systématique du pool de connexions SMTP
    transporter.close();
  }
}

/* ═══════════════════════════════════════════════
   MÉTHODES OPTIONNELLES
   ═══════════════════════════════════════════════ */

/**
 * @function sendWelcomeEmail
 * @description Placeholder pour une future fonctionnalité (ex: envoyer un accusé de réception automatique au visiteur).
 */
export async function sendWelcomeEmail(): Promise<EmailResponse> {
  // Implémentation future...
  return { success: true, message: 'OK' };
}