/**
 * @file layout.tsx
 * @description Layout racine (Root Layout) de l'application Next.js (portée locale).
 * 
 * @architecture
 * - Définit le shell HTML/Body de base pour l'application.
 * - Configure la génération dynamique des balises SEO (Metadata) en fonction de la langue.
 * - Initialise les polices de caractères Google Fonts optimisées (`Inter`, `Playfair Display`, `JetBrains Mono`).
 * - Encapsule l'application dans `NextIntlClientProvider` pour fournir les traductions aux composants enfants.
 * - Injecte un script "anti-FOUC" (Flash of Unstyled Content) pour le mode sombre.
 */

import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import '../globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ThemeInitializer from '@/components/layout/ThemeInitializer';

/* ═══════════════════════════════════════════════
   CONFIGURATION DES POLICES (Google Fonts)
   Pourquoi `display: 'swap'` : Garantit que le texte reste visible pendant le chargement de la police.
   ═══════════════════════════════════════════════ */

// Police principale pour les textes courants (Lisibilité optimale)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Police à empattements pour les grands titres (Esthétique Luxe / Premium)
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

// Police monospace pour les extraits de code et les badges techniques
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

/**
 * @function generateMetadata
 * @description Génère dynamiquement les balises `<meta>` pour le SEO et le partage social (OpenGraph, Twitter).
 * @param params Contient la locale ('fr' ou 'en') provenant de l'URL.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  const isFr = locale === 'fr';

  // Textes SEO traduits dynamiquement
  const title = isFr ? 'Kalvin Takoudjou — Ingénieur Logiciel & Architecte Web' : 'Kalvin Takoudjou — Software Engineer & Web Architect';
  const description = isFr
    ? "Portfolio officiel de Kalvin Takoudjou, Ingénieur Logiciel spécialisé dans la création d'applications web ultra-premium, fintech et architectures full-stack performantes."
    : "Official portfolio of Kalvin Takoudjou, Software Engineer specialized in creating ultra-premium web applications, fintech solutions, and high-performance full-stack architectures.";
  const keywords = [
    'Kalvin Takoudjou', 'Software Engineer', 'Ingénieur Logiciel', 'Développeur Web', 'Full-Stack',
    'React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Fintech', 'Luxe', 'Premium Web Design', 'Architecte Web', 'Togo', 'Lomé'
  ];

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: title,
      template: '%s | Kalvin Takoudjou', // Modèle utilisé par les sous-pages (ex: "Contact | Kalvin Takoudjou")
    },
    description,
    keywords,
    authors: [{ name: 'Kalvin Takoudjou', url: 'https://github.com/J-kalvin007' }],
    creator: 'Kalvin Takoudjou',
    publisher: 'Kalvin Takoudjou',
    formatDetection: { email: false, address: false, telephone: false }, // Empêche iOS de transformer les textes en liens moches
    icons: {
      icon: '/logo/kal_logo_01.png',
      shortcut: '/logo/kal_logo_01.png',
      apple: '/logo/kal_logo_01.png',
    },
    // Configuration OpenGraph (Pour l'aperçu sur LinkedIn, WhatsApp, Facebook, etc.)
    openGraph: {
      type: 'website',
      locale: isFr ? 'fr_FR' : 'en_US',
      alternateLocale: isFr ? ['en_US'] : ['fr_FR'],
      title,
      description,
      siteName: 'Kalvin Portfolio',
      images: [{
        url: '/logo/kal_logo_01.png',
        width: 1200,
        height: 630,
        alt: 'Kalvin Takoudjou - Software Engineer',
      }],
    },
    // Configuration Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo/kal_logo_01.png'],
    },
    // Instructions pour les robots d'indexation (GoogleBot)
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * @function generateStaticParams
 * @description Indique à Next.js quelles langues doivent être pré-rendues statiquement lors du build.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * @component LocaleLayout
 * Le véritable point d'entrée visuel de l'application.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validation de sécurité : Si la langue de l'URL n'est pas supportée, on lève une erreur 404
  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound();
  }

  // Permet d'activer les API statiques next-intl dans ce layout Server Component
  setRequestLocale(locale);

  // Charge les dictionnaires JSON
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning // Nécessaire car le script thème (ci-dessous) modifie le HTML avant l'hydratation React
      className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* 
          Script Injecté : Anti-FOUC (Flash of Unstyled Content) 
          S'exécute de façon synchrone et bloquante avant le rendu du body.
          Vérifie le localStorage et force le mode sombre si nécessaire.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme') || 'system';
                  var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (d) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Fournisseur de contexte pour la traduction */}
        <NextIntlClientProvider messages={messages}>
          <ThemeInitializer />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
