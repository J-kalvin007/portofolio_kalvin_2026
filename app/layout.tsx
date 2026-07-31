// /* Root layout — minimal wrapper, just provides html/body tags.
//    The real layout with providers lives in app/[locale]/layout.tsx */
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return children;
// }






import type { ReactNode } from 'react';

/**
 * @file layout.tsx (racine)
 * @description Enveloppe racine minimale. Elle ne rend volontairement ni `<html>`
 * ni `<body>` : ces balises sont produites par `app/[locale]/layout.tsx`, qui
 * seul connaît la langue de la requête et peut donc poser `lang` correctement.
 *
 * @architecture
 * C'est le motif documenté par `next-intl` pour une application entièrement
 * localisée. Deux fichiers échappent à cette enveloppe et fournissent donc leur
 * propre document complet — `app/not-found.tsx` et `app/global-error.tsx` —
 * parce qu'ils peuvent se déclencher avant même que le segment `[locale]` ne
 * soit résolu.
 *
 * @remarks Ne pas y ajouter de balisage. Toute structure introduite ici serait
 * dupliquée hors du contexte de langue, et `lang` retomberait sur une valeur
 * codée en dur — le genre de régression que les audits d'accessibilité relèvent
 * en premier.
 */
export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}