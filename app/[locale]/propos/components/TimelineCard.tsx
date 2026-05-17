import FadeIn from "@/components/animations/FadeIn";
import { TimelineItem } from "@/lib/data/experience";
import { Calendar, MapPin } from "lucide-react";
import { useState } from "react";


/**
 * @component TimelineCard
 * @description Affiche un événement (Job/École) de la ligne de temps.
 * Alterne l'alignement (gauche/droite) en mode bureau (desktop) en fonction de l'index pair/impair.
 */
function TimelineCard({ item, index }: { item: TimelineItem; index: number }) {

    const isLeft = index % 2 === 0; // True si c'est le 1er, 3ème, etc.
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <FadeIn direction={isLeft ? 'left' : 'right'} delay={index * 0.1}>
            <div className={`flex gap-6 ${isLeft ? 'md:flex-row md:text-right' : 'md:flex-row-reverse md:text-left'}`}>

                {/* Colonne fantôme pour équilibrer la grille en mode Desktop */}
                <div className="flex-1 hidden md:block" />

                {/* Marqueur central (Le point de la frise chronologique) */}
                <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/30 relative z-10" />
                    <div className="w-px flex-1 bg-base-content/10" />
                </div>

                {/* Contenu textuel de la carte avec Spotlight Magnétique */}
                <div className="flex-1 pb-12">
                    <div
                        onMouseMove={handleMouseMove}
                        className="relative group p-6 rounded-[2rem] bg-base-200/30 dark:bg-white/[0.02] border border-base-content/[0.04] transition-all duration-700 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                    >
                        {/* Glow spotlight suivant la souris */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                            style={{ background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(240,165,0,0.15), transparent 40%)` }}
                        />
                        {/* Bordure luminescente suivant la souris */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem] shadow-[inset_0_0_0_1px_rgba(240,165,0,0.4)]"
                            style={{ maskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent 100%)`, WebkitMaskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent 100%)` }}
                        />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-wider mb-3">
                                <Calendar className="w-3 h-3" />{item.period}
                            </div>
                            <h3 className="font-bold text-lg text-base-content mb-1">{item.title}</h3>
                            <p className="text-sm text-primary/80 font-semibold mb-3">{item.subtitle}</p>
                            <p className="text-sm text-base-content/50 leading-relaxed">{item.description}</p>

                            {/* Tags technologiques associés à cette expérience */}
                            {item.tags && (
                                <div className="flex flex-wrap gap-1.5 mt-5">
                                    {item.tags.map((t) => (
                                        <span key={t} className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 group-hover:text-base-content/90 px-3 py-1.5 rounded-full bg-base-200 dark:bg-white/5 border border-base-content/5 group-hover:border-primary/30 transition-all duration-300">{t}</span>
                                    ))}
                                </div>
                            )}

                            <div className="relative z-10 flex items-center gap-1.5 mt-4 text-xs text-base-content/40 group-hover:text-primary/70 transition-colors duration-300">
                                <MapPin className="w-3 h-3" />{item.location}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FadeIn>
    );
}

export default TimelineCard;