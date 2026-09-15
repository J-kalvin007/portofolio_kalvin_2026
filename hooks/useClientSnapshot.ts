'use client';

/**
 * @file useClientSnapshot.ts
 * @description Lecture de valeurs qui n'existent que dans le navigateur
 * (`document`, `navigator`, `localStorage`), sans écart d'hydratation et sans
 * rendu supplémentaire.
 *
 * @architecture
 * Le motif répandu est :
 *
 * ```ts
 * const [mounted, setMounted] = useState(false);
 * useEffect(() => setMounted(true), []);
 * ```
 *
 * Il fonctionne, mais il rend **toujours** le composant deux fois : une fois
 * avec la valeur de repli, puis une fois après le `setState` de l'effet — même
 * quand le composant apparaît longtemps après le chargement de la page. C'est
 * ce que signale la règle ESLint `react-hooks/set-state-in-effect`.
 *
 * `useSyncExternalStore` est la primitive que React fournit pour ce cas :
 * - **pendant l'hydratation**, React rend `getServerSnapshot` (le balisage
 *   correspond au HTML serveur, aucun écart d'hydratation), puis met lui-même
 *   le composant à jour si la valeur du navigateur diffère ;
 * - **pour un composant monté après l'hydratation** (visionneuse ouverte au
 *   clic, navigation entre pages), la valeur du navigateur est lue **dès le
 *   premier rendu** : le rendu intermédiaire vide disparaît complètement.
 */

import { useSyncExternalStore } from 'react';

/** Les valeurs lues ici ne sont pas observées : aucun abonnement n'est nécessaire. */
const subscribeNever = () => () => {};

/**
 * Renvoie `serverValue` au rendu serveur et pendant l'hydratation, puis la
 * valeur lue par `readOnClient` dans le navigateur.
 *
 * @param readOnClient Lecture synchrone côté navigateur. Doit renvoyer une valeur
 * primitive (ou stable) : React la compare par identité à chaque rendu.
 * @param serverValue Valeur utilisée tant que le navigateur n'est pas disponible.
 */
export function useClientSnapshot<T>(readOnClient: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribeNever, readOnClient, () => serverValue);
}

/** `false` au rendu serveur et à l'hydratation, `true` ensuite dans le navigateur. */
export function useIsClient(): boolean {
  return useClientSnapshot(() => true, false);
}
