import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import ProjetsPageClient from './components/page.client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.projects' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}/projets`,
    }
  };
}

export default function ProjetsPage() {
  return <ProjetsPageClient />;
}
