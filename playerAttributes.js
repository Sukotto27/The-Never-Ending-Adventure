// playerAttributes.js
// Single source of truth for skills, traits, and conditions.
// Loaded as a plain <script> tag before script.js — all three objects are globals.

// ============================================================
// SKILLS
// ============================================================
// Each skill has a description and a bonus field that names what it affects.
// The bonus value is the per-level flat modifier (e.g. attackBonus: +2 means
// Swordsmanship Lv3 gives +2 on top of the skill-level roll bonus).

const gameSkills = {

  // ── Combat ───────────────────────────────────────────────────────────────────
  Swordsmanship: { description: 'Expertise with bladed weapons.',             attackBonus:    +2 },
  Archery:       { description: 'Skill with bows and ranged weapons.',         attackBonus:    +2 },
  Axes:          { description: 'Proficiency with axes and hatchets.',         attackBonus:    +2 },
  Spears:        { description: 'Combat with spears and javelins.',            attackBonus:    +2 },
  Polearms:      { description: 'Mastery of halberds, staves, and glaives.',   attackBonus:    +2 },
  Brawling:      { description: 'Hand-to-hand combat proficiency.',            attackBonus:    +1 },

  // ── Wilderness & Survival ────────────────────────────────────────────────────
  Survival:      { description: 'Endure and navigate harsh environments.',     survivalBonus:  +2 },
  Hunting:       { description: 'Track and fell game in the wild.',            survivalBonus:  +2 },
  Foraging:      { description: 'Find edible plants and useful materials.',    survivalBonus:  +2 },
  Tracking:      { description: 'Follow trails and signs left by creatures.',  survivalBonus:  +2 },
  'Fire-making': { description: 'Build and maintain fires in any condition.',  survivalBonus:  +2 },
  Fishing:       { description: 'Catch fish from rivers, lakes, and seas.',    survivalBonus:  +1 },
  Herbalism:     { description: 'Identify and use medicinal and magical plants.', craftBonus:  +2 },

  // ── Crafts & Trades ──────────────────────────────────────────────────────────
  Crafting:      { description: 'General skill for making tools and goods.',   craftBonus:     +2 },
  Smithing:      { description: 'Forge and repair metal weapons and armor.',   craftBonus:     +3 },
  Fletching:     { description: 'Craft arrows, bolts, and bows.',              craftBonus:     +2 },
  Alchemy:       { description: 'Craft potions, poisons, and remedies.',       craftBonus:     +3 },
  Cooking:       { description: 'Prepare food to maximize its benefits.',      craftBonus:     +1 },
  Brewing:       { description: 'Craft ales, meads, and other beverages.',     craftBonus:     +1 },
  Sewing:        { description: 'Craft and repair cloth and leather goods.',   craftBonus:     +1 },
  Carpentry:     { description: 'Work with wood to build structures and items.',craftBonus:    +2 },
  Mining:        { description: 'Extract ore and minerals from rock.',         craftBonus:     +1 },

  // ── Magic ─────────────────────────────────────────────────────────────────────
  'Light Magic': { description: 'Harness radiant and restorative magic.',      magicBonus:     +2 },
  'Black Magic': { description: 'Wield destructive and shadow magic.',         magicBonus:     +2 },
  'Blood Magic': { description: 'Channel power through blood and sacrifice.',  magicBonus:     +2 },

  // ── Social & Knowledge ───────────────────────────────────────────────────────
  Persuasion:    { description: 'Influence others through speech.',            socialBonus:    +2 },
  Negotiating:   { description: 'Bargain and reach mutually beneficial agreements.', socialBonus: +2 },
  Healing:       { description: 'Treat wounds and ailments.',                  healBonus:      +2 },
  Decrypting:    { description: 'Decipher codes, ciphers, and encrypted texts.', intellectBonus: +2 },

  // ── Roguish ──────────────────────────────────────────────────────────────────
  Stealth:       { description: 'Move silently and avoid detection.',          stealthBonus:   +3 },
  Lockpicking:   { description: 'Open locks without a key.',                   stealthBonus:   +1 },
  Thievery:      { description: 'Pickpocket, sleight of hand, and larceny.',   stealthBonus:   +2 },

  // ── Trades & Professions ─────────────────────────────────────────────────────
  'Animal Handling': { description: 'Care for, train, and command animals.',   survivalBonus:  +2 },
  Navigation:        { description: 'Find your way by stars, maps, and landmarks.', survivalBonus: +2 },
  Artistry:          { description: 'Create paintings, sculptures, and decorative works.', socialBonus: +1 },
  Mysticism:         { description: 'Read omens, commune with unseen forces, and interpret fate.', magicBonus: +2 },

  // ── Music ─────────────────────────────────────────────────────────────────────
  Lute:              { description: 'Play the lute — notes, chords, scales, and original compositions.', socialBonus: +2 },
};

// ============================================================
// TITLES
// ============================================================

