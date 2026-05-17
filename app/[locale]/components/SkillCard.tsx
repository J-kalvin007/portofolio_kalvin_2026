import { Code2 } from "lucide-react";
import Image from "next/image";


/**
 * @component SkillCard
 * @description Carte de compétence individuelle affichant une icône, le nom et le niveau.
 * Intègre un effet complexe de reflet métallique (Sweep Glare) au survol.
 */
const SkillCard = ({ skill, tSkills }: { skill: any; tSkills: any }) => (
    <div className="relative group w-[280px] sm:w-[320px] p-5 sm:p-6 rounded-[2.5rem] bg-gradient-to-b from-white/40 to-white/10 dark:from-white/[0.08] dark:to-transparent backdrop-blur-3xl border border-white/40 dark:border-white/[0.08] hover:border-primary/50 dark:hover:border-primary/30 transition-all duration-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_0_40px_-10px_var(--glow-color-strong)] overflow-hidden">

        {/* Lumière ambiante interne & Reflet oblique (Sweep Glare) */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
            <div className="absolute top-0 -left-[100%] w-1/2 h-full skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
        </div>

        <div className="relative z-10 flex items-center gap-5 sm:gap-6">
            {/* Conteneur de l'icône */}
            <div className="relative flex items-center justify-center shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.25rem] bg-white/60 dark:bg-white/[0.02] border border-white/60 dark:border-white/[0.05] shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] group-hover:bg-white/90 dark:group-hover:bg-white/[0.08] transition-colors duration-700 overflow-hidden">
                {/* Halo de contraste derrière l'icône (utile si l'icône est noire en mode sombre) */}
                <div className="absolute inset-0 bg-transparent dark:bg-white/[0.15] opacity-0 dark:opacity-100 rounded-full blur-xl pointer-events-none" />

                {skill.icon ? (
                    <Image
                        src={skill.icon}
                        alt={skill.name}
                        width={40}
                        height={40}
                        className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                    />
                ) : (
                    <Code2 className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 text-primary drop-shadow-sm" />
                )}
            </div>

            {/* Textes (Nom + Niveau) */}
            <div className="flex flex-col justify-center">
                <h4 className="font-bold text-lg sm:text-xl text-base-content/90 group-hover:text-primary transition-colors duration-300">
                    {skill.name}
                </h4>
                <span className="text-[10px] sm:text-[11px] font-bold text-base-content/50 uppercase tracking-[0.25em] mt-1.5">
                    {/* Traduction dynamique du niveau de compétence */}
                    {skill.level >= 5 ? tSkills('expert') : skill.level === 4 ? tSkills('advanced') : tSkills('intermediate')}
                </span>
            </div>
        </div>
    </div>
);

export default SkillCard;
