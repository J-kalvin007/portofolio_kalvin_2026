// import FadeIn from "@/components/animations/FadeIn";
// import { TimelineItem } from "@/lib/data/experience";
// import { Calendar, MapPin } from "lucide-react";
// import { useState } from "react";


// /**
//  * @component TimelineCard
//  * @description Affiche un événement (Job/École) de la ligne de temps.
//  * Alterne l'alignement (gauche/droite) en mode bureau (desktop) en fonction de l'index pair/impair.
//  */
// function TimelineCard({ item, index }: { item: TimelineItem; index: number }) {

//     const isLeft = index % 2 === 0; // True si c'est le 1er, 3ème, etc.
//     const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//     const handleMouseMove = (e: React.MouseEvent) => {
//         const rect = e.currentTarget.getBoundingClientRect();
//         setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
//     };

//     return (
//         <FadeIn direction={isLeft ? 'left' : 'right'} delay={index * 0.1}>
//             <div className={`flex gap-6 ${isLeft ? 'md:flex-row md:text-right' : 'md:flex-row-reverse md:text-left'}`}>

//                 {/* Colonne fantôme pour équilibrer la grille en mode Desktop */}
//                 <div className="flex-1 hidden md:block" />

//                 {/* Marqueur central (Le point de la frise chronologique) */}
//                 <div className="flex flex-col items-center">
//                     <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/30 relative z-10" />
//                     <div className="w-px flex-1 bg-base-content/10" />
//                 </div>

//                 {/* Contenu textuel de la carte avec Spotlight Magnétique */}
//                 <div className="flex-1 pb-12">
//                     <div
//                         onMouseMove={handleMouseMove}
//                         className="relative group p-6 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-base-content/[0.06] dark:border-base-content/[0.04] transition-all duration-700 hover:border-primary/30 shadow-md dark:shadow-none hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
//                     >
//                         {/* Glow spotlight suivant la souris */}
//                         <div
//                             className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
//                             style={{ background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(240,165,0,0.15), transparent 40%)` }}
//                         />
//                         {/* Bordure luminescente suivant la souris */}
//                         <div
//                             className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem] shadow-[inset_0_0_0_1px_rgba(240,165,0,0.4)]"
//                             style={{ maskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent 100%)`, WebkitMaskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent 100%)` }}
//                         />

//                         <div className="relative z-10">
//                             <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-wider mb-3">
//                                 <Calendar className="w-3 h-3" />{item.period}
//                             </div>
//                             <h3 className="font-bold text-lg text-base-content mb-1">{item.title}</h3>
//                             <p className="text-sm text-primary/80 font-semibold mb-3">{item.subtitle}</p>
//                             <p className="text-sm text-base-content/50 leading-relaxed">{item.description}</p>

//                             {/* Tags technologiques associés à cette expérience */}
//                             {item.tags && (
//                                 <div className="flex flex-wrap gap-1.5 mt-5">
//                                     {item.tags.map((t) => (
//                                         <span key={t} className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 group-hover:text-base-content/90 px-3 py-1.5 rounded-full bg-base-200 dark:bg-white/5 border border-base-content/5 group-hover:border-primary/30 transition-all duration-300">{t}</span>
//                                     ))}
//                                 </div>
//                             )}

//                             <div className="relative z-10 flex items-center gap-1.5 mt-4 text-xs text-base-content/40 group-hover:text-primary/70 transition-colors duration-300">
//                                 <MapPin className="w-3 h-3" />{item.location}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </FadeIn>
//     );
// }

// export default TimelineCard;




























'use client';