// Skill tier thresholds — one title is awarded per skill per tier reached.
// Bonus: the skillMod granted when this tier title is the active title.
const SKILL_TIERS = [
  { tier: 'Novice',      minLevel:  1,  skillBonus: 0 },
  { tier: 'Apprentice',  minLevel:  10, skillBonus: 1 },
  { tier: 'Journeyman',  minLevel:  25, skillBonus: 1 },
  { tier: 'Adept',       minLevel:  50, skillBonus: 2 },
  { tier: 'Expert',      minLevel:  75, skillBonus: 2 },
  { tier: 'Master',      minLevel:  90, skillBonus: 3 },
  { tier: 'Grandmaster', minLevel:  99, skillBonus: 4 },
];

// Profession-aware noun used to build the skill tier title name.
const SKILL_TITLE_NOUNS = {
  'Swordsmanship':   'Blade',
  'Archery':         'Archer',
  'Axes':            'Axeman',
  'Spears':          'Spearman',
  'Polearms':        'Pole-master',
  'Brawling':        'Brawler',
  'Survival':        'Survivalist',
  'Hunting':         'Hunter',
  'Foraging':        'Forager',
  'Tracking':        'Tracker',
  'Fire-making':     'Fire Keeper',
  'Fishing':         'Fisher',
  'Herbalism':       'Herbalist',
  'Crafting':        'Craftsman',
  'Smithing':        'Smith',
  'Fletching':       'Fletcher',
  'Alchemy':         'Alchemist',
  'Cooking':         'Cook',
  'Brewing':         'Brewer',
  'Sewing':          'Seamster',
  'Carpentry':       'Carpenter',
  'Mining':          'Miner',
  'Light Magic':     'Light Mage',
  'Black Magic':     'Shadow Mage',
  'Blood Magic':     'Blood Mage',
  'Persuasion':      'Orator',
  'Negotiating':     'Merchant',
  'Healing':         'Healer',
  'Decrypting':      'Cipher',
  'Stealth':         'Shadow',
  'Lockpicking':     'Locksmith',
  'Animal Handling': 'Beastmaster',
  'Navigation':      'Navigator',
  'Artistry':        'Artist',
  'Mysticism':       'Mystic',
  'Lute':            'Lutenist',
};

