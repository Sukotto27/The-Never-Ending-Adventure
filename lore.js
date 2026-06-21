// lore.js — World Lore Database
// ─────────────────────────────────────────────────────────────────────────────
// Each entry is a discoverable piece of world knowledge.
//
// SCHEMA:
//   id       {string}  Unique kebab-case identifier.
//   title    {string}  Short headline shown in the journal.
//   category {string}  One of the LORE_CATEGORIES values below.
//   text     {string}  The full lore text shown when the entry is read.
//   source   {string}  How this lore is found. Used to match discovery events:
//                        'rumor'       Overheard in a tavern rumor pool.
//                        'npc'         Learned by talking to townsfolk.
//                        'bard'        Heard in a bard's song or performance.
//                        'library'     Read in a library, bookshop, or archive.
//                        'loremaster'  Told by a loremaster, sage, or scholar.
//                        'relic'       Discovered on a relic or artifact.
//                        'site'        Found by visiting a historical site.
//                        'exploration' Uncovered while exploring the wilderness.
//                        'any'         Can be learned from any of the above.
//   rarity   {string}  'common' | 'uncommon' | 'rare'
//   kingdoms {string[]} Kingdoms where this is more likely to surface.
//                       Empty array means it can appear anywhere.
//   biomes   {string[]} Biomes where relevant. Empty means anywhere.
// ─────────────────────────────────────────────────────────────────────────────

const LORE_CATEGORIES = [
  'History',
  'The Arúvari',
  'Kingdoms',
  'Magic',
  'Creatures',
  'Legends',
  'Religion',
  'Geography',
  'People',
];

