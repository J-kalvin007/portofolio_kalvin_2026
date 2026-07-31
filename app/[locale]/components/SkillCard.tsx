// import { Code2 } from "lucide-react";
// import Image from "next/image";


// /**
//  * @component SkillCard
//  * @description Carte de compétence individuelle affichant une icône, le nom et le niveau.
//  * Intègre un effet complexe de reflet métallique (Sweep Glare) au survol.
//  */
// const SkillCard = ({ skill, tSkills }: { skill: any; tSkills: any }) => (
//     <div className="relative group w-[280px] sm:w-[320px] p-5 sm:p-6 rounded-[2.5rem] bg-gradient-to-b from-white/40 to-white/10 dark:from-white/[0.08] dark:to-transparent backdrop-blur-3xl border border-white/40 dark:border-white/[0.08] hover:border-primary/50 dark:hover:border-primary/30 transition-all duration-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_0_40px_-10px_var(--glow-color-strong)] overflow-hidden">

//         {/* Lumière ambiante interne & Reflet oblique (Sweep Glare) */}
//         <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
//         <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
//             <div className="absolute top-0 -left-[100%] w-1/2 h-full skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
//         </div>

//         <div className="relative z-10 flex items-center gap-5 sm:gap-6">
//             {/* Conteneur de l'icône */}
//             <div className="relative flex items-center justify-center shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.25rem] bg-white/60 dark:bg-white/[0.02] border border-white/60 dark:border-white/[0.05] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:bg-white/90 dark:group-hover:bg-white/[0.08] transition-colors duration-700 overflow-hidden">
//                 {/* Halo de contraste derrière l'icône (utile si l'icône est noire en mode sombre) */}
//                 <div className="absolute inset-0 bg-transparent dark:bg-white/[0.15] opacity-0 dark:opacity-100 rounded-full blur-xl pointer-events-none" />

//                 {skill.icon ? (
//                     <Image
//                         src={skill.icon}
//                         alt={skill.name}
//                         width={40}
//                         height={40}
//                         className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
//                     />
//                 ) : (
//                     <Code2 className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 text-primary drop-shadow-sm" />
//                 )}
//             </div>

//             {/* Textes (Nom + Niveau) */}
//             <div className="flex flex-col justify-center">
//                 <h4 className="font-bold text-lg sm:text-xl text-base-content/90 group-hover:text-primary transition-colors duration-300">
//                     {skill.name}
//                 </h4>
//                 <span className="text-[10px] sm:text-[11px] font-bold text-base-content/50 uppercase tracking-[0.25em] mt-1.5">
//                     {/* Traduction dynamique du niveau de compétence */}
//                     {skill.level >= 5 ? tSkills('expert') : skill.level === 4 ? tSkills('advanced') : tSkills('intermediate')}
//                 </span>
//             </div>
//         </div>
//     </div>
// );

// export default SkillCard;

























"use client";

