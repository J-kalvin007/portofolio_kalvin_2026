'use client';

/**
 * @file BookingCalendar.tsx
 * @description Prise de rendez-vous : un calendrier, les créneaux du jour
 * choisi, et le formulaire de demande — en trois temps numérotés.
 *
 * @architecture
 * **Le navigateur ne connaît aucune règle de disponibilité.** Il demande à
 * l'API (`/api/rendezvous`) la liste des créneaux libres et se contente de
 * l'afficher : les jours absents de cette liste sont grisés, sans que le
 * client ait à convertir un fuseau ni à deviner une heure de fermeture. Rien
 * ne peut donc diverger entre ce qui est proposé et ce qui est acceptable.
 *
 * La liste est relue à l'ouverture de la page et après chaque demande : un
 * créneau réservé — ici ou ailleurs dans l'agenda de Kalvin — disparaît du
 * calendrier sans rechargement.
 *
 * @remarks **Les heures sont celles de Lomé (UTC+0).** Un visiteur dans un
 * autre fuseau voit en plus l'heure qu'il sera chez lui : c'est la question
 * qu'il se poserait sinon, et la réponse dépend de son propre navigateur.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type RegisterOptions } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarCheck2, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Loader2, XCircle } from 'lucide-react';
import { BOOKING_LIMITS, MEETING_CHANNELS, type MeetingChannel } from '@/lib/booking/contract';
import { EMAIL_PATTERN, HONEYPOT_FIELD } from '@/lib/contact';
import { padNumber } from '@/lib/format';
import { BUTTON_PRIMARY, OVERLINE } from '@/components/ui/styles';
import './booking.css';

/** Réponse de `GET /api/rendezvous`. */
interface Availability {
  timeZone: string;
  slotMinutes: number;
  noticeHours: number;
  /** `true` si les créneaux tiennent compte de l'agenda réel. */
  synced: boolean;
  /** Créneaux libres par journée : `{ '2026-10-06': ['09:00', …] }`. */
  days: Record<string, string[]>;
}

interface BookingFields {
  name: string;
  email: string;
  phone?: string;
  channel: MeetingChannel;
  subject: string;
  message?: string;
  [HONEYPOT_FIELD]?: string;
}

/** Créneau confirmé, tel que l'API le renvoie. */
interface Confirmation {
  day: string;
  time: string;
  /** Contenu du fichier `.ics`, proposé au visiteur en téléchargement. */
  invite: string;
}

const FIELD =
  'w-full rounded-control border bg-canvas px-4 py-3 text-body text-ink placeholder:text-ink-faint ' +
  'transition-[border-color,box-shadow] duration-(--motion-fast) ' +
  'focus:border-focus focus:outline-none focus:ring-3 focus:ring-focus/20 ' +
  'aria-invalid:border-danger aria-invalid:focus:ring-danger/20 ' +
  'aria-[invalid=false]:border-line aria-[invalid=false]:hover:border-line-strong';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ OUTILS DE DATE
   Toutes les dates du calendrier sont construites en UTC : Lomé n'a aucun
   décalage ni heure d'été, l'heure UTC **est** l'heure locale de Kalvin. Le
   fuseau du visiteur ne peut donc pas décaler la grille d'un jour.
   ═══════════════════════════════════════════════════════════════════════════ */

const dayKey = (date: Date): string =>
  [date.getUTCFullYear(), padNumber(date.getUTCMonth() + 1), padNumber(date.getUTCDate())].join('-');

/** Instant précis d'un créneau (Lomé = UTC). */
const instantOf = (day: string, time: string): number => Date.parse(`${day}T${time}:00Z`);

/** Lundi de la semaine contenant cette date, en UTC. */
function mondayOf(date: Date): Date {
  const copy = new Date(date);
  // `getUTCDay()` : 0 = dimanche. On ramène dimanche en fin de semaine.
  const shift = (copy.getUTCDay() + 6) % 7;
  copy.setUTCDate(copy.getUTCDate() - shift);
  return copy;
}

