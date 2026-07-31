// import { useEffect, useState } from "react";


// /**
//  * @component TypewriterText
//  * @description Simule un effet de machine à écrire qui tape et efface des mots séquentiellement.
//  * @param words Tableau de chaînes de caractères à afficher (ex: ["Ingénieur", "Architecte"]).
//  */
// function TypewriterText({ words, className = '' }: { words: readonly string[]; className?: string }) {
//     const [currentWord, setCurrentWord] = useState(0);
//     const [currentChar, setCurrentChar] = useState(0);
//     const [isDeleting, setIsDeleting] = useState(false);

//     useEffect(() => {
//         const word = words[currentWord];
//         const timeout = setTimeout(() => {
//             if (!isDeleting) {
//                 if (currentChar < word.length) {
//                     setCurrentChar(currentChar + 1); // Ajoute une lettre
//                 } else {
//                     setTimeout(() => setIsDeleting(true), 2000); // Pause avant d'effacer
//                 }
//             } else {
//                 if (currentChar > 0) {
//                     setCurrentChar(currentChar - 1); // Efface une lettre
//                 } else {
//                     setIsDeleting(false); // Mot effacé, passe au suivant
//                     setCurrentWord((currentWord + 1) % words.length);
//                 }
//             }
//         }, isDeleting ? 50 : 100); // Vitesse de suppression (50ms) plus rapide que frappe (100ms)
//         return () => clearTimeout(timeout);
//     }, [currentChar, isDeleting, currentWord, words]);

//     return (
//         <span className={className}>
//             {words[currentWord].substring(0, currentChar)}
//             <span className="animate-pulse text-primary">|</span> {/* Curseur clignotant */}
//         </span>
//     );
// }


// export default TypewriterText;



























"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CADENCE DE FRAPPE
   ───────────────────────────────────────────────────────────────────────────
   Une machine à écrire crédible n'a pas un tempo constant : la frappe hésite,
   l'effacement est mécanique et rapide, et le mot terminé « respire » avant
   d'être effacé. Ces quatre constantes encodent ce phrasé.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Délai moyen entre deux lettres ajoutées (ms). */
const TYPING_SPEED = 95;

/** Délai entre deux lettres supprimées (ms) — l'effacement est toujours plus vif. */
const DELETING_SPEED = 42;

/** Temps de lecture accordé au mot une fois complètement écrit (ms). */
const HOLD_AFTER_WORD = 2000;

/** Respiration entre l'effacement complet et le mot suivant (ms). */
const PAUSE_BEFORE_NEXT_WORD = 420;

/** Amplitude de l'irrégularité humaine appliquée à la frappe (±35 %). */
const HUMAN_JITTER = 0.35;

/** En `prefers-reduced-motion`, on remplace la frappe par un cycle de mots calme (ms). */
const REDUCED_MOTION_INTERVAL = 2600;

/**
 * Applique une variation aléatoire au délai de base pour casser la régularité
 * robotique d'un `setTimeout` à intervalle fixe.
 * Appelée exclusivement côté client (dans un effet) → aucun risque d'écart
 * d'hydratation SSR/CSR.
 */
const humanizeDelay = (base: number): number =>
    Math.max(24, Math.round(base * (1 + (Math.random() * 2 - 1) * HUMAN_JITTER)));

/**
 * @component TypewriterText
 * @description Simule un effet de machine à écrire qui tape et efface des mots séquentiellement.
 * @param words Tableau de chaînes de caractères à afficher (ex: ["Ingénieur", "Architecte"]).
 *
 * @remarks Améliorations apportées sans modifier la signature ni les noms d'état :
 *  1. **Timer unique** — la pause de 2 s était auparavant un `setTimeout` imbriqué
 *     jamais nettoyé : il pouvait survivre au démontage et déclencher un
 *     `setState` sur composant démonté. La pause est désormais intégrée au délai
 *     du timer principal, lui-même nettoyé à chaque cycle.
 *  2. **Zéro CLS** — un « fantôme » invisible réserve la largeur du mot le plus
 *     long : le titre ne saute plus à chaque lettre.
 *  3. **Caret typographique** — le glyphe `|` est remplacé par un vrai curseur
 *     dimensionné en `em`, qui ne clignote qu'à l'arrêt (comportement terminal).
 *  4. **Accessibilité** — l'animation est masquée aux lecteurs d'écran, qui
 *     reçoivent la liste complète des mots une seule fois.
 */
