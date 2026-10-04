# Portfolio de Kalvin Takoudjou

Site personnel d'un ingénieur logiciel full-stack Kalvin Takoudjou, backend et mobile basé à Lomé (Togo).
Il présente neuf projets livrés — avec, sous chacun, son **schéma d'architecture animé** —,
un parcours, une méthode de travail et une **prise de rendez-vous** branchée sur un agenda réel.
Bilingue français / anglais. Le fond du site, ses lumières et l'éclairage de ses boutons se
règlent depuis une page d'administration protégée, la **régie** — sans toucher au code ni
redéployer.

Production : <https://portofolio-kalvin-2.vercel.app>
Production : <https://kalvin.dealndconsulting.com>

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
11. [Le moteur visuel et la régie](#le-moteur-visuel-et-la-régie)
12. [Les données](#les-données)
13. [Recettes de maintenance](#recettes-de-maintenance)
14. [Sécurité](#sécurité)
15. [Performance](#performance)
16. [Accessibilité](#accessibilité)
17. [Référencement](#référencement)
18. [Déploiement](#déploiement)
19. [Vérification](#vérification)
20. [Pièges connus](#pièges-connus)
21. [Conventions de code](#conventions-de-code)

---

## Ce que fait le site

| Page | Adresse | Ce qu'on y trouve |
| --- | --- | --- |
| Accueil | `/fr`, `/en` | Reçu du profil, trois projets phares en billets, les autres en lignes dépliables, relevé de compétences, parcours, appel au contact |
| Projets | `/fr/projets` | Grille de neuf cartes qui **se désintègrent** au clic, sommaire à aperçus, filtre par catégorie, et une **modale plein écran** par projet (pluies de texte et de logos, carrousel de captures, dossier complet, schéma d'architecture) |
| À propos | `/fr/propos` | Fiche d'identité avec **portrait agrandissable en plein écran**, registre du parcours, quatre principes de méthode, langues / atouts / centres d'intérêt, recommandations |
| Contact | `/fr/contact` | **Prise de rendez-vous** (calendrier, créneaux libres, formulaire) et, replié dessous, le formulaire de message |
| Régie | `/regie` | **Page d'administration**, absente de tout menu et jamais indexée : un écran de mot de passe, puis le réglage du motif du fond, des lumières et de l'éclairage des boutons, avec aperçu en direct |

Quatre fonctions méritent d'être signalées à qui reprend le projet :

- **Le moteur visuel** dessine le fond du site, les lumières qui suivent le curseur et l'éclairage des boutons à partir d'une configuration publiée depuis la régie. Éteint — c'est son état par défaut —, il n'ajoute **rien** à la page : le site est rendu exactement comme s'il n'existait pas. Voir [Le moteur visuel et la régie](#le-moteur-visuel-et-la-régie).
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
port 3000, variables lues dans `.env`).

Pour ouvrir la **régie** en local : renseigner `VISUAL_ADMIN_PASSWORD` dans `.env`, relancer
le serveur, puis aller sur `http://localhost:3000/regie` — ou cliquer dix fois d'affilée sur
le logotype du pied de page. Ce que vous y publiez est enregistré dans
`.data/visual-config.json` (ignoré par Git) : supprimer ce fichier ramène le site à son fond
d'origine.

## Variables d'environnement

**Toutes les variables sont déclarées et documentées dans deux fichiers jumeaux :**

| Fichier | Versionné | Rôle |
| --- | --- | --- |
| `.env.example` | **oui** | Le modèle : chaque variable, son rôle, où la trouver, et **aucune valeur** |
| `.env` | non (`.gitignore`) | Vos valeurs réelles, sur votre machine uniquement |

Pour démarrer : `cp .env.example .env`, puis remplir. En production, les mêmes variables se
saisissent dans les réglages de l'hébergeur (Vercel : *Settings → Environment Variables*) —
un fichier `.env` n'est jamais déployé.

> ⚠️ Les variables sont lues **au moment du build** pour les pages statiques : une valeur
> modifiée sur l'hébergeur n'a d'effet qu'après un nouveau déploiement.

> ⚠️ Une variable préfixée `NEXT_PUBLIC_` part **en clair** dans le JavaScript du navigateur.
> Aucun secret ne doit en porter le préfixe.

Aucune n'est obligatoire pour que le site s'affiche ; chacune débloque une fonction.

| Variable | Sans elle | Où la trouver |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Les adresses canoniques, le sitemap, le JSON-LD et les aperçus de partage reprennent le domaine de repli inscrit dans `lib/site.ts`. **Le build l'annonce en clair.** | Votre domaine, sans barre oblique finale. Aujourd'hui `https://kalvin.dealandconsulting.com` |
| `EMAIL_HOST_USER` | Les deux formulaires répondent « service momentanément indisponible » (503) | **Toujours requise** : c'est l'adresse qui reçoit, et celle qui expédie |
| `BREVO_API_KEY` | Le site retombe sur le SMTP | Clé d'API v3 de Brevo. **Recommandée sur Vercel** — voir ci-dessous |
| `EMAIL_HOST_PASSWORD` | Aucun envoi possible si `BREVO_API_KEY` est absente aussi | Mot de passe d'application Google (jamais celui du compte) |
| `GOOGLE_CALENDAR_ID` | Le calendrier propose les créneaux des règles, sans confronter l'agenda réel | Agenda Google → Paramètres → Identifiant de l'agenda |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | idem | Champ `client_email` de la clé JSON du compte de service |
| `GOOGLE_PRIVATE_KEY` | idem | Champ `private_key` de la même clé (les `\n` littéraux sont convertis) |
| `VISUAL_ADMIN_PASSWORD` | **La régie reste fermée** : sa page s'affiche, mais aucun mot de passe n'est accepté. Le site, lui, fonctionne normalement | Un mot de passe de votre choix. Vérifié par le serveur, jamais envoyé au navigateur — d'où l'absence du préfixe `NEXT_PUBLIC_`. **Aucune valeur de repli n'est écrite dans le code** |
| `UPSTASH_REDIS_REST_URL` | Hors Vercel, la régie enregistre dans un fichier local. **Sur Vercel, « Publier » est refusé** : il n'y a pas de disque durable | Console Upstash → base Redis → *REST API* |
| `UPSTASH_REDIS_REST_TOKEN` | idem | Même écran. Secret : il donne le droit de lire et d'écrire dans la base |

> L'agenda doit être **partagé** avec l'adresse du compte de service, avec le droit
> « Apporter des modifications aux événements ». Voir [Les API](#les-api).

> Les trois variables de la régie sont lues **à l'exécution**, par le serveur. Changer le mot
> de passe : modifier la valeur, puis relancer le serveur (ou redéployer sur Vercel). Toutes
> les sessions ouvertes avec l'ancien mot de passe sont fermées d'office, parce que la clé qui
> signe les sessions en est dérivée.

Trois autres variables sont posées par Vercel et jamais par vous : `VERCEL` (bascule la sortie
du build et l'encodage AVIF), `VERCEL_ENV` (`production` / `preview` / `development` — c'est
elle qui fait passer une **préversion** en `noindex`) et `NODE_ENV`.

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

### Où la régie enregistre ses réglages

Le site n'a pas de base de données. Pour qu'un réglage publié s'applique à tous les visiteurs,
il faut pourtant l'écrire quelque part de durable. `lib/visual/store.ts` choisit seul, d'après
les variables présentes :

| Stockage | Quand | Où |
| --- | --- | --- |
| **Upstash Redis** | `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` sont définies | Une clé Redis, lue et écrite par HTTPS. **Requis sur Vercel** |
| **Fichier local** | Sinon, hors Vercel — poste de développement, Docker | `.data/visual-config.json`, ignoré par Git |
| *aucun* | Sur Vercel sans Upstash | La régie s'ouvre et l'aperçu fonctionne, mais « Publier » répond 503 |

Upstash se pilote par de simples requêtes HTTPS : aucune dépendance à installer, aucune
connexion à maintenir, et une offre gratuite très au-delà du besoin (une clé, lue quelques
fois par jour). L'intégration Upstash du tableau de bord Vercel pose `KV_REST_API_URL` et
`KV_REST_API_TOKEN` à la place : ces deux noms sont acceptés aussi.

Mise en place : compte gratuit sur upstash.com → créer une base Redis → section *REST API* de
la base → copier l'URL et le jeton dans les variables de l'hébergeur → redéployer.

## Architecture

### Le principe : tout au serveur, sauf ce qui doit bouger

Les quatre pages sont **pré-rendues au build** (8 documents : 4 pages × 2 langues).
Le JavaScript envoyé au navigateur se limite à des **îlots** — des composants isolés qui
ont besoin d'un état, d'un événement ou d'une mesure. Tout le reste est du HTML.

La **régie** est la seule page rendue à la demande : à chaque visite, c'est le serveur qui
décide d'envoyer l'écran de mot de passe ou le panneau, d'après le cookie de session.

Les îlots, exhaustivement :

| Îlot | Rôle |
| --- | --- |
| `components/layout/Navbar` | Menu mobile, verrouillage du défilement |
| `components/visual/LightField` | Halo du curseur, traîne, lueur des motifs autour d'un bouton survolé. Lumières éteintes, il ne rend rien et n'installe aucun écouteur |
| `components/visual/SecretTrigger` | Compte les clics sur le logotype du pied de page : dix d'affilée ouvrent la régie |
| `app/regie/components/*` | La régie entière : connexion, panneau de réglages, aperçu en direct, import et export |
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
   │          (il ne voit ni /api, ni /regie, ni les fichiers statiques)
   ▼
app/layout.tsx ──► enveloppe vide : elle ne rend ni <html> ni <body>
   │
   ├─► app/[locale]/layout.tsx ──► <html lang>, script anti-flash du thème,
   │      │                        métadonnées, configuration visuelle publiée,
   │      │                        Navbar, <main>, Footer
   │      ▼
   │   app/[locale]/<page>/page.tsx ──► composant serveur : lit les données,
   │                                    traduit, compose les sections
   │
   └─► app/regie/layout.tsx ──► son propre <html lang="fr">, marqué noindex
          ▼
       app/regie/page.tsx ──► vérifie le cookie de session, puis rend
                              l'écran de mot de passe ou le panneau
```

Le site et la régie sont **deux documents distincts** posés sous la même enveloppe. On passe
de l'un à l'autre par un vrai chargement de page, jamais par une navigation côté client :
la régie arrive ainsi sans les feuilles ni l'état du site, et le site est toujours relu
avec les derniers réglages publiés.

### Les données

Aucune base, aucun CMS. Les données vivent dans des fichiers TypeScript typés
(`lib/data/`) et les textes dans deux catalogues JSON (`messages/`). Les types
des projets sont **dérivés du catalogue de traductions** : déclarer un projet
avec une clé inexistante est une erreur de compilation.

Une seule donnée vit hors du code : la **configuration visuelle** publiée depuis la régie
(voir [Où la régie enregistre ses réglages](#où-la-régie-enregistre-ses-réglages)). Elle est
lue par `app/[locale]/layout.tsx` au moment où une page est générée, puis figée dans le HTML :
aucune requête ne part vers le stockage pendant une visite.

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
    layout.tsx                  <html>, métadonnées, navigation, pied de page,
                                configuration visuelle publiée (VisualStyle, LightField)
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
  regie/                        LA RÉGIE — hors du dossier [locale], donc hors langues
    layout.tsx                  son propre document : <html lang="fr">, noindex, thème
    page.tsx                    serveur : cookie de session → connexion ou panneau
    regie.css                   toute l'interface de la régie (classes rg-)
    components/
      LoginForm.tsx             écran de mot de passe
      RegiePanel.tsx            sections, brouillon, publication, déconnexion, diagnostic
      controls.tsx              un contrôle par nature de réglage (interrupteur, curseur,
                                choix, couleur, motif), construit depuis le schéma
      Preview.tsx               aperçu en direct, avec le vrai moteur
      Transfer.tsx              exporter, importer, réinitialiser
  api/
    sendEmail/route.ts          formulaire de message
    rendezvous/route.ts         créneaux libres (GET) et réservation (POST)
    regie/session/route.ts      ouverture (POST) et fermeture (DELETE) de session
    regie/config/route.ts       lecture (GET) et publication (PUT) de la configuration

components/
  architecture/                 schéma d'architecture : SVG serveur + animation CSS
  layout/                       barre de navigation, pied de page, logotype, thème, erreurs
  project/                      billets, cartes, modale, scène, carrousel, galerie, visionneuse
  sections/ContactCta.tsx       bloc d'appel au contact, partagé par deux pages
  ui/                           primitives : en-têtes, flèche, heure locale, logos de technologies
  visual/                       moteur visuel côté page : feuille injectée, lumières,
                                éclairage des boutons, porte d'entrée de la régie

lib/
  architecture/layout.ts        géométrie des schémas (fonction pure)
  booking/                      disponibilités, contrat, Google Agenda, fichier .ics
  data/                         projets, schémas, compétences — la matière du site
  visual/                       moteur visuel : schéma des réglages, motifs, tuiles SVG,
                                variables CSS, préréglages, session, stockage
  contact.ts                    contrat du formulaire de message
  rate-limit.ts                 quota par adresse IP, partagé par les quatre API
  seo.ts, site.ts               métadonnées et constantes d'identité
  fonts.ts, format.ts, html-escape.ts, theme-preference.ts, useTheme.ts

hooks/useClientSnapshot.ts      lecture sans écart d'hydratation
i18n/                           routing, navigation, requête, résolution des paramètres
messages/fr.json, en.json       431 clés par langue, 18 espaces de noms
types/i18n.types.ts             typage des traductions + garde de parité
public/                         images des projets, portrait, logo, CV, pictogrammes SVG
proxy.ts                        détection de langue (ex-middleware) ; ignore /api et /regie
next.config.ts                  en-têtes, cache, moteur d'images, forme du build
.data/visual-config.json        réglages publiés depuis la régie quand aucun stockage
                                distant n'est configuré — créé à la première publication,
                                ignoré par Git
```

Ordre de grandeur : **≈ 20 800 lignes** de TypeScript, TSX et CSS, dont ≈ 4 800 pour le moteur
visuel et la régie (`lib/visual`, `components/visual`, `app/regie`, `app/api/regie`).

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

### Régie — `app/regie/page.tsx`

La page d'administration du fond et des lumières. Elle n'apparaît dans aucun menu, aucun plan
de site, aucun fichier `robots.txt` ; on y entre par son adresse, ou par **dix clics d'affilée
sur le logotype du pied de page**.

`page.tsx` est un composant **serveur**, rendu à chaque visite (`dynamic = 'force-dynamic'`).
Il lit le cookie de session et rend l'un ou l'autre :

- **`LoginForm`** — un champ, un bouton. Le formulaire ne sait pas si le mot de passe est bon :
  il l'envoie à `/api/regie/session`, puis recharge la page. Tant que la session n'est pas
  valide, **ni le panneau ni la configuration ne sont envoyés au navigateur** : il n'y a rien à
  débloquer en trafiquant l'état d'une page.
- **`RegiePanel`** — le panneau. Deux configurations y cohabitent : `published`, ce que le site
  affiche réellement, et `draft`, ce que les contrôles modifient. L'aperçu rend le brouillon ;
  le site ne change que lorsque « Publier » a réussi.

Les dix sections du panneau :

| Section | Contenu |
| --- | --- |
| Vue générale | L'interrupteur général des lumières, un résumé cliquable de chaque famille de réglages, le stockage en service |
| Motif, Lumières, Curseur, Ambiance, Boutons, Confort | Les 32 réglages du schéma, répartis par famille |
| Préréglages | Six configurations complètes à charger dans le brouillon |
| Configuration | Exporter (copier ou télécharger le JSON), importer (coller ou choisir un fichier), réinitialiser avec confirmation |
| Diagnostic | Ce que le moteur fait réellement : tuile en service, nombre de motifs à l'écran, poids du CSS ajouté, cadence du halo, préférences du système |

Les sections de réglages **ne sont pas écrites à la main** : chacune affiche les champs du
schéma (`VISUAL_FIELDS`) dont le chemin commence par son nom. Un réglage ajouté au schéma
trouve sa place dans le panneau sans qu'on touche à la régie.

La régie est en français et hors du routage par langue : ses textes sont dans ses composants,
pas dans `messages/`. C'est un outil réservé au propriétaire du site.

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

Le pied de page reste un composant serveur. Il ne contient qu'un îlot client de quelques
lignes, `SecretTrigger`, posé autour du logotype.

### `components/ui/`

`PageHeader` et `SectionHead` (en-têtes), `Arrow`, `LocalTime`, `TechIcon` / `TechIconSprite`
(logos des technologies), `ContactIcon` (pictogrammes des coordonnées), `styles.ts` (recettes de
classes partagées : `BUTTON_PRIMARY`, `CONTAINER`, `FOCUS_RING`…), `receipt.css` (la ligne de reçu,
primitive partagée par quatre pages).

`BUTTON_PRIMARY` et `BUTTON_SECONDARY` portent la classe `vx-glow` : c'est elle qui désigne un
bouton au moteur visuel. Elle ne fait rien tant que l'éclairage des boutons est éteint.

### `components/visual/`

La partie du moteur visuel qui vit dans la page. Tout le calcul est dans `lib/visual/`.

| Fichier | Rôle |
| --- | --- |
| `VisualStyle.tsx` | **Serveur.** Injecte dans le `<head>` la feuille des variables CSS de la configuration publiée (tuiles du fond, couleur des lumières). Ne rend rien avec les réglages par défaut |
| `LightField.tsx` | **Client.** Le halo qui suit le curseur, sa traîne, et la lueur des motifs autour d'un bouton survolé. Aucun état React : trois éléments déplacés par `transform`, dans une boucle qui ne tourne que pendant le mouvement |
| `SecretTrigger.tsx` | **Client.** Enveloppe invisible autour du logotype du pied de page : dix clics à moins de 0,9 s d'écart ouvrent `/regie`. Ni rôle, ni arrêt de tabulation, ni curseur particulier |
| `visual.css` | Calque des lumières, ambiances (fixe, respiration, scintillement), quatre effets de bouton, et les blocs mouvement réduit, contrastes forcés et impression |

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
| `lib/rate-limit.ts` | `createRateLimiter`, `clientIdentifier` | Quota par adresse IP, une seule implémentation pour les quatre API |
| `lib/visual/config.ts` | `VisualConfig`, `VISUAL_FIELDS`, `DEFAULT_VISUAL_CONFIG`, `sanitizeVisualConfig`, `readField`, `writeField`, `sameVisualConfig`, `unwrapVisualConfig`… | **Source unique des réglages du moteur visuel** : leur forme, leurs valeurs par défaut, leurs bornes et les libellés de la régie. Sans dépendance : importé à l'identique par le serveur et par le navigateur |
| `lib/visual/motifs.ts` | `MOTIFS`, `MOTIF_IDS`, `motifShape` | Les 14 formes du fond, chacune décrite par un tracé SVG à la taille demandée |
| `lib/visual/tile.ts` | `buildTile`, `buildTwinkleMask`, `tileSize`, `twinkleSize` | Fabrique la tuile SVG du fond — éteinte, allumée, et le masque de scintillement — toutes de mêmes dimensions |
| `lib/visual/css.ts` | `resolveVisual`, `visualStyleSheet`, `visualInlineStyle`, `visualAttributes`, `lightFieldSettings` | Traduit une configuration en variables CSS et en attributs `data-vx-*`. **Unique passerelle** entre les réglages et l'affichage |
| `lib/visual/presets.ts` | `VISUAL_PRESETS` | Les six préréglages : chacun ne décrit que ce qui le distingue des valeurs par défaut |
| `lib/visual/session.ts` | `verifyPassword`, `createSessionToken`, `isValidSessionToken`, `sessionCookieOptions`, `isSameOrigin`, `readBoundedBody`… | **Serveur.** Accès à la régie : comparaison du mot de passe à temps constant, jeton de session signé, garde-fous des requêtes |
| `lib/visual/store.ts` | `readPublishedVisualConfig`, `writePublishedVisualConfig`, `visualStorageKind`, `VISUAL_CONFIG_TAG` | **Serveur.** Enregistrement de la configuration publiée (Upstash ou fichier), et son étiquette de cache |
| `lib/useTheme.ts` | `useThemeStore`, `useTheme`, `useThemeInit`, `useLanguage` | Préférence clair / sombre / système |
| `lib/fonts.ts` | `poppins`, `poppinsItalic`, `fontVariables` | **Poppins, seule police du site**, auto-hébergée |
| `lib/format.ts`, `lib/html-escape.ts`, `lib/theme-preference.ts` | `padNumber`, `escapeHtml`, `readPrefersDarkTheme` | Utilitaires |
| `hooks/useClientSnapshot.ts` | `useClientSnapshot`, `useIsClient` | Lire une valeur du navigateur **sans écart d'hydratation ni rendu supplémentaire** |
| `i18n/` | `routing`, `navigation`, `request`, `resolveLocale` | Configuration next-intl |

## Les API

Les quatre routes tournent sur le runtime Node (`export const runtime = 'nodejs'`) : nodemailer
ouvre des connexions réseau, et `node:crypto` — qui signe les jetons de Google Agenda comme les
sessions de la régie — n'existe pas sur le runtime Edge.

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

### `POST /api/regie/session` — ouvrir une session de la régie

| Étape | Comportement |
| --- | --- |
| Origine | En-tête `Origin` d'un autre site → `403` |
| Configuration | `VISUAL_ADMIN_PASSWORD` absente → `503` : la régie est fermée |
| Quota | 8 tentatives / quart d'heure / adresse IP → `429` avec `Retry-After` |
| Taille | Corps > 2 Kio → `413` ; JSON illisible → `400` |
| Vérification | Comparaison **à temps constant** des empreintes SHA-256. Mot de passe faux **ou champ absent** → `401`, avec le même message : rien ne distingue les deux cas |
| Succès | `200` et cookie `regie_session` : `HttpOnly`, `SameSite=Strict`, `Secure` en production, valable 8 heures |

`DELETE /api/regie/session` efface le cookie : c'est la déconnexion.

### `GET /api/regie/config` — lire la configuration publiée

Exige une session valide (`401` sinon). Renvoie `{ config, storage }` : la configuration en
vigueur, relue sans cache, et le stockage en service (`upstash`, `file` ou `none`).

### `PUT /api/regie/config` — publier une configuration

1. Origine, session, quota (30 enregistrements / minute), taille (8 Kio), JSON — dans cet ordre.
2. **La configuration reçue n'est jamais enregistrée telle quelle.** Elle passe par
   `sanitizeVisualConfig` : chaque nombre est ramené dans ses bornes, chaque couleur vérifiée
   (`#rrggbb`), chaque choix pris dans sa liste, tout champ inconnu écarté. Ce qui est écrit —
   puis injecté dans une feuille de style — est une configuration que le serveur a reconstruite.
3. Écriture dans le stockage. Aucun stockage disponible → `503`, avec la marche à suivre.
4. Les pages sont périmées : `revalidateTag('visual-config')` et `revalidatePath('/', 'layout')`.
   **La visite suivante régénère la page** avec les nouveaux réglages — sans redéploiement.
5. Réponse : la configuration réellement enregistrée, que la régie affiche à la place du brouillon.

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

**Le fond porte un grain** (`--ds-grain`) : un carré de 2 px tous les 40 px, à 10,5 % d'encre en
clair et 7 % en sombre. Il défile avec la page, et les surfaces opaques le recouvrent. C'est le
fond **d'origine** : la régie peut le remplacer par un autre motif, sans toucher à ce fichier
(voir [Le moteur visuel et la régie](#le-moteur-visuel-et-la-régie)).

### Conventions CSS

- Les feuilles de composant (`showcase.css`, `about.css`, `booking.css`, `scene.css`, `visual.css`…)
  sont **hors couche Tailwind** : importées par leur composant, elles l'emportent sur les utilitaires
  **sans aucun `!important`**.
- Les noms de classe sont préfixés par famille : `pj-` (projets), `ab-` (à propos), `bk-` (rendez-vous),
  `idc-` (fiche d'identité), `tk-` (billet), `rc-` (ligne de reçu), `lg-` (logotype), `ft-` (pied de
  page), `err-` (erreur), `vx-` (moteur visuel), `rg-` (régie).
- Chaque feuille se termine par un bloc `@media (prefers-reduced-motion: reduce)` qui neutralise
  ses animations.

### Adaptation aux écrans

Le site est vérifié de 320 à 1280 px de large : **aucune page ne déborde horizontalement**.
Les seuils sont ceux de Tailwind (`sm` 640 px, `lg` 1024 px), complétés par des requêtes de
conteneur là où c'est la place disponible, et non l'écran, qui compte.

| Élément | Petit écran | À partir du seuil |
| --- | --- | --- |
| **Pied de page** | Une seule colonne, **entièrement centrée sur l'axe de l'écran** : logotype, texte, intitulés, liens, coordonnées, mentions | `sm` : deux colonnes puis quatre (`lg`), alignées à gauche — des colonnes côte à côte se lisent par leur bord commun |
| **Reçu du profil** (accueil) | Libellé et valeur passent à la ligne au lieu de se chevaucher (`rc-lines--wrap`) | Sur une ligne, reliés par leur conduite de points |
| **Modale d'un projet** | Identité empilée sous 480 px ; pastille d'accès au dossier centrée sous 1024 px | Identité sur une ligne ; pastille dans sa colonne |
| **Carrousel d'un projet** | Téléphone tenu en paysage : la hauteur du cadre suit celle de l'écran (`100svh`), les vignettes restent visibles | Cadre au format des captures |
| **Portrait** (À propos, plein écran) | Largeur de l'écran, hauteur déduite du format 2 : 3 — l'image n'est plus étirée | Hauteur plafonnée à 88 % de l'écran |
| **Bande de faits** (À propos) | Chaque séparateur appartient à son élément : aucun trait orphelin en fin de ligne quand la bande se replie | Une ligne, éléments séparés par un trait |
| **Créneaux de rendez-vous** | Deux colonnes sans défilement interne quand le calendrier dispose de moins de 544 px | Grille défilante |
| **Écrans d'erreur** | Le code et le tampon passent sur deux lignes quand la largeur manque (écran de 320 px) | Côte à côte |
| **Régie** | L'aperçu d'abord, puis les sections en pastilles qui défilent, puis les réglages | 768 px : sections et réglages sur deux colonnes ; 1152 px : trois colonnes, l'aperçu restant à l'écran pendant qu'on fait défiler les réglages |

Deux règles tenues partout :

- **le centrage du pied de page tient en peu de lignes**, parce que `text-align` s'hérite : posé une
  fois sur la grille, il centre tout ce qui est du texte. Seuls les blocs en grille ou en `flex`
  demandent une règle de plus (`justify-*`), commentée sur place ;
- **le logotype ne se recentre jamais** : `.lg` fixe `text-align: start`, pour que le nom reste
  calé sur son bord perforé quel que soit l'alignement du conteneur.

## Le moteur visuel et la régie

Le fond du site — son motif, ses lumières, l'éclairage de ses boutons — n'est plus écrit en dur.
Il est **calculé à partir d'une configuration**, que le propriétaire du site règle et publie
depuis la régie.

### La règle qui prime : éteint, il n'existe pas

La configuration par défaut est le site d'origine : fond de points, lumières éteintes. Avec
elle, le moteur n'émet **rien** — aucune feuille de style, aucun attribut, aucun élément, aucun
écouteur. `<main>` est rendu sans classe, comme avant. Tout ce qui suit ne s'applique qu'à
partir du moment où un réglage est publié.

### De la configuration à l'écran

```text
lib/visual/config.ts     VisualConfig + VISUAL_FIELDS : la forme, les valeurs par défaut,
        │                les bornes et les libellés de chaque réglage
        │  sanitizeVisualConfig() — toute valeur entrante passe par là
        ▼
lib/visual/tile.ts       le motif → une tuile SVG (éteinte, allumée, masque de scintillement)
lib/visual/css.ts        la configuration → variables CSS (--vx-*, --ds-grain)
        │                et attributs (data-vx, data-vx-ambient, data-vx-buttons)
        ▼
app/[locale]/layout.tsx  lit la configuration publiée, puis pose :
        ├─ <VisualStyle>   la feuille de variables, dans le <head>
        ├─ data-vx-*       sur <html>
        └─ <LightField>    dans <main>
        ▼
components/visual/visual.css   les règles qui lisent ces variables et ces attributs
```

Trois choix portent tout le reste :

- **Le fond reste une image CSS répétée.** Une petite tuile SVG, dessinée une fois, que le
  navigateur recopie sur toute la page. Aucun motif n'est un élément de la page, aucun n'est
  animé individuellement : mille points à l'écran coûtent autant qu'un seul.
- **Les lumières sont la même tuile, en couleur.** Le halo du curseur est un carré qui porte la
  tuile *allumée*, percé d'un masque rond et posé sur le fond. Les deux tuiles sortent de la
  même fonction : elles se superposent **au pixel près**, et un motif allumé recouvre exactement
  son jumeau éteint — y compris pendant le défilement.
- **Le hasard est déterministe.** La dispersion, la profondeur et la seconde couleur tirent
  leurs écarts d'un générateur semé par la position du motif : le serveur et le navigateur
  produisent le même fond, d'une visite à l'autre. `Math.random()` donnerait un fond différent
  à chaque rendu, donc un écart d'hydratation.

### Les réglages

33 réglages, tous décrits dans `VISUAL_FIELDS` : c'est ce tableau qui fournit à la fois la
valeur par défaut, les bornes de la validation et le libellé affiché dans la régie.

| Famille | Réglages |
| --- | --- |
| **Général** | Lumières du site (interrupteur) |
| **Motif** | Forme (14 au choix), taille (1 à 14 px), espacement (16 à 96 px), rotation, présence, disposition (grille ou quinconce), dispersion, profondeur, encre du motif éteint |
| **Lumières** | Couleur en thème clair, couleur en thème sombre, seconde couleur et sa part, éclat, halo autour de chaque motif |
| **Curseur** | Halo du curseur (oui / non), rayon (80 à 420 px), force, inertie, traîne, atténuation (diffuse, régulière, nette) |
| **Ambiance** | Mode (éteinte, fixe, respiration, scintillement), niveau, durée d'un cycle |
| **Boutons** | Éclairage (oui / non), effet (halo, bordure, reflet, suivi du curseur), force, portée, durée de l'allumage, allumer aussi les motifs autour du bouton |
| **Confort** | Lumière au toucher sur écran tactile, ambiance animée sur téléphone |

Les **14 motifs** : carré, point, anneau, croix droite, croix oblique, losange, triangle,
hexagone, étoile, étincelle, tiret, chevron, perforation, tampon.

Les **6 préréglages** : *Origine* (le site tel qu'il était), *Discret*, *Élégant*, *Luxe*,
*Interactif*, *Nuit*. Chacun charge une configuration complète dans le brouillon, à retoucher
avant de publier.

### Ce que le visiteur voit

- **Le halo du curseur** — les motifs proches de la souris s'allument, avec une inertie et une
  traîne réglables. Sur écran tactile il n'y a pas de curseur, donc pas de halo ; l'option
  « lumière au toucher » allume un instant les motifs sous le doigt.
- **L'ambiance** — tous les motifs sont éclairés faiblement, à niveau fixe, en respiration
  lente ou en scintillement. C'est une animation CSS : aucun JavaScript.
- **Les boutons** — les boutons principaux et secondaires du site, ainsi que les boutons de
  contact de la barre de navigation, s'éclairent au survol **et au focus clavier**. Quatre
  effets : un halo diffus, un point de lumière qui fait le tour de la bordure, un reflet qui
  traverse le bouton, ou une lumière qui suit le curseur à l'intérieur. En option, les motifs
  du fond s'allument aussi autour du bouton.
- **Les surfaces opaques recouvrent les lumières** comme elles recouvrent le motif : billets,
  panneaux et sections pleines passent devant. Les lumières ne se voient que dans les
  respirations de la page.

### La régie, pas à pas

1. **Entrer** — dix clics d'affilée sur le logotype du pied de page (moins de 0,9 s entre deux
   clics), ou l'adresse `/regie`.
2. **S'identifier** — le mot de passe de `VISUAL_ADMIN_PASSWORD`. La session dure 8 heures.
3. **Régler** — chaque modification s'applique aussitôt à l'**aperçu**, qui utilise le vrai
   moteur. Le site, lui, ne bouge pas : on travaille sur un brouillon.
4. **Publier** — le serveur valide, enregistre, et périme les pages. La visite suivante du site
   affiche les nouveaux réglages. « Annuler » ramène le brouillon à ce qui est publié.
5. **Sortir** — « Voir le site » recharge le site ; l'icône de sortie ferme la session.

> **Les dix clics ne sont pas une protection.** C'est une façon de ne pas afficher de lien
> « Administration » sur un portfolio. Une adresse finit toujours par se savoir : la protection
> réelle est le mot de passe, vérifié par le serveur. Connaître `/regie` ne donne accès à rien.

### Pourquoi une page publiée s'applique tout de suite

Les pages du site sont pré-rendues : la configuration est figée dans leur HTML. Pour qu'une
publication prenne effet sans redéploiement, chaque page est inscrite sous une **étiquette de
cache** (`visual-config`). Publier invalide cette étiquette ; la visite suivante régénère la
page. Le visiteur ne paie jamais ce calcul : il reçoit toujours une page déjà prête.

**Hors Vercel, un filet de sécurité.** Sur Vercel, le build lit le même stockage que le site
en service : les pages sont justes dès le déploiement. Une image Docker, elle, est construite
sans les variables de production ni le disque du serveur — ses pages partent avec la
configuration par défaut. Elles reçoivent donc une durée de vie de **cinq minutes** : après un
redéploiement, la configuration publiée réapparaît d'elle-même, sans qu'il faille republier.

## Les données

| Fichier | Contenu | Conséquence d'une modification |
| --- | --- | --- |
| `lib/data/projects.ts` | 9 projets : slug, clé de traduction, catégorie, captures, stack, liens, année | Alimente l'accueil, la page Projets, le reçu du profil, le compteur d'usage des technologies |
| `lib/data/architectures.ts` | 9 schémas | Le schéma sous chaque projet |
| `lib/data/skills.ts` | 23 technologies, 5 groupes | Le relevé de compétences |
| `components/ui/tech-icons.ts` | 31 tracés d'icônes (**fichier généré**) | Les logos, partout |
| `components/ui/contact-icons.ts` | 8 tracés : e-mail, téléphone, WhatsApp, LinkedIn, GitHub, épingle, horloge, disponibilité | Les pictogrammes du pied de page, de la fiche de contact, du menu mobile et de la bande de faits |
| `messages/fr.json` / `en.json` | 431 clés × 2 langues, 18 espaces de noms | Tous les textes |
| `lib/visual/config.ts` | 33 réglages du moteur visuel : valeur par défaut, bornes, libellé | La validation, la régie et le rendu en découlent ensemble |
| `lib/visual/motifs.ts` | 14 formes du fond | Le sélecteur de motif de la régie, et le fond du site |
| `lib/visual/presets.ts` | 6 préréglages | La section « Préréglages » de la régie |
| Configuration publiée — Upstash, ou `.data/visual-config.json` | Les réglages en vigueur, avec la version du schéma et la date d'enregistrement | **La seule donnée hors du code.** Elle se modifie depuis la régie, jamais à la main en production |

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

### Changer le fond, les lumières ou l'éclairage des boutons

Rien à modifier dans le code. Ouvrir la régie (dix clics sur le logotype du pied de page, ou
`/regie`), régler en regardant l'aperçu, puis **Publier**. Pour revenir au site d'origine :
préréglage « Origine », puis Publier.

### Changer le mot de passe de la régie

Modifier `VISUAL_ADMIN_PASSWORD` — dans `.env` en local, dans les réglages de l'hébergeur en
production — puis relancer le serveur ou redéployer. Les sessions ouvertes sont fermées d'office.

### Brancher le stockage de la régie sur Vercel

Créer une base Redis gratuite sur upstash.com, copier l'URL et le jeton de sa section
*REST API* dans `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`, redéployer. La section
« Vue générale » de la régie indique le stockage en service.

### Ajouter un réglage au moteur visuel

1. Déclarer le champ dans l'interface `VisualConfig` (`lib/visual/config.ts`).
2. Lui donner un descripteur dans `VISUAL_FIELDS` : nature, valeur par défaut, bornes, libellé.
   **TypeScript refuse de compiler tant qu'il manque.**
3. Le lire là où il agit : `tile.ts` (dessin du motif), `css.ts` (variables) ou `LightField.tsx`.

La validation, la valeur par défaut, l'import, l'export et le contrôle de la régie en
découlent sans une ligne de plus.

### Ajouter un motif

Une entrée dans `MOTIFS` (`lib/visual/motifs.ts`) : un libellé, et une fonction qui rend le
tracé SVG du motif centré sur l'origine, à la taille demandée. Il apparaît aussitôt dans le
sélecteur de la régie, avec sa vignette.

### Ajouter un préréglage

Une entrée dans `PRESET_SOURCES` (`lib/visual/presets.ts`), qui ne décrit que **ce qui le
distingue** des valeurs par défaut. Un réglage ajouté plus tard au schéma y prendra donc sa
valeur par défaut tout seul.

### Faire éclairer un nouveau bouton

Lui donner la recette `BUTTON_PRIMARY` ou `BUTTON_SECONDARY` (`components/ui/styles.ts`), ou
ajouter la classe `vx-glow` à un bouton écrit à la main. Rien d'autre : la classe ne fait rien
tant que l'éclairage des boutons est éteint.

## Sécurité

- **Politique de sécurité du contenu** (`next.config.ts`) : tout limité à l'origine, `object-src`, `frame-src`, `worker-src` et `frame-ancestors` à `'none'`. `'unsafe-inline'` reste nécessaire (données de rendu React, script anti-flash) ; le compromis est documenté dans le fichier.
- **En-têtes** : `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, HSTS deux ans. `X-Powered-By` retiré.
- **Moteur d'images bridé** : seuls `/images_projets/**` et `/images/**` peuvent être retaillés, une seule qualité, largeurs plafonnées. Sans cela, n'importe qui pouvait faire retailler n'importe quel fichier public autant de fois qu'il le voulait.
- **Formulaires** : pot de miel, quota par IP, corps borné, validation Zod côté serveur, échappement HTML, protection contre l'injection d'en-têtes SMTP.
- **Secrets** : jamais dans l'image Docker (`.dockerignore` exclut `.env*`), injectés à l'exécution.
- **La régie** — sa seule protection réelle est le mot de passe, et tout se joue sur le serveur :
  - le mot de passe vit dans `VISUAL_ADMIN_PASSWORD`, sans préfixe `NEXT_PUBLIC_` : il ne figure dans aucun fichier envoyé au navigateur. **Aucune valeur de repli n'est écrite dans le code** ; variable absente, la régie reste fermée ;
  - la comparaison se fait **à temps constant** (empreintes SHA-256 puis `timingSafeEqual`), et le nombre d'essais est plafonné à 8 par quart d'heure et par adresse ;
  - la session est un **jeton signé** (HMAC-SHA256) porté par un cookie `HttpOnly`, `SameSite=Strict`, `Secure` en production, valable 8 heures. Le serveur le vérifie sans rien stocker ; changer le mot de passe invalide tous les jetons ;
  - sans session valide, **le panneau et la configuration ne sont pas envoyés** : la page ne contient que l'écran de mot de passe ;
  - les routes d'écriture refusent une requête venue d'une autre origine, bornent la taille du corps, et **reconstruisent** la configuration reçue (bornes, couleurs, listes fermées) avant de l'enregistrer — rien de ce qu'envoie le navigateur n'est injecté tel quel dans une feuille de style ;
  - la page est `noindex`, absente du plan du site, et volontairement **non citée dans `robots.txt`** : ce fichier est public, y écrire `/regie` reviendrait à afficher l'adresse.

## Performance

Mesures sur le build de production, en kilo-octets **compressés** (gzip, niveau 9) : le HTML de
la page, et l'ensemble des fichiers JavaScript et CSS que ce HTML référence.

| Page | JavaScript | CSS | HTML |
| --- | --- | --- | --- |
| `/fr` | 213 | 18 | 76 |
| `/fr/projets` | 234 | 21 | 79 |
| `/fr/propos` | 212 | 17 | 28 |
| `/fr/contact` | 221 | 16 | 25 |
| `/regie` (écran de mot de passe) | 191 | 15 | 3 |

Le moteur visuel y compte pour environ **3 Ko de JavaScript et 1,3 Ko de CSS**, présents sur
chaque page même lumières éteintes. La régie, elle, n'est téléchargée que par qui l'ouvre :
aucun de ses fichiers n'est chargé par une page publique.

Décisions qui expliquent ces chiffres :

- **framer-motion n'est chargé que par la visionneuse plein écran**, au premier clic — et par elle seule. Chargée sur les quatre pages, la bibliothèque pesait à elle seule une grande partie de leur JavaScript (voir l'en-tête de `components/layout/Navbar.tsx`).
- **Les logos de technologies sont des symboles réutilisés** (`TechIconSprite`) : sur la page Projets, où ils reviennent 90 fois, le HTML est passé de 93 à 68 Ko.
  La réserve est déclarée **au niveau de la page** (`app/[locale]/page.tsx`, `projets/page.tsx`), et non dans une section : sur l'accueil, les billets de
  projets et le relevé de compétences y puisent tous les deux. Restreinte aux seules compétences, elle laissait sans logo les technologies citées par les
  projets et absentes du relevé (Traefik, Celery, PayDunya).
- **Les animations sont en CSS**, y compris les apparitions au défilement (`animation-timeline: view()`) et la désintégration des cartes.
- **Le carrousel utilise le défilement natif** (`scroll-snap`) plutôt qu'une bibliothèque.
- **Le portrait plein écran** utilise les transitions de vue du navigateur : aucun calcul, aucune mesure.
- **Le moteur visuel ne coûte que ce qu'on allume.** Éteint, il ne rend rien. Allumé :
  - le fond reste une image CSS répétée — le nombre de motifs à l'écran ne coûte rien ;
  - les lumières sont trois éléments déplacés par `transform` et fondus par `opacity`, deux propriétés que le navigateur compose sans recalculer la mise en page ;
  - la boucle d'animation **ne tourne que pendant le mouvement** : souris immobile, aucun appel à `requestAnimationFrame` (mesuré) ;
  - l'ambiance est une animation CSS, et reste fixe sur téléphone sauf réglage contraire ;
  - la feuille injectée dans chaque page pèse de 2,7 à 2,8 Ko avec un motif régulier. Un motif dispersé ou à deux couleurs demande une tuile de 25 mailles : jusqu'à 36 Ko avant compression. La section « Diagnostic » de la régie affiche ce poids pour le brouillon en cours.

## Accessibilité

- Un seul `<h1>` par page, hiérarchie de titres respectée, sections étiquetées (`aria-labelledby`).
- Lien d'évitement, `<main id="main">`, ancres décalées sous la barre fixe (`scroll-padding-top`).
- Toute animation perpétuelle est neutralisée par `prefers-reduced-motion`.
- Les modales : `role="dialog"`, `aria-modal`, focus déplacé puis **rendu**, `Tab` confiné, `Échap`, défilement verrouillé.
- Les éléments décoratifs (pluies, schémas, fragments, conduites de points) sont `aria-hidden` ; leur contenu est restitué en texte ailleurs.
- Contrastes : les rôles d'encre du système de design sont choisis pour rester lisibles dans les deux thèmes.
- **Le moteur visuel respecte les préférences du système**, sans réglage à faire : avec « moins d'animations », l'ambiance devient fixe et le halo se place sans inertie ; en contrastes forcés, les lumières ne sont pas affichées ; à l'impression non plus. Le calque des lumières est `aria-hidden` et ne reçoit aucun clic (`pointer-events: none`).
- L'éclairage d'un bouton se déclenche **au focus clavier comme au survol** ; son anneau de focus n'est pas modifié.
- La régie s'utilise entièrement au clavier : chaque contrôle est un élément natif (`input`, `button`, boutons radio), les interrupteurs portent `role="switch"`, les curseurs annoncent leur valeur lisible (« 220 px », « 35 % »), les messages sont annoncés (`aria-live`).

## Référencement

### Le domaine, déclaré une seule fois

`NEXT_PUBLIC_SITE_URL` est la **seule** déclaration du domaine. Tout le reste en découle :

| Ce qui en dépend | Construit par |
| --- | --- |
| `metadataBase`, balises canoniques | `app/[locale]/layout.tsx`, `lib/seo.ts` |
| `hreflang` des deux langues + `x-default` | `lib/seo.ts` |
| `sitemap.xml` (8 entrées : 4 pages × 2 langues) | `app/sitemap.ts` |
| `robots.txt` (`Host` et `Sitemap`) | `app/robots.ts` |
| Données structurées JSON-LD | `lib/seo.ts` → `components/layout/StructuredData.tsx` |
| Aperçus de partage OpenGraph et X | `lib/seo.ts` |
| Liens absolus des e-mails transactionnels | `app/api/*/route.ts` |

Changer de domaine : modifier la variable chez l'hébergeur, redéployer. **Aucun fichier à
toucher.** Le domaine écrit dans `lib/site.ts` n'est qu'un filet de sécurité si la variable
manque — et le build le signale alors dans les journaux.

> L'URL fournie par Vercel (`VERCEL_PROJECT_PRODUCTION_URL`) **ne participe plus** au calcul.
> Elle vaut toujours `portofolio-kalvin-2.vercel.app` : intercalée avant le domaine de repli,
> elle aurait fait déclarer à Google le sous-domaine Vercel le jour où la variable serait
> oubliée — silencieusement.

### Le sous-domaine Vercel redirige vers le domaine

`proxy.ts` renvoie en **308** toute requête dont l'hôte finit par `.vercel.app` vers le même
chemin sur le domaine canonique. C'est ce qui transmet l'antériorité de référencement déjà
acquise, au lieu de laisser deux sites identiques se concurrencer.

La redirection ne vise **que** ce suffixe : comparer l'hôte au domaine canonique aurait cassé
`localhost`, `127.0.0.1` et toute adresse interne derrière un répartiteur de charge.
`robots.txt` et `sitemap.xml` restent servis par les deux adresses — sans conséquence, leur
contenu annonçant déjà le domaine canonique.

### Les préversions ne sont pas indexées

Un déploiement de branche sert le site entier sur une autre adresse. Laissé ouvert, il devient
un doublon complet, et Google peut choisir d'indexer la préversion à la place du domaine.
Quand `VERCEL_ENV` vaut `preview` :

- `robots.txt` interdit tout (`Disallow: /`) — lu **avant** l'exploration ;
- chaque page porte `noindex` — lu **pendant**, pour une page déjà connue.

Les deux, parce qu'aucun des deux ne couvre seul les deux cas.

### La régie n'est jamais indexée

`/regie` porte `noindex` et `nofollow`, ne figure pas dans `sitemap.xml`, et aucune page du site
ne pointe vers elle. Elle n'est **pas** citée dans `robots.txt`, à dessein : ce fichier est
public, et une ligne `Disallow: /regie` indiquerait l'adresse à qui la cherche.

### Les données structurées (JSON-LD)

Les balises `<meta>` disent comment afficher une page ; le JSON-LD dit **de qui elle parle**.
Le graphe (`lib/seo.ts`) déclare deux nœuds qui se citent par `@id` :

- **`Person`** — nom, intitulé de poste, description, image, e-mail, téléphone au format
  international, ville et pays (code ISO), langues, employeur, technologies maîtrisées, et
  `sameAs` vers les profils publics ;
- **`WebSite`** — adresse, nom, langue, et l'auteur qui renvoie au nœud précédent.

C'est ce qui permet à Google de relier le site, le profil LinkedIn et le compte GitHub à **une
seule et même entité**, au lieu de trois pages sans rapport.

Deux règles tenues :

1. **aucun fait inventé** — tout vient de `lib/site.ts`, des projets réels (`knowsAbout` est
   calculé depuis les technologies effectivement employées) ou des catalogues de traduction
   déjà affichés sur le site ;
2. **`sameAs` ne contient que des profils** — le lien WhatsApp en est exclu : c'est un moyen
   de contact, pas une identité, et l'y mettre brouille le signal.

### Ce qui reste perfectible

L'image de partage est le monogramme **carré 1080 × 1080**, d'où une carte X au format
`summary`. Une image **1200 × 630** permettrait la grande carte (`summary_large_image`), plus
visible sur LinkedIn et X. Elle demande un visuel dédié : la générer avec `next/og` exigerait
un fichier Poppins au format TTF ou WOFF, que `next/font/google` ne laisse pas à disposition
(il produit du WOFF2, que le moteur de rendu de `next/og` ne lit pas).

## Déploiement

### Vercel

Le build détecte la plateforme (`VERCEL`) et **n'émet pas** le paquet autonome, inutile là-bas.
AVIF est activé côté Vercel uniquement (l'encodage y est amorti par leur réseau).

Checklist avant le premier déploiement :

1. Variables d'environnement (voir plus haut). **Sans `EMAIL_HOST_USER`, les deux formulaires répondent 503** — c'est la cause la plus fréquente d'un « service momentanément indisponible » en production.
2. `public/projets/` pèse ~137 Mo d'anciennes captures **qu'aucune page n'utilise** : les écarter du déploiement (`.vercelignore`) évite de les téléverser à chaque fois.
3. Vérifier que l'avertissement `NEXT_PUBLIC_SITE_URL` n'apparaît pas dans le journal de build.
4. Pour la régie : `VISUAL_ADMIN_PASSWORD`, puis `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`. **Sans Upstash, la régie s'ouvre mais refuse de publier** : une fonction sans serveur n'a pas de disque où écrire. Une variable ajoutée ou modifiée ne prend effet qu'au déploiement suivant.

Rien d'autre à faire après une publication depuis la régie : les pages se régénèrent seules,
à la visite suivante.

### Docker

`docker compose up --build` produit une image multi-étapes : dépendances, build, puis une image
d'exécution qui ne contient que le paquet autonome et tourne sous un utilisateur non root.
Le port interne est 3000, `HOSTNAME=0.0.0.0`.

Pour la régie, deux possibilités :

- **Upstash** — les deux variables suffisent, comme sur Vercel. Rien à conserver sur le disque.
- **Fichier** — sans Upstash, la configuration est écrite dans `/app/.data`. Le `Dockerfile` crée
  ce dossier avec les droits de l'utilisateur `nextjs` (qui ne peut rien créer dans `/app`), et
  `.dockerignore` écarte le `.data` de votre machine pour qu'il ne serve pas à pré-rendre l'image.
  **Le disque d'un conteneur est effacé à chaque redéploiement** : montez un volume sur
  `/app/.data` pour garder vos réglages.

L'image étant construite sans les réglages publiés, ses pages partent avec le fond d'origine ;
elles se remettent d'elles-mêmes à jour à la première visite qui suit leurs cinq minutes de
durée de vie, sans qu'il faille republier (voir
[Pourquoi une page publiée s'applique tout de suite](#pourquoi-une-page-publiée-sapplique-tout-de-suite)).

En production, la régie exige **HTTPS** : son cookie de session est marqué `Secure`, et un
navigateur ne le renvoie pas sur une liaison en clair (`localhost` excepté).

## Vérification

```bash
npm run typecheck   # TypeScript strict
npm run lint        # ESLint
npm run build       # doit finir sans avertissement
```

Le projet est également couvert par **283 vérifications de bout en bout** exécutées dans un vrai
Chrome (pages et référencement, sécurité, hydratation React, langues, fonctionnement sans
JavaScript, configuration de déploiement), plus une validation géométrique des neuf schémas.

Le moteur visuel et la régie y ajoutent **73 vérifications**, exécutées contre le build de
production :

| Suite | Vérifications | Ce qu'elle établit |
| --- | --- | --- |
| Logique pure | 17 | Validation et bornes des réglages, tuile par défaut identique au fond d'origine, hasard déterministe, motifs, préréglages. **Configuration par défaut : aucune règle, aucun attribut, aucune lumière** |
| HTTP | 23 | La régie sans session ne montre que l'écran de mot de passe ; le mot de passe n'est dans aucun fichier servi ; origine étrangère, quota, corps démesuré et jeton falsifié sont refusés ; une publication borne les valeurs et s'applique aux pages sans redéploiement |
| Navigateur | 33 | **Chaque pixel allumé recouvre un pixel du motif éteint**, au repos comme après défilement ; aucune boucle souris immobile ; éclairage des boutons au survol et au clavier ; dix clics ; connexion ; les dix sections ; publication ; import et export ; téléphone et tablette sans débordement ; déconnexion ; retour à l'état d'origine ; aucune erreur en console |

Trois observations complètent ces suites :

- **le stockage Upstash** — la suite HTTP rejouée avec ce stockage, contre un serveur qui
  imite son API REST : mêmes résultats, rien d'écrit sur le disque, et seulement 5 lectures et
  2 écritures pour tout le parcours (les pages n'interrogent pas le stockage à chaque visite).
  Stockage en panne : le site reste servi avec son fond d'origine, et « Publier » répond 503
  — jamais un faux succès. **L'adaptateur n'a pas été exercé contre le service Upstash réel** :
  c'est la première chose à contrôler après avoir renseigné les deux variables sur Vercel ;
- **le filet de sécurité hors Vercel** — une configuration déposée dans le stockage *sans
  publication* (la situation d'une image Docker redéployée) est apparue sur le site après
  337 secondes : la durée de vie de 300 s, plus une visite ;
- **le responsive** — 8 pages mesurées à 9 largeurs, de 320 à 1280 px, avec la police réelle :
  aucun débordement horizontal, et dans le pied de page aucune rangée hors de l'axe de l'écran
  sous 640 px.

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
| **`html` ne doit jamais recevoir de fond** | Le calque des lumières (`.vx-field`) est posé en `z-index: -1` : au-dessus du fond de la page, sous le contenu. Cela tient à ce que le fond de `body` est **reporté sur la fenêtre** par le navigateur — ce qu'il ne fait que si `html` n'a pas de fond à lui. Donner un fond à `html` ferait peindre celui de `body` par-dessus les lumières : elles disparaîtraient |
| **Une tuile en `rem` et une tuile en pixels ne se superposent pas** | Le fond d'origine dimensionne sa tuile en `rem` (2,5 rem), les lumières en pixels. Chez un visiteur dont le navigateur grossit le texte, 2,5 rem ne valent plus 40 px. Dès que les lumières sont allumées, le moteur fabrique donc **les deux** tuiles, aux mêmes dimensions |
| **Le site et la régie partagent l'enveloppe racine** | `app/layout.tsx` ne rend rien, et les deux produisent leur propre `<html>` dessous. `<Link>` ou `router.push` de l'un vers l'autre ferait donc une navigation **côté client** — sans rechargement, en gardant les feuilles de la page quittée, et en pouvant resservir une page gardée en mémoire. Les trois passages utilisent un vrai chargement de document ; la règle ESLint qui s'y oppose est levée sur place, avec la raison |
| **Un chemin de fichier calculé fait embarquer tout le projet** | `fs.readFile` appelé avec un chemin que l'analyse du build ne peut pas deviner (variable d'environnement, fonction) lui fait recopier **tout le projet** dans le paquet serveur. La lecture du fichier de la régie porte la consigne `/*turbopackIgnore: true*/` : ce fichier est un état du serveur, pas une ressource à embarquer |
| **Une page statique ne relit rien** | Un réglage enregistré dans un stockage n'apparaît pas tout seul sur une page pré-rendue. Il faut l'**invalider** : la publication périme l'étiquette `visual-config`. Hors Vercel, où le build ne voit pas le stockage de production, une durée de vie de cinq minutes fait le reste |
| **Lire un fichier n'inscrit pas la page au cache** | `fetch` donne de lui-même à la page son étiquette et sa durée de vie ; une lecture de fichier, non. Celle du fichier de la régie est donc accompagnée d'un **marqueur** (`unstable_cache`) qui porte l'étiquette `visual-config` et la durée de vie. Sans lui, une page pré-rendue hors Vercel resterait figée sur la configuration vue au build. Le fichier lui-même est relu à chaque génération : une lecture locale ne coûte rien |
| **L'heure d'un clic n'est pas celle où le code s'exécute** | Sur une page occupée, les clics attendent leur tour : mesurés à l'exécution, dix clics rapides paraissent espacés. La porte de la régie lit `event.timeStamp`, l'heure du clic lui-même |
| **Le paquet autonome construit en local embarque `.env`** | `next build` recopie les fichiers `.env` dans `.next/standalone/`, pour que le serveur autonome les retrouve. Sans conséquence dans l'image Docker — `.dockerignore` écarte `.env*` du build —, mais un dossier `standalone` construit sur votre machine contient **tous vos secrets** : ne jamais le copier tel quel sur un serveur, ni le partager |
| **Un cookie `Secure` ne voyage pas en HTTP** | En production, la session de la régie n'est jamais renvoyée sur une liaison en clair : la connexion semble réussir, puis l'écran de mot de passe revient. Ce n'est pas une panne — servir le site en HTTPS |
| **`scroll-behavior: smooth` sur `html` casse le retour en haut** | À chaque changement de route, Next.js remet la page en haut par des `scrollIntoView()`, qui héritent du `scroll-behavior` de la page : en `smooth`, ils s'animent au lieu de s'appliquer. Dès la **deuxième** visite d'une route (déjà en cache), la page s'affiche sans attente et la dernière animation en vol se conclut sur une position périmée — la page s'ouvrait à 800 px du haut. Le défilement doux est donc réservé aux ancres réellement visées : `html:has(:target)` |

## Conventions de code

- **Tout est commenté en français**, avec un en-tête `@file` / `@description` / `@architecture` par fichier, et des `@remarks` pour les décisions non évidentes — en expliquant **pourquoi**, pas ce que le code fait déjà lire.
- Les composants sont **serveur par défaut** ; `'use client'` est une exception qui se justifie en commentaire.
- Les constantes partagées (limites, contrats, règles) vivent dans `lib/`, **jamais en double**.
- Les textes affichés passent toujours par les catalogues de traductions. **Seule exception : la régie**, outil interne en français, hors du routage par langue — ses textes sont dans ses composants.
- Aucune donnée inventée : un chiffre affiché est un chiffre compté, un lien affiché est un lien qui existe.
- Un module qui lit un secret (`lib/visual/session.ts`, `lib/visual/store.ts`) est marqué **serveur** dans son en-tête et n'est jamais importé par un composant client.
- Une règle ESLint n'est levée que **pour une ligne**, avec la raison écrite juste au-dessus.
