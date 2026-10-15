const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const Stripe = require('stripe');
const invites = require('./invites');
const familyShare = require('./familyShare');
const flyerUrl = require('./flyerUrl');
const receipts = require('./receipts');
const { isStripeSecretKey, describeStripeKey } = require('./config-checks');
const { GoogleGenAI, Type } = require('@google/genai');

const REGION = 'europe-west1';
// Tenere allineati a src/lib/plans.ts
const TRIAL_DAYS = 7;
const FLYER_SCANS_PER_MONTH = 30;
// Tenere allineato a src/lib/plans.ts: 3 di prova per tutti, 50 con Chef IA
const DISH_SUGGESTIONS_FREE = 3;
const DISH_SUGGESTIONS_PRO = 50;
// Scontrini: per tutti i piani, con un tetto che protegge i costi di Gemini (tenere allineato a src/lib/plans.ts)
const RECEIPT_SCANS_PER_MONTH = 60;
const FIRESTORE_DB_ID = 'ai-studio-93a2a041-9b02-4ff7-b496-5f2ada58f953';

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const PRICE_SMART = defineString('PRICE_SMART');
const PRICE_PRO = defineString('PRICE_PRO');
const PRICE_SMART_YEAR = defineString('PRICE_SMART_YEAR');
const PRICE_PRO_YEAR = defineString('PRICE_PRO_YEAR');
const ADMIN_EMAILS = defineString('ADMIN_EMAILS', { default: '' });
const APP_URL = defineString('APP_URL');
const SITE_URL = defineString('SITE_URL', { default: 'https://che-cucino-oggi.web.app' });

initializeApp();
const db = getFirestore(FIRESTORE_DB_ID);

const requireAuth = (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Accesso richiesto.');
  return request.auth.uid;
};

const userRef = (uid) => db.collection('users').doc(uid);

// Cliente Stripe: se la chiave non è quella segreta (per esempio è stata incollata la chiave pubblicabile pk_...)
// lo si dice chiaramente, invece di far fallire ogni pagamento con un errore generico.
function getStripe() {
  const key = STRIPE_SECRET_KEY.value();
  if (!isStripeSecretKey(key)) {
    console.error(`STRIPE_SECRET_KEY non valida: ${describeStripeKey(key)}`);
    throw new HttpsError('failed-precondition', 'I pagamenti non sono configurati correttamente: la chiave di Stripe non è quella segreta. Contatta l\'assistenza.');
  }
  return new Stripe(key.trim());
}

// Errori di Stripe: si registra il motivo vero e all'utente si mostra un messaggio comprensibile
function stripeFailure(err, what) {
  if (err instanceof HttpsError) return err;
  console.error(`Stripe: ${what} non riuscito`, err && err.type, err && err.code, err && err.message);
  return new HttpsError('internal', 'Il pagamento non è disponibile in questo momento. Riprova tra poco.');
}

// ---------------------------------------------------------------------------
// Stripe: abbonamenti
// ---------------------------------------------------------------------------

async function getOrCreateCustomer(stripe, uid, email) {
  const snap = await userRef(uid).get();
  const existing = snap.exists ? snap.data().stripeCustomerId : null;
  if (existing) {
    try {
      const found = await stripe.customers.retrieve(existing);
      if (!found.deleted) return existing;
    } catch (err) {
      if (!(err && err.code === 'resource_missing')) throw err;
    }
    // Cliente creato in modalità test (o cancellato su Stripe): non esiste più, se ne crea uno nuovo
  }
  const customer = await stripe.customers.create({ email, metadata: { uid } });
  await userRef(uid).set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

exports.createCheckoutSession = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    const uid = requireAuth(request);
    const plan = request.data && request.data.plan;
    const interval = (request.data && request.data.interval) === 'year' ? 'year' : 'month';
    if (plan !== 'smart' && plan !== 'pro') throw new HttpsError('invalid-argument', 'Piano non valido.');

    const prices = {
      smart: { month: PRICE_SMART.value(), year: PRICE_SMART_YEAR.value() },
      pro: { month: PRICE_PRO.value(), year: PRICE_PRO_YEAR.value() },
    };

    const stripe = getStripe();
    let customer;
    try {
      customer = await getOrCreateCustomer(stripe, uid, request.auth.token.email);
    } catch (err) {
      throw stripeFailure(err, 'creazione del cliente');
    }
    const userSnap = await userRef(uid).get();
    // La prova gratuita spetta una sola volta per cliente
    const alreadyHadSubscription = userSnap.exists && userSnap.data().hadSubscription === true;

    const base = APP_URL.value().replace(/\/$/, '');
    // Nell'app Android il pagamento si apre nel browser: al ritorno basta una pagina che dica di tornare all'app
    const native = !!(request.data && request.data.native);
    let session;
    try {
      session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer,
      client_reference_id: uid,
      line_items: [{ price: prices[plan][interval], quantity: 1 }],
      subscription_data: {
        metadata: { uid, plan },
        ...(alreadyHadSubscription ? {} : { trial_period_days: TRIAL_DAYS }),
      },
      allow_promotion_codes: true,
      locale: 'it',
      success_url: native ? `${base}/pagamento.html?esito=ok` : `${base}/?checkout=success`,
      cancel_url: native ? `${base}/pagamento.html?esito=annullato` : `${base}/?checkout=cancel`,
      });
    } catch (err) {
      throw stripeFailure(err, 'apertura del pagamento');
    }
    return { url: session.url };
  }
);

