// Port of src/screens/recipe-defs.js — per-recipe scaled ingredient lists
// + step-by-step cook scripts. The legacy file stays in place until its
// consumers (cook-mode.jsx etc.) are converted in Phase 4.

import type { RecipeDef, ScaleFn, Spice, Step } from '@/types';

// Heat descriptor used in step copy. Kept inline to mirror the prototype.
const heatLine: Record<Spice, string> = {
  mild: 'kept gentle — warmth without the burn',
  medium: 'balanced — a clean, present heat',
  spicy: "turned up — it'll make you reach for water",
  extra: 'full send — keep yogurt or milk close',
};

export const recipeDefs = {
  // ═══════════════ Indo-Chinese ═══════════════
  r1: {
    ingredients: [
      { name: 'Eggs', qty: 2, unit: '', illo: 'egg' },
      { name: 'Yellow onion', qty: 0.5, unit: '', illo: 'onion' },
      { name: 'Garlic cloves', qty: 2, unit: '', illo: 'garlic' },
      { name: 'Bell pepper', qty: 1, unit: '', illo: 'pepper' },
      { name: 'Carrot', qty: 0.5, unit: '', illo: 'carrot' },
      { name: 'Cooked rice', qty: 2, unit: 'cups', illo: 'rice' },
      { name: 'Schezwan sauce', qty: 2, unit: 'tbsp', illo: 'chili', spice: true },
      { name: 'Soy sauce', qty: 1, unit: 'tsp', illo: 'soy' },
      { name: 'Vegetable oil', qty: 1, unit: 'tbsp', illo: 'oil' },
      { name: 'Spring onion', qty: 2, unit: 'stalks', illo: 'scallion' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Prep your ingredients while the pan heats.',
        body: `Dice ${q('Yellow onion')} onion, mince ${q('Garlic cloves')} garlic cloves, chop ${q('Bell pepper')} bell pepper, and grate ${q('Carrot')} carrot. Beat ${q('Eggs')} eggs in a small bowl with a pinch of salt.`,
        cue: 'All your ingredients are measured and chopped, with nothing left in the bag or wrapper.',
      },
      {
        title: 'Sear the aromatics in hot oil.',
        body: `Heat ${q('Vegetable oil')} oil in a wok over high. Add onion and garlic, stir-fry 60 seconds until fragrant. Toss in carrot and pepper for another 90 seconds.`,
        timer: 2,
        cue: 'Onions look slightly translucent and you can smell the garlic — about 60 seconds.',
      },
      {
        title: 'Scramble the eggs in the same pan.',
        body: 'Push veg to one side. Pour in beaten eggs, let them set for 10 seconds, then break into curds with the spatula.',
        tip: 'If your wok runs cool, scramble eggs separately and fold them back in at the end.',
        cue: 'Eggs are no longer wet but still soft and glossy. Pull them before they brown.',
      },
      {
        title:
          spice === 'spicy' || spice === 'extra'
            ? 'Add cold rice and the Schezwan heat.'
            : 'Add cold rice and Schezwan sauce.',
        body: `Add ${q('Cooked rice')} cold cooked rice and ${q('Schezwan sauce')} Schezwan sauce. Press the rice for 30 seconds, then stir-fry hard for 2 minutes until edges crisp. It'll be ${heatLine[spice]}.`,
        timer: 3,
        cue: 'Rice edges crisp slightly and grains are separate, not clumped. About 2 minutes of high heat.',
      },
      {
        title: 'Finish with soy and scallion.',
        body: `Splash ${q('Soy sauce')} soy sauce around the rim of the pan. Toss in ${q('Spring onion')} chopped spring onion. Plate and eat.`,
        tip: "Cooked rice keeps 3 days in the fridge. Pilot's tracking the leftovers for you.",
        cue: "Sauce coats every grain evenly. Taste — add a pinch of salt if it's flat. Serve hot.",
      },
    ],
  },

  // ═══════════════ Indian ═══════════════
  r11: {
    ingredients: [
      { name: 'Chickpeas', qty: 1.5, unit: 'cups', illo: 'beans' },
      { name: 'Yellow onion', qty: 1, unit: '', illo: 'onion' },
      { name: 'Roma tomatoes', qty: 2, unit: '', illo: 'tomato' },
      { name: 'Garlic cloves', qty: 3, unit: '', illo: 'garlic' },
      { name: 'Ginger', qty: 1, unit: 'tbsp', illo: 'ginger' },
      { name: 'Garam masala', qty: 1.5, unit: 'tsp', illo: 'salt' },
      { name: 'Red chili powder', qty: 1, unit: 'tsp', illo: 'chili', spice: true },
      { name: 'Vegetable oil', qty: 1.5, unit: 'tbsp', illo: 'oil' },
      { name: 'Cilantro', qty: 2, unit: 'tbsp', illo: 'cilantro' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Prep the masala base.',
        body: `Finely dice ${q('Yellow onion')} onion, mince ${q('Garlic cloves')} garlic and ${q('Ginger')} ginger, and chop ${q('Roma tomatoes')} tomatoes. Drain and rinse the chickpeas.`,
        cue: 'Onion is in even small dice, garlic and ginger are pasted, tomatoes ready in a bowl.',
      },
      {
        title: 'Fry the onions until deep golden.',
        body: `Heat ${q('Vegetable oil')} oil over medium. Add onion and cook, stirring, until golden-brown — this is where the flavour lives. Stir in the garlic-ginger for 30 seconds.`,
        timer: 7,
        cue: 'Onions are evenly golden-brown, not pale and not burnt. Smell turns sweet and nutty.',
      },
      {
        title: 'Build the tomato gravy.',
        body: `Add tomatoes plus ${q('Garam masala')} garam masala and ${q('Red chili powder')} chili powder. Cook down until the oil separates at the edges — the heat will be ${heatLine[spice]}.`,
        timer: 8,
        cue: 'Tomatoes collapse into a thick paste and you see oil glistening around the edge of the pan.',
      },
      {
        title: 'Simmer the chickpeas.',
        body: 'Add the chickpeas and a cup of water. Simmer gently, then mash a spoonful of chickpeas against the pan to thicken the gravy.',
        timer: 10,
        cue: 'Gravy clings to the chickpeas rather than running thin. Taste and adjust salt.',
      },
      {
        title: 'Finish and serve.',
        body: `Squeeze in a little lemon, fold through ${q('Cilantro')} cilantro, and serve over rice or with bread.`,
        tip: 'Chana masala tastes even better tomorrow — Pilot can save a portion as a tracked leftover.',
        cue: "Bright, glossy, and fragrant. A swirl of cilantro on top and it's done.",
      },
    ],
  },
  r12: {
    ingredients: [
      { name: 'Eggs', qty: 4, unit: '', illo: 'egg' },
      { name: 'Yellow onion', qty: 1, unit: '', illo: 'onion' },
      { name: 'Roma tomatoes', qty: 2, unit: '', illo: 'tomato' },
      { name: 'Garlic cloves', qty: 3, unit: '', illo: 'garlic' },
      { name: 'Garam masala', qty: 1.5, unit: 'tsp', illo: 'salt' },
      { name: 'Red chili powder', qty: 1, unit: 'tsp', illo: 'chili', spice: true },
      { name: 'Vegetable oil', qty: 1.5, unit: 'tbsp', illo: 'oil' },
      { name: 'Cilantro', qty: 2, unit: 'tbsp', illo: 'cilantro' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Boil and prep the eggs.',
        body: `Hard-boil ${q('Eggs')} eggs (9 minutes), then peel. Prick each a few times with a fork so they drink up the masala.`,
        timer: 9,
        cue: 'Eggs peel cleanly and the yolks are just set — not chalky.',
      },
      {
        title: 'Caramelise the onions.',
        body: `Heat ${q('Vegetable oil')} oil and fry ${q('Yellow onion')} diced onion until golden. Add ${q('Garlic cloves')} minced garlic for the last 30 seconds.`,
        timer: 6,
        cue: 'Onions are soft and golden with no raw white bits left.',
      },
      {
        title: 'Make the gravy.',
        body: `Add ${q('Roma tomatoes')} chopped tomatoes, ${q('Garam masala')} garam masala, and ${q('Red chili powder')} chili powder. Cook to a thick paste — ${heatLine[spice]}.`,
        timer: 8,
        cue: 'Sauce darkens and thickens, oil beads at the edges.',
      },
      {
        title: 'Sear the eggs and simmer.',
        body: 'Lightly brown the boiled eggs in a little oil, then slip them into the gravy with a splash of water. Spoon sauce over and simmer.',
        timer: 6,
        tip: 'Browning the eggs first keeps them from turning rubbery in the sauce.',
        cue: 'Eggs are coated in clinging masala and warmed through.',
      },
      {
        title: 'Garnish and serve.',
        body: `Scatter ${q('Cilantro')} cilantro over the top. Serve with rice or flatbread.`,
        cue: 'Glossy, deep-red gravy with halved eggs nestled in. Done.',
      },
    ],
  },
  r13: {
    ingredients: [
      { name: 'Paneer', qty: 8, unit: 'oz', illo: 'paneer' },
      { name: 'Roma tomatoes', qty: 3, unit: '', illo: 'tomato' },
      { name: 'Yellow onion', qty: 0.5, unit: '', illo: 'onion' },
      { name: 'Garlic cloves', qty: 3, unit: '', illo: 'garlic' },
      { name: 'Butter', qty: 2, unit: 'tbsp', illo: 'cheese' },
      { name: 'Heavy cream', qty: 3, unit: 'tbsp', illo: 'milk' },
      { name: 'Garam masala', qty: 1.5, unit: 'tsp', illo: 'salt' },
      { name: 'Red chili powder', qty: 0.5, unit: 'tsp', illo: 'chili', spice: true },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Cube the paneer and prep.',
        body: `Cut ${q('Paneer')} paneer into bite-size cubes. Roughly chop ${q('Roma tomatoes')} tomatoes, ${q('Yellow onion')} onion, and ${q('Garlic cloves')} garlic.`,
        cue: 'Paneer is in even cubes; tomatoes and onion are roughly chopped for blending.',
      },
      {
        title: 'Soften, then blend the gravy.',
        body: 'Simmer tomatoes, onion, and garlic with a splash of water until soft, then blend to a smooth purée. Strain for that silky restaurant texture.',
        timer: 8,
        cue: 'Purée is smooth and pourable with no chunks.',
      },
      {
        title: 'Cook the buttery sauce.',
        body: `Melt ${q('Butter')} butter, pour in the purée, and add ${q('Garam masala')} garam masala and ${q('Red chili powder')} chili powder. Simmer until thick — ${heatLine[spice]}.`,
        timer: 7,
        cue: 'Sauce thickens and turns a glossy deep orange.',
      },
      {
        title: 'Add paneer and cream.',
        body: `Stir in ${q('Heavy cream')} cream and the paneer cubes. Simmer gently so the paneer stays soft and soaks up the sauce.`,
        timer: 5,
        tip: "Soak the paneer in warm water for 10 minutes first if it feels firm — it'll be pillowy.",
        cue: 'Paneer is warmed through and the sauce is creamy, not split.',
      },
      {
        title: 'Finish with a swirl.',
        body: 'Swirl in a little extra cream and a knob of butter. Serve with naan or rice.',
        cue: 'Velvety, rich, and a little sweet. A cream swirl on top finishes it.',
      },
    ],
  },
  r14: {
    ingredients: [
      { name: 'Red lentils', qty: 1, unit: 'cup', illo: 'lentils' },
      { name: 'Yellow onion', qty: 0.5, unit: '', illo: 'onion' },
      { name: 'Roma tomato', qty: 1, unit: '', illo: 'tomato' },
      { name: 'Garlic cloves', qty: 3, unit: '', illo: 'garlic' },
      { name: 'Cumin seeds', qty: 1, unit: 'tsp', illo: 'salt' },
      { name: 'Red chili powder', qty: 0.5, unit: 'tsp', illo: 'chili', spice: true },
      { name: 'Ghee or oil', qty: 2, unit: 'tbsp', illo: 'oil' },
      { name: 'Cilantro', qty: 2, unit: 'tbsp', illo: 'cilantro' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Rinse and boil the lentils.',
        body: `Rinse ${q('Red lentils')} red lentils until the water runs clear. Boil with 3 cups water, ${q('Roma tomato')} chopped tomato, and a pinch of turmeric until soft and creamy.`,
        timer: 15,
        cue: 'Lentils break down into a soft, porridge-like dal. Whisk for a smoother texture.',
      },
      {
        title: 'Make the tadka (tempering).',
        body: `Heat ${q('Ghee or oil')} ghee in a small pan. Add ${q('Cumin seeds')} cumin seeds and let them sizzle and pop for a few seconds.`,
        timer: 1,
        cue: "Cumin seeds darken a shade and smell toasty — don't let them burn.",
      },
      {
        title: 'Bloom the aromatics.',
        body: `Add ${q('Yellow onion')} chopped onion and ${q('Garlic cloves')} sliced garlic. Fry until golden, then stir in ${q('Red chili powder')} chili powder off the heat — ${heatLine[spice]}.`,
        timer: 4,
        cue: 'Garlic is golden and the chili powder turns the ghee deep red.',
      },
      {
        title: 'Pour the tadka over the dal.',
        body: 'Tip the sizzling tempering straight into the pot of dal — it should hiss. Stir through and simmer a minute to marry.',
        tip: 'Pouring the hot tadka over at the end is what gives dal its signature aroma.',
        cue: 'The dal smells intensely fragrant the moment the tadka hits it.',
      },
      {
        title: 'Finish and serve.',
        body: `Fold in ${q('Cilantro')} cilantro and a squeeze of lemon. Serve with steamed rice.`,
        cue: 'Loose but spoonable, glossy on top. A final cilantro scatter and serve hot.',
      },
    ],
  },

  // ═══════════════ Chinese ═══════════════
  r15: {
    ingredients: [
      { name: 'Hakka noodles', qty: 6, unit: 'oz', illo: 'noodles' },
      { name: 'Bell pepper', qty: 1, unit: '', illo: 'pepper' },
      { name: 'Carrot', qty: 1, unit: '', illo: 'carrot' },
      { name: 'Yellow onion', qty: 0.5, unit: '', illo: 'onion' },
      { name: 'Garlic cloves', qty: 3, unit: '', illo: 'garlic' },
      { name: 'Soy sauce', qty: 2, unit: 'tbsp', illo: 'soy' },
      { name: 'Sriracha', qty: 1, unit: 'tsp', illo: 'chili', spice: true },
      { name: 'Vegetable oil', qty: 1.5, unit: 'tbsp', illo: 'oil' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Boil the noodles al dente.',
        body: `Cook ${q('Hakka noodles')} noodles in salted water until just tender, drain, and toss with a few drops of oil so they don't stick.`,
        timer: 5,
        cue: "Noodles are cooked but still have bite — they'll cook more in the wok.",
      },
      {
        title: 'Julienne the vegetables.',
        body: `Cut ${q('Bell pepper')} pepper, ${q('Carrot')} carrot, and ${q('Yellow onion')} onion into thin matchsticks. Mince ${q('Garlic cloves')} garlic.`,
        cue: 'Everything is in thin, even strips so it cooks fast and stays crunchy.',
      },
      {
        title: 'Stir-fry on high heat.',
        body: 'Get the wok smoking-hot with oil. Add garlic, then the vegetables, and toss constantly for 2–3 minutes so they char but stay crisp.',
        timer: 3,
        cue: 'Veg picks up a few charred edges but still snaps — keep it moving.',
      },
      {
        title: 'Toss in noodles and sauce.',
        body: `Add the noodles, ${q('Soy sauce')} soy sauce, and ${q('Sriracha')} sriracha. Toss hard so everything coats evenly — ${heatLine[spice]}.`,
        timer: 2,
        tip: 'Use tongs and lift-toss rather than stir to keep the noodles from breaking.',
        cue: 'Noodles are evenly browned and glossy with no pale, sauceless clumps.',
      },
      {
        title: 'Plate hot.',
        body: 'Finish with sliced spring onion and serve immediately while the wok char is fresh.',
        cue: 'Steamy, glossy, and smoky. Serve right away.',
      },
    ],
  },
  r16: {
    ingredients: [
      { name: 'Firm tofu', qty: 14, unit: 'oz', illo: 'tofu' },
      { name: 'Bell pepper', qty: 1, unit: '', illo: 'pepper' },
      { name: 'Garlic cloves', qty: 3, unit: '', illo: 'garlic' },
      { name: 'Peanuts', qty: 0.33, unit: 'cup', illo: 'peanuts' },
      { name: 'Soy sauce', qty: 2, unit: 'tbsp', illo: 'soy' },
      { name: 'Sriracha', qty: 1, unit: 'tbsp', illo: 'chili', spice: true },
      { name: 'Cornstarch', qty: 1, unit: 'tbsp', illo: 'salt' },
      { name: 'Vegetable oil', qty: 2, unit: 'tbsp', illo: 'oil' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Press and cube the tofu.',
        body: `Press ${q('Firm tofu')} tofu to squeeze out water, cube it, and toss in ${q('Cornstarch')} cornstarch so it crisps up.`,
        cue: 'Tofu cubes are dry to the touch and lightly dusted white with cornstarch.',
      },
      {
        title: 'Crisp the tofu.',
        body: `Heat ${q('Vegetable oil')} oil and fry the tofu, turning, until golden and crunchy on all sides. Set aside.`,
        timer: 6,
        tip: "Don't crowd the pan and resist stirring too early — let each side set before flipping.",
        cue: 'Edges are deep golden and crisp; the cubes sound hollow when tapped.',
      },
      {
        title: 'Mix the Kung Pao sauce.',
        body: `Whisk ${q('Soy sauce')} soy sauce, ${q('Sriracha')} sriracha, a teaspoon of sugar, and a splash of vinegar — ${heatLine[spice]}.`,
        cue: 'Sauce tastes balanced: salty, sweet, sour, and hot all at once.',
      },
      {
        title: 'Stir-fry and combine.',
        body: `Flash-fry ${q('Garlic cloves')} garlic and ${q('Bell pepper')} diced pepper, add the sauce, then return the tofu and ${q('Peanuts')} peanuts. Toss to glaze.`,
        timer: 3,
        cue: 'Sauce thickens and clings to every cube; peanuts are warmed and fragrant.',
      },
      {
        title: 'Serve over rice.',
        body: 'Spoon over steamed rice and top with spring onion. Eat while the tofu is still crisp.',
        cue: 'Glossy, glistening, and crunchy. Serve straight away.',
      },
    ],
  },
  r17: {
    ingredients: [
      { name: 'Chicken breast', qty: 0.75, unit: 'lb', illo: 'chicken' },
      { name: 'Chow mein noodles', qty: 6, unit: 'oz', illo: 'noodles' },
      { name: 'Carrot', qty: 1, unit: '', illo: 'carrot' },
      { name: 'Bell pepper', qty: 1, unit: '', illo: 'pepper' },
      { name: 'Yellow onion', qty: 0.5, unit: '', illo: 'onion' },
      { name: 'Soy sauce', qty: 2.5, unit: 'tbsp', illo: 'soy' },
      { name: 'Sriracha', qty: 0.5, unit: 'tsp', illo: 'chili', spice: true },
      { name: 'Vegetable oil', qty: 2, unit: 'tbsp', illo: 'oil' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Slice the chicken thinly.',
        body: `Cut ${q('Chicken breast')} chicken into thin strips against the grain and toss with a little soy and cornstarch to tenderise.`,
        cue: 'Strips are thin and even so they cook in seconds.',
      },
      {
        title: 'Boil the noodles.',
        body: `Cook ${q('Chow mein noodles')} noodles until just tender, drain, and toss with oil.`,
        timer: 4,
        cue: 'Noodles are loose and separate, not gummy.',
      },
      {
        title: 'Sear the chicken.',
        body: `Heat ${q('Vegetable oil')} oil screaming-hot. Sear the chicken in a single layer until golden, then remove.`,
        timer: 4,
        tip: 'Searing in one layer gives colour; stirring too soon steams it grey.',
        cue: 'Chicken is golden outside and just cooked through — no pink.',
      },
      {
        title: 'Stir-fry veg, then combine.',
        body: `Stir-fry ${q('Carrot')} carrot, ${q('Bell pepper')} pepper, and ${q('Yellow onion')} onion, then add noodles, chicken, ${q('Soy sauce')} soy, and ${q('Sriracha')} sriracha — ${heatLine[spice]}.`,
        timer: 3,
        cue: 'Everything is glossy and evenly coated; veg still has crunch.',
      },
      {
        title: 'Toss and serve.',
        body: 'Lift-toss to combine and finish with spring onion. Serve hot.',
        cue: 'Steamy, glossy, and savoury. Plate immediately.',
      },
    ],
  },
  r18: {
    ingredients: [
      { name: 'Eggs', qty: 3, unit: '', illo: 'egg' },
      { name: 'Chicken stock', qty: 4, unit: 'cups', illo: 'salt' },
      { name: 'Cornstarch', qty: 1, unit: 'tbsp', illo: 'salt' },
      { name: 'Soy sauce', qty: 1, unit: 'tbsp', illo: 'soy' },
      { name: 'Garlic clove', qty: 1, unit: '', illo: 'garlic' },
      { name: 'Sriracha', qty: 0.5, unit: 'tsp', illo: 'chili', spice: true },
      { name: 'Spring onion', qty: 2, unit: 'stalks', illo: 'scallion' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Bring the broth to a simmer.',
        body: `Heat ${q('Chicken stock')} stock with ${q('Garlic clove')} smashed garlic and ${q('Soy sauce')} soy sauce until gently simmering.`,
        timer: 4,
        cue: 'Small bubbles break the surface — a steady simmer, not a rolling boil.',
      },
      {
        title: 'Thicken slightly.',
        body: `Mix ${q('Cornstarch')} cornstarch with a little cold water and stir into the broth so it just coats a spoon.`,
        cue: 'Broth turns silky and faintly glossy, thick enough to suspend the egg.',
      },
      {
        title: 'Beat and ribbon the eggs.',
        body: `Beat ${q('Eggs')} eggs. With the broth at a low simmer, drizzle them in a thin stream while slowly stirring in one direction.`,
        tip: 'Stir slowly and steadily — fast stirring shreds the egg; no stirring makes clumps.',
        cue: 'Eggs bloom into delicate silky ribbons across the broth.',
      },
      {
        title: 'Season to taste.',
        body: `Add ${q('Sriracha')} sriracha, a few drops of sesame oil, and white pepper — ${heatLine[spice]}.`,
        cue: 'Broth is savoury and rounded; adjust salt or soy to taste.',
      },
      {
        title: 'Garnish and serve.',
        body: `Ladle into bowls and shower with ${q('Spring onion')} sliced spring onion.`,
        cue: 'Steaming, glossy, ribboned with egg. Serve immediately.',
      },
    ],
  },

  // ═══════════════ Mexican ═══════════════
  r19: {
    ingredients: [
      { name: 'Black beans', qty: 1.5, unit: 'cups', illo: 'beans' },
      { name: 'Corn tortillas', qty: 6, unit: '', illo: 'tortilla' },
      { name: 'Roma tomatoes', qty: 2, unit: '', illo: 'tomato' },
      { name: 'Yellow onion', qty: 0.5, unit: '', illo: 'onion' },
      { name: 'Cheddar cheese', qty: 3, unit: 'oz', illo: 'cheese' },
      { name: 'Chili powder', qty: 1, unit: 'tsp', illo: 'chili', spice: true },
      { name: 'Lime', qty: 1, unit: '', illo: 'lime' },
      { name: 'Cilantro', qty: 2, unit: 'tbsp', illo: 'cilantro' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Make a quick pico.',
        body: `Finely dice ${q('Roma tomatoes')} tomatoes and half the ${q('Yellow onion')} onion. Toss with ${q('Cilantro')} cilantro, a squeeze of ${q('Lime')} lime, and salt.`,
        cue: 'Pico is bright and juicy; taste — it should be zingy and well-salted.',
      },
      {
        title: 'Spice the black beans.',
        body: `Sauté the rest of the onion, add ${q('Black beans')} drained beans and ${q('Chili powder')} chili powder with a splash of water. Mash lightly — ${heatLine[spice]}.`,
        timer: 6,
        cue: 'Beans are thick and scoopable, some mashed for creaminess, some whole.',
      },
      {
        title: 'Warm and char the tortillas.',
        body: `Heat ${q('Corn tortillas')} tortillas directly over a flame or dry skillet until lightly charred and pliable.`,
        timer: 2,
        tip: "A few char spots add smoky flavour — keep them moving so they don't go stiff.",
        cue: 'Tortillas are warm, soft, and freckled with char, not crispy-hard.',
      },
      {
        title: 'Build the tacos.',
        body: `Spoon beans onto each tortilla, top with ${q('Cheddar cheese')} grated cheese and a spoon of pico.`,
        cue: 'Cheese softens against the warm beans; tacos are loaded but foldable.',
      },
      {
        title: 'Finish with lime.',
        body: 'Squeeze over more lime and add a few cilantro leaves. Serve right away.',
        cue: 'Bright, smoky, fresh. Eat immediately while warm.',
      },
    ],
  },
  r20: {
    ingredients: [
      { name: 'Chicken breast', qty: 0.5, unit: 'lb', illo: 'chicken' },
      { name: 'Flour tortillas', qty: 4, unit: '', illo: 'tortilla' },
      { name: 'Cheddar cheese', qty: 4, unit: 'oz', illo: 'cheese' },
      { name: 'Bell pepper', qty: 1, unit: '', illo: 'pepper' },
      { name: 'Yellow onion', qty: 0.5, unit: '', illo: 'onion' },
      { name: 'Chili powder', qty: 1, unit: 'tsp', illo: 'chili', spice: true },
      { name: 'Vegetable oil', qty: 1, unit: 'tbsp', illo: 'oil' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Cook the spiced chicken.',
        body: `Dice ${q('Chicken breast')} chicken, season with ${q('Chili powder')} chili powder and salt, and sauté in ${q('Vegetable oil')} oil until cooked through — ${heatLine[spice]}.`,
        timer: 6,
        cue: 'Chicken is golden and cooked through with no pink in the center.',
      },
      {
        title: 'Soften the veg.',
        body: `Add ${q('Bell pepper')} sliced pepper and ${q('Yellow onion')} onion to the pan and cook until soft and a little charred.`,
        timer: 4,
        cue: 'Peppers and onion are limp and lightly browned at the edges.',
      },
      {
        title: 'Assemble the quesadilla.',
        body: `Lay a ${q('Flour tortillas')} tortilla in a dry skillet, scatter ${q('Cheddar cheese')} cheese, add the filling, more cheese, then fold or top with a second tortilla.`,
        cue: 'Cheese reaches the edges so it seals the quesadilla shut as it melts.',
      },
      {
        title: 'Crisp both sides.',
        body: 'Cook on medium until golden and crisp underneath, then flip carefully and crisp the other side.',
        timer: 4,
        tip: 'Medium heat is key — too hot and the tortilla burns before the cheese melts.',
        cue: 'Tortilla is deep golden and crisp; cheese is fully molten inside.',
      },
      {
        title: 'Slice and serve.',
        body: 'Rest 1 minute, then cut into wedges. Serve with salsa or sour cream.',
        cue: 'Cheese pulls in strings when you separate a wedge. Serve hot.',
      },
    ],
  },
  r21: {
    ingredients: [
      { name: 'Eggs', qty: 4, unit: '', illo: 'egg' },
      { name: 'Black beans', qty: 1, unit: 'cup', illo: 'beans' },
      { name: 'Corn tortillas', qty: 4, unit: '', illo: 'tortilla' },
      { name: 'Roma tomatoes', qty: 2, unit: '', illo: 'tomato' },
      { name: 'Cheddar cheese', qty: 2, unit: 'oz', illo: 'cheese' },
      { name: 'Chili powder', qty: 1, unit: 'tsp', illo: 'chili', spice: true },
      { name: 'Vegetable oil', qty: 2, unit: 'tbsp', illo: 'oil' },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Make the ranchero salsa.',
        body: `Blister ${q('Roma tomatoes')} tomatoes in a hot dry pan, then chop and simmer with ${q('Chili powder')} chili powder and salt into a quick sauce — ${heatLine[spice]}.`,
        timer: 6,
        cue: 'Salsa is thick, smoky, and a little chunky. Taste for salt and heat.',
      },
      {
        title: 'Warm the spiced beans.',
        body: `Heat ${q('Black beans')} beans with a pinch of cumin and salt, mashing lightly until spreadable.`,
        timer: 4,
        cue: 'Beans are warm and creamy, easy to spread on a tortilla.',
      },
      {
        title: 'Crisp the tortillas.',
        body: `Lightly fry ${q('Corn tortillas')} tortillas in ${q('Vegetable oil')} oil until they start to crisp at the edges but stay foldable.`,
        timer: 3,
        cue: 'Tortillas have a little crunch at the rim but bend without snapping.',
      },
      {
        title: 'Fry the eggs.',
        body: `Fry ${q('Eggs')} eggs sunny-side up so the whites are set and the yolks stay runny.`,
        timer: 3,
        tip: 'Runny yolks are the sauce here — pull them just as the whites turn opaque.',
        cue: 'Whites are fully set with crisp lacy edges; yolks still wobble.',
      },
      {
        title: 'Stack and serve.',
        body: `Spread beans on each tortilla, top with an egg, spoon over salsa, and finish with ${q('Cheddar cheese')} cheese.`,
        cue: 'Yolk breaks into the salsa and beans. Serve immediately.',
      },
    ],
  },
  r22: {
    ingredients: [
      { name: 'Jasmine rice', qty: 1, unit: 'cup', illo: 'ricebag' },
      { name: 'Black beans', qty: 1, unit: 'cup', illo: 'beans' },
      { name: 'Bell pepper', qty: 1, unit: '', illo: 'pepper' },
      { name: 'Yellow onion', qty: 0.5, unit: '', illo: 'onion' },
      { name: 'Roma tomato', qty: 1, unit: '', illo: 'tomato' },
      { name: 'Cheddar cheese', qty: 2, unit: 'oz', illo: 'cheese' },
      { name: 'Lime', qty: 1, unit: '', illo: 'lime' },
      { name: 'Chili powder', qty: 1, unit: 'tsp', illo: 'chili', spice: true },
    ],
    steps: (q: ScaleFn, spice: Spice): Step[] => [
      {
        title: 'Cook the cilantro-lime rice.',
        body: `Cook ${q('Jasmine rice')} rice, then fluff with a squeeze of ${q('Lime')} lime and chopped cilantro.`,
        timer: 12,
        cue: 'Rice is fluffy and separate, fragrant with lime and herbs.',
      },
      {
        title: 'Char the peppers and onion.',
        body: `Sear ${q('Bell pepper')} pepper and ${q('Yellow onion')} onion strips on high heat until they pick up dark, smoky edges.`,
        timer: 5,
        cue: 'Veg is blistered and charred in spots but still has some bite.',
      },
      {
        title: 'Warm the spiced beans.',
        body: `Heat ${q('Black beans')} beans with ${q('Chili powder')} chili powder and salt until thick — ${heatLine[spice]}.`,
        timer: 4,
        cue: 'Beans are saucy and well-seasoned, not watery.',
      },
      {
        title: 'Make a quick salsa.',
        body: `Dice ${q('Roma tomato')} tomato with a little onion, lime, and salt for a fresh topping.`,
        tip: 'A spoon of fresh salsa keeps the bowl bright against the smoky beans.',
        cue: 'Salsa is fresh, juicy, and sharp with lime.',
      },
      {
        title: 'Build the bowl.',
        body: `Layer rice, beans, charred veg, salsa, and ${q('Cheddar cheese')} cheese. Add a final lime squeeze.`,
        cue: 'Each layer visible and generous. Squeeze lime over and dig in.',
      },
    ],
  },
} satisfies Record<string, RecipeDef>;

// Map an ingredient display name → illustration key (used for recipes
// without a full def, falling back from recipe.uses).
const illoMap: Record<string, string> = {
  'Cooked Rice': 'rice',
  Eggs: 'egg',
  'Bell Peppers': 'pepper',
  Carrots: 'carrot',
  Garlic: 'garlic',
  'Schezwan Sauce': 'chili',
  Spaghetti: 'pasta',
  Spinach: 'spinach',
  Chickpeas: 'beans',
  'Jasmine Rice': 'ricebag',
  Onions: 'onion',
  'Olive Oil': 'oil',
  'Chicken Breast': 'chicken',
  'Greek Yogurt': 'yogurt',
  Sriracha: 'chili',
  Bananas: 'banana',
  'Whole Milk': 'milk',
  'Rolled Oats': 'oats',
  'Frozen Berries': 'berries',
  'Cheddar Cheese': 'cheese',
  'Wheat Bread': 'bread',
  'Firm Tofu': 'tofu',
  'Soy Sauce': 'soy',
  'Black Beans': 'beans',
  'Roma Tomatoes': 'tomato',
};

export function ingrIllo(name: string): string {
  return illoMap[name] ?? 'egg';
}
