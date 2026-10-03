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
import { padNumber } from '@/lib/format';
import LocalTime from '@/components/ui/LocalTime';
import '@/components/ui/receipt.css';

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

export default function ProfileReceipt() {
  const locale = useLocale();
  const t = useTranslations('home.receipt');
  const tCategories = useTranslations('project.categories');

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

        {/* `rc-lines--wrap` : une valeur trop longue pour tenir à côté de son
            libellé passe à la ligne suivante, alignée à droite. Sans cette
            variante, le libellé — insécable — était comprimé et venait
            s'imprimer **par-dessus** la valeur : sur un téléphone de 360 px,
            « FORMATION ACTUELLE » recouvrait « MBA Big Data & IA ». Là où la
            ligne tient (ordinateur), rien ne change. */}
        <hr className="rc-rule" />
        <dl className="rc-lines rc-lines--wrap">
          <ReceiptLine label={t('localTime')}>
            <LocalTime locale={locale} timeZone={CONTACT.timeZone} />
          </ReceiptLine>
          <ReceiptLine label={t('status')}>{t('statusValue')}</ReceiptLine>
          <ReceiptLine label={t('missions')}>{t('missionsValue')}</ReceiptLine>
          <ReceiptLine label={t('position')}>{t('positionValue')}</ReceiptLine>
          <ReceiptLine label={t('education')}>{t('educationValue')}</ReceiptLine>
        </dl>

        <hr className="rc-rule" />
        <dl className="rc-lines rc-lines--wrap">
          {PROJECT_COUNT_BY_CATEGORY.map(({ category, count }) => (
            <ReceiptLine key={category} label={tCategories(category)}>{padNumber(count)}</ReceiptLine>
          ))}
          <ReceiptLine label={t('total')} total>{padNumber(PROJECTS.length)}</ReceiptLine>
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
