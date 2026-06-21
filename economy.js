// economy.js — Market pricing, kingdom economy data, shop stock tables.
// Loaded after kingdoms.js and items.js, before script.js.

// ── Kingdom economy profiles ───────────────────────────────────────────────
// baseMod     — global price multiplier for all goods sold in this kingdom
// prosperity  — 1-5, narrative/display value
// specialties — categories this kingdom produces cheaply (player pays less)
// weaknesses  — categories this kingdom imports at a premium
// description — shown in economy info

const KINGDOM_ECONOMY = {
  Ardrenhold: {
    prosperity:  3,
    baseMod:     1.00,
    description: 'Fertile farming kingdom. Food and drink are plentiful and cheap.',
    specialties: { food: 0.80, drinks: 0.85 },
    weaknesses:  { potions: 1.15, weapons: 1.10 },
  },
  Dwynbroch: {
    prosperity:  3,
    baseMod:     0.95,
    description: 'Highland Celtic culture — resourceful and self-sufficient.',
    specialties: { drinks: 0.80, materials: 0.90 },
    weaknesses:  { potions: 1.15 },
  },
  Brythwen: {
    prosperity:  4,
    baseMod:     1.10,
    description: 'The continent\'s largest trade hub. Competition keeps prices low.',
    specialties: { all: 0.90 },
    weaknesses:  {},
  },
  Nithrond: {
    prosperity:  3,
    baseMod:     1.10,
    description: 'Elven scholarly kingdom. Refined goods, strong herbalism tradition.',
    specialties: { potions: 0.85, ingredients: 0.85 },
    weaknesses:  { weapons: 1.20, armor: 1.20 },
  },
  Sivanrift: {
    prosperity:  3,
    baseMod:     1.05,
    description: 'Renowned for rare plants found nowhere else on the continent.',
    specialties: { ingredients: 0.70, potions: 0.80 },
    weaknesses:  { weapons: 1.15 },
  },
  Naradreth: {
    prosperity:  2,
    baseMod:     0.90,
    description: 'Isolated and hostile to outsiders. Expect a foreigner\'s markup.',
    specialties: {},
    weaknesses:  { all: 1.15 },
  },
  'Feldarún': {
    prosperity:  3,
    baseMod:     1.00,
    description: 'Dwarven master craftsmen produce the finest weapons on the continent.',
    specialties: { weapons: 0.75, armor: 0.75, tools: 0.80 },
    weaknesses:  { food: 1.20, potions: 1.25 },
  },
  Wistravael: {
    prosperity:  3,
    baseMod:     1.00,
    description: 'Mountain dwarves with a strong metalworking tradition.',
    specialties: { weapons: 0.85, armor: 0.85, materials: 0.85 },
    weaknesses:  { food: 1.15 },
  },
  Orindroth: {
    prosperity:  3,
    baseMod:     1.05,
    description: 'Ancient forest elves — deep knowledge of nature magic and herbalism.',
    specialties: { potions: 0.80, ingredients: 0.75 },
    weaknesses:  { weapons: 1.20, armor: 1.20 },
  },
  Rendarost: {
    prosperity:  2,
    baseMod:     0.90,
    description: 'Hardy arctic dwarves. Local goods cheap; imports expensive.',
    specialties: { drinks: 0.75, materials: 0.85 },
    weaknesses:  { food: 1.20, potions: 1.20 },
  },
};

// ── World event price effects ──────────────────────────────────────────────
// Keys match event.type in worldEconomy.activeEvents.
// 'all' applies to every category.