// Portale clienti Stripe: disdetta, riattivazione, cambio carta, fatture
exports.createPortalSession = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    const uid = requireAuth(request);
    const snap = await userRef(uid).get();
    const customer = snap.exists ? snap.data().stripeCustomerId : null;
    if (!customer) throw new HttpsError('failed-precondition', 'Nessun abbonamento da gestire.');
    const stripe = getStripe();
    const native = !!(request.data && request.data.native);
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer,
        return_url: native ? `${APP_URL.value().replace(/\/$/, '')}/pagamento.html?esito=portale` : APP_URL.value(),
      });
      return { url: session.url };
    } catch (err) {
      // Cliente di prova che in produzione non esiste: non c'è nessun abbonamento da gestire
      if (err && err.code === 'resource_missing') throw new HttpsError('failed-precondition', 'Nessun abbonamento da gestire.');
      throw stripeFailure(err, 'apertura del portale');
    }
  }
);

async function findUid(customerId, metadataUid) {
  if (metadataUid) return metadataUid;
  const q = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  return q.empty ? null : q.docs[0].id;
}

function planFromPriceId(priceId) {
  if (priceId === PRICE_PRO.value() || priceId === PRICE_PRO_YEAR.value()) return 'pro';
  if (priceId === PRICE_SMART.value() || priceId === PRICE_SMART_YEAR.value()) return 'smart';
  return null;
}

function planFromSubscription(sub) {
  const priceId = sub.items && sub.items.data[0] && sub.items.data[0].price.id;
  return planFromPriceId(priceId);
}

async function applySubscription(sub) {
  const uid = await findUid(sub.customer, sub.metadata && sub.metadata.uid);
  // Account eliminato: non ricreare il profilo con gli eventi di Stripe che arrivano dopo
  if (!uid || !(await userRef(uid).get()).exists) return;
  const livePlan = planFromSubscription(sub);
  const isLive = ['active', 'trialing', 'past_due'].includes(sub.status) && livePlan;
  const autoRenew = !sub.cancel_at_period_end;
  await userRef(uid).set(
    isLive
      ? {
          plan: livePlan,
          autoRenew,
          subscriptionStatus: autoRenew ? 'active' : 'pending_renewal',
          stripeSubscriptionId: sub.id,
          hadSubscription: true,
        }
      : { plan: 'free', autoRenew: false, subscriptionStatus: null, stripeSubscriptionId: null },
    { merge: true }
  );
}

async function recordInvoice(invoice) {
  // Durante la prova gratuita la fattura è di 0 €: non è un pagamento da registrare
  if (!invoice.amount_paid) return;
  const uid = await findUid(invoice.customer, null);
  if (!uid || !(await userRef(uid).get()).exists) return;
  const line = invoice.lines && invoice.lines.data[0];
  const priceId = line && line.pricing && line.pricing.price_details && line.pricing.price_details.price
    || line && line.price && line.price.id;
  const plan = planFromPriceId(priceId) || 'smart';
  await userRef(uid).set(
    {
      paymentHistory: FieldValue.arrayUnion({
        transactionId: invoice.id,
        plan,
        amount: invoice.amount_paid / 100,
        date: new Date(invoice.created * 1000).toISOString(),
        status: 'paid',
        paymentMethod: 'stripe',
      }),
    },
    { merge: true }
  );
}

