'use client';

/**
 * @file LoginForm.tsx
 * @description Écran d'accès à la régie : un champ, un bouton.
 *
 * @architecture
 * Le formulaire n'a aucun moyen de savoir si le mot de passe est bon : il
 * l'envoie à `/api/regie/session`, qui compare sur le serveur et pose le cookie
 * de session. En cas de succès, la page est **rechargée** — c'est le serveur
 * qui rend alors le panneau (`app/regie/page.tsx`), ce composant ne « passe »
 * jamais lui-même à l'écran suivant.
 */

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { BUTTON_PRIMARY, OVERLINE } from '@/components/ui/styles';

interface LoginFormProps {
  /** `false` si `VISUAL_ADMIN_PASSWORD` est absente : la régie est fermée. */
  isConfigured: boolean;
}

export default function LoginForm({ isConfigured }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSending || password === '') return;

    setIsSending(true);
    setError(null);
    try {
      const response = await fetch('/api/regie/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        window.location.reload();
        return; // le bouton reste occupé jusqu'au rechargement
      }
      const result = (await response.json().catch(() => ({}))) as { message?: string };
      setError(result.message ?? 'Connexion impossible.');
    } catch {
      setError('Problème de connexion. Vérifiez votre réseau et réessayez.');
    }
    setPassword('');
    setIsSending(false);
  };

  return (
    <main className="rg-login">
      <form className="rg-login-card" onSubmit={handleSubmit} noValidate>
        <div className="rg-login-clip" aria-hidden="true" />
        <p className={OVERLINE}>Accès réservé</p>
        <h1 className="rg-login-title">Régie lumière</h1>
        <p className="rg-login-lead">Le fond, les lumières et les boutons du site se règlent ici.</p>

        {isConfigured ? (
          <>
            {/* Identifiant fixe et invisible : un gestionnaire de mots de passe
                range chaque mot de passe sous un nom d'utilisateur. Sans ce
                champ, il ne sait ni où l'enregistrer ni comment le reproposer. */}
            <input type="text" name="username" autoComplete="username" value="regie" readOnly hidden />
            <label htmlFor="regie-password" className="rg-login-label">
              Mot de passe
            </label>
            <input
              id="regie-password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={error !== null}
              aria-describedby={error ? 'regie-password-error' : undefined}
              className="rg-login-input"
            />
            <div aria-live="polite">
              {error && (
                <p id="regie-password-error" role="alert" className="rg-login-error">
                  {error}
                </p>
              )}
            </div>
            <button type="submit" className={`${BUTTON_PRIMARY} w-full`} disabled={isSending || password === ''} aria-busy={isSending}>
              {isSending && <Loader2 aria-hidden="true" className="h-[1.1em] w-[1.1em] animate-spin motion-reduce:animate-none" />}
              {isSending ? 'Vérification…' : 'Entrer'}
            </button>
          </>
        ) : (
          <p className="rg-login-notice" role="status">
            La régie est fermée : la variable d’environnement <code>VISUAL_ADMIN_PASSWORD</code> n’est pas définie sur ce serveur.
          </p>
        )}

        {/* Lien ordinaire, et non `<Link>` : quitter la régie recharge le site en
            entier, comme on y est entré (voir `SecretTrigger`). La règle ESLint
            qui préfère `<Link>` est levée pour cette ligne. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="rg-login-back">
          Retour au site
        </a>
      </form>
    </main>
  );
}
