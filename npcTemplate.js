const npcRaces = ['Human', 'Elf', 'Dwarf', 'Orc', 'Goblin', 'Halfling', 'Dragonkin'];

const npcGenders = ['Male', 'Female', 'Non-Binary', 'Other'];

// ── NPC Social Class Data ─────────────────────────────────────────────────
// Organised by the 9 social classes. Each class lists NPC-only professions.
const npcSocialClassData = {
  Royalty: {
    icon: '👑',
    desc: 'Kings, queens, and those born to rule.',
    professions: [
      'King', 'Queen', 'Prince', 'Princess', 'Emperor', 'Empress',
      'Crown Prince', 'Crown Princess', 'Regent', 'Royal Heir',
    ],
  },
  Noble: {
    icon: '🏛',
    desc: 'Lords, administrators, and landed gentry.',
    professions: [
      'Advisor', 'Ambassador', 'Baron', 'Baroness', 'Castellan', 'Chamberlain',
      'Chancellor', 'Chief', 'Chieftain', 'Count', 'Countess', 'Diplomat',
      'Duchess', 'Duke', 'Elder', 'Handmaiden', 'Herald', 'Lady', 'Lord',
      'Noble', 'Page', 'Reeve', 'Spymaster', 'Steward', 'Thane', 'Treasurer',
    ],
  },
  Military: {
    icon: '⚔',
    desc: 'Soldiers, knights, and those who serve by the sword.',
    professions: [
      'Archer', 'Armorer', 'Bounty Hunter', 'Captain', 'Constable',
      'Executioner', 'Gatekeeper', 'Guard', 'Knight', 'Knight Errant',
      'Marshal', 'Mercenary', 'Night Watchman', 'Pathfinder', 'Pikeman',
      'Ranger', 'Scout', 'Sellsword', 'Sentinel', 'Shield Maiden',
      'Siege Engineer', 'Soldier', 'Spearman', 'Squire', 'Swordsman',
      'Tracker', 'Warden', 'Watchman',
    ],
  },
  Peasant: {
    icon: '🌾',
    desc: 'Common labourers and the working poor.',
    professions: [
      'Baker', 'Barber', 'Butcher', 'Candle Maker', 'Chandler', 'Cobbler',
      'Commoner', 'Cooper', 'Farmer', 'Fisherman', 'Gravedigger',
      'Horse Breeder', 'Hunter', 'Kitchen Hand', 'Labourer', 'Miller',
      'Miner', 'Rat Catcher', 'Shepherd', 'Stable Hand', 'Trapper',
      'Woodcutter', 'Woodsman',
    ],
  },
  Artisan: {
    icon: '🔨',
    desc: 'Skilled craftsmen and tradespeople.',
    professions: [
      'Antiquarian', 'Architect', 'Blacksmith', 'Bowyer', 'Brewer',
      'Carpenter', 'Cartwright', 'Cloth Merchant', 'Falconer', 'Fletcher',
      'Gem Cutter', 'Glassblower', 'Heraldic Artist', 'Innkeeper', 'Jeweller',
      'Leatherworker', 'Mapmaker', 'Mask Maker', 'Mason', 'Merchant',
      'Painter', 'Papermaker', 'Potter', 'Saddler', 'Sailmaker', 'Sculptor',
      'Silversmith', 'Smith', 'Spice Trader', 'Swordsmith', 'Tailor',
      'Tanner', 'Tavern Keeper', 'Trader', 'Weaver',
    ],
  },
  Outcast: {
    icon: '🌑',
    desc: 'Criminals, exiles, and those outside the law.',
    professions: [
      'Assassin', 'Bandit', 'Beggar', 'Dungeon Delver', 'Exile', 'Fence',
      'Fugitive', 'Pilgrim', 'Pirate', 'Rogue', 'Sailor', 'Spy', 'Wanderer',
    ],
  },
  'Performance Arts': {
    icon: '🎭',
    desc: 'Performers, entertainers, and keepers of culture.',
    professions: [
      'Bard', 'Jester', 'Minstrel', 'Performer', 'Poet', 'Storyteller', 'Thespian',
      'Troubadour',
    ],
  },
  Scholar: {
    icon: '📖',
    desc: 'Learned minds who pursue knowledge and truth.',
    professions: [
      'Apothecary', 'Archivist', 'Astrologer', 'Book Keeper', 'Calligrapher',
      'Cartographer', 'Court Advisor', 'Healer', 'Herbalist', 'Historian',
      'Investigator', 'Librarian', 'Loremaster', 'Midwife', 'Navigator',
      'Philosopher', 'Sage', 'Scholar', 'Scribe',
    ],
  },
  Arcane: {
    icon: '✨',
    desc: 'Practitioners of magic and the mystical arts.',
    professions: [
      'Alchemist', 'Cleric', 'Court Mage', 'Dragonologist', 'Druid',
      'Enchanter', 'Mage', 'Mystic', 'Oracle', 'Priest', 'Rune Crafter',
      'Scholar of the Arcane', 'Soothsayer', 'Sorcerer', 'Sorceress',
      'Witch', 'Wizard',
    ],
  },
};