exports.stripeWebhook = onRequest(
  { region: REGION, secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    const stripe = getStripe();
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET.value());
    } catch (err) {
      res.status(400).send(`Webhook non valido: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const s = event.data.object;
          if (s.mode === 'subscription' && s.subscription) {
            const sub = await stripe.subscriptions.retrieve(s.subscription);
            if (!sub.metadata.uid && s.client_reference_id) sub.metadata.uid = s.client_reference_id;
            await applySubscription(sub);
          }
          break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await applySubscription(event.data.object);
          break;
        case 'invoice.paid':
          await recordInvoice(event.data.object);
          break;
      }
      res.json({ received: true });
    } catch (err) {
      console.error('Errore webhook Stripe', err);
      res.status(500).send('Errore interno');
    }
  }
);


// ---------------------------------------------------------------------------
// Inviti ai familiari: un link riservato per ogni persona, per compilare da sola allergie e gusti
// ---------------------------------------------------------------------------

const memberRef = (uid, memberId) => userRef(uid).collection('familyMembers').doc(memberId);

// Chi ha l'abbonamento crea (o rinnova) il link per una persona a tavola
exports.createMemberInvite = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const memberId = request.data && request.data.memberId;
  if (typeof memberId !== 'string' || !memberId) throw new HttpsError('invalid-argument', 'Persona non valida.');
  const member = await memberRef(uid, memberId).get();
  if (!member.exists) throw new HttpsError('not-found', 'Persona non trovata.');
  if (member.data().isSelf) throw new HttpsError('failed-precondition', 'Questa persona sei tu: compila direttamente le sue schede.');

  // Un solo link attivo per persona: il precedente smette di funzionare
  const previous = await db.collection('invites').where('uid', '==', uid).where('memberId', '==', memberId).where('revoked', '==', false).get();
  await Promise.all(previous.docs.map((d) => d.ref.update({ revoked: true })));

  const token = invites.newToken();
  const now = Date.now();
  const expiresAt = now + invites.INVITE_DAYS * 24 * 60 * 60 * 1000;
  const profile = await userRef(uid).get();
  await db.collection('invites').doc(invites.hashToken(token)).set({
    uid,
    memberId,
    memberName: String(member.data().name || '').slice(0, 60),
    // 'Nuova Famiglia spesa' è solo il segnaposto del profilo, non un nome
    ownerName: (() => { const n = String((profile.exists && profile.data().name) || ''); return n === 'Nuova Famiglia spesa' ? '' : n.slice(0, 60); })(),
    createdAt: now,
    expiresAt,
    revoked: false,
    submissions: 0,
  });
  await memberRef(uid, memberId).update({ inviteStatus: 'sent', inviteExpiresAt: expiresAt, inviteAnsweredAt: FieldValue.delete() });
  return { url: `${SITE_URL.value().replace(/\/$/, '')}/invito#${token}`, expiresAt };
});

// Annulla il link: smette di funzionare subito
exports.revokeMemberInvite = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const memberId = request.data && request.data.memberId;
  if (typeof memberId !== 'string' || !memberId) throw new HttpsError('invalid-argument', 'Persona non valida.');
  const active = await db.collection('invites').where('uid', '==', uid).where('memberId', '==', memberId).where('revoked', '==', false).get();
  await Promise.all(active.docs.map((d) => d.ref.update({ revoked: true })));
  const member = await memberRef(uid, memberId).get();
  if (member.exists && member.data().inviteStatus === 'sent') await memberRef(uid, memberId).update({ inviteStatus: 'revoked' });
  return { revoked: active.size };
});

const readToken = (req) => {
  const fromBody = req.body && typeof req.body === 'object' ? req.body.t : undefined;
  return fromBody || req.query.t;
};
const reply = (res, status, body) => {
  res.set('Cache-Control', 'no-store');
  res.status(status).json(body);
};
const unusable = { missing: 404, revoked: 410, expired: 410, full: 429 };
const unusableText = {
  missing: 'Questo link non è valido. Chiedi un nuovo invito.',
  revoked: 'Questo link è stato annullato. Chiedi un nuovo invito.',
  expired: 'Questo link è scaduto. Chiedi un nuovo invito.',
  full: 'Hai già inviato molte risposte con questo link.',
};

// Pagina pubblica dell'invito: dice per chi è e quali piatti proporre (nessun dato oltre al nome)
exports.getMemberInvite = onRequest({ region: REGION, cors: true }, async (req, res) => {
  const token = readToken(req);
  if (!invites.looksLikeToken(token)) return reply(res, 404, { ok: false, error: unusableText.missing });
  const snap = await db.collection('invites').doc(invites.hashToken(token)).get();
  const invite = snap.exists ? snap.data() : null;
  const state = invites.inviteState(invite);
  if (state !== 'ok') return reply(res, unusable[state], { ok: false, error: unusableText[state] });
  return reply(res, 200, {
    ok: true,
    memberName: invite.memberName,
    ownerName: invite.ownerName,
    dishes: invites.INVITE_DISHES,
  });
});

