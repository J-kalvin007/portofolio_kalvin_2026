/**
 * @file page.tsx (accueil)
 * @description Page d'accueil — direction « Reçu ».
 *
 * @architecture
 * Composant **serveur** : la page entière est pré-rendue au build, dans les
 * deux langues. L'ancienne version était un unique composant client (typewriter,
 * compteurs, carrousels, parallaxe, curseur personnalisé) : tout son code et
 * framer-motion étaient envoyés au navigateur. Ici, seuls trois petits îlots
 * s'exécutent côté client — l'heure locale, les galeries et l'animation des
 * schémas d'architecture.
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { resolveLocale, type LocaleParams } from '@/i18n/params';
import { pageMetadata } from '@/lib/seo';
import ContactCta from '@/components/sections/ContactCta';
import { CareerSection, HeroSection, ProjectsSection, StackSection } from './components/HomeSections';
import './components/home.css';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'seo' });

  // Titre complet : le modèle « %s | Kalvin Takoudjou » du layout produirait
  // « Accueil | Kalvin Takoudjou », qui ne dit rien du métier.
  return pageMetadata({
    locale,
    path: '',
    title: t('home.title'),
    description: t('home.description'),
    imageAlt: t('site.imageAlt'),
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  // Active le rendu statique des traductions dans les composants serveur.
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <ProjectsSection />
      <StackSection />
      <CareerSection />
      <ContactCta />
    </>
  );
}
