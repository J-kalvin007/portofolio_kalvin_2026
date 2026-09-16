/* ═══════════════════════════════════════════════
   ARCHITECTURES DES PROJETS
   ═══════════════════════════════════════════════ */

import type fr from '@/messages/fr.json';
import type { ProjectI18nKey } from '@/lib/data/projects';

/**
 * @file architectures.ts
 * @description Schéma d'architecture de chaque projet, rendu sous son billet
 * par `components/architecture/ArchitectureDiagram`.
 *
 * @remarks **À valider par Kalvin avant publication.** Ces schémas ont été
 * reconstitués à partir des seules informations présentes dans le projet : la
 * stack déclarée (`lib/data/projects.ts → techStack`) et la description de
 * chaque projet (`messages/*.json → projects_data`). Aucun composant n'a été
 * inventé hors de ces sources, mais la répartition des technologies entre
 * composants reste une déduction. Un recruteur technique peut poser des
 * questions sur ces schémas : ils doivent refléter l'architecture réelle.
 *
 * **Comment modifier un schéma.** Chaque composant a une position (`x`, `y`)
 * dans une zone de 820 unités de large. Trois colonnes sont prévues :
 * `x = 24`, `322` et `620` ; les rangées usuelles sont `y = 36`, `96`, `164`
 * et `232`. Les liaisons sont tracées automatiquement (`lib/architecture/layout.ts`).
 * Les libellés sont des clés du catalogue `architecture` : en ajouter un
 * nouveau suppose d'ajouter la traduction dans `messages/fr.json` et `en.json`.
 */

/** Nature d'un composant — détermine sa forme dans le schéma. */
export type ArchNodeKind =
  | 'actor'    // personnes ou systèmes qui utilisent le logiciel (forme arrondie)
  | 'client'   // application affichée à l'utilisateur
  | 'service'  // serveur, API, traitement
  | 'data'     // stockage
  | 'external'; // service tiers (bordure pointillée)

export type ArchNodeLabel = keyof (typeof fr)['architecture']['nodes'];
export type ArchEdgeLabel = keyof (typeof fr)['architecture']['edges'];

export interface ArchNode {
  id: string;
  kind: ArchNodeKind;
  label: ArchNodeLabel;
  /** Technologie affichée sous le libellé (nom propre, non traduit). */
  tech?: string;
  x: number;
  y: number;
  /** Largeur de la boîte, quand le libellé dépasse la largeur standard (176). */
  width?: number;
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: ArchEdgeLabel;
}

export interface ArchZone {
  /** Nom propre de l'environnement (Docker, Vercel, Windows) — non traduit. */
  name: string;
  nodes: string[];
}

export interface Architecture {
  nodes: ArchNode[];
  edges: ArchEdge[];
  zones?: ArchZone[];
}

/* Colonnes et rangées de la grille de placement */
const C0 = 24;
const C1 = 322;
const C2 = 620;

/**
 * Un schéma par projet. Le type `Record<ProjectI18nKey, …>` rend l'oubli
 * impossible : ajouter un projet sans schéma est une erreur de compilation.
 */
