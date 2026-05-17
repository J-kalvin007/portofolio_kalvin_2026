# 🐋 DOCKER MASTERCLASS : Containerisation de Production

Bienvenue dans le guide d'ingénierie définitif. Ce document a été conçu pour vous donner une **maîtrise absolue et totale** de Docker. Après avoir lu et appliqué ce guide, vous serez capable de containeriser n'importe quelle application (spécifiquement Next.js et Django), de la rendre infaillible, sécurisée, ultra-légère et prête pour des serveurs de production critiques.

---

## 🏛️ CHAPITRE 1 : La Trinité Docker
Pour containeriser parfaitement un projet, vous avez besoin de 3 fichiers strictement configurés à la racine de votre projet :
1.  **`.dockerignore`** : Le videur de la boîte de nuit. Il décide quels fichiers locaux n'ont pas le droit d'entrer dans l'image.
2.  **`Dockerfile`** : La recette de cuisine. Il explique à Linux comment installer l'OS, les dépendances, compiler le code et le sécuriser.
3.  **`docker-compose.yml`** : Le chef d'orchestre. Il permet de lancer votre base de données, votre Redis et votre application web ensemble en tapant une seule commande.

---

## 🛡️ CHAPITRE 2 : Le Bouclier `.dockerignore`

L'erreur numéro 1 des débutants est d'oublier ce fichier. Si vous l'oubliez, Docker va copier tout votre dossier local, y compris vos mots de passe (`.env`), vos historiques de version (`.git`) et vos dépendances (`node_modules`), rendant l'image lourde et piratable.

**Template Universel `.dockerignore` :**
```text
# Git
.git
.gitignore

# Dépendances Locales
node_modules/
venv/
__pycache__/

# Fichiers d'environnement (Sécurité !)
.env
.env.local
.env.*

# Fichiers de Build locaux
.next/
dist/
build/

# Logs et Docker
*.log
Dockerfile
docker-compose.yml
.dockerignore
```

---

## 🏗️ CHAPITRE 3 : Le Dockerfile Ultime (Exemple : Next.js)

Le standard de l'industrie s'appelle le **"Multi-Stage Build"**. L'idée est de créer plusieurs "machines" temporaires pour compiler le code, puis de ne garder que le résultat final dans une machine vierge.

**Template Next.js Production (Ultra-Optimisé) :**
```dockerfile
# ---------------------------------------------------------
# ÉTAPE 1 : INSTALLATION DES DÉPENDANCES (Le Cache)
# ---------------------------------------------------------
FROM node:18-alpine AS deps
WORKDIR /app
# On copie uniquement les fichiers "cadenas" pour optimiser le cache
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------
# ÉTAPE 2 : LE CONSTRUCTEUR (Le Compilateur)
# ---------------------------------------------------------
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Désactivation de la télémétrie Vercel
ENV NEXT_TELEMETRY_DISABLED=1
# Obligatoire : Dans next.config.ts, assurez-vous d'avoir `output: 'standalone'`
RUN npm run build

# ---------------------------------------------------------
# ÉTAPE 3 : LA PRODUCTION (Le Runner Sécurisé)
# ---------------------------------------------------------
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 🔒 SÉCURITÉ : Création de l'utilisateur sans privilèges
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Récupération du strict nécessaire depuis l'étape Builder
COPY --from=builder /app/public ./public
# Copie du mode Standalone avec changement de propriétaire
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 🔒 Bascule sur le compte sécurisé
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Lancement
CMD ["node", "server.js"]
```

---

## 🐍 CHAPITRE 4 : Le Dockerfile Ultime (Exemple : Django Python)

Pour Python, le Multi-Stage build utilise les "Wheels" (fichiers précompilés) pour éviter de garder les lourds compilateurs C++ dans l'image finale.

**Template Django Production :**
```dockerfile
# ---------------------------------------------------------
# ÉTAPE 1 : BUILDER (Compilation des dépendances Python)
# ---------------------------------------------------------
FROM python:3.11-slim AS builder
WORKDIR /app

# Installation des paquets système nécessaires à la compilation (ex: pour PostgreSQL)
RUN apt-get update && apt-get install -y gcc libpq-dev

# Création des roues (wheels) des dépendances
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# ---------------------------------------------------------
# ÉTAPE 2 : RUNNER (Environnement final)
# ---------------------------------------------------------
FROM python:3.11-slim AS runner
WORKDIR /app

# Sécurité & Optimisation Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Installation de la librairie client PostgreSQL (légère)
RUN apt-get update && apt-get install -y libpq5 && rm -rf /var/lib/apt/lists/*

# 🔒 Sécurité : Création de l'utilisateur non-root
RUN addgroup --system appgroup && adduser --system --group appuser

# Installation des dépendances depuis les wheels créées par le builder
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copie du code source Django
COPY --chown=appuser:appgroup . .

# 🔒 Bascule de l'utilisateur
USER appuser

EXPOSE 8000

# Lancement via Gunicorn (Serveur de production)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "mon_projet.wsgi:application"]
```

