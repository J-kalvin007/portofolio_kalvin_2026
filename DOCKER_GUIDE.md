# 🐳 Guide Maître de Conteneurisation (Docker)
## Portfolio Kalvin — Édition Production

Ce document est le manuel d'utilisation officiel de l'architecture Docker mise en place pour ce projet. Il vous explique comment construire l'image, lancer l'application avec Docker Compose, et détaille la "magie" derrière l'architecture "Multi-Stage" du Dockerfile.

---

## 🚀 1. Lancement Rapide (Quick Start)

Grâce au fichier `docker-compose.yml` nouvellement créé, le lancement de l'application est devenu un jeu d'enfant. Assurez-vous d'avoir [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé sur votre machine.

### Étape A : Démarrer l'Application
Ouvrez votre terminal à la racine du projet et tapez une seule commande :
```bash
docker-compose up -d --build
```
*Explication de la commande :*
* `up` : Ordonne à Docker de créer et démarrer le conteneur.
* `-d` (Detached mode) : Fait tourner l'application en arrière-plan pour ne pas bloquer votre terminal.
* `--build` : Oblige Docker à lire votre code et à recompiler la toute nouvelle image de production.

### Étape B : Accéder à l'Application
Votre site est maintenant en ligne, compressé et encapsulé dans une machine virtuelle ultra-sécurisée ! Ouvrez votre navigateur sur : **http://localhost:3000**

### Étape C : Arrêter l'Application
Pour couper le serveur proprement, tapez :
```bash
docker-compose down
```

---

## 🔬 2. Comprendre la Magie : Le "Multi-Stage Build" Expliqué

Dans le fichier `Dockerfile`, l'architecture est divisée en 4 étapes distinctes. Vous vous demandez comment vérifier que ces optimisations fonctionnent ? **La beauté de Docker, c'est que tout cela est 100% automatique** lorsque vous lancez la commande `docker-compose up --build`. C'est le fichier `Dockerfile` qui gère cette recette complexe de manière autonome.

Voici ce qui se passe sous le capot du moteur Docker, étape par étape :

### 📦 Étape 1 & 2 : Les Dépendances (Deps) et la Gestion du Cache
*   **Le Problème classique :** À chaque fois que vous modifiez un fichier texte (comme un titre de projet), un Dockerfile basique va re-télécharger entièrement Node.js et vos milliers de paquets NPM (node_modules), ce qui prend énormément de temps.
*   **Notre Solution (Le Cache) :** Le script copie UNIQUEMENT `package.json` en premier. Docker mémorise (met en cache) cette étape. 
*   **Le Résultat en Pratique :** Si vous changez la couleur d'un bouton dans le code React et que vous relancez `docker-compose up --build`, Docker va analyser le fichier `package.json`. S'il n'a pas bougé, Docker va **sauter** l'installation des dépendances instantanément (en 0 seconde) et passer directement à la suite. C'est l'optimisation ultime du temps de développement.

### 🔨 Étape 3 : Le Constructeur (Builder)
C'est ici que Next.js compile votre application en fichiers statiques et minifiés.
1.  Le code source est fusionné avec les dépendances fraîchement installées.
2.  La variable `NEXT_TELEMETRY_DISABLED=1` est injectée. Cela **bloque** immédiatement l'envoi de données analytiques aux serveurs centraux de Vercel. Votre code reste 100% privé et la compilation gagne de précieuses secondes.
3.  La commande `npm run build` est exécutée. Elle analyse tout votre code TypeScript et génère le fameux dossier ultra-compressé `.next/standalone`.

### 🛡️ Étape 4 : L'Exécuteur de Production (Runner)
C'est l'étape la plus critique, car c'est la seule image qui sera conservée et envoyée sur votre serveur public. Les étapes 1, 2 et 3 sont détruites à la fin du processus pour gagner de la place.
1.  **Le Poids Plume (Standalone)** : L'étape 3 (Builder) pesait environ 2 Go (car elle contenait tout votre code source brut et les lourds outils de développement TypeScript). L'étape 4, elle, part d'un système d'exploitation Linux totalement vierge et minuscule. Elle ne vient "piocher" QUE le dossier compilé `.next/standalone` généré à l'étape 3. **L'image finale s'allège drastiquement et passe à environ 150 Mo**. Cela réduit massivement vos coûts de serveurs et accélère vos déploiements dans le cloud.
2.  **Sécurité Maximale (Utilisateur Non-Root)** : Par défaut, Docker lance les applications en tant qu'administrateur système souverain (`root`). Si un hacker trouvait une faille dans Next.js, il pourrait "sortir" du conteneur et pirater votre serveur physique tout entier. Pour contrer cela, l'étape 4 **crée un faux utilisateur sans aucun privilège d'administration** appelé `nextjs`. Le serveur web est forcé de tourner sous cette identité bridée. L'architecture est ainsi verrouillée de l'intérieur.

---

## 🛠️ 3. Commandes Utiles de Maintenance

**Voir les logs en temps réel (pour débugger des erreurs ou des visites) :**
```bash
docker-compose logs -f portfolio
```

**Rentrer à l'intérieur du conteneur "en direct" (Terminal virtuel) :**
```bash
docker exec -it portfolio_kalvin /bin/sh
```

**Nettoyer l'espace Docker (Si votre disque dur manque de place) :**
```bash
docker system prune -a
```
