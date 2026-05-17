/**
 * @file routing.ts
 * @description Définition globale de la stratégie de routage i18n de l'application.
 * 
 * @architecture
 * - Définit les langues supportées (`locales`).
 * - Définit la langue de secours (`defaultLocale`).
 * - Exige le préfixe de langue dans l'URL (`localePrefix: 'always'`), garantissant que 
 *   l'URL reflète toujours l'état de la langue (ex: `/fr/propos` et `/en/propos`).
 * 
 * Pourquoi : Centraliser cette configuration permet au middleware et aux utilitaires de navigation 
 * d'utiliser une seule et unique source de vérité.
 */

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'], // Langues disponibles dans l'application
  defaultLocale: 'fr', // Langue de secours si l'utilisateur arrive sur '/'
  localePrefix: 'always' // Force le /fr/ ou /en/ dans l'URL pour un meilleur SEO
});