// Derived flat array for backwards compat
const npcProfessions = Object.values(npcSocialClassData).flatMap(c => c.professions);

// All 9 social class names
const npcSocialClasses = Object.keys(npcSocialClassData);

// Helper: get social class for a given profession string
function getNpcSocialClass(profession) {
  for (const [cls, data] of Object.entries(npcSocialClassData)) {
    if (data.professions.includes(profession)) return cls;
  }
  return 'Peasant';
}

// ── Physical Attribute Tables ──────────────────────────────────────────────
// Each table is a pool to draw from independently. The NPC generator composes
// them into a complete appearance description.

const NPC_PHYS_BUILD = [
  'lean and wiry',
  'stocky and broad-shouldered',
  'heavyset',
  'slender',
  'powerfully built',
  'gaunt and angular',
  'compact and muscular',
  'willowy',
  'of average build',
  'rotund',
  'rangy and long-limbed',
  'slight of frame',
  'thick-necked and barrel-chested',
  'trim and athletic',
  'broad across the chest',
  'spare and leanly muscled',
  'soft around the middle',
  'rail-thin',
];

const NPC_PHYS_HEIGHT = [
  'very short',
  'short',
  'below average height',
  'of middling height',
  'average height',
  'slightly above average height',
  'tall',
  'unusually tall',
  'towering',
];

const NPC_PHYS_AGE = [
  'very young — barely past adolescence',
  'young',
  'in their early twenties',
  'in their mid-twenties',
  'in their early thirties',
  'in their mid-thirties',
  'in their forties',
  'approaching middle age',
  'middle-aged',
  'in their fifties',
  'grizzled — somewhere past fifty',
  'elderly',
  'very old',
  'ancient looking, though still sharp-eyed',
  'of indeterminate age — could be thirty, could be sixty',
];

const NPC_PHYS_HAIR_COLOR = [
  'black',
  'dark black',
  'dark brown',
  'chestnut brown',
  'medium brown',
  'warm brown',
  'light brown',
  'auburn',
  'dark auburn',
  'rust-red',
  'red',
  'copper-red',
  'sandy',
  'dirty blonde',
  'pale blonde',
  'golden blonde',
  'dark blonde',
  'ash blonde',
  'grey-streaked dark',
  'grey-streaked brown',
  'silver-grey',
  'iron-grey',
  'white',
  'chalk-white',
];

const NPC_PHYS_HAIR_LENGTH = [
  'very short',
  'close-cropped',
  'neatly trimmed short',
  'short',
  'short and roughly cut',
  'ear-length',
  'ear-length, worn loose',
  'collar-length',
  'collar-length, tucked back',
  'shoulder-length',
  'shoulder-length, worn loose',
  'long',
  'long, worn loose',
  'long, tied back',
  'long, pulled into a knot',
  'long, in a thick braid',
  'long, in a loose braid',
  'wild and unkempt',
  'tangled and unwashed',
  'neatly combed',
];

