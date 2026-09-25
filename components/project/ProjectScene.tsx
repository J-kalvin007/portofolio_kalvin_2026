'use client';

/**
 * @file ProjectScene.tsx
 * @description Premier écran de la fiche d'un projet : trois colonnes, dans
 * l'esprit de la modale d'avant la refonte.
 *
 *   ┌───────────────┬──────────────────────────┬───────────────┐
 *   │  DESCRIPTION  │        CAPTURES          │ TECHNOLOGIES  │
 *   │   pluie ↓     │   carrousel + vignettes  │   pluie ↑     │
 *   └───────────────┴──────────────────────────┴───────────────┘
 *
 * @architecture
 * Composant **client**, monté uniquement pour le projet ouvert : les neuf
 * scènes n'existent jamais en même temps, et aucune capture d'un projet fermé
 * n'est téléchargée. Le contenu, lui, vient de la fiche serveur — la scène ne
 * fait que le mettre en mouvement.
 *
 * Les deux colonnes défilent en **sens contraires**, ce qui donne sa
 * respiration à l'écran, et s'arrêtent net au survol : c'est ce qui les rend
 * lisibles, là où l'ancienne version ne s'arrêtait jamais.
 *
 * @remarks La scène est une mise en scène, pas la source. Tout ce qu'elle
 * montre — description complète, liste des technologies, captures — figure en
 * clair dans le dossier, juste en dessous, et dans le HTML de la page pour les
 * moteurs de recherche et les visiteurs sans JavaScript. Les deux pluies sont
 * donc masquées aux lecteurs d'écran.
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import TechIcon from '@/components/ui/TechIcon';
import { TECH_ICONS } from '@/components/ui/tech-icons';
import ProjectCarousel from './ProjectCarousel';
import RainColumn from './RainColumn';
import './scene.css';

/**
 * Longueur d'un bloc de la colonne de description, en mots.
 *
 * Un bloc doit se lire d'un coup d'œil pendant qu'il passe : une douzaine de
 * mots, soit deux à trois lignes dans cette largeur.
 */
const WORDS_PER_CHUNK = 12;

/** Vitesse des deux colonnes : temps accordé à un élément, en secondes. */
const SECONDS_PER_CHUNK = 5.2;
const SECONDS_PER_TECH = 3.6;

/**
 * Taille du texte de la colonne de gauche, selon la longueur de la
 * description.
 *
 * Les descriptions vont de vingt à deux cents mots. À taille fixe, les plus
 * courtes laissaient la colonne à moitié vide et se répétaient trois fois dans
 * la hauteur ; les plus longues s'y entassaient. Le texte grandit donc quand il
 * y en a peu.
 */
function textSize(chunkCount: number): string {
  if (chunkCount <= 3) return '1.25rem';
  if (chunkCount <= 6) return '1.0625rem';
  return '0.9375rem';
}

interface ProjectSceneProps {
  title: string;
  /** Description longue du projet, telle qu'elle défile à gauche. */
  description: string;
  /** Captures, couverture comprise et sans doublon. */
  images: string[];
  techStack: string[];
}

/** Découpe un texte en blocs de lecture d'une longueur régulière. */
function splitIntoChunks(text: string, wordsPerChunk: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let start = 0; start < words.length; start += wordsPerChunk) {
    chunks.push(words.slice(start, start + wordsPerChunk).join(' '));
  }

  return chunks;
}

export default function ProjectScene({ title, description, images, techStack }: ProjectSceneProps) {
  const t = useTranslations('projects_page');
  const tProject = useTranslations('project');

  const chunks = useMemo(() => splitIntoChunks(description, WORDS_PER_CHUNK), [description]);

  /* Les clés ne servent pas au rendu — chaque élément est inséré seul dans une
     ligne déjà identifiée par la piste — mais React et ESLint attendent qu'un
     tableau de nœuds en porte une. */
  const textItems = useMemo(
    () => [
      ...chunks.map((chunk, index) => <p key={index} className="pj-rain-text">{chunk}</p>),
      /* Marque de fin de description. La colonne boucle nécessairement, et une
         description courte se répète donc deux fois dans la hauteur : sans
         repère, la répétition se lit comme un bogue. Le bord perforé du billet
         — le motif de la direction « Reçu » — ferme chaque passage. */
      <span key="fin" className="pj-rain-mark" />,
    ],
    [chunks],
  );

  const techItems = useMemo(
    () =>
      techStack.map((tech) => (
        <span key={tech} className="pj-tech">
          {tech in TECH_ICONS ? (
            <TechIcon name={tech} className="pj-tech-icon" />
          ) : (
            /* Filet de sécurité : les 29 technologies citées par les projets ont
               aujourd'hui leur tracé. Une nouvelle venue sans logo publié
               recevrait cette pastille à son initiale — aucune marque n'est
               inventée pour combler un vide. */
            <span className="pj-tech-letter" aria-hidden="true">{tech.charAt(0)}</span>
          )}
          <span className="pj-tech-name">{tech}</span>
        </span>
      )),
    [techStack],
  );

  return (
    <div className="pj-scene">
      {/* ── Gauche : la description, qui descend ───────────────────────────── */}
      <div
        className="pj-scene-side pj-scene-side--text"
        style={{ '--pj-rain-size': textSize(chunks.length) } as React.CSSProperties}
      >
        <p className="pj-scene-label">
          {t('descriptionColumn')}
          <span className="pj-scene-hint">{t('pauseHint')}</span>
        </p>
        <RainColumn items={textItems} direction="down" secondsPerItem={SECONDS_PER_CHUNK} />
      </div>

      {/* ── Centre : les captures ──────────────────────────────────────────── */}
      <div className="pj-scene-center">
        <ProjectCarousel title={title} images={images} />
      </div>

      {/* ── Droite : les technologies, qui montent ─────────────────────────── */}
      <div className="pj-scene-side pj-scene-side--tech">
        <p className="pj-scene-label">
          {tProject('technologies')}
          <span className="pj-scene-hint">{t('pauseHint')}</span>
        </p>
        <RainColumn items={techItems} direction="up" secondsPerItem={SECONDS_PER_TECH} />
      </div>
    </div>
  );
}