function TypewriterText({ words, className = '' }: { words: readonly string[]; className?: string }) {
    const [currentWord, setCurrentWord] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    /* ── Préférence système : mouvement réduit ─────────────────────────────── */
    const shouldReduceMotion = useReducedMotion();

    /* ── Garde-fous & dérivés mémoïsés ─────────────────────────────────────── */

    /** Protège contre un tableau vide (l'implémentation initiale plantait dessus). */
    const safeWords = useMemo(() => (words.length > 0 ? words : ['']), [words]);

    /** Mot le plus long : sert de gabarit de réservation d'espace. */
    const longestWord = useMemo(
        () => safeWords.reduce((longest, candidate) => (candidate.length > longest.length ? candidate : longest), ''),
        [safeWords]
    );

    const word = safeWords[currentWord % safeWords.length];
    const isWordComplete = currentChar >= word.length;
    const isWordCleared = currentChar <= 0;

    /** Le curseur ne clignote qu'aux temps morts — comme un vrai terminal. */
    const isIdle = (!isDeleting && isWordComplete) || (isDeleting && isWordCleared);

    /* ═══════════════════════════════════════════════════════════════════════
       ▌ MOTEUR DE FRAPPE — un seul timer, une seule source de vérité
       ═══════════════════════════════════════════════════════════════════════ */
    useEffect(() => {
        // En mouvement réduit, le moteur est délégué à l'effet suivant.
        if (shouldReduceMotion) return;

        // Le délai encode la phase courante : frappe, pause de lecture,
        // effacement, ou respiration inter-mots.
        const delay = !isDeleting
            ? (isWordComplete ? HOLD_AFTER_WORD : humanizeDelay(TYPING_SPEED))
            : (isWordCleared ? PAUSE_BEFORE_NEXT_WORD : humanizeDelay(DELETING_SPEED));

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (!isWordComplete) {
                    setCurrentChar(currentChar + 1);          // Ajoute une lettre
                } else {
                    setIsDeleting(true);                      // Fin de lecture → on efface
                }
            } else {
                if (!isWordCleared) {
                    setCurrentChar(currentChar - 1);          // Efface une lettre
                } else {
                    setIsDeleting(false);                     // Mot effacé, passe au suivant
                    setCurrentWord((currentWord + 1) % safeWords.length);
                }
            }
        }, delay);

        return () => clearTimeout(timeout);
    }, [currentChar, isDeleting, currentWord, safeWords, shouldReduceMotion, isWordComplete, isWordCleared]);

    /* ═══════════════════════════════════════════════════════════════════════
       ▌ MODE MOUVEMENT RÉDUIT — le mot s'affiche entier et se relaie en fondu
       ═══════════════════════════════════════════════════════════════════════ */
    useEffect(() => {
        if (!shouldReduceMotion) return;

        setCurrentChar(word.length);
        setIsDeleting(false);

        const timeout = setTimeout(
            () => setCurrentWord((prev) => (prev + 1) % safeWords.length),
            REDUCED_MOTION_INTERVAL
        );

        return () => clearTimeout(timeout);
    }, [shouldReduceMotion, word, safeWords.length]);

    /* ═══════════════════════════════════════════════════════════════════════
       ▌ RENDU
       ═══════════════════════════════════════════════════════════════════════ */
    return (
        // `inline-grid` empile fantôme et texte visible dans une seule cellule :
        // la largeur est figée sur le mot le plus long → aucun saut de mise en page.
        // (Retirez `align-bottom` si votre titre a besoin d'un alignement de base différent.)
        <span className={`relative inline-grid align-bottom ${className}`}>

            {/* ── Gabarit invisible : réserve l'espace, ne se lit pas ─────────── */}
            <span
                aria-hidden="true"
                className="col-start-1 row-start-1 invisible select-none pointer-events-none"
            >
                {longestWord}
                <span className="inline-block w-[0.07em] ml-[0.09em]" />
            </span>

            {/* ── Texte animé (décoratif du point de vue de l'accessibilité) ──── */}
            <span aria-hidden="true" className="col-start-1 row-start-1">
                {word.substring(0, currentChar)}

                {/* Caret : un vrai bloc dimensionné en `em`, il suit la taille du titre.
                    Il reste plein pendant la frappe et ne clignote qu'à l'arrêt. */}
                <motion.span
                    className="inline-block w-[0.07em] h-[0.92em] ml-[0.09em] rounded-full bg-primary align-[-0.06em] will-change-[opacity]"
                    animate={isIdle && !shouldReduceMotion ? { opacity: [1, 1, 0, 0] } : { opacity: 1 }}
                    transition={
                        isIdle && !shouldReduceMotion
                            ? { duration: 1.05, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }
                            : { duration: 0.12 }
                    }
                />
            </span>

            {/* ── Contenu réel pour les technologies d'assistance ─────────────── */}
            <span className="sr-only">{safeWords.join(' · ')}</span>
        </span>
    );
}

export default TypewriterText;