
'use client';

/**
 * @file Contact Page — Ultra-Premium V2
 * @description Page de contact cinématique avec formulaire interactif,
 * inputs avec spotlight magnétique, notification animée et effets premium.
 *
 * @remarks Direction artistique : « Correspondance ».
 * La page est traitée comme du papier à lettre de qualité — une seule source de
 * lumière, une feuille posée (et non flottante), de l'or employé avec parcimonie
 * sur les seuls points d'action. Les trois halos ambiants, le texte en dégradé
 * lumineux et la pastille d'icône en dégradé ont été retirés : ce sont les trois
 * signatures qui font lire une interface comme « générée ».
 */

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowUpRight, Send, X } from 'lucide-react';
import { useForm, useWatch, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocale, useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import StardustCursor from '@/components/animations/StardustCursor';

type ContactFormData = { name: string; email: string; subject: string; message: string };

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ TOKENS DE LA PAGE
   ───────────────────────────────────────────────────────────────────────────
   `#F0A500` et `rgba(240,165,0,…)` étaient recopiés une douzaine de fois dans
   les classes. Une seule déclaration ici : changer l'or du thème devient une
   modification à un endroit, pas une chasse au littéral.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Or « Void & Or ». Réservé aux dégradés en ligne — partout ailleurs, on passe par le token `primary`. */
const GOLD_RGB = '240,165,0';

/** Longueur maximale du message — source unique partagée par le schéma Zod et le compteur. */
const MESSAGE_MAX_LENGTH = 2000;

/** Seuil (en %) à partir duquel le compteur de caractères devient visible puis alarmant. */
const COUNTER_VISIBLE_RATIO = 0.6;
const COUNTER_WARNING_RATIO = 0.9;

/** Durée d'affichage d'une notification avant disparition automatique (ms). */
const NOTIFICATION_TIMEOUT = 7000;

/** Décélération franche, sans rebond — la même sur toute l'application. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const t = useTranslations('contact_page');
  const locale = useLocale();
  const isFrench = locale === 'fr';
  const shouldReduceMotion = useReducedMotion();

  const contactSchema = z.object({
    name: z.string().min(2, t('validation.nameMin')),
    email: z.string().email(t('validation.emailInvalid')),
    subject: z.string().min(3, t('validation.subjectMin')),
    message: z.string().min(10, t('validation.messageMin')).max(MESSAGE_MAX_LENGTH, t('validation.messageMax')),
  });

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setNotification(null);
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setNotification({ type: 'success', message: result.message || t('notification.successMessage') });
        reset();
      } else {
        setNotification({ type: 'error', message: result.message || t('notification.errorMessage') });
      }
    } catch {
      setNotification({ type: 'error', message: t('notification.networkError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ Disparition automatique de la notification
     Une bannière qui reste indéfiniment finit par être ignorée, puis par gêner.
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!notification) return;

    const timeout = setTimeout(() => setNotification(null), NOTIFICATION_TIMEOUT);
    return () => clearTimeout(timeout);
  }, [notification]);

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ SPOTLIGHT DES CARTES DE CONTACT
     ───────────────────────────────────────────────────────────────────────
     Correction majeure : la position du curseur était stockée dans un état
     unique au niveau de la page. Deux conséquences —
       1. les trois cartes partageaient la même position : survoler la première
          déplaçait le reflet des deux autres ;
       2. chaque `mousemove` déclenchait un rendu complet de la page, soit une
          soixantaine de rendus par seconde pendant le survol.
     Les coordonnées sont désormais écrites en variables CSS sur la carte
     concernée : reflet correct, et zéro rendu React.
     ═══════════════════════════════════════════════════════════════════════ */
  const handleCardPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;

    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();

    card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════
     ▌ HABILLAGE DES CHAMPS
     Bordure d'un pixel plutôt que deux, halo de focus net, et une transition
     courte : un champ doit répondre instantanément, pas se dérouler.
     ═══════════════════════════════════════════════════════════════════════ */
  const inputClasses = (hasError: boolean, field: string) =>
    `w-full rounded-xl px-4 py-3.5 outline-none border bg-base-100/60 dark:bg-white/[0.025]
     text-base-content placeholder:text-base-content/25
     transition-[border-color,box-shadow,background-color] duration-200 ease-out ${hasError
      ? 'border-red-400/70 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
      : focusedField === field
        ? `border-primary/70 shadow-[0_0_0_3px_rgba(${GOLD_RGB},0.14)] bg-base-100/90 dark:bg-white/[0.05]`
        : 'border-base-content/[0.12] dark:border-white/[0.09] hover:border-base-content/25'
    }`;

  const CONTACTS = [
    { icon: '/svg/email_02.svg', label: t('labels.email'), value: 'takoudjoumoisecalvin@gmail.com', href: 'mailto:takoudjoumoisecalvin@gmail.com' },
    { icon: '/svg/phone_01.svg', label: t('labels.phone'), value: '+228 92 51 56 85', href: 'tel:+22892515685' },
    { icon: '/svg/location_01.svg', label: t('labels.location'), value: 'Lomé, Togo', href: undefined },
  ];

  const SOCIALS = [
    { icon: '/svg/whatsapp_02.svg', href: 'https://wa.me/22892515685', label: 'WhatsApp' },
    { icon: '/svg/instagram.svg', href: 'https://instagram.com/', label: 'Instagram' },
    { icon: '/svg/snapchat.svg', href: 'https://snapchat.com/', label: 'Snapchat' },
    { icon: '/svg/telegram_02.svg', href: 'https://t.me/yourusername', label: 'Telegram' },
    { icon: '/svg/facebook.svg', href: 'https://facebook.com/', label: 'Facebook' },
    { icon: '/svg/tiktok.svg', href: 'https://tiktok.com/', label: 'TikTok' },
    { icon: '/svg/github.svg', href: 'https://github.com/J-kalvin007', label: 'GitHub' },
    { icon: '/svg/linkedin.svg', href: 'https://linkedin.com/', label: 'LinkedIn' },
  ];

  /* ── Libellés hors catalogue i18n (aucune clé nouvelle n'est requise) ───── */
  const formHeading = isFrench ? 'Envoyez un message' : 'Send a message';
  const formPromise = isFrench ? 'Réponse sous 24 heures' : 'Answered within 24 hours';
  const formEyebrow = isFrench ? 'Écrire' : 'Write';
  const dismissLabel = isFrench ? 'Fermer la notification' : 'Dismiss notification';

  return (
    <div className="min-h-screen bg-base-100 text-base-content overflow-hidden relative">
      <StardustCursor />

      {/* ═══ ATMOSPHÈRE ═══
          Une seule source de lumière, en haut à droite, à l'aplomb du formulaire.
          Trois halos concurrents s'annulaient visuellement et coûtaient trois
          compositions de flou plein écran sur mobile. */}
      <div
        aria-hidden="true"
        className="absolute -top-40 right-[-10%] w-[min(760px,90vw)] h-[min(760px,90vw)] rounded-full
                   bg-primary/[0.05] blur-[160px] pointer-events-none"
      />

      {/* Trame de fond : une grille de points d'un pixel, presque subliminale.
          C'est elle qui donne l'échelle et l'impression de papier millimétré. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />

      {/* ═══ NOTIFICATION ═══ */}
      <div aria-live="polite" aria-atomic="true" className="contents">
        <AnimatePresence>
          {notification && (
            <motion.div
              role={notification.type === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              /* `inset-x-4` sur mobile : la largeur minimale de 320 px débordait
                 de l'écran sur les petits téléphones. */
              className={`fixed top-4 sm:top-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-[min(380px,calc(100vw-3rem))]
                          z-50 rounded-2xl overflow-hidden backdrop-blur-2xl border shadow-[0_24px_56px_-20px_rgba(0,0,0,0.35)]
                          ${notification.type === 'success'
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-300/50 dark:border-emerald-800/60'
                  : 'bg-red-50/90 dark:bg-red-950/70 border-red-300/50 dark:border-red-800/60'
                }`}
            >
              <div className="flex items-start gap-3 p-5">
                <div className={`p-1.5 rounded-xl shrink-0 ${notification.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/60' : 'bg-red-100 dark:bg-red-900/60'}`}>
                  {notification.type === 'success'
                    ? <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{notification.type === 'success' ? t('notification.success') : t('notification.error')}</p>
                  <p className="text-sm mt-0.5 text-base-content/70 break-words">{notification.message}</p>
                </div>

                <button
                  onClick={() => setNotification(null)}
                  aria-label={dismissLabel}
                  className="cursor-pointer shrink-0 -m-1 p-1 rounded-md text-base-content/30 hover:text-base-content/80
                             hover:bg-base-content/[0.06] transition-colors
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-content/30"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Filet de progression : le temps restant est montré, pas subi. */}
              {!shouldReduceMotion && (
                <motion.div
                  aria-hidden="true"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: NOTIFICATION_TIMEOUT / 1000, ease: 'linear' }}
                  className={`h-[2px] origin-left ${notification.type === 'success' ? 'bg-emerald-500/50' : 'bg-red-500/50'}`}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="pt-28 sm:pt-36 pb-8 sm:pb-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass text-sm font-semibold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="tracking-[0.28em] uppercase text-[11px] text-base-content/60">{t('badge')}</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            {/* Le mot accentué est en or plein, souligné d'un filet.
                Le dégradé + `drop-shadow` d'origine produisait un halo diffus qui
                brouillait le contour des lettres et lisait comme un effet, pas
                comme une intention typographique. */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.035em] leading-[1.03] text-balance">
              {t('title1')}
              <span className="relative inline-block text-primary">
                {t('title2')}
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.1, delay: 0.5, ease: EASE_OUT_EXPO }}
                  className="absolute -bottom-1 left-0 right-0 h-[2px] origin-left bg-primary/35 rounded-full"
                />
              </span>
              {t('title3')}
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-7 text-lg text-base-content/50 font-light max-w-2xl mx-auto leading-[1.75] text-pretty">
              {t('description')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 pb-28 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">

          {/* ── LEFT: Contact Info (2 cols) ── */}
          <FadeIn direction="left" className="lg:col-span-2 lg:sticky lg:top-24 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-3 text-balance">{t('stayInTouch')}</h2>
              <p className="text-base text-base-content/50 leading-[1.7] font-light">{t('basedIn')}</p>
            </div>

            {/* Contact cards */}
            <div className="space-y-3">
              {CONTACTS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: 0.08 + i * 0.08, duration: 0.55, ease: EASE_OUT_EXPO }}
                  onPointerMove={handleCardPointerMove}
                  style={{ '--spot-x': '50%', '--spot-y': '50%' } as React.CSSProperties}
                  className="group relative p-5 rounded-2xl overflow-hidden cursor-default
                             bg-base-100/70 dark:bg-white/[0.022]
                             border border-base-content/[0.07] dark:border-white/[0.06]
                             shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_1px_2px_-1px_rgba(0,0,0,0.05)]
                             dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]
                             hover:border-primary/30 transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                             hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_12px_28px_-16px_rgba(0,0,0,0.28)]"
                >
                  {/* Spotlight — ancré sur cette carte, piloté par variables CSS */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(260px circle at var(--spot-x) var(--spot-y), rgba(${GOLD_RGB},0.09), transparent 55%)` }}
                  />

                  <div className="relative z-10 flex items-center gap-4">
                    {/* Socle d'icône : matière mate, pas de pastille en dégradé.
                        Au survol, c'est l'or qui vient — un seul changement d'état. */}
                    <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center
                                    bg-base-200/70 dark:bg-white/[0.045]
                                    border border-base-content/[0.05] dark:border-white/[0.05]
                                    group-hover:bg-primary group-hover:border-primary
                                    transition-colors duration-500">
                      <Image
                        src={item.icon}
                        alt=""
                        aria-hidden="true"
                        width={20}
                        height={20}
                        className="w-5 h-5 opacity-55 group-hover:opacity-100 group-hover:brightness-0 transition-[opacity,filter] duration-500"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-base-content/35 mb-1">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="cursor-pointer text-base-content font-bold text-sm hover:text-primary
                                     transition-colors duration-300 break-all sm:break-normal inline-flex items-center gap-1.5
                                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 rounded-sm"
                        >
                          {item.value}
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300 motion-reduce:transform-none" aria-hidden="true" />
                        </a>
                      ) : (
                        <p className="text-base-content font-bold text-sm">{item.value}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social links */}
            <div className="pt-6 border-t border-base-content/[0.07]">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-base-content/30 mb-4">{t('social')}</p>
              <div className="flex flex-wrap gap-2.5">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="cursor-pointer group relative w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden
                               bg-base-100/70 dark:bg-white/[0.03]
                               border border-base-content/[0.07] dark:border-white/[0.06]
                               hover:border-primary/40 hover:-translate-y-0.5 motion-reduce:transform-none
                               transition-[border-color,transform] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                  >
                    <Image
                      src={s.icon}
                      alt=""
                      aria-hidden="true"
                      width={20}
                      height={20}
                      className="w-[18px] h-[18px] relative z-10 opacity-55 group-hover:opacity-100
                                 transition-opacity duration-[400ms] dark:invert dark:group-hover:invert-0"
                    />
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* ── RIGHT: Form (3 cols) ── */}
          <FadeIn direction="right" delay={0.15} className="lg:col-span-3">
            <div className="relative">
              {/* La feuille est posée : ombre de contact courte + ombre portée longue.
                  Le halo flou en dégradé qui l'entourait la faisait léviter — c'est
                  précisément ce qui trahit une maquette générée. */}
              <div
                className="relative rounded-[2rem] p-7 sm:p-10 md:p-12 overflow-hidden
                           bg-base-100/80 dark:bg-white/[0.028] backdrop-blur-xl
                           border border-base-content/[0.07] dark:border-white/[0.06]
                           shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_2px_4px_-2px_rgba(0,0,0,0.06),0_40px_80px_-40px_rgba(0,0,0,0.4)]
                           dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_40px_80px_-40px_rgba(0,0,0,0.85)]"
              >
                {/* En-tête du formulaire — typographie plutôt que pastille colorée.
                    Remplace `t('form.name').replace('Nom Complet', …)`, qui affichait
                    « Full Name » comme titre dès que la locale n'était pas le français. */}
                <div className="mb-9">
                  <div className="flex items-center gap-3 mb-4">
                    <span aria-hidden="true" className="h-px w-7 bg-primary/60" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">{formEyebrow}</span>
                  </div>
                  <h3 className="font-bold text-2xl sm:text-[1.75rem] tracking-[-0.025em] text-base-content leading-tight">
                    {formHeading}
                  </h3>
                  <p className="text-sm text-base-content/45 mt-1.5">{formPromise}</p>
                </div>

                {/* `noValidate` : sans lui, la validation native du navigateur bloque
                    l'envoi avec sa propre bulle avant que Zod ne puisse afficher les
                    messages traduits. Les deux systèmes se disputaient le champ e-mail. */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                  {/* Name & Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-[0.22em] text-base-content/40 ml-0.5">{t('form.name')}</label>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        {...register('name')}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className={inputClasses(!!errors.name, 'name')}
                        placeholder={t('form.namePlaceholder')}
                      />
                      {errors.name && <p id="name-error" className="text-red-500 text-xs ml-0.5 font-medium">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-[0.22em] text-base-content/40 ml-0.5">{t('form.email')}</label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        {...register('email')}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={inputClasses(!!errors.email, 'email')}
                        placeholder={t('form.emailPlaceholder')}
                      />
                      {errors.email && <p id="email-error" className="text-red-500 text-xs ml-0.5 font-medium">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-[11px] font-bold uppercase tracking-[0.22em] text-base-content/40 ml-0.5">{t('form.subject')}</label>
                    <input
                      id="subject"
                      type="text"
                      autoComplete="off"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? 'subject-error' : undefined}
                      {...register('subject')}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      className={inputClasses(!!errors.subject, 'subject')}
                      placeholder={t('form.subjectPlaceholder')}
                    />
                    {errors.subject && <p id="subject-error" className="text-red-500 text-xs ml-0.5 font-medium">{errors.subject.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-4 ml-0.5">
                      <label htmlFor="message" className="block text-[11px] font-bold uppercase tracking-[0.22em] text-base-content/40">{t('form.message')}</label>
                      {/* Compteur isolé : il s'abonne au seul champ `message`,
                          la page entière ne se re-rend pas à chaque frappe. */}
                      <MessageCounter control={control} />
                    </div>
                    <textarea
                      id="message"
                      rows={5}
                      maxLength={MESSAGE_MAX_LENGTH}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      {...register('message')}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      className={`${inputClasses(!!errors.message, 'message')} resize-none`}
                      placeholder={t('form.messagePlaceholder')}
                    />
                    {errors.message && <p id="message-error" className="text-red-500 text-xs ml-0.5 font-medium">{errors.message.message}</p>}
                  </div>

                  {/* ── Bouton d'envoi ────────────────────────────────────────
                      Le balayage lumineux ne se déclenche plus au survol (décoratif)
                      mais pendant l'envoi (informatif) : le mouvement rend compte
                      d'un état réel du système. */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    whileHover={shouldReduceMotion || isSubmitting ? undefined : { scale: 1.01 }}
                    whileTap={shouldReduceMotion || isSubmitting ? undefined : { scale: 0.985 }}
                    transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                    className="cursor-pointer w-full mt-3 px-8 py-[1.125rem] rounded-xl relative overflow-hidden group
                               bg-primary text-primary-content font-bold text-base tracking-[0.01em]
                               flex items-center justify-center gap-3
                               shadow-[0_1px_2px_rgba(0,0,0,0.14),0_16px_32px_-18px_rgba(0,0,0,0.7)]
                               hover:brightness-[1.06]
                               transition-[filter,box-shadow] duration-300
                               disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
                  >
                    {isSubmitting && !shouldReduceMotion && (
                      <motion.span
                        aria-hidden="true"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-3">
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />{t('form.submitting')}</>
                      ) : (
                        <><Send className="w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" aria-hidden="true" />{t('form.submit')}</>
                      )}
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

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ COMPTEUR DE CARACTÈRES
   ───────────────────────────────────────────────────────────────────────────
   Le schéma plafonne le message à 2 000 caractères, mais l'utilisateur ne
   l'apprenait qu'au moment de l'échec de l'envoi. Le compteur reste invisible
   tant qu'il n'y a rien à signaler, apparaît aux deux tiers, puis passe à
   l'ambre à l'approche de la limite.

   Composant isolé volontairement : `useWatch` abonne ce seul nœud au champ,
   là où un `watch()` dans la page aurait re-rendu tout le contenu à chaque frappe.
   ═══════════════════════════════════════════════════════════════════════════ */
function MessageCounter({ control }: { control: Control<ContactFormData> }) {
  const message = useWatch({ control, name: 'message' }) ?? '';
  const ratio = message.length / MESSAGE_MAX_LENGTH;

  if (ratio < COUNTER_VISIBLE_RATIO) return null;

  return (
    <span
      aria-hidden="true"
      className={`text-[11px] font-semibold tabular-nums tracking-wide transition-colors duration-300 ${ratio >= 1
        ? 'text-red-500'
        : ratio >= COUNTER_WARNING_RATIO
          ? 'text-amber-500'
          : 'text-base-content/35'
        }`}
    >
      {message.length} / {MESSAGE_MAX_LENGTH}
    </span>
  );
}