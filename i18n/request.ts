/**
 * @file request.ts
 * @description Configuration serveur pour next-intl.
 * Ce fichier est exécuté côté serveur lors de chaque requête pour déterminer quelle langue utiliser
 * et charger les traductions appropriées.
 *
 * @architecture
 * - Récupère la langue demandée (`requestLocale`).
 * - Valide que cette langue fait partie des langues supportées ('fr', 'en'). Si ce n'est pas le cas, fallback sur 'fr'.
 * - Importe dynamiquement le dictionnaire JSON correspondant (`messages/fr.json` ou `messages/en.json`).
 *
 * Pourquoi : Permet le Server-Side Rendering (SSR) des textes localisés, ce qui est crucial pour le SEO et les performances.
 */

import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Récupère la langue depuis la requête de l'utilisateur (URL ou Header)
  const requested = await requestLocale;

  // Validation de sécurité : une langue non supportée retombe sur la langue par défaut (fr).
  // `hasLocale` est un garde de type : `locale` est ensuite typée `'fr' | 'en'`,
  // ce qu'exige la configuration typée de next-intl (types/i18n.types.ts).
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Retourne la configuration i18n pour cette requête spécifique
  return {
    locale,
    // Import dynamique du fichier de traduction (Lazy loading serveur)
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
