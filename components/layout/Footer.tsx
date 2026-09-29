/**
 * @file Footer.tsx
 * @description Pied de page du site — direction « Reçu ».
 *
 * @architecture
 * Composant **serveur** : aucun JavaScript envoyé au navigateur. L'ancienne
 * version était un composant client (framer-motion, reflets au survol,
 * enveloppes magnétiques, bouton « retour en haut »).
 *
 * Contenu, et seulement ce qui est vrai :
 *  - les coordonnées viennent de `lib/site.ts` (source unique) ;
 *  - les réseaux sont ceux de `SOCIAL_LINKS`. Les six liens gabarits
 *    (TikTok, Snapchat… vers la page d'accueil de chaque réseau) sont retirés ;
 *  - les mentions « Confidentialité » et « Conditions » sont retirées : elles
 *    n'étaient pas des liens et aucune page ne leur correspondait.
 *
 * Chaque donnée et chaque réseau porte son pictogramme (`ContactIcon`). Les
 * glyphes sont insérés dans le HTML et peints avec `currentColor` : le pied de
 * page reste un composant serveur, sans requête d'image ni logo noir invisible
 * en thème sombre.
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONTACT, SOCIAL_LINKS } from '@/lib/site';
import type { ContactIconName } from '@/components/ui/contact-icons';
import Arrow from '@/components/ui/Arrow';
import ContactIcon from '@/components/ui/ContactIcon';
import Logotype from './Logotype';
import '@/components/ui/contact-icons.css';
import './footer.css';

const COLUMN_HEADING = 'border-b border-ink pb-3 text-caption font-bold uppercase tracking-[0.1em] text-ink';

const FOOTER_LINK =
  'rounded-control text-ink-soft underline decoration-transparent underline-offset-4 transition-colors duration-(--motion-fast) ' +
  'hover:text-ink hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

/**
 * Année du copyright.
 * La page étant générée au build, c'est l'année du dernier déploiement — ce
 * qui est exactement la date d'un contenu publié.
 */
const COPYRIGHT_YEAR = new Date().getFullYear();

/**
 * Une coordonnée du pied de page : son pictogramme, son libellé, et **une ou
 * plusieurs** valeurs. Le téléphone en compte deux — d'où `values` au pluriel
 * plutôt qu'une seconde entrée « Téléphone 2 », qui laisserait croire à deux
 * coordonnées distinctes.
 */
interface FooterDatum {
  icon: ContactIconName;
  label: string;
  values: readonly { value: string; href?: string }[];
}

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tLabels = useTranslations('contact_page.labels');

  const navigation = [
    { href: '/' as const, label: tNav('home') },
    { href: '/projets' as const, label: tNav('projects') },
    { href: '/propos' as const, label: tNav('about') },
    { href: '/contact' as const, label: tNav('contact') },
  ];

  const contact: FooterDatum[] = [
    { icon: 'mail', label: tLabels('email'), values: [{ value: CONTACT.email, href: `mailto:${CONTACT.email}` }] },
    { icon: 'phone', label: tLabels('phone'), values: CONTACT.phones.map(({ display, href }) => ({ value: display, href })) },
    { icon: 'location', label: tLabels('location'), values: [{ value: `${CONTACT.city}, ${CONTACT.country}` }] },
  ];

  return (
    <footer className="site-footer relative mt-2 bg-surface text-ink">
      <div className="ft-edge" aria-hidden="true" />

      <div className="mx-auto w-full max-w-content px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,0.8fr)] lg:gap-10">
          {/* Identité */}
          <div className="grid content-start gap-3">
            <Logotype size="footer" />
            <p className="max-w-[34ch] text-caption text-ink-soft">{t('description')}</p>
          </div>

          {/* Navigation */}
          <nav aria-labelledby="footer-navigation">
            <h2 id="footer-navigation" className={COLUMN_HEADING}>{t('navigation')}</h2>
            <ul className="mt-4 grid gap-2.5 text-[0.9375rem]">
              {navigation.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={FOOTER_LINK}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Coordonnées : libellé au-dessus de la valeur, l'adresse e-mail étant longue */}
          <div>
            <h2 className={COLUMN_HEADING}>{t('contact')}</h2>
            <dl className="mt-4 grid gap-3">
              {contact.map(({ icon, label, values }) => (
                <div key={label} className="ft-datum">
                  <dt className="flex items-center gap-2 text-overline font-semibold uppercase text-ink-muted">
                    <ContactIcon name={icon} className="ft-glyph" />
                    {label}
                  </dt>
                  {/* `justify-items: start` : la zone cliquable épouse le texte
                      au lieu de couvrir toute la largeur de la colonne. */}
                  <dd className="mt-0.5 grid justify-items-start gap-0.5 text-[0.9375rem]">
                    {values.map(({ value, href }) =>
                      href ? (
                        <a key={value} href={href} className={`${FOOTER_LINK} wrap-anywhere`}>{value}</a>
                      ) : (
                        <span key={value} className="text-ink-soft">{value}</span>
                      ),
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Profils publics */}
          <div>
            <h2 className={COLUMN_HEADING}>{t('elsewhere')}</h2>
            <ul className="mt-4 grid gap-2.5 text-[0.9375rem]">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={FOOTER_LINK}>
                    <ContactIcon name={icon} className="ft-glyph mr-2" />
                    {label} <Arrow direction="up-right" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bas de reçu */}
        <div className="mt-14 flex flex-col gap-2 border-t border-dashed border-line-strong pt-6 text-caption text-ink-muted sm:flex-row sm:justify-between">
          <p>
            © {COPYRIGHT_YEAR} Kalvin Takoudjou. {t('copyright')}
          </p>
          {/* <p>{t('madeIn')}</p> */}
        </div>
      </div>
    </footer>
  );
}
