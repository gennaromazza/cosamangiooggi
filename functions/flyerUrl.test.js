const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const { isPrivateAddress, parseFlyerUrl, sniffMime, downloadFlyer, FlyerUrlError, MAX_BYTES } = require('./flyerUrl');

const PDF = Buffer.from('%PDF-1.7\n1 0 obj<<>>endobj\n');
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([1, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);
const reject = async (promise, code) => assert.rejects(promise, (e) => e instanceof FlyerUrlError && e.code === code, `atteso ${code}`);

test('indirizzi interni: mai raggiungibili dal server', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '::1', '::', 'fe80::1', 'fc00::1', 'fd12::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1', 'non-un-ip']) {
    assert.equal(isPrivateAddress(ip), true, ip);
  }
  for (const ip of ['8.8.8.8', '151.101.1.1', '172.15.0.1', '172.32.0.1', '2606:4700:4700::1111', '::ffff:8.8.8.8']) assert.equal(isPrivateAddress(ip), false, ip);
});

test('link: solo https, senza credenziali, porta normale e non interno', () => {
  assert.equal(parseFlyerUrl('  https://www.example.it/volantino.pdf?x=1  ').hostname, 'www.example.it');
  for (const bad of ['', '   ', 'volantino.pdf', 'http://example.it/a.pdf', 'ftp://example.it/a.pdf', 'file:///etc/passwd', 'javascript:alert(1)', 'https://user:pw@example.it/a.pdf', 'https://example.it:8443/a.pdf', 'https://localhost/a.pdf', 'https://app.localhost/a.pdf', 'https://server.internal/a.pdf', 'https://router.local/a.pdf', 'https://127.0.0.1/a.pdf', 'https://[::1]/a.pdf', 'https://169.254.169.254/latest/meta-data', 'https://10.0.0.5/a.pdf', 'https://192.168.0.1/a.pdf', 'https://example.it/' + 'a'.repeat(2100), 123, null, undefined]) {
    assert.throws(() => parseFlyerUrl(bad), (e) => e instanceof FlyerUrlError, String(bad).slice(0, 50));
  }
});

test('tipo di file: lo dicono i primi byte, non il sito', () => {
  assert.equal(sniffMime(PDF), 'application/pdf');
  assert.equal(sniffMime(JPEG), 'image/jpeg');
  assert.equal(sniffMime(PNG), 'image/png');
  assert.equal(sniffMime(WEBP), 'image/webp');
  assert.equal(sniffMime(Buffer.from('<!doctype html><html>')), null);
  assert.equal(sniffMime(Buffer.from('MZ\x90\x00')), null);
  assert.equal(sniffMime(Buffer.alloc(0)), null);
});

const fake = (responses) => {
  const calls = [];
  const transport = async (url) => {
    calls.push(url.toString());
    const next = responses.shift();
    return typeof next === 'function' ? next(url) : next;
  };
  return { transport, calls };
};

test('download: PDF e immagini si accettano, il resto no', async () => {
  const pdf = await downloadFlyer('https://example.it/v.pdf', { transport: fake([{ status: 200, headers: { 'content-type': 'application/pdf' }, body: PDF }]).transport });
  assert.equal(pdf.mimeType, 'application/pdf');
  assert.equal(Buffer.from(pdf.data, 'base64').toString().startsWith('%PDF'), true);
  // anche se il sito dichiara un altro tipo, conta il contenuto
  const img = await downloadFlyer('https://example.it/v', { transport: fake([{ status: 200, headers: { 'content-type': 'application/octet-stream' }, body: JPEG }]).transport });
  assert.equal(img.mimeType, 'image/jpeg');
  // una pagina web non è un volantino: si spiega cosa fare
  await assert.rejects(
    downloadFlyer('https://example.it/sfoglia', { transport: fake([{ status: 200, headers: { 'content-type': 'text/html; charset=utf-8' }, body: Buffer.from('<!doctype html><html><body>Volantino</body></html>') }]).transport }),
    (e) => e.code === 'not-file' && /screenshot/.test(e.message),
  );
  // un file che dichiara "pdf" ma è altro non passa
  await reject(downloadFlyer('https://example.it/v.pdf', { transport: fake([{ status: 200, headers: { 'content-type': 'application/pdf' }, body: Buffer.from('MZ eseguibile') }]).transport }), 'not-file');
  await reject(downloadFlyer('https://example.it/v.pdf', { transport: fake([{ status: 404, headers: {}, body: Buffer.alloc(0) }]).transport }), 'unreachable');
  await assert.rejects(downloadFlyer('https://example.it/v.pdf', { transport: fake([{ status: 403, headers: {}, body: Buffer.alloc(0) }]).transport }), /screenshot/);
  await reject(downloadFlyer('https://example.it/v.pdf', { transport: fake([{ status: 200, headers: {}, body: Buffer.alloc(MAX_BYTES + 1, 1) }]).transport }), 'too-large');
});

