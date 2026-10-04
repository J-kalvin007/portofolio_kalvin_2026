/**
 * @file VisualStyle.tsx
 * @description Injecte dans le `<head>` les variables CSS de la configuration
 * visuelle publiée (tuiles du fond, couleur des lumières, réglages des halos).
 *
 * @architecture
 * Composant **serveur** : la feuille fait partie du HTML envoyé au visiteur.
 * Le fond et les lumières sont donc corrects dès le premier affichage — aucun
 * script n'a besoin de s'exécuter pour les appliquer, et rien ne « saute » à
 * l'hydratation.
 *
 * Avec la configuration par défaut, `visualStyleSheet` rend une chaîne vide et
 * ce composant ne rend rien : le document est identique à ce qu'il était avant
 * l'existence du moteur visuel.
 *
 * @remarks **`dangerouslySetInnerHTML` est sûr ici.** La feuille est construite
 * par le serveur à partir d'une configuration passée par `sanitizeVisualConfig`
 * : les nombres sont bornés, les couleurs vérifiées par motif (`#rrggbb`), les
 * choix pris dans une liste fermée, et les tuiles SVG ont leurs chevrons
 * encodés. Aucune chaîne libre saisie dans la régie n'y figure.
 */

import type { VisualConfig } from '@/lib/visual/config';
import { visualStyleSheet } from '@/lib/visual/css';

export default function VisualStyle({ config }: { config: VisualConfig }) {
  const css = visualStyleSheet(config);
  if (css === '') return null;

  return <style id="vx-style" dangerouslySetInnerHTML={{ __html: css }} />;
}
