'use client';

/**
 * @file SecretTrigger.tsx
 * @description Porte dérobée de la régie : dix clics d'affilée sur le logotype
 * du pied de page ouvrent `/regie`.
 *
 * @architecture
 * Une enveloppe invisible autour de ce qu'elle reçoit en `children`. Elle
 * n'ajoute ni rôle, ni arrêt de tabulation, ni curseur particulier : rien ne
 * signale au visiteur, ni à un lecteur d'écran, qu'il y a quelque chose à
 * découvrir. Le logotype reste du texte, sélectionnable comme avant.
 *
 * Le compteur vit dans des références, pas dans un état : un clic ne provoque
 * aucun rendu.
 *
 * @remarks **Ce n'est pas une sécurité.** C'est une manière de ne pas afficher
 * de lien « Administration » sur un portfolio. La protection réelle est le mot
 * de passe, vérifié par le serveur (`lib/visual/session.ts`) : connaître
 * l'adresse `/regie` ne donne accès à rien.
 */

import { useRef, type MouseEvent, type ReactNode } from 'react';

/** Adresse de la régie. Hors du segment `[locale]` : voir `proxy.ts`. */
export const REGIE_PATH = '/regie';

/** Nombre de clics consécutifs attendus. */
const REQUIRED_CLICKS = 10;

/**
 * Écart maximal entre deux clics, en millisecondes. Au-delà, la série repart de
 * un : dix clics espacés au fil d'une visite n'ouvrent rien.
 */
const MAX_INTERVAL_MS = 900;

export default function SecretTrigger({ children }: { children: ReactNode }) {
  const clicks = useRef(0);
  const lastClickAt = useRef(0);

  const handleClick = (event: MouseEvent) => {
    /* L'heure du clic lui-même (`timeStamp`), et non celle où ce code
       s'exécute : sur une page occupée, les clics attendent leur tour, et dix
       clics rapides seraient comptés comme espacés. */
    const now = event.timeStamp;
    clicks.current = now - lastClickAt.current <= MAX_INTERVAL_MS ? clicks.current + 1 : 1;
    lastClickAt.current = now;
    if (clicks.current < REQUIRED_CLICKS) return;

    // La série repart de zéro : il faudrait dix nouveaux clics pour rouvrir.
    clicks.current = 0;
    /* Chargement complet du document, et non navigation côté client. La régie
       est une autre application posée à côté du site : son propre `<html>`
       (`app/regie/layout.tsx`), son en-tête `noindex`, son script de thème,
       ses feuilles. Le routeur (`router.push`) y entrerait sans recharger, en
       gardant les feuilles et l'état du site — les deux partagent en effet
       l'enveloppe racine `app/layout.tsx`. La règle ESLint qui préfère le
       routeur ne connaît pas ce cas : elle est levée pour cette ligne. */
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(REGIE_PATH);
  };

  /**
   * Un double-clic sélectionne un mot, un triple une ligne : dix clics rapides
   * laisseraient le logotype surligné. Seuls les clics répétés sont neutralisés
   * (`detail` compte les clics de la série) — une sélection au glisser reste
   * possible.
   */
  const preventMultiClickSelection = (event: MouseEvent) => {
    if (event.detail > 1) event.preventDefault();
  };

  return (
    // `touch-manipulation` : sur téléphone, supprime le zoom au double appui,
    // qui avalerait un clic sur deux.
    <span onClick={handleClick} onMouseDown={preventMultiClickSelection} className="inline-flex touch-manipulation">
      {children}
    </span>
  );
}
