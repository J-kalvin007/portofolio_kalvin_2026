/**
 * @file project.types.ts
 * @description Types centraux pour le système de projets ultra-premium.
 * Définit les interfaces de données, d'état d'animation et de mapping technologique SVG.
 */

import type { Project } from '@/lib/data/projects';

/* ═══════════════════════════════════════════════
   TYPES D'ANIMATION — Désintégration / Téléportation
   ═══════════════════════════════════════════════ */

/** Phase du cycle de désintégration/téléportation (3 phases + idle) */
export type DisintegrationPhase = 'idle' | 'disintegrating' | 'void' | 'reforming';

/* ═══════════════════════════════════════════════
   TYPES DE MODALE — État et navigation
   ═══════════════════════════════════════════════ */

/** État complet de la modale projet */
export interface ModalState {
  isOpen: boolean;
  project: Project | null;
}

/* ═══════════════════════════════════════════════
   TYPES DU CHAMP STELLAIRE — Étoiles individuelles
   ═══════════════════════════════════════════════ */

/** Étoile individuelle pour le fond spatial de la modale */
export interface Star {
  id: number;
  x: number;       // Position horizontale (%)
  y: number;       // Position verticale (%)
  size: number;    // Taille en pixels
  opacity: number; // Opacité (0-1)
  duration: number; // Durée d'animation (secondes)
  delay: number;   // Délai initial (secondes)
  layer: 1 | 2 | 3; // Couche de profondeur (parallax)
  moveX: number[]; // Trajectoire X
  moveY: number[]; // Trajectoire Y
}

/* ═══════════════════════════════════════════════
   CONSTANTES — Mapping slug → i18n + tech → SVG
   ═══════════════════════════════════════════════ */

/** Mapping slug projet → clé de traduction i18n dans `projects_data` */
export const SLUG_MAP: Record<string, string> = {
  'challenger-app': 'challenger',
  'Sheem!': 'sheem',
  'mboashop-ecommerce': 'mboashop',
  'myriade-groupe': 'myriade',
  'stock-manager': 'stock',
  'green-Challenger': 'green',
};

/**
 * Mapping nom de technologie → chemin du fichier SVG dans /public/svg/.
 * Les technologies sans SVG disponible ont une chaîne vide comme valeur.
 */
export const TECH_SVG_MAP: Record<string, string> = {
  'Dart': '/svg/dart.svg',
  'Flutter': '/svg/flutter_02.svg',
  'Django': '/svg/django_02.svg',
  'PostgreSQL': '/svg/postgresql_02.svg',
  'QR Code': '/svg/qr-code.svg',
  'Mobile Money': '/svg/mobile-money.svg',
  'Docker': '/svg/docker_02.svg',
  'HTML/CSS': '/svg/html_02.svg',
  'Stripe': '/svg/stripe_04.svg',
  'Next.js': '/svg/next_02.svg',
  'Tailwind CSS': '/svg/tailwind.svg',
  'Framer Motion': '/svg/framer-motion.svg',
  'SEO': '/svg/seo.svg',
  'Vercel': '/svg/vercel.svg',
  'React.js': '/svg/react.svg',
  'Node.js': '/svg/node.svg',
  'Prisma ORM': '/svg/prisma.svg',
  'WebSocket': '/svg/websocket.svg',
  'Chart.js': '/svg/chart.svg',
  'Python': '/svg/python.svg',
  'D3.js': '/svg/d3.svg',
  'CSS': '/svg/css.svg',
  'HTML': '/svg/html.svg',
  'Java': '/svg/java.svg',
  'JavaScript': '/svg/javascript.svg',
  'TypeScript': '/svg/typescript.svg',
  'Redis': '/svg/redis.svg',
  'REST API': '/svg/rest-api.svg',
  'Spring Boot': '/svg/spring-boot.svg',
  'Supabase': '/svg/supabase.svg',
  '.NET': '/svg/dotnet.svg',
  'Linux': '/svg/linux_02.svg',
};


export const TECH_SVG_MAP_CARD: Record<string, string> = {
  'Dart': '/svg/dart.svg',
  'Flutter': '/svg/flutter.svg',
  'Django': '/svg/django.svg',
  'PostgreSQL': '/svg/postgresql.svg',
  'QR Code': '/svg/qr-code_02.svg',
  'Mobile Money': '/svg/mobile-money.svg',
  'Docker': '/svg/docker.svg',
  'HTML/CSS': '/svg/html.svg',
  'Stripe': '/svg/stripe_02.svg',
  'Next.js': '/svg/next_02.svg',
  'Tailwind CSS': '/svg/tailwind.svg',
  'Framer Motion': '/svg/framer-motion.svg',
  'SEO': '/svg/seo.svg',
  'Vercel': '/svg/vercel.svg',
  'React.js': '/svg/react_02.svg',
  'Node.js': '/svg/node.svg',
  'Prisma ORM': '/svg/prisma.svg',
  'WebSocket': '/svg/websocket.svg',
  'Chart.js': '/svg/chart.svg',
  'Python': '/svg/python.svg',
  'D3.js': '/svg/d3.svg',
  'CSS': '/svg/css.svg',
  'HTML': '/svg/html.svg',
  'Java': '/svg/java.svg',
  'JavaScript': '/svg/javascript.svg',
  'TypeScript': '/svg/typescript.svg',
  'Redis': '/svg/redis.svg',
  'REST API': '/svg/rest-api.svg',
  'Spring Boot': '/svg/spring-boot.svg',
  'Supabase': '/svg/supabase.svg',
  '.NET': '/svg/dotnet.svg',
  'Linux': '/svg/linux.svg',
};
