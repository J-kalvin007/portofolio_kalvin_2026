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
 *    (Instagram, TikTok… vers la page d'accueil de chaque réseau) sont retirés ;
 *  - les mentions « Confidentialité » et « Conditions » sont retirées : elles
 *    n'étaient pas des liens et aucune page ne leur correspondait.
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONTACT, SOCIAL_LINKS } from '@/lib/site';
import Arrow from '@/components/ui/Arrow';
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

  const contact = [
    { label: tLabels('email'), value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { label: tLabels('phone'), value: CONTACT.phoneDisplay, href: CONTACT.phoneHref },
    { label: tLabels('location'), value: `${CONTACT.city}, ${CONTACT.country}` },
  ];

  return (
    <footer className="site-footer relative mt-2 bg-surface text-ink">
      <div className="ft-edge" aria-hidden="true" />

      <div className="mx-auto w-full max-w-content px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,0.8fr)] lg:gap-10">
          {/* Identité */}
          <div className="grid content-start gap-3">
            <p className="text-subheading font-extrabold uppercase leading-none tracking-[0.06em]">
              K<span className="text-brand-text">·</span>Takoudjou
            </p>
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
              {contact.map(({ label, value, href }) => (
                <div key={label}>
                  <dt className="text-overline font-semibold uppercase text-ink-muted">{label}</dt>
                  <dd className="mt-0.5 text-[0.9375rem]">
                    {href ? (
                      <a href={href} className={`${FOOTER_LINK} wrap-anywhere`}>{value}</a>
                    ) : (
                      <span className="text-ink-soft">{value}</span>
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
              {SOCIAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={FOOTER_LINK}>
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
          <p>{t('madeIn')}</p>
        </div>
      </div>
    </footer>
  );
}
