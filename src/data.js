// data.js — Hemanth's student apartment kitchen
// Loaded as a plain script; attaches to window.PP_DATA

window.PP_DATA = (function () {

  // ─── Pantry items ────────────────────────────────────────────────────────
  // status: today | tomorrow | week | fresh | frozen | expired
  const items = [
    { id: "i1",  name: "Spinach",          cat: "Vegetables",  qty: "1 bag",       loc: "Fridge",  expires: "Tomorrow",    expDays: 1,  status: "tomorrow", price: 3.49, owner: "Hemanth", store: "Aldi",      illo: "spinach" },
    { id: "i2",  name: "Eggs",             cat: "Dairy",       qty: "8 left",      loc: "Fridge",  expires: "9 days",      expDays: 9,  status: "fresh",    price: 4.20, owner: "Shared",  store: "Walmart",   illo: "egg" },
    { id: "i3",  name: "Whole Milk",       cat: "Dairy",       qty: "½ gallon",    loc: "Fridge",  expires: "2 days",      expDays: 2,  status: "week",     price: 3.79, owner: "Shared",  store: "Publix",    illo: "milk" },
    { id: "i4",  name: "Greek Yogurt",     cat: "Dairy",       qty: "12 oz",       loc: "Fridge",  expires: "5 days",      expDays: 5,  status: "fresh",    price: 4.99, owner: "Hemanth", store: "Aldi",      illo: "yogurt" },
    { id: "i5",  name: "Cooked Rice",      cat: "Leftovers",   qty: "2 servings",  loc: "Fridge",  expires: "Today",       expDays: 0,  status: "today",    price: 0,    owner: "Hemanth", store: "—",         illo: "rice" },
    { id: "i6",  name: "Bell Peppers",     cat: "Vegetables",  qty: "3",           loc: "Fridge",  expires: "4 days",      expDays: 4,  status: "fresh",    price: 2.99, owner: "Hemanth", store: "Walmart",   illo: "pepper" },
    { id: "i7",  name: "Yellow Onions",    cat: "Vegetables",  qty: "4",           loc: "Pantry",  expires: "3 weeks",     expDays: 21, status: "fresh",    price: 1.89, owner: "Shared",  store: "Aldi",      illo: "onion" },
    { id: "i8",  name: "Garlic",           cat: "Vegetables",  qty: "1 bulb",      loc: "Pantry",  expires: "3 weeks",     expDays: 21, status: "fresh",    price: 0.79, owner: "Shared",  store: "Aldi",      illo: "garlic" },
    { id: "i9",  name: "Roma Tomatoes",    cat: "Vegetables",  qty: "4",           loc: "Fridge",  expires: "6 days",      expDays: 6,  status: "fresh",    price: 2.49, owner: "Hemanth", store: "Publix",    illo: "tomato" },
    { id: "i10", name: "Carrots",          cat: "Vegetables",  qty: "1 bag",       loc: "Fridge",  expires: "12 days",     expDays: 12, status: "fresh",    price: 1.49, owner: "Hemanth", store: "Aldi",      illo: "carrot" },
    { id: "i11", name: "Jasmine Rice",     cat: "Grains",      qty: "2.5 lb",      loc: "Pantry",  expires: "8 months",    expDays: 240,status: "fresh",    price: 5.99, owner: "Hemanth", store: "Walmart",   illo: "ricebag" },
    { id: "i12", name: "Spaghetti",        cat: "Grains",      qty: "1 box",       loc: "Pantry",  expires: "1 year",      expDays: 365,status: "fresh",    price: 1.29, owner: "Shared",  store: "Aldi",      illo: "pasta" },
    { id: "i13", name: "Wheat Bread",      cat: "Grains",      qty: "½ loaf",      loc: "Pantry",  expires: "3 days",      expDays: 3,  status: "week",     price: 2.99, owner: "Hemanth", store: "Publix",    illo: "bread" },
    { id: "i14", name: "Chicken Breast",   cat: "Meat",        qty: "1.2 lb",      loc: "Fridge",  expires: "2 days",      expDays: 2,  status: "week",     price: 7.99, owner: "Hemanth", store: "Walmart",   illo: "chicken" },
    { id: "i15", name: "Firm Tofu",        cat: "Meat",        qty: "14 oz",       loc: "Fridge",  expires: "8 days",      expDays: 8,  status: "fresh",    price: 2.49, owner: "Hemanth", store: "Aldi",      illo: "tofu" },
    { id: "i16", name: "Frozen Mixed Veg", cat: "Frozen",      qty: "1 bag",       loc: "Freezer", expires: "Frozen",      expDays: 99, status: "frozen",   price: 3.49, owner: "Shared",  store: "Costco",    illo: "frozenveg" },
    { id: "i17", name: "Frozen Berries",   cat: "Frozen",      qty: "½ bag",       loc: "Freezer", expires: "Frozen",      expDays: 99, status: "frozen",   price: 4.99, owner: "Hemanth", store: "Costco",    illo: "berries" },
    { id: "i18", name: "Black Beans",      cat: "Canned",      qty: "2 cans",      loc: "Pantry",  expires: "2 years",     expDays: 720,status: "fresh",    price: 1.78, owner: "Shared",  store: "Aldi",      illo: "beans" },
    { id: "i19", name: "Chickpeas",        cat: "Canned",      qty: "2 cans",      loc: "Pantry",  expires: "2 years",     expDays: 720,status: "fresh",    price: 1.78, owner: "Hemanth", store: "Aldi",      illo: "beans" },
    { id: "i20", name: "Olive Oil",        cat: "Oils",        qty: "¾ bottle",    loc: "Pantry",  expires: "10 months",   expDays: 300,status: "fresh",    price: 8.49, owner: "Shared",  store: "Trader Joe's", illo: "oil" },
    { id: "i21", name: "Soy Sauce",        cat: "Sauces",      qty: "¾ bottle",    loc: "Pantry",  expires: "1 year",      expDays: 365,status: "fresh",    price: 2.99, owner: "Shared",  store: "Walmart",   illo: "soy" },
    { id: "i22", name: "Schezwan Sauce",   cat: "Sauces",      qty: "½ jar",       loc: "Pantry",  expires: "6 months",    expDays: 180,status: "fresh",    price: 4.49, owner: "Hemanth", store: "Walmart",   illo: "chili" },
    { id: "i23", name: "Peanut Butter",    cat: "Sauces",      qty: "¾ jar",       loc: "Pantry",  expires: "8 months",    expDays: 240,status: "fresh",    price: 3.99, owner: "Hemanth", store: "Aldi",      illo: "peanutbutter" },
    { id: "i24", name: "Rolled Oats",      cat: "Grains",      qty: "1.5 lb",      loc: "Pantry",  expires: "10 months",   expDays: 300,status: "fresh",    price: 3.29, owner: "Hemanth", store: "Aldi",      illo: "oats" },
    { id: "i25", name: "Bananas",          cat: "Fruits",      qty: "5",           loc: "Counter", expires: "Today",       expDays: 0,  status: "today",    price: 1.49, owner: "Hemanth", store: "Aldi",      illo: "banana" },
    { id: "i26", name: "Apples",           cat: "Fruits",      qty: "4",           loc: "Counter", expires: "10 days",     expDays: 10, status: "fresh",    price: 3.49, owner: "Shared",  store: "Aldi",      illo: "apple" },
    { id: "i27", name: "Cheddar Cheese",   cat: "Dairy",       qty: "6 oz",        loc: "Fridge",  expires: "14 days",     expDays: 14, status: "fresh",    price: 4.49, owner: "Shared",  store: "Aldi",      illo: "cheese" },
    { id: "i28", name: "Ground Coffee",    cat: "Beverages",   qty: "½ bag",       loc: "Pantry",  expires: "5 months",    expDays: 150,status: "fresh",    price: 8.99, owner: "Hemanth", store: "Trader Joe's", illo: "coffee" },
    { id: "i29", name: "Sriracha",         cat: "Sauces",      qty: "Full",        loc: "Pantry",  expires: "1 year",      expDays: 365,status: "fresh",    price: 3.99, owner: "Hemanth", store: "Walmart",   illo: "chili" },
    { id: "i30", name: "Salt",             cat: "Spices",      qty: "Full",        loc: "Pantry",  expires: "—",           expDays: 999,status: "fresh",    price: 1.29, owner: "Shared",  store: "Aldi",      illo: "salt" },
  ];

  // ─── Recipes ─────────────────────────────────────────────────────────────
  const recipes = [
    {
      id: "r1",
      name: "Schezwan Egg Fried Rice",
      time: 18, difficulty: "Easy",
      match: 92, missing: ["Spring onions"],
      uses: ["Cooked Rice", "Eggs", "Bell Peppers", "Carrots", "Garlic", "Schezwan Sauce"],
      expiringUsed: ["Cooked Rice", "Spinach"],
      cost: 2.40, costSingle: true,
      cals: 480, protein: 18, carbs: 62, fat: 14,
      cuisine: "Indo-Chinese", diet: ["Vegetarian", "High-protein-add"],
      tags: ["under-20", "uses-leftovers", "budget"],
      tone: "#D9722B",
      desc: "Fiery, smoky, takeaway-style fried rice. Uses up cooked rice and Schezwan sauce.",
    },
    {
      id: "r2",
      name: "Garlic Butter Spinach Pasta",
      time: 22, difficulty: "Easy",
      match: 88, missing: ["Parmesan"],
      uses: ["Spaghetti", "Spinach", "Garlic", "Olive Oil"],
      expiringUsed: ["Spinach"],
      cost: 1.85,
      cals: 540, protein: 16, carbs: 78, fat: 18,
      cuisine: "Italian", diet: ["Vegetarian"],
      tags: ["uses-expiring", "comfort"],
      tone: "#3B6E3D",
      desc: "Silky garlic-butter pasta with wilted spinach. The kind of weeknight meal that feels nicer than it should.",
    },
    {
      id: "r3",
      name: "Chickpea Rice Bowl",
      time: 25, difficulty: "Easy",
      match: 100, missing: [],
      uses: ["Chickpeas", "Jasmine Rice", "Bell Peppers", "Onions", "Olive Oil"],
      expiringUsed: [],
      cost: 1.60,
      cals: 560, protein: 22, carbs: 88, fat: 12,
      cuisine: "Mediterranean", diet: ["Vegan", "High-protein"],
      tags: ["budget", "meal-prep", "high-protein"],
      tone: "#C99325",
      desc: "Plant-protein, lemony, batch-cookable. Two servings cost less than a coffee.",
    },
    {
      id: "r4",
      name: "Air Fryer Chicken Wrap",
      time: 20, difficulty: "Easy",
      match: 80, missing: ["Tortilla", "Lettuce"],
      uses: ["Chicken Breast", "Greek Yogurt", "Garlic", "Sriracha"],
      expiringUsed: ["Chicken Breast"],
      cost: 3.10,
      cals: 510, protein: 38, carbs: 32, fat: 22,
      cuisine: "American", diet: ["High-protein"],
      tags: ["under-20", "high-protein"],
      tone: "#C73E2E",
      desc: "Crispy yogurt-marinated chicken in a wrap. 20 minutes door to plate.",
    },
    {
      id: "r5",
      name: "Banana Oat Pancakes",
      time: 15, difficulty: "Easy",
      match: 100, missing: [],
      uses: ["Bananas", "Eggs", "Rolled Oats", "Whole Milk"],
      expiringUsed: ["Bananas"],
      cost: 0.95,
      cals: 320, protein: 14, carbs: 52, fat: 6,
      cuisine: "Breakfast", diet: ["Vegetarian", "High-protein"],
      tags: ["under-20", "breakfast", "budget", "uses-expiring"],
      tone: "#C99325",
      desc: "Three ingredients, no flour, no sugar. Uses up almost-too-ripe bananas.",
    },
    {
      id: "r6",
      name: "Vegetable Omelette",
      time: 10, difficulty: "Easy",
      match: 100, missing: [],
      uses: ["Eggs", "Bell Peppers", "Onions", "Cheddar Cheese"],
      expiringUsed: [],
      cost: 1.20,
      cals: 380, protein: 24, carbs: 8, fat: 28,
      cuisine: "Breakfast", diet: ["Vegetarian", "High-protein"],
      tags: ["under-20", "breakfast", "high-protein"],
      tone: "#D9722B",
      desc: "Fluffy three-egg omelette folded over peppers, onion, and cheddar.",
    },
    {
      id: "r7",
      name: "Greek Yogurt Parfait",
      time: 5, difficulty: "Easy",
      match: 100, missing: [],
      uses: ["Greek Yogurt", "Frozen Berries", "Rolled Oats"],
      expiringUsed: [],
      cost: 1.40,
      cals: 290, protein: 18, carbs: 38, fat: 6,
      cuisine: "Breakfast", diet: ["Vegetarian", "High-protein"],
      tags: ["under-20", "breakfast"],
      tone: "#6E3A4F",
      desc: "Layered yogurt, frozen berries, and toasted oats. Five-minute breakfast.",
    },
    {
      id: "r8",
      name: "Tofu Stir Fry",
      time: 24, difficulty: "Medium",
      match: 100, missing: [],
      uses: ["Firm Tofu", "Bell Peppers", "Garlic", "Soy Sauce", "Jasmine Rice"],
      expiringUsed: [],
      cost: 2.20,
      cals: 460, protein: 24, carbs: 58, fat: 14,
      cuisine: "Asian", diet: ["Vegan", "Vegetarian", "High-protein"],
      tags: ["high-protein", "meal-prep"],
      tone: "#3B6E3D",
      desc: "Crispy pan-seared tofu, charred peppers, garlicky soy glaze, over rice.",
    },
    {
      id: "r9",
      name: "Egg & Cheese Sandwich",
      time: 8, difficulty: "Easy",
      match: 100, missing: [],
      uses: ["Eggs", "Wheat Bread", "Cheddar Cheese"],
      expiringUsed: ["Wheat Bread"],
      cost: 1.10,
      cals: 410, protein: 22, carbs: 36, fat: 22,
      cuisine: "Breakfast", diet: ["Vegetarian"],
      tags: ["under-20", "breakfast", "budget"],
      tone: "#C99325",
      desc: "The dependable one. Uses up bread before it turns.",
    },
    {
      id: "r10",
      name: "Spiced Black Bean Bowl",
      time: 18, difficulty: "Easy",
      match: 90, missing: ["Lime"],
      uses: ["Black Beans", "Jasmine Rice", "Onions", "Roma Tomatoes", "Olive Oil"],
      expiringUsed: [],
      cost: 1.35,
      cals: 520, protein: 18, carbs: 92, fat: 8,
      cuisine: "Mexican", diet: ["Vegan", "Vegetarian"],
      tags: ["budget", "high-protein", "under-20"],
      tone: "#B85C1F",
      desc: "Smoky black beans over rice with charred tomato salsa. Pantry hero.",
    },

    // ─── Indian ──────────────────────────────────────────────
    {
      id: "r11",
      name: "Chana Masala",
      time: 28, difficulty: "Easy",
      match: 88, missing: ["Garam masala", "Ginger"],
      uses: ["Chickpeas", "Onions", "Roma Tomatoes", "Garlic"],
      expiringUsed: [],
      cost: 1.55,
      cals: 430, protein: 16, carbs: 64, fat: 10,
      cuisine: "Indian", diet: ["Vegan", "Vegetarian", "High-protein"],
      tags: ["budget", "high-protein"],
      tone: "#C85A2B",
      desc: "Chickpeas simmered in a spiced onion-tomato gravy. The dependable, soul-warming North-Indian classic.",
    },
    {
      id: "r12",
      name: "Masala Egg Curry",
      time: 30, difficulty: "Medium",
      match: 90, missing: ["Garam masala"],
      uses: ["Eggs", "Onions", "Roma Tomatoes", "Garlic"],
      expiringUsed: [],
      cost: 1.70,
      cals: 380, protein: 20, carbs: 18, fat: 24,
      cuisine: "Indian", diet: ["Vegetarian", "High-protein"],
      tags: ["high-protein"],
      tone: "#B8472E",
      desc: "Boiled eggs bathed in a glossy, fragrant masala gravy. Big flavour from pantry staples.",
    },
    {
      id: "r13",
      name: "Paneer Butter Masala",
      time: 35, difficulty: "Medium",
      match: 55, missing: ["Paneer", "Butter", "Cream", "Garam masala"],
      uses: ["Roma Tomatoes", "Garlic", "Onions"],
      expiringUsed: [],
      cost: 3.40,
      cals: 520, protein: 22, carbs: 26, fat: 36,
      cuisine: "Indian", diet: ["Vegetarian"],
      tags: ["comfort"],
      tone: "#C97A2B",
      desc: "Restaurant-style paneer in a velvety tomato-butter sauce. The crowd-pleaser worth a grocery run.",
    },
    {
      id: "r14",
      name: "Dal Tadka",
      time: 30, difficulty: "Easy",
      match: 70, missing: ["Red lentils", "Cumin seeds"],
      uses: ["Onions", "Roma Tomatoes", "Garlic"],
      expiringUsed: [],
      cost: 1.20,
      cals: 360, protein: 18, carbs: 52, fat: 8,
      cuisine: "Indian", diet: ["Vegan", "Vegetarian", "High-protein"],
      tags: ["budget", "high-protein", "comfort"],
      tone: "#C99325",
      desc: "Soft yellow lentils finished with a sizzling cumin-garlic tempering. Comfort in a bowl.",
    },

    // ─── Chinese ─────────────────────────────────────────────
    {
      id: "r15",
      name: "Veg Hakka Noodles",
      time: 22, difficulty: "Easy",
      match: 78, missing: ["Hakka noodles"],
      uses: ["Bell Peppers", "Carrots", "Onions", "Soy Sauce", "Garlic"],
      expiringUsed: [],
      cost: 1.90,
      cals: 440, protein: 12, carbs: 72, fat: 12,
      cuisine: "Chinese", diet: ["Vegetarian", "Vegan"],
      tags: ["under-20", "comfort"],
      tone: "#3B6E3D",
      desc: "Wok-tossed noodles loaded with crunchy veg and a savoury soy-garlic glaze. Street-stall energy.",
    },
    {
      id: "r16",
      name: "Kung Pao Tofu",
      time: 26, difficulty: "Medium",
      match: 88, missing: ["Peanuts"],
      uses: ["Firm Tofu", "Bell Peppers", "Garlic", "Soy Sauce", "Sriracha"],
      expiringUsed: [],
      cost: 2.30,
      cals: 470, protein: 24, carbs: 34, fat: 26,
      cuisine: "Chinese", diet: ["Vegan", "Vegetarian", "High-protein"],
      tags: ["high-protein", "meal-prep"],
      tone: "#C73E2E",
      desc: "Crispy tofu cubes in a sweet-spicy Kung Pao sauce with charred peppers. Crunchy, fiery, addictive.",
    },
    {
      id: "r17",
      name: "Chicken Chow Mein",
      time: 25, difficulty: "Medium",
      match: 80, missing: ["Chow mein noodles"],
      uses: ["Chicken Breast", "Carrots", "Bell Peppers", "Soy Sauce", "Onions"],
      expiringUsed: ["Chicken Breast"],
      cost: 3.00,
      cals: 520, protein: 36, carbs: 58, fat: 16,
      cuisine: "Chinese", diet: ["High-protein"],
      tags: ["high-protein"],
      tone: "#B85C1F",
      desc: "Springy noodles, seared chicken, and ribbons of veg in a glossy stir-fry sauce. Beats takeout.",
    },
    {
      id: "r18",
      name: "Egg Drop Soup",
      time: 12, difficulty: "Easy",
      match: 75, missing: ["Chicken stock", "Cornstarch"],
      uses: ["Eggs", "Soy Sauce", "Garlic"],
      expiringUsed: [],
      cost: 0.90,
      cals: 160, protein: 12, carbs: 8, fat: 8,
      cuisine: "Chinese", diet: ["Vegetarian", "High-protein"],
      tags: ["under-20", "budget"],
      tone: "#C99325",
      desc: "Silky egg ribbons in a gingery, savoury broth. Ready in the time it takes to set the table.",
    },

    // ─── Mexican ─────────────────────────────────────────────
    {
      id: "r19",
      name: "Black Bean Tacos",
      time: 20, difficulty: "Easy",
      match: 82, missing: ["Corn tortillas", "Lime"],
      uses: ["Black Beans", "Roma Tomatoes", "Onions", "Cheddar Cheese"],
      expiringUsed: [],
      cost: 1.65,
      cals: 420, protein: 16, carbs: 56, fat: 14,
      cuisine: "Mexican", diet: ["Vegetarian"],
      tags: ["under-20", "budget"],
      tone: "#B85C1F",
      desc: "Smoky spiced black beans piled into warm tortillas with quick pico and melty cheese. Taco night sorted.",
    },
    {
      id: "r20",
      name: "Chicken Quesadilla",
      time: 22, difficulty: "Easy",
      match: 85, missing: ["Flour tortillas"],
      uses: ["Chicken Breast", "Cheddar Cheese", "Bell Peppers", "Onions"],
      expiringUsed: ["Chicken Breast"],
      cost: 3.20,
      cals: 560, protein: 34, carbs: 38, fat: 28,
      cuisine: "Mexican", diet: ["High-protein"],
      tags: ["high-protein"],
      tone: "#C73E2E",
      desc: "Golden, crisp tortilla stuffed with spiced chicken, peppers, and gooey cheddar. Knife-and-fork optional.",
    },
    {
      id: "r21",
      name: "Huevos Rancheros",
      time: 18, difficulty: "Easy",
      match: 88, missing: ["Corn tortillas"],
      uses: ["Eggs", "Black Beans", "Roma Tomatoes", "Cheddar Cheese"],
      expiringUsed: [],
      cost: 1.80,
      cals: 460, protein: 22, carbs: 34, fat: 24,
      cuisine: "Mexican", diet: ["Vegetarian", "High-protein"],
      tags: ["under-20", "high-protein", "breakfast"],
      tone: "#D9722B",
      desc: "Fried eggs over crisp tortillas, smoky beans, and a bright ranchero salsa. Brunch with a kick.",
    },
    {
      id: "r22",
      name: "Burrito Bowl",
      time: 25, difficulty: "Easy",
      match: 100, missing: [],
      uses: ["Black Beans", "Jasmine Rice", "Bell Peppers", "Onions", "Cheddar Cheese", "Roma Tomatoes"],
      expiringUsed: [],
      cost: 1.95,
      cals: 580, protein: 20, carbs: 88, fat: 16,
      cuisine: "Mexican", diet: ["Vegetarian"],
      tags: ["meal-prep", "budget", "high-protein"],
      tone: "#3B6E3D",
      desc: "Cilantro-lime rice, smoky beans, charred peppers, and salsa in one bowl. 100% pantry, fully batch-able.",
    },
  ];

  // ─── Meal plan (current week) ────────────────────────────────────────────
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const mealPlan = {
    Mon: { B: "r5", L: "r3", D: "r1" },
    Tue: { B: "r7", L: null /* leftover fried rice */, D: "r2" },
    Wed: { B: "r6", L: "r3", D: "r4" },
    Thu: { B: "r5", L: null, D: "r8" },
    Fri: { B: "r9", L: "r10", D: "r1" },
    Sat: { B: "r6", L: null, D: null },
    Sun: { B: "r7", L: "r10", D: null },
  };

  // ─── Grocery list ────────────────────────────────────────────────────────
  const grocery = [
    { id: "g1",  name: "Spring onions",   qty: "1 bunch", section: "Produce",  price: 1.49, needed: ["Schezwan Egg Fried Rice"], addedBy: "Pilot",   priority: "high",   bought: false },
    { id: "g2",  name: "Whole Milk",       qty: "½ gal",   section: "Dairy",    price: 3.79, needed: ["Low stock"],                addedBy: "Alex",    priority: "high",   bought: false },
    { id: "g3",  name: "Eggs",             qty: "1 dozen", section: "Dairy",    price: 4.20, needed: ["Low stock"],                addedBy: "Hemanth", priority: "high",   bought: false },
    { id: "g4",  name: "Parmesan",         qty: "4 oz",    section: "Dairy",    price: 5.49, needed: ["Garlic Butter Pasta"],      addedBy: "Pilot",   priority: "medium", bought: false },
    { id: "g5",  name: "Flour tortillas",  qty: "8 ct",    section: "Bakery",   price: 2.99, needed: ["Air Fryer Chicken Wrap"],   addedBy: "Pilot",   priority: "medium", bought: false },
    { id: "g6",  name: "Romaine lettuce",  qty: "1 head",  section: "Produce",  price: 2.29, needed: ["Air Fryer Chicken Wrap"],   addedBy: "Pilot",   priority: "medium", bought: false },
    { id: "g7",  name: "Limes",            qty: "3",       section: "Produce",  price: 1.05, needed: ["Black Bean Bowl"],          addedBy: "Pilot",   priority: "low",    bought: false },
    { id: "g8",  name: "Bananas",          qty: "6",       section: "Produce",  price: 1.79, needed: ["Weekly staple"],            addedBy: "Hemanth", priority: "medium", bought: false },
    { id: "g9",  name: "Dish soap",        qty: "1",       section: "Household",price: 3.49, needed: ["Running low"],              addedBy: "Maya",    priority: "medium", bought: false },
    { id: "g10", name: "Paper towels",     qty: "6 pk",    section: "Household",price: 7.99, needed: ["Running low"],              addedBy: "Alex",    priority: "low",    bought: false },
    { id: "g11", name: "Greek yogurt",     qty: "32 oz",   section: "Dairy",    price: 5.49, needed: ["Meal plan"],                addedBy: "Hemanth", priority: "medium", bought: true },
    { id: "g12", name: "Spinach",          qty: "1 bag",   section: "Produce",  price: 3.49, needed: ["Replace expired"],          addedBy: "Pilot",   priority: "low",    bought: false },
  ];

  // ─── Suggestions from Pilot ──────────────────────────────────────────────
  const pilotSuggestions = [
    { id: "p1", icon: "spark",  tone: "tomato", title: "Spinach expires tomorrow",     body: "Pair with eggs and rice for fried rice tonight — uses 3 fading ingredients." },
    { id: "p2", icon: "leaf",   tone: "green",  title: "Cook 5 meals without shopping", body: "You have everything for chickpea bowl, tofu stir-fry, omelette, parfait, and pancakes." },
    { id: "p3", icon: "wallet", tone: "amber",  title: "$42 saved this week",          body: "Cooking 4 pantry-based meals instead of takeout. You're $66 under budget." },
    { id: "p4", icon: "alert",  tone: "orange", title: "You buy milk every 6 days",    body: "Switching to a half-gallon size could reduce waste — you tossed milk twice last month." },
  ];

  // ─── Household ───────────────────────────────────────────────────────────
  const household = [
    { id: "h1", name: "Hemanth Balla", initials: "HB", color: "#3B6E3D", role: "Owner",   added: 18, spent: 124.50 },
    { id: "h2", name: "Alex Chen",     initials: "AC", color: "#D9722B", role: "Member",  added:  9, spent:  58.20 },
    { id: "h3", name: "Maya Patel",    initials: "MP", color: "#6E3A4F", role: "Member",  added: 11, spent:  72.10 },
  ];

  // ─── Activity timeline ───────────────────────────────────────────────────
  const activity = [
    { when: "2m ago",   who: "Pilot",   action: "flagged spinach expiring tomorrow",       icon: "alert"  },
    { when: "1h ago",   who: "Alex",    action: "added Whole Milk to grocery list",         icon: "cart"   },
    { when: "3h ago",   who: "Hemanth", action: "cooked Chickpea Rice Bowl · 2 servings",   icon: "chef"   },
    { when: "Yesterday",who: "Maya",    action: "bought 7 items at Aldi · $24.18",          icon: "bag"    },
    { when: "Yesterday",who: "Pilot",   action: "auto-imported receipt from Publix",        icon: "scan"   },
    { when: "2d ago",   who: "Hemanth", action: "marked cooked rice as leftover",           icon: "save"   },
    { when: "2d ago",   who: "Pilot",   action: "added 'Spring onions' to grocery list",    icon: "plus"   },
  ];

  // ─── Leftovers ───────────────────────────────────────────────────────────
  const leftovers = [
    { id: "l1", meal: "Cooked Jasmine Rice",  servings: 2, cooked: "Mon",  useBy: "Wed", days: 1, tone: "amber",
      storage: "Fridge · sealed glass",  reheat: "Microwave 90 sec with a splash of water, or stir-fry over high heat.",
      illo: "rice",
      remix: ["Schezwan Fried Rice", "Egg Rice Bowl", "Rice Soup"] },
    { id: "l2", meal: "Chickpea Rice Bowl",   servings: 1, cooked: "Today",useBy: "Thu", days: 3, tone: "green",
      storage: "Fridge · meal-prep container",
      reheat: "Microwave 60 sec, top with fresh yogurt and herbs after.",
      illo: "beans",
      remix: ["Add to wrap", "Top with yogurt"] },
    { id: "l3", meal: "Roasted Vegetables",   servings: 1, cooked: "Sun",  useBy: "Tue", days: 0, tone: "tomato",
      storage: "Fridge · top shelf",
      reheat: "Air fryer 4 min at 380°F to bring back the crisp.",
      illo: "carrot",
      remix: ["Fold into omelette", "Pasta toss"] },
  ];

  // ─── Budget ──────────────────────────────────────────────────────────────
  const budget = {
    monthly: 250,
    spent: 184.32,
    waste: 12.40,
    savedFromPantry: 42,
    byCategory: [
      { cat: "Produce",   amount: 38.40, color: "#3B6E3D" },
      { cat: "Dairy",     amount: 42.10, color: "#C99325" },
      { cat: "Meat",      amount: 31.80, color: "#C73E2E" },
      { cat: "Grains",    amount: 22.50, color: "#B85C1F" },
      { cat: "Frozen",    amount: 18.20, color: "#3A5F7A" },
      { cat: "Snacks",    amount: 14.62, color: "#6E3A4F" },
      { cat: "Sauces",    amount:  9.80, color: "#D9722B" },
      { cat: "Household", amount:  6.90, color: "#6F665A" },
    ],
    weekly: [44, 38, 52, 50.32], // 4 weeks of this month
    stores: [
      { name: "Aldi",     amount: 78.42, trips: 4 },
      { name: "Walmart",  amount: 52.18, trips: 2 },
      { name: "Publix",   amount: 31.05, trips: 2 },
      { name: "Trader Joe's", amount: 22.67, trips: 1 },
    ],
  };

  // ─── Nutrition (today) ───────────────────────────────────────────────────
  const nutrition = {
    cals:    { value: 1840, target: 2200 },
    protein: { value:   68, target:   90, unit: "g" },
    carbs:   { value:  214, target:  275, unit: "g" },
    fat:     { value:   52, target:   70, unit: "g" },
    fiber:   { value:   18, target:   25, unit: "g" },
    veg:     { value:    3, target:    5, unit: "servings" },
  };

  // ─── Today's plan (Dashboard hero) ───────────────────────────────────────
  const todayPlan = {
    summary: "Lean on what's expiring. One real cook, two easy meals, no shopping needed.",
    slots: [
      { slot: "B", time: "7:30 am", name: "Greek Yogurt Parfait",   recipe: "r7",
        kind: "5-min · pantry",     uses: ["Greek Yogurt", "Frozen Berries", "Rolled Oats"],
        cal: 290, p: 18, status: "ready", tone: "#6E3A4F" },
      { slot: "L", time: "12:30 pm", name: "Leftover Chickpea Bowl", recipe: null,
        kind: "Reheat · 0 effort",  uses: ["Chickpea Rice Bowl"],
        cal: 460, p: 18, status: "leftover", tone: "#C99325" },
      { slot: "D", time: "7:15 pm", name: "Schezwan Egg Fried Rice", recipe: "r1",
        kind: "18-min cook · uses spinach + rice",
        uses: ["Cooked Rice", "Eggs", "Spinach", "Bell Peppers", "Garlic", "Schezwan Sauce"],
        cal: 480, p: 18, status: "tonight", tone: "#D9722B" },
      { slot: "S", time: "Snack",   name: "Apple + Peanut Butter",   recipe: null,
        kind: "Grab and go",        uses: ["Apples", "Peanut Butter"],
        cal: 210, p: 7,  status: "ready", tone: "#3B6E3D" },
    ],
  };

  // ─── Pantry coverage score (meals you can make) ──────────────────────────
  const mealCoverage = {
    days: 6.5,
    breakfasts: 5, lunches: 4, dinners: 6, snacks: 3,
    available: 11, // recipes you can make right now
    oneSwap: 5,    // recipes unlocked by buying 1 item
    blockers: [
      { ingr: "Tortillas",   unlocks: 3, items: ["Air Fryer Wrap", "Quesadilla", "Breakfast Wrap"] },
      { ingr: "Lime",        unlocks: 2, items: ["Black Bean Bowl", "Citrus Slaw"] },
      { ingr: "Parmesan",    unlocks: 2, items: ["Spinach Pasta", "Cacio e Pepe"] },
    ],
  };

  // ─── Kitchen Wins (achievements, premium tone) ───────────────────────────
  const kitchenWins = [
    { id: "w1", title: "No-waste week",     value: "7 days",  sub: "Nothing tossed since Nov 18",  icon: "leaf",     tone: "green" },
    { id: "w2", title: "Cooked at home",    value: "12 meals",sub: "vs. 5 takeout · last month",  icon: "chef",     tone: "orange" },
    { id: "w3", title: "Under budget",      value: "$66 left",sub: "8 days remaining in November", icon: "wallet",   tone: "green" },
    { id: "w4", title: "Saved vs. takeout", value: "$84",     sub: "by cooking pantry meals",      icon: "sparkles", tone: "amber" },
  ];

  // ─── Auto-restock rules ──────────────────────────────────────────────────
  const autoRestockRules = [
    { id: "ar1", item: "Eggs",          illo: "egg",     rule: "Keep at least 6",          threshold: "6 left",   freq: "Sundays",   on: true,  next: "Nov 24" },
    { id: "ar2", item: "Whole Milk",    illo: "milk",    rule: "Add when below 25%",       threshold: "<25%",     freq: "Auto",      on: true,  next: "in 2 days" },
    { id: "ar3", item: "Jasmine Rice",  illo: "ricebag", rule: "Add when below 2 cups",    threshold: "<2 cups",  freq: "Auto",      on: true,  next: "in 12 days" },
    { id: "ar4", item: "Coffee",        illo: "coffee",  rule: "Add every 10 days",        threshold: "Time",     freq: "10 days",   on: true,  next: "Nov 27" },
    { id: "ar5", item: "Bananas",       illo: "banana",  rule: "Add every Monday",         threshold: "Weekly",   freq: "Mondays",   on: true,  next: "Nov 24" },
    { id: "ar6", item: "Frozen Veg",    illo: "frozenveg", rule: "Keep stocked",           threshold: "Always",   freq: "Auto",      on: false, next: "—" },
    { id: "ar7", item: "Olive Oil",     illo: "oil",     rule: "Add when ¼ left",          threshold: "<25%",     freq: "Auto",      on: true,  next: "in 6 weeks" },
  ];

  // ─── Low stock list ──────────────────────────────────────────────────────
  const lowStock = [
    { name: "Whole Milk",   illo: "milk",   level: 35, status: "low",      qty: "½ gallon left" },
    { name: "Wheat Bread",  illo: "bread",  level: 50, status: "running",  qty: "½ loaf left"   },
    { name: "Cooked Rice",  illo: "rice",   level: 25, status: "low",      qty: "2 servings"    },
    { name: "Schezwan Sauce", illo: "chili",level: 45, status: "running",  qty: "½ jar"         },
  ];

  // ─── Pantry staples builder ──────────────────────────────────────────────
  const staples = {
    score: 76,
    have:   ["Jasmine Rice", "Olive Oil", "Eggs", "Salt", "Pepper", "Soy Sauce", "Onions", "Garlic", "Olive Oil"],
    missing: [
      { name: "Canned tomatoes", illo: "beans",   unlocks: 8, price: 1.49 },
      { name: "Pasta sauce",     illo: "chili",   unlocks: 5, price: 2.79 },
      { name: "Black beans",     illo: "beans",   unlocks: 6, price: 0.89 },
      { name: "Tortillas",       illo: "bread",   unlocks: 4, price: 2.99 },
      { name: "Stock cubes",     illo: "salt",    unlocks: 7, price: 1.99 },
    ],
  };

  // ─── Kitchen Memory (patterns) ───────────────────────────────────────────
  const kitchenMemory = [
    { id: "km1", icon: "chef",    title: "You finish eggs in 6 days",
      body: "On average over the last 3 months. Pilot's adding them to your Sunday list." },
    { id: "km2", icon: "alert",   title: "Spinach is your #1 waste",
      body: "60% of the spinach you buy spoils. Try the 5oz bag, or freeze on day 4." },
    { id: "km3", icon: "timer",   title: "Weeknights = 20-minute meals",
      body: "Mon–Thu, your average cook time is 22 min. We've pinned a 20-min shelf." },
    { id: "km4", icon: "wallet",  title: "Sundays are your big shop",
      body: "You make 1 large trip on Sunday + 1 small refill mid-week. Aldi → Publix." },
    { id: "km5", icon: "heart",   title: "Rice meals = comfort food",
      body: "You cook a rice-based meal 2x per week. Top reorder: Schezwan sauce." },
  ];

  // ─── Craving Mode prompts ────────────────────────────────────────────────
  const cravings = [
    { id: "spicy",    label: "Spicy & quick",    icon: "flame",  recipes: ["r1", "r4"] },
    { id: "comfort",  label: "Comfort meal",     icon: "heart",  recipes: ["r2", "r9"] },
    { id: "light",    label: "Something light",  icon: "leaf",   recipes: ["r7", "r6"] },
    { id: "protein",  label: "High protein",     icon: "fire",   recipes: ["r3", "r4", "r8"] },
    { id: "cheap",    label: "Under $3",         icon: "wallet", recipes: ["r3", "r5", "r9", "r10"] },
    { id: "nocook",   label: "No cooking",       icon: "snowflake", recipes: ["r7"] },
    { id: "takeout",  label: "Like takeout",     icon: "bag",    recipes: ["r1", "r8", "r4"] },
    { id: "leftover", label: "Use leftovers",    icon: "save",   recipes: ["r1"] },
  ];

  // ─── Recipe Unlocks (buy 1 to unlock N) ──────────────────────────────────
  const unlocks = [
    { id: "u1", buy: "Tortillas",       illo: "bread",   unlocks: 4, price: 2.99,
      meals: ["Breakfast Wrap", "Air Fryer Chicken Wrap", "Quesadilla", "Bean Burrito"], tone: "#D9722B" },
    { id: "u2", buy: "Canned Tomatoes", illo: "beans",   unlocks: 5, price: 1.49,
      meals: ["Pasta Pomodoro", "Tomato Soup", "Chicken Curry", "Shakshuka", "Tomato Rice"], tone: "#C73E2E" },
    { id: "u3", buy: "Parmesan",        illo: "cheese",  unlocks: 3, price: 5.49,
      meals: ["Spinach Pasta", "Cacio e Pepe", "Risotto"], tone: "#C99325" },
    { id: "u4", buy: "Heavy Cream",     illo: "milk",    unlocks: 4, price: 3.99,
      meals: ["Carbonara", "Creamy Soup", "Pasta Alfredo", "Vodka Sauce"], tone: "#6E3A4F" },
    { id: "u5", buy: "Lime + Cilantro", illo: "spinach", unlocks: 3, price: 2.40,
      meals: ["Black Bean Bowl", "Citrus Slaw", "Pad Thai"], tone: "#3B6E3D" },
  ];

  // ─── Waste Rescue Plan (next 3 days) ─────────────────────────────────────
  const wasteRescue = {
    risk: 2240, // cents
    plan: [
      { day: "Today",     action: "Use cooked rice + spinach", recipe: "r1", value: 5.49, illos: ["rice", "spinach"], why: "Both expire by tomorrow" },
      { day: "Tomorrow",  action: "Pasta with last spinach + bread side", recipe: "r2", value: 4.20, illos: ["spinach", "bread"], why: "Pasta uses the rest of the spinach" },
      { day: "Friday",    action: "Cook chicken now or freeze it", recipe: "r4", value: 7.99, illos: ["chicken"], why: "Chicken expires Friday" },
    ],
  };

  // ─── Takeout Swap suggestions ────────────────────────────────────────────
  const takeoutSwaps = [
    { id: "ts1", takeout: "Fried Rice",       takeoutCost: 16.00, home: "Schezwan Egg Fried Rice", homeCost: 2.80, time: 18, save: 13.20, recipe: "r1" },
    { id: "ts2", takeout: "Chicken Wrap",     takeoutCost: 12.50, home: "Air Fryer Chicken Wrap",   homeCost: 3.10, time: 20, save: 9.40,  recipe: "r4" },
    { id: "ts3", takeout: "Yogurt Bowl",      takeoutCost: 9.00,  home: "Greek Yogurt Parfait",     homeCost: 1.40, time: 5,  save: 7.60,  recipe: "r7" },
    { id: "ts4", takeout: "Pad Thai Tofu",    takeoutCost: 14.50, home: "Tofu Stir Fry",            homeCost: 2.20, time: 24, save: 12.30, recipe: "r8" },
  ];

  // ─── Occasion Plans ──────────────────────────────────────────────────────
  const occasions = [
    { id: "o1", name: "Meal-prep Sunday",     icon: "save",     desc: "4 lunches you'll eat",         meals: 4, hours: 2.5, cost: 28 },
    { id: "o2", name: "Exam week",            icon: "timer",    desc: "5 meals, all under 20 min",    meals: 5, hours: 1.5, cost: 32 },
    { id: "o3", name: "Friends coming over",  icon: "users",    desc: "Dinner for 4, scales easily",  meals: 1, hours: 1.0, cost: 26 },
    { id: "o4", name: "Clean-out fridge",     icon: "leaf",     desc: "Uses everything expiring",     meals: 3, hours: 1.0, cost:  0 },
    { id: "o5", name: "No-cook week",         icon: "snowflake",desc: "Mostly assembly + reheats",    meals: 7, hours: 0.5, cost: 38 },
    { id: "o6", name: "High-protein gym",     icon: "flame",    desc: "100g+ protein/day",            meals: 7, hours: 3.0, cost: 58 },
  ];

  // ─── Waste Analytics ─────────────────────────────────────────────────────
  const wasteLog = [
    { item: "Spinach",    cat: "Produce", qty: "½ bag",   cost: 1.75, reason: "Expired",         date: "Nov 14" },
    { item: "Cilantro",   cat: "Produce", qty: "1 bunch", cost: 0.99, reason: "Forgot about it", date: "Nov 10" },
    { item: "Yogurt",     cat: "Dairy",   qty: "Last 1/3",cost: 1.83, reason: "Did not like",    date: "Nov  6" },
    { item: "Bell pepper",cat: "Produce", qty: "1",       cost: 1.00, reason: "Spoiled early",   date: "Nov  3" },
    { item: "Bread",      cat: "Bakery",  qty: "½ loaf",  cost: 1.50, reason: "Bought too much", date: "Oct 29" },
  ];

  // ─── Kitchen Inbox (universal capture) ───────────────────────────────────
  const inbox = [
    { id: "in1", type: "recipe",   text: "Crispy gnocchi · saw on Instagram",            when: "12m ago"   },
    { id: "in2", type: "grocery",  text: "Buy oat milk this weekend",                     when: "2h ago"    },
    { id: "in3", type: "voice",    text: "Voice note · 0:14 · 'try Schezwan paneer'",     when: "yesterday" },
    { id: "in4", type: "photo",    text: "Photo · fridge condition before grocery run",   when: "yesterday" },
    { id: "in5", type: "todo",     text: "Use spinach by Wednesday",                      when: "2d ago"    },
  ];

  // ─── Recipe Notebook (saved/personal) ────────────────────────────────────
  const notebook = [
    { id: "nb1", name: "Mom's dal tadka",         tone: "#C99325", ill: "beans",    last: "2 weeks ago", rating: 5, notes: "Use ghee, not oil" },
    { id: "nb2", name: "Roommate Alex's stir-fry",tone: "#3B6E3D", ill: "frozenveg",last: "Last week",  rating: 4, notes: "Add extra soy + sesame" },
    { id: "nb3", name: "TikTok feta pasta",       tone: "#C73E2E", ill: "pasta",    last: "Never",      rating: null, notes: "Try when feta is on sale" },
    { id: "nb4", name: "Late-night egg rice",     tone: "#D9722B", ill: "rice",     last: "3 days ago", rating: 5, notes: "Soy + sesame + scallion. Always works." },
  ];

  // ─── Cook Before You Shop suggestions ────────────────────────────────────
  const cookBeforeShop = {
    can: 3,
    meals: [
      { recipe: "r3", reason: "Everything in pantry" },
      { recipe: "r6", reason: "All ingredients fresh" },
      { recipe: "r8", reason: "Tofu expires in 8 days" },
    ],
    save: 18.40, // estimated savings
  };

  // ─── Cook Reels (short cooking videos) ───────────────────────────────────
  const reels = [
    { id: "rl1", recipeId: "r1",  creator: "Mei's Wok",      handle: "meiswok",
      title: "Wok-hei fried rice in 18 min", caption: "The cold-rice trick that makes it taste like takeout 🔥",
      likes: "24.1k", saves: "8.3k", comments: "612", duration: "0:46", tone: "#D9722B", illo: "rice", tag: "Indo-Chinese" },
    { id: "rl2", recipeId: "r16", creator: "Plant Powered Sam", handle: "plantpoweredsam",
      title: "Tofu so crispy it crunches", caption: "Cornstarch + don't touch the pan. That's the whole secret.",
      likes: "41.7k", saves: "15.2k", comments: "1.1k", duration: "0:38", tone: "#C73E2E", illo: "tofu", tag: "Chinese" },
    { id: "rl3", recipeId: "r11", creator: "Desi Kitchen",    handle: "desikitchen",
      title: "Restaurant-style chana masala", caption: "Brown the onions properly. That's where all the flavour lives.",
      likes: "33.5k", saves: "12.9k", comments: "884", duration: "0:54", tone: "#C85A2B", illo: "beans", tag: "Indian" },
    { id: "rl4", recipeId: "r19", creator: "Quick Tacos",     handle: "quicktacos",
      title: "10-minute taco night", caption: "Smoky black beans + a quick pico = weeknight hero 🌮",
      likes: "18.9k", saves: "5.6k", comments: "402", duration: "0:31", tone: "#B85C1F", illo: "tortilla", tag: "Mexican" },
    { id: "rl5", recipeId: "r5",  creator: "Lazy Brunch",     handle: "lazybrunch",
      title: "3-ingredient banana pancakes", caption: "No flour, no sugar. Uses up those sad brown bananas.",
      likes: "52.3k", saves: "21.4k", comments: "1.6k", duration: "0:28", tone: "#C99325", illo: "banana", tag: "Breakfast" },
    { id: "rl6", recipeId: "r22", creator: "Meal Prep Kitchen", handle: "mealprepkitchen",
      title: "5 burrito bowls, one pan", caption: "Cilantro-lime rice + smoky beans. Lunch sorted all week.",
      likes: "29.0k", saves: "11.1k", comments: "733", duration: "1:02", tone: "#3B6E3D", illo: "beans", tag: "Mexican" },
  ];

  return {
    user: { name: "Hemanth", first: "Hemanth", last: "Balla", initials: "HB",
            household: "Apartment 4B", roommates: 2 },
    items, recipes, days, mealPlan, grocery, pilotSuggestions,
    household, activity, leftovers, budget, nutrition,
    todayPlan, mealCoverage, kitchenWins, autoRestockRules, lowStock,
    staples, kitchenMemory, cravings, unlocks, wasteRescue,
    takeoutSwaps, occasions, wasteLog, inbox, notebook, cookBeforeShop,
    reels,
    scores: {
      pantryHealth: 84,
      wasteRisk: 22,
      staplesScore: 76,
      nutritionBalance: 78,
      budgetHealth: 88,
    },
  };
})();
