// "use client";

// /**
//  * @file pageErreur.tsx
//  * @description Composant global d'affichage des erreurs système (404, 500, etc.).
//  * 
//  * @architecture
//  * - Utilisé par `app/[locale]/not-found.tsx` (Mauvaise URL / 404).
//  * - Utilisé par `app/[locale]/error.tsx` (Bugs d'exécution de l'App).
//  * - Utilisé par `app/global-error.tsx` (Crash complet du Layout Racine).
//  * - Intègre une redirection automatique au bout de 5 secondes basée sur `setInterval`.
//  * - Utilise `lottie-react` pour rendre un robot d'erreur vivant et premium.
//  */

// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { Home, ArrowLeft, RefreshCw, ShieldAlert } from 'lucide-react';
// import Lottie from 'lottie-react';
// import errorAnimation from '../../public/lottis/sp_05.json';
// import { StarField } from '../projects';
// // import { StarField } from '../projects';

// interface PageErreurProps {
//     statusCode?: number | string; // Code d'erreur optionnel (404, 500)
//     title?: string; // Titre dynamique de l'erreur
//     message?: string; // Description de l'erreur
//     reset?: () => void; // Fonction passée par Next.js (Error Boundary) pour retenter le chargement
// }

// const PageErreur: React.FC<PageErreurProps> = ({
//     title = "Page Introuvable",
//     message = "Désolé, la page que vous recherchez semble s'être volatilisée dans le néant. Vous allez être redirigé vers l'accueil.",
//     reset
// }) => {
//     // Hooks de Next.js et de React
//     const router = useRouter(); // Permet la navigation programmatique (ex: rediriger l'utilisateur)
//     const [countdown, setCountdown] = useState(5); // Le compteur de secondes avant la redirection
//     const timerRef = useRef<ReturnType<typeof setInterval> | null>(null); // Référence pour stocker l'ID du timer

//     // Constante qui définit l'URL de retour en cas de crash
//     const homeUrl = '/';

//     /**
//      * @effect Démarre le minuteur (setInterval) au moment où le composant est monté à l'écran.
//      * Le retour de la fonction nettoie (clearInterval) pour éviter les fuites de mémoire 
//      * si le composant est démonté avant que la minuterie ne soit terminée.
//      */
//     useEffect(() => {
//         timerRef.current = setInterval(() => {
//             setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
//         }, 1000);

//         return () => {
//             if (timerRef.current) clearInterval(timerRef.current);
//         };
//     }, []);

//     /**
//      * @effect Écoute la valeur de `countdown`. Dès qu'elle atteint 0, on force la redirection 
//      * vers la page d'accueil via le router Next.js.
//      */
//     useEffect(() => {
//         if (countdown <= 0) {
//             router.push(homeUrl);
//         }
//     }, [countdown, homeUrl, router]);

