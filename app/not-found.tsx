'use client';

/**
 * @file not-found.tsx (Root)
 * @description Page 404 globale de l'application (hors du scope [locale]).
 * 
 * @architecture
 * Ce fichier est déclenché par Next.js lorsqu'une URL est tapée mais qu'elle ne correspond 
 * à RIEN dans l'application (ex: une route complètement hors du dossier `[locale]`).
 * Parce qu'il est à la racine, et qu'il n'y a pas de layout.tsx racine (seulement dans [locale]), 
 * il doit impérativement fournir ses propres balises `<html>` et `<body>`.
 * 
 * Pourquoi : Évite l'erreur fatale "Missing <html> and <body> tags" de Next.js pour les mauvaises URLs globales.
 */

import PageErreur from '@/components/layout/pageErreur';
import './globals.css';

export default function NotFound() {
  return (
    <html lang="fr" className="dark">
      <body>
        <PageErreur 
          title="Page Introuvable" 
          message="Désolé, la page que vous recherchez n'existe pas ou a été déplacée. Vous allez être redirigé vers l'accueil." 
        />
      </body>
    </html>
  );
}
