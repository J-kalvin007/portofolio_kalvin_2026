'use client';

/**
 * @file not-found.tsx (Locale)
 * @description Page 404 locale de l'application (dans le scope [locale]).
 * 
 * @architecture
 * Ce fichier est affiché quand l'application appelle explicitement la fonction `notFound()` 
 * (par exemple si une langue non supportée est demandée dans l'URL).
 * Puisqu'il est situé dans `[locale]`, il hérite automatiquement de `app/[locale]/layout.tsx` 
 * (et donc de ses balises html/body et de son Header/Footer).
 */

import { useTranslations } from 'next-intl';
import PageErreur from '@/components/layout/pageErreur';

export default function NotFound() {
  // Traduction dynamique du titre et de la description via i18n
  const t = useTranslations('notfound');

  return (
    <PageErreur 
      title={t('title')} 
      message={t('description')} 
    />
  );
}