//     /**
//      * @function handleManualReturn
//      * S'exécute quand l'utilisateur clique manuellement sur le bouton de retour à l'accueil.
//      * On tue manuellement le minuteur pour ne pas qu'il s'exécute en double plan.
//      */
//     const handleManualReturn = () => {
//         if (timerRef.current) clearInterval(timerRef.current);
//         router.push(homeUrl);
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center p-6 bg-[#030208] text-white overflow-hidden relative">
//             {/* 
//               Background Premium (Nébuleuses dorées "Void & Or")
//               Le premier a une animation "pulse" subtile pour ajouter du dynamisme.
//             */}
//             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#F0A500]/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
//             <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#F0A500]/5 rounded-full blur-[150px] pointer-events-none" />

//             {/* ── Fond Spatial Étoilé ── */}
//             <StarField />

//             {/* Conteneur principal animé de la page d'erreur */}
//             <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
//                 className="relative z-10 max-w-2xl w-full text-center"
//             >
//                 {/* 
//                   Boîte Glassmorphism : L'esthétique premium de la Fintech 
//                   `backdrop-blur-3xl` ajoute un flou massif sur ce qui se trouve derrière la boîte.
//                 */}
//                 <div className="relative bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-10 sm:p-16 border border-white/10 shadow-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">

//                     {/* Trait de lumière horizontal au sommet de la carte */}
//                     <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F0A500]/50 to-transparent" />

//                     {/* Conteneur pour le Robot (Animation Lottie) */}
//                     <motion.div
//                         initial={{ opacity: 0, scale: 0.8 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: 0.2, duration: 0.5 }}
//                         className="w-34 h-34 sm:w-64 sm:h-44 mx-auto mb-4 relative"
//                     >
//                         {/* Aura lumineuse circulaire derrière le robot pour le détacher du fond sombre */}
//                         <div className="absolute inset-0 bg-[#F0A500]/10 rounded-full blur-3xl pointer-events-none" />
//                         <Lottie
//                             animationData={errorAnimation}
//                             loop={true}
//                             className="w-full h-full relative z-10 drop-shadow-[0_0_20px_rgba(240,165,0,0.2)]"
//                         />
//                     </motion.div>

//                     <div className="space-y-6">
//                         {/* Titre dynamique (ex: "Page Introuvable" ou "Erreur Système") */}
//                         <motion.h1
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.3 }}
//                             className="text-4xl sm:text-5xl font-extrabold tracking-tight"
//                         >
//                             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0A500] to-[#FFD166] drop-shadow-[0_0_15px_rgba(240,165,0,0.3)]">
//                                 {title}
//                             </span>
//                         </motion.h1>

//                         {/* Description dynamique de l'erreur */}
//                         <motion.p
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ delay: 0.4 }}
//                             className="text-md text-gray-300 max-w-md mx-auto leading-relaxed font-light"
//                         >
//                             {message}
//                         </motion.p>

//                         {/* 
//                           Indicateur Circulaire du Compte à rebours 
//                           Combine un élément SVG <circle> avec un <motion.circle> qui "consomme" le trait SVG 
//                           en se basant sur le décompte des secondes (strokeDashoffset mathématique).
//                         */}
//                         <motion.div
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ delay: 0.5 }}
//                             className="flex items-center justify-center gap-4 py-2 px-6 mt-8 bg-black/50 rounded-full w-fit mx-auto border border-white/10"
//                         >
//                             <div className="relative w-6 h-6 flex items-center justify-center">
//                                 <svg className="absolute inset-0 w-full h-full -rotate-90">
//                                     {/* Cercle d'arrière-plan (gris) */}
//                                     <circle
//                                         cx="12"
//                                         cy="12"
//                                         r="10"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth="2"
//                                         className="text-white/10"
//                                     />
//                                     {/* Cercle d'avant-plan (doré) qui se réduit */}
//                                     <motion.circle
//                                         cx="12"
//                                         cy="12"
//                                         r="10"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth="2"
//                                         strokeDasharray="62.83" // (2 * Pi * r) = Périmètre pour un rayon de 10
//                                         initial={{ strokeDashoffset: 62.83 }}
//                                         animate={{ strokeDashoffset: 62.83 - (62.83 * (5 - countdown)) / 5 }}
//                                         transition={{ duration: 1, ease: "linear" }}
//                                         className="text-[#F0A500]"
//                                     />
//                                 </svg>
//                                 {/* Affiche le chiffre restant (5, 4, 3, 2, 1) */}
//                                 <span className="text-[10px] font-bold text-[#F0A500] absolute">{countdown}</span>
//                             </div>
//                             <span className="text-[14px] font-medium text-gray-300 uppercase tracking-widest">
//                                 Redirection auto
//                             </span>
//                         </motion.div>

