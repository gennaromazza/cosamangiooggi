const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const Stripe = require('stripe');
const { GoogleGenAI, Type } = require('@google/genai');

const REGION = 'europe-west1';
const FIRESTORE_DB_ID = 'ai-studio-93a2a041-9b02-4ff7-b496-5f2ada58f953';

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const PRICE_SMART = defineString('PRICE_SMART');
const PRICE_PRO = defineString('PRICE_PRO');
const ADMIN_EMAILS = defineString('ADMIN_EMAILS', { default: '' });
const APP_URL = defineString('APP_URL');

initializeApp();
const db = getFirestore(FIRESTORE_DB_ID);

const requireAuth = (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Accesso richiesto.');
  return request.auth.uid;
};

const userRef = (uid) => db.collection('users').doc(uid);

// ---------------------------------------------------------------------------
// Stripe: abbonamenti
// ---------------------------------------------------------------------------

async function getOrCreateCustomer(stripe, uid, email) {
  const snap = await userRef(uid).get();
  const existing = snap.exists ? snap.data().stripeCustomerId : null;
  if (existing) return existing;
  const customer = await stripe.customers.create({ email, metadata: { uid } });
  await userRef(uid).set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

exports.createCheckoutSession = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    const uid = requireAuth(request);
    const plan = request.data && request.data.plan;
    if (plan !== 'smart' && plan !== 'pro') throw new HttpsError('invalid-argument', 'Piano non valido.');

    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    const customer = await getOrCreateCustomer(stripe, uid, request.auth.token.email);
    const base = APP_URL.value().replace(/\/$/, '');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer,
      client_reference_id: uid,
      line_items: [{ price: plan === 'pro' ? PRICE_PRO.value() : PRICE_SMART.value(), quantity: 1 }],
      subscription_data: { metadata: { uid, plan } },
      allow_promotion_codes: true,
      locale: 'it',
      success_url: `${base}/?checkout=success`,
      cancel_url: `${base}/?checkout=cancel`,
    });
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
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url: APP_URL.value(),
    });
    return { url: session.url };
  }
);

async function findUid(customerId, metadataUid) {
  if (metadataUid) return metadataUid;
  const q = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  return q.empty ? null : q.docs[0].id;
}

function planFromSubscription(sub) {
  const priceId = sub.items && sub.items.data[0] && sub.items.data[0].price.id;
  if (priceId === PRICE_PRO.value()) return 'pro';
  if (priceId === PRICE_SMART.value()) return 'smart';
  return null;
}

async function applySubscription(sub) {
  const uid = await findUid(sub.customer, sub.metadata && sub.metadata.uid);
  if (!uid) return;
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
        }
      : { plan: 'free', autoRenew: false, subscriptionStatus: null, stripeSubscriptionId: null },
    { merge: true }
  );
}

async function recordInvoice(invoice) {
  const uid = await findUid(invoice.customer, null);
  if (!uid) return;
  const line = invoice.lines && invoice.lines.data[0];
  const priceId = line && line.pricing && line.pricing.price_details && line.pricing.price_details.price
    || line && line.price && line.price.id;
  const plan = priceId === PRICE_PRO.value() ? 'pro' : 'smart';
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
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
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

// ---------------------------------------------------------------------------
// Analisi volantini con Gemini (la chiave resta sul server)
// ---------------------------------------------------------------------------

exports.analyzeFlyer = onCall(
  { region: REGION, secrets: [GEMINI_API_KEY], memory: '512MiB', timeoutSeconds: 120 },
  async (request) => {
    const uid = requireAuth(request);
    const snap = await userRef(uid).get();
    if (!snap.exists || snap.data().plan !== 'pro') {
      throw new HttpsError('permission-denied', 'Funzione riservata al piano Chef Pro.');
    }
    const { data, mimeType } = request.data || {};
    if (typeof data !== 'string' || !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(mimeType)) {
      throw new HttpsError('invalid-argument', 'File non valido.');
    }

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
    const ingredients = JSON.parse(response.text).ingredients.map(
      (i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()
    );
    return { ingredients };
  }
);
