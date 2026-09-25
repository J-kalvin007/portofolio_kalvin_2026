/**
 * @file lib/booking/ics.ts
 * @description Fabrique un fichier `.ics` — le format d'échange de rendez-vous
 * que comprennent Google Agenda, Outlook, Apple Calendrier et les autres.
 *
 * @architecture
 * Aucune bibliothèque : le format est un texte de quelques lignes, à condition
 * de respecter trois règles que les implémentations naïves oublient et qui
 * rendent le fichier illisible pour Outlook :
 *
 *  1. **les lignes se terminent par `CRLF`**, jamais par un simple saut ;
 *  2. **les caractères `\ ; , ` et les retours à la ligne s'échappent** dans
 *     les valeurs textuelles ;
 *  3. **une ligne ne dépasse pas 75 octets** : au-delà, elle est repliée et la
 *     suite commence par une espace.
 */

/** Échappe une valeur textuelle (RFC 5545, § 3.3.11). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Replie une ligne trop longue. La mesure est faite en **octets** : un accent
 * compte double en UTF-8, et une coupe au mauvais endroit casserait le
 * caractère.
 */
function fold(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const parts: string[] = [];
  let cursor = 0;
  let limit = 75;

  while (cursor < bytes.length) {
    let end = Math.min(cursor + limit, bytes.length);
    // On recule tant qu'on tomberait au milieu d'un caractère multi-octet.
    while (end > cursor && end < bytes.length && (bytes[end] & 0b1100_0000) === 0b1000_0000) end--;
    parts.push(bytes.subarray(cursor, end).toString('utf8'));
    cursor = end;
    limit = 74; // les lignes suivantes commencent par une espace
  }

  return parts.join('\r\n ');
}

/** Horodatage au format `AAAAMMJJTHHMMSSZ`. */
const stamp = (date: Date): string => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export interface CalendarInvite {
  /** Identifiant stable du rendez-vous. */
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
  /** Adresse affichée comme organisateur du rendez-vous. */
  organizerEmail: string;
  organizerName: string;
}

/** Contenu complet d'un fichier `.ics` pour un rendez-vous. */
export function buildInvite(invite: CalendarInvite): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kalvin Takoudjou//Portfolio//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${invite.uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(invite.start)}`,
    `DTEND:${stamp(invite.end)}`,
    `SUMMARY:${escapeText(invite.summary)}`,
    `DESCRIPTION:${escapeText(invite.description)}`,
    `LOCATION:${escapeText(invite.location)}`,
    `ORGANIZER;CN=${escapeText(invite.organizerName)}:mailto:${invite.organizerEmail}`,
    'STATUS:TENTATIVE',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(invite.summary)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.map(fold).join('\r\n') + '\r\n';
}
