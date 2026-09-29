/**
 * @file lib/booking/availability.ts
 * @description Règles de disponibilité pour les rendez-vous, et calcul des
 * créneaux qui en découlent.
 *
 * @architecture
 * Ce module est **pur** : aucune entrée/sortie, aucune dépendance au réseau ni
 * à la base. Il transforme des règles (jours ouvrés, heures, durée) en une
 * liste de créneaux, puis retire ceux qu'un agenda déclare occupés. Le calcul
 * est fait **côté serveur uniquement** : le navigateur reçoit une liste de
 * créneaux libres, jamais les règles — il n'a donc rien à recalculer, et rien
 * ne peut diverger entre les deux.
 *
 * @remarks **Le fuseau de Lomé (UTC+0) ne connaît pas d'heure d'été.**
 * C'est ce qui rend ce fichier simple et sûr : une heure locale est aussi une
 * heure UTC, et aucun créneau ne peut se dédoubler ni disparaître deux fois par
 * an. Le décalage est déclaré explicitement (`UTC_OFFSET_MINUTES`) plutôt que
 * supposé : si les disponibilités changeaient un jour de fuseau, une seule
 * valeur serait à revoir, et les commentaires disent où.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ RÈGLES — le seul endroit à modifier pour changer ses disponibilités
   ═══════════════════════════════════════════════════════════════════════════ */

export const BOOKING_RULES = {
  /** Fuseau affiché au visiteur. Lomé : UTC+0 toute l'année. */
  timeZone: 'Africa/Lome',
  /** Décalage de ce fuseau, en minutes. Voir la remarque en tête de fichier. */
  utcOffsetMinutes: 0,

  /** Jours ouverts, au format `Date.getUTCDay()` : 1 = lundi … 5 = vendredi. */
  openDays: [1, 2, 3, 4, 5] as readonly number[],

  /** Première et dernière minute de la journée, en minutes depuis minuit. */
  dayStartMinutes: 9 * 60,
  dayEndMinutes: 17 * 60,

  /** Durée d'un rendez-vous, et pas de la grille des créneaux. */
  slotMinutes: 45,

  /**
   * Délai minimal entre la demande et le rendez-vous.
   *
   * Sans lui, un visiteur pourrait réserver le créneau qui commence dans dix
   * minutes, alors que la demande doit encore être lue et confirmée.
   */
  noticeHours: 24,

  /** Horizon de réservation, en jours : au-delà, plus rien n'est proposé. */
  horizonDays: 45,
} as const;

/** Durée d'un rendez-vous en millisecondes. */
export const SLOT_MS = BOOKING_RULES.slotMinutes * 60_000;

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Intervalle occupé, tel que le renvoie un agenda. */
export interface BusyInterval {
  /** Début, en millisecondes depuis l'époque. */
  start: number;
  /** Fin, exclue. */
  end: number;
}

/**
 * Créneaux libres, groupés par journée.
 * Clés : `2026-10-06`. Valeurs : heures locales `09:00`, dans l'ordre.
 */
export type FreeSlots = Record<string, string[]>;

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ OUTILS DE DATE
   Tous s'appuient sur les méthodes UTC : le fuseau visé n'ayant aucun décalage
   ni heure d'été, l'heure UTC **est** l'heure de Lomé. Le décalage déclaré
   dans les règles est néanmoins appliqué, pour que le jour où il change, le
   calcul reste juste.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Instant correspondant à une heure locale donnée. */
function instantOf(dayKey: string, minutesFromMidnight: number): number {
  const [year, month, day] = dayKey.split('-').map(Number);
  return Date.UTC(year, month - 1, day, 0, minutesFromMidnight - BOOKING_RULES.utcOffsetMinutes, 0, 0);
}

