import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile } from '../types';

export const isLocalUser = (uid: string) => uid === 'demo-family-user' || uid.startsWith('local-');

/** Salva alcune scelte del profilo (sul database, o sul dispositivo per gli account senza accesso). */
export async function saveProfileFields(
  userId: string,
  profile: UserProfile,
  patch: Partial<UserProfile>,
  onLocalChange: (profile: UserProfile) => void,
): Promise<void> {
  if (isLocalUser(userId)) {
    const next = { ...profile, ...patch };
    localStorage.setItem(`profile_${userId}`, JSON.stringify(next));
    onLocalChange(next);
    return;
  }
  await updateDoc(doc(db, `users/${userId}`), patch as Record<string, unknown>);
}
