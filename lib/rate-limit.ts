/**
 * @file lib/rate-limit.ts
 * @description Quota par adresse IP, en mémoire du processus.
 *
 * @architecture
 * Les deux points d'entrée publics du site (message de contact, demande de
 * rendez-vous) écrivent chacun dans la boîte mail de Kalvin : sans quota, un
 * script trivial épuise en quelques minutes le plafond d'envoi de Gmail
 * (500 messages par jour), et le compte cesse d'émettre pendant 24 heures — y
 * compris pour son courrier personnel.
 *
 * Une seule implémentation, deux quotas : la limite était écrite dans la route
 * de contact, et la dupliquer pour les rendez-vous aurait fait diverger deux
 * copies du même algorithme.
 *
 * ⚠️ **L'état vit dans la mémoire du processus.** Sur une plateforme sans
 * serveur, chaque instance a donc son propre compteur, et l'état disparaît au
 * refroidissement. Cela arrête les envois en rafale, pas un attaquant
 * déterminé. Pour une protection réelle, adosser ce compteur à un magasin
 * partagé (Upstash Redis, Vercel KV) : la signature ci-dessous est prévue pour
 * ce remplacement.
 */

export interface RateLimitVerdict {
  limited: boolean;
  /** Délai avant réouverture du quota, en secondes. */
  retryAfterSeconds: number;
}

export interface RateLimiterOptions {
  /** Fenêtre d'observation glissante, en millisecondes. */
  windowMs: number;
  /** Nombre de requêtes autorisées par identifiant et par fenêtre. */
  max: number;
  /** Au-delà de ce nombre d'identifiants suivis, les entrées expirées sont purgées. */
  cleanupThreshold?: number;
}

export interface RateLimiter {
  check(identifier: string): RateLimitVerdict;
}

export function createRateLimiter({ windowMs, max, cleanupThreshold = 500 }: RateLimiterOptions): RateLimiter {
  /** Horodatages des requêtes récentes, indexés par identifiant. */
  const hits = new Map<string, number[]>();

  const prune = (now: number) => {
    for (const [identifier, timestamps] of hits) {
      const recent = timestamps.filter((at) => now - at < windowMs);
      if (recent.length === 0) hits.delete(identifier);
      else hits.set(identifier, recent);
    }
  };

  return {
    check(identifier: string): RateLimitVerdict {
      const now = Date.now();
      if (hits.size > cleanupThreshold) prune(now);

      const recent = (hits.get(identifier) ?? []).filter((at) => now - at < windowMs);

      if (recent.length >= max) {
        const oldest = Math.min(...recent);
        return { limited: true, retryAfterSeconds: Math.ceil((windowMs - (now - oldest)) / 1000) };
      }

      recent.push(now);
      hits.set(identifier, recent);
      return { limited: false, retryAfterSeconds: 0 };
    },
  };
}

/** Adresse du client derrière le proxy de la plateforme. */
export function clientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return request.headers.get('x-real-ip') ?? 'unknown';
}
