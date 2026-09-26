/**
 * @file lib/site.ts
 * @description Constantes d'identité du site, partagées par le SEO, le sitemap,
 * le fichier robots et l'API d'envoi d'e-mails.
 *
 * @remarks **Pourquoi ce fichier existe.**
 * L'URL de base était redéclarée dans trois fichiers, avec trois valeurs de repli
 * différentes :
 *
 * | Fichier              | Repli utilisé                              |
 * |----------------------|--------------------------------------------|
 * | `[locale]/layout.tsx`| `http://localhost:3000`                    |
 * | `robots.ts` / `sitemap.ts` | `https://kalvin-portfolio.com`        |
 * | `api/sendEmail/route.ts`   | `https://portofolio-kalvin-2.vercel.app` |
 *
 * Conséquence concrète : si `NEXT_PUBLIC_SITE_URL` n'est pas défini au moment du
 * build — ce qui arrive facilement sur un environnement de préversion — le
 * sitemap déclare à Google des URL sur un domaine qui n'est pas le vôtre,
 * pendant que les balises canoniques pointent vers `localhost`. Une seule
 * déclaration supprime la classe entière de ce problème.
 */

import type { ContactIconName } from '@/components/ui/contact-icons';

/** Domaine de production. À aligner sur le domaine réellement servi. */
const PRODUCTION_URL = 'https://portofolio-kalvin-2.vercel.app';

/**
 * URL absolue du site, sans barre oblique finale.
 * Priorité : variable d'environnement explicite → URL fournie par Vercel → domaine de production.
 */
export const SITE_URL: string = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    PRODUCTION_URL
).replace(/\/+$/, '');

/** Langues servies par l'application. Doit rester aligné sur `i18n/routing.ts`. */
export const SITE_LOCALES = ['fr', 'en'] as const;

/** Langue par défaut, utilisée comme cible `x-default` dans le sitemap. */
export const DEFAULT_LOCALE: (typeof SITE_LOCALES)[number] = 'fr';

/** Chemins publics indexables, hors préfixe de langue. */
export const SITE_ROUTES = ['', '/propos', '/projets', '/contact'] as const;

/**
 * Date de dernière révision éditoriale du contenu.
 *
 * Volontairement figée : `new Date()` produisait un `lastmod` égal à l'instant du
 * build, ce qui déclarait à chaque déploiement que les quatre pages venaient
 * d'être modifiées. Les moteurs finissent par ignorer un `lastmod` qui change
 * sans que le contenu bouge. À mettre à jour lors d'une vraie révision.
 */
export const CONTENT_LAST_MODIFIED = new Date('2026-07-01T00:00:00.000Z');

/** Nom affiché du site (OpenGraph, e-mails transactionnels). */
export const SITE_NAME = 'Kalvin Portfolio';
/* ═══════════════════════════════════════════════════════════════════════════
   ▌ COORDONNÉES ET LIENS
   ───────────────────────────────────────────────────────────────────────────
   Source unique pour le pied de page, la page d'accueil et la page Contact.
   Ces valeurs étaient recopiées dans plusieurs composants.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Une ligne téléphonique : ce qui s'affiche, et ce que l'appareil doit composer.
 *
 * Les deux formes sont écrites séparément à dessein. `tel:` n'accepte aucune
 * espace ; les espaces de la forme affichée, elles, sont ce qui rend un numéro
 * lisible et mémorisable. Les dériver l'une de l'autre par une expression
 * régulière économiserait quatre lignes et introduirait une classe de bogues
 * silencieux — un indicatif mal découpé reste cliquable, donc personne ne le
 * remarque.
 */
export interface PhoneLine {
  readonly display: string;
  readonly href: string;
}

/**
 * Les deux lignes de Kalvin, **dans l'ordre d'affichage** : la première est
 * celle qu'il faut appeler en priorité, la seconde reste joignable. Les deux
 * sont montrées partout où les coordonnées apparaissent — un visiteur qui
 * n'obtient pas de réponse sur l'une essaie l'autre au lieu de partir.
 */
