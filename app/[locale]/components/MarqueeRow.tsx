import { motion } from "framer-motion";
import SkillCard from "./SkillCard";



/**
 * @component MarqueeRow
 * @description Ligne défilante à l'infini (Carrousel Marquee).
 * Duplique les éléments pour donner l'illusion d'une boucle infinie. Se met en pause au survol.
 */
const MarqueeRow = ({ skills, reverse = false, speed = 40, tSkills }: { skills: any[], reverse?: boolean, speed?: number, tSkills: any }) => {
    const duplicatedSkills = [...skills, ...skills, ...skills, ...skills]; // x4 pour s'assurer de couvrir tout l'écran

    return (
        <div className="flex overflow-hidden group w-full relative py-2">
            {/* Masques de dégradé sur les bords pour que les cartes disparaissent en douceur */}
            <div className="absolute inset-y-0 left-0 w-16 sm:w-48 bg-gradient-to-r from-base-100 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 sm:w-48 bg-gradient-to-l from-base-100 to-transparent z-10 pointer-events-none" />

            {/* Le conteneur animé par framer-motion */}
            <motion.div
                animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: speed, repeat: Infinity }}
                className="flex flex-shrink-0 w-max gap-4 sm:gap-6 px-2 sm:px-3 hover:[animation-play-state:paused]"
            >
                {duplicatedSkills.map((skill, index) => (
                    <SkillCard key={`${skill.name}-${index}`} skill={skill} tSkills={tSkills} />
                ))}
            </motion.div>
        </div>
    );
};

export default MarqueeRow;