// Hand-crafted titles: achievements, exploration, quests, origins, etc.
// bonus: { rollBonus, skillMods: { skillName: modifier } }
// rollBonus applies to every skill check; skillMods apply only to the named skill.
const gameTitles = {

  // ── Exploration ─────────────────────────────────────────────────────────────
  'the_wanderer':       { name: 'The Wanderer',       description: 'Visited 25 locations across Estranta.',                  bonus: { rollBonus: 0, skillMods: { Survival: +1, Tracking: +1 } } },
  'the_explorer':       { name: 'The Explorer',       description: 'Visited 50 distinct locations.',                         bonus: { rollBonus: 0, skillMods: { Survival: +1, Navigation: +1 } } },
  'the_cartographer':   { name: 'The Cartographer',   description: 'Explored every tile on the map of Estranta.',           bonus: { rollBonus: 1, skillMods: { Navigation: +2 } } },
  'the_pathfinder':     { name: 'The Pathfinder',     description: 'Visited at least one location in every kingdom.',        bonus: { rollBonus: 0, skillMods: { Tracking: +2, Navigation: +1 } } },

  // ── Combat ──────────────────────────────────────────────────────────────────
  'the_fighter':        { name: 'The Fighter',        description: 'Defeated 10 enemies in battle.',                        bonus: { rollBonus: 0, skillMods: { Brawling: +1 } } },
  'the_slayer':         { name: 'The Slayer',         description: 'Defeated 50 enemies in battle.',                        bonus: { rollBonus: 0, skillMods: { Swordsmanship: +1, Archery: +1 } } },
  'the_monster_hunter': { name: 'The Monster Hunter', description: 'Slain 100 foes across Estranta.',                       bonus: { rollBonus: 1, skillMods: { Hunting: +1 } } },
  'the_warlord':        { name: 'The Warlord',        description: 'Defeated 500 enemies.',                                 bonus: { rollBonus: 1, skillMods: { Swordsmanship: +2 } } },

  // ── Wealth ──────────────────────────────────────────────────────────────────
  'the_coin_lord':      { name: 'The Coin Lord',      description: 'Accumulated 1,000 gold at once.',                       bonus: { rollBonus: 0, skillMods: { Negotiating: +2 } } },
  'the_magnate':        { name: 'The Magnate',        description: 'Accumulated 5,000 gold at once.',                       bonus: { rollBonus: 1, skillMods: { Negotiating: +2, Persuasion: +1 } } },

  // ── Skills & Knowledge ──────────────────────────────────────────────────────
  'the_polymath':       { name: 'The Polymath',       description: 'Reached level 20 in five or more skills.',              bonus: { rollBonus: 1 } },
  'the_renaissance':    { name: 'The Renaissance',    description: 'Reached level 20 in ten or more skills.',               bonus: { rollBonus: 2 } },
  'the_sage':           { name: 'The Sage',           description: 'Learned 10 or more distinct skills.',                   bonus: { rollBonus: 1, skillMods: { Decrypting: +1 } } },
  'the_devoted':        { name: 'The Devoted',        description: 'Used a single skill more than 100 times.',              bonus: { rollBonus: 0, skillMods: { Crafting: +1 } } },

  // ── Social ──────────────────────────────────────────────────────────────────
  'the_diplomat':       { name: 'The Diplomat',       description: 'Spoke with 25 unique NPCs.',                            bonus: { rollBonus: 0, skillMods: { Persuasion: +2 } } },
  'the_negotiator':     { name: 'The Negotiator',     description: 'Completed 10 successful trade negotiations.',            bonus: { rollBonus: 0, skillMods: { Negotiating: +2 } } },

  // ── Survival ────────────────────────────────────────────────────────────────
  'the_survivor':       { name: 'The Survivor',       description: 'Survived 30 consecutive nights in the wilderness.',     bonus: { rollBonus: 0, skillMods: { Survival: +2 } } },
  'the_hermit':         { name: 'The Hermit',         description: 'Camped 10 consecutive nights without entering a settlement.', bonus: { rollBonus: 0, skillMods: { Foraging: +1, 'Fire-making': +1 } } },

  // ── Quests ──────────────────────────────────────────────────────────────────
  'the_hero':           { name: 'The Hero',           description: 'Completed 10 quests.',                                  bonus: { rollBonus: 1 } },
  'the_legend':         { name: 'The Legend',         description: 'Completed 25 quests.',                                  bonus: { rollBonus: 2 } },

  // ── Lore ────────────────────────────────────────────────────────────────────
  'the_archivist':      { name: 'The Archivist',      description: 'Discovered the lore of 5 or more ancient ruins.',       bonus: { rollBonus: 0, skillMods: { Decrypting: +2 } } },

  // ── Special / Origin ────────────────────────────────────────────────────────
  'the_chosen':         { name: 'The Chosen',         description: 'Bound to the mysterious d20 — a destiny unlike any other.', bonus: { rollBonus: 1 } },
  'the_vagrant':        { name: 'The Vagrant',        description: 'Began with nothing, in the wild.',                     bonus: { rollBonus: 0, skillMods: { Survival: +1, Foraging: +1 } } },
  'the_noble_born':     { name: 'The Noble Born',     description: 'Of noble lineage — trained in rhetoric and governance.', bonus: { rollBonus: 0, skillMods: { Persuasion: +1, Negotiating: +1 } } },
  'the_outlander':      { name: 'The Outlander',      description: 'A stranger to these lands, forged by hardship.',       bonus: { rollBonus: 0, skillMods: { Survival: +2 } } },
  'the_scribe':         { name: 'The Scribe',         description: 'Awarded for recording 50 story events in the log.',     bonus: { rollBonus: 0, skillMods: { Decrypting: +1, Persuasion: +1 } } },

  // ── Guild titles are added dynamically by the Masters Guild system ───────────
};

// ============================================================
// TRAITS
// ============================================================
// description  — flavour text shown in journal
// displayBonus — human-readable effect shown in journal
// Mechanical bonus fields are used by the action/combat resolution engine.