//                         {/* Boutons d'action : Choix entre "Accueil", "Rafraichir" ou "Précédent" */}
//                         <motion.div
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.6 }}
//                             className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8"
//                         >
//                             {/* Bouton Primaire (Retour Manuel à l'Accueil) */}
//                             <button
//                                 onClick={handleManualReturn}
//                                 className="group relative flex items-center text-[14px] gap-3 px-8 py-4 bg-gradient-to-r from-[#F0A500] to-[#FFD166] text-black rounded-full font-bold shadow-[0_0_20px_rgba(240,165,0,0.2)] hover:shadow-[0_0_30px_rgba(240,165,0,0.4)] transition-all duration-300 overflow-hidden w-full sm:w-auto justify-center cursor-pointer"
//                             >
//                                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
//                                 <Home className="w-5 h-5 relative z-10" />
//                                 <span className="relative z-10">Retour à l'accueil</span>
//                             </button>

//                             {/* Bouton Secondaire (Dépendant de la cause de l'erreur) */}
//                             {reset ? (
//                                 // Si "reset" est fourni (cas d'erreur Next.js Error Boundary), on propose de retenter
//                                 <button
//                                     onClick={reset}
//                                     className="flex items-center justify-center text-[14px] gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 hover:border-white/30 transition-all duration-300 w-full sm:w-auto cursor-pointer"
//                                 >
//                                     <RefreshCw className="w-5 h-5 text-gray-300" />
//                                     <span>Réessayer</span>
//                                 </button>

//                             ) : (

//                                 // Si pas de reset (ex: 404), on propose de retourner à la page précédente de l'historique
//                                 <button
//                                     onClick={() => window.history.back()}
//                                     className="flex items-center justify-center text-[14px] gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 hover:border-white/30 transition-all duration-300 w-full sm:w-auto cursor-pointer"
//                                 >
//                                     <ArrowLeft className="w-5 h-5 text-gray-300" />
//                                     <span>Page précédente</span>
//                                 </button>
//                             )}

//                         </motion.div>

//                     </div>
//                 </div>

//                 {/* Footer discret "Signature Système" */}
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.9 }}
//                     className="mt-10 flex items-center justify-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest"
//                 >
//                     <ShieldAlert className="w-3 h-3" />
//                     <span>Système de Sécurité &bull; Kalvin Portfolio</span>
//                 </motion.div>

//             </motion.div>

//         </div>
//     );
// };

// export default PageErreur;















"use client";

/**
 * @file pageErreur.tsx
 * @description Composant global d'affichage des erreurs système (404, 500, etc.).
 * 
 * @architecture
 * - Utilisé par `app/[locale]/not-found.tsx` (Mauvaise URL / 404).
 * - Utilisé par `app/[locale]/error.tsx` (Bugs d'exécution de l'App).
 * - Utilisé par `app/global-error.tsx` (Crash complet du Layout Racine).
 * - Intègre une redirection automatique au bout de 5 secondes basée sur `setInterval`.
 * - Utilise `lottie-react` pour rendre un robot d'erreur vivant et premium.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { StarField } from '../projects';

/**
 * `lottie-react` et son animation JSON sont chargés à la demande.
 * Ils étaient importés statiquement : la totalité du fichier d'animation entrait
 * dans le lot livré à un visiteur qui, par définition, est déjà en difficulté.
 * L'interface s'affiche immédiatement ; le robot arrive quand il est prêt.
 */
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ MINUTERIE DE REDIRECTION
   ═══════════════════════════════════════════════════════════════════════════ */

/** Durée du compte à rebours, en secondes. */
const REDIRECT_DELAY = 5;

/** Périmètre du cercle de progression : 2 × π × r, pour r = 10. */
const RING_CIRCUMFERENCE = 62.83;

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ LIBELLÉS
   ───────────────────────────────────────────────────────────────────────────
   Toute l'interface était figée en français. Aucun hook de traduction n'est
   utilisé ici, volontairement : ce composant sert notamment `global-error.tsx`,
   qui se déclenche précisément quand le fournisseur i18n a échoué. Y appeler
   `useTranslations` provoquerait une seconde exception à l'intérieur du
   gestionnaire d'erreur.

   La langue est lue sur l'attribut `lang` du document, que les trois fichiers
   appelants posent désormais correctement.
   ═══════════════════════════════════════════════════════════════════════════ */
