
// "use client";

// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import Lottie from 'lottie-react';
// import { Home, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
// import errorAnimation from '../../public/lottis/error.json';

// interface PageErreurProps {
//     statusCode?: number | string;
//     title?: string;
//     message?: string;
//     reset?: () => void;
// }

// const PageErreur: React.FC<PageErreurProps> = ({
//     title = "Page Introuvable",
//     message = "Désolé, la page que vous recherchez semble s'être volatilisée dans le cloud.",
//     reset
// }) => {
//     const router = useRouter();
//     const [countdown, setCountdown] = useState(5);
//     const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//     /** Portfolio: always return to home (no app auth in this project). */
//     const homeUrl = '/';

//     useEffect(() => {
//         timerRef.current = setInterval(() => {
//             setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
//         }, 1000);

//         return () => {
//             if (timerRef.current) clearInterval(timerRef.current);
//         };
//     }, []);

//     useEffect(() => {
//         if (countdown <= 0) {
//             router.push(homeUrl);
//         }
//     }, [countdown, homeUrl, router]);

//     const handleManualReturn = () => {
//         if (timerRef.current) clearInterval(timerRef.current);
//         router.push(homeUrl);
//     };

//     return (
//         <div className={`min-h-screen flex items-center justify-center p-6 bg-primary transition-colors duration-500`}>
//             {/* Background Decorative Elements */}
//             <div className="absolute inset-0 overflow-hidden pointer-events-none">
//                 <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
//                 <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-error/10 rounded-full blur-[120px] animate-pulse" />
//             </div>

//             <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="relative z-10 max-w-2xl w-full text-center"
//             >
//                 {/* Lottie Animation Container */}
//                 <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80 mb-8">
//                     <Lottie
//                         animationData={errorAnimation}
//                         loop={true}
//                         className="w-full h-full drop-shadow-2xl"
//                     />
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.5 }}
//                         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
//                     >
//                         <span className="text-8xl md:text-9xl font-black text-accent/10 select-none">
//                             {/* {statusCode} */}
//                         </span>
//                     </motion.div>
//                 </div>

//                 {/* Content Section */}
//                 <div className="space-y-6">
//                     <motion.h1
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.2 }}
//                         className="text-4xl md:text-6xl font-bold text-primary tracking-tight"
//                     >
//                         {title}
//                     </motion.h1>

//                     <motion.p
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.3 }}
//                         className="text-lg md:text-xl text-secondary max-w-md mx-auto leading-relaxed"
//                     >
//                         {message}
//                     </motion.p>

//                     {/* Countdown Indicator */}
//                     <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.4 }}
//                         className="flex items-center justify-center gap-3 py-2 px-4 bg-tertiary/50 backdrop-blur-md rounded-full w-fit mx-auto border border-color"
//                     >
//                         <div className="relative w-5 h-5">
//                             <svg className="w-5 h-5 -rotate-90">
//                                 <circle
//                                     cx="10"
//                                     cy="10"
//                                     r="8"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     strokeWidth="2"
//                                     className="text-accent/20"
//                                 />
//                                 <motion.circle
//                                     cx="10"
//                                     cy="10"
//                                     r="8"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     strokeWidth="2"
//                                     strokeDasharray="50.24"
//                                     initial={{ strokeDashoffset: 50.24 }}
//                                     animate={{ strokeDashoffset: 50.24 - (50.24 * (5 - countdown)) / 5 }}
//                                     className="text-accent"
//                                 />
//                             </svg>
//                         </div>
//                         <span className="text-lg font-medium text-secondary">
//                             Redirection dans <span className="font-bold text-primary">{countdown}s</span>
//                         </span>
//                     </motion.div>

//                     {/* Action Buttons */}
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.5 }}
//                         className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
//                     >
//                         <button
//                             onClick={handleManualReturn}
//                             className="group relative flex items-center gap-3 px-8 py-4 bg-accent text-accent-text rounded-2xl font-bold shadow-xl shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
//                         >
//                             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
//                             <Home className="w-5 h-5 relative z-10" />
//                             <span className="relative z-10">Retour à l&apos;accueil</span>
//                         </button>

//                         {reset && (
//                             <button
//                                 onClick={reset}
//                                 className="flex items-center gap-3 px-8 py-4 bg-secondary text-primary border border-color rounded-2xl font-bold hover:bg-tertiary hover:-translate-y-1 transition-all duration-300"
//                             >
//                                 <RefreshCw className="w-5 h-5" />
//                                 <span>Réessayer</span>
//                             </button>
//                         )}

//                         <button
//                             onClick={() => window.history.back()}
//                             className="flex items-center gap-2 text-secondary hover:text-accent font-medium px-4 py-2 transition-colors duration-200"
//                         >
//                             <ArrowLeft className="w-4 h-4" />
//                             <span>Page précédente</span>
//                         </button>
//                     </motion.div>
//                 </div>

//                 {/* Footer Info */}
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.8 }}
//                     className="mt-16 flex items-center justify-center gap-2 text-muted text-sm"
//                 >
//                     <AlertTriangle className="w-4 h-4" />
//                     <span>Mercury System Error Management</span>
//                 </motion.div>
//             </motion.div>
//         </div>
//     );
// };

// export default PageErreur;
