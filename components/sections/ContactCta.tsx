/**
 * @file ContactCta.tsx
 * @description Bloc d'appel au contact : trois manières d'agir (e-mail,
 * formulaire, CV). Termine l'accueil et la page À propos.
 *
 * Composant serveur, sans JavaScript côté navigateur.
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONTACT, CV_PATH } from '@/lib/site';
import { BUTTON_PRIMARY, CONTAINER, LINK_SECONDARY, OVERLINE } from '@/components/ui/styles';

export default function ContactCta() {
  const t = useTranslations('contact_cta');

  return (
    <section id="contact-rapide" aria-labelledby="contact-cta-title" className="border-t border-line py-section">
      <div className={`${CONTAINER} grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]`}>
        <div className="grid gap-4">
          <p className={OVERLINE}>{t('overline')}</p>
          <h2 id="contact-cta-title" className="text-heading font-bold text-balance text-ink">{t('title')}</h2>
          <p className="text-lead text-ink-soft">{t('description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:justify-end">
          <a href={`mailto:${CONTACT.email}`} className={BUTTON_PRIMARY}>{t('email')}</a>
          <Link href="/contact" className={LINK_SECONDARY}>{t('form')}</Link>
          <a href={CV_PATH} download className={LINK_SECONDARY}>{t('cv')}</a>
        </div>
      </div>
    </section>
  );
}
