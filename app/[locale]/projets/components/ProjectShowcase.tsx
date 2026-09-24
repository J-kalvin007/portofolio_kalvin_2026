'use client';

/**
 * @file ProjectShowcase.tsx
 * @description Page Projets : filtre par catégorie, sommaire à aperçus, grille
 * de cartes qui se désintègrent, et modale de détail.
 *
 * @architecture
 * Les fiches complètes (`ProjectDetail`) sont rendues par le **serveur** et
 * reçues ici en contenu (`detail`). Ce composant ne fait que montrer, masquer
 * et animer : le HTML initial contient donc les neuf projets — indexables, et
 * lisibles sans JavaScript par leur ancre (voir `showcase.css`).
 *
 * @remarks **L'adresse est la source de vérité de la modale.**
 * Ouvrir un projet empile une entrée d'historique et écrit `#projet-…` dans
 * l'URL. Trois bénéfices, absents de l'ancienne version :
 *  - un lien vers un projet précis se partage ;
 *  - le bouton « retour » du navigateur referme la fiche, comme l'attend un
 *    visiteur sur téléphone ;
 *  - l'état ne peut pas se désynchroniser de l'URL, puisqu'il en est déduit.
 *
 * L'état est lu par `useSyncExternalStore` : pendant l'hydratation, React rend
 * la valeur du serveur (aucune fiche ouverte), puis applique celle du
 * navigateur — sans écart d'hydratation et sans `setState` dans un effet.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import type { ProjectCategory } from '@/lib/data/projects';
import Arrow from '@/components/ui/Arrow';
import ProjectCard, { SHATTER_DURATION_MS, type ProjectCardData, type ShatterPhase } from '@/components/project/ProjectCard';
import { COLUMN_HEADING, FOCUS_RING, OVERLINE } from '@/components/ui/styles';
import { useIsClient } from '@/hooks/useClientSnapshot';
import '@/components/project/showcase.css';

export interface ShowcaseEntry extends ProjectCardData {
  category: string;
  /** Clé de catégorie, pour le filtre (la carte affiche le libellé traduit). */
  categoryKey: ProjectCategory;
  /** Fiche complète, rendue par le serveur. */
  detail: ReactNode;
}

interface ProjectShowcaseProps {
  entries: ShowcaseEntry[];
  categories: { key: ProjectCategory; label: string }[];
}

type Filter = ProjectCategory | 'all';

/**
 * Ligne de lecture du sommaire : une carte devient « en cours » quand elle
 * traverse la bande située entre 30 % et 45 % de la hauteur de la fenêtre.
 */
const READING_LINE = '-30% 0px -55% 0px';

/** Événement interne : `pushState` ne déclenche ni `popstate` ni `hashchange`. */
const OPEN_CHANGED = 'pj:open-changed';

const FILTER_BUTTON =
  'inline-flex items-center justify-between gap-3 rounded-control border px-3 py-1.5 text-[0.875rem] font-medium cursor-pointer ' +
  'transition-colors duration-(--motion-fast) lg:w-full ' +
  'aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-canvas ' +
  'aria-[pressed=false]:border-line aria-[pressed=false]:text-ink-soft aria-[pressed=false]:hover:border-line-strong aria-[pressed=false]:hover:text-ink ' +
  FOCUS_RING;

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ FICHE OUVERTE — lue dans l'adresse
   ═══════════════════════════════════════════════════════════════════════════ */

const subscribeToOpenChanges = (onChange: () => void) => {
  const events = ['popstate', 'hashchange', OPEN_CHANGED];
  for (const type of events) window.addEventListener(type, onChange);
  return () => {
    for (const type of events) window.removeEventListener(type, onChange);
  };
};

const readAnchorFromUrl = () => window.location.hash.slice(1);

