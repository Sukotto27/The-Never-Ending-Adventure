// ============================================================
// GLOBAL EVENTS — world-level events with their own triggers
//
// trigger.type values:
//   level               — player.level >= minLevel
//   combatCount         — worldState.defeatedEnemies >= count
//   locationsDiscovered — discoveredLocations count >= count
//   kingdomsVisited     — worldState.kingdomsVisited.length >= count
//   travelCount         — worldState.travelCount >= count
//   flag                — player.flags[flag] is truthy
//   questComplete       — quest questId has status 'Completed'
//                         + optional choiceFlag must be in player.flags
//
// Quest-outcome events that branch on player choices use choiceFlag.
// That flag is expected to be set by quest special rewards:
//   { type: 'flag', key: 'fragments_choice_mend', value: true }
// ============================================================

const GLOBAL_EVENTS = [

  // ── Standalone — Level Triggered ───────────────────────────

  {
    id: 'merchant_king_arrives',
    title: 'The Merchant King Arrives',
    category: 'kingdom',
    narrative: `Word travels fast along the trade roads: a merchant unlike any other has arrived in the region. They call him the Merchant King — Osward Thael — said to carry goods from lands beyond the known maps. He moves between the major cities quietly, but traders who have dealt with him speak of weapons that hold an edge through a hundred battles and medicines that cure what healers have given up on. His prices are steep. His wares are real.`,
    trigger: { type: 'level', minLevel: 5 },
    once: true,
    effects: [{ type: 'setFlag', key: 'merchantKingActive', value: true }],
  },

  {
    id: 'eclipse_of_morveth',
    title: 'The Eclipse of Morveth',
    category: 'lore',
    narrative: `At midday, the sun dims. A cold wind moves against the direction of the weather, and birds fall silent all at once. Scholars name it the Eclipse of Morveth — recorded only twice in the last three centuries, each time preceding significant upheaval. Mages across the region report their spells feeling thicker, like casting through deep water. The superstitious lock their doors and paint wards on their lintels.`,
    trigger: { type: 'level', minLevel: 8 },
    once: true,
    effects: [{ type: 'setFlag', key: 'morvethEclipseOccurred', value: true }],
  },

  // ── Standalone — Combat Triggered ──────────────────────────

  {
    id: 'bandit_king_rises',
    title: 'A Bandit King Emerges',
    category: 'kingdom',
    narrative: `A name has spread through roadside inns and notice boards: Kael the Unbroken. Raiders across three kingdoms have begun operating under a single banner — a black circle cut in half. Merchant caravans travel in larger armed groups now. Road wardens are stretched thin. No one is certain who Kael is or where he commands from, but the raids are becoming bolder and more coordinated.`,
    trigger: { type: 'combatCount', count: 5 },
    once: true,
    effects: [{ type: 'setFlag', key: 'banditKingActive', value: true }],
  },

  {
    id: 'bandit_network_fractures',
    title: 'The Bandit Network Fractures',
    category: 'kingdom',
    narrative: `The name Kael the Unbroken appears less in the road reports. Something — someone — has been cutting a path through organized bandit operations, disrupting their coordination across the region. Merchant guilds in two kingdoms have offered a quiet reward for whoever is responsible. The raids have not stopped, but they are fractured again. Disorganized. Desperate.`,
    trigger: { type: 'combatCount', count: 20 },
    once: true,
    effects: [{ type: 'setFlag', key: 'banditKingDefeated', value: true }],
  },

  {
    id: 'veteran_fighter',
    title: 'Feared on the Road',
    category: 'player',
    narrative: `The stories told by merchants and road wardens tend to embroider the details, but the core account is consistent: a lone fighter has been handling threats along the trade roads that would stop most trained soldiers. The more specific accounts all describe the same person. The more dangerous groups have begun to treat certain roads as unfavorable ground.`,
    trigger: { type: 'combatCount', count: 15 },
    once: true,
    effects: [{ type: 'setFlag', key: 'veteranFighterKnown', value: true }],
  },

  // ── Standalone — Kingdoms Visited ──────────────────────────

  {
    id: 'crimson_blight',
    title: 'The Crimson Blight Spreads',
    category: 'kingdom',
    narrative: `Word reaches you from the northern settlements: a sickness has taken hold in several villages along the coastal trade routes. A crimson rash, high fever, confusion that sets in fast. Healers call it the Blight. Cities have begun turning away travelers from afflicted regions. Supply lines are thinning. It has not reached the major cities yet — but it is moving.`,
    trigger: { type: 'kingdomsVisited', count: 3 },
    once: true,
    effects: [{ type: 'setFlag', key: 'crimsonBlightActive', value: true }],
  },

  {
    id: 'guild_war_begins',
    title: 'The Guild War Begins',
    category: 'kingdom',
    narrative: `What began as a trade dispute has escalated into open conflict between the Merchant's Alliance and the Artificers' Brotherhood. Guild enforcers in faction colors have clashed in at least three marketplaces. Supply chains are disrupted and prices on smithed goods and alchemical supplies have climbed sharply across the region. Both guilds are quietly hiring outside contractors.`,
    trigger: { type: 'kingdomsVisited', count: 4 },
    once: true,
    effects: [{ type: 'setFlag', key: 'guildWarsActive', value: true }],
  },

  // ── Standalone — Travel Count ───────────────────────────────

  {
    id: 'blood_moon',
    title: 'The Blood Moon Rises',
    category: 'lore',
    narrative: `The moon rises in the wrong color — deep red, like cooled iron or old blood. Travelers go quiet when they notice it and move faster. Scholars have their explanations, none fully satisfying. Monsters near the ancient ruin sites have reportedly grown more aggressive in the days following. Something about the red light unsettles the world, as if the sky is reflecting a wound in the ground.`,
    trigger: { type: 'travelCount', count: 20 },
    once: true,
    effects: [{ type: 'setFlag', key: 'bloodMoonOccurred', value: true }],
  },

  {
    id: 'stranger_in_black',
    title: 'The Stranger on the Road',
    category: 'lore',
    narrative: `Three different travelers have mentioned the same figure separately: a person dressed entirely in dark clothing, moving alone and fast, always behind you on the road but never closing the distance. They have not caused trouble. They have not spoken to anyone. They are simply there — then gone. The innkeeper at your last stop had seen them twice before, asking careful questions about which direction you had traveled.`,
    trigger: { type: 'travelCount', count: 35 },
    once: true,
    effects: [{ type: 'setFlag', key: 'strangerTracking', value: true }],
  },

  // ── Standalone — Locations Discovered ──────────────────────

  {
    id: 'known_traveller',
    title: 'A Name on the Roads',
    category: 'player',
    narrative: `Somewhere along the roads, your name began to travel ahead of you. Innkeepers pause when you give it. Merchants ask which route you came from. You have been moving through more of this land than most people see in a lifetime, and people are starting to take notice — some with curiosity, others with interest of a more calculated kind.`,
    trigger: { type: 'locationsDiscovered', count: 10 },
    once: true,
    effects: [{ type: 'setFlag', key: 'knownTraveller', value: true }],
  },

  {
    id: 'legend_in_the_making',
    title: 'A Legend in the Making',
    category: 'player',
    narrative: `The bards have started. A song — still unfinished, inconsistent in its details — is being sung in at least four different taverns. It follows a traveler with no fixed home who has passed through more of the known world than anyone can account for. It has the rhythm of a legend that does not yet know it is one. Some say it is flattering. Others are less certain.`,
    trigger: { type: 'locationsDiscovered', count: 25 },
    once: true,
    effects: [{ type: 'setFlag', key: 'legendaryTraveller', value: true }],
  },

  // ── The Arúvari — Hidden History Accomplishment ────────────

  {
    id: 'aruvari_truth_uncovered',
    title: 'Uncovered: The Hidden History of Arúvaria',
    category: 'lore',
    narrative: 'The last fragment falls into place. Thirty pieces — scattered across ruins, conversations, relics, and silences — and now, for the first time in nine hundred years, the whole shape of what happened is visible to someone outside the bloodlines of those who made it happen. The weight of it settles on you like a hand on the shoulder. You know something the kings of ten kingdoms have spent generations ensuring no one would ever know.',
    trigger: { type: 'loreCategory', category: 'The Arúvari', count: 31 },
    once: true,
    effects: [
      { type: 'setFlag', key: 'aruvariTruthKnown', value: true },
      { type: 'cutscene', id: 'aruvari_revelation' },
      { type: 'experience', amount: 500 },
      { type: 'morality', amount: 5 },
    ],
  },

  // ── Flag Triggered ──────────────────────────────────────────

  {
    id: 'ravens_prophecy',
    title: "The Raven's Prophecy",
    category: 'lore',
    narrative: `A seer known only as the Black Raven has been speaking in public squares across two kingdoms, drawing crowds before vanishing. Her words are always the same: "The fragments are gathered. The axis point approaches. One path leads to light. The other does not lead anywhere at all." No one is certain who she is addressing. Some say the words were always meant for one specific traveler.`,
    trigger: { type: 'flag', flag: 'all_fragments_collected' },
    once: true,
    effects: [],
  },

  // ── Quest Outcome — Choice Branching (The Scattered Pieces) ─
  // Set player.flags['fragments_choice_mend'] or ['fragments_choice_power']
  // via quest special rewards before completing the quest.

  {
    id: 'fragments_mended',
    title: 'The Fragments Rejoined',
    category: 'lore',
    narrative: `When the shards were finally brought together and the decision made to mend what was broken, those present reported a warmth spreading outward — a light that did not come from fire or sun. Historians are already writing about it. In the weeks that follow, travelers near the ruin sites report an unusual peace, as if the landscape itself has relaxed.`,
    trigger: { type: 'questComplete', questId: 'the_scattered_pieces', choiceFlag: 'fragments_choice_mend' },
    once: true,
    effects: [
      { type: 'setFlag', key: 'fragmentsLightEnding', value: true },
      { type: 'morality', value: 10 },
    ],
  },

  {
    id: 'fragments_corrupted',
    title: 'Something Answers the Fragments',
    category: 'lore',
    narrative: `When the last shard joined the others and the decision was made to draw from their power, something answered. Those nearby describe a sound felt more than heard — a deep resonance, like a bell struck at the bottom of a well. In the days that follow, animals refuse to approach certain ruins. Night travelers report lights moving through the stone structures.`,
    trigger: { type: 'questComplete', questId: 'the_scattered_pieces', choiceFlag: 'fragments_choice_power' },
    once: true,
    effects: [
      { type: 'setFlag', key: 'fragmentsDarkEnding', value: true },
      { type: 'morality', value: -10 },
    ],
  },

  // ── Quest Outcome — Choice Branching (Whispers of the Ancients) ─
  // Set player.flags['whispers_choice_seal'] or ['whispers_choice_take']
  // via quest special rewards before completing the quest.

  {
    id: 'ancients_sealed',
    title: 'The Ancient Places Go Quiet',
    category: 'lore',
    narrative: `The ruins have stilled. Whatever had stirred within the old stone structures has been contained. Travelers who pass near the sites report an unusual silence — the kind that feels settled rather than empty. A scholar who had been monitoring the sites says the readings have returned to baseline for the first time in recorded history. The knowledge of that age is sealed away again.`,
    trigger: { type: 'questComplete', questId: 'whispers_of_the_ancients', choiceFlag: 'whispers_choice_seal' },
    once: true,
    effects: [
      { type: 'setFlag', key: 'ancientsSealed', value: true },
      { type: 'morality', value: 5 },
    ],
  },

  {
    id: 'ancients_unleashed',
    title: 'Something Old Returns',
    category: 'lore',
    narrative: `The seals are broken. The scholars who warned against it have stopped saying "I told you so" and started packing their libraries. Those who venture near the old ruin sites describe the air as heavy, charged, pressing against the chest. Things move there at night. Two settlements near the largest sites have been evacuated. Something from a very old time has been let back into the world.`,
    trigger: { type: 'questComplete', questId: 'whispers_of_the_ancients', choiceFlag: 'whispers_choice_take' },
    once: true,
    effects: [
      { type: 'setFlag', key: 'ancientsUnleashed', value: true },
      { type: 'morality', value: -8 },
    ],
  },

];
