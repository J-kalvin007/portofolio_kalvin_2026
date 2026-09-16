/**
 * @file format.ts
 * @description Petits formatages partagés par les objets « reçu » du site.
 */

/**
 * Nombre sur deux chiffres, comme sur un ticket de caisse : 1 → « 01 ».
 * Les nombres de trois chiffres ou plus restent inchangés.
 */
export const padNumber = (value: number): string => String(value).padStart(2, '0');
