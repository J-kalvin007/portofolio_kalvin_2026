import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import AboutPageClient from './page.client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.about' });
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}/propos`,
    }
  };
}

export default function AboutPage() {
  return <AboutPageClient />;
}
