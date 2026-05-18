'use client';
import React, { useRef, useState, useEffect } from 'react';
import { motion, useTransform, useInView, type MotionValue } from 'framer-motion';
import { Quote } from 'lucide-react';

/* ── Compteur Animé ── */
export function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - startTime) / (duration * 1000), 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Mot révélé au scroll ── */
const GOLD_WORDS = ['qualité', 'sublimer', 'ambassadeurs', 'précieux', 'sophistication', 'quality', 'elevate'];

export function ScrollWord({ children, progress, index, total }: { children: string; progress: MotionValue<number>; index: number; total: number }) {
  const start = index / total;
  const end = Math.min(start + 3 / total, 1);
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const clean = children.toLowerCase().replace(/[.,!?"""'']/g, '');
  const isGold = GOLD_WORDS.includes(clean);

  return (
    <motion.span style={{ opacity }} className={`inline-block mr-[0.25em] ${isGold ? 'text-primary font-semibold' : ''}`}>
      {children}
    </motion.span>
  );
}

/* ── Rangée Marquee Témoignages ── */
export function MarqueeRow({ items, direction = 'left', speed = 35 }: { items: { quote: string; author: string; role: string; company: string }[]; direction?: 'left' | 'right'; speed?: number }) {
  const tripled = [...items, ...items, ...items];
  return (
    <div className="flex overflow-hidden group/mq">
      <div
        className="flex gap-6 shrink-0 group-hover/mq:[animation-play-state:paused]"
        style={{ animation: `marquee-${direction} ${speed}s linear infinite` }}
      >
        {tripled.map((t, i) => (
          <div key={i} className="group/c w-[360px] shrink-0 p-7 rounded-[2rem] bg-white/80 dark:bg-white/[0.03] border border-base-content/[0.06] dark:border-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-700 hover:-translate-y-2">
            <Quote className="w-7 h-7 text-primary/30 mb-3 group-hover/c:text-primary transition-colors duration-500" />
            <p className="text-sm leading-relaxed text-base-content/65 dark:text-white/65 font-light mb-5 italic line-clamp-4">{t.quote}</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#FFD166] flex items-center justify-center font-bold text-black text-sm shadow-[0_0_12px_rgba(240,165,0,0.4)]">{t.author.charAt(0)}</div>
              <div>
                <div className="font-bold text-sm text-base-content dark:text-white">{t.author}</div>
                <div className="text-[10px] text-primary/70 font-semibold uppercase tracking-wider">{t.role}, {t.company}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