const gameTraits = {

  // ── Brave / Cowardly ─────────────────────────────────────────────────────────
  Brave: {
    description:  'Unafraid of danger.',
    displayBonus: '+3 to courage checks; resist fear effects',
    opposite:     'Cowardly',
    courageBonus: +3,
  },
  Cowardly: {
    description:  'Flees when threatened.',
    displayBonus: '−3 to courage checks; may auto-flee from combat',
    opposite:     'Brave',
    couragePenalty: -3,
  },

  // ── Cunning / Naive ───────────────────────────────────────────────────────────
  Cunning: {
    description:  'Schemes to gain advantage.',
    displayBonus: '+2 to manipulation and deception rolls',
    opposite:     'Naive',
    manipulationBonus: +2,
  },
  Naive: {
    description:  'Too trusting by half.',
    displayBonus: '−2 to deception checks; susceptible to manipulation',
    opposite:     'Cunning',
    manipulationPenalty: -2,
  },

  // ── Loyal / Treacherous ───────────────────────────────────────────────────────
  Loyal: {
    description:  'Stays true to allies.',
    displayBonus: '+4 to trust interactions; allies fight harder',
    opposite:     'Treacherous',
    trustBonus:   +4,
  },
  Treacherous: {
    description:  'Betrays allies when it suits them.',
    displayBonus: '−4 to trust interactions; others are slow to confide in you',
    opposite:     'Loyal',
    trustPenalty: -4,
  },

  // ── Ruthless / Merciful ───────────────────────────────────────────────────────
  Ruthless: {
    description:  'Shows no mercy.',
    displayBonus: '+3 to intimidation; enemies may flee or surrender',
    opposite:     'Merciful',
    intimidationBonus: +3,
  },
  Merciful: {
    description:  'Cannot bring themselves to deliver a killing blow.',
    displayBonus: '+2 to healing and social rolls; −2 to intimidation',
    opposite:     'Ruthless',
    healBonus: +2, intimidationPenalty: -2,
  },

  // ── Kind / Cruel ──────────────────────────────────────────────────────────────
  Kind: {
    description:  'Empathizes easily.',
    displayBonus: '+2 to social rolls; NPCs more willing to help',
    opposite:     'Cruel',
    socialBonus:  +2,
  },
  Cruel: {
    description:  'Takes pleasure in others\' suffering.',
    displayBonus: '+2 to intimidation; −3 to social rolls with non-hostile NPCs',
    opposite:     'Kind',
    intimidationBonus: +2, socialPenalty: -3,
  },

  // ── Wise / Reckless ───────────────────────────────────────────────────────────
  Wise: {
    description:  'Sound judgment and deep insight.',
    displayBonus: '+2 to insight and knowledge checks; resists deception',
    opposite:     'Reckless',
    intellectBonus: +2,
  },
  Reckless: {
    description:  'Acts without thinking through consequences.',
    displayBonus: '−2 to insight checks; more likely to trigger traps and ambushes',
    opposite:     'Wise',
    intellectPenalty: -2,
  },

  // ── Charismatic / Abrasive ────────────────────────────────────────────────────
  Charismatic: {
    description:  'A natural leader who draws people in.',
    displayBonus: '+3 to persuasion and social rolls; NPCs respond warmly',
    opposite:     'Abrasive',
    socialBonus: +3,
  },
  Abrasive: {
    description:  'Rubs everyone the wrong way.',
    displayBonus: '−3 to social rolls; NPCs start with a lower disposition',
    opposite:     'Charismatic',
    socialPenalty: -3,
  },

  // ── Patient / Impulsive ───────────────────────────────────────────────────────
  Patient: {
    description:  'Bides time and acts at the perfect moment.',
    displayBonus: '+2 to crafting and ambush checks; setbacks rarely rattle you',
    opposite:     'Impulsive',
    craftBonus: +1, survivalBonus: +1,
  },
  Impulsive: {
    description:  'Acts first, thinks later.',
    displayBonus: '−1 to crafting and survival checks; prone to costly mistakes',
    opposite:     'Patient',
    craftPenalty: -1, survivalPenalty: -1,
  },

  // ── Honorable / Deceitful ─────────────────────────────────────────────────────
  Honorable: {
    description:  'Bound by an unwavering code of conduct.',
    displayBonus: '+3 to trust interactions; others hold you in high regard',
    opposite:     'Deceitful',
    trustBonus: +3,
  },
  Deceitful: {
    description:  'Never speaks a straight truth.',
    displayBonus: '+2 to deception rolls; −3 to trust when lies are uncovered',
    opposite:     'Honorable',
    manipulationBonus: +2, trustPenalty: -3,
  },

  // ── Resilient / Fragile ───────────────────────────────────────────────────────
  Resilient: {
    description:  'Bounces back from hardship quickly.',
    displayBonus: '+2 to endurance rolls; negative conditions wear off faster',
    opposite:     'Fragile',
    survivalBonus: +2,
  },
  Fragile: {
    description:  'Struggles to endure prolonged hardship.',
    displayBonus: '−2 to endurance rolls; negative conditions last longer',
    opposite:     'Resilient',
    survivalPenalty: -2,
  },

  // ── Generous / Greedy ────────────────────────────────────────────────────────
  Generous: {
    description:  'Gives freely without expectation of return.',
    displayBonus: '+2 to NPC relations; merchants offer better prices',
    opposite:     'Greedy',
    socialBonus: +2,
  },
  Greedy: {
    description:  'Always wants more for themselves.',
    displayBonus: '+3 to negotiation rolls; −2 to social rolls with giving NPCs',
    opposite:     'Generous',
    socialPenalty: -2, negotiatingBonus: +3,
  },

  // ── Single traits (all now have a paired opposite) ─────────────────────────

  'Strong-Willed': {
    description:  'Refuses to yield to hardship or pressure.',
    displayBonus: '+2 to resist fear, curses, and manipulation; NPCs cannot easily sway you',
    opposite:     'Weak-Willed',
    willBonus: +2, socialBonus: +1,
  },
  'Weak-Willed': {
    description:  'Caves to pressure and yields under hardship.',
    displayBonus: '−2 to resist fear and curses; NPCs sense your uncertainty; −1 to social',
    opposite:     'Strong-Willed',
    willPenalty: -2, socialPenalty: -1,
  },

  Evil: {
    description:  'Drawn to darkness and cruelty.',
    displayBonus: '+2 to intimidation; −3 to social rolls with good-aligned NPCs',
    opposite:     'Virtuous',
    intimidationBonus: +2, socialPenalty: -3,
  },
  Virtuous: {
    description:  'Upholds goodness and moral principle in all things.',
    displayBonus: '+2 to social with good-aligned NPCs; +2 to trust interactions',
    opposite:     'Evil',
    socialBonus: +2, trustBonus: +2,
  },

  'Good-Hearted': {
    description:  'Naturally kind and well-meaning.',
    displayBonus: '+2 to social rolls with common folk; +1 to Healing',
    opposite:     'Cold-Hearted',
    socialBonus: +2, healBonus: +1,
  },
  'Cold-Hearted': {
    description:  'Emotionally distant; unmoved by others.',
    displayBonus: '−2 to social rolls; −1 to Healing; NPCs find you difficult to connect with',
    opposite:     'Good-Hearted',
    socialPenalty: -2, healPenalty: -1,
  },

  Strong: {
    description:  'Exceptionally powerful in body.',
    displayBonus: '+2 to attack rolls; +1 to Survival',
    opposite:     'Feeble',
    attackBonus: +2, survivalBonus: +1,
  },
  Feeble: {
    description:  'Physically weaker than most.',
    displayBonus: '−2 to attack rolls; −1 to Survival',
    opposite:     'Strong',
    attackPenalty: -2, survivalPenalty: -1,
  },

  Calm: {
    description:  'Unshaken in the face of chaos.',
    displayBonus: '+1 to all rolls; fewer negative outcomes from stress',
    opposite:     'Hot-Headed',
    rollBonus: +1,
  },
  'Hot-Headed': {
    description:  'Loses composure when provoked.',
    displayBonus: '−2 to social rolls when challenged; +1 to first attack in a fight',
    opposite:     'Calm',
    socialPenalty: -2, attackBonus: +1,
  },

  Intelligent: {
    description:  'Sharp analytical mind.',
    displayBonus: '+2 to Decrypting, Alchemy, and knowledge checks',
    opposite:     'Dim-Witted',
    intellectBonus: +2,
  },
  'Dim-Witted': {
    description:  'Slow to reason and grasp complex ideas.',
    displayBonus: '−2 to Decrypting and knowledge checks; −1 to Crafting',
    opposite:     'Intelligent',
    intellectPenalty: -2, craftPenalty: -1,
  },

  'Quick-Learner': {
    description:  'Picks up new skills faster than most.',
    displayBonus: 'Skill XP gains increased by 25%',
    opposite:     'Slow-Learner',
    xpBonus: 0.25,
  },
  'Slow-Learner': {
    description:  'Takes longer to absorb new skills.',
    displayBonus: 'Skill XP gains reduced by 20%',
    opposite:     'Quick-Learner',
    xpBonus: -0.20,
  },

  Sneaky: {
    description:  'Moves and acts without drawing attention.',
    displayBonus: '+2 to Stealth; +1 to Thievery',
    opposite:     'Clumsy',
    stealthBonus: +2,
  },
  Clumsy: {
    description:  'Noisy and accident-prone; hard to miss.',
    displayBonus: '−2 to Stealth; −1 to Crafting and Fishing',
    opposite:     'Sneaky',
    stealthPenalty: -2, craftPenalty: -1,
  },

  Witty: {
    description:  'Quick with a sharp remark; socially nimble.',
    displayBonus: '+1 to social rolls; +1 to Persuasion; can defuse tense situations',
    opposite:     'Dull-Witted',
    socialBonus: +1, manipulationBonus: +1,
  },
  'Dull-Witted': {
    description:  'No spark for quick thinking or clever repartee.',
    displayBonus: '−1 to social rolls; −1 to Decrypting',
    opposite:     'Witty',
    socialPenalty: -1, intellectPenalty: -1,
  },

  Untrustworthy: {
    description:  'Others sense something off about you.',
    displayBonus: '−3 to trust interactions; NPCs slow to share information',
    opposite:     'Trustworthy',
    trustPenalty: -3, socialPenalty: -1,
  },
  Trustworthy: {
    description:  'Others sense they can rely on you completely.',
    displayBonus: '+3 to trust interactions; NPCs share information readily; +1 to social',
    opposite:     'Untrustworthy',
    trustBonus: +3, socialBonus: +1,
  },

  Determined: {
    description:  'Refuses to fail no matter the odds.',
    displayBonus: '+2 to Survival in desperate moments; NPCs admire your resolve',
    opposite:     'Defeatist',
    survivalBonus: +2, socialBonus: +1,
  },
  Defeatist: {
    description:  'Gives up when things look grim.',
    displayBonus: '−2 to Survival in desperate situations; −1 to combat endurance',
    opposite:     'Determined',
    survivalPenalty: -2, couragePenalty: -1,
  },

  Charming: {
    description:  'Effortlessly disarming and pleasant.',
    displayBonus: '+2 to social rolls; NPCs respond positively to first impressions',
    opposite:     'Off-Putting',
    socialBonus: +2,
  },
  'Off-Putting': {
    description:  'Makes others uncomfortable without meaning to.',
    displayBonus: '−3 to social rolls; NPCs are slow to warm up to you',
    opposite:     'Charming',
    socialPenalty: -3,
  },

  Savage: {
    description:  'Fights with brutal, unrestrained aggression.',
    displayBonus: '+2 to attack rolls; −2 to social rolls; enemies fear you',
    opposite:     'Composed',
    attackBonus: +2, socialPenalty: -2,
  },
  Composed: {
    description:  'Measured and controlled under pressure.',
    displayBonus: '+2 to social rolls; +1 to Crafting; NPCs see you as steady and reliable',
    opposite:     'Savage',
    socialBonus: +2, craftBonus: +1,
  },

  Brutal: {
    description:  'Known for excessive violence in combat.',
    displayBonus: '+3 to intimidation; +1 to attack rolls; −3 to social with non-hostile NPCs',
    opposite:     'Gentle',
    intimidationBonus: +3, attackBonus: +1, socialPenalty: -3,
  },
  Gentle: {
    description:  'Avoids unnecessary violence; soft in spirit.',
    displayBonus: '+1 to Healing; +1 to social with peaceful NPCs; −2 to attack rolls',
    opposite:     'Brutal',
    healBonus: +1, socialBonus: +1, attackPenalty: -2,
  },

  Lucky: {
    description:  'Fortune seems to favor you at critical moments.',
    displayBonus: '+1 to all rolls',
    opposite:     'Unlucky',
    rollBonus: +1,
  },
  Unlucky: {
    description:  'Bad fortune haunts you.',
    displayBonus: '−1 to all rolls',
    opposite:     'Lucky',
    rollBonus: -1,
  },

  Scholar: {
    description:  'Deeply learned in history, lore, and arcane knowledge.',
    displayBonus: '+3 to Decrypting; +2 to Mysticism and knowledge checks',
    opposite:     'Ignorant',
    intellectBonus: +3,
  },
  Ignorant: {
    description:  'Lacks education and awareness of the wider world.',
    displayBonus: '−3 to Decrypting and lore checks; −1 to Mysticism',
    opposite:     'Scholar',
    intellectPenalty: -3,
  },

  Survivalist: {
    description:  'Thrives in the wilderness where others would perish.',
    displayBonus: '+3 to Survival; +1 to Hunting, Foraging, and Fire-making',
    opposite:     'Pampered',
    survivalBonus: +3,
  },
  Pampered: {
    description:  'Unaccustomed to hardship; softened by comfort.',
    displayBonus: '−3 to Survival; −1 to Hunting and Foraging',
    opposite:     'Survivalist',
    survivalPenalty: -3,
  },

  Adventurous: {
    description:  'Drawn to the unknown; thrives in new places.',
    displayBonus: '+1 to Survival; +1 to social rolls when meeting strangers',
    opposite:     'Sheltered',
    survivalBonus: +1, socialBonus: +1,
  },
  Sheltered: {
    description:  'Rarely ventured beyond familiar walls.',
    displayBonus: '−1 to Survival; −1 to Tracking; strangers make you uneasy; −1 to social',
    opposite:     'Adventurous',
    survivalPenalty: -1, intellectPenalty: -1, socialPenalty: -1,
  },

  Compassionate: {
    description:  'Deeply moved by the suffering of others.',
    displayBonus: '+2 to Healing; +1 to social rolls with downtrodden NPCs',
    opposite:     'Callous',
    healBonus: +2, socialBonus: +1,
  },
  Callous: {
    description:  'Unmoved by others\' suffering.',
    displayBonus: '−2 to Healing; −1 to social with NPCs in need',
    opposite:     'Compassionate',
    healPenalty: -2, socialPenalty: -1,
  },

  Rude: {
    description:  'Lacks basic social grace.',
    displayBonus: '−2 to social rolls; +1 to intimidation',
    opposite:     'Courteous',
    socialPenalty: -2, intimidationBonus: +1,
  },
  Courteous: {
    description:  'Well-mannered and respectful in all dealings.',
    displayBonus: '+2 to social rolls; +1 to trust interactions',
    opposite:     'Rude',
    socialBonus: +2, trustBonus: +1,
  },

  Clever: {
    description:  'Resourceful and quick-thinking.',
    displayBonus: '+1 to Crafting; +2 to Decrypting; finds solutions others miss',
    opposite:     'Obtuse',
    craftBonus: +1, intellectBonus: +2,
  },
  Obtuse: {
    description:  'Misses the obvious; slow to find solutions.',
    displayBonus: '−2 to Crafting; −1 to Decrypting',
    opposite:     'Clever',
    craftPenalty: -2, intellectPenalty: -1,
  },

  Inquisitive: {
    description:  'Driven to understand and uncover the truth.',
    displayBonus: '+2 to Decrypting; +1 to Tracking and knowledge checks',
    opposite:     'Incurious',
    intellectBonus: +2, survivalBonus: +1,
  },
  Incurious: {
    description:  'Has no drive to learn or explore.',
    displayBonus: '−1 to Decrypting; −1 to Tracking; misses clues others notice',
    opposite:     'Inquisitive',
    intellectPenalty: -1, survivalPenalty: -1,
  },

  Observant: {
    description:  'Notices details others overlook.',
    displayBonus: '+1 to Tracking; +1 to Survival; harder to ambush',
    opposite:     'Oblivious',
    survivalBonus: +1, intellectBonus: +1,
  },
  Oblivious: {
    description:  'Misses what is plainly in view.',
    displayBonus: '−1 to Tracking; −1 to Survival; easier to ambush',
    opposite:     'Observant',
    survivalPenalty: -1, intellectPenalty: -1,
  },

  Gallant: {
    description:  'Chivalrous and protective of those weaker.',
    displayBonus: '+2 to courage checks; +1 to social with common folk',
    opposite:     'Ignoble',
    courageBonus: +2, socialBonus: +1,
  },
  Ignoble: {
    description:  'Dishonorable; acts for selfish gain without care for others.',
    displayBonus: '−2 to trust interactions; −1 to social with honorable NPCs',
    opposite:     'Gallant',
    trustPenalty: -2, socialPenalty: -1,
  },

  Valiant: {
    description:  'A hero of courage and noble action.',
    displayBonus: '+3 to courage checks; +2 to trust with allies and NPCs in need',
    opposite:     'Craven',
    courageBonus: +3, trustBonus: +2,
  },
  Craven: {
    description:  'Lacks moral courage when truly called to act.',
    displayBonus: '−3 to courage checks; −2 to trust with allies; seen as unreliable',
    opposite:     'Valiant',
    couragePenalty: -3, trustPenalty: -2,
  },

  Honest: {
    description:  'Always speaks the truth, even when it hurts.',
    displayBonus: '+3 to trust interactions; −2 to deception checks',
    opposite:     'Deceptive',
    trustBonus: +3, manipulationPenalty: -2,
  },
  Deceptive: {
    description:  'Uses misdirection and half-truths freely.',
    displayBonus: '+1 to manipulation; −2 to trust when seen through',
    opposite:     'Honest',
    manipulationBonus: +1, trustPenalty: -2,
  },

};