// Special cases that replace both color + length (no color applies)
const NPC_PHYS_HAIR_BALD = [
  'a shaved head',
  'a closely shaved head',
  'a tonsured head, shaved at the crown',
  'thinning hair, barely covering the scalp',
  'a deeply receding hairline with little left on top',
  'no hair to speak of',
];

const NPC_PHYS_FACIAL_HAIR = [
  'clean-shaven',
  'clean-shaven',
  'clean-shaven',
  'a shadow of stubble',
  'several days\' worth of rough stubble',
  'heavy, dark stubble',
  'a short, neat beard',
  'a short beard, carelessly kept',
  'a full beard, neatly trimmed',
  'a full beard, loosely kept',
  'a thick, ragged beard',
  'a long beard, well-combed',
  'a long beard, loosely braided',
  'a long, forked beard',
  'a very long beard, tied with cord',
  'a thin moustache',
  'a thick, full moustache',
  'a moustache and short beard',
  'a neat goatee',
  'a scraggly goatee',
  'heavy sideburns running to the jaw',
  'mutton chops',
  'a patchy beard, unevenly grown',
  'a pointed beard, carefully shaped',
];

const NPC_PHYS_EYES = [
  'grey eyes',
  'pale grey eyes — almost silver',
  'dark grey eyes',
  'pale blue eyes',
  'bright blue eyes',
  'cold blue eyes',
  'watery blue eyes',
  'blue-grey eyes',
  'light brown eyes',
  'warm brown eyes',
  'dark brown eyes',
  'deep-set brown eyes',
  'black eyes',
  'small dark eyes',
  'large dark eyes',
  'hazel eyes',
  'green eyes',
  'pale green eyes',
  'bright green eyes',
  'amber eyes',
  'golden-brown eyes',
  'one brown eye, one grey',
  'one clouded eye — long blind',
  'deep-set eyes, colour hard to read',
  'sharp eyes that miss little',
  'tired, red-rimmed eyes',
  'eyes that seem too still',
];

const NPC_PHYS_SKIN = [
  'pale complexion',
  'fair skin with a reddish flush',
  'freckled complexion',
  'light skin, well-kept',
  'olive skin',
  'light brown skin',
  'tawny skin',
  'sun-darkened skin',
  'deeply tanned skin',
  'bronze skin',
  'dark brown skin',
  'very dark skin',
  'ruddy, weathered complexion',
  'rough, sun-cracked skin',
  'pockmarked complexion',
  'ashen complexion',
  'sallow skin',
  'skin mottled by old cold weather',
  'ink-stained hands that never quite came clean',
  'hands calloused and darkened by labour',
];

const NPC_PHYS_FACE = [
  'a square jaw',
  'a strong, prominent jaw',
  'a weak chin',
  'a long, narrow face',
  'a wide, flat face',
  'a round face',
  'high cheekbones',
  'sunken cheeks',
  'hollow cheeks',
  'a broad, flat nose',
  'a sharp, hooked nose',
  'a wide, broken nose',
  'a straight nose, well-proportioned',
  'a heavy, overhanging brow',
  'a wide forehead',
  'a narrow forehead',
  'prominent ears',
  'close-set eyes',
  'wide-set eyes',
  'deep-set eyes',
  'an unusually long neck',
  'a short, thick neck',
  'full lips',
  'thin lips pressed into a line',
  'a wide mouth that pulls easily into a grin',
  'laugh lines deeply cut around the eyes',
  'a furrowed brow seemingly fixed in a frown',
  'an angular, blade-thin face',
  'a soft, forgettable face',
  'an expressive face that hides nothing',
  'a face that gives nothing away',
];

