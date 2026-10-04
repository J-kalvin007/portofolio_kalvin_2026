'use client';

/**
 * @file Transfer.tsx
 * @description Section « Configuration » de la régie : exporter, importer,
 * réinitialiser.
 *
 * @architecture
 * Rien ici ne touche au site : ces trois actions modifient le **brouillon**,
 * que seul le bouton « Publier » enregistre.
 *
 * Une configuration importée n'est jamais appliquée telle quelle. Elle passe
 * par `unwrapVisualConfig`, donc par la validation : un nombre hors bornes est
 * ramené dans l'intervalle, une couleur mal formée ou un champ inconnu reprend
 * sa valeur par défaut. Seul un texte qui n'est pas du JSON est refusé, avec un
 * message — le brouillon en cours est alors laissé intact.
 */

import { useState, type ChangeEvent } from 'react';
import { BUTTON_SECONDARY } from '@/components/ui/styles';
import { DEFAULT_VISUAL_CONFIG, VISUAL_CONFIG_MAX_BYTES, VISUAL_CONFIG_VERSION, unwrapVisualConfig, type VisualConfig } from '@/lib/visual/config';

interface TransferProps {
  draft: VisualConfig;
  /** Remplace le brouillon (import ou réinitialisation). */
  onReplace: (config: VisualConfig, notice: string) => void;
}

export default function Transfer({ draft, onReplace }: TransferProps) {
  const [source, setSource] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  // Sans date d'enregistrement : le texte exporté ne dépend que du brouillon,
  // et deux exports d'une même configuration sont identiques.
  const exported = JSON.stringify({ version: VISUAL_CONFIG_VERSION, config: draft }, null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exported);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Presse-papiers refusé par le navigateur : le téléchargement reste disponible. */
    }
  };

  const importText = (text: string) => {
    if (text.trim() === '') return;
    if (text.length > VISUAL_CONFIG_MAX_BYTES) {
      setImportError('Ce fichier est trop volumineux pour être une configuration.');
      return;
    }
    try {
      onReplace(unwrapVisualConfig(JSON.parse(text)), 'Configuration importée dans le brouillon.');
      setSource('');
      setImportError(null);
    } catch {
      setImportError('Ce texte n’est pas un JSON valide. Le brouillon n’a pas été modifié.');
    }
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Permet de réimporter le même fichier juste après.
    event.target.value = '';
    if (file) importText(await file.text());
  };

  return (
    <div className="rg-transfer">
      {/* ── Exporter ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="rg-export-title" className="rg-block">
        <h3 id="rg-export-title" className="rg-block-title">
          Exporter
        </h3>
        <p className="rg-hint">Le brouillon en cours, pour le conserver ou le reprendre plus tard.</p>
        <pre className="rg-code" tabIndex={0} aria-label="Configuration au format JSON">
          {exported}
        </pre>
        <div className="rg-row">
          <a className={BUTTON_SECONDARY} href={`data:application/json;charset=utf-8,${encodeURIComponent(exported)}`} download="regie-lumiere.json">
            Télécharger le fichier
          </a>
          <button type="button" className={BUTTON_SECONDARY} onClick={copy}>
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
      </section>

      {/* ── Importer ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="rg-import-title" className="rg-block">
        <h3 id="rg-import-title" className="rg-block-title">
          Importer
        </h3>
        <p className="rg-hint">Collez une configuration exportée, ou choisissez son fichier. Les valeurs sont vérifiées avant d’être appliquées.</p>
        <label htmlFor="rg-import-source" className="sr-only">
          Configuration à importer, au format JSON
        </label>
        <textarea
          id="rg-import-source"
          rows={5}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
          placeholder="{ … }"
          aria-invalid={importError !== null}
          aria-describedby={importError ? 'rg-import-error' : undefined}
          className="rg-textarea"
        />
        <div aria-live="polite">
          {importError && (
            <p id="rg-import-error" role="alert" className="rg-error">
              {importError}
            </p>
          )}
        </div>
        <div className="rg-row">
          <button type="button" className={BUTTON_SECONDARY} onClick={() => importText(source)} disabled={source.trim() === ''}>
            Importer le texte
          </button>
          <label className={`${BUTTON_SECONDARY} rg-file`}>
            Choisir un fichier
            <input type="file" accept="application/json,.json" onChange={importFile} className="sr-only" />
          </label>
        </div>
      </section>

      {/* ── Réinitialiser ────────────────────────────────────────────────── */}
      <section aria-labelledby="rg-reset-title" className="rg-block">
        <h3 id="rg-reset-title" className="rg-block-title">
          Réinitialiser
        </h3>
        <p className="rg-hint">Ramène le brouillon à l’état d’origine du site : fond de points, lumières éteintes.</p>
        {confirmingReset ? (
          <div className="rg-row" role="group" aria-label="Confirmer la réinitialisation">
            <button
              type="button"
              className={`${BUTTON_SECONDARY} rg-danger`}
              onClick={() => {
                onReplace(DEFAULT_VISUAL_CONFIG, 'Brouillon réinitialisé. Publiez pour l’appliquer au site.');
                setConfirmingReset(false);
              }}
            >
              Oui, tout réinitialiser
            </button>
            <button type="button" className={BUTTON_SECONDARY} onClick={() => setConfirmingReset(false)}>
              Annuler
            </button>
          </div>
        ) : (
          <div className="rg-row">
            <button type="button" className={BUTTON_SECONDARY} onClick={() => setConfirmingReset(true)}>
              Réinitialiser la configuration
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
