/**
 * @file HomeSections.tsx
 * @description Sections de la page d'accueil (direction « Reçu »).
 *
 * @architecture
 * Composants **serveur** : le HTML complet est produit au build. Les seuls
 * îlots client sont l'heure locale du reçu, les galeries et l'animation des
 * schémas. Toutes les couleurs, tailles et espacements viennent des rôles du
 * système de design (`app/design-system.css`) ; la police est Poppins.
 *
 * Ordre de lecture, pensé pour trois lecteurs :
 *  1. Hero + reçu          — recruteur : l'essentiel en 10 secondes
 *  2. Projets + schémas    — client (1 min) puis développeur (5 min)
 *  3. Relevé de compétences — mots-clés, adossés aux projets réels
 *  4. Parcours             — expérience et formation
 *  5. Contact              — trois manières d'agir (components/sections/ContactCta)
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FEATURED_PROJECTS, PROJECTS, TECH_USAGE } from '@/lib/data/projects';
import { SKILLS } from '@/lib/data/skills';
import { CV_PATH } from '@/lib/site';
import { padNumber } from '@/lib/format';
import ProjectTicket from '@/components/project/ProjectTicket';
import Arrow from '@/components/ui/Arrow';
import SectionHead from '@/components/ui/SectionHead';
import TechIcon from '@/components/ui/TechIcon';
import TechIconSprite from '@/components/ui/TechIconSprite';
import { BUTTON_PRIMARY, COLUMN_HEADING, CONTAINER, LINK_SECONDARY, OVERLINE } from '@/components/ui/styles';
import ProfileReceipt from './ProfileReceipt';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ 1. HERO — le titre et le reçu du profil
   ═══════════════════════════════════════════════════════════════════════════ */

export function HeroSection() {
  const t = useTranslations('home');

  // Le haut du hero réserve la hauteur de la barre de navigation fixe (4 rem).
  return (
    <section aria-labelledby="home-title" className="border-b border-line">
      <div className={`${CONTAINER} grid items-center gap-12 pb-16 pt-28 sm:pt-32 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] lg:gap-16`}>
        <div className="grid gap-6">
          <p className={OVERLINE}>{t('overline')}</p>
          <h1 id="home-title" className="text-title font-bold text-balance text-ink">{t('title')}</h1>
          <p className="max-w-[46ch] text-lead text-pretty text-ink-soft">{t('lead')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a href="#projets" className={BUTTON_PRIMARY}>
              {t('ctaProjects')} <Arrow direction="down" />
            </a>
            <a href={CV_PATH} download className={LINK_SECONDARY}>{t('ctaCv')}</a>
          </div>
        </div>
        <ProfileReceipt />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ 2. PROJETS — billets et schémas d'architecture
   ═══════════════════════════════════════════════════════════════════════════ */

export function ProjectsSection() {
  const t = useTranslations('home.projects');
  const tProject = useTranslations('project');
  const others = PROJECTS.filter((project) => !project.featured);

  return (
    <section id="projets" aria-labelledby="projects-title" className="py-section">
      <div className={CONTAINER}>
        <SectionHead id="projects-title" overline={t('overline')} title={t('title')} description={t('description')} />

        {/* Projets phares : billet + schéma, toujours visibles */}
        <ol className="grid gap-block" aria-label={t('overline')}>
          {FEATURED_PROJECTS.map((project) => (
            <li key={project.slug}>
              <ProjectTicket project={project} />
            </li>
          ))}
        </ol>

        {/* Autres projets : lignes de reçu dépliables, billet + schéma à l'intérieur */}
        <div className="mt-block">
          <h3 className="text-subheading font-bold text-ink">{t('others')}</h3>
          <p className="mt-1 text-caption text-ink-muted">{t('othersHint')}</p>
          <ul className="hm-others mt-5">
            {others.map((project) => (
              <li key={project.slug}>
                <details className="hm-other">
                  <summary>
                    <span className="hm-other-number">{padNumber(PROJECTS.indexOf(project) + 1)}</span>
                    <span className="hm-other-title">{project.title}</span>
                    <span className="hm-other-leader" aria-hidden="true" />
                    <span className="hm-other-meta">{tProject(`categories.${project.category}`)} · {project.year}</span>
                    <span className="hm-other-toggle" aria-hidden="true" />
                  </summary>
                  <div className="hm-other-body">
                    <ProjectTicket project={project} headingLevel="h4" />
                  </div>
                </details>
              </li>
            ))}
          </ul>
          <Link href="/projets" className={`${LINK_SECONDARY} mt-8`}>
            {t('viewAll')} <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ 3. RELEVÉ DE COMPÉTENCES — adossé aux projets réels
   ═══════════════════════════════════════════════════════════════════════════ */

export function StackSection() {
  const t = useTranslations('home.stack');

  return (
    <section id="competences" aria-labelledby="stack-title" className="border-y border-line bg-surface py-section">
      <div className={CONTAINER}>
        <SectionHead id="stack-title" overline={t('overline')} title={t('title')} description={t('description')} />
        {/* Réserve des logos : chaque tracé une seule fois pour toute la page. */}
        <TechIconSprite names={SKILLS.flatMap((group) => group.skills.map((skill) => skill.name))} />
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {SKILLS.map((group) => (
            <div key={group.key}>
              <h3 className={COLUMN_HEADING}>{t(`categories.${group.key}`)}</h3>
              <ul className="mt-3 grid gap-2">
                {group.skills.map((skill) => {
                  const count = TECH_USAGE.get(skill.name) ?? 0;
                  return (
                    <li key={skill.name} className="hm-skill">
                      <span className="hm-skill-name">
                        <TechIcon name={skill.name} className="hm-skill-icon" />
                        {skill.name}
                      </span>
                      <span className="hm-skill-leader" aria-hidden="true" />
                      <span className={`whitespace-nowrap tabular-nums ${count > 0 ? 'text-ink-soft' : 'text-ink-muted'} text-caption`}>
                        {t('usage', { count })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ 4. PARCOURS
   ═══════════════════════════════════════════════════════════════════════════ */

export function CareerSection() {
  const t = useTranslations('home.career');
  const tExp = useTranslations('experience');

  const entry = (key: 'job1' | 'job2' | 'edu1' | 'edu2') => ({
    key,
    period: tExp(`${key}_period`),
    title: tExp(`${key}_title`),
    place: `${tExp(`${key}_subtitle`)} · ${tExp(`${key}_location`)}`,
  });

  const columns = [
    { heading: t('experience'), items: [entry('job1'), entry('job2')] },
    { heading: t('education'), items: [entry('edu1'), entry('edu2')] },
  ];

  return (
    <section id="parcours" aria-labelledby="career-title" className="py-section">
      <div className={CONTAINER}>
        <SectionHead id="career-title" overline={t('overline')} title={t('title')} />
        <div className="grid gap-12 md:grid-cols-2">
          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className={COLUMN_HEADING}>{column.heading}</h3>
              <ol className="divide-y divide-line">
                {column.items.map((item) => (
                  <li key={item.key} className="grid gap-1 py-5 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-6">
                    <p className="text-caption font-semibold tabular-nums text-ink-muted">{item.period}</p>
                    <div>
                      <p className="text-body font-semibold text-ink">{item.title}</p>
                      <p className="text-caption text-ink-soft">{item.place}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <Link href="/propos" className={`${LINK_SECONDARY} mt-10`}>
          {t('cta')} <Arrow />
        </Link>
      </div>
    </section>
  );
}
