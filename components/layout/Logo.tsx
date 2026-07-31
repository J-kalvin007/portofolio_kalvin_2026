// 'use client';

// /**
//  * @file Logo.tsx
//  * @description Composant graphique représentant l'identité visuelle de l'application (Monogramme "K").
//  * 
//  * @architecture
//  * - Conçu entièrement en SVG pur pour une résolution parfaite (zéro perte de qualité).
//  * - Utilise `framer-motion` pour des micro-interactions physiques (scale, rotate) au survol et au clic.
//  * - S'intègre avec `next-intl` pour adapter dynamiquement la profession ("Ingénieur Logiciel" / "Software Engineer") sous le logo.
//  * - Conçu pour fonctionner de pair avec les modes Dark/Light via Tailwind CSS.
//  */

// import { motion } from 'framer-motion';
// import { Link } from '@/i18n/navigation';
// import { useLocale } from 'next-intl';

// interface LogoProps {
//   size?: number; // Permet de redimensionner dynamiquement le logo SVG
//   showText?: boolean; // Permet de cacher le nom et la profession (ex: sur mobile)
//   className?: string; // Injection de classes Tailwind personnalisées
// }

// export default function Logo({ size = 44, showText = true, className = '' }: LogoProps) {
//   // Récupère la locale active (ex: 'fr' ou 'en')
//   const locale = useLocale();

//   return (
//     // <Link> de next-intl pour rediriger vers la page d'accueil de la langue courante
//     <Link href="/" className={`cursor-pointer group flex items-center gap-3.5 ${className}`}>

//       {/* Conteneur principal du Monogramme animé avec framer-motion */}
//       <motion.div
//         whileHover={{ scale: 1.05, rotate: 2 }} // Légère rotation dynamique au survol
//         whileTap={{ scale: 0.95 }} // Effet d'enfoncement physique au clic
//         className="relative"
//         style={{ width: size, height: size }}
//       >
//         <svg
//           viewBox="0 0 48 48"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//           className="w-full h-full drop-shadow-[0_0_12px_rgba(240,165,0,0.15)] group-hover:drop-shadow-[0_0_20px_rgba(240,165,0,0.4)] transition-all duration-700"
//         >
//           {/* Définitions des dégradés (Gradients) utilisés dans le SVG */}
//           <defs>
//             <linearGradient id="logo-k-gradient" x1="16" y1="12" x2="32" y2="36">
//               <stop offset="0%" stopColor="#F0A500" /> {/* Or Foncé */}
//               <stop offset="100%" stopColor="#FFD166" /> {/* Or Clair */}
//             </linearGradient>
//           </defs>

//           {/* 
//             Fond de l'icône (Glassmorphic Shape). 
//             La classe backdrop-blur-md assure un flou sur l'arrière-plan du logo. 
//           */}
//           <rect
//             x="1"
//             y="1"
//             width="46"
//             height="46"
//             rx="14"
//             fill="url(#logo-bg-gradient)"
//             stroke="url(#logo-stroke-gradient)"
//             strokeWidth="1.5"
//             className="transition-all duration-700 backdrop-blur-md"
//           />

//           {/* Bordure interne subtile pour accentuer l'effet 3D "Premium" */}
//           <rect
//             x="2"
//             y="2"
//             width="44"
//             height="44"
//             rx="13"
//             fill="none"
//             stroke="#FFFFFF"
//             strokeOpacity="0.1"
//             strokeWidth="1"
//             className="group-hover:stroke-opacity-25 transition-all duration-700"
//           />

//           {/* Forme du 'K' - Ligne verticale (Pilier) */}
//           <path
//             d="M17 13V35"
//             className="stroke-base-content dark:stroke-white group-hover:stroke-[#F0A500] transition-colors duration-500"
//             strokeWidth="3.5"
//             strokeLinecap="round"
//           />
//           {/* Forme du 'K' - Branche supérieure diagonale (Avec le dégradé "Or Solaire") */}
//           <path
//             d="M17 24L31 13"
//             stroke="url(#logo-k-gradient)"
//             strokeWidth="3.5"
//             strokeLinecap="round"
//             className="drop-shadow-[0_0_8px_rgba(240,165,0,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(240,165,0,0.8)] transition-all duration-500"
//           />
//           {/* Forme du 'K' - Branche inférieure diagonale */}
//           <path
//             d="M21.5 22.5L31 35"
//             className="stroke-base-content dark:stroke-white group-hover:stroke-[#F0A500] transition-colors duration-500"
//             strokeWidth="3.5"
//             strokeLinecap="round"
//           />

