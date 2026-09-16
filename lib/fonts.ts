/**
 * @file fonts.ts
 * @description Police unique du site : **Poppins**, sur toutes les pages, sans exception.
 *
 * @architecture
 * Définie une seule fois ici, puis importée partout où un document HTML est
 * produit :
 *  - `app/[locale]/layout.tsx` — toutes les pages du site ;
 *  - `app/not-found.tsx` et `app/global-error.tsx` — ces deux écrans vivent hors
 *    du layout (ils fournissent leur propre `<html>`) : sans cet import, ils
 *    s'afficheraient dans la police système.
 *
 * next/font télécharge les fichiers au moment du build et les sert depuis le
 * site : aucune requête vers Google chez le visiteur, et une police de repli
 * aux métriques ajustées évite que la page ne bouge au chargement.
 *
 * @remarks Poppins n'existe pas en version variable sur Google Fonts : chaque
 * graisse est un fichier. Seules les graisses réellement employées dans le code
 * sont chargées (300 à 800). Le navigateur ne télécharge que celles qu'une page
 * utilise effectivement.
 */

import { Poppins } from 'next/font/google';

/** Styles droits — toutes les graisses utilisées dans le projet. */
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal'],
  variable: '--font-poppins',
  display: 'swap',
});

/**
 * Italique véritable de Poppins, pour les citations (`italic`, `<em>`, `<i>`).
 *
 * Instance séparée et **non préchargée** : elle ne sert qu'à deux citations, sur
 * des pages secondaires. Sans elle, le navigateur fabriquerait une fausse
 * italique en inclinant les lettres droites — reconnaissable et moins lisible.
 */
export const poppinsItalic = Poppins({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-poppins-italic',
  display: 'swap',
  preload: false,
});

/** Classes à poser sur `<html>` : elles déclarent les variables des deux instances. */
export const fontVariables = `${poppins.variable} ${poppinsItalic.variable}`;
