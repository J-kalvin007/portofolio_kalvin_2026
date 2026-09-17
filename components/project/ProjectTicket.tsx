/**
 * @file ProjectTicket.tsx
 * @description Un projet présenté comme un billet : captures, description,
 * stack, souche numérotée — suivi de son schéma d'architecture animé.
 *
 * @architecture
 * Composant serveur. Îlots client : la galerie (`TicketGallery`) et
 * l'animation du schéma (`ArchitectureFigure`, dans `ArchitectureDiagram`).
 *
 * Deux variantes, pour deux lectures :
 *  - `summary` (accueil) : ce qui a été livré, en une capture et une phrase,
 *    avec un lien vers la fiche complète ;
 *  - `full` (page Projets) : toutes les captures, la description détaillée,
 *    la stack en étiquettes. L'élément porte l'ancre du projet
 *    (`/projets#projet-…`), cible des liens de l'accueil et du sommaire.
 *
 * Le schéma d'architecture suit le billet dans les deux cas.
 */

import { useMessages, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PROJECTS, projectAnchor, repositoryUrl, type Project } from '@/lib/data/projects';
import { padNumber } from '@/lib/format';
import ArchitectureDiagram from '@/components/architecture/ArchitectureDiagram';
import Arrow from '@/components/ui/Arrow';
import TicketGallery from './TicketGallery';
import '@/components/ui/receipt.css';
import './project.css';

interface ProjectTicketProps {
  project: Project;
  variant?: 'summary' | 'full';
  /** Niveau du titre, selon la place du billet dans la page. */
  headingLevel?: 'h2' | 'h3' | 'h4';
}

export default function ProjectTicket({ project, variant = 'summary', headingLevel = 'h3' }: ProjectTicketProps) {
  const t = useTranslations('project');
  const tData = useTranslations('projects_data');
  const messages = useMessages();

  const Heading = headingLevel;
  const isFull = variant === 'full';
  const anchor = projectAnchor(project);
  const headingId = `${anchor}-${variant}-titre`;
  const stackId = `${anchor}-stack`;
  const highlightsId = `${anchor}-realisations`;
  const number = PROJECTS.indexOf(project) + 1;

  const summary = tData(`${project.i18nKey}.short`);
  const detail = tData(`${project.i18nKey}.full`);
  // La description détaillée n'est affichée que si elle apporte quelque chose.
  const showDetail = isFull && detail !== summary;
  const repository = repositoryUrl(project);

  // Domaine et réalisations : renseignés pour les projets décrits en détail.
  const data = messages.projects_data[project.i18nKey];
  const domain = 'domain' in data ? data.domain : undefined;
  const highlights: string[] = 'points' in data ? data.points : [];

  const meta = [t(`categories.${project.category}`), domain, project.year].filter(Boolean).join(' · ');

  return (
    <div className="tk-entry" id={isFull ? anchor : undefined}>
      <article className={isFull ? 'tk tk--full' : 'tk'} aria-labelledby={headingId}>
        <div className="tk-main">
          <TicketGallery title={project.title} cover={project.coverImage} images={project.images} variant={isFull ? 'full' : 'cover'} />

          <div className="tk-body">
            <p className="tk-meta">{meta}</p>
            <Heading id={headingId} className="tk-title">{project.title}</Heading>
            <p className="tk-desc">{summary}</p>
            {showDetail && <p className="tk-detail">{detail}</p>}

            {isFull && highlights.length > 0 && (
              <>
                <p id={highlightsId} className="tk-label">{t('highlights')}</p>
                <ul className="tk-points" aria-labelledby={highlightsId}>
                  {highlights.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </>
            )}

            {isFull ? (
              <>
                <p id={stackId} className="tk-label">{t('technologies')}</p>
                <ul className="tk-tags" aria-labelledby={stackId}>
                  {project.techStack.map((tech) => <li key={tech}>{tech}</li>)}
                </ul>
              </>
            ) : (
              <dl className="rc-lines rc-lines--wrap tk-lines">
                <div className="rc-line">
                  <dt>{t('stack')}</dt>
                  <dd>{project.techStack.join(' · ')}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        {/* Souche : numéro du billet et actions */}
        <div className="tk-stub">
          <div className="grid justify-items-start gap-3">
            <p className="tk-number">
              {t('ticket')}
              <strong>
                {padNumber(number)}
                <span>/{padNumber(PROJECTS.length)}</span>
              </strong>
            </p>
            {/* Tampon : le produit tourne réellement, à l'adresse indiquée dessous. */}
            {project.liveUrl && <p className="tk-status">{t('inProduction')}</p>}
          </div>
          <div className="tk-links">
            {project.liveUrl && (
              <a className="tk-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                {t('liveSite')} <Arrow direction="up-right" />
                <span className="sr-only"> {t('newTab')}</span>
              </a>
            )}
            {repository && (
              <a className="tk-link" href={repository} target="_blank" rel="noopener noreferrer">
                {t('sourceCode')} <Arrow direction="up-right" />
                <span className="sr-only"> {t('newTab')}</span>
              </a>
            )}
            {!isFull && (
              <Link className="tk-link" href={`/projets#${anchor}`}>
                {t('details')} <Arrow />
                <span className="sr-only"> — {project.title}</span>
              </Link>
            )}
          </div>
        </div>
      </article>

      <ArchitectureDiagram project={project} />
    </div>
  );
}
