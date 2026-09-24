/**
 * @file ProjectDetail.tsx
 * @description Fiche complète d'un projet, affichée dans la modale de la page
 * Projets.
 *
 * @architecture
 * Composant **serveur** : tout le contenu (descriptions, réalisations, stack,
 * schéma d'architecture) part dans le HTML de la page. Trois conséquences
 * voulues :
 *  - le texte est indexable par les moteurs de recherche, alors qu'un contenu
 *    monté au clic ne l'est pas ;
 *  - sans JavaScript, l'ancre de la carte suffit à révéler la fiche
 *    (voir `showcase.css`) ;
 *  - l'ouverture de la modale est instantanée : rien n'est chargé ni calculé à
 *    ce moment-là.
 *
 * Seules la galerie (visionneuse plein écran) et l'animation du schéma
 * s'exécutent dans le navigateur.
 *
 * La mise en page est volontairement différente des billets de l'accueil :
 * grande galerie, description en tête, puis deux colonnes — réalisations d'un
 * côté, technologies de l'autre. Le billet « reçu » reste l'écriture de
 * l'accueil, la fiche est celle du détail.
 */

import { useMessages, useTranslations } from 'next-intl';
import ArchitectureDiagram from '@/components/architecture/ArchitectureDiagram';
import Arrow from '@/components/ui/Arrow';
import TechIcon from '@/components/ui/TechIcon';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '@/components/ui/styles';
import { repositoryUrl, type Project } from '@/lib/data/projects';
import TicketGallery from './TicketGallery';
import './showcase.css';

interface ProjectDetailProps {
  project: Project;
}

/* Le numéro de la fiche n'est pas repris ici : il figure dans l'en-tête collant
   de la modale (`ProjectShowcase`), au-dessus du contenu. */
export default function ProjectDetail({ project }: ProjectDetailProps) {
  const t = useTranslations('project');
  const tData = useTranslations('projects_data');
  const messages = useMessages();

  const titleId = `${project.i18nKey}-detail-titre`;
  const highlightsId = `${project.i18nKey}-detail-realisations`;
  const stackId = `${project.i18nKey}-detail-stack`;

  const summary = tData(`${project.i18nKey}.short`);
  const full = tData(`${project.i18nKey}.full`);
  const repository = repositoryUrl(project);

  // Domaine et réalisations n'existent que pour les projets décrits en détail.
  const data = messages.projects_data[project.i18nKey];
  const domain = 'domain' in data ? data.domain : undefined;
  const highlights: string[] = 'points' in data ? data.points : [];

  // La description longue n'est répétée que si elle dit autre chose que la courte.
  const lead = full === summary ? summary : full;
  // Le numéro n'apparaît pas ici : il est déjà dans l'en-tête de la modale.
  const meta = [t(`categories.${project.category}`), domain, project.year].filter(Boolean).join(' · ');

  return (
    <article className="pj-detail" aria-labelledby={titleId}>
      <header className="pj-detail-head">
        <p className="pj-detail-meta">
          <span>{meta}</span>
          {project.liveUrl && <span className="pj-detail-stamp">{t('inProduction')}</span>}
        </p>
        <h2 id={titleId} className="pj-detail-title">{project.title}</h2>
        <p className="pj-detail-lead">{lead}</p>

        {(project.liveUrl || repository) && (
          <div className="pj-detail-actions">
            {project.liveUrl && (
              <a className={BUTTON_PRIMARY} href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                {t('liveSite')} <Arrow direction="up-right" />
                <span className="sr-only"> {t('newTab')}</span>
              </a>
            )}
            {repository && (
              <a className={BUTTON_SECONDARY} href={repository} target="_blank" rel="noopener noreferrer">
                {t('sourceCode')} <Arrow direction="up-right" />
                <span className="sr-only"> {t('newTab')}</span>
              </a>
            )}
          </div>
        )}
      </header>

      {/* Galerie : la couverture ouvre la visionneuse plein écran, les vignettes
          l'ouvrent directement sur leur capture. */}
      <TicketGallery title={project.title} cover={project.coverImage} images={project.images} variant="full" />

      <div className="pj-detail-cols">
        {highlights.length > 0 && (
          <section aria-labelledby={highlightsId}>
            <h3 id={highlightsId} className="pj-detail-label">{t('highlights')}</h3>
            <ul className="pj-detail-points">
              {highlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby={stackId}>
          <h3 id={stackId} className="pj-detail-label">{t('technologies')}</h3>
          <ul className="pj-detail-stack">
            {project.techStack.map((tech) => (
              <li key={tech}>
                <TechIcon name={tech} />
                {tech}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Schéma d'architecture : rendu par le serveur, animé à l'écran. */}
      <ArchitectureDiagram project={project} />
    </article>
  );
}
