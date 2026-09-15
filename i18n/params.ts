/**
 * @file params.ts
 * @description Résolution de la langue portée par le segment dynamique `[locale]`.
 *
 * @architecture
 * Next.js type le paramètre de route en `string` : TypeScript ne peut pas savoir
 * que seules `fr` et `en` atteignent le layout. Or next-intl, une fois ses
 * messages typés (`types/i18n.types.ts`), exige une `Locale` exacte.
 *
 * Plutôt qu'une assertion `as 'fr' | 'en'` recopiée dans chaque fichier — qui
 * fait taire le compilateur sans rien vérifier — ce module **valide** la valeur
 * avec `hasLocale` et répond 404 sinon. Le type est alors garanti par
 * l'exécution, pas simplement affirmé.
 */

import { hasLocale, type Locale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from './routing';

/** Forme des `params` reçus par tout fichier situé sous `app/[locale]/`. */
export type LocaleParams = { params: Promise<{ locale: string }> };

/**
 * Attend les paramètres de route et renvoie une langue supportée, typée.
 * Une langue inconnue (`/de/propos`) déclenche la page 404.
 */
export async function resolveLocale(params: LocaleParams['params']): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}
