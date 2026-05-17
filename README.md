# 🌌 KALVIN PORTFOLIO — Documentation Architecturale & Technique
> **Standard d'Excellence "Void & Or" | Année 2026**

Bienvenue dans la documentation officielle et exhaustive du portfolio de Kalvin. Conçue avec l'exigence et la rigueur des meilleurs ingénieurs de la Fintech, cette documentation sert de véritable "Bible Architecturale". Elle cartographie chaque composant, chaque ligne de logique et chaque décision de design pattern pour garantir une maintenabilité absolue et une scalabilité sans friction.

---

## 💎 1. Vision & Philosophie "Void & Or"

L'application n'est pas un simple site web ; c'est une **expérience interactive ultra-premium**. Le design pattern "Void & Or" repose sur trois piliers fondamentaux :
1. **La Profondeur Spatiale (The Void)** : Utilisation de noirs profonds (`#070510`), de glassmorphisme (flous d'arrière-plan complexes) et d'éclairages volumétriques.
2. **Le Luxe Interactif (The Gold)** : Micro-interactions magnétiques, typographies fluides et halos dorés réactifs (`#F0A500` à `#FFD166`).
3. **La Performance Chirurgicale (60 FPS Constant)** : Séparation stricte des calculs coûteux (Canvas API) et des animations optimisées par GPU (Framer Motion).

### 🛠 Stack Technologique Principale
*   **Cœur** : Next.js 14+ (App Router) — Rendu hybride (RSC / Client).
*   **Langage** : TypeScript Strict — Typage fort pour une résilience maximale.
*   **Style** : Tailwind CSS v3.4+ — Variables CSS dynamiques et utilitaires avancés.
*   **Animation** : Framer Motion (Orchestration complexe, Parallax, Layout ID) & Canvas API.
*   **Internationalisation (i18n)** : `next-intl` (Routage dynamique basé sur la locale).

---

## 🏗 2. Cartographie Exhaustive de l'Architecture

Afin de faciliter la maintenance, le projet adopte une séparation stricte des responsabilités (Séparation of Concerns). L'architecture est découpée en couches logiques.

### 🗺 Diagramme de Flux Architectural (System Design)

Ce diagramme illustre le cycle de vie d'une requête globale et la séparation stricte entre le moteur de rendu côté serveur (RSC) et les moteurs physiques côté client (Framer Motion / Canvas).

```mermaid
graph TD
    %% Définition des styles ultra-premium
    classDef clientNode fill:#070510,stroke:#F0A500,stroke-width:2px,color:#fff;
    classDef serverNode fill:#1a1a2e,stroke:#4F46E5,stroke-width:2px,color:#fff;
    classDef dataNode fill:#101827,stroke:#10B981,stroke-width:2px,color:#fff;

    User((Utilisateur)) -->|Requête HTTP| Middleware{Middleware.ts\n(Détection i18n)}
    
    Middleware -->|Route formatée (/[locale])| Layout[Root Layout\n(Injection Police & Thème)]:::serverNode
    
    Layout --> RSC[page.tsx\nReact Server Component]:::serverNode
    
    RSC -->|Pre-fetch SEO & JSON| ClientComponent[page.client.tsx\nReact Client Component]:::clientNode
    
    subgraph "Gestion de la Donnée"
        ClientComponent -->|Import direct| LibData[lib/data/\n(projects.ts, experience.ts)]:::dataNode
        ClientComponent -->|Traductions| Messages[messages/\n(fr.json, en.json)]:::dataNode
    end
    
    subgraph "Moteur Physique & UI Intéractive"
        ClientComponent --> FM[Framer Motion\n(Parallax, LayoutID, Spring)]:::clientNode
        ClientComponent --> Canvas[Canvas API\n(StardustCursor)]:::clientNode
        ClientComponent --> Hooks[Custom Hooks\n(useProjectModal)]:::clientNode
    end
    
    Hooks -->|Machine à États| Modal[Composant ProjectModal]:::clientNode
```

### 🌳 Arborescence des Fichiers & Dossiers (File Tree)

La structure des dossiers respecte le standard d'entreprise modulaire. Chaque module est encapsulé logiquement.

```text
📦 KALVIN_PORTFOLIO
 ┣ 📂 app
 ┃ ┣ 📂 api
 ┃ ┃ ┗ 📂 sendEmail
 ┃ ┃   ┗ 📜 route.ts          # Endpoint Backend (NodeMailer/Resend)
 ┃ ┣ 📂 [locale]              # Cœur du Routage i18n
 ┃ ┃ ┣ 📂 contact             # Page Contact (Formulaire & Validation)
 ┃ ┃ ┣ 📂 projets             # Page Grille Projets & Orchestration Modale
 ┃ ┃ ┣ 📂 propos              # Page À Propos (Timeline & Vision 3D)
 ┃ ┃ ┣ 📜 layout.tsx          # Wrapper de contenu localisé
 ┃ ┃ ┣ 📜 page.tsx            # RSC (Métadonnées SEO & SSR Serveur)
 ┃ ┃ ┗ 📜 page.client.tsx     # Hydratation React & Physique Interactive
 ┃ ┣ 📜 globals.css           # Thème "Void & Or" & Tailwind Core
 ┃ ┣ 📜 layout.tsx            # HTML root & Injection des Providers (Thème)
 ┃ ┗ 📜 not-found.tsx         # Page 404 (Server level catch)
 ┣ 📂 components
 ┃ ┣ 📂 animations            # FadeIn, StardustCursor, MagneticWrapper
 ┃ ┣ 📂 layout                # Navbar, Footer, ThemeToggle
 ┃ ┣ 📂 projects              # ProjectCard, ProjectModal, StarField
 ┃ ┗ 📂 ui                    # Composants UI Atomiques (Boutons, Inputs)
 ┣ 📂 hooks
 ┃ ┣ 📜 useDisintegrationGrid.ts # Mathématiques complexes de téléportation 3D
 ┃ ┣ 📜 useProjectModal.ts       # Machine à états de la modale de projet
 ┃ ┗ 📜 useStarField.ts          # Génération stellaire et calculs de parallaxe
 ┣ 📂 i18n
 ┃ ┣ 📜 navigation.ts            # Wrapper next-intl (Link, useRouter)
 ┃ ┣ 📜 request.ts               # Configuration et chargement de next-intl
 ┃ ┗ 📜 routing.ts               # Définition stricte des locales (fr, en)
 ┣ 📂 lib
 ┃ ┣ 📂 data                  # Base de données locale en TS statique pur
 ┃ ┣ 📜 mail.ts               # Services d'envoi d'e-mails asynchrones
 ┃ ┗ 📜 utils.ts              # Utilitaires de fusion CSS (clsx, twMerge)
 ┣ 📂 messages
 ┃ ┣ 📜 en.json               # Dictionnaire linguistique complet Anglais
 ┃ ┗ 📜 fr.json               # Dictionnaire linguistique complet Français
 ┣ 📂 public
 ┃ ┣ 📂 cv                    # Fichiers PDF (Curriculum Vitae)
 ┃ ┣ 📂 images                # Assets statiques globaux & Portraits
 ┃ ┗ 📂 images_projets        # Miniatures haute définition des projets
 ┣ 📜 middleware.ts           # Intercepteur Edge (Redirections & Locale detection)
 ┗ 📜 tailwind.config.ts      # Configuration ultra-avancée (Gradients, Masks)
```

### 📁 A. Le Cœur du Réacteur : `app/` (Next.js App Router)
Dossier contenant l'arbre de routage principal et la configuration globale.
*   **`layout.tsx`** : Le `RootLayout` global. Initialise la structure HTML de base.
*   **`globals.css`** : Le système nerveux du design. Contient toutes les variables CSS du thème "Void & Or", les animations clés (`@keyframes` pour les shimmers, les nébuleuses) et la configuration Tailwind.
*   **`api/sendEmail/route.ts`** : Point d'ancrage Backend (Serverless Function) traitant la soumission du formulaire de contact via `nodemailer` ou `resend`.
*   **Fichiers SEO / Stabilité** : `robots.ts`, `sitemap.ts`, `not-found.tsx`, `global-error.tsx`. Assurent un référencement technique parfait et une capture d'erreur robuste.

### 📁 B. L'Interface Localisée : `app/[locale]/`
Le routage dynamique gérant le multilinguisme (Français/Anglais).
*   **Le Pattern Server/Client (`page.tsx` & `page.client.tsx`)** : 
    *   *Design Pattern Premium* : Chaque page est divisée en deux. Le fichier `page.tsx` est un **React Server Component (RSC)** ultra-léger chargé d'injecter les métadonnées SEO et de préparer le terrain. Il délègue toute l'interface interactive au fichier `page.client.tsx` (marqué `'use client'`). Cela garantit un First Contentful Paint (FCP) instantané.
*   **Sous-dossiers par route** :
    *   **`/` (Accueil)** : L'entrée théâtrale. `page.client.tsx` orchestre le Hero banner, le texte "Typewriter" et les cartes de compétences.
    *   **`/projets`** : L'épicentre interactif. Gère la grille de projets, les filtres magnétiques liquides, et instancie la modale spatiale (`ProjectModal`).
    *   **`/propos`** : La timeline du parcours. Intègre le "Window Parallax" sur le portrait, les cartes de témoignages holographiques et le rayon temporel (Timeline).
    *   **`/contact`** : Le terminal de communication. Formulaire contrôlé, validation temps réel et effets lumineux au focus.
*   **`/components/` (spécifiques aux pages)** : Héberge des composants qui ne sont utilisés *que* sur une seule page (ex: `TimelineCard.tsx` pour À Propos, `FeaturedProjectCard.tsx` pour l'Accueil).

### 📁 C. L'Arsenal UI & Animations : `components/`
La bibliothèque de composants réutilisables, cœur battant de l'expérience visuelle.
*   **`/animations/`** : Les primitives de mouvement.
    *   `StardustCursor.tsx` : Curseur spatial ultra-fluide (Framer Motion) avec un noyau brillant et une aura à forte inertie (Z-index : 9999).
    *   `MagneticWrapper.tsx` : HOC (Higher-Order Component) injectant une physique de ressort (Spring) à ses enfants en fonction de la position de la souris.
    *   `FadeIn.tsx` & `StaggerChildren.tsx` : Composants utilitaires pour les apparitions en cascade basées sur le défilement (Intersection Observer / `whileInView`).
    *   `StarField.tsx` : Le fond spatial tridimensionnel à multiples couches (Parallax drift).
*   **`/layout/`** : L'ossature persistante (`Navbar.tsx`, `Footer.tsx`, `ThemeToggle.tsx`).
*   **`/projects/`** : L'écosystème complexe des projets.
    *   `ProjectsGrid.tsx` : Chef d'orchestre de la grille, gérant l'état `hoveredIndex` pour piloter intelligemment l'effet de flou (Glassmorphism) des autres cartes.
    *   `ProjectCard.tsx` : Chef-d'œuvre UI. Intègre le Window Parallax, le Shimmer holographique, la logique de désintégration et le scanline effect au clic.
*   **`/ui/`** : Les composants d'interface de base (Boutons, Inputs, etc.).

### 📁 D. La Logique et la Donnée : `hooks/` & `lib/`
*   **`/hooks/`** : Logique d'état complexe isolée (Custom Hooks).
    *   `useProjectModal.ts` : Machine à états finis gérant l'ouverture/fermeture de la modale avec prévention du défilement global (body lock).
    *   `useDisintegrationGrid.ts` : Moteur mathématique calculant les coordonnées des centaines de "cubes" lors de l'animation de téléportation.
*   **`/lib/data/`** : La source de vérité statique (`projects.ts`, `experience.ts`). Centralise les informations pour éviter la duplication et faciliter les mises à jour sans toucher aux composants.
*   **`/lib/utils.ts`** : Fonctions pures (fusion de classes Tailwind avec `clsx` et `tailwind-merge`).

### 📁 E. L'Internationalisation : `i18n/` & `messages/`
*   **`messages/fr.json` & `en.json`** : Les dictionnaires de traduction structurés hiérarchiquement.
*   **`i18n/routing.ts` & `navigation.ts`** : Câblage de `next-intl` permettant la redirection automatique, la détection de la locale système et la génération des liens dynamiques (ex: `Link href="/propos"` devient automatiquement `/fr/propos`).

---

## 🔬 3. Deep Dive : Les Design Patterns Avancés Implémentés

### A. Le "Liquid Magnetic" Pattern (Filtres de Projets)
Les filtres de catégories (`ProjectsGrid`) utilisent une combinaison redoutable :
1.  **Attraction Magnétique** : `useMotionValue` intercepte `onMouseMove` pour calculer le vecteur directionnel de la souris. `useSpring` applique ce vecteur à la translation du bouton, donnant l'impression que le bouton a une "masse".
2.  **Liquid Tabs (Framer Motion `layoutId`)** : Au lieu de modifier la couleur de fond du bouton actif, un `<motion.div>` indépendant voyage d'un bouton à l'autre en interpolant sa taille et sa position grâce au système de Layout d'AnimatePresence.

### B. L'Architecture "Event-Driven Glassmorphism"
Le flou d'arrière-plan des cartes (`ProjectCard`) n'utilise pas le CSS rudimentaire `:hover` sur le parent.
*   **Problème résolu** : Le `:hover` sur le conteneur déclenchait le flou même lorsque la souris était dans l'espace vide entre deux cartes.
*   **Solution Implémentée** : Un état React (`hoveredIndex`) est géré par la Grille parente. Seule la carte *physiquement survolée* déclenche le changement d'état, envoyant une prop `isDimmed=true` à toutes ses sœurs. Résultat : une précision absolue.

### C. La Désintégration Holographique (Render Cycles)
Lorsqu'une carte est cliquée, elle ne disparaît pas bêtement.
1.  **Phase 1** : `localPhase` passe à `disintegrating`.
2.  **Phase 2** : Un overlay de "Scanline Laser" balaye l'image.
3.  **Phase 3** : Le `DisintegrationOverlay` génère instantanément 150 cubes `motion.div` calculés mathématiquement pour "exploser" selon des vecteurs aléatoires.
4.  **Phase 4** : Le timeout bascule l'état global de la Modale, déclenchant le `layout` de l'image de couverture qui s'étend en plein écran.

---

## ⚙️ 4. Guide de Maintenance et d'Évolution (Day-2 Operations)

### Comment ajouter un nouveau Projet ?
1. Ouvrez `lib/data/projects.ts`.
2. Ajoutez un nouvel objet respectant l'interface `Project` à la constante `PROJECTS`.
3. Ajoutez les images correspondantes dans `public/images_projets/`.
4. Mettez à jour les dictionnaires `messages/fr.json` et `en.json` dans la section `"projects_data"` en utilisant le `slug` du projet comme clé.
*L'architecture générera automatiquement la carte, l'animera, et la connectera aux filtres sans aucune intervention supplémentaire sur le code React.*

### Comment modifier la palette de couleurs "Void & Or" ?
1. Ouvrez `app/globals.css`.
2. Modifiez les variables CSS root : `--primary`, `--primary-content`, `--base-100`, etc.
3. Toutes les animations (shimmers, nébuleuses, lasers de timeline) utilisent des couleurs HEX en dur (ex: `#F0A500`) ou injectées via Tailwind. Pour changer l'or (`#F0A500`) en saphir par exemple, faites un `Search & Replace` global de la valeur HEX.

## 🚀 5. Guide d'Installation, de Déploiement et de Mise à Jour

Pour garantir que n'importe quel ingénieur puisse récupérer, instancier et faire tourner ce projet sur une nouvelle machine locale ou un serveur, suivez rigoureusement la procédure ci-dessous.

### Prérequis Système
Avant de commencer, assurez-vous que la machine hôte dispose des éléments suivants :
*   **Git** (pour le contrôle de version)
*   **Node.js** (Version 18.17.0 ou supérieure requise par Next.js 14)
*   **npm** (Node Package Manager, ou `pnpm` / `yarn`)

### Étape 1 : Récupération du Dépôt (Clone)
Ouvrez votre terminal et exécutez la commande suivante pour cloner le code source depuis le dépôt sécurisé :
```bash
git clone <VOTRE_URL_GIT_ICI> portfolio-kalvin
cd portfolio-kalvin
```

### Étape 2 : Installation des Dépendances
Une fois dans le répertoire, installez l'intégralité de l'écosystème et des bibliothèques nécessaires à l'aide du gestionnaire de paquets.
```bash
npm install
# Ou utilisez 'npm ci' en production pour une installation stricte basée sur le package-lock.json
```

### Étape 3 : Variables d'Environnement
L'application nécessite certaines clés secrètes (notamment pour l'envoi d'e-mails via la page Contact).
1. Copiez le fichier d'exemple (s'il existe) ou créez un fichier `.env.local` à la racine du projet.
2. Ajoutez-y vos identifiants. Exemple :
```env
# Clé API pour l'envoi de mails (ex: Resend) ou identifiants SMTP
RESEND_API_KEY=re_123456789...
```

### Étape 4 : Lancement en Environnement de Développement (Local)
Pour travailler sur le projet avec le rechargement à chaud (Hot Module Replacement) et la compilation à la volée (Turbopack) :
```bash
npm run dev
```
> L'application sera accessible sur **http://localhost:3000**. Le terminal affichera les requêtes interceptées et les temps de compilation.

### Étape 5 : Compilation et Lancement en Production
Pour tester l'application dans son état final, optimisé et minifié (ce qui sera déployé sur le serveur final) :
```bash
# 1. Compilation des assets, génération des pages statiques (SSG) et optimisation des images
npm run build

# 2. Démarrage du serveur Node.js de production
npm run start
```

### Procédure de Mise à Jour Complète
Si d'autres ingénieurs modifient le dépôt Git et que vous souhaitez mettre à jour votre instance locale vers la dernière version :
```bash
# Récupération des dernières modifications depuis la branche principale
git pull origin main

# Mise à jour et nettoyage des modules Node
npm install

# Re-compilation de l'application
npm run build

# Redémarrage (Si vous utilisez un gestionnaire de processus comme PM2)
pm2 restart kalvin-portfolio
```

---

## 🏆 6. Conclusion
Le Portfolio de Kalvin représente le **zénith du développement front-end moderne**. En fusionnant la robustesse de TypeScript, la puissance de calcul de React/Next.js et la fluidité des mathématiques physiques de Framer Motion, cette base de code est conçue pour être aussi agréable à maintenir pour un ingénieur qu'à parcourir pour un utilisateur final. 

> *Document généré et audité pour assurer une transition parfaite et une maintenance sereine. Fin de la cartographie.*
