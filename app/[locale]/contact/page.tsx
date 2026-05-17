import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import ContactPageClient from './components/page.client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.contact' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}/contact`,
    }
  };
}

export default function ContactPage() {
  return <ContactPageClient />;
}
