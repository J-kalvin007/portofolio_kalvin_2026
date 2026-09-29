/**
 * @file contact/page.tsx
 * @description Page Contact — direction « Reçu ».
 *
 * @architecture
 * Composant **serveur**. Les coordonnées sont rendues au serveur ; seuls le
 * calendrier de rendez-vous (`BookingCalendar`), le formulaire de message
 * (`ContactForm`) et l'heure locale s'exécutent dans le navigateur.
 *
 * @remarks La page mène deux conversations, dans cet ordre : **prendre
 * rendez-vous**, qui occupe la page, et **écrire un message**, replié sous
 * elle. Le second reste accessible en un clic — tout le monde n'a pas une date
 * en tête au moment d'écrire — mais il ne dispute plus la vedette au premier.
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { resolveLocale, type LocaleParams } from '@/i18n/params';
import { pageMetadata } from '@/lib/seo';
import Arrow from '@/components/ui/Arrow';
import PageHeader from '@/components/ui/PageHeader';
import { CONTAINER, FOCUS_RING } from '@/components/ui/styles';
import BookingCalendar from './components/BookingCalendar';
import ContactDetails from './components/ContactDetails';
import ContactForm from './components/ContactForm';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'seo' });

  return pageMetadata({
    locale,
    path: '/contact',
    title: t('contact.title'),
    description: t('contact.description'),
    imageAlt: t('site.imageAlt'),
  });
}

export default async function ContactPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contact_page' });

  return (
    <>
      <PageHeader overline={t('overline')} title={t('title')} lead={t('lead')} />
      <div className={`${CONTAINER} grid items-start gap-10 pb-section pt-block lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12`}>
        <ContactDetails />

        <div className="grid gap-10">
          <BookingCalendar />

          {/* Écrire un message : replié, mais entier. Le formulaire reste dans
              le document — ses champs, ses limites et son pot de miel sont
              inchangés — simplement masqué tant qu'on ne l'ouvre pas. */}
          <details className="group/message grid gap-6">
            <summary
              className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-card border border-line
                          bg-surface px-5 py-4 text-[0.9375rem] font-semibold text-ink
                          transition-colors duration-(--motion-fast) hover:border-line-strong
                          [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
            >
              {t('messageSummary')}
              <Arrow direction="down" className="text-ink-muted transition-transform duration-(--motion-fast) group-open/message:rotate-180" />
            </summary>
            <ContactForm />
          </details>
        </div>
      </div>
    </>
  );
}
