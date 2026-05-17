'use client';

/**
 * @file global-error.tsx
 * @description Périmètre de sécurité d'ultime recours (Global Error Boundary) pour Next.js.
 * 
 * @architecture
 * Ce fichier est appelé EXCLUSIVEMENT lorsque le layout racine principal (`app/[locale]/layout.tsx`) 
 * plante (ex: erreur fatale lors du SSR, de l'hydratation ou d'un Provider React).
 * Il DOIT posséder ses propres balises `<html>` et `<body>` car le layout principal est considéré comme détruit ou corrompu.
 * 
 * Pourquoi : Évite l'écran blanc de la mort (White Screen of Death) en production et garantit 
 * que l'utilisateur verra toujours une page d'erreur premium, même en cas de panne critique du framework.
 */

import PageErreur from '@/components/layout/pageErreur';
import './globals.css'; // Essentiel pour avoir Tailwind actif si le layout plante

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr" className="dark">
      <body>
        <PageErreur 
          title="Erreur Globale Système"
          message="Une erreur système fatale est survenue au niveau du layout. L'application va redémarrer automatiquement."
          reset={reset}
        />
      </body>
    </html>
  );
}