const WORLD_EVENT_EFFECTS = {
  civil_war: {
    label: 'Civil War', icon: '⚔️',
    description: 'Conflict drives up demand for weapons, armor, and provisions.',
    arrivalHint: (p) => `The tension in ${p} is palpable — armed men move in clusters and the locals eye strangers with suspicion.`,
    scarcity: { all: 0.85 },
    weapons: 1.40, armor: 1.35, food: 1.25, potions: 1.20, all: 1.10,
  },
  kingdom_at_war: {
    label: 'Kingdom at War', icon: '🏹',
    description: 'War footing strains supply chains across the kingdom.',
    arrivalHint: (p) => `Recruitment banners hang from the buildings of ${p}. Supply wagons roll through and the streets feel hollowed out.`,
    scarcity: { weapons: 0.7, armor: 0.7, food: 0.8 },
    weapons: 1.30, armor: 1.25, food: 1.20, potions: 1.15, all: 1.05,
  },
  plague: {
    label: 'Plague', icon: '☠️',
    description: 'Demand for remedies and provisions surges.',
    arrivalHint: (p) => `Cloth masks and burned herbs — ${p} smells like sickness. People give one another a wide berth.`,
    scarcity: { potions: 0.4, ingredients: 0.5, food: 0.75 },
    potions: 1.60, ingredients: 1.50, food: 1.15, all: 1.10,
  },
  famine: {
    label: 'Famine', icon: '🌾',
    description: 'Crops have failed. Food prices have reached desperate levels.',
    arrivalHint: (p) => `The granaries of ${p} stand nearly empty. Gaunt faces watch from doorways, and the smell of hunger is in the air.`,
    scarcity: { food: 0.3, drinks: 0.5 },
    food: 1.80, drinks: 1.40, all: 1.05,
  },
  prosperity: {
    label: 'Prosperity', icon: '🌟',
    description: 'Abundance and peace — everything is cheaper.',
    arrivalHint: (p) => `${p} is thriving — market stalls are full, people are laughing, and the roads are safe and clean.`,
    scarcity: {},
    all: 0.85, food: 0.80,
  },
  trade_boom: {
    label: 'Trade Boom', icon: '📦',
    description: 'Caravans flow freely. Prices are down across the board.',
    arrivalHint: (p) => `Caravan wagons clog the main road into ${p}. Merchants haggle in every corner; goods are everywhere.`,
    scarcity: {},
    all: 0.90, misc: 0.80, weapons: 0.85,
  },
  bandit_surge: {
    label: 'Bandit Surge', icon: '🗡️',
    description: 'Lawlessness raises demand for protection and travel supplies.',
    arrivalHint: (p) => `Militia patrols move through ${p} in pairs. A notice board near the gate is thick with bounty postings.`,
    scarcity: {},
    weapons: 1.20, armor: 1.15, tools: 1.10, misc: 1.05,
  },
  harvest_festival: {
    label: 'Harvest Festival', icon: '🎪',
    description: 'Crops abundant — food and drink flow freely.',
    arrivalHint: (p) => `${p} is in full celebration — garlands hang from every beam, and the smell of roasting food drifts from open tavern doors.`,
    scarcity: {},
    food: 0.70, drinks: 0.75,
  },
  magic_shortage: {
    label: 'Magical Shortage', icon: '✨',
    description: 'Rare ingredients have dried up across the region.',
    arrivalHint: (p) => `The alchemists' quarter of ${p} is half-shuttered. A handwritten sign reads: "No stock until further notice."`,
    scarcity: { potions: 0.35, ingredients: 0.4 },
    potions: 1.40, ingredients: 1.30, all: 1.05,
  },
  dragon_threat: {
    label: 'Dragon Threat', icon: '🐉',
    description: 'Dragon sightings drive demand for arms and protection.',
    arrivalHint: (p) => `The people of ${p} speak in hushed tones about something seen in the hills. Weapons merchants have queues out the door.`,
    scarcity: { weapons: 0.75, armor: 0.75 },
    weapons: 1.20, armor: 1.15,
  },
  mining_boom: {
    label: 'Mining Boom', icon: '⛏️',
    description: 'Rich ore veins discovered — metal goods are cheap.',
    arrivalHint: (p) => `Miners flood the streets of ${p}, ore-stained and flush with silver. The smiths' hammers ring day and night.`,
    scarcity: {},
    weapons: 0.85, armor: 0.85, tools: 0.80, materials: 0.75,
  },
};

// ── NPC trait price modifiers ──────────────────────────────────────────────
// buy:  multiplier applied to what the player pays
// sell: multiplier applied to what the player receives

