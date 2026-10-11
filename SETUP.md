# Configurazione (una tantum, fattibile da telefono)

Tutto si imposta da GitHub → repository → **Settings → Secrets and variables → Actions**.

## 1. Firebase
1. Console Firebase → progetto `gen-lang-client-0532460534` → passa al **piano Blaze** (serve per le Cloud Functions).
2. Authentication → Sign-in method → abilita **Email/Password** e **Google**.
3. Impostazioni progetto → Account di servizio → **Genera nuova chiave privata**. Incolla tutto il contenuto JSON nel Secret `FIREBASE_SERVICE_ACCOUNT`.
   (L'account deve avere i ruoli: Firebase Admin, Cloud Functions Admin, Secret Manager Admin, Utente account di servizio.)

## 2. Stripe
1. Crea due prodotti con **prezzo ricorrente mensile**: Smart (2,99 €) e Chef Pro (5,99 €). Copia i due ID `price_...`.
2. Impostazioni → Billing → **Portale clienti**: attivalo (disdetta, cambio carta, fatture).
3. Dopo il primo deploy: Sviluppatori → Webhook → aggiungi endpoint
   `https://europe-west1-gen-lang-client-0532460534.cloudfunctions.net/stripeWebhook`
   con gli eventi `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`.
   Copia il "Signing secret" (`whsec_...`).

## 3. Secrets e variabili su GitHub
**Secrets**: `FIREBASE_SERVICE_ACCOUNT`, `STRIPE_SECRET_KEY` (`sk_...`), `STRIPE_WEBHOOK_SECRET` (`whsec_...`), `GEMINI_API_KEY` (nuova chiave!).
**Variables**: `PRICE_SMART`, `PRICE_PRO`, `APP_URL` (es. `https://gen-lang-client-0532460534.web.app`), `ADMIN_EMAILS` (email admin separate da virgola).

## 4. Pubblicare
Actions → **Deploy Firebase** → Run workflow. Poi **Build Android APK** → scarica l'artefatto `che-cucino-oggi-apk`.

Gli amministratori sono solo le email in `ADMIN_EMAILS` con email verificata (Google la verifica da solo).