export const ARCHITECTURES: Record<ProjectI18nKey, Architecture> = {
  /* Logiciel Windows de pointage — stack : Dart, Flutter */
  challenger: {
    nodes: [
      { id: 'employees', kind: 'actor', label: 'employees', x: C0, y: 50 },
      { id: 'clock', kind: 'client', label: 'timeClock', tech: 'Flutter', x: C1, y: 50 },
      { id: 'hours', kind: 'service', label: 'hoursCalc', tech: 'Dart', x: C2, y: 50 },
      { id: 'sheets', kind: 'data', label: 'timesheets', x: C2, y: 164 },
    ],
    edges: [
      { from: 'employees', to: 'clock', label: 'clockIn' },
      { from: 'clock', to: 'hours', label: 'records' },
      { from: 'hours', to: 'sheets', label: 'produces' },
    ],
    zones: [{ name: 'Windows', nodes: ['clock', 'hours', 'sheets'] }],
  },

  /* Billetterie mobile — stack : Flutter, Django, PostgreSQL, QR Code, Mobile Money, Docker */
  sheem: {
    nodes: [
      { id: 'app', kind: 'client', label: 'mobileApp', tech: 'Flutter', x: C0, y: 96 },
      { id: 'admin', kind: 'client', label: 'adminDashboard', x: C0, y: 232 },
      { id: 'api', kind: 'service', label: 'api', tech: 'Django', x: C1, y: 164 },
      { id: 'momo', kind: 'external', label: 'mobileMoney', x: C2, y: 36 },
      { id: 'db', kind: 'data', label: 'database', tech: 'PostgreSQL', x: C2, y: 232 },
    ],
    edges: [
      { from: 'app', to: 'api', label: 'tickets' },
      { from: 'admin', to: 'api', label: 'management' },
      { from: 'api', to: 'momo', label: 'payment' },
      { from: 'api', to: 'db', label: 'data' },
    ],
    zones: [{ name: 'Docker', nodes: ['api', 'db'] }],
  },

  /* E-commerce — stack : Django, HTML/CSS, PostgreSQL, Stripe, Docker, Next.js, Tailwind CSS */
  mboashop: {
    nodes: [
      { id: 'shop', kind: 'client', label: 'storefront', tech: 'Next.js', x: C0, y: 96 },
      { id: 'admin', kind: 'client', label: 'adminDashboard', x: C0, y: 232 },
      { id: 'api', kind: 'service', label: 'api', tech: 'Django', x: C1, y: 164 },
      { id: 'pay', kind: 'external', label: 'onlinePayment', tech: 'Stripe', x: C2, y: 36 },
      { id: 'db', kind: 'data', label: 'database', tech: 'PostgreSQL', x: C2, y: 232 },
    ],
    edges: [
      { from: 'shop', to: 'api', label: 'orders' },
      { from: 'admin', to: 'api', label: 'analytics' },
      { from: 'api', to: 'pay', label: 'payment' },
      { from: 'api', to: 'db', label: 'data' },
    ],
    zones: [{ name: 'Docker', nodes: ['api', 'db'] }],
  },

  /* Site vitrine pré-rendu — stack : Next.js, Tailwind CSS, Framer Motion, SEO, Vercel */
  myriade: {
    nodes: [
      // Boîtes élargies : « Moteurs de recherche » ne tient pas dans la largeur standard.
      { id: 'visitors', kind: 'actor', label: 'visitors', x: C0, y: 96, width: 204 },
      { id: 'search', kind: 'actor', label: 'searchEngines', x: C0, y: 232, width: 204 },
      { id: 'hosting', kind: 'service', label: 'hosting', tech: 'Vercel', x: C1, y: 164 },
      { id: 'site', kind: 'client', label: 'staticSite', tech: 'Next.js', x: C2, y: 164 },
    ],
    edges: [
      { from: 'visitors', to: 'hosting', label: 'visit' },
      { from: 'search', to: 'hosting', label: 'indexing' },
      { from: 'hosting', to: 'site', label: 'prerendered' },
    ],
    zones: [{ name: 'Vercel', nodes: ['hosting', 'site'] }],
  },

  /* Gestion de stock en temps réel — stack : React.js, Node.js, Prisma ORM, WebSocket, Chart.js */
  stock: {
    nodes: [
      { id: 'scan', kind: 'external', label: 'barcodes', x: C0, y: 36 },
      { id: 'web', kind: 'client', label: 'webApp', tech: 'React · Chart.js', x: C0, y: 164 },
      { id: 'realtime', kind: 'service', label: 'realtime', tech: 'WebSocket', x: C1, y: 36 },
      { id: 'server', kind: 'service', label: 'server', tech: 'Node.js', x: C1, y: 164 },
      { id: 'db', kind: 'data', label: 'database', x: C2, y: 36 },
      { id: 'orm', kind: 'service', label: 'orm', tech: 'Prisma', x: C2, y: 164 },
    ],
    edges: [
      { from: 'scan', to: 'web', label: 'scan' },
      { from: 'web', to: 'server', label: 'requests' },
      { from: 'server', to: 'realtime', label: 'alerts' },
      { from: 'server', to: 'orm', label: 'data' },
      { from: 'orm', to: 'db' },
    ],
  },

  /* Gestion de plantation — stack : Python, Django, PostgreSQL, D3.js, Docker, Next.js, Tailwind CSS, Flutter */
  green: {
    nodes: [
      { id: 'field', kind: 'client', label: 'fieldApp', tech: 'Flutter', x: C0, y: 96 },
      { id: 'dash', kind: 'client', label: 'dashboard', tech: 'Next.js · D3.js', x: C0, y: 232 },
      { id: 'api', kind: 'service', label: 'restApi', tech: 'Django', x: C1, y: 164 },
      { id: 'pipeline', kind: 'service', label: 'dataPipeline', tech: 'Python', x: C2, y: 36 },
      { id: 'db', kind: 'data', label: 'database', tech: 'PostgreSQL', x: C2, y: 232 },
    ],
    edges: [
      { from: 'field', to: 'api', label: 'fieldData' },
      { from: 'dash', to: 'api', label: 'charts' },
      { from: 'api', to: 'db', label: 'data' },
      { from: 'pipeline', to: 'db', label: 'analytics' },
    ],
    zones: [{ name: 'Docker', nodes: ['api', 'pipeline', 'db'] }],
  },

  /* Gestion locative mobile — stack : Flutter, Dart, Django, PostgreSQL, Docker */
  locamanager: {
    nodes: [
      { id: 'managers', kind: 'actor', label: 'managers', x: C0, y: 36 },
      { id: 'app', kind: 'client', label: 'mobileApp', tech: 'Flutter · Dart', x: C0, y: 164 },
      { id: 'api', kind: 'service', label: 'restApi', tech: 'Django', x: C1, y: 164 },
      { id: 'pipeline', kind: 'service', label: 'dataPipeline', x: C2, y: 36 },
      { id: 'db', kind: 'data', label: 'database', tech: 'PostgreSQL', x: C2, y: 164 },
    ],
    edges: [
      { from: 'managers', to: 'app', label: 'management' },
      { from: 'app', to: 'api', label: 'rentals' },
      { from: 'api', to: 'pipeline', label: 'charts' },
      { from: 'api', to: 'db', label: 'data' },
    ],
    zones: [{ name: 'Docker', nodes: ['api', 'pipeline', 'db'] }],
  },

  /* Plateforme multi-tenant de magasins — stack : Next.js, Prisma ORM, Docker, Chart.js, Tailwind CSS */
  lotus: {
    nodes: [
      { id: 'stores', kind: 'actor', label: 'stores', x: C0, y: 36 },
      { id: 'web', kind: 'client', label: 'webApp', tech: 'Next.js · Chart.js', x: C0, y: 164 },
      { id: 'api', kind: 'service', label: 'restApi', x: C1, y: 164 },
      { id: 'db', kind: 'data', label: 'database', x: C2, y: 36 },
      { id: 'orm', kind: 'service', label: 'orm', tech: 'Prisma', x: C2, y: 164 },
    ],
    edges: [
      { from: 'stores', to: 'web', label: 'promotions' },
      { from: 'web', to: 'api', label: 'requests' },
      { from: 'api', to: 'orm', label: 'data' },
      { from: 'orm', to: 'db' },
    ],
    zones: [{ name: 'Docker', nodes: ['api', 'orm', 'db'] }],
  },
};