const NPC_TRAIT_PRICE_MODS = {
  Generous:   { buy: 0.85, sell: 1.10 },
  Greedy:     { buy: 1.25, sell: 0.75 },
  Cunning:    { buy: 1.10, sell: 0.90 },
  Ruthless:   { buy: 1.15, sell: 0.85 },
  Kind:       { buy: 0.95, sell: 1.05 },
  Deceitful:  { buy: 1.15, sell: 0.80 },
  Honorable:  { buy: 1.00, sell: 1.00 },
  Merchant:   { buy: 1.05, sell: 0.95 },
};

// ── Item → economy category mapping ───────────────────────────────────────

function getItemEconCategory(itemName, itemType) {
  if (itemType === 'potion')  return 'potions';
  if (itemType === 'weapon')  return 'weapons';
  if (itemType === 'armor')   return 'armor';
  if (itemType === 'food')    return 'food';
  if (itemType === 'tool')    return 'tools';
  if (itemType === 'map')     return 'maps';
  if (itemType === 'material') {
    if (/herb|moss|bloom|root|flower|weed/i.test(itemName)) return 'ingredients';
    return 'materials';
  }
  if (/ale|wine|mead|rum|flask|waterskin|drink/i.test(itemName)) return 'drinks';
  return 'misc';
}

// ── Core price calculation ─────────────────────────────────────────────────
// opts: { kingdom, npcTraits[], worldEvents[], isBuy }

function calculatePrice(itemName, itemData, opts = {}) {
  const { kingdom = null, npcTraits = [], worldEvents = [], isBuy = true } = opts;
  const baseValue = (itemData && itemData.value) ? itemData.value : 5;
  const category  = getItemEconCategory(itemName, itemData?.type || 'misc');

  let m = 1.0;

  // 1. Kingdom base + specialties/weaknesses
  if (kingdom && KINGDOM_ECONOMY[kingdom]) {
    const ke = KINGDOM_ECONOMY[kingdom];
    m *= ke.baseMod;
    const s = ke.specialties || {}, w = ke.weaknesses || {};
    if (s.all)       m *= s.all;
    if (s[category]) m *= s[category];
    if (w.all)       m *= w.all;
    if (w[category]) m *= w[category];
  }

  // 2. Active world events (kingdom-scoped or global)
  for (const ev of worldEvents) {
    if (ev.kingdom && ev.kingdom !== kingdom) continue;
    const fx = WORLD_EVENT_EFFECTS[ev.type];
    if (!fx) continue;
    if (fx.all)        m *= fx.all;
    if (fx[category])  m *= fx[category];
  }

  // 3. NPC trait modifiers
  for (const trait of npcTraits) {
    const tm = NPC_TRAIT_PRICE_MODS[trait];
    if (!tm) continue;
    m *= isBuy ? (tm.buy || 1) : (tm.sell || 1);
  }

  // 4. Buy/sell margin
  m *= isBuy ? 1.35 : 0.55;

  return Math.max(1, Math.round(baseValue * m));
}

// Look up item data from Items database
function getItemData(itemName) {
  if (typeof Items === 'undefined') return null;
  for (const cat of Object.values(Items)) {
    if (cat[itemName]) return cat[itemName];
  }
  return null;
}

// ── Establishment stock lists ──────────────────────────────────────────────

