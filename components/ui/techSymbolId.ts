/**
 * @file techSymbolId.ts
 * @description Identifiant du `<symbol>` d'une technologie dans la réserve de
 * logos de la page (voir `TechIconSprite.tsx` et `TechIcon.tsx`).
 *
 * Ce fichier est séparé de `tech-icons.ts`, qui est généré : une fonction posée
 * là-bas disparaîtrait à la prochaine régénération des tracés.
 */

/**
 * Réduit un nom de technologie à un identifiant sûr : lettres, chiffres et
 * tirets. « Django REST Framework » devient `ti-django-rest-framework`,
 * « Next.js » devient `ti-next-js`.
 */
export function techSymbolId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `ti-${slug}`;
}
