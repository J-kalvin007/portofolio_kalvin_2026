/**
 * @file navigation.ts
 * @description Génération des utilitaires de navigation fortement typés pour l'internationalisation (i18n).
 * 
 * @architecture
 * Ce fichier utilise `next-intl/navigation` pour créer des versions localisées des hooks et composants 
 * de navigation de Next.js (`Link`, `useRouter`, `redirect`, etc.).
 * 
 * Pourquoi : Au lieu d'utiliser le `<Link>` standard de Next.js, on utilise celui généré ici. 
 * Cela permet à l'application de préfixer automatiquement l'URL avec la langue courante (ex: `/fr/contact` au lieu de `/contact`) 
 * sans avoir à gérer la logique manuellement à chaque clic.
 */

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