export default function BookingCalendar() {
  const t = useTranslations('contact_page.booking');
  const tValidation = useTranslations('contact_page.validation');
  const locale = useLocale();

  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [monthCursor, setMonthCursor] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  /* ── Disponibilités ─────────────────────────────────────────────────────
     Relues à l'ouverture, puis après chaque demande acceptée. */
  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/rendezvous', { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: Availability) => {
        setAvailability(data);
        setLoadFailed(false);
        // Le calendrier s'ouvre sur le mois du premier créneau libre : c'est
        // la seule page où le visiteur n'a rien à chercher.
        const first = Object.keys(data.days).sort()[0];
        setMonthCursor(first ? new Date(`${first}T00:00:00Z`) : new Date());
      })
      .catch((error) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setLoadFailed(true);
      });

    return () => controller.abort();
  }, [reloadToken]);

  /* Mémorisé : sans cela, l'objet vide de repli serait neuf à chaque rendu et
     ferait recalculer les mois ouverts pour rien. */
  const days = useMemo(() => availability?.days ?? {}, [availability]);
  const slotsOfSelectedDay = selectedDay ? (days[selectedDay] ?? []) : [];

  /* ── Grille du mois affiché ─────────────────────────────────────────────
     Six semaines complètes, toujours : la hauteur du calendrier ne saute pas
     d'un mois à l'autre. */
  const weeks = useMemo(() => {
    if (!monthCursor) return [];

    const firstOfMonth = new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth(), 1));
    const start = mondayOf(firstOfMonth);

    return Array.from({ length: 6 }, (_, week) =>
      Array.from({ length: 7 }, (_, weekday) => {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + week * 7 + weekday);
        return date;
      }),
    );
  }, [monthCursor]);

  /** Mois ouverts à la navigation : ceux qui contiennent au moins un créneau. */
  const openMonths = useMemo(() => {
    const months = new Set<string>();
    for (const day of Object.keys(days)) months.add(day.slice(0, 7));
    return [...months].sort();
  }, [days]);

  const monthKey = monthCursor ? dayKey(monthCursor).slice(0, 7) : '';
  const monthIndex = openMonths.indexOf(monthKey);
  const previousMonth = monthIndex > 0 ? openMonths[monthIndex - 1] : null;
  const nextMonth = monthIndex >= 0 && monthIndex < openMonths.length - 1 ? openMonths[monthIndex + 1] : null;

  const goToMonth = (key: string | null) => {
    if (key) setMonthCursor(new Date(`${key}-01T00:00:00Z`));
  };

  /* ── Libellés de date, dans la langue de l'interface ────────────────────
     Tirés d'`Intl` plutôt que du catalogue de traductions : les noms de mois
     et de jours n'ont pas à être recopiés à la main dans chaque langue. */
  const intlLocale = locale === 'en' ? 'en-GB' : 'fr-FR';
  const formatIn = useCallback(
    (date: Date, options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(intlLocale, { timeZone: 'UTC', ...options }).format(date),
    [intlLocale],
  );

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        // 2024-01-01 est un lundi : la semaine commence donc au bon jour.
        const date = new Date(Date.UTC(2024, 0, 1 + index));
        return { short: formatIn(date, { weekday: 'narrow' }), long: formatIn(date, { weekday: 'long' }) };
      }),
    [formatIn],
  );

  /* ── Heure chez le visiteur ─────────────────────────────────────────────
     Lue après le montage : le serveur ne peut pas connaître le fuseau du
     navigateur, et le deviner produirait un écart d'hydratation. */
  const [visitorZone, setVisitorZone] = useState<string | null>(null);
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone && zone !== 'Africa/Lome') setVisitorZone(zone);
  }, []);

  /**
   * Heure du créneau chez le visiteur, ou `null` si elle tombe à la même
   * heure : répéter « ≈ 09:00 chez vous » sous « 09:00 » n'apprend rien.
   */
  const visitorTime = (day: string, time: string): string | null => {
    const local = new Intl.DateTimeFormat(intlLocale, { hour: '2-digit', minute: '2-digit' }).format(new Date(instantOf(day, time)));
    return local.replace(/\s/g, '') === time ? null : local;
  };

  /* ── Choix d'une journée ────────────────────────────────────────────────── */
  const chooseDay = (key: string) => {
    setSelectedDay(key);
    setSelectedTime(null);
    setSendError(null);
  };

  /** Flèches du clavier : déplacement de jour en jour dans la grille. */
  const moveFocus = (from: Date, deltaDays: number) => {
    const target = new Date(from);
    target.setUTCDate(target.getUTCDate() + deltaDays);
    const button = gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${dayKey(target)}"]`);
    if (button) {
      button.focus();
      return;
    }
    // Jour absent de la grille : on change de mois et le focus suivra au rendu.
    goToMonth(dayKey(target).slice(0, 7));
  };

  /* ── Formulaire ─────────────────────────────────────────────────────────── */
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingFields>({
    defaultValues: { channel: 'video' },
  });

  const lengthRules = (min: number, max: number, minMessage: string, maxMessage: string): RegisterOptions<BookingFields> => ({
    required: minMessage,
    minLength: { value: min, message: minMessage },
    maxLength: { value: max, message: maxMessage },
  });

  const onSubmit = async (values: BookingFields) => {
    if (!selectedDay || !selectedTime) return;

    setIsSending(true);
    setSendError(null);

    try {
      const response = await fetch('/api/rendezvous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, day: selectedDay, time: selectedTime, locale }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        setConfirmation({ day: selectedDay, time: selectedTime, invite: result.invite ?? '' });
        reset();
        setSelectedTime(null);
        // Les disponibilités sont relues : le créneau retenu disparaît.
        setReloadToken((token) => token + 1);
      } else {
        setSendError(result.message || t('sendError'));
        // Créneau pris entre-temps : la liste est rafraîchie sous les yeux.
        if (response.status === 409) setReloadToken((token) => token + 1);
      }
    } catch {
      setSendError(t('networkError'));
    } finally {
      setIsSending(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ ÉTAT : DEMANDE ENVOYÉE
     ═══════════════════════════════════════════════════════════════════════ */

  if (confirmation) {
    const date = new Date(`${confirmation.day}T00:00:00Z`);
    const inviteHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(confirmation.invite)}`;

    return (
      <section aria-labelledby="booking-title" className="bk">
        <BookingHeading id="booking-title" />
        <div className="bk-done" role="status">
          <CheckCircle2 aria-hidden="true" className="bk-done-icon" />
          <p className="bk-done-title">{t('confirmed.title')}</p>
          <p className="bk-done-slot">
            {formatIn(date, { weekday: 'long', day: 'numeric', month: 'long' })} · {confirmation.time}
          </p>
          <p className="bk-done-text">{t('confirmed.text')}</p>
          <div className="bk-done-actions">
            {confirmation.invite && (
              <a className={BUTTON_PRIMARY} href={inviteHref} download="rendez-vous.ics">
                <CalendarCheck2 aria-hidden="true" className="h-[1.1em] w-[1.1em]" />
                {t('confirmed.ics')}
              </a>
            )}
            <button type="button" className="bk-link" onClick={() => setConfirmation(null)}>
              {t('confirmed.again')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ ÉTAT COURANT : CHOISIR, PUIS DEMANDER
     ═══════════════════════════════════════════════════════════════════════ */

  return (
    <section aria-labelledby="booking-title" className="bk">
      <BookingHeading id="booking-title" />

      <div className="bk-grid">
        {/* ── 01 · La date ─────────────────────────────────────────────── */}
        <div className="bk-panel">
          <p className="bk-step"><span className="bk-step-num">01</span>{t('steps.date')}</p>

          {loadFailed ? (
            <div className="bk-empty">
              <p>{t('loadError')}</p>
              <button type="button" className="bk-link" onClick={() => setReloadToken((token) => token + 1)}>
                {t('retry')}
              </button>
            </div>
          ) : !availability || !monthCursor ? (
            <p className="bk-empty" aria-live="polite">
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              {t('loading')}
            </p>
          ) : (
            <>
              <div className="bk-month">
                <button
                  type="button"
                  className="bk-month-step"
                  onClick={() => goToMonth(previousMonth)}
                  disabled={!previousMonth}
                  aria-label={t('previousMonth')}
                >
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>
                <p className="bk-month-name" aria-live="polite">
                  {formatIn(monthCursor, { month: 'long', year: 'numeric' })}
                </p>
                <button
                  type="button"
                  className="bk-month-step"
                  onClick={() => goToMonth(nextMonth)}
                  disabled={!nextMonth}
                  aria-label={t('nextMonth')}
                >
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>

              <div className="bk-cal" role="group" aria-label={t('steps.date')} ref={gridRef}>
                <div className="bk-cal-row bk-cal-head" aria-hidden="true">
                  {weekdayLabels.map((weekday, index) => (
                    <span key={index}>{weekday.short}</span>
                  ))}
                </div>

                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="bk-cal-row">
                    {week.map((date) => {
                      const key = dayKey(date);
                      const free = days[key]?.length ?? 0;
                      const inMonth = date.getUTCMonth() === monthCursor.getUTCMonth();

                      return (
                        <button
                          key={key}
                          type="button"
                          data-day={key}
                          className="bk-day"
                          data-outside={inMonth ? undefined : ''}
                          aria-pressed={selectedDay === key}
                          disabled={free === 0}
                          onClick={() => chooseDay(key)}
                          onKeyDown={(event) => {
                            const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
                            const delta = moves[event.key];
                            if (delta === undefined) return;
                            event.preventDefault();
                            moveFocus(date, delta);
                          }}
                          aria-label={`${formatIn(date, { weekday: 'long', day: 'numeric', month: 'long' })} — ${
                            free > 0 ? t('slotsAvailable', { count: free }) : t('noSlots')
                          }`}
                        >
                          <span className="bk-day-num">{date.getUTCDate()}</span>
                          {free > 0 && <span className="bk-day-dot" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <p className="bk-zone">{t('timeZoneNote')}</p>
            </>
          )}
        </div>

        {/* ── 02 · L'heure ─────────────────────────────────────────────── */}
        <div className="bk-panel">
          <p className="bk-step"><span className="bk-step-num">02</span>{t('steps.time')}</p>

          {!selectedDay ? (
            <p className="bk-empty">{t('pickDayFirst')}</p>
          ) : (
            <>
              <p className="bk-chosen-day">
                {formatIn(new Date(`${selectedDay}T00:00:00Z`), { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <ul className="bk-slots" aria-label={t('steps.time')}>
                {slotsOfSelectedDay.map((time) => (
                  <li key={time}>
                    <button
                      type="button"
                      className="bk-slot"
                      aria-pressed={selectedTime === time}
                      onClick={() => {
                        setSelectedTime(time);
                        setSendError(null);
                      }}
                    >
                      <span className="bk-slot-time">{time}</span>
                      <span className="bk-slot-length">{t('duration', { minutes: availability?.slotMinutes ?? 45 })}</span>
                      {visitorZone && visitorTime(selectedDay, time) && (
                        <span className="bk-slot-yours">{t('yourTime', { time: visitorTime(selectedDay, time)! })}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ── 03 · Les coordonnées ─────────────────────────────────────── */}
        <form className="bk-panel bk-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <p className="bk-step"><span className="bk-step-num">03</span>{t('steps.details')}</p>

          <div className="bk-fields">
            <BookingField name="name" label={t('fields.name')} error={errors.name?.message}>
              <input
                id="bk-name"
                type="text"
                autoComplete="name"
                maxLength={BOOKING_LIMITS.nameMax}
                className={FIELD}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'bk-name-error' : undefined}
                {...register('name', lengthRules(BOOKING_LIMITS.nameMin, BOOKING_LIMITS.nameMax, tValidation('nameMin'), tValidation('nameMax', { max: BOOKING_LIMITS.nameMax })))}
              />
            </BookingField>

            <BookingField name="email" label={t('fields.email')} error={errors.email?.message}>
              <input
                id="bk-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                className={FIELD}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'bk-email-error' : undefined}
                {...register('email', { required: tValidation('emailInvalid'), pattern: { value: EMAIL_PATTERN, message: tValidation('emailInvalid') } })}
              />
            </BookingField>

            <BookingField name="phone" label={t('fields.phone')} hint={t('fields.optional')} error={errors.phone?.message}>
              <input
                id="bk-phone"
                type="tel"
                autoComplete="tel"
                maxLength={BOOKING_LIMITS.phoneMax}
                className={FIELD}
                aria-invalid={Boolean(errors.phone)}
                {...register('phone', { maxLength: { value: BOOKING_LIMITS.phoneMax, message: t('fields.phoneTooLong') } })}
              />
            </BookingField>

            <BookingField name="subject" label={t('fields.subject')} error={errors.subject?.message}>
              <input
                id="bk-subject"
                type="text"
                maxLength={BOOKING_LIMITS.subjectMax}
                className={FIELD}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? 'bk-subject-error' : undefined}
                {...register('subject', lengthRules(BOOKING_LIMITS.subjectMin, BOOKING_LIMITS.subjectMax, tValidation('subjectMin'), tValidation('subjectMax', { max: BOOKING_LIMITS.subjectMax })))}
              />
            </BookingField>
          </div>

          {/* Canal : quatre façons de se parler, toutes déjà proposées sur la page. */}
          <fieldset className="bk-channels">
            <legend className="bk-field-label">{t('fields.channel')}</legend>
            <div className="bk-channel-row">
              {MEETING_CHANNELS.map((channel) => (
                <label key={channel} className="bk-channel">
                  <input type="radio" value={channel} {...register('channel')} />
                  <span>{t(`channels.${channel}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <BookingField name="message" label={t('fields.message')} hint={t('fields.optional')} error={errors.message?.message}>
            <textarea
              id="bk-message"
              rows={4}
              maxLength={BOOKING_LIMITS.messageMax}
              className={`${FIELD} resize-y`}
              placeholder={t('fields.messagePlaceholder')}
              {...register('message', { maxLength: { value: BOOKING_LIMITS.messageMax, message: t('fields.messageTooLong') } })}
            />
          </BookingField>

          {/* Pot de miel : hors écran, hors tabulation, invisible aux lecteurs d'écran. */}
          <div aria-hidden="true" className="bk-honeypot">
            <label htmlFor={`bk-${HONEYPOT_FIELD}`}>Website</label>
            <input id={`bk-${HONEYPOT_FIELD}`} type="text" tabIndex={-1} autoComplete="off" {...register(HONEYPOT_FIELD)} />
          </div>

          {/* Récapitulatif : le créneau retenu, en clair, juste avant l'envoi. */}
          <div className="bk-recap" aria-live="polite">
            <p className="bk-recap-label">{t('recap')}</p>
            <p className="bk-recap-value">
              {selectedDay && selectedTime
                ? `${formatIn(new Date(`${selectedDay}T00:00:00Z`), { weekday: 'long', day: 'numeric', month: 'long' })} · ${selectedTime}`
                : t('recapEmpty')}
            </p>
          </div>

          <button type="submit" className={BUTTON_PRIMARY} disabled={!selectedDay || !selectedTime || isSending} aria-busy={isSending}>
            {isSending
              ? <Loader2 aria-hidden="true" className="h-[1.1em] w-[1.1em] animate-spin motion-reduce:animate-none" />
              : <CalendarDays aria-hidden="true" className="h-[1.1em] w-[1.1em]" />}
            {isSending ? t('submitting') : t('submit')}
          </button>

          <div aria-live="assertive">
            {sendError && (
              <p role="alert" className="bk-error">
                <XCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
                {sendError}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ EN-TÊTE DE LA SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function BookingHeading({ id }: { id: string }) {
  const t = useTranslations('contact_page.booking');

  return (
    <header className="bk-head">
      <p className={OVERLINE}>{t('overline')}</p>
      <h2 id={id} className="bk-title">{t('title')}</h2>
      <p className="bk-lead">{t('lead')}</p>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CHAMP
   ═══════════════════════════════════════════════════════════════════════════ */

function BookingField({
  name,
  label,
  hint,
  error,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bk-field">
      <label htmlFor={`bk-${name}`} className="bk-field-label">
        {label}
        {hint && <span className="bk-field-hint">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`bk-${name}-error`} className="bk-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
