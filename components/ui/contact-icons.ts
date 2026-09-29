/**
 * @file contact-icons.ts
 * @description Pictogrammes des coordonnées : e-mail, téléphone, réseaux,
 * localisation, heure locale, disponibilité.
 *
 * @architecture
 * Même principe que `tech-icons.ts` : tous les tracés sont ramenés sur la grille
 * 24 × 24 et peints avec `currentColor`. Ils suivent donc la couleur et la
 * taille du texte, dans les deux thèmes — ce que les fichiers de `public/svg`
 * ne peuvent pas faire, leurs couleurs étant codées en dur (un logo noir
 * disparaît en thème sombre, et une balise `<img>` ne se recolore pas).
 *
 * @remarks **Un seul tracé par pictogramme, et pourquoi.**
 * Les marques creuses (WhatsApp, LinkedIn, Instagram, l'épingle) sont dessinées
 * par superposition : une forme pleine, puis la forme qui l'évide. Cet évidement
 * est obtenu par `fill-rule: evenodd`, qui ne compte les croisements **qu'à
 * l'intérieur d'un même élément `<path>`**. D'où le champ `d` unique, où les
 * sous-tracés sont concaténés : deux `<path>` frères donneraient une pastille
 * pleine recouverte d'un glyphe plein, et non un glyphe évidé.
 *
 * @remarks **Pourquoi les tracés sont insérés, et non mis en réserve.**
 * `tech-icons.ts` passe par une feuille de sprites (`TechIconSprite`) parce que
 * la page Projets répète une centaine de logos. Ici, une page en affiche neuf au
 * plus : la réserve coûterait plus (un `<symbol>` par pictogramme, plus la
 * contrainte de la rendre avant ses usages) qu'elle ne rapporterait.
 *
 * @remarks **Provenance.** Chaque tracé vient du fichier indiqué dans
 * `public/svg`, extrait par script — jamais recopié à la main. Trois exceptions,
 * signalées ligne à ligne : Instagram (le fichier fourni encapsule une image
 * matricielle), l'horloge et la pastille de disponibilité (aucun fichier
 * fourni ; glyphes neutres dessinés pour ce site, ce ne sont pas des marques).
 *
 * @remarks **Égalisation optique.** Deux dessins qui occupent la même grille de
 * 24 ne pèsent pas le même poids à l'œil : un disque qui touche les quatre bords
 * paraît nettement plus gros qu'un carré de même mesure, parce qu'il déborde des
 * diagonales. Les marques d'origine ne s'accordaient d'ailleurs pas entre elles
 * — GitHub remplissait 100 % du cadre, LinkedIn 69 %. Les `transform` ci-dessous
 * ramènent donc chaque famille à une emprise convenue, mesurée dans le
 * navigateur :
 *
 * | Famille | Emprise | Glyphes |
 * | --- | --- | --- |
 * | disques | 21 | WhatsApp, LinkedIn, GitHub, horloge, disponibilité |
 * | carrés | 20 | Instagram |
 * | rectangles | 21 de large | e-mail, téléphone |
 * | verticaux | 22 de haut | épingle |
 *
 * Sans cette étape, une colonne de coordonnées donne l'impression que certaines
 * lignes sont en gras — l'œil lit une hiérarchie qui n'existe pas.
 */

export interface ContactIconShape {
  /**
   * Tracé unique, sur une grille de 24 × 24. Les sous-tracés d'un glyphe évidé
   * sont concaténés ici même (voir la remarque du fichier).
   */
  d: string;
  /** Mise à l'échelle et recentrage quand la source n'était pas sur cette grille. */
  transform?: string;
  /** `evenodd` pour les glyphes évidés (anneaux, contours, lettres détourées). */
  fillRule?: 'evenodd';
}

/**
 * Catalogue. La clé est le nom employé dans les composants ; `CONTACT_ICONS`
 * est la source de vérité du type `ContactIconName`, si bien qu'un nom mal
 * orthographié ne compile pas.
 */
