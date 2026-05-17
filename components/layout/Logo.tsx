'use client';

/**
 * @file Logo.tsx
 * @description Composant graphique représentant l'identité visuelle de l'application (Monogramme "K").
 * 
 * @architecture
 * - Conçu entièrement en SVG pur pour une résolution parfaite (zéro perte de qualité).
 * - Utilise `framer-motion` pour des micro-interactions physiques (scale, rotate) au survol et au clic.
 * - S'intègre avec `next-intl` pour adapter dynamiquement la profession ("Ingénieur Logiciel" / "Software Engineer") sous le logo.
 * - Conçu pour fonctionner de pair avec les modes Dark/Light via Tailwind CSS.
 */

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

interface LogoProps {
  size?: number; // Permet de redimensionner dynamiquement le logo SVG
  showText?: boolean; // Permet de cacher le nom et la profession (ex: sur mobile)
  className?: string; // Injection de classes Tailwind personnalisées
}

export default function Logo({ size = 44, showText = true, className = '' }: LogoProps) {
  // Récupère la locale active (ex: 'fr' ou 'en')
  const locale = useLocale();

  return (
    // <Link> de next-intl pour rediriger vers la page d'accueil de la langue courante
    <Link href="/" className={`cursor-pointer group flex items-center gap-3.5 ${className}`}>
      
      {/* Conteneur principal du Monogramme animé avec framer-motion */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }} // Légère rotation dynamique au survol
        whileTap={{ scale: 0.95 }} // Effet d'enfoncement physique au clic
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(240,165,0,0.15)] group-hover:drop-shadow-[0_0_20px_rgba(240,165,0,0.4)] transition-all duration-700"
        >
          {/* Définitions des dégradés (Gradients) utilisés dans le SVG */}
          <defs>
            <linearGradient id="logo-k-gradient" x1="16" y1="12" x2="32" y2="36">
              <stop offset="0%" stopColor="#F0A500" /> {/* Or Foncé */}
              <stop offset="100%" stopColor="#FFD166" /> {/* Or Clair */}
            </linearGradient>
          </defs>

          {/* 
            Fond de l'icône (Glassmorphic Shape). 
            La classe backdrop-blur-md assure un flou sur l'arrière-plan du logo. 
          */}
          <rect
            x="1"
            y="1"
            width="46"
            height="46"
            rx="14"
            fill="url(#logo-bg-gradient)"
            stroke="url(#logo-stroke-gradient)"
            strokeWidth="1.5"
            className="transition-all duration-700 backdrop-blur-md"
          />
          
          {/* Bordure interne subtile pour accentuer l'effet 3D "Premium" */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="13"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.1"
            strokeWidth="1"
            className="group-hover:stroke-opacity-25 transition-all duration-700"
          />

          {/* Forme du 'K' - Ligne verticale (Pilier) */}
          <path
            d="M17 13V35"
            className="stroke-base-content dark:stroke-white group-hover:stroke-[#F0A500] transition-colors duration-500"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Forme du 'K' - Branche supérieure diagonale (Avec le dégradé "Or Solaire") */}
          <path
            d="M17 24L31 13"
            stroke="url(#logo-k-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(240,165,0,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(240,165,0,0.8)] transition-all duration-500"
          />
          {/* Forme du 'K' - Branche inférieure diagonale */}
          <path
            d="M21.5 22.5L31 35"
            className="stroke-base-content dark:stroke-white group-hover:stroke-[#F0A500] transition-colors duration-500"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Point d'accent (Accent dot) clignotant symbolisant l'activité/serveur */}
          <circle
            cx="31"
            cy="13"
            r="3"
            fill="#F0A500"
            className="drop-shadow-[0_0_6px_rgba(240,165,0,0.8)] animate-pulse"
          />
        </svg>

        {/* Effet "Glow" externe au survol (La lumière s'échappe de la boîte) */}
        <div className="absolute inset-0 rounded-[14px] bg-[#F0A500]/0 group-hover:bg-[#F0A500]/15 blur-xl transition-all duration-700 -z-10" />
      </motion.div>

      {/* Texte associé au logo (Nom et Titre) */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="text-[22px] font-extrabold tracking-tight text-base-content leading-none group-hover:text-primary transition-colors duration-500 drop-shadow-sm">
            Kalvin
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 leading-none mt-1.5 group-hover:text-primary transition-colors duration-500">
            {locale === 'fr' ? 'Ingénieur Logiciel' : 'Software Engineer'}
          </span>
        </div>
      )}
    </Link>
  );
}

/**
 * @function LogoIcon
 * @description Version minimale (icône uniquement) du logo. 
 * Utilisée pour des cas très spécifiques comme des marqueurs ou des très petits espaces (favicon fallback).
 */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
    >
      <rect x="0" y="0" width="48" height="48" rx="14" fill="#070510" />
      <path d="M16 12V36" stroke="#F0ECD8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M16 24L32 12" stroke="#F0A500" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M22 22L32 36" stroke="#F0ECD8" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="32" cy="12" r="3" fill="#F0A500" />
    </svg>
  );
}
