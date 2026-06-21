// quests.js — Quest definitions for The Never-Ending Adventure
//
// HOW THE ENGINE USES THIS FILE
// ─────────────────────────────────────────────────────────────────────────────
// Quest templates here are read-only. Active state lives in player.journal.quests:
//   { id, status: 'active'|'completed'|'failed', objectiveIndex: N,
//     branchId: null|'branch_id', flags: {} }
//
// OBJECTIVE TYPES  (objective.type)
//   'travel'   — move to a named location
//   'talk'     — speak with a named NPC
//   'acquire'  — obtain item(s) — find, buy, loot, or receive
//   'deliver'  — hand an item to a named NPC
//   'defeat'   — defeat enemy/enemies
//   'craft'    — craft a specific item
//   'use'      — use a specific item or ability
//   'sleep'    — rest for the night
//   'search'   — investigate/search an area
//   'escape'   — sneak out of or flee a situation
//   'choose'   — branching decision; see objective.branches[]
//   'survive'  — endure an encounter without fighting
//   'complete' — general action; AI evaluates completion
//
// COMPLETION CONDITION TYPES  (completion.type)
//   'hasItem'    — player.inventory[item].quantity >= qty
//   'location'   — player.currentLocation matches location string (case-insensitive)
//   'talkedTo'   — quest flag set when player talks to npc
//   'defeated'   — quest flag set when enemy is defeated
//   'crafted'    — quest flag set when item is crafted
//   'used'       — quest flag set when item is used
//   'slept'      — quest flag set when player sleeps
//   'skillUsed'  — player.skills[skill] exists / was used
//   'choiceMade' — questInstance.branchId === branchId
//   'flag'       — questInstance.flags[key] === value
//   'delivered'  — quest flag set when item is delivered to npc
//   'ai_judgment'— AI DM evaluates; description tells it what to look for
//
// ON-COMPLETE SIDE EFFECTS  (objective.onComplete)
//   setFlag:       { key, value }       — sets questInstance.flags[key]
//   giveItem:      { name, qty, ...opts }— calls addItem()
//   removeItem:    { name, qty }         — calls removeItem()
//   setPlayerFlag: { key, value }        — sets player.flags[key] (persistent)
//   startQuest:    'quest_id'            — auto-starts another quest
//
// REWARD TYPES  (rewards.special[].type)
//   'lodging'     — free lodging + meal at any tavern; duration in nights
//   'map'         — gives player a named map item; triggers map reveal
//   'unlock'      — unlocks a feature/location; feature key + description
//   'title'       — grants an honorary title string
//   'membership'  — grants membership to an organization
//   'reputation'  — adjusts player reputation with a kingdom
//   'flag'        — sets a player-level persistent flag
//   'skill_unlock'— calls learnSkill(skill)
//
// REWARD ITEMS
//   Named items must match an entry in Items (items.js).
//   Quest-unique items use { questItem: 'id', displayName, description, rarity, itemType }
//     — the engine creates them on the fly via addItem().
//   Dynamically generated items use { generated: true, rarity, itemType, description }
//     — the engine picks a random matching item from the item pool.
// ─────────────────────────────────────────────────────────────────────────────

// All recognized quest opportunity categories. Quests carry a categories[] array
// using values from this list so the engine can filter, suggest, and generate quests.
const QUEST_CATEGORIES = [
  'Bounty hunting',
  'Lost/stolen item retrieval',
  'Ingredient retrieval',
  'Helping those in need',
  'Beast hunting',
  'Mysteries/Unexplainable Events',
  'Beast sightings',
  'Attacks/Assaults/Sieges',
  'Murders',
  'Investigating rumors',
  'Missing persons',
  'Diplomacy',
  'Battles/Wars',
  'Old legends/folk tales',
  'Exploration',
  'Exploring ancient ruins',
  'Revenge',
  'Ancient artifacts',
  'Magical artifacts',
  'Feuds',
  'Mugging',
  'Assassination attempts',
];