export default function ProjectShowcase({ entries, categories }: ProjectShowcaseProps) {
  const t = useTranslations('projects_page');
  const isClient = useIsClient();

  const [filter, setFilter] = useState<Filter>('all');
  /** Filtre réellement appliqué à la grille : il attend la fin des animations. */
  const [appliedFilter, setAppliedFilter] = useState<Filter>('all');
  const [phases, setPhases] = useState<Record<string, ShatterPhase>>({});
  const [current, setCurrent] = useState<string | null>(null);

  const gridRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** Les minuteries en cours sont annulées avant d'en poser de nouvelles. */
  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const later = useCallback((action: () => void, delay: number) => {
    timersRef.current.push(setTimeout(action, delay));
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  /** `true` si le visiteur a demandé moins d'animations. */
  const prefersLessMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Fiche ouverte ──────────────────────────────────────────────────────── */
  const urlAnchor = useSyncExternalStore(subscribeToOpenChanges, readAnchorFromUrl, () => '');
  const openEntry = entries.find((entry) => entry.anchor === urlAnchor) ?? null;

  const openProject = useCallback((anchor: string) => {
    window.history.pushState({ pjModal: anchor }, '', `#${anchor}`);
    window.dispatchEvent(new Event(OPEN_CHANGED));
  }, []);

  const closeProject = useCallback(() => {
    // L'ouverture a empilé une entrée : revenir en arrière la retire, et le
    // bouton « retour » du navigateur ferme donc la fiche de la même façon.
    if (window.history.state?.pjModal) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.dispatchEvent(new Event(OPEN_CHANGED));
  }, []);

  /** Clic sur une carte : elle se désintègre, puis la fiche s'ouvre. */
  const requestOpen = useCallback(
    (anchor: string) => {
      if (prefersLessMotion()) {
        openProject(anchor);
        return;
      }

      clearTimers();
      setPhases({ [anchor]: 'out' });
      // La fiche s'ouvre juste avant la fin du vol : l'enchaînement est continu.
      later(() => {
        openProject(anchor);
        setPhases({});
      }, SHATTER_DURATION_MS - 80);
    },
    [clearTimers, later, openProject],
  );

  /* ── Filtre ─────────────────────────────────────────────────────────────── */
  const matches = (entry: ShowcaseEntry, value: Filter) => value === 'all' || entry.categoryKey === value;
  const shown = entries.filter((entry) => matches(entry, filter));
  const displayed = entries.filter((entry) => matches(entry, appliedFilter));
  const countOf = (key: Filter) => entries.filter((entry) => matches(entry, key)).length;

  const applyFilter = (next: Filter) => {
    if (next === filter) return;

    setFilter(next);
    clearTimers();

    if (prefersLessMotion()) {
      setAppliedFilter(next);
      setPhases({});
      return;
    }

    // Trois temps : les cartes qui sortent se désintègrent, la grille change,
    // puis les cartes qui arrivent se reconstituent.
    const leaving = displayed.filter((entry) => !matches(entry, next));
    setPhases(Object.fromEntries(leaving.map((entry) => [entry.anchor, 'out' as ShatterPhase])));

    later(() => {
      const arriving = entries.filter((entry) => matches(entry, next) && !matches(entry, appliedFilter));
      setAppliedFilter(next);
      setPhases(Object.fromEntries(arriving.map((entry) => [entry.anchor, 'in' as ShatterPhase])));
      later(() => setPhases({}), SHATTER_DURATION_MS);
    }, leaving.length > 0 ? SHATTER_DURATION_MS : 0);

    // Si le haut de la grille est déjà passé, on y revient : sinon le visiteur
    // reste au milieu d'une liste qui vient de changer sous ses yeux.
    const grid = gridRef.current;
    if (grid && grid.getBoundingClientRect().top < 0) {
      grid.scrollIntoView({ block: 'start', behavior: prefersLessMotion() ? 'auto' : 'smooth' });
    }
  };

  /* ── Sommaire : la carte en cours de lecture est signalée ─────────────────
     La grille a deux colonnes : deux cartes traversent donc la ligne de lecture
     en même temps. On retient toujours la première dans l'ordre de la page,
     sans quoi le sommaire désignait l'une ou l'autre selon l'ordre d'arrivée
     des observations. */
  useEffect(() => {
    const crossing = new Set<string>();
    const order = entries.map((entry) => entry.anchor);

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const anchor = record.target.id.replace('carte-', '');
          if (record.isIntersecting) crossing.add(anchor);
          else crossing.delete(anchor);
        }
        const first = order.find((anchor) => crossing.has(anchor));
        if (first) setCurrent(first);
      },
      { rootMargin: READING_LINE },
    );

    for (const entry of entries) {
      const element = document.getElementById(`carte-${entry.anchor}`);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [entries, appliedFilter]);

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ MODALE — défilement, focus et clavier
     ═══════════════════════════════════════════════════════════════════════ */

  /* Défilement de la page verrouillé, largeur de barre compensée. */
  useEffect(() => {
    if (!openEntry) return;

    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [openEntry]);

  /* Focus déplacé dans la fiche, puis rendu à la carte à la fermeture. */
  useEffect(() => {
    if (!openEntry) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus({ preventScroll: true });
    // Chaque fiche s'ouvre à son début, même après une longue lecture.
    if (panel) panel.scrollTop = 0;

    return () => previouslyFocused?.focus?.({ preventScroll: true });
  }, [openEntry]);

  /* `Échap` ferme, `Tab` tourne en boucle dans la fiche. */
  useEffect(() => {
    if (!openEntry) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeProject();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openEntry, closeProject]);

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ RENDU
     ═══════════════════════════════════════════════════════════════════════ */

  const filters: { key: Filter; label: string }[] = [{ key: 'all', label: t('filterAll') }, ...categories];
  const total = String(entries.length).padStart(2, '0');

  // Le sommaire est affiché deux fois (colonne fixe et bloc repliable mobile) :
  // il est construit une fois, puis inséré aux deux endroits.
  const index = (
    <ol className="pj-index">
        {shown.map((entry) => (
          <li key={entry.anchor}>
            <a
              href={`#${entry.anchor}`}
              className="pj-index-link"
              aria-current={current === entry.anchor ? 'true' : undefined}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                event.preventDefault();
                requestOpen(entry.anchor);
              }}
            >
              <span className="pj-index-num">{entry.number}</span>
              <span className="pj-index-thumb">
                <Image src={entry.cover} alt="" fill sizes="44px" />
              </span>
              <span className="pj-index-title">{entry.title}</span>
            </a>
          </li>
        ))}
      </ol>
  );

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
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

          {/* Le compteur est annoncé à chaque changement de filtre. */}
          <p aria-live="polite" className="mt-4 text-caption font-semibold text-ink-muted">
            {t('shown', { count: shown.length })}
          </p>

          {/* Sommaire : colonne fixe sur grand écran, repliable sur mobile. */}
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

        <ul ref={gridRef} className="pj-grid" aria-label={t('overline')}>
          {entries.map((entry, position) => {
            const isDisplayed = matches(entry, appliedFilter);
            const phase = phases[entry.anchor] ?? 'idle';

            return (
              <li
                key={entry.anchor}
                id={`carte-${entry.anchor}`}
                className="pj-cell"
                /* Une carte qui se désintègre reste affichée le temps du vol. */
                hidden={!isDisplayed && phase === 'idle'}
                data-phase={phase === 'idle' ? undefined : phase}
                style={{ '--pj-shatter-duration': `${SHATTER_DURATION_MS}ms` } as React.CSSProperties}
              >
                <ProjectCard
                  anchor={entry.anchor}
                  number={entry.number}
                  title={entry.title}
                  category={entry.category}
                  year={entry.year}
                  cover={entry.cover}
                  summary={entry.summary}
                  techStack={entry.techStack}
                  isLive={entry.isLive}
                  phase={phase}
                  onOpen={requestOpen}
                  index={position}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Modale ─────────────────────────────────────────────────────────
          `data-js` neutralise le repli sans JavaScript (règles `:target`).
          Le clic hors du panneau referme. */}
      <div
        className="pj-modal"
        data-js={isClient ? '' : undefined}
        data-open={openEntry ? '' : undefined}
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest('.pj-panel')) closeProject();
        }}
      >
        <div className="pj-veil" aria-hidden="true" />

        <div
          ref={panelRef}
          className="pj-panel"
          role="dialog"
          aria-modal="true"
          aria-label={openEntry ? openEntry.title : undefined}
          tabIndex={-1}
        >
          <div className="pj-panel-head">
            <p className="pj-panel-eyebrow">
              {openEntry ? t('sheetNumber', { number: openEntry.number, total }) : t('overline')}
            </p>
            <button type="button" className="pj-close" onClick={closeProject} aria-label={t('closeDetails')}>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Une fiche fermée est masquée par une CLASSE, et non par l'attribut
              `hidden` : Chrome applique ce dernier avec une priorité qu'aucune
              règle d'auteur ne peut lever, pas même en `!important`, ce qui
              rendait le repli `:target` (sans JavaScript) inopérant. Dans les
              deux cas, `display: none` retire bien la fiche de l'arbre
              d'accessibilité. */}
          {entries.map((entry) => (
            <div
              key={entry.anchor}
              id={entry.anchor}
              className={`pj-detail-wrap${entry.anchor === openEntry?.anchor ? '' : ' pj-detail-wrap--closed'}`}
            >
              {entry.detail}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