//           {/* Point d'accent (Accent dot) clignotant symbolisant l'activité/serveur */}
//           <circle
//             cx="31"
//             cy="13"
//             r="3"
//             fill="#F0A500"
//             className="drop-shadow-[0_0_6px_rgba(240,165,0,0.8)] animate-pulse"
//           />
//         </svg>

//         {/* Effet "Glow" externe au survol (La lumière s'échappe de la boîte) */}
//         <div className="absolute inset-0 rounded-[14px] bg-[#F0A500]/0 group-hover:bg-[#F0A500]/15 blur-xl transition-all duration-700 -z-10" />
//       </motion.div>

//       {/* Texte associé au logo (Nom et Titre) */}
//       {showText && (
//         <div className="flex flex-col justify-center">
//           <span className="text-[22px] font-extrabold tracking-tight text-base-content leading-none group-hover:text-primary transition-colors duration-500 drop-shadow-sm">
//             Kalvin
//           </span>
//           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 leading-none mt-1.5 group-hover:text-primary transition-colors duration-500">
//             {locale === 'fr' ? 'Ingénieur Logiciel' : 'Software Engineer'}
//           </span>
//         </div>
//       )}
//     </Link>
//   );
// }

// /**
//  * @function LogoIcon
//  * @description Version minimale (icône uniquement) du logo. 
//  * Utilisée pour des cas très spécifiques comme des marqueurs ou des très petits espaces (favicon fallback).
//  */
// export function LogoIcon({ size = 32 }: { size?: number }) {
//   return (
//     <svg
//       viewBox="0 0 48 48"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       style={{ width: size, height: size }}
//     >
//       <rect x="0" y="0" width="48" height="48" rx="14" fill="#070510" />
//       <path d="M16 12V36" stroke="#F0ECD8" strokeWidth="3.5" strokeLinecap="round" />
//       <path d="M16 24L32 12" stroke="#F0A500" strokeWidth="3.5" strokeLinecap="round" />
//       <path d="M22 22L32 36" stroke="#F0ECD8" strokeWidth="3.5" strokeLinecap="round" />
//       <circle cx="32" cy="12" r="3" fill="#F0A500" />
//     </svg>
//   );
// }













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
 *
 * @remarks **Correctif majeur.** Le `<rect>` de fond référençait deux serveurs de
 * peinture — `url(#logo-bg-gradient)` et `url(#logo-stroke-gradient)` — qui
 * n'étaient définis nulle part : le bloc `<defs>` ne contenait que
 * `logo-k-gradient`. Une référence de peinture non résolue équivaut à `none` :
 * **la plaque de fond et sa bordure n'étaient tout simplement pas rendues.**
 * Le monogramme flottait sur le vide depuis le départ. Les deux dégradés
 * manquants sont maintenant définis.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useId } from 'react';
import { useLocale } from 'next-intl';

interface LogoProps {
  size?: number; // Permet de redimensionner dynamiquement le logo SVG
  showText?: boolean; // Permet de cacher le nom et la profession (ex: sur mobile)
  className?: string; // Injection de classes Tailwind personnalisées
}

