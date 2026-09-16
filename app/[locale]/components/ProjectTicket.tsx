/**
 * @file ProjectTicket.tsx
 * @description Un projet présenté comme un billet : capture, description,
 * stack, souche numérotée — suivi de son schéma d'architecture animé.
 *
 * @architecture
 * Composant serveur. Îlots client : la galerie (`TicketGallery`) et
 * l'animation du schéma (`ArchitectureFigure`, dans `ArchitectureDiagram`).
 *
 * Répond aux deux lectures longues :
 *  - « 1 minute » (client) : ce qui a été livré, pour quel usage, avec quoi ;
 *  - « 5 minutes » (développeur) : le schéma, juste en dessous.
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PROJECTS, type Project } from '@/lib/data/projects';
import ArchitectureDiagram from '@/components/architecture/ArchitectureDiagram';
import Arrow from '@/components/ui/Arrow';
import TicketGallery from './TicketGallery';

const pad = (value: number) => String(value).padStart(2, '0');

export default function ProjectTicket({ project, headingLevel = 'h3' }: { project: Project; headingLevel?: 'h3' | 'h4' }) {
  const t = useTranslations('home.projects');
  const tData = useTranslations('projects_data');
  const tCategories = useTranslations('projects_page.categories');

  const Heading = headingLevel;
  const number = PROJECTS.indexOf(project) + 1;
  const headingId = `ticket-${project.i18nKey}`;

  return (
    <div className="tk-entry">
      <article className="tk" aria-labelledby={headingId}>
        <div className="tk-main">
          <TicketGallery title={project.title} cover={project.coverImage} images={project.images} />

          <div className="tk-body">
            <p className="tk-meta">{tCategories(project.category)} · {project.year}</p>
            <Heading id={headingId} className="tk-title">{project.title}</Heading>
            <p className="tk-desc">{tData(`${project.i18nKey}.short`)}</p>
            <dl className="rc-lines tk-lines">
              <div className="rc-line">
                <dt>{t('stack')}</dt>
                <dd>{project.techStack.join(' · ')}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Souche : numéro du billet et action */}
        <div className="tk-stub">
          <p className="tk-number">
            {t('ticket')}
            <strong>
              {pad(number)}
              <span>/{pad(PROJECTS.length)}</span>
            </strong>
          </p>
          {project.liveUrl ? (
            <a className="tk-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              {t('liveSite')} <Arrow direction="up-right" />
            </a>
          ) : (
            <Link className="tk-link" href="/projets">
              {t('details')} <Arrow />
            </Link>
          )}
        </div>
      </article>

      <ArchitectureDiagram project={project} />
    </div>
  );
}
