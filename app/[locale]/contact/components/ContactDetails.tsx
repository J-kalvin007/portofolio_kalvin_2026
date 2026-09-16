/**
 * @file ContactDetails.tsx
 * @description Coordonnées de la page Contact, présentées comme un reçu :
 * e-mail, téléphone, WhatsApp, GitHub, localisation, heure locale, statut.
 *
 * Composant serveur ; seule l'heure locale est un îlot client. Les valeurs
 * viennent de `lib/site.ts`, source unique partagée avec le pied de page.
 * Remplace les cartes à reflet doré et les huit icônes de réseaux, dont six
 * menaient à la page d'accueil du réseau et non à un profil.
 */

import { useLocale, useTranslations } from 'next-intl';
import { CONTACT, CV_PATH, SOCIAL_LINKS } from '@/lib/site';
import Arrow from '@/components/ui/Arrow';
import LocalTime from '@/components/ui/LocalTime';
import '@/components/ui/receipt.css';

const GITHUB_URL = SOCIAL_LINKS.find((link) => link.label === 'GitHub')?.href;

export default function ContactDetails() {
  const locale = useLocale();
  const t = useTranslations('contact_page');
  const tProject = useTranslations('project');

  const newTab = <span className="sr-only"> {tProject('newTab')}</span>;

  return (
    <aside aria-labelledby="contact-details-title" className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-card bg-paper p-6 text-[0.9375rem] text-paper-ink shadow-e1 sm:p-7">
        <h2 id="contact-details-title" className="text-overline font-semibold uppercase text-paper-muted">
          {t('details.title')}
        </h2>

        <dl className="rc-lines rc-lines--wrap rc-lines--airy mt-5">
          <div className="rc-line">
            <dt>{t('labels.email')}</dt>
            <dd><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></dd>
          </div>
          <div className="rc-line">
            <dt>{t('labels.phone')}</dt>
            <dd><a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a></dd>
          </div>
          <div className="rc-line">
            <dt>{t('details.whatsapp')}</dt>
            <dd>
              <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
                {t('details.whatsappValue')} <Arrow direction="up-right" />
                {newTab}
              </a>
            </dd>
          </div>
          {GITHUB_URL && (
            <div className="rc-line">
              <dt>{t('details.github')}</dt>
              <dd>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  {new URL(GITHUB_URL).pathname.slice(1)} <Arrow direction="up-right" />
                  {newTab}
                </a>
              </dd>
            </div>
          )}
          <div className="rc-line">
            <dt>{t('labels.location')}</dt>
            <dd>{CONTACT.city}, {CONTACT.country}</dd>
          </div>
          <div className="rc-line">
            <dt>{t('details.localTime')}</dt>
            <dd><LocalTime locale={locale} timeZone={CONTACT.timeZone} /> · UTC+0</dd>
          </div>
          <div className="rc-line">
            <dt>{t('details.status')}</dt>
            <dd>{t('details.statusValue')}</dd>
          </div>
        </dl>

        <hr className="my-6 border-0 border-t border-dashed border-paper-line" />

        {/* Bouton secondaire aux couleurs du papier (le reçu reste clair en thème sombre) */}
        <a
          href={CV_PATH}
          download
          className="inline-flex w-full items-center justify-center gap-2 rounded-control border border-paper-line px-5 py-3 font-semibold text-paper-ink
                     transition-colors duration-(--motion-fast) hover:border-paper-ink
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
        >
          {t('details.cv')}
        </a>
      </div>
    </aside>
  );
}
