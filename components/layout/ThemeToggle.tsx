'use client';

/**
 * @file ThemeToggle.tsx
 * @description Bouton de bascule entre le mode clair et le mode sombre.
 *
 * @architecture
 * L'icône et le libellé sont choisis **en CSS**, d'après la classe `.dark` que
 * le script anti-flash pose sur `<html>` avant le premier affichage :
 *  - le bouton est correct dès le HTML statique, sans état d'attente
 *    d'hydratation (l'ancienne version affichait un bouton vide et désactivé
 *    jusqu'au montage) ;
 *  - les deux libellés sont présents, mais celui qui est masqué
 *    (`display: none`) est exclu du nom accessible : un lecteur d'écran
 *    n'entend que l'action réellement disponible.
 *
 * Au clic, le thème courant est lu sur le document — la source de vérité
 * visible — puis le store (`useThemeStore`) applique et mémorise le suivant.
 * L'animation de l'icône est une transition CSS : plus de framer-motion.
 */

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useThemeStore } from '@/lib/useTheme';

const ICON = 'h-[18px] w-[18px] transition-[rotate,scale,opacity] duration-(--motion-base) ease-emphasized motion-reduce:transition-none';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  // Seule l'action est lue : le bouton ne se re-rend pas quand le thème change.
  const setTheme = useThemeStore((state) => state.setTheme);
  const t = useTranslations('theme');

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-control text-ink-soft
                  transition-colors duration-(--motion-fast) hover:bg-surface-sunken hover:text-ink
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${className}`}
    >
      {/* Mode clair : la lune propose le mode sombre. */}
      <Moon aria-hidden="true" strokeWidth={2} className={`${ICON} absolute dark:scale-50 dark:-rotate-90 dark:opacity-0`} />
      {/* Mode sombre : le soleil propose le mode clair. */}
      <Sun aria-hidden="true" strokeWidth={2} className={`${ICON} absolute scale-50 rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100`} />

      <span className="sr-only dark:hidden">{t('toDark')}</span>
      <span className="sr-only hidden dark:inline">{t('toLight')}</span>
    </button>
  );
}
