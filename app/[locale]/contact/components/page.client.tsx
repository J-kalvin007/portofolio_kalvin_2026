'use client';

/**
 * @file Contact Page — Ultra-Premium V2
 * @description Page de contact cinématique avec formulaire interactif,
 * inputs avec spotlight magnétique, notification animée et effets premium.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowUpRight, Sparkles, SendToBack, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import StardustCursor from '@/components/animations/StardustCursor';

type ContactFormData = { name: string; email: string; subject: string; message: string };

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [spotPos, setSpotPos] = useState({ x: 0, y: 0 });

  const t = useTranslations('contact_page');

  const contactSchema = z.object({
    name: z.string().min(2, t('validation.nameMin')),
    email: z.string().email(t('validation.emailInvalid')),
    subject: z.string().min(3, t('validation.subjectMin')),
    message: z.string().min(10, t('validation.messageMin')).max(2000, t('validation.messageMax')),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
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

  const inputClasses = (hasError: boolean, field: string) =>
    `w-full bg-white/60 dark:bg-white/[0.03] backdrop-blur-md border-2 rounded-2xl px-5 py-4 outline-none transition-all duration-500 placeholder:text-base-content/25 text-base-content ${hasError
      ? 'border-red-400/60 focus:border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
      : focusedField === field
        ? 'border-primary/60 shadow-[0_0_0_4px_rgba(240,165,0,0.1),0_0_20px_rgba(240,165,0,0.05)]'
        : 'border-base-content/10 dark:border-white/10 hover:border-primary/30'
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

  return (
    <div className="min-h-screen bg-base-100 text-base-content overflow-hidden relative">
      <StardustCursor />

      {/* Ambient orbs */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/[0.04] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* ═══ NOTIFICATION ═══ */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 min-w-[320px] p-5 rounded-2xl shadow-2xl backdrop-blur-2xl border ${notification.type === 'success'
              ? 'bg-green-50/90 dark:bg-green-950/60 border-green-300/50 dark:border-green-700/50'
              : 'bg-red-50/90 dark:bg-red-950/60 border-red-300/50 dark:border-red-700/50'
              }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-xl ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{notification.type === 'success' ? t('notification.success') : t('notification.error')}</p>
                <p className="text-sm mt-0.5 text-base-content/70">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="cursor-pointer text-base-content/30 hover:text-base-content/80 transition-colors p-1">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ HERO ═══ */}
      <section className="pt-28 sm:pt-36 pb-8 sm:pb-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass text-sm font-semibold mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <span className="tracking-[0.2em] uppercase text-xs text-base-content/60">{t('badge')}</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              {t('title1')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FFD166] drop-shadow-[0_0_20px_rgba(240,165,0,0.2)]">
                {t('title2')}
              </span>
              {t('title3')}
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-6 text-lg text-base-content/45 font-light max-w-2xl mx-auto leading-relaxed">{t('description')}</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 pb-28 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">

          {/* ── LEFT: Contact Info (2 cols) ── */}
          <FadeIn direction="left" className="lg:col-span-2 lg:sticky lg:top-24 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{t('stayInTouch')}</h2>
              <p className="text-base text-base-content/50 leading-relaxed font-light">{t('basedIn')}</p>
            </div>

            {/* Contact cards */}
            <div className="space-y-4">
              {CONTACTS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                  onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setSpotPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
                  className="group relative p-5 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-base-content/[0.06] dark:border-white/[0.06] hover:border-primary/30 transition-all duration-700 shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden cursor-default"
                >
                  {/* Spotlight */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: `radial-gradient(300px circle at ${spotPos.x}px ${spotPos.y}px, rgba(240,165,0,0.08), transparent 50%)` }} />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-base-200/80 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-[#FFD166] group-hover:shadow-[0_0_20px_rgba(240,165,0,0.3)] transition-all duration-500">
                      <Image src={item.icon} alt={item.label} width={20} height={20} className="w-5 h-5 group-hover:brightness-0 transition-all duration-500 opacity-60 group-hover:opacity-100" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/35 mb-1">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="cursor-pointer text-base-content font-bold text-sm hover:text-primary transition-colors duration-300 break-all sm:break-normal flex items-center gap-1.5">
                          {item.value}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
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
            <div className="pt-6 border-t border-base-content/[0.06]">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-base-content/30 mb-4">{t('social')}</p>
              <div className="flex flex-wrap gap-3">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="cursor-pointer group relative w-12 h-12 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-base-content/[0.06] dark:border-white/[0.06] flex items-center justify-center hover:border-primary/30 hover:shadow-[0_0_15px_rgba(240,165,0,0.15)] transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Image src={s.icon} alt={s.label} width={20} height={20} className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100 dark:invert dark:group-hover:invert-0" />
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* ── RIGHT: Form (3 cols) ── */}
          <FadeIn direction="right" delay={0.15} className="lg:col-span-3">
            <div className="relative">
              {/* Form glow backdrop */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-[3rem] blur-[60px] opacity-40 pointer-events-none" />

              <div
                className="relative bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 md:p-12 shadow-2xl shadow-black/[0.06] dark:shadow-black/30 border border-base-content/[0.06] dark:border-white/[0.06] overflow-hidden"
              >
                {/* Form header accent */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#FFD166] flex items-center justify-center shadow-[0_0_15px_rgba(240,165,0,0.3)]">
                    <SendToBack className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-base-content">{t('form.name').replace('Nom Complet', 'Envoyez un message')}</h3>
                    <p className="text-xs text-base-content/40">Réponse sous 24h garantie</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name & Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 ml-1">{t('form.name')}</label>
                      <input id="name" type="text" {...register('name')}
                        onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                        className={inputClasses(!!errors.name, 'name')} placeholder={t('form.namePlaceholder')} />
                      {errors.name && <p className="text-red-500 text-xs ml-1 font-medium">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 ml-1">{t('form.email')}</label>
                      <input id="email" type="email" {...register('email')}
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        className={inputClasses(!!errors.email, 'email')} placeholder={t('form.emailPlaceholder')} />
                      {errors.email && <p className="text-red-500 text-xs ml-1 font-medium">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 ml-1">{t('form.subject')}</label>
                    <input id="subject" type="text" {...register('subject')}
                      onFocus={() => setFocusedField('subject')} onBlur={() => setFocusedField(null)}
                      className={inputClasses(!!errors.subject, 'subject')} placeholder={t('form.subjectPlaceholder')} />
                    {errors.subject && <p className="text-red-500 text-xs ml-1 font-medium">{errors.subject.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-[0.2em] text-base-content/40 ml-1">{t('form.message')}</label>
                    <textarea id="message" rows={5} {...register('message')}
                      onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                      className={`${inputClasses(!!errors.message, 'message')} resize-none`} placeholder={t('form.messagePlaceholder')} />
                    {errors.message && <p className="text-red-500 text-xs ml-1 font-medium">{errors.message.message}</p>}
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="cursor-pointer w-full mt-2 px-8 py-5 rounded-2xl bg-gradient-to-r from-primary to-[#FFD166] text-black font-bold text-base shadow-[0_0_25px_rgba(240,165,0,0.25)] hover:shadow-[0_0_40px_rgba(240,165,0,0.4)] transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 overflow-hidden relative group"
                  >
                    {/* Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10 flex items-center gap-3 tracking-wide">
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />{t('form.submitting')}</>
                      ) : (
                        <><Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />{t('form.submit')}</>
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
