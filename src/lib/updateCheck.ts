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
    return { build, date: typeof data.date === 'string' ? data.date : null };
  } catch {
    return null; // senza rete si riprova più tardi
  }
}

export const dismissUpdate = (build: number) => write(DISMISSED_KEY, String(build));