const ESTABLISHMENT_STOCK = {
  blacksmith: [
    // Weapons
    'Iron Sword', 'Dagger', 'Iron Spear', 'Battle Axe', 'Iron Mace', 'War Hammer',
    'Hunting Bow', 'Arrow', 'Hunting Knife', 'Belt Knife',
    // Armor
    'Leather Boots', 'Leather Armor', 'Leather Helmet', 'Leather Gloves', 'Leather Bracers',
    'Gambeson', 'Padded Armor',
    'Chainmail Shirt', 'Chainmail Boots', 'Chainmail Gloves', 'Chainmail Coif',
    'Iron Cuirass', 'Iron Helmet',
    // Tools
    'Crafting Knife', 'Hatchet', 'Wood Axe', 'Pick-Axe', 'Hammer', 'Shovel', 'Chisel', 'Nails',
    // Materials
    'Iron Ore', 'Iron Ingot', 'Coal', 'Rope',
  ],
  general_store: [
    // Food
    'Rations', 'Apple', 'Wild Berries', 'Edible Mushrooms', 'Nuts', 'Carrot', 'Onion',
    // Tools & Supplies
    'Torch', 'Candle', 'Rope', 'Bandage', 'Waterskin',
    'Empty Vial', 'Kindling', 'Stick Bundle', 'Fishing Pole', 'Animal Trap',
    'Compass',
    // Pouches
    'Coin Pouch', 'Coin Pouch (Large)', 'Ingredient Pouch',
  ],
  alchemist: [
    'Health Potion', 'Greater Health Potion', 'Mana Potion',
    'Stamina Potion', 'Antidote', 'Warmth Elixir',
    'Fortifying Tonic', 'Focused Draught',
    'Empty Vial', 'Healing Herb', 'Rare Herb', 'Moonbloom',
    'Ginseng Root', 'Milkweed', 'Ember Root',
    'Ironbark Resin', 'Eyebright',
  ],
  apothecary: [
    'Health Potion', 'Antidote', 'Warmth Elixir', 'Bandage',
    'Healing Herb', 'Rare Herb', 'Ginseng Root', 'Milkweed',
    'Valerian Root', 'Eyebright', 'Empty Vial',
  ],
  fletcher: [
    'Hunting Bow', 'Bow', 'Shortbow', 'Longbow', 'Arrow', 'Broadtip Arrows', 'Rope', 'Hunting Knife',
  ],
  tavern: [
    'Rations', 'Apple', 'Wild Berries', 'Cooked Meat', 'Waterskin', 'Nuts',
  ],
  inn: [
    'Rations', 'Apple', 'Torch', 'Candle', 'Bandage', 'Waterskin',
  ],
  market: [
    'Apple', 'Rations', 'Wild Berries', 'Edible Mushrooms', 'Nuts', 'Carrot',
    'Torch', 'Rope', 'Bandage', 'Waterskin', 'Candle',
    'Iron Sword', 'Dagger', 'Arrow', 'Hunting Knife',
    'Leather Boots', 'Leather Armor', 'Gambeson',
    'Health Potion', 'Empty Vial', 'Healing Herb',
    'Crafting Knife', 'Fishing Pole', 'Hatchet',
    'Coin Pouch', 'Coin Pouch (Large)', 'Ingredient Pouch', 'Herb Pouch',
  ],
  merchant: [
    'Health Potion', 'Rations', 'Rope', 'Torch', 'Arrow',
    'Dagger', 'Bandage', 'Empty Vial', 'Healing Herb',
    'Stamina Potion', 'Waterskin', 'Candle', 'Compass',
    'Coin Pouch (Large)', 'Ingredient Pouch',
  ],
  herbalist: [
    'Healing Herb', 'Rare Herb', 'Moonbloom', 'Ginseng Root',
    'Milkweed', 'Ember Root', 'Eyebright', 'Valerian Root', 'Yarrow',
    'Wild Berries', 'Elderberry', 'Edible Mushrooms', 'Empty Vial',
    'Antidote', 'Health Potion',
    'Herb Pouch', 'Ingredient Pouch',
  ],
  tailor: [
    // Hides & materials
    'Leather', 'Deer Hide', 'Boar Hide', 'Rabbit Hide', 'Cloth Roll', 'Needle and Thread', 'Rope',
    // Finished leather goods
    'Leather Armor', 'Leather Boots', 'Leather Gloves', 'Leather Bracers', 'Leather Helmet', 'Gambeson',
    // Pouches (small only — large must be crafted)
    'Herb Pouch', 'Ingredient Pouch', 'Coin Pouch',
  ],
  stable: [
    'Rope', 'Animal Trap', 'Bandage', 'Waterskin', 'Rations',
  ],
  // Library/archive/scriptorium base stock (non-book items — books injected by _injectSkillBook)
  library: [
    'Scroll', 'Quill & Ink', 'Candle', 'Empty Vial', 'Ingredient Pouch',
  ],
};

