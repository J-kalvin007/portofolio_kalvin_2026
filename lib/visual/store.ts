/**
 * @file lib/visual/store.ts
 * @description Enregistrement de la configuration publiée. **Module serveur.**
 *
 * @architecture
 * Le site n'a pas de base de données, et ses pages sont pré-rendues. Pour qu'un
 * réglage enregistré dans la régie s'applique à tous les visiteurs, il faut
 * donc un endroit durable où le lire. Deux magasins, choisis d'après les
 * variables d'environnement présentes :
 *
 * | Magasin    | Quand                                   | Où                         |
 * |------------|-----------------------------------------|----------------------------|
 * | `upstash`  | `UPSTASH_REDIS_REST_URL` + `…_TOKEN`    | Redis Upstash, par HTTPS   |
 * | `file`     | sinon, hors Vercel (local, Docker)      | `.data/visual-config.json` |
 * | `none`     | sur Vercel sans Upstash                 | nulle part : lecture seule |
 *
 * **Pourquoi Upstash sur Vercel.** Une fonction sans serveur n'a pas de disque
 * durable : un fichier écrit par une requête a disparu à la suivante. Upstash
 * se pilote par de simples requêtes HTTPS — aucune dépendance à installer,
 * aucune connexion à maintenir — et son offre gratuite couvre très largement
 * une clé lue quelques fois par jour.
 *
 * **La lecture ne casse jamais le site.** Magasin injoignable, valeur
 * corrompue, fichier absent : dans tous les cas, `readPublishedVisualConfig`
 * rend la configuration par défaut, et le site s'affiche comme avant.
 *
 * @remarks **Pages statiques et mise à jour immédiate.** Chaque page pré-rendue
 * est inscrite sous l'étiquette `VISUAL_CONFIG_TAG` : elle reste statique, et
 * aucune requête ne part vers le magasin à chaque visite. Quand la régie
 * enregistre, la route d'API invalide cette étiquette ; la visite suivante
 * régénère la page avec la nouvelle configuration.
 *
 * @remarks **Filet de sécurité hors Vercel.** Sur Vercel, le build lit le même
 * magasin que le site en service : les pages pré-rendues sont justes dès le
 * déploiement. Ailleurs, l'image Docker est construite sans les variables de
 * production ni le disque du serveur : ses pages sont pré-rendues avec la
 * configuration par défaut, et le resteraient jusqu'à la prochaine publication.
 * Elles y reçoivent donc une durée de vie de cinq minutes (`CACHE_LIFETIME`) :
 * après un redéploiement, la configuration publiée réapparaît d'elle-même. Le
 * visiteur n'attend jamais — Next sert la page en cache, puis la régénère en
 * arrière-plan.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { unstable_cache } from 'next/cache';
import { DEFAULT_VISUAL_CONFIG, unwrapVisualConfig, wrapVisualConfig, type VisualConfig } from './config';

/** Étiquette de cache de la configuration publiée (voir `revalidateTag`). */
export const VISUAL_CONFIG_TAG = 'visual-config';

/** Clé de la configuration dans Redis. */
const STORAGE_KEY = 'portfolio:visual-config';

/** Build ou exécution sur Vercel : la plateforme définit toujours `VERCEL`. */
const isVercel = Boolean(process.env.VERCEL);

/**
 * Durée de vie d'une lecture mise en cache, en secondes. Illimitée sur Vercel :
 * seule une publication la périme. Cinq minutes ailleurs — voir « Filet de
 * sécurité hors Vercel », en tête de fichier.
 */
const CACHE_LIFETIME: number | false = isVercel ? false : 5 * 60;

export type VisualStorageKind = 'upstash' | 'file' | 'none';

/** Le magasin n'accepte pas d'écriture (Vercel sans Upstash, disque protégé…). */
export class VisualStorageUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VisualStorageUnavailableError';
  }
}

/**
 * Identifiants Upstash. Les deux jeux de noms sont acceptés : celui d'Upstash,
 * et celui que pose l'intégration « KV » de Vercel pour le même service.
 */
function upstashCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

export function visualStorageKind(): VisualStorageKind {
  if (upstashCredentials()) return 'upstash';
  return isVercel ? 'none' : 'file';
}

/**
 * Emplacement du fichier de configuration (magasin `file`). Dans l'image
 * Docker, c'est `/app/.data` : y monter un volume conserve la configuration
 * d'un déploiement à l'autre (voir `Dockerfile`).
 */
const storageFile = (): string => path.join(process.cwd(), '.data', 'visual-config.json');

const isMissingFile = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'ENOENT';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ LECTURE
   ═══════════════════════════════════════════════════════════════════════════ */

interface ReadOptions {
  /**
   * `true` : relit le magasin sans passer par le cache. Réservé à la régie, qui
   * doit toujours voir la dernière valeur enregistrée.
   */
  fresh?: boolean;
}

