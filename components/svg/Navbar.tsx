// 'use client';

// import { useState, useEffect } from 'react';
// import { usePathname as useNextPathname } from 'next/navigation';
// import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
// import { useLocale, useTranslations } from 'next-intl';
// import { Link, useRouter, usePathname } from '@/i18n/navigation';
// import Logo from './Logo';
// import ThemeToggle from './ThemeToggle';

// /* ═══════════════════════════════════════════════
//    NAVBAR — Ultra-premium scroll-aware navigation
//    Features: glassmorphism, fluid typography, 
//    luxurious hover states, minimalist mobile menu
//    ═══════════════════════════════════════════════ */

// export default function Navbar() {
//   const nextPathname = useNextPathname();
//   const intlPathname = usePathname();
//   const router = useRouter();
//   const locale = useLocale();
//   const t = useTranslations('nav');

//   const NAV_LINKS = [
//     { href: '/' as const, label: t('home') },
//     { href: '/projets' as const, label: t('projects') },
//     { href: '/propos' as const, label: t('about') },
//     { href: '/contact' as const, label: t('contact') },
//   ];

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isHidden, setIsHidden] = useState(false);
//   const { scrollY } = useScroll();

//   const toggleLanguage = () => {
//     const nextLocale = locale === 'fr' ? 'en' : 'fr';
//     router.replace(intlPathname, { locale: nextLocale });
//   };

//   useMotionValueEvent(scrollY, 'change', (latest) => {
//     const previous = scrollY.getPrevious() ?? 0;
//     setIsScrolled(latest > 50);
//     if (latest > 200 && latest > previous && !menuOpen) {
//       setIsHidden(true);
//     } else {
//       setIsHidden(false);
//     }
//   });

//   useEffect(() => {
//     document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
//     return () => { document.body.style.overflow = 'unset'; };
//   }, [menuOpen]);

//   // Check if a nav link is active
//   const isActive = (href: string) => {
//     if (href === '/') return intlPathname === '/';
//     return intlPathname.startsWith(href);
//   };

//   return (
//     <>
//       <motion.header
//         initial={{ y: -100 }}
//         animate={{ y: isHidden ? -100 : 0 }}
//         transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//         className={`
//           fixed top-0 inset-x-0 z-50 px-6 lg:px-12 py-4
//           transition-all duration-500
//           ${isScrolled
//             ? 'bg-white/80 dark:bg-[#070510]/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-slate-200/50 dark:border-white/[0.05]'
//             : 'bg-transparent'
//           }
//         `}
//       >
//         <div className="max-w-[1400px] mx-auto flex justify-between items-center">
//           {/* Logo */}
//           <div className="relative z-[60]">
//             <Logo size={36} showText={!isScrolled} />
//           </div>

//           {/* Desktop Navigation */}
//           <nav className={`
//             hidden md:flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-500
//             ${isScrolled 
//               ? 'bg-white/50 dark:bg-white/5 border-slate-200/50 dark:border-white/10 shadow-sm' 
//               : 'bg-transparent border-transparent'
//             }
//           `}>
//             {NAV_LINKS.map(({ href, label }) => {
//               const active = isActive(href);
//               return (
//                 <Link
//                   key={href}
//                   href={href}
//                   className="cursor-pointer relative px-5 py-2 rounded-full text-sm font-medium tracking-wide transition-colors duration-300 group"
//                 >
//                   {active && (
//                     <motion.div
//                       layoutId="nav-active-indicator"
//                       className="absolute inset-0 bg-slate-100 dark:bg-white/10 rounded-full"
//                       transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
//                     />
//                   )}
//                   <span className={`relative z-10 ${
//                     active
//                       ? 'text-slate-900 dark:text-white font-semibold'
//                       : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
//                   }`}>
//                     {label}
//                   </span>
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Desktop Right Actions */}
//           <div className="hidden md:flex items-center gap-4 relative z-[60]">
//             <button 
//               onClick={toggleLanguage}
//               className="cursor-pointer text-xs font-bold tracking-widest uppercase text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
//             >
//               {locale === 'fr' ? 'EN' : 'FR'}
//             </button>
//             <ThemeToggle />
//             <Link
//               href="/contact"
//               className="cursor-pointer group relative overflow-hidden px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-[#070510] transition-transform duration-300 hover:scale-105 active:scale-95"
//             >
//               <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]" />
//               <span className="relative z-10 font-bold text-sm tracking-wide group-hover:text-primary-content transition-colors duration-500">
//                 {t('contactBtn')}
//               </span>
//             </Link>
//           </div>

//           {/* Mobile: Theme + Burger */}
//           <div className="flex md:hidden items-center gap-3 relative z-[60]">
//             <button 
//               onClick={toggleLanguage}
//               className="cursor-pointer text-xs font-bold tracking-widest uppercase text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mr-1"
//             >
//               {locale === 'fr' ? 'EN' : 'FR'}
//             </button>
//             <ThemeToggle />
//             <button
//               className="cursor-pointer p-2 -mr-2 text-slate-900 dark:text-white flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
//               onClick={() => setMenuOpen(!menuOpen)}
//               aria-label="Toggle menu"
//             >
//               <motion.span 
//                 animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} 
//                 className="w-6 h-[2px] bg-current block transition-all"
//               />
//               <motion.span 
//                 animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} 
//                 className="w-6 h-[2px] bg-current block transition-all"
//               />
//               <motion.span 
//                 animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} 
//                 className="w-6 h-[2px] bg-current block transition-all"
//               />
//             </button>
//           </div>
//         </div>
//       </motion.header>

//       {/* Mobile Full-Screen Menu */}
//       <AnimatePresence>
//         {menuOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//             className="fixed inset-0 z-40 bg-white/95 dark:bg-[#070510]/95 backdrop-blur-3xl md:hidden flex flex-col"
//           >
//             {/* Ambient Background Effects */}
//             <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
//             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

//             <div className="flex flex-col justify-center h-full px-8 pb-20 items-center">
//               <nav className="flex flex-col gap-8 items-center text-center">
//                 {NAV_LINKS.map(({ href, label }, i) => (
//                   <div key={href} className="overflow-hidden">
//                     <motion.div
//                       initial={{ y: "100%" }}
//                       animate={{ y: 0 }}
//                       exit={{ y: "100%" }}
//                       transition={{ 
//                         delay: menuOpen ? 0.1 + i * 0.08 : 0, 
//                         duration: 0.6, 
//                         ease: [0.22, 1, 0.36, 1] 
//                       }}
//                     >
//                       <Link
//                         href={href}
//                         onClick={() => setMenuOpen(false)}
//                         className="cursor-pointer group relative inline-flex items-center text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-white transition-colors duration-300"
//                       >
//                         <span className={`relative z-10 transition-colors duration-500 ${isActive(href) ? 'text-primary' : 'group-hover:text-primary'}`}>
//                           {label}
//                         </span>
//                         <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-primary transition-all duration-500 ease-[0.22,1,0.36,1] group-hover:w-full" />
//                       </Link>
//                     </motion.div>
//                   </div>
//                 ))}
//               </nav>
              
//               {/* Footer text in mobile menu */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ delay: 0.5, duration: 0.6 }}
//                 className="absolute bottom-8 left-0 right-0 text-center text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase font-medium"
//               >
//                 Takoudjou Moïse Kalvin © {new Date().getFullYear()}
//               </motion.div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