// ============================================================
// CONDITIONS / EFFECTS
// ============================================================
// id (key)         — used by applyCondition / removeCondition / player.conditions[]
// name             — display label in Effects sidebar
// icon             — emoji shown in sidebar and story messages
// defaultDuration  — turns remaining when first applied (999 = indefinite)
// harmful          — true = red tint in sidebar, false = green tint
// rollBonus        — flat modifier added to ALL performSkillCheck rolls
// skillMods        — per-skill flat modifiers (stack with rollBonus)
// staminaRegen     — stamina delta applied each time-of-day tick (+/-)

const CONDITION_DEFS = {

  // ── Harmful ──────────────────────────────────────────────────────────────────
  cold: {
    name: 'Cold',           icon: '🥶', defaultDuration: 4,  harmful: true,
    rollBonus: 0,  skillMods: { Survival: -1 },
    staminaRegen: -5,
  },
  wet: {
    name: 'Soaked',         icon: '💧', defaultDuration: 3,  harmful: true,
    rollBonus: 0,  skillMods: { 'Fire-making': -1 },
    staminaRegen: -3,
  },
  injured: {
    name: 'Injured',        icon: '🩹', defaultDuration: 6,  harmful: true,
    rollBonus: 0,  skillMods: { Swordsmanship: -2, Archery: -2, Brawling: -2, Survival: -1 },
    staminaRegen: 0,
  },
  exhausted: {
    name: 'Exhausted',      icon: '😮‍💨', defaultDuration: 2, harmful: true,
    rollBonus: -2, skillMods: {},
    staminaRegen: 0,
  },
  peckish: {
    name: 'Peckish',        icon: '🍽️', defaultDuration: 999, harmful: true,
    rollBonus: 0,  skillMods: {},
    staminaRegen: -1,
  },
  hungry: {
    name: 'Hungry',         icon: '🫙', defaultDuration: 999, harmful: true,
    rollBonus: -1, skillMods: {},
    staminaRegen: -3,
  },
  starving: {
    name: 'Starving',       icon: '💀', defaultDuration: 999, harmful: true,
    rollBonus: -2, skillMods: { Survival: -2, Swordsmanship: -1, Brawling: -1 },
    staminaRegen: -5,
    // life drain handled explicitly in tickConditions
  },
  encumbered: {
    name: 'Encumbered',     icon: '⚖️', defaultDuration: 999, harmful: true,
    rollBonus: -1, skillMods: { Survival: -1 },
    staminaRegen: -2,
  },
  overloaded: {
    name: 'Overloaded',     icon: '🏋️', defaultDuration: 999, harmful: true,
    rollBonus: -2, skillMods: { Swordsmanship: -2, Survival: -2, Brawling: -1 },
    staminaRegen: -4,
  },
  sick: {
    name: 'Sick',           icon: '🤒', defaultDuration: 8,  harmful: true,
    rollBonus: -1, skillMods: {},
    staminaRegen: -4,
  },
  poisoned: {
    name: 'Poisoned',       icon: '☠️', defaultDuration: 4,  harmful: true,
    rollBonus: -1, skillMods: {},
    staminaRegen: -6,
  },
  cursed: {
    name: 'Cursed',         icon: '🌑', defaultDuration: 999, harmful: true,
    rollBonus: -2, skillMods: {},
    staminaRegen: 0,
  },
  cursed_corruption: {
    name: 'Corrupted',      icon: '🩸', defaultDuration: 999, harmful: true,
    rollBonus: -1, skillMods: { Swordsmanship: -1, Archery: -1, Survival: -1 },
    staminaRegen: -3,
    // Progressive — corruptionStage on player object tracks severity (1–5).
    // Stage advances each time tickConditions fires while this is active.
    // Cure: only the Veldrite Cure Potion brewed by Davolar.
  },
  corruption_delayed: {
    name: 'Stasis',         icon: '⏳', defaultDuration: 4, harmful: false,
    rollBonus: 0,  skillMods: {},
    staminaRegen: 0,
    // Davolar's delay tincture — while active, corruption stage does not advance.
  },

  // ── Beneficial ───────────────────────────────────────────────────────────────
  well_fed: {
    name: 'Well Fed',       icon: '🍖', defaultDuration: 4,  harmful: false,
    rollBonus: 1,  skillMods: {},
    staminaRegen: 5,
  },
  rejuvenated: {
    name: 'Rejuvenated',    icon: '✨', defaultDuration: 5,  harmful: false,
    rollBonus: 2,  skillMods: {},
    staminaRegen: 0,
  },
  blessings: {
    name: "Dreamer's Blessing", icon: '🌌', defaultDuration: 6, harmful: false,
    rollBonus: 2,  skillMods: {},
    staminaRegen: 3,
  },
  inspired: {
    name: 'Inspired',       icon: '⚡', defaultDuration: 3,  harmful: false,
    rollBonus: 1,  skillMods: {},
    staminaRegen: 0,
  },
  fortified: {
    name: 'Fortified',      icon: '🛡️', defaultDuration: 4,  harmful: false,
    rollBonus: 0,  skillMods: { Swordsmanship: +1, Brawling: +1, Survival: +1 },
    staminaRegen: 0,
  },
  focused: {
    name: 'Focused',        icon: '🎯', defaultDuration: 3,  harmful: false,
    rollBonus: 0,  skillMods: { Archery: +2, Tracking: +1 },
    staminaRegen: 0,
  },
  hydrated: {
    name: 'Hydrated',       icon: '💧', defaultDuration: 5,  harmful: false,
    rollBonus: 0,  skillMods: { Survival: +1 },
    staminaRegen: 4,
  },

  // ── Additional conditions (from glossary) ────────────────────────────────────
  thirsty: {
    name: 'Thirsty',         icon: '🏜️', defaultDuration: 999, harmful: true,
    rollBonus: -1, skillMods: { Survival: -1 },
    staminaRegen: -2,
  },
  weary: {
    name: 'Weary',           icon: '😔', defaultDuration: 3,   harmful: true,
    rollBonus: -1, skillMods: {},
    staminaRegen: -1,
  },
  well_rested: {
    name: 'Well Rested',     icon: '🛏️', defaultDuration: 4,   harmful: false,
    rollBonus: +1, skillMods: {},
    staminaRegen: +2,
  },
  satisfied: {
    name: 'Satisfied',       icon: '😌', defaultDuration: 3,   harmful: false,
    rollBonus: +1, skillMods: {},
    staminaRegen: +1,
  },
  sore: {
    name: 'Sore',            icon: '💢', defaultDuration: 4,   harmful: true,
    rollBonus: 0,  skillMods: { Swordsmanship: -1, Brawling: -1, Survival: -1 },
    staminaRegen: 0,
  },
  bleeding: {
    name: 'Bleeding',        icon: '🩸', defaultDuration: 3,   harmful: true,
    rollBonus: 0,  skillMods: {},
    staminaRegen: 0,
    // life drain handled in tickConditions
  },
  wounded: {
    name: 'Wounded',         icon: '💥', defaultDuration: 8,   harmful: true,
    rollBonus: -1, skillMods: { Swordsmanship: -3, Archery: -3, Brawling: -3, Survival: -2 },
    staminaRegen: 0,
  },
  fatally_wounded: {
    name: 'Fatally Wounded', icon: '💔', defaultDuration: 4,   harmful: true,
    rollBonus: -3, skillMods: {},
    staminaRegen: 0,
    // heavy life drain in tickConditions
  },
  bleeding_out: {
    name: 'Bleeding Out',    icon: '🫀', defaultDuration: 2,   harmful: true,
    rollBonus: -4, skillMods: {},
    staminaRegen: 0,
    // severe life drain in tickConditions
  },
};
