import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";

/**
 * @component ImageLightbox
 * @description Visionneuse d'images en plein écran (modale).
 * Bloque le défilement de l'arrière-plan lorsqu'elle est ouverte.
 */
const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }: any) => {
    if (!images || images.length === 0) return null;

    // Verrouillage du scroll du corps de la page
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-base-100/95 backdrop-blur-xl cursor-zoom-out"
            onClick={onClose} // Clic sur le fond = fermeture
        >
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-6 right-6 p-3 bg-base-content/10 hover:bg-primary text-base-content hover:text-primary-content rounded-full transition-colors z-[110] cursor-pointer">
                <X className="w-6 h-6" />
            </button>

            {images.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 sm:left-10 p-4 bg-base-content/10 hover:bg-primary text-base-content hover:text-primary-content rounded-full transition-colors z-[110] cursor-pointer">
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}

            {/* Conteneur de l'image (désactive le clic de fermeture) */}
            <div className="relative w-full max-w-7xl h-[80vh] mx-4 sm:mx-24 rounded-2xl overflow-hidden shadow-2xl cursor-default" onClick={e => e.stopPropagation()}>
                <Image src={images[currentIndex]} alt="Fullscreen view" fill className="object-contain" />
            </div>

            {images.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 sm:right-10 p-4 bg-base-content/10 hover:bg-primary text-base-content hover:text-primary-content rounded-full transition-colors z-[110] cursor-pointer">
                    <ChevronRight className="w-8 h-8" />
                </button>
            )}
        </motion.div>
    );
};

export default ImageLightbox;
