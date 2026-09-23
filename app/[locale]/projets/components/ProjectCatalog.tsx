'use client';

/**
 * @file ProjectCatalog.tsx
 * @description Catalogue de la page Projets : filtre par catégorie, compteur
 * annoncé, sommaire qui suit la lecture, et la liste des fiches.
 *
 * @architecture
 * Les fiches (billet complet + schéma d'architecture) sont rendues par le
 * serveur et reçues ici comme contenu (`content`). Ce composant ne fait que
 * les montrer ou les masquer : le HTML initial contient les huit projets,
 * lisibles sans JavaScript et indexables.
 *
 * Remplace l'ancienne page client : filtres « magnétiques », pastille
 * animée par framer-motion, grille de cartes qui se « désintégraient » toutes
 * les dix secondes, modale plein écran à champ d'étoiles. Tout le contenu de
 * la modale (captures, description, stack) est désormais visible directement.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { ProjectCategory } from '@/lib/data/projects';
import Arrow from '@/components/ui/Arrow';
import { COLUMN_HEADING, FOCUS_RING, OVERLINE } from '@/components/ui/styles';

export interface CatalogEntry {
  /** Ancre de la fiche (`projet-…`), portée par le billet complet. */
  anchor: string;
  category: ProjectCategory;
  /** Numéro affiché dans le sommaire (« 01 »). */
  number: string;
  title: string;
  /** Fiche rendue par le serveur. */
  content: ReactNode;
}

interface ProjectCatalogProps {
  entries: CatalogEntry[];
  categories: { key: ProjectCategory; label: string }[];
}

type Filter = ProjectCategory | 'all';

/**
 * Ligne de lecture du sommaire : une fiche devient « en cours » quand elle
 * traverse la bande située entre 35 % et 40 % de la hauteur de la fenêtre.
 */
const READING_LINE = '-35% 0px -60% 0px';

const FILTER_BUTTON =
  'inline-flex items-center justify-between gap-3 rounded-control border px-3 py-1.5 text-[0.875rem] font-medium cursor-pointer ' +
  'transition-colors duration-(--motion-fast) lg:w-full ' +
  'aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-canvas ' +
  'aria-[pressed=false]:border-line aria-[pressed=false]:text-ink-soft aria-[pressed=false]:hover:border-line-strong aria-[pressed=false]:hover:text-ink ' +
  FOCUS_RING;

export default function ProjectCatalog({ entries, categories }: ProjectCatalogProps) {
  const t = useTranslations('projects_page');
  const [filter, setFilter] = useState<Filter>('all');
  const [current, setCurrent] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const isShown = (entry: CatalogEntry) => filter === 'all' || entry.category === filter;
  const shown = entries.filter(isShown);
  const countOf = (key: Filter) => (key === 'all' ? entries.length : entries.filter((entry) => entry.category === key).length);

  const applyFilter = (next: Filter) => {
    setFilter(next);
    // Si le haut de la liste est déjà passé, on y revient : sinon le visiteur
    // reste au milieu d'une liste qui vient de changer sous ses yeux.
    const list = listRef.current;
    if (list && list.getBoundingClientRect().top < 0) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      list.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  /* ── Sommaire : la fiche en cours de lecture est signalée ─────────────── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) if (record.isIntersecting) setCurrent(record.target.id);
      },
      { rootMargin: READING_LINE },
    );
    for (const entry of entries) {
      const element = document.getElementById(entry.anchor);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [entries]);

  const filters: { key: Filter; label: string }[] = [{ key: 'all', label: t('filterAll') }, ...categories];

  const index = (
    <ol className="mt-2">
      {shown.map((entry) => (
        <li key={entry.anchor}>
          <a
            href={`#${entry.anchor}`}
            aria-current={current === entry.anchor ? 'true' : undefined}
            className={`group flex items-baseline gap-3 rounded-control py-1.5 text-[0.9375rem] text-ink-soft transition-colors duration-(--motion-fast)
                        hover:text-ink aria-[current=true]:font-semibold aria-[current=true]:text-ink ${FOCUS_RING}`}
          >
            <span className="text-caption tabular-nums text-ink-muted group-aria-[current=true]:text-brand-text">{entry.number}</span>
            <span>{entry.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
        <div role="group" aria-labelledby="catalog-filters">
          <p id="catalog-filters" className={OVERLINE}>{t('filtersLabel')}</p>
          <div className="mt-3 flex flex-wrap gap-2 lg:grid lg:gap-1.5">
            {filters.map(({ key, label }) => (
              <button key={key} type="button" aria-pressed={filter === key} onClick={() => applyFilter(key)} className={FILTER_BUTTON}>
                <span>{label}</span>
                <span className="text-caption tabular-nums">{countOf(key)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Le compteur est annoncé à chaque changement de filtre */}
        <p aria-live="polite" className="mt-4 text-caption font-semibold text-ink-muted">
          {t('shown', { count: shown.length })}
        </p>

        {/* Sommaire : colonne fixe sur grand écran, repliable sur mobile */}
        <nav aria-label={t('indexLabel')} className="mt-8 hidden lg:block">
          <p className={COLUMN_HEADING}>{t('index')}</p>
          {index}
        </nav>
        <details className="group/index mt-6 rounded-control border border-line px-4 py-2 lg:hidden">
          <summary
            className={`flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-[0.9375rem] font-semibold text-ink
                        [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
          >
            {t('index')} ({shown.length})
            <Arrow direction="down" className="text-ink-muted transition-transform duration-(--motion-fast) group-open/index:rotate-180" />
          </summary>
          <nav aria-label={t('indexLabel')}>{index}</nav>
        </details>
      </aside>

      <ol ref={listRef} className="grid gap-block" aria-label={t('overline')}>
        {entries.map((entry) => (
          <li key={entry.anchor} hidden={!isShown(entry)}>
            {entry.content}
          </li>
        ))}
      </ol>
    </div>
  );
}
