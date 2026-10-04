'use client';

/**
 * @file controls.tsx
 * @description Contrôles de la régie : un composant par nature de réglage.
 *
 * @architecture
 * `FieldControl` reçoit le **chemin** d'un réglage (`cursor.radius`) et choisit
 * le contrôle d'après son descripteur (`lib/visual/config.ts`) : interrupteur,
 * curseur, choix, couleur ou sélecteur de motif. Libellé, aide, bornes, pas et
 * unité viennent tous du descripteur — la régie n'écrit aucun de ces textes.
 * Un réglage ajouté au schéma apparaît donc ici sans qu'on touche à ce fichier.
 *
 * Chaque contrôle s'appuie sur un élément natif (`input`, `button`) : le clavier,
 * le focus et les lecteurs d'écran fonctionnent sans code supplémentaire.
 */

import { useId, useState, type CSSProperties } from 'react';
import {
  fieldOf,
  type ChoiceField,
  type ColorField,
  type NumberField,
  type VisualField,
  type VisualFieldPath,
  type VisualValue,
} from '@/lib/visual/config';
import { MOTIFS, MOTIF_IDS, motifShape, type MotifId } from '@/lib/visual/motifs';

interface FieldControlProps {
  path: VisualFieldPath;
  value: VisualValue;
  onChange: (path: VisualFieldPath, value: VisualValue) => void;
}

/** Valeur d'un nombre telle qu'on la lit : « 35 % », « 220 px », « 0,5 s ». */
function formatNumber(value: number, field: NumberField): string {
  if (field.percent) return `${Math.round(value * 100)} %`;
  const text = value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  return field.unit ? `${text} ${field.unit}` : text;
}

export function FieldControl({ path, value, onChange }: FieldControlProps) {
  const field: VisualField = fieldOf(path);
  const id = useId();
  const change = (next: VisualValue) => onChange(path, next);

  switch (field.kind) {
    case 'boolean':
      return <SwitchControl id={id} label={field.label} hint={field.hint} checked={value === true} onChange={change} />;
    case 'number':
      return <SliderControl id={id} field={field} value={Number(value)} onChange={change} />;
    case 'choice':
      return <ChoiceControl id={id} field={field} value={String(value)} onChange={change} />;
    case 'color':
      return <ColorControl id={id} field={field} value={String(value)} onChange={change} />;
    case 'motif':
      return <MotifControl id={id} label={field.label} hint={field.hint} value={value as MotifId} onChange={change} />;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ INTERRUPTEUR
   ═══════════════════════════════════════════════════════════════════════════ */

interface SwitchControlProps {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SwitchControl({ id, label, hint, checked, onChange }: SwitchControlProps) {
  return (
    <div className="rg-field rg-field--inline">
      <div>
        <p id={`${id}-label`} className="rg-label">
          {label}
        </p>
        {hint && (
          <p id={`${id}-hint`} className="rg-hint">
            {hint}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => onChange(!checked)}
        className="rg-switch"
      >
        <span aria-hidden="true" className="rg-switch-thumb" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CURSEUR NUMÉRIQUE
   ═══════════════════════════════════════════════════════════════════════════ */

function SliderControl({ id, field, value, onChange }: { id: string; field: NumberField; value: number; onChange: (value: number) => void }) {
  // Part de la piste déjà parcourue : sert à la peindre (`regie.css`).
  const filled = ((value - field.min) / (field.max - field.min)) * 100;

  return (
    <div className="rg-field">
      <div className="rg-field-head">
        <label htmlFor={id} className="rg-label">
          {field.label}
        </label>
        <output htmlFor={id} className="rg-value">
          {formatNumber(value, field)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-describedby={field.hint ? `${id}-hint` : undefined}
        aria-valuetext={formatNumber(value, field)}
        className="rg-range"
        style={{ '--rg-fill': `${filled}%` } as CSSProperties}
      />
      {field.hint && (
        <p id={`${id}-hint`} className="rg-hint">
          {field.hint}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CHOIX — boutons radio natifs, habillés en pastilles
   ═══════════════════════════════════════════════════════════════════════════ */

function ChoiceControl({ id, field, value, onChange }: { id: string; field: ChoiceField; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset className="rg-field rg-fieldset" aria-describedby={field.hint ? `${id}-hint` : undefined}>
      <legend className="rg-label">{field.label}</legend>
      <div className="rg-choices">
        {field.options.map((option) => (
          <label key={option.value} className="rg-choice">
            <input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {field.hint && (
        <p id={`${id}-hint`} className="rg-hint">
          {field.hint}
        </p>
      )}
    </fieldset>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ COULEUR
   ═══════════════════════════════════════════════════════════════════════════ */

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function ColorControl({ id, field, value, onChange }: { id: string; field: ColorField; value: string; onChange: (value: string) => void }) {
  /**
   * Saisie en cours dans le champ de code, tant qu'elle n'est pas un code
   * complet (`#1f3`). `null` : le champ affiche la couleur du réglage — il suit
   * donc de lui-même la pastille, un préréglage ou un import.
   */
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const handleCodeChange = (code: string) => {
    if (HEX_COLOR.test(code)) {
      setPendingCode(null);
      onChange(code.toLowerCase());
    } else {
      // Code incomplet : gardé dans le champ, sans toucher au réglage.
      setPendingCode(code);
    }
  };

  return (
    <div className="rg-field">
      <div className="rg-field-head">
        <label htmlFor={id} className="rg-label">
          {field.label}
        </label>
        <div className="rg-color">
          <input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="rg-color-swatch" aria-describedby={field.hint ? `${id}-hint` : undefined} />
          {/* Champ libre : la saisie n'est transmise qu'une fois complète
              (`#rrggbb`). Quitter le champ sur un code incomplet le ramène à
              la couleur en vigueur. */}
          <input
            type="text"
            value={pendingCode ?? value}
            onChange={(event) => handleCodeChange(event.target.value)}
            onBlur={() => setPendingCode(null)}
            spellCheck={false}
            maxLength={7}
            aria-label={`${field.label} — code hexadécimal`}
            className="rg-color-code"
          />
        </div>
      </div>
      {field.hint && (
        <p id={`${id}-hint`} className="rg-hint">
          {field.hint}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ MOTIF — une vignette par forme du registre
   ═══════════════════════════════════════════════════════════════════════════ */

/** Côté du motif dans sa vignette, en unités du `viewBox` (24). */
const THUMBNAIL_SIZE = 14;

function MotifControl({ id, label, hint, value, onChange }: { id: string; label: string; hint?: string; value: MotifId; onChange: (value: MotifId) => void }) {
  return (
    <fieldset className="rg-field rg-fieldset" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className="rg-label">{label}</legend>
      <div className="rg-motifs">
        {MOTIF_IDS.map((motif) => {
          const shape = motifShape(motif, THUMBNAIL_SIZE);
          return (
            <label key={motif} className="rg-motif">
              <input type="radio" name={id} value={motif} checked={value === motif} onChange={() => onChange(motif)} />
              <span className="rg-motif-tile">
                <svg viewBox="-12 -12 24 24" aria-hidden="true" focusable="false">
                  {shape.stroke === undefined ? (
                    <path d={shape.d} fill="currentColor" />
                  ) : (
                    <path d={shape.d} fill="none" stroke="currentColor" strokeWidth={shape.stroke} strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                <span className="rg-motif-name">{MOTIFS[motif].label}</span>
              </span>
            </label>
          );
        })}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="rg-hint">
          {hint}
        </p>
      )}
    </fieldset>
  );
}
