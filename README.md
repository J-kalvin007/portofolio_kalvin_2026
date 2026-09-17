# Portfolio de Kalvin Takoudjou

Site personnel d'un ingénieur logiciel full-stack, backend et mobile basé à Lomé.
Il présente ses projets en production — avec, sous chacun, le **schéma d'architecture animé** —,
son parcours et un formulaire de contact. Bilingue français / anglais.

Production : <https://portofolio-kalvin-2.vercel.app>

## Stack

| Rôle | Choix |
| --- | --- |
| Cadre | Next.js 16 (App Router, Turbopack, sortie `standalone`), React 19 |
| Langage | TypeScript strict |
| Styles | Tailwind CSS 4 + système de design à rôles (`app/design-system.css`) |
| Police | Poppins, seule police du site (`lib/fonts.ts`, auto-hébergée par `next/font`) |
| Langues | next-intl 4 — messages typés, parité fr / en vérifiée à la compilation |
| Formulaire | react-hook-form + Zod ; envoi par nodemailer (`app/api/sendEmail`) |
| Thème | zustand (préférence clair / sombre) + script anti-flash |
| Mouvement | CSS ; framer-motion uniquement dans la visionneuse d'images, chargée au premier clic |

## Démarrer

Node.js 24 et npm.

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run build        # production (pages statiques + serveur standalone)
npm run start
```

Variables d'environnement (`.env.local`) :

| Variable | Usage |
| --- | --- |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | Compte SMTP (Gmail) du formulaire de contact. Sans elles, l'API répond « service indisponible ». |
| `NEXT_PUBLIC_SITE_URL` | Facultatif. URL publique du site (balises canoniques, OpenGraph, sitemap). Sur Vercel, l'URL de production est détectée. |

Docker : `docker compose up --build` (image Node 24, serveur standalone sur le port 3000,
variables lues dans `.env.local`). Détails dans `DOCKER_GUIDE.md`.

## Structure

```text
app/
  [locale]/                 pages localisées (fr, en)
    page.tsx                accueil : reçu du profil, billets de projet, compétences, parcours
    projets/                catalogue : filtre, sommaire, fiches complètes + schémas
    propos/                 fiche d'identité, parcours, méthode, profil, recommandations
    contact/                coordonnées + formulaire
    layout.tsx              <html>, métadonnées du site, navigation, pied de page
    error.tsx, not-found.tsx
  api/sendEmail/route.ts    envoi du formulaire (validation, limites, pot de miel, débit)
  design-system.css         valeurs clair / sombre et rôles (bg-canvas, text-ink…)
  globals.css               base, italique, défilement, page d'erreur
components/
  architecture/             schéma d'architecture : SVG serveur + animation CSS
  project/                  billet de projet, galerie, visionneuse
  layout/                   barre de navigation, bouton de thème, pied de page, page d'erreur
  sections/                 bloc de contact réutilisé
  ui/                       styles partagés, en-têtes, ligne de reçu, flèche, heure locale
lib/
  data/projects.ts          projets (ordre, captures, stack, liens)
  data/architectures.ts     schéma de chaque projet (composants, liaisons, zones)
  architecture/layout.ts    géométrie des schémas (fonction pure)
  data/skills.ts            relevé de compétences
  seo.ts                    métadonnées complètes d'une page
  site.ts                   URL, coordonnées, liens publics, CV
messages/fr.json, en.json   tous les textes
public/                     captures (WebP), portrait, CV, logo
```

## Principes

- **Rendu serveur d'abord.** Les pages sont des composants serveur pré-rendus au build.
  Seuls de petits îlots s'exécutent dans le navigateur : heure locale, galeries, animation
  des schémas, filtre de la page Projets, formulaire, barre de navigation.
- **Système de design contraint.** Couleurs, tailles, espacements et ombres passent par
  des rôles (`app/design-system.css`), en clair comme en sombre. Contrastes du texte ≥ 4,5:1.
- **Contenu vrai.** Les chiffres affichés sont calculés à partir des données
  (nombre de projets, technologies les plus employées). Aucun chiffre non sourcé.
- **Accessibilité.** Lien d'évitement, focus visible, navigation clavier complète
  (menu, visionneuse, formulaire), mouvement réduit respecté, restitution textuelle des schémas.
- **Référencement.** Chaque page déclare sa canonique, ses versions linguistiques
  (`hreflang`, `x-default`), son aperçu de partage et sa carte X (`lib/seo.ts`).
- **Sécurité.** En-têtes HTTP et CSP (`next.config.ts`), API de contact validée,
  bornée en taille et en débit, pot de miel anti-robot.

## Ajouter un projet

1. Captures en WebP dans `public/images_projets/`.
2. Entrée dans `PROJECTS` (`lib/data/projects.ts`) : titre, catégorie, captures, stack,
   lien de production éventuel. L'ordre du tableau est l'ordre d'affichage.
3. Textes dans `messages/fr.json` **et** `messages/en.json`, sous `projects_data.<clé>` :
   `short` et `full` ; facultatifs : `domain` et `points` (liste des réalisations).
4. Schéma dans `ARCHITECTURES` (`lib/data/architectures.ts`). La compilation échoue si
   un projet n'a pas de schéma, ou si un libellé n'est pas traduit.

Le reçu de l'accueil, les filtres, le sommaire et le relevé de compétences se mettent à jour seuls.

## Documents

- `AUDIT_PROJET.md` — audit initial et feuille de route de la refonte.
- `DOCKER_GUIDE.md`, `DOCKER_MASTERCLASS.md` — conteneurisation.
- `i18n_walkthrough.md` — fonctionnement de next-intl.