---

## 🎼 CHAPITRE 5 : L'Orchestration `docker-compose.yml`

Le Dockerfile ne gère qu'UN seul conteneur (votre app). Mais votre app a souvent besoin d'une Base de Données (PostgreSQL). `docker-compose.yml` crée un "réseau virtuel" pour que vos conteneurs discutent entre eux.

**Template Universel Compose :**
```yaml
version: '3.8'

services:
  # 1. Votre Application (Next.js ou Django)
  web:
    build: .
    container_name: web_app_production
    ports:
      - "80:3000" # Mappe le port 80 (Web) vers le 3000 du conteneur
    restart: always # Redémarre automatiquement si le serveur crash
    env_file:
      - .env.production # Injection sécurisée des mots de passe
    depends_on:
      - db # S'assure que la DB démarre AVANT l'app web

  # 2. Votre Base de Données (PostgreSQL)
  db:
    image: postgres:15-alpine
    container_name: web_database
    restart: always
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: mot_de_passe_secret
      POSTGRES_DB: ma_base_de_donnees
    volumes:
      - pgdata:/var/lib/postgresql/data # Permet de ne pas perdre les données si le conteneur s'arrête

# Déclaration du disque dur virtuel persistant pour la DB
volumes:
  pgdata:
```

---

## 💻 CHAPITRE 6 : Les Commandes Absolues (Pas à Pas)

Voici la séquence exacte des commandes que vous devez taper dans votre terminal de développement ou sur votre serveur distant (VPS/Cloud) pour dominer Docker.

### 1. Construire et Lancer (Le Lancement Initial)
*La commande qui fait tout : télécharge les OS, compile le code, lance la base de données et l'application en arrière-plan.*
```bash
docker-compose up -d --build
```

### 2. Mettre à Jour l'Application (Le Jour Suivant)
*Vous avez fait des modifications dans votre code React ou Python ? Faites une mise à jour "Zero Downtime" (ou presque).*
```bash
# 1. Reconstruire la nouvelle image avec le nouveau code
docker-compose build web

# 2. Redémarrer uniquement le conteneur 'web' avec la nouvelle image (sans toucher à la base de données)
docker-compose up -d --no-deps web
```

### 3. Debugger et Inspecter (Le Rôle de l'Ingénieur)
*Mon site a planté, comment je lis les erreurs serveur ?*
```bash
# Voir les logs en direct de tous les services
docker-compose logs -f

# Voir les logs uniquement de l'application web
docker-compose logs -f web
```

*J'ai besoin de rentrer dans l'ordinateur virtuel pour vérifier un fichier ou lancer une migration Django (`python manage.py migrate`).*
```bash
# Ouvrir un terminal à l'intérieur du conteneur web
docker exec -it web_app_production /bin/sh
```

### 4. L'Arrêt et la Destruction (Nettoyage)
*Je veux tout couper proprement.*
```bash
docker-compose down
```

*Je veux TOUT détruire (Attention : Cela efface aussi les bases de données attachées).*
```bash
docker-compose down -v
```

*Mon disque dur est plein à cause d'anciennes images Docker. Comment je purge ?*
```bash
docker system prune -a --volumes
```

---

## 🔐 RÉCAPITULATIF DE MAÎTRISE

Pour garantir la perfection de vos mises en production futures, vérifiez toujours cette "Checklist du Maître Docker" :
1. [ ] Mon `.dockerignore` bloque-t-il bien le `.env` et le `.git` ?
2. [ ] Mon `Dockerfile` utilise-t-il l'instruction `AS builder` pour séparer la compilation de l'image finale ?
3. [ ] Mon `Dockerfile` crée-t-il bien un `USER non-root` à la toute fin ?
4. [ ] Mon `docker-compose.yml` inclut-il des `volumes:` pour ma base de données afin de ne pas perdre mes données au redémarrage ?

En appliquant ces fichiers et ces commandes, vous opérez exactement au même niveau technique que les ingénieurs d'infrastructure de Netflix, Spotify ou Vercel. Vous avez désormais le contrôle absolu.
