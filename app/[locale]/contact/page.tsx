/**
 * @file contact/page.tsx
 * @description Page Contact — direction « Reçu ».
 *
 * @architecture
 * Composant **serveur**. Les coordonnées sont rendues au serveur ; seuls le
 * formulaire (`ContactForm`) et l'heure locale s'exécutent dans le navigateur.
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { resolveLocale, type LocaleParams } from '@/i18n/params';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import { CONTAINER } from '@/components/ui/styles';
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
      <div className={`${CONTAINER} grid items-start gap-10 pb-section pt-block lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12`}>
        <ContactDetails />
        <ContactForm />
      </div>
    </>
  );
}
