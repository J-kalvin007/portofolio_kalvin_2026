'use client';

/**
 * @file page.tsx (Contact)
 * @description Page de contact principale du portfolio. Implémente un formulaire connecté à un serveur SMTP.
 * 
 * @architecture
 * - Utilise `react-hook-form` pour la gestion performante de l'état du formulaire (minimise les re-renders).
 * - Utilise `zod` pour une validation stricte et sécurisée des données côté client avant envoi.
 * - S'intègre avec `next-intl` pour supporter le multilinguisme complet (fr/en).
 * - Implémente le design system "Void & Or" avec Glassmorphism et Framer Motion.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import { StarField } from '@/components/projects';

/* ═══════════════════════════════════════════════
   TYPES & SCHEMAS DE VALIDATION
   ═══════════════════════════════════════════════ */

/** 
 * Définition TypeScript pour structurer les données envoyées par l'utilisateur.
 * Pourquoi : Évite les erreurs de typage et assure que la charge utile vers l'API est correcte.
 */
type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  // États locaux de l'interface utilisateur
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Instance de traduction (récupère les textes depuis messages/fr.json ou en.json)
  const t = useTranslations('contact_page');

  /**
   * Schéma de validation Zod.
   * Pourquoi : C'est le standard industriel pour garantir que l'utilisateur n'envoie pas de champs vides 
   * ou d'adresses e-mail invalides, ce qui protège le backend contre le spam et les erreurs.
   */
  const contactSchema = z.object({
    name: z.string().min(2, t('validation.nameMin')),
    email: z.string().email(t('validation.emailInvalid')),
    subject: z.string().min(3, t('validation.subjectMin')),
    message: z.string().min(10, t('validation.messageMin')).max(2000, t('validation.messageMax')),
  });

  /**
   * Initialisation de react-hook-form couplé avec le résolveur Zod.
   * C'est cette combinaison qui gère les erreurs en temps réel.
   */
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  /**
   * Fonction asynchrone appelée lors de la soumission du formulaire.
   * @param data Les données propres et validées par Zod.
   */
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true); // Bloque le bouton (spinner)
    setNotification(null); // Retire une éventuelle notification précédente

    try {
      // Requête HTTP POST vers la route d'API interne pour l'envoi d'e-mail
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok) {
        // En cas de succès, on affiche un toast vert et on vide les champs
        setNotification({ type: 'success', message: result.message || t('notification.successMessage') });
        reset();
      } else {
        // Erreur API (ex: Mauvaises clés SMTP)
        setNotification({ type: 'error', message: result.message || t('notification.errorMessage') });
      }
    } catch {
      // Erreur Réseau (ex: L'utilisateur a perdu internet au moment de cliquer)
      setNotification({ type: 'error', message: t('notification.networkError') });
    } finally {
      setIsSubmitting(false); // Réactive le bouton
    }
  };

  /**
   * Utilitaire de génération de classes dynamiques pour les champs (inputs/textarea).
   * Pourquoi : Permet de basculer la bordure en rouge instantanément si react-hook-form détecte une erreur.
   */
  const inputClasses = (hasError: boolean) =>
    `w-full bg-base-100/50 dark:bg-[#070510]/50 backdrop-blur-md border rounded-2xl px-5 py-4 focus:ring-4 outline-none transition-all duration-500 placeholder:text-base-content/20 text-base-content shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${hasError
      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
      : 'border-base-content/10 dark:border-white/10 hover:border-[#F0A500]/30 focus:border-[#F0A500] focus:ring-[#F0A500]/20'
    }`;

  // Données de configuration des réseaux sociaux affichés dans la colonne gauche
  const SOCIALS = [
    { icon: Github, href: 'https://github.com/J-kalvin007', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Send, href: 'mailto:takoudjoumoisecalvin@gmail.com', label: 'Email' },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content overflow-hidden relative">
      {/* 
        Décorations de fond lumineuses (Orbs) 
        Créent la profondeur et l'atmosphère ultra-premium de la charte "Void & Or"
      */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F0A500]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F0A500]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ── Fond Spatial Étoilé ── */}
      <StarField />

      {/* Système de Notification Pop-up avec animation de montage/démontage Framer Motion */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-8 right-8 z-50 min-w-[300px] p-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${notification.type === 'success'
              ? 'bg-green-50/90 dark:bg-green-900/40 border-green-200 dark:border-green-800'
              : 'bg-red-50/90 dark:bg-red-900/40 border-red-200 dark:border-red-800'
              }`}
          >
            <div className="flex items-start gap-3">
              {notification.type === 'success'
                ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                : <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
              <div className="flex-1">
                <p className="font-bold text-sm text-base-content">{notification.type === 'success' ? t('notification.success') : t('notification.error')}</p>
                <p className="text-sm mt-0.5 text-base-content/80">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="cursor-pointer text-sm font-bold opacity-50 hover:opacity-100 transition-opacity">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* En-tête (Hero) : Présentation de l'objectif de la page */}
      <section className="pt-20 sm:pt-30 pb-16 sm:pb-15 px-4 sm:px-6 relative z-10">

        <div className="max-w-7xl mx-auto text-center">

          <FadeIn>

            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-base-200 dark:bg-white/5 border border-base-content/5 dark:border-white/10 text-base-content text-sm font-semibold mb-8 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-[#F0A500]/50 transition-colors duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0A500] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F0A500]" />
              </span>
              <span className="tracking-wide uppercase text-xs">{t('badge')}</span>
            </div>

          </FadeIn>

          <FadeIn delay={0.1}>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              {t('title1')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0A500] to-[#FFD166] drop-shadow-[0_0_15px_rgba(240,165,0,0.5)]">
                {t('title2')}
              </span>
              {t('title3')}
            </h1>
          </FadeIn>

          {/* <FadeIn delay={0.2}>
            <p className="mt-8 text-lg sm:text-xl text-base-content/60 font-light max-w-2xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </FadeIn> */}

        </div>

      </section>

      {/* Corps Principal : Grille d'Informations (Gauche) et Formulaire (Droite) */}
      <section className="py-10 sm:py-15 px-4 sm:px-6 pb-30 relative z-10">

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-18 items-start">

          {/* Colonne Gauche : Les Coordonnées fixes */}
          <FadeIn direction="left" className="space-y-8 sm:space-y-10 lg:sticky lg:top-22">

            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('stayInTouch')}</h2>
              <p className="text-base sm:text-lg text-base-content/60 leading-relaxed font-light">
                {t('basedIn')}
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {[
                { icon: Mail, label: t('labels.email'), value: 'takoudjoumoisecalvin@gmail.com', href: 'mailto:takoudjoumoisecalvin@gmail.com' },
                { icon: Phone, label: t('labels.phone'), value: '+228 92 51 56 85', href: 'tel:+22892515685' },
                { icon: MapPin, label: t('labels.location'), value: 'Lomé, Togo', href: undefined },
              ].map((item) => (
                <div key={item.label} className="flex items-center sm:items-start gap-4 sm:gap-5 group">

                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.25rem] bg-base-200 dark:bg-white/5 border border-base-content/5 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:border-[#F0A500]/40 group-hover:bg-[#F0A500]/10 transition-all duration-500 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#F0A500]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-base-content/60 group-hover:text-[#F0A500] group-hover:scale-110 transition-all duration-500 relative z-10" />
                  </div>

                  {/* L'astuce "flex-1 min-w-0" empêche le texte de casser le conteneur flex parent sur mobile */}
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-1 sm:mb-1.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="cursor-pointer text-base-content font-bold text-sm sm:text-lg hover:text-[#F0A500] transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_rgba(240,165,0,0.3)] break-all sm:break-normal">{item.value}</a>
                    ) : (
                      <p className="text-base-content font-bold text-sm sm:text-lg transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(240,165,0,0.3)] truncate">{item.value}</p>
                    )}
                  </div>

                </div>
              ))}
            </div>

            <div className="pt-8 sm:pt-10 border-t border-base-content/10 dark:border-white/10">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 mb-4 sm:mb-6">{t('social')}</p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="cursor-pointer relative group w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-base-200 dark:bg-white/5 border border-base-content/5 dark:border-white/10 flex items-center justify-center text-base-content/60 hover:text-[#F0A500] transition-all duration-500 shrink-0 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#F0A500]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <s.icon className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(240,165,0,0.8)]" />
                  </a>
                ))}
              </div>
            </div>

          </FadeIn>

          {/* Colonne Droite : Formulaire */}
          <FadeIn direction="right" delay={0.2}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F0A500]/20 to-transparent rounded-[2.5rem] blur-[80px] opacity-30 pointer-events-none" />
              <div className="relative bg-base-100/50 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 sm:p-10 md:p-12 shadow-2xl shadow-black/10 border border-base-content/5 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">

                {/* handleSubmit intercepte l'évènement, bloque le rafraîchissement natif, valide, puis appelle onSubmit */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Champ de saisie : Nom */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-[0.25em] text-base-content/50 ml-2">{t('form.name')}</label>
                    <input id="name" type="text" {...register('name')} className={inputClasses(!!errors.name)} placeholder={t('form.namePlaceholder')} />
                    {errors.name && <p className="text-red-500 text-sm ml-2 font-medium">{errors.name.message}</p>}
                  </div>

                  {/* Champ de saisie : E-mail */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-[0.25em] text-base-content/50 ml-2">{t('form.email')}</label>
                    <input id="email" type="email" {...register('email')} className={inputClasses(!!errors.email)} placeholder={t('form.emailPlaceholder')} />
                    {errors.email && <p className="text-red-500 text-sm ml-2 font-medium">{errors.email.message}</p>}
                  </div>

                  {/* Champ de saisie : Sujet */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-[0.25em] text-base-content/50 ml-2">{t('form.subject')}</label>
                    <input id="subject" type="text" {...register('subject')} className={inputClasses(!!errors.subject)} placeholder={t('form.subjectPlaceholder')} />
                    {errors.subject && <p className="text-red-500 text-sm ml-2 font-medium">{errors.subject.message}</p>}
                  </div>

                  {/* Champ de saisie : Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-[0.25em] text-base-content/50 ml-2">{t('form.message')}</label>
                    <textarea id="message" rows={5} {...register('message')} className={`${inputClasses(!!errors.message)} resize-none`} placeholder={t('form.messagePlaceholder')} />
                    {errors.message && <p className="text-red-500 text-sm ml-2 font-medium">{errors.message.message}</p>}
                  </div>

                  {/* Bouton de soumission avec effet miroir ("Void & Or" style) */}
                  <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="cursor-pointer w-full mt-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-[#F0A500] to-[#FFD166] text-black font-extrabold text-base shadow-[0_0_20px_rgba(240,165,0,0.3)] hover:shadow-[0_0_30px_rgba(240,165,0,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 flex items-center gap-3 tracking-wide">
                      {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" />{t('form.submitting')}</>) : (<><Send className="w-5 h-5" />{t('form.submit')}</>)}
                    </span>
                  </motion.button>
                </form>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