const UI_STRINGS = {
    fr: {
        defaultTitle: 'Page introuvable',
        defaultMessage: "Cette adresse ne correspond à aucune page du site. Elle a peut-être été déplacée, ou l'adresse comporte une erreur de frappe.",
        home: "Retour à l'accueil",
        retry: 'Réessayer',
        previous: 'Page précédente',
        redirectIn: (s: number) => `Redirection dans ${s} s`,
        cancel: 'Annuler la redirection',
        signature: 'Système de sécurité',
    },
    en: {
        defaultTitle: 'Page not found',
        defaultMessage: 'This address does not match any page on the site. It may have moved, or the address contains a typo.',
        home: 'Back to home',
        retry: 'Try again',
        previous: 'Previous page',
        redirectIn: (s: number) => `Redirecting in ${s}s`,
        cancel: 'Cancel redirect',
        signature: 'Security system',
    },
} as const;

type ErrorLocale = keyof typeof UI_STRINGS;
const FALLBACK_LOCALE: ErrorLocale = 'fr';

interface PageErreurProps {
    statusCode?: number | string; // Code d'erreur optionnel (404, 500)
    title?: string; // Titre dynamique de l'erreur
    message?: string; // Description de l'erreur
    reset?: () => void; // Fonction passée par Next.js (Error Boundary) pour retenter le chargement
}

