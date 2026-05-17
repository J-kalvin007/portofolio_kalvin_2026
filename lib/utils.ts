/**
 * @file utils.ts
 * @description Boîte à outils utilitaire globale pour l'application.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @function cn (Class Names)
 * @description Fusionne dynamiquement des classes Tailwind CSS de manière conditionnelle.
 * 
 * @architecture
 * Utilise `clsx` pour résoudre les conditions logiques (ex: `isActive && 'bg-blue-500'`).
 * Utilise `tailwind-merge` pour résoudre les conflits de classes Tailwind (ex: si on passe `px-2` et `px-4`, seul `px-4` survivra).
 * 
 * Pourquoi : Essentiel lors de la création de composants UI réutilisables où l'on souhaite surcharger 
 * les classes par défaut sans générer de CSS redondant ou conflictuel.
 * 
 * @param inputs - Un tableau de classes, d'objets conditionnels ou de valeurs fausses.
 * @returns Une chaîne de caractères contenant les classes Tailwind finales et nettoyées.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
