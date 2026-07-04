// items.js

const conditions = {
  // Weapons & Armor
  'Excellent': {
    applicableTo: ['weapon', 'armor'],
    effects: { rollBonus: +3 }
  },
  'Good': {
    applicableTo: ['weapon', 'armor'],
    effects: { rollBonus: +1 }
  },
  'Fair': {
    applicableTo: ['weapon', 'armor'],
    effects: { rollBonus: 0 }
  },
  'Worn': {
    applicableTo: ['weapon', 'armor'],
    effects: { rollBonus: -1 }
  },
  'Damaged': {
    applicableTo: ['weapon', 'armor'],
    effects: { rollBonus: -2 }
  },
  'Cracked': {
    applicableTo: ['weapon', 'armor'],
    effects: { rollBonus: -3 }
  },
  'Broken': {
    applicableTo: ['weapon', 'armor'],
    effects: { unusable: true }
  },
  'Rusty': {
    applicableTo: ['weapon'],
    effects: { rollBonus: -3 }
  },
  'Chipped': {
    applicableTo: ['weapon'],
    effects: { rollBonus: -3 }
  },
  'Enchanted': {
    applicableTo: ['weapon', 'armor'],
    effects: { rollBonus: -3 }
  },

  // Food
  'Fresh': {
    applicableTo: ['food'],
    effects: { staminaGain: +5 }
  },
  'Ripe': {
    applicableTo: ['food'],
    effects: { staminaGain: +3 }
  },
  'Overripe': {
    applicableTo: ['food'],
    effects: { staminaGain: +1 }
  },
  'Spoiled': {
    applicableTo: ['food'],
    effects: { staminaGain: -2, chanceOfPoison: 0.2 }
  },
  'Moldy': {
    applicableTo: ['food'],
    effects: { staminaGain: -2, chanceOfPoison: 0.3 }
  },
  'Cooked': {
    applicableTo: ['cooked food'],
    effects: { staminaGain: -5, chanceOfPoison: 0.5 }
  },
  'Overcooked': {
    applicableTo: ['cooked food'],
    effects: { staminaGain: -5, chanceOfPoison: 0.5 }
  },
  'Undercooked': {
    applicableTo: ['cooked food'],
    effects: { staminaGain: -5, chanceOfPoison: 0.5 }
  },
  'Burnt': {
    applicableTo: ['cooked food'],
    effects: { staminaGain: -5, chanceOfPoison: 0.5 }
  }
};

const itemRarity = {
  common:     { label: 'Common',     color: '#AAAAAA', modifier: 0 },
  uncommon:   { label: 'Uncommon',   color: '#1E90FF', modifier: +1 },
  rare:       { label: 'Rare',       color: '#9932CC', modifier: +2 },
  epic:       { label: 'Epic',       color: '#FFD700', modifier: +3 },
  legendary:  { label: 'Legendary',  color: '#FF4500', modifier: +5 },
};

const _I = {
  armor:      f => `images/icons/poneti/armor/${f}`,
  weapon:     f => `images/icons/poneti/weapons/${f}`,
  food:       f => `images/icons/poneti/food/${f}`,
  potion:     f => `images/icons/poneti/potions/${f}`,
  tool:       f => `images/icons/poneti/tools/${f}`,
  ingredient: f => `images/icons/poneti/ingredients/${f}`,
  material:   f => `images/icons/poneti/materials/${f}`,
  misc:       f => `images/icons/poneti/misc/${f}`,
  container:  f => `images/icons/poneti/containers/${f}`,
  icon:       f => `images/icons/${f}`,
};