// Riceve le risposte della persona e le unisce alla sua scheda
exports.submitMemberInvite = onRequest({ region: REGION, cors: true }, async (req, res) => {
  if (req.method !== 'POST') return reply(res, 405, { ok: false, error: 'Metodo non consentito.' });
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const token = body.t;
  if (!invites.looksLikeToken(token)) return reply(res, 404, { ok: false, error: unusableText.missing });
  const checked = invites.sanitizeAnswers(body);
  if (!checked.ok) return reply(res, 400, { ok: false, error: checked.error });

  const inviteRef = db.collection('invites').doc(invites.hashToken(token));
  try {
    const outcome = await db.runTransaction(async (tx) => {
      const snap = await tx.get(inviteRef);
      const invite = snap.exists ? snap.data() : null;
      const state = invites.inviteState(invite);
      if (state !== 'ok') return { status: unusable[state], error: unusableText[state] };
      const ref = memberRef(invite.uid, invite.memberId);
      const member = await tx.get(ref);
      if (!member.exists) {
        tx.update(inviteRef, { revoked: true });
        return { status: 410, error: unusableText.revoked };
      }
      const merged = invites.mergeAnswers(member.data(), checked.answers);
      tx.update(ref, { ...merged, inviteStatus: 'answered', inviteAnsweredAt: Date.now() });
      tx.update(inviteRef, { submissions: (invite.submissions || 0) + 1, answeredAt: Date.now() });
      return { status: 200 };
    });
    if (outcome.status !== 200) return reply(res, outcome.status, { ok: false, error: outcome.error });
    return reply(res, 200, { ok: true });
  } catch (err) {
    console.error('Errore invito', err);
    return reply(res, 500, { ok: false, error: 'Non è stato possibile salvare. Riprova tra poco.' });
  }
});


// ---------------------------------------------------------------------------
// Menù condiviso: la famiglia è identificata dall'uid di chi la gestisce. I familiari possono solo consultare
// il menù (con le ricette scritte dalla famiglia): dal web con il link, senza account, oppure dall'app dopo
// essersi collegati con il codice. Persone, preferenze, dispensa e spesa restano riservati.
// ---------------------------------------------------------------------------

const familyShareRef = (uid) => userRef(uid).collection('familyShare').doc('current');
const viewerRef = (ownerUid, viewerUid) => userRef(ownerUid).collection('viewers').doc(viewerUid);
const shareProblem = {
  missing: ['not-found', 'Questo codice non è valido. Chiedi un nuovo invito.'],
  revoked: ['permission-denied', 'Questo invito è stato annullato. Chiedi un nuovo invito.'],
  expired: ['permission-denied', 'Questo invito è scaduto. Chiedi un nuovo invito.'],
};

// Chi gestisce la famiglia crea (o rigenera) il codice: quello precedente smette di funzionare subito
exports.createFamilyShare = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const previous = await db.collection('shares').where('uid', '==', uid).where('revoked', '==', false).get();
  await Promise.all(previous.docs.map((d) => d.ref.update({ revoked: true })));
  const code = familyShare.newShareCode();
  const now = Date.now();
  const expiresAt = now + familyShare.SHARE_DAYS * 24 * 60 * 60 * 1000;
  await db.collection('shares').doc(familyShare.hashCode(code)).set({ uid, createdAt: now, expiresAt, revoked: false });
  // Il codice in chiaro sta solo nell'area riservata del proprietario, per poterlo rimandare
  await familyShareRef(uid).set({ code, createdAt: now, expiresAt, revoked: false });
  return { code, url: `${SITE_URL.value().replace(/\/$/, '')}/menu#${code}`, expiresAt };
});

exports.revokeFamilyShare = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const active = await db.collection('shares').where('uid', '==', uid).where('revoked', '==', false).get();
  await Promise.all(active.docs.map((d) => d.ref.update({ revoked: true })));
  const current = await familyShareRef(uid).get();
  if (current.exists) await familyShareRef(uid).update({ revoked: true });
  return { revoked: active.size };
});

// Pagina pubblica del menù (senza account): solo pasti e ricette del menù, mai dati delle persone
exports.getSharedMenu = onRequest({ region: REGION, cors: true }, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const code = familyShare.normalizeCode(body.code);
  if (!code) return res.status(404).json({ ok: false, error: shareProblem.missing[1] });
  try {
    const snap = await db.collection('shares').doc(familyShare.hashCode(code)).get();
    const share = snap.exists ? snap.data() : null;
    const state = familyShare.shareState(share);
    if (state !== 'ok') return res.status(state === 'missing' ? 404 : 410).json({ ok: false, error: shareProblem[state][1] });
    const plan = await userRef(share.uid).collection('mealPlans').doc('current').get();
    if (!plan.exists) return res.json({ ok: true, menu: null });
    const planData = plan.data();
    const ids = new Set();
    Object.values(planData.days || {}).forEach((d) => ['lunchIds', 'dinnerIds', 'breakfastIds', 'snackAmIds', 'snackPmIds'].flatMap((k) => (d && Array.isArray(d[k]) ? d[k] : [])).forEach((id) => typeof id === 'string' && id.length <= 128 && ids.add(id)));
    const refs = [...ids].slice(0, 120).map((id) => userRef(share.uid).collection('customRecipes').doc(id));
    const found = refs.length ? await db.getAll(...refs) : [];
    const custom = {};
    found.forEach((d) => d.exists && (custom[d.id] = d.data()));
    return res.json({ ok: true, menu: familyShare.publicMenuView(planData, custom) });
  } catch (err) {
    console.error('Errore menù condiviso', err);
    return res.status(500).json({ ok: false, error: 'Non è stato possibile caricare il menù. Riprova tra poco.' });
  }
});

