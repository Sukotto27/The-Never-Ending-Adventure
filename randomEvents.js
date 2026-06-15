// randomEvents.js — Random travel events for The Never-Ending Adventure
//
// HOW THE ENGINE USES THIS FILE
// ─────────────────────────────────────────────────────────────────────────────
// On each travel step, the engine rolls to determine if a random event fires
// (suggested: roll d20, event fires on 1–6). If an event fires, a weighted
// random selection filters eligible events by the current context (biome,
// timeOfDay, weather, player level) and picks one.
//
// RESOLUTION
//   Simple events  — outcome applies immediately.
//   Choice events  — AI DM presents choice.options to the player, waits for
//                    selection, then resolves the chosen option (skill check
//                    if present, otherwise direct outcome).
//   Skill checks   — roll d20 via hiddenRoll(); add player skill level as
//                    bonus. Meet or beat skillCheck.difficulty to succeed.
//
// EFFECT TYPES  (effects[].type)
//   'life'       — changeLife(amount)
//   'stamina'    — changeStamina(amount)
//   'gold'       — player.gold += amount
//   'item'       — addItem(name, qty, options)
//   'removeItem' — removeItem(name, qty)
//   'experience' — gainExperience(amount)
//   'skill'      — learnSkill(name)
//   'status'     — set player.status to value
//   'weather'    — set player.weather to value
//   'questSeed'  — AI DM hint to potentially begin a new quest organically
//
// TRIGGER FIELDS
//   biomes    — array of biome strings, or null for any
//   timeOfDay — array of time strings (match player.timeOfDay exactly), or null
//   weather   — array of weather strings, or null for any
//   kingdoms  — array of kingdom name strings, or null for any
//   minLevel  — minimum player level (default 1)
//
// POLARITY
//   'good' | 'bad' | 'neutral' | 'mixed'
//   Mixed events have outcomes that vary by player choice or skill roll.
//
// WEIGHT
//   Integer 1–10. Higher = more likely to be selected when eligible.
//   Common nuisances: 7–10. Rare wonders: 1–3.
// ─────────────────────────────────────────────────────────────────────────────