const Items = {
  Food: {
    "Apple": {
      description: "A crisp red apple.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 10 },
      weight: 0.5, value: 1,
      icon: _I.food("apple.png")
    },
    "Cooked Meat": {
      description: "A hearty slab of cooked meat.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 20 },
      weight: 1.0, value: 1,
      icon: _I.food("cooked_meat.png")
    },
    "Wild Berries": {
      description: "A handful of tart forest berries.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 },
      weight: 0.2, value: 1,
      icon: _I.food("berry.png")
    },
    "Edible Mushrooms": {
      description: "Safe mushrooms, cleaned and ready to cook.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 8 },
      weight: 0.3, value: 2,
      icon: _I.ingredient("mushroom.png")
    },
    "Nuts": {
      description: "Protein-rich wild nuts.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 6 },
      weight: 0.2, value: 2,
      icon: _I.ingredient("nuts.png")
    },
    "Rations": {
      description: "Dried bread and salted provisions — not exciting, but reliably filling.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 15 },
      weight: 0.5, value: 3,
      icon: _I.food("bread.png")
    },
    "Raw Bear Meat": {
      description: "A heavy slab of raw bear meat — must be cooked before eating.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 0 },
      weight: 2.0, value: 6,
      icon: _I.food("raw_meat.png")
    },
    "Raw Venison": {
      description: "Fresh venison cut from a hunt — best cooked over a fire.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 },
      weight: 1.5, value: 5,
      icon: _I.food("raw_meat.png")
    },
    "Raw Rabbit Meat": {
      description: "Small cuts of rabbit — lean and quick to cook.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 },
      weight: 0.6, value: 3,
      icon: _I.food("raw_meat.png")
    },
    "Raw Boar Meat": {
      description: "Coarse boar meat, still warm from the hunt.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 },
      weight: 1.8, value: 5,
      icon: _I.food("raw_meat.png")
    },
    "Raw Wolf Meat": {
      description: "Tough wolf meat — edible when well cooked, but nobody's first choice.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 },
      weight: 1.2, value: 3,
      icon: _I.food("raw_meat.png")
    },
    "Banana": {
      description: "A ripe yellow banana — sweet, filling, and easy to carry.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 8 },
      weight: 0.3, value: 2,
      icon: _I.food("banana.png")
    },
    "Quest Ale": {
      description: "A dark amber ale served at taverns across Estranta — commemorating some long-forgotten adventurer's deed.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 10 },
      weight: 0.7, value: 4,
      icon: _I.food("beer_quest.png")
    },
    "Ale": {
      description: "A foamy mug of common ale — warm the belly and ease the road-weary mind.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 8 },
      weight: 0.6, value: 3,
      icon: _I.food("beer.png")
    },
    "Dark Berry": {
      description: "A cluster of dark, intensely flavoured berries — slightly astringent but very nutritious.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 6 },
      weight: 0.2, value: 2,
      icon: _I.food("berry_2.png")
    },
    "Broccoli": {
      description: "A fresh head of broccoli — prized by camp cooks for its ability to travel well without spoiling quickly.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 7 },
      weight: 0.4, value: 2,
      icon: _I.food("broccoli.png")
    },
    "Cabbage Head": {
      description: "A large, dense head of cabbage — cheap, filling, and keeps for weeks.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 9 },
      weight: 0.8, value: 1,
      icon: _I.food("cabbage_extra.png")
    },
    "Cabbage": {
      description: "A small round cabbage — a staple vegetable of commoners and soldiers alike.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 7 },
      weight: 0.5, value: 1,
      icon: _I.food("cabbage.png")
    },
    "Roasted Carrot": {
      description: "A carrot charred and softened over campfire coals — sweet and warming.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 10 },
      weight: 0.3, value: 2,
      icon: _I.food("carrot_cooked.png")
    },
    "Carrot": {
      description: "A fresh orange carrot — crunchy and nutritious, eaten raw or added to stew.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 7 },
      weight: 0.2, value: 1,
      icon: _I.food("carrot.png")
    },
    "Wedge of Cheese": {
      description: "A dense wedge of aged cheese — rich and satisfying, a traveller's favourite.",
      type: "food", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 12 },
      weight: 0.4, value: 4,
      icon: _I.food("cheese_loot.png")
    },
    "Cheese Round": {
      description: "A whole wheel of cheese wrapped in cloth — enough to share around the campfire.",
      type: "food", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 18 },
      weight: 1.0, value: 8,
      icon: _I.food("cheese.png")
    },
    "Glazed Cherries": {
      description: "Cherries cooked with honey until sticky and sweet — a small luxury on the road.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 9 },
      weight: 0.2, value: 5,
      icon: _I.food("cherry_cooked.png")
    },
    "Cherries": {
      description: "A handful of ripe cherries — tart, sweet, and bursting with juice.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 6 },
      weight: 0.2, value: 3,
      icon: _I.food("cherry.png")
    },
    "Roasted Chicken": {
      description: "A whole chicken roasted over an open flame — golden skin, tender meat, and the smell of home.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 25, life: 5 },
      weight: 1.2, value: 10,
      icon: _I.food("cooked_chicken.png")
    },
    "Corn Cob": {
      description: "A fresh ear of corn — filling and easy to cook directly in campfire embers.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 8 },
      weight: 0.3, value: 1,
      icon: _I.food("corn.png")
    },
    "Boiled Crab": {
      description: "A sea crab boiled in salt water — delicious coastal fare with sweet, flaky meat.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 14 },
      weight: 0.6, value: 7,
      icon: _I.food("crab.png")
    },
    "Dried Fish": {
      description: "Fish salted and sun-dried for preservation — not much to look at, but keeps for weeks and has a pleasant brine.",
      type: "food", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 12 },
      weight: 0.4, value: 4,
      icon: _I.food("fish_dried.png")
    },
    "Fresh Fish": {
      description: "A whole fresh fish, still glistening from the water — must be cooked soon.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 },
      weight: 0.8, value: 5,
      icon: _I.food("fish_loot.png")
    },
    "Fried Red Fish": {
      description: "A red-fleshed river fish fried crispy in a pan — a popular meal in riverside settlements.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 16 },
      weight: 0.5, value: 6,
      icon: _I.food("fish_red_fried.png")
    },
    "Red Fish": {
      description: "A bright red-scaled freshwater fish — prized by anglers for its firm, rich flesh.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 },
      weight: 0.7, value: 6,
      icon: _I.food("fish_red.png")
    },
    "Smoked Fish": {
      description: "A fillet of fish smoked over hardwood chips — deep flavour and keeps well without salt.",
      type: "food", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 14 },
      weight: 0.4, value: 5,
      icon: _I.food("fish_smoked.png")
    },
    "Gooseberry": {
      description: "Small tart berries from a thorny bush — tangy and refreshing, often used in preserves.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 },
      weight: 0.2, value: 2,
      icon: _I.food("gooseberry.png")
    },
    "Blue Grapes": {
      description: "A cluster of deep blue grapes — sweet with a slight astringency, good for wine-making.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 8 },
      weight: 0.4, value: 3,
      icon: _I.food("grapes_blue.png")
    },
    "Green Grapes": {
      description: "A bunch of crisp green grapes — tart and thirst-quenching.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 7 },
      weight: 0.4, value: 3,
      icon: _I.food("grapes_green.png")
    },
    "Red Grapes": {
      description: "A cluster of plump red grapes — sweet and rich, used in the finest vintages.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 8 },
      weight: 0.4, value: 4,
      icon: _I.food("grapes_red.png")
    },
    "Mango": {
      description: "A large tropical mango — rare in northern kingdoms, but worth every coin for its sweetness.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 11 },
      weight: 0.4, value: 5,
      icon: _I.food("mango.png")
    },
    "Milk": {
      description: "A clay bottle of fresh cow's milk — wholesome and nourishing, best consumed before nightfall.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 9, life: 3 },
      weight: 0.6, value: 3,
      icon: _I.food("milk.png")
    },
    "Onion": {
      description: "A pungent yellow onion — the backbone of countless camp stews and soups.",
      type: "food", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 },
      weight: 0.2, value: 1,
      icon: _I.food("onion.png")
    },
    "Green Pepper": {
      description: "A crisp green bell pepper — adds crunch and a mildly bitter flavour to cooked meals.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 },
      weight: 0.2, value: 2,
      icon: _I.food("pepper_green.png")
    },
    "Red Pepper": {
      description: "A sweet red pepper — mellower than the green, delicious roasted over open coals.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 6 },
      weight: 0.2, value: 2,
      icon: _I.food("pepper_red.png")
    },
    "Raw Fish": {
      description: "A fresh-caught fish, ungutted. Needs to be prepared and cooked before eating.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 },
      weight: 0.6, value: 4,
      icon: _I.food("raw_fish.png")
    },
    "Raw Trout": {
      description: "A freshly caught trout — speckled and firm-fleshed. Best cooked over a fire.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 }, weight: 0.6, value: 4,
      icon: _I.food("raw_fish.png")
    },
    "Raw Perch": {
      description: "A striped river perch, caught fresh. Needs cooking before eating.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 }, weight: 0.5, value: 3,
      icon: _I.food("raw_fish.png")
    },
    "Raw Carp": {
      description: "A heavy-bodied carp, common in lakes and slow rivers. Tasty when cooked properly.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 }, weight: 0.8, value: 4,
      icon: _I.food("raw_fish.png")
    },
    "Raw Pike": {
      description: "A long, sharp-toothed pike from deep river pools. Excellent eating once cooked.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 0 }, weight: 0.9, value: 6,
      icon: _I.food("fish_loot.png")
    },
    "Raw Bass": {
      description: "A firm-fleshed bass caught from still waters. A satisfying catch — needs cooking.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 }, weight: 0.7, value: 5,
      icon: _I.food("fish_red.png")
    },
    "Raw Catfish": {
      description: "A whiskered catfish from muddy river bottoms. Rich and oily — good smoked.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 }, weight: 1.0, value: 4,
      icon: _I.food("fish_loot.png")
    },
    "Raw Mackerel": {
      description: "A sleek coastal mackerel, richly flavoured. Goes off quickly — cook it fast.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 }, weight: 0.5, value: 4,
      icon: _I.food("raw_fish.png")
    },
    "Raw Herring": {
      description: "A slender silver herring from coastal shallows. Usually salted or smoked.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 0 }, weight: 0.4, value: 3,
      icon: _I.food("raw_fish.png")
    },
    "Raw Eel": {
      description: "A long wriggling eel. Unusual but nutritious — a delicacy when properly prepared.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 0 }, weight: 0.6, value: 6,
      icon: _I.food("fish_loot.png")
    },
    "Raw Tuna": {
      description: "A powerful ocean tuna. Heavy and rich — one fish makes several good meals.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 0 }, weight: 1.5, value: 8,
      icon: _I.food("fish_red.png")
    },
    "Roasted Meat": {
      description: "A joint of meat roasted on a spit until crispy outside and tender within.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 22 },
      weight: 1.0, value: 8,
      icon: _I.food("roasted_meat.png")
    },
    "Salmon": {
      description: "A whole fresh salmon, pink-fleshed and prized by riverside communities.",
      type: "food", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 0 },
      weight: 1.5, value: 9,
      icon: _I.food("salmon.png")
    },
    "Sausage": {
      description: "A cured pork sausage hanging in loops — a common trail food that keeps well and fries up quickly.",
      type: "food", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 13 },
      weight: 0.5, value: 4,
      icon: _I.food("sausage.png")
    },
    "Strawberry": {
      description: "A ripe red strawberry — tiny, sweet, and a welcome sight after days of hard tack and dried meat.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 },
      weight: 0.1, value: 2,
      icon: _I.food("strawberry.png")
    },
    "Raw Tomato": {
      description: "A firm, unripe tomato — slightly bitter eaten raw, better cooked in sauce.",
      type: "food", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 4 },
      weight: 0.2, value: 1,
      icon: _I.food("tomato_raw.png")
    },
    "Tomato": {
      description: "A ripe, bursting tomato — eaten fresh, it's one of summer's best pleasures.",
      type: "food", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 6 },
      weight: 0.2, value: 2,
      icon: _I.food("tomato.png")
    },
    "Turnip": {
      description: "A knobbly root vegetable — cheap, nutritious, and surprisingly filling when roasted.",
      type: "food", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 7 },
      weight: 0.3, value: 1,
      icon: _I.food("turnip.png")
    },
    "Wine": {
      description: "A bottle of red table wine — a common pleasure from the vineyards of southern Estranta.",
      type: "food", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 10 },
      weight: 0.8, value: 8,
      icon: _I.food("wine.png")
    }
  },

  Weapons: {
    "Iron Sword": {
      description: "A sturdy iron sword, slightly worn.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 15 },
      weight: 5.0, value: 20,
      icon: _I.weapon("common/all/sword_01.png")
    },
    "Dagger": {
      description: "A small dagger, its blade rusted and pitted.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Rusty", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 8 },
      weight: 2.0, value: 12,
      icon: _I.weapon("common/all/dagger_06.png")
    },
    "Shortbow": {
      description: "A compact bow — quick to draw and easy to carry.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 10, rarity: "Common",
      baseEffect: { damage: 5 },
      weight: 0.9, value: 12,
      icon: _I.weapon("common/all/bow_02.png")
    },
    "Carved Shortbow": {
      description: "A neatly carved shortbow, smooth-handled and well-balanced.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 10, rarity: "Common",
      baseEffect: { damage: 6 },
      weight: 0.9, value: 13,
      icon: _I.weapon("common/all/shortbow.png")
    },
    "Hunting Bow": {
      description: "A bow crafted for hunting.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 10, rarity: "Common",
      baseEffect: { damage: 5 },
      weight: 1.0, value: 10,
      icon: _I.weapon("common/all/hunting_bow.png")
    },
    "Bow": {
      description: "A simple bow.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 10, rarity: "Common",
      baseEffect: { damage: 6 },
      weight: 1.0, value: 10,
      icon: _I.weapon("common/all/bow.png")
    },
    "Arrow": {
      description: "Arrows for your bow.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 5, rarity: "Common",
      baseEffect: { damage: 0 },
      weight: 0.5, value: 2,
      icon: _I.weapon("common/all/arrows.png")
    },
    "Bow and Arrows": {
      description: "A reliable bow bundled with a quiver of arrows — ready to use for hunting or combat.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 10, rarity: "Common",
      baseEffect: { damage: 7 },
      weight: 1.5, value: 14,
      icon: _I.icon("bow-arrows.png")
    },
    "Broadtip Arrows": {
      description: "Wide-bladed hunting arrows designed to bring down large game cleanly.",
      type: "ammo", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 3 },
      weight: 0.6, value: 5,
      icon: _I.icon("broadtip_arrows.png")
    },
    "Hunting Knife": {
      description: "A short, stout blade made for field dressing game. Doubles as a sidearm in a pinch.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 6 },
      weight: 1.0, value: 8,
      icon: _I.weapon("common/all/dagger_22.png")
    },
    "Belt Knife": {
      description: "A small utility knife worn at the belt — handy for cutting rope, preparing food, or self-defense.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 4 },
      weight: 0.5, value: 5,
      icon: _I.weapon("common/all/dagger_07.png")
    },
    "Bolts": {
      description: "A quiver of crossbow bolts, steel-tipped and ready to load.",
      type: "ammo", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 4 }, weight: 0.8, value: 4,
      icon: _I.weapon("common/all/bolts.png")
    },
    "Longbow": {
      description: "A tall war bow carved from yew — requires strength to draw but delivers devastating power.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 12 }, weight: 1.8, value: 28,
      icon: _I.weapon("common/all/longbow.png")
    },
    "Recurve Bow": {
      description: "A reflex-limbed bow that stores more energy per draw — faster and more powerful than a simple self bow.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 10 }, weight: 1.3, value: 22,
      icon: _I.weapon("common/all/recurve_bow.png")
    },
    "Short Bow": {
      description: "A short, nimble hunting bow favoured in dense forest — quick to draw and easy to carry.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 7 }, weight: 1.0, value: 14,
      icon: _I.weapon("common/all/bow_02.png")
    },
    "Forest Bow": {
      description: "A curved bow built for woodland hunting — short enough to use from a crouch.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 8 }, weight: 1.1, value: 16,
      icon: _I.weapon("common/all/bow_04.png")
    },
    "Composite Bow": {
      description: "A laminated bow of horn and sinew — compact yet powerful, a cavalry archer's weapon of choice.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 13 }, weight: 1.4, value: 38,
      icon: _I.weapon("common/all/bow_06.png")
    },
    "Elven Bow": {
      description: "A gracefully curved bow of elven craft — lightweight and accurate over long distances.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 14 }, weight: 1.0, value: 45,
      icon: _I.weapon("common/all/bow_07.png")
    },
    "War Bow": {
      description: "A heavy military bow requiring great strength — capable of punching through light armour.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 11 }, weight: 2.0, value: 25,
      icon: _I.weapon("common/all/bow_3.png")
    },
    "Traveller's Bow": {
      description: "A simple but reliable bow for everyday use — the journeyman's standard range weapon.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 8 }, weight: 1.2, value: 15,
      icon: _I.weapon("common/all/bow_4.png")
    },
    "Ranger's Bow": {
      description: "A finely balanced bow used by wilderness rangers — weighted for accuracy over distance.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 10 }, weight: 1.3, value: 20,
      icon: _I.weapon("common/all/bow_5.png")
    },
    "Stout Bow": {
      description: "A wide-limbed bow built for durability over elegance — handles rough conditions well.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 9 }, weight: 1.4, value: 16,
      icon: _I.weapon("common/all/bow_v2_01.png")
    },
    "Hunter's Recurve": {
      description: "A recurve bow designed specifically for hunting — quiet release and good knock speed.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 11 }, weight: 1.3, value: 22,
      icon: _I.weapon("common/all/bow_v2_03.png")
    },
    "Carved Bow": {
      description: "A bow with decorative carved limbs — as much a work of art as a weapon, but still fully functional.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 10 }, weight: 1.2, value: 24,
      icon: _I.weapon("common/all/bow_v2_04.png")
    },
    "Iron Chain": {
      description: "A length of heavy iron chain — can be used as a flail-like weapon or for restraint.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 9 }, weight: 4.0, value: 10,
      icon: _I.weapon("common/all/chain_2.png")
    },
    "Spiked Chain": {
      description: "A chain with barbed links — painful to grab and brutal to be struck by.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 12 }, weight: 4.5, value: 18,
      icon: _I.weapon("common/all/chain_4.png")
    },
    "Wooden Club": {
      description: "A heavy length of hardwood — the most primitive of weapons, but effective in desperate hands.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 20, rarity: "Common",
      baseEffect: { damage: 7 }, weight: 3.0, value: 4,
      icon: _I.weapon("common/all/club.png")
    },
    "Studded Club": {
      description: "A wooden club embedded with iron studs — deals more damage than a plain club.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 10 }, weight: 3.5, value: 9,
      icon: _I.weapon("common/all/club_3.png")
    },
    "Bone Club": {
      description: "A club fashioned from a large animal bone — primitive and brutal.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 8 }, weight: 2.5, value: 5,
      icon: _I.weapon("common/all/club_4.png")
    },
    "Iron Mace": {
      description: "A flanged iron mace — excellent against armoured foes, delivers bone-crushing blunt trauma.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 13 }, weight: 4.5, value: 18,
      icon: _I.weapon("common/all/club_v2_12.png")
    },
    "Spiked Mace": {
      description: "A mace with a heavily spiked head — deals piercing damage in addition to its blunt impact.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 5.0, value: 22,
      icon: _I.weapon("common/all/spiked_mace.png")
    },
    "War Club": {
      description: "A large reinforced club used by warriors — heavier than a standard club, built to break shields.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 14 }, weight: 5.0, value: 16,
      icon: _I.weapon("common/all/club_v2_15.png")
    },
    "Bludgeon": {
      description: "A thick-headed iron bludgeon — brutally simple and effective.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 11 }, weight: 4.0, value: 12,
      icon: _I.weapon("common/all/club_v2_16.png")
    },
    "Stone Mace": {
      description: "A stone-headed mace on a wrapped handle — crude but heavy, inflicts serious blunt damage.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 10 }, weight: 4.5, value: 7,
      icon: _I.weapon("common/all/club_v2_17.png")
    },
    "Goblin Club": {
      description: "A misshapen club looted from a goblin — crude and unbalanced, but a decent weapon in a pinch.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 10, rarity: "Common",
      baseEffect: { damage: 7 }, weight: 2.5, value: 3,
      icon: _I.weapon("common/all/club_v2_18.png")
    },
    "Light Crossbow": {
      description: "A simple lever-drawn crossbow — easy to use and accurate at short range.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 10 }, weight: 3.5, value: 22,
      icon: _I.weapon("common/all/crossbow_01.png")
    },
    "Heavy Crossbow": {
      description: "A powerful windlass-drawn crossbow capable of piercing heavy armour.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 18 }, weight: 6.0, value: 40,
      icon: _I.weapon("common/all/crossbow_02.png")
    },
    "Siege Crossbow": {
      description: "A massive crossbow designed for military use — cumbersome but devastating against fortifications.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 22 }, weight: 9.0, value: 65,
      icon: _I.weapon("common/all/crossbow_03.png")
    },
    "Elven Crossbow": {
      description: "A lightweight crossbow of elven design — compact, silent, and deceptively powerful.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 16 }, weight: 3.0, value: 55,
      icon: _I.weapon("common/all/crossbow_04.png")
    },
    "Dwarven Crossbow": {
      description: "A squat, over-engineered dwarven crossbow with a repeating magazine mechanism.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 14 }, weight: 5.0, value: 50,
      icon: _I.weapon("common/all/crossbow_05.png")
    },
    "Crossbow": {
      description: "A standard mechanical crossbow — point-and-shoot simplicity for those without archery training.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 12 }, weight: 4.0, value: 28,
      icon: _I.weapon("common/all/crossbow_1.png")
    },
    "Fine Dagger": {
      description: "A slender double-edged dagger with a bone handle — precise and well-balanced.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 10 }, weight: 1.5, value: 16,
      icon: _I.weapon("common/all/dagger_20.png")
    },
    "Assassin's Dagger": {
      description: "A narrow-bladed dagger built for precision killing — quiet, fast, and utterly deadly in the right hands.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 14 }, weight: 1.2, value: 40,
      icon: _I.weapon("common/all/assassins_dagger.png")
    },
    "Shadow Dagger": {
      description: "A dark-bladed dagger coated in a non-reflective finish — favoured by those who work in the dark.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 11 }, weight: 1.3, value: 22,
      icon: _I.weapon("common/all/dagger_21.png")
    },
    "Curved Dagger": {
      description: "A wide-curved blade with a single cutting edge — designed for hooking past shields.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 10 }, weight: 1.4, value: 18,
      icon: _I.weapon("common/all/dagger_26.png")
    },
    "Long Dagger": {
      description: "A dagger with an unusually long blade — occupies the ground between a knife and a short sword.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 12 }, weight: 2.0, value: 20,
      icon: _I.weapon("common/all/dagger_38.png")
    },
    "Old Dagger": {
      description: "A dagger worn with age, its edge notched — still capable of drawing blood.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 7 }, weight: 1.0, value: 6,
      icon: _I.weapon("common/all/dagger_old.png")
    },
    "Flail": {
      description: "A weighted ball on a chain — swings around shields and hits hard.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 16 }, weight: 5.0, value: 24,
      icon: _I.weapon("common/all/flail.png")
    },
    "Great Axe": {
      description: "A massive two-handed axe — slow, but each swing can cleave through armour and flesh alike.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 22 }, weight: 8.0, value: 35,
      icon: _I.weapon("common/all/great_axe.png")
    },
    "Halberd": {
      description: "A pole weapon combining an axe blade, spear tip, and hook — the elite infantry's polearm of choice.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 20 }, weight: 7.0, value: 32,
      icon: _I.weapon("common/all/halberd.png")
    },
    "War Hammer": {
      description: "A heavy iron war hammer — destroys armour and shatters bones with terrifying efficiency.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 18 }, weight: 6.5, value: 28,
      icon: _I.weapon("common/all/hammer_05.png")
    },
    "Maul": {
      description: "A two-handed maul with a massive iron head — built for breaking siege equipment and skulls.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 20 }, weight: 8.0, value: 30,
      icon: _I.weapon("common/all/hammer_06.png")
    },
    "Smith's Hammer": {
      description: "A heavy forging hammer pressed into service as a weapon — effective but unbalanced in combat.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 13 }, weight: 4.0, value: 12,
      icon: _I.weapon("common/all/hammer_07.png")
    },
    "Iron Sledge": {
      description: "A broad-headed sledgehammer — deals enormous damage but is painfully slow to swing.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 17 }, weight: 7.0, value: 22,
      icon: _I.weapon("common/all/hammer_08.png")
    },
    "Wooden Mallet": {
      description: "A simple wooden mallet — not a true weapon, but desperate times call for desperate measures.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 20, rarity: "Common",
      baseEffect: { damage: 6 }, weight: 2.0, value: 3,
      icon: _I.weapon("common/all/hammer_wooden.png")
    },
    "Mace": {
      description: "A classic iron-headed mace — reliable, heavy, and brutally effective against armoured opponents.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 14 }, weight: 4.5, value: 20,
      icon: _I.weapon("common/all/mace.png")
    },
    "Poleaxe": {
      description: "A long-hafted axe designed for formation fighting — can thrust, hook, and cleave.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 19 }, weight: 7.0, value: 30,
      icon: _I.weapon("common/all/poleaxe.png")
    },
    "Empty Quiver": {
      description: "A leather arrow quiver with no arrows inside — needs to be stocked before use.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 4,
      icon: _I.weapon("common/all/quiver_empty.png")
    },
    "Quiver of Arrows": {
      description: "A full quiver of standard iron-tipped arrows, ready to be nocked.",
      type: "ammo", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 2 }, weight: 1.5, value: 10,
      icon: _I.weapon("common/all/quiver_with_arrows.png")
    },
    "Round Shield": {
      description: "A circular wooden shield reinforced with iron — basic but effective defence.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 }, weight: 4.0, value: 14,
      icon: _I.weapon("common/all/shield_01.png")
    },
    "Iron Kite Shield": {
      description: "A kite-shaped iron shield providing excellent coverage of the left side.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 9 }, weight: 6.0, value: 22,
      icon: _I.weapon("common/all/shield_02.png")
    },
    "Tower Shield": {
      description: "A massive rectangular shield that can be planted in the ground — more wall than weapon.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 12 }, weight: 9.0, value: 30,
      icon: _I.weapon("common/all/shield_03.png")
    },
    "Dwarven Shield": {
      description: "A compact iron shield made to dwarven proportions — dense and nearly impenetrable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 10 }, weight: 7.0, value: 26,
      icon: _I.weapon("common/all/shield_04.png")
    },
    "Guard Shield": {
      description: "A standard-issue guard shield, scratched from years of service at the gate.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 7 }, weight: 5.0, value: 15,
      icon: _I.weapon("common/all/shield_05.png")
    },
    "Heater Shield": {
      description: "A triangular heater shield — the knight's companion, light enough for mounted combat.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 }, weight: 5.5, value: 20,
      icon: _I.weapon("common/all/shield_09.png")
    },
    "Pavise Shield": {
      description: "A large archer's shield with a central ridge — provides cover while archers reload.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 11 }, weight: 8.0, value: 28,
      icon: _I.weapon("common/all/shield_10.png")
    },
    "Studded Shield": {
      description: "A wooden shield covered in iron studs — provides good defence and can deal glancing damage.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 8 }, weight: 5.5, value: 17,
      icon: _I.weapon("common/all/shield_11.png")
    },
    "Reinforced Shield": {
      description: "A wooden shield with a heavy iron boss and banding — well-maintained and reliable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 10 }, weight: 6.5, value: 24,
      icon: _I.weapon("common/all/shield_12.png")
    },
    "Carved Shield": {
      description: "A shield decorated with carved heraldic patterns — as much status symbol as protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 9 }, weight: 5.0, value: 22,
      icon: _I.weapon("common/all/shield_34.png")
    },
    "Black Iron Shield": {
      description: "A shield of dark iron — heavier than standard but nearly impervious to normal weapons.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 14 }, weight: 8.5, value: 40,
      icon: _I.weapon("common/all/shield_black.png")
    },
    "Blue Painted Shield": {
      description: "A shield painted deep blue with a silver trim — identifies the bearer as a city guard or soldier.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 7 }, weight: 4.5, value: 14,
      icon: _I.weapon("common/all/shield_blue.png")
    },
    "Buckler": {
      description: "A tiny fist shield worn on the forearm — used for parrying rather than blocking.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 }, weight: 1.5, value: 8,
      icon: _I.weapon("common/all/shield_buckler.png")
    },
    "Ornate Shield": {
      description: "A beautifully crafted shield with raised metalwork — a noble's battle accessory.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 12 }, weight: 6.0, value: 48,
      icon: _I.weapon("common/all/shield_v2_28.png")
    },
    "Silver Shield": {
      description: "A silver-plated ceremonial shield — beautiful and surprisingly effective.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 11 }, weight: 6.5, value: 55,
      icon: _I.weapon("common/all/shield_v2_29.png")
    },
    "Elven Shield": {
      description: "A lightweight elven shield of woven ironwood and silver — strong as steel at half the weight.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { defense: 13 }, weight: 3.0, value: 80,
      icon: _I.weapon("common/all/shield_v2_30.png")
    },
    "Black-Yellow Wooden Shield": {
      description: "A round wooden shield painted black and yellow — a fighter's colours from the eastern provinces.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 }, weight: 3.5, value: 10,
      icon: _I.weapon("common/all/shield_wood_black_yellow.png")
    },
    "Blue-White Wooden Shield": {
      description: "A round wooden shield in blue and white — a common militia pattern.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 }, weight: 3.5, value: 10,
      icon: _I.weapon("common/all/shield_wood_blue_white.png")
    },
    "Blue-Yellow Wooden Shield": {
      description: "A round wooden shield painted blue and yellow — used by river town guards.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 }, weight: 3.5, value: 10,
      icon: _I.weapon("common/all/shield_wood_blue_yellow.png")
    },
    "Green Wooden Shield": {
      description: "A round wooden shield stained forest green — used by rangers and woodland guards.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 }, weight: 3.5, value: 10,
      icon: _I.weapon("common/all/shield_wood_green.png")
    },
    "Red Wooden Shield": {
      description: "A round wooden shield in red, the warrior's colour — intimidating and sturdy.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 }, weight: 3.5, value: 10,
      icon: _I.weapon("common/all/shield_wood_red_2.png")
    },
    "Crimson Shield": {
      description: "A deep crimson-lacquered shield — striking in appearance and well-constructed.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 }, weight: 4.0, value: 16,
      icon: _I.weapon("common/all/shield_wood_red.png")
    },
    "Plain Wooden Shield": {
      description: "The most basic of shields — a flat disc of hardwood with a grip bolted to the back.",
      type: "armor", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 }, weight: 3.0, value: 6,
      icon: _I.weapon("common/all/shield_wood.png")
    },
    "Iron Spear": {
      description: "A long iron-tipped spear — the weapon of common soldiers and militia the world over.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 12 }, weight: 3.5, value: 14,
      icon: _I.weapon("common/all/spear_01.png")
    },
    "Hoplite Spear": {
      description: "A long thrusting spear with a broad leaf-shaped head — used in tight formation fighting.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 14 }, weight: 4.0, value: 18,
      icon: _I.weapon("common/all/spear_02.png")
    },
    "Light Javelin": {
      description: "A short throwing spear — designed to be hurled at enemies before closing to melee range.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 11 }, weight: 2.5, value: 10,
      icon: _I.weapon("common/all/spear_05.png")
    },
    "War Spear": {
      description: "A heavy military spear reinforced with cross-guards — prevents deep penetration and is difficult to disarm.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 16 }, weight: 5.0, value: 22,
      icon: _I.weapon("common/all/spear_06.png")
    },
    "Short Spear": {
      description: "A compact thrusting spear — easy to use in tight spaces and decent as a thrown weapon.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 10 }, weight: 2.5, value: 10,
      icon: _I.weapon("common/all/spear_1.png")
    },
    "Broad Spear": {
      description: "A spear with a wide cutting blade — splits shields and deals heavy slashing wounds.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 4.0, value: 19,
      icon: _I.weapon("common/all/spear_10.png")
    },
    "Elven Spear": {
      description: "A slender elven-crafted spear of exceptional balance — swift and precise.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 17 }, weight: 2.5, value: 40,
      icon: _I.weapon("common/all/spear_11.png")
    },
    "Hunting Spear": {
      description: "A spear built for the hunt — shorter than a war spear but with a notched crossbar to stop a charging boar.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 13 }, weight: 3.0, value: 12,
      icon: _I.weapon("common/all/spear_13.png")
    },
    "Bone Spear": {
      description: "A primitive spear with a sharpened bone tip — crude but surprisingly effective.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 9 }, weight: 2.0, value: 5,
      icon: _I.weapon("common/all/spear_14.png")
    },
    "Guard Spear": {
      description: "A standard-issue infantry spear found in every garrison — reliable, if unspectacular.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 11 }, weight: 3.5, value: 11,
      icon: _I.weapon("common/all/spear_2.png")
    },
    "Black Spear": {
      description: "An iron spear with a blackened shaft and dark-stained blade — a soldier's battle-hardened weapon.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 14 }, weight: 3.5, value: 18,
      icon: _I.weapon("common/all/spear_3.png")
    },
    "Barbed Spear": {
      description: "A spear with backward-facing barbs — cruel, effective, and very hard to remove once lodged.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 4.0, value: 20,
      icon: _I.weapon("common/all/spear_5.png")
    },
    "Dwarven Spear": {
      description: "A stout dwarven thrusting spear — shorter-handled but with a massive iron head.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 14 }, weight: 4.5, value: 22,
      icon: _I.weapon("common/all/spear_6.png")
    },
    "Trident": {
      description: "A three-pronged sea-spear — deadly in the hands of a skilled fighter, particularly near water.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 4.5, value: 24,
      icon: _I.weapon("common/all/spear_7.png")
    },
    "Ornate Spear": {
      description: "A ceremonial-looking spear with engraved patterns — fully functional despite its decorative appearance.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 13 }, weight: 3.0, value: 20,
      icon: _I.weapon("common/all/spear_v2_02.png")
    },
    "Silver Spear": {
      description: "A spear with a silver-inlaid shaft and tip — effective against certain supernatural creatures.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 16 }, weight: 3.5, value: 45,
      icon: _I.weapon("common/all/spear_v2_03.png")
    },
    "Dragon Spear": {
      description: "A heavy ceremonial spear said to have been used in a dragon hunt — its iron tip is darkened with age.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 20 }, weight: 5.5, value: 90,
      icon: _I.weapon("common/all/spear_v2_09.png")
    },
    "Broad Sword": {
      description: "A wide-bladed sword for powerful, wide-arc cuts — reliable and heavy.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 16 }, weight: 5.5, value: 22,
      icon: _I.weapon("common/all/sword_0.png")
    },
    "Steel Sword": {
      description: "A straight steel sword with a simple cross guard — an upgrade from iron, well-tempered.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 18 }, weight: 5.0, value: 30,
      icon: _I.weapon("common/all/sword_02.png")
    },
    "Knight's Sword": {
      description: "An elegant single-handed sword of knightly quality — well-balanced and finely crafted.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 17 }, weight: 4.5, value: 32,
      icon: _I.weapon("common/all/sword_03.png")
    },
    "Long Sword": {
      description: "A versatile hand-and-a-half sword — can be used one- or two-handed for range and power.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 19 }, weight: 5.5, value: 35,
      icon: _I.weapon("common/all/sword_04.png")
    },
    "War Sword": {
      description: "A heavy military sword built for battle, not duelling — wide, thick, and utterly dependable.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 20 }, weight: 6.0, value: 38,
      icon: _I.weapon("common/all/sword_05.png")
    },
    "Ceremonial Sword": {
      description: "A sword crafted for ceremony as much as combat — ornate guard and polished finish.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 4.5, value: 30,
      icon: _I.weapon("common/all/sword_06.png")
    },
    "Ancient Sword": {
      description: "An old sword of unknown origin — its style is unlike any modern smithing tradition.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 16 }, weight: 5.0, value: 40,
      icon: _I.weapon("common/all/sword_10.png")
    },
    "Adventurer's Sword": {
      description: "A well-worn sword that's seen many journeys — light enough for long marches, strong enough for battle.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 14 }, weight: 4.5, value: 18,
      icon: _I.weapon("common/all/sword_11.png")
    },
    "Executioner's Blade": {
      description: "A heavy cleaving sword used for executions — unsharpened along most of its length, but lethal at the tip.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 21 }, weight: 7.0, value: 45,
      icon: _I.weapon("common/all/sword_15.png")
    },
    "Elven Blade": {
      description: "A slender elven sword of folded star-metal — impossibly light and devastatingly sharp.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 22 }, weight: 3.0, value: 100,
      icon: _I.weapon("common/all/sword_17.png")
    },
    "Silver Sword": {
      description: "A sword with a silver-alloy blade — effective against supernatural creatures.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 18 }, weight: 5.0, value: 60,
      icon: _I.weapon("common/all/sword_18.png")
    },
    "Black Sword": {
      description: "A sword of black iron, notched and stained — clearly a weapon with a history.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 17 }, weight: 5.5, value: 25,
      icon: _I.weapon("common/all/sword_19.png")
    },
    "Jewelled Sword": {
      description: "A sword with gems set into the hilt — more valuable as treasure than as a practical weapon.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 16 }, weight: 4.5, value: 75,
      icon: _I.weapon("common/all/sword_22.png")
    },
    "Dwarven Short Sword": {
      description: "A compact, heavy-bladed sword of dwarven make — short but devastatingly powerful.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 17 }, weight: 4.0, value: 42,
      icon: _I.weapon("common/all/sword_29.png")
    },
    "Cutlass": {
      description: "A slightly curved slashing sword favoured by sailors and pirates — quick and versatile.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 14 }, weight: 4.0, value: 18,
      icon: _I.weapon("common/all/sword_3.png")
    },
    "Scimitar": {
      description: "A curved single-edged blade from the southern deserts — fast and lethal in skilled hands.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 16 }, weight: 4.0, value: 26,
      icon: _I.weapon("common/all/sword_5.png")
    },
    "Falchion": {
      description: "A single-edged sword that widens toward the tip — heavy-hitting and intimidating.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 15 }, weight: 5.0, value: 20,
      icon: _I.weapon("common/all/sword_7.png")
    },
    "Decorated Sword": {
      description: "A well-forged sword with detailed engravings on its blade — made to be admired as well as used.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 16 }, weight: 4.5, value: 30,
      icon: _I.weapon("common/all/sword_decorated.png")
    },
    "Old Sword": {
      description: "A sword from a previous generation, still serviceable but showing its age.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 13 }, weight: 5.0, value: 12,
      icon: _I.weapon("common/all/sword_old.png")
    },
    "Sabre": {
      description: "A light cavalry sword with a curved blade — swift to draw and deadly in a slashing attack.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 3.5, value: 24,
      icon: _I.weapon("common/all/sword_saber_5.png")
    },
    "Training Sword": {
      description: "A blunted wooden practice sword — not capable of killing, but good for drills.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 3 }, weight: 2.0, value: 4,
      icon: _I.weapon("common/all/sword_training_wood.png")
    },
    "Great Warhammer": {
      description: "A two-handed warhammer of brutal proportions — each blow shakes the ground.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 24 }, weight: 9.0, value: 50,
      icon: _I.weapon("common/all/warhammer_2.png")
    },
    "Warhammer": {
      description: "A sturdy single-handed warhammer with a flanged iron head — armour's worst nightmare.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 17 }, weight: 5.5, value: 28,
      icon: _I.weapon("common/all/warhammer.png")
    },
    "Battle Axe": {
      description: "A single-bitted battle axe for heavy combat — cleaves deep and disregards light armour.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 17 }, weight: 5.5, value: 24,
      icon: _I.weapon("common/all/axe_04.png")
    },
    "Veteran's Axe": {
      description: "A well-used axe passed down through generations of fighters — nicked but never broken.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 5.0, value: 18,
      icon: _I.weapon("common/all/axe_52.png")
    },
    "Notched Axe": {
      description: "An axe with a deliberately notched blade — catches and holds an enemy's weapon.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 14 }, weight: 4.5, value: 16,
      icon: _I.weapon("common/all/axe_53.png")
    },
    "Iron-Hard Axe": {
      description: "An axe forged from unusually hard iron — keeps its edge far longer than standard weapons.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 18 }, weight: 5.0, value: 35,
      icon: _I.weapon("common/all/axe_hard_2.png")
    },
    "Reinforced Axe": {
      description: "An axe with an extra iron band around the haft to prevent splitting — robust and dependable.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 16 }, weight: 5.5, value: 22,
      icon: _I.weapon("common/all/axe_hard.png")
    },
    "Old Axe": {
      description: "An ancient axe with a worn handle and a blunted edge — not ideal, but heavier things have happened.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 11 }, weight: 4.5, value: 8,
      icon: _I.weapon("common/all/axe_old.png")
    },
    "Throwing Axe": {
      description: "A well-balanced axe designed to be thrown end-over-end at enemies.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 13 }, weight: 2.0, value: 16,
      icon: _I.weapon("common/all/axe_v2_04.png")
    },
    "Broad Axe": {
      description: "A wide-headed cleaving axe for breaking lines and shields in heavy melee.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 18 }, weight: 6.5, value: 28,
      icon: _I.weapon("common/all/battleaxe.png")
    },

    // ── weapons/common/dwarf/ ──────────────────────────────────────────────
    "Clanforged Axe": {
      description: "A solid dwarven axe forged in the clan tradition — heavy, reliable, and built to last generations.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 14 }, weight: 4.0, value: 20,
      icon: _I.weapon("common/dwarf/axe_03.png")
    },
    "Deep-Cut Axe": {
      description: "An axe with a wide, deeply bevelled blade designed to bite through stone as easily as bone.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 4.5, value: 22,
      icon: _I.weapon("common/dwarf/axe_15.png")
    },
    "Dwarven Hewing Axe": {
      description: "A hewing axe shaped for the mines and the battlefield alike — a versatile dwarven tool-weapon.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 16 }, weight: 5.0, value: 24,
      icon: _I.weapon("common/dwarf/axe_v2_05.png")
    },
    "Runed Dwarven Axe": {
      description: "An axe etched with clan runes that harden the iron edge and guide the strike.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 17 }, weight: 5.5, value: 30,
      icon: _I.weapon("common/dwarf/axe_v2_06.png")
    },
    "Clan War Axe": {
      description: "The axe of a dwarven clan warrior — passed through battles and still sharp enough to split iron.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 18 }, weight: 6.0, value: 35,
      icon: _I.weapon("common/dwarf/axe_v2_07.png")
    },
    "Ancestral Axe": {
      description: "A rune-covered axe carried by dwarven ancestors — its age is apparent, its edge is not.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 20 }, weight: 6.5, value: 40,
      icon: _I.weapon("common/dwarf/axe_v2_08.png")
    },
    "Dwarven Bolt Crossbow": {
      description: "A squat dwarven crossbow designed for tight tunnel fighting — powerful, accurate at short range.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 12 }, weight: 3.5, value: 28,
      icon: _I.weapon("common/dwarf/bow_21.png")
    },
    "Heavy Dwarven Crossbow": {
      description: "A reinforced dwarven crossbow that fires heavy iron bolts — slow to reload, devastating on impact.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 16 }, weight: 5.0, value: 40,
      icon: _I.weapon("common/dwarf/crossbow_2.png")
    },
    "Clansman's Hammer": {
      description: "The everyday hammer of a dwarven craftsman pressed into combat use — heavy and unforgiving.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 12 }, weight: 4.0, value: 15,
      icon: _I.weapon("common/dwarf/hammer_01.png")
    },
    "Iron War Hammer": {
      description: "A solid iron hammer built for war — simple in design, brutal in effect.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 14 }, weight: 5.0, value: 18,
      icon: _I.weapon("common/dwarf/hammer_09.png")
    },
    "Runed Hammer": {
      description: "A hammer inscribed with runes of striking — the runes glow faintly when raised in anger.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 5.0, value: 22,
      icon: _I.weapon("common/dwarf/hammer_10.png")
    },
    "Forgemaster's Hammer": {
      description: "The hammer of a dwarven forgemaster — as comfortable shaping steel as it is breaking skulls.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 16 }, weight: 5.5, value: 26,
      icon: _I.weapon("common/dwarf/hammer_11.png")
    },
    "Stone Crusher": {
      description: "A wide-headed hammer built to break rock — and everything else that gets in the way.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 17 }, weight: 6.0, value: 28,
      icon: _I.weapon("common/dwarf/hammer_12.png")
    },
    "Dwarven War Hammer": {
      description: "The standard war hammer of dwarven infantry — compact, heavy, and punishing.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 18 }, weight: 6.5, value: 35,
      icon: _I.weapon("common/dwarf/hammer_13.png")
    },
    "Deepstone Hammer": {
      description: "Forged from deepstone ore found only in the lowest mines — denser than iron, harder than spite.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 19 }, weight: 7.0, value: 40,
      icon: _I.weapon("common/dwarf/hammer_14.png")
    },
    "Clan Champion's Hammer": {
      description: "The hammer awarded to the champion of a dwarven clan — engraved with the victories of its wielder.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 20 }, weight: 7.5, value: 45,
      icon: _I.weapon("common/dwarf/hammer_15.png")
    },
    "Runic War Hammer": {
      description: "A war hammer covered in layered runes of force and endurance — rattles the bones of those it strikes.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 21 }, weight: 8.0, value: 50,
      icon: _I.weapon("common/dwarf/hammer_16.png")
    },
    "Ancestor's Hammer": {
      description: "An ancient hammer said to have been carried in the first great battle of dwarven history.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 22 }, weight: 8.5, value: 65,
      icon: _I.weapon("common/dwarf/hammer_20.png")
    },
    "Stonebrand Hammer": {
      description: "A hammer branded with the Stonebrand mark of master dwarven smiths — a mark of supreme craft.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 23 }, weight: 9.0, value: 70,
      icon: _I.weapon("common/dwarf/hammer_21.png")
    },
    "Ironclad Maul": {
      description: "A maul encased in iron plating — almost too heavy to swing, but each blow is catastrophic.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 24 }, weight: 9.5, value: 75,
      icon: _I.weapon("common/dwarf/hammer_27.png")
    },
    "Doomhammer": {
      description: "A dwarven hammer of legend — its name is spoken quietly in the halls beneath the mountain.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 25 }, weight: 10.0, value: 80,
      icon: _I.weapon("common/dwarf/hammer_28.png")
    },
    "Forge King's Hammer": {
      description: "The ceremonial hammer of the Forge King — ornate enough for a throne room, deadly enough for a battlefield.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 26 }, weight: 10.5, value: 90,
      icon: _I.weapon("common/dwarf/hammer_29.png")
    },
    "Thunderstrike Maul": {
      description: "A legendary maul said to have been blessed by the first dwarven forge-god — its strikes crack stone.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Legendary",
      baseEffect: { damage: 27 }, weight: 11.0, value: 110,
      icon: _I.weapon("common/dwarf/hammer_30.png")
    },
    "Deepking's Hammer": {
      description: "The hammer of the Deepking himself — heavy with authority and heavier in the hand.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 22 }, weight: 8.0, value: 55,
      icon: _I.weapon("common/dwarf/hammer_32.png")
    },
    "Runebound Hammer": {
      description: "A hammer whose runes are burned so deep they will never fade — each strike resonates with ancient power.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 23 }, weight: 8.5, value: 60,
      icon: _I.weapon("common/dwarf/hammer_33.png")
    },
    "Siege Hammer": {
      description: "A dwarven siege weapon made compact enough for an individual warrior — built to smash gates.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 24 }, weight: 9.0, value: 65,
      icon: _I.weapon("common/dwarf/hammer_34.png")
    },
    "Mountain Maul": {
      description: "A maul hewn from mountain iron — as ancient and immovable as the peaks it came from.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 25 }, weight: 9.5, value: 78,
      icon: _I.weapon("common/dwarf/hammer_35.png")
    },
    "Iron-Capped Hammer": {
      description: "A wooden-shafted hammer with an iron cap — a working man's tool that doubles as a decent weapon.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 13 }, weight: 4.5, value: 16,
      icon: _I.weapon("common/dwarf/hammer_metal.png")
    },
    "Reinforced Battle Hammer": {
      description: "A hammer with extra iron reinforcement on the head and haft — built to take and deliver punishment.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 5.5, value: 24,
      icon: _I.weapon("common/dwarf/hammer_metal_2.png")
    },
    "Heavy Iron Hammer": {
      description: "A full iron hammer of considerable weight — swings slowly but hits like a falling boulder.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 17 }, weight: 6.0, value: 30,
      icon: _I.weapon("common/dwarf/hammer_metal_3.png")
    },
    "Dwarven Kite Shield": {
      description: "A kite-shaped dwarven shield of hammered iron — broad enough to cover chest to knee.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 0, defense: 6 }, weight: 5.0, value: 18,
      icon: _I.weapon("common/dwarf/shield_v2_05.png")
    },
    "Clan Tower Shield": {
      description: "A massive tower shield bearing clan markings — turns a warrior into a walking fortress.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 0, defense: 8 }, weight: 7.0, value: 28,
      icon: _I.weapon("common/dwarf/shield_v2_09.png")
    },
    "Runed Dwarven Shield": {
      description: "A shield etched with protective runes — channels the mountain's endurance into the bearer.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 0, defense: 10 }, weight: 8.0, value: 40,
      icon: _I.weapon("common/dwarf/shield_v2_38.png")
    },
    "Dwarven Short Blade": {
      description: "A short, stout blade of dwarven make — perfectly sized for the tight corridors of a mountain hold.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 11 }, weight: 2.5, value: 14,
      icon: _I.weapon("common/dwarf/sword_saber_1.png")
    },

    // ── weapons/common/elf/ ────────────────────────────────────────────────
    "Elven Long Bow": {
      description: "A tall elven long bow of exceptional range — carved from a single branch of moonwood.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 12 }, weight: 1.5, value: 20,
      icon: _I.weapon("common/elf/bow_08.png")
    },
    "Sylvan Bow": {
      description: "A simple elven bow carved with leaf patterns — light and quiet in the forest.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 11 }, weight: 1.2, value: 16,
      icon: _I.weapon("common/elf/bow_09.png")
    },
    "Moonwood Bow": {
      description: "A bow cut from moonwood that has drunk in years of silver light — slightly luminous at night.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 13 }, weight: 1.4, value: 22,
      icon: _I.weapon("common/elf/bow_10.png")
    },
    "Ancient Elven Bow": {
      description: "A bow of great age, passed through elven hands for centuries — its power has only deepened.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 14 }, weight: 1.3, value: 30,
      icon: _I.weapon("common/elf/bow_11.png")
    },
    "Whisperwind Bow": {
      description: "A bow so finely balanced its arrows fly as silently as breath — no twang, no whistle.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 15 }, weight: 1.2, value: 38,
      icon: _I.weapon("common/elf/bow_12.png")
    },
    "Starroot Longbow": {
      description: "A long bow carved from starroot timber — the grain of the wood shimmers like constellations.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 16 }, weight: 1.6, value: 42,
      icon: _I.weapon("common/elf/bow_13.png")
    },
    "Canopy Bow": {
      description: "A short elven bow made for shooting between treetops — compact, agile, and effective.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 10 }, weight: 1.1, value: 14,
      icon: _I.weapon("common/elf/bow_14.png")
    },
    "Elven War Bow": {
      description: "A heavy war bow of elven make — draws harder than it looks and shoots truer than physics should allow.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 17 }, weight: 1.5, value: 55,
      icon: _I.weapon("common/elf/bow_18.png")
    },
    "Elven Leaf Blade": {
      description: "A double-edged elven sword shaped like an elongated leaf — graceful, swift, and razor-sharp.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 13 }, weight: 2.0, value: 20,
      icon: _I.weapon("common/elf/sword_34.png")
    },
    "Sylvan Longsword": {
      description: "A long elven sword of forest-forged iron — imbued with the patience and precision of elven craft.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 15 }, weight: 2.5, value: 32,
      icon: _I.weapon("common/elf/sword_35.png")
    },

    // ── weapons/mage/ ─────────────────────────────────────────────────────
    // All staves include a manaVessel value — they act as conduits for non-magical
    // races (humans, dwarves, etc.) who lack a natural mana pool.
    "Apprentice Staff": {
      description: "A plain wooden staff given to students of the arcane arts — unadorned but functional.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      manaVessel: 10, baseEffect: { damage: 8 }, weight: 2.0, value: 10,
      icon: _I.weapon("mage/staff_01.png")
    },
    "Oak Staff": {
      description: "A sturdy oak staff smoothed by long use — channels basic magic without resistance.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      manaVessel: 10, baseEffect: { damage: 9 }, weight: 2.5, value: 12,
      icon: _I.weapon("mage/staff_03.png")
    },
    "Carved Ironwood Staff": {
      description: "A staff of ironwood intricately carved with arcane symbols — more resistant to spellfire than plain oak.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      manaVessel: 12, baseEffect: { damage: 10 }, weight: 2.5, value: 14,
      icon: _I.weapon("mage/staff_04.png")
    },
    "Mage's Focus Staff": {
      description: "A staff designed to channel and focus spellcasting — a journeyman mage's first serious tool.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      manaVessel: 18, baseEffect: { damage: 11 }, weight: 2.0, value: 20,
      icon: _I.weapon("mage/staff_05.png")
    },
    "Battle Staff": {
      description: "A heavy staff reinforced at both ends with iron — as dangerous as a spear in close quarters.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      manaVessel: 10, baseEffect: { damage: 12 }, weight: 3.0, value: 22,
      icon: _I.weapon("mage/staff_06.png")
    },
    "Elder Staff": {
      description: "A staff carved from elder wood — draws on deep ley lines and amplifies focused intent.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      manaVessel: 22, baseEffect: { damage: 13 }, weight: 2.5, value: 26,
      icon: _I.weapon("mage/staff_07.png")
    },
    "Arcane Staff": {
      description: "A staff suffused with arcane energy — crackles with potential even when not in use.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      manaVessel: 28, baseEffect: { damage: 14 }, weight: 2.5, value: 35,
      icon: _I.weapon("mage/staff_08.png")
    },
    "Crystal-Tipped Staff": {
      description: "A staff topped with a focusing crystal — concentrates magic into sharp, precise bursts.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      manaVessel: 30, baseEffect: { damage: 15 }, weight: 2.5, value: 40,
      icon: _I.weapon("mage/staff_09.png")
    },
    "Stormcaller Staff": {
      description: "A staff that hums in bad weather — in a storm it practically vibrates with lightning potential.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      manaVessel: 28, baseEffect: { damage: 16 }, weight: 3.0, value: 45,
      icon: _I.weapon("mage/staff_10.png")
    },
    "Runic Staff": {
      description: "A staff covered head to toe in active runes — each rune a small spell waiting to be triggered.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      manaVessel: 32, baseEffect: { damage: 17 }, weight: 2.5, value: 50,
      icon: _I.weapon("mage/staff_11.png")
    },
    "Void Staff": {
      description: "A staff of black polished wood that seems to absorb light — draws on magic from beyond the world.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Epic",
      manaVessel: 38, baseEffect: { damage: 18 }, weight: 2.5, value: 65,
      icon: _I.weapon("mage/staff_12.png")
    },
    "Grand Magister's Staff": {
      description: "The staff of a high-ranking magister — a symbol of authority and an instrument of devastating power.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      manaVessel: 42, baseEffect: { damage: 20 }, weight: 3.0, value: 80,
      icon: _I.weapon("mage/staff_13.png")
    },
    "Worldtree Staff": {
      description: "A staff carved from a branch of the Worldtree itself — channels the living magic of the earth.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Legendary",
      manaVessel: 50, baseEffect: { damage: 22 }, weight: 3.0, value: 120,
      icon: _I.weapon("mage/staff_14.png")
    },
    "Ember Staff": {
      description: "A staff that is warm to the touch at all times — preferred by fire-inclined mages.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      manaVessel: 20, baseEffect: { damage: 13 }, weight: 2.5, value: 28,
      icon: _I.weapon("mage/staff_15.png")
    },
    "Iron Shod Staff": {
      description: "A heavy wooden staff capped top and bottom with iron — favoured by mages who also know how to brawl.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      manaVessel: 8, baseEffect: { damage: 11 }, weight: 3.5, value: 16,
      icon: _I.weapon("mage/staff_43.png")
    },
    "Twisted Root Staff": {
      description: "A staff shaped from a naturally twisted root — raw and unworked, it channels wild magic unpredictably.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      manaVessel: 8, baseEffect: { damage: 10 }, weight: 2.0, value: 13,
      icon: _I.weapon("mage/staff_44.png")
    },
    "War Mage Staff": {
      description: "A reinforced staff designed for combat mages who fight in the front line — channels offensive spells at close range.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Epic",
      manaVessel: 30, baseEffect: { damage: 19 }, weight: 3.5, value: 72,
      icon: _I.weapon("mage/staff_v2_32.png")
    },
    "Enchanter's Wand": {
      description: "A slender wand used by enchanters and illusionists — precise, responsive, and delicately attuned.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      manaVessel: 20, baseEffect: { damage: 9 }, weight: 0.5, value: 30,
      icon: _I.weapon("mage/wand_v2_36.png")
    },

    // ── weapons/Rendarost/ ────────────────────────────────────────────────
    "Rendarost Felling Axe": {
      description: "A broad axe from the cold north — originally for felling the iron pines of Rendarost, now a weapon of war.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 16 }, weight: 4.5, value: 18,
      icon: _I.weapon("Rendarost/axe_07.png")
    },
    "Rendarost War Axe": {
      description: "The standard war axe of Rendarost warriors — heavy, utilitarian, and lethal in a charge.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 18 }, weight: 5.0, value: 25,
      icon: _I.weapon("Rendarost/axe_08.png")
    },
    "Frost-Forged Axe": {
      description: "An axe tempered in glacial runoff — the extreme cold forge-quench gives the blade unusual hardness.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 20 }, weight: 5.5, value: 38,
      icon: _I.weapon("Rendarost/axe_09.png")
    },
    "Rendarost Battle Axe": {
      description: "A veteran's battle axe from the frozen north — its edge has never needed resharpening.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 19 }, weight: 5.0, value: 30,
      icon: _I.weapon("Rendarost/axe_10.png")
    },
    "Rendarost Ice Dagger": {
      description: "A bone-handled dagger from Rendarost's northern reaches — thin, fast, and carried against the cold.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 10 }, weight: 1.5, value: 12,
      icon: _I.weapon("Rendarost/dagger_29.png")
    },
    "Rendarost Warhammer": {
      description: "A warhammer forged in Rendarost's mountain smithies — built for the brutal weight of northern warfare.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 18 }, weight: 6.0, value: 28,
      icon: _I.weapon("Rendarost/hammer_17.png")
    },
    "Frost Hammer": {
      description: "A hammer from Rendarost's coldest forges — the iron holds a chill even indoors.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 20 }, weight: 6.5, value: 42,
      icon: _I.weapon("Rendarost/hammer_18.png")
    },
    "Glacial Maul": {
      description: "A massive maul carved from ice-hardened iron — as cold and unyielding as Rendarost's winter peaks.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 22 }, weight: 7.5, value: 50,
      icon: _I.weapon("Rendarost/hammer_19.png")
    },
    "Tundra Warhammer": {
      description: "A well-travelled warhammer that has seen campaigns across Rendarost's frozen tundra.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 19 }, weight: 6.5, value: 35,
      icon: _I.weapon("Rendarost/hammer_38.png")
    },
    "Ironpeak Hammer": {
      description: "Forged at Ironpeak, the highest smithy in Rendarost — the altitude is said to improve the iron.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 21 }, weight: 7.0, value: 44,
      icon: _I.weapon("Rendarost/hammer_39.png")
    },
    "Rendarost Harvest Scythe": {
      description: "A scythe from Rendarost's brief growing season — repurposed with a sharpened blade for combat.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 14 }, weight: 4.0, value: 16,
      icon: _I.weapon("Rendarost/scythe_04.png")
    },
    "Bladed War Scythe": {
      description: "A modified war scythe with a straightened blade — an unusual weapon that confounds trained fighters.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 18 }, weight: 5.0, value: 28,
      icon: _I.weapon("Rendarost/scythe_05.png")
    },
    "Rendarost Iron Shield": {
      description: "A plain iron shield from Rendarost's northern forges — built for cold hands and hard winters.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 0, defense: 7 }, weight: 5.5, value: 20,
      icon: _I.weapon("Rendarost/shield_25.png")
    },
    "Northern Kite Shield": {
      description: "A kite shield painted with Rendarost's northern colours — wide enough to shelter from arrows and sleet alike.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 0, defense: 9 }, weight: 6.0, value: 28,
      icon: _I.weapon("Rendarost/shield_26.png")
    },
    "Rendarost War Shield": {
      description: "A heavy war shield issued to Rendarost's standing army — dented but dependable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 0, defense: 11 }, weight: 7.0, value: 40,
      icon: _I.weapon("Rendarost/shield_27.png")
    },
    "Glacial Tower Shield": {
      description: "A tower shield as cold and unyielding as the glaciers of Rendarost — nearly indestructible.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 0, defense: 13 }, weight: 8.0, value: 52,
      icon: _I.weapon("Rendarost/shield_28.png")
    },
    "Rendarost Champion's Shield": {
      description: "The shield of a Rendarost champion — bears the scars of a hundred battles and the pride of a nation.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 0, defense: 15 }, weight: 9.0, value: 70,
      icon: _I.weapon("Rendarost/shield_29.png")
    },

    // ── weapons/Feldarun/ ─────────────────────────────────────────────────
    "Feldarún Ceremonial Axe": {
      description: "An axe from Feldarún crafted for ceremony as much as war — its blade is etched with forge-master sigils.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 15 }, weight: 4.0, value: 24,
      icon: _I.weapon("Feldarun/axe_26.png")
    },
    "Feldarún Master Hammer": {
      description: "A hammer bearing the mark of a Feldarún master smith — forged to a standard few can match.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 20 }, weight: 7.0, value: 45,
      icon: _I.weapon("Feldarun/hammer_26.png")
    },
    "Feldarún Forge Hammer": {
      description: "A hammer used in Feldarún's legendary forges — the difference between a tool and a weapon is minimal.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 22 }, weight: 7.5, value: 52,
      icon: _I.weapon("Feldarun/hammer_48.png")
    },
    "Grand Forge Hammer": {
      description: "The grand hammer of a Feldarún forge lord — its strikes are said to shape not just metal but fate.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 24 }, weight: 8.0, value: 68,
      icon: _I.weapon("Feldarun/hammer_49.png")
    },
    "Feldarún Masterwork Maul": {
      description: "The pinnacle of Feldarún hammer-craft — a masterwork maul that required three forge-masters to complete.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 26 }, weight: 9.0, value: 85,
      icon: _I.weapon("Feldarun/hammer_50.png")
    },
    "Feldarún Iron Bulwark": {
      description: "A broad iron shield from Feldarún's finest smiths — thick enough to stop a ballista bolt.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 0, defense: 12 }, weight: 7.5, value: 45,
      icon: _I.weapon("Feldarun/shield_metal.png")
    },
    "Feldarún Hunting Spear": {
      description: "A spear from Feldarún's elven-forge tradition — long, balanced, and crafted for both hunt and war.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 16 }, weight: 3.5, value: 28,
      icon: _I.weapon("Feldarun/spear_21.png")
    },

    // ── weapons/bandit/ ───────────────────────────────────────────────────
    "Bandit's Hatchet": {
      description: "A small hatchet looted from a woodcutter or stolen from a farm — crude but cuts deep.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 10 }, weight: 3.0, value: 8,
      icon: _I.weapon("bandit/axe_01.png")
    },
    "Crude Iron Axe": {
      description: "An axe of rough iron with a poorly fitted handle — clearly made by someone with more desperation than skill.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 11 }, weight: 3.5, value: 10,
      icon: _I.weapon("bandit/axe_02.png")
    },
    "Bandit's Club": {
      description: "A thick length of hardwood favoured by bandits — no craft to it, just weight and menace.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Fair", burnTime: 10, rarity: "Common",
      baseEffect: { damage: 8 }, weight: 2.5, value: 5,
      icon: _I.weapon("bandit/club_v2_02.png")
    },
    "Nail-Studded Club": {
      description: "A club with iron nails hammered through the head — improvised, vicious, and very unpleasant.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 10 }, weight: 3.0, value: 7,
      icon: _I.weapon("bandit/club_v2_03.png")
    },
    "Spiked Truncheon": {
      description: "A truncheon fitted with iron spikes — the favourite persuader of less scrupulous enforcers.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 11 }, weight: 3.5, value: 9,
      icon: _I.weapon("bandit/club_v2_05.png")
    },

    // ── weapons/Wistravael/ ───────────────────────────────────────────────
    "Wistravael Warhammer": {
      description: "A heavy warhammer crafted in the mountain holds of Wistravael — built for war at altitude.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 19 }, weight: 7.0, value: 32,
      icon: _I.weapon("Wistravael/hammer_22.png")
    },
    "Star-Metal Hammer": {
      description: "A hammer forged from star-metal ore found only in Wistravael's high peaks — unnaturally dense.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 21 }, weight: 7.5, value: 48,
      icon: _I.weapon("Wistravael/hammer_23.png")
    },
    "Wistravael Maul": {
      description: "A two-handed maul of Wistravael origin — carved from star-iron and balanced by mountain smiths.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 23 }, weight: 8.5, value: 58,
      icon: _I.weapon("Wistravael/hammer_24.png")
    },
    "Enchanted Wistravael Hammer": {
      description: "A Wistravael hammer imbued with elemental enchantments — hums with mountain energy.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 25 }, weight: 9.0, value: 75,
      icon: _I.weapon("Wistravael/hammer_25.png")
    },
    "Wistravael Iron Maul": {
      description: "A plain iron maul from Wistravael's lower forges — unenchanted but immaculately crafted.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 20 }, weight: 8.0, value: 42,
      icon: _I.weapon("Wistravael/hammer_metal_4.png")
    },

    // ── weapons/Brythwen/ ─────────────────────────────────────────────────
    "Brythwen Naval Dagger": {
      description: "A sleek dagger carried by Brythwen's naval officers — short enough to use below deck.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 9 }, weight: 1.0, value: 16,
      icon: _I.weapon("Brythwen/dagger_elite_blue.png")
    },
    "Brythwen Arrow Quiver": {
      description: "A well-made quiver from Brythwen's coastal fletchers — holds arrows securely even in sea spray.",
      type: "ammo", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 2 }, weight: 1.0, value: 12,
      icon: _I.weapon("Brythwen/quiver_3_with_arrows.png")
    },
    "Brythwen Knight's Shield": {
      description: "A shield bearing Brythwen's coastal crest — issued to the kingdom's mounted knights.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 0, defense: 12 }, weight: 7.0, value: 42,
      icon: _I.weapon("Brythwen/shield_knight.png")
    },
    "Brythwen Cutlass": {
      description: "The curved blade of a Brythwen sailor — quick on the draw and well-suited to the roll of a ship's deck.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 14 }, weight: 3.0, value: 24,
      icon: _I.weapon("Brythwen/sword.png")
    },

    // ── weapons/special/ ──────────────────────────────────────────────────
    "Enchanted Longbow": {
      description: "A longbow wrapped in glowing enchantments — each arrow it looses flies truer than nature allows.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 20 }, weight: 1.5, value: 80,
      icon: _I.weapon("special/bow_22.png")
    },
    "Godwood Bow": {
      description: "A bow said to be carved from the Godwood — a tree older than recorded history and touched by divine will.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Legendary",
      baseEffect: { damage: 24 }, weight: 1.2, value: 130,
      icon: _I.weapon("special/bow_41.png")
    },
    "Champion's Hammer": {
      description: "A hammer presented to a tournament champion — ornate, powerful, and clearly intended for war.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { damage: 26 }, weight: 9.0, value: 88,
      icon: _I.weapon("special/hammer_42.png")
    },
    "Titan Maul": {
      description: "A maul of legendary proportions — according to myth it was forged for a being larger than any living man.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Legendary",
      baseEffect: { damage: 30 }, weight: 12.0, value: 150,
      icon: _I.weapon("special/hammer_52.png")
    },

    // ── weapons/Dwynbroch/ ────────────────────────────────────────────────
    "Dwynbroch Knight Shield": {
      description: "A knight's shield bearing the Dwynbroch hold emblem — solid, traditional, and well-proven.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { damage: 0, defense: 11 }, weight: 7.0, value: 40,
      icon: _I.weapon("Dwynbroch/shield_knight_green.png")
    },
    "Dwynbroch Clan Shield": {
      description: "A mid-size shield used by Dwynbroch clan warriors — compact enough for the mines, sturdy enough for battle.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 0, defense: 9 }, weight: 6.0, value: 28,
      icon: _I.weapon("Dwynbroch/shield_v2_31.png")
    },
    "Dwynbroch Short Sword": {
      description: "A short sword forged in Dwynbroch's deep hold — practical, well-balanced, and made for confined spaces.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 13 }, weight: 3.0, value: 18,
      icon: _I.weapon("Dwynbroch/sword_2.png")
    },

    // ── weapons/Orindroth/ ────────────────────────────────────────────────
    "Orindroth Stiletto": {
      description: "A narrow-bladed stiletto from Orindroth's central plains — made for finding the gaps in armour.",
      type: "weapon", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { damage: 10 }, weight: 1.0, value: 18,
      icon: _I.weapon("Orindroth/dagger_56.png")
    },
    "Orindroth Arrow Quiver": {
      description: "A serviceable quiver from Orindroth's plains archers — durable and well-stitched.",
      type: "ammo", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { damage: 2 }, weight: 1.0, value: 10,
      icon: _I.weapon("Orindroth/quiver_2_with_arrows.png")
    }
  },

  Armor: {
    "Leather Boots": {
      description: "Soft, worn leather boots.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 10, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 2.5, value: 10,
      icon: _I.armor("common/all/common_leather_boots.png")
    },
    "Chainmail Shirt": {
      description: "Protective but heavy chainmail shirt.",
      type: "armor", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 8.0, value: 25,
      icon: _I.armor("common/human/human_mail2_chest.png")
    },
    "Leather Armor": {
      description: "Cured leather shaped into a chest piece — light enough to move in, tough enough to matter.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 5.0, value: 18,
      icon: _I.armor("common/all/common_leather1_chest.png")
    },
    "Dark Cloak": {
      description: "A heavy cloak dyed deep black — favoured by scouts and those who prefer not to be seen.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 1.5, value: 10,
      icon: _I.armor("common/all/cape_brown_worn.png")
    },
    "Gambeson": {
      description: "A thick quilted jacket of layered linen — worn alone by common soldiers or under chainmail. Affordable protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 }, weight: 4.5, value: 14,
      icon: _I.armor("common/all/common_gambesons.png")
    },
    "Padded Armor": {
      description: "A stuffed, padded chest piece — bulky but surprisingly effective at absorbing blows.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 }, weight: 5.5, value: 16,
      icon: _I.armor("common/all/common_padded_armor_chest.png")
    },
    "Leather Gloves": {
      description: "Simple leather gauntlets — protect the hands in a fight and keep fingers warm on cold rides.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 0.5, value: 5,
      icon: _I.armor("common/all/common_leather1_gloves.png")
    },
    "Leather Bracers": {
      description: "Stiff leather bracers that guard the forearms from blade and bowstring alike.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 }, weight: 0.8, value: 7,
      icon: _I.armor("common/all/common_leather_bracers.png")
    },
    "Leather Helmet": {
      description: "A fitted leather cap — won't stop a war axe, but better than nothing against a cudgel.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 }, weight: 1.0, value: 8,
      icon: _I.armor("common/all/common_leather_helmet.png")
    },
    "Leather Pants": {
      description: "Tough leather trousers — protect the legs from brush, blades, and light missiles.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 }, weight: 2.0, value: 9,
      icon: _I.armor("common/all/common_leather_pants.png")
    },
    "Leather Shoes": {
      description: "Sturdy leather shoes with a thick sole — comfortable for long travel.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 1.0, value: 6,
      icon: _I.armor("common/all/common_leather_shoes.png")
    },
    "Chainmail Coif": {
      description: "A close-fitting chainmail hood that guards the head and neck — often worn under an iron helm.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 }, weight: 2.5, value: 16,
      icon: _I.armor("common/all/common_mail6_head.png")
    },
    "Chainmail Gloves": {
      description: "Flexible chainmail gloves — protect the hands without sacrificing dexterity.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 3 }, weight: 1.0, value: 12,
      icon: _I.armor("common/all/common_mail6_bracers.png")
    },
    "Chainmail Belt": {
      description: "A chainmail girdle reinforcing the midsection — worn over a gambeson.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 3 }, weight: 2.0, value: 14,
      icon: _I.armor("common/all/common_mail6_belt.png")
    },
    "Chainmail Boots": {
      description: "Heavy chainmail footwear — excellent protection, but not ideal for long marches.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 }, weight: 3.5, value: 16,
      icon: _I.armor("common/all/common_mail6_boots.png")
    },
    "Iron Cuirass": {
      description: "A formed iron breastplate — solid protection for the torso, the most critical piece of armour.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 14 }, weight: 12.0, value: 38,
      icon: _I.armor("common/all/common_cuirass.png")
    },
    "Farmer's Tunic": {
      description: "A rough-sewn linen tunic — not armour by any stretch, but it's what most people are wearing.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 1.5, value: 3,
      icon: _I.armor("common/all/common_farmer_chest.png")
    },
    "Farmer's Work Chest": {
      description: "A heavier farmer's work shirt reinforced with stitched leather patches.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 }, weight: 2.0, value: 4,
      icon: _I.armor("common/all/common_farmer_chest_3.png")
    },
    "Farmer's Heavy Chest": {
      description: "A padded farmer's chest piece worn during harsher seasons and rough labour.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 }, weight: 2.5, value: 5,
      icon: _I.armor("common/all/common_farmer_chest_4.png")
    },
    "Traveller's Cape": {
      description: "A wide-shouldered travelling cape — provides some warmth and weather protection on the road.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 }, weight: 1.5, value: 8,
      icon: _I.armor("common/all/travellers_cape.png")
    },
    "Brown Cloak": {
      description: "A plain brown wool cloak — unremarkable and perfect for blending into a crowd.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 1.2, value: 5,
      icon: _I.armor("common/all/cape_brown.png")
    },
    "Straw Hat": {
      description: "A broad-brimmed straw hat — protects against the sun and light rain. Common among farmers.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 0 }, weight: 0.3, value: 2,
      icon: _I.armor("common/all/common_straw_hat.png")
    },
    "Farmer's Hat": {
      description: "A simple round-crowned hat worn by farmers on hot days — a touch more durable than a straw hat.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 0 }, weight: 0.4, value: 3,
      icon: _I.armor("common/all/common_farmers_hat.png")
    },
    "Iron Helmet": {
      description: "A riveted iron helm with a nasal guard — standard military headgear for infantry and militia.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 }, weight: 4.0, value: 20,
      icon: _I.armor("common/all/common_helm_02.png")
    },
    "Feathered Hat": {
      description: "A stylish wide-brimmed hat with a colourful plume — favoured by bards, merchants, and peacocks of the nobility.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 0 }, weight: 0.5, value: 12,
      icon: _I.armor("common/all/feathered_hat.png")
    },

    // ── Dwarven ──
    "Dwarven Iron Boots": {
      description: "Solid iron-capped boots hammered out in a dwarven smithy — heavy, dependable, and built to last a century.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 3.5, value: 14,
      icon: _I.armor("common/dwarf/dwarf_boots_25.png")
    },
    "Clanforged Boots": {
      description: "Boots bearing the maker's mark of a dwarven clan — reinforced toe and heel for mountainous terrain.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 4.0, value: 18,
      icon: _I.armor("common/dwarf/dwarf_boots_29.png")
    },
    "Deepstone Boots": {
      description: "Cut from stone-hardened alloy found only in deep dwarven mines — unnaturally resistant to cave crushing.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 6 },
      weight: 4.5, value: 24,
      icon: _I.armor("common/dwarf/dwarf_boots_32.png")
    },
    "Dwarven Heavy Boots": {
      description: "Thick-soled boots layered with iron plates — each step lands like a hammer blow.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 7 },
      weight: 5.0, value: 30,
      icon: _I.armor("common/dwarf/dwarf_boots_33.png")
    },
    "Rune-Stamped Boots": {
      description: "Boots imprinted with protective runes at the forge — each symbol wards against a different underground hazard.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 8 },
      weight: 5.0, value: 36,
      icon: _I.armor("common/dwarf/dwarf_boots_34.png")
    },
    "Dwarven Iron Breastplate": {
      description: "A heavy iron breastplate shaped to a dwarven torso — broad, squat, and capable of turning most blades.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 10 },
      weight: 9.0, value: 28,
      icon: _I.armor("common/dwarf/dwarf_chest_18.png")
    },
    "Clanforged Breastplate": {
      description: "A breastplate proudly bearing a clan crest — forged in the deep smithies and worn with honour.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 12 },
      weight: 10.0, value: 38,
      icon: _I.armor("common/dwarf/dwarf_chest_19.png")
    },
    "Dwarven Plate Cuirass": {
      description: "Full dwarven plate across the torso — a masterwork of ore and patience, capable of stopping a charging destrier.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 14 },
      weight: 12.0, value: 52,
      icon: _I.armor("common/dwarf/dwarf_cuirass.png")
    },
    "Deathgrip Gauntlets": {
      description: "Black iron gauntlets etched with skeletal patterns — favoured by dwarven berserkers who want their enemies to know fear.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 5 },
      weight: 2.5, value: 24,
      icon: _I.armor("common/dwarf/dwarf_death_gloves.png")
    },
    "Dragonscale Pauldrons": {
      description: "Dwarven shoulder armour plated with true dragonscale — scorching-hot to the touch when first donned.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { defense: 8 },
      weight: 4.5, value: 45,
      icon: _I.armor("common/dwarf/dwarf_dragon_shoulder.png")
    },
    "Dwarven Gladiator Helm": {
      description: "An open-faced battle helm modelled after the arena fighters of the deep cities — protection and intimidation in equal measure.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 },
      weight: 4.5, value: 28,
      icon: _I.armor("common/dwarf/dwarf_gladiator_helm.png")
    },
    "Clan Iron Gauntlets": {
      description: "Standard iron gauntlets issued to clan warriors — tough, unadorned, and made to last.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 2.0, value: 14,
      icon: _I.armor("common/dwarf/dwarf_gloves_16.png")
    },
    "Gilded Dwarven Helm": {
      description: "An iron helm with a gleaming gold veneer — worn by clan champions and high officers on ceremonial occasions.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 9 },
      weight: 5.0, value: 42,
      icon: _I.armor("common/dwarf/dwarf_gold_helm.png")
    },
    "Dwarven Skullcap": {
      description: "A simple rounded iron cap — the first helm given to young dwarven recruits. Unpretentious and practical.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 3.5, value: 18,
      icon: _I.armor("common/dwarf/dwarf_helm_16.png")
    },
    "Clan War Helm": {
      description: "A battle-hardened dwarven war helm bearing clan markings — worn with pride on the front lines.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 4.0, value: 24,
      icon: _I.armor("common/dwarf/dwarf_helm_40.png")
    },
    "Runed Dwarven Helm": {
      description: "A helm inscribed with protective runes along the brim — the runes glow faintly when danger is near.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 },
      weight: 4.5, value: 30,
      icon: _I.armor("common/dwarf/dwarf_helm_42.png")
    },
    "Deepforge Helm": {
      description: "Hammered out in the deepest and hottest forge known to dwarfkind — this helm has never cracked in a century of use.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 9 },
      weight: 5.0, value: 38,
      icon: _I.armor("common/dwarf/dwarf_helm_66.png")
    },
    "Dwarven Great Helm": {
      description: "A full-coverage great helm offering commanding protection — vision is limited, but enemies tend to reconsider.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 10 },
      weight: 5.5, value: 44,
      icon: _I.armor("common/dwarf/dwarf_helm_67.png")
    },
    "Ancestral Dwarven Helm": {
      description: "Passed down through generations of a dwarven bloodline — this helm carries the weight of ancestry and war.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { defense: 11 },
      weight: 6.0, value: 55,
      icon: _I.armor("common/dwarf/dwarf_helm_s2.png")
    },
    "Dwarven Knight Sabatons": {
      description: "Articulated iron sabatons fitted for a dwarven knight — each plate overlaps to permit the full stomp of a battle charge.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 8 },
      weight: 5.5, value: 38,
      icon: _I.armor("common/dwarf/dwarf_knight_boots.png")
    },
    "Dwarven Mail Boots": {
      description: "Linked iron rings covering the foot and ankle — part of the standard dwarven mail set worn by clan infantry.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 4.0, value: 18,
      icon: _I.armor("common/dwarf/dwarf_mail1_boots.png")
    },
    "Dwarven Mail Bracers": {
      description: "Chainmail bracers covering wrist to elbow — standard issue for dwarven footsoldiers.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 2.0, value: 12,
      icon: _I.armor("common/dwarf/dwarf_mail1_bracers.png")
    },
    "Dwarven Chainmail Chest": {
      description: "A full-torso chainmail haubergeon in the dwarven style — rings closely interlocked for maximum coverage.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 10 },
      weight: 9.0, value: 28,
      icon: _I.armor("common/dwarf/dwarf_mail1_chest.png")
    },
    "Dwarven Mail Gauntlets": {
      description: "Iron-ring gauntlets following the curve of each finger — nimble enough for a smithy, tough enough for a battlefield.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 2.0, value: 12,
      icon: _I.armor("common/dwarf/dwarf_mail1_gloves.png")
    },
    "Dwarven Mail Coif": {
      description: "A close-fitting chainmail hood that protects the head and neck — dwarven make, so it fits a broader skull.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 3.0, value: 16,
      icon: _I.armor("common/dwarf/dwarf_mail1_head.png")
    },
    "Dwarven Mail Pauldrons": {
      description: "Layered chainmail shoulder guards — built wide to accommodate a dwarven frame.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 3.5, value: 14,
      icon: _I.armor("common/dwarf/dwarf_mail1_shoulder.png")
    },
    "Ironvein Mail Boots": {
      description: "Mail boots threaded with a distinctive dark ironvein alloy — harder and more resilient than standard iron.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 4.5, value: 26,
      icon: _I.armor("common/dwarf/dwarf_mail10_boots.png")
    },
    "Ironvein Mail Bracers": {
      description: "Forearm guards of ironvein chainmail — recognisable by the subtle dark streak running through each ring.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 2.5, value: 16,
      icon: _I.armor("common/dwarf/dwarf_mail10_bracers.png")
    },
    "Ironvein Chainmail": {
      description: "A full ironvein mail hauberk — the dark veining in the metal marks a superior smelting technique unique to certain deep clans.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 12 },
      weight: 10.0, value: 36,
      icon: _I.armor("common/dwarf/dwarf_mail10_chest.png")
    },
    "Ironvein Mail Gauntlets": {
      description: "Gauntlets of ironvein chainmail — stronger than standard iron, worn by mid-rank clan soldiers.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 2.0, value: 16,
      icon: _I.armor("common/dwarf/dwarf_mail10_gloves.png")
    },
    "Ironvein Mail Coif": {
      description: "A coif of ironvein mail — the distinctive dark rings make it easy to identify the wearer's clan affiliation.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 3.5, value: 22,
      icon: _I.armor("common/dwarf/dwarf_mail10_head.png")
    },
    "Ironvein Pauldrons": {
      description: "Shoulder guards of ironvein chainmail — broad and heavy, meant to shrug off axe blows in cramped underground corridors.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 4.0, value: 20,
      icon: _I.armor("common/dwarf/dwarf_mail10_shoulder.png")
    },
    "Runed Mail Boots": {
      description: "Mail boots etched with protective runes — each rune was individually carved after the rings were linked.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 8 },
      weight: 5.0, value: 32,
      icon: _I.armor("common/dwarf/dwarf_mail13_boots.png")
    },
    "Runed Mail Bracers": {
      description: "Forearm mail guards bearing carved runes of warding — said to deflect minor magical blows.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 6 },
      weight: 2.5, value: 20,
      icon: _I.armor("common/dwarf/dwarf_mail13_bracers.png")
    },
    "Runed Chainmail": {
      description: "A full chainmail suit covered in protective runes — the work of a runesmith who spent months on each individual link.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 14 },
      weight: 11.0, value: 48,
      icon: _I.armor("common/dwarf/dwarf_mail13_chest.png")
    },
    "Runed Mail Gauntlets": {
      description: "Gauntlets of runed mail — the runes carved along the back of the hand glow when the wearer is under attack.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 6 },
      weight: 2.5, value: 20,
      icon: _I.armor("common/dwarf/dwarf_mail13_gloves.png")
    },
    "Runed Mail Coif": {
      description: "A mail coif dense with runic script — older dwarves claim the runes remember the names of enemies who struck the helm.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 9 },
      weight: 4.0, value: 28,
      icon: _I.armor("common/dwarf/dwarf_mail13_head.png")
    },
    "Runed Mail Pauldrons": {
      description: "Heavy shoulder guards of runed chainmail — the rune pattern across both shoulders forms a single unbroken ward.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 7 },
      weight: 4.5, value: 26,
      icon: _I.armor("common/dwarf/dwarf_mail13_shoulder.png")
    },
    "Deepforge Mail Gauntlets": {
      description: "Gauntlets forged in the deepest dwarven furnaces — the heat imprints the metal with a subtle luminescent sheen.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 7 },
      weight: 2.5, value: 24,
      icon: _I.armor("common/dwarf/dwarf_mail14_gloves.png")
    },
    "Deepforge Mail Coif": {
      description: "A mail coif produced in the deepest forge — the rings are so precisely linked they sing faintly in strong wind.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 10 },
      weight: 4.5, value: 35,
      icon: _I.armor("common/dwarf/dwarf_mail14_head.png")
    },
    "Deepforge Pauldrons": {
      description: "Shoulder armour from the deepforge — extraordinarily dense metal that leaves an impression in the ground when set down.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 8 },
      weight: 5.0, value: 32,
      icon: _I.armor("common/dwarf/dwarf_mail14_shoulder.png")
    },
    "Dwarven Iron Helm": {
      description: "A no-frills iron helm in the traditional dwarven fashion — flat-topped and broad enough to cover dwarven ears.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 7 },
      weight: 4.0, value: 20,
      icon: _I.armor("common/dwarf/dwarf_metal_helmet_2.png")
    },
    "Ogre-Crusher Boots": {
      description: "Massively reinforced boots built for stomping through difficult terrain — reportedly tested against an actual ogre.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 9 },
      weight: 6.0, value: 42,
      icon: _I.armor("common/dwarf/dwarf_ogre_boots.png")
    },
    "Ogre-Crusher Helm": {
      description: "A titan of a dwarven helm, designed to withstand a direct ogre club strike — tested in the field and still intact.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 11 },
      weight: 6.5, value: 50,
      icon: _I.armor("common/dwarf/dwarf_ogre_helm.png")
    },
    "Clan Pauldrons": {
      description: "Standard clan-issue pauldrons given to every dwarven warrior upon reaching fighting age.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/dwarf/dwarf_shoulder_06.png")
    },
    "Iron-Bolted Pauldrons": {
      description: "Pauldrons reinforced with iron bolts at every stress point — built for dwarves who expect to be hit hard.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 3.5, value: 20,
      icon: _I.armor("common/dwarf/dwarf_shoulder_07.png")
    },
    "Hammered Steel Pauldrons": {
      description: "Shoulder guards beaten into shape by hammer and will alone — rough-looking but formidably dense.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 4.0, value: 28,
      icon: _I.armor("common/dwarf/dwarf_shoulder_22.png")
    },
    "Dwarven Viking Helm": {
      description: "A horned iron helm in the old northern style, adapted to fit a dwarven head — more ceremonial than practical, but still sturdy.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 },
      weight: 4.5, value: 30,
      icon: _I.armor("common/dwarf/dwarf_viking_helm.png")
    },
    "Dwarven Mail Greaves": {
      description: "Chainmail leg armour covering knee to ankle — part of the standard dwarven mail infantry kit.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 7 },
      weight: 5.5, value: 20,
      icon: _I.armor("common/dwarf/mail1_Pants.png")
    },
    "Ironvein Mail Greaves": {
      description: "Leg armour of ironvein chainmail — the dark-veined rings are harder than standard iron and hold their shape under impact.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 9 },
      weight: 6.0, value: 30,
      icon: _I.armor("common/dwarf/mail10_Pants.png")
    },
    "Runed Mail Greaves": {
      description: "Leg mail covered in runic script — each rune was individually blessed by a dwarven runepriest before the greaves left the forge.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 11 },
      weight: 6.5, value: 42,
      icon: _I.armor("common/dwarf/mail13_Pants.png")
    },
    "Deepforge Mail Greaves": {
      description: "Leg armour from the deepforge — the metal carries residual heat that keeps the wearer's legs warm in cold mountain passes.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 12 },
      weight: 7.0, value: 50,
      icon: _I.armor("common/dwarf/mail14_Pants.png")
    },

    // ── Elven ──
    "Elven Shadow Trousers": {
      description: "Dark-dyed elven trousers that absorb light — worn by shadow rangers and elven scouts who work at night.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 1.5, value: 16,
      icon: _I.armor("common/elf/elf_black_pants_2.png")
    },
    "Sylvan Boots": {
      description: "Soft elven boots stitched from treated bark and forest leather — barely a whisper on dry leaves.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 1.5, value: 12,
      icon: _I.armor("common/elf/elf_boots_07.png")
    },
    "Elven Leather Boots": {
      description: "Supple boots of elven-cured leather — light enough to climb a tree in, tough enough to walk cobblestones for a week.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 1.5, value: 16,
      icon: _I.armor("common/elf/elf_boots_11.png")
    },
    "Moonwood Boots": {
      description: "Boots crafted from the hide of creatures hunted under the full moon — they carry a faint silver sheen.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 1.5, value: 22,
      icon: _I.armor("common/elf/elf_boots_12.png")
    },
    "Elven Soft-Sole Boots": {
      description: "Paper-thin soled boots designed for forest stealth — every footfall as quiet as settling snow.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 1.0, value: 14,
      icon: _I.armor("common/elf/elf_boots_17.png")
    },
    "Ancient Elven Boots": {
      description: "Boots preserved by elven enchantment — unchanged in appearance for centuries, yet perfectly fitted to the current wearer.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 6 },
      weight: 1.5, value: 28,
      icon: _I.armor("common/elf/elf_boots_19.png")
    },
    "Whisperfoot Boots": {
      description: "Enchanted elven boots that muffle all sound from the wearer's footsteps — prized by rangers and assassins alike.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 1.0, value: 24,
      icon: _I.armor("common/elf/elf_boots_20.png")
    },
    "Elven Scout Boots": {
      description: "Boots designed for long-range scouts — flexible enough for climbing, protective enough for a skirmish.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 1.0, value: 18,
      icon: _I.armor("common/elf/elf_boots_21.png")
    },
    "Elven War Boots": {
      description: "Heavier elven boots reinforced for battlefield use — still far lighter than anything a dwarf would call armour.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 7 },
      weight: 2.0, value: 35,
      icon: _I.armor("common/elf/elf_boots_50.png")
    },
    "Elven Leather Chest": {
      description: "A chest piece of layered elven leather — cut and shaped to allow a full draw of a longbow without restriction.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 7 },
      weight: 4.0, value: 24,
      icon: _I.armor("common/elf/elf_chest_42.png")
    },
    "Sylvan Cuirass": {
      description: "A shaped cuirass of hardened sylvan leather, reinforced at the ribs — the signature chest piece of elven forest wardens.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 9 },
      weight: 4.5, value: 30,
      icon: _I.armor("common/elf/elf_chest_43.png")
    },
    "Ancient Elven Chest": {
      description: "A breastplate of elven make so old that the leather has hardened to the density of iron — yet it weighs almost nothing.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 11 },
      weight: 4.0, value: 42,
      icon: _I.armor("common/elf/elf_chest_44.png")
    },
    "Elven Shadow Pauldrons": {
      description: "Shoulder armour dyed in deep shadow tones — designed to break up the wearer's silhouette at dusk.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 2.0, value: 20,
      icon: _I.armor("common/elf/elf_dark_shoulder.png")
    },
    "Dragonscale Elven Gloves": {
      description: "Elven gloves reinforced with true dragonscale — feather-light but nearly impervious to blade or flame.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 6 },
      weight: 1.0, value: 35,
      icon: _I.armor("common/elf/elf_dragon_gloves.png")
    },
    "Elven Archery Gloves": {
      description: "Fingerless leather gloves designed to protect the draw hand from bowstring snap — standard gear for elven archers.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 0.5, value: 10,
      icon: _I.armor("common/elf/elf_gloves_01.png")
    },
    "Sylvan Leather Gloves": {
      description: "Gloves of soft sylvan leather — protect the hands while preserving the touch sensitivity needed for fine elven craftsmanship.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 0.5, value: 14,
      icon: _I.armor("common/elf/elf_gloves_04.png")
    },
    "Elven Guard Gauntlets": {
      description: "Light gauntlets worn by elven city guards — offer genuine protection without sacrificing the speed needed to draw a blade.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 1.0, value: 18,
      icon: _I.armor("common/elf/elf_gloves_07.png")
    },
    "Moonweave Gloves": {
      description: "Gloves woven from moonweave thread — cool to the touch and said to improve the wearer's accuracy after dark.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 0.5, value: 22,
      icon: _I.armor("common/elf/elf_gloves_08.png")
    },
    "Ancient Elven Gloves": {
      description: "Gloves of extraordinary antiquity — the leather is so well preserved they feel freshly made, yet they bear the weight of age.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 5 },
      weight: 0.5, value: 28,
      icon: _I.armor("common/elf/elf_gloves_10.png")
    },
    "Elven Battle Gauntlets": {
      description: "Full gauntlets of elven make — heavier than typical elven gear but still light enough for a seasoned archer.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 5 },
      weight: 1.0, value: 30,
      icon: _I.armor("common/elf/elf_gloves_11.png")
    },
    "Elven Shadowstrike Gloves": {
      description: "Dark elven gloves with reinforced knuckles — the preferred choice of elven assassins and shadow agents.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 6 },
      weight: 0.5, value: 35,
      icon: _I.armor("common/elf/elf_gloves_12.png")
    },
    "Elven Padded Gambeson": {
      description: "A padded gambeson in elven cut — thinner than human versions but layered with materials that absorb impact surprisingly well.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 3.0, value: 18,
      icon: _I.armor("common/elf/elf_padded_gambeson.png")
    },
    "Elven Leather Trousers": {
      description: "Standard elven leather trousers — worn daily by rangers and woodland folk who need both mobility and light protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 2.0, value: 14,
      icon: _I.armor("common/elf/elf_pants_14.png")
    },
    "Sylvan Trousers": {
      description: "Trousers cut from sylvan leather — forest-dyed to blend with the undergrowth of elven homelands.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 2.0, value: 18,
      icon: _I.armor("common/elf/elf_pants_15.png")
    },
    "Elven Guard Trousers": {
      description: "Reinforced trousers worn by elven city sentinels — extra panels at the thigh and knee offer added protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 2.5, value: 24,
      icon: _I.armor("common/elf/elf_pants_16.png")
    },
    "Moonweave Trousers": {
      description: "Leg armour woven from moonweave — the silver thread gleams faintly at night and seems to repel minor cuts.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 1.5, value: 28,
      icon: _I.armor("common/elf/elf_pants_18.png")
    },
    "Ancient Elven Trousers": {
      description: "Trousers of ancient elven leather — centuries old but perfectly preserved, as if time itself respects their craftsmanship.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 7 },
      weight: 2.0, value: 35,
      icon: _I.armor("common/elf/elf_pants_25.png")
    },
    "Elven War Trousers": {
      description: "Heavy elven leg armour built for extended campaigns — reinforced along every edge and seam.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 8 },
      weight: 2.5, value: 42,
      icon: _I.armor("common/elf/elf_pants_27.png")
    },
    "Elven Leather Pauldrons": {
      description: "Simple leather pauldrons of elven make — lightweight and unobtrusive, often worn over civilian clothing.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 1.5, value: 14,
      icon: _I.armor("common/elf/elf_shoulder_08.png")
    },
    "Sylvan Pauldrons": {
      description: "Shoulder guards of layered sylvan leather — shaped to direct glancing blows away from the neck.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 1.5, value: 20,
      icon: _I.armor("common/elf/elf_shoulder_09.png")
    },
    "Ancient Elven Pauldrons": {
      description: "Shoulder armour of elven antiquity — the hardened leather has the texture of carved wood and the durability to match.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 6 },
      weight: 2.0, value: 28,
      icon: _I.armor("common/elf/elf_shoulder_11.png")
    },
    "Elven Reinforced Gambeson": {
      description: "A thicker elven gambeson layered with hardened inner panels — stops arrows that would punch through lesser fabric armour.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 3.5, value: 26,
      icon: _I.armor("common/elf/elf_thick_gambeson.png")
    },

    // ── Human ──
    "Iron-Shod Boots": {
      description: "Sturdy leather boots capped with iron at toe and heel — standard footwear for soldiers who march on stone.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/human/human_boots_01.png")
    },
    "Soldier's Boots": {
      description: "Well-worn infantry boots with reinforced ankles — issued to common soldiers and rarely replaced until they fall apart.",
      type: "armor", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/human/human_boots_02.png")
    },
    "Guard Boots": {
      description: "Heavier boots issued to city guards — thick sole and reinforced leather, built for standing watch on cold stone.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 3.5, value: 18,
      icon: _I.armor("common/human/human_boots_03.png")
    },
    "Knight Boots": {
      description: "Articulated leather and iron boots worn by mounted knights — allow stirrup use without sacrificing ankle protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 4.0, value: 28,
      icon: _I.armor("common/human/human_boots_04.png")
    },
    "Ranger's Boots": {
      description: "Tall leather boots designed for wilderness travel — waterproofed hide and a flexible sole suited to uneven ground.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 2.5, value: 16,
      icon: _I.armor("common/human/human_boots_05.png")
    },
    "Militia Boots": {
      description: "Cheap boots handed out to newly conscripted militia — functional enough to march in, nothing more.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 3.0, value: 10,
      icon: _I.armor("common/human/human_boots_06.png")
    },
    "Heavy Infantry Boots": {
      description: "Thick-soled iron-reinforced boots favoured by heavy infantry — every step leaves a mark in soft ground.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 4.5, value: 26,
      icon: _I.armor("common/human/human_boots_16.png")
    },
    "War Boots": {
      description: "Battle-tested boots worn by veteran soldiers — scuffed from use but structurally sound and reliable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 4.0, value: 26,
      icon: _I.armor("common/human/human_boots_18.png")
    },
    "Campaign Boots": {
      description: "Boots made for long campaigns — extra padding at the heel and ankle, designed for weeks of continuous use.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 3.5, value: 22,
      icon: _I.armor("common/human/human_boots_24.png")
    },
    "Steel-Capped Boots": {
      description: "Sturdy boots with solid steel toecaps — preferred by fighters who like to end arguments with their feet.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 4.5, value: 30,
      icon: _I.armor("common/human/human_boots_36.png")
    },
    "Cavalier Boots": {
      description: "Tall riding boots reaching the knee — smart enough for a lord's hall, sturdy enough for the battlefield.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 4.0, value: 28,
      icon: _I.armor("common/human/human_boots_37.png")
    },
    "Commander's Boots": {
      description: "Fine boots worn by field commanders — polished iron toecap and reinforced calf, combining authority with protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 7 },
      weight: 4.5, value: 45,
      icon: _I.armor("common/human/human_boots_39.png")
    },
    "Footman's Greaves": {
      description: "Leather and iron greaves strapped over boots — standard issue for footmen who expect to hold a shield wall.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 4.0, value: 20,
      icon: _I.armor("common/human/human_boots_40.png")
    },
    "Hardened Leather Boots": {
      description: "Boots made from triple-tanned leather — stiff but incredibly resistant to puncture and abrasion.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 3.5, value: 24,
      icon: _I.armor("common/human/human_boots_42.png")
    },
    "Iron Sabatons": {
      description: "Full iron foot armour covering instep and toes — cumbersome on rough ground, but excellent in formed battle lines.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 5.0, value: 32,
      icon: _I.armor("common/human/human_boots_43.png")
    },
    "Plated Sabatons": {
      description: "Articulated steel sabatons worn by heavy cavalry — each joint is precision-fitted to allow a full range of motion.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 8 },
      weight: 5.5, value: 48,
      icon: _I.armor("common/human/human_boots_45.png")
    },
    "Noble's Riding Boots": {
      description: "Tall, finely stitched leather boots worn by nobles and wealthy officers — impractical for fighting on foot, but unmistakably prestigious.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 5 },
      weight: 3.0, value: 55,
      icon: _I.armor("common/human/human_boots_49.png")
    },
    "Speed Boots": {
      description: "Featherweight boots reinforced with sprung steel insoles — built for scouts who need to outrun anything they can't outfight.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 5 },
      weight: 2.0, value: 50,
      icon: _I.armor("common/human/human_speed_boots.png")
    },
    "Paladin's Sabatons": {
      description: "Blessed iron sabatons inscribed with holy sigils — worn by paladins who vow to stand until the last.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 8 },
      weight: 5.5, value: 60,
      icon: _I.armor("common/human/human_paladin_boots.png")
    },
    "Mail Boots": {
      description: "Sturdy boots fitted with an iron plate on the foot — part of a standard human mail set.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 3.5, value: 18,
      icon: _I.armor("common/human/human_boots_s.png")
    },
    "Brigandine Chest": {
      description: "A coat of small iron plates riveted inside heavy cloth — flexible enough for the battlefield, protective enough to matter.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 10 },
      weight: 8.0, value: 32,
      icon: _I.armor("common/human/human_brigandine.png")
    },
    "Heavy Brigandine": {
      description: "A denser brigandine with larger iron plates — heavier than the standard issue but markedly more resilient against lance and sword.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 12 },
      weight: 10.0, value: 42,
      icon: _I.armor("common/human/human_brigandine_2.png")
    },
    "Iron Breastplate": {
      description: "A formed iron breastplate — the workhorse of human heavy infantry, offering solid torso protection at a reasonable cost.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 10 },
      weight: 9.0, value: 30,
      icon: _I.armor("common/human/human_chest_21.png")
    },
    "Guard's Chest": {
      description: "A reinforced chest piece worn by town guards — heavier than leather but lighter than full plate, a practical middle ground.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 11 },
      weight: 9.5, value: 34,
      icon: _I.armor("common/human/human_chest_22.png")
    },
    "Knight's Cuirass": {
      description: "A polished iron cuirass shaped for a mounted knight — engraved with a house crest and fitted to be worn over a hauberk.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 13 },
      weight: 11.0, value: 48,
      icon: _I.armor("common/human/human_chest_45.png")
    },
    "War Chest": {
      description: "A heavy iron chest piece scored with the marks of old battles — whatever it endured, it held.",
      type: "armor", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 12 },
      weight: 10.5, value: 36,
      icon: _I.armor("common/human/human_chest_47.png")
    },
    "Steel Breastplate": {
      description: "A well-forged steel breastplate — superior to iron in every measure, worn by professional soldiers and mercenary veterans.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 14 },
      weight: 11.0, value: 52,
      icon: _I.armor("common/human/human_chest_66.png")
    },
    "Officer's Breastplate": {
      description: "A polished breastplate with decorative engraving around the collar — worn by officers who wish to be seen as well as protected.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 13 },
      weight: 10.5, value: 58,
      icon: _I.armor("common/human/human_chest_68.png")
    },
    "Warlord's Breastplate": {
      description: "Thick, imposing iron armour worn by warlords and battle captains — the dents in the surface speak louder than any title.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 14 },
      weight: 12.0, value: 60,
      icon: _I.armor("common/human/human_chest_69.png")
    },
    "Heavy Plate Chest": {
      description: "Full heavy plate covering the entire torso — cumbersome to put on, virtually impossible to cut through.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 15 },
      weight: 13.0, value: 65,
      icon: _I.armor("common/human/human_chest_70.png")
    },
    "Champion's Cuirass": {
      description: "A master-forged cuirass awarded to tournament champions — quality far above any standard military issue.",
      type: "armor", consumable: false, wearable: true,
      condition: "Excellent", burnTime: 0, rarity: "Epic",
      baseEffect: { defense: 16 },
      weight: 12.0, value: 85,
      icon: _I.armor("common/human/human_chest_72.png")
    },
    "Battle-Scarred Chest": {
      description: "A chest piece bearing deep scars from countless battles — it shouldn't still be wearable, but somehow it holds.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 11 },
      weight: 10.0, value: 28,
      icon: _I.armor("common/human/human_chest_75.png")
    },
    "Reinforced Mail Chest": {
      description: "A human chainmail hauberk with additional iron plates at the shoulders and sternum — layered protection for brutal close-quarters fighting.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 12 },
      weight: 10.5, value: 38,
      icon: _I.armor("common/human/human_chest_76.png")
    },
    "Red Mail Chest": {
      description: "Chainmail of distinctive red-lacquered rings — worn by members of a mercenary company known as the Crimson Coil.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 10 },
      weight: 9.0, value: 34,
      icon: _I.armor("common/human/human_mail_chest_red.png")
    },
    "Scout's Chest": {
      description: "A lightweight chest piece used by scouts — minimal bulk, maximum movement, enough protection to survive an ambush long enough to run.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 8 },
      weight: 5.5, value: 22,
      icon: _I.armor("common/human/human_scout_chest.png")
    },
    "Warchief's Chest": {
      description: "Massive iron chest armour bearing the markings of a tribal warchief — it communicates power before the battle even begins.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Epic",
      baseEffect: { defense: 16 },
      weight: 14.0, value: 90,
      icon: _I.armor("common/human/human_warchief_chest.png")
    },
    "Plate Armour": {
      description: "A full plate chest piece — the pinnacle of human armoury craft, offering unmatched protection at the cost of considerable weight.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 15 },
      weight: 13.0, value: 65,
      icon: _I.armor("common/human/human_platemail_chest.png")
    },
    "Heavy Plate Armour": {
      description: "The heaviest plate chest available to human smiths — requires a squire to don, but stops almost anything short of a siege weapon.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 16 },
      weight: 14.0, value: 70,
      icon: _I.armor("common/human/human_platemail_chest_2.png")
    },
    "Basic Iron Helm": {
      description: "The most rudimentary iron helm — just enough metal to protect the skull from a glancing blow.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/human/human_basic_helm.png")
    },
    "Basic Mail Helm": {
      description: "A simple iron cap with a mail curtain — provides decent coverage of the head and neck for the price.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 3.0, value: 16,
      icon: _I.armor("common/human/human_basic_mail_helm.png")
    },
    "Crested Mail Helm": {
      description: "A mail helm with a distinctive iron crest along the crown — practical protection with a hint of rank.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 7 },
      weight: 3.5, value: 20,
      icon: _I.armor("common/human/human_basic_mail_helm_2.png")
    },
    "Broken Helm": {
      description: "A badly dented iron helm with a cracked face guard — near-useless as protection, but perhaps someone could repair it.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 3.0, value: 3,
      icon: _I.armor("common/human/human_broken_helm.png")
    },
    "Iron War Helm": {
      description: "A battle-worn iron helm with a broad nasal guard — standard military issue for infantry, heavily dented but functional.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 7 },
      weight: 3.5, value: 18,
      icon: _I.armor("common/human/human_helm_13.png")
    },
    "Soldier's War Helm": {
      description: "A full-coverage iron helm with cheek guards — the mark of a seasoned soldier who has learned to protect every inch of his face.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 },
      weight: 4.0, value: 26,
      icon: _I.armor("common/human/human_helm_23.png")
    },
    "Heavy War Helm": {
      description: "A chunky iron helm with reinforced brow plate — heavy, but the kind of heavy that saves lives.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 9 },
      weight: 4.5, value: 32,
      icon: _I.armor("common/human/human_helm_44.png")
    },
    "Great War Helm": {
      description: "A full great helm with vision slits — offers near-complete head coverage, at the cost of some peripheral vision.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 10 },
      weight: 5.0, value: 44,
      icon: _I.armor("common/human/human_helm_45.png")
    },
    "Battle-Worn Helm": {
      description: "A helm that has seen too many campaigns — repaired with mismatched metal, but still holding together through sheer stubbornness.",
      type: "armor", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 7 },
      weight: 3.5, value: 16,
      icon: _I.armor("common/human/human_helm_51.png")
    },
    "Crusader Helm": {
      description: "A flat-topped iron helm with a full face guard and cross motif — worn by crusading knights on holy campaigns.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 10 },
      weight: 5.0, value: 50,
      icon: _I.armor("common/human/human_crusader_helm.png")
    },
    "Footman's Helm": {
      description: "A rounded iron helm with ear guards — the most common helm in any human army, simple and dependable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 7 },
      weight: 3.5, value: 18,
      icon: _I.armor("common/human/human_footman_helm.png")
    },
    "Knight Helm": {
      description: "A visored iron helm fitted for a mounted knight — the visor can be raised for command and lowered for the charge.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 11 },
      weight: 5.5, value: 55,
      icon: _I.armor("common/human/human_knight_helm.png")
    },
    "Iron Cap": {
      description: "A simple rounded iron cap — the cheapest protection a man can put on his head before marching into danger.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 3.0, value: 15,
      icon: _I.armor("common/human/human_metal_helmet_4.png")
    },
    "Gilded Iron Cap": {
      description: "An iron cap with gold plating around the brim — worn by minor nobles who want to look important without the discomfort of a full helm.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 3.5, value: 35,
      icon: _I.armor("common/human/human_metal_helmet_gold.png")
    },
    "Monastic Robe": {
      description: "A heavy woollen robe worn by monks and travelling clergy — offers minimal protection but marks the wearer as a person of faith.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 2.0, value: 10,
      icon: _I.armor("common/human/human_monastic_robe.png")
    },
    "Wanderer's Helm": {
      description: "A battered iron helm with a broad brim — worn by lone wanderers who need shade as much as protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/human/human_wanderer_helm.png")
    },
    "Iron Pauldrons": {
      description: "Basic iron shoulder guards — standard issue for human infantry, providing solid coverage of the shoulder joint.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/human/human_shoulder_01.png")
    },
    "Guard Pauldrons": {
      description: "Reinforced shoulder guards worn by city guards — slightly larger than standard infantry issue to accommodate the long hours of standing watch.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 3.5, value: 18,
      icon: _I.armor("common/human/human_shoulder_02.png")
    },
    "Knight Pauldrons": {
      description: "Articulated iron pauldrons fitted for a knight — shaped to deflect lance strikes and sword cuts away from the neck.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 4.0, value: 28,
      icon: _I.armor("common/human/human_shoulder_03.png")
    },
    "Heavy Pauldrons": {
      description: "Massive iron shoulder guards that extend to cover the upper arm — cumbersome, but they stop most overhead strikes cold.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 8 },
      weight: 5.0, value: 42,
      icon: _I.armor("common/human/human_shoulder_04.png")
    },
    "Mail Set Boots": {
      description: "Iron-linked mail boots forming part of a standard human mail set — heavy but dependably protective.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 3.5, value: 18,
      icon: _I.armor("common/human/human_mail2_boots.png")
    },
    "Mail Set Bracers": {
      description: "Chainmail bracers from a standard human mail set — protect the forearms without restricting sword grip.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 2.0, value: 12,
      icon: _I.armor("common/human/human_mail2_bracers.png")
    },
    "Mail Set Gauntlets": {
      description: "Chainmail gloves from a standard human mail set — linked rings cover the back of the hand and knuckles.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 2.0, value: 12,
      icon: _I.armor("common/human/human_mail2_gloves.png")
    },
    "Mail Set Coif": {
      description: "A chainmail coif from a standard human mail set — fits under an iron helm or worn alone in lighter skirmishes.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 2.5, value: 14,
      icon: _I.armor("common/human/human_mail2_head.png")
    },
    "Mail Set Pauldrons": {
      description: "Chainmail shoulder guards from a standard human mail set — the most common shoulder armour in any human militia.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/human/human_mail2_shoulder.png")
    },
    "Heavy Mail Boots": {
      description: "Heavier mail boots from an upgraded human mail set — additional iron plates reinforce the sole and ankle.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 4.5, value: 26,
      icon: _I.armor("common/human/human_mail3_boots.png")
    },
    "Heavy Mail Bracers": {
      description: "Reinforced mail bracers with an iron plate over the wrist — part of a heavier human mail set.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 2.5, value: 18,
      icon: _I.armor("common/human/human_mail3_bracers.png")
    },
    "Heavy Mail Chest": {
      description: "A reinforced mail haubergeon with iron plates riveted at the chest — a step up from standard chainmail for soldiers who can afford it.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 13 },
      weight: 11.0, value: 40,
      icon: _I.armor("common/human/human_mail3_chest.png")
    },
    "Heavy Mail Gauntlets": {
      description: "Iron-plated mail gauntlets from the heavy human mail set — cover the knuckles with solid iron plates.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 2.5, value: 18,
      icon: _I.armor("common/human/human_mail3_gloves.png")
    },
    "Heavy Mail Coif": {
      description: "A reinforced mail coif with an iron brow plate — better head coverage than a standard coif, often worn without a separate helm.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 },
      weight: 3.5, value: 24,
      icon: _I.armor("common/human/human_mail3_head.png")
    },
    "Heavy Mail Pauldrons": {
      description: "Reinforced mail shoulders with iron plates — part of the heavier human mail set worn by professional soldiers.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 4.0, value: 22,
      icon: _I.armor("common/human/human_mail3_shoulder.png")
    },
    "Mail Greaves": {
      description: "Chainmail leg armour from a standard human mail set — covers knee to ankle with interlinked iron rings.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 5.0, value: 20,
      icon: _I.armor("common/human/mail2_Pants.png")
    },
    "Heavy Mail Greaves": {
      description: "Reinforced mail leg armour from the heavier human mail set — iron plates protect the knees from direct blows.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 },
      weight: 6.0, value: 30,
      icon: _I.armor("common/human/mail3_Pants.png")
    },

    // ── Cloth Sets ──
    "Cloth Boots": {
      description: "Simple cloth wrappings and light soles — better than bare feet, barely.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.5, value: 4,
      icon: _I.armor("common/all/common_cloth1_boots.png")
    },
    "Cloth Bracers": {
      description: "Thin cloth wraps around the wrists — offer minimal protection but cost next to nothing.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.3, value: 3,
      icon: _I.armor("common/all/common_cloth1_bracers.png")
    },
    "Cloth Tunic": {
      description: "A plain cloth tunic — the most basic of upper body coverings, worn by peasants and labourers alike.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.5, value: 5,
      icon: _I.armor("common/all/common_cloth1_chest.png")
    },
    "Cloth Gloves": {
      description: "Thin cloth gloves — keep the hands clean and offer the barest sliver of protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.3, value: 3,
      icon: _I.armor("common/all/common_cloth1_gloves.png")
    },
    "Cloth Hood": {
      description: "A soft cloth hood — keeps the head warm and out of the wind on dreary days.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.5, value: 4,
      icon: _I.armor("common/all/common_cloth1_head.png")
    },
    "Cloth Trousers": {
      description: "Basic cloth trousers — standard legwear for those who cannot afford leather.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 4,
      icon: _I.armor("common/all/common_cloth1_pants.png")
    },
    "Reinforced Cloth Boots": {
      description: "Cloth boots with extra layers stitched at the toe and heel — a step up from bare cloth.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 0.8, value: 7,
      icon: _I.armor("common/all/common_cloth10_boots.png")
    },
    "Padded Cloth Boots": {
      description: "Cloth boots stuffed with wool batting — warm underfoot and cushioned against hard roads.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 0.8, value: 7,
      icon: _I.armor("common/all/common_cloth11_boots.png")
    },
    "Padded Cloth Bracers": {
      description: "Wrist wraps padded with extra fabric — cheap arm protection for those on a tight budget.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 0.4, value: 5,
      icon: _I.armor("common/all/common_cloth11_bracers.png")
    },
    "Padded Cloth Gloves": {
      description: "Gloves with a thick padded lining — offer a surprising amount of grip and a little cushion against blows.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 0.4, value: 5,
      icon: _I.armor("common/all/common_cloth11_gloves.png")
    },
    "Padded Cloth Trousers": {
      description: "Thick padded trousers — the extra layers slow a blade and keep the cold out on long journeys.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.0, value: 6,
      icon: _I.armor("common/all/common_cloth11_pants.png")
    },
    "Fine Cloth Boots": {
      description: "Well-cut cloth boots with quality stitching — favoured by travelling merchants and minor nobility.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 },
      weight: 0.7, value: 9,
      icon: _I.armor("common/all/common_cloth13_boots.png")
    },

    // ── Leather Sets ──
    "Worn Leather Boots": {
      description: "Old leather boots, cracked at the toe and worn thin at the heel — seen better days, but still wearable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 2.0, value: 8,
      icon: _I.armor("common/all/common_leather_boots_2.png")
    },
    "Traveller's Boots": {
      description: "Well-worn leather boots built for the long road — sturdy soles and ankle support for mile after mile.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 2.0, value: 12,
      icon: _I.armor("common/all/common_leather_boots_3.png")
    },
    "Worn Leather Chest": {
      description: "A battered leather chest piece — the straps are fraying and the hide is cracked, but it still turns a glancing blow.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 4.5, value: 12,
      icon: _I.armor("common/all/common_leather_chest_1.png")
    },
    "Patched Leather Chest": {
      description: "A leather chest piece with visible patches sewn over old damage — repaired enough to offer decent protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Fair", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 5.0, value: 14,
      icon: _I.armor("common/all/common_leather_chest_2.png")
    },
    "Reinforced Leather Chest": {
      description: "A leather chest piece with iron rivets hammered across the surface — extra reinforcement where it counts most.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 5.5, value: 20,
      icon: _I.armor("common/all/common_leather_chest_48.png")
    },
    "Leather Belt": {
      description: "A plain leather belt — holds things in place and adds a token bit of protection to the midsection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.5, value: 4,
      icon: _I.armor("common/all/common_leather1_belt.png")
    },
    "Soft Leather Boots": {
      description: "Supple leather boots that move quietly — favoured by scouts and hunters who prefer stealth over stomp.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 2.0, value: 12,
      icon: _I.armor("common/all/common_leather1_boots.png")
    },
    "Leather Wrist Guards": {
      description: "Firm leather bands strapped around the wrists — protect against weapon deflections and rope burns.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 0.8, value: 8,
      icon: _I.armor("common/all/common_leather1_bracers.png")
    },
    "Leather Skullcap": {
      description: "A close-fitting leather cap — gives the head a fighting chance against low branches and light bludgeons.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 1.2, value: 10,
      icon: _I.armor("common/all/common_leather1_head.png")
    },
    "Leather Breeches": {
      description: "Tough leather trousers cut for easy movement — standard issue for rangers and mounted scouts.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 2.5, value: 12,
      icon: _I.armor("common/all/common_leather1_pants.png")
    },
    "Leather Shoulder Pad": {
      description: "A single leather pad strapped to the shoulder — asymmetric protection for those who favour a shield hand.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.5, value: 8,
      icon: _I.armor("common/all/common_leather1_shoulder.png")
    },
    "Reinforced Wrist Guards": {
      description: "Leather wrist guards with added iron bands — serious forearm protection for those who take blocking seriously.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 1.0, value: 14,
      icon: _I.armor("common/all/common_leather10_bracers.png")
    },
    "Studded Leather Chest": {
      description: "A leather chest piece bristling with iron studs — the studs catch and deflect blade edges effectively.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 5.5, value: 22,
      icon: _I.armor("common/all/common_leather10_chest.png")
    },
    "Studded Leather Gloves": {
      description: "Leather gloves with iron studs across the knuckles — doubles as light armour and a persuasive conversation starter.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 3 },
      weight: 0.8, value: 12,
      icon: _I.armor("common/all/common_leather10_gloves.png")
    },
    "Studded Shoulder Guard": {
      description: "A shoulder piece of hardened leather set with iron studs — intimidating and functional.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 2.0, value: 14,
      icon: _I.armor("common/all/common_leather10_shoulder.png")
    },
    "Studded Leather Pants": {
      description: "Leather trousers reinforced with rows of iron studs down the thigh — protection without sacrificing stride.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 2.5, value: 14,
      icon: _I.armor("common/all/common_leather11_pants.png")
    },
    "Wilderness Ranger's Boots": {
      description: "Lightweight leather boots designed for long wilderness treks — grip on rock and grip on mud alike.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 2.0, value: 18,
      icon: _I.armor("common/all/common_leather14_boots.png")
    },
    "Ranger's Bracers": {
      description: "Hardened leather bracers worn by rangers — protect the forearms from bramble, bowstring, and blade.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 1.0, value: 14,
      icon: _I.armor("common/all/common_leather14_bracers.png")
    },
    "Thick Leather Bracers": {
      description: "Double-layered leather bracers — bulkier than most but their thickness turns aside light cuts with ease.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 1.0, value: 10,
      icon: _I.armor("common/all/common_leather2_bracers.png")
    },
    "Thick Leather Chest": {
      description: "A chest piece cut from double-thickness hide — heavier than most leather armour but noticeably tougher.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 5.5, value: 18,
      icon: _I.armor("common/all/common_leather2_chest.png")
    },
    "Leather Cap": {
      description: "A soft leather cap that sits low over the brow — modest protection, often worn by labourers and junior guards.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.0, value: 8,
      icon: _I.armor("common/all/common_leather3_head.png")
    },
    "Rugged Leather Boots": {
      description: "Thick-soled boots of hardened leather — built for rough terrain and long patrols.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 2.5, value: 16,
      icon: _I.armor("common/all/common_leather5_boots.png")
    },
    "Hardened Leather Bracers": {
      description: "Bracers of heat-hardened leather — stiff enough to deflect arrow shafts without binding the wrists.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 1.0, value: 14,
      icon: _I.armor("common/all/common_leather9_bracers.png")
    },

    // ── Mail Pieces ──
    "Light Chainmail Belt": {
      description: "A lighter chainmail girdle reinforcing the lower torso — worn over a gambeson for added protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 1.5, value: 12,
      icon: _I.armor("common/all/common_mail15_belt.png")
    },
    "Chainmail Shoulder Guard": {
      description: "A draped section of chainmail protecting the shoulder — links together with most armour sets.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/all/common_mail6_shoulder.png")
    },
    "Metal Bracers": {
      description: "Solid metal forearm guards — heavier than leather but offer serious protection to the arms.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 2.0, value: 16,
      icon: _I.armor("common/all/common_metal_bracers.png")
    },

    // ── Plate / Cuirass ──
    "Hardened Chest Piece": {
      description: "A chest piece of hardened iron — not quite a full cuirass, but it absorbs punishment effectively.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 9 },
      weight: 8.0, value: 28,
      icon: _I.armor("common/all/common_chest_49.png")
    },
    "Red Painted Cuirass": {
      description: "A solid iron cuirass painted deep red — military issue for veteran soldiers who have earned the colour.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 10 },
      weight: 9.0, value: 32,
      icon: _I.armor("common/all/common_cuirass_red.png")
    },
    "Yellow Painted Cuirass": {
      description: "A solid iron cuirass painted bright yellow — marks the wearer as belonging to a specific unit or lord's colours.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 10 },
      weight: 9.0, value: 32,
      icon: _I.armor("common/all/common_cuirass_yellow.png")
    },
    "Plate Leg Guards": {
      description: "Heavy plate armour for the legs — greaves and cuisses that protect the thighs and shins from serious blows.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 8 },
      weight: 6.5, value: 28,
      icon: _I.armor("common/all/common_plate_legs_2.png")
    },
    "Spearman's Helm": {
      description: "A rounded iron helmet with neck guard — standard headgear for spearmen and light infantry.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 6 },
      weight: 3.5, value: 18,
      icon: _I.armor("common/all/common_spearman_helm_2.png")
    },
    "Town Guard Helm": {
      description: "A plain iron helmet issued to town guards — functional but unadorned, dented from routine patrol duty.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/all/common_inhabitant_helm.png")
    },

    // ── Shoulder / Back / Bracer Pieces ──
    "Leather Back Plate": {
      description: "A back-mounted leather plate — guards the spine in skirmishes where turning your back is unavoidable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 2.0, value: 10,
      icon: _I.armor("common/all/common_back_09.png")
    },
    "Padded Back Guard": {
      description: "A padded guard strapped across the back — absorbs impact and distributes load from a pack.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 2.5, value: 14,
      icon: _I.armor("common/all/common_back_10.png")
    },
    "Reinforced Back Plate": {
      description: "A hardened back plate with iron strips — serious rear-guard protection for those fighting in close formations.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 3.0, value: 18,
      icon: _I.armor("common/all/common_back_11.png")
    },
    "Iron-Banded Bracer": {
      description: "A leather bracer bound with iron bands — a common upgrade for militia soldiers wanting more forearm protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 1.2, value: 12,
      icon: _I.armor("common/all/common_bracer_03.png")
    },
    "Guard's Bracer": {
      description: "A well-made bracer issued to city guards — sturdy iron banding over thick leather.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 1.5, value: 16,
      icon: _I.armor("common/all/common_bracer_06.png")
    },
    "Officer's Bracer": {
      description: "A polished bracer worn by military officers — a symbol of rank as much as a piece of armour.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 1.5, value: 20,
      icon: _I.armor("common/all/common_bracer_07.png")
    },
    "Earthen Pauldrons": {
      description: "Shoulder guards fashioned from hardened clay and leather — crude in appearance but surprisingly effective.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 3.0, value: 16,
      icon: _I.armor("common/all/common_earth_shoulder.png")
    },
    "Plain Pauldrons": {
      description: "Simple shoulder plates of hammered iron — unadorned and practical.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 2.5, value: 10,
      icon: _I.armor("common/all/common_shoulder_15.png")
    },
    "Iron-Bolted Shoulder": {
      description: "Shoulder plates secured with iron bolts — sturdier than plain riveted versions.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 3.0, value: 14,
      icon: _I.armor("common/all/common_shoulder_16.png")
    },
    "Garrison Pauldrons": {
      description: "Standard-issue pauldrons for city watch and garrison soldiers — reliable and interchangeable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 3.5, value: 18,
      icon: _I.armor("common/all/common_shoulder_25.png")
    },
    "Thick Iron Pauldrons": {
      description: "Thick iron shoulder plates — the extra weight is an acceptable trade for the protection they provide.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 4.0, value: 22,
      icon: _I.armor("common/all/common_shoulder_26.png")
    },
    "Plate Pauldrons": {
      description: "Full plate shoulder armour — broad coverage that deflects downward cuts from mounted opponents.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 4.5, value: 28,
      icon: _I.armor("common/all/common_shoulder_39.png")
    },
    "Spiked Pauldrons": {
      description: "Shoulder guards fitted with outward-facing iron spikes — discourage grappling and look fearsome in formation.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 7 },
      weight: 4.5, value: 28,
      icon: _I.armor("common/all/common_shoulder_41.png")
    },
    "Champion Pauldrons": {
      description: "Elaborately crafted pauldrons bearing decorative crests — worn by champions and tournament knights.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: { defense: 8 },
      weight: 5.0, value: 36,
      icon: _I.armor("common/all/common_shoulder_42.png")
    },

    // ── Gloves ──
    "Archer's Shooting Gloves": {
      description: "Fingerless gloves reinforced at the draw fingers — protect the hand while allowing a clean bowstring release.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.4, value: 6,
      icon: _I.armor("common/all/common_archer_gloves.png")
    },
    "Leather Work Gloves": {
      description: "Thick leather gloves worn by smiths and labourers — protect against heat, splinters, and minor scrapes.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 0.5, value: 7,
      icon: _I.armor("common/all/common_gloves_17.png")
    },
    "Padded Gloves": {
      description: "Gloves padded with layered cloth — cushion the hands against impact and provide modest armour.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 0.6, value: 10,
      icon: _I.armor("common/all/common_gloves_23.png")
    },
    "Guard's Gauntlets": {
      description: "Leather gauntlets with reinforced knuckles — issued to city guards who need a firm but flexible hand.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 1.0, value: 14,
      icon: _I.armor("common/all/common_gloves_24.png")
    },
    "Iron Gauntlets": {
      description: "Gauntlets with iron plates over the fingers and back of the hand — serious hand protection for serious fighters.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 5 },
      weight: 1.5, value: 18,
      icon: _I.armor("common/all/common_gloves_25.png")
    },
    "Heavy Gauntlets": {
      description: "Full iron gauntlets covering wrist to fingertip — clumsy for fine work but superb in battle.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 6 },
      weight: 2.0, value: 24,
      icon: _I.armor("common/all/common_gloves_27.png")
    },
    "Fingerless Gloves": {
      description: "Thin gloves with the finger tips cut away — allow precise work while keeping the palms protected.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.3, value: 4,
      icon: _I.armor("common/all/common_hands_s1.png")
    },

    // ── Pants / Legs ──
    "Classic Trousers": {
      description: "Neatly cut trousers of medium-weight fabric — the sort worn by craftsmen and travelling merchants.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.5, value: 6,
      icon: _I.armor("common/all/common_classic_pants.png")
    },
    "Green Wool Trousers": {
      description: "Warm wool trousers dyed a forest green — comfortable and blending well in wooded terrain.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.5, value: 6,
      icon: _I.armor("common/all/common_green_pants.png")
    },
    "Dark Green Trousers": {
      description: "Trousers of dark green fabric — favoured by foresters and those who spend time in the shadows of the wood.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.5, value: 6,
      icon: _I.armor("common/all/common_green_pants_2.png")
    },
    "Plain Linen Trousers": {
      description: "Unbleached linen trousers — the most basic legwear a person can own.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 1.0, value: 4,
      icon: _I.armor("common/all/common_pants_01.png")
    },
    "Canvas Work Trousers": {
      description: "Heavy canvas trousers built for hard labour — resist tearing and keep the legs cleaner than linen.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.2, value: 5,
      icon: _I.armor("common/all/common_pants_08.png")
    },
    "Roughspun Trousers": {
      description: "Coarse roughspun trousers — scratchy but durable, the choice of those who care more about endurance than comfort.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.2, value: 5,
      icon: _I.armor("common/all/common_pants_11.png")
    },
    "Dyed Wool Trousers": {
      description: "Wool trousers dyed in a solid colour — a touch above roughspun in both comfort and appearance.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.5, value: 7,
      icon: _I.armor("common/all/common_pants_12.png")
    },
    "Belted Trousers": {
      description: "Sturdy trousers with an integrated belt — keep the legs covered and everything else in place.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 1.5, value: 9,
      icon: _I.armor("common/all/common_pants_19.png")
    },
    "Traveller's Trousers": {
      description: "Road-hardened trousers built for the long march — reinforced at the knee and seat.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 },
      weight: 1.5, value: 10,
      icon: _I.armor("common/all/common_pants_39.png")
    },
    "Reinforced Trousers": {
      description: "Trousers with leather panels stitched to the inner thigh and knee — extra protection for mounted fighters.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 },
      weight: 2.0, value: 14,
      icon: _I.armor("common/all/common_pants_40.png")
    },
    "Farmer's Trousers": {
      description: "Simple working trousers worn by village farmers — nothing special, but they hold up to fieldwork.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.2, value: 4,
      icon: _I.armor("common/all/common_village_pants.png")
    },
    "Padded Trousers": {
      description: "Quilted trousers stuffed with batting — warm, protective, and surprisingly quiet.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 4 },
      weight: 2.0, value: 12,
      icon: _I.armor("common/all/padded_trousers.png")
    },

    // ── Shoes / Boots ──
    "Noble's Shoes": {
      description: "Fine leather shoes with decorative stitching — impractical on a battlefield, but they open doors in court.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 10,
      icon: _I.armor("common/all/common_elite_shoes.png")
    },
    "Work Shoes": {
      description: "Plain leather work shoes with thick soles — built for long days on hard floors.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 1.0, value: 5,
      icon: _I.armor("common/all/common_work_shoes.png")
    },

    // ── Shirts / Tunics / Vests ──
    "Brown Wool Shirt": {
      description: "A plain brown wool shirt — warm, itchy, and utterly unremarkable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 4,
      icon: _I.armor("common/all/brown_shirt.png")
    },
    "Brown Wool Trousers": {
      description: "Plain brown wool trousers — undyed and utilitarian, the kind worn by labourers across the realm.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 1.0, value: 4,
      icon: _I.armor("common/all/brown_pants.png")
    },
    "Dark Linen Shirt": {
      description: "A dark-dyed linen shirt — practical for those who dislike showing road dust and bloodstains.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 5,
      icon: _I.armor("common/all/common_dark_shirt.png")
    },
    "Red Linen Shirt": {
      description: "A bright red linen shirt — stands out in a crowd and hides bloodstains in equal measure.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 5,
      icon: _I.armor("common/all/common_red_shirt.png")
    },
    "White Linen Shirt": {
      description: "A clean white linen shirt — the universal garment of common folk across every kingdom.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 4,
      icon: _I.armor("common/all/common_white_shirt.png")
    },
    "Plain Vest": {
      description: "A sleeveless cloth vest worn over a shirt — adds a layer of warmth and a touch of protection.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.0, value: 7,
      icon: _I.armor("common/all/common_vest.png")
    },

    // ── Hats / Hoods ──
    "Classic Traveller's Hat": {
      description: "A wide-brimmed hat of treated felt — keeps rain off the face and the sun out of the eyes on long roads.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.5, value: 6,
      icon: _I.armor("common/all/common_classic_hat.png")
    },
    "Green Wool Hat": {
      description: "A simple knitted wool hat dyed green — keeps the head warm and doubles as camouflage in the forest.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.4, value: 5,
      icon: _I.armor("common/all/common_green_hat_2.png")
    },
    "Mage's Pointed Hat": {
      description: "The iconic tall pointed hat of the scholarly mage — offers little physical protection but commands respect.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 0.8, value: 10,
      icon: _I.armor("common/all/common_mage_helm.png")
    },
    "Pirate's Tricorn": {
      description: "A three-pointed hat stiffened with tar — unmistakably nautical and worn with an air of defiant confidence.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.5, value: 8,
      icon: _I.armor("common/all/common_pirate_hat.png")
    },
    "Red Wool Hat": {
      description: "A bright red knitted wool hat — warm, cheerful, and easy to spot in a crowd.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.4, value: 5,
      icon: _I.armor("common/all/common_red_hat.png")
    },
    "Feathered Cap": {
      description: "A jaunty cap adorned with a long feather — worn by entertainers and young nobles trying to look dashing.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.4, value: 8,
      icon: _I.armor("common/all/feathered_hat_2.png")
    },
    "Heavy Gambeson": {
      description: "A thick quilted jacket of layered linen — worn alone or under chainmail, the affordable protection of common soldiers.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 5 },
      weight: 4.0, value: 16,
      icon: _I.armor("common/all/gambeson.png")
    },

    // ── Capes / Backs ──
    "Green Travelling Cloak": {
      description: "A broad green cloak that keeps the rain off and the wind out — standard kit for anyone spending time on the road.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.5, value: 9,
      icon: _I.armor("common/all/cape_green.png")
    },
    "Fur-Lined Cloak": {
      description: "A heavy cloak lined with fur along the inside — expensive compared to plain wool, but invaluable in the cold north.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 3 },
      weight: 2.0, value: 14,
      icon: _I.armor("common/all/common_fur_back.png")
    },
    "Worn Blue Cape": {
      description: "A faded blue cape with fraying edges — clearly well-travelled, but still keeps the shoulders covered.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 1.0, value: 4,
      icon: _I.armor("common/all/small_cape_blue_worn.png")
    },
    "Worn Brown Cape": {
      description: "A worn brown cape of rough-woven wool — patchy and faded, but still breaks the wind on cold nights.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 1.0, value: 4,
      icon: _I.armor("common/all/small_cape_brown_worn.png")
    },
    "Brown Cape": {
      description: "A simple short cape of brown wool — everyday outerwear for farmers and travellers alike.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 },
      weight: 1.2, value: 7,
      icon: _I.armor("common/all/small_cape_brown.png")
    },

    // ── Cloaks ──
    "Green Cloak": {
      description: "A full wool cloak dyed forest green — good for travel in wet weather or wooded country.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 }, weight: 1.5, value: 9,
      icon: "images/icons/cloak_green.png"
    },
    "Dark Green Cloak": {
      description: "A deep green cloak, almost black in poor light — popular with rangers and those who prefer not to be watched.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 }, weight: 1.5, value: 10,
      icon: "images/icons/cloak_dark_green.png"
    },
    "Blue Cloak": {
      description: "A full blue woollen cloak — sturdy against wind and drizzle, worn by merchants and travellers alike.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 }, weight: 1.5, value: 9,
      icon: "images/icons/cloak_blue.png"
    },
    "Red Cloak": {
      description: "A bold red cloak — practical enough for the road, but hard to pass without being noticed.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 }, weight: 1.5, value: 10,
      icon: "images/icons/cloak_red.png"
    },
    "Black Cloak (White Trim)": {
      description: "A black cloak finished with a thin white border — formal enough for a court, practical enough for the road.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 }, weight: 1.5, value: 15,
      icon: "images/icons/cloak_black_white_trim.png"
    },
    "Black Cloak (Gold Trim)": {
      description: "A black cloak edged with gold thread — expensive to make, unmistakable to those who know what they are looking at.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 }, weight: 1.5, value: 22,
      icon: "images/icons/cloak_black_gold_trim.png"
    },

    // ── Worn Capes ──
    "Worn Green Cape": {
      description: "A faded green cape with unravelling edges — it has seen better days, but still turns a shoulder against the rain.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 1.0, value: 3,
      icon: "images/icons/cape_worn_green.png"
    },
    "Worn Dark Green Cape": {
      description: "A dark green cape worn thin at the hem — patched once or twice, but the colour still holds.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 1.0, value: 3,
      icon: "images/icons/cape_worn_dark_green.png"
    },
    "Worn Burgundy Cape": {
      description: "A burgundy cape faded to rust in places — once fine, now just serviceable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 1.0, value: 3,
      icon: "images/icons/cape_worn_burgundy.png"
    },
    "Worn Dark Brown Cape": {
      description: "A dark brown travelling cape, creased and weathered from long use on the road.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 1.0, value: 3,
      icon: "images/icons/cape_worn_dark_brown.png"
    },
    "Worn Black Cape": {
      description: "A black cape greyed with road dust — still functional, though the dye has not survived the journey well.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 1.0, value: 3,
      icon: "images/icons/cape_worn_black.png"
    },
    "Worn Red Cape": {
      description: "A red cape washed to a dull rose — once probably striking, now simply lived-in.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 1.0, value: 3,
      icon: "images/icons/cape_worn_red.png"
    },

    // ── Capelets ──
    "Brown Capelet": {
      description: "A short shoulder capelet of brown wool — doesn't reach far, but keeps the wind off the upper back.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 0.8, value: 5,
      icon: "images/icons/capelet_brown.png"
    },
    "Green Capelet": {
      description: "A short green capelet — common travelling wear, unassuming and practical.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 0.8, value: 5,
      icon: "images/icons/capelet_green.png"
    },
    "Black Capelet": {
      description: "A short black capelet — simple, neat, and gives nothing away.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 0.8, value: 5,
      icon: "images/icons/capelet_black.png"
    },
    "Blue Capelet": {
      description: "A short blue capelet of woven wool — unremarkable but presentable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 0.8, value: 5,
      icon: "images/icons/capelet_blue.png"
    },
    "Red Capelet": {
      description: "A short red capelet — eye-catching but modest, the kind worn by couriers and minor officials.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 0.8, value: 6,
      icon: "images/icons/capelet_red.png"
    },
    "Burgundy Capelet": {
      description: "A short capelet in deep burgundy — richer in colour than the usual road fare, but still modest in cut.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 0.8, value: 6,
      icon: "images/icons/capelet_burgundy.png"
    },
    "Tan Capelet": {
      description: "A plain tan capelet — the colour of dust and pale stone, which suits most who wear it just fine.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 }, weight: 0.8, value: 4,
      icon: "images/icons/capelet_tan.png"
    },

    // ── Noble Capelets ──
    "Noble Blue Capelet": {
      description: "A well-tailored blue capelet finished with braided cord — the kind worn by minor nobles and their household staff.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 }, weight: 0.9, value: 14,
      icon: "images/icons/noble_capelet_blue.png"
    },
    "Noble Green Capelet": {
      description: "A neatly cut green capelet with subtle embroidery along the edge — tasteful and clearly expensive.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 }, weight: 0.9, value: 14,
      icon: "images/icons/noble_capelet_green.png"
    },
    "Noble Red Capelet": {
      description: "A deep red capelet with a lined interior and pressed seams — made for someone who expects to be taken seriously.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 }, weight: 0.9, value: 15,
      icon: "images/icons/noble_capelet_red.png"
    },
    "Noble Black Capelet": {
      description: "A precisely cut black capelet with silk lining — worn by those with enough wealth to afford subtlety.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 }, weight: 0.9, value: 16,
      icon: "images/icons/noble_capelet_black.png"
    },
    "Noble White Capelet": {
      description: "A white capelet of fine-woven cloth, kept immaculate — impractical on the road, impressive everywhere else.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 }, weight: 0.9, value: 16,
      icon: "images/icons/noble_capelet_white.png"
    },
    "Noble Violet Capelet": {
      description: "A violet capelet with a deep lustre to the cloth — violet dye is not cheap, and whoever commissioned this knew it.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 }, weight: 0.9, value: 18,
      icon: "images/icons/noble_capelet_violet.png"
    },

    // ── Noble Capes ──
    "Noble Green Cape": {
      description: "A full-length green cape of fine wool with a satin lining — the standard cut for minor nobility on formal travel.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 3 }, weight: 1.3, value: 20,
      icon: "images/icons/noble_cape_green.png"
    },
    "Noble Red Cape": {
      description: "A sweeping red cape with structured shoulders and a rich lining — worn to be seen, and effective at it.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 3 }, weight: 1.3, value: 22,
      icon: "images/icons/noble_cape_red.png"
    },
    "Noble Black Cape": {
      description: "A long black cape with clean lines and a heavy fall — severe, expensive, and hard to ignore.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 3 }, weight: 1.3, value: 22,
      icon: "images/icons/noble_cape_black.png"
    },
    "Noble Dark Blue Cape": {
      description: "A midnight blue cape with brass clasps and a wool-lined interior — understated authority made wearable.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 3 }, weight: 1.3, value: 24,
      icon: "images/icons/noble_cape_dark_blue.png"
    },
    "Noble Blue Cape": {
      description: "A bright blue noble's cape, well-pressed and generously cut — the sort of thing worn to reassure people that everything is fine.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 3 }, weight: 1.3, value: 20,
      icon: "images/icons/noble_cape_blue.png"
    },

    // ── Ranger Cloaks (long; not wearable by Dwarves or Half-Goblins) ──
    "Leather Ranger Cloak": {
      description: "A full-length ranger's cloak of treated leather — waterproof, quiet in the undergrowth, and built to last a decade of hard use.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 4 }, weight: 2.0, value: 28,
      excludeRaces: ["Dwarf", "Half-Goblin"],
      icon: "images/icons/leather_ranger_cloak.png"
    },
    "Worn Leather Ranger Cloak": {
      description: "A long leather ranger's cloak, cracked at the seams and re-stitched in places — still functional, but clearly veteran.",
      type: "armor", consumable: false, wearable: true,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 2 }, weight: 2.0, value: 12,
      excludeRaces: ["Dwarf", "Half-Goblin"],
      icon: "images/icons/leather_ranger_cloak_worn.png"
    },
    "Green Ranger Cloak": {
      description: "A long green cloak cut for movement in woodland — broad enough to conceal a pack, shaped to leave the arms free.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 }, weight: 1.8, value: 16,
      excludeRaces: ["Dwarf", "Half-Goblin"],
      icon: "images/icons/ranger_cloak_green.png"
    },
    "Brown Ranger Cloak": {
      description: "A long brown travelling cloak, loose enough to move in and heavy enough to sleep under in a pinch.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 }, weight: 1.8, value: 14,
      excludeRaces: ["Dwarf", "Half-Goblin"],
      icon: "images/icons/ranger_cloak_brown.png"
    },
    "Olive Ranger Cloak": {
      description: "A muted olive-coloured ranger's cloak — blends well in dry scrub and autumn woodland, which is precisely the point.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 }, weight: 1.8, value: 15,
      excludeRaces: ["Dwarf", "Half-Goblin"],
      icon: "images/icons/ranger_cloak_olive.png"
    },
    "Dark Green Ranger Cloak": {
      description: "A long, dark green ranger's cloak — nearly invisible against forest shadow at dusk.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 }, weight: 1.8, value: 16,
      excludeRaces: ["Dwarf", "Half-Goblin"],
      icon: "images/icons/ranger_cloak_dark_green.png"
    },
    "Red Ranger Cloak": {
      description: "A long red ranger's cloak — unusual for the profession, but some find the colour useful for entirely different reasons.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 3 }, weight: 1.8, value: 14,
      excludeRaces: ["Dwarf", "Half-Goblin"],
      icon: "images/icons/ranger_cloak_red.png"
    },

    // ── Tabards ──
    "Blue Tabard": {
      description: "A blue cloth tabard worn over armour — displays allegiance to a lord or city at a glance.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 6,
      icon: _I.armor("common/all/common_tabard_07.png")
    },
    "Red Tabard": {
      description: "A red cloth tabard worn over armour — common among soldiers loyal to kingdoms that favour the colour of blood.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 6,
      icon: _I.armor("common/all/common_tabard_18.png")
    },
    "Green Tabard": {
      description: "A green cloth tabard — often worn by foresters, huntsmen, and those in service to woodland lords.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 6,
      icon: _I.armor("common/all/common_tabard_19.png")
    },
    "Yellow Tabard": {
      description: "A bright yellow tabard — highly visible in battle, often worn by heralds and banner carriers.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 6,
      icon: _I.armor("common/all/common_tabard_20.png")
    },
    "Black Tabard": {
      description: "A plain black tabard — favoured by those who serve shadowy lords or simply prefer not to announce their colours.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 6,
      icon: _I.armor("common/all/common_tabard_21.png")
    },
    "White Tabard": {
      description: "A white cloth tabard — worn by those who serve temples, healers' orders, or those who wish to appear neutral.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 6,
      icon: _I.armor("common/all/common_tabard_22.png")
    },
    "Brown Tabard": {
      description: "A brown linen tabard — common among merchants, traders, and those in service to no particular lord.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 6,
      icon: _I.armor("common/all/common_tabard_23.png")
    },
    "Purple Tabard": {
      description: "A purple tabard — the dye is expensive, marking the wearer as someone of high status or royal service.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 6,
      icon: _I.armor("common/all/common_tabard_24.png")
    },
    "Striped Tabard": {
      description: "A tabard with bold vertical stripes — a heraldic design used by certain noble houses and city militias.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 6,
      icon: _I.armor("common/all/common_tabard_28.png")
    },
    "Emblazoned Tabard": {
      description: "A tabard bearing a sewn coat of arms — better quality fabric and stitching mark the wearer as a named soldier.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defense: 2 },
      weight: 1.0, value: 10,
      icon: _I.armor("common/all/common_tabard_35.png")
    },
    "Merchant's Tabard": {
      description: "A well-made tabard bearing a trading guild emblem — identifies the wearer as a member in good standing.",
      type: "armor", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { defense: 1 },
      weight: 0.8, value: 8,
      icon: _I.armor("common/all/common_tabard_37.png")
    },

    // ── MAGE CLOTH SETS ──────────────────────────────────────────────────────
    "Apprentice Cloth Boots": {
      description: "Simple cloth boots worn by apprentice mages beginning their studies.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.6, value: 8,
      icon: _I.armor("mage/mage_cloth2_boots.png")
    },
    "Apprentice Cloth Bracers": {
      description: "Thin cloth bracers that leave the hands free for spellcasting.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.3, value: 5,
      icon: _I.armor("mage/mage_cloth2_bracers.png")
    },
    "Apprentice Cloth Robe": {
      description: "A simple robe issued to new apprentices of the arcane arts.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.5, value: 12,
      icon: _I.armor("mage/mage_cloth2_chest.png")
    },
    "Apprentice Cloth Gloves": {
      description: "Lightweight cloth gloves that enhance spellcasting focus.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.3, value: 5,
      icon: _I.armor("mage/mage_cloth2_gloves.png")
    },
    "Apprentice Cloth Hood": {
      description: "A cloth hood worn by apprentice mages to focus their concentration.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.5, value: 8,
      icon: _I.armor("mage/mage_cloth2_head.png")
    },
    "Apprentice Cloth Trousers": {
      description: "Loose cloth trousers allowing free movement during spell rituals.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.0, value: 8,
      icon: _I.armor("mage/mage_cloth2_pants.png")
    },
    "Apprentice Cloth Mantle": {
      description: "A simple shoulder mantle marking the wearer as a mage's apprentice.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.8, value: 7,
      icon: _I.armor("mage/mage_cloth2_shoulder.png")
    },
    "Scholar's Cloth Belt": {
      description: "A finely embroidered belt worn by scholars of the arcane.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.3, value: 6,
      icon: _I.armor("mage/mage_cloth3_belt.png")
    },
    "Scholar's Cloth Boots": {
      description: "Soft-soled boots designed for long hours in the library or lab.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.6, value: 10,
      icon: _I.armor("mage/mage_cloth3_boots.png")
    },
    "Scholar's Cloth Bracers": {
      description: "Cloth bracers with ink-resistant fabric favored by scribes and mages.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.3, value: 7,
      icon: _I.armor("mage/mage_cloth3_bracers.png")
    },
    "Scholar's Cloth Robe": {
      description: "A layered robe bearing the subtle marks of a practiced scholar-mage.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 1.5, value: 16,
      icon: _I.armor("mage/mage_cloth3_chest.png")
    },
    "Scholar's Cloth Gloves": {
      description: "Fine cloth gloves protecting delicate hands during ritual work.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.3, value: 7,
      icon: _I.armor("mage/mage_cloth3_gloves.png")
    },
    "Scholar's Cloth Hood": {
      description: "A deep hood favored by mages who prefer anonymity while studying.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.5, value: 10,
      icon: _I.armor("mage/mage_cloth3_head.png")
    },
    "Scholar's Cloth Trousers": {
      description: "Comfortable trousers suited for extended periods of study and travel.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.0, value: 10,
      icon: _I.armor("mage/mage_cloth3_pants.png")
    },
    "Scholar's Cloth Mantle": {
      description: "An embroidered shoulder mantle denoting a mage of scholarly rank.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.8, value: 9,
      icon: _I.armor("mage/mage_cloth3_shoulder.png")
    },
    "Arcanist's Boots": {
      description: "Reinforced cloth boots woven with minor protective enchantments.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 0.7, value: 14,
      icon: _I.armor("mage/mage_cloth5_boots.png")
    },
    "Arcanist's Bracers": {
      description: "Stiffened bracers worn by arcanists to channel magical force.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 2 }, weight: 0.4, value: 10,
      icon: _I.armor("mage/mage_cloth5_bracers.png")
    },
    "Arcanist's Robe": {
      description: "A fitted robe of treated cloth favored by practicing arcanists.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 1.5, value: 22,
      icon: _I.armor("mage/mage_cloth5_chest.png")
    },
    "Arcanist's Gloves": {
      description: "Fitted gloves that enhance precision in spell weaving.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 2 }, weight: 0.4, value: 10,
      icon: _I.armor("mage/mage_cloth5_gloves.png")
    },
    "Arcanist's Hood": {
      description: "A structured hood with channeling threads woven into the lining.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 0.5, value: 14,
      icon: _I.armor("mage/mage_cloth5_head.png")
    },
    "Arcanist's Trousers": {
      description: "Loose but structured trousers allowing full mobility during incantations.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 1.0, value: 14,
      icon: _I.armor("mage/mage_cloth5_pants.png")
    },
    "Arcanist's Mantle": {
      description: "A flowing mantle worn over robes as a mark of arcanist status.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 0.8, value: 12,
      icon: _I.armor("mage/mage_cloth5_shoulder.png")
    },
    "Runeweaver's Belt": {
      description: "A belt etched with runic patterns that reinforce spell accuracy.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 2 }, weight: 0.3, value: 12,
      icon: _I.armor("mage/mage_cloth6_belt.png")
    },
    "Runeweaver's Boots": {
      description: "Cloth boots embroidered with runic symbols for steady footing.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 0.7, value: 16,
      icon: _I.armor("mage/mage_cloth6_boots.png")
    },
    "Runeweaver's Bracers": {
      description: "Rune-etched bracers that direct magical energy through the wrists.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 0.4, value: 12,
      icon: _I.armor("mage/mage_cloth6_bracers.png")
    },
    "Runeweaver's Robe": {
      description: "A robe covered in interlocking runes that hum faintly with power.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 1.5, value: 28,
      icon: _I.armor("mage/mage_cloth6_chest.png")
    },
    "Runeweaver's Gloves": {
      description: "Gloves bearing runic inscriptions that amplify gestures of power.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 0.4, value: 12,
      icon: _I.armor("mage/mage_cloth6_gloves.png")
    },
    "Runeweaver's Hood": {
      description: "A hood with runic lining that shields the mind from magical interference.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 0.5, value: 18,
      icon: _I.armor("mage/mage_cloth6_head.png")
    },
    "Runeweaver's Trousers": {
      description: "Rune-woven trousers that channel ley energy through movement.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 1.0, value: 16,
      icon: _I.armor("mage/mage_cloth6_pants.png")
    },
    "Runeweaver's Mantle": {
      description: "A shoulder mantle woven with layered runic wards.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 0.8, value: 14,
      icon: _I.armor("mage/mage_cloth6_shoulder.png")
    },
    "Archmage's Belt": {
      description: "A belt of polished cloth reinforced with rare enchanting thread.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 3 }, weight: 0.3, value: 18,
      icon: _I.armor("mage/mage_cloth8_belt.png")
    },
    "Archmage's Boots": {
      description: "Silken boots that whisper as the wearer walks — a mark of archmage rank.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 0.7, value: 22,
      icon: _I.armor("mage/mage_cloth8_boots.png")
    },
    "Archmage's Bracers": {
      description: "Reinforced bracers worn by archmages to focus their vast power.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 3 }, weight: 0.4, value: 16,
      icon: _I.armor("mage/mage_cloth8_bracers.png")
    },
    "Archmage's Robe": {
      description: "An exquisite robe of layered magical cloth worn by archmages of great power.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 7 }, weight: 1.5, value: 38,
      icon: _I.armor("mage/mage_cloth8_chest.png")
    },
    "Archmage's Gloves": {
      description: "Gloves of fine silk that enhance the precision of powerful spells.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 0.4, value: 18,
      icon: _I.armor("mage/mage_cloth8_gloves.png")
    },
    "Archmage's Hood": {
      description: "A deep hood that conceals the face of one who has mastered the arcane.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 0.5, value: 25,
      icon: _I.armor("mage/mage_cloth8_head.png")
    },
    "Archmage's Trousers": {
      description: "Enchanted cloth trousers worn by those who have reached archmage rank.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 1.0, value: 22,
      icon: _I.armor("mage/mage_cloth8_pants.png")
    },
    "Archmage's Mantle": {
      description: "A sweeping shoulder mantle of deep hue marking an archmage.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 0.8, value: 20,
      icon: _I.armor("mage/mage_cloth8_shoulder.png")
    },
    "Grand Mage Belt": {
      description: "A ceremonial belt worn by grand mages of the high councils.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 3 }, weight: 0.3, value: 20,
      icon: _I.armor("mage/mage_cloth9_belt.png")
    },
    "Grand Mage Boots": {
      description: "Formal boots worn during council sessions and grand ceremonies.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 0.7, value: 24,
      icon: _I.armor("mage/mage_cloth9_boots.png")
    },
    "Grand Mage Bracers": {
      description: "Elaborately crafted bracers denoting the wearer's grand mage status.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 0.4, value: 18,
      icon: _I.armor("mage/mage_cloth9_bracers.png")
    },
    "Grand Mage Robe": {
      description: "The full formal robe of a grand mage — an object of reverence and power.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 8 }, weight: 1.5, value: 45,
      icon: _I.armor("mage/mage_cloth9_chest.png")
    },
    "Grand Mage Gloves": {
      description: "Pristine gloves worn only by grand mages in formal settings.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 0.4, value: 20,
      icon: _I.armor("mage/mage_cloth9_gloves.png")
    },
    "Grand Mage Hood": {
      description: "A towering hood of authority worn by the highest ranking mages.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 0.5, value: 28,
      icon: _I.armor("mage/mage_cloth9_head.png")
    },
    "Grand Mage Trousers": {
      description: "Formal cloth trousers of the grand mage's ceremonial attire.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 1.0, value: 24,
      icon: _I.armor("mage/mage_cloth9_pants.png")
    },
    "Grand Mage Mantle": {
      description: "A broad shoulder mantle that announces the presence of a grand mage.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 0.8, value: 22,
      icon: _I.armor("mage/mage_cloth9_shoulder.png")
    },
    "Spellbinder's Chest Wrap": {
      description: "A woven wrap that binds magical energy close to the body.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 1.5, value: 30,
      icon: _I.armor("mage/mage_cloth13_chest.png")
    },
    "Spellbinder's Gloves": {
      description: "Tight cloth gloves that bind spells to the fingertips for rapid casting.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 0.4, value: 14,
      icon: _I.armor("mage/mage_cloth13_gloves.png")
    },
    "Spellbinder's Trousers": {
      description: "Wrapped cloth trousers worn by spellbinders who work on the move.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 1.0, value: 14,
      icon: _I.armor("mage/mage_cloth13_pants.png")
    },
    "Spellbinder's Mantle": {
      description: "A layered mantle that protects the shoulders during extended spell work.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 0.8, value: 12,
      icon: _I.armor("mage/mage_cloth13_shoulder.png")
    },
    "Voidwalker's Boots": {
      description: "Dark cloth boots designed to muffle sound and shield against arcane backlash.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 0.7, value: 20,
      icon: _I.armor("mage/mage_cloth14_boots.png")
    },
    "Voidwalker's Bracers": {
      description: "Void-touched bracers that absorb minor spell feedback.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 3 }, weight: 0.4, value: 16,
      icon: _I.armor("mage/mage_cloth14_bracers.png")
    },
    "Voidwalker's Robe": {
      description: "A robe of deep shadow cloth worn by mages who traffic in void magic.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 7 }, weight: 1.5, value: 40,
      icon: _I.armor("mage/mage_cloth14_chest.png")
    },
    "Voidwalker's Gloves": {
      description: "Gloves of void-touched cloth that steady the hands during dangerous magic.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 0.4, value: 18,
      icon: _I.armor("mage/mage_cloth14_gloves.png")
    },
    "Voidwalker's Trousers": {
      description: "Shadow-cloth trousers that shift slightly as the wearer moves.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 1.0, value: 20,
      icon: _I.armor("mage/mage_cloth14_pants.png")
    },
    "Arcane Warder Boots": {
      description: "Heavy cloth boots reinforced for a mage who walks into danger.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 0.7, value: 28,
      icon: _I.armor("mage/mage_cloth17_boots.png")
    },
    "Arcane Warder Bracers": {
      description: "Sturdy bracers worn by mages tasked with warding dangerous locations.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 4 }, weight: 0.4, value: 20,
      icon: _I.armor("mage/mage_cloth17_bracers.png")
    },
    "Arcane Warder Robe": {
      description: "A heavily layered robe worn by mages who guard against the supernatural.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 9 }, weight: 1.5, value: 52,
      icon: _I.armor("mage/mage_cloth17_chest.png")
    },
    "Arcane Warder Gloves": {
      description: "Reinforced cloth gloves that protect against arcane recoil.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 0.4, value: 24,
      icon: _I.armor("mage/mage_cloth17_gloves.png")
    },
    "Arcane Warder Cowl": {
      description: "A structured cowl that shields the mind from hostile enchantments.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 6 }, weight: 0.5, value: 30,
      icon: _I.armor("mage/mage_cloth17_head.png")
    },
    "Arcane Warder Trousers": {
      description: "Reinforced cloth trousers worn by battle-ready arcane warders.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 1.0, value: 28,
      icon: _I.armor("mage/mage_cloth17_pants.png")
    },

    // ── MAGE LEATHER SETS ─────────────────────────────────────────────────────
    "Battle Mage Bracers": {
      description: "Leather bracers worn by mages who supplement spellcraft with melee combat.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 1.0, value: 14,
      icon: _I.armor("mage/mage_leather7_bracers.png")
    },
    "Battle Mage Chest": {
      description: "Hardened leather chest piece favored by mages who fight on the front line.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 4.0, value: 24,
      icon: _I.armor("mage/mage_leather7_chest.png")
    },
    "Battle Mage Helm": {
      description: "A leather helm reinforced to protect the head during close combat.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.0, value: 18,
      icon: _I.armor("mage/mage_leather7_head.png")
    },
    "Battle Mage Greaves": {
      description: "Sturdy leather leg guards for mages who wade into melee.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.5, value: 18,
      icon: _I.armor("mage/mage_leather7_pants.png")
    },
    "Battle Mage Pauldrons": {
      description: "Leather shoulder guards that protect without hindering spellcasting range.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 2.0, value: 14,
      icon: _I.armor("mage/mage_leather7_shoulder.png")
    },
    "War Mage Boots": {
      description: "Heavy leather boots worn by war mages who march with armies.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.5, value: 20,
      icon: _I.armor("mage/mage_leather8_boots.png")
    },
    "War Mage Bracers": {
      description: "Reinforced leather bracers providing protection in magical field combat.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 1.0, value: 16,
      icon: _I.armor("mage/mage_leather8_bracers.png")
    },
    "War Mage Chest": {
      description: "A heavy leather chest piece designed for mages serving in military campaigns.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 5.0, value: 30,
      icon: _I.armor("mage/mage_leather8_chest.png")
    },
    "War Mage Helm": {
      description: "A reinforced leather helm worn by mages on active campaign duty.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 2.5, value: 22,
      icon: _I.armor("mage/mage_leather8_head.png")
    },
    "War Mage Greaves": {
      description: "Thick leather leg guards issued to war mages in standing armies.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 3.0, value: 22,
      icon: _I.armor("mage/mage_leather8_pants.png")
    },
    "War Mage Pauldrons": {
      description: "Broad leather pauldrons worn by war mages to absorb physical blows.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.5, value: 18,
      icon: _I.armor("mage/mage_leather8_shoulder.png")
    },
    "Spellsword Boots": {
      description: "Heavy boots for a mage trained equally in blade and spell.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 2.5, value: 22,
      icon: _I.armor("mage/mage_leather12_boots.png")
    },
    "Spellsword Bracers": {
      description: "Spell-etched leather bracers worn by those who fight with sword and sorcery.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 1.0, value: 18,
      icon: _I.armor("mage/mage_leather12_bracers.png")
    },
    "Spellsword Chest": {
      description: "Reinforced leather chest armor for a warrior-mage hybrid fighter.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 9 }, weight: 5.0, value: 36,
      icon: _I.armor("mage/mage_leather12_chest.png")
    },
    "Spellsword Gauntlets": {
      description: "Gauntlets that allow a spellsword to channel magic through a blade.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 1.0, value: 18,
      icon: _I.armor("mage/mage_leather12_gloves.png")
    },
    "Runic Battle Boots": {
      description: "Leather boots inscribed with battle runes for speed and protection.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 6 }, weight: 2.5, value: 28,
      icon: _I.armor("mage/mage_leather13_boots.png")
    },
    "Runic Battle Bracers": {
      description: "Rune-carved bracers that deflect both blade and spell.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 1.0, value: 20,
      icon: _I.armor("mage/mage_leather13_bracers.png")
    },
    "Runic Battle Chest": {
      description: "A fully runed leather chest for mages who wage war in the thick of battle.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 10 }, weight: 5.0, value: 42,
      icon: _I.armor("mage/mage_leather13_chest.png")
    },
    "Runic Battle Gauntlets": {
      description: "Iron-knuckled leather gauntlets etched with offensive battle runes.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 5 }, weight: 1.0, value: 20,
      icon: _I.armor("mage/mage_leather13_gloves.png")
    },
    "Runic Battle Helm": {
      description: "A leather helm covered in layered battle runes that flare in combat.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 7 }, weight: 2.5, value: 28,
      icon: _I.armor("mage/mage_leather13_head.png")
    },
    "Runic Battle Greaves": {
      description: "Rune-studded leather greaves that protect against magical and physical attacks.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 6 }, weight: 3.0, value: 28,
      icon: _I.armor("mage/mage_leather13_pants.png")
    },
    "Runic Battle Pauldrons": {
      description: "Broad rune-carved pauldrons worn by elite battle-mage warriors.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 6 }, weight: 2.5, value: 24,
      icon: _I.armor("mage/mage_leather13_shoulder.png")
    },
    "Arcane Knight Boots": {
      description: "Masterwork leather boots of an arcane knight — rare and formidable.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 7 }, weight: 2.5, value: 35,
      icon: _I.armor("mage/mage_leather15_boots.png")
    },
    "Arcane Knight Bracers": {
      description: "Enchanted bracers of the arcane knight order, forged with magical binding.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 6 }, weight: 1.0, value: 24,
      icon: _I.armor("mage/mage_leather15_bracers.png")
    },
    "Arcane Knight Chest": {
      description: "The signature chest piece of an arcane knight — leather reinforced with bound metal and magic.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 12 }, weight: 5.5, value: 55,
      icon: _I.armor("mage/mage_leather15_chest.png")
    },
    "Arcane Knight Gauntlets": {
      description: "Heavy gauntlets that allow an arcane knight to cast and strike simultaneously.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 6 }, weight: 1.0, value: 24,
      icon: _I.armor("mage/mage_leather15_gloves.png")
    },
    "Arcane Knight Helm": {
      description: "A closed leather helm of the arcane knight order, etched with protective glyphs.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 8 }, weight: 2.5, value: 35,
      icon: _I.armor("mage/mage_leather15_head.png")
    },
    "Arcane Knight Greaves": {
      description: "Thick leather greaves of an arcane knight, reinforced against magic and blade.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 7 }, weight: 3.0, value: 35,
      icon: _I.armor("mage/mage_leather15_pants.png")
    },
    "Arcane Knight Pauldrons": {
      description: "Sweeping pauldrons of an arcane knight — among the most defensive leather armor available.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 7 }, weight: 2.5, value: 30,
      icon: _I.armor("mage/mage_leather15_shoulder.png")
    },

    // ── ORINDROTH ARMOR ───────────────────────────────────────────────────────
    "Orindroth Travelling Cape": {
      description: "A light travelling cape from Orindroth's rangers, good for long road journeys.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 8, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_back.png")
    },
    "Orindroth Back Cape": {
      description: "A sturdy cape worn on the back by Orindroth's travelling merchants.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 8, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_back_2.png")
    },
    "Orindroth Riding Boots": {
      description: "Leather riding boots from Orindroth's cavalry — sturdy and well-oiled.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.5, value: 14, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_boots_09.png")
    },
    "Orindroth Leather Boots": {
      description: "Standard issue leather boots worn throughout Orindroth's territories.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.5, value: 14, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_boots_15.png")
    },
    "Orindroth Guard Boots": {
      description: "Reinforced boots issued to Orindroth's city guards and militia.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 3.0, value: 18, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_boots_44.png")
    },
    "Orindroth Heavy Boots": {
      description: "Heavy iron-shod boots from Orindroth's professional soldier corps.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 3.5, value: 20, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_boots_51.png")
    },
    "Orindroth Plate Chest": {
      description: "A full plate chest piece from Orindroth's garrison armory.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 10 }, weight: 9.0, value: 30, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_chest_73.png")
    },
    "Orindroth Riding Gloves": {
      description: "Thin leather gloves worn by Orindroth's mounted scouts and messengers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.6, value: 8, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_gloves_02.png")
    },
    "Orindroth Guard Gauntlets": {
      description: "Leather gauntlets reinforced with iron rings for Orindroth's guard force.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 1.0, value: 14, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_gloves_18.png")
    },
    "Orindroth Green Helm": {
      description: "A green-lacquered helm worn by Orindroth's elite Valorin rangers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.5, value: 18, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_green_helm.png")
    },
    "Orindroth Green Trousers": {
      description: "Forest-green trousers worn by Orindroth's ranger patrols.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 10, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_green_pants.png")
    },
    "Orindroth Iron Helm": {
      description: "A plain iron helm worn by common soldiers throughout Orindroth.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 6 }, weight: 3.5, value: 16, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_helm_03.png")
    },
    "Orindroth War Helm": {
      description: "A reinforced war helm issued to Orindroth's veteran soldiers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 4.5, value: 26, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_helm_37.png")
    },
    "Orindroth Scout Boots": {
      description: "Light leather boots favored by Orindroth's road scouts.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 12, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_leather_boots.png")
    },
    "Orindroth Leather Bracers": {
      description: "Simple leather bracers used by Orindroth's travelling workers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 0.8, value: 10, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_leather_bracers.png")
    },
    "Orindroth Leather Chest": {
      description: "A second-pattern leather chest piece from Orindroth's tanneries.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 6 }, weight: 5.0, value: 18, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_leather_chest_0.png")
    },
    "Orindroth Leather Gloves": {
      description: "Workhorse leather gloves from Orindroth — practical and durable.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.6, value: 8, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_leather_gloves.png")
    },
    "Orindroth Leather Trousers": {
      description: "Standard leather trousers from Orindroth's craftsmen — hardwearing.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.5, value: 14, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_leather_pants.png")
    },
    "Orindroth Leather Pauldron": {
      description: "A single leather shoulder guard worn by Orindroth's light infantry.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 10, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_leather_shoulder.png")
    },
    "Orindroth Common Trousers": {
      description: "Everyday cloth trousers worn by the common folk of Orindroth.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 6, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_pants_04.png")
    },
    "Orindroth Work Trousers": {
      description: "Tough work trousers worn by Orindroth's field laborers and farmers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 6, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_pants_09.png")
    },
    "Orindroth Brown Trousers": {
      description: "Brown woolen trousers common among Orindroth's townsfolk.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 7, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_pants_21.png")
    },
    "Orindroth Guard Trousers": {
      description: "Reinforced trousers worn by Orindroth's town guards.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 10, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_pants_26.png")
    },
    "Orindroth Mail Trousers": {
      description: "Chainmail leg armor worn by Orindroth's professional soldiers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 4.0, value: 18, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_pants_32.png")
    },
    "Orindroth Plate Legs": {
      description: "Solid plate leg armor from Orindroth's garrison — heavy but protective.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 6.0, value: 24, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_pants_38.png")
    },
    "Orindroth Plate Pauldrons": {
      description: "Heavy plate shoulder guards worn by Orindroth's elite garrison troops.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 3.5, value: 16, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_shoulder.png")
    },

    // ── BRYTHWEN ARMOR ────────────────────────────────────────────────────────
    "Brythwen Sailor's Cape": {
      description: "A weatherproofed cape worn by Brythwen's coastal sailors.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.2, value: 8, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_back_02.png")
    },
    "Brythwen Naval Cape": {
      description: "A deep-blue naval officer's cape from Brythwen's fleet command.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 1.5, value: 12, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_back_07.png")
    },
    "Brythwen Blue Gambeson II": {
      description: "A second-pattern blue gambeson from Brythwen's infantry, heavier than the first.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 4.0, value: 18, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_blue_gambeson_2.png")
    },
    "Brythwen Sailor Boots": {
      description: "Watertight boots worn by Brythwen's sailors and dock workers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.5, value: 12, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_boots.png")
    },
    "Brythwen Guard Chest": {
      description: "A reinforced chest piece worn by Brythwen's port and city guards.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 7.0, value: 22, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_chest_10.png")
    },
    "Brythwen Plate Chest": {
      description: "Full plate chest armor from Brythwen's naval heavy infantry.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 12 }, weight: 10.0, value: 36, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_chest_74.png")
    },
    "Brythwen Citizen Tunic": {
      description: "A simple tunic worn by everyday citizens of Brythwen's coastal towns.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 6, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_citizen_chest.png")
    },
    "Brythwen Fur Cloak": {
      description: "A thick fur-lined cloak from Brythwen's northern coast fishermen.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 2.5, value: 16, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_fur_back.png")
    },
    "Brythwen Guard Helm": {
      description: "A crested helm worn by Brythwen's gate guards and watch captains.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 4.0, value: 22, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_helm.png")
    },
    "Brythwen Leather Belt": {
      description: "A supple leather belt from Brythwen's tanneries — functional and popular.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.5, value: 5, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_leather_belt.png")
    },
    "Brythwen Leather Boots": {
      description: "Sturdy leather boots from Brythwen's craftsmen — good for sea or land.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.0, value: 14, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_leather_boots.png")
    },
    "Brythwen Leather Gloves": {
      description: "Tough leather gloves worn by Brythwen's dock workers and craftsmen.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 0.6, value: 10, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_leather_gloves.png")
    },
    "Brythwen Leather Cap": {
      description: "A soft leather cap worn by Brythwen's scouts and light infantry.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.2, value: 10, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_leather_head.png")
    },
    "Brythwen Leather Trousers": {
      description: "Leather trousers from Brythwen — practical for sailors and soldiers alike.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.5, value: 14, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_leather_pants.png")
    },
    "Brythwen Mail Haubergeon": {
      description: "A second-pattern chainmail hauberk from Brythwen's naval arsenal.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 9 }, weight: 8.0, value: 28, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_mail_chest_2.png")
    },
    "Brythwen Full Mail Chest": {
      description: "Full chainmail from Brythwen's professional naval infantry — heavy and reliable.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 11 }, weight: 9.0, value: 36, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_mail_chest_3.png")
    },
    "Brythwen Mail Coif": {
      description: "A chainmail coif worn under helms by Brythwen's soldiers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 5 }, weight: 2.5, value: 14, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_mail_coif.png")
    },
    "Brythwen Padded Jerkin": {
      description: "A padded leather jerkin worn by Brythwen's militia as basic protection.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 5 }, weight: 3.5, value: 14, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_padded_chest.png")
    },
    "Brythwen Common Trousers": {
      description: "Plain trousers worn by everyday folk throughout Brythwen's towns.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 7, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_pants.png")
    },
    "Brythwen Spearman Helm": {
      description: "A conical helm worn by Brythwen's coastal spearman units.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.5, value: 18, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_spearman_helm.png")
    },

    // ── NITHROND ARMOR ────────────────────────────────────────────────────────
    "Nithrond Shadow Cloak": {
      description: "A dark cloak that blends into the shadows of Nithrond's marshes.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 1.5, value: 14, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_back.png")
    },
    "Nithrond Plate Boots": {
      description: "Heavy plate boots from Nithrond's fortress guard — designed for swamp terrain.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 4.0, value: 22, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_boots.png")
    },
    "Nithrond Citizen Robe": {
      description: "A dark robe worn by the common citizens of Nithrond's marsh settlements.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 7, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_citizen_chest.png")
    },
    "Nithrond Fur Cloak": {
      description: "A fur-lined cloak worn against the cold damp of Nithrond's wetlands.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 2.5, value: 16, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_fur_back.png")
    },
    "Nithrond Leather Boots": {
      description: "Waterproofed leather boots designed for Nithrond's boggy terrain.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.0, value: 14, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_leather_boots.png")
    },
    "Nithrond Leather Gloves": {
      description: "Dark leather gloves from Nithrond's craftsmen, treated against moisture.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 0.6, value: 10, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_leather_gloves.png")
    },
    "Nithrond Leather Hood": {
      description: "A dark leather hood worn by Nithrond's scouts and shadow operatives.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.2, value: 10, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_leather_head.png")
    },
    "Nithrond Leather Trousers": {
      description: "Dark leather trousers from Nithrond — practical for wetland travel.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.5, value: 14, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_leather_pants.png")
    },
    "Nithrond Leather Pauldron": {
      description: "A dark leather shoulder guard worn by Nithrond's light infantry.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 10, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_leather_shoulder.png")
    },
    "Nithrond Common Trousers": {
      description: "Dark cloth trousers worn by the common people of Nithrond.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 6, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_pants_03.png")
    },
    "Nithrond Dark Trousers": {
      description: "Dark reinforced trousers worn by Nithrond's nightwatch patrols.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 10, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_pants_06.png")
    },
    "Nithrond Guard Trousers": {
      description: "Reinforced trousers issued to Nithrond's fortress guard.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 2.5, value: 14, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_pants_31.png")
    },
    "Nithrond Plate Legs": {
      description: "Dark plate leg armor worn by Nithrond's elite garrison soldiers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 6.0, value: 26, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_pants_37.png")
    },
    "Nithrond Heavy Plate Boots": {
      description: "Thick black plate boots from Nithrond's highest-tier armory.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 9 }, weight: 5.0, value: 30, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_plate_boots.png")
    },
    "Nithrond Heavy Plate Legs": {
      description: "Massive plate legs from Nithrond's war-forged armory — nearly impenetrable.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 10 }, weight: 7.0, value: 34, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_plate_legs.png")
    },
    "Nithrond Plate Pauldrons": {
      description: "Black plate pauldrons worn by Nithrond's heavy infantry.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.5, value: 20, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_shoulder_66.png")
    },
    "Nithrond Spiked Pauldrons": {
      description: "Intimidating spiked pauldrons worn by Nithrond's shock troops.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 4.0, value: 26, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_shoulder_69.png")
    },
    "Nithrond Shadow Greaves": {
      description: "Dark reinforced greaves worn by Nithrond's shadow operatives.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.0, value: 22, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_special_pants.png")
    },

    // ── DWYNBROCH ARMOR ───────────────────────────────────────────────────────
    "Dwynbroch Bracers": {
      description: "Broad leather bracers from Dwynbroch's highland craftsmen.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 1.5, value: 14, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_bracers.png")
    },
    "Dwynbroch Scout Chest": {
      description: "A light chest piece worn by Dwynbroch's highland scouts.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 6 }, weight: 5.0, value: 18, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_chest_09.png")
    },
    "Dwynbroch Guard Chest": {
      description: "A reinforced chest piece worn by Dwynbroch's mountain pass guards.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 7.0, value: 24, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_chest_26.png")
    },
    "Dwynbroch Plate Chest": {
      description: "Heavy plate chest armor from Dwynbroch's mountain forges.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 11 }, weight: 10.0, value: 36, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_chest_33.png")
    },
    "Dwynbroch Heavy Plate": {
      description: "The heaviest plate chest from Dwynbroch — worn by the mountain elite guard.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 13 }, weight: 12.0, value: 48, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_chest_55.png")
    },
    "Dwynbroch Frog Helm": {
      description: "A distinctive frog-faced helm from Dwynbroch's highland warriors.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 4.0, value: 22, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_frog_helm.png")
    },
    "Dwynbroch Green Shirt": {
      description: "A green linen shirt common among Dwynbroch's highland folk.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.8, value: 5, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_green_shirt.png")
    },
    "Dwynbroch Knight Helm": {
      description: "A full knight's helm from Dwynbroch's mounted order — heavy and impressive.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 9 }, weight: 5.0, value: 32, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_knight_helm.png")
    },
    "Dwynbroch Leather Boots": {
      description: "Thick leather boots from Dwynbroch's highland cobblers — good for rough terrain.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.0, value: 14, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_leather_boots.png")
    },
    "Dwynbroch Leather Bracers": {
      description: "Reinforced leather bracers from Dwynbroch's smiths.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 0.8, value: 10, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_leather_bracers.png")
    },
    "Dwynbroch Leather Gloves": {
      description: "Sturdy leather gloves from Dwynbroch's highland craftsmen.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 0.6, value: 10, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_leather_gloves.png")
    },
    "Dwynbroch Leather Hood": {
      description: "A hooded leather cap worn by Dwynbroch's mountain scouts.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.2, value: 10, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_leather_head.png")
    },
    "Dwynbroch Leather Trousers": {
      description: "Hardwearing leather trousers for Dwynbroch's highland terrain.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.5, value: 14, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_leather_pants.png")
    },
    "Dwynbroch Leather Pauldron": {
      description: "A single leather pauldron worn by Dwynbroch's light infantry.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 10, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_leather_shoulder.png")
    },
    "Dwynbroch Plate Pauldrons": {
      description: "Broad plate pauldrons worn by Dwynbroch's heavy mountain soldiers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 4.0, value: 22, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_shoulder.png")
    },
    "Dwynbroch Spearman Helm": {
      description: "A crested spearman's helm worn by Dwynbroch's pass-defence units.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.5, value: 18, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_spearman_helm.png")
    },

    // ── NARADRETH ARMOR ───────────────────────────────────────────────────────
    "Naradreth Heavy Boots": {
      description: "Iron-shod boots from Naradreth's tundra warriors — built for frozen ground.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 4.0, value: 20, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_boots.png")
    },
    "Naradreth Plate Chest": {
      description: "Heavy plate chest armor from Naradreth's frost-hardened warriors.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 11 }, weight: 10.0, value: 34, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_chest.png")
    },
    "Naradreth Leather Belt": {
      description: "A wide tundra-leather belt from Naradreth's northern craftsmen.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.5, value: 5, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather_belt.png")
    },
    "Naradreth Leather Boots": {
      description: "Thick tundra-leather boots from Naradreth — insulated against biting cold.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.5, value: 14, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather_boots.png")
    },
    "Naradreth Leather Bracers": {
      description: "Wide leather bracers worn by Naradreth's warriors against the cold.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.0, value: 10, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather_bracers.png")
    },
    "Naradreth Leather Gloves": {
      description: "Insulated leather gloves from Naradreth — needed in the frozen north.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 0.6, value: 10, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather_gloves.png")
    },
    "Naradreth Leather Hood": {
      description: "A fur-lined leather hood worn against Naradreth's brutal winter winds.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 1.5, value: 14, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather_head.png")
    },
    "Naradreth Leather Trousers": {
      description: "Heavy leather trousers from Naradreth's tanneries — cold-resistant.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 3.0, value: 14, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather_pants.png")
    },
    "Naradreth Leather Pauldron": {
      description: "A broad leather pauldron worn by Naradreth's frost warriors.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.5, value: 10, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather_shoulder.png")
    },
    "Naradreth Reinforced Bracers": {
      description: "Double-layered leather bracers from Naradreth's second-tier armory.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 1.5, value: 18, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather2_bracers.png")
    },
    "Naradreth Reinforced Gloves": {
      description: "Reinforced leather gloves from Naradreth — extra padding against frostbite.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 1.0, value: 14, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather2_gloves.png")
    },
    "Naradreth Reinforced Hood": {
      description: "A reinforced leather hood from Naradreth's premium tanneries.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.0, value: 18, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather2_head.png")
    },
    "Naradreth Reinforced Trousers": {
      description: "Double-layered leather trousers for Naradreth's elite tundra fighters.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 3.5, value: 20, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather2_pants.png")
    },
    "Naradreth Reinforced Pauldron": {
      description: "A reinforced shoulder guard from Naradreth's second-tier armory.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 3.0, value: 18, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather2_shoulder.png")
    },

    // ── WISTRAVAEL ARMOR ──────────────────────────────────────────────────────
    "Wistravael Star Cape": {
      description: "A star-embroidered cape from Wistravael's mage-touched nobility.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 1.5, value: 14, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_back_08.png")
    },
    "Wistravael Mantle": {
      description: "A flowing mantle of deep purple worn by Wistravael's court officials.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 2.0, value: 18, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_back_12.png")
    },
    "Wistravael Plate Boots": {
      description: "Silver-trim plate boots from Wistravael's elite guard.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 4.5, value: 24, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_boots.png")
    },
    "Wistravael War Helm": {
      description: "A purple-crested war helm from Wistravael's army command.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 5.0, value: 28, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_helm_32.png")
    },
    "Wistravael Grand Helm": {
      description: "A magnificent plumed helm worn only by Wistravael's grand commanders.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 10 }, weight: 5.5, value: 40, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_helm_72.png")
    },
    "Wistravael Mail Belt": {
      description: "A chainmail belt from Wistravael's armory — practical and sturdy.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.5, value: 12, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_mail_belt.png")
    },
    "Wistravael Mail Boots": {
      description: "Chainmail boots from Wistravael's professional infantry.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 4.0, value: 20, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_mail_boots.png")
    },
    "Wistravael Mail Bracers": {
      description: "Chainmail bracers worn by Wistravael's soldiers in battle.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.0, value: 16, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_mail_bracers.png")
    },
    "Wistravael Mail Gauntlets": {
      description: "Sturdy chainmail gauntlets from Wistravael's armory.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 1.5, value: 16, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_mail_gloves.png")
    },
    "Wistravael Mail Coif": {
      description: "A chainmail coif worn beneath Wistravael's distinctive helms.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.0, value: 20, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_mail_head.png")
    },
    "Wistravael Mail Greaves": {
      description: "Chainmail leg armor from Wistravael's standing army.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 5.5, value: 24, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_mail_pants.png")
    },
    "Wistravael Mail Pauldrons": {
      description: "Chainmail shoulder armor worn by Wistravael's front-line soldiers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 4.0, value: 20, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_mail_shoulder.png")
    },
    "Wistravael Common Trousers": {
      description: "Plain trousers worn by the common folk of Wistravael's mountain towns.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 7, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_pants.png")
    },

    // ── ARDRENHOLD ARMOR ──────────────────────────────────────────────────────
    "Ardrenhold Black Trousers": {
      description: "Black woolen trousers worn by the citizens and soldiers of Ardrenhold.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 10, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_black_trousers.png")
    },
    "Ardrenhold Guard Chest": {
      description: "A reinforced chest piece worn by Ardrenhold's town and castle guards.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 7.5, value: 24, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_chest_12.png")
    },
    "Ardrenhold Footman Helm": {
      description: "A simple steel helm worn by Ardrenhold's common footmen.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.5, value: 18, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_footman_helm.png")
    },
    "Ardrenhold Knight Helm": {
      description: "A crested knight's helm from Ardrenhold's knightly order.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 10 }, weight: 5.0, value: 35, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_knight_helm.png")
    },
    "Ardrenhold Knight Plate II": {
      description: "The second-pattern full plate chest of Ardrenhold's elite knight order.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 14 }, weight: 13.0, value: 55, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_knight_plate_chest_2.png")
    },
    "Ardrenhold Knight Plate Helm": {
      description: "Full-face plate helm of Ardrenhold's highest-ranked knights.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 12 }, weight: 6.0, value: 42, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_knight_plate_helm.png")
    },
    "Ardrenhold Leather Boots": {
      description: "Sturdy leather boots from Ardrenhold's armory supply.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.5, value: 14, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_leather_boots.png")
    },
    "Ardrenhold Leather Chest": {
      description: "Standard leather chest armor from Ardrenhold's light infantry.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 6 }, weight: 5.0, value: 18, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_leather_chest.png")
    },
    "Ardrenhold Plate Legs": {
      description: "Heavy plate leg armor from Ardrenhold's professional army.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 9 }, weight: 7.0, value: 28, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_plate_legs.png")
    },
    "Ardrenhold Yellowed Plate": {
      description: "An old gold-and-yellow plate chest from Ardrenhold's ceremonial armory.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 12 }, weight: 11.0, value: 42, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_platemail_chest_yellow.png")
    },
    "Ardrenhold Plate Pauldrons": {
      description: "Broad plate pauldrons from Ardrenhold's heavy infantry armory.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 4.0, value: 20, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_shoulder.png")
    },
    "Ardrenhold Yellow Shirt": {
      description: "A yellow linen shirt worn under armor by Ardrenhold's soldiers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.8, value: 5, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_yellow_shirt.png")
    },

    // ── BANDIT ARMOR ──────────────────────────────────────────────────────────
    "Barbarian Chest Wrap": {
      description: "Crude strips of hide and cloth bound across a bandit warrior's chest.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 5 }, weight: 4.0, value: 10,
      icon: _I.armor("bandit/bandit_barbarian_chest.png")
    },
    "Ragged Cloth Shoulder": {
      description: "A scrap of cloth tied at the shoulder — barely armor, but better than nothing.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.8, value: 3,
      icon: _I.armor("bandit/bandit_cloth_shoulder.png")
    },
    "Fur-Stitched Chest": {
      description: "Patches of animal fur stitched together as crude bandit chest armor.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 6 }, weight: 5.0, value: 12,
      icon: _I.armor("bandit/bandit_fur_chest.png")
    },
    "Bandit Leather Bracers": {
      description: "Scavenged leather bracers worn by bandits who survive long enough to find them.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 0.8, value: 6,
      icon: _I.armor("bandit/bandit_leather_bracers.png")
    },
    "Bandit Leather Chest": {
      description: "Stolen or cobbled-together leather chest armor worn by roadside bandits.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 5 }, weight: 4.5, value: 8,
      icon: _I.armor("bandit/bandit_leather_chest.png")
    },
    "Bandit Leather Gloves": {
      description: "Fingerless leather gloves worn by bandits — practical for both work and theft.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.6, value: 5,
      icon: _I.armor("bandit/bandit_leather_gloves.png")
    },
    "Bandit Leather Hood": {
      description: "A battered leather hood worn to conceal a bandit's identity.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.2, value: 6,
      icon: _I.armor("bandit/bandit_leather_head.png")
    },
    "Bandit Leather Trousers": {
      description: "Worn leather trousers scavenged from a fallen traveller or merchant.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 5,
      icon: _I.armor("bandit/bandit_leather_pants.png")
    },
    "Bandit Patched Trousers": {
      description: "Leather trousers with crude patches sewn over holes and tears.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 2.0, value: 5,
      icon: _I.armor("bandit/bandit_leather_pants_2.png")
    },
    "Bandit Leather Shoulder": {
      description: "A single leather shoulder guard worn by common bandits.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.2, value: 5,
      icon: _I.armor("bandit/bandit_leather_shoulder.png")
    },
    "Bandit Spiked Shoulder": {
      description: "A crude spiked leather shoulder guard worn by bandit leaders to intimidate.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.5, value: 6,
      icon: _I.armor("bandit/bandit_leather_shoulder_2.png")
    },
    "Bandit Leather Vest": {
      description: "A sleeveless leather vest worn by bandits as basic torso protection.",
      type: "armor", consumable: false, wearable: true, condition: "Worn", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 3.5, value: 7,
      icon: _I.armor("bandit/bandit_leather_vest.png")
    },

    // ── FELDARUN ARMOR ────────────────────────────────────────────────────────
    "Feldarun Plate Boots": {
      description: "Bronze-gilt plate boots from Feldarun's renowned armoring tradition.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 4.5, value: 24, kingdom: "Feldarun",
      icon: _I.armor("Feldarun/feldarun_boots.png")
    },
    "Feldarun War Helm": {
      description: "A third-pattern war helm from Feldarun's elite armory.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 4.5, value: 28, kingdom: "Feldarun",
      icon: _I.armor("Feldarun/feldarun_helm_28.png")
    },
    "Feldarun Mail Belt": {
      description: "A chainmail belt from Feldarun's fine armory — well-crafted and durable.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.5, value: 12, kingdom: "Feldarun",
      icon: _I.armor("Feldarun/feldarun_mail_belt.png")
    },
    "Feldarun Mail Bracers": {
      description: "Well-crafted chainmail bracers from Feldarun's smiths.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.0, value: 16, kingdom: "Feldarun",
      icon: _I.armor("Feldarun/feldarun_mail_bracers.png")
    },
    "Feldarun Mail Gauntlets": {
      description: "Fine chainmail gauntlets from Feldarun's armory — among the best available.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 1.5, value: 16, kingdom: "Feldarun",
      icon: _I.armor("Feldarun/feldarun_mail_gloves.png")
    },
    "Feldarun Mail Coif": {
      description: "A precision-crafted chainmail coif from Feldarun's renowned smiths.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.0, value: 20, kingdom: "Feldarun",
      icon: _I.armor("Feldarun/feldarun_mail_head.png")
    },
    "Feldarun Mail Greaves": {
      description: "Chainmail leg armor from Feldarun — heavy but excellently crafted.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 5.5, value: 24, kingdom: "Feldarun",
      icon: _I.armor("Feldarun/feldarun_mail_pants.png")
    },
    "Feldarun Mail Pauldrons": {
      description: "Chainmail pauldrons of superior Feldarun craftsmanship.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 4.0, value: 20, kingdom: "Feldarun",
      icon: _I.armor("Feldarun/feldarun_mail_shoulder.png")
    },
    "Feldarun Ceremonial Tabard": {
      description: "A second-pattern ceremonial tabard from Feldarun's formal court.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 2 }, weight: 1.0, value: 12, kingdom: "Feldarun",
      icon: _I.armor("Feldarun/feldarun_tabard_2.png")
    },

    // ── RENDAROST ARMOR ───────────────────────────────────────────────────────
    "Rendarost Heavy Boots": {
      description: "Iron-shod boots from Rendarost's arctic fortress — built for frozen battlefields.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 5.0, value: 22, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_boots.png")
    },
    "Rendarost Mail Boots": {
      description: "Chainmail boots worn by Rendarost's professional soldiers in the frozen north.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 4.5, value: 20, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_mail_boots.png")
    },
    "Rendarost Mail Bracers": {
      description: "Heavy chainmail bracers from Rendarost's arctic forge.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.0, value: 16, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_mail_bracers.png")
    },
    "Rendarost Mail Gauntlets": {
      description: "Insulated chainmail gauntlets from Rendarost's cold-weather armory.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 1.5, value: 16, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_mail_gloves.png")
    },
    "Rendarost Mail Coif": {
      description: "A chainmail coif from Rendarost's northern armory — cold-resistant lining.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.0, value: 20, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_mail_head.png")
    },
    "Rendarost Mail Greaves": {
      description: "Heavy chainmail leg armor from Rendarost — built for long arctic campaigns.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 6.0, value: 24, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_mail_pants.png")
    },
    "Rendarost Mail Pauldrons": {
      description: "Broad chainmail pauldrons from Rendarost's frontier soldiers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 4.0, value: 20, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_mail_shoulder.png")
    },
    "Rendarost Common Trousers": {
      description: "Thick woolen trousers worn by the hardy folk of Rendarost's frozen settlements.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 7, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_pants.png")
    },

    // ── SIVANRIFT ARMOR ───────────────────────────────────────────────────────
    "Sivanrift Garden Tabard": {
      description: "A second-pattern garden tabard from Sivanrift's peaceful settlements.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 2 }, weight: 1.0, value: 12, kingdom: "Sivanrift",
      icon: _I.armor("Sivanrift/sivanrift_tabard_2.png")
    },

    // ── SPECIAL ARMOR ─────────────────────────────────────────────────────────
    "Legionary Plate": {
      description: "The full plate armor of an ancient legionary — extraordinarily heavy and nearly impenetrable.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 16 }, weight: 14.0, value: 80,
      icon: _I.armor("special/special_legionary_armor.png")
    },

    // ── PROFESSION ARMOR ──────────────────────────────────────────────────────
    "Merchant's Doublet": {
      description: "A fine doublet worn by merchants and traders to project prosperity.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.5, value: 12,
      icon: _I.armor("profession/profession_cloth_chest.png")
    },
    "Guild Tabard": {
      description: "A tabard bearing a guild's seal — marks the wearer as an approved member.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.8, value: 8,
      icon: _I.armor("profession/profession_tabard_36.png")
    },
    "Tradesman's Tabard": {
      description: "A plain tabard worn by tradesmen to distinguish their craft.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.8, value: 8,
      icon: _I.armor("profession/profession_tabard_40.png")
    },
    "Artisan's Tabard": {
      description: "A craftsman's tabard bearing the symbols of skilled artisanship.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 1 }, weight: 0.8, value: 8,
      icon: _I.armor("profession/profession_tabard_41.png")
    },
    "Scholar's Tabard": {
      description: "An academic's tabard worn by those affiliated with centers of learning.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 1 }, weight: 0.8, value: 10,
      icon: _I.armor("profession/profession_tabard_42.png")
    },
    "Healer's Tabard": {
      description: "A white tabard bearing a healer's mark — universally recognized as a sign of mercy.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 1 }, weight: 0.8, value: 10,
      icon: _I.armor("profession/profession_tabard_44.png")
    },
    "Mage's Tabard": {
      description: "A tabard bearing arcane symbols that identify the wearer as a practicing mage.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 1 }, weight: 0.8, value: 10,
      icon: _I.armor("profession/profession_tabard_47.png")
    },
    "Alchemist's Tabard": {
      description: "A stained tabard of the alchemist's guild, marked with vials and formulae.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 1 }, weight: 0.8, value: 10,
      icon: _I.armor("profession/profession_tabard_48.png")
    }
  },

  Potions: {
    "Health Potion": {
      description: "Restores health when consumed.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Common",
      baseEffect: { life: 25 },
      weight: 0.5, value: 30,
      icon: _I.potion("potion_health_vial.png")
    },
    "Greater Health Potion": {
      description: "A powerful draught that restores a large amount of health.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { life: 50 },
      weight: 0.5, value: 60,
      icon: _I.potion("potion_health_flask.png")
    },
    "Mana Potion": {
      description: "Restores arcane power when consumed.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { mana: 25 },
      weight: 0.5, value: 40,
      icon: _I.potion("potion_mana_vial.png")
    },
    "Greater Mana Potion": {
      description: "A concentrated potion that restores a large amount of mana.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Rare",
      baseEffect: { mana: 50 },
      weight: 0.5, value: 75,
      icon: _I.potion("potion_mana_flask.png")
    },
    "Stamina Potion": {
      description: "A revitalizing drink that boosts stamina.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 30 },
      weight: 0.5, value: 35,
      icon: _I.potion("potion_stamina_vial.png")
    },
	    "Greater Stamina Potion": {
      description: "A revitalizing drink that boosts stamina.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 30 },
      weight: 0.5, value: 35,
      icon: _I.potion("potion_stamina_flask.png")
    },
    "Antidote": {
      description: "Purges poison from the body.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Common",
      baseEffect: { removeCondition: "poisoned" },
      weight: 0.5, value: 25,
      icon: _I.potion("potion_antidote.png")
    },
    "Warmth Elixir": {
      description: "A spiced brew that drives out the cold and restores warmth.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Common",
      baseEffect: { removeCondition: "cold", stamina: 10 },
      weight: 0.5, value: 20,
      icon: _I.potion("potion_blood.png")
    },
    "Fortifying Tonic": {
      description: "Bolsters the body against harm for a short time.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { applyCondition: "fortified" },
      weight: 0.5, value: 45,
      icon: _I.potion("potion_magic_mixture_2.png")
    },
    "Focused Draught": {
      description: "Sharpens the senses and steadies the aim.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { applyCondition: "focused" },
      weight: 0.5, value: 40,
      icon: _I.potion("potion_blue.png")
    },
    "Rejuvenation Potion": {
      description: "A rare brew that restores both body and spirit.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Rare",
      baseEffect: { life: 20, applyCondition: "rejuvenated" },
      weight: 0.5, value: 90,
      icon: _I.potion("potion_magic_mixture.png")
    },
    "Large Poison Vial": {
      description: "A large vial of concentrated toxin — deadly if ingested or applied to a blade.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Rare",
      baseEffect: { applyCondition: "poisoned" },
      weight: 0.8, value: 55,
      icon: _I.potion("poison_large.png")
    },
    "Poison": {
      description: "A small vial of fast-acting poison. Useful for coating weapons or slipping into food.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { applyCondition: "poisoned" },
      weight: 0.3, value: 30,
      icon: _I.potion("poison.png")
    },
    "Mana Draught": {
      description: "A swirling blue brew that rapidly restores arcane reserves. Brewed by alchemists from crystallized mana shards.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { mana: 35 },
      weight: 0.5, value: 45,
      icon: _I.potion("potion_mana.png")
    },
    "Greater Rejuvenation Flask": {
      description: "A large flask of rejuvenating elixir — restores life, stamina, and clears minor ailments.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Epic",
      baseEffect: { life: 35, stamina: 20, mana: 15 },
      weight: 1.0, value: 140,
      icon: _I.potion("potion_rejuvination_flask.png")
    },
    "Rejuvenation Vial": {
      description: "A small dose of rejuvenation elixir — restores a modest amount of life and clears fatigue.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Rare",
      baseEffect: { life: 15, stamina: 10 },
      weight: 0.3, value: 65,
      icon: _I.potion("potion_rejuvination_vial.png")
    },
    "Warmth Vial": {
      description: "A tiny vial of concentrated warmth elixir — a single dose to drive out the chill.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Common",
      baseEffect: { removeCondition: "cold", stamina: 5 },
      weight: 0.2, value: 12,
      icon: _I.potion("potion_warmth_vial.png")
    },
    "Greater Warmth Elixir": {
      description: "A large flask of spiced warmth brew — banishes cold and restores substantial stamina.",
      type: "potion", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { removeCondition: "cold", stamina: 20 },
      weight: 0.8, value: 35,
      icon: _I.potion("potion_warmth.png")
    },
  },

  Ingredients: {
    "Empty Vial": {
      description: "A small glass vial — the base container for any potion.",
      type: "material", consumable: false, wearable: false,
      condition: "New", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 3,
      icon: _I.container("test_tube.png")
    },
    "Healing Herb": {
      description: "A common herb used in basic potions and poultices. Can be chewed raw for a minor restorative effect.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { life: 3, stamina: 1 }, weight: 0.1, value: 4,
      icon: _I.ingredient("herb_15.png")
    },
    "Rare Herb": {
      description: "An uncommon medicinal herb with powerful restorative properties. Effective even eaten raw.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { life: 6, stamina: 2 }, weight: 0.1, value: 8,
      icon: _I.ingredient("herb_18.png")
    },
    "Moonbloom": {
      description: "A pale flower that blooms only at night and channels arcane energy. Consuming it floods the mind with mana.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { mana: 5 }, weight: 0.1, value: 10,
      icon: _I.ingredient("flower_mana.png")
    },
    "Ginseng Root": {
      description: "An energizing root that revitalizes the body. Chewing it raw provides a noticeable stamina boost.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 8 }, weight: 0.2, value: 5,
      icon: _I.ingredient("root_generic.png")
    },
    "Milkweed": {
      description: "A common plant whose sap neutralizes many toxins. Bitter but safe to ingest.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 2 }, weight: 0.1, value: 4,
      icon: _I.ingredient("plant.png")
    },
    "Ember Root": {
      description: "A warm, spiced root that generates heat within the body. Eating it raw warms you from the inside.",
      type: "material", consumable: true, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 }, weight: 0.2, value: 5,
      icon: _I.ingredient("root_edgy.png")
    },
    "Ironbark Resin": {
      description: "A thick resin from ironbark trees, used to fortify potions. Extremely bitter — ingesting it raw is unpleasant and slightly harmful.",
      type: "material", consumable: true, wearable: false,
      condition: "New", burnTime: 0, rarity: "Uncommon",
      baseEffect: { life: -2, stamina: 1 }, weight: 0.2, value: 9,
      icon: _I.ingredient("bark.png")
    },
    "Eyebright": {
      description: "A delicate white wildflower (Euphrasia) long used to sharpen vision and treat eye ailments. Mildly restorative when eaten.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 2 }, weight: 0.1, value: 8,
      icon: _I.ingredient("eyebright.png")
    },
    "Goldenmoss": {
      description: "A rare luminous moss that carries potent restorative energy. Eating it directly restores both life and mana.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: { life: 4, mana: 3 }, weight: 0.2, value: 15,
      icon: _I.ingredient("flower_golden.png")
    },
    "Ash Powder": {
      description: "Fine grey ash gathered from a cold hearth — used as a base in alchemical reactions and simple dyes.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 1,
      icon: _I.ingredient("ash.png")
    },
    "Asparagus": {
      description: "Spears of wild asparagus gathered near riverbanks — edible raw but much better grilled.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 6 }, weight: 0.2, value: 3,
      icon: _I.ingredient("asparagus.png")
    },
    "Basil": {
      description: "Fresh basil leaves with a peppery anise scent — used in cooking and minor healing preparations. Pleasant to eat raw.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 1 }, weight: 0.05, value: 2,
      icon: _I.ingredient("basil.png")
    },
    "Beast Beak": {
      description: "The severed beak of a large bird or reptile — used as a crafting component or alchemical curio.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 5,
      icon: _I.ingredient("beak.png")
    },
    "Elderberry": {
      description: "Deep red-black elderberries — used in blood-sealing poultices and immune-boosting preparations.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 3 }, weight: 0.1, value: 8,
      icon: _I.ingredient("elderberry.png")
    },
    "Herb Berry": { // ⚑ FLAG: Generic fantasy name — needs a real counterpart
      description: "A round green-flecked berry with a medicinal bitter taste — used in tinctures and salves. Edible raw with minor benefit.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 3, life: 1 }, weight: 0.1, value: 4,
      icon: _I.ingredient("berry_herb.png")
    },
    "Blackcurrant": {
      description: "Small intensely dark berries with a tart flavour — rich in tannins and used in restorative preparations.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 4 }, weight: 0.1, value: 10,
      icon: _I.ingredient("blackcurrant.png")
    },
    "White Currant": {
      description: "Pale translucent berries from cold climates — mildly analgesic, used in pain-relief preparations.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 3 }, weight: 0.1, value: 5,
      icon: _I.ingredient("white_currant.png")
    },
    "Black Pepper": {
      description: "Dried black peppercorns — sharpens food and is a mild stimulant in some herbal preparations. A handful eaten raw stings but invigorates.",
      type: "material", consumable: true, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 1 }, weight: 0.05, value: 3,
      icon: _I.ingredient("black_pepper.png")
    },
    "Bones": {
      description: "Cleaned animal bones — used for bone broth, crude tools, or as alchemical reagents.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 2,
      icon: _I.ingredient("bones.png")
    },
    "Dried Flower Bouquet": {
      description: "A bundle of pressed and dried mixed flowers — used in perfumes, dyes, and minor potions.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 4,
      icon: _I.ingredient("bouquet.png")
    },
    "Branch Bundle": {
      description: "A tied bundle of leafy branches — useful for shelter thatching or as rough-and-ready camp bedding.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 15, rarity: "Common",
      baseEffect: {}, weight: 1.5, value: 1,
      icon: _I.ingredient("branches.png")
    },
    "Cactus Flesh": {
      description: "Moist, pulpy cactus flesh cut from a desert cactus — a vital water source in arid regions.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 7 }, weight: 0.4, value: 3,
      icon: _I.ingredient("cactus.png")
    },
    "Raw Chicken Leg": {
      description: "An uncooked chicken drumstick — needs to be cooked thoroughly before eating.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.4, value: 3,
      icon: _I.ingredient("chicken_leg_raw.png")
    },
    "Large Claw": {
      description: "A massive curved claw from a predatory beast — used in armour-crafting and as a trophy.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.8, value: 12,
      icon: _I.ingredient("claw_2.png")
    },
    "Beast Claw": {
      description: "A sharp claw from a common predator — alchemical reagent or simple crafting material.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 5,
      icon: _I.ingredient("claw.png")
    },
    "Pine Cone": {
      description: "A dry pine cone, packed with seeds — can be burned as tinder or used in basic natural dyes.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 8, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 0,
      icon: _I.ingredient("cone.png")
    },
    "Dragon Eye": {
      description: "A preserved dragon eye, still slightly luminous — an extraordinarily rare alchemical component.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Legendary",
      baseEffect: {}, weight: 0.5, value: 500,
      icon: _I.ingredient("dragon_eye.png")
    },
    "Silver Dust": {
      description: "Finely ground silver powder — used in enchanting, anti-undead preparations, and sigil-drawing.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 12,
      icon: _I.ingredient("dust_2.png")
    },
    "Bone Dust": {
      description: "Ground bones reduced to a fine chalky powder — a necromantic reagent and alchemical fixative.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 8,
      icon: _I.ingredient("dust_3.png")
    },
    "Magic Dust": {
      description: "Sparkling arcane dust of unknown origin — causes mild luminescence when disturbed.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.05, value: 20,
      icon: _I.ingredient("dust.png")
    },
    "Large Feather": {
      description: "A long iridescent feather from a large bird — used in fletching and decorative crafts.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.05, value: 3,
      icon: _I.ingredient("feather_2.png")
    },
    "Rare Feather": {
      description: "A brilliantly coloured feather from an exotic bird — highly sought by tailors and enchanters.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.05, value: 10,
      icon: _I.ingredient("feather_3.png")
    },
    "Feather": {
      description: "A plain brown or grey feather found along a trail. Used for fletching arrows.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.02, value: 1,
      icon: _I.ingredient("feather.png")
    },
    "Flour": {
      description: "Finely ground wheat flour — the base for bread, dumplings, and thickening stews.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 2,
      icon: _I.ingredient("flour.png")
    },
    "Ancient Bloom": {
      description: "A flower of an extinct species preserved in amber-like resin — priceless to scholars and powerful in ritual magic.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Epic",
      baseEffect: {}, weight: 0.1, value: 120,
      icon: _I.ingredient("flower_ancient.png")
    },
    "Bleeding Heart": {
      description: "A drooping heart-shaped flower (Lamprocapnos) with mildly sedative alkaloids — used in sleep tonics. Eating raw induces mild malaise.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: -2, life: -1 }, weight: 0.1, value: 9,
      icon: _I.ingredient("bleeding_heart.png")
    },
    "Snapdragon": { // ⚑ FLAG: Snapdragons are real but don't smell of sulphur — description adjusted
      description: "A vivid red and orange snapdragon bloom (Antirrhinum) — striking in appearance and used in fire-resistance preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.1, value: 22,
      icon: _I.ingredient("snapdragon.png")
    },
    "Energizing Bloom": {
      description: "A bright flower that crackles with stored electrical energy — used in stamina and lightning preparations. Eating it raw delivers a jolt of vigour.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 8 }, weight: 0.1, value: 14,
      icon: _I.ingredient("flower_energy.png")
    },
    "Firebloom": {
      description: "A vivid orange flower that is warm to the touch — essential in warmth potions and fire-starting preparations. Eating it raw warms the stomach.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 5 }, weight: 0.1, value: 12,
      icon: _I.ingredient("flower_fire.png")
    },
    "King's Blossom": {
      description: "A rare golden flower that blooms once per century — said to grant clarity of mind to those who steep it. Eaten raw, its power is diminished but still remarkable.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Epic",
      baseEffect: { mana: 8, stamina: 3 }, weight: 0.1, value: 80,
      icon: _I.ingredient("flower_king.png")
    },
    "Mistbloom": {
      description: "A pale, feathery flower that grows only in morning fog — used in illusion-related alchemical work. Consuming it raw stirs faint mana.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { mana: 3 }, weight: 0.1, value: 11,
      icon: _I.ingredient("flower_misty.png")
    },
    "Amber Flower": {
      description: "A warm amber-coloured bloom with a honeyed scent — used in restorative preparations. Pleasant and mildly restorative eaten raw.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 2, life: 1 }, weight: 0.1, value: 6,
      icon: _I.ingredient("flower_orange.png")
    },
    "Wild Violet": {
      description: "Deep purple violet flowers (Viola odorata) historically used in antidotes and soothing preparations. Gently restorative eaten raw.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: { life: 2 }, weight: 0.1, value: 9,
      icon: _I.ingredient("wild_violet.png")
    },
    "Crimson Petal": {
      description: "A vivid red flower petal — used in blood potions and vitality draughts. A small restorative when eaten.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { life: 1 }, weight: 0.05, value: 5,
      icon: _I.ingredient("flower_red_2.png")
    },
    "Red Flower": {
      description: "A common red wildflower — mildly medicinal and used in basic healing tinctures. Eating the petals provides the faintest healing.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { life: 1 }, weight: 0.1, value: 3,
      icon: _I.ingredient("flower_red.png")
    },
    "Spiritbloom": {
      description: "A ghostly pale flower that grows near burial grounds — associated with spirit-communication and undead lore. Dangerous to consume: drains vitality while opening the mind to mana.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: { life: -5, mana: 5 }, weight: 0.1, value: 25,
      icon: _I.ingredient("flower_res_60.png")
    },
    "Shadowpetal": {
      description: "A dark flower that blooms only at midnight — core ingredient in invisibility and stealth preparations. Consuming it raw grants a furtive alertness.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: { stamina: 3, mana: 4 }, weight: 0.1, value: 28,
      icon: _I.ingredient("flower_shadow.png")
    },
    "Valerian Root": {
      description: "The root of Valeriana officinalis — a pungent but effective herb used in fever-breaking and sleep preparations. Chewing a piece calms the body, though it induces drowsiness.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 2 }, weight: 0.1, value: 4,
      icon: _I.ingredient("valerian_root.png")
    },
    "Asafoetida": {
      description: "A powerfully pungent resin (Ferula) dried to a gum — its foul odour repels insects and animals.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 2,
      icon: _I.ingredient("asafoetida.png")
    },
    "White Blossom": {
      description: "A simple white flower with a clean, mild fragrance — used in purification and cleansing preparations. Eating the petals is pleasant and mildly calming.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 1 }, weight: 0.1, value: 3,
      icon: _I.ingredient("flower_white.png")
    },
    "Wildflower Cluster": {
      description: "A cluster of small mixed wildflowers — gathered in a handful, pleasant smelling, mildly useful. Eating a handful provides negligible but real nourishment.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 1 }, weight: 0.2, value: 2,
      icon: _I.ingredient("flowers_res_53.png")
    },
    "Meadow Flowers": {
      description: "A bundle of colourful meadow flowers — used in dyes and decorative preparations. Edible in a pinch.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 1 }, weight: 0.2, value: 2,
      icon: _I.ingredient("flowers_res_57.png")
    },
    "Chamomile": {
      description: "Clusters of small daisy-like chamomile flowers (Matricaria) — calming, mildly anti-inflammatory, pleasant-scented. Eating the flowers raw provides mild relief.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 2 }, weight: 0.1, value: 2,
      icon: _I.ingredient("chamomile.png")
    },
    "Thick Fur": {
      description: "A dense, coarse pelt from a large-bodied animal — excellent insulation for winter clothing.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 9,
      icon: _I.ingredient("fur_2.png")
    },
    "Soft Fur": {
      description: "A silky fur pelt from a smaller creature — luxurious to the touch and worth good coin to furriers.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.8, value: 12,
      icon: _I.ingredient("fur.png")
    },
    "Garlic": {
      description: "A bulb of pungent garlic — potent flavouring for food and a component in some protective charms. Eating a raw clove is pungent but slightly fortifying.",
      type: "material", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 1 }, weight: 0.1, value: 1,
      icon: _I.ingredient("garlic.png")
    },
    "Goblin Eye": {
      description: "A pickled goblin eye — foul-smelling but surprisingly useful in low-light vision potions.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 7,
      icon: _I.ingredient("goblin_eye.png")
    },
    "Slime Goo": {
      description: "A thick greenish ooze harvested from a slime creature — adhesive and useful in binding agents.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 4,
      icon: _I.ingredient("goo.png")
    },
    "Parsley": {
      description: "Fresh flat-leaf parsley — a common culinary herb that adds brightness to camp cooking. Edible raw, mildly refreshing.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 1 }, weight: 0.05, value: 1,
      icon: _I.ingredient("greens_parsley.png")
    },
    "Heart": {
      description: "The heart of a creature, still faintly warm — a potent alchemical ingredient with life-force properties.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.6, value: 15,
      icon: _I.ingredient("heart.png")
    },
    "Yarrow": {
      description: "Achillea millefolium — a feathery-leafed herb with a peppery scent, long used as a wound-staunching and fever-reducing plant. Chewing the leaves aids minor healing.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { life: 2, stamina: 1 }, weight: 0.1, value: 3,
      icon: _I.ingredient("yarrow.png")
    },
    "Basil Herb": {
      description: "A cultivated strain of basil with larger, more aromatic leaves than the wild variety. Edible raw and pleasant.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 1 }, weight: 0.05, value: 2,
      icon: _I.ingredient("herb_basil.png")
    },
    "Dill": {
      description: "Feathery dill fronds with a distinctive anise flavour — used in pickling and fish preparations. Mildly refreshing eaten raw.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 1 }, weight: 0.05, value: 2,
      icon: _I.ingredient("herb_dill.png")
    },
    "Dragonherb": { // ⚑ FLAG: Fantasy fire-resistance herb, no clear real counterpart
      description: "A fiery-red herb that burns the tongue — used in fire-resistance potions and spicy camp food.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.1, value: 18,
      icon: _I.ingredient("herb_dragon.png")
    },
    "Rue": {
      description: "Ruta graveolens — a bitter blue-green herb with a sharp smell, traditionally used in curse-breaking, antidotes, and warding preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 10,
      icon: _I.ingredient("rue.png")
    },
    "Herb Parsley": {
      description: "A robust variety of parsley with thicker stems — stronger-flavoured and better for stews.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.05, value: 1,
      icon: _I.ingredient("herb_parsley.png")
    },
    "Poisonous Herb": {
      description: "A deceptively pleasant-smelling herb with toxic properties — handle with care.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 8,
      icon: _I.ingredient("herb_poisonous.png")
    },
    "Raptor Herb": { // ⚑ FLAG: Scent-masking hunter herb, no clear real counterpart
      description: "A sharp-leafed herb used by hunters to mask their scent — consumed to reduce detection by animals.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 9,
      icon: _I.ingredient("herb_raptor.png")
    },
    "Rucola": {
      description: "Peppery wild arugula — a nutritious green that grows readily and adds flavour to any meal.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 4 }, weight: 0.1, value: 1,
      icon: _I.ingredient("herb_rucola.png")
    },
    "Wormwood": {
      description: "Bitter silvery wormwood — used in digestives, anti-parasitic preparations, and as a repellent.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 4,
      icon: _I.ingredient("herb_worm.png")
    },
    "Monster Horn Fragment": {
      description: "A piece of broken monster horn — durable and imbued with the creature's innate power.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.8, value: 14,
      icon: _I.ingredient("horn_loot.png")
    },
    "Twin Horns": {
      description: "A pair of curved horns from a large horned beast — valuable for crafting helmets and ritual items.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.5, value: 20,
      icon: _I.ingredient("horns_2.png")
    },
    "Curved Horn": {
      description: "A single curved horn from a common horned animal — used in instrument-making and as a drinking vessel.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.9, value: 8,
      icon: _I.ingredient("horns.png")
    },
    "Healing Leaves": {
      description: "Broad, waxy leaves known for their antiseptic properties — applied as a poultice to wounds.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 5,
      icon: _I.ingredient("leaves_heal.png")
    },
    "Mana Leaves": {
      description: "Shimmering leaves that hold trace arcane energy — brewed into teas for mild mana recovery.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 8,
      icon: _I.ingredient("leaves_mana.png")
    },
    "Deep Roots Leaf": {
      description: "A serrated leaf from a deep-rooted woodland plant — used in endurance-boosting preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 3,
      icon: _I.ingredient("leaves_res_52.png")
    },
    "Sage": {
      description: "Salvia officinalis — grey-green aromatic leaves used in cooking, smoke-cleansing rituals, and herbal teas.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.05, value: 2,
      icon: _I.ingredient("sage.png")
    },
    "Thornleaf": {
      description: "A tough, serrated leaf with minor defensive compounds — used in poison-resistance brews.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 3,
      icon: _I.ingredient("leaves_res_55.png")
    },
    "Marsh Marigold": {
      description: "Caltha palustris — a bright yellow wetland plant with broad, water-repellent leaves used in marsh survival and dyeing.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 2,
      icon: _I.ingredient("marsh_marigold.png")
    },
    "Dry Leaves": {
      description: "Crinkled fallen leaves from the forest floor — good for tinder and basic herbalism.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 5, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 0,
      icon: _I.ingredient("leaves.png")
    },
    "Lemon": {
      description: "A tart yellow citrus fruit — adds vitamin content to rations and is used in some restorative brews.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 }, weight: 0.2, value: 2,
      icon: _I.ingredient("lemon.png")
    },
    "Magic Powder": {
      description: "A shimmering powder of concentrated arcane material — used in the most powerful enchanting recipes.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Epic",
      baseEffect: {}, weight: 0.1, value: 75,
      icon: _I.ingredient("magic_powder.png")
    },
    "Monster Ear": {
      description: "A severed creature ear, oddly well-preserved — used in hearing-enhancement tonics and trophies.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 5,
      icon: _I.ingredient("monster_ear.png")
    },
    "Monster Eye": {
      description: "A large, glassy monster eye — used in vision potions and as an alchemical reagent.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.3, value: 10,
      icon: _I.ingredient("monster_eye.png")
    },
    "Monster Hand": {
      description: "A severed monster hand with elongated fingers — alchemists prize these for their inherent strength essence.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.5, value: 12,
      icon: _I.ingredient("monster_hand.png")
    },
    "Monster Leg": {
      description: "A severed monster leg joint — useful as a crafting component or a grisly trophy.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.0, value: 10,
      icon: _I.ingredient("monster_leg.png")
    },
    "Lungwort": {
      description: "A spotted grey-green lichen (Lobaria pulmonaria) that grows on old trees — antiseptic and used in wound treatment.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 2,
      icon: _I.ingredient("lungwort.png")
    },
    "Death Cap": {
      description: "Amanita phalloides — a pale deadly mushroom responsible for most fatal mushroom poisonings. Handle with utmost care.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.2, value: 15,
      icon: _I.ingredient("death_cap.png")
    },
    "Demon Mushroom": {
      description: "A pitch-black mushroom with a foul aura — grows near dark magic concentrations.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.2, value: 30,
      icon: _I.ingredient("mushroom_demon.png")
    },
    "Mana Mushroom": {
      description: "A violet-capped mushroom that pulses faintly with arcane energy — brewed into mana potions.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.2, value: 12,
      icon: _I.ingredient("mushroom_mana.png")
    },
    "Large Poison Mushroom": {
      description: "A large, brilliantly coloured mushroom — beautiful to look at, but highly toxic.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.4, value: 12,
      icon: _I.ingredient("mushroom_poisonous_2.png")
    },
    "Poison Mushroom": {
      description: "A small spotted mushroom toxic to humans — extract its venom for poisons or antidote reagents.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 6,
      icon: _I.ingredient("mushroom_poisonous.png")
    },
    "Raindrop Mushroom": {
      description: "A translucent pale mushroom that appears only after rain — has mild hydrating properties.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 }, weight: 0.15, value: 4,
      icon: _I.ingredient("mushroom_raindrop.png")
    },
    "Chanterelle": {
      description: "A golden-yellow funnel-shaped mushroom (Cantharellus cibarius) — one of the finest edible fungi with a fruity, peppery aroma.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 7 }, weight: 0.2, value: 5,
      icon: _I.ingredient("chanterelle.png")
    },
    "Speckled Mushroom": { // ⚑ FLAG: Too generic, no clear real counterpart
      description: "A brown mushroom covered in white specks — properties unclear, often found near old ruins.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 3,
      icon: _I.ingredient("mushroom_res_126.png")
    },
    "Indigo Milk Cap": {
      description: "A striking blue-capped mushroom (Lactarius indigo) that exudes blue milk when cut — rare and medicinally curious.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.2, value: 10,
      icon: _I.ingredient("indigo_milk_cap.png")
    },
    "Fly Agaric": {
      description: "The iconic red-capped mushroom with white spots (Amanita muscaria) — toxic and mildly hallucinogenic, used sparingly in vision preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 5,
      icon: _I.ingredient("fly_agaric.png")
    },
    "Shadow Mushroom": {
      description: "A near-black mushroom from cavern depths — used in stealth and shadow potions.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.2, value: 20,
      icon: _I.ingredient("mushroom_shadow.png")
    },
    "Giant Stinkhorn": {
      description: "A massive Phallus impudicus fruiting body with an overwhelmingly foul smell — used in repellents and creature-deterring traps.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 3,
      icon: _I.ingredient("giant_stinkhorn.png")
    },
    "Stinkhorn": {
      description: "A small egg-like fungus (Phallus impudicus) with a fetid stench — grows near rotting wood, avoided by most creatures.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 2,
      icon: _I.ingredient("stinkhorn.png")
    },
    "Cooked Mushrooms": {
      description: "Mushrooms sautéed in their own juices over the fire — earthy, filling, and safe to eat.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 10 }, weight: 0.3, value: 4,
      icon: _I.ingredient("mushrooms_cooked.png")
    },
    "Ancient Claw": {
      description: "A fossilized claw of enormous size — from a creature long extinct, incredibly hard and valuable.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.5, value: 35,
      icon: _I.ingredient("old_claw.png")
    },
    "Peanut": {
      description: "A handful of raw peanuts — high in protein, easy to carry, a reliable trail snack.",
      type: "material", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 }, weight: 0.1, value: 1,
      icon: _I.ingredient("peanut.png")
    },
    "Plant Oil": {
      description: "Oil pressed from seeds or nuts — used in cooking, lamp fuel, and as a weapon lubricant.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 4,
      icon: _I.ingredient("plant_oil.png")
    },
    "Veilwort": {
      description: "A rare plant with translucent leaves that seem to shimmer — used in invisibility and illusion brews.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.1, value: 25,
      icon: _I.ingredient("res_09.png")
    },
    "Thornspire": {
      description: "A spiny plant with crystalline thorns — extracts from its stem are used in pain and paralytic preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.2, value: 11,
      icon: _I.ingredient("res_10.png")
    },
    "Dustbloom": {
      description: "A dry, powdery flower that releases a cloud of spores when crushed — used in smoke-screen preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 8,
      icon: _I.ingredient("res_121.png")
    },
    "Gloomcap": {
      description: "A dark, waxy plant cap found in damp caves — absorbs ambient magic and is useful in mana regulation potions.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.2, value: 10,
      icon: _I.ingredient("res_123.png")
    },
    "Shimmerleaf": {
      description: "A leaf with an iridescent metallic sheen — associated with light and revelation magic.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.1, value: 22,
      icon: _I.ingredient("res_134.png")
    },
    "Duskbloom Petal": {
      description: "A petal from the rare duskbloom — a flower that blooms only at twilight and holds both light and dark properties.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.05, value: 20,
      icon: _I.ingredient("res_62.png")
    },
    "Witchwood Sap": {
      description: "A resinous sap tapped from a gnarled witchwood tree — a binding agent in dark alchemical preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.3, value: 28,
      icon: _I.ingredient("res_89.png")
    },
    "Emberseed": {
      description: "A heat-generating seed found near volcanic terrain — used in fire elemental preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.05, value: 14,
      icon: _I.ingredient("res_90.png")
    },
    "Frostpetal": {
      description: "A crystalline-looking flower petal that remains cool to the touch even in summer — used in cooling potions.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.05, value: 13,
      icon: _I.ingredient("res_94.png")
    },
    "Gnarled Root": {
      description: "A twisted, knotted root from an old growth tree — has concentrated mineral and herbal properties.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 4,
      icon: _I.ingredient("root.png")
    },
    "Red Rose": {
      description: "A cultivated red rose — symbol of passion, used in love charms and as a common offering.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 2,
      icon: _I.ingredient("rose_red.png")
    },
    "Wild Rose": {
      description: "A small, thorny wild rose with five petals — more potent than cultivated varieties in alchemical work.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 3,
      icon: _I.ingredient("rose_wild.png")
    },
    "Yellow Rose": {
      description: "A cheerful yellow rose — associated with friendship and used in mood-lifting preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 2,
      icon: _I.ingredient("rose_yellow.png")
    },
    "Rose": {
      description: "A single pink rose, thorns carefully removed — a classic gift and a mild alchemical ingredient.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 2,
      icon: _I.ingredient("rose.png")
    },
    "Rose Bundle": {
      description: "A tied bundle of mixed roses — a romantic gesture or a batch for alchemical processing.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.4, value: 6,
      icon: _I.ingredient("roses.png")
    },
    "Salt": {
      description: "Coarse rock salt for preserving food and seasoning meals — also used in purification rituals.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 2,
      icon: _I.ingredient("salt.png")
    },
    "Sea Kale": {
      description: "A tough coastal plant with thick, salty leaves — highly nutritious and often pickled.",
      type: "material", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 6 }, weight: 0.3, value: 2,
      icon: _I.ingredient("seakale.png")
    },
    "Seaweed": {
      description: "Dried ribbons of dark seaweed — mineral-rich and used in coastal cuisines and healing preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 2,
      icon: _I.ingredient("seaweed_2.png")
    },
    "Fresh Seaweed": {
      description: "Freshly gathered seaweed — slippery and pungent, but packed with minerals.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 1,
      icon: _I.ingredient("seaweed.png")
    },
    "Spikelets": {
      description: "Dried grass spikelets gathered from meadows — used in weaving, stuffing, and minor herbal blends.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 1,
      icon: _I.ingredient("spikelets.png")
    },
    "Stickleback Fish": {
      description: "A tiny spiny fish caught in streams — too small to cook alone but good in soups.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 1,
      icon: _I.ingredient("sticklebacks.png")
    },
    "Scorpion Sting": {
      description: "A severed scorpion stinger — the venom within is a potent poison ingredient.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 12,
      icon: _I.ingredient("sting.png")
    },
    "Pebbles": {
      description: "A handful of smooth water-worn pebbles — used as sling ammunition or in camp construction.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 0,
      icon: _I.ingredient("stones.png")
    },
    "Sunflower": {
      description: "A tall yellow sunflower — its seeds are edible and oil-rich, its petals used in mild healing tinctures.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 2,
      icon: _I.ingredient("sunflower.png")
    },
    "Tendril": {
      description: "A flexible vine tendril, still green and supple — used for binding and weaving.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 1,
      icon: _I.ingredient("tendril.png")
    },
    "Tulips": {
      description: "A bunch of bright tulips — decorative but also mildly medicinal in poultice form.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 2,
      icon: _I.ingredient("tulips.png")
    },
    "Tusk": {
      description: "A large ivory tusk — valuable to traders and craftsmen for carving and weaponsmithing.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 3.0, value: 30,
      icon: _I.ingredient("tusk.png")
    },
    "Wheat": {
      description: "A handful of wheat stalks — can be threshed and ground into flour for baking.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 1,
      icon: _I.ingredient("wheat.png")
    },
    "Wing": {
      description: "A wing stripped from a flying creature — used in flight-related enchantments and light armour crafting.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.6, value: 10,
      icon: _I.ingredient("wing.png")
    },
    "Earthworm": {
      description: "A large earthworm, still wriggling — used as fishing bait and in some unusual alchemical preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.05, value: 0,
      icon: _I.ingredient("worm.png")
    },
    "Barite": {
      description: "A heavy, white mineral ore — used as flux in smelting and prized by alchemists for its weight-to-size ratio.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 4.0, value: 5,
      icon: _I.material("barite_ore.png")
    },
    "Wooden Boards": {
      description: "Rough-sawn lumber planks — the basic building block of shelters, crates, and furniture.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 40, rarity: "Common",
      baseEffect: {}, weight: 4.0, value: 4,
      icon: _I.material("boards.png")
    },
    "Dried Clay": {
      description: "Sun-baked clay formed into a block — the foundation of bricks, pottery, and basic construction.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 2,
      icon: _I.material("clay_dried.png")
    },
    "Cloth Roll": {
      description: "A roll of uncut undyed cloth — the raw material for clothing, bandages, and camp textiles.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.5, value: 6,
      icon: _I.material("cloth_roll.png")
    },
    "Torn Cloth": {
      description: "Ragged strips of torn fabric — useful for makeshift bandages or tinder, not much else.",
      type: "material", consumable: false, wearable: false,
      condition: "Worn", burnTime: 10, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 1,
      icon: _I.material("cloth_torn.png")
    },
    "Wool Cloth": {
      description: "Thick woven woollen cloth — warm and water-resistant, valued for cold-weather clothing.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.2, value: 8,
      icon: _I.material("cloth_wool.png")
    },
    "Coal": {
      description: "A chunk of dense black coal — burns long and hot, far more efficient than wood for forges and fires.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 120, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 4,
      icon: _I.material("coal.png")
    },
    "Cobalt Ore": {
      description: "A bright blue-grey metallic ore — an alloying metal that makes steel harder and more resistant to heat.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 4.0, value: 18,
      icon: _I.material("cobalt_ore.png")
    },
    "Copper Ore": {
      description: "A green-streaked chunk of copper ore — foundational for bronze alloys and electrical conductors.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.5, value: 7,
      icon: _I.material("copper_ore.png")
    },
    "Blue Crystal": {
      description: "A clear azure crystal that resonates with water magic — used in cooling potions and frost enchantments.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.5, value: 15,
      icon: _I.material("crystal_blue.png")
    },
    "Large Green Crystal": {
      description: "A substantial green-faceted crystal thrumming with nature energy — rare and sought by druids.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.0, value: 35,
      icon: _I.material("crystal_green_large.png")
    },
    "Magic Crystal": {
      description: "A multi-coloured crystal swirling with raw arcane energy — dangerous without proper handling.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.6, value: 45,
      icon: _I.material("crystal_magic.png")
    },
    "Orange Crystal": {
      description: "A warm amber crystal that radiates faint heat — used in fire-magic preparations.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.5, value: 20,
      icon: _I.material("crystal_orange.png")
    },
    "Large Purple Crystal": {
      description: "A large deep-violet crystal vibrating at a low frequency — linked to shadow and illusion magic.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.2, value: 40,
      icon: _I.material("crystal_purple_large.png")
    },
    "Purple Crystal": {
      description: "A small purple crystal with a faint inner glow — minor shadow resonance.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.4, value: 18,
      icon: _I.material("crystal_purple.png")
    },
    "Large Red Crystal": {
      description: "A large blood-red crystal pulsing with life-force energy — prized for healing enchantments.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.1, value: 38,
      icon: _I.material("crystal_red_large.png")
    },
    "Red Crystal": {
      description: "A red-faceted crystal with subtle warmth — used in vitality and life-force potions.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.4, value: 16,
      icon: _I.material("crystal_red.png")
    },
    "Large White Crystal": {
      description: "A large pure white crystal of exceptional clarity — channels divine and light magic.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.0, value: 42,
      icon: _I.material("crystal_white_large.png")
    },
    "Large Yellow Crystal": {
      description: "A large golden-yellow crystal that crackles with static electricity — used in lightning-based enchantments.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.0, value: 36,
      icon: _I.material("crystal_yellow_large.png")
    },
    "Ghost Ore": {
      description: "A pale, semi-translucent ore that seems to phase between solid and spirit — incredibly rare and magically unstable.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Epic",
      baseEffect: {}, weight: 2.0, value: 100,
      icon: _I.material("ghost_ore.png")
    },
    "Gold Ore Chunk": {
      description: "A large, glittering chunk of gold ore still embedded in rock matrix — needs smelting.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 5.0, value: 25,
      icon: _I.material("gold_ore_large.png")
    },
    "Gold Ore": {
      description: "A small nugget of raw gold ore — valuable raw material for smelting into coin or jewellery.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 2.0, value: 12,
      icon: _I.material("gold_ore.png")
    },
    "Hardstone": {
      description: "An unusually dense and hard stone — does not chip easily and is prized for tool-making.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 6.0, value: 5,
      icon: _I.material("hardstone.png")
    },
    "Ilmenite": {
      description: "A black metallic mineral ore — a source of titanium and used in specialist alloy work.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 4.5, value: 14,
      icon: _I.material("ilmenite.png")
    },
    "Black Iron Ingot": {
      description: "An ingot of dark iron smelted with coal impurities — harder than standard iron but more brittle.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 5.5, value: 16,
      icon: _I.material("ingot_black_iron.png")
    },
    "Copper Ingot": {
      description: "A bar of refined copper — used for bronze alloys, pipes, and basic metalwork.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 4.5, value: 9,
      icon: _I.material("ingot_copper.png")
    },
    "Gold Ingot": {
      description: "A gleaming bar of refined gold — currency of kings and the envy of thieves.",
      type: "material", consumable: false, wearable: false,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 5.0, value: 60,
      icon: _I.material("ingot_gold.png")
    },
    "Silver Ingot": {
      description: "A bright bar of refined silver — used in fine jewellery, alchemical work, and enchanted armaments.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 5.0, value: 25,
      icon: _I.material("ingot_silver.png")
    },
    "Clear Iron Ore": {
      description: "A high-purity iron ore with few impurities — produces excellent-quality metal when smelted.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 4.0, value: 10,
      icon: _I.material("iron_ore_clear.png")
    },
    "Iron Ore Fragments": {
      description: "Loose fragments of iron ore broken from larger deposits — lower grade but gathered in bulk.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.5, value: 4,
      icon: _I.material("iron_ore_fragments.png")
    },
    "Iron Ore": {
      description: "A raw chunk of iron ore — needs to be smelted before it can be worked.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.5, value: 5,
      icon: _I.material("iron_ore.png")
    },
    "Leather": {
      description: "Tanned and treated animal hide — the standard material for armour, bags, and bindings.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.5, value: 7,
      icon: _I.material("leather.png")
    },
    "Log": {
      description: "A freshly cut log — needs to be split before burning, but works well for camp construction.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 50, rarity: "Common",
      baseEffect: {}, weight: 6.0, value: 2,
      icon: _I.material("log.png")
    },
    "Magnesite": {
      description: "A white mineral ore — used in heat-resistant linings for forges and high-temperature smelting.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.5, value: 6,
      icon: _I.material("magnesite.png")
    },
    "Mana Stone": {
      description: "A smooth stone saturated with ambient magical energy — used as a mana battery in enchanted items.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.8, value: 50,
      icon: _I.material("mana_stone.png")
    },
    "Manganese Ore": {
      description: "A grey-black metallic ore — used as a steel hardener and in the production of glass.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 4.0, value: 8,
      icon: _I.material("manganese_ore.png")
    },
    "Mineral Chunk": {
      description: "An unidentified mineral — could be valuable, could be worthless. An assayer could tell you which.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 3,
      icon: _I.material("mineral.png")
    },
    "Peacock Ore": {
      description: "A dazzlingly iridescent copper-based ore that shifts through blue, purple, and gold — also called bornite.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 3.5, value: 12,
      icon: _I.material("peacock_ore.png")
    },
    "Quest Material": {
      description: "A strange, glowing material of unknown origin. Someone, somewhere, is looking for this.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.0, value: 0,
      icon: _I.material("quest_material.png")
    },
    "Silver Bar": {
      description: "A refined silver bar — slightly smaller than a full ingot, used in jewellery and fine crafting.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 3.5, value: 20,
      icon: _I.material("silver_bar.png")
    },
    "Silver Ore": {
      description: "Raw silver ore with metallic veins running through grey host rock.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 3.0, value: 10,
      icon: _I.material("silver_ore.png")
    },
    "Bundle of Sticks": {
      description: "A bundle of dry sticks tied with twine — quick to light and good for starting fires.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 15, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 1,
      icon: _I.material("sticks_2.png")
    },
    "Sticks": {
      description: "A handful of fallen branches — basic tinder for campfires.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 10, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 0,
      icon: _I.material("sticks.png")
    },
    "Stone Fragments": {
      description: "Loose shards of broken rock — useful for sharpening blades and as basic projectiles.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.5, value: 0,
      icon: _I.material("stone_fragments.png")
    },
    "Loose Stones": {
      description: "A collection of smooth stones — useful for slings, camp weights, and simple traps.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 0,
      icon: _I.material("stones.png")
    },
    "Wood Plank": {
      description: "A smooth-cut plank of hardwood — precision-cut for construction and carpentry work.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 35, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 4,
      icon: _I.material("wood_plank.png")
    },
    "Raw Wood": {
      description: "Freshly felled wood, still green — needs to dry before it burns well or can be shaped.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 20, rarity: "Common",
      baseEffect: {}, weight: 5.0, value: 1,
      icon: _I.material("wood.png")
    },
    "Yarn": {
      description: "A skein of spun wool yarn — used in weaving, rope-making, and crafting textile armour layers.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.4, value: 3,
      icon: _I.material("yarn.png")
    },
  },

  Misc: {
    "Ancient Artifact Fragment": {
      description: "A fragment of an ancient device covered in runic inscriptions that match no known script. It feels faintly warm and hums almost imperceptibly. One of twelve.",
      type: "misc", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.2, value: 0,
      icon: _I.misc("parchment.png")
    },
    "Small Wood Bundle": {
      description: "A bundle of small logs.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 60, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 5,
      icon: _I.icon("sticks.png")
    },
    "Large Wood Bundle": {
      description: "A bundle of large logs.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 90, rarity: "Common",
      baseEffect: {}, weight: 5.0, value: 7,
      icon: _I.icon("large-logs.png")
    },
    "Stick Bundle": {
      description: "A bundle of sticks.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 30, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 5,
      icon: _I.icon("sticks.png")
    },
    "Firewood": {
      description: "A modest armful of chopped wood, enough to start or sustain a fire for a while.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 60, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 3,
      icon: _I.icon("firewood.png")
    },
    "Kindling": {
      description: "A bundle of dried leaves and grass.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 5, rarity: "Common",
      baseEffect: {}, weight: 0.25, value: 0,
      icon: _I.ingredient("grass.png")
    },
    "Stone": {
      description: "A stone.",
      type: "material", consumable: false, wearable: false,
      condition: "None", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 5.0, value: 1,
      icon: _I.material("stone.png")
    },
    "Small Firewood": {
      description: "A small bundle of split firewood, enough to keep a campfire going for a short while.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 45, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 2,
      icon: _I.icon("small-firewood.png")
    },
    "Large Firewood": {
      description: "A heavy bundle of seasoned logs that sustains a campfire through the night.",
      type: "material", consumable: false, wearable: false,
      condition: "Dry", burnTime: 120, rarity: "Common",
      baseEffect: {}, weight: 5.0, value: 4,
      icon: _I.icon("large-firewood.png")
    },
    "Camp Supplies": {
      description: "A mixed pack of basic camp essentials — rope, flint, rations, and spare cloth.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 4.0, value: 10,
      icon: _I.icon("camp-supplies.png")
    },
    "Shelter Leaves": {
      description: "A bundle of broad, water-shedding leaves gathered to thatch a makeshift shelter.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 1,
      icon: _I.icon("shelter-leaves.png")
    },
    "Tent": {
      description: "A canvas tent with stakes and guy-lines — provides reliable shelter and a protected night's sleep.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { shelterBonus: 8 }, weight: 6.0, value: 25,
      icon: _I.icon("tent.png")
    },
    "Barricade": {
      description: "A heavy wooden barricade of staked logs that can be set up around camp for defence.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { defenseBonus: 5 }, weight: 8.0, value: 15,
      icon: _I.icon("barricade.png")
    },
    "Campfire Kit": {
      description: "Stones, tinder, and arranged kindling — everything needed to get a fire going quickly without foraging.",
      type: "misc", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 6,
      icon: _I.icon("campfire.png")
    },
    "Lit Campfire": {
      description: "A campfire already burning — warmth and light in one.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 120, rarity: "Common",
      baseEffect: {}, weight: 0, value: 0,
      icon: _I.misc("campfire_lit.png")
    },
    "Bandage Roll": {
      description: "A full roll of clean linen bandages — enough to dress several wounds.",
      type: "tool", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { life: 20 }, weight: 0.4, value: 8,
      icon: _I.misc("bandage_loot.png")
    },
    "Bear Hide": {
      description: "A thick hide stripped from a bear — valuable to tanners and armourers.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 4.0, value: 15,
      icon: _I.material("skin_great.png")
    },
    "Wolf Hide": {
      description: "A wolf pelt, coarse and durable — sought by furriers and trappers.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 8,
      icon: _I.material("skin_great.png")
    },
    "Deer Hide": {
      description: "A supple deerskin — ideal for crafting leather goods.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.5, value: 7,
      icon: _I.material("skin_deer.png")
    },
    "Boar Hide": {
      description: "A tough, bristled boar pelt — coarse but durable, prized by tanners for sturdy leather.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 9,
      icon: _I.material("skin_great.png")
    },
    "Rabbit Hide": {
      description: "A small, soft rabbit pelt — used for light leather goods, linings, and trim.",
      type: "material", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 3,
      icon: _I.material("skin_deer.png")
    },
    "Recipe Scroll": {
      description: "A handwritten scroll detailing a useful recipe. Study it to learn the technique.",
      type: "misc", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 12,
      icon: _I.misc("parchment.png")
    },
    "Inn Token": {
      description: "A stamped token from the local inn. Redeemable for one free night's lodging and a meal.",
      type: "misc", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0, value: 5,
      icon: _I.misc("paper.png")
    },
    "Iron Ingot": {
      description: "A bar of smelted iron, ready for the forge.",
      type: "material", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 5.0, value: 8,
      icon: _I.material("ingot_iron.png")
    },
    "Anvil": {
      description: "A heavy iron anvil — required for smithing weapons, armor, and metal tools. Not easily moved.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 80.0, value: 50,
      icon: _I.misc("anvil.png")
    },
    "Book": {
      description: "A leather-bound book filled with handwritten text. Could be a journal, a manual, or a record of forgotten knowledge.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.4, value: 8,
      icon: _I.misc("book.png")
    },
    "Camp Cauldron": {
      description: "A blackened iron cauldron set over a campfire — used for brewing potions and cooking stews in the field.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 12.0, value: 22,
      icon: _I.misc("campfire_cauldron.png")
    },
    "Lute": {
      description: "A six-string lute with a cracked lacquer finish. Playing it lifts spirits around the campfire.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { stamina: 5 }, weight: 1.5, value: 18,
      icon: _I.misc("guitar.png")
    },
    "Rusty Key": {
      description: "An old iron key spotted with rust. It clearly opens something — but what?",
      type: "misc", consumable: false, wearable: false,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 2,
      icon: _I.misc("key_43.png")
    },
    "Iron Key": {
      description: "A plain iron key, recently forged. Its purpose is unclear.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 3,
      icon: _I.misc("key_44.png")
    },
    "Ornate Key": {
      description: "A finely crafted key with decorative scrollwork — likely opens a nobleman's strongbox or estate.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 15,
      icon: _I.misc("key_54.png")
    },
    "Silver Key": {
      description: "A silver-plated key with an engraved crest. Clearly belongs to someone important.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 20,
      icon: _I.misc("key_55.png")
    },
    "Dungeon Key": {
      description: "A heavy key with a skull motif — the kind guards carry in places where prisoners aren't meant to leave.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.2, value: 25,
      icon: _I.misc("key_56.png")
    },
    "Vault Key": {
      description: "A thick, double-sided key for a reinforced vault lock. Very few of these exist.",
      type: "misc", consumable: false, wearable: false,
      condition: "Excellent", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.3, value: 40,
      icon: _I.misc("key_57.png")
    },
    "Blank Parchment": {
      description: "A clean sheet of treated animal hide — used for writing letters, maps, or copying texts.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.05, value: 2,
      icon: _I.misc("paper.png")
    },
    "Parchment Roll": {
      description: "A rolled parchment. Could be a contract, a wanted poster, or a message sealed for delivery.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 4,
      icon: _I.misc("parchment.png")
    },
    "Tattered Scroll": {
      description: "A damaged scroll with faded writing — partially legible, hinting at lost knowledge.",
      type: "misc", consumable: false, wearable: false,
      condition: "Worn", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 6,
      icon: _I.misc("scroll_2.png")
    },
    "Sealed Scroll": {
      description: "A scroll sealed with wax bearing an unfamiliar sigil. Unopened and undamaged.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.1, value: 10,
      icon: _I.misc("scroll_3.png")
    },
    "Wooden Cup": {
      description: "A simple turned wooden cup. Nothing special, but it holds what you put in it.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 1,
      icon: _I.misc("wood_cup.png")
    },
    "Spellbook": {
      description: "A tome bound in midnight-blue leather, its pages filled with arcane diagrams and mana-flow notation. Reading it deepens your understanding of magic.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.5, value: 40,
      icon: _I.misc("parchment.png")
    },
    "Prayer Book": {
      description: "A worn devotional text inlaid with silver leaf. Each verse carries the quiet weight of ages of faith. Reading it soothes the spirit and fortifies the body.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.2, value: 35,
      icon: _I.misc("parchment.png")
    },

    // ── Skill Books ──────────────────────────────────────────────────────────────
    // Combat
    "The Art of the Blade": {
      description: "A treatise on sword technique by a retired duelist. Covers guard stances, footwork, and timing. Dense with diagrams of effective parries.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.2, value: 45, skillBook: "Swordsmanship",
      icon: _I.misc("parchment.png")
    },
    "Flight of the Arrow": {
      description: "An archer's field manual: wind correction, range estimation, and the anatomy of a killing shot. Written by a competition champion.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 45, skillBook: "Archery",
      icon: _I.misc("parchment.png")
    },
    "Iron and Edge: Axework": {
      description: "A blunt, practical guide to wielding axes in combat — from wood-chopper grips to the overhead cleave favoured by soldiers.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.2, value: 40, skillBook: "Axes",
      icon: _I.misc("parchment.png")
    },
    "The Long Reach": {
      description: "A spearman's primer on reach, formation fighting, and the low-line thrust. Authored by a retired pike captain.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 40, skillBook: "Spears",
      icon: _I.misc("parchment.png")
    },
    "Glaive and Halberd": {
      description: "A study of polearm combat forms: hooking, sweeping, and overhead guards. Illustrated with training drills used by guard companies.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.2, value: 40, skillBook: "Polearms",
      icon: _I.misc("parchment.png")
    },
    "Bare Knuckle": {
      description: "A scrappy pamphlet sold under tavern counters: how to break a grip, survive a headlock, and put a man down without a weapon.",
      type: "book", consumable: false, wearable: false,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.6, value: 28, skillBook: "Brawling",
      icon: _I.misc("parchment.png")
    },

    // Wilderness & Survival
    "How to Live in the Wild": {
      description: "A comprehensive survival handbook: shelter-building, water purification, predator avoidance, and signal-fire technique.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 30, skillBook: "Survival",
      icon: _I.misc("parchment.png")
    },
    "The Hunter's Code": {
      description: "A hunter's collected wisdom on patience, territory, and clean kills. Includes seasonal movement charts for common game.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 30, skillBook: "Hunting",
      icon: _I.misc("parchment.png")
    },
    "What the Forest Offers": {
      description: "A forager's guide with hand-drawn illustrations of edible plants, fungi, and roots across six biomes. Has saved many lives.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.9, value: 28, skillBook: "Foraging",
      icon: _I.misc("parchment.png")
    },
    "Marks and Signs": {
      description: "A tracker's lexicon: footprints, scat, broken bark, disturbed earth. How to read a story from ground that looks empty.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.9, value: 30, skillBook: "Tracking",
      icon: _I.misc("parchment.png")
    },
    "The Fire Maker's Handbook": {
      description: "Every method of making fire — friction, flint, lens, fungal tinder — with notes on maintaining coals through rain and wind.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.8, value: 25, skillBook: "Fire-making",
      icon: _I.misc("parchment.png")
    },
    "Still Waters: A Fisher's Guide": {
      description: "River and lake fishing techniques: fly, bait, net, and weir. Includes tide charts and notes on seasonal fish runs.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.9, value: 25, skillBook: "Fishing",
      icon: _I.misc("parchment.png")
    },
    "The Green Compendium": {
      description: "A thorough catalog of medicinal and alchemical plants, their preparation, dosage, and dangerous interactions. A standard herbalist reference.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.3, value: 40, skillBook: "Herbalism",
      icon: _I.misc("parchment.png")
    },

    // Crafts & Trades
    "A Craftsman's Guide": {
      description: "Covers joinery, measurement, tool maintenance, and the fundamentals of working wood, leather, and simple metalwork.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 30, skillBook: "Crafting",
      icon: _I.misc("parchment.png")
    },
    "The Forge and the Flame": {
      description: "A smith's reference: alloy temperatures, hammer weights, quench methods, and the visual cues of properly worked steel.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.5, value: 45, skillBook: "Smithing",
      icon: _I.misc("parchment.png")
    },
    "Feather and Shaft": {
      description: "The craft of arrows and bows: wood selection, spine stiffness, fletching angles, and string tension for each draw weight.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 40, skillBook: "Fletching",
      icon: _I.misc("parchment.png")
    },
    "The Alchemist's Codex": {
      description: "Reaction theory, reagent sourcing, and step-by-step formulations for sixty compounds. The chapter on stabilisers alone is worth the price.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.4, value: 50, skillBook: "Alchemy",
      icon: _I.misc("parchment.png")
    },
    "The Wanderer's Cookbook": {
      description: "Campfire recipes, preservation techniques, and how to make almost anything taste better than it should. Used and annotated by dozens of previous owners.",
      type: "book", consumable: false, wearable: false,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.8, value: 28, skillBook: "Cooking",
      icon: _I.misc("parchment.png")
    },
    "Ferment and Flavour": {
      description: "A brewer's notebook covering grain selection, yeast cultivation, temperature, and the subtle art of secondary fermentation.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.9, value: 28, skillBook: "Brewing",
      icon: _I.misc("parchment.png")
    },
    "Needle and Thread": {
      description: "Pattern-making, seam strength, material properties, and repairs that last. Plain and unassuming — exactly like good needlework should be.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.7, value: 25, skillBook: "Sewing",
      icon: _I.misc("parchment.png")
    },
    "Working Wood": {
      description: "The carpenter's bible: grain direction, joint selection, load bearing, and the finishing touches that distinguish craft from construction.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.1, value: 30, skillBook: "Carpentry",
      icon: _I.misc("parchment.png")
    },
    "Deep Rock: A Miner's Handbook": {
      description: "Vein identification, geological strata, safe tunnelling, and the signals that warn of a coming collapse. Written in the dark, by feel.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.3, value: 38, skillBook: "Mining",
      icon: _I.misc("parchment.png")
    },

    // Magic
    "Radiant Paths": {
      description: "A theoretical and practical guide to channelling radiant energy — mana flow, sigil construction, and the mathematics of restorative casting.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.6, value: 65, skillBook: "Light Magic",
      icon: _I.misc("parchment.png")
    },
    "Shadows and Power": {
      description: "An unsettling but thorough examination of shadow-drawn energy: entropy binding, void resonance, and the willpower required to wield it safely.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.5, value: 65, skillBook: "Black Magic",
      icon: _I.misc("parchment.png")
    },
    "The Crimson Rites": {
      description: "A forbidden manuscript on blood-drawn power. The cover has no author. Passages are struck through in an unfamiliar hand — warnings, perhaps.",
      type: "book", consumable: false, wearable: false,
      condition: "Worn", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.3, value: 80, skillBook: "Blood Magic",
      icon: _I.misc("parchment.png")
    },

    // Social & Knowledge
    "The Art of Persuasion": {
      description: "How to read a room, pace a sentence, and find the opening in anyone's resistance. Equal parts philosophy and manipulation.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.0, value: 42, skillBook: "Persuasion",
      icon: _I.misc("parchment.png")
    },
    "Terms and Agreements": {
      description: "A merchant's reference on contract law, leverage identification, and the art of leaving both parties feeling they won.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 42, skillBook: "Negotiating",
      icon: _I.misc("parchment.png")
    },
    "The Healer's Companion": {
      description: "Field medicine for those without a clinic: wound assessment, improvised sutures, fever management, and when to cut rather than wait.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.2, value: 45, skillBook: "Healing",
      icon: _I.misc("parchment.png")
    },
    "Codes and Ciphers": {
      description: "Historical and modern cipher systems, frequency analysis, and methods for breaking encryptions without a key. Authored by a royal intelligence archivist.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.2, value: 48, skillBook: "Decrypting",
      icon: _I.misc("parchment.png")
    },

    // Roguish
    "Moving in Silence": {
      description: "A thief-taker's field notes, repurposed. Ironically, it describes how to avoid being caught rather than how to catch. Sold wrapped in plain cloth.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.8, value: 60, skillBook: "Stealth",
      icon: _I.misc("parchment.png")
    },
    "The Locksmith's Art": {
      description: "Pin tumbler mechanics, warded key geometry, and how any lock can be opened with enough patience and the right touch. Officially sold only to licensed locksmiths.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.9, value: 55, skillBook: "Lockpicking",
      icon: _I.misc("parchment.png")
    },
    "Sleight of Hand": {
      description: "A performer's manual that is decidedly more than a performer's manual. Palm transfers, misdirection, and the psychology of inattention.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.7, value: 60, skillBook: "Thievery",
      icon: _I.misc("parchment.png")
    },

    // Trades & Professions
    "The Beastkeeper's Handbook": {
      description: "Animal psychology, training methods, wound care for livestock, and how to earn trust from a creature that has no reason to give it.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 32, skillBook: "Animal Handling",
      icon: _I.misc("parchment.png")
    },
    "By Star and Compass": {
      description: "Celestial navigation, landmark triangulation, and dead reckoning for overland travel. Essential reading for those who go where maps run out.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 42, skillBook: "Navigation",
      icon: _I.misc("parchment.png")
    },
    "Form and Colour": {
      description: "Principles of visual composition, pigment theory, and the observation skills that separate technique from art. Heavily illustrated.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 28, skillBook: "Artistry",
      icon: _I.misc("parchment.png")
    },
    "The Unseen World": {
      description: "A scholar's survey of omen interpretation, spiritual resonance, and the documented cases where the invisible world bent toward those who were paying attention.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.3, value: 65, skillBook: "Mysticism",
      icon: _I.misc("parchment.png")
    },

    // ── Lore Books ───────────────────────────────────────────────────────────────
    // History
    "The Fall of the Aegrim Empire": {
      description: "A scholarly account of the Aegrim Empire's collapse three centuries ago — how a succession war fractured the continent's greatest power into the ten kingdoms that remain today.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.3, value: 40, loreBook: "aegrim-empire-fall",
      icon: _I.misc("parchment.png")
    },
    "Thirty Years of Silence": {
      description: "A military history of the Sundering War — the grinding, generation-long conflict that remade the continent's borders and ended not with victory but with exhaustion.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.4, value: 55, loreBook: "the-sundering-war",
      icon: _I.misc("parchment.png")
    },

    // Kingdom Chronicles
    "A Compact of Lords": {
      description: "A chronicle of Ardrenhold's founding — the agreement between three noble families that shaped a kingdom built on pact rather than conquest.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 35, loreBook: "ardrenhold-founding-pact",
      icon: _I.misc("parchment.png")
    },
    "The Iron Lords: A Ruling History": {
      description: "An account of Feldarún's unusual ruling class — drawn not from warriors but from the mining engineers who keep the kingdom's deep veins from flooding or killing.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.2, value: 35, loreBook: "feldarun-iron-lords",
      icon: _I.misc("parchment.png")
    },
    "Harbour and Sword": {
      description: "A political account of how a forty-year tariff dispute between Naradreth's eastern and western lords hardened into the civil war now tearing the kingdom apart.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 35, loreBook: "naradreth-civil-war-roots",
      icon: _I.misc("parchment.png")
    },

    // Arcane Studies
    "On the Six Schools of Arcane Thought": {
      description: "A survey of the six magical traditions — Conjuration, Evocation, Divination, Illusion, Transmutation, and the rarely-discussed sixth school of Entropy.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.3, value: 40, loreBook: "six-schools-arcane",
      icon: _I.misc("parchment.png")
    },
    "The Corrupted Spires: A Field Survey": {
      description: "Notes from an expedition to three ancient towers in the northeast — structures that predate any known civilisation and which compasses behave strangely near.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 1.0, value: 50, loreBook: "corrupted-spires",
      icon: _I.misc("parchment.png")
    },

    // Bestiaries
    "Trolls and Their Ways": {
      description: "A practical field guide to hill troll behaviour — territorial habits, regeneration, ambush patterns, and why torches help more than swords.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 25, loreBook: "hill-troll-behavior",
      icon: _I.misc("parchment.png")
    },
    "Winged Threats of the Northern Peaks": {
      description: "A study of the wyvern population in the Rendarost peaks — anatomy, hunting patterns, territorial nesting behaviour, and why the local militia maintains signal fires.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 30, loreBook: "wyverns-of-rendarost",
      icon: _I.misc("parchment.png")
    },

    // Legends & Folklore
    "Songs from the Road": {
      description: "A collection of travelling tales — including the legend of the Wandering Flame and the impossible accounts of Aldrath the Unbroken, a man who appeared in six kingdoms' histories across ninety years without aging.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.9, value: 22, loreBooks: ["the-wandering-flame", "aldrath-the-unbroken"],
      icon: _I.misc("parchment.png")
    },
    "Heroes, Scoundrels & War the Goat": {
      description: "Beloved bardic tales of War — a one-horned goat with a career more distinguished than most generals — and Bramblewim the Barbarimp, whose battleaxe is bigger than he is.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.9, value: 20, loreBooks: ["war-the-goat", "bramblewim-the-barbarimp"],
      icon: _I.misc("parchment.png")
    },
    "Merwin's Collected Misadventures": {
      description: "The documented magical disasters of Merwin the Lucky — a wizard whose spells have never done what he intended, yet who has survived everything the world has thrown at him.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.8, value: 18, loreBook: "merwin-the-lucky",
      icon: _I.misc("parchment.png")
    },
    "Encounters on the Trading Road": {
      description: "First-hand accounts of two improbable figures: Gundrow Blackfoot, who refuses to die, and Old Fenwick the Headless Merchant, whose goods are excellent and whose continued operation defies explanation.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.9, value: 20, loreBooks: ["gundrow-the-immortal-drunk", "old-fenwick-the-headless"],
      icon: _I.misc("parchment.png")
    },
    "Strangers at the Bar": {
      description: "Two unexplained figures who keep appearing across the continent: Aunt Margrit, who has apparently been old for centuries, and the Singing Sword of Dunmarch, which will not stop performing.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.0, value: 28, loreBooks: ["aunt-margrit-the-undying", "the-singing-sword-of-dunmarch"],
      icon: _I.misc("parchment.png")
    },
    "The Eater Oak: Fact or Fable": {
      description: "A careful investigation into the oldest tree in Elder Glade — the accounts of its voice, its hunger, and the consistent pattern of logging camps in the area going silent.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.0, value: 28, loreBook: "eater-oak-of-elder-glade",
      icon: _I.misc("parchment.png")
    },
    "The Amber Moon Prophecies": {
      description: "A scholarly analysis of the Amber Moon prophecy and the career of Crumblewick, son of Crumblewick — the chosen hero who is aware of the prophecy, finds it embarrassing, and maintains he is 'getting to it'.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 30, loreBook: "crumblewick-the-failed-hero",
      icon: _I.misc("parchment.png")
    },

    // Religion & Geography
    "The Seven Aspects: A Devotional": {
      description: "A guide to the dominant faith of the continent — the seven Aspects of the divine, how temples honour them, and why the priests argue so much about what it all means.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 18, loreBook: "the-seven-aspects",
      icon: _I.misc("parchment.png")
    },
    "The Sunken Reaches: A Surveyor's Memoir": {
      description: "A surveyor's account of the lowland region that dropped several feet in living memory — a permanent wetland where paths change week to week and outside guides consider it the most dangerous terrain on the continent.",
      type: "book", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.1, value: 30, loreBook: "the-sunken-reaches",
      icon: _I.misc("parchment.png")
    },
  },

  Tools: {
    "Crafting Knife": {
      description: "A knife for crafting various items.",
      type: "tool", consumable: false, wearable: false,
      condition: "good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 5,
      icon: _I.tool("tool_butcher_knife.png")
    },
    "Hatchet": {
      description: "A short-handled hatchet suited for chopping firewood and light camp tasks.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 8,
      icon: _I.icon("hatchet.png")
    },
    "Crafting Tools": {
      description: "A set of basic crafting implements — hammer, pliers, and awl — for fashioning camp items and equipment.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 12,
      icon: _I.icon("crafting-tools.png")
    },
    "Compass": {
      description: "A brass navigation compass etched with cardinal runes. Reduces travel time when carried.",
      type: "tool", consumable: false, wearable: false,
      condition: "good", burnTime: 0, rarity: "Uncommon",
      baseEffect: { travelSpeed: 0.8 }, weight: 0.3, value: 28,
      icon: _I.icon("map_icon.png")
    },
    "Fishing Pole": {
      description: "A simple but reliable rod, line, and hook. Required for fishing.",
      type: "tool", consumable: false, wearable: false,
      condition: "good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.5, value: 8,
      icon: _I.tool("tool_fishing_rod.png")
    },
    "Rope": {
      description: "A length of sturdy hempen rope — useful for climbing, binding, and camp construction.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.5, value: 5,
      icon: _I.tool("tool_rope.png")
    },
    "Candle": {
      description: "A tallow candle — dim but long-lasting light for a camp, inn room, or dark passage.",
      type: "tool", consumable: true, wearable: false,
      condition: "Good", burnTime: 120, rarity: "Common",
      baseEffect: {}, weight: 0.1, value: 1,
      icon: _I.tool("torch.png")
    },
    "Torch": {
      description: "A pitch-soaked torch — provides light in dark places and can start a fire in a pinch.",
      type: "tool", consumable: true, wearable: false,
      condition: "Good", burnTime: 60, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 2,
      icon: _I.tool("torch.png")
    },
    "Waterskin": {
      description: "A leather pouch for carrying water — essential for long travel in arid lands.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 4,
      icon: _I.misc("waterskin.png")
    },
    "Waterskin (Full)": {
      description: "A waterskin filled with clean water — ready to drink on the trail.",
      type: "tool", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { stamina: 5 }, weight: 1.0, value: 4,
      icon: _I.misc("waterskin.png")
    },
    "Animal Trap": {
      description: "A simple spring trap set on game trails to catch small animals.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 8,
      icon: _I.tool("tool_trap.png")
    },
    "Bandage": {
      description: "Clean strips of cloth for dressing wounds. Stops bleeding and promotes healing.",
      type: "tool", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: { life: 10 }, weight: 0.2, value: 5,
      icon: _I.misc("bandages.png")
    },
    "Pick-Axe": {
      description: "A combined pick and axe head on a sturdy haft — the miner's all-purpose tool for splitting rock and hewing timber.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.5, value: 14,
      icon: _I.tool("tool_axe_pick.png")
    },
    "Wood Axe": {
      description: "A single-bit felling axe for chopping trees and splitting logs. Essential for camp fuel.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.5, value: 10,
      icon: _I.tool("tool_axe.png")
    },
    "Broom": {
      description: "A bundle of dried birch twigs bound to a pole. Useful in camp for sweeping debris and keeping a tidy hearth.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.8, value: 2,
      icon: _I.tool("tool_broom.png")
    },
    "Chisel": {
      description: "A hardened iron chisel for shaping stone, wood, or bone. Required for fine carving and construction work.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 7,
      icon: _I.tool("tool_chisel.png")
    },
    "Cooking Knife": {
      description: "A broad-bladed kitchen knife — heavier than a crafting knife, built for slicing meat and vegetables at camp.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.6, value: 6,
      icon: _I.tool("tool_cooking_knife.png")
    },
    "Digger": {
      description: "A short-handled digging implement — somewhere between a trowel and a mattock. Used for latrines, root gathering, and earthworks.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.8, value: 8,
      icon: _I.tool("tool_digger.png")
    },
    "Hammer": {
      description: "A solid iron hammer for driving stakes, assembling shelter frames, and general construction work.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.5, value: 9,
      icon: _I.tool("tool_hammer.png")
    },
    "Nails": {
      description: "A pouch of iron nails — essential for building anything that needs to hold together under pressure.",
      type: "tool", consumable: true, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 3,
      icon: _I.tool("tool_nails.png")
    },
    "Pickaxe": {
      description: "A standard miner's pick for breaking rock and extracting ore. Heavier and more focused than a pick-axe.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 4.0, value: 12,
      icon: _I.tool("tool_pick.png")
    },
    "Handsaw": {
      description: "A toothed iron saw for cutting planks and shaping timber. Needed for building shelters and crafting wooden items.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.2, value: 10,
      icon: _I.tool("tool_saw.png")
    },
    "Scythe": {
      description: "A long curved blade on a bent handle — used for harvesting grain and clearing tall grass.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.5, value: 11,
      icon: _I.tool("tool_scythe.png")
    },
    "Spade": {
      description: "A flat-bladed spade for digging, moving earth, and trenching. Sturdier than the digger.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 9,
      icon: _I.tool("tool_shovel_2.png")
    },
    "Shovel": {
      description: "A pointed shovel for loose soil and gravel — lighter than a spade and better for scooping.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.5, value: 8,
      icon: _I.tool("tool_shovel.png")
    },
    "Sickle": {
      description: "A short curved blade mounted on a wooden handle. Used for cutting herbs, reaping crops, and harvesting reeds.",
      type: "tool", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 7,
      icon: _I.tool("tool_sickle.png")
    },
    "Stone Hammer": {
      description: "A crude hammer with a rounded stone head lashed to a handle — primitive but effective for rough work.",
      type: "tool", consumable: false, wearable: false,
      condition: "Worn", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 3,
      icon: _I.tool("tool_stone_hammer.png")
    },
    "Lit Torch": {
      description: "A burning torch — already lit and ready to carry into dark places. Burns down quickly.",
      type: "tool", consumable: true, wearable: false,
      condition: "Good", burnTime: 30, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 1,
      icon: _I.tool("torch_lit.png")
    }
  },

  Containers: {
    "Small Pouch": {
      description: "A plain cloth pouch with a drawstring — the simplest way to carry loose goods.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 2,
      icon: _I.container("bag_little_41.png")
    },
    "Herb Pouch": {
      description: "A compact pouch lined with dry cloth — auto-stores any medicinal herbs, reducing clutter.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.3, value: 8,
      icon: _I.container("herb_pouch_small.png")
    },
    "Herb Pouch (Large)": {
      description: "A generous herb pouch with divided compartments — holds a full herbalist's stock with room to spare. Must be crafted from deer hide.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.6, value: 20,
      icon: _I.container("herb_pouch_large.png")
    },
    "Ingredient Pouch": {
      description: "A sturdy pouch for carrying foraged ingredients — berries, mushrooms, flowers, and roots stay organised inside.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.4, value: 8,
      icon: _I.container("ingredient_pouch_small.png")
    },
    "Ingredient Pouch (Large)": {
      description: "A large ingredient pouch with reinforced seams — a forager's best companion for extended trips. Must be crafted from boar hide.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.8, value: 20,
      icon: _I.container("ingredient_pouch_large.png")
    },
    "Coin Pouch": {
      description: "A small leather coin pouch — carries up to 200 gold pieces.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 3,
      icon: _I.container("coin_pouch_small.png")
    },
    "Coin Pouch (Large)": {
      description: "A reinforced coin pouch with iron clasps — holds unlimited gold without straining the seams.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 0.5, value: 18,
      icon: _I.container("coin_pouch_large.png")
    },
    "Travel Bag": {
      description: "A sturdy brown canvas bag with two buckled straps — the everyday carry of travellers across Estranta.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 1.0, value: 6,
      icon: _I.container("bag_brown.png")
    },
    "Black Satchel": {
      description: "A black leather satchel with a wide flap — favoured by couriers and scouts for its low profile.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.8, value: 7,
      icon: _I.container("bag_black.png")
    },
    "Red Bag": {
      description: "A red-dyed leather bag — a merchant's staple, easy to spot in a crowded stall.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.9, value: 6,
      icon: _I.container("bag_red.png")
    },
    "Gold Coin Bag": {
      description: "A heavy gold-trimmed bag closed with an elaborate clasp — used by wealthy traders for displaying coin.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 1.5, value: 20,
      icon: _I.container("bag_gold.png")
    },
    "Pack Bag": {
      description: "A large canvas pack bag with reinforced seams and multiple tie-points — ideal for long journeys.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 10,
      icon: _I.container("bag_35.png")
    },
    "Expedition Bag": {
      description: "A weatherproofed expedition pack with frame support and side pockets — built for weeks in the wilderness.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 2.5, value: 18,
      icon: _I.container("bag_66.png")
    },
    "Miner's Pack": {
      description: "A reinforced pack designed for miners — padded hip straps and a wide mouth for ore samples.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 3.0, value: 12,
      icon: _I.container("bag_miner.png")
    },
    "Large Rucksack": {
      description: "A massive frameless rucksack with leather straps — holds a remarkable amount when packed correctly.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 3.5, value: 22,
      icon: _I.container("bag_142.png")
    },
    "Barrel": {
      description: "A banded oak barrel — used to store and transport salted food, ale, or water.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 20.0, value: 12,
      icon: _I.container("barrel.png")
    },
    "Wicker Basket": {
      description: "A woven wicker basket — good for carrying fruit, vegetables, and small gathered items from market or field.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.8, value: 3,
      icon: _I.container("basket.png")
    },
    "Wooden Crate": {
      description: "A slatted wooden crate for hauling goods — trade staple in every port and market.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 5.0, value: 6,
      icon: _I.container("box_wood.png")
    },
    "Iron Bucket": {
      description: "A riveted iron bucket — used to carry water, sand for fire control, or gathered materials.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 2.0, value: 5,
      icon: _I.container("bucket.png")
    },
    "Wooden Chest": {
      description: "A simple pine chest with iron clasps — enough security for valuables at a modest inn.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 15.0, value: 20,
      icon: _I.container("chest_wood.png")
    },
    "Banded Wooden Chest": {
      description: "A hardwood chest wrapped in iron bands — more secure than a plain box, used by travelling merchants.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 18.0, value: 28,
      icon: _I.container("chest_wood_51.png")
    },
    "Reinforced Chest": {
      description: "A thick-planked chest with double iron banding and a heavy padlock point.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 22.0, value: 40,
      icon: _I.container("chest_wood_52.png")
    },
    "Iron Chest": {
      description: "A full iron chest with a complex locking mechanism — trusted by guild masters and wealthy merchants.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 40.0, value: 65,
      icon: _I.container("chest_iron_54.png")
    },
    "Heavy Iron Chest": {
      description: "A solid iron chest with reinforced hinges and a deadbolt lock — favoured by banks and armories.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 50.0, value: 80,
      icon: _I.container("chest_iron_55.png")
    },
    "Red Lacquered Chest": {
      description: "A chest painted red with lacquer and gilt scrollwork — likely from a wealthy estate or merchant's parlour.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 20.0, value: 55,
      icon: _I.container("chest_red.png")
    },
    "Small Chest": {
      description: "A compact lockbox — just large enough to hold folded documents or a handful of coins.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 8.0, value: 15,
      icon: _I.container("chest_101.png")
    },
    "Medium Chest": {
      description: "A mid-sized travel chest for storing armor, tools, or trade goods on a wagon.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 14.0, value: 22,
      icon: _I.container("chest_102.png")
    },
    "Large Chest": {
      description: "A large chest with hinged lid and side handles — standard equipment for long-haul caravans.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 20.0, value: 30,
      icon: _I.container("chest_103.png")
    },
    "Scholar's Chest": {
      description: "A felt-lined chest with interior dividers — built for carrying books, scrolls, and delicate instruments.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 12.0, value: 38,
      icon: _I.container("chest_104.png")
    },
    "Adventurer's Chest": {
      description: "A battered chest plastered with travel stickers and painted lock marks — it's been places.",
      type: "misc", consumable: false, wearable: false,
      condition: "Worn", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 16.0, value: 25,
      icon: _I.container("chest_106.png")
    },
    "War Chest": {
      description: "A military-grade chest fitted with double locks and carry-rings for pole transport — used by army quartermasters.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      baseEffect: {}, weight: 30.0, value: 45,
      icon: _I.container("chest_107.png")
    },
    "Glass Flask": {
      description: "A large glass flask with a wide neck — used by alchemists for brewing and distilling.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.5, value: 6,
      icon: _I.container("flask_large.png")
    },
    "Small Flask": {
      description: "A narrow-necked glass flask for storing and measuring alchemical ingredients.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 0.2, value: 4,
      icon: _I.container("flask.png")
    },
    "Iron Pot": {
      description: "A heavy iron cooking pot with a bail handle — essential for stews, soups, and camp cooking.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      baseEffect: {}, weight: 5.0, value: 9,
      icon: _I.container("pot.png")
    },
  },

  Maps: {
    "Map of Ardrenhold": {
      description: "A detailed map of Ardrenhold — home of the noble keep and fertile plains. Reveals all settlements and landmarks in the kingdom.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Common", weight: 0.1, value: 60, kingdom: "Ardrenhold",
      icon: _I.icon("map_icon.png")
    },
    "Map of Brythwen": {
      description: "A hand-drawn chart of Brythwen — the coastal kingdom of mariners and traders. Reveals all settlements and sea routes.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Common", weight: 0.1, value: 60, kingdom: "Brythwen",
      icon: _I.icon("map_icon.png")
    },
    "Map of Dwynbroch": {
      description: "A cartographer's map of Dwynbroch — the mountain kingdom of dwarven holds and deep mines. Reveals all known settlements.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Common", weight: 0.1, value: 60, kingdom: "Dwynbroch",
      icon: _I.icon("map_icon.png")
    },
    "Map of Feldarún": {
      description: "An illustrated map of Feldarún — the ancient elven forest kingdom. Reveals all settlements hidden within the canopy.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Common", weight: 0.1, value: 60, kingdom: "Feldarún",
      icon: _I.icon("map_icon.png")
    },
    "Map of Naradreth": {
      description: "A survey map of Naradreth — the windswept tundra realm. Reveals all outposts and frost-hardened settlements.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Common", weight: 0.1, value: 60, kingdom: "Naradreth",
      icon: _I.icon("map_icon.png")
    },
    "Map of Nithrond": {
      description: "A weathered chart of Nithrond — the shadowed wetland kingdom. Reveals all settlements across its marshes and fens.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Common", weight: 0.1, value: 60, kingdom: "Nithrond",
      icon: _I.icon("map_icon.png")
    },
    "Map of Orindroth": {
      description: "A road map of Orindroth — the central plains kingdom and crossroads of Estranta. Reveals all towns and waypoints.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Common", weight: 0.1, value: 60, kingdom: "Orindroth",
      icon: _I.icon("map_icon.png")
    },
    "Map of Rendarost": {
      description: "A military survey map of Rendarost — the iron-fisted border kingdom. Reveals all fortresses and garrison towns.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Common", weight: 0.1, value: 60, kingdom: "Rendarost",
      icon: _I.icon("map_icon.png")
    },
    "Map of Sivanrift": {
      description: "A river chart of Sivanrift — the kingdom of waterways and fishing villages. Reveals all settlements along its many rivers.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Common", weight: 0.1, value: 60, kingdom: "Sivanrift",
      icon: _I.icon("map_icon.png")
    },
    "Map of Wistravael": {
      description: "A mystical parchment map of Wistravael — the magic-touched southern kingdom. Reveals all known sanctuaries and ruins.",
      type: "map", consumable: false, wearable: false, burnTime: 0,
      rarity: "Uncommon", weight: 0.1, value: 80, kingdom: "Wistravael",
      icon: _I.icon("map_icon.png")
    }
  },

  KingdomGear: {
    // ── ARDRENHOLD ── Knights, agriculture, chivalric ──────────────────────
    "Ardrenhold Tabard": {
      description: "A tabard bearing the Ardrenhold livery — yellow and black, emblem of the knightly order.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.0, value: 6, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_tabard.png")
    },
    "Ardrenhold Cloak": {
      description: "A heavy woolen cloak in Ardrenhold colours, lined for warmth on cold marches.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.5, value: 8, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_cloak.png")
    },
    "Ardrenhold Guard Helm": {
      description: "A standard-issue helm worn by Ardrenhold footguards — sturdy iron with a nasal guard.",
      type: "armor", consumable: false, wearable: true, condition: "Fair", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 5 }, weight: 3.0, value: 12, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_guard_helm.png")
    },
    "Ardrenhold Knight Chest": {
      description: "A well-forged chest plate engraved with the Ardrenhold sun sigil. Worn by knights of the realm.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 15 }, weight: 10.0, value: 35, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_knight_chest.png")
    },
    "Ardrenhold Plate Chest": {
      description: "Heavy plate armour of the Ardrenhold order — polished and hardened against lance and blade.",
      type: "armor", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 20 }, weight: 14.0, value: 60, kingdom: "Ardrenhold",
      icon: _I.armor("Ardrenhold/ardrenhold_knight_plate_chest.png")
    },
    "Ardren Ale": {
      description: "A hearty golden ale brewed in Ardrenhold's keep — warm, malty, and filling.",
      type: "food", consumable: true, wearable: false, condition: "Fresh", burnTime: 0,
      rarity: "Common", baseEffect: { stamina: 12 }, weight: 0.5, value: 4, kingdom: "Ardrenhold",
      icon: _I.potion("potion_blood.png")
    },

    // ── DWYNBROCH ── Celtic/Highland, artistic, dragon-themed ──────────────
    "Dwynbroch Tabard": {
      description: "A tartan tabard in Dwynbroch forest greens — worn by clansmen and soldiers alike.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 1.0, value: 6, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_tabard.png")
    },
    "Dwynbroch Cloak": {
      description: "A heavy plaid cloak from the Dwynbroch highlands — rough-spun and waterproof.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.5, value: 8, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_cloak.png")
    },
    "Dwynbroch Leather Chest": {
      description: "Hardy leather armour cut in the Dwynbroch style — functional and engraved with knotwork.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 6.0, value: 18, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_leather_chest.png")
    },
    "Dwynbroch Scholar Robe": {
      description: "A long scholarly robe from Dwynbroch's artistic tradition — embroidered with Celtic patterns.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.0, value: 20, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_scholar_robe.png")
    },
    "Dwynbroch Knight Chest": {
      description: "Plate armour forged by Dwynbroch smiths — heavier than it looks, decorated with dragon motifs.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 16 }, weight: 12.0, value: 50, kingdom: "Dwynbroch",
      icon: _I.armor("Dwynbroch/dwynbroch_knight_chest.png")
    },
    "Highland Mead": {
      description: "A rich golden mead from Dwynbroch's Highland Meadery — sweet, strong, and warming.",
      type: "food", consumable: true, wearable: false, condition: "Fresh", burnTime: 0,
      rarity: "Uncommon", baseEffect: { stamina: 20 }, weight: 0.5, value: 8, kingdom: "Dwynbroch",
      icon: _I.potion("potion_warmth_vial.png")
    },

    // ── BRYTHWEN ── Trade hub, coastal, mercantile ─────────────────────────
    "Brythwen Tabard": {
      description: "A light linen tabard in Brythwen trade colours — practical and easy to move in.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.8, value: 6, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_tabard.png")
    },
    "Brythwen Cloak": {
      description: "A weather-treated travelling cloak worn by Brythwen merchants on long coastal routes.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.2, value: 8, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_cloak.png")
    },
    "Brythwen Leather Chest": {
      description: "Soft coastal leather armour — lighter than field plate, favoured by Brythwen guards and couriers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 6 }, weight: 5.0, value: 14, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_leather_chest.png")
    },
    "Brythwen Blue Gambeson": {
      description: "A quilted gambeson in Brythwen royal blue — padded against cuts, worn under chain.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 4.0, value: 16, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_blue_gambeson.png")
    },
    "Brythwen Mail Chest": {
      description: "Coastal-forged chainmail in a Brythwen pattern — lighter rings for faster movement at sea.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 10 }, weight: 8.0, value: 22, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_mail_chest.png")
    },
    "Brythwen Platemail": {
      description: "Full plate armour from Brythwen's shipyard district — bluened steel with salt-resistant finish.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 18 }, weight: 14.0, value: 55, kingdom: "Brythwen",
      icon: _I.armor("Brythwen/brythwen_platemail_chest_blue.png")
    },

    // ── NITHROND ── Elven, archery, scholarship ────────────────────────────
    "Nithrond Tabard": {
      description: "A richly dyed autumn tabard from Nithrond — subtle patterns of falling leaves in gold and red.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.8, value: 6, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_tabard.png")
    },
    "Nithrond Cloak": {
      description: "A scholar's travelling cloak from Nithrond — deep burgundy wool with embroidered trim.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 1.5, value: 12, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_cloak.png")
    },
    "Nithrond Leather Chest": {
      description: "Elven-tanned leather armour from Nithrond — fine stitching and gilded clasps.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 5.0, value: 16, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_chest.png")
    },
    "Nithrond Red Gambeson": {
      description: "A deep red padded gambeson from Nithrond's military tradition — worn by elven archers.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 6 }, weight: 3.5, value: 14, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_red_gambeson.png")
    },
    "Nithrond Mage Chest": {
      description: "Spellwoven robes from Nithrond's Virelysar scholars — resistant to arcane energy.",
      type: "armor", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 8 }, weight: 2.5, value: 45, kingdom: "Nithrond",
      icon: _I.armor("Nithrond/nithrond_mage_chest.png")
    },
    "Elven Tea": {
      description: "A blend of rare autumn herbs from Nithrond's Grand Archives — clears the mind and restores mana.",
      type: "potion", consumable: true, wearable: false, condition: "Fresh", burnTime: 0,
      rarity: "Uncommon", baseEffect: { mana: 20, stamina: 10 }, weight: 0.2, value: 15, kingdom: "Nithrond",
      icon: _I.potion("potion_mana.png")
    },

    // ── SIVANRIFT ── Gardens, rare plants, elven harmony ───────────────────
    "Sivanrift Tabard": {
      description: "A flowing tabard in Sivanrift garden greens and silver — light as silk, cool to the touch.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 0.6, value: 12, kingdom: "Sivanrift",
      icon: _I.armor("Sivanrift/sivanrift_tabard.png")
    },
    "Sivanrift Boots": {
      description: "Light elven boots from Sivanrift — soft soles for silent movement through gardens and canyons.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 3 }, weight: 1.0, value: 10, kingdom: "Sivanrift",
      icon: _I.armor("Sivanrift/sivanrift_boots.png")
    },
    "Sivanrift Helm": {
      description: "A graceful elven helm from Sivanrift — lightweight silver filigree with a pronounced visor.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 5 }, weight: 2.0, value: 14, kingdom: "Sivanrift",
      icon: _I.armor("Sivanrift/sivanrift_helm.png")
    },
    "Garden Wine": {
      description: "A wine pressed from rare Sivanrift grapes — complex, floral, and deeply restorative.",
      type: "food", consumable: true, wearable: false, condition: "Fresh", burnTime: 0,
      rarity: "Uncommon", baseEffect: { stamina: 18 }, weight: 0.5, value: 10, kingdom: "Sivanrift",
      icon: _I.food("wine.png")
    },
    "Sivanrift Blossom": {
      description: "A rare bloom from the Grand Gardens of Myrthill — found nowhere else. Used in the most potent healing preparations.",
      type: "material", consumable: false, wearable: false, condition: "Fresh", burnTime: 0,
      rarity: "Rare", baseEffect: {}, weight: 0.1, value: 20, kingdom: "Sivanrift",
      icon: _I.ingredient("flower_golden.png")
    },

    // ── NARADRETH ── Isolationist, coastal, xenophobic ─────────────────────
    "Naradreth Leather Chest": {
      description: "Tightly stitched leather armour from Naradreth — functional and bearing no allegiance markings for outsiders.",
      type: "armor", consumable: false, wearable: true, condition: "Fair", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 6 }, weight: 5.0, value: 14, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather_chest.png")
    },
    "Naradreth Tabard": {
      description: "A plain tabard of Naradreth make — grey linen, minimal markings, worn by gate wardens.",
      type: "armor", consumable: false, wearable: true, condition: "Fair", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.8, value: 6, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_tabard.png")
    },
    "Naradreth Trader Chest": {
      description: "A reinforced trader's jacket from Naradreth's outer districts — worn by those authorized to deal with foreigners.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 6.0, value: 18, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_trader_chest.png")
    },
    "Naradreth Scaled Chest": {
      description: "Fine scale armour from Naradreth's inner city — rarely sold to outsiders, a sign of granted trust.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 9 }, weight: 7.0, value: 20, kingdom: "Naradreth",
      icon: _I.armor("Naradreth/naradreth_leather2_chest.png")
    },

    // ── FELDARÚN ── Dwarven master smiths, mining ──────────────────────────
    "Feldarún Tabard": {
      description: "A heavy linen tabard bearing the Feldarún forge sigil — worn by dwarven smiths and apprentices.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.0, value: 8, kingdom: "Feldarún",
      icon: _I.armor("Feldarun/feldarun_tabard.png")
    },
    "Feldarún Mail Boots": {
      description: "Dwarven-forged iron-link boots — heavy but virtually indestructible underfoot.",
      type: "armor", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 4.0, value: 12, kingdom: "Feldarún",
      icon: _I.armor("Feldarun/feldarun_mail_boots.png")
    },
    "Feldarún Mail Chest": {
      description: "Master-forged chainmail from the caldera forges of Khúralgron — tight-linked, reinforced shoulders.",
      type: "armor", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 12 }, weight: 10.0, value: 28, kingdom: "Feldarún",
      icon: _I.armor("Feldarun/feldarun_mail_chest.png")
    },
    "Feldarún Helm": {
      description: "A war helm of Feldarún make — full visor, reinforced brow, etched with runic protective marks.",
      type: "armor", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 5.0, value: 20, kingdom: "Feldarún",
      icon: _I.armor("Feldarun/feldarun_helm_26.png")
    },
    "Feldarún Heavy Helm": {
      description: "A dwarven master's helm — layered plate, cheek guards, and a horned crest of solid iron.",
      type: "armor", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 12 }, weight: 7.0, value: 35, kingdom: "Feldarún",
      icon: _I.armor("Feldarun/feldarun_helm_27.png")
    },
    "Dwarven Warhammer": {
      description: "A masterwork warhammer from Feldarún's Grand Forge — balanced for a dwarf but formidable in any hand.",
      type: "weapon", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Rare", baseEffect: { damage: 22 }, weight: 8.0, value: 45, kingdom: "Feldarún",
      icon: _I.weapon("common/all/hammer_05.png")
    },

    // ── WISTRAVAEL ── Star-metal, enchanted, mountain dwarves ──────────────
    "Wistravael Tabard": {
      description: "A deep green tabard with silver trim from Wistravael — marking the mountain hold's soldiers and craftsmen.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.0, value: 8, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_tabard.png")
    },
    "Wistravael Cloak": {
      description: "A mountain cloak from Wistravael's high passes — thick wool lined with mineral-threaded silk.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 4 }, weight: 2.0, value: 10, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_cloak.png")
    },
    "Wistravael Mail Chest": {
      description: "Mountain-forged chainmail from Wistravael — star-metal woven through standard links for extra rigidity.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 11 }, weight: 9.0, value: 25, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_mail_chest.png")
    },
    "Wistravael Gladiator Helm": {
      description: "A distinctive open-crested helm from Wistravael's arena tradition — strong and imposing.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 9 }, weight: 5.0, value: 22, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_gladiator_helm.png")
    },
    "Wistravael Green Chest": {
      description: "A reinforced chest plate from Wistravael — forest green enamel over layered steel.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 10 }, weight: 9.0, value: 24, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_green_chest.png")
    },
    "Wistravael Platemail": {
      description: "Full platemail from Wistravael's Kragmire Hold — forged near a magma river, the steel takes on a faint violet sheen.",
      type: "armor", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Epic", baseEffect: { defense: 18 }, weight: 15.0, value: 80, kingdom: "Wistravael",
      icon: _I.armor("Wistravael/wistravael_platemail_chest_purple.png")
    },

    // ── ORINDROTH ── Forest elves, nature magic, ancient trees ─────────────
    "Orindroth Tabard": {
      description: "A simple forest tabard from Orindroth — moss-green linen that blends into the ancient canopy.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 2 }, weight: 0.8, value: 6, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_tabard.png")
    },
    "Orindroth Cloak": {
      description: "A deep forest cloak from Orindroth — made from canopy leaves treated with ancient sap.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.0, value: 8, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_cloak.png")
    },
    "Orindroth Leather Chest": {
      description: "Bark-tanned leather armour from Orindroth — supple and silent, worn by forest wardens.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 7 }, weight: 5.0, value: 16, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_leather_chest.png")
    },
    "Orindroth Green Chest": {
      description: "Elven plate reinforced with ironwood from Orindroth's ancient groves — lightweight but hard as iron.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 6.0, value: 18, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_green_chest.png")
    },
    "Orindroth Adventure Chest": {
      description: "A layered chest plate from Orindroth's Valorin rangers — adapted for climbing, swimming, and wilderness travel.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: { defense: 12 }, weight: 7.0, value: 35, kingdom: "Orindroth",
      icon: _I.armor("Orindroth/orindroth_adventure_chest.png")
    },
    "Sacred Bark": {
      description: "Bark from one of Orindroth's ancient sacred trees — imbued with forest magic over centuries. Prized by alchemists.",
      type: "material", consumable: false, wearable: false, condition: "Fresh", burnTime: 0,
      rarity: "Uncommon", baseEffect: {}, weight: 0.2, value: 15, kingdom: "Orindroth",
      icon: _I.ingredient("bark.png")
    },

    // ── RENDAROST ── Arctic dwarves, frost ale, frost-resistant gear ────────
    "Rendarost Tabard": {
      description: "A frost-grey tabard from Rendarost — thick wool treated against icy winds.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Common", baseEffect: { defense: 3 }, weight: 1.2, value: 8, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_tabard.png")
    },
    "Rendarost Cloak": {
      description: "An insulated cloak from Rendarost's arctic holds — thick enough to resist the permanent cold of the far north.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 4 }, weight: 2.5, value: 16, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_cloak.png")
    },
    "Rendarost Viking Helm": {
      description: "A horned war helm from Rendarost — traditional dwarven design adapted for icy battlefield conditions.",
      type: "armor", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 8 }, weight: 4.0, value: 20, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_viking_helm.png")
    },
    "Rendarost Mail Chest": {
      description: "Arctic-forged chainmail from Rendarost — rust-resistant alloy developed for the frozen north.",
      type: "armor", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Uncommon", baseEffect: { defense: 10 }, weight: 9.0, value: 22, kingdom: "Rendarost",
      icon: _I.armor("Rendarost/rendarost_mail_chest.png")
    },
    "Frost Ale": {
      description: "Rendarost's legendary secret brew — a near-frozen ale that warms from the inside out and banishes the cold.",
      type: "potion", consumable: true, wearable: false, condition: "Fresh", burnTime: 0,
      rarity: "Uncommon", baseEffect: { removeCondition: "cold", stamina: 15 }, weight: 0.5, value: 12, kingdom: "Rendarost",
      icon: _I.potion("potion_warmth_vial.png")
    },

    // ── MANA VESSELS (for non-magical races) ────────────────────────────────────
    "Arcane Talisman": {
      description: "A flat tablet of pale grey stone etched with spiralling glyphs. Non-magical folk have long used these to store ambient arcane energy, drawing on it as needed. Warm to the touch near areas of magical activity.",
      type: "accessory", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      manaVessel: 25, baseEffect: {}, weight: 0.2, value: 85,
      icon: "images/icons/amulet_arcane.png"
    },
    "Mana Stone": {
      description: "A rough-cut gem of compressed arcane essence — deep violet, almost black. Those with no natural mana pool can wear it to borrow its stored power. The charge fades slowly; it takes rest near ley lines to refill.",
      type: "accessory", consumable: false, wearable: true,
      condition: "Charged", burnTime: 0, rarity: "Rare",
      manaVessel: 40, baseEffect: {}, weight: 0.3, value: 160,
      icon: "images/icons/gem_mana.png"
    },
    "Runic Focus Amulet": {
      description: "A carved bone amulet hung on a cord of twisted sinew. The runes channel ambient magical energy into a usable pool — a common tool among dwarven runepriests and human hedge-mages who lack innate arcane talent.",
      type: "accessory", consumable: false, wearable: true,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      manaVessel: 20, baseEffect: {}, weight: 0.15, value: 65,
      icon: "images/icons/amulet_runic.png"
    },

    // ── ARÚVARI RELICS ──────────────────────────────────────────────────────────
    "Aelindra's Pendant": {
      description: "A pendant of carved dark stone, small enough to hold in a closed fist. The cord is old but unfrayed. Something about it resists easy description — the stone is neither warm nor cold, and the carved symbol on its face is not one you've seen in any map or book. It belonged to someone.",
      type: "accessory", consumable: false, wearable: true, condition: "Excellent", burnTime: 0,
      rarity: "Legendary", baseEffect: {}, weight: 0.1, value: 0, kingdom: null,
      icon: "images/icons/pendant_aruvari.png"
    },

    // ── MYSTERIOUS ITEMS ────────────────────────────────────────────────────────
    "Listener's Compass": {
      description: "A compass that doesn't point north. The needle drifts in slow arcs, pausing briefly at intervals that don't correspond to any direction you know. Whoever made it wanted it to find something other than magnetic north.",
      type: "tool", consumable: false, wearable: true, condition: "Good", burnTime: 0,
      rarity: "Rare", baseEffect: {}, weight: 0.3, value: 0, kingdom: null,
      icon: "images/icons/compass.png"
    },

    // ── QUEST: THE SLOW BECOMING ────────────────────────────────────────────────

    "Moonwither Herb": {
      description: "A small, pale-leafed herb that blooms only by moonlight. One of the sacred plants tended in the Grand Gardens of Sivanrift — it is forbidden to remove anything from those grounds. The herb emits a faint silver glow when dried. A key ingredient in an ancient corruption cure.",
      type: "ingredient", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      questItem: true, baseEffect: {}, weight: 0.1, value: 0,
      icon: "images/icons/herb_moonwither.png"
    },
    "Moonwither Seed": {
      description: "A tiny seed of the Moonwither Herb, given freely by a grateful soul in Sivanrift. With patience and moonlit soil, it can be grown into the full herb. A slower path — but an honest one.",
      type: "ingredient", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Uncommon",
      questItem: true, baseEffect: {}, weight: 0.05, value: 0,
      icon: "images/icons/seed_moonwither.png"
    },
    "Vial of Pure Elf Blood": {
      description: "A small sealed vial of uncorrupted elven blood — deep crimson with a faint luminescence. Elven blood holds a trace of the ancient magic that makes their kind what they are. Essential for a corruption cure — and it must be pure. The corrupted cannot give what they no longer have.",
      type: "ingredient", consumable: false, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      questItem: true, baseEffect: {}, weight: 0.1, value: 0,
      icon: "images/icons/vial_elf_blood.png"
    },
    "Veldrite Crystal": {
      description: "A deep-violet gem found only in the Ironback Mountains of Feldarún — prized by dwarven alchemists for its unique resonance with corrupted magical energy. Three were found. Only one is needed for the cure; the others are yours to keep or sell.",
      type: "gem", consumable: false, wearable: false,
      condition: "Intact", burnTime: 0, rarity: "Rare",
      baseEffect: {}, weight: 0.2, value: 200,
      icon: "images/icons/gem_veldrite.png"
    },
    "Ironbrand Family Ring": {
      description: "A heavy iron ring engraved with a square-and-flame emblem — the mark of the Ironbrand clan of Feldarún. Crafted four generations ago by a master smith. The emblem is unmistakable to any dwarf who sees it. Whoever owns this would not have lost it willingly.",
      type: "misc", consumable: false, wearable: false,
      condition: "Good", burnTime: 0, rarity: "Common",
      questItem: true, baseEffect: {}, weight: 0.1, value: 0,
      icon: "images/icons/ring_ironbrand.png"
    },
    "Corruption Delay Tincture": {
      description: "A dark, bitter liquid brewed by Davolar from ingredients found near the Crimson Valley. It does not cure corruption — it suspends it. Drinking it will buy several days before the corruption advances again. Davolar warned not to rely on it.",
      type: "potion", consumable: true, wearable: false,
      condition: "Fresh", burnTime: 0, rarity: "Rare",
      baseEffect: { applyCondition: "corruption_delayed", duration: 4 }, weight: 0.3, value: 0,
      questItem: true,
      icon: "images/icons/potion_delay.png"
    },
    "Sarsett's Note": {
      description: "A folded piece of paper, sealed with no wax. Your name is written on the outside in a hand you recognise. You found it on her.",
      type: "misc", consumable: false, wearable: false,
      condition: "Fragile", burnTime: 0, rarity: "Common",
      questItem: true, baseEffect: {}, weight: 0,  value: 0,
      icon: "images/icons/note_letter.png"
    },
  }

};
