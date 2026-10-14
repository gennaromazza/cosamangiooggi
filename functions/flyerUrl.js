// Scarico di un volantino da un link: solo file (PDF o immagine), mai pagine, e senza poter raggiungere indirizzi interni.
const dns = require('node:dns');
const https = require('node:https');
const http = require('node:http');
const net = require('node:net');

const MAX_BYTES = 6 * 1024 * 1024; // come il caricamento dal telefono
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 15000;

class FlyerUrlError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code; // 'invalid-url' | 'blocked' | 'not-file' | 'too-large' | 'unreachable'
  }
}

/** Indirizzi che non devono mai essere raggiunti dal server: rete interna, loopback, link-local (metadata), ecc. */
function isPrivateAddress(ip) {
  if (!net.isIP(ip)) return true;
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v === '::' || v === '::1') return true;
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(v);
    if (mapped) return isPrivateAddress(mapped[1]);
    if (/^f[cd]/.test(v)) return true; // fc00::/7
    if (/^fe[89ab]/.test(v)) return true; // fe80::/10
    if (/^ff/.test(v)) return true; // multicast
    return false;
  }
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

/** Link valido per scaricare un volantino: https, senza credenziali, porta normale, non un indirizzo interno. */
function parseFlyerUrl(input, { allowInsecure = false } = {}) {
  if (typeof input !== 'string') throw new FlyerUrlError('invalid-url', 'Il link non è valido.');
  const text = input.trim();
  if (text.length === 0 || text.length > 2000) throw new FlyerUrlError('invalid-url', 'Il link non è valido.');
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new FlyerUrlError('invalid-url', 'Il link non è valido: incolla l\'indirizzo completo, che inizia con https://');
  }
  if (url.protocol !== 'https:' && !(allowInsecure && url.protocol === 'http:')) {
    throw new FlyerUrlError('invalid-url', 'Il link deve iniziare con https://');
  }
  if (url.username || url.password) throw new FlyerUrlError('invalid-url', 'Il link non è valido.');
  if (!allowInsecure && url.port && url.port !== '443') throw new FlyerUrlError('blocked', 'Questo indirizzo non si può aprire.');
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!allowInsecure && (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || (net.isIP(host) && isPrivateAddress(host)))) {
    throw new FlyerUrlError('blocked', 'Questo indirizzo non si può aprire.');
  }
  return url;
}

/** Che tipo di file è, dai primi byte (non ci si fida di quello che dichiara il sito). */
function sniffMime(buffer) {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  return null;
}

const looksLikePage = (buffer, contentType) => /html/i.test(contentType || '') || /^\s*<(!doctype|html|head|body)/i.test(buffer.subarray(0, 512).toString('utf8'));

/** Risoluzione del nome che rifiuta gli indirizzi interni nel momento stesso della connessione (così non si aggira con un DNS ingannevole). */
function safeLookup(allowPrivate) {
  return (hostname, options, callback) => {
    dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
      if (err) return callback(err);
      const list = Array.isArray(addresses) ? addresses : [{ address: addresses, family: 4 }];
      const bad = list.find((a) => isPrivateAddress(a.address));
      if (bad && !allowPrivate) return callback(new FlyerUrlError('blocked', 'Questo indirizzo non si può aprire.'));
      if (options && options.all) return callback(null, list);
      return callback(null, list[0].address, list[0].family);
    });
  };
}

/** Una richiesta: restituisce stato, intestazioni e i primi byte (fino al limite). */
function defaultTransport(url, { allowPrivate = false } = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === 'http:' ? http : https;
    const req = lib.get(
      url,
      { lookup: safeLookup(allowPrivate), timeout: TIMEOUT_MS, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CheCucinoOggi/1.0)', Accept: 'application/pdf,image/*;q=0.9,*/*;q=0.1' } },
      (res) => {
        const status = res.statusCode || 0;
        if (status >= 300 && status < 400) {
          res.resume();
          return resolve({ status, headers: res.headers, body: Buffer.alloc(0) });
        }
        const chunks = [];
        let size = 0;
        res.on('data', (chunk) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            res.destroy();
            return reject(new FlyerUrlError('too-large', 'Il file è troppo grande (massimo 6 MB).'));
          }
          chunks.push(chunk);
        });
        res.on('end', () => resolve({ status, headers: res.headers, body: Buffer.concat(chunks) }));
        res.on('error', (e) => reject(e.code === 'blocked' ? e : new FlyerUrlError('unreachable', 'Non riesco ad aprire il link.')));
      },
    );
    req.on('timeout', () => req.destroy(new FlyerUrlError('unreachable', 'Il sito non risponde.')));
    req.on('error', (e) => reject(e instanceof FlyerUrlError ? e : new FlyerUrlError('unreachable', 'Non riesco ad aprire il link.')));
  });
}

// Un indirizzo scritto come numero non passa dalla risoluzione dei nomi: lo si controlla qui
function assertPublicHost(url, allowPrivate) {
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (!allowPrivate && net.isIP(host) && isPrivateAddress(host)) throw new FlyerUrlError('blocked', 'Questo indirizzo non si può aprire.');
}

const NOT_A_FILE =
  'Questo link porta a una pagina, non a un file. Per i volantini che si sfogliano sul sito, fai uno screenshot delle pagine e caricale come foto.';

/**
 * Scarica il volantino dal link. Accetta solo PDF e immagini (riconosciuti dal contenuto), segue al massimo qualche
 * reindirizzamento controllando ogni volta l'indirizzo, e si ferma oltre i 6 MB.
 */
async function downloadFlyer(input, { transport = defaultTransport, allowInsecure = false, allowPrivate = false } = {}) {
  let url = parseFlyerUrl(input, { allowInsecure });
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    assertPublicHost(url, allowPrivate);
    const res = await transport(url, { allowPrivate });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers && res.headers.location;
      if (!location) throw new FlyerUrlError('unreachable', 'Non riesco ad aprire il link.');
      url = parseFlyerUrl(new URL(location, url).toString(), { allowInsecure });
      continue;
    }
    if (res.status === 401 || res.status === 403) throw new FlyerUrlError('unreachable', 'Il sito non permette di scaricare il volantino da qui. Prova con uno screenshot.');
    if (res.status < 200 || res.status >= 300) throw new FlyerUrlError('unreachable', 'Non riesco ad aprire il link.');
    if (res.body.length > MAX_BYTES) throw new FlyerUrlError('too-large', 'Il file è troppo grande (massimo 6 MB).');
    const mimeType = sniffMime(res.body);
    if (!mimeType) {
      const type = res.headers && res.headers['content-type'];
      throw new FlyerUrlError('not-file', looksLikePage(res.body, type) ? NOT_A_FILE : 'Il link non porta a un PDF o a un\'immagine che so leggere.');
    }
    return { data: res.body.toString('base64'), mimeType, bytes: res.body.length };
  }
  throw new FlyerUrlError('unreachable', 'Il link rimanda troppe volte ad altre pagine.');
}

module.exports = { FlyerUrlError, MAX_BYTES, isPrivateAddress, parseFlyerUrl, sniffMime, downloadFlyer, defaultTransport };
