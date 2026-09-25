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
 *
 * @remarks **L'habillage vit dans `about.css`.**
 * Le balisage ne porte plus que des classes nommées (`ab-…`), au lieu de
 * longues suites d'utilitaires : la page a gagné un registre à période
 * collante, des folios évidés, des conduites de points et des papiers agrafés,
 * qui demandent plus que ce qu'une classe utilitaire sait exprimer. Les
 * apparitions au défilement sont écrites en CSS (`animation-timeline: view()`),
 * si bien que ces sections restent **entièrement rendues par le serveur** :
 * pas un observateur, pas un écouteur, pas un octet de JavaScript.
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
        <SectionHead id="career-title" overline={t('overline')} title={t('title')} className="ab-head" />
        <div className="grid gap-block">
          {groups.map((group) => (
            <div key={group.heading}>
              <h3 className={COLUMN_HEADING}>{group.heading}</h3>
              <ol className="ab-ledger">
                {group.keys.map((key) => {
                  const tasks = tasksOf(key);
                  return (
                    <li key={key} className="ab-entry">
                      <p className="ab-period">{tExp(`${key}_period`)}</p>
                      <div className="ab-post">
                        <h4 className="ab-post-title">
                          <span className="ab-mark" aria-hidden="true" />
                          {tExp(`${key}_title`)}
                        </h4>
                        <p className="ab-post-place">
                          {tExp(`${key}_subtitle`)} · {tExp(`${key}_location`)}
                        </p>
                      </div>
                      <div className="ab-body">
                        <p className="ab-text">{tExp(`${key}_description`)}</p>
                        {tasks.length > 0 && (
                          <ul aria-label={t('tasks')} className="ab-tasks">
                            {tasks.map((task) => (
                              <li key={task}>{task}</li>
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
        <SectionHead id="method-title" overline={t('overline')} title={t('title')} className="ab-head" />
        <ol className="ab-method">
          {METHOD_KEYS.map((key, position) => (
            <li key={key} className="ab-principle">
              <p className="ab-principle-num">{padNumber(position + 1)}</p>
              <h3 className="ab-principle-title">{t(`${key}.title`)}</h3>
              <p className="ab-principle-text">{t(`${key}.text`)}</p>
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
        <SectionHead id="profile-title" overline={t('overline')} title={t('title')} className="ab-head" />
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <h3 className={COLUMN_HEADING}>{t('languagesTitle')}</h3>
            <dl className="ab-rows">
              {profile.languages.map((language) => (
                <div key={language.name} className="ab-row">
                  <dt className="ab-row-head">
                    <span className="ab-row-name">{language.name}</span>
                    {/* Conduite de points : la même ligne de reçu que le relevé
                        de compétences de l'accueil. */}
                    <span className="ab-leader" aria-hidden="true" />
                    <span className="ab-row-level">{language.level}</span>
                  </dt>
                  <dd className="ab-row-note">{language.note}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className={COLUMN_HEADING}>{t('strengthsTitle')}</h3>
            <ul className="ab-rows">
              {profile.strengths.map((strength, position) => (
                <li key={strength.title} className="ab-row">
                  <p className="ab-row-head">
                    <span className="ab-row-num" aria-hidden="true">{padNumber(position + 1)}</span>
                    <span className="ab-row-name">{strength.title}</span>
                  </p>
                  <p className="ab-row-note">{strength.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 xl:col-span-1">
            <h3 className={COLUMN_HEADING}>{t('interestsTitle')}</h3>
            <ul className="ab-rows">
              {profile.interests.map((interest, position) => (
                <li key={interest.title} className="ab-row">
                  <p className="ab-row-head">
                    <span className="ab-row-num" aria-hidden="true">{padNumber(position + 1)}</span>
                    <span className="ab-row-name">{interest.title}</span>
                  </p>
                  <p className="ab-row-note">{interest.text}</p>
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
        <SectionHead id="recommendations-title" overline={t('overline')} title={t('title')} className="ab-head" />
        <ul className="ab-quotes">
          {TESTIMONIAL_KEYS.map((key) => (
            <li key={key} className="ab-quote-cell">
              <figure className="ab-quote">
                {/* Agrafe : le même trait d'encre que l'attache du badge. */}
                <span className="ab-quote-staple" aria-hidden="true" />
                <blockquote className="ab-quote-text">
                  {/* <q> : guillemets de la langue du document (« » en français). */}
                  <p><q>{tTest(`${key}_quote`)}</q></p>
                </blockquote>
                <figcaption className="ab-quote-by">
                  <p className="ab-quote-author">{tTest(`${key}_author`)}</p>
                  <p className="ab-quote-role">
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
