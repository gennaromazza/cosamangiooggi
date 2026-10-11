import type { FamilyMember } from '../types';

const day = (ms: number) => new Date(ms).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });

/** Stato dell'invito da mostrare, ricavato dalla scheda della persona (nessuna scritta se non c'è un invito). */
export function inviteLabel(member: FamilyMember, now = Date.now()): string | null {
  if (member.inviteStatus === 'answered' && member.inviteAnsweredAt) return `Ha risposto il ${day(member.inviteAnsweredAt)}`;
  if (member.inviteStatus === 'sent' && member.inviteExpiresAt) {
    return member.inviteExpiresAt < now ? 'Il link è scaduto' : `Link inviato, valido fino al ${day(member.inviteExpiresAt)}`;
  }
  if (member.inviteStatus === 'revoked') return 'Link annullato';
  return null;
}
