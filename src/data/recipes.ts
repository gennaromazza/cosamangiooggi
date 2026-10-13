import { Recipe } from '../types';
import { MORNING_RECIPES } from './mornings';

const BASE_RECIPES: Recipe[] = [
  {
    id: 'meal-spaghetti-gamberi',
    title: 'Spaghetti ai gamberi',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Spaghetti', amount: 160, unit: 'g' },
      { name: 'Gamberi freschi puliti', amount: 200, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
      { name: 'Prezzemolo fresco', amount: 5, unit: 'g' },
      { name: 'Peperoncino fresco', amount: 0.5, unit: 'pz' }
    ],
    instructions: [
      "Mettere a bollire abbondante acqua salata e cuocere gli spaghetti al dente.",
      "In una padella capiente, scaldare l'olio EVO con uno spicchio d'aglio schiacciato e un pizzico di peperoncino fresco a piacere.",
      "Aggiungere i gamberi puliti e saltarli a fuoco vivo per 2-3 minuti. Sfumare con il vino bianco e lasciare evaporare completamente l'alcol.",
      "Scolare la pasta al dente direttamente nella padella con i gamberi, aggiungendo un mestolo di acqua di cottura.",
      "Saltare il tutto a fuoco vivo per un minuto per legare i sapori, quindi spegnere il fuoco.",
      "Completare con abbondante prezzemolo fresco tritato finemente e un filo d'olio a crudo prima di servire."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 440,
      protein: 22,
      carbs: 62,
      fat: 10
    }
  },
  {
    id: 'meal-farfalle-zucchine-gamberetti',
    title: 'Farfalle zucchine e gamberetti',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Farfalle (pasta)', amount: 160, unit: 'g' },
      { name: 'Gamberetti sgusciati', amount: 150, unit: 'g' },
      { name: 'Zucchine medie', amount: 2, unit: 'pz' },
      { name: 'Cipolla', amount: 0.5, unit: 'pz' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Vino bianco', amount: 30, unit: 'ml' },
      { name: 'Sale e pepe', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      "Portare a bollore l'acqua per la pasta e salarla. Cuocere le farfalle seguendo i tempi indicati sulla confezione.",
      "Lavare le zucchine, spuntarle e tagliarle a rondelle sottili o a julienne. Tritare finemente la mezza cipolla.",
      "In una padella antiaderente, far appassire la cipolla con l'olio EVO, quindi unire le zucchine e cuocere a fuoco medio per circa 8-10 minuti finché non saranno tenere.",
      "Aggiungere i gamberetti sgusciati, sfumare con il vino bianco e far cuocere per altri 3-4 minuti. Regolare di sale e pepe.",
      "Scolare le farfalle al dente e versarle direttamente nella padella con il condimento di zucchine e gamberetti.",
      "Saltare la pasta per un minuto per amalgamare i sapori e servire calda."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 420,
      protein: 19,
      carbs: 64,
      fat: 8
    }
  },
  {
    id: 'meal-spaghetti-cozze',
    title: 'Spaghetti alle cozze',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Spaghetti', amount: 160, unit: 'g' },
      { name: 'Cozze fresche (pulite)', amount: 500, unit: 'g' },
      { name: 'Aglio', amount: 2, unit: 'spicchi' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
      { name: 'Prezzemolo fresco', amount: 5, unit: 'g' },
      { name: 'Pepe nero', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      "In un'ampia casseruola, scaldare un filo di olio EVO con uno spicchio d'aglio schiacciato. Unire le cozze ben pulite, coprire con il coperchio e cuocere a fuoco vivo per 5-7 minuti finché non si saranno aperte tutte.",
      "Sgusciare la maggior parte delle cozze e tenerne qualcuna intera per la decorazione finali. Filtrare il liquido rilasciato dalle cozze con un colino a maglie strette e tenerlo da parte.",
      "Nel frattempo, cuocere gli spaghetti in abbondante acqua leggermente salata (attenzione a non eccedere poiché l'acqua delle cozze è saporita).",
      "In un'altra padella, scaldare il restante olio EVO con il secondo spicchio d'aglio intero e un pizzico di peperoncino se gradito. Sfumare con il vino bianco.",
      "Unire l'acqua filtrata delle cozze e lasciare ridurre per un minuto, poi aggiungere le cozze sgusciate.",
      "Scolare gli spaghetti molto al dente e completare la cottura nella padella con il sugo di cozze, mescolando continuamente per emulsionare il condimento.",
      "Servire completando con il prezzemolo tritato fresco, le cozze col guscio tenute da parte e una generosa spolverata di pepe nero."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 460,
      protein: 24,
      carbs: 61,
      fat: 11
    }
  },
  {
    id: 'meal-risotto-frutti-mare',
    title: 'Risotto ai frutti di mare',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 45,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 160, unit: 'g' },
      { name: 'Misto frutti di mare (cozze, vongole, gamberi, calamari)', amount: 300, unit: 'g' },
      { name: 'Brodo di pesce (o vegetale)', amount: 1, unit: 'l' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Vino bianco', amount: 60, unit: 'ml' },
      { name: 'Prezzemolo fresco', amount: 5, unit: 'g' },
      { name: 'Concentrato di pomodoro', amount: 1, unit: 'cucchiaino' }
    ],
    instructions: [
      "Preparare il brodo di pesce o vegetale e mantenerlo caldissimo a fuoco dolce.",
      "In una casseruola capiente, scaldare l'olio EVO con lo spicchio d'aglio intero. Aggiungere il misto frutti di mare puliti (calamari a rondelle, gamberi sgusciati, cozze e vongole) e cuocere a fuoco vivo per 3-4 minuti. Sfumare con metà del vino bianco, quindi togliere i frutti di mare e tenerli da parte.",
      "Nella stessa casseruola con i succhi saporiti del pesce, versare il riso Carnaroli e tostarlo per 2 minuti mescolando. Sfumare con il restante vino bianco.",
      "Aggiungere il concentrato di pomodoro sciolto in un po' di brodo, quindi iniziare a bagnare il riso con il brodo bollente, un mestolo alla volta, man mano che viene assorbito.",
      "Continuare la cottura del risotto per circa 15-18 minuti mescolando spesso. A 5 minuti dalla fine, unire i frutti di mare tenuti da parte.",
      "Una volta cotto il riso al dente, spegnere il fuoco, regolare di sale e pepe, aggiungere un filo d'olio EVO a crudo e il prezzemolo tritato fresco. Coprire e far riposare per 2 minuti prima di servire ben caldo."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 450,
      protein: 21,
      carbs: 68,
      fat: 9
    }
  },
  {
    id: 'meal-spaghetti-vongole',
    title: 'Spaghetti alle vongole',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Spaghetti', amount: 160, unit: 'g' },
      { name: 'Vongole veraci', amount: 400, unit: 'g' },
      { name: 'Aglio', amount: 2, unit: 'spicchi' },
      { name: 'Olio EVO', amount: 25, unit: 'ml' },
      { name: 'Prezzemolo fresco', amount: 5, unit: 'g' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
      { name: 'Peperoncino fresco', amount: 0.5, unit: 'pz' }
    ],
    instructions: [
      "Spurgare le vongole tenendole a bagno in acqua fredda salata per almeno 2 ore, poi sciacquarle accuratamente per eliminare ogni residuo di sabbia.",
      "In una padella capiente, scaldare metà dell'olio EVO con uno spicchio d'aglio intero e il peperoncino. Unire le vongole, sfumare con il vino bianco, coprire immediatamente con il coperchio e cuocere a fuoco vivo fino a quando non saranno tutte aperte (circa 3-5 minuti). Spegnere il fuoco.",
      "Sgusciare metà delle vongole e filtrare accuratamente il liquido rilasciato con un colino a maglie strette per remover ogni impurità.",
      "Cuocere gli spaghetti in abbondante acqua leggermente salata e scolarli a metà cottura.",
      "Rimettere in padella l'acqua delle vongole filtrata con la pasta molto al dente, aggiungere l'altro spicchio d'aglio (tritato o intero da rimuovere) e finire di cuocere la pasta risottandola nel liquido.",
      "Verso la fine, unire tutte le vongole (sia sgusciate che intere) e abbondante prezzemolo fresco tritato finemente. Mescolare vigorosamente per formare una deliziosa emulsione cremosa e servire subito."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 480,
      protein: 20,
      carbs: 61,
      fat: 12
    }
  },
  {
    id: 'meal-fresella-caprese',
    title: 'Fresella alla caprese',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 10,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Freselle integrali o bianche', amount: 2, unit: 'pz' },
      { name: 'Pomodori maturi', amount: 200, unit: 'g' },
      { name: 'Mozzarella di bufala (o vaccina)', amount: 125, unit: 'g' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Basilico fresco', amount: 8, unit: 'foglie' },
      { name: 'Origano secco', amount: 1, unit: 'pizzico' },
      { name: 'Sale', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      "Bagnare rapidamente le freselle passandole sotto un getto di acqua fredda corrente per qualche secondo (regolare il tempo in base alla consistenza desiderata, più o meno croccante).",
      "Adagiare le freselle bagnate sui piatti da portata.",
      "Lavare i pomodori e tagliarli a piccoli dadini. Raccoglierli in una ciotola e condirli con l'olio EVO, un pizzico di sale, origano secco e qualche foglia di basilico spezzettata con le mani. Lasciare insaporire per 5 minuti.",
      "Tagliare la mozzarella a cubetti, lasciandola sgocciolare leggermente se troppo acquosa.",
      "Distribuire generosamente i pomodori conditi con il loro succo sopra le freselle, in modo che la base si insaporisca ulteriormente.",
      "Completare con la mozzarella a cubetti, altre foglie di basilico fresco e un ultimo filo di olio EVO a crudo. Servire subito o far riposare per 10 minuti."
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 380,
      protein: 15,
      carbs: 32,
      fat: 20
    }
  },
  {
    id: 'meal-fresella-tonno-pomodoro',
    title: 'Fresella tonno e pomodoro',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 10,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Freselle integrali o bianche', amount: 2, unit: 'pz' },
      { name: 'Tonno sott\'olio sgocciolato', amount: 160, unit: 'g' },
      { name: 'Pomodori maturi', amount: 150, unit: 'g' },
      { name: 'Olive nere denocciolate', amount: 30, unit: 'g' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Origano secco', amount: 1, unit: 'pizzico' },
      { name: 'Sale', amount: 1, unit: 'pizzico' },
      { name: 'Basilico fresco', amount: 4, unit: 'foglie' }
    ],
    instructions: [
      "Bagnare velocemente le freselle passandole sotto l'acqua corrente fredda per ammorbidirle leggermente, senza esagerare per non renderle troppo molli.",
      "Disporre le freselle sui piatti.",
      "Lavare e tagliare i pomodori a pezzetti. Riunirli in una ciotola insieme al tonno sgocciolato e leggermente sgranato con una forchetta.",
      "Aggiungere le olive nere tagliate a rondelle, condire con l'olio EVO, un pizzico di sale e l'origano secco. Mescolare bene il tutto.",
      "Distribuire il condimento di pomodoro, tonno e olive in modo uniforme sopra le freselle bagnate, facendo colare anche il delizioso succo di condimento.",
      "Guarnire con foglie di basilico fresco e un filo di olio EVO a crudo prima di gustare."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 390,
      protein: 21,
      carbs: 33,
      fat: 16
    }
  },
  {
    id: 'meal-orzo-mediterranea-pesto',
    title: 'Orzo alla mediterranea con pesto',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Orzo perlato', amount: 160, unit: 'g' },
      { name: 'Pesto alla genovese', amount: 80, unit: 'g' },
      { name: 'Pomodorini ciliegino', amount: 150, unit: 'g' },
      { name: 'Mozzarelline (ciliegine)', amount: 120, unit: 'g' },
      { name: 'Pinoli tostati', amount: 15, unit: 'g' },
      { name: 'Olio EVO', amount: 10, unit: 'ml' },
      { name: 'Basilico fresco', amount: 5, unit: 'foglie' }
    ],
    instructions: [
      "Sciacqua l'orzo perlato sotto acqua corrente, poi lessalo in abbondante acqua salata per circa 20-25 minuti (o secondo i tempi indicati sulla confezione).",
      "Scola l'orzo al dente, passalo rapidamente sotto un getto di acqua fredda per bloccare la cottura e scolalo benissimo.",
      "Lava i pomodorini e tagliali in quarti. Taglia le ciliegine di mozzarella a metà.",
      "In una ciotola capiente unisci l'orzo sgranato, il pesto alla genovese e mescola bene per distribuire il condimento.",
      "Aggiungi i pomodorini, le mozzarelline e i pinoli precedentemente tostati in un padellino antiaderente per un minuto.",
      "Condisci con un filo leggero di olio EVO, decora con le foglie di basilico fresco e fai riposare in frigorifero per 30 minuti prima di servire."
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 460,
      protein: 15,
      carbs: 45,
      fat: 24
    }
  },
  {
    id: 'meal-orzo-trentino',
    title: "Minestrone d'orzo trentino",
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 50,
    season: 'winter',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Orzo perlato', amount: 120, unit: 'g' },
      { name: 'Speck in una sola fetta (a cubetti)', amount: 80, unit: 'g' },
      { name: 'Patate medie', amount: 2, unit: 'pz' },
      { name: 'Carota', amount: 1, unit: 'pz' },
      { name: 'Sedano', amount: 1, unit: 'costa' },
      { name: 'Cipolla', amount: 1, unit: 'piccola' },
      { name: 'Brodo vegetale', amount: 1.2, unit: 'l' },
      { name: 'Burro', amount: 15, unit: 'g' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Parmigiano Reggiano grattugiato', amount: 30, unit: 'g' },
      { name: 'Erba cipollina', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      "Prepara un trito con carota, sedano e cipolla. Taglia lo speck e le patate sbucciate a piccoli dadini.",
      "In una pentola capiente fai sciogliere il burro insieme all'olio EVO, aggiungi lo speck e il trito di verdure, e fai rosolare a fuoco dolce per 5 minuti.",
      "Unisci le patate a cubetti e l'orzo perlato ben sciacquato. Fai insaporire mescolando per un paio di minuti.",
      "Bagna con il brodo vegetale bollente, porta a bollore e copri parzialmente con un coperchio.",
      "Lascia cuocere a fuoco lento per circa 40 minuti, mescolando di tanto in tanto, finché l'orzo non sarà tenero e la zuppa densa e cremosa (grazie all'amido rilasciato dalle patate e dall'orzo).",
      "Spegni il fuoco, regola di sale e pepe, aggiungi l'erba cipollina tritata e il Parmigiano grattugiato. Lascia riposare qualche minuto prima di servire caldissimo."
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 430,
      protein: 16,
      carbs: 52,
      fat: 17
    }
  },
  {
    id: 'meal-orzo-crema-broccoli',
    title: 'Orzo con crema di broccoli',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 30,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Orzo perlato', amount: 160, unit: 'g' },
      { name: 'Broccoli (cimette)', amount: 350, unit: 'g' },
      { name: 'Ricotta vaccina', amount: 100, unit: 'g' },
      { name: 'Parmigiano Reggiano grattugiato', amount: 30, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Peperoncino a piacere', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      "Sciacqua l'orzo perlato e lessalo in abbondante acqua salata bollente per circa 25 minuti.",
      "Nel frattempo, lava le cimette di broccoli e lessale o cuocile a vapore per circa 8-10 minuti finché non saranno morbide.",
      "In un frullatore o con un mixer a immersione, unisci i broccoli cotti, la ricotta, il Parmigiano, un pizzico di sale, pepe e un mestolo di acqua di cottura dell'orzo. Frulla fino a ottenere una crema liscia e densa.",
      "In una padella fai scaldare l'olio EVO con lo spicchio d'aglio intero e il peperoncino. Rimuovi l'aglio appena si sarà dorato.",
      "Scola l'orzo al dente, versalo nella padella con l'olio aromatizzato, unisci la crema di broccoli e ricotta, e manteca a fuoco dolce per un minuto mescolando bene.",
      "Servi l'orzo cremoso caldissimo, completando con un filo di olio EVO a crudo e un'ulteriore spolverata di Parmigiano."
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 410,
      protein: 16,
      carbs: 48,
      fat: 16
    }
  },
  {
    id: 'meal-orzo-lenticchie',
    title: 'Orzo e lenticchie',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 40,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Orzo perlato', amount: 140, unit: 'g' },
      { name: 'Lenticchie marroni in scatola (scolate)', amount: 240, unit: 'g' },
      { name: 'Carota', amount: 1, unit: 'pz' },
      { name: 'Sedano', amount: 1, unit: 'costa' },
      { name: 'Cipolla', amount: 1, unit: 'piccola' },
      { name: 'Passata di pomodoro', amount: 100, unit: 'g' },
      { name: 'Brodo vegetale', amount: 1, unit: 'l' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' },
      { name: 'Alloro', amount: 1, unit: 'foglia' }
    ],
    instructions: [
      "Prepara un trito fine con carota, sedano e cipolla.",
      "In una pentola dai bordi alti, fai dorare il trito con l'olio EVO e il rametto di rosmarino legato con dello spago da cucina (per toglierlo facilmente).",
      "Sciacqua molto bene l'orzo perlato sotto l'acqua corrente e versalo nella pentola. Falo tostare per 1 minuto.",
      "Aggiungi la passata di pomodoro, la foglia di alloro, le lenticchie sciacquate e scolate, e copri interamente con il brodo vegetale caldo.",
      "Cuoci a fuoco dolce per circa 25-30 minuti, mescolando regolarmente e aggiungendo altro brodo caldo se la zuppa si asciuga troppo.",
      "A fine cottura regola di sale e pepe, rimuovi l'alloro e il rosmarino, e servi calda con un filo d'olio EVO a crudo."
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 360,
      protein: 15,
      carbs: 52,
      fat: 9
    }
  },
  {
    id: 'meal-farro-greca',
    title: 'Farro alla greca',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Farro perlato', amount: 160, unit: 'g' },
      { name: 'Feta', amount: 100, unit: 'g' },
      { name: 'Pomodorini', amount: 150, unit: 'g' },
      { name: 'Cetriolo', amount: 1, unit: 'pz' },
      { name: 'Olive nere', amount: 50, unit: 'g' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Origano secco', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      "Lessa il farro perlato in abbondante acqua salata per circa 20 minuti (o secondo le indicazioni della confezione), poi scolalo e lascialo raffreddare sotto l'acqua corrente o a temperatura ambiente.",
      "Nel frattempo, lava i pomodorini e tagliali in quattro. Taglia il cetriolo a cubetti e la feta a dadini.",
      "In un'insalatiera unisci il farro freddo, i pomodorini, il cetriolo, le olive nere e la feta.",
      "Condisci con olio EVO, sale, pepe e un pizzico di origano secco. Mescola bene e lascia riposare in frigo prima di servire."
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 380,
      protein: 12,
      carbs: 48,
      fat: 14
    }
  },
  {
    id: 'meal-farro-tonno-zucchine',
    title: 'Farro tonno e zucchine',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Farro perlato', amount: 160, unit: 'g' },
      { name: 'Tonno sott\'olio sgocciolato', amount: 160, unit: 'g' },
      { name: 'Zucchine', amount: 2, unit: 'pz' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Menta fresca', amount: 5, unit: 'foglie' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' }
    ],
    instructions: [
      "Lessa il farro in abbondante acqua salata per circa 20 minuti, poi scolalo e lascialo raffreddare.",
      "Lava le zucchine e tagliale a rondelle sottili o a julienne.",
      "In una padella fai scaldare l'olio EVO con uno spicchio d'aglio, aggiungi le zucchine e cuocile a fuoco vivo per 5 minuti in modo che rimangano croccanti. Sala leggermente, rimuovi l'aglio e lascia raffreddare.",
      "In un'ampia ciotola unisci il farro sgranato, le zucchine cotte e il tonno sott'olio sgocciolato e spezzettato.",
      "Profuma con foglie di menta fresca spezzettate, mescola bene aggiungendo un filo d'olio a crudo se necessario, e servi tiepido o freddo."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 410,
      protein: 22,
      carbs: 46,
      fat: 12
    }
  },
  {
    id: 'meal-farrotto-zucca',
    title: 'Farrotto alla zucca',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Farro perlato', amount: 160, unit: 'g' },
      { name: 'Zucca pulita', amount: 300, unit: 'g' },
      { name: 'Brodo vegetale', amount: 750, unit: 'ml' },
      { name: 'Cipolla', amount: 1, unit: 'piccola' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' },
      { name: 'Burro', amount: 15, unit: 'g' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' }
    ],
    instructions: [
      "Trita finemente la cipolla e falla appassire a fuoco dolce in una casseruola con l'olio EVO e il rametto di rosmarino.",
      "Aggiungi la zucca tagliata a dadini piccoli e falla rosolare per qualche minuto. Elimina il rosmarino.",
      "Unisci il farro perlato e tostalo per 2 minuti mescolando continuamente.",
      "Inizia a bagnare con il brodo vegetale bollente, un mestolo alla volta come per un normale risotto, lasciando assorbire il liquido prima di aggiungerne altro (ci vorranno circa 25-30 minuti).",
      "Quando il farro è cotto e cremoso, spegni il fuoco, manteca con il burro e il Parmigiano Reggiano grattugiato. Fai riposare coperto per un minuto prima di servire."
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 440,
      protein: 11,
      carbs: 62,
      fat: 14
    }
  },
  {
    id: 'meal-farro-risottato-pomodoro',
    title: 'Farro risottato al pomodoro',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Farro perlato', amount: 160, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 300, unit: 'g' },
      { name: 'Brodo vegetale', amount: 500, unit: 'ml' },
      { name: 'Cipolla', amount: 1, unit: 'piccola' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Parmigiano Reggiano', amount: 20, unit: 'g' },
      { name: 'Basilico fresco', amount: 5, unit: 'foglie' }
    ],
    instructions: [
      "Fai appassire la cipolla tritata finemente in una casseruola con l'olio EVO.",
      "Aggiungi il farro perlato, fallo tostare per un minuto, poi unisci la passata di pomodoro e mescola bene.",
      "Aggiungi il brodo vegetale caldo poco alla volta, portando a cottura il farro come se fosse un risotto per circa 25-30 minuti.",
      "A fine cottura, regola di sale, spegni il fuoco e manteca con il Parmigiano Reggiano grattugiato e le foglie di basilico fresco spezzettate a mano."
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 390,
      protein: 10,
      carbs: 58,
      fat: 11
    }
  },
  {
    id: 'meal-zuppa-farro-cannellini',
    title: 'Zuppa di farro e cannellini',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 35,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Farro perlato', amount: 120, unit: 'g' },
      { name: 'Fagioli cannellini cotti', amount: 240, unit: 'g' },
      { name: 'Concentrato di pomodoro', amount: 1, unit: 'cucchiaio' },
      { name: 'Brodo vegetale', amount: 1, unit: 'l' },
      { name: 'Carota', amount: 1, unit: 'pz' },
      { name: 'Sedano', amount: 1, unit: 'costa' },
      { name: 'Cipolla', amount: 1, unit: 'piccola' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' }
    ],
    instructions: [
      "Prepara un trito finissimo con carota, sedano e cipolla.",
      "Fai soffriggere il trito in una casseruola con l'olio EVO e uno spicchio d'aglio intero (che poi rimuoverai) e il rametto di rosmarino.",
      "Aggiungi il concentrato di pomodoro diluito in un po' di brodo caldo e metà dei cannellini precedentemente frullati per rendere la zuppa più cremosa.",
      "Aggiungi anche l'altra metà di cannellini interi e il farro perlato.",
      "Copri con il brodo vegetale caldo e lascia cuocere a fuoco lento per circa 25-30 minuti, mescolando di tanto in tanto.",
      "Rimuovi l'aglio e il rosmarino, regola di sale e pepe, e servi caldissima con un filo di olio EVO a crudo."
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 350,
      protein: 14,
      carbs: 54,
      fat: 8
    }
  },
  {
    id: 'meal-couscous-greco',
    title: 'Cous Cous Greco con Tonno e Feta',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'summer',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Cous cous', amount: 160, unit: 'g' },
      { name: 'Tonno sott\'olio sgocciolato', amount: 160, unit: 'g' },
      { name: 'Feta', amount: 100, unit: 'g' },
      { name: 'Pomodorini', amount: 150, unit: 'g' },
      { name: 'Cetriolo', amount: 1, unit: 'pz' },
      { name: 'Olive nere', amount: 50, unit: 'g' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Origano secco', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      "Prepara il cous cous: versalo in una ciotola, aggiungi un pizzico di sale e un cucchiaio d'olio, poi coprilo con acqua calda bollente in pari peso. Copri con un coperchio e lascia riposare per 5 minuti.",
      "Nel frattempo, lava i pomodorini e tagliali a metà o in quattro parti. Taglia il cetriolo a dadini e la feta a cubetti.",
      "Sgranella il cous cous con una forchetta per separare bene i chicchi.",
      "In un'insalatiera capiente unisci il cous cous ormai tiepido, il tonno sgocciolato e spezzettato, la feta, i pomodorini, il cetriolo e le olive nere.",
      "Condisci il tutto con olio EVO, una spolverata di origano secco, mescola bene e lascia insaporire prima di servire."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 480,
      protein: 24,
      carbs: 42,
      fat: 22
    }
  },
  {
    id: 'meal-couscous-caprese',
    title: 'Cous Cous Caprese',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Cous cous', amount: 160, unit: 'g' },
      { name: 'Mozzarella di bufala o ciliegine', amount: 150, unit: 'g' },
      { name: 'Pomodorini maturi', amount: 200, unit: 'g' },
      { name: 'Basilico fresco', amount: 10, unit: 'foglie' },
      { name: 'Olio EVO', amount: 25, unit: 'ml' },
      { name: 'Origano secco', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      "Prepara il cous cous idratandolo in pari peso di acqua calda salata coperta per 5 minuti, poi sgranalo bene con una forchetta.",
      "Lava i pomodorini e tagliali a pezzetti. Taglia la mozzarella a cubetti e lasciala sgocciolare per eliminare il siero in eccesso.",
      "Unisci in una ciotola il cous cous sgranato con i pomodorini, la mozzarella e le foglie di basilico fresco spezzettate a mano.",
      "Condisci con olio EVO, un pizzico di sale, pepe e origano. Mescola con cura e servi fresco."
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 420,
      protein: 14,
      carbs: 41,
      fat: 20
    }
  },
  {
    id: 'meal-couscous-ceci-zucchine',
    title: 'Cous Cous Express con Ceci e Zucchine',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Cous cous', amount: 160, unit: 'g' },
      { name: 'Ceci cotti in scatola', amount: 240, unit: 'g' },
      { name: 'Zucchine medie', amount: 2, unit: 'pz' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Menta fresca', amount: 5, unit: 'foglie' },
      { name: 'Curcuma o curry', amount: 1, unit: 'cucchiaino' }
    ],
    instructions: [
      "Prepara il cous cous mettendolo in una ciotola con la curcuma o il curry, sale e olio. Versa sopra l'acqua calda salata in pari peso, copri e lascia riposare per 5 minuti prima di sgranarlo.",
      "Lava le zucchine e tagliale a rondelle o a dadini piccoli.",
      "In una padella fai rosolare lo spicchio d'aglio con l'olio EVO, aggiungi le zucchine e cuocile a fuoco vivace per circa 5-7 minuti in modo che rimangano croccanti.",
      "Aggiungi i ceci ben sciacquati e sgocciolati nella padella con le zucchine e lascia insaporire per un paio di minuti. Rimuovi l'aglio.",
      "Unisci il cous cous sgranato alla padella con ceci e zucchine, mescola bene, profuma con foglie di menta fresca spezzettate e servi sia caldo che tiepido."
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 380,
      protein: 12,
      carbs: 54,
      fat: 11
    }
  },
  {
    id: 'meal-couscous-salmone-yogurt',
    title: 'Cous Cous Salmone e Yogurt Greco',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Cous cous', amount: 160, unit: 'g' },
      { name: 'Salmone affumicato', amount: 150, unit: 'g' },
      { name: 'Yogurt greco bianco', amount: 150, unit: 'g' },
      { name: 'Erba cipollina', amount: 1, unit: 'ciuffo' },
      { name: 'Succo di limone', amount: 1, unit: 'cchiaio' },
      { name: 'Scorza di limone grattugiata', amount: 1, unit: 'pizzico' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Cetriolo o zucchina', amount: 100, unit: 'g' }
    ],
    instructions: [
      "Idrata il cous cous in acqua calda salata con un cucchiaio d'oil per 5 minuti, poi sgranalo con una forchetta e lascialo intiepidire.",
      "Prepara la salsa allo yogurt: in una ciotolina mescola lo yogurt greco con un filo d'olio EVO, un cucchiaio di succo di limone, erba cipollina tritata, sale e pepe.",
      "Taglia il salmone affumicato a listarelle o pezzetti.",
      "Taglia il cetriolo o la zucchina a dadini piccolissimi per dare una nota fresca e croccante.",
      "In una ciotola unisci il cous cous sgranato con il salmone affumicato, i dadini di verdura fresca e la salsa allo yogurt greco.",
      "Mescola delicatamente tutto, decora con altra erba cipollina e una grattugiata di scorza di limone prima di servire."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 430,
      protein: 26,
      carbs: 43,
      fat: 14
    }
  },
  {
    id: 'meal-alici-marinate',
    title: 'Alici marinate',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 30,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Alici fresche sfilettate', amount: 300, unit: 'g' },
      { name: 'Succo di limone', amount: 100, unit: 'ml' },
      { name: 'Olio EVO', amount: 50, unit: 'ml' },
      { name: 'Aglio', amount: 2, unit: 'spicchi' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'ciuffo' },
      { name: 'Peperoncino fresco', amount: 1, unit: 'pezzetto' }
    ],
    instructions: [
      "Pulisci accuratamente le alici eliminando la testa, le interiora e la lisca centrale, poi sciacquale delicatamente sotto acqua corrente e asciugale con carta assorbente.",
      "Disponi le alici a filetti in una pirofila, con la pelle rivolta verso il basso, creando un unico strato.",
      "Irrora completamente i filetti con il succo di limone fresco, copri e lascia marinare in frigorifero per circa 4-5 ore finché la carne non risulterà bianca.",
      "Scola delicatamente le alici dal liquido di marinatura in eccesso.",
      "Prepara un trito finissimo di aglio, prezzemolo fresco e peperoncino.",
      "Disponi le alici marinate su un piatto da portata alternando gli strati con un filo d'olio EVO e il trito aromatico preparato. Lascia riposare in frigo per un'ora prima di servire."
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 210,
      protein: 18,
      carbs: 1,
      fat: 15
    }
  },
  {
    id: 'meal-alici-fritte',
    title: 'Alici fritte',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Alici fresche', amount: 400, unit: 'g' },
      { name: 'Semola di grano duro rimacinata', amount: 150, unit: 'g' },
      { name: 'Olio di semi di girasole', amount: 500, unit: 'ml' },
      { name: 'Limone', amount: 1, unit: 'pz' }
    ],
    instructions: [
      "Pulisci le alici togliendo la testa e le interiora, lavale accuratamente e asciugale benissimo con della carta assorbente.",
      "In una ciotola capiente versa la semola rimacinata e passa le alici poche alla volta, facendola aderire bene su tutti i lati.",
      "Scuoti le alici in un colino per eliminare la semola in eccesso.",
      "Scalda abbondante olio di semi in una padella profonda fino a raggiungere i 170-180°C.",
      "Immergi le alici infarinate poche alla volta nell'olio bollente e friggile per circa 2-3 minuti fino a doratura. Scolale con una schiumarola, adagiale su carta assorbente, sala a piacere e servi caldissime con fette di limone."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 350,
      protein: 22,
      carbs: 20,
      fat: 21
    }
  },
  {
    id: 'meal-calamaro-imbottito',
    title: 'Calamaro imbottito',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Calamari grandi puliti', amount: 4, unit: 'pz' },
      { name: 'Pangrattato', amount: 80, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' },
      { name: 'Uova', amount: 1, unit: 'pz' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'ciuffo' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Olive nere snocciolate', amount: 40, unit: 'g' },
      { name: 'Capperi dissalati', amount: 15, unit: 'g' },
      { name: 'Olio EVO', amount: 30, unit: 'ml' },
      { name: 'Vino bianco', amount: 100, unit: 'ml' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'g' }
    ],
    instructions: [
      "Pulisci i calamari separando le sacche dai tentacoli, rimuovendo la cartilagine interna.",
      "Trita finemente i tentacoli dei calamari con un coltello.",
      "In una padella scalda un cucchiaio d'olio EVO con l'aglio tritato, aggiungi i tentacoli tritati e falli saltare per circa 5 minuti, poi sfuma con un goccio di vino bianco.",
      "In una ciotola unisci i tentacoli cotti, il pangrattato, il parmigiano, l'uovo, il prezzemolo, le olive e i capperi tritati. Mescola fino a ottenere un ripieno morbido.",
      "Riempi le sacche dei calamari con il ripieno stando attenti a non riempirli troppo (lascia circa 2 cm liberi) per evitare che si rompano, poi chiudi con uno stuzzicadenti.",
      "Nella padella scalda l'olio EVO rimasto, adagia i calamari e rosolali. Sfuma con il vino bianco, aggiungi la passata di pomodoro, copri e cuoci a fuoco dolce per 20-25 minuti finché non saranno teneri."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 410,
      protein: 28,
      carbs: 22,
      fat: 18
    }
  },
  {
    id: 'meal-peperoni-imbottiti',
    title: 'Peperoni imbottiti',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 50,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Peperoni medi', amount: 4, unit: 'pz' },
      { name: 'Mollica di pane', amount: 150, unit: 'g' },
      { name: 'Provola a fette', amount: 100, unit: 'g' },
      { name: 'Capperi dissalati', amount: 15, unit: 'g' },
      { name: 'Olive nere snocciolate', amount: 50, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 40, unit: 'g' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'ciuffo' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Uova', amount: 1, unit: 'pz' },
      { name: 'Olio EVO', amount: 30, unit: 'ml' },
      { name: 'Pomodorini', amount: 100, unit: 'g' }
    ],
    instructions: [
      "Lava i peperoni, taglia la calotta superiore (tienila da parte) ed elimina semi e filamenti interni.",
      "In una ciotola metti a bagno la mollica di pane, poi strizzala benissimo e sgranala.",
      "Aggiungi la provola a cubetti, il parmigiano grattugiato, l'uovo, le olive tritate, i capperi, i pomodorini a pezzetti, il prezzemolo, l'aglio tritato e un filo d'olio EVO. Regola di sale e pepe e amalgama bene.",
      "Riempi i peperoni con il composto preparato premendo bene per non lasciare spazi vuoti.",
      "Posiziona nuovamente le calotte superiori sui peperoni come coperchio.",
      "Disponi i peperoni in una teglia unta d'olio EVO e cuoci in forno a 180°C per circa 40-45 minuti finché la superficie non sarà morbida."
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 390,
      protein: 15,
      carbs: 26,
      fat: 20
    }
  },
  {
    id: 'meal-saltimbocca-romana',
    title: 'Saltimbocca alla romana',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Fettine di vitello', amount: 400, unit: 'g' },
      { name: 'Prosciutto crudo', amount: 100, unit: 'g' },
      { name: 'Salvia fresca', amount: 8, unit: 'foglie' },
      { name: 'Vino bianco', amount: 100, unit: 'ml' },
      { name: 'Burro', amount: 40, unit: 'g' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Farina 00', amount: 20, unit: 'g' }
    ],
    instructions: [
      "Batti leggermente le fettine di vitello per renderle sottili e uniformi.",
      "Disponi su ciascuna fetta di carne una fetta di prosciutto crudo e una foglia di salvia fresca fermando il tutto al centro con uno stuzzicadenti.",
      "Passa leggermente solo il lato inferiore delle fettine (quello senza prosciutto e salvia) nella farina, scrollando quella in eccesso.",
      "In una padella capiente scalda l'olio EVO e metà del burro.",
      "Metti la carne a cuocere a fuoco vivo prima dal lato infarinato per circa 1-2 minuti, poi girala e cuoci il lato con il prosciutto per un solo minuto.",
      "Togli le fettine e tienile in caldo. Nella stessa padella con il fondo di cottura unisci il vino bianco, fallo sfumare e aggiungi il burro rimanente per creare una cremina densa e saporita. Versa la salsina calda sui saltimbocca prima di servire."
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 380,
      protein: 32,
      carbs: 4,
      fat: 25
    }
  },
  {
    id: 'meal-braciole-messinese',
    title: 'Braciole alla messinese',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Fettine sottili di manzo (taglio carpaccio o scamone)', amount: 400, unit: 'g' },
      { name: 'Pangrattato', amount: 150, unit: 'g' },
      { name: 'Pecorino siciliano grattugiato', amount: 50, unit: 'g' },
      { name: 'Provola dolce o caciocavallo a cubetti', amount: 100, unit: 'g' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'ciuffo' },
      { name: 'Olio EVO', amount: 40, unit: 'ml' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' }
    ],
    instructions: [
      "In una ciotola, unisci il pangrattato, il pecorino grattugiato, l'aglio tritato finemente e il prezzemolo fresco tritato.",
      "Condisci il mix con un pizzico di sale, pepe e abbondante olio EVO (circa 30 ml) mescolando fino a ottenere un composto sabbioso ma umido.",
      "Prendi una fettina di carne, spennellala leggermente con olio EVO e impanala nel mix di pangrattato preparato premendo bene.",
      "Adagia al centro della fettina qualche cubetto di provola e un po' di impasto sabbioso, poi ripiega i bordi laterali verso l'interno e arrotola la fettina ben stretta per formare un piccolo involtino (braciola).",
      "Infilza gli involtini negli spiedini di legno (circa 4 o 5 per spiedino).",
      "Cuoci le braciole alla messinese su una piastra caldissima o sulla griglia per circa 3-4 minuti per lato, spennellandole con un goccio d'olio finché non saranno dorate all'esterno e con il cuore di formaggio filante."
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 490,
      protein: 30,
      carbs: 26,
      fat: 28
    }
  },
  {
    id: 'meal-polpettone-ripieno',
    title: 'Polpettone ripieno',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 60,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Carne macinata misto (manzo e maiale)', amount: 600, unit: 'g' },
      { name: 'Uova', amount: 2, unit: 'pz' },
      { name: 'Parmigiano Reggiano', amount: 50, unit: 'g' },
      { name: 'Mollica di pane bagnata nel latte', amount: 100, unit: 'g' },
      { name: 'Prosciutto cotto', amount: 120, unit: 'g' },
      { name: 'Provola a fette', amount: 120, unit: 'g' },
      { name: 'Pangrattato', amount: 20, unit: 'g' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' }
    ],
    instructions: [
      "In una ciotola capiente, unisci la carne macinata, le uova, il parmigiano grattugiato, la mollica di pane ben strizzata, sale, pepe e noce moscata.",
      "Impasta bene fino a ottenere un composto uniforme, sodo ed elastico.",
      "Stendi il composto su un foglio di carta da forno bagnato e strizzato, dandogli la forma di un rettangolo di circa 1,5 cm di spessore.",
      "Farcisci con le fette di prosciutto cotto e di provola lasciando liberi i bordi esterni di circa 1 cm.",
      "Arrotola strettamente il polpettone aiutandoti con la carta forno, sigillando accuratamente i bordi e le estremità per non far fuoriuscire il formaggio in cottura.",
      "Cospargi la superficie con un velo leggero di pangrattato, adagia il polpettone in una pirofila con olio EVO e rosmarino, e inforna a 180°C per circa 45 minutes girandolo a metà cottura finché non si forma una bella crosticina dorata."
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 540,
      protein: 36,
      carbs: 15,
      fat: 34
    }
  },
  {
    id: 'meal-girelle-carne',
    title: 'Girelle di carne',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Carne macinata di manzo', amount: 400, unit: 'g' },
      { name: 'Prosciutto cotto', amount: 100, unit: 'g' },
      { name: 'Provola a fette', amount: 100, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 40, unit: 'g' },
      { name: 'Uova', amount: 1, unit: 'pz' },
      { name: 'Pangrattato', amount: 30, unit: 'g' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' }
    ],
    instructions: [
      "In una ciotola unisci la carne macinata con l'uovo, il parmigiano, il pangrattato, sale e pepe. Impasta bene con le mani fino a ottenere un composto compatto e omogeneo.",
      "Stendi l'impasto di carne su un foglio di carta forno cercando di formare un rettangolo regolare di circa 1 cm di spessore.",
      "Farcisci la superficie disponendo prima il prosciutto cotto e poi le fette di provola.",
      "Arrotola delicatamente dal lato lungo aiutandoti con la carta forno, stringendo bene ad ogni giro e sigillando i bordi laterali per evitare fuoriuscite in cottura.",
      "Taglia il rotolo ottenuto a fette spesse circa 2 cm utilizzando un coltello ben affilato per ricavare le girelle.",
      "Disponi le girelle in una teglia capiente unta con olio EVO, profuma con il rosmarino, sfuma con il vino bianco e cuoci in forno statico preriscaldato a 180°C per circa 20-25 minuti finché la provola non sarà fusa e filante."
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 450,
      protein: 28,
      carbs: 12,
      fat: 32
    }
  },
  {
    id: 'meal-cacciucco-livornese',
    title: 'Cacciucco alla livornese',
    category: 'dinner',
    difficulty: 'hard',
    timeMin: 60,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Polpo', amount: 300, unit: 'g' },
      { name: 'Seppie', amount: 300, unit: 'g' },
      { name: 'Cozze e vongole', amount: 400, unit: 'g' },
      { name: 'Gamberi o scampi', amount: 200, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 400, unit: 'g' },
      { name: 'Pane toscano', amount: 4, unit: 'fette' },
      { name: 'Vino rosso', amount: 150, unit: 'ml' },
      { name: 'Aglio', amount: 3, unit: 'spicchi' },
      { name: 'Olio EVO', amount: 30, unit: 'ml' },
      { name: 'Peperoncino fresco', amount: 1, unit: 'pezzetto' }
    ],
    instructions: [
      "Pulisci accuratamente tutto il pesce (polpo, seppie, crostacei e molluschi).",
      "In una pentola grande (preferibilmente di coccio), fai soffriggere l'aglio e il peperoncino nell'olio EVO.",
      "Aggiungi prima il polpo e le seppie tagliati a pezzetti. Sgocciola o bagna con il vino rosso e fai evaporare a fuoco vivace.",
      "Aggiungi la passata di pomodoro diluita con poca acqua calda o brodo di pesce, copri e lascia cuocere a fuoco lento per circa 30 minuti.",
      "Aggiungi i pesci più teneri e, infine, i gamberi e i frutti di mare (cozze e vongole). Copri e cuoci finché le conchiglie non saranno aperte (circa 10 minuti).",
      "Strofina le fette di pane toscano tostato con uno spicchio d'aglio fresco, adagiale nei piatti e coprile con il cacciucco caldissimo e il suo squisito sughetto."
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 480,
      protein: 35,
      carbs: 38,
      fat: 18
    }
  },
  {
    id: 'meal-canederli-speck-formaggio',
    title: 'Canederli speck e formaggio',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    season: 'winter',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Pane raffermo a dadini', amount: 250, unit: 'g' },
      { name: 'Speck a dadini', amount: 100, unit: 'g' },
      { name: 'Formaggio saporito (es. Stelvio o Fontina)', amount: 100, unit: 'g' },
      { name: 'Latte intero', amount: 150, unit: 'ml' },
      { name: 'Uova', amount: 2, unit: 'pz' },
      { name: 'Farina 00', amount: 30, unit: 'g' },
      { name: 'Cipolla', amount: 1, unit: 'piccola' },
      { name: 'Burro', amount: 20, unit: 'g' },
      { name: 'Erba cipollina tritata', amount: 1, unit: 'ciuffo' },
      { name: 'Brodo di carne o vegetale', amount: 1.5, unit: 'l' }
    ],
    instructions: [
      "Metti il pane raffermo tagliato a piccoli cubetti in una ciotola capiente.",
      "In un padellino, fai appassire la cipolla tritata finemente nel burro, poi unisci lo speck a cubetti e rosolalo per un minuto. Versa il tutto sul pane.",
      "Aggiungi anche il formaggio tagliato a dadini molto piccoli e l'erba cipollina tritata.",
      "In una ciotola, sbatti le uova insieme al latte con un pizzico di sale e pepe, quindi versa il composto liquido sul pane. Mescola delicatamente e lascia riposare coperto per circa 30 minuti.",
      "Cospargi con la farina e impasta brevemente fino a ottenere un composto omogeneo. Con le mani umide, forma delle palle rotonde e compatte del diametro di circa 6-7 cm.",
      "Cuoci i canederli nel brodo bollente, a fuoco medio-basso per circa 15 minuti (saranno pronti quando saliranno a galla). Servili caldissimi nel loro brodo di cottura."
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 510,
      protein: 22,
      carbs: 54,
      fat: 21
    }
  },
  {
    id: 'meal-fegato-veneziana',
    title: 'Fegato alla veneziana',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 25,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Fegato di vitello', amount: 500, unit: 'g' },
      { name: 'Cipolle bianche', amount: 3, unit: '' },
      { name: 'Olio EVO', amount: 30, unit: 'ml' },
      { name: 'Burro', amount: 20, unit: 'g' },
      { name: 'Aceto di vino bianco', amount: 2, unit: 'cucchiai' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'ciuffo' },
      { name: 'Brodo vegetale', amount: 50, unit: 'ml' }
    ],
    instructions: [
      "Taglia le cipolle sottilmente e falle appassire a fuoco molto dolce in una padella capiente con l'olio EVO e il burro per circa 15-20 minuti, aggiungendo un goccio di brodo vegetale se necessario per non farle bruciare.",
      "Quando le cipolle sono morbidissime, sfuma con l'aceto di vino bianco.",
      "Taglia il fegato a striscioline o fettine sottili.",
      "Alza la fiamma, unisci il fegato alle cipolle e cuocilo a fuoco vivace per pochissimi minuti (circa 3-5 minuti), girandolo spesso per mantenerlo tenero.",
      "Regola di sale, pepe e prezzemolo fresco tritato a fine cottura e servi caldissimo."
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 320,
      protein: 28,
      carbs: 8,
      fat: 16
    }
  },
  {
    id: 'meal-peposo-impruneta',
    title: "Peposo all'impruneta",
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 180,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Muscolo di manzo', amount: 800, unit: 'g' },
      { name: 'Vino rosso Chianti', amount: 750, unit: 'ml' },
      { name: 'Aglio', amount: 6, unit: 'spicchi' },
      { name: 'Pepe nero in grani', amount: 1, unit: 'cucchiaio' },
      { name: 'Pepe nero macinato', amount: 1, unit: 'cucchiaino' },
      { name: 'Pane toscano', amount: 4, unit: 'fette' }
    ],
    instructions: [
      "Taglia il muscolo di manzo a cubi grandi di circa 4-5 cm.",
      "In un tegame capiente, preferibilmente di terracotta o ghisa, disponi la carne, gli spicchi d'aglio interi sbucciati, il pepe nero in grani, il pepe nero macinato e un pizzico di sale.",
      "Copri completamente la carne con il vino rosso Chianti.",
      "Copri il tegame con il coperchio e cuoci a fuoco bassissimo sul fornello (o in forno ventilato a 150°C) per circa 3 ore, finché la carne non risulterà tenerissima e il vino si sarà ridotto a una deliziosa salsa densa.",
      "Servi il peposo caldissimo accompagnato da fette di pane toscano tostato."
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 520,
      protein: 42,
      carbs: 24,
      fat: 18
    }
  },
  {
    id: 'meal-pasta-aglione',
    title: "Pasta all'aglione",
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pici toscani', amount: 320, unit: 'g' },
      { name: 'Aglione della Valdichiana', amount: 4, unit: 'spicchi' },
      { name: 'Passata di pomodoro', amount: 400, unit: 'g' },
      { name: 'Olio EVO', amount: 40, unit: 'ml' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' }
    ],
    instructions: [
      "Sbuccia gli spicchi di aglione e tagliali a fettine molto sottili.",
      "In una padella capiente, scalda l'olio EVO con l'aglione e un cucchiaio d'acqua, schiacciando delicatamente l'aglione con una forchetta per farlo sciogliere senza farlo dorare o bruciare a fuoco dolcissimo per circa 10 minuti.",
      "Quando l'aglione è ridotto in crema morbida, sfuma con il vino bianco.",
      "Unisci la passata di pomodoro, regola di sale e cuoci a fuoco dolce per circa 15 minuti finché la salsa non si addensa.",
      "Nel frattempo cuoci i pici in abbondante acqua salata, scolali al dente direttamente nella padella con la salsa e salta per un minuto prima di servire caldissimo."
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true,
    nutrients: {
      calories: 440,
      protein: 9,
      carbs: 72,
      fat: 11
    }
  },
  {
    id: 'meal-panzanella',
    title: 'Panzanella',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian', 'vegan'],
    ingredients: [
      { name: 'Pane toscano raffermo', amount: 300, unit: 'g' },
      { name: 'Pomodori maturi costoluti', amount: 3, unit: '' },
      { name: 'Cetriolo', amount: 1, unit: '' },
      { name: 'Cipolla rossa', amount: 1, unit: '' },
      { name: 'Basilico fresco', amount: 10, unit: 'foglie' },
      { name: 'Olio EVO', amount: 40, unit: 'ml' },
      { name: 'Aceto di vino rosso', amount: 2, unit: 'cucchiai' }
    ],
    instructions: [
      "Taglia il pane toscano raffermo a fette, bagnalo con acqua fresca senza inzupparlo eccessivamente. Lascialo riposare per 10 minuti, poi strizzalo accuratamente con le mani e sbriciolalo in una ciotola capiente.",
      "Taglia i pomodori a pezzi e il cetriolo a rondelle sottili.",
      "Affetta sottilmente la cipolla rossa e lasciala in ammollo in acqua e un cucchiaio di aceto per 15 minuti per addolcirla, poi scolala bene.",
      "Aggiungi i pomodori, il cetriolo e la cipolla alla ciotola con il pane sbriciolato.",
      "Spezzetta abbondanti foglie di basilico fresco con le mani e uniscile agli altri ingredienti.",
      "Condisci generosamente con olio EVO, aceto di vino rosso, sale e pepe. Mescola e fai riposare in frigorifero per almeno un'ora prima di consumare."
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true,
    nutrients: {
      calories: 310,
      protein: 6,
      carbs: 48,
      fat: 10
    }
  },
  {
    id: 'meal-risotto-funghi-salsiccia',
    title: 'Risotto funghi e salsiccia',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 320, unit: 'g' },
      { name: 'Funghi porcini', amount: 300, unit: 'g' },
      { name: 'Salsiccia di maiale', amount: 200, unit: 'g' },
      { name: 'Brodo vegetale', amount: 1, unit: 'l' },
      { name: 'Cipolla', amount: 1, unit: '' },
      { name: 'Vino bianco', amount: 100, unit: 'ml' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Parmigiano Reggiano', amount: 50, unit: 'g' },
      { name: 'Burro', amount: 30, unit: 'g' }
    ],
    instructions: [
      "Trita la cipolla e falla appassire in padella con l'olio EVO.",
      "Sgrana la salsiccia e aggiungila in padella, facendola rosolare bene.",
      "Aggiungi i funghi tagliati a fettine e cuoci per qualche minuto.",
      "Tosta il riso nella stessa padella per 2 minuti, poi sfuma con il vino bianco.",
      "Aggiungi il brodo caldo un mestolo alla volta, mescolando continuamente fino a cottura del riso (circa 18 minuti).",
      "Spegni il fuoco, aggiungi burro e parmigiano per mantecare, poi lascia riposare coperto per 2 minuti prima di servire."
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 550,
      protein: 18,
      carbs: 65,
      fat: 22
    }
  },
  {
    id: 'meal-risotto-rane',
    title: 'Risotto alle rane',
    category: 'dinner',
    difficulty: 'hard',
    timeMin: 50,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 320, unit: 'g' },
      { name: 'Cosce di rana pulite', amount: 300, unit: 'g' },
      { name: 'Brodo vegetale', amount: 1, unit: 'l' },
      { name: 'Cipolla', amount: 1, unit: '' },
      { name: 'Vino bianco', amount: 100, unit: 'ml' },
      { name: 'Burro', amount: 40, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 40, unit: 'g' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'ciuffo' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' }
    ],
    instructions: [
      "In un tegame, fai soffriggere cipolla e aglio con l'olio EVO.",
      "Aggiungi le cosce di rana e rosolale per circa 5 minuti, poi mettile da parte (se preferisci, disossale ricavando la polpa).",
      "Tosta il riso nello stesso tegame, poi sfuma con il vino bianco.",
      "Porta a cottura il riso aggiungendo il brodo bollente un mestolo alla volta.",
      "A metà cottura (circa 10 minuti), unisci nuovamente le rane.",
      "A fuoco spento manteca con burro, parmigiano e completa con prezzemolo fresco tritato."
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: {
      calories: 480,
      protein: 20,
      carbs: 62,
      fat: 15
    }
  },
  {
    id: 'meal-pasta-norma',
    title: 'Pasta alla norma',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 30,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta tipo penne o rigatoni', amount: 320, unit: 'g' },
      { name: 'Melanzane', amount: 2, unit: '' },
      { name: 'Passata di pomodoro', amount: 400, unit: 'g' },
      { name: 'Ricotta salata', amount: 80, unit: 'g' },
      { name: 'Aglio', amount: 2, unit: 'spicchi' },
      { name: 'Basilico fresco', amount: 6, unit: 'foglie' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' }
    ],
    instructions: [
      "Taglia le melanzane a cubetti, cospargile di sale e lasciale spurgare per 30 minuti, poi sciacquale e asciugale.",
      "Friggi le melanzane in padella o cuocile al forno con un filo d'olio fino a doratura.",
      "In una padella cuoci la passata di pomodoro con aglio, un filo d'olio EVO e foglie di basilico per 15 minuti.",
      "Lessa la pasta in abbondante acqua salata e scolala al dente.",
      "Salta la pasta nella padella con la salsa di pomodoro, unisci le melanzane e mescola bene.",
      "Impiatta completando con un'abbondante grattugiata di ricotta salata e foglioline di basilico fresco."
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 410,
      protein: 14,
      carbs: 58,
      fat: 12
    }
  },
  {
    id: 'dessert-1',
    title: "Ciambella all'acqua",
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 40,
    season: 'all',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Farina', amount: 300, unit: 'g' },
      { name: 'Zucchero', amount: 200, unit: 'g' },
      { name: 'Acqua', amount: 250, unit: 'ml' },
      { name: 'Olio di semi', amount: 100, unit: 'ml' },
      { name: 'Lievito per dolci', amount: 16, unit: 'g' }
    ],
    instructions: [
      'Mescola zucchero e acqua.',
      'Aggiungi olio e farina setacciata.',
      'Aggiungi il lievito.',
      'Inforna a 180°C per 35 minuti.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'dessert-2',
    title: 'Brownies in padella',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Cioccolato fondente', amount: 100, unit: 'g' },
      { name: 'Burro', amount: 50, unit: 'g' },
      { name: 'Zucchero', amount: 80, unit: 'g' },
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Farina', amount: 60, unit: 'g' }
    ],
    instructions: [
      'Sciogli cioccolato e burro.',
      'Mescola uova e zucchero.',
      'Unisci i due composti e aggiungi la farina.',
      'Cuoci in padella antiaderente a fuoco bassissimo con coperchio per 15 minuti.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'dessert-3',
    title: 'Banana Bread',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 50,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan-friendly'],
    ingredients: [
      { name: 'Banane mature', amount: 3, unit: '' },
      { name: 'Farina', amount: 200, unit: 'g' },
      { name: 'Zucchero di canna', amount: 100, unit: 'g' },
      { name: 'Olio di semi', amount: 80, unit: 'ml' },
      { name: 'Lievito', amount: 8, unit: 'g' }
    ],
    instructions: [
      'Schiaccia le banane.',
      'Unisci olio e zucchero.',
      'Aggiungi farina e lievito.',
      'Inforna a 180°C per 45 minuti.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'dessert-4',
    title: 'Crostata veloce',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 40,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Farina', amount: 300, unit: 'g' },
      { name: 'Burro freddo', amount: 150, unit: 'g' },
      { name: 'Zucchero', amount: 100, unit: 'g' },
      { name: 'Uovo', amount: 1, unit: '' },
      { name: 'Marmellata', amount: 250, unit: 'g' }
    ],
    instructions: [
      'Lavora farina, burro e zucchero.',
      'Aggiungi l’uovo e impasta velocemente.',
      'Stendi la frolla, aggiungi la marmellata.',
      'Inforna a 180°C per 25-30 minuti.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-1',
    title: 'Pasta integrale con verdure di stagione',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Pasta integrale', amount: 80, unit: 'g' },
      { name: 'Zucchine', amount: 150, unit: 'g' },
      { name: 'Asparagi', amount: 100, unit: 'g' },
      { name: 'Olio EVO', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Lessa la pasta.',
      'Salta le verdure in padella con poco olio.',
      'Mescola e servi.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-2',
    title: 'Pollo alle erbe con patate al forno',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Petto di pollo', amount: 150, unit: 'g' },
      { name: 'Patate', amount: 200, unit: 'g' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' }
    ],
    instructions: [
      'Taglia le patate a cubetti.',
      'Condisci pollo e patate con olio e erbe.',
      'Inforna a 200°C per 35 minuti.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-3',
    title: 'Pasta con piselli',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['vegan-friendly'],
    ingredients: [
      { name: 'Pasta corta', amount: 80, unit: 'g' },
      { name: 'Piselli freschi o surgelati', amount: 100, unit: 'g' },
      { name: 'Cipolla', amount: 0.5, unit: '' },
      { name: 'Olio EVO', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Soffriggi la cipolla con poco olio.',
      'Aggiungi i piselli e un po’ d’acqua, cuoci per 10 min.',
      'Lessa la pasta e saltala con il condimento.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-4',
    title: 'Risotto allo zafferano',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 80, unit: 'g' },
      { name: 'Brodo vegetale', amount: 300, unit: 'ml' },
      { name: 'Zafferano', amount: 1, unit: 'bustina' },
      { name: 'Parmigiano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Tosta il riso a secco.',
      'Aggiungi il brodo poco alla volta.',
      'A metà cottura sciogli lo zafferano nel brodo.',
      'Manteca con parmigiano alla fine.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-5',
    title: 'Pasta e fagioli',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Ditalini', amount: 60, unit: 'g' },
      { name: 'Fagioli cannellini precotti', amount: 150, unit: 'g' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' },
      { name: 'Passata di pomodoro', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Frulla parte dei fagioli.',
      'Scalda i fagioli con acqua, pomodoro e rosmarino.',
      'Cuoci la pasta direttamente nella zuppa.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-6',
    title: 'Pasta al ragù di lenticchie',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Pasta integrale', amount: 80, unit: 'g' },
      { name: 'Lenticchie precotte', amount: 120, unit: 'g' },
      { name: 'Carota e sedano', amount: 50, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 100, unit: 'g' }
    ],
    instructions: [
      'Fai un soffritto leggero di sedano e carota.',
      'Aggiungi lenticchie e pomodoro, cuoci per 15 min.',
      'Condisci la pasta.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-7',
    title: 'Pasta zucchine e Philadelphia',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Zucchine', amount: 1, unit: '' },
      { name: 'Philadelphia Light', amount: 40, unit: 'g' },
      { name: 'Zafferano', amount: 0.5, unit: 'bustina' }
    ],
    instructions: [
      'Grattugia le zucchine e cuocile in padella per 5 min.',
      'Aggiungi il formaggio spalmabile con un cucchiaio di acqua di cottura.',
      'Unisci lo zafferano e condisci la pasta.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-8',
    title: 'Polpette di melanzane al forno',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Melanzane', amount: 500, unit: 'g' },
      { name: 'Pane grattugiato', amount: 100, unit: 'g' },
      { name: 'Uovo', amount: 1, unit: '' },
      { name: 'Parmigiano', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Cuoci le melanzane al forno finché morbide.',
      'Schiacciale e unisci uovo, parmigiano e pangrattato.',
      'Forma le polpette e inforna a 200°C per 20 min.'
    ],
    proteinType: 'eggs',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-9',
    title: 'Salmone al cartoccio con agrumi',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Trancio di salmone', amount: 150, unit: 'g' },
      { name: 'Arancia e limone', amount: 1, unit: 'fetta' },
      { name: 'Timo', amount: 1, unit: 'rametto' },
      { name: 'Olio EVO', amount: 5, unit: 'ml' }
    ],
    instructions: [
      'Metti il salmone su carta forno.',
      'Aggiungi fette di agrumi, timo e poco olio.',
      'Chiudi il cartoccio e cuoci a 180°C per 15-20 min.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-10',
    title: 'Merluzzo in umido con pomodorini',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Filetto di merluzzo', amount: 150, unit: 'g' },
      { name: 'Pomodorini', amount: 100, unit: 'g' },
      { name: 'Olive nere', amount: 5, unit: '' },
      { name: 'Capperi', amount: 5, unit: 'g' }
    ],
    instructions: [
      'In padella scotta i pomodorini con olive e capperi.',
      'Aggiungi il merluzzo e copri.',
      'Cuoci per 8-10 min a fuoco medio.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-11',
    title: 'Pasta e ceci',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Pasta corta', amount: 70, unit: 'g' },
      { name: 'Ceci precotti', amount: 150, unit: 'g' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' }
    ],
    instructions: [
      'Scalda i ceci con acqua, aglio e rosmarino.',
      'Togli l’aglio e versa la pasta.',
      'Cuoci fino a ottenere una consistenza cremosa.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-12',
    title: 'Gnocchi al pesto',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 10,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Gnocchi di patate', amount: 250, unit: 'g' },
      { name: 'Pesto alla genovese', amount: 50, unit: 'g' },
      { name: 'Fagiolini', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Lessa i gnocchi con i fagiolini a pezzetti.',
      'Scolali non appena vengono a galla.',
      'Condisci con il pesto e un po’ d’acqua di cottura.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-13',
    title: 'Tortellini in brodo',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'winter',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Tortellini alla carne', amount: 125, unit: 'g' },
      { name: 'Brodo di carne o vegetale', amount: 400, unit: 'ml' },
      { name: 'Parmigiano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Porta il brodo a bollore.',
      'Tuffa i tortellini e cuoci per 2-3 minuti.',
      'Servi caldi con una spolverata di parmigiano.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-14',
    title: 'Polpette classiche al sugo',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Carne macinata magra', amount: 150, unit: 'g' },
      { name: 'Pane raffermo', amount: 30, unit: 'g' },
      { name: 'Uovo', amount: 1, unit: '' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'g' }
    ],
    instructions: [
      'Impasta carne, uovo e pane ammollato.',
      'Forma le palline e rosolale in padella.',
      'Aggiungi il pomodoro e cuoci per 20 minuti.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-15',
    title: 'Polpette di pesce e patate',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 35,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Filetto di pesce bianco', amount: 200, unit: 'g' },
      { name: 'Patata bollita', amount: 100, unit: 'g' },
      { name: 'Prezzemolo', amount: 1, unit: 'manciata' },
      { name: 'Uovo', amount: 1, unit: '' }
    ],
    instructions: [
      'Sminuzza il pesce e schiaccia la patata.',
      'Unisci gli ingredienti e forma delle polpette.',
      'Cuoci al forno a 200°C per 15-20 minuti.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-16',
    title: 'Insalata di riso ricca',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Riso per insalate', amount: 80, unit: 'g' },
      { name: 'Tonno al naturale', amount: 56, unit: 'g' },
      { name: 'Verdure sott’aceto', amount: 50, unit: 'g' },
      { name: 'Mais', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Lessa il riso e lascialo raffreddare.',
      'Unisci tutti gli ingredienti in una ciotola.',
      'Condisci con un filo d’olio e servi freddo.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-17',
    title: 'Risotto al formaggio cremoso',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 25,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegetarian'],
    ingredients: [
      { name: 'Riso', amount: 80, unit: 'g' },
      { name: 'Brodo vegetale', amount: 300, unit: 'ml' },
      { name: 'Taleggio o formaggio simile', amount: 30, unit: 'g' },
      { name: 'Parmigiano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Tosta il riso e portalo a cottura col brodo.',
      'A fine cottura togli dal fuoco.',
      'Aggiungi i formaggi e manteca energicamente.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-18',
    title: 'Riso e fagioli',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Riso integrali', amount: 80, unit: 'g' },
      { name: 'Fagioli borlotti precotti', amount: 150, unit: 'g' },
      { name: 'Pomodoro', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Cuoci il riso.',
      'Scalda i fagioli con un po’ di pomodoro.',
      'Unisci riso e fagioli e lascia insaporire.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-19',
    title: 'Pasta al sugo semplice',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 150, unit: 'g' },
      { name: 'Basilico', amount: 2, unit: 'foglie' }
    ],
    instructions: [
      'Cuoci la passata con un pizzico di sale e basilico.',
      'Lessa la pasta e condiscila.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-20',
    title: 'Polpette di pane e formaggio',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pane raffermo', amount: 200, unit: 'g' },
      { name: 'Latte o acqua', amount: 100, unit: 'ml' },
      { name: 'Uovo', amount: 1, unit: '' },
      { name: 'Parmigiano', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Ammolla il pane nell’acqua.',
      'Strizzalo e unisci uovo e parmigiano.',
      'Forma le polpette e rosolale in padella per 10 min.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-21',
    title: 'Polpette di lenticchie e carote',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Lenticchie precotte', amount: 200, unit: 'g' },
      { name: 'Carota sminuzzata', amount: 1, unit: '' },
      { name: 'Pangrattato', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Schiaccia le lenticchie con la carota.',
      'Aggiungi pangrattato per la consistenza.',
      'Forma le polpette e cuocile in padella o al forno.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'cold-1',
    title: 'Insalatona Mediterranea',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegetarian'],
    ingredients: [
      { name: 'Lattuga mista', amount: 100, unit: 'g' },
      { name: 'Mozzarella a cubetti', amount: 100, unit: 'g' },
      { name: 'Mais', amount: 50, unit: 'g' },
      { name: 'Pomodorini', amount: 100, unit: 'g' },
      { name: 'Olive verde', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Lava bene tutte le verdure.',
      'In una ciotola capiente unisci tutti gli ingredienti.',
      'Condisci con Olio EVO, sale e origano.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'cold-2',
    title: 'Patate all\'insalata',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Patate bollite', amount: 400, unit: 'g' },
      { name: 'Cipolla rossa', amount: 0.5, unit: '' },
      { name: 'Prezzemolo', amount: 1, unit: 'manciata' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' }
    ],
    instructions: [
      'Taglia le patate lesse a tocchetti.',
      'Affetta la cipolla sottilmente.',
      'Unisci prezzemolo, olio e sale. Lascia riposare.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'cold-3',
    title: 'Insalata di farro invernale',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 20,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Farro perlato', amount: 80, unit: 'g' },
      { name: 'Zucca cotta a cubetti', amount: 100, unit: 'g' },
      { name: 'Ceci', amount: 50, unit: 'g' },
      { name: 'Noci', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Lessa il farro.',
      'Unisci con zucca, ceci e noci sminuzzate.',
      'Ideale da consumare freddo o tiepido.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'cold-4',
    title: 'Pesce spada all\'insalata',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 15,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Pesce spada grigliato', amount: 150, unit: 'g' },
      { name: 'Rucola', amount: 50, unit: 'g' },
      { name: 'Limone', amount: 1, unit: 'succo' },
      { name: 'Pomodorini', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Taglia il pesce spada grigliato a listarelle.',
      'Metti su un letto di rucola e pomodorini.',
      'Condisci con succo di limone e olio.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-22',
    title: 'Uova in purgatorio (Sugo)',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'g' },
      { name: 'Basilico', amount: 2, unit: 'foglie' }
    ],
    instructions: [
      'Scalda il pomodoro in padella.',
      'Crea degli spazi e rompi le uova dentro.',
      'Copri e cuoci per 5 min finché l’albume è sodo.'
    ],
    proteinType: 'eggs',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'cold-5',
    title: 'Insalata di pasta allo scoglio fredda',
    category: 'cold',
    difficulty: 'medium',
    timeMin: 25,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Pasta corta', amount: 80, unit: 'g' },
      { name: 'Frutti di mare misti', amount: 150, unit: 'g' },
      { name: 'Pomodorini', amount: 50, unit: 'g' },
      { name: 'Prezzemolo', amount: 1, unit: 'manciata' }
    ],
    instructions: [
      'Lessa la pasta al dente.',
      'Salta i frutti di mare in padella con aglio e olio.',
      'Unisci tutto, aggiungi pomodorini e lascia raffreddare.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'cold-6',
    title: 'Pollo all\'insalata con sedano e noci',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Petto di pollo bollito', amount: 150, unit: 'g' },
      { name: 'Sedano bianco', amount: 50, unit: 'g' },
      { name: 'Gherigli di noci', amount: 20, unit: 'g' },
      { name: 'Succo di limone', amount: 0.5, unit: '' }
    ],
    instructions: [
      'Sfilaccia il pollo freddo.',
      'Taglia il sedano a rondelle sottili.',
      'Unisci le noci, condisci con olio e limone.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-23',
    title: 'Pasta al pesto di zucchine',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Zucchine fresche', amount: 100, unit: 'g' },
      { name: 'Mandorle', amount: 10, unit: 'g' },
      { name: 'Parmigiano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Frulla le zucchine a crudo con mandorle e formaggio.',
      'Cuoci la pasta.',
      'Condisci con il pesto ottenuto.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-24',
    title: 'Rotolo di frittata con spinaci e prosciutto',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Uova', amount: 4, unit: '' },
      { name: 'Spinaci cotti', amount: 100, unit: 'g' },
      { name: 'Prosciutto cotto', amount: 50, unit: 'g' },
      { name: 'Formaggio spalmabile', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Cuoci la frittata sottile in forno su carta forno.',
      'Farcisci con formaggio, prosciutto e spinaci.',
      'Arrotola e lascia riposare in frigo prima di affettare.'
    ],
    proteinType: 'eggs',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-25',
    title: 'Frittata di patate classica',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Uova', amount: 3, unit: '' },
      { name: 'Patate lesse', amount: 200, unit: 'g' },
      { name: 'Parmigiano', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Schiaccia leggermente le patate lesse.',
      'Unisci le uova sbattute col parmigiano.',
      'Cuoci in padella antiaderente rigirandola a metà cottura.'
    ],
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-26',
    title: 'Frittata di pasta (Recupero)',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta avanzata', amount: 150, unit: 'g' },
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Formaggio', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Mescola la pasta con le uova e il formaggio.',
      'Versa in padella calda con un filo d\'olio.',
      'Cuoci finché non è ben dorata su entrambi i lati.'
    ],
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-27',
    title: 'Scaloppina al burro e limone',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Fettine di vitello o pollo', amount: 150, unit: 'g' },
      { name: 'Burro', amount: 20, unit: 'g' },
      { name: 'Limone', amount: 0.5, unit: '' },
      { name: 'Farina', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Infarina leggermente la carne.',
      'Rosola nel burro spumeggiante.',
      'Sfuma con succo di limone e crea una cremina.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'cold-7',
    title: 'Insalata di pomodoro, tonno e olive',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 10,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Pomodori maturi', amount: 200, unit: 'g' },
      { name: 'Tonno sott\'olio sgocciolato', amount: 80, unit: 'g' },
      { name: 'Olive taggiasche', amount: 20, unit: 'g' },
      { name: 'Basilico', amount: 3, unit: 'foglie' }
    ],
    instructions: [
      'Taglia i pomodori a pezzi.',
      'Aggiungi il tonno e le olive.',
      'Condisci con olio, sale e basilico fresco.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'cold-8',
    title: 'Fresella con pomodoro, fagioli e mozzarella',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 10,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Fresella di grano duro', amount: 1, unit: '' },
      { name: 'Pomodorini', amount: 100, unit: 'g' },
      { name: 'Fagioli bianchi precotti', amount: 50, unit: 'g' },
      { name: 'Mozzarella di bufala', amount: 80, unit: 'g' }
    ],
    instructions: [
      'Bagna leggermente la fresella con acqua.',
      'Condisci con pomodorini, fagioli e mozzarella a pezzi.',
      'Abbonda con Olio EVO e origano.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'cold-9',
    title: 'Caprese classica',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 5,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Mozzarella fior di latte', amount: 125, unit: 'g' },
      { name: 'Pomodoro ramato', amount: 150, unit: 'g' },
      { name: 'Basilico fresco', amount: 5, unit: 'foglie' }
    ],
    instructions: [
      'Affetta pomodoro e mozzarella.',
      'Alterna le fette su un piatto.',
      'Guarnisci con basilico, sale e un filo d\'olio.'
    ],
    proteinType: 'cheese',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-28',
    title: 'Cotoletta alla milanese croccante',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Fetta di vitello', amount: 150, unit: 'g' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Pane grattugiato', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Passa la carne nell’uovo sbattuto.',
      'Impana bene con il pangrattato premendo forte.',
      'Cuoci in padella con un velo d’olio o burro chiarificato fino a doratura.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-29',
    title: 'Hamburger fatto in casa con limone',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Carne macinata di manzo', amount: 150, unit: 'g' },
      { name: 'Scorza di limone', amount: 0.5, unit: '' },
      { name: 'Prezzemolo', amount: 1, unit: 'manciata' }
    ],
    instructions: [
      'Impasta la carne con limone e prezzemolo.',
      'Forma un disco spesso 2cm.',
      'Griglia su piastra calda 3-4 minuti per lato.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-30',
    title: 'Arrosto di manzo al limone',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Lacerto o girello di manzo', amount: 150, unit: 'g' },
      { name: 'Limone (succo)', amount: 1, unit: '' },
      { name: 'Brodo vegetale', amount: 100, unit: 'ml' }
    ],
    instructions: [
      'Rosola la carne in una pentola con poco olio.',
      'Aggiungi il succo di limone e il brodo.',
      'Copri e cuoci a fuoco lento per 40 minuti.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'take-1',
    title: 'Panino gourmet con prosciutto e rucola',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 5,
    season: 'all',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Pane tipo Rosetta', amount: 1, unit: '' },
      { name: 'Prosciutto crudo dolce', amount: 50, unit: 'g' },
      { name: 'Rucola fresca', amount: 10, unit: 'g' },
      { name: 'Pomodoro a fette', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Taglia il pane a metà.',
      'Farcisci con prosciutto, pomodoro e rucola.',
      'Ideale per un pranzo veloce fuori casa.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'take-2',
    title: 'French Toast salato con formaggio',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pane in cassetta integrale', amount: 2, unit: 'fette' },
      { name: 'Latte', amount: 50, unit: 'ml' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Edamer a fette', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Passa il pane nel mix di latte e uovo.',
      'Cuoci in padella finché dorato.',
      'Farcisci con il formaggio e chiudi a sandwich.'
    ],
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'take-3',
    title: 'Piadina integrale con tacchino e verdure',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Piadina integrale', amount: 1, unit: '' },
      { name: 'Fesa di tacchino', amount: 80, unit: 'g' },
      { name: 'Zucchine grigliate', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Scalda la piadina su entrambi i lati.',
      'Farcisci con tacchino e zucchine.',
      'Arrotola o piega a metà.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'take-4',
    title: 'Flan di spinaci e ricotta monoporzione',
    category: 'takeaway',
    difficulty: 'medium',
    timeMin: 40,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Spinaci frullati', amount: 150, unit: 'g' },
      { name: 'Ricotta fresca', amount: 100, unit: 'g' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Parmigiano', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Mescola spinaci, ricotta, uovo e parmigiano.',
      'Versa in pirottini imburrati.',
      'Cuoci a bagnomaria in forno a 180°C per 25 minuti.'
    ],
    proteinType: 'cheese',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-31',
    title: 'Pasta al Pesto alla Genovese',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta (Trofie o Trenette)', amount: 80, unit: 'g' },
      { name: 'Pesto alla Genovese (o foglie di basilico, pinoli, parmigiano, aglio, olio)', amount: 50, unit: 'g' },
      { name: 'Patata piccola', amount: 1, unit: '' },
      { name: 'Fagiolini', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Artigianale: Pesta basilico, pinoli, aglio e sale, aggiungendo olio a filo e parmigiano.',
      'Industriale: Scalda il pesto pronto con poca acqua di cottura.',
      'Lessa la pasta con patata a cubetti e fagiolini.',
      'Scola e condisci lontano dal fuoco.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-32',
    title: 'Pasta al Pesto alla Calabrese',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta corta', amount: 80, unit: 'g' },
      { name: 'Peperoni rossi (o pesto pronto)', amount: 100, unit: 'g' },
      { name: 'Ricotta fresca', amount: 30, unit: 'g' },
      { name: 'Peperoncino', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Artigianale: Frulla peperoni arrostiti con ricotta, mandorle e peperoncino.',
      'Industriale: Versa il pesto in padella e allunga con acqua di cottura.',
      'Lessa la pasta e saltala nel sugo cremoso.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-33',
    title: 'Pasta Ricotta e Noci',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 10,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta integrale', amount: 80, unit: 'g' },
      { name: 'Ricotta vaccina', amount: 50, unit: 'g' },
      { name: 'Noci sgusciate', amount: 20, unit: 'g' },
      { name: 'Parmigiano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Artigianale: Frulla noci e parmigiano, poi unisci la ricotta e acqua di cottura.',
      'Industariale: Usa il vasetto pronto scaldandolo leggermente.',
      'Condisci la pasta creando una crema omogenea.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-34',
    title: 'Pasta Speck e Radicchio (Pesto Rosso)',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 20,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Speck a listarelle', amount: 30, unit: 'g' },
      { name: 'Radicchio rosso', amount: 100, unit: 'g' },
      { name: 'Noci', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Artigianale: Stufa il radicchio con cipolla, poi frullalo con noci e olio.',
      'Industriale: Rosola lo speck e aggiungi il pesto pronto di radicchio.',
      'Unisci lo speck croccante alla crema e condisci la pasta.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'side-1',
    title: 'Insalata di mais e olive',
    category: 'side',
    difficulty: 'easy',
    timeMin: 5,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Mais dolce', amount: 100, unit: 'g' },
      { name: 'Olive nere', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Scola il mais e uniscilo alle olive.',
      'Condisci con un filo d’olio.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-2',
    title: 'Pomodori all’insalata',
    category: 'side',
    difficulty: 'easy',
    timeMin: 5,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Pomodori maturi', amount: 200, unit: 'g' },
      { name: 'Origano', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Taglia i pomodori e condisci con olio, sale e origano.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-3',
    title: 'Piselli al tegame',
    category: 'side',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Piselli fini', amount: 150, unit: 'g' },
      { name: 'Cipollotto', amount: 1, unit: '' }
    ],
    instructions: [
      'Stufa il cipollotto e aggiungi i piselli con poca acqua.'
    ],
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'side-4',
    title: 'Melanzane arrostite',
    category: 'side',
    difficulty: 'easy',
    timeMin: 15,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Melanzane', amount: 200, unit: 'g' },
      { name: 'Aglio e menta', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Griglia le fette di melanzana e condisci.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-5',
    title: 'Melanzane a funghetti',
    category: 'side',
    difficulty: 'medium',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Melanzane', amount: 200, unit: 'g' },
      { name: 'Pomodorini', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Taglia le melanzane a cubetti e cuocile in padella con pomodorini.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-6',
    title: 'Peperoni in padella',
    category: 'side',
    difficulty: 'medium',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Peperoni', amount: 200, unit: 'g' },
      { name: 'Olive e capperi', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Stufa i peperoni a listarelle con olive e capperi.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-7',
    title: 'Insalata di lattuga fresca',
    category: 'side',
    difficulty: 'easy',
    timeMin: 5,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Lattuga', amount: 100, unit: 'g' }
    ],
    instructions: [
      'Lava e condisci la lattuga.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-8',
    title: 'Pane integrale (fetta)',
    category: 'side',
    difficulty: 'easy',
    timeMin: 1,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Pane integrale', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Accompagna il secondo piatto con una fetta di pane.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'fast-1',
    title: 'Pasta aglio, olio e peperoncino',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Peperoncino', amount: 1, unit: 'pizzico' },
      { name: 'Olio EVO', amount: 15, unit: 'ml' }
    ],
    instructions: [
      'Lessa la pasta in acqua salata.',
      'In una padella, scalda l\'olio con l\'aglio e il peperoncino.',
      'Scola la pasta e saltala in padella con un po\' di acqua di cottura.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'fast-2',
    title: 'Pasta al tonno veloce',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 12,
    season: 'all',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Tonno sott\'olio', amount: 80, unit: 'g' },
      { name: 'Prezzemolo', amount: 1, unit: 'manciata' }
    ],
    instructions: [
      'Cuoci la pasta.',
      'Sgocciola il tonno e mettilo in una ciotola con il prezzemolo tritato.',
      'Unisci la pasta calda e mescola bene.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'fast-3',
    title: 'Pasta panna e prosciutto',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 12,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Pasta corta', amount: 80, unit: 'g' },
      { name: 'Pesto di panna (o panna da cucina)', amount: 50, unit: 'ml' },
      { name: 'Prosciutto cotto a cubetti', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Lessa la pasta.',
      'In una padella scotta il prosciutto per 2 minuti.',
      'Aggiungi la panna, unisci la pasta e manteca.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'fast-4',
    title: 'Pasta e Philadelphia',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Formaggio Philadelphia', amount: 50, unit: 'g' },
      { name: 'Parmigiano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Cuoci la pasta.',
      'Metti il Philadelphia in una ciotola con un cucchiaio di acqua di cottura per ammorbidirlo.',
      'Versa la pasta nella ciotola e mescola fino a renderla cremosa.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'side-9',
    title: 'Grissini torinesi',
    category: 'side',
    difficulty: 'easy',
    timeMin: 1,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Grissini', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Accompagna il pasto con dei grissini croccanti.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'side-10',
    title: 'Panino morbido',
    category: 'side',
    difficulty: 'easy',
    timeMin: 1,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Panino al latte o all\'olio', amount: 1, unit: '' }
    ],
    instructions: [
      'Ideale da accompagnare a secondi piatti con sughi.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'side-11',
    title: 'Pane bianco (fetta)',
    category: 'side',
    difficulty: 'easy',
    timeMin: 1,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Pane di tipo 0', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Una fetta di pane bianco fresco.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'side-12',
    title: 'Pane in cassetta (Tostato)',
    category: 'side',
    difficulty: 'easy',
    timeMin: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Pane in cassetta', amount: 2, unit: 'fette' }
    ],
    instructions: [
      'Tosta leggermente le fette di pane.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'cold-10',
    title: 'Alici marinate al limone',
    category: 'cold',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Alici fresche pulite', amount: 150, unit: 'g' },
      { name: 'Succo di limone', amount: 2, unit: '' },
      { name: 'Prezzemolo e aglio', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Disponi le alici in un piatto.',
      'Copri con succo di limone, aglio tritato e prezzemolo.',
      'Lascia marinare in frigo per almeno 2 ore prima di servire.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-35',
    title: 'Alici raganate (al forno)',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Alici fresche', amount: 200, unit: 'g' },
      { name: 'Pane grattugiato', amount: 50, unit: 'g' },
      { name: 'Origano e Aglio', amount: 1, unit: 'q.b.' },
      { name: 'Pomodorini', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Disponi le alici in una teglia.',
      'Cospargi con mix di pangrattato, aglio, origano e pomodorini a pezzi.',
      'Inforna a 200°C per 15 minuti finché dorate.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'cold-11',
    title: 'Polpo all\'insalata classico',
    category: 'cold',
    difficulty: 'medium',
    timeMin: 45,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Polpo bollito', amount: 200, unit: 'g' },
      { name: 'Patate lesse', amount: 150, unit: 'g' },
      { name: 'Prezzemolo e Limone', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Taglia il polpo e le patate a cubetti.',
      'Condisci con abbondante prezzemolo, succo di limone e Olio EVO.',
      'Servi freddo o a temperatura ambiente.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-36',
    title: 'Polpo alla luciana',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 60,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Polpo verace', amount: 250, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'g' },
      { name: 'Olive e Capperi', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Metti il polpo intero in una pentola con pomodoro, olive e capperi.',
      'Cuoci a fuoco bassissimo con coperchio per circa 50 minuti (il polpo cuoce nell\'acqua sua).',
      'Servi caldo con crostini di pane.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-37',
    title: 'Souté di cozze e vongole',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Cozze e Vongole', amount: 300, unit: 'g' },
      { name: 'Aglio e Peperoncino', amount: 1, unit: 'q.b.' },
      { name: 'Prezzemolo', amount: 1, unit: 'manciata' }
    ],
    instructions: [
      'In una padella ampia scalda olio, aglio e peperoncino.',
      'Tuffa i frutti di mare e copri finché non si aprono tutti.',
      'Sfumare con vino bianco (opzionale) e servire con prezzemolo fresco.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-38',
    title: 'Risotto ai Frutti di Mare e Crostacei',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 45,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 80, unit: 'g' },
      { name: 'Misto crostacei (Gamberi, Scampi)', amount: 100, unit: 'g' },
      { name: 'Calamari e Seppie', amount: 80, unit: 'g' },
      { name: 'Fumet di pesce', amount: 400, unit: 'ml' }
    ],
    instructions: [
      'Prepara un brodo ristretto con le teste dei crostacei.',
      'Tosta il riso, aggiungi i calamari e sfuma.',
      'Porta a cottura aggiungendo il fumet bollente.',
      'A fine cottura aggiungi i crostacei e manteca con un filo d\'olio.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-39',
    title: 'Risotto ai funghi',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegetarian'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 80, unit: 'g' },
      { name: 'Funghi misti (freschi o surgelati)', amount: 150, unit: 'g' },
      { name: 'Brodo vegetale', amount: 400, unit: 'ml' },
      { name: 'Parmigiano', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Pulisci i funghi e trifolali in padella con aglio e prezzemolo.',
      'Tosta il riso, aggiungi parte dei funghi.',
      'Porta a cottura aggiungendo il brodo gradualmente.',
      'A fine cottura unisci i funghi rimasti e manteca con parmigiano.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-40',
    title: 'Pollo alla cacciatora',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Pollo a pezzi', amount: 200, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 100, unit: 'g' },
      { name: 'Olive nere', amount: 30, unit: 'g' },
      { name: 'Vino rosso', amount: 50, unit: 'ml' }
    ],
    instructions: [
      'Rosola il pollo in padella con olio e spezie.',
      'Sfuma con il vino rosso.',
      'Aggiungi pomodoro e olive, copri e cuoci a fuoco lento per 30 min.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-41',
    title: 'Coniglio alla cacciatora',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 50,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Coniglio a pezzi', amount: 200, unit: 'g' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
      { name: 'Rosmarino e aglio', amount: 1, unit: 'q.b.' },
      { name: 'Olive taggiasche', amount: 20, unit: 'g' }
    ],
    instructions: [
      'In una casseruola rosola il coniglio con aglio e rosmarino.',
      'Sfuma con vino bianco.',
      'Porta a cottura dolcemente aggiungendo brodo se necessario e le olive alla fine.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-42',
    title: 'Nuggets vegani',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Ceci precotti', amount: 200, unit: 'g' },
      { name: 'Cornflakes tritati (per panatura)', amount: 50, unit: 'g' },
      { name: 'Spezie (paprika, aglio in polvere)', amount: 1, unit: 'q.b.' },
      { name: 'Farina di riso', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Frulla i ceci con le spezie e la farina.',
      'Forma delle crocchette con le mani umide.',
      'Passale nei cornflakes tritati.',
      'Cuoci in friggitrice ad aria o forno a 200°C per 15 min.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-43',
    title: 'Nuggets di Pollo fatti in casa',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: false,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Petto di pollo macinato', amount: 200, unit: 'g' },
      { name: 'Pane grattugiato', amount: 50, unit: 'g' },
      { name: 'Uovo', amount: 1, unit: '' },
      { name: 'Farina', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Forma delle palline con la carne e schiacciale.',
      'Passale nella farina, poi nell\'uovo e infine nel pangrattato.',
      'Cuoci in padella con poco olio o al forno finché dorati.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-44',
    title: 'Salsicce e patate al forno',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 40,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Salsicce di maiale', amount: 2, unit: '' },
      { name: 'Patate', amount: 250, unit: 'g' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' },
      { name: 'Olio EVO', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Taglia le patate a cubetti.',
      'Bucherella le salsicce con una forchetta.',
      'Disponi tutto in una teglia con olio e rosmarino.',
      'Inforna a 200°C per 30-35 minuti.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-45',
    title: 'Fagioli alla messicana',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Fagioli neri o rossi precotti', amount: 250, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 100, unit: 'g' },
      { name: 'Cipolla e peperoncino', amount: 1, unit: 'q.b.' },
      { name: 'Peperoni a cubetti', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Soffriggi la cipolla con il peperoncino.',
      'Aggiungi i peperoni e falli ammorbidire.',
      'Unisci i fagioli e il pomodoro, cuoci per 15 min finché il sugo si restringe.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-46',
    title: 'Pasta melanzane e salsicce',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'summer',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Melanzana piccola', amount: 1, unit: '' },
      { name: 'Salsiccia sgranata', amount: 2, unit: 'pz' },
      { name: 'Vino bianco', amount: 30, unit: 'ml' }
    ],
    instructions: [
      'Taglia la melanzana a cubetti e saltala in padella.',
      'Aggiungi la salsiccia sgranata e rosola bene.',
      'Sfuma con vino bianco.',
      'Lessa la pasta e saltala nel condimento.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-47',
    title: 'Pasta alla bolognese (Ragù)',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 90,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Tagliatelle o pasta corta', amount: 80, unit: 'g' },
      { name: 'Carne macinata mista', amount: 100, unit: 'g' },
      { name: 'Soffritto (carota, sedano, cipolla)', amount: 50, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 150, unit: 'g' }
    ],
    instructions: [
      'Prepara il soffritto e aggiungi la carne, rosolandola bene.',
      'Sfuma con un po\' di vino se gradito.',
      'Aggiungi il pomodoro e cuoci a fuoco bassissimo per almeno un\'ora.',
      'Condisci la pasta.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-48',
    title: 'Gnocchi burro e salvia',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: false,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Gnocchi di patate', amount: 250, unit: 'g' },
      { name: 'Burro', amount: 20, unit: 'g' },
      { name: 'Salvia fresca', amount: 4, unit: 'foglie' },
      { name: 'Parmigiano', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Sciogli il burro in una padella ampia con le foglie di salvia.',
      'Lessa i gnocchi in acqua salata.',
      'Appena salgono a galla, passali nella padella col burro e manteca con parmigiano.'
    ],
    seasoningTips: 'Per un\'alternativa più saporita, prova a sostituire il burro con una crema di parmigiano e acqua di cottura, aggiungendo scorza di limone grattugiata e pepe nero.',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-49',
    title: 'Pasta con crema di broccoli',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Pasta corta', amount: 80, unit: 'g' },
      { name: 'Broccoli', amount: 200, unit: 'g' },
      { name: 'Pinoli', amount: 10, unit: 'g' },
      { name: 'Olio EVO', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Lessa i broccoli insieme alla pasta.',
      'Scola tutto ma tieni un po\' di acqua di cottura.',
      'Frulla parte dei broccoli con olio e una manciata di pinoli.',
      'Salta la pasta con la crema ottenuta.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-50',
    title: 'Pasta e carciofi',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 30,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Carciofi', amount: 2, unit: 'pz' },
      { name: 'Aglio e prezzemolo', amount: 1, unit: 'q.b.' },
      { name: 'Olio EVO', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Pulisci i carciofi e tagliali a fettine sottili.',
      'Cuocili in padella con aglio, olio e un po\' d\'acqua finché teneri.',
      'Lessa la pasta e saltala con i carciofi e abbondante prezzemolo.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-51',
    title: 'Risotto ai carciofi',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 80, unit: 'g' },
      { name: 'Carciofi', amount: 2, unit: 'pz' },
      { name: 'Brodo vegetale', amount: 400, unit: 'ml' },
      { name: 'Vino bianco', amount: 30, unit: 'ml' }
    ],
    instructions: [
      'Pulisci i carciofi e saltali in padella.',
      'Tosta il riso, sfuma con il vino bianco.',
      'Aggiungi i carciofi e porta a cottura con il brodo.',
      'Manteca a piacere con un filo d\'olio o parmigiano.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-52',
    title: 'Pasta broccoli e salsiccia',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'winter',
    isWHOCompliant: false,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Broccoli', amount: 200, unit: 'g' },
      { name: 'Salsiccia', amount: 1, unit: 'pz' },
      { name: 'Peperoncino', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Lessa i broccoli.',
      'In una padella sgrana la salsiccia e rosolala con il peperoncino.',
      'Aggiungi i broccoli e schiacciali un po\'.',
      'Lessa la pasta e saltala nel condimento.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-53',
    title: 'Broccoli e fagioli',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Broccoli', amount: 300, unit: 'g' },
      { name: 'Fagioli cannellini precotti', amount: 200, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Olio EVO', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Lessa i broccoli al dente.',
      'In padella scotta l\'aglio con l\'olio, aggiungi i fagioli e i broccoli.',
      'Fai insaporire per 10 minuti aggiungendo un po\' di acqua di cottura.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-54',
    title: 'Scarole e fagioli',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Scarola', amount: 400, unit: 'g' },
      { name: 'Fagioli cannellini o borlotti', amount: 200, unit: 'g' },
      { name: 'Aglio e peperoncino', amount: 1, unit: 'q.b.' },
      { name: 'Crostini di pane (opzionali)', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Lava bene la scarola e lessala brevemente.',
      'In una pentola scalda aglio e olio, unisci i fagioli e la scarola.',
      'Lascia cuocere finché i sapori si fondono, servendo con crostini.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-55',
    title: 'Polpettone classico',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 50,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Carne macinata', amount: 250, unit: 'g' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Pane grattugiato', amount: 40, unit: 'g' },
      { name: 'Parmigiano', amount: 20, unit: 'g' },
      { name: 'Prezzemolo', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'In una ciotola unisci carne, uovo, formaggio, pane e prezzemolo.',
      'Impasta bene e dai la forma di un cilindro.',
      'Avvolgi in carta forno e inforna a 180°C per circa 40 minuti.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-56',
    title: 'Gâteau (Gatteu) di patate',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 50,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Patate lesse', amount: 500, unit: 'g' },
      { name: 'Prosciutto cotto a cubetti', amount: 50, unit: 'g' },
      { name: 'Mozzarella o provola', amount: 100, unit: 'g' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Parmigiano', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Schiaccia le patate lesse e unisci uova, parmigiano, prosciutto e formaggio a pezzetti.',
      'Metti in una teglia imburrata e cosparsa di pangrattato (senza glutine se necessario).',
      'Inforna a 200°C per 25-30 minuti finché si forma la crosticina.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-57',
    title: 'Pasta panna e salmone',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: false,
    tags: ['fish'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Salmone affumicato o fresco', amount: 100, unit: 'g' },
      { name: 'Panna (anche senza lattosio)', amount: 100, unit: 'ml' },
      { name: 'Erba cipollina', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Rosola il salmone tagliato a pezzetti in padella.',
      'Aggiungi la panna e scalda brevemente.',
      'Lessa la pasta e saltala con la crema di salmone e erba cipollina.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-58',
    title: 'Purè di patate',
    category: 'side',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Patate', amount: 300, unit: 'g' },
      { name: 'Latte (anche vegetale)', amount: 100, unit: 'ml' },
      { name: 'Burro (opzionale)', amount: 10, unit: 'g' },
      { name: 'Noce moscata', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Lessa le patate e schiacciale ancora calde.',
      'Metti in un pentolino con il latte caldo e mescola energicamente.',
      'Aggiungi burro e noce moscata fino a ottenere la consistenza desiderata.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-59',
    title: 'Pasta zucchine e speck',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Zucchine', amount: 150, unit: 'g' },
      { name: 'Speck a listarelle', amount: 40, unit: 'g' },
      { name: 'Cipolla', amount: 1, unit: 'fetta' }
    ],
    instructions: [
      'Taglia le zucchine a rondelle o cubetti.',
      'In una padella rosola lo speck con la cipolla finché diventa croccante.',
      'Aggiungi le zucchine e cuoci per 10 minuti.',
      'Lessa la pasta e saltala nel condimento.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-60',
    title: 'Pasta con crema di carciofi',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 25,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Carciofi', amount: 2, unit: 'pz' },
      { name: 'Formaggio spalmabile', amount: 30, unit: 'g' },
      { name: 'Parmigiano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Pulisci i carciofi e cuocili in padella con aglio e acqua.',
      'Frulla metà dei carciofi con il formaggio spalmabile e un po\' di acqua di cottura.',
      'Unisci la crema ai carciofi interi rimasti.',
      'Lessa la pasta e saltala con la crema ottenuta.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-61',
    title: 'Pasta bresaola e melanzane',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['lactose-free'],
    ingredients: [
      { name: 'Pasta', amount: 80, unit: 'g' },
      { name: 'Melanzane', amount: 150, unit: 'g' },
      { name: 'Bresaola', amount: 50, unit: 'g' },
      { name: 'Pomodorini', amount: 5, unit: 'pz' }
    ],
    instructions: [
      'Taglia le melanzane a cubetti e cuocile in padella o al forno.',
      'Aggiungi i pomodorini tagliati a metà e cuoci 5 minuti.',
      'Lessa la pasta e saltala con le melanzane.',
      'Unisci la bresaola a freddo, tagliata a straccetti, prima di servire.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-62',
    title: 'Zuppa di legumi misti',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 30,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Legumi misti (lenticchie, ceci, fagioli)', amount: 250, unit: 'g' },
      { name: 'Carota, sedano, cipolla', amount: 50, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 50, unit: 'g' },
      { name: 'Olio EVO', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Prepara un soffritto leggero con le verdure.',
      'Aggiungi i legumi (precedentemente ammollati o precotti).',
      'Unisci il pomodoro e copri con acqua o brodo vegetale.',
      'Cuoci finché i legumi sono teneri e la zuppa è densa.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-63',
    title: 'Burger di ceci fatto in casa',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Ceci precotti', amount: 250, unit: 'g' },
      { name: 'Farina di ceci (o pangrattato gluten-free)', amount: 40, unit: 'g' },
      { name: 'Prezzemolo e aglio in polvere', amount: 1, unit: 'q.b.' },
      { name: 'Olio EVO', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Frulla i ceci grossolanamente (non devono essere una purea totale).',
      'Unisci le spezie e la farina di ceci per compattare l\'impasto.',
      'Forma dei burger con le mani.',
      'Cuoci in padella antiaderente con un filo d\'olio o al forno a 200°C per 15 min.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-64',
    title: 'Burger di fagioli rossi',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Fagioli rossi precotti', amount: 250, unit: 'g' },
      { name: 'Cipolla rossa tritata', amount: 20, unit: 'g' },
      { name: 'Paprika dolce', amount: 1, unit: 'pizzico' },
      { name: 'Fiocchi d\'avena (senza glutine)', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Schiaccia i fagioli con una forchetta.',
      'Unisci la cipolla, la paprika e i fiocchi d\'avena.',
      'Lascia riposare 10 minuti, poi forma i burger.',
      'Cuoci in padella 5 minuti per lato.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-65',
    title: 'Bastoncini di verdure (artigianali)',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 25,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan'],
    ingredients: [
      { name: 'Verdure miste (zucchine, carote, patate)', amount: 300, unit: 'g' },
      { name: 'Cornflakes senza zucchero triturati', amount: 50, unit: 'g' },
      { name: 'Pastella di acqua e farina', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Grattugia le verdure e strizzale bene per togliere l\'acqua.',
      'Forma dei bastoncini compattandoli bene.',
      'Passali nella pastella e poi nei cornflakes triturati.',
      'Inforna a 200°C finché sono dorati e croccanti.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-66',
    title: 'Tofu croccante alle erbe',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Tofu al naturale', amount: 180, unit: 'g' },
      { name: 'Erbe aromatiche miste', amount: 1, unit: 'q.b.' },
      { name: 'Salsa di soia (Tamari per senza glutine)', amount: 20, unit: 'ml' },
      { name: 'Maizena', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Taglia il tofu a cubetti e asciugalo molto bene.',
      'Passalo nella maizena mischiata alle erbe.',
      'Salta in padella con olio e sfuma con la salsa di soia alla fine per renderlo croccante.'
    ],
    proteinType: 'veg',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-67',
    title: 'Quinoa mediterranea',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Quinoa', amount: 70, unit: 'g' },
      { name: 'Pomodorini', amount: 100, unit: 'g' },
      { name: 'Olive e capperi', amount: 20, unit: 'g' },
      { name: 'Basilico fresco', amount: 4, unit: 'foglie' }
    ],
    instructions: [
      'Lava la quinoa sotto acqua corrente e lessala per 12-15 minuti.',
      'Taglia i pomodorini e condiscili con olive, capperi e basilico.',
      'Unisci la quinoa scolata e mescola bene. Ottima anche fredda.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-68',
    title: 'Torta Caprese',
    category: 'dessert',
    difficulty: 'medium',
    timeMin: 60,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free', 'vegetarian'],
    ingredients: [
      { name: 'Mandorle tritate o farina di mandorle', amount: 200, unit: 'g' },
      { name: 'Cioccolato fondente', amount: 200, unit: 'g' },
      { name: 'Burro', amount: 150, unit: 'g' },
      { name: 'Zucchero', amount: 150, unit: 'g' },
      { name: 'Uova', amount: 4, unit: 'pz' }
    ],
    instructions: [
      'Sciogli il cioccolato con il burro a bagnomaria.',
      'Monta i tuorli con lo zucchero e aggiungi il cioccolato fuso e le mandorle.',
      'Monta gli albumi a neve e incorporali delicatamente al composto.',
      'Inforna a 180°C per 45 minuti.'
    ],
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-69',
    title: 'Mousse al cioccolato fondente',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegetarian'],
    ingredients: [
      { name: 'Cioccolato fondente (min 70%)', amount: 100, unit: 'g' },
      { name: 'Acqua o latte di cocco', amount: 80, unit: 'ml' },
      { name: 'Pizzico di sale', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Sciogli il cioccolato a bagnomaria con l\'acqua.',
      'Metti il pentolino in una ciotola con ghiaccio e monta con le fruste elettriche finché diventa spumoso.',
      'Lascia riposare in frigo prima di servire.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-70',
    title: 'Budino di riso e latte',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 40,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegetarian'],
    ingredients: [
      { name: 'Riso originario', amount: 100, unit: 'g' },
      { name: 'Latte', amount: 500, unit: 'ml' },
      { name: 'Zucchero o miele', amount: 40, unit: 'g' },
      { name: 'Scorza di limone', amount: 1, unit: 'pz' }
    ],
    instructions: [
      'Cuoci il riso nel latte con la scorza di limone a fuoco lento.',
      'Mescola spesso finché il riso ha assorbito quasi tutto il latte ed è cremoso.',
      'Aggiungi il dolcificante e servi tiepido o freddo.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-71',
    title: 'Mele cotte cannella e pinoli',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 20,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan'],
    ingredients: [
      { name: 'Mele', amount: 2, unit: 'pz' },
      { name: 'Cannella', amount: 1, unit: 'q.b.' },
      { name: 'Pinoli', amount: 10, unit: 'g' },
      { name: 'Uvetta', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Sbuccia le mele e tagliale a spicchi.',
      'Metti in un pentolino con un goccio d\'acqua, cannella, pinoli e uvetta.',
      'Cuoci a fuoco dolce per 15-20 minuti finché sono tenere.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-72',
    title: 'Panna cotta allo yogurt',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 15,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegetarian'],
    ingredients: [
      { name: 'Yogurt greco', amount: 200, unit: 'g' },
      { name: 'Panna liquida', amount: 100, unit: 'ml' },
      { name: 'Colla di pesce o agar agar', amount: 4, unit: 'g' },
      { name: 'Frutti di bosco', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Scalda la panna senza bollire e scioglici la gelatina ammollata.',
      'Unisci lo yogurt e mescola bene.',
      'Versa negli stampini e lascia in frigo per almeno 4 ore. Servi con frutti di bosco.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'side-13',
    title: 'Bieta all\'agro',
    category: 'side',
    difficulty: 'easy',
    timeMin: 15,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Bieta', amount: 300, unit: 'g' },
      { name: 'Limone', amount: 0.5, unit: '' }
    ],
    instructions: [
      'Lessa la bieta in acqua salata.',
      'Scolala e condisci con succo di limone e olio a freddo.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-14',
    title: 'Carote julienne al limone',
    category: 'side',
    difficulty: 'easy',
    timeMin: 5,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Carote', amount: 150, unit: 'g' },
      { name: 'Succo di limone', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Grattugia le carote a julienne.',
      'Condisci con limone, olio e un pizzico di prezzemolo.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-15',
    title: 'Finocchi gratinati light',
    category: 'side',
    difficulty: 'easy',
    timeMin: 20,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Finocchi', amount: 200, unit: 'g' },
      { name: 'Pangrattato', amount: 10, unit: 'g' },
      { name: 'Parmigiano', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Taglia i finocchi a fette e lessali 5 minuti.',
      'Disponili in una teglia, spolvera con pangrattato e parmigiano.',
      'Inforna a 200°C per 10 minuti.'
    ],
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-16',
    title: 'Zucchine trifolate',
    category: 'side',
    difficulty: 'easy',
    timeMin: 15,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Zucchine', amount: 200, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Prezzemolo', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Taglia le zucchine a cubetti o rondelle.',
      'Cuoci in padella con aglio e olio per 10 minuti.',
      'Aggiungi il prezzemolo alla fine.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-17',
    title: 'Insalata di finocchi e arance',
    category: 'side',
    difficulty: 'easy',
    timeMin: 10,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Finocchi', amount: 150, unit: 'g' },
      { name: 'Arancia', amount: 0.5, unit: '' },
      { name: 'Olive nere', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Affetta il finocchio molto sottile.',
      'Pela l\'arancia a vivo e tagliala a pezzetti.',
      'Unisci tutto con olive, olio e pepe.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-18',
    title: 'Broccoli ripassati',
    category: 'side',
    difficulty: 'easy',
    timeMin: 15,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Broccoli', amount: 200, unit: 'g' },
      { name: 'Peperoncino', amount: 1, unit: 'q.b.' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' }
    ],
    instructions: [
      'Lessa i broccoli.',
      'Ripassali in padella con aglio, olio e peperoncino.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-19',
    title: 'Asparagi al vapore',
    category: 'side',
    difficulty: 'easy',
    timeMin: 12,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Asparagi', amount: 200, unit: 'g' }
    ],
    instructions: [
      'Pulisci gli asparagi togliendo la parte dura.',
      'Cuoci al vapore per 8-10 minuti.',
      'Condisci con un filo d\'olio crudo.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'side-20',
    title: 'Fagiolini al pomodoro',
    category: 'side',
    difficulty: 'easy',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free'],
    ingredients: [
      { name: 'Fagiolini', amount: 200, unit: 'g' },
      { name: 'Pomodorini', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Lessa i fagiolini.',
      'In padella scotta i pomodorini con aglio e olio, poi aggiungi i fagiolini.',
      'Lascia insaporire qualche minuto.'
    ],
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-101',
    title: 'Spaghetti alla Carbonara (Ricetta Tradizionale)',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Spaghetti', amount: 80, unit: 'g' },
      { name: 'Guanciale', amount: 40, unit: 'g' },
      { name: 'Tuorli d\'uovo', amount: 2, unit: '' },
      { name: 'Pecorino Romano', amount: 20, unit: 'g' },
      { name: 'Pepe nero', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Metti a bollire l\'acqua per la pasta.',
      'Taglia il guanciale a listarelle e fallo rosolare in padella senza olio finché croccante.',
      'In una ciotola, mescola i tuorli con il pecorino e un po\' di acqua di cottura per creare una crema.',
      'Scola la pasta al dente, saltala un minuto con il guanciale, poi togli dal fuoco.',
      'Aggiungi la crema di uova e pecorino a fuoco spento, mescolando energicamente.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-102',
    title: 'Spaghetti all\'Amatriciana',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Spaghetti', amount: 80, unit: 'g' },
      { name: 'Guanciale', amount: 30, unit: 'g' },
      { name: 'Pomodori pelati', amount: 200, unit: 'g' },
      { name: 'Pecorino Romano', amount: 15, unit: 'g' },
      { name: 'Peperoncino', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Rosola il guanciale in padella finché il grasso diventa trasparente.',
      'Aggiungi il pomodoro e il peperoncino, cuoci per 10-15 minuti.',
      'Lessa la pasta, scolala e saltala nel sugo.',
      'Spolvera con abbondante pecorino.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-103',
    title: 'Coniglio in umido alle olive',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 50,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Coniglio a pezzi', amount: 250, unit: 'g' },
      { name: 'Olive taggiasche', amount: 20, unit: 'g' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
      { name: 'Rosmarino e aglio', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Rosola il coniglio con aglio e rosmarino.',
      'Sfuma con il vino bianco.',
      'Aggiungi le olive e un po\' d\'acqua, copri e cuoci a fuoco lento per 40 minuti.',
      'Regola di sale e pepe alla fine.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-104',
    title: 'Tacchino alle erbe e limone',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Fesa di tacchino', amount: 150, unit: 'g' },
      { name: 'Limone', amount: 0.5, unit: '' },
      { name: 'Salvia e rosmarino', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Scalda una piastra o padella antiaderente.',
      'Cuoci il tacchino con le erbe aromatiche 3-4 minuti per lato.',
      'Irrora con succo di limone e servi caldo.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-105',
    title: 'Orata al forno con patate e pomodorini',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 35,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Orata (filetto o intera)', amount: 250, unit: 'g' },
      { name: 'Patate a fette sottili', amount: 100, unit: 'g' },
      { name: 'Pomodorini', amount: 60, unit: 'g' },
      { name: 'Olive nere', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Disponi le patate su una teglia foderata di carta forno.',
      'Adagia sopra l\'orata, i pomodorini tagliati e le olive.',
      'Irrora con olio e inforna a 200°C per 20-25 minuti.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-106',
    title: 'Spigola all\'acqua pazza',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Filetto di spigola (branzino)', amount: 200, unit: 'g' },
      { name: 'Pomodorini', amount: 80, unit: 'g' },
      { name: 'Aglio e prezzemolo', amount: 1, unit: 'q.b.' },
      { name: 'Vino bianco', amount: 30, unit: 'ml' }
    ],
    instructions: [
      'In un padellone, soffriggi l\'aglio con poco olio.',
      'Metti i pomodorini e cuoci 5 minuti.',
      'Adagia la spigola, sfuma con vino e aggiungi un mestolo d\'acqua calda.',
      'Copri e cuoci per 10-12 minuti a fuoco medio.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-107',
    title: 'Pesce spada alla siciliana',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Trancio di pesce spada', amount: 150, unit: 'g' },
      { name: 'Capperi', amount: 10, unit: 'g' },
      { name: 'Olive nere', amount: 20, unit: 'g' },
      { name: 'Salsa di pomodoro', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Scalda la salsa di pomodoro con capperi e olive.',
      'Adagia il pesce spada nel sugo caldo.',
      'Cuoci 4-5 minuti per lato senza farlo asciugare troppo.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-108',
    title: 'Filetti di sogliola alla mugnaia (light)',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Filetti di sogliola', amount: 200, unit: 'g' },
      { name: 'Farina', amount: 10, unit: 'g' },
      { name: 'Limone', amount: 0.5, unit: '' },
      { name: 'Prezzemolo', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Infarina leggermente i filetti di sogliola.',
      'Cuoci in padella con un filo d\'olio per 2 minuti per lato.',
      'Aggiungi succo di limone e prezzemolo tritato alla fine.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-109',
    title: 'Involtino di tacchino con ripieno di zucchine',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 25,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Fesa di tacchino a fette', amount: 150, unit: 'g' },
      { name: 'Zucchine', amount: 100, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 10, unit: 'g' },
      { name: 'Rosmarino', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Grattugia le zucchine e strizzale bene.',
      'Disponi le zucchine sulle fette di tacchino con un po\' di parmigiano.',
      'Arrotola e ferma con uno stuzzicadenti.',
      'Cuoci in padella con rosmarino e un filo d\'olio per 10-12 minuti.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-110',
    title: 'Tacchino con piselli',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Spezzatino di tacchino', amount: 150, unit: 'g' },
      { name: 'Piselli surgelati o freschi', amount: 100, unit: 'g' },
      { name: 'Scalogno', amount: 1, unit: '' },
      { name: 'Brodo vegetale', amount: 100, unit: 'ml' }
    ],
    instructions: [
      'Rosola lo scalogno tritato in padella.',
      'Aggiungi il tacchino e fallo insaporire.',
      'Unisci i piselli e il brodo, copri e cuoci per 15 minuti.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-111',
    title: 'Petto di tacchino in umido',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Petto di tacchino', amount: 150, unit: 'g' },
      { name: 'Polpa di pomodoro', amount: 100, unit: 'g' },
      { name: 'Olive taggiasche', amount: 10, unit: 'g' },
      { name: 'Origano', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Taglia il tacchino a fette o bocconcini.',
      'Metti in padella con il pomodoro, le olive e l\'origano.',
      'Cuoci a fuoco dolce per 15 minuti aggiungendo acqua se necessario.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-112',
    title: 'Bocconcini di pollo alla paprika',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Petto di pollo', amount: 150, unit: 'g' },
      { name: 'Paprika dolce', amount: 1, unit: 'cucchiaino' },
      { name: 'Farina di riso', amount: 10, unit: 'g' },
      { name: 'Yogurt greco bianco (opzionale)', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Taglia il pollo a cubetti e infarinalo con la farina di riso e la paprika.',
      'Salta in padella con un filo d\'olio finché dorato.',
      'Se desideri una crema, aggiungi un cucchiaio di yogurt greco alla fine.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-113',
    title: 'Bocconcini di tacchino con crema di patate',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Fesa di tacchino', amount: 150, unit: 'g' },
      { name: 'Patate', amount: 200, unit: 'g' },
      { name: 'Latte scremato', amount: 50, unit: 'ml' },
      { name: 'Rosmarino', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Lessa le patate e schiacciale con un po\' di latte per ottenere una crema.',
      'Rosola i bocconcini di tacchino con rosmarino in una padella separata.',
      'Servi il tacchino adagiato sulla crema di patate calda.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-114',
    title: 'Friarielli e salsiccia',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'winter',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Friarielli (cime di rapa)', amount: 300, unit: 'g' },
      { name: 'Salsiccia di maiale', amount: 150, unit: 'g' },
      { name: 'Aglio e peperoncino', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Pulisci e sbollenta brevemente i friarielli.',
      'In una padella, rosola l\'aglio con il peperoncino e cuoci le salsicce bucherellate.',
      'Quando le salsicce sono quasi cotte, aggiungi i friarielli e salta tutto insieme.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-115',
    title: 'Pizza Margherita',
    category: 'takeaway',
    difficulty: 'medium',
    timeMin: 60,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Impasto per pizza', amount: 200, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 80, unit: 'g' },
      { name: 'Mozzarella fior di latte', amount: 100, unit: 'g' },
      { name: 'Basilico fresco', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Stendi l\'impasto in una teglia.',
      'Condisci con pomodoro e un pizzico di sale.',
      'Inforna a 220°C per 10 minuti, aggiungi la mozzarella e cuoci altri 5 minuti.',
      'Guarnisci con basilico fresco.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-116',
    title: 'Pasta con crema di carote',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Pasta integrale', amount: 80, unit: 'g' },
      { name: 'Carote', amount: 150, unit: 'g' },
      { name: 'Scalogno', amount: 0.5, unit: '' },
      { name: 'Parmigiano Reggiano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Pulisci le carote e tagliale a rondelle sottili.',
      'Fai stufare lo scalogno con un po\' d\'acqua, aggiungi le carote e cuoci finché tenere.',
      'Frulla le carote con un po\' di acqua di cottura della pasta per ottenere una crema.',
      'Lessa la pasta, scolala e saltala con la crema di carote e il parmigiano.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-117',
    title: 'Vellutata di carote e philadelphia',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Carote', amount: 300, unit: 'g' },
      { name: 'Patate', amount: 100, unit: 'g' },
      { name: 'Formaggio spalmabile (tipo Philadelphia)', amount: 40, unit: 'g' },
      { name: 'Brodo vegetale', amount: 300, unit: 'ml' }
    ],
    instructions: [
      'Taglia carote e patate a cubetti.',
      'Cuoci nel brodo vegetale per circa 20 minuti finché sono molto morbide.',
      'Frulla tutto con il mixer ad immersione.',
      'Aggiungi il formaggio spalmabile e mescola finché sciolto e cremoso.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-118',
    title: 'Rollé di tacchino con prosciutto e formaggio filante',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Fesa di tacchino (pezzo intero aperto)', amount: 400, unit: 'g' },
      { name: 'Prosciutto cotto', amount: 100, unit: 'g' },
      { name: 'Provola o Galbanino', amount: 100, unit: 'g' },
      { name: 'Rosmarino', amount: 1, unit: 'q.b.' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' }
    ],
    instructions: [
      'Stendi la fesa di tacchino e adagia sopra le fette di prosciutto e il formaggio a fette.',
      'Arrotola stretto e lega con lo spago da cucina, inserendo il rosmarino.',
      'Rosola in una casseruola con un filo d\'olio su tutti i lati.',
      'Sfuma con vino bianco e cuoci in forno a 180°C per circa 25-30 minuti.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-119',
    title: 'Trofie speck e noci',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Trofie fresche', amount: 100, unit: 'g' },
      { name: 'Speck a listarelle', amount: 40, unit: 'g' },
      { name: 'Gherigli di noci', amount: 20, unit: 'g' },
      { name: 'Formaggio spalmabile', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Lessa le trofie in acqua salata.',
      'Nel frattempo, tosta le noci tritate e rosola lo speck in padella senza grassi.',
      'Aggiungi il formaggio spalmabile con un po\' di acqua di cottura per creare una crema.',
      'Scola la pasta e saltala nel condimento di speck e noci.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-120',
    title: 'Lasagne zucca e salsiccia',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 60,
    season: 'winter',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Sfoglia per lasagne', amount: 200, unit: 'g' },
      { name: 'Zucca cotta e frullata', amount: 400, unit: 'g' },
      { name: 'Salsiccia', amount: 150, unit: 'g' },
      { name: 'Besciamella', amount: 200, unit: 'ml' },
      { name: 'Parmigiano Reggiano', amount: 40, unit: 'g' }
    ],
    instructions: [
      'Rosola la salsiccia sgranata in padella.',
      'Mescola la crema di zucca con la besciamella.',
      'In una teglia, alterna strati di sfoglia, crema di zucca, salsiccia e parmigiano.',
      'Cuoci in forno a 200°C per circa 25-30 minuti finché dorate.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-121',
    title: 'Lasagne alla bolognese',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 90,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Sfoglia per lasagne all\'uovo', amount: 250, unit: 'g' },
      { name: 'Ragù alla bolognese', amount: 400, unit: 'g' },
      { name: 'Besciamella', amount: 300, unit: 'ml' },
      { name: 'Parmigiano Reggiano', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Prepara il ragù e la besciamella (se non pronti).',
      'In una teglia, stendi un velo di besciamella e ragù.',
      'Alterna strati di pasta, ragù, besciamella e abbondante parmigiano.',
      'Termina con ragù e parmigiano e inforna a 180°C per 35-40 minuti.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-122',
    title: 'Lasagne ricotta e spinaci',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 50,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Sfoglia per lasagne', amount: 200, unit: 'g' },
      { name: 'Spinaci lessati e strizzati', amount: 300, unit: 'g' },
      { name: 'Ricotta vaccina', amount: 250, unit: 'g' },
      { name: 'Besciamella (opzionale)', amount: 150, unit: 'ml' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Mescola gli spinaci tritati con la ricotta e il parmigiano.',
      'In una teglia, alterna strati di sfoglia con il composto di ricotta e spinaci (e poca besciamella).',
      'Copri l\'ultimo strato con parmigiano.',
      'Inforna a 190°C per circa 20-25 minuti.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-123',
    title: 'Tagliatelle al ragù di cinghiale',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 20,
    season: 'winter',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Tagliatelle all\'uovo', amount: 100, unit: 'g' },
      { name: 'Ragù di cinghiale (pronto o preparato)', amount: 150, unit: 'g' },
      { name: 'Pecorino Romano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Lessa le tagliatelle in abbondante acqua salata.',
      'Scalda il ragù di cinghiale in una padella ampia.',
      'Scola la pasta al dente e saltala col sugo, aggiungendo un po\' di acqua di cottura.',
      'Servi con una spolverata di pecorino.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-124',
    title: 'Spaghetti coi lupini',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Spaghetti', amount: 80, unit: 'g' },
      { name: 'Lupini (molluschi)', amount: 300, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Prezzemolo', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Lava bene i lupini in acqua corrente salata.',
      'In una padella, fai soffriggere l\'aglio e aggiungi i lupini finché non si schiudono.',
      'Scola gli spaghetti al dente e saltali in padella con l\'acqua dei lupini e abbondante prezzemolo.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-125',
    title: 'Bistecca ai ferri',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Bistecca di manzo', amount: 150, unit: 'g' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' },
      { name: 'Sale e pepe', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Scalda bene una piastra o una padella antiaderente.',
      'Cuoci la bistecca 2-3 minuti per lato a seconda dello spessore e del grado di cottura desiderato.',
      'Condisci con sale, pepe e rosmarino solo a fine cottura.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-126',
    title: 'Toast con avocado e uovo',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Pane integrale (fette)', amount: 2, unit: '' },
      { name: 'Avocado maturo', amount: 0.5, unit: '' },
      { name: 'Uovo', amount: 1, unit: '' },
      { name: 'Spremuta di limone', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Tosta le fette di pane.',
      'Schiaccia l\'avocado con una forchetta aggiungendo limone e un pizzico di sale.',
      'Cuoci l\'uovo in camicia o al tegamino.',
      'Spalma l\'avocado sul pane e adagia sopra l\'uovo.'
    ],
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-127',
    title: 'Riso e verza',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso originario', amount: 60, unit: 'g' },
      { name: 'Verza', amount: 200, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 15, unit: 'g' },
      { name: 'Brodo vegetale', amount: 400, unit: 'ml' }
    ],
    instructions: [
      'Taglia la verza a striscioline e stufala con un po\' d\'acqua o brodo.',
      'Aggiungi il riso e cuocilo aggiungendo brodo man mano, come un risotto ma più brodoso.',
      'Manteca alla fine con il parmigiano.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-128',
    title: 'Pasta verza e mortadella',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 25,
    season: 'winter',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Pasta corta', amount: 80, unit: 'g' },
      { name: 'Verza', amount: 150, unit: 'g' },
      { name: 'Mortadella a cubetti', amount: 30, unit: 'g' },
      { name: 'Pecorino', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Sbollenta la verza insieme alla pasta nell\'acqua bollente.',
      'In una padella, rosola la mortadella finché non diventa croccante.',
      'Scola pasta e verza e saltale in padella con la mortadella e il pecorino.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-129',
    title: 'Riso patate e cozze',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 50,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso Arborio', amount: 100, unit: 'g' },
      { name: 'Cozze con guscio', amount: 300, unit: 'g' },
      { name: 'Patate', amount: 200, unit: 'g' },
      { name: 'Pomodorini', amount: 5, unit: '' },
      { name: 'Pecorino', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Pulisci le cozze e aprile a metà salvando la loro acqua.',
      'Affetta le patate sottili.',
      'In una teglia, crea strati di patate, cozze, riso crudo e pomodorini.',
      'Cospargi di pecorino e versa l\'acqua delle cozze filtrata.',
      'Inforna a 180°C per circa 40 minuti finché il riso non è cotto e si crea una crosticina.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-130',
    title: 'Piadina di lenticchie decorticate con stracchino e prosciutto crudo',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Lenticchie decorticate', amount: 100, unit: 'g' },
      { name: 'Acqua', amount: 150, unit: 'ml' },
      { name: 'Stracchino', amount: 50, unit: 'g' },
      { name: 'Prosciutto crudo', amount: 40, unit: 'g' },
      { name: 'Rucola', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Lascia in ammollo le lenticchie decorticate per almeno 2-3 ore.',
      'Frulla le lenticchie con l\'acqua e un pizzico di sale fino a ottenere una pastella liscia.',
      'Versa un mestolo di pastella in una padella antiaderente calda e cuoci come una crêpe su entrambi i lati.',
      'Farcisci con stracchino, prosciutto crudo e rucola fresca.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-131',
    title: 'Pollo al limone',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Petto di pollo a fette', amount: 150, unit: 'g' },
      { name: 'Succo di limone', amount: 1, unit: 'mezzo' },
      { name: 'Fecola di patate o farina di riso', amount: 10, unit: 'g' },
      { name: 'Prezzemolo fresco', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Taglia il pollo a straccetti e infarinali leggermente.',
      'Rosola in padella con un filo d\'olio finché non sono dorati.',
      'Versa il succo di limone e lascia addensare per un minuto creando una cremina.',
      'Guarnisci con prezzemolo fresco tritato.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-132',
    title: 'Spinaci con mozzarella in padella',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Spinaci freschi o surgelati', amount: 250, unit: 'g' },
      { name: 'Mozzarella fior di latte', amount: 100, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Parmigiano Reggiano', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Cuoci gli spinaci in padella con l\'aglio e un filo d\'olio finché appassiti.',
      'Rimuovi l\'aglio e aggiungi la mozzarella tagliata a cubetti.',
      'Copri con un coperchio per un minuto finché la mozzarella non fila.',
      'Spolvera con il parmigiano prima di servire.'
    ],
    proteinType: 'cheese',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-133',
    title: 'Minestrone di verdure e legumi',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Verdure miste (zucchine, carote, sedano, bietole)', amount: 400, unit: 'g' },
      { name: 'Fagioli cannellini prelessati', amount: 100, unit: 'g' },
      { name: 'Patate', amount: 100, unit: 'g' },
      { name: 'Crostini di pane integrale', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Taglia tutte le verdure e le patate a cubetti piccoli.',
      'Metti in una pentola capiente, copri con acqua e cuoci per circa 30-40 minuti.',
      'A metà cottura aggiungi i fagioli.',
      'Servi caldo con un filo d\'olio a crudo e i crostini.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-134',
    title: 'Peperoni imbottiti light',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 50,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Peperoni medi', amount: 2, unit: '' },
      { name: 'Macinato di tacchino', amount: 150, unit: 'g' },
      { name: 'Uovo', amount: 1, unit: 'piccolo' },
      { name: 'Pane grattugiato senza glutine', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Lava i peperoni e taglia la calotta superiore, rimuovendo i semi.',
      'In una ciotola, mescola il macinato con l\'uovo, il pane grattugiato e le spezie.',
      'Riempi i peperoni con il composto.',
      'Cuoci in forno a 180°C per circa 40 minuti finché i peperoni sono teneri.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-135',
    title: 'Calamari imbottiti',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Calamari medi', amount: 300, unit: 'g' },
      { name: 'Pane grattugiato', amount: 30, unit: 'g' },
      { name: 'Capperi e olive nere', amount: 1, unit: 'q.b.' },
      { name: 'Vino bianco', amount: 1, unit: 'spruzzata' }
    ],
    instructions: [
      'Pulisci i calamari e trita i tentacoli.',
      'Salta i tentacoli in padella con capperi e olive, poi mescolali al pane grattugiato.',
      'Farcisci le sacche dei calamari con il composto e chiudi con uno stuzzicadenti.',
      'Cuoci in padella con vino bianco per circa 15-20 minuti.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-136',
    title: 'Melanzane alla parmigiana light',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 60,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Melanzane', amount: 400, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'g' },
      { name: 'Mozzarella light', amount: 100, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Griglia le fette di melanzana sulla piastra.',
      'In una teglia, crea strati di melanzane, pomodoro, mozzarella e parmigiano.',
      'Cuoci in forno a 200°C per circa 20-25 minuti.',
      'Lascia riposare qualche minuto prima di servire.'
    ],
    proteinType: 'cheese',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-137',
    title: 'Spezzatino con patate e piselli',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 60,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Polpa di manzo a cubetti', amount: 150, unit: 'g' },
      { name: 'Patate', amount: 200, unit: 'g' },
      { name: 'Piselli', amount: 100, unit: 'g' },
      { name: 'Brodo vegetale', amount: 300, unit: 'ml' },
      { name: 'Sedano, carota e cipolla', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Rosola il trito di sedano, carota e cipolla con un filo d\'olio.',
      'Aggiungi la carne e sigillala bene su tutti i lati.',
      'Unisci le patate a cubetti e i piselli.',
      'Copri con il brodo e cuoci a fuoco lento per circa 45-60 minuti finché la carne è tenera.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-138',
    title: 'Hamburger di pollo e tacchino',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Macinato di pollo e tacchino', amount: 150, unit: 'g' },
      { name: 'Pane per hamburger integrale', amount: 1, unit: '' },
      { name: 'Insalata e pomodoro', amount: 1, unit: 'q.b.' },
      { name: 'Erbe aromatiche', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Mescola il macinato con le erbe e forma un hamburger.',
      'Cuoci su una piastra ben calda per 4-5 minuti per lato.',
      'Tosta il pane e componi il panino con insalata e pomodoro.',
      'Servi caldo.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-139',
    title: 'Sofficini casalinghi (svuotafrigo)',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Latte', amount: 200, unit: 'ml' },
      { name: 'Farina 00', amount: 200, unit: 'g' },
      { name: 'Burro', amount: 1, unit: 'noce' },
      { name: 'Ripieno (formaggio/prosciutto/verdure)', amount: 100, unit: 'g' },
      { name: 'Uova e pane grattugiato (per impanare)', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Porta il latte a bollore con burro e sale, versa la farina e mescola finché non si stacca dalle pareti.',
      'Lascia raffreddare, stendi la pasta e ricava dei dischi.',
      'Farcisci con quello che hai nel frigo (es. mozzarella e prosciutto) e chiudi a mezzaluna.',
      'Passa nell\'uovo e poi nel pangrattato e cuoci in forno o padella finché dorati.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-140',
    title: 'Gnocchi di fagioli',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 30,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Fagioli cannellini (cotti)', amount: 250, unit: 'g' },
      { name: 'Farina di riso o farina 00', amount: 100, unit: 'g' },
      { name: 'Sale', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Frulla i fagioli cannellini fino a ottenere una purea liscia.',
      'Aggiungi la farina poco alla volta e impasta fino a ottenere un panetto compatto.',
      'Forma dei piccoli cilindri e tagliali a pezzetti per creare gli gnocchi.',
      'Cuocili in acqua bollente salata: sono pronti quando vengono a galla.'
    ],
    seasoningTips: 'Si sposano perfettamente con un sugo fresco di pomodorini e basilico, oppure con una crema di broccoli e un pizzico di peperoncino per una spinta di fibre.',
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-141',
    title: 'Pasta con crema di rucola e mandorle',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: [],
    ingredients: [
      { name: 'Pasta integrale', amount: 80, unit: 'g' },
      { name: 'Rucola fresca', amount: 50, unit: 'g' },
      { name: 'Mandorle pelate', amount: 20, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 10, unit: 'g' },
      { name: 'Olio extravergine d\'oliva', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Lessa la pasta in acqua salata.',
      'Nel frattempo, frulla la rucola con mandorle, parmigiano e olio (aggiungi un cucchiaio di acqua di cottura se necessario).',
      'Scola la pasta e condiscila con la crema di rucola.',
      'Servi con qualche scaglia di mandorla tostata.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-142',
    title: 'Carbonara con zucchine',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Spaghetti', amount: 80, unit: 'g' },
      { name: 'Zucchine', amount: 150, unit: 'g' },
      { name: 'Uova (tuorli)', amount: 2, unit: '' },
      { name: 'Pecorino Romano', amount: 20, unit: 'g' },
      { name: 'Pepe nero', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Taglia le zucchine a rondelle sottili e friggile o rosolale in padella con un filo d\'olio finché dorate e croccanti.',
      'In una ciotola, sbatti i tuorli con il pecorino e abbondante pepe nero fino a ottenere una crema.',
      'Lessa gli spaghetti in acqua salata.',
      'Scola la pasta al dente e versala nella padella con le zucchine (fuoco spento).',
      'Aggiungi la crema di uova e un goccio di acqua di cottura, mescolando vigorosamente per creare un\'emulsione cremosa senza cuocere le uova.'
    ],
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-143',
    title: 'Risotto agli asparagi',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso Arborio o Carnaroli', amount: 320, unit: 'g' },
      { name: 'Asparagi', amount: 500, unit: 'g' },
      { name: 'Brodo vegetale', amount: 1, unit: 'l' },
      { name: 'Scalogno', amount: 1, unit: '' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Pulisci gli asparagi eliminando la parte dura e taglia le punte tenendole da parte.',
      'Taglia i gambi teneri a rondelle e falli rosolare con lo scalogno tritato.',
      'Aggiungi il riso e tostalo per qualche minuto.',
      'Cuoci il risotto aggiungendo il brodo caldo un mestolo alla volta, mescolando spesso.',
      'A metà cottura aggiungi le punte degli asparagi.',
      'A fine cottura, spegni il fuoco e manteca con il parmigiano.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-144',
    title: 'Risotto aglio, olio e prezzemolo',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso originario o Arborio', amount: 320, unit: 'g' },
      { name: 'Aglio', amount: 2, unit: 'spicchi' },
      { name: 'Prezzemolo fresco', amount: 1, unit: 'mazzetto' },
      { name: 'Olio extravergine d\'oliva', amount: 30, unit: 'ml' },
      { name: 'Brodo vegetale', amount: 1, unit: 'l' }
    ],
    instructions: [
      'In una pentola, scalda l\'olio con l\'aglio intero o tritato (secondo i gusti).',
      'Tosta il riso brevemente e inizia a cuocere aggiungendo il brodo caldo.',
      'Pochi minuti prima di fine cottura, aggiungi abbondante prezzemolo tritato.',
      'Manteca con un filo d\'olio a crudo e servi.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-145',
    title: 'Brownies in padella',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 25,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Cioccolato fondente', amount: 100, unit: 'g' },
      { name: 'Burro', amount: 60, unit: 'g' },
      { name: 'Zucchero', amount: 80, unit: 'g' },
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Farina 00', amount: 60, unit: 'g' }
    ],
    instructions: [
      'Sciogli il cioccolato e il burro a bagnomaria o nel microonde.',
      'In una ciotola, mescola uova e zucchero, poi aggiungi il cioccolato fuso.',
      'Unisci la farina setacciata e mescola bene.',
      'Versa il composto in una padella antiaderente imburrata, copri con il coperchio.',
      'Cuoci a fiamma bassissima per circa 15-20 minuti finché la superficie è asciutta ma l\'interno resta morbido.'
    ],
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-146',
    title: 'Fiori di zucca ripieni al forno',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Fiori di zucca', amount: 12, unit: '' },
      { name: 'Ricotta vaccina', amount: 200, unit: 'g' },
      { name: 'Acciughe sott\'olio', amount: 6, unit: 'filetti' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Lava delicatamente i fiori di zucca e rimuovi il pistillo interno.',
      'In una ciotola, mescola la ricotta con il parmigiano e un pizzico di pepe.',
      'Inserisci un pezzetto di acciuga e un cucchiaino di crema di ricotta in ogni fiore.',
      'Adagia i fiori su una teglia con carta forno, spennella con un filo d\'olio e inforna a 200°C per 10-15 minuti.'
    ],
    proteinType: 'cheese',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-147',
    title: 'Carne alla pizzaiola',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Fettine di manzo (scamone o sottofesa)', amount: 150, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 150, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Origano e capperi', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'In una padella, scalda un filo d\'olio con lo spicchio d\'aglio.',
      'Aggiungi la passata di pomodoro, i capperi e l\'origano e cuoci per 5-10 minuti.',
      'Adagia le fettine di carne nel sugo e cuoci per 2-3 minuti per lato (non troppo per evitare che si induriscano).',
      'Servi ben caldo con il suo sughetto.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-148',
    title: 'Lasagna di merluzzo e patate',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 45,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Filetti di merluzzo', amount: 300, unit: 'g' },
      { name: 'Patate grandi', amount: 2, unit: '' },
      { name: 'Pomodorini', amount: 10, unit: '' },
      { name: 'Olive taggiasche', amount: 20, unit: 'g' },
      { name: 'Pangrattato (senza glutine se necessario)', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Pela le patate e tagliale a fette sottilissime (usa una mandolina se possibile).',
      'In una teglia oliata, crea uno strato di patate, poi uno di merluzzo, pomodorini a metà e olive.',
      'Ripeti gli strati finendo con le patate.',
      'Cospargi con pangrattato, un filo d\'olio e inforna a 180°C per circa 30-35 minuti fino a doratura.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-149',
    title: 'Tofu croccante alle erbe',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Tofu al naturale', amount: 200, unit: 'g' },
      { name: 'Salsa di soia', amount: 1, unit: 'cucchiaio' },
      { name: 'Fecola di patate', amount: 20, unit: 'g' },
      { name: 'Rosmarino e timo', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Taglia il tofu a cubetti e tamponalo bene con carta assorbente.',
      'In una ciotola, marina il tofu con salsa di soia e una goccia d\'olio.',
      'Passa i cubetti nella fecola di patate mescolata alle erbe tritate.',
      'Cuoci in padella antiaderente con un filo d\'olio finché tutti i lati non sono dorati e croccanti.'
    ],
    proteinType: 'veg',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-150',
    title: 'Tofu strapazzato con verdure',
    category: 'breakfast',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Tofu vellutato o normale', amount: 200, unit: 'g' },
      { name: 'Zucchine o peperoni', amount: 100, unit: 'g' },
      { name: 'Curcuma', amount: 1, unit: 'pizzico' },
      { name: 'Pane integrale (fetta)', amount: 1, unit: '' }
    ],
    instructions: [
      'Taglia le verdure a cubetti piccoli e salta in padella finché tenere.',
      'Schiaccia il tofu con una forchetta direttamente in padella.',
      'Aggiungi la curcuma (per il colore giallo e sapore) e spadella per 5 minuti.',
      'Servi caldo accompagnato da una fetta di pane tostato.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-151',
    title: 'Dahl di lenticchie rosse',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Lenticchie rosse decorticate', amount: 150, unit: 'g' },
      { name: 'Latte di cocco light', amount: 200, unit: 'ml' },
      { name: 'Curcuma e Zenzero', amount: 1, unit: 'q.b.' },
      { name: 'Riso basmati', amount: 60, unit: 'g' }
    ],
    instructions: [
      'Sciacqua le lenticchie e mettile in una pentola con il latte di cocco e un pizzico di spezie.',
      'Aggiungi acqua fino a coprire e cuoci per 15-20 minuti finché non diventano una crema.',
      'Nel frattempo, bolli il riso basmati.',
      'Servi il dahl caldo accompagnato dal riso.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-152',
    title: 'Burger di ceci e carote',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Ceci cotti', amount: 240, unit: 'g' },
      { name: 'Carote grattugiate', amount: 100, unit: 'g' },
      { name: 'Pangrattato integrale', amount: 30, unit: 'g' },
      { name: 'Cipolla rossa', amount: 0.5, unit: '' }
    ],
    instructions: [
      'Frulla i ceci grossolanamente insieme alla cipolla.',
      'In una ciotola, unisci i ceci, le carote grattugiate e il pangrattato.',
      'Forma dei burger con le mani.',
      'Cuoci in padella antiaderente con un filo d\'olio per 5 minuti per lato.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-153',
    title: 'Pasta integrale con crema di peperoni e noci',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 20,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Pasta integrale', amount: 80, unit: 'g' },
      { name: 'Peperoni arrostiti', amount: 150, unit: 'g' },
      { name: 'Gherigli di noci', amount: 20, unit: 'g' },
      { name: 'Lievito alimentare in scaglie', amount: 1, unit: 'cucchiaio' }
    ],
    instructions: [
      'Frulla i peperoni con le noci e il lievito alimentare fino a ottenere una crema liscia.',
      'Cuoci la pasta in acqua salata.',
      'Scola la pasta e condiscila con la crema di peperoni.',
      'Guarnisci con qualche noce tritata.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-154',
    title: 'Farifrittata con zucchine',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 30,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Farina di ceci', amount: 100, unit: 'g' },
      { name: 'Acqua', amount: 250, unit: 'ml' },
      { name: 'Zucchine', amount: 200, unit: 'g' },
      { name: 'Menta fresca', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Prepara una pastella mescolando farina di ceci e acqua, lasciandola riposare almeno 30 minuti.',
      'Taglia le zucchine a rondelle e saltale in padella.',
      'Aggiungi le zucchine alla pastella con la menta trita.',
      'Versa il composto in una padella calda e cuoci come una normale frittata su entrambi i lati.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-155',
    title: 'Insalata di quinoa mediterranea',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Quinoa', amount: 70, unit: 'g' },
      { name: 'Cetrioli', amount: 100, unit: 'g' },
      { name: 'Pomodorini', amount: 100, unit: 'g' },
      { name: 'Olive nere', amount: 1, unit: 'manciata' },
      { name: 'Avocado', amount: 0.5, unit: '' }
    ],
    instructions: [
      'Lava e cuoci la quinoa seguendo le istruzioni sulla confezione.',
      'Taglia verdure e avocado a cubetti.',
      'Una volta fredda, mescola la quinoa con le verdure e l\'avocado.',
      'Condisci con limone e un filo d\'olio.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-156',
    title: 'Rustichella senza glutine',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 35,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Pasta sfoglia senza glutine', amount: 1, unit: 'rotolo' },
      { name: 'Prosciutto cotto', amount: 100, unit: 'g' },
      { name: 'Provola o mozzarella', amount: 150, unit: 'g' },
      { name: 'Pomodori pelati', amount: 3, unit: 'cucchiai' }
    ],
    instructions: [
      'Stendi la pasta sfoglia senza glutine.',
      'Farcisci una metà con il pomodoro, il prosciutto e la provola a fette.',
      'Richiudi con l\'altra metà sigillando bene i bordi.',
      'Spennella con un po\' di latte o uovo e inforna a 200°C per circa 20-25 minuti finché dorata.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-157',
    title: 'Cheesecake senza glutine',
    category: 'dessert',
    difficulty: 'medium',
    timeMin: 40,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Biscotti secchi senza glutine', amount: 200, unit: 'g' },
      { name: 'Burro fuso', amount: 80, unit: 'g' },
      { name: 'Formaggio spalmabile', amount: 500, unit: 'g' },
      { name: 'Zucchero a velo', amount: 100, unit: 'g' },
      { name: 'Panna da montare', amount: 200, unit: 'ml' }
    ],
    instructions: [
      'Trita i biscotti senza glutine e mescolali con il burro fuso, poi pressali sul fondo di una tortiera.',
      'Lascia riposare in frigo per 30 minuti.',
      'Mescola il formaggio spalmabile con lo zucchero e aggiungi delicatamente la panna montata.',
      'Versa la crema sulla base e lascia in frigo per almeno 4 ore.',
      'Guarnisci con marmellata o frutta fresca prima di servire.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-158',
    title: 'Pancake alle mele senza glutine',
    category: 'breakfast',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Farina di riso', amount: 120, unit: 'g' },
      { name: 'Mela', amount: 1, unit: '' },
      { name: 'Uovo', amount: 1, unit: '' },
      { name: 'Latte vegetale (riso o mandorla)', amount: 150, unit: 'ml' },
      { name: 'Lievito per dolci', amount: 1, unit: 'cucchiaino' },
      { name: 'Cannella', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Grattugia la mela finemente.',
      'In una ciotola, sbatti l\'uovo con il latte vegetale.',
      'Aggiungi la farina di riso, il lievito e la cannella, mescolando bene per evitare grumi.',
      'Unisci la mela grattugiata al composto.',
      'Cuoci a cucchiaiate in una padella antiaderente calda (circa 2 minuti per lato).'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-159',
    title: 'Crocchette di zucca senza glutine',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 35,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Polpa di zucca cotta', amount: 400, unit: 'g' },
      { name: 'Patate lesse', amount: 200, unit: 'g' },
      { name: 'Farina di riso', amount: 50, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' },
      { name: 'Pangrattato senza glutine', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Schiaccia la zucca e le patate in una ciotola.',
      'Aggiungi il parmigiano, la farina di riso e un pizzico di noce moscata.',
      'Forma delle piccole crocchette con le mani inumidite.',
      'Passa le crocchette nel pangrattato senza glutine.',
      'Adagiale su una teglia con carta forno e cuoci a 200°C per 20 minuti finché dorate.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-160',
    title: 'Mozzarella in carrozza',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Pane in cassetta', amount: 8, unit: 'fette' },
      { name: 'Mozzarella', amount: 250, unit: 'g' },
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Latte', amount: 50, unit: 'ml' },
      { name: 'Farina 00', amount: 1, unit: 'q.b.' },
      { name: 'Pangrattato', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Taglia la mozzarella a fette e asciugala bene.',
      'Metti una fetta di mozzarella tra due fette di pane.',
      'Passa i sandwich prima nella farina (anche i bordi), poi nell\'uovo sbattuto con il latte e infine nel pangrattato.',
      'Friggi in abbondante olio caldo finché dorati su entrambi i lati.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-161',
    title: 'Mozzarella in carrozza senza glutine',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Panbauletto senza glutine', amount: 8, unit: 'fette' },
      { name: 'Mozzarella', amount: 250, unit: 'g' },
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Latte (senza lattosio se necessario)', amount: 50, unit: 'ml' },
      { name: 'Farina di riso', amount: 1, unit: 'q.b.' },
      { name: 'Pangrattato senza glutine', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Taglia la mozzarella a fette e asciugala bene.',
      'Metti la mozzarella tra due fette di panbauletto senza glutine.',
      'Sigilla i bordi passando i sandwich nella farina di riso, poi nell\'uovo sbattuto con il latte e infine nel pangrattato senza glutine.',
      'Cuoci in padella con un filo d\'olio o al forno a 200°C per 15 minuti per una versione più leggera.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-162',
    title: 'Pane di riso fatto in casa',
    category: 'side',
    difficulty: 'medium',
    timeMin: 90,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free', 'vegan'],
    ingredients: [
      { name: 'Farina di riso', amount: 300, unit: 'g' },
      { name: 'Fecola di patate', amount: 50, unit: 'g' },
      { name: 'Acqua tiepida', amount: 280, unit: 'ml' },
      { name: 'Lievito di birra secco', amount: 7, unit: 'g' },
      { name: 'Olio extravergine d\'oliva', amount: 20, unit: 'ml' },
      { name: 'Sale', amount: 1, unit: 'cucchiaino' }
    ],
    instructions: [
      'In una ciotola, mescola la farina di riso e la fecola.',
      'Sciogli il lievito nell\'acqua tiepida.',
      'Unisci i liquidi alle farine, aggiungi l\'olio e il sale, e impasta bene.',
      'Versa l\'impasto (che sarà piuttosto morbido) in uno stampo da plumcake oliato.',
      'Lascia lievitare in un luogo tiepido per circa 1 ora.',
      'Inforna a 200°C per 35-40 minuti fino a doratura.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-163',
    title: 'Cotoletta di zucchine',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Zucchine grandi', amount: 2, unit: '' },
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Pangrattato', amount: 100, unit: 'g' },
      { name: 'Farina 00', amount: 50, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' },
      { name: 'Sale e Pepe', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Taglia le zucchine a fette spesse circa mezzo centimetro nel senso della lunghezza.',
      'Passa ogni fetta prima nella farina, poi nell\'uovo sbattuto con sale e pepe, e infine nel pangrattato mescolato al parmigiano.',
      'Premi bene la panatura per farla aderire.',
      'Cuoci in padella con un filo d\'olio per 3-4 minuti per lato finché non sono ben dorate, oppure in forno a 200°C per 15-20 minuti.'
    ],
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-164',
    title: 'Torta salata croccante con pasta kataifi',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 35,
    season: 'all',
    isWHOCompliant: false,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta kataifi (o pasta fillo)', amount: 200, unit: 'g' },
      { name: 'Mozzarella', amount: 1, unit: '' },
      { name: 'Feta', amount: 100, unit: 'g' },
      { name: 'Grana grattugiato', amount: 30, unit: 'g' },
      { name: 'Uovo', amount: 1, unit: '' },
      { name: 'Latte', amount: 100, unit: 'ml' },
      { name: 'Burro', amount: 20, unit: 'g' },
      { name: 'Sale e pepe', amount: 1, unit: 'q.b.' }
    ],
    instructions: [
      'Sistemate metà della pasta kataifi sul fondo di una teglia oliata.',
      'Aggiungete la mozzarella a pezzetti, la feta sbriciolata e una manciata di grana grattugiato.',
      'Coprite il tutto con la restante pasta kataifi.',
      'In una ciotola, sbattete l\'uovo con il latte, il sale e il pepe, poi versate il composto uniformemente sulla torta.',
      'Aggiungete qualche ciuffetto di burro in superficie.',
      'Cuocete in forno preriscaldato a 190°C finché la superficie non risulta super dorata e croccante (circa 20-25 minuti).'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-165',
    title: 'Spaghetti di riso con verdure',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Spaghetti di riso', amount: 120, unit: 'g' },
      { name: 'Carote', amount: 1, unit: '' },
      { name: 'Zucchine', amount: 1, unit: '' },
      { name: 'Peperoni', amount: 0.5, unit: '' },
      { name: 'Salsa di soia (senza glutine)', amount: 2, unit: 'cucchiai' },
      { name: 'Zenzero fresco', amount: 1, unit: 'pezzetto' }
    ],
    instructions: [
      'Taglia le verdure a listarelle sottili.',
      'Salta le verdure in un wok con un filo d\'olio e lo zenzero grattugiato per circa 10 minuti.',
      'Cuoci gli spaghetti di riso seguendo le istruzioni sulla confezione.',
      'Scola gli spaghetti e saltali insieme alle verdure aggiungendo la salsa di soia.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-166',
    title: 'Insalata di arance e finocchi',
    category: 'side',
    difficulty: 'easy',
    timeMin: 15,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Arance', amount: 2, unit: '' },
      { name: 'Finocchi', amount: 1, unit: '' },
      { name: 'Olive nere', amount: 1, unit: 'manciata' },
      { name: 'Olio extravergine d\'oliva', amount: 1, unit: 'filo' }
    ],
    instructions: [
      'Pela le arance a vivo e tagliale a fette sottili.',
      'Affetta il finocchio molto sottilmente usando una mandolina se possibile.',
      'Unisci arance, finocchio e olive in una ciotola.',
      'Condisci con sale, pepe e olio EVO.'
    ],
    proteinType: 'veg',
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-167',
    title: 'Cavoletti di Bruxelles arrosto',
    category: 'side',
    difficulty: 'easy',
    timeMin: 25,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Cavoletti di Bruxelles', amount: 300, unit: 'g' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale e pepe', amount: 1, unit: 'q.b.' },
      { name: 'Aceto balsamico', amount: 1, unit: 'cucchiaio' }
    ],
    instructions: [
      'Pulisci i cavoletti e tagliali a metà.',
      'Condiscili in una ciotola con olio, sale e pepe.',
      'Disponili su una teglia e inforna a 200°C per circa 20 minuti.',
      'Sforna e aggiungi un filo di aceto balsamico prima di servire.'
    ],
    proteinType: 'veg',
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-168',
    title: 'Insalata di cavolo cappuccio',
    category: 'side',
    difficulty: 'easy',
    timeMin: 10,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Cavolo cappuccio', amount: 200, unit: 'g' },
      { name: 'Carote', amount: 1, unit: '' },
      { name: 'Aceto di mele', amount: 1, unit: 'cucchiaio' },
      { name: 'Semi di cumino (opzionale)', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Affetta il cavolo cappuccio molto finemente.',
      'Grattugia la carota con una grattugia a fori larghi.',
      'Mescola il tutto in una ciotola e condisci con olio, sale e aceto di mele.'
    ],
    proteinType: 'veg',
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-169',
    title: 'Polpette di patate dolci',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    servings: 2,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegetarian'],
    ingredients: [
      { name: 'Patate dolci', amount: 400, unit: 'g' },
      { name: 'Farina di ceci', amount: 50, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' },
      { name: 'Prezzemolo', amount: 1, unit: 'ciuffetto' }
    ],
    instructions: [
      'Cuoci le patate dolci al vapore o al forno e schiacciale con una forchetta.',
      'Aggiungi la farina di ceci, il parmigiano e il prezzemolo tritato.',
      'Forma delle palline e schiacciale leggermente.',
      'Cuoci in forno a 200°C per 15-20 minuti finché non sono croccanti all\'esterno.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-170',
    title: 'Pasta di piselli con panna e prosciutto',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Pasta di piselli', amount: 80, unit: 'g' },
      { name: 'Panna da cucina', amount: 100, unit: 'ml' },
      { name: 'Prosciutto cotto a cubetti', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Cuoci la pasta di piselli in abbondante acqua salata.',
      'In una padella, scalda la panna con i cubetti di prosciutto.',
      'Scola la pasta e saltala nel condimento per un paio di minuti.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-171',
    title: 'Spaghetti di lenticchie rosse con scarole e capperi',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Spaghetti di lenticchie rosse', amount: 80, unit: 'g' },
      { name: 'Scarola', amount: 200, unit: 'g' },
      { name: 'Capperi sotto sale', amount: 1, unit: 'cucchiaio' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Olio extravergine d\'oliva', amount: 1, unit: 'cucchiaio' }
    ],
    instructions: [
      'Lava bene la scarola e tagliala a pezzi.',
      'In una padella, scalda l\'olio con l\'aglio e i capperi dissalati.',
      'Aggiungi la scarola e cuoci con il coperchio per circa 10 minuti finché non appassisce.',
      'Cuoci gli spaghetti di lenticchie in acqua salata, scolali e saltali in padella con la verdura.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-172',
    title: 'Pad Thai vegan',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 25,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Tagliatelle di riso', amount: 100, unit: 'g' },
      { name: 'Tofu compatto', amount: 100, unit: 'g' },
      { name: 'Germogli di soia', amount: 50, unit: 'g' },
      { name: 'Carote', amount: 1, unit: '' },
      { name: 'Arachidi tostate', amount: 20, unit: 'g' },
      { name: 'Salsa di soia (tamari)', amount: 2, unit: 'cucchiai' },
      { name: 'Lime', amount: 0.5, unit: '' }
    ],
    instructions: [
      'Metti le tagliatelle di riso in ammollo in acqua calda per 10 minuti.',
      'Taglia il tofu a cubetti e saltalo in padella con un filo d\'olio finché non è dorato.',
      'Aggiungi le carote tagliate a fiammifero e i germogli di soia.',
      'Scola le tagliatelle e aggiungile in padella insieme alla salsa di soia.',
      'Salta tutto a fuoco vivo per 2-3 minuti, poi servi con succo di lime e arachidi tritate.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-173',
    title: 'Pasta alla gonzaga',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Pasta (tipo maccheroni)', amount: 80, unit: 'g' },
      { name: 'Salsiccia', amount: 80, unit: 'g' },
      { name: 'Panna da cucina', amount: 50, unit: 'ml' },
      { name: 'Parmigiano Reggiano', amount: 20, unit: 'g' },
      { name: 'Zafferano', amount: 1, unit: 'bustina' }
    ],
    instructions: [
      'Sgrana la salsiccia e rosolala in una padella senza aggiungere grassi.',
      'Sciogli lo zafferano nella panna e aggiungila alla salsiccia una volta cotta.',
      'Cuoci la pasta in acqua bollente salata.',
      'Scola la pasta al dente e saltala nella padella con il condimento cremoso.',
      'Manteca con abbondante parmigiano grattugiato prima di servire.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-174',
    title: 'Risotto al radicchio e nocciole',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 160, unit: 'g' },
      { name: 'Radicchio rosso', amount: 200, unit: 'g' },
      { name: 'Nocciole tostate', amount: 30, unit: 'g' },
      { name: 'Brodo vegetale', amount: 800, unit: 'ml' },
      { name: 'Scalogno', amount: 1, unit: '' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Trita lo scalogno e fallo appassire in pentola con un filo d\'olio.',
      'Aggiungi il riso e tostalo per un paio di minuti.',
      'Sfuma con un po\' di brodo e inizia la cottura aggiungendo brodo man mano.',
      'A metà cottura, unisci il radicchio tagliato a striscioline.',
      'A fine cottura, spegni il fuoco e manteca con il parmigiano.',
      'Servi guarnendo con le nocciole tostate tritate grossolanamente.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-175',
    title: 'Spaghetti alla zucca, spinaci e noci',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Spaghetti', amount: 160, unit: 'g' },
      { name: 'Zucca pulita', amount: 250, unit: 'g' },
      { name: 'Spinaci freschi', amount: 100, unit: 'g' },
      { name: 'Gherigli di noci', amount: 30, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Pecorino grattugiato', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Taglia la zucca a piccoli cubetti e cuocila in padella con aglio e olio finché non è tenera (circa 10-12 min).',
      'Verso fine cottura della zucca, aggiungi gli spinaci e falli appassire.',
      'Nel frattempo cuoci gli spaghetti in acqua salata.',
      'Scola la pasta e saltala in padella con le verdure.',
      'Aggiungi le noci tritate e completa con il pecorino prima di servire.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-176',
    title: 'Lasagne di pane carasau spinaci e carciofi',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    servings: 2,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pane carasau', amount: 150, unit: 'g' },
      { name: 'Spinaci freschi', amount: 300, unit: 'g' },
      { name: 'Carciofi puliti', amount: 4, unit: '' },
      { name: 'Ricotta vaccina', amount: 250, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 50, unit: 'g' },
      { name: 'Latte', amount: 100, unit: 'ml' }
    ],
    instructions: [
      'Pulisci i carciofi, tagliali a fettine sottili e saltali in padella con olio e aglio finché sono teneri.',
      'Sbollenta gli spinaci, strizzali bene e tritali.',
      'In una ciotola, mescola la ricotta con un po\' di latte per renderla cremosa, aggiungi sale e pepe.',
      'In una pirofila, alterna strati di pane carasau (bagnato velocemente in acqua o brodo tiepido), crema di ricotta, carciofi, spinaci e parmigiano.',
      'Termina con abbondante parmigiano e un filo d\'olio.',
      'Inforna a 200°C per circa 15-20 minuti finché non si forma una bella crosticina.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-177',
    title: 'Ravioli doppi paglia e fieno',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 90,
    season: 'all',
    isWHOCompliant: false,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Farina 00', amount: 300, unit: 'g' },
      { name: 'Uova', amount: 3, unit: '' },
      { name: 'Spinaci lessati e strizzati (per la pasta)', amount: 50, unit: 'g' },
      { name: 'Ricotta', amount: 200, unit: 'g' },
      { name: 'Spinaci (per il ripieno)', amount: 100, unit: 'g' },
      { name: 'Burro', amount: 30, unit: 'g' },
      { name: 'Salvia', amount: 4, unit: 'foglie' }
    ],
    instructions: [
      'Prepara due panetti di pasta fresca: uno giallo (farina e uova) e uno verde (farina, uova e spinaci frullati).',
      'Lascia riposare i panetti per 30 minuti.',
      'Prepara il ripieno mescolando ricotta, spinaci tritati, sale e noce moscata.',
      'Stendi le sfoglie molto sottili.',
      'Crea dei ravioli accostando strisce di pasta gialla e verde, sigillandole con un po\' d\'acqua.',
      'Distribuisci il ripieno e chiudi i ravioli nella forma desiderata.',
      'Cuoci in acqua bollente salata e condisci con burro fuso e salvia.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-178',
    title: 'Gnocchi di barbabietola vegani',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 45,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Barbabietola precotta', amount: 250, unit: 'g' },
      { name: 'Farina 0', amount: 300, unit: 'g' },
      { name: 'Spinacini freschi', amount: 100, unit: 'g' },
      { name: 'Crema di mandorle (senza zucchero)', amount: 2, unit: 'cucchiai' },
      { name: 'Mandorle a lamelle', amount: 10, unit: 'g' },
      { name: 'Aceto balsamico', amount: 1, unit: 'filo' }
    ],
    instructions: [
      'Frulla la barbabietola fino a ridurla in purea.',
      'Aggiungi la farina poco alla volta alla purea di barbabietola e impasta fino a ottenere un panetto morbido ma non appiccicoso.',
      'Forma dei cordoncini di pasta e tagliali per formare gli gnocchi.',
      'Cuoci gli gnocchi in acqua bollente salata finché non salgono a galla.',
      'Nel frattempo, salta gli spinacini in padella con un filo d\'olio.',
      'Scola gli gnocchi e saltali con gli spinacini. Servi con una goccia di crema di mandorle, lamelle di mandorle e un filo di aceto balsamico.'
    ],
    seasoningTips: 'Ottimi con una crema leggera di formaggio caprino e granella di noci, o semplicemente con olio EVO a crudo e scorza di limone per esaltare la dolcezza della barbabietola.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-179',
    title: 'Tagliatelle con hummus, zucca e carote',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Tagliatelle di semola', amount: 160, unit: 'g' },
      { name: 'Zucca pulita', amount: 200, unit: 'g' },
      { name: 'Carote', amount: 2, unit: '' },
      { name: 'Ceci precotti', amount: 100, unit: 'g' },
      { name: 'Erbe aromatiche (timo, rosmarino)', amount: 1, unit: 'pizzico' },
      { name: 'Tahin (opzionale)', amount: 1, unit: 'cucchiaino' }
    ],
    instructions: [
      'Taglia la zucca e le carote a cubetti e cuocile al vapore o in padella finché non sono morbide.',
      'Frulla i ceci con le erbe aromatiche, un po\' d\'acqua di cottura, il tahin e un pizzico di sale per ottenere un hummus fluido.',
      'Cuoci le tagliatelle e scolatele al dente, tenendo un po\' di acqua di cottura.',
      'Mantecate la pasta con la crema di ceci e unite i cubetti di zucca e carote.',
      'Se necessario, aggiungete acqua di cottura per rendere tutto più cremoso.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-180',
    title: 'Spiedini di gnocchi in friggitrice ad aria',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Gnocchi di patate (freschi)', amount: 250, unit: 'g' },
      { name: 'Pomodorini', amount: 10, unit: '' },
      { name: 'Mozzarelline', amount: 10, unit: '' },
      { name: 'Olio extravergine d\'oliva (spray)', amount: 1, unit: 'spruzzata' },
      { name: 'Origano secco', amount: 1, unit: 'spolverata' }
    ],
    instructions: [
      'Infila gli gnocchi (crudi), i pomodorini e le mozzarelline negli spiedini di legno alternandoli.',
      'Spruzza leggermente con olio EVO e cospargi con origano e un pizzico di sale.',
      'Metti nella friggitrice ad aria a 200°C per circa 8-10 minuti, girandoli a metà cottura.',
      'Servi quando gli gnocchi sono croccanti e la mozzarella è filante.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-181',
    title: 'Spaghetti ai 5 cereali con pesto di cavolo viola',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Spaghetti ai 5 cereali', amount: 160, unit: 'g' },
      { name: 'Cavolo cappuccio viola', amount: 80, unit: 'g' },
      { name: 'Nocciole', amount: 15, unit: 'g' },
      { name: 'Pinoli', amount: 10, unit: 'g' },
      { name: 'Rosmarino tritato', amount: 0.5, unit: 'cucchiaio' },
      { name: 'Olio extravergine d\'oliva', amount: 30, unit: 'g' },
      { name: 'Succo di limone', amount: 1, unit: 'cucchiaio' },
      { name: 'Basilico fresco', amount: 2, unit: 'foglie' },
      { name: 'Pane integrale (mollica)', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Taglia il cavolo viola a pezzetti e mettilo in un mixer.',
      'Aggiungi le nocciole, i pinoli, il rosmarino, l\'olio, il succo di limone, il basilico e la mollica di pane integrale.',
      'Frulla il tutto fino a ottenere un pesto cremoso (se necessario aggiungi un cucchiaio di acqua tiepida).',
      'Cuoci gli spaghetti ai 5 cereali in abbondante acqua salata.',
      'Scola la pasta al dente e condiscila con il pesto di cavolo viola, aggiungendo un mestolo di acqua di cottura per amalgamare bene.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-182',
    title: 'Lasagne di pane carasau alla zucca e besciamella di cannellini',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    servings: 2,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Pane carasau', amount: 150, unit: 'g' },
      { name: 'Zucca cotta al forno', amount: 300, unit: 'g' },
      { name: 'Fagioli cannellini precotti', amount: 240, unit: 'g' },
      { name: 'Latte di soia (non zuccherato)', amount: 100, unit: 'ml' },
      { name: 'Lievito alimentare in scaglie', amount: 2, unit: 'cucchiai' },
      { name: 'Noce moscata', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Frulla i cannellini con il latte di soia, sale, pepe e noce moscata fino a ottenere una besciamella densa.',
      'Schiaccia la zucca con una forchetta creando una purea.',
      'In una pirofila, alterna strati di pane carasau (bagnato leggermente), besciamella di cannellini e purea di zucca.',
      'Sull\'ultimo strato aggiungi abbondante lievito alimentare.',
      'Inforna a 200°C per circa 15-20 minuti finché non è ben gratinata.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-183',
    title: 'Riso alle carote con miso e sesamo',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Riso Basmati o Integrale', amount: 160, unit: 'g' },
      { name: 'Carote', amount: 2, unit: '' },
      { name: 'Miso bianco o scuro', amount: 1, unit: 'cucchiaino' },
      { name: 'Semi di sesamo', amount: 1, unit: 'cucchiaio' },
      { name: 'Olio di sesamo o EVO', amount: 1, unit: 'cucchiaio' }
    ],
    instructions: [
      'Lessa il riso in acqua salata.',
      'Nel frattempo, grattugia le carote a fori larghi e saltale in padella con un filo d\'olio per 5 minuti.',
      'Sciogli il miso in un cucchiaio d\'acqua di cottura del riso.',
      'Scola il riso e saltalo in padella con le carote.',
      'Spegni il fuoco, aggiungi il miso sciolto e mescola bene.',
      'Servi con una pioggia di semi di sesamo tostate.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-184',
    title: 'Pappardelle con ragù bianco di carciofi e carote',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 30,
    servings: 2,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pappardelle all\'uovo', amount: 160, unit: 'g' },
      { name: 'Carciofi', amount: 3, unit: '' },
      { name: 'Carote', amount: 2, unit: '' },
      { name: 'Scalogno', amount: 1, unit: '' },
      { name: 'Brodo vegetale', amount: 100, unit: 'ml' },
      { name: 'Parmigiano Reggiano', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Pulisci i carciofi e tagliali a cubetti molto piccoli (punta di coltello).',
      'Trita finemente le carote e lo scalogno.',
      'Soffriggi lo scalogno, aggiungi carote e carciofi e cuoci a fuoco vivo per 5 minuti.',
      'Sfuma con il brodo e continua la cottura per altri 10-15 minuti finché le verdure sono tenere.',
      'Cuoci le pappardelle, scolatele e saltatele nel ragù vegetale aggiungendo parmigiano e un po\' di acqua di cottura.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-185',
    title: 'Frittata senza uova (Farifrittata)',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Farina di ceci', amount: 100, unit: 'g' },
      { name: 'Acqua', amount: 200, unit: 'ml' },
      { name: 'Zucchine', amount: 2, unit: '' },
      { name: 'Cipolla', amount: 0.5, unit: '' },
      { name: 'Curcuma', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Mescola la farina di ceci con l\'acqua e la curcuma, eliminando i grumi. Lascia riposare almeno 30 minuti (opzionale).',
      'Taglia le zucchine a rondelle e la cipolla fine, poi saltale in padella con olio finché sono dorate.',
      'Versa la pastella di ceci sulle verdure in padella.',
      'Cuoci con il coperchio a fuoco medio-basso per 10 minuti, poi girala e cuoci altri 5 minuti senza coperchio.'
    ],
    proteinType: 'legumes',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-186',
    title: 'Riso cantonese',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso Basmati o Thai già cotto', amount: 250, unit: 'g' },
      { name: 'Piselli fini', amount: 100, unit: 'g' },
      { name: 'Prosciutto cotto a cubetti', amount: 80, unit: 'g' },
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Salsa di soia', amount: 2, unit: 'cucchiai' }
    ],
    instructions: [
      'In un wok o padella grande, prepara una frittatina sottile con le uova, tagliala a pezzetti e tienila da parte.',
      'Salta i piselli (anche surgelati) con un filo d\'olio per qualche minuto.',
      'Aggiungi il prosciutto cotto e il riso già cotto.',
      'Salta tutto a fuoco vivace, unisci l\'uovo e la salsa di soia e continua a saltare per 2-3 minuti.'
    ],
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-187',
    title: 'Riso cantonese vegano',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Riso Basmati o Thai già cotto', amount: 250, unit: 'g' },
      { name: 'Piselli fini', amount: 100, unit: 'g' },
      { name: 'Tofu affumicato a cubetti', amount: 80, unit: 'g' },
      { name: 'Mais dolce', amount: 50, unit: 'g' },
      { name: 'Salsa di soia (tamari)', amount: 2, unit: 'cucchiai' }
    ],
    instructions: [
      'Taglia il tofu affumicato a piccoli cubetti.',
      'In un wok, scalda un filo d\'olio e rosola il tofu finché non è croccante.',
      'Aggiungi i piselli e il mais e cuoci per 5 minuti.',
      'Unisci il riso già cotto e la salsa di soia.',
      'Salta a fuoco alto per qualche minuto finché tutto è ben amalgamato.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-188',
    title: 'Fusilli con sugo rosso ai broccoli e cavolini',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Fusilli integrali', amount: 160, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'ml' },
      { name: 'Broccoli', amount: 200, unit: 'g' },
      { name: 'Cavolini di Bruxelles', amount: 100, unit: 'g' },
      { name: 'Pinoli', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Dividi il broccolo in piccole cimette e taglia i cavolini a metà.',
      'Sbollenta le verdure in acqua salata per 5 minuti, poi scolatele.',
      'In una padella, scalda la passata di pomodoro con uno spicchio d\'aglio.',
      'Aggiungi le verdure e i pinoli alla salsa e lascia insaporire.',
      'Cuoci la pasta, scolatele e saltatela nel sugo rosso alle crucifere.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-189',
    title: 'Risotto vegano con cavolfiore e curcuma',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    servings: 2,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Riso per risotti (Vialone Nano)', amount: 160, unit: 'g' },
      { name: 'Cavolfiore bianco', amount: 250, unit: 'g' },
      { name: 'Curcuma in polvere', amount: 1, unit: 'cucchiaino' },
      { name: 'Brodo vegetale', amount: 800, unit: 'ml' },
      { name: 'Scaglie di mandorle', amount: 20, unit: 'g' },
      { name: 'Lievito alimentare in scaglie', amount: 1, unit: 'cucchiaio' }
    ],
    instructions: [
      'Frulla metà del cavolfiore a crudo con un po\' di brodo per ottenere una crema.',
      'Tosta il riso in pentola senza grassi, poi inizia ad aggiungere il brodo bollente.',
      'A metà cottura, aggiungi le restanti cimette di cavolfiore intere e la crema preparata.',
      'Unisci la curcuma sciolta in poco brodo.',
      'A cottura ultimata, manteca con il lievito alimentare e servi con le scaglie di mandorle tostate.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-190',
    title: 'Pasta al forno con cavolfiori e besciamella alla zucca',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 50,
    servings: 4,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta corta (Penne o Sedani)', amount: 320, unit: 'g' },
      { name: 'Cavolfiore', amount: 400, unit: 'g' },
      { name: 'Zucca cotta', amount: 200, unit: 'g' },
      { name: 'Latte', amount: 300, unit: 'ml' },
      { name: 'Farina', amount: 30, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 40, unit: 'g' },
      { name: 'Olive taggiasche', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Prepara una besciamella leggera con latte e farina, poi frullala insieme alla zucca cotta per ottenere una crema arancione.',
      'Sbollenta le cimette di cavolfiore per 5 minuti.',
      'Cuoci la pasta molto al dente.',
      'In una teglia, mescola la pasta con i cavolfiori, le olive e la besciamella alla zucca.',
      'Copri con parmigiano e inforna a 200°C per 20 minuti.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-191',
    title: 'Penne di lenticchie con cavolo nero e mandorle',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Penne di lenticchie rosse', amount: 160, unit: 'g' },
      { name: 'Cavolo nero', amount: 200, unit: 'g' },
      { name: 'Crema di mandorle bianche', amount: 1, unit: 'cucchiaio' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Mandorle a lamelle', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Pulisci il cavolo nero eliminando la costa centrale e taglia le foglie a striscioline.',
      'Lessa il cavolo in acqua bollente salata per 5 minuti.',
      'Nella stessa acqua, cuoci le penne di lenticchie rosse.',
      'Nel frattempo, in una padella scalda un filo d\'olio con l\'aglio e il peperoncino.',
      'Scola pasta e cavolo e saltali in padella con la crema di mandorle sciolta in un po\' di acqua di cottura.',
      'Servi con le mandorle a lamelle tostate.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-192',
    title: 'Penne di lenticchie con cime di rapa e pomodori secchi',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Penne di lenticchie rosse', amount: 160, unit: 'g' },
      { name: 'Cime di rapa pulite', amount: 300, unit: 'g' },
      { name: 'Pomodori secchi sott\'olio', amount: 4, unit: 'pezzi' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Peperoncino', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Lessa le cime di rapa in acqua salata per circa 5-7 minuti.',
      'Nella stessa pentola, aggiungi la pasta e portala a cottura.',
      'Taglia i pomodori secchi a listarelle.',
      'In una padella capiente, soffriggi l\'aglio e il peperoncino, poi aggiungi i pomodori secchi.',
      'Scola pasta e verdura e saltale in padella per far insaporire bene tutto.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-193',
    title: 'Orzotto alle mele, rape e noci',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    servings: 2,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Orzo perlato', amount: 160, unit: 'g' },
      { name: 'Rapa rossa precotta', amount: 150, unit: 'g' },
      { name: 'Mela (tipo Granny Smith o Renetta)', amount: 1, unit: '' },
      { name: 'Gherigli di noci', amount: 20, unit: 'g' },
      { name: 'Brodo vegetale', amount: 800, unit: 'ml' },
      { name: 'Cipolla dorata', amount: 0.5, unit: '' }
    ],
    instructions: [
      'Trita la cipolla e falla appassire in pentola con un velo d\'olio.',
      'Tosta l\'orzo per un minuto, poi aggiungi il brodo man mano come per un risotto.',
      'Frulla la rapa rossa con un mestolo di brodo per ottenere una crema.',
      'A metà cottura dell\'orzo, aggiungi la crema di rapa e la mela tagliata a piccoli cubetti.',
      'Porta a cottura e servi l\'orzotto guarnendo con le noci tritate grossolanamente.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-194',
    title: 'Pasta con hummus di ceci agli agrumi',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Pasta corta integrale', amount: 160, unit: 'g' },
      { name: 'Ceci precotti', amount: 240, unit: 'g' },
      { name: 'Succo di arancia', amount: 30, unit: 'ml' },
      { name: 'Succo di limone', amount: 10, unit: 'ml' },
      { name: 'Scorza di arancia grattugiata', amount: 1, unit: 'cucchiaio' },
      { name: 'Tahin', amount: 1, unit: 'cucchiaio' },
      { name: 'Prezzemolo fresco', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'Frulla i ceci con il succo d\'arancia, il succo di limone, il tahin e un pizzico di sale fino a ottenere un hummus cremoso. Se necessario, aggiungi un po\' di acqua di cottura della pasta.',
      'Cuoci la pasta in acqua bollente salata.',
      'Scola la pasta e condiscila con l\'hummus di ceci agli agrumi.',
      'Guarnisci con la scorza d\'arancia grattugiata e il prezzemolo fresco tritato.',
      'Porta in tavola con un filo d\'olio a crudo.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-195',
    title: 'Gnocchi cremosi alla rucola',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Gnocchi di patate', amount: 500, unit: 'g' },
      { name: 'Rucola fresca', amount: 100, unit: 'g' },
      { name: 'Ricotta vaccina', amount: 150, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' },
      { name: 'Noci tritate', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Lava la rucola e frullala con la ricotta, il parmigiano e un filo d\'olio fino a ottenere una crema liscia.',
      'Cuoci gli gnocchi in acqua bollente salata finché non salgono a galla.',
      'Scola gli gnocchi e mettili in una ciotola capiente.',
      'Aggiungi la crema di rucola e mescola delicatamente per amalgamare bene.',
      'Servi subito completando con le noci tritate sulla superficie.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-196',
    title: 'Ravioli vegan senza glutine (ripieni di carciofi)',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 80,
    servings: 4,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Farina di quinoa', amount: 150, unit: 'g' },
      { name: 'Farina di mais fioretto', amount: 100, unit: 'g' },
      { name: 'Gomma di guar', amount: 4, unit: 'g' },
      { name: 'Carciofo', amount: 1, unit: '' },
      { name: 'Patata', amount: 1, unit: '' },
      { name: 'Olio extravergine d\'oliva', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'In una ciotola, mescola farina di quinoa, farina di mais fioretto, gomma di guar e sale.',
      'Aggiungi acqua gradualmente e impasta fino a ottenere un panetto liscio e compatto. Lascia riposare coperto per 30 minuti.',
      'Per il ripieno: cuoci la patata al vapore e schiacciala. Pulisci il carciofo, taglialo finemente e saltalo in padella con olio, sale e pepe.',
      'Unisci carciofi e patata schiacciata in una ciotola e amalgama bene.',
      'Stendi la pasta sottilmente su un piano infarinato con farina di mais.',
      'Disponi piccoli mucchietti di ripieno sulla pasta, copri con un altro strato di pasta e ritaglia i ravioli.',
      'Cuoci i ravioli in acqua bollente salata per circa 5 minuti o finché non tornano a galla.'
    ],
    seasoningTips: 'Suggeriamo di condirli con un filo d\'olio extravergine d\'oliva e granella di nocciole tostate, oppure con un trito di erbe aromatiche fresche (timo e maggiorana) per non coprire il sapore delicato del carciofo.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-197',
    title: 'Orzo con curry di verdure',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Orzo perlato', amount: 160, unit: 'g' },
      { name: 'Carote', amount: 2, unit: '' },
      { name: 'Zucchine', amount: 1, unit: '' },
      { name: 'Peperone rosso', amount: 0.5, unit: '' },
      { name: 'Curry in polvere', amount: 1, unit: 'cucchiaio' },
      { name: 'Latte di cocco (per cucinare)', amount: 100, unit: 'ml' },
      { name: 'Cipolla', amount: 0.5, unit: '' }
    ],
    instructions: [
      'Lessa l\'orzo in abbondante acqua salata.',
      'Nel frattempo, taglia tutte le verdure a piccoli cubetti.',
      'In una padella capiente, soffriggi la cipolla, aggiungi le verdure e un pizzico di sale. Cuoci per 10 minuti con un coperchio.',
      'Aggiungi il curry e il latte di cocco, mescola bene e lascia restringere il sugo per qualche minuto.',
      'Scola l\'orzo e saltalo insieme alle verdure al curry.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-198',
    title: 'Insalata di farro ai carciofi, mais e olive',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Farro perlato', amount: 160, unit: 'g' },
      { name: 'Cuori di carciofino sott\'olio', amount: 100, unit: 'g' },
      { name: 'Mais dolce', amount: 100, unit: 'g' },
      { name: 'Olive taggiasche denocciolate', amount: 30, unit: 'g' },
      { name: 'Basilico fresco', amount: 1, unit: 'ciuffo' },
      { name: 'Pomodorini', amount: 10, unit: '' }
    ],
    instructions: [
      'Lessa il farro in acqua salata, scola e lascia raffreddare sotto un getto di acqua fredda.',
      'Taglia i carciofini a metà e i pomodorini in quattro.',
      'In un\'insalatiera, unisci il farro, i carciofini, il mais, le olive e i pomodorini.',
      'Condisci con olio extravergine d\'oliva, sale e abbondante basilico fresco spezzettato a mano.',
      'Lascia riposare qualche minuto prima di servire affinché i sapori si amalgamino.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-199',
    title: 'Sformatini di quinoa',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Quinoa bianca o tricolore', amount: 150, unit: 'g' },
      { name: 'Zucchine grattugiate', amount: 200, unit: 'g' },
      { name: 'Farina di ceci', amount: 20, unit: 'g' },
      { name: 'Pangrattato senza glutine', amount: 30, unit: 'g' },
      { name: 'Tahin', amount: 1, unit: 'cucchiaio' },
      { name: 'Succo di limone', amount: 1, unit: 'cucchiaio' }
    ],
    instructions: [
      'Sciacqua bene la quinoa e cuocila per assorbimento in quantità doppia di acqua salata.',
      'Strizza bene le zucchine grattugiate per eliminare l\'acqua in eccesso.',
      'Mescola la quinoa cotta con le zucchine, la farina di ceci, sale e pepe.',
      'Olia degli stampini monoporzione, cospargili di pangrattato e riempili con il composto di quinoa.',
      'Inforna a 180°C per 20 minuti.',
      'Servi con una salsina fatta mescolando tahin, limone e un goccio d\'acqua tiepida.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-200',
    title: 'Pesto di agrumi',
    category: 'side',
    difficulty: 'easy',
    timeMin: 10,
    servings: 2,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Mandorle pelate', amount: 50, unit: 'g' },
      { name: 'Arancia (scorza e succo)', amount: 1, unit: '' },
      { name: 'Limone (scorza e succo)', amount: 1, unit: '' },
      { name: 'Menta fresca', amount: 1, unit: 'ciuffo' },
      { name: 'Olio extravergine d\'oliva', amount: 40, unit: 'ml' }
    ],
    instructions: [
      'Tosta leggermente le mandorle in padella.',
      'Grattugia la scorza degli agrumi e ricavane il succo.',
      'Metti nel mixer le mandorle, la scorza, il succo, la menta e un pizzico di sale.',
      'Frulla il tutto a impulsi aggiungendo l\'olio a filo fino a ottenere una consistenza granulosa ma cremosa.',
      'Ottimo per condire pasta, cereali o accompagnare verdure grigliate.'
    ],
    proteinType: 'veg',
    hasCarbs: false,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-201',
    title: 'Insalata di sorgo con noci e olive',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 30,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Sorgo precotto', amount: 160, unit: 'g' },
      { name: 'Gherigli di noci', amount: 30, unit: 'g' },
      { name: 'Olive nere denocciolate', amount: 40, unit: 'g' },
      { name: 'Rucola', amount: 50, unit: 'g' },
      { name: 'Peperone giallo crudo', amount: 0.5, unit: '' }
    ],
    instructions: [
      'Sciacqua il sorgo e lessalo se non è pronto, altrimenti usalo direttamente.',
      'Taglia il peperone a piccolissimi dadini e le olive a rondelle.',
      'In una ciotola capiente, mescola il sorgo con i peperoni, le olive e le noci spezzettate.',
      'Aggiungi la rucola fresca all\'ultimo momento.',
      'Condisci con olio EVO, sale, pepe e un goccio di aceto di mele o limone.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-202',
    title: 'Ragù alla bolognese tradizionale',
    category: 'side',
    difficulty: 'hard',
    timeMin: 180,
    servings: 6,
    season: 'all',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Carne di manzo macinata grossa', amount: 300, unit: 'g' },
      { name: 'Pancetta di maiale (cartella)', amount: 150, unit: 'g' },
      { name: 'Carota, sedano, cipolla', amount: 150, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 300, unit: 'g' },
      { name: 'Vino bianco o rosso secco', amount: 100, unit: 'ml' },
      { name: 'Latte intero', amount: 100, unit: 'ml' },
      { name: 'Brodo di carne', amount: 200, unit: 'ml' }
    ],
    instructions: [
      'Sciogli la pancetta tagliata a dadini e poi tritata in un tegame di terracotta o ghisa.',
      'Aggiungi il trito di verdure (carota, sedano, cipolla) e lascia appassire.',
      'Unisci la carne di manzo e rosola bene finché "sfrigola".',
      'Sfuma con il vino e lascia evaporare completamente.',
      'Aggiungi la passata di pomodoro e il brodo, copri e cuoci a fuoco lentissimo per almeno 2-3 ore.',
      'Verso la fine, aggiungi il latte per attenuare l\'acidità del pomodoro e aggiusta di sale e pepe.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-203',
    title: 'Ragù alla napoletana',
    category: 'side',
    difficulty: 'hard',
    timeMin: 360,
    servings: 6,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Muscolo di manzo (manzo)', amount: 500, unit: 'g' },
      { name: 'Costolette di maiale (tracchiulelle)', amount: 400, unit: 'g' },
      { name: 'Cipolle ramate', amount: 1000, unit: 'g' },
      { name: 'Passata di pomodoro di alta qualità', amount: 1000, unit: 'g' },
      { name: 'Concentrato di pomodoro', amount: 50, unit: 'g' },
      { name: 'Vino rosso robusto', amount: 150, unit: 'ml' },
      { name: 'Strutto o olio EVO', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Affetta finemente tutte le cipolle.',
      'In una pentola capiente, rosola i pezzi di carne interi nello strutto o olio finché non formano una crosticina.',
      'Aggiungi le cipolle e cuoci a fuoco bassissimo mescolando spesso finché non cambiano colore e diventano quasi una crema.',
      'Sfuma con il vino rosso più volte.',
      'Aggiungi il concentrato e poi la passata di pomodoro.',
      'Cuoci a fuoco lentissimo ("pippiare") per almeno 5-6 ore, finché il sugo non diventa scurissimo e denso.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-204',
    title: 'Polenta classica',
    category: 'side',
    difficulty: 'easy',
    timeMin: 50,
    servings: 4,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Farina di mais bramata', amount: 500, unit: 'g' },
      { name: 'Acqua', amount: 2000, unit: 'ml' },
      { name: 'Sale grosso', amount: 15, unit: 'g' },
      { name: 'Olio EVO', amount: 1, unit: 'cchiaio' }
    ],
    instructions: [
      'Porta a bollore l\'acqua in un paiolo o pentola capiente.',
      'Aggiungi il sale e un cucchiaio d\'olio (aiuta a non formare grumi).',
      'Versa la farina a pioggia mescolando velocemente con una frusta.',
      'Abbassa il fuoco al minimo e continua a cuocere mescolando spesso con un cucchiaio di legno per circa 45-50 minuti.',
      'La polenta è pronta quando si stacca facilmente dalle pareti della pentola.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-205',
    title: 'Penne al salame',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    servings: 2,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Penne rigate', amount: 160, unit: 'g' },
      { name: 'Salame tipo Milano o Ungherese', amount: 80, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'ml' },
      { name: 'Cipolla dorata', amount: 0.5, unit: '' },
      { name: 'Pecorino Romano', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Taglia il salame a listarelle sottili.',
      'Soffriggi la cipolla tritata e aggiungi il salame, lasciandolo rosolare per un paio di minuti.',
      'Aggiungi la passata di pomodoro e cuoci a fuoco dolce per 10 minuti.',
      'Lessa la pasta, scolala al dente e saltala nel sugo.',
      'Completa con una generosa spolverata di pecorino.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-206',
    title: 'Pasta pistacchio e mortadella',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'all',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Pasta (formato corto come mezze maniche)', amount: 160, unit: 'g' },
      { name: 'Mortadella in una sola fetta', amount: 100, unit: 'g' },
      { name: 'Granella di pistacchi', amount: 30, unit: 'g' },
      { name: 'Pesto di pistacchi', amount: 2, unit: 'cucchiai' },
      { name: 'Panna da cucina o formaggio spalmabile', amount: 50, unit: 'ml' }
    ],
    instructions: [
      'Taglia la mortadella a cubetti e rosolala in padella senza grassi finché non diventa croccante.',
      'Cuoci la pasta in acqua bollente salata.',
      'In una ciotola, stempera il pesto di pistacchi con la panna e un mestolo di acqua di cottura della pasta.',
      'Scola la pasta e condiscila con la crema di pistacchi.',
      'Aggiungi la mortadella croccante e la granella di pistacchi prima di servire.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-207',
    title: 'Gnocchi speck e crema di patate',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    servings: 2,
    season: 'winter',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Gnocchi di patate', amount: 500, unit: 'g' },
      { name: 'Speck a listarelle', amount: 80, unit: 'g' },
      { name: 'Patate lesse', amount: 200, unit: 'g' },
      { name: 'Rosmarino', amount: 1, unit: 'rametto' },
      { name: 'Parmigiano Reggiano', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Frulla le patate lesse con un po\' di acqua di cottura e un filo d\'olio fino a ottenere una crema liscia.',
      'In una padella, rendi lo speck croccante con un rametto di rosmarino.',
      'Cuoci gli gnocchi, scolali appena salgono a galla e mettili nella padella con lo speck.',
      'Aggiungi la crema di patate e il parmigiano, mescolando bene per amalgamare.',
      'Se necessario, aggiungi un poco di acqua di cottura per rendere tutto più cremoso.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-208',
    title: 'Risotto zucca e pancetta',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    servings: 2,
    season: 'autumn',
    isWHOCompliant: false,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 160, unit: 'g' },
      { name: 'Zucca pulita', amount: 250, unit: 'g' },
      { name: 'Pancetta affumicata', amount: 60, unit: 'g' },
      { name: 'Brodo vegetale', amount: 800, unit: 'ml' },
      { name: 'Cipolla', amount: 0.5, unit: '' },
      { name: 'Burro', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Taglia la zucca a piccoli cubetti e soffriggila con la cipolla tritata.',
      'In una padella a parte, rosola la pancetta finché non è dorata.',
      'Tosta il riso con la zucca, poi inizia ad aggiungere il brodo bollente man mano.',
      'A metà cottura, unisci la pancetta rosolata.',
      'A cottura ultimata, manteca con una noce di burro e parmigiano a piacere.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-209',
    title: 'Lasagne funghi e salsiccia',
    category: 'dinner',
    difficulty: 'hard',
    timeMin: 60,
    servings: 4,
    season: 'autumn',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Sfoglie per lasagne', amount: 250, unit: 'g' },
      { name: 'Salsiccia di maiale', amount: 300, unit: 'g' },
      { name: 'Funghi misti (anche surgelati)', amount: 400, unit: 'g' },
      { name: 'Besciamella', amount: 500, unit: 'ml' },
      { name: 'Mozzarella', amount: 200, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Sgrana la salsiccia e rosolala in padella con i funghi finché non sono ben cotti.',
      'In una teglia, stendi un velo di besciamella sul fondo.',
      'Disponi uno strato di lasagne, uno di besciamella, il condimento di funghi e salsiccia, e fettine di mozzarella.',
      'Ripeti gli strati fino a esaurimento ingredienti.',
      'Termina con besciamella e abbondante parmigiano, poi inforna a 200°C per 25-30 minuti.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-210',
    title: 'Penne prosciutto cotto e asparagi',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'spring',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Penne rigate', amount: 160, unit: 'g' },
      { name: 'Asparagi', amount: 200, unit: 'g' },
      { name: 'Prosciutto cotto a cubetti', amount: 80, unit: 'g' },
      { name: 'Cipolla', amount: 0.5, unit: '' },
      { name: 'Parmigiano Reggiano', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Pulisci gli asparagi e tagliali a rondelle, tenendo le punte intere.',
      'Soffriggi la cipolla tritata e aggiungi gli asparagi con un goccio d\'acqua.',
      'Cuoci per 10 minuti, poi unisci il prosciutto cotto e rosola brevemente.',
      'Lessa la pasta, scolala e saltala in padella con il condimento.',
      'Mantecate con parmigiano prima di servire.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-211',
    title: 'Asparagi al burro e parmigiano in padella',
    category: 'side',
    difficulty: 'easy',
    timeMin: 15,
    servings: 2,
    season: 'spring',
    isWHOCompliant: false,
    tags: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Asparagi', amount: 400, unit: 'g' },
      { name: 'Burro', amount: 30, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' },
      { name: 'Sale e pepe', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Pulisci gli asparagi eliminando la parte dura e sbollentali per 5 minuti in acqua salata.',
      'Scola gli asparagi e mettili in una padella dove hai fatto sciogliere il burro.',
      'Salta gli asparagi a fuoco vivace per 5 minuti finché sono leggermente dorati.',
      'Spegni il fuoco, spolvera con abbondante parmigiano e pepe, poi copri per un minuto prima di servire.'
    ],
    proteinType: 'cheese',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-212',
    title: 'Penne porri e salsiccia',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'winter',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Penne rigate', amount: 160, unit: 'g' },
      { name: 'Porri', amount: 1, unit: '' },
      { name: 'Salsiccia di maiale', amount: 150, unit: 'g' },
      { name: 'Vino bianco', amount: 30, unit: 'ml' },
      { name: 'Pecorino Romano', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Affetta il porro a rondelle sottili e fallo appassire in padella con un filo d\'olio.',
      'Sgrana la salsiccia e aggiungila al soffritto di porri.',
      'Rosola bene e sfuma con il vino bianco.',
      'Cuoci la pasta, scolala e saltala nel sugo aggiungendo un mestolo di acqua di cottura se necessario.',
      'Completa con pecorino romano grattugiato.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-213',
    title: 'Tagliatelle peperoni e pancetta',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'summer',
    isWHOCompliant: false,
    tags: [],
    ingredients: [
      { name: 'Tagliatelle all\'uovo', amount: 160, unit: 'g' },
      { name: 'Peperoni misti', amount: 2, unit: '' },
      { name: 'Pancetta affumicata', amount: 60, unit: 'g' },
      { name: 'Cipolla rossa', amount: 0.5, unit: '' },
      { name: 'Prezzemolo', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'Taglia i peperoni a listarelle sottili.',
      'In una padella, rosola la pancetta finché non è croccante, poi toglila e tienila da parte.',
      'Nella stessa padella, cuoci i peperoni con la cipolla e un po\' d\'acqua finché non sono teneri.',
      'Frulla metà dei peperoni per ottenere una crema e rimettila in padella.',
      'Lessa le tagliatelle, saltale con la crema di peperoni, aggiungi la pancetta croccante e prezzemolo fresco.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-214',
    title: 'Polpette di ceci',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'lactose-free'],
    ingredients: [
      { name: 'Ceci precotti', amount: 400, unit: 'g' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Pangrattato', amount: 40, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Cumino', amount: 1, unit: 'pizzico' },
      { name: 'Prezzemolo', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'Frulla i ceci scolati con aglio, prezzemolo e cumino.',
      'Trasferisci il composto in una ciotola, aggiungi l\'uovo e il pangrattato fino a ottenere una consistenza lavorabile.',
      'Forma delle polpettine grandi come una noce.',
      'Cuocile in padella con un filo d\'olio per 10 minuti girandole spesso, oppure in forno a 200°C per 20 minuti.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-215',
    title: 'Pollo al curry',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Petto di pollo', amount: 350, unit: 'g' },
      { name: 'Cipolla dorata', amount: 1, unit: '' },
      { name: 'Curry in polvere', amount: 1, unit: 'cucchiaio' },
      { name: 'Latte di cocco o yogurt bianco', amount: 150, unit: 'ml' },
      { name: 'Riso Basmati (accomp.)', amount: 120, unit: 'g' }
    ],
    instructions: [
      'Taglia il pollo a bocconcini e infarinalo con un velo di farina (o amido per gluten-free).',
      'Soffriggi la cipolla affettata nel wok o padella.',
      'Aggiungi il pollo e fallo dorare bene.',
      'Unisci il curry sciolto nel latte di cocco (o yogurt) e cuoci per 10-15 minuti finché la salsa si addensa.',
      'Servi ben caldo accompagnato da riso basmati lessato.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-216',
    title: 'Torta salata al tonno',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 40,
    servings: 4,
    season: 'all',
    isWHOCompliant: false,
    tags: ['fish'],
    ingredients: [
      { name: 'Pasta sfoglia rotonda', amount: 1, unit: 'rotolo' },
      { name: 'Tonno sott\'olio sgocciolato', amount: 160, unit: 'g' },
      { name: 'Ricotta vaccina', amount: 250, unit: 'g' },
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Capperi sotto sale', amount: 1, unit: 'cucchiaio' },
      { name: 'Pomodorini', amount: 10, unit: '' }
    ],
    instructions: [
      'In una ciotola, mescola la ricotta con le uova fino a ottenere una crema.',
      'Aggiungi il tonno sbriciolato e i capperi dissalati.',
      'Stendi la pasta sfoglia in una teglia e bucherella il fondo.',
      'Versa il composto di ricotta e tonno e livella bene.',
      'Decora la superficie con i pomodorini tagliati a metà.',
      'Inforna a 200°C per circa 25-30 minuti finché i bordi sono dorati.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-217',
    title: 'Mousse al cioccolato senza lattosio',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free', 'gluten-free'],
    ingredients: [
      { name: 'Cioccolato fondente 70%', amount: 100, unit: 'g' },
      { name: 'Acqua faba (liquido di governo dei ceci)', amount: 100, unit: 'ml' },
      { name: 'Zucchero a velo (facoltativo)', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Sciogli il cioccolato fondente a bagnomaria e lascialo intiepidire.',
      'Monta l\'acqua faba con le fruste elettriche a neve fermissima (come gli albumi).',
      'Incorpora delicatamente il cioccolato fuso all\'acqua faba montata con movimenti dal basso verso l\'alto.',
      'Dividi in coppette e lascia riposare in frigo per almeno 2 ore prima di servire.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-218',
    title: 'Latte di riso fatto in casa',
    category: 'side',
    difficulty: 'easy',
    timeMin: 30,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Riso Originario o Baldo', amount: 100, unit: 'g' },
      { name: 'Acqua naturale', amount: 1000, unit: 'ml' },
      { name: 'Sale', amount: 1, unit: 'pizzico' },
      { name: 'Olio di semi di girasole', amount: 1, unit: 'cucchiaio' }
    ],
    instructions: [
      'Sciacqua il riso e lessalo in acqua bollente per circa 20-25 minuti (deve essere molto cotto).',
      'Scola il riso e mettilo nel frullatore con 1 litro di acqua naturale.',
      'Aggiungi un pizzico di sale e l\'olio di semi che aiuterà l\'emulsione.',
      'Frulla alla massima velocità per un paio di minuti fino a ottenere un liquido omogeneo.',
      'Filtra il latte utilizzando un colino a maglie strettissime o un panno di cotone pulito.',
      'Conserva in una bottiglia di vetro in frigorifero per 3-4 giorni.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-219',
    title: 'Lonza di maiale in umido al timo e cipolla rossa',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Lonza di maiale a fette', amount: 300, unit: 'g' },
      { name: 'Cipolle rosse', amount: 2, unit: '' },
      { name: 'Timo fresco', amount: 3, unit: 'rametti' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
      { name: 'Brodo vegetale', amount: 100, unit: 'ml' }
    ],
    instructions: [
      'Affetta finemente le cipolle rosse e falle appassire in padella con un filo d\'olio e un goccio d\'acqua.',
      'Quando le cipolle sono tenere, aggiungi le fette di lonza e rosolale da entrambi i lati.',
      'Sfuma con il vino bianco e lascia evaporare.',
      'Aggiungi il timo e il brodo vegetale caldo.',
      'Copri e cuoci a fuoco dolce per circa 15-20 minuti finché la carne è tenera e il sughetto ristretto.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-220',
    title: 'Straccetti di scottona alla curcuma con broccoli e noci',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Straccetti di scottona', amount: 300, unit: 'g' },
      { name: 'Broccoli', amount: 300, unit: 'g' },
      { name: 'Gherigli di noci', amount: 30, unit: 'g' },
      { name: 'Curcuma in polvere', amount: 1, unit: 'cucchiaio' },
      { name: 'Zenzero fresco', amount: 1, unit: 'pezzetto' }
    ],
    instructions: [
      'Pulisci il broccolo e ricava le cimette, poi cuocile a vapore o sbollentale per 5 minuti.',
      'In una padella capiente, scalda un giro d\'olio e aggiungi lo zenzero grattugiato.',
      'Unisci gli straccetti di carne e rosolali a fiamma vivace.',
      'Aggiungi la curcuma sciolta in due cucchiai di acqua tiepida e i broccoli sbollentati.',
      'Salta tutto insieme per pochi minuti, aggiungi le noci spezzettate alla fine e servi subito.'
    ],
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-221',
    title: 'Hamburger di barbabietola',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 35,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Barbabietola precotta', amount: 250, unit: 'g' },
      { name: 'Fiocchi d\'avena certificati senza glutine', amount: 100, unit: 'g' },
      { name: 'Cipolla rossa', amount: 0.5, unit: '' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Semi di cumino', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Frulla la barbabietola con la cipolla, l\'aglio e i semi di cumino.',
      'In una ciotola, unisci il composto ai fiocchi d\'avena e lascia riposare per 15 minuti affinché l\'avena assorba l\'umidità.',
      'Forma dei burger con le mani inumidite.',
      'Cuoci in padella antiaderente con un filo d\'olio per 5 minuti per lato finché non si forma una crosticina.',
      'Servi in un panino gluten-free con insalata e salse a piacere.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-222',
    title: 'Polpettine di fagioli neri',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Fagioli neri precotti', amount: 400, unit: 'g' },
      { name: 'Pan grattato integrale', amount: 50, unit: 'g' },
      { name: 'Prezzemolo fresco', amount: 1, unit: 'ciuffo' },
      { name: 'Paprika affumicata', amount: 1, unit: 'cucchiaino' },
      { name: 'Scorza di lime', amount: 1, unit: '' }
    ],
    instructions: [
      'Schiaccia i fagioli neri con una forchetta lasciandone alcuni interi per la consistenza.',
      'Aggiungi il pangrattato, il prezzemolo tritato, la paprika e la scorza di lime.',
      'Mescola bene e forma delle polpettine della grandezza di una noce.',
      'Ripassa in padella con poco olio o cuoci in forno a 200°C per 15 minuti.',
      'Ottime servite con una salsa allo yogurt di soia o guacamole.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-223',
    title: 'Branzino al limone con patate e zucchine',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['fish', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Filetti di branzino', amount: 2, unit: '' },
      { name: 'Patate medie', amount: 2, unit: '' },
      { name: 'Zucchine', amount: 2, unit: '' },
      { name: 'Limone (fette e succo)', amount: 1, unit: '' },
      { name: 'Timo e rosmarino', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Affetta le patate e le zucchine molto sottilmente (meglio se con mandolina).',
      'Disponi le patate su una teglia con carta forno, sala e inforna a 200°C per 10 minuti.',
      'Aggiungi le zucchine e i filetti di branzino sopra le verdure.',
      'Irrora con succo di limone, aggiungi le fette di limone sopra il pesce e le erbe aromatiche.',
      'Cuoci per altri 15-20 minuti finché il pesce non è opaco e le verdure tenere.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-224',
    title: 'Vellutata di melanzane',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 35,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Melanzane grandi', amount: 2, unit: '' },
      { name: 'Patata piccola', amount: 1, unit: '' },
      { name: 'Cipolla bionda', amount: 0.5, unit: '' },
      { name: 'Brodo vegetale', amount: 500, unit: 'ml' },
      { name: 'Basilico', amount: 4, unit: 'foglie' }
    ],
    instructions: [
      'Sbuccia la melanzana a strisce (lasciandone un po\') e tagliala a cubetti.',
      'In una pentola, soffriggi la cipolla, aggiungi la patata a cubetti e le melanzane.',
      'Copri con il brodo vegetale e cuoci per 20 minuti finché tutto è tenero.',
      'Frulla con un frullatore a immersione aggiungendo il basilico fresco.',
      'Servi con un filo d\'olio a crudo e, se gradito, qualche cubetto di pane tostato.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-225',
    title: 'Nuggets di pollo senza glutine e senza lattosio',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['white-meat', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Petto di pollo', amount: 300, unit: 'g' },
      { name: 'Farina di riso', amount: 30, unit: 'g' },
      { name: 'Fiocchi di mais (corn flakes) senza glutine', amount: 50, unit: 'g' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Paprika dolce', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Taglia il pollo a pezzi regolari (bocconcini).',
      'Sbriciola grossolanamente i corn flakes in una ciotola.',
      'Passa i pezzi di pollo prima nella farina di riso, poi nell\'uovo sbattuto con la paprika, e infine nei corn flakes premendo bene.',
      'Cuoci in forno a 200°C per 15 minuti su carta forno con un filo d\'olio, o in friggitrice ad aria per 12 minuti.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-226',
    title: 'Involtini di verza',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    servings: 2,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['red-meat', 'lactose-free'],
    ingredients: [
      { name: 'Foglie di verza grandi', amount: 4, unit: '' },
      { name: 'Carne macinata magra di bovino', amount: 200, unit: 'g' },
      { name: 'Riso cotto', amount: 100, unit: 'g' },
      { name: 'Soffritto (carota, sedano, cipolla)', amount: 50, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 100, unit: 'ml' }
    ],
    instructions: [
      'Sbollenta le foglie di verza in acqua salata per 2-3 minuti, poi scolale e passale in acqua ghiacciata.',
      'In una ciotola, amalgama la carne macinata con il riso cotto e il soffritto tritato fine.',
      'Adagia una pallina di composto su ogni foglia di verza e arrotola sigillando i bordi.',
      'In una padella, scalda un po\' di passata di pomodoro, adagia gli involtini e cuoci coperto per 20 minuti.',
      'Servi con il loro sughetto rosso.'
    ],
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-227',
    title: 'Rotolo di zucchine grigliate su letto di rucola',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Zucchine grandi', amount: 2, unit: '' },
      { name: 'Formaggio spalmabile light', amount: 100, unit: 'g' },
      { name: 'Fette di fesa di tacchino (o bresaola)', amount: 6, unit: '' },
      { name: 'Rucola fresca', amount: 30, unit: 'g' },
      { name: 'Scorza di limone', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Taglia le zucchine a fette sottili nel senso della lunghezza e grigliale su una piastra ben calda.',
      'Su ogni fetta di zucchina grigliata, spalma un velo di formaggio spalmabile mescolato con la scorza di limone.',
      'Adagia sopra una fettina di fesa di tacchino e qualche foglia di rucola.',
      'Arrotola le zucchine su se stesse a formare degli involtini.',
      'Disponi i rotoli su un letto di rucola fresca e condisci con un filo d\'olio EVO.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-228',
    title: 'Parmigiana bianca',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    servings: 4,
    season: 'summer',
    isWHOCompliant: false,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Melanzane grandi', amount: 3, unit: '' },
      { name: 'Mozzarella per pizza', amount: 250, unit: 'g' },
      { name: 'Parmigiano Reggiano grattugiato', amount: 60, unit: 'g' },
      { name: 'Besciamella (opzionale light)', amount: 200, unit: 'ml' },
      { name: 'Basilico fresco', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'Taglia le melanzane a fette e grigliale o passale in forno per 15 minuti.',
      'In una pirofila, sporca il fondo con poca besciamella o olio.',
      'Componi gli strati: fette di melanzane, mozzarella a dadini, parmigiano e foglie di basilico spezzettate.',
      'Prosegui fino a esaurimento ingredienti, terminando con abbondante parmigiano.',
      'Inforna a 190°C per circa 25-30 minuti finché la superficie non risulta ben gratinata.'
    ],
    proteinType: 'cheese',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-229',
    title: 'Burger di carote',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'lactose-free'],
    ingredients: [
      { name: 'Carote grattugiate finemente', amount: 300, unit: 'g' },
      { name: 'Cipolla tritata', amount: 0.5, unit: '' },
      { name: 'Pangrattato integrale', amount: 60, unit: 'g' },
      { name: 'Farina di ceci', amount: 20, unit: 'g' },
      { name: 'Curcuma o curry', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'In una ciotola, mescola le carote grattugiate con la cipolla, la farina di ceci, le spezie e il sale.',
      'Aggiungi gradualmente il pangrattato fino a ottenere un impasto denso e modellabile con le mani.',
      'Forma dei burger e lasciali riposare 10 minuti in frigo.',
      'Cuoci in padella antiaderente con un cucchiaio d\'olio per 5 minuti per lato a fuoco medio.',
      'Servi con un\'insalata verde o all\'interno di un panino integrale.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-230',
    title: 'Burger di quinoa e verdure',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 40,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Quinoa cotta', amount: 200, unit: 'g' },
      { name: 'Zucchine e carote tritate fine', amount: 150, unit: 'g' },
      { name: 'Fecola di patate', amount: 20, unit: 'g' },
      { name: 'Frutta secca tritata (mandorle o noci)', amount: 20, unit: 'g' },
      { name: 'Erbette aromatiche (timo, maggiorana)', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Assicurati che la quinoa sia ben scolata e asciutta.',
      'Mescola la quinoa con le verdure tritate, la frutta secca e le erbette.',
      'Aggiungi la fecola di patate per legare il composto.',
      'Forma dei burger compattandoli bene tra le mani.',
      'Disponi su una teglia con carta forno e cuoci a 200°C per 20 minuti, girandoli a metà cottura.'
    ],
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-231',
    title: 'Muffin arance e noci senza lattosio',
    category: 'breakfast',
    difficulty: 'easy',
    timeMin: 35,
    servings: 6,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian', 'lactose-free'],
    ingredients: [
      { name: 'Farina tipo 1 o integrale', amount: 200, unit: 'g' },
      { name: 'Zucchero di canna', amount: 80, unit: 'g' },
      { name: 'Succo d\'arancia fresco', amount: 150, unit: 'ml' },
      { name: 'Scorza d\'arancia grattugiata', amount: 1, unit: '' },
      { name: 'Olio di semi di girasole', amount: 60, unit: 'ml' },
      { name: 'Gherigli di noci tritati grossolanamente', amount: 50, unit: 'g' },
      { name: 'Lievito per dolci', amount: 0.5, unit: 'bustina' }
    ],
    instructions: [
      'Mescola in una ciotola gli ingredienti secchi: farina, zucchero, lievito e metà delle noci.',
      'In un\'altra ciotola, unisci il succo d\'arancia, la scorza e l\'olio.',
      'Versa i liquidi sui secchi e mescola brevemente con una frusta a mano senza lavorare troppo l\'impasto.',
      'Versa l\'impasto negli stampini per muffin, guarnisci con le noci rimaste.',
      'Inforna a 180°C per circa 20-25 minuti (fai la prova stecchino).'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-232',
    title: 'Polpette carote e philadelphia',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Carote', amount: 300, unit: 'g' },
      { name: 'Formaggio Philadelphia (o simile)', amount: 125, unit: 'g' },
      { name: 'Pangrattato', amount: 50, unit: 'g' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' },
      { name: 'Erba cipollina', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'Lessa le carote finché non sono molto tenere, poi schiacciale con una forchetta o frullale.',
      'In una ciotola, unisci la purea di carote, il Philadelphia, il parmigiano e l\'erba cipollina tritata.',
      'Aggiungi il pangrattato poco alla volta fino a ottenere un impasto sodo.',
      'Forma delle polpettine e passale in un velo di pangrattato.',
      'Cuoci in padella con un filo d\'olio per 10 minuti girandole spesso, oppure in forno a 200°C per 15 minuti.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-233',
    title: 'Pasta fredda con Scamorza affumicata',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'summer',
    isWHOCompliant: false,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta corta (tipo fusilli)', amount: 160, unit: 'g' },
      { name: 'Scamorza affumicata', amount: 100, unit: 'g' },
      { name: 'Pomodorini ciliegino', amount: 150, unit: 'g' },
      { name: 'Olive nere denocciolate', amount: 30, unit: 'g' },
      { name: 'Basilico fresco', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'Lessa la pasta in acqua salata, scolala al dente e passala sotto l\'acqua fredda per fermare la cottura.',
      'Taglia la scamorza a cubetti piccoli e i pomodorini in quattro parti.',
      'In un\'insalatiera, mescola la pasta con i pomodorini, le olive a rondelle e la scamorza.',
      'Condisci con olio EVO, sale, pepe e abbondante basilico spezzettato a mano.',
      'Lascia riposare in frigo per almeno 30 minuti prima di servire.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-234',
    title: 'Polpette di ricotta in padella',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Ricotta vaccina ben sgocciolata', amount: 250, unit: 'g' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Parmigiano Reggiano', amount: 40, unit: 'g' },
      { name: 'Pangrattato', amount: 60, unit: 'g' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'cucchiaio' }
    ],
    instructions: [
      'In una ciotola, lavora la ricotta con l\'uovo, il parmigiano e il prezzemolo.',
      'Aggiungi il pangrattato poco alla volta fino a ottenere un composto modellabile.',
      'Forma delle polpette leggermente schiacciate.',
      'Passale velocemente nel pangrattato.',
      'Scalda un filo d\'olio in una padella antiaderente e cuoci le polpette per 3-4 minuti per lato finché non sono dorate.'
    ],
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-235',
    title: 'Scaloppine di pollo con ciliegino',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['white-meat', 'lactose-free'],
    ingredients: [
      { name: 'Petto di pollo a fette sottili', amount: 300, unit: 'g' },
      { name: 'Pomodorini ciliegino', amount: 200, unit: 'g' },
      { name: 'Farina', amount: 30, unit: 'g' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
      { name: 'Origano secco', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Infarina leggermente le fette di pollo scrollando l\'eccesso.',
      'Scalda l\'olio in una padella ampia e rosola il pollo da entrambi i lati.',
      'Sfuma con il vino bianco e lascia evaporare l\'alcol.',
      'Aggiungi i pomodorini tagliati a metà e l\'origano.',
      'Copri e cuoci per 5-10 minuti a fuoco dolce finché i pomodorini appassiscono e creano un sughetto.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-236',
    title: 'Polpettone di tonno e patate',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 30,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['fish', 'lactose-free'],
    ingredients: [
      { name: 'Tonno sott\'olio sgocciolato', amount: 320, unit: 'g' },
      { name: 'Patate lesse', amount: 500, unit: 'g' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Parmigiano Reggiano (opzionale)', amount: 30, unit: 'g' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'ciuffo' },
      { name: 'Pangrattato', amount: 40, unit: 'g' }
    ],
    instructions: [
      'In una ciotola capiente, schiaccia le patate lesse ancora tiepide con uno schiacciapatate o una forchetta.',
      'Aggiungi il tonno ben sgocciolato e sminuzzato, l\'uovo, il formaggio e il prezzemolo tritato.',
      'Amalgama bene il tutto fino a ottenere un impasto omogeneo.',
      'Dai all\'impasto la forma di un cilindro (polpettone) e passalo nel pangrattato facendolo aderire bene.',
      'Avvolgi il polpettone in carta forno o pellicola e lascialo riposare in frigo per 20 minuti (opzionale per compattarlo).',
      'Cuoci in forno a 200°C per circa 20-25 minuti con un filo d\'olio finché non è dorato in superficie.'
    ],
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-237',
    title: 'Torta al cioccolato in tazza al microonde (mug cake)',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 5,
    servings: 1,
    season: 'all',
    isWHOCompliant: false,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Farina 00', amount: 4, unit: 'cucchiai' },
      { name: 'Zucchero', amount: 2, unit: 'cucchiai' },
      { name: 'Cacao amaro', amount: 2, unit: 'cucchiai' },
      { name: 'Latte intero o vegetale', amount: 3, unit: 'cucchiai' },
      { name: 'Olio di semi', amount: 2, unit: 'cucchiai' },
      { name: 'Lievito per dolci', amount: 0.25, unit: 'cuchiaino' },
      { name: 'Gocce di cioccolato', amount: 1, unit: 'cucchiaino' }
    ],
    instructions: [
      'In una tazza grande (mug), mescola prima gli ingredienti secchi: farina, zucchero, cacao e lievito.',
      'Aggiungi l\'olio e il latte e mescola bene con un cucchiaino fino a eliminare tutti i grumi.',
      'Aggiungi le gocce di cioccolato e mescola brevemente.',
      'Cuoci nel forno a microonde alla massima potenza (circa 800W) per 1 minuto e mezzo o 2 minuti.',
      'Lascia intiepidire un minuto prima di gustare direttamente dalla tazza.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-238',
    title: 'Tortelli di pesce al sugo di olive nere',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 25,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['fish'],
    ingredients: [
      { name: 'Tortelli o ravioli di pesce (freschi)', amount: 250, unit: 'g' },
      { name: 'Olive nere denocciolate', amount: 50, unit: 'g' },
      { name: 'Pomodorini ciliegino', amount: 150, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Prezzemolo fresco', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'Metti a bollire l\'acqua salata per la pasta.',
      'In una padella capiente, scalda l\'olio con lo spicchio d\'aglio schiacciato.',
      'Aggiungi i pomodorini tagliati a metà e le olive nere a rondelle.',
      'Cuoci i tortelli per il tempo indicato (solitamente poci minuti per la pasta fresca).',
      'Scola i tortelli direttamente nella padella, aggiungi un mestolo di acqua di cottura e salta finché il sugo non si lega.',
      'Spegni il fuoco, aggiungi il prezzemolo tritato e servi.'
    ],
    seasoningTips: 'Oltre al sugo di olive, prova una mantecatura leggera con acqua di cottura, scorza di lime e un trito di menta fresca per una versione estiva e rinfrescante.',
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-239',
    title: 'Pan briosce senza uova',
    category: 'breakfast',
    difficulty: 'medium',
    timeMin: 180,
    servings: 8,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'egg-free'],
    ingredients: [
      { name: 'Farina tipo 0 o Manitoba', amount: 500, unit: 'g' },
      { name: 'Latte tiepido', amount: 250, unit: 'ml' },
      { name: 'Zucchero', amount: 80, unit: 'g' },
      { name: 'Lievito di birra secco', amount: 7, unit: 'g' },
      { name: 'Burro morbido o Olio di semi', amount: 60, unit: 'g' },
      { name: 'Scorza di limone', amount: 1, unit: '' }
    ],
    instructions: [
      'Sciogli il lievito e un cucchiaino di zucchero nel latte tiepido.',
      'In una planetaria o ciotola, unisci farina, il resto dello zucchero e la scorza di limone.',
      'Versa il latte con il lievito e inizia a impastare.',
      'Aggiungi il burro morbido a pezzetti (o l\'olio) un po\' alla volta finché non viene assorbito completamente.',
      'Lavora l\'impasto per 10-15 minuti finché diventa elastico e liscio.',
      'Lascia lievitare in un luogo tiepido coperto fino al raddoppio (circa 2 ore).',
      'Sgonfia l\'impasto, dividilo in palle o mettilo in uno stampo da plumcake e lascia lievitare ancora 45 minuti.',
      'Spennella con poco latte e inforna a 180°C per circa 25-30 minuti.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-240',
    title: 'Torta di Mais e Avena in Padella',
    category: 'breakfast',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Farina di mais finissima', amount: 80, unit: 'g' },
      { name: 'Fiocchi d\'avena certificati senza glutine', amount: 40, unit: 'g' },
      { name: 'Latte vegetale (riso o avena)', amount: 150, unit: 'ml' },
      { name: 'Mela grattugiata', amount: 1, unit: '' },
      { name: 'Cannella', amount: 1, unit: 'pizzico' },
      { name: 'Lievito per dolci', amount: 1, unit: 'cucchiaino' }
    ],
    instructions: [
      'In una ciotola, mescola la farina di mais con i fiocchi d\'avena, la cannella e il lievito.',
      'Aggiungi la mela grattugiata e il latte vegetale, mescolando fino a ottenere un composto omogeneo.',
      'Ungi leggermente una padella antiaderente piccola e scaldala.',
      'Versa l\'impasto, livellalo e cuoci a fuoco bassissimo con il coperchio per circa 8-10 minuti.',
      'Gira la torta con l\'aiuto di un piatto e cuoci per altri 5 minuti dall\'altro lato.',
      'Servi tiepida con un filo di miele o sciroppo d\'acero.'
    ],
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-241',
    title: 'Coda di rospo in padella',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['fish', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Coda di rospo (rana pescatrice) a fette', amount: 350, unit: 'g' },
      { name: 'Pomodorini', amount: 10, unit: '' },
      { name: 'Olive taggiasche', amount: 1, unit: 'cucchiaio' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Capperi', amount: 1, unit: 'cucchiaino' },
      { name: 'Vino bianco', amount: 30, unit: 'ml' }
    ],
    instructions: [
      'Lava e asciuga le fette di coda di rospo.',
      'In una padella, scalda un filo d\'olio con lo spicchio d\'aglio.',
      'Aggiungi il pesce e rosolalo un paio di minuti per lato.',
      'Sfuma con il vino bianco e lascia evaporare.',
      'Unisci i pomodorini tagliati a metà, le olive e i capperi dissalati.',
      'Copri e cuoci per circa 10 minuti a fuoco medio finché il pesce è cotto e si è formato un bel sughetto.'
    ],
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-242',
    title: 'Risotto alle rane',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 50,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['white-meat', 'gluten-free'],
    ingredients: [
      { name: 'Riso Carnaroli', amount: 320, unit: 'g' },
      { name: 'Cosce di rana pulite', amount: 300, unit: 'g' },
      { name: 'Brodo vegetale', amount: 1, unit: 'l' },
      { name: 'Cipolla bianca', amount: 0.5, unit: '' },
      { name: 'Vino bianco secco', amount: 100, unit: 'ml' },
      { name: 'Burro', amount: 30, unit: 'g' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'In una casseruola, rosola brevemente le cosce di rana con un trito di cipolla e un velo di burro.',
      'Togli le rane e mettile da parte.',
      'Nella stessa pentola, tosta il riso per un paio di minuti.',
      'Sfuma con il vino bianco e lascia evaporare.',
      'Inizia ad aggiungere il brodo bollente un mestolo alla volta, mescolando spesso.',
      'A metà cottura, unisci le cosce di rana (puoi spolparne alcune se preferisci).',
      'Porta a cottura il riso, spegni il fuoco e manteca con il burro rimasto.',
      'Completa con prezzemolo fresco tritato prima di servire.'
    ],
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-243',
    title: 'Rane in guazzetto',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 35,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['white-meat', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Cosce di rana', amount: 400, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'ml' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Peperoncino', amount: 1, unit: 'pizzico' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
      { name: 'Prezzemolo', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'Infarina leggermente le cosce di rana (opzionale con farina di riso per gluten-free).',
      'Rosola l\'aglio e il peperoncino in padella con olio EVO.',
      'Aggiungi le rane e falle dorare bene.',
      'Sfuma con il vino bianco.',
      'Versa la passata di pomodoro, sala e cuoci coperto per circa 15-20 minuti finché il sugo si addensa.',
      'Servi caldissimo guarnendo con prezzemolo fresco.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-244',
    title: 'Rane imperiali',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['white-meat', 'gluten-free'],
    ingredients: [
      { name: 'Cosce di rana pulite', amount: 400, unit: 'g' },
      { name: 'Uova', amount: 2, unit: '' },
      { name: 'Parmigiano Reggiano', amount: 30, unit: 'g' },
      { name: 'Burro', amount: 40, unit: 'g' },
      { name: 'Sage', amount: 4, unit: 'foglie' },
      { name: 'Prezzemolo tritato', amount: 1, unit: 'ciuffo' },
      { name: 'Farina di riso (per infarinare)', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Asciuga bene le cosce di rana e passale nella farina di riso, scrollando l\'eccesso.',
      'In una padella ampia, sciogli il burro con le foglie di salvia.',
      'Aggiungi le rane e friggi a fuoco medio finché non sono ben dorate e croccanti (circa 10-12 minuti).',
      'In una ciotolina, sbatti le uova con il parmigiano grattugiato e il prezzemolo.',
      'Abbassa la fiamma al minimo, versa il composto di uova sulle rane in padella.',
      'Mescola delicatamente per pochi istanti finché l\'uovo inizia a rapprendersi ma rimane cremoso.',
      'Servi subito ben calde.'
    ],
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-245',
    title: 'Carbonara vegetariana alle zucchine',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta tipo rigatoni o spaghetti', amount: 320, unit: 'g' },
      { name: 'Zucchine fresche', amount: 300, unit: 'g' },
      { name: 'Tuorli d\'uovo', amount: 4, unit: '' },
      { name: 'Pecorino Romano grattugiato', amount: 50, unit: 'g' },
      { name: 'Pepe nero', amount: 1, unit: 'pizzico' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' }
    ],
    instructions: [
      'Metti a bollire l\'acqua per la pasta in una pentola capiente. Salala moderatamente all\'ebollizione.',
      'Taglia le zucchine a cubetti piccoli o rondelle sottili.',
      'Rosola le zucchine in una padella capiente con l\'olio extravergine d\'oliva fino a farle diventare dorate e leggermente croccanti.',
      'Nel frattempo, in una ciotola capiente, sbatti i tuorli d\'uovo assieme al Pecorino Romano grattugiato e abbondante pepe nero fresco, creando una pastella densa e cremosa.',
      'Cuoci la pasta nell\'acqua bollente e scolala ben al dente, tenendo da parte un mestolo di acqua di cottura.',
      'Versa la pasta direttamente nella padella con le zucchine e saltala per pochi istanti a fuoco spento.',
      'Trasferisci pasta e zucchine calde nella ciotola con il composto di uova e pecorino (lavorando fuori dal fuoco).',
      'Mescola energicamente per pochi secondi, aggiungendo pochissima acqua della pasta per ottenere un\'emulsione vellutata e super cremosa.'
    ],
    seasoningTips: 'Per un tocco gourmet e profumato, unisci alla crema d\'uovo qualche fogliolina di menta fresca tritata finemente oppure una grattugiata di scorza di limone bio.',
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-246',
    title: 'Polpettone morbido alla zucca e tacchino',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 50,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['white-meat'],
    ingredients: [
      { name: 'Macinato di tacchino magro', amount: 500, unit: 'g' },
      { name: 'Polpa di zucca (già cotta e strizzata)', amount: 250, unit: 'g' },
      { name: 'Uova', amount: 1, unit: '' },
      { name: 'Parmigiano Reggiano grattugiato', amount: 40, unit: 'g' },
      { name: 'Pangrattato (anche senza glutine)', amount: 50, unit: 'g' },
      { name: 'Rosmarino e salvia freschi tritati', amount: 1, unit: 'cucchiaio' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' },
      { name: 'Olio extravergine d\'oliva', amount: 1, unit: 'cchiaio' }
    ],
    instructions: [
      'Schiaccia bene la polpa di zucca cotta con una forchetta in modo da ridurla in purea e rimuovere l\'acqua in eccesso.',
      'In una ciotola capiente, unisci il macinato di tacchino, la purea di zucca, l\'uovo, il Parmigiano Reggiano, le erbe aromatiche tritate, sale, pepe e il pangrattato.',
      'Mescola energeticamente con le mani fino a ottenere un composto omogeneo, morbido ma compatto (se troppo umido, aggiungi un cucchiaio extra di pangrattato/farina di riso).',
      'Trasferisci l\'impasto su un foglio di carta da forno e modella con le mani dandogli la classica forma cilindrica del polpettone.',
      'Avvolgi il polpettone nella carta da forno stringendo i lati a caramella per trattenere tutti i succhi e mantenerlo umido.',
      'Inforna a 180°C in forno statico preriscaldato per 35 minuti.',
      'Apri poi il cartoccio di carta forno, spennella la superficie del polpettone con un filo d\'olio extravergine e prosegui la cottura per altri 10-15 minuti per farlo dorare.',
      'Sforna, lascia intiepidire per 10 minuti prima di affettare e servire caldo.'
    ],
    seasoningTips: 'Perfetto se servito con un contorno di funghi trifolati o una salsa leggera a base di yogurt greco, erba cipollina e un filo d\'olio a crudo per bilanciare la dolcezza della zucca.',
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-247',
    title: 'Strudel di cavolo viola',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'vegan'],
    ingredients: [
      { name: 'Pasta sfoglia (anche senza glutine)', amount: 1, unit: 'rotolo' },
      { name: 'Cavolo viola affettato', amount: 400, unit: 'g' },
      { name: 'Mela rossa a cubetti', amount: 1, unit: '' },
      { name: 'Pinoli', amount: 30, unit: 'g' },
      { name: 'Uvetta', amount: 30, unit: 'g' },
      { name: 'Cipolla rossa', amount: 0.5, unit: '' },
      { name: 'Aceto di mele', amount: 1, unit: 'cucchiaio' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale e pepe', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Affetta finemente il cavolo viola e la cipolla rossa.',
      'In una padella capiente, scalda l\'olio d\'oliva e rosola la cipolla. Aggiungi il cavolo viola e la mela tagliata a cubetti piccoli.',
      'Sfuma con l\'aceto di mele, copri e lascia appassire per circa 15-20 minuti, mescolando di tanto in tanto. Aggiungi sale, pepe, pinoli e uvetta.',
      'Lascia raffreddare completamente il ripieno prima di procedere.',
      'Stendi il rotolo di pasta sfoglia, distribuisci il ripieno al centro e richiudi i lembi formando uno strudel.',
      'Pratica dei piccoli tagli obliqui sulla superficie e inforna a 200°C per circa 25 minuti, fino a renderla croccante e dorata.'
    ],
    seasoningTips: 'Ottimo se servito tiepido con una salsina di yogurt vegetale aromatizzata all\'erba cipollina e un pizzico di senape in grani.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-248',
    title: 'Nituké di verdure',
    category: 'side',
    difficulty: 'easy',
    timeMin: 25,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'vegan'],
    ingredients: [
      { name: 'Carote', amount: 2, unit: '' },
      { name: 'Cipolle bionde', amount: 2, unit: '' },
      { name: 'Zucca o cavolo cappuccio', amount: 200, unit: 'g' },
      { name: 'Olio extravergine d\'oliva', amount: 1, unit: 'cucchiaio' },
      { name: 'Salsa tamari o shoyu (senza glutine)', amount: 1, unit: 'cucchiaio' },
      { name: 'Zenzero fresco grattugiato', amount: 1, unit: 'pizzico' },
      { name: 'Acqua', amount: 50, unit: 'ml' }
    ],
    instructions: [
      'Taglia tutte le verdure a pezzetti piccoli o fette sottili di dimensioni uniformi.',
      'In una pentola dal fondo spesso, scalda l\'olio e salta brevemente le cipolle per 2 minuti.',
      'Aggiungi le carote e il cavolo (o la zucca) mescolando bene a fuoco vivo.',
      'Aggiungi l\'acqua, copri immediatamente con un coperchio pesante e abbassa la fiamma al minimo: lascia cuocere le verdure nel loro vapore per 15 minuti.',
      'A fine cottura, rimuovi il coperchio, aumenta la fiamma e unisci la salsa tamari con lo zenzero grattugiato.',
      'Salta gli ingredienti per un minuto per far evaporare il liquido residuo, amalgamando bene tutti i sapori prima di servire.'
    ],
    seasoningTips: 'Accompagna il Nituké con un pizzico di semi di sesamo tostati a secco (Gomasio) per una nota croccante e ricca di prezioso calcio.',
    proteinType: 'veg',
    hasCarbs: false,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-249',
    title: 'Budino raw al cioccolato e caco',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 10,
    servings: 2,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegetarian', 'vegan', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Cachi maturi e morbidi', amount: 2, unit: '' },
      { name: 'Cacao amaro in polvere', amount: 2, unit: 'cucchiai' },
      { name: 'Crema di mandorle o nocciole 100%', amount: 1, unit: 'cucchiaio' },
      { name: 'La polpa di mezza bacca di vaniglia (o estratto)', amount: 1, unit: 'goccia' },
      { name: 'Granella di fave di cacao o nocciole per decorare', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Pela i cachi maturi e rimuovi l\'estremità superiore ed eventuali semi interni, raccogliendo solo la polpa morbida e succosa.',
      'Inserisci nel boccale del frullatore la polpa di cachi, il cacao amaro, la crema di mandorle 100% e la vaniglia.',
      'Frulla alla massima velocità per circa 1-2 minuti, finché non ottieni una consistenza setosa, lucida e priva di grumi.',
      'Versa subito la crema ottenuta in due bicchieri o coppette di vetro.',
      'Riponi in frigorifero per almeno 1 ora: l\'interazione tra la pectina naturale dei cachi maturi e il cacao solidificherà naturalmente il composto senza addensanti o gelatine.',
      'Decora con una cascata di granella di fave di cacao o nocciole tritate prima di servire fresco.'
    ],
    seasoningTips: 'Sublime se arricchito con una spolverata superficiale di cannella macinata o un pizzico di scorza d\'arancia bio grattugiata al momento del servizio.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: false
  },
  {
    id: 'meal-250',
    title: 'Pasta con pesto vegetale',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'vegan'],
    ingredients: [
      { name: 'Pasta tipo penne o spaghetti (anche senza glutine)', amount: 320, unit: 'g' },
      { name: 'Zucchine dolci o foglioline di spinaci freschi', amount: 200, unit: 'g' },
      { name: 'Foglie di basilico fresco', amount: 30, unit: 'g' },
      { name: 'Mandorle pelate o pinoli sbucciati', amount: 40, unit: 'g' },
      { name: 'Lievito alimentare in scaglie', amount: 2, unit: 'cucchiai' },
      { name: 'Olio extravergine d\'oliva di qualità', amount: 4, unit: 'cucchiai' },
      { name: 'Aglio (facoltativo)', amount: 1, unit: 'spicchio' },
      { name: 'Sale marino d\'acqua', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Metti a bollire l\'acqua salandola moderatamente all\'ebollizione, e cuoci la tua pasta preferita secondo i tempi indicati.',
      'Nel boccale del frullatore unisci le zucchine (crude per un sapore freschissimo) o gli spinacini freschi, il basilico lavato, le mandorle pelate, il lievito alimentare, l\'olio extravergine d\'oliva e un pizzico di sale.',
      'Frulla a impulsi aggiungendo 2-3 cucchiai di acqua tiepida della pasta in modo da emulsionare e formare un pesto setoso e cremoso.',
      'Scola la pasta al dente tenendo da parte un po\' di acqua di cottura della pasta.',
      'Condisci la pasta in una ciotola capiente aggiungendo il pesto vegetale preparato all\'istante senza riscaldarlo sul fuoco, per preservare la brillantezza delle erbe.',
      'Mescola energicamente allungando con pochissima acqua di cottura se occorre, e servila calda.'
    ],
    seasoningTips: 'Ideale se completata con pomodorini datterini confit tagliati a metà o una manciata di pinoli croccanti precedentemente tostati in padella.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-251',
    title: 'Cotolette di seitan croccanti',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 20,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian'],
    ingredients: [
      { name: 'Seitan al naturale (in fette)', amount: 300, unit: 'g' },
      { name: 'Latte di soia non dolcificato', amount: 100, unit: 'ml' },
      { name: 'Farina tipo 2 o farina di ceci', amount: 50, unit: 'g' },
      { name: 'Pangrattato (anche senza glutine)', amount: 100, unit: 'g' },
      { name: 'Scorza di limone grattugiata', amount: 1, unit: 'pizzico' },
      { name: 'Erbe aromatiche tritate (salvia, rosmarino)', amount: 1, unit: 'cucchiaio' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'In un piatto fondo, prepara la pastella mescolando la farina con il latte di soia non dolcificato e un pizzico di sale, fino a ottenere un composto fluido e senza grumi.',
      'In un altro piatto, unisci il pangrattato con la scorza di limone grattugiata, le erbe aromatiche tritate e un pizzico di pepe.',
      'Passa ogni fetta di seitan prima nella pastella liquiva, facendola aderire bene su entrambi i lati, e poi nel pangrattato aromatico, premendo delicatamente per creare una panatura uniforme.',
      'Scalda due cucchiai di olio extravergine d\'oliva in una padella antiaderente e cuoci le cotolette a fuoco medio-alto per circa 3-4 minuti per lato, finché non risulteranno dorate e croccanti.',
      'In alternativa, disponile su una teglia con carta forno, spennella con un goccio d\'olio e cuoci in forno statico preriscaldato a 200°C per 15-20 minuti, girandole a metà cottura.'
    ],
    seasoningTips: 'Accompagna le cotolette con una maionese vegana fatta in casa all\'erba cipollina o spruzzale semplicemente con succo di limone fresco per esaltarne la croccantezza.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-252',
    title: 'Nuggets di tofu speziati al forno',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Tofu al naturale', amount: 400, unit: 'g' },
      { name: 'Salsa di soia tamari (senza glutine)', amount: 2, unit: 'cucchiai' },
      { name: 'Curry o paprika dolce', amount: 1, unit: 'cucchiaino' },
      { name: 'Farina di mais finissima (fioretto)', amount: 50, unit: 'g' },
      { name: 'Amido di mais', amount: 2, unit: 'cucchiai' },
      { name: 'Acqua tiepida', amount: 50, unit: 'ml' },
      { name: 'Olio extravergine d\'oliva', amount: 1, unit: 'cucchiaio' },
      { name: 'Sale marino', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Spremi bene il tofu premendolo delicatamente con un canovaccio per eliminare l\'acqua in eccesso e taglialo a cubetti o spezzettalo con le mani per ottenere una forma rustica.',
      'In una ciotola, lascia marinare i bocconcini di tofu con la salsa di soia e le spezie (curry o paprika) per circa 10 minuti.',
      'Prepara una pastella leggera mescolando l\'amido di mais con l\'acqua tiepida e un pizzico di sale.',
      'Prepara un piatto con la farina di mais fioretto.',
      'Passa ciascun bocconcino di tofu prima nella pastella e subito dopo nella farina di mais, impanandolo in maniera omogenea.',
      'Disponi i nuggets su una teglia foderata di carta forno, distribuisci sopra un filo d\'olio d\'oliva e cuoci in forno pre-riscaldato a 200°C ventilato per 15-20 minuti, girandoli a metà tempo per renderli croccantissimi.'
    ],
    seasoningTips: 'Servili bollenti accompagnandoli con una salsa leggera al tahini, succo di limone e aceto di mele, oppure un ketchup artigianale biologico senza zuccheri raffinati aggiunti.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-253',
    title: 'Burger vegani di patate dolci e lenticchie',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 35,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Lenticchie cotte e scolate bene', amount: 240, unit: 'g' },
      { name: 'Polpa di patata dolce (cotta al vapore)', amount: 200, unit: 'g' },
      { name: 'Farina di avena senza glutine', amount: 50, unit: 'g' },
      { name: 'Cipolla tritata finemente', amount: 0.5, unit: '' },
      { name: 'Cumino in polvere', amount: 1, unit: 'pizzico' },
      { name: 'Prezzemolo fresco tritato', amount: 1, unit: 'cucchiaio' },
      { name: 'Olio extravergine d\'oliva', amount: 1, unit: 'cucchiaio' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'In una padella antiaderente, fai appassire la cipolla tritata finemente con un cucchiaino d\'olio d\'oliva per 4 minuti.',
      'In un mixer o in una capace ciotola, unisci le lenticchie cotte e ben scolate, la polpa schiacciata della patata dolce cotta a vapore, la cipolla appassita, il prezzemolo, il cumino e un pizzico di sale e pepe.',
      'Frulla brevemente a impulsi o schiaccia vigorosamente con una forchetta in modo da lasciare della consistenza rustica e non rendere tutto un purè uniforme.',
      'Unisci la farina d\'avena poco alla volta fino a quando il composto non risulterà ben manipolabile e compatto.',
      'Modella 4 burger regolari con le mani o aiutandoti con un coppapasta rotondo.',
      'Posa i burger su una leccarda con carta da forno, spennellali con poco olio d\'oliva e cuoci a 195°C per 20-25 minuti, voltandoli a metà cottura fino a leggera doratura.'
    ],
    seasoningTips: 'Ideale se servito al piatto con un letto di insalatina novella e una delicata emulsione di avocado schiacciato, lime e un pizzico di sale marino.',
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-254',
    title: 'Pasta con crema di ceci e zucchine',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian'],
    ingredients: [
      { name: 'Pasta tipo calamarata o mezze maniche', amount: 320, unit: 'g' },
      { name: 'Ceci cotti (scolati e sciacquati)', amount: 240, unit: 'g' },
      { name: 'Zucchine verdi medie', amount: 2, unit: '' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Foglie di menta o basilico fresco', amount: 6, unit: '' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale marino d\'acqua', amount: 1, unit: 'pizzico' },
      { name: 'Pepe nero macinato fresco', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Metti a bollire abbondante acqua salata e cuoci la pasta al dente.',
      'Nel frattempo, lava le zucchine e tagliale a rondelle sottili.',
      'In una padella capiente scalda un cucchiaio d\'olio con lo spicchio d\'aglio schiacciato, poi unisci le zucchine e cuocile a fuoco medio-alto per 8-10 minuti, tenendone qualcuna da parte intera per la decorazione finale.',
      'Versa i ceci cotti in un boccale, unisci tre quarti delle zucchine cotte, un pizzico di sale, pepe, le foglioline di menta o basilico e un filo d\'olio d\'oliva.',
      'Frulla il tutto con un frullatore a immersione aggiungendo 1-2 mestoli di acqua calda di cottura della pasta, fino ad ottenere una crema liscia, vellutata e corposa.',
      'Scola la pasta direttamente nella padella con le zucchine rimaste, aggiungi la crema di ceci e zucchine e salta a fuoco spento amalgamando bene.',
      'Impiatta completando con un filo d\'olio a crudo, le zucchine a rondelle tenute da parte e una spolverata di pepe macinato fresco.'
    ],
    seasoningTips: 'Puoi arricchire questo piatto equilibrato aggiungendo della granella di pistacchi tostati sulla superficie o delle scorzette di limone per una fresca nota acidula.',
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-255',
    title: 'Crema di lenticchie con cipolle caramellate',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 30,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Lenticchie marroni o verdi (anche precotte)', amount: 400, unit: 'g' },
      { name: 'Cipolle dorate grandissime', amount: 2, unit: '' },
      { name: 'Brodo vegetale', amount: 500, unit: 'ml' },
      { name: 'Carota', amount: 1, unit: '' },
      { name: 'Costa di sedano', amount: 1, unit: '' },
      { name: 'Zucchero di canna o sciroppo d\'acero', amount: 1, unit: 'cucchiaio' },
      { name: 'Aceto balsamico di Modena', amount: 1, unit: 'cucchiaio' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'In una pentola con un cucchiaio d\'olio d\'oliva, fai rosolare la carota, il sedano e una mezza cipolla tritati finemente per 5 minuti.',
      'Aggiungi le lenticchie ben sciacquate e copri con il brodo vegetale caldo. Porta a bollore e lascia cuocere a fuoco lento per circa 20-25 minuti (meno se usi lenticchie precotte), finché non sono morbidissime.',
      'Nel frattempo prepara le cipolle caramellate: affetta la restante cipolla e mezza a fettine sottili.',
      'In una padella antiaderente, scalda un cucchiaio d\'olio e aggiungi le cipolle affettate. Fai cuocere a fuoco basso per 10 minuti fino a quando diventano traslucide e morbide.',
      'Sfuma le cipolle con l\'aceto balsamico e unisci lo zucchero di canna o lo sciroppo d\'acero. Continua la cottura a fuoco bassissimo per altri 10 minuti, mescolando spesso finché non saranno lucide, scure e dolci.',
      'Frulla le lenticchie cotte direttamente nella pentola con un frullatore a immersione fino a ottenere una crema liscia, vellutata e densa (se necessario, regola la consistenza con altro brodo caldo).',
      'Servi la crema di lenticchie ben calda nei piatti individuali, guarnendo ogni porzione al centro con un generoso cucchiaio di cipolle caramellate calde e un filo di olio extravergine d\'oliva a crudo.'
    ],
    seasoningTips: 'Un abbinamento straordinario consiste nell\'aggiungere crostini di pane integrale aromatizzati al timo sfregati con aglio per una piacevole nota croccante e aromatica.',
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-256',
    title: 'Pasta con asparagi e zucchine allo zafferano',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 4,
    season: 'spring',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta tipo penne o fusilli (anche senza glutine)', amount: 320, unit: 'g' },
      { name: 'Asparagi freschi', amount: 250, unit: 'g' },
      { name: 'Zucchine verdi medie', amount: 2, unit: '' },
      { name: 'Zafferano in polvere', amount: 1, unit: 'bustina' },
      { name: 'Scalogno', amount: 1, unit: '' },
      { name: 'Panna vegetale o formaggio spalmabile leggero', amount: 100, unit: 'g' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale e pepe bianco', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Metti a bollire l\'acqua per la pasta in una capace pentola e salala all\'ebollizione.',
      'Pulisci gli asparagi eliminando la parte finale più dura e legnosa, poi taglia i gambi a rondelle sottili e mantieni intatte le punte più tenere.',
      'Taglia anche le zucchine a julienne o a rondelle sottilissime.',
      'In una padella capiente scalda l\'olio d\'oliva e rosola lo scalogno tritato finemente insieme ai pezzetti di asparagi (gambi e punte) per circa 5 minuti.',
      'Unisci le zucchine e prosegui la cottura a fuoco vivo per altri 5 minuti, mantenendo le verdure croccanti e colorate.',
      'Nel frattempo cuoci la pasta al dente.',
      'Sciogli lo zafferano in polvere in mezzo mestolo di acqua calda di cottura della pasta, poi versalo nella padella con le verdure insieme alla panna vegetale, mescolando sul fuoco dolce fino ad ottenere un condimento cremoso e di un bellissimo colore giallo intenso.',
      'Scola la pasta ben al dente direttamente nella padella con il sugo allo zafferano e salta energicamente per legare i sapori, aggiungendo se necessario un goccio extra di acqua di cottura.',
      'Impiatta e completa a piacere con una macinata di pepe bianco fresco o un filo d\'olio a crudo.'
    ],
    seasoningTips: 'Meravigliosa se completata con un goccio di scorza di limone biologico grattugiata finissima all\'ultimo momento, così da dare dinamismo e freschezza al sapore cremoso dello zafferano.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-257',
    title: 'Infarinata toscana con cavolo nero e fagioli',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 50,
    servings: 4,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Cavolo nero (pulito e sfogliato)', amount: 300, unit: 'g' },
      { name: 'Fagioli borlotti cotti (con la loro acqua)', amount: 300, unit: 'g' },
      { name: 'Farina di mais bramata o fioretto', amount: 150, unit: 'g' },
      { name: 'Doppio concentrato di pomodoro', amount: 2, unit: 'cucchiai' },
      { name: 'Cipolla, carota e costa di sedano', amount: 1, unit: 'misto' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Olio extravergine d\'oliva', amount: 3, unit: 'cucchiai' },
      { name: 'Rametto di rosmarino', amount: 1, unit: '' },
      { name: 'Sale marino e pepe nero', amount: 1, unit: 'qb' },
      { name: 'Acqua o brodo vegetale leggero', amount: 1, unit: 'l' }
    ],
    instructions: [
      'In una pentola capiente (preferibilmente di terracotta o dal fondo spesso), prepara il soffritto facendo dorare un trito fine di cipolla, carota e sedano con due cucchiai di olio d\'oliva e lo spicchio d\'aglio intero rimovibile.',
      'Aggiungi il cavolo nero lavato, privato della costola centrale coriacea e tagliato a striscioline sottili, facendolo appassire per pochi minuti a fuoco lento.',
      'Frulla metà dei fagioli borlotti con poca acqua di cottura fino ad ottenere una crema, tenendo l\'altra metà interi. Unisci la crema di fagioli, i fagioli interi e la loro acqua di conservazione nella pentola.',
      'Aggiungi il doppio concentrato di pomodoro diluito in poca acqua tiepida e il rametto di rosmarino (legato per poterlo poi rimuovere facilmente). Versa il brodo vegetale leggero o acqua bollente.',
      'Copri con il coperchio e lascia sobbollire delicatamente per circa 25-30 minuti, finché le foglie di cavolo nero non saranno tenere.',
      'Elimina lo spicchio d\'aglio e il rametto di rosmarino, quindi versa la farina di mais a pioggia nella pentola, mescolando velocemente con una frusta per evitare la formazione di grumi.',
      'Continua la cottura per altri 15-20 minuti a fiamma bassissima, girando costantemente con un cucchiaio di legno per mantenerla omogenea e non farla attaccare sul fondo, fino a quando non si sarà addensata come una vellutata ricca.',
      'Regola di sale, unisci una spolverata generosa di pepe nero macinato fresco e servi fumante completando con un filo di olio extravergine d\'oliva a crudo.'
    ],
    seasoningTips: 'La tradizione toscana vuole che l\'infarinata sia superba riscaldata il giorno successivo, tagliata a fette e gratinata o passata in padella con un pizzico d\'olio fino a far dorare i bordi.',
    proteinType: 'legumes',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-258',
    title: 'Carpaccio di barbabietola',
    category: 'side',
    difficulty: 'easy',
    timeMin: 15,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Barbabietole rosse precotte', amount: 500, unit: 'g' },
      { name: 'Rucola fresca', amount: 50, unit: 'g' },
      { name: 'Gherigli di noci', amount: 30, unit: 'g' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Succo di limone', amount: 1, unit: 'cucchiaio' },
      { name: 'Aceto balsamico di Modena', amount: 1, unit: 'cucchiaino' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Affetta finemente le barbabietole rosse precotte aiutandoti con una mandolina per ottenere fette sottilissime.',
      'Disponi le fette di barbabietola leggermente sovrapposte su un piatto da portata grande, creando un cerchio.',
      'Lava e asciuga delicatamente la rucola fresca e distribuiscila al centro del piatto sopra il carpaccio.',
      'Trita grossolanamente i gherigli di noci e cospargili sulla rucola e sulle barbabietole.',
      'In una ciotolina prepara un\'emulsione sbattendo con una forchetta l\'olio extravergine d\'oliva, il succo di limone fresco, l\'aceto balsamico e un pizzico di sale e pepe.',
      'Irrora uniformemente il carpaccio con la citronette preparata appena prima di servire in tavola.'
    ],
    seasoningTips: 'Per un tocco extra saporito non vegano, puoi arricchire il piatto con scaglie di Parmigiano Reggiano o di formaggio caprino stagionato.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-259',
    title: 'Torta salata con cime di rapa e pomodorini secchi',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 45,
    servings: 4,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegetarian'],
    ingredients: [
      { name: 'Pasta sfoglia (anche senza glutine)', amount: 1, unit: 'rotolo' },
      { name: 'Cime di rapa pulite', amount: 500, unit: 'g' },
      { name: 'Pomodori secchi sott\'olio sgocciolati', amount: 60, unit: 'g' },
      { name: 'Uova', amount: 3, unit: '' },
      { name: 'Formaggio spalmabile leggero o ricotta bianca', amount: 200, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Peperoncino secco macinato', amount: 1, unit: 'pizzico' },
      { name: 'Olio extravergine d\'oliva', amount: 1, unit: 'cucchiaio' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Pulisci le cime di rapa selezionando le foglie più tenere e le cime. Lavale e sbollentale in acqua salata per 5 minuti.',
      'Scola bene le cime di rapa e strizzale delicatamente per eliminare l\'acqua in eccesso.',
      'In una padella scalda l\'olio con lo spicchio d\'aglio e un pizzico di peperoncino. Salta le cime di rapa per 5-7 minuti per farle insaporire, poi rimuovi l\'aglio.',
      'Taglia i pomodori secchi a pezzetti.',
      'In una ciotola sbatti le uova con la ricotta (o formaggio spalmabile), un pizzico di sale, pepe e unisci le cime di rapa tiepide e i pomodori secchi.',
      'Stendi la pasta sfoglia in una tortiera con la sua carta da forno, bucherella il fondo con una forchetta e versa il composto ottenuto.',
      'Ripiega i bordi verso l\'interno e inforna nel forno preriscaldato statico a 180°C per circa 30-35 minuti, fino a rendere la sfoglia dorata e il ripieno ben rassodato.'
    ],
    seasoningTips: 'Per una versione super saporita, puoi aggiungere cubetti di provola affumicata light o cospargere la superficie con semi di sesamo prima di infornare.',
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-260',
    title: 'Cotoletta di sedano rapa',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 30,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian'],
    ingredients: [
      { name: 'Sedano rapa grande', amount: 1, unit: '' },
      { name: 'Farina di ceci', amount: 60, unit: 'g' },
      { name: 'Acqua fredda', amount: 100, unit: 'ml' },
      { name: 'Pangrattato (anche senza glutine)', amount: 120, unit: 'g' },
      { name: 'Paprika dolce', amount: 1, unit: 'cucchiaino' },
      { name: 'Aglio in polvere', amount: 1, unit: 'pizzico' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Pela accuratamente il sedano rapa eliminando la buccia esterna coriacea e taglialo a fette spesse circa 1 centimetro.',
      'Sbollenta le fette di sedano rapa in acqua calda leggermente salata per 5 minuti in modo da ammorbidirle leggermente, poi scola e asciuga benissimo con cura.',
      'In un piatto fondo prepara la pastella mescolando con una frusta la farina di ceci con l\'acqua fredda, la paprika dolce, l\'aglio in polvere, sale e pepe fino a renderla fluida.',
      'In un altro piatto metti il pangrattato.',
      'Passa ciascuna fetta di sedano rapa prima nella pastella di ceci, rivestendola completamente, e poi premila nel pangrattato facendolo aderire perfettamente per creare una crosticina spessa.',
      'Adagia le cotolette di sedano rapa su una leccarda coperta di carta forno, spennella con un po\' di olio extravergine d\'oliva ed inforna a 200°C ventilato per 20 minuti, girandole a metà cottura per renderle dorate e super scrocchianti da entrambi i lati.'
    ],
    seasoningTips: 'Meravigliose se servite calde con uno spicchio di limone da spremere sopra e accompagnate da un contorno fresco di carote e finocchi alla julienne.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-261',
    title: 'Muffin vegani agli spinaci',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 30,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian'],
    ingredients: [
      { name: 'Spinaci freschi novelli (o già cotti)', amount: 200, unit: 'g' },
      { name: 'Farina tipo 2 (o farina di farro)', amount: 200, unit: 'g' },
      { name: 'Fecola di patate', amount: 30, unit: 'g' },
      { name: 'Lievito istantaneo per torte salate', amount: 12, unit: 'g' },
      { name: 'Latte di soia non dolcificato', amount: 150, unit: 'ml' },
      { name: 'Olio extravergine d\'oliva', amount: 40, unit: 'ml' },
      { name: 'Lievito alimentare in scaglie', amount: 2, unit: 'cucchiai' },
      { name: 'Sale marino e pepe nero', amount: 1, unit: 'pizzico' },
      { name: 'Noce moscata', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Se usi spinaci freschi, lavali e falli appassire in padella senza acqua per 5 minuti, lasciali intiepidire e strizzali benissimo per eliminare ogni liquido residuo prima di tritarli finemente.',
      'In una ciotola capiente, unisci la farina tipo 2, la fecola di patate, il lievito istantaneo, il lievito alimentare in scaglie, sale, pepe e un pizzico di noce moscata.',
      'In un frullatore, emulsiona il latte di soia non dolcificato con l\'olio extravergine d\'oliva e gli spinaci strizzati fino a ottenere una crema liscia e verde neon.',
      'Versa gli ingredienti liquidi nella ciotola dei secchi e mescola delicatamente con una spatola, amalgamando l\'impasto senza lavorarlo troppo.',
      'Distribuisci il composto in uno stampo da muffin con i pirottini di carta, riempiendoli per circa 3/4.',
      'Inforna a 180°C in forno statico preriscaldato per 20-22 minuti. Fai la prova stecchino prima di sfornare.'
    ],
    seasoningTips: 'Deliziosi se arricchiti all\'interno prima della cottura con pomodorini secchi a pezzetti o una manciata di semi di girasole tostati, oppure accompagnati tiepidi da una mousse leggera di tofu alle erbe.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-262',
    title: 'Spiedini di polpo e taccole con salsa di rabarbaro e lamponi',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 30,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free', 'lactose-free', 'fish'],
    ingredients: [
      { name: 'Polpo fresco (già pulito)', amount: 600, unit: 'g' },
      { name: 'Taccole', amount: 200, unit: 'g' },
      { name: 'Rabarbaro (gambi)', amount: 150, unit: 'g' },
      { name: 'Lamponi freschi', amount: 100, unit: 'g' },
      { name: 'Sciroppo d\'acero o miele', amount: 1, unit: 'cucchiaio' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale e pepe rosa', amount: 1, unit: 'qb' },
      { name: 'Succo di limone', amount: 1, unit: 'cucchiaio' }
    ],
    instructions: [
      'Lessa il polpo in acqua bollente salata per circa 20-30 minuti fino a quando risulterà tenero, poi scolalo e taglia i tentacoli a pezzetti di circa 3-4 cm.',
      'Pulisci le taccole e sbollentale per 3 minuti in acqua salata, poi scolale e passale in acqua e ghiaccio per mantenere il colore verde brillante.',
      'Prepara la salsa: taglia il rabarbaro a pezzetti e fallo cuocere in un pentolino con i lamponi, lo sciroppo d\'acero ed un goccio d\'acqua per circa 10-12 minuti, finché non si sfaldano.',
      'Frulla la salsa di rabarbaro e lamponi, poi filtrala con un colino per ottenere una prima consistenza liscia e lucida.',
      'Componi gli spiedini alternando pezzetti di polpo e taccole piegate su se stesse.',
      'Scalda una piastra o griglia e scotta gli spiedini per 2 minuti per lato, spennellandoli con un emulsione di olio d\'oliva, succo di limone e un pizzico di sale.',
      'Servi gli spiedini caldi o tiepidi accompagnati dalla salsa acidula di rabarbaro e lamponi.'
    ],
    seasoningTips: 'Un abbinamento estivo strepitoso si ottiene decorando con una grattugiata leggera di scorza di lime fresca sugli spiedini appena grigliati.',
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-263',
    title: 'Ricotta con zucchine, basilico e pesto di mandorle',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 15,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Ricotta fresca', amount: 400, unit: 'g' },
      { name: 'Zucchine novelle romanesche', amount: 3, unit: '' },
      { name: 'Mandorle pelate', amount: 50, unit: 'g' },
      { name: 'Foglie di basilico fresco', amount: 30, unit: 'g' },
      { name: 'Olio extravergine d\'oliva', amount: 3, unit: 'cucchiai' },
      { name: 'Parmigiano Reggiano grattugiato', amount: 1, unit: 'cucchiaio' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' },
      { name: 'Scorza di limone biologico', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Affetta finemente le zucchine per il lungo o a rondelle e grigliale su una piastra ben calda per un paio di minuti per lato, poi condiscile con un filo d\'olio, sale e foglioline di basilico.',
      'Prepara il pesto di mandorle: nel boccale del mixer unisci le mandorle, le foglie di basilico lavate, l\'olio extravergine d\'oliva, un goccio d\'acqua fredda, il parmigiano e un pizzico di sale.',
      'Frulla a intermittenza fino ad ottenere un pesto rustico e granuloso, non eccessivamente fine.',
      'In una ciotola, lavora la ricotta fresca con una forchetta, aggiungendo un goccio d\'olio d\'oliva e la scorza di limone grattugiata fino a renderla cremosa.',
      'Adagia la crema di ricotta sul fondo dei piatti, disponi sopra le zucchine grigliate e completa distribuendo generosamente il pesto di mandorle fresco.'
    ],
    seasoningTips: 'Servi questo fresco piatto estivo con fette di pane di segale o integrale tostato per un pranzo leggero e bilanciato.',
    proteinType: 'cheese',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-264',
    title: 'Tartare di manzo, sbrisolona al parmigiano e maionese al curry',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 20,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Filetto o scamone di manzo freschissimo (tagliato al coltello)', amount: 480, unit: 'g' },
      { name: 'Parmigiano Reggiano grattugiato', amount: 60, unit: 'g' },
      { name: 'Farina di riso o mais', amount: 40, unit: 'g' },
      { name: 'Burro chiarificato freddo', amount: 30, unit: 'g' },
      { name: 'Maionese leggera', amount: 80, unit: 'g' },
      { name: 'Curry dolce in polvere', amount: 1, unit: 'cucchiaio' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Prepara la sbrisolona salata: in una ciotola sfrega con le dita la farina di riso, il parmigiano ed il burro freddo a pezzetti fino ad ottenere delle briciole grossolane. Cuoci su una teglia con carta forno a 180°C per 10-12 minuti fino a doratura, poi lascia raffreddare.',
      'In una tazzina unisci la maionese leggera con il curry in polvere ed un cucchiaino di acqua tiepida per renderla fluida e liscia.',
      'Condisci la carne di manzo tagliata finemente al coltello con l\'olio extravergine d\'oliva, un pizzico di sale e pepe nero macinato fresco di mulinello.',
      'Posa un coppapasta sul piatto e crea un disco compatto di tartare di manzo.',
      'Decora la superficie con le briciole croccanti di sbrisolona al parmigiano.',
      'Disegna delle gocce o righe di maionese al curry intorno alla tartare prima di servire immediatamente.'
    ],
    seasoningTips: 'Un piatto sontuoso e gourmet, ideale da abbinare a una fresca insalatina di valeriana e mela verde acidula per contrastare la ricchezza del parmigiano e del curry.',
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false
  },
  {
    id: 'meal-265',
    title: 'Frittata di zucchine classica al forno',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['vegetarian', 'gluten-free', 'lactose-free'],
    ingredients: [
      { name: 'Uova biologiche fresche', amount: 6, unit: '' },
      { name: 'Zucchine verdi medie', amount: 2, unit: '' },
      { name: 'Cipollotto fresco', amount: 1, unit: '' },
      { name: 'Latte vegetale non dolcificato', amount: 30, unit: 'ml' },
      { name: 'Olio extravergine d\'oliva', amount: 1, unit: 'cucchiaio' },
      { name: 'Foglie di menta fresca', amount: 6, unit: '' },
      { name: 'Sale fine e pepe nero', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Lava le zucchine e tagliale a rondelle sottili. Affetta finemente il cipollotto.',
      'In una padella antiaderente, scalda l\'olio d\'oliva e rosola il cipollotto per 2 minuti, poi unisci le zucchine e lasciale cuocere per 7-8 minuti finché non si ammorbidiscono leggermente, regolando di sale.',
      'In una ciotola capiente sbatti energicamente le uova con il latte vegetale, un pizzico di sale, pepe e le foglioline di menta spezzettate.',
      'Unisci le zucchine tiepide al composto di uova e mescola bene.',
      'Fodera una teglia rotonda con carta da forno bagnata e strizzata, versa il composto di uova e zucchine uniformemente.',
      'Inforna a 180°C per circa 15-20 minuti, finché la frittata non risulterà ben gonfia, dorata in superficie e soda al centro.'
    ],
    seasoningTips: 'Ottima sia calda che fredda, perfetta tagliata a cubetti per un picnic estivo o un pranzo pratico all\'aperto.',
    proteinType: 'eggs',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-266',
    title: 'Pancake di piselli con coppa di culatello e stracciatella',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 25,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['gluten-free'],
    ingredients: [
      { name: 'Piselli freschi o surgelati (sbollentati)', amount: 150, unit: 'g' },
      { name: 'Farina di riso o d\'avena senza glutine', amount: 120, unit: 'g' },
      { name: 'Uovo', amount: 1, unit: '' },
      { name: 'Latte vegetale non dolcificato', amount: 120, unit: 'ml' },
      { name: 'Lievito istantaneo per torte salate', amount: 1, unit: 'cucchiaio' },
      { name: 'Coppa di culatello', amount: 120, unit: 'g' },
      { name: 'Stracciatella di bufala fresca', amount: 150, unit: 'g' },
      { name: 'Olio extravergine d\'oliva', amount: 1, unit: 'cucchiaio' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Sbollenta i piselli in acqua salata per 5 minuti, scolali e passali sotto l\'acqua fredda per sigillare il colore verde vivido.',
      'Nel bicchiere del frullatore, unisci i piselli, la farina di riso o d\'avena, l\'uovo, il latte vegetale, un pizzico di sale e pepe. Frulla fino ad ottenere una pastella liscia d\'un bel verde brillante.',
      'Unisci infine il lievito istantaneo per torte salate e amalgama bene.',
      'Scalda una padella antiaderente leggermente unta d\'olio d\'oliva, versa un mestolino di pastella alla volta per formare dei piccoli pancake rotondi e cuoci per 2 minuti per lato finché non si formano le bollicine in superficie.',
      'Adagia i pancake caldi sui piatti di servizio.',
      'Completa guarnendo ogni pancake con un cucchiaio generoso di stracciatella fresca a crudo e adagia sopra una fetta arricciata di coppa di culatello morbido.'
    ],
    seasoningTips: 'Un tocco gourmet eccezionale si ottiene spolverando la superficie con granella di pistacchi tostati o qualche goccia di aceto balsamico DOP di Modena.',
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true
  },
  {
    id: 'meal-267',
    title: 'Gnocchi di broccoli fatti in casa',
    category: 'lunch',
    difficulty: 'medium',
    timeMin: 35,
    servings: 4,
    season: 'winter',
    isWHOCompliant: true,
    tags: ['vegan', 'vegetarian', 'lactose-free'],
    ingredients: [
      { name: 'Broccoli (cimette fresche)', amount: 500, unit: 'g' },
      { name: 'Farina tipo 2 (o semola di grano duro)', amount: 150, unit: 'g' },
      { name: 'Pomodorini datterini', amount: 200, unit: 'g' },
      { name: 'Pinoli', amount: 20, unit: 'g' },
      { name: 'Aglio', amount: 1, unit: 'spicchio' },
      { name: 'Olio extravergine d\'oliva', amount: 2, unit: 'cucchiai' },
      { name: 'Sale e pepe nero', amount: 1, unit: 'qb' },
      { name: 'Basilico fresco', amount: 4, unit: 'foglie' }
    ],
    instructions: [
      'Pulisci i broccoli ricavando le cimette, lavale e cuocile a vapore per circa 10 minuti fino a renderle tenere.',
      'Scola i broccoli cotti e lasciali scivolare su un canovaccio pulito; strizzali con cura per eliminare quanta più acqua possibile.',
      'Frulla le cimette in un mixer fino ad ottenere una purea finissima e asciutta.',
      'Su una spianatoia versa la purea di broccoli e aggiungi la farina ed un pizzico di sale poco alla volta. Impasta rapidamente con le mani fino a ottenere un panetto morbido, compatto e facilmente manipolabile.',
      'Sulla spianatoia infarinata, ricava dei piccoli filoncini dello spessore di circa 1,5 cm, quindi tagliali a pezzetti per formare gli gnocchi.',
      'Prepara il condimento: in una padella rosola lo spicchio d\'aglio schiacciato con l\'olio d\'oliva, poi unisci i pomodorini tagliati a metà e cuoci per 5-7 minuti. Tosta i pinoli in un padellino a secco finché non saranno dorati.',
      'Cuoci gli gnocchi di broccoli in abbondante acqua bollente salata e, appena salgono a galla (1-2 minuti), scola con una schiumarola direttamente nella padella col sugo.',
      'Unisci il basilico fresco, salta delicatamente per insaporire, impiattando con una manciata di pinoli croccanti tostati ed un filo di olio a crudo.'
    ],
    seasoningTips: 'Per rinfrescare il piatto, grattugia un po\' di scorza di limone bio prima di servire, oppure aggiungi un cucchiaino di lievito alimentare in scaglie per una sfumatura formaggiosa interamente vegana.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-268',
    title: 'Cubotti zucca e cioccolato',
    category: 'dessert',
    difficulty: 'easy',
    timeMin: 40,
    servings: 4,
    season: 'autumn',
    isWHOCompliant: true,
    tags: ['vegetarian', 'vegan', 'lactose-free'],
    ingredients: [
      { name: 'Polpa di zucca (cotta al forno)', amount: 250, unit: 'g' },
      { name: 'Farina tipo 2 (o farina d\'avena)', amount: 150, unit: 'g' },
      { name: 'Cioccolato fondente in gocce o tritato', amount: 80, unit: 'g' },
      { name: 'Zucchero di canna integrale', amount: 80, unit: 'g' },
      { name: 'Olio di semi di girasole', amount: 50, unit: 'ml' },
      { name: 'Latte di mandorla (o altra bevanda vegetale)', amount: 50, unit: 'ml' },
      { name: 'Lievito per dolci', amount: 8, unit: 'g' },
      { name: 'Cannella in polvere', amount: 1, unit: 'pizzico' }
    ],
    instructions: [
      'Frulla la polpa di zucca cotta al forno (privata della buccia) insieme alla bevanda vegetale e all\'olio di semi fino ad ottenere una crema liscia ed omogenea.',
      'In una ciotola capiente, unisci la farina tipo 2, lo zucchero di canna, la cannella in polvere ed il lievito per dolci.',
      'Aggiungi la crema di zucca agli ingredienti secchi ed amalgama bene con una frusta a mano o con una spatola.',
      'Incorpora i tre quarti delle gocce di cioccolato fondente nell\'impasto.',
      'Rivesti una teglia rettangolare (circa 20x20 cm) con carta da forno, quindi versa l\'impasto livellandone la superficie con una spatola.',
      'Distribuisci le restanti gocce di cioccolato sulla superficie del dolce.',
      'Inforna a 180°C in forno statico preriscaldato per 25-30 minuti (fai la prova stecchino).',
      'Lascia raffreddare completamente prima di sformare e tagliare a cubotti.'
    ],
    seasoningTips: 'Divertiti ad aggiungere una spruzzata di cardamomo in polvere o servili con una tazza di infuso speziato per una merenda autunnale perfetta.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true
  },
  {
    id: 'meal-tacos-riso-avanzato',
    title: 'Tacos con riso avanzato (farcitura a scelta)',
    category: 'dinner',
    difficulty: 'easy',
    timeMin: 15,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['vegetarian', 'lactose-free'],
    ingredients: [
      { name: 'Tacos (gusci di mais)', amount: 4, unit: 'pz' },
      { name: 'Riso avanzato', amount: 150, unit: 'g' },
      { name: 'Fagioli neri o rossi (cotti)', amount: 100, unit: 'g' },
      { name: 'Pomodoro ramato', amount: 1, unit: 'pz' },
      { name: 'Lattuga o insalata', amount: 50, unit: 'g' },
      { name: 'Olio EVO, sale e spezie (cumino, paprika)', amount: 1, unit: 'qb' },
      { name: 'Condimenti a scelta (avocado, formaggio, salse)', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Scalda una padella con un filo d\'olio EVO e ripassa il riso avanzato per qualche minuto insieme a un pizzico di sale e le tue spezie preferite (come cumino o paprika) fino a renderlo caldo e saporito.',
      'Se utilizzi fagioli neri o rossi, uniscili al riso negli ultimi minuti per scaldarli e amalgamarli bene.',
      'Nel frattempo, scalda i gusci di tacos in forno preriscaldato a 180°C per circa 3-5 minuti, o in una padella antiaderente asciutta, per renderli fragranti.',
      'Prepara i condimenti freschi: taglia il pomodoro a cubetti e sminuzza la lattuga.',
      'Farcisci ciascun taco inserendo sul fondo una base di riso speziato caldo con i fagioli.',
      'Completa con la lattuga, il pomodoro a cubetti e qualsiasi altro ingrediente a tua scelta (es. avocado a fette, formaggio grattugiato, panna acida, lime o salse a piacere).'
    ],
    seasoningTips: 'Ottimo modo svuotafrigo! Puoi arricchire il ripieno aggiungendo straccetti di pollo avanzato, tonno sgocciolato, mais dolce o verdure cotte rimaste dal giorno prima.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: {
      calories: 380,
      protein: 10,
      carbs: 58,
      fat: 12
    }
  },
  // --- SPECIALE RICETTE PER LE VACANZE & SPIAGGIA (MAKE-AHEAD & POST-MARE) ---
  {
    id: 'beach-insalata-riso-venere',
    title: 'Insalata di riso Venere con zucchine croccanti, pomodorini e salmone (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'fish'],
    ingredients: [
      { name: 'Riso Venere nero o integrale', amount: 160, unit: 'g' },
      { name: 'Salmone affumicato o a vapore', amount: 120, unit: 'g' },
      { name: 'Zucchine fresche', amount: 2, unit: 'pz' },
      { name: 'Pomodorini pachino o datterini', amount: 150, unit: 'g' },
      { name: 'Olio EVO, succo di limone ed erba cipollina', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Lessare il riso Venere in abbondante acqua salata la sera prima per il tempo indicato (circa 20-25 minuti), poi scolarlo e lasciarlo raffreddare con un filo d\'olio.',
      'Tagliare le zucchine a julienne o a piccoli cubetti e saltarle 3 minuti in padella (devono restare croccanti).',
      'Unire al riso ormai freddo le zucchine, i pomodorini tagliati a metà e il salmone sfilacciato.',
      'Condire con olio EVO a crudo, poche gocce di limone ed erba cipollina fresca tritata.',
      'Riporre in contenitori ermetici in frigorifero tutta la notte. Trasferire nella borsa frigo con siberini al mattino per gustarla fresca sotto l\'ombrellone!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Perfetta da preparare la sera prima perché i sapori si amalgamano. Conserva in borsa frigo ben ghiacciata.',
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 420, protein: 22, carbs: 55, fat: 12 }
  },
  {
    id: 'beach-couscous-mediterraneo',
    title: 'Couscous freddo alle verdure grigliate, ceci, menta e feta croccante (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 15,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'vegetarian'],
    ingredients: [
      { name: 'Couscous integrale', amount: 150, unit: 'g' },
      { name: 'Ceci lessati (già cotti)', amount: 150, unit: 'g' },
      { name: 'Feta greca', amount: 100, unit: 'g' },
      { name: 'Mix verdure grigliate (zucchine, peperoni, melanzane)', amount: 200, unit: 'g' },
      { name: 'Menta fresca, basilico e olio EVO', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Reidratare il couscous con acqua calda salata (o brodo vegetale leggero) e un cucchiaio d\'olio EVO per 5 minuti coperto, poi sgranarlo con una forchetta e farlo raffreddare.',
      'Tagliare le verdure grigliate a pezzetti e sbriciolare la feta greca con le mani.',
      'Unire in una grande ciotola il couscous freddo, i ceci sciacquati e sgocciolati, le verdure e la feta.',
      'Profumare con abbondante menta fresca spezzettata e basilico.',
      'Conservare in frigo in vaschette monoporzione: ideale da mangiare comodamente col cucchiaio sul lettino in spiaggia!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Non si squaglia e non appesantisce. La menta regala una sensazione rinfrescante sotto il sole caldo.',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 410, protein: 18, carbs: 54, fat: 14 }
  },
  {
    id: 'beach-frittata-pasta-fredda',
    title: 'Frittata di pasta integrale a cubetti con spinacini e ricotta salata (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'vegetarian'],
    ingredients: [
      { name: 'Pasta corta integrale avanzata o cotta al dente', amount: 140, unit: 'g' },
      { name: 'Uova fresche biologiche', amount: 4, unit: 'pz' },
      { name: 'Spinacini freschi o cotti', amount: 100, unit: 'g' },
      { name: 'Ricotta salata o Parmigiano grattugiato', amount: 40, unit: 'g' },
      { name: 'Olio EVO, sale e pepe', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Sbattere le uova in una terrina con sale, pepe e il formaggio grattugiato.',
      'Aggiungere gli spinacini saltati o freschi tritati e la pasta corta.',
      'Cuocere in una padella antiaderente con un filo d\'olio a fuoco moderato da ambo i lati, oppure cuocere al forno a 180°C per 15-20 minuti per una versione più leggera.',
      'Lasciar raffreddare completamente la sera prima.',
      'Al mattino, tagliare la frittata a quadrotti da mangiare comodamente con le dita (finger food) senza bisogno di posate sotto l\'ombrellone!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Il finger food per eccellenza per le giornate di mare, praticissimo da dividere con la famiglia.',
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 390, protein: 21, carbs: 42, fat: 15 }
  },
  {
    id: 'beach-insalata-farro-pesto',
    title: 'Farro freddo al pesto leggero di basilico, pomodorini secchi e ciliegine di mozzarella (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 25,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'vegetarian'],
    ingredients: [
      { name: 'Farro perlato o farro monococco', amount: 160, unit: 'g' },
      { name: 'Ciliegine di mozzarella o bocconcini', amount: 120, unit: 'g' },
      { name: 'Pomodorini secchi sott\'olio ben sgocciolati', amount: 60, unit: 'g' },
      { name: 'Pesto fresco al basilico', amount: 3, unit: 'cucchiai' },
      { name: 'Pinoli tostati (opzionale)', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Cuocere il farro in acqua bollente salata per circa 20 minuti la sera prima, scolarlo e passarlo sotto acqua fredda per fermare la cottura.',
      'Condire subito con il pesto di basilico affinché i chicchi assorbano il profumo.',
      'Tagliare i pomodorini secchi a listarelle e unire le ciliegine di mozzarella tagliate a metà.',
      'Aggiungere una spolverata di pinoli tostati e mescolare il tutto.',
      'Conservare al fresco nella borsa termica: il farro mantiene una consistenza croccante eccellente anche dopo ore!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Il farro non scuoce mai, ideale da preparare in anticipo per 2 giorni consecutivi.',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 440, protein: 17, carbs: 58, fat: 16 }
  },
  {
    id: 'beach-wrap-pollo-avocado',
    title: 'Wrap di piadina integrale al pollo sfilacciato, avocado e insalatina croccante (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 15,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'white-meat'],
    ingredients: [
      { name: 'Piadine integrali o rotoli di tortilla', amount: 2, unit: 'pz' },
      { name: 'Petto di pollo alla piastra o avanzato', amount: 160, unit: 'g' },
      { name: 'Avocado maturo', amount: 1, unit: 'pz' },
      { name: 'Insalata iceberg o valeriana', amount: 60, unit: 'g' },
      { name: 'Succo di lime o limone e filo d\'olio EVO', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Sfilacciare o tagliare a striscioline il petto di pollo cotto e farlo raffreddare.',
      'Schiacciare la polpa dell\'avocado con una forchetta assieme a sale e succo di lime per evitare che annerisca.',
      'Spalmare la crema di avocado sulle piadine integrali.',
      'Distribuire l\'insalatina croccante e il pollo sfilacciato.',
      'Arrotolare strettamente ogni wrap, avvolgerli singolarmente in carta forno o pellicola alimentare e riporre in frigo.',
      'In spiaggia si mangiano sfilando la carta forno poco a poco senza sporcarsi le mani!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Il succo di lime nell\'avocado lo mantiene verde brillante e fresco.',
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 430, protein: 26, carbs: 45, fat: 16 }
  },
  {
    id: 'beach-insalata-ceci-tonno',
    title: 'Insalata estiva di ceci, tonno a pinne gialle, olive taggiasche e cipolla rossa dolce (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 10,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'fast', 'fish'],
    ingredients: [
      { name: 'Ceci lessati biologici', amount: 250, unit: 'g' },
      { name: 'Tonno all\'olio d\'oliva ben sgocciolato o al naturale', amount: 160, unit: 'g' },
      { name: 'Olive taggiasche snocciolate', amount: 40, unit: 'g' },
      { name: 'Cipolla rossa di Tropea (messa a bagno con aceto)', amount: 0.5, unit: 'pz' },
      { name: 'Pomodorini datterini freschi', amount: 120, unit: 'g' },
      { name: 'Origano profumato e olio EVO', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Sciacquare bene i ceci in scatola sotto acqua corrente per eliminare il liquido di governo e sgocciolarli.',
      'Tagliare la cipolla rossa a fettine sottilissime e lasciarla 10 minuti in acqua fredda e qualche goccia di aceto per renderla dolcissima e digeribile.',
      'Unire in una insalatiera i ceci, il tonno a pezzettoni, i pomodorini a metà, le olive taggiasche e la cipolla scolata.',
      'Condire con olio EVO, sale e un pizzico generoso di origano secco.',
      'Prontissima da trasportare nella borsa frigo, ricca di proteine di qualità che danno energia dopo lunghe nuotate.'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Zero fornelli! Si prepara in 8 minuti la sera prima ed è energizzante.',
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 380, protein: 25, carbs: 36, fat: 15 }
  },
  {
    id: 'beach-torta-salata-zucchine',
    title: 'Torta salata rustica di pasta sfoglia con zucchine julienne, stracchino e maggiorana (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 35,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'vegetarian'],
    ingredients: [
      { name: 'Rotolo di pasta sfoglia o brisée integrale', amount: 1, unit: 'pz' },
      { name: 'Zucchine verdi', amount: 3, unit: 'pz' },
      { name: 'Stracchino o ricotta vaccina', amount: 200, unit: 'g' },
      { name: 'Uova', amount: 2, unit: 'pz' },
      { name: 'Parmigiano grattugiato e maggiorana', amount: 40, unit: 'g' }
    ],
    instructions: [
      'Grattugiare le zucchine con una grattugia a fori larghi, salarle e strizzarle per eliminare l\'acqua in eccesso.',
      'Mescolare in una ciotola le zucchine strizzate, lo stracchino (o ricotta), le uova sbattute, il parmigiano e le foglioline di maggiorana.',
      'Stendere la sfoglia in una tortiera, bucherellare il fondo con una forchetta e versare il ripieno livellandolo bene.',
      'Cuocere in forno a 190°C per circa 30 minuti fino a doratura della crosta.',
      'Far raffreddare a temperatura ambiente, poi tagliare a fette rettangolari pronte da impacchettare per il pranzo all\'aperto.'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Golosa e amata anche dai bambini. Eccellente gustata a temperatura ambiente sotto gli alberi della pineta o in spiaggia.',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 420, protein: 16, carbs: 38, fat: 22 }
  },
  {
    id: 'beach-dinner-carpaccio-bresaola',
    title: 'Carpaccio di Bresaola della Valtellina con rughetta fresca, scaglie di Grana e limone (Cena Lampo Post-Mare)',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 5,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'fast', 'red-meat'],
    ingredients: [
      { name: 'Bresaola della Valtellina IGP (fettine sottili)', amount: 180, unit: 'g' },
      { name: 'Rucola selvatica lavata e asciugata', amount: 80, unit: 'g' },
      { name: 'Grana Padano o Parmigiano in scaglie', amount: 50, unit: 'g' },
      { name: 'Succo di limone fresco e olio EVO extravergine', amount: 1, unit: 'qb' },
      { name: 'Pane integrale croccante o grissini per accompagnare', amount: 100, unit: 'g' }
    ],
    instructions: [
      'Disporre le fettine di bresaola a raggiera su un ampio piatto da portata o su due piatti individuali.',
      'Adagiare al centro un generoso ciuffo di rucola selvatica freschissima.',
      'Cospargere l\'intera superficie con le scaglie di Grana ricavate con un pelapatate.',
      'Emulsionare in una ciotolina olio EVO, succo di limone appena spremuto e una macinata di pepe nero.',
      'Irrorare il carpaccio con l\'emulsione e servire immediatamente con pane croccante: cena pronta in 5 minuti cronometrati dopo la doccia al rientro dalla spiaggia!'
    ],
    seasoningTips: '🌅 Cena 0 stress post-mare: Nessuna cottura, zero calore in cucina, altissimo contenuto proteico rigenerante.',
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 320, protein: 34, carbs: 26, fat: 10 }
  },
  {
    id: 'beach-dinner-caprese-gourmet',
    title: 'Caprese estiva di Mozzarella di Bufala Campana, pomodoro Cuore di Bue e pesto al mortaio (Cena Lampo Post-Mare)',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 5,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'fast', 'vegetarian'],
    ingredients: [
      { name: 'Mozzarella di Bufala Campana DOP (a temperatura ambiente)', amount: 250, unit: 'g' },
      { name: 'Pomodoro Cuore di Bue maturo e saporito', amount: 2, unit: 'pz' },
      { name: 'Foglie di basilico fresco e gocce di pesto', amount: 1, unit: 'qb' },
      { name: 'Olio EVO fruttato, sale marino e origano', amount: 1, unit: 'qb' },
      { name: 'Pane casereccio o frisella pugliese ammorbidita', amount: 120, unit: 'g' }
    ],
    instructions: [
      'Togliere la mozzarella dal frigo almeno 30 minuti prima della cena in modo che esprima tutto il suo sapore e latte dolce.',
      'Tagliare il pomodoro cuore di bue a fette regolari spesse circa mezzo centimetro e salarle leggermente.',
      'Affettare la mozzarella e disporre le fette di pomodoro e mozzarella alternate sul piatto.',
      'Condire con un filo di olio extravergine d\'oliva di eccellente qualità, foglie di basilico fresco e qualche goccia di pesto al basilico per una nota da chef.',
      'Servire abbinata a fette di pane casereccio o friselle pugliesi bagnate con acqua di pomodoro: la cena estiva più amata in assoluto.'
    ],
    seasoningTips: '🌅 Cena 0 stress post-mare: Massima soddisfazione con il minimo sforzo dopo una giornata al sole.',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 390, protein: 22, carbs: 32, fat: 21 }
  },
  {
    id: 'beach-dinner-pesce-cartoccio',
    title: 'Filetti di Orata o Branzino al cartoccio veloce con pomodorini pachino, capperi e olive (Cena Facile in 15 min)',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 15,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'fast', 'fish'],
    ingredients: [
      { name: 'Filetti di orata o branzino freschi o sgelati (già spinati)', amount: 320, unit: 'g' },
      { name: 'Pomodorini pachino tagliati a metà', amount: 150, unit: 'g' },
      { name: 'Olive nere o verdi denocciolate', amount: 40, unit: 'g' },
      { name: 'Capperi sotto sale dissalati', amount: 1, unit: 'cucchiaio' },
      { name: 'Olio EVO, prezzemolo, aglio e una fetta di limone', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Accendere il forno o la friggitrice ad aria a 200°C (oppure preparare una padella con coperchio).',
      'Stendere due fogli di carta forno (o alluminio) e posizionare al centro di ognuno un filetto di pesce con la pelle verso il basso.',
      'Distribuire sopra i pomodorini a metà, le olive, i capperi e una fettina di limone.',
      'Irrorare con un filo d\'olio EVO e sigillare bene i cartocci a caramella affinché il vapore rimanga all\'interno.',
      'Cuocere per soli 12-15 minuti: il pesce resterà morbidissimo, succoso e profumato di mare. Zero padelle da incrostare!'
    ],
    seasoningTips: '🌅 Cena rapida post-mare: Ricco di Omega-3 rigeneranti per la pelle dopo il sole, si prepara in 15 minuti.',
    proteinType: 'fish',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 290, protein: 32, carbs: 6, fat: 14 }
  },
  {
    id: 'beach-dinner-gazpacho-uova',
    title: 'Gazpacho andaluso freddo di pomodoro e peperone con crostini e uova all\'occhio di bue (Cena Rinfrescante)',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 12,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'fast', 'eggs'],
    ingredients: [
      { name: 'Pomodori maturi per gazpacho (o gazpacho fresco artigianale)', amount: 400, unit: 'g' },
      { name: 'Cetriolo e mezzo peperone rosso (se fatto in casa)', amount: 100, unit: 'g' },
      { name: 'Uova fresche', amount: 4, unit: 'pz' },
      { name: 'Crostini di pane tostato o pane raffermo', amount: 80, unit: 'g' },
      { name: 'Olio EVO, aceto di vino bianco e sale', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Se prepari il gazpacho da zero: frulla i pomodori spellati, il cetriolo, il peperone, un cucchiaio di aceto, olio EVO e sale fino ad avere una crema vellutata e fredda di frigo.',
      'Versa il gazpacho ben freddo in due ciotole capienti o fondine.',
      'In una padella antiaderente con un filo d\'olio o burro, cuoci le 4 uova all\'occhio di bue per 3 minuti lasciando il tuorlo morbido.',
      'Servi il gazpacho rinfrescante accompagnato dalle uova calde e dai crostini di pane dorati.',
      'Un contrasto caldo-freddo idratante, leggerissimo ed estremamente appagante per le calde serate di vacanza.'
    ],
    seasoningTips: '🌅 Cena 0 stress post-mare: Reidrata l\'organismo apportando sali minerali, vitamine e proteine nobili.',
    proteinType: 'eggs',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 340, protein: 18, carbs: 28, fat: 16 }
  },
  {
    id: 'beach-dinner-prosciutto-melone',
    title: 'Prosciutto crudo dolce di Parma e Melone cantalupo freddo con bocconcini di mozzarella (Cena Express)',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 5,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'fast', 'red-meat'],
    ingredients: [
      { name: 'Prosciutto crudo dolce di Parma o San Daniele', amount: 160, unit: 'g' },
      { name: 'Melone cantalupo o retato ben maturo e freddo di frigo', amount: 400, unit: 'g' },
      { name: 'Bocconcini di mozzarella o fior di latte', amount: 120, unit: 'g' },
      { name: 'Foglioline di menta fresca e grissini', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Tagliare il melone freddo a fette o a cubetti, privandolo di semi e buccia.',
      'Avvolgere le fette di melone con le morbide fette di prosciutto crudo dolce.',
      'Disporre sul piatto accostando i bocconcini di mozzarella fresca sgocciolati e guarnire con foglioline di menta.',
      'Accompagnare con grissini stirati a mano o pane fresco.',
      'Il grande classico dell\'estate italiana: dolce, salato, succoso e velocissimo!'
    ],
    seasoningTips: '🌅 Cena 0 stress post-mare: Reintegra immediatamente potassio, sodio e acqua dopo la sudorazione in spiaggia.',
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 370, protein: 26, carbs: 24, fat: 18 }
  },
  {
    id: 'beach-classica-insalata-riso',
    title: 'Classica Insalata di Riso della Nonna con formaggio a cubetti, tonno, olive e uova sode (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 20,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'traditional'],
    ingredients: [
      { name: 'Riso bianco per insalate (es. Parboiled, Arborio o Carnaroli)', amount: 320, unit: 'g' },
      { name: 'Tonno sott\'olio sgocciolato', amount: 160, unit: 'g' },
      { name: 'Formaggio dolce a cubetti (Fontina, Asiago o Emmental)', amount: 150, unit: 'g' },
      { name: 'Prosciutto cotto a cubetti o wurstel di pollo/suino scottati', amount: 120, unit: 'g' },
      { name: 'Uova sode tagliate a spicchi', amount: 3, unit: 'pz' },
      { name: 'Olive verdi e nere snocciolate e pisellini lessati', amount: 120, unit: 'g' },
      { name: 'Olio EVO e un pizzico di sale', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Lessare il riso bianco in abbondante acqua salata, scolarlo al dente e farlo raffreddare stendendolo su un vassoio con un filo d\'olio EVO per sgranare bene i chicchi.',
      'In una grande zuppiera unire il formaggio tagliato a cubetti regolari, il prosciutto cotto (o wurstel a rondelle), le olive e i pisellini fini.',
      'Aggiungere il tonno ben sgocciolato e sgranato con la forchetta.',
      'Unire il riso ormai freddo e mescolare accuratamente tutti gli ingredienti.',
      'Completare in superficie con gli spicchi di uovo sodo e riposare in frigo tutta la notte prima di portare in borsa termica in spiaggia!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Il pranzo estivo italiano per eccellenza, goloso e ricco. Amato da grandi e bambini!',
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 480, protein: 22, carbs: 62, fat: 16 }
  },
  {
    id: 'beach-pasta-fredda-mediterranea',
    title: 'Pasta Fredda Classica Tricolore con pomodorini maturi, bocconcini di mozzarella e basilico (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 15,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'traditional', 'vegetarian'],
    ingredients: [
      { name: 'Pasta corta classica (Fusilli, Penne o Farfalle)', amount: 320, unit: 'g' },
      { name: 'Bocconcini di mozzarella o fior di latte a dadini', amount: 250, unit: 'g' },
      { name: 'Pomodorini Pachino o Datterini', amount: 250, unit: 'g' },
      { name: 'Olive nere denocciolate', amount: 80, unit: 'g' },
      { name: 'Abbondante basilico fresco, origano e olio EVO', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Cuocere la pasta in acqua bollente salata e scolarla rigorosamente al dente (1 minuto prima del tempo indicato sulla confezione).',
      'Passare velocemente la pasta sotto un getto d\'acqua fredda per fermare la cottura e trasferirla in una ciotola con due cucchiai di olio EVO.',
      'Tagliare i pomodorini a metà e salarli leggermente per far uscire il loro succo saporito.',
      'Unire alla pasta i pomodorini col loro sughetto, la mozzarella ben sgocciolata e le olive nere.',
      'Profumare con abbondante origano secco e foglie di basilico spezzettate a mano. Conservare al fresco!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Freschissima e tradizionale, non stanca mai ed è comodissima da mangiare sul lettino.',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 430, protein: 18, carbs: 60, fat: 14 }
  },
  {
    id: 'beach-panino-cotoletta-croccante',
    title: 'Panino da Spiaggia Goloso con Cotoletta di Pollo croccante, pomodoro fresco e maionese (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 20,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'make-ahead', 'traditional', 'white-meat'],
    ingredients: [
      { name: 'Sfilatini di pane casereccio, ciabattine o rosette croccanti', amount: 2, unit: 'pz' },
      { name: 'Fettine di petto di pollo o tacchino', amount: 200, unit: 'g' },
      { name: 'Pangrattato, uovo sbattuto e sale (per panatura)', amount: 1, unit: 'qb' },
      { name: 'Pomodoro maturo a fette sottili e foglie di lattuga', amount: 1, unit: 'qb' },
      { name: 'Maionese o salsa rosa (a piacere)', amount: 2, unit: 'cucchiai' }
    ],
    instructions: [
      'Passare le fettine di pollo prima nell\'uovo sbattuto con un pizzico di sale e poi nel pangrattato pressando bene.',
      'Cuocere le cotolette in padella con un filo di olio d\'oliva o in forno a 200°C per 12-15 minuti finché dorate e croccanti. Lasciare raffreddare.',
      'Tagliare i panini a metà e spalmare un velo leggero di maionese su entrambi i lati per impermeabilizzare il pane.',
      'Adagiare una foglia di lattuga croccante, le fette di pomodoro e la cotoletta dorata.',
      'Avvolgere ogni panino nella carta stagnola o carta forno: il re indiscusso dei pranzi al mare quando si ha tanta fame dopo il bagno!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Sostanzioso, appagante e croccante. La lattuga sotto il pomodoro impedisce al pane di inzupparsi.',
    proteinType: 'white-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 510, protein: 32, carbs: 54, fat: 18 }
  },
  {
    id: 'beach-panzanella-toscana-classica',
    title: 'Panzanella Toscana Classica con pane casereccio, pomodori maturi, cetriolo e cipolla rossa (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 15,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'traditional', 'vegetarian'],
    ingredients: [
      { name: 'Pane casereccio raffermo (meglio tipo toscano sciocco)', amount: 300, unit: 'g' },
      { name: 'Pomodori maturi succosi', amount: 4, unit: 'pz' },
      { name: 'Cetrioli freschi affettati', amount: 2, unit: 'pz' },
      { name: 'Cipolla rossa dolce affettata sottile', amount: 1, unit: 'pz' },
      { name: 'Olio EVO abbondante, aceto di vino bianco, sale e basilico', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Ammollare le fette di pane raffermo in acqua fredda con 2 cucchiai di aceto per circa 10 minuti.',
      'Strizzare energicamente il pane con le mani sbriciolandolo a pezzettoni in una capiente insalatiera.',
      'Aggiungere i pomodori tagliati a pezzetti col loro succo, i cetrioli sbucciati e affettati e la cipolla rossa (precedentemente addolcita in acqua fredda).',
      'Condire generosamente con olio extravergine d\'oliva, sale e abbondanti foglie di basilico spezzettate.',
      'Lasciare riposare in frigorifero per almeno 2 ore prima di servire in spiaggia: un piatto rustico ed eccezionalmente rinfrescante!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Zero cottura, economica e antispreco. Più riposa, più diventa gustosa.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true,
    nutrients: { calories: 350, protein: 8, carbs: 52, fat: 12 }
  },
  {
    id: 'beach-insalata-patate-wurstel',
    title: 'Insalata Estiva di Patate Lesse, Wurstel a rondelle, cetriolini e salsa tonnata veloce (Pranzo Spiaggia)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 25,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'traditional'],
    ingredients: [
      { name: 'Patate a pasta gialla', amount: 600, unit: 'g' },
      { name: 'Wurstel di suino o di pollo di ottima qualità', amount: 200, unit: 'g' },
      { name: 'Cetriolini sott\'aceto o olive verdi a rondelle', amount: 80, unit: 'g' },
      { name: 'Maionese leggera o salsa tonnata (tonno frullato con maionese)', amount: 4, unit: 'cucchiai' },
      { name: 'Erba cipollina e un filo d\'olio EVO', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Lessare le patate intere con la buccia per circa 25 minuti (o cuocerle a vapore a cubetti per fare prima). Sbucciarle e tagliarle a tocchi quando si intiepidiscono.',
      'Scottare i wurstel per 2 minuti in acqua bollente o su piastra, poi tagliarli a rondelle.',
      'Unire in una ciotola le patate, i wurstel e i cetriolini affettati.',
      'Condire con la salsa tonnata o maionese alleggerita con un cucchiaio di olio EVO ed erba cipollina fresca tritata.',
      'Far riposare in frigo ben chiusa. Un piatto unico nutriente che carica di energie i nuotatori di tutta la famiglia!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Saziante e ricca di gusto. Conservare nella borsa termica a contatto con le mattonelle di ghiaccio.',
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 450, protein: 15, carbs: 48, fat: 22 }
  },
  {
    id: 'beach-dinner-spaghetti-vongole',
    title: 'Spaghetti alle Vongole veloci macchiati con pomodorini freschi e prezzemolo (Cena Lampo Post-Mare)',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 12,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'fast', 'traditional', 'fish'],
    ingredients: [
      { name: 'Spaghetti n.5 o Linguine classiche', amount: 180, unit: 'g' },
      { name: 'Vongole veraci fresche spurgo fatto o surgelate di qualità', amount: 500, unit: 'g' },
      { name: 'Pomodorini datterini tagliati a metà', amount: 120, unit: 'g' },
      { name: 'Spicchio d\'aglio, peperoncino, olio EVO abbondante', amount: 1, unit: 'qb' },
      { name: 'Prezzemolo fresco tritato fine', amount: 1, unit: 'ciuffo' }
    ],
    instructions: [
      'Mettere a bollire l\'acqua per gli spaghetti e calare la pasta salando poco.',
      'Mentre la pasta cuoce, scaldare in una larga padella 3 cucchiai d\'olio EVO, lo spicchio d\'aglio schiacciato e un pizzico di peperoncino.',
      'Versare le vongole a fuoco vivo assieme ai pomodorini a metà e coprire con il coperchio per 3-4 minuti finché si aprono tutte rilasciando il loro squisito sughetto.',
      'Scolare gli spaghetti molto al dente direttamente nella padella con le vongole e saltarli 1 minuto a fuoco allegro per farli mantecare e assorbire il profumo del mare.',
      'Servire con abbondante prezzemolo fresco tritato: la cena estiva per eccellenza pronta in soli 12 minuti!'
    ],
    seasoningTips: '🌅 Cena 0 stress post-mare: Il profumo del mare a tavola in meno di un quarto d\'ora.',
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 440, protein: 24, carbs: 58, fat: 12 }
  },
  {
    id: 'beach-dinner-scaloppine-limone',
    title: 'Scaloppine di Vitello o Tacchino al Limone profumate al prezzemolo e burro fuso (Cena Veloce in 10 min)',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 10,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'fast', 'traditional', 'white-meat'],
    ingredients: [
      { name: 'Fettine sottili di vitello, arista di maiale o fesa di tacchino', amount: 300, unit: 'g' },
      { name: 'Farina 00 (per infarinare la carne)', amount: 30, unit: 'g' },
      { name: 'Succo filtrato di 1 limone grande e scorzetta grattugiata', amount: 1, unit: 'pz' },
      { name: 'Burro o olio extravergine d\'oliva', amount: 20, unit: 'g' },
      { name: 'Sale, pepe nero e prezzemolo fresco tritato', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Battere leggermente le fettine di carne per renderle tenerissime e passarle in un velo di farina eliminando l\'eccesso.',
      'Sciogliere il burro con un filo d\'olio in una padella larga a fuoco vivace.',
      'Adagiare le fettine e rosolarle 2 minuti per lato finché dorate.',
      'Salare, pepare e sfumare con il succo di limone fresco, lasciando restringere il sughero per 1 minuto fino a creare una cremina deliziosa.',
      'Guarnire con scorza di limone e prezzemolo e servire subito calde: morbide e agrumate, perfette dopo il mare!'
    ],
    seasoningTips: '🌅 Cena rapida post-mare: Si cuociono in pochi minuti e la cremina al limone concilia il riposo estivo.',
    proteinType: 'white-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: false,
    nutrients: { calories: 330, protein: 32, carbs: 8, fat: 18 }
  },
  {
    id: 'beach-dinner-spiedini-salsiccia-peperoni',
    title: 'Spiedini veloci di Salsiccia e Peperoni colorati saltati in padella o su piastra (Cena Sfiziosa Post-Mare)',
    category: 'fast',
    difficulty: 'easy',
    timeMin: 15,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'fast', 'traditional', 'red-meat'],
    ingredients: [
      { name: 'Salsiccia di maiale classica o di pollo/tacchino (tagliata a rocchetti)', amount: 300, unit: 'g' },
      { name: 'Peperone rosso e giallo pulito e tagliato a quadrotti', amount: 2, unit: 'pz' },
      { name: 'Rosmarino fresco e uno spicchio d\'aglio', amount: 1, unit: 'qb' },
      { name: 'Olio EVO, sale e un goccio di vino bianco per sfumare', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Comporre degli spiedini alternando un rocchetto di salsiccia e un quadrotto di peperone (oppure cuoceli semplicemente a pezzetti saltati in padella per fare ancora prima).',
      'Scaldare una piastra rovente o una padella antiaderente con un filo d\'olio e un rametto di rosmarino.',
      'Adagiare gli spiedini e rosolare a fuoco vivo per 3-4 minuti girandoli su tutti i lati finché ben dorati.',
      'Sfumare con un goccio di vino bianco o acqua, coprire e terminare la cottura per altri 8 minuti.',
      'Servire ben caldi e profumati con una fresca insalata verde di contorno!'
    ],
    seasoningTips: '🌅 Cena gustosa post-mare: Il sapore rustico dell\'estate pronto in un quarto d\'ora di padella o grigliata lampo.',
    proteinType: 'red-meat',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 420, protein: 26, carbs: 8, fat: 30 }
  },
  {
    id: 'beach-insalata-patate-fagiolini-pomodoro',
    title: 'Insalata Estiva di Patate, Fagiolini croccanti, Pomodorini maturi e cipolla rossa profumata all\'origano (Pranzo o Cena Fresca)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 20,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'cold', 'make-ahead', 'traditional', 'vegan', 'vegetarian'],
    ingredients: [
      { name: 'Patate a pasta gialla o patate novelle', amount: 600, unit: 'g' },
      { name: 'Fagiolini freschi puliti e spuntati', amount: 350, unit: 'g' },
      { name: 'Pomodorini Pachino o Datterini maturi', amount: 300, unit: 'g' },
      { name: 'Cipolla rossa dolce (es. di Tropea) affettata sottile', amount: 1, unit: 'pz' },
      { name: 'Olio EVO di ottima qualità, aceto di mele o vino bianco', amount: 3, unit: 'cucchiai' },
      { name: 'Origano secco profumato, basilico fresco, sale e pepe', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Lessare le patate in abbondante acqua salata (oppure al vapore) finché tenere ma ancora sode (circa 20 minuti). Scolarle, lasciarle intiepidire, sbucciarle e tagliarle a tocchi.',
      'Nella stessa acqua o a vapore cuocere i fagiolini per circa 8-10 minuti lasciandoli croccanti e di un bel verde acceso. Passarli sotto acqua fredda per mantenere il colore.',
      'Tagliare i pomodorini a metà o in quarti e affettare finemente la cipolla rossa (mettendola in acqua fredda 10 minuti se si desidera un gusto più delicato).',
      'In una grande insalatiera unire le patate a pezzi, i fagiolini, i pomodorini e la cipolla ben sgocciolata.',
      'Condire generosamente con olio extravergine d\'oliva, un goccio di aceto, sale, pepe nero e abbondante origano e basilico. Lasciar insaporire in frigo per almeno un\'ora!'
    ],
    seasoningTips: '💡 Consigli Spiaggia & Estate: Un grande classico della cucina mediterranea e ligure. Meravigliosa da portare in spiaggia nella borsa frigo o da gustare tiepida a cena.',
    proteinType: 'veg',
    hasCarbs: true,
    hasProtein: false,
    hasVeg: true,
    nutrients: { calories: 280, protein: 6, carbs: 48, fat: 9 }
  },
  {
    id: 'mozzarella-in-carrozza-classica',
    title: 'Mozzarella in Carrozza Classica Filante dorata in padella o al forno (Tradizione Napoletana)',
    category: 'dinner',
    difficulty: 'medium',
    timeMin: 20,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['traditional', 'comfort', 'fast', 'vegetarian', 'kids'],
    ingredients: [
      { name: 'Pane in cassetta (pane per tramezzini senza crosta o casereccio)', amount: 8, unit: 'fette' },
      { name: 'Mozzarella di bufala o fior di latte (ben sgocciolata e asciugata)', amount: 300, unit: 'g' },
      { name: 'Uova fresche biologiche', amount: 3, unit: 'pz' },
      { name: 'Latte intero o parzialmente scremato', amount: 50, unit: 'ml' },
      { name: 'Farina 00 (per infarinare)', amount: 60, unit: 'g' },
      { name: 'Pangrattato dorato (opzionale per una croccantezza extra)', amount: 80, unit: 'g' },
      { name: 'Olio per cottura o EVO, un pizzico di sale', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Tagliare la mozzarella a fette spesse circa 1 cm e lasciarla sgocciolare su carta assorbente per almeno 30 minuti in modo che perda il siero in eccesso.',
      'Farciare le fette di pane con la mozzarella (lasciando mezzo centimetro dal bordo per evitare che fuoriesca in cottura) e richiudere a sandwich premendo bene i bordi.',
      'Sbattere le uova in una ciotola larga con il latte e un pizzico di sale.',
      'Passare ogni sandwich prima accuratamente nella farina 00 sigillando bene i bordi, poi immergerlo nel composto di uovo sbattuto (e se si desidera una crosta extra croccante, passarlo infine nel pangrattato).',
      'Cuocere in padella con olio ben caldo per 2-3 minuti per lato fino a doratura uniforme e cuore filante (oppure cuocere in forno preriscaldato a 200°C per 15 minuti con un filo d\'olio per una versione più leggera). Servire subito caldissima e filante!'
    ],
    seasoningTips: '💡 Il segreto della nonna napoletana: Sgocciolare perfettamente la mozzarella il giorno prima e sigillare bene i bordi con farina e uovo affinché il formaggio non fuoriesca.',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: { calories: 460, protein: 22, carbs: 42, fat: 22 }
  },
  {
    id: 'beach-mozzarella-in-carrozza-spiaggia',
    title: 'Mozzarella in Carrozza Croccante da Spiaggia o Cena Sfiziosa Post-Mare (Versione Forno o Padella)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 20,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'takeaway', 'fast', 'traditional', 'comfort', 'vegetarian'],
    ingredients: [
      { name: 'Pane per tramezzini o pane casereccio affettato', amount: 8, unit: 'fette' },
      { name: 'Mozzarella per pizza o fior di latte ben asciutto', amount: 300, unit: 'g' },
      { name: 'Filetti di acciughe sott\'olio o pomodorini secchi (opzionale per variante mediterranea)', amount: 4, unit: 'pz' },
      { name: 'Uova fresche', amount: 3, unit: 'pz' },
      { name: 'Latte e farina 00 per la panatura', amount: 1, unit: 'qb' },
      { name: 'Pangrattato croccante e olio EVO o di semi', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Asciugare benissimo le fette di mozzarella con carta da cucina per evitare che rilascino liquido in spiaggia.',
      'Disporre la mozzarella tra due fette di pane (aggiungendo a piacere un filetto di acciuga o un pomodorino secco per un tocco saporito).',
      'Sigillare i bordi infarinando i sandwich, passandoli nell\'uovo sbattuto con un goccio di latte e infine nel pangrattato.',
      'Cuocere in forno ventilato a 200°C per 15 minuti o in padella dorando bene entrambi i lati.',
      'Lasciar intiepidire prima di avvolgere in carta forno o pellicola per portarla al mare: mantiene una consistenza soda e saporita, perfetta come super pranzo al sacco o cena veloce e filante al rientro dalla spiaggia!'
    ],
    seasoningTips: '💡 Consigli Spiaggia & Vacanza: Usare mozzarella per pizza o fior di latte del giorno prima ben asciutto. Ideale sia calda a cena che a temperatura ambiente sotto l\'ombrellone!',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: { calories: 450, protein: 23, carbs: 44, fat: 20 }
  },
  {
    id: 'sartu-di-riso-napoletano-classico',
    title: 'Sartù di Riso alla Napoletana con polpettine, piselli e uova sode (Classico della Domenica)',
    category: 'lunch',
    difficulty: 'hard',
    timeMin: 60,
    servings: 6,
    season: 'all',
    isWHOCompliant: true,
    tags: ['traditional', 'make-ahead', 'comfort'],
    ingredients: [
      { name: 'Riso Carnaroli o Arborio', amount: 500, unit: 'g' },
      { name: 'Ragù di carne tradizionale o sugo di pomodoro corposo', amount: 600, unit: 'ml' },
      { name: 'Carne macinata mista (per le polpettine), uovo e pangrattato', amount: 250, unit: 'g' },
      { name: 'Pisellini cotti con un filo di cipolla', amount: 150, unit: 'g' },
      { name: 'Mozzarella o provola ben asciutta a cubetti', amount: 200, unit: 'g' },
      { name: 'Uova sode a fette e parmigiano grattugiato', amount: 3, unit: 'pz' },
      { name: 'Pangrattato e burro per lo stampo', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Preparare le polpettine piccolissime rosolandole in padella o cuocendole direttamente nel sugo di pomodoro.',
      'Lessare il riso a metà cottura, scolarlo e condirlo generosamente con parte del sugo, parmigiano grattugiato e 2 uova sbattute per compattare.',
      'Imburrare e cospargere di pangrattato uno stampo alto da ciambella o da timballo.',
      'Foderare fondo e pareti con 2/3 del riso condito, creando una cavità al centro. Riempire la cavità con le polpettine, i piselli, la provola a cubetti e le uova sode a spicchi.',
      'Coprire con il riso rimasto sigillando bene e spolverare di pangrattato e fiocchetti di burro. Infornare a 190°C per 35-40 minuti fino a doratura croccante e sformare da tiepido!'
    ],
    seasoningTips: '💡 Il segreto napoletano: Far riposare il sartù almeno 20 minuti prima di sformarlo in modo che le fette rimangano intatte e perfette.',
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 580, protein: 26, carbs: 64, fat: 22 }
  },
  {
    id: 'beach-sartu-di-riso-vacanze',
    title: 'Sartù di Riso in Crosta da Spiaggia e Pic-Nic (Porzionato o Timballo Freddo/Tiepido)',
    category: 'takeaway',
    difficulty: 'medium',
    timeMin: 50,
    servings: 6,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'takeaway', 'make-ahead', 'traditional', 'comfort'],
    ingredients: [
      { name: 'Riso per timballi (Arborio o Carnaroli)', amount: 500, unit: 'g' },
      { name: 'Sugo di pomodoro saporito al basilico', amount: 500, unit: 'ml' },
      { name: 'Polpettine fritte o al forno di vitello/manzo', amount: 200, unit: 'g' },
      { name: 'Pisellini fini lessati e uova sode a rondelle', amount: 150, unit: 'g' },
      { name: 'Provola affumicata o fior di latte ben asciugato', amount: 200, unit: 'g' },
      { name: 'Parmigiano reggiano e pangrattato croccante', amount: 80, unit: 'g' }
    ],
    instructions: [
      'Cuocere il riso al dente e condirlo con sugo al pomodoro e formaggio grattugiato.',
      'In pirottini monoporzione da muffin (o in una teglia da trasporto ben unta e impanata), creare un guscio di riso e farcirlo al centro con polpettine, piselli, uovo sodo e provola.',
      'Chiudere con un velo di riso, cospargere di pangrattato e cuocere in forno a 190°C per 30 minuti finché si forma una crosticina dorata deliziosa.',
      'Lasciare raffreddare completamente a temperatura ambiente prima di riporre nei contenitori da spiaggia: non si sfalda mai ed è un pranzo da re sotto l\'ombrellone!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Le monoporzioni (sartù mignon) sono comodissime da mangiare a mani nude o con la forchettina sul lettino senza sporcare nulla!',
    proteinType: 'red-meat',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 560, protein: 24, carbs: 62, fat: 20 }
  },
  {
    id: 'frittata-di-spaghetti-napoletana',
    title: 'Frittata di Maccheroni o Spaghetti Tradizionale Napoletana croccante in padella',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 20,
    servings: 4,
    season: 'all',
    isWHOCompliant: true,
    tags: ['traditional', 'make-ahead', 'fast', 'comfort'],
    ingredients: [
      { name: 'Spaghetti, bucatini o maccheroni (anche avanzati)', amount: 350, unit: 'g' },
      { name: 'Uova fresche grandi', amount: 5, unit: 'pz' },
      { name: 'Parmigiano Reggiano e Pecorino grattugiati', amount: 70, unit: 'g' },
      { name: 'Provola affumicata o scamorza a cubetti', amount: 150, unit: 'g' },
      { name: 'Salame napoletano o pancetta a cubetti (opzionale)', amount: 100, unit: 'g' },
      { name: 'Olio extravergine d\'oliva, sale e abbondante pepe nero', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Sbattere le uova in una capiente ciotola con parmigiano, pecorino, un pizzico di sale e generosa macinata di pepe nero.',
      'Unire gli spaghetti (se cotti al momento, scolateli al dente e fateli intiepidire), la provola a cubetti e il salame tagliato a pezzettini.',
      'Scaldare 3 cucchiai di olio EVO in una padella antiaderente larga (circa 24-26 cm).',
      'Versare il composto livellandolo bene con una spatola e cuocere a fuoco medio-basso con coperchio per 8-10 minuti finché il fondo risulta ben dorato e staccato.',
      'Girare la frittata con l\'aiuto di un piatto o del coperchio e dorare l\'altro lato per altri 6-7 minuti fino a ottenere una crosta bruna e croccantissima. Buona calda, tiepida o fredda!'
    ],
    seasoningTips: '💡 Il segreto della croccantezza: Cuocere a fuoco dolce per cuocere bene il cuore dell\'uovo, poi alzare la fiamma l\'ultimo minuto per fare la crosticina.',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: { calories: 510, protein: 24, carbs: 55, fat: 22 }
  },
  {
    id: 'beach-frittata-di-spaghetti-spiaggia',
    title: 'Frittata di Spaghetti da Spiaggia Alta e Croccante (Il Pranzo al Sacco per Eccellenza)',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 25,
    servings: 4,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'takeaway', 'make-ahead', 'traditional', 'fast'],
    ingredients: [
      { name: 'Spaghetti n.5 o Vermicelli lessati al dente', amount: 350, unit: 'g' },
      { name: 'Uova intere', amount: 5, unit: 'pz' },
      { name: 'Scamorza o fior di latte ben sgocciolato a cubetti', amount: 160, unit: 'g' },
      { name: 'Prosciutto cotto a cubetti o speck', amount: 100, unit: 'g' },
      { name: 'Parmigiano grattugiato, pepe nero e foglie di basilico spezzettate', amount: 60, unit: 'g' },
      { name: 'Olio d\'oliva per la cottura dorata', amount: 3, unit: 'cucchiai' }
    ],
    instructions: [
      'Mescolare gli spaghetti tiepidi o freddi con le uova sbattute, i formaggi, il prosciutto cotto e il basilico.',
      'Cuocere in una padella ben calda e unta d\'olio, sigillando prima a fuoco vivace e poi proseguendo a fuoco dolce.',
      'Una volta girata e dorata su entrambi i lati, trasferirla su carta assorbente per eliminare ogni traccia di unto superficiale.',
      'Lasciarla raffreddare completamente e tagliarla a spicchi (o quadrotti se cotta in teglia da forno).',
      'Avvolgere gli spicchi in carta stagnola: resiste benissimo al caldo della spiaggia, non si rovina ed è super nutriente dopo una nuotata!'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Tagliatela a spicchi prima di metterla nel contenitore così ogni bagnante potrà prendere la sua porzione comodamente.',
    proteinType: 'cheese',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: false,
    nutrients: { calories: 490, protein: 23, carbs: 54, fat: 20 }
  },
  {
    id: 'insalata-ricca-mediterranea-generica',
    title: 'Insalata Ricca Mediterranea con crostini dorati, tonno, olive, pomodorini e scaglie di grana',
    category: 'lunch',
    difficulty: 'easy',
    timeMin: 10,
    servings: 2,
    season: 'all',
    isWHOCompliant: true,
    tags: ['fast', 'make-ahead', 'traditional'],
    ingredients: [
      { name: 'Insalata mista croccante (Lattuga, Radicchio, Rucola o Iceberg)', amount: 200, unit: 'g' },
      { name: 'Pomodorini datterini o piccadilly', amount: 200, unit: 'g' },
      { name: 'Tonno sott\'olio ben sgocciolato in filetti o pezzi', amount: 160, unit: 'g' },
      { name: 'Olive nere o verdi denocciolate', amount: 60, unit: 'g' },
      { name: 'Scaglie di Parmigiano o Grana Padano', amount: 50, unit: 'g' },
      { name: 'Mais dolce sgranato o carote alla julienne', amount: 80, unit: 'g' },
      { name: 'Crostini di pane croccanti, olio EVO, sale e origano', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Lavare accuratamente e asciugare con una centrifuga le foglie di insalata per mantenerle super croccanti.',
      'Disporre l\'insalata sul fondo di una capiente ciotola o piatto da portata.',
      'Aggiungere i pomodorini tagliati a metà, il mais dolce, le olive e il tonno a pezzettoni.',
      'Completare in superficie con scaglie di parmigiano e crostini di pane dorati.',
      'Condire al momento di servire con un\'emulsione di olio extravergine d\'oliva, un pizzico di sale e origano fresco o secco!'
    ],
    seasoningTips: '💡 Il consiglio per non far appassire l\'insalata: Aggiungere il condimento (olio e sale) sempre all\'ultimo secondo prima di portarla a tavola.',
    proteinType: 'fish',
    hasCarbs: true,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 360, protein: 26, carbs: 22, fat: 18 }
  },
  {
    id: 'beach-insalata-ricca-estiva-spiaggia',
    title: 'Insalatona Estiva da Spiaggia Rinfrescante con cetrioli, pomodori, feta o mozzarella e olive nere',
    category: 'takeaway',
    difficulty: 'easy',
    timeMin: 10,
    servings: 2,
    season: 'summer',
    isWHOCompliant: true,
    tags: ['beach', 'takeaway', 'cold', 'make-ahead', 'vegetarian'],
    ingredients: [
      { name: 'Insalata Iceberg o Lattuga romana tagliata grossolanamente', amount: 200, unit: 'g' },
      { name: 'Cetriolo fresco sbucciato a fette croccanti', amount: 1, unit: 'pz' },
      { name: 'Pomodori da insalata sodi a cubetti', amount: 2, unit: 'pz' },
      { name: 'Feta greca a cubetti o bocconcini di mozzarella ben sgocciolati', amount: 150, unit: 'g' },
      { name: 'Olive nere taggiasche o kalamata', amount: 60, unit: 'g' },
      { name: 'Cipolla rossa di Tropea affettata finissima (opzionale)', amount: 0.5, unit: 'pz' },
      { name: 'Olio EVO, origano abbondante e succo di limone', amount: 1, unit: 'qb' }
    ],
    instructions: [
      'Tagliare le verdure ben pulite e asciutte e disporle in un contenitore ermetico da borsa frigo.',
      'Unire i cubetti di formaggio (feta o mozzarella) e le olive nere.',
      'Preparare a parte in un piccolo vasetto di vetro (o barattolino) il condimento emulsionando olio EVO, succo di limone e origano.',
      'Conservare l\'insalata al fresco nella borsa termica e versare il condimento solo quando si è sotto l\'ombrellone pronti per mangiare!',
      'Mescolare delicatamente: un pasto leggero, reidratante e ricco di sali minerali essenziali sotto il sole estivo.'
    ],
    seasoningTips: '💡 Consigli Spiaggia: Portare il condimento in un barattolino a parte garantisce che l\'insalata rimanga croccantissima per ore senza diventare molle.',
    proteinType: 'cheese',
    hasCarbs: false,
    hasProtein: true,
    hasVeg: true,
    nutrients: { calories: 310, protein: 14, carbs: 10, fat: 22 }
  }
];

/** Tutti i piatti dell'app: pranzi e cene, contorni, dolci e le colazioni e merende pensate per una persona. */
export const INITIAL_RECIPES: Recipe[] = [...BASE_RECIPES, ...MORNING_RECIPES];