export default function Logo({ size = 44, showText = true, className = '' }: LogoProps) {
  // Récupère la locale active (ex: 'fr' ou 'en')
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();

  /**
   * Identifiants uniques par instance.
   * Les `id` de `<defs>` sont globaux au document : deux logos affichés
   * simultanément — celui de la barre de navigation et celui du pied de page —
   * déclaraient les mêmes `id`. Le navigateur ne conserve que la première
   * définition, et toute modification du logo du haut se répercutait sur celui
   * du bas. `useId` élimine la collision.
   */
  const uid = useId().replace(/[:]/g, '');
  const bgGradientId = `logo-bg-${uid}`;
  const strokeGradientId = `logo-stroke-${uid}`;
  const kGradientId = `logo-k-${uid}`;

  const roleLabel = locale === 'fr' ? 'Ingénieur Logiciel' : 'Software Engineer';
  const homeLabel = locale === 'fr' ? "Kalvin — retour à l'accueil" : 'Kalvin — back to home';

  return (
    // <Link> de next-intl pour rediriger vers la page d'accueil de la langue courante
    // `aria-label` indispensable : lorsque `showText` vaut `false` (barre de
    // navigation réduite au défilement), le lien n'avait plus aucun nom
    // accessible — un lecteur d'écran annonçait « lien » sans autre indication.
    <Link href="/" aria-label={homeLabel} className={`cursor-pointer group flex items-center gap-3.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-base-100 ${className}`}>

      {/* Conteneur principal du Monogramme animé avec framer-motion */}
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { scale: 1.05, rotate: 2 }} // Légère rotation dynamique au survol
        whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }} // Effet d'enfoncement physique au clic
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
          className="w-full h-full transition-[filter] duration-700"
        >
          {/* Définitions des dégradés (Gradients) utilisés dans le SVG */}
          <defs>
            {/* Plaque de fond — encre profonde, verticale, très resserrée.
                Ce dégradé était référencé sans exister. */}
            <linearGradient id={bgGradientId} x1="24" y1="1" x2="24" y2="47" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--base-200)" />
              <stop offset="100%" stopColor="var(--base-300)" />
            </linearGradient>

            {/* Bordure — une arête lumineuse en haut, qui s'éteint vers le bas.
                Ce dégradé était référencé sans exister lui non plus. */}
            <linearGradient id={strokeGradientId} x1="24" y1="1" x2="24" y2="47" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.55" />
              <stop offset="55%" stopColor="var(--primary)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.06" />
            </linearGradient>

            {/* Branche dorée du K. Les arrêts passent par les variables de thème :
                le logo suivait l'Or Solaire du mode sombre (#F0A500) même en mode
                clair, où la couleur de marque est l'Or Impérial (#C8900A). */}
            <linearGradient id={kGradientId} x1="16" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>

          {/* 
            Fond de l'icône.
            (`backdrop-blur-md` a été retiré : `backdrop-filter` ne s'applique pas
            aux formes SVG, la classe n'avait aucun effet.)
          */}
          <rect
            x="1"
            y="1"
            width="46"
            height="46"
            rx="14"
            fill={`url(#${bgGradientId})`}
            stroke={`url(#${strokeGradientId})`}
            strokeWidth="1.5"
            className="transition-all duration-700"
          />

          {/* Bordure interne subtile pour accentuer l'effet 3D "Premium".
              `stroke-opacity` n'existe pas comme utilitaire Tailwind : la classe
              `group-hover:stroke-opacity-25` ne produisait rien. L'opacité est
              désormais portée par l'attribut SVG, animé en CSS. */}
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
            className="transition-[stroke-opacity] duration-700 group-hover:[stroke-opacity:0.25]"
          />

          {/* Forme du 'K' - Ligne verticale (Pilier) */}
          <path
            d="M17 13V35"
            className="stroke-base-content group-hover:stroke-primary transition-colors duration-500"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Forme du 'K' - Branche supérieure diagonale (Avec le dégradé "Or Solaire") */}
          <path
            d="M17 24L31 13"
            stroke={`url(#${kGradientId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Forme du 'K' - Branche inférieure diagonale */}
          <path
            d="M21.5 22.5L31 35"
            className="stroke-base-content group-hover:stroke-primary transition-colors duration-500"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Point d'accent symbolisant l'activité/serveur.
              La pulsation permanente est neutralisée en `prefers-reduced-motion` :
              un élément qui clignote sans fin dans la barre de navigation est
              présent sur chaque page, à chaque instant. */}
          <circle
            cx="31"
            cy="13"
            r="3"
            className="fill-primary animate-pulse motion-reduce:animate-none"
          />
        </svg>
      </motion.div>

      {/* Texte associé au logo (Nom et Titre) */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="text-[22px] font-extrabold tracking-[-0.03em] text-base-content leading-none group-hover:text-primary transition-colors duration-500">
            Kalvin
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 leading-none mt-1.5 group-hover:text-primary transition-colors duration-500">
            {roleLabel}
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
 *
 * @remarks Les couleurs restent volontairement en dur : cette variante sert de
 * repli hors application (favicon, marqueur, aperçu), là où les variables CSS
 * du thème ne sont pas disponibles.
 */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Kalvin"
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