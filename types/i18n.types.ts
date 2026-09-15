/**
 * @file i18n.types.ts
 * @description Types partagés liés à l'internationalisation (next-intl).
 */

import type { useTranslations } from 'next-intl';

/**
 * Fonction de traduction renvoyée par `useTranslations(namespace)`.
 *
 * @remarks Sert à typer un traducteur transmis en prop d'un composant parent à
 * ses enfants (ex. `tSkills` de la page d'accueil vers `MarqueeRow` puis
 * `SkillCard`). Ces props étaient typées `any` : un appel mal formé — mauvais
 * nombre d'arguments, objet passé à la place d'une clé — passait la compilation
 * sans avertissement.
 */
export type Translator = ReturnType<typeof useTranslations>;
