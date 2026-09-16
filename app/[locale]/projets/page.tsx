/**
 * @file projets/page.tsx
 * @description Page Projets — direction « Reçu ».
 *
 * @architecture
 * Composant **serveur**. Chaque projet est une fiche complète : toutes ses
 * captures, sa description, sa stack et son schéma d'architecture animé.
 * Seuls le filtre et le sommaire (`ProjectCatalog`), les galeries et
 * l'animation des schémas s'exécutent dans le navigateur.
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { resolveLocale, type LocaleParams } from '@/i18n/params';
import { PROJECTS, PROJECT_CATEGORIES, projectAnchor } from '@/lib/data/projects';
import { padNumber } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import ProjectTicket from '@/components/project/ProjectTicket';
import PageHeader from '@/components/ui/PageHeader';
import { CONTAINER } from '@/components/ui/styles';
import ProjectCatalog, { type CatalogEntry } from './components/ProjectCatalog';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'seo' });

  return pageMetadata({
    locale,
    path: '/projets',
    title: t('projects.title'),
    description: t('projects.description'),
    imageAlt: t('site.imageAlt'),
  });
}

export default async function ProjectsPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'projects_page' });
  const tProject = await getTranslations({ locale, namespace: 'project' });

  const entries: CatalogEntry[] = PROJECTS.map((project, position) => ({
    anchor: projectAnchor(project),
    category: project.category,
    number: padNumber(position + 1),
    title: project.title,
    content: <ProjectTicket project={project} variant="full" headingLevel="h2" />,
  }));

  const categories = PROJECT_CATEGORIES.map((key) => ({ key, label: tProject(`categories.${key}`) }));

  return (
    <>
      <PageHeader overline={t('overline')} title={t('title')} lead={t('lead', { count: PROJECTS.length })} />
      <div className={`${CONTAINER} pb-section pt-block`}>
        <ProjectCatalog entries={entries} categories={categories} />
      </div>
    </>
  );
}
