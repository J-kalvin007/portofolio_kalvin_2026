# ==============================================================================
# 🚀 DOCKERFILE ULTRA-PREMIUM (Next.js 14+ App Router)
# ==============================================================================
# Architecture : Multi-Stage Build (Dépendances -> Build -> Runner)
# Standard     : Fintech / Haute Disponibilité / Sécurité Maximale
# 
# Avantages de cette configuration :
# 1. Poids minimal : Seul le code compilé strict est conservé.
# 2. Sécurité : Exécution sous un utilisateur non-root (nextjs).
# 3. Cache optimisé : Les layers Docker sont construits de manière à 
#    ne re-télécharger npm install que si package.json a changé.
# ==============================================================================

# ------------------------------------------------------------------------------
# ÉTAPE 1 : IMAGE DE BASE
# ------------------------------------------------------------------------------
# Utilisation d'Alpine Linux pour sa légèreté extrême (~5MB de base)
FROM node:18-alpine AS base

# ------------------------------------------------------------------------------
# ÉTAPE 2 : GESTION DES DÉPENDANCES (deps)
# ------------------------------------------------------------------------------
FROM base AS deps

# Alpine requiert libc6-compat pour faire fonctionner certaines bibliothèques 
# natives en C++ (comme 'sharp' pour l'optimisation des images Next.js).
RUN apk add --no-cache libc6-compat
WORKDIR /app

# On copie UNIQUEMENT les fichiers de paquets pour optimiser le cache Docker.
# Si le code source change mais pas les dépendances, cette étape ne sera pas recalculée.
COPY package.json package-lock.json* ./

# Installation propre et stricte via npm ci
RUN npm ci

# ------------------------------------------------------------------------------
# ÉTAPE 3 : COMPILATION DU PROJET (builder)
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copie des dépendances générées à l'étape précédente
COPY --from=deps /app/node_modules ./node_modules
# Copie du reste du code source
COPY . .

# Désactivation de la télémétrie Next.js pour accélérer le build et protéger la data
ENV NEXT_TELEMETRY_DISABLED=1

# Lancement de la compilation
# Note : Nécessite que `output: 'standalone'` soit défini dans next.config.ts
RUN npm run build

# ------------------------------------------------------------------------------
# ÉTAPE 4 : IMAGE DE PRODUCTION (runner)
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

# Mode Production strict
ENV NODE_ENV=production
# Désactivation de la télémétrie Next.js en production
ENV NEXT_TELEMETRY_DISABLED=1

# ==============================================================================
# 🛡️ SÉCURITÉ : CRÉATION D'UN UTILISATEUR NON-ROOT
# ==============================================================================
# Il est critique de ne pas faire tourner des serveurs web en tant que 'root'
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Création du dossier .next avec les bonnes permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# ==============================================================================
# 📦 COPIE OPTIMISÉE (Mode Standalone)
# ==============================================================================
# On copie les assets statiques qui ne sont pas dans le bundle standalone
COPY --from=builder /app/public ./public

# On copie le bundle 'standalone' généré par Next.js.
# C'est une version ultra-compressée de votre app sans les node_modules inutiles.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# On copie les fichiers statiques compilés par Next.js (JS/CSS/Images)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ==============================================================================
# 🚀 DÉMARRAGE
# ==============================================================================
# Bascule sur l'utilisateur sécurisé
USER nextjs

# Exposition du port d'écoute interne du conteneur
EXPOSE 3000

# Variables d'environnement pour le port et le binding réseau IP
ENV PORT=3000
# 0.0.0.0 est requis pour que Docker bridge correctement le port Nginx/Traefik
ENV HOSTNAME="0.0.0.0"

# Lancement du serveur généré par Next.js Standalone
CMD ["node", "server.js"]
