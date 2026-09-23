/**
 * @file AboutSections.tsx
 * @description Sections de la page À propos (direction « Reçu »).
 *
 * @architecture
 * Composants **serveur**, sans JavaScript côté navigateur. Ils remplacent
 * l'ancienne page client : titre révélé lettre par lettre, portrait en
 * parallaxe suivant la souris, texte « vision » révélé au défilement,
 * compteurs animés (dont « ∞ Passion » et « 100 % d'engagement »), rail de
 * témoignages en défilement continu et curseur à paillettes.
 *
 * Contenu : le parcours et les recommandations viennent des traductions
 * (`experience.*`, `testimonials.*`) ; la méthode ne décrit que ce que le
 * site montre (projets, stacks, schémas).
 */

import Image from 'next/image';
import { useMessages, useTranslations } from 'next-intl';
import SectionHead from '@/components/ui/SectionHead';
import { COLUMN_HEADING, CONTAINER } from '@/components/ui/styles';
import { padNumber } from '@/lib/format';
import '@/components/ui/receipt.css';
import './about.css';

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ FICHE D'IDENTITÉ
   ═══════════════════════════════════════════════════════════════════════════ */

export function ProfileCard() {
  const t = useTranslations('about_page.card');

  const lines = [
    { label: t('position'), value: t('positionValue') },
    { label: t('education'), value: t('educationValue') },
    { label: t('based'), value: t('basedValue') },
    { label: t('languages'), value: t('languagesValue') },
    { label: t('missions'), value: t('missionsValue') },
  ];

  return (
    <figure className="idc" aria-label={t('label')}>
      <div className="idc-clip" aria-hidden="true" />
      <div className="idc-paper">
        <div className="idc-head">
          <div className="idc-photo">
            <Image
              src="/images/Kalvin.webp"
              alt={t('portraitAlt')}
              fill
              priority
              sizes="(max-width: 380px) 96px, 120px"
            />
          </div>
          <div>
            <p className="idc-name">Kalvin Takoudjou</p>
            <p className="idc-role">{t('role')}</p>
          </div>
        </div>

        <hr className="idc-rule" />
        <dl className="rc-lines rc-lines--wrap">
          {lines.map(({ label, value }) => (
            <div key={label} className="rc-line">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <p className="idc-stamp">{t('stamp')}</p>
      </div>
    </figure>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ PARCOURS — registre de l'expérience et de la formation
   ═══════════════════════════════════════════════════════════════════════════ */

type TimelineKey = 'job1' | 'job2' | 'edu1' | 'edu2';

export function CareerLedger() {
  const t = useTranslations('about_page.career');
  const tExp = useTranslations('experience');
  const { experience } = useMessages();

  const groups: { heading: string; keys: TimelineKey[] }[] = [
    { heading: t('experience'), keys: ['job1', 'job2'] },
    { heading: t('education'), keys: ['edu1', 'edu2'] },
  ];

  /** Missions détaillées d'un poste (les formations n'en ont pas). */
  const tasksOf = (key: TimelineKey): string[] =>
    key === 'job1' ? experience.job1_points : key === 'job2' ? experience.job2_points : [];

  return (
    <section id="parcours" aria-labelledby="career-title" className="py-section">
      <div className={CONTAINER}>
        <SectionHead id="career-title" overline={t('overline')} title={t('title')} />
        <div className="grid gap-block">
          {groups.map((group) => (
            <div key={group.heading}>
              <h3 className={COLUMN_HEADING}>{group.heading}</h3>
              <ol>
                {group.keys.map((key) => {
                  const tasks = tasksOf(key);
                  return (
                    <li
                      key={key}
                      className="grid gap-2 border-b border-line py-6 md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1.4fr)] md:gap-8"
                    >
                      <p className="text-caption font-semibold tabular-nums text-ink-muted">{tExp(`${key}_period`)}</p>
                      <div>
                        <h4 className="text-body font-semibold text-ink">{tExp(`${key}_title`)}</h4>
                        <p className="text-caption text-ink-soft">
                          {tExp(`${key}_subtitle`)} · {tExp(`${key}_location`)}
                        </p>
                      </div>
                      <div className="grid gap-3">
                        <p className="max-w-[62ch] text-body text-pretty text-ink-soft">{tExp(`${key}_description`)}</p>
                        {tasks.length > 0 && (
                          <ul aria-label={t('tasks')} className="grid max-w-[62ch] gap-1.5 text-caption text-ink-soft">
                            {tasks.map((task) => (
                              <li key={task} className="relative pl-4 before:absolute before:left-0.5 before:top-[0.6em] before:h-1.5 before:w-1.5 before:bg-brand-text">
                                {task}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ MÉTHODE — quatre principes, chacun vérifiable sur le site
   ═══════════════════════════════════════════════════════════════════════════ */

const METHOD_KEYS = ['business', 'system', 'delivery', 'architecture'] as const;

export function MethodSection() {
  const t = useTranslations('about_page.method');

  return (
    <section id="methode" aria-labelledby="method-title" className="border-y border-line bg-surface py-section">
      <div className={CONTAINER}>
        <SectionHead id="method-title" overline={t('overline')} title={t('title')} />
        <ol className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {METHOD_KEYS.map((key, position) => (
            <li key={key} className="grid content-start gap-3 border-t border-ink pt-5">
              <p className="text-caption font-semibold tabular-nums text-ink-muted">{padNumber(position + 1)}</p>
              <h3 className="text-subheading font-bold text-balance text-ink">{t(`${key}.title`)}</h3>
              <p className="max-w-[52ch] text-body text-pretty text-ink-soft">{t(`${key}.text`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ PROFIL — langues, atouts, centres d'intérêt
   Trois colonnes courtes : de quoi compléter le portrait sans prendre le pas
   sur le parcours. Le niveau d'anglais est décrit tel qu'il est.
   ═══════════════════════════════════════════════════════════════════════════ */

export function ProfileSection() {
  const t = useTranslations('about_page.profile');
  const { about_page: { profile } } = useMessages();

  return (
    <section id="profil" aria-labelledby="profile-title" className="py-section">
      <div className={CONTAINER}>
        <SectionHead id="profile-title" overline={t('overline')} title={t('title')} />
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <h3 className={COLUMN_HEADING}>{t('languagesTitle')}</h3>
            <dl className="divide-y divide-line">
              {profile.languages.map((language) => (
                <div key={language.name} className="grid gap-1 py-4">
                  <dt className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-body font-semibold text-ink">{language.name}</span>
                    <span className="text-caption font-semibold text-brand-text">{language.level}</span>
                  </dt>
                  <dd className="text-caption text-pretty text-ink-soft">{language.note}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className={COLUMN_HEADING}>{t('strengthsTitle')}</h3>
            <ul className="divide-y divide-line">
              {profile.strengths.map((strength) => (
                <li key={strength.title} className="grid gap-1 py-4">
                  <p className="text-body font-semibold text-ink">{strength.title}</p>
                  <p className="text-caption text-pretty text-ink-soft">{strength.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 xl:col-span-1">
            <h3 className={COLUMN_HEADING}>{t('interestsTitle')}</h3>
            <ul className="divide-y divide-line">
              {profile.interests.map((interest) => (
                <li key={interest.title} className="grid gap-1 py-4">
                  <p className="text-body font-semibold text-ink">{interest.title}</p>
                  <p className="text-caption text-pretty text-ink-soft">{interest.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ RECOMMANDATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const TESTIMONIAL_KEYS = ['t1', 't2', 't3'] as const;

export function RecommendationsSection() {
  const t = useTranslations('about_page.recommendations');
  const tTest = useTranslations('testimonials');

  return (
    <section id="recommandations" aria-labelledby="recommendations-title" className="py-section">
      <div className={CONTAINER}>
        <SectionHead id="recommendations-title" overline={t('overline')} title={t('title')} />
        <ul className="grid gap-6 lg:grid-cols-3">
          {TESTIMONIAL_KEYS.map((key) => (
            <li key={key}>
              <figure className="grid h-full content-between gap-6 rounded-card bg-paper p-6 text-paper-ink shadow-e1">
                <blockquote className="text-lead text-pretty">
                  {/* <q> : guillemets de la langue du document (« » en français). */}
                  <p><q>{tTest(`${key}_quote`)}</q></p>
                </blockquote>
                <figcaption className="border-t border-dashed border-paper-line pt-4">
                  <p className="font-semibold">{tTest(`${key}_author`)}</p>
                  <p className="mt-1 text-overline font-semibold uppercase text-paper-muted">
                    {tTest(`${key}_role`)} · {tTest(`${key}_company`)}
                  </p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