const randomEvents = [

  // ══════════════════════════════════════════════════════════════════════════
  // CREATURE ENCOUNTERS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'wolf_pack',
    name: 'Wolf Pack',
    type: 'creature_encounter',
    polarity: 'bad',
    weight: 8,
    trigger: {
      biomes: ['Forest', 'Hills', 'Plains'],
      timeOfDay: ['🌆 Evening', '🌃 Mid-Evening', '🌙 Dusk', '🌑 Night', '⭐ Late Night'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Low growls rise from the treeline. A pack of wolves emerges from the shadows, eyes catching the last of the light.',
    choice: {
      prompt: 'The wolves fan out, cutting off the path ahead. What do you do?',
      options: [
        {
          id: 'fight',
          text: 'Stand your ground and fight them off.',
          skillCheck: { skill: 'Swordsmanship', difficulty: 12 },
          onSuccess: {
            storyText: 'You drive the pack back with decisive blows. One wolf limps into the dark and the others follow.',
            effects: [
              { type: 'experience', amount: 30 },
              { type: 'life', amount: -5 },
            ],
          },
          onFailure: {
            storyText: 'They overwhelm you with numbers. You escape, but not without a mauling.',
            effects: [
              { type: 'life', amount: -20 },
              { type: 'stamina', amount: -10 },
            ],
          },
        },
        {
          id: 'flee',
          text: 'Run for it.',
          skillCheck: { skill: 'Survival', difficulty: 10 },
          onSuccess: {
            storyText: 'You sprint hard and lose them in the undergrowth.',
            effects: [
              { type: 'stamina', amount: -15 },
            ],
          },
          onFailure: {
            storyText: 'They run you down before you can get clear.',
            effects: [
              { type: 'life', amount: -15 },
              { type: 'stamina', amount: -20 },
            ],
          },
        },
        {
          id: 'intimidate',
          text: 'Make yourself large and shout to intimidate them.',
          skillCheck: { skill: 'Survival', difficulty: 8 },
          onSuccess: {
            storyText: 'The pack hesitates, then slinks back into the forest.',
            effects: [
              { type: 'experience', amount: 15 },
            ],
          },
          onFailure: {
            storyText: 'They are not impressed. They lunge.',
            effects: [
              { type: 'life', amount: -15 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'bandit_ambush',
    name: 'Bandit Ambush',
    type: 'creature_encounter',
    polarity: 'bad',
    weight: 7,
    trigger: {
      biomes: ['Forest', 'Hills', 'Plains', 'Coastal'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Figures drop from the trees and step out from behind boulders on both sides of the path. "Your coin or your life," the largest one says.',
    choice: {
      prompt: 'You are surrounded. What do you do?',
      options: [
        {
          id: 'fight',
          text: 'Draw your weapon and fight.',
          skillCheck: { skill: 'Swordsmanship', difficulty: 13 },
          onSuccess: {
            storyText: 'You drop two bandits before the rest scatter. The leader curses as he flees.',
            effects: [
              { type: 'experience', amount: 40 },
              { type: 'life', amount: -10 },
              { type: 'gold', amount: 25 },
            ],
          },
          onFailure: {
            storyText: 'There are too many. They disarm you and take what they want before disappearing into the trees.',
            effects: [
              { type: 'life', amount: -15 },
              { type: 'gold', amount: -20 },
            ],
          },
        },
        {
          id: 'negotiate',
          text: 'Talk your way out of it.',
          skillCheck: { skill: 'Persuasion', difficulty: 14 },
          onSuccess: {
            storyText: 'You spin a convincing enough tale — or threat — that they decide you are more trouble than you are worth.',
            effects: [
              { type: 'experience', amount: 20 },
            ],
          },
          onFailure: {
            storyText: 'They are not buying it. They take your gold anyway.',
            effects: [
              { type: 'gold', amount: -15 },
            ],
          },
        },
        {
          id: 'pay',
          text: 'Pay them and be done with it.',
          outcome: {
            storyText: 'You hand over some coin. They let you pass with a sneer.',
            effects: [
              { type: 'gold', amount: -20 },
            ],
          },
        },
        {
          id: 'flee',
          text: 'Break and run.',
          skillCheck: { skill: 'Stealth', difficulty: 12 },
          onSuccess: {
            storyText: 'You duck a grab, vault a log, and vanish into the brush before they can organize a chase.',
            effects: [
              { type: 'stamina', amount: -20 },
            ],
          },
          onFailure: {
            storyText: 'A thrown rock clips you and you stumble. They catch up.',
            effects: [
              { type: 'life', amount: -10 },
              { type: 'gold', amount: -15 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'goblin_scouts',
    name: 'Goblin Scouts',
    type: 'creature_encounter',
    polarity: 'bad',
    weight: 6,
    trigger: {
      biomes: ['Forest', 'Hills'],
      timeOfDay: ['🌆 Evening', '🌃 Mid-Evening', '🌙 Dusk', '🌑 Night', '⭐ Late Night'],
      weather: null,
      kingdoms: ['Ardrenhold', 'Dwynbroch', 'Orindroth'],
      minLevel: 1,
    },
    narrative: 'You spot squat figures darting between the trees ahead — goblin scouts, and they have spotted you too.',
    choice: {
      prompt: 'The goblins fan out. They are small, but there are four of them.',
      options: [
        {
          id: 'stealth',
          text: 'Slip off the path and hide until they pass.',
          skillCheck: { skill: 'Stealth', difficulty: 11 },
          onSuccess: {
            storyText: 'You melt into the undergrowth. The goblins jabber in confusion and move on.',
            effects: [
              { type: 'skill', name: 'Stealth' },
            ],
          },
          onFailure: {
            storyText: 'A snapped twig gives you away. They shriek and pile on.',
            effects: [
              { type: 'life', amount: -12 },
            ],
          },
        },
        {
          id: 'fight',
          text: 'Cut through them.',
          skillCheck: { skill: 'Swordsmanship', difficulty: 9 },
          onSuccess: {
            storyText: 'Goblins are not brave. Two go down and the others bolt.',
            effects: [
              { type: 'experience', amount: 20 },
              { type: 'gold', amount: 5 },
            ],
          },
          onFailure: {
            storyText: 'Their numbers and dirty tricks wear you down before you scatter them.',
            effects: [
              { type: 'life', amount: -18 },
              { type: 'experience', amount: 10 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'troll_bridge',
    name: 'Troll Under the Bridge',
    type: 'creature_encounter',
    contexts: ['travel'],
    polarity: 'mixed',
    weight: 4,
    trigger: {
      biomes: ['River', 'Wetlands'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 2,
    },
    narrative: 'A stone bridge spans the river ahead. Halfway across, a massive shape heaves upright from beneath it — a troll, blinking in the daylight and blocking your way.',
    choice: {
      prompt: 'The troll grunts: "Pay to pass. Or fight. Troll no care which."',
      options: [
        {
          id: 'fight',
          text: 'Fight the troll.',
          skillCheck: { skill: 'Swordsmanship', difficulty: 16 },
          onSuccess: {
            storyText: 'A hard-fought victory. The troll splashes into the river and does not resurface. You find the remains of past travelers in its nest beneath the bridge.',
            effects: [
              { type: 'life', amount: -20 },
              { type: 'experience', amount: 60 },
              { type: 'gold', amount: 40 },
            ],
          },
          onFailure: {
            storyText: 'The troll clubs you hard enough to see stars. You retreat, bloodied.',
            effects: [
              { type: 'life', amount: -30 },
            ],
          },
        },
        {
          id: 'pay',
          text: 'Pay the toll.',
          outcome: {
            storyText: 'The troll pockets your coin with surprising dexterity and steps aside.',
            effects: [
              { type: 'gold', amount: -15 },
            ],
          },
        },
        {
          id: 'trick',
          text: 'Outwit it.',
          skillCheck: { skill: 'Persuasion', difficulty: 10 },
          onSuccess: {
            storyText: 'You convince the troll there is a goat on the other side of the river. While it lumbers off to investigate, you cross.',
            effects: [
              { type: 'experience', amount: 25 },
            ],
          },
          onFailure: {
            storyText: 'Even the troll sees through that one.',
            effects: [
              { type: 'gold', amount: -15 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'wild_boar_charge',
    name: 'Wild Boar Charge',
    type: 'creature_encounter',
    polarity: 'bad',
    weight: 7,
    trigger: {
      biomes: ['Forest', 'Plains', 'Hills'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A massive boar bursts from the brush, head lowered, tusks gleaming. It has decided you are a threat.',
    choice: {
      prompt: 'The boar is thirty feet away and closing fast.',
      options: [
        {
          id: 'dodge',
          text: 'Dive out of the way at the last second.',
          skillCheck: { skill: 'Survival', difficulty: 11 },
          onSuccess: {
            storyText: 'You roll aside and the boar thunders past, unable to stop its own momentum. It disappears into the trees.',
            effects: [
              { type: 'stamina', amount: -5 },
            ],
          },
          onFailure: {
            storyText: 'A tusk catches your leg as it passes.',
            effects: [
              { type: 'life', amount: -18 },
            ],
          },
        },
        {
          id: 'kill',
          text: 'Brace and bring it down.',
          skillCheck: { skill: 'Hunting', difficulty: 13 },
          onSuccess: {
            storyText: 'You drop the boar mid-charge. The meat will last days.',
            effects: [
              { type: 'experience', amount: 25 },
              { type: 'item', name: 'Cooked Meat', qty: 3 },
              { type: 'life', amount: -5 },
            ],
          },
          onFailure: {
            storyText: 'Your aim is off. The boar crashes into you.',
            effects: [
              { type: 'life', amount: -22 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'giant_spider_ambush',
    name: 'Giant Spider Ambush',
    type: 'creature_encounter',
    polarity: 'bad',
    weight: 5,
    trigger: {
      biomes: ['Forest', 'Wetlands'],
      timeOfDay: ['🌆 Evening', '🌃 Mid-Evening', '🌙 Dusk', '🌑 Night', '⭐ Late Night'],
      weather: null,
      kingdoms: ['Dwynbroch', 'Orindroth'],
      minLevel: 2,
    },
    narrative: 'Too late — you realize the threads across the path were not morning dew. A web the size of a sail surrounds you, and something large descends from above.',
    choice: {
      prompt: 'The spider drops to your level, mandibles clicking.',
      options: [
        {
          id: 'cut_free',
          text: 'Slash your way through the webbing.',
          skillCheck: { skill: 'Swordsmanship', difficulty: 10 },
          onSuccess: {
            storyText: 'You carve a path through the web and drive the spider back with your blade.',
            effects: [
              { type: 'life', amount: -8 },
              { type: 'experience', amount: 25 },
            ],
          },
          onFailure: {
            storyText: 'The web entangles your weapon arm. The spider bites before you break free.',
            effects: [
              { type: 'life', amount: -20 },
              { type: 'status', value: 'Poisoned' },
            ],
          },
        },
        {
          id: 'fire',
          text: 'Set the web alight.',
          skillCheck: { skill: 'Fire-making', difficulty: 9 },
          onSuccess: {
            storyText: 'The web catches instantly. The spider shrieks and retreats up into the canopy.',
            effects: [
              { type: 'stamina', amount: -5 },
              { type: 'experience', amount: 20 },
            ],
          },
          onFailure: {
            storyText: 'The web is too damp. The spider is on you before the spark catches.',
            effects: [
              { type: 'life', amount: -15 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'snake_bite',
    name: 'Snake Bite',
    type: 'creature_encounter',
    polarity: 'bad',
    weight: 6,
    trigger: {
      biomes: ['Forest', 'Wetlands', 'Plains'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A sharp sting in the ankle. You look down to see a dark-banded serpent slithering away into the grass.',
    outcome: {
      storyText: 'The bite burns. You suck out what venom you can, but your leg swells by the hour.',
      effects: [
        { type: 'life', amount: -12 },
        { type: 'status', value: 'Poisoned' },
        { type: 'skill', name: 'Survival' },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ENVIRONMENTAL HAZARDS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'sudden_storm',
    name: 'Sudden Storm',
    type: 'weather',
    contexts: ['travel'],
    polarity: 'bad',
    weight: 8,
    trigger: {
      biomes: null,
      timeOfDay: ['🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon', '🌆 Evening', '🌃 Mid-Evening'],
      weather: ['Clear', 'Cloudy'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Black clouds roll in with impossible speed. Within minutes the sky opens up — thunder, lightning, and driving rain.',
    choice: {
      prompt: 'You are caught in the open. Do you push through or seek shelter?',
      options: [
        {
          id: 'shelter',
          text: 'Find shelter and wait it out.',
          skillCheck: { skill: 'Survival', difficulty: 9 },
          onSuccess: {
            storyText: 'You find a hollow tree or rocky overhang and wait out the worst of it.',
            effects: [
              { type: 'stamina', amount: -5 },
              { type: 'weather', value: 'Rain' },
            ],
          },
          onFailure: {
            storyText: 'The only "shelter" is a thin tree. You spend hours soaked and shivering.',
            effects: [
              { type: 'stamina', amount: -20 },
              { type: 'life', amount: -5 },
              { type: 'weather', value: 'Storm' },
            ],
          },
        },
        {
          id: 'push_through',
          text: 'Keep moving.',
          outcome: {
            storyText: 'You slog through it. You arrive at your destination soaked to the bone.',
            effects: [
              { type: 'stamina', amount: -25 },
              { type: 'weather', value: 'Rain' },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'dense_fog',
    name: 'Dense Fog',
    type: 'weather',
    contexts: ['travel'],
    polarity: 'bad',
    weight: 7,
    trigger: {
      biomes: ['Forest', 'Wetlands', 'Coastal', 'Hills'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌑 Night', '⭐ Late Night'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A thick, silent fog rolls in, reducing visibility to a few feet in any direction. The path ahead is gone.',
    choice: {
      prompt: 'You cannot see more than a few steps ahead. Do you press on or stop?',
      options: [
        {
          id: 'navigate',
          text: 'Navigate carefully using landmarks and instinct.',
          skillCheck: { skill: 'Survival', difficulty: 12 },
          onSuccess: {
            storyText: 'You pick your way through using the sound of water and the slope of the ground. It takes longer, but you emerge on the right path.',
            effects: [
              { type: 'stamina', amount: -10 },
              { type: 'skill', name: 'Survival' },
            ],
          },
          onFailure: {
            storyText: 'You wander for hours before the fog lifts. Tired and off course.',
            effects: [
              { type: 'stamina', amount: -25 },
              { type: 'life', amount: -5 },
            ],
          },
        },
        {
          id: 'wait',
          text: 'Make camp and wait for it to clear.',
          outcome: {
            storyText: 'The fog lifts by mid-morning. You have lost time but are no worse for it.',
            effects: [
              { type: 'stamina', amount: -5 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'rockslide',
    name: 'Rockslide',
    type: 'hazard',
    contexts: ['travel'],
    polarity: 'bad',
    weight: 5,
    trigger: {
      biomes: ['Mountain'],
      timeOfDay: null,
      weather: ['Rain', 'Storm'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A crack above, then a rumble, then the entire hillside starts moving. Boulders the size of carts bound toward the path.',
    choice: {
      prompt: 'The rocks are seconds away.',
      options: [
        {
          id: 'run_forward',
          text: 'Sprint forward to get clear.',
          skillCheck: { skill: 'Survival', difficulty: 12 },
          onSuccess: {
            storyText: 'You burst through the cloud of dust a heartbeat ahead of the rock wall.',
            effects: [
              { type: 'stamina', amount: -15 },
            ],
          },
          onFailure: {
            storyText: 'A glancing boulder spins you off your feet. Several ribs protest loudly.',
            effects: [
              { type: 'life', amount: -25 },
              { type: 'stamina', amount: -10 },
            ],
          },
        },
        {
          id: 'take_cover',
          text: 'Flatten against the cliff face.',
          skillCheck: { skill: 'Survival', difficulty: 10 },
          onSuccess: {
            storyText: 'The rocks thunder past. You emerge dusty but uninjured.',
            effects: [],
          },
          onFailure: {
            storyText: 'A smaller rock catches you on the shoulder.',
            effects: [
              { type: 'life', amount: -15 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'bitter_cold',
    name: 'Bitter Cold',
    type: 'weather',
    polarity: 'bad',
    weight: 8,
    trigger: {
      biomes: ['Mountain', 'Tundra'],
      timeOfDay: ['🌑 Night', '⭐ Late Night'],
      weather: null,
      kingdoms: ['Rendarost', 'Wistravael', 'Feldarún'],
      minLevel: 1,
    },
    narrative: 'The temperature plummets after dark. The kind of cold that gets into your bones and does not leave.',
    choice: {
      prompt: 'You need warmth.',
      options: [
        {
          id: 'make_fire',
          text: 'Make a fire.',
          skillCheck: { skill: 'Fire-making', difficulty: 10 },
          onSuccess: {
            storyText: 'You coax a fire to life and make it through the night.',
            effects: [
              { type: 'stamina', amount: -5 },
            ],
          },
          onFailure: {
            storyText: 'The wind kills every spark. You huddle through the night, shaking.',
            effects: [
              { type: 'stamina', amount: -25 },
              { type: 'life', amount: -10 },
            ],
          },
        },
        {
          id: 'push_on',
          text: 'Keep moving to stay warm.',
          outcome: {
            storyText: 'You march through the night. You are exhausted by morning but frostbite-free.',
            effects: [
              { type: 'stamina', amount: -30 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'bee_swarm',
    name: 'Disturbed Bee Swarm',
    type: 'hazard',
    polarity: 'bad',
    weight: 5,
    trigger: {
      biomes: ['Forest', 'Plains'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: ['Clear', 'Cloudy'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Without warning a black cloud erupts from a hollow log at your feet. Bees. Thousands of them.',
    choice: {
      prompt: 'They are already on you.',
      options: [
        {
          id: 'run',
          text: 'Run into the wind.',
          skillCheck: { skill: 'Survival', difficulty: 8 },
          onSuccess: {
            storyText: 'You outrun the worst of the swarm. A dozen stings but nothing worse.',
            effects: [
              { type: 'life', amount: -8 },
            ],
          },
          onFailure: {
            storyText: 'The swarm chases you further than it should. You are covered in stings.',
            effects: [
              { type: 'life', amount: -20 },
              { type: 'status', value: 'Swarmed' },
            ],
          },
        },
        {
          id: 'submerge',
          text: 'Dive into the nearest water.',
          skillCheck: { skill: 'Survival', difficulty: 7 },
          onSuccess: {
            storyText: 'You splash into a stream and wait them out. Cold, but smart.',
            effects: [
              { type: 'life', amount: -5 },
              { type: 'stamina', amount: -10 },
            ],
          },
          onFailure: {
            storyText: 'The nearest "water" is a muddy puddle. Not deep enough.',
            effects: [
              { type: 'life', amount: -18 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'quicksand',
    name: 'Quicksand',
    type: 'hazard',
    contexts: ['travel', 'forage'],
    polarity: 'bad',
    weight: 4,
    trigger: {
      biomes: ['Wetlands', 'Plains'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'The ground gives way under your next step. Before you can react you are shin-deep in grey sucking sand, and sinking.',
    choice: {
      prompt: 'Every struggle makes it worse.',
      options: [
        {
          id: 'slow_escape',
          text: 'Go still, distribute your weight, and ease out slowly.',
          skillCheck: { skill: 'Survival', difficulty: 11 },
          onSuccess: {
            storyText: 'It takes an agonizing quarter hour, but you work yourself free.',
            effects: [
              { type: 'stamina', amount: -20 },
            ],
          },
          onFailure: {
            storyText: 'Your calm breaks. You are waist-deep before something solid stops you. Exhausted and badly shaken.',
            effects: [
              { type: 'stamina', amount: -30 },
              { type: 'life', amount: -10 },
            ],
          },
        },
        {
          id: 'grab_branch',
          text: 'Grab a nearby branch or root.',
          skillCheck: { skill: 'Survival', difficulty: 9 },
          onSuccess: {
            storyText: 'You snag a willow branch and haul yourself out, spitting mud.',
            effects: [
              { type: 'stamina', amount: -15 },
            ],
          },
          onFailure: {
            storyText: 'The branch snaps. You are deeper now.',
            effects: [
              { type: 'stamina', amount: -25 },
              { type: 'life', amount: -12 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'twisted_ankle',
    name: 'Twisted Ankle',
    type: 'hazard',
    polarity: 'bad',
    weight: 7,
    trigger: {
      biomes: ['Mountain', 'Hills'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Your boot catches a loose stone and your ankle rolls sharply. You go down hard.',
    choice: {
      prompt: 'Your ankle throbs. How badly, you cannot yet tell.',
      options: [
        {
          id: 'treat',
          text: 'Bind it with cloth and treat it properly.',
          skillCheck: { skill: 'Healing', difficulty: 9 },
          onSuccess: {
            storyText: 'A firm wrap and some rest. It is sore but manageable.',
            effects: [
              { type: 'stamina', amount: -10 },
            ],
          },
          onFailure: {
            storyText: 'You wrap it too loose. It swells badly by the next mile.',
            effects: [
              { type: 'life', amount: -8 },
              { type: 'stamina', amount: -20 },
            ],
          },
        },
        {
          id: 'walk_it_off',
          text: 'Walk it off.',
          outcome: {
            storyText: 'You limp on. It hurts more than it should by nightfall.',
            effects: [
              { type: 'life', amount: -10 },
              { type: 'stamina', amount: -15 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'food_spoils',
    name: 'Food Spoils',
    type: 'hazard',
    polarity: 'bad',
    weight: 6,
    trigger: {
      biomes: null,
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning'],
      weather: ['Clear'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'You open your pack for breakfast and a sour smell greets you. The heat has turned your provisions.',
    outcome: {
      storyText: 'You discard the spoiled food. Nothing to be done about it now.',
      effects: [
        { type: 'removeItem', name: 'Cooked Meat', qty: 1 },
      ],
    },
  },

  {
    id: 'lost_in_dark',
    name: 'Lost in the Dark',
    type: 'hazard',
    contexts: ['travel'],
    polarity: 'bad',
    weight: 6,
    trigger: {
      biomes: ['Forest'],
      timeOfDay: ['🌑 Night', '⭐ Late Night'],
      weather: ['Cloudy', 'Fog'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'With no moon and the canopy blocking the stars, you realize you have not recognized the path for some time.',
    choice: {
      prompt: 'You are turned around. Do you try to find your way or stop and wait for light?',
      options: [
        {
          id: 'track_back',
          text: 'Track your own footprints back.',
          skillCheck: { skill: 'Tracking', difficulty: 13 },
          onSuccess: {
            storyText: 'You retrace your steps through the dark, finding the right path before dawn.',
            effects: [
              { type: 'stamina', amount: -15 },
              { type: 'skill', name: 'Tracking' },
            ],
          },
          onFailure: {
            storyText: 'You go deeper in. You do not find the path until well past dawn.',
            effects: [
              { type: 'stamina', amount: -30 },
            ],
          },
        },
        {
          id: 'stop',
          text: 'Stop, make a small fire, and wait for dawn.',
          outcome: {
            storyText: 'A cold, uneasy few hours but by first light you find your bearings.',
            effects: [
              { type: 'stamina', amount: -10 },
            ],
          },
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DISCOVERIES & LUCKY FINDS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'abandoned_camp',
    name: 'Abandoned Camp',
    type: 'discovery',
    polarity: 'good',
    weight: 7,
    trigger: {
      biomes: ['Forest', 'Hills', 'Plains'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'You come across a campsite that has been abandoned in a hurry — a fire that burned out days ago, a bedroll, and a pack left behind.',
    choice: {
      prompt: 'The camp looks like it was left in a hurry. Do you search it?',
      options: [
        {
          id: 'search',
          text: 'Rummage through what was left behind.',
          skillCheck: { skill: 'Survival', difficulty: 7 },
          onSuccess: {
            storyText: 'Useful things: some food, a few coins, a small knife. Whoever was here left in a hurry.',
            effects: [
              { type: 'gold', amount: 12 },
              { type: 'item', name: 'Cooked Meat', qty: 1 },
              { type: 'item', name: 'Dagger', qty: 1 },
            ],
          },
          onFailure: {
            storyText: 'Most of it is rotted or broken. You find a few coins in the dirt.',
            effects: [
              { type: 'gold', amount: 5 },
            ],
          },
        },
        {
          id: 'leave',
          text: 'Leave it — someone may be coming back.',
          outcome: {
            storyText: 'You push on. Whatever happened here is not your concern.',
            effects: [],
          },
        },
      ],
    },
  },

  {
    id: 'coins_in_road',
    name: 'Coins in the Road',
    type: 'discovery',
    contexts: ['travel', 'town'],
    polarity: 'good',
    weight: 8,
    trigger: {
      biomes: ['Plains', 'Hills', 'Coastal'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: ['Clear'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A glint in the mud catches your eye. Someone\'s purse must have come loose.',
    outcome: {
      storyText: 'You pocket the scattered coins.',
      effects: [
        { type: 'gold', amount: 15 },
      ],
    },
  },

  {
    id: 'medicinal_herbs',
    name: 'Medicinal Herbs',
    type: 'discovery',
    polarity: 'good',
    weight: 7,
    trigger: {
      biomes: ['Forest', 'Wetlands', 'Hills'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Growing along the path, almost as if placed there — clusters of herbs any healer or alchemist would recognize.',
    choice: {
      prompt: 'Do you stop to harvest them?',
      options: [
        {
          id: 'harvest',
          text: 'Harvest them carefully.',
          skillCheck: { skill: 'Herbalism', difficulty: 8 },
          onSuccess: {
            storyText: 'You collect a generous bundle without damaging the roots.',
            effects: [
              { type: 'item', name: 'Edible Mushrooms', qty: 2 },
              { type: 'skill', name: 'Herbalism' },
              { type: 'experience', amount: 10 },
            ],
          },
          onFailure: {
            storyText: 'You get some but crush most of it. A partial harvest.',
            effects: [
              { type: 'item', name: 'Edible Mushrooms', qty: 1 },
            ],
          },
        },
        {
          id: 'pass',
          text: 'Keep moving.',
          outcome: {
            storyText: 'You note the location and press on.',
            effects: [],
          },
        },
      ],
    },
  },

  {
    id: 'wild_fruit_bounty',
    name: 'Wild Fruit Bounty',
    type: 'discovery',
    polarity: 'good',
    weight: 8,
    trigger: {
      biomes: ['Forest', 'Plains'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: ['Clear'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'The trees here are thick with fruit — apples or wild berries depending on the season — and most of it ripe.',
    outcome: {
      storyText: 'You fill your pack with what you can carry.',
      effects: [
        { type: 'item', name: 'Apple', qty: 3 },
        { type: 'item', name: 'Wild Berries', qty: 2 },
      ],
    },
  },

  {
    id: 'old_coin_stash',
    name: 'Old Coin Stash',
    type: 'discovery',
    polarity: 'good',
    weight: 3,
    trigger: {
      biomes: ['Forest', 'Hills', 'Mountain'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A hollow tree, a loose stone in a wall, a rotted stump — something about it draws your eye. Inside, wrapped in oilcloth, a cache of old coins.',
    outcome: {
      storyText: 'The coins are tarnished but real. Left long enough ago that no one is coming back for them.',
      effects: [
        { type: 'gold', amount: 35 },
        { type: 'experience', amount: 10 },
      ],
    },
  },

  {
    id: 'ancient_inscription',
    name: 'Ancient Inscription',
    type: 'discovery',
    polarity: 'good',
    weight: 4,
    trigger: {
      biomes: ['Mountain', 'Forest', 'Hills'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Mostly hidden by moss and ivy, a large stone bears carvings unlike anything you have seen before — a language older than the kingdoms.',
    choice: {
      prompt: 'Do you study it?',
      options: [
        {
          id: 'study',
          text: 'Spend time deciphering what you can.',
          skillCheck: { skill: 'Decrypting', difficulty: 12 },
          onSuccess: {
            storyText: 'Some of it yields meaning — fragments of a story far older than this kingdom. You copy what you can.',
            effects: [
              { type: 'experience', amount: 40 },
              { type: 'skill', name: 'Decrypting' },
              {
                type: 'questSeed',
                description: 'Runic inscription of unknown origin. Could tie into the Whispers of the Ancients or a standalone lore discovery.',
              },
            ],
          },
          onFailure: {
            storyText: 'It defeats you, but the experience of trying teaches something.',
            effects: [
              { type: 'experience', amount: 15 },
            ],
          },
        },
        {
          id: 'move_on',
          text: 'Note the location and keep moving.',
          outcome: {
            storyText: 'You mark it in your mind. Something to return to.',
            effects: [],
          },
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NPC ENCOUNTERS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'kind_traveler',
    name: 'Kind Traveler',
    type: 'traveler_encounter',
    polarity: 'good',
    weight: 7,
    trigger: {
      biomes: ['Plains', 'Hills', 'Coastal'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: ['Clear', 'Cloudy'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A traveler heading the other way hails you cheerfully and falls into step for a short stretch.',
    outcome: {
      storyText: 'They share news of the road ahead, hand over a portion of their lunch, and wish you well before parting.',
      effects: [
        { type: 'item', name: 'Cooked Meat', qty: 1 },
        { type: 'stamina', amount: 5 },
      ],
    },
  },

  {
    id: 'injured_traveler',
    name: 'Injured Traveler',
    type: 'traveler_encounter',
    polarity: 'mixed',
    weight: 5,
    trigger: {
      biomes: ['Plains', 'Forest', 'Hills'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A figure is slumped against a milestone, holding their side. They look up when they hear you coming — relief and pain in equal measure on their face.',
    choice: {
      prompt: 'They have been attacked and need help. What do you do?',
      options: [
        {
          id: 'help',
          text: 'Treat their wounds and see them to safety.',
          skillCheck: { skill: 'Healing', difficulty: 9 },
          onSuccess: {
            storyText: 'You patch them up well enough to travel. In gratitude they press their last coin into your hand.',
            effects: [
              { type: 'gold', amount: 20 },
              { type: 'experience', amount: 20 },
              { type: 'skill', name: 'Healing' },
            ],
          },
          onFailure: {
            storyText: 'You do what you can, but your patch job is rough. They thank you anyway.',
            effects: [
              { type: 'experience', amount: 10 },
            ],
          },
        },
        {
          id: 'leave',
          text: 'Keep walking.',
          outcome: {
            storyText: 'You push on without stopping. Their eyes follow you down the road.',
            effects: [],
          },
        },
        {
          id: 'investigate',
          text: 'Help them, and find out who did this.',
          skillCheck: { skill: 'Tracking', difficulty: 11 },
          onSuccess: {
            storyText: 'The tracks tell a clear story — bandits, and recently. You have a heading.',
            effects: [
              { type: 'gold', amount: 20 },
              { type: 'experience', amount: 30 },
              {
                type: 'questSeed',
                description: 'Bandit attack nearby. Could seed a bandit bounty quest or lead to a bandit camp discovery.',
              },
            ],
          },
          onFailure: {
            storyText: 'The ground gives nothing away. You treat the traveler and move on.',
            effects: [
              { type: 'gold', amount: 20 },
              { type: 'experience', amount: 15 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'suspicious_merchant',
    name: 'Suspicious Merchant',
    type: 'traveler_encounter',
    polarity: 'mixed',
    weight: 5,
    trigger: {
      biomes: ['Plains', 'Hills', 'Coastal'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A cart pulled by a tired mule is parked off the road. A lean man in a wide hat beckons you over with a grin too wide to be entirely trustworthy.',
    choice: {
      prompt: '"Finest goods in the region, friend. Prices so low they hurt." He flourishes a tray of oddly appealing wares.',
      options: [
        {
          id: 'buy',
          text: 'Buy something.',
          skillCheck: { skill: 'Negotiating', difficulty: 10 },
          onSuccess: {
            storyText: 'You haggle him down and walk away with a genuine bargain.',
            effects: [
              { type: 'item', name: 'Health Potion', qty: 1 },
              { type: 'gold', amount: -10 },
            ],
          },
          onFailure: {
            storyText: 'The potion smells right, but tastes wrong. Cheap knock-off.',
            effects: [
              { type: 'gold', amount: -15 },
              { type: 'life', amount: -5 },
            ],
          },
        },
        {
          id: 'decline',
          text: 'Politely decline and move on.',
          outcome: {
            storyText: 'He shrugs and calls after you that you will regret it.',
            effects: [],
          },
        },
      ],
    },
  },

  {
    id: 'wandering_bard',
    name: 'Wandering Bard',
    type: 'traveler_encounter',
    polarity: 'good',
    weight: 4,
    trigger: {
      biomes: null,
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: ['Clear'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'You hear the sound of a lute before you see the player — a bard striding along the road in the opposite direction, singing to no one in particular.',
    outcome: {
      storyText: 'You share the road for a spell. She sings a rousing ballad and shares gossip from three kingdoms over. Your spirits are lifted.',
      effects: [
        { type: 'stamina', amount: 10 },
        { type: 'experience', amount: 10 },
      ],
    },
  },

  {
    id: 'stolen_while_sleeping',
    name: 'Stolen While Sleeping',
    type: 'hazard',
    contexts: ['camp', 'tavern'],
    polarity: 'bad',
    weight: 4,
    trigger: {
      biomes: null,
      timeOfDay: ['🌑 Night', '⭐ Late Night'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'You wake to find the straps on your pack cut. Someone paid you a visit in the night.',
    choice: {
      prompt: 'How much did they take?',
      options: [
        {
          id: 'light_sleeper',
          text: '(Attempt a Tracking check to find who did it)',
          skillCheck: { skill: 'Tracking', difficulty: 14 },
          onSuccess: {
            storyText: 'Footprints in the dew lead a short distance before disappearing — but you also find where they stashed a portion of what they took.',
            effects: [
              { type: 'gold', amount: -10 },
            ],
          },
          onFailure: {
            storyText: 'They are long gone. You count your losses.',
            effects: [
              { type: 'gold', amount: -20 },
            ],
          },
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MYSTICAL & SUPERNATURAL
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'glowing_stone',
    name: 'Glowing Stone',
    type: 'mystical',
    polarity: 'mixed',
    weight: 3,
    trigger: {
      biomes: ['Forest', 'Mountain', 'Hills'],
      timeOfDay: ['🌑 Night', '⭐ Late Night'],
      weather: null,
      kingdoms: null,
      minLevel: 2,
    },
    narrative: 'Off the path, half-buried in earth, a stone pulses with a faint blue light. No natural explanation presents itself.',
    choice: {
      prompt: 'Do you take it?',
      options: [
        {
          id: 'take',
          text: 'Pick it up.',
          outcome: {
            storyText: 'It is warm to the touch. Something about it feels protective — or perhaps that is wishful thinking.',
            effects: [
              { type: 'experience', amount: 20 },
              {
                type: 'questSeed',
                description: 'A glowing stone of unknown origin. Could be a magical artifact, a beacon, or bait.',
              },
            ],
          },
        },
        {
          id: 'leave',
          text: 'Leave it alone.',
          outcome: {
            storyText: 'Some things are best left where they lie.',
            effects: [],
          },
        },
      ],
    },
  },

  {
    id: 'phantom_light',
    name: 'Phantom Light in the Forest',
    type: 'mystical',
    polarity: 'mixed',
    weight: 3,
    trigger: {
      biomes: ['Forest'],
      timeOfDay: ['🌆 Evening', '🌃 Mid-Evening', '🌙 Dusk', '🌑 Night', '⭐ Late Night'],
      weather: ['Fog', 'Clear'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A soft light bobs between the trees, about forty feet off the path. It moves too smoothly to be a torch. It seems to be going somewhere.',
    choice: {
      prompt: 'Will-o-wisp, fairy light, or something else entirely?',
      options: [
        {
          id: 'follow',
          text: 'Follow it.',
          skillCheck: { skill: 'Survival', difficulty: 10 },
          onSuccess: {
            storyText: 'The light leads you to a small hollow where a spring bubbles up from the stone. The water is remarkably clean. The light is gone.',
            effects: [
              { type: 'life', amount: 15 },
              { type: 'stamina', amount: 10 },
              { type: 'experience', amount: 20 },
            ],
          },
          onFailure: {
            storyText: 'The light leads you deeper into the woods before winking out, leaving you turned around in the dark.',
            effects: [
              { type: 'stamina', amount: -20 },
            ],
          },
        },
        {
          id: 'ignore',
          text: 'Keep to the path.',
          outcome: {
            storyText: 'You press on. The light fades behind you.',
            effects: [],
          },
        },
      ],
    },
  },

  {
    id: 'celestial_omen',
    name: 'Celestial Omen',
    type: 'mystical',
    polarity: 'neutral',
    weight: 3,
    trigger: {
      biomes: null,
      timeOfDay: ['🌑 Night', '⭐ Late Night'],
      weather: ['Clear'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A streak of light crosses the sky — too slow for a shooting star, too fast for a comet. It leaves a faint trail that lingers for minutes before fading.',
    outcome: {
      storyText: 'You watch until it is gone. An omen, perhaps, though of what kind you cannot say. The night feels larger than it did before.',
      effects: [
        { type: 'experience', amount: 10 },
      ],
    },
  },

  {
    id: 'cursed_object',
    name: 'Cursed Object on the Path',
    type: 'mystical',
    polarity: 'bad',
    weight: 2,
    trigger: {
      biomes: ['Forest', 'Wetlands'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 2,
    },
    narrative: 'A small trinket lies in the middle of the path — too deliberate to be dropped by accident. It has a wrongness to it, like looking at something familiar from the wrong angle.',
    choice: {
      prompt: 'Do you touch it?',
      options: [
        {
          id: 'take',
          text: 'Pick it up.',
          outcome: {
            storyText: 'The moment your fingers close around it something cold passes through you. By morning you feel off. Something is not right.',
            effects: [
              { type: 'life', amount: -10 },
              { type: 'status', value: 'Cursed' },
            ],
          },
        },
        {
          id: 'study',
          text: 'Study it without touching it.',
          skillCheck: { skill: 'Decrypting', difficulty: 13 },
          onSuccess: {
            storyText: 'The runes carved into it are a warning sign. You back away and leave it to whoever placed it there.',
            effects: [
              { type: 'experience', amount: 20 },
              { type: 'skill', name: 'Decrypting' },
            ],
          },
          onFailure: {
            storyText: 'You cannot read it. Best leave it alone.',
            effects: [],
          },
        },
        {
          id: 'kick_off_path',
          text: 'Kick it into the undergrowth without touching it.',
          outcome: {
            storyText: 'It disappears into the brush. Not your problem anymore.',
            effects: [],
          },
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // QUEST SEEDS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'large_tracks',
    name: 'Tracks of Something Large',
    type: 'discovery',
    polarity: 'neutral',
    weight: 5,
    trigger: {
      biomes: ['Forest', 'Mountain', 'Hills'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Something very large has crossed the path recently. The prints are deep, widely spaced, and unlike anything you know.',
    choice: {
      prompt: 'Do you investigate the tracks?',
      options: [
        {
          id: 'follow',
          text: 'Follow them.',
          skillCheck: { skill: 'Tracking', difficulty: 12 },
          onSuccess: {
            storyText: 'The tracks lead to a flattened clearing — a resting spot, and recent. Whatever made these could be close.',
            effects: [
              { type: 'experience', amount: 20 },
              { type: 'skill', name: 'Tracking' },
              {
                type: 'questSeed',
                description: 'Unknown large creature in the area. Possible beast hunting or beast sightings quest. AI DM should determine creature type based on kingdom/biome.',
              },
            ],
          },
          onFailure: {
            storyText: 'The trail goes cold. Whatever it is, it is long gone.',
            effects: [
              { type: 'experience', amount: 5 },
            ],
          },
        },
        {
          id: 'note_direction',
          text: 'Note the direction and warn the next settlement.',
          outcome: {
            storyText: 'A responsible choice. The nearest village should know.',
            effects: [
              { type: 'experience', amount: 10 },
            ],
          },
        },
      ],
    },
  },

  {
    id: 'smoke_on_horizon',
    name: 'Smoke on the Horizon',
    type: 'discovery',
    contexts: ['travel'],
    polarity: 'neutral',
    weight: 4,
    trigger: {
      biomes: ['Plains', 'Hills'],
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: ['Clear'],
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A dark column of smoke rises in the distance — too much for a campfire, too localized for a forest fire.',
    choice: {
      prompt: 'It could be nothing. Or it could be a village.',
      options: [
        {
          id: 'investigate',
          text: 'Head toward the smoke.',
          outcome: {
            storyText: 'You change course toward the smoke.',
            effects: [
              {
                type: 'questSeed',
                description: 'Smoke on the horizon — could be a burning village (Attacks/Assaults), a signal fire, a wildfire, or a forge. AI DM resolves what the player finds on arrival.',
              },
            ],
          },
        },
        {
          id: 'ignore',
          text: 'It is not your concern. Keep to your route.',
          outcome: {
            storyText: 'You press on. Whatever it was, someone else will deal with it.',
            effects: [],
          },
        },
      ],
    },
  },

  {
    id: 'corpse_in_road',
    name: 'Corpse in the Road',
    type: 'discovery',
    contexts: ['travel', 'town'],
    polarity: 'neutral',
    weight: 3,
    trigger: {
      biomes: ['Forest', 'Plains', 'Hills'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A body lies across the path, face down. No blood visible, no obvious cause. Dead, but not long.',
    choice: {
      prompt: 'Do you investigate?',
      options: [
        {
          id: 'search_body',
          text: 'Search the body for clues.',
          skillCheck: { skill: 'Tracking', difficulty: 10 },
          onSuccess: {
            storyText: 'Pockets mostly empty, but there is a sealed letter addressed to someone in the nearest city — and faint marks around the throat.',
            effects: [
              { type: 'experience', amount: 15 },
              {
                type: 'questSeed',
                description: 'Murder victim with a sealed letter. Seeds a Murders or Mysteries quest. AI DM determines identity, killer, and the letter\'s contents.',
              },
            ],
          },
          onFailure: {
            storyText: 'You search the body but find nothing of use. The cause of death is unclear.',
            effects: [
              { type: 'experience', amount: 5 },
            ],
          },
        },
        {
          id: 'report',
          text: 'Leave the body but report it at the next settlement.',
          outcome: {
            storyText: 'You carry the image of it with you down the road.',
            effects: [],
          },
        },
        {
          id: 'pass',
          text: 'Walk past.',
          outcome: {
            storyText: 'Not your business.',
            effects: [],
          },
        },
      ],
    },
  },

  {
    id: 'distant_cry',
    name: 'Cry in the Forest',
    type: 'discovery',
    polarity: 'neutral',
    weight: 4,
    trigger: {
      biomes: ['Forest'],
      timeOfDay: ['🌆 Evening', '🌃 Mid-Evening', '🌙 Dusk', '🌑 Night', '⭐ Late Night'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A cry — human, and frightened — carries through the trees from somewhere off the path. Then silence.',
    choice: {
      prompt: 'It came from the north, deep in the trees.',
      options: [
        {
          id: 'investigate',
          text: 'Head toward the sound.',
          outcome: {
            storyText: 'You push through the undergrowth toward where the cry came from.',
            effects: [
              {
                type: 'questSeed',
                description: 'Cry in the forest at night. AI DM resolves: could be a traveler in danger, a trap, a child, an injured NPC, or something stranger.',
              },
            ],
          },
        },
        {
          id: 'call_out',
          text: 'Call out to whoever it was.',
          outcome: {
            storyText: 'Your voice carries into the dark. Silence returns. Something may have heard you that you did not intend.',
            effects: [],
          },
        },
        {
          id: 'ignore',
          text: 'Keep moving.',
          outcome: {
            storyText: 'You press on. The forest stays quiet.',
            effects: [],
          },
        },
      ],
    },
  },


  // ── Travelling Merchant Encounters ─────────────────────────────────────────

  {
    id: 'travelling_merchant',
    name: 'Travelling Merchant',
    type: 'merchant_encounter',
    merchantType: 'general',
    polarity: 'good',
    weight: 6,
    trigger: {
      biomes: null,
      timeOfDay: ['🌅 Early Morning', '🌄 Mid-Morning', '☀️ Morning', '🌞 Midday', '🌤️ Afternoon', '⛅ Mid-Afternoon', '🌇 Late Afternoon'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A covered wagon trundles along the road ahead. A weathered merchant waves you down with a friendly smile. "Fine goods, reasonable prices — have a look?"',
  },

  {
    id: 'travelling_merchant_evening',
    name: 'Merchant at Camp',
    type: 'merchant_encounter',
    merchantType: 'general',
    polarity: 'good',
    weight: 3,
    trigger: {
      biomes: null,
      timeOfDay: ['🌆 Evening', '🌃 Mid-Evening', '🌙 Dusk'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A small fire glows just off the road. A merchant sits beside it, cart parked and goods spread on a blanket. They look up and gesture you over.',
  },

  {
    id: 'wandering_curio_trader',
    name: 'Wandering Curio Trader',
    type: 'merchant_encounter',
    merchantType: 'rare',
    polarity: 'good',
    weight: 2,
    trigger: {
      biomes: null,
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 3,
    },
    narrative: 'A peculiar figure sits on an ornate chest by the roadside, their wares spread on a velvet cloth. Unusual items glint in the light. Their eyes find yours knowingly.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CRIME EVENTS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'player_robbed',
    name: 'Mugged',
    type: 'crime',
    contexts: ['travel', 'town'],
    polarity: 'bad',
    weight: 5,
    trigger: {
      biomes: null,
      timeOfDay: ['🌆 Evening', '🌃 Mid-Evening', '🌙 Dusk', '🌑 Night', '⭐ Late Night'],
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'A figure steps from the shadows, blade glinting in the low light. "Your purse. Now. Don\'t make this difficult."',
    choice: {
      prompt: 'The robber has you cornered. He looks serious — and fast.',
      options: [
        {
          id: 'comply',
          text: 'Hand over your purse and back away slowly.',
          onSuccess: {
            storyText: 'You toss the purse. He snatches it without a word and disappears into the dark. Smart — you\'re still standing.',
            effects: [{ type: 'robbery', fraction: 0.25, max: 30 }],
          },
        },
        {
          id: 'fight',
          text: 'Draw your weapon and refuse.',
          skillCheck: { skill: 'Brawling', difficulty: 13 },
          onSuccess: {
            storyText: 'He didn\'t expect a fight. You drive him off with bruised knuckles and your gold intact.',
            effects: [{ type: 'experience', amount: 20 }, { type: 'life', amount: -5 }],
          },
          onFailure: {
            storyText: 'He\'s fast and mean. You take a hit before he grabs what he can and bolts.',
            effects: [{ type: 'robbery', fraction: 0.35, max: 50 }, { type: 'life', amount: -10 }],
          },
        },
        {
          id: 'run',
          text: 'Turn and run.',
          skillCheck: { skill: 'Survival', difficulty: 11 },
          onSuccess: {
            storyText: 'You sprint hard and lose him in the streets. Nothing taken but your dignity.',
            effects: [{ type: 'stamina', amount: -15 }],
          },
          onFailure: {
            storyText: 'He\'s faster. A shove, a grab, and you\'re watching his back disappear.',
            effects: [{ type: 'robbery', fraction: 0.20, max: 25 }, { type: 'life', amount: -5 }],
          },
        },
      ],
    },
  },

  {
    id: 'witness_robbery',
    name: 'Robbery in Progress',
    type: 'crime',
    contexts: ['travel', 'town'],
    polarity: 'mixed',
    weight: 3,
    trigger: {
      biomes: null,
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Ahead, a rough-looking figure yanks a satchel from a traveller who stumbles to the ground. "Help!" they cry, eyes darting toward you.',
    choice: {
      prompt: 'The thief hasn\'t run yet. The victim looks up at you, desperate.',
      options: [
        {
          id: 'intervene',
          text: 'Chase him down.',
          skillCheck: { skill: 'Brawling', difficulty: 12 },
          onSuccess: {
            storyText: 'You catch up and block his path. He drops the satchel and bolts. The victim clasps your hand. "Thank you — take this."',
            effects: [{ type: 'experience', amount: 25 }, { type: 'gold', amount: 8 }],
          },
          onFailure: {
            storyText: 'You give chase but he ducks through a gap you can\'t follow. The victim thanks you for trying.',
            effects: [{ type: 'experience', amount: 10 }, { type: 'stamina', amount: -10 }],
          },
        },
        {
          id: 'shout',
          text: 'Shout for guards.',
          skillCheck: { skill: 'Persuasion', difficulty: 9 },
          onSuccess: {
            storyText: 'Guards come running at your shout. The thief bolts empty-handed. The victim gets their satchel back.',
            effects: [{ type: 'experience', amount: 15 }, { type: 'morality', amount: 1 }],
          },
          onFailure: {
            storyText: 'No guards in earshot. The thief takes the satchel and disappears before anyone responds.',
            effects: [],
          },
        },
        {
          id: 'ignore',
          text: 'Keep walking. Not your problem.',
          onSuccess: {
            storyText: 'You lower your head and pass by. The cries fade. You tell yourself there was nothing you could do.',
            effects: [{ type: 'morality', amount: -2 }],
          },
        },
      ],
    },
  },


  // ══════════════════════════════════════════════════════════════════════════
  // THE ARÚVARI — Fragments of a forgotten people
  // Tone: dark, tragic, lamentful. Each event reveals another piece.
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'aruvari_ancient_mark',
    name: 'An Ancient Mark',
    type: 'discovery',
    polarity: 'neutral',
    weight: 4,
    trigger: {
      biomes: ['Forest', 'Hills', 'Plains', 'Mountains'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'Something carved into a boulder stops you. Not recent work — the edges are worn smooth by decades of rain. A stylised tree, branches balanced on both sides, but with the roots shown too, spreading as wide as the canopy. You have seen this mark before, you think, without ever noticing it.',
    simple: {
      storyText: 'You study it for a moment, then move on. The image stays with you.',
      effects: [
        { type: 'lore', id: 'aruvari-insignia', source: 'exploration' },
        { type: 'experience', amount: 10 },
      ],
    },
  },

  {
    id: 'aruvari_ruins_encounter',
    name: 'Ruins of an Earlier Age',
    type: 'discovery',
    polarity: 'neutral',
    weight: 3,
    trigger: {
      biomes: ['Forest', 'Hills', 'Mountains', 'Plains'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 1,
    },
    narrative: 'The treeline opens onto a scatter of dressed stones half-buried in the earth. No mortar. No rubble. Just stone fitted to stone with a patience that has outlasted the hands that placed them. A structure once stood here. It was not small.',
    choice: {
      prompt: 'The ruins are older than anything on any map you have seen. Do you investigate?',
      options: [
        {
          id: 'search',
          text: 'Search carefully among the stones.',
          skillCheck: { skill: 'Tracking', difficulty: 9 },
          onSuccess: {
            storyText: 'You find a section of wall still standing, sheltered by an oak that has grown up against it. An inscription is carved into the face of it — not worn away, just waiting.',
            effects: [
              { type: 'lore', id: 'aruvari-ruins', source: 'site' },
              { type: 'lore', id: 'aruvari-inscription', source: 'site' },
              { type: 'experience', amount: 20 },
            ],
          },
          onFailure: {
            storyText: 'You find nothing specific — only the weight of the place, and the sense that whatever was built here was built to endure.',
            effects: [
              { type: 'lore', id: 'aruvari-ruins', source: 'site' },
              { type: 'experience', amount: 10 },
            ],
          },
        },
        {
          id: 'pass',
          text: 'Note the location and keep moving.',
          outcome: {
            storyText: 'You mark the spot in memory and press on. The stones watch you go.',
            effects: [],
          },
        },
      ],
    },
  },

  {
    id: 'aruvari_blood_soil',
    name: 'Something Wrong With the Earth',
    type: 'discovery',
    polarity: 'neutral',
    weight: 3,
    trigger: {
      biomes: ['Plains', 'Hills', 'Grassland'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 2,
    },
    narrative: 'A stretch of open ground catches your eye. The soil here is a different colour — not red exactly, not brown exactly, something between the two that feels wrong in a way you cannot articulate. An old farmer nearby pauses his work, watches you looking at it, and says nothing. When you glance over, he has turned his back.',
    simple: {
      storyText: 'You crouch and press your fingers into the earth. It is cold despite the sun. You straighten, brush your hands clean, and walk on. You do not look back.',
      effects: [
        { type: 'lore', id: 'aruvari-blood-in-soil', source: 'exploration' },
        { type: 'experience', amount: 15 },
      ],
    },
  },

  {
    id: 'aruvari_childs_carving',
    name: 'The Carving',
    type: 'discovery',
    once: true,
    polarity: 'neutral',
    weight: 2,
    trigger: {
      biomes: ['Forest', 'Hills', 'Mountains', 'Plains'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 3,
    },
    narrative: 'The ruin is unremarkable at first — fallen stones, mossy joints, the forest working slowly at reclaiming the walls. Then something at knee height catches your eye. A flat stone face, sheltered from the rain by an overhang. On it, scratched with something sharp and deliberate: small pictures. A child\'s pictures.',
    simple: {
      storyText: 'You crouch down. A sun. Two tall figures. A small one between them, arms out. Then many smaller figures in a row. Then nothing. Then, lower, carved deeper, done later: the small figure alone. No sun. No tall figures. Arms at its sides. You stay there for a long time. You do not have words for what you feel, and you are not sure words would be appropriate.',
      effects: [
        { type: 'lore', id: 'aruvari-childs-carving', source: 'site' },
        { type: 'experience', amount: 30 },
        { type: 'morality', amount: 2 },
      ],
    },
  },

  {
    id: 'aruvari_old_guardian',
    name: 'The Watchman',
    type: 'mystical',
    once: true,
    polarity: 'neutral',
    weight: 2,
    trigger: {
      biomes: ['Hills', 'Forest', 'Mountains', 'Plains'],
      timeOfDay: null,
      weather: null,
      kingdoms: null,
      minLevel: 3,
    },
    narrative: 'A figure stands motionless at the base of a collapsed tower — walls long since fallen, stones scattered by centuries of frost and root. He wears clothing of a style you cannot place. His back is straight. His eyes are fixed on a horizon that the landscape no longer matches. As you approach, he speaks. The language is fluid and low, nothing you recognise. His posture says: I am still here. I have not left my post.',
    choice: {
      prompt: 'He has not acknowledged you. He is watching something you cannot see.',
      options: [
        {
          id: 'speak',
          text: 'Speak to him gently.',
          skillCheck: { skill: 'Persuasion', difficulty: 10 },
          onSuccess: {
            storyText: 'He pauses. Turns. Looks at you with eyes that are older than they should be — not aged, exactly, but used, in a way that has no word in your language. He speaks again, shorter this time, the cadence of something memorised long ago. Then he turns back to his horizon. You understand nothing of the words. You understand everything of the tone.',
            effects: [
              { type: 'lore', id: 'aruvari-watchman', source: 'npc' },
              { type: 'lore', id: 'aruvari-first-people', source: 'npc' },
              { type: 'experience', amount: 40 },
            ],
          },
          onFailure: {
            storyText: 'He does not respond. He is not ignoring you. He cannot hear you. Whatever world he is listening to, you are not in it. You stand beside him for a moment, then step away. The sound of his language follows you for a while before it fades.',
            effects: [
              { type: 'lore', id: 'aruvari-watchman', source: 'npc' },
              { type: 'experience', amount: 20 },
            ],
          },
        },
        {
          id: 'leave',
          text: 'Leave him undisturbed.',
          outcome: {
            storyText: 'You step back quietly. He does not notice. He is still speaking when you are out of sight — still at his post, still watching. Still waiting for something that is not coming back.',
            effects: [
              { type: 'experience', amount: 10 },
            ],
          },
        },
      ],
    },
  },

  // ── Arúvari — Pendant found in hidden Arúvari cache ─────────────────────────
  {
    id: 'aruvari_pendant_discovery',
    name: 'A Sealed Hollow',
    type: 'mystical',
    polarity: 'good',
    weight: 7,
    once: true,
    trigger: {
      requiredLore: 'aruvari-aelindra-burial',
      excludeFlags: { pendantFound: true },
    },
    narrative: 'The grave stone is exactly as the description left you expecting it — flat, flush with the earth, the sleeping-star worn but legible. The growth that has consumed everything around it has stopped at its edge, as though something insists the clearing remain. And there, at the base of the marked stone: a second smaller stone with a seam along its edge.',
    choice: {
      prompt: 'The stone has a seam along its base. It has not been opened in a very long time.',
      options: [
        {
          id: 'open',
          text: 'Open it.',
          outcome: {
            storyText: 'The stone grinds. Inside, wrapped in a cloth that should have rotted nine centuries ago but has not, is a pendant on an old cord. Dark carved stone. A symbol you have seen in two of the tablets — the one from the sealed chamber and the confessor\'s stone. It is neither warm nor cold in your hand. It does not feel like something waiting to be used. It feels like something that has been kept safe, very carefully, for a very long time, by someone who believed this moment would come.',
            effects: [
              { type: 'item', name: "Aelindra's Pendant", qty: 1 },
              { type: 'setFlag', key: 'pendantFound', value: true },
              { type: 'experience', amount: 150 },
              { type: 'morality', amount: 2 },
            ],
          },
        },
        {
          id: 'leave',
          text: 'Leave it undisturbed.',
          outcome: {
            storyText: 'You step back. The seam is there if you come back. Some things are better approached twice — once to find, once to decide.',
            effects: [
              { type: 'experience', amount: 15 },
            ],
          },
        },
      ],
    },
  },

  // ── Arúvari — Watchman reacts to the pendant ─────────────────────────────────
  {
    id: 'aruvari_watchman_reacts',
    name: 'The Watchman Sees',
    type: 'mystical',
    polarity: 'mixed',
    weight: 6,
    once: true,
    trigger: {
      requiredFlags: { pendantFound: true },
      requiredEquipped: "Aelindra's Pendant",
    },
    narrative: 'The figure at the fallen watchtower does not turn as you approach. He never does. But when you are close enough that he should have noticed you, something changes. Not movement — a stilling. As though his body, which has stood in one posture for longer than any building nearby has stood at all, has suddenly found a different kind of stillness. He turns. His eyes find you. Then they find the pendant.',
    choice: {
      prompt: 'He is looking at the pendant. Something is happening behind his eyes.',
      options: [
        {
          id: 'hold_it_out',
          text: 'Hold the pendant toward him.',
          outcome: {
            storyText: 'His breath comes out in a sound you have no word for — not a word, not a cry, something older than either. He reaches toward the pendant but does not touch it. His hand stays in the air between you. When he speaks, it is still in the old tongue, but the cadence is different now — not recitation, not duty. Something personal. Something that has been held for nine centuries without anywhere to put it. You understand the shape of it: grief. Relief. The particular exhaustion of a task that has finally, finally been completed. He straightens. Looks at you directly. In the clearest common-tongue you have heard him use, one word: <em>Remembered.</em>',
            effects: [
              { type: 'experience', amount: 200 },
              { type: 'morality', amount: 4 },
              { type: 'setFlag', key: 'watchmanReacted', value: true },
            ],
          },
        },
        {
          id: 'wait',
          text: 'Stand still and let him look.',
          outcome: {
            storyText: 'You do not move. He looks at the pendant for a long time. Then he looks at you, and something in his posture shifts — the weight of nine centuries of unanswered duty, redistributed. Not lifted. But acknowledged. He speaks. You catch only pieces — a name in the old tongue, repeated twice, then a longer phrase you cannot follow. Then silence. He turns back toward his horizon. But he is standing differently than he was. Something has changed. You feel it without being able to name it.',
            effects: [
              { type: 'experience', amount: 150 },
              { type: 'morality', amount: 3 },
              { type: 'setFlag', key: 'watchmanReacted', value: true },
            ],
          },
        },
      ],
    },
  },

  // ── Arúvari — Pendant resonates at the Crimson Valley ───────────────────────
  {
    id: 'aruvari_valley_resonance',
    name: 'Something Answers',
    type: 'mystical',
    polarity: 'mixed',
    weight: 6,
    once: true,
    trigger: {
      biomes: ['Plains', 'Hills', 'Grassland'],
      requiredFlags: { aruvariTruthKnown: true },
      requiredEquipped: "Aelindra's Pendant",
    },
    narrative: 'The pendant moves. You feel it before you see it — a tension in the cord, a faint pull, like a slow tide. The ground here is a shade darker than the surrounding soil. The grass grows in a particular way, low and pressed outward from a centre as though something heavy once settled here and the land still remembers the shape of the weight. The pendant grows warm.',
    choice: {
      prompt: 'You are standing somewhere the pendant recognises.',
      options: [
        {
          id: 'stay',
          text: 'Stand still and let it happen.',
          outcome: {
            storyText: 'The warmth spreads up your arm. For a moment — brief, unbidden — you see it. Not a vision exactly: more like an impression. A valley full of firelight. Figures moving between fires. The sound of instruments you have no name for. Children asleep in the grass. Then the fires go out all at once, and the impression ends. The pendant cools. The grass is ordinary again. But the red wildflowers at the edge of the clearing are still there, shaped like a crowd, and the birds in the trees above you are not singing.',
            effects: [
              { type: 'experience', amount: 150 },
              { type: 'morality', amount: 2 },
              { type: 'setFlag', key: 'valleyResonanceSeen', value: true },
            ],
          },
        },
        {
          id: 'leave',
          text: 'Step away from this place.',
          outcome: {
            storyText: 'You step back. The pull fades. The pendant settles. You do not know what would have happened if you had stayed — but you have read enough to know that some knowledge chooses its own moment. The place will still be here.',
            effects: [
              { type: 'experience', amount: 30 },
            ],
          },
        },
      ],
    },
  },

  // ── Listener's Compass — found via mysterious encounter ──────────────────────
  {
    id: 'listeners_compass_found',
    name: 'An Unusual Trade',
    type: 'discovery',
    polarity: 'good',
    weight: 2,
    once: true,
    trigger: {
      minLevel: 3,
    },
    narrative: 'A figure sits at the roadside with no goods displayed — no cart, no pack, no blanket of wares. Just the figure, seated, watching the road with the patience of someone who was waiting for a specific traveler. When you approach, they produce a single item from an inner pocket without being asked: a compass in a worn brass case. The needle drifts in a slow arc that does not correspond to north, or to anything you can identify.',
    choice: {
      prompt: 'The figure holds out the compass without a word.',
      options: [
        {
          id: 'take',
          text: 'Take the compass.',
          outcome: {
            storyText: 'The figure drops it into your palm and folds their hands in their lap. No price named. No explanation. When you look up to ask, they are already watching the road again — as though the transaction is complete and you are already elsewhere. The compass sits warm in your hand, needle drifting in its slow arc toward something you cannot yet see.',
            effects: [
              { type: 'item', name: "Listener's Compass", qty: 1 },
              { type: 'experience', amount: 50 },
            ],
          },
        },
        {
          id: 'decline',
          text: 'Leave it.',
          outcome: {
            storyText: 'You keep walking. The figure does not call after you. When you glance back a few paces on, they are gone — no impression in the grass, no sound of movement. The road is empty in both directions.',
            effects: [
              { type: 'experience', amount: 10 },
            ],
          },
        },
      ],
    },
  },

];
