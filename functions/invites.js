// Inviti ai familiari: ogni persona riceve un link riservato e compila da sola allergie, gusti e piatti.
// Qui c'è solo la logica pura (token, controllo delle risposte, unione dei dati): si prova con i test.
const crypto = require('node:crypto');

const INVITE_DAYS = 14;
const MAX_SUBMISSIONS = 20;
const DIETS = ['vegan', 'gluten-free', 'lactose-free'];
const MAX_LIST = 30;
const MAX_TEXT = 40;

/** Piatti del gioco: stessi id e titoli delle ricette dell'app (un test li confronta). */
const INVITE_DISHES = [
  { id: 'meal-101', title: 'Spaghetti alla Carbonara (Ricetta Tradizionale)', ingredients: ['Spaghetti', 'Guanciale', 'Uova'] },
  { id: 'meal-102', title: "Spaghetti all'Amatriciana", ingredients: ['Spaghetti', 'Guanciale', 'Pomodoro'] },
  { id: 'meal-121', title: 'Lasagne alla bolognese', ingredients: ['Pasta', 'Ragù', 'Besciamella'] },
  { id: 'meal-115', title: 'Pizza Margherita', ingredients: ['Impasto', 'Pomodoro', 'Mozzarella'] },
  { id: 'meal-28', title: 'Cotoletta alla milanese croccante', ingredients: ['Vitello', 'Pangrattato', 'Uova'] },
  { id: 'meal-4', title: 'Risotto allo zafferano', ingredients: ['Riso', 'Zafferano', 'Parmigiano'] },
  { id: 'meal-14', title: 'Polpette classiche al sugo', ingredients: ['Carne', 'Pane', 'Pomodoro'] },
  { id: 'meal-31', title: 'Pasta al Pesto alla Genovese', ingredients: ['Pasta', 'Basilico', 'Pinoli'] },
  { id: 'meal-136', title: 'Melanzane alla parmigiana light', ingredients: ['Melanzane', 'Pomodoro', 'Mozzarella'] },
  { id: 'meal-40', title: 'Pollo alla cacciatora', ingredients: ['Pollo', 'Pomodoro', 'Olive'] },
  { id: 'meal-13', title: 'Tortellini in brodo', ingredients: ['Tortellini', 'Brodo'] },
  { id: 'meal-spaghetti-vongole', title: 'Spaghetti alle vongole', ingredients: ['Spaghetti', 'Vongole', 'Aglio'] },
  { id: 'meal-5', title: 'Pasta e fagioli', ingredients: ['Pasta', 'Fagioli'] },
  { id: 'cold-9', title: 'Caprese classica', ingredients: ['Pomodoro', 'Mozzarella', 'Basilico'] },
  { id: 'meal-25', title: 'Frittata di patate classica', ingredients: ['Uova', 'Patate'] },
  { id: 'meal-125', title: 'Bistecca ai ferri', ingredients: ['Manzo'] },
  { id: 'meal-29', title: 'Hamburger fatto in casa con limone', ingredients: ['Manzo', 'Pane', 'Limone'] },
  { id: 'meal-105', title: 'Orata al forno con patate e pomodorini', ingredients: ['Orata', 'Patate', 'Pomodorini'] },
  { id: 'meal-9', title: 'Salmone al cartoccio con agrumi', ingredients: ['Salmone', 'Agrumi'] },
  { id: 'fast-2', title: 'Pasta al tonno veloce', ingredients: ['Pasta', 'Tonno', 'Pomodoro'] },
];
const DISH_IDS = new Set(INVITE_DISHES.map((d) => d.id));

/** Il token si dà solo a chi riceve il link; nel database resta solo la sua impronta. */
const newToken = () => crypto.randomBytes(24).toString('base64url');
const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
const looksLikeToken = (token) => typeof token === 'string' && /^[A-Za-z0-9_-]{32}$/.test(token);

/** Stato di un invito: ok, oppure il motivo per cui non si può più usare. */
function inviteState(invite, now = Date.now()) {
  if (!invite) return 'missing';
  if (invite.revoked) return 'revoked';
  if (typeof invite.expiresAt === 'number' && invite.expiresAt < now) return 'expired';
  if ((invite.submissions || 0) >= MAX_SUBMISSIONS) return 'full';
  return 'ok';
}

const clean = (value) =>
  typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT)
    : '';
const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

function textList(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const out = [];
  for (const item of value) {
    const text = clean(item);
    const key = text.toLowerCase();
    if (text.length < 2 || seen.has(key)) continue;
    seen.add(key);
    out.push(capitalize(text));
    if (out.length >= MAX_LIST) break;
  }
  return out;
}

function mealList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === 'string' && DISH_IDS.has(id)))];
}

/**
 * Controlla e ripulisce le risposte ricevute dal link: solo i campi previsti, liste corte, testi brevi,
 * piatti tra quelli proposti. Senza consenso esplicito non si accetta nulla.
 */
function sanitizeAnswers(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Richiesta non valida.' };
  if (body.consent !== true) return { ok: false, error: 'Serve il consenso per salvare le risposte.' };
  const likedMeals = mealList(body.likedMeals);
  const dislikedMeals = mealList(body.dislikedMeals).filter((id) => !likedMeals.includes(id));
  const liked = textList(body.likedIngredients);
  const likedKeys = new Set(liked.map((x) => x.toLowerCase()));
  return {
    ok: true,
    answers: {
      allergies: textList(body.allergies),
      dietaryRestrictions: Array.isArray(body.dietaryRestrictions)
        ? [...new Set(body.dietaryRestrictions.filter((d) => DIETS.includes(d)))]
        : [],
      likedIngredients: liked,
      dislikedIngredients: textList(body.dislikedIngredients).filter((x) => !likedKeys.has(x.toLowerCase())),
      likedMeals,
      dislikedMeals,
    },
  };
}

const unionText = (a = [], b = []) => {
  const seen = new Set();
  return [...a, ...b].filter((x) => {
    const key = String(x).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const minusText = (list, remove) => {
  const gone = new Set(remove.map((x) => String(x).toLowerCase()));
  return list.filter((x) => !gone.has(String(x).toLowerCase()));
};

/**
 * Unisce le risposte della persona ai dati già nella sua scheda.
 * Allergie e diete si sommano sempre (mai togliere una protezione); sui gusti vince chi risponde.
 */
function mergeAnswers(existing, answers) {
  const current = existing || {};
  return {
    allergies: unionText(current.allergies, answers.allergies),
    dietaryRestrictions: unionText(current.dietaryRestrictions, answers.dietaryRestrictions),
    likedIngredients: minusText(unionText(current.likedIngredients, answers.likedIngredients), answers.dislikedIngredients),
    dislikedIngredients: minusText(unionText(current.dislikedIngredients, answers.dislikedIngredients), answers.likedIngredients),
    likedMeals: minusText(unionText(current.likedMeals, answers.likedMeals), answers.dislikedMeals),
    dislikedMeals: minusText(unionText(current.dislikedMeals, answers.dislikedMeals), answers.likedMeals),
  };
}

module.exports = {
  INVITE_DAYS,
  MAX_SUBMISSIONS,
  INVITE_DISHES,
  newToken,
  hashToken,
  looksLikeToken,
  inviteState,
  sanitizeAnswers,
  mergeAnswers,
};
