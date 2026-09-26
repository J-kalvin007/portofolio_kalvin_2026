/**
 * @file ContactDetails.tsx
 * @description Coordonnées de la page Contact, présentées comme un reçu :
 * e-mail, les deux lignes téléphoniques, les profils publics, la localisation,
 * l'heure locale et la disponibilité.
 *
 * Composant serveur ; seule l'heure locale est un îlot client. Les valeurs
 * viennent de `lib/site.ts`, source unique partagée avec le pied de page.
 *
 * @architecture
 * Chaque ligne porte un pictogramme (`ContactIcon`) en tête de libellé. Les
 * pictogrammes se retrouvent alignés sur la même verticale d'une ligne à
 * l'autre, sans aucun filet ni cadre : c'est l'alignement qui structure la
 * fiche, et l'œil suit une colonne de glyphes plus vite qu'une colonne de mots
 * en capitales.
 *
 * Les lignes de réseaux ne sont pas écrites à la main : elles sont dépliées
 * depuis `SOCIAL_LINKS`. Un profil ajouté dans `lib/site.ts` apparaît donc ici,
 * dans le pied de page et dans le menu mobile en une seule modification — et un
 * profil dont l'adresse n'est pas connue n'apparaît nulle part.
 */

import { useLocale, useTranslations } from 'next-intl';
import { CONTACT, CV_PATH, SOCIAL_LINKS } from '@/lib/site';
import type { ContactIconName } from '@/components/ui/contact-icons';
import Arrow from '@/components/ui/Arrow';
import ContactIcon from '@/components/ui/ContactIcon';
import LocalTime from '@/components/ui/LocalTime';
import '@/components/ui/receipt.css';
import '@/components/ui/contact-icons.css';

/**
 * Une ligne de la fiche : pictogramme, libellé, pointillés, valeur.
 *
 * Le pictogramme est le premier enfant du `<dt>` — et non un troisième élément
 * de la ligne — pour que les pointillés continuent de s'étirer entre le libellé
 * et la valeur, quelle que soit la longueur du libellé.
 */
function DetailLine({ icon, label, children }: { icon: ContactIconName; label: string; children: React.ReactNode }) {
  return (
    <div className="rc-line">
      <dt>
        <ContactIcon name={icon} className="rc-glyph" />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

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
          <DetailLine icon="mail" label={t('labels.email')}>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </DetailLine>

          {/* Les deux lignes tiennent dans une seule entrée : c'est une même
              coordonnée, joignable à deux numéros — pas deux coordonnées. */}
          <DetailLine icon="phone" label={t('labels.phone')}>
            <span className="rc-multi">
              {CONTACT.phones.map((phone) => (
                <a key={phone.href} href={phone.href}>{phone.display}</a>
              ))}
            </span>
          </DetailLine>

          {SOCIAL_LINKS.map(({ label, href, icon, handle }) => (
            <DetailLine key={label} icon={icon} label={label}>
              <a href={href} target="_blank" rel="noopener noreferrer">
                {handle} <Arrow direction="up-right" />
                {newTab}
              </a>
            </DetailLine>
          ))}

          <DetailLine icon="location" label={t('labels.location')}>
            {CONTACT.city}, {CONTACT.country}
          </DetailLine>

          <DetailLine icon="clock" label={t('details.localTime')}>
            <LocalTime locale={locale} timeZone={CONTACT.timeZone} /> · UTC+0
          </DetailLine>

          <DetailLine icon="status" label={t('details.status')}>
            {t('details.statusValue')}
          </DetailLine>
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