const PageErreur: React.FC<PageErreurProps> = ({
    title,
    message,
    reset
}) => {
    // Hooks de Next.js et de React
    const router = useRouter(); // Permet la navigation programmatique (ex: rediriger l'utilisateur)
    const [countdown, setCountdown] = useState(REDIRECT_DELAY); // Le compteur de secondes avant la redirection
    const [isPaused, setIsPaused] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const [locale, setLocale] = useState<ErrorLocale>(FALLBACK_LOCALE);
    const [animationData, setAnimationData] = useState<unknown>(null);

    // Constante qui définit l'URL de retour en cas de crash
    const homeUrl = '/';

    const strings = UI_STRINGS[locale];
    const resolvedTitle = title ?? strings.defaultTitle;
    const resolvedMessage = message ?? strings.defaultMessage;

    /**
     * La présence de `reset` signifie que l'appelant est un périmètre de sécurité
     * (`error.tsx`, `global-error.tsx`) : l'utilisateur a une action à sa
     * disposition — réessayer — et l'emmener ailleurs de force la lui retire au
     * milieu de sa lecture. La redirection automatique ne concerne donc que la
     * page 404, où il n'y a rien à retenter.
     */
    const shouldAutoRedirect = !reset;

    /* ── Langue et animation, résolues après montage ────────────────────────── */
    useEffect(() => {
        const documentLocale = document.documentElement.lang;
        if (documentLocale in UI_STRINGS) setLocale(documentLocale as ErrorLocale);
    }, []);

    useEffect(() => {
        let cancelled = false;

        import('../../public/lottis/sp_05.json')
            .then((module) => { if (!cancelled) setAnimationData(module.default); })
            .catch(() => { /* Animation indisponible : l'icône de repli suffit. */ });

        return () => { cancelled = true; };
    }, []);

    /**
     * @effect Décrémente le compte à rebours, seconde par seconde.
     *
     * Un `setTimeout` par tic remplace l'ancien `setInterval` : la minuterie
     * s'arrête d'elle-même à zéro — l'intervalle précédent continuait de tourner
     * indéfiniment en écrivant 0 sur 0 — et la mise en pause devient triviale.
     */
    useEffect(() => {
        if (!shouldAutoRedirect || isCancelled || isPaused || countdown <= 0) return;

        const timeout = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timeout);
    }, [countdown, isPaused, isCancelled, shouldAutoRedirect]);

    /**
     * @effect Déclenche la redirection quand le compte atteint zéro.
     *
     * `router.replace` remplace `router.push`. C'était un piège : `push` ajoutait
     * une entrée d'historique, si bien qu'un utilisateur revenant en arrière
     * depuis l'accueil retombait sur la page d'erreur, où le compte à rebours
     * repartait pour le renvoyer à l'accueil. Le bouton « Précédent » devenait
     * inutilisable — une boucle dont on ne sort qu'en fermant l'onglet.
     */
    useEffect(() => {
        if (!shouldAutoRedirect || isCancelled || countdown > 0) return;
        router.replace(homeUrl);
    }, [countdown, isCancelled, shouldAutoRedirect, homeUrl, router]);

    /**
     * @function handleManualReturn
     * S'exécute quand l'utilisateur clique manuellement sur le bouton de retour à l'accueil.
     */
    const handleManualReturn = () => {
        setIsCancelled(true);
        router.replace(homeUrl);
    };

    /** Suspend le décompte dès que l'utilisateur interagit avec la carte. */
    const pauseCountdown = useCallback(() => setIsPaused(true), []);
    const resumeCountdown = useCallback(() => setIsPaused(false), []);

    const showCountdown = shouldAutoRedirect && !isCancelled;

    return (
        // Le traitement sombre est un choix assumé, pas un oubli : le champ
        // stellaire et l'aura dorée n'existent que sur fond de Void. La page
        // d'erreur est délibérément un lieu à part.
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#030208] text-white overflow-hidden relative">
            {/* 
              Background Premium (Nébuleuses dorées "Void & Or")
            */}
            <div aria-hidden="true" className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#F0A500]/10 rounded-full blur-[150px] pointer-events-none animate-pulse motion-reduce:animate-none" />
            <div aria-hidden="true" className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#F0A500]/5 rounded-full blur-[150px] pointer-events-none" />

            {/* ── Fond Spatial Étoilé ── */}
            <StarField />

            {/* Conteneur principal animé de la page d'erreur */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 max-w-2xl w-full text-center"
                // Toute interaction avec la carte suspend le décompte : lire,
                // cliquer ou tabuler ne doit pas se faire contre la montre.
                onPointerEnter={pauseCountdown}
                onPointerLeave={resumeCountdown}
                onFocusCapture={pauseCountdown}
            >
                {/* 
                  Boîte Glassmorphism : L'esthétique premium de la Fintech.
                  (`shadow-2xl` a été retiré : la classe arbitraire qui suivait
                  écrasait entièrement sa propriété `box-shadow`, l'ombre portée
                  n'était donc jamais rendue. Les deux ombres sont fusionnées.)
                */}
                <div className="relative bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-10 sm:p-16 border border-white/10 overflow-hidden
                                shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_40px_90px_-40px_rgba(0,0,0,0.9)]">

                    {/* Trait de lumière horizontal au sommet de la carte */}
                    <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0A500]/50 to-transparent" />

                    {/* Conteneur pour le Robot (Animation Lottie) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-[8.5rem] h-[8.5rem] sm:w-64 sm:h-44 mx-auto mb-4 relative"
                        aria-hidden="true"
                    >
                        {/* Aura lumineuse circulaire derrière le robot pour le détacher du fond sombre */}
                        <div className="absolute inset-0 bg-[#F0A500]/10 rounded-full blur-3xl pointer-events-none" />

                        {animationData ? (
                            <Lottie
                                animationData={animationData}
                                loop={true}
                                className="w-full h-full relative z-10"
                            />
                        ) : (
                            // Repli pendant le chargement — même encombrement,
                            // donc aucun décalage de mise en page.
                            <div className="w-full h-full flex items-center justify-center relative z-10">
                                <ShieldAlert className="w-14 h-14 text-[#F0A500]/40" />
                            </div>
                        )}
                    </motion.div>

                    <div className="space-y-6">
                        {/* Titre dynamique (ex: "Page Introuvable" ou "Erreur Système") */}
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#F0A500]"
                        >
                            {resolvedTitle}
                        </motion.h1>

                        {/* Description dynamique de l'erreur */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-base text-gray-300 max-w-md mx-auto leading-[1.7] font-light text-pretty"
                        >
                            {resolvedMessage}
                        </motion.p>

                        {/* 
                          Indicateur Circulaire du Compte à rebours.

                          Le décompte est désormais **annulable**. Une limite de temps
                          imposée sans moyen de l'interrompre contrevient au critère
                          WCAG 2.2.1 (« Réglage du délai ») : un utilisateur qui lit
                          lentement, ou qui utilise une aide technique, se voyait
                          emmener ailleurs au milieu de sa lecture.
                        */}
                        {showCountdown && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center justify-center gap-3 py-2 pl-5 pr-2.5 mt-8 bg-black/50 rounded-full w-fit mx-auto border border-white/10"
                            >
                                <div className="relative w-6 h-6 flex items-center justify-center" aria-hidden="true">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        {/* Cercle d'arrière-plan (gris) */}
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10" />
                                        {/* Cercle d'avant-plan (doré) qui se remplit */}
                                        <motion.circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeDasharray={RING_CIRCUMFERENCE}
                                            initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                                            animate={{ strokeDashoffset: RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * (REDIRECT_DELAY - countdown)) / REDIRECT_DELAY }}
                                            transition={{ duration: 1, ease: 'linear' }}
                                            className="text-[#F0A500]"
                                        />
                                    </svg>
                                    <span className="text-[10px] font-bold text-[#F0A500] absolute tabular-nums">{countdown}</span>
                                </div>

                                <span aria-live="polite" className="text-[13px] font-medium text-gray-300 uppercase tracking-[0.14em] tabular-nums">
                                    {strings.redirectIn(countdown)}
                                </span>

                                <button
                                    onClick={() => setIsCancelled(true)}
                                    aria-label={strings.cancel}
                                    title={strings.cancel}
                                    className="cursor-pointer p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors
                                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A500]"
                                >
                                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                            </motion.div>
                        )}

                        {/* Boutons d'action : Choix entre "Accueil", "Rafraichir" ou "Précédent" */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8"
                        >
                            {/* Bouton Primaire (Retour Manuel à l'Accueil) */}
                            <button
                                onClick={handleManualReturn}
                                className="group relative flex items-center text-[14px] gap-3 px-8 py-4 bg-[#F0A500] text-[#070510] rounded-full font-bold
                                           shadow-[0_2px_4px_rgba(0,0,0,0.3),0_16px_32px_-18px_rgba(0,0,0,0.9)]
                                           hover:brightness-[1.08] transition-[filter] duration-300 overflow-hidden w-full sm:w-auto justify-center cursor-pointer
                                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A500] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030208]"
                            >
                                <Home className="w-5 h-5 relative z-10" aria-hidden="true" />
                                <span className="relative z-10">{strings.home}</span>
                            </button>

                            {/* Bouton Secondaire (Dépendant de la cause de l'erreur) */}
                            {reset ? (
                                // Si "reset" est fourni (cas d'erreur Next.js Error Boundary), on propose de retenter
                                <button
                                    onClick={reset}
                                    className="flex items-center justify-center text-[14px] gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold
                                               hover:bg-white/10 hover:border-white/30 transition-colors duration-300 w-full sm:w-auto cursor-pointer
                                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A500] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030208]"
                                >
                                    <RefreshCw className="w-5 h-5 text-gray-300" aria-hidden="true" />
                                    <span>{strings.retry}</span>
                                </button>

                            ) : (

                                // Si pas de reset (ex: 404), on propose de retourner à la page précédente de l'historique
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex items-center justify-center text-[14px] gap-3 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold
                                               hover:bg-white/10 hover:border-white/30 transition-colors duration-300 w-full sm:w-auto cursor-pointer
                                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A500] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030208]"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-300" aria-hidden="true" />
                                    <span>{strings.previous}</span>
                                </button>
                            )}

                        </motion.div>

                    </div>
                </div>

                {/* Footer discret "Signature Système" */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-10 flex items-center justify-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-[0.18em]"
                >
                    <ShieldAlert className="w-3 h-3" aria-hidden="true" />
                    <span>{strings.signature} &bull; Kalvin Portfolio</span>
                </motion.div>

            </motion.div>

        </div>
    );
};

export default PageErreur;