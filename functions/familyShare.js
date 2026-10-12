// Condivisione del menù della famiglia: un codice/link per consultarlo senza account (web) o per collegarsi dall'app.
// Qui c'è solo la logica pura (codici, validità, cosa mostrare agli esterni): si prova con i test.
const crypto = require('node:crypto');

const SHARE_DAYS = 60;
const MAX_VIEWERS = 20;
// Niente 0/O, 1/I/L: si legge e si scrive senza errori
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 12;
const WEEK_DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

/** Codice segreto di 12 caratteri (60 bit), nel formato XXXX-XXXX-XXXX. */
function newShareCode() {
  let raw = '';
  for (let i = 0; i < CODE_LENGTH; i++) raw += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

/** Accetta il codice scritto a mano o l'intero link e lo porta al formato canonico; null se non è un codice valido. */
function normalizeCode(input) {
  if (typeof input !== 'string') return null;
  let text = input.trim();
  const hash = text.indexOf('#');
  if (hash >= 0) text = text.slice(hash + 1);
  const raw = text.toUpperCase().replace(/[\s-]/g, '');
  if (raw.length !== CODE_LENGTH || [...raw].some((c) => !ALPHABET.includes(c))) return null;
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

/** Nel database resta solo l'impronta del codice. */
const hashCode = (code) => crypto.createHash('sha256').update(`share:${code}`).digest('hex');

/** Validità di un link: ok, oppure il motivo per cui non si può più usare. */
function shareState(share, now = Date.now()) {
  if (!share) return 'missing';
  if (share.revoked) return 'revoked';
  if (typeof share.expiresAt === 'number' && share.expiresAt < now) return 'expired';
  return 'ok';
}

const text = (value, max) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
const num = (value, fallback = 0) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

const idList = (value) =>
  Array.isArray(value) ? value.filter((id) => typeof id === 'string' && id.length > 0 && id.length <= 128).slice(0, 6) : [];

/** Ricetta scritta dall'utente, ridotta ai soli campi che servono per leggerla. */
function publicRecipe(recipe) {
  if (!recipe || typeof recipe !== 'object') return null;
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.slice(0, 60) : [];
  return {
    title: text(recipe.title, 120),
    timeMin: num(recipe.timeMin),
    servings: num(recipe.servings, 2),
    ingredients: ingredients.map((i) => ({ name: text(i && i.name, 80), amount: num(i && i.amount), unit: text(i && i.unit, 20) })).filter((i) => i.name),
    instructions: (Array.isArray(recipe.instructions) ? recipe.instructions.slice(0, 40) : []).map((s) => text(s, 600)).filter(Boolean),
  };
}

/**
 * Cosa vede chi apre il link senza account: solo i pasti (pranzo e cena di ogni giorno) e le ricette scritte dall'utente
 * che compaiono nel menù. Mai le alternative per persona (rivelerebbero diete e allergie), né i nomi o le preferenze delle
 * persone, né altri campi del piano.
 */
function publicMenuView(plan, customRecipesById) {
  if (!plan || typeof plan !== 'object' || !plan.days || typeof plan.days !== 'object') return null;
  const days = {};
  const custom = {};
  let meals = 0;
  for (const day of WEEK_DAYS) {
    const source = plan.days[day] || {};
    const lunch = idList(source.lunchIds);
    const dinner = idList(source.dinnerIds);
    days[day] = { lunch, dinner };
    meals += (lunch.length ? 1 : 0) + (dinner.length ? 1 : 0);
    for (const id of [...lunch, ...dinner]) {
      const recipe = customRecipesById && customRecipesById[id];
      if (recipe && !custom[id]) {
        const clean = publicRecipe(recipe);
        if (clean && clean.title) custom[id] = clean;
      }
    }
  }
  if (meals === 0) return null;
  return { startDate: typeof plan.startDate === 'string' ? plan.startDate.slice(0, 40) : null, days, customRecipes: custom };
}

module.exports = { SHARE_DAYS, MAX_VIEWERS, WEEK_DAYS, newShareCode, normalizeCode, hashCode, shareState, publicMenuView };