import FadeIn from "@/components/animations/FadeIn";
import { TimelineItem } from "@/lib/data/experience";
import { Calendar, MapPin } from "lucide-react";
import { useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ TOKENS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Or « Void & Or », en composantes RVB — réservé aux dégradés en ligne. */
const GOLD_RGB = '240,165,0';

/** Rayon du halo lumineux qui suit le curseur (px). */
const SPOTLIGHT_RADIUS = 380;

/** Rayon du masque qui révèle la bordure luminescente (px). */
const EDGE_GLOW_RADIUS = 280;

/**
 * @component TimelineCard
 * @description Affiche un événement (Job/École) de la ligne de temps.
 * Alterne l'alignement (gauche/droite) en mode bureau (desktop) en fonction de l'index pair/impair.
 *
 * @remarks Le suivi du curseur passait par un `useState` : chaque `mousemove`
 * déclenchait un rendu React complet de la carte et de son enveloppe `FadeIn`,
 * soit une soixantaine de rendus par seconde pendant tout le survol, et autant
 * de fois qu'il y a de cartes sur la frise. Les coordonnées sont désormais
 * écrites en variables CSS sur le nœud survolé : le rendu visuel est identique,
 * le coût en rendus React est nul.
 */
function TimelineCard({ item, index }: { item: TimelineItem; index: number }) {

    const isLeft = index % 2 === 0; // True si c'est le 1er, 3ème, etc.

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();

        card.style.setProperty('--cursor-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--cursor-y', `${e.clientY - rect.top}px`);
    }, []);

    return (
        <FadeIn direction={isLeft ? 'left' : 'right'} delay={index * 0.1}>
            <div className={`flex gap-6 ${isLeft ? 'md:flex-row md:text-right' : 'md:flex-row-reverse md:text-left'}`}>

                {/* Colonne fantôme pour équilibrer la grille en mode Desktop */}
                <div className="flex-1 hidden md:block" aria-hidden="true" />

                {/* Marqueur central (Le point de la frise chronologique) */}
                <div className="flex flex-col items-center shrink-0" aria-hidden="true">
                    {/* Le point est ceinturé d'un anneau à la couleur du fond :
                        il se détache proprement du trait vertical qu'il interrompt. */}
                    <div className="w-3.5 h-3.5 rounded-full bg-primary relative z-10
                                    ring-4 ring-base-100
                                    shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_6px_-2px_rgba(0,0,0,0.4)]" />
                    <div className="w-px flex-1 bg-gradient-to-b from-base-content/15 to-base-content/[0.04]" />
                </div>

                {/* Contenu textuel de la carte avec Spotlight Magnétique */}
                <div className="flex-1 pb-12 min-w-0">
                    <div
                        onMouseMove={handleMouseMove}
                        style={{ '--cursor-x': '50%', '--cursor-y': '50%' } as React.CSSProperties}
                        className="relative group p-6 rounded-[1.75rem] overflow-hidden
                                   bg-base-100 dark:bg-white/[0.025]
                                   border border-base-content/[0.07] dark:border-white/[0.06]
                                   shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_1px_2px_-1px_rgba(0,0,0,0.05),0_16px_36px_-24px_rgba(0,0,0,0.3)]
                                   dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
                                   hover:border-primary/30
                                   hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_1px_2px_-1px_rgba(0,0,0,0.05),0_28px_56px_-28px_rgba(0,0,0,0.4)]
                                   transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    >
                        {/* Glow spotlight suivant la souris */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: `radial-gradient(${SPOTLIGHT_RADIUS}px circle at var(--cursor-x) var(--cursor-y), rgba(${GOLD_RGB},0.10), transparent 45%)` }}
                        />

                        {/* Bordure luminescente suivant la souris */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.75rem]
                                       shadow-[inset_0_0_0_1px_rgba(240,165,0,0.45)]"
                            style={{
                                maskImage: `radial-gradient(${EDGE_GLOW_RADIUS}px circle at var(--cursor-x) var(--cursor-y), black, transparent 100%)`,
                                WebkitMaskImage: `radial-gradient(${EDGE_GLOW_RADIUS}px circle at var(--cursor-x) var(--cursor-y), black, transparent 100%)`,
                            }}
                        />

                        <div className="relative z-10">
                            {/* La période est la clé de lecture d'une frise : chiffres à chasse fixe
                                pour que les dates s'alignent d'une carte à l'autre. */}
                            <div className={`flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-[0.16em] tabular-nums mb-3
                                             ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                                <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />{item.period}
                            </div>

                            <h3 className="font-bold text-lg text-base-content tracking-[-0.02em] mb-1 text-balance">{item.title}</h3>
                            <p className="text-sm text-primary/80 font-semibold mb-3">{item.subtitle}</p>
                            <p className="text-sm text-base-content/50 leading-[1.7] text-pretty">{item.description}</p>

                            {/* Tags technologiques associés à cette expérience */}
                            {item.tags && (
                                <ul className={`flex flex-wrap gap-1.5 mt-5 list-none p-0 ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                                    {item.tags.map((t) => (
                                        <li
                                            key={t}
                                            className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full
                                                       text-base-content/55 group-hover:text-base-content/85
                                                       bg-base-200/60 dark:bg-white/[0.04]
                                                       border border-base-content/[0.06] group-hover:border-primary/25
                                                       transition-[color,border-color] duration-300"
                                        >
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className={`relative z-10 flex items-center gap-1.5 mt-4 text-xs text-base-content/40 group-hover:text-primary/70 transition-colors duration-300
                                             ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                                <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />{item.location}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FadeIn>
    );
}

export default TimelineCard;