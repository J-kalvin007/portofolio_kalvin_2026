'use client';

/**
 * @file ContactForm.tsx
 * @description Formulaire de contact — direction « Reçu ».
 *
 * @architecture
 * Seul îlot client de la page Contact. Conserve intégralement le contrat
 * établi avec l'API (`lib/contact.ts`, `app/api/sendEmail/route.ts`) :
 *  - mêmes limites de longueur et même motif d'e-mail que le serveur, avec
 *    des messages traduits (validation native de react-hook-form) ;
 *  - champ « pot de miel » hors écran, hors tabulation, masqué aux lecteurs
 *    d'écran, envoyé vide par un humain ;
 *  - langue de l'interface transmise (`locale`), pour une réponse dans la
 *    même langue ;
 *  - `noValidate` : les messages traduits remplacent les bulles du navigateur.
 *
 * Changements par rapport à l'ancienne version : plus de framer-motion, de
 * reflet doré ni de notification flottante. Le résultat de l'envoi s'affiche
 * sous le bouton, dans une zone annoncée aux lecteurs d'écran, et reste
 * visible jusqu'à ce que le visiteur la ferme : une erreur qui disparaît
 * seule au bout de sept secondes peut ne jamais avoir été lue.
 */

import { useState, type ReactNode } from 'react';
import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react';
import { useForm, useWatch, type Control, type RegisterOptions } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { CONTACT_LIMITS, EMAIL_PATTERN, HONEYPOT_FIELD } from '@/lib/contact';
import { BUTTON_PRIMARY, FOCUS_RING } from '@/components/ui/styles';

type ContactFormData = { name: string; email: string; subject: string; message: string; [HONEYPOT_FIELD]?: string };
type FieldName = 'name' | 'email' | 'subject' | 'message';
type Notice = { type: 'success' | 'error'; message: string };

/** Part de la limite à partir de laquelle le compteur passe à l'orange, puis au rouge. */
const COUNTER_WARNING_RATIO = 0.9;

const FIELD =
  'w-full rounded-control border bg-canvas px-4 py-3 text-body text-ink placeholder:text-ink-faint ' +
  'transition-[border-color,box-shadow] duration-(--motion-fast) ' +
  'focus:border-focus focus:outline-none focus:ring-3 focus:ring-focus/20 ' +
  'aria-invalid:border-danger aria-invalid:focus:ring-danger/20 ' +
  'aria-[invalid=false]:border-line aria-[invalid=false]:hover:border-line-strong';

