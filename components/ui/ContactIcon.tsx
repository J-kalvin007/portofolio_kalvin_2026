/**
 * @file ContactIcon.tsx
 * @description Pictogramme d'une coordonnée, posé à côté de la donnée qu'il
 * désigne (e-mail, téléphone, réseau, localisation, heure, disponibilité).
 *
 * @architecture
 * Composant sans état ni hook : utilisable côté serveur comme côté client (le
 * pied de page et la page Contact sont rendus sur le serveur, le menu mobile de
 * la barre de navigation est un îlot client).
 *
 * Le tracé part dans le HTML : ni requête d'image, ni scintillement au premier
 * affichage, et la couleur suit le thème. Le dimensionnement se fait en `em`
 * **par attribut** et non en CSS : un attribut de présentation cède devant
 * n'importe quelle règle, ce qui laisse à l'appelant la liberté d'imposer une
 * taille par utilitaire (`size-[1.15em]`) sans avoir à lutter contre la feuille
 * du composant — les feuilles de composants de ce projet sont hors couche et
 * l'emporteraient.
 *
 * @remarks Toujours décoratif (`aria-hidden`). Le sens est porté par le libellé
 * voisin — « Téléphone », « LinkedIn » — qui reste du texte : un lecteur d'écran
 * annoncerait sinon deux fois la même information.
 */

import { CONTACT_ICONS, type ContactIconName, type ContactIconShape } from './contact-icons';

interface ContactIconProps {
  name: ContactIconName;
  className?: string;
}

export default function ContactIcon({ name, className = '' }: ContactIconProps) {
  /* Annotation nécessaire : le catalogue est déclaré `as const`, si bien que
     `CONTACT_ICONS[name]` est l'union des neuf formes exactes, dont certaines
     n'ont ni `transform` ni `fillRule`. L'annoter en `ContactIconShape` rétablit
     les deux champs optionnels sans rien perdre du typage des noms. */
  const icon: ContactIconShape = CONTACT_ICONS[name];
  const shape = <path d={icon.d} />;

  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      fillRule={icon.fillRule}
      aria-hidden="true"
      focusable="false"
      className={`ci-glyph ${className}`}
    >
      {icon.transform ? <g transform={icon.transform}>{shape}</g> : shape}
    </svg>
  );
}
