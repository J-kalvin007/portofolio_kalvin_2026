/**
 * @file contact.ts
 * @description Contrat du formulaire de contact, partagé par le formulaire
 * (`app/[locale]/contact/components/page.client.tsx`) et l'API
 * (`app/api/sendEmail/route.ts`).
 *
 * @remarks **Pourquoi un fichier partagé.** Les limites étaient écrites deux fois,
 * différemment : le formulaire n'imposait aucun maximum au nom ni au sujet, alors
 * que l'API refusait au-delà de 100 et 200 caractères. Un visiteur pouvait donc
 * remplir un formulaire valide à l'écran et recevoir un « Données invalides »
 * générique, sans savoir quel champ corriger. Une seule déclaration rend cette
 * divergence impossible.
 */

export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  subjectMin: 3,
  subjectMax: 200,
  messageMin: 10,
  messageMax: 2000,
} as const;

/**
 * Format d'adresse e-mail accepté, par le formulaire comme par l'API.
 *
 * C'est le motif qu'applique Zod à `z.string().email()` (`regexes.email`,
 * Zod 4). Il est déclaré ici pour que le formulaire valide les adresses sans
 * embarquer Zod dans le navigateur (environ 70 Ko compressés), et que l'API
 * l'applique explicitement : une adresse acceptée à l'écran l'est aussi par le
 * serveur, même si Zod change un jour son motif par défaut.
 */
export const EMAIL_PATTERN = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

/**
 * Nom du champ « pot de miel » : invisible pour les humains, rempli par les
 * robots qui complètent tous les champs d'un formulaire. L'API répond « succès »
 * sans rien envoyer lorsqu'il arrive rempli.
 */
export const HONEYPOT_FIELD = 'website';

/**
 * Taille maximale acceptée pour le corps JSON d'une requête (octets).
 * Le message le plus long autorisé (2 000 caractères, jusqu'à 4 octets chacun
 * en UTF-8) plus les autres champs tient largement sous cette borne ; au-delà,
 * la requête est refusée avant même d'être lue en mémoire.
 */
export const CONTACT_MAX_BODY_BYTES = 16 * 1024;
