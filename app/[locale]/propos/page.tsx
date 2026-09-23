/**
 * @file propos/page.tsx
 * @description Page À propos — direction « Reçu ».
 *
 * @architecture
 * Composant **serveur** intégralement : aucune ligne de JavaScript propre à
 * la page n'est envoyée au navigateur.
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { resolveLocale, type LocaleParams } from '@/i18n/params';
import { Link } from '@/i18n/navigation';
import { CV_PATH } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import ContactCta from '@/components/sections/ContactCta';
import PageHeader from '@/components/ui/PageHeader';
import { BUTTON_PRIMARY, LINK_SECONDARY } from '@/components/ui/styles';
import { CareerLedger, MethodSection, ProfileCard, ProfileSection, RecommendationsSection } from './components/AboutSections';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'seo' });

  return pageMetadata({
    locale,
    path: '/propos',
    title: t('about.title'),
    description: t('about.description'),
    imageAlt: t('site.imageAlt'),
  });
}

export default async function AboutPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about_page' });

  return (
    <>
      <PageHeader
        overline={t('overline')}
        title={t('title')}
        lead={t('lead')}
        actions={
          <>
            <a href={CV_PATH} download className={BUTTON_PRIMARY}>{t('ctaCv')}</a>
            <Link href="/contact" className={LINK_SECONDARY}>{t('ctaContact')}</Link>
          </>
        }
        aside={<ProfileCard />}
      />
      <CareerLedger />
      <MethodSection />
      <ProfileSection />
      <RecommendationsSection />
      <ContactCta />
    </>
  );
}