async function readFromUpstash({ fresh = false }: ReadOptions): Promise<VisualConfig> {
  const { url, token } = upstashCredentials()!;
  const response = await fetch(`${url}/get/${encodeURIComponent(STORAGE_KEY)}`, {
    headers: { Authorization: `Bearer ${token}` },
    ...(fresh
      ? { cache: 'no-store' as const }
      : { cache: 'force-cache' as const, next: { tags: [VISUAL_CONFIG_TAG], revalidate: CACHE_LIFETIME } }),
  });
  if (!response.ok) throw new Error(`Upstash a répondu ${response.status}`);

  // Réponse d'Upstash : `{ "result": "<valeur>" }`, ou `{ "result": null }` si la clé n'existe pas.
  const { result } = (await response.json()) as { result: string | null };
  return result === null ? DEFAULT_VISUAL_CONFIG : unwrapVisualConfig(JSON.parse(result));
}

async function readFromFile(): Promise<VisualConfig> {
  try {
    /* `turbopackIgnore` : ce fichier est un état du serveur, écrit après le
       build — pas une ressource à embarquer. Sans cette consigne, l'analyse du
       build suit ce chemin calculé et recopie tout le projet dans le paquet
       serveur. */
    return unwrapVisualConfig(JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ storageFile(), 'utf8')));
  } catch (error) {
    // Un fichier absent est l'état normal avant le premier enregistrement.
    if (isMissingFile(error)) return DEFAULT_VISUAL_CONFIG;
    throw error;
  }
}

/**
 * Donne à la page en cours de rendu l'étiquette `VISUAL_CONFIG_TAG` et la durée
 * de vie `CACHE_LIFETIME` — ce que `fetch` fait de lui-même pour Upstash.
 *
 * Le fichier, lui, n'est pas mis en cache : il est relu à chaque génération de
 * page, qui porte donc toujours la configuration du moment. Seul ce marqueur
 * passe par le cache de Next, parce que c'est en le traversant qu'une lecture
 * inscrit son étiquette et sa durée sur la page. `unstable_cache` est l'outil
 * prévu pour cela tant que le projet n'active pas les « Cache Components » ;
 * ce jour-là, `cacheTag` et `cacheLife` le remplaceront.
 */
const tagRenderedPage = unstable_cache(async () => true, ['visual-config-file'], {
  tags: [VISUAL_CONFIG_TAG],
  revalidate: CACHE_LIFETIME,
});

/** Configuration publiée, ou la configuration par défaut si elle est illisible. */
export async function readPublishedVisualConfig(options: ReadOptions = {}): Promise<VisualConfig> {
  try {
    switch (visualStorageKind()) {
      case 'upstash':
        return await readFromUpstash(options);
      case 'file':
        /* Rien à inscrire pour la régie (`fresh`), qui n'est pas pré-rendue,
           ni en développement, où chaque visite rend la page à neuf. */
        if (!options.fresh && process.env.NODE_ENV !== 'development') await tagRenderedPage();
        return await readFromFile();
      case 'none':
        return DEFAULT_VISUAL_CONFIG;
    }
  } catch (error) {
    console.error('[visual] Configuration illisible, valeurs par défaut appliquées :', error instanceof Error ? error.message : error);
    return DEFAULT_VISUAL_CONFIG;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ ÉCRITURE
   ═══════════════════════════════════════════════════════════════════════════ */

async function writeToUpstash(payload: string): Promise<void> {
  const { url, token } = upstashCredentials()!;
  // API REST d'Upstash : le corps de la requête est le dernier argument de la
  // commande, ici la valeur de `SET <clé> <valeur>`.
  const response = await fetch(`${url}/set/${encodeURIComponent(STORAGE_KEY)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
    cache: 'no-store',
  });
  if (!response.ok) throw new VisualStorageUnavailableError(`Upstash a refusé l'enregistrement (${response.status}).`);
}

async function writeToFile(payload: string): Promise<void> {
  const file = storageFile();
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    // Écriture puis renommage : un lecteur ne voit jamais un fichier à moitié écrit.
    const temporary = `${file}.${process.pid}.tmp`;
    await fs.writeFile(temporary, payload, 'utf8');
    await fs.rename(temporary, file);
  } catch (error) {
    // Le chemin et l'erreur du système restent dans le journal du serveur : le
    // message renvoyé à la régie n'expose pas l'arborescence de la machine.
    console.error(`[visual] Écriture impossible dans ${file} :`, error instanceof Error ? error.message : error);
    throw new VisualStorageUnavailableError('Écriture impossible sur le disque du serveur. Le détail figure dans son journal.');
  }
}

/** Enregistre la configuration. Lève `VisualStorageUnavailableError` en cas d'échec. */
export async function writePublishedVisualConfig(config: VisualConfig): Promise<void> {
  const payload = JSON.stringify(wrapVisualConfig(config));

  switch (visualStorageKind()) {
    case 'upstash':
      return writeToUpstash(payload);
    case 'file':
      return writeToFile(payload);
    case 'none':
      throw new VisualStorageUnavailableError(
        'Aucun stockage n’est configuré : définissez UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN sur l’hébergeur.',
      );
  }
}
