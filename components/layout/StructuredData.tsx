/**
 * @file StructuredData.tsx
 * @description Données structurées JSON-LD du document (schema.org).
 *
 * @architecture
 * Composant **serveur**, rendu une fois par page depuis le layout. Il n'ajoute
 * aucun JavaScript exécutable : un `<script type="application/ld+json">` est un
 * bloc de données, que le navigateur ne lance pas — il n'est donc pas soumis à
 * la directive `script-src` de la politique de sécurité du contenu.
 *
 * Le graphe lui-même est construit par `structuredData()` (`lib/seo.ts`), à
 * partir des mêmes constantes que le reste du site. Ce fichier n'en connaît que
 * la sérialisation.
 *
 * @remarks **L'échappement de `<` n'est pas facultatif.**
 * L'analyseur HTML ferme un `<script>` au premier `</script>` rencontré dans le
 * texte, sans se soucier du JSON qui l'entoure. Une chaîne contenant cette
 * séquence couperait donc la balise et jetterait le reste du graphe dans la
 * page. `<` est la forme échappée de `<` en JSON : elle est relue à
 * l'identique par un analyseur JSON, et n'est plus reconnue par l'analyseur
 * HTML. Les données viennent aujourd'hui du dépôt et non du visiteur, mais une
 * traduction ou une description de projet peut changer demain : la protection
 * ne coûte rien et retire la question.
 */

import { structuredData } from '@/lib/seo';

type StructuredDataProps = Parameters<typeof structuredData>[0];

export default function StructuredData(props: StructuredDataProps) {
  const json = JSON.stringify(structuredData(props)).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
