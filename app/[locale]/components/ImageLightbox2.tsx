import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";


/**
 * @component ImageLightbox
 * @description Lightbox en plein écran pour visualiser les images d'un projet.
 * Supporte la navigation (précédent/suivant) et la fermeture.
 */
interface ImageLightboxProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: (e?: React.MouseEvent) => void;
    onPrev: (e?: React.MouseEvent) => void;
}

const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }: ImageLightboxProps) => {
    const locale = useLocale();
    const tLightbox = useTranslations('lightbox');



    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
        >
            {/* Conteneur principal de l'image avec animation de transition */}
            <motion.div
                className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.1}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                {/* Image affichée avec mode 'contain' pour s'assurer qu'elle rentre dans l'écran */}
                <motion.img
                    src={images[currentIndex]}
                    alt={`Galerie ${currentIndex + 1}`}
                    className="object-contain rounded-2xl shadow-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />

                {/* Flèches de navigation (gauche et droite) */}
                <button
                    onClick={onPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer"
                    aria-label={tLightbox('previous')}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer"
                    aria-label={tLightbox('next')}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                {/* Compteur d'images et bouton de fermeture */}
                <div className="absolute bottom-4 right-4">
                    {/* Affichage du compteur d'images et du bouton de fermeture groupés */}
                    <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-full text-white">
                        {/* Compteur d'images */}
                        <span className="text-sm font-semibold">
                            {currentIndex + 1} / {images.length}
                        </span>

                        {/* Bouton de fermeture */}
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                            aria-label={tLightbox('close')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Message d'indication pour les utilisateurs de clavier */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-xs animate-pulse">
                {locale === 'fr' ? '←/→ pour naviguer, Échap pour fermer' : '←/→ to navigate, Esc to close'}
            </div>
        </div>
    );
};


export default ImageLightbox;
