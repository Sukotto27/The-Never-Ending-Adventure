// questGenerator.js — procedural quest generation engine
// Provides QuestGenerator global with generateQuest, generateBulletinQuests,
// generateNpcQuest, and generateSeedQuest. All builders return complete quest
// objects matching the quests.js schema so they can be pushed into quests[]
// and started via startQuest().

const QuestGenerator = (() => {
    const pick  = a => a[Math.floor(Math.random() * a.length)];
    const pickN = (a, n) => [...a].sort(() => Math.random() - 0.5).slice(0, Math.min(n, a.length));
    const ri    = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
    let _uid    = 0;
    const uid   = tag => `gen_${tag}_${Date.now()}_${_uid++}`;

    // ── Name pools ─────────────────────────────────────────────────────────────
    const NAMES = {
        Human:    {
            m: ['Aldric','Bram','Cass','Dorin','Edric','Falco','Gareth','Hadwin','Ivan','Jorin','Keld','Lucan','Maro','Nils','Oswin','Pell','Ronan','Rolf','Soren','Tomas','Ulf','Vance','Warin','Yorick','Zane'],
            f: ['Aelith','Brynn','Calla','Dara','Elara','Fiora','Gwen','Hessa','Ilara','Jenna','Kira','Lysa','Mira','Nessa','Oryn','Petra','Ryn','Sable','Tara','Una','Vela','Wren','Ysa','Zola']
        },
        Elf:      {
            m: ['Aerindel','Caladwen','Elarion','Faevyr','Galadrin','Ithrandel','Luinor','Maevin','Naeris','Orindel','Phaelin','Rithiel','Sylavar','Thalindor','Vaenir'],
            f: ['Aelindra','Caliveth','Eiliveth','Faerith','Galathil','Isilwen','Luthindel','Miriaven','Naelyth','Orithiel','Sylvara','Thaelindra','Vaelith']
        },
        Dwarf:    {
            m: ['Baldrek','Dorgin','Fargrim','Gorash','Haldor','Kardak','Mordak','Nordak','Orgrim','Thordak','Ulfgar','Vardin'],
            f: ['Astrid','Bryndis','Dagny','Finna','Gunhild','Helga','Ingrid','Kara','Ragna','Sigrid','Tofa','Yrsa']
        },
        Orc:      {
            m: ['Borgak','Darak','Grak','Hurk','Krug','Marak','Nurg','Rolk','Thruk','Urgak','Vrak','Zorg'],
            f: ['Barga','Dura','Gasha','Hurga','Kala','Marga','Nurga','Ruka','Thuka','Urga','Varka','Zora']
        },
        Halfling: {
            m: ['Barron','Corbin','Finch','Jasper','Merlo','Pip','Rook','Sylvan','Tobias','Wilm'],
            f: ['Bess','Daisy','Fern','Holly','Ivy','Lila','Mira','Nell','Poppy','Rose']
        },
        Goblin:   {
            m: ['Brix','Flix','Grix','Klax','Nix','Plix','Rix','Snix','Trix','Zix'],
            f: ['Bixa','Dixa','Grixa','Kixa','Nixa','Pixa','Rixa','Tixa','Zixa']
        }
    };

    function randomName(race) {
        const pool = NAMES[race] || NAMES.Human;
        return pick(Math.random() < 0.5 ? pool.m : pool.f);
    }

    // ── World fragments ────────────────────────────────────────────────────────
    const CRIMES = [
        'robbing travelers on the road',
        'assaulting merchants near the market gate',
        'terrorizing a nearby hamlet',
        'burning crops and stealing livestock',
        'murdering a local merchant',
        'kidnapping a village elder'
    ];

    const ARTIFACTS = [
        'the Sunstone Amulet','the Ashen Crown','a Shattered Runeblade',
        'the Orb of Forgotten Tides','a Sealed Grimoire','the Obsidian Eye',
        'a Compass That Points to Danger','the Warmlight Lantern',
        'the Skull of the First King','a Vial of Moonwater'
    ];

    const DOCUMENTS = [
        'a sealed letter','an old map','a torn journal page',
        'a writ of passage','a coded message','a bounty contract','a deed of ownership'
    ];

    const REAGENT_SETS = [
        ['moonbloom petals','iron bark shavings','crystallized tears'],
        ['dried wolfsbane','cave-grown moss','powdered bone'],
        ['fireblossom extract','saltstone dust','serpent scale'],
        ['thornroot bark','starfall pollen','marrow oil']
    ];

    const MISC_ITEMS = [
        'a family heirloom','a signet ring','a merchant\'s ledger',
        'a child\'s doll','a rare gemstone','a holy relic','an enchanted trinket',
        'an ivory figurine','a pocket watch','a grandfather\'s sword'
    ];

    const CREATURES = {
        Forest:    ['a dire wolf pack','a corrupted treant','a harpy nest','a giant spider brood','a venomous serpent'],
        Mountain:  ['a wyvern','a cave troll','a stone giant','a harpy','a basilisk'],
        Plains:    ['a pack of rabid boars','a bandit warband','a hippogriff','a manticore','giant eagles'],
        Swamp:     ['a hydra','a bog witch and her thralls','a giant serpent','lizardfolk raiders','a will-o\'-wisp lure'],
        Coast:     ['a sea serpent','a kraken spawn','a band of pirates','a harpy flock','a giant crab'],
        Desert:    ['a sand worm','a scorpion queen','a lamia','a rampaging djinn','a stone troll'],
        Tundra:    ['a frost giant','a pack of winter wolves','a yeti','a remorhaz','a white dragon wyrmling'],
        Cave:      ['a gelatinous horror','a vampire bat colony','a mimic nest','an earth elemental','a deep troll'],
        default:   ['a dangerous predator','a gang of outlaws','a corrupted beast','a pack of monsters','an unknown threat']
    };

    const LOCATIONS_GENERIC = [
        'the old mill','the abandoned farmstead','the crossroads shrine',
        'the crumbling watchtower','the dark forest hollow','the shallow cave near town',
        'the dried riverbed','the old cemetery','the ruined chapel','the collapsed mine entrance',
        'the fog-covered lake','the burned-out barn','the ancient standing stones',
        'the moss-covered bridge','the forgotten well'
    ];

    const PHENOMENA = [
        'strange lights appearing at night',
        'livestock vanishing without a trace',
        'a persistent unnatural fog that won\'t lift',
        'whispers heard by everyone who passes through',
        'objects found moved by invisible hands',
        'crops dying in a perfect circle overnight',
        'ice forming on a midsummer night',
        'a foul smell that appears and vanishes without cause'
    ];

    const LEGENDS = [
        'the Tomb of the Sunken King','the Ghost Road','the Crimson Harvest of Old',
        'the Wandering Library','the Last Stand at Ironmere Pass',
        'the Pact of Three Kings','the Dragon\'s Dowry','the Weeping Stone'
    ];

    const MISSING_REASONS = [
        'went out to gather herbs and never returned',
        'left to investigate strange lights and vanished',
        'was last seen heading toward the ruins to the east',
        'didn\'t return from the market three days ago',
        'set off on a journey and hasn\'t sent word since'
    ];

    const HELP_PROBLEMS = [
        'their home is crumbling and they have no coin to repair it',
        'they are sick and cannot afford a healer',
        'they\'re being threatened by local thugs who want their land',
        'their children are hungry and the harvest failed this year',
        'they are trapped in a dispute they cannot resolve alone',
        'they\'ve been falsely accused of a crime and need evidence cleared'
    ];

    const FACTIONS = [
        'the Merchant\'s Guild','the Temple of the Eternal Flame',
        'the Ranger\'s Brotherhood','the Scholar\'s Circle',
        'the Iron Guard','the Wanderer\'s Society','the Harbormaster\'s Office'
    ];

    const PURPOSES = [
        'a potion of healing','a protective ward','a ritual of cleansing',
        'a medicinal salve','an alchemical mixture','a remedy for the sick'
    ];

    // ── Reward scaling ─────────────────────────────────────────────────────────
    function scaleRewards(tier, lvl) {
        const mult = Math.max(1, 1 + ((lvl || 1) - 1) * 0.2);
        const base = { 1:[10,50], 2:[25,100], 3:[50,200], 4:[100,350], 5:[200,600] }[tier] || [25,100];
        return { gold: Math.floor(base[0] * mult), experience: Math.floor(base[1] * mult) };
    }

    // ── Profession → quest categories ──────────────────────────────────────────
    const PROF_CATS = {
        Farmer:     ['Ingredient retrieval','Helping those in need','Missing persons'],
        Hunter:     ['Beast hunting','Beast sightings','Bounty hunting'],
        Blacksmith: ['Ingredient retrieval','Lost/stolen item retrieval','Ancient artifacts'],
        Assassin:   ['Bounty hunting','Assassination attempts','Murders'],
        Priest:     ['Helping those in need','Mysteries/Unexplainable Events','Old legends/folk tales'],
        Wanderer:   ['Exploration','Exploring ancient ruins','Investigating rumors'],
        Merchant:   ['Lost/stolen item retrieval','Diplomacy','Ingredient retrieval'],
        Knight:     ['Bounty hunting','Attacks/Assaults/Sieges','Diplomacy'],
        Scholar:    ['Exploring ancient ruins','Ancient artifacts','Old legends/folk tales'],
        Noble:      ['Diplomacy','Assassination attempts','Feuds']
    };

    // ── Seed keyword → category ────────────────────────────────────────────────
    const SEED_KEYWORDS = [
        { words: ['bandit','rob','outlaw','thief','crime','wanted'],          cat: 'Bounty hunting' },
        { words: ['beast','creature','monster','wolf','serpent','wyvern'],    cat: 'Beast hunting' },
        { words: ['smoke','fire','attack','siege','burning','assault'],       cat: 'Attacks/Assaults/Sieges' },
        { words: ['body','corpse','murder','dead','killed','victim'],         cat: 'Murders' },
        { words: ['ruin','ancient','inscription','relic','artifact','old'],   cat: 'Exploring ancient ruins' },
        { words: ['glowing','magic','strange','mystical','phenomenon'],       cat: 'Mysteries/Unexplainable Events' },
        { words: ['cry','help','missing','lost','traveler','injured'],        cat: 'Missing persons' },
        { words: ['tracks','sighting','spotted','seen near','large creature'],cat: 'Beast sightings' }
    ];

    function inferCategory(seedText) {
        const lower = (seedText || '').toLowerCase();
        for (const { words, cat } of SEED_KEYWORDS) {
            if (words.some(w => lower.includes(w))) return cat;
        }
        return pick(['Bounty hunting','Beast hunting','Missing persons','Mysteries/Unexplainable Events']);
    }

    // ── Quest builders ─────────────────────────────────────────────────────────

    function buildBountyQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName   = npcGiver?.name || randomName(npcGiver?.race);
        const targetName  = randomName(pick(['Human','Orc','Goblin']));
        const crime       = pick(CRIMES);
        const loc         = pick(LOCATIONS_GENERIC);
        const r           = scaleRewards(2, lvl);
        const id          = uid('bounty');
        return {
            id, name: `Wanted: ${targetName}`,
            type: 'side', categories: ['Bounty hunting'],
            description: `${giverName} needs someone to deal with ${targetName}, who has been ${crime}. They were last spotted near ${loc}.`,
            kingdom: kingdom || null,
            acquisition: {
                description: source === 'bulletin' ? `Posted on the settlement bulletin board by ${giverName}.` : `${giverName} approached you directly.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Track ${targetName} to ${loc}`, type: 'travel', target: { area: loc, hint: `Leads on ${targetName}` }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Defeat or capture ${targetName}`, type: 'defeat', target: { npc: targetName }, completion: { type: 'ai_judgment' } }
            ],
            rewards: { ...r, skills: { Combat: 2 }, items: [], special: [] }
        };
    }

    function buildItemRetrievalQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName = npcGiver?.name || randomName(npcGiver?.race);
        const item      = pick(MISC_ITEMS);
        const loc       = pick(LOCATIONS_GENERIC);
        const r         = scaleRewards(1, lvl);
        const id        = uid('retrieval');
        return {
            id, name: `Recover ${item.replace(/^an?\s/i,'the ')}`,
            type: 'side', categories: ['Lost/stolen item retrieval'],
            description: `${giverName} has lost ${item} and believes it ended up near ${loc}. Recover it and bring it back.`,
            kingdom: kingdom || null,
            acquisition: {
                description: source === 'bulletin' ? `Posted on the bulletin board.` : `${giverName} asked you for help.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Search for ${item} near ${loc}`, type: 'search', target: { area: loc, hint: item }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Return ${item} to ${giverName}`, type: 'deliver', target: { npc: giverName, item }, completion: { type: 'delivered' } }
            ],
            rewards: { ...r, skills: { Persuasion: 1 }, items: [], special: [] }
        };
    }

    function buildIngredientQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName = npcGiver?.name || randomName(npcGiver?.race);
        const reagents  = pickN(pick(REAGENT_SETS), ri(2, 3));
        const purpose   = pick(PURPOSES);
        const r         = scaleRewards(1, lvl);
        const id        = uid('ingredient');
        const objList   = reagents.map((item, i) => ({
            id: `${id}_o${i+1}`, text: `Collect ${item}`, type: 'acquire',
            target: { item, qty: 1 }, completion: { type: 'hasItem', item, qty: 1 }
        }));
        objList.push({
            id: `${id}_o${reagents.length+1}`, text: `Deliver ingredients to ${giverName}`, type: 'deliver',
            target: { npc: giverName }, completion: { type: 'delivered' }
        });
        return {
            id, name: `Gather Ingredients for ${giverName}`,
            type: 'side', categories: ['Ingredient retrieval'],
            description: `${giverName} needs ${reagents.join(', ')} to craft ${purpose}. Gather them from the surrounding lands.`,
            kingdom: kingdom || null,
            acquisition: {
                description: `${giverName} needs help gathering rare materials.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: objList,
            rewards: { ...r, skills: { Herbalism: 2, Foraging: 1 }, items: [{ displayName: purpose, description: `Crafted by ${giverName} as thanks.`, rarity: 'common', itemType: 'potion', consumable: true, wearable: false, weight: 0.5, value: r.gold }], special: [] }
        };
    }

    function buildHelpingQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName = npcGiver?.name || randomName(npcGiver?.race);
        const problem   = pick(HELP_PROBLEMS);
        const r         = scaleRewards(1, lvl);
        const id        = uid('help');
        return {
            id, name: `Help ${giverName}`,
            type: 'side', categories: ['Helping those in need'],
            description: `${giverName} is in a difficult situation — ${problem}. They have nowhere else to turn.`,
            kingdom: kingdom || null,
            acquisition: {
                description: `${giverName} approached you with a desperate look.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Hear ${giverName} out`, type: 'talk', target: { npc: giverName }, completion: { type: 'talkedTo', npc: giverName } },
                { id: `${id}_o2`, text: `Resolve the situation`, type: 'complete', target: { hint: problem }, completion: { type: 'ai_judgment' } }
            ],
            rewards: { ...r, skills: { Persuasion: 1 }, items: [], special: [] }
        };
    }

    function buildBeastHuntingQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName = npcGiver?.name || randomName(npcGiver?.race);
        const pool      = CREATURES[biome] || CREATURES.default;
        const creature  = pick(pool);
        const loc       = pick(LOCATIONS_GENERIC);
        const r         = scaleRewards(3, lvl);
        const id        = uid('beast');
        const questName = creature.match(/^(a|an) /i)
            ? `Hunt ${creature}`
            : `Hunt the ${creature}`;
        return {
            id, name: questName,
            type: 'side', categories: ['Beast hunting'],
            description: `${giverName} reports that ${creature} has been terrorizing the area near ${loc}. Hunt it down before more lives are lost.`,
            kingdom: kingdom || null,
            acquisition: {
                description: source === 'bulletin' ? `Urgent posting on the bulletin board — reward offered.` : `${giverName} pleaded for a capable hunter.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Track the creature to ${loc}`, type: 'travel', target: { area: loc, hint: `Signs of ${creature}` }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Defeat ${creature}`, type: 'defeat', target: { npc: creature }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o3`, text: `Report back to ${giverName}`, type: 'talk', target: { npc: giverName }, completion: { type: 'talkedTo', npc: giverName } }
            ],
            rewards: { ...r, skills: { Combat: 3, Tracking: 2 }, items: [{ displayName: 'Hunter\'s Trophy', description: `A trophy from ${creature} — proof of your kill.`, rarity: 'uncommon', itemType: 'misc', consumable: false, wearable: false, weight: 1, value: ri(20,60) }], special: [] }
        };
    }

    function buildBeastSightingQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName = npcGiver?.name || randomName(npcGiver?.race);
        const pool      = CREATURES[biome] || CREATURES.default;
        const creature  = pick(pool);
        const loc       = pick(LOCATIONS_GENERIC);
        const r         = scaleRewards(2, lvl);
        const id        = uid('sighting');
        return {
            id, name: `Investigate the Sighting`,
            type: 'side', categories: ['Beast sightings'],
            description: `${giverName} spotted what appeared to be ${creature} near ${loc}. Investigate before the situation gets out of hand.`,
            kingdom: kingdom || null,
            acquisition: {
                description: `${giverName} came to you with a frightened expression.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Investigate the sighting near ${loc}`, type: 'search', target: { area: loc, hint: `Signs of ${creature}` }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Assess the threat and act accordingly`, type: 'complete', target: { hint: 'The creature may need to be driven off, killed, or the sighting may be a misidentification.' }, completion: { type: 'ai_judgment' } }
            ],
            rewards: { ...r, skills: { Tracking: 2 }, items: [], special: [] }
        };
    }

    function buildMissingPersonQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName   = npcGiver?.name || randomName(npcGiver?.race);
        const missingName = randomName();
        const reason      = pick(MISSING_REASONS);
        const loc         = pick(LOCATIONS_GENERIC);
        const r           = scaleRewards(2, lvl);
        const id          = uid('missing');
        return {
            id, name: `Find ${missingName}`,
            type: 'side', categories: ['Missing persons'],
            description: `${giverName} is frantic — ${missingName} ${reason}. Last known direction was toward ${loc}.`,
            kingdom: kingdom || null,
            acquisition: {
                description: source === 'bulletin' ? `A desperate flyer on the bulletin board.` : `${giverName} stopped you with panic in their eyes.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Search for ${missingName} near ${loc}`, type: 'search', target: { area: loc, npc: missingName }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Ensure ${missingName}\'s safety`, type: 'complete', target: { hint: `Escort ${missingName} back or discover their fate.` }, completion: { type: 'ai_judgment' } }
            ],
            rewards: { ...r, skills: { Tracking: 2, Persuasion: 1 }, items: [], special: [] }
        };
    }

    function buildDiplomacyQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName     = npcGiver?.name || randomName(npcGiver?.race);
        const recipientName = randomName();
        const doc           = pick(DOCUMENTS);
        const faction       = pick(FACTIONS);
        const r             = scaleRewards(2, lvl);
        const id            = uid('diplomacy');
        const itemName      = doc.replace(/^an?\s/i,'').replace(/^the\s/i,'');
        return {
            id, name: `Deliver ${doc} to ${recipientName}`,
            type: 'side', categories: ['Diplomacy'],
            description: `${giverName} of ${faction} needs ${doc} delivered to ${recipientName} with all haste. Discretion is required.`,
            kingdom: kingdom || null,
            acquisition: {
                description: `${giverName} entrusted you with a sensitive task.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Receive ${doc} from ${giverName}`, type: 'talk', target: { npc: giverName }, completion: { type: 'talkedTo', npc: giverName }, onComplete: { giveItem: { name: itemName, quantity: 1, description: `From ${giverName}. Deliver to ${recipientName}.`, category: 'misc' } } },
                { id: `${id}_o2`, text: `Deliver ${doc} to ${recipientName}`, type: 'deliver', target: { npc: recipientName, item: doc }, completion: { type: 'delivered' } },
                { id: `${id}_o3`, text: `Return to ${giverName} with word of delivery`, type: 'talk', target: { npc: giverName }, completion: { type: 'talkedTo', npc: giverName } }
            ],
            rewards: { ...r, skills: { Persuasion: 3 }, items: [], special: [{ type: 'reputation', kingdom: kingdom || 'Unknown', amount: 5, description: `Standing improves with ${faction}.` }] }
        };
    }

    function buildExplorationQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName = npcGiver?.name || randomName(npcGiver?.race);
        const count     = ri(2, 3);
        const waypoints = pickN(LOCATIONS_GENERIC, count);
        const r         = scaleRewards(2, lvl);
        const id        = uid('explore');
        const objs      = waypoints.map((wp, i) => ({
            id: `${id}_o${i+1}`, text: `Scout ${wp}`, type: 'travel',
            target: { area: wp }, completion: { type: 'ai_judgment' }
        }));
        objs.push({
            id: `${id}_o${count+1}`, text: `Report findings to ${giverName}`, type: 'talk',
            target: { npc: giverName }, completion: { type: 'talkedTo', npc: giverName }
        });
        return {
            id, name: `Map the ${biome || 'Surrounding Lands'}`,
            type: 'side', categories: ['Exploration'],
            description: `${giverName} needs someone to scout and document unexplored areas. Visit each marked location and report back with your findings.`,
            kingdom: kingdom || null,
            acquisition: {
                description: `${giverName} contracted you for a scouting job.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: objs,
            rewards: { ...r, skills: { Navigation: 3, Survival: 1 }, items: [{ displayName: 'Scout\'s Map', description: 'A hand-drawn map of the scouted region.', rarity: 'common', itemType: 'misc', consumable: false, wearable: false, weight: 0.2, value: ri(15,40) }], special: [] }
        };
    }

    function buildMysteryQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName  = npcGiver?.name || randomName(npcGiver?.race);
        const phenomenon = pick(PHENOMENA);
        const loc        = pick(LOCATIONS_GENERIC);
        const r          = scaleRewards(2, lvl);
        const id         = uid('mystery');
        const titleLoc   = loc.replace(/^(the|an?)\s/i,'').replace(/\b\w/g, c => c.toUpperCase());
        return {
            id, name: `The Mystery at ${titleLoc}`,
            type: 'side', categories: ['Mysteries/Unexplainable Events'],
            description: `${giverName} reports ${phenomenon} near ${loc}. Nobody can explain it, and fear is spreading. Someone needs to investigate.`,
            kingdom: kingdom || null,
            acquisition: {
                description: source === 'bulletin' ? `Posted urgently on the bulletin board.` : `${giverName} came to you with a worried expression.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Travel to ${loc}`, type: 'travel', target: { area: loc }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Investigate the cause of ${phenomenon}`, type: 'search', target: { area: loc, hint: phenomenon }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o3`, text: `Resolve the situation`, type: 'complete', target: { hint: 'The mystery may have a mundane or supernatural explanation.' }, completion: { type: 'ai_judgment' } }
            ],
            rewards: { ...r, skills: { Arcana: 2, Investigation: 2 }, items: [], special: [] }
        };
    }

    function buildMurderQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName   = npcGiver?.name || randomName(npcGiver?.race);
        const victimName  = randomName();
        const witnessName = randomName();
        const loc         = pick(LOCATIONS_GENERIC);
        const r           = scaleRewards(3, lvl);
        const id          = uid('murder');
        return {
            id, name: `Who Killed ${victimName}?`,
            type: 'side', categories: ['Murders'],
            description: `The body of ${victimName} was found near ${loc}. ${giverName} is offering a reward to whoever can identify and bring the killer to justice.`,
            kingdom: kingdom || null,
            acquisition: {
                description: source === 'bulletin' ? `An official notice posted at the board — reward offered.` : `${giverName} sought your particular skills.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Examine the crime scene near ${loc}`, type: 'search', target: { area: loc, hint: 'Evidence of the crime' }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Question ${witnessName}, a nearby witness`, type: 'talk', target: { npc: witnessName }, completion: { type: 'talkedTo', npc: witnessName } },
                { id: `${id}_o3`, text: `Identify and confront the killer`, type: 'complete', target: { hint: 'Follow the evidence to its conclusion.' }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o4`, text: `Report to ${giverName}`, type: 'talk', target: { npc: giverName }, completion: { type: 'talkedTo', npc: giverName } }
            ],
            rewards: { ...r, skills: { Investigation: 3, Persuasion: 2 }, items: [], special: [{ type: 'reputation', kingdom: kingdom || 'Unknown', amount: 10, description: 'Solving a murder wins respect from the community.' }] }
        };
    }

    function buildRuinsQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName = npcGiver?.name || randomName(npcGiver?.race);
        const artifact  = pick(ARTIFACTS);
        const loc       = pick(LOCATIONS_GENERIC);
        const r         = scaleRewards(3, lvl);
        const id        = uid('ruins');
        return {
            id, name: `The Ruins Near ${loc.replace(/^(the|an?)\s/i,'').replace(/\b\w/g, c => c.toUpperCase())}`,
            type: 'side', categories: ['Exploring ancient ruins'],
            description: `${giverName} believes ${artifact} may be hidden in ruins near ${loc}. They need someone brave enough to explore it — and resourceful enough to survive.`,
            kingdom: kingdom || null,
            acquisition: {
                description: `${giverName} hired you for a dangerous expedition.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Travel to the ruins near ${loc}`, type: 'travel', target: { area: loc }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Search the ruins for ${artifact}`, type: 'search', target: { area: loc, item: artifact, hint: 'The artifact may be guarded or hidden deep within.' }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o3`, text: `Return ${artifact} to ${giverName}`, type: 'deliver', target: { npc: giverName, item: artifact }, completion: { type: 'delivered' } }
            ],
            rewards: { ...r, skills: { Arcana: 2, Athletics: 1 }, items: [{ displayName: artifact, description: `An ancient relic recovered from the ruins.`, rarity: 'rare', itemType: 'misc', consumable: false, wearable: false, weight: 1, value: ri(100,300) }], special: [] }
        };
    }

    function buildRumorQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName = npcGiver?.name || randomName(npcGiver?.race);
        const legend    = pick(LEGENDS);
        const loc       = pick(LOCATIONS_GENERIC);
        const r         = scaleRewards(2, lvl);
        const id        = uid('rumor');
        return {
            id, name: `The Rumor of ${legend}`,
            type: 'side', categories: ['Investigating rumors'],
            description: `${giverName} has heard persistent rumors about ${legend}. They want someone to look into it — there may be truth to it, or it may be something else entirely.`,
            kingdom: kingdom || null,
            acquisition: {
                description: `${giverName} mentioned it in passing, then looked around nervously.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Ask around about ${legend}`, type: 'talk', target: { hint: 'Speak to locals who might know something.' }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Investigate the site at ${loc}`, type: 'search', target: { area: loc, hint: legend }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o3`, text: `Report your findings to ${giverName}`, type: 'talk', target: { npc: giverName }, completion: { type: 'talkedTo', npc: giverName } }
            ],
            rewards: { ...r, skills: { Persuasion: 2, Investigation: 1 }, items: [], special: [] }
        };
    }

    function buildAssassinationAttemptQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const targetName    = npcGiver?.name || randomName(npcGiver?.race);
        const officialName  = randomName();
        const assassinName  = randomName(pick(['Human','Elf','Goblin']));
        const r             = scaleRewards(4, lvl);
        const id            = uid('assassin');
        return {
            id, name: `Protect ${targetName}`,
            type: 'side', categories: ['Assassination attempts'],
            description: `${officialName} believes someone is trying to kill ${targetName}. Find the assassin before they strike.`,
            kingdom: kingdom || null,
            acquisition: {
                description: `${officialName} came to you in secret, fearful of being overheard.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: officialName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Meet with ${targetName} and assess the threat`, type: 'talk', target: { npc: targetName }, completion: { type: 'talkedTo', npc: targetName } },
                { id: `${id}_o2`, text: `Uncover evidence pointing to the assassin`, type: 'search', target: { hint: 'The assassin may have left clues or have a contact nearby.' }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o3`, text: `Stop ${assassinName} before they act`, type: 'defeat', target: { npc: assassinName }, completion: { type: 'ai_judgment' } }
            ],
            rewards: { ...r, skills: { Combat: 2, Investigation: 2, Stealth: 1 }, items: [], special: [{ type: 'reputation', kingdom: kingdom || 'Unknown', amount: 15, description: 'Preventing an assassination earns great gratitude.' }] }
        };
    }

    function buildAttackQuest({ npcGiver, kingdom, biome, lvl, source }) {
        const giverName     = npcGiver?.name || randomName(npcGiver?.race);
        const settingName   = pick(['a village to the north','a farmstead on the road','a trading post at the border','a hamlet near the river']);
        const attackerName  = pick(['bandits','raiders','a mercenary warband','goblin scouts','orc marauders']);
        const r             = scaleRewards(4, lvl);
        const id            = uid('attack');
        return {
            id, name: `Defend Against the Raiders`,
            type: 'side', categories: ['Attacks/Assaults/Sieges'],
            description: `${giverName} reports that ${attackerName} are moving on ${settingName}. The people there have no soldiers — they need help now.`,
            kingdom: kingdom || null,
            acquisition: {
                description: source === 'bulletin' ? `An emergency posting on the bulletin board.` : `${giverName} came running, breathless.`,
                trigger: { type: source === 'bulletin' ? 'bulletin' : 'talkToNPC', npc: giverName }
            },
            objectives: [
                { id: `${id}_o1`, text: `Reach ${settingName} before the attackers`, type: 'travel', target: { area: settingName }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o2`, text: `Drive off or defeat ${attackerName}`, type: 'defeat', target: { npc: attackerName }, completion: { type: 'ai_judgment' } },
                { id: `${id}_o3`, text: `Ensure the survivors are safe`, type: 'complete', target: { hint: 'Check the settlement and stabilize the situation.' }, completion: { type: 'ai_judgment' } }
            ],
            rewards: { ...r, skills: { Combat: 4, Leadership: 2 }, items: [], special: [{ type: 'reputation', kingdom: kingdom || 'Unknown', amount: 20, description: 'Defending the innocent makes you a hero in this region.' }] }
        };
    }

    // ── Category router ────────────────────────────────────────────────────────
    const BUILDERS = {
        'Bounty hunting':                 buildBountyQuest,
        'Lost/stolen item retrieval':     buildItemRetrievalQuest,
        'Ingredient retrieval':           buildIngredientQuest,
        'Helping those in need':          buildHelpingQuest,
        'Beast hunting':                  buildBeastHuntingQuest,
        'Beast sightings':                buildBeastSightingQuest,
        'Missing persons':                buildMissingPersonQuest,
        'Diplomacy':                      buildDiplomacyQuest,
        'Exploration':                    buildExplorationQuest,
        'Mysteries/Unexplainable Events': buildMysteryQuest,
        'Investigating rumors':           buildRumorQuest,
        'Murders':                        buildMurderQuest,
        'Exploring ancient ruins':        buildRuinsQuest,
        'Ancient artifacts':              buildRuinsQuest,
        'Assassination attempts':         buildAssassinationAttemptQuest,
        'Attacks/Assaults/Sieges':        buildAttackQuest
    };

    const ALL_CATS = Object.keys(BUILDERS);

    function generateQuest({ category, npcGiver, kingdom, biome, lvl, source }) {
        const cat     = (category && BUILDERS[category]) ? category : pick(ALL_CATS);
        const builder = BUILDERS[cat];
        return builder({ npcGiver: npcGiver || null, kingdom: kingdom || null, biome: biome || null, lvl: lvl || 1, source: source || 'npc' });
    }

    // ── Public API ─────────────────────────────────────────────────────────────
    return {
        generateQuest,

        generateBulletinQuests(location, kingdom, biome, lvl, count) {
            const cats = pickN(ALL_CATS, count || 4);
            return cats.map(cat => generateQuest({ category: cat, kingdom, biome, lvl, source: 'bulletin' }));
        },

        generateNpcQuest(npc, kingdom, biome, lvl) {
            const cats = PROF_CATS[npc.profession];
            const cat  = cats ? pick(cats) : pick(ALL_CATS);
            return generateQuest({ category: cat, npcGiver: npc, kingdom, biome, lvl, source: 'npc' });
        },

        generateSeedQuest(seed, kingdom, biome, lvl) {
            const cat = inferCategory(seed.description || seed);
            return generateQuest({ category: cat, kingdom, biome, lvl, source: 'event' });
        },

        randomName
    };
})();
