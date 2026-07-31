// 'use client';

// /**
//  * @file error.tsx
//  * @description Périmètre de sécurité local (Local Error Boundary) pour la route `[locale]`.
//  * 
//  * @architecture
//  * Contrairement à `global-error.tsx`, ce fichier intercepte les erreurs qui surviennent 
//  * DANS les pages ou les composants de la route (ex: une variable indéfinie, une requête API qui échoue au rendu).
//  * Il est automatiquement encapsulé par `app/[locale]/layout.tsx`, donc il n'a pas besoin de balises `<html>` ou `<body>`.
//  * 
//  * Pourquoi : Permet de préserver le Header et le Footer de l'application tout en affichant 
//  * l'erreur uniquement dans la zone de contenu principal.
//  */

// import { useEffect } from 'react';
// import PageErreur from '@/components/layout/pageErreur';

// export default function Error({
//   error,
//   reset,
// }: {
//   error: Error & { digest?: string }; // digest est un hash d'erreur spécifique à Next.js
//   reset: () => void; // Fonction pour forcer un nouveau rendu (réessayer)
// }) {

//   /**
//    * @effect 
//    * En production, ce hook permettrait d'envoyer l'erreur silencieusement à un service 
//    * de monitoring comme Sentry ou Datadog.
//    */
//   useEffect(() => {
//     // Log the error to an error reporting service
//     console.error('Application error interceptée par error.tsx:', error);
//   }, [error]);

//   return (
//     <PageErreur 
//       title="Erreur Inattendue"
//       message="Une erreur critique est survenue dans l'application. La redirection vers l'accueil est en cours..."
//       reset={reset}
//     />
//   );
// }






















'use client';

/**
 * @file error.tsx
 * @description Périmètre de sécurité local (Local Error Boundary) pour la route `[locale]`.
 * 
 * @architecture
 * Contrairement à `global-error.tsx`, ce fichier intercepte les erreurs qui surviennent 
 * DANS les pages ou les composants de la route (ex: une variable indéfinie, une requête API qui échoue au rendu).
 * Il est automatiquement encapsulé par `app/[locale]/layout.tsx`, donc il n'a pas besoin de balises `<html>` ou `<body>`.
 * 
 * Pourquoi : Permet de préserver le Header et le Footer de l'application tout en affichant 
 * l'erreur uniquement dans la zone de contenu principal.
 */

import { useEffect, useState } from 'react';
import PageErreur from '@/components/layout/pageErreur';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ MESSAGES
   ───────────────────────────────────────────────────────────────────────────
   Les textes étaient codés en dur en français : un visiteur anglophone tombant
   sur une erreur recevait « Erreur Inattendue ».

   Pourquoi ne pas utiliser `useTranslations` ici ? Parce qu'un périmètre de
   sécurité doit avoir le moins de dépendances possible : si l'erreur interceptée
   vient du fournisseur i18n lui-même, tout hook de traduction lèverait une
   seconde exception à l'intérieur du gestionnaire d'erreur, et l'utilisateur se
   retrouverait devant un écran blanc.

   La langue est donc lue sur l'attribut `lang` du document, posé par le layout
   avant tout rendu React. Zéro contexte, zéro hook fragile.
   ═══════════════════════════════════════════════════════════════════════════ */
const ERROR_MESSAGES = {
  fr: {
    title: 'Erreur inattendue',
    message: "Une erreur est survenue pendant l'affichage de cette page. Vous pouvez réessayer — le reste du site reste accessible.",
  },
  en: {
    title: 'Something went wrong',
    message: 'An error occurred while rendering this page. You can try again — the rest of the site is still available.',
  },
} as const;

/** Langue de repli si l'attribut `lang` est absent ou non reconnu. */
const FALLBACK_LOCALE: keyof typeof ERROR_MESSAGES = 'fr';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }; // digest est un hash d'erreur spécifique à Next.js
  reset: () => void; // Fonction pour forcer un nouveau rendu (réessayer)
}) {

  // Résolu après montage : `document` n'existe pas au rendu serveur, et le
  // premier rendu client doit correspondre au balisage serveur.
  const [locale, setLocale] = useState<keyof typeof ERROR_MESSAGES>(FALLBACK_LOCALE);

  useEffect(() => {
    const documentLocale = document.documentElement.lang;
    if (documentLocale in ERROR_MESSAGES) {
      setLocale(documentLocale as keyof typeof ERROR_MESSAGES);
    }
  }, []);

  /**
   * @effect 
   * En production, ce hook permettrait d'envoyer l'erreur silencieusement à un service 
   * de monitoring comme Sentry ou Datadog.
   */
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error interceptée par error.tsx:', error);
  }, [error]);

  const { title, message } = ERROR_MESSAGES[locale];

  return (
    <PageErreur
      title={title}
      message={message}
      reset={reset}
    />
  );
}