// Collega l'account di chi ha l'app alla famiglia, con il codice: da quel momento vede il menù (sola lettura)
exports.joinFamily = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const code = familyShare.normalizeCode(request.data && request.data.code);
  if (!code) throw new HttpsError('invalid-argument', 'Il codice non è corretto. Sono 12 caratteri, per esempio ABCD-EFGH-JKMN.');
  const snap = await db.collection('shares').doc(familyShare.hashCode(code)).get();
  const share = snap.exists ? snap.data() : null;
  const state = familyShare.shareState(share);
  if (state !== 'ok') throw new HttpsError(...shareProblem[state]);
  if (share.uid === uid) throw new HttpsError('failed-precondition', 'Questa è la tua famiglia: il menù lo gestisci già tu.');
  const current = await userRef(uid).get();
  const already = current.exists ? current.data().familyId : null;
  if (already && already !== share.uid) await viewerRef(already, uid).delete().catch(() => undefined);
  const count = (await userRef(share.uid).collection('viewers').get()).size;
  const existing = await viewerRef(share.uid, uid).get();
  if (!existing.exists && count >= familyShare.MAX_VIEWERS) throw new HttpsError('resource-exhausted', 'Questa famiglia ha raggiunto il numero massimo di persone collegate.');
  const name = String((request.auth.token && request.auth.token.name) || (request.auth.token && request.auth.token.email) || 'Familiare').split(/[ @]/)[0].slice(0, 40);
  await viewerRef(share.uid, uid).set({ name, joinedAt: Date.now() }, { merge: true });
  await userRef(uid).set({ familyId: share.uid }, { merge: true });
  return { familyId: share.uid };
});

exports.leaveFamily = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const current = await userRef(uid).get();
  const familyId = current.exists ? current.data().familyId : null;
  if (familyId) await viewerRef(familyId, uid).delete().catch(() => undefined);
  await userRef(uid).set({ familyId: FieldValue.delete() }, { merge: true });
  return { left: !!familyId };
});

// Chi gestisce la famiglia scollega una persona
exports.removeFamilyViewer = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const viewerUid = request.data && request.data.viewerUid;
  if (typeof viewerUid !== 'string' || !viewerUid) throw new HttpsError('invalid-argument', 'Persona non valida.');
  await viewerRef(uid, viewerUid).delete();
  const viewer = await userRef(viewerUid).get();
  if (viewer.exists && viewer.data().familyId === uid) await userRef(viewerUid).set({ familyId: FieldValue.delete() }, { merge: true });
  return { removed: true };
});

// ---------------------------------------------------------------------------
// Amministratori: decisi da elenco email (parametro ADMIN_EMAILS), non dal client
// ---------------------------------------------------------------------------

exports.syncAdminClaim = onCall({ region: REGION }, async (request) => {
  const uid = requireAuth(request);
  const email = (request.auth.token.email || '').toLowerCase();
  const allowed = ADMIN_EMAILS.value().split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  const shouldBeAdmin = request.auth.token.email_verified === true && allowed.includes(email);
  if (!!request.auth.token.admin !== shouldBeAdmin) {
    await getAuth().setCustomUserClaims(uid, { admin: shouldBeAdmin });
  }
  return { admin: shouldBeAdmin };
});