/** Clé de journée (`2026-10-06`) d'un instant, dans le fuseau des règles. */
export function dayKeyOf(instant: number): string {
  const local = new Date(instant + BOOKING_RULES.utcOffsetMinutes * 60_000);
  return [
    local.getUTCFullYear(),
    String(local.getUTCMonth() + 1).padStart(2, '0'),
    String(local.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

/** Heure locale (`09:45`) d'un instant. */
export function timeOf(instant: number): string {
  const local = new Date(instant + BOOKING_RULES.utcOffsetMinutes * 60_000);
  return [
    String(local.getUTCHours()).padStart(2, '0'),
    String(local.getUTCMinutes()).padStart(2, '0'),
  ].join(':');
}

/** Instant du créneau décrit par une journée et une heure locale. */
export function slotInstant(dayKey: string, time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return instantOf(dayKey, hours * 60 + minutes);
}

/** `true` si la chaîne est une journée valide au format `AAAA-MM-JJ`. */
export function isDayKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** `true` si la chaîne est une heure valide au format `HH:MM`. */
export function isTimeKey(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ FENÊTRE DE RÉSERVATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Premier et dernier instant réservables, compte tenu du préavis et de
 * l'horizon. C'est aussi la fenêtre interrogée auprès de l'agenda.
 */
export function bookingWindow(now: number = Date.now()): { from: number; to: number } {
  return {
    from: now + BOOKING_RULES.noticeHours * 3_600_000,
    to: now + BOOKING_RULES.horizonDays * 86_400_000,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CALCUL DES CRÉNEAUX
   ═══════════════════════════════════════════════════════════════════════════ */

/** Tous les débuts de créneau d'une journée, quels qu'ils soient. */
function slotsOfDay(dayKey: string): number[] {
  const slots: number[] = [];
  const last = BOOKING_RULES.dayEndMinutes - BOOKING_RULES.slotMinutes;

  for (let minute = BOOKING_RULES.dayStartMinutes; minute <= last; minute += BOOKING_RULES.slotMinutes) {
    slots.push(instantOf(dayKey, minute));
  }

  return slots;
}

/** `true` si le créneau chevauche l'un des intervalles occupés. */
function overlapsBusy(start: number, busy: readonly BusyInterval[]): boolean {
  const end = start + SLOT_MS;
  // Deux intervalles se chevauchent dès que chacun commence avant la fin de
  // l'autre ; la borne de fin est exclue, deux rendez-vous peuvent donc
  // s'enchaîner exactement.
  return busy.some((interval) => start < interval.end && interval.start < end);
}

/**
 * Créneaux libres de la fenêtre de réservation, une fois retirés :
 * les jours fermés, les créneaux trop proches, ceux au-delà de l'horizon, et
 * tout ce que l'agenda déclare occupé.
 */
export function freeSlots(busy: readonly BusyInterval[] = [], now: number = Date.now()): FreeSlots {
  const { from, to } = bookingWindow(now);
  const result: FreeSlots = {};

  // On parcourt les journées de la fenêtre, une par une, depuis celle du
  // premier instant réservable.
  for (let cursor = from; cursor <= to; cursor += 86_400_000) {
    const dayKey = dayKeyOf(cursor);
    if (result[dayKey]) continue;

    const weekday = new Date(instantOf(dayKey, 0)).getUTCDay();
    if (!BOOKING_RULES.openDays.includes(weekday)) continue;

    const open = slotsOfDay(dayKey).filter(
      (start) => start >= from && start + SLOT_MS <= to && !overlapsBusy(start, busy),
    );

    if (open.length > 0) result[dayKey] = open.map(timeOf);
  }

  return result;
}

/**
 * `true` si ce créneau précis est réservable maintenant : sur la grille, dans
 * un jour ouvert, dans la fenêtre, et libre.
 *
 * Le formulaire le vérifie déjà à l'écran ; l'API le revérifie avant d'écrire
 * quoi que ce soit — une page laissée ouverte une heure propose des créneaux
 * qui ne sont peut-être plus libres.
 */
export function isSlotBookable(
  dayKey: string,
  time: string,
  busy: readonly BusyInterval[] = [],
  now: number = Date.now(),
): boolean {
  if (!isDayKey(dayKey) || !isTimeKey(time)) return false;
  return (freeSlots(busy, now)[dayKey] ?? []).includes(time);
}
