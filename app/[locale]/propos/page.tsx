import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { resolveLocale, type LocaleParams } from '@/i18n/params';
import AboutPageClient from './components/page.client';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'seo.about' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}/propos`,
    },
  };
}

export default function AboutPage() {
  return <AboutPageClient />;
}
