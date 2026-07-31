// import { motion } from "framer-motion";
// import SkillCard from "./SkillCard";



// /**
//  * @component MarqueeRow
//  * @description Ligne défilante à l'infini (Carrousel Marquee).
//  * Duplique les éléments pour donner l'illusion d'une boucle infinie. Se met en pause au survol.
//  */
// const MarqueeRow = ({ skills, reverse = false, speed = 40, tSkills }: { skills: any[], reverse?: boolean, speed?: number, tSkills: any }) => {
//     const duplicatedSkills = [...skills, ...skills, ...skills, ...skills]; // x4 pour s'assurer de couvrir tout l'écran

//     return (
//         <div className="flex overflow-hidden group w-full relative py-2">
//             {/* Masques de dégradé sur les bords pour que les cartes disparaissent en douceur */}
//             <div className="absolute inset-y-0 left-0 w-16 sm:w-48 bg-gradient-to-r from-base-100 to-transparent z-10 pointer-events-none" />
//             <div className="absolute inset-y-0 right-0 w-16 sm:w-48 bg-gradient-to-l from-base-100 to-transparent z-10 pointer-events-none" />

//             {/* Le conteneur animé par framer-motion */}
//             <motion.div
//                 animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
//                 transition={{ ease: "linear", duration: speed, repeat: Infinity }}
//                 className="flex flex-shrink-0 w-max gap-4 sm:gap-6 px-2 sm:px-3 hover:[animation-play-state:paused]"
//             >
//                 {duplicatedSkills.map((skill, index) => (
//                     <SkillCard key={`${skill.name}-${index}`} skill={skill} tSkills={tSkills} />
//                 ))}
//             </motion.div>
//         </div>
//     );
// };

// export default MarqueeRow;


































"use client";

import { useCallback, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import SkillCard from "./SkillCard";

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ MÉCANIQUE DU RAIL
   ───────────────────────────────────────────────────────────────────────────
   La piste est pilotée image par image plutôt que par une animation
   déclarative. C'est la seule façon d'obtenir une pause réelle : `hover:
   [animation-play-state:paused]` ne fonctionne que sur les animations CSS et
   n'avait donc aucun effet sur une piste animée par Framer Motion.
   Bénéfice secondaire : le rail ne s'arrête pas net, il décélère — un rail
   chargé a de l'inertie.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Amplitude du cycle, en % de la largeur de piste. 4 copies → −50 % est un raccord invisible. */
const LOOP_SPAN = 50;

/** Raideur du lissage vitesse pleine ↔ arrêt (plus haut = arrêt plus sec). */
const SPEED_DAMPING = 4.5;

/** Delta maximal pris en compte (ms) : évite le bond visuel au retour d'un onglet inactif. */
const MAX_FRAME_DELTA = 64;

/**
 * Ramène la position dans l'intervalle ]−50 % ; 0 %], seul segment où le
 * raccord de la boucle est invisible.
 */
const wrapLoopPosition = (value: number): number =>
    (((value % LOOP_SPAN) + LOOP_SPAN) % LOOP_SPAN) - LOOP_SPAN;

/**
 * @component MarqueeRow
 * @description Ligne défilante à l'infini (Carrousel Marquee).
 * Duplique les éléments pour donner l'illusion d'une boucle infinie. Se met en pause au survol.
 */
const MarqueeRow = ({ skills, reverse = false, speed = 40, tSkills }: { skills: any[], reverse?: boolean, speed?: number, tSkills: any }) => {
    const duplicatedSkills = [...skills, ...skills, ...skills, ...skills]; // x4 pour s'assurer de couvrir tout l'écran

    const shouldReduceMotion = useReducedMotion();

    /* ── État d'animation (hors React : aucun re-rendu par image) ──────────── */
    const baseX = useMotionValue(-LOOP_SPAN);
    const translateX = useTransform(baseX, (value) => `${value}%`);

    /** Vitesse courante et vitesse visée, exprimées en fraction de la vitesse nominale. */
    const currentSpeedFactor = useRef(1);
    const targetSpeedFactor = useRef(1);

    useAnimationFrame((_timestamp, delta) => {
        if (shouldReduceMotion) return;

        const elapsedSeconds = Math.min(delta, MAX_FRAME_DELTA) / 1000;

        // Lissage exponentiel : la piste glisse jusqu'à l'arrêt au lieu de se figer.
        currentSpeedFactor.current +=
            (targetSpeedFactor.current - currentSpeedFactor.current) * Math.min(1, elapsedSeconds * SPEED_DAMPING);

        // Immobilisation franche sous le seuil de perception, pour économiser le GPU.
        if (Math.abs(targetSpeedFactor.current - currentSpeedFactor.current) < 0.001) {
            currentSpeedFactor.current = targetSpeedFactor.current;
        }
        if (currentSpeedFactor.current === 0) return;

        // `speed` conserve exactement sa sémantique d'origine : secondes par demi-cycle.
        const distance = (LOOP_SPAN / speed) * elapsedSeconds * currentSpeedFactor.current;
        baseX.set(wrapLoopPosition(baseX.get() + (reverse ? distance : -distance)));
    });

    /** Survol souris et focus clavier suspendent tous deux le défilement. */
    const pauseTrack = useCallback(() => { targetSpeedFactor.current = 0; }, []);
    const resumeTrack = useCallback(() => { targetSpeedFactor.current = 1; }, []);

    /* ═══════════════════════════════════════════════════════════════════════
       ▌ VARIANTE MOUVEMENT RÉDUIT
       Pas de défilement automatique : une piste que l'on parcourt soi-même,
       avec accroche magnétique et défilement clavier natif.
       ═══════════════════════════════════════════════════════════════════════ */
    if (shouldReduceMotion) {
        return (
            <div className="w-full overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-4 sm:gap-6 px-4 sm:px-6 snap-x snap-mandatory">
                    {skills.map((skill, index) => (
                        <div key={`${skill.name}-${index}`} className="snap-center">
                            <SkillCard skill={skill} tSkills={tSkills} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex overflow-hidden group w-full relative py-2
                       [mask-image:linear-gradient(to_right,transparent_0%,#000_9%,#000_91%,transparent_100%)]
                       [-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_9%,#000_91%,transparent_100%)]"
            onPointerEnter={pauseTrack}
            onPointerLeave={resumeTrack}
            onFocusCapture={pauseTrack}
            onBlurCapture={resumeTrack}
        >
            {/* Le masque CSS remplace les deux dégradés codés en dur sur `base-100` :
                les bords s'estompent désormais correctement au-dessus de n'importe
                quel fond de section, y compris une image ou un dégradé. */}

            {/* Le conteneur animé par framer-motion */}
            <motion.div
                aria-hidden="true"
                style={{ x: translateX }}
                className="flex flex-shrink-0 w-max gap-4 sm:gap-6 px-2 sm:px-3 will-change-transform"
            >
                {duplicatedSkills.map((skill, index) => (
                    <SkillCard key={`${skill.name}-${index}`} skill={skill} tSkills={tSkills} />
                ))}
            </motion.div>

            {/* La piste est dupliquée 4 fois : on la masque aux lecteurs d'écran et on
                expose la liste réelle une seule fois. */}
            <ul className="sr-only">
                {skills.map((skill) => (
                    <li key={skill.name}>{skill.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default MarqueeRow;