const NPC_PHYS_SCARS = [
  'a scar running clean through one eyebrow',
  'a thick, crooked scar across the jaw',
  'an old knife wound on the cheek, badly healed',
  'a ragged scar across the bridge of the nose',
  'a scar from throat to collarbone, the edges pulled white',
  'a notch taken out of one ear',
  'the top knuckle missing from one finger',
  'missing two fingers on the left hand',
  'burn scars crawling up the back of one hand and onto the wrist',
  'pockmarks along one cheek and jaw',
  'a dent in the skull visible where the hair has thinned',
  'a healed split lip that pulls the mouth slightly crooked',
  'one eye permanently half-closed by old scar tissue',
  'brand marks on the inside of the forearm — older, faded',
  'faded lash scars across the upper back, visible at the collar',
  'a black-powder burn mark on the side of the neck',
  'knuckles broken and re-set so many times the joints are knotted',
  'old rope-burn scars around the wrist',
  'a long, straight scar down the outside of the left arm',
  'a patched eye — the socket long empty',
  'the left ear cauliflowered from old blows',
  'teeth that were clearly broken once and never set right',
];

const NPC_PHYS_QUIRKS = [
  'walks with a slight but permanent limp',
  'holds themselves very still when listening — unnervingly so',
  'keeps their eyes moving, never settling on one spot for long',
  'has a habit of cracking knuckles — usually before speaking',
  'stands with weight shifted to one leg, arms crossed',
  'carries themselves with a soldier\'s rigid posture',
  'moves with the quiet, deliberate economy of someone used to being watched',
  'stoops slightly, as though built for lower doorways',
  'has ink stains that never quite wash out of the fingers',
  'gestures broadly when speaking, as if the words need more room',
  'has a slight tremor in the left hand that they seem to have stopped noticing',
  'chews the inside of their cheek when thinking',
  'taps fingers against the thigh as if keeping count',
  'has the kind of stillness that takes practice',
  'never seems to blink quite enough',
  'rarely makes direct eye contact — not from shyness',
  'fixes you with an unblinking stare that lasts too long',
  'leans slightly to one side, an old injury still settling',
  'has a habit of touching the collar or neckline when uncertain',
  'exhales slowly through the nose before answering anything',
  'laughs with the whole body, sudden and brief',
  'speaks with their hands constantly in motion',
  'moves with a rolling, unhurried gait',
  'keeps their hands visible at all times, flat on the table or open at the sides',
  'always seems to occupy exactly the space required — no more, no less',
];

// Flat pool kept for backwards compat (also used as quick single-line fallback)
const npcAppearances = [
  'Tall and road-worn, with a soldier\'s bearing',
  'Short and stocky, calloused hands and watchful eyes',
  'Lean and quick-eyed, always half-turned toward the door',
  'Heavyset with broad shoulders and a slow, deliberate way of moving',
  'Slender and still, like someone used to being overlooked',
  'Well-dressed but wary, a prosperous look worn carefully',
  'Young-faced but with old eyes',
  'Weathered and grey, but nothing slow about them',
  'Scarred and road-worn, carrying it without complaint',
  'A hard jaw and a harder stare',
  'Quiet bearing, hands never fully still',
];

const npcGoals = [
  'Protect their homeland',
  'Seek revenge',
  'Amass wealth',
  'Discover forbidden knowledge',
  'Become famous',
  'Find true love',
];

const npcMotives = [
  'Glory',
  'Vengeance',
  'Love',
  'Fear',
  'Duty',
  'Curiosity',
];

// ── NPC Template ───────────────────────────────────────────────────────────

const npcTemplate = {
  name: null,
  alias: null,
  race: null,
  gender: null,
  socialClass: null,
  appearance: null,
  profession: null,
  skills: [],
  traits: [],
  relationToPlayer: null,
  morality: [],
  backstory: null,
  description: null,
  whereMet: null,
  friends: [],
  enemies: [],
  alive: true,
  goals: [],
  motives: [],
  conversationLog: [],
  items: [],
  flags: {
    recruitable: false,
    romanceable: false,
    canBePickpocketed: true,
    dropsLootOnDeath: true,
  },
  affiliation: null,
  reputation: null,
  secret: null,
};