// ── Skill Book Stock ──────────────────────────────────────────────────────
// Maps establishment type → which skill books may be stocked there.
// _injectSkillBook() in script.js picks 1 (sometimes 2) per vendor visit,
// seeded by vendor name so each shop consistently carries the same book(s).
// Books appear only in 1-2 types to ensure true dispersion.
const SKILL_BOOK_STOCK = {
  blacksmith: [
    'The Art of the Blade', 'Iron and Edge: Axework', 'The Long Reach',
    'Glaive and Halberd', 'The Forge and the Flame', 'Deep Rock: A Miner\'s Handbook',
    'A Craftsman\'s Guide', 'Working Wood',
  ],
  fletcher: [
    'Flight of the Arrow', 'Feather and Shaft',
  ],
  alchemist: [
    'The Alchemist\'s Codex', 'Radiant Paths', 'Shadows and Power', 'The Unseen World',
    'On the Six Schools of Arcane Thought', 'The Corrupted Spires: A Field Survey',
  ],
  apothecary: [
    'The Healer\'s Companion', 'The Green Compendium',
  ],
  herbalist: [
    'What the Forest Offers', 'Marks and Signs',
    'The Beastkeeper\'s Handbook', 'The Green Compendium', 'How to Live in the Wild',
    'The Eater Oak: Fact or Fable',
  ],
  general_store: [
    'How to Live in the Wild', 'The Hunter\'s Code', 'The Fire Maker\'s Handbook',
    'Still Waters: A Fisher\'s Guide', 'A Craftsman\'s Guide', 'Working Wood', 'By Star and Compass',
    'Trolls and Their Ways', 'The Seven Aspects: A Devotional',
  ],
  tavern: [
    'Bare Knuckle', 'The Wanderer\'s Cookbook', 'Ferment and Flavour', 'The Art of Persuasion',
    'Heroes, Scoundrels & War the Goat', 'Merwin\'s Collected Misadventures',
    'Encounters on the Trading Road', 'Strangers at the Bar', 'Songs from the Road',
  ],
  inn: [
    'The Wanderer\'s Cookbook', 'Ferment and Flavour',
    'The Seven Aspects: A Devotional', 'Heroes, Scoundrels & War the Goat',
    'Merwin\'s Collected Misadventures', 'Encounters on the Trading Road',
  ],
  market: [
    'Needle and Thread', 'Terms and Agreements', 'Form and Colour',
    'Flight of the Arrow', 'Bare Knuckle',
    'Heroes, Scoundrels & War the Goat', 'Merwin\'s Collected Misadventures',
    'The Seven Aspects: A Devotional', 'Trolls and Their Ways',
    'The Fall of the Aegrim Empire', 'Songs from the Road',
  ],
  merchant: [
    'Shadows and Power', 'The Crimson Rites', 'Moving in Silence',
    'The Locksmith\'s Art', 'Sleight of Hand',
  ],
  tailor: [
    'Needle and Thread', 'Form and Colour',
  ],
  stable: [
    'The Hunter\'s Code', 'Marks and Signs', 'The Beastkeeper\'s Handbook',
    'Trolls and Their Ways', 'Winged Threats of the Northern Peaks',
  ],
  library: [
    // Skill books
    'The Art of Persuasion', 'Terms and Agreements', 'The Healer\'s Companion',
    'Codes and Ciphers', 'By Star and Compass', 'Form and Colour',
    'The Unseen World', 'Radiant Paths',
    // Lore books — history & kingdoms
    'The Fall of the Aegrim Empire', 'Thirty Years of Silence',
    'A Compact of Lords', 'The Iron Lords: A Ruling History', 'Harbour and Sword',
    // Lore books — arcane
    'On the Six Schools of Arcane Thought', 'The Corrupted Spires: A Field Survey',
    // Lore books — bestiary
    'Trolls and Their Ways', 'Winged Threats of the Northern Peaks',
    // Lore books — legends & geography
    'Songs from the Road', 'The Amber Moon Prophecies', 'Strangers at the Bar',
    'The Eater Oak: Fact or Fable', 'The Sunken Reaches: A Surveyor\'s Memoir',
    'The Seven Aspects: A Devotional',
  ],
};

