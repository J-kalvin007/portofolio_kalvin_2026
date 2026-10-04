'use client';

/**
 * @file RegiePanel.tsx
 * @description Le panneau de la régie : sections de réglages, aperçu en
 * direct, publication.
 *
 * @architecture
 * Deux configurations cohabitent :
 *
 *  - `published` — ce que le site affiche réellement, tel que le serveur l'a
 *    lu au chargement de la page puis à chaque publication réussie ;
 *  - `draft` — ce que les contrôles modifient. L'aperçu rend le brouillon ;
 *    le site, lui, ne change pas tant que « Publier » n'a pas réussi.
 *
 * Régler n'a donc aucune conséquence pour les visiteurs : on essaie, on
 * regarde, puis on publie — ou on annule.
 *
 * Les sections de réglages ne sont pas écrites à la main. Chacune affiche les
 * champs de `VISUAL_FIELDS` dont le chemin commence par son nom (`cursor.` pour
 * « Curseur ») : un réglage ajouté au schéma trouve sa place tout seul.
 */

import { useCallback, useMemo, useState } from 'react';
import { Loader2, LogOut, Moon, Sun } from 'lucide-react';
import type { LightFieldStats } from '@/components/visual/LightField';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '@/components/ui/styles';
import {
  VISUAL_FIELD_PATHS,
  fieldOf,
  readField,
  sameVisualConfig,
  unwrapVisualConfig,
  writeField,
  type VisualConfig,
  type VisualFieldPath,
  type VisualValue,
} from '@/lib/visual/config';
import { resolveVisual } from '@/lib/visual/css';
import { MOTIFS } from '@/lib/visual/motifs';
import { VISUAL_PRESETS } from '@/lib/visual/presets';
import type { VisualStorageKind } from '@/lib/visual/store';
import { tileSize } from '@/lib/visual/tile';
import { useThemeStore } from '@/lib/useTheme';
import { FieldControl } from './controls';
import Preview from './Preview';
import Transfer from './Transfer';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ SECTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Sections du panneau. Celles qui portent `prefix` affichent les réglages du
 * schéma dont le chemin commence par ce préfixe ; les autres ont un contenu
 * propre.
 */
