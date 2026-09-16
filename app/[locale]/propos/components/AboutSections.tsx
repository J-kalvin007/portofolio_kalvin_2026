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
import { useTranslations } from 'next-intl';
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

  const groups: { heading: string; keys: TimelineKey[] }[] = [
    { heading: t('experience'), keys: ['job1', 'job2'] },
    { heading: t('education'), keys: ['edu1', 'edu2'] },
  ];

  return (
    <section id="parcours" aria-labelledby="career-title" className="scroll-mt-24 py-section">
      <div className={CONTAINER}>
        <SectionHead id="career-title" overline={t('overline')} title={t('title')} />
        <div className="grid gap-block">
          {groups.map((group) => (
            <div key={group.heading}>
              <h3 className={COLUMN_HEADING}>{group.heading}</h3>
              <ol>
                {group.keys.map((key) => (
                  <li
                    key={key}
                    className="grid gap-2 border-b border-line py-6 md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1.25fr)] md:gap-8"
                  >
                    <p className="text-caption font-semibold tabular-nums text-ink-muted">{tExp(`${key}_period`)}</p>
                    <div>
                      <h4 className="text-body font-semibold text-ink">{tExp(`${key}_title`)}</h4>
                      <p className="text-caption text-ink-soft">
                        {tExp(`${key}_subtitle`)} · {tExp(`${key}_location`)}
                      </p>
                    </div>
                    <p className="max-w-[60ch] text-body text-pretty text-ink-soft">{tExp(`${key}_description`)}</p>
                  </li>
                ))}
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
    <section id="methode" aria-labelledby="method-title" className="scroll-mt-24 border-y border-line bg-surface py-section">
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
   ▌ RECOMMANDATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const TESTIMONIAL_KEYS = ['t1', 't2', 't3'] as const;

export function RecommendationsSection() {
  const t = useTranslations('about_page.recommendations');
  const tTest = useTranslations('testimonials');

  return (
    <section id="recommandations" aria-labelledby="recommendations-title" className="scroll-mt-24 py-section">
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