export default function ContactForm() {
  const t = useTranslations('contact_page');
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  /*
   * Règles de validation — mêmes limites et même motif d'e-mail que l'API
   * (lib/contact.ts) : un formulaire valide à l'écran l'est aussi côté serveur.
   *
   * Validation native de react-hook-form plutôt qu'un schéma Zod : pour quatre
   * champs, Zod et son adaptateur ajoutaient environ 70 Ko compressés à la page
   * (dont les messages de Zod dans toutes les langues). L'API, elle, garde Zod.
   * `required` porte le même message que la longueur minimale : un champ vide
   * est un champ trop court.
   */
  const lengthRules = (min: number, max: number, minMessage: string, maxMessage: string): RegisterOptions<ContactFormData> => ({
    required: minMessage,
    minLength: { value: min, message: minMessage },
    maxLength: { value: max, message: maxMessage },
  });
  const rules = {
    name: lengthRules(CONTACT_LIMITS.nameMin, CONTACT_LIMITS.nameMax, t('validation.nameMin'), t('validation.nameMax', { max: CONTACT_LIMITS.nameMax })),
    email: { required: t('validation.emailInvalid'), pattern: { value: EMAIL_PATTERN, message: t('validation.emailInvalid') } },
    subject: lengthRules(CONTACT_LIMITS.subjectMin, CONTACT_LIMITS.subjectMax, t('validation.subjectMin'), t('validation.subjectMax', { max: CONTACT_LIMITS.subjectMax })),
    message: lengthRules(CONTACT_LIMITS.messageMin, CONTACT_LIMITS.messageMax, t('validation.messageMin'), t('validation.messageMax')),
  } satisfies Record<FieldName, RegisterOptions<ContactFormData>>;

  // Pot de miel : aucune règle (un robot ne doit recevoir aucun signal).
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setNotice({ type: 'success', message: result.message || t('notification.successMessage') });
        reset();
      } else {
        setNotice({ type: 'error', message: result.message || t('notification.errorMessage') });
      }
    } catch {
      setNotice({ type: 'error', message: t('notification.networkError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Propriétés d'accessibilité communes à un champ. */
  const fieldProps = (name: FieldName) => ({
    id: name,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <section aria-labelledby="contact-form-title" className="rounded-card border border-line bg-surface p-6 shadow-e1 sm:p-8">
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="contact-form-title" className="text-subheading font-bold text-ink">{t('form.title')}</h2>
        <p className="text-caption text-ink-muted">{t('form.note')}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field number="01" name="name" label={t('form.name')} error={errors.name?.message}>
            <input
              {...fieldProps('name')}
              type="text"
              autoComplete="name"
              maxLength={CONTACT_LIMITS.nameMax}
              placeholder={t('form.namePlaceholder')}
              className={FIELD}
              {...register('name', rules.name)}
            />
          </Field>
          <Field number="02" name="email" label={t('form.email')} error={errors.email?.message}>
            <input
              {...fieldProps('email')}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={t('form.emailPlaceholder')}
              className={FIELD}
              {...register('email', rules.email)}
            />
          </Field>
        </div>

        <Field number="03" name="subject" label={t('form.subject')} error={errors.subject?.message}>
          <input
            {...fieldProps('subject')}
            type="text"
            autoComplete="off"
            maxLength={CONTACT_LIMITS.subjectMax}
            placeholder={t('form.subjectPlaceholder')}
            className={FIELD}
            {...register('subject', rules.subject)}
          />
        </Field>

        <Field
          number="04"
          name="message"
          label={t('form.message')}
          error={errors.message?.message}
          aside={<MessageCounter control={control} />}
        >
          <textarea
            {...fieldProps('message')}
            rows={6}
            maxLength={CONTACT_LIMITS.messageMax}
            placeholder={t('form.messagePlaceholder')}
            className={`${FIELD} resize-y`}
            {...register('message', rules.message)}
          />
        </Field>

        {/* ── Pot de miel anti-robot ────────────────────────────────────────
            Hors écran, retiré du parcours clavier et masqué aux lecteurs
            d'écran : aucun humain ne le voit ni ne le remplit. Un robot qui
            complète tous les champs le remplit, et l'API abandonne alors
            l'envoi en répondant « succès ». */}
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          <label htmlFor={HONEYPOT_FIELD}>Website</label>
          <input id={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" {...register(HONEYPOT_FIELD)} />
        </div>

        <div className="grid gap-4">
          <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className={`${BUTTON_PRIMARY} w-full sm:w-auto sm:justify-self-start`}>
            {isSubmitting && <Loader2 aria-hidden="true" className="h-[1.1em] w-[1.1em] animate-spin motion-reduce:animate-none" />}
            {isSubmitting ? t('form.submitting') : t('form.submit')}
          </button>

          {/* Résultat de l'envoi : annoncé, et affiché jusqu'à fermeture */}
          <div aria-live="polite" aria-atomic="true">
            {notice && (
              <div
                role={notice.type === 'error' ? 'alert' : 'status'}
                className={`flex items-start gap-3 rounded-control border p-4 ${notice.type === 'success' ? 'border-success/40 bg-success/10' : 'border-danger/40 bg-danger/10'}`}
              >
                {notice.type === 'success'
                  ? <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  : <XCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-danger" />}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{notice.type === 'success' ? t('notification.success') : t('notification.error')}</p>
                  <p className="mt-0.5 text-caption text-ink-soft [overflow-wrap:anywhere]">{notice.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  aria-label={t('notification.dismiss')}
                  className={`-m-1 shrink-0 cursor-pointer rounded-control p-1 text-ink-muted transition-colors hover:text-ink ${FOCUS_RING}`}
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ CHAMP — numéro, libellé, contrôle, message d'erreur
   ═══════════════════════════════════════════════════════════════════════════ */

interface FieldProps {
  number: string;
  name: FieldName;
  label: string;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}

function Field({ number, name, label, error, aside, children }: FieldProps) {
  return (
    <div className="grid content-start gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={name} className="flex items-baseline gap-2 text-caption font-semibold text-ink">
          <span aria-hidden="true" className="tabular-nums text-ink-muted">{number}</span>
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ▌ COMPTEUR DE CARACTÈRES
   ───────────────────────────────────────────────────────────────────────────
   Composant isolé : `useWatch` n'abonne que ce nœud au champ `message`, la
   page entière ne se re-rend pas à chaque frappe. Toujours visible — la
   limite est connue avant d'être atteinte — et décoratif pour les lecteurs
   d'écran (`maxLength` empêche de toute façon de la dépasser).
   ═══════════════════════════════════════════════════════════════════════════ */

function MessageCounter({ control }: { control: Control<ContactFormData> }) {
  const t = useTranslations('contact_page.form');
  const message = useWatch({ control, name: 'message' }) ?? '';
  const max = CONTACT_LIMITS.messageMax;
  const ratio = message.length / max;

  return (
    <span
      aria-hidden="true"
      className={`text-caption tabular-nums transition-colors duration-(--motion-fast) ${ratio >= 1 ? 'text-danger' : ratio >= COUNTER_WARNING_RATIO ? 'text-annotation' : 'text-ink-muted'}`}
    >
      {t('counter', { count: message.length, max })}
    </span>
  );
}