// Eliminazione di un account: abbonamento, dati e accesso
async function eraseAccount(targetUid, actor) {
  const snap = await userRef(targetUid).get();
  const data = snap.exists ? snap.data() : {};

  // Prima l'abbonamento: se non si riesce a chiudere, non si elimina nulla (nessun addebito orfano)
  if (data.stripeSubscriptionId) {
    const stripe = getStripe();
    try {
      await stripe.subscriptions.cancel(data.stripeSubscriptionId);
    } catch (err) {
      if (!(err && err.code === 'resource_missing')) {
        console.error('Chiusura abbonamento non riuscita', err);
        throw new HttpsError('internal', 'Non riesco a chiudere l’abbonamento su Stripe: account non eliminato.');
      }
    }
  }

  // Gli inviti ai familiari contengono solo l'impronta del link e il nome della persona: spariscono con l'account
  const owned = await db.collection('invites').where('uid', '==', targetUid).get();
  await Promise.all(owned.docs.map((d) => d.ref.delete()));
  // Link del menù condiviso: via; chi era collegato a questa famiglia resta senza collegamento; e si esce dalla famiglia di altri
  const shares = await db.collection('shares').where('uid', '==', targetUid).get();
  await Promise.all(shares.docs.map((d) => d.ref.delete()));
  const viewers = await userRef(targetUid).collection('viewers').get();
  await Promise.all(viewers.docs.map((d) => userRef(d.id).set({ familyId: FieldValue.delete() }, { merge: true }).catch(() => undefined)));
  if (data.familyId) await userRef(data.familyId).collection('viewers').doc(targetUid).delete().catch(() => undefined);

  await db.recursiveDelete(userRef(targetUid));
  try {
    await getAuth().deleteUser(targetUid);
  } catch (err) {
    if (!(err && err.code === 'auth/user-not-found')) throw new HttpsError('internal', 'Dati eliminati ma non l’accesso: riprova.');
  }

  await db.collection('admin_audit_logs').add({
    adminId: actor.uid,
    adminEmail: actor.email || 'unknown',
    action: actor.self ? 'DELETE_OWN_ACCOUNT' : 'DELETE_ACCOUNT',
    targetUserId: targetUid,
    targetUserEmail: data.email || '',
    timestamp: FieldValue.serverTimestamp(),
    details: data.stripeSubscriptionId ? 'Account eliminato e abbonamento chiuso' : 'Account eliminato',
  });
}

exports.deleteUserAccount = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY], timeoutSeconds: 120 },
  async (request) => {
    const adminUid = requireAuth(request);
    if (request.auth.token.admin !== true) throw new HttpsError('permission-denied', 'Solo per amministratori.');
    const targetUid = request.data && request.data.uid;
    if (typeof targetUid !== 'string' || !targetUid) throw new HttpsError('invalid-argument', 'Utente non valido.');
    if (targetUid === adminUid) throw new HttpsError('failed-precondition', 'Non puoi eliminare il tuo account da qui.');
    await eraseAccount(targetUid, { uid: adminUid, email: request.auth.token.email, self: false });
    return { ok: true };
  }
);

// Ognuno può eliminare il proprio account (dalla schermata "Il mio account")
exports.deleteMyAccount = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY], timeoutSeconds: 120 },
  async (request) => {
    const uid = requireAuth(request);
    if (request.auth.token.admin === true) {
      throw new HttpsError('failed-precondition', 'Un amministratore non può eliminare il proprio account da qui.');
    }
    await eraseAccount(uid, { uid, email: request.auth.token.email, self: true });
    return { ok: true };
  }
);

// ---------------------------------------------------------------------------
// Analisi volantini con Gemini (la chiave resta sul server)
// ---------------------------------------------------------------------------

// Prenota una scansione del mese (transazione): il tetto protegge i costi di Gemini
async function reserveFlyerScan(uid) {
  const month = new Date().toISOString().slice(0, 7);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef(uid));
    const data = snap.exists ? snap.data() : {};
    if (data.plan !== 'pro') throw new HttpsError('permission-denied', 'Funzione riservata al piano Chef IA.');
    const used = data.aiUsage && data.aiUsage.month === month ? data.aiUsage.flyerScans || 0 : 0;
    if (used >= FLYER_SCANS_PER_MONTH) {
      throw new HttpsError(
        'resource-exhausted',
        `Hai usato tutte le ${FLYER_SCANS_PER_MONTH} scansioni di questo mese. Si rinnovano il primo del mese prossimo.`
      );
    }
    tx.set(userRef(uid), { aiUsage: { month, flyerScans: used + 1 } }, { merge: true });
    return FLYER_SCANS_PER_MONTH - used - 1;
  });
}

async function refundFlyerScan(uid) {
  const month = new Date().toISOString().slice(0, 7);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef(uid));
    const usage = snap.exists && snap.data().aiUsage;
    if (usage && usage.month === month && usage.flyerScans > 0) {
      tx.set(userRef(uid), { aiUsage: { month, flyerScans: usage.flyerScans - 1 } }, { merge: true });
    }
  });
}

// Riconoscimento degli ingredienti di un piatto di famiglia (tetto mensile: protegge i costi di Gemini)
async function reserveDishSuggestion(uid) {
  const month = new Date().toISOString().slice(0, 7);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef(uid));
    const data = snap.exists ? snap.data() : {};
    const cap = data.plan === 'pro' ? DISH_SUGGESTIONS_PRO : DISH_SUGGESTIONS_FREE;
    const usage = data.dishUsage;
    const used = usage && usage.month === month ? usage.count || 0 : 0;
    if (used >= cap) {
      throw new HttpsError(
        'resource-exhausted',
        cap === DISH_SUGGESTIONS_PRO
          ? `Hai usato tutti i ${cap} riconoscimenti di questo mese.`
          : `Hai usato i ${cap} riconoscimenti di prova di questo mese: con Chef IA ne hai ${DISH_SUGGESTIONS_PRO}.`
      );
    }
    tx.set(userRef(uid), { dishUsage: { month, count: used + 1 } }, { merge: true });
    return cap - used - 1;
  });
}

