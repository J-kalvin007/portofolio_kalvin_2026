# Portfolio de Kalvin Takoudjou

Site personnel d'un ingénieur logiciel full-stack, backend et mobile basé à Lomé (Togo).
Il présente neuf projets livrés — avec, sous chacun, son **schéma d'architecture animé** —,
un parcours, une méthode de travail et une **prise de rendez-vous** branchée sur un agenda réel.
Bilingue français / anglais.

Production : <https://portofolio-kalvin-2.vercel.app>

---

## Sommaire

1. [Ce que fait le site](#ce-que-fait-le-site)
2. [Démarrer](#démarrer)
3. [Variables d'environnement](#variables-denvironnement)
4. [Architecture](#architecture)
5. [Structure des dossiers](#structure-des-dossiers)
6. [Les pages, une par une](#les-pages-une-par-une)
7. [Les composants](#les-composants)
8. [Les modules](#les-modules)
9. [Les API](#les-api)
10. [Le système de design](#le-système-de-design)
11. [Les données](#les-données)
12. [Recettes de maintenance](#recettes-de-maintenance)
13. [Sécurité](#sécurité)
14. [Performance](#performance)
15. [Accessibilité](#accessibilité)
16. [Déploiement](#déploiement)
17. [Vérification](#vérification)
18. [Pièges connus](#pièges-connus)
19. [Conventions de code](#conventions-de-code)

---

## Ce que fait le site

| Page | Adresse | Ce qu'on y trouve |
| --- | --- | --- |
| Accueil | `/fr`, `/en` | Reçu du profil, trois projets phares en billets, les autres en lignes dépliables, relevé de compétences, parcours, appel au contact |
| Projets | `/fr/projets` | Grille de neuf cartes qui **se désintègrent** au clic, sommaire à aperçus, filtre par catégorie, et une **modale plein écran** par projet (pluies de texte et de logos, carrousel de captures, dossier complet, schéma d'architecture) |
| À propos | `/fr/propos` | Fiche d'identité avec **portrait agrandissable en plein écran**, registre du parcours, quatre principes de méthode, langues / atouts / centres d'intérêt, recommandations |
| Contact | `/fr/contact` | **Prise de rendez-vous** (calendrier, créneaux libres, formulaire) et, replié dessous, le formulaire de message |

Trois fonctions méritent d'être signalées à qui reprend le projet :

- **Les schémas d'architecture** sont calculés au build par une fonction pure et rendus en SVG statique ; seule l'animation est en CSS.
- **La modale des projets** tient son état dans l'adresse (`#projet-…`) : un projet se partage par un lien, le bouton « retour » le referme, et les neuf dossiers sont dans le HTML — donc indexables et lisibles sans JavaScript.
- **Le rendez-vous** lit les créneaux occupés dans Google Agenda et y inscrit l'événement retenu. Sans configuration, il continue de fonctionner en mode « demande », et l'e-mail part quand même.

## Démarrer

Node.js 24 (le `Dockerfile` en fait foi) et npm.

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # TypeScript strict, aucune erreur tolérée
npm run lint         # ESLint (eslint-config-next)
npm run build        # production : pages statiques + serveur standalone
npm run start        # sert le build (préférer `node .next/standalone/server.js`)
```

Après un `npm run build`, le serveur autonome attend ses fichiers statiques :

```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
PORT=3000 node .next/standalone/server.js
```

Docker : `docker compose up --build` (image `node:24-alpine`, utilisateur non root,
port 3000, variables lues dans `.env.local`).

## Variables d'environnement

Aucune n'est obligatoire pour que le site s'affiche ; chacune débloque une fonction.

| Variable | Sans elle | Où la trouver |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Les adresses canoniques, le sitemap et les aperçus de partage reprennent le domaine de repli inscrit dans `lib/site.ts`. **Le build l'annonce en clair.** | Votre domaine, sans barre oblique finale |
| `EMAIL_HOST_USER` | Les deux formulaires répondent « service momentanément indisponible » (503) | **Toujours requise** : c'est l'adresse qui reçoit, et celle qui expédie |
| `BREVO_API_KEY` | Le site retombe sur le SMTP | Clé d'API v3 de Brevo. **Recommandée sur Vercel** — voir ci-dessous |
| `EMAIL_HOST_PASSWORD` | Aucun envoi possible si `BREVO_API_KEY` est absente aussi | Mot de passe d'application Google (jamais celui du compte) |
| `GOOGLE_CALENDAR_ID` | Le calendrier propose les créneaux des règles, sans confronter l'agenda réel | Agenda Google → Paramètres → Identifiant de l'agenda |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | idem | Champ `client_email` de la clé JSON du compte de service |
| `GOOGLE_PRIVATE_KEY` | idem | Champ `private_key` de la même clé (les `\n` littéraux sont convertis) |

> L'agenda doit être **partagé** avec l'adresse du compte de service, avec le droit
> « Apporter des modifications aux événements ». Voir [Les API](#les-api).

### Quel transport d'e-mail choisir

`lib/mailer.ts` prend le premier transport configuré, dans cet ordre :

| Transport | Quand | Ce qu'il faut |
| --- | --- | --- |
| **API HTTP (Brevo)** | Plateforme sans serveur — **Vercel** | `BREVO_API_KEY` + `EMAIL_HOST_USER` validée comme expéditeur chez Brevo |
| **SMTP (Gmail)** | Serveur qui tourne en continu — Docker, VPS | `EMAIL_HOST_USER` + `EMAIL_HOST_PASSWORD` |
| *aucun* | — | Les formulaires répondent 503, le reste du site fonctionne |

Le SMTP est excellent sur un serveur permanent : la connexion se réutilise, la latence
disparaît. Sur une fonction sans serveur il est fragile — poignée de main TLS et
authentification à chaque démarrage à froid, refus fréquents de Google depuis les adresses
de centres de données (`535-5.7.8`), quota lié au compte personnel. L'API HTTP n'a aucun de
ces trois problèmes : une requête, une réponse.

Mettre Brevo en place : compte gratuit (300 e-mails par jour), validation de l'adresse
d'expédition dans *Expéditeurs et adresses IP*, puis une clé d'API v3.

## Architecture

### Le principe : tout au serveur, sauf ce qui doit bouger

Les quatre pages sont **pré-rendues au build** (8 documents : 4 pages × 2 langues).
Le JavaScript envoyé au navigateur se limite à des **îlots** — des composants isolés qui
ont besoin d'un état, d'un événement ou d'une mesure. Tout le reste est du HTML.

Les îlots, exhaustivement :

| Îlot | Rôle |
| --- | --- |
| `components/layout/Navbar` | Menu mobile, verrouillage du défilement |
| `components/layout/ThemeToggle`, `ThemeInitializer`, `lib/useTheme` | Préférence de thème |
| `components/ui/LocalTime` | Heure de Lomé, calculée chez le visiteur |
| `components/architecture/ArchitectureFigure` | Apparition et pause des flux d'un schéma |
| `components/project/TicketGallery`, `LightboxLayer`, `ImageLightbox` | Visionneuse plein écran (framer-motion, chargée au premier clic) |
| `components/project/ProjectCard`, `ProjectScene`, `ProjectCarousel`, `RainColumn` | Désintégration, scène de la modale, carrousel, pluies |
| `app/[locale]/projets/components/ProjectShowcase` | Filtre, sommaire, modale |
| `app/[locale]/propos/components/PortraitViewer` | Portrait en plein écran |
| `app/[locale]/contact/components/BookingCalendar`, `ContactForm` | Rendez-vous et message |
| `app/[locale]/error.tsx`, `not-found.tsx`, `global-error.tsx`, `components/layout/pageErreur` | Écrans d'erreur |

### Le trajet d'une requête

```text
proxy.ts ──► next-intl détecte la langue, redirige / vers /fr ou /en
   │          et préfixe les adresses sans langue
   ▼
app/layout.tsx ──► enveloppe vide : elle ne rend ni <html> ni <body>
   ▼
app/[locale]/layout.tsx ──► <html lang>, script anti-flash du thème,
   │                        métadonnées, Navbar, <main>, Footer
   ▼
app/[locale]/<page>/page.tsx ──► composant serveur : lit les données,
                                 traduit, compose les sections
```

### Les données

Aucune base, aucun CMS. Les données vivent dans des fichiers TypeScript typés
(`lib/data/`) et les textes dans deux catalogues JSON (`messages/`). Les types
des projets sont **dérivés du catalogue de traductions** : déclarer un projet
avec une clé inexistante est une erreur de compilation.

### Les langues

`next-intl` 4, messages **typés** : `types/i18n.types.ts` déclare `Messages` à partir de
`messages/fr.json` et vérifie dans les deux sens que `en.json` a exactement les mêmes clés.
Une clé oubliée casse la compilation, avec son nom dans le message d'erreur.
Le cheminement complet est décrit dans [`i18n_walkthrough.md`](./i18n_walkthrough.md).

### Le thème

Un script synchrone injecté dans le `<head>` pose la classe `dark` avant le premier
rendu visuel — c'est lui, et lui seul, qui empêche le flash blanc. Le store zustand
(`lib/useTheme.ts`) ne fait que suivre, une fois l'hydratation terminée.

## Structure des dossiers

```text
app/
  layout.tsx                    enveloppe racine vide (voir Architecture)
  globals.css                   base : police, défilement, sélection, guillemets, MOTIF DE FOND
  design-system.css             valeurs clair/sombre + rôles Tailwind (@theme)
  not-found.tsx                 404 hors contexte de langue (document complet)
  global-error.tsx              panne totale (document complet)
  robots.ts / sitemap.ts        fichiers d'indexation, construits depuis lib/site.ts
  [locale]/
    layout.tsx                  <html>, métadonnées, navigation, pied de page
    page.tsx                    ACCUEIL
    components/
      HomeSections.tsx          hero, projets, compétences, parcours (serveur)
      ProfileReceipt.tsx        le reçu du profil
      home.css
    projets/
      page.tsx                  PROJETS : prépare les entrées, rend le décor
      components/ProjectShowcase.tsx   filtre, sommaire, grille, modale (client)
    propos/
      page.tsx                  À PROPOS
      components/AboutSections.tsx     fiche, registre, méthode, profil, recommandations
      components/PortraitViewer.tsx    portrait plein écran (client)
      about.css
    contact/
      page.tsx                  CONTACT
      components/BookingCalendar.tsx   prise de rendez-vous (client)
      components/ContactForm.tsx       formulaire de message (client)
      components/ContactDetails.tsx    coordonnées (serveur)
      booking.css
    error.tsx / not-found.tsx   écrans d'erreur localisés
  api/
    sendEmail/route.ts          formulaire de message
    rendezvous/route.ts         créneaux libres (GET) et réservation (POST)

components/
  architecture/                 schéma d'architecture : SVG serveur + animation CSS
  layout/                       barre de navigation, pied de page, logotype, thème, erreurs
  project/                      billets, cartes, modale, scène, carrousel, galerie, visionneuse
  sections/ContactCta.tsx       bloc d'appel au contact, partagé par deux pages
  ui/                           primitives : en-têtes, flèche, heure locale, logos de technologies

lib/
  architecture/layout.ts        géométrie des schémas (fonction pure)
  booking/                      disponibilités, contrat, Google Agenda, fichier .ics
  data/                         projets, schémas, compétences — la matière du site
  contact.ts                    contrat du formulaire de message
  rate-limit.ts                 quota par adresse IP, partagé par les deux API
  seo.ts, site.ts               métadonnées et constantes d'identité
  fonts.ts, format.ts, html-escape.ts, theme-preference.ts, useTheme.ts

hooks/useClientSnapshot.ts      lecture sans écart d'hydratation
i18n/                           routing, navigation, requête, résolution des paramètres
messages/fr.json, en.json       431 clés par langue, 18 espaces de noms
types/i18n.types.ts             typage des traductions + garde de parité
public/                         images des projets, portrait, logo, CV, pictogrammes SVG
proxy.ts                        détection de langue (ex-middleware)
next.config.ts                  en-têtes, cache, moteur d'images, forme du build
```

Ordre de grandeur : **≈ 14 400 lignes** de TypeScript, TSX et CSS.

## Les pages, une par une

### Accueil — `app/[locale]/page.tsx`

Composant serveur. Compose cinq sections de `components/HomeSections.tsx` :

1. **Hero** — titre, chapeau, deux actions, et le **reçu du profil** (`ProfileReceipt`) : un ticket de caisse qui récapitule statut, poste, formation et nombre de projets par catégorie, avec l'heure locale de Lomé.
2. **Projets** — les quatre projets phares en `ProjectTicket` (variante `summary`), puis les cinq autres en lignes de reçu dépliables (`<details>`), chacune contenant son billet complet et son schéma.
3. **Relevé de compétences** — les 23 technologies groupées par usage, chacune avec son logo et le **nombre de projets du site qui l'emploient** (compté, pas écrit : `TECH_USAGE`).
4. **Parcours** — expérience et formation, en deux colonnes.
5. **Contact** — `components/sections/ContactCta`.

### Projets — `app/[locale]/projets/page.tsx`

Le composant serveur prépare pour chaque projet une **entrée** (numéro, titre, catégorie traduite, année, capture, résumé, description longue, captures, stack, liens) et un **dossier complet** (`ProjectDetail`, rendu serveur). Il confie le tout à `ProjectShowcase` (client), qui gère :

- le **filtre par catégorie**, avec désintégration des cartes écartées ;
- le **sommaire** à micro-aperçus, qui suit la lecture (`IntersectionObserver`) ;
- la **modale plein écran** : barre d'identité collante, scène à trois colonnes (`ProjectScene`), puis le dossier ;
- la navigation **d'un projet à l'autre** sans refermer.

Points structurants :

- L'état ouvert est lu dans l'adresse par `useSyncExternalStore` — aucun écart d'hydratation, aucun `setState` dans un effet.
- Les neuf dossiers sont **dans le HTML**, masqués par une classe (jamais par l'attribut `hidden`, voir [Pièges connus](#pièges-connus)). Sans JavaScript, l'ancre d'une carte les révèle en pleine page (`:target`).
- La scène n'est montée que pour le projet ouvert : aucune capture d'un projet fermé n'est téléchargée.

### À propos — `app/[locale]/propos/page.tsx`

Cinq sections de `components/AboutSections.tsx`, toutes rendues par le serveur :

- **`ProfileCard`** — un badge de papier tenu par une attache, avec le portrait (îlot `PortraitViewer`) et le tampon « Disponible ».
- **`CareerLedger`** — un registre : la période reste en marge pendant la lecture (`position: sticky`).
- **`MethodSection`** — quatre principes, numérotés en chiffres évidés.
- **`ProfileSection`** — langues (avec conduites de points), atouts, centres d'intérêt.
- **`RecommendationsSection`** — trois papiers inclinés et agrafés, qui se redressent au survol.

Les apparitions au défilement sont écrites en CSS (`animation-timeline: view()`), doublement gardées par `@supports` et `prefers-reduced-motion` : **la page ne contient aucun observateur JavaScript**.

### Contact — `app/[locale]/contact/page.tsx`

- **`ContactDetails`** (serveur) — les coordonnées en lignes de reçu, colonne collante : e-mail,
  les deux lignes téléphoniques, les profils publics, le lieu, l'heure locale et la disponibilité.
  Chaque ligne s'ouvre sur son pictogramme, tous alignés sur la même verticale.
- **`BookingCalendar`** (client) — trois étapes : une date, une heure, ses coordonnées. Le navigateur **ne connaît aucune règle de disponibilité** : il affiche la liste de créneaux libres que l'API lui donne.
- **`ContactForm`** (client) — le formulaire de message, replié sous le rendez-vous.

## Les composants

### `components/architecture/`

| Fichier | Rôle |
| --- | --- |
| `ArchitectureDiagram.tsx` | **Serveur.** Appelle `layoutArchitecture`, produit le SVG complet, et restitue le schéma en texte pour les lecteurs d'écran |
| `ArchitectureFigure.tsx` | **Client.** Ne pilote que des attributs `data-*` : apparition au défilement, pause des flux hors écran, mise en évidence au survol. Aucun rendu React |
| `architecture.css` | Tracé, apparition, flux, survol |

### `components/project/`

| Fichier | Rôle |
| --- | --- |
| `ProjectTicket.tsx` | Le billet d'un projet (variantes `summary` / `full`), suivi de son schéma |
| `ProjectCard.tsx` | La carte de la page Projets et sa **désintégration** : 24 fragments portant la capture, en CSS pur, pilotés par `data-phase` |
| `ProjectDetail.tsx` | Le dossier complet : identité, galerie, réalisations, technologies, schéma |
| `ProjectScene.tsx` | Le premier écran de la modale : deux pluies et le carrousel |
| `RainColumn.tsx` | La mécanique des pluies : deux moitiés identiques translatées de 50 %, raccord invisible par construction |
| `ProjectCarousel.tsx` | Carrousel natif (`scroll-snap`), vignettes, clavier, agrandissement |
| `TicketGallery.tsx` | Couverture + rail de vignettes, ouvre la visionneuse |
| `LightboxLayer.tsx` / `ImageLightbox.tsx` | Visionneuse plein écran (seul endroit où framer-motion est chargé) |
| `showcase.css`, `scene.css`, `project.css` | Styles correspondants |

### `components/layout/`

`Navbar` (barre fixe, menu mobile en lignes de reçu), `Footer`, `Logotype` (bord perforé
d'un ticket + nom en en-tête de journal), `ThemeToggle`, `ThemeInitializer`, `pageErreur`
(le billet refusé des écrans 404 et d'erreur).

### `components/ui/`

`PageHeader` et `SectionHead` (en-têtes), `Arrow`, `LocalTime`, `TechIcon` / `TechIconSprite`
(logos des technologies), `ContactIcon` (pictogrammes des coordonnées), `styles.ts` (recettes de
classes partagées : `BUTTON_PRIMARY`, `CONTAINER`, `FOCUS_RING`…), `receipt.css` (la ligne de reçu,
primitive partagée par quatre pages).

## Les modules

| Module | Exports | Rôle |
| --- | --- | --- |
| `lib/site.ts` | `SITE_URL`, `SITE_NAME`, `SITE_LOCALES`, `SITE_ROUTES`, `CONTACT`, `CV_PATH`, `SOCIAL_LINKS`, `CONTENT_LAST_MODIFIED` | **Source unique** de l'identité du site. L'URL était autrefois redéclarée dans trois fichiers, avec trois replis différents |
| `lib/seo.ts` | `pageMetadata`, `SHARE_IMAGE`, `TITLE_TEMPLATE`, `OPEN_GRAPH_LOCALES` | Métadonnées complètes d'une page : canonique, `hreflang`, OpenGraph, carte X |
| `lib/data/projects.ts` | `PROJECTS`, `FEATURED_PROJECTS`, `PROJECT_CATEGORIES`, `TECH_USAGE`, `projectAnchor`, `repositoryUrl`, types | Les neuf projets. `repositoryUrl` n'affiche un lien « Code source » que s'il désigne un vrai dépôt |
| `lib/data/architectures.ts` | `ARCHITECTURES`, types | Un schéma par projet : composants, liaisons, zones |
| `lib/data/skills.ts` | `SKILLS` | 23 technologies en 5 groupes d'usage |
| `lib/architecture/layout.ts` | `layoutArchitecture`, `VIEW_WIDTH`, types | Géométrie pure : place les boîtes, trace les liaisons orthogonales, calcule les zones |
| `lib/booking/availability.ts` | `BOOKING_RULES`, `freeSlots`, `isSlotBookable`, `bookingWindow`, `slotInstant`… | **Les règles de disponibilité, en un seul endroit** |
| `lib/booking/google-calendar.ts` | `isCalendarConfigured`, `fetchBusy`, `createEvent` | Google Agenda sans dépendance : JWT signé en RS256, deux appels REST |
| `lib/booking/ics.ts` | `buildInvite` | Fichier `.ics` conforme (CRLF, repli à 75 octets, échappements) |
| `lib/booking/contract.ts` | `BOOKING_LIMITS`, `MEETING_CHANNELS`, `BookingRequest` | Contrat partagé formulaire ↔ API |
| `lib/contact.ts` | `CONTACT_LIMITS`, `EMAIL_PATTERN`, `HONEYPOT_FIELD`, `CONTACT_MAX_BODY_BYTES` | Idem pour le message |
| `lib/mailer.ts` | `sendMail`, `mailTransport`, `MailerNotConfiguredError` | **Envoi des e-mails**, indépendant du transport : API HTTP (Brevo) ou SMTP (Gmail) |
| `lib/rate-limit.ts` | `createRateLimiter`, `clientIdentifier` | Quota par adresse IP, une implémentation pour les deux API |
| `lib/useTheme.ts` | `useThemeStore`, `useTheme`, `useThemeInit`, `useLanguage` | Préférence clair / sombre / système |
| `lib/fonts.ts` | `poppins`, `poppinsItalic`, `fontVariables` | **Poppins, seule police du site**, auto-hébergée |
| `lib/format.ts`, `lib/html-escape.ts`, `lib/theme-preference.ts` | `padNumber`, `escapeHtml`, `readPrefersDarkTheme` | Utilitaires |
| `hooks/useClientSnapshot.ts` | `useClientSnapshot`, `useIsClient` | Lire une valeur du navigateur **sans écart d'hydratation ni rendu supplémentaire** |
| `i18n/` | `routing`, `navigation`, `request`, `resolveLocale` | Configuration next-intl |

## Les API

Les deux routes tournent sur le runtime Node (`export const runtime = 'nodejs'`) : nodemailer
et `node:crypto` ouvrent des connexions réseau.

### `POST /api/sendEmail` — message de contact

| Étape | Comportement |
| --- | --- |
| Quota | 5 messages / heure / adresse IP → `429` avec `Retry-After` |
| Taille | Corps > 16 Kio → `413` |
| JSON | Illisible → `400` |
| Validation | Zod, mêmes limites que le formulaire → `400` |
| Pot de miel | Champ `website` rempli → `200` **sans rien envoyer** (le robot n'apprend pas qu'il a été vu) |
| Envoi | `lib/mailer.ts` (Brevo ou SMTP), `replyTo` = le visiteur, corps HTML en tableaux (Outlook) |
| Panne | SMTP non configuré → `503` ; autre → `500` |

### `GET /api/rendezvous` — créneaux libres

Renvoie `{ timeZone, slotMinutes, noticeHours, synced, days }` où `days` associe à chaque
journée ouverte la liste de ses heures libres. `synced` vaut `false` quand l'agenda n'est pas
joignable : les créneaux sont alors ceux des règles seules. Les plages occupées sont mises en
cache **60 secondes** pour absorber les rafales de visites.

### `POST /api/rendezvous` — réservation

1. Quota (3 / heure / adresse), taille, JSON, Zod, pot de miel — mêmes garanties que ci-dessus.
2. **Le créneau est revérifié contre l'agenda, sans cache** : une page laissée ouverte une heure propose des créneaux qui ne sont peut-être plus libres. Créneau pris → `409`.
3. L'événement est créé dans l'agenda — c'est lui qui rend le créneau occupé pour le visiteur suivant, **sans base de données**.
4. L'e-mail part avec le fichier `.ics` en pièce jointe ; le même `.ics` est renvoyé au visiteur.

> **Limite connue de Google.** Un compte de service ne peut pas inviter de participants sans
> délégation à l'échelle du domaine (réservée à Workspace). Le demandeur n'est donc pas « invité »
> dans l'événement : ses coordonnées figurent dans la description, et il reçoit le `.ics`.

## Le système de design

`app/design-system.css` déclare deux choses, dans cet ordre :

1. **Les valeurs**, en clair puis en sombre : `--ds-canvas`, `--ds-surface`, `--ds-ink`,
   `--ds-line`, `--ds-brand`, `--ds-paper`, `--ds-stamp`, `--ds-focus`, `--ds-grain`…
2. **Les rôles** (`@theme`), que les composants utilisent : `bg-canvas`, `text-ink-soft`,
   `border-line`, `shadow-e2`, `rounded-card`, `text-heading`, `py-section`, `ease-emphasized`…

Aucune couleur n'est jamais écrite en dur dans un composant. Changer une valeur ici la change partout,
dans les deux thèmes.

Autres jetons : `--radius-control|card|panel`, `--shadow-e1|e2|e3`,
`--motion-fast|base|slow`, `--ease-emphasized`.

**Le fond porte un grain** (`--ds-grain`) : un carré de 2 px tous les 40 px, à 5 % d'encre en clair
et 7 % en sombre. Il défile avec la page, et les surfaces opaques le recouvrent.

### Conventions CSS

- Les feuilles de composant (`showcase.css`, `about.css`, `booking.css`, `scene.css`…) sont
  **hors couche Tailwind** : importées par leur composant, elles l'emportent sur les utilitaires
  **sans aucun `!important`**.
- Les noms de classe sont préfixés par famille : `pj-` (projets), `ab-` (à propos), `bk-` (rendez-vous),
  `idc-` (fiche d'identité), `tk-` (billet), `rc-` (ligne de reçu), `lg-` (logotype), `err-` (erreur).
- Chaque feuille se termine par un bloc `@media (prefers-reduced-motion: reduce)` qui neutralise
  ses animations.

## Les données

| Fichier | Contenu | Conséquence d'une modification |
| --- | --- | --- |
| `lib/data/projects.ts` | 9 projets : slug, clé de traduction, catégorie, captures, stack, liens, année | Alimente l'accueil, la page Projets, le reçu du profil, le compteur d'usage des technologies |
| `lib/data/architectures.ts` | 9 schémas | Le schéma sous chaque projet |
| `lib/data/skills.ts` | 23 technologies, 5 groupes | Le relevé de compétences |
| `components/ui/tech-icons.ts` | 31 tracés d'icônes (**fichier généré**) | Les logos, partout |
| `components/ui/contact-icons.ts` | 8 tracés : e-mail, téléphone, WhatsApp, LinkedIn, GitHub, épingle, horloge, disponibilité | Les pictogrammes du pied de page, de la fiche de contact, du menu mobile et de la bande de faits |
| `messages/fr.json` / `en.json` | 431 clés × 2 langues, 18 espaces de noms | Tous les textes |

Les textes des projets (`projects_data.<clé>.short`, `.full`, `.domain`, `.points`) vivent dans les
catalogues de traductions, pas dans `projects.ts` : un projet a une description par langue.

## Recettes de maintenance

### Ajouter un projet

1. Ajouter ses textes dans `messages/fr.json` **et** `messages/en.json`, sous `projects_data.<clé>` (`short`, `full`, et si besoin `domain`, `points`).
2. Ajouter l'entrée dans `PROJECTS` (`lib/data/projects.ts`) avec `i18nKey: '<clé>'`. Le type l'exige : une clé inconnue ne compile pas.
3. Déposer les captures dans `public/images_projets/` (format WebP, ≤ 1600 px de large).
4. Ajouter son schéma dans `ARCHITECTURES` (`lib/data/architectures.ts`), sous la même clé.
5. `npm run typecheck && npm run build`.

Le projet apparaît alors sur l'accueil, dans la grille, le sommaire, le filtre, le sitemap et le compteur de technologies — **rien d'autre à toucher**.

### Ajouter une technologie et son logo

1. Ajouter son nom exact dans `lib/data/skills.ts` et/ou dans le `techStack` d'un projet.
2. Ajouter son tracé dans `components/ui/tech-icons.ts` (fichier généré : voir l'en-tête du fichier pour la provenance de chaque icône et les règles de mise à l'échelle).
3. Sans tracé, les composants affichent une pastille portant l'initiale — **aucune marque n'est jamais inventée**.

### Changer une coordonnée, ajouter un réseau

Tout est dans `lib/site.ts` — **et nulle part ailleurs**. Le pied de page, la fiche de la page
Contact, le menu mobile et la bande de faits de la page À propos s'y alimentent.

- **Un numéro** : `CONTACT.phones`, dans l'ordre d'affichage. `display` porte les espaces qui
  rendent le numéro lisible, `href` la forme que l'appareil compose (`tel:` n'accepte pas
  d'espace). Les deux numéros s'affichent partout, le premier en tête.
- **WhatsApp** : `CONTACT.whatsappHref` — c'est lui qui décide à quelle ligne arrivent les
  messages, indépendamment de l'ordre de `phones`.
- **Un réseau** : une entrée dans `PROFILES`, avec `label` (le nom de la marque, jamais traduit),
  `href`, `icon` (un nom de `contact-icons.ts` — le type refuse une faute de frappe) et `handle`
  (ce que le lien affiche). **Une entrée dont `href` est vide est écartée** : c'est ainsi
  qu'Instagram attend son adresse sans afficher de lien mort.

> ⚠️ **Instagram n'est pas publié** tant que son adresse n'est pas renseignée. Coller l'adresse
> exacte du profil dans l'entrée prévue suffit : le pictogramme, le pied de page et la fiche de
> contact suivent sans autre modification.

### Changer les disponibilités de rendez-vous

Tout est dans `BOOKING_RULES` (`lib/booking/availability.ts`) : jours ouverts, heures, durée d'un
créneau, préavis, horizon. Rien d'autre à modifier — le navigateur ne connaît pas ces règles.

### Ajouter une page

1. Créer `app/[locale]/<segment>/page.tsx` (composant serveur) avec son `generateMetadata` appuyé sur `pageMetadata`.
2. Ajouter le chemin dans `SITE_ROUTES` (`lib/site.ts`) : le sitemap et les `hreflang` suivent.
3. Ajouter le lien dans `components/layout/Navbar.tsx` et les textes dans les deux catalogues.

### Ajouter une langue

1. Copier `messages/fr.json` vers `messages/<code>.json` et traduire.
2. Ajouter le code dans `i18n/routing.ts` et dans `SITE_LOCALES` (`lib/site.ts`).
3. Ajouter sa correspondance OpenGraph dans `OPEN_GRAPH_LOCALES` (`lib/seo.ts`).
4. La garde de parité (`types/i18n.types.ts`) ne vérifie aujourd'hui que fr ↔ en : l'étendre si besoin.

### Changer le domaine

Définir `NEXT_PUBLIC_SITE_URL` sur la plateforme. Le repli en dur est dans `lib/site.ts`.

### Remplacer une image déjà en ligne

Changer son **nom de fichier**. Les images optimisées sont gardées 30 jours (`minimumCacheTTL`) :
sous le même nom, l'ancienne version peut rester affichée jusqu'à un mois chez un visiteur déjà venu.

## Sécurité

- **Politique de sécurité du contenu** (`next.config.ts`) : tout limité à l'origine, `object-src`, `frame-src`, `worker-src` et `frame-ancestors` à `'none'`. `'unsafe-inline'` reste nécessaire (données de rendu React, script anti-flash) ; le compromis est documenté dans le fichier.
- **En-têtes** : `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, HSTS deux ans. `X-Powered-By` retiré.
- **Moteur d'images bridé** : seuls `/images_projets/**` et `/images/**` peuvent être retaillés, une seule qualité, largeurs plafonnées. Sans cela, n'importe qui pouvait faire retailler n'importe quel fichier public autant de fois qu'il le voulait.
- **Formulaires** : pot de miel, quota par IP, corps borné, validation Zod côté serveur, échappement HTML, protection contre l'injection d'en-têtes SMTP.
- **Secrets** : jamais dans l'image Docker (`.dockerignore` exclut `.env*`), injectés à l'exécution.

## Performance

Mesures sur le build de production, en kilo-octets **compressés** :

| Page | JavaScript | CSS | HTML |
| --- | --- | --- | --- |
| `/fr` | 210 | 16 | 66 |
| `/fr/projets` | 230 | 18 | 74 |
| `/fr/propos` | 209 | 15 | 21 |
| `/fr/contact` | 217 | 14 | 19 |

Décisions qui expliquent ces chiffres :

- **framer-motion n'est chargé que par la visionneuse plein écran**, au premier clic — et par elle seule. Chargée sur les quatre pages, la bibliothèque pesait à elle seule une grande partie de leur JavaScript (voir l'en-tête de `components/layout/Navbar.tsx`).
- **Les logos de technologies sont des symboles réutilisés** (`TechIconSprite`) : sur la page Projets, où ils reviennent 90 fois, le HTML est passé de 93 à 68 Ko.
- **Les animations sont en CSS**, y compris les apparitions au défilement (`animation-timeline: view()`) et la désintégration des cartes.
- **Le carrousel utilise le défilement natif** (`scroll-snap`) plutôt qu'une bibliothèque.
- **Le portrait plein écran** utilise les transitions de vue du navigateur : aucun calcul, aucune mesure.

## Accessibilité

- Un seul `<h1>` par page, hiérarchie de titres respectée, sections étiquetées (`aria-labelledby`).
- Lien d'évitement, `<main id="main">`, ancres décalées sous la barre fixe (`scroll-padding-top`).
- Toute animation perpétuelle est neutralisée par `prefers-reduced-motion`.
- Les modales : `role="dialog"`, `aria-modal`, focus déplacé puis **rendu**, `Tab` confiné, `Échap`, défilement verrouillé.
- Les éléments décoratifs (pluies, schémas, fragments, conduites de points) sont `aria-hidden` ; leur contenu est restitué en texte ailleurs.
- Contrastes : les rôles d'encre du système de design sont choisis pour rester lisibles dans les deux thèmes.

## Déploiement

### Vercel

Le build détecte la plateforme (`VERCEL`) et **n'émet pas** le paquet autonome, inutile là-bas.
AVIF est activé côté Vercel uniquement (l'encodage y est amorti par leur réseau).

Checklist avant le premier déploiement :

1. Variables d'environnement (voir plus haut). **Sans `EMAIL_HOST_USER`, les deux formulaires répondent 503** — c'est la cause la plus fréquente d'un « service momentanément indisponible » en production.
2. `public/projets/` pèse ~137 Mo d'anciennes captures **qu'aucune page n'utilise** : les écarter du déploiement (`.vercelignore`) évite de les téléverser à chaque fois.
3. Vérifier que l'avertissement `NEXT_PUBLIC_SITE_URL` n'apparaît pas dans le journal de build.

### Docker

`docker compose up --build` produit une image multi-étapes : dépendances, build, puis une image
d'exécution qui ne contient que le paquet autonome et tourne sous un utilisateur non root.
Le port interne est 3000, `HOSTNAME=0.0.0.0`.

## Vérification

```bash
npm run typecheck   # TypeScript strict
npm run lint        # ESLint
npm run build       # doit finir sans avertissement
```

Le projet est également couvert par **283 vérifications de bout en bout** exécutées dans un vrai
Chrome (pages et référencement, sécurité, hydratation React, langues, fonctionnement sans
JavaScript, configuration de déploiement), plus une validation géométrique des neuf schémas.

> ⚠️ **Ces suites vivent aujourd'hui hors du dépôt**, dans le dossier de travail de l'outil qui les a
> écrites. Elles ne sont donc ni versionnées ni exécutables par `npm test`. Les rapatrier dans un
> dossier `tests/` est le premier chantier recommandé pour qui reprend le projet.

## Pièges connus

Chacun a coûté du temps ; ils sont documentés à l'endroit du code concerné.

| Piège | Ce qu'il faut savoir |
| --- | --- |
| **L'attribut `hidden` est intouchable** | Chrome l'applique avec une priorité qu'aucune règle d'auteur ne peut lever, pas même en `!important`. Les dossiers de projet sont donc masqués par une **classe** : sinon le repli `:target` (sans JavaScript) ne pouvait jamais s'appliquer |
| **`loading="lazy"` dans un défilement horizontal** | Chrome ne déclenche pas le chargement d'une image placée dans un conteneur à défilement horizontal, même amenée au centre. Le carrousel charge donc la capture affichée et ses deux voisines en `eager` |
| **Arrondir les coordonnées d'un tracé SVG** | En notation compacte, les indicateurs d'un arc sont collés au nombre suivant (`a.186.186 0 00.186-.185`). Un remplacement naïf en absorbe un : Docker avait disparu, PostgreSQL et Linux s'étaient tronqués |
| **Un ancêtre transformé casse `position: fixed`** | La fiche d'identité est inclinée : la vue plein écran du portrait est rendue dans un **portail** sur le corps de page. Même raison pour la visionneuse d'images |
| **Les transitions de vue photographient trop tôt** | L'image d'arrivée doit être **décodée avant** `startViewTransition`, sinon le mouvement agrandit un cadre vide |
| **Un nom de transition ne doit jamais être porté deux fois** | La vignette rend son `view-transition-name` à l'ouverture et le reprend à la fermeture |
| **`text-transform: capitalize` en français** | Il met une majuscule à chaque mot (« Lundi 28 Septembre »). Utiliser `::first-letter` |
| **Le cache de build de Turbopack peut servir du CSS périmé** | En cas de doute : `rm -rf .next` avant `npm run build` |
| **Les rangées d'une grille s'étirent** | Deux éléments côte à côte ont la même hauteur ; le plus court étirait ses propres rangées et son texte décrochait du titre. `align-content: start` |
| **`innerText` est vide dans un `<details>` fermé** | Utiliser `textContent` pour inspecter du contenu replié |

## Conventions de code

- **Tout est commenté en français**, avec un en-tête `@file` / `@description` / `@architecture` par fichier, et des `@remarks` pour les décisions non évidentes — en expliquant **pourquoi**, pas ce que le code fait déjà lire.
- Les composants sont **serveur par défaut** ; `'use client'` est une exception qui se justifie en commentaire.
- Les constantes partagées (limites, contrats, règles) vivent dans `lib/`, **jamais en double**.
- Les textes affichés passent toujours par les catalogues de traductions.
- Aucune donnée inventée : un chiffre affiché est un chiffre compté, un lien affiché est un lien qui existe.
