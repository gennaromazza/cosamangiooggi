import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import type { FamilyMember, UserProfile } from '../types';

const isLocalUser = (uid: string) => uid === 'demo-family-user' || uid.startsWith('local-');

const readLocalMembers = (uid: string): FamilyMember[] => {
  try {
    return JSON.parse(localStorage.getItem(`members_${uid}`) || '[]') as FamilyMember[];
  } catch {
    return [];
  }
};

/** Il nome dell'account è cambiato: la persona collegata all'account (quella creata dall'accesso) lo segue. */
export async function syncSelfMemberName(uid: string, name: string): Promise<void> {
  if (isLocalUser(uid)) {
    const members = readLocalMembers(uid);
    if (!members.some((m) => m.isSelf)) return;
    localStorage.setItem(`members_${uid}`, JSON.stringify(members.map((m) => (m.isSelf ? { ...m, name } : m))));
    return;
  }
  const snap = await getDocs(query(collection(db, `users/${uid}/familyMembers`), where('isSelf', '==', true)));
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { name })));
}

/** La persona collegata all'account è stata rinominata in Famiglia: il nome dell'account la segue. */
export async function applyAccountName(uid: string, name: string, profile: UserProfile | null): Promise<UserProfile | null> {
  if (!profile) return null;
  const updated = { ...profile, name };
  if (isLocalUser(uid)) {
    try {
      localStorage.setItem(`profile_${uid}`, JSON.stringify(updated));
    } catch {
      /* storage non disponibile */
    }
    return updated;
  }
  if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: name });
  await updateDoc(doc(db, 'users', uid), { name });
  return updated;
}
