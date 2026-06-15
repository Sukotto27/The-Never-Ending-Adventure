// ============================================================
// PROFESSION TIERS & SKILL CONTEXTUAL ACTIONS
// ============================================================
// Loaded before script.js. Provides PROFESSION_TIER_DATA and
// SKILL_CONTEXTUAL_ACTIONS as plain globals.
//
// Tier index (inst.tier) is 0-based:
//   0 = tiers[0] (Novice equivalent)
//   1 = tiers[1] (Journeyman equivalent)
//   2 = tiers[2] (Expert equivalent)
//   3 = tiers[3] (Master equivalent)
//
// xpThresholds[i] = XP needed to advance FROM tier i TO tier i+1
// tierActions[i]  = actions unlocked AT tier i (T0 is always [])
//
// responsibilities[i] = tasks required to advance FROM tier i TO tier i+1
//   Each entry: { label, event, required }
//   event must match a key fired by awardProfessionXp() or the responsibility tracker

const PROFESSION_TIER_DATA = {

  Adventurer: {
    tiers: ['Wanderer', 'Adventurer', 'Veteran', 'Legend'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 1, quest_complete: 2 },
    tierActions: [
      [],
      [{ id: 'second_wind',       label: '💨 Second Wind',       desc: 'Recover 20 stamina instantly.' }],
      [{ id: 'warriors_instinct', label: '🔍 Size Up',           desc: 'Reveal enemy HP and damage range before committing.' }],
      [{ id: 'legendary_strike',  label: '⚔️ Legendary Strike', desc: 'A blow that cannot roll below Tier 4. Costs 15 stamina.', staminaCost: 15 }],
    ],
    responsibilities: [
      [
        { label: 'Survive 5 battles',        event: 'combat_victory', required: 5 },
        { label: 'Complete your first quest', event: 'quest_complete', required: 1 },
      ],
      [
        { label: 'Win 15 battles',    event: 'combat_victory', required: 15 },
        { label: 'Complete 3 quests', event: 'quest_complete', required: 3 },
      ],
      [
        { label: 'Win 30 battles',    event: 'combat_victory', required: 30 },
        { label: 'Complete 8 quests', event: 'quest_complete', required: 8 },
      ],
    ],
  },

  Alchemist: {
    tiers: ['Apprentice', 'Brewer', 'Alchemist', 'Grand Alchemist'],
    xpThresholds: [10, 30, 60],
    xpSources: { brew: 3, craft: 1 },
    tierActions: [
      [],
      [{ id: 'prof_quick_brew',  label: '⚗️ Quick Brew',     desc: 'Brew a basic Health Potion from herbs in your pack.' }],
      [{ id: 'transmute',        label: '🔄 Transmute',       desc: 'Convert 5 common materials into 1 uncommon material.' }],
      [{ id: 'master_formula',   label: '✨ Master Formula',  desc: 'Next brew yields double quantity at maximum quality.' }],
    ],
    responsibilities: [
      [
        { label: 'Brew 3 potions or remedies', event: 'brew',  required: 3 },
        { label: 'Craft 2 alchemical items',   event: 'craft', required: 2 },
      ],
      [
        { label: 'Brew 10 potions or remedies', event: 'brew',  required: 10 },
        { label: 'Craft 6 alchemical items',    event: 'craft', required: 6 },
      ],
      [
        { label: 'Brew 25 potions or remedies', event: 'brew',  required: 25 },
        { label: 'Craft 15 alchemical items',   event: 'craft', required: 15 },
      ],
    ],
  },

  Archer: {
    tiers: ['Novice', 'Marksman', 'Sharpshooter', 'Master Archer'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 1, hunt: 1 },
    tierActions: [
      [],
      [{ id: 'steady_aim', label: '🎯 Steady Aim',   desc: 'Aim carefully — attack but take no counterattack this round.' }],
      [{ id: 'volley',     label: '🏹 Volley',        desc: 'Rapid shots force the enemy to dodge — they lose their next strike.' }],
      [{ id: 'eagle_eye',  label: '🦅 Eagle Eye',     desc: 'Your aim is true. Archery checks cannot roll below Tier 3 this combat.' }],
    ],
    responsibilities: [
      [
        { label: 'Win 5 battles using ranged attacks', event: 'combat_victory', required: 5 },
        { label: 'Hunt 3 animals with a bow',          event: 'hunt',           required: 3 },
      ],
      [
        { label: 'Win 15 battles', event: 'combat_victory', required: 15 },
        { label: 'Hunt 10 animals', event: 'hunt',          required: 10 },
      ],
      [
        { label: 'Win 30 battles', event: 'combat_victory', required: 30 },
        { label: 'Hunt 20 animals', event: 'hunt',          required: 20 },
      ],
    ],
  },

  Assassin: {
    tiers: ['Shadow', 'Blade', 'Assassin', 'Phantom'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 2, npc_talk: 1 },
    tierActions: [
      [],
      [{ id: 'shadow_step',  label: '🌑 Shadow Step',   desc: 'Melt into the shadows. Flee without a Survival check.' }],
      [{ id: 'mark_target',  label: '🎯 Mark Target',   desc: 'Mark the enemy — they take +3 damage from every party hit.' }],
      [{ id: 'silent_kill',  label: '🗡️ Silent Kill',  desc: 'If the enemy is below 40% HP, vanish and end them. No counterattack.' }],
    ],
    responsibilities: [
      [
        { label: 'Eliminate 5 targets in battle',  event: 'combat_victory', required: 5 },
        { label: 'Gather intelligence from 5 NPCs', event: 'npc_talk',      required: 5 },
      ],
      [
        { label: 'Eliminate 15 targets',  event: 'combat_victory', required: 15 },
        { label: 'Complete 2 contracts',  event: 'quest_complete',  required: 2 },
      ],
      [
        { label: 'Eliminate 30 targets', event: 'combat_victory', required: 30 },
        { label: 'Complete 5 contracts', event: 'quest_complete',  required: 5 },
      ],
    ],
  },

  Bard: {
    tiers: ['Minstrel', 'Troubadour', 'Bard', 'Virtuoso'],
    xpThresholds: [10, 30, 60],
    xpSources: { npc_talk: 2, social_success: 1 },
    tierActions: [
      [],
      [{ id: 'ballad',          label: '🎵 Ballad',          desc: 'A rousing song — applies Inspired to you and all party members.' }],
      [{ id: 'tale_of_valor',   label: '📖 Tale of Valor',   desc: 'Recount a great deed — double skill XP gained until next rest.' }],
      [{ id: 'epic_performance',label: '🎭 Epic Performance', desc: 'A legendary show — all NPCs in the settlement become Friendly.' }],
    ],
    responsibilities: [
      [
        { label: 'Perform for 8 different people',     event: 'npc_talk',      required: 8 },
        { label: 'Successfully sway 3 conversations',  event: 'social_success', required: 3 },
      ],
      [
        { label: 'Entertain 20 people',                event: 'npc_talk',      required: 20 },
        { label: 'Successfully sway 8 conversations',  event: 'social_success', required: 8 },
      ],
      [
        { label: 'Perform for 40 different people',    event: 'npc_talk',      required: 40 },
        { label: 'Successfully sway 20 conversations', event: 'social_success', required: 20 },
      ],
    ],
  },

  Blacksmith: {
    tiers: ['Novice', 'Apprentice', 'Journeyman', 'Master Smith'],
    xpThresholds: [10, 30, 60],
    xpSources: { craft: 2 },
    tierActions: [
      [],
      [{ id: 'field_repair',  label: '🔧 Field Repair',   desc: 'Restore a Worn item to Fair condition using basic tools.' }],
      [{ id: 'sharpen_blade', label: '⚔️ Sharpen Blade',  desc: 'Hone your equipped weapon — +3 damage for the next combat.' }],
      [{ id: 'masterwork',    label: '🔨 Masterwork',      desc: 'Channel mastery — next craft attempt auto-succeeds at Tier 5.' }],
    ],
    responsibilities: [
      [
        { label: 'Forge or craft 5 items at a smithy', event: 'craft', required: 5 },
      ],
      [
        { label: 'Forge or craft 15 items', event: 'craft', required: 15 },
      ],
      [
        { label: 'Forge or craft 35 items', event: 'craft', required: 35 },
      ],
    ],
  },

  'Bounty Hunter': {
    tiers: ['Tracker', 'Hunter', 'Manhunter', 'Master Huntsman'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 2, quest_complete: 2 },
    tierActions: [
      [],
      [{ id: 'assess_quarry', label: '🔍 Assess Quarry', desc: 'Study the enemy — reveal their HP, damage, and any weaknesses.' }],
      [{ id: 'manhunt',       label: '🗺️ Manhunt',       desc: 'Survival check to pinpoint the location of your nearest active quest target.' }],
      [{ id: 'capture',       label: '⛓️ Capture',        desc: 'Subdue a defeated foe alive — bring them in for +50% gold reward.' }],
    ],
    responsibilities: [
      [
        { label: 'Bring down 5 targets in combat',  event: 'combat_victory', required: 5 },
        { label: 'Complete your first bounty quest', event: 'quest_complete', required: 1 },
      ],
      [
        { label: 'Bring down 20 targets', event: 'combat_victory', required: 20 },
        { label: 'Complete 4 bounties',   event: 'quest_complete', required: 4 },
      ],
      [
        { label: 'Bring down 40 targets', event: 'combat_victory', required: 40 },
        { label: 'Complete 10 bounties',  event: 'quest_complete', required: 10 },
      ],
    ],
  },

  Cleric: {
    tiers: ['Acolyte', 'Deacon', 'Priest', 'High Priest'],
    xpThresholds: [10, 30, 60],
    xpSources: { heal: 2, quest_complete: 1 },
    tierActions: [
      [],
      [{ id: 'bless',          label: '✝️ Bless',          desc: 'Invoke divine favour — apply Blessings to yourself and all party members.' }],
      [{ id: 'divine_healing', label: '💫 Divine Healing',  desc: 'Channel holy power — restore 25 life and remove the Injured condition.' }],
      [{ id: 'holy_wrath',     label: '⚡ Holy Wrath',      desc: 'Call down divine fire — a Light Magic strike that costs no mana.' }],
    ],
    responsibilities: [
      [
        { label: 'Tend to the wounded 5 times',  event: 'heal',           required: 5 },
        { label: 'Fulfil a divine quest',         event: 'quest_complete', required: 1 },
      ],
      [
        { label: 'Tend to the wounded 15 times', event: 'heal',           required: 15 },
        { label: 'Fulfil 3 divine quests',        event: 'quest_complete', required: 3 },
      ],
      [
        { label: 'Tend to the wounded 30 times', event: 'heal',           required: 30 },
        { label: 'Fulfil 8 divine quests',        event: 'quest_complete', required: 8 },
      ],
    ],
  },

  Explorer: {
    tiers: ['Wanderer', 'Pathfinder', 'Cartographer', 'Legend'],
    xpThresholds: [10, 30, 60],
    xpSources: { location_discover: 2, gather: 1 },
    tierActions: [
      [],
      [{ id: 'survey_area',    label: '🔭 Survey Area',    desc: 'Navigation check — reveal all cells within 2 squares of your position.' }],
      [{ id: 'orienteering',   label: '🧭 Orienteering',   desc: 'You know the land. Your next journey costs 0 stamina.' }],
      [{ id: 'first_expedition',label: '🏔️ First Expedition', desc: 'Uncover a hidden point of interest in your current cell.' }],
    ],
    responsibilities: [
      [
        { label: 'Discover 5 new locations', event: 'location_discover', required: 5 },
      ],
      [
        { label: 'Discover 15 new locations', event: 'location_discover', required: 15 },
      ],
      [
        { label: 'Discover 30 new locations', event: 'location_discover', required: 30 },
      ],
    ],
  },

  Farmer: {
    tiers: ['Novice', 'Farmhand', 'Cultivator', 'Master Farmer'],
    xpThresholds: [10, 30, 60],
    xpSources: { gather: 2, craft: 1 },
    tierActions: [
      [],
      [{ id: 'cultivate',         label: '🌱 Cultivate',          desc: 'Work the land — your next forage yields double.' }],
      [{ id: 'weather_sense',     label: '🌤️ Weather Sense',      desc: 'Read the sky — learn what the next two weather periods will bring.' }],
      [{ id: 'bountiful_harvest', label: '🌾 Bountiful Harvest',  desc: 'Today\'s bounty is yours. Forage checks cannot roll below Tier 3 until you rest.' }],
    ],
    responsibilities: [
      [
        { label: 'Forage or harvest 5 times', event: 'gather', required: 5 },
        { label: 'Cook or prepare 2 meals',   event: 'craft',  required: 2 },
      ],
      [
        { label: 'Forage or harvest 15 times', event: 'gather', required: 15 },
        { label: 'Cook or prepare 8 meals',    event: 'craft',  required: 8 },
      ],
      [
        { label: 'Forage or harvest 30 times', event: 'gather', required: 30 },
        { label: 'Cook or prepare 20 meals',   event: 'craft',  required: 20 },
      ],
    ],
  },

  Fletcher: {
    tiers: ['Novice', 'Feather', 'Bowyer', 'Master Fletcher'],
    xpThresholds: [10, 30, 60],
    xpSources: { craft: 3 },
    tierActions: [
      [],
      [{ id: 'craft_arrows',  label: '🪶 Craft Arrows',    desc: 'Fashion 5 arrows from sticks and feathers in your pack.' }],
      [{ id: 'broadhead',     label: '🏹 Broadhead',       desc: 'Fit broadhead tips — all arrows deal +4 damage for the next combat.' }],
      [{ id: 'perfect_shot',  label: '🎯 Perfect Shot',    desc: 'Craft a single perfect arrow that guarantees a Tier 5 Archery check.' }],
    ],
    responsibilities: [
      [
        { label: 'Craft 5 bows, arrows, or ranged tools', event: 'craft', required: 5 },
        { label: 'Hunt 2 animals for materials',          event: 'hunt',  required: 2 },
      ],
      [
        { label: 'Craft 15 bows or arrows', event: 'craft', required: 15 },
        { label: 'Hunt 6 animals',          event: 'hunt',  required: 6 },
      ],
      [
        { label: 'Craft 30 bows or arrows', event: 'craft', required: 30 },
        { label: 'Hunt 15 animals',         event: 'hunt',  required: 15 },
      ],
    ],
  },

  Guard: {
    tiers: ['Recruit', 'Sentinel', 'Veteran Guard', 'Watch Commander'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 2 },
    tierActions: [
      [],
      [{ id: 'brace',           label: '🛡️ Brace',           desc: 'Plant your feet — the next incoming hit deals 70% less damage.' }],
      [{ id: 'intimidate',      label: '😤 Intimidate',       desc: 'A hard stare. 50% chance the enemy flees before striking.' }],
      [{ id: 'fortress_stance', label: '🏰 Fortress Stance',  desc: 'You cannot be forced to flee and the party cannot be ambushed this combat.' }],
    ],
    responsibilities: [
      [
        { label: 'Defend in 8 battles', event: 'combat_victory', required: 8 },
      ],
      [
        { label: 'Defend in 20 battles', event: 'combat_victory', required: 20 },
      ],
      [
        { label: 'Defend in 40 battles', event: 'combat_victory', required: 40 },
      ],
    ],
  },

  Healer: {
    tiers: ['Herbalist', 'Medic', 'Physician', 'Miracle Worker'],
    xpThresholds: [10, 30, 60],
    xpSources: { heal: 3 },
    tierActions: [
      [],
      [{ id: 'prof_bandage',       label: '🩹 Bandage',           desc: 'Apply field dressing — restore 20 life immediately.' }],
      [{ id: 'cure_ailment',       label: '💊 Cure Ailment',      desc: 'Treat one harmful condition and remove it entirely.' }],
      [{ id: 'full_restoration',   label: '✨ Full Restoration',  desc: 'A complete treatment — restore life to 80% and remove all harmful conditions.' }],
    ],
    responsibilities: [
      [
        { label: 'Treat wounds or illness 6 times', event: 'heal', required: 6 },
      ],
      [
        { label: 'Treat wounds or illness 18 times', event: 'heal', required: 18 },
      ],
      [
        { label: 'Treat wounds or illness 40 times', event: 'heal', required: 40 },
      ],
    ],
  },

  Hunter: {
    tiers: ['Novice Hunter', 'Tracker', 'Huntsman', 'Master Hunter'],
    xpThresholds: [10, 30, 60],
    xpSources: { hunt: 3, fish: 1 },
    tierActions: [
      [],
      [{ id: 'set_snare',    label: '🪤 Set Snare',     desc: 'Leave a snare before resting. Check it on waking for catch.' }],
      [{ id: 'study_prey',   label: '🦌 Study Prey',    desc: 'Read the signs — guarantee an animal encounter on your next hunt.' }],
      [{ id: 'apex_predator',label: '🦅 Apex Predator', desc: 'Nothing escapes you. Next hunt automatically yields maximum loot.' }],
    ],
    responsibilities: [
      [
        { label: 'Hunt 5 animals',   event: 'hunt', required: 5 },
        { label: 'Fish 2 times',     event: 'fish', required: 2 },
      ],
      [
        { label: 'Hunt 15 animals',  event: 'hunt', required: 15 },
        { label: 'Fish 6 times',     event: 'fish', required: 6 },
      ],
      [
        { label: 'Hunt 30 animals',  event: 'hunt', required: 30 },
        { label: 'Fish 15 times',    event: 'fish', required: 15 },
      ],
    ],
  },

  Knight: {
    tiers: ['Initiate', 'Esquire', 'Knight Errant', 'Knight Commander'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 2, quest_complete: 2 },
    tierActions: [
      [],
      [{ id: 'honors_strike', label: '⚔️ Honour\'s Strike', desc: 'Strike with righteous purpose — +5 damage and you gain Fortified.' }],
      [{ id: 'stand_firm',    label: '🛡️ Stand Firm',       desc: 'You absorb a hit that would down an ally this round.' }],
      [{ id: 'charge',        label: '🐎 Charge',            desc: 'A devastating charge — Tier × 8 damage and the enemy loses their next action.', staminaCost: 12 }],
    ],
    responsibilities: [
      [
        { label: 'Prove yourself in 5 battles', event: 'combat_victory', required: 5 },
        { label: 'Complete 2 honourable quests', event: 'quest_complete', required: 2 },
      ],
      [
        { label: 'Win 20 battles honourably', event: 'combat_victory', required: 20 },
        { label: 'Complete 5 quests',          event: 'quest_complete', required: 5 },
      ],
      [
        { label: 'Win 40 battles',              event: 'combat_victory', required: 40 },
        { label: 'Complete 12 noble quests',    event: 'quest_complete', required: 12 },
      ],
    ],
  },

  Mage: {
    tiers: ['Apprentice', 'Initiate', 'Adept', 'Archmage'],
    xpThresholds: [10, 30, 60],
    xpSources: { magic_used: 2, craft: 1 },
    tierActions: [
      [],
      [{ id: 'detect_magic',    label: '🔍 Detect Magic',    desc: 'Identify the magical properties of every item you carry.' }],
      [{ id: 'arcane_bolt',     label: '⚡ Arcane Bolt',     desc: 'A pure magic strike in combat — no mana cost, no weapon needed.' }],
      [{ id: 'ritual_casting',  label: '🌀 Ritual Casting',  desc: 'A slow ritual that bends reality. Powerful effects take time.' }],
    ],
    responsibilities: [
      [
        { label: 'Cast spells or use magic 5 times', event: 'magic_used', required: 5 },
        { label: 'Craft 2 magical items or potions',  event: 'craft',      required: 2 },
      ],
      [
        { label: 'Cast spells or use magic 15 times', event: 'magic_used', required: 15 },
        { label: 'Craft 5 magical items',              event: 'craft',      required: 5 },
      ],
      [
        { label: 'Cast spells or use magic 30 times', event: 'magic_used',  required: 30 },
        { label: 'Complete 5 arcane quests',           event: 'quest_complete', required: 5 },
      ],
    ],
  },

  Mercenary: {
    tiers: ['Recruit', 'Sellsword', 'Veteran', 'War Veteran'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 2 },
    tierActions: [
      [],
      [{ id: 'second_wind',    label: '💨 Second Wind',    desc: 'Catch your breath — recover 20 stamina.' }],
      [{ id: 'for_pay',        label: '💰 Fight for Pay',  desc: 'Mark this fight as paid work — next combat victory yields +50% gold.' }],
      [{ id: 'battle_hardened',label: '🪖 Battle Hardened',desc: 'Shrug off punishment — all incoming damage reduced by 3 this combat.' }],
    ],
    responsibilities: [
      [
        { label: 'Win 8 paid engagements', event: 'combat_victory', required: 8 },
      ],
      [
        { label: 'Win 20 paid engagements', event: 'combat_victory', required: 20 },
      ],
      [
        { label: 'Win 40 paid engagements', event: 'combat_victory', required: 40 },
      ],
    ],
  },

  Merchant: {
    tiers: ['Peddler', 'Trader', 'Merchant', 'Trade Master'],
    xpThresholds: [10, 30, 60],
    xpSources: { trade: 3, npc_talk: 1 },
    tierActions: [
      [],
      [{ id: 'appraise',      label: '🧐 Appraise',      desc: 'Evaluate an item — reveal its rarity and estimated gold value.' }],
      [{ id: 'bulk_deal',     label: '🤝 Bulk Deal',      desc: 'Negotiate volume pricing — your next shop purchase costs 40% less.' }],
      [{ id: 'corner_market', label: '📊 Corner Market',  desc: 'Set up a temporary stall and sell your goods at 150% base value.' }],
    ],
    responsibilities: [
      [
        { label: 'Complete 3 trades with merchants', event: 'trade',    required: 3 },
        { label: 'Build relations with 5 traders',   event: 'npc_talk', required: 5 },
      ],
      [
        { label: 'Complete 10 trades', event: 'trade',    required: 10 },
        { label: 'Meet 15 merchants',  event: 'npc_talk', required: 15 },
      ],
      [
        { label: 'Complete 25 trades', event: 'trade',    required: 25 },
        { label: 'Meet 30 merchants',  event: 'npc_talk', required: 30 },
      ],
    ],
  },

  Pirate: {
    tiers: ['Swabbie', 'Sailor', 'Corsair', 'Captain'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 2 },
    tierActions: [
      [],
      [{ id: 'plunder',    label: '⚓ Plunder',    desc: 'Take everything — next combat victory yields +80% gold.' }],
      [{ id: 'sea_legs',   label: '🌊 Sea Legs',   desc: 'At home on the coast — Coastal and Ocean travel costs 0 stamina.' }],
      [{ id: 'dread_flag', label: '💀 Dread Flag', desc: 'Your reputation precedes you — 50% chance enemies flee before combat in Coastal or Ocean areas.' }],
    ],
    responsibilities: [
      [
        { label: 'Win 5 raids or naval skirmishes', event: 'combat_victory', required: 5 },
        { label: 'Plunder goods from 2 targets',    event: 'trade',          required: 2 },
      ],
      [
        { label: 'Win 20 raids', event: 'combat_victory', required: 20 },
        { label: 'Plunder from 6 targets', event: 'trade', required: 6 },
      ],
      [
        { label: 'Win 40 raids', event: 'combat_victory', required: 40 },
        { label: 'Plunder from 15 targets', event: 'trade', required: 15 },
      ],
    ],
  },

  Ranger: {
    tiers: ['Initiate', 'Scout', 'Ranger', 'Forest Warden'],
    xpThresholds: [10, 30, 60],
    xpSources: { hunt: 2, location_discover: 1 },
    tierActions: [
      [],
      [{ id: 'woodland_stride',  label: '🌲 Woodland Stride',  desc: 'Move without effort — remove terrain stamina penalty for your next journey.' }],
      [{ id: 'mark_target',      label: '🎯 Mark Target',      desc: 'Mark the enemy — they take +3 damage from every party hit.' }],
      [{ id: 'natural_guardian', label: '🌿 Natural Guardian', desc: 'Once per combat, negate a hit that would incapacitate you.' }],
    ],
    responsibilities: [
      [
        { label: 'Track and hunt 3 animals',      event: 'hunt',             required: 3 },
        { label: 'Scout 3 uncharted map cells',   event: 'location_discover', required: 3 },
      ],
      [
        { label: 'Hunt 10 animals',               event: 'hunt',             required: 10 },
        { label: 'Scout 10 uncharted map cells',  event: 'location_discover', required: 10 },
      ],
      [
        { label: 'Hunt 20 animals',               event: 'hunt',             required: 20 },
        { label: 'Scout 20 uncharted map cells',  event: 'location_discover', required: 20 },
      ],
    ],
  },

  Scholar: {
    tiers: ['Student', 'Learner', 'Scholar', 'Grand Sage'],
    xpThresholds: [10, 30, 60],
    xpSources: { quest_complete: 2 },
    tierActions: [
      [],
      [{ id: 'study',           label: '📚 Study',            desc: 'Apply knowledge — Decrypting check may reveal a new recipe.' }],
      [{ id: 'decipher_runes',  label: '🔤 Decipher Runes',  desc: 'Your next Decrypting check automatically succeeds.' }],
      [{ id: 'font_of_knowledge',label: '🏛️ Font of Knowledge', desc: 'Recall your research — reveal all undiscovered establishments in the current settlement.' }],
    ],
    responsibilities: [
      [
        { label: 'Complete 2 scholarly quests',  event: 'quest_complete', required: 2 },
        { label: 'Converse with 5 learned NPCs', event: 'npc_talk',       required: 5 },
      ],
      [
        { label: 'Complete 5 quests',   event: 'quest_complete', required: 5 },
        { label: 'Meet 15 learned NPCs', event: 'npc_talk',      required: 15 },
      ],
      [
        { label: 'Complete 12 quests',  event: 'quest_complete', required: 12 },
        { label: 'Meet 30 learned NPCs', event: 'npc_talk',      required: 30 },
      ],
    ],
  },

  Sellsword: {
    tiers: ['Recruit', 'Blade', 'Veteran Blade', 'Master Sellsword'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 3 },
    tierActions: [
      [],
      [{ id: 'dirty_trick',  label: '☠️ Dirty Trick',  desc: 'Poison the enemy before the fight starts — they are Poisoned immediately.' }],
      [{ id: 'battle_cry',   label: '📣 Battle Cry',   desc: 'A roar that steels your allies — party attacks all deal +2 damage this round.' }],
      [{ id: 'killing_blow', label: '💀 Killing Blow',  desc: 'End it. If the enemy is below 30% HP, finish them instantly.' }],
    ],
    responsibilities: [
      [
        { label: 'Win 8 battles for hire', event: 'combat_victory', required: 8 },
      ],
      [
        { label: 'Win 25 battles for hire', event: 'combat_victory', required: 25 },
      ],
      [
        { label: 'Win 50 battles for hire', event: 'combat_victory', required: 50 },
      ],
    ],
  },

  Spy: {
    tiers: ['Informant', 'Operative', 'Agent', 'Spymaster'],
    xpThresholds: [10, 30, 60],
    xpSources: { npc_talk: 2, social_success: 2 },
    tierActions: [
      [],
      [{ id: 'gather_intel',   label: '🕵️ Gather Intel',    desc: 'Study the target — reveal an NPC\'s hidden motivation or secret.' }],
      [{ id: 'plant_evidence', label: '📄 Plant Evidence',   desc: 'Frame or flatter — manipulate an NPC\'s relationship with you by +3.' }],
      [{ id: 'vanish',         label: '💨 Vanish',           desc: 'Disappear completely. Flee succeeds automatically, leaving no trace.' }],
    ],
    responsibilities: [
      [
        { label: 'Extract information from 10 contacts', event: 'npc_talk',      required: 10 },
        { label: 'Succeed in 3 covert social checks',    event: 'social_success', required: 3 },
      ],
      [
        { label: 'Extract information from 25 contacts', event: 'npc_talk',      required: 25 },
        { label: 'Succeed in 10 covert social checks',   event: 'social_success', required: 10 },
        { label: 'Complete 2 covert assignments',        event: 'quest_complete', required: 2 },
      ],
      [
        { label: 'Extract information from 50 contacts', event: 'npc_talk',      required: 50 },
        { label: 'Succeed in 20 covert social checks',   event: 'social_success', required: 20 },
        { label: 'Complete 5 covert assignments',        event: 'quest_complete', required: 5 },
      ],
    ],
  },

  // ── New playable professions ──────────────────────────────────────────────

  Squire: {
    tiers: ['Page', 'Squire', 'Knight Errant', 'Knight'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 2, quest_complete: 1 },
    tierActions: [
      [],
      [{ id: 'shield_bash',  label: '🛡️ Shield Bash',   desc: 'Slam your shield into the enemy — stuns them, they lose their next attack.' }],
      [{ id: 'rallying_cry', label: '📣 Rallying Cry',  desc: 'A battle cry that emboldens allies — party gains +5 stamina each.' }],
      [{ id: 'knights_vow',  label: '⚔️ Knight\'s Vow', desc: 'Invoke your oath of honour — greatly boost your next attack and inspire the party.' }],
    ],
    responsibilities: [
      [
        { label: 'Serve in 5 battles at your lord\'s side', event: 'combat_victory', required: 5 },
        { label: 'Complete an errand or task',              event: 'quest_complete', required: 1 },
      ],
      [
        { label: 'Fight in 15 battles',   event: 'combat_victory', required: 15 },
        { label: 'Complete 3 errands',    event: 'quest_complete', required: 3 },
      ],
      [
        { label: 'Fight in 30 battles',   event: 'combat_victory', required: 30 },
        { label: 'Complete 8 quests',     event: 'quest_complete', required: 8 },
      ],
    ],
  },

  Miner: {
    tiers: ['Tunneller', 'Pitman', 'Miner', 'Master Miner'],
    xpThresholds: [10, 30, 60],
    xpSources: { gather: 3, craft: 1 },
    tierActions: [
      [],
      [{ id: 'ore_sense',      label: '⛏️ Ore Sense',      desc: 'You feel vibrations in the stone — gathering in rocky areas yields double.' }],
      [{ id: 'tunnel_vision',  label: '🔦 Tunnel Vision',   desc: 'Ignore hazards and exhaustion — next gather action costs no stamina.' }],
      [{ id: 'strike_vein',    label: '💎 Strike Vein',     desc: 'You find a rich seam — award a rare ore or gemstone immediately.' }],
    ],
    responsibilities: [
      [
        { label: 'Mine or gather from the earth 5 times', event: 'gather', required: 5 },
        { label: 'Craft 2 items from raw ore',            event: 'craft',  required: 2 },
      ],
      [
        { label: 'Mine or gather 15 times', event: 'gather', required: 15 },
        { label: 'Craft 8 items from ore',  event: 'craft',  required: 8 },
      ],
      [
        { label: 'Mine or gather 30 times', event: 'gather', required: 30 },
        { label: 'Craft 20 items from ore', event: 'craft',  required: 20 },
      ],
    ],
  },

  Carpenter: {
    tiers: ['Apprentice', 'Woodworker', 'Carpenter', 'Master Builder'],
    xpThresholds: [10, 30, 60],
    xpSources: { craft: 2, gather: 1 },
    tierActions: [
      [],
      [{ id: 'field_repair',    label: '🔧 Field Repair',    desc: 'Improvise repairs on a broken item — restore 1 item from a broken state.' }],
      [{ id: 'quick_shelter',   label: '🏕️ Quick Shelter',   desc: 'Construct a basic shelter rapidly — halves the time to build camp.' }],
      [{ id: 'masterwork_camp', label: '🏰 Masterwork Camp',  desc: 'Build a superior campsite — grants upgraded shelter benefits automatically.' }],
    ],
    responsibilities: [
      [
        { label: 'Craft or build 5 wooden items',    event: 'craft',  required: 5 },
        { label: 'Gather 3 loads of raw timber',     event: 'gather', required: 3 },
      ],
      [
        { label: 'Craft or build 15 wooden items',   event: 'craft',  required: 15 },
        { label: 'Gather 8 loads of raw materials',  event: 'gather', required: 8 },
      ],
      [
        { label: 'Craft or build 30 wooden items',   event: 'craft',  required: 30 },
        { label: 'Gather 15 loads of raw materials', event: 'gather', required: 15 },
      ],
    ],
  },

  Bandit: {
    tiers: ['Ruffian', 'Cutthroat', 'Bandit', 'Outlaw King'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 2, npc_talk: 1 },
    tierActions: [
      [],
      [{ id: 'ambush',       label: '🌑 Ambush',       desc: 'Strike before they know you\'re there — first attack this combat is guaranteed T4.' }],
      [{ id: 'shakedown',    label: '💰 Shakedown',    desc: 'Intimidate an NPC into paying — Persuasion check to extort 5–20 gold.' }],
      [{ id: 'lords_ransom', label: '👑 Lord\'s Ransom', desc: 'Take a valuable hostage or leverage — steal a rare item from the enemy.' }],
    ],
    responsibilities: [
      [
        { label: 'Overpower 5 victims or foes',    event: 'combat_victory', required: 5 },
        { label: 'Shake down or threaten 3 NPCs',  event: 'npc_talk',       required: 3 },
      ],
      [
        { label: 'Overpower 15 victims or foes',  event: 'combat_victory', required: 15 },
        { label: 'Complete 2 criminal jobs',       event: 'quest_complete', required: 2 },
      ],
      [
        { label: 'Overpower 30 victims or foes',  event: 'combat_victory', required: 30 },
        { label: 'Complete 5 criminal jobs',       event: 'quest_complete', required: 5 },
      ],
    ],
  },

  Thespian: {
    tiers: ['Understudy', 'Player', 'Thespian', 'Grand Illusionist'],
    xpThresholds: [10, 30, 60],
    xpSources: { npc_talk: 2, social_success: 2 },
    tierActions: [
      [],
      [{ id: 'crowd_work',       label: '🎭 Crowd Work',       desc: 'Win over onlookers — Persuasion check to improve all NPC dispositions nearby.' }],
      [{ id: 'assume_role',      label: '🎭 Assume Role',      desc: 'Fully inhabit a disguise — next social check gets +3 bonus.' }],
      [{ id: 'master_of_masks',  label: '🎭 Master of Masks',  desc: 'Become someone else entirely — fool even hostile NPCs into treating you as ally.' }],
    ],
    responsibilities: [
      [
        { label: 'Perform for 8 audiences',           event: 'npc_talk',      required: 8 },
        { label: 'Land 3 convincing performances',    event: 'social_success', required: 3 },
      ],
      [
        { label: 'Perform for 20 audiences',          event: 'npc_talk',      required: 20 },
        { label: 'Land 8 convincing performances',    event: 'social_success', required: 8 },
      ],
      [
        { label: 'Perform for 40 audiences',          event: 'npc_talk',      required: 40 },
        { label: 'Land 20 convincing performances',   event: 'social_success', required: 20 },
      ],
    ],
  },

  Storyteller: {
    tiers: ['Narrator', 'Chronicler', 'Storyteller', 'Living Legend'],
    xpThresholds: [10, 30, 60],
    xpSources: { npc_talk: 2, quest_complete: 2 },
    tierActions: [
      [],
      [{ id: 'captivating_tale', label: '📖 Captivating Tale', desc: 'Tell a story that holds an NPC rapt — pause their actions for one round.' }],
      [{ id: 'tale_of_valor',    label: '⚔️ Tale of Valor',   desc: 'Recount a heroic deed — party gains Inspired condition for next combat.' }],
      [{ id: 'living_legend',    label: '🌟 Living Legend',    desc: 'Your name carries weight — unlock special dialogue with any NPC you\'ve met.' }],
    ],
    responsibilities: [
      [
        { label: 'Share stories with 8 people', event: 'npc_talk',      required: 8 },
        { label: 'Chronicle your first quest',  event: 'quest_complete', required: 1 },
      ],
      [
        { label: 'Share stories with 20 people', event: 'npc_talk',      required: 20 },
        { label: 'Chronicle 3 quests',            event: 'quest_complete', required: 3 },
      ],
      [
        { label: 'Share stories with 40 people', event: 'npc_talk',      required: 40 },
        { label: 'Chronicle 8 great quests',     event: 'quest_complete', required: 8 },
      ],
    ],
  },

  Apothecary: {
    tiers: ['Herbalist', 'Compounder', 'Apothecary', 'Grand Apothecary'],
    xpThresholds: [10, 30, 60],
    xpSources: { heal: 3, craft: 1 },
    tierActions: [
      [],
      [{ id: 'compound_remedy', label: '⚗️ Compound Remedy', desc: 'Mix herbs on hand — craft a Health Potion without a recipe check.' }],
      [{ id: 'diagnose',        label: '🩺 Diagnose',        desc: 'Identify every condition affecting the target and suggest treatments.' }],
      [{ id: 'master_tincture', label: '✨ Master Tincture', desc: 'Brew an exceptional remedy — restore life and remove all harmful conditions.' }],
    ],
    responsibilities: [
      [
        { label: 'Treat patients 5 times',           event: 'heal', required: 5 },
        { label: 'Brew 2 remedies or poultices',     event: 'brew', required: 2 },
      ],
      [
        { label: 'Treat patients 15 times',          event: 'heal', required: 15 },
        { label: 'Brew 8 remedies or potions',       event: 'brew', required: 8 },
      ],
      [
        { label: 'Treat patients 30 times',          event: 'heal', required: 30 },
        { label: 'Brew 20 remedies or potions',      event: 'brew', required: 20 },
      ],
    ],
  },

  Cartographer: {
    tiers: ['Scout', 'Surveyor', 'Cartographer', 'Master of Maps'],
    xpThresholds: [10, 30, 60],
    xpSources: { location_discover: 3, gather: 1 },
    tierActions: [
      [],
      [{ id: 'survey_region', label: '🗺️ Survey Region', desc: 'Methodically observe the area — reveal all tiles within 2 squares on the map.' }],
      [{ id: 'safe_route',    label: '🧭 Safe Route',    desc: 'Plan an optimal path — next travel costs half stamina and skips one random event.' }],
      [{ id: 'living_map',    label: '📜 Living Map',    desc: 'Your map breathes with knowledge — auto-discover all nearby undiscovered tiles.' }],
    ],
    responsibilities: [
      [
        { label: 'Chart 5 undiscovered locations', event: 'location_discover', required: 5 },
      ],
      [
        { label: 'Chart 15 undiscovered locations', event: 'location_discover', required: 15 },
        { label: 'Gather field samples 3 times',    event: 'gather',            required: 3 },
      ],
      [
        { label: 'Chart 30 undiscovered locations', event: 'location_discover', required: 30 },
        { label: 'Complete 3 exploration quests',   event: 'quest_complete',    required: 3 },
      ],
    ],
  },

  // ── Noble class ───────────────────────────────────────────────────────────

  Noble: {
    tiers: ['Minor Lord', 'Lord', 'High Lord', 'Archlord'],
    xpThresholds: [10, 30, 60],
    xpSources: { npc_talk: 2, quest_complete: 2 },
    tierActions: [
      [],
      [{ id: 'lordly_bearing',  label: '🏛️ Lordly Bearing',   desc: 'Your station commands respect — NPC disposition improves by +2 for this conversation.' }],
      [{ id: 'call_the_banner', label: '⚔️ Call the Banner',  desc: 'Invoke your name and title — hostile NPCs have a 40% chance to stand down.' }],
      [{ id: 'lords_decree',    label: '📜 Lord\'s Decree',   desc: 'Issue a command in any settlement you are known in — one NPC completes a favour.' }],
    ],
    responsibilities: [
      [
        { label: 'Forge alliances with 8 people',     event: 'npc_talk',      required: 8 },
        { label: 'Fulfil a lord\'s obligation',       event: 'quest_complete', required: 1 },
      ],
      [
        { label: 'Forge alliances with 20 people',    event: 'npc_talk',      required: 20 },
        { label: 'Fulfil 3 obligations',              event: 'quest_complete', required: 3 },
      ],
      [
        { label: 'Forge alliances with 40 people',    event: 'npc_talk',      required: 40 },
        { label: 'Fulfil 8 obligations of rank',      event: 'quest_complete', required: 8 },
      ],
    ],
  },

  Herald: {
    tiers: ['Messenger', 'Herald', 'Royal Herald', 'Grand Herald'],
    xpThresholds: [10, 30, 60],
    xpSources: { npc_talk: 2, location_discover: 1 },
    tierActions: [
      [],
      [{ id: 'royal_passage',   label: '🏳️ Royal Passage',   desc: 'Invoke your office — pass through hostile territory without being challenged.' }],
      [{ id: 'deliver_decree',  label: '📜 Deliver Decree',  desc: 'Carry a royal message — the recipient becomes Friendly immediately.' }],
      [{ id: 'cry_the_news',    label: '📢 Cry the News',    desc: 'Announce something to a settlement — all inhabitants become aware of the information.' }],
    ],
    responsibilities: [
      [
        { label: 'Deliver messages to 10 recipients',  event: 'npc_talk',         required: 10 },
        { label: 'Travel to 3 new settlements',        event: 'location_discover', required: 3 },
      ],
      [
        { label: 'Deliver messages to 25 recipients',  event: 'npc_talk',         required: 25 },
        { label: 'Travel to 10 new settlements',       event: 'location_discover', required: 10 },
      ],
      [
        { label: 'Deliver messages to 50 recipients',  event: 'npc_talk',         required: 50 },
        { label: 'Travel to 20 new settlements',       event: 'location_discover', required: 20 },
      ],
    ],
  },

  Courtier: {
    tiers: ['Attendant', 'Courtier', 'Favoured Courtier', 'Royal Confidant'],
    xpThresholds: [10, 30, 60],
    xpSources: { npc_talk: 2, social_success: 2 },
    tierActions: [
      [],
      [{ id: 'silver_tongue',   label: '🗣️ Silver Tongue',   desc: 'Choose your words carefully — next social check cannot fail below Tier 3.' }],
      [{ id: 'court_intrigue',  label: '🕯️ Court Intrigue',  desc: 'Expose or create a rumour — shift one NPC\'s disposition toward another by ±3.' }],
      [{ id: 'royal_favour',    label: '👑 Royal Favour',    desc: 'Call in a favour from a powerful contact — gain a significant boon or avoid a consequence.' }],
    ],
    responsibilities: [
      [
        { label: 'Navigate court politics with 10 nobles', event: 'npc_talk',      required: 10 },
        { label: 'Win 3 social encounters through wit',    event: 'social_success', required: 3 },
      ],
      [
        { label: 'Navigate court politics with 25 nobles', event: 'npc_talk',      required: 25 },
        { label: 'Win 10 social encounters',               event: 'social_success', required: 10 },
        { label: 'Complete 2 political quests',            event: 'quest_complete', required: 2 },
      ],
      [
        { label: 'Navigate court politics with 50 nobles', event: 'npc_talk',      required: 50 },
        { label: 'Win 20 social encounters',               event: 'social_success', required: 20 },
        { label: 'Complete 5 political quests',            event: 'quest_complete', required: 5 },
      ],
    ],
  },

  // ── Royalty class ─────────────────────────────────────────────────────────

  Monarch: {
    tiers: ['Pretender', 'Sovereign', 'High King', 'Emperor of Emperors'],
    xpThresholds: [10, 30, 60],
    xpSources: { npc_talk: 2, quest_complete: 2 },
    tierActions: [
      [],
      [{ id: 'royal_command',   label: '👑 Royal Command',   desc: 'Speak with authority — an NPC obeys one instruction without a social check.' }],
      [{ id: 'kingly_resolve',  label: '⚔️ Kingly Resolve',  desc: 'A monarch does not fall — once per combat, survive a killing blow at 1 life.' }],
      [{ id: 'crown_authority', label: '🏰 Crown Authority', desc: 'Invoke the full weight of your throne — all NPCs in a settlement become Friendly for the day.' }],
    ],
    responsibilities: [
      [
        { label: 'Gain the loyalty of 10 subjects',  event: 'npc_talk',      required: 10 },
        { label: 'Carry out 2 royal duties',         event: 'quest_complete', required: 2 },
      ],
      [
        { label: 'Gain the loyalty of 25 subjects',  event: 'npc_talk',      required: 25 },
        { label: 'Carry out 5 royal duties',         event: 'quest_complete', required: 5 },
        { label: 'Win 5 battles as a warrior king',  event: 'combat_victory', required: 5 },
      ],
      [
        { label: 'Gain the loyalty of 50 subjects',  event: 'npc_talk',      required: 50 },
        { label: 'Carry out 12 royal duties',        event: 'quest_complete', required: 12 },
        { label: 'Win 15 battles',                   event: 'combat_victory', required: 15 },
      ],
    ],
  },

  'Royal Heir': {
    tiers: ['Young Prince', 'Prince', 'Crown Prince', 'High King'],
    xpThresholds: [10, 30, 60],
    xpSources: { combat_victory: 1, quest_complete: 2, npc_talk: 1 },
    tierActions: [
      [],
      [{ id: 'noble_bearing',   label: '🌟 Noble Bearing',   desc: 'You carry yourself as royalty — social checks in settlements gain +2.' }],
      [{ id: 'heirs_gambit',    label: '⚔️ Heir\'s Gambit',  desc: 'Stake your honour — double the reward of your next quest.' }],
      [{ id: 'rightful_claim',  label: '👑 Rightful Claim',  desc: 'Assert your birthright — unlock unique dialogue options and alliances in any kingdom you\'ve visited.' }],
    ],
    responsibilities: [
      [
        { label: 'Win 5 battles in your name',       event: 'combat_victory', required: 5 },
        { label: 'Complete 2 duties of your station', event: 'quest_complete', required: 2 },
      ],
      [
        { label: 'Win 15 battles',                       event: 'combat_victory', required: 15 },
        { label: 'Complete 5 duties of your station',    event: 'quest_complete', required: 5 },
        { label: 'Win the trust of 10 common folk',      event: 'npc_talk',       required: 10 },
      ],
      [
        { label: 'Win 30 battles',                       event: 'combat_victory', required: 30 },
        { label: 'Complete 10 duties of your station',   event: 'quest_complete', required: 10 },
        { label: 'Win the trust of 25 common folk',      event: 'npc_talk',       required: 25 },
      ],
    ],
  },

  Emperor: {
    tiers: ['Consul', 'Imperator', 'Emperor', 'God-Emperor'],
    xpThresholds: [10, 30, 60],
    xpSources: { quest_complete: 3, npc_talk: 1 },
    tierActions: [
      [],
      [{ id: 'imperial_decree', label: '📜 Imperial Decree',  desc: 'Issue an edict — one trade deal or political action succeeds automatically.' }],
      [{ id: 'iron_will',       label: '⚔️ Iron Will',        desc: 'Emperors do not waver — you are immune to fear and flee effects for this combat.' }],
      [{ id: 'divine_mandate',  label: '🌟 Divine Mandate',   desc: 'Your rule is absolute — all NPCs in the region treat you as the highest authority.' }],
    ],
    responsibilities: [
      [
        { label: 'Command the loyalty of 10 subjects', event: 'npc_talk',      required: 10 },
        { label: 'Settle 3 matters of empire',         event: 'quest_complete', required: 3 },
      ],
      [
        { label: 'Command the loyalty of 25 subjects', event: 'npc_talk',      required: 25 },
        { label: 'Settle 8 matters of empire',         event: 'quest_complete', required: 8 },
        { label: 'Win 10 battles as supreme commander', event: 'combat_victory', required: 10 },
      ],
      [
        { label: 'Command the loyalty of 50 subjects', event: 'npc_talk',      required: 50 },
        { label: 'Settle 15 matters of empire',        event: 'quest_complete', required: 15 },
        { label: 'Win 25 battles',                     event: 'combat_victory', required: 25 },
      ],
    ],
  },

};