const PHONES: readonly PhoneLine[] = [
  { display: '+228 99 87 88 07', href: 'tel:+22899878807' },
  { display: '+228 92 51 56 85', href: 'tel:+22892515685' },
];

export const CONTACT = {
  email: 'takoudjoumoisecalvin@gmail.com',
  phones: PHONES,
  /** WhatsApp est rattaché à la ligne principale. */
  whatsappHref: 'https://wa.me/22899878807',
  city: 'Lomé',
  country: 'Togo',
  /** Fuseau IANA de Lomé (UTC+0, sans heure d'été). */
  timeZone: 'Africa/Lome',
} as const;

/** CV téléchargeable, servi depuis `public/cv/`. */
export const CV_PATH = '/cv/cv_kalvin.pdf';

/**
 * Un profil public : son nom de marque, son adresse, son pictogramme et
 * l'identifiant que le lien affiche.
 *
 * @remarks Le pictogramme est nommé ici, et non choisi par les composants. Sans
 * cela, le pied de page, la fiche de coordonnées et le menu mobile auraient
 * chacun leur table de correspondance « nom de réseau → dessin », et un réseau
 * ajouté n'apparaîtrait qu'à moitié. L'import du type est **effacé à la
 * compilation** (`import type`) : `lib/site.ts` reste utilisable par le sitemap,
 * le fichier robots et les routes d'API sans embarquer le moindre composant.
 */
export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: ContactIconName;
  /** Ce que le lien montre : identifiant, nom de profil ou numéro. */
  readonly handle: string;
}

/**
 * Profils publics, avant filtrage.
 *
 * @remarks Seuls les liens **réels** sont publiés. Le pied de page d'origine
 * affichait aussi Instagram, Snapchat, Telegram, Facebook, TikTok et LinkedIn,
 * mais leurs adresses étaient des gabarits (`https://instagram.com/`,
 * `https://t.me/yourusername`…) : ils menaient à la page d'accueil du réseau,
 * pas au profil de Kalvin. Une entrée dont l'adresse est vide est donc écartée
 * plus bas, et n'apparaît nulle part — plutôt qu'un lien mort proposé au
 * visiteur, ou qu'une adresse devinée.
 */
const PROFILES = [
  {
    label: 'WhatsApp',
    href: CONTACT.whatsappHref,
    icon: 'whatsapp',
    /* Le numéro plutôt qu'un « Écrire sur WhatsApp » : le visiteur voit
       immédiatement laquelle des deux lignes reçoit les messages. */
    handle: CONTACT.phones[0].display,
  },
  {
    /* Adresse nettoyée : le lien partagé depuis l'application LinkedIn porte une
       traîne de suivi (`?utm_source=share_via&utm_content=profile&
       utm_medium=member_android`) qui ne sert qu'aux statistiques de LinkedIn. */
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kalvin-takoudjou-6683a140a',
    icon: 'linkedin',
    handle: 'Kalvin Takoudjou',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/J-kalvin007',
    icon: 'github',
    handle: 'J-kalvin007',
  },
  {
    /* ⚠️ À compléter : coller ici l'adresse exacte du profil Instagram
       (`https://www.instagram.com/<identifiant>`) et l'identifiant dans
       `handle`. Tant que `href` est vide, l'entrée est écartée et Instagram
       n'apparaît ni dans le pied de page, ni dans la fiche de coordonnées.
       Aucune adresse n'est devinée : un lien inventé enverrait les visiteurs
       sur le profil de quelqu'un d'autre. */
    label: 'Instagram',
    href: '',
    icon: 'instagram',
    handle: '',
  },
] as const satisfies readonly SocialLink[];

/** Profils réellement publiables — ceux dont l'adresse est renseignée. */
export const SOCIAL_LINKS: readonly SocialLink[] = PROFILES.filter((profile) => profile.href !== '');
