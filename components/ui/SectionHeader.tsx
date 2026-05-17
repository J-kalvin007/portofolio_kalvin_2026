'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ═══════════════════════════════════════════════
   SECTION HEADER — Reusable premium section title
   Includes: eyebrow tag, main title, optional description
   ═══════════════════════════════════════════════ */

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div
      ref={ref}
      className={`mb-16 md:mb-20 ${align === 'center' ? 'text-center mx-auto' : ''} ${className}`}
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className={`inline-flex items-center gap-2.5 mb-6 ${align === 'center' ? 'mx-auto' : ''}`}
      >
        <span className="w-8 h-[2px] rounded-full bg-primary" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
          {eyebrow}
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content leading-[1.1] tracking-tight"
      >
        {title}
      </motion.h2>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`mt-6 text-lg text-base-content/60 leading-relaxed font-light ${align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-xl'
            }`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