async function refundDishSuggestion(uid) {
  const month = new Date().toISOString().slice(0, 7);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef(uid));
    const usage = snap.exists && snap.data().dishUsage;
    if (usage && usage.month === month && usage.count > 0) {
      tx.set(userRef(uid), { dishUsage: { month, count: usage.count - 1 } }, { merge: true });
    }
  });
}

exports.suggestDish = onCall(
  { region: REGION, secrets: [GEMINI_API_KEY], timeoutSeconds: 60 },
  async (request) => {
    const uid = requireAuth(request);
    const title = String((request.data && request.data.title) || '').trim().slice(0, 120);
    const notes = String((request.data && request.data.notes) || '').trim().slice(0, 600);
    if (title.length < 2) throw new HttpsError('invalid-argument', 'Scrivi il nome del piatto.');

    const remaining = await reserveDishSuggestion(uid);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Sei un cuoco italiano. Un utente vuole aggiungere questo piatto alla sua famiglia.\nNome del piatto: "${title}"\n${
          notes ? `Cosa c'è dentro, scritto dall'utente: "${notes}"\n` : ''
        }\nElenca gli ingredienti del piatto per 2 porzioni, in italiano, semplici e senza marche. Se l'utente ha indicato gli ingredienti, usa quelli e aggiungi solo ciò che manca per forza. Usa solo queste unità: g, ml, pz, cucchiai, cucchiaini, spicchi. Non includere acqua e sale. Indica anche la categoria (lunch = primo, dinner = secondo, fast = piatto unico, side = contorno, dessert = dolce), la difficoltà, il tempo in minuti e 3-5 passaggi brevi di preparazione.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                  },
                  required: ['name', 'amount', 'unit'],
                },
              },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              timeMin: { type: Type.NUMBER },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['ingredients', 'category', 'difficulty', 'timeMin', 'steps'],
          },
        },
      });
      if (!response.text) throw new HttpsError('internal', 'Nessuna risposta dal modello.');
      const out = JSON.parse(response.text);
      const units = ['g', 'ml', 'pz', 'cucchiai', 'cucchiaini', 'spicchi', 'kg', 'l'];
      const ingredients = (out.ingredients || [])
        .filter((i) => i && typeof i.name === 'string' && i.name.trim())
        .slice(0, 25)
        .map((i) => ({
          name: i.name.trim().charAt(0).toUpperCase() + i.name.trim().slice(1).toLowerCase(),
          amount: Number.isFinite(i.amount) && i.amount > 0 ? i.amount : 100,
          unit: units.includes(i.unit) ? i.unit : 'g',
        }));
      if (ingredients.length === 0) throw new HttpsError('internal', 'Non sono riuscito a riconoscere gli ingredienti.');
      return {
        ingredients,
        category: ['lunch', 'dinner', 'fast', 'side', 'dessert'].includes(out.category) ? out.category : 'lunch',
        difficulty: ['easy', 'medium', 'hard'].includes(out.difficulty) ? out.difficulty : 'easy',
        timeMin: Number.isFinite(out.timeMin) ? Math.min(Math.max(Math.round(out.timeMin), 5), 240) : 30,
        steps: (out.steps || []).filter((x) => typeof x === 'string' && x.trim()).slice(0, 8),
        remaining,
      };
    } catch (err) {
      await refundDishSuggestion(uid).catch(() => {});
      throw err;
    }
  }
);

// Legge il volantino con Gemini e restituisce gli ingredienti in offerta. Conta una scansione del mese; se non riesce, la restituisce.
async function scanFlyer(uid, data, mimeType) {
  const remaining = await reserveFlyerScan(uid);
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          {
            text: "Analizza questo volantino delle offerte e identifica gli ingredienti alimentari SANI (carne, pesce, verdura, frutta, cereali, legumi, latticini base) che sono in offerta. \n\nREGOLE CRITICHE:\n1. ESCLUDI ASSOLUTAMENTE: alcolici (vino, birra, superalcolici), gelati, dolci industriali (merendine, biscotti farciti), snack fritti e bibite zuccherate.\n2. Includi solo ingredienti 'base' che possono essere usati come componenti di un pasto.\n3. Restituisci SOLO una lista di nomi di ingredienti in italiano, puliti e semplici (es. 'Pollo', 'Salmone', 'Zucchine', 'Bresaola', 'Tacchino', 'Carote', 'Salsiccia').",
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: { ingredients: { type: Type.ARRAY, items: { type: Type.STRING } } },
          required: ['ingredients'],
        },
      },
    });
    if (!response.text) throw new HttpsError('internal', 'Nessuna risposta dal modello.');
    const ingredients = JSON.parse(response.text).ingredients.map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase());
    return { ingredients, remaining };
  } catch (err) {
    // La scansione non è andata a buon fine: non va addebitata sul tetto mensile
    await refundFlyerScan(uid).catch(() => {});
    throw err;
  }
}

