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

import { useEffect } from 'react';
import PageErreur from '@/components/layout/pageErreur';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }; // digest est un hash d'erreur spécifique à Next.js
  reset: () => void; // Fonction pour forcer un nouveau rendu (réessayer)
}) {
  
  /**
   * @effect 
   * En production, ce hook permettrait d'envoyer l'erreur silencieusement à un service 
   * de monitoring comme Sentry ou Datadog.
   */
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error interceptée par error.tsx:', error);
  }, [error]);

  return (
    <PageErreur 
      title="Erreur Inattendue"
      message="Une erreur critique est survenue dans l'application. La redirection vers l'accueil est en cours..."
      reset={reset}
    />
  );
}
