import { useEffect, useState } from "react";


/**
 * @component TypewriterText
 * @description Simule un effet de machine à écrire qui tape et efface des mots séquentiellement.
 * @param words Tableau de chaînes de caractères à afficher (ex: ["Ingénieur", "Architecte"]).
 */
function TypewriterText({ words, className = '' }: { words: readonly string[]; className?: string }) {
    const [currentWord, setCurrentWord] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const word = words[currentWord];
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (currentChar < word.length) {
                    setCurrentChar(currentChar + 1); // Ajoute une lettre
                } else {
                    setTimeout(() => setIsDeleting(true), 2000); // Pause avant d'effacer
                }
            } else {
                if (currentChar > 0) {
                    setCurrentChar(currentChar - 1); // Efface une lettre
                } else {
                    setIsDeleting(false); // Mot effacé, passe au suivant
                    setCurrentWord((currentWord + 1) % words.length);
                }
            }
        }, isDeleting ? 50 : 100); // Vitesse de suppression (50ms) plus rapide que frappe (100ms)
        return () => clearTimeout(timeout);
    }, [currentChar, isDeleting, currentWord, words]);

    return (
        <span className={className}>
            {words[currentWord].substring(0, currentChar)}
            <span className="animate-pulse text-primary">|</span> {/* Curseur clignotant */}
        </span>
    );
}


export default TypewriterText;