const LORE_ENTRIES = [

  // ── HISTORY ────────────────────────────────────────────────────────────────

  {
    id:       'aegrim-empire-fall',
    title:    'The Fall of the Aegrim Empire',
    category: 'History',
    text:     'Three centuries ago the Aegrim Empire stretched from the Frostmere coast to the Sunken Reaches, enforced by roads of black stone and a legion called the Wardens of the Pale. Its collapse came not from an enemy but from within — a succession war that fractured the Imperial Council into seven factions, each crowning a different heir. By the time the fighting ended, the roads had been torn up for their stone, the Wardens were scattered mercenaries, and every regional governor had renamed themselves a king. The ten kingdoms of today are its inheritance.',
    source:   'library',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'the-sundering-war',
    title:    'The Sundering War',
    category: 'History',
    text:     'Before the current kingdoms took their shapes, a conflict known simply as the Sundering War remade the continent\'s borders in a single generation. Two alliances — the Iron Compact in the north and the River Confederation in the south — ground each other to nothing over thirty years of siege and counter-siege. The war ended not with a treaty but with exhaustion. Both sides simply ran out of soldiers. The silence that followed is what allowed the surviving lords to carve out the kingdoms that still exist today. Historians argue that no one won. Survivors argue there were no survivors, only people who hadn\'t yet noticed they were dead.',
    source:   'loremaster',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  // ── KINGDOMS ───────────────────────────────────────────────────────────────

  {
    id:       'ardrenhold-founding-pact',
    title:    'The Founding Pact of Ardrenhold',
    category: 'Kingdoms',
    text:     'Ardrenhold was not founded by conquest but by agreement. Three noble families — the Ardrens, the Kessler line, and a now-extinct house called Vorne — signed a compact at the site of what is now the great keep, agreeing to share governance rather than fight for sole control. The Ardrens eventually absorbed the others through marriage and attrition, but the compact is still read aloud at every coronation. Most kings make it through two sentences before skipping to the end.',
    source:   'rumor',
    rarity:   'common',
    kingdoms: ['Ardrenhold'],
    biomes:   [],
  },

  {
    id:       'feldarun-iron-lords',
    title:    'The Iron Lords of Feldarún',
    category: 'Kingdoms',
    text:     'Feldarún\'s rulers are called the Iron Lords, not by tradition but by necessity. The deep-vein ore deposits beneath the kingdom require constant management — flooding, cave-ins, gas pockets that kill without warning. The ruling family has historically been drawn from the mining engineers rather than the warrior class. This gives Feldarún an unusual character: its nobility are more likely to know how to shore up a collapsed shaft than how to ride a destrier, and they tend to look down on kingdoms whose wealth comes from taxing farmers.',
    source:   'loremaster',
    rarity:   'uncommon',
    kingdoms: ['Feldarún'],
    biomes:   [],
  },

  {
    id:       'naradreth-civil-war-roots',
    title:    'The Roots of Naradreth\'s Division',
    category: 'Kingdoms',
    text:     'The civil war tearing Naradreth apart did not begin over succession or territory. It began over a harbour. The eastern lords controlled the principal port and had been quietly inflating tariffs for forty years. The western lords, dependent on that port for trade, eventually refused to pay. What started as a trade dispute hardened into a question of sovereignty — whether the eastern lords answered to the throne at all. By the time swords were drawn, both sides had built up so many grievances that the original argument had been forgotten by most of the soldiers fighting it.',
    source:   'npc',
    rarity:   'uncommon',
    kingdoms: ['Naradreth'],
    biomes:   [],
  },

  // ── MAGIC ──────────────────────────────────────────────────────────────────

  {
    id:       'six-schools-arcane',
    title:    'The Six Schools of Arcane Thought',
    category: 'Magic',
    text:     'Magical study across the continent is loosely organized into six schools, each with its own tradition and temperament. Conjuration and Evocation are the most commonly taught, being both powerful and relatively straightforward. Divination and Illusion are smaller fields, considered eccentric by the mainstream. Transmutation draws occasional suspicion from the church. The sixth school, Entropy — the study of decay, unmaking, and reversal — is technically illegal in three kingdoms and informally discouraged in the rest. Practitioners exist; they are simply careful about where they study.',
    source:   'library',
    rarity:   'common',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'corrupted-spires',
    title:    'The Corrupted Spires',
    category: 'Magic',
    text:     'In the far northeastern reaches, three stone towers stand at the corners of a rough triangle, each leaning slightly inward as if drawn together. They predate any known civilisation and appear on no map made before the current age. Scholars who have visited report that compasses behave strangely within sight of the spires and that animals refuse to approach. There are no inscriptions, no doors, and no visible way to enter. The towers are solid stone all the way through — or so the one expedition that drilled into the base wall reported, before the equipment was abandoned and the team came home without speaking of what else they found.',
    source:   'exploration',
    rarity:   'rare',
    kingdoms: [],
    biomes:   ['Tundra', 'Mountains'],
  },

  // ── CREATURES ──────────────────────────────────────────────────────────────

  {
    id:       'hill-troll-behavior',
    title:    'Hill Troll Behaviour',
    category: 'Creatures',
    text:     'Hill trolls are not intelligent in any way a traveller would find reassuring, but they are not purely instinct-driven either. They maintain territories, remember faces across seasons, and have been observed laying crude ambushes — waiting above a familiar path for animals or people they have seen pass before. The main thing to understand about a hill troll is that it is patient. It does not give chase for long. It waits. The second main thing to understand is that they regenerate wounds quickly in darkness, and slowly in direct sunlight. Torches help. Dawn helps more.',
    source:   'npc',
    rarity:   'common',
    kingdoms: [],
    biomes:   ['Hills', 'Mountains'],
  },

  {
    id:       'wyverns-of-rendarost',
    title:    'The Wyverns of Rendarost',
    category: 'Creatures',
    text:     'Unlike true dragons, wyverns lack the foreleg pair entirely — they walk on two legs and fly on membrane wings, using the clawed wingtip as a third limb on the ground. The Rendarost peaks shelter a breeding population of perhaps two dozen, which the local militia calls the Standing Threat and monitors with signal fires. Wyvern attacks on settlements are rare but not unheard of; the creatures prefer livestock and wild game. What makes them dangerous to people is territorial behaviour during nesting season, when even an aircraft-sized shadow overhead can trigger a strike response.',
    source:   'bard',
    rarity:   'uncommon',
    kingdoms: ['Rendarost'],
    biomes:   ['Mountains', 'Tundra'],
  },

  // ── LEGENDS ────────────────────────────────────────────────────────────────

  {
    id:       'the-wandering-flame',
    title:    'The Wandering Flame',
    category: 'Legends',
    text:     'The oldest tavern song in circulation tells of a small flame that appears on roads after heavy rain, always just at the limit of sight. It does not burn. It does not spread. It simply moves — away from the traveller, always at the same pace, never faster than a walking person. The songs disagree on what it is: a spirit, a ghost, a curse, a blessing. They agree on one thing: following it to its destination brings the traveller either exactly what they needed most or exactly what they deserved. The distinction, the songs note, is not always clear.',
    source:   'bard',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aldrath-the-unbroken',
    title:    'Aldrath the Unbroken',
    category: 'Legends',
    text:     'Aldrath appears in the histories of six different kingdoms as a contemporary figure, yet the timelines are impossible — the accounts span ninety years, and none describe him aging. He is variously a mercenary commander, a wandering healer, a king\'s executioner, and a man who walked into a burning city and carried out thirty-three children before the walls fell. Every account agrees on his appearance: tall, grey-cloaked, a deep scar across the bridge of his nose, and eyes that witnesses described as looking at something slightly behind the person he was speaking to. Whether he was one man, many men, or a story that attached itself to whoever was convenient, no one has determined.',
    source:   'loremaster',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  // ── RELIGION ───────────────────────────────────────────────────────────────

  {
    id:       'the-seven-aspects',
    title:    'The Seven Aspects',
    category: 'Religion',
    text:     'The dominant faith across most of the continent organises the divine into seven Aspects rather than named gods — Death, Birth, War, Harvest, Storm, Night, and the Unnamed, which is described as the Aspect of all things not yet categorised. Temples typically honour whichever Aspects are relevant to the local economy: farming communities emphasise Harvest, port cities burn offerings to Storm. Priests point out that the Aspects are not separate beings but facets of a single divine truth, and spend considerable effort arguing among themselves about what that means in practice.',
    source:   'npc',
    rarity:   'common',
    kingdoms: [],
    biomes:   [],
  },

  // ── GEOGRAPHY ──────────────────────────────────────────────────────────────

  {
    id:       'the-sunken-reaches',
    title:    'The Sunken Reaches',
    category: 'Geography',
    text:     'The Sunken Reaches are a lowland region to the southeast where the land dropped by several feet sometime in the past three centuries — the cause is debated but the leading theory involves a series of earthquakes that liquefied the underlying sediment. The result is a permanent wetland that floods completely in wet seasons and becomes a treacherous bog in dry ones. The Reaches are not uninhabited — a population of fisherfolk and peat harvesters knows their way around — but outside guides consider them among the most dangerous terrain on the continent for the unprepared, where paths through the same stretch change week to week.',
    source:   'exploration',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   ['Swamp', 'Wetlands'],
  },

  // ── TAVERN TALES & FOLK LEGENDS ────────────────────────────────────────────
  // These entries are discoverable via 'bard' or 'rumor' sources — heard in
  // taverns, sung by traveling bards, or passed between travelers at the bar.

  {
    id:       'war-the-goat',
    title:    'War the Goat',
    category: 'Legends',
    text:     'The songs don\'t agree on much when it comes to War, but they all agree he had one horn — and that the horn had done things that swords hadn\'t managed. A goat of uncertain breed and absolute conviction, War is credited with aiding three separate bandit companies, headbutting a city gate open during a siege he had no part in, and personally routing a cavalry charge at the Battle of Cressel Ford by planting himself in the road and staring the horses down until they turned. He fought on behalf of the poor and the desperate, and supposedly against tyrants — though the songs differ on his methods, all of them agree his methods worked. Some verses say he died at a hundred and one, peacefully, surrounded by weeping bandits who had named their encampment after him and left him a wreath of stolen flowers. Others insist he lives still, somewhere in the hills, one horn low, waiting for the next cause worth his carnage. Either version, the singers note, is equally believable.',
    source:   'bard',
    rarity:   'common',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'merwin-the-lucky',
    title:    'Merwin the Lucky',
    category: 'Legends',
    text:     'Merwin the Lucky is either the most gifted wizard of his generation or the worst, depending entirely on how you define those terms. His spells have never, in any account, done what he intended. His fireball once materialized as a large fruit pastry that fell on a starving village and fed them for a week. His attempt to summon a demon reportedly produced a very confused goat that wandered into a warlord\'s war room and somehow ended a siege that had lasted four months. His polymorphing experiments are too numerous and varied to list, though none of them involved anyone becoming what Merwin had in mind. Merwin himself is most reliably found in whichever tavern is nearest, several drinks past coherence, explaining with great sincerity that intention is overrated and outcomes are what matter. He has survived sixteen assassination attempts, two dragon encounters, a volcanic eruption, and a fall from a significant height. His explanation for each survival is the same: "Luck. Or skill. Genuinely hard to tell after four drinks." Scholars remain divided.',
    source:   'bard',
    rarity:   'common',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'bramblewim-the-barbarimp',
    title:    'Bramblewim the Barbarimp',
    category: 'Legends',
    text:     'Most imps stand at knee height and cause small, irritating trouble. Bramblewim stands at knee height and has toppled walls. His battleaxe — which he calls Rosey, in a tone that does not invite questions — is larger than he is by considerable measure. Those who have witnessed him in combat dispute the relevant laws of physics. Tales credit him with felling a war troll unaided, collapsing a bridge mid-battle to cut off a pursuing army, and reducing an entire guard post to timber because someone looked at him in a way he found disrespectful. The accounts agree on one consistent detail: he fights while swearing, continuously, at volume, in multiple languages, some of which no witness has been able to identify. Scholars who attempted to transcribe his vocabulary for academic purposes have declined to publish the results. Bramblewim is revered in certain bandit circles, celebrated in a handful of bardic traditions, and listed as a public hazard in the administrative records of at least four cities. Rosey, some songs add, is quite pretty up close — if you survive the introduction.',
    source:   'bard',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'eater-oak-of-elder-glade',
    title:    'The Eater Oak of Elder Glade',
    category: 'Legends',
    text:     'They say the oldest tree in Elder Glade is alive in a way that trees are not supposed to be, and that it is hungry. Those who have approached it after dark report a voice — low, slow, like millstones grinding — that comes from everywhere and nowhere. It speaks. It is not welcoming. The oldest accounts say it was called into wakefulness by a circle of ancient druids who fed it their prayers and their secrets and, in the telling that goes quieter when it\'s told near forested areas, themselves. The tree returned the favor by eating them, and has held a broadly negative opinion of people ever since. It is said to take particular interest in the drunk and the foolish, and in those who have taken an axe to its kin. Logging camps in the Elder Glade region have a history of going silent. The nearest settlements have found other sources of timber and do not discuss why. When travelers ask locals whether the tree still stands, the locals change the subject with a speed and consistency that is itself an answer.',
    source:   'rumor',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   ['Forest', 'Ancient Forest'],
  },

  {
    id:       'gundrow-the-immortal-drunk',
    title:    'Gundrow Blackfoot, Who Will Not Die',
    category: 'Legends',
    text:     'Gundrow Blackfoot is either a recurring legend or a recurring problem, depending on your relationship to him. The man has reportedly survived a direct lightning strike (too relaxed to tense, which some physicians note can help), falling into a volcanic caldera (landed on a ledge, slept there, walked out), being swallowed by a river serpent (the serpent reportedly reconsidered), and being executed for tax evasion in three different kingdoms on three separate occasions through means still unclear even to the kingdoms involved. He is, by all current accounts, alive. He does not appear to be capable of the alternative. He is not particularly trying to avoid it either — he simply has not gotten around to it. You can find him in a tavern somewhere, explaining his philosophy to whoever will listen. The philosophy is hard to summarize soberly. It makes more sense after the fourth drink, which Gundrow considers proof of its correctness.',
    source:   'rumor',
    rarity:   'common',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'old-fenwick-the-headless',
    title:    'Old Fenwick, the Headless Merchant',
    category: 'Legends',
    text:     'Travel advisories along the Three Rivers trading route mention Old Fenwick as something between a ghost story and a commerce notice. He lost his head some decades ago — accounts vary on whether this was literal before it became metaphorical, or metaphorical before it became literal — during a deal that went badly in a direction no one anticipated. He has since continued his trade route. His goods are, by consistent report, excellent quality at fair prices. His navigation method is not understood. He communicates through a series of written signs he carries, and those who have tried to rob him report that he simply continues walking, and that the experience of being ignored by a headless merchant is more unsettling than being threatened. Purchasing from him leaves a faint unease that some describe as guilt and others describe as the feeling of having gotten away with something. Whether he means harm is unclear. Whether he is aware of his condition is also unclear. His customer retention, however, is reportedly very strong.',
    source:   'rumor',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'crumblewick-the-failed-hero',
    title:    'Crumblewick, Chosen of the Amber Moon',
    category: 'Legends',
    text:     'The Prophecy of the Amber Moon named a Crumblewick, son of Crumblewick, as the figure who would stand at the gates of doom and turn the tide of darkness. The prophecy scholars have spent considerable effort in the forty years since explaining why this has not happened yet. What Crumblewick has done: accidentally ended a war by sneezing during treaty negotiations in a manner that convinced both delegations the gods had an opinion; discovered three lost settlements while searching for a location he had the wrong directions to; defeated an entrenched lich by sitting on it during a moment of confusion and refusing to get up; and twice been named a civic hero by cities he was only passing through. He is aware of the prophecy. He finds it embarrassing. He maintains that he is "getting to it" and that prophecies do not specify a timeline. When asked what the gates of doom look like, he pauses for a long time and then orders another drink.',
    source:   'bard',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'the-singing-sword-of-dunmarch',
    title:    'The Singing Sword of Dunmarch',
    category: 'Legends',
    text:     'There is a sword somewhere in the world that will not stop performing. It belonged to a knight of Dunmarch who gave it a name in a moment of sentimentality and by doing so bound a personality to it that could not be unbound. The sword has opinions, preferences, and a repertoire of bawdy songs it considers underappreciated. It left its first owner after a disagreement about when it was appropriate to sing. It has since left six others, in each case citing incompatibility. It was last reported being carried by a merchant who accepted it after the sword promised to warn him of danger. It keeps the promise. It warns him of danger loudly, at length, often in verse, occasionally in advance of the danger being visible to anyone else, and never in a way that does not draw considerable attention to their exact location. The merchant has reportedly asked it to stop several times. The sword considers this an ongoing creative disagreement.',
    source:   'rumor',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aunt-margrit-the-undying',
    title:    'Aunt Margrit',
    category: 'People',
    text:     'Aunt Margrit is an old woman who appears, without apparent pattern, in taverns across the continent. She is always old. She has always been old. Travelers who have encountered her at different points in their lives report that she appears identical each time — same weathered face, same clay pipe, same mug that no one ever sees refilled. She claims to be "just a very healthy woman." She has been present, according to the combined account of her various witnesses, at the fall of the Aegrim Empire, the signing of the Dunmarch Peace, the first eruption of the Fellmoor, and a series of events too personal to the witnesses for them to describe publicly. She dispenses advice that is not asked for and consistently correct. She does not explain herself. She does not drink what\'s in the mug, but she always has it. If you see her in a tavern and she looks at you, the people who have been looked at report that you should listen to whatever she says next very carefully, regardless of how unimportant it sounds.',
    source:   'rumor',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  // ── THE ARÚVARI ────────────────────────────────────────────────────────────
  // A hidden history. Discovered piece by piece through ruins, relics, NPCs,
  // and specific encounters. Tone: dark, tragic, lamentful.

  {
    id:       'aruvari-first-people',
    title:    'The People Before',
    category: 'The Arúvari',
    text:     'Ask almost anyone over sixty what their grandparents used to call the old stones in the hills and you get the same shrug — they were already there. Old growth, old work, older than counting. The scholars have a term for whoever built them: Pre-Settlement inhabitants. It is a clinical phrase for a mystery nobody seems especially eager to solve. The ruins are not dangerous. They do not threaten anything. They simply sit in the earth and do not explain themselves, which most of the people who live near them seem to find preferable.',
    source:   'npc',
    rarity:   'common',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-ancient-name',
    title:    'The Name They Called This Land',
    category: 'The Arúvari',
    text:     'Scratched into the back face of a stone pulled from a riverbed — the river itself has shifted since — a single phrase in a script no living scholar can fully translate. What can be read, approximately, is: Aevandril — a compound word that might mean the breathing earth or the land that remembers. No equivalent name exists in any modern language for the continent. Estranta, the name now used, was coined by early cartographers and means simply the eastern reach in Old Imperial. Whatever this land was to the people who first lived here, they had a word for it that did not need a compass direction to define it.',
    source:   'relic',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-treaty-of-open-hands',
    title:    'The Treaty of Open Hands',
    category: 'The Arúvari',
    text:     'A partial copy survives in a monastery archive in the northern foothills — three pages of dense script in two languages, one recognisable and one not, with sections missing where the parchment has rotted through. What is legible describes a coexistence agreement between newcomers and the people already living on the continent. The newcomers would be given settlement rights in the lowland valleys. In return, they would respect certain forests, certain hills, certain waterways — described only by name, the names now lost. The document is undated. No scholar has found a reference to it in any official history of any kingdom. The monk who showed it to a visiting historian said it had been in the archive as long as anyone could remember, and that nobody had ever asked about it before.',
    source:   'library',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-ruins',
    title:    'Ruins of the Arúvari',
    category: 'The Arúvari',
    text:     'The ruins are easy to miss if you are not looking. A wall that might be a wall or might be a shelf of natural rock. A flat depression in a hillside that drains too cleanly to be accidental. A circle of stones with a different texture from everything around them, as if they came from somewhere else. What sets Arúvari construction apart, when you know what you are looking at, is the jointing — no mortar, no binding, just stone fitted to stone with a precision that should not be possible without tools that left no record of existing. They built to last. The lasting is the only thing that survived.',
    source:   'site',
    rarity:   'common',
    kingdoms: [],
    biomes:   ['Forest', 'Hills', 'Plains', 'Mountains'],
  },

  {
    id:       'aruvari-valley-name',
    title:    'The Valley Has Another Name',
    category: 'The Arúvari',
    text:     'In a language no one alive speaks as a mother tongue, the valley the maps now call the Crimson Valley had a different name. It appears on a stone tablet found buried beneath a market square — the market square of a city built, as it turned out, directly atop an older settlement. The name translates, as close as anyone can manage, as the valley where we held the feast of welcome. The second word in the original is a form used specifically for celebrations among people who trust each other completely. There is no second tablet explaining what changed.',
    source:   'relic',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-grand-feast',
    title:    'The Night of the Grand Feast',
    category: 'The Arúvari',
    text:     'An account exists — partial, unsigned, water-damaged — that describes a gathering at a valley between the lowland settlements and the old hill country. It is written in the clipped style of a logistical record, which makes it worse rather than better to read. Fires prepared. Enough for a city. Game dressed. Enough for a city. Then a gap where several lines have been scraped away with something sharp, deliberately. What follows: By the third hour past dark, the valley was quiet. It is a short document. The gap in the middle is the longest part.',
    source:   'library',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-blood-in-soil',
    title:    'Blood in the Soil',
    category: 'The Arúvari',
    text:     'A farmer who has worked the same land long enough will sometimes mention, without elaboration, that certain fields have a colour they do not quite have words for. Not red. Not brown. Something that comes up with the plough in dry seasons and disappears when the rain comes. The old farmers do not plant root crops there. They do not explain why. When pressed, they look at the ground and change the subject. Their grandparents knew something about that particular soil. Their grandparents did not explain it either, but they did not plant there. Some traditions survive longer than the reasons for them.',
    source:   'exploration',
    rarity:   'common',
    kingdoms: [],
    biomes:   ['Plains', 'Hills', 'Grassland'],
  },

  {
    id:       'aruvari-inscription',
    title:    'Words in Stone',
    category: 'The Arúvari',
    text:     'Carved into the capstone of a fallen doorway — the arch above it long since collapsed — are lines in a script that has no dictionary. Scholars who have attempted to decode it using comparison to other ancient languages have failed, which is itself unusual. Most old scripts share roots. This one shares nothing. What can be inferred from context and symbol position is something like a greeting, or a blessing, or a statement of purpose. One character appears repeatedly and the scholars have agreed, without certainty, that it means something in the neighbourhood of remain or endure or do not forget. The people who carved it were hoping to be remembered. The people who lived here after them did not know them well enough to know there was something to remember.',
    source:   'site',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-old-blood',
    title:    'The Faces of the Old Blood',
    category: 'The Arúvari',
    text:     'You meet them sometimes without knowing it. A particular line of the jaw. Eyes with a quality of light that seems slightly misaligned with the expression. Hair that goes silver early and stays silver rather than white. There are families throughout the kingdoms who carry these features — they have had them for as long as anyone can remember, and have no explanation for them. Some of these families have a particular way of pausing before they answer a direct question, as if listening for something. They are not listening for anything. They simply have a habit they did not choose and cannot trace. The word for what they are has been out of circulation for nine hundred years.',
    source:   'npc',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-kings-know',
    title:    'What the Kings Know',
    category: 'The Arúvari',
    text:     'A loremaster who spent forty years in the confidence of courts across the continent made, in his retirement, a single observation he declined to elaborate on: that the oldest families in every ruling house maintain a private tradition he had seen fragments of in three kingdoms and suspected existed in all ten. He described it as a ritual of acknowledgement — something spoken in private, never written, passed from ruler to successor at the moment of coronation. He said he had asked about it twice and both times been given a different subject to discuss with a speed and finality that answered the question more clearly than words could have. He died without saying more. His notes on the subject were not among his papers when his archive was opened.',
    source:   'loremaster',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-reed-song',
    title:    'A Song Without Words',
    category: 'The Arúvari',
    text:     'An old woman in a northern village will sometimes hum a tune that has no name and no words. She says her mother hummed it, and her mother\'s mother, back until you reach a grandmother no one can place a date to. It is a minor-key thing, the kind of melody that seems to want to keep going after it ends. Other musicians who have transcribed it find it does not resolve — the final note points back toward the beginning, as if whoever wrote it was not finished. Nobody wrote it. It was not written. It simply came with the people who came here, stripped of its words somewhere in the intervening centuries. What it said, when it had words, nobody knows. The tune remains. It sounds like something that should be answered.',
    source:   'bard',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-watchman',
    title:    'The Watchman of the Fallen Tower',
    category: 'The Arúvari',
    text:     'Ask around the rural settlements east of the ridge-line and you will eventually hear about the old man at the fallen tower. He is not always described the same way — some say very old, some say ancient, some say the word old does not quite cover it. He stands at the base of a collapsed watchtower and, when approached, addresses the visitor in a language they do not understand. He seems confused about the date, about who is speaking to him, about whether the tower is still standing. Locals say he has been there as long as the oldest among them can remember, and that their parents said the same. Nobody knows where he sleeps. Nobody has seen him eat. The general consensus is that he is harmless and should be left alone, and that this is an easier conclusion to reach if you do not look too closely at his eyes.',
    source:   'npc',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-childs-carving',
    title:    'A Child\'s Message in Stone',
    category: 'The Arúvari',
    text:     'Scratched into the flat face of a stone, at a height that could only have been reached by a child standing on their toes, are pictures rather than script. A circle with marks radiating outward — the sun. Two figures taller than the child figure at the centre. A third figure, small, arms outstretched. Then a line of smaller figures, many of them, more than the child could probably count. Then nothing. Then, below and to the right, carved with a different depth, as if done later: the child figure alone. No sun. No tall figures. Arms at its sides. Whatever this was meant to say, a child said it here, with the tools available, and then stopped. The stone does not record what came next. It does not need to.',
    source:   'site',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-crimson-night',
    title:    'The Crimson Night',
    category: 'The Arúvari',
    text:     'This fragment of etched bone — Arúvari work, identifiable by the jointing style of the carrying case that held it — was found sealed inside a hollow in a wall that had not been opened since the wall was built. The text is partial and the translation uncertain, but scholars agree on the broad shape of what it describes: a gathering, an invitation accepted in good faith, music and firelight and the smells of a great meal. And then a shift — a detail in the firelight, a configuration of the surrounding hills — and the understanding arriving, very suddenly, of what had actually been arranged. The text does not describe what followed in detail. The final lines are: We had taught them our names for joy. They knew, then, exactly what sound to silence.',
    source:   'relic',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-confession',
    title:    'The Confession',
    category: 'The Arúvari',
    text:     'A single folded document, discovered inside a false panel in a monastery library\'s oldest cabinet, written in a hand so cramped it suggests the author was afraid of the page. It describes, in the plain language of someone who has run out of the energy for circumspection, what the author saw in the valley that night — the valley the author calls by a name now lost, the valley the maps now call Crimson. The author was a newcomer. They had been told it was a celebration. They participated in the preparations. They did not, they write, understand what the preparations were for until the fires were lit in the specific pattern that they were lit. By then — the author writes this without punctuation, as if stopping to add it would break something — by then. The rest of the document consists of one repeated phrase in the old language, copied until the page ends. It has been translated as something like: forgive me. Or: I remember. The old language does not distinguish between these things.',
    source:   'library',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-insignia',
    title:    'An Ancient Mark',
    category: 'The Arúvari',
    text:     'The symbol appears in unexpected places once you start looking. Scratched into a boulder at a river crossing. Pressed into a clay firepit surround buried under six inches of topsoil. Worked into the decorative ironwork of a gate whose maker died three generations ago and learned the pattern, he told his apprentice, from a fragment found in a field. The symbol is a tree — stylised, a vertical line with balanced branches — but with the roots showing, spreading as wide as the canopy. Most symbols from this period show only what is above ground. This one insists the roots exist. Its makers simply believed the roots were worth drawing.',
    source:   'exploration',
    rarity:   'common',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-daily-life',
    title:    'How They Lived',
    category: 'The Arúvari',
    text:     'The Arúvari did not build cities the way the newcomers understood cities. They built outward — settlements that grew in rings around a central garden rather than walls around a keep. Every structure faced a courtyard. Every courtyard held water. Their architecture was designed around gathering, not defence, because in the long centuries of their civilisation, they had never needed to defend themselves from anything that thought the way they did. They had disputes. They had grief, art, debt, bad harvests, difficult winters. They also had something that cannot be reconstructed from ruins: a quality of daily life that their contemporaries described, in the few records that survive, as unhurried. They did not rush toward things.',
    source:   'library',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-stargazers',
    title:    'Readers of the Sky',
    category: 'The Arúvari',
    text:     'The Arúvari kept no written calendar in the way that later civilisations would. They tracked time by the stars. Not metaphorically — they had mapped the night sky with a precision that modern astronomers, looking at the star charts found etched into stone in the old ruin sites, describe as startling. Their settlements were positioned so that specific doorways aligned with specific stars at specific times of year. The entry to a gathering hall would let in a single shaft of light at the winter solstice. A fountain would fill with reflected starlight at the turn of certain seasons. They built their world around the idea that the sky and the ground were in conversation. They assumed the conversation was mutual.',
    source:   'site',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-the-silence',
    title:    'The Name They Gave the Silence',
    category: 'The Arúvari',
    text:     'The Arúvari did not worship gods in the form that later religions would recognise. Their spiritual practice centered on something they called, in translation, the Listening — the idea that the land was not inert, that it held the accumulated weight of everything that had happened on it, and that this weight could be felt if a person was quiet enough and patient enough to feel it. Their religious leaders were not priests but listeners. They did not speak on behalf of something holy. They reported what the quiet said. Later visitors to Arúvari ruin sites, across several centuries and with no knowledge of this practice, have independently described the same sensation in the same places: the feeling of being in a room where a conversation has just ended.',
    source:   'loremaster',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-why-betrayed',
    title:    'The Fear Behind the Feast',
    category: 'The Arúvari',
    text:     'The treaty was not broken because the newcomers were simply cruel, though cruelty was involved. It was broken because the newcomers\' leadership had done the arithmetic. The Arúvari held rights to land that contained resources — deep ore veins, river access, forests that would take generations to exhaust. Under the treaty, these could not be touched. The newcomers were growing. Their need was growing. Their patience was not. A council record — found in a private archive, never published — contains the phrase: the arrangement cannot hold and therefore it will not hold. It was written twelve years before the feast. The planning was not hurried.',
    source:   'library',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-survivors',
    title:    'Those Who Were Not There',
    category: 'The Arúvari',
    text:     'Not every Arúvari attended the grand feast. Children too young for such a gathering remained in the settlements. A few elders had been too unwell to travel. A small group had stayed behind to tend a late harvest on the high slopes. None of them understood, at first, why no one returned. The silence that came back from the valley in the days that followed was a different kind of silence from the one they knew. Some of these survivors scattered into the deep forest. Some were quietly absorbed into newcomer communities over the generations that followed, their origin unspoken. Their descendants are still here.',
    source:   'npc',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-erasure',
    title:    'Scrubbed From the Record',
    category: 'The Arúvari',
    text:     'Within a generation of the night in the valley, the official histories of every settlement in the region had been rewritten. Not clumsily — carefully. The Arúvari were not described as having been killed. They were described as having left. Then, in the next revision, as having been here only briefly. Then, in the revision after that, as a rumour or a legend. The cartographers were given new maps. The old maps were recalled. Monks who had copied Arúvari texts were quietly reassigned to distant postings. The process was so thorough that within fifty years, a child born in any of the new settlements could grow up without ever hearing a word that acknowledged the people who had built the walls their home was built into.',
    source:   'loremaster',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-voice-silenced',
    title:    'The Voice That Was Not Heard',
    category: 'The Arúvari',
    text:     'A name appears in several unrelated documents from the period: Halveth Morran. Described as a leader among the newcomers, a man known for treating with the Arúvari openly and in good faith. The documents agree that he objected to what was being planned, loudly, and in front of witnesses. They do not agree on what happened to him. One account says he fell ill. Another says he left for the coast. A third simply stops mentioning him, mid-document, in a way that suggests the writer was told to stop. His name does not appear in any record after the year of the feast. He has no grave that anyone has found. He has no statue. He is a name in documents that were not supposed to survive.',
    source:   'library',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-children-escaped',
    title:    'The Children of the Feast',
    category: 'The Arúvari',
    text:     'A fragment of personal correspondence — not official, not archived, found folded inside a much later book as a bookmark — describes an event its author clearly did not know how to categorise. In the weeks after the valley, a small group of Arúvari children appeared at the edge of a newcomer settlement. No adults with them. None of the children would speak. The correspondent describes feeding them, sheltering them, and then being visited by two men who did not introduce themselves, who spoke quietly with the settlement\'s leader, and who left with the children an hour later. The correspondent writes: I do not know where they were taken. I did not ask. I have thought about asking many times since.',
    source:   'exploration',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-land-mourns',
    title:    'The Land Has Not Forgotten',
    category: 'The Arúvari',
    text:     'There are places on this continent where the ground feels different under your feet. Not dangerous. Not wrong, exactly. Just heavy, in the way that a room feels heavy when something important has just happened in it and the people involved have left. Scholars who have surveyed these sites find nothing physically unusual. The soil is ordinary. The rock is ordinary. And yet travellers report, across centuries and with no coordination, the same experience: standing in certain spots and feeling, very clearly, that something is listening. The Arúvari believed the land held memory. The land, whatever it believes, has not given up the habit.',
    source:   'exploration',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-the-valley-now',
    title:    'What the Crimson Valley Holds',
    category: 'The Arúvari',
    text:     'The valley is beautiful, which is the first thing people say when they describe it, and which seems wrong given what has been said about it. Green slopes. Good soil. A river that runs clean and cold year-round. The second thing people say is that birds do not sing there. Not that they are absent — they can be seen landing in the trees. They simply do not sing. The third thing, said more quietly, is that the wildflowers that grow along the valley floor are a shade of red that has no good explanation given the soil composition, and that they grow most thickly in the centre of the valley, in an irregular pattern that, from the high slopes, resembles a great many people standing close together.',
    source:   'exploration',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-cities-beneath',
    title:    'Cities Beneath Cities',
    category: 'The Arúvari',
    text:     'When the foundations for the new market hall in Ealdenford were being dug, the workers stopped at twelve feet. Below that depth, they had found older walls. Straight walls, finely jointed, built from a different stone than anything quarried locally. The project architect ordered the workers to continue around the older structure. The market hall was built on a foundation that, as of its construction, had been standing for roughly nine hundred years. The architect\'s report notes the older structure but does not speculate on its origin. The report is available in the city records. Nobody has excavated what remains of the lower level. The request has been submitted four times. It has been declined each time without stated reason.',
    source:   'rumor',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-secret-keepers',
    title:    'Keepers of the Ember',
    category: 'The Arúvari',
    text:     'There are people in the world who know. Not many. A network that is not quite a network — no organisation, no meetings, no formal membership. Just individuals, scattered across the kingdoms, who hold the same knowledge through different paths. A descendant who was told by a grandparent who was told by a grandparent. A monk who found a sealed text and understood it. A cartographer who compared old maps and could not make the geography work any other way. They do not speak to each other. They do not have a name for what they are. They have only the knowledge, and the habit — passed down as quietly as a folk tune without words — of not repeating it where it can be heard.',
    source:   'npc',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-last-record',
    title:    'The Last Thing Written',
    category: 'The Arúvari',
    text:     'In a sealed chamber beneath a ruin in the eastern hills — opened by a cave-in, not by excavation — scholars found a single stone tablet, intact. The translation took eleven years and remains disputed at several points. What is agreed: it is a list of names. Hundreds of names. Each name is accompanied by a symbol that appears to indicate a relationship — parent, child, sibling, companion. The list is organised not alphabetically or by clan but by something else, something the translation committee could not determine. The list ends mid-name. The last symbol — the one indicating the relationship of the final entry — is a mark that appears nowhere else in the Arúvari script. Its meaning has not been determined. One member of the committee said, in her private correspondence, that she did not think it needed translating.',
    source:   'site',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-artifact-found',
    title:    'A Thing That Should Not Exist',
    category: 'The Arúvari',
    text:     'A craftsman in a border town brought an object to a travelling scholar — a small piece of worked metal, handed down through his family so long that the original finder was lost to memory. The scholar recognised the jointing style immediately. Arúvari work. The object is a clasp — the kind that fastens a cloak at the shoulder. Small, precisely made, with a faint engraving of the rooted-tree symbol on its face. It is not special. It is not magical. It is not valuable by any measure a merchant would use. What it is, is ordinary. An ordinary everyday object, made by a person for daily use, with the expectation that it would be used for many years. It was. Then it was lost. Then it was found again, in a world that had spent nine hundred years pretending its maker had never existed.',
    source:   'relic',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'aruvari-aelindra-burial',
    title:    'Where She Rests',
    category: 'The Arúvari',
    text:     'The grave is marked but not named. A flat stone set flush with the earth, a sleeping-star carved into its face — the Arúvari symbol for a life taken before its time. The stone is different from everything around it: deliberately placed, oriented east, kept inexplicably clear of the growth that has swallowed the surrounding ruins. At the stone\'s base, flush against it, is a second smaller stone with a seam along its edge. Whatever was placed inside was meant to be kept. Whoever placed it believed this ground would eventually be found again.',
    source:   'site',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  // ── THE QUIN ───────────────────────────────────────────────────────────────
  // The true name and nature of the Arúvari people. Discovered in fragments —
  // each entry deepens the revelation. Tone: ancient, elegiac, dangerous to know.

  {
    id:       'quin-the-name',
    title:    'The Name They Gave Themselves',
    category: 'The Arúvari',
    text:     'The word appears in the oldest stratum of Arúvari inscription — the layer beneath the layer that scholars have been studying. It is not a place name or a title or a concept. It is, as best anyone can determine, what they called themselves: Quin. One syllable. It appears on foundation stones and grave markers and the insides of doorways, always in the position a people uses for their own name. The records that came after — the ones written by those who arrived later — do not use it. They use no name for the people they found here. The absence of a name for a conquered people is not unusual. What is unusual is that the name existed and was simply stopped.',
    source:   'relic',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'quin-horns',
    title:    'The Mark They Carried',
    category: 'The Arúvari',
    text:     'No living Quin has ever been formally documented. What has been documented: a particular kind of skeletal remains found in the oldest ruin sites, humanoid in proportion but with a growth pattern at the skull that no physician\'s anatomy covers. The bone is dense, curved, emerging from the temples in a gentle arc. Not a deformity — the structure is too regular, too bilateral, too clearly healthy. A feature, not a flaw. The remains found in settlements after the period of the feast do not share this structure. The shape of a people can be filed away. The memory of their shape, apparently, can be buried with them.',
    source:   'site',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'quin-culture',
    title:    'A People Who Built No Forges',
    category: 'The Arúvari',
    text:     'The absence of a smithing tradition in the Quin ruins is not an oversight of the archaeological record — the record is simply empty where smithing should be. No forge sites. No slag heaps. No tools that required iron to produce. The Quin shaped stone beautifully. They worked bone, antler, wood, and shell into objects of considerable precision. They did not mine metal ore. They did not smelt. In a civilisation that lasted, by most estimates, several thousand years, they never produced a sword. Scholars who have noted this tend to dismiss it as primitive, which is easier than the alternative conclusion: that they had no use for swords because they had never needed one.',
    source:   'library',
    rarity:   'uncommon',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'quin-and-mana',
    title:    'Older Than the Schools',
    category: 'The Arúvari',
    text:     'The six schools of arcane study were codified roughly four hundred years ago. They are not, however, four hundred years old. They are an attempt to systematise something that existed long before the schools did — something that certain people access without training. Scholars of the arcane have occasionally noted, in private correspondence, that the quality of elven magic is not quite the same as human-learned magic. It does not feel constructed. It feels inherited. One mage, in her retirement, wrote that speaking to an elven mage about the technical mechanics of their casting was like asking a river to explain why it flows downhill. She speculated, without evidence she would stand behind publicly, that elvenkind had not learned magic at all — that they were descended from people for whom magic was simply the way things were. She did not name those people. She had clearly guessed the name.',
    source:   'loremaster',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'quin-elven-lineage',
    title:    'What the Elves Will Not Say',
    category: 'The Arúvari',
    text:     'Elven scholars are, across every kingdom and tradition, unwilling to discuss the origins of the elven lineage. This is itself notable. Elves are not, as a rule, reluctant scholars — they engage with uncomfortable subjects with a thoroughness that humans often find unsettling. On this one question, the response is consistently the same: a pause that lasts slightly too long, followed by a change of subject executed with great skill. Two scholars who pushed the point reported being politely shown out. One reports that the elf she questioned looked, for just a moment, grief-stricken. Then the expression was gone. The oldest elven word for ancestor translates not as one who came before, but as one who remained.',
    source:   'loremaster',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'quin-hidden-among-us',
    title:    'Those Who Filed Their Horns',
    category: 'The Arúvari',
    text:     'It is a surgical procedure, done young, when the bone is still soft enough to shape. The scarring heals. The hair covers the rest. A child raised this way would grow up not knowing what their parents had done to them, if their parents chose not to explain. Some chose not to explain. The evidence is in certain elven communities — a particular bone density at the temple, visible only on close examination or in old age when the filed edge sometimes shows through thinning skin. The elven physicians who know what they are looking at say nothing. There are families in every elven settlement in every kingdom who are not quite what they appear to be. They have been not quite what they appear to be for eight or nine centuries. The habit of hiding has had a long time to become ordinary.',
    source:   'npc',
    rarity:   'rare',
    kingdoms: [],
    biomes:   [],
  },

  {
    id:       'quin-exiles',
    title:    'The Deep Places',
    category: 'The Arúvari',
    text:     'The parts of the continent that remain untouched are not many, but they exist: old-growth forest where the canopy has not been opened in recorded memory, cave systems beneath the mountain roots that no survey has mapped, river-valley tangles in the deep interior that appear on no merchant\'s route. Hunters who range into these regions return with accounts that tend to share certain details. A sense of being watched that is never confirmed. Paths through old growth that appear well-maintained but show no signs of tools. A fire seen from distance on a hillside that is cold and out by the time the hunter reaches the site. Whether these are Quin or simply the movements of wildlife in unfamiliar dark, no one who has investigated has been able to say with certainty. Several investigators have not come back to say anything at all.',
    source:   'exploration',
    rarity:   'rare',
    kingdoms: [],
    biomes:   ['Forest', 'Ancient Forest', 'Mountains'],
  },

  // ── ADD MORE ENTRIES BELOW ─────────────────────────────────────────────────
  //
  // Template:
  //
  // {
  //   id:       'unique-kebab-id',
  //   title:    'Entry Title',
  //   category: 'History',           // see LORE_CATEGORIES above
  //   text:     'Full lore text.',
  //   source:   'library',           // see source values above
  //   rarity:   'common',            // 'common' | 'uncommon' | 'rare'
  //   kingdoms: [],                  // e.g. ['Ardrenhold', 'Brythwen']
  //   biomes:   [],                  // e.g. ['Forest', 'Mountains']
  // },

];