const quests = [

  // ══════════════════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'lay_of_the_land',
    name: 'Lay of the Land',
    type: 'tutorial',
    categories: ['Exploration', 'Helping those in need'],
    description: 'You have arrived in an unknown land, alone in the wilderness. Weary, hungry, and thirsty, you must survive the night and find a way to get back on your feet.',
    kingdom: null,
    acquisition: {
      description: 'Starts automatically at game start. Player is placed in the wilderness, evening, status: weary/hungry/thirsty.',
      trigger: { type: 'automatic' },
    },
    objectives: [
      {
        id: 'find_camp_spot',
        text: 'Find a suitable spot and make camp. [Actions → Exploration → Find Camping Spot, then Survival → Make Camp]',
        type: 'search',
        target: { area: 'wilderness' },
        completion: { type: 'flag', key: 'camp_spot_found', value: true },
        onComplete: { setFlag: { key: 'camp_spot_found', value: true } },
      },
      {
        id: 'hunt_food',
        text: 'Hunt for food. First equip your Bow in your Inventory tab, then: Action Wheel → Survival → Hunt.',
        type: 'complete',
        target: { skill: 'Hunting' },
        hint: 'Open the Inventory tab to equip your bow before hunting.',
        completion: { type: 'flag', key: 'food_hunted', value: true },
        onComplete: { setFlag: { key: 'food_hunted', value: true } },
      },
      {
        id: 'find_water',
        text: 'Find a nearby stream to refill your water. [Survival → Gather Water, or travel to a River/Coastal tile]',
        type: 'travel',
        target: { area: 'stream' },
        completion: { type: 'flag', key: 'water_refilled', value: true },
        onComplete: { setFlag: { key: 'water_refilled', value: true } },
      },
      {
        id: 'start_fire',
        text: 'Start a campfire at your camp spot. [Survival → Camp → Start Fire — you need Kindling or wood]',
        type: 'use',
        target: { skill: 'Survival', item: 'campfire' },
        hint: 'You need Kindling or Stick Bundle in your inventory to start a fire.',
        completion: { type: 'flag', key: 'fire_started', value: true },
        onComplete: { setFlag: { key: 'fire_started', value: true } },
      },
      {
        id: 'cook_food',
        text: 'Cook the meat over your fire. [Survival → Camp → Cook → select your raw meat] Burnt food still counts.',
        type: 'craft',
        target: { item: 'Cooked Meat', skill: 'Cooking' },
        completion: { type: 'flag', key: 'food_cooked', value: true },
        onComplete: { setFlag: { key: 'food_cooked', value: true } },
      },
      {
        id: 'eat_food',
        text: 'Eat the cooked meat. [Open Inventory tab → click the cooked meat → Use/Eat]',
        type: 'use',
        target: { item: 'Cooked Meat' },
        completion: { type: 'flag', key: 'food_eaten', value: true },
        onComplete: { setFlag: { key: 'food_eaten', value: true } },
      },
      {
        id: 'check_surroundings',
        text: 'Check your surroundings before resting. [Exploration → Search Area]',
        type: 'search',
        target: { area: 'camp perimeter' },
        completion: { type: 'flag', key: 'surroundings_checked', value: true },
        onComplete: { setFlag: { key: 'surroundings_checked', value: true } },
      },
      {
        id: 'sleep',
        text: 'Sleep for the night. Build a Simple Shelter first (Encampment → Shelter → Build Simple Shelter), then choose Sleep. Alternatively, use Survival → Rest.',
        type: 'sleep',
        target: {},
        completion: { type: 'slept' },
        onComplete: { setFlag: { key: 'slept_night_one', value: true } },
      },
      {
        id: 'talk_bandits',
        text: 'Talk to the bandits. There are too many to fight — use words. [Choose a tone from the wheel]',
        type: 'talk',
        target: { npc: 'Bandits' },
        hint: 'There are too many to fight. Any non-combat option will resolve this.',
        completion: { type: 'talkedTo', npc: 'Bandits' },
        onComplete: { setFlag: { key: 'bandits_confronted', value: true } },
      },
      {
        id: 'find_village',
        text: 'Find a nearby village. [Exploration → Travel, or open the Map tab to see nearby locations]',
        type: 'travel',
        target: { area: 'village' },
        completion: { type: 'flag', key: 'village_reached', value: true },
        onComplete: { setFlag: { key: 'village_reached', value: true } },
      },
      {
        id: 'find_work',
        text: 'Find work in the village. [Town → Activities → Odd Jobs, or talk to villagers]',
        type: 'talk',
        target: { npc: 'Villager or employer' },
        completion: { type: 'flag', key: 'work_found', value: true },
        onComplete: { setFlag: { key: 'work_found', value: true } },
      },
      {
        id: 'complete_job',
        text: 'Complete the job and earn your pay.',
        type: 'complete',
        target: {},
        completion: {
          type: 'flag',
          key: 'job_done',
          value: true,
        },
        onComplete: { setFlag: { key: 'tutorial_complete', value: true } },
      },
    ],
    rewards: {
      gold: 35,
      experience: 120,
      skills: { Survival: 3 },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN QUESTS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'the_great_void',
    name: 'The Great Void',
    type: 'main',
    categories: ['Ancient artifacts', 'Mysteries/Unexplainable Events', 'Exploring ancient ruins', 'Exploration'],
    description: 'An ancient evil from beyond — the Voidwalkers — is coming for the souls of the living. The only means to stop them lies in an ancient scroll, locked away in a deadly labyrinth.',
    kingdom: 'Rendarost',
    acquisition: {
      description: 'Speak with Brindon at the Dwarven Archives of Rendarost.',
      trigger: { type: 'talkToNPC', npc: 'Brindon', location: 'Dwarven Archives of Rendarost' },
    },
    objectives: [
      {
        id: 'talk_brindon_start',
        text: 'Speak with Brindon at the Dwarven Archives of Rendarost.',
        type: 'talk',
        target: { npc: 'Brindon', location: 'Dwarven Archives of Rendarost' },
        completion: { type: 'talkedTo', npc: 'Brindon' },
        onComplete: { setFlag: { key: 'brindon_met', value: true } },
      },
      {
        id: 'collect_map_fragments',
        text: 'Locate 3 ancient map fragments scattered across Estranta and return them to Brindon.',
        type: 'acquire',
        target: {
          item: 'Ancient Map Fragment',
          quantity: 3,
          hint: 'Brindon has leads on possible locations. Each fragment is guarded by creatures. Look for clues about the Voidwalkers along the way.',
        },
        completion: { type: 'hasItem', item: 'Ancient Map Fragment', qty: 3 },
        onComplete: {
          setFlag: { key: 'map_fragments_collected', value: true },
          giveItem: {
            questItem: 'ancient_map_fragment',
            displayName: 'Ancient Map Fragment',
            description: 'A weathered fragment of an ancient map. One of three needed to reveal the path to the labyrinth.',
            rarity: 'rare',
            itemType: 'misc',
            consumable: false,
            wearable: false,
            weight: 0.1,
            value: 0,
          },
        },
      },
      {
        id: 'return_fragments_to_brindon',
        text: 'Return all 3 map fragments to Brindon.',
        type: 'deliver',
        target: { npc: 'Brindon', item: 'Ancient Map Fragment', qty: 3 },
        completion: { type: 'delivered', npc: 'Brindon', item: 'Ancient Map Fragment' },
        onComplete: {
          removeItem: { name: 'Ancient Map Fragment', qty: 3 },
          setFlag: { key: 'full_map_assembled', value: true },
          giveItem: {
            questItem: 'labyrinth_map',
            displayName: 'Map to the Labyrinth',
            description: 'The four fragments assembled by Brindon. Reveals a path through a forest to an ancient hidden labyrinth.',
            rarity: 'rare',
            itemType: 'misc',
            consumable: false,
            wearable: false,
            weight: 0.2,
            value: 0,
          },
        },
      },
      {
        id: 'travel_to_labyrinth',
        text: 'Travel through the dangerous forest to reach the ancient labyrinth.',
        type: 'travel',
        target: { area: 'Ancient Labyrinth', hint: 'The path through the forest is filled with dangerous encounters.' },
        completion: { type: 'location', location: 'Ancient Labyrinth' },
        onComplete: { setFlag: { key: 'labyrinth_found', value: true } },
      },
      {
        id: 'defeat_entrance_guardian',
        text: 'Defeat the ancient guardian at the labyrinth entrance.',
        type: 'defeat',
        target: {
          enemy: 'Ancient Guardian',
          hint: 'The guardian appears dead until approached — then it awakens. Find its weakness.',
        },
        completion: { type: 'defeated', enemy: 'Ancient Guardian' },
        onComplete: { setFlag: { key: 'entrance_guardian_defeated', value: true } },
      },
      {
        id: 'complete_five_chambers',
        text: 'Navigate all 5 chambers of the labyrinth, solving each puzzle and defeating each guardian.',
        type: 'complete',
        target: { hint: 'Each chamber has a puzzle to solve and a guardian to defeat before you can advance.' },
        completion: { type: 'flag', key: 'chambers_completed', value: true },
        onComplete: { setFlag: { key: 'chambers_completed', value: true } },
      },
      {
        id: 'retrieve_scroll',
        text: 'Retrieve the ancient scroll from the final chamber.',
        type: 'acquire',
        target: { item: 'Ancient Scroll', hint: 'The scroll is written in an unknown language.' },
        completion: { type: 'hasItem', item: 'Ancient Scroll', qty: 1 },
        onComplete: {
          giveItem: {
            questItem: 'ancient_scroll',
            displayName: 'Ancient Scroll',
            description: 'A scroll written in an unknown language. Contains vital information about the Voidwalkers.',
            rarity: 'legendary',
            itemType: 'misc',
            consumable: false,
            wearable: false,
            weight: 0.1,
            value: 0,
          },
          setFlag: { key: 'scroll_retrieved', value: true },
        },
      },
      {
        id: 'return_scroll_to_brindon',
        text: 'Return the scroll to Brindon for translation.',
        type: 'deliver',
        target: { npc: 'Brindon', item: 'Ancient Scroll', qty: 1 },
        completion: { type: 'delivered', npc: 'Brindon', item: 'Ancient Scroll' },
        onComplete: { setFlag: { key: 'scroll_translated', value: true } },
      },
      {
        id: 'acquire_riftblade_components',
        text: 'Acquire the components needed to forge the Riftblade, including meteorite ore from a mountain peak near Rendarost.',
        type: 'acquire',
        target: {
          item: 'Riftblade Components',
          hint: 'The meteorite ore is at the peak of a mountain near Rendarost. Other components must also be gathered.',
        },
        completion: {
          type: 'ai_judgment',
          description: 'Player has all required components for the Riftblade, including the meteorite ore.',
        },
        onComplete: { setFlag: { key: 'riftblade_components_gathered', value: true } },
      },
      {
        id: 'forge_riftblade',
        text: 'Have the Riftblade forged at the forge in Rendarost.',
        type: 'craft',
        target: {
          item: 'Riftblade',
          location: 'Rendarost forge',
          hint: 'The forge in Rendarost is the only one capable of smelting meteorite ore.',
        },
        completion: { type: 'crafted', item: 'Riftblade' },
        onComplete: {
          setFlag: { key: 'riftblade_forged', value: true },
          giveItem: {
            questItem: 'riftblade_unenchanted',
            displayName: 'Riftblade (Unenchanted)',
            description: 'A sword forged from meteorite ore. The hilt has a mechanism to set coordinates to specific realms. Needs enchantment.',
            rarity: 'legendary',
            itemType: 'weapon',
            consumable: false,
            wearable: true,
            weight: 5.0,
            value: 0,
          },
        },
      },
      {
        id: 'find_sages',
        text: 'Locate the Sages of the Sacred Veil and acquire the ingredients they require for the enchantment.',
        type: 'complete',
        target: { npc: 'Sages of the Sacred Veil' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has located the Sages of the Sacred Veil and gathered all required rare ingredients.',
        },
        onComplete: { setFlag: { key: 'sages_found', value: true } },
      },
      {
        id: 'enchant_riftblade',
        text: 'Bring the ingredients to the Sages and have them enchant the Riftblade.',
        type: 'deliver',
        target: { npc: 'Sages of the Sacred Veil', item: 'Riftblade (Unenchanted)', qty: 1 },
        completion: { type: 'delivered', npc: 'Sages of the Sacred Veil', item: 'Riftblade (Unenchanted)' },
        onComplete: {
          removeItem: { name: 'Riftblade (Unenchanted)', qty: 1 },
          giveItem: {
            questItem: 'riftblade',
            displayName: 'Riftblade',
            description: 'The fully enchanted Riftblade. Can rip temporary holes in spacetime to travel or send Voidwalkers to other dimensions. Using it draws Voidwalker attention.',
            rarity: 'legendary',
            itemType: 'weapon',
            consumable: false,
            wearable: true,
            weight: 5.0,
            value: 0,
          },
          setFlag: { key: 'riftblade_enchanted', value: true },
        },
      },
      {
        id: 'get_forbidden_realm_coordinates',
        text: 'Return to Brindon for the coordinates to the Forbidden Realm.',
        type: 'talk',
        target: { npc: 'Brindon' },
        completion: { type: 'talkedTo', npc: 'Brindon' },
        onComplete: { setFlag: { key: 'coordinates_obtained', value: true } },
      },
      {
        id: 'enter_forbidden_realm',
        text: 'Use the Riftblade to enter the Forbidden Realm.',
        type: 'use',
        target: {
          item: 'Riftblade',
          hint: 'The Forbidden Realm looks like Estranta but is dead and void of life. Voidwalkers roam here — they cannot be killed, but the Riftblade can send them to other dimensions temporarily.',
        },
        completion: { type: 'flag', key: 'forbidden_realm_entered', value: true },
        onComplete: { setFlag: { key: 'forbidden_realm_entered', value: true } },
      },
      {
        id: 'find_key',
        text: 'Locate the key in the Forbidden Realm labyrinth.',
        type: 'acquire',
        target: { item: 'Mystic Gateway Key', location: 'Forbidden Realm labyrinth' },
        completion: { type: 'hasItem', item: 'Mystic Gateway Key', qty: 1 },
        onComplete: {
          giveItem: {
            questItem: 'mystic_gateway_key',
            displayName: 'Mystic Gateway Key',
            description: 'A mystical key that can lock the gateways between realities, sealing out the Voidwalkers — but only from outside this reality.',
            rarity: 'legendary',
            itemType: 'misc',
            consumable: false,
            wearable: false,
            weight: 0.5,
            value: 0,
          },
          setFlag: { key: 'key_found', value: true },
        },
      },
      {
        id: 'lock_gateways',
        text: 'Return to reality and use the key to lock the Mystic Gateways.',
        type: 'use',
        target: { item: 'Mystic Gateway Key' },
        completion: { type: 'flag', key: 'gateways_locked', value: true },
        onComplete: {
          removeItem: { name: 'Mystic Gateway Key', qty: 1 },
          setFlag: { key: 'gateways_locked', value: true },
        },
      },
      {
        id: 'return_to_brindon_final',
        text: 'Return to Brindon with news of your victory.',
        type: 'talk',
        target: { npc: 'Brindon', hint: 'Brindon will warn you the Riftblade must never be used again — and recommend having it destroyed at the forge.' },
        completion: { type: 'talkedTo', npc: 'Brindon' },
        onComplete: { setFlag: { key: 'great_void_complete', value: true } },
      },
    ],
    rewards: {
      gold: 500,
      experience: 500,
      skills: {},
      items: [
        { generated: true, rarity: 'legendary', itemType: 'misc', description: 'A legendary rare item rewarded by Brindon.' },
      ],
      special: [],
    },
  },

  {
    id: 'eratrids_lament',
    name: "Eratrid's Lament",
    type: 'main',
    categories: ['Diplomacy', 'Battles/Wars', 'Feuds'],
    description: 'The once great elven realm of Naradreth is tearing itself apart. Civil war between the Twelve Great Houses looms. Eratrid seeks help.',
    kingdom: 'Naradreth',
    acquisition: {
      description: 'Interact with Eratrid in Naradreth.',
      trigger: { type: 'talkToNPC', npc: 'Eratrid', location: 'Naradreth' },
    },
    objectives: [
      {
        id: 'talk_eratrid',
        text: 'Speak with Eratrid.',
        type: 'talk',
        target: { npc: 'Eratrid' },
        completion: { type: 'talkedTo', npc: 'Eratrid' },
        onComplete: { setFlag: { key: 'eratrid_met', value: true } },
      },
      {
        id: 'choose_path',
        text: 'Decide: unite the clans peacefully, or pick a side in the war.',
        type: 'choose',
        target: {},
        completion: { type: 'choiceMade', branchId: null },
        branches: [
          {
            id: 'peaceful',
            text: 'Work to unite the elven clans without bloodshed.',
            objectives: [
              {
                id: 'visit_all_clans',
                text: 'Travel to all 7 clan leaders across Naradreth and hear their perspectives.',
                type: 'complete',
                target: { hint: 'Each clan leader has a different grievance. All 7 must be visited.' },
                completion: { type: 'flag', key: 'all_clans_visited', value: true },
                onComplete: { setFlag: { key: 'all_clans_visited', value: true } },
              },
              {
                id: 'consult_eratrid_peace',
                text: 'Return to Eratrid and devise a plan to settle the disagreements.',
                type: 'talk',
                target: { npc: 'Eratrid' },
                completion: {
                  type: 'ai_judgment',
                  description: 'Player has presented a viable peace plan to Eratrid that satisfies all clan grievances.',
                },
                onComplete: { setFlag: { key: 'eratrids_lament_complete', value: true } },
              },
            ],
            rewards: {
              gold: 300,
              experience: 300,
              skills: { Persuasion: 5 },
              items: [
                { generated: true, rarity: 'rare', itemType: 'misc', description: 'A rare elven item gifted by Eratrid.' },
              ],
              special: [
                { type: 'reputation', kingdom: 'Naradreth', amount: 25, description: 'Reputation with Naradreth greatly increased.' },
              ],
            },
          },
          {
            id: 'war',
            text: 'Choose a side and fight in the civil war.',
            objectives: [
              {
                id: 'choose_clan',
                text: 'Choose which clan to fight alongside.',
                type: 'choose',
                target: {},
                completion: {
                  type: 'ai_judgment',
                  description: 'Player has aligned with one of the Twelve Great Houses and begun fighting.',
                },
                onComplete: { setFlag: { key: 'war_path_chosen', value: true } },
              },
              {
                id: 'fight_for_clan',
                text: 'Fight alongside your chosen clan until the conflict is resolved.',
                type: 'defeat',
                target: { enemy: 'Opposing clan forces', hint: 'Eratrid is now an enemy — no reward from him.' },
                completion: {
                  type: 'ai_judgment',
                  description: 'Player has fought sufficiently for their chosen clan and the conflict has reached a conclusion.',
                },
                onComplete: { setFlag: { key: 'eratrids_lament_complete', value: true } },
              },
            ],
            rewards: {
              gold: 100,
              experience: 200,
              skills: { Swordsmanship: 3, Brawling: 2 },
              items: [
                { generated: true, rarity: 'uncommon', itemType: 'weapon', description: 'Weapon taken from a defeated opponent.' },
              ],
              special: [
                { type: 'reputation', kingdom: 'Naradreth', amount: -10, description: 'Reputation with parts of Naradreth decreased due to war involvement.' },
              ],
            },
          },
        ],
      },
    ],
    rewards: {
      gold: 0,
      experience: 0,
      skills: {},
      items: [],
      special: [],
    },
  },

  {
    id: 'the_scattered_pieces',
    name: 'The Scattered Pieces',
    type: 'main',
    categories: ['Ancient artifacts', 'Exploring ancient ruins', 'Exploration'],
    description: 'A strange carved fragment found in ancient ruins. The inscriptions match no known script, and the piece clearly belongs to something larger. Twelve such fragments are said to lie hidden in ruins scattered across Estranta.',
    kingdom: null,
    acquisition: {
      description: 'Triggers automatically when the player finds their first Ancient Artifact Fragment by exploring ancient ruins.',
      trigger: { type: 'hasItem', item: 'Ancient Artifact Fragment', qty: 1 },
    },
    objectives: [
      {
        id: 'find_all_fragments',
        text: 'Find all 12 Ancient Artifact Fragments hidden in ancient ruins across Estranta.',
        type: 'acquire',
        target: { item: 'Ancient Artifact Fragment', quantity: 12, hint: 'Ancient ruins are marked on the map. Each holds one fragment — search carefully.' },
        completion: { type: 'hasItem', item: 'Ancient Artifact Fragment', qty: 12 },
        onComplete: {
          setFlag: { key: 'all_fragments_collected', value: true },
        },
      },
    ],
    rewards: {
      gold: 0,
      experience: 50,
      skills: {},
      items: [],
      special: [],
    },
  },

  {
    id: 'whispers_of_the_ancients',
    name: 'Whispers of the Ancients',
    type: 'main',
    categories: ['Ancient artifacts', 'Exploring ancient ruins', 'Mysteries/Unexplainable Events', 'Old legends/folk tales'],
    description: '12 fragments of a lost ancient artifact lie scattered across the land, hidden in ancient ruins. When assembled, the device reveals secrets about the very origins of the world.',
    kingdom: null,
    acquisition: {
      description: 'Begins automatically once all 12 Ancient Artifact Fragments are collected, completing The Scattered Pieces.',
      trigger: { type: 'flag', key: 'all_fragments_collected', value: true },
    },
    objectives: [
      {
        id: 'assemble_artifact',
        text: 'Piece together the ancient device from all 12 fragments.',
        type: 'craft',
        target: { item: 'Ancient Device', components: [{ item: 'Ancient Artifact Fragment', qty: 12 }] },
        completion: { type: 'crafted', item: 'Ancient Device' },
        onComplete: {
          removeItem: { name: 'Ancient Artifact Fragment', qty: 12 },
          giveItem: {
            questItem: 'ancient_device',
            displayName: 'Ancient Device',
            description: 'A mysterious assembled artifact covered in undecipherable runic inscriptions. Its purpose is unknown.',
            rarity: 'legendary',
            itemType: 'misc',
            consumable: false,
            wearable: false,
            weight: 1.0,
            value: 0,
          },
          setFlag: { key: 'device_assembled', value: true },
        },
      },
      {
        id: 'find_jorn',
        text: 'Ask around about the inscriptions on the device until you are led to the dwarf, Jorn.',
        type: 'talk',
        target: { npc: 'Jorn' },
        completion: { type: 'talkedTo', npc: 'Jorn' },
        onComplete: { setFlag: { key: 'jorn_found', value: true } },
      },
      {
        id: 'visit_standing_stones',
        text: "Follow Jorn to the site of ancient standing stones with similar inscriptions.",
        type: 'travel',
        target: { npc: 'Jorn', area: 'Ancient Standing Stones' },
        completion: { type: 'location', location: 'Ancient Standing Stones' },
        onComplete: { setFlag: { key: 'standing_stones_found', value: true } },
      },
      {
        id: 'decipher_all_stones',
        text: 'Use the ancient device to decipher all 4 standing stone sites. Follow the message to a temple beneath a mountain.',
        type: 'use',
        target: { item: 'Ancient Device', hint: 'The device is a cipher. The first site leads to 3 more. Deciphering all reveals a map to a temple under a mountain.' },
        completion: { type: 'flag', key: 'all_stones_deciphered', value: true },
        onComplete: { setFlag: { key: 'all_stones_deciphered', value: true } },
      },
      {
        id: 'explore_temple',
        text: 'Explore the ancient temple beneath the mountain. Study the wall depictions.',
        type: 'search',
        target: { area: 'Ancient Temple', hint: 'Depictions show giants who created the three races, a great war with forgotten beasts, and the destruction of the ancient civilization.' },
        completion: { type: 'flag', key: 'temple_explored', value: true },
        onComplete: { setFlag: { key: 'temple_explored', value: true } },
      },
      {
        id: 'defeat_ancient_beast',
        text: 'Navigate the dark passages deeper into the mountain — and survive the awakened beast.',
        type: 'defeat',
        target: { enemy: 'Ancient Beast', hint: 'The beast is one of those depicted on the walls. You must find a way to escape and kill it.' },
        completion: { type: 'defeated', enemy: 'Ancient Beast' },
        onComplete: { setFlag: { key: 'ancient_beast_defeated', value: true } },
      },
    ],
    rewards: {
      gold: 0,
      experience: 400,
      skills: {},
      items: [
        { generated: true, rarity: 'legendary', itemType: 'misc', description: 'An ancient artifact given by Jorn as thanks for the discovery.' },
        {
          questItem: 'ancient_beast_trophy',
          displayName: 'Trophy of the Ancient Beast',
          description: 'A trophy taken from the corpse of the ancient beast. Proof of a battle no one else has survived.',
          rarity: 'legendary',
          itemType: 'misc',
          consumable: false,
          wearable: false,
          weight: 2.0,
          value: 100,
        },
      ],
      special: [],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SIDE QUESTS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'the_sword_of_ithalia',
    name: 'The Sword of Ithalia',
    type: 'side',
    categories: ['Magical artifacts', 'Old legends/folk tales', 'Mysteries/Unexplainable Events'],
    description: "A cursed sword once belonging to the elf witch Ithalia lies hidden in Sivanrift's Cursed Forest. It traps the souls of those it slays and commands its wielder to kill. When it demanded Ithalia's own life, she refused and hid it. She was never seen again.",
    kingdom: 'Sivanrift',
    acquisition: {
      description: "Player explores the Cursed Forest near Sivanrift and touches the sword in the tree stump. Can also be triggered by talking to Sivanrift locals about the Cursed Forest.",
      trigger: { type: 'ai_judgment', description: "Player has entered the Cursed Forest and touched the sword embedded in the tree stump." },
    },
    objectives: [
      {
        id: 'touch_sword',
        text: 'A vision of gloom and death overwhelms you. You awaken wielding a dark sword.',
        type: 'complete',
        target: {},
        completion: { type: 'flag', key: 'sword_touched', value: true },
        onComplete: {
          giveItem: {
            questItem: 'sword_of_ithalia',
            displayName: "Ithalia's Sword",
            description: "A sinister blade that whispers to its wielder. Souls of those it slays are trapped within, growing its power. You cannot let go.",
            rarity: 'legendary',
            itemType: 'weapon',
            consumable: false,
            wearable: true,
            weight: 4.0,
            value: 0,
          },
          setFlag: { key: 'sword_touched', value: true },
        },
      },
      {
        id: 'survive_three_puzzles',
        text: "Endure three tests inside the sword's mind-trap. Your past will be used against you.",
        type: 'survive',
        target: { hint: "The world appears bleak and dark. Three puzzles test your resolve, playing on your history manipulatively. Solve all three." },
        completion: { type: 'flag', key: 'puzzles_passed', value: true },
        onComplete: { setFlag: { key: 'puzzles_passed', value: true } },
      },
      {
        id: 'face_the_mirror',
        text: 'You stand before a mirror. A shadowy, faceless figure stares back. Choose your path.',
        type: 'choose',
        target: {},
        completion: { type: 'choiceMade', branchId: null },
        branches: [
          {
            id: 'slay_self',
            text: 'Slay yourself with the sword (promising unlimited power).',
            objectives: [
              {
                id: 'break_free_from_sword',
                text: 'You have become one of the souls trapped in the sword. Find a way to break free.',
                type: 'complete',
                target: { hint: 'You are trapped inside the sword. Find a weakness, a clue, or a way to communicate with the outside world.' },
                completion: {
                  type: 'ai_judgment',
                  description: 'Player has found and executed a means of escaping the sword\'s soul collection.',
                },
                onComplete: { setFlag: { key: 'sword_of_ithalia_complete', value: true } },
              },
            ],
            rewards: {
              gold: 0,
              experience: 100,
              skills: {},
              items: [],
              special: [],
            },
          },
          {
            id: 'step_through_mirror',
            text: 'Step through the mirror, sword in hand. Become its wielder.',
            objectives: [
              {
                id: 'carry_the_sword',
                text: "The sword speaks, demanding you kill. You hear Ithalia's whispers urging you to abandon it. You cannot let go until the curse is lifted.",
                type: 'complete',
                target: { hint: "You must find a necromancer rumored to live in a hut in the forest outside Dwynbroch, then locate Ithalia's tomb." },
                completion: { type: 'flag', key: 'necromancer_sought', value: true },
                onComplete: { setFlag: { key: 'necromancer_sought', value: true } },
              },
              {
                id: 'find_necromancer',
                text: 'Find the necromancer in the forest outside Dwynbroch.',
                type: 'travel',
                target: { area: 'Forest outside Dwynbroch', npc: 'Necromancer' },
                completion: { type: 'talkedTo', npc: 'Necromancer' },
                onComplete: { setFlag: { key: 'necromancer_found', value: true } },
              },
              {
                id: 'find_ithalia_tomb',
                text: "Locate Ithalia's tomb.",
                type: 'travel',
                target: { area: "Ithalia's Tomb" },
                completion: { type: 'location', location: "Ithalia's Tomb" },
                onComplete: { setFlag: { key: 'ithalia_tomb_found', value: true } },
              },
              {
                id: 'lift_the_curse',
                text: 'Communicate with the spirit of Ithalia and lift the curse.',
                type: 'complete',
                target: {},
                completion: {
                  type: 'ai_judgment',
                  description: 'Player has successfully communicated with Ithalia\'s spirit and the sword curse has been lifted.',
                },
                onComplete: {
                  removeItem: { name: "Ithalia's Sword", qty: 1 },
                  setFlag: { key: 'sword_of_ithalia_complete', value: true },
                },
              },
            ],
            rewards: {
              gold: 75,
              experience: 200,
              skills: {},
              items: [],
              special: [],
            },
          },
          {
            id: 'shatter_mirror',
            text: 'Shatter the mirror. Leave the sword and the dream behind.',
            objectives: [
              {
                id: 'wake_without_sword',
                text: 'You wake beside the tree stump. The sword is gone. No one remembers the legend.',
                type: 'complete',
                target: {},
                completion: { type: 'flag', key: 'mirror_shattered', value: true },
                onComplete: {
                  setFlag: { key: 'mirror_shattered', value: true },
                  setFlag: { key: 'sword_of_ithalia_complete', value: true },
                  setPlayerFlag: { key: 'ithalia_legend_erased', value: true },
                },
              },
            ],
            rewards: {
              gold: 0,
              experience: 150,
              skills: {},
              items: [],
              special: [],
            },
          },
        ],
      },
    ],
    rewards: {
      gold: 0,
      experience: 0,
      skills: {},
      items: [],
      special: [],
    },
  },

  {
    id: 'barions_blight',
    name: "Barion's Blight",
    type: 'side',
    categories: ['Helping those in need', 'Ingredient retrieval', 'Mysteries/Unexplainable Events', 'Assassination attempts'],
    description: 'A mysterious illness has struck the village of Drunmar on the outskirts of Brythwen. It only infects humans. The village is under quarantine.',
    kingdom: 'Brythwen',
    acquisition: {
      description: 'Enter the quarantined village of Drunmar and interact with Barion. Guards outside warn the player they will not be allowed to leave if they enter.',
      trigger: { type: 'talkToNPC', npc: 'Barion', location: 'Drunmar' },
    },
    objectives: [
      {
        id: 'talk_barion',
        text: 'Speak with Barion, the village apothecary.',
        type: 'talk',
        target: { npc: 'Barion', location: 'Drunmar' },
        completion: { type: 'talkedTo', npc: 'Barion' },
        onComplete: { setFlag: { key: 'barion_met', value: true } },
      },
      {
        id: 'escape_drunmar',
        text: 'Sneak past the guards to exit Drunmar.',
        type: 'escape',
        target: { location: 'Drunmar', hint: 'Guards are posted around the village perimeter. Use stealth or find another way out.' },
        completion: { type: 'flag', key: 'drunmar_escaped', value: true },
        onComplete: { setFlag: { key: 'drunmar_escaped', value: true } },
      },
      {
        id: 'collect_three_ingredients',
        text: 'Find 3 key cure ingredients scattered across the continent.',
        type: 'acquire',
        target: {
          item: 'Cure Ingredient',
          quantity: 3,
          hint: 'Barion described what is needed. Each ingredient is in a different region of Estranta.',
        },
        completion: { type: 'hasItem', item: 'Cure Ingredient', qty: 3 },
        onComplete: { setFlag: { key: 'ingredients_collected', value: true } },
      },
      {
        id: 'return_to_drunmar',
        text: 'Return to Drunmar with the ingredients.',
        type: 'travel',
        target: { location: 'Drunmar', hint: 'Barion is dead when you arrive. Half the village is gone. You are now showing signs of illness.' },
        completion: { type: 'location', location: 'Drunmar' },
        onComplete: { setFlag: { key: 'returned_to_drunmar', value: true } },
      },
      {
        id: 'craft_cure',
        text: "Find Barion's instructions in the healing house and attempt to create the cure. It will take several tries.",
        type: 'craft',
        target: {
          item: 'Plague Cure',
          location: "Barion's Healing House",
          hint: "Barion's instructions are inside among the dying patients. The cure takes multiple attempts to get right.",
        },
        completion: { type: 'crafted', item: 'Plague Cure' },
        onComplete: {
          giveItem: {
            questItem: 'plague_cure',
            displayName: 'Plague Cure',
            description: "The cure Barion worked to create, finished by you from his notes. Effective against the mysterious illness.",
            rarity: 'rare',
            itemType: 'potion',
            consumable: true,
            wearable: false,
            weight: 0.5,
            value: 0,
          },
          setFlag: { key: 'cure_crafted', value: true },
        },
      },
      {
        id: 'apply_cure',
        text: 'Apply the cure to yourself and the surviving patients.',
        type: 'use',
        target: { item: 'Plague Cure', hint: 'Use it on yourself first, then on the remaining survivors.' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has successfully treated themselves and all surviving villagers with the cure.',
        },
        onComplete: { setFlag: { key: 'cure_applied', value: true } },
      },
      {
        id: 'investigate_cult',
        text: "Follow the trail from Barion's note. Track the elf responsible for the plague.",
        type: 'search',
        target: { hint: "A note from Barion reveals the illness was set by an elf with a deep hatred for humanity. The trail leads to a cult of rogue elves planning to wipe out the human race." },
        completion: { type: 'flag', key: 'cult_found', value: true },
        onComplete: { setFlag: { key: 'cult_found', value: true } },
      },
      {
        id: 'destroy_cult',
        text: 'Deal with the cult. Sabotage their plans and destroy all vials of the illness.',
        type: 'complete',
        target: { hint: 'The cult must be stopped and every vial of the plague destroyed to prevent further spread.' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has confronted and neutralized the rogue elf cult and destroyed all illness vials.',
        },
        onComplete: { setFlag: { key: 'barions_blight_complete', value: true } },
      },
    ],
    rewards: {
      gold: 150,
      experience: 250,
      skills: { Alchemy: 4, Survival: 2 },
      items: [],
      special: [
        { type: 'reputation', kingdom: 'Brythwen', amount: 20, description: 'Reputation with Brythwen increased for saving Drunmar.' },
      ],
    },
  },

  {
    id: 'neialors_feline_dilemma',
    name: "Neialor's Feline Dilemma",
    type: 'side',
    categories: ['Helping those in need', 'Mysteries/Unexplainable Events', 'Revenge'],
    description: 'A sorceress has swapped the souls of the elf Neialor and a cat. The cat — really Neialor — speaks to you telepathically and pleads for help.',
    kingdom: 'Naradreth',
    acquisition: {
      description: 'Encounter a cat in any village in Naradreth. It speaks to you telepathically.',
      trigger: { type: 'ai_judgment', description: 'Player encounters a telepathic cat in any Naradreth village.' },
    },
    objectives: [
      {
        id: 'hear_neialor',
        text: "Listen to Neialor's (the cat's) story.",
        type: 'talk',
        target: { npc: "Neialor (cat)" },
        completion: { type: 'talkedTo', npc: 'Neialor' },
        onComplete: { setFlag: { key: 'neialor_met', value: true } },
      },
      {
        id: 'find_neialors_body',
        text: "Follow Neialor to find where his original body was last seen.",
        type: 'travel',
        target: { npc: 'Neialor', hint: "Locals in a nearby city talk about a 'mad elf' acting like a cat who has been locked in a dungeon." },
        completion: { type: 'location', location: 'Naradreth dungeon' },
        onComplete: { setFlag: { key: 'body_found', value: true } },
      },
      {
        id: 'read_sorceress_note',
        text: "Locate Neialor's body and find the note from the sorceress in his pocket.",
        type: 'search',
        target: { location: 'Naradreth dungeon' },
        completion: { type: 'flag', key: 'note_found', value: true },
        onComplete: { setFlag: { key: 'note_found', value: true } },
      },
      {
        id: 'find_sorceress',
        text: "Find the sorceress. Neialor will now reveal what he did to deserve this.",
        type: 'travel',
        target: { npc: 'Sorceress' },
        completion: { type: 'talkedTo', npc: 'Sorceress' },
        onComplete: { setFlag: { key: 'sorceress_found', value: true } },
      },
      {
        id: 'choose_side',
        text: 'Decide: convince the sorceress to reverse the spell, or side with her against Neialor.',
        type: 'choose',
        target: {},
        completion: { type: 'choiceMade', branchId: null },
        branches: [
          {
            id: 'side_neialor',
            text: "Convince the sorceress to reverse the spell and restore Neialor.",
            objectives: [
              {
                id: 'convince_sorceress',
                text: 'Persuade the sorceress to undo the soul swap.',
                type: 'complete',
                target: {},
                completion: {
                  type: 'ai_judgment',
                  description: 'Player has successfully convinced the sorceress. She reverses the spell and Neialor is restored.',
                },
                onComplete: { setFlag: { key: 'neialors_dilemma_complete', value: true } },
              },
            ],
            rewards: {
              gold: 100,
              experience: 150,
              skills: { Persuasion: 3 },
              items: [],
              special: [],
            },
          },
          {
            id: 'side_sorceress',
            text: "Side with the sorceress and leave Neialor in the cat's body.",
            objectives: [
              {
                id: 'abandon_neialor',
                text: 'Leave Neialor to his fate in the cat body.',
                type: 'complete',
                target: {},
                completion: { type: 'flag', key: 'neialor_abandoned', value: true },
                onComplete: {
                  setFlag: { key: 'neialor_abandoned', value: true },
                  setFlag: { key: 'neialors_dilemma_complete', value: true },
                },
              },
            ],
            rewards: {
              gold: 0,
              experience: 125,
              skills: {},
              items: [
                {
                  questItem: 'book_of_spells',
                  displayName: "Sorceress's Book of Spells",
                  description: 'A rare and unique collection of spells, given by the sorceress in gratitude.',
                  rarity: 'epic',
                  itemType: 'misc',
                  consumable: false,
                  wearable: false,
                  weight: 0.8,
                  value: 200,
                },
              ],
              special: [],
            },
          },
        ],
      },
    ],
    rewards: {
      gold: 0,
      experience: 0,
      skills: {},
      items: [],
      special: [],
    },
  },

  {
    id: 'the_secrets_of_sareia',
    name: 'The Secrets of Sareia',
    type: 'side',
    categories: ['Missing persons', 'Mysteries/Unexplainable Events', 'Old legends/folk tales', 'Investigating rumors'],
    description: "Nithrond's Elven Loremasters Society was founded by the loremaster Sareia, who vanished long ago. Completing this quest earns membership and unlocks the Grand Archives.",
    kingdom: 'Nithrond',
    acquisition: {
      description: 'Talk to members of the Elven Loremasters Society in Nithrond. Speak to all 11 elder members to gather all clues.',
      trigger: { type: 'talkToNPC', npc: 'Elven Loremasters Society member', location: 'Nithrond' },
    },
    objectives: [
      {
        id: 'speak_to_all_elders',
        text: "Speak with all 11 elder members of the Elven Loremasters Society to gather clues about Sareia's disappearance.",
        type: 'talk',
        target: { npc: 'All 11 elders', hint: 'Each elder holds one piece of the puzzle.' },
        completion: { type: 'flag', key: 'all_elders_spoken', value: true },
        onComplete: { setFlag: { key: 'all_elders_spoken', value: true } },
      },
      {
        id: 'follow_clues',
        text: "Follow the trail of clues to various locations, each leading to the next.",
        type: 'search',
        target: { hint: 'Each location holds another clue. Follow the chain until you find the final destination.' },
        completion: { type: 'flag', key: 'final_clue_found', value: true },
        onComplete: { setFlag: { key: 'final_clue_found', value: true } },
      },
      {
        id: 'find_sareias_remains',
        text: "Discover Sareia's remains and learn what happened to her.",
        type: 'search',
        target: { area: "Sareia's resting place" },
        completion: { type: 'flag', key: 'sareia_found', value: true },
        onComplete: {
          setFlag: { key: 'sareia_found', value: true },
          giveItem: {
            questItem: 'proof_of_sareia',
            displayName: "Sareia's Token",
            description: 'Physical proof of the discovery of Sareia\'s remains, taken to the Loremasters Society as evidence.',
            rarity: 'rare',
            itemType: 'misc',
            consumable: false,
            wearable: false,
            weight: 0.1,
            value: 0,
          },
        },
      },
      {
        id: 'report_findings',
        text: 'Return to one of the elder members with proof of your discovery.',
        type: 'deliver',
        target: { npc: 'Elven Loremasters elder', item: "Sareia's Token", qty: 1 },
        completion: { type: 'delivered', npc: 'Elven Loremasters elder', item: "Sareia's Token" },
        onComplete: {
          removeItem: { name: "Sareia's Token", qty: 1 },
          setFlag: { key: 'secrets_of_sareia_complete', value: true },
        },
      },
    ],
    rewards: {
      gold: 100,
      experience: 200,
      skills: {},
      items: [],
      special: [
        { type: 'membership', organization: 'Elven Loremasters Society', description: 'You are now a member of the Elven Loremasters Society.' },
        { type: 'unlock', feature: 'grand_archives', description: 'Access to the Grand Archives in Nithrond is now granted.' },
        { type: 'reputation', kingdom: 'Nithrond', amount: 20, description: 'Reputation with Nithrond increased.' },
      ],
    },
  },

  {
    id: 'the_whispering_woods',
    name: 'The Whispering Woods',
    type: 'side',
    categories: ['Mysteries/Unexplainable Events', 'Investigating rumors', 'Old legends/folk tales'],
    description: "The ancient woods of Orindroth are haunted. Eerie whispers and ghostly figures have terrorized the villagers.",
    kingdom: 'Orindroth',
    acquisition: {
      description: 'Learn about the phenomenon from locals or any NPC in Orindroth.',
      trigger: { type: 'overhear', location: 'Orindroth' },
    },
    objectives: [
      {
        id: 'investigate_forest',
        text: 'Investigate the Orindroth forest and find the source of the whispers.',
        type: 'search',
        target: { area: 'Orindroth forest', hint: 'The source is a trapped spirit.' },
        completion: { type: 'flag', key: 'spirit_found', value: true },
        onComplete: { setFlag: { key: 'spirit_found', value: true } },
      },
      {
        id: 'release_spirit',
        text: 'Find a way to release the trapped spirit.',
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: 'Player has discovered and carried out the method to free the trapped spirit from its prison in the forest.',
        },
        onComplete: { setFlag: { key: 'whispering_woods_complete', value: true } },
      },
    ],
    rewards: {
      gold: 50,
      experience: 100,
      skills: {},
      items: [
        {
          questItem: 'enchanted_amulet_spirit',
          displayName: 'Amulet of the Forest Spirit',
          description: 'Given by the grateful spirit upon release. Grants protection against dark magic.',
          rarity: 'rare',
          itemType: 'armor',
          consumable: false,
          wearable: true,
          weight: 0.2,
          value: 80,
        },
      ],
      special: [],
    },
  },

  {
    id: 'the_lost_dwarven_expedition',
    name: 'The Lost Dwarven Expedition',
    type: 'side',
    categories: ['Missing persons', 'Beast hunting', 'Exploration', 'Lost/stolen item retrieval'],
    description: "Dwarven explorers from Feldarún ventured into the Murkridge Hollows searching for a stolen relic — and haven't returned.",
    kingdom: 'Feldarún',
    acquisition: {
      description: 'Learn about the missing dwarves from any NPC in Feldarún — a tavern barkeep is most likely to know.',
      trigger: { type: 'overhear', location: 'Feldarún' },
    },
    objectives: [
      {
        id: 'enter_hollows',
        text: 'Navigate the Murkridge Hollows in search of the missing dwarves.',
        type: 'travel',
        target: { area: 'Murkridge Hollows' },
        completion: { type: 'location', location: 'Murkridge Hollows' },
        onComplete: { setFlag: { key: 'hollows_entered', value: true } },
      },
      {
        id: 'fight_through_hollows',
        text: 'Battle through goblins, cave trolls, and other beasts to push deeper.',
        type: 'defeat',
        target: { enemy: 'Goblins and cave trolls', hint: 'Multiple encounters throughout the Hollows.' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has fought through the major enemy encounters in the Hollows and progressed toward the dwarves.',
        },
        onComplete: { setFlag: { key: 'hollows_fought_through', value: true } },
      },
      {
        id: 'rescue_dwarves',
        text: "Find the missing dwarves and rescue them. (They went in after a relic stolen by goblins.)",
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: 'Player has located the dwarven explorers, dealt with the goblin holding the relic, and led the dwarves to safety.',
        },
        onComplete: { setFlag: { key: 'lost_expedition_complete', value: true } },
      },
    ],
    rewards: {
      gold: 150,
      experience: 175,
      skills: { Swordsmanship: 2, Brawling: 2 },
      items: [
        { generated: true, rarity: 'rare', itemType: 'misc', description: 'An ancient dwarven artifact recovered from the Hollows.' },
      ],
      special: [
        { type: 'reputation', kingdom: 'Feldarún', amount: 15, description: 'Reputation with Feldarún increased.' },
      ],
    },
  },

  {
    id: 'the_dragons_demand',
    name: "The Dragon's Demand",
    type: 'side',
    categories: ['Beast sightings', 'Beast hunting', 'Attacks/Assaults/Sieges', 'Diplomacy'],
    description: 'A dragon in the Ironback Mountains has been terrorizing villages in Feldarún, demanding tribute.',
    kingdom: 'Feldarún',
    acquisition: {
      description: 'Learn about it from any NPC in Feldarún or overhear it.',
      trigger: { type: 'overhear', location: 'Feldarún' },
    },
    objectives: [
      {
        id: 'find_dragon',
        text: 'Travel to the Ironback Mountains and confront the dragon.',
        type: 'travel',
        target: { area: 'Ironback Mountains', npc: 'Dragon' },
        completion: { type: 'location', location: 'Ironback Mountains' },
        onComplete: { setFlag: { key: 'dragon_found', value: true } },
      },
      {
        id: 'deal_with_dragon',
        text: 'Decide how to handle the situation.',
        type: 'complete',
        target: { hint: 'You may fight the dragon, negotiate with it, bribe it, or find another creative solution.' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has resolved the dragon situation by any means — combat, negotiation, or otherwise. Villages are no longer being terrorized.',
        },
        onComplete: { setFlag: { key: 'dragons_demand_complete', value: true } },
      },
    ],
    rewards: {
      gold: 200,
      experience: 175,
      skills: {},
      items: [
        { generated: true, rarity: 'epic', itemType: 'misc', description: "Treasure from the dragon's lair." },
      ],
      special: [
        { type: 'reputation', kingdom: 'Feldarún', amount: 10 },
      ],
    },
  },

  {
    id: 'the_festival_sabotage',
    name: 'The Festival Sabotage',
    type: 'side',
    categories: ['Investigating rumors', 'Assassination attempts', 'Mysteries/Unexplainable Events'],
    description: "The annual Harvest Festival in Ardrenhold's capital is under threat from a mysterious group plotting to ruin it.",
    kingdom: 'Ardrenhold',
    acquisition: {
      description: "One of the King's servants approaches the player for help while they are in Ardrenkeep.",
      trigger: { type: 'talkToNPC', npc: "King's servant", location: 'Ardrenkeep' },
    },
    objectives: [
      {
        id: 'infiltrate_group',
        text: 'Infiltrate the group threatening the festival.',
        type: 'complete',
        target: {},
        completion: { type: 'flag', key: 'group_infiltrated', value: true },
        onComplete: { setFlag: { key: 'group_infiltrated', value: true } },
      },
      {
        id: 'uncover_plans',
        text: "Uncover the group's full plan.",
        type: 'search',
        target: {},
        completion: { type: 'flag', key: 'plans_uncovered', value: true },
        onComplete: { setFlag: { key: 'plans_uncovered', value: true } },
      },
      {
        id: 'stop_sabotage',
        text: 'Stop the sabotage before the festival is ruined.',
        type: 'complete',
        target: { hint: 'Act on what you have learned to prevent the sabotage from succeeding.' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has prevented the sabotage. The Harvest Festival proceeds without incident.',
        },
        onComplete: { setFlag: { key: 'festival_sabotage_complete', value: true } },
      },
    ],
    rewards: {
      gold: 150,
      experience: 150,
      skills: { Stealth: 2 },
      items: [],
      special: [
        { type: 'title', value: 'Hero of the Harvest', description: 'A title of honor bestowed by the King of Ardrenhold.' },
        { type: 'reputation', kingdom: 'Ardrenhold', amount: 20 },
      ],
    },
  },

  {
    id: 'secrets_of_the_sea_serpent',
    name: 'Secrets of the Sea Serpent',
    type: 'side',
    categories: ['Beast sightings', 'Beast hunting', 'Exploration', 'Old legends/folk tales'],
    description: 'Sailors from Sapphire Harbor whisper of a sea serpent guarding an underwater cavern filled with treasure.',
    kingdom: 'Brythwen',
    acquisition: {
      description: 'Overhear from locals in Brythwen or speak with sailors in a tavern.',
      trigger: { type: 'overhear', location: 'Brythwen' },
    },
    objectives: [
      {
        id: 'find_cavern',
        text: 'Find the underwater cavern off the coast of Brythwen.',
        type: 'travel',
        target: { area: 'Underwater cavern', hint: "Sailors may know the general location. The sea serpent guards the entrance." },
        completion: { type: 'location', location: 'Underwater cavern' },
        onComplete: { setFlag: { key: 'cavern_found', value: true } },
      },
      {
        id: 'deal_with_serpent',
        text: "Deal with the sea serpent and discover the cavern's secrets.",
        type: 'complete',
        target: { hint: 'You may fight, distract, or find another way past the serpent.' },
        completion: {
          type: 'ai_judgment',
          description: "Player has gotten past or dealt with the sea serpent and explored the cavern's interior.",
        },
        onComplete: { setFlag: { key: 'sea_serpent_complete', value: true } },
      },
    ],
    rewards: {
      gold: 100,
      experience: 125,
      skills: {},
      items: [
        {
          questItem: 'oceanic_artifact',
          displayName: 'Oceanic Artifact',
          description: 'A rare artifact recovered from the sea serpent\'s cavern. Its purpose is unclear.',
          rarity: 'rare',
          itemType: 'misc',
          consumable: false,
          wearable: false,
          weight: 1.0,
          value: 150,
        },
      ],
      special: [],
    },
  },

  {
    id: 'the_forgotten_library',
    name: 'The Forgotten Library of Elven Magic',
    type: 'side',
    categories: ['Exploration', 'Exploring ancient ruins', 'Magical artifacts', 'Old legends/folk tales'],
    description: 'Legends speak of a hidden library in Nithrond filled with ancient, long-forgotten elven magic.',
    kingdom: 'Nithrond',
    acquisition: {
      description: 'Overhear about it or speak with NPCs in Nithrond.',
      trigger: { type: 'overhear', location: 'Nithrond' },
    },
    objectives: [
      {
        id: 'find_library',
        text: 'Locate the hidden library in Nithrond.',
        type: 'travel',
        target: { area: 'Hidden Elven Library' },
        completion: { type: 'location', location: 'Hidden Elven Library' },
        onComplete: { setFlag: { key: 'library_found', value: true } },
      },
      {
        id: 'navigate_traps',
        text: 'Navigate the traps and puzzles protecting the library interior.',
        type: 'survive',
        target: {},
        completion: { type: 'flag', key: 'library_traps_passed', value: true },
        onComplete: { setFlag: { key: 'library_traps_passed', value: true } },
      },
      {
        id: 'retrieve_tome',
        text: 'Retrieve the tome of forgotten elven lore and magic spells.',
        type: 'acquire',
        target: { item: 'Tome of Forgotten Elven Magic' },
        completion: { type: 'hasItem', item: 'Tome of Forgotten Elven Magic', qty: 1 },
        onComplete: {
          giveItem: {
            questItem: 'tome_forgotten_elven_magic',
            displayName: 'Tome of Forgotten Elven Magic',
            description: 'An ancient elven tome containing spells and knowledge lost for centuries.',
            rarity: 'legendary',
            itemType: 'misc',
            consumable: false,
            wearable: false,
            weight: 1.2,
            value: 500,
          },
          setFlag: { key: 'forgotten_library_complete', value: true },
        },
      },
    ],
    rewards: {
      gold: 0,
      experience: 175,
      skills: { 'Light Magic': 3 },
      items: [],
      special: [
        { type: 'reputation', kingdom: 'Nithrond', amount: 15 },
        { type: 'skill_unlock', skill: 'Light Magic', description: 'Grants or advances knowledge of ancient elven spell forms.' },
      ],
    },
  },

  {
    id: 'the_bandit_kings_bounty',
    name: "The Bandit King's Bounty",
    type: 'side',
    categories: ['Bounty hunting', 'Attacks/Assaults/Sieges'],
    description: 'A notorious bandit king has amassed a large bounty on his head — but he is well-guarded and elusive.',
    kingdom: null,
    acquisition: {
      description: 'Tasked by a figure of moderate authority in any human city — found in a tavern, marketplace, or by exploring.',
      trigger: { type: 'talkToNPC', npc: 'Authority figure', location: 'any human city' },
    },
    objectives: [
      {
        id: 'track_bandit_king',
        text: 'Track down the bandit king. Navigate treacherous territory and face his followers.',
        type: 'travel',
        target: { npc: 'Bandit King', hint: 'The bandit king moves between hideouts. Gather intelligence from locals or enemies.' },
        completion: { type: 'talkedTo', npc: 'Bandit King' },
        onComplete: { setFlag: { key: 'bandit_king_found', value: true } },
      },
      {
        id: 'deal_with_bandit_king',
        text: 'Capture or defeat the bandit king.',
        type: 'defeat',
        target: { enemy: 'Bandit King' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has captured or defeated the bandit king. The bounty is claimable.',
        },
        onComplete: { setFlag: { key: 'bandit_king_bounty_complete', value: true } },
      },
    ],
    rewards: {
      gold: 200,
      experience: 150,
      skills: { Swordsmanship: 2, Stealth: 1 },
      items: [
        { generated: true, rarity: 'rare', itemType: 'misc', description: "An item from the bandit king's personal collection." },
      ],
      special: [],
    },
  },

  {
    id: 'the_enchanted_grove_heist',
    name: 'The Enchanted Grove Heist',
    type: 'side',
    categories: ['Ingredient retrieval', 'Magical artifacts', 'Exploration'],
    description: 'A rare magical flower blooms in an enchanted grove. The Apothecary Guild wants a sample for its powerful healing properties.',
    kingdom: null,
    acquisition: {
      description: 'Any member of the Apothecary Guild can give the player this quest. Members can be found anywhere in the land.',
      trigger: { type: 'talkToNPC', npc: 'Apothecary Guild member', location: 'any' },
    },
    objectives: [
      {
        id: 'find_grove',
        text: 'Locate the enchanted grove.',
        type: 'travel',
        target: { area: 'Enchanted Grove' },
        completion: { type: 'location', location: 'Enchanted Grove' },
        onComplete: { setFlag: { key: 'grove_found', value: true } },
      },
      {
        id: 'extract_flower',
        text: 'Extract a sample of the magical flower. It is guarded by mystical creatures and traps.',
        type: 'acquire',
        target: { item: 'Enchanted Healing Flower', hint: 'Get past or deal with the grove guardians.' },
        completion: { type: 'hasItem', item: 'Enchanted Healing Flower', qty: 1 },
        onComplete: {
          giveItem: {
            questItem: 'enchanted_healing_flower',
            displayName: 'Enchanted Healing Flower',
            description: 'A rare magical flower with powerful healing properties. Can be used to craft a potent healing potion.',
            rarity: 'epic',
            itemType: 'misc',
            consumable: false,
            wearable: false,
            weight: 0.1,
            value: 200,
          },
          setFlag: { key: 'flower_extracted', value: true },
        },
      },
    ],
    rewards: {
      gold: 75,
      experience: 100,
      skills: { Alchemy: 2 },
      items: [],
      special: [
        { type: 'membership', organization: 'Apothecary Guild', description: 'Recognition and standing with the Apothecary Guild.' },
      ],
    },
  },

  {
    id: 'the_ghost_ship',
    name: 'The Ghost Ship of Brythwen Bay',
    type: 'side',
    categories: ['Mysteries/Unexplainable Events', 'Investigating rumors', 'Old legends/folk tales'],
    description: 'A ghostly ship appears off the Brythwen coast at night, vanishing into the fog before anyone can reach it.',
    kingdom: 'Brythwen',
    acquisition: {
      description: 'Overhear from locals in Brythwen or speak with sailors in a tavern or anywhere in Brythwen.',
      trigger: { type: 'overhear', location: 'Brythwen' },
    },
    objectives: [
      {
        id: 'find_ghost_ship',
        text: 'Locate and board the ghost ship.',
        type: 'travel',
        target: { area: 'Ghost Ship, Brythwen Bay' },
        completion: { type: 'location', location: 'Ghost Ship' },
        onComplete: { setFlag: { key: 'ghost_ship_found', value: true } },
      },
      {
        id: 'uncover_ships_story',
        text: "Investigate the ship and uncover its story.",
        type: 'search',
        target: { hint: 'Restless spirits inhabit the ship. Communicate with them to learn what happened.' },
        completion: { type: 'flag', key: 'ships_story_uncovered', value: true },
        onComplete: { setFlag: { key: 'ships_story_uncovered', value: true } },
      },
      {
        id: 'lay_spirits_to_rest',
        text: 'Lay the restless spirits of the ship to rest.',
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: 'Player has fulfilled whatever the spirits needed — resolved their unfinished business and put them to rest.',
        },
        onComplete: { setFlag: { key: 'ghost_ship_complete', value: true } },
      },
    ],
    rewards: {
      gold: 50,
      experience: 125,
      skills: {},
      items: [
        {
          questItem: 'nautical_artifact',
          displayName: 'Nautical Artifact',
          description: 'An old artifact from the ghost ship, connected to a life at sea.',
          rarity: 'rare',
          itemType: 'misc',
          consumable: false,
          wearable: false,
          weight: 0.8,
          value: 100,
        },
        {
          questItem: 'sunken_treasure_map',
          displayName: 'Map to Sunken Treasure',
          description: 'A waterlogged map found aboard the ghost ship marking the location of sunken treasure.',
          rarity: 'rare',
          itemType: 'misc',
          consumable: false,
          wearable: false,
          weight: 0.1,
          value: 50,
        },
      ],
      special: [],
    },
  },

  {
    id: 'the_silent_tower',
    name: 'The Silent Tower',
    type: 'side',
    categories: ['Mysteries/Unexplainable Events', 'Exploring ancient ruins', 'Investigating rumors', 'Old legends/folk tales'],
    description: "An abandoned wizard's tower sits in the woods south of Ardrenhold. Locals speak of it in hushed tones.",
    kingdom: 'Ardrenhold',
    acquisition: {
      description: 'Overhear or speak with locals in Ardrenhold.',
      trigger: { type: 'overhear', location: 'Ardrenhold' },
    },
    objectives: [
      {
        id: 'find_tower',
        text: "Travel to the abandoned wizard's tower south of Ardrenhold.",
        type: 'travel',
        target: { area: "Wizard's Tower" },
        completion: { type: 'location', location: "Wizard's Tower" },
        onComplete: { setFlag: { key: 'tower_found', value: true } },
      },
      {
        id: 'investigate_tower',
        text: "Investigate the tower. Discover the wizard's fate and the tower's dark history.",
        type: 'search',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: "Player has explored the tower fully and uncovered both the wizard's fate and the reason the tower was abandoned.",
        },
        onComplete: { setFlag: { key: 'silent_tower_complete', value: true } },
      },
    ],
    rewards: {
      gold: 0,
      experience: 100,
      skills: {},
      items: [
        { generated: true, rarity: 'rare', itemType: 'misc', description: 'Loot found inside the tower — runes, gold, or magical items.' },
      ],
      special: [],
    },
  },

  {
    id: 'echoes_in_the_stone',
    name: 'Echoes in the Stone',
    type: 'side',
    categories: ['Mysteries/Unexplainable Events', 'Beast hunting', 'Investigating rumors'],
    description: "Dwarven miners in Wistravael refuse to return to one of their mines after hearing whispers and encountering a terrible entity deep inside.",
    kingdom: 'Wistravael',
    acquisition: {
      description: 'Overhear or speak with Wistravael locals or the miners.',
      trigger: { type: 'overhear', location: 'Wistravael' },
    },
    objectives: [
      {
        id: 'enter_mine',
        text: 'Enter the abandoned mine.',
        type: 'travel',
        target: { area: 'Haunted Mine, Wistravael' },
        completion: { type: 'location', location: 'Haunted Mine' },
        onComplete: { setFlag: { key: 'mine_entered', value: true } },
      },
      {
        id: 'find_source',
        text: 'Discover the source of the whispers.',
        type: 'search',
        target: {},
        completion: { type: 'flag', key: 'whisper_source_found', value: true },
        onComplete: { setFlag: { key: 'whisper_source_found', value: true } },
      },
      {
        id: 'rid_mine',
        text: 'Rid the mine of the creature by whatever means necessary.',
        type: 'defeat',
        target: { enemy: 'Mine creature', hint: 'The nature of the creature is unknown until found.' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has eliminated or driven off the creature haunting the mine. The miners can safely return.',
        },
        onComplete: { setFlag: { key: 'echoes_in_stone_complete', value: true } },
      },
    ],
    rewards: {
      gold: 100,
      experience: 125,
      skills: {},
      items: [
        {
          questItem: 'rare_gemstone',
          displayName: 'Rare Gemstone',
          description: 'A rare gemstone gifted by the grateful miners.',
          rarity: 'rare',
          itemType: 'misc',
          consumable: false,
          wearable: false,
          weight: 0.2,
          value: 120,
        },
      ],
      special: [
        { type: 'reputation', kingdom: 'Wistravael', amount: 15 },
      ],
    },
  },

  {
    id: 'the_curse_of_the_weeping_widow',
    name: 'The Curse of the Weeping Widow',
    type: 'side',
    categories: ['Mysteries/Unexplainable Events', 'Old legends/folk tales', 'Murders', 'Investigating rumors'],
    description: 'A village is haunted by the ghost of a widow said to have drowned in a nearby lake.',
    kingdom: null,
    acquisition: {
      description: 'Overhear or speak with locals in any village.',
      trigger: { type: 'overhear', location: 'any village' },
    },
    objectives: [
      {
        id: 'investigate_haunting',
        text: 'Investigate the haunting and uncover the widow\'s tragic story.',
        type: 'search',
        target: {},
        completion: { type: 'flag', key: 'widows_story_known', value: true },
        onComplete: { setFlag: { key: 'widows_story_known', value: true } },
      },
      {
        id: 'lay_widow_to_rest',
        text: 'Find a way to lay the widow\'s ghost to rest.',
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: "Player has learned what the widow's spirit needs to find peace and has fulfilled it.",
        },
        onComplete: { setFlag: { key: 'weeping_widow_complete', value: true } },
      },
    ],
    rewards: {
      gold: 40,
      experience: 75,
      skills: {},
      items: [
        {
          questItem: 'widows_locket',
          displayName: "Widow's Locket",
          description: "A locket once belonging to the widow, retrieved from its buried hiding place. Imbued with protective magic.",
          rarity: 'uncommon',
          itemType: 'armor',
          consumable: false,
          wearable: true,
          weight: 0.1,
          value: 60,
        },
      ],
      special: [],
    },
  },

  {
    id: 'beneath_the_gallows_tree',
    name: 'Beneath the Gallows Tree',
    type: 'side',
    categories: ['Mysteries/Unexplainable Events', 'Murders', 'Old legends/folk tales', 'Investigating rumors'],
    description: 'Travelers go out of their way to avoid a notorious tree — site of past executions — claiming it is cursed and haunted by wights.',
    kingdom: null,
    acquisition: {
      description: 'Overhear or speak with locals in any village.',
      trigger: { type: 'overhear', location: 'any village' },
    },
    objectives: [
      {
        id: 'investigate_tree',
        text: 'Investigate the gallows tree.',
        type: 'travel',
        target: { area: 'Gallows Tree' },
        completion: { type: 'location', location: 'Gallows Tree' },
        onComplete: { setFlag: { key: 'gallows_tree_found', value: true } },
      },
      {
        id: 'face_wights',
        text: 'Face the wights and uncover the truth about the unjustly hanged.',
        type: 'defeat',
        target: { enemy: 'Wights', hint: 'Understanding their story may be as important as defeating them.' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has defeated or resolved the wights and learned the history of those who were unjustly executed here.',
        },
        onComplete: { setFlag: { key: 'gallows_tree_complete', value: true } },
      },
    ],
    rewards: {
      gold: 50,
      experience: 75,
      skills: {},
      items: [
        { generated: true, rarity: 'uncommon', itemType: 'misc', description: 'Gold or items from grateful travelers who avoided the tree.' },
      ],
      special: [],
    },
  },

  {
    id: 'feast_of_the_fairy_king',
    name: 'Feast of the Fairy King',
    type: 'side',
    categories: ['Old legends/folk tales', 'Exploration', 'Diplomacy'],
    description: 'The Fairy King has extended an invitation to a fantastical feast in an enchanted forest. He expects to be entertained.',
    kingdom: null,
    acquisition: {
      description: 'Meeting any fairy can lead to this quest.',
      trigger: { type: 'ai_judgment', description: 'Player has encountered a fairy who extends the Fairy King\'s invitation.' },
    },
    objectives: [
      {
        id: 'attend_feast',
        text: 'Travel to the enchanted forest and attend the Fairy King\'s feast.',
        type: 'travel',
        target: { area: "Fairy King's Enchanted Grove" },
        completion: { type: 'location', location: "Fairy King's Enchanted Grove" },
        onComplete: { setFlag: { key: 'feast_attended', value: true } },
      },
      {
        id: 'entertain_fairy_king',
        text: 'Participate in the Fairy King\'s whimsical challenges and riddles.',
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: 'Player has completed the challenges and riddles to the Fairy King\'s satisfaction.',
        },
        onComplete: { setFlag: { key: 'fairy_king_pleased', value: true } },
      },
    ],
    rewards: {
      gold: 0,
      experience: 75,
      skills: {},
      items: [
        {
          questItem: 'fairy_trinket',
          displayName: 'Magical Fairy Trinket',
          description: 'A small enchanted trinket gifted by the Fairy King. Radiates a faint magical aura.',
          rarity: 'epic',
          itemType: 'misc',
          consumable: false,
          wearable: true,
          weight: 0.1,
          value: 150,
        },
      ],
      special: [],
    },
  },

  {
    id: 'the_awakening',
    name: 'The Awakening',
    type: 'side',
    categories: ['Beast sightings', 'Beast hunting', 'Attacks/Assaults/Sieges', 'Mysteries/Unexplainable Events'],
    description: 'A colossal Leviathan has awoken in the waters off the Brythwen coast, destroying ships and terrorizing the ports.',
    kingdom: 'Brythwen',
    acquisition: {
      description: 'Visiting any port in Brythwen, the player witnesses the chaos firsthand.',
      trigger: { type: 'visitLocation', location: 'Brythwen port' },
    },
    objectives: [
      {
        id: 'witness_leviathan',
        text: 'Witness the Leviathan\'s destruction at the port.',
        type: 'complete',
        target: {},
        completion: { type: 'location', location: 'Brythwen port' },
        onComplete: { setFlag: { key: 'leviathan_witnessed', value: true } },
      },
      {
        id: 'calm_the_leviathan',
        text: 'Find a way to deal with the Leviathan.',
        type: 'complete',
        target: { hint: 'The Leviathan can be calmed by music. Consider other approaches as well.' },
        completion: {
          type: 'ai_judgment',
          description: 'Player has successfully calmed or otherwise dealt with the Leviathan. The ports are safe again.',
        },
        onComplete: { setFlag: { key: 'awakening_complete', value: true } },
      },
    ],
    rewards: {
      gold: 100,
      experience: 175,
      skills: {},
      items: [
        {
          questItem: 'leviathan_artifact',
          displayName: 'Artifact from the Deep',
          description: 'A nautical artifact of great power, surfaced during the Leviathan encounter.',
          rarity: 'epic',
          itemType: 'misc',
          consumable: false,
          wearable: false,
          weight: 1.5,
          value: 250,
        },
      ],
      special: [],
    },
  },

  {
    id: 'fear_not_the_dark',
    name: 'Fear Not the Dark, but What Lies Within',
    type: 'side',
    categories: ['Beast hunting', 'Mysteries/Unexplainable Events', 'Investigating rumors', 'Attacks/Assaults/Sieges'],
    description: 'Something is terrorizing a village every night. The villagers live in fear.',
    kingdom: null,
    acquisition: {
      description: 'Overhear or speak with locals in any village.',
      trigger: { type: 'overhear', location: 'any village' },
    },
    objectives: [
      {
        id: 'investigate_village',
        text: 'Investigate the village for clues about the creature.',
        type: 'search',
        target: {},
        completion: { type: 'flag', key: 'creature_identified', value: true },
        onComplete: { setFlag: { key: 'creature_identified', value: true } },
      },
      {
        id: 'deal_with_creature',
        text: 'Find a way to deal with the creature.',
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: 'Player has ended the creature\'s nightly terror by whatever means they chose.',
        },
        onComplete: { setFlag: { key: 'fear_not_dark_complete', value: true } },
      },
    ],
    rewards: {
      gold: 75,
      experience: 100,
      skills: {},
      items: [],
      special: [
        { type: 'title', value: 'Protector of the Village', description: 'A title of honor from the village leader.' },
        { type: 'reputation', kingdom: null, description: 'Reputation with the village and surrounding area increased.' },
      ],
    },
  },

  {
    id: 'the_sleepless_knight',
    name: 'The Curse of the Sleepless Knight',
    type: 'side',
    categories: ['Mysteries/Unexplainable Events', 'Helping those in need', 'Magical artifacts'],
    description: "A knight cursed with permanent sleeplessness has turned to the mages' guild for help. They are stumped.",
    kingdom: null,
    acquisition: {
      description: "Player encounters the knight or learns of his plight through the mages' guild.",
      trigger: { type: 'ai_judgment', description: "Player has met the knight or spoken to mages' guild members about his curse." },
    },
    objectives: [
      {
        id: 'meet_cursed_knight',
        text: "Speak with the cursed knight and the mages' guild.",
        type: 'talk',
        target: { npc: 'Cursed Knight' },
        completion: { type: 'talkedTo', npc: 'Cursed Knight' },
        onComplete: { setFlag: { key: 'knight_met', value: true } },
      },
      {
        id: 'lift_the_curse',
        text: "Help the mages' guild find a way to lift the curse. Think creatively — curses are usually only broken by their caster.",
        type: 'complete',
        target: { hint: "The mages note that curses are typically only lifted by those who cast them. An unconventional approach is needed." },
        completion: {
          type: 'ai_judgment',
          description: "Player has discovered and executed a method to lift the curse from the knight, allowing him to sleep again.",
        },
        onComplete: { setFlag: { key: 'sleepless_knight_complete', value: true } },
      },
    ],
    rewards: {
      gold: 0,
      experience: 125,
      skills: {},
      items: [
        { generated: true, rarity: 'legendary', itemType: 'weapon', description: 'A legendary weapon from the grateful knight.' },
      ],
      special: [
        { type: 'membership', organization: "Mages' Guild", description: "Membership into the mages' guild." },
      ],
    },
  },

  {
    id: 'remlys_journal',
    name: "Remly's Journal",
    type: 'side',
    categories: ['Mysteries/Unexplainable Events', 'Murders', 'Missing persons', 'Investigating rumors'],
    description: "A half-rotted corpse in the forest still clutches an old journal. The deceased was Remly — a seasoned traveler who documented the land's greatest mysteries. He was investigating one when he met his end.",
    kingdom: null,
    acquisition: {
      description: 'Player randomly encounters the corpse in any forest.',
      trigger: { type: 'ai_judgment', description: 'Player encounters Remly\'s corpse and reads his journal while exploring any forest.' },
    },
    objectives: [
      {
        id: 'read_journal',
        text: "Read Remly's journal to find out what he was investigating.",
        type: 'use',
        target: { item: "Remly's Journal" },
        completion: { type: 'flag', key: 'journal_read', value: true },
        onComplete: {
          giveItem: {
            questItem: 'remlys_journal',
            displayName: "Remly's Journal",
            description: "A worn journal filled with accounts of the land's unsolved mysteries. The last entries describe whatever Remly was investigating when he died.",
            rarity: 'uncommon',
            itemType: 'misc',
            consumable: false,
            wearable: false,
            weight: 0.4,
            value: 30,
          },
          setFlag: { key: 'journal_read', value: true },
        },
      },
      {
        id: 'search_for_evidence',
        text: "Search the area for evidence of what killed Remly.",
        type: 'search',
        target: { area: 'Forest surrounding the corpse', hint: 'The culprit was a troll.' },
        completion: { type: 'flag', key: 'killer_identified', value: true },
        onComplete: { setFlag: { key: 'killer_identified', value: true } },
      },
      {
        id: 'solve_remlys_mystery',
        text: "Solve the unsolved mystery Remly was investigating.",
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: "Player has fully investigated and resolved the mystery Remly was pursuing when he died.",
        },
        onComplete: { setFlag: { key: 'remlys_journal_complete', value: true } },
      },
    ],
    rewards: {
      gold: 0,
      experience: 100,
      skills: {},
      items: [],
      special: [],
    },
  },

  {
    id: 'the_lovers_plight',
    name: "The Lovers' Plight",
    type: 'side',
    categories: ['Helping those in need', 'Diplomacy', 'Feuds'],
    description: 'Two lovers — one an elf, the other a human — are hunted in Naradreth and desperately need help escaping to safety.',
    kingdom: 'Naradreth',
    acquisition: {
      description: 'Encountered in Naradreth. The couple is in disguise and hiding from authorities.',
      trigger: { type: 'ai_judgment', description: 'Player encounters a disguised couple hiding from Naradreth authorities.' },
    },
    objectives: [
      {
        id: 'meet_lovers',
        text: 'Speak with the couple in hiding.',
        type: 'talk',
        target: { npc: 'The couple' },
        completion: { type: 'talkedTo', npc: 'The couple' },
        onComplete: { setFlag: { key: 'lovers_met', value: true } },
      },
      {
        id: 'overcome_obstacles',
        text: 'Help the lovers navigate hostile family members and cultural barriers.',
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: 'Player has mediated, negotiated, or otherwise resolved the obstacles blocking the couple\'s escape.',
        },
        onComplete: { setFlag: { key: 'obstacles_cleared', value: true } },
      },
      {
        id: 'ensure_safe_passage',
        text: "Ensure the lovers' safe passage to a land where they can live in peace.",
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: 'Player has successfully gotten the couple to safety — out of Naradreth and into a welcoming kingdom.',
        },
        onComplete: { setFlag: { key: 'lovers_plight_complete', value: true } },
      },
    ],
    rewards: {
      gold: 50,
      experience: 125,
      skills: { Persuasion: 3 },
      items: [
        {
          questItem: 'lovers_token',
          displayName: "Token of Gratitude",
          description: "A heartfelt token gifted by the couple after their escape to freedom.",
          rarity: 'uncommon',
          itemType: 'misc',
          consumable: false,
          wearable: false,
          weight: 0.1,
          value: 40,
        },
      ],
      special: [],
    },
  },

  {
    id: 'the_bards_sorrow',
    name: "The Bard's Sorrow",
    type: 'side',
    categories: ['Helping those in need', 'Missing persons', 'Mysteries/Unexplainable Events', 'Investigating rumors'],
    description: 'A renowned bard is drowning his sorrows in a tavern. His beloved has vanished under mysterious circumstances.',
    kingdom: null,
    acquisition: {
      description: 'The bard can be found grieving in any tavern.',
      trigger: { type: 'talkToNPC', npc: 'The Bard', location: 'any tavern' },
    },
    objectives: [
      {
        id: 'speak_with_bard',
        text: 'Hear the bard\'s story.',
        type: 'talk',
        target: { npc: 'The Bard' },
        completion: { type: 'talkedTo', npc: 'The Bard' },
        onComplete: { setFlag: { key: 'bard_met', value: true } },
      },
      {
        id: 'investigate_disappearance',
        text: "Investigate the disappearance of the bard's beloved.",
        type: 'search',
        target: {},
        completion: { type: 'flag', key: 'disappearance_investigated', value: true },
        onComplete: { setFlag: { key: 'disappearance_investigated', value: true } },
      },
      {
        id: 'uncover_truth',
        text: 'Navigate the web of intrigue and betrayal and uncover the tragic truth.',
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: "Player has fully unraveled the story of the bard's beloved's disappearance and delivered the truth to him.",
        },
        onComplete: { setFlag: { key: 'bards_sorrow_complete', value: true } },
      },
    ],
    rewards: {
      gold: 50,
      experience: 100,
      skills: {},
      items: [
        {
          questItem: 'enchanted_lute',
          displayName: 'Enchanted Lute',
          description: "The bard's lute, given in grief and gratitude. Imbued with subtle magic that soothes listeners.",
          rarity: 'epic',
          itemType: 'misc',
          consumable: false,
          wearable: false,
          weight: 1.5,
          value: 200,
        },
      ],
      special: [],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS / LIGHTHEARTED
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'the_great_chicken_chase',
    name: 'The Great Chicken Chase',
    type: 'misc',
    categories: ['Mysteries/Unexplainable Events', 'Helping those in need'],
    description: "A wizard's experimental spell has gone very wrong — all the local livestock are now mischievous chickens with unique magical abilities.",
    kingdom: null,
    acquisition: {
      description: 'Encounter the wizard or the transformed chickens in any village or city.',
      trigger: { type: 'ai_judgment', description: 'Player encounters the wizard and/or magic-imbued chickens roaming around.' },
    },
    objectives: [
      {
        id: 'speak_with_wizard',
        text: 'Find out what happened from the wizard.',
        type: 'talk',
        target: { npc: 'Wizard' },
        completion: { type: 'talkedTo', npc: 'Wizard' },
        onComplete: { setFlag: { key: 'chicken_wizard_met', value: true } },
      },
      {
        id: 'catch_all_chickens',
        text: 'Chase down and catch all the rogue chickens. Each one has a different odd magical ability.',
        type: 'complete',
        target: { hint: 'Each chicken behaves differently due to its magical ability — be creative in catching them.' },
        completion: {
          type: 'ai_judgment',
          description: 'All magically altered chickens have been caught and returned to the wizard.',
        },
        onComplete: { setFlag: { key: 'chicken_chase_complete', value: true } },
      },
    ],
    rewards: {
      gold: 25,
      experience: 50,
      skills: {},
      items: [
        { generated: true, rarity: 'uncommon', itemType: 'misc', description: 'A unique spell from the grateful wizard.' },
      ],
      special: [],
    },
  },

  {
    id: 'the_missing_beard_dilemma',
    name: 'The Missing Beard Dilemma',
    type: 'misc',
    categories: ['Lost/stolen item retrieval', 'Mysteries/Unexplainable Events', 'Feuds'],
    description: "A dwarf woke up to find his prized beard magically shorn clean off. He is furious and demands justice.",
    kingdom: null,
    acquisition: {
      description: 'Encounter the distraught dwarf in any dwarven kingdom.',
      trigger: { type: 'talkToNPC', npc: 'Beardless Dwarf', location: 'any dwarven kingdom' },
    },
    objectives: [
      {
        id: 'hear_dwarfs_woes',
        text: "Hear the dwarf's story and agree to find the beard thief.",
        type: 'talk',
        target: { npc: 'Beardless Dwarf' },
        completion: { type: 'talkedTo', npc: 'Beardless Dwarf' },
        onComplete: { setFlag: { key: 'beard_quest_started', value: true } },
      },
      {
        id: 'track_down_thief',
        text: 'Track down the beard thief through humorous scenarios and eccentric characters.',
        type: 'complete',
        target: {},
        completion: {
          type: 'ai_judgment',
          description: 'Player has tracked down the one responsible for the magical beard-theft and resolved the situation.',
        },
        onComplete: { setFlag: { key: 'beard_dilemma_complete', value: true } },
      },
    ],
    rewards: {
      gold: 20,
      experience: 50,
      skills: {},
      items: [
        {
          questItem: 'beard_growth_potion',
          displayName: 'Beard Growth Potion',
          description: 'A potent potion that grows an impressive beard — or any hair — overnight.',
          rarity: 'uncommon',
          itemType: 'potion',
          consumable: true,
          wearable: false,
          weight: 0.3,
          value: 25,
        },
        {
          questItem: 'dwarven_ale_keg',
          displayName: 'Keg of Finest Dwarven Ale',
          description: 'A small keg of the finest ale the dwarves of this kingdom can brew.',
          rarity: 'uncommon',
          itemType: 'food',
          consumable: true,
          wearable: false,
          weight: 3.0,
          value: 30,
        },
      ],
      special: [],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // THE SLOW BECOMING
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'the_slow_becoming',
    name: 'The Slow Becoming',
    type: 'main',
    categories: ['Mysteries/Unexplainable Events', 'Helping those in need', 'Missing persons', 'Exploration'],
    description: 'A woman calling herself Ithris has crossed your path — beautiful, clever, and clearly keeping something from you. She wants something. Whether she\'ll admit that before it\'s too late remains to be seen.',
    kingdom: null,
    acquisition: {
      description: 'Encountered while traveling. Triggered automatically by a scripted random event.',
      trigger: { type: 'scripted', handler: '_meetIthris' },
    },
    objectives: [
      {
        id: 'meet_ithris',
        text: 'You\'ve met a woman calling herself Ithris. There is something she isn\'t saying. Spend time with her — she seems willing to travel.',
        type: 'complete',
        target: {},
        completion: { type: 'flag', key: 'met_ithris', value: true },
        onComplete: { setFlag: { key: 'met_ithris', value: true } },
      },
      {
        id: 'build_rapport',
        text: 'Get to know Ithris. [Talk to her via the Actions wheel while she travels with you]',
        type: 'complete',
        target: { hint: 'Speak with her several times. She doesn\'t open up easily.' },
        completion: { type: 'flag', key: 'rapport_built', value: true },
        onComplete: { setFlag: { key: 'rapport_built', value: true } },
      },
      {
        id: 'the_truth',
        text: 'Something has shifted between you. The truth is close — one way or another.',
        type: 'complete',
        target: { hint: 'How this plays out depends on what she believes about you.' },
        completion: { type: 'flag', key: 'truth_moment_passed', value: true },
        onComplete: { setFlag: { key: 'truth_moment_passed', value: true } },
      },
      {
        id: 'find_moonwither_herb',
        text: 'Travel to Sivanrift and obtain the Moonwither Herb from the Grand Gardens. Taking from these gardens is forbidden — but there may be another way.',
        type: 'acquire',
        target: { item: 'Moonwither Herb', hint: 'The Grand Gardens of Sivanrift. Ask around — or find your own way in.' },
        completion: { type: 'hasItem', item: 'Moonwither Herb', qty: 1 },
        onComplete: { setFlag: { key: 'herb_obtained', value: true } },
      },
      {
        id: 'find_elf_blood',
        text: 'Obtain a vial of pure, uncorrupted elf blood. Any full-blooded elf will do — so long as they are untainted.',
        type: 'acquire',
        target: { item: 'Vial of Pure Elf Blood', hint: 'She cannot give her own. Her blood is no longer what it was.' },
        completion: { type: 'hasItem', item: 'Vial of Pure Elf Blood', qty: 1 },
        onComplete: { setFlag: { key: 'blood_obtained', value: true } },
      },
      {
        id: 'enter_feldarun_mine',
        text: 'Travel to Feldarún and recover a Veldrite Crystal from the Ironback Mountains. Elves are not welcome there — and Sarsett cannot follow.',
        type: 'acquire',
        target: { item: 'Veldrite Crystal', hint: 'The mine entrance is guarded. There is more than one way past a guard.' },
        completion: { type: 'hasItem', item: 'Veldrite Crystal', qty: 1 },
        onComplete: { setFlag: { key: 'crystal_obtained', value: true } },
      },
      {
        id: 'find_davolar',
        text: 'Find the hermit alchemist Davolar, who lives somewhere near the Crimson Valley. He is the only one who can brew what you need.',
        type: 'travel',
        target: { area: 'Davolar\'s Workshop', hint: 'Ask travelers near the Crimson Valley. Few know of him — but some do.' },
        completion: { type: 'flag', key: 'davolar_found', value: true },
        onComplete: { setFlag: { key: 'davolar_found', value: true } },
      },
      {
        id: 'deliver_to_davolar',
        text: 'Deliver all three ingredients to Davolar and ask him to brew the cure.',
        type: 'deliver',
        target: { npc: 'Davolar', item: 'ingredients', hint: 'He will need the Moonwither Herb, the Vial of Pure Elf Blood, and the Veldrite Crystal.' },
        completion: { type: 'flag', key: 'ingredients_delivered', value: true },
        onComplete: { setFlag: { key: 'ingredients_delivered', value: true } },
      },
      {
        id: 'wait_for_brew',
        text: 'Wait three days for Davolar to complete the cure. He works alone. Return when the time has passed.',
        type: 'sleep',
        target: { hint: 'Rest and wait. Three days is not so long — though for her it may feel otherwise.' },
        completion: { type: 'flag', key: 'brew_complete', value: true },
        onComplete: { setFlag: { key: 'brew_complete', value: true } },
      },
      {
        id: 'administer_cure',
        text: 'Return to Davolar and collect the cure. Then find Sarsett before it is too late.',
        type: 'complete',
        target: {},
        completion: { type: 'flag', key: 'quest_resolved', value: true },
        onComplete: {
          setFlag: { key: 'quest_resolved', value: true },
          setPlayerFlag: { key: 'corruptionImmune', value: false },
        },
      },
    ],
    rewards: {
      experience: 800,
      gold: 0,
      items: [],
      skills: { Persuasion: 4, Mysticism: 3 },
      special: [
        { type: 'flag', key: 'completed_slow_becoming', value: true },
        { type: 'reputation', kingdom: 'Nithrond', value: 20 },
      ],
    },
  },

];
