import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import HomePageClient from './page.client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.home' });
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
    }
  };
}

export default function HomePage() {
  return <HomePageClient />;
}