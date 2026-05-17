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
import { z } from 'zod';
import { escapeHtml } from '@/lib/html-escape';
import path from 'path';

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
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validation de sécurité Zod (Lèvera une erreur si les données sont incorrectes)
    const validatedData = contactSchema.parse(body);
    
    // 2. Nettoyage strict (Sanitization)
    // Sécurisation de l'en-tête de l'e-mail (From / Subject)
    const safeName = stripHeaderInjection(validatedData.name).replace(/"/g, "'").slice(0, 200);
    const safeSubject = stripHeaderInjection(validatedData.subject).slice(0, 500);
    
    // Échappement HTML pour prévenir les injections XSS si le client de messagerie affiche du HTML non filtré
    const htmlName = escapeHtml(validatedData.name);
    const htmlEmail = escapeHtml(validatedData.email);
    const htmlSubject = escapeHtml(validatedData.subject);
    const htmlMessage = escapeHtml(validatedData.message);

    /**
     * 3. Création du transporteur SMTP (Nodemailer)
     * Utilise le service sécurisé de Gmail via le port 465.
     * Récupère les identifiants en toute sécurité depuis les variables d'environnement secrètes du serveur.
     */
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // `true` signifie SSL implicite pour le port 465
      auth: {
        user: process.env.EMAIL_HOST_USER, // Exemple: takoudjoumoisecalvin@gmail.com
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
    });

    // Optionnel mais recommandé : Vérifie que le serveur SMTP est bien en ligne avant d'essayer d'envoyer
    await transporter.verify();

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
      text: `Vous avez reçu un nouveau message de ${validatedData.name} (${validatedData.email})\n\nSujet: ${validatedData.subject}\n\nMessage:\n${validatedData.message}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 40px 20px; color: #1a1a1a;">
          
          <!-- Conteneur Principal de la Carte Email -->
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid #eaeaea;">
            
            <!-- En-tête (Header) avec Logo et Titre Sensationnel -->
            <div style="padding: 48px 40px 32px 40px; text-align: center; border-bottom: 1px solid #f4f4f5; background: linear-gradient(to bottom, #ffffff, #fafafa);">
              <!-- Utilisation du Content-ID (cid) pour intégrer l'image m4.jpg attachée au mail -->
              <img src="cid:logo_kalvin" alt="Kalvin Logo" style="width: 88px; height: 88px; border-radius: 50%; object-fit: cover; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(200, 144, 10, 0.25); border: 2px solid #fff;" />
              <h1 style="margin: 0; font-size: 26px; font-weight: 300; letter-spacing: 2px; color: #111827; text-transform: uppercase;">
                Nouvelle <span style="font-weight: 800; color: #C8900A;">Connexion</span>
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 15px; color: #6b7280; font-weight: 400;">
                Un visiteur d'exception souhaite échanger avec vous.
              </p>
            </div>

            <!-- Corps du Message (Body) -->
            <div style="padding: 40px;">
              
              <!-- Bloc d'Information de l'Expéditeur -->
              <div style="background-color: #f9fafb; border-radius: 14px; padding: 28px; margin-bottom: 32px; border: 1px solid #f0f0f0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700;">Profil de l'expéditeur</p>
                      <p style="margin: 6px 0 0 0; font-size: 17px; color: #111827; font-weight: 600;">${htmlName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700;">Email de contact</p>
                      <p style="margin: 6px 0 0 0; font-size: 16px;">
                        <a href="mailto:${encodeURIComponent(validatedData.email)}" style="color: #C8900A; text-decoration: none; font-weight: 600;">${htmlEmail}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Bloc Sujet -->
              <div style="margin-bottom: 24px;">
                <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700;">Objet de la requête</p>
                <h2 style="margin: 8px 0 0 0; font-size: 20px; color: #111827; font-weight: 700;">${htmlSubject}</h2>
              </div>

              <!-- Bloc Contenu du Message -->
              <div>
                <p style="margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700;">Contenu du message</p>
                <div style="background-color: #ffffff; padding: 28px; border-radius: 14px; border: 1px solid #e5e7eb; border-left: 4px solid #C8900A; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">
                  <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #374151; white-space: pre-wrap;">${htmlMessage}</p>
                </div>
              </div>
              
              <!-- Bouton d'Action Haut de Gamme -->
              <div style="text-align: center; margin-top: 48px;">
                <a href="mailto:${encodeURIComponent(validatedData.email)}" style="display: inline-block; padding: 16px 40px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 40px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(17, 24, 39, 0.2);">
                  Répondre à ${htmlName}
                </a>
              </div>

            </div>

            <!-- Pied de page (Footer) discret et professionnel -->
            <div style="background-color: #f9fafb; padding: 28px; text-align: center; border-top: 1px solid #eaeaea;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                Portfolio Kalvin &copy; ${new Date().getFullYear()}
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #d1d5db; line-height: 1.5;">
                Ce message a été transmis de manière sécurisée et chiffrée depuis votre plateforme web officielle.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
      replyTo: validatedData.email, // Indispensable pour que le bouton "Répondre" de Gmail fonctionne.
      attachments: [
        {
          filename: 'm4.jpg',
          // Utilisation du chemin absolu sur le serveur Node.js / Next.js
          path: path.join(process.cwd(), 'public', 'images', 'm4.jpg'),
          cid: 'logo_kalvin' // Identifiant utilisé dans <img src="cid:logo_kalvin">
        }
      ]
    });

    // Retourne une réponse JSON HTTP 200 (OK) au client.
    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès !' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email sending error:', error);

    // Si Zod a détecté une faille dans la validation
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Données invalides', errors: error.issues },
        { status: 400 } // Bad Request
      );
    }

    // Capture des autres exceptions (Erreur réseau, Serveur SMTP en panne, etc.)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
      { status: 500 } // Internal Server Error
    );
  }
}
