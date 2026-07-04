// npcGenerator.js
// Full NPC auto-generation engine. Loaded after playerAttributes.js and questGenerator.js.
// Exports global: NPCGenerator.generate(opts), NPCGenerator.generateTavernNPC(opts), NPCGenerator.randomName(race, gender)

const NPCGenerator = (() => {

  const pick  = a => a[Math.floor(Math.random() * a.length)];
  const pickN = (a, n) => [...a].sort(() => Math.random() - 0.5).slice(0, Math.min(n, a.length));

  // ============================================================
  // NAME POOLS
  // ============================================================
  // Human:     Blend of Germanic, Old English, and Irish phonology — not direct real-world names.
  //            Sounds: -ald, -mund, -win, -wald, -ric, -rath; Bren-, Conn-, Eod-, Falg-, Gar-
  // Elf:       Flowing, multi-syllable, soft consonants. -iel, -indor, -veth, -andel, -alin endings.
  // Dwarf:     Old Gaelic and Celtic phonology. Harder stops, -ach, -och, -al, -rath endings.
  //            Prefixes: Bro-, Caid-, Corr-, Derv-, Fearg-, Gorm-, Halv-, Keld-, Morr-, Rann-
  // Orc:       Harsh guttural stops. Short, punchy, -ak, -ul, -an, -rak patterns.
  // Halfling:  Warm rustic English-village feel. -wick, -wick, -wick compound sounds.
  // Goblin:    Short, clipped, slightly comical. Single-syllable + trailing consonant.
  // Dragonkin: Draconic scale-name convention. Sibilants, hard endings, fire-root syllables.

  const NAMES = {

    Human: {
      m: [
        'Aldrac',  'Brenwald', 'Cormeld',  'Drevald',  'Eadwyn',   'Falgard',
        'Garmund', 'Hadwyn',   'Irwald',   'Jorvald',  'Keldric',  'Lotharn',
        'Marveld', 'Nichard',  'Osrath',   'Penwald',  'Ranwulf',  'Seldrac',
        'Thalwin', 'Urveld',   'Valdric',  'Wulfend',  'Yarveld',  'Eadrath',
        'Brannoc', 'Connald',  'Dirmald',  'Ecgwald',  'Fernwald', 'Gothmund',
      ],
      f: [
        'Aelith',   'Brigeth',  'Caldith',  'Darveth',  'Edrith',   'Fenwith',
        'Garveth',  'Haldith',  'Idreth',   'Jarveth',  'Keldith',  'Lureth',
        'Marveth',  'Neldith',  'Osreth',   'Peldith',  'Raneth',   'Seldeth',
        'Thaleth',  'Urveth',   'Valdeth',  'Wulfeth',  'Yarveth',  'Brigith',
        'Caolith',  'Dermeth',  'Eithna',   'Finveth',  'Gormlith', 'Heodith',
      ],
    },

    Elf: {
      m: [
        'Aelindor',  'Caelveth',   'Celiandor', 'Daelindir', 'Elarindor',
        'Faelindor', 'Gaelindor',  'Ithrandel', 'Luindor',   'Maevindor',
        'Naerithel', 'Orindel',    'Phaelindor','Rithindel', 'Silandor',
        'Thalindor', 'Vaelindor',  'Aerilmir',  'Caladren',  'Eilandor',
      ],
      f: [
        'Aelindra',  'Caliveth',  'Celiveth',  'Eilindra',  'Galathiel',
        'Ithindra',  'Lunaveth',  'Maeliveth', 'Naelindra', 'Oriliveth',
        'Sillindra', 'Thalindra', 'Vaelindra', 'Aeriveth',  'Caladrin',
        'Faelindra', 'Galiveth',  'Lumirel',   'Naliveth',  'Silindra',
      ],
    },

    Dwarf: {
      m: [
        'Brochan',   'Caidhal',  'Corrach',  'Dervach',  'Fearghach',
        'Gormath',   'Halvach',  'Keldach',  'Lorvach',  'Morrath',
        'Nuldach',   'Orgach',   'Rannach',  'Sindach',  'Tordhal',
        'Ulvach',    'Vorrath',  'Brannoc',  'Caldach',  'Darnoch',
        'Furnach',   'Grannoch', 'Halvoch',  'Korrach',  'Lurgan',
      ],
      f: [
        'Bracha',   'Caidhla',  'Derva',   'Fearga',  'Gorva',
        'Halvra',   'Kaldra',   'Lurna',   'Morva',   'Nulva',
        'Orva',     'Ranna',    'Silda',   'Tordha',  'Ulva',
        'Vorra',    'Wulfra',   'Brenha',  'Caldha',  'Darha',
        'Furna',    'Granna',   'Halvha',  'Korra',   'Lurha',
      ],
    },

    Orc: {
      m: [
        'Borgak', 'Drakul', 'Gharuk', 'Hurkan', 'Krugar',
        'Makrul', 'Nurgak', 'Rukhak', 'Thurak', 'Ulgrak',
        'Vrakat', 'Zorgak', 'Brakan', 'Drakan', 'Gharak',
      ],
      f: [
        'Barga', 'Druka', 'Ghaka', 'Hurka', 'Kruga',
        'Marka', 'Nurga', 'Rukha', 'Thuka', 'Ulga',
        'Vraka', 'Zorka', 'Braka', 'Draka', 'Ghara',
      ],
    },

    Halfling: {
      m: [
        'Barwick', 'Coppern',  'Dorwick', 'Ferwick',  'Glenwick',
        'Hamwick', 'Jervick',  'Kesswick','Lorwick',  'Merwick',
        'Norwick', 'Padwick',  'Rolwick', 'Selwick',  'Tamwick',
      ],
      f: [
        'Besswick', 'Calwick',  'Doreth',  'Fernwick', 'Gosswick',
        'Hazelwick','Ildath',   'Jesswick','Kellwick', 'Lorwick',
        'Merrick',  'Nellwick', 'Opalwick','Petwick',  'Roswick',
      ],
    },

    Goblin: {
      m: ['Brix','Crox','Drix','Frix','Grix','Klax','Nix','Plix','Rix','Snix','Trix','Vrix','Zix','Blip','Chip'],
      f: ['Bixa','Crixa','Drixa','Frixa','Grixa','Klixa','Nixa','Plixa','Rixa','Snixa','Trixa','Vrixa','Zixa','Blipa','Chipa'],
    },

    Dragonkin: {
      m: [
        'Drakneth','Fyrathos','Gorthax', 'Ignarath','Krakneth',
        'Morvath', 'Pyrrath', 'Ragnoth', 'Scravex', 'Thornax',
        'Vadroth', 'Zyrathos','Ashdrak', 'Burneth', 'Cindrak',
      ],
      f: [
        'Fyrina',  'Gortha',  'Ignara',  'Kraknith','Morvia',
        'Pyrria',  'Ragnia',  'Scraveth','Thornith', 'Vadria',
        'Zyria',   'Ashna',   'Burna',   'Cindria',  'Embria',
      ],
    },

  };

  // ============================================================
  // RACE WEIGHTS
  // ============================================================
  // Humans are most common; rarer races appear occasionally.
  const RACE_TABLE = [
    ...Array(8).fill('Human'),
    ...Array(3).fill('Elf'),
    ...Array(3).fill('Dwarf'),
    ...Array(2).fill('Halfling'),
    'Orc', 'Goblin', 'Dragonkin',
  ];

  // ============================================================
  // APPEARANCE POOLS (per race)
  // ============================================================
  const APPEARANCES = {
    Human: [
      'Broad-shouldered with a weather-beaten face',
      'Wiry and sharp-eyed with close-cropped hair',
      'Stocky and strong, with calloused hands',
      'Lean and quick, with restless eyes',
      'Heavyset with a broad, honest face',
      'Tall and angular with a soldier\'s bearing',
      'Of middling height, forgettably plain',
      'Well-fed and expensively dressed',
      'Scarred and road-worn, missing a finger',
      'Young-faced but with old eyes',
      'A hard jaw and a harder stare',
      'Quiet bearing, hands never fully still',
    ],
    Elf: [
      'Impossibly graceful, with silver-white hair',
      'Tall and slender, eyes like pale winter ice',
      'Ageless features, hair the colour of autumn leaves',
      'Wispy and ethereal, almost too still',
      'Dark-skinned and luminous, with golden eyes',
      'Lean as a whip, moving with liquid grace',
      'Old even by elven reckoning, but unmarked by it',
    ],
    Dwarf: [
      'Barrel-chested with an impressive braided beard',
      'Short and broad, arms like oak roots',
      'Compact and powerful, with steady hands',
      'Weathered and grey-bearded, eyes like flint',
      'Wide-set eyes and a jaw that could crack stone',
      'Stocky as a boulder, with ruddy, weathered skin',
    ],
    Orc: [
      'Massive, with grey-green skin and prominent tusks',
      'Hulking shoulders and a deeply scarred brow',
      'Lean for an orc, but no less dangerous-looking',
      'Imposing, with deep-set amber eyes',
      'Covered in faded tribal markings, jaw like an anvil',
    ],
    Halfling: [
      'Small and bright-eyed with curly hair',
      'Round-cheeked and cheerful, always smiling',
      'Nimble and neat, barely reaching your shoulder',
      'Plump and rosy, with an infectious laugh',
      'Wiry and light-footed, perpetually curious',
    ],
    Goblin: [
      'Slight and skittish with enormous yellow eyes',
      'Thin as a reed, teeth too big for the mouth',
      'Nervous energy, glancing at everything twice',
      'Small and wiry, scars on both knees',
    ],
    Dragonkin: [
      'Scaled in deep crimson, with vertical slit pupils',
      'Bronze-scaled and imposing, a head taller than most',
      'Lithe, with iridescent blue-green scales',
      'Old and scarred, scales faded to ash-grey',
      'Young, with bright copper scales still unmarred',
    ],
  };

  // ============================================================
  // PROFESSION POOLS
  // ============================================================
  const PROFESSIONS_BY_CLASS = {
    Royalty: [
      'King','Queen','Prince','Princess','Emperor','Empress',
      'Crown Prince','Crown Princess','Regent','Royal Heir',
    ],
    Noble: [
      'Advisor','Ambassador','Baron','Baroness','Castellan','Chamberlain','Chancellor',
      'Chief','Chieftain','Count','Countess','Diplomat','Duchess','Duke','Elder',
      'Handmaiden','Herald','Lady','Lord','Noble','Page','Reeve','Spymaster',
      'Steward','Thane','Treasurer',
    ],
    Military: [
      'Archer','Armorer','Bounty Hunter','Captain','Constable','Executioner',
      'Gatekeeper','Guard','Knight','Knight Errant','Marshal','Mercenary',
      'Night Watchman','Pathfinder','Pikeman','Ranger','Scout','Sellsword',
      'Sentinel','Shield Maiden','Siege Engineer','Soldier','Spearman','Squire',
      'Swordsman','Tracker','Warden','Watchman',
    ],
    Peasant: [
      'Baker','Barber','Butcher','Candle Maker','Chandler','Cobbler','Commoner',
      'Cooper','Farmer','Fisherman','Gravedigger','Horse Breeder','Hunter',
      'Kitchen Hand','Labourer','Miller','Miner','Rat Catcher','Shepherd',
      'Stable Hand','Trapper','Woodcutter','Woodsman',
    ],
    Artisan: [
      'Antiquarian','Architect','Blacksmith','Bowyer','Brewer','Carpenter',
      'Cartwright','Cloth Merchant','Falconer','Fletcher','Gem Cutter','Glassblower',
      'Heraldic Artist','Innkeeper','Jeweller','Leatherworker','Mapmaker','Mask Maker',
      'Mason','Merchant','Painter','Papermaker','Potter','Saddler','Sailmaker',
      'Sculptor','Silversmith','Smith','Spice Trader','Swordsmith','Tailor','Tanner',
      'Tavern Keeper','Trader','Weaver',
    ],
    Outcast: [
      'Assassin','Bandit','Beggar','Dungeon Delver','Exile','Fence','Fugitive',
      'Pilgrim','Pirate','Rogue','Sailor','Spy','Wanderer',
    ],
    'Performance Arts': [
      'Bard','Jester','Minstrel','Performer','Poet','Storyteller','Thespian','Troubadour',
    ],
    Scholar: [
      'Apothecary','Archivist','Astrologer','Book Keeper','Calligrapher','Cartographer',
      'Court Advisor','Healer','Herbalist','Historian','Investigator','Librarian',
      'Loremaster','Midwife','Navigator','Philosopher','Sage','Scholar','Scribe',
    ],
    Arcane: [
      'Alchemist','Cleric','Court Mage','Dragonologist','Druid','Enchanter','Mage',
      'Mystic','Oracle','Priest','Rune Crafter','Scholar of the Arcane','Soothsayer',
      'Sorcerer','Sorceress','Witch','Wizard',
    ],
  };

  // Professions plausibly found drinking in a tavern
  const TAVERN_PROFESSIONS = [
    'Wanderer','Mercenary','Trader','Hunter','Soldier','Sailor','Ranger',
    'Bard','Gambler','Farmer','Guard','Tinker','Pilgrim','Adventurer',
    'Sellsword','Bounty Hunter','Minstrel','Barbarian','Explorer','Scout',
    'Tracker','Knight Errant','Pirate','Performer','Storyteller',
  ];

  // ============================================================
  // MORALITY SPECTRUM
  // ============================================================
  // Weighted toward Neutral; extremes are rarer.
  const MORALITY_SPECTRUM = ['Malicious','Malevolent','Neutral','Neutral','Neutral','Valiant','Heroic'];

  // ============================================================
  // GOALS & MOTIVES
  // ============================================================
  const NPC_GOALS = [
    'Protect their homeland',        'Seek revenge on an old enemy',
    'Amass enough wealth to retire', 'Discover forbidden knowledge',
    'Become known across the realm', 'Find a missing family member',
    'Repay a debt before they die',  'Survive the coming winter',
    'Earn their freedom',            'See the world before age takes them',
    'Build something that lasts',    'Prove themselves to a mentor',
    'Escape a troubled past',        'Find a cure for someone they love',
    'Reclaim something that was stolen from them',
  ];

  const NPC_MOTIVES = [
    'Glory','Vengeance','Love','Fear','Duty','Curiosity',
    'Survival','Greed','Justice','Redemption','Pride','Loyalty',
    'Desperation','Ambition','Regret',
  ];

  // ============================================================
  // AFFILIATIONS
  // ============================================================
  const AFFILIATIONS = [
    'The Thieves\' Guild',       'The Merchant\'s Council',
    'The Temple of Light',       'The Crimson Court',
    'The Wanderers\' Brotherhood','The Alchemists\' Circle',
    'The Iron Watch',            'The Order of the Silver Flame',
    'The Black Market',          'The Scholars\' Archive',
    'The Harbour Guild',         'A local noble house',
  ];

  // ============================================================
  // REPUTATION
  // ============================================================
  const REPUTATIONS = ['Unknown','Unknown','Unknown','Known','Notable','Infamous','Famous'];

  // ============================================================
  // SECRETS
  // ============================================================
  const SECRETS = [
    'Carries a stolen gem hidden in their boot.',
    'Is a spy for a rival faction.',
    'Has a bounty on their head in another kingdom.',
    'Their name is assumed — the real one died years ago.',
    'Knows where a significant treasure is buried.',
    'Is being blackmailed by someone in this very settlement.',
    'Murdered someone and has never spoken of it.',
    'Was once a member of a religious order they fled.',
    'Has children elsewhere who do not know they are alive.',
    'Owes a significant debt to a very dangerous person.',
    'Is dying slowly from an incurable affliction.',
    'Serves a patron whose identity they fiercely guard.',
    'Has a second family in another city.',
    'Was present at an event that changed the region\'s history.',
    'Stole something sacred from a place they once called home.',
  ];

  // ============================================================
  // ALIASES (flavour nicknames, rarely assigned)
  // ============================================================
  const ALIASES = [
    '"The Fox"',    '"The Quiet"',    '"Old One"',     '"Twice-Scarred"',
    '"Farwalker"',  '"The Grey"',     '"Ironhand"',    '"The Pale"',
    '"Three-Coin"', '"Saltwater"',    '"Ashback"',     '"No-Name"',
  ];

  // ============================================================
  // BACKSTORY FRAGMENTS (per profession)
  // ============================================================
  const BACKSTORY_BY_PROFESSION = {
    // — Original entries —
    Farmer:       ['has worked the land for as long as they can remember',
                   'inherited their farm from a distant relative and never left',
                   'fled their village after a bad harvest and hasn\'t looked back'],
    Wanderer:     ['left home years ago and hasn\'t stopped moving since',
                   'was exiled and found a strange freedom in the open road',
                   'walks to outrun an old grief that still keeps pace'],
    Mercenary:    ['has fought in three wars and prefers not to count them',
                   'took up the sword when honest work dried up',
                   'built a reputation blade by blade across four kingdoms'],
    Trader:       ['has dealt in goods since they were old enough to carry them',
                   'travels the merchant routes twice a year without fail',
                   'once lost everything in a bad deal and clawed every coin back'],
    Priest:       ['was called to serve from a young age and never questioned it',
                   'found faith in the darkest moment of their life',
                   'questions their devotion more each year but continues to serve'],
    Thief:        ['learned to take before they learned to ask',
                   'fell in with the wrong crowd and never quite found the way out',
                   'steals only from those who have too much — or so they say'],
    Scholar:      ['has spent most of their life in libraries and misses them',
                   'once discovered something they were told to forget',
                   'teaches in exchange for passage between towns'],
    Guard:        ['has kept watch over too many walls to count them all',
                   'joined the watch to put food on the table and stayed out of habit',
                   'was passed over for promotion one too many times'],
    Hunter:       ['knows these forests better than most know their own homes',
                   'tracks for coin and forgets the quarry by morning',
                   'prefers the company of the wild to that of people'],
    Innkeeper:    ['has listened to a thousand stories and shared none of their own',
                   'inherited the inn unexpectedly and made it their whole life',
                   'knows every face that passes through and remembers the ones who don\'t return'],
    Sailor:       ['has seen more coastlines than most see in a lifetime of dreams',
                   'lost their ship and with it their fortune and their purpose',
                   'is waiting for the next tide and the right offer'],
    Bard:         ['trades in stories as much as songs',
                   'has been thrown out of finer establishments than this one',
                   'remembers every rumour and sells them to the right ears'],
    Beggar:       ['was not always this low, though it has been many years',
                   'sees more from the gutter than others do from towers',
                   'survives by learning what people throw away'],
    Knight:       ['served a lord whose name they no longer speak aloud',
                   'earned their rank through blood and holds it through reputation',
                   'believes in their oath more than the one who gave it to them'],
    Alchemist:    ['has blown up two workshops and learned something from each',
                   'seeks a formula that has eluded every predecessor',
                   'trades in useful things and dangerous things alike'],
    Soldier:      ['served in a campaign that ended badly and rarely speaks of it',
                   'was honourably discharged and has been searching for purpose since',
                   'knows a hundred ways to fight and no good reason to stop'],
    Pilgrim:      ['walks a road of devotion that has no clear end',
                   'made a vow they intend to honour even if it kills them',
                   'is searching for a shrine their grandmother described on her deathbed'],
    Tinker:       ['repairs what others throw away and sells it back to them',
                   'travels from town to town with a cart full of useful oddities',
                   'knows a trick for fixing almost anything except their own past'],
    Gambler:      ['has won more than they\'ve lost — at least, that\'s the story',
                   'owes enough people enough money that they keep moving',
                   'reads people the way scholars read books, and bets accordingly'],
    // — New entries —
    Adventurer:   ['has made a career of walking into places sensible people avoid',
                   'chases coin and glory in equal measure and finds neither satisfying',
                   'has survived enough close calls to believe luck is a skill'],
    Advisor:      ['has whispered counsel into powerful ears for longer than most',
                   'knows secrets that would topple crowns and keeps them carefully',
                   'was once the power behind a throne that no longer stands'],
    'Animal Trainer': ['has a way with beasts that most people can\'t explain',
                   'raised their first animal companion before they could speak clearly',
                   'prefers the honesty of animals to the games of people'],
    Antiquarian:  ['has filled three rooms with relics and still has no idea what half of them do',
                   'chases the past across the continent, one crumbling artefact at a time',
                   'once sold a fake relic and has never quite forgiven themselves'],
    Archer:       ['can split a coin at a hundred paces and rarely misses at two hundred',
                   'trained under a bowmaster whose name is legend in three kingdoms',
                   'prefers distance — in combat, and in life'],
    Architect:    ['has designed halls that will outlast kingdoms and knows it',
                   'carries rolled plans everywhere and sketches in margins on instinct',
                   'was once hired to build a prison and ended up imprisoned in it'],
    Artist:       ['finds beauty in places others walk past without a second glance',
                   'has filled a hundred pages and sold perhaps a dozen',
                   'creates because the alternative is silence'],
    Astrologer:   ['reads the stars the way others read faces — for what isn\'t said',
                   'predicted three disasters and was believed only after the third',
                   'hasn\'t slept well since the night a constellation moved'],
    Bailiff:      ['keeps order in estates that don\'t want to be kept in order',
                   'has collected rent from people who couldn\'t pay and carries the weight of it',
                   'serves their lord faithfully and hopes the lord deserves it'],
    Baker:        ['has been up before dawn every morning for twenty years and wouldn\'t change it',
                   'learned the trade from a parent who learned it from theirs',
                   'takes quiet pride in work that disappears by midday'],
    Bandit:       ['chose this life when the law chose others over them',
                   'leads a small crew with a loose code they mostly follow',
                   'is one good offer away from going straight, or so they claim'],
    Barbarian:    ['comes from a people who measure worth in scars and victories',
                   'left their homeland to find what the wider world was worth',
                   'is louder, stronger, and more honourable than most civilised folk they\'ve met'],
    Barber:       ['knows more about the town\'s business than any spy — people talk while they sit',
                   'removes hair, pulls teeth, and once set a broken arm in a pinch',
                   'has more gossip than the tavern and keeps it sharper'],
    Baron:        ['holds their title by inheritance and their land by stubbornness',
                   'is liked less by the nobility than by the farmers who work their fields',
                   'worries more about the harvest than the court'],
    Baroness:     ['rules her estate with a calm precision her husband never managed',
                   'inherited nothing and built everything through careful alliance',
                   'is underestimated by rivals who haven\'t yet learned their lesson'],
    Blacksmith:   ['has shaped more iron than most people have seen in a lifetime',
                   'learned the forge from an old master who never praised work and never needed to',
                   'takes custom commissions but has a waiting list three seasons long'],
    'Book Keeper':['tracks numbers with the same focus a hunter tracks prey',
                   'once caught an embezzler that three investigators missed',
                   'knows where every coin in the organisation has gone, and where it went before that'],
    'Bounty Hunter': ['hunts people for coin and tries not to ask what they did',
                   'has brought in more quarry alive than dead and considers it a matter of pride',
                   'was once the hunted and hasn\'t forgotten how it felt'],
    Bowyer:       ['crafts bows with the patience of someone who understands what depends on them',
                   'has tested every bow they\'ve ever made — they trust no other proof',
                   'supplies archers across three kingdoms and knows them each by name'],
    Brewer:       ['has been perfecting the same recipe for fifteen years and still isn\'t satisfied',
                   'inherited a crumbling brewery and turned it into something worth inheriting',
                   'believes a good ale solves half of life\'s problems and the other half can wait'],
    Butcher:      ['works before dawn and cleans up after dark and takes no pleasure in between',
                   'knows every part of every beast and wastes none of it',
                   'has a gentler manner than the work suggests'],
    Calligrapher: ['writes with a precision that borders on ceremony',
                   'has copied royal decrees, love letters, and death warrants with the same hand',
                   'cares deeply about how words look and somewhat less about what they mean'],
    'Candle Maker': ['keeps the dark at bay for people who can\'t do it themselves',
                   'has burned through more wax than most people have seen',
                   'supplies temples, scholars, and the occasional midnight conspirator'],
    Captain:      ['has commanded troops that believed in them, and some that didn\'t',
                   'leads from the front and has the scars to show it',
                   'expects more from the people under their command than they expect from themselves'],
    Carpenter:    ['measures twice, cuts once, and rarely needs a third attempt',
                   'can look at a pile of lumber and already see what it wants to become',
                   'builds things to last because the ones that don\'t haunt them'],
    Cartographer: ['has mapped territories no one else bothered to record',
                   'argues that the map is never the territory — but it\'s the closest most people get',
                   'once got lost while mapping a forest and considers it professionally embarrassing'],
    Cartwright:   ['makes wagons that survive roads that would destroy any other',
                   'is the most important tradesperson in any town that moves goods and knows it',
                   'has a workshop full of half-finished vehicles and one perfect idea'],
    Castellan:    ['has managed this fortress through three lords and expects to outlast a fourth',
                   'knows every creak and weak spot of the keep and keeps the knowledge private',
                   'runs the castle like a small kingdom and is often more powerful than the noble who owns it'],
    Chamberlain:  ['schedules the lord\'s life down to the quarter-hour and keeps it on track',
                   'has navigated court politics for so long that deception feels like courtesy',
                   'is the invisible hand behind most of what happens in this household'],
    Chancellor:   ['holds the authority of the realm\'s administration and uses it carefully',
                   'has served three rulers and outlasted each one\'s favourites',
                   'is the second most powerful person in the kingdom and does most of the work'],
    Chandler:     ['supplies candles and lamp oil to half the settlement',
                   'knows the buying habits of every household and can read a winter\'s severity by demand',
                   'works with wax, tallow, and patience in roughly equal measure'],
    Chef:         ['creates food that people remember long after the meal is finished',
                   'was trained in a noble kitchen and refuses to waste that on lesser ingredients',
                   'has opinions about cooking that most would describe as convictions'],
    Chief:        ['leads through respect earned over years, not title inherited at birth',
                   'makes decisions alone but never without listening first',
                   'carries the weight of their people like a second skin'],
    Chieftain:    ['rules by strength, wisdom, and the balance between the two',
                   'has seen enough war to hate it and enough threat to court it',
                   'would trade half the power for half the responsibility'],
    Cleric:       ['serves their deity with steady faith and practical compassion',
                   'tends to the sick, the dying, and the guilty without distinguishing between them',
                   'prays every morning and acts every afternoon'],
    Cobbler:      ['has put shoes on half the town and knows every foot by name',
                   'inherited the last and the craft from someone who never wasted a word',
                   'makes footwear that lasts because there\'s no shame in something built to wear'],
    Commoner:     ['works hard, sleeps little, and is suspicious of anyone who doesn\'t',
                   'has never left the region and isn\'t sure what the fuss is about elsewhere',
                   'knows everyone in the village and everyone\'s business whether they want to or not'],
    Constable:    ['keeps order in a place that doesn\'t always want to be kept',
                   'knows the law well enough to use it and well enough to bend it when needed',
                   'has been threatened enough times that the threats stopped meaning anything'],
    Cooper:       ['makes barrels the way other people breathe — without thinking, but not without care',
                   'supplies the brewer, the baker, and the merchant and is friends with all three',
                   'took up the trade because every other craft was already taken in the family'],
    Councilor:    ['debates policy all morning and implements it all afternoon',
                   'has voted on things they disagreed with and things they believed in and can\'t always tell the difference',
                   'is trusted by some, resented by others, and noticed by everyone'],
    Count:        ['inherited a title large enough to be important and small enough to be ignored by the king',
                   'governs a substantial territory with competence and occasional cruelty',
                   'entertains ambassadors and fears the harvest in equal measure'],
    Countess:     ['manages the estate while the count manages appearances',
                   'is better at politics than she lets on and better at swordsmanship than anyone expects',
                   'has navigated a court that underestimated her for the last time'],
    Courier:      ['has ridden roads in every weather and remembers every one of them',
                   'carries messages that change fates and tries not to know what\'s in them',
                   'trusts horses more than people and roads more than either'],
    'Court Mage': ['serves the crown\'s arcane needs with careful loyalty and private ambition',
                   'knows three ways to interpret every magical problem and chooses the safest',
                   'has warned the ruler of dangers they chose to ignore'],
    Craftsman:    ['takes pride in the quality of their work and little else',
                   'learned everything from watching and refuses to believe that\'s unusual',
                   'has made things no one else has bothered to make and a few things no one wanted'],
    Diplomat:     ['chooses words the way an archer chooses arrows — each one placed',
                   'has negotiated peace between parties who wanted war and found them both dissatisfied',
                   'smiles at people they dislike and means both the smile and the dislike'],
    Dragonologist:['has devoted a life to creatures most people spend their lives avoiding',
                   'knows more about draconic behaviour than any living person — and less than they need to',
                   'carries scars from their research and considers them the most honest credential'],
    Druid:        ['serves the balance of the natural world before any kingdom or crown',
                   'speaks to things older than the settlement that surrounds them',
                   'has walked this forest for decades and is still learning it'],
    Duchess:      ['commands a territory large enough to be a kingdom in anything but name',
                   'has more power than most nobles admit and uses it with precision',
                   'entertains enemies with the same grace as allies and knows the difference'],
    Duke:         ['rules his duchy with an eye on the capital and a hand on his sword hilt',
                   'has survived court intrigue long enough to stop calling it intrigue',
                   'is generous to those who deserve it and patient with those who don\'t'],
    'Dungeon Delver': ['makes a living descending into places other people seal and walk away from',
                   'has a methodology for ruins that borders on superstition and has kept them alive',
                   'knows the difference between a trap and a test and usually guesses right'],
    Elder:        ['has seen enough to stop being surprised and hasn\'t stopped being disappointed',
                   'carries the memory of the community and the weight of its past decisions',
                   'gives counsel to those who ask and sometimes to those who don\'t'],
    Enchanter:    ['makes objects do things they have no business doing',
                   'has enchanted weapons for kings and candles for farmers and charges differently for each',
                   'is running low on a reagent they\'ve been trying to find for three years'],
    Executioner:  ['does what others won\'t and lives with what that means',
                   'is precise, professional, and does not discuss work after hours',
                   'has carried out sentences they believed were unjust and carries that still'],
    Explorer:     ['charts the unknown for whoever pays and occasionally for the joy of it',
                   'has survived deserts, blizzards, and creatures that aren\'t on any map',
                   'is always planning the next expedition before the current one is finished'],
    Falconer:     ['reads the sky through the eyes of a bird and finds it clarifying',
                   'has trained birds of prey since they were old enough to hold one',
                   'speaks to their birds in a way that suggests a long conversation between equals'],
    Fence:        ['moves things between people who can\'t be seen together',
                   'knows the value of stolen goods down to the last coin and never gives full value',
                   'has a network of contacts and a plausible story for each of them'],
    Fisherman:    ['has pulled a living from these waters for every year they can remember',
                   'reads weather better than any astronomer and trusts it more',
                   'is one bad season away from disaster and has been for most of their life'],
    Fletcher:     ['crafts arrows with the patience of someone who understands what rides on each one',
                   'has supplied armies and hunting parties and considers the work equally important',
                   'knows more about feathers than most people know about the birds they came from'],
    Forager:      ['finds food in places others see only wilderness',
                   'knows which plants feed and which kill and never confuses the two',
                   'has kept themselves alive in more difficult circumstances than they admit to'],
    Forester:     ['manages the woodland for those who own it and the creatures who inhabit it',
                   'knows every trail in their territory and can read who walked it recently',
                   'is caught between the needs of timber and the life of the forest'],
    Gardener:     ['tends living things with the kind of attention most reserve for people',
                   'knows what each plant needs and when it needs it and rarely asks for much in return',
                   'has grown things others said couldn\'t be grown here'],
    Gatekeeper:   ['has watched who comes and who goes for long enough to know which difference matters',
                   'takes the responsibility seriously in a way that surprises people who expected less',
                   'has turned away people they shouldn\'t have and let through people they regret'],
    'Gem Cutter': ['sees the finished stone inside the raw ore and removes everything that isn\'t it',
                   'has cut gems for nobility and merchants and treats the stone the same regardless',
                   'is meticulous to the point of maddening and wouldn\'t change a thing'],
    Glassblower:  ['shapes molten material into things of beauty and utility with a single breath',
                   'learned the craft from a master who believed perfection was achievable and died trying',
                   'can make a window, a vial, or a decorative piece with equal pride'],
    Gravedigger:  ['does work that must be done and is rarely thanked for it',
                   'knows more about the town\'s history than the historians do — it\'s all in the names',
                   'has buried friends and enemies with the same care and considers that the measure of the work'],
    Handmaiden:   ['attends to a noble with a discretion that borders on invisibility',
                   'knows the household\'s secrets because no one thinks of her when they speak',
                   'is loyal to the person she serves and not the person that person pretends to be'],
    Healer:       ['treats wounds and illness without distinguishing between those who can pay and those who can\'t',
                   'has seen enough suffering to become numb to it and refuses to',
                   'keeps knowledge of remedies that some authorities would prefer remained forgotten'],
    Herald:       ['delivers official proclamations with dignity regardless of their content',
                   'has announced coronations and executions with the same formal cadence',
                   'knows protocol so thoroughly that breaking it feels like a physical thing'],
    'Heraldic Artist': ['designs coats of arms that must capture family legacies in simple shapes',
                   'has argued with three nobles about what their sigil means and been right each time',
                   'sees heraldry as both art and law and takes both seriously'],
    Herbalist:    ['has more knowledge of plants than most healers and more practical skill than most scholars',
                   'was taught by someone who was taught by someone in an unbroken chain of knowledge',
                   'makes remedies that work and sometimes can\'t explain why'],
    Historian:    ['has spent a career proving that the past was nothing like people think',
                   'knows which records were forged and by whom — a dangerous kind of knowledge',
                   'is writing a comprehensive account that will probably outlast the events it describes'],
    'Horse Breeder': ['has raised animals that have carried kings and farmers alike without preference',
                   'reads the potential in a foal the way others read character in a face',
                   'is more patient with horses than with most people and considers it a compliment to both'],
    Investigator: ['asks the questions that everyone else is too polite or too afraid to ask',
                   'has solved cases that other investigators declared unsolvable',
                   'trusts evidence over testimony and testimony over nothing'],
    Jailer:       ['keeps people in places they don\'t want to be and mostly manages to feel neutral about it',
                   'has heard every story from every cell and is rarely surprised anymore',
                   'maintains order with an authority that doesn\'t need to be stated'],
    Jeweller:     ['creates beautiful objects for people who want to demonstrate they can afford them',
                   'has an eye for flaws that most would overlook and a policy against overlooking them',
                   'knows the stones better than the people who commission them and values them accordingly'],
    'Kitchen Hand': ['works in the back where no one looks and everything depends on what\'s done right',
                   'has learned from watching better cooks what good food requires',
                   'is not ambitious — is simply good at what they do and comfortable with that'],
    'Knight Errant': ['wanders without a lord to serve, which some see as freedom and some as failure',
                   'takes quests as they come and measures worth by the outcome',
                   'follows a code they wrote for themselves and holds to it harder than most hold to law'],
    Leatherworker:['turns hides into goods with a craft that smells worse than it looks',
                   'works with a variety of materials and a very specific idea of quality',
                   'has made armour, bags, belts, and a few things people don\'t advertise'],
    Librarian:    ['knows where everything is and expects everyone else to put it back',
                   'has read more than anyone in the settlement and discusses it less',
                   'considers a damaged book a personal offence and acts accordingly'],
    Loremaster:   ['carries knowledge that civilisations have lost and finds new things to add',
                   'has students who are now teaching students of their own',
                   'is consulted on things that no written record covers and usually has an answer'],
    Mage:         ['wields power that most people don\'t understand and some fear',
                   'spent years studying before they could do anything useful with it',
                   'has opinions about correct magical practice that not everyone shares'],
    Mapmaker:     ['renders the world into something that fits on a page and accepts the imprecision',
                   'has mapped regions others refused to enter and considers that a professional advantage',
                   'argues with other mapmakers about coastlines and considers it important'],
    Marshal:      ['coordinates forces that could level a small town and ensures they don\'t',
                   'has planned more campaigns than they\'ve led and led more than they\'d like',
                   'believes in logistics the way others believe in destiny'],
    'Mask Maker': ['crafts faces for those who need to be someone else for an evening',
                   'supplies festivals, theatres, and people who don\'t explain their purposes',
                   'finds meaning in the way a mask changes not just how someone looks but how they move'],
    Mason:        ['has built walls, towers, and bridges that outlast the people who ordered them',
                   'works slowly because the stone is patient and the work deserves the same',
                   'takes a quiet pride in foundations nobody sees'],
    Midwife:      ['has brought more lives into the world than they can count and remembers many of them',
                   'works in the most consequential moments of people\'s lives and carries that seriously',
                   'knows the bodies and the fears of half the women in the settlement'],
    Miller:       ['turns grain into something useful and charges fairly for doing so',
                   'has operated the mill through drought, flood, and siege',
                   'knows the harvest numbers before the farmers do and plans accordingly'],
    Miner:        ['has worked in the dark long enough to stop noticing it',
                   'knows the sound of a safe rock from an unsafe one and trusts no one else\'s judgment on it',
                   'has seen things underground that they don\'t repeat above ground'],
    Minstrel:     ['has played in taverns, courts, and somewhere in between for longer than they can recall',
                   'carries songs from places they\'ve been to places that have never heard of them',
                   'knows what an audience wants before the audience does'],
    Mystic:       ['reads signs that others walk past and builds meaning from the patterns',
                   'has given counsel that proved accurate often enough to make them uneasy about what it means',
                   'lives at the edge of what can be explained and finds it comfortable'],
    Navigator:    ['has guided ships through conditions that should have killed everyone aboard',
                   'reads stars, currents, and wind with equal fluency',
                   'knows the sea in every season and respects it in all of them'],
    'Night Watchman': ['patrols when the honest are asleep and sees what they never will',
                   'has learned to trust instinct over procedure in the dark hours',
                   'keeps this settlement safer than it knows'],
    Noble:        ['was born to a position they did nothing to earn and have mixed feelings about',
                   'navigates court with the easy confidence of someone who has never had to earn the right to be in a room',
                   'is more thoughtful about their privilege than most and does less with that reflection than they should'],
    Oracle:       ['speaks truth in forms that only make sense after the fact',
                   'was granted sight they didn\'t ask for and hasn\'t found a way to give it back',
                   'knows things that haven\'t happened yet and is careful about which ones they share'],
    Page:         ['serves a knight or noble with a thoroughness that belies their age',
                   'watches and learns and waits for the day it becomes something',
                   'runs errands that carry more weight than anyone admits to them'],
    Painter:      ['captures moments that have already passed in ways that make them last longer',
                   'is commissioned by people who want to be remembered and paints what they actually see',
                   'has a studio full of half-finished work and one complete masterpiece they won\'t sell'],
    Papermaker:   ['turns plant fibre into the surface that holds knowledge',
                   'supplies scholars, scribes, and merchants without any of them thinking about where it comes from',
                   'takes pride in a smooth page in a way that seems disproportionate until you see what gets written on it'],
    Pathfinder:   ['finds routes through terrain that other people declare impassable',
                   'has been hired to lead expeditions into places no map covers',
                   'trusts their instincts over any instrument and has never been seriously wrong'],
    Performer:    ['gives people something to feel for an evening and considers it worthwhile work',
                   'has performed for audiences of three and audiences of three thousand and prefers somewhere in between',
                   'remembers every role they\'ve played and is still figuring out which one is really them'],
    Philosopher:  ['asks questions that others consider settled and refuses to accept the answers',
                   'is either very wise or very irritating depending on who you ask',
                   'has written texts that outlived every critic they had'],
    Pikeman:      ['stands in formation and trusts the person beside them in a way that most people never experience',
                   'has held a line that others wanted to break and learned what that means',
                   'is precise, disciplined, and occasionally bored'],
    Pirate:       ['takes what\'s not theirs and occasionally gives something back',
                   'has sailed under three flags and currently flies a fourth that isn\'t on any official list',
                   'operates by a personal code that most would describe as selective'],
    Potter:       ['shapes clay into vessels that hold food, water, and sometimes secrets',
                   'has made thousands of pots and still remembers the first one that didn\'t crack',
                   'works with earth and fire and patience and finds it deeply satisfying'],
    Prospector:   ['follows mineral signs into places other people consider too dangerous to be worth it',
                   'has struck rich twice, been ruined twice, and is optimistic about a third chance',
                   'trusts their own judgment about rock and rarely trusts anyone else\'s about anything'],
    Ranger:       ['patrols borders that kingdoms draw on maps but that nature doesn\'t respect',
                   'has been living in the wild long enough to feel uncomfortable indoors',
                   'protects people who don\'t know they need protecting and does it without acknowledgement'],
    'Rat Catcher':['does work the city depends on and the city would prefer not to think about',
                   'knows the layout of sewers, cellars, and hidden passages better than most guards',
                   'has a professional relationship with vermin that borders on philosophical'],
    Reeve:        ['manages the lord\'s land affairs with the lords largely out of the picture',
                   'collects what is owed and mediates what isn\'t settled and nobody is entirely happy about either',
                   'is the most powerful commoner in the district and knows it'],
    Regent:       ['holds power in the name of another and finds it a complicated position',
                   'makes decisions they don\'t have the authority to be blamed for',
                   'keeps the throne warm and the kingdom stable and gets credit for neither'],
    'Relic Hunter':['trades in the genuine article and occasionally the convincing substitute',
                   'has recovered artefacts from places that tried to keep them',
                   'knows what a thing is worth to collectors and twice that to the right person'],
    'Royal Mage': ['serves the crown with power that any ambitious person would fear',
                   'has influenced more events than the official histories record',
                   'advises on magical matters and is sometimes the only one in the room who understands them'],
    'Rune Crafter':['inscribes meaning into material in ways that outlast intention',
                   'knows old runes that few bother to learn and some that fewer should',
                   'is meticulous — one wrong stroke means starting again from the beginning'],
    Saddler:      ['makes equipment that keeps rider and horse together and knows lives depend on it',
                   'has outfitted cavalry, couriers, and travellers without ever seeing where they went',
                   'takes custom commissions seriously because every commission is also a character study'],
    Sage:         ['has forgotten more than most people will learn and is aware of the irony',
                   'is consulted on matters ranging from history to magic to etiquette',
                   'lives frugally, thinks extensively, and considers both choices deliberate'],
    Sailmaker:    ['sews cloth that carries ships through storms and knows what that means',
                   'supplies vessels whose names they never learn and whose voyages they\'ll never see',
                   'takes pride in a sail that never tears the way a smith takes pride in a blade that never breaks'],
    'Scholar of the Arcane': ['studies magic as a discipline and finds most practitioners sloppy',
                   'knows the theoretical foundations of spells that most mages cast by instinct',
                   'has written extensively on magical history and is read by people who disagree with them'],
    Scout:        ['gathers information that others act on and rarely gets credit for either outcome',
                   'has moved through enemy territory more times than they care to number',
                   'trusts observation over assumption and waits until they\'re sure'],
    Sculptor:     ['removes everything that isn\'t the form they\'re after',
                   'has created monuments that people gather around and altarpieces that make them quiet',
                   'works slowly and refuses to apologise for it'],
    Sellsword:    ['rents their blade to whoever is paying and asks no questions that change the answer',
                   'has fought on both sides of the same conflict within a year and considers it professional',
                   'is good at what they do and has stopped thinking about what that says about them'],
    Sentinel:     ['holds the same post with the same attention every shift and has never stopped',
                   'is alert in a way that seems unnecessary until the night it isn\'t',
                   'takes their duty seriously in a way that others find either admirable or exhausting'],
    Shepherd:     ['knows their flock the way other people know their family',
                   'has spent long seasons in silence and found it comfortable',
                   'walks the same hills often enough to notice when something changes'],
    'Shield Maiden':['earned their role through skill that was tested before it was recognised',
                   'serves with a discipline that has closed the mouths of more than one doubter',
                   'fights alongside those who have proven themselves and holds the same standard for herself'],
    Shipwright:   ['builds vessels that carry hundreds of lives on seas that don\'t care',
                   'knows wood, water, and the forces between them with an expert\'s intimacy',
                   'has designed ships that are still sailing decades after they were built'],
    'Siege Engineer': ['designs siege weapons with the creative focus others bring to art',
                   'has breached walls that their employers said couldn\'t be breached',
                   'dislikes war and is very good at the part of it they specialise in'],
    'Siege Operator': ['operates heavy machinery under conditions that test every nerve',
                   'has worked siege engines in three campaigns and understood all of them differently',
                   'is precise under pressure in a way that some find unnerving'],
    Silversmith:  ['works a metal that requires clean hands and a clean mind',
                   'has crafted objects for tables and altars and the occasional weapon',
                   'takes longer than clients expect and delivers more than they hoped for'],
    Smith:        ['works any metal that comes through the door and refuses to specialize',
                   'has an instinct for what a piece needs that goes beyond what they were taught',
                   'takes as much pride in a farm tool as in a weapon'],
    Soothsayer:   ['offers visions of the future with varying accuracy and consistent confidence',
                   'has told people what they needed to hear enough times to know it\'s not always the same as the truth',
                   'makes a living from hope and occasionally from insight'],
    Sorcerer:     ['was born to magic rather than trained in it, and the difference shows',
                   'has power they haven\'t fully learned to control and knows it',
                   'makes other mages uncomfortable for reasons they struggle to articulate'],
    Sorceress:    ['draws power from a source she doesn\'t fully understand and considers that honest',
                   'was told her magic was dangerous before she was told how to use it',
                   'has turned down formal magical training twice and isn\'t sure she was right to'],
    Spearman:     ['holds the line because someone has to and they\'ve accepted that it\'s them',
                   'is disciplined in the way that only people who have held formations understand',
                   'trains with their weapon every day and considers it a form of meditation'],
    Spy:          ['works in the spaces between official accounts',
                   'has worn more identities than they can comfortably remember',
                   'reports to someone who doesn\'t acknowledge them in public and considers that the definition of their relationship'],
    Squire:       ['serves a knight with the knowledge that they\'re being assessed at all times',
                   'is learning more from watching than from anything they\'ve been told',
                   'carries equipment that isn\'t theirs yet and cares for it as though it were'],
    'Stable Hand':['tends horses with the kind of calm that animals read immediately',
                   'starts work before dawn and finishes after dark and doesn\'t expect acknowledgement',
                   'knows each animal in the stables by character as well as name'],
    Stablemaster: ['runs the stables with an authority that extends to the horses and the grooms equally',
                   'can assess a horse\'s condition in under a minute and rarely needs longer',
                   'has kept the animals of lords, merchants, and travellers alike in good order'],
    Steward:      ['manages an estate with the invisible competence of someone who is never credited properly',
                   'knows where everything is, what everything costs, and what everything is worth',
                   'has made difficult decisions in their lord\'s absence and been right more often than they were thanked for'],
    Storyteller:  ['carries the tales of a dozen places and trades them for warmth, food, or coin',
                   'remembers things that were never written down and is aware of what that responsibility means',
                   'knows how a story changes depending on who\'s listening and adjusts accordingly'],
    Swordsman:    ['has trained longer than most people have been alive and shows it in every movement',
                   'fights with the kind of precision that makes onlookers quiet',
                   'takes on students but does not take on sparring partners without serious intention'],
    Swordsmith:   ['makes blades that are not just weapons but judgements in steel',
                   'has forged perhaps a hundred swords they are proud of and doesn\'t remember the others',
                   'takes commissions from people worthy of the blade and sometimes makes that call themselves'],
    'Tavern Keeper': ['runs a larger establishment than the average innkeeper and knows the difference in effort',
                   'manages staff, suppliers, and customers with the practiced calm of someone who has seen it before',
                   'knows which patrons are trouble before they start and plans accordingly'],
    Thane:        ['holds land and the loyalty of those on it in a bond that goes both directions',
                   'commands respect through a combination of title and personal history',
                   'takes the obligations of their position as seriously as the privileges'],
    Thespian:     ['performs on stage with a commitment that doesn\'t turn off when the curtain falls',
                   'has played every role from hero to villain and identifies with neither',
                   'believes the stage is where people tell the truth about themselves through other people\'s words'],
    Tracker:      ['reads signs in the world that most people would step over',
                   'has followed trails across terrain that should have erased them',
                   'knows when they\'re being followed and when they\'re following someone who knows the same'],
    Trapper:      ['sets and tends snares with the patience of someone who understands waiting',
                   'knows which animals move where and when and has used that knowledge long enough to feel responsible for it',
                   'lives at the margin of settlements and forest and prefers it'],
    Treasurer:    ['keeps accurate accounts of money that isn\'t theirs and finds it a satisfying responsibility',
                   'has detected embezzlement twice and been embezzled from once',
                   'knows the financial position of this operation better than anyone and is consulted less often than that warrants'],
    Warden:       ['maintains order in a place or territory with an authority that doesn\'t need to be raised to be heard',
                   'has made hard calls and stands by all of them even when they\'d choose differently now',
                   'protects what\'s in their charge without distinguishing between the valuable and the living'],
    Warrior:      ['fights because it is what they do and what they are good at',
                   'has more experience in combat than most soldiers and less patience for politics',
                   'has survived things that should have killed them and carries the list quietly'],
    Watchman:     ['keeps an eye on what the settlement does when it thinks nobody is watching',
                   'has seen enough to be trusted and enough to be wary',
                   'does the job with steady attention and doesn\'t mistake that for heroism'],
    Witch:        ['practices arts that the temples disapprove of and the people quietly rely on',
                   'was taught by someone older who was taught by someone older still',
                   'lives at the edge of acceptability and has learned to be comfortable there'],
    Wizard:       ['studied magic for long enough that they now think in spells as often as in words',
                   'commands arcane power with a precision that comes from decades of careful practice',
                   'has a project they never discuss that may be the most important thing they\'ve ever worked on'],
    Woodsman:     ['knows the forest as a living thing with preferences and patterns',
                   'has provided timber, guidance, and protection to those who venture into the trees',
                   'lives between settlements and wilderness and considers it the best position available'],
  };
  const BACKSTORY_FALLBACK = [
    'has a history they rarely discuss',
    'arrived not long ago with little to say about where they came from',
    'keeps their past close and their plans closer',
  ];

  // ============================================================
  // ITEMS BY PROFESSION (carried inventory)
  // ============================================================
  const ITEMS_BY_PROFESSION = {
    // Original entries
    Farmer:    [['Rations',2],['Rope',1]],
    Wanderer:  [['Rations',1],['Torch',2],['Rope',1]],
    Mercenary: [['Health Potion',1],['Rations',2]],
    Trader:    [['Coin Purse',1],['Trading Goods',1]],
    Priest:    [['Holy Symbol',1],['Bandage',3]],
    Thief:     [['Rope',1],['Dagger',1]],
    Scholar:   [['Scroll',1],['Candle',2]],
    Guard:     [['Health Potion',1],['Torch',1]],
    Hunter:    [['Arrow',8],['Rope',1],['Hunting Knife',1]],
    Innkeeper: [['Rations',3],['Coin Purse',1]],
    Sailor:    [['Rope',2],['Torch',1]],
    Bard:      [['Coin Purse',1],['Rations',1]],
    Alchemist: [['Health Potion',2],['Empty Vial',2]],
    Knight:    [['Health Potion',1],['Bandage',2]],
    Soldier:   [['Rations',2],['Bandage',1]],
    Pilgrim:   [['Holy Symbol',1],['Rations',1],['Candle',1]],
    Tinker:    [['Rope',1],['Torch',1]],
    Gambler:   [['Coin Purse',1]],
    Beggar:    [['Rations',1]],
    // New entries
    Adventurer:   [['Health Potion',1],['Torch',2],['Rope',1],['Rations',2]],
    Archer:       [['Arrow',12],['Rations',1]],
    Assassin:     [['Dagger',1],['Rope',1],['Health Potion',1]],
    Baker:        [['Rations',3],['Coin Purse',1]],
    Bandit:       [['Dagger',1],['Rations',1],['Rope',1]],
    Barbarian:    [['Health Potion',1],['Rations',2]],
    Barber:       [['Bandage',2],['Coin Purse',1]],
    Blacksmith:   [['Coin Purse',1],['Rations',1]],
    'Bounty Hunter': [['Rope',2],['Health Potion',1],['Rations',1]],
    Carpenter:    [['Rope',1],['Rations',1]],
    Cartographer: [['Scroll',1],['Candle',2],['Coin Purse',1]],
    Cleric:       [['Holy Symbol',1],['Bandage',3],['Health Potion',1]],
    Constable:    [['Rope',1],['Torch',1]],
    Druid:        [['Herbs',3],['Holy Symbol',1],['Rations',1]],
    'Dungeon Delver': [['Torch',3],['Rope',2],['Health Potion',1],['Lockpick',1]],
    Enchanter:    [['Scroll',2],['Empty Vial',1],['Candle',2]],
    Explorer:     [['Torch',2],['Rope',1],['Rations',3],['Scroll',1]],
    Falconer:     [['Rations',1],['Rope',1]],
    Fence:        [['Coin Purse',1],['Lockpick',1]],
    Forager:      [['Herbs',4],['Rations',1]],
    Herbalist:    [['Herbs',4],['Bandage',2]],
    Healer:       [['Bandage',4],['Health Potion',1],['Herbs',2]],
    Historian:    [['Scroll',2],['Candle',2]],
    Investigator: [['Torch',1],['Scroll',1],['Rope',1]],
    Jeweller:     [['Coin Purse',1],['Gem',1]],
    Librarian:    [['Scroll',2],['Candle',3]],
    Loremaster:   [['Scroll',2],['Candle',2]],
    Mage:         [['Scroll',2],['Mana Potion',1],['Candle',1]],
    Mapmaker:     [['Scroll',2],['Candle',2],['Coin Purse',1]],
    Mason:        [['Rations',2],['Rope',1]],
    Mercenary:    [['Health Potion',1],['Rations',2]],
    Miller:       [['Rations',3],['Coin Purse',1]],
    Miner:        [['Torch',3],['Rope',1],['Rations',2]],
    Minstrel:     [['Coin Purse',1],['Rations',1]],
    Navigator:    [['Rope',1],['Torch',1],['Scroll',1]],
    Oracle:       [['Holy Symbol',1],['Candle',3]],
    Pathfinder:   [['Torch',2],['Rope',2],['Rations',2]],
    Performer:    [['Coin Purse',1],['Rations',1]],
    Pirate:       [['Rope',2],['Dagger',1],['Rations',1]],
    Potter:       [['Rations',1],['Coin Purse',1]],
    Prospector:   [['Torch',2],['Rope',1],['Rations',2]],
    Ranger:       [['Arrow',8],['Rope',1],['Herbs',2],['Rations',2]],
    'Relic Hunter': [['Torch',2],['Rope',1],['Lockpick',1],['Rations',2]],
    'Royal Mage': [['Scroll',2],['Mana Potion',2]],
    'Rune Crafter':[['Scroll',1],['Candle',2]],
    Sage:         [['Scroll',2],['Candle',3]],
    Scout:        [['Arrow',6],['Rope',1],['Rations',2]],
    Scribe:       [['Scroll',2],['Candle',2]],
    Sellsword:    [['Health Potion',1],['Rations',2]],
    Shepherd:     [['Rope',2],['Rations',2]],
    Silversmith:  [['Coin Purse',1],['Gem',1]],
    Sorcerer:     [['Scroll',1],['Mana Potion',1],['Candle',1]],
    Sorceress:    [['Scroll',1],['Mana Potion',1],['Candle',1]],
    Spy:          [['Rope',1],['Dagger',1],['Coin Purse',1]],
    'Stable Hand':[['Rations',1],['Rope',1]],
    Storyteller:  [['Coin Purse',1],['Rations',1]],
    Swordsman:    [['Health Potion',1],['Bandage',1]],
    Tailor:       [['Coin Purse',1],['Rations',1]],
    Tanner:       [['Rope',1],['Rations',1]],
    Tracker:      [['Rope',1],['Arrow',4],['Rations',2]],
    Trapper:      [['Rope',2],['Rations',2],['Hunting Knife',1]],
    Warrior:      [['Health Potion',1],['Rations',2],['Bandage',1]],
    Weaver:       [['Rations',1],['Coin Purse',1]],
    Witch:        [['Herbs',3],['Candle',2],['Empty Vial',1]],
    Wizard:       [['Scroll',2],['Mana Potion',1],['Candle',2]],
    Woodsman:     [['Torch',1],['Rope',1],['Rations',2]],
  };

  // ============================================================
  // HELPER BUILDERS
  // ============================================================

  function randomName(race, gender) {
    const pool = NAMES[race] || NAMES.Human;
    return pick(gender === 'Female' ? pool.f : pool.m);
  }

  function buildBackstory(name, profession) {
    const frags = BACKSTORY_BY_PROFESSION[profession] || BACKSTORY_FALLBACK;
    return `${name} ${pick(frags)}.`;
  }

  // Compose a full appearance string from individual physical attribute tables.
  // Falls back gracefully if the tables from npcTemplate.js are not loaded.
  function buildAppearance(race, gender) {
    const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

    // Race-specific base from the APPEARANCES pools (provides build/race-defining features)
    const base = pick(APPEARANCES[race] || APPEARANCES.Human);

    // ── Hair ──────────────────────────────────────────────────
    let hair = null;
    const skipHair = (race === 'Dragonkin');
    if (!skipHair &&
        typeof NPC_PHYS_HAIR_LENGTH !== 'undefined' &&
        typeof NPC_PHYS_HAIR_COLOR  !== 'undefined') {
      // ~8% chance of bald/shaved (replaces color + length entirely)
      if (typeof NPC_PHYS_HAIR_BALD !== 'undefined' && Math.random() < 0.08) {
        hair = pick(NPC_PHYS_HAIR_BALD);
      } else {
        const length = pick(NPC_PHYS_HAIR_LENGTH);
        const color  = pick(NPC_PHYS_HAIR_COLOR);
        hair = `${length} ${color} hair`;
      }
    }

    // ── Facial hair (male / non-binary only) ──────────────────
    let facialHair = null;
    const isMale = gender === 'Male' || gender === 'Non-Binary';
    if (isMale && !skipHair && typeof NPC_PHYS_FACIAL_HAIR !== 'undefined') {
      facialHair = pick(NPC_PHYS_FACIAL_HAIR);
    }

    // ── Eyes ──────────────────────────────────────────────────
    const skipEyes = (race === 'Dragonkin' || race === 'Orc');
    const eyes = (!skipEyes && typeof NPC_PHYS_EYES !== 'undefined')
      ? pick(NPC_PHYS_EYES) : null;

    // ── Skin ──────────────────────────────────────────────────
    const hasSkin = (race === 'Human' || race === 'Elf' || race === 'Half-Elf' ||
                     race === 'Halfling' || race === 'Goblin');
    const skin = (hasSkin && typeof NPC_PHYS_SKIN !== 'undefined' && Math.random() < 0.55)
      ? pick(NPC_PHYS_SKIN) : null;

    // ── Facial feature (~40%) ─────────────────────────────────
    const face = (typeof NPC_PHYS_FACE !== 'undefined' && Math.random() < 0.40)
      ? pick(NPC_PHYS_FACE) : null;

    // ── Scar (~35%) ───────────────────────────────────────────
    const scar = (typeof NPC_PHYS_SCARS !== 'undefined' && Math.random() < 0.35)
      ? pick(NPC_PHYS_SCARS) : null;

    // ── Physical quirk (~45%) ─────────────────────────────────
    const quirk = (typeof NPC_PHYS_QUIRKS !== 'undefined' && Math.random() < 0.45)
      ? pick(NPC_PHYS_QUIRKS) : null;

    // ── Assemble ──────────────────────────────────────────────
    const parts = [base];

    // Hair clause: "Long dark brown hair, clean-shaven" or "Short auburn hair, blue eyes"
    if (hair && facialHair && eyes && skin)
      parts.push(`${cap(hair)}, ${facialHair}, ${eyes}, ${skin}`);
    else if (hair && facialHair && eyes)
      parts.push(`${cap(hair)}, ${facialHair}, ${eyes}`);
    else if (hair && facialHair && skin)
      parts.push(`${cap(hair)}, ${facialHair}, ${skin}`);
    else if (hair && facialHair)
      parts.push(`${cap(hair)}, ${facialHair}`);
    else if (hair && eyes && skin)
      parts.push(`${cap(hair)}, ${eyes}, ${skin}`);
    else if (hair && eyes)
      parts.push(`${cap(hair)}, ${eyes}`);
    else if (hair)
      parts.push(cap(hair));

    if (face)  parts.push(cap(face));
    if (scar)  parts.push(cap(scar));
    if (quirk) parts.push(cap(quirk));

    return parts.join('. ');
  }

  function buildDescription(race, gender, socialClass, profession, appearance) {
    const p = gender === 'Female' ? ['She', 'her'] : gender === 'Male' ? ['He', 'his'] : ['They', 'their'];
    return `${appearance}. ${p[0]} carries ${p[1]}self like a ${socialClass.toLowerCase()} — likely a ${profession.toLowerCase()}.`;
  }

  function buildWhereMet(biome, zone, settlementName) {
    if (zone === 'City' || zone === 'CapitalCity') return `In the streets of ${settlementName || 'a city'}`;
    if (zone === 'Village')                        return `In the village of ${settlementName || 'a small settlement'}`;
    if (biome)                                     return `On the road through ${biome.toLowerCase()} country`;
    return 'Encountered in passing';
  }

  function buildItems(profession) {
    const pool = ITEMS_BY_PROFESSION[profession] || ITEMS_BY_PROFESSION.Wanderer;
    return pool.map(([item, quantity]) => ({ item, quantity }));
  }

  function buildFlags(socialClass, profession) {
    // Defer to script.js sets if available; otherwise fall back to a sensible default.
    let recruitable;
    if (typeof NON_RECRUITABLE_PROFESSIONS !== 'undefined' && typeof BOND_PROFESSIONS !== 'undefined' && typeof MERCENARY_PROFESSIONS !== 'undefined') {
      recruitable = !NON_RECRUITABLE_PROFESSIONS.has(profession) &&
                    (MERCENARY_PROFESSIONS.has(profession) || BOND_PROFESSIONS.has(profession));
    } else {
      recruitable = Math.random() < 0.15;
    }
    return {
      recruitable,
      romanceable:       Math.random() < 0.1,
      canBePickpocketed: socialClass !== 'Noble' && socialClass !== 'Royalty',
      dropsLootOnDeath:  true,
    };
  }

  // ============================================================
  // MAIN GENERATOR
  // ============================================================

  function generate(opts = {}) {
    const race        = opts.race   || pick(RACE_TABLE);
    const gRoll       = Math.random();
    const gender      = opts.gender || (gRoll < 0.48 ? 'Male' : gRoll < 0.96 ? 'Female' : 'Non-Binary');
    const socialClass = opts.socialClass || pick(Object.keys(PROFESSIONS_BY_CLASS));
    const profession  = opts.profession  || (opts.tavern
                          ? pick(TAVERN_PROFESSIONS)
                          : pick(PROFESSIONS_BY_CLASS[socialClass]));

    const name        = opts.name || randomName(race, gender);
    const alias       = Math.random() < 0.15 ? pick(ALIASES) : null;
    const appearance  = buildAppearance(race, gender);

    // Pull trait/skill keys from loaded globals; fall back to hard-coded lists
    const traitKeys   = (typeof gameTraits !== 'undefined') ? Object.keys(gameTraits)
                          : ['Brave','Cunning','Loyal','Ruthless','Kind','Wise'];
    const skillKeys   = (typeof gameSkills !== 'undefined') ? Object.keys(gameSkills)
                          : ['Survival','Stealth','Persuasion','Crafting','Tracking'];
    const traits      = pickN(traitKeys, Math.random() < 0.5 ? 2 : 1);
    const skills      = pickN(skillKeys, 2 + (Math.random() < 0.4 ? 1 : 0));

    const morality    = pick(MORALITY_SPECTRUM);
    const goals       = pickN(NPC_GOALS,   1 + (Math.random() < 0.5 ? 1 : 0));
    const motives     = pickN(NPC_MOTIVES, 1 + (Math.random() < 0.3 ? 1 : 0));
    const affiliation = Math.random() < 0.25 ? pick(AFFILIATIONS) : 'None';
    const reputation  = pick(REPUTATIONS);
    const secret      = Math.random() < 0.65 ? pick(SECRETS) : null;

    const backstory   = buildBackstory(name, profession);
    const description = buildDescription(race, gender, socialClass, profession, appearance);
    const cell        = (opts.zone || opts.biome) ? opts
                          : ((typeof mapData !== 'undefined' && mapData[player?.currentLocation]) || {});
    const whereMet    = opts.whereMet || buildWhereMet(cell.biome, cell.zone, cell.cityVillage);
    const items       = buildItems(profession);
    const flags       = buildFlags(socialClass, profession);

    return {
      name, alias, race, gender, socialClass, appearance, profession,
      skills, traits,
      relationToPlayer: 'Neutral',
      morality,
      backstory, description, whereMet,
      friends: [], enemies: [],
      alive: true,
      goals, motives,
      conversationLog: [],
      items, flags,
      affiliation, reputation, secret,
    };
  }

  function generateTavernNPC(opts = {}) {
    return generate({ ...opts, tavern: true });
  }

  return { generate, generateTavernNPC, randomName };

})();
