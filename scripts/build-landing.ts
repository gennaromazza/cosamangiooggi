/**
 * Prepara la cartella landing-dist (sito ufficiale): pagine, icone, font, e se presente l'APK.
 * Uso: SITE_URL=... APP_URL=... APK=percorso/app-debug.apk npx tsx scripts/build-landing.ts
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fillPlaceholders } from './landing';
import { PAGES, renderPage } from './landing-pages';

const out = 'landing-dist';
const apkSource = process.env.APK;
const apkName = apkSource && existsSync(apkSource) ? basename(apkSource) : null;
const vars = {
  siteUrl: process.env.SITE_URL || 'https://che-cucino-oggi.web.app',
  appUrl: process.env.APP_URL || 'https://gen-lang-client-0532460534.web.app',
  apkPath: apkName ? `/download/${apkName}` : undefined,
};

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'fonts'), { recursive: true });

for (const name of readdirSync('landing')) {
  if (statSync(join('landing', name)).isDirectory()) {
    cpSync(join('landing', name), join(out, name), { recursive: true });
    continue;
  }
  const text = readFileSync(join('landing', name), 'utf8');
  writeFileSync(join(out, name), fillPlaceholders(text, vars));
}
// Pagine guida
for (const page of PAGES) {
  writeFileSync(join(out, `${page.slug}.html`), renderPage(page, vars.siteUrl.replace(/\/$/, ''), vars.appUrl.replace(/\/$/, '')));
}
for (const icon of ['icon-192.png', 'icon-512.png', 'favicon-32.png', 'apple-touch-icon.png']) {
  copyFileSync(join('public', icon), join(out, icon));
}
copyFileSync('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2', join(out, 'fonts/fraunces.woff2'));
copyFileSync('node_modules/@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2', join(out, 'fonts/nunito.woff2'));

const apk = process.env.APK;
if (apk && existsSync(apk)) {
  mkdirSync(join(out, 'download'), { recursive: true });
  // Stesso file con due nomi: quello con la versione (per chi scarica) e il link fisso (per le app già installate)
  cpSync(apk, join(out, 'download', basename(apk)));
  cpSync(apk, join(out, 'download/che-cucino-oggi.apk'));
  const sizeMB = Math.round((statSync(apk).size / 1024 / 1024) * 10) / 10;
  writeFileSync(
    join(out, 'version.json'),
    JSON.stringify({
      number: Number(process.env.BUILD_NUMBER) || 0,
      version: process.env.APP_VERSION || null,
      apk: basename(apk),
      date: new Date().toISOString(),
      build: (process.env.BUILD || '').slice(0, 7),
      sizeMB,
    }),
  );
  console.log(`APK incluso (${sizeMB} MB)`);
} else {
  console.log('Nessun APK: il sito viene creato senza il file da scaricare');
}
console.log(`Sito pronto in ${out} per ${vars.siteUrl}`);
