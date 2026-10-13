import { Capacitor } from '@capacitor/core';

/** Sito ufficiale: da qui l'app sa qual è l'ultima versione e da qui si scarica. */
export const SITE_URL = 'https://che-cucino-oggi.web.app';
export const APK_URL = `${SITE_URL}/download/che-cucino-oggi.apk`;

const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;
const LAST_CHECK_KEY = 'update_last_check';
const DISMISSED_KEY = 'update_dismissed_build';

export interface UpdateInfo {
  /** Numero della build disponibile sul sito */
  build: number;
  date: string | null;
  /** Versione leggibile e indirizzo del file da scaricare (con la versione nel nome) */
  version: string | null;
  apkUrl: string;
}

/** Vero se la build sul sito è più recente di quella installata. */
export const isNewer = (available: number, installed: number): boolean =>
  Number.isFinite(available) && available > 0 && available > installed;

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage non disponibile */
  }
};

/**
 * Nell'app Android chiede al sito se esiste una versione più nuova.
 * Controlla al massimo ogni 6 ore (o subito se `force`), e non ripropone una versione già rimandata.
 */
export async function checkForUpdate(force = false): Promise<UpdateInfo | null> {
  if (!Capacitor.isNativePlatform() || __BUILD_NUMBER__ <= 0) return null;
  const last = Number(read(LAST_CHECK_KEY)) || 0;
  if (!force && Date.now() - last < CHECK_EVERY_MS) return null;
  try {
    const response = await fetch(`${SITE_URL}/version.json`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    write(LAST_CHECK_KEY, String(Date.now()));
    const build = Number(data.number);
    if (!isNewer(build, __BUILD_NUMBER__)) return null;
    if (Number(read(DISMISSED_KEY)) === build) return null;
    const file = typeof data.apk === 'string' && /^[\w.-]+\.apk$/.test(data.apk) ? data.apk : null;
    return {
      build,
      date: typeof data.date === 'string' ? data.date : null,
      version: typeof data.version === 'string' ? data.version : null,
      apkUrl: file ? `${SITE_URL}/download/${file}` : APK_URL,
    };
  } catch {
    return null; // senza rete si riprova più tardi
  }
}

export const dismissUpdate = (build: number) => write(DISMISSED_KEY, String(build));

export type VersionStatus =
  | { state: 'latest'; version: string | null }
  | { state: 'outdated'; update: UpdateInfo }
  | { state: 'ahead' }
  | { state: 'offline' };

/** Confronto tra la build sul sito e quella installata. "ahead": l'app installata è più nuova di quella sul sito (prova). */
export const compareBuilds = (available: number, installed: number): 'outdated' | 'latest' | 'ahead' | 'unknown' => {
  if (!Number.isFinite(available) || available <= 0) return 'unknown';
  if (available > installed) return 'outdated';
  return available === installed ? 'latest' : 'ahead';
};

/** Controllo richiesto dall'utente: sempre aggiornato, senza attese né versioni rimandate. */
export async function checkVersionNow(): Promise<VersionStatus> {
  try {
    const response = await fetch(`${SITE_URL}/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return { state: 'offline' };
    const data = await response.json();
    const build = Number(data.number);
    const result = compareBuilds(build, __BUILD_NUMBER__);
    if (result === 'unknown') return { state: 'offline' };
    if (result === 'ahead') return { state: 'ahead' };
    const version = typeof data.version === 'string' ? data.version : null;
    if (result === 'latest') return { state: 'latest', version };
    const file = typeof data.apk === 'string' && /^[\w.-]+\.apk$/.test(data.apk) ? data.apk : null;
    return {
      state: 'outdated',
      update: { build, date: typeof data.date === 'string' ? data.date : null, version, apkUrl: file ? `${SITE_URL}/download/${file}` : APK_URL },
    };
  } catch {
    return { state: 'offline' };
  }
}