import { Code2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ PHYSIQUE DE LA CARTE
   ───────────────────────────────────────────────────────────────────────────
   La carte se comporte comme une plaque légèrement satinée posée sous une
   source lumineuse unique : elle s'incline vers le curseur et un reflet
   spéculaire suit le pointeur. Tout passe par des variables CSS écrites
   directement sur le nœud DOM → aucun `setState`, donc aucun re-rendu, même
   avec plusieurs dizaines de cartes dupliquées dans le marquee.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Amplitude maximale de l'inclinaison, en degrés. Au-delà, l'effet devient un gadget. */
const MAX_TILT_DEG = 5.5;

/** Nombre de segments de la jauge de niveau (échelle `skill.level` : 1 → 5). */
const LEVEL_SEGMENTS = [1, 2, 3, 4, 5] as const;

/**
 * @component SkillCard
 * @description Carte de compétence individuelle affichant une icône, le nom et le niveau.
 * Intègre un effet complexe de reflet métallique (Sweep Glare) au survol.
 *
 * @remarks Le niveau, auparavant réduit à un simple mot, est désormais aussi
 * lisible d'un coup d'œil grâce à une jauge à 5 segments — l'information est
 * quantitative, elle mérite une forme quantitative.
 */
const SkillCard = ({ skill, tSkills }: { skill: any; tSkills: any }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const shouldReduceMotion = useReducedMotion();

    /* ── Suivi du pointeur : inclinaison + position du reflet ───────────────── */
    const handlePointerMove = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            const node = cardRef.current;

            // Souris uniquement : sur écran tactile, l'inclinaison n'a pas de sens
            // et le `pointermove` du scroll la ferait vibrer.
            if (!node || shouldReduceMotion || event.pointerType !== "mouse") return;

            const bounds = node.getBoundingClientRect();
            const relativeX = (event.clientX - bounds.left) / bounds.width;   // 0 → 1
            const relativeY = (event.clientY - bounds.top) / bounds.height;   // 0 → 1

            // Position du reflet spéculaire, en pourcentage.
            node.style.setProperty("--pointer-x", `${relativeX * 100}%`);
            node.style.setProperty("--pointer-y", `${relativeY * 100}%`);

            // Inclinaison : le haut s'éloigne quand le curseur descend (rotateX négatif).
            node.style.setProperty("--tilt-x", `${(0.5 - relativeY) * MAX_TILT_DEG * 2}deg`);
            node.style.setProperty("--tilt-y", `${(relativeX - 0.5) * MAX_TILT_DEG * 2}deg`);
        },
        [shouldReduceMotion]
    );

    /** Retour à plat, en douceur, dès que le pointeur quitte la carte. */
    const handlePointerLeave = useCallback(() => {
        const node = cardRef.current;
        if (!node) return;

        node.style.setProperty("--tilt-x", "0deg");
        node.style.setProperty("--tilt-y", "0deg");
    }, []);

    /** Libellé du niveau — logique de traduction strictement identique à l'origine. */
    const levelLabel =
        skill.level >= 5 ? tSkills('expert') : skill.level === 4 ? tSkills('advanced') : tSkills('intermediate');

    return (
        <div
            ref={cardRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            style={{
                // Valeurs de repli : carte à plat, reflet centré.
                // En `prefers-reduced-motion`, `handlePointerMove` sort immédiatement :
                // les variables restent à 0deg et la transformation est neutre.
                "--pointer-x": "50%",
                "--pointer-y": "50%",
                "--tilt-x": "0deg",
                "--tilt-y": "0deg",
                transform: "perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))",
                transformStyle: "preserve-3d",
            } as React.CSSProperties}
            /* Rayon extérieur (2rem) = rayon intérieur (1.15rem) + padding (1.25rem) :
               les arrondis sont concentriques, l'œil ne détecte aucune tension. */
            className="relative group w-[280px] sm:w-[320px] p-5 sm:p-6 rounded-[2rem]
                       bg-base-100/70 dark:bg-white/[0.035] backdrop-blur-xl
                       border border-base-content/[0.07] dark:border-white/[0.07]
                       hover:border-primary/40 dark:hover:border-primary/30
                       shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]
                       dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_16px_40px_-20px_rgba(0,0,0,0.7)]
                       hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_2px_4px_rgba(0,0,0,0.04),0_24px_48px_-20px_var(--glow-color-strong)]
                       transition-[transform,border-color,box-shadow] duration-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                       motion-reduce:transform-none motion-reduce:transition-none
                       overflow-hidden will-change-transform"
        >
            {/* ── Reflet spéculaire ancré sur le curseur ─────────────────────── */}
            <div
                aria-hidden="true"
                style={{
                    background:
                        "radial-gradient(200px circle at var(--pointer-x) var(--pointer-y), var(--glow-color-strong, rgba(255,255,255,0.28)), transparent 62%)",
                }}
                /* `soft-light` en clair (teinte sans surexposer), `plus-lighter` en sombre (vrai halo). */
                className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-30 dark:group-hover:opacity-[0.22]
                           transition-opacity duration-500 pointer-events-none
                           mix-blend-soft-light dark:mix-blend-plus-lighter"
            />

            {/* ── Balayage oblique (Sweep Glare) — plus lent, plus fin, plus cher ── */}
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                <div className="absolute top-0 -left-[120%] w-1/3 h-full skew-x-[-22deg]
                                bg-gradient-to-r from-transparent via-white/50 dark:via-white/[0.09] to-transparent
                                group-hover:left-[220%] transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]
                                motion-reduce:hidden" />
            </div>

            {/* ── Filet lumineux supérieur : matérialise l'arête de la plaque ── */}
            <div
                aria-hidden="true"
                className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent
                           opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            />

            <div className="relative z-10 flex items-center gap-5 sm:gap-6">

                {/* ── Socle de l'icône ───────────────────────────────────────── */}
                <div className="relative flex items-center justify-center shrink-0
                                w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-[1.15rem]
                                bg-base-200/60 dark:bg-white/[0.04]
                                border border-base-content/[0.06] dark:border-white/[0.06]
                                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
                                group-hover:bg-base-100 dark:group-hover:bg-white/[0.07]
                                transition-colors duration-500 overflow-hidden">

                    {/* Halo de contraste derrière l'icône (utile si l'icône est noire en mode sombre) */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-transparent dark:bg-white/[0.15] opacity-0 dark:opacity-100 rounded-full blur-xl pointer-events-none"
                    />

                    {skill.icon ? (
                        <Image
                            src={skill.icon}
                            alt={skill.name}
                            width={40}
                            height={40}
                            className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 object-contain
                                       group-hover:scale-[1.08] group-hover:-rotate-3
                                       transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                                       motion-reduce:transform-none
                                       drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                        />
                    ) : (
                        <Code2 className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 text-primary drop-shadow-sm" />
                    )}
                </div>

                {/* ── Nom + niveau ───────────────────────────────────────────── */}
                <div className="flex flex-col justify-center min-w-0">
                    <h4 className="font-bold text-lg sm:text-xl tracking-[-0.015em] truncate
                                   text-base-content/90 group-hover:text-primary transition-colors duration-300">
                        {skill.name}
                    </h4>

                    {/* Jauge de niveau : l'information est graduée, sa forme l'est aussi. */}
                    <div className="mt-2.5 flex items-center gap-2.5">
                        <div aria-hidden="true" className="flex items-center gap-[3px]">
                            {LEVEL_SEGMENTS.map((segment) => (
                                <span
                                    key={segment}
                                    style={{ transitionDelay: `${segment * 45}ms` }}
                                    className={`h-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${segment <= skill.level
                                            ? 'w-4 bg-primary/70 group-hover:bg-primary group-hover:w-5'
                                            : 'w-2 bg-base-content/15 dark:bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>

                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em]
                                         text-base-content/45 group-hover:text-base-content/70 transition-colors duration-300">
                            {/* Traduction dynamique du niveau de compétence */}
                            {levelLabel}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillCard;