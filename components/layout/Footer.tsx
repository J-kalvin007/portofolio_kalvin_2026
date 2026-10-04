/**
 * @file Footer.tsx
 * @description Pied de page du site — direction « Reçu ».
 *
 * @architecture
 * Composant **serveur** : le pied de page est rendu en HTML. L'ancienne
 * version était un composant client (framer-motion, reflets au survol,
 * enveloppes magnétiques, bouton « retour en haut »). Un seul îlot client
 * subsiste, de quelques lignes : `SecretTrigger`, autour du logotype, qui
 * compte les clics ouvrant la régie.
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
 *
 * @responsive **L'alignement suit le nombre de colonnes.**
 *  - Téléphone (moins de 640 px) : une seule colonne, **entièrement centrée sur
 *    l'axe de l'écran** — logotype, texte, intitulés, liens, coordonnées et
 *    mentions. Une colonne unique calée à gauche laissait la moitié droite de
 *    l'écran vide : le pied de page paraissait inachevé.
 *  - À partir de `sm` (deux colonnes, puis quatre à `lg`) : alignement à gauche.
 *    Des colonnes côte à côte se lisent par leur bord commun, pas par leur axe.
 *
 * Le centrage tient en peu de règles, parce que `text-align` **s'hérite** :
 * posé une fois sur la grille, il centre tout ce qui est du texte. Seuls trois
 * endroits demandent une règle de plus, car une grille ou un `flex` place ses
 * éléments avec `justify-*` et ignore `text-align` : le bloc d'identité, le
 * libellé d'une coordonnée et sa valeur. Chacun est commenté sur place.
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONTACT, SOCIAL_LINKS } from '@/lib/site';
import type { ContactIconName } from '@/components/ui/contact-icons';
import Arrow from '@/components/ui/Arrow';
import ContactIcon from '@/components/ui/ContactIcon';
import SecretTrigger from '@/components/visual/SecretTrigger';
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
        {/* `text-center` puis `sm:text-left` : la règle d'alignement de tout le
            pied de page, héritée par les quatre blocs (voir `@responsive`). */}
        <div className="grid gap-12 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,0.8fr)] lg:gap-10">
          {/* Identité.
              `justify-items-center` : le logotype et le texte sont les éléments
              d'une grille, qui les étire sur toute la largeur — `text-align`
              ne déplace donc pas leur boîte. Centrés, ils se réduisent à leur
              contenu et se posent sur l'axe.
              `max-sm:text-balance` : centré, un dernier mot seul sur sa ligne
              se voit aussitôt ; les lignes sont donc équilibrées, et seulement
              là où le texte est centré. */}
          <div className="grid content-start justify-items-center gap-3 sm:justify-items-start">
            {/* Dix clics d'affilée sur le logotype ouvrent la régie. L'enveloppe
                est le seul îlot client du pied de page ; elle n'ajoute ni rôle,
                ni arrêt de tabulation, ni curseur (voir `SecretTrigger.tsx`). */}
            <SecretTrigger>
              <Logotype size="footer" />
            </SecretTrigger>
            <p className="max-w-[34ch] text-caption text-ink-soft max-sm:text-balance">{t('description')}</p>
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
                  {/* `justify-center` : le libellé est un `flex` (pictogramme +
                      texte). C'est le couple entier qui est centré, pas le
                      texte seul — le pictogramme reste collé à son libellé. */}
                  <dt className="flex items-center justify-center gap-2 text-overline font-semibold uppercase text-ink-muted sm:justify-start">
                    <ContactIcon name={icon} className="ft-glyph" />
                    {label}
                  </dt>
                  {/* `justify-items` (au centre, puis `start`) et non l'étirement
                      par défaut : la zone cliquable épouse le texte au lieu de
                      couvrir toute la largeur de la colonne. */}
                  <dd className="mt-0.5 grid justify-items-center gap-0.5 text-[0.9375rem] sm:justify-items-start">
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

        {/* Bas de reçu.
            Téléphone : les deux mentions sont empilées et centrées, comme le
            reste. À partir de `sm`, elles se partagent la ligne — la première à
            gauche, la seconde à droite (`justify-between`). */}
        <div className="mt-14 flex flex-col gap-2 border-t border-dashed border-line-strong pt-6 text-center text-caption text-ink-muted max-sm:text-balance sm:flex-row sm:justify-between sm:text-left">
          <p>
            © {COPYRIGHT_YEAR} Kalvin Takoudjou. {t('copyright')}
          </p>
          <p>{t('madeIn')}</p>
        </div>
      </div>
    </footer>
  );
}