export const CONTACT_ICONS = {
  /* ── E-mail — public/svg/email_02.svg (grille 1920, enveloppe pleine) ───── */
  mail: {
    d: 'M1920 428.266v1189.54l-464.16-580.146-88.203 70.585 468.679 585.904H83.684l468.679-585.904-88.202-70.585L0 1617.805V428.265l959.944 832.441L1920 428.266ZM1919.932 226v52.627l-959.943 832.44L.045 278.628V226h1919.887Z',
    transform: 'translate(1.5 1.5) scale(0.0109375)',
    fillRule: 'evenodd',
  },

  /* ── Téléphone — public/svg/phone_02.svg (grille 16, combiné géométrique) ─ */
  phone: {
    d: 'M1 5V1H7V5L4.5 7.5L8.5 11.5L11 9H15V15H11C5.47715 15 1 10.5228 1 5Z',
    transform: 'scale(1.5)',
  },

  /* ── WhatsApp — public/svg/whatsapp_02.svg ───────────────────────────────
     La bulle verte devient la surface, le combiné blanc l'évide. Le dessin
     d'origine occupe x de 2 à 32 dans un cadre de 32 : le `translate` le
     recentre avant la mise à l'échelle. */
  whatsapp: {
    d: 'M17,0C8.7,0,2,6.7,2,15c0,3.4,1.1,6.6,3.2,9.2l-2.1,6.4c-0.1,0.4,0,0.8,0.3,1.1C3.5,31.9,3.8,32,4,32 c0.1,0,0.3,0,0.4-0.1l6.9-3.1C13.1,29.6,15,30,17,30c8.3,0,15-6.7,15-15S25.3,0,17,0z M25.7,20.5c-0.4,1.2-1.9,2.2-3.2,2.4C22.2,23,21.9,23,21.5,23c-0.8,0-2-0.2-4.1-1.1c-2.4-1-4.8-3.1-6.7-5.8 L10.7,16C10.1,15.1,9,13.4,9,11.6c0-2.2,1.1-3.3,1.5-3.8c0.5-0.5,1.2-0.8,2-0.8c0.2,0,0.3,0,0.5,0c0.7,0,1.2,0.2,1.7,1.2l0.4,0.8 c0.3,0.8,0.7,1.7,0.8,1.8c0.3,0.6,0.3,1.1,0,1.6c-0.1,0.3-0.3,0.5-0.5,0.7c-0.1,0.2-0.2,0.3-0.3,0.3c-0.1,0.1-0.1,0.1-0.2,0.2 c0.3,0.5,0.9,1.4,1.7,2.1c1.2,1.1,2.1,1.4,2.6,1.6l0,0c0.2-0.2,0.4-0.6,0.7-0.9l0.1-0.2c0.5-0.7,1.3-0.9,2.1-0.6 c0.4,0.2,2.6,1.2,2.6,1.2l0.2,0.1c0.3,0.2,0.7,0.3,0.9,0.7C26.2,18.5,25.9,19.8,25.7,20.5z',
    transform: 'translate(0.1 0.8) scale(0.7)',
    fillRule: 'evenodd',
  },

  /* ── GitHub — public/svg/github.svg ──────────────────────────────────────
     Le tracé était dessiné loin de l'origine (deux `translate` imbriqués dans
     le fichier d'export) : le `translate` les résume, x de 84 à 104 et y de
     7399 à 7419 pour un cadre de 20. */
  github: {
    d: 'M94,7399 C99.523,7399 104,7403.59 104,7409.253 C104,7413.782 101.138,7417.624 97.167,7418.981 C96.66,7419.082 96.48,7418.762 96.48,7418.489 C96.48,7418.151 96.492,7417.047 96.492,7415.675 C96.492,7414.719 96.172,7414.095 95.813,7413.777 C98.04,7413.523 100.38,7412.656 100.38,7408.718 C100.38,7407.598 99.992,7406.684 99.35,7405.966 C99.454,7405.707 99.797,7404.664 99.252,7403.252 C99.252,7403.252 98.414,7402.977 96.505,7404.303 C95.706,7404.076 94.85,7403.962 94,7403.958 C93.15,7403.962 92.295,7404.076 91.497,7404.303 C89.586,7402.977 88.746,7403.252 88.746,7403.252 C88.203,7404.664 88.546,7405.707 88.649,7405.966 C88.01,7406.684 87.619,7407.598 87.619,7408.718 C87.619,7412.646 89.954,7413.526 92.175,7413.785 C91.889,7414.041 91.63,7414.493 91.54,7415.156 C90.97,7415.418 89.522,7415.871 88.63,7414.304 C88.63,7414.304 88.101,7413.319 87.097,7413.247 C87.097,7413.247 86.122,7413.234 87.029,7413.87 C87.029,7413.87 87.684,7414.185 88.139,7415.37 C88.139,7415.37 88.726,7417.2 91.508,7416.58 C91.513,7417.437 91.522,7418.245 91.522,7418.489 C91.522,7418.76 91.338,7419.077 90.839,7418.982 C86.865,7417.627 84,7413.783 84,7409.253 C84,7403.59 88.478,7399 94,7399',
    transform: 'translate(1.5 1.5) scale(1.05) translate(-84 -7399)',
  },

  /* ── LinkedIn — public/svg/linkedin.svg ──────────────────────────────────
     Le fichier superpose un disque bleu et un « in » blanc. Ici, le disque est
     écrit en deux demi-arcs (un cercle complet ne s'écrit pas d'un seul arc) et
     les deux tracés du « in », inchangés, l'évident. */
  linkedin: {
    d: 'M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z M18.7747 14.2839C18.7747 15.529 17.8267 16.5366 16.3442 16.5366C14.9194 16.5366 13.9713 15.529 14.0007 14.2839C13.9713 12.9783 14.9193 12 16.3726 12C17.8267 12 18.7463 12.9783 18.7747 14.2839ZM14.1199 32.8191V18.3162H18.6271V32.8181H14.1199V32.8191Z M22.2393 22.9446C22.2393 21.1357 22.1797 19.5935 22.1201 18.3182H26.0351L26.2432 20.305H26.3322C26.9254 19.3854 28.4079 17.9927 30.8101 17.9927C33.7752 17.9927 35.9995 19.9502 35.9995 24.219V32.821H31.4922V24.7838C31.4922 22.9144 30.8404 21.6399 29.2093 21.6399C27.9633 21.6399 27.2224 22.4999 26.9263 23.3297C26.8071 23.6268 26.7484 24.0412 26.7484 24.4574V32.821H22.2411V22.9446H22.2393Z',
    transform: 'translate(-0.6 -0.6) scale(0.525)',
    fillRule: 'evenodd',
  },

  /* ── Instagram — dessiné ici ─────────────────────────────────────────────
     `public/svg/instagram.svg` ne contient aucun tracé : c'est une image PNG
     encodée en base64, posée dans un motif (`fill="url(#pattern-1)"`). Elle
     resterait donc colorée dans les deux thèmes, et floue en petit. Le glyphe
     est redessiné à la géométrie officielle de la marque : cadre arrondi,
     objectif concentrique, témoin. Épaisseur constante de 1,7 — les rayons
     intérieurs (4,3 et 3) valent les rayons extérieurs moins cette épaisseur,
     sans quoi les angles du cadre paraîtraient plus épais que ses côtés. */
  instagram: {
    d: 'M8 2h8a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z M8 3.7h8A4.3 4.3 0 0 1 20.3 8v8A4.3 4.3 0 0 1 16 20.3H8A4.3 4.3 0 0 1 3.7 16V8A4.3 4.3 0 0 1 8 3.7Z M12 7.3A4.7 4.7 0 1 0 12 16.7A4.7 4.7 0 1 0 12 7.3Z M12 9A3 3 0 1 1 12 15A3 3 0 1 1 12 9Z M17.45 5.05A1.3 1.3 0 1 0 17.45 7.65A1.3 1.3 0 1 0 17.45 5.05Z',
    fillRule: 'evenodd',
  },

  /* ── Localisation — public/svg/location_01.svg ───────────────────────────
     Le fichier empile cinq tracés en trois couleurs. Deux sont retenus : la
     goutte pleine, et le cercle qui l'évide. */
  location: {
    d: 'M32,0C18.745,0,8,10.745,8,24c0,5.678,2.502,10.671,5.271,15l17.097,24.156C30.743,63.686,31.352,64,32,64 s1.257-0.314,1.632-0.844L50.729,39C53.375,35.438,56,29.678,56,24C56,10.745,45.255,0,32,0z M32,32 c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S36.418,32,32,32z',
    transform: 'translate(1 1) scale(0.34375)',
    fillRule: 'evenodd',
  },

  /* ── Heure locale — glyphe neutre dessiné pour ce site ───────────────────
     Anneau de 1,6 d'épaisseur, aiguilles en une seule surface. Les aiguilles
     sont bien dans le vide de l'anneau : la règle `evenodd` les remplit parce
     qu'elles s'y trouvent à une profondeur impaire. */
  clock: {
    d: 'M12 1.5A10.5 10.5 0 1 0 12 22.5A10.5 10.5 0 1 0 12 1.5Z M12 3.1A8.9 8.9 0 1 1 12 20.9A8.9 8.9 0 1 1 12 3.1Z M11.15 6.6h1.7v5.05l4.05 2.34-.85 1.47-4.9-2.83V6.6Z',
    fillRule: 'evenodd',
  },

  /* ── Disponibilité — glyphe neutre dessiné pour ce site ──────────────────
     Une pastille cerclée : le point plein dit « en service », l'anneau lui
     donne le même poids optique que les autres pictogrammes. */
  status: {
    d: 'M12 1.5A10.5 10.5 0 1 0 12 22.5A10.5 10.5 0 1 0 12 1.5Z M12 3.1A8.9 8.9 0 1 1 12 20.9A8.9 8.9 0 1 1 12 3.1Z M12 7.1A4.9 4.9 0 1 0 12 16.9A4.9 4.9 0 1 0 12 7.1Z',
    fillRule: 'evenodd',
  },
} as const satisfies Record<string, ContactIconShape>;

/** Noms valides. Une faute de frappe est une erreur de compilation. */
export type ContactIconName = keyof typeof CONTACT_ICONS;