// ============================================================
// SKILL CONTEXTUAL ACTIONS
// Injected into wheels when player.skills[skill].level >= minLevel
// ============================================================

const SKILL_CONTEXTUAL_ACTIONS = [
  // Combat wheel
  { id: 'sk_power_strike',  label: '⚔️ Power Strike',    skill: 'Swordsmanship',   minLevel: 5,  wheel: 'combat',      staminaCost: 10 },
  { id: 'sk_disarm',        label: '🗡️ Disarm',           skill: 'Swordsmanship',   minLevel: 10, wheel: 'combat' },
  { id: 'sk_aimed_shot',    label: '🎯 Aimed Shot',       skill: 'Archery',          minLevel: 5,  wheel: 'combat' },
  { id: 'sk_grapple',       label: '🤼 Grapple',          skill: 'Brawling',         minLevel: 5,  wheel: 'combat' },
  { id: 'sk_calm_beast',    label: '🐾 Calm Beast',       skill: 'Animal Handling',  minLevel: 5,  wheel: 'combat' },
  { id: 'sk_rally',         label: '📯 Rally',            skill: 'Persuasion',       minLevel: 10, wheel: 'combat' },
  // Exploration wheel
  { id: 'sk_read_tracks',   label: '🔍 Read Tracks',      skill: 'Tracking',         minLevel: 5,  wheel: 'exploration' },
  { id: 'sk_chart_area',    label: '🗺️ Chart Area',       skill: 'Navigation',       minLevel: 5,  wheel: 'exploration' },
  // Survival wheel
  { id: 'sk_mend_wounds',   label: '🩹 Mend Wounds',      skill: 'Healing',          minLevel: 5,  wheel: 'survival' },
  { id: 'sk_field_surgery', label: '🩺 Field Surgery',    skill: 'Healing',          minLevel: 10, wheel: 'survival' },
  { id: 'sk_quick_brew',    label: '⚗️ Quick Brew',       skill: 'Alchemy',          minLevel: 5,  wheel: 'survival' },
  // Gather wheel
  { id: 'sk_identify_plants',label: '🌿 Identify Plants', skill: 'Herbalism',        minLevel: 5,  wheel: 'gather' },
  // Town wheel
  { id: 'sk_inspire',       label: '✨ Inspire',          skill: 'Persuasion',       minLevel: 5,  wheel: 'town' },
  { id: 'sk_read_aura',     label: '🔮 Read Aura',        skill: 'Mysticism',        minLevel: 5,  wheel: 'town' },
];