const SECTIONS = [
  { id: 'overview', label: 'Vue générale', lead: 'L’état du moteur, d’un coup d’œil.' },
  { id: 'pattern', label: 'Motif', lead: 'La forme répétée sur le fond des pages.', prefix: 'pattern.' },
  { id: 'light', label: 'Lumières', lead: 'La couleur et l’éclat des motifs allumés.', prefix: 'light.' },
  { id: 'cursor', label: 'Curseur', lead: 'Le halo qui accompagne la souris.', prefix: 'cursor.' },
  { id: 'ambient', label: 'Ambiance', lead: 'Un éclairage qui n’attend pas le curseur.', prefix: 'ambient.' },
  { id: 'buttons', label: 'Boutons', lead: 'L’éclairage des boutons au survol et au focus.', prefix: 'buttons.' },
  { id: 'comfort', label: 'Confort', lead: 'Ce que le moteur s’autorise sur téléphone, et ce qu’il respecte toujours.', prefix: 'comfort.' },
  { id: 'presets', label: 'Préréglages', lead: 'Des configurations complètes, à essayer puis à retoucher.' },
  { id: 'transfer', label: 'Configuration', lead: 'Exporter, importer ou réinitialiser le brouillon.' },
  { id: 'debug', label: 'Diagnostic', lead: 'Ce que le moteur fait réellement, pour comprendre un comportement.' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const STORAGE_LABELS: Record<VisualStorageKind, { name: string; detail: string }> = {
  upstash: { name: 'Upstash Redis', detail: 'La publication s’applique à tous les visiteurs, dès leur prochaine visite.' },
  file: { name: 'Fichier local', detail: 'Enregistré dans .data/visual-config.json. Convient au développement et à un serveur doté d’un disque.' },
  none: {
    name: 'Aucun',
    detail: 'Publication impossible : définissez UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN sur l’hébergeur, puis redéployez.',
  },
};

type Notice = { tone: 'success' | 'error' | 'info'; message: string };

interface RegiePanelProps {
  /** Configuration publiée au moment du chargement de la page. */
  initialConfig: VisualConfig;
  storage: VisualStorageKind;
}

export default function RegiePanel({ initialConfig, storage }: RegiePanelProps) {
  const [published, setPublished] = useState(initialConfig);
  const [draft, setDraft] = useState(initialConfig);
  const [section, setSection] = useState<SectionId>('overview');
  const [isPublishing, setIsPublishing] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [stats, setStats] = useState<LightFieldStats>({ fps: null });

  const isDirty = !sameVisualConfig(draft, published);
  const active = SECTIONS.find((candidate) => candidate.id === section)!;

  /* `writeField` repasse la configuration entière par la validation : une
     valeur hors bornes ne peut pas entrer dans le brouillon. */
  const changeField = useCallback((path: VisualFieldPath, value: VisualValue) => {
    setDraft((current) => writeField(current, path, value));
    setNotice(null);
  }, []);

  const replaceDraft = useCallback((config: VisualConfig, message: string) => {
    setDraft(config);
    setNotice({ tone: 'info', message });
  }, []);

  /* Fonction stable : `LightField` se réabonnerait à chaque rendu sinon. */
  const handleStats = useCallback((next: LightFieldStats) => {
    setStats((current) => (current.fps === next.fps ? current : next));
  }, []);

  /* ── Publication ──────────────────────────────────────────────────────── */
  const publish = async () => {
    if (isPublishing || !isDirty) return;

    setIsPublishing(true);
    setNotice(null);
    try {
      const response = await fetch('/api/regie/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: draft }),
      });
      const result = (await response.json().catch(() => ({}))) as { config?: unknown; message?: string };

      if (response.status === 401) {
        // Session expirée : le serveur réaffichera l'écran de connexion.
        window.location.reload();
        return;
      }
      if (!response.ok) {
        setNotice({ tone: 'error', message: result.message ?? 'La publication a échoué.' });
      } else {
        // Le serveur renvoie ce qu'il a réellement enregistré, après validation.
        const saved = unwrapVisualConfig(result.config);
        setPublished(saved);
        setDraft(saved);
        setNotice({ tone: 'success', message: 'Publié. Le site applique ces réglages dès la prochaine visite.' });
      }
    } catch {
      setNotice({ tone: 'error', message: 'Problème de connexion. Rien n’a été publié.' });
    }
    setIsPublishing(false);
  };

  const logout = async () => {
    await fetch('/api/regie/session', { method: 'DELETE' }).catch(() => undefined);
    window.location.reload();
  };

  const fieldsOf = (prefix: string) => VISUAL_FIELD_PATHS.filter((path) => path.startsWith(prefix));

  return (
    <div className="rg">
      {/* ── Barre de titre ─────────────────────────────────────────────── */}
      <header className="rg-bar">
        <div className="rg-brand">
          <span className="rg-brand-perf" aria-hidden="true" />
          <div>
            <p className="rg-brand-over">Portfolio</p>
            <h1 className="rg-brand-name">Régie lumière</h1>
          </div>
        </div>

        <p className="rg-state" data-dirty={isDirty || undefined} aria-live="polite">
          {isDirty ? 'Brouillon non publié' : 'Site à jour'}
        </p>

        <div className="rg-bar-actions">
          <button type="button" className={BUTTON_SECONDARY} onClick={() => replaceDraft(published, 'Modifications annulées.')} disabled={!isDirty || isPublishing}>
            Annuler
          </button>
          <button type="button" className={BUTTON_PRIMARY} onClick={publish} disabled={!isDirty || isPublishing} aria-busy={isPublishing}>
            {isPublishing && <Loader2 aria-hidden="true" className="h-[1.1em] w-[1.1em] animate-spin motion-reduce:animate-none" />}
            {isPublishing ? 'Publication…' : 'Publier'}
          </button>
          <ThemeButton />
          <button type="button" className="rg-icon-button" onClick={logout} aria-label="Se déconnecter" title="Se déconnecter">
            <LogOut aria-hidden="true" className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <div aria-live="polite" className="rg-notice-slot">
        {notice && (
          <p role={notice.tone === 'error' ? 'alert' : 'status'} className="rg-notice" data-tone={notice.tone}>
            {notice.message}
          </p>
        )}
      </div>

      <div className="rg-body">
        {/* ── Sections ─────────────────────────────────────────────────── */}
        <nav aria-label="Sections de la régie" className="rg-nav">
          <ul>
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <button type="button" className="rg-nav-item" aria-current={section === id ? 'true' : undefined} onClick={() => setSection(id)}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
          {/* Lien ordinaire, et non `<Link>` : le site est rechargé en entier,
              donc avec les réglages qui viennent d'être publiés. Une navigation
              côté client pourrait resservir une page que le routeur garde en
              mémoire — c'est-à-dire l'ancien réglage. La règle ESLint qui
              préfère `<Link>` est levée pour cette ligne. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="rg-nav-back">
            Voir le site
          </a>
        </nav>

        {/* ── Réglages de la section active ───────────────────────────── */}
        <section className="rg-panel" aria-labelledby="rg-section-title">
          <header className="rg-panel-head">
            <h2 id="rg-section-title" className="rg-panel-title">
              {active.label}
            </h2>
            <p className="rg-panel-lead">{active.lead}</p>
          </header>

          {'prefix' in active && (
            <>
              {!draft.enabled && section !== 'pattern' && (
                <p className="rg-callout">Les lumières sont éteintes : ces réglages s’appliqueront quand vous les allumerez, dans « Vue générale ».</p>
              )}
              <div className="rg-fields">
                {fieldsOf(active.prefix).map((path) => (
                  <FieldControl key={path} path={path} value={readField(draft, path)} onChange={changeField} />
                ))}
              </div>
              {section === 'comfort' && (
                <p className="rg-callout">
                  Toujours respecté, sans réglage : si le visiteur demande moins d’animations à son système, l’ambiance devient fixe et le halo se place sans inertie.
                </p>
              )}
            </>
          )}

          {section === 'overview' && <Overview draft={draft} storage={storage} onChange={changeField} onOpen={setSection} />}

          {section === 'presets' && (
            <ul className="rg-presets">
              {VISUAL_PRESETS.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    className="rg-preset"
                    aria-pressed={sameVisualConfig(draft, preset.config)}
                    onClick={() => replaceDraft(preset.config, `Préréglage « ${preset.label} » chargé dans le brouillon.`)}
                  >
                    <span className="rg-preset-name">{preset.label}</span>
                    <span className="rg-preset-text">{preset.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {section === 'transfer' && <Transfer draft={draft} onReplace={replaceDraft} />}

          {section === 'debug' && <Diagnostics draft={draft} storage={storage} stats={stats} />}
        </section>

        {/* ── Aperçu ───────────────────────────────────────────────────── */}
        <aside className="rg-aside" aria-label="Aperçu en direct">
          <Preview config={draft} onStats={handleStats} />
        </aside>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ VUE GÉNÉRALE
   ═══════════════════════════════════════════════════════════════════════════ */

interface OverviewProps {
  draft: VisualConfig;
  storage: VisualStorageKind;
  onChange: (path: VisualFieldPath, value: VisualValue) => void;
  onOpen: (section: SectionId) => void;
}

function Overview({ draft, storage, onChange, onOpen }: OverviewProps) {
  /** Libellé de l'option retenue pour un réglage à choix. */
  const choiceLabel = (path: VisualFieldPath): string => {
    const field = fieldOf(path);
    const value = readField(draft, path);
    return field.kind === 'choice' ? (field.options.find((option) => option.value === value)?.label ?? String(value)) : String(value);
  };

  const cards: { section: SectionId; title: string; value: string }[] = [
    { section: 'pattern', title: 'Motif', value: `${MOTIFS[draft.pattern.motif].label} · ${draft.pattern.size} px tous les ${draft.pattern.spacing} px` },
    { section: 'cursor', title: 'Curseur', value: draft.cursor.enabled ? `Halo de ${draft.cursor.radius} px` : 'Sans halo' },
    { section: 'ambient', title: 'Ambiance', value: choiceLabel('ambient.mode') },
    { section: 'buttons', title: 'Boutons', value: draft.buttons.enabled ? choiceLabel('buttons.style') : 'Sans éclairage' },
  ];

  return (
    <>
      <div className="rg-fields">
        <FieldControl path="enabled" value={draft.enabled} onChange={onChange} />
      </div>

      <ul className="rg-cards">
        {cards.map((card) => (
          <li key={card.section}>
            <button type="button" className="rg-card" onClick={() => onOpen(card.section)}>
              <span className="rg-card-title">{card.title}</span>
              <span className="rg-card-value">{card.value}</span>
            </button>
          </li>
        ))}
      </ul>

      <dl className="rg-facts">
        <div>
          <dt>Stockage</dt>
          <dd>
            <strong>{STORAGE_LABELS[storage].name}</strong> — {STORAGE_LABELS[storage].detail}
          </dd>
        </div>
      </dl>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ DIAGNOSTIC
   ───────────────────────────────────────────────────────────────────────────
   Tout ce qui est affiché est lu ou calculé à l'instant : rien n'est supposé.
   ═══════════════════════════════════════════════════════════════════════════ */

function Diagnostics({ draft, storage, stats }: { draft: VisualConfig; storage: VisualStorageKind; stats: LightFieldStats }) {
  const resolved = useMemo(() => resolveVisual(draft), [draft]);
  const tile = tileSize(draft);
  const environment = useEnvironment();

  /** Poids des tuiles injectées dans chaque page, en kilo-octets. */
  const weight = [resolved.themed.light, resolved.themed.dark]
    .flatMap((variables) => Object.values(variables))
    .concat(Object.values(resolved.shared))
    .reduce((total, value) => total + value.length, 0);

  // Un motif occupe un rectangle d'un pas de large ; en quinconce, les lignes
  // sont plus serrées (réseau triangulaire).
  const rowHeight = draft.pattern.layout === 'staggered' ? Math.round((draft.pattern.spacing * Math.sqrt(3)) / 2) : draft.pattern.spacing;
  const motifsPerScreen = Math.round((environment.width * environment.height) / (draft.pattern.spacing * rowHeight));

  const rows: [string, string][] = [
    ['Lumières', draft.enabled ? (resolved.hasLights ? 'Allumées' : 'Allumées, mais aucun effet actif') : 'Éteintes'],
    ['Fond', resolved.overridesPattern ? 'Tuile fabriquée par le moteur' : 'Tuile d’origine du site (aucune règle ajoutée)'],
    ['Tuile', `${tile.width} × ${tile.height} px`],
    ['Motifs à l’écran', `≈ ${motifsPerScreen.toLocaleString('fr-FR')} — peints par le navigateur, aucun n’est un élément de la page`],
    ['CSS ajouté à chaque page', `${(weight / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Ko avant compression`],
    ['Cadence du halo', stats.fps === null ? 'Au repos : aucune boucle ne tourne' : `${stats.fps} images par seconde`],
    ['Mouvement réduit', environment.reducedMotion ? 'Demandé par ce système : ambiance fixe, halo sans inertie' : 'Non demandé par ce système'],
    ['Pointeur', environment.finePointer ? 'Souris ou pavé tactile : halo du curseur possible' : 'Écran tactile : pas de halo de curseur'],
    ['Stockage', STORAGE_LABELS[storage].name],
  ];

  return (
    <dl className="rg-facts">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Ce que le navigateur déclare, lu au moment de l'affichage du diagnostic. */
function useEnvironment() {
  return useMemo(() => {
    // Le diagnostic n'est rendu qu'après un clic : `window` existe toujours ici.
    if (typeof window === 'undefined') return { width: 1280, height: 800, reducedMotion: false, finePointer: true };
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    };
  }, []);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ BOUTON DE THÈME
   Version locale du bouton du site : celui-ci dépend du fournisseur de
   traductions, absent de la régie.
   ═══════════════════════════════════════════════════════════════════════════ */

function ThemeButton() {
  const isDark = useThemeStore((state) => state.isDark);
  const setTheme = useThemeStore((state) => state.setTheme);
  const label = isDark ? 'Passer en mode clair' : 'Passer en mode sombre';

  return (
    <button type="button" className="rg-icon-button" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={label} title={label}>
      {isDark ? <Sun aria-hidden="true" className="h-[18px] w-[18px]" /> : <Moon aria-hidden="true" className="h-[18px] w-[18px]" />}
    </button>
  );
}