// ── Recipe scroll skill filter per shop type ──────────────────────────────
// Maps shop type (lowercase, underscores) → which recipe skill(s) may appear
// as scrolls there. null means no filter (all skills eligible).
const RECIPE_SCROLL_SKILLS = {
  blacksmith:    ['Smithing', 'Smelting', 'Crafting'],
  fletcher:      ['Fletching'],
  alchemist:     ['Alchemy'],
  apothecary:    ['Alchemy', 'Healing', 'Herbalism'],
  herbalist:     ['Herbalism', 'Healing', 'Alchemy'],
  tailor:        ['Sewing'],
  general_store: ['Crafting', 'Fire-making', 'Survival'],
  tavern:        ['Cooking'],
  inn:           ['Cooking'],
  market:        ['Crafting', 'Sewing', 'Cooking', 'Smithing'],
  library:       null,
  scribe:        null,
  bookshop:      null,
  merchant:      ['Crafting', 'Alchemy', 'Cooking', 'Sewing'],
};

// ── Travelling merchant stock pools ───────────────────────────────────────

const TRAVELLING_MERCHANT_POOL = {
  common: [
    'Rations', 'Apple', 'Torch', 'Rope', 'Bandage', 'Arrow',
    'Empty Vial', 'Healing Herb', 'Waterskin', 'Candle',
  ],
  uncommon: [
    'Health Potion', 'Stamina Potion', 'Antidote', 'Mana Potion',
    'Warmth Elixir', 'Rare Herb', 'Moonbloom', 'Ginseng Root',
    'Ironbark Resin', 'Eyebright', 'Dagger', 'Hunting Knife',
  ],
  rare: [
    'Greater Health Potion', 'Focused Draught', 'Fortifying Tonic',
    'Rejuvenation Potion', 'Goldenmoss',
    'Map of Ardrenhold', 'Map of Brythwen', 'Map of Dwynbroch',
    'Map of Sivanrift', 'Map of Orindroth',
  ],
};

// ── Kingdom-specific vendor additions ─────────────────────────────────────
// Merged with base ESTABLISHMENT_STOCK by _vendorStock() in script.js.
// Keys must match player.currentKingdom exactly.

