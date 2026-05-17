// 'use client';

// import React from 'react';
// import { motion } from 'framer-motion';
// import { Github, Linkedin, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
// import { useTranslations } from 'next-intl';
// import { Link } from '@/i18n/navigation';
// import Logo from './Logo';

// /* ═══════════════════════════════════════════════
//    FOOTER — 3-column ultra-premium responsive footer
//    Brand + Navigation + Social/Legal
//    ═══════════════════════════════════════════════ */

// const SOCIAL_LINKS = [
//   { icon: Github, href: 'https://github.com/J-kalvin007', label: 'GitHub' },
//   { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
//   { icon: Mail, href: 'mailto:takoudjoumoisecalvin@gmail.com', label: 'Email' },
// ];

// export default function Footer() {
//   const currentYear = new Date().getFullYear();
//   const t = useTranslations('footer');
//   const tNav = useTranslations('nav');

//   const NAV_LINKS = [
//     { label: tNav('home'), href: '/' as const },
//     { label: tNav('projects'), href: '/projets' as const },
//     { label: tNav('about'), href: '/propos' as const },
//     { label: tNav('contact'), href: '/contact' as const },
//   ];

//   return (
//     <footer className="relative mt-auto border-t border-base-content/5 bg-base-100 overflow-hidden">
//       {/* Top glow line */}
//       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

//       {/* Background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-content/[0.01] to-base-content/[0.03] pointer-events-none" />

//       <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:py-24">
//         {/* Main Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">

//           {/* ── Column 1: Brand ── */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//             className="lg:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-6"
//           >
//             <Logo size={36} />

//             <p className="text-base-content/60 leading-relaxed max-w-md font-medium text-sm">
//               {t('description')}
//             </p>

//             {/* Contact details */}
//             <div className="space-y-3 pt-2 w-full flex flex-col items-center md:items-start">
//               <div className="flex items-center gap-3 text-base-content/50 text-sm">
//                 <div className="w-9 h-9 rounded-xl bg-base-200 dark:bg-white/5 border border-base-300 dark:border-white/10 flex items-center justify-center shrink-0">
//                   <MapPin className="w-4 h-4" />
//                 </div>
//                 <span className="font-medium">Lomé, Togo</span>
//               </div>
//               <a href="mailto:takoudjoumoisecalvin@gmail.com" className="cursor-pointer flex items-center gap-3 text-base-content/50 hover:text-primary transition-colors text-sm group">
//                 <div className="w-9 h-9 rounded-xl bg-base-200 dark:bg-white/5 border border-base-300 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
//                   <Mail className="w-4 h-4" />
//                 </div>
//                 <span className="font-medium break-all text-left">takoudjoumoisecalvin@gmail.com</span>
//               </a>
//               <a href="tel:+22892515685" className="cursor-pointer flex items-center gap-3 text-base-content/50 hover:text-primary transition-colors text-sm group">
//                 <div className="w-9 h-9 rounded-xl bg-base-200 dark:bg-white/5 border border-base-300 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
//                   <Phone className="w-4 h-4" />
//                 </div>
//                 <span className="font-medium">+228 92 51 56 85</span>
//               </a>
//             </div>
//           </motion.div>

//           {/* ── Column 2: Navigation ── */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6, delay: 0.1 }}
//             className="lg:col-span-3 flex flex-col items-center md:items-start text-center md:text-left"
//           >
//             <h3 className="text-base-content font-bold text-sm mb-6 uppercase tracking-[0.2em]">
//               {t('navigation')}
//             </h3>
//             <nav className="space-y-3 flex flex-col items-center md:items-start">
//               {NAV_LINKS.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className="cursor-pointer group flex items-center md:gap-2 text-base-content/50 hover:text-primary transition-all duration-300 text-sm"
//                 >
//                   <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0 hidden md:block transition-all duration-300" />
//                   <span className="font-medium md:group-hover:translate-x-1 transition-transform duration-300">
//                     {link.label}
//                   </span>
//                 </Link>
//               ))}
//             </nav>
//           </motion.div>

//           {/* ── Column 3: Social + Legal ── */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//             className="lg:col-span-4 space-y-8 flex flex-col items-center md:items-start text-center md:text-left"
//           >
//             <div className="w-full flex flex-col items-center md:items-start">
//               <h3 className="text-base-content font-bold text-sm mb-6 uppercase tracking-[0.2em]">
//                 {t('followMe')}
//               </h3>
//               <div className="flex flex-wrap justify-center md:justify-start gap-3">
//                 {SOCIAL_LINKS.map((social) => (
//                   <a
//                     key={social.label}
//                     href={social.href}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     aria-label={social.label}
//                     className="cursor-pointer group w-11 h-11 rounded-xl bg-base-200 dark:bg-white/5 border border-base-300 dark:border-white/10 flex items-center justify-center text-base-content/40 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 shrink-0"
//                   >
//                     <social.icon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
//                   </a>
//                 ))}
//               </div>
//             </div>

//             <div className="w-full flex flex-col items-center md:items-start">
//               <h3 className="text-base-content font-bold text-sm mb-4 uppercase tracking-[0.2em]">
//                 {t('legal')}
//               </h3>
//               <div className="space-y-2 text-sm text-base-content/40 flex flex-col items-center md:items-start">
//                 <p className="font-medium">{t('privacy')}</p>
//                 <p className="font-medium">{t('terms')}</p>
//               </div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Divider */}
//         <div className="relative mb-8">
//           <div className="w-full border-t border-base-content/5" />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 px-4">
//             <div className="w-1.5 h-1.5 bg-primary rounded-full" />
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-base-content/40">
//           <p className="font-medium text-center md:text-left">
//             © {currentYear}{' '}
//             <span className="text-primary font-bold">Takoudjou Moïse Kalvin</span>
//             . {t('copyright')}
//           </p>
//           <div className="flex items-center gap-1.5 text-xs font-medium text-center md:text-right">
//             <span>{t('bottomTerms')}</span>
//           </div>
//         </div>
//       </div>

//       {/* Decorative blobs */}
//       <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
//       <div className="absolute top-0 right-0 w-40 h-40 bg-primary/3 rounded-full blur-3xl pointer-events-none" />
//     </footer>
//   );
// }






// okay parfait  maintenant je veux que tu ameliores encore plus mon component suivant 
// je veux une page encore plus belle plus magnifique eblouissante ultra premium et ultra
//  haut de gamme et luxeuse avec des animations tres fluides Set soyeuses je veux un style 
//  et un design tres classe moderne elegante coherente avec une experienc utilisateur
//   exceptionelle et digne des meilleurs applications fintech du monde 