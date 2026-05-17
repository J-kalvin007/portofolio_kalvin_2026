'use client';


/**
 * @file StardustCursor.tsx
 * @description Curseur spatial ultra-fluide avec Framer Motion (Effet "Aura Dorée" et inertie).
 */

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function StardustCursor() {
  const [isVisible, setIsVisible] = useState(false);

  // Position brute de la souris
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Curseur principal (rapide)
  const cursorX = useSpring(mouseX, { stiffness: 1000, damping: 50, mass: 0.1 });
  const cursorY = useSpring(mouseY, { stiffness: 1000, damping: 50, mass: 0.1 });

  // Aura suiveuse (lente, crée l'effet d'inertie/poussière)
  const auraX = useSpring(mouseX, { stiffness: 100, damping: 20, mass: 0.5 });
  const auraY = useSpring(mouseY, { stiffness: 100, damping: 20, mass: 0.5 });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!mounted) return null;

  return (
    <>
      {/* ── Point central brillant ── */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#FFD166] rounded-full pointer-events-none z-[9999] shadow-[0_0_10px_2px_rgba(255,209,102,0.8)]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* ── Aura stellaire avec inertie ── */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-[#F0A500]/40 bg-[#F0A500]/10 rounded-full pointer-events-none z-[9998] shadow-[0_0_20px_5px_rgba(240,165,0,0.2)] mix-blend-screen"
        style={{
          x: auraX,
          y: auraY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
}
