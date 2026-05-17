'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * @file MagneticWrapper.tsx
 * @description Un composant wrapper qui ajoute une physique magnétique (Framer Motion Spring)
 * à n'importe quel élément enfant (bouton, lien, image). L'élément est attiré par la souris.
 */

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // Force de l'attraction (ex: 0.4 = 40% de la distance du centre)
}

export default function MagneticWrapper({ children, className = "", strength = 0.3 }: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Position locale de la cible magnétique
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Physique du ressort (Spring) ultra-fluide
  const magneticX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const magneticY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    
    // Calcul de la distance entre la souris et le centre de l'élément
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    // Application de la force
    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: 0, y: 0 }}
      style={{ x: magneticX, y: magneticY }}
      className={`relative inline-block z-10 ${className}`}
    >
      {children}
    </motion.div>
  );
}