exports.analyzeFlyer = onCall(
  { region: REGION, secrets: [GEMINI_API_KEY], memory: '512MiB', timeoutSeconds: 120 },
  async (request) => {
    const uid = requireAuth(request);
    const { data, mimeType } = request.data || {};
    if (typeof data !== 'string' || !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(mimeType)) {
      throw new HttpsError('invalid-argument', 'File non valido.');
    }
    return scanFlyer(uid, data, mimeType);
  }
);

// Volantino da un link: il server scarica il file (solo PDF o immagini, mai pagine) e lo legge come quello caricato dal telefono
exports.analyzeFlyerUrl = onCall(
  { region: REGION, secrets: [GEMINI_API_KEY], memory: '512MiB', timeoutSeconds: 120 },
  async (request) => {
    const uid = requireAuth(request);
    let file;
    try {
      file = await flyerUrl.downloadFlyer(request.data && request.data.url);
    } catch (err) {
      if (err instanceof flyerUrl.FlyerUrlError) {
        // Il download non consuma una scansione: la si prenota solo quando c'è un file da leggere
        throw new HttpsError(err.code === 'invalid-url' ? 'invalid-argument' : err.code === 'unreachable' ? 'unavailable' : 'failed-precondition', err.message);
      }
      console.error('Download volantino non riuscito', err);
      throw new HttpsError('unavailable', 'Non riesco ad aprire il link.');
    }
    return scanFlyer(uid, file.data, file.mimeType);
  }
);

// ---------------------------------------------------------------------------
// Scontrini della spesa: per tutti i piani. Il server legge la foto e restituisce negozio, data e totale;
// la foto non si conserva, l'app salva solo questi tre dati.
// ---------------------------------------------------------------------------

async function reserveReceiptScan(uid) {
  const month = new Date().toISOString().slice(0, 7);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef(uid));
    const usage = snap.exists && snap.data().receiptUsage;
    const used = usage && usage.month === month ? usage.count || 0 : 0;
    if (used >= RECEIPT_SCANS_PER_MONTH) {
      throw new HttpsError('resource-exhausted', `Hai letto ${RECEIPT_SCANS_PER_MONTH} scontrini questo mese: per gli altri aggiungi la spesa a mano.`);
    }
    tx.set(userRef(uid), { receiptUsage: { month, count: used + 1 } }, { merge: true });
    return RECEIPT_SCANS_PER_MONTH - used - 1;
  });
}

async function refundReceiptScan(uid) {
  const month = new Date().toISOString().slice(0, 7);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef(uid));
    const usage = snap.exists && snap.data().receiptUsage;
    if (usage && usage.month === month && usage.count > 0) {
      tx.set(userRef(uid), { receiptUsage: { month, count: usage.count - 1 } }, { merge: true });
    }
  });
}

exports.analyzeReceipt = onCall(
  { region: REGION, secrets: [GEMINI_API_KEY], memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const uid = requireAuth(request);
    const { data, mimeType } = request.data || {};
    if (typeof data !== 'string' || data.length > 8_000_000 || !receipts.RECEIPT_MIME_TYPES.includes(mimeType)) {
      throw new HttpsError('invalid-argument', 'Foto non valida: usa una foto (JPG o PNG) o un PDF.');
    }
    const remaining = await reserveReceiptScan(uid);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { mimeType, data } }, { text: receipts.RECEIPT_PROMPT }] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isReceipt: { type: Type.BOOLEAN },
              store: { type: Type.STRING },
              date: { type: Type.STRING },
              total: { type: Type.NUMBER },
            },
            required: ['isReceipt', 'store', 'date', 'total'],
          },
        },
      });
      if (!response.text) throw new HttpsError('internal', 'Nessuna risposta dal modello.');
      return { receipt: receipts.cleanReceipt(JSON.parse(response.text)), remaining };
    } catch (err) {
      // Lettura non riuscita: non conta sul tetto del mese
      await refundReceiptScan(uid).catch(() => {});
      if (err instanceof receipts.ReceiptError) throw new HttpsError('failed-precondition', err.message);
      if (err instanceof HttpsError) throw err;
      console.error('Lettura scontrino non riuscita', err);
      throw new HttpsError('internal', 'Non sono riuscito a leggere lo scontrino. Riprova o aggiungi la spesa a mano.');
    }
  }
);
