import FadeIn from "@/components/animations/FadeIn";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Github } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState } from "react";
import Image from "next/image";
import ImageLightbox from "./ImageLightbox";


/**
 * @component FeaturedProjectCard
 * @description Carte "Mise en avant" d'un projet sur la page d'accueil.
 * Dispose d'un carrousel d'images intégré et ouvre une Lightbox au clic sur l'image.
 */
const FeaturedProjectCard = ({ project, index, tProjects }: { project: any, index: number, tProjects: any }) => {
    const [currentImg, setCurrentImg] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const images = project.images && project.images.length > 0 ? project.images : [project.coverImage];

    const nextImg = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImg((prev) => (prev + 1) % images.length);
    };

    const prevImg = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
    };

    // Alterne l'affichage (Image à gauche, Texte à droite -> ou inversement) pour casser la monotonie visuelle
    const isEven = index % 2 === 0;

    return (
        <>
            <div className={`relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center`}>
                {/* Section Image (Glassmorphism) */}
                <div className="w-full lg:w-3/5 group relative rounded-[2.5rem] p-3 sm:p-5 bg-gradient-to-br from-base-200/50 to-base-100/10 dark:from-white/[0.03] dark:to-transparent backdrop-blur-3xl border border-base-content/[0.05] dark:border-white/[0.05] shadow-2xl overflow-hidden">
                    {/* Halo ambiant */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Wrapper cliquable (Zoom In) */}
                    <div className="relative aspect-[16/10] sm:aspect-video rounded-[1.5rem] overflow-hidden cursor-zoom-in shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] bg-base-300/20" onClick={() => setIsLightboxOpen(true)}>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImg}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0"
                            >
                                <Image src={images[currentImg]} alt={`${project.title} screenshot`} fill className="object-cover" />
                            </motion.div>
                        </AnimatePresence>

                        {/* Contrôles du Carrousel (Flèches et Points) */}
                        {images.length > 1 && (
                            <>
                                <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer">
                                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer">
                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                {/* Points de navigation */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                                    {images.map((_: any, i: number) => (
                                        <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }} className="cursor-pointer p-2 -m-2 group/dot">
                                            <div className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImg ? 'w-8 bg-primary shadow-[0_0_8px_var(--glow-color-strong)]' : 'w-2.5 bg-white/40 group-hover/dot:bg-white/70 group-hover/dot:w-4'}`} />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Icône d'indication d'agrandissement au survol */}
                        <div className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Section Contenu (Titre, Description, Technos) */}
                <div className="w-full lg:w-2/5 flex flex-col justify-center">
                    <FadeIn direction={isEven ? 'left' : 'right'}>

                        {/* Badge de Catégorie (Ex: E-Commerce) traduit dynamiquement */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/50 dark:bg-white/5 border border-base-content/10 mb-6">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                {tProjects(`${project.slug === 'challenger-app' ? 'challenger' : project.slug === 'Sheem!' ? 'sheem' : project.slug === 'mboashop-ecommerce' ? 'mboashop' : project.slug === 'myriade-groupe' ? 'myriade' : project.slug === 'stock-manager' ? 'stock' : 'green'}.category`)}
                            </span>
                        </div>

                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content mb-6 leading-tight tracking-tight cursor-text">
                            {project.title}
                        </h3>

                        <p className="text-base sm:text-lg text-base-content/60 leading-relaxed mb-8 cursor-text">
                            {tProjects(`${project.slug === 'challenger-app' ? 'challenger' : project.slug === 'Sheem!' ? 'sheem' : project.slug === 'mboashop-ecommerce' ? 'mboashop' : project.slug === 'myriade-groupe' ? 'myriade' : project.slug === 'stock-manager' ? 'stock' : 'green'}.short`)}
                        </p>

                        <div className="flex flex-wrap gap-2.5 mb-10">
                            {project.techStack.map((tech: string) => (
                                <span key={tech} className="px-4 py-2 rounded-2xl bg-base-200/50 dark:bg-white/[0.03] border border-base-content/[0.05] text-xs sm:text-sm font-bold text-base-content/80 shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:-translate-y-0.5 cursor-default">
                                    {tech}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href="/projets" className="cursor-pointer group px-8 py-4 rounded-full bg-base-content text-base-100 hover:bg-primary hover:text-primary-content transition-all duration-300 font-bold flex items-center gap-2 shadow-lg hover:shadow-primary/20">
                                Voir le projet
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer p-4 rounded-full border border-base-content/10 hover:border-base-content/30 text-base-content/70 hover:text-base-content hover:bg-base-200 dark:hover:bg-white/5 transition-all">
                                    <Github className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* Rendu de la Lightbox au-dessus du composant si déclenchée */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <ImageLightbox images={images} currentIndex={currentImg} onClose={() => setIsLightboxOpen(false)} onNext={nextImg} onPrev={prevImg} />
                )}
            </AnimatePresence>
        </>
    );
};
export default FeaturedProjectCard;