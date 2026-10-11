const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Parole di riempimento che precedono l'argomento del comando ("il", "la", "un po' di", "della"...)
const LEADING_FILLERS =
  /^(?:(?:il|lo|la|l'|i|gli|le|un|uno|una|un po'? di|po'? di|del|dello|della|dei|degli|delle|di|d'|al|alla|ho)\s+)+/;

/**
 * Toglie da un comando vocale le frasi-comando (solo come parole intere) e gli articoli iniziali,
 * lasciando l'argomento: "aggiungi la mela alla spesa" → "mela".
 * Importante: mai rimuovere sillabe dentro le parole ("mela" non deve diventare "me").
 */
export function extractVoiceArgument(command: string, phrases: string[]): string {
  let text = ` ${command.toLowerCase()} `;
  for (const phrase of [...phrases].sort((a, b) => b.length - a.length)) {
    text = text.replace(new RegExp(`(^|\\s)${escapeRegex(phrase.toLowerCase())}(?=\\s|$)`, 'g'), ' ');
  }
  text = text.replace(/\s+/g, ' ').trim();
  return text.replace(LEADING_FILLERS, '').trim();
}