test('download: i reindirizzamenti sono pochi e ogni indirizzo è ricontrollato', async () => {
  const ok = fake([
    { status: 302, headers: { location: 'https://cdn.example.it/v.pdf' }, body: Buffer.alloc(0) },
    { status: 200, headers: {}, body: PDF },
  ]);
  assert.equal((await downloadFlyer('https://example.it/go', { transport: ok.transport })).mimeType, 'application/pdf');
  assert.deepEqual(ok.calls, ['https://example.it/go', 'https://cdn.example.it/v.pdf']);
  // reindirizzamento relativo
  const rel = fake([{ status: 301, headers: { location: '/files/v.pdf' }, body: Buffer.alloc(0) }, { status: 200, headers: {}, body: PDF }]);
  await downloadFlyer('https://example.it/go', { transport: rel.transport });
  assert.equal(rel.calls[1], 'https://example.it/files/v.pdf');
  // verso un indirizzo interno: bloccato prima ancora di chiamarlo
  const evil = fake([{ status: 302, headers: { location: 'https://169.254.169.254/latest/meta-data/' }, body: Buffer.alloc(0) }, { status: 200, headers: {}, body: PDF }]);
  await reject(downloadFlyer('https://example.it/go', { transport: evil.transport }), 'blocked');
  assert.equal(evil.calls.length, 1, 'il secondo indirizzo non viene nemmeno aperto');
  const toHttp = fake([{ status: 302, headers: { location: 'http://example.it/v.pdf' }, body: Buffer.alloc(0) }]);
  await reject(downloadFlyer('https://example.it/go', { transport: toHttp.transport }), 'invalid-url');
  // giri infiniti
  const loop = fake(Array.from({ length: 10 }, () => ({ status: 302, headers: { location: 'https://example.it/again' }, body: Buffer.alloc(0) })));
  await reject(downloadFlyer('https://example.it/again', { transport: loop.transport }), 'unreachable');
  await reject(downloadFlyer('https://example.it/x', { transport: fake([{ status: 302, headers: {}, body: Buffer.alloc(0) }]).transport }), 'unreachable');
});

test('download vero su un server locale: il file si legge, e senza permesso gli indirizzi interni restano chiusi', async () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/v.pdf') return res.writeHead(200, { 'content-type': 'application/pdf' }).end(PDF);
    if (req.url === '/pagina') return res.writeHead(200, { 'content-type': 'text/html' }).end('<html><body>sfoglia</body></html>');
    if (req.url === '/grande') return res.writeHead(200, { 'content-type': 'application/pdf' }).end(Buffer.concat([PDF, Buffer.alloc(MAX_BYTES + 10, 1)]));
    if (req.url === '/redir') return res.writeHead(302, { location: '/v.pdf' }).end();
    res.writeHead(404).end();
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const open = { allowInsecure: true, allowPrivate: true };
    assert.equal((await downloadFlyer(`${base}/v.pdf`, open)).mimeType, 'application/pdf');
    assert.equal((await downloadFlyer(`${base}/redir`, open)).mimeType, 'application/pdf');
    await reject(downloadFlyer(`${base}/pagina`, open), 'not-file');
    await reject(downloadFlyer(`${base}/grande`, open), 'too-large');
    await reject(downloadFlyer(`${base}/x`, open), 'unreachable');
    // come in produzione: l'indirizzo interno non si apre
    await reject(downloadFlyer(`${base}/v.pdf`, { allowInsecure: true }), 'blocked');
  } finally {
    await new Promise((r) => server.close(r));
  }
});

test('funzione: richiede l\'accesso, scarica prima di prenotare la scansione e usa gli stessi controlli', () => {
  const code = fs.readFileSync(__dirname + '/index.js', 'utf8');
  const fn = code.slice(code.indexOf('exports.analyzeFlyerUrl'), code.indexOf('exports.analyzeFlyerUrl') + 1500);
  assert.ok(/requireAuth\(request\)/.test(fn));
  assert.ok(fn.indexOf('downloadFlyer') < fn.indexOf('scanFlyer('), 'il download viene prima della prenotazione della scansione');
  assert.ok(code.includes('async function scanFlyer(uid, data, mimeType)') && code.includes('refundFlyerScan'));
});
