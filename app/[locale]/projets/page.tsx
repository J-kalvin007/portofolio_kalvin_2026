/**
 * @file projets/page.tsx
 * @description Page Projets.
 *
 * @architecture
 * Composant **serveur**. Il prépare, pour chaque projet, les données de sa
 * carte et sa fiche complète (`ProjectDetail`), puis confie l'affichage à
 * `ProjectShowcase` : filtre, sommaire, grille de cartes et modale de détail.
 *
 * Les fiches partent donc dans le HTML de la page : leur texte est indexable,
 * et l'ouverture d'une fiche ne déclenche aucun chargement. Seuls le filtre,
 * les galeries et l'animation des schémas s'exécutent dans le navigateur.
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { resolveLocale, type LocaleParams } from '@/i18n/params';
import { PROJECTS, PROJECT_CATEGORIES, projectAnchor, repositoryUrl } from '@/lib/data/projects';
import { padNumber } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import ProjectDetail from '@/components/project/ProjectDetail';
import PageHeader from '@/components/ui/PageHeader';
import TechIconSprite from '@/components/ui/TechIconSprite';
import { CONTAINER } from '@/components/ui/styles';
import ProjectShowcase, { type ShowcaseEntry } from './components/ProjectShowcase';

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
  const tData = await getTranslations({ locale, namespace: 'projects_data' });

  const entries: ShowcaseEntry[] = PROJECTS.map((project, position) => {
    const number = padNumber(position + 1);

    return {
      anchor: projectAnchor(project),
      number,
      title: project.title,
      category: tProject(`categories.${project.category}`),
      categoryKey: project.category,
      year: project.year,
      cover: project.coverImage,
      summary: tData(`${project.i18nKey}.short`),
      /* La description longue et les captures partent aussi en données : la
         scène de la modale les met en mouvement côté navigateur, sans rien
         avoir à recharger à l'ouverture. */
      description: tData(`${project.i18nKey}.full`),
      images: [...new Set([project.coverImage, ...project.images])],
      techStack: project.techStack,
      isLive: Boolean(project.liveUrl),
      liveUrl: project.liveUrl,
      repository: repositoryUrl(project),
      detail: <ProjectDetail project={project} />,
    };
  });

  const categories = PROJECT_CATEGORIES.map((key) => ({ key, label: tProject(`categories.${key}`) }));

  return (
    <>
      <PageHeader overline={t('overline')} title={t('title')} lead={t('lead', { count: PROJECTS.length })} />
      <div className={`${CONTAINER} pb-section pt-block`}>
        {/* Réserve des logos : les cartes et les neuf fiches y puisent. */}
        <TechIconSprite />
        <ProjectShowcase entries={entries} categories={categories} />
      </div>
    </>
  );
}
