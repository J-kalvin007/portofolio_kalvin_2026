/**
 * @file i18n.types.ts
 * @description Typage statique des traductions next-intl.
 *
 * @architecture
 * `AppConfig` est le point d'extension officiel de next-intl. Y déclarer la
 * forme des messages rend **chaque clé de traduction vérifiée par TypeScript** :
 * `t('hero.titel')` — ou une clé construite dynamiquement qui ne correspond à
 * aucune entrée — devient une erreur de compilation au lieu d'une chaîne brute
 * affichée en production.
 *
 * `fr.json` est la référence (langue par défaut). La parité avec `en.json` est
 * vérifiée plus bas, dans les deux sens.
 *
 * @remarks Fichier `.ts` et non `.d.ts` : avec `skipLibCheck: true`, TypeScript
 * ne signale aucune erreur dans les fichiers de déclaration — l'assertion de
 * parité y serait restée muette.
 */

import type { routing } from '@/i18n/routing';
import type fr from '@/messages/fr.json';
import type en from '@/messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof fr;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ PARITÉ DES CATALOGUES
   ───────────────────────────────────────────────────────────────────────────
   Si une clé existe dans une langue et pas dans l'autre, la compilation échoue
   ici, avec le nom de la clé dans le message d'erreur. Sans cette garde, la
   version anglaise affichait silencieusement la clé brute (« hero.badge »).
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Échoue à la compilation si `T` n'est pas vide. L'erreur affiche les clés
 * fautives, par exemple : Type '"nav.cleOubliee"' does not satisfy the constraint 'never'.
 */
type AssertNoMissingKeys<T extends never> = T;

/** Chemins de toutes les feuilles d'un objet de messages (« a.b.c »). */
type LeafPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? LeafPaths<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

type MissingInEnglish = Exclude<LeafPaths<typeof fr>, LeafPaths<typeof en>>;
type MissingInFrench = Exclude<LeafPaths<typeof en>, LeafPaths<typeof fr>>;

export type EnglishCatalogIsComplete = AssertNoMissingKeys<MissingInEnglish>;
export type FrenchCatalogIsComplete = AssertNoMissingKeys<MissingInFrench>;
