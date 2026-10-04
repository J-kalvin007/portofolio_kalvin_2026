'use client';

/**
 * @file Preview.tsx
 * @description Aperçu en direct de la régie : un fragment de page qui rend le
 * brouillon en cours, à chaque modification, sans rien publier.
 *
 * @architecture
 * L'aperçu n'imite pas le site : il **utilise le même moteur**. Les variables
 * CSS sortent de `lib/visual/css.ts`, les lumières de `LightField`, les boutons
 * des recettes du site (`components/ui/styles.ts`). Seule la portée change —
 * les variables et les attributs `data-vx-*` sont posés sur la zone d'aperçu au
 * lieu de `<html>`, si bien que le brouillon ne déborde pas sur la régie
 * elle-même. Ce qui est vu ici est donc ce que le site affichera une fois la
 * configuration publiée.
 *
 * Le fragment montre les quatre situations qui comptent : un fond nu (où le
 * motif et les lumières se voient), des boutons, un lien, et une surface
 * opaque — qui recouvre le motif, comme le font les sections du site.
 */

import { useMemo, type CSSProperties } from 'react';
import LightField, { type LightFieldStats } from '@/components/visual/LightField';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, LINK_SECONDARY, OVERLINE } from '@/components/ui/styles';
import type { VisualConfig } from '@/lib/visual/config';
import { lightFieldSettings, visualAttributes, visualInlineStyle } from '@/lib/visual/css';
import { useThemeStore } from '@/lib/useTheme';

interface PreviewProps {
  config: VisualConfig;
  onStats?: (stats: LightFieldStats) => void;
}

export default function Preview({ config, onStats }: PreviewProps) {
  // Les tuiles et la couleur des lumières dépendent du thème affiché.
  const isDark = useThemeStore((state) => state.isDark);

  const style = useMemo(() => visualInlineStyle(config, isDark ? 'dark' : 'light') as CSSProperties, [config, isDark]);
  const attributes = useMemo(() => visualAttributes(config), [config]);
  const settings = useMemo(() => lightFieldSettings(config), [config]);

  return (
    <div className="rg-stage" style={style} {...attributes}>
      <LightField settings={settings} origin="host" onStats={onStats} />

      <p className={OVERLINE}>Aperçu en direct</p>
      <p className="rg-stage-title">Le fond, les lumières et les boutons, tels que le site les affichera.</p>
      <p className="rg-stage-text">
        {config.enabled
          ? 'Déplacez la souris sur cette zone, puis survolez les boutons.'
          : 'Les lumières sont éteintes : seul le motif du fond est visible.'}
      </p>

      <div className="rg-stage-actions">
        <button type="button" className={BUTTON_PRIMARY}>
          Bouton principal
        </button>
        <button type="button" className={BUTTON_SECONDARY}>
          Bouton secondaire
        </button>
        <a href="#apercu" onClick={(event) => event.preventDefault()} className={LINK_SECONDARY}>
          Lien du site
        </a>
      </div>

      <div className="rg-stage-card">
        <p className="rg-stage-card-title">Surface opaque</p>
        <p>Une section du site recouvre le motif de la même façon : les lumières passent derrière.</p>
      </div>

      {/* Zone laissée vide : c'est là que le motif se juge le mieux. */}
      <div className="rg-stage-void" aria-hidden="true" />
    </div>
  );
}