const KINGDOM_VENDOR_ADDITIONS = {
  'Ardrenhold': {
    blacksmith:    ['Ardrenhold Knight Chest', 'Ardrenhold Guard Helm', 'Ardrenhold Tabard', 'Ardrenhold Plate Chest', 'Ardrenhold Cloak'],
    general_store: ['Ardren Ale', 'Map of Ardrenhold'],
    market:        ['Ardrenhold Tabard', 'Ardrenhold Cloak', 'Ardren Ale', 'Map of Ardrenhold'],
    merchant:      ['Ardrenhold Cloak', 'Ardrenhold Tabard', 'Map of Ardrenhold'],
    library:       ['A Compact of Lords'],
    tavern:        ['Ardren Ale'],
    inn:           ['Ardren Ale'],
  },
  'Dwynbroch': {
    blacksmith:    ['Dwynbroch Knight Chest', 'Dwynbroch Leather Chest', 'Dwynbroch Tabard', 'Dwynbroch Cloak'],
    general_store: ['Highland Mead', 'Map of Dwynbroch', 'Dwynbroch Scholar Robe'],
    market:        ['Dwynbroch Tabard', 'Dwynbroch Cloak', 'Highland Mead', 'Map of Dwynbroch'],
    merchant:      ['Dwynbroch Scholar Robe', 'Highland Mead', 'Map of Dwynbroch'],
    tavern:        ['Highland Mead'],
    inn:           ['Highland Mead'],
  },
  'Brythwen': {
    blacksmith:    ['Brythwen Platemail', 'Brythwen Mail Chest', 'Brythwen Blue Gambeson', 'Brythwen Leather Chest', 'Brythwen Tabard'],
    general_store: ['Map of Brythwen', 'Brythwen Cloak'],
    market:        ['Brythwen Tabard', 'Brythwen Cloak', 'Brythwen Blue Gambeson', 'Map of Brythwen'],
    merchant:      ['Brythwen Cloak', 'Brythwen Tabard', 'Map of Brythwen'],
    tavern:        [],
    inn:           [],
  },
  'Nithrond': {
    blacksmith:    ['Nithrond Mage Chest', 'Nithrond Leather Chest', 'Nithrond Red Gambeson', 'Nithrond Tabard', 'Nithrond Cloak'],
    general_store: ['Elven Tea', 'Map of Nithrond'],
    market:        ['Nithrond Tabard', 'Nithrond Cloak', 'Elven Tea', 'Map of Nithrond'],
    merchant:      ['Elven Tea', 'Nithrond Cloak', 'Map of Nithrond'],
    apothecary:    ['Elven Tea'],
    herbalist:     ['Elven Tea'],
    tavern:        ['Elven Tea'],
    inn:           ['Elven Tea'],
  },
  'Sivanrift': {
    blacksmith:    ['Sivanrift Tabard', 'Sivanrift Boots', 'Sivanrift Helm'],
    general_store: ['Garden Wine', 'Sivanrift Blossom', 'Map of Sivanrift'],
    market:        ['Sivanrift Tabard', 'Sivanrift Boots', 'Garden Wine', 'Sivanrift Blossom', 'Map of Sivanrift'],
    merchant:      ['Garden Wine', 'Sivanrift Blossom', 'Map of Sivanrift'],
    herbalist:     ['Sivanrift Blossom'],
    alchemist:     ['Sivanrift Blossom'],
    tavern:        ['Garden Wine'],
    inn:           ['Garden Wine'],
  },
  'Naradreth': {
    blacksmith:    ['Naradreth Scaled Chest', 'Naradreth Trader Chest', 'Naradreth Leather Chest', 'Naradreth Tabard'],
    general_store: ['Naradreth Tabard', 'Map of Naradreth'],
    market:        ['Naradreth Tabard', 'Naradreth Leather Chest', 'Map of Naradreth'],
    merchant:      ['Naradreth Trader Chest', 'Map of Naradreth'],
    library:       ['Harbour and Sword'],
    tavern:        [],
    inn:           [],
  },
  'Feldarún': {
    blacksmith:    ['Dwarven Warhammer', 'Feldarún Mail Chest', 'Feldarún Heavy Helm', 'Feldarún Helm', 'Feldarún Mail Boots', 'Feldarún Tabard'],
    general_store: ['Map of Feldarún', 'Feldarún Tabard'],
    market:        ['Feldarún Tabard', 'Feldarún Mail Boots', 'Map of Feldarún'],
    merchant:      ['Feldarún Mail Boots', 'Map of Feldarún'],
    library:       ['The Iron Lords: A Ruling History'],
    tavern:        [],
    inn:           [],
  },
  'Wistravael': {
    blacksmith:    ['Wistravael Platemail', 'Wistravael Green Chest', 'Wistravael Mail Chest', 'Wistravael Gladiator Helm', 'Wistravael Tabard', 'Wistravael Cloak'],
    general_store: ['Map of Wistravael', 'Wistravael Cloak'],
    market:        ['Wistravael Tabard', 'Wistravael Cloak', 'Map of Wistravael'],
    merchant:      ['Wistravael Cloak', 'Wistravael Tabard', 'Map of Wistravael'],
    tavern:        [],
    inn:           [],
  },
  'Orindroth': {
    blacksmith:    ['Orindroth Adventure Chest', 'Orindroth Green Chest', 'Orindroth Leather Chest', 'Orindroth Tabard', 'Orindroth Cloak'],
    general_store: ['Sacred Bark', 'Map of Orindroth', 'Orindroth Cloak'],
    market:        ['Orindroth Tabard', 'Orindroth Cloak', 'Sacred Bark', 'Map of Orindroth'],
    merchant:      ['Orindroth Cloak', 'Sacred Bark', 'Map of Orindroth'],
    herbalist:     ['Sacred Bark'],
    alchemist:     ['Sacred Bark'],
    tavern:        [],
    inn:           [],
  },
  'Rendarost': {
    blacksmith:    ['Rendarost Mail Chest', 'Rendarost Viking Helm', 'Rendarost Cloak', 'Rendarost Tabard'],
    general_store: ['Frost Ale', 'Map of Rendarost', 'Rendarost Cloak'],
    market:        ['Rendarost Tabard', 'Rendarost Cloak', 'Frost Ale', 'Map of Rendarost'],
    merchant:      ['Frost Ale', 'Rendarost Cloak', 'Map of Rendarost'],
    apothecary:    ['Frost Ale'],
    tavern:        ['Frost Ale'],
    inn:           ['Frost Ale'],
  },
};
