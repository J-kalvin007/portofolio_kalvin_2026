/**
 * @file regie/page.tsx
 * @description Page de la régie : l'écran de mot de passe, ou le panneau.
 *
 * @architecture
 * Composant **serveur**. C'est lui — et non le navigateur — qui décide quoi
 * afficher, en vérifiant le cookie de session :
 *
 *  - session absente, expirée ou falsifiée → seul l'écran de connexion est
 *    rendu. Le panneau et la configuration ne sont **pas envoyés** au
 *    navigateur : il n'y a rien à débloquer en trafiquant l'état d'une page ;
 *  - session valide → le panneau, avec la configuration actuellement publiée.
 *
 * Un état React ne protège rien : il vit chez le visiteur, qui peut le changer.
 * Le cookie, lui, est signé par le serveur et illisible pour JavaScript.
 */

import { cookies } from 'next/headers';
import { SESSION_COOKIE, isAdminConfigured, isValidSessionToken } from '@/lib/visual/session';
import { readPublishedVisualConfig, visualStorageKind } from '@/lib/visual/store';
import LoginForm from './components/LoginForm';
import RegiePanel from './components/RegiePanel';

/** Lire un cookie rend la page dynamique ; le dire ici évite toute mise en cache. */
export const dynamic = 'force-dynamic';

export default async function RegiePage() {
  const cookieStore = await cookies();
  const isAuthenticated = isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!isAuthenticated) return <LoginForm isConfigured={isAdminConfigured()} />;

  return <RegiePanel initialConfig={await readPublishedVisualConfig({ fresh: true })} storage={visualStorageKind()} />;
}
