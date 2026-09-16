'use client';

/**
 * @file LocalTime.tsx
 * @description Heure locale de Kalvin (Lomé), affichée sur le reçu du profil.
 *
 * @remarks Information utile, pas décorative : un recruteur ou un client situé
 * sur un autre fuseau sait immédiatement s'il peut attendre une réponse.
 *
 * `useSyncExternalStore` abonne le composant à une horloge : au rendu serveur et
 * à l'hydratation, un repli neutre (`--:--`) est affiché — l'heure du build
 * serait fausse — puis l'heure réelle, mise à jour toutes les 15 secondes.
 */

import { useSyncExternalStore } from 'react';

const REFRESH_INTERVAL_MS = 15_000;
const PLACEHOLDER = '--:--';

/** Un formateur par langue et par fuseau, créé une seule fois. */
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatNow(locale: string, timeZone: string): string {
  const key = `${locale}|${timeZone}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
    formatters.set(key, formatter);
  }
  return formatter.format(new Date());
}

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, REFRESH_INTERVAL_MS);
  return () => window.clearInterval(id);
}

export default function LocalTime({ locale, timeZone }: { locale: string; timeZone: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () => formatNow(locale, timeZone),
    () => PLACEHOLDER,
  );

  return time === PLACEHOLDER
    ? <span>{time}</span>
    : <time dateTime={time}>{time}</time>;
}
