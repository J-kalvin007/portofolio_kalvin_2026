/**
 * @file lib/booking/contract.ts
 * @description Contrat de la demande de rendez-vous, partagé par le formulaire
 * (`BookingCalendar`) et l'API (`app/api/rendezvous/route.ts`).
 *
 * Même principe que `lib/contact.ts` : les limites et les valeurs acceptées
 * sont déclarées **une seule fois**. Un formulaire valide à l'écran l'est donc
 * aussi côté serveur, et l'inverse ne peut pas se produire.
 */

export const BOOKING_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  /** Le téléphone est facultatif ; vide, il n'est pas validé. */
  phoneMax: 32,
  subjectMin: 3,
  subjectMax: 200,
  /** Le contexte est facultatif : un créneau et un sujet suffisent à se parler. */
  messageMax: 1200,
} as const;

/**
 * Façons de se parler proposées au visiteur.
 *
 * Elles ne décrivent que des canaux que Kalvin utilise déjà et qui figurent sur
 * la page Contact : visioconférence, téléphone, WhatsApp, ou sur place à Lomé.
 */
export const MEETING_CHANNELS = ['video', 'phone', 'whatsapp', 'onsite'] as const;
export type MeetingChannel = (typeof MEETING_CHANNELS)[number];

/** Corps attendu par l'API lors d'une demande de rendez-vous. */
export interface BookingRequest {
  /** Journée du rendez-vous, `AAAA-MM-JJ`, heure de Lomé. */
  day: string;
  /** Début du rendez-vous, `HH:MM`, heure de Lomé. */
  time: string;
  name: string;
  email: string;
  phone?: string;
  channel: MeetingChannel;
  subject: string;
  message?: string;
  locale?: string;
  /** Pot de miel : voir `HONEYPOT_FIELD` dans `lib/contact.ts`. */
  website?: string;
}

/**
 * Taille maximale du corps JSON accepté par l'API, en octets.
 * Le formulaire le plus rempli tient très largement en dessous.
 */
export const BOOKING_MAX_BODY_BYTES = 12 * 1024;
