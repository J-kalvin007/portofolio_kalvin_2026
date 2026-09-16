/**
 * @file ProfileReceipt.tsx
 * @description Le reçu du profil — geste signature de la page d'accueil.
 *
 * @architecture
 * Composant serveur. Tout ce qui est chiffré est calculé à partir des données
 * (`PROJECT_COUNT_BY_CATEGORY`, `mostUsedTechnologies`) : ajouter un projet
 * met le reçu à jour sans toucher à ce fichier. Seule l'heure locale est un
 * îlot client (`LocalTime`).
 *
 * Répond à la lecture « 10 secondes » d'un recruteur : statut, poste,
 * formation, volume livré et technologies principales, sur un seul objet.
 */

import { useLocale, useTranslations } from 'next-intl';
import { PROJECTS, PROJECT_COUNT_BY_CATEGORY, mostUsedTechnologies } from '@/lib/data/projects';
import { CONTACT } from '@/lib/site';
import LocalTime from './LocalTime';

/** Nombre de technologies citées sur la ligne « Stack ». */
const STACK_LINE_LENGTH = 5;

/** Ligne de reçu : libellé, pointillés, valeur. */
function ReceiptLine({ label, children, total = false }: { label: string; children: React.ReactNode; total?: boolean }) {
  return (
    <div className={total ? 'rc-line rc-total' : 'rc-line'}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Nombre sur deux chiffres, comme sur un ticket de caisse. */
const pad = (value: number) => String(value).padStart(2, '0');

export default function ProfileReceipt() {
  const locale = useLocale();
  const t = useTranslations('home.receipt');
  const tCategories = useTranslations('projects_page.categories');

  return (
    <figure className="rc" aria-label={t('label')}>
      <div className="rc-slot" aria-hidden="true" />
      <div className="rc-paper">
        <p className="rc-head">Kalvin Takoudjou</p>
        <p className="rc-sub">
          {t('role')}
          <br />
          {t('location')} · UTC+0
        </p>

        <hr className="rc-rule" />
        <dl className="rc-lines">
          <ReceiptLine label={t('localTime')}>
            <LocalTime locale={locale} timeZone={CONTACT.timeZone} />
          </ReceiptLine>
          <ReceiptLine label={t('status')}>{t('statusValue')}</ReceiptLine>
          <ReceiptLine label={t('missions')}>{t('missionsValue')}</ReceiptLine>
          <ReceiptLine label={t('position')}>{t('positionValue')}</ReceiptLine>
          <ReceiptLine label={t('education')}>{t('educationValue')}</ReceiptLine>
        </dl>

        <hr className="rc-rule" />
        <dl className="rc-lines">
          {PROJECT_COUNT_BY_CATEGORY.map(({ category, count }) => (
            <ReceiptLine key={category} label={tCategories(category)}>{pad(count)}</ReceiptLine>
          ))}
          <ReceiptLine label={t('total')} total>{pad(PROJECTS.length)}</ReceiptLine>
        </dl>

        <hr className="rc-rule" />
        <p className="rc-stack">
          <strong>{t('stack')}</strong> {mostUsedTechnologies(STACK_LINE_LENGTH).join(' · ')}
        </p>

        <p className="rc-stamp-row">
          <span className="rc-stamp">{t('stamp')}</span>
        </p>
        <p className="rc-thanks">{t('thanks')}</p>
      </div>
    </figure>
  );
}
