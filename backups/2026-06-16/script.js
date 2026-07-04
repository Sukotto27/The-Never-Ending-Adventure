// script.js
console.log('🔧 script.js loaded');

// ============================================================
// GLOBAL STORAGE  (outside DOMContentLoaded — intentional)
// ============================================================
const EDITOR_STORAGE_KEY = 'map-editor-data';
let mapData = JSON.parse(localStorage.getItem(EDITOR_STORAGE_KEY) || '{}');

document.addEventListener('DOMContentLoaded', () => {

// ============================================================
// SECTION 1 · INIT & GLOBALS
// ============================================================

// 1.1 · Game State Flags
let developerMode = false;
let campSetup = false;
let _invView  = 'inventory'; // 'inventory' | 'herb_pouch' | 'ingredient_pouch' | 'camp'
let _townEngaged  = false;  // true while player is engaged with a settlement's menus
let _currentEstab = null;   // current establishment object, or null
let contextMenuJustOpened = false;

// 1.1b · Save Slot System
const SAVE_SLOT_COUNT = 5;
const SAVE_KEY   = slot => `rpg-save-${slot}`;
const SAVE_META  = slot => `rpg-save-${slot}-meta`;
const ACTIVE_SLOT_KEY = 'rpg-active-slot';
let _activeSlot = parseInt(localStorage.getItem(ACTIVE_SLOT_KEY) || '0', 10);
// Migrate legacy single-save to slot 0
(function _migrateLegacy() {
  const legacy = localStorage.getItem('rpg-save');
  if (legacy && !localStorage.getItem(SAVE_KEY(0))) {
    localStorage.setItem(SAVE_KEY(0), legacy);
    try {
      const p = JSON.parse(legacy)?.player || {};
      localStorage.setItem(SAVE_META(0), JSON.stringify({
        name: p.name || 'Unknown', level: p.level || 1,
        location: p.currentLocation || '', time: Date.now()
      }));
    } catch(_) {}
    localStorage.removeItem('rpg-save');
  }
})();

// 1.2 · Fire Timer State
let fireTimeRemaining = 0,
    initialFireTime   = 0,
    fireTimerInterval = null;

// 1.2b · Tutorial State (global so functions outside the closure can read it)
let _tutActive = false;

// 1.3 · Hunt State
let huntActive = false;
let currentHunt = null;

// 1.3b · Combat State
let combatState = null;

// 1.3c · World NPC Registry
let worldNPCs = {
  registry:    {},   // { [id]: WorldNPCRecord }
  eventLog:    [],   // rolling 50 — dev mode display
  npcRumors:   [],   // pool of NPC-sourced tavern rumors
  currentTurn: 0,
  nextId:      1,
};

// 1.3d · World Economy State
let worldEconomy = {
  activeEvents: [],  // [{ id, type, kingdom, turnsLeft, description }]
};

function initWorldEconomy() {
  worldEconomy.activeEvents = [
    // Wired from kingdoms.js lore — permanent story events use turnsLeft: 999
    { id: 'naradreth_civil_war',    type: 'civil_war',         kingdom: 'Naradreth',  turnsLeft: 999 },
    { id: 'ardrenhold_harvest',     type: 'harvest_festival',  kingdom: 'Ardrenhold', turnsLeft: 16  },
    { id: 'brythwen_plague',        type: 'plague',            kingdom: 'Brythwen',   turnsLeft: 40  },
    { id: 'feldarun_mining_boom',   type: 'mining_boom',       kingdom: 'Feldarún',   turnsLeft: 999 },
  ];
}

// Tracks whether any story text has been added since the last wheel build.
// When _buildWheel fires and this is true, a divider is inserted to separate scene-groups.
let _storyDirtySinceWheel = false;

// 1.3e · Book State (open-book UI)
const bookState = {
  activeSection:   'story',
  activeJournalTab:'player-info-tab',
  isAnimating:     false,
  silentMode:      false,   // suppresses page-turn animations during load
  story: {
    pages:   [''],  // array of innerHTML strings, one per page
    current: 0,
  },
};

// Rumour templates per event type — written as overheard tavern gossip.
const EVENT_RUMORS = {
  civil_war:       (k) => [
    `Word from ${k} is grim — the lords are at each other's throats. Weapons are going for double if you can even find them.`,
    `A soldier passing through said the roads in ${k} aren't safe anymore. Some kind of power struggle among the nobility.`,
  ],
  kingdom_at_war:  (k) => [
    `${k} is on a war footing — the recruiters are out in force and supply wagons are rolling day and night.`,
    `Prices are up everywhere since ${k} started mobilising. Half their harvest is going to feed an army.`,
  ],
  plague:          (k) => [
    `There's sickness in ${k} — plague, they say. The healers are overwhelmed and potion prices have gone through the roof.`,
    `Travellers from ${k} are being turned away at some borders. Something about a contagion spreading through the villages.`,
  ],
  famine:          (k) => [
    `The harvest failed in ${k}. People are going hungry and food prices are at desperate levels — if you find any.`,
    `A merchant just in from ${k} says the granaries are nearly empty. It's going to be a brutal winter there.`,
  ],
  prosperity:      (k) => [
    `${k} is doing well this season — good harvests, peaceful roads, and prices are down across the board.`,
    `A trader says ${k} is the place to resupply right now. Goods are plentiful and nobody's gouging.`,
  ],
  trade_boom:      (k) => [
    `Caravans have been flowing through ${k} all season. Prices are down and the merchants are in good spirits.`,
    `Someone at the bar said ${k} opened new trade routes. Good time to do business up that way.`,
  ],
  bandit_surge:    (k) => [
    `The roads around ${k} aren't safe. Bandits have been hitting caravans and the militia is stretched thin.`,
    `Three caravans lost on the ${k} road this month. Merchants are paying double for armed escorts.`,
  ],
  harvest_festival:(k) => [
    `Travellers from ${k} say the harvest this year was spectacular. Food and ale are practically being given away.`,
    `${k} is holding a harvest festival — apparently the fields were so good they don't know what to do with it all.`,
  ],
  magic_shortage:  (k) => [
    `Something's happened to the ingredient supply in ${k}. Alchemists are rationing and potion prices have spiked hard.`,
    `A mage complained that rare reagents have dried up completely around ${k}. Nobody knows why.`,
  ],
  dragon_threat:   (k) => [
    `There have been sightings near ${k}. Something large and winged. The militia is buying every sword they can find.`,
    `A shepherd swore blind he saw a dragon shadow over the hills near ${k}. True or not, the weapons merchants are doing well.`,
  ],
  mining_boom:     (k) => [
    `The miners in ${k} hit something big — veins running deeper than anyone expected. Metal goods are cheap up there right now.`,
    `Word is ${k} is sitting on a fortune in ore. Smiths are flooding in and the price of iron has dropped.`,
  ],
};

function seedRumorsFromWorldEvents() {
  if (!worldEconomy?.activeEvents?.length) return;
  const rumors = [];
  for (const ev of worldEconomy.activeEvents) {
    const templates = EVENT_RUMORS[ev.type];
    if (!templates || !ev.kingdom) continue;
    const line = templates(ev.kingdom)[Math.floor(Math.random() * templates(ev.kingdom).length)];
    rumors.push(line);
  }
  // Shuffle and add up to 5, keeping the pool trimmed
  rumors.sort(() => Math.random() - 0.5);
  for (const r of rumors.slice(0, 5)) {
    if (!worldNPCs.npcRumors.includes(r)) worldNPCs.npcRumors.push(r);
  }
}

function addWorldEconomyEvent(type, kingdom, turnsLeft = 20) {
  if (!WORLD_EVENT_EFFECTS[type]) return;
  const id = `${type}_${kingdom || 'global'}_${Date.now()}`;
  worldEconomy.activeEvents = worldEconomy.activeEvents.filter(e => !(e.type === type && e.kingdom === kingdom));
  worldEconomy.activeEvents.push({ id, type, kingdom: kingdom || null, turnsLeft });
  const fx = WORLD_EVENT_EFFECTS[type];
  addStory(`📰 ${fx.icon} ${fx.label}${kingdom ? ` in ${kingdom}` : ''}: ${fx.description}`);
}

function tickWorldEconomy() {
  if (!worldEconomy?.activeEvents?.length) return;
  worldEconomy.activeEvents = worldEconomy.activeEvents.filter(ev => {
    if (ev.turnsLeft === 999) return true;
    ev.turnsLeft--;
    if (ev.turnsLeft <= 0) {
      const fx = WORLD_EVENT_EFFECTS[ev.type];
      addStory(`📰 ${fx?.icon || '📰'} ${fx?.label || ev.type}${ev.kingdom ? ` in ${ev.kingdom}` : ''} has ended.`);
      return false;
    }
    return true;
  });
}

// 1.4 · Map Editor State
let bordersVisible   = false;
let biomesVisible    = false;
let iconsVisible     = false;
let borderMode       = false;
let biomeMode        = false;
let editMode         = false;
let borderSelections = {};
let biomeSelections  = {};
const GRID_SIZE = 25;
// Canvas size when map data was originally authored (max coord + GRID_SIZE)
const MAP_AUTH_W = 1075;
const MAP_AUTH_H = 625;

let autoRoll = false;

// 1.5 · UI Selection State
let selectedItem = null, selectedItemIndex = null;
let selectedCellKey = null;
let selectedKingdom = 'Ardrenhold';
let selectedBorderColor;

// 1.6 · Cached DOM References
const restModal   = document.getElementById('rest-container') || document.getElementById('rest-modal');
const restLog     = document.getElementById('rest-log');
const confirmModal   = document.getElementById('travel-confirm-modal');
const confirmText    = document.getElementById('travel-confirm-text');
const confirmYesBtn  = document.getElementById('travel-confirm-yes');
const confirmNoBtn   = document.getElementById('travel-confirm-no');
const wheel      = document.getElementById('choice-wheel');
const inputBox   = document.getElementById('input-container');
const userInput  = document.getElementById('user-input');
const submitBtn  = document.getElementById('submit-button');

// 1.7 · Dev Mode Button
document.getElementById('dev-mode-button').onclick = () => {
  developerMode = !developerMode;
  const bc = document.getElementById('border-controls');
  if (bc) bc.style.display = developerMode ? '' : 'none';
  addStory(`Developer Mode ${developerMode ? 'enabled' : 'disabled'}.`);
};

// Global hover handler for any img with data-hover
document.addEventListener('mouseover', (e) => {
  const img = e.target.closest('img[data-hover]');
  if (!img) return;

  const hover = img.getAttribute('data-hover');
  if (hover) {
    img.dataset.originalSrc = img.src;
    img.src = hover;
  }
});

document.addEventListener('mouseout', (e) => {
  const img = e.target.closest('img[data-hover]');
  if (!img) return;

  const original = img.getAttribute('data-src') || img.dataset.originalSrc;
  if (original) img.src = original;
});

// ============================================================
// SECTION 2 · PLAYER STATE
// ============================================================

// 2.1 · Player Object
const player = {
				name: 'Player Name',
				level: 1,
				experience: 0,
				gold: 50,
				timeOfDay: '🌆 Evening',
				day: 1,
				weather: 'Clear',
				currentLocation: 'Unknown',
				currentKingdom: 'Unknown',
				currentAction: 'Idle',
				maxLife: 100,
				life: 100,
				maxStamina: 50,
				stamina: 50,
				maxMana: 50,
				mana: 50,
				get maxCarryWeight() {
    				    return this.maxStamina * 2;
 				},
				tempBuffs: [],
				skills: {
					'Swordsmanship': {
						level: 1,
						usageCount: 5
					},
					'Archery': {
						level: 2,
						usageCount: 10
					}
				},
				traits: [],
				inventory: {
					'Health Potion': { ...Items.Potions['Health Potion'], quantity: 3 },
					'Iron Sword':    { ...Items.Weapons['Iron Sword'],    quantity: 1 },
				},
				equipped: {},
				journal: {
					locations: [],
					npcs: [],
					quests: [],
					discoveredLocations: {
						'x175_y500': true
					}
				},
			defenses: [],
			campSupplies: [],
			storyLog: [],
			worldEvents: [],
			conditions: [],
			turnsWithoutFood: 0,
			knownLocations:            {},   // { [coord]: { nameKnown: true } }
			knownKingdoms:             {},   // { [kingdomName]: true } — unlocked by owning that kingdom's map
			knownRecipes:              [],   // string[] of recipe names visible in the craft wheel
			flags:                     {},   // persistent player-level flags set by quest/world events
			worldState: {                    // global event tracking — persisted in save
				firedEvents:      [],         // IDs of once:true events that have fired
				defeatedEnemies:  0,          // total combat victories
				kingdomsVisited:  [],         // unique kingdom names visited
				travelCount:      0,          // total travel actions taken
			},
			morality:                  0,    // -100 (Vile) → 0 (Neutral) → +100 (Righteous)
			hope:                      0,    // -100 (Broken) → 0 (Steady) → +100 (Radiant)
			kingdomReputation:         {},   // { [kingdomName]: number }  -100 to +100, default 0
			kingdomStats:              {},   // { [kingdomName]: { prosperity, happiness, stability, military, crime, trade, population, fallen } }
			titles:                    [],   // string[] of earned title IDs
			ship:                      null, // { name, type, wear, homePort } or null
			activeTitle:               null, // string | null — currently worn title ID
			professions:               {},   // { [name]: { tier: 0, xp: 0 } }
			activeProfession:          null, // currently active profession name
			socialClass:               '',   // social class from PROFESSION_DATA
			traitCounters: {                 // behaviour tallies used to unlock traits
				questsCompleted:      0,
				npcInteractions:      0,
				heroicTones:          0,   // Valiant + Heroic tone choices
				aggressiveTones:      0,   // Malicious + Malevolent tone choices
				persuasionSuccesses:  0,   // tier 4/5 Persuasion results
				persuasionFails:      0,   // tier 1/2 Persuasion results
				nearDeaths:           0,   // life dropped to ≤10% of max
				goldSpent:            0,   // gold given to NPCs or spent on actions
			},
			discoveredEstablishments:  {},   // { [coord]: string[] } — establishments found by exploration/NPCs
			discoveredCells:           {},   // { [coord]: true } — persisted fog-of-war state
			questMarkers:              [],   // [coord] — cells with active quest objectives (red !)
			trackedQuest:              null, // quest id being tracked, drives questMarkers
			campLocation:              null, // coord key of active camp, or null
			party:                     [],   // [{ worldId, name, race, profession, contractType, hireCost, joinedAt }]
			quickSlots: Array(10).fill(null),
			learnedLore: [],            // [{ id, source, learnedAt }]
			pouchContents:  { herb: {}, ingredient: {} }, // items stored inside pouches
			activePouches:  { herb: null, ingredient: null, coin: null }, // null | item name string
			};

// 2.2 · Known Locations
const locations = {
				'x175_y500': {
					biome: 'Grassland',
					kingdom: 'Ardrenhold',
					zone: 'City',
					cityVillage: 'Ardrenkeep',
					description: 'A fortified city with the noble king’s keep.',
					discovered: true
				}
			};


// ============================================================
// SECTION 3 · UTILITY FUNCTIONS
// ============================================================

// 3.1 · Random Helpers

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAnimal() {
  const animals = ['Deer', 'Rabbit', 'Boar', 'Wolf', 'Bear'];
  return animals[Math.floor(Math.random() * animals.length)];
}

function randomTrackingText() {
  const texts = [
    "Following fresh tracks...",
    "Investigating broken branches...",
    "Spotting distant movement...",
    "Listening for rustling noises...",
    "Scanning for trails in the mud..."
  ];
  return texts[Math.floor(Math.random() * texts.length)];
}

// 3.2 · String Helpers

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCleanBaseItemName(name) {
  const prefixes = ['Raw', 'Charred', 'Burnt', 'Undercooked', 'Overcooked', 'Cooked', 'Well-Cooked', 'Perfectly Cooked'];
  return name.split(' ').filter(word => !prefixes.includes(word)).join(' ');
}

// Per-condition stamina/life effects for dynamically-named cooked food
const COOK_CONDITION_EFFECTS = {
  'Charred':          { stamina:  3, life: -2 },
  'Burnt':            { stamina:  6, life:  0 },
  'Undercooked':      { stamina:  9, life:  0 },
  'Overcooked':       { stamina: 11, life:  0 },
  'Cooked':           { stamina: 15, life:  0 },
  'Well-Cooked':      { stamina: 20, life:  5 },
  'Perfectly Cooked': { stamina: 26, life: 10 },
};

// 3.3 · Status Text

function statusText(pct, table) {
  for (const [thr, label] of table) if (pct >= thr) return label;
  return table[table.length - 1][1];
}

// 3.4 · Icon Helpers

function getIconForWoodType(type) {
  const icons = {
    'Stick Bundle':      'images/icons/sticks.png',
    'Small Wood Bundle': 'images/icons/firewood.png',
    'Large Wood Bundle': 'images/icons/large-logs.png'
  };
  return icons[type] || 'images/icons/default.png';
}

function getGatherIcon(label) {
  const icons = {
    'Gather Sticks':     'images/icons/sticks.png',
    'Gather Small Logs': 'images/icons/small-firewood.png',
    'Gather Large Logs': 'images/icons/large-firewood.png'
  };
  return icons[label] || 'images/icons/default.png';
}

// ============================================================
// SECTION 4 · DICE SYSTEM
// ============================================================

// 4.1 · Roll Functions
// Named outcome constants — use instead of bare 1–5
const OUTCOME = {
  MAJOR_NEG: 1,
  MINOR_NEG: 2,
  NEUTRAL:   3,
  MINOR_POS: 4,
  MAJOR_POS: 5,
};

const _OUTCOME_LABELS = {
  1: { text: 'Critical Failure', css: 'out-major-neg' },
  2: { text: 'Failure',          css: 'out-minor-neg' },
  3: { text: 'Mixed Result',     css: 'out-neutral'   },
  4: { text: 'Success',          css: 'out-minor-pos' },
  5: { text: 'Critical Success', css: 'out-major-pos' },
};

function outcomeLabel(tier) { return _OUTCOME_LABELS[tier] ?? _OUTCOME_LABELS[3]; }

function classifyRoll(roll) {
  if (window.d20ShowNumber) window.d20ShowNumber(roll);
  const tier = roll <= 5 ? 1 : roll <= 10 ? 2 : roll <= 14 ? 3 : roll <= 18 ? 4 : 5;
  const ol = outcomeLabel(tier);
  addStory(`🎲 Rolled ${roll} — <span class="outcome-tag ${ol.css}">${ol.text}</span>`);
  return tier;
}

// 4.2 · Hidden Roll
function hiddenRoll() {
  return Math.floor(Math.random() * 20) + 1;
}

// 4.3 · Progress Bar (0% → 100%)
function runProgressBar(id, durationMs) {
  const outer = document.getElementById(id),
        inner = outer.firstElementChild;
  console.log(`▶ runProgressBar("${id}") →`, outer);
  outer.style.display = 'block'; inner.style.width = '0%';
  return new Promise(resolve => {
    const tick = 100, total = durationMs;
    let elapsed = 0;
    const iv = setInterval(() => {
      elapsed += tick;
      inner.style.width = Math.min(100, elapsed/total*100) + '%';
      if (elapsed >= total) {
        clearInterval(iv);
        outer.style.display = 'none';
        resolve();
      }
    }, tick);
  });
}

// 4.3b · Inline progress bar (camping/rest — shown where the input field is)
async function runInlineProgress(label, durationMs) {
  const wrap  = document.getElementById('action-progress-wrap');
  const lbl   = document.getElementById('action-progress-label');
  const outer = document.getElementById('action-progress-bar');
  const inner = outer?.firstElementChild;
  if (lbl)   lbl.textContent   = label || '';
  if (wrap)  wrap.style.display = 'flex';
  if (inner) inner.style.width  = '0%';
  player.currentAction = (label || '').replace(/[…\.]+$/, '').trim() || 'Busy';
  updateTopStats();
  return new Promise(resolve => {
    const tick = 100;
    let elapsed = 0;
    const iv = setInterval(() => {
      elapsed += tick;
      if (inner) inner.style.width = Math.min(100, elapsed / durationMs * 100) + '%';
      if (elapsed >= durationMs) {
        clearInterval(iv);
        if (wrap)  wrap.style.display = 'none';
        player.currentAction = 'Idle';
        updateTopStats();
        resolve();
      }
    }, tick);
  });
}

// 4.3c · Multi-phase progress bar — runs ONE continuous bar across many phases.
// Returns a controller: { advance(newLabel), pause(), resume(), finish() }
// Each call to advance() simply updates the label; the bar keeps filling continuously.
// Caller awaits individual phase Promises by calling controller.phasePromise(ms).
function startContinuousProgress(totalMs, initialLabel) {
  const wrap  = document.getElementById('action-progress-wrap');
  const lbl   = document.getElementById('action-progress-label');
  const outer = document.getElementById('action-progress-bar');
  const inner = outer?.firstElementChild;
  if (lbl)   lbl.textContent    = initialLabel || '';
  if (wrap)  wrap.style.display = 'flex';
  if (inner) inner.style.width  = '0%';
  player.currentAction = (initialLabel || '').replace(/[…\.]+$/, '').trim() || 'Busy';
  updateTopStats();

  let elapsed = 0, paused = false, done = false;
  const tick = 100;
  const iv = setInterval(() => {
    if (paused || done) return;
    elapsed += tick;
    if (inner) inner.style.width = Math.min(100, (elapsed / totalMs) * 100) + '%';
    if (elapsed >= totalMs && !done) {
      done = true;
      clearInterval(iv);
      if (wrap)  wrap.style.display = 'none';
      player.currentAction = 'Idle';
      updateTopStats();
    }
  }, tick);

  return {
    setLabel(txt) {
      if (lbl) lbl.textContent = txt || '';
      player.currentAction = (txt || '').replace(/[…\.]+$/, '').trim() || 'Busy';
      updateTopStats();
    },
    pause()  { paused = true; },
    resume() { paused = false; },
    // Wait for `ms` more milliseconds of real ticking (bar still advances)
    wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    finish() {
      if (!done) {
        done = true;
        clearInterval(iv);
        if (wrap)  wrap.style.display = 'none';
        player.currentAction = 'Idle';
        updateTopStats();
      }
    },
  };
}

// 4.4 · Smooth Multi-Phase Hunt Progress Bar
async function runSmoothHuntProgress(steps) {
  const outer = document.getElementById('hunt-progress');
  const inner = outer.firstElementChild;
  outer.style.display = 'block';
  inner.style.width = '0%';

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
  let elapsed = 0, currentPhase = 0, phaseEnd = steps[0].duration;

  return new Promise(resolve => {
    const tick = 100;
    const interval = setInterval(() => {
      elapsed += tick;
      inner.style.width = `${Math.min(100, elapsed / totalDuration * 100)}%`;

      if (elapsed >= phaseEnd && currentPhase < steps.length - 1) {
        currentPhase++;
        restLog.textContent = steps[currentPhase].text;
        phaseEnd += steps[currentPhase].duration;
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        outer.style.display = 'none';
        resolve();
      }
    }, tick);

    // First text immediately
    restLog.textContent = steps[0].text;
  });
}


// Map tier → wood quality & burn time (seconds)
const woodQuality = {
  1: { label: 'poor',      time: 30 },
  2: { label: 'fair',      time: 50 },
  3: { label: 'good',      time: 70 },
  4: { label: 'excellent', time: 80 },
  5: { label: 'perfect',   time: 90 }
};

// 4.5 · Dice Animations
const diceAnimations = {
  1:  'videos/dice/roll 1.webm',
  2:  'videos/dice/roll 2.webm',
  3:  'videos/dice/roll 3.webm',
  4:  'videos/dice/roll 4.webm',
  5:  'videos/dice/roll 5.webm',
  6:  'videos/dice/roll 6.webm',
  7:  'videos/dice/roll 7.webm',
  8:  'videos/dice/roll 8.webm',
  9:  'videos/dice/roll 9.webm',
  10:  'videos/dice/roll 10.webm',
  11:  'videos/dice/roll 11.webm',
  12:  'videos/dice/roll 12.webm',
  13:  'videos/dice/roll 13.webm',
  14:  'videos/dice/roll 14.webm',
  15:  'videos/dice/roll 15.webm',
  16:  'videos/dice/roll 16.webm',
  17:  'videos/dice/roll 17.webm',
  18:  'videos/dice/roll 18.webm',
  19:  'videos/dice/roll 19.webm',
  20:  'videos/dice/roll 20.webm',
};


const overlay = document.getElementById('video-overlay');
const video   = document.getElementById('dice-video');

// play an animation clip (result = roll number)
function playDiceAnimation(result) {
  const src = diceAnimations[result];
  if (!src) return;

  video.src = src;
  overlay.classList.add('active');
  video.play();
}

// hide on end or click
video.addEventListener('ended', () => overlay.classList.remove('active'));
overlay.addEventListener('click', () => {
  video.pause();
  overlay.classList.remove('active');
});

async function rollDice(sides) {
  // 1) show "Rolling..."
  addStory('Rolling…');
  const story = document.getElementById('story');
  const lastP = story.lastElementChild;
  
  // 2) determine the roll
  const result = Math.floor(Math.random() * sides) + 1;
  
  // 3) play the matching animation full-screen (skipped when auto-roll is on)
  const src = diceAnimations[result];
  if (src && !autoRoll) {
    video.src = src;
    video.muted = false;
    video.volume = 1.0;
    overlay.classList.add('active');

    // wait for the clip to end (or user to click away)
    await new Promise(resolve => {
      function cleanup() {
        overlay.classList.remove('active');
        video.removeEventListener('ended', onEnd);
        overlay.removeEventListener('click', onClick);
        resolve();
      }
      function onEnd()   { cleanup(); }
      function onClick() { video.pause(); cleanup(); }
      video.addEventListener('ended',  onEnd);
      overlay.addEventListener('click', onClick, { once: true });
      video.play();
    });
  }

  // 4) finally show the result
  lastP.textContent = `Rolled: ${result}`;
  return result;
}

// 4.6 · Fire Catalog Normalization & Helpers
(function normalizeBurnTimeCatalog(){
  for (const category of Object.values(Items)) {
    for (const item of Object.values(category)) {
      if (typeof item.burnTime !== 'number') item.burnTime = 0;
    }
  }
})();

function getBurnTime(name) {
  const d = findItemInDatabase?.(name);
  return Number(d?.burnTime) || 0; // 0 = non-burnable
}

function startFireWithWood(selectedWoodType) {
  const fireTimer       = document.getElementById('fire-status-wrap');
  const fireBar         = document.getElementById('fire-status-fill');
  const fireTimeEl      = document.getElementById('fire-status-time');
  const cookButton      = document.querySelector('[data-action="cook"]');
  const buildFireButton = document.querySelector('[data-action="fire"]');

  const starting = !player?.hasFire || (Number(fireTimeRemaining) <= 0) || (Number(initialFireTime) <= 0);

  const wood = (player.campSupplies || []).find(i => i && i.name === selectedWoodType && (i.quantity ?? 0) > 0);
  if (!wood) { addStory(`⛔ No ${selectedWoodType} in camp supplies.`); return; }

  const burnTime = getBurnTime(selectedWoodType);
  if (!burnTime) { restLog.textContent = `That won't burn properly.`; return; }

  // consume one
  wood.quantity = Math.max(0, (wood.quantity ?? 0) - 1);
  updateCampSuppliesGrid?.();

  if (starting) {
    initialFireTime   = burnTime;
    fireTimeRemaining = burnTime;
  } else {
    initialFireTime   += burnTime;
    fireTimeRemaining += burnTime;
  }

  if (starting) {
    restLog.textContent = 'The fire catches and begins to burn.';
    addStory(`🔥 Fire started with ${selectedWoodType}. (+${burnTime}s)`);
  } else {
    restLog.textContent = 'You add wood to the fire.';
    addStory(`➕ Added ${selectedWoodType}. (+${burnTime}s)`);
  }

  player.hasFire = true;
  updateComfortProtection?.();

  fireTimer.style.display = 'block';
  fireBar.style.width = '100%';

  if (buildFireButton) buildFireButton.disabled = true;
  if (cookButton)      cookButton.disabled      = false;

  clearInterval(fireTimerInterval);
  fireTimerInterval = setInterval(() => {
    if (fireTimeRemaining <= 0) {
      clearInterval(fireTimerInterval);
      addStory('🔥 Your fire has died out.');
      if (fireTimer) fireTimer.style.display = 'none';
      player.hasFire = false;
      updateComfortProtection?.();
      if (buildFireButton) buildFireButton.disabled = false;
      if (cookButton)      cookButton.disabled      = true;
      return;
    }
    fireTimeRemaining--;
    const percent = Math.max(0, Math.round((fireTimeRemaining / initialFireTime) * 100));
    if (fireBar) fireBar.style.width = `${percent}%`;
    if (fireTimeEl) fireTimeEl.textContent = `${fireTimeRemaining}s`;
  }, 1000);
}

			function updatePlayerSymbol(x, y) {
				const ps   = document.getElementById('player-symbol');
				const canv = document.getElementById('map-canvas');
				const cw   = canv && canv.width  > 0 ? canv.width  : MAP_AUTH_W;
				const ch   = canv && canv.height > 0 ? canv.height : MAP_AUTH_H;
				const scaleX = cw / MAP_AUTH_W;
				const scaleY = ch / MAP_AUTH_H;
				// Position at cell centre; CSS transform handles the symbol's own size
				ps.style.left      = `${(x + GRID_SIZE / 2) * scaleX}px`;
				ps.style.top       = `${(y + GRID_SIZE / 2) * scaleY}px`;
				ps.style.transform = 'translate(-50%, -50%)';
			}

// ============================================================
// SECTION 5 · UI HELPERS
// ============================================================

// 5.1 · Wait For Enter
function waitForEnter(text = 'Press Enter to continue…') {
  addStory(`<em class="enter-prompt">${text}</em>`);

  const wheelArea = document.getElementById('wheel-area');
  const continueBtn = document.getElementById('cutscene-continue');
  if (wheelArea) wheelArea.classList.add('cutscene-mode');

  return new Promise(resolve => {
    function finish() {
      document.removeEventListener('keydown', onKey);
      if (continueBtn) continueBtn.removeEventListener('click', finish);
      if (wheelArea) wheelArea.classList.remove('cutscene-mode');
      // addStory is async so we can't hold a ref — query the DOM instead
      const prompt = document.querySelector('#story em.enter-prompt');
      if (prompt) prompt.closest('p')?.remove();
      const storyEl = document.getElementById('story');
      if (storyEl && storyEl.children.length) {
        const divider = document.createElement('div');
        divider.className = 'story-divider';
        storyEl.appendChild(divider);
      }
      resolve();
    }
    function onKey(e) { if (e.key === 'Enter') finish(); }
    document.addEventListener('keydown', onKey);
    if (continueBtn) continueBtn.addEventListener('click', finish, { once: true });
  });
}

// 5.2 · Export Map Template
			function exportFullTemplate() {
				const template = {};
				// build blank template for every grid cell
				for (let x = 0; x <= mapCanvas.width - GRID_SIZE; x += GRID_SIZE) {
					for (let y = 0; y <= mapCanvas.height - GRID_SIZE; y += GRID_SIZE) {
						const key = `x${x}_y${y}`;
						template[key] = {
							coordinate: key,
							biome: '',
							kingdom: '',
							zone: '',
							cityVillage: '',
							description: '',
							establishments: [],
							pointsOfInterest: [],
							discovered: false
						};
					}
				}

				// overlay any existing data
				Object.entries(mapData).forEach(([k, v]) => {
					if (template[k]) template[k] = {
						...template[k],
						...v
					};
				});
				// download as JS module
				const blob = new Blob(
					[`window.mapData = ${JSON.stringify(template, null, 2)};`], {
						type: "text/javascript"
					}
				);
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "mapData.js";
				a.click();
				URL.revokeObjectURL(url);
			}

			document
				.getElementById('export-map-data')
				.addEventListener('click', exportFullTemplate);

const toggleBiomesBtn = document.getElementById('toggle-biomes-button');
			toggleBiomesBtn.addEventListener('click', () => {
				biomesVisible = !biomesVisible;
				toggleBiomesBtn.textContent = biomesVisible ? 'Hide Biomes' : 'Show Biomes';
				setupMap(); // re‑draw with/without biomes
			});

			function calculateTravel(from, to) {
				const px = Math.hypot(to.x - from.x, to.y - from.y);
				return { gridSquares: Math.max(1, Math.round(px / GRID_SIZE)) };
			}

// 5.3 · Cell UI & Player Symbol
			function clearCellUI() {
				selectedCellKey = null;
				travelInfo.textContent = '';
				const bar = document.getElementById('cell-actions');
				if (bar) bar.remove();
				setupMap(); // redraw without highlight
			}

function renderWaypointBar() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;
  let bar = document.getElementById('waypoint-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'waypoint-bar';
    mapContainer.appendChild(bar);
  }

  if (!player.waypoint) {
    bar.innerHTML = '';
    bar.style.display = 'none';
    return;
  }

  const destCell  = (typeof mapData !== 'undefined' && mapData[player.waypoint]) || {};
  const knownDest = (player.knownLocations || {})[player.waypoint];
  const destName  = knownDest?.nameKnown && destCell.cityVillage
    ? destCell.cityVillage
    : (destCell.biome ? `${destCell.biome} region` : player.waypoint);

  const fromMatch = player.currentLocation.match(/^x(\d+)_y(\d+)$/);
  const toMatch   = player.waypoint.match(/^x(\d+)_y(\d+)$/);

  let gridSquares = 0, staminaCost = 0, toX = 0, toY = 0;
  if (fromMatch && toMatch) {
    const fromX = +fromMatch[1] + GRID_SIZE / 2;
    const fromY = +fromMatch[2] + GRID_SIZE / 2;
    toX = +toMatch[1] + GRID_SIZE / 2;
    toY = +toMatch[2] + GRID_SIZE / 2;
    const pixelDist  = Math.hypot(toX - fromX, toY - fromY);
    gridSquares      = Math.max(1, Math.round(pixelDist / GRID_SIZE));
    const weightRatio = calculateTotalWeight() / Math.max(1, player.maxCarryWeight);
    staminaCost      = gridSquares * 3 + Math.round(weightRatio * gridSquares);
  }

  const infoText = gridSquares ? ` · ${gridSquares} sq · ${staminaCost} stamina` : '';
  bar.style.display = '';
  bar.innerHTML = `<span class="wp-label">📌 ${destName}${infoText}</span>
    <button id="waypoint-go-btn">GO</button>
    <button id="waypoint-clear-btn">✕</button>`;

  document.getElementById('waypoint-go-btn').onclick = () => {
    if (!fromMatch || !toMatch) return;
    if (staminaCost > player.maxStamina) {
      addStory('⛔ That distance is too far to travel in a single journey.');
      return;
    }
    if (player.stamina < staminaCost) {
      addStory('⚠️ You are too exhausted for that journey. Rest and recover first.');
      return;
    }
    const destKnown = !!(player.knownLocations?.[player.waypoint]?.nameKnown);
    const destLabel = destKnown ? (destCell.cityVillage || 'this location') : 'this location';
    confirmText.textContent = `Travel to ${destLabel}? (~${gridSquares}h · ${staminaCost} stamina)`;
    confirmModal.style.display = 'block';
    confirmYesBtn.onclick = async () => {
      confirmModal.style.display = 'none';
      window.__contentPanel.open('pane-story');
      await executeTravelTo(player.waypoint, toX, toY, gridSquares, staminaCost);
    };
    confirmNoBtn.onclick = () => { confirmModal.style.display = 'none'; };
  };

  document.getElementById('waypoint-clear-btn').onclick = () => {
    delete player.waypoint;
    renderWaypointBar();
    setupMap();
  };
}

// ============================================================
// SECTION 6 · STATS & INVENTORY
// ============================================================

// 6.1 · Update Top Stats (consolidated)
function updateTopStats() {
  const dayEl = document.getElementById('turn-number');
  if (dayEl) dayEl.textContent = `Day ${player.day || 1}`;
  document.getElementById('time-of-day').textContent = (player.timeOfDay || '').replace(/^[^a-zA-Z]+/, '');
  const _displayWeather = (player.weather === 'Sunny' && isLateTime?.()) ? 'Clear' : player.weather;
  document.getElementById('weather').textContent = _displayWeather;

  // Location: show settlement name only if the player knows it, otherwise show biome
  const cell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const knownLoc     = (player.knownLocations || {})[player.currentLocation];
  const locDisplay   = knownLoc?.nameKnown && cell.cityVillage
    ? cell.cityVillage
    : (cell.biome || 'Wilderness');
  document.getElementById('current-location').textContent = locDisplay;

  // Kingdom: show name + banner only if the player has that kingdom's map
  const knownKingdom = (player.knownKingdoms || {})[cell.kingdom];
  let kingdomHTML;
  if (knownKingdom && cell.kingdom) {
    const safe = cell.kingdom.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    kingdomHTML = `<img src="images/banners/${safe}.png" alt="${cell.kingdom}" class="stat-banner" /> ${cell.kingdom}`;
  } else if (cell.discovered) {
    kingdomHTML = 'Uncharted Territory';
  } else {
    kingdomHTML = 'Uncharted Territory';
  }
  document.getElementById('current-kingdom').innerHTML = kingdomHTML;

  const _actEl = document.getElementById('current-action-display') || document.getElementById('current-action');
  if (_actEl) _actEl.textContent = player.currentAction;
  const _goldCap = player.inventory?.['Coin Pouch (Large)'] ? Infinity : 200;
  if (player.gold > _goldCap) player.gold = _goldCap;
  document.getElementById('player-gold').textContent = player.gold;
  document.getElementById('player-name').textContent = player.name;
  document.getElementById('player-level').textContent = `Level: ${player.level}`;
  const _lvlPip = document.getElementById('player-level-num');
  if (_lvlPip) _lvlPip.textContent = player.level;

  // EXP bar (hidden legacy element — ring is the live display)
  const xpThreshold = player.level * 100;
  const pct = ((player.experience || 0) / xpThreshold) * 100;
  document.getElementById('exp-bar').style.width = `${pct}%`;
  document.getElementById('exp-text').textContent = `EXP: ${player.experience || 0}/${xpThreshold}`;
  updateXpRing();
  updateTimeDial();

  // Life bar + status label
  const lifePct = Math.min(100, Math.round((player.life / player.maxLife) * 100));
  const lifeBar = document.getElementById('life-bar');
  if (lifeBar) lifeBar.style.width = lifePct + '%';
  const lifeStatus = document.getElementById('life-status');
  if (lifeStatus) lifeStatus.textContent = statusText(lifePct, [
    [100, 'Healthy'], [75, 'Battered'], [50, 'Wounded'], [25, 'Severely Wounded'], [0, 'Dying']
  ]);

  // Stamina bar + status label
  const stamPct = Math.min(100, Math.round((player.stamina / player.maxStamina) * 100));
  const stamBar = document.getElementById('stamina-bar');
  if (stamBar) stamBar.style.width = stamPct + '%';
  const stamStatus = document.getElementById('stamina-status');
  if (stamStatus) stamStatus.textContent = statusText(stamPct, [
    [100, 'Fully Rested'], [75, 'Well Rested'], [50, 'Winded'], [25, 'Weary'], [0, 'Exhausted']
  ]);

  // Mana bar
  const manaPct = player.maxMana ? Math.min(100, Math.round(((player.mana || 0) / player.maxMana) * 100)) : 0;
  const manaBar = document.getElementById('mana-bar');
  if (manaBar) manaBar.style.width = manaPct + '%';
  const manaStatus = document.getElementById('mana-status');
  if (manaStatus) manaStatus.textContent = statusText(manaPct, [
    [100, 'Full'], [75, 'Ample'], [50, 'Half'], [25, 'Low'], [0, 'Empty']
  ]);

  _renderPartyHud?.();
  if (typeof updateCampStatusBar === 'function') updateCampStatusBar();
  if (typeof updateTownStatusBar === 'function') updateTownStatusBar();

  // Night vignette on body background
  const _tod = player.timeOfDay || '';
  const _isFullNight = /Night|Late Night/i.test(_tod);
  const _isEvening   = /Evening|Mid-Evening/i.test(_tod);
  const _isDusk      = /Dusk|Late Afternoon/i.test(_tod);
  document.body.classList.toggle('night-mode',   _isFullNight);
  document.body.classList.toggle('evening-mode', !_isFullNight && _isEvening);
  document.body.classList.toggle('dusk-mode',    !_isFullNight && !_isEvening && _isDusk);
}

function updateXpRing() {
  const arc = document.getElementById('xp-arc');
  if (!arc) return;
  const threshold    = player.level * 100;
  const pct          = Math.min(1, (player.experience || 0) / threshold);
  const circumference = 326.73;
  arc.style.strokeDashoffset = circumference * (1 - pct);
}

function updateTimeDial() {
  const dot = document.getElementById('time-indicator-dot');
  if (!dot) return;
  // 12 periods: 6 day (left arc, clockwise upward) then 6 night (right arc, clockwise downward)
  // Early Morning anchored at 210° (7 o'clock), each period +30° clockwise
  const _periods = [
    '🌅 Early Morning','🌄 Mid-Morning','☀️ Morning','🌞 Midday','🌤️ Afternoon','⛅ Mid-Afternoon',
    '🌇 Late Afternoon','🌆 Evening','🌃 Mid-Evening','🌙 Dusk','🌑 Night','⭐ Late Night',
  ];
  const idx = _periods.indexOf(player.timeOfDay);
  const angleDeg = ((idx < 0 ? 0 : idx) * 30 + 210) % 360;
  const rad = angleDeg * Math.PI / 180;
  // SVG viewBox 0 0 110 110 — indicator travels along the outer gold border at R=57 from center (55,55)
  const cx = 55 + 57 * Math.sin(rad);
  const cy = 55 - 57 * Math.cos(rad);
  dot.setAttribute('cx', cx.toFixed(1));
  dot.setAttribute('cy', cy.toFixed(1));
  // Gold dot for day periods (indices 0–5), silver-blue for night (indices 6–11)
  const isDay = idx >= 0 && idx <= 5;
  dot.setAttribute('fill', isDay ? '#f5e060' : '#c8d8ff');
  dot.setAttribute('stroke', isDay ? '#8a6200' : '#4468bb');
}

// 6.2 · Journal
function updateJournal() {
  // Known Locations — only show locations the player knows by name
  // (populated by learnLocationName when entering a city, from an NPC, or via a map item)
  const namedLocs = player.journal.locations || [];
  setHTML('locations', namedLocs.length
    ? namedLocs.map(l => {
        const knownKingdom = (player.knownKingdoms || {})[l.kingdom];
        const meta = [knownKingdom ? l.kingdom : null, l.biome].filter(Boolean).join(', ');
        const estabs = (player.discoveredEstablishments || {})[l.coord] || [];
        const estabHtml = estabs.length
          ? `<ul class="journal-estab-list">${estabs.map(e => `<li>📍 ${e}</li>`).join('')}</ul>`
          : '';
        return `<li class="journal-entry">
          <span class="journal-entry-name">${l.name}</span>
          ${meta ? `<span class="journal-entry-meta">${meta}</span>` : ''}
          ${l.description ? `<span class="journal-entry-desc">${l.description}</span>` : ''}
          ${estabHtml}
        </li>`;
      }).join('')
    : '<li class="journal-empty">No named locations discovered yet.</li>'
  );

  // Relations / NPCs — cross-referenced with world registry
  const npcs       = player.journal.npcs || [];
  const partyNames = new Set((player.party || []).map(m => m.name));

  // Kingdom Standing section — only show kingdoms the player has explicitly learned
  const _knownKingdomMap = player.knownKingdoms || {};
  const _visitedKingdoms = [...new Set([
    ...(player.worldState?.kingdomsVisited || []),
    ...(player.currentKingdom ? [player.currentKingdom] : []),
    ...Object.keys(player.kingdomReputation || {}),
  ])].filter(k => _knownKingdomMap[k]).sort();

  const kingdomStandingHtml = _visitedKingdoms.length
    ? `<li class="journal-section-header">Kingdom Standing</li>` +
      _visitedKingdoms.map(k => {
        const score = getKingdomRepScore(k);
        const tier  = getKingdomRepTier(k);
        const pct   = Math.round(((score + 100) / 200) * 100);
        const isCurrent = k === player.currentKingdom;
        return `<li class="journal-entry rep-entry ${tier.cls}">
          <span class="journal-entry-name">${isCurrent ? '📍 ' : ''}${k}</span>
          <span class="journal-entry-meta">${tier.icon} ${tier.label}</span>
          <span class="rep-bar-wrap"><span class="rep-bar-fill" style="width:${pct}%"></span></span>
        </li>`;
      }).join('')
    : '';

  // Party summary at top of relations tab
  const partySummary = (player.party || []).length
    ? `<li class="journal-entry party-summary-entry">
        <span class="journal-entry-name">⚔️ Active Party</span>
        <span class="journal-entry-desc">${(player.party || []).map(m => `${m.name} (${m.profession}${m.contractType === 'mercenary' ? ', hired' : ', friend'})`).join(' · ')}</span>
      </li>`
    : '';

  const npcSectionHeader = npcs.length ? `<li class="journal-section-header">Known People</li>` : '';
  const npcHtml = npcs.map(n => {
    const rec     = getWorldNPCByName(n.name);
    const relVal  = rec?.relationship ?? 0;
    const rel     = rec ? _getRelLabel(relVal) : (n.relationToPlayer || '');
    const imp     = rec ? IMPORTANCE_LABELS[rec.importance] || '' : '';
    const inParty = partyNames.has(n.name);
    const status  = inParty ? 'in party' : (rec?.status && rec.status !== 'active' ? rec.status : '');
    const meta    = [rel, imp, status].filter(Boolean).join(' · ');
    const relClass = relVal >= 3 ? 'rel-ally' : relVal >= 1 ? 'rel-friendly' : relVal <= -3 ? 'rel-hostile' : relVal <= -1 ? 'rel-wary' : '';
    return `<li class="journal-entry ${relClass}">
      <span class="journal-entry-name">${inParty ? '⚔️ ' : ''}${n.name}</span>
      ${meta ? `<span class="journal-entry-meta">${meta}</span>` : ''}
      ${n.description ? `<span class="journal-entry-desc">${n.description}</span>` : ''}
    </li>`;
  }).join('');

  const hasRelations = npcs.length || partySummary || _visitedKingdoms.length;
  setHTML('relations', hasRelations
    ? kingdomStandingHtml + (npcs.length || partySummary
        ? npcSectionHeader + partySummary + npcHtml
        : '') + getDevKingdomStatsHtml()
    : '<li class="journal-empty">No known relations yet.</li>' + getDevKingdomStatsHtml()
  );

  // Quest Log
  const playerQuests = player.journal.quests || [];
  const leftQuest    = document.getElementById('current-quest');
  const activeQuest  = playerQuests.find(q => q.status === 'Active');
  if (leftQuest) {
    if (activeQuest) {
      const aqDef = typeof getQuestDef === 'function' ? getQuestDef(activeQuest.id) : null;
      const aqObj = aqDef?.objectives?.[activeQuest.objectiveIndex];
      leftQuest.innerHTML = `<li><strong>${activeQuest.title || activeQuest.name}</strong></li><li>${aqObj?.text || '—'}</li>`;
    } else {
      leftQuest.innerHTML = '<li>No active quest</li><li>—</li>';
    }
  }
  setHTML('quests', playerQuests.length
    ? playerQuests.map(q => {
        const status  = q.status || 'Active';
        const icon    = status === 'Completed' ? '✅' : status === 'Failed' ? '❌' : '📜';
        const def     = typeof getQuestDef === 'function' ? getQuestDef(q.id) : null;
        const desc    = def?.description || '';
        const objs    = def?.objectives || [];
        const curIdx  = q.objectiveIndex ?? 0;
        const objsHtml = objs.map((o, i) => {
          const done    = status === 'Completed' || i < curIdx;
          const current = status === 'Active' && i === curIdx;
          const oText   = o.description || o.text || `Objective ${i + 1}`;
          return `<li class="quest-obj${done ? ' quest-obj-done' : ''}${current ? ' quest-obj-current' : ''}">
            <span class="quest-obj-check">${done ? '&#x2713;' : current ? '&#x2192;' : '&#x25cb;'}</span>
            <span>${oText}</span>
          </li>`;
        }).join('');
        const objsBlock = objs.length ? `<ul class="quest-objectives">${objsHtml}</ul>` : '';
        const isTracked = player.trackedQuest === q.id;
        const trackBtn = status === 'Active'
          ? `<button class="quest-track-btn${isTracked ? ' tracked' : ''}" onclick="trackQuest('${q.id}')">${isTracked ? '📌 Tracking' : '📍 Track'}</button>`
          : '';
        return `<li class="journal-entry quest-entry">
          <div class="quest-header">
            <span class="journal-entry-name">${icon} ${q.title || q.name}</span>
            <span class="journal-entry-meta">${status}</span>
            ${trackBtn}
          </div>
          ${desc ? `<p class="quest-desc">${desc}</p>` : ''}
          ${objsBlock}
        </li>`;
      }).join('')
    : '<li class="journal-empty">No quests recorded yet.</li>'
  );

  // Skills tab — XP progress bars
  const skillEntries = Object.entries(player.skills || {});
  setHTML('journal-skills', skillEntries.length
    ? skillEntries.map(([s, d]) => {
        const xp        = d.xp || 0;
        const threshold = (d.level || 1) * 5;
        const pct       = Math.min(100, Math.round((xp / threshold) * 100));
        const icon      = (typeof SKILL_ICONS !== 'undefined' && SKILL_ICONS[s]) || '🔹';
        const skillDesc = (typeof gameSkills !== 'undefined' && gameSkills[s]?.description) || '';
        return `<li class="skill-journal-entry">
          <div class="skill-entry-header">
            <span class="skill-entry-name">${icon} ${s}</span>
            <span class="skill-entry-lv">Lv ${d.level}</span>
          </div>
          ${skillDesc ? `<p class="skill-entry-desc">${skillDesc}</p>` : ''}
          <div class="skill-xp-bar-wrap" title="${xp} / ${threshold} XP to next level">
            <div class="skill-xp-bar-fill" style="width:${pct}%"></div>
            <span class="skill-xp-label">${xp} / ${threshold} XP</span>
          </div>
        </li>`;
      }).join('')
    : '<li class="journal-empty">No skills yet.</li>'
  );

  // Traits tab — name + description + bonus (sourced from playerAttributes.js gameTraits)
  const traitArr = Array.isArray(player.traits) ? player.traits : Object.keys(player.traits || {});
  setHTML('journal-traits', traitArr.length
    ? traitArr.map(t => {
        const def = (typeof gameTraits !== 'undefined' && gameTraits[t]) || {};
        return `<li class="trait-journal-entry">
          <span class="trait-entry-name">${t}</span>
          ${def.description  ? `<span class="trait-entry-desc">${def.description}</span>`      : ''}
          ${def.displayBonus ? `<span class="trait-entry-bonus">${def.displayBonus}</span>`    : ''}
          ${def.opposite     ? `<span class="trait-entry-opposite">Opposite: ${def.opposite}</span>` : ''}
        </li>`;
      }).join('')
    : '<li class="journal-empty">No traits yet.</li>'
  );

  // Recipes tab — all known recipes grouped by category
  const knownR = player.knownRecipes || [];
  const CAT_ICONS = { Crafting: '🔨', Cooking: '🍳', Alchemy: '⚗️' };
  let recipesHTML = '';
  if (typeof Recipes !== 'undefined') {
    for (const [cat, list] of Object.entries(Recipes)) {
      const catKnown = list.filter(r => knownR.includes(r.name));
      if (!catKnown.length) continue;
      const icon = CAT_ICONS[cat] || '📖';
      recipesHTML += `<div class="recipe-category">${icon} ${cat} <span class="recipe-count">${catKnown.length}</span></div>`;
      recipesHTML += catKnown.map(r => {
        const reqs    = r.requires.map(req =>
          req.tool ? `${req.item} (tool)` : `${req.qty}× ${req.item}`
        ).join(', ');
        const canMake = typeof canCraft === 'function' && canCraft(r, player.inventory);
        return `<div class="recipe-entry${canMake ? ' recipe-craftable' : ''}">
          <div class="recipe-name">${r.name}${r.skill ? `<span class="recipe-skill">${r.skill}</span>` : ''}</div>
          <div class="recipe-line"><span class="recipe-lbl">Needs</span> ${reqs}</div>
          <div class="recipe-line"><span class="recipe-lbl">Makes</span> ${r.produces.qty}× ${r.produces.item}</div>
        </div>`;
      }).join('');
    }
  }
  setHTML('recipe-list', recipesHTML || '<p class="journal-empty">No recipes learned yet.</p>');

  // World Events — grouped by category
  const WE_LABELS = {
    player:      '⚔️ Player Activity',
    quest:       '📜 Quests',
    exploration: '🗺️ Exploration',
    combat:      '🗡️ Combat',
    npc:         '🧑 NPC Activity',
    lore:        '📖 Lore & Knowledge',
    kingdom:     '🏰 Kingdom Activity',
  };
  const WE_ORDER = ['player', 'quest', 'exploration', 'combat', 'npc', 'lore', 'kingdom'];
  const rawEvents = player.worldEvents || [];
  if (!rawEvents.length) {
    setHTML('world-events-list', '<li class="journal-empty">No notable events recorded yet.</li>');
  } else {
    const evs = rawEvents.map(e => typeof e === 'string' ? { text: e, category: 'player', timestamp: '' } : e);
    const grouped = {};
    for (const ev of evs) {
      const cat = ev.category || 'player';
      (grouped[cat] = grouped[cat] || []).push(ev);
    }
    let weHtml = '';
    for (const cat of WE_ORDER) {
      if (!grouped[cat]?.length) continue;
      weHtml += `<li class="we-category-header">${WE_LABELS[cat] || cat}</li>`;
      for (const ev of grouped[cat]) {
        const ts = ev.timestamp ? `<span class="we-ts">${ev.timestamp}</span> ` : '';
        weHtml += `<li class="journal-entry world-event-entry">${ts}${ev.text}</li>`;
      }
    }
    setHTML('world-events-list', weHtml);
  }

  // Lore tab — group discovered entries by category
  const learnedLore = player.learnedLore || [];
  if (!learnedLore.length) {
    setHTML('lore-list', '<p class="journal-empty">No lore discovered yet. Speak to sages, visit libraries, and listen to bards.</p>');
  } else {
    const entriesById = {};
    if (typeof LORE_ENTRIES !== 'undefined') LORE_ENTRIES.forEach(e => { entriesById[e.id] = e; });
    const CAT_ICONS = {
      History: '⚔️', Kingdoms: '🏰', Magic: '✨', Creatures: '🐉',
      Legends: '⭐', Religion: '🕯️', Geography: '🗺️', People: '👤',
      'The Arúvari': '🩸',
    };
    const grouped = {};
    for (const learned of learnedLore) {
      const entry = entriesById[learned.id];
      if (!entry) continue;
      if (!grouped[entry.category]) grouped[entry.category] = [];
      grouped[entry.category].push({ entry, learned });
    }
    const categories = typeof LORE_CATEGORIES !== 'undefined' ? LORE_CATEGORIES : Object.keys(grouped);
    let html = '';
    for (const cat of categories) {
      const items = grouped[cat];
      if (!items?.length) continue;
      const icon = CAT_ICONS[cat] || '📜';
      html += `<div class="lore-category">${icon} ${cat} <span class="lore-count">${items.length}</span></div>`;
      html += items.map(({ entry, learned }) =>
        `<div class="lore-entry">
          <div class="lore-entry-title">${entry.title}</div>
          <div class="lore-entry-text">${entry.text}</div>
          <div class="lore-entry-meta">${learned.learnedAt} · via ${learned.source || 'unknown'}</div>
        </div>`
      ).join('');
    }
    setHTML('lore-list', html || '<p class="journal-empty">No lore discovered yet.</p>');
  }
}

function addWorldEvent(text, category = 'player') {
  if (!player.worldEvents) player.worldEvents = [];
  const _evCell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const _evLoc  = _evCell.cityVillage || _evCell.biome || null;
  const loc = _evLoc ? ` at ${_evLoc}` : '';
  player.worldEvents.push({ text, category, timestamp: `[${player.timeOfDay || ''}${loc}]` });
}

// ── Global Event Engine ─────────────────────────────────────

function _wsInit() {
  if (!player.worldState) player.worldState = {};
  const ws = player.worldState;
  if (!ws.firedEvents)     ws.firedEvents     = [];
  if (!ws.defeatedEnemies) ws.defeatedEnemies  = 0;
  if (!ws.kingdomsVisited) ws.kingdomsVisited  = [];
  if (!ws.travelCount)     ws.travelCount      = 0;
  return ws;
}

function fireGlobalEvent(def) {
  const ws = _wsInit();
  if (def.once && ws.firedEvents.includes(def.id)) return;
  if (def.once) ws.firedEvents.push(def.id);
  addStory(
    `<div class="world-event-announce">` +
    `<span class="wea-label">📰 World Event</span>` +
    `<strong class="wea-title">${def.title}</strong>` +
    `<p class="wea-body">${def.narrative}</p>` +
    `</div>`
  );
  addWorldEvent(def.title, def.category || 'kingdom');
  for (const fx of (def.effects || [])) {
    if (fx.type === 'setFlag') {
      if (!player.flags) player.flags = {};
      player.flags[fx.key] = fx.value;
    }
    if (fx.type === 'morality' && fx.value) changeMorality(fx.value);
  }
  updateJournal?.();
}

function checkGlobalEventTriggers() {
  if (typeof GLOBAL_EVENTS === 'undefined') return;
  const ws = _wsInit();
  const discovered = Object.keys(player.journal?.discoveredLocations || {}).length;
  for (const def of GLOBAL_EVENTS) {
    if (def.once && ws.firedEvents.includes(def.id)) continue;
    const t = def.trigger;
    let fire = false;
    switch (t.type) {
      case 'level':               fire = player.level >= t.minLevel; break;
      case 'combatCount':         fire = ws.defeatedEnemies >= t.count; break;
      case 'locationsDiscovered': fire = discovered >= t.count; break;
      case 'kingdomsVisited':     fire = ws.kingdomsVisited.length >= t.count; break;
      case 'travelCount':         fire = ws.travelCount >= t.count; break;
      case 'flag':                fire = !!player.flags?.[t.flag]; break;
      case 'loreCategory': {
        const _catEntries = (typeof LORE_ENTRIES !== 'undefined' ? LORE_ENTRIES : []).filter(e => e.category === t.category).map(e => e.id);
        const _known = new Set((player.learnedLore || []).map(e => e.id));
        fire = _catEntries.filter(id => _known.has(id)).length >= t.count;
        break;
      }
      case 'questComplete': {
        const q = player.journal?.quests?.find(q => q.id === t.questId && q.status === 'Completed');
        fire = !!q && (!t.choiceFlag || !!player.flags?.[t.choiceFlag]);
        break;
      }
    }
    if (fire) fireGlobalEvent(def);
  }
}

// 6.3 · Lore System

function learnLore(id, source) {
  if (typeof LORE_ENTRIES === 'undefined') return false;
  if (!player.learnedLore) player.learnedLore = [];
  if (player.learnedLore.some(e => e.id === id)) return false;
  const entry = LORE_ENTRIES.find(e => e.id === id);
  if (!entry) return false;
  player.learnedLore.push({ id, source, learnedAt: `Day ${player.day || 1}, ${player.timeOfDay || ''}` });
  addStory(`📜 <em>Lore discovered: <strong>${entry.title}</strong></em>`);
  addWorldEvent(`Learned lore: ${entry.title}`, 'lore');
  updateJournal();
  checkGlobalEventTriggers();
  return true;
}

function learnRandomLore(source, filter = {}) {
  if (typeof LORE_ENTRIES === 'undefined') return false;
  if (!player.learnedLore) player.learnedLore = [];
  const known = new Set(player.learnedLore.map(e => e.id));
  let pool = LORE_ENTRIES.filter(e => !known.has(e.id));
  if (!pool.length) return false;
  // Narrow by source then kingdom, falling back if the filtered pool would be empty
  if (filter.source) {
    const sf = pool.filter(e => e.source === filter.source || e.source === 'any');
    if (sf.length) pool = sf;
  }
  if (filter.kingdom) {
    const kf = pool.filter(e => !e.kingdoms?.length || e.kingdoms.includes(filter.kingdom));
    if (kf.length) pool = kf;
  }
  const entry = pool[Math.floor(Math.random() * pool.length)];
  return learnLore(entry.id, source);
}

window.updateJournalTab = function() {
  updateJournal();
  updatePlayerProfile();
};

// ============================================================
// SECTION 6.5 · SKILL SYSTEM
// ============================================================

// XP granted per tier (index = tier 1-5)
const SKILL_XP_TABLE = [0, 1, 2, 3, 4, 6];

// Flat bonus to d20 roll: level 1 = +0, level 2 = +1 … capped at +5
function getSkillBonus(skillName) {
  const skill = player.skills[skillName];
  if (!skill) return 0;
  return Math.min(5, Math.max(0, (skill.level || 1) - 1));
}

// Award XP to a skill; level it up when threshold (level × 5) is reached.
// Auto-creates the skill entry if the player earned it organically.
function gainSkillXp(skillName, tier) {
  const _isNewSkill = !player.skills[skillName];
  if (_isNewSkill) {
    player.skills[skillName] = { level: 1, xp: 0, usageCount: 0 };
  }
  const sk = player.skills[skillName];
  if (sk.xp === undefined) sk.xp = 0;
  sk.xp += (SKILL_XP_TABLE[tier] || 1);
  sk.usageCount = (sk.usageCount || 0) + 1;
  const threshold = (sk.level || 1) * 5;
  if (sk.xp >= threshold) {
    sk.xp -= threshold;
    const prevLevel = sk.level || 1;
    sk.level = prevLevel + 1;
    if (sk.level === 99) queueMasterGuildEncounters(skillName);
    addStory(`⭐ ${skillName} reached Level ${sk.level}!`);
    addWorldEvent(`${skillName} increased to Level ${sk.level}.`, 'player');
    gainExperience(5, true); // skill level-up feeds player XP silently
    // Award skill-tier title when crossing a tier boundary
    if (typeof SKILL_TIERS !== 'undefined') {
      const prevTier = getSkillTierForLevel(prevLevel);
      const newTier  = getSkillTierForLevel(sk.level);
      if (newTier && prevTier && newTier.tier !== prevTier.tier && newTier.tier !== 'Novice') {
        const noun    = (typeof SKILL_TITLE_NOUNS !== 'undefined' && SKILL_TITLE_NOUNS[skillName]) || skillName;
        const titleId = `skill__${skillName}__${newTier.tier}`.toLowerCase().replace(/\s+/g, '_');
        const titleName = `The ${newTier.tier} ${noun}`;
        awardTitle({
          id:          titleId,
          name:        titleName,
          description: `Awarded for reaching ${newTier.tier} level in ${skillName}.`,
          bonus:       { rollBonus: 0, skillMods: { [skillName]: newTier.skillBonus } },
        });
      }
    }
    updateSkillsGrid();
    updateJournal();
  }
  if (_isNewSkill) window.__onFirstSkill?.(skillName);
  checkQuestObjectives?.('skill', { skill: skillName });
  checkTraitUnlocks?.();
}

// Skill-modified d20 roll → tier 1-5. Shows roll in story. Awards skill XP.
const CAMP_BONUS_SKILLS = new Set([
  'Survival', 'Foraging', 'Hunting', 'Crafting', 'Medicine',
  'Cooking', 'Stealth', 'Navigation',
]);

// Item wear system — numeric 0-100 %, condition tier derived from %
const WEAPON_SKILL_SET = new Set(['Swordsmanship','Archery','Brawling','Axes','Spears','Polearms','Throwing']);
// Legacy condition string → wear % (for saves predating the wear system)
const LEGACY_CONDITION_WEAR = { Excellent: 87, Good: 62, Fair: 37, Worn: 12 };

function getConditionFromWear(wear) {
  const w = wear ?? 100;
  if (w >= 75) return 'Excellent';
  if (w >= 50) return 'Good';
  if (w >= 25) return 'Fair';
  if (w >  0)  return 'Worn';
  return 'Broken';
}

// Returns the canonical wear % for an item, migrating legacy string values on first access.
function getItemWear(itemName) {
  const item = player.inventory?.[itemName];
  if (!item) return 100;
  if (typeof item.wear === 'number') return item.wear;
  const mapped = LEGACY_CONDITION_WEAR[item.condition];
  if (mapped !== undefined) {
    item.wear = mapped;
    delete item.condition;
    return item.wear;
  }
  return 100;
}

// Degrades an item's wear by `amount` points (1-100 scale). Notifies player on tier change.
function degradeItemWear(itemName, amount) {
  const item = player.inventory?.[itemName];
  if (!item) return;
  if (typeof item.wear !== 'number') {
    item.wear = LEGACY_CONDITION_WEAR[item.condition] ?? 100;
    delete item.condition;
  }
  const prevCond = getConditionFromWear(item.wear);
  item.wear = Math.max(0, item.wear - amount);
  const newCond = getConditionFromWear(item.wear);
  if (newCond !== prevCond) {
    addStory(`⚙️ Your ${itemName} has degraded to ${newCond} (${item.wear}%).${newCond === 'Broken' ? ' It needs repair.' : ''}`);
  }
}

function performSkillCheck(skillName, situationalMod = 0) {
  const base       = !player.flags?.tutorialComplete ? 19 : Math.floor(Math.random() * 20) + 1;
  if (window.d20ShowNumber) window.d20ShowNumber(base);
  const skillMod   = getSkillBonus(skillName);
  const condMod    = getConditionModifier(skillName);
  const titleMod   = getTitleBonus(skillName);
  const equipMod   = getEquipmentConditionModifier(skillName);
  const atCamp     = player.campLocation && player.campLocation === player.currentLocation;
  const campMod    = (atCamp && CAMP_BONUS_SKILLS.has(skillName)) ? 2 : 0;
  const _hopeLvl   = getHopeTier(player.hope ?? 0).level;
  const hopeMod    = _hopeLvl >= 4 ? 2 : _hopeLvl >= 3 ? 1 : _hopeLvl <= -4 ? -1 : 0;
  const pendantMod = (player.equipped?.pendant === "Aelindra's Pendant") ? 1 : 0;
  const adjusted   = Math.min(20, Math.max(1, base + skillMod + condMod + titleMod + campMod + equipMod + situationalMod + hopeMod + pendantMod));
  const lvl        = player.skills[skillName]?.level;
  const parts      = [];
  const skillLabel = lvl ? `${skillName} Lv${lvl}` : skillName;
  parts.push(skillMod !== 0 ? `${skillMod > 0 ? '+' : ''}${skillMod} (${skillLabel})` : `(${skillLabel})`);
  if (condMod        !== 0) parts.push(`${condMod        > 0 ? '+' : ''}${condMod} (effects)`);
  if (titleMod       !== 0) parts.push(`${titleMod       > 0 ? '+' : ''}${titleMod} (title)`);
  if (campMod        !== 0) parts.push(`+${campMod} (camp)`);
  if (equipMod       !== 0) parts.push(`${equipMod       > 0 ? '+' : ''}${equipMod} (gear)`);
  if (situationalMod !== 0) parts.push(`${situationalMod > 0 ? '+' : ''}${situationalMod} (weather)`);
  if (hopeMod        !== 0) parts.push(`${hopeMod        > 0 ? '+' : ''}${hopeMod} (spirit)`);
  const tier = adjusted <= 5 ? 1 : adjusted <= 10 ? 2 : adjusted <= 14 ? 3 : adjusted <= 18 ? 4 : 5;
  const ol   = outcomeLabel(tier);
  const suffix = parts.length ? ` ${parts.join(' ')} = ${adjusted}` : '';
  addStory(`🎲 Rolled ${base}${suffix} — <span class="outcome-tag ${ol.css}">${ol.text}</span>`);
  gainSkillXp(skillName, tier);
  const _hopeShift = tier === 1 ? -2 : tier === 2 ? -1 : tier === 4 ? 1 : tier === 5 ? 2 : 0;
  if (_hopeShift !== 0) changeHope(_hopeShift);
  return tier;
}

// ============================================================
// SECTION 6.55 · TITLES SYSTEM
// ============================================================

// Returns the SKILL_TIERS entry that applies for a given skill level.
function getSkillTierForLevel(level) {
  if (typeof SKILL_TIERS === 'undefined') return null;
  let result = SKILL_TIERS[0];
  for (const t of SKILL_TIERS) {
    if (level >= t.minLevel) result = t;
    else break;
  }
  return result;
}

// Returns the skill-tier-based title ID for a skill name at a given level (or null if Novice).
function _skillTierTitleId(skillName, level) {
  const tier = getSkillTierForLevel(level);
  if (!tier || tier.tier === 'Novice') return null;
  const noun = (typeof SKILL_TITLE_NOUNS !== 'undefined' && SKILL_TITLE_NOUNS[skillName]) || skillName;
  return `skill__${skillName}__${tier.tier}`.toLowerCase().replace(/\s+/g, '_');
}

// Builds a display title for a skill-tier combination.
function _skillTierTitleName(skillName, tierName, noun) {
  const n = noun || (typeof SKILL_TITLE_NOUNS !== 'undefined' && SKILL_TITLE_NOUNS[skillName]) || skillName;
  return `The ${tierName} ${n}`;
}

// Returns the rollBonus or skillMod the active title provides for a given skill.
function getTitleBonus(skillName) {
  const id = player.activeTitle;
  if (!id) return 0;
  // Skill-tier titles: stored as objects directly on player.titles entries
  const entry = (player.titles || []).find(t => t.id === id);
  if (!entry) return 0;
  const bonus = entry.bonus;
  if (!bonus) return 0;
  if (skillName && bonus.skillMods && bonus.skillMods[skillName] !== undefined) {
    return bonus.skillMods[skillName];
  }
  return bonus.rollBonus || 0;
}

// Award a title to the player. titleObj: { id, name, description, bonus }
function awardTitle(titleObj) {
  if (!titleObj || !titleObj.id) return;
  if (!Array.isArray(player.titles)) player.titles = [];
  // For skill-tier titles, replace any existing entry for that skill+lower tier
  const existing = player.titles.findIndex(t => t.id === titleObj.id);
  if (existing !== -1) {
    // Already have exact tier — upgrade bonus in place (for skill tiers this means refresh)
    player.titles[existing] = titleObj;
  } else {
    // Remove any older tier of the same skill if this is a skill title
    if (titleObj.id.startsWith('skill__')) {
      const skillKey = titleObj.id.split('__')[1];
      player.titles = player.titles.filter(t => {
        if (!t.id.startsWith('skill__')) return true;
        return t.id.split('__')[1] !== skillKey;
      });
    }
    player.titles.push(titleObj);
  }
  addStory(`🏅 Title earned: <em>${titleObj.name}</em>`);
  if (titleObj.description) addStory(`<span style="font-size:11px;opacity:0.8">${titleObj.description}</span>`);
  updateJournal();
}

// Award a gameTitles-defined title by ID.
function awardGameTitle(titleId) {
  if (typeof gameTitles === 'undefined') return;
  const def = gameTitles[titleId];
  if (!def) return;
  if (!Array.isArray(player.titles)) player.titles = [];
  if (player.titles.some(t => t.id === titleId)) return; // already earned
  awardTitle({ id: titleId, name: def.name, description: def.description, bonus: def.bonus || {} });
}

// Check milestone-based gameTitles (exploration, wealth, quests, skills, etc.)
function checkAchievementTitles() {
  if (!player.name) return;
  const tilesDiscovered = Object.keys(player.discoveredCells || {}).length;
  const questsDone      = (player.journal?.quests || []).filter(q => q.status?.toLowerCase() === 'completed').length;
  const skillCount      = Object.values(player.skills || {}).filter(s => (s.level || 1) >= 5).length;

  if (tilesDiscovered >= 10)  awardGameTitle('the_wanderer');
  if (tilesDiscovered >= 50)  awardGameTitle('the_explorer');
  if (tilesDiscovered >= 200) awardGameTitle('the_cartographer');
  if (player.gold >= 1000)    awardGameTitle('the_coin_lord');
  if (player.gold >= 10000)   awardGameTitle('the_magnate');
  if (questsDone  >= 5)       awardGameTitle('the_hero');
  if (questsDone  >= 20)      awardGameTitle('the_legend');
  if (skillCount  >= 5)       awardGameTitle('the_polymath');
  if (skillCount  >= 10)      awardGameTitle('the_sage');
}

// ============================================================
// SECTION 6.56 · TRAIT DYNAMICS — EARNING & NPC SOCIAL SYSTEM
// ============================================================

// Which tones count as aggressive vs heroic for counter tracking
const AGGRESSIVE_TONES = new Set(['Malicious', 'Malevolent', 'Terrorize']);
const HEROIC_TONES     = new Set(['Valiant', 'Heroic', 'Inspired']);

// ── Morality System ──────────────────────────────────────────

const MORALITY_TIERS = [
  { min: -100, max:  -76, name: 'Vile',       icon: '💀', level: -4, color: '#8b0000',
    desc: 'Feared and reviled. The darkest of reputations.',
    unlocks: ['Terrorize dialog', 'Bandits are friendlier', 'Merchants in lawful cities charge more'] },
  { min:  -75, max:  -51, name: 'Cruel',      icon: '🩸', level: -3, color: '#c0392b',
    desc: 'Known for coldness and harm. Few approach willingly.',
    unlocks: ['Terrorize dialog', 'Dark reputation precedes you'] },
  { min:  -50, max:  -26, name: 'Selfish',    icon: '🗡️', level: -2, color: '#c0612b',
    desc: 'Self-serving and rough. Some keep their distance.',
    unlocks: ['Slightly better prices from bandits and criminals'] },
  { min:  -25, max:  -11, name: 'Gray',       icon: '🌫️', level: -1, color: '#7a5a3a',
    desc: 'Morally ambiguous. Neither trusted nor feared.',
    unlocks: [] },
  { min:  -10, max:   10, name: 'Neutral',    icon: '⚖️', level:  0, color: '#5c3a1e',
    desc: 'No strong moral pull in either direction.',
    unlocks: [] },
  { min:   11, max:   25, name: 'Decent',     icon: '✦',  level:  1, color: '#5a7a20',
    desc: 'Generally well-regarded. A trustworthy face.',
    unlocks: ['Small persuasion bonus', 'Minor sleep vitality bonus'] },
  { min:   26, max:   50, name: 'Principled', icon: '🛡️', level:  2, color: '#3a8030',
    desc: 'Known for fair dealing and solid character.',
    unlocks: ['Better prices from honest merchants', 'Sleep restores life'] },
  { min:   51, max:   75, name: 'Noble',      icon: '⭐', level:  3, color: '#2060a0',
    desc: 'Widely respected. A moral force in the world.',
    unlocks: ['Inspired dialog', 'Clerics offer better rates', 'Generous sleep recovery'] },
  { min:   76, max:  100, name: 'Righteous',  icon: '✨', level:  4, color: '#7a5a00',
    desc: 'A beacon of virtue. Revered by good folk — and hated by those who aren\'t.',
    unlocks: ['Inspired dialog', 'Full sleep restoration', 'Enemies of evil disposition are less bold'] },
];

const TONE_MORALITY_SHIFTS = {
  Terrorize: -6,
  Malicious:  -2,
  Malevolent: -3,
  Neutral:     0,
  Valiant:    +2,
  Heroic:     +3,
  Inspired:   +5,
};

function getMoralityTier(score) {
  const s = Math.max(-100, Math.min(100, score ?? 0));
  return MORALITY_TIERS.find(t => s >= t.min && s <= t.max) ?? MORALITY_TIERS[4];
}

function changeMorality(amount, reason = '') {
  if (!('morality' in player)) player.morality = 0;
  const prev = getMoralityTier(player.morality);
  player.morality = Math.max(-100, Math.min(100, player.morality + amount));
  const next = getMoralityTier(player.morality);
  if (Math.abs(amount) >= 4) {
    const sign = amount > 0 ? '+' : '';
    const label = reason ? ` — ${reason}` : '';
    addStory(`<span class="mor-shift ${amount > 0 ? 'mor-pos' : 'mor-neg'}">${sign}${amount} morality${label}</span>`);
  }
  if (prev.level !== next.level) {
    addStory(`⚖️ <em>Your moral standing shifts — you are now seen as <strong style="color:${next.color}">${next.icon} ${next.name}</strong>.</em>`);
    addWorldEvent(`Moral standing: ${next.name}`, 'player');
    updateJournal?.();
  }
}

// ── Hope / Despair System ─────────────────────────────────

const HOPE_TIERS = [
  { min: -100, max:  -76, name: 'Broken',     icon: '💔', level: -4, color: '#8860d0',
    desc: 'The will to continue is almost gone. Every step costs more than the last.' },
  { min:  -75, max:  -51, name: 'Despairing', icon: '😞', level: -3, color: '#7858b8',
    desc: 'Dark thoughts cloud every step forward. The future looks bleak.' },
  { min:  -50, max:  -26, name: 'Gloomy',     icon: '🌧️', level: -2, color: '#607090',
    desc: 'The world feels heavy and unwelcoming. Joy is hard to find.' },
  { min:  -25, max:  -11, name: 'Troubled',   icon: '😟', level: -1, color: '#708090',
    desc: 'Doubt lingers at the edges of your mind. Confidence wavers.' },
  { min:  -10, max:   10, name: 'Steady',     icon: '😐', level:  0, color: '#5c3a1e',
    desc: 'Neither hope nor despair holds the upper hand.' },
  { min:   11, max:   25, name: 'Hopeful',    icon: '🌤️', level:  1, color: '#7a8030',
    desc: 'A sense that things might turn out alright. The road ahead seems possible.' },
  { min:   26, max:   50, name: 'Optimistic', icon: '☀️', level:  2, color: '#a07820',
    desc: 'You carry yourself with quiet confidence. The world seems open to your efforts.' },
  { min:   51, max:   75, name: 'Spirited',   icon: '⭐', level:  3, color: '#c08010',
    desc: 'A bright fire burns within. Challenges feel surmountable.' },
  { min:   76, max:  100, name: 'Radiant',    icon: '✨', level:  4, color: '#d4a010',
    desc: 'Unshakeable faith in better days. Your spirit lifts those around you.' },
];

function getHopeTier(score) {
  const s = Math.max(-100, Math.min(100, score ?? 0));
  return HOPE_TIERS.find(t => s >= t.min && s <= t.max) ?? HOPE_TIERS[4];
}

function changeHope(amount, reason = '') {
  if (!('hope' in player)) player.hope = 0;
  const prev = getHopeTier(player.hope);
  player.hope = Math.max(-100, Math.min(100, player.hope + amount));
  const next = getHopeTier(player.hope);
  if (Math.abs(amount) >= 3) {
    const sign = amount > 0 ? '+' : '';
    const label = reason ? ` — ${reason}` : '';
    addStory(`<span class="hope-shift ${amount > 0 ? 'hope-pos' : 'hope-neg'}">${sign}${amount} spirit${label}</span>`);
  }
  if (prev.level !== next.level) {
    addStory(`${next.icon} <em>Your spirit shifts — you feel <strong style="color:${next.color}">${next.name}</strong>.</em>`);
    updateJournal?.();
  }
}

// Thresholds for earning traits through behaviour
const TRAIT_UNLOCK_CONDITIONS = [
  { trait: 'Kind',        test: (c)    => c.heroicTones        >= 15 },
  { trait: 'Charismatic', test: (c)    => c.persuasionSuccesses >= 20 },
  { trait: 'Generous',    test: (c)    => c.goldSpent           >= 500 },
  { trait: 'Cunning',     test: (c)    => c.aggressiveTones     >= 10 },
  { trait: 'Ruthless',    test: (c)    => c.aggressiveTones     >= 25 },
  { trait: 'Deceitful',   test: (c)    => c.aggressiveTones     >= 15 },
  { trait: 'Abrasive',    test: (c)    => c.persuasionFails     >= 15 },
  { trait: 'Loyal',       test: (c)    => c.questsCompleted     >= 10 },
  { trait: 'Honorable',   test: (c)    => c.questsCompleted     >= 25 && c.heroicTones >= 30 },
  { trait: 'Brave',       test: (c)    => c.nearDeaths          >= 3  },
  { trait: 'Resilient',   test: (c)    => c.nearDeaths          >= 7  },
  { trait: 'Greedy',      test: (c, p) => (p.gold || 0)         >= 5000 },
  { trait: 'Wise',        test: (c)    => c.npcInteractions     >= 50 },
  { trait: 'Patient',     test: (c, p) => {
    const craftSkills = ['Smithing','Cooking','Alchemy','Fletching','Sewing','Carpentry','Brewing','Crafting'];
    return craftSkills.some(sk => (p.skills[sk]?.level || 0) >= 20);
  }},
];

// Add a trait to the player, replacing its opposite if the player already has it.
function gainTrait(traitName) {
  if (!traitName) return;
  if (!Array.isArray(player.traits)) player.traits = [];
  if (player.traits.includes(traitName)) return; // already have it
  const def = (typeof gameTraits !== 'undefined') ? gameTraits[traitName] : null;
  const opposite = def?.opposite;
  if (opposite && player.traits.includes(opposite)) {
    player.traits = player.traits.filter(t => t !== opposite);
    addStory(`🔄 Your behaviour has changed you — you shed <em>${opposite}</em> and become <em>${traitName}</em>.`);
  } else {
    addStory(`✨ New trait: <em>${traitName}</em> — ${def?.description || ''}`);
  }
  player.traits.push(traitName);
  addWorldEvent(`Gained trait: ${traitName}.`, 'player');
  updateJournal();
}

// Check all unlock conditions and award matching traits.
function checkTraitUnlocks() {
  if (!player.name) return;
  const c = player.traitCounters || {};
  for (const cond of TRAIT_UNLOCK_CONDITIONS) {
    try {
      if (cond.test(c, player)) gainTrait(cond.trait);
    } catch (_) {}
  }
}

// ── NPC Trait Affinity ──────────────────────────────────────

// Returns the net modifier to a social roll from trait overlap/conflict.
// Only considers traits the player has REVEALED to them (via prior interactions).
function _calcTraitAffinity(playerTraits, npcRevealedTraits) {
  if (!playerTraits?.length || !npcRevealedTraits?.length) return 0;
  const gT = typeof gameTraits !== 'undefined' ? gameTraits : {};
  let mod = 0;
  for (const pt of playerTraits) {
    if (npcRevealedTraits.includes(pt)) mod += 1;               // shared trait → NPC warms to player
    const opp = gT[pt]?.opposite;
    if (opp && npcRevealedTraits.includes(opp)) mod -= 1;       // opposing trait → NPC grows cautious
  }
  return Math.max(-3, Math.min(3, mod));
}

// Returns the net modifier from player's known traits (traits the NPC has observed through repeated interaction).
// NPCs "learn" the player after interactionCount > 3 — before that, player is a stranger.
function _calcNpcKnowsPlayer(npc) {
  const count = npc.interactionCount || 0;
  if (count < 3) return 0;
  const gT   = typeof gameTraits !== 'undefined' ? gameTraits : {};
  const npcT = npc.traits || [];
  const pT   = player.traits || [];
  let mod = 0;
  for (const nt of npcT) {
    if (pT.includes(nt)) mod += 1;
    const opp = gT[nt]?.opposite;
    if (opp && pT.includes(opp)) mod -= 1;
  }
  return Math.max(-3, Math.min(3, mod));
}

// Attempt to reveal one hidden NPC trait to the player. Returns the trait name or null.
function _revealNpcTrait(npc) {
  const known    = npc.revealedTraits || [];
  const all      = npc.traits || [];
  const hidden   = all.filter(t => !known.includes(t));
  if (!hidden.length) return null;
  const revealed = hidden[Math.floor(Math.random() * hidden.length)];
  if (!npc.revealedTraits) npc.revealedTraits = [];
  npc.revealedTraits.push(revealed);
  return revealed;
}

// Returns a short disposition label for the story header.
function _dispositionLabel(npc) {
  const d = npc.disposition || 0;
  if (d >= 4)  return 'warmly receptive';
  if (d >= 2)  return 'friendly';
  if (d >= 0)  return 'neutral';
  if (d >= -2) return 'guarded';
  return 'hostile';
}

// ── NPC Dialog Execution ────────────────────────────────────

// Called when player picks a tone. Runs the full skill check + trait social system.
async function _doNpcDialog(npc, tone) {
  // Lock wheel
  _buildWheel([{ label: '⏳ Speaking…', action: () => {} }]);
  await runInlineProgress(`Speaking with ${npc.name}…`, 1800);

  // Lazily initialise NPC social fields
  if (!npc.revealedTraits)   npc.revealedTraits  = [];
  if (npc.interactionCount === undefined) npc.interactionCount = 0;
  if (npc.disposition      === undefined) npc.disposition      = 0;
  npc.interactionCount++;

  // Counters
  if (!player.traitCounters) player.traitCounters = {};
  const tc = player.traitCounters;
  tc.npcInteractions = (tc.npcInteractions || 0) + 1;
  if (AGGRESSIVE_TONES.has(tone)) tc.aggressiveTones = (tc.aggressiveTones || 0) + 1;
  if (HEROIC_TONES.has(tone))     tc.heroicTones     = (tc.heroicTones     || 0) + 1;

  // Morality shift from tone
  const _moralShift = TONE_MORALITY_SHIFTS[tone] ?? 0;
  if (_moralShift !== 0) changeMorality(_moralShift);

  // Kingdom reputation shift from tone (smaller — builds gradually over many interactions)
  const TONE_REP_SHIFTS = { Terrorize: -4, Malicious: -2, Malevolent: -2, Neutral: 0, Valiant: 1, Heroic: 2, Inspired: 3 };
  const _repShift = TONE_REP_SHIFTS[tone] ?? 0;
  if (_repShift && player.currentKingdom) changeKingdomReputation(player.currentKingdom, _repShift);

  // Affinity modifiers
  const affinityMod  = _calcTraitAffinity(player.traits || [], npc.revealedTraits);
  const knowsMod     = _calcNpcKnowsPlayer(npc);
  const dispositionMod = Math.round((npc.disposition || 0) / 4); // -2 to +2

  // Skill check — Persuasion base, then apply social modifiers after
  const base       = Math.floor(Math.random() * 20) + 1;
  const skillMod   = getSkillBonus('Persuasion');
  const condMod    = getConditionModifier('Persuasion');
  const titleMod   = getTitleBonus('Persuasion');
  const totalMod   = skillMod + condMod + titleMod + affinityMod + knowsMod + dispositionMod;
  const adjusted   = Math.min(20, Math.max(1, base + totalMod));

  // Build modifier breakdown for story
  const parts = [];
  const pLvl  = player.skills['Persuasion']?.level;
  if (skillMod      !== 0) parts.push(`${skillMod > 0 ? '+' : ''}${skillMod} (Persuasion Lv${pLvl})`);
  if (condMod       !== 0) parts.push(`${condMod  > 0 ? '+' : ''}${condMod} (effects)`);
  if (titleMod      !== 0) parts.push(`${titleMod > 0 ? '+' : ''}${titleMod} (title)`);
  if (affinityMod   !== 0) parts.push(`${affinityMod > 0 ? '+' : ''}${affinityMod} (shared traits)`);
  if (knowsMod      !== 0) parts.push(`${knowsMod > 0 ? '+' : ''}${knowsMod} (their read of you)`);
  if (dispositionMod!== 0) parts.push(`${dispositionMod > 0 ? '+' : ''}${dispositionMod} (disposition)`);
  const suffix = parts.length ? ` ${parts.join(', ')} = ${adjusted}` : '';
  addStory(`🎲 Rolled ${base}${suffix}`);

  const tier = adjusted <= 5 ? 1 : adjusted <= 10 ? 2 : adjusted <= 14 ? 3 : adjusted <= 18 ? 4 : 5;
  gainSkillXp('Persuasion', tier);

  // Track persuasion outcomes
  if (tier >= 4) tc.persuasionSuccesses = (tc.persuasionSuccesses || 0) + 1;
  if (tier <= 2) tc.persuasionFails     = (tc.persuasionFails     || 0) + 1;

  // Disposition shift
  const dispShift = { 1: -2, 2: -1, 3: 0, 4: 1, 5: 2 }[tier] ?? 0;
  // Tone misalignment: aggressive tones backfire with good-natured NPCs, heroic backfire with hostile NPCs
  const npcMorality = (npc.morality || '').toLowerCase();
  let toneClash = 0;
  if (AGGRESSIVE_TONES.has(tone) && ['valiant','heroic'].includes(npcMorality)) toneClash = -1;
  if (HEROIC_TONES.has(tone)     && ['malicious','malevolent'].includes(npcMorality)) toneClash = -1;
  npc.disposition = Math.max(-10, Math.min(10, (npc.disposition || 0) + dispShift + toneClash));

  // Show dialog outcome
  addStory(`<em>"${_dialogOutcome(tone, tier)}"</em>`);

  // Disposition feedback
  const dispLabel = _dispositionLabel(npc);
  addStory(`${npc.name} now seems <strong>${dispLabel}</strong> toward you.`);

  // World event comment — NPCs in affected kingdoms mention local situation on successful talks
  if (tier >= 3) {
    const npcKingdom = player.currentKingdom;
    const localEvs = (worldEconomy?.activeEvents || []).filter(e => !e.kingdom || e.kingdom === npcKingdom);
    if (localEvs.length && Math.random() < 0.55) {
      const ev = localEvs[Math.floor(Math.random() * localEvs.length)];
      const templates = typeof EVENT_RUMORS !== 'undefined' && EVENT_RUMORS[ev.type];
      if (templates && npcKingdom) {
        const lines = templates(npcKingdom);
        const line = lines[Math.floor(Math.random() * lines.length)];
        addStory(`${npc.name} lowers their voice: <em>"${line}"</em>`);
      }
    }
  }

  // Trait revelation — probability scales with tier
  const revealChance = [0, 0.10, 0.25, 0.50, 0.90][tier - 1] ?? 0;
  if (Math.random() < revealChance) {
    const revealed = _revealNpcTrait(npc);
    if (revealed) {
      const def = (typeof gameTraits !== 'undefined' && gameTraits[revealed]) || {};
      addStory(`🔍 You sense something about ${npc.name}: they seem <strong>${revealed}</strong>. ${def.description || ''}`);
      // On critical success, NPC also "reads" one of your traits — update their awareness
      if (tier === 5 && (player.traits || []).length) {
        const unknownToNpc = (player.traits || []).filter(t => !(npc.playerTraitsKnown || []).includes(t));
        if (unknownToNpc.length) {
          const learned = unknownToNpc[Math.floor(Math.random() * unknownToNpc.length)];
          if (!npc.playerTraitsKnown) npc.playerTraitsKnown = [];
          npc.playerTraitsKnown.push(learned);
          const pDef = (typeof gameTraits !== 'undefined' && gameTraits[learned]) || {};
          addStory(`${npc.name} has taken notice of your <strong>${learned}</strong> nature.`);
          // Check if they share or oppose that trait — show reaction
          const npcHasMatch = (npc.traits || []).includes(learned);
          const npcOpp      = (typeof gameTraits !== 'undefined' && gameTraits[learned]?.opposite);
          const npcHasOpp   = npcOpp && (npc.traits || []).includes(npcOpp);
          if (npcHasMatch) addStory(`They seem to <em>warm</em> to you — they share that quality.`);
          else if (npcHasOpp) addStory(`You sense a flicker of <em>unease</em> — your nature sits uneasily with theirs.`);
        }
      }
    }
  }

  // Log interaction
  npc.conversationLog = npc.conversationLog || [];
  npc.conversationLog.push({ tone, tier, timeOfDay: player.timeOfDay, location: player.currentLocation });
  if (npc._worldId) bumpImportance(npc._worldId, `tone: ${tone} tier: ${tier}`, 3);

  checkTraitUnlocks();
  await waitForEnter();
  _goBack();
}

// ── NPC Interaction Wheel ───────────────────────────────────

// ============================================================
// SECTION 6.6 · MASTERS GUILD SYSTEM
// ============================================================

const MASTER_GUILD_CONFIG = {
  'Blacksmith':  { skill: 'Smithing',      item: { name: "The Grand Forgemaster's Hammer",      desc: "A perfectly balanced smithing hammer passed from Grandmaster to Grandmaster. Crafting rolls of tier 2 or higher always produce a usable result." } },
  'Armorer':     { skill: 'Smithing',      item: { name: "The Adamant Armourer's Gauntlet",     desc: "A mithril crafting gauntlet that perfectly shapes metal. Armour crafting checks always produce at least tier 3 quality." } },
  'Fletcher':    { skill: 'Fletching',     item: { name: "The Perpetual Quiver",                 desc: "A quiver of ancient leather that slowly replenishes its arrows. Generates 1 Arrow per long rest." } },
  'Alchemist':   { skill: 'Alchemy',       item: { name: "The Philosopher's Flask",              desc: "A crystal flask that never cracks and catalyzes reactions perfectly. Critical crafting rolls produce twice the potion quantity." } },
  'Apothecary':  { skill: 'Healing',       item: { name: "The Society's Moonstone Mortar",      desc: "Carved from moonstone, it purifies any herbal paste. Healing remedy checks cannot roll below tier 2." } },
  'Herbalist':   { skill: 'Herbalism',     item: { name: "The Living Root",                      desc: "A root that never withers and identifies any plant on contact. Herbalism checks cannot roll below tier 2." } },
  'Brewer':      { skill: 'Brewing',       item: { name: "The Eternal Cask",                    desc: "A small cask that keeps any drink fresh indefinitely and subtly improves potency. Brewed drinks restore +5 extra stamina." } },
  'Distiller':   { skill: 'Brewing',       item: { name: "The Crystal Alembic",                 desc: "A crystal alembic that doubles spirit yield. Crafting rolls of tier 4 or higher produce twice the quantity." } },
  'Merchant':    { skill: 'Negotiating',   item: { name: "The Exchange Signet Ring",             desc: "A ring bearing the Grand Exchange seal. All merchants recognise it and offer 10% better prices on transactions." } },
  'Weaver':      { skill: 'Sewing',        item: { name: "The Master's Needle",                 desc: "A needle that moves of its own accord when guided, halving sewing time. Sewing checks gain +2." } },
  'Tailor':      { skill: 'Sewing',        item: { name: "The Grand Couturier's Thread",        desc: "Thread of gold that never tangles. Sewing checks gain +2 and produced garments are always one condition tier higher." } },
  'Cobbler':     { skill: 'Crafting',      item: { name: "The Eternal Last",                    desc: "A cobbler's last that fits any foot perfectly. Reduces stamina loss from long travel by 1 per step." } },
  'Tanner':      { skill: 'Crafting',      item: { name: "The Tanner's Flaying Knife",          desc: "A blade that never dulls. Processing hides always yields Excellent quality leather." } },
  'Carpenter':   { skill: 'Carpentry',     item: { name: "The Grand Woodwright's Plane",        desc: "A plane that smooths any wood to perfect grain. Carpentry checks gain +2." } },
  'Mason':       { skill: 'Mining',        item: { name: "The Lodgemaster's Plumb Line",        desc: "A plumb line of pure brass. Mining checks gain +2 and structures built with it never fail structural inspection." } },
  'Miner':       { skill: 'Mining',        item: { name: "The Deep Warden's Dowsing Rod",       desc: "A forked rod of ancient iron that vibrates near ore veins. Mining checks always locate ore when any is present." } },
  'Hunter':      { skill: 'Hunting',       item: { name: "The Lodge Champion's Horn",           desc: "A bone hunting horn that confuses prey when blown. The next hunting roll gains +3." } },
  'Fisher':      { skill: 'Fishing',       item: { name: "The Fleet Warden's Lure",             desc: "A lure carved from sea-glass that never wears out. Fishing checks cannot roll below tier 2." } },
  'Healer':      { skill: 'Healing',       item: { name: "The Order's Heartstone",              desc: "A pale green stone warm to the touch. Healing checks cannot roll below tier 2, and critical heals restore 1 Life." } },
  'Scholar':     { skill: 'Decrypting',    item: { name: "The Convocation's Cipher Key",        desc: "A rotating puzzle-key that deciphers any written code. Decrypting checks are always at least tier 3." } },
  'Mage':        { skill: 'Light Magic',   item: { name: "The Arch-Mage's Focus Crystal",       desc: "A hand-held crystal that amplifies magical intent. All magic skill checks gain +2." } },
  'Priest':      { skill: 'Healing',       item: { name: "The Sacred Elder's Censer",           desc: "When lit, removes the Cursed condition and reduces all harmful condition durations by 1. Healing checks gain +1." } },
  'Bard':        { skill: 'Persuasion',    item: { name: "The Grandmaster's Lute",              desc: "A lute whose strings never break. Persuasion checks while performing gain +3." } },
  'Assassin':    { skill: 'Stealth',       item: { name: "The Silent Master's Veil",            desc: "Shadow-silk woven with night itself. Stealth checks gain +2 and detection difficulty is halved." } },
  'Thief':       { skill: 'Lockpicking',   item: { name: "The Master Key",                      desc: "A skeleton key that opens any non-magical lock. Lockpicking checks against standard locks always succeed." } },
  'Farmer':      { skill: 'Foraging',      item: { name: "The Covenant Elder's Sickle",         desc: "A sickle that identifies safe harvests. Foraging rolls always produce at least one item and yield 50% more." } },
  'Cook':        { skill: 'Cooking',       item: { name: "The Golden Spoon",                    desc: "A golden spoon that improves any dish cooked with it. Cooking rolls gain +2 and meals provide +5 bonus stamina." } },
  'Knight':      { skill: 'Swordsmanship', item: { name: "The Grand Marshal's Blade",           desc: "An ornate ceremonial longsword. Swordsmanship checks gain +2. It cannot be sold or traded." } },
  'Baker':       { skill: 'Cooking',       item: { name: "The Grand Baker's Stone",             desc: "A baking stone that conducts heat perfectly. Bread and pastry recipes always yield Excellent quality." } },
  'Jeweller':    { skill: 'Crafting',      item: { name: "The Grand Jeweller's Loupe",          desc: "A magnifying loupe that reveals flaws invisible to the naked eye. Gem appraisal and crafting checks gain +2." } },
  'Barber':      { skill: 'Healing',       item: { name: "The Grand Barber's Lancet",           desc: "A surgical lancet that never rusts. Wound treatment always removes 1 tier from the Injured condition." } },
  'Sailor':      { skill: 'Navigation',    item: { name: "The Harbourmaster's Compass",         desc: "A brass compass that never errs. Navigation checks always succeed and fishing checks gain +2." } },
  'Shipwright':  { skill: 'Carpentry',     item: { name: "The Grand Shipwright's Adze",         desc: "An adze of ancient oak and forged steel. Carpentry checks for nautical construction gain +3." } },
  'Adventurer':  { skill: 'Survival',      item: { name: "The Fellowship Champion's Kit",       desc: "A compact kit with folded map, signal mirror, and survival tools. Survival checks gain +2." } },
  'Performer':   { skill: 'Persuasion',    item: { name: "The Grand Player's Mask",             desc: "A carved theatrical mask. When worn during persuasion, roll twice and take the higher result." } },
  'Ranger':      { skill: 'Tracking',      item: { name: "The Compact Warden's Mark",           desc: "A carved token that, when placed, records all creature movements nearby for 1 hour. Tracking checks gain +2." } },
  'Architect':   { skill: 'Carpentry',     item: { name: "The Grand Architect's Compass",       desc: "A precision drafting compass. Structures planned with it require 10% less materials and never fail inspection." } },
  'Druid':       { skill: 'Herbalism',     item: { name: "The Arch-Druid's Acorn",              desc: "A black acorn from the oldest forest. Animals do not flee from the holder. Herbalism checks gain +2." } },
  'Potter':      { skill: 'Crafting',      item: { name: "The Grand Potter's Wheel Shard",      desc: "A shard from the first pottery wheel ever made. Any vessel crafted with it never chips or breaks." } },
  'Silversmith': { skill: 'Crafting',      item: { name: "The Grand Silversmith's Touchstone",  desc: "A touchstone that perfectly assesses silver purity. Crafting silver items always yields maximum quality." } },
};

function _getMasterGuildTitle(guild) {
  const t = guild.rankTitles || [];
  return t[t.length - 1] || ('Master ' + guild.profession);
}

function generateMasterGuildQuest(guild) {
  const cfg = MASTER_GUILD_CONFIG[guild.profession];
  if (!cfg) return null;
  const id = 'masters_guild_' + guild.profession.toLowerCase().replace(/\s+/g, '_');
  const masterTitle = _getMasterGuildTitle(guild);
  return {
    id,
    name: masterTitle + "'s Trial",
    type: 'guild',
    categories: ['Exploration'],
    description: guild.name + ' has heard of your extraordinary mastery of ' + cfg.skill + '. A guild representative seeks you out. Prove yourself at ' + guild.seat + ' to earn the title of ' + masterTitle + '.',
    kingdom: null,
    acquisition: { description: 'Triggered automatically when ' + cfg.skill + ' reaches level 99.', trigger: { type: 'skill_level', skill: cfg.skill, level: 99 } },
    objectives: [
      {
        id: 'approach',
        text: 'Speak with the representative of ' + guild.name + '.',
        type: 'talk',
        target: { npc: guild.name + ' Representative' },
        completion: { type: 'flag', key: 'guild_approached' },
        onComplete: { setFlag: { key: 'guild_approached', value: true } },
      },
      {
        id: 'travel',
        text: 'Travel to ' + guild.seat + ', seat of ' + guild.name + '.',
        type: 'travel',
        target: { area: guild.seat },
        completion: { type: 'ai_judgment', description: 'Player has arrived at a city or capital settlement.' },
        onComplete: { setFlag: { key: 'arrived_at_seat', value: true } },
      },
      {
        id: 'trial',
        text: 'Complete the Master\'s Trial and prove your mastery of ' + cfg.skill + '.',
        type: 'complete',
        target: { skill: cfg.skill },
        completion: { type: 'flag', key: 'trial_complete' },
        onComplete: { setFlag: { key: 'trial_complete', value: true } },
      },
    ],
    rewards: {
      experience: 500,
      gold: 100,
      items: [
        {
          questItem: id + '_master_item',
          displayName: cfg.item.name,
          description: cfg.item.desc,
          rarity: 'Legendary',
          itemType: 'misc',
          consumable: false,
          wearable: false,
          weight: 0.3,
          qty: 1,
        },
      ],
      special: [
        { type: 'title', value: masterTitle, guild: guild.name },
        { type: 'flag', key: 'mastered_' + guild.profession.toLowerCase().replace(/\s+/g, '_'), value: true },
      ],
    },
  };
}

function queueMasterGuildEncounters(skillName) {
  if (!player.pendingMasterGuilds) player.pendingMasterGuilds = [];
  if (typeof mastersGuilds === 'undefined') return;
  for (const guild of mastersGuilds) {
    const cfg = MASTER_GUILD_CONFIG[guild.profession];
    if (!cfg || cfg.skill !== skillName) continue;
    const questId = 'masters_guild_' + guild.profession.toLowerCase().replace(/\s+/g, '_');
    if ((player.journal.quests || []).find(q => q.id === questId)) continue;
    if (player.pendingMasterGuilds.find(p => p.questId === questId)) continue;
    player.pendingMasterGuilds.push({ questId, guildName: guild.name, seat: guild.seat, profession: guild.profession, skill: skillName, turnsLeft: 5 });
  }
}

function checkMasterGuildQueue() {
  if (!player.pendingMasterGuilds?.length) return;
  for (const e of player.pendingMasterGuilds) e.turnsLeft = (e.turnsLeft || 1) - 1;
  const ready = player.pendingMasterGuilds.filter(e => e.turnsLeft <= 0);
  const remaining = player.pendingMasterGuilds.filter(e => e.turnsLeft > 0);
  // Re-queue extras with a 5-turn gap so they fire one at a time
  player.pendingMasterGuilds = [...remaining, ...ready.slice(1).map(e => ({ ...e, turnsLeft: 5 }))];
  if (ready[0]) _fireMasterGuildApproach(ready[0]);
}

function getActiveMasterTrialQuest() {
  return (player.journal.quests || []).find(q => q.status === 'Active' && q.id.startsWith('masters_guild_') && q.objectiveIndex === 2) || null;
}

function _getMasterTitle(profession) {
  if (typeof mastersGuilds === 'undefined') return 'Master ' + profession;
  const g = mastersGuilds.find(x => x.profession === profession);
  return g ? _getMasterGuildTitle(g) : ('Master ' + profession);
}

async function _fireMasterGuildApproach(entry) {
  startQuest(entry.questId);
  addStory('🏛️ A messenger bearing the seal of <strong>' + entry.guildName + '</strong> finds you on the road.');
  await waitForEnter();
  addStory('"Your mastery of ' + entry.skill + ' has reached heights rarely seen across Estranta. ' + entry.guildName + ' extends a formal invitation. Come to <strong>' + entry.seat + '</strong> — prove yourself before the assembled guild and earn the title of ' + _getMasterTitle(entry.profession) + '."');
  await waitForEnter();
  addStory('The messenger presses a sealed letter into your hands bearing the guild\'s crest, bows, and departs into the road dust.');
  setQuestFlag(entry.questId, 'guild_approached');
}

async function _doMastersTrial() {
  const trialQuest = getActiveMasterTrialQuest();
  if (!trialQuest) return;
  const profKey = trialQuest.id.replace('masters_guild_', '');
  const guild = (typeof mastersGuilds !== 'undefined')
    ? mastersGuilds.find(g => g.profession.toLowerCase().replace(/\s+/g, '_') === profKey) : null;
  const cfg = guild ? MASTER_GUILD_CONFIG[guild.profession] : null;
  if (!cfg || !guild) return;
  const skillName = cfg.skill;
  const masterTitle = _getMasterGuildTitle(guild);

  _buildWheel([{ label: '⚔️ Competing…', action: () => {} }]);
  addStory('🏛️ You step into the grand hall of ' + guild.name + '. The assembled masters watch in silence.');
  await waitForEnter();
  addStory('The Grand Trial of ' + skillName + ' begins. You must demonstrate the pinnacle of your craft before these peers.');
  await runInlineProgress('Competing in the Grand Trial…', 5000);
  const tier = performSkillCheck(skillName);

  if (tier >= 4) {
    addStory('🎉 The hall erupts! Your performance is extraordinary — a display of mastery that silences even the most seasoned critics.');
    await waitForEnter();
    addStory('The Grandmaster descends from the dais and clasps your hand. "' + masterTitle + ' — from this day hence, you carry that title with honour."');
    setQuestFlag(trialQuest.id, 'trial_complete');
  } else if (tier === 3) {
    addStory('👏 A strong performance. The assembled masters confer in hushed voices.');
    await waitForEnter();
    addStory('The Grandmaster nods. "You have met the standard. ' + masterTitle + ' — though we expect greater things of you still."');
    setQuestFlag(trialQuest.id, 'trial_complete');
  } else {
    addStory('😔 You perform adequately — but the masters expected more from one of your reputed skill.');
    await waitForEnter();
    addStory('"Return when you are ready to truly exceed yourself," the Grandmaster says, not unkindly. The trial may be attempted again.');
    _goBack();
    return;
  }
  _goBack();
}

// Keyword → skill mapping for free-text user input
const INPUT_SKILL_MAP = [
  { re: /hunt|stalk|prey|track.*animal/i,                 skill: 'Hunting'       },
  { re: /forag|wild.*berr|mushroom|herb.*gather/i,        skill: 'Foraging'      },
  { re: /fight|attack|swing|slash|stab|sword|duel|smite/i,skill: 'Swordsmanship' },
  { re: /shoot|arrow|aim|bow|loose.*arrow/i,             skill: 'Archery'       },
  { re: /punch|brawl|unarmed|fist|kick|wrestl/i,         skill: 'Brawling'      },
  { re: /sneak|hide|shadow|stealth|skulk|lurk/i,         skill: 'Stealth'       },
  { re: /pickpocket|steal|filch|pilfer|swipe|pocket|thiev/i, skill: 'Thievery'  },
  { re: /lockpick|pick.*lock|open.*lock/i,               skill: 'Lockpicking'   },
  { re: /cook|bake|roast|boil|fry|grill|spit.*roast/i,  skill: 'Cooking'       },
  { re: /craft|whittle|construct|build.*item|make.*item/i,skill: 'Crafting'      },
  { re: /smith|forge|hammer|anvil|iron|smelt/i,          skill: 'Smithing'      },
  { re: /brew|potion|alchemy|mix.*herb|distill/i,        skill: 'Alchemy'       },
  { re: /talk|speak|persuade|convince|charm|plead/i,     skill: 'Persuasion'    },
  { re: /negotiate|trade|bargain|deal|barter/i,          skill: 'Negotiating'   },
  { re: /heal|treat|bandage|cure|mend|suture/i,          skill: 'Healing'       },
  { re: /cast|spell|magic|enchant|arcane|invoke/i,       skill: 'Light Magic'   },
  { re: /track|trace|search|investigate|examine/i,       skill: 'Tracking'      },
  { re: /scout|survey|recon|patrol/i,                   skill: 'Tracking'      },
  { re: /light.*fire|kindle|ignite|start.*fire/i,       skill: 'Fire-making'   },
  { re: /fish|bait|cast.*line|angl/i,                   skill: 'Fishing'       },
  { re: /mine|dig.*ore|pickaxe|excavat/i,               skill: 'Mining'        },
  { re: /sew|tailor|stitch|mend.*cloth|fabric/i,        skill: 'Sewing'        },
  { re: /fletch|craft.*arrow|make.*bow/i,               skill: 'Fletching'     },
  { re: /decipher|decrypt|decode|cipher|rune/i,         skill: 'Decrypting'    },
  { re: /gather|collect|forage|scaveng/i,               skill: 'Foraging'      },
  { re: /camp|shelter|survive|endure|wilderness/i,      skill: 'Survival'      },
  { re: /tame|train.*animal|groom|stable|herd|shepherd|falc/i, skill: 'Animal Handling' },
  { re: /navigate|compass|chart|star.*course|sail|steer/i,     skill: 'Navigation'     },
  { re: /paint|draw|sculpt|sketch|carve.*art|illustrat/i,      skill: 'Artistry'       },
  { re: /divine|omen|prophecy|foretell|read.*stars|astro|oracle|soothsay/i, skill: 'Mysticism' },
];

function inferSkillFromInput(text) {
  for (const { re, skill } of INPUT_SKILL_MAP) {
    if (re.test(text)) return skill;
  }
  return 'Survival';
}

// Dialog tone → tier-indexed outcomes
const DIALOG_OUTCOMES = {
  Terrorize:  ['They laugh and reach for their weapon.', 'Raw fear crosses their face.', 'They go pale and cannot speak.', 'They tremble and comply.', 'You leave them shattered and silent.'],
  Malicious:  ['They sneer and draw a weapon.', 'They back away uneasily.', 'A tense standoff.', 'They regard you with fear.', 'Your menace silences the room.'],
  Malevolent: ['They scoff and dismiss you.', 'They are unsettled.', 'Unease hangs in the air.', 'They eye you with wary respect.', 'Your dark aura dominates the exchange.'],
  Neutral:    ['A cold silence follows.', 'They nod cautiously.', 'An uneasy but civil peace.', 'They respect your composure.', 'Your measured calm commands the room.'],
  Valiant:    ['They look unconvinced.', 'A flicker of acknowledgment.', 'They listen carefully.', 'Your words inspire hope.', 'Your rallying call moves them deeply.'],
  Heroic:     ['They dismiss you as naive.', 'A spark of hope in their eyes.', 'They are stirred by your courage.', 'Your bravery lifts spirits.', 'You become legend in this moment.'],
  Inspired:   ['They smile but are not moved.', 'Something in your bearing gives them comfort.', 'They are genuinely moved by your conviction.', 'Your light steadies those around you.', 'Your presence alone changes the room.'],
};

function _dialogOutcome(tone, tier) {
  const msgs = DIALOG_OUTCOMES[tone] || ['Your words hang in the air.'];
  return msgs[Math.min(tier - 1, msgs.length - 1)];
}

// SECTION 6.6 · EFFECTS / CONDITIONS SYSTEM
// CONDITION_DEFS, gameTraits, and gameSkills are loaded from playerAttributes.js

// Returns the summed roll modifier from all active conditions for a given skill.
function getConditionModifier(skillName) {
  if (!player.conditions || !player.conditions.length) return 0;
  let total = 0;
  for (const c of player.conditions) {
    const def = CONDITION_DEFS[c.id];
    if (!def) continue;
    total += def.rollBonus || 0;
    if (skillName && def.skillMods?.[skillName]) total += def.skillMods[skillName];
  }
  return total;
}

// Returns a roll modifier from the wear % of equipped weapon (for weapon skills) or worst armor.
function getEquipmentConditionModifier(skillName) {
  const equipped = player.equipped || {};
  let mod = 0;
  // Weapon wear penalises weapon skills: +1 at 100%, 0 at ~70%, -2 at 0%
  if (WEAPON_SKILL_SET.has(skillName)) {
    const wName = equipped.rightHand || equipped.leftHand;
    if (wName) {
      const wear = getItemWear(wName);
      if      (wear >= 75) mod += 1;
      else if (wear >= 50) mod += 0;
      else if (wear >= 25) mod -= 1;
      else if (wear >  0)  mod -= 2;
      else                 mod -= 3;
    }
  }
  // Worst non-weapon armor below 50% wear applies a -1 penalty to all checks
  let minWear = 100;
  for (const [slot, name] of Object.entries(equipped)) {
    if (!name || slot === 'rightHand' || slot === 'leftHand') continue;
    const wear = getItemWear(name);
    if (wear < minWear) minWear = wear;
  }
  if (minWear < 50) mod -= 1;
  if (minWear === 0) mod -= 1;
  return mod;
}

// Apply a condition; refreshes duration if already active.
function applyCondition(id, durationOverride) {
  if (!CONDITION_DEFS[id]) return;
  if (!player.conditions) player.conditions = [];
  const def  = CONDITION_DEFS[id];
  const dur  = durationOverride ?? def.defaultDuration;
  const existing = player.conditions.find(c => c.id === id);
  if (existing) {
    existing.duration = Math.max(existing.duration, dur);
  } else {
    player.conditions.push({ id, duration: dur });
    addStory(`${def.icon} You are now ${def.name}.`);
  }
  renderConditions();
  updateTopStats();
}

// Remove a condition immediately (e.g. cured by healing).
function removeCondition(id) {
  if (!player.conditions) return;
  const idx = player.conditions.findIndex(c => c.id === id);
  if (idx === -1) return;
  const def = CONDITION_DEFS[id];
  player.conditions.splice(idx, 1);
  if (def) addStory(`${def.icon} ${def.name} has worn off.`);
  renderConditions();
  updateTopStats();
}

// Called every time-of-day advance. Ticks durations, applies per-tick effects, auto-applies exhaustion.
// silent = true suppresses player-facing messages (used for intermediate ticks in advanceTime).
function tickConditions(silent = false) {
  if (!player.conditions) player.conditions = [];

  // Per-tick stamina effects and duration countdown
  const toRemove = [];
  for (const c of player.conditions) {
    const def = CONDITION_DEFS[c.id];
    if (!def) { toRemove.push(c.id); continue; }
    if (def.staminaRegen !== 0) {
      player.stamina = Math.max(0, Math.min(player.maxStamina, player.stamina + def.staminaRegen));
    }
    if (c.duration < 999) {
      c.duration--;
      if (c.duration <= 0) toRemove.push(c.id);
    }
  }
  toRemove.forEach(id => removeCondition(id));

  // Auto-apply exhausted when stamina critically low
  const staminaPct = player.stamina / player.maxStamina;
  if (staminaPct <= 0.1 && !player.conditions.find(c => c.id === 'exhausted')) {
    applyCondition('exhausted', 2);
  } else if (staminaPct > 0.3 && player.conditions.find(c => c.id === 'exhausted')) {
    removeCondition('exhausted');
  }

  // Time-based hunger — tiers: peckish (8 periods), hungry (16), starving (28)
  // Eating sets lastFedDay so hunger is fully suppressed for the remainder of that day.
  const _fedToday = player.lastFedDay !== undefined && player.lastFedDay === (player.day || 1);
  if (player.conditions.find(c => c.id === 'well_fed') || _fedToday) {
    if ((player.turnsWithoutFood || 0) !== 0) {
      player.turnsWithoutFood = 0;
      ['peckish', 'hungry', 'starving'].forEach(id => removeCondition(id));
    }
  } else {
    player.turnsWithoutFood = (player.turnsWithoutFood || 0) + 1;
    const t = player.turnsWithoutFood;
    const has = id => player.conditions.find(c => c.id === id);
    if (t >= 28) {
      if (!has('starving')) {
        ['peckish', 'hungry'].forEach(id => removeCondition(id));
        applyCondition('starving', 999);
      }
    } else if (t >= 16) {
      if (!has('hungry')) {
        ['peckish', 'starving'].forEach(id => removeCondition(id));
        applyCondition('hungry', 999);
      }
    } else if (t >= 8) {
      if (!has('peckish') && !has('hungry') && !has('starving')) {
        applyCondition('peckish', 999);
      }
    }
  }

  // Starvation life drain — health slowly falls but never below 1
  if (player.conditions.find(c => c.id === 'starving')) {
    player.life = Math.max(1, (player.life || 1) - 3);
    updateTopStats();
    if (!silent) addStory('💀 Starvation is taking its toll. You must eat something.');
  }

  // Condition escalation: cold + wet sustained → sick
  const isCold = !!player.conditions.find(c => c.id === 'cold');
  const isWet  = !!player.conditions.find(c => c.id === 'wet');
  if (isCold && isWet) {
    player.coldWetTicks = (player.coldWetTicks || 0) + 1;
    if (player.coldWetTicks >= 2 && !player.conditions.find(c => c.id === 'sick')) {
      applyCondition('sick', 6);
      addStory('🤒 The cold and damp have made you ill.');
      player.coldWetTicks = 0;
    }
  } else {
    player.coldWetTicks = 0;
  }

  // Prolonged injury escalates to infected (re-uses sick condition)
  const isInjured = player.conditions.find(c => c.id === 'injured');
  if (isInjured) {
    player.injuredTicks = (player.injuredTicks || 0) + 1;
    if (player.injuredTicks >= 4 && !player.conditions.find(c => c.id === 'sick')) {
      applyCondition('sick', 4);
      addStory('🤒 Your untreated wound has become infected.');
    }
  } else {
    player.injuredTicks = 0;
  }

  if (toRemove.length) updateTopStats();
  tickWorldEconomy();
  tickWorldNPCs();

  // Passive gear degradation — equipped items wear slowly over time
  for (const [slot, name] of Object.entries(player.equipped || {})) {
    if (!name || !player.inventory?.[name]) continue;
    const isWeapon = slot === 'rightHand' || slot === 'leftHand';
    degradeItemWear(name, isWeapon ? 1 : 0.5);
  }

  // Shelter durability degrades with weather; collapses at 0
  if (player.hasShelter || player.shelterUpgraded) {
    if (player.shelterDurability === undefined) player.shelterDurability = 100;
    const sev = typeof getWeatherSeverity === 'function' ? getWeatherSeverity() : 0;
    const degradeRate = sev >= 5 ? 12 : sev >= 4 ? 8 : sev >= 3 ? 4 : sev >= 2 ? 1 : 0;
    if (degradeRate > 0) {
      player.shelterDurability = Math.max(0, player.shelterDurability - degradeRate);
      if (!silent && player.shelterDurability <= 20 && player.shelterDurability > 0) {
        addStory(`🛖⚠️ Your shelter is badly damaged (${player.shelterDurability}% durability). Repair it soon.`);
      }
      if (player.shelterDurability === 0) {
        player.hasShelter     = false;
        player.shelterUpgraded = false;
        player.shelterDurability = 0;
        if (!silent) addStory('🛖💥 Your shelter has collapsed under the weather! You are exposed.');
        applyCondition('cold');
        setBuiltIcon?.('shelter-button', false);
        updateComfortProtection?.();
      }
    }
  }
}

// Render active conditions into the Effects sidebar panel.
function renderConditions() {
  const sidebar = document.getElementById('dice-log-sidebar');
  if (!sidebar) return;
  let el = document.getElementById('conditions-display');
  if (!el) {
    el = document.createElement('div');
    el.id = 'conditions-display';
    sidebar.appendChild(el);
  }
  const active = (player.conditions || []).filter(c => CONDITION_DEFS[c.id]);
  if (!active.length) {
    el.innerHTML = '<p class="no-conditions">No active effects.</p>';
    return;
  }
  el.innerHTML = active.map(c => {
    const def = CONDITION_DEFS[c.id];
    const durLabel = c.duration >= 999 ? '∞' : `${c.duration}t`;
    const mods = [];
    if (def.rollBonus)    mods.push(`${def.rollBonus > 0 ? '+' : ''}${def.rollBonus} to all rolls`);
    if (def.staminaRegen) mods.push(`${def.staminaRegen > 0 ? '+' : ''}${def.staminaRegen} stamina/turn`);
    Object.entries(def.skillMods || {}).forEach(([sk, v]) => mods.push(`${v > 0 ? '+' : ''}${v} ${sk}`));
    const harmful = def.harmful ? 'true' : 'false';
    return `<div class="condition-entry" data-harmful="${harmful}" title="${mods.join(' · ')}">
      <span class="condition-icon">${def.icon}</span>
      <span class="condition-name">${def.name}</span>
      <span class="condition-dur">${durLabel}</span>
    </div>`;
  }).join('');
}

// Reset hunger on eating — called by eatItem after the eating message is already shown.
function consumeFood(itemName) {
  ['peckish', 'hungry', 'starving'].forEach(id => removeCondition(id));
  player.turnsWithoutFood = 0;
  player.lastFedDay = player.day || 1;
  applyCondition('well_fed');
}

// 6.3 · Update Player Stats
			function updatePlayerStats() {
				updateInventory();
				updateJournal();
				updatePlayerProfile();
				updateSkillsGrid();
				renderConditions();
				updateTopStats();
			}

			// Populate the Journal > Player Profile tab
			function updatePlayerProfile() {
				const el = document.getElementById('player-profile-sheet');
				if (!el) return;
				if (!player.name) { el.innerHTML = '<p><em>No character yet.</em></p>'; return; }

				const originLabels    = { noble: 'Noble house', village: 'Common village', wilderness: 'The wilderness', port: 'Port town' };
				const motivLabels     = { vengeance: 'Seeking vengeance', knowledge: 'Pursuing knowledge', law: 'Running from the law', honor: 'Answering a call to arms', fortune: 'Chasing fortune' };
				const originLabel     = originLabels[player.origin]     || player.origin     || '—';
				const motivLabel      = motivLabels[player.motivation]  || player.motivation || '—';
				const traitArr        = Array.isArray(player.traits) ? player.traits : [];
				const skillEntries    = Object.entries(player.skills || {});

				el.innerHTML = `
					<h3>Character</h3>
					<div class="profile-grid">
						<div class="profile-field"><span class="profile-label">Name</span><span class="profile-value">${player.name}</span></div>
						<div class="profile-field"><span class="profile-label">Culture</span><span class="profile-value">${player.culture || '—'}</span></div>
						<div class="profile-field"><span class="profile-label">Gender</span><span class="profile-value">${player.gender || '—'}</span></div>
						<div class="profile-field"><span class="profile-label">Profession</span><span class="profile-value">${player.profession || '—'}</span></div>
						<div class="profile-field"><span class="profile-label">Social Class</span><span class="profile-value">${player.socialClass || '—'}</span></div>
						<div class="profile-field"><span class="profile-label">Origin</span><span class="profile-value">${originLabel}</span></div>
						<div class="profile-field"><span class="profile-label">Motivation</span><span class="profile-value">${motivLabel}</span></div>
						<div class="profile-field full"><span class="profile-label">Trait</span><span class="profile-value">${traitArr.join(', ') || '—'}</span></div>
					</div>
					<div class="profile-section-header">Skills <span class="profile-section-sub">(see Skills tab for progress)</span></div>
					${skillEntries.length
						? skillEntries.map(([s, d]) => {
							const icon = SKILL_ICONS[s] || '🔹';
							return `<div class="profile-skill-row"><span>${icon} ${s}</span><span class="profile-skill-lv">Lv ${d.level}</span></div>`;
						}).join('')
						: '<p><em>No skills yet.</em></p>'}
					<div class="profile-section-header">Level &amp; Experience</div>
					<div class="profile-grid">
						<div class="profile-field"><span class="profile-label">Level</span><span class="profile-value">${player.level}</span></div>
						<div class="profile-field"><span class="profile-label">Experience</span><span class="profile-value">${player.experience} / ${player.level * 100}</span></div>
						<div class="profile-field"><span class="profile-label">Gold</span><span class="profile-value">${player.gold} gp</span></div>
					</div>
					${player.ship ? `<div class="profile-section-header">Vessel</div>
						<div class="profile-grid">
							<div class="profile-field"><span class="profile-label">Name</span><span class="profile-value">⚓ ${player.ship.name}</span></div>
							<div class="profile-field"><span class="profile-label">Type</span><span class="profile-value">${player.ship.type}</span></div>
							<div class="profile-field full item-wear-field">
								<span class="profile-label">Hull</span>
								<span class="profile-value">
									<div class="item-wear-bar"><div class="item-wear-fill" style="width:${Math.round(player.ship.wear)}%;background:${player.ship.wear >= 75 ? '#27ae60' : player.ship.wear >= 50 ? '#2980b9' : player.ship.wear >= 25 ? '#d68910' : '#c0392b'}"></div></div>
									<span class="item-wear-label" style="color:${player.ship.wear >= 75 ? '#27ae60' : player.ship.wear >= 50 ? '#2980b9' : player.ship.wear >= 25 ? '#d68910' : '#c0392b'}">${getConditionFromWear(player.ship.wear)} — ${Math.round(player.ship.wear)}%</span>
								</span>
							</div>
							<div class="profile-field full"><span class="profile-label">Moored</span><span class="profile-value">${(typeof PORTS !== 'undefined' && PORTS[player.ship.homePort]?.name) || player.ship.homePort}</span></div>
						</div>` : ''}
					${(() => {
							const mor = player.morality || 0;
							const tier = getMoralityTier(mor);
							const pct = Math.abs(mor);
							const isPos = mor >= 0;
							const barFill = isPos
								? `<div class="mor-bar-fill mor-pos-fill" style="width:${pct}%"></div>`
								: `<div class="mor-bar-fill mor-neg-fill" style="width:${pct}%"></div>`;
							return `<div class="profile-section-header">Morality</div>
							<div class="morality-display">
								<div class="mor-tier-name" style="color:${tier.color}">${tier.name}</div>
								<div class="mor-bar-wrap">
									<div class="mor-bar-half mor-neg-half">${!isPos ? barFill : ''}</div>
									<div class="mor-bar-center"></div>
									<div class="mor-bar-half mor-pos-half">${isPos ? barFill : ''}</div>
								</div>
								<div class="mor-score-label">${mor > 0 ? '+' : ''}${mor} / 100</div>
							</div>`;
						})()}
					${(() => {
							const hope = player.hope ?? 0;
							const hopeTier = getHopeTier(hope);
							const hopePct = Math.abs(hope);
							const isHopePos = hope >= 0;
							const hopeBarFill = isHopePos
								? `<div class="hope-bar-fill hope-pos-fill" style="width:${hopePct}%"></div>`
								: `<div class="hope-bar-fill hope-neg-fill" style="width:${hopePct}%"></div>`;
							return `<div class="profile-section-header">Spirit</div>
							<div class="hope-display">
								<div class="hope-tier-name" style="color:${hopeTier.color}">${hopeTier.name}</div>
								<div class="hope-bar-wrap">
									<div class="hope-bar-half hope-neg-half">${!isHopePos ? hopeBarFill : ''}</div>
									<div class="hope-bar-center"></div>
									<div class="hope-bar-half hope-pos-half">${isHopePos ? hopeBarFill : ''}</div>
								</div>
								<div class="hope-score-label">${hope > 0 ? '+' : ''}${hope} / 100</div>
								<div class="hope-desc">${hopeTier.desc}</div>
							</div>`;
						})()}
					<div class="profile-section-header">Titles <span class="profile-section-sub">${player.activeTitle ? '— wearing: <em>' + ((player.titles || []).find(t => t.id === player.activeTitle)?.name || player.activeTitle) + '</em>' : '— none worn'}</span></div>
					${(() => {
						const earned = player.titles || [];
						if (!earned.length) return '<p><em>No titles earned yet.</em></p>';
						return earned.map(t => {
							const active = t.id === player.activeTitle;
							const bonusParts = [];
							if (t.bonus?.rollBonus) bonusParts.push(`+${t.bonus.rollBonus} all rolls`);
							if (t.bonus?.skillMods) Object.entries(t.bonus.skillMods).forEach(([sk, v]) => bonusParts.push(`${v > 0 ? '+' : ''}${v} ${sk}`));
							const bonusStr = bonusParts.length ? bonusParts.join(', ') : 'No bonus';
							return `<div class="title-row${active ? ' title-active' : ''}" data-title-id="${t.id}" title="${t.description || ''}">
								<span class="title-name">${t.name}</span>
								<span class="title-bonus">${bonusStr}</span>
								<button class="title-equip-btn" data-title-id="${t.id}">${active ? 'Remove' : 'Wear'}</button>
							</div>`;
						}).join('');
					})()}`;
			}

			// Populate sidebar skills grid
			const SKILL_ICONS = {
				// Combat
				'Swordsmanship': '⚔️',
				'Archery':       '🏹',
				'Axes':          '🪓',
				'Spears':        '🔱',
				'Polearms':      '⚜️',
				'Brawling':      '👊',
				// Wilderness & Survival
				'Survival':      '🌿',
				'Hunting':       '🦌',
				'Foraging':      '🍄',
				'Tracking':      '🐾',
				'Fire-making':   '🔥',
				'Fishing':       '🎣',
				'Herbalism':     '🌱',
				// Crafts & Trades
				'Crafting':      '🛠️',
				'Smithing':      '⚒️',
				'Fletching':     '🪶',
				'Alchemy':       '⚗️',
				'Cooking':       '🍳',
				'Brewing':       '🍺',
				'Sewing':        '🧵',
				'Carpentry':     '🪚',
				'Mining':        '⛏️',
				// Magic
				'Light Magic':   '✨',
				'Black Magic':   '💀',
				'Blood Magic':   '🩸',
				// Social & Knowledge
				'Persuasion':    '🗣️',
				'Negotiating':   '🤝',
				'Healing':       '❤️',
				'Decrypting':    '🔐',
				// Roguish
				'Stealth':       '🌑',
				'Lockpicking':   '🗝️',
				'Thievery':      '🖐️',
				// Trades & Professions
				'Animal Handling': '🐴',
				'Navigation':      '🧭',
				'Artistry':        '🎨',
				'Mysticism':       '🔮',
			};

			function updateSkillsGrid() {
				const slots = document.querySelectorAll('#skills-grid .skill-slot');
				const skills = Object.entries(player.skills || {})
					.sort((a, b) => (b[1].level || 1) - (a[1].level || 1));
				slots.forEach((slot, i) => {
					if (i < skills.length) {
						const [name, data] = skills[i];
						const icon = SKILL_ICONS[name] || '🔹';
						slot.classList.add('has-skill');
						slot.innerHTML = `<span class="skill-slot-icon">${icon}</span><span class="skill-slot-level">Lv ${data.level}</span>`;
						slot.title = `${name} (Lv ${data.level})`;
					} else {
						slot.classList.remove('has-skill');
						slot.innerHTML = '';
						slot.title = '';
					}
				});
			}

// 6.4 · Change Stamina / Life
function changeStamina(amount) {
  player.stamina = Math.max(0, Math.min(player.maxStamina, player.stamina + amount));
  updateTopStats();
  if (amount > 0) {
    addStory(`+${amount} stamina.`);
  } else if (amount < 0) {
    addStory(`${amount} stamina.`);  // negative already shows "-"
  }
}

function changeLife(amount) {
  if (amount < 0 && player.equipped?.pendant === "Aelindra's Pendant") {
    amount = Math.ceil(amount * 0.85);
  }
  const prevLife = player.life || 0;
  player.life    = Math.max(0, Math.min(player.maxLife, prevLife + amount));
  updateTopStats();
  if (amount > 0) {
    addStory(`+${amount} life.`);
  } else if (amount < 0) {
    addStory(`${amount} life.`);
    // Track near-deaths (dropped to ≤10% of max from a higher state)
    const threshold = Math.floor((player.maxLife || 100) * 0.10);
    if (player.life <= threshold && prevLife > threshold) {
      if (!player.traitCounters) player.traitCounters = {};
      player.traitCounters.nearDeaths = (player.traitCounters.nearDeaths || 0) + 1;
      checkTraitUnlocks?.();
    }
    // Incapacitation outside combat — soft death
    if (player.life <= 0 && !combatState) {
      player.life = Math.floor((player.maxLife || 100) * 0.10);
      addStory('💀 You collapse from your injuries. When you come to, you are badly wounded and alone.');
      applyCondition?.('injured',   10);
      applyCondition?.('exhausted',  5);
      // Lose a portion of gold
      const lost = Math.floor((player.gold || 0) * 0.20);
      if (lost > 0) { player.gold = Math.max(0, player.gold - lost); addStory(`You were robbed while unconscious — ${lost}g gone.`); }
      updateTopStats();
      renderConditions?.();
    }
  }
}

function changeMana(amount) {
  if (!player.maxMana) player.maxMana = 50;
  player.mana = Math.max(0, Math.min(player.maxMana, (player.mana || 0) + amount));
  updateTopStats();
  if (amount > 0)      addStory(`+${amount} mana.`);
  else if (amount < 0) addStory(`${amount} mana.`);
}

// 6.5 · Item Lookup & Formatting
function findItemInDatabase(name) {
  for (const category of Object.values(Items)) {
    if (category[name]) return category[name];
  }
  return null;
}

function formatEffect(effect) {
  if (!effect || typeof effect !== 'object') return 'None';
  return Object.entries(effect)
    .map(([k, v]) => `${capitalize(k)}: ${v}`)
    .join(', ');
}

// 6.6 · Update Inventory UI
			function updateInventory() {
				const inv = document.getElementById('inventory-list'),
					campView = document.getElementById('camp-supplies-inv-view'),
					arrowBtn = document.getElementById('inv-view-arrow'),
					details = document.getElementById('item-details'),
					eq = document.getElementById('equipped-items'),
					num = document.getElementById('number-of-items'),
					total = document.getElementById('total-weight'),
					gold = document.getElementById('inventory-gold');

				// Determine if player is at their camp
				const atCamp = campSetup && player.campLocation && player.campLocation === player.currentLocation;
				// Only reset camp view when leaving camp; pouch views persist regardless
				if (!atCamp && _invView === 'camp') _invView = 'inventory';
				if (!_hasHerbPouch()       && _invView === 'herb_pouch')       _invView = 'inventory';
				if (!_hasIngredientPouch() && _invView === 'ingredient_pouch') _invView = 'inventory';

				// Show/hide view toggle arrow — visible whenever there's an alternate view
				const _hasPouches = _hasHerbPouch() || _hasIngredientPouch();
				if (arrowBtn) {
					arrowBtn.style.display = (atCamp || _hasPouches) ? '' : 'none';
					// Label shows next destination in cycle
					const _views = ['inventory'];
					if (_hasHerbPouch())       _views.push('herb_pouch');
					if (_hasIngredientPouch()) _views.push('ingredient_pouch');
					if (atCamp) _views.push('camp');
					const _nextIdx  = (_views.indexOf(_invView) + 1) % _views.length;
					const _nextView = _views[_nextIdx];
					const _nextLabels = { inventory: '▶ Inventory', herb_pouch: '▶ Herbs', ingredient_pouch: '▶ Ingredients', camp: '▶ Camp' };
					arrowBtn.textContent = _nextView === 'inventory' ? '◀ Inventory' : _nextLabels[_nextView];
				}

				// Camp supplies view
				if (campView) {
					if (_invView === 'camp') {
						campView.style.display = '';
						if (inv) inv.style.display = 'none';
						const supplies = (player.campSupplies || []).filter(s => (s.quantity ?? 0) > 0);
						const max = 40;
						let cHtml = supplies.map((s, i) => {
							const iconSrc = _getItemIcon(s.name);
							return `<div class="inventory-item" data-supply="${s.name}" data-index="${i}">
                        <img src="${iconSrc}" alt="${s.name}" class="inv-item-icon" onerror="this.style.display='none'">
                        ${s.quantity > 1 ? `<span class="inv-qty-badge">${s.quantity}</span>` : ''}
                      </div>`;
						}).join('');
						for (let i = supplies.length; i < max; i++) cHtml += `<div class="inventory-item empty" data-index="${i}"></div>`;
						campView.innerHTML = cHtml;

						// Tooltip on camp supply items
						campView.querySelectorAll('.inventory-item').forEach(el => {
							el.addEventListener('mouseenter', e => {
								const name = el.dataset.supply;
								if (!name) return;
								const tip = document.getElementById('tooltip');
								if (!tip) return;
								const sup = (player.campSupplies || []).find(s => s.name === name);
								tip.innerHTML = `<strong>${name}</strong><br>Qty: ${sup?.quantity ?? 0}`;
								tip.style.display = 'block';
								const vpW = window.innerWidth, tipW = tip.offsetWidth || 200;
								tip.style.left = `${Math.min(e.clientX + 14, vpW - tipW - 8)}px`;
								tip.style.top  = `${e.clientY + 14}px`;
							});
							el.addEventListener('mouseleave', () => {
								const tip = document.getElementById('tooltip');
								if (tip) tip.style.display = 'none';
							});
						});
					} else {
						campView.style.display = 'none';
						if (inv) inv.style.display = '';
					}
				}

				// Pouch content views
				const _pouchViewTypes = { herb_pouch: 'herb', ingredient_pouch: 'ingredient' };
				const _pouchViewType  = _pouchViewTypes[_invView];
				if (_pouchViewType) {
					campView.style.display = '';
					if (inv) inv.style.display = 'none';
					const pItems = Object.entries(player.pouchContents?.[_pouchViewType] || {});
					const max = 40;
					let cHtml = pItems.map(([n, qty]) => {
						const iconSrc = _getItemIcon(n);
						return `<div class="inventory-item" data-pouch-item="${n}">
							<img src="${iconSrc}" alt="${n}" class="inv-item-icon" onerror="this.style.display='none'">
							${qty > 1 ? `<span class="inv-qty-badge">${qty}</span>` : ''}
						</div>`;
					}).join('');
					for (let i = pItems.length; i < max; i++) cHtml += `<div class="inventory-item empty"></div>`;
					campView.innerHTML = cHtml;
					campView.querySelectorAll('[data-pouch-item]').forEach(el => {
						el.addEventListener('mouseenter', e => {
							const tip = document.getElementById('tooltip');
							if (!tip) return;
							const n = el.dataset.pouchItem;
							tip.innerHTML = `<strong>${n}</strong><br>Qty: ${player.pouchContents?.[_pouchViewType]?.[n] ?? 0}`;
							tip.style.display = 'block';
							const vpW = window.innerWidth, tipW = tip.offsetWidth || 200;
							tip.style.left = `${Math.min(e.clientX + 14, vpW - tipW - 8)}px`;
							tip.style.top  = `${e.clientY + 14}px`;
						});
						el.addEventListener('mouseleave', () => { const tip = document.getElementById('tooltip'); if (tip) tip.style.display = 'none'; });
					});
					_updateInvSidebar();
					return;
				}

				if (_invView === 'camp') {
					_updateInvSidebar();
					return; // skip normal inventory rendering
				}

				const allItems = Object.keys(player.inventory);
				const _equippedSet = new Set(Object.values(player.equipped).filter(Boolean));
				const items = allItems.filter(it => !_isAmmoItem(it) && !_equippedSet.has(it));
				const max = 40;
				let html = items.map((it, i) => {
					const eqd = Object.values(player.equipped).includes(it) ? 'equipped' : '';
					const iconSrc = _getItemIcon(it);
					const qty = player.inventory[it].quantity;
					return `<div class="inventory-item ${selectedItem===it?'selected':''} ${eqd}"
                   data-item="${it}" data-index="${i}" draggable="true">
                <img src="${iconSrc}" alt="${it}" class="inv-item-icon" onerror="this.style.display='none'">
                ${qty > 1 ? `<span class="inv-qty-badge">${qty}</span>` : ''}
              </div>`;
				}).join('');
				for (let i = items.length; i < max; i++) html += `<div class="inventory-item empty" data-index="${i}"></div>`;
				inv.innerHTML = html;
				_updateInvSidebar();

document.querySelectorAll('#inventory-list .inventory-item').forEach(el => {
  el.onclick = () => {
    const it = el.dataset.item,
          idx = +el.dataset.index;
    if (it) {
      selectedItem = it;
      selectedItemIndex = idx;
      _showItemDetails(it);
      updateInventory();
    } else if (selectedItem !== null) {
      const from = selectedItemIndex,
            to = idx,
            entries = Object.entries(player.inventory);
      const [mi, md] = entries.splice(from, 1)[0];
      entries.splice(to, 0, [mi, md]);
      player.inventory = Object.fromEntries(entries);
      selectedItem = selectedItemIndex = null;
      updateInventory();
    }
  };

  // Drag from inventory to quick slot
  el.addEventListener('dragstart', e => {
    const it = el.dataset.item;
    if (!it) { e.preventDefault(); return; }
    e.dataTransfer.setData('item-name', it);
    e.dataTransfer.setData('qs-from-slot', '');
  });

  // Right-click context menu
  el.addEventListener('contextmenu', e => {
    const it = el.dataset.item;
    if (!it) return;
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    if (!menu) return;
    menu.innerHTML = '';

    // Keep menu within viewport
    const vpW = window.innerWidth, vpH = window.innerHeight;
    menu.style.display = 'block';
    const mW = menu.offsetWidth || 160, mH = menu.offsetHeight || 160;
    menu.style.left = `${Math.min(e.pageX, vpW - mW - 8)}px`;
    menu.style.top  = `${Math.min(e.pageY, vpH - mH - 8)}px`;

    const d      = player.inventory[it] || {};
    const dbItem = (typeof findItemInDatabase === 'function' && findItemInDatabase(it)) || {};
    const type   = d.type || dbItem.type || '';
    const wearable = d.wearable || dbItem.wearable || (type === 'weapon' || type === 'armor');
    const isEquipped = Object.values(player.equipped || {}).includes(it);
    const isConsumable = type === 'food' || type === 'potion' || type === 'recipe_scroll' || (type === 'material' && !!(d.consumable || dbItem.consumable));

    const addOpt = (label, fn) => {
      const div = document.createElement('div');
      div.className = 'context-menu-option';
      div.textContent = label;
      div.onclick = () => { menu.style.display = 'none'; fn(); };
      menu.appendChild(div);
    };

    // Inspect — shows the item detail panel
    addOpt('🔍 Inspect', () => {
      selectedItem = it;
      _showItemDetails(it);
    });

    // Equip / Unequip
    if (wearable) {
      if (isEquipped) {
        addOpt('↩ Unequip', () => {
          Object.keys(player.equipped).filter(s => player.equipped[s] === it).forEach(s => { player.equipped[s] = null; });
          addStory(`Unequipped ${it}.`);
          updateInventory();
        });
      } else {
        addOpt('⚔ Equip', () => {
          const slot = (typeof _getEquipSlot === 'function') ? _getEquipSlot(it, type) : 'rightHand';
          Object.keys(player.equipped).filter(s => player.equipped[s] === it).forEach(s => { player.equipped[s] = null; });
          player.equipped[slot] = it;
          addStory(`Equipped ${it}.`);
          updateInventory();
        });
      }
    }

    // Use / Eat / Drink
    if (isConsumable) {
      const useLabel = type === 'food' ? '🍽️ Eat' : type === 'recipe_scroll' ? '📜 Read' : '🧪 Drink';
      addOpt(useLabel, () => {
        if (type === 'recipe_scroll') {
          const recipeName = d.recipeName || it.replace(/^Recipe:\s*/i, '');
          if (typeof learnRecipe === 'function') learnRecipe(recipeName);
          removeItem(it, 1);
          addStory(`📜 You study the scroll and learn the recipe for ${recipeName}.`);
        } else {
          if (typeof eatItem === 'function') eatItem(it);
        }
        updateInventory();
      });
    }

    // Assign to Quick Slot
    addOpt('📌 Assign to Quick Slot', () => {
      if (!player.quickSlots) player.quickSlots = Array(10).fill(null);
      const idx = player.quickSlots.indexOf(null);
      if (idx === -1) {
        addStory('⚠️ All quick slots are full. Drag an item out first.');
      } else {
        player.quickSlots[idx] = it;
        if (typeof renderQuickSlots === 'function') renderQuickSlots();
        addStory(`📌 ${it} assigned to slot ${idx === 9 ? 0 : idx + 1}.`);
      }
    });

    // Drop
    addOpt('🗑 Drop', () => {
      Object.keys(player.equipped).filter(s => player.equipped[s] === it).forEach(s => { player.equipped[s] = null; });
      removeItem(it, 1);
      updateInventory();
    });

    const dismiss = ev => { if (!menu.contains(ev.target)) { menu.style.display = 'none'; document.removeEventListener('click', dismiss); } };
    document.addEventListener('click', dismiss);
  });

  // Hover tooltip
  el.addEventListener('mouseenter', e => {
    const it = el.dataset.item;
    if (!it) return;
    const tip = document.getElementById('tooltip');
    if (!tip) return;
    const d = player.inventory[it] || {};
    const db = (typeof findItemInDatabase === 'function' && findItemInDatabase(it)) || {};
    const type = d.type || db.type || '';
    const desc = d.description || db.description || '';
    const qty  = d.quantity || 1;
    let lines = [`<strong>${it}</strong>`];
    if (type)  lines.push(`<em>${capitalize(type)}</em>`);
    if (qty > 1) lines.push(`Quantity: ${qty}`);
    if (db.attack)  lines.push(`Attack: +${db.attack}`);
    if (db.defense) lines.push(`Defense: +${db.defense}`);
    if (db.heal)    lines.push(`Heals: ${db.heal} life`);
    if (db.stamina) lines.push(`Restores: ${db.stamina} stamina`);
    if (desc)  lines.push(`<span style="opacity:.85">${desc}</span>`);
    tip.innerHTML = lines.join('<br>');
    tip.style.display = 'block';
    const vpW = window.innerWidth, tipW = tip.offsetWidth || 260;
    tip.style.left = `${Math.min(e.clientX + 14, vpW - tipW - 8)}px`;
    tip.style.top  = `${e.clientY + 14}px`;
  });
  el.addEventListener('mousemove', e => {
    const tip = document.getElementById('tooltip');
    if (tip && tip.style.display !== 'none') {
      const vpW = window.innerWidth, tipW = tip.offsetWidth || 260;
      tip.style.left = `${Math.min(e.clientX + 14, vpW - tipW - 8)}px`;
      tip.style.top  = `${e.clientY + 14}px`;
    }
  });
  el.addEventListener('mouseleave', () => {
    const tip = document.getElementById('tooltip');
    if (tip) tip.style.display = 'none';
  });
				});

				// equipped
				eq.innerHTML = `
      <div class="equip-col equip-col-left">
        <div class="equipped-item-slot" id="headwear"    data-slot="headwear">Headwear</div>
        <div class="equipped-item-slot" id="torsoLayer1" data-slot="torsoLayer1">Torso Layer 1</div>
        <div class="equipped-item-slot" id="torsoLayer2" data-slot="torsoLayer2">Torso Layer 2</div>
        <div class="equipped-item-slot" id="legwear"     data-slot="legwear">Legwear</div>
        <div class="equipped-item-slot" id="footwear"    data-slot="footwear">Footwear</div>
        <div class="equipped-item-slot" id="rightHand"   data-slot="rightHand">Right Hand</div>
      </div>
      <div class="equip-character"><img src="images/character.png" alt=""></div>
      <div class="equip-col equip-col-right">
        <div class="equipped-item-slot" id="shoulderwear" data-slot="shoulderwear">Shoulderwear</div>
        <div class="equipped-item-slot" id="cape"         data-slot="cape">Cape</div>
        <div class="equipped-item-slot" id="torsoLayer3"  data-slot="torsoLayer3">Torso Layer 3</div>
        <div class="equipped-item-slot" id="armwear"      data-slot="armwear">Armwear</div>
        <div class="equipped-item-slot" id="footwear2"    data-slot="footwear2">Footwear</div>
        <div class="equipped-item-slot" id="leftHand"     data-slot="leftHand">Left Hand</div>
      </div>
      <div class="equip-pendant-row">
        <div class="equipped-item-slot" id="pendant" data-slot="pendant">Pendant</div>
      </div>`;

				const _SLOT_LABELS = {
					headwear: 'Head', torsoLayer1: 'Torso 1', torsoLayer2: 'Torso 2', torsoLayer3: 'Torso 3',
					legwear: 'Legs', footwear: 'Feet', footwear2: 'Feet 2', rightHand: 'R.Hand',
					leftHand: 'L.Hand', shoulderwear: 'Shoulder', cape: 'Cape', armwear: 'Arms',
					pendant: 'Pendant',
				};
				document.querySelectorAll('#equipped-items .equipped-item-slot').forEach(el => {
					const slot = el.dataset.slot;
					const it   = player.equipped[slot];
					el.title   = it || _SLOT_LABELS[slot] || slot;
					if (it) {
						const iconSrc = _getItemIcon(it);
						el.innerHTML = `<img src="${iconSrc}" alt="${it}" class="equip-slot-icon" onerror="this.style.display='none'">`;
						el.classList.add('equipped');
					} else {
						el.innerHTML = `<span class="equip-slot-empty">${_SLOT_LABELS[slot] || slot}</span>`;
						el.classList.remove('equipped');
					}
				});

				document.querySelectorAll('.equipped-item-slot').forEach(el => {
					el.onclick = () => {
						const slot = el.dataset.slot;
						if (selectedItem) {
							Object.keys(player.equipped)
								.filter(s => player.equipped[s] === selectedItem)
								.forEach(s => player.equipped[s] = null);
							player.equipped[slot] = selectedItem;
							selectedItem = selectedItemIndex = null;
							updateInventory();
						}
					};
				});

				num.textContent = items.length;

const weight = calculateTotalWeight();
const carryPct = (weight / player.maxCarryWeight) * 100;

// Weight display — visual only, no story spam
if (carryPct >= 100) {
  total.textContent = `⚠️ ${weight} / ${player.maxCarryWeight} lbs — OVERLOADED`;
  total.style.color = 'red';
} else if (carryPct >= 75) {
  total.textContent = `⚠️ ${weight} / ${player.maxCarryWeight} lbs`;
  total.style.color = 'orange';
} else {
  total.textContent = `${weight} / ${player.maxCarryWeight} lbs`;
  total.style.color = '';
}
_updateCarryConditions(carryPct);

// Update gold display
gold.textContent = player.gold;
renderMapsPanel();
			}

			function _showItemDetails(name) {
				const details = document.getElementById('item-details');
				if (!details) return;
				const d      = player.inventory[name];
				if (!d) { details.innerHTML = ''; return; }
				const dbItem = findItemInDatabase(name) || {};
				const type   = d.type || dbItem.type || '';
				const isEquipped = Object.values(player.equipped).includes(name);
				const wearable   = d.wearable ?? dbItem.wearable ?? (type === 'weapon' || type === 'armor');

				const btns = [];
				if (type === 'food')          btns.push(`<button class="inv-action-btn" data-action="use">🍽️ Eat</button>`);
				if (type === 'potion')        btns.push(`<button class="inv-action-btn" data-action="use">🧪 Drink</button>`);
				if (type === 'recipe_scroll') btns.push(`<button class="inv-action-btn" data-action="use">📜 Read</button>`);
				if (type === 'map')           btns.push(`<button class="inv-action-btn" data-action="study">🗺️ Study</button>`);
				if (wearable) {
					if (isEquipped) btns.push(`<button class="inv-action-btn" data-action="unequip">↩ Unequip</button>`);
					else            btns.push(`<button class="inv-action-btn" data-action="equip">⚔ Equip</button>`);
				}
				btns.push(`<button class="inv-action-btn inv-action-drop" data-action="drop">🗑 Drop</button>`);

				const iconSrc = _getItemIcon(name);
				const rarityKey = (d.rarity || dbItem.rarity || 'common').toLowerCase();
				const rarityData = (typeof itemRarity !== 'undefined' && itemRarity[rarityKey]) || { label: d.rarity || dbItem.rarity || 'Common', color: '#5c3a1e' };
				const effectStr  = formatEffect(d.effect || dbItem.baseEffect);

				// Wear bar — only shown for items that can have wear (weapons/armor or items with a wear value)
				const itemWear    = typeof d.wear === 'number' ? d.wear
				                  : (LEGACY_CONDITION_WEAR[d.condition] ?? null);
				const condTier    = itemWear !== null ? getConditionFromWear(itemWear) : null;
				const wearColor   = itemWear === null ? '#888'
				                  : itemWear >= 75 ? '#27ae60'
				                  : itemWear >= 50 ? '#2980b9'
				                  : itemWear >= 25 ? '#d68910'
				                  : '#c0392b';
				const wearPct     = itemWear !== null ? Math.round(itemWear) : null;
				const wearBarHTML = wearPct !== null
					? `<div class="item-wear-bar"><div class="item-wear-fill" style="width:${wearPct}%;background:${wearColor}"></div></div><span class="item-wear-label" style="color:${wearColor}">${condTier} — ${wearPct}%</span>`
					: '—';

				const rarityClass = `item-rarity-${(d.rarity || dbItem.rarity || 'common').toLowerCase()}`;
				const statFields = [
					{ label: 'Type',      value: type ? (type.charAt(0).toUpperCase() + type.slice(1)) : '—' },
					{ label: 'Condition', value: wearBarHTML, isHtml: true },
					{ label: 'Quantity',  value: d.quantity },
					{ label: 'Weight',    value: (d.weight ?? dbItem.weight ?? 0) + ' lbs' },
					{ label: 'Value',     value: (d.value ?? dbItem.value ?? 0) + ' gold' },
					{ label: 'Effect',    value: effectStr || '—' },
				].map(f => `<div class="profile-field${f.isHtml ? ' item-wear-field' : ''}">
					<span class="profile-label">${f.label}</span>
					<span class="profile-value">${f.value}</span>
				</div>`).join('');

				details.innerHTML = `
					<div class="item-detail-header">
						<img src="${iconSrc}" alt="${name}" class="item-detail-icon" onerror="this.style.display='none'">
						<div class="item-detail-title">
							<h3 class="item-detail-name">${name}</h3>
							<span class="item-rarity-tag ${rarityClass}">${rarityData.label}</span>
						</div>
					</div>
					<div class="profile-grid item-stat-grid">${statFields}</div>
					<div class="profile-field item-desc-field">
						<span class="profile-label">Description</span>
						<span class="profile-value item-desc-text">${d.description || dbItem.description || 'No description.'}</span>
					</div>
					<div class="inv-action-bar">${btns.join('')}</div>
				`;

				details.querySelectorAll('.inv-action-btn').forEach(btn => {
					btn.onclick = e => {
						e.stopPropagation();
						const action = btn.dataset.action;
						if (action === 'study' && type === 'map') {
							details.innerHTML = '';
							selectedItem = selectedItemIndex = null;
							// Switch to story pane so the progress bar is visible
							if (typeof bookSwitchSection === 'function') bookSwitchSection('story');
							(async () => {
								const bar = startContinuousProgress(4000, `Studying ${name}…`);
								await bar.wait(1500); bar.setLabel('Tracing the routes and landmarks…');
								await bar.wait(1500); bar.setLabel('Committing the kingdoms to memory…');
								await bar.wait(1000);
								// Reveal: all kingdoms for Estranta map, single kingdom for regional maps
								const estranta = /estranta/i.test(name);
								if (estranta) {
									const allKingdoms = (typeof kingdoms !== 'undefined' && Array.isArray(kingdoms))
										? kingdoms.map(k => k.name).filter(Boolean)
										: [];
									if (allKingdoms.length) {
										allKingdoms.forEach(k => learnKingdom(k, true));
										addStory(`🗺️ You spread the map of Estranta before you. Every kingdom, every major road and settlement — committed to memory. The world is no longer a mystery.`);
										addWorldEvent('Studied the Map of Estranta — all kingdoms revealed.', 'exploration');
										if (typeof setupMap === 'function') setupMap();
									} else {
										addStory(`🗺️ You study the map carefully. The lands of Estranta take shape in your mind.`);
									}
								} else {
									const kingdomName = name.replace(/^Map of\s+/i, '');
									learnKingdom(kingdomName);
								}
							})();
						} else if (action === 'use' && type === 'recipe_scroll') {
							const recipeName = d.recipeName || name.replace(/^Recipe:\s*/i, '');
							learnRecipe(recipeName);
							removeItem(name, 1);
							addStory(`📜 You study the scroll and learn the recipe for ${recipeName}.`);
							selectedItem = selectedItemIndex = null;
							details.innerHTML = '';
						} else if (action === 'use') {
							eatItem(name);
							selectedItem = selectedItemIndex = null;
							details.innerHTML = '';
						} else if (action === 'equip') {
							const slot = _getEquipSlot(name, type);
							Object.keys(player.equipped).filter(s => player.equipped[s] === name).forEach(s => { player.equipped[s] = null; });
							player.equipped[slot] = name;
							addStory(`Equipped ${name}.`);
							selectedItem = selectedItemIndex = null;
							updateInventory();
						} else if (action === 'unequip') {
							Object.keys(player.equipped).filter(s => player.equipped[s] === name).forEach(s => { player.equipped[s] = null; });
							addStory(`Unequipped ${name}.`);
							selectedItem = selectedItemIndex = null;
							updateInventory();
						} else if (action === 'drop') {
							Object.keys(player.equipped).filter(s => player.equipped[s] === name).forEach(s => { player.equipped[s] = null; });
							removeItem(name, 1);
							selectedItem = selectedItemIndex = null;
							details.innerHTML = '';
						}
					};
				});
			}

function renderMapsPanel() {
  const listEl = document.getElementById('maps-list');
  if (!listEl) return;
  const maps = Object.entries(player.inventory).filter(([, v]) => v.type === 'map');
  if (!maps.length) {
    listEl.innerHTML = '<span class="maps-empty">No maps acquired.</span>';
    return;
  }
  listEl.innerHTML = maps.map(([name]) => {
    const kingdom = name.replace(/^Map of /, '');
    const known   = (player.knownKingdoms || {})[kingdom];
    return `<div class="map-badge${known ? ' map-badge--active' : ''}" title="${name}">
      🗺️ <span>${kingdom}</span>${known ? ' ✓' : ''}
    </div>`;
  }).join('');
}

// 6.7 · Calculate Total Carry Weight
function _updateCarryConditions(carryPct) {
  if (!player.conditions) player.conditions = [];
  player.conditions = player.conditions.filter(c => c.id !== 'encumbered' && c.id !== 'overloaded');
  if      (carryPct >= 100) player.conditions.push({ id: 'overloaded',  duration: 999 });
  else if (carryPct >= 75)  player.conditions.push({ id: 'encumbered',  duration: 999 });
  renderConditions();
}

function calculateTotalWeight() {
  return Object.entries(player.inventory).reduce((sum, [itemName, itemData]) => {
    const dbItem = findItemInDatabase(itemName) || {}; // look up full item info
    const weight = itemData.weight ?? dbItem.weight ?? 0; // prioritize player's value, else database
    return sum + (weight * (itemData.quantity || 1));
  }, 0);
}

// 6.8 · Story Log (scroll mode — single page, no pagination)
function _storyPageFull(s) {
  return false;
}

function _storyAddEntry(s, html) {
  s.insertAdjacentHTML('beforeend', html);
  s.scrollTop = s.scrollHeight;
  bookState.story.pages[bookState.story.current] = s.innerHTML;
  return s.lastElementChild;
}

function _insertStoryDivider() {
  if (bookState.silentMode) return;
  const s = document.getElementById('story');
  if (!s || !s.children.length) return;
  if (s.lastElementChild?.classList?.contains('story-divider')) return;
  const d = document.createElement('div');
  d.className = 'story-divider';
  s.appendChild(d);
  s.scrollTop = s.scrollHeight;
  if (bookState.story?.pages) bookState.story.pages[bookState.story.current] = s.innerHTML;
}

// Staggered story queue — entries appear 130 ms apart so rapid-fire messages read cleanly.
let _storyQueue = [];
let _storyQueueTimer = null;
function _drainStoryQueue() {
  if (!_storyQueue.length) { _storyQueueTimer = null; return; }
  const { s, html } = _storyQueue.shift();
  _storyAddEntry(s, html);
  _storyQueueTimer = setTimeout(_drainStoryQueue, 130);
}
function _queueStory(s, html) {
  _storyQueue.push({ s, html });
  if (!_storyQueueTimer) _storyQueueTimer = setTimeout(_drainStoryQueue, 0);
}

function addStory(txt) {
  const s = document.getElementById('story');
  if (!player.storyLog) player.storyLog = [];
  player.storyLog.push(txt);
  if (!bookState.silentMode) _storyDirtySinceWheel = true;
  _queueStory(s, `<p>&gt; ${txt}</p>`);
}

// Renders narration without the "> " prefix — for AI-authored text or atmospheric prose.
function addNarration(txt) {
  const s = document.getElementById('story');
  if (!player.storyLog) player.storyLog = [];
  player.storyLog.push(`[narration] ${txt}`);
  if (!bookState.silentMode) _storyDirtySinceWheel = true;
  _queueStory(s, `<p class="narration">${txt}</p>`);
}

// 6.9 · User Input
			function submitUserInput() {
				const i = document.getElementById('user-input');
				const v = i.value.trim();
				i.value = '';
				if (!v) return;
				addStory(v);
				handleUserInput(v);
				inputBox.classList.remove('visible'); // when hiding
				wheel.style.display = 'flex';
				userInput.value = '';
			}

function handleUserInput(input) {
  const [cmd, ...rest] = input.toLowerCase().split(' ');
  const arg = rest.join(' ');

  if (developerMode) {
    const devParts = input.trim().split(/\s+/);
    const devCmd = devParts.shift().toLowerCase();

    if (devCmd === 'additem:' && devParts.length >= 2) {
      const qty = parseInt(devParts.pop(), 10) || 1;
      const rawName = devParts.join(' ');

      // Find item in Items database regardless of case
      const matchedName = Object.entries(Items)
        .flatMap(([category, items]) => Object.keys(items))
        .find(dbName => dbName.toLowerCase() === rawName.toLowerCase());

      if (!matchedName) {
        addStory(`⚠️ Item "${rawName}" not found in database. Check spelling or capitalization.`);
      } else {
        addItem(matchedName, qty);
      }

      return;
    }

    if (devCmd === 'economy') {
      _devShowEconomy();
      return;
    }

    if (devCmd === 'npcs') {
      _devShowNPCs();
      return;
    }

    if (devCmd === 'fillstamina') {
changeStamina(player.maxStamina - player.stamina);
      addStory(`Stamina restored.`);
      return;
    }

    if (devCmd === 'filllife') {
      player.life = player.maxLife;
      updateTopStats();
      addStory(`Life restored.`);
      return;
    }
  }

  const skillName = inferSkillFromInput(input);
  const tier = performSkillCheck(skillName);
  const tierDesc = ['a disaster', 'poorly', 'adequately', 'well', 'masterfully'][tier - 1];
  addStory(`[${skillName}] You attempt to ${input} — and fare ${tierDesc}.`);

  updatePlayerStats();
}


// ============================================================
// SECTION 7 · CAMP SYSTEM
// ============================================================

// 7.1 · Camp Icon State Helpers
function setBuiltIcon(id, built) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.built = built ? 'true' : 'false';
  el.classList.toggle('unbuilt', !built);
}

function refreshEncampmentBuiltStates() {
  setBuiltIcon('campfire-button',  !!(player && player.hasCampfire));
  setBuiltIcon('shelter-button',   !!(player && (player.hasShelter || player.shelterLevel)));
  setBuiltIcon('defenses-button',  !!(player && player.hasDefenses));
}

// 7.2 · Supplies Found at Camp Setup
async function grantSetupFinds() {
  const tier = performSkillCheck('Survival');

  const found = [];
  const give = (name, qty) => {
    if (qty <= 0) return;
    if (typeof addCampSupply === 'function') {
      addCampSupply(name, qty);
    } else {
      const sup = player?.campSupplies;
      const arr = Array.isArray(sup) ? sup : (sup ? Object.values(sup) : []);
      let it = arr.find(x => x && x.name === name);
      if (!it) {
        if (!Array.isArray(player.campSupplies)) player.campSupplies = [];
        player.campSupplies.push({ name, quantity: qty });
      } else {
        it.quantity = (it.quantity ?? it.qty ?? 0) + qty;
      }
    }
    found.push(`${name} x${qty}`);
  };

  switch (tier) {
    case 1: break;
    case 2: give('Kindling', 1); break;
    case 3: give('Kindling', 1); give('Stone', 2); break;
    case 4: give('Small Wood Bundle', 1); give('Kindling', 1); give('Stone', 2); break;
    default: give('Small Wood Bundle', 1); give('Stick Bundle', 1); give('Kindling', 2); give('Stone', 3); break;
  }

  if (found.length) {
    if (typeof renderCampSupplies === 'function') renderCampSupplies();
    const rl = (typeof restLog !== 'undefined' && restLog) ? restLog : document.getElementById('rest-log');
    if (rl) rl.textContent = (rl.textContent ? rl.textContent + ' ' : '') + `You scavenge: ${found.join(', ')}.`;
    if (typeof addStory === 'function') addStory(`🧺 Found supplies: ${found.join(', ')}`);
  }
}

// ============================================================
// SECTION 8 · GATHERING & CRAFTING
// ============================================================

// 8.1 · Gather
async function handleGatherAttempt(opt) {
  const tool = opt.tool;
  const cost = opt.cost;
  player.consecutiveHuntFailures = 0;

  if (player.stamina < cost) {
    addStory("⚠️ You're too tired to gather.");
    return;
  }

  changeStamina(-cost);
  await runInlineProgress('Gathering...', 3000);

  const gatherSkill = opt.label.includes('Forage')   ? 'Foraging'    :
                      opt.label.includes('Kindling')  ? 'Fire-making' : 'Survival';
  const tier = performSkillCheck(gatherSkill);
  const fail = (tier === 1);
  const qty  = fail ? 0 : (tier >= 4 ? 3 : 1 + Math.floor(tier / 2));
  let itemName = null;

  if (opt.label.includes('Sticks'))          { itemName = 'Stick Bundle'; }
  else if (opt.label.includes('Small Logs')) { itemName = tier >= 2 ? 'Small Wood Bundle' : null; }
  else if (opt.label.includes('Large Logs')) { itemName = tier >= 3 ? 'Large Wood Bundle' : null; }
  else if (opt.label.includes('Stones'))     { itemName = 'Stone'; }
  else if (opt.label.includes('Kindling'))   { itemName = 'Kindling'; }
  else if (opt.label.includes('Branches'))   { itemName = 'Branch'; }
  else if (opt.label.includes('Forage')) {
    const results = [];
    if (tier >= 2) results.push('Wild Berries');
    if (tier >= 3) results.push('Edible Mushrooms');
    if (tier >= 4) results.push('Nuts');
    if (tier >= 5) results.push('Rare Herb');
    results.forEach(item => addItem(item, 1, { type: 'food', consumable: true, weight: 0.2, rarity: 'Common' }));
    addStory(results.length ? `🌿 You forage: ${results.join(', ')}.` : '🌿 You find nothing edible.');
    if (results.length) awardProfessionXp('gather');
    updateInventory();
    return;
  }

  if (!fail && itemName) {
    addCampSupply(itemName, qty);
    addStory(`🔹 Gathered ${qty} ${itemName}(s).`);
    awardProfessionXp('gather');
  } else {
    addStory('❌ Came back empty-handed.');
  }
  updateCampSuppliesGrid?.();
  saveGame(true);
}


// 8.2 · Burn Times & Fire
const woodBurnTimes = {
  'Stick Bundle': 30,
  'Small Wood Bundle': 60,
  'Large Wood Bundle': 120
};

// 8.3 · Sleep
async function performSleep() {
  const sleepDuration = 10000;
  const fadeDuration  = 1500;

  const fade = document.createElement('div');
  fade.id = 'sleep-fade';
  Object.assign(fade.style, {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'black', opacity: 0, zIndex: 9999,
    transition: `opacity ${fadeDuration / 1000}s ease`
  });
  document.body.appendChild(fade);
  requestAnimationFrame(() => { fade.style.opacity = 1; });

  const sleepPromise = runInlineProgress('Sleeping...', sleepDuration);
  setTimeout(() => {
    fade.style.opacity = 0;
    setTimeout(() => fade.remove(), fadeDuration);
  }, sleepDuration - fadeDuration);
  await sleepPromise;

  const tierS = performSkillCheck('Survival');
  let gain = 0;
  if (tierS === 1) {
    addStory('😱 Nightmares haunt you. No rest gained.');
    changeHope(-2, 'nightmares');
  } else if (tierS === 2) {
    addStory('🦝 Noisy critters disturb your slumber. No rest gained.');
    changeHope(-1, 'poor sleep');
  } else if (tierS === 3) {
    gain = Math.floor(player.maxStamina * 0.9) - player.stamina;
    changeStamina(Math.max(0, gain));
    addStory(`💤 Light sleep. Gained ${gain} stamina.`);
  } else if (tierS === 4) {
    gain = player.maxStamina - player.stamina;
    changeStamina(gain);
    addStory(`🛏️ Restful sleep. Well rested (+${gain} stamina).`);
    changeHope(1, 'good rest');
  } else {
    gain = player.maxStamina - player.stamina;
    changeStamina(gain);
    applyCondition('blessings', 6);
    addStory(`🌌 Dreamer's Blessing: you wake refreshed and inspired (+${gain} stamina).`);
    changeHope(3, 'dreamer\'s rest');
  }
  // Morality affects rest quality
  const _morScore = player.morality || 0;
  if (_morScore >= 40) {
    const lifeGain = Math.min(10, player.maxLife - player.life);
    if (lifeGain > 0) { player.life += lifeGain; updatePlayerStats(); addStory(`🕊️ A peaceful conscience soothes your wounds. (+${lifeGain} life)`); }
  } else if (_morScore >= 20) {
    const lifeGain = Math.min(5, player.maxLife - player.life);
    if (lifeGain > 0) { player.life += lifeGain; updatePlayerStats(); addStory(`🌿 Restful spirit. (+${lifeGain} life)`); }
  } else if (_morScore <= -40) {
    const lifeLoss = Math.min(8, player.life - 1);
    if (lifeLoss > 0) { player.life -= lifeLoss; updatePlayerStats(); addStory(`😰 Wicked dreams tear at you. (−${lifeLoss} life)`); }
  } else if (_morScore <= -20) {
    const lifeLoss = Math.min(4, player.life - 1);
    if (lifeLoss > 0) { player.life -= lifeLoss; updatePlayerStats(); addStory(`😔 Troubled sleep. (−${lifeLoss} life)`); }
  }

  // Pendant mana regen on sleep
  if (player.equipped?.pendant === "Aelindra's Pendant") {
    const _maxM  = player.maxMana || 100;
    const _mGain = Math.min(Math.floor(_maxM * 0.30), _maxM - (player.mana || 0));
    if (_mGain > 0) {
      player.mana = Math.min(_maxM, (player.mana || 0) + _mGain);
      updateTopStats();
      addStory(`✨ A gentle warmth pulses from the pendant through your sleep. (+${_mGain} mana)`);
    }
  }

  // Kingdom stats drift on rest
  if (player.currentKingdom) driftKingdomStats(player.currentKingdom);

  // Advance to Early Morning (updateTimeOfDay announces it as a landmark period)
  while (player.timeOfDay !== '🌅 Early Morning') updateTimeOfDay(true);

  checkQuestObjectives?.('slept');
  saveGame(true);
  // Tutorial: bandit encounter fires automatically when sleep objective completes
  // and talk_bandits (index 8) becomes the active objective
  const tutInst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
  if (tutInst?.objectiveIndex === 8) {
    await _tutorialBanditEncounter();
  }
}

// ── Arúvari Revelation Cutscene ──────────────────────────────
async function _playAruvariRevelation() {
  const _storyEl = document.getElementById('story');
  if (!_storyEl) return;

  // Fade in
  const fade = document.createElement('div');
  fade.id = 'aruvari-fade';
  Object.assign(fade.style, {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: '#0a0004', opacity: 0, zIndex: 9998,
    transition: 'opacity 2s ease', pointerEvents: 'none'
  });
  document.body.appendChild(fade);
  requestAnimationFrame(() => { fade.style.opacity = 0.85; });
  await new Promise(r => setTimeout(r, 2200));

  const _chapter = (html) => {
    addStory(`<div class="aruvari-chapter">${html}</div>`);
    _storyEl.scrollTop = _storyEl.scrollHeight;
  };

  addStory('<div class="aruvari-reveal-header">🩸 The Hidden History of Arúvaria 🩸</div>');
  await waitForEnter('Press Enter to begin…');

  _chapter(`<strong>I. Who They Were</strong><br>
Before the ten kingdoms. Before the roads. Before any map that names this land Estranta — there were the Arúvari. An elven people, old even by elven measure, who had lived on this continent for so long that the land itself had shaped itself around their presence. They built in stone without mortar. They tracked time by stars. They believed the earth held memory and that silence, if you were patient enough, could speak. They did not have kings. They did not have borders in the way borders would later be understood. They had the land, and the land had them, and for a very long time this was sufficient.`);
  await waitForEnter();

  _chapter(`<strong>II. The Newcomers</strong><br>
The newcomers arrived in waves — first as individuals, then as families, then as something more deliberate. The Arúvari did not meet them with fear. Fear was not their first instinct. They met them with the curiosity of a people who had seen other peoples come and go across long centuries and who had, each time, found a way to coexist. The newcomers were different from what had come before: more numerous, more organized, more convinced that the land was a resource to be consumed rather than a relationship to be maintained. But they were also hungry, and cold, and frightened of a world that was larger than they knew how to navigate. The Arúvari understood hunger. They extended their hand.`);
  await waitForEnter();

  _chapter(`<strong>III. The Treaty of Open Hands</strong><br>
A formal agreement was reached — written in two languages, signed with marks in both traditions. The newcomers would have the lowland valleys for settlement. The Arúvari would retain the ancient forests, the high slopes, the sacred waterways. Both peoples would trade freely. Both peoples would respect the other's customs. The document was called, in the Arúvari tongue, something that translated roughly as the treaty of open hands — a phrase used for agreements between people who trusted each other completely. The newcomers signed it in good faith, or so it appeared. Some of them, at least, believed what they were signing. Others were already doing the arithmetic.`);
  await waitForEnter();

  _chapter(`<strong>IV. The Calculation</strong><br>
The planning took twelve years. The ore veins beneath the Arúvari highlands were too valuable to leave untouched. The river rights they held controlled too much of the trade the newcomers needed to grow. The land set aside for Arúvari use represented, by the calculations of the newcomers' leadership, a quarter of the continent's most productive territory. And the Arúvari showed no sign of weakening, or declining, or becoming less themselves. The treaty was not going to expire. It was not going to be renegotiated in the newcomers' favour. It was simply going to remain. A quiet decision was made at a level of leadership that left almost no written record. What survived, in a private archive that was never meant to be found: <em>the arrangement cannot hold and therefore it will not hold.</em>`);
  await waitForEnter();

  _chapter(`<strong>V. The Feast</strong><br>
An invitation was sent to every Arúvari settlement. A grand feast — a celebration of the ten years since the treaty, a shared meal between peoples, held in the valley that both sides knew as a traditional meeting ground. The Arúvari called the valley by a name that meant <em>the place where we held the feast of welcome.</em> The word they used for welcome was the one reserved for trust between equals. They came. All of them who were able came. Children too young were left behind. The very old who could not travel were left behind. A few tending a late harvest on the high slopes did not receive the message in time. Everyone else came, dressed in their best, bringing their instruments and their stories, ready to celebrate a decade of coexistence with the people they had chosen to trust.`);
  await waitForEnter();

  _chapter(`<strong>VI. The Night</strong><br>
The fires were arranged in a specific pattern. This was the signal — not to the Arúvari, who saw only light and warmth, but to the men positioned on the valley slopes who had been waiting since before dark. An Arúvari elder described it, in the last words she committed to bone before the end: <em>We had taught them our names for joy. They knew, then, exactly what sound to silence.</em> By the third hour past dark, the valley was quiet. The newcomers left before dawn. In the settlements, the children and the elders and the harvesters waited through the night, and then through the next day, and then understood, without being told, that the waiting was the answer.`);
  await waitForEnter();

  _chapter(`<strong>VII. The Erasure</strong><br>
The killing was one night. The erasure took a generation. Every map was redrawn. Every record that mentioned the Arúvari by name was amended, then removed, then replaced with silence. The cartographers were given new work. The monks who had copied Arúvari texts were reassigned to distant postings. The children who had survived — collected from the settlements in the weeks that followed — disappeared into the records as simply <em>orphans of the settlement period.</em> One historian who tried to ask questions was given a generous pension and a remote posting. One council member who objected — a man named Halveth Morran, who had believed in the treaty and said so loudly — is the last entry in his own file. Within fifty years, a child born anywhere in the new settlements could grow up without hearing a single word that acknowledged the people whose walls their homes were built into.`);
  await waitForEnter();

  _chapter(`<strong>VIII. What Remains</strong><br>
The land remembers. The ruins that cannot be explained. The soil in the valley floor that grows red wildflowers in the shape of a crowd. The birds that land in the trees there but do not sing. The old man at the fallen watchtower who has not left his post in nine hundred years. The song that passes mother to daughter with no words and no name. The families with silver hair and a particular way of pausing before they answer. The child's pictures on a sheltered stone. The last tablet in the sealed chamber, a list of names that ends mid-word. These things were not preserved deliberately. They simply refused to disappear.`);
  await waitForEnter();

  _chapter(`<strong>IX. What You Know Now</strong><br>
You are not the first to piece this together. The Keepers of the Ember have held fragments of this truth for centuries, scattered and alone, unable to speak it aloud. You are perhaps the first to hold it whole. The ten kingdoms that cover this continent were founded on a night of murder, built on top of erased cities, maintained by a silence that every ruling house has sworn — generation to generation, in a ritual that is never written down — to preserve. The land knows. The land has always known. You know now too.<br><br>
Among the last written things, one tablet names her specifically: <strong>Aelindra</strong>. A princess — not in any hereditary sense the newcomers would recognise, but in the Arúvari understanding: someone chosen by her people to carry what the people most needed kept safe. She was not at the feast. She was not there when the fires went out. The survivors found her afterward, in the years of hiding, and they buried her with the care of people who understood they were burying something that could not be replaced. The grave is marked with the sleeping-star. Whatever she kept — whatever a princess of the Arúvari was entrusted to carry — is still there, in the sealed hollow at the base of the stone. Nine hundred years. Still there.`);
  await waitForEnter('Press Enter to close…');

  // Fade out
  fade.style.opacity = 0;
  await new Promise(r => setTimeout(r, 2000));
  fade.remove();

  addWorldEvent('Uncovered the Hidden History of Arúvaria.', 'lore');
  updateJournal?.();
}

// 8.4 · Shelter
async function handleShelterOption() {
  const sticks = player.campSupplies?.find(i => i.name === 'Stick Bundle')?.quantity ?? 0;
  if (sticks < 5) {
    addStory(`⛔ Need 5 Stick Bundles to build a shelter. (Have: ${sticks})`);
    return;
  }
  player.campSupplies.find(i => i.name === 'Stick Bundle').quantity -= 5;
  updateCampSuppliesGrid?.();
  addStory('🪵 Constructing Simple Shelter...');
  await runInlineProgress('Constructing shelter...', 3000);
  player.hasShelter = true;
  player.shelterDurability = 100;
  gainSkillXp('Crafting', 3);
  addStory('🛖 Simple Shelter constructed.');
  updateComfortProtection?.();
  refreshEncampmentBuiltStates?.();
}

// Upgrade Shelter
async function handleShelterUpgrade() {
  const sticks   = player.campSupplies?.find(i => i.name === 'Stick Bundle')?.quantity ?? 0;
  const branches = player.campSupplies?.find(i => i.name === 'Branch')?.quantity ?? 0;
  if (sticks < 3 || branches < 5) {
    addStory(`⛔ Upgrade needs 3 Stick Bundles + 5 Branches. (Have: ${sticks} sticks, ${branches} branches)`);
    return;
  }
  player.campSupplies.find(i => i.name === 'Stick Bundle').quantity -= 3;
  player.campSupplies.find(i => i.name === 'Branch').quantity -= 5;
  updateCampSuppliesGrid?.();
  addStory('🪵 Upgrading to Improved Shelter...');
  await runInlineProgress('Upgrading shelter...', 4000);
  player.shelterUpgraded = true;
  player.shelterDurability = Math.min(100, (player.shelterDurability ?? 100) + 30);
  gainSkillXp('Crafting', 4);
  addStory('🛖 Upgraded Shelter complete. Better insulation and camouflage.');
  updateComfortProtection?.();
}

// 8.5 · Comfort & Protection Level
function updateComfortProtection() {
  const comfort = document.getElementById('comfort-bar');
  const protection = document.getElementById('protection-bar');

  let comfortLevel = 0;
  let protectionLevel = 0;

  if (player.hasFire) comfortLevel += 30;
  if (player.hasShelter) comfortLevel += 25;
  if (player.shelterUpgraded) comfortLevel += 10;
  if (player.hasBedroll) comfortLevel += 15;

  // Weather penalty
  const badWeather = ['Drizzle', 'Light Rain', 'Rainy', 'Heavy Rain', 'Stormy', 'Snowy', 'Blizzard', 'Strong Wind'];
  if (badWeather.includes(player.weather)) comfortLevel -= 20;

  if (player.hasShelter) protectionLevel += 20;
  if (player.shelterUpgraded) protectionLevel += 20;

  const trapValues = {
    'Stick Barricade': 10,
    'Reinforced Barricade': 15,
    'Spiked Barricade': 20,
    'Pitfall Trap': 15,
    'Spike Pit Trap': 25,
    'Camouflage Netting': 10,
    'Deadfall Trap': 25
  };

  if (Array.isArray(player.trapsBuilt)) {
    player.trapsBuilt.forEach(trap => {
      protectionLevel += trapValues[trap] || 5;
    });
  }

  // Clamp values between 0–100
  comfortLevel = Math.min(100, Math.max(0, comfortLevel));
  protectionLevel = Math.min(100, Math.max(0, protectionLevel));

  comfort.style.width = `${comfortLevel}%`;
  protection.style.width = `${protectionLevel}%`;
}


// 8.6 · Rest Modal Action Dispatcher
restModal.querySelector('.rest-ui-container')
  .addEventListener('click', async function(e) {
    e.stopPropagation(); // prevent context menu from instantly closing
    document.getElementById('hunt-phase-status').textContent = '';
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const act = target.dataset.action;
    console.log('💥 rest-action click:', act);

switch(act) {
  // ── 1) SETUP CAMP ──
// ── 1) SETUP → Encampment toggle ──
case 'setup': {
  const btn   = document.getElementById('setup-camp-button');
  const label = btn.querySelector('.icon-label');
  const miniLog = btn.querySelector('.mini-log');

  const restBtn      = document.querySelector('[data-action="rest"]');
  const campfireBtn  = document.getElementById('campfire-button');
  const resourcesBtn = document.getElementById('resources-button');
  const suppliesDiv  = document.getElementById('camp-supplies');
  const playerEncampmentDiv = document.getElementById('player-encampment');
  const campActions  = document.getElementById('camp-actions');

  // 🔁 TOGGLE: SETUP if not active, otherwise BREAK
  const isCampActive = campSetup || btn.dataset.action === 'encampment';

  if (!isCampActive) {
    // === SETUP CAMP ===
    campSetup = true;
    player.campLocation = player.currentLocation || null;
    renderMapsPanel?.();
    if (miniLog) miniLog.textContent = 'Setting up camp...';
    if (typeof restLog !== 'undefined' && restLog) restLog.textContent = '';
    await runProgressBar('encampment-progress', 3000);

refreshEncampmentBuiltStates();  // ghost any unbuilt icons

    const header = document.getElementById('rest-header')?.querySelector('h4');
    if (header) header.textContent = 'CAMP';

setBuiltIcon('campfire-button', !!player.hasCampfire);
setBuiltIcon('shelter-button',  !!(player.hasShelter || player.shelterLevel));
setBuiltIcon('defenses-button', !!player.hasDefenses);

    if (campActions) campActions.style.display = 'flex';
    if (suppliesDiv) suppliesDiv.style.display = 'block';

    // flip to Encampment
    btn.dataset.action = 'encampment';
    if (label) label.textContent = 'Encampment';

    // hide Rest, show camp controls
    if (restBtn)      restBtn.style.display      = 'none';
    if (campfireBtn)  campfireBtn.style.display  = 'inline-block';
    if (resourcesBtn) resourcesBtn.style.display = 'inline-block';
    if (playerEncampmentDiv) playerEncampmentDiv.style.display = 'block';

    if (typeof restLog !== 'undefined' && restLog) restLog.textContent = "You've set up your campsite.";
    if (typeof addStory === 'function') addStory('🏕️ Camp is ready.');
    if (miniLog) miniLog.textContent = '';

 try { await grantSetupFinds(); } catch (e) { console.error('setup finds', e); }

    updateComfortProtection();
    break;
  }

  // === BREAK CAMP ===
  if (miniLog) miniLog.textContent = 'Breaking camp...';
  if (typeof restLog !== 'undefined' && restLog) restLog.textContent = '';
  campSetup = false;
  player.campLocation = null;
  renderMapsPanel?.();
setBuiltIcon('campfire-button', false);
setBuiltIcon('shelter-button',  false);
setBuiltIcon('defenses-button', false);
  await runProgressBar('encampment-progress', 3000);

  const header = document.getElementById('rest-header')?.querySelector('h4');
  if (header) header.textContent = 'Resting';

  if (campActions) campActions.style.display = 'none';
  if (suppliesDiv) suppliesDiv.style.display = 'none';

  // flip back to Setup
  btn.dataset.action = 'setup';
  if (label) label.textContent = 'Setup Camp';

  // show Rest, hide camp controls
  if (restBtn)      restBtn.style.display      = 'inline-block';
  if (campfireBtn)  campfireBtn.style.display  = 'none';
  if (resourcesBtn) resourcesBtn.style.display = 'none';
  if (playerEncampmentDiv) playerEncampmentDiv.style.display = 'none';

  if (typeof restLog !== 'undefined' && restLog) restLog.textContent = "You've packed up your campsite.";
  if (typeof addStory === 'function') addStory('🎒 Camp broken.');
  if (miniLog) miniLog.textContent = '';

  updateComfortProtection();
  break;
}

/* —— RESTING & CAMPING OPTIONS —— */
case 'pass-time':
case 'rest': {
  const icon = e.target.closest('.icon-button');
  const menu = document.getElementById('context-menu');
  if (!menu || !icon) break;

  menu.innerHTML = '';

  const options = [
    {
      label: 'Rest',
      action: 'restNow',
      tooltip: 'Take a short rest to recover some stamina.',
      disabled: false
    },
    {
      label: 'Sleep',
      action: 'sleepNow',
      tooltip: 'Sleep to refill stamina. Requires a campsite.',
      disabled: !campSetup
    }
  ];

  options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'context-menu-option';
    div.textContent = opt.label;
    div.title = opt.tooltip;

    if (opt.disabled) {
      div.classList.add('disabled-option');
      div.style.opacity = '0.4';
      div.style.pointerEvents = 'auto';
      div.onclick = ev => ev.stopImmediatePropagation();
    } else {
      div.onclick = async () => {
        menu.style.display = 'none';

        if (opt.action === 'restNow') {
          // 🔎 always use encampment mini-log
          const miniLog = document.getElementById('encampment-mini-log');
          const barEl   = campSetup
            ? document.getElementById('encampment-progress') // Pass Time
            : document.getElementById('rest-progress');      // Rest before camp

          if (miniLog) miniLog.textContent = 'Resting...';
          restModal.querySelectorAll('button').forEach(b => b.disabled = true);

          if (barEl) barEl.style.display = 'block';
          await runProgressBar(barEl ? barEl.id : 'rest-progress', 10000);
          if (barEl) barEl.style.display = 'none';

          const tierR = performSkillCheck('Survival');
          const _restCell2 = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
          const _inTown2 = ['City','CapitalCity','Village'].includes(_restCell2.zone || '');
          if (tierR === 1) {
            restLog.textContent = _inTown2 ? 'A commotion outside jolts you awake.' : 'Raiders attack, you lose your rest.';
            addStory(_inTown2 ? 'Commotion outside. No rest gained.' : 'Ambushed. No stamina gain.');
          } else if (tierR === 2) {
            restLog.textContent = _inTown2 ? 'Street noise keeps you from sleeping.' : 'You are disturbed by a wild animal.';
            addStory(_inTown2 ? 'Noisy surroundings. No rest gained.' : 'Disturbed. No stamina gain.');
          } else if (tierR === 3) {
            const gain = Math.floor(player.maxStamina * 0.75) - player.stamina;
            changeStamina(Math.max(0, gain));
            restLog.textContent = `Partially rested (+${gain} stamina).`;
            addStory(`Partially rested (+${gain} stamina).`);
          } else if (tierR === 4) {
            const gain = player.maxStamina - player.stamina;
            changeStamina(Math.max(0, gain));
            restLog.textContent = `Well rested (+${gain} stamina).`;
            addStory(`Well rested (+${gain} stamina).`);
          } else {
            changeStamina(player.maxStamina - player.stamina);
            applyCondition('rejuvenated', 5);
            restLog.textContent = 'Fully rested. (Rejuvenated buff)';
            addStory(`Fully rested. Stamina restored.`);
          }

          restModal.querySelectorAll('button').forEach(b => b.disabled = false);
          if (miniLog) miniLog.textContent = '';
        } else if (opt.action === 'sleepNow') {
          await performSleep();
        }
      };
    }

    menu.appendChild(div);
  });

  const rect = icon.getBoundingClientRect();
  menu.style.top = `${rect.top + window.scrollY}px`;
  menu.style.left = `${rect.right + 10}px`;
  menu.style.display = 'block';

  const closeMenu = (event) => {
    if (!menu.contains(event.target)) {
      menu.style.display = 'none';
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 0);
  break;
}

// ── ENCAMPMENT radial menu ──
case 'encampment': {
  if (!campSetup) break;
  const icon = target.closest('.icon-button');

  // Campfire pit present?
  const hasPit = !!(player?.hasCampfire || player?.campfireBuilt || player?.hasFirepit);

  const items = [];

 // ── Build Campfire (only if no pit), requires 8 Stones ──
if (!hasPit) {
  items.push({
    label: 'Build Campfire',
    icon: 'images/icons/campfire-unlit.png',
    onClick: async () => {
      const mini = document.getElementById('encampment-mini-log');
      const bar  = document.getElementById('encampment-progress');

      // stock check (8 Stones)
      const stones = (player.campSupplies?.find(i => i.name === 'Stone')?.quantity ?? 0);
      if (stones < 8) {
        restLog.textContent = 'You need 8 Stones to build a campfire.';
        addStory?.('⛔ Not enough Stones.');
        return;
      }

      if (mini) mini.textContent = 'Building campfire...';
      if (bar && typeof runProgressBar === 'function') {
        bar.style.display = 'block';
        await runProgressBar('encampment-progress', 2000);
        bar.style.display = 'none';
      }

      // spend 8 Stones via the shared helper
      if (!consumeSupply?.('Stone', 8)) {
        restLog.textContent = 'You need 8 Stones to build a campfire.';
        addStory?.('⛔ Not enough Stones.');
        if (mini) mini.textContent = '';
        return;
      }

      // build using your existing function
      if (typeof setupFire === 'function') await setupFire();

      if (mini) mini.textContent = '';
      restLog.textContent = 'You build a campfire. (−8 Stones)';
      addStory?.('🔥 Campfire built.');
      updateComfortProtection?.();

      // mark built + refresh UI
      player.hasCampfire = true;
      setBuiltIcon('campfire-button', true);
      refreshEncampmentBuiltStates?.();

      const cfBtn = document.getElementById('campfire-button');
      if (cfBtn) cfBtn.style.display = 'block';
    }
  });
}

  // ── Rest submenu: Pass Time / Sleep ──
  items.push({
    label: 'Rest',
    icon: 'images/icons/bedroll.png',
    onClick: () => {
      const menu = document.getElementById('context-menu');
      if (!menu) return;

      menu.innerHTML = '';

      // Pass Time
      let opt = document.createElement('div');
      opt.className   = 'context-menu-option';
      opt.textContent = 'Pass Time';
      opt.onclick     = async () => {
        menu.style.display = 'none';

        // If you have a central handler, use it
        if (typeof handleRestNow === 'function') {
          try { await handleRestNow(); } catch {}
          return;
        }

        // Fallback: inline rest flow (uses encampment mini-log + bar)
        const mini = document.getElementById('encampment-mini-log');
        const bar  = document.getElementById('encampment-progress');

        if (mini) mini.textContent = 'Resting...';
        try {
          restModal?.querySelectorAll('button')?.forEach(b => b.disabled = true);
          if (bar && typeof runProgressBar === 'function') {
            bar.style.display = 'block';
            await runProgressBar('encampment-progress', 10000);
            bar.style.display = 'none';
          }

          const tierR = performSkillCheck('Survival');
          const _restCell3 = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
          const _inTown3 = ['City','CapitalCity','Village'].includes(_restCell3.zone || '');

          if (tierR === 1) {
            restLog.textContent = _inTown3 ? 'A commotion outside jolts you awake.' : 'Raiders attack, you lose your rest.';
            addStory?.(_inTown3 ? 'Commotion outside. No rest gained.' : 'Ambushed. No stamina gain.');
          } else if (tierR === 2) {
            restLog.textContent = _inTown3 ? 'Street noise keeps you from sleeping.' : 'You are disturbed by a wild animal.';
            addStory?.(_inTown3 ? 'Noisy surroundings. No rest gained.' : 'Disturbed. No stamina gain.');
          } else if (tierR === 3) {
            const gain = Math.floor(player.maxStamina * 0.75) - player.stamina;
            changeStamina(Math.max(0, gain));
            restLog.textContent = `Partially rested (+${gain} stamina).`;
            addStory?.(`Partially rested (+${gain} stamina).`);
          } else if (tierR === 4) {
            const gain = player.maxStamina - player.stamina;
            changeStamina(Math.max(0, gain));
            restLog.textContent = `Well rested (+${gain} stamina).`;
            addStory?.(`Well rested (+${gain} stamina).`);
          } else {
            changeStamina(player.maxStamina - player.stamina);
            applyCondition('rejuvenated', 5);
            restLog.textContent = 'Fully rested. (Rejuvenated buff)';
            addStory?.('Fully rested. Stamina restored.');
          }
        } finally {
          restModal?.querySelectorAll('button')?.forEach(b => b.disabled = false);
          if (mini) mini.textContent = '';
        }
      };
      menu.appendChild(opt);

      // Sleep
      opt = document.createElement('div');
      opt.className   = 'context-menu-option';
      opt.textContent = campSetup ? 'Sleep' : 'Sleep (requires camp)';
      if (!campSetup) {
        opt.classList.add('disabled-option');
        opt.style.opacity = '0.4';
        opt.onclick = (ev) => ev.stopImmediatePropagation();
      } else {
        opt.onclick = async () => {
          menu.style.display = 'none';
          await performSleep?.();
        };
      }
      menu.appendChild(opt);

      // position + show
      const rect = icon.getBoundingClientRect();
      menu.style.top     = `${rect.top + window.scrollY}px`;
      menu.style.left    = `${rect.right + 10}px`;
      menu.style.display = 'block';

      const closeMenu = (event) => {
        if (!menu.contains(event.target)) {
          menu.style.display = 'none';
          document.removeEventListener('click', closeMenu);
        }
      };
      setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
  });

  // ── Shelter submenu ──
  items.push({
    label: 'Shelter',
    icon: 'images/icons/shelter.png',
    onClick: () => {
      const menu = document.getElementById('context-menu');
      if (!menu) return;
      menu.innerHTML = '';
      if (typeof buildShelterOptions === 'function') buildShelterOptions(menu);

      const rect = icon.getBoundingClientRect();
      menu.style.top     = `${rect.top + window.scrollY}px`;
      menu.style.left    = `${rect.right + 10}px`;
      menu.style.display = 'block';
      setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
  });

  // ── Camp Defenses submenu ──
  items.push({
    label: 'Camp Defenses',
    icon: 'images/icons/defenses.png',
    onClick: () => {
      const menu = document.getElementById('context-menu');
      if (!menu) return;
      menu.innerHTML = '';
      if (typeof buildDefenseOptions === 'function') buildDefenseOptions(menu);

      const rect = icon.getBoundingClientRect();
      menu.style.top     = `${rect.top + window.scrollY}px`;
      menu.style.left    = `${rect.right + 10}px`;
      menu.style.display = 'block';
      setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
  });

  // ── Break Camp (inline; no delegation) ──
  items.push({
 label: 'Break Camp',
  icon: 'images/icons/packup.png',
  onClick: async () => {
    const mini = document.getElementById('encampment-mini-log');
    const bar  = document.getElementById('encampment-progress');

    if (mini) mini.textContent = 'Breaking camp...';
    if (bar && typeof runProgressBar === 'function') {
      bar.style.display = 'block';
      await runProgressBar('encampment-progress', 1500);
      bar.style.display = 'none';
    }

    // flip state
    campSetup = false;
    player.campLocation = null;

    // header + logs
    const headerEl = document.getElementById('rest-header')?.querySelector('h4');
    if (headerEl) headerEl.textContent = 'REST';
    restLog.textContent = "You've packed up your campsite.";
    addStory?.('🎒 Camp broken. Campsite removed from map.');
    renderMapsPanel?.();

    // revert Setup/Encampment button
    const btn = document.getElementById('setup-camp-button');
    if (btn) {
      btn.dataset.action = 'setup';
      const lbl = btn.querySelector('.icon-label');
      if (lbl) lbl.textContent = 'Setup Camp';
    }

    // show the initial Rest icon again
    const restBtn = document.querySelector('#camp-actions [data-action="rest"]');
    if (restBtn) restBtn.style.display = 'inline-block';

    // hide post-setup UI
    const resBtn   = document.getElementById('resources-button');
    const encWrap  = document.getElementById('player-encampment');
    const supplies = document.getElementById('camp-supplies');
    if (resBtn)   resBtn.style.display   = 'none';
    if (encWrap)  encWrap.style.display  = 'none';
    if (supplies) supplies.style.display = 'none';

    updateComfortProtection?.();

    if (mini) mini.textContent = '';

    // close any open radial/context menu
    document.querySelectorAll('.radial-menu-container').forEach(n => n.remove());
    const ctx = document.getElementById('context-menu');
    if (ctx) ctx.style.display = 'none';
  }

  });

  showRadialMenu(icon, items);
  break;
}

// ── CAMPFIRE radial menu ──
case 'campfire': {
  const icon = target.closest('.icon-button');

  // Coerce possibly-object inventories to arrays (local-only, no globals)
  const invArr = Array.isArray(player?.inventory)
    ? player.inventory
    : (player?.inventory ? Object.values(player.inventory) : []);

  const supArr = Array.isArray(player?.campSupplies)
    ? player.campSupplies
    : (player?.campSupplies ? Object.values(player.campSupplies) : []);

  // State (do NOT reassign these; rely on player flags)
  const hasPit = !!(player?.hasCampfire || player?.campfireBuilt || player?.hasFirepit);
  const isLit  = !!(player && (Number(player.fireTimer) > 0 || player.hasFire === true));

  // Kettle available anywhere?
  const hasKettle =
    !!player?.hasKettle ||
    invArr.some(it => it && /kettle/i.test(String(it.name)) && ((it.qty ?? it.quantity ?? 1) > 0)) ||
    supArr.some(it => it && /kettle/i.test(String(it.name)) && ((it.qty ?? it.quantity ?? 1) > 0));

  const mini = document.getElementById('encampment-mini-log');
  const bar  = document.getElementById('encampment-progress');

  const items = [];

  // 1) No pit -> Build Campfire
  if (!hasPit) {
    items.push({
      label: 'Build Campfire',
      icon: 'images/icons/campfire-unlit.png',
      onClick: async () => {
        const stoneQty = player.campSupplies?.find(i => i.name === 'Stone')?.quantity ?? 0;
        if (stoneQty < 8) {
          restLog.textContent = 'You need 8 Stones to build a campfire.';
          addStory?.('⛔ Not enough Stones.');
          return;
        }

        if (mini) mini.textContent = 'Building campfire...';
        if (bar && typeof runProgressBar === 'function') {
          bar.style.display = 'block';
          await runProgressBar('encampment-progress', 2000);
          bar.style.display = 'none';
        }

        // Spend 8 Stones via shared helper (fallback to manual if missing)
        let spent = false;
        if (typeof consumeSupply === 'function') {
          spent = consumeSupply('Stone', 8);
        } else {
          const it = player.campSupplies?.find(i => i.name === 'Stone');
          if (!it || (it.quantity ?? 0) < 8) return;
          it.quantity -= 8;
          updateCampSuppliesGrid?.();
          spent = true;
        }
        if (!spent) return;

        // Your existing setup (pit/timers etc.)
        if (typeof setupFire === 'function') await setupFire();

        if (mini) mini.textContent = '';
        restLog.textContent = 'You build a campfire. (−8 Stones)';
        addStory?.('🔥 Campfire built.');
        updateComfortProtection?.();

        // Flip UI active
        player.hasCampfire = true;
        setBuiltIcon('campfire-button', true);
        refreshEncampmentBuiltStates?.();

        const cfBtn = document.getElementById('campfire-button');
        if (cfBtn) cfBtn.style.display = 'block';
      }
    });

  // 2) Pit -> Light Fire
  } else if (!isLit) {
    items.push({
      label: 'Light Fire',
      icon: 'images/icons/campfire.png',
      onClick: async () => {
  const mini = document.getElementById('campfire-mini-log');

  // prerequisites — need Kindling + some wood
  const hasKindling = (player.campSupplies?.find(i => i.name === 'Kindling')?.quantity ?? 0) > 0;
  if (!hasKindling) {
    restLog.textContent = 'You need Kindling to light the fire.';
    addStory?.('⛔ No Kindling.');
    return;
  }

  const order = ['Large Wood Bundle', 'Small Wood Bundle', 'Stick Bundle'];
  const woodItem = order
    .map(n => player.campSupplies?.find(x => x && x.name === n && ((x.quantity ?? x.qty ?? 0) > 0)))
    .find(Boolean);

  if (!woodItem) {
    restLog.textContent = 'You have no wood to light the fire.';
    addStory?.('⛔ No wood in supplies.');
    return;
  }

  // ATTEMPT BAR — always show once (this is the “try” animation)
  if (mini) mini.textContent = 'Attempting to light the fire...';
  const lp = document.getElementById('lighting-progress');
  if (lp) {
    lp.style.display = 'block';
    if (typeof runProgressBar === 'function') {
      await runProgressBar('lighting-progress', 1500);
    }
    lp.style.display = 'none';
  }

  // Spend Kindling on the attempt
  if (typeof consumeSupply === 'function') {
    consumeSupply('Kindling', 1);
  } else {
    const it = player.campSupplies?.find(i => i.name === 'Kindling');
    if (it) { it.quantity = Math.max(0, (it.quantity ?? 0) - 1); updateCampSuppliesGrid?.(); }
  }

  // Outcome roll
  const tier = performSkillCheck('Fire-making');

  // Failure → report + clear mini
  if (tier <= 2) {
    if (mini) mini.textContent = '';
    restLog.textContent = 'The tinder smolders and dies. Kindling is spent.';
    addStory?.('⚠️ Fire-lighting failed. Kindling consumed.');
    return;
  }

  // Success → delegate EVERYTHING (wood consumption, duration, timer/bar) to your existing routine
  // IMPORTANT: do NOT run any other progress bars here to avoid double-play.
  if (typeof startFireWithWood === 'function') {
    await startFireWithWood(woodItem.name); // this should pick duration by wood type and run the burn-down bar
  }

  if (mini) mini.textContent = '';
  restLog.textContent = 'The fire catches and begins to burn.';
  addStory?.('🔥 Fire lit.');
  checkQuestObjectives?.('fire_started');
  updateComfortProtection?.();
}
    });

 // 3) Lit -> Put Out Fire
} else {
  // Add To Fire... (radial)
  items.push({
    label: 'Add To Fire...',
    icon: 'images/icons/firewood.png',
    disabled: !(player?.hasFire && (player.campSupplies || [])
      .some(s => (getBurnTime?.(s.name) > 0) && (s.quantity ?? 0) > 0)),
    onClick: () => {
      const menu = document.getElementById('context-menu');
      if (!menu) return;
      menu.innerHTML = '';

      // fuels from CAMP SUPPLIES (burnTime > 0)
      const fuels = (player.campSupplies || [])
        .filter(s => (getBurnTime?.(s.name) > 0) && (s.quantity ?? 0) > 0);

      fuels.forEach(({ name, quantity }) => {
        const div = document.createElement('div');
        div.className = 'context-menu-option';
        div.textContent = `${name} (${quantity})`;
        div.onclick = () => {
          menu.style.display = 'none';
          if (typeof startFireWithWood === 'function') startFireWithWood(name);
        };
        menu.appendChild(div);
      });

      // open beside the campfire icon
      const rect = icon.getBoundingClientRect();
      menu.style.top  = `${rect.top + window.scrollY}px`;
      menu.style.left = `${rect.right + 10}px`;
      menu.style.display = 'block';

      // click-away close
      const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
          menu.style.display = 'none';
          document.removeEventListener('click', closeMenu, true);
        }
      };
      requestAnimationFrame(() => document.addEventListener('click', closeMenu, true));
    }
  });

  // Extinguish Fire
  items.push({
    label: 'Extinguish Fire',
    icon: 'images/icons/campfire-unlit.png',
    onClick: async () => {
      if (mini) mini.textContent = 'Extinguishing fire...';
      if (bar && typeof runProgressBar === 'function') {
        bar.style.display = 'block';
        await runProgressBar('encampment-progress', 1000);
        bar.style.display = 'none';
      }
      if (typeof extinguishFire === 'function') {
        await extinguishFire();
      } else {
        player.hasFire = false;
        player.fireTimer = 0;
      }
      if (mini) mini.textContent = '';
      restLog.textContent = 'You extinguish the fire.';
      addStory?.('💨 Fire extinguished.');
      updateComfortProtection?.();
    }
  });
}

// Place Kettle (greyed out if no pit OR no kettle)
items.push({
  label: 'Place Kettle',
  icon: 'images/icons/kettle.png',
  disabled: !hasPit || !hasKettle,
  onClick: async () => {
    if (!hasPit || !hasKettle) return;
    if (mini) mini.textContent = 'Placing kettle...';
    if (bar && typeof runProgressBar === 'function') {
      bar.style.display = 'block';
      await runProgressBar('encampment-progress', 1000);
      bar.style.display = 'none';
    }
    if (typeof placeKettle === 'function') {
      await placeKettle();
    } else {
      player.kettlePlaced = true;
      restLog.textContent = 'You place a kettle over the fire.';
      addStory?.('🫖 Kettle placed.');
    }
    if (mini) mini.textContent = '';
  }
});

  showRadialMenu(icon, items);
  break;
}

// ── RESOURCES RADIAL MENU ──
case 'resources': {
  if (!campSetup) return;
  const icon = target.closest('.icon-button');

  showRadialMenu(icon, [
    {
      label: 'Gather',
      onClick: () => {
        // create submenu near the icon
        const menu = document.getElementById('context-menu');
        menu.innerHTML = '';

        const gatherItems = [
          { label: 'Gather Sticks',     cost: 2 },
          { label: 'Gather Small Logs', cost: 4 },
          { label: 'Gather Large Logs', cost: 6 },
          { label: 'Gather Stones',     cost: 3 },
          { label: 'Gather Kindling',   cost: 1 },
						{ label: 'Gather Branches',   cost: 2 },
          { label: 'Forage',            cost: 3 }
        ];

        gatherItems.forEach(data => {
          const opt = document.createElement('div');
          opt.className = 'context-menu-option';
          const iconSrc = getGatherIcon(data.label); // ✅ Using your icon helper
	opt.innerHTML = `<span class="ctx-entry"><img src="${iconSrc}" class="context-icon"> ${data.label}</span>`;
          opt.onclick = () => {
            menu.style.display = 'none';
            handleGatherAttempt({
              tool: data.label,
              cost: data.cost,
              label: data.label
            });
          };
          menu.appendChild(opt);
        });

        const rect = icon.getBoundingClientRect();
        menu.style.top = `${rect.top + window.scrollY}px`;
        menu.style.left = `${rect.right + 10}px`;
        menu.style.display = 'block';
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
      }
    },
    {
      label: 'Craft',
      onClick: () => canCraft()
    },
    {
      label: 'Hunt',
      onClick: () => runHuntSequence()
    },
    {
      label: 'Fish',
      onClick: () => _doFishFromWheel()
    }
  ]);
  break;
}
    }
  });

// 8.7 · Add Firewood Button
const addWoodBtn = document.getElementById('add-wood-button');
if (addWoodBtn) {
  addWoodBtn.onclick = () => {
    if (!player?.hasFire || (fireTimeRemaining ?? 0) <= 0) return;

    const menu = document.getElementById('context-menu');
    menu.innerHTML = '';

    // Build choices from CAMP SUPPLIES using burnTime>0
    const fuels = (player.campSupplies || []).filter(
      s => getBurnTime(s.name) > 0 && (s.quantity ?? 0) > 0
    );

    fuels.forEach(({ name, quantity }) => {
      const div = document.createElement('div');
      div.className = 'context-menu-option';
      div.textContent = `${name} (${quantity})`;
      div.onclick = () => {
        menu.style.display = 'none';
        startFireWithWood(name); // consumes + extends via the unified logic
        // Re-check availability post-consume
        const stillHas = (player.campSupplies || [])
          .some(s => getBurnTime(s.name) > 0 && (s.quantity ?? 0) > 0);
        addWoodBtn.disabled = !stillHas;
      };
      menu.appendChild(div);
    });

    // Position + show by the button
    const rect = addWoodBtn.getBoundingClientRect();
    menu.style.top = `${rect.top + window.scrollY}px`;
    menu.style.left = `${rect.right + 10}px`;
    menu.style.display = 'block';

    // Click-away close (no stray 'icon' refs)
    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target !== addWoodBtn) {
        menu.style.display = 'none';
        document.removeEventListener('click', closeMenu, true);
      }
    };
    requestAnimationFrame(() => document.addEventListener('click', closeMenu, true));
  };
}

// 8.8 · D20 Three.js
const wheelD20 = document.querySelector('#choice-wheel .wheel-center');
if (wheelD20) {
  wheelD20.style.setProperty('--d20-glow', 'rgba(255,255,255,0.5)');
}

if (wheelD20 && typeof THREE !== 'undefined') {
  wheelD20.innerHTML = '';

  const SIZE = 115;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  Object.assign(renderer.domElement.style, {
    position: 'absolute', top: '0', left: '0',
    width: '100%', height: '100%', pointerEvents: 'none'
  });
  wheelD20.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 2.9;

  const geo = new THREE.IcosahedronGeometry(0.88, 0);
  const mat = new THREE.MeshPhongMaterial({
    color: 0xcc1414, emissive: 0x2c0000,
    shininess: 55, flatShading: true, specular: 0xff5555,
  });
  const d20 = new THREE.Mesh(geo, mat);
  d20.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0x150000 })
  ));
  scene.add(d20);

  scene.add(new THREE.AmbientLight(0x661010, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(1.2, 1.8, 2.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xff4444, 0.45);
  fill.position.set(-1.2, -1.0, 0.5);
  scene.add(fill);

  const pos = geo.getAttribute('position');

  // Compute faceQ: the quaternion that brings this face to face +Z with apex up (△)
  function computeFaceQuat(pa, pb, pc) {
    const norm = new THREE.Vector3()
      .crossVectors(new THREE.Vector3().subVectors(pb, pa),
                    new THREE.Vector3().subVectors(pc, pa))
      .normalize();
    if (norm.dot(pa) < 0) norm.negate();
    const q1 = new THREE.Quaternion().setFromUnitVectors(norm, new THREE.Vector3(0, 0, 1));
    const [ra, rb, rc] = [pa, pb, pc].map(v => v.clone().applyQuaternion(q1));
    // Centroid of the face in transformed space
    const cx = (ra.x + rb.x + rc.x) / 3;
    const cy = (ra.y + rb.y + rc.y) / 3;
    // lone = vertex farthest from centroid in Y — this is always the single apex
    // regardless of whether the face is currently △ or ▽
    const lone = [ra, rb, rc].reduce((a, b) =>
      Math.abs(a.y - cy) > Math.abs(b.y - cy) ? a : b
    );
    // Rotate around Z so the lone apex points toward +Y → gives △
    // θ = atan2(dx, dy) is the CCW angle needed to bring (dx,dy) to +Y direction
    const q2 = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.atan2(lone.x - cx, lone.y - cy));
    return new THREE.Quaternion().multiplyQuaternions(q2, q1);
  }

  // Build face quaternion table and find the frontmost face
  const FACE_COUNT = 20;
  const faceQs = [];
  let bestZ = -Infinity, frontFaceIdx = 0;

  for (let i = 0; i < FACE_COUNT; i++) {
    const va = new THREE.Vector3().fromBufferAttribute(pos, i * 3);
    const vb = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 1);
    const vc = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 2);
    faceQs.push(computeFaceQuat(va, vb, vc));
    const z = (pos.getZ(i*3) + pos.getZ(i*3+1) + pos.getZ(i*3+2)) / 3;
    if (z > bestZ) { bestZ = z; frontFaceIdx = i; }
  }

  // baseQ = front face looking at camera at rest
  const baseQ = faceQs[frontFaceIdx].clone();

  // Number canvas texture
  function makeNumTexture(num) {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.font = 'bold 62px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(num), 64, 64);
    return new THREE.CanvasTexture(c);
  }

  // Attach a number plane to each face
  for (let i = 0; i < FACE_COUNT; i++) {
    const va = new THREE.Vector3().fromBufferAttribute(pos, i * 3);
    const vb = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 1);
    const vc = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 2);

    const centroid = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
    const norm = new THREE.Vector3()
      .crossVectors(new THREE.Vector3().subVectors(vb, va),
                    new THREE.Vector3().subVectors(vc, va))
      .normalize();
    if (norm.dot(va) < 0) norm.negate();

    // Plane up = world +Y mapped back into d20 local space via faceQs[i]
    const planeUp = new THREE.Vector3(0, 1, 0).applyQuaternion(faceQs[i].clone().conjugate());

    // Build plane orientation: +Z → norm, +Y → planeUp
    const qZ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), norm);
    const currentY = new THREE.Vector3(0, 1, 0).applyQuaternion(qZ);
    const rollAngle = Math.atan2(
      norm.dot(new THREE.Vector3().crossVectors(currentY, planeUp)),
      currentY.dot(planeUp)
    );
    const planeQ = new THREE.Quaternion()
      .multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(norm, rollAngle), qZ);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.42),
      new THREE.MeshBasicMaterial({
        map: makeNumTexture(i + 1),
        transparent: true, depthWrite: false, alphaTest: 0.05,
        side: THREE.DoubleSide,
      })
    );
    plane.position.copy(centroid).addScaledVector(norm, 0.01);
    plane.quaternion.copy(planeQ);
    d20.add(plane);
  }

  // face index i carries number i+1
  const numToFaceIdx = {};
  for (let i = 0; i < FACE_COUNT; i++) numToFaceIdx[i + 1] = i;

  // Animated current orientation + target for roll display
  let _currentQ = baseQ.clone();
  let _targetQ  = baseQ.clone();

  window.d20ShowNumber = function(num) {
    const idx = numToFaceIdx[num];
    if (idx === undefined) return;
    _targetQ.copy(faceQs[idx]);
    tX = 0; tY = 0;
  };

  let cX = 0, cY = 0, tX = 0, tY = 0;
  document.addEventListener('mousemove', e => {
    const r = wheelD20.getBoundingClientRect();
    tX = -((e.clientY - r.top  - r.height / 2) / window.innerHeight) * 1.1;
    tY =  ((e.clientX - r.left - r.width  / 2) / window.innerWidth)  * 1.1;
  });

  (function tick() {
    requestAnimationFrame(tick);
    cX += (tX - cX) * 0.08;
    cY += (tY - cY) * 0.08;
    _currentQ.slerp(_targetQ, 0.06);
    const mouseQ = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(cX, cY, 0, 'YXZ'));
    d20.quaternion.multiplyQuaternions(mouseQ, _currentQ);
    renderer.render(scene, camera);
  })();
}

// Clicking the D20 in the wheel center triggers a manual dice roll.
if (wheelD20) {
  wheelD20.addEventListener('click', async () => {
    await rollDice(20);
  });
}

function pulseD20(times = 3) {
  if (!wheelD20) return;

  const orange = 'rgba(255,140,0,0.85)';
  const white  = 'rgba(255,255,255,0.5)';

  const fade   = 250;
  const hold   = 150;
  const period = fade + hold;

  let count = 0;
  clearInterval(wheelD20._pulseLoop);

  wheelD20.style.setProperty('--d20-glow', orange);

  wheelD20._pulseLoop = setInterval(() => {
    const now = wheelD20.style.getPropertyValue('--d20-glow').trim();
    wheelD20.style.setProperty('--d20-glow', now === orange ? white : orange);

    if (++count >= times * 2) {
      clearInterval(wheelD20._pulseLoop);
      wheelD20.style.setProperty('--d20-glow', white);
    }
  }, period);
}

// 8.9 · Dynamic Choice Wheel System
			const SPOKE_POSITIONS = {
				1: [[50, 25, 'right']],
				2: [[50, 22, 'right'], [50, 78, 'left']],
				3: [[35, 22, 'right'], [65, 22, 'right'], [50, 78, 'left']],
				4: [[35, 22, 'right'], [65, 22, 'right'], [35, 78, 'left'], [65, 78, 'left']],
				5: [[28, 22, 'right'], [50, 18, 'right'], [72, 22, 'right'], [36, 78, 'left'], [64, 78, 'left']],
				6: [[22, 25, 'right'], [50, 20, 'right'], [78, 25, 'right'], [22, 75, 'left'], [50, 80, 'left'], [78, 75, 'left']],
				7: [[13, 22, 'right'], [37, 22, 'right'], [63, 22, 'right'], [87, 22, 'right'], [22, 78, 'left'], [50, 78, 'left'], [78, 78, 'left']],
				8: [[13, 22, 'right'], [37, 22, 'right'], [63, 22, 'right'], [87, 22, 'right'], [13, 78, 'left'], [37, 78, 'left'], [63, 78, 'left'], [87, 78, 'left']],
				9:  [[10, 22, 'right'], [28, 22, 'right'], [50, 20, 'right'], [72, 22, 'right'], [90, 22, 'right'], [13, 78, 'left'], [37, 78, 'left'], [63, 78, 'left'], [87, 78, 'left']],
				10: [[10, 22, 'right'], [28, 22, 'right'], [50, 20, 'right'], [72, 22, 'right'], [90, 22, 'right'], [10, 78, 'left'], [28, 78, 'left'], [50, 80, 'left'], [72, 78, 'left'], [90, 78, 'left']],
				11: [[8, 22, 'right'], [22, 22, 'right'], [38, 22, 'right'], [62, 22, 'right'], [78, 22, 'right'], [92, 22, 'right'], [10, 78, 'left'], [28, 78, 'left'], [50, 80, 'left'], [72, 78, 'left'], [90, 78, 'left']],
				12: [[8, 22, 'right'], [22, 22, 'right'], [38, 22, 'right'], [62, 22, 'right'], [78, 22, 'right'], [92, 22, 'right'], [8, 78, 'left'], [22, 78, 'left'], [38, 78, 'left'], [62, 78, 'left'], [78, 78, 'left'], [92, 78, 'left']],
			};

			let _wheelStack = [];
			let _currentWheelOptions = [];
			let _currentMenuLabel = '';

			function _buildWheel(options, menuName) {
				// Insert a divider whenever there's been story output since the last wheel build
				if (_storyDirtySinceWheel) {
					_insertStoryDivider();
					_storyDirtySinceWheel = false;
				}
				if (menuName !== undefined) {
					_currentMenuLabel = menuName;
					const lbl = document.getElementById('wheel-label');
					if (lbl) lbl.textContent = menuName;
				}
				// Back option always last; disabled options hidden entirely
				const sorted = [
					...options.filter(o => !o.isBack && !o.disabled),
					...options.filter(o =>  o.isBack),
				];
				_currentWheelOptions = sorted;

				wheel.querySelectorAll('.spoke').forEach(s => s.remove());
				const count = Math.min(sorted.length, 12);
				const positions = SPOKE_POSITIONS[count] || SPOKE_POSITIONS[6];
				sorted.slice(0, count).forEach((opt, i) => {
					const [topPct, leftPct, side] = positions[i];
					const spoke = document.createElement('div');
					spoke.className = 'spoke' + (opt.isBack ? ' spoke-back' : '');
					spoke.setAttribute('data-label', opt.label);
					if (opt.tooltip) spoke.title = opt.tooltip;
					if (opt.icon) {
						spoke.innerHTML = `<img class="spoke-icon" src="${opt.icon}" alt=""><span>${i + 1}. ${opt.label}</span>`;
					} else {
						spoke.textContent = `${i + 1}. ${opt.label}`;
					}
					spoke.style.top       = topPct + '%';
					spoke.style.left      = leftPct + '%';
					spoke.style.textAlign = side === 'right' ? 'right' : 'left';
					spoke.style.transform = side === 'right' ? 'translate(-100%,-50%)' : 'translate(0,-50%)';
					spoke.addEventListener('click', opt.action);
					wheel.appendChild(spoke);
				});
			}

			function _goBack() {
				if (player.currentAction !== 'Idle') {
					player.currentAction = 'Idle';
					updateTopStats();
				}
				if (_wheelStack.length > 0) (_wheelStack.pop())();
				else _showDefaultWheel();
			}

			function _showDefaultWheel() {
				if (combatState) { _showCombatWheel(); return; }
				_wheelStack = [];
				// Reset town engagement if the player is no longer in a settlement
				const _dfCell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				if (!['City','CapitalCity','Village'].includes(_dfCell.zone || '')) {
					_townEngaged  = false;
					_currentEstab = null;
				}
				checkMasterGuildQueue();
				_showActionsWheel();
			}

			function _showActionsWheel() {
				const cell         = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const inSettlement = ['City','CapitalCity','Village'].includes(cell.zone || '');
				const trialQuest   = getActiveMasterTrialQuest();
				const hasParty     = (player.party || []).length > 0;
				const _profTierLabel = (() => {
					const p = player.activeProfession;
					if (!p || !player.professions?.[p]) return '🎯 Profession';
					const tier = player.professions[p].tier;
					const tierName = PROFESSION_TIER_DATA?.[p]?.tiers?.[tier];
				return tierName ? `🎯 ${p} · ${tierName}` : `🎯 ${p}`;
				})();
				_buildWheel([
					{ label: 'Survival',    icon: 'images/icons/poneti/tools/tool_axe.png',     action: () => { _wheelStack.push(_showActionsWheel); _showSurvivalWheel(); },   disabled: _townEngaged },
					{ label: 'Exploration', icon: 'images/icons/map_icon.png',                action: () => { _wheelStack.push(_showActionsWheel); _showExplorationWheel(); }, disabled: _townEngaged },
					{ label: 'Craft',       icon: 'images/icons/poneti/tools/tool_hammer.png', action: () => { _wheelStack.push(_showActionsWheel); _wheelCraft(); },           disabled: _townEngaged },
					{ label: 'Town',                                                   action: () => { _townEngaged = true; _wheelStack.push(_showActionsWheel); _showTownWheel(); }, disabled: !inSettlement },
					{ label: '💬 Speak',      action: () => { wheel.style.display = 'none'; inputBox.classList.add('visible'); userInput.focus(); },                  disabled: _townEngaged },
					{ label: '🏛️ Guild Trial', action: _doMastersTrial, disabled: !trialQuest },
					{ label: `⚔️ Party${hasParty ? ` (${player.party.length})` : ''}`, action: () => { _wheelStack.push(_showActionsWheel); _showManagePartyWheel(); }, disabled: !hasParty },
					{ label: _profTierLabel,   action: () => { _wheelStack.push(_showActionsWheel); _showProfessionWheel(); } },
				], 'Actions');
				if (typeof _tutCheckActionsForWater === 'function') _tutCheckActionsForWater();
				if (typeof _tutCheckActionsForSearch === 'function') _tutCheckActionsForSearch();
				if (typeof _tutCheckActionsForTown === 'function') _tutCheckActionsForTown();
				if (typeof _tutCheckActionsForSurvival === 'function') _tutCheckActionsForSurvival();
			}

			function _showExplorationWheel() {
				const cell         = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const inSettlement = ['City','CapitalCity','Village'].includes(cell.zone || '');
				const ruinPOI      = (cell.pointsOfInterest || []).find(p => p.type === 'ancient_ruins');
				const ruinExplored = ruinPOI && !!(player.flags?.[`ruin_explored_${player.currentLocation}`]);
				const allFound     = inSettlement && _getUndiscoveredEstabs().length === 0;
				const hasCamp      = !!player.campLocation;
				const searchOrTown = inSettlement
					? { label: allFound ? '🗺️ Fully Explored' : '🔍 Explore Town', action: () => { _wheelStack.push(_showExplorationWheel); _exploreTown(); }, disabled: allFound }
					: { label: 'Search Area', action: () => { _wheelStack.push(_showExplorationWheel); _wheelSearchArea(); } };
				_buildWheel([
					{ label: 'Travel', icon: 'images/icons/map_icon.png', action: () => { _wheelStack.push(_showExplorationWheel); _showTravelWheel(); } },
					searchOrTown,
					{
						label:    hasCamp ? '🏕️ Camp Set' : '🏕️ Find Camping Spot',
						action:   hasCamp
							? () => { addStory('🏕️ You already have a camp set up here.'); _goBack(); }
							: () => { _wheelStack.push(_showExplorationWheel); _doFindCampingSpot(); },
						disabled: hasCamp,
					},
					...(ruinPOI ? [{
						label:    ruinExplored ? '🏛️ Ruins ✓' : '🏛️ Explore Ruins',
						action:   ruinExplored
							? () => { addStory(`🏛️ You've already uncovered what ${ruinPOI.name} had to offer.`); _goBack(); }
							: () => { _wheelStack.push(_showExplorationWheel); _doExploreRuin(ruinPOI); },
						disabled: ruinExplored,
					}] : []),
					..._getSkillActionsForWheel('exploration'),
					{ label: '← Back',     action: _goBack, isBack: true },
				], 'Exploration');
				if (typeof _tutCheckExploration === 'function') _tutCheckExploration();
				if (typeof _tutCheckExplorationForSearch === 'function') _tutCheckExplorationForSearch();
				if (typeof _tutCheckExplorationForTravel === 'function') _tutCheckExplorationForTravel();
			}

			async function _doFindCampingSpot() {
				const COST = 5;
				if ((player.stamina || 0) < COST) {
					addStory('⚠️ Too tired to scout for a camp spot (need 5 stamina). Rest first.');
					if (typeof _tutLowStamina === 'function') _tutLowStamina();
					_goBack(); return;
				}
				_buildWheel([{ label: '🏕️ Scouting…', action: () => {} }]);
				await runInlineProgress('Scouting for a camp spot…', 4000);
				changeStamina(-COST);
				const tier = performSkillCheck('Survival');
				if (tier <= 2) {
					addStory('🏕️ The ground here is too exposed or uneven. Try a different area.');
					_goBack(); return;
				}
				const DESC = [
					'', '', '',
					'🏕️ A sheltered hollow between two mossy boulders — not perfect, but it\'ll do.',
					'🏕️ A decent flat clearing with good natural windbreak from the trees.',
					'🏕️ A near-ideal spot: level ground, hidden from the path, with a natural rock overhang for rain cover.',
				];
				addStory(DESC[Math.min(tier, 5)] || '🏕️ You find a serviceable spot to make camp.');
				player.campLocation = player.currentLocation;
				if (!player.flags) player.flags = {};
				player.flags.camp_spot_scouted = true;
				gainSkillXp('Survival', tier);
				addStory('🏕️ Spot marked. Now choose <strong>Make Camp</strong> from the Action Wheel — go to <strong>Survival → Make Camp</strong>.');
				if (typeof _tutMakeCampHint === 'function') _tutMakeCampHint();
				updateTopStats?.();
				saveGame(true);
				_goBack();
			}

			function _showTravelWheel() {
				const locs = Object.entries(mapData || {})
					.filter(([k, c]) => c.discovered && c.cityVillage && k !== player.currentLocation)
					.map(([k, c]) => ({ coord: k, name: c.cityVillage }));
				const campCoord = player.campLocation;
				const campEntry = campCoord && campCoord !== player.currentLocation
					? { coord: campCoord, name: '🏕️ Encampment' }
					: null;
				const allLocs = [...(campEntry ? [campEntry] : []), ...locs].slice(0, 10);
				_buildWheel([
					...allLocs.map(loc => ({
						label:  loc.name.length > 22 ? loc.name.slice(0, 20) + '…' : loc.name,
						action: () => _travelToCoord(loc.coord),
					})),
					{ label: '🗺️ Open Map', action: () => { _goBack(); window.__contentPanel.open('pane-map'); } },
					{ label: '← Back',      action: _goBack, isBack: true },
				], 'Travel To');
			}

			async function _travelToCoord(destKey) {
				const destCell   = (typeof mapData !== 'undefined' && mapData[destKey]) || {};
				const toMatch    = destKey.match(/^x(\d+)_y(\d+)$/);
				if (!toMatch) return;
				const toX  = +toMatch[1] + GRID_SIZE / 2;
				const toY  = +toMatch[2] + GRID_SIZE / 2;
				const fromMatch = player.currentLocation?.match(/^x(\d+)_y(\d+)$/);
				if (!fromMatch) return;
				const fromX       = +fromMatch[1] + GRID_SIZE / 2;
				const fromY       = +fromMatch[2] + GRID_SIZE / 2;
				const pixelDist   = Math.hypot(toX - fromX, toY - fromY);
				const gridSquares = Math.max(1, Math.round(pixelDist / GRID_SIZE));
				const weightRatio = (typeof calculateTotalWeight === 'function' ? calculateTotalWeight() : 0) / Math.max(1, player.maxCarryWeight || 50);
				const carryExtra  = Math.round(weightRatio * gridSquares);
				const staminaCost = gridSquares * 3 + carryExtra;
				if (staminaCost > player.maxStamina) {
					addStory('⛔ That distance is too far to travel in a single journey.');
					_goBack(); return;
				}
				if (player.stamina < staminaCost) {
					addStory('⚠️ You are too exhausted for that journey. Rest first.');
					_goBack(); return;
				}
				window.__contentPanel.open('pane-story');
				await executeTravelTo(destKey, toX, toY, gridSquares, staminaCost);
			}

			// ── Biome Forage Profiles ──────────────────────────────────────────────
			// Maps each biome to searchable categories, each with a weighted item pool.
			// Weight is relative — higher = more likely on a good roll.
			const BIOME_FORAGE = {
				Forest: {
					summary: 'mushrooms, berries, healing herbs, roots, and fallen wood',
					categories: {
						herbs:     { label: '🌿 Search for Herbs',     skill: 'Herbalism', items: [['Healing Herb',4],['Yarrow',3],['Milkweed',2],['Valerian Root',2],['Ginseng Root',1]] },
						berries:   { label: '🫐 Search for Berries',    skill: 'Foraging',  items: [['Wild Berries',4],['Elderberry',2],['Blackcurrant',2],['Gooseberry',1],['Strawberry',1]] },
						mushrooms: { label: '🍄 Search for Mushrooms',  skill: 'Foraging',  items: [['Edible Mushrooms',4],['Chanterelle',3],['Fly Agaric',2],['Stinkhorn',1],['Death Cap',1]] },
						roots:     { label: '🌱 Search for Roots',      skill: 'Foraging',  items: [['Gnarled Root',3],['Ginseng Root',2],['Lungwort',2],['Dry Leaves',3]] },
						wood:      { label: '🪵 Search for Wood',        skill: 'Survival',  items: [['Sticks',4],['Bundle of Sticks',3],['Log',2],['Branch Bundle',1]] },
					}
				},
				Plains: {
					summary: 'wildflowers, meadow herbs, berries, seeds, and grain',
					categories: {
						herbs:   { label: '🌿 Search for Herbs',        skill: 'Herbalism', items: [['Basil',3],['Parsley',3],['Dill',3],['Milkweed',2],['Sage',1]] },
						berries: { label: '🫐 Search for Berries',       skill: 'Foraging',  items: [['Wild Berries',3],['Strawberry',2],['Gooseberry',1]] },
						flowers: { label: '🌸 Search for Flowers',       skill: 'Foraging',  items: [['Chamomile',3],['Wild Violet',2],['Meadow Flowers',3],['Wildflower Cluster',3],['Snapdragon',1]] },
						seeds:   { label: '🌾 Search for Seeds & Grain', skill: 'Foraging',  items: [['Wheat',3],['Peanut',2],['Spikelets',2]] },
						wood:    { label: '🪵 Search for Fallen Wood',   skill: 'Survival',  items: [['Sticks',3],['Bundle of Sticks',2]] },
					}
				},
				Hills: {
					summary: 'root herbs, wild berries, hillside stones, and wildflowers',
					categories: {
						herbs:   { label: '🌿 Search for Herbs',   skill: 'Herbalism', items: [['Ginseng Root',3],['Valerian Root',2],['Yarrow',2],['Sage',2],['Wormwood',1]] },
						berries: { label: '🫐 Search for Berries',  skill: 'Foraging',  items: [['Wild Berries',3],['Elderberry',2],['Blackcurrant',1]] },
						stones:  { label: '🪨 Search for Stones',   skill: 'Survival',  items: [['Stone Fragments',3],['Loose Stones',3],['Pebbles',2],['Iron Ore',1]] },
						roots:   { label: '🌱 Search for Roots',    skill: 'Foraging',  items: [['Gnarled Root',3],['Ginseng Root',2]] },
					}
				},
				Mountain: {
					summary: 'ore seams, stone deposits, alpine herbs, and cave roots',
					categories: {
						stones:   { label: '🪨 Search for Stone',     skill: 'Survival',  items: [['Stone Fragments',4],['Loose Stones',3],['Pebbles',2]] },
						minerals: { label: '⛏️ Search for Ore',        skill: 'Mining',    items: [['Iron Ore',3],['Copper Ore',2],['Coal',2],['Silver Ore',1]] },
						herbs:    { label: '🌿 Search for Alpine Herbs', skill: 'Herbalism', items: [['Wormwood',2],['Ginseng Root',2],['Milkweed',1],['Sage',1]] },
						roots:    { label: '🌱 Search for Roots',       skill: 'Foraging',  items: [['Gnarled Root',2],['Ginseng Root',1]] },
					}
				},
				Wetlands: {
					summary: 'marsh herbs, mushrooms, reeds, roots, and dark berries',
					categories: {
						herbs:     { label: '🌿 Search for Marsh Herbs',   skill: 'Herbalism', items: [['Milkweed',3],['Marsh Marigold',2],['Valerian Root',2],['Basil',1],['Yarrow',1]] },
						mushrooms: { label: '🍄 Search for Mushrooms',      skill: 'Foraging',  items: [['Edible Mushrooms',3],['Stinkhorn',2],['Chanterelle',1]] },
						roots:     { label: '🌱 Search for Roots',          skill: 'Foraging',  items: [['Gnarled Root',3],['Ginseng Root',1]] },
						berries:   { label: '🫐 Search for Berries',         skill: 'Foraging',  items: [['Wild Berries',2],['Elderberry',2],['Blackcurrant',1]] },
					}
				},
				Coastal: {
					summary: 'seaweed, sea kale, salt flats, driftwood, and shellfish',
					categories: {
						seaplants: { label: '🌊 Search for Sea Plants', skill: 'Foraging',  items: [['Seaweed',4],['Sea Kale',3],['Fresh Seaweed',2],['Asparagus',1]] },
						wood:      { label: '🪵 Search for Driftwood',  skill: 'Survival',  items: [['Sticks',3],['Log',2],['Branch Bundle',1]] },
						stones:    { label: '🪨 Search for Stones',      skill: 'Survival',  items: [['Pebbles',4],['Stone Fragments',2],['Loose Stones',1]] },
					}
				},
				Tundra: {
					summary: 'frost-resistant herbs, tough roots, stone outcrops, and lichen',
					categories: {
						herbs:  { label: '🌿 Search for Frost Herbs', skill: 'Herbalism', items: [['Wormwood',2],['Milkweed',1],['Ginseng Root',1],['Lungwort',1]] },
						roots:  { label: '🌱 Search for Roots',        skill: 'Foraging',  items: [['Gnarled Root',2],['Ginseng Root',1]] },
						stones: { label: '🪨 Search for Stone & Ore',  skill: 'Survival',  items: [['Stone Fragments',3],['Loose Stones',2],['Pebbles',2],['Iron Ore',1]] },
					}
				},
				Lake: {
					summary: 'water plants, reeds, and waterside herbs',
					categories: {
						seaplants: { label: '🌊 Search for Water Plants',  skill: 'Foraging',  items: [['Fresh Seaweed',2],['Seaweed',1],['Asparagus',1]] },
						herbs:     { label: '🌿 Search for Waterside Herbs', skill: 'Herbalism', items: [['Milkweed',2],['Parsley',2],['Dill',1],['Marsh Marigold',1]] },
						roots:     { label: '🌱 Search for Roots',            skill: 'Foraging',  items: [['Gnarled Root',2]] },
					}
				},
				River: {
					summary: 'riverbank herbs, clay, water plants, and pebbles',
					categories: {
						herbs:     { label: '🌿 Search for Riverbank Herbs', skill: 'Herbalism', items: [['Milkweed',2],['Dill',2],['Parsley',2],['Marsh Marigold',1]] },
						seaplants: { label: '🌊 Search for Water Plants',     skill: 'Foraging',  items: [['Fresh Seaweed',1],['Asparagus',1]] },
						stones:    { label: '🪨 Search for Pebbles & Clay',   skill: 'Survival',  items: [['Pebbles',4],['Dried Clay',2],['Stone Fragments',1]] },
					}
				},
				Ocean: {
					summary: 'seaweed, kelp, and driftwood',
					categories: {
						seaplants: { label: '🌊 Search for Sea Plants', skill: 'Foraging', items: [['Seaweed',4],['Fresh Seaweed',2]] },
						wood:      { label: '🪵 Search for Driftwood',  skill: 'Survival', items: [['Sticks',2],['Log',1]] },
					}
				},
			};
			BIOME_FORAGE['Mountains'] = BIOME_FORAGE['Mountain'];

			async function _wheelSearchArea() {
				_buildWheel([{ label: '🔍 Searching…', action: () => {} }]);
				await runInlineProgress('Searching the area…', 4000);
				const tier = performSkillCheck('Tracking');
				checkQuestObjectives?.('surroundings_checked');

				const cell   = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const biome  = cell.biome || '';
				const estabs = (cell.establishments || []).map(e => e.name).filter(Boolean);
				const pois   = (cell.pointsOfInterest || []).map(p => p.name).filter(Boolean);
				const fProf  = BIOME_FORAGE[biome] || null;
				const inTown = ['City','CapitalCity','Village'].includes(cell.zone || '');

				if (tier === 1) {
					addStory('🔍 You find nothing of interest here. Perhaps a sharper eye is needed.');
					_goBack(); return;
				}

				// All tiers ≥2: describe the location
				addStory(`🔍 ${cell.description || 'You scan your surroundings carefully.'}`);

				if (tier >= 3) {
					if (estabs.length) addStory(`📍 You spot signs of habitation: ${estabs.join(', ')}.`);
					else if (pois.length) addStory(`📍 Something of note nearby: ${pois[0]}.`);
				}

				// Always tell the player what the land offers before showing category choices
				if (fProf && !inTown && tier >= 2) {
					addStory(`🌿 The ${biome.toLowerCase()} around you looks like it could yield ${fProf.summary}. You can search more carefully for specific things.`);
				}

				if (tier >= 4) {
					// Mark adjacent undiscovered notable cells with '?' — never reveal distant cells
					const locMatch = player.currentLocation.match(/^x(\d+)_y(\d+)$/);
					if (locMatch) {
						const cx = +locMatch[1], cy = +locMatch[2];
						let markedAny = false;
						for (let dx = -1; dx <= 1; dx++) {
							for (let dy = -1; dy <= 1; dy++) {
								if (dx === 0 && dy === 0) continue;
								const adjKey = `x${cx + dx}_y${cy + dy}`;
								const adjCell = mapData[adjKey];
								if (!adjCell || adjCell.discovered) continue;
								if (adjCell.zone || adjCell.establishments?.length || adjCell.pointsOfInterest?.length) {
									// Mark visible on map without full discovery
									if (!player.fogRevealedCells) player.fogRevealedCells = {};
									player.fogRevealedCells[adjKey] = true;
									markedAny = true;
								}
							}
						}
						if (markedAny) {
							addStory('🗺️ You notice something nearby and mark it on your map.');
							if (typeof setupMap === 'function') setupMap();
						}
					}
				}

				if (tier >= 5) {
					// Instant bonus find
					const bonusPool = fProf
						? Object.values(fProf.categories)[0].items.slice(0, 3).map(([n]) => n)
						: ['Wild Berries', 'Kindling', 'Sticks'];
					const found = bonusPool[Math.floor(Math.random() * bonusPool.length)];
					addItem(found, 1);
					addStory(`✨ Your sharp eye spots <strong>${found}</strong> right away.`);
					if (Math.random() < 0.25) awardRecipeScroll();
					gainSkillXp('Foraging', tier);
				}

				// 15% chance of encounter while searching wilderness
				if (!inTown && Math.random() < 0.15) {
					await fireRandomEvent('search', ['creature_encounter', 'hazard', 'discovery', 'mystical', 'traveler_encounter']);
				}

				// Offer targeted category searches if biome has forage data
				if (fProf && !inTown && tier >= 2) {
					_showForageWheel(biome, fProf);
				} else {
					_goBack();
				}
			}

			function _showForageWheel(biome, fProf) {
				const cats = Object.entries(fProf.categories);
				_buildWheel([
					...cats.map(([, cat]) => ({
						label:  cat.label,
						action: () => { _wheelStack.push(() => _showForageWheel(biome, fProf)); _doForageSearch(cat); },
					})),
					{ label: '← Done Searching', action: _goBack, isBack: true },
				], `Search ${biome}`);
			}

			async function _doForageSearch(cat) {
				_buildWheel([{ label: '⏳ Searching…', action: () => {} }]);
				await runInlineProgress(`${cat.label.replace(/^[^ ]+ /, '')}…`, 3000);
				changeStamina(-2);
				const tier = performSkillCheck(cat.skill);

				if (tier <= 1) {
					addStory('🔍 You search carefully but find nothing of the sort here.');
				} else {
					// Weighted random pick from pool
					const pool        = cat.items;
					const totalWeight = pool.reduce((s, [, w]) => s + w, 0);
					const numFinds    = tier >= 4 ? 2 : 1;
					const found       = new Map();
					for (let i = 0; i < numFinds; i++) {
						let r = Math.random() * totalWeight;
						for (const [name, w] of pool) {
							r -= w;
							if (r <= 0) { found.set(name, (found.get(name) || 0) + 1); break; }
						}
					}
					const bonus = tier === 5 ? randomInt(1, 2) : 0;
					for (const [name, qty] of found) addItem(name, qty + bonus);
					gainSkillXp(cat.skill, tier);
				}
				_goBack();
			}

			async function _doExploreRuin(ruin) {
				const coordKey = player.currentLocation;
				if (!player.flags) player.flags = {};
				_buildWheel([{ label: '🏛️ Exploring…', action: () => {} }]);
				addStory(`🏛️ You approach <strong>${ruin.name}</strong>.`);
				if (ruin.description) addStory(ruin.description);
				await runInlineProgress('Searching the ruins…', 4000);
				const tier = performSkillCheck('Lore');
				addWorldEvent(`Explored ruins: ${ruin.name}.`, 'exploration');
				if (tier >= 2) {
					player.flags[`ruin_explored_${coordKey}`] = ruin.name;
					const fragDef = (typeof ITEM_DATA !== 'undefined' && ITEM_DATA['Ancient Artifact Fragment'])
						? ITEM_DATA['Ancient Artifact Fragment']
						: { type: 'misc', consumable: false, wearable: false, burnTime: 0, condition: 'None', rarity: 'Rare', weight: 0.2, value: 0, description: 'A fragment of an ancient device covered in runic inscriptions unlike any known script. One of twelve.' };
					addItem('Ancient Artifact Fragment', 1, fragDef);
					const fragCount = player.inventory?.['Ancient Artifact Fragment']?.quantity || 0;
					addStory(`🏺 Among the debris you uncover a strange carved fragment covered in runic inscriptions unlike any you've seen before.`);
					addStory(`📦 <em>Ancient Artifact Fragment — ${fragCount} of 12 found.</em>`);
					if (fragCount === 1) {
						if (!player.journal.quests) player.journal.quests = [];
						if (!player.journal.quests.find(q => q.id === 'the_scattered_pieces')) {
							player.journal.quests.push({ id: 'the_scattered_pieces', title: 'The Scattered Pieces', name: 'The Scattered Pieces', status: 'Active', objectiveIndex: 0 });
							addStory(`📜 <em>Quest begun: <strong>The Scattered Pieces</strong>.</em>`);
							addWorldEvent(`Quest started: The Scattered Pieces.`, 'quest');
						}
					}
					learnRandomLore('site', { source: 'site' });
					gainExperience(35);
					gainSkillXp('Lore', tier);
					// Ruins often contain old texts — 30% chance of a recipe scroll
					if (Math.random() < 0.30) awardRecipeScroll();
					if (fragCount >= 12) {
						addStory(`🏺 <em>You now hold all twelve fragments. They hum faintly in unison — something stirs.</em>`);
						const sp = player.journal.quests?.find(q => q.id === 'the_scattered_pieces');
						if (sp) sp.status = 'Completed';
						if (!player.journal.quests.find(q => q.id === 'whispers_of_the_ancients')) {
							player.journal.quests.push({ id: 'whispers_of_the_ancients', title: 'Whispers of the Ancients', name: 'Whispers of the Ancients', status: 'Active', objectiveIndex: 0 });
							addStory(`📜 <em>Quest begun: <strong>Whispers of the Ancients</strong>.</em>`);
							addWorldEvent(`Quest started: Whispers of the Ancients.`, 'quest');
							player.flags['all_fragments_collected'] = true;
							checkGlobalEventTriggers();
						}
					}
					updateJournal();
					updateTopStats();
				} else {
					addStory(`🏛️ The ruins are too badly damaged and overgrown. You find nothing you can retrieve.`);
				}
				_goBack();
			}

			function _showSurvivalWheel() {
				const hasBow       = Object.keys(player.inventory || {}).some(k => /bow/i.test(k)    && (player.inventory[k].quantity ?? 1) > 0);
				const hasArrows    = Object.entries(player.inventory || {}).some(([k, v]) => /arrow/i.test(k) && (v.quantity ?? 0) > 0);
				const WATER_BIOMES = ['River', 'Lake', 'Coastal', 'Wetlands', 'Ocean'];
				const survCell     = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const nearWater    = WATER_BIOMES.includes(survCell.biome);
				const isInjured    = !!(player.conditions || []).find(c => c.id === 'injured');
				const isExhausted  = !!(player.conditions || []).find(c => c.id === 'exhausted');
				const inSettlement = ['City','CapitalCity','Village'].includes(survCell.zone || '');
				const atCamp       = campSetup && player.campLocation === player.currentLocation;
				const hasFoods     = Object.values(player.inventory || {}).some(v => (v?.type === 'food' || v?.type === 'potion') && (v.quantity ?? 0) > 0);
				_buildWheel([
					{ label: 'Eat',     action: () => { _wheelStack.push(_showSurvivalWheel); _wheelEat(); }, disabled: !hasFoods },
					{ label: 'Rest',    icon: 'images/icons/bedroll.png',                          action: _wheelRest },
					{ label: 'Hunt',    icon: 'images/icons/bow-arrows.png',                       action: _wheelHunt,  disabled: !(hasBow && hasArrows) || isInjured || isExhausted || inSettlement },
					{ label: 'Fish',    icon: 'images/icons/poneti/tools/tool_fishing_rod.png',    action: _wheelFish,  disabled: !nearWater || isExhausted || inSettlement },
					{ label: 'Gather',  icon: 'images/icons/sticks.png',                            action: () => { _wheelStack.push(_showSurvivalWheel); _wheelGather(); }, disabled: isExhausted || inSettlement },
					campSetup
						? { label: 'Encampment', icon: 'images/icons/shelter.png', action: () => { _wheelStack.push(_showSurvivalWheel); _showCampWheel(); }, disabled: !atCamp }
						: { label: 'Make Camp',  icon: 'images/icons/shelter.png', action: _wheelSetupCamp, disabled: inSettlement || !player.flags?.camp_spot_scouted },
					..._getSkillActionsForWheel('survival'),
					{ label: '← Back', action: _goBack, isBack: true },
				], 'Survival');
				if (typeof _tutCheckSurvivalForWater === 'function') _tutCheckSurvivalForWater();
				if (typeof _tutCheckSurvivalForMakeCamp === 'function') _tutCheckSurvivalForMakeCamp();
				if (typeof _tutCheckSurvivalForHunt === 'function') _tutCheckSurvivalForHunt();
				if (typeof _tutCheckSurvivalForEncampment === 'function') _tutCheckSurvivalForEncampment();
				if (typeof _tutCheckSurvivalForGatherSticks === 'function') _tutCheckSurvivalForGatherSticks();
			}

			function _wheelEat() {
				const foods = Object.entries(player.inventory || {}).filter(([, v]) => (v?.type === 'food' || v?.type === 'potion') && (v.quantity ?? 0) > 0);
				if (!foods.length) { addStory('🍽️ You have nothing to eat or drink.'); _goBack(); return; }
				_buildWheel([
					...foods.slice(0, 6).map(([name]) => ({
						label:  name.length > 20 ? name.slice(0, 18) + '…' : name,
						action: () => { eatItem(name); _goBack(); }
					})),
					{ label: '← Back', action: _goBack, isBack: true },
				], 'Eat');
			}

			// Shared item effect applicator — reads baseEffect from Items database.
			function applyItemEffect(itemName, itemData) {
				const dbData = (typeof findItemInDatabase === 'function') ? findItemInDatabase(itemName) : null;
				const fx     = dbData?.baseEffect || itemData?.baseEffect || {};
				if (fx.life)            changeLife(fx.life);
				if (fx.stamina)         changeStamina(fx.stamina);
				if (fx.mana)            changeMana(fx.mana);
				if (fx.removeCondition) removeCondition(fx.removeCondition);
				if (fx.applyCondition)  applyCondition(fx.applyCondition, fx.duration);
			}

			// Heuristic stamina for foods not in the Items database (cooked meat, stews, etc.)
			function _fallbackStaminaGain(itemName, item) {
				const cond = (item?.condition || '').toLowerCase();
				const name = itemName.toLowerCase();
				// Check COOK_CONDITION_EFFECTS first (keyed by exact condition string)
				if (item?.condition && typeof COOK_CONDITION_EFFECTS !== 'undefined' && COOK_CONDITION_EFFECTS[item.condition]) {
					return COOK_CONDITION_EFFECTS[item.condition].stamina;
				}
				if (cond.includes('perfectly') || cond.includes('excellent')) return 26;
				if (cond.includes('well'))                                      return 20;
				if (cond.includes('cooked'))                                    return 15;
				if (cond.includes('overcooked'))                                return 11;
				if (cond.includes('undercooked'))                               return 9;
				if (cond.includes('burnt'))                                     return 6;
				if (cond.includes('charred'))                                   return 3;
				if (name.includes('raw'))                                       return 5;
				if (name.includes('stew') || name.includes('broth'))          return 20;
				if (name.includes('berr') || name.includes('mushroom') || name.includes('nut')) return 8;
				if (name.includes('ration'))                                   return 12;
				return 10;
			}

			function eatItem(itemName) {
				const item = player.inventory[itemName];
				if (!item || (item.quantity ?? 0) < 1) { addStory(`⛔ No ${itemName} to eat.`); return; }

				if (item.type === 'potion') {
					removeItem(itemName, 1);
					applyItemEffect(itemName, item);
					addStory(`🧪 You drink the ${itemName}.`);
					return;
				}

				const dbData = (typeof findItemInDatabase === 'function') ? findItemInDatabase(itemName) : null;

				// Material-type herbs/plants with consumable:true — apply full baseEffect
				if (item.type === 'material' || (dbData?.type === 'material')) {
					const fx = dbData?.baseEffect || item.baseEffect || {};
					const parts = [];
					removeItem(itemName, 1);
					if (fx.life)    { player.life    = Math.max(0, Math.min(player.maxLife,    (player.life    || 0) + fx.life));    parts.push(`${fx.life > 0 ? '+' : ''}${fx.life} life`); }
					if (fx.stamina) { changeStamina(fx.stamina); parts.push(`${fx.stamina > 0 ? '+' : ''}${fx.stamina} stamina`); }
					if (fx.mana)    { player.mana    = Math.max(0, Math.min(player.maxMana,    (player.mana    || 0) + fx.mana));    parts.push(`${fx.mana > 0 ? '+' : ''}${fx.mana} mana`); }
					if (fx.condition) applyCondition(fx.condition, fx.conditionDuration || 3);
					updateTopStats?.();
					const effectTxt = parts.length ? ` (${parts.join(', ')})` : '';
					addStory(`🌿 You consume the ${itemName}.${effectTxt}`);
					return;
				}

				// Food: use baseEffect from Items DB; fall back to heuristics for dynamic food
				const staminaGain = dbData?.baseEffect?.stamina ?? _fallbackStaminaGain(itemName, item);
				const lifeGain    = dbData?.baseEffect?.life    ?? Math.max(1, Math.floor(staminaGain / 2));

				removeItem(itemName, 1);
				changeStamina(staminaGain);
				player.life = Math.max(0, Math.min(player.maxLife, (player.life || 0) + lifeGain));
				updateTopStats?.();
				consumeFood(itemName);
				addStory(`🍽️ You eat the ${itemName}. +${staminaGain} stamina, +${lifeGain} life.`);
				checkQuestObjectives?.('food_eaten');
				// 10% chance that eating something well-prepared sparks recipe insight
				const _isCooked = item && /cooked|roasted|smoked|baked|dried/i.test(item.condition || itemName);
				if (_isCooked && Math.random() < 0.10) {
					const _insight = _pickUnknownCookingRecipe();
					if (_insight) {
						learnRecipe(_insight);
						addStory(`💡 <em>Something about the flavour sparks an idea — you think you could make this yourself.</em>`);
					}
				}
			}

			function _showCampWheel() {
				_buildWheel([
					{ label: 'Campfire',   icon: 'images/icons/campfire-lit.png', action: () => { _wheelStack.push(_showCampWheel); _wheelCampfire(); } },
					{ label: 'Shelter',    icon: 'images/icons/shelter.png',      action: () => { _wheelStack.push(_showCampWheel); _wheelShelter();  } },
					{ label: 'Break Camp', icon: 'images/icons/leave.png',        action: _wheelBreakCamp },
					{ label: '← Back',    action: _goBack, isBack: true },
				], 'Encampment');
				if (typeof _tutCheckCampWheelForObj === 'function') _tutCheckCampWheelForObj();
			}

			function _showCampSupplies() {
				const supplies = (player.campSupplies || []).filter(s => (s.quantity ?? 0) > 0);
				if (!supplies.length) {
					addStory('📦 Camp supplies: (empty)');
				} else {
					const list = supplies.map(s => `${s.name} ×${s.quantity}`).join(', ');
					addStory(`📦 Camp supplies: ${list}`);
				}
				_goBack();
			}

			async function _wheelRest() {
				const _restCell   = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const _restInTown = ['City','CapitalCity','Village'].includes(_restCell.zone || '');
				_buildWheel([{ label: '⏳ Resting…', action: () => {} }]);
				await runInlineProgress('Resting…', 10000);
				const tier = performSkillCheck('Survival');
				let gain = 0;
				if (tier === 1) {
					addStory(_restInTown ? '🔔 A commotion outside jolts you awake. No rest gained.' : '⚔️ Ambushed! Rest interrupted.');
				} else if (tier === 2) {
					addStory(_restInTown ? '🔊 Noise from the street keeps you from sleep. No rest gained.' : '🐾 Disturbed by wildlife. No rest gained.');
				} else if (tier === 3) {
					gain = Math.max(0, Math.floor(player.maxStamina * 0.75) - player.stamina);
					changeStamina?.(gain);
					addStory(`😴 Partially rested (+${gain} stamina).`);
				} else if (tier === 4) {
					gain = Math.max(0, player.maxStamina - player.stamina);
					changeStamina?.(gain);
					addStory(`😴 Well rested (+${gain} stamina).`);
				} else {
					changeStamina?.(player.maxStamina - player.stamina);
					applyCondition('rejuvenated', 5);
					addStory('✨ Fully rested. (Rejuvenated buff)');
				}
				// Snare check
				if (player.snarePlaced) {
					player.snarePlaced = false;
					const snareTier = performSkillCheck('Tracking');
					if (snareTier >= 3) {
						const qty = snareTier >= 5 ? 2 : 1;
						addItem('Raw Rabbit Meat', qty, { type: 'food', weight: 0.4, rarity: 'Common', consumable: true, description: 'Lean rabbit meat, fresh from the snare.' });
						addStory(`🪤 Your snare caught ${qty === 2 ? 'two rabbits' : 'a rabbit'} while you rested!`);
						awardProfessionXp('hunt');
					} else {
						addStory('🪤 Your snare was empty — either missed or sprung without catching anything.');
					}
				}
				// Random event during rest (20% camp, 10% town)
				const _restEventChance = _restInTown ? 0.10 : 0.20;
				if (Math.random() < _restEventChance) {
					const _restCtx   = _restInTown ? 'tavern' : 'camp';
					const _restTypes = _restInTown
						? ['hazard', 'traveler_encounter']
						: ['creature_encounter', 'hazard', 'discovery', 'mystical', 'traveler_encounter', 'merchant_encounter'];
					await fireRandomEvent(_restCtx, _restTypes);
				}
				_showSurvivalWheel();
			}

			async function _wheelSetupCamp() {
				campSetup = true;
				player.campLocation = player.currentLocation || null;
				player.currentAction = 'Setting up camp';
				_buildWheel([{ label: '⏳ Setting up…', action: () => {} }]);
				addStory('🏕️ Setting up camp…');
				await runInlineProgress('Setting up camp…', 3000);
				refreshEncampmentBuiltStates?.();
				try { await grantSetupFinds?.(); } catch (e) {}
				updateComfortProtection?.();
				addStory('🏕️ Camp is ready. Your campsite is marked on the map.');
				if (!player.flags?.tutorialComplete && !player.flags?.tutStartingSuppliesGiven) {
					if (!player.flags) player.flags = {};
					player.flags.tutStartingSuppliesGiven = true;
					addCampSupply('Stone', 6);
					addCampSupply('Kindling', 1);
					addCampSupply('Stick Bundle', 3);
				}
				gainSkillXp('Survival', 3);
				if (!player.flags) player.flags = {};
				player.flags.camp_spot_found = true;
				checkQuestObjectives?.('camp_spot_found');
				renderMapsPanel?.();
				player.currentAction = 'Idle';
				saveGame(true);
				_showSurvivalWheel();
			}

			async function _wheelBreakCamp() {
				_buildWheel([{ label: '⏳ Breaking…', action: () => {} }]);
				addStory('🎒 Breaking camp…');
				await runInlineProgress('Breaking camp…', 2000);
				campSetup = false;
				player.campLocation = null;
				player.hasCampfire  = false;
				player.hasFire      = false;
				player.hasShelter   = false;
				player.shelterLevel = 0;
				player.defenses     = [];
				setBuiltIcon?.('campfire-button', false);
				setBuiltIcon?.('shelter-button',  false);
				setBuiltIcon?.('defenses-button', false);
				updateComfortProtection?.();
				updateCampSuppliesGrid?.();
				addStory('🎒 Camp broken. Campsite removed from map.');
				renderMapsPanel?.();
				saveGame(true);
				_showSurvivalWheel();
			}

			function _wheelGather() {
				const gatherOpts = [
					{ label: 'Gather Sticks',     cost: 2, icon: 'images/icons/sticks.png'                                      },
					{ label: 'Gather Small Logs', cost: 4, icon: 'images/icons/firewood.png'                                     },
					{ label: 'Gather Large Logs', cost: 6, icon: 'images/icons/large-firewood.png'                               },
					{ label: 'Gather Stones',     cost: 3, icon: 'images/icons/poneti/ingredients/stones.png'                        },
					{ label: 'Gather Kindling',   cost: 1, icon: 'images/icons/poneti/ingredients/grass.png'                     },
					{ label: 'Forage',            cost: 3, icon: 'images/icons/poneti/ingredients/berry_herb.png'                },
				];
				_buildWheel([
					...gatherOpts.map(data => ({
						label:  data.label,
						icon:   data.icon,
						action: async () => {
							_buildWheel([{ label: '⏳ Gathering…', action: () => {} }]);
							await handleGatherAttempt({ tool: data.label, cost: data.cost, label: data.label });
							_goBack();
						}
					})),
					{ label: 'Water', icon: 'images/icons/poneti/misc/waterskin.png', action: () => { _wheelStack.push(_wheelGather); _wheelWater(); } },
					..._getSkillActionsForWheel('gather'),
					{ label: '← Back', action: _goBack, isBack: true },
				], 'Gather');
				if (typeof _tutCheckGatherForWater === 'function') _tutCheckGatherForWater();
				if (typeof _tutCheckGatherForFire === 'function') _tutCheckGatherForFire();
				if (typeof _tutCheckGatherForSticks === 'function') _tutCheckGatherForSticks();
			}

			async function _doGatherWater() {
				if (player.stamina < 2) { addStory("⚠️ You're too exhausted to gather."); return; }
				changeStamina(-2);
				await runInlineProgress('Searching for a water source…', 3000);

				const waterBiomes = ['River', 'Lake', 'Coastal', 'Wetlands', 'Ocean'];
				const cell  = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const nearWater = waterBiomes.includes(cell.biome);

				// Near water = DC 8 via Survival; dry land = DC 14
				const base   = Math.floor(Math.random() * 20) + 1;
				const bonus  = getSkillBonus('Survival');
				const roll   = Math.min(20, base + bonus);
				const dc     = nearWater ? 8 : 14;
				gainSkillXp('Survival', roll >= dc ? 4 : 2);
				addStory(`🎲 Rolled ${base}${bonus > 0 ? ` +${bonus} (Survival Lv${player.skills['Survival']?.level})` : ''} = ${roll} vs DC ${dc}`);

				if (roll < dc) {
					addStory(nearWater
						? '💧 The stream is there but the banks are treacherous. You return empty-handed.'
						: '💧 You search but find no water source in this terrain.');
					return;
				}

				addStory(nearWater
					? '💧 You find a clear stream and drink your fill.'
					: '💧 You locate a small hidden spring and refill your water.');
				const _gatherEmptyKey = Object.keys(player.inventory || {}).find(k => /waterskin/i.test(k) && !/full/i.test(k));
				if (_gatherEmptyKey) removeItem(_gatherEmptyKey, 1);
				addItem('Waterskin (Full)', 1, { type: 'misc', weight: 1, rarity: 'Common', consumable: true, description: 'A waterskin filled with fresh water.' });
				checkQuestObjectives?.('water_refilled');
			}

			async function _doSearchForWater() {
				const emptyKey = Object.keys(player.inventory || {}).find(k => /waterskin/i.test(k) && !/full/i.test(k));
				if (!emptyKey) {
					addStory('⛔ You need a waterskin to carry water.');
					_goBack(); return;
				}
				if (player.stamina < 2) { addStory("⚠️ You're too exhausted to search."); _goBack(); return; }

				_buildWheel([{ label: '⏳ Searching…', action: () => {} }]);
				changeStamina(-2);
				await runInlineProgress('Searching for a water source…', 4000);

				const cell  = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const biome = cell.biome || 'Plains';

				const DC_MAP = {
					River: 5, Lake: 5, Coastal: 6, Coast: 6, Ocean: 7,
					Wetlands: 8, Swamp: 9,
					Forest: 10,
					Hills: 12, Plains: 12, Grassland: 12,
					Mountain: 14, Cave: 13,
					Tundra: 16, Desert: 19,
				};
				const dc    = DC_MAP[biome] ?? 12;
				const base  = !player.flags?.tutorialComplete ? 20 : Math.floor(Math.random() * 20) + 1;
				const bonus = getSkillBonus('Survival');
				const roll  = Math.min(20, base + bonus);
				gainSkillXp('Survival', roll >= dc ? 4 : 2);
				addStory(`🎲 Rolled ${base}${bonus > 0 ? ` +${bonus} (Survival)` : ''} = ${roll} vs DC ${dc} (${biome})`);

				if (roll < dc) {
					const failLines = {
						Desert:  'The cracked earth offers nothing. No water anywhere.',
						Tundra:  'Everything is frozen. You can\'t extract usable water.',
						Mountain:'The rock faces yield no springs here.',
						Swamp:   'There\'s moisture everywhere but none you\'d dare drink.',
					};
					addStory(`💧 ${failLines[biome] || 'You search the area but find no water source.'}`);
					_goBack(); return;
				}

				const successLines = {
					River:    'You kneel at the river\'s edge and fill your waterskin.',
					Lake:     'You fill your waterskin from the still lake water.',
					Ocean:    'You find a freshwater spring near the shore.',
					Coastal:  'A freshwater spring trickles down the cliffs. You fill up.',
					Wetlands: 'A clear spring bubbles up among the reeds.',
					Swamp:    'After careful searching you find a surprisingly clean spring.',
					Forest:   'A hidden stream winds through the roots. You fill your skin.',
					Mountain: 'Snowmelt trickles down a rockface into a clean pool.',
					Cave:     'A dripping stalactite fills your waterskin drop by drop.',
					Tundra:   'You melt enough clean ice to fill your waterskin.',
					Desert:   'Against all odds you spot a desert spring. You fill up quickly.',
				};
				addStory(`💧 ${successLines[biome] || 'You locate a small spring and fill your waterskin.'}`);

				removeItem(emptyKey, 1);
				addItem('Waterskin (Full)', 1, { type: 'misc', weight: 1, rarity: 'Common', consumable: true, description: 'A waterskin filled with fresh water.' });
				checkQuestObjectives?.('water_refilled');
				_goBack();
			}

			function _wheelWater() {
				const hasEmptyWaterskin = Object.keys(player.inventory || {}).some(k => /waterskin/i.test(k) && !/full/i.test(k));
				const hasFullWaterskin  = Object.keys(player.inventory || {}).some(k => /waterskin/i.test(k) &&  /full/i.test(k));
				const waterBiomes       = ['River', 'Lake', 'Coastal', 'Wetlands', 'Ocean'];
				const cell              = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const nearWater         = waterBiomes.includes(cell.biome);
				_buildWheel([
					{ label: 'Fill Waterskin',    icon: 'images/icons/poneti/misc/waterskin.png', action: _doSearchForWater,  disabled: !hasEmptyWaterskin },
					{ label: 'Drink Waterskin',   icon: 'images/icons/poneti/misc/waterskin.png', action: _doDrinkWaterskin,  disabled: !hasFullWaterskin },
					{ label: 'Drink from Source', icon: 'images/icons/poneti/misc/wood_cup.png',  action: _doDrinkFromSource, disabled: !nearWater },
					{ label: '← Back',            action: _goBack, isBack: true },
				], 'Water');
				if (typeof _tutCheckWaterSubWheel === 'function') _tutCheckWaterSubWheel();
			}

			function _doDrinkWaterskin() {
				const fullKey = Object.keys(player.inventory || {}).find(k => /waterskin/i.test(k) && /full/i.test(k));
				if (!fullKey) { addStory('⛔ You have no filled waterskin.'); _goBack(); return; }
				removeItem(fullKey, 1);
				addItem('Waterskin', 1, { type: 'misc', weight: 0.5, rarity: 'Common', consumable: false, description: 'An empty waterskin.' });
				applyCondition('hydrated', 5);
				addStory('💧 You drink deeply from your waterskin. The cool water refreshes you.');
				_goBack();
			}

			async function _doDrinkFromSource() {
				const waterBiomes = ['River', 'Lake', 'Coastal', 'Wetlands', 'Ocean'];
				const cell        = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				if (!waterBiomes.includes(cell.biome)) { addStory('⛔ There is no water source nearby.'); _goBack(); return; }

				_buildWheel([{ label: '💧 Drinking…', action: () => {} }]);
				await runInlineProgress('Drinking from the source…', 2000);

				if (Math.random() < 0.2) {
					applyCondition('sick');
					addStory('💧 You cup your hands and drink, but the water tastes foul. Your stomach turns...');
				} else {
					const sourceLines = {
						River:    'The river water is cold and clear. You drink your fill.',
						Lake:     'You cup your hands and drink from the still lake.',
						Coastal:  'A freshwater spring near the shore quenches your thirst.',
						Wetlands: 'A clear spring among the reeds offers clean water.',
						Ocean:    'You find a trickle of fresh water running down to the sea.',
					};
					applyCondition('hydrated', 5);
					addStory(`💧 ${sourceLines[cell.biome] || 'You drink from the source.'}`);
				}
				_goBack();
			}

			async function _doSearchForSupplies() {
				const STAMINA_COST = 5;
				if (player.stamina < STAMINA_COST) {
					addStory(`⚠️ You're too exhausted to search (need ${STAMINA_COST} stamina).`);
					_goBack(); return;
				}

				_buildWheel([{ label: '⏳ Searching…', action: () => {} }]);
				changeStamina(-STAMINA_COST);
				await runInlineProgress('Searching the area for anything useful…', 5000);

				const tier = performSkillCheck('Foraging');
				checkQuestObjectives?.('surroundings_checked');

				if (tier === 1) {
					addStory('🔍 You wander far and return with nothing. Wasted effort.');
				} else if (tier === 2) {
					const find = Math.random() < 0.5 ? 'Kindling' : 'Stick Bundle';
					addCampSupply(find, 1);
					addStory(`🔍 A poor haul — just 1 ${find}.`);
					updateCampSuppliesGrid?.();
				} else if (tier === 3) {
					const materials = ['Stick Bundle', 'Kindling', 'Branch', 'Stone'];
					const count = Math.random() < 0.5 ? 1 : 2;
					const picks = [...materials].sort(() => Math.random() - 0.5).slice(0, count);
					picks.forEach(m => addCampSupply(m, 1));
					addStory(`🔍 You return with: ${picks.join(', ')}.`);
					updateCampSuppliesGrid?.();
				} else if (tier === 4) {
					const materials = ['Stick Bundle', 'Branch', 'Kindling', 'Stone'];
					const matPicks = [...materials].sort(() => Math.random() - 0.5).slice(0, 2);
					matPicks.forEach(m => addCampSupply(m, 1));
					updateCampSuppliesGrid?.();
					const food = ['Wild Berries', 'Edible Mushrooms', null][Math.floor(Math.random() * 3)];
					if (food) addItem(food, 1, { type: 'food', consumable: true, weight: 0.2, rarity: 'Common' });
					addStory(`🔍 A decent haul: ${matPicks.join(', ')}${food ? ', ' + food : ''}.`);
				} else {
					const materials = ['Stick Bundle', 'Branch', 'Kindling', 'Stone', 'Small Wood Bundle'];
					const matPicks = [...materials].sort(() => Math.random() - 0.5).slice(0, 3);
					matPicks.forEach(m => addCampSupply(m, 1));
					updateCampSuppliesGrid?.();
					const foods = ['Wild Berries', 'Edible Mushrooms', 'Nuts', 'Herb Pouch'];
					const food = foods[Math.floor(Math.random() * foods.length)];
					addItem(food, 1, { type: 'food', consumable: true, weight: 0.2, rarity: 'Common' });
					addStory(`✨ An excellent find: ${matPicks.join(', ')}, and ${food}.`);
				}

				// 10% chance to find a recipe among foraged materials — old herbalist notes, etc.
				if (Math.random() < 0.10) awardRecipeScroll();
				gainSkillXp('Foraging', tier);
				// 15% chance of an encounter while out foraging
				if (Math.random() < 0.15) {
					await fireRandomEvent('forage', ['creature_encounter', 'hazard', 'discovery', 'mystical']);
				}
				_goBack();
			}

			function _wheelCampfire() {
				const hasPit = !!(player?.hasCampfire || player?.campfireBuilt || player?.hasFirepit);
				const isLit  = !!(player?.hasFire && Number(fireTimeRemaining) > 0);
				if (!hasPit) {
					_buildWheel([
						{ label: 'Build Campfire', icon: 'images/icons/campfire-unlit.png', action: _doBuildCampfire },
						{ label: '← Back', action: _goBack, isBack: true },
					], 'Gather');
					if (typeof _tutCheckCampfireForBuild === 'function') _tutCheckCampfireForBuild();
				} else if (!isLit) {
					_buildWheel([
						{ label: 'Light Fire', icon: 'images/icons/campfire-lit.png', action: _doLightFire },
						{ label: '← Back',  action: _goBack, isBack: true },
					], 'Campfire');
					if (typeof _tutCheckCampfireForLight === 'function') _tutCheckCampfireForLight();
				} else {
					const fuels = (player.campSupplies || [])
						.filter(s => (getBurnTime?.(s.name) > 0) && ((s.quantity ?? 0) > 0));
					const cookables = Object.entries(player.inventory || {}).filter(([, v]) => v?.type === 'food' && (v.quantity ?? 0) > 0);
					_buildWheel([
						{ label: 'Add Wood',   icon: 'images/icons/firewood.png',      action: () => { _wheelStack.push(_wheelCampfire); _wheelAddWood(); }, disabled: !fuels.length },
						{ label: 'Cook',       icon: 'images/icons/kettle.png',         action: () => { _wheelStack.push(_wheelCampfire); _wheelCook(); }, disabled: !cookables.length },
						{ label: 'Extinguish', icon: 'images/icons/campfire-unlit.png', action: _doExtinguishFire },
						{ label: 'Kettle',     icon: 'images/icons/kettle.png',         action: _doPlaceKettle },
						{ label: '← Back',    action: _goBack, isBack: true },
					], 'Campfire');
					if (typeof _tutCheckCampfireForCook === 'function') _tutCheckCampfireForCook();
				}
			}

			async function _doBuildCampfire() {
				const stones = player.campSupplies?.find(i => i.name === 'Stone')?.quantity ?? 0;
				if (stones < 8) { addStory('⛔ Need 8 Stones to build a campfire.'); _goBack(); return; }
				_buildWheel([{ label: '⏳ Building…', action: () => {} }], 'Campfire');
				await runInlineProgress('Building campfire…', 2000);
				const stone = player.campSupplies?.find(i => i.name === 'Stone');
				if (!stone || (stone.quantity ?? 0) < 8) { addStory('⛔ Not enough Stones.'); _goBack(); return; }
				stone.quantity -= 8;
				updateCampSuppliesGrid?.();
				player.hasCampfire = true;
				setBuiltIcon?.('campfire-button', true);
				updateComfortProtection?.();
				addStory('🔥 Campfire built. (−8 Stones)');
				gainSkillXp('Fire-making', 3);
				_goBack();
			}

			async function _doLightFire() {
				const kindling = player.campSupplies?.find(i => i.name === 'Kindling');
				if (!kindling || (kindling.quantity ?? 0) < 1) { addStory('⛔ Need Kindling to light the fire.'); _goBack(); return; }
				const stick = player.campSupplies?.find(x => x?.name === 'Stick Bundle' && (x.quantity ?? 0) > 0);
				if (!stick) { addStory('⛔ Need a Stick Bundle to start the fire.'); _goBack(); return; }
				// Weather makes fire lighting harder
				const _fireSev = typeof getWeatherSeverity === 'function' ? getWeatherSeverity() : 0;
				if (_fireSev >= 4 && !player.hasShelter) {
					addStory(`⛈️ The ${player.weather} makes lighting a fire without shelter nearly impossible.`);
				} else if (_fireSev >= 2 && !player.hasShelter) {
					addStory(`🌧️ The ${player.weather} makes this harder — use your shelter to shield the flame.`);
				}
				_buildWheel([{ label: '⏳ Lighting…', action: () => {} }]);
				await runInlineProgress('Lighting fire…', 1500);
				kindling.quantity = Math.max(0, (kindling.quantity ?? 0) - 1);
				updateCampSuppliesGrid?.();
				// Apply weather penalty to fire-making roll (max -3 in severe weather, sheltered halves penalty)
				const _firePenalty = _fireSev >= 4 ? (player.hasShelter ? -1 : -3)
				                   : _fireSev >= 2 ? (player.hasShelter ? 0 : -2) : 0;
				const tier = performSkillCheck('Fire-making', _firePenalty);
				if (tier <= 2) { addStory('⚠️ The tinder smolders and dies. Kindling spent.'); _goBack(); return; }
				// startFireWithWood handles the success message and fire timer itself
				startFireWithWood('Stick Bundle');
				checkQuestObjectives?.('fire_started');
				updateComfortProtection?.();
				_goBack();
			}

			async function _doExtinguishFire() {
				_buildWheel([{ label: '⏳ Extinguishing…', action: () => {} }]);
				await runInlineProgress('Extinguishing fire…', 1000);
				if (typeof extinguishFire === 'function') await extinguishFire();
				else { player.hasFire = false; player.fireTimer = 0; clearInterval(fireTimerInterval); fireTimeRemaining = 0; }
				updateComfortProtection?.();
				addStory('💨 Fire extinguished.');
				_goBack();
			}

			async function _doPlaceKettle() {
				const inv = player?.inventory || {};
				const hasKettle = !!player?.hasKettle ||
					Object.values(inv).some(it => /kettle/i.test(String(it?.name ?? '')));
				if (!hasKettle)       { addStory('⛔ You need a kettle.');        _goBack(); return; }
				if (!player?.hasFire) { addStory('⛔ You need a lit fire first.'); _goBack(); return; }
				_buildWheel([{ label: '⏳ Placing…', action: () => {} }]);
				await runInlineProgress('Placing kettle…', 1000);
				player.kettlePlaced = true;
				addStory('🫖 Kettle placed over the fire.');
				_goBack();
			}

			function _wheelAddWood() {
				const fuels = (player.campSupplies || [])
					.filter(s => (getBurnTime?.(s.name) > 0) && ((s.quantity ?? 0) > 0));
				_buildWheel([
					...fuels.slice(0, 5).map(({ name, quantity }) => ({
						label:  `${name} (${quantity})`,
						action: () => { startFireWithWood?.(name); _goBack(); }
					})),
					{ label: '← Back', action: _goBack, isBack: true },
				]);
			}

							function _wheelCook() {
					const cookables = Object.entries(player.inventory || {})
						.filter(([, v]) => v?.type === 'food' && (v.quantity ?? 0) > 0);
					if (!cookables.length) { addStory('⛔ No cookable food in inventory.'); _goBack(); return; }
					_buildWheel([
						...cookables.slice(0, 7).map(([name, item]) => ({
							label: item.quantity > 1 ? `${name} ×${item.quantity}` : name,
							action: () => {
								const qty = item.quantity ?? 1;
								if (qty <= 1) {
									_buildWheel([{ label: '⏳ Cooking…', action: () => {} }], 'Add Wood');
									cookItem(name, 1).then(() => _goBack());
									return;
								}
								const _doCook = async (n) => {
									_buildWheel([{ label: '⏳ Cooking…', action: () => {} }], 'Add Wood');
									await cookItem(name, n);
									_goBack();
								};
								const qtyOpts = [
									{ label: 'Cook 1', action: () => _doCook(1) },
								];
								if (qty >= 4) qtyOpts.push({ label: `Cook Half (${Math.floor(qty / 2)})`, action: () => _doCook(Math.floor(qty / 2)) });
								qtyOpts.push({ label: `Cook All (${qty})`, action: () => _doCook(qty) });
								qtyOpts.push({ label: '← Back', action: () => _wheelCook(), isBack: true });
								_buildWheel(qtyOpts, 'How many?');
							}
						})),
						{ label: '← Back', action: _goBack, isBack: true },
					], 'Cook');
					if (typeof _tutCheckCookWheel === 'function') _tutCheckCookWheel();
				}

function _wheelShelter() {
					const dur    = player.shelterDurability ?? 100;
					const durTag = player.hasShelter ? ` (${dur}%)` : '';
					const opts   = [];
					if (!player.hasShelter) {
						opts.push({ label: 'Build Simple Shelter', icon: 'images/icons/shelter.png', action: async () => { _buildWheel([{ label: '⏳ Building…', action: () => {} }], 'Shelter'); await handleShelterOption(); _goBack(); } });
					} else if (!player.shelterUpgraded) {
						opts.push({ label: `🛖 Shelter${durTag}`,    action: () => { addStory(`🛖 Simple shelter — ${dur}% durability.`); _goBack(); } });
						opts.push({ label: 'Upgrade to Improved', icon: 'images/icons/shelter.png', action: async () => { _buildWheel([{ label: '⏳ Upgrading…', action: () => {} }], 'Shelter'); await handleShelterUpgrade(); _goBack(); } });
					} else {
						opts.push({ label: `🛖 Upgraded${durTag}`, action: () => { addStory(`🛖 Upgraded shelter — ${dur}% durability.`); _goBack(); } });
					}
					if (player.hasShelter && dur < 100) {
						opts.push({ label: `🔨 Repair (${dur}%)`, action: async () => { _buildWheel([{ label: '🔨 Repairing…', action: () => {} }], 'Shelter'); await _doRepairShelter(); _goBack(); } });
					}
					if (player.hasShelter) {
						opts.push({ label: 'Sleep', icon: 'images/icons/bedroll.png', action: async () => { await performSleep(); _goBack(); } });
					}
					opts.push({ label: '← Back', action: _goBack, isBack: true });
					_buildWheel(opts, 'Shelter');
					if (typeof _tutCheckShelterWheel === 'function') _tutCheckShelterWheel();
				}

			async function _doRepairShelter() {
				const sticks = player.campSupplies?.find(i => i.name === 'Stick Bundle')?.quantity ?? 0;
				const needed = 2;
				if (sticks < needed) {
					addStory(`⛔ Need ${needed} Stick Bundles to repair the shelter. (Have: ${sticks})`);
					return;
				}
				await runInlineProgress('Repairing shelter…', 3000);
				const stick = player.campSupplies.find(i => i.name === 'Stick Bundle');
				stick.quantity -= needed;
				updateCampSuppliesGrid?.();
				const tier = performSkillCheck('Crafting');
				const restored = tier >= 4 ? 40 : tier >= 3 ? 25 : tier >= 2 ? 15 : 8;
				player.shelterDurability = Math.min(100, (player.shelterDurability ?? 0) + restored);
				gainSkillXp('Crafting', tier);
				addStory(`🔨 Shelter repaired. Durability restored to ${player.shelterDurability}%.`);
				updateComfortProtection?.();
			}

			function _wheelHunt() { _doHuntFromWheel(); }

			async function _doHuntFromWheel() {
				const bowInInventory  = Object.keys(player.inventory).some(k => /bow/i.test(k) && (player.inventory[k].quantity ?? 1) > 0);
				const bowEquipped     = /bow/i.test(player.equipped?.rightHand || '') || /bow/i.test(player.equipped?.leftHand || '');
				const hasArrows       = Object.entries(player.inventory).some(([k, v]) => /arrow/i.test(k) && (v.quantity ?? 0) > 0);

				if (!bowInInventory) {
					addStory('⛔ You need a <strong>Bow</strong> and <strong>Arrows</strong> to hunt.');
					_goBack(); return;
				}
				if (!bowEquipped) {
					addStory('⚠️ Your bow is in your inventory but not equipped. Open the <strong>Inventory</strong> tab and equip it to your weapon slot first.');
					if (typeof _tutBowEquip === 'function') _tutBowEquip();
					_goBack(); return;
				}
				if (!hasArrows) {
					addStory('⛔ You have a bow but no arrows. Find arrows first.');
					_goBack(); return;
				}
				if (player.stamina < 5) {
					addStory('⚠️ Too exhausted to hunt (need 5 stamina).'); _goBack(); return;
				}

				huntActive = true;
				player.currentAction = 'Hunting';
				changeStamina(-5);

				const _huntSev = typeof getWeatherSeverity === 'function' ? getWeatherSeverity() : 0;
				const _huntMod = _huntSev >= 4 ? -3 : _huntSev >= 3 ? -2 : _huntSev >= 2 ? -1 : 0;
				if (_huntMod < 0) addStory(`🌧️ Hunting in ${player.weather} is difficult (${_huntMod} to all rolls).`);
				addStory('🏹 You set out to hunt.');

				// One continuous bar across the whole hunt (~18s total: 6 scout + 5 track + 4 aim + 3 blood)
				const bar = startContinuousProgress(18000, 'Scouting for game…');
				_buildWheel([{ label: '🔍 Scouting…', action: () => {} }]);
				await bar.wait(6000);

				const scoutTier = performSkillCheck('Hunting', _huntMod);
				if (scoutTier === 1) {
					bar.finish();
					addStory('🏹 No signs of animals in this area.');
					huntActive = false; _goBack(); return;
				}

				const animal = (typeof randomAnimal === 'function') ? randomAnimal() : 'Deer';
				currentHunt = { tier: 3, animal, wounded: false, arrowsUsed: 0 };
				addStory(`🏹 You spot signs of a ${animal}!`);

				// Pause bar while player chooses
				bar.pause();
				const tracked = await new Promise(resolve => {
					_buildWheel([
						{ label: `Track ${animal}`, action: () => resolve(true)  },
						{ label: 'Abandon Hunt',    action: () => resolve(false) },
					]);
				});
				if (!tracked) {
					bar.finish();
					addStory('🏹 You abandon the hunt.'); huntActive = false; _goBack(); return;
				}

				// Phase 2: Tracking — resume bar
				bar.setLabel(`Following ${animal} tracks…`);
				bar.resume();
				_buildWheel([{ label: '🐾 Tracking…', action: () => {} }]);
				await bar.wait(5000);

				const trackTier = performSkillCheck('Tracking', _huntMod);
				if (trackTier <= 2) {
					bar.finish();
					player.consecutiveHuntFailures = (player.consecutiveHuntFailures || 0) + 1;
					addStory(`🏹 You lose the tracks. The ${animal} escapes.`);
					if (player.consecutiveHuntFailures >= 2) {
						addStory('💡 <em>Hunting isn\'t going well. Consider Fishing, Gathering, or Resting to recover before trying again.</em>');
					}
					huntActive = false; _goBack(); return;
				}

				// Phase 3: Aiming — bar keeps running
				addStory(`🏹 ${animal} in range! Preparing shot…`);
				bar.setLabel('Taking aim…');
				_buildWheel([{ label: '🏹 Aiming…', action: () => {} }]);
				await bar.wait(4000);
				bar.finish(); // hunt-tracking bar done; urgency bar takes over

				// Shot window — fresh bar runs as urgency meter; must shoot before it fills
				addStory('🏹 <strong>Take the shot!</strong>');
				const SHOOT_WINDOW = 5000;
				const aimBar = startContinuousProgress(SHOOT_WINDOW, 'Animal in your sights!');
				const shotTaken = await new Promise(resolve => {
					let fired = false;
					const fire = (val) => { if (!fired) { fired = true; aimBar.finish(); resolve(val); } };
					setTimeout(() => fire(false), SHOOT_WINDOW);
					_buildWheel([
						{ label: '🏹 SHOOT!', icon: 'images/icons/bow-arrows.png', action: () => fire(true) },
						{ label: 'Hold…',     action: () => {} },
					]);
				});

				if (!shotTaken) {
					addStory(`🏹 The ${animal} slips away while you hesitate!`);
					huntActive = false; _goBack(); return;
				}

				if ((player.inventory['Arrow']?.quantity || 0) <= 0) {
					addStory('⛔ Out of arrows!'); huntActive = false; _goBack(); return;
				}
				removeItem('Arrow', 1);

				const shotTier = performSkillCheck('Archery', _huntMod);
				if (shotTier <= 2) {
					addStory(`🏹 You miss! The ${animal} flees.`);
					huntActive = false; _goBack(); return;
				}

				if (shotTier <= 4) {
					// Phase 4: Blood trail
					const bloodBar = startContinuousProgress(3000, 'Following blood trail…');
					addStory(`🩸 You wound the ${animal}! Following blood trail…`);
					_buildWheel([{ label: '🩸 Tracking…', action: () => {} }]);
					await bloodBar.wait(3000);
					const bloodTier = performSkillCheck('Tracking', _huntMod);
					if (bloodTier <= 2) {
						player.consecutiveHuntFailures = (player.consecutiveHuntFailures || 0) + 1;
						addStory(`🏹 You lose the trail. The ${animal} escapes.`);
						if (player.consecutiveHuntFailures >= 2) {
							addStory('💡 <em>Hunting isn\'t going well. Consider Fishing, Gathering, or Resting to recover before trying again.</em>');
						}
						huntActive = false; _goBack(); return;
					}
					addStory(`🩸 You find the ${animal}.`);
				} else {
					addStory(`🏹 Clean kill! The ${animal} falls.`);
				}

				// Butchering phase — speed and hide quality depend on having a hunting knife
				const hasKnife = Object.keys(player.inventory || {}).some(k => /hunting.?knife|belt.?knife/i.test(k));
				const stepMs   = hasKnife ? 2500 : 4500;
				const bigAnimal = ['Deer', 'Boar', 'Bear'].includes(animal);
				const butcherSteps = bigAnimal
					? [`Skinning the ${animal}`, `Gutting the ${animal}`, `Quartering the ${animal}`]
					: [`Skinning the ${animal}`, `Gutting the ${animal}`];

				if (hasKnife) {
					addStory(`🔪 You draw your hunting knife and begin field dressing the ${animal}.`);
				} else {
					addStory(`🗡️ Without a proper knife, field dressing the ${animal} takes longer.`);
				}

				for (const step of butcherSteps) {
					const bBar = startContinuousProgress(stepMs, step + '…');
					_buildWheel([{ label: step, icon: 'images/icons/poneti/tools/tool_butcher_knife.png', action: () => {} }]);
					await bBar.wait(stepMs);
				}

				// Award loot + skill XP
				currentHunt.tier   = shotTier;
				currentHunt._knife = hasKnife;
				player.consecutiveHuntFailures = 0;
				gainSkillXp('Hunting', shotTier);
				if (typeof awardHuntLoot === 'function') awardHuntLoot();
				awardProfessionXp('hunt');
				updateInventory();
				huntActive = false;
				saveGame(true);
				if (Math.random() < 0.20) {
					await fireRandomEvent('hunt', ['creature_encounter', 'hazard', 'discovery']);
				}
				_goBack();
			}

			function _wheelFish() { _doFishFromWheel(); }

			async function _doFishFromWheel() {
				player.consecutiveHuntFailures = 0;
				const WATER_BIOMES = ['River', 'Lake', 'Coastal', 'Wetlands', 'Ocean'];
				const cell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const nearWater = WATER_BIOMES.includes(cell.biome);

				if (!nearWater) {
					addStory('🎣 There is no water nearby to fish in.');
					_goBack(); return;
				}

				// Require a fishing pole equipped in hand
				const hasPole = Object.values(player.equipped || {}).some(n => n && /fishing.?pole|rod/i.test(n));
				if (!hasPole) {
					const inBag = Object.keys(player.inventory || {}).some(k => /fishing.?pole|rod/i.test(k) && (player.inventory[k]?.quantity ?? 1) > 0);
					addStory(inBag
						? '🎣 Equip your <strong>Fishing Pole</strong> first (Right or Left Hand slot).'
						: '🎣 You need a <strong>Fishing Pole</strong> to fish. Find one at a general store or market.');
					_goBack(); return;
				}

				if (player.stamina < 3) {
					addStory('⚠️ Too exhausted to fish (need 3 stamina).');
					_goBack(); return;
				}

				player.currentAction = 'Fishing';
				changeStamina(-3);

				const FISH_BY_BIOME = {
					River:    ['Raw Trout', 'Raw Perch', 'Raw Carp', 'Raw Pike'],
					Lake:     ['Raw Carp', 'Raw Perch', 'Raw Bass', 'Raw Catfish'],
					Coastal:  ['Raw Bass', 'Raw Mackerel', 'Raw Herring', 'Raw Eel'],
					Ocean:    ['Raw Mackerel', 'Raw Herring', 'Raw Eel', 'Raw Tuna'],
					Wetlands: ['Raw Catfish', 'Raw Eel', 'Raw Perch', 'Raw Carp'],
				};
				const biome    = cell.biome || 'River';
				const fishList = FISH_BY_BIOME[biome] || FISH_BY_BIOME.River;

				addStory(`🎣 You find a quiet spot along the ${biome.toLowerCase()} and cast your line.`);

				// Fishing skill check determines quality before the bite delay so skill matters
				const tier = performSkillCheck('Fishing');

				if (tier === 1) {
					await runInlineProgress('Waiting for a bite…', 5000);
					addStory('🎣 Nothing bites. You pack up and move on.');
					_goBack(); return;
				}

				// Wait time scales inversely with skill — better fisher waits less
				const waitMs = tier >= 5 ? 3000 : tier >= 4 ? 4500 : tier >= 3 ? 6000 : 7500;

				// One continuous bar: waiting phase + hook window — bar never stops
				const bar = startContinuousProgress(waitMs + 3500, 'Waiting for a bite…');
				_buildWheel([{ label: '🎣 Waiting…', action: () => {} }]);
				await bar.wait(waitMs);

				// Bite! Keep bar running — show time-sensitive HOOK button
				bar.setLabel('🐟 Something on the line — HOOK IT!');
				addStory('🐟 <strong>Something on the line — HOOK IT!</strong>');
				const hooked = await new Promise(resolve => {
					let fired = false;
					const hook = (val) => { if (!fired) { fired = true; resolve(val); } };
					setTimeout(() => hook(false), 3500);
					_buildWheel([
						{ label: '🎣 HOOK!', action: () => hook(true) },
						{ label: 'Wait…',    action: () => {} },
					]);
				});
				bar.finish();

				if (!hooked) {
					addStory('🎣 The line goes slack. It got away!');
					_goBack(); return;
				}

				// Determine catch based on tier
				let catchName, qty = 1, message;
				if (tier === 2) {
					catchName = fishList[0];
					message   = 'A modest catch.';
				} else if (tier === 3) {
					catchName = fishList[Math.floor(Math.random() * 2)];
					message   = 'A decent catch.';
				} else if (tier === 4) {
					catchName = fishList[Math.floor(Math.random() * 3)];
					qty       = 2;
					message   = 'A good catch — two fish!';
				} else {
					if (Math.random() < 0.2) {
						const rares = ['Pearl', 'Smooth River Stone', 'Enchanted Scale'];
						catchName = rares[Math.floor(Math.random() * rares.length)];
						message   = '✨ Something unusual on the line…';
					} else {
						catchName = fishList[Math.floor(Math.random() * fishList.length)];
						qty       = 2 + (Math.random() < 0.5 ? 1 : 0);
						message   = `An excellent haul — ${qty} fish!`;
					}
				}

				addStory(`🎣 ${message}`);
				addItem(catchName, qty, {
					type: 'food', weight: 0.5, rarity: 'Common', consumable: true,
					description: `Fresh ${catchName}, caught from the ${biome.toLowerCase()}.`
				});
				gainSkillXp('Fishing', tier);
				awardProfessionXp('fish');
				if (tier >= 3) changeHope(1, 'good catch');
				checkQuestObjectives?.('fish_caught', { fish: catchName });
				updateInventory();
				saveGame(true);
				if (Math.random() < 0.15) {
					await fireRandomEvent('forage', ['creature_encounter', 'hazard', 'discovery', 'mystical', 'traveler_encounter']);
				}
				_goBack();
			}

			function _wheelCraft() {
				if (typeof Recipes === 'undefined') {
					addStory('📖 No crafting recipes available.'); _goBack(); return;
				}
				const known = player.knownRecipes || [];
				const allRecipes = [...(Recipes.Crafting || []), ...(Recipes.Alchemy || [])];
				const knownCrafting = allRecipes.filter(r => known.includes(r.name));
				if (!knownCrafting.length) {
					_buildWheel([
						{ label: '📖 No recipes yet', disabled: true, action: () => {} },
						{ label: '← Back', action: _goBack, isBack: true },
					], 'Craft');
					addStory('📖 You don\'t know any recipes yet. Learn them from vendors, NPCs, or exploration.');
					return;
				}
				const available   = knownCrafting.filter(r =>  canCraft(r, player.inventory));
				const unavailable = knownCrafting.filter(r => !canCraft(r, player.inventory));

				const opts = [
					...available.map(r => ({
						label:  r.name,
						action: () => { _wheelStack.push(_wheelCraft); _doCraftItem(r); }
					})),
					...unavailable.slice(0, Math.max(0, 6 - available.length)).map(r => ({
						label:  r.name,
						action: () => {
							const missing = r.requires
								.filter(req => !req.tool && (!(player.inventory[req.item]) || player.inventory[req.item].quantity < req.qty))
								.map(req => `${req.qty}× ${req.item}`);
							addStory(`⛔ Need: ${missing.join(', ')}.`);
						},
						disabled: true
					})),
					{ label: '← Back', action: _goBack, isBack: true },
				];

				_buildWheel(opts.slice(0, 8), 'Craft');
			}

			async function _doCraftItem(recipe) {
				_buildWheel([{ label: '⏳ Crafting…', action: () => {} }]);
				await runInlineProgress(`Crafting ${recipe.name}…`, 3000);

				// Double-check materials haven't changed
				if (!canCraft(recipe, player.inventory)) {
					addStory(`⛔ You no longer have the materials for ${recipe.name}.`);
					_goBack(); return;
				}

				const skillName = recipe.skill || 'Crafting';
				const tier = performSkillCheck(skillName);

				// Look up base item data from the database if available
				const dbData = (typeof findItemInDatabase === 'function' && findItemInDatabase(recipe.produces.item)) || {};
				const baseOpts = {
					type:      dbData.type      || 'item',
					weight:    dbData.weight    || 0.5,
					rarity:    dbData.rarity    || 'Common',
					consumable:dbData.consumable || false,
				};

				if (tier === 1) {
					consumeIngredients(recipe, player.inventory);
					addStory(`💥 Your attempt at crafting ${recipe.name} fails badly. The materials are ruined.`);
				} else if (tier === 2) {
					consumeIngredients(recipe, player.inventory);
					const qty = Math.max(1, Math.floor(recipe.produces.qty / 2));
					addItem(recipe.produces.item, qty, { ...baseOpts, wear: 30 });
					addStory(`🔨 You craft ${qty}× ${recipe.produces.item}, but the quality is poor (30%).`);
				} else if (tier === 3) {
					consumeIngredients(recipe, player.inventory);
					addItem(recipe.produces.item, recipe.produces.qty, { ...baseOpts, wear: 55 });
					addStory(`🔨 You craft ${recipe.produces.qty}× ${recipe.produces.item} (55%).`);
				} else if (tier === 4) {
					consumeIngredients(recipe, player.inventory);
					addItem(recipe.produces.item, recipe.produces.qty, { ...baseOpts, wear: 80 });
					addStory(`🔨 Solid work. You craft ${recipe.produces.qty}× ${recipe.produces.item} (80%).`);
				} else {
					consumeIngredients(recipe, player.inventory);
					const qty = Math.ceil(recipe.produces.qty * 1.5);
					addItem(recipe.produces.item, qty, { ...baseOpts, wear: 100 });
					addStory(`✨ Exceptional craftsmanship! ${qty}× ${recipe.produces.item} (100%).`);
					gainSkillXp(skillName, 5);
				}

				if (tier >= 2) {
					awardProfessionXp('craft');
					checkQuestObjectives?.('crafted', { item: recipe.produces.item });
					// Cooking recipes also satisfy food_cooked
					const isCookingRecipe = (typeof Recipes !== 'undefined') && (Recipes.Cooking || []).some(r => r.name === recipe.name);
					if (isCookingRecipe) checkQuestObjectives?.('food_cooked');
				}
				updateInventory();
				_goBack();
			}


			// Initialise
			wheel.style.display = 'flex';
			inputBox.classList.remove('visible');
			_showDefaultWheel();

			submitBtn.addEventListener('click', () => {
				submitUserInput();
				inputBox.classList.remove('visible');
				wheel.style.display = 'flex';
				userInput.value = '';
				_showDefaultWheel();
			});

			document.getElementById('speak-back-button').addEventListener('click', () => {
				inputBox.classList.remove('visible');
				wheel.style.display = 'flex';
				userInput.value = '';
				_showActionsWheel();
			});

			// Number key bindings: wheel options (1-6) + quick slots (1-0 fallthrough)
			document.addEventListener('keydown', (e) => {
				if (inputBox.classList.contains('visible')) return;
				const num = e.key === '0' ? 10 : parseInt(e.key);
				if (isNaN(num) || num < 1 || num > 10) return;

				// Wheel gets priority for keys 1-6 when visible
				if (num <= 6 && wheel.style.display !== 'none') {
					const opt = _currentWheelOptions[num - 1];
					if (opt?.action) { e.preventDefault(); opt.action(); return; }
				}

				// Quick slot fallthrough
				e.preventDefault();
				useQuickSlot(num - 1);
			});

// 8.10 · DOM Shortcuts
			function setText(id, txt) {
				const el = document.getElementById(id);
				if (el) el.textContent = txt;
			}

			function setHTML(id, html) {
				const el = document.getElementById(id);
				if (el) el.innerHTML = html;
			}

// ============================================================
// SECTION 9 · HUNTING & COOKING
// ============================================================

// 9.1 · Hunting
async function startHunt(manual = false) {
  console.log('🎬 startHunt() triggered | manual:', manual, '| huntActive:', huntActive);
  const restBtns = restModal.querySelectorAll('button');
 restModal.querySelectorAll('button').forEach(b => {
  if (b.id !== 'begin-hunt-button') b.disabled = true;
});

  if (!player.inventory['Bow'] || (player.inventory['Arrow']?.quantity || 0) <= 0) {
    restLog.textContent = "You need a bow and arrows to hunt.";
    restBtns.forEach(b => b.disabled = false);
    return;
  }
  if (player.stamina < 5) {
    restLog.textContent = "You're too exhausted to hunt.";
    restBtns.forEach(b => b.disabled = false);
    return;
  }

  changeStamina(-5);
  addStory('You set out to hunt.');
  document.getElementById('hunt-phase-status').textContent = "Hunting...";

  const trackingPhases = [
    { text: randomTrackingText(), duration: 2500 },
    { text: randomTrackingText(), duration: 2500 },
    { text: randomTrackingText(), duration: 2500 },
  ];
  await runSmoothHuntProgress(trackingPhases);

if (!huntActive) {
  console.log('❌ Hunt was cancelled during tracking phase');
  restLog.textContent = 'Hunt Cancelled.';
  return;
}

  const tier = performSkillCheck('Survival');
  if (tier === 1) {
    document.getElementById('hunt-phase-status').textContent = "Hunt Failed.";
    restLog.textContent = "You find no signs of animals.";
    restBtns.forEach(b => b.disabled = false);
    return;
  }

  currentHunt = {
    tier,
    animal: randomAnimal(),
    wounded: false,
    arrowsUsed: 0
  };

  document.getElementById('hunt-phase-status').textContent = `You spot signs of a ${currentHunt.animal}!`;
  restLog.textContent = "";

  const huntBtn = document.createElement('button');
  huntBtn.textContent = `Track the ${currentHunt.animal}`;
  huntBtn.style.marginTop = '10px';
  restLog.appendChild(huntBtn);

  huntBtn.onclick = async () => {
    huntBtn.remove();
    document.getElementById('hunt-phase-status').textContent = `Tracking the ${currentHunt.animal}...`;

    const trackingSigns = [
      { text: `Following ${currentHunt.animal} tracks...`, duration: 2000 },
      { text: `Examining droppings...`, duration: 2000 },
      { text: `Found some ${currentHunt.animal} fur...`, duration: 2000 }
    ];
await runSmoothHuntProgress(trackingSigns);

if (!huntActive) {
  console.log('❌ Hunt cancelled while reacquiring tracks');
  restLog.textContent = 'Hunt Cancelled.';
  return;
}

    const trackRoll = performSkillCheck('Tracking');
    if (trackRoll <= 2) {
      document.getElementById('hunt-phase-status').textContent = "Hunt Failed.";
      restLog.textContent = "You lose the tracks. The prey escapes.";
      restBtns.forEach(b => b.disabled = false);
      return;
    }

    document.getElementById('hunt-phase-status').textContent = `${currentHunt.animal} tracked! Preparing shot...`;
    updateHuntPhase();

    if (!manual) {
      document.getElementById('hunt-info').style.display = 'none'; // only auto-close if not manually toggled
      huntActive = false;
      beginHuntBtn.textContent = 'Begin Hunt';
    }
  };
}


async function updateHuntPhase() {
  const shotPhases = [
    { text: "Knocking arrow...", duration: 2000 },
    { text: "Drawing bowstring...", duration: 2000 },
    { text: "Aiming...", duration: 2000 }
  ];
  await runSmoothHuntProgress(shotPhases);
if (!huntActive) {
  console.log('❌ Hunt cancelled while aiming');
  restLog.textContent = 'Hunt Cancelled.';
  return;
}

  offerShot();
}

function offerShot() {
  const shotBtn = document.createElement('button');
  shotBtn.id = 'take-shot-button';
  shotBtn.textContent = 'Take the Shot!';
  restLog.appendChild(shotBtn);

  // Show and animate the separate countdown bar
  const shotTimer = document.getElementById('shot-timer');
  const shotBar = document.getElementById('shot-countdown-bar');
  shotTimer.style.display = 'block';
shotBar.style.transition = 'width 0.05s linear';

  const duration = 4000;
  const interval = 50;
  let elapsed = 0;

  const countdown = setInterval(() => {
    elapsed += interval;
    const percentLeft = 100 - (elapsed / duration) * 100;
    shotBar.style.width = percentLeft + '%';
    if (elapsed >= duration) {
      clearInterval(countdown);
      document.getElementById('take-shot-button')?.remove();
      shotTimer.style.display = 'none';
      document.getElementById('hunt-phase-status').textContent = "Hunt Failed.";
      restLog.textContent = "The animal slips away while you hesitate!";
      restModal.querySelectorAll('button').forEach(b => b.disabled = false);
    }
  }, interval);

  shotBtn.onclick = () => {
    clearInterval(countdown);
    shotBtn.remove();
    shotTimer.style.display = 'none';
    resolveShot();
  };
}

async function resolveShot() {
  document.getElementById('take-shot-button')?.remove();

  if ((player.inventory['Arrow']?.quantity || 0) <= 0) {
    document.getElementById('hunt-phase-status').textContent = "Hunt Failed.";
    restLog.textContent = "You're out of arrows!";
    restModal.querySelectorAll('button').forEach(b => b.disabled = false);
    return;
  }

  removeItem('Arrow', 1);

  const roll = hiddenRoll();
  const tier = classifyRoll(roll);

  if (tier <= 2) {
    document.getElementById('hunt-phase-status').textContent = "Missed! Reacquiring tracks...";
    restLog.textContent = "You miss! The prey is fleeing...";

    // Restart basic tracking
    const reTracking = [
      { text: `Following ${currentHunt.animal} tracks...`, duration: 2000 },
      { text: `Looking for broken branches...`, duration: 2000 }
    ];
    await runSmoothHuntProgress(reTracking);
if (!huntActive) {
  console.log('❌ Hunt cancelled mid-tracking or blood trail');
  restLog.textContent = 'Hunt Cancelled.';
  return;
}


    document.getElementById('hunt-phase-status').textContent = `${currentHunt.animal} reacquired! Preparing another shot...`;
    updateHuntPhase();

  } else if (tier === 3 || tier === 4) {
    currentHunt.wounded = true;
    document.getElementById('hunt-phase-status').textContent = "Wounded! Following blood trail...";
    restLog.textContent = "You wound the prey!";

    const bloodTrail = [
      { text: "Spotting blood droplets...", duration: 2000 },
      { text: "Following blood trail...", duration: 2000 }
    ];
    await runSmoothHuntProgress(bloodTrail);
if (!huntActive) {
  console.log('❌ Hunt cancelled mid-tracking or blood trail');
  restLog.textContent = 'Hunt Cancelled.';
  return;
}

    document.getElementById('hunt-phase-status').textContent = `${currentHunt.animal} wounded! Preparing another shot...`;
    updateHuntPhase();

  } else {
    document.getElementById('hunt-phase-status').textContent = "Hunt Succeeded!";
    restLog.textContent = "Perfect shot! The prey falls.";
    awardHuntLoot();
    restModal.querySelectorAll('button').forEach(b => b.disabled = false);
  }
}

// Returns a random unknown recipe name, or null if the player knows everything.
function _pickUnknownRecipe() {
  if (typeof Recipes === 'undefined') return null;
  const all     = [...(Recipes.Crafting || []), ...(Recipes.Alchemy || []), ...(Recipes.Cooking || [])];
  const known   = player.knownRecipes || [];
  const unknown = all.filter(r => !known.includes(r.name));
  if (!unknown.length) return null;
  return unknown[Math.floor(Math.random() * unknown.length)].name;
}

// Returns a random unknown cooking recipe name only.
function _pickUnknownCookingRecipe() {
  if (typeof Recipes === 'undefined') return null;
  const known   = player.knownRecipes || [];
  const unknown = (Recipes.Cooking || []).filter(r => !known.includes(r.name));
  if (!unknown.length) return null;
  return unknown[Math.floor(Math.random() * unknown.length)].name;
}

// Adds a random recipe scroll for an unknown recipe to inventory.
function awardRecipeScroll() {
  const recipeName = _pickUnknownRecipe();
  if (!recipeName) return;
  addItem(`Recipe: ${recipeName}`, 1, {
    type:        'recipe_scroll',
    recipeName,
    rarity:      'Uncommon',
    description: `A scroll detailing how to craft: ${recipeName}.`,
    weight:      0.1,
    value:       30,
  });
}

function awardHuntLoot() {
  const meats = {
    'Deer': 'Raw Venison',
    'Rabbit': 'Raw Rabbit Meat',
    'Boar': 'Raw Boar Meat',
    'Wolf': 'Raw Wolf Meat',
    'Bear': 'Raw Bear Meat'
  };
  const animal = currentHunt.animal;
  const meatItem = meats[animal] || 'Raw Meat';

  const quantity = currentHunt.tier >= 4 ? randomInt(2,4) : randomInt(1,2);
  addItem(meatItem, quantity, { type: 'food', weight: 1, consumable: true, rarity: 'Common' });

  // Hide chance — better with a hunting knife (clean skinning)
  const hideChance = currentHunt._knife ? 0.85 : 0.45;
  if (Math.random() < hideChance) {
    addItem(`${animal} Hide`, 1, { type: 'material', weight: 3, rarity: 'Uncommon' });
  }

  addStory(`🥩 You obtain ${quantity} ${meatItem}(s).`);
  if (currentHunt.tier >= 4) changeHope(1, 'successful hunt');
  checkQuestObjectives?.('food_hunted');
  // Chance to find a recipe scroll near the kill — poacher's cache, hunter's notes, etc.
  if (Math.random() < 0.15) awardRecipeScroll();
}

// 9.2 · Cooking
async function cookItem(itemName, qty = 1) {
  const item = player.inventory[itemName];
  if (!item) { addStory(`⛔ No ${itemName} to cook.`); return; }
  if (!(fireTimeRemaining > 0)) { addStory('⛔ Need a lit fire to cook.'); return; }

  const actualQty = Math.min(qty, item.quantity ?? 1);

  const cookTexts = [
    'Sizzling over the fire…', 'Turning it carefully…',
    'Adjusting heat with a stick…', 'Sniffing cautiously…', 'Humming a camp tune…'
  ];
  const _pickCookText = () => cookTexts[Math.floor(Math.random() * cookTexts.length)];
  const cookDuration = 4500 + (actualQty - 1) * 2000;
  const phaseTime    = Math.floor(cookDuration / 3);
  const _cookBar = startContinuousProgress(cookDuration, _pickCookText());
  await _cookBar.wait(phaseTime); _cookBar.setLabel(_pickCookText());
  await _cookBar.wait(phaseTime); _cookBar.setLabel(_pickCookText());
  await _cookBar.wait(phaseTime);

  const base    = Math.floor(Math.random() * 20) + 1;
  const bonus   = getSkillBonus('Cooking');
  const adjusted = Math.min(20, base + bonus);
  const lvl      = player.skills['Cooking']?.level;
  const bonusTxt = bonus > 0 ? ` +${bonus} (Cooking Lv${lvl}) = ${adjusted}` : '';
  addStory(`🎲 Cooking Roll: ${base}${bonusTxt}`);
  const tier = classifyCookingRoll(adjusted);
  // Map cooking tier (1-7) to XP tier (1-5) for gainSkillXp
  const _cookXpTier = tier <= 2 ? 1 : tier <= 4 ? 2 : tier <= 5 ? 3 : tier === 6 ? 4 : 5;
  gainSkillXp('Cooking', _cookXpTier);

  if (item.type !== 'food') {
    addStory(`🔥 Attempted to cook ${itemName}. It's ruined.`);
    return;
  }

  // Determine new condition based on cooking tier and item's current state
  let newCondition;
  const alreadyCooked = ['Cooked','Well-Cooked','Perfectly Cooked','Overcooked','Undercooked'].includes(item.condition);
  const alreadyBurnt  = item.condition === 'Burnt' || item.condition === 'Charred';

  if (alreadyBurnt) {
    addStory(`🍂 ${itemName} turns into ash.`);
    removeItem(itemName, actualQty);
    return;
  } else if (alreadyCooked) {
    newCondition = tier >= 6 ? 'Well-Cooked' : tier >= 5 ? 'Cooked' : tier >= 4 ? 'Overcooked' : tier >= 3 ? 'Burnt' : 'Charred';
  } else {
    if      (tier === 7) newCondition = 'Perfectly Cooked';
    else if (tier === 6) newCondition = 'Well-Cooked';
    else if (tier === 5) newCondition = 'Cooked';
    else if (tier === 4) newCondition = 'Overcooked';
    else if (tier === 3) newCondition = 'Undercooked';
    else if (tier === 2) newCondition = 'Burnt';
    else                 newCondition = 'Charred';
  }

  const baseName   = item.origin || getCleanBaseItemName(itemName);
  const cookedName = `${newCondition} ${baseName}`;
  const fx         = (typeof COOK_CONDITION_EFFECTS !== 'undefined' && COOK_CONDITION_EFFECTS[newCondition]) || { stamina: 10, life: 0 };
  removeItem(itemName, actualQty);
  addItem(cookedName, actualQty, {
    type: 'food', consumable: true, wearable: false,
    condition: newCondition, rarity: 'Common',
    baseEffect: { stamina: fx.stamina, life: fx.life }, weight: 1, value: 1, origin: baseName
  });

  const COOK_MSGS = {
    'Charred':          '🍂 Badly charred — barely edible, but still food.',
    'Burnt':            '😬 Burnt — not great, but it\'ll do.',
    'Undercooked':      '😐 Undercooked — safe enough, but not very filling.',
    'Overcooked':       '😕 Overcooked — a bit tough, but edible.',
    'Cooked':           '✅ Cooked — a decent meal.',
    'Well-Cooked':      '👌 Well-cooked — tasty and satisfying.',
    'Perfectly Cooked': '⭐ Perfectly cooked.',
  };
  const qtyTxt = actualQty > 1 ? ` ×${actualQty}` : '';
  addStory(`🍽️ ${itemName}${qtyTxt} → <strong>${cookedName}${qtyTxt}</strong>`);
  addStory(COOK_MSGS[newCondition] || '');
  checkQuestObjectives?.('food_cooked');
  updateInventory();
}

// 9.3 · Cooking Roll Classifier — 7 tiers
function classifyCookingRoll(roll) {
  if (roll <= 2)  return 1; // Charred
  if (roll <= 5)  return 2; // Burnt
  if (roll <= 8)  return 3; // Undercooked
  if (roll <= 11) return 4; // Overcooked
  if (roll <= 15) return 5; // Cooked
  if (roll <= 18) return 6; // Well-Cooked
  return 7;                 // Perfectly Cooked
}

// 9.4 · Crafting
function canCraft(recipe, inventory = {}) {
  if (!recipe || !recipe.requires || !inventory) return false;

  return recipe.requires.every(req => {
    const invItem = inventory[req.item];
    if (!invItem) return false;
    if (req.tool) return true; // Only need to have it
    return invItem.quantity >= req.qty;
  });
}

function consumeIngredients(recipe, inventory) {
  recipe.requires.forEach(req => {
    if (!req.tool) {
      removeItem(req.item, req.qty);
    }
  });
}

function produceItem(recipe) {
  addItem(recipe.produces.item, recipe.produces.qty);
}

function attemptCraftOrCook(recipe) {
  if (!canCraft(recipe, player.inventory)) {
    addStory(`⚠️ You don't have the ingredients to make ${recipe.name}.`);
    return;
  }
  consumeIngredients(recipe, player.inventory);
  produceItem(recipe);
  addStory(`✅ You crafted ${recipe.produces.qty}× ${recipe.produces.item}.`);
  updateInventory();
}


const beginHuntBtn = document.getElementById('begin-hunt-button');
let huntClickInProgress = false;

beginHuntBtn.onclick = async () => {
  if (!huntActive) {
    // PRE-HUNT CHECK
    const hasBow = player.inventory['Bow'];
    const arrowCount = player.inventory['Arrow']?.quantity || 0;

    if (!hasBow || arrowCount <= 0) {
      restLog.textContent = "You need a bow and arrows to begin the hunt.";
      return; // Don’t toggle anything
    }

    // ✅ BEGIN HUNT
    huntActive = true;
    beginHuntBtn.textContent = 'End Hunt';
    document.getElementById('hunt-phase-status').textContent = '';
    console.log('➡️ Setting huntActive = true and calling startHunt(true)');
    startHunt(true); // run hunt, pass true to avoid auto-close
  } else {
    // 🔚 END HUNT
    huntActive = false;
    beginHuntBtn.textContent = 'Begin Hunt';
    restLog.textContent = 'Hunt Cancelled.';
    document.getElementById('hunt-phase-status').textContent = 'Hunt Cancelled.';
    console.log('🛑 Ending hunt');
  }
};


// 🚀 Detached async hunt sequence
async function runHuntSequence() {
  console.log('🎯 runHuntSequence() launched');
  await startHunt(true);

  if (!huntActive) {
    console.log('❌ Hunt cancelled midway');
    return;
  }

  console.log('✅ Hunt completed');
  // finish up...
}

// 9.5 · Camp Supply Inventory
const itemIcons = {
  'Stick Bundle': 'sticks.png',
  'Small Wood Bundle': 'firewood.png',
  'Large Wood Bundle': 'large_logs.png',
  'Bundle of Sharpened Sticks': 'sharpened_sticks.png',
  'Bundle of Leaves': 'leaves.png',
  // Add others as needed
};

function addCampSupply(itemName, qty = 1) {
  // Case-insensitive lookup in Items.*
  const nameLC = itemName.trim().toLowerCase();
  let foundKey = null;
  for (const category of Object.values(Items)) {
    for (const key of Object.keys(category)) {
      if (key.toLowerCase() === nameLC) { foundKey = key; break; }
    }
    if (foundKey) break;
  }
  if (!foundKey) { addStory(`⚠️ "${itemName}" not found in Items DB.`); return; }

  if (!player.campSupplies) player.campSupplies = [];
  const slot = player.campSupplies.find(i => i.name === foundKey);
  if (slot) slot.quantity += qty;
  else player.campSupplies.push({ name: foundKey, quantity: qty });

  addStory(`+${qty} ${foundKey}${qty!==1?'s':''} added to camp supplies.`);
  updateCampSuppliesGrid?.();
}

// 9.6 · Camp Supplies Grid UI
function updateCampSuppliesGrid() {
  const grid = document.getElementById('camp-supply-grid');
  if (!grid) return;
  grid.innerHTML = '';

  player.campSupplies.forEach(({ name, quantity }) => {
    if (quantity <= 0) return; // ❌ Skip if quantity is zero or less

    const div = document.createElement('div');
    div.className = 'camp-supply-item';

    const iconPath = _getItemIcon(name);

    div.innerHTML = `
      <img src="${iconPath}" alt="${name}" draggable="true" data-name="${name}" />
      <div>${name}</div>
      <div>Qty: ${quantity}</div>
    `;

    grid.appendChild(div);
  });
  updateCampStatusBar();
}

function updateCampStatusBar() {
  const bar = document.getElementById('camp-status-bar');
  if (!bar) return;
  const atCamp = campSetup && player.campLocation && player.campLocation === player.currentLocation;
  if (!atCamp) { bar.classList.remove('visible'); return; }
  bar.classList.add('visible');

  const isLit      = !!(player.hasFire && Number(fireTimeRemaining) > 0);
  const hasPit     = !!(player.hasCampfire || player.campfireBuilt || player.hasFirepit);
  const hasShelter = !!(player.hasShelter);
  const upgraded   = !!(player.shelterUpgraded);
  const supplies   = (player.campSupplies || []).filter(s => (s.quantity ?? 0) > 0);

  let html = '';
  if (hasPit || isLit) {
    const src   = isLit ? 'images/icons/campfire-lit.png' : 'images/icons/campfire-unlit.png';
    const label = isLit ? 'Lit' : 'Unlit';
    html += `<div class="csb-icon"><img src="${src}" alt="Campfire"><span>${label}</span></div>`;
  }
  if (hasShelter) {
    const src   = upgraded ? 'images/icons/shelter-leaves.png' : 'images/icons/shelter.png';
    const label = upgraded ? 'Upgraded' : 'Shelter';
    html += `<div class="csb-icon"><img src="${src}" alt="Shelter"><span>${label}</span></div>`;
  }
  if ((hasPit || isLit || hasShelter) && supplies.length) {
    html += `<div class="csb-divider"></div>`;
  }
  supplies.forEach(({ name, quantity }) => {
    const icon = _getItemIcon(name);
    html += `<div class="csb-supply"><img src="${icon}" alt="${name}"><span>${name} ×${quantity}</span></div>`;
  });
  if (!html) html = '<span style="font-size:10px;opacity:0.5;font-family:CelticHand,serif">Camp established</span>';
  bar.innerHTML = html;
}

const _ESTAB_ICONS = {
  tavern:         'images/icons/poneti/misc/wood_cup.png',
  inn:            'images/icons/bedroll.png',
  blacksmith:     'images/icons/poneti/misc/anvil.png',
  market:         'images/icons/poneti/containers/coin_pouch_small.png',
  'general store':'images/icons/poneti/containers/bag_brown.png',
  shop:           'images/icons/poneti/containers/bag_brown.png',
  herbalist:      'images/icons/poneti/ingredients/leaves.png',
  apothecary:     'images/icons/poneti/potions/potion_health_vial.png',
  temple:         'images/icons/poneti/misc/scroll_2.png',
  shrine:         'images/icons/poneti/misc/scroll_2.png',
  library:        'images/icons/poneti/misc/book.png',
  'guild hall':   'images/icons/poneti/misc/key_54.png',
  guild:          'images/icons/poneti/misc/key_54.png',
  stable:         'images/icons/poneti/tools/tool_rope.png',
  barracks:       'images/icons/poneti/weapons/common/all/sword_04.png',
  'town hall':    'images/icons/poneti/misc/parchment.png',
  aviary:         'images/icons/poneti/ingredients/feather_3.png',
  port:           'images/icons/poneti/tools/tool_rope.png',
};

function _estabIcon(estab) {
  const key = (estab.type || estab.name || '').toLowerCase();
  for (const [k, v] of Object.entries(_ESTAB_ICONS)) {
    if (key.includes(k)) return v;
  }
  return 'images/icons/poneti/misc/key_54.png';
}

const _TOWN_EVENTS_SHARED = [
  { icon: '🛒', text: 'A street market is running along the main road.' },
  { icon: '🍺', text: 'The tavern is noisier than usual — a local celebration, perhaps.' },
  { icon: '📣', text: 'A town crier has been reading announcements since morning.' },
  { icon: '⛪', text: 'A gathering at the temple has drawn half the residents.' },
  { icon: '🎪', text: 'Travelling performers have drawn a crowd near the gates.' },
  { icon: '🌧️', text: 'Recent rains have muddied the streets and soured moods.' },
  { icon: '💬', text: 'Locals talk in hushed clusters — something has them unsettled.' },
  { icon: '🏹', text: 'A militia drill is underway at the edge of town.' },
  { icon: '🕯️', text: 'A night market is winding down — a few stalls still open.' },
  { icon: '🐎', text: 'A courier arrived at speed not long ago; guards look alert.' },
];

const _TOWN_EVENTS_CITY = [
  { icon: '⚔️', text: 'A garrison patrol moves through the square in formation.' },
  { icon: '📜', text: "A diplomat's caravan arrived last night — the inn is full." },
  { icon: '🔥', text: 'Smoke still rises from a warehouse fire on the east side.' },
  { icon: '🗡️', text: 'A public sentencing is drawing a crowd at the courthouse.' },
  { icon: '⚒️', text: 'The guild hall is in session — traffic near it is heavy.' },
  { icon: '👑', text: 'Word has it a noble is visiting — guards are out in force.' },
  { icon: '🛡️', text: 'Soldiers are being conscripted at the garrison gate.' },
  { icon: '⚠️', text: 'The city watch is questioning merchants near the market.' },
  { icon: '📦', text: 'A large supply shipment is being unloaded at the docks.' },
  { icon: '🔔', text: 'Church bells have been ringing since dawn — no one will say why.' },
];

const _TOWN_EVENTS_VILLAGE = [
  { icon: '🌾', text: 'Most villagers are out in the fields — the harvest is on.' },
  { icon: '🐄', text: 'Something has been taking livestock. Farmers are on edge.' },
  { icon: '🤝', text: 'A land dispute has the village divided into two camps.' },
  { icon: '💧', text: 'The well is running low — water is being rationed carefully.' },
  { icon: '🎵', text: 'A wedding celebration fills the square with music and laughter.' },
  { icon: '👁️', text: 'Strangers draw wary glances here — word travels fast in small places.' },
  { icon: '🐺', text: 'Wolf tracks near the village — children are being kept inside.' },
  { icon: '🌙', text: 'The elders met last night over something — no one will say what.' },
  { icon: '🧑‍⚕️', text: 'A healer has been visiting house to house since yesterday.' },
  { icon: '🔨', text: 'A barn is being raised at the far end of the settlement.' },
];

function _getTownEvents(coord, cell) {
  const zone = cell.zone || '';
  const isCity = zone === 'City' || zone === 'CapitalCity';
  const name = cell.cityVillage || coord;
  const day  = Math.floor((player.worldState?.travelCount || 0) / 4);

  // Stable per-location per-day seed
  const seedStr = name + '|' + day;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (Math.imul(31, hash) + seedStr.charCodeAt(i)) | 0;
  }
  const rng = n => { const x = Math.sin(hash + n) * 43758.5453123; return x - Math.floor(x); };

  const pool = [
    ..._TOWN_EVENTS_SHARED,
    ...(isCity ? _TOWN_EVENTS_CITY : _TOWN_EVENTS_VILLAGE),
  ];

  // 20% chance of no event, otherwise 1–2
  if (rng(0) < 0.20) return [];
  const count = rng(1) < 0.55 ? 1 : 2;
  const events = [];
  const used   = new Set();
  for (let i = 0; i < count; i++) {
    let idx, attempts = 0;
    do { idx = Math.floor(rng(i + 2 + attempts++) * pool.length); } while (used.has(idx) && attempts < 20);
    if (!used.has(idx)) { used.add(idx); events.push(pool[idx]); }
  }
  return events;
}

function updateTownStatusBar() {
  const bar = document.getElementById('town-status-bar');
  if (!bar) return;
  const coord = player.currentLocation;
  const cell  = (typeof mapData !== 'undefined' && mapData[coord]) || {};
  const isSettlement = cell.zone === 'City' || cell.zone === 'CapitalCity' || cell.zone === 'Village'
    || (cell.establishments && cell.establishments.length > 0);
  if (!isSettlement) { bar.classList.remove('visible'); return; }
  bar.classList.add('visible');

  const disc    = (typeof getDiscoveredEstabs === 'function') ? getDiscoveredEstabs(coord) : [];
  const allEst  = cell.establishments || [];
  const known   = allEst.filter(e => disc.includes(e.name));
  const hidden  = allEst.length - known.length;

  let html = '';
  if (cell.cityVillage) {
    html += `<span class="tsb-label">${cell.cityVillage}</span>`;
    if (known.length || hidden) html += `<div class="csb-divider"></div>`;
  }
  known.forEach(est => {
    const icon = _estabIcon(est);
    const label = est.name.length > 18 ? est.name.slice(0, 16) + '…' : est.name;
    html += `<div class="tsb-chip"><img src="${icon}" alt="${est.name}" onerror="this.style.display='none'"><span>${label}</span></div>`;
  });
  if (hidden > 0) {
    html += `<span class="tsb-unknown">+${hidden} undiscovered</span>`;
  }
  if (!known.length && !hidden) {
    html += `<span class="tsb-unknown">No establishments known</span>`;
  }

  // Town events — right-aligned in the same flex row
  const events = _getTownEvents(coord, cell);
  if (events.length) {
    html += `<div class="tsb-event-row">`;
    events.forEach(ev => {
      html += `<span class="tsb-event"><span class="tsb-event-icon">${ev.icon}</span>${ev.text}</span>`;
    });
    html += `</div>`;
  }

  bar.innerHTML = html;
}

function consumeSupply(name, qty = 1) {
  if (!player.campSupplies) return false;

  const item = player.campSupplies.find(i => i.name === name);
  if (!item || (item.quantity ?? 0) < qty) return false;

  item.quantity -= qty;
  if (item.quantity <= 0) {
    player.campSupplies = player.campSupplies.filter(i => i.quantity > 0);
  }

  updateCampSuppliesGrid?.();
  addStory?.(`-${qty} ${name}(s) consumed from camp supplies.`);
  return true;
}


function getSupplyQty(name) {
  const item = player.campSupplies?.find(i => i.name === name);
  return item ? item.quantity : 0;
}

// ============================================================
// SECTION 9.7 · COMBAT SYSTEM
// ============================================================

// Enemy stat table — damage is [min, max] per hit, gold is [min, max] loot
const ENEMY_STATS = {
  'Bandit':        { maxLife: 35,  damage: [5, 10],  weapon: 'sword',    xp: 30,  gold: [5,  20], loot: [] },
  'Bandits':       { maxLife: 50,  damage: [7, 13],  weapon: 'blades',   xp: 45,  gold: [10, 30], loot: [] },
  'Highwayman':    { maxLife: 30,  damage: [6, 11],  weapon: 'blade',    xp: 30,  gold: [8,  25], loot: [] },
  'Wolf':          { maxLife: 20,  damage: [4, 8],   weapon: 'bite',     xp: 18,  gold: [0,  0],  loot: ['Wolf Hide'] },
  'Wolves':        { maxLife: 30,  damage: [5, 10],  weapon: 'claws',    xp: 25,  gold: [0,  0],  loot: ['Wolf Hide'] },
  'Bear':          { maxLife: 70,  damage: [12, 22], weapon: 'claws',    xp: 60,  gold: [0,  0],  loot: ['Bear Hide', 'Raw Bear Meat'] },
  'Boar':          { maxLife: 30,  damage: [6, 12],  weapon: 'tusks',    xp: 20,  gold: [0,  0],  loot: ['Raw Boar Meat'] },
  'Goblin':        { maxLife: 15,  damage: [3, 6],   weapon: 'blade',    xp: 15,  gold: [1,  5],  loot: [] },
  'Goblin Scout':  { maxLife: 18,  damage: [4, 7],   weapon: 'blade',    xp: 18,  gold: [1,  6],  loot: [] },
  'Skeleton':      { maxLife: 22,  damage: [5, 10],  weapon: 'sword',    xp: 25,  gold: [0,  0],  loot: [] },
  'Cultist':       { maxLife: 28,  damage: [7, 13],  weapon: 'dagger',   xp: 35,  gold: [3,  12], loot: [] },
  'Giant Spider':  { maxLife: 20,  damage: [5, 8],   weapon: 'fangs',    xp: 25,  gold: [0,  0],  loot: ['Spider Silk'] },
  'Rat':           { maxLife: 8,   damage: [1, 3],   weapon: 'bite',     xp: 5,   gold: [0,  0],  loot: [] },
};

// Map random event IDs to enemy types
const EVENT_ENEMY_MAP = {
  wolf_pack:        'Wolves',
  bandit_ambush:    'Bandits',
  goblin_scouts:    'Goblin Scout',
  highway_robbery:  'Highwayman',
  skeleton_warrior: 'Skeleton',
  cultist_ambush:   'Cultist',
  giant_spider:     'Giant Spider',
};

// Returns the skill name that matches the player's equipped weapon, or their best combat skill.
function _getBestCombatSkill() {
  const weapon = player.equipped?.rightHand || player.equipped?.leftHand || '';
  const wLow   = weapon.toLowerCase();
  // Weapon → skill mapping based on item name patterns
  if (weapon) {
    if (/bow|crossbow|shortbow|longbow|hunting bow/i.test(wLow)) return 'Archery';
    if (/sword|blade|sabre|cutlass|rapier|falchion|scimitar|dagger|short sword|iron sword/i.test(wLow)) return 'Swordsmanship';
    if (/axe|hatchet|cleaver|tomahawk/i.test(wLow))  return 'Axes';
    if (/spear|lance|pike/i.test(wLow))              return 'Spears';
    if (/staff|polearm|halberd|glaive/i.test(wLow))  return 'Polearms';
    if (/mace|hammer|club|flail|warhammer/i.test(wLow)) return 'Brawling';
  }
  // No weapon or unrecognised — pick highest-level combat skill
  const candidates = ['Swordsmanship', 'Archery', 'Brawling', 'Axes', 'Spears', 'Polearms'];
  let best = 'Brawling', bestLvl = 0;
  for (const sk of candidates) {
    const lvl = player.skills?.[sk]?.level || 0;
    if (lvl > bestLvl) { best = sk; bestLvl = lvl; }
  }
  return best;
}

// Sum the defense bonus from all equipped armor items.
function _getEquippedDefense() {
  let total = 0;
  for (const itemName of Object.values(player.equipped || {})) {
    if (!itemName) continue;
    const data = findItemInDatabase?.(itemName);
    if (data?.baseEffect?.defense) total += data.baseEffect.defense;
  }
  return total;
}

// Sum the damage bonus from an equipped weapon.
function _getEquippedWeaponDamage() {
  const weapon = player.equipped?.rightHand || player.equipped?.leftHand;
  if (!weapon) return 0;
  const data = findItemInDatabase?.(weapon);
  return data?.baseEffect?.damage || 0;
}

function startCombat(enemyType, opts = {}) {
  const tpl = ENEMY_STATS[enemyType] || ENEMY_STATS['Bandit'];
  combatState = {
    enemy: {
      name:     enemyType,
      life:     tpl.maxLife,
      maxLife:  tpl.maxLife,
      damage:   tpl.damage,
      weapon:   tpl.weapon,
      xp:       tpl.xp,
      goldRange:tpl.gold,
      loot:     [...tpl.loot],
    },
    defending: false,
    round:     0,
  };
  if (opts.narrative) addStory(opts.narrative);
  const playerDefense = _getEquippedDefense();
  const playerWeapon  = player.equipped?.rightHand || player.equipped?.leftHand || 'bare hands';
  const defStr = playerDefense > 0 ? ` · Armor: ${playerDefense} def` : '';
  addStory(`⚔️ A fight breaks out with ${enemyType}! (${tpl.maxLife} HP) — You: ${playerWeapon}${defStr}`);
  _showCombatWheel();
}

function _showCombatWheel() {
  if (!combatState) { _showDefaultWheel(); return; }
  const e = combatState.enemy;
  const hasMagic = (player.skills?.['Light Magic']?.level || 0) > 0
                || (player.skills?.['Black Magic']?.level  || 0) > 0;
  const opts = [
    { label: '⚔️ Attack',      action: _doCombatAttack },
    { label: '🛡️ Defend',      action: _doCombatDefend },
    { label: '🏃 Flee',        action: _doCombatFlee   },
  ];
  if (hasMagic) opts.splice(2, 0, { label: '✨ Spell', action: _doCombatSpell });
  opts.push(..._getSkillActionsForWheel('combat'));
  _buildWheel(opts, `${e.name} — ${e.life}/${e.maxLife} HP`);
}

function _enemyCounterattack() {
  if (!combatState) return;
  const e      = combatState.enemy;
  let dmg      = randomInt(e.damage[0], e.damage[1]);
  const armor  = _getEquippedDefense();
  // Each point of defense reduces damage by 0.5, capped so at least 1 damage always lands
  const reduction = Math.min(dmg - 1, Math.floor(armor * 0.5));
  if (combatState.defending) {
    dmg = Math.max(1, Math.floor((dmg - reduction) * 0.35));
    const armorNote = armor > 0 ? ` (armor: -${reduction})` : '';
    addStory(`🛡️ You block most of it — the ${e.name}'s ${e.weapon} glances off for ${dmg} damage${armorNote}.`);
  } else {
    dmg = Math.max(1, dmg - reduction);
    const armorNote = armor > 0 ? ` (armor: -${reduction})` : '';
    addStory(`🗡️ The ${e.name} strikes with its ${e.weapon} for ${dmg} damage${armorNote}.`);
  }
  changeLife(-dmg);
  // Armor degrades slightly when hit
  for (const [slot, name] of Object.entries(player.equipped || {})) {
    if (!name || slot === 'rightHand' || slot === 'leftHand') continue;
    if (player.inventory?.[name]) degradeItemWear(name, 1);
  }
  combatState.defending = false;
}

async function _doCombatAttack() {
  _buildWheel([{ label: '⚔️ Attacking…', action: () => {} }]);
  await runInlineProgress('Attacking…', 1500);
  const e       = combatState.enemy;
  const skill   = _getBestCombatSkill();
  const tier    = performSkillCheck(skill);
  const wepBonus = _getEquippedWeaponDamage();
  const dmg     = Math.max(1, tier * 4 + randomInt(-2, 3) + Math.floor(wepBonus * 0.4));
  e.life = Math.max(0, e.life - dmg);
  const wepNote = wepBonus > 0 ? ` (weapon: +${Math.floor(wepBonus * 0.4)})` : '';
  addStory(`⚔️ You hit the ${e.name} for ${dmg} damage${wepNote}. (${e.life}/${e.maxLife} HP)`);
  // Weapon degrades slightly each attack
  const wep = player.equipped?.rightHand || player.equipped?.leftHand;
  if (wep && player.inventory?.[wep]) degradeItemWear(wep, randomInt(2, 4));
  if (e.life <= 0) { _resolveCombatVictory(); return; }
  _partyAssistCombat();
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _doCombatDefend() {
  _buildWheel([{ label: '🛡️ Bracing…', action: () => {} }]);
  await runInlineProgress('Defending…', 1000);
  combatState.defending = true;
  changeStamina(-3);
  addStory('🛡️ You take a defensive stance. (−3 stamina)');
  _partyAssistCombat();
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _doCombatFlee() {
  _buildWheel([{ label: '🏃 Fleeing…', action: () => {} }]);
  await runInlineProgress('Fleeing…', 1500);
  const tier = performSkillCheck('Survival');
  if (tier >= 3) {
    addStory('🏃 You break away and escape into the wilderness!');
    changeStamina(-15);
    combatState = null;
    _showDefaultWheel();
  } else {
    addStory('🏃 They cut off your escape!');
    _enemyCounterattack();
    if (player.life <= 0) { _resolveCombatDefeat(); return; }
    _showCombatWheel();
  }
}

async function _doCombatSpell() {
  _buildWheel([{ label: '✨ Casting…', action: () => {} }]);
  await runInlineProgress('Casting…', 1500);
  if ((player.mana || 0) < 10) {
    addStory('⛔ Not enough mana to cast.');
    _showCombatWheel();
    return;
  }
  const e = combatState.enemy;
  const skill = (player.skills?.['Light Magic']?.level || 0) >= (player.skills?.['Black Magic']?.level || 0)
    ? 'Light Magic' : 'Black Magic';
  const tier = performSkillCheck(skill);
  const dmg  = tier * 6 + randomInt(0, 5);
  changeMana(-10);
  e.life = Math.max(0, e.life - dmg);
  awardProfessionXp('magic_used');
  addStory(`✨ Your spell strikes the ${e.name} for ${dmg} damage. (${e.life}/${e.maxLife} HP)`);
  if (e.life <= 0) { _resolveCombatVictory(); return; }
  _partyAssistCombat();
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  combatState.round++;
  _showCombatWheel();
}

// Party members contribute to combat — called after each player action.
function _partyAssistCombat() {
  if (!combatState || !combatState.enemy || combatState.enemy.life <= 0) return;
  const party = player.party || [];
  if (!party.length) return;

  const PARTY_SKILLS = {
    Fighter: 'Swordsmanship', Soldier: 'Swordsmanship', Knight: 'Swordsmanship', Warrior: 'Swordsmanship',
    Ranger: 'Archery', Hunter: 'Archery', Scout: 'Archery',
    Mage: 'Light Magic', Wizard: 'Light Magic', Sorcerer: 'Black Magic', Warlock: 'Black Magic',
    Rogue: 'Stealth', Thief: 'Stealth', Assassin: 'Stealth',
    Cleric: 'Survival', Priest: 'Survival', Monk: 'Brawling', Brawler: 'Brawling',
  };

  for (const member of party) {
    const prof   = member.profession || 'Fighter';
    const skill  = PARTY_SKILLS[prof] || 'Brawling';
    const roll   = randomInt(1, 12);
    const tier   = roll <= 3 ? 1 : roll <= 6 ? 2 : roll <= 9 ? 3 : roll <= 11 ? 4 : 5;
    if (tier === 1) {
      addStory(`🗡️ ${member.name} misses their strike.`);
      continue;
    }
    const dmg = Math.max(1, tier * 3 + randomInt(-1, 2));
    combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
    const e = combatState.enemy;
    const actions = {
      Swordsmanship: 'slashes', Archery: 'looses an arrow at', Brawling: 'punches',
      Stealth: 'stabs', 'Light Magic': 'blasts', 'Black Magic': 'strikes',
      Survival: 'strikes', default: 'hits',
    };
    const verb = actions[skill] || actions.default;
    addStory(`🗡️ ${member.name} ${verb} the ${e.name} for ${dmg} damage. (${e.life}/${e.maxLife} HP)`);
    if (e.life <= 0) break;
  }
}

function _resolveCombatVictory() {
  const e = combatState.enemy;
  addStory(`🏆 You defeated the ${e.name}!`);
  awardProfessionXp('combat_victory');
  gainExperience(e.xp);
  const gold = randomInt(e.goldRange[0], e.goldRange[1]);
  if (gold > 0) {
    player.gold = (player.gold || 0) + gold;
    addStory(`💰 +${gold} gold.`);
    updateTopStats();
  }
  e.loot.forEach(item => addItem(item, 1, { type: 'material', weight: 1, rarity: 'Common' }));
  if (Math.random() < 0.06) awardRecipeScroll();
  checkQuestObjectives?.('defeated', { target: e.name });
  addWorldEvent(`Defeated ${e.name} in combat.`, 'combat');
  _wsInit().defeatedEnemies++;
  checkGlobalEventTriggers();
  combatState = null;
  _showDefaultWheel();
}

function _resolveCombatDefeat() {
  const e = combatState?.enemy;
  addStory(`💀 You are defeated by the ${e?.name || 'enemy'}. You fall unconscious…`);
  player.life    = Math.max(1, Math.floor(player.maxLife * 0.1));
  player.stamina = 0;
  const goldLost = Math.min(player.gold || 0, Math.max(1, Math.floor((player.gold || 0) * 0.3)));
  if (goldLost > 0) {
    player.gold -= goldLost;
    addStory(`💰 You lose ${goldLost} gold.`);
  }
  applyCondition('injured');
  updateTopStats();
  addStory('You regain consciousness sometime later, battered and barely alive.');
  combatState = null;
  _showDefaultWheel();
}

// ============================================================
// SECTION 10 · CONTEXT & RADIAL MENUS
// ============================================================

// 10.1 · Global Context-Menu Close Helper
function closeMenu(e) {
  const menu = document.getElementById('context-menu');
  if (menu && !menu.contains(e.target)) {
    menu.style.display = 'none';
    document.removeEventListener('click', closeMenu);
  }
}

// 10.2 · Shelter Context-Menu Builder
function buildShelterOptions(menu) {
  menu.innerHTML = '';

  // Always allow Build when not built
  const built = !!(player?.hasShelter || player?.shelterLevel);
  const buildOpt = document.createElement('div');
  buildOpt.className = 'context-menu-option';
  buildOpt.textContent = built ? 'Rebuild/Repair Shelter' : 'Build Shelter';
  buildOpt.onclick = () => {
    menu.style.display = 'none';
    const maybe = (typeof handleShelterOption === 'function') ? handleShelterOption() : null;
    Promise.resolve(maybe).finally(() => setBuiltIcon('shelter-button', true));
  };
  menu.appendChild(buildOpt);

  // Only show Upgrade if already built
  if (built) {
    const upgradeOpt = document.createElement('div');
    upgradeOpt.className = 'context-menu-option';
    upgradeOpt.textContent = 'Upgrade Shelter';
    upgradeOpt.onclick = () => {
      menu.style.display = 'none';
      const maybe = (typeof handleShelterUpgrade === 'function') ? handleShelterUpgrade() : null;
      Promise.resolve(maybe).finally(() => setBuiltIcon('shelter-button', true));
    };
    menu.appendChild(upgradeOpt);
  }
}


// 10.3 · Radial Menu
// showRadialMenu(iconEl, items)
// items: [{ label, icon?, onClick?, disabled?, tooltip? }, ...]
function showRadialMenu(iconEl, items) {
  if (!iconEl) return;

  // Toggle: if this icon already has one, remove it
  const existing = iconEl.querySelector('.radial-menu-container');
  if (existing) { existing.remove(); return; }

  // Close any other open radials elsewhere (keeps UI tidy)
  document.querySelectorAll('.radial-menu-container').forEach(n => n.remove());

  // Build container + circle
  const container = document.createElement('div');
  container.className = 'radial-menu-container';
  const circle = document.createElement('div');
  circle.className = 'circle';
  container.appendChild(circle);

  // Build options
  (items || []).forEach((it = {}, i) => {
    const opt = document.createElement('div');
    opt.className = 'radial-menu-option';
    if (it.disabled) opt.classList.add('radial-disabled');
    if (it.tooltip)  opt.title = it.tooltip;

    // optional icon
    if (it.icon) {
      const img = document.createElement('img');
      img.src = it.icon;
      img.alt = it.label || '';
      img.className = 'ctx-icon';
      opt.appendChild(img);
    }

    // label
    const txt = document.createElement('div');
    txt.textContent = it.label ?? '';
    opt.appendChild(txt);

    // click/keyboard
    opt.tabIndex = it.disabled ? -1 : 0;
    const invoke = (e) => {
      e.stopPropagation();
      if (it.disabled) return;
      container.remove();
      if (typeof it.onClick === 'function') it.onClick();
    };
    opt.onclick = invoke;
    opt.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') invoke(e);
      if (e.key === 'Escape') { container.remove(); }
    };

    circle.appendChild(opt);
  });

  // Attach to body (unconstrained positioning)
  document.body.appendChild(container);

  // Anchor to the icon's <img> (fallback to the button)
  const anchorEl = iconEl.querySelector('img') || iconEl;
  const rect = anchorEl.getBoundingClientRect();
  const centerTop  = rect.top  + window.scrollY + rect.height / 2;
  const centerLeft = rect.left + window.scrollX + rect.width  / 2;

  Object.assign(container.style, {
    position: 'absolute',
    top:  centerTop  + 'px',
    left: centerLeft + 'px',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999
  });

  // Lay items on a circle
  const opts = circle.querySelectorAll('.radial-menu-option');
  const l = opts.length || 1;
  const radiusPct = 35; // matches your CSS demo sizing

  for (let i = 0; i < l; i++) {
    const angle = (-0.5 * Math.PI) - 2 * (1 / l) * i * Math.PI;
    const leftPct = (50 - radiusPct * Math.cos(angle)).toFixed(4) + '%';
    const topPct  = (50 + radiusPct * Math.sin(angle)).toFixed(4) + '%';
    const opt = opts[i];
    opt.style.left = leftPct;
    opt.style.top  = topPct;
  }

  // Open animation
  requestAnimationFrame(() => container.classList.add('open'));

  // Close on outside click / ESC
  const closeHandler = (e) => {
    if (!container.contains(e.target)) {
      container.remove();
      document.removeEventListener('click', closeHandler);
      document.removeEventListener('keydown', escHandler);
    }
  };
  const escHandler = (e) => {
    if (e.key === 'Escape') closeHandler(e);
  };
  setTimeout(() => {
    document.addEventListener('click', closeHandler);
    document.addEventListener('keydown', escHandler);
  }, 0);
}



// ── Quest Generation UI (Section 10 continued) ───────────────────────────────

			// Display a generated quest and let the player accept or decline.
			// Returns a Promise that resolves to 'accepted' or 'declined'.
			function showQuestOffer(questDef, source) {
				addStory(`📜 <strong>${questDef.name}</strong>`);
				addStory(questDef.description);
				if (questDef.objectives?.[0]) addStory(`→ ${questDef.objectives[0].text}`);
				const rParts = [];
				if (questDef.rewards?.gold)       rParts.push(`${questDef.rewards.gold} gold`);
				if (questDef.rewards?.experience) rParts.push(`${questDef.rewards.experience} XP`);
				if (rParts.length) addStory(`Reward: ${rParts.join(', ')}`);

				return new Promise(resolve => {
					_buildWheel([
						{
							label: '✅ Accept',
							action: () => {
								if (typeof quests !== 'undefined') quests.push(questDef);
								startQuest(questDef.id, true);
								addStory(`✅ Quest accepted: <strong>${questDef.name}</strong>`);
								resolve('accepted');
							}
						},
						{
							label: '❌ Decline',
							action: () => {
								addStory('You decline the offer.');
								resolve('declined');
							}
						}
					], questDef.name);
				});
			}

			// Bulletin board: generate quests for the current settlement (cached per location).
			function _openBulletinBoard() {
				const cell    = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const biome   = cell.biome || 'Plains';
				const kingdom = cell.kingdom || player.currentKingdom || null;

				if (!player.bulletinQuests) player.bulletinQuests = {};
				if (!player.bulletinQuests[player.currentLocation]) {
					player.bulletinQuests[player.currentLocation] =
						QuestGenerator.generateBulletinQuests(player.currentLocation, kingdom, biome, player.level, 4);
				}

				const accepted = new Set((player.journal.quests || []).map(q => q.id));
				const available = player.bulletinQuests[player.currentLocation].filter(q => !accepted.has(q.id));

				if (!available.length) {
					addStory('📋 The bulletin board is bare — no new postings today.');
					_goBack();
					return;
				}

				addStory('📋 You scan the bulletin board...');
				_buildWheel([
					...available.slice(0, 6).map(q => ({
						label:   q.name.length > 28 ? q.name.slice(0, 26) + '…' : q.name,
						tooltip: q.name.length > 28 ? q.name : undefined,
						action: async () => {
							_wheelStack.push(_openBulletinBoard);
							await showQuestOffer(q, 'bulletin');
							_goBack();
						}
					})),
					{ label: '← Back', action: _goBack, isBack: true }
				], 'Bulletin Board');
			}

			// NPC Trade system
			const NPC_SHOP_TABLES = {
				Merchant:     [['Rations',3,5],['Rope',1,8],['Torch',2,3],['Bandage',3,4],['Lantern',1,12],['Coin Purse',1,6]],
				Trader:       [['Rations',3,5],['Rope',1,8],['Torch',2,3],['Fine Clothing',1,20],['Coin Purse',1,6],['Ink & Quill',1,10]],
				Blacksmith:   [['Iron Sword',1,35],['Iron Dagger',1,18],['Leather Armor',1,28],['Iron Shield',1,30],['Iron Helmet',1,22],['Arrowhead',5,2]],
				Weaponsmith:  [['Iron Sword',1,35],['Iron Dagger',1,18],['Shortbow',1,30],['Arrow',10,1],['Iron Axe',1,32],['Iron Spear',1,25]],
				Herbalist:    [['Healing Herb',3,6],['Bandage',2,4],['Antidote Herb',2,8],['Mushroom',2,3],['Dried Berries',3,4],['Poultice',2,10]],
				Apothecary:   [['Health Potion',2,20],['Stamina Draught',2,18],['Antidote',1,25],['Healing Herb',3,6],['Poultice',2,10],['Smelling Salts',1,12]],
				Alchemist:    [['Health Potion',1,20],['Mana Potion',1,25],['Antidote',1,25],['Poison Vial',1,30],['Flash Powder',1,15],['Alchemist Fire',1,40]],
				Farmer:       [['Rations',5,3],['Dried Berries',4,2],['Mushroom',3,2],['Rope',1,6],['Sack',2,4],['Waterskin',1,8]],
				Hunter:       [['Arrow',10,1],['Rope',1,6],['Hunting Knife',1,15],['Animal Trap',1,20],['Torch',2,3],['Bandage',2,4]],
				Innkeeper:    [['Rations',4,4],['Waterskin (Full)',2,8],['Torch',3,3],['Dried Berries',3,3],['Bandage',2,5],['Candle',3,2]],
				'Tavern Keeper': [['Rations',4,4],['Waterskin (Full)',2,8],['Torch',3,3],['Dried Berries',3,3],['Bandage',2,5],['Candle',3,2]],
				Tailor:       [['Fine Clothing',1,18],['Leather Armor',1,28],['Dark Cloak',1,22],['Belt Knife',1,10],['Rope',1,6],['Sack',2,4]],
				Carpenter:    [['Torch',3,3],['Rope',1,6],['Wooden Shield',1,15],['Kindling',5,1],['Sticks',5,1],['Candle',3,2]],
				default:      [['Rations',3,4],['Torch',2,3],['Rope',1,7],['Bandage',2,5],['Waterskin',1,8],['Candle',3,2]],
			};

			async function _doNpcTrade(npc) {
				const prof  = npc.profession || 'default';
				const table = NPC_SHOP_TABLES[prof] || NPC_SHOP_TABLES.default;

				// Negotiating check sets discount
				addStory(`${npc.name} eyes you appraisingly.`);
				_buildWheel([{ label: '💬 Haggling…', action: () => {} }]);
				await runInlineProgress('Negotiating…', 1500);
				const negTier = performSkillCheck('Negotiating');
				const discount = negTier >= 5 ? 0.30 : negTier >= 4 ? 0.20 : negTier >= 3 ? 0.10 : 0;
				if (discount > 0) addStory(`🤝 You talk them down — ${Math.round(discount * 100)}% off.`);

				const npcEOpts = _buildEconOpts(npc.traits || []);
				_openTradeModal(`${npc.name}'s Wares`, table, npc, npcEOpts, { discount });
			}

			// Encounter a random NPC in the current settlement who may offer a quest.
			function _talkToNpc() {
				const cell    = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const biome   = cell.biome   || 'Plains';
				const kingdom = cell.kingdom || player.currentKingdom || null;

				// Use full generator when available; inline fallback otherwise.
				let npc;
				if (typeof NPCGenerator !== 'undefined') {
					npc = NPCGenerator.generate({ biome: cell.biome, zone: cell.zone });
				} else {
					const races = ['Human','Human','Human','Elf','Dwarf','Halfling','Orc'];
					const profs = ['Farmer','Hunter','Merchant','Priest','Scholar','Wanderer','Blacksmith'];
					npc = {
						race:            races[Math.floor(Math.random() * races.length)],
						profession:      profs[Math.floor(Math.random() * profs.length)],
						relationToPlayer:'Neutral',
						flags:           { recruitable: false, romanceable: false, canBePickpocketed: true, dropsLootOnDeath: false }
					};
				}

				const questDef = QuestGenerator.generateNpcQuest(npc, kingdom, biome, player.level);
				npc.name       = questDef.acquisition?.trigger?.npc || npc.name || QuestGenerator.randomName(npc.race);
				questDef.acquisition.trigger.npc = npc.name;

				meetNPC(npc);
				if (npc._worldId) bumpImportance(npc._worldId, 'street conversation', 2);

				// Pendant reactions — some NPCs recognise Aelindra's Pendant
				if (player.equipped?.pendant === "Aelindra's Pendant") {
					const _scholarProfs = ['Scholar','Sage','Loremaster','Historian','Archivist','Philosopher','Bard','Minstrel','Librarian','Elder'];
					const _isScholar    = _scholarProfs.includes(npc.profession);
					const _isElf        = npc.race === 'Elf';
					if ((_isScholar || _isElf) && Math.random() < 0.50) {
						const _reactions = [
							`${npc.name}'s eyes fix on the pendant at your throat. A long pause. "Where did you get that?" Their voice is careful. Controlled.`,
							`${npc.name} stops mid-sentence. Their gaze drops to your pendant and stays there. "I was told those were all destroyed. Every last one."`,
							`${npc.name} takes a half-step back. "That mark — I've only seen it in one place. A private archive I shouldn't have had access to." They don't elaborate.`,
						];
						addStory(_reactions[Math.floor(Math.random() * _reactions.length)]);
					} else if (Math.random() < 0.12) {
						const _vague = [
							`${npc.name}'s gaze lingers on the pendant as you speak. They look away without comment, something uneasy in the silence.`,
							`You notice ${npc.name} watching the pendant at your throat. They don't ask about it.`,
						];
						addStory(_vague[Math.floor(Math.random() * _vague.length)]);
					}
				}

				const RUMORS = [
					'The roads have been dangerous lately — bandits are getting bolder.',
					'I heard there\'s a reward being offered at the town hall.',
					'Strange lights were seen to the north last night. Nobody knows what caused them.',
					'A caravan went missing a few days back. Folks are worried.',
					'There are ruins a day\'s walk from here. People say they\'re haunted.',
					'My grandmother used to hum a tune she couldn\'t name. Said her mother taught her. Nobody knows where it came from.',
					'The old stones in the eastern hills weren\'t put there by anyone we know of. Nobody asks about them anymore.',
					'There\'s a valley to the south the locals won\'t go near. Won\'t say why. Just won\'t.',
					'I found an old mark carved into a tree root — like a tree, but with the roots showing too. Strange thing to carve.',
					'Dig deep enough under half the towns on this continent and you\'ll find older foundations. Nobody talks about whose they were.',
					'Some of the ruling families have a custom at coronation that nobody outside the bloodline is supposed to know about. I heard about it from someone who shouldn\'t have been talking.',
					'The Crimson Valley got its name for a reason. Nobody remembers the reason. That\'s the part that bothers me.',
				];

				awardProfessionXp('npc_talk');
				const _canApprentice = !!(npc.profession && PROFESSION_TIER_DATA?.[npc.profession]) && (player.professions?.[npc.profession]?.tier ?? -1) < 3;
				_buildWheel([
					{
						label: 'Ask About Work',
						action: async () => {
							_wheelStack.push(_showTownWheel);
							const result = await showQuestOffer(questDef, `NPC: ${npc.name}`);
							if (result === 'accepted' && npc._worldId) bumpImportance(npc._worldId, 'gave quest to player', 3);
							_goBack();
						}
					},
					{
						label: 'The Kingdom',
						action: () => {
							const _opinion = getNpcKingdomOpinion(npc, kingdom);
							addStory(`<strong>${npc.name}</strong>: ${_opinion}`);
							gainSkillXp('Persuasion', 2);
							_goBack();
						}
					},
					{
						label: 'Ask for Rumors',
						action: () => {
							addStory(`${npc.name}: "${RUMORS[Math.floor(Math.random() * RUMORS.length)]}"`);
							// 40% chance NPC tips you off about a nearby establishment
							const undiscovered = _getUndiscoveredEstabs();
							if (undiscovered.length && Math.random() < 0.40) {
								const est = undiscovered[Math.floor(Math.random() * undiscovered.length)];
								discoverEstablishment(player.currentLocation, est.name, true);
								addStory(`${npc.name} also mentions ${est.name} — you note it down.`);
							}
							// Scholarly professions share lore more readily
							const LORE_PROFESSIONS = ['Scholar','Sage','Loremaster','Historian','Archivist','Philosopher','Scribe','Bard','Minstrel','Troubadour','Poet','Librarian'];
							const loreChance = LORE_PROFESSIONS.includes(npc.profession) ? 0.40 : 0.15;
							if (Math.random() < loreChance) learnRandomLore('npc', { source: 'npc' });
							_goBack();
						}
					},
					{
						label: 'Trade',
						action: () => { _wheelStack.push(() => _talkToNpc()); _doNpcTrade(npc); }
					},
					{
						label:    'Apprentice',
						action:   () => { joinProfession(npc.profession); _goBack(); },
						disabled: !_canApprentice,
					},
					{ label: '← Back', action: _goBack, isBack: true }
				], npc.name);
			}

			// ── Town Events ──────────────────────────────────────────────────────────

			const TOWN_EVENTS = [
				{
					id: 'pickpocket', weight: 4,
					narrative: 'A small figure bumps into you in the crowd. You feel fingers at your coin purse.',
					check: 'Tracking', difficulty: 10,
					success: { story: 'You catch their wrist. They twist free and bolt, empty-handed.', effects: [] },
					failure: { story: 'By the time you notice, your coin purse is lighter.', goldMod: -0.12 },
				},
				{
					id: 'guard_stop', weight: 3,
					narrative: '"I don\'t recognise you." A town guard plants himself in your path. "State your business."',
					check: 'Persuasion', difficulty: 8,
					success: { story: 'You explain yourself smoothly. The guard nods and steps aside.', effects: [] },
					failure: { story: 'He moves you on — you\'ve spent enough time in this area for now.', effects: [{ type: 'stamina', amount: -10 }] },
				},
				{
					id: 'lost_child', weight: 3,
					narrative: 'A child grabs your sleeve, eyes wide. "I can\'t find my mother. I\'m scared."',
					check: 'Tracking', difficulty: 9,
					success: { story: 'You navigate the streets and reunite the child with their grateful mother. She presses a few coins into your hand.', effects: [{ type: 'gold', amount: 5 }, { type: 'experience', amount: 10 }] },
					failure: { story: 'You search for a while before the child spots someone else and darts away.', effects: [{ type: 'stamina', amount: -3 }] },
				},
				{
					id: 'street_deal', weight: 3,
					narrative: 'A furtive trader pulls aside a canvas revealing a tray of goods. "Special price for you, friend."',
					check: 'Persuasion', difficulty: 7,
					success: { story: 'You haggle them to a fair price and walk away with something useful.', effects: [{ type: 'item', name: 'Healing Herb', qty: 2 }] },
					failure: { story: 'The price sounds reasonable but the goods are junk. You move on.', effects: [] },
				},
				{
					id: 'overheard_whispers', weight: 3,
					narrative: 'Two cloaked figures exchange hushed words in a doorway. You catch fragments mentioning a nearby location.',
					check: 'Stealth', difficulty: 10,
					success: { story: 'You piece together enough to note down a location you hadn\'t noticed before.', effects: [{ type: 'experience', amount: 10 }], revealEstab: true },
					failure: { story: 'One of them glances your way. They go silent and walk off quickly.', effects: [] },
				},
				{
					id: 'street_preacher', weight: 2,
					narrative: 'A robed figure stands on a box, preaching doom and salvation to a small, unimpressed crowd.',
					check: null,
					outcome: { story: 'You listen for a moment before moving on. Interesting world view.', effects: [{ type: 'experience', amount: 5 }] },
				},
				{
					id: 'street_brawl', weight: 2,
					narrative: 'Two men spill out of a doorway trading blows. A crowd has stopped to watch.',
					check: 'Brawling', difficulty: 11,
					success: { story: 'You step in and shove them apart with authority. Both back off, winded.', effects: [{ type: 'experience', amount: 15 }, { type: 'stamina', amount: -5 }] },
					failure: { story: 'You catch a wild elbow to the jaw for your trouble. You decide to leave them to it.', effects: [{ type: 'life', amount: -6 }] },
				},
			];

			async function fireTownEvent() {
				const total = TOWN_EVENTS.reduce((s, e) => s + e.weight, 0);
				let r = Math.random() * total;
				let ev = TOWN_EVENTS[TOWN_EVENTS.length - 1];
				for (const e of TOWN_EVENTS) { r -= e.weight; if (r <= 0) { ev = e; break; } }

				addStory(`🏘️ ${ev.narrative}`);

				if (!ev.check) {
					if (ev.outcome?.story) addStory(ev.outcome.story);
					applyEventEffects(ev.outcome?.effects || []);
					return;
				}

				const tier    = performSkillCheck(ev.check);
				const success = tier >= 3;
				const outcome = success ? ev.success : ev.failure;
				if (outcome?.story) addStory(outcome.story);

				const effects = (outcome?.effects || []).slice();
				if (!success && ev.failure?.goldMod) {
					const lost = Math.max(1, Math.floor((player.gold || 0) * Math.abs(ev.failure.goldMod)));
					effects.push({ type: 'gold', amount: -lost });
				}
				applyEventEffects(effects);

				if (success && ev.success?.revealEstab) {
					const undiscovered = _getUndiscoveredEstabs();
					if (undiscovered.length) {
						const found = undiscovered[Math.floor(Math.random() * undiscovered.length)];
						discoverEstablishment(player.currentLocation, found.name);
					}
				}
			}

			// ── Town Exploration ──────────────────────────────────────────────────────

			async function _exploreTown() {
				const COST = 5;
				if ((player.stamina || 0) < COST) {
					addStory('⚠️ You\'re too tired to explore right now.');
					_goBack(); return;
				}

				_buildWheel([{ label: '🔍 Exploring…', action: () => {} }]);
				await runInlineProgress('Wandering the streets…', 3500);
				changeStamina(-COST);
				updateTimeOfDay();

				const coord       = player.currentLocation;
				const undiscovered = _getUndiscoveredEstabs();

				if (Math.random() < 0.40) await fireTownEvent();
				if (Math.random() < 0.12) await fireRandomEvent('town', ['crime', 'traveler_encounter', 'merchant_encounter']);
				if (rollReencounters()) return; // re-encounter takes over the wheel

				let justFound = null;

				if (undiscovered.length === 0) {
					const disc = getDiscoveredEstabs(coord);
					const knownNames = disc.length ? `Known places: ${disc.join(', ')}.` : '';
					addStory('🗺️ You\'ve explored everything this settlement has to offer.' + (knownNames ? ` ${knownNames}` : ''));
				} else {
					const tier = performSkillCheck('Tracking');
					if (tier >= 3) {
						justFound = undiscovered[Math.floor(Math.random() * undiscovered.length)];
						discoverEstablishment(coord, justFound.name);
						if (justFound.description) addStory(justFound.description);
						else addStory(`📍 New discovery: <strong>${justFound.name}</strong>.`);
					} else {
						addStory('🔍 You wander the streets but don\'t find anything new this time.');
					}
				}

				if (justFound) {
					_buildWheel([
						{
							label:  `🏠 Visit ${justFound.name.length > 18 ? justFound.name.slice(0, 16) + '…' : justFound.name}`,
							tooltip: justFound.name,
							action: () => { _openEstablishment(justFound); },
						},
						{ label: '← Town', action: _goBack, isBack: true },
					], 'Discovery');
				} else {
					_goBack();
				}
			}

			// ── Known Places ──────────────────────────────────────────────────────────

			function _showKnownPlaces() {
				const coord = player.currentLocation;
				const cell  = (typeof mapData !== 'undefined' && mapData[coord]) || {};
				const disc  = getDiscoveredEstabs(coord);
				const known = (cell.establishments || []).filter(e => disc.includes(e.name));

				if (!known.length) {
					addStory('🏪 You haven\'t discovered any places here yet. Explore the town first.');
					_goBack(); return;
				}

				const isNight = isNightTime();
				_buildWheel([
					...known.slice(0, 6).map(est => ({
						label:    est.name.length > 22 ? est.name.slice(0, 20) + '…' : est.name,
						action:   () => { _wheelStack.push(_showKnownPlaces); _openEstablishment(est); },
						disabled: isNight && !_estOpenAtNight(est),
					})),
					{ label: '← Back', action: _goBack, isBack: true },
				], 'Known Places');
			}

			// Town sub-wheel: shown when the player is in a City or Village.
			function _showTownWheel() {
				const coord    = player.currentLocation;
				const cell     = (typeof mapData !== 'undefined' && mapData[coord]) || {};
				const all      = cell.establishments || [];
				const disc     = getDiscoveredEstabs(coord);
				const allFound = all.length > 0 && disc.length >= all.length;
				const hasKnown = disc.length > 0;

				// Find lodging to surface at night/evening — works whether discovered or not
				const lodgingEstab = isLateTime()
					? all.find(e => /inn|tavern|lodge|hostel|boarding/i.test(e.type || e.name || ''))
					: null;

				const isCapital = cell.zone === 'CapitalCity';

				_buildWheel([
					{
						label:  allFound ? '🗺️ Fully Explored' : '🔍 Explore Town',
						action: allFound
							? () => { addStory("You've already found everything this settlement has to offer."); }
							: () => { _wheelStack.push(_showTownWheel); _exploreTown(); },
					},
					{ label: 'Talk to Someone',
					  action: () => { _wheelStack.push(_showTownWheel); _talkToNpc(); } },
					{
						label:  `Known Places${hasKnown ? ` (${disc.length})` : ''}`,
						action: hasKnown
							? () => { _wheelStack.push(_showTownWheel); _showKnownPlaces(); }
							: () => { addStory("You haven't discovered any establishments here yet."); },
					},
					{ label: 'Bulletin Board',
					  action: () => { _wheelStack.push(_showTownWheel); _openBulletinBoard(); } },
					{ label: '🎪 Activities',
					  action: () => { _wheelStack.push(_showTownWheel); _showActivitiesWheel(); } },
					...(isCapital ? [{
						label:  '🏪 Marketplace',
						action: () => { _wheelStack.push(_showTownWheel); _showMarketplaceWheel(); },
					}] : []),
					...(player.flags?.recentRobbery ? [{
						label:  '🛡️ Report to Guards',
						action: () => { _wheelStack.push(_showTownWheel); _reportCrimeToGuards(); },
					}] : []),
					...(lodgingEstab ? [{
						label: '🛏️ Find Lodging',
						action: () => {
							const alreadyKnown = disc.includes(lodgingEstab.name);
							discoverEstablishment(coord, lodgingEstab.name, true);
							if (!alreadyKnown) addStory(`🛏️ You ask a passerby and are pointed toward <strong>${lodgingEstab.name}</strong>.`);
							_wheelStack.push(_showTownWheel);
							_openEstablishment(lodgingEstab);
						},
					}] : []),
					..._getSkillActionsForWheel('town').slice(0, 2),
					{ label: '🌲 Leave Town', action: () => {
							_townEngaged  = false;
							_currentEstab = null;
							player.currentAction = 'Idle';
							updateTopStats();
							_showActionsWheel();
						}, isBack: true },
				], 'Town');
			}

			function _showMarketplaceWheel() {
				const coord = player.currentLocation;
				const cell  = (typeof mapData !== 'undefined' && mapData[coord]) || {};
				const name  = cell.cityVillage || 'the capital';
				if (!player._discoveredMarket) player._discoveredMarket = {};
				if (!player._discoveredMarket[coord]) {
					player._discoveredMarket[coord] = true;
					addStory(`🏪 You find your way into ${name}'s marketplace — rows of stalls selling everything from fresh provisions to forged steel.`);
				}
				const stalls = [
					{ label: '🥩 Provisions',      type: 'general_store', stallName: 'Provisions Stall' },
					{ label: '⚔️ Weapons',          type: 'blacksmith',    stallName: 'Weapon Merchant' },
					{ label: '🛡️ Armour & Clothing',type: 'tailor',        stallName: 'Clothing & Armour Stall' },
					{ label: '🌿 Herbs & Potions',  type: 'herbalist',     stallName: "Herbalist's Stall" },
					{ label: '⚗️ Alchemist',        type: 'alchemist',     stallName: 'Alchemist Stall' },
					{ label: '🗺️ Maps & Books',     type: 'library',       stallName: 'Maps & Books' },
					{ label: '💰 Trader',            type: 'merchant',      stallName: 'Travelling Merchant' },
				];
				_buildWheel([
					...stalls.map(s => ({
						label:  s.label,
						action: () => {
							_wheelStack.push(_showMarketplaceWheel);
							_openEstablishment({ name: s.stallName, type: s.type, description: `A busy market stall.` });
						},
					})),
					{ label: '← Town', action: _goBack, isBack: true },
				], 'Marketplace');
			}

			// ── Tavern ──────────────────────────────────────────────────────────────────

			function _showMenuModal(title, items, onSelect) {
				let modal = document.getElementById('tmenu-modal');
				if (!modal) {
					modal = document.createElement('div');
					modal.id = 'tmenu-modal';
					modal.className = 'modal';
					modal.innerHTML = `
						<div class="tmenu-content">
							<div class="tmenu-header">
								<span id="tmenu-title"></span>
								<button class="tmenu-close" id="tmenu-close-btn">✕</button>
							</div>
							<ul id="tmenu-list" class="tmenu-list"></ul>
						</div>`;
					document.body.appendChild(modal);
					document.getElementById('tmenu-close-btn').addEventListener('click', () => {
						modal.style.display = 'none';
						_goBack();
					});
					modal.addEventListener('click', e => {
						if (e.target === modal) { modal.style.display = 'none'; _goBack(); }
					});
				}
				document.getElementById('tmenu-title').textContent = title;
				const list = document.getElementById('tmenu-list');
				list.innerHTML = '';
				items.forEach(item => {
					const li = document.createElement('li');
					li.className = 'tmenu-item' + (item.disabled ? ' tmenu-disabled' : '');
					li.innerHTML = `
						<div class="tmenu-item-main">
							<span class="tmenu-item-name">${item.label}</span>
							<span class="tmenu-item-cost">${item.cost > 0 ? item.cost + 'g' : 'Free'}</span>
						</div>
						<div class="tmenu-item-sub">${item.sub || ''}</div>
						${item.extra ? `<div class="tmenu-item-effects">${item.extra}</div>` : ''}`;
					if (!item.disabled) {
						li.addEventListener('click', () => { modal.style.display = 'none'; onSelect(item); });
					}
					list.appendChild(li);
				});
				modal.style.display = 'flex';
			}

			async function _enterTavern() {
				const cell       = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const tavernEst  = (cell.establishments || []).find(e => /tavern|inn/i.test(e.type || e.name || ''));
				const tavernName = tavernEst?.name || 'The Tavern';
				const _roomCostT = /city/i.test(cell.zone || '') ? 10 : 5;
				addStory(`🍺 You push through the door of ${tavernName}. The low murmur of conversation fills the smoky air.`);
				// 15% chance of a social encounter upon entering
				if (Math.random() < 0.15) {
					await fireRandomEvent('tavern', ['traveler_encounter', 'merchant_encounter', 'hazard']);
				}
				function _tavernMenu() {
					player.currentAction = `At ${tavernName}`;
					updateTopStats();
					const _hasRoom = player.hasRentedRoom;
					_buildWheel([
						{ label: '🍺 Order',           action: () => { _wheelStack.push(_tavernMenu); _tavernBarMenu(); } },
						{ label: '💬 Talk to Someone', action: () => { _wheelStack.push(_tavernMenu); _tavernTalkToStranger(); } },
						{ label: '🎲 Entertainment',   action: () => { _wheelStack.push(_tavernMenu); _tavernEntertainMenu(); } },
						{ label: _hasRoom ? '🛏️ Lodging ✓' : '🛏️ Lodging',
						  action: () => { _wheelStack.push(_tavernMenu); _tavernLodgingMenu(); } },
						{ label: '← Back', action: _goBack, isBack: true },
					], tavernName);
				}
				function _tavernBarMenu() {
					_buildWheel([
						{ label: '🍺 Order a Drink', action: () => { _wheelStack.push(_tavernBarMenu); _tavernOrderDrink(); } },
						{ label: '🍽️ Order Food',    action: () => { _wheelStack.push(_tavernBarMenu); _tavernOrderFood(); } },
						{ label: '🍲 Ask the Cook',  action: () => { _wheelStack.push(_tavernBarMenu); _tavernAskCook(); } },
						{ label: '← Back',           action: _goBack, isBack: true },
					], 'The Bar');
				}
				function _tavernEntertainMenu() {
					_buildWheel([
						{ label: '📰 Rumors',      action: () => { _wheelStack.push(_tavernEntertainMenu); _tavernRumors(); } },
						{ label: '🎵 Listen to Bard', action: () => { _wheelStack.push(_tavernEntertainMenu); _listenToBard(); } },
						{ label: '🦾 Arm Wrestle', action: () => { _wheelStack.push(_tavernEntertainMenu); _tavernArmWrestle(); } },
						{ label: '🎲 Dice Game',   action: () => { _wheelStack.push(_tavernEntertainMenu); _tavernDiceGame(); } },
						{ label: '← Back',         action: _goBack, isBack: true },
					], 'Entertainment');
				}
				function _tavernLodgingMenu() {
					const _canRent  = !player.hasRentedRoom && !isNightTime();
					const _hasToken = (player.inventory?.['Inn Token']?.quantity || 0) > 0 && !player.hasRentedRoom;
					_buildWheel([
						{ label: `🛏️ Rent a Room (${_roomCostT}g)`, action: () => { _wheelStack.push(_tavernLodgingMenu); _tavernRentRoom(_roomCostT); }, disabled: !_canRent },
						...(_hasToken   ? [{ label: '🎟️ Inn Token (Free)', action: () => { _wheelStack.push(_tavernLodgingMenu); _tavernUseInnToken(); } }] : []),
						...(player.hasRentedRoom ? [{ label: '🛏️ Sleep in Your Room', action: () => { _wheelStack.push(_tavernLodgingMenu); _tavernSleepInRoom(); } }] : []),
						{ label: '← Back', action: _goBack, isBack: true },
					], 'Lodging');
				}
				_tavernMenu();
			}

			function _tavernTalkToStranger() {
				const cell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
				const ctx  = { biome: cell.biome, zone: cell.zone,
				               whereMet: `at the tavern in ${cell.cityVillage || 'town'}`, tavern: true };
				const gen  = (typeof NPCGenerator !== 'undefined') ? NPCGenerator : null;
				if (!gen) { addStory('⚠️ NPC generator unavailable.'); _goBack(); return; }

				const npcs = [gen.generateTavernNPC(ctx), gen.generateTavernNPC(ctx), gen.generateTavernNPC(ctx)];
				npcs.forEach(n => registerNPC(n, 1));
				addStory('👀 You glance around the room. A few figures catch your attention...');
				npcs.forEach(n => {
					const first = n.appearance.split(',')[0];
					addStory(`• ${capitalize(first)}.`);
				});
				_buildWheel([
					...npcs.map(npc => ({
						label: npc.appearance.split(',')[0].substring(0, 28),
						action: () => {
							if (npc._worldId) bumpImportance(npc._worldId, 'player approached in tavern', 2);
							_wheelStack.push(_tavernTalkToStranger);
							_showNpcInteraction(npc, { anonymous: true });
						}
					})),
					{ label: '← Back', action: _goBack, isBack: true },
				], 'Who to Approach');
			}

			function _tavernOrderDrink() {
				const DRINKS = [
					{ name: 'Frothy Ale',    desc: 'The house ale. Reliable, if unremarkable.',          cost: 1, stamina: 3,  story: 'The barkeep slides a frothy ale across the counter. You drink it down.' },
					{ name: 'House Wine',    desc: 'A decent table wine, probably local.',                cost: 2, stamina: 2,  story: 'You sip a surprisingly decent wine.' },
					{ name: 'Golden Mead',   desc: 'Thick and sweet with a floral finish.',              cost: 2, stamina: 4,  story: 'The mead is thick and sweet. You feel warmer already.' },
					{ name: 'Strong Spirits',desc: 'Burns on the way down. Not for the faint of heart.', cost: 1, stamina: 2,  story: 'Rough spirits — burns going down, settles heavy.' },
					{ name: 'Dark Stout',    desc: 'Bitter and filling. A meal in a cup.',               cost: 2, stamina: 5,  story: 'A dark stout, bitter and filling. You feel steadier for it.' },
					{ name: 'Spring Water',  desc: 'Clean water. Free if you ask nicely.',               cost: 0, stamina: 1,  story: 'The barkeep slides over a cup of clean spring water.' },
				];
				_showMenuModal('🍺 Order a Drink', DRINKS.map(d => ({
					label:    d.name,
					sub:      d.desc,
					cost:     d.cost,
					extra:    `+${d.stamina} stamina`,
					data:     d,
					disabled: (player.gold || 0) < d.cost,
				})), chosen => {
					const d = chosen.data;
					player.gold = Math.max(0, (player.gold || 0) - d.cost);
					addStory(`🍺 ${d.story}${d.cost > 0 ? ` (−${d.cost} gold)` : ''}`);
					changeStamina(d.stamina);
					updateTopStats();
					advanceTime(1);
					_goBack();
				});
			}

			function _tavernOrderFood() {
				const MEALS = [
					{ name: 'Thick Stew',    desc: 'A steaming bowl of hearty stew. Fills you up.',              cost: 3, stamina: 12, life: 5,  story: 'A steaming bowl of thick stew arrives. Hearty and filling.' },
					{ name: 'Roast Meat',    desc: 'Roast with root vegetables — simple but satisfying.',         cost: 4, stamina: 15, life: 8,  story: 'Roast meat with root vegetables — simple, but exactly what you needed.' },
					{ name: 'Bread & Cheese',desc: 'Bread, hard cheese, and pickled onions. Humble but good.',   cost: 2, stamina: 8,  life: 3,  story: 'A wedge of bread with hard cheese and pickled onions. Humble but satisfying.' },
					{ name: 'Savoury Pie',   desc: 'The house speciality. Best meal you\'ve had in days.',       cost: 5, stamina: 18, life: 10, story: 'A hot pie oozes with seasoned filling. Best meal you\'ve had in days.' },
					{ name: 'Salted Fish',   desc: 'Salted fish with boiled greens. Nourishing, if not exciting.',cost: 2, stamina: 10, life: 4,  story: 'Salted fish with a side of boiled greens. Nourishing if not exciting.' },
				];
				_showMenuModal('🍽️ Order Food', MEALS.map(m => ({
					label:    m.name,
					sub:      m.desc,
					cost:     m.cost,
					extra:    `+${m.stamina} stamina, +${m.life} life`,
					data:     m,
					disabled: (player.gold || 0) < m.cost,
				})), chosen => {
					const m = chosen.data;
					player.gold -= m.cost;
					addStory(`🍽️ ${m.story} (+${m.stamina} stamina, +${m.life} life) (−${m.cost} gold)`);
					changeStamina(m.stamina);
					player.life = Math.min(player.maxLife, (player.life || 0) + m.life);
					player.turnsWithoutFood = 0;
					player.lastFedDay = player.day || 1;
					removeCondition('hungry');
					removeCondition('starving');
					removeCondition('peckish');
					applyCondition('well_fed', 4);
					if (Math.random() < 0.12) {
						const _tavernInsight = _pickUnknownCookingRecipe();
						if (_tavernInsight) {
							learnRecipe(_tavernInsight);
							addStory(`💡 <em>Something about the way this was prepared gives you an idea — you think you could recreate it.</em>`);
						}
					}
					updateTopStats();
					updatePlayerStats();
					advanceTime(1);
					_goBack();
				});
			}

			async function _tavernAskCook() {
				_buildWheel([{ label: '🍲 Chatting…', action: () => {} }]);
				await runInlineProgress('Seeking out the cook…', 2000);

				const cookName = ['the cook', 'the innkeeper', 'the barkeep'][Math.floor(Math.random() * 3)];
				const tier = performSkillCheck('Persuasion');

				if (tier <= 2) {
					const rejections = [
						`${capitalize(cookName)} waves you off. "Trade secrets. Now get out of my kitchen."`,
						`${capitalize(cookName)} squints at you. "You buyin' a meal or wasting my time?"`,
						`${capitalize(cookName)} shrugs. "I don't share recipes with strangers."`,
					];
					addStory(`🍲 ${rejections[Math.floor(Math.random() * rejections.length)]}`);
					advanceTime(1); _goBack(); return;
				}

				const cookingRecipe = _pickUnknownCookingRecipe();
				if (tier === 3) {
					const hints = [
						`${capitalize(cookName)} leans on the counter. "Trick to a good stew? Low heat and patience. Most folk rush it."`,
						`"Always sear the meat first," ${cookName} says. "Keeps the juices in. Everything else is just seasoning."`,
						`${capitalize(cookName)} nods. "Dried herbs go in at the end — heat kills the flavour."`,
					];
					addStory(`🍲 ${hints[Math.floor(Math.random() * hints.length)]}`);
					gainSkillXp('Cooking', 2);
					addStory(`💡 A useful technique noted.`);
				} else if (tier === 4) {
					if (cookingRecipe) {
						learnRecipe(cookingRecipe);
						addStory(`🍲 ${capitalize(cookName)} warms to you. "Alright, I'll show you something. Watch carefully…"`);
					} else {
						gainSkillXp('Cooking', 3);
						addStory(`🍲 ${capitalize(cookName)} walks you through a few techniques. You feel noticeably more confident in the kitchen.`);
					}
				} else {
					addStory(`🍲 ${capitalize(cookName)} takes a shine to you. "Come back to the kitchen — I'll show you properly."`);
					if (cookingRecipe) learnRecipe(cookingRecipe);
					awardRecipeScroll();
				}

				advanceTime(1); _goBack();
			}

			function _tavernRentRoom(cost) {
				if ((player.gold || 0) < cost) {
					addStory(`⚠️ You need ${cost} gold for a room. You have ${player.gold || 0}.`);
					_goBack(); return;
				}
				player.gold -= cost;
				player.hasRentedRoom = true;
				addStory(`🛏️ The innkeeper takes your coin and hands you a key. "Top of the stairs, last door on the left. Sleep well." (−${cost} gold)`);
				updateTopStats();
				_goBack();
			}

			function _tavernUseInnToken() {
				const token = player.inventory?.['Inn Token'];
				if (!token || (token.quantity || 0) < 1) { addStory('⚠️ You have no Inn Token.'); _goBack(); return; }
				removeItem('Inn Token', 1);
				player.hasRentedRoom = true;
				addStory(`🎟️ The innkeeper eyes your token and nods. "All settled then. Room's at the top of the stairs." You pocket the key.`);
				updateTopStats();
				_goBack();
			}

			async function _tavernSleepInRoom() {
				player.hasRentedRoom = false;
				_buildWheel([{ label: '💤 Retiring…', action: () => {} }]);
				await runInlineProgress('Retiring for the night…', 2000);
				addStory(`💤 You bolt the door and sink into the bed. Sleep comes quickly.`);
				addStory(`🌅 You wake with the dawn, rested and ready.`);
				player.life    = player.maxLife;
				player.stamina = player.maxStamina;
				player.timeOfDay = '🌅 Dawn';
				removeCondition('exhausted');
				removeCondition('fatigued');
				updateTopStats();
				updatePlayerStats();
				if (Math.random() < 0.10) {
					await fireRandomEvent('tavern', ['hazard', 'traveler_encounter']);
				}
				_goBack();
			}

			function _listenToBard() {
				const BARD_SONGS = [
					'A bard in the corner strums a melancholy air about kings long dead.',
					'A throaty voice fills the room with an old ballad — the words half-remembered by the older patrons.',
					'The bard plays a rousing sea shanty that has half the room stamping their feet.',
					'A haunting melody fills the air — something about a river that runs uphill at moonrise.',
					'The bard sings of roads untravelled and rivers that have no names.',
					'An old war song. Half the listeners stiffen. Half smile.',
					'The ballad tells of a wandering knight who found more in a stranger\'s firelight than in any keep.',
					'A slow, quiet piece — barely audible over the noise of the room. You lean in despite yourself.',
				];
				addStory(`🎵 ${BARD_SONGS[Math.floor(Math.random() * BARD_SONGS.length)]}`);
				if (Math.random() < 0.50) {
					const learned = learnRandomLore('bard', { source: 'bard' });
					if (!learned) addStory('Nothing in the tale is new to you.');
				}
				advanceTime(1);
				_goBack();
			}

			function _tavernRumors() {
				const TAVERN_RUMORS = [
					'A merchant mutters that the northern roads are watched by something that isn\'t bandits.',
					'A weathered soldier claims the last three supply wagons never reached their destination.',
					'Someone hushed says there\'s a reward for information about a disappeared scholar.',
					'The barkeep mentions a caravan that arrived with fewer guards than it left with.',
					'Whispers at the bar suggest a local merchant has been paying protection money.',
					'A traveller warns the river crossing to the east washed out in last week\'s storm.',
					'Old Henwick lost three sheep last night. No tracks. No blood. Just gone.',
					'The militia captain was spotted riding south alone and hasn\'t come back.',
					'Someone left a sealed letter at the bar a week ago. Nobody has claimed it.',
					'A child in the village swears she saw a light moving through the graveyard.',
				];
				// 35% chance: use a live NPC-sourced rumor if available
				let tavernRumor;
				if (worldNPCs.npcRumors?.length && Math.random() < 0.35) {
					tavernRumor = worldNPCs.npcRumors.shift();
				} else {
					tavernRumor = TAVERN_RUMORS[Math.floor(Math.random() * TAVERN_RUMORS.length)];
				}
				addStory(`👂 ${tavernRumor}`);
				// 30% chance rumour points to an undiscovered establishment
				const _undiscTav = _getUndiscoveredEstabs();
				if (_undiscTav.length && Math.random() < 0.30) {
					const est = _undiscTav[Math.floor(Math.random() * _undiscTav.length)];
					discoverEstablishment(player.currentLocation, est.name, true);
					addStory(`Someone at the bar mentions ${est.name} in passing — you file it away.`);
				}
				// 20% chance to overhear a lore snippet
				if (Math.random() < 0.20) learnRandomLore('rumor', { source: 'rumor' });
				advanceTime(1);
				_goBack();
			}

			// ── NPC Interaction ─────────────────────────────────────────────────────────

			// Core NPC interaction — trait-aware social system.
			function _showNpcInteraction(npc, opts = {}) {
				// Lazily init social fields
				if (!npc.revealedTraits)             npc.revealedTraits   = [];
				if (npc.interactionCount === undefined) npc.interactionCount = 0;
				if (npc.disposition      === undefined) npc.disposition      = 0;

				if (opts.anonymous) {
					addStory(`You approach the stranger. ${npc.description || ''}`);
				} else {
					addStory(`You approach <strong>${npc.name}</strong>. ${npc.description || ''}`);
				}
				meetNPC(npc);
				if (npc._worldId) bumpImportance(npc._worldId, 'player engaged', 2);

				// Pull world registry record for relation data
				const rec = npc._worldId ? worldNPCs.registry[npc._worldId] : getWorldNPCByName(npc.name);
				const rel  = rec?.relationship ?? 0;
				const relLabel = _getRelLabel(rel);

				// Contextual info — show what the player already knows
				const knownTraits = npc.revealedTraits;
				const dispLabel   = _dispositionLabel(npc);
				if (npc.interactionCount > 0) {
					addStory(`They seem <strong>${dispLabel}</strong> toward you. <em>(${relLabel})</em>`);
				}
				if (knownTraits.length) {
					addStory(`You have sensed the following about them: <em>${knownTraits.join(', ')}</em>.`);
					const affinity = _calcTraitAffinity(player.traits || [], knownTraits);
					if (affinity > 0) addStory(`Your shared nature puts you at ease with each other.`);
					else if (affinity < 0) addStory(`Your opposing natures create an underlying tension.`);
				} else if (npc.interactionCount === 0) {
					addStory(`You don't know them yet — their true character remains hidden.`);
				}

				// Party membership status
				const inParty = (player.party || []).some(m => m.name === npc.name);
				if (inParty) addStory(`<em>${npc.name} is travelling with you.</em>`);

				const _moralLevel = getMoralityTier(player.morality || 0).level;
				const TONES = [
					...(_moralLevel <= -3 ? [{ label: 'Terrorize', desc: 'Break their will through fear' }] : []),
					{ label: 'Malicious',  desc: 'Threaten or intimidate them' },
					{ label: 'Malevolent', desc: 'Cold, suspicious, or aggressive' },
					{ label: 'Neutral',    desc: 'Cautious and measured' },
					{ label: 'Valiant',    desc: 'Friendly and open' },
					{ label: 'Heroic',     desc: 'Warm, generous, inspiring' },
					...(_moralLevel >= 3 ? [{ label: 'Inspired', desc: 'Rally their spirit and courage' }] : []),
				];

				// Build contextual extra options based on relation level
				const extraOpts = [];

				// Offer Friendship — available once Friendly (rel ≥ 2)
				if (rel >= 2 && !inParty) {
					extraOpts.push({
						label:  '🤝 Offer Friendship',
						action: () => _doOfferFriendship(npc, rec),
					});
				}

				// Ask to Join — show for any potentially recruitable NPC; the function handles the gating
				const assess = typeof _recruitAssessment === 'function' ? _recruitAssessment(npc, rec) : null;
				if (assess && !inParty && assess.contractType !== 'none') {
					const joinLabel = assess.contractType === 'mercenary'
						? `💰 Hire (${_hireCost(npc, rec)}g)`
						: (assess.possible ? '⚔️ Ask to Join' : `⚔️ Ask to Join (${relLabel})`);
					extraOpts.push({
						label:    joinLabel,
						action:   () => _doAskToJoin(npc, rec),
						disabled: !assess.possible,
					});
				}

				// Pickpocket — only when NPC flag allows it
				if (npc.flags?.canBePickpocketed) {
					extraOpts.push({
						label:  '🖐️ Pickpocket',
						action: () => _doPickpocket(npc, rec),
					});
				}

				// Manage Party — always accessible from any NPC dialog if party has members
				if ((player.party || []).length > 0) {
					extraOpts.push({
						label:  '🏕️ Party',
						action: () => { _wheelStack.push(() => _showNpcInteraction(npc)); _showManagePartyWheel(); },
					});
				}

				_buildWheel([
					...TONES.map(t => ({
						label:  t.label,
						action: () => _doNpcDialog(npc, t.label),
					})),
					...extraOpts,
					...(developerMode ? [{ label: '[Dev] Inspect', action: () => _devInspectNpc(npc) }] : []),
					{ label: '← Back', action: _goBack, isBack: true },
				], opts.anonymous ? 'Stranger' : npc.name);
			}

			// Developer-mode NPC inspector — dumps all generated fields to the story log.
			function _devInspectNpc(npc) {
				const lines = [
					`━━ [DEV] NPC: ${npc.name}${npc.alias ? ` ${npc.alias}` : ''} ━━`,
					`Race: ${npc.race}  |  Gender: ${npc.gender}  |  Class: ${npc.socialClass}`,
					`Profession: ${npc.profession}  |  Morality: ${npc.morality}`,
					`Traits: ${(npc.traits || []).join(', ') || '—'}`,
					`Skills: ${(npc.skills || []).join(', ') || '—'}`,
					`Relation: ${npc.relationToPlayer}  |  Reputation: ${npc.reputation}`,
					`Affiliation: ${npc.affiliation || 'None'}`,
					`Goals: ${(npc.goals || []).join(' / ') || '—'}`,
					`Motives: ${(npc.motives || []).join(', ') || '—'}`,
					`Flags: recruitable=${npc.flags?.recruitable} | romanceable=${npc.flags?.romanceable} | pickpocket=${npc.flags?.canBePickpocketed}`,
					`Items: ${(npc.items || []).map(i => `${i.item}×${i.quantity}`).join(', ') || '—'}`,
					`Backstory: ${npc.backstory || '—'}`,
					`Secret: ${npc.secret || 'none'}`,
					`Met: ${npc.whereMet || '—'}`,
				];
				lines.forEach(l => addStory(l));
			}

async function _doPickpocket(npc, rec) {
  _buildWheel([{ label: '🖐️ Attempting…', action: () => {} }]);
  await runInlineProgress('Watching for an opening…', 2500);

  // Both Stealth and Thievery matter — use the lower tier as the limiting factor
  const stealthTier  = performSkillCheck('Stealth');
  const thieveryTier = performSkillCheck('Thievery');
  const tier = Math.min(stealthTier, thieveryTier);

  if (tier >= 4) {
    // Success — steal gold or an item
    const npcItems = (npc.items || []).filter(i => i.item && i.quantity > 0);
    let stolen;
    if (npcItems.length && Math.random() < 0.6) {
      const pick = npcItems[Math.floor(Math.random() * npcItems.length)];
      addItem(pick.item, 1, { type: 'misc', rarity: 'Common' });
      stolen = pick.item;
      addStory(`🖐️ Your fingers work quickly — you lift ${pick.item} without ${npc.name} noticing.`);
    } else {
      const gold = randomInt(5, 20);
      player.gold += gold;
      updateTopStats();
      stolen = `${gold} gold`;
      addStory(`🖐️ You slip your hand into ${npc.name}'s purse and pull out ${gold} gold. Smooth.`);
    }
    gainSkillXp('Thievery', tier);
    gainSkillXp('Stealth', tier);
    checkQuestObjectives?.('pickpocketed', { npc: npc.name, item: stolen });
  } else if (tier === 3) {
    addStory(`🖐️ You make an attempt but come away empty-handed. ${npc.name} shifts uncomfortably but doesn't notice.`);
  } else if (tier === 2) {
    addStory(`🖐️ ${npc.name} catches your hand. "Watch yourself," they say coldly.`);
    if (rec) bumpRelationship?.(rec.id, -1);
  } else {
    addStory(`🖐️ ${npc.name} grabs your wrist. "Thief!" The encounter turns hostile.`);
    if (rec) bumpRelationship?.(rec.id, -3);
    npc.relationToPlayer = 'Hostile';
  }
  _goBack();
}

// ============================================================
// SECTION 10.45 · FRIENDSHIP & PARTY SYSTEM
// ============================================================

// Professions that will never follow a player — they have their own place in the world.
const NON_RECRUITABLE_PROFESSIONS = new Set([
  'Noble','Lord','Lady','King','Queen','Prince','Princess','Duke','Duchess','Baron','Baroness',
  'Merchant','Trader','Innkeeper','Tavern Keeper','Bartender','Shopkeeper','Banker','Moneylender',
  'Priest','Bishop','Archbishop','Monk','Cleric','Acolyte','Oracle','Seer',
  'Judge','Magistrate','Chancellor','Steward','Chamberlain',
  'Blacksmith','Armorer','Fletcher','Alchemist','Herbalist','Apothecary','Tanner','Carpenter',
  'Farmer','Fisherman','Miller','Baker','Brewer','Tailor','Jeweler','Mason',
  'Scholar','Librarian','Archivist','Scribe','Cartographer',
  'Spy','Assassin','Executioner',   // too dangerous/independent to trust
  'Bandit','Outlaw','Fugitive',      // unreliable by nature
]);

// Professions that hire out for coin (mercenary contract).
const MERCENARY_PROFESSIONS = new Set([
  'Mercenary','Sellsword','Bounty Hunter','Guard','Soldier','Knight Errant',
  'Pikeman','Scout','Sentinel','Night Watchman','Crossbowman',
]);

// Professions that join through friendship/bond (relationship ≥ 3 "Ally").
const BOND_PROFESSIONS = new Set([
  'Adventurer','Explorer','Ranger','Hunter','Tracker','Forager','Forester',
  'Archer','Bard','Minstrel','Performer','Storyteller',
  'Wanderer','Pirate','Sailor','Barbarian','Gambler','Relic Hunter',
  'Pathfinder','Dungeon Delver','Trapper','Animal Trainer','Pilgrim','Tinker',
]);

const MAX_PARTY_SIZE = 4;

// Returns { possible: bool, contractType: 'mercenary'|'bond'|'none', reason: string }
function _recruitAssessment(npc, rec) {
  if ((player.party || []).length >= MAX_PARTY_SIZE) {
    return { possible: false, contractType: 'none', reason: `Your party is full (${MAX_PARTY_SIZE} max).` };
  }
  if ((player.party || []).some(m => m.worldId === rec?.id || m.name === npc.name)) {
    return { possible: false, contractType: 'none', reason: 'They are already in your party.' };
  }

  const prof = npc.profession || '';
  const rel  = rec?.relationship || 0;

  if (NON_RECRUITABLE_PROFESSIONS.has(prof)) {
    return { possible: false, contractType: 'none', reason: `${prof}s have their own obligations.` };
  }

  if (MERCENARY_PROFESSIONS.has(prof)) {
    if (rel < -2) return { possible: false, contractType: 'none', reason: 'They want nothing to do with you.' };
    return { possible: true, contractType: 'mercenary', reason: 'For the right coin, they will follow.' };
  }

  if (BOND_PROFESSIONS.has(prof)) {
    if (rel < 3) return { possible: false, contractType: 'bond', reason: `They don't know you well enough yet. (Need: Ally)` };
    return { possible: true, contractType: 'bond', reason: 'Your friendship has earned their trust.' };
  }

  // Catch-all: any other profession needs Ally (rel ≥ 3) before they'd consider it
  if (rel < 3) return { possible: false, contractType: 'bond', reason: `They don't know you well enough yet. (Need: Ally)` };
  return { possible: true, contractType: 'bond', reason: 'They respect you enough to travel with you.' };
}

// Compute mercenary hire cost based on profession and relationship.
function _hireCost(npc, rec) {
  const base   = MERCENARY_PROFESSIONS.has(npc.profession || '') ? 50 : 30;
  const relMod = Math.round(-(rec?.relationship || 0) * 5); // friendlier = cheaper
  const cost   = Math.max(5, base + relMod);
  return cost;
}

// Add NPC to party.
function _joinParty(npc, rec, contractType, cost = 0) {
  if (!player.party) player.party = [];
  player.party.push({
    worldId:      rec?.id || null,
    name:         npc.name,
    race:         npc.race  || '?',
    profession:   npc.profession || 'Wanderer',
    contractType,                        // 'mercenary' | 'bond'
    hireCost:     cost,
    joinedAt:     player.currentLocation || null,
  });
  if (rec) bumpImportance(rec.id, 'joined player party', 5);
  if (rec) rec.status = 'in_party';
  addWorldEvent(`${npc.name} joined the party.`, 'npc');
}

// Remove NPC from party by name.
function _leaveParty(name, reason = 'parted ways') {
  if (!player.party) return;
  const idx = player.party.findIndex(m => m.name === name);
  if (idx === -1) return;
  const [member] = player.party.splice(idx, 1);
  const rec = member.worldId ? worldNPCs.registry[member.worldId] : getWorldNPCByName(name);
  if (rec) rec.status = 'active';
  addStory(`${name} has ${reason}.`);
  addWorldEvent(`${name} left the party.`, 'npc');
  updateJournal();
}

// ── Friendship offer dialog ───────────────────────────────────────────────────

async function _doOfferFriendship(npc, rec) {
  _buildWheel([{ label: '⏳ Reaching out…', action: () => {} }]);
  await runInlineProgress('Offering friendship…', 1500);
  const rel = rec?.relationship || 0;
  if (rel >= 4) {
    addStory(`${npc.name} smiles broadly. <em>"Consider it done — you already feel like a true friend."</em>`);
    if (rec) rec.relationship = Math.min(5, (rec.relationship || 0) + 1);
  } else if (rel >= 2) {
    addStory(`${npc.name} nods warmly. <em>"I'd like that. Let's see where the road takes us."</em>`);
    if (rec) rec.relationship = Math.min(5, (rec.relationship || 0) + 1);
    gainSkillXp('Persuasion', 3);
  } else if (rel >= 0) {
    addStory(`${npc.name} hesitates. <em>"We barely know each other. Maybe in time."</em>`);
  } else {
    addStory(`${npc.name} looks at you coldly. <em>"I don't think so."</em>`);
    if (rec) rec.relationship = Math.max(-5, (rec.relationship || 0) - 1);
  }
  updateJournal();
  _showNpcInteraction(npc);
}

// ── Recruit / contract dialog ─────────────────────────────────────────────────

async function _doAskToJoin(npc, rec) {
  const assess = _recruitAssessment(npc, rec);

  if (!assess.possible) {
    _buildWheel([{ label: '⏳ Asking…', action: () => {} }]);
    await runInlineProgress('Asking…', 1200);
    if (assess.contractType === 'none') {
      addStory(`${npc.name} shakes their head. <em>"That's not something I can do — ${assess.reason.toLowerCase()}"</em>`);
    } else {
      addStory(`${npc.name} looks uncertain. <em>"I don't know you well enough for that."</em>`);
      addStory(`<em>(${assess.reason})</em>`);
    }
    _showNpcInteraction(npc);
    return;
  }

  if (assess.contractType === 'mercenary') {
    const cost = _hireCost(npc, rec);
    _buildWheel([
      {
        label:  `Pay ${cost}g`,
        action: async () => {
          if ((player.gold || 0) < cost) {
            addStory(`You don't have enough gold. (Need: ${cost}g)`);
            _showNpcInteraction(npc); return;
          }
          _buildWheel([{ label: '⏳ Sealing deal…', action: () => {} }]);
          await runInlineProgress('Negotiating contract…', 2000);
          player.gold -= cost;
          _joinParty(npc, rec, 'mercenary', cost);
          addStory(`💰 You pay ${cost}g. ${npc.name} grips your forearm. <em>"You've got yourself a sword."</em>`);
          updateTopStats(); updateJournal();
          _showDefaultWheel();
        }
      },
      { label: 'Decline', action: () => { addStory('You decide against it for now.'); _showNpcInteraction(npc); } },
      { label: '← Back',  action: _goBack, isBack: true },
    ], `Hire ${npc.name}? (${cost}g)`);
  } else {
    // bond — already passed the rel check
    _buildWheel([{ label: '⏳ Asking…', action: () => {} }]);
    await runInlineProgress('Asking…', 1800);
    _joinParty(npc, rec, 'bond', 0);
    addStory(`${npc.name} pauses, then breaks into a grin. <em>"Aye — I've nowhere better to be. Lead the way."</em>`);
    updateJournal();
    _showDefaultWheel();
  }
}

// ── Manage party wheel ────────────────────────────────────────────────────────

function _showManagePartyWheel() {
  const party = player.party || [];
  if (!party.length) {
    addStory('You are travelling alone.');
    _goBack(); return;
  }
  const opts = party.map(m => ({
    label:  m.name,
    action: () => _showPartyMemberWheel(m),
  }));
  opts.push({ label: '← Back', action: _goBack, isBack: true });
  _buildWheel(opts, 'Your Party');
}

function _showPartyMemberWheel(member) {
  const rec = member.worldId ? worldNPCs.registry[member.worldId] : getWorldNPCByName(member.name);
  addStory(`<strong>${member.name}</strong> — ${member.race} ${member.profession} (${member.contractType === 'mercenary' ? 'Hired sword' : 'Friend & ally'})`);
  if (rec) addStory(`Relation: <em>${_getRelLabel(rec.relationship || 0)}</em>  ·  Disposition: <em>${_dispositionLabel({ disposition: rec.relationship * 2 })}</em>`);
  _buildWheel([
    { label: 'Talk',        action: () => { _wheelStack.push(() => _showPartyMemberWheel(member)); _showNpcInteraction(rec ? { ...rec, _worldId: rec.id } : { name: member.name, race: member.race, profession: member.profession, interactionCount: 1, disposition: 0, revealedTraits: [] }); } },
    { label: 'Dismiss',     action: () => _dismissPartyMember(member) },
    { label: '← Back',     action: _goBack, isBack: true },
  ], member.name);
}

async function _dismissPartyMember(member) {
  _buildWheel([{ label: '⏳ …', action: () => {} }]);
  await runInlineProgress('Parting ways…', 1500);
  const rec = member.worldId ? worldNPCs.registry[member.worldId] : null;
  if (member.contractType === 'mercenary') {
    const severance = Math.round(member.hireCost * 0.25);
    if (severance > 0 && (player.gold || 0) >= severance) {
      player.gold -= severance;
      addStory(`You pay ${member.name} ${severance}g severance.`);
    }
  }
  if (rec) {
    rec.relationship = Math.max(-5, (rec.relationship || 0) - 1);
    rec.status = 'active';
  }
  _leaveParty(member.name, 'been dismissed');
  updateTopStats();
  _showDefaultWheel();
}

// ── HUD party display (injected into updateTopStats) ─────────────────────────

function _renderPartyHud() {
  const el = document.getElementById('party-hud');
  if (!el) return;
  const party = player.party || [];
  if (!party.length) { el.innerHTML = ''; return; }
  const chips = party.map(m => {
    const badge = m.contractType === 'mercenary' ? '💰' : '🤝';
    const prof  = (m.profession || 'Wanderer').length > 12
                ? (m.profession || 'Wanderer').slice(0, 11) + '…'
                : (m.profession || 'Wanderer');
    return `<span class="party-chip" title="${m.name} · ${m.profession} · ${m.contractType}">
      <span class="party-chip-name">${m.name}</span>
      <span class="party-chip-role">${prof}</span>
      <span class="party-chip-badge">${badge}</span>
    </span>`;
  }).join('');
  el.innerHTML = `<div class="party-chips">⚔️ Party ${chips}</div>`;
}

// ============================================================
// SECTION 10.5 · ECONOMY & SHOP SYSTEM
// ============================================================

// Determine stock list for a given establishment type string
function _getEstablishmentStock(typeStr) {
  if (typeof ESTABLISHMENT_STOCK === 'undefined') return [];
  const key = (typeStr || 'merchant').toLowerCase().replace(/[\s\-]/g, '_');
  // Fuzzy match — try exact, then partial
  if (ESTABLISHMENT_STOCK[key]) return ESTABLISHMENT_STOCK[key];
  for (const k of Object.keys(ESTABLISHMENT_STOCK)) {
    if (key.includes(k) || k.includes(key)) return ESTABLISHMENT_STOCK[k];
  }
  return ESTABLISHMENT_STOCK.merchant;
}

// Deterministic hash of a string — used to seed per-vendor shuffles
function _strSeed(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

// Build a unique but deterministic stock list for a specific vendor.
// core = first 40% of baseStock (always present); variable pool = rest + kingdom extras,
// shuffled by vendor name so every shop carries different items.
function _vendorStock(baseStock, kingdomExtras, vendorName) {
  const coreCount = Math.ceil(baseStock.length * 0.4);
  const core      = baseStock.slice(0, coreCount);
  const variable  = [...baseStock.slice(coreCount), ...kingdomExtras];
  let seed = _strSeed(vendorName || 'default');
  for (let i = variable.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [variable[i], variable[j]] = [variable[j], variable[i]];
  }
  const variableTarget = Math.min(variable.length, baseStock.length - coreCount + Math.ceil(kingdomExtras.length * 0.6));
  return [...core, ...variable.slice(0, variableTarget)];
}

// Build the economy opts object for the current location
function _buildEconOpts(npcTraits = []) {
  const cell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  return {
    kingdom:     cell.kingdom || player.currentKingdom || null,
    npcTraits,
    worldEvents: worldEconomy?.activeEvents || [],
  };
}

// Generate a minimal shopkeeper NPC (traits drive pricing)
function _generateShopkeeper(shopType) {
  const traitPool = ['Generous', 'Greedy', 'Cunning', 'Kind', 'Honorable', 'Ruthless', 'Deceitful'];
  const trait = traitPool[Math.floor(Math.random() * traitPool.length)];
  const profMap = {
    blacksmith: 'Blacksmith', alchemist: 'Alchemist', herbalist: 'Herbalist',
    fletcher: 'Fletcher', tavern: 'Innkeeper', inn: 'Innkeeper', market: 'Merchant',
  };
  const prof = profMap[shopType] || 'Merchant';

  if (typeof NPCGenerator !== 'undefined') {
    const cell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
    try {
      const npc = NPCGenerator.generate({ biome: cell.biome, zone: cell.zone });
      npc.profession = prof;
      if (!npc.traits?.length) npc.traits = [trait];
      return npc;
    } catch { /* fall through */ }
  }
  const races = ['Human', 'Human', 'Human', 'Dwarf', 'Elf', 'Halfling'];
  return {
    name: `The ${prof}`,
    race: races[Math.floor(Math.random() * races.length)],
    profession: prof,
    traits: [trait],
  };
}

// Format an item label for the wheel (truncated name + price)
function _shopLabel(itemName, price) {
  const name = itemName.length > 17 ? itemName.slice(0, 16) + '…' : itemName;
  return `${name} — ${price}g`;
}

// ── Trade Modal ─────────────────────────────────────────────────────────────

let _tradeState = null;

function _openTradeModal(shopName, rawStock, shopkeeper, eOpts, opts) {
  const discount = (opts && opts.discount) || 0;

  // Normalise stock: array entries [name,qty,basePrice] (NPC trade) or plain strings (establishment shops)
  const shopItems = rawStock.map(entry => {
    if (Array.isArray(entry)) {
      const [name, qty, basePrice] = entry;
      return { name, qty, buyPrice: Math.max(1, Math.round(basePrice * (1 - discount))) };
    }
    const data  = typeof getItemData === 'function' ? getItemData(entry) : null;
    const price = typeof calculatePrice === 'function'
      ? calculatePrice(entry, data, Object.assign({}, eOpts, { isBuy: true }))
      : ((data && data.value) || 5);
    return { name: entry, qty: 1, buyPrice: price };
  });

  _tradeState = { shopName, shopItems, shopkeeper, eOpts, selectedSide: null, selectedIndex: null };

  document.getElementById('trade-modal-title').textContent = shopName;
  _tradeRefreshGold();
  _tradeRenderShopGrid();
  _tradeRenderPlayerGrid();
  _tradeClearPreview();
  document.getElementById('trade-modal').style.display = 'flex';
}

function _closeTradeModal() {
  document.getElementById('trade-modal').style.display = 'none';
  _tradeState = null;
  _currentEstab = null; // back to town context (not inside a specific shop)
  _goBack();
}

function _tradeRefreshGold() {
  const el = document.getElementById('trade-modal-gold');
  if (el) el.textContent = player.gold || 0;
}

function _tradeClearPreview() {
  document.getElementById('trade-preview-name').textContent  = '';
  document.getElementById('trade-preview-desc').textContent  = '';
  document.getElementById('trade-preview-stats').textContent = '';
  document.getElementById('trade-preview-price').textContent = 'Select an item';
  const icon = document.getElementById('trade-preview-icon');
  icon.src = ''; icon.style.display = 'none';
  document.getElementById('trade-action-btn').style.display = 'none';
}

function _tradeRenderShopGrid() {
  const grid = document.getElementById('trade-grid-shop');
  if (!grid || !_tradeState) return;
  grid.innerHTML = '';
  _tradeState.shopItems.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'trade-item' + (_tradeState.selectedSide === 'shop' && _tradeState.selectedIndex === i ? ' selected-buy' : '');
    el.innerHTML =
      `<img src="${_getItemIcon(item.name)}" alt="${item.name}" onerror="this.style.display='none'">` +
      `<span class="trade-price-tag">${item.buyPrice}g</span>` +
      (item.qty > 1 ? `<span class="trade-qty">×${item.qty}</span>` : '');
    el.title = `${item.name} — ${item.buyPrice}g${item.qty > 1 ? ' ×' + item.qty : ''}`;
    el.addEventListener('click', () => _tradeSelectShopItem(i));
    grid.appendChild(el);
  });
}

function _tradeRenderPlayerGrid() {
  const grid = document.getElementById('trade-grid-player');
  if (!grid || !_tradeState) return;
  grid.innerHTML = '';
  const _eqSet = new Set(Object.values(player.equipped || {}).filter(Boolean));
  Object.entries(player.inventory || {})
    .filter(([name, v]) => (v && v.quantity > 0) && v.type !== 'quest' && !_eqSet.has(name))
    .forEach(([name, data], i) => {
      const sellPrice = typeof calculatePrice === 'function'
        ? calculatePrice(name, data, Object.assign({}, _tradeState.eOpts, { isBuy: false }))
        : Math.max(1, Math.floor(((data && data.value) || 5) * 0.55));
      const el  = document.createElement('div');
      const qty = data.quantity || 1;
      el.className = 'trade-item' + (_tradeState.selectedSide === 'player' && _tradeState.selectedIndex === i ? ' selected-sell' : '');
      el.innerHTML =
        `<img src="${_getItemIcon(name)}" alt="${name}" onerror="this.style.display='none'">` +
        (qty > 1 ? `<span class="trade-qty">${qty}</span>` : '') +
        `<span class="trade-price-tag">${sellPrice}g</span>`;
      el.title = `${name}${qty > 1 ? ' (' + qty + ')' : ''} — sell: ${sellPrice}g`;
      el.addEventListener('click', () => _tradeSelectPlayerItem(i, name, data, sellPrice));
      grid.appendChild(el);
    });
}

function _tradeSelectShopItem(index) {
  if (!_tradeState) return;
  const item = _tradeState.shopItems[index];
  _tradeState.selectedSide = 'shop'; _tradeState.selectedIndex = index;

  const data      = typeof getItemData === 'function' ? getItemData(item.name) : null;
  const canAfford = (player.gold || 0) >= item.buyPrice;

  const icon = document.getElementById('trade-preview-icon');
  icon.src = _getItemIcon(item.name); icon.style.display = '';
  document.getElementById('trade-preview-name').textContent  = item.name;
  document.getElementById('trade-preview-desc').textContent  = (data && data.description) || '';
  document.getElementById('trade-preview-stats').textContent = _tradeItemStats(data);
  document.getElementById('trade-preview-price').textContent =
    `Buy: ${item.buyPrice}g${item.qty > 1 ? ' (×' + item.qty + ')' : ''}`;

  const btn = document.getElementById('trade-action-btn');
  btn.textContent   = canAfford ? `Buy for ${item.buyPrice}g` : `Need ${item.buyPrice}g`;
  btn.disabled      = !canAfford;
  btn.style.display = '';
  btn.onclick = () => _tradeExecuteBuy(index);

  _tradeRenderShopGrid(); _tradeRenderPlayerGrid();
}

function _tradeSelectPlayerItem(index, name, data, sellPrice) {
  if (!_tradeState) return;
  _tradeState.selectedSide = 'player'; _tradeState.selectedIndex = index;

  const dbData = typeof getItemData === 'function' ? getItemData(name) : null;
  const d      = dbData || data;

  const icon = document.getElementById('trade-preview-icon');
  icon.src = _getItemIcon(name); icon.style.display = '';
  document.getElementById('trade-preview-name').textContent  = name;
  document.getElementById('trade-preview-desc').textContent  = (d && d.description) || '';
  document.getElementById('trade-preview-stats').textContent = _tradeItemStats(d);
  document.getElementById('trade-preview-price').textContent = `Sell: ${sellPrice}g`;

  const btn = document.getElementById('trade-action-btn');
  btn.textContent   = `Sell for ${sellPrice}g`;
  btn.disabled      = false;
  btn.style.display = '';
  btn.onclick = () => _tradeExecuteSell(name, sellPrice);

  _tradeRenderShopGrid(); _tradeRenderPlayerGrid();
}

function _tradeItemStats(d) {
  if (!d) return '';
  const p = [];
  if (d.baseEffect) {
    if (d.baseEffect.defense) p.push(`Defense +${d.baseEffect.defense}`);
    if (d.baseEffect.damage)  p.push(`Damage +${d.baseEffect.damage}`);
    if (d.baseEffect.life)    p.push(`Life +${d.baseEffect.life}`);
    if (d.baseEffect.stamina) p.push(`Stamina +${d.baseEffect.stamina}`);
    if (d.baseEffect.mana)    p.push(`Mana +${d.baseEffect.mana}`);
  }
  if (d.rarity) p.push(d.rarity);
  if (d.weight) p.push(`${d.weight} kg`);
  return p.join(' · ');
}

function _tradeExecuteBuy(index) {
  if (!_tradeState) return;
  const item = _tradeState.shopItems[index];
  if ((player.gold || 0) < item.buyPrice) {
    document.getElementById('trade-preview-price').textContent = `Not enough gold! (have ${player.gold}g)`;
    return;
  }
  player.gold -= item.buyPrice;
  if (!player.traitCounters) player.traitCounters = {};
  player.traitCounters.goldSpent = (player.traitCounters.goldSpent || 0) + item.buyPrice;

  const data  = typeof getItemData === 'function' ? getItemData(item.name) : null;
  const iOpts = data
    ? { type: data.type, rarity: data.rarity, consumable: data.consumable,
        wearable: data.wearable, condition: data.condition, weight: data.weight, description: data.description }
    : {};
  addItem(item.name, item.qty || 1, iOpts);
  addStory(`🛒 Bought ${item.qty > 1 ? item.qty + '× ' : ''}${item.name} for ${item.buyPrice}g.`);
  if (typeof awardProfessionXp   === 'function') awardProfessionXp('trade');
  if (typeof checkQuestObjectives === 'function') checkQuestObjectives('item_bought', { item: item.name });
  if (typeof updateTopStats       === 'function') updateTopStats();

  _tradeState.selectedSide = null; _tradeState.selectedIndex = null;
  _tradeRefreshGold(); _tradeRenderShopGrid(); _tradeRenderPlayerGrid(); _tradeClearPreview();
}

function _tradeExecuteSell(itemName, price) {
  if (!_tradeState) return;
  removeItem(itemName, 1);
  player.gold = (player.gold || 0) + price;
  addStory(`💰 Sold ${itemName} for ${price}g.`);
  if (typeof updateTopStats === 'function') updateTopStats();

  _tradeState.selectedSide = null; _tradeState.selectedIndex = null;
  _tradeRefreshGold(); _tradeRenderShopGrid(); _tradeRenderPlayerGrid(); _tradeClearPreview();
}

// Wires close button + backdrop click; called from game init
function _initTradeModal() {
  const btn   = document.getElementById('trade-modal-close-btn');
  const modal = document.getElementById('trade-modal');
  if (btn)   btn.addEventListener('click', _closeTradeModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) _closeTradeModal(); });
}

// ── Main shop menu ──────────────────────────────────────────────────────────

function _shopMenu(shopName, stock, shopkeeper, eOpts) {
  _openTradeModal(shopName, stock, shopkeeper, eOpts, {});
}

// ── Buy wheel (paginated) ──────────────────────────────────────────────────

function _shopBuyWheel(stock, eOpts, page) {
  const PAGE = 5;
  const start = page * PAGE;
  const slice = stock.slice(start, start + PAGE);
  const hasMore = stock.length > start + PAGE;

  if (!slice.length) {
    addStory('🛒 Nothing more for sale here.');
    _goBack(); return;
  }

  const opts = slice.map(itemName => {
    const data  = (typeof getItemData !== 'undefined') ? getItemData(itemName) : null;
    const price = (typeof calculatePrice !== 'undefined')
      ? calculatePrice(itemName, data, { ...eOpts, isBuy: true })
      : (data?.value || 5);
    const canAfford = (player.gold || 0) >= price;
    return {
      label:    _shopLabel(itemName, price),
      disabled: !canAfford,
      action:   () => { _doShopBuy(itemName, price, data, stock, eOpts, page); },
    };
  });

  if (hasMore) opts.push({ label: 'More →', action: () => _shopBuyWheel(stock, eOpts, page + 1) });
  if (page > 0) opts.push({ label: '← Prev', action: () => _shopBuyWheel(stock, eOpts, page - 1) });
  opts.push({ label: '← Back', action: _goBack, isBack: true });

  _buildWheel(opts.slice(0, 8), `Buy (${player.gold}g)`);
}

function _doShopBuy(itemName, price, itemData, stock, eOpts, page) {
  if ((player.gold || 0) < price) {
    addStory(`⛔ Not enough gold. (need ${price}g, have ${player.gold}g)`); return;
  }
  player.gold -= price;
  if (!player.traitCounters) player.traitCounters = {};
  player.traitCounters.goldSpent = (player.traitCounters.goldSpent || 0) + price;
  const opts = itemData
    ? { type: itemData.type, rarity: itemData.rarity, consumable: itemData.consumable,
        wearable: itemData.wearable, condition: itemData.condition,
        weight: itemData.weight, description: itemData.description }
    : {};
  addItem(itemName, 1, opts);
  addStory(`🛒 Bought ${itemName} for ${price}g. (${player.gold}g remaining)`);
  updateTopStats();
  _shopBuyWheel(stock, eOpts, page);
}

// ── Sell wheel (paginated) ─────────────────────────────────────────────────

function _shopSellWheel(eOpts, page) {
  const _equippedItems = new Set(Object.values(player.equipped || {}).filter(Boolean));
  const sellable = Object.entries(player.inventory || {})
    .filter(([name, v]) => (v?.quantity ?? 0) > 0 && v?.type !== 'quest' && v?.type !== 'map' && !_equippedItems.has(name))
    .map(([name, data]) => ({
      name,
      price: (typeof calculatePrice !== 'undefined')
        ? calculatePrice(name, data, { ...eOpts, isBuy: false })
        : Math.max(1, Math.floor((data?.value || 5) * 0.55)),
    }));

  if (!sellable.length) { addStory('🎒 You have nothing to sell.'); _goBack(); return; }

  const PAGE = 5;
  const start = page * PAGE;
  const slice = sellable.slice(start, start + PAGE);
  const hasMore = sellable.length > start + PAGE;

  const opts = slice.map(({ name, price }) => ({
    label:  _shopLabel(name, price),
    action: () => { _doShopSell(name, price, eOpts, page); },
  }));

  if (hasMore) opts.push({ label: 'More →', action: () => _shopSellWheel(eOpts, page + 1) });
  if (page > 0) opts.push({ label: '← Prev', action: () => _shopSellWheel(eOpts, page - 1) });
  opts.push({ label: '← Back', action: _goBack, isBack: true });

  _buildWheel(opts.slice(0, 8), `Sell (${player.gold}g)`);
}

function _doShopSell(itemName, price, eOpts, page) {
  removeItem(itemName, 1);
  player.gold = (player.gold || 0) + price;
  addStory(`💰 Sold ${itemName} for ${price}g. (${player.gold}g total)`);
  updateTopStats();
  _shopSellWheel(eOpts, page);
}

// ── Barter system (travelling merchants only) ─────────────────────────────

// Step 1: player picks an item from their inventory to offer
function _barterSelectPlayerItem(stock, merchant, eOpts, page) {
  const PAGE = 5;
  const items = Object.entries(player.inventory || {})
    .filter(([, v]) => (v.quantity ?? 0) > 0 && v.type !== 'quest')
    .map(([name, v]) => {
      const data  = (typeof getItemData !== 'undefined') ? getItemData(name) : null;
      const price = (typeof calculatePrice !== 'undefined')
        ? calculatePrice(name, data, { ...eOpts, isBuy: false })
        : (data?.value || v.value || 5);
      return { name, price };
    })
    .sort((a, b) => b.price - a.price);

  const start = page * PAGE;
  const slice = items.slice(start, start + PAGE);
  const hasMore = items.length > start + PAGE;

  if (!slice.length) {
    addStory('🔄 Nothing in your pack worth trading.');
    _goBack(); return;
  }

  const opts = slice.map(({ name, price }) => ({
    label: `${name.length > 15 ? name.slice(0, 14) + '…' : name} (~${price}g)`,
    action: () => _barterSelectMerchantItem(name, price, stock, merchant, eOpts),
  }));

  if (hasMore) opts.push({ label: 'More →', action: () => _barterSelectPlayerItem(stock, merchant, eOpts, page + 1) });
  if (page > 0) opts.push({ label: '← Prev', action: () => _barterSelectPlayerItem(stock, merchant, eOpts, page - 1) });
  opts.push({ label: '← Back', action: _goBack, isBack: true });
  _buildWheel(opts.slice(0, 8), 'Offer Item');
}

// Step 2: player picks a merchant item to receive in exchange
function _barterSelectMerchantItem(offerName, offerValue, stock, merchant, eOpts, page = 0) {
  const PAGE = 5;
  const start = page * PAGE;
  const slice = stock.slice(start, start + PAGE);
  const hasMore = stock.length > start + PAGE;

  if (!slice.length) { addStory('🔄 Nothing to trade for here.'); _goBack(); return; }

  const opts = slice.map(itemName => {
    const data  = (typeof getItemData !== 'undefined') ? getItemData(itemName) : null;
    const price = (typeof calculatePrice !== 'undefined')
      ? calculatePrice(itemName, data, { ...eOpts, isBuy: true })
      : (data?.value || 5);
    const fair  = offerValue >= price;
    return {
      label:    `${itemName.length > 14 ? itemName.slice(0, 13) + '…' : itemName} (${price}g)${fair ? '' : ' ↑'}`,
      action:   () => _doBarterTrade(offerName, offerValue, itemName, price, stock, merchant, eOpts),
    };
  });

  if (hasMore) opts.push({ label: 'More →', action: () => _barterSelectMerchantItem(offerName, offerValue, stock, merchant, eOpts, page + 1) });
  if (page > 0) opts.push({ label: '← Prev', action: () => _barterSelectMerchantItem(offerName, offerValue, stock, merchant, eOpts, page - 1) });
  opts.push({ label: '← Back', action: _goBack, isBack: true });
  _buildWheel(opts.slice(0, 8), `Trading ${offerName.length > 12 ? offerName.slice(0, 11) + '…' : offerName}`);
}

// Step 3: resolve the trade with a Negotiating check when values don't match
async function _doBarterTrade(offerName, offerValue, wantName, wantPrice, stock, merchant, eOpts) {
  _buildWheel([{ label: '🔄 Negotiating…', action: () => {} }]);

  const deficit = wantPrice - offerValue;
  if (deficit <= 0) {
    // Fair or over-valued trade — merchant accepts without a roll
    removeItem(offerName, 1);
    const data = (typeof getItemData !== 'undefined') ? getItemData(wantName) : null;
    addItem(wantName, 1, data ? { type: data.type, rarity: data.rarity, weight: data.weight } : {});
    const surplus = -deficit;
    if (surplus > 0) {
      player.gold += surplus;
      updateTopStats();
      addStory(`🔄 Trade complete. ${merchant.name} throws in ${surplus}g change.`);
    } else {
      addStory(`🔄 Trade complete. ${merchant.name} nods — a fair deal.`);
    }
    gainSkillXp('Negotiating', 3);
    _goBack();
    return;
  }

  // Under-valued — needs a Negotiating check
  await runInlineProgress('Making your case…', 1500);
  const tier = performSkillCheck('Negotiating');

  if (tier >= 4) {
    removeItem(offerName, 1);
    const data = (typeof getItemData !== 'undefined') ? getItemData(wantName) : null;
    addItem(wantName, 1, data ? { type: data.type, rarity: data.rarity, weight: data.weight } : {});
    addStory(`🔄 ${merchant.name} strokes their chin and agrees. Trade complete.`);
  } else if (tier === 3) {
    const shortfall = Math.ceil(deficit * 0.5);
    if (player.gold >= shortfall) {
      player.gold -= shortfall;
      removeItem(offerName, 1);
      const data = (typeof getItemData !== 'undefined') ? getItemData(wantName) : null;
      addItem(wantName, 1, data ? { type: data.type, rarity: data.rarity, weight: data.weight } : {});
      updateTopStats();
      addStory(`🔄 ${merchant.name} meets you halfway — you pay the difference of ${shortfall}g. Trade complete.`);
    } else {
      addStory(`🔄 ${merchant.name} would split the difference (${shortfall}g), but you don't have enough gold.`);
    }
  } else {
    addStory(`🔄 ${merchant.name} shakes their head. "Your ${offerName} isn't worth enough for that."`);
  }
  _goBack();
}

// ── Open establishment (from town wheel) ──────────────────────────────────

function _showShopsWheel() {
  const cell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const establishments = (cell.establishments || []).filter(e => {
    const t = (e.type || '').toLowerCase();
    return !t.includes('quest') && !t.includes('dungeon');
  });

  const port = PORTS[player.currentLocation];

  if (!establishments.length && !port) {
    addStory('🏪 No shops or services in this settlement.');
    _goBack(); return;
  }

  const portOpt = port ? [{
    label:  `⛵ ${port.name.length > 20 ? port.name.slice(0, 19) + '…' : port.name}`,
    action: () => { _wheelStack.push(_showShopsWheel); _openPort(port); },
  }] : [];

  const isNight = player.timeOfDay === '🌑 Night';
  _buildWheel([
    ...portOpt,
    ...establishments.slice(0, port ? 5 : 6).map(est => ({
      label:    est.name.length > 22 ? est.name.slice(0, 20) + '…' : est.name,
      action:   () => { _wheelStack.push(_showShopsWheel); _openEstablishment(est); },
      disabled: isNight && !_estOpenAtNight(est),
    })),
    { label: '← Back', action: _goBack, isBack: true },
  ], 'Shops & Services');
}

// ============================================================
// SECTION 10.6 · PORT & SEA TRAVEL SYSTEM
// ============================================================

const PORTS = {
  // Ardrenhold
  'x275_y425':  { name: 'Ealdenford Harbour',      kingdom: 'Ardrenhold', settlement: 'Ealdenford'      },
  // Brythwen
  'x750_y550':  { name: 'Windhall Docks',           kingdom: 'Brythwen',   settlement: 'Windhall'        },
  // Dwynbroch
  'x125_y50':   { name: 'Morvarth Harbour',         kingdom: 'Dwynbroch',  settlement: 'Morvarth'        },
  // Naradreth
  'x975_y175':  { name: 'Ilryndor Port',             kingdom: 'Naradreth',  settlement: 'Ilryndor'        },
  'x925_y125':  { name: "Mythren's Gate Pier",       kingdom: 'Naradreth',  settlement: "Mythren's Gate"  },
  'x1000_y75':  { name: "Tiryll's Wharf",            kingdom: 'Naradreth',  settlement: "Tiryll's Hollow" },
  'x1025_y150': { name: 'Vaerlyn Reach Docks',      kingdom: 'Naradreth',  settlement: 'Vaerlyn Reach'   },
  // Nithrond
  'x825_y225':  { name: 'Thrandelmere Harbour',     kingdom: 'Nithrond',   settlement: 'Thrandelmere'    },
  // Feldarún — new coastal city
  'x775_y425':  { name: 'Grothmar Docks',           kingdom: 'Feldarún',   settlement: 'Grothmar'        },
  // Sivanrift — new coastal city
  'x300_y350':  { name: 'Aurelwyn Bay',              kingdom: 'Sivanrift',  settlement: 'Aurelwyn'        },
  // Orindroth — new coastal city
  'x400_y175':  { name: 'Vaerwynn Cove',             kingdom: 'Orindroth',  settlement: 'Vaerwynn'        },
  // Rendarost
  'x600_y100':  { name: 'Frostmere Harbour',        kingdom: 'Rendarost',  settlement: 'Frostmere Hold'  },
  'x625_y25':   { name: 'Iskroldir Port',            kingdom: 'Rendarost',  settlement: 'Iskroldir'       },
  // Wistravael
  'x450_y0':    { name: "Bramgar's Rest Pier",      kingdom: 'Wistravael', settlement: "Bramgar's Rest"  },
};

const SHIP_TYPES = {
  Sloop:      { cost: 500,  speed: 8, wearPerLeague: 1.5, description: 'Small and fast. Good for short coastal runs and quick escapes.' },
  Brigantine: { cost: 1200, speed: 5, wearPerLeague: 1.0, description: 'A reliable two-masted vessel. The workhorse of coastal trade.' },
  Galleon:    { cost: 3000, speed: 3, wearPerLeague: 0.7, description: 'Massive and imposing. Slow, but built to weather any storm.' },
};

// Parse a coord key → { x, y }
function _parseCoord(key) {
  const m = (key || '').match(/^x(\d+)_y(\d+)$/);
  return m ? { x: +m[1], y: +m[2] } : { x: 0, y: 0 };
}

// Grid distance between two coord keys (in cells)
function _portDistance(keyA, keyB) {
  const a = _parseCoord(keyA);
  const b = _parseCoord(keyB);
  return Math.round(Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) / 25);
}

// Passage cost without a ship: 2g per cell, min 20g
function _passageCost(fromKey, toKey) {
  return Math.max(20, _portDistance(fromKey, toKey) * 2);
}

// ── Main port menu ──────────────────────────────────────────

function _openPort(port) {
  const ship = player.ship;
  const shipLabel = ship
    ? `⚓ ${ship.name} (${Math.round(ship.wear)}%)`
    : '🚢 Buy a Ship';
  addStory(`⚓ The ${port.name} stretches before you — salt air, creaking rope, and the cry of gulls.`);
  if (ship && ship.homePort !== player.currentLocation) {
    addStory(`Your ${ship.name} is moored at ${PORTS[ship.homePort]?.name || ship.homePort}.`);
  }

  _buildWheel([
    { label: '⛵ Book Passage',  action: () => { _wheelStack.push(() => _openPort(port)); _portPassageWheel(port); } },
    { label: shipLabel,           action: () => { _wheelStack.push(() => _openPort(port)); _portShipMenu(port);     } },
    { label: '💼 Find Work',      action: () => { _wheelStack.push(() => _openPort(port)); _portWorkWheel(port);    } },
    { label: '🛒 Naval Supplies', action: () => {
      _wheelStack.push(() => _openPort(port));
      const stock   = ['Rope', 'Lantern', 'Rations', 'Waterskin', 'Bandage', 'Compass', 'Fishing Pole', 'Net', 'Anchor Chain', 'Sailcloth'];
      const sk      = _generateShopkeeper('merchant');
      const eOpts   = _buildEconOpts(sk.traits || []);
      _shopMenu(port.name, stock, sk, eOpts);
    }},
    { label: '← Back', action: _goBack, isBack: true },
  ], port.name);
}

// ── Book Passage ────────────────────────────────────────────

function _portPassageWheel(port) {
  const fromKey  = player.currentLocation;
  const ship     = player.ship;
  const hasShip  = ship && ship.wear > 0;
  const otherPorts = Object.entries(PORTS).filter(([k]) => k !== fromKey);

  if (!otherPorts.length) { addStory('⛵ No other ports are known.'); _goBack(); return; }

  addStory(hasShip
    ? `⛵ Sailing in your own ${ship.name}. Each voyage wears the hull slightly.`
    : `⛵ Pay for passage aboard a hired vessel.`);

  const opts = otherPorts.slice(0, 6).map(([key, dest]) => {
    const dist = _portDistance(fromKey, key);
    const cost = hasShip ? 0 : _passageCost(fromKey, key);
    const label = `${dest.settlement} (${dist} leagues${cost > 0 ? `, ${cost}g` : ', own ship'})`;
    return {
      label,
      action: () => _doBookPassage(fromKey, key, dest, dist, cost, hasShip),
    };
  });

  opts.push({ label: '← Back', action: _goBack, isBack: true });
  _buildWheel(opts, 'Book Passage');
}

async function _doBookPassage(fromKey, destKey, dest, dist, cost, hasShip) {
  if (!hasShip && player.gold < cost) {
    addStory(`⛵ You need ${cost} gold for passage to ${dest.settlement}. You have ${player.gold}g.`);
    return;
  }

  _buildWheel([{ label: '⛵ Setting sail…', action: () => {} }]);

  if (!hasShip) {
    player.gold -= cost;
    updateTopStats();
    addStory(`⛵ You pay ${cost}g for passage to ${dest.settlement}.`);
  } else {
    addStory(`⚓ You cast off from ${PORTS[fromKey]?.name || fromKey} and set sail.`);
    // Ship degrades based on distance
    const wearAmt = Math.round(dist * SHIP_TYPES[player.ship.type]?.wearPerLeague ?? 1);
    const prevCond = getConditionFromWear(player.ship.wear);
    player.ship.wear = Math.max(0, player.ship.wear - wearAmt);
    const newCond = getConditionFromWear(player.ship.wear);
    if (newCond !== prevCond) addStory(`⚙️ Your ${player.ship.name} is now in ${newCond} condition (${Math.round(player.ship.wear)}%).`);
  }

  // Sea voyage progress bar — time advances based on distance
  const voyageSec = Math.max(3000, dist * 400);
  await runInlineProgress(`Sailing to ${dest.settlement}…`, voyageSec / 2);
  addStory(`🌊 The coast recedes behind you. Waves roll beneath the hull.`);
  await runInlineProgress('Approaching port…', voyageSec / 2);

  // Sea voyages: proportionally scaled to 12-period day
  advanceTime(Math.max(2, Math.round(dist * 3 / 8)));

  // Arrive — skip departure narrative since we handled it above
  const destCoord = _parseCoord(destKey);
  await executeTravelTo(destKey, destCoord.x, destCoord.y, 0, 0, { skipDeparture: true });
}

// ── Ship purchase & maintenance ─────────────────────────────

function _portShipMenu(port) {
  const ship = player.ship;

  if (ship) {
    const wear     = Math.round(ship.wear);
    const cond     = getConditionFromWear(ship.wear);
    const repairCost = Math.max(5, Math.ceil((100 - ship.wear) * 6));
    addStory(`⚓ ${ship.name} — ${ship.type} · ${cond} (${wear}%) · Moored at ${PORTS[ship.homePort]?.name || ship.homePort}.`);

    _buildWheel([
      {
        label:    wear < 100 ? `🔧 Repair (${repairCost}g)` : '✅ Hull in good shape',
        disabled: wear >= 100,
        action:   () => {
          if (player.gold < repairCost) {
            addStory(`🔧 Repairs cost ${repairCost}g. You have ${player.gold}g.`);
            return;
          }
          player.gold -= repairCost;
          player.ship.wear = 100;
          player.ship.homePort = player.currentLocation;
          updateTopStats();
          addStory(`🔧 The shipwrights patch and caulk the hull. ${ship.name} is seaworthy again.`);
          _portShipMenu(port);
        },
      },
      {
        label:  '🔁 Rename Ship',
        action: () => {
          addStory('📝 Open the text box and type a new name for your ship.');
          document.getElementById('user-input')?.focus();
          const once = (e) => {
            if (e.key === 'Enter') {
              const val = document.getElementById('user-input')?.value?.trim();
              if (val) { player.ship.name = val; addStory(`⚓ Your ship is now known as ${val}.`); }
              document.removeEventListener('keydown', once);
            }
          };
          document.addEventListener('keydown', once);
        },
      },
      {
        label:  '💸 Sell Ship',
        action: () => {
          const salePrice = Math.round(SHIP_TYPES[ship.type].cost * (ship.wear / 100) * 0.6);
          player.gold += salePrice;
          updateTopStats();
          addStory(`💸 You sell the ${ship.name} for ${salePrice}g.`);
          player.ship = null;
          _portShipMenu(port);
        },
      },
      { label: '← Back', action: _goBack, isBack: true },
    ], `${ship.name}`);
    return;
  }

  // No ship — buy one
  addStory(`🚢 The shipwright wipes their hands. "Looking to own your own vessel?"`);
  _buildWheel([
    ...Object.entries(SHIP_TYPES).map(([type, data]) => ({
      label:  `${type} — ${data.cost}g`,
      disabled: player.gold < data.cost,
      action: () => {
        player.gold -= data.cost;
        player.ship = { name: `The ${type}`, type, wear: 100, homePort: player.currentLocation };
        updateTopStats();
        addStory(`🚢 You purchase a ${type}. ${data.description}`);
        addStory(`⚓ She's yours — christened "${player.ship.name}" and moored here at ${port.name}.`);
        _portShipMenu(port);
      },
    })),
    { label: '← Back', action: _goBack, isBack: true },
  ], 'Buy a Ship');
}

// ── Find Work ───────────────────────────────────────────────

async function _portWorkWheel(port) {
  const JOBS = [
    { label: '🎣 Fishing Run',     skill: 'Fishing',     pay: [8, 30],  desc: 'Join a fishing crew for the morning catch.' },
    { label: '📦 Cargo Loading',   skill: 'Survival',    pay: [6, 20],  desc: 'Haul crates and barrels on and off ships.' },
    { label: '🗺️ Navigation Aid',  skill: 'Navigation',  pay: [15, 50], desc: 'Help chart a route for an outgoing captain.' },
    { label: '🤝 Trade Broker',    skill: 'Negotiating', pay: [12, 40], desc: 'Negotiate a cargo deal between merchants.' },
    { label: '🔧 Hull Caulking',   skill: 'Crafting',    pay: [8, 25],  desc: 'Seal leaks in dry-docked hulls.' },
  ];

  _buildWheel([
    ...JOBS.slice(0, 5).map(job => ({
      label:  job.label,
      action: async () => {
        _buildWheel([{ label: '⏳ Working…', action: () => {} }]);
        addStory(`💼 ${job.desc}`);
        await runInlineProgress(job.label, 3000);
        const tier = performSkillCheck(job.skill);
        const pay  = Math.round(job.pay[0] + (job.pay[1] - job.pay[0]) * ((tier - 1) / 4));
        player.gold += pay;
        updateTopStats();
        awardProfessionXp('port_work');
        const results = ['Poor showing — they barely cover your time', 'Decent enough work', 'Solid effort', 'Well done — they tip you extra', 'Outstanding — the captain asks your name'];
        addStory(`💼 ${results[tier - 1]}. You earn ${pay} gold.`);
        updateTimeOfDay();
        _goBack();
      },
    })),
    { label: '← Back', action: _goBack, isBack: true },
  ], `Work — ${port.settlement}`);
}

function _applyStockScarcity(stock, events) {
  if (!events.length) return stock;
  return stock.filter(itemName => {
    const dbItem = typeof findItemInDatabase === 'function' ? findItemInDatabase(itemName) : null;
    const cat = typeof getItemEconCategory === 'function'
      ? getItemEconCategory(itemName, dbItem?.type || 'misc')
      : 'misc';
    for (const ev of events) {
      const rules = WORLD_EVENT_EFFECTS[ev.type]?.scarcity;
      if (!rules) continue;
      const chance = rules[cat] !== undefined ? rules[cat] : (rules.all !== undefined ? rules.all : 1.0);
      if (chance < 1.0 && Math.random() > chance) return false;
    }
    return true;
  });
}

function _estOpenAtNight(est) {
  return /tavern|inn/i.test(est.type || est.name || '');
}

function _exitEstab() {
  _currentEstab = null;
  player.currentAction = 'Idle';
  updateTopStats();
  _wheelStack = [_showActionsWheel];
  _showTownWheel();
}

function _openEstablishment(est) {
  if (isNightTime() && !_estOpenAtNight(est)) {
    addStory(`🌑 ${est.name} is dark and shuttered — try again at dawn.`);
    _goBack(); return;
  }

  _currentEstab = est;
  _townEngaged  = true;
  player.currentAction = `At ${est.name}`;
  updateTopStats();

  const isTavern    = /tavern|inn/i.test(est.type || est.name || '');
  const isSmith     = /blacksmith|armorer|armourer|forge/i.test(est.type || est.name || '');

  if (isSmith) {
    addStory(`🔨 The clang of hammer on anvil fills the air as you enter ${est.name}.`);
    const shopkeeper = _generateShopkeeper('blacksmith');
    addStory(`${shopkeeper.name}, a ${shopkeeper.race} smith, wipes their hands and looks up.`);

    function _smithRepairMenu() {
      const repairableItems = Object.entries(player.equipped || {})
        .filter(([, name]) => {
          if (!name || !player.inventory?.[name]) return false;
          const wear = getItemWear(name);
          return wear < 100;
        })
        .map(([, name]) => {
          const wear = getItemWear(name);
          const cond = getConditionFromWear(wear);
          const cost = Math.max(5, Math.ceil((100 - wear) * 0.4));
          return { name, wear, cond, cost };
        });

      if (!repairableItems.length) {
        addStory('🔧 Your equipped gear is at full condition — no repairs needed.');
      }

      const repairOpts = repairableItems.slice(0, 5).map(({ name, wear, cond, cost }) => ({
        label: `${name.length > 13 ? name.slice(0, 12) + '…' : name} ${wear}% (${cost}g)`,
        action: () => {
          if (player.gold < cost) {
            addStory(`💰 You need ${cost} gold to repair the ${name}. You only have ${player.gold}.`);
            return;
          }
          player.gold -= cost;
          player.inventory[name].wear = 100;
          delete player.inventory[name].condition;
          addStory(`🔧 The smith restores the ${name} to 100% — Excellent condition. (−${cost}g)`);
          updateTopStats();
          updateInventory();
          _smithRepairMenu();
        },
      }));

      _buildWheel([
        ...repairOpts,
        { label: 'Browse Wares', action: () => {
          _wheelStack.push(_smithRepairMenu);
          const eOpts = _buildEconOpts(shopkeeper.traits || []);
          const stock = _vendorStock(_getEstablishmentStock('blacksmith'), [], est.name);
          _shopMenu(est.name, stock, shopkeeper, eOpts);
        }},
        { label: `🚪 Leave`, action: _exitEstab, isBack: true },
      ], `${est.name}`);
    }

    _smithRepairMenu();
    return;
  }

  if (isTavern) {
    addStory(`🍺 You push through the door of ${est.name}. The low murmur of conversation fills the smoky air.`);
    const _tavernCell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
    const _roomCost   = /city/i.test(_tavernCell.zone || '') ? 10 : 5;
    function _estTavernMenu() {
      player.currentAction = `At ${est.name}`;
      updateTopStats();
      const _hasRoom = player.hasRentedRoom;
      _buildWheel([
        { label: '🍺 Order',           action: () => { _wheelStack.push(_estTavernMenu); _estBarMenu(); } },
        { label: '💬 Talk to Someone', action: () => { _wheelStack.push(_estTavernMenu); _tavernTalkToStranger(); } },
        { label: '🎲 Entertainment',   action: () => { _wheelStack.push(_estTavernMenu); _estEntertainMenu(); } },
        { label: _hasRoom ? '🛏️ Lodging ✓' : '🛏️ Lodging',
          action: () => { _wheelStack.push(_estTavernMenu); _estLodgingMenu(); } },
        { label: '🚪 Leave', action: _exitEstab, isBack: true },
      ], est.name);
    }
    function _estBarMenu() {
      _buildWheel([
        { label: '🍺 Order a Drink', action: () => { _wheelStack.push(_estBarMenu); _tavernOrderDrink(); } },
        { label: '🍽️ Order Food',    action: () => { _wheelStack.push(_estBarMenu); _tavernOrderFood(); } },
        { label: '🍲 Ask the Cook',  action: () => { _wheelStack.push(_estBarMenu); _tavernAskCook(); } },
        { label: '← Back',          action: _goBack, isBack: true },
      ], 'The Bar');
    }
    function _estEntertainMenu() {
      _buildWheel([
        { label: '📰 Rumors',        action: () => { _wheelStack.push(_estEntertainMenu); _tavernRumors(); } },
        { label: '🎵 Listen to Bard',action: () => { _wheelStack.push(_estEntertainMenu); _listenToBard(); } },
        { label: '🦾 Arm Wrestle',   action: () => { _wheelStack.push(_estEntertainMenu); _tavernArmWrestle(); } },
        { label: '🎲 Dice Game',     action: () => { _wheelStack.push(_estEntertainMenu); _tavernDiceGame(); } },
        { label: '← Back',          action: _goBack, isBack: true },
      ], 'Entertainment');
    }
    function _estLodgingMenu() {
      const _canRent  = !player.hasRentedRoom && !isNightTime();
      const _hasToken = (player.inventory?.['Inn Token']?.quantity || 0) > 0 && !player.hasRentedRoom;
      _buildWheel([
        { label: `🛏️ Rent a Room (${_roomCost}g)`, action: () => { _wheelStack.push(_estLodgingMenu); _tavernRentRoom(_roomCost); }, disabled: !_canRent },
        ...(_hasToken       ? [{ label: '🎟️ Inn Token (Free)', action: () => { _wheelStack.push(_estLodgingMenu); _tavernUseInnToken(); } }] : []),
        ...(player.hasRentedRoom ? [{ label: '🛏️ Sleep in Your Room', action: () => { _wheelStack.push(_estLodgingMenu); _tavernSleepInRoom(); } }] : []),
        { label: '← Back', action: _goBack, isBack: true },
      ], 'Lodging');
    }
    _estTavernMenu();
    return;
  }

  const isArena      = /arena|fighting pit|pit|gladiator/i.test(est.type || est.name || '');
  const isStables    = /stable|racetrack|race track|hippodrome/i.test(est.type || est.name || '');
  const isGambling   = /gambling den|game house|gaming house|den of chance/i.test(est.type || est.name || '');
  const isBathhouse  = /bathhouse|bath house|baths|steam house/i.test(est.type || est.name || '');

  if (isArena)     { _enterArena(est);     return; }
  if (isStables)   { _enterStables(est);   return; }
  if (isGambling)  { _enterGamblingDen(est); return; }
  if (isBathhouse) { _enterBathhouse(est); return; }

  const isLibraryType    = /library|bookshop|book shop|archive|scriptorium/i.test(est.type || est.name || '');
  const isLoremasterType = /loremaster|lore master/i.test(est.type || est.name || '');

  if (isLibraryType || isLoremasterType) {
    const typeKey    = (est.type || 'merchant').toLowerCase().replace(/[\s\-]/g, '_');
    const shopkeeper = _generateShopkeeper(typeKey);
    const eOpts      = _buildEconOpts(shopkeeper.traits || []);
    const kingdom    = eOpts.kingdom || player.currentKingdom || '';
    const baseStock  = _getEstablishmentStock(typeKey);
    const extras     = (typeof KINGDOM_VENDOR_ADDITIONS !== 'undefined' && KINGDOM_VENDOR_ADDITIONS[kingdom]?.[typeKey]) || [];
    let   stock      = _vendorStock(baseStock, extras, est.name || typeKey);
    const rName      = _pickUnknownRecipe();
    if (rName) stock.push(`Recipe: ${rName}`);
    const active      = (worldEconomy?.activeEvents || []).filter(e => !e.kingdom || e.kingdom === kingdom);
    const scarceStock = _applyStockScarcity(stock, active);
    const stockToUse  = scarceStock.length > 0 ? scarceStock : stock.slice(0, Math.max(1, Math.floor(stock.length * 0.3)));
    const studyLabel  = isLoremasterType ? '📜 Consult Loremaster' : '📖 Study Texts';
    const studySource = isLoremasterType ? 'loremaster' : 'library';

    if (isLoremasterType) {
      addStory(`📜 You enter ${est.name}. A learned ${shopkeeper.race} looks up, their eyes sharp with knowledge.`);
    } else {
      addStory(`📖 You step into ${est.name}. Rows of shelves stretch into the dim light, heavy with tomes and scrolls.`);
    }
    if (shopkeeper.traits?.[0]) addStory(`They seem ${shopkeeper.traits[0].toLowerCase()}.`);

    function _loreMenu() {
      _buildWheel([
        {
          label:  studyLabel,
          action: async () => {
            _wheelStack.push(_loreMenu);
            await runInlineProgress(isLoremasterType ? 'Consulting…' : 'Studying…', 2500);
            const tier = performSkillCheck('Lore');
            if (tier >= 3) {
              const learned = learnRandomLore(studySource, { source: studySource, kingdom: player.currentKingdom });
              if (!learned) addStory('📚 You find nothing you don\'t already know here.');
            } else {
              addStory('📖 The material is dense. Nothing reveals itself to you today.');
            }
            _goBack();
          },
        },
        {
          label:  '🛒 Browse Wares',
          action: () => { _wheelStack.push(_loreMenu); _shopMenu(est.name, stockToUse, shopkeeper, eOpts); },
        },
        { label: '🚪 Leave', action: _exitEstab, isBack: true },
      ], est.name);
    }
    _loreMenu();
    return;
  }

  const typeKey    = (est.type || 'merchant').toLowerCase().replace(/[\s\-]/g, '_');
  const shopkeeper = _generateShopkeeper(typeKey);
  const eOpts      = _buildEconOpts(shopkeeper.traits || []);
  const kingdom    = eOpts.kingdom || player.currentKingdom || '';
  const baseStock  = _getEstablishmentStock(typeKey);
  const extras     = (typeof KINGDOM_VENDOR_ADDITIONS !== 'undefined' && KINGDOM_VENDOR_ADDITIONS[kingdom]?.[typeKey]) || [];
  const stock      = _vendorStock(baseStock, extras, est.name || typeKey);
  // Ensure the kingdom's own map is always available at general shops
  if (['general_store', 'market', 'merchant'].includes(typeKey) && kingdom) {
    const mapName = `Map of ${kingdom}`;
    if (typeof getItemData === 'function' && getItemData(mapName) && !stock.includes(mapName)) {
      stock.push(mapName);
    }
  }
  // Alchemist and herbalist shops carry one random recipe scroll
  if (/alchemist|herbalist|apothecary|scribe|library|bookshop/i.test(typeKey)) {
    const recipeName = _pickUnknownRecipe();
    if (recipeName) stock.push(`Recipe: ${recipeName}`);
  }
  const active  = (worldEconomy?.activeEvents || []).filter(e => !e.kingdom || e.kingdom === kingdom);
  // Scarcity: remove items from stock based on active events
  const scarceStock = _applyStockScarcity(stock, active);
  const removedCount = stock.length - scarceStock.length;
  if (active.length) {
    const summary = active.map(e => (WORLD_EVENT_EFFECTS[e.type]?.icon || '') + (WORLD_EVENT_EFFECTS[e.type]?.label || e.type)).join(', ');
    let marketNote = `📊 Market: ${summary}`;
    if (removedCount > 0) marketNote += ` — shelves are sparse.`;
    addStory(marketNote);
  }
  const stockToUse = scarceStock.length > 0 ? scarceStock : stock.slice(0, Math.max(1, Math.floor(stock.length * 0.3)));

  addStory(`🏪 You enter ${est.name}. ${shopkeeper.name}, a ${shopkeeper.race} ${shopkeeper.profession}, looks up.`);
  if (shopkeeper.traits?.[0]) addStory(`They seem ${shopkeeper.traits[0].toLowerCase()}.`);
  _shopMenu(est.name, stockToUse, shopkeeper, eOpts);
}

// ============================================================
// SECTION 10.7 · ACTIVITIES SYSTEM
// ── Context-based activities for settlements & wilderness
// ============================================================

// ── Shared helper ────────────────────────────────────────────

function _actGold(amount, label) {
  player.gold = Math.max(0, (player.gold || 0) + amount);
  updateTopStats?.();
  updatePlayerStats?.();
}

// ── Tavern Games ─────────────────────────────────────────────

async function _tavernArmWrestle() {
  const bet = Math.max(2, Math.min(10, Math.floor((player.gold || 0) * 0.1)));
  if ((player.gold || 0) < bet) { addStory(`⚠️ Need at least ${bet} gold to wager.`); _goBack(); return; }
  player.gold -= bet; updateTopStats?.();
  addStory(`💪 You slap ${bet} gold on the table and roll up your sleeve. The barroom hushes.`);
  _buildWheel([{ label: '⏳ Wrestling…', action: () => {} }]);
  await runInlineProgress('Arm wrestling…', 3000);
  const tier = performSkillCheck('Brawling');
  if (tier >= OUTCOME.MAJOR_POS) {
    _actGold(bet * 3, 'arm wrestling');
    addStory(`💥 Dominant. Your opponent's knuckles hit the table before they can blink. (+${bet * 3}g)`);
    changeMorality(1);
  } else if (tier >= OUTCOME.MINOR_POS) {
    _actGold(bet * 2, 'arm wrestling');
    addStory(`✊ A hard-fought contest — but you take it. (+${bet * 2}g)`);
  } else if (tier === OUTCOME.NEUTRAL) {
    _actGold(bet, 'arm wrestling — draw');
    addStory('😤 A dead heat. Neither arm goes down. Stakes returned.');
  } else if (tier === OUTCOME.MINOR_NEG) {
    addStory(`😬 Slammed down cleanly. You buy the next round. (−${bet}g)`);
  } else {
    addStory(`😣 Your arm folds almost immediately. Someone in the corner laughs. (−${bet}g)`);
    changeMorality(-1);
  }
  advanceTime(1);
  _goBack();
}

async function _tavernDiceGame() {
  const BET_OPTS = [2, 5, 10, 20].filter(b => b <= (player.gold || 0));
  if (!BET_OPTS.length) { addStory('⚠️ You need at least 2 gold to play.'); _goBack(); return; }
  addStory('🎲 The dice-man rattles his cup. Choose your wager:');
  _buildWheel([
    ...BET_OPTS.map(bet => ({
      label: `${bet}g`,
      action: async () => {
        _buildWheel([{ label: '⏳ Rolling…', action: () => {} }]);
        player.gold -= bet; updateTopStats?.();
        await runInlineProgress('Rolling dice…', 2000);
        const roll = Math.floor(Math.random() * 20) + 1;
        addStory(`🎲 You rolled ${roll}`);
        if (roll >= 18) {
          _actGold(bet * 3, 'dice jackpot');
          addStory(`🎉 Jackpot! The dice-man shakes his head. (+${bet * 3}g)`);
        } else if (roll >= 13) {
          _actGold(bet * 2, 'dice win');
          addStory(`✅ The dice favour you. (+${bet * 2}g)`);
        } else if (roll >= 9) {
          _actGold(bet, 'dice push');
          addStory('🤷 Push — stake returned.');
        } else {
          addStory(`❌ The dice-man scoops your coins. (−${bet}g)`);
        }
        advanceTime(1);
        _goBack();
      },
    })),
    { label: '← Back', action: _goBack, isBack: true },
  ], 'Your Wager');
}

// ── Arena / Fighting Pit ──────────────────────────────────────

function _enterArena(est) {
  addStory(`⚔️ You step into ${est.name}. The smell of sawdust and old blood. The crowd noise rises.`);
  function _arenaMenu() {
    _buildWheel([
      { label: '⚔️ Sparring Match', action: () => { _wheelStack.push(_arenaMenu); _arenaSpar(); } },
      { label: '🏆 Tournament',      action: () => { _wheelStack.push(_arenaMenu); _arenaTournament(); } },
      { label: '👁️ Watch a Bout',    action: () => { _wheelStack.push(_arenaMenu); _arenaWatch(); } },
      { label: '🚪 Leave',           action: _exitEstab, isBack: true },
    ], est.name);
  }
  _arenaMenu();
}

async function _arenaSpar() {
  _buildWheel([{ label: '⏳ Sparring…', action: () => {} }]);
  addStory('🥊 A training partner steps forward. Practice — no money, just skill.');
  await runInlineProgress('Sparring…', 3500);
  const tier = performSkillCheck('Brawling');
  if (tier >= OUTCOME.MAJOR_POS) {
    gainSkillXp('Swordsmanship', 3);
    addStory('⚡ You outclass them completely. They ask if you\'d consider teaching.');
  } else if (tier >= OUTCOME.MINOR_POS) {
    gainSkillXp('Swordsmanship', 2);
    addStory('✊ A solid match. You land more than you receive.');
  } else if (tier === OUTCOME.NEUTRAL) {
    gainSkillXp('Swordsmanship', 1);
    addStory('😤 Back and forth. Evenly matched.');
  } else if (tier === OUTCOME.MINOR_NEG) {
    const loss = Math.min(5, player.life - 1);
    player.life -= loss; updatePlayerStats?.();
    addStory(`😓 They get the better of you. A few bruises. (−${loss} life)`);
  } else {
    const loss = Math.min(10, player.life - 1);
    player.life -= loss; updatePlayerStats?.();
    addStory(`💔 Thoroughly outmatched. (−${loss} life)`);
  }
  advanceTime(2);
  _goBack();
}

async function _arenaTournament() {
  const ENTRY  = 10;
  const PRIZES = [0, 15, 30, 75];
  if ((player.gold || 0) < ENTRY) { addStory(`⚠️ Entry fee is ${ENTRY} gold.`); _goBack(); return; }
  player.gold -= ENTRY; updateTopStats?.();
  addStory('🏆 Entry paid. Three rounds stand between you and the prize.');
  let round = 0;
  async function _doRound() {
    round++;
    _buildWheel([{ label: `⏳ Round ${round}…`, action: () => {} }]);
    addStory(`⚔️ Round ${round}. The crowd watches.`);
    await runInlineProgress(`Round ${round}…`, 3500);
    const tier = performSkillCheck('Swordsmanship');
    if (tier >= OUTCOME.MINOR_POS) {
      addStory(`✅ You advance — round ${round} is yours.`);
      if (round < 3) {
        await _doRound();
      } else {
        _actGold(PRIZES[3], 'tournament champion');
        gainSkillXp('Swordsmanship', 5);
        changeMorality(3);
        addWorldEvent(`Won a combat tournament in ${player.currentKingdom || 'the region'}`, 'player');
        addStory(`🏆 You win the tournament. The crowd erupts. (+${PRIZES[3]}g)`);
        advanceTime(4);
        _goBack();
      }
    } else {
      const prize = round > 1 ? PRIZES[round - 1] : 0;
      if (prize > 0) { _actGold(prize, `tournament round ${round - 1}`); addStory(`🤝 Eliminated in round ${round} — paid out for reaching round ${round - 1}. (+${prize}g)`); }
      else addStory(round === 1 ? '❌ Eliminated in the first round. The crowd moves on.' : `😤 Eliminated in round ${round}. A respectable run.`);
      advanceTime(round + 1);
      _goBack();
    }
  }
  await _doRound();
}

async function _arenaWatch() {
  _buildWheel([{ label: '⏳ Watching…', action: () => {} }]);
  addStory('👁️ You take a seat and watch. Study the footwork, the timing.');
  await runInlineProgress('Watching…', 2500);
  const roll = Math.floor(Math.random() * 20) + 1;
  if (roll >= 16) {
    gainSkillXp('Swordsmanship', 2);
    addStory('🎓 One fighter uses a technique you haven\'t seen before. You file it away.');
  } else if (roll >= 9) {
    gainSkillXp('Swordsmanship', 1);
    addStory('👀 A decent show. You pick up a few observations.');
  } else {
    addStory('😴 Sloppy bouts today. Nothing worth studying.');
  }
  advanceTime(2);
  _goBack();
}

// ── Stables / Racetrack ───────────────────────────────────────

function _enterStables(est) {
  addStory(`🐎 ${est.name} — the smell of hay and horses. A weathered stable master eyes you up.`);
  function _stablesMenu() {
    const hasHorse = !!player.flags?.hasHiredHorse;
    _buildWheel([
      { label: '🏁 Race (Enter)',   action: () => { _wheelStack.push(_stablesMenu); _horseRace(); } },
      { label: '🎰 Bet on a Race',  action: () => { _wheelStack.push(_stablesMenu); _betOnRace(); } },
      { label: hasHorse ? '🐴 Horse Hired' : '🐴 Hire a Horse',
        action: () => { _wheelStack.push(_stablesMenu); _hireHorse(); },
        disabled: hasHorse },
      { label: '🚪 Leave',          action: _exitEstab, isBack: true },
    ], est.name);
  }
  _stablesMenu();
}

async function _horseRace() {
  const ENTRY  = 8;
  const PRIZES = [0, 8, 20, 50];
  if ((player.gold || 0) < ENTRY) { addStory(`⚠️ Race entry costs ${ENTRY} gold.`); _goBack(); return; }
  player.gold -= ENTRY; updateTopStats?.();
  addStory('🏁 You draw your lane. Five riders at the post. The flag drops.');
  _buildWheel([{ label: '⏳ Racing…', action: () => {} }]);
  await runInlineProgress('Racing…', 4500);
  const tier = performSkillCheck('Survival');
  const pos   = tier >= OUTCOME.MAJOR_POS ? 1 : tier >= OUTCOME.MINOR_POS ? 2 : tier === OUTCOME.NEUTRAL ? 3 : 4;
  const place = ['', '1st 🥇', '2nd 🥈', '3rd 🥉', '4th'][pos];
  const prize = [0, PRIZES[3], PRIZES[2], PRIZES[1], 0][pos];
  if (prize > 0) {
    _actGold(prize, `horse race ${place}`);
    addStory(`${place === '1st 🥇' ? '🏆 You cross the line first! The crowd roars.' : `${place} — a respectable finish.`} (+${prize}g)`);
    if (pos === 1) changeMorality(2);
  } else {
    addStory(`${place} — not your day on the track.`);
  }
  advanceTime(2);
  _goBack();
}

async function _betOnRace() {
  const HORSES = [
    { name: 'Dustfoot',      odds: 2  },
    { name: 'Iron Bell',     odds: 4  },
    { name: 'Midnight Star', odds: 7  },
    { name: 'Blind Luck',    odds: 12 },
  ];
  const BET_OPTS = [5, 10, 20].filter(b => b <= (player.gold || 0));
  if (!BET_OPTS.length) { addStory('⚠️ You need at least 5 gold to place a bet.'); _goBack(); return; }
  addStory('🏁 The race card is posted by the gate. Four horses competing today:');
  HORSES.forEach(h => addStory(`  • ${h.name} — ${h.odds}:1 odds`));
  // Tracking check gives a small hint about the favourite's real condition
  const hint = performSkillCheck('Tracking', 0);
  if (hint >= OUTCOME.MINOR_POS) {
    const tip = HORSES[Math.floor(Math.random() * 2)]; // one of the two favourites
    addStory(`👁️ You notice ${tip.name} moving with unusual confidence in the warm-up. Could mean something.`);
  }
  function _pickHorse() {
    _buildWheel([
      ...HORSES.map(h => ({
        label: `${h.name} (${h.odds}:1)`,
        action: () => { _pickStake(h); },
      })),
      { label: '← Back', action: _goBack, isBack: true },
    ], 'Pick a Horse');
  }
  function _pickStake(horse) {
    _buildWheel([
      ...BET_OPTS.map(bet => ({
        label: `${bet}g`,
        action: async () => {
          player.gold -= bet; updateTopStats?.();
          addStory(`🎰 ${bet}g on ${horse.name} at ${horse.odds}:1. The crowd surges as the flag drops.`);
          _buildWheel([{ label: '⏳ Racing…', action: () => {} }]);
          await runInlineProgress('Racing…', 4500);
          // Winner determined by weighted random — lower-odds horses win more often
          const totalWeight = HORSES.reduce((s, h) => s + (1 / h.odds), 0);
          let r = Math.random() * totalWeight;
          let winner = HORSES[HORSES.length - 1];
          for (const h of HORSES) { r -= 1 / h.odds; if (r <= 0) { winner = h; break; } }
          addStory(`🏁 ${winner.name} crosses the line first!`);
          if (winner.name === horse.name) {
            const payout = bet * horse.odds;
            _actGold(payout, `race bet on ${horse.name}`);
            addStory(`🎉 Your horse wins! You collect ${payout}g.`);
          } else {
            addStory(`😞 ${horse.name} didn't place. (−${bet}g)`);
          }
          advanceTime(2);
          _goBack();
        },
      })),
      { label: '← Back', action: _pickHorse, isBack: true },
    ], `Stake on ${horse.name}`);
  }
  _pickHorse();
}

async function _hireHorse() {
  const COST = 15;
  if (player.flags?.hasHiredHorse) { addStory('🐴 You already have a hired horse until your next destination.'); _goBack(); return; }
  if ((player.gold || 0) < COST) { addStory(`⚠️ Hiring a horse costs ${COST} gold.`); _goBack(); return; }
  player.gold -= COST; updateTopStats?.();
  player.flags = player.flags || {};
  player.flags.hasHiredHorse = true;
  addStory(`🐴 The stable master hands you the reins. Your next journey will be faster. (−${COST}g)`);
  _goBack();
}

// ── Gambling Den ──────────────────────────────────────────────

function _enterGamblingDen(est) {
  addStory(`🎰 You duck through the low door of ${est.name}. Candlelight, low voices, the click of dice and shuffle of cards.`);
  function _gamblingMenu() {
    _buildWheel([
      { label: '🎲 High-Stakes Dice', action: () => { _wheelStack.push(_gamblingMenu); _gamblingHighDice(); } },
      { label: '🃏 Card Game',         action: () => { _wheelStack.push(_gamblingMenu); _gamblingCards(); } },
      { label: '🐚 Shell Game',        action: () => { _wheelStack.push(_gamblingMenu); _gamblingShell(); } },
      { label: '🚪 Leave',             action: _exitEstab, isBack: true },
    ], est.name);
  }
  _gamblingMenu();
}

async function _gamblingHighDice() {
  const BET_OPTS = [5, 10, 20, 50].filter(b => b <= (player.gold || 0));
  if (!BET_OPTS.length) { addStory('⚠️ Minimum stake here is 5 gold.'); _goBack(); return; }
  addStory('🎲 The dice-keeper slides a cup across. Name your stake:');
  _buildWheel([
    ...BET_OPTS.map(bet => ({
      label: `${bet}g`,
      action: async () => {
        _buildWheel([{ label: '⏳ Rolling…', action: () => {} }]);
        player.gold -= bet; updateTopStats?.();
        await runInlineProgress('Rolling…', 2200);
        const roll = Math.floor(Math.random() * 20) + 1;
        addStory(`🎲 Rolled ${roll}`);
        if (roll >= 19) {
          _actGold(bet * 4, 'high-stakes dice');
          addStory(`🎉 The room goes quiet for a moment. (+${bet * 4}g)`);
          changeMorality(-1);
        } else if (roll >= 14) {
          _actGold(Math.round(bet * 1.5), 'dice win');
          addStory(`✅ (+${Math.round(bet * 1.5)}g)`);
        } else if (roll >= 9) {
          _actGold(bet, 'dice push');
          addStory('🤷 Push. Stake returned.');
        } else {
          addStory(`❌ The keeper collects. (−${bet}g)`);
          changeMorality(-1);
        }
        advanceTime(1);
        _goBack();
      },
    })),
    { label: '← Back', action: _goBack, isBack: true },
  ], 'Your Stake');
}

async function _gamblingCards() {
  const bet = Math.min(15, Math.max(5, Math.floor((player.gold || 0) * 0.15)));
  if ((player.gold || 0) < 5) { addStory('⚠️ Not enough gold for a card game.'); _goBack(); return; }
  player.gold -= bet; updateTopStats?.();
  addStory(`🃏 You sit down at the table. ${bet} gold in the pot. The dealer's face gives nothing away.`);
  _buildWheel([{ label: '⏳ Playing…', action: () => {} }]);
  await runInlineProgress('Playing cards…', 4000);
  const tier = performSkillCheck('Persuasion');
  if (tier >= OUTCOME.MAJOR_POS) {
    _actGold(bet * 3, 'card game big win');
    addStory(`🃏 You read every face at the table. A clean sweep. (+${bet * 3}g)`);
  } else if (tier >= OUTCOME.MINOR_POS) {
    _actGold(bet * 2, 'card game win');
    addStory(`✅ You come out ahead. (+${bet * 2}g)`);
  } else if (tier === OUTCOME.NEUTRAL) {
    _actGold(bet, 'card game break-even');
    addStory('🤝 The hands cancel out. You leave where you started.');
  } else if (tier === OUTCOME.MINOR_NEG) {
    addStory(`❌ A bad run of cards. (−${bet}g)`);
  } else {
    addStory(`😡 Cleaned out. Someone at this table was cheating. (−${bet}g)`);
    changeMorality(-1);
  }
  advanceTime(2);
  _goBack();
}

async function _gamblingShell() {
  const BET = 3;
  if ((player.gold || 0) < BET) { addStory(`⚠️ Shell game costs ${BET} gold.`); _goBack(); return; }
  player.gold -= BET; updateTopStats?.();
  addStory('🐚 The operator\'s hands blur across the table. Follow the shell with the pebble underneath...');
  _buildWheel([{ label: '⏳ Watching…', action: () => {} }]);
  await runInlineProgress('Watching…', 2800);
  const tier = performSkillCheck('Tracking');
  if (tier >= OUTCOME.MAJOR_POS) {
    _actGold(BET * 5, 'shell game — caught the switch');
    addStory(`👁️ You track every movement. The operator blinks. "Lucky guess." (+${BET * 5}g)`);
  } else if (tier >= OUTCOME.MINOR_POS) {
    _actGold(BET * 2, 'shell game — correct');
    addStory(`✅ You point to the right shell. (+${BET * 2}g)`);
  } else {
    addStory(`❌ Your eye wasn't fast enough. (−${BET}g)`);
  }
  advanceTime(1);
  _goBack();
}

// ── Archery Contest ──────────────────────────────────────────

async function _doArcheryContest() {
  const ENTRY = 5;
  if ((player.gold || 0) < ENTRY) { addStory(`⚠️ Entry to the archery contest costs ${ENTRY} gold.`); _goBack(); return; }
  player.gold -= ENTRY; updateTopStats?.();
  addStory('🏹 The targets are set at distance. A small crowd watches. You notch your first arrow.');
  _buildWheel([{ label: '⏳ Competing…', action: () => {} }]);
  await runInlineProgress('Competing…', 4000);
  const tier = performSkillCheck('Archery');
  if (tier >= OUTCOME.MAJOR_POS) {
    _actGold(30, 'archery contest — first place');
    addStory('🏆 Dead centre three times in a row. The crowd cheers. You take first prize. (+30g)');
    gainSkillXp('Archery', tier);
    changeMorality(1);
  } else if (tier >= OUTCOME.MINOR_POS) {
    _actGold(12, 'archery contest — second place');
    addStory('🥈 A strong showing. Second place and a modest purse. (+12g)');
    gainSkillXp('Archery', tier);
  } else if (tier === OUTCOME.NEUTRAL) {
    _actGold(ENTRY, 'archery contest — entry back');
    addStory('🎯 You hold your own. Entry fee returned but no prize today.');
  } else {
    addStory(`❌ An off day on the range. (−${ENTRY}g)`);
  }
  advanceTime(2);
  _goBack();
}

// ── Pit Fight Betting ─────────────────────────────────────────

async function _doPitFightBetting() {
  const FIGHTERS = [
    { name: 'The Anvil',     odds: 2 },
    { name: 'Redhand Kern',  odds: 3 },
    { name: 'Gallows Tom',   odds: 5 },
    { name: 'The Stranger',  odds: 9 },
  ];
  const BET_OPTS = [5, 10, 25].filter(b => b <= (player.gold || 0));
  if (!BET_OPTS.length) { addStory('⚠️ You need at least 5 gold to bet.'); _goBack(); return; }
  addStory('⚔️ Two fighters circle each other in the pit. The bookmaker rattles off the odds:');
  FIGHTERS.forEach(f => addStory(`  • ${f.name} — ${f.odds}:1`));
  const hint = performSkillCheck('Tracking', 0);
  if (hint >= OUTCOME.MINOR_POS) {
    const tip = FIGHTERS[Math.floor(Math.random() * 2)];
    addStory(`👁️ You notice ${tip.name} favouring their left — or hiding it well.`);
  }
  function _pickFighter() {
    _buildWheel([
      ...FIGHTERS.map(f => ({
        label: `${f.name} (${f.odds}:1)`,
        action: () => { _pickPitStake(f); },
      })),
      { label: '← Back', action: _goBack, isBack: true },
    ], 'Back a Fighter');
  }
  function _pickPitStake(fighter) {
    _buildWheel([
      ...BET_OPTS.map(bet => ({
        label: `${bet}g`,
        action: async () => {
          player.gold -= bet; updateTopStats?.();
          addStory(`⚔️ ${bet}g on ${fighter.name}. The crowd starts baying.`);
          _buildWheel([{ label: '⏳ Fighting…', action: () => {} }]);
          await runInlineProgress('Fighting…', 5000);
          const totalWeight = FIGHTERS.reduce((s, f) => s + (1 / f.odds), 0);
          let r = Math.random() * totalWeight;
          let winner = FIGHTERS[FIGHTERS.length - 1];
          for (const f of FIGHTERS) { r -= 1 / f.odds; if (r <= 0) { winner = f; break; } }
          addStory(`🥊 ${winner.name} wins the bout!`);
          if (winner.name === fighter.name) {
            const payout = bet * fighter.odds;
            _actGold(payout, `pit fight bet — ${fighter.name}`);
            addStory(`💰 You collect your winnings. (+${payout}g)`);
          } else {
            addStory(`😞 ${fighter.name} goes down. (−${bet}g)`);
          }
          advanceTime(2);
          _goBack();
        },
      })),
      { label: '← Back', action: _pickFighter, isBack: true },
    ], `Stake on ${fighter.name}`);
  }
  _pickFighter();
}

// ── Pickpocket (street, from Activities wheel) ───────────────

async function _doStreetPickpocket() {
  addStory('🤚 You drift through the crowd, eyes on soft targets. A fat purse catches your eye.');
  _buildWheel([{ label: '⏳ Working the crowd…', action: () => {} }]);
  await runInlineProgress('Working the crowd…', 3000);
  const tier = performSkillCheck('Thievery');
  if (tier >= OUTCOME.MAJOR_POS) {
    const gain = randomInt(8, 20);
    _actGold(gain, 'pickpocket');
    addStory(`🤫 Clean as a whistle. The mark doesn't feel a thing. (+${gain}g)`);
    changeMorality(-2);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, -2);
  } else if (tier >= OUTCOME.MINOR_POS) {
    const gain = randomInt(3, 8);
    _actGold(gain, 'pickpocket');
    addStory(`✋ A small score. You move away before anyone notices. (+${gain}g)`);
    changeMorality(-2);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, -1);
  } else if (tier === OUTCOME.NEUTRAL) {
    addStory('😬 Your hand brushes the purse but you pull back. Too risky. You walk away empty-handed.');
  } else if (tier === OUTCOME.MINOR_NEG) {
    addStory('😤 The mark feels it and pulls away. They shoot you a look but say nothing. Best move on.');
    changeMorality(-1);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, -3);
  } else {
    addStory('🚨 Caught in the act! The mark shouts "Thief!" You bolt — and just barely escape the crowd.');
    player.life = Math.max(1, (player.life || 1) - 5);
    player.stamina = Math.max(0, (player.stamina || 0) - 20);
    updatePlayerStats?.();
    changeMorality(-3);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, -8);
  }
  advanceTime(1);
  _goBack();
}

// ── Mugging ───────────────────────────────────────────────────

async function _doMugSomeone() {
  const isNight = ['🌆 Evening','🌃 Mid-Evening','🌙 Dusk','🌑 Night','⭐ Late Night'].includes(player.timeOfDay);
  if (!isNight) { addStory('🌞 The streets are too busy. This kind of work needs dark.'); _goBack(); return; }
  addStory('🌑 You follow a well-dressed figure into a less-travelled alley and make your move.');
  _buildWheel([{ label: '⏳ Moving…', action: () => {} }]);
  await runInlineProgress('Moving…', 3500);
  const stealthTier = performSkillCheck('Stealth');
  const brawlTier   = performSkillCheck('Brawling');
  const combinedTier = Math.round((stealthTier + brawlTier) / 2);
  if (combinedTier >= OUTCOME.MAJOR_POS) {
    const gain = randomInt(15, 40);
    _actGold(gain, 'mugging');
    addStory(`💸 Swift and quiet. The mark hands it over and scurries off. (+${gain}g)`);
    changeMorality(-5);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, -5);
  } else if (combinedTier >= OUTCOME.MINOR_POS) {
    const gain = randomInt(8, 18);
    _actGold(gain, 'mugging');
    addStory(`✋ A rough exchange. You get what you came for and slip away. (+${gain}g)`);
    player.life = Math.max(1, (player.life || 1) - 8);
    updatePlayerStats?.();
    changeMorality(-5);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, -6);
  } else if (combinedTier === OUTCOME.NEUTRAL) {
    addStory('😬 The mark puts up more fight than expected. You disengage and flee empty-handed.');
    player.life = Math.max(1, (player.life || 1) - 12);
    updatePlayerStats?.();
    changeMorality(-3);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, -4);
  } else {
    addStory('🚨 The mark screams and guards come running. You take a hit escaping. Not worth it tonight.');
    player.life = Math.max(1, (player.life || 1) - 18);
    player.stamina = Math.max(0, (player.stamina || 0) - 25);
    updatePlayerStats?.();
    changeMorality(-6);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, -12);
  }
  advanceTime(1);
  _goBack();
}

// ── Report Crime to Guards ────────────────────────────────────

async function _reportCrimeToGuards() {
  const robbery = player.flags?.recentRobbery;
  if (!robbery) { addStory('⚔️ You have no recent crime to report.'); _goBack(); return; }
  addStory(`⚔️ You find the guard post and recount what happened — ${robbery.amount} gold stolen at ${robbery.location}.`);
  _buildWheel([{ label: '⏳ Filing report…', action: () => {} }]);
  await runInlineProgress('Filing report…', 2500);
  const tier = performSkillCheck('Persuasion');
  if (tier >= OUTCOME.MAJOR_POS) {
    const recovered = Math.floor(robbery.amount * 0.5);
    _actGold(recovered, 'crime report — partial recovery');
    addStory(`🛡️ The guard captain takes it seriously. A patrol recovers some of the stolen gold. (+${recovered}g)`);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, 3);
  } else if (tier >= OUTCOME.MINOR_POS) {
    const recovered = Math.floor(robbery.amount * 0.25);
    _actGold(recovered, 'crime report — small recovery');
    addStory(`🛡️ The guards are sympathetic and make inquiries. You recover a fraction of what was taken. (+${recovered}g)`);
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, 2);
  } else if (tier === OUTCOME.NEUTRAL) {
    addStory('📋 Your report is logged. The guard tells you they\'ll "look into it." You\'re not optimistic.');
    if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, 1);
  } else {
    addStory('😐 The guard shrugs. Happens all the time. Nothing they can do. You\'re on your own.');
  }
  // Clear the flag regardless
  player.flags.recentRobbery = null;
  advanceTime(1);
  _goBack();
}

// ── Bathhouse ────────────────────────────────────────────────

function _enterBathhouse(est) {
  addStory(`🛁 ${est.name} — warm steam drifts through the entrance. Soap, oil, quiet conversation.`);
  function _bathMenu() {
    _buildWheel([
      {
        label: '🛁 Bathe (3g)',
        action: async () => {
          if ((player.gold || 0) < 3) { addStory('⚠️ A bath costs 3 gold.'); return; }
          player.gold -= 3; updateTopStats?.();
          _buildWheel([{ label: '⏳ Bathing…', action: () => {} }]);
          await runInlineProgress('Soaking…', 3500);
          const lifeGain = Math.min(8, player.maxLife - player.life);
          const stamGain = Math.min(15, player.maxStamina - player.stamina);
          player.life    = Math.min(player.maxLife,    player.life    + lifeGain);
          player.stamina = Math.min(player.maxStamina, player.stamina + stamGain);
          updatePlayerStats?.();
          addStory(`✨ The road washes off you. You feel genuinely clean. (+${lifeGain} life, +${stamGain} stamina)`);
          advanceTime(2);
          _goBack();
        },
      },
      {
        label: '💬 Talk to Patrons',
        action: async () => {
          _buildWheel([{ label: '⏳ Chatting…', action: () => {} }]);
          await runInlineProgress('Chatting…', 2000);
          const learned = typeof learnRandomLore === 'function'
            ? learnRandomLore('rumor', { source: 'rumor', kingdom: player.currentKingdom })
            : null;
          addStory(learned
            ? '💬 The relaxed atmosphere loosens tongues. You pick up something useful.'
            : '💬 Pleasant enough. Nothing particularly useful.');
          advanceTime(1);
          _goBack();
        },
      },
      { label: '🚪 Leave', action: _exitEstab, isBack: true },
    ], est.name);
  }
  _bathMenu();
}

// ── Activities Wheel (Town context) ──────────────────────────

function _showActivitiesWheel() {
  const cell      = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const zone      = (cell.zone || '').toLowerCase();
  const isCity    = /city/.test(zone);
  const isVillage = /village/.test(zone);

  _buildWheel([
    ...(isCity || isVillage ? [{
      label:   '💼 Work',
      tooltip: 'Odd Jobs, Busking, Favor Board',
      action:  () => { _wheelStack.push(_showActivitiesWheel); _showWorkActivitiesWheel(); },
    }] : []),
    ...(isCity || isVillage ? [{
      label:   '🏆 Tournaments',
      tooltip: 'Archery Contest, Pit Fight Betting, Local Games',
      action:  () => { _wheelStack.push(_showActivitiesWheel); _showTournamentsWheel(); },
    }] : []),
    ...(isCity ? [{
      label:   '🌑 Crime',
      tooltip: 'Search Alleys, Mug Someone (night)',
      action:  () => { _wheelStack.push(_showActivitiesWheel); _showCrimeWheel(); },
    }] : []),
    { label: '← Back', action: _goBack, isBack: true },
  ], 'Activities');
}

function _showWorkActivitiesWheel() {
  const cell      = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const zone      = (cell.zone || '').toLowerCase();
  const isCity    = /city/.test(zone);
  const isVillage = /village/.test(zone);

  _buildWheel([
    ...(isCity || isVillage ? [{
      label:  '📋 Odd Jobs',
      action: () => { _wheelStack.push(_showWorkActivitiesWheel); _doOddJobs(); },
    }] : []),
    ...(isCity ? [{
      label:  '🎭 Busk & Perform',
      action: () => { _wheelStack.push(_showWorkActivitiesWheel); _doBusk(); },
    }] : []),
    ...(isCity ? [{
      label:  '🤝 Favor Board',
      action: () => { _wheelStack.push(_showWorkActivitiesWheel); _doFavorBoard(); },
    }] : []),
    { label: '← Back', action: _goBack, isBack: true },
  ], 'Work');
}

function _showTournamentsWheel() {
  const cell      = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const zone      = (cell.zone || '').toLowerCase();
  const isCity    = /city/.test(zone);
  const isVillage = /village/.test(zone);

  _buildWheel([
    ...(isCity || isVillage ? [{
      label:  '🏹 Archery Contest',
      action: () => { _wheelStack.push(_showTournamentsWheel); _doArcheryContest(); },
    }] : []),
    ...(isCity ? [{
      label:  '⚔️ Pit Fight Betting',
      action: () => { _wheelStack.push(_showTournamentsWheel); _doPitFightBetting(); },
    }] : []),
    ...(isVillage && !isCity ? [{
      label:  '🎯 Local Games',
      action: () => { _wheelStack.push(_showTournamentsWheel); _doLocalGames(); },
    }] : []),
    { label: '← Back', action: _goBack, isBack: true },
  ], 'Tournaments');
}

function _showCrimeWheel() {
  const isNight = ['🌆 Evening','🌃 Mid-Evening','🌙 Dusk','🌑 Night','⭐ Late Night'].includes(player.timeOfDay);

  _buildWheel([
    {
      label:  '🔍 Search Alleys',
      action: () => { _wheelStack.push(_showCrimeWheel); _doSearchAlleys(); },
    },
    ...(isNight ? [{
      label:  '🌑 Mug Someone',
      action: () => { _wheelStack.push(_showCrimeWheel); _doMugSomeone(); },
    }] : [{
      label:   '🌑 Mug Someone',
      tooltip: 'Only available at night',
      action:  () => { addStory('🌙 You\'ll need the cover of darkness for that.'); _goBack(); },
    }]),
    { label: '← Back', action: _goBack, isBack: true },
  ], 'Crime');
}

async function _doOddJobs() {
  const cell   = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const isCity = /city/i.test(cell.zone || '');
  const JOBS = [
    { label: 'delivering goods',    skill: 'Survival',   pay: isCity ? 8 : 5 },
    { label: 'clearing pests',      skill: 'Tracking',   pay: isCity ? 6 : 4 },
    { label: 'fetching supplies',   skill: 'Survival',   pay: isCity ? 7 : 5 },
    { label: 'loading cargo',       skill: 'Brawling',   pay: isCity ? 9 : 6 },
    { label: 'running messages',    skill: 'Tracking',   pay: isCity ? 5 : 4 },
    { label: 'repairing a fence',   skill: 'Crafting',   pay: isCity ? 5 : 5 },
    { label: 'finding a lost pet',  skill: 'Tracking',   pay: isCity ? 8 : 5 },
    { label: 'guarding a stall',    skill: 'Swordsmanship', pay: isCity ? 10 : 6 },
  ];
  const job = JOBS[Math.floor(Math.random() * JOBS.length)];
  addStory(`📋 A local has a job — ${job.label}. They're offering ${job.pay} gold.`);
  _buildWheel([
    {
      label: '✅ Accept',
      action: async () => {
        _buildWheel([{ label: '⏳ Working…', action: () => {} }]);
        await runInlineProgress(`${job.label}…`, 4000);
        const tier = performSkillCheck(job.skill);
        if (tier >= OUTCOME.MAJOR_POS) {
          _actGold(job.pay + 3, 'odd job bonus');
          addStory(`⭐ Excellent work. They add a little extra. (+${job.pay + 3}g)`);
          changeMorality(1);
        } else if (tier >= OUTCOME.MINOR_POS) {
          _actGold(job.pay, 'odd job');
          addStory(`✅ Done well. (+${job.pay}g)`);
          changeMorality(1);
        } else if (tier === OUTCOME.NEUTRAL) {
          _actGold(Math.floor(job.pay / 2), 'odd job partial');
          addStory(`😐 Acceptable, if not impressive. Half pay. (+${Math.floor(job.pay / 2)}g)`);
        } else {
          addStory(`❌ Things went sideways. No pay — and they won't be calling on you again.`);
          changeMorality(-1);
        }
        advanceTime(2);
        checkQuestObjectives?.('work_found');
        checkQuestObjectives?.('job_done');
        _goBack();
      },
    },
    { label: '← Decline', action: _goBack, isBack: true },
  ], 'Odd Job');
}

async function _doSearchAlleys() {
  const hourKey = `alleys_${player.currentLocation}_${Math.floor(Date.now() / 3600000)}`;
  if (player.flags?.[hourKey]) {
    addStory('🔍 You\'ve already combed these streets today. Nothing more to find.');
    _goBack(); return;
  }
  _buildWheel([{ label: '⏳ Searching…', action: () => {} }]);
  addStory('🔍 You slip into the back streets — alcoves, refuse heaps, forgotten corners...');
  await runInlineProgress('Searching alleys…', 4500);
  const tier = performSkillCheck('Tracking');
  player.flags = player.flags || {};
  player.flags[hourKey] = true;
  if (tier >= OUTCOME.MAJOR_POS) {
    const gold = randomInt(8, 20);
    _actGold(gold, 'alley search');
    addItem('Herb Pouch', 1);
    addStory(`💰 A dropped purse and some salvageable trade goods. (+${gold}g, Herb Pouch)`);
  } else if (tier >= OUTCOME.MINOR_POS) {
    const gold = randomInt(3, 8);
    _actGold(gold, 'alley search');
    addStory(`💰 Scattered coins and something worth pocketing. (+${gold}g)`);
  } else if (tier === OUTCOME.NEUTRAL) {
    addStory('🗑️ Nothing but old garbage and stray cats.');
  } else if (tier === OUTCOME.MINOR_NEG) {
    addStory('🙅 You attract suspicious glances. Better move along.');
  } else {
    const loss = Math.min(4, player.life - 1);
    player.life -= loss; updatePlayerStats?.();
    addStory('🚨 You stumble into someone\'s territory. You leave quickly and not without cost.');
    changeMorality(-1);
  }
  advanceTime(2);
  _goBack();
}

async function _doBusk() {
  if ((player.stamina || 0) < 5) { addStory('😓 Too tired to perform.'); _goBack(); return; }
  _buildWheel([{ label: '⏳ Performing…', action: () => {} }]);
  addStory('🎭 You find a good corner, attract some passing interest, and begin.');
  await runInlineProgress('Performing…', 4000);
  const tier = performSkillCheck('Persuasion');
  player.stamina = Math.max(0, (player.stamina || 0) - 5); updatePlayerStats?.();
  if (tier >= OUTCOME.MAJOR_POS) {
    const tips = randomInt(10, 18);
    _actGold(tips, 'busking');
    addStory(`🌟 A crowd gathers. Someone throws a silver piece. (+${tips}g)`);
    changeMorality(2);
  } else if (tier >= OUTCOME.MINOR_POS) {
    const tips = randomInt(4, 9);
    _actGold(tips, 'busking');
    addStory(`👏 A modest reception. Coins hit the ground. (+${tips}g)`);
    changeMorality(1);
  } else if (tier === OUTCOME.NEUTRAL) {
    _actGold(1, 'busking');
    addStory('😐 A few pity coins. Not your best work. (+1g)');
  } else {
    addStory('😬 Someone asks you to stop. The crowd passes without slowing.');
  }
  advanceTime(2);
  _goBack();
}

async function _doLocalGames() {
  const GAMES = [
    { name: 'Arm Wrestling',  skill: 'Brawling',      flavor: 'The village blacksmith cracks his knuckles.' },
    { name: 'Knife Throwing', skill: 'Archery',       flavor: 'Painted targets on old barrels at the edge of the green.' },
    { name: 'Stone Toss',     skill: 'Brawling',      flavor: 'A heavy flat stone. You lift it and size up the mark.' },
    { name: 'Foot Race',      skill: 'Survival',      flavor: 'Three laps of the village square. Children line the fence.' },
    { name: 'Log Splitting',  skill: 'Crafting',      flavor: 'The biggest log they could find. The axe is yours.' },
    { name: 'Fishing Contest', skill: 'Fishing',      flavor: 'The river bank is lined with competitors.' },
  ];
  const game = GAMES[Math.floor(Math.random() * GAMES.length)];
  const BET  = 3;
  addStory(`🎯 ${game.flavor} A ${game.name} contest — ${BET} gold entry.`);
  _buildWheel([
    {
      label: `✅ Enter (${BET}g)`,
      action: async () => {
        if ((player.gold || 0) < BET) { addStory(`⚠️ Need ${BET} gold.`); _goBack(); return; }
        player.gold -= BET; updateTopStats?.();
        _buildWheel([{ label: '⏳ Competing…', action: () => {} }]);
        await runInlineProgress(`${game.name}…`, 3500);
        const tier = performSkillCheck(game.skill);
        if (tier >= OUTCOME.MAJOR_POS) {
          _actGold(BET * 4, `${game.name} win`);
          changeMorality(2);
          addStory(`🥇 You win and then some. The village will be talking about it. (+${BET * 4}g)`);
        } else if (tier >= OUTCOME.MINOR_POS) {
          _actGold(BET * 2, `${game.name} placed`);
          addStory(`✅ A solid finish. (+${BET * 2}g)`);
        } else if (tier === OUTCOME.NEUTRAL) {
          _actGold(BET, `${game.name} draw`);
          addStory('🤝 Respectable. Stake returned.');
        } else {
          addStory(`❌ Beaten. The locals cheer for someone else. (−${BET}g)`);
        }
        advanceTime(2);
        _goBack();
      },
    },
    { label: '← Decline', action: _goBack, isBack: true },
  ], game.name);
}

async function _doFavorBoard() {
  // City favor board — a slightly larger errand with a named requester
  const FAVORS = [
    { task: 'recover a stolen ledger from the docks',      skill: 'Tracking',    gold: 20, morality: 2  },
    { task: 'escort a merchant to the north gate',         skill: 'Swordsmanship', gold: 18, morality: 2 },
    { task: 'find a missing child last seen near the market', skill: 'Tracking', gold: 25, morality: 3 },
    { task: 'deliver a sealed letter across the city',     skill: 'Survival',    gold: 12, morality: 1  },
    { task: 'clear rats from a shopkeeper\'s cellar',      skill: 'Tracking',    gold: 15, morality: 1  },
    { task: 'stand watch at a merchant\'s stall overnight', skill: 'Survival',   gold: 14, morality: 1  },
  ];
  const favor = FAVORS[Math.floor(Math.random() * FAVORS.length)];
  const NAMES = ['Aldric Voss', 'Mira Thoen', 'Guildmaster Farren', 'The Harbormaster', 'Sister Yela'];
  const requester = NAMES[Math.floor(Math.random() * NAMES.length)];
  addStory(`🤝 A notice on the board: <em>${requester}</em> needs someone to ${favor.task}. Reward: ${favor.gold} gold.`);
  _buildWheel([
    {
      label: '✅ Accept',
      action: async () => {
        _buildWheel([{ label: '⏳ Working…', action: () => {} }]);
        await runInlineProgress('On the job…', 5000);
        const tier = performSkillCheck(favor.skill);
        if (tier >= OUTCOME.MINOR_POS) {
          const bonus = tier >= OUTCOME.MAJOR_POS ? 8 : 0;
          _actGold(favor.gold + bonus, 'favor');
          addStory(`✅ ${requester} is satisfied. ${bonus > 0 ? 'They add extra for the quality of the work. ' : ''}(+${favor.gold + bonus}g)`);
          changeMorality(tier >= OUTCOME.MAJOR_POS ? favor.morality + 1 : favor.morality);
        } else if (tier === OUTCOME.NEUTRAL) {
          _actGold(Math.floor(favor.gold * 0.5), 'favor partial');
          addStory(`😐 You complete it — barely. ${requester} pays half. (+${Math.floor(favor.gold * 0.5)}g)`);
        } else {
          addStory(`❌ The job goes wrong. ${requester} won't be recommending you.`);
          changeMorality(-1);
        }
        advanceTime(3);
        _goBack();
      },
    },
    { label: '← Decline', action: _goBack, isBack: true },
  ], 'City Favor');
}

// ── Travelling merchant ────────────────────────────────────────────────────

function _openTravellingMerchant(event) {
  const isRare = event.merchantType === 'rare';
  const pool   = TRAVELLING_MERCHANT_POOL;

  const pick = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
  const stock = isRare
    ? [...pick(pool.common, randomInt(3, 4)), ...pick(pool.uncommon, randomInt(4, 5)), ...pick(pool.rare, randomInt(2, 3))]
    : [...pick(pool.common, randomInt(5, 6)), ...pick(pool.uncommon, randomInt(3, 4)), ...(Math.random() < 0.3 ? pick(pool.rare, 1) : [])];

  const traitPool = ['Generous', 'Greedy', 'Cunning', 'Kind', 'Honorable'];
  const trait     = traitPool[Math.floor(Math.random() * traitPool.length)];
  let merchant;
  if (typeof NPCGenerator !== 'undefined') {
    try { merchant = NPCGenerator.generate({ profession: 'Merchant' }); } catch { /* fall through */ }
  }
  if (!merchant) {
    const races = ['Human', 'Human', 'Halfling', 'Dwarf'];
    merchant = { name: 'The Merchant', race: races[Math.floor(Math.random() * races.length)], profession: 'Merchant', traits: [trait] };
  }
  if (!merchant.traits?.length) merchant.traits = [trait];

  addStory(`🛒 ${merchant.name}, a travelling ${merchant.race} merchant. They seem ${merchant.traits[0].toLowerCase()}.`);

  // Inject up to 2 recipe scrolls for unknown recipes
  const _knownR = new Set(player.knownRecipes || []);
  if (typeof Recipes !== 'undefined') {
    const allR = [...(Recipes.Crafting || []), ...(Recipes.Alchemy || []), ...(Recipes.Cooking || [])];
    const unknownR = allR.filter(r => !_knownR.has(r.name));
    const scrollCount = isRare ? 2 : 1;
    for (let i = 0; i < scrollCount && unknownR.length; i++) {
      const idx = Math.floor(Math.random() * unknownR.length);
      stock.push(`Recipe: ${unknownR.splice(idx, 1)[0].name}`);
    }
  }

  // Travelling merchants have no kingdom modifier — they roam
  const eOpts = { kingdom: null, npcTraits: merchant.traits, worldEvents: worldEconomy?.activeEvents || [] };
  const shopName = `${merchant.name}'s Wares`;
  const push = () => _buildWheel([
    { label: '🛒 Browse Wares', action: () => { _wheelStack.push(push); _shopBuyWheel(stock, eOpts, 0); } },
    { label: '💰 Sell Items',   action: () => { _wheelStack.push(push); _shopSellWheel(eOpts, 0); } },
    { label: '🔄 Barter',       action: () => { _wheelStack.push(push); _barterSelectPlayerItem(stock, merchant, eOpts, 0); } },
    { label: '← Back',          action: _goBack, isBack: true },
  ], shopName);
  push();
}

// ── Dev command: show active economy events ────────────────────────────────

function _devShowEconomy() {
  const events = worldEconomy?.activeEvents || [];
  if (!events.length) { addStory('[Dev] No active economy events.'); return; }
  events.forEach(ev => {
    const fx = WORLD_EVENT_EFFECTS[ev.type];
    addStory(`[Dev] ${fx?.icon || ''} ${ev.type} — ${ev.kingdom || 'global'} — ${ev.turnsLeft === 999 ? 'permanent' : ev.turnsLeft + ' turns'}`);
  });
}

// ============================================================
// SECTION 11 · MAP SYSTEM
// ============================================================

// 11.1 · Kingdom & Biome Color Data
const kingdomColors = {
				Ardrenhold: 'rgba(255,0,0,0.5)',
				Brythwen: 'rgba(0,255,0,0.5)',
				Dwynbroch: 'rgba(0,0,255,0.5)',
				Feldarún: 'rgba(255,255,0,0.5)',
				Naradreth: 'rgba(255,0,255,0.5)',
				Nithrond: 'rgba(0,255,255,0.5)',
				Orindroth: 'rgba(255,128,0,0.5)',
				Rendarost: 'rgba(128,0,255,0.5)',
				Sivanrift: 'rgba(0,128,255,0.5)',
				Wistravael: 'rgba(128,255,0,0.5)'
			};

			selectedBorderColor = kingdomColors[selectedKingdom];


// 11.2 · Countdown Bar (100% → 0%)
function runCountdownBar(id, durationMs) {
  const outer = document.getElementById(id);
  const inner = outer.firstElementChild;
  outer.style.display = 'block';
  inner.style.width = '100%';

  return new Promise(resolve => {
    const tick = 100;
    let elapsed = 0;
    const iv = setInterval(() => {
      elapsed += tick;
      const percent = Math.max(0, 100 - (elapsed / durationMs) * 100);
      inner.style.width = percent + '%';
      if (elapsed >= durationMs) {
        clearInterval(iv);
        outer.style.display = 'none';
        resolve();
      }
    }, tick);
  });
}

// ============================================================
// SECTION 12 · GAME FUNCTIONS
// ============================================================

// 12.1 · Experience & Skills
			function gainExperience(p, silent = false) {
				player.experience = (player.experience || 0) + p;
				const threshold = player.level * 100;
				if (player.experience >= threshold) {
					player.experience -= threshold;
					player.level++;
					player.maxLife    = (player.maxLife    || 100) + 10;
					player.maxStamina = (player.maxStamina || 50)  + 5;
					player.maxMana    = (player.maxMana    || 50)  + 5;
					player.life       = player.maxLife;
					player.stamina    = player.maxStamina;
					player.mana       = player.maxMana;
					addStory(`🌟 Level ${player.level}! Max Life +10 · Max Stamina +5 · Max Mana +5. All pools restored.`);
					addWorldEvent(`Reached Level ${player.level}.`, 'player');
					changeHope(3, 'leveled up');
					checkAchievementTitles?.();
					checkGlobalEventTriggers();
				} else if (!silent) {
					addStory(`+${p} XP. (${player.experience}/${threshold})`);
				}
				updateTopStats();
			}

			function learnSkill(s) {
				if (!player.skills[s]) {
					player.skills[s] = { level: 1, xp: 0, usageCount: 0 };
					addStory(`Learned ${s}.`);
				} else {
					if (player.skills[s].xp === undefined) player.skills[s].xp = 0;
					player.skills[s].usageCount = (player.skills[s].usageCount || 0) + 1;
					addStory(`Used ${s}.`);
				}
				updateTopStats();
			}

// 12.2 · Add / Remove Inventory Items

const HERB_POUCH_ITEMS = new Set([
  'Healing Herb','Yarrow','Basil','Parsley','Dill','Sage','Milkweed',
  'Ginseng Root','Eyebright','Rue','Valerian Root','Asafoetida','Lungwort',
  'Marsh Marigold','Wormwood','Chamomile','Bleeding Heart','Wild Violet',
  'Moonbloom','Ember Root','Rare Herb','Raptor Herb','Dragonherb',
  'Ironbark Resin','Goldenmoss','Snapdragon','Energizing Bloom','Firebloom',
  "King's Blossom",'Herb Berry','Elderflower','Rose Hip',
]);

const INGREDIENT_POUCH_ITEMS = new Set([
  'Wild Berries','Elderberry','Blackcurrant','White Currant','Gooseberry','Strawberry',
  'Edible Mushrooms','Chanterelle','Fly Agaric','Stinkhorn','Giant Stinkhorn','Death Cap',
  'Indigo Milk Cap','Speckled Mushroom','Herb Berry',
  'Gnarled Root','Dry Leaves','Sea Kale','Seaweed','Kelp','Marsh Reed',
  'Black Pepper','Garlic','Lemon','Wheat','Flour','Spikelets',
]);

function _getPouchCategory(name) {
  if (HERB_POUCH_ITEMS.has(name))       return 'herb';
  if (INGREDIENT_POUCH_ITEMS.has(name)) return 'ingredient';
  return null;
}

function _hasHerbPouch()       { return !!(player.activePouches?.herb       || player.inventory?.['Herb Pouch']        || player.inventory?.['Herb Pouch (Large)']); }
function _hasIngredientPouch() { return !!(player.activePouches?.ingredient || player.inventory?.['Ingredient Pouch'] || player.inventory?.['Ingredient Pouch (Large)']); }

function _migrateItemsToPouch(pouchType) {
  if (!player.pouchContents) player.pouchContents = { herb: {}, ingredient: {} };
  const pc = player.pouchContents[pouchType] || (player.pouchContents[pouchType] = {});
  const toMove = Object.entries(player.inventory)
    .filter(([n]) => _getPouchCategory(n) === pouchType);
  toMove.forEach(([n, d]) => {
    pc[n] = (pc[n] || 0) + (d.quantity || 0);
    delete player.inventory[n];
  });
}

function addItem(name, qty, options = {}) {
  // Auto-classify recipe scrolls by name pattern
  const recipeMatch = name.match(/^Recipe:\s*(.+)$/i);
  if (recipeMatch && !options.type) {
    options = {
      type: 'recipe_scroll',
      recipeName: recipeMatch[1].trim(),
      rarity: options.rarity || 'Uncommon',
      description: `A scroll detailing how to craft: ${recipeMatch[1].trim()}.`,
      weight: 0.1,
      value: 30,
      ...options,
    };
  }

  const _db = (typeof findItemInDatabase === 'function' && findItemInDatabase(name)) || {};

  // Pouches activate as equipment — never go into inventory
  const _pouchActivations = {
    'Herb Pouch':              () => { if (!player.activePouches) player.activePouches = {}; if (!player.activePouches.herb)       player.activePouches.herb       = name; if (!player.pouchContents) player.pouchContents = { herb: {}, ingredient: {} }; _migrateItemsToPouch('herb');       addStory(`🌿 Herb Pouch equipped — herbs now stored inside.`);       _updateInvSidebar?.(); updateInventory?.(); },
    'Herb Pouch (Large)':      () => { if (!player.activePouches) player.activePouches = {}; player.activePouches.herb       = name; if (!player.pouchContents) player.pouchContents = { herb: {}, ingredient: {} }; _migrateItemsToPouch('herb');       addStory(`🌿 Large Herb Pouch equipped — holds more herbs.`);      _updateInvSidebar?.(); updateInventory?.(); },
    'Ingredient Pouch':        () => { if (!player.activePouches) player.activePouches = {}; if (!player.activePouches.ingredient) player.activePouches.ingredient = name; if (!player.pouchContents) player.pouchContents = { herb: {}, ingredient: {} }; _migrateItemsToPouch('ingredient'); addStory(`🎒 Ingredient Pouch equipped — ingredients now stored inside.`); _updateInvSidebar?.(); updateInventory?.(); },
    'Ingredient Pouch (Large)':() => { if (!player.activePouches) player.activePouches = {}; player.activePouches.ingredient = name; if (!player.pouchContents) player.pouchContents = { herb: {}, ingredient: {} }; _migrateItemsToPouch('ingredient'); addStory(`🎒 Large Ingredient Pouch equipped — holds more ingredients.`), _updateInvSidebar?.(); updateInventory?.(); },
    'Coin Pouch':              () => { if (!player.activePouches) player.activePouches = {}; if (!player.activePouches.coin)       player.activePouches.coin       = name; addStory(`💰 Coin Pouch equipped.`); updateTopStats?.(); },
    'Coin Pouch (Large)':      () => { if (!player.activePouches) player.activePouches = {}; player.activePouches.coin       = name; addStory(`💰 Large Coin Pouch equipped — holds more gold safely.`); updateTopStats?.(); },
  };
  if (_pouchActivations[name]) {
    _pouchActivations[name]();
    return;
  }

  // Route herb/ingredient items into their pouch if player has one
  const pCat = _getPouchCategory(name);
  if (pCat === 'herb' && _hasHerbPouch()) {
    if (!player.pouchContents) player.pouchContents = { herb: {}, ingredient: {} };
    if (!player.pouchContents.herb) player.pouchContents.herb = {};
    player.pouchContents.herb[name] = (player.pouchContents.herb[name] || 0) + qty;
    addStory(`+ ${qty} ${name}(s). [Herb Pouch]`);
    checkQuestObjectives?.('item', { item: name, qty });
    updateTopStats();
    updateInventory();
    return;
  }
  if (pCat === 'ingredient' && _hasIngredientPouch()) {
    if (!player.pouchContents) player.pouchContents = { herb: {}, ingredient: {} };
    if (!player.pouchContents.ingredient) player.pouchContents.ingredient = {};
    player.pouchContents.ingredient[name] = (player.pouchContents.ingredient[name] || 0) + qty;
    addStory(`+ ${qty} ${name}(s). [Ingredient Pouch]`);
    checkQuestObjectives?.('item', { item: name, qty });
    updateTopStats();
    updateInventory();
    return;
  }

  if (!player.inventory[name]) {
    player.inventory[name] = {
      type:        options.type        || _db.type        || 'misc',
      rarity:      options.rarity      || _db.rarity      || 'common',
      consumable:  options.consumable  ?? _db.consumable  ?? false,
      wearable:    options.wearable    ?? _db.wearable    ?? false,
      condition:   options.condition   || _db.condition   || 'New',
      quantity: 0,
      description: options.description || _db.description || '',
      weight:      options.weight      ?? _db.weight      ?? 0,
      effect:      options.effect      || _db.baseEffect  || '',
      ...(options.recipeName ? { recipeName: options.recipeName } : {}),
    };
  }
  player.inventory[name].quantity += qty;
  addStory(`+ ${qty} ${name}(s).`);
  const mapMatch = name.match(/^Map of (.+)$/);
  if (mapMatch) learnKingdom(mapMatch[1]);
  checkQuestObjectives?.('item', { item: name, qty });
  updateTopStats();
  updateInventory();
}

function removeItem(name, qty = 1) {
  // Check pouches first
  const pc = player.pouchContents || {};
  if (pc.herb?.[name]) {
    const have = pc.herb[name];
    const take = Math.min(qty, have);
    pc.herb[name] -= take;
    if (pc.herb[name] <= 0) delete pc.herb[name];
    addStory(`-${take} ${name}${take !== 1 ? 's' : ''}`);
    updateInventory();
    return;
  }
  if (pc.ingredient?.[name]) {
    const have = pc.ingredient[name];
    const take = Math.min(qty, have);
    pc.ingredient[name] -= take;
    if (pc.ingredient[name] <= 0) delete pc.ingredient[name];
    addStory(`-${take} ${name}${take !== 1 ? 's' : ''}`);
    updateInventory();
    return;
  }

  const invItem = player.inventory[name];
  if (!invItem) {
    console.warn(`⚠️ Tried to remove ${name}, but it doesn't exist.`);
    return;
  }

  if (invItem.quantity < qty) {
    qty = invItem.quantity;
  }

  invItem.quantity -= qty;

  if (invItem.quantity <= 0) {
    delete player.inventory[name];
    addStory(`Removed all ${name} from inventory.`);
  } else {
    addStory(`-${qty} ${name}${qty !== 1 ? 's' : ''}`);
  }

  updateInventory();
}


// 12.3 · World Interactions
			// ── Establishment Discovery ───────────────────────────────────────────────

			function getDiscoveredEstabs(coord) {
				if (!player.discoveredEstablishments) player.discoveredEstablishments = {};
				return player.discoveredEstablishments[coord] || [];
			}

			function discoverEstablishment(coord, name, silent = false) {
				if (!player.discoveredEstablishments) player.discoveredEstablishments = {};
				if (!player.discoveredEstablishments[coord]) player.discoveredEstablishments[coord] = [];
				if (player.discoveredEstablishments[coord].includes(name)) return;
				player.discoveredEstablishments[coord].push(name);
				if (!silent) addStory(`📍 You've found: ${name}`);
				updateJournal();
				if (typeof updateTownStatusBar === 'function') updateTownStatusBar();
				saveGame();
			}

			function _getUndiscoveredEstabs() {
				const coord = player.currentLocation;
				const cell  = (typeof mapData !== 'undefined' && mapData[coord]) || {};
				const disc  = getDiscoveredEstabs(coord);
				return (cell.establishments || []).filter(e => !disc.includes(e.name));
			}

			// Add a recipe to the player's known recipes list.
			function learnRecipe(name) {
				if (!player.knownRecipes) player.knownRecipes = [];
				if (player.knownRecipes.includes(name)) return;
				player.knownRecipes.push(name);
				addStory(`📖 Learned recipe: ${name}.`);
				updateJournal();
			}

			// Record that the player now knows the name of a specific map cell.
			// silent = true suppresses the story log (used during bulk map reveals).
			function learnLocationName(coord, silent = false) {
				if (!player.knownLocations) player.knownLocations = {};
				if (player.knownLocations[coord]?.nameKnown) return;
				player.knownLocations[coord] = { nameKnown: true };
				const cell = (typeof mapData !== 'undefined' && mapData[coord]) || {};
				const name = cell.cityVillage || cell.zone;
				if (name && !player.journal.locations.find(l => l.coord === coord)) {
					player.journal.locations.push({
						name, coord,
						kingdom:     cell.kingdom     || '',
						biome:       cell.biome       || '',
						description: cell.description || ''
					});
					if (!silent) {
						const locType = cell.zone === 'CapitalCity' ? 'capital city'
						              : cell.zone === 'City'        ? 'city'
						              : cell.zone === 'Village'     ? 'village'
						              : 'location';
						addStory(`📍 Discovered a new ${locType}: ${name}!`);
						addWorldEvent(`Discovered ${name}.`, 'exploration');
						awardProfessionXp('location_discover');
						// Entering a settlement satisfies the find_village quest objective
						if (['Village','City','CapitalCity'].includes(cell.zone)) {
							checkQuestObjectives?.('village_reached');
						}
					}
					updateJournal();
				}
			}

			// Reveal an entire kingdom's map: discover all its cells and learn their names.
			// Called automatically when the player obtains a "Map of X" item.
			function learnKingdom(kingdomName, silent = false) {
				if (!player.knownKingdoms) player.knownKingdoms = {};
				if (player.knownKingdoms[kingdomName]) return;
				player.knownKingdoms[kingdomName] = true;
				let revealed = 0;
				if (typeof mapData !== 'undefined') {
					Object.entries(mapData).forEach(([coord, cell]) => {
						if (cell.kingdom !== kingdomName) return;
						if (!cell.discovered) {
							mapData[coord].discovered = true;
							revealed++;
						}
						if (cell.zone && cell.zone !== 'None' && cell.cityVillage) {
							learnLocationName(coord, true);
						}
					});
				}
				if (!silent) addStory(`🗺️ You study the map. The kingdom of ${kingdomName} and its settlements are now known to you.`);
				if (!silent) addWorldEvent(`Obtained map of ${kingdomName}.`, 'exploration');
				if (typeof setupMap === 'function') setupMap();
				updateJournal();
				updateTopStats();
				// Check if all kingdoms are now known — if so, grant the Map of Estranta
				_checkAllKingdomsRevealed();
			}

			function _checkAllKingdomsRevealed() {
				if (player.inventory?.['Map of Estranta']) return; // already has it
				if (typeof kingdoms === 'undefined' || !Array.isArray(kingdoms)) return;
				const allNames = kingdoms.map(k => k.name).filter(Boolean);
				if (!allNames.length) return;
				const known = player.knownKingdoms || {};
				if (!allNames.every(k => known[k])) return;
				// All kingdoms known — synthesise the continental map
				addItem('Map of Estranta', 1, {
					type: 'map', rarity: 'Rare', consumable: false, weight: 0.2, value: 200,
					description: 'A complete map of the continent of Estranta, assembled from every kingdom map. All lands are now known to you.',
				});
				addStory(`✨ <strong>Map of Estranta revealed.</strong> You have gathered maps of every kingdom — together they form a complete picture of the continent.`);
				addWorldEvent('Assembled the complete Map of Estranta from all kingdom maps.', 'exploration');
			}

			// Scripted tutorial bandit encounter — fires automatically after first sleep.
			// Every choice ends in failure; bandits take most of the player's gold.
			async function _tutorialBanditEncounter() {
				await waitForEnter();
				addStory('You are jolted awake by rough voices and firelight. Three armed figures stand over you.');
				await waitForEnter();
				addStory('"Don\'t move." The largest one crouches down. "Your pack is ours. Walk away and you keep your life."');
				addStory('You count three of them, all armed. There is no good way out of this.');
				await waitForEnter();

				const choice = await new Promise(resolve => {
					_buildWheel([
						{ label: 'Fight',         action: () => resolve('fight')    },
						{ label: 'Talk calmly',   action: () => resolve('calm')     },
						{ label: 'Plead',         action: () => resolve('plead')    },
						{ label: 'Threaten them', action: () => resolve('threaten') },
					]);
				});

				const outcomeLines = {
					fight:    'You swing first but are quickly disarmed and pinned. Three against one was never going to work.',
					calm:     'Your measured words don\'t move them. They take what they want anyway.',
					plead:    'Your pleas fall on deaf ears. They rifle through your belongings without a word.',
					threaten: 'Your threat draws laughter. They shove you down and help themselves to everything.',
				};
				addStory(outcomeLines[choice] || outcomeLines.calm);

				const goldTaken = Math.min(player.gold, Math.max(5, Math.floor(player.gold * 0.75)));
				player.gold = Math.max(0, player.gold - goldTaken);
				if (goldTaken > 0) addStory(`💰 They take ${goldTaken} gold from your belt.`);

				if (player.flags?.tutBowWasGiven) {
					// Bow was loaned by the tutorial — bandits take it back
					const bowKey = Object.keys(player.inventory).find(k => /bow/i.test(k) && (player.inventory[k].quantity ?? 1) > 0);
					if (bowKey) {
						Object.keys(player.equipped || {}).forEach(slot => {
							if (player.equipped[slot] === bowKey) player.equipped[slot] = null;
						});
						removeItem(bowKey, 1);
						// Also take the arrows
						const arrowKey = Object.keys(player.inventory).find(k => /arrow/i.test(k) && (player.inventory[k].quantity ?? 1) > 0);
						if (arrowKey) {
							removeItem(arrowKey, player.inventory[arrowKey]?.quantity || 1);
							addStory(`🎒 One of them eyes your bow. "This'll sell nicely." They take your ${bowKey} and quiver and disappear into the dark.`);
						} else {
							addStory(`🎒 One of them eyes your bow. "This'll sell nicely." They take your ${bowKey} and disappear into the dark.`);
						}
					}
				} else {
					// Profession bow — stays safe, random other item taken instead
					const stealableItems = Object.keys(player.inventory).filter(n => !['Bow','Hunting Bow','Shortbow','Longbow','Iron Sword','Short Sword','Sword','Cutlass'].includes(n));
					if (stealableItems.length) {
						const stolen = stealableItems[Math.floor(Math.random() * stealableItems.length)];
						removeItem(stolen, 1);
						addStory(`🎒 They grab your ${stolen} and disappear into the dark.`);
					}
				}

				updateTopStats();
				await waitForEnter();

				// Mark as talked to bandits — advances quest to find_village
				// (Don't use meetNPC — generates "You meet Bandits, a Human Bandit" which is wrong here)
				if (!player.journal.npcs) player.journal.npcs = [];
				if (!player.journal.npcs.find(n => n.name === 'Bandits')) {
					player.journal.npcs.push({ name: 'Bandits', race: 'Human', profession: 'Bandit', relationToPlayer: 'Hostile' });
				}
				checkQuestObjectives?.('npc', { npc: 'Bandits' });
				_showDefaultWheel();
			}

			// ── Tutorial Hint Engine ──────────────────────────────────────────────────
			// Shows a spotlight + tooltip over a DOM element. Resolves when dismissed.
			// opts.advance = 'click'  → also wait for element click
			// opts.advance = 'enter'  → Enter or overlay click (default)
			// opts.pulseLabel         → highlight a spoke with this label text
			async function tutorialHint(targetSel, message, opts = {}) {
				if (_tutActive) return;
				if (player.flags?.tutorialComplete) return;
				_tutActive = true;

				const overlay = document.getElementById('tut-overlay');
				const tooltip = document.getElementById('tut-tooltip');
				const msgEl   = document.getElementById('tut-msg');
				const contEl  = document.getElementById('tut-continue');
				if (!overlay || !tooltip) { _tutActive = false; return; }

				// Resolve target element — prefer pulseLabel spoke lookup
				let el = targetSel ? document.querySelector(targetSel) : null;
				if (opts.pulseLabel) {
					const spoke = Array.from(document.querySelectorAll('.spoke'))
						.find(s => (s.getAttribute('data-label') || '').includes(opts.pulseLabel)
								|| s.textContent.includes(opts.pulseLabel));
					if (spoke) el = spoke;
				}

				const PAD = 10;
				if (el) {
					const r = el.getBoundingClientRect();
					const x1 = Math.max(0, r.left  - PAD), y1 = Math.max(0, r.top    - PAD);
					const x2 = Math.min(window.innerWidth,  r.right  + PAD);
					const y2 = Math.min(window.innerHeight, r.bottom + PAD);
					const W  = window.innerWidth, H = window.innerHeight;
					// Outer rect CW, inner rect CCW — nonzero rule punches the hole
					overlay.style.clipPath =
						`path('M 0 0 H ${W} V ${H} H 0 Z ` +
						`M ${x1} ${y1} V ${y2} H ${x2} V ${y1} Z')`;

					// Separate ring element — avoids all z-index / stacking-context issues
					let ring = document.getElementById('tut-highlight');
					if (!ring) { ring = document.createElement('div'); ring.id = 'tut-highlight'; document.body.appendChild(ring); }
					ring.style.cssText =
						`position:fixed; left:${x1}px; top:${y1}px; ` +
						`width:${x2-x1}px; height:${y2-y1}px; ` +
						`border:2px solid rgba(255,210,80,0.95); border-radius:6px; ` +
						`box-shadow:0 0 0 3px rgba(255,200,60,0.25),0 0 18px rgba(255,170,30,0.55); ` +
						`z-index:9050; pointer-events:none;`;
					ring.style.display = 'block';

					// Tooltip position: prefer right of hole, else left
					const tipW = 300, tipH = 160;
					let tx = x2 + 18, ty = y1;
					if (tx + tipW > window.innerWidth - 8)  tx = x1 - tipW - 18;
					if (tx < 8) tx = 8;
					if (ty + tipH > window.innerHeight - 8) ty = window.innerHeight - tipH - 8;
					if (ty < 8) ty = 8;
					tooltip.style.cssText = `display:block; left:${tx}px; top:${ty}px; transform:none;`;
				} else {
					overlay.style.clipPath = '';
					const ring = document.getElementById('tut-highlight');
					if (ring) ring.style.display = 'none';
					tooltip.style.cssText = 'display:block; left:50%; top:38%; transform:translateX(-50%);';
				}

				const isClickMode = opts.advance === 'click';
				msgEl.innerHTML  = message;
				contEl.innerHTML = isClickMode
					? 'Click the highlighted area to continue'
					: 'Press <strong>Enter</strong> or click the dark area to continue';

				overlay.style.display = 'block';

				await new Promise(resolve => {
					const cleanup = () => {
						overlay.style.display  = 'none';
						overlay.style.clipPath = '';
						tooltip.style.display  = 'none';
						const ring = document.getElementById('tut-highlight');
						if (ring) ring.style.display = 'none';
						_tutActive = false;
						resolve();
					};

					if (isClickMode) {
						// Capture-phase blocker: swallows every click that isn't on the target.
						// This fires before any element's own handlers, so nothing else acts.
						const blockClicks = e => {
							if (!el || !el.contains(e.target)) {
								e.stopPropagation();
								e.preventDefault();
							}
						};
						const onKey = e => {
							if (e.key === 'Enter') {
								document.removeEventListener('keydown', onKey);
								document.removeEventListener('click', blockClicks, true);
								cleanup();
							}
						};
						document.addEventListener('click', blockClicks, { capture: true });
						document.addEventListener('keydown', onKey);
						if (el) {
							// Target element's own click handler fires normally (tab switch, equip, etc.)
							el.addEventListener('click', () => {
								document.removeEventListener('click', blockClicks, true);
								document.removeEventListener('keydown', onKey);
								setTimeout(cleanup, 80);
							}, { once: true });
						}
					} else {
						// Default: click dark area or press Enter to advance
						const onKey = e => { if (e.key === 'Enter') { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onDocClick); cleanup(); } };
						const onDocClick = e => {
							const ring = document.getElementById('tut-highlight');
							if (el && el.contains(e.target)) return;
							if (ring && ring.contains(e.target)) return;
							document.removeEventListener('keydown', onKey);
							document.removeEventListener('click', onDocClick);
							cleanup();
						};
						document.addEventListener('keydown', onKey);
						document.addEventListener('click', onDocClick);
						if (el) {
							el.addEventListener('click', () => {
								document.removeEventListener('keydown', onKey);
								document.removeEventListener('click', onDocClick);
								setTimeout(cleanup, 0);
							}, { once: true });
						}
					}
				});
			}

			// ── Tutorial Sequence Functions ────────────────────────────────────────────

			// Called right after startQuest('lay_of_the_land'). Runs the introductory
			// spotlight walkthrough of the UI step by step.
			async function runTutorialIntro() {
				if (player.flags?.tutorialIntroShown) return;
				if (!player.flags) player.flags = {};
				player.flags.tutorialIntroShown = true;

				// Brief pause so any Enter-key press from the preceding narrative
				// doesn't immediately dismiss the first tutorial hint.
				await new Promise(r => setTimeout(r, 500));

				// 1. Quest sidebar
				await tutorialHint(
					'#left-sidebar .pf-sb:first-child',
					'<strong>Quest Panel</strong><br>Huzzah! Your first quest! This panel shows your active quest and current objective.',
				);

				// 2. Journal tab — advance when clicked
				await tutorialHint(
					'[data-bksec="character"]',
					'<strong>Journal Tab</strong><br>Click the <em>Journal</em> tab to open your journal, where you track quests, skills, locations, and more.',
					{ advance: 'click' }
				);

				// 3. Quest Log sub-tab — advance when clicked
				await tutorialHint(
					'[data-tab="quests-tab"]',
					'<strong>Quest Log</strong><br>Click <em>Quest Log</em> to see all of your quests and their objectives.',
					{ advance: 'click' }
				);

				// 4. Quest list content
				await tutorialHint(
					'#quests-tab',
					'Here you can read every quest in detail and change which quest you are currently tracking.',
				);

				// 5. Return to Story tab
				await tutorialHint(
					'[data-bksec="story"]',
					'<strong>Story Tab</strong><br>Click <em>Story</em> to return to the main story view.',
					{ advance: 'click' }
				);

				// 6. Action wheel area
				await tutorialHint(
					'#wheel-area',
					'<strong>Action Wheel</strong><br>This is your primary way to interact with the world. Every action available to you — exploring, resting, hunting, crafting — starts here.',
				);

				// 7. Time & weather dial
				await tutorialHint(
					'#hud-datetime',
					'<strong>Time & Weather</strong><br>This dial tracks the time of day and current weather. Both affect what actions are available and how the world responds to you.<br><br>It\'s getting late. You should probably make camp for the night. You\'ll need to find a suitbale spot to set up your campsite. From the Action Wheel, choose <strong>Exploration</strong>.',
				);
			}

			// Called when _showExplorationWheel opens during tutorial objective 0
			function _tutCheckExploration() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 0) return;
				if (player.flags?.tutCampSpotHintShown) return;
				player.flags.tutCampSpotHintShown = true;
				setTimeout(async () => {
					await tutorialHint(
						'#wheel-area',
						'<strong>Find Camping Spot</strong><br>Now, select <strong>Find Camping Spot</strong> to scout a good camping spot and complete your first objective.',
						{ pulseLabel: 'Find Camping Spot' }
					);
				}, 120);
			}

			// Called from _doFindCampingSpot after a good spot is scouted — guides to Make Camp
			function _tutMakeCampHint() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 0) return;
				if (player.flags?.tutMakeCampHintShown) return;
				player.flags.tutMakeCampHintShown = true;
				setTimeout(async () => {
					await tutorialHint(
						'#wheel-area',
						'<strong>Make Camp</strong><br>You\'ve found a good spot! Now select <strong>Back</strong> to exit the Exploration wheel menu.',
					);
					await tutorialHint(
						'#hud-player-info',
						'<strong>Your Stats</strong><br>Your life, stamina, and mana are shown here — you\'re weary and hungry from your journey, so all three are low. Eating restores life and stamina; resting restores stamina and mana. Keep an eye on these as you explore.<br>Now, click <strong>Survival</strong> to set up your new campsite.',
					);
					if (!player.flags) player.flags = {};
					player.flags.tutShowSurvivalHint = true;
				}, 120);
			}

			// Called from _showSurvivalWheel during tutorial obj 0 when a spot has been scouted
			function _tutCheckSurvivalForMakeCamp() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 0) return;
				if (!player.flags?.camp_spot_scouted) return;
				if (player.flags?.tutMakeCampSpokeShown) return;
				player.flags.tutMakeCampSpokeShown = true;
				setTimeout(async () => {
					await tutorialHint(
						'#wheel-area',
						'<strong>Make Camp</strong><br>Now, Click <strong>Make Camp</strong>.',
						{ pulseLabel: 'Make Camp' }
					);
				}, 120);
			}

			// ── Hunt guidance (obj 1) ─────────────────────────────────────────────
			// Fires from _showSurvivalWheel when bow is equipped and hunt objective is active
			function _tutCheckSurvivalForHunt() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 1) return;
				const bowEquipped = /bow/i.test(player.equipped?.rightHand || '') || /bow/i.test(player.equipped?.leftHand || '');
				if (!bowEquipped) return;
				if (player.flags?.tutHuntSpokeShown) return;
				player.flags.tutHuntSpokeShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area', '<strong>Hunting</strong><br>With your bow equipped, you can now hunt for food. Click <strong>Hunt</strong> in the Survival menu to begin.', { pulseLabel: 'Hunt' });
				}, 120);
			}

			// ── Encampment guidance (obj 3, 4, 7) ────────────────────────────────
			// Fires from _showSurvivalWheel to guide player toward Encampment
			function _tutCheckSurvivalForEncampment() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst) return;
				const idx = inst.objectiveIndex;
				if (idx === 3) {
					const stones = player.campSupplies?.find(i => i.name === 'Stone')?.quantity ?? 0;
					if (stones < 8 || player.hasCampfire) return;
					if (player.flags?.tutEncampmentForFireShown) return;
					player.flags.tutEncampmentForFireShown = true;
					setTimeout(async () => {
						await tutorialHint('#wheel-area', '<strong>Encampment</strong><br>You have enough Stones to build a campfire. Choose <strong>Encampment</strong>, then <strong>Campfire</strong>.', { pulseLabel: 'Encampment' });
					}, 120);
				} else if (idx === 4) {
					if (player.flags?.tutEncampmentForCookShown) return;
					player.flags.tutEncampmentForCookShown = true;
					setTimeout(async () => {
						await tutorialHint('#wheel-area', '<strong>Encampment</strong><br>Choose <strong>Encampment</strong> to access your campfire and cook your food.', { pulseLabel: 'Encampment' });
					}, 120);
				} else if (idx === 7) {
					const sticks = player.campSupplies?.find(i => i.name === 'Stick Bundle')?.quantity ?? 0;
					if (sticks < 5) return;
					if (player.flags?.tutEncampmentForShelterShown) return;
					player.flags.tutEncampmentForShelterShown = true;
					setTimeout(async () => {
						await tutorialHint('#wheel-area', '<strong>Encampment</strong><br>You have enough Stick Bundles to build a shelter! Choose <strong>Encampment</strong> to construct your shelter.', { pulseLabel: 'Encampment' });
					}, 120);
				}
			}

			// Fires from _showSurvivalWheel when obj 7 and sticks < 5
			function _tutCheckSurvivalForGatherSticks() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 7) return;
				const sticks = player.campSupplies?.find(i => i.name === 'Stick Bundle')?.quantity ?? 0;
				if (sticks >= 5) return;
				if (player.flags?.tutGatherSticksWheelShown) return;
				player.flags.tutGatherSticksWheelShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area', `<strong>Gather Sticks</strong><br>Need ${5 - sticks} more Stick Bundle(s) for the shelter. Choose <strong>Gather</strong>.`, { pulseLabel: 'Gather' });
				}, 120);
			}

			// ── Encampment wheel guidance (obj 3, 4, 7) ──────────────────────────
			// Fires from _showCampWheel to pulse Campfire or Shelter
			function _tutCheckCampWheelForObj() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst) return;
				const idx = inst.objectiveIndex;
				if ((idx === 3 || idx === 4) && !player.flags?.tutCampWheelFireShown) {
					player.flags.tutCampWheelFireShown = true;
					setTimeout(async () => {
						await tutorialHint('#wheel-area', '<strong>Campfire</strong><br>If you\'ve got the materials, click <strong>Campfire</strong>.', { pulseLabel: 'Campfire' });
					}, 120);
				} else if (idx === 7 && !player.hasShelter && !player.flags?.tutCampWheelShelterShown) {
					player.flags.tutCampWheelShelterShown = true;
					setTimeout(async () => {
						await tutorialHint('#wheel-area', '<strong>Shelter</strong><br>Click <strong>Shelter</strong> to build your shelter.', { pulseLabel: 'Shelter' });
					}, 120);
				} else if (idx === 7 && player.hasShelter && !player.flags?.tutCampWheelSleepShown) {
					player.flags.tutCampWheelSleepShown = true;
					setTimeout(async () => {
						await tutorialHint('#wheel-area', '<strong>Shelter</strong><br>Shelter constructed! Now it\'s time to sleep and recover some strength. Click <strong>Shelter</strong>.', { pulseLabel: 'Shelter' });
					}, 120);
				}
			}

			// ── Campfire wheel guidance (obj 3) ───────────────────────────────────
			// Fires from _wheelCampfire (no-pit branch)
			function _tutCheckCampfireForBuild() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 3) return;
				if (player.flags?.tutBuildCampfireShown) return;
				player.flags.tutBuildCampfireShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area', '<strong>Build Campfire</strong><br>Click <strong>Build Campfire</strong> to lay the stone fire pit using your Stones. Once completed, click <strong>Campfire</strong> again to light it.', { pulseLabel: 'Build Campfire' });
				}, 120);
			}

			// Fires from _wheelCampfire (pit-built, unlit branch)
			function _tutCheckCampfireForLight() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 3) return;
				if (player.flags?.tutLightFireShown) return;
				player.flags.tutLightFireShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area', '<strong>Light Fire</strong><br>Fire pit built! Click <strong>Light Fire</strong> to ignite it using your Kindling and a Stick Bundle.', { pulseLabel: 'Light Fire' });
				}, 120);
			}

			// ── Cook guidance (obj 4) ─────────────────────────────────────────────
			// Fires from _wheelCampfire (fire-lit branch)
			function _tutCheckCampfireForCook() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 4) return;
				if (player.flags?.tutCookSpokeShown) return;
				player.flags.tutCookSpokeShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area', '<strong>Cook</strong><br>Click <strong>Cook</strong>!', { pulseLabel: 'Cook' });
				}, 120);
			}

			// Fires from _wheelCook
			function _tutCheckCookWheel() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 4) return;
				if (player.flags?.tutCookItemShown) return;
				player.flags.tutCookItemShown = true;
				setTimeout(async () => {
					const meatName = Object.keys(player.inventory).find(k => /^raw\s/i.test(k) && (player.inventory[k].quantity ?? 1) > 0);
					if (meatName) {
						await tutorialHint('#wheel-area', `<strong>${meatName}</strong><br>Click <strong>${meatName}</strong> to cook it over the fire.`, { pulseLabel: meatName });
					}
				}, 120);
			}

			// ── Search Area guidance (obj 6) ──────────────────────────────────────
			// Fires from _showActionsWheel
			function _tutCheckActionsForSearch() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 6) return;
				if (player.flags?.tutExploreForSearchShown) return;
				player.flags.tutExploreForSearchShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area', '<strong>Exploration</strong><br>Click <strong>Exploration</strong> to find the Search Area action.', { pulseLabel: 'Exploration' });
				}, 120);
			}

			// Fires from _showExplorationWheel
			function _tutCheckExplorationForSearch() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 6) return;
				if (player.flags?.tutSearchAreaShown) return;
				player.flags.tutSearchAreaShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area', '<strong>Search Area</strong><br>Click <strong>Search Area</strong> to scout your surroundings for threats and useful items.', { pulseLabel: 'Search Area' });
				}, 120);
			}

			// ── Gather Sticks guidance (obj 7) ────────────────────────────────────
			// Fires from _wheelGather when sticks still needed
			function _tutCheckGatherForSticks() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 7) return;
				const sticks = player.campSupplies?.find(i => i.name === 'Stick Bundle')?.quantity ?? 0;
				if (sticks >= 5) return;
				if (player.flags?.tutGatherSticksItemShown) return;
				player.flags.tutGatherSticksItemShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area', `<strong>Gather Sticks</strong><br>Click <strong>Gather Sticks</strong> to collect Stick Bundles for your shelter (need ${5 - sticks} more).`, { pulseLabel: 'Gather Sticks' });
				}, 120);
			}

			// ── Shelter wheel guidance (obj 7) ────────────────────────────────────
			// Fires from _wheelShelter
			function _tutCheckShelterWheel() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 7) return;
				if (!player.hasShelter && !player.flags?.tutBuildShelterShown) {
					player.flags.tutBuildShelterShown = true;
					setTimeout(async () => {
						await tutorialHint('#wheel-area', '<strong>Build Simple Shelter</strong><br>Click <strong>Build Simple Shelter</strong> to construct a shelter.', { pulseLabel: 'Build Simple Shelter' });
					}, 120);
				} else if (player.hasShelter && !player.flags?.tutSleepShelterShown) {
					player.flags.tutSleepShelterShown = true;
					setTimeout(async () => {
						await tutorialHint('#wheel-area', '<strong>Sleep</strong><br>Click <strong>Sleep</strong> to rest for the night.', { pulseLabel: 'Sleep' });
					}, 120);
				}
			}

			// ── Travel guidance (obj 9) ───────────────────────────────────────────
			// Fires from _showExplorationWheel — redirects player to map tab
			function _tutCheckExplorationForTravel() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 9) return;
				if (player.flags?.tutTravelSpokeShown) return;
				player.flags.tutTravelSpokeShown = true;
				setTimeout(async () => {
					await tutorialHint(
						'[data-bksec="map"]',
						'<strong>Use the Map to Travel</strong><br>You\'re going to need some gold to get by in this world. You should find a town and look for ways to earn some coin. Head to the <em>Map</em> tab — the nearest village is already selected. Click the <strong>TRAVEL</strong> button there to set off.',
						{ advance: 'click' }
					);
				}, 120);
			}

			// ── Travel button guidance (obj 9) — fires after player clicks a cell ─
			function _tutCheckMapTravelBtn() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 9) return;
				if (player.flags?.tutTravelBtnShown) return;
				player.flags.tutTravelBtnShown = true;
				setTimeout(async () => {
					await tutorialHint('#travel-to-cell', '<strong>TRAVEL</strong><br>Click the <strong>TRAVEL</strong> button to set off.');
				}, 120);
			}

			// ── Town guidance (obj 10) ────────────────────────────────────────────
			// Fires from _showActionsWheel
			function _tutCheckActionsForTown() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 10) return;
				if (player.flags?.tutTownSpokeShown) return;
				player.flags.tutTownSpokeShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area', '<strong>Town</strong><br>You\'re in a settlement. Here, you can find work to earn gold. Click <strong>Town</strong> to access local activities and Odd Jobs.', { pulseLabel: 'Town' });
				}, 120);
			}

			// Fires from _showActionsWheel after stats hint is shown — guides player to eat
			function _tutCheckActionsForSurvival() {
				if (!player.flags?.tutShowSurvivalHint) return;
				if (player.flags?.tutSurvivalEatHintShown) return;
				player.flags.tutSurvivalEatHintShown = true;
				setTimeout(async () => {
					await tutorialHint(
						'#wheel-area',
						'<strong>Survival</strong><br>You\'re hungry and your stats are low. Click <strong>Survival</strong> — from there you can eat food to restore your life and stamina.',
						{ pulseLabel: 'Survival' }
					);
				}, 120);
			}

			// Called when bow is in inventory but not equipped (step-by-step guide)
			function _tutBowEquip() {
				if (player.flags?.tutBowEquipHintShown) return;
				player.flags.tutBowEquipHintShown = true;
				setTimeout(async () => {
					// Guide to Inventory tab
					await tutorialHint(
						'[data-bksec="inventory"]',
						'<strong>Equip Your Bow</strong><br>Your bow needs to be equipped before you can hunt. Click the <em>Inventory</em> tab to view your items.',
						{ advance: 'click' }
					);
					await new Promise(r => setTimeout(r, 150));
					// Highlight the bow
					const bowName = Object.keys(player.inventory).find(k => /bow/i.test(k) && (player.inventory[k].quantity ?? 1) > 0) || 'Hunting Bow';
					await tutorialHint(
						`[data-item="${bowName}"]`,
						`<strong>Select Your ${bowName}</strong><br>Click your <strong>${bowName}</strong> to open its details.`,
						{ advance: 'click' }
					);
					await new Promise(r => setTimeout(r, 150));
					// Highlight the Equip button
					await tutorialHint(
						'.inv-action-btn[data-action="equip"]',
						'<strong>Equip the Bow</strong><br>Your item stats are displayed here. Click <em>Equip</em> to put the bow in your weapon slot.',
						{ advance: 'click' }
					);
					await new Promise(r => setTimeout(r, 150));
					// Return to Story
					await tutorialHint(
						'[data-bksec="story"]',
						'<strong>Return to Story</strong><br>Bow equipped! Click <em>Story</em> to go back and try <strong>Survival → Hunt</strong> again.',
						{ advance: 'click' }
					);
				}, 120);
			}

			// Called when stamina is too low during tutorial
			function _tutLowStamina() {
				if (player.flags?.tutStaminaHintShown) return;
				player.flags.tutStaminaHintShown = true;
				setTimeout(async () => {
					await tutorialHint(
						null,
						'<strong>Low Stamina</strong><br>You\'re too tired to continue. Go back to the Action Wheel and choose <strong>Survival → Rest</strong>. Resting restores your stamina so you can keep going. Try again once you\'ve rested.',
					);
				}, 80);
			}

			// Called from gainSkillXp when this is the very first skill entry ever added
			function _tutFirstSkill(skillName) {
				if (player.flags?.tutFirstSkillShown) return;
				if (Object.keys(player.skills || {}).length > 1) return; // already had other skills
				player.flags.tutFirstSkillShown = true;
				setTimeout(async () => {
					await tutorialHint(
						'#left-sidebar .pf-sb:nth-child(2)',
						`<strong>Skill Earned: ${skillName}!</strong><br>The <em>Skills</em> panel on the left has updated. Skills improve as you use them, granting bonuses to related checks.`,
					);
					await tutorialHint(
						'[data-tab="skills-tab"]',
						'<strong>Skills Journal</strong><br>Open the Journal → <em>Skills</em> tab to see your full skill list, XP progress, and level descriptions.',
						{ advance: 'click' }
					);
					await tutorialHint(
						'#skills-tab',
						'Each skill shows its current level and XP toward the next level. Using a skill in actions earns XP. Higher levels grant larger bonuses to rolls.',
					);
				}, 200);
			}

			// ── Water-finding tutorial callbacks (objective 2) ──────────────────────
			function _tutCheckActionsForWater() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 2) return;
				if (player.flags?.tutSurvivalSpokeShown) return;
				player.flags.tutSurvivalSpokeShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area',
						'<strong>Survival</strong><br>Great hunt! Now you should find a water source and fill up your waterskin. Staying hydrated will improve your stamina regeneration.<br>Click <strong>Survival</strong> to open the survival options.',
						{ pulseLabel: 'Survival', advance: 'click' });
				}, 120);
			}

			function _tutCheckSurvivalForWater() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 2) return;
				if (player.flags?.tutGatherSpokeShown) return;
				player.flags.tutGatherSpokeShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area',
						'<strong>Gather</strong><br>Click <strong>Gather</strong>.',
						{ pulseLabel: 'Gather', advance: 'click' });
				}, 120);
			}

			function _tutCheckGatherForWater() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 2) return;
				if (player.flags?.tutWaterSpokeShown) return;
				player.flags.tutWaterSpokeShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area',
						'<strong>Water</strong><br>Here you\'ll see all the resources you can gather. Select <strong>Water</strong>.',
						{ pulseLabel: 'Water', advance: 'click' });
				}, 120);
			}

			function _tutCheckWaterSubWheel() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 2) return;
				if (player.flags?.tutFillWaterskinShown) return;
				player.flags.tutFillWaterskinShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area',
						'<strong>Fill Waterskin</strong><br>Click <strong>Fill Waterskin</strong> to collect fresh water. Luckily, you\'re on the coast, so finding water is easy. Your location will have a significant effect on the resources you can find.',
						{ pulseLabel: 'Fill Waterskin', advance: 'click' });
				}, 120);
			}

			// ── Fire-starting tutorial callback (objective 3) ────────────────────────
			function _tutCheckGatherForFire() {
				const inst = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
				if (!inst || inst.objectiveIndex !== 3) return;
				if (player.flags?.tutFireGatherShown) return;
				player.flags.tutFireGatherShown = true;
				setTimeout(async () => {
					await tutorialHint('#wheel-area',
						'<strong>Gather Materials</strong><br>Now you\'ve got food and water. Let\'s get a fire going to cook your food!<br>To build and light a campfire you need:<br>• <strong>8 Stones</strong><br>• <strong>1 Bundle of Sticks</strong><br>• <strong>Kindling</strong><br>Luckily, you already found some supplies while setting up your camp.');
					await tutorialHint('#wheel-area',
						'<strong>Gather Materials</strong><br>If you need more supplies before building your campfire, use this menu to gather them now. When ready, select <strong>Back</strong>.');
				}, 120);
			}

			// Called from advanceQuest when tutorial objectives advance
			async function _onTutorialObjectiveAdvance(newIndex) {
				if (player.flags?.tutorialComplete) return;

				// ── Objective 1: hunt_food ────────────────────────────────────────────
				if (newIndex === 1) {
					if (!player.flags?.tutHuntHintShown) {
						player.flags.tutHuntHintShown = true;

						// Ensure every profession has a Hunting Bow + arrows for this step
						const hasBow = Object.keys(player.inventory || {}).some(k => /bow/i.test(k) && (player.inventory[k].quantity ?? 1) > 0);
						if (!hasBow) {
							addItem('Hunting Bow', 1);
							addItem('Arrow', 12);
							addStory('🏹 You find a <strong>Hunting Bow</strong> and <strong>12 Arrows</strong> among your gear.');
							player.flags.tutBowWasGiven = true; // not a profession bow — bandits will take it
						}

						await tutorialHint(
							'[data-bksec="inventory"]',
							'<strong>Equip Your Hunting Bow</strong><br>Your campsite is ready! There\'s a little time left before nightfall. You should use this time to hunt for food. Eating will restore some health and stamina.<br>Before you can hunt, you must have a bow equipped! Click the <em>Inventory</em> tab to view your items.',
							{ advance: 'click' }
						);
						await new Promise(r => setTimeout(r, 150));
						const bowName = Object.keys(player.inventory).find(k => /bow/i.test(k) && (player.inventory[k].quantity ?? 1) > 0) || 'Hunting Bow';
						await tutorialHint(
							`[data-item="${bowName}"]`,
							`<strong>Select Your ${bowName}</strong><br>Click your <strong>${bowName}</strong> to open its detail panel.`,
							{ advance: 'click' }
						);
						await new Promise(r => setTimeout(r, 150));
						await tutorialHint(
							'.inv-action-btn[data-action="equip"]',
							'<strong>Equip the Bow</strong><br>Your item stats are displayed here. Click <em>Equip</em> to slot the bow as your weapon.',
							{ advance: 'click' }
						);
						await new Promise(r => setTimeout(r, 150));
						await tutorialHint(
							'[data-bksec="story"]',
							'<strong>Return to Story</strong><br>Bow equipped! Click <em>Story</em> to go back.',
							{ advance: 'click' }
						);
						await new Promise(r => setTimeout(r, 300));
						await tutorialHint(
							'#wheel-area',
							'<strong>Hunt</strong><br>You\'re back at the Survival wheel. With your bow equipped, you\'re ready to hunt.',
							{ pulseLabel: 'Hunt' }
						);
					}

				// ── Objective 2: find_water ───────────────────────────────────────────
				// Step-by-step overlay guidance handled by _tutCheckActionsForWater,
				// _tutCheckSurvivalForWater, _tutCheckGatherForWater, _tutCheckWaterSubWheel.
				} else if (newIndex === 2) {
					// no-op: callbacks in wheel functions guide the player spoke-by-spoke

				// ── Objective 3: start_fire ───────────────────────────────────────────
				// Guided overlay handled by _tutCheckGatherForFire (fires when _wheelGather opens).
				} else if (newIndex === 3) {
					// no-op: player is at the Gather wheel; _tutCheckGatherForFire provides guidance

				// ── Objective 4: cook_food ────────────────────────────────────────────
				} else if (newIndex === 4) {
					if (!player.flags?.tutCookHintShown) {
						player.flags.tutCookHintShown = true;
						await tutorialHint(
							'#wheel-area',
							'<strong>Cook Your Food</strong><br>The fire is burning. Click <strong>Campfire</strong> to cook your food, before it goes out!.',
						);
					}

				// ── Objective 5: eat_food ─────────────────────────────────────────────
				} else if (newIndex === 5) {
					if (!player.flags?.tutEatHintShown) {
						player.flags.tutEatHintShown = true;
						await tutorialHint(
							'[data-bksec="inventory"]',
							'<strong>Eat the Food</strong><br>Your food is ready to eat! Open your <em>Inventory</em> tab to eat the food you cooked.',
							{ advance: 'click' }
						);
						await new Promise(r => setTimeout(r, 150));
						const foodName = Object.keys(player.inventory).find(k =>
							/cooked|charred|burnt|roasted|grilled/i.test(k) && (player.inventory[k].quantity ?? 1) > 0
						);
						if (foodName) {
							await tutorialHint(
								`[data-item="${foodName}"]`,
								`<strong>Select ${foodName}</strong><br>Click it to open the detail panel.`,
								{ advance: 'click' }
							);
							await new Promise(r => setTimeout(r, 150));
							await tutorialHint(
								'.inv-action-btn[data-action="use"]',
								'<strong>Eat</strong><br>Click <em>Eat</em> to consume the food.',
								{ advance: 'click' }
							);
							await new Promise(r => setTimeout(r, 150));
						}
						await tutorialHint(
							'[data-bksec="story"]',
							'<strong>Return to Story</strong><br>You\'ve restored some health and stamina! Click <em>Story</em> to continue.',
							{ advance: 'click' }
						);
					}

				// ── Objective 6: check_surroundings ──────────────────────────────────
				} else if (newIndex === 6) {
					if (!player.flags?.tutSurroundingsHintShown) {
						player.flags.tutSurroundingsHintShown = true;
						await tutorialHint(
							'#wheel-area',
							'<strong>Check Your Surroundings</strong><br>Before you sleep, it\'s wise to scout the area for danger. Choose <strong>Exploration → Search Area</strong>.',
						);
					}

				// ── Objective 7: sleep ────────────────────────────────────────────────
				} else if (newIndex === 7) {
					if (!player.flags?.tutSleepHintShown) {
						player.flags.tutSleepHintShown = true;
						const _sticks = player.campSupplies?.find(i => i.name === 'Stick Bundle')?.quantity ?? 0;
						if (_sticks < 5) {
							await tutorialHint(
								'#wheel-area',
								`<strong>Gather More Sticks</strong><br>Now you\'ll need to build a shelter to get some proper rest. You need 5 Stick Bundles to build a shelter (have ${_sticks}). Select <strong>Done Searching</strong>, then find the Survival menu.`,
							);
						} else {
							await tutorialHint(
								'#wheel-area',
								'<strong>Build a Shelter &amp; Sleep</strong><br>You\'ll rest better in a shelter. To build one, go to <strong>Survival → Encampment → Shelter → Build Simple Shelter</strong>, then <strong>Sleep</strong>.',
							);
						}
					}

				// ── Objective 9: find_village ─────────────────────────────────────────
				// (Index 8 = talk_bandits — handled automatically by _tutorialBanditEncounter)
				} else if (newIndex === 9) {
					if (!player.flags?.tutVillageHintShown) {
						player.flags.tutVillageHintShown = true;
						await tutorialHint(
							'[data-bksec="map"]',
							'<strong>Find a Village</strong><br>The bandits took your gold! You should find a village and look for work. Click the <em>Map</em> tab to plan your route.',
							{ advance: 'click' }
						);
						await new Promise(r => setTimeout(r, 400));
						// Auto-select the nearest village/city on the map
						const _tutVillageCoord = (() => {
							if (typeof mapData === 'undefined') return null;
							const m = player.currentLocation?.match(/^x(\d+)_y(\d+)$/);
							if (!m) return null;
							const fx = +m[1], fy = +m[2];
							let best = null, bestDist = Infinity;
							for (const [k, c] of Object.entries(mapData)) {
								if (!['Village','City','CapitalCity'].includes(c.zone || '')) continue;
								const km = k.match(/^x(\d+)_y(\d+)$/);
								if (!km) continue;
								const dist = Math.hypot(+km[1] - fx, +km[2] - fy);
								if (dist < bestDist) { bestDist = dist; best = k; }
							}
							return best;
						})();
						if (_tutVillageCoord) {
							selectedCellKey = _tutVillageCoord;
							if (typeof setupMap === 'function') setupMap();
						}
						const _tutVillageName = (_tutVillageCoord && mapData?.[_tutVillageCoord]?.cityVillage) || 'nearest settlement';
						await tutorialHint(
							'#map-canvas',
							`<strong>Click the Village</strong><br><em>${_tutVillageName}</em> is highlighted on the map. Click it to select it — a Travel button will appear below the map.`,
						);
					}

				// ── Objective 10: find_work ───────────────────────────────────────────
				} else if (newIndex === 10) {
					if (!player.flags?.tutWorkHintShown) {
						player.flags.tutWorkHintShown = true;
						await tutorialHint(
							'#wheel-area',
							'<strong>Find Work</strong><br>You\'ve reached a settlement. In the Town menu, choose <strong>Activities</strong> to access local activities, then select <strong>Work</strong> to look for <em>Odd Jobs</em>, or you can speak with villagers to find paid work and earn back some coin.',
						);
					}

				// ── Objective 11: complete_job — fires immediately after job payment ─
				} else if (newIndex === 11) {
					// job_done fires in the same tick as work_found, so this completes immediately
				}
			}

			function visitLocation(name) {
				if (!player.journal.locations.find(l => l.name === name)) {
					player.journal.locations.push({
						name,
						description: 'New area.'
					});
					addStory(`Visited ${name}.`);
				} else addStory(`Revisited ${name}.`);
				updateTopStats();
			}

	// ============================================================
// SECTION 12.6 · WORLD NPC SYSTEM
// ============================================================

// Importance levels:
//  1 Noticed   — name seen, lightweight record only
//  2 Met       — spoke to; profession, relationship tracked
//  3 Known     — quest/trade/repeat contact; status ticked, activity log
//  4 Significant — strong relationship; every tick, can feed rumors
//  5 Story     — named quest characters; always active

const IMPORTANCE_LABELS = ['', 'Noticed', 'Met', 'Known', 'Significant', 'Story'];

// ── Utility ──────────────────────────────────────────────────────────────────

function _locationName(coord) {
  if (!coord) return 'an unknown location';
  const cell = (typeof mapData !== 'undefined' && mapData[coord]) || {};
  return cell.cityVillage || cell.biome || coord;
}

function _getRelLabel(val) {
  if (val >=  4) return 'Ally';
  if (val >=  2) return 'Friendly';
  if (val >= -1) return 'Neutral';
  if (val >= -3) return 'Wary';
  return 'Hostile';
}

// ── Kingdom Reputation ────────────────────────────────────────────────────────

const REP_TIERS = [
  { min:  60, label: 'Exalted',    icon: '✨', cls: 'rep-exalted'    },
  { min:  30, label: 'Honored',    icon: '🌟', cls: 'rep-honored'    },
  { min:  10, label: 'Friendly',   icon: '🤝', cls: 'rep-friendly'   },
  { min:  -9, label: 'Neutral',    icon: '⚖️', cls: 'rep-neutral'    },
  { min: -29, label: 'Unfriendly', icon: '😤', cls: 'rep-unfriendly' },
  { min: -59, label: 'Hostile',    icon: '⚔️', cls: 'rep-hostile'    },
  { min: -100,label: 'Outlaw',     icon: '💀', cls: 'rep-outlaw'     },
];

function getRepTier(score) {
  return REP_TIERS.find(t => score >= t.min) || REP_TIERS[REP_TIERS.length - 1];
}

function changeKingdomReputation(kingdom, delta) {
  if (!kingdom || !delta) return;
  if (!player.kingdomReputation) player.kingdomReputation = {};
  const prev  = player.kingdomReputation[kingdom] ?? 0;
  const next  = Math.max(-100, Math.min(100, prev + delta));
  player.kingdomReputation[kingdom] = next;
  const prevTier = getRepTier(prev).label;
  const nextTier = getRepTier(next).label;
  if (prevTier !== nextTier) {
    addStory(`⚖️ Your standing in <strong>${kingdom}</strong> is now <em>${nextTier}</em>.`);
    addWorldEvent(`Reputation in ${kingdom} changed to ${nextTier}.`, 'kingdom');
  }
  // Positive player actions raise prosperity/stability; negative raise crime/lower stability
  if (delta > 0) {
    changeKingdomStat(kingdom, 'prosperity', Math.max(1, Math.ceil(delta * 0.12)));
    changeKingdomStat(kingdom, 'stability',  Math.max(1, Math.ceil(delta * 0.06)));
  } else {
    changeKingdomStat(kingdom, 'stability', Math.min(-1, Math.floor(delta * 0.10)));
    changeKingdomStat(kingdom, 'crime',     Math.max(1, Math.ceil(Math.abs(delta) * 0.06)));
  }
  updateJournal();
}

function getKingdomRepScore(kingdom) {
  return (player.kingdomReputation || {})[kingdom] ?? 0;
}

function getKingdomRepTier(kingdom) {
  return getRepTier(getKingdomRepScore(kingdom));
}

// ============================================================
// KINGDOM STATS SYSTEM
// All values hidden from player; visible only in dev mode.
// ============================================================

const KINGDOM_STAT_DEFAULTS = {
  prosperity: 60,
  happiness:  65,
  stability:  70,
  military:   50,
  crime:      25,
  trade:      55,
  population: 180,  // thousands
};

const KINGDOM_BASELINES = {
  'Ardrenhold': { military: 72, prosperity: 65, stability: 75, population: 280 },
  'Dwynbroch':  { military: 78, trade: 68, happiness: 58, prosperity: 62, population: 160 },
  'Brythwen':   { trade: 65, prosperity: 68, happiness: 70, population: 210 },
  'Nithrond':   { military: 60, stability: 60, population: 140 },
  'Sivanrift':  { military: 38, prosperity: 52, crime: 35, population: 90 },
  'Naradreth':  { stability: 55, trade: 60, population: 120 },
  'Feldarún':   { stability: 52, crime: 38, prosperity: 50, population: 200 },
  'Wistravael': { stability: 88, happiness: 78, crime: 10, military: 42, population: 170 },
  'Orindroth':  { military: 65, trade: 62, prosperity: 58, population: 250 },
  'Rendarost':  { prosperity: 42, stability: 44, crime: 42, military: 58, population: 130 },
};

function getKingdomStats(name) {
  if (!player.kingdomStats) player.kingdomStats = {};
  if (!player.kingdomStats[name]) {
    const base    = { ...KINGDOM_STAT_DEFAULTS };
    const overlay = KINGDOM_BASELINES[name] || {};
    player.kingdomStats[name] = { ...base, ...overlay, fallen: false };
  }
  return player.kingdomStats[name];
}

function changeKingdomStat(name, stat, delta) {
  if (!name || !stat || !delta) return;
  const s = getKingdomStats(name);
  if (stat === 'population') {
    s.population = Math.max(0, s.population + delta);
  } else {
    s[stat] = Math.max(0, Math.min(100, (s[stat] ?? KINGDOM_STAT_DEFAULTS[stat] ?? 50) + delta));
  }
  // Kingdom fall condition
  if (!s.fallen && s.prosperity <= 0 && s.stability <= 5 && s.happiness <= 10) {
    s.fallen = true;
    addStory(`💀 <strong>${name}</strong> has collapsed. Its institutions have crumbled and its people have fled.`);
    addWorldEvent(`The kingdom of ${name} has fallen.`, 'kingdom');
    updateJournal?.();
  }
}

function driftKingdomStats(name) {
  if (!name) return;
  const s = getKingdomStats(name);
  if (s.fallen) return;
  // Happiness slowly tracks (prosperity×0.6 + stability×0.4)
  const happTarget = Math.round(s.prosperity * 0.6 + s.stability * 0.4);
  if (s.happiness < happTarget - 2) s.happiness = Math.min(100, s.happiness + 1);
  else if (s.happiness > happTarget + 2) s.happiness = Math.max(0, s.happiness - 1);
  // High crime slowly erodes stability
  if (s.crime > 55) s.stability = Math.max(0, s.stability - 1);
  // Low stability slowly erodes prosperity
  if (s.stability < 30) s.prosperity = Math.max(0, s.prosperity - 1);
  // Low prosperity slowly shrinks population
  if (s.prosperity < 20 && s.population > 10) s.population = Math.max(10, s.population - 1);
}

function getKingdomCondition(name) {
  const s = getKingdomStats(name);
  if (s.fallen) return { label: 'Fallen',     icon: '💀', color: '#5a0000', level: 0 };
  const avg = Math.round((s.prosperity + s.happiness + s.stability) / 3);
  if (avg >= 78) return { label: 'Thriving',   icon: '🌟', color: '#2a7a20', level: 5 };
  if (avg >= 62) return { label: 'Stable',     icon: '⚖️',  color: '#4a7a30', level: 4 };
  if (avg >= 46) return { label: 'Struggling', icon: '😟', color: '#8a7020', level: 3 };
  if (avg >= 28) return { label: 'Declining',  icon: '📉', color: '#8a4020', level: 2 };
                 return { label: 'Collapsing', icon: '🔥', color: '#aa2010', level: 1 };
}

function getNpcKingdomOpinion(npc, kingdomName) {
  if (!kingdomName) return '"Hard to say — I haven\'t been keeping up with the news."';
  const s    = getKingdomStats(kingdomName);
  const cond = getKingdomCondition(kingdomName);
  const prof = (npc?.profession || '').toLowerCase();

  if (s.fallen) return `"${kingdomName}? Gone. Nothing left but ash and grief."`;

  const isMerchant = /merchant|trader|vendor|shopkeep|innkeep|tavernkeep|brewer|jeweller|tanner/i.test(prof);
  const isGuard    = /guard|soldier|knight|militia|captain|warden|ranger/i.test(prof);
  const isFarmer   = /farmer|shepherd|miller|fisher|woodcut|herbalist|brewer/i.test(prof);
  const isScholar  = /scholar|sage|priest|healer|alchemist|scribe|bard|loremaster|archivist|historian/i.test(prof);
  const isCriminal = /thief|rogue|smuggler|bandit|fence|cutpurse/i.test(prof);

  const openers = {
    5: [`"Things are good in ${kingdomName}, can't complain."`, `"${kingdomName} is flourishing — long may it last."`, `"It's a good time to be here in ${kingdomName}."`],
    4: [`"${kingdomName} holds together well enough."`, `"Steady as it goes in ${kingdomName}, all things considered."`, `"No great troubles in ${kingdomName} at the moment."`],
    3: [`"Times are harder than they used to be in ${kingdomName}."`, `"${kingdomName}'s seen better days, if I'm honest."`, `"People are managing, but there's worry in the air."`],
    2: [`"${kingdomName} is in a bad way. People are struggling."`, `"I fear for ${kingdomName}. Things are going from bad to worse."`, `"There's a darkness settling over ${kingdomName}."`],
    1: [`"${kingdomName} is on the edge of collapse. I pray it holds."`, `"Something has to change in ${kingdomName}, or it won't survive."`, `"The foundations of ${kingdomName} are rotting. You can feel it."`],
  };
  const opener = (openers[cond.level] || openers[3])[Math.floor(Math.random() * 3)];

  let detail = '';
  if (isMerchant) {
    if (s.trade >= 68)      detail = '"Trade\'s been brisk — caravans are moving well."';
    else if (s.trade >= 45) detail = '"Business is steady but nothing remarkable."';
    else                    detail = '"Markets are thin. Buyers scarce, coin even scarcer."';
  } else if (isGuard) {
    if (s.military >= 70)   detail = '"The garrison is strong. Threats don\'t linger here long."';
    else if (s.military >= 45) detail = '"We manage, but we\'re stretched thin some days."';
    else                    detail = '"The defenses are a joke. I worry what next season will bring."';
    if (s.crime >= 58)      detail += ' "And crime\'s getting bolder. Makes the job twice as hard."';
  } else if (isFarmer) {
    if (s.prosperity >= 65) detail = '"Harvest\'s been decent. Bellies are full."';
    else if (s.prosperity >= 40) detail = '"We get by. Taxes are heavy but the fields still give."';
    else                    detail = '"Folk are going hungry. The land feels cursed lately."';
  } else if (isScholar) {
    if (s.stability >= 72)  detail = '"There\'s order here — the laws hold, at least. That counts for much."';
    else if (s.stability >= 46) detail = '"Stability is fraying at the edges. Worrying signs."';
    else                    detail = '"The institutions have rotted. This kingdom stumbles toward disaster."';
  } else if (isCriminal) {
    if (s.crime >= 58)      detail = '"Plenty of opportunity these days, if you know where to look."';
    else                    detail = '"Guards have been cracking down. Harder times for certain... trades."';
  } else {
    if (s.happiness >= 70)  detail = '"Most folk are content enough. Can\'t ask for more than that."';
    else if (s.happiness >= 45) detail = '"People manage, but there\'s an undercurrent of worry."';
    else                    detail = '"Morale is low. You can feel the despair walking the streets."';
  }

  return `${opener}${detail ? ' ' + detail : ''}`;
}

function getDevKingdomStatsHtml() {
  if (!developerMode) return '';
  const allKingdoms = typeof kingdoms !== 'undefined' ? kingdoms.map(k => k.name) : Object.keys(player.kingdomStats || {});
  if (!allKingdoms.length) return '';
  const rows = allKingdoms.map(name => {
    const s    = getKingdomStats(name);
    const cond = getKingdomCondition(name);
    const bar  = v => `<span class="dev-stat-bar" style="width:${v}%;background:${v>=65?'#3a8':'#a43'}"></span>`;
    return `<div class="dev-kingdom-row">
      <span class="dev-k-name" style="color:${cond.color}">${cond.icon} ${name}</span>
      <span class="dev-k-cond">${cond.label}</span>
      <div class="dev-k-stats">
        <span>Pros <div class="dev-stat-track">${bar(s.prosperity)}</div>${s.prosperity}</span>
        <span>Happ <div class="dev-stat-track">${bar(s.happiness)}</div>${s.happiness}</span>
        <span>Stab <div class="dev-stat-track">${bar(s.stability)}</div>${s.stability}</span>
        <span>Mil  <div class="dev-stat-track">${bar(s.military)}</div>${s.military}</span>
        <span>Crim <div class="dev-stat-track">${bar(s.crime)}</div>${s.crime}</span>
        <span>Trad <div class="dev-stat-track">${bar(s.trade)}</div>${s.trade}</span>
        <span>Pop  ${s.population}k${s.fallen ? ' 💀' : ''}</span>
      </div>
    </div>`;
  }).join('');
  return `<li class="journal-section-header dev-only">⚙ Kingdom Stats (Dev)</li>
    <li class="dev-kingdom-stats">${rows}</li>`;
}

function getWorldNPCByName(name) {
  if (!name) return null;
  return Object.values(worldNPCs.registry).find(r => r.name === name) || null;
}

function _npcWorldLog(entry) {
  worldNPCs.eventLog.unshift(`[T${worldNPCs.currentTurn}] ${entry}`);
  if (worldNPCs.eventLog.length > 50) worldNPCs.eventLog.length = 50;
}

function _npcActivityLog(rec, entry) {
  if (!rec.activityLog) rec.activityLog = [];
  rec.activityLog.unshift(`[T${worldNPCs.currentTurn}] ${entry}`);
  if (rec.activityLog.length > 5) rec.activityLog.length = 5;
  _npcWorldLog(`${rec.name}: ${entry}`);
}

function _addNPCRumor(rec) {
  const lines = {
    travelling: `${rec.name} was seen leaving town recently.`,
    in_trouble: `Word is ${rec.name} has run into some trouble.`,
    prospering: `${rec.name} seems to be doing very well for themselves.`,
    missing:    `Nobody around here can say where ${rec.name} has gone.`,
  };
  const line = lines[rec.status];
  if (!line) return;
  worldNPCs.npcRumors.unshift(line);
  if (worldNPCs.npcRumors.length > 10) worldNPCs.npcRumors.length = 10;
}

function _pruneWorldNPCs() {
  const entries = Object.entries(worldNPCs.registry);
  if (entries.length < 500) return;
  const stale = entries
    .filter(([, r]) => r.importance <= 1 && (worldNPCs.currentTurn - (r.lastSeenTurn || 0)) > 100)
    .sort(([, a], [, b]) => (a.lastSeenTurn || 0) - (b.lastSeenTurn || 0))
    .slice(0, 50);
  stale.forEach(([id]) => delete worldNPCs.registry[id]);
  if (developerMode && stale.length) _npcWorldLog(`Pruned ${stale.length} dormant records`);
}

// ── Registration & Importance ─────────────────────────────────────────────────

function registerNPC(npcData, minImportance = 1) {
  if (!npcData?.name) return null;

  const existing = getWorldNPCByName(npcData.name);
  if (existing) {
    existing.lastLocation = player.currentLocation;
    existing.lastSeenTurn = worldNPCs.currentTurn;
    if (minImportance > existing.importance) bumpImportance(existing.id, 'importance raised', minImportance);
    npcData._worldId = existing.id;
    return existing.id;
  }

  const id = 'npc_' + (worldNPCs.nextId++);
  const rec = {
    id,
    name:         npcData.name,
    race:         npcData.race || '?',
    importance:   Math.max(1, minImportance),
    lastLocation: player.currentLocation,
    lastSeenTurn: worldNPCs.currentTurn,
  };

  if (minImportance >= 2) {
    rec.profession        = npcData.profession || '';
    rec.morality          = npcData.morality   || 'Neutral';
    rec.relationship      = 0;
    rec.conversationCount = 1;
  }
  if (minImportance >= 3) {
    rec.homeLocation = player.currentLocation;
    rec.status       = 'active';
    rec.activityLog  = [];
    rec.traits       = Array.isArray(npcData.traits) ? npcData.traits : [];
    _npcActivityLog(rec, `Met player at ${_locationName(player.currentLocation)}`);
  }

  _pruneWorldNPCs();
  worldNPCs.registry[id] = rec;
  npcData._worldId = id;
  if (developerMode) _npcWorldLog(`${rec.name} (${rec.race}) registered [I${rec.importance}]`);
  return id;
}

function bumpImportance(id, reason, newLevel) {
  const rec = worldNPCs.registry[id];
  if (!rec || newLevel <= rec.importance) return;

  const old = rec.importance;
  rec.importance = newLevel;

  if (newLevel >= 2 && old < 2) {
    rec.profession        = rec.profession   || '';
    rec.relationship      = rec.relationship ?? 0;
    rec.conversationCount = (rec.conversationCount || 0) + 1;
  }
  if (newLevel >= 3 && old < 3) {
    rec.homeLocation = rec.homeLocation || player.currentLocation;
    rec.status       = rec.status       || 'active';
    rec.activityLog  = rec.activityLog  || [];
    rec.traits       = rec.traits       || [];
    _npcActivityLog(rec, reason);
  }
  if (newLevel >= 4 && old < 4) {
    rec.flags             = rec.flags || {};
    rec.relationshipLabel = _getRelLabel(rec.relationship || 0);
  }

  if (developerMode) _npcWorldLog(`${rec.name} I${old}→I${newLevel} (${reason})`);
}

// ── Tick System ───────────────────────────────────────────────────────────────

const _NPC_TRANSITIONS = {
  active:     [['travelling', 0.04], ['in_trouble', 0.02], ['prospering', 0.03]],
  travelling: [['active',     0.30], ['in_trouble', 0.03]],
  in_trouble: [['active',     0.15], ['missing',    0.02]],
  prospering: [['active',     0.10]],
  missing:    [['active',     0.04]],
};

const _NPC_STATUS_MSG = {
  travelling: r => `Left ${_locationName(r.lastLocation)} — whereabouts unknown`,
  in_trouble: () => `Was seen in difficult circumstances`,
  prospering: () => `Business is going well`,
  active:     r => `Settled in ${_locationName(r.lastLocation)}`,
  missing:    () => `Disappeared without explanation`,
};

function tickWorldNPCs() {
  worldNPCs.currentTurn++;
  for (const rec of Object.values(worldNPCs.registry)) {
    if (rec.importance < 3) continue;
    const chance = rec.importance === 3 ? 0.20 : rec.importance === 4 ? 0.60 : 1.0;
    if (Math.random() > chance) continue;
    const transitions = _NPC_TRANSITIONS[rec.status || 'active'] || _NPC_TRANSITIONS.active;
    let r = Math.random();
    for (const [newStatus, prob] of transitions) {
      if (r < prob) {
        rec.status = newStatus;
        _npcActivityLog(rec, (_NPC_STATUS_MSG[newStatus] || (() => newStatus))(rec));
        if (rec.importance >= 4) _addNPCRumor(rec);
        break;
      }
      r -= prob;
    }
  }
}

// ── Re-encounter System ───────────────────────────────────────────────────────

function rollReencounters() {
  const coord = player.currentLocation;
  const cell  = (typeof mapData !== 'undefined' && mapData[coord]) || {};
  if (!['City', 'CapitalCity', 'Village'].includes(cell.zone || '')) return false;

  const candidates = Object.values(worldNPCs.registry).filter(r =>
    r.importance >= 2 &&
    r.status !== 'missing' && r.status !== 'dead' &&
    !(r.lastLocation === coord && r.lastSeenTurn === worldNPCs.currentTurn)
  );

  for (const rec of candidates) {
    if (Math.random() < _reencounterProb(rec, coord, cell)) {
      _triggerReencounter(rec);
      return true;
    }
  }
  return false;
}

function _reencounterProb(rec, coord, cell) {
  const importanceMod = rec.importance / 5;
  const lastCell      = (typeof mapData !== 'undefined' && mapData[rec.lastLocation]) || {};
  const proximityMod  =
    rec.lastLocation === coord                                ? 0.80 :
    lastCell.kingdom && lastCell.kingdom === cell.kingdom     ? 0.35 : 0.08;
  const turnsSince = worldNPCs.currentTurn - (rec.lastSeenTurn || 0);
  const timeMod    = Math.min(2.0, 1 + turnsSince * 0.02);
  return Math.min(0.75, 0.05 * importanceMod * proximityMod * timeMod);
}

function _triggerReencounter(rec) {
  addStory(`👤 A familiar face — ${rec.name}, the ${rec.race}${rec.profession ? ' ' + rec.profession : ''} you encountered at ${_locationName(rec.lastLocation)}.`);
  rec.lastLocation = player.currentLocation;
  rec.lastSeenTurn = worldNPCs.currentTurn;
  if (rec.importance >= 3) _npcActivityLog(rec, `Re-encountered by player at ${_locationName(player.currentLocation)}`);
  if (rec.importance < 3)  bumpImportance(rec.id, 're-encountered', 3);

  _buildWheel([
    { label: '👋 Approach',  action: () => { _wheelStack.push(_showDefaultWheel); _showReencounterWheel(rec); } },
    { label: 'Nod and pass', action: () => { addStory('You give a brief nod and move on.'); _showDefaultWheel(); } },
    { label: 'Avoid them',   action: () => { addStory('You slip past without being noticed.'); _showDefaultWheel(); } },
    { label: '← Continue',  action: _showDefaultWheel, isBack: true },
  ], rec.name);
}

function _showReencounterWheel(rec) {
  const rel = rec.relationship || 0;
  addStory(`${rec.name} ${rel > 1 ? 'brightens when they see you' : rel < -1 ? 'eyes you warily' : 'acknowledges your approach'}.`);
  addStory(`Relation: <em>${_getRelLabel(rel)}</em>`);
  if (rec.activityLog?.[0]) addStory(`You recall: ${rec.activityLog[0].replace(/\[T\d+\] /, '')}.`);

  const inParty    = (player.party || []).some(m => m.worldId === rec.id || m.name === rec.name);
  const npcStub    = { name: rec.name, race: rec.race, profession: rec.profession, _worldId: rec.id, interactionCount: 1, disposition: 0, revealedTraits: rec.traits || [], description: '' };
  const assess     = typeof _recruitAssessment === 'function' ? _recruitAssessment(npcStub, rec) : null;

  const reencounterOpts = [
    { label: 'Malicious', action: () => _reencounterTone(rec, 'Malicious', -2) },
    { label: 'Neutral',   action: () => _reencounterTone(rec, 'Neutral',    0) },
    { label: 'Valiant',   action: () => _reencounterTone(rec, 'Valiant',   +1) },
    { label: 'Heroic',    action: () => _reencounterTone(rec, 'Heroic',    +2) },
  ];

  if (rel >= 2 && !inParty) {
    reencounterOpts.push({ label: '🤝 Offer Friendship', action: () => _doOfferFriendship(npcStub, rec) });
  }
  if (assess && !inParty && assess.contractType !== 'none') {
    const joinLabel = assess.contractType === 'mercenary'
      ? `💰 Hire (${_hireCost(npcStub, rec)}g)`
      : (assess.possible ? '⚔️ Ask to Join' : `⚔️ Ask to Join (${_getRelLabel(rel)})`);
    reencounterOpts.push({ label: joinLabel, action: () => _doAskToJoin(npcStub, rec), disabled: !assess.possible });
  }
  if ((player.party || []).length > 0) {
    reencounterOpts.push({ label: '🏕️ Party', action: () => { _wheelStack.push(() => _showReencounterWheel(rec)); _showManagePartyWheel(); } });
  }

  reencounterOpts.push({ label: '← Back', action: _goBack, isBack: true });
  _buildWheel(reencounterOpts, rec.name);
}

function _reencounterTone(rec, tone, delta) {
  rec.relationship      = Math.max(-5, Math.min(5, (rec.relationship || 0) + delta));
  rec.conversationCount = (rec.conversationCount || 1) + 1;
  if (rec.conversationCount >= 3 && rec.importance < 3)  bumpImportance(rec.id, 'repeated contact', 3);
  if (Math.abs(rec.relationship) >= 4 && rec.importance < 4) bumpImportance(rec.id, 'strong relationship', 4);
  addStory(`> [${tone}] — ${rec.name} (${_getRelLabel(rec.relationship)})`);
  if (rec.importance >= 3) _npcActivityLog(rec, `Interaction — tone: ${tone}`);
  _showDefaultWheel();
}

// ── Dev Display ───────────────────────────────────────────────────────────────

function _devShowNPCs() {
  const reg    = worldNPCs.registry;
  const total  = Object.keys(reg).length;
  const counts = [0, 0, 0, 0, 0, 0];
  Object.values(reg).forEach(r => { if (r.importance <= 5) counts[r.importance]++; });
  addStory(`[Dev] World NPCs: ${total} | Turn: ${worldNPCs.currentTurn}`);
  addStory(`[Dev] I1:${counts[1]} I2:${counts[2]} I3:${counts[3]} I4:${counts[4]} I5:${counts[5]}`);
  (worldNPCs.eventLog || []).slice(0, 8).forEach(e => addStory(`  ${e}`));
}

		function meetNPC(npc) {
				if (!npc || !npc.name) return;
				registerNPC(npc, 1); // minimum: noticed
				if (!player.journal.npcs) player.journal.npcs = [];
				const existing = player.journal.npcs.find(n => n.name === npc.name);
				if (!existing) {
					player.journal.npcs.push(npc);
					addStory(`You meet ${npc.name}, a ${npc.race || ''} ${npc.profession || 'stranger'}.`.replace(/\s+/g,' '));
					addWorldEvent(`Met ${npc.name} in ${player.currentLocation}.`, 'npc');
				} else {
					addStory(`You encounter ${npc.name} again.`);
				}
				checkQuestObjectives?.('npc', { npc: npc.name });
				updateJournal();
				updateTopStats();
			}

// ── Quest Engine ──────────────────────────────────────────────────────────────

			// Rebuild player.questMarkers from the tracked quest's current objective.
			function _rebuildQuestMarkers() {
				player.questMarkers = [];
				const tid = player.trackedQuest;
				if (!tid) { if (typeof setupMap === 'function') setupMap(); return; }
				const inst = getActiveQuestInstance?.(tid);
				if (!inst) { player.trackedQuest = null; if (typeof setupMap === 'function') setupMap(); return; }
				const def = getQuestDef?.(tid);
				const obj = def?.objectives?.[inst.objectiveIndex];
				const c   = obj?.completion;
				if (c?.type === 'location' && c.location) {
					const target = c.location.toLowerCase();
					for (const [key, cell] of Object.entries(typeof mapData !== 'undefined' ? mapData : {})) {
						const name = (cell.cityVillage || '').toLowerCase();
						const zone = (cell.zone || '').toLowerCase();
						if (name.includes(target) || key.toLowerCase().includes(target) || zone.includes(target)) {
							player.questMarkers.push(key);
						}
					}
				}
				if (typeof setupMap === 'function') setupMap();
			}

			// Toggle tracking for a quest (one at a time). Exposed globally for inline onclick.
			function trackQuest(questId) {
				player.trackedQuest = player.trackedQuest === questId ? null : questId;
				_rebuildQuestMarkers();
				updateJournal();
				const def = getQuestDef?.(questId);
				if (player.trackedQuest) {
					addStory(`📌 Now tracking: <strong>${def?.name || questId}</strong>`);
				} else {
					addStory('📌 Quest tracking cleared.');
				}
			}
			window.trackQuest = trackQuest;

			function getQuestDef(id) {
				return (typeof quests !== 'undefined' ? quests : []).find(q => q.id === id) || null;
			}

			function getActiveQuestInstance(id) {
				return (player.journal.quests || []).find(q => q.id === id && q.status === 'Active') || null;
			}

			// silent = true when the offer UI already printed description/objective (avoids double-print).
			function startQuest(questId, silent = false) {
				const def = getQuestDef(questId);
				if (!def) { console.warn(`Quest "${questId}" not found.`); return; }
				if (!player.journal.quests) player.journal.quests = [];
				if (player.journal.quests.find(q => q.id === questId)) return;
				player.journal.quests.push({ id: questId, title: def.name, status: 'Active', objectiveIndex: 0, branchId: null, flags: {} });
				if (!silent) {
					addStory(`📜 New Quest: ${def.name}`);
					if (def.description) addStory(def.description);
					if (def.objectives?.[0]) addStory(`→ ${def.objectives[0].text}`);
				}
				addWorldEvent(`Started quest: ${def.name}`, 'quest');
				// Auto-track first quest accepted if nothing is tracked
				if (!player.trackedQuest) {
					player.trackedQuest = questId;
					_rebuildQuestMarkers();
				}
				updateJournal();
				saveGame(true);
			}

			function setQuestFlag(questId, key, value = true) {
				const inst = getActiveQuestInstance(questId);
				if (inst) inst.flags[key] = value;
				checkQuestObjectives(key, { questId, key, value });
			}

			// Heuristic fallback for ai_judgment objectives.
			function checkAiHeuristic(obj, triggerType) {
				const desc = ((obj.completion?.description || '') + ' ' + (obj.hint || '')).toLowerCase();
				if (desc.includes('raw meat') || desc.includes('hunted') || desc.includes('game in inventory'))
					return Object.keys(player.inventory).some(n => /^raw /i.test(n));
				if (desc.includes('cooked food') || desc.includes('cooked meal') || desc.includes('cooked over'))
					return Object.keys(player.inventory).some(n => /^(cooked|perfectly|well-cooked|hunter|berry stew|mushroom)/i.test(n));
				if (desc.includes('hungry') || desc.includes('nourished'))
					return !(player.conditions || []).some(c => c.id === 'hungry') || (player.conditions || []).some(c => c.id === 'well_fed');
				if (desc.includes('village') || desc.includes('settlement') || desc.includes('arrived at')) {
					const cell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
					return ['Village','City','CapitalCity'].includes(cell.zone || '');
				}
				return false;
			}

			function isObjectiveComplete(obj, instance, triggerType, data) {
				const c = obj.completion;
				switch (c.type) {
					case 'hasItem':
						return getItemQty(c.item) >= (c.qty || 1);
					case 'location': {
						const coord    = player.currentLocation;
						const cell     = (typeof mapData !== 'undefined' && mapData[coord]) || {};
						const known    = player.knownLocations?.[coord]?.nameKnown ? (cell.cityVillage || '').toLowerCase() : '';
						const target   = (c.location || '').toLowerCase();
						return coord.toLowerCase().includes(target) || known.includes(target) || (cell.zone || '').toLowerCase().includes(target);
					}
					case 'slept':
						return triggerType === 'slept';
					case 'flag':
						if (instance.flags[c.key] === c.value) return true;
						if (triggerType === c.key) { instance.flags[c.key] = true; return true; }
						return false;
					case 'talkedTo':
						return instance.flags[`talked_${(c.npc || '').replace(/\s+/g,'_').toLowerCase()}`] === true ||
						       (triggerType === 'npc' && (data?.npc || '').toLowerCase() === (c.npc || '').toLowerCase());
					case 'defeated':
						return instance.flags[`defeated_${(c.target || c.npc || '').replace(/\s+/g,'_').toLowerCase()}`] === true;
					case 'crafted':
						return instance.flags[`crafted_${(c.item||'').replace(/\s+/g,'_').toLowerCase()}`] === true ||
						       (triggerType === 'crafted' && (data?.item||'').toLowerCase() === (c.item||'').toLowerCase());
					case 'skillUsed':
						return !!player.skills?.[c.skill] || (triggerType === 'skill' && data?.skill === c.skill);
					case 'delivered':
						return instance.flags[`delivered_${(c.npc||'').replace(/\s+/g,'_').toLowerCase()}`] === true;
					case 'choiceMade':
						return instance.branchId !== null && instance.branchId !== undefined;
					case 'ai_judgment':
						return checkAiHeuristic(obj, triggerType);
					default:
						return false;
				}
			}

			function applyOnComplete(onComplete, instance) {
				if (!onComplete) return;
				const oc = onComplete;
				if (oc.setFlag)       instance.flags[oc.setFlag.key] = oc.setFlag.value;
				if (oc.setPlayerFlag) { if (!player.flags) player.flags = {}; player.flags[oc.setPlayerFlag.key] = oc.setPlayerFlag.value; }
				if (oc.giveItem) {
					const g = oc.giveItem;
					const n = g.displayName || g.name || g.questItem;
					if (n) addItem(n, g.qty || 1, { type: g.itemType || 'misc', rarity: g.rarity || 'Common', consumable: g.consumable || false, weight: g.weight || 0.1, description: g.description || '' });
				}
				if (oc.removeItem) removeItem(oc.removeItem.name, oc.removeItem.qty || 1);
				if (oc.startQuest)  startQuest(oc.startQuest);
			}

			function _getActiveBranch(instance, def) {
				if (!instance.branchId) return null;
				for (const obj of def.objectives) {
					if (obj.type === 'choose' && obj.branches) {
						const b = obj.branches.find(b => b.id === instance.branchId);
						if (b) return b;
					}
				}
				return null;
			}

			function _showBranchChoice(instance, def, chooseObj) {
				addStory(`⚔️ ${chooseObj.text}`);
				_buildWheel([
					...chooseObj.branches.slice(0, 6).map(branch => ({
						label: branch.text.length > 22 ? branch.text.slice(0, 20) + '…' : branch.text,
						action: () => {
							instance.branchId = branch.id;
							instance.branchObjectiveIndex = 0;
							addStory(`📌 Path chosen: ${branch.text}`);
							if (branch.objectives?.[0]) addStory(`→ ${branch.objectives[0].text}`);
							updateJournal();
						}
					})),
				], 'Choose Path');
			}

			function advanceQuest(instance, def) {
				const branch = _getActiveBranch(instance, def);

				if (branch) {
					const idx  = instance.branchObjectiveIndex ?? 0;
					const done = branch.objectives?.[idx];
					if (done) addStory(`✅ ${done.text}`);
					instance.branchObjectiveIndex = idx + 1;
					if (!branch.objectives?.[instance.branchObjectiveIndex]) {
						completeQuest(instance, def, branch);
					} else {
						addStory(`→ ${branch.objectives[instance.branchObjectiveIndex].text}`);
						updateJournal();
					}
				} else {
					const completed = def.objectives[instance.objectiveIndex];
					addStory(`✅ ${completed.text}`);
					instance.objectiveIndex++;
					if (instance.objectiveIndex >= def.objectives.length) {
						completeQuest(instance, def);
					} else {
						const next = def.objectives[instance.objectiveIndex];
						if (next?.type === 'choose') {
							_showBranchChoice(instance, def, next);
						} else {
							addStory(`→ ${next.text}`);
							updateJournal();
						}
						// Refresh map markers if this is the tracked quest
						if (player.trackedQuest === instance.id) _rebuildQuestMarkers();
						// Tutorial objective hook
						if (instance.id === 'lay_of_the_land' && typeof _onTutorialObjectiveAdvance === 'function') {
							_onTutorialObjectiveAdvance(instance.objectiveIndex);
						}
					}
				}
			}

			function _awardTutorialStarterKit() {
				const _pick = arr => arr[Math.floor(Math.random() * arr.length)];

				// Always awarded
				addItem('Inn Token', 1, {
					type: 'misc', rarity: 'Common', consumable: true, weight: 0,
					description: 'A stamped token from the local inn. Redeemable for one free night\'s lodging and a meal.',
					value: 5,
				});
				addItem('Rations', 3);

				// Pool A — practical supplies (pick 2 of 5, no repeats)
				const poolA = [
					['Torch', 4],
					['Rope', 2],
					['Bandage', 3],
					['Candle', 5],
					['Waterskin', 1],
				];
				const _shuffleA = [...poolA].sort(() => Math.random() - 0.5);
				_shuffleA.slice(0, 2).forEach(([n, q]) => addItem(n, q));

				// Pool B — bonus item (pick 1 of 5)
				const [bonusName, bonusQty] = _pick([
					['Health Potion', 1],
					['Herb Pouch', 1],
					['Compass', 1],
					['Belt Knife', 1],
					['Hunting Knife', 1],
				]);
				addItem(bonusName, bonusQty);

				// Narrate the reward
				addStory(`🎒 The locals send you off with a bundle of supplies — a good start for the road ahead.`);
			}

			function completeQuest(instance, def, branch = null) {
				instance.status = 'Completed';
				if (instance.id === 'lay_of_the_land') {
					if (!player.flags) player.flags = {};
					player.flags.tutorialComplete = true;
					_awardTutorialStarterKit();
				}
				// Clear tracking if this was the tracked quest
				if (player.trackedQuest === instance.id) {
					player.trackedQuest = null;
					_rebuildQuestMarkers();
				}
				addStory(`🏆 Quest Complete: ${def.name}!`);
				addWorldEvent(`Completed quest: ${def.name}.`, 'quest');
				checkGlobalEventTriggers();
				awardProfessionXp('quest_complete');
				if (!player.traitCounters) player.traitCounters = {};
				player.traitCounters.questsCompleted = (player.traitCounters.questsCompleted || 0) + 1;
				if (player.currentKingdom) changeKingdomStat(player.currentKingdom, 'prosperity', 3);
				const r = branch?.rewards || def.rewards || {};
				if (r.experience) gainExperience(r.experience);
				if (r.gold) { player.gold = (player.gold || 0) + r.gold; updateTopStats(); addStory(`+ ${r.gold} gold.`); }
				(r.items || []).forEach(item => {
					const name = item.displayName || item.name || item.questItem;
					if (name) addItem(name, item.qty || 1, { type: item.itemType || 'misc', rarity: item.rarity || 'Common', consumable: item.consumable || false, weight: item.weight || 0.1, description: item.description || '' });
				});
				if (r.skills) Object.entries(r.skills).forEach(([sk, xp]) => gainSkillXp(sk, Math.min(5, Math.max(1, xp))));
				(r.special || []).forEach(s => {
					if (s.type === 'skill_unlock' && s.skill) learnSkill(s.skill);
					if (s.type === 'recipe'       && s.name)  learnRecipe(s.name);
					if (s.type === 'flag')    { if (!player.flags) player.flags = {}; player.flags[s.key] = s.value; }
					if (s.type === 'morality' && s.value)    changeMorality(s.value);
					if (s.type === 'title'        && s.value) awardGameTitle?.(s.value);
					if (s.type === 'reputation'   && s.kingdom && s.value) changeKingdomReputation(s.kingdom, s.value);
				});
				// Award reputation in the current kingdom for completing a quest
				if (player.currentKingdom) changeKingdomReputation(player.currentKingdom, 8);
				checkAchievementTitles?.();
				checkTraitUnlocks?.();
				updateJournal();
			}

			function checkQuestObjectives(triggerType, data) {
				if (!player.journal?.quests) return;
				const active = player.journal.quests.filter(q => q.status === 'Active');
				for (const instance of active) {
					const def = getQuestDef(instance.id);
					if (!def) continue;
					let obj;
					const branch = _getActiveBranch(instance, def);
					if (branch) {
						obj = branch.objectives?.[instance.branchObjectiveIndex ?? 0];
					} else {
						obj = def.objectives?.[instance.objectiveIndex];
					}
					if (!obj) continue;
					if (isObjectiveComplete(obj, instance, triggerType, data || {})) {
						applyOnComplete(obj.onComplete, instance);
						advanceQuest(instance, def);
						break;
					}
				}
			}

			const TIME_PERIODS = [
				'🌅 Early Morning',
				'🌄 Mid-Morning',
				'☀️ Morning',
				'🌞 Midday',
				'🌤️ Afternoon',
				'⛅ Mid-Afternoon',
				'🌇 Late Afternoon',
				'🌆 Evening',
				'🌃 Mid-Evening',
				'🌙 Dusk',
				'🌑 Night',
				'⭐ Late Night',
			];

			// Periods that are "night" for establishment gating
			const NIGHT_PERIODS = new Set(['🌑 Night', '⭐ Late Night']);
			// Periods considered "late" (cold risk, reduced visibility)
			const LATE_PERIODS  = new Set(['🌇 Late Afternoon', '🌆 Evening', '🌃 Mid-Evening', '🌙 Dusk', '🌑 Night', '⭐ Late Night']);

			function isNightTime()  { return NIGHT_PERIODS.has(player.timeOfDay); }
			function isLateTime()   { return LATE_PERIODS.has(player.timeOfDay);  }

			// Landmark periods that always announce (others announce only if not silent)
			const LANDMARK_PERIODS = new Set(['🌅 Early Morning', '🌞 Midday', '🌆 Evening', '🌑 Night']);

			function updateTimeOfDay(silent = false) {
				const idx      = TIME_PERIODS.indexOf(player.timeOfDay);
				const nextIdx  = (idx === -1 ? 0 : idx + 1) % TIME_PERIODS.length;
				const wasLate  = TIME_PERIODS[idx] === '⭐ Late Night';
				player.timeOfDay = TIME_PERIODS[nextIdx];
				if (wasLate) player.day = (player.day || 1) + 1;
				// Advance weather every ~3 time periods (landmark periods always eligible)
				if (!silent || LANDMARK_PERIODS.has(player.timeOfDay)) {
					if (typeof advanceWeather === 'function' && Math.random() < 0.35) advanceWeather();
				}
				tickConditions(silent);
				updateTopStats();
				if (!silent || LANDMARK_PERIODS.has(player.timeOfDay)) {
					addStory(`🕐 ${player.timeOfDay}`);
				}
			}

			// Advance n periods; only the final period announces
			function advanceTime(n = 1) {
				for (let i = 0; i < n - 1; i++) updateTimeOfDay(true);
				updateTimeOfDay(false);
			}

// 12.4 · Quick Slots

function getItemQty(name) {
  const inv = (player.inventory?.[name]?.quantity || 0);
  const herb = player.pouchContents?.herb?.[name] || 0;
  const ing  = player.pouchContents?.ingredient?.[name] || 0;
  return inv + herb + ing;
}

function _getItemIcon(name) {
  const dbItem = findItemInDatabase?.(name);
  if (dbItem?.icon) return dbItem.icon;
  const known = itemIcons?.[name];
  if (known) return `images/icons/${known}`;
  if (/^Recipe:/i.test(name)) return 'images/icons/poneti/misc/parchment.png';
  // Cooked items: strip condition prefix and try "Raw <base>" then "<base>"
  const baseName = getCleanBaseItemName(name);
  if (baseName !== name) {
    const rawDb = findItemInDatabase?.(`Raw ${baseName}`);
    if (rawDb?.icon) return rawDb.icon;
    const baseDb = findItemInDatabase?.(baseName);
    if (baseDb?.icon) return baseDb.icon;
    const knownBase = itemIcons?.[`Raw ${baseName}`] || itemIcons?.[baseName];
    if (knownBase) return `images/icons/${knownBase}`;
  }
  return `images/icons/${name.replace(/\s+/g, '_').toLowerCase()}.png`;
}

function _isAmmoItem(name) {
  const d = player.inventory[name] || {};
  const db = (typeof findItemInDatabase === 'function' && findItemInDatabase(name)) || {};
  const type = d.type || db.type || '';
  return type === 'ammo' || name === 'Arrow';
}

function _updateInvSidebar() {
  // Quiver
  const arrowCount = Object.entries(player.inventory || {})
    .filter(([n]) => _isAmmoItem(n))
    .reduce((sum, [, d]) => sum + (d.quantity || 0), 0);
  const qImg = document.getElementById('inv-sb-quiver-img');
  if (qImg) qImg.src = arrowCount > 0
    ? 'images/icons/poneti/weapons/common/all/quiver_with_arrows.png'
    : 'images/icons/poneti/weapons/common/all/quiver_empty.png';
  const arrowEl = document.getElementById('inv-sb-arrow-count');
  if (arrowEl) arrowEl.textContent = arrowCount === 1 ? '1 arrow' : `${arrowCount} arrows`;

  // Pack — count of non-ammo items (excluding pouch containers themselves from count)
  const _pouchNames = new Set(['Herb Pouch','Herb Pouch (Large)','Ingredient Pouch','Ingredient Pouch (Large)','Coin Pouch','Coin Pouch (Large)']);
  const packCount = Object.keys(player.inventory || {}).filter(n => !_isAmmoItem(n) && !_pouchNames.has(n)).length;
  const packEl = document.getElementById('inv-sb-item-count');
  if (packEl) packEl.textContent = packCount === 1 ? '1 item' : `${packCount} items`;

  // Coin pouch
  const hasLargePouch = !!(player.activePouches?.coin === 'Coin Pouch (Large)' || player.inventory?.['Coin Pouch (Large)']);
  const goldCap = hasLargePouch ? '∞' : '200';
  const goldDisplay = Math.min(player.gold || 0, hasLargePouch ? Infinity : 200);
  const pouchEl = document.getElementById('inv-sb-gold');
  if (pouchEl) pouchEl.textContent = `${goldDisplay}/${goldCap}`;

  // Herb pouch widget
  const herbWidget = document.getElementById('inv-sb-herb-pouch');
  if (herbWidget) {
    const hasHerb = _hasHerbPouch();
    herbWidget.style.display = hasHerb ? '' : 'none';
    if (hasHerb) {
      const herbCount = Object.keys(player.pouchContents?.herb || {}).length;
      const herbImg = document.getElementById('inv-sb-herb-pouch-img');
      if (herbImg) herbImg.src = (player.activePouches?.herb === 'Herb Pouch (Large)' || player.inventory?.['Herb Pouch (Large)'])
        ? 'images/icons/poneti/containers/herb_pouch_large.png'
        : 'images/icons/poneti/containers/herb_pouch_small.png';
      const herbEl = document.getElementById('inv-sb-herb-count');
      if (herbEl) herbEl.textContent = herbCount === 1 ? '1 herb' : `${herbCount} herbs`;
      herbWidget.style.cursor = 'pointer';
      herbWidget.onclick = () => { _invView = 'herb_pouch'; updateInventory(); };
    }
  }

  // Ingredient pouch widget
  const ingWidget = document.getElementById('inv-sb-ingredient-pouch');
  if (ingWidget) {
    const hasIng = _hasIngredientPouch();
    ingWidget.style.display = hasIng ? '' : 'none';
    if (hasIng) {
      const ingCount = Object.keys(player.pouchContents?.ingredient || {}).length;
      const ingImg = document.getElementById('inv-sb-ingredient-pouch-img');
      if (ingImg) ingImg.src = (player.activePouches?.ingredient === 'Ingredient Pouch (Large)' || player.inventory?.['Ingredient Pouch (Large)'])
        ? 'images/icons/poneti/containers/ingredient_pouch_large.png'
        : 'images/icons/poneti/containers/ingredient_pouch_small.png';
      const ingEl = document.getElementById('inv-sb-ingredient-count');
      if (ingEl) ingEl.textContent = ingCount === 1 ? '1 item' : `${ingCount} items`;
      ingWidget.style.cursor = 'pointer';
      ingWidget.onclick = () => { _invView = 'ingredient_pouch'; updateInventory(); };
    }
  }

  // Maps
  renderMapsPanel();
}

function _markDiscovered(coord) {
  if (mapData?.[coord]) mapData[coord].discovered = true;
  if (!player.discoveredCells) player.discoveredCells = {};
  player.discoveredCells[coord] = true;
}

function _getEquipSlot(name, type) {
  const n = name.toLowerCase();
  if (type === 'weapon') return 'rightHand';
  if (/pendant|necklace|amulet|medallion/i.test(n))               return 'pendant';
  if (/compass/i.test(n))                                          return 'leftHand';
  if (/boot|shoe|footwear/i.test(n))                              return 'footwear';
  if (/helm|hat|hood|coif|cap|headwear/i.test(n))                 return 'headwear';
  if (/pant|leg|trouser|skirt/i.test(n))                          return 'legwear';
  if (/glove|bracer|gauntlet|armwear/i.test(n))                   return 'armwear';
  if (/cloak|cape|shoulder/i.test(n))                             return 'shoulderwear';
  return 'torsoLayer1';
}

function renderQuickSlots() {
  const container = document.getElementById('quick-slots');
  if (!container) return;
  if (!player.quickSlots) player.quickSlots = Array(10).fill(null);

  Array.from(container.querySelectorAll('.quick-slot')).forEach((slot, i) => {
    const name = player.quickSlots[i] ?? null;
    const keyLabel = i === 9 ? '0' : String(i + 1);

    slot.innerHTML = '';
    slot.classList.toggle('empty', !name);
    slot.draggable = !!name;
    slot.title = name
      ? `${name}${player.inventory[name] ? ` (${player.inventory[name].quantity})` : ''}\nKey: ${keyLabel}`
      : `Slot ${keyLabel} — empty`;

    const badge = document.createElement('span');
    badge.className = 'qs-key';
    badge.textContent = keyLabel;
    slot.appendChild(badge);

    if (name) {
      const img = document.createElement('img');
      img.className = 'qs-icon';
      img.alt = name;
      img.src = _getItemIcon(name);
      img.onerror = () => {
        img.remove();
        const lbl = document.createElement('span');
        lbl.className = 'qs-label';
        lbl.textContent = name.length > 8 ? name.slice(0, 7) + '…' : name;
        slot.appendChild(lbl);
      };
      slot.appendChild(img);
    }
  });
}

function useQuickSlot(index) {
  if (!player.quickSlots) return;
  const name = player.quickSlots[index];
  if (!name) return;
  const item = player.inventory[name];
  if (!item || (item.quantity ?? 0) < 1) {
    addStory(`⚠️ ${name} is no longer in your inventory.`);
    player.quickSlots[index] = null;
    renderQuickSlots();
    return;
  }
  if (item.type === 'food' || item.type === 'potion') {
    eatItem(name);
    renderQuickSlots();
  } else if (['weapon','armor','clothing','tool'].includes(item.type)) {
    const slotKey = item.slot || (item.type === 'weapon' ? 'rightHand' : null);
    if (slotKey) {
      Object.keys(player.equipped).filter(s => player.equipped[s] === name).forEach(s => { player.equipped[s] = null; });
      player.equipped[slotKey] = name;
      addStory(`🗡️ You ready your ${name}.`);
      updateInventory();
    } else {
      addStory(`📦 ${name} — ${item.description || 'no special use from here.'}`);
    }
  } else {
    addStory(`📦 ${name} — ${item.description || 'no special use from here.'}`);
  }
}

function initializeQuickSlots() {
  const c = document.getElementById('quick-slots');
  c.innerHTML = '';
  if (!player.quickSlots) player.quickSlots = Array(10).fill(null);

  for (let i = 0; i < 10; i++) {
    const slot = document.createElement('div');
    slot.className = 'quick-slot empty';
    slot.dataset.slotIndex = i;
    c.appendChild(slot);

    slot.addEventListener('click', () => useQuickSlot(i));

    slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('qs-drag-over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('qs-drag-over'));

    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('qs-drag-over');
      const fromSlotRaw = e.dataTransfer.getData('qs-from-slot');
      const itemName    = e.dataTransfer.getData('item-name');
      if (fromSlotRaw !== '') {
        const fromIdx = parseInt(fromSlotRaw);
        const tmp = player.quickSlots[fromIdx];
        player.quickSlots[fromIdx] = player.quickSlots[i];
        player.quickSlots[i] = tmp;
      } else if (itemName) {
        player.quickSlots[i] = itemName;
      }
      renderQuickSlots();
    });

    slot.addEventListener('dragstart', e => {
      if (!player.quickSlots[i]) { e.preventDefault(); return; }
      e.dataTransfer.setData('qs-from-slot', String(i));
      e.dataTransfer.setData('item-name', player.quickSlots[i]);
    });
  }

  renderQuickSlots();
}

// 12.5 · Biome Colors
const biomeColors = {
				Forest: 'rgba(34,139,34,0.5)',
				Mountain: 'rgba(139,137,137,0.5)',
				Hills: 'rgba(205,133,63,0.5)',
				Wetlands: 'rgba(70,130,180,0.5)',
				Coastal: 'rgba(135,206,235,0.5)',
				Ocean: 'rgba(0,105,148,0.5)',
				River: 'rgba(30,144,255,0.5)',
				Plains: 'rgba(154,205,50,0.5)',
				Lake: 'rgba(65,105,225,0.5)',
				Tundra: 'rgba(176,196,222,0.5)',
				None: 'rgba(0,0,0,0.1)'
			};

			const biomeBtn = document.getElementById('biome-mode-button');
			const biomeSel = document.getElementById('biome-select');

			biomeBtn.onclick = () => {
				biomeMode = !biomeMode;
				biomeSel.style.display = biomeMode ? 'inline-block' : 'none';
				biomeBtn.textContent = biomeMode ? 'Exit Biome Editor' : 'Biome Editor Mode';
			};

// 12.6 · Map Editor Toggle Buttons
const modeBtn = document.getElementById('border-mode-button');

			const kingdomSelect = document.getElementById('kingdom-select');
			kingdomSelect.onchange = e => {
				selectedKingdom = e.target.value;
				selectedBorderColor = kingdomColors[selectedKingdom];
			};

			const toggleBtn = document.getElementById('toggle-borders-button');
			toggleBtn.addEventListener('click', () => {
				bordersVisible = !bordersVisible;
				toggleBtn.textContent = bordersVisible ? 'Hide Borders' : 'Show Borders';
				// redraw the map canvas
				setupMap();
			});

			const iconBtn = document.getElementById('toggle-icons-button');
			iconBtn.addEventListener('click', () => {
				iconsVisible = !iconsVisible;
				iconBtn.textContent = iconsVisible ?
					'Hide Icons' :
					'Show Icons';
				setupMap();
			});

// 12.7 · Border List UI
			function updateBorderList() {
				const listEl = document.getElementById('border-list');
				if (!listEl) return;

				// 1) all keys (for unselected):
				const allKeys = [];
				for (let x = 0; x <= mapCanvas.width - GRID_SIZE; x += GRID_SIZE) {
					for (let y = 0; y <= mapCanvas.height - GRID_SIZE; y += GRID_SIZE) {
						allKeys.push(`x${x}_y${y}`);
					}
				}

				// 2) separate selected/unselected
				const selectedEntries = Object.entries(borderSelections);
				const selectedKeys = selectedEntries.map(([k]) => k);
				const unselectedKeys = allKeys.filter(k => !borderSelections[k]);

				// 3) group selected by color
				const byColor = {};
				selectedEntries.forEach(([key, color]) => {
					(byColor[color] = byColor[color] || []).push(key);
				});

				// 4) build HTML
				let html = '';

				if (selectedKeys.length) {
					html += '<strong>Selected by Color:</strong><br>';
					for (const [color, keys] of Object.entries(byColor)) {
						// little swatch + color label
						html += `
        <div style="margin-top:8px">
          <span 
            style="
              display:inline-block;
              vertical-align:middle;
              width:12px;height:12px;
              background:${color};
              border:1px solid #000;
              margin-right:6px;
            ">
          </span>
          <strong>${color} (${keys.length}):</strong>
        </div>`;
						// list the coords
						html += keys
							.map(k => `<div style="margin-left:20px;">${k}</div>`)
							.join('');
					}
				} else {
					html += `<strong>No grids selected</strong><br>`;
				}

				html += `<hr><strong>Unselected (${unselectedKeys.length}):</strong><br>`;
				html += unselectedKeys
					.map(k => `<div style="margin-left:10px;">${k}</div>`)
					.join('');

				listEl.innerHTML = html;
			}

			// toggle mode on/off
			modeBtn.onclick = () => {
				borderMode = !borderMode;
				modeBtn.textContent = borderMode ?
					'Exit Border Selection' :
					'Border Selection Mode';
				kingdomSelect.style.display = borderMode ? 'inline-block' : 'none';

				updateBorderList();

			};

// 12.8 · Discovery
			function checkDiscovery() {
  const m = player.currentLocation.match(/^x(\d+)_y(\d+)$/);
  if (!m) return;

  const px = +m[1], py = +m[2];
  let found = false;

  Object.entries(mapData).forEach(([key, cell]) => {
    /* ignore already-discovered cells */
    if (cell.discovered) {
      delete cell.nearby;          // just in case it lingered
      return;
    }

    /* skip truly empty tiles (no reason to draw !) */
    const hasContent =
      cell.zone ||
      (cell.establishments && cell.establishments.length) ||
      (cell.pointsOfInterest && cell.pointsOfInterest.length);

    if (!hasContent) {                // blank square → never mark as nearby
      delete cell.nearby;
      return;
    }

    const match = key.match(/^x(\d+)_y(\d+)$/);
    if (!match) return;
    const kx = +match[1], ky = +match[2];

    /* within one GRID square?  → flag as nearby */
    if (Math.abs(kx - px) <= GRID_SIZE && Math.abs(ky - py) <= GRID_SIZE) {
      cell.nearby = true;
    							console.log('🔎 Nearby undiscovered cell:', key);
      found = true;
    } else {
      /* moved out of range → clear old ! flag */
      delete cell.nearby;
    }
  });

  if (found) pulseD20(3);
}

			

			// Mark a cell discovered when the player actually moves onto it
			function revealDiscovery(coord) {
				if (mapData[coord] && !mapData[coord].discovered) {
					_markDiscovered(coord);
					addStory(`You discovered ${coord}!`);
					setupMap();
				}
			}

// ── Travel Engine ─────────────────────────────────────────────────────────────

// Apply an effects array from randomEvents.js to the player.
function applyEventEffects(effects = []) {
  for (const fx of effects) {
    switch (fx.type) {
      case 'life':       changeLife(fx.amount); break;
      case 'stamina':    changeStamina(fx.amount); break;
      case 'gold':       player.gold = Math.max(0, (player.gold || 0) + fx.amount); updateTopStats(); break;
      case 'item':       addItem(fx.name, fx.qty || 1, fx.options || {}); break;
      case 'removeItem': removeItem(fx.name, fx.qty || 1); break;
      case 'experience': gainExperience(fx.amount); break;
      case 'skill':      learnSkill(fx.name); break;
      case 'status':     applyCondition(fx.value); break;
      case 'weather':    player.weather = fx.value; updateTopStats(); addStory(`The weather shifts to ${fx.value}.`); break;
      case 'kingdomRep': {
        const _k = fx.kingdom || player.currentKingdom;
        if (_k) changeKingdomReputation(_k, fx.amount);
        break;
      }
      case 'morality': if (typeof changeMorality === 'function') changeMorality(fx.amount); break;
      case 'lore':     if (typeof learnLore === 'function') learnLore(fx.id, fx.source || 'site'); break;
      case 'setFlag':  if (!player.flags) player.flags = {}; player.flags[fx.key] = fx.value; break;
      case 'cutscene':
        if (fx.id === 'aruvari_revelation') setTimeout(() => _playAruvariRevelation(), 800);
        break;
      case 'robbery': {
        const _stolen = Math.min(fx.max || 999, Math.floor((player.gold || 0) * (fx.fraction || 0.25)));
        if (_stolen > 0) {
          player.gold = Math.max(0, (player.gold || 0) - _stolen);
          if (!player.flags) player.flags = {};
          player.flags.recentRobbery = { amount: _stolen, location: player.currentLocation, time: player.timeOfDay };
          updateTopStats?.();
          addStory(`💸 You lose ${_stolen} gold.`);
          changeHope(-3, 'robbed');
          if (player.currentKingdom) changeKingdomStat(player.currentKingdom, 'crime', 2);
        }
        break;
      }
      case 'questSeed':
        addWorldEvent(`Quest opportunity: ${fx.description || ''}`, 'kingdom');
        // Flag the seed so resolveRandomEvent can offer a generated quest after the event
        if (!applyEventEffects._pendingSeed) applyEventEffects._pendingSeed = fx;
        break;
    }
  }
}

// Resolve a single random event (simple or choice-based).
async function resolveRandomEvent(event) {
  addStory(`⚠️ ${event.name}`);
  addStory(event.narrative);

  // Merchant encounters bypass the normal choice flow
  if (event.type === 'merchant_encounter') {
    _openTravellingMerchant(event);
    return;
  }

  // Clear any pending seed from a previous event
  applyEventEffects._pendingSeed = null;

  if (event.simple) {
    applyEventEffects(event.simple.effects || []);
    if (event.simple.storyText) addStory(event.simple.storyText);
  }

  if (event.choice) {
    addStory(event.choice.prompt);
    const chosen = await new Promise(resolve => {
      _buildWheel(event.choice.options.slice(0, 7).map(opt => ({
        label: opt.text.length > 22 ? opt.text.slice(0, 20) + '…' : opt.text,
        action: () => resolve(opt),
      })));
    });

    // Merchant encounters open the travelling shop
    if (event.type === 'merchant_encounter') {
      _openTravellingMerchant(event);
      return;
    }

    // Creature encounters with a 'fight' option launch the full combat system
    if (event.type === 'creature_encounter' && chosen.id === 'fight') {
      const enemyType = EVENT_ENEMY_MAP[event.id] || event.name;
      startCombat(enemyType);
      return; // combat handles its own wheel from here
    }

    _buildWheel([{ label: '⏳ Resolving…', action: () => {} }]);
    let outcome;
    if (chosen.skillCheck) {
      const roll    = Math.floor(Math.random() * 20) + 1
                    + getSkillBonus(chosen.skillCheck.skill)
                    + getConditionModifier(chosen.skillCheck.skill);
      const success = roll >= chosen.skillCheck.difficulty;
      gainSkillXp(chosen.skillCheck.skill, success ? 4 : 2);
      addStory(`🎲 ${chosen.skillCheck.skill} check (DC ${chosen.skillCheck.difficulty}): ${roll} — ${success ? 'Success' : 'Failure'}`);
      outcome = success ? chosen.onSuccess : chosen.onFailure;
    } else {
      outcome = chosen.onSuccess;
    }
    if (outcome.storyText) addStory(outcome.storyText);
    applyEventEffects(outcome.effects || []);
  }

  // If a questSeed effect fired during this event, generate and offer the quest
  const seed = applyEventEffects._pendingSeed;
  applyEventEffects._pendingSeed = null;
  if (seed && typeof QuestGenerator !== 'undefined') {
    const cell     = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
    const seedQuest = QuestGenerator.generateSeedQuest(seed, cell.kingdom || player.currentKingdom, cell.biome, player.level);
    addStory(`🗺️ This looks like it could lead somewhere...`);
    await showQuestOffer(seedQuest, 'event');
    _showDefaultWheel();
  }
}

// Pick and fire a context-appropriate random event from randomEvents.js.
// context    — string key (e.g. 'travel','camp','hunt','forage','tavern','town','search')
//              Events with a `contexts` whitelist only fire when context is in that list.
//              Events with no `contexts` field are eligible in any context.
// allowedTypes — optional array of event type strings to restrict the eligible pool.
async function fireRandomEvent(context = 'travel', allowedTypes = null) {
  if (typeof randomEvents === 'undefined' || !randomEvents.length) return;
  // Suppress random events while the tutorial quest is running
  const _tutQ = typeof getActiveQuestInstance === 'function' ? getActiveQuestInstance('lay_of_the_land') : null;
  if (_tutQ && _tutQ.status === 'Active') return;
  const cell = mapData[player.currentLocation] || {};
  const _firedEvs = player.worldState?.firedEvents || [];
  const eligible = randomEvents.filter(e => {
    if (e.once && _firedEvs.includes(e.id))                                   return false;
    if (allowedTypes && !allowedTypes.includes(e.type))                       return false;
    if (e.contexts   && !e.contexts.includes(context))                        return false;
    const t = e.trigger || {};
    if (t.biomes    && cell.biome    && !t.biomes.includes(cell.biome))       return false;
    if (t.timeOfDay && !t.timeOfDay.includes(player.timeOfDay))               return false;
    if (t.weather   && !t.weather.includes(player.weather))                   return false;
    if (t.kingdoms  && cell.kingdom  && !t.kingdoms.includes(cell.kingdom))   return false;
    if ((t.minLevel || 1) > player.level)                                     return false;
    if (t.requiredFlags) {
      const _fl = player.flags || {};
      for (const [k, v] of Object.entries(t.requiredFlags)) { if (_fl[k] !== v) return false; }
    }
    if (t.excludeFlags) {
      const _fl = player.flags || {};
      for (const [k, v] of Object.entries(t.excludeFlags)) { if (_fl[k] === v) return false; }
    }
    if (t.requiredLore) {
      const _known = new Set((player.learnedLore || []).map(e => e.id));
      if (!_known.has(t.requiredLore)) return false;
    }
    if (t.requiredEquipped && !Object.values(player.equipped || {}).includes(t.requiredEquipped)) return false;
    return true;
  });
  if (!eligible.length) return;
  // Listener's Compass — boosts discovery and mystical event weight when equipped
  const _hasCompass = player.equipped?.leftHand === "Listener's Compass";
  const _eventWeight = e => {
    let w = e.weight || 1;
    if (_hasCompass && (e.type === 'discovery' || e.type === 'mystical')) w *= 2;
    return w;
  };
  // Weighted random selection
  const totalWeight = eligible.reduce((s, e) => s + _eventWeight(e), 0);
  let rand = Math.random() * totalWeight;
  let picked = eligible[eligible.length - 1];
  for (const e of eligible) { rand -= _eventWeight(e); if (rand <= 0) { picked = e; break; } }
  await resolveRandomEvent(picked);
  if (picked.once) { _wsInit(); if (!player.worldState.firedEvents.includes(picked.id)) player.worldState.firedEvents.push(picked.id); }
}

// Full async travel sequence. Called after the player confirms a journey.
const TRAVEL_DEPARTURE = {
  Grassland: ['You follow a worn path through rolling meadows.', 'The open grassland stretches ahead, dotted with wildflowers.', 'A gentle breeze carries the smell of earth and grass.'],
  Forest:    ['The trees close in as you leave the clearing behind.', 'You push into the treeline, boots crunching on fallen leaves.', 'The canopy thickens above you, blocking the sky.'],
  Mountains: ['The path winds upward, loose stones skittering underfoot.', 'A cold wind descends from the peaks as you begin to climb.', 'The mountain looms. You tighten your pack and set out.'],
  Desert:    ['The sand shifts underfoot as you leave shelter behind.', 'The heat presses down immediately. You cover your face and walk.', 'Sun bleaches the ground white. Every step stirs a puff of dust.'],
  Tundra:    ['Frozen ground crunches underfoot. The cold is immediate.', 'A grey wind scours the flats as you head out.', 'The world ahead is pale and empty. You pull your cloak tight.'],
  Coastal:   ['Salt air fills your lungs as you follow the shoreline.', 'Waves crash somewhere below the cliffs to your left.', 'The coast road is quiet. Only the sound of the sea for company.'],
  River:     ['You follow the riverbank, the water murmuring beside you.', 'A ford crossing slows you — you wade carefully through.', 'The river glints in the light as you walk its edge.'],
  Wetlands:  ['The ground grows soft and treacherous underfoot.', 'Mud sucks at your boots with every step.', 'Reeds whisper around you. Strange birds call in the distance.'],
  Cave:      ['Daylight fades as you move through the stone passage.', 'Your footsteps echo off the cavern walls.', 'The air turns cool and damp the moment you leave the entrance.'],
  default:   ['You set out, leaving familiar ground behind.', 'The road ahead is quiet.', 'You adjust your pack and walk.'],
};

const TRAVEL_MID = {
  Grassland: ['A hawk turns slow circles overhead.', 'The grass bends in waves ahead of the wind.', 'Distant farmsteads mark the horizon.'],
  Forest:    ['Something moves in the undergrowth and falls still.', 'Shafts of light pierce the canopy at odd angles.', 'The forest is old. Some of these trees predate the kingdoms.'],
  Mountains: ['The air is thinner here. You breathe deliberately.', 'Below, the land spreads out like a map.', 'Snow lingers in the shadows of the high rocks.'],
  Desert:    ['A mirage shimmers on the horizon and vanishes.', 'Nothing moves but the sand.', 'Your waterskin feels lighter than you would like.'],
  Tundra:    ['The silence is complete. No birds, no wind, nothing.', 'You cannot tell how long you have been walking.', 'The cold has settled into your bones.'],
  Coastal:   ['The sea is vast to your side. It makes the land feel small.', 'Gulls wheel and argue overhead.', 'The tide has left strange things at the high water mark.'],
  River:     ['The river widens here. Logs drift past, waterlogged and dark.', 'Fish jump in the shallows as you pass.', 'The far bank looks just like this one.'],
  Wetlands:  ['The fog sits low over the water. Navigation is difficult.', 'You hear something large splash nearby. You do not look.', 'Every footstep is a negotiation with the ground.'],
  default:   ['The miles pass in silence.', 'You keep your eyes on the road ahead.', 'Nothing remarkable happens, and that is something to be grateful for.'],
};

const TRAVEL_WEATHER = {
  Sunny:         ['The sun is warm on your back — good visibility, open road.', 'Clear skies. Your shadow is long ahead of you.'],
  Clear:         ['A crisp, clear day. The road stretches out plainly before you.', 'Excellent visibility. No cloud overhead.'],
  'Partly Cloudy':['Patchy cloud keeps the sun from being overbearing.', 'Light and shadow trade off across the road.'],
  Cloudy:        ['The overcast softens the light. A steady walking day.', 'Grey sky, but no rain. The road holds.'],
  Overcast:      ['Heavy cloud presses down. The air feels thick and close.', 'The sky is a uniform grey. You walk with your head down.'],
  Fog:           ['The fog closes in. You navigate by feel as much as sight.', 'Shapes loom out of the mist and resolve into rocks and trees.', 'Sound travels strangely in this fog.'],
  Mist:          ['A low mist drifts along the ground. The world is muffled.', 'Visibility is short — you follow the road by its texture underfoot.'],
  Windy:         ['A stiff wind pushes at your back — or fights you head-on.', 'The gusts are relentless. You lean into each one.'],
  'Strong Wind': ['The wind is punishing. Every step costs more.', 'A gale makes the road treacherous. Trees crack around you.'],
  Drizzle:       ['A fine drizzle settles on everything. Not heavy — just persistent.', 'The drizzle hisses quietly against your hood.'],
  'Light Rain':  ['Light rain patters against your cloak. The road softens underfoot.', 'A gentle, steady rain. You keep moving.'],
  Rainy:         ['The rain is steady and cold. The mud makes every step harder.', 'You keep your head down against the rain.'],
  'Heavy Rain':  ['The rain hammers down. Visibility drops to a few paces.', 'Every step is a struggle through sucking mud and sheeting water.'],
  Stormy:        ['The storm forces you to lean into the wind.', 'Thunder rumbles overhead. Lightning on the horizon. You keep moving.'],
  'Light Snow':  ['Powdery snow drifts across the road. Quiet and cold.', 'Your breath clouds in the air. The snow softens the world.'],
  Snowy:         ['Snow muffles the world. The road is hard to follow.', 'The snow is beautiful and indifferent to your discomfort.'],
};

// ============================================================
// WEATHER SYSTEM — progressive transitions, biome weighting
// ============================================================

// Severity 0 = fine, 1 = mild, 2 = uncomfortable, 3 = difficult, 4 = severe, 5 = impassable
const WEATHER_SEVERITY = {
  Sunny: 0, Clear: 0, 'Partly Cloudy': 0, Cloudy: 1, Overcast: 1,
  Fog: 1, Mist: 1, Windy: 1, 'Strong Wind': 2, Drizzle: 1,
  'Light Rain': 2, Rainy: 2, 'Heavy Rain': 3, Stormy: 4,
  'Light Snow': 2, Snowy: 3, Blizzard: 5,
};

// Weighted transition table — each entry is [nextWeather, weight]
const WEATHER_TRANSITIONS = {
  Sunny:          [['Clear',2],['Partly Cloudy',2],['Sunny',3]],
  Clear:          [['Sunny',2],['Partly Cloudy',3],['Cloudy',1],['Clear',2],['Mist',1]],
  'Partly Cloudy':[['Clear',2],['Cloudy',3],['Windy',1],['Partly Cloudy',2]],
  Cloudy:         [['Partly Cloudy',2],['Overcast',3],['Drizzle',1],['Fog',1],['Cloudy',2]],
  Overcast:       [['Cloudy',2],['Drizzle',3],['Light Rain',2],['Fog',2],['Overcast',1]],
  Fog:            [['Mist',2],['Overcast',2],['Clear',1],['Cloudy',2],['Fog',1]],
  Mist:           [['Fog',2],['Clear',2],['Partly Cloudy',2],['Mist',1]],
  Windy:          [['Partly Cloudy',2],['Cloudy',2],['Overcast',1],['Strong Wind',2],['Windy',2]],
  'Strong Wind':  [['Windy',2],['Overcast',2],['Stormy',1],['Strong Wind',1]],
  Drizzle:        [['Overcast',2],['Light Rain',3],['Cloudy',2],['Drizzle',1]],
  'Light Rain':   [['Drizzle',2],['Rainy',3],['Overcast',1],['Light Rain',1]],
  Rainy:          [['Light Rain',2],['Heavy Rain',2],['Overcast',1],['Rainy',2]],
  'Heavy Rain':   [['Rainy',2],['Stormy',2],['Light Rain',1],['Heavy Rain',1]],
  Stormy:         [['Heavy Rain',3],['Rainy',1],['Stormy',2]],
  'Light Snow':   [['Cloudy',1],['Snowy',2],['Overcast',1],['Light Snow',2]],
  Snowy:          [['Light Snow',2],['Blizzard',1],['Overcast',1],['Snowy',2]],
  Blizzard:       [['Snowy',3],['Heavy Rain',1],['Blizzard',2]],
};

// Extra biome weather tendencies — [weather, addedWeight] pairs added on top of transitions
const WEATHER_BIOME_BIAS = {
  Desert:     [['Sunny',3],['Clear',2],['Windy',1],['Strong Wind',1]],
  Grassland:  [['Partly Cloudy',1],['Windy',1]],
  Forest:     [['Fog',1],['Mist',1],['Rainy',1]],
  Mountains:  [['Windy',2],['Strong Wind',1],['Snowy',1],['Blizzard',1]],
  Tundra:     [['Snowy',2],['Blizzard',1],['Overcast',1]],
  Coastal:    [['Windy',2],['Fog',1],['Rainy',1],['Stormy',1]],
  Wetlands:   [['Mist',2],['Fog',1],['Rainy',1],['Drizzle',1]],
  Arctic:     [['Blizzard',2],['Snowy',2],['Clear',1]],
  River:      [['Mist',1],['Fog',1],['Drizzle',1]],
};

const WEATHER_ICON = {
  Sunny: '☀️', Clear: '🌤️', 'Partly Cloudy': '⛅', Cloudy: '☁️', Overcast: '🌥️',
  Fog: '🌫️', Mist: '🌁', Windy: '💨', 'Strong Wind': '🌬️',
  Drizzle: '🌦️', 'Light Rain': '🌧️', Rainy: '🌧️', 'Heavy Rain': '⛈️', Stormy: '⛈️',
  'Light Snow': '🌨️', Snowy: '❄️', Blizzard: '❄️',
};

function getWeatherSeverity(w) { return WEATHER_SEVERITY[w ?? player.weather] ?? 1; }

function _weightedPick(pairs) {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [val, w] of pairs) { r -= w; if (r <= 0) return val; }
  return pairs[0][0];
}

// Advance weather one step. Called periodically from updateTimeOfDay.
function advanceWeather() {
  const cell   = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const biome  = cell.biome || 'default';
  const cur    = player.weather || 'Clear';
  const base   = (WEATHER_TRANSITIONS[cur] || WEATHER_TRANSITIONS.Clear).slice();
  const bias   = WEATHER_BIOME_BIAS[biome] || [];
  // Merge bias into base weights
  const merged = [...base];
  for (const [bw, bwt] of bias) {
    const existing = merged.find(([w]) => w === bw);
    if (existing) existing[1] += bwt; else merged.push([bw, bwt]);
  }
  let next = _weightedPick(merged);
  // "Sunny" makes no sense at night — downgrade to Clear
  if (next === 'Sunny' && isLateTime()) next = 'Clear';
  if (next === cur) return; // no change
  player.weather = next;
  const icon = WEATHER_ICON[next] || '🌤️';
  addStory(`${icon} The weather shifts: ${next}.`);
  updateTopStats();
  // Warn about severe weather
  const sev = getWeatherSeverity(next);
  if (sev >= 4) addStory(`⚠️ ${next === 'Blizzard' ? 'A blizzard is moving in.' : 'A violent storm closes in.'} Seek shelter.`);
  else if (sev >= 3) addStory(`⚠️ The weather is turning dangerous.`);
}

const TRAVEL_TIME = {
  '🌅 Early Morning': ['The world is barely awake. Mist sits low on the fields.', 'The air is cold and still. First light ahead.', 'Dawn birds are the only sound on the road.'],
  '🌄 Mid-Morning':   ['The sun climbs. Dew still on the grass.', 'The road warms under the growing light.', 'A crisp morning. Good traveling weather.'],
  '☀️ Morning':       ['The morning air is fresh and clear.', 'Birdsong fills the early light.', 'A good time to be moving.'],
  '🌞 Midday':        ['The sun is directly overhead. The road shimmers slightly.', 'High sun. You find shade where you can.', 'The day is at its peak. The road is busy.'],
  '🌤️ Afternoon':    ['The afternoon is warm. The road is quiet.', 'High sun makes the distance hazy.', 'Good light and a steady pace.'],
  '⛅ Mid-Afternoon': ['The sun begins its descent. Still plenty of light.', 'The road is familiar at this hour — well-traveled.'],
  '🌇 Late Afternoon':['The light turns golden. Shadows stretch long across the road.', 'Getting late. You keep a solid pace.'],
  '🌆 Evening':       ['The sun drops low. Long shadows cross the road ahead.', 'The light is golden and fading fast.', 'Evening is coming on. You push your pace.'],
  '🌃 Mid-Evening':   ['The sky deepens to purple. The first stars appear.', 'Lanterns are lit in farmhouse windows.'],
  '🌙 Dusk':          ['The last of the light fades. The road grows grey.', 'Dusk settles in. Hard to read the terrain now.'],
  '🌑 Night':         ['You travel by starlight. The road is dark and quiet.', 'Owls call in the dark. You keep to the road.', 'The night is cold and clear.'],
  '⭐ Late Night':    ['Deep night. The road is yours alone.', 'The stars are bright. The silence is complete.', 'Late night travel. Every sound carries further.'],
};

function _travelLine(table, key) {
  const pool = table[key] || table.default || [];
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : '';
}

async function executeTravelTo(destKey, toX, toY, gridSquares, staminaCost, opts = {}) {
  const destCell  = mapData[destKey] || {};
  const fromCell  = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  // Use settlement name, or biome description, never raw coordinates
  const _destKnown = (player.knownLocations || {})[destKey]?.nameKnown && destCell.cityVillage;
  const destName   = _destKnown ? destCell.cityVillage
                   : destCell.biome ? `the ${destCell.biome.toLowerCase()}`
                   : 'the unknown lands';
  const fromBiome = fromCell.biome || 'default';
  const destBiome = destCell.biome || 'default';

  // Block travel in severe weather
  const _travelSev = typeof getWeatherSeverity === 'function' ? getWeatherSeverity() : 0;
  if (_travelSev >= 5 && !opts.skipDeparture) {
    addStory(`⛈️ The ${player.weather} makes travel impossible. Take shelter and wait it out.`);
    _showDefaultWheel?.(); return;
  }
  if (_travelSev >= 4 && !opts.skipDeparture) {
    addStory(`⚠️ Travelling in a ${player.weather} is extremely dangerous. Press on?`);
    const proceed = await new Promise(resolve => {
      _buildWheel([
        { label: '🚶 Press on anyway', action: () => resolve(true)  },
        { label: '⬅ Take shelter',    action: () => resolve(false) },
      ]);
    });
    if (!proceed) { _goBack?.(); return; }
  }

  _markDiscovered(player.currentLocation); // origin always counted as discovered

  // Reveal fog-of-war along travel path (Bresenham) but do NOT add to discoveredCells.
  {
    const fromMatch = player.currentLocation.match(/^x(\d+)_y(\d+)$/);
    const toMatch   = destKey.match(/^x(\d+)_y(\d+)$/);
    if (fromMatch && toMatch) {
      let x0 = +fromMatch[1], y0 = +fromMatch[2];
      const x1 = +toMatch[1],  y1 = +toMatch[2];
      const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      while (x0 !== x1 || y0 !== y1) {
        // Fog-of-war reveal only — intermediate cells are not "discovered" for title purposes
        if (mapData?.[`x${x0}_y${y0}`]) mapData[`x${x0}_y${y0}`].discovered = true;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 <  dx) { err += dx; y0 += sy; }
      }
    }
  }

  if (!opts.skipDeparture) {
    // Departure flavor
    const depLine = _travelLine(TRAVEL_DEPARTURE, fromBiome);
    addStory(`🚶 ${depLine}`);
    _buildWheel([{ label: '🚶 Travelling…', action: () => {} }]);

    // Weather modifies travel time
    const _weatherMod = _travelSev >= 3 ? 1.6 : _travelSev >= 2 ? 1.3 : _travelSev >= 1 ? 1.1 : 1.0;
    // Short trips: single bar. Longer trips: split with mid-narrative.
    const baseTravelMs = Math.max(2000, Math.min(45000, gridSquares * 1200));
    const _compassMod  = player.inventory?.['Compass'] ? 0.8 : 1.0;
    const _horseMod    = player.flags?.hasHiredHorse   ? 0.85 : 1.0;
    const _litTorchEquipped = Object.values(player.equipped || {}).some(n => n && /^lit torch$/i.test(n));
    const _torchMod    = (isLateTime() && _litTorchEquipped) ? 0.9 : 1.0; // 10% faster at night with light
    const travelMs     = Math.round(baseTravelMs * _compassMod * _horseMod * _weatherMod * _torchMod);
    if (gridSquares > 3) {
      const halfMs = Math.round(travelMs / 2);
      await runInlineProgress(`Travelling to ${destName}…`, halfMs);
      const midLines = [
        _travelLine(TRAVEL_MID, destBiome),
        player.weather && TRAVEL_WEATHER[player.weather] ? _travelLine(TRAVEL_WEATHER, player.weather) : '',
        player.timeOfDay && TRAVEL_TIME[player.timeOfDay]  ? _travelLine(TRAVEL_TIME, player.timeOfDay)  : '',
      ].filter(Boolean);
      if (midLines.length) addStory(midLines[Math.floor(Math.random() * midLines.length)]);
      await runInlineProgress('Nearly there…', halfMs);
    } else {
      await runInlineProgress(`Travelling to ${destName}…`, travelMs);
    }

    // Deduct stamina
    changeStamina(-staminaCost);

    // 1 period per grid square (12-period day), minimum 1
    advanceTime(Math.max(1, gridSquares));
  }

  // Random events — one check per 3 squares
  // Night raises danger chance; lit torch equipped reduces it slightly
  const _nightTravel    = isLateTime();
  const _torchCarried   = Object.values(player.equipped || {}).some(n => n && /^lit torch$/i.test(n));
  const _encounterThreshold = _nightTravel ? (_torchCarried ? 8 : 9) : 6; // day:30%, night:45%, torch:40%
  const checks = Math.floor(gridSquares / 3);
  for (let i = 0; i < checks; i++) {
    if (Math.floor(Math.random() * 20) + 1 <= _encounterThreshold) {
      await fireRandomEvent('travel', _nightTravel ? ['creature_encounter', 'hazard', 'traveler_encounter', 'discovery', 'mystical'] : null);
      // Brief pause so the wheel readjusts between events
      _buildWheel([{ label: '🚶 Continuing…', action: () => {} }]);
      await runInlineProgress('Continuing journey…', 800);
    }
  }

  // Arrive
  player.currentLocation = destKey;
  const [, _dx, _dy] = destKey.match(/^x(\d+)_y(\d+)$/) || [];
  if (_dx) updatePlayerSymbol(+_dx, +_dy);
  if (player.waypoint === destKey) {
    delete player.waypoint;
    addStory('📌 Waypoint reached.');
    renderWaypointBar();
  }
  updateTopStats();
  checkDiscovery();

  // Apply environment conditions on arrival
  if (['Drizzle', 'Light Rain', 'Rainy', 'Heavy Rain', 'Stormy', 'Blizzard'].includes(player.weather)) applyCondition('wet');
  if (isLateTime() && !player.hasShelter) applyCondition('cold');

  // Mark cell as discovered
  if (typeof mapData !== 'undefined' && mapData[destKey]) _markDiscovered(destKey);

  // Entering a named settlement: player reads the sign at the road
  const isSettlement = destCell.zone && destCell.zone !== 'None' && destCell.cityVillage;
  const isFirstVisit  = !((player.knownLocations || {})[destKey]?.nameKnown);
  if (isSettlement && isFirstVisit) {
    addStory(`🪧 A weathered sign at the road reads: "${destCell.cityVillage}"`);
    learnLocationName(destKey);
  }

  // First visit to a City or CapitalCity: auto-reveal the nearest tavern or inn
  const isCityZone = /^(city|capitalcity|capital city)$/i.test(destCell.zone || '');
  if (isCityZone && isFirstVisit && !(player.discoveredEstablishments?.[destKey]?.length)) {
    const hospitality = (destCell.establishments || []).find(e =>
      /tavern|inn|alehouse|pub|lodge|boarding/i.test((e.type || '') + ' ' + (e.name || ''))
    );
    if (hospitality) {
      discoverEstablishment(destKey, hospitality.name, true);
      addStory(`The smell of ale and hearth-smoke draws your eye — ${hospitality.name} is easy enough to find.`);
    }
  }

  // First visit to a non-city settlement: hint that exploration is needed
  if (isSettlement && isFirstVisit && !isCityZone) {
    addStory('The streets are unfamiliar — you\'ll need to explore before you know what\'s here.');
  }

  // Arrival message — show only what the player now knows
  const knownArrival  = (player.knownLocations || {})[destKey];
  const locDisplay    = knownArrival?.nameKnown && destCell.cityVillage ? destCell.cityVillage : (destCell.biome || destKey);
  const knownKingdom  = (player.knownKingdoms || {})[destCell.kingdom];
  const kingdomSuffix = knownKingdom && destCell.kingdom ? ` — ${destCell.kingdom}` : '';
  addStory(`📍 You arrive at ${locDisplay}${kingdomSuffix}.`);
  if (destCell.description) addStory(destCell.description);

  // World event arrival atmosphere — only in named settlements, not wilderness/camp
  const _arrivalInSettlement = destCell.zone && destCell.zone !== 'None' && destCell.cityVillage;
  if (destCell.kingdom && _arrivalInSettlement) {
    const arrivalEvs = (worldEconomy?.activeEvents || []).filter(e => e.kingdom === destCell.kingdom);
    if (arrivalEvs.length) {
      const ev = arrivalEvs[Math.floor(Math.random() * arrivalEvs.length)];
      const hint = WORLD_EVENT_EFFECTS[ev.type]?.arrivalHint;
      if (hint) addNarration(hint(destCell.cityVillage || destCell.kingdom));
    }
  }

  // Camp left unattended — check for raid (effects applied silently; revealed on return)
  if (player.campLocation && player.campLocation !== destKey && !player.flags?._campRaidResult && !player.flags?._campScoutedResult) {
    const raidRoll = Math.floor(Math.random() * 20) + 1;
    if (raidRoll <= 7) {
      const lostNames = [];
      const lostSupplies = (player.campSupplies || []).filter(s => (s.quantity ?? 0) > 0);
      if (lostSupplies.length) {
        const lost = lostSupplies.splice(0, Math.ceil(lostSupplies.length * 0.5));
        player.campSupplies = player.campSupplies.filter(s => (s.quantity ?? 0) > 0);
        lost.forEach(s => lostNames.push(s.name));
      }
      let shelterDestroyed = false;
      if (player.hasShelter && Math.random() < 0.3) {
        player.hasShelter   = false;
        player.shelterLevel = 0;
        shelterDestroyed    = true;
        setBuiltIcon?.('shelter-button', false);
      }
      let fireDestroyed = false;
      if (player.hasCampfire && Math.random() < 0.15) {
        player.hasCampfire = false;
        player.hasFire     = false;
        fireDestroyed      = true;
        setBuiltIcon?.('campfire-button', false);
      }
      updateComfortProtection?.();
      if (!player.flags) player.flags = {};
      player.flags._campRaidResult = { lostSupplies: lostNames, shelterDestroyed, fireDestroyed };
    } else if (raidRoll <= 12) {
      if (!player.flags) player.flags = {};
      player.flags._campScoutedResult = true;
    }
  }

  // Arriving at camp — reveal what happened while away
  if (player.campLocation && player.campLocation === destKey) {
    if (player.flags?._campRaidResult) {
      const r = player.flags._campRaidResult;
      delete player.flags._campRaidResult;
      addStory('⚠️ Something is wrong — your camp has been raided.');
      if (r.lostSupplies?.length) addStory(`📦 Lost camp supplies: ${r.lostSupplies.join(', ')}.`);
      if (r.shelterDestroyed) addStory('🏕️ Your shelter was torn apart.');
      if (r.fireDestroyed) addStory('🔥 The fire pit was scattered and the kindling strewn about.');
    } else if (player.flags?._campScoutedResult) {
      delete player.flags._campScoutedResult;
      addStory('👁️ Your camp shows signs of being scouted while you were away — nothing taken, but someone was watching.');
    }
  }

  updateJournal();
  checkQuestObjectives?.('location', { coord: destKey });
  addWorldEvent(`Travelled to ${locDisplay}.`, 'exploration');
  // Hired horse expires on arrival
  if (player.flags?.hasHiredHorse) {
    delete player.flags.hasHiredHorse;
    addStory('🐴 You return the hired horse at the nearest stable.');
  }

  const _ws = _wsInit();
  _ws.travelCount++;
  if (destCell.kingdom && !_ws.kingdomsVisited.includes(destCell.kingdom)) {
    _ws.kingdomsVisited.push(destCell.kingdom);
  }
  checkAchievementTitles?.();
  checkGlobalEventTriggers();
  saveGame();
  if (!rollReencounters()) {
    if (isSettlement) {
      _townEngaged = true;
      _showTownWheel();
    } else {
      _showDefaultWheel();
    }
  }
}

// ============================================================
// SECTION 12.5 · PROFESSION TIERS & SKILL CONTEXTUAL ACTIONS
// ============================================================

// ── Core Profession Functions ────────────────────────────────

function awardProfessionXp(eventType) {
  for (const [profName, inst] of Object.entries(player.professions ?? {})) {
    const def = PROFESSION_TIER_DATA[profName];
    if (!def) continue;
    const gain = def.xpSources[eventType];
    if (!gain) continue;
    inst.xp = (inst.xp || 0) + gain;
    _checkProfessionAdvancement(profName, inst, def);
  }
}

function _checkProfessionAdvancement(profName, inst, def) {
  const threshold = def.xpThresholds[inst.tier];
  if (threshold === undefined || inst.xp < threshold) return;
  inst.xp -= threshold;
  inst.tier++;
  const tierName = def.tiers[inst.tier];
  addStory(`🏅 ${profName}: you have advanced to ${tierName}!`);
  addWorldEvent(`Reached ${tierName} rank in ${profName}.`, 'player');
  checkQuestObjectives?.('profession_rank_up', { profession: profName, tier: inst.tier });
  updateJournal?.();
}

function joinProfession(profName) {
  const def = PROFESSION_TIER_DATA[profName];
  if (!def) { addStory(`⛔ ${profName} is not a recognised profession.`); return; }
  if (player.professions[profName]) {
    player.activeProfession = profName;
    const inst     = player.professions[profName];
    const tierName = def.tiers[inst.tier];
    addStory(`You are already a ${tierName} in ${profName}. Now active.`);
    return;
  }
  player.professions[profName] = { tier: 0, xp: 0 };
  player.activeProfession      = profName;
  addStory(`📜 You join the ${profName} profession as a ${def.tiers[0]}.`);
  addWorldEvent(`Joined the ${profName} profession.`, 'player');
  updateJournal?.();
}

// ── Profession Wheel ─────────────────────────────────────────

function _showProfessionWheel() {
  const profName = player.activeProfession;
  if (!profName || !player.professions[profName]) {
    addStory('You have no active profession. Talk to a qualified NPC in a settlement to apprentice yourself.');
    _goBack(); return;
  }
  const def      = PROFESSION_TIER_DATA[profName];
  const inst     = player.professions[profName];
  const tierName = def?.tiers[inst.tier] || 'Novice';
  const nextXp   = def?.xpThresholds[inst.tier];
  const xpBar    = nextXp ? `${inst.xp}/${nextXp} XP` : 'Max tier reached';
  addStory(`🎯 ${profName} — ${tierName} (${xpBar})`);

  const tierActions = (def?.tierActions[inst.tier] || []).map(a => ({
    label:  a.label,
    action: () => _doProfessionAction(a.id, a),
  }));

  const otherProfs  = Object.keys(player.professions).filter(p => p !== profName);
  const switchOpt   = otherProfs.length
    ? [{ label: '🔄 Switch', action: _switchProfessionWheel }]
    : [];

  const opts = [
    ...tierActions,
    ...switchOpt,
    { label: '← Back', action: _goBack, isBack: true },
  ];

  if (!tierActions.length) {
    addStory(`Keep working as a ${profName} to unlock your first ${def?.tiers[1] || 'Journeyman'} ability.`);
  }

  _buildWheel(opts, `${tierName}`);
}

function _switchProfessionWheel() {
  const opts = Object.entries(player.professions).map(([name, inst]) => {
    const def  = PROFESSION_TIER_DATA[name];
    const tier = def?.tiers[inst.tier] || name;
    return {
      label:  `${name} (${tier})`,
      action: () => {
        player.activeProfession = name;
        addStory(`🎯 Active profession: ${name} — ${tier}.`);
        _showProfessionWheel();
      },
    };
  });
  opts.push({ label: '← Back', action: _goBack, isBack: true });
  _buildWheel(opts, 'Switch Profession');
}

// ── Profession Action Dispatcher ─────────────────────────────

async function _doProfessionAction(id, actionDef) {
  const staminaCost = actionDef?.staminaCost || 0;
  if (staminaCost && player.stamina < staminaCost) {
    addStory(`⛔ Not enough stamina (need ${staminaCost}).`); return;
  }
  if (staminaCost) changeStamina(-staminaCost);
  _buildWheel([{ label: '⏳ Using ability…', action: () => {} }]);
  switch (id) {
    case 'second_wind':        await _prof_second_wind();        break;
    case 'warriors_instinct':  await _prof_warriors_instinct();  break;
    case 'legendary_strike':   await _prof_legendary_strike();   break;
    case 'prof_quick_brew':    await _prof_quick_brew_action();  break;
    case 'transmute':          await _prof_transmute();          break;
    case 'master_formula':     await _prof_master_formula();     break;
    case 'steady_aim':         await _prof_steady_aim();         break;
    case 'volley':             await _prof_volley();             break;
    case 'eagle_eye':          await _prof_eagle_eye();          break;
    case 'shadow_step':        await _prof_shadow_step();        break;
    case 'mark_target':        await _prof_mark_target();        break;
    case 'silent_kill':        await _prof_silent_kill();        break;
    case 'ballad':             await _prof_ballad();             break;
    case 'tale_of_valor':      await _prof_tale_of_valor();      break;
    case 'epic_performance':   await _prof_epic_performance();   break;
    case 'field_repair':       await _prof_field_repair();       break;
    case 'sharpen_blade':      await _prof_sharpen_blade();      break;
    case 'masterwork':         await _prof_masterwork();         break;
    case 'assess_quarry':      await _prof_assess_quarry();      break;
    case 'manhunt':            await _prof_manhunt();            break;
    case 'capture':            await _prof_capture();            break;
    case 'bless':              await _prof_bless();              break;
    case 'divine_healing':     await _prof_divine_healing();     break;
    case 'holy_wrath':         await _prof_holy_wrath();         break;
    case 'survey_area':        await _prof_survey_area();        break;
    case 'orienteering':       await _prof_orienteering();       break;
    case 'first_expedition':   await _prof_first_expedition();   break;
    case 'cultivate':          await _prof_cultivate();          break;
    case 'weather_sense':      await _prof_weather_sense();      break;
    case 'bountiful_harvest':  await _prof_bountiful_harvest();  break;
    case 'craft_arrows':       await _prof_craft_arrows();       break;
    case 'broadhead':          await _prof_broadhead();          break;
    case 'perfect_shot':       await _prof_perfect_shot();       break;
    case 'brace':              await _prof_brace();              break;
    case 'intimidate':         await _prof_intimidate();         break;
    case 'fortress_stance':    await _prof_fortress_stance();    break;
    case 'prof_bandage':       await _prof_bandage();            break;
    case 'cure_ailment':       await _prof_cure_ailment();       break;
    case 'full_restoration':   await _prof_full_restoration();   break;
    case 'set_snare':          await _prof_set_snare();          break;
    case 'study_prey':         await _prof_study_prey();         break;
    case 'apex_predator':      await _prof_apex_predator();      break;
    case 'honors_strike':      await _prof_honors_strike();      break;
    case 'stand_firm':         await _prof_stand_firm();         break;
    case 'charge':             await _prof_charge();             break;
    case 'detect_magic':       await _prof_detect_magic();       break;
    case 'arcane_bolt':        await _prof_arcane_bolt();        break;
    case 'ritual_casting':     await _prof_ritual_casting();     break;
    case 'for_pay':            await _prof_for_pay();            break;
    case 'battle_hardened':    await _prof_battle_hardened();    break;
    case 'appraise':           await _prof_appraise();           break;
    case 'bulk_deal':          await _prof_bulk_deal();          break;
    case 'corner_market':      await _prof_corner_market();      break;
    case 'plunder':            await _prof_plunder();            break;
    case 'sea_legs':           await _prof_sea_legs();           break;
    case 'dread_flag':         await _prof_dread_flag();         break;
    case 'woodland_stride':    await _prof_woodland_stride();    break;
    case 'natural_guardian':   await _prof_natural_guardian();   break;
    case 'study':              await _prof_study();              break;
    case 'decipher_runes':     await _prof_decipher_runes();     break;
    case 'font_of_knowledge':  await _prof_font_of_knowledge();  break;
    case 'dirty_trick':        await _prof_dirty_trick();        break;
    case 'battle_cry':         await _prof_battle_cry();         break;
    case 'killing_blow':       await _prof_killing_blow();       break;
    case 'gather_intel':       await _prof_gather_intel();       break;
    case 'plant_evidence':     await _prof_plant_evidence();     break;
    case 'vanish':             await _prof_vanish();             break;
    default: addStory(`⛔ Unknown ability: ${id}.`); _goBack();  return;
  }
}

// ── Profession Action Implementations ────────────────────────

async function _prof_second_wind() {
  await runInlineProgress('Catching your breath…', 1500);
  changeStamina(20);
  addStory('💨 You steady yourself and recover 20 stamina.');
  _goBack();
}

async function _prof_warriors_instinct() {
  if (!combatState) { addStory('⛔ You are not in combat.'); _goBack(); return; }
  await runInlineProgress('Sizing up the enemy…', 1500);
  const e = combatState.enemy;
  addStory(`🔍 ${e.name}: ${e.life}/${e.maxLife} HP · Damage: ${e.damage[0]}–${e.damage[1]}`);
  _showCombatWheel();
}

async function _prof_legendary_strike() {
  if (!combatState) { addStory('⛔ You are not in combat.'); _goBack(); return; }
  await runInlineProgress('Channelling your legend…', 2000);
  const skill   = _getBestCombatSkill();
  const base    = Math.max(15, Math.floor(Math.random() * 20) + 1);
  const wepBonus = _getEquippedWeaponDamage();
  const tier    = base <= 18 ? 4 : 5;
  const dmg     = Math.max(1, tier * 4 + randomInt(0, 4) + Math.floor(wepBonus * 0.4));
  combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
  gainSkillXp(skill, tier);
  addStory(`⚔️ Legendary Strike lands for ${dmg} damage! (${combatState.enemy.life}/${combatState.enemy.maxLife} HP)`);
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _partyAssistCombat();
  if (combatState?.enemy?.life <= 0) { _resolveCombatVictory(); return; }
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _prof_quick_brew_action() {
  await runInlineProgress('Brewing…', 2000);
  const herbs = Object.keys(player.inventory || {}).filter(k => /herb/i.test(k) && (player.inventory[k].quantity ?? 0) >= 2);
  if (!herbs.length) { addStory('⛔ You need at least 2 Healing Herbs to brew.'); _goBack(); return; }
  removeItem(herbs[0], 2);
  const tier = performSkillCheck('Alchemy');
  if (tier <= 1) { addStory('⚗️ The mixture is ruined. Materials wasted.'); }
  else {
    const qty = tier >= 5 ? 2 : 1;
    addItem('Health Potion', qty, { type: 'potion', weight: 0.3, rarity: 'Common', consumable: true, description: 'A basic healing potion.' });
    addStory(`⚗️ You brew ${qty}× Health Potion.`);
    awardProfessionXp('brew');
  }
  _goBack();
}

async function _prof_transmute() {
  await runInlineProgress('Transmuting…', 2500);
  const commons = Object.entries(player.inventory || {})
    .filter(([, v]) => v.rarity === 'Common' && (v.quantity ?? 0) >= 5 && v.type === 'material');
  if (!commons.length) { addStory('⛔ Need 5× of any Common material to transmute.'); _goBack(); return; }
  const [name] = commons[0];
  removeItem(name, 5);
  const tier = performSkillCheck('Alchemy');
  const result = tier >= 4 ? 'Silver Dust' : 'Iron Powder';
  addItem(result, 1, { type: 'material', weight: 0.2, rarity: 'Uncommon', consumable: false });
  addStory(`🔄 Transmuted 5× ${name} → 1× ${result}.`);
  _goBack();
}

async function _prof_master_formula() {
  player.masterFormulaActive = true;
  addStory('✨ Your next brew will yield double at maximum quality.');
  _goBack();
}

async function _prof_steady_aim() {
  if (!combatState) { addStory('⛔ You are not in combat.'); _goBack(); return; }
  combatState.noCounterThisRound = true;
  await runInlineProgress('Drawing breath, taking aim…', 1500);
  const tier    = performSkillCheck('Archery');
  const wepBonus = _getEquippedWeaponDamage();
  const dmg     = Math.max(1, tier * 4 + randomInt(-1, 3) + Math.floor(wepBonus * 0.4));
  combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
  addStory(`🎯 Steady shot hits for ${dmg}. No counterattack. (${combatState.enemy.life}/${combatState.enemy.maxLife} HP)`);
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _partyAssistCombat();
  if (combatState?.enemy?.life <= 0) { _resolveCombatVictory(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _prof_volley() {
  if (!combatState) { addStory('⛔ You are not in combat.'); _goBack(); return; }
  await runInlineProgress('Loosing volley…', 1500);
  const tier = performSkillCheck('Archery');
  const dmg  = Math.max(1, tier * 3 + randomInt(-1, 2));
  combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
  combatState.enemySkipsNext = true;
  addStory(`🏹 Volley hits for ${dmg} — the ${combatState.enemy.name} ducks and loses their next strike!`);
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _prof_eagle_eye() {
  if (!combatState) { addStory('⛔ You are not in combat.'); _goBack(); return; }
  combatState.eagleEye = true;
  addStory('🦅 Your vision sharpens. Archery checks cannot roll below Tier 3 this combat.');
  _showCombatWheel();
}

async function _prof_shadow_step() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Stepping into shadow…', 1000);
  addStory('🌑 You vanish into the darkness before they can react.');
  combatState = null;
  _showDefaultWheel();
}

async function _prof_mark_target() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  combatState.markedTarget = true;
  addStory(`🎯 ${combatState.enemy.name} is marked. All hits deal +3 bonus damage.`);
  _showCombatWheel();
}

async function _prof_silent_kill() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  const e = combatState.enemy;
  if (e.life >= e.maxLife * 0.4) {
    addStory(`⛔ ${e.name} is too healthy for a silent kill (must be below 40% HP).`);
    _showCombatWheel(); return;
  }
  await runInlineProgress('Moving in…', 1500);
  addStory(`🗡️ With one swift movement, you end the ${e.name} before they can cry out.`);
  e.life = 0;
  _resolveCombatVictory();
}

async function _prof_ballad() {
  await runInlineProgress('Playing…', 2000);
  const tier = performSkillCheck('Persuasion');
  if (tier <= 1) { addStory('🎵 The notes fall flat. No effect.'); _goBack(); return; }
  applyCondition('inspired', 3);
  (player.party || []).forEach(() => {}); // party can't have conditions but note it narratively
  addStory(`🎵 Your ballad lifts spirits! You and your companions feel inspired.`);
  awardProfessionXp('social_success');
  _goBack();
}

async function _prof_tale_of_valor() {
  await runInlineProgress('Recounting the tale…', 1500);
  player.taleOfValorActive = true;
  addStory('📖 You recount a great deed. Skill XP is doubled until your next rest.');
  _goBack();
}

async function _prof_epic_performance() {
  await runInlineProgress('Performing…', 3000);
  const tier = performSkillCheck('Persuasion');
  if (tier <= 2) { addStory('🎭 The performance falls flat with this crowd.'); _goBack(); return; }
  addStory('🎭 The crowd erupts. Your name will be spoken here for days. All locals are now Friendly.');
  player.settlementReputation = (player.settlementReputation || {});
  player.settlementReputation[player.currentLocation] = 'Friendly';
  awardProfessionXp('social_success');
  _goBack();
}

async function _prof_field_repair() {
  await runInlineProgress('Inspecting and repairing…', 2000);
  // Find the most-worn item in inventory
  const entries = Object.entries(player.inventory || {});
  const [itemName, item] = entries.reduce((worst, [n, v]) => {
    const w = getItemWear(n);
    return w < getItemWear(worst[0] || '') ? [n, v] : worst;
  }, ['', null]);
  const wear = itemName ? getItemWear(itemName) : 100;
  if (!itemName || wear >= 100) { addStory('🔧 Nothing in your pack needs repair.'); _goBack(); return; }
  const tier = performSkillCheck('Smithing');
  if (tier <= 1) { addStory('🔧 The repair doesn\'t hold.'); _goBack(); return; }
  const repaired = Math.min(100, wear + 25 * tier);
  player.inventory[itemName].wear = repaired;
  delete player.inventory[itemName].condition;
  addStory(`🔧 You repair the ${itemName} from ${wear}% to ${repaired}% — ${getConditionFromWear(repaired)}.`);
  updateInventory();
  _goBack();
}

async function _prof_sharpen_blade() {
  await runInlineProgress('Honing the edge…', 2000);
  const tier = performSkillCheck('Smithing');
  if (tier <= 1) { addStory('⚔️ The blade slips. No improvement.'); _goBack(); return; }
  player.sharpenedWeaponBonus = 3;
  addStory('⚔️ Edge is razor sharp. +3 damage on your next combat.');
  _goBack();
}

async function _prof_masterwork() {
  player.masterworkActive = true;
  addStory('🔨 You enter a state of perfect focus. Your next craft attempt automatically succeeds at Tier 5.');
  _goBack();
}

async function _prof_assess_quarry() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  const e = combatState.enemy;
  await runInlineProgress('Assessing…', 1000);
  addStory(`🔍 ${e.name}: ${e.life}/${e.maxLife} HP · Strikes for ${e.damage[0]}–${e.damage[1]} with ${e.weapon}.`);
  _showCombatWheel();
}

async function _prof_manhunt() {
  await runInlineProgress('Tracking the quarry…', 2500);
  const active = (player.journal?.quests || []).filter(q => q.status === 'Active');
  if (!active.length) { addStory('🗺️ No active quarry to track.'); _goBack(); return; }
  const tier = performSkillCheck('Tracking');
  if (tier <= 2) { addStory('🗺️ The trail is cold. You find no leads.'); _goBack(); return; }
  addStory(`🗺️ Your instincts sharpen. Your quarry is somewhere in ${player.currentKingdom || 'this region'}.`);
  _goBack();
}

async function _prof_capture() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  const e = combatState.enemy;
  await runInlineProgress('Subduing…', 2000);
  const tier = performSkillCheck('Survival');
  if (tier <= 2) { addStory('⛓️ They resist. The capture fails.'); _showCombatWheel(); return; }
  addStory(`⛓️ You subdue the ${e.name} and take them in. Bounty collected.`);
  const bonus = Math.floor((e.goldRange?.[1] || 20) * 0.5);
  player.gold = (player.gold || 0) + bonus;
  addStory(`💰 +${bonus} gold bounty.`);
  updateTopStats();
  combatState = null;
  _showDefaultWheel();
}

async function _prof_bless() {
  await runInlineProgress('Offering prayer…', 2000);
  applyCondition('blessings', 4);
  addStory("✝️ A warmth settles over you. You and your companions are blessed.");
  awardProfessionXp('heal');
  _goBack();
}

async function _prof_divine_healing() {
  await runInlineProgress('Channelling divine power…', 2500);
  const tier = performSkillCheck('Light Magic');
  if (tier <= 1) { addStory('💫 The connection wavers. No healing.'); _goBack(); return; }
  changeLife(25);
  removeCondition('injured');
  addStory('💫 Divine light mends your wounds. +25 life, Injured removed.');
  awardProfessionXp('heal');
  _goBack();
}

async function _prof_holy_wrath() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Invoking divine wrath…', 2000);
  const tier = performSkillCheck('Light Magic');
  const dmg  = Math.max(1, tier * 7 + randomInt(0, 5));
  combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
  addStory(`⚡ Holy fire strikes the ${combatState.enemy.name} for ${dmg} damage! (${combatState.enemy.life}/${combatState.enemy.maxLife} HP)`);
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _prof_survey_area() {
  await runInlineProgress('Surveying the terrain…', 2500);
  const tier = performSkillCheck('Navigation');
  if (tier <= 1) { addStory('🔭 The terrain is confusing. You gain nothing.'); _goBack(); return; }
  const key = player.currentLocation;
  const match = key.match(/^x(\d+)_y(\d+)$/);
  if (!match) { _goBack(); return; }
  const cx = +match[1], cy = +match[2], radius = tier >= 4 ? 3 : 2;
  let revealed = 0;
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (Math.abs(dx) + Math.abs(dy) > radius) continue;
      const ckey = `x${cx + dx}_y${cy + dy}`;
      if (mapData?.[ckey] && !mapData[ckey].discovered) {
        _markDiscovered(ckey);
        revealed++;
      }
    }
  }
  addStory(`🔭 You survey the area and reveal ${revealed} nearby cell${revealed !== 1 ? 's' : ''}.`);
  setupMap?.();
  _goBack();
}

async function _prof_orienteering() {
  player.orienteeringActive = true;
  addStory('🧭 You plot an efficient route. Your next journey costs 0 stamina.');
  _goBack();
}

async function _prof_first_expedition() {
  await runInlineProgress('Searching carefully…', 3000);
  const tier = performSkillCheck('Survival');
  if (tier <= 2) { addStory('🏔️ You find nothing hidden here.'); _goBack(); return; }
  const cell   = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const hidden = (cell.pointsOfInterest || []).find(p => !((player.discoveredEstablishments || {})[player.currentLocation] || []).includes(p.name));
  if (hidden) {
    discoverEstablishment?.(player.currentLocation, hidden.name, true);
    addStory(`🏔️ Hidden away: ${hidden.name} — ${hidden.description || 'an unmarked place.'}`);
  } else {
    addStory('🏔️ You turn up an interesting find — some weathered coins and a curious carved stone.');
    player.gold = (player.gold || 0) + randomInt(5, 15);
    updateTopStats();
  }
  awardProfessionXp('location_discover');
  _goBack();
}

async function _prof_cultivate() {
  player.cultivateActive = true;
  addStory('🌱 You work the earth. Your next forage yields double.');
  _goBack();
}

async function _prof_weather_sense() {
  await runInlineProgress('Reading the sky…', 1500);
  const weathers = ['Clear', 'Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast', 'Fog', 'Mist', 'Windy', 'Strong Wind', 'Drizzle', 'Light Rain', 'Rainy', 'Heavy Rain', 'Stormy', 'Light Snow', 'Snowy', 'Blizzard'];
  const next1    = weathers[Math.floor(Math.random() * weathers.length)];
  const next2    = weathers[Math.floor(Math.random() * weathers.length)];
  addStory(`🌤️ The sky tells you: next period will be ${next1}, followed by ${next2}.`);
  _goBack();
}

async function _prof_bountiful_harvest() {
  player.bountifulHarvestActive = true;
  addStory('🌾 In tune with the land. Forage checks cannot roll below Tier 3 until you rest.');
  _goBack();
}

async function _prof_craft_arrows() {
  await runInlineProgress('Fletching arrows…', 2000);
  const hasSticks = (player.inventory?.['Sticks']?.quantity ?? 0) >= 3 || (player.inventory?.['Stick']?.quantity ?? 0) >= 3;
  const qty = hasSticks ? 5 : 3;
  const tier = performSkillCheck('Fletching');
  if (tier <= 1) { addStory('🪶 The fletching splits. No arrows made.'); _goBack(); return; }
  addItem('Arrow', qty, { type: 'material', weight: 0.1, rarity: 'Common', consumable: false });
  addStory(`🪶 You craft ${qty} arrows.`);
  awardProfessionXp('craft');
  _goBack();
}

async function _prof_broadhead() {
  await runInlineProgress('Fitting broadheads…', 1500);
  player.broadheadActive = true;
  addStory('🏹 Broadheads fitted. Arrows deal +4 damage for the next combat.');
  _goBack();
}

async function _prof_perfect_shot() {
  await runInlineProgress('Crafting the perfect arrow…', 3000);
  const tier = performSkillCheck('Fletching');
  if (tier <= 2) { addStory('🎯 The arrow warps. It won\'t fly true.'); _goBack(); return; }
  player.perfectArrowReady = true;
  addItem('Perfect Arrow', 1, { type: 'material', weight: 0.1, rarity: 'Rare', consumable: false, description: 'Guarantees a Tier 5 Archery check when used.' });
  addStory('🎯 You craft a single flawless arrow. It will not miss.');
  _goBack();
}

async function _prof_brace() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  combatState.braceActive = true;
  addStory('🛡️ You plant your feet and brace — the next hit deals 70% less damage.');
  _showCombatWheel();
}

async function _prof_intimidate() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Staring them down…', 1500);
  const tier = performSkillCheck('Persuasion');
  if (tier >= 3 && Math.random() < 0.5) {
    addStory(`😤 The ${combatState.enemy.name} flinches and flees!`);
    combatState = null; _showDefaultWheel(); return;
  }
  addStory(`😤 They hold their ground, but look shaken.`);
  combatState.enemy.damage = [Math.max(1, combatState.enemy.damage[0] - 2), Math.max(1, combatState.enemy.damage[1] - 2)];
  _showCombatWheel();
}

async function _prof_fortress_stance() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  combatState.fortressStance = true;
  addStory('🏰 You cannot be driven back. The party stands firm — no fleeing and no ambush this fight.');
  _showCombatWheel();
}

async function _prof_bandage() {
  await runInlineProgress('Applying bandage…', 1500);
  const hasBandage = (player.inventory?.['Bandage']?.quantity ?? 0) > 0;
  if (hasBandage) removeItem('Bandage', 1);
  changeLife(20);
  addStory(`🩹 You dress the wound. +20 life.`);
  awardProfessionXp('heal');
  _goBack();
}

async function _prof_cure_ailment() {
  const harmful = (player.conditions || []).filter(c => CONDITION_DEFS[c.id]?.harmful);
  if (!harmful.length) { addStory('💊 No harmful conditions to treat.'); _goBack(); return; }
  await runInlineProgress('Treating the condition…', 2000);
  const tier = performSkillCheck('Healing');
  if (tier <= 1) { addStory('💊 The treatment has no effect.'); _goBack(); return; }
  const removed = harmful[0];
  removeCondition(removed.id);
  addStory(`💊 You treat and remove: ${CONDITION_DEFS[removed.id]?.name || removed.id}.`);
  awardProfessionXp('heal');
  _goBack();
}

async function _prof_full_restoration() {
  await runInlineProgress('Full treatment…', 3500);
  const tier = performSkillCheck('Healing');
  if (tier <= 2) { addStory('✨ The treatment is incomplete. Partial recovery only.'); changeLife(15); _goBack(); return; }
  const targetLife = Math.floor(player.maxLife * 0.8);
  player.life = Math.max(player.life, targetLife);
  updateTopStats();
  (player.conditions || []).filter(c => CONDITION_DEFS[c.id]?.harmful).forEach(c => removeCondition(c.id));
  addStory('✨ A complete restoration. Life at 80% and all conditions cleared.');
  awardProfessionXp('heal');
  _goBack();
}

async function _prof_set_snare() {
  player.snarePlaced = true;
  addStory('🪤 You set a snare near camp. Check it after resting.');
  _goBack();
}

async function _prof_study_prey() {
  await runInlineProgress('Reading the signs…', 2000);
  const tier = performSkillCheck('Tracking');
  if (tier <= 1) { addStory('🦌 The signs are unclear. No guaranteed encounter.'); _goBack(); return; }
  player.guaranteedHuntEncounter = true;
  addStory('🦌 You spot clear signs of prey. Your next hunt is guaranteed to find an animal.');
  _goBack();
}

async function _prof_apex_predator() {
  player.apexPredatorActive = true;
  addStory('🦅 You are the apex predator here. Your next hunt yields maximum loot.');
  _goBack();
}

async function _prof_honors_strike() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Striking with honour…', 1500);
  const tier    = performSkillCheck('Swordsmanship');
  const dmg     = Math.max(1, tier * 4 + 5 + randomInt(-1, 2));
  combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
  applyCondition('fortified', 2);
  addStory(`⚔️ Honour's Strike deals ${dmg} — you are Fortified!`);
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _prof_stand_firm() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  combatState.standFirm = true;
  addStory('🛡️ You stand between your companions and danger. You will absorb the next hit meant for an ally.');
  _showCombatWheel();
}

async function _prof_charge() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Charging…', 1500);
  const tier = performSkillCheck('Swordsmanship');
  const dmg  = Math.max(1, tier * 8 + randomInt(0, 5));
  combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
  combatState.enemySkipsNext = true;
  addStory(`🐎 You charge! ${dmg} damage — the ${combatState.enemy.name} is knocked back and loses their next action.`);
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _prof_detect_magic() {
  await runInlineProgress('Sensing magic…', 2000);
  const tier = performSkillCheck('Light Magic');
  if (tier <= 1) { addStory('🔍 The magical sense fades before you can focus it.'); _goBack(); return; }
  const magical = Object.entries(player.inventory || {}).filter(([, v]) => v.rarity === 'Rare' || v.type === 'potion' || /magic|enchant|arcane|rune/i.test(JSON.stringify(v)));
  if (!magical.length) { addStory('🔍 You detect no magical items in your pack.'); _goBack(); return; }
  addStory(`🔍 Magical items detected: ${magical.map(([k]) => k).join(', ')}.`);
  _goBack();
}

async function _prof_arcane_bolt() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Channelling arcane force…', 1500);
  const skill = (player.skills?.['Light Magic']?.level || 0) >= (player.skills?.['Black Magic']?.level || 0) ? 'Light Magic' : 'Black Magic';
  const tier  = performSkillCheck(skill);
  const dmg   = Math.max(1, tier * 6 + randomInt(0, 4));
  combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
  addStory(`⚡ Arcane bolt deals ${dmg} — no mana spent. (${combatState.enemy.life}/${combatState.enemy.maxLife} HP)`);
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _prof_ritual_casting() {
  addStory('🌀 You begin a ritual. This will take some time…');
  _buildWheel([{ label: '🌀 Ritual…', action: () => {} }]);
  await runInlineProgress('Preparing ritual…', 5000);
  await runInlineProgress('Weaving the arcane…', 5000);
  const tier = performSkillCheck('Light Magic');
  const outcomes = [
    'The ritual fails. A cold wind snuffs out nearby fires.',
    'A faint shimmer — nothing tangible, but the air feels cleaner.',
    'A soft pulse of light. All party conditions improved by 1 duration.',
    'The ritual succeeds. A ward forms — next combat starts with enemy at -20 HP.',
    'A perfect casting. You are Blessed and Rejuvenated. The land itself seems grateful.',
  ];
  addStory(`🌀 ${outcomes[tier - 1]}`);
  if (tier >= 4) applyCondition('blessings', 6);
  if (tier >= 5) applyCondition('rejuvenated', 5);
  if (tier >= 4) { combatState = combatState || null; player.ritualWard = true; }
  _goBack();
}

async function _prof_for_pay() {
  player.forPayActive = true;
  addStory('💰 You mark this fight as paid work. Next combat victory yields +50% gold.');
  _goBack();
}

async function _prof_battle_hardened() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  combatState.damageReduction = (combatState.damageReduction || 0) + 3;
  addStory('🪖 You shrug off the pain. Incoming damage reduced by 3 this combat.');
  _showCombatWheel();
}

async function _prof_appraise() {
  await runInlineProgress('Appraising…', 1500);
  const tier = performSkillCheck('Negotiating');
  const items = Object.entries(player.inventory || {});
  if (!items.length) { addStory('🧐 Nothing in your pack to appraise.'); _goBack(); return; }
  const [name, data] = items[Math.floor(Math.random() * items.length)];
  const dbData = (typeof findItemInDatabase === 'function') ? findItemInDatabase(name) : null;
  const rarity = data.rarity || dbData?.rarity || 'Unknown';
  const estVal = dbData?.goldValue ?? (rarity === 'Rare' ? randomInt(30, 60) : rarity === 'Uncommon' ? randomInt(10, 30) : randomInt(2, 15));
  addStory(`🧐 ${name}: ${rarity} · Estimated value ~${estVal} gold.`);
  _goBack();
}

async function _prof_bulk_deal() {
  player.bulkDealActive = true;
  addStory('🤝 You prepare a deal. Your next NPC purchase costs 40% less.');
  _goBack();
}

async function _prof_corner_market() {
  await runInlineProgress('Setting up stall…', 2500);
  const sellable = Object.entries(player.inventory || {}).filter(([, v]) => (v.quantity ?? 0) > 0 && v.type !== 'quest');
  if (!sellable.length) { addStory('📊 Nothing to sell.'); _goBack(); return; }
  const opts = sellable.slice(0, 6).map(([name, data]) => {
    const base  = data.goldValue ?? (data.rarity === 'Rare' ? 40 : data.rarity === 'Uncommon' ? 18 : 6);
    const price = Math.round(base * 1.5);
    return {
      label:  `${name} — ${price}g`,
      action: () => {
        removeItem(name, 1);
        player.gold = (player.gold || 0) + price;
        addStory(`📊 Sold 1× ${name} for ${price}g.`);
        updateTopStats();
        awardProfessionXp('trade');
        _goBack();
      },
    };
  });
  opts.push({ label: '← Done', action: _goBack, isBack: true });
  _buildWheel(opts, 'Market Stall');
}

async function _prof_plunder() {
  player.plunderActive = true;
  addStory('⚓ Ready to plunder. Next combat victory yields +80% gold.');
  _goBack();
}

async function _prof_sea_legs() {
  player.seaLegsActive = true;
  addStory('🌊 At home on the coast. Coastal and Ocean travel costs 0 stamina until used.');
  _goBack();
}

async function _prof_dread_flag() {
  const cell = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  if (!['Coastal', 'Ocean'].includes(cell.biome)) {
    addStory('💀 This ability only works in Coastal or Ocean territory.'); _goBack(); return;
  }
  player.dreadFlagActive = true;
  addStory('💀 Your reputation flies before you. Enemies here have a 50% chance to flee before engaging.');
  _goBack();
}

async function _prof_woodland_stride() {
  player.woodlandStrideActive = true;
  addStory('🌲 You flow through the terrain without effort. Next travel has no terrain stamina penalty.');
  _goBack();
}

async function _prof_natural_guardian() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  combatState.naturalGuardian = true;
  addStory('🌿 You stand ready. Once this combat, you will negate a hit that would incapacitate you.');
  _showCombatWheel();
}

async function _prof_study() {
  await runInlineProgress('Studying…', 2500);
  const tier = performSkillCheck('Decrypting');
  if (tier <= 2) { addStory('📚 Your study yields nothing new this time.'); _goBack(); return; }
  const allRecipes = [...(typeof Recipes !== 'undefined' ? [...(Recipes.Crafting || []), ...(Recipes.Alchemy || [])] : [])];
  const known = player.knownRecipes || [];
  const unknown = allRecipes.filter(r => !known.includes(r.name));
  if (!unknown.length) { addStory('📚 You already know every recipe available.'); _goBack(); return; }
  const learned = unknown[Math.floor(Math.random() * unknown.length)];
  if (typeof learnRecipe === 'function') learnRecipe(learned.name);
  else { if (!player.knownRecipes) player.knownRecipes = []; player.knownRecipes.push(learned.name); }
  addStory(`📚 Study reveals: you learn the recipe for ${learned.name}.`);
  _goBack();
}

async function _prof_decipher_runes() {
  player.decipherRunesReady = true;
  addStory('🔤 You attune your mind. Your next Decrypting check automatically succeeds.');
  _goBack();
}

async function _prof_font_of_knowledge() {
  await runInlineProgress('Recalling your research…', 2000);
  const cell  = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
  const all   = cell.establishments || [];
  let revealed = 0;
  all.forEach(e => {
    discoverEstablishment?.(player.currentLocation, e.name, false);
    revealed++;
  });
  addStory(`🏛️ Your research pays off — you know of ${revealed} establishment${revealed !== 1 ? 's' : ''} here.`);
  _goBack();
}

async function _prof_dirty_trick() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Applying poison…', 1000);
  applyCondition('poisoned');
  addStory(`☠️ You slip poison onto the ${combatState.enemy.name}. They are now Poisoned.`);
  // Simulate poison tick — reduce enemy life each round via a flag
  combatState.enemyPoisoned = true;
  _showCombatWheel();
}

async function _prof_battle_cry() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  combatState.battleCryActive = true;
  addStory('📣 Your battle cry rings out! All party attacks deal +2 damage this round.');
  _showCombatWheel();
}

async function _prof_killing_blow() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  const e = combatState.enemy;
  if (e.life >= e.maxLife * 0.3) {
    addStory(`⛔ ${e.name} is not weakened enough (must be below 30% HP).`);
    _showCombatWheel(); return;
  }
  await runInlineProgress('Delivering the killing blow…', 1000);
  addStory(`💀 You deliver the killing blow. The ${e.name} falls.`);
  e.life = 0;
  _resolveCombatVictory();
}

async function _prof_gather_intel() {
  await runInlineProgress('Observing…', 2000);
  const tier = performSkillCheck('Stealth');
  if (tier <= 2) { addStory('🕵️ You learn nothing of value.'); _goBack(); return; }
  const secrets = [
    'They owe a debt they cannot repay.',
    'They are not who they claim to be.',
    'They carry information that powerful people want suppressed.',
    'They are being watched by someone else in this settlement.',
    'Their true motivation is self-preservation above all else.',
  ];
  addStory(`🕵️ Intel gathered: ${secrets[Math.floor(Math.random() * secrets.length)]}`);
  awardProfessionXp('social_success');
  _goBack();
}

async function _prof_plant_evidence() {
  await runInlineProgress('Planting evidence…', 2000);
  const tier = performSkillCheck('Stealth');
  if (tier <= 2) { addStory('📄 Your manipulation is too clumsy. No effect.'); _goBack(); return; }
  const npcs = player.journal?.npcs || [];
  if (!npcs.length) { addStory('📄 No known NPCs to manipulate.'); _goBack(); return; }
  const target = npcs[Math.floor(Math.random() * npcs.length)];
  if (typeof worldNPCs !== 'undefined' && target.worldId) {
    const rec = worldNPCs.find(n => n.id === target.worldId);
    if (rec) rec.relationship = Math.min(5, (rec.relationship || 0) + 3);
  }
  addStory(`📄 Evidence planted. ${target.name}'s relationship with you improves.`);
  awardProfessionXp('social_success');
  _goBack();
}

async function _prof_vanish() {
  await runInlineProgress('Vanishing…', 800);
  addStory('💨 You are gone before anyone realises. No trace.');
  if (combatState) combatState = null;
  _showDefaultWheel();
}

// ── Skill Contextual Actions ─────────────────────────────────

function _getSkillActionsForWheel(wheelName) {
  const available = (typeof SKILL_CONTEXTUAL_ACTIONS !== 'undefined' ? SKILL_CONTEXTUAL_ACTIONS : [])
    .filter(a => a.wheel === wheelName && (player.skills?.[a.skill]?.level ?? 0) >= a.minLevel)
    .sort((a, b) => (player.skills?.[b.skill]?.level ?? 0) - (player.skills?.[a.skill]?.level ?? 0))
    .slice(0, 3);
  return available.map(a => ({
    label:  a.label,
    action: () => _doSkillAction(a.id),
  }));
}

async function _doSkillAction(id) {
  _buildWheel([{ label: '⏳ Using skill…', action: () => {} }]);
  switch (id) {
    case 'sk_power_strike':   await _skAct_power_strike();   break;
    case 'sk_disarm':         await _skAct_disarm();         break;
    case 'sk_aimed_shot':     await _skAct_aimed_shot();     break;
    case 'sk_grapple':        await _skAct_grapple();        break;
    case 'sk_calm_beast':     await _skAct_calm_beast();     break;
    case 'sk_rally':          await _skAct_rally();          break;
    case 'sk_read_tracks':    await _skAct_read_tracks();    break;
    case 'sk_chart_area':     await _skAct_chart_area();     break;
    case 'sk_mend_wounds':    await _skAct_mend_wounds();    break;
    case 'sk_field_surgery':  await _skAct_field_surgery();  break;
    case 'sk_quick_brew':     await _skAct_quick_brew();     break;
    case 'sk_identify_plants':await _skAct_identify_plants();break;
    case 'sk_inspire':        await _skAct_inspire();        break;
    case 'sk_read_aura':      await _skAct_read_aura();      break;
    default: addStory(`⛔ Unknown skill action: ${id}.`); _goBack();
  }
}

async function _skAct_power_strike() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  if (player.stamina < 10) { addStory('⛔ Not enough stamina (need 10).'); _showCombatWheel(); return; }
  changeStamina(-10);
  await runInlineProgress('Power Strike…', 1500);
  const skill    = _getBestCombatSkill();
  const base     = Math.max(14, Math.floor(Math.random() * 20) + 1);
  const tier     = base <= 18 ? 4 : 5;
  const wepBonus = _getEquippedWeaponDamage();
  const dmg      = Math.max(1, tier * 4 + randomInt(0, 4) + Math.floor(wepBonus * 0.4));
  combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
  gainSkillXp(skill, tier);
  addStory(`⚔️ Power Strike! ${dmg} damage. (${combatState.enemy.life}/${combatState.enemy.maxLife} HP)`);
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _partyAssistCombat();
  if (combatState?.enemy?.life <= 0) { _resolveCombatVictory(); return; }
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _skAct_disarm() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Disarming…', 1500);
  const tier = performSkillCheck('Swordsmanship');
  if (tier <= 2) { addStory('🗡️ The disarm fails — they keep their weapon.'); _enemyCounterattack(); _showCombatWheel(); return; }
  combatState.enemy.damage = [1, 3];
  addStory(`🗡️ You knock the weapon aside! The ${combatState.enemy.name} fights barehanded (1–3 damage).`);
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _skAct_aimed_shot() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Taking aim…', 2000);
  const tier    = performSkillCheck('Archery');
  const wepBonus = _getEquippedWeaponDamage();
  const dmg     = Math.max(1, tier * 4 + randomInt(-1, 3) + Math.floor(wepBonus * 0.4));
  combatState.enemy.life = Math.max(0, combatState.enemy.life - dmg);
  addStory(`🎯 Aimed shot hits for ${dmg} — no counterattack this round. (${combatState.enemy.life}/${combatState.enemy.maxLife} HP)`);
  if (combatState.enemy.life <= 0) { _resolveCombatVictory(); return; }
  _partyAssistCombat();
  if (combatState?.enemy?.life <= 0) { _resolveCombatVictory(); return; }
  combatState.round++;
  _showCombatWheel();
}

async function _skAct_grapple() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  await runInlineProgress('Grappling…', 1500);
  const tier = performSkillCheck('Brawling');
  if (tier <= 2) { addStory('🤼 They shake you off.'); _enemyCounterattack(); _showCombatWheel(); return; }
  combatState.grappled         = true;
  combatState.enemySkipsNext   = true;
  addStory(`🤼 You get a hold on the ${combatState.enemy.name}! They can't flee and lose their next attack.`);
  combatState.round++;
  _showCombatWheel();
}

async function _skAct_calm_beast() {
  if (!combatState) { addStory('⛔ Not in combat.'); _goBack(); return; }
  const BEASTS = ['Wolf', 'Wolves', 'Bear', 'Boar', 'Giant Spider', 'Rat'];
  if (!BEASTS.includes(combatState.enemy.name)) {
    addStory('🐾 This only works on beasts, not intelligent foes.'); _showCombatWheel(); return;
  }
  await runInlineProgress('Calming the beast…', 2000);
  const tier = performSkillCheck('Animal Handling');
  if (tier >= 4) {
    addStory(`🐾 The ${combatState.enemy.name} calms and withdraws. No further hostility.`);
    combatState = null; _showDefaultWheel(); return;
  }
  addStory(`🐾 The beast hesitates but does not yield.`);
  combatState.enemy.damage = [Math.max(1, combatState.enemy.damage[0] - 1), Math.max(1, combatState.enemy.damage[1] - 2)];
  _enemyCounterattack();
  if (player.life <= 0) { _resolveCombatDefeat(); return; }
  _showCombatWheel();
}

async function _skAct_rally() {
  await runInlineProgress('Rallying…', 1500);
  const tier = performSkillCheck('Persuasion');
  if (tier <= 2) { addStory('📯 The call falls flat. No effect.'); if (combatState) _showCombatWheel(); else _goBack(); return; }
  changeStamina(10);
  applyCondition('inspired', 2);
  (player.party || []).forEach(m => addStory(`📯 ${m.name} is rallied!`));
  addStory('📯 Your rallying cry steels the party. +10 stamina and Inspired.');
  awardProfessionXp('social_success');
  if (combatState) _showCombatWheel(); else _goBack();
}

async function _skAct_read_tracks() {
  await runInlineProgress('Reading the tracks…', 2500);
  const tier = performSkillCheck('Tracking');
  const findings = [
    'The ground tells you nothing. The trail is old.',
    'Something passed through here recently — unclear what.',
    'Fresh boot prints. A group of 2–3 passed this way within the hour.',
    'You read the land clearly: wildlife is active to the north, and a small camp lies nearby.',
    'The tracks speak volumes — a hunting party, a wounded animal, and signs of a struggle. Nothing escapes your notice.',
  ];
  addStory(`🔍 ${findings[tier - 1]}`);
  if (tier >= 4) player.guaranteedHuntEncounter = true;
  _goBack();
}

async function _skAct_chart_area() {
  await runInlineProgress('Charting…', 2500);
  const tier = performSkillCheck('Navigation');
  if (tier <= 1) { addStory('🗺️ Your charting is off. Nothing useful mapped.'); _goBack(); return; }
  const key   = player.currentLocation;
  const match = key.match(/^x(\d+)_y(\d+)$/);
  if (!match) { _goBack(); return; }
  const cx = +match[1], cy = +match[2], radius = tier >= 4 ? 2 : 1;
  let count = 0;
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const ckey = `x${cx + dx}_y${cy + dy}`;
      if (mapData?.[ckey] && !mapData[ckey].discovered) { _markDiscovered(ckey); count++; }
    }
  }
  addStory(`🗺️ You chart the area — ${count} new cell${count !== 1 ? 's' : ''} revealed.`);
  setupMap?.();
  awardProfessionXp('location_discover');
  _goBack();
}

async function _skAct_mend_wounds() {
  await runInlineProgress('Treating wounds…', 2000);
  const hasBandage = (player.inventory?.['Bandage']?.quantity ?? 0) > 0;
  const hasHerb    = Object.keys(player.inventory || {}).some(k => /healing herb/i.test(k) && (player.inventory[k].quantity ?? 0) > 0);
  if (!hasBandage && !hasHerb) {
    addStory('🩹 You need a Bandage or Healing Herb to mend wounds.'); _goBack(); return;
  }
  if (hasBandage) removeItem('Bandage', 1);
  else {
    const herbKey = Object.keys(player.inventory).find(k => /healing herb/i.test(k));
    if (herbKey) removeItem(herbKey, 1);
  }
  const tier = performSkillCheck('Healing');
  const heal = tier >= 4 ? 20 : tier >= 3 ? 15 : 10;
  changeLife(heal);
  addStory(`🩹 You tend to the wounds. +${heal} life.`);
  awardProfessionXp('heal');
  _goBack();
}

async function _skAct_field_surgery() {
  if (!(player.conditions || []).find(c => c.id === 'injured')) {
    addStory('🩺 You are not Injured — no surgery needed.'); _goBack(); return;
  }
  await runInlineProgress('Performing field surgery…', 3000);
  const tier = performSkillCheck('Healing');
  if (tier <= 2) { addStory('🩺 The surgery is incomplete. Injured condition remains.'); _goBack(); return; }
  removeCondition('injured');
  changeLife(25);
  addStory('🩺 Surgery complete. Injured condition removed and +25 life restored.');
  awardProfessionXp('heal');
  _goBack();
}

async function _skAct_quick_brew() {
  await runInlineProgress('Quick brew…', 2000);
  const herbKey = Object.keys(player.inventory || {}).find(k => /healing herb/i.test(k) && (player.inventory[k].quantity ?? 0) >= 2);
  if (!herbKey) { addStory('⚗️ Need at least 2 Healing Herbs to quick-brew.'); _goBack(); return; }
  removeItem(herbKey, 2);
  const tier = performSkillCheck('Alchemy');
  if (tier <= 1) { addStory('⚗️ The mixture is wrong. Materials wasted.'); _goBack(); return; }
  addItem('Health Potion', 1, { type: 'potion', weight: 0.3, rarity: 'Common', consumable: true });
  addStory('⚗️ Quick Brew: 1× Health Potion crafted.');
  awardProfessionXp('brew');
  _goBack();
}

async function _skAct_identify_plants() {
  await runInlineProgress('Examining the flora…', 2000);
  const tier = performSkillCheck('Herbalism');
  if (tier <= 2) { addStory('🌿 Nothing particularly useful here.'); _goBack(); return; }
  const qty = tier >= 5 ? 3 : 2;
  addItem('Healing Herb', qty, { type: 'material', weight: 0.1, rarity: 'Common', consumable: false });
  addStory(`🌿 You identify and harvest ${qty}× Healing Herb.`);
  _goBack();
}

async function _skAct_inspire() {
  await runInlineProgress('Inspiring…', 1500);
  const tier = performSkillCheck('Persuasion');
  if (tier <= 2) { addStory('✨ Your words ring hollow. No one is moved.'); _goBack(); return; }
  applyCondition('inspired', 3);
  addStory('✨ Your words lift spirits. You and the party feel inspired.');
  awardProfessionXp('social_success');
  _goBack();
}

async function _skAct_read_aura() {
  await runInlineProgress('Reading the aura…', 2000);
  const tier = performSkillCheck('Mysticism');
  if (tier <= 2) { addStory('🔮 The aura is murky. You read nothing.'); _goBack(); return; }
  const insights = [
    'A concealed fear drives them.',
    'They are not acting of their own free will.',
    'Greed is their true master.',
    'They harbour a deep loyalty to someone you haven\'t met.',
    'Their aura is surprisingly clean — this person means well.',
  ];
  addStory(`🔮 Reading the aura: ${insights[Math.floor(Math.random() * insights.length)]}`);
  _goBack();
}

// ============================================================
// SECTION 13 · SAVE / LOAD
// ============================================================

// 13.1 · Save Game
				function saveGame(silent = false) {
					try {
						if (player.storyLog.length > 400) player.storyLog = player.storyLog.slice(-400);
					player.storyLog = player.storyLog.filter(e => !e.startsWith('📂 Game loaded'));
						const snapshot = {
							player: player,
							borderSelections: borderSelections,
							worldEconomy: worldEconomy,
							worldNPCs: worldNPCs,
						};
						const json = JSON.stringify(snapshot);
						localStorage.setItem(SAVE_KEY(_activeSlot), json);
						localStorage.setItem(SAVE_META(_activeSlot), JSON.stringify({
							name: player.name || 'Unknown',
							level: player.level || 1,
							location: player.currentLocation || '',
							time: Date.now(),
						}));
						localStorage.setItem(ACTIVE_SLOT_KEY, String(_activeSlot));
						if (!silent) addStory(`💾 Game saved (Slot ${_activeSlot + 1}).`);
					} catch (err) {
						console.error('Save failed', err);
						addStory('Save failed.');
					}
				}

				function _getSaveSlots() {
					const slots = [];
					for (let i = 0; i < SAVE_SLOT_COUNT; i++) {
						const raw = localStorage.getItem(SAVE_META(i));
						if (raw) {
							try { slots.push({ slot: i, ...JSON.parse(raw) }); }
							catch(_) { slots.push({ slot: i, name: 'Corrupted', level: 0, time: 0 }); }
						} else {
							slots.push({ slot: i, empty: true });
						}
					}
					return slots;
				}

				function _showSaveSlotModal(mode) {
					const modal   = document.getElementById('save-slot-modal');
					const title   = document.getElementById('ss-title');
					const list    = document.getElementById('ss-slot-list');
					const cancel  = document.getElementById('ss-cancel');
					if (!modal) return;

					title.textContent = mode === 'load' ? '📂 Load Game' : '🆕 New Game — Choose Slot';
					list.innerHTML = '';

					const slots = _getSaveSlots();
					slots.forEach(s => {
						const row = document.createElement('div');
						row.className = 'ss-slot' + (s.slot === _activeSlot ? ' ss-slot--active' : '') + (s.empty ? ' ss-slot--empty' : '');

						const timeStr = s.time ? new Date(s.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '';
						row.innerHTML = s.empty
							? `<span class="ss-slot-num">Slot ${s.slot + 1}</span><span class="ss-slot-empty-lbl">— Empty —</span>`
							: `<span class="ss-slot-num">Slot ${s.slot + 1}${s.slot === _activeSlot ? ' ✦' : ''}</span>
							   <span class="ss-slot-info"><strong>${s.name}</strong> · Lv ${s.level}</span>
							   <span class="ss-slot-time">${timeStr}</span>`;

						if (mode === 'load' && !s.empty) {
							row.onclick = () => {
								modal.style.display = 'none';
								loadGame(s.slot);
							};
						} else if (mode === 'new') {
							if (!s.empty) {
								// Add a small delete button for occupied slots
								const del = document.createElement('button');
								del.className = 'ss-delete';
								del.textContent = '🗑';
								del.title = 'Delete this save';
								del.onclick = (e) => {
									e.stopPropagation();
									if (!confirm(`Delete save in Slot ${s.slot + 1} (${s.name})? This cannot be undone.`)) return;
									localStorage.removeItem(SAVE_KEY(s.slot));
									localStorage.removeItem(SAVE_META(s.slot));
									_showSaveSlotModal('new'); // refresh
								};
								row.appendChild(del);
							}
							row.onclick = () => {
								modal.style.display = 'none';
								_activeSlot = s.slot;
								localStorage.setItem(ACTIVE_SLOT_KEY, String(_activeSlot));
								// Clear this slot's save so char creation starts fresh
								localStorage.removeItem(SAVE_KEY(_activeSlot));
								localStorage.removeItem(SAVE_META(_activeSlot));
								_bookEnterCharCreation();
							};
						}
						list.appendChild(row);
					});

					cancel.onclick = () => { modal.style.display = 'none'; };
					modal.style.display = 'flex';
				}

// 13.2 · Load Game
function loadGame(slot) {
  if (slot === undefined) slot = _activeSlot;
  const raw = localStorage.getItem(SAVE_KEY(slot));
  if (!raw) {
    addStory('No saved game in that slot.');
    return;
  }
  _activeSlot = slot;
  localStorage.setItem(ACTIVE_SLOT_KEY, String(_activeSlot));

  let obj;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    console.error('Couldn’t parse save:', e);
    addStory('Your saved game is corrupted.');
    return;
  }

  console.log('▶️ loaded save data:', obj);
  if (typeof obj !== 'object' || obj === null) {
    addStory('Invalid save format.');
    return;
  }

  const savedPlayer = obj.player || {};
  const savedBorders = obj.borderSelections || {};
  const savedBordersVis = obj.bordersVisible ?? false;

  // 👉 Instead of Object.assign(player, savedPlayer)
  for (const [key, value] of Object.entries(savedPlayer)) {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(player), key);
    if (descriptor && (descriptor.get || descriptor.set)) {
      // it's a getter/setter → skip it
      continue;
    }
    player[key] = value;
  }

  Object.assign(borderSelections, savedBorders);
  bordersVisible = savedBordersVis;
  if (obj.worldEconomy) Object.assign(worldEconomy, obj.worldEconomy);
  if (obj.worldNPCs)   Object.assign(worldNPCs,   obj.worldNPCs);

  // Migrate saves that predate quickSlots
  if (!Array.isArray(player.quickSlots)) player.quickSlots = Array(10).fill(null);
  // Migrate saves that predate pouchContents
  if (!player.pouchContents) player.pouchContents = { herb: {}, ingredient: {} };
  if (!player.pouchContents.herb) player.pouchContents.herb = {};
  if (!player.pouchContents.ingredient) player.pouchContents.ingredient = {};
  // Migrate saves that predate activePouches; also absorb any pouches that landed in inventory
  if (!player.activePouches) player.activePouches = { herb: null, ingredient: null, coin: null };
  const _invPouchNames = ['Herb Pouch (Large)','Herb Pouch','Ingredient Pouch (Large)','Ingredient Pouch','Coin Pouch (Large)','Coin Pouch'];
  _invPouchNames.forEach(pn => {
    if (player.inventory?.[pn]) {
      if (/^Herb Pouch/.test(pn) && !player.activePouches.herb)       player.activePouches.herb       = pn;
      if (/^Ingredient Pouch/.test(pn) && !player.activePouches.ingredient) player.activePouches.ingredient = pn;
      if (/^Coin Pouch/.test(pn) && !player.activePouches.coin)       player.activePouches.coin       = pn;
      delete player.inventory[pn];
    }
  });

  // Re-register any generated quests (from bulletin boards / NPC offers / events)
  // so getQuestDef() can find them after a load.
  if (player.bulletinQuests && typeof quests !== 'undefined') {
    for (const locationQuests of Object.values(player.bulletinQuests)) {
      for (const q of locationQuests) {
        if (q.id && q.id.startsWith('gen_') && !quests.find(e => e.id === q.id)) {
          quests.push(q);
        }
      }
    }
  }

  // Restore fog-of-war state from saved discoveredCells
  if (player.discoveredCells && typeof mapData !== 'undefined') {
    for (const coord of Object.keys(player.discoveredCells)) {
      if (mapData[coord]) mapData[coord].discovered = true;
    }
  }
  // Re-apply kingdom reveals for any map items in inventory
  if (player.inventory && typeof mapData !== 'undefined') {
    for (const name of Object.keys(player.inventory)) {
      const m = name.match(/^Map of (.+)$/);
      if (m && !(player.knownKingdoms || {})[m[1]]) learnKingdom(m[1]);
    }
  }

  checkDiscovery();

  // Restore story log across book pages
  _bookRestoreStoryLog();

  // Mark the boundary between the old log and this new session
  const _dividerEl = document.getElementById('story');
  if (_dividerEl && _dividerEl.children.length) {
    const _div = document.createElement('div');
    _div.className = 'story-divider';
    _dividerEl.appendChild(_div);
    if (bookState.story?.pages) bookState.story.pages[bookState.story.current] = _dividerEl.innerHTML;
  }

  updatePlayerStats();
  updateBorderList();

  // Restore campSetup flag from saved campLocation
  campSetup = !!player.campLocation;

  addStory(`📂 Game loaded (Slot ${_activeSlot + 1}).`);
  _showDefaultWheel();
  if (!worldNPCs.npcRumors?.length) seedRumorsFromWorldEvents();

  if (document.getElementById('map-modal').style.display === 'block') {
    setupMap();
  }
  renderMapsPanel?.();
  const m = player.currentLocation.match(/^x(\d+)_y(\d+)$/);
  if (m) {
    const [, xStr, yStr] = m;
    updatePlayerSymbol(+xStr, +yStr);
  }
  updateTopStats();
}

	// ============================================================
// SECTION 14 · CHARACTER CREATION
// ============================================================

// 14.1 · Character Modal Setup

// ── Social class definitions ───────────────────────────────────────────────
const SOCIAL_CLASS_DATA = {
  'Military':         { icon: '⚔',  desc: 'Soldiers, knights, and those who serve by the sword.' },
  'Royalty':          { icon: '👑', desc: 'Kings, queens, and those born to rule.' },
  'Noble':            { icon: '🏛', desc: 'Lords, administrators, and landed gentry.' },
  'Peasant':          { icon: '🌾', desc: 'Common labourers and the working poor.' },
  'Artisan':          { icon: '🔨', desc: 'Skilled craftsmen and tradespeople.' },
  'Outcast':          { icon: '🌑', desc: 'Criminals, exiles, and those outside the law.' },
  'Performance Arts': { icon: '🎭', desc: 'Performers, entertainers, and keepers of culture.' },
  'Scholar':          { icon: '📖', desc: 'Learned minds who pursue knowledge and truth.' },
  'Arcane':           { icon: '✨', desc: 'Practitioners of magic and the mystical arts.' },
};

// ── Profession data — keyed by canonical profession name ─────────────────
// Shared across cultures where noted; culture-specific ones appear per section.
const PROFESSION_DATA = {

  // ── Shared ────────────────────────────────────────────────────────────────
  'Ranger':       { socialClass:'Military',   desc:'A guardian of wilderness who walks between worlds',                              skills:['Survival','Archery','Stealth'],          trait:'Brave',       items:[['Hunting Bow',1],['Arrow',12],['Leather Armor',1],['Rope',1],['Rations',2]],             gold:15, recipes:['Arrows','Hunting Trap','Torch','Rope','Leather Wrap'] },
  'Sellsword':    { socialClass:'Military',   desc:'A blade for hire with loyalty only to coin',                                    skills:['Swordsmanship','Brawling','Survival'],   trait:'Ruthless',    items:[['Sword',1],['Shield',1],['Leather Armor',1],['Health Potion',1],['Rations',2]],         gold:40, recipes:['Torch','Rope','Stone Knife'] },
  'Scout':        { socialClass:'Military',   desc:'A light reconnaissance specialist skilled in moving unseen',                    skills:['Stealth','Tracking','Survival'],         trait:'Cunning',     items:[['Short Sword',1],['Dark Cloak',1],['Compass',1],['Rope',1],['Rations',2]],             gold:15, recipes:['Torch','Rope','Stone Knife'] },
  'Woodsman':     { socialClass:'Commonfolk', desc:'A forest-dweller who lives by axe and fire in the deep woods',                  skills:['Survival','Crafting','Tracking'],        trait:'Brave',       items:[['Hunting Knife',1],['Rope',1],['Torch',2],['Rations',3]],                             gold:10, recipes:['Rope','Torch','Stone Knife','Hunting Trap','Leather Wrap'] },
  'Farmer':       { socialClass:'Commonfolk', desc:'A salt-of-the-earth soul forced from familiar fields',                          skills:['Survival','Crafting','Healing'],         trait:'Loyal',       items:[['Pitchfork',1],['Rations',4],['Rope',1],['Waterskin',1],['Seed Pouch',1]],             gold:10, recipes:['Berry Stew','Mushroom Broth','Rope','Stick Bundle'] },
  'Hunter':       { socialClass:'Commonfolk', desc:'A tracker and provider who lives off the land',                                 skills:['Tracking','Archery','Survival'],         trait:'Brave',       items:[['Hunting Knife',1],['Bow',1],['Arrow',10],['Rope',1],['Rations',2]],                  gold:10, recipes:['Arrows','Hunting Trap','Rope','Leather Wrap','Cooked Venison'] },
  'Wanderer':     { socialClass:'Commonfolk', desc:'A rootless traveller who belongs to no land and every road',                    skills:['Survival','Persuasion','Navigation'],    trait:'Cunning',     items:[['Belt Knife',1],['Waterskin',1],['Rations',3],['Rope',1],['Torch',1]],                gold:15, recipes:['Torch','Rope','Berry Stew'] },
  'Forager':      { socialClass:'Commonfolk', desc:'A gatherer who lives off what the land freely gives between settlements',       skills:['Foraging','Survival','Herbalism'],       trait:'Wise',        items:[['Hunting Knife',1],['Herb Pouch',1],['Rope',1],['Rations',2],['Torch',1]],            gold:10, recipes:['Herb Poultice','Berry Stew','Mushroom Broth','Rope'] },
  'Scavenger':    { socialClass:'Commonfolk', desc:'One who picks through ruins and discarded things for anything of value',        skills:['Survival','Crafting','Tracking'],        trait:'Cunning',     items:[['Belt Knife',1],['Rope',1],['Torch',2],['Rations',2]],                                gold:5,  recipes:['Stone Knife','Torch','Rope','Stick Bundle'] },
  'Trapper':      { socialClass:'Commonfolk', desc:'A patient hunter who relies on snares and hidden traps rather than the blade',  skills:['Tracking','Survival','Crafting'],        trait:'Cunning',     items:[['Hunting Knife',1],['Rope',2],['Rations',2],['Torch',1]],                             gold:8,  recipes:['Hunting Trap','Rope','Torch','Leather Wrap'] },
  'Smith':        { socialClass:'Artisan',    desc:'A craftsman who shapes metal into weapons, tools, and armour',                  skills:['Smithing','Crafting','Brawling'],        trait:'Loyal',       items:[['Hammer',1],['Iron Ingot',2],['Leather Apron',1],['Health Potion',1],['Torch',2]],    gold:25, recipes:['Stone Knife','Stone Campfire Ring','Simple Club','Rope','Wooden Spear'] },
  'Merchant':     { socialClass:'Artisan',    desc:'A trader of goods who knows the value of everything and the price of nothing',  skills:['Persuasion','Crafting','Survival'],      trait:'Cunning',     items:[['Trading Goods',1],['Belt Knife',1],['Fine Clothing',1],['Coin Purse',1],['Rations',1]],gold:60, recipes:['Torch','Rope'] },
  'Tinkerer':     { socialClass:'Artisan',    desc:'A cobbling inventor who fashions crude contraptions from whatever is at hand',   skills:['Crafting','Alchemy','Thievery'],         trait:'Cunning',     items:[['Hammer',1],['Rope',1],['Torch',2],['Empty Vial',2],['Rations',1]],                   gold:10, recipes:['Stone Knife','Torch','Rope','Stick Bundle'] },
  'Peddler':      { socialClass:'Artisan',    desc:'A wandering dealer in found, traded, and occasionally stolen goods',            skills:['Persuasion','Thievery','Survival'],      trait:'Cunning',     items:[['Belt Knife',1],['Trading Goods',1],['Rope',1],['Rations',1],['Torch',1]],            gold:20, recipes:['Torch','Rope'] },
  'Bandit':       { socialClass:'Outlaw',     desc:'A desperate rogue who takes what they need to survive',                         skills:['Brawling','Stealth','Survival'],         trait:'Ruthless',    items:[['Dagger',2],['Dark Cloak',1],['Rope',1],['Rations',2],['Torch',1]],                   gold:15, recipes:['Torch','Stone Knife','Rope'] },
  'Pirate':       { socialClass:'Outlaw',     desc:'A sea-hardened rogue at home with salt and steel',                             skills:['Brawling','Survival','Navigation'],      trait:'Cunning',     items:[['Cutlass',1],['Pistol',1],['Rum Flask',1],['Rope',1],['Compass',1]],                   gold:25, recipes:['Rope','Torch','Stone Knife'] },
  'Shade':        { socialClass:'Outlaw',     desc:'A shadow operative who uses silence and misdirection as weapons',               skills:['Stealth','Thievery','Swordsmanship'],    trait:'Ruthless',    items:[['Short Sword',1],['Throwing Knife',3],['Black Cloak',1],['Rope',1]],                   gold:25, recipes:['Torch','Stone Knife','Rope'] },
  'Drifter':      { socialClass:'Outlaw',     desc:'A criminal wanderer who follows opportunity and avoids consequence',             skills:['Stealth','Survival','Thievery'],         trait:'Cunning',     items:[['Dagger',1],['Dark Cloak',1],['Rope',1],['Rations',2]],                               gold:20, recipes:['Torch','Stone Knife','Rope'] },
  'Apothecary':   { socialClass:'Scholar',    desc:'A learned herbalist and pharmacist who heals with knowledge',                   skills:['Healing','Alchemy','Herbalism'],         trait:'Wise',        items:[['Herb Pouch',1],['Bandage',3],['Health Potion',2],['Empty Vial',2],['Candle',2]],      gold:25, recipes:['Herb Poultice','Bandage','Berry Stew','Mushroom Broth'] },
  'Cartographer': { socialClass:'Scholar',    desc:'A surveyor of lands who turns the unknown into maps',                           skills:['Navigation','Survival','Crafting'],      trait:'Wise',        items:[['Map (Blank)',1],['Compass',1],['Quill & Ink',1],['Torch',2],['Rations',2]],            gold:20, recipes:['Torch','Rope'] },
  'Healer':       { socialClass:'Scholar',    desc:'A herbalist and physician skilled in the mending of wounds',                   skills:['Healing','Alchemy','Persuasion'],        trait:'Kind',        items:[['Healer Kit',1],['Bandage',5],['Health Potion',2],['Herb Pouch',1],['Candle',2]],       gold:20, recipes:['Herb Poultice','Bandage','Berry Stew','Mushroom Broth'] },
  'Mediator':     { socialClass:'Scholar',    desc:'A neutral negotiator trusted by multiple factions because they owe none',       skills:['Persuasion','Negotiating','Decrypting'], trait:'Wise',        items:[['Quill & Ink',1],['Scroll',1],['Fine Clothing',1],['Rations',2],['Candle',2]],          gold:25, recipes:['Torch','Berry Stew'] },
  'Alchemist':    { socialClass:'Arcane',     desc:'A creator of potions, poisons, and remedies through transmutation',            skills:['Alchemy','Healing','Crafting'],          trait:'Wise',        items:[['Health Potion',3],['Empty Vial',3],['Herb Pouch',1],['Candle',3],['Torch',1]],         gold:20, recipes:['Herb Poultice','Bandage','Mushroom Broth'] },
  'Cleric':       { socialClass:'Arcane',     desc:'A devoted servant of the divine, healer and protector of the faithful',        skills:['Healing','Light Magic','Persuasion'],    trait:'Loyal',       items:[['Holy Symbol',1],['Mace',1],['Bandage',5],['Health Potion',2],['Prayer Book',1]],        gold:20, recipes:['Herb Poultice','Bandage'] },
  'Mage':         { socialClass:'Arcane',     desc:'A scholar of the arcane arts who bends reality through study and will',        skills:['Light Magic','Alchemy','Survival'],      trait:'Wise',        items:[['Staff',1],['Spellbook',1],['Mana Potion',2],['Candle',3],['Torch',1]],                 gold:25, recipes:['Herb Poultice','Torch'] },

  // ── Elf ───────────────────────────────────────────────────────────────────
  'Sentinel':     { socialClass:'Military',   desc:'An elvish guardian who watches the ancient woodland paths in patient silence',  skills:['Archery','Stealth','Survival'],          trait:'Brave',       items:[['Hunting Bow',1],['Arrow',15],['Leather Armor',1],['Torch',1],['Rations',2]],           gold:12, recipes:['Arrows','Torch','Rope','Leather Wrap'] },
  'Pathfinder':   { socialClass:'Military',   desc:'An elvish guide and explorer of wild and unmapped places',                     skills:['Navigation','Tracking','Survival'],      trait:'Wise',        items:[['Compass',1],['Map (Blank)',1],['Hunting Knife',1],['Rope',1],['Rations',2]],           gold:15, recipes:['Torch','Rope','Hunting Trap'] },
  'Herbalist':    { socialClass:'Commonfolk', desc:'A gatherer who knows every leaf and remedy the forest holds',                   skills:['Herbalism','Healing','Foraging'],        trait:'Wise',        items:[['Herb Pouch',1],['Bandage',2],['Candle',2],['Rations',2],['Waterskin',1]],             gold:10, recipes:['Herb Poultice','Bandage','Berry Stew','Mushroom Broth'] },
  'Bowyer':       { socialClass:'Artisan',    desc:'A maker of fine bows and arrows, as skilled at the workbench as in the field', skills:['Fletching','Crafting','Archery'],        trait:'Loyal',       items:[['Bow',1],['Arrow',20],['Rope',1],['Torch',1],['Rations',2]],                           gold:15, recipes:['Arrows','Leather Wrap','Rope'] },
  'Oathbreaker':  { socialClass:'Outlaw',     desc:'An elf who violated their sacred vow, exiled and dangerous without their code',skills:['Swordsmanship','Stealth','Survival'],    trait:'Ruthless',    items:[['Short Sword',1],['Dark Cloak',1],['Rope',1],['Rations',2]],                           gold:20, recipes:['Torch','Stone Knife','Rope'] },
  'Lorekeeper':   { socialClass:'Scholar',    desc:'A keeper of ancient elvish history, genealogy, and wisdom',                    skills:['Decrypting','Persuasion','Healing'],     trait:'Wise',        items:[['Scroll',3],['Quill & Ink',1],['Candle',3],['Rations',2]],                             gold:20, recipes:['Torch','Berry Stew'] },
  'Enchanter':    { socialClass:'Arcane',     desc:'One who imbues objects with latent magical power through ancient craft',        skills:['Light Magic','Crafting','Mysticism'],    trait:'Wise',        items:[['Staff',1],['Empty Vial',2],['Candle',3],['Torch',1],['Rations',1]],                    gold:20, recipes:['Herb Poultice','Torch'] },

  // ── Dwarf ─────────────────────────────────────────────────────────────────
  'Ironguard':    { socialClass:'Military',   desc:'A heavily armoured defender of the clan hold, sworn never to yield',           skills:['Brawling','Axes','Survival'],            trait:'Loyal',       items:[['Mace',1],['Shield',1],['Chainmail',1],['Torch',2],['Rations',2]],                     gold:20, recipes:['Stone Campfire Ring','Torch','Rope'] },
  'Delver':       { socialClass:'Military',   desc:'An elite underground explorer who maps the tunnels others fear to enter',      skills:['Mining','Navigation','Survival'],        trait:'Brave',       items:[['Torch',5],['Rope',1],['Hammer',1],['Rations',3],['Candle',3]],                         gold:10, recipes:['Torch','Rope','Stone Campfire Ring'] },
  'Miner':        { socialClass:'Commonfolk', desc:'A hardened labourer who digs wealth from the earth with bare hands and will',  skills:['Brawling','Crafting','Survival'],        trait:'Loyal',       items:[['Torch',5],['Rope',1],['Candle',3],['Rations',3],['Health Potion',1]],                  gold:8,  recipes:['Torch','Stone Campfire Ring','Stick Bundle'] },
  'Brewer':       { socialClass:'Commonfolk', desc:'A dwarf craftsperson who coaxes the finest ales from grain, hop, and patience',skills:['Brewing','Crafting','Persuasion'],       trait:'Kind',        items:[['Wineskin',2],['Candle',2],['Rations',2],['Rope',1],['Torch',1]],                      gold:15, recipes:['Berry Stew','Mushroom Broth'] },
  'Engraver':     { socialClass:'Artisan',    desc:'A dwarf artisan who decorates stone and metal with patterns of lasting beauty', skills:['Crafting','Artistry','Smithing'],        trait:'Loyal',       items:[['Hammer',1],['Candle',3],['Torch',1],['Rope',1],['Rations',2]],                         gold:20, recipes:['Stone Campfire Ring','Torch','Rope'] },
  'Grudgebearer': { socialClass:'Outlaw',     desc:'A dwarf consumed by an unresolved wrong, pursuing justice by any means left',  skills:['Tracking','Brawling','Axes'],            trait:'Ruthless',    items:[['Dagger',2],['Rope',1],['Torch',2],['Rations',2],['Dark Cloak',1]],                    gold:10, recipes:['Stone Knife','Torch','Rope'] },
  'Tunnelrat':    { socialClass:'Outlaw',     desc:'An underground criminal who preys on miners and travellers in the dark',       skills:['Stealth','Mining','Thievery'],           trait:'Ruthless',    items:[['Dagger',2],['Torch',3],['Rope',1],['Rations',2]],                                     gold:15, recipes:['Stone Knife','Torch','Rope'] },
  'Chronicler':   { socialClass:'Scholar',    desc:'A keeper of clan history, recording victories, grudges, and bloodlines',       skills:['Decrypting','Persuasion','Crafting'],    trait:'Wise',        items:[['Quill & Ink',1],['Scroll',3],['Candle',4],['Torch',1],['Rations',2]],                   gold:15, recipes:['Torch','Berry Stew'] },

  // ── Goblin ────────────────────────────────────────────────────────────────
  'Raider':       { socialClass:'Military',   desc:'A goblin warrior who strikes fast, fights dirty, and vanishes before reinforcements arrive',skills:['Brawling','Axes','Survival'],trait:'Ruthless',   items:[['Dagger',2],['Leather Armor',1],['Rope',1],['Rations',2],['Torch',1]],                  gold:8,  recipes:['Stone Knife','Torch','Rope'] },
  'Skulk':        { socialClass:'Military',   desc:'A stealthy goblin operative trained in ambush, sabotage, and disappearing',    skills:['Stealth','Tracking','Brawling'],         trait:'Cunning',     items:[['Dagger',2],['Dark Cloak',1],['Rope',1],['Rations',2]],                                gold:10, recipes:['Stone Knife','Torch','Rope'] },
  'Cutpurse':     { socialClass:'Outlaw',     desc:'A skilled pickpocket who can relieve you of your coin before you notice them',  skills:['Thievery','Stealth','Persuasion'],       trait:'Cunning',     items:[['Dagger',1],['Dark Cloak',1],['Rope',1],['Rations',2]],                                gold:15, recipes:['Stone Knife','Torch','Rope'] },
  'Cutthroat':    { socialClass:'Outlaw',     desc:'A goblin killer-for-hire with no loyalty beyond the next payment',             skills:['Stealth','Brawling','Thievery'],         trait:'Ruthless',    items:[['Dagger',3],['Dark Cloak',1],['Poison Vial',1],['Rope',1]],                            gold:15, recipes:['Stone Knife','Torch','Rope'] },
  'Shaman':       { socialClass:'Scholar',    desc:'A goblin spiritual guide who channels ancestral power and old folk wisdom',     skills:['Mysticism','Healing','Herbalism'],       trait:'Wise',        items:[['Herb Pouch',1],['Candle',3],['Bandage',2],['Empty Vial',1],['Rations',2]],             gold:10, recipes:['Herb Poultice','Bandage','Berry Stew','Mushroom Broth'] },
  'Witch Doctor': { socialClass:'Scholar',    desc:'A healer who blends goblin folk remedies with spiritual practice and old magic',skills:['Healing','Mysticism','Herbalism'],       trait:'Wise',        items:[['Herb Pouch',1],['Bandage',2],['Candle',2],['Empty Vial',1],['Rations',2]],             gold:10, recipes:['Herb Poultice','Bandage','Berry Stew','Mushroom Broth'] },
  'Hex Witch':    { socialClass:'Arcane',     desc:'A practitioner of goblin folk magic: curses, wards, and remedies from the old ways',skills:['Mysticism','Alchemy','Herbalism'],  trait:'Cunning',     items:[['Herb Pouch',1],['Empty Vial',2],['Candle',3],['Dagger',1]],                           gold:15, recipes:['Herb Poultice','Mushroom Broth'] },
  'Blightcaller': { socialClass:'Arcane',     desc:'A goblin who wields corrupted magic, calling decay and pestilence as weapons',  skills:['Black Magic','Alchemy','Survival'],      trait:'Ruthless',    items:[['Staff',1],['Empty Vial',2],['Candle',2],['Poison Vial',1],['Rations',1]],              gold:15, recipes:['Torch','Mushroom Broth'] },

};
window.PROFESSION_DATA = PROFESSION_DATA;

// ── Culture data — stat modifiers and racial bonuses ─────────────────────
const CULTURE_DATA = {
  'Human':      { maxLife:100, maxStamina:50, maxMana:50, bonusSkill:null,          bonusItem:null,          bonusGold:15 },
  'Elf':        { maxLife:90,  maxStamina:50, maxMana:70, bonusSkill:'Herbalism',   bonusItem:'Herb Pouch',  bonusGold:0  },
  'Half-Elf':   { maxLife:95,  maxStamina:50, maxMana:55, bonusSkill:'Persuasion',  bonusItem:null,          bonusGold:0  },
  'Dwarf':      { maxLife:120, maxStamina:65, maxMana:30, bonusSkill:'Smithing',    bonusItem:'Iron Ingot',  bonusGold:0  },
  'Goblin':     { maxLife:80,  maxStamina:70, maxMana:35, bonusSkill:'Thievery',    bonusItem:'Dagger',      bonusGold:0  },
  'Half-Goblin':{ maxLife:85,  maxStamina:65, maxMana:40, bonusSkill:'Stealth',     bonusItem:'Dagger',      bonusGold:0  },
};
window.CULTURE_DATA = CULTURE_DATA;

// ── Professions available per culture per category ────────────────────────
const CULTURE_PROFESSIONS = {
  'Human':      { Military:['Ranger','Sellsword'],       Commonfolk:['Woodsman','Farmer'],      Artisan:['Smith','Merchant'],         Outlaw:['Bandit','Pirate'],          Scholar:['Apothecary','Cartographer'], Arcane:['Alchemist','Cleric']       },
  'Elf':        { Military:['Sentinel','Pathfinder'],    Commonfolk:['Hunter','Herbalist'],     Artisan:['Smith','Bowyer'],           Outlaw:['Oathbreaker','Shade'],      Scholar:['Lorekeeper','Healer'],       Arcane:['Mage','Enchanter']         },
  'Half-Elf':   { Military:['Scout','Sellsword'],        Commonfolk:['Wanderer','Forager'],     Artisan:['Smith','Merchant'],         Outlaw:['Shade','Drifter'],          Scholar:['Mediator','Healer'],         Arcane:['Mage','Cleric']            },
  'Dwarf':      { Military:['Ironguard','Delver'],       Commonfolk:['Miner','Brewer'],         Artisan:['Smith','Engraver'],         Outlaw:['Grudgebearer','Tunnelrat'], Scholar:['Chronicler','Healer'],       Arcane:['Enchanter','Cleric']       },
  'Goblin':     { Military:['Raider','Skulk'],           Commonfolk:['Scavenger','Trapper'],    Artisan:['Tinkerer','Peddler'],       Outlaw:['Cutpurse','Cutthroat'],     Scholar:['Shaman','Witch Doctor'],    Arcane:['Hex Witch','Blightcaller'] },
  'Half-Goblin':{ Military:['Sellsword','Scout'],        Commonfolk:['Hunter','Scavenger'],     Artisan:['Tinkerer','Merchant'],      Outlaw:['Bandit','Shade'],           Scholar:['Healer','Shaman'],           Arcane:['Alchemist','Hex Witch']    },
};
window.CULTURE_PROFESSIONS = CULTURE_PROFESSIONS;

// ── Origin data ────────────────────────────────────────────────────────────
const ORIGIN_DATA = {
  noble:      { desc: '+15 gold · Fine Clothing',           items: [['Fine Clothing',1]],               gold: 15 },
  village:    { desc: '+Rations ×2 · Rope',                 items: [['Rations',2],['Rope',1]],          gold: 0  },
  wilderness: { desc: '+Torch ×2 · Hunting Knife',          items: [['Torch',2],['Hunting Knife',1]],   gold: 0  },
  port:       { desc: '+Rope · Waterskin · +5 gold',        items: [['Rope',1],['Waterskin',1]],        gold: 5  },
};

// ── Motivation data ────────────────────────────────────────────────────────
const MOTIVATION_DATA = {
  vengeance: { desc: '+1 level to primary combat skill',         bonus: 'combat'  },
  knowledge: { desc: '+1 level to primary arcane/craft skill',   bonus: 'arcane'  },
  law:        { desc: '+1 Stealth level',                        bonus: 'stealth' },
  honor:      { desc: '+1 level to first skill',                 bonus: 'first'   },
  fortune:    { desc: '+20 gold',                                bonus: 'gold',  gold: 20 },
};

// ── Helper: determine which skill gets a motivation bonus level ────────────
function _motivationBoostedSkill(profSkills, motivationKey) {
  if (!motivationKey || !MOTIVATION_DATA[motivationKey]) return null;
  const bonus = MOTIVATION_DATA[motivationKey].bonus;
  const COMBAT_SKILLS  = new Set(['Swordsmanship','Archery','Brawling']);
  const ARCANE_SKILLS  = new Set(['Light Magic','Alchemy','Crafting','Smithing','Fletching']);
  if (bonus === 'combat')  return profSkills.find(s => COMBAT_SKILLS.has(s))  || null;
  if (bonus === 'arcane')  return profSkills.find(s => ARCANE_SKILLS.has(s))  || null;
  if (bonus === 'stealth') return profSkills.includes('Stealth') ? 'Stealth'  : null;
  if (bonus === 'first')   return profSkills[0] || null;
  return null; // 'gold' bonus has no skill effect
}

// ── Populate profession select ─────────────────────────────────────────────
const charModal   = document.getElementById('character-modal');
const createBtn   = document.getElementById('create-character-button');
const profSelect  = document.getElementById('char-profession');
const originSel   = document.getElementById('char-origin');
const motivSel    = document.getElementById('char-motivation');
let chosenGender   = null;
let chosenCulture  = null;

Object.keys(PROFESSION_DATA).sort().forEach(name => {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  profSelect.appendChild(opt);
});

// ── Gender toggle buttons ──────────────────────────────────────────────────
document.querySelectorAll('#char-gender-group .char-tog').forEach(btn => {
  btn.addEventListener('click', () => {
    chosenGender = btn.dataset.val;
    document.querySelectorAll('#char-gender-group .char-tog').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// ── Culture select ─────────────────────────────────────────────────────────
document.getElementById('char-culture-select').addEventListener('change', e => {
  chosenCulture = e.target.value || null;
});

// ── Description updates ────────────────────────────────────────────────────
profSelect.addEventListener('change', () => {
  const prof = PROFESSION_DATA[profSelect.value];
  document.getElementById('char-profession-desc').textContent = prof ? prof.desc : '';
  updateCharPreview();
});
originSel.addEventListener('change', () => {
  const orig = ORIGIN_DATA[originSel.value];
  document.getElementById('char-origin-desc').textContent = orig ? orig.desc : '';
  updateCharPreview();
});
motivSel.addEventListener('change', () => {
  const motiv = MOTIVATION_DATA[motivSel.value];
  document.getElementById('char-motivation-desc').textContent = motiv ? motiv.desc : '';
  updateCharPreview();
});

// ── Live preview ───────────────────────────────────────────────────────────
function updateCharPreview() {
  const profData  = PROFESSION_DATA[profSelect.value]  || null;
  const origData  = ORIGIN_DATA[originSel.value]        || null;
  const motivData = MOTIVATION_DATA[motivSel.value]     || null;

  const skillsEl = document.getElementById('preview-skills');
  const traitEl  = document.getElementById('preview-trait');
  const itemsEl  = document.getElementById('preview-items');
  const goldEl   = document.getElementById('preview-gold');

  if (!profData) {
    skillsEl.textContent = 'Select a profession';
    traitEl.textContent  = '—';
    itemsEl.textContent  = '—';
    goldEl.textContent   = '—';
    return;
  }

  // Skills
  const boostedSkill = _motivationBoostedSkill(profData.skills, motivSel.value);
  skillsEl.innerHTML = profData.skills.map(s => {
    const lv = (boostedSkill === s) ? 2 : 1;
    return `${s} <span style="opacity:0.65">(Lv ${lv})</span>`;
  }).join('<br>');

  // Trait
  traitEl.textContent = profData.trait;

  // Items — merge profession + origin items, sum duplicates
  const itemMap = new Map();
  const allItems = [...profData.items, ...(origData ? origData.items : [])];
  allItems.forEach(([name, qty]) => {
    itemMap.set(name, (itemMap.get(name) || 0) + qty);
  });
  itemsEl.innerHTML = [...itemMap.entries()]
    .map(([name, qty]) => qty > 1 ? `${name} ×${qty}` : name)
    .join('<br>');

  // Gold
  const totalGold = profData.gold
    + (origData  ? origData.gold  : 0)
    + (motivData && motivData.bonus === 'gold' ? (motivData.gold || 0) : 0);
  goldEl.textContent = `${totalGold} gp`;
}

// ── Create character ───────────────────────────────────────────────────────
				createBtn.onclick = async () => {
					const name = document.getElementById('char-name').value.trim();
					const profKey = profSelect.value;
					if (!name) {
						alert('Please enter a character name.');
						return;
					}
					if (!chosenGender) {
						alert('Please select a gender.');
						return;
					}
					if (!chosenCulture) {
						alert('Please select a culture.');
						return;
					}
					if (!profKey) {
						alert('Please select a profession.');
						return;
					}

					const profData  = PROFESSION_DATA[profKey];
					const origData  = ORIGIN_DATA[originSel.value]  || null;
					const motivData = MOTIVATION_DATA[motivSel.value] || null;

					// Apply identity
					player.name       = name;
					player.gender     = chosenGender;
					player.culture    = chosenCulture;
					player.profession       = profKey;
					player.professions      = { [profKey]: { tier: 0, xp: 0 } };
					player.activeProfession = profKey;
					player.socialClass      = PROFESSION_DATA[profKey]?.socialClass || '';

					// Apply skills
					const boostedSkill = _motivationBoostedSkill(profData.skills, motivSel.value);
					if (!player.skills) player.skills = {};
					profData.skills.forEach(skillName => {
						player.skills[skillName] = { level: (boostedSkill === skillName ? 2 : 1) };
					});

					// Apply culture stat bonuses
					const cultData = CULTURE_DATA[chosenCulture];
					if (cultData) {
						player.maxLife    = cultData.maxLife;
						player.life       = cultData.maxLife;
						player.maxStamina = cultData.maxStamina;
						player.stamina    = cultData.maxStamina;
						player.maxMana    = cultData.maxMana;
						player.mana       = cultData.maxMana;
						if (cultData.bonusSkill) {
							if (!player.skills[cultData.bonusSkill]) {
								player.skills[cultData.bonusSkill] = { level: 1 };
							} else {
								player.skills[cultData.bonusSkill].level = Math.min(5, (player.skills[cultData.bonusSkill].level || 1) + 1);
							}
						}
						if (cultData.bonusItem) addItem(cultData.bonusItem, 1);
					}

					// Apply trait
					player.traits = [profData.trait];

					// Apply starting recipes (silently — no per-recipe story spam at creation)
					player.knownRecipes = [];
					(profData.recipes || []).forEach(r => {
						if (!player.knownRecipes.includes(r)) player.knownRecipes.push(r);
					});

					// Apply items — merge prof + origin, sum duplicates
					const itemMap = new Map();
					const allItems = [...profData.items, ...(origData ? origData.items : [])];
					allItems.forEach(([iName, qty]) => {
						itemMap.set(iName, (itemMap.get(iName) || 0) + qty);
					});
					itemMap.forEach((qty, iName) => {
						addItem(iName, qty);
					});

					// Every character starts with a waterskin (unless their profession already gives one)
					if (!player.inventory['Waterskin'] && !player.inventory['Waterskin (Full)']) {
						addItem('Waterskin', 1, { type: 'misc', weight: 0.5, rarity: 'Common', consumable: false, description: 'An empty waterskin.' });
					}

					// Starting clothes — basic set appropriate to profession; never high-end
					const _STARTING_CLOTHES = {
					  'Ranger':       ['Brown Wool Shirt', 'Leather Pants',       'Leather Boots'],
					  'Sellsword':    ['Dark Linen Shirt',  'Leather Pants',       'Leather Boots'],
					  'Scout':        ['Dark Linen Shirt',  'Leather Pants',       'Leather Boots'],
					  'Woodsman':     ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Farmer':       ["Farmer's Tunic",    'Cloth Trousers',      'Cloth Boots'],
					  'Hunter':       ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Wanderer':     ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Forager':      ['Brown Wool Shirt',  'Cloth Trousers',      'Cloth Boots'],
					  'Scavenger':    ["Farmer's Tunic",    'Cloth Trousers',      'Cloth Boots'],
					  'Trapper':      ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Smith':        ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Merchant':     ['White Linen Shirt', 'Cloth Trousers',      'Leather Boots'],
					  'Tinkerer':     ['Brown Wool Shirt',  'Cloth Trousers',      'Leather Boots'],
					  'Peddler':      ['Brown Wool Shirt',  'Cloth Trousers',      'Leather Boots'],
					  'Bandit':       ['Dark Linen Shirt',  'Leather Pants',       'Leather Boots'],
					  'Pirate':       ['Red Linen Shirt',   'Leather Pants',       'Leather Boots'],
					  'Shade':        ['Dark Linen Shirt',  'Leather Pants',       'Leather Boots'],
					  'Drifter':      ['Dark Linen Shirt',  'Cloth Trousers',      'Cloth Boots'],
					  'Apothecary':   ['White Linen Shirt', 'Cloth Trousers',      'Cloth Boots'],
					  'Cartographer': ['Brown Wool Shirt',  'Cloth Trousers',      'Leather Boots'],
					  'Healer':       ['White Linen Shirt', 'Cloth Trousers',      'Cloth Boots'],
					  'Mediator':     ['White Linen Shirt', 'Cloth Trousers',      'Leather Boots'],
					  'Alchemist':    ['White Linen Shirt', 'Cloth Trousers',      'Cloth Boots'],
					  'Cleric':       ['Cloth Tunic',       'Cloth Trousers',      'Cloth Boots'],
					  'Mage':         ['Cloth Tunic',       'Cloth Trousers',      'Cloth Boots'],
					  'Sentinel':     ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Pathfinder':   ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Herbalist':    ['Brown Wool Shirt',  'Cloth Trousers',      'Cloth Boots'],
					  'Bowyer':       ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Oathbreaker':  ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Lorekeeper':   ['White Linen Shirt', 'Cloth Trousers',      'Cloth Boots'],
					  'Enchanter':    ['Cloth Tunic',       'Cloth Trousers',      'Cloth Boots'],
					  'Ironguard':    ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Delver':       ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Miner':        ['Brown Wool Shirt',  'Brown Wool Trousers', 'Leather Boots'],
					  'Brewer':       ['Brown Wool Shirt',  'Brown Wool Trousers', 'Cloth Boots'],
					  'Engraver':     ['Brown Wool Shirt',  'Brown Wool Trousers', 'Leather Boots'],
					  'Grudgebearer': ['Brown Wool Shirt',  'Leather Pants',       'Leather Boots'],
					  'Tunnelrat':    ['Dark Linen Shirt',  'Cloth Trousers',      'Cloth Boots'],
					  'Chronicler':   ['Brown Wool Shirt',  'Brown Wool Trousers', 'Leather Boots'],
					  'Raider':       ['Dark Linen Shirt',  'Leather Pants',       'Leather Boots'],
					  'Skulk':        ['Dark Linen Shirt',  'Cloth Trousers',      'Cloth Boots'],
					  'Cutpurse':     ['Dark Linen Shirt',  'Cloth Trousers',      'Cloth Boots'],
					  'Cutthroat':    ['Dark Linen Shirt',  'Cloth Trousers',      'Cloth Boots'],
					  'Shaman':       ['Cloth Tunic',       'Cloth Trousers',      'Cloth Boots'],
					  'Witch Doctor': ['Cloth Tunic',       'Cloth Trousers',      'Cloth Boots'],
					  'Hex Witch':    ['Cloth Tunic',       'Cloth Trousers',      'Cloth Boots'],
					  'Blightcaller': ['Cloth Tunic',       'Cloth Trousers',      'Cloth Boots'],
					};
					const _startClothes = _STARTING_CLOTHES[profKey] || ['Cloth Tunic', 'Cloth Trousers', 'Cloth Boots'];
					_startClothes.forEach(clothingName => {
					  addItem(clothingName, 1);
					  const _slot = _getEquipSlot(clothingName, 'armor');
					  if (!player.equipped[_slot]) player.equipped[_slot] = clothingName;
					});

					// Apply gold
					const motivGold = (motivData && motivData.bonus === 'gold') ? (motivData.gold || 0) : 0;
					const cultGold  = cultData ? (cultData.bonusGold || 0) : 0;
					player.gold = profData.gold + (origData ? origData.gold : 0) + motivGold + cultGold;

					// Store background for profile
					player.origin     = originSel.value;
					player.motivation = motivSel.value;

					// Refresh all UI
					updateTopStats();
					updateInventory();
					updatePlayerStats();

					// Start weary and hungry — illustrates stat recovery gameplay
					player.life    = Math.max(1, Math.floor(player.maxLife    * 0.25));
					player.stamina = Math.max(1, Math.floor(player.maxStamina * 0.25));
					player.mana    = 0;
					applyCondition('hungry', 999);
					updateTopStats();

					_bookExitCharCreation(() => {
						addStory(`Character created. Welcome ${name}.`);
						addWorldEvent(`${name} begins their journey as a ${profKey}.`, 'player');
						addStory(`You arrive on unfamiliar shores, to a place unknown to you- a land stricken from any map you've ever seen. There's a mystical presence about this place, the very air smelling of wonder and mystery. Weary and hungry after your long journey here, you must choose your next steps wisely...`);
					});

await waitForEnter();
addStory('You look around, trying to get your bearings...');
await waitForEnter();

					// 🔍 pick a random Coastal wilderness cell (not a settlement)
					const coastalKeys = Object.entries(mapData)
						.filter(([k, cell]) => cell.biome === 'Coastal' && !['City','CapitalCity','Village'].includes(cell.zone || ''))
						.map(([k]) => k);

					let coord;
					if (coastalKeys.length) {
						coord = coastalKeys[Math.floor(Math.random() * coastalKeys.length)];
					} else {
						// fallback if no coastal cells defined
						const allKeys = Object.keys(mapData);
						coord = allKeys[Math.floor(Math.random() * allKeys.length)];
					}

					player.currentLocation = coord;
					updateTopStats();

					// now reposition the map marker as before…
					const [, xStr, yStr] = coord.match(/^x(\d+)_y(\d+)$/);
					updatePlayerSymbol(+xStr, +yStr);
					const _startCell = (typeof mapData !== 'undefined' && mapData[coord]) || {};
					const _startName = _startCell.cityVillage || _startCell.biome || 'Unknown lands';
					addStory(`Starting location: ${_startName}`);

					// reposition the map marker
					updatePlayerSymbol(
						parseInt(xStr, 10),
						parseInt(yStr, 10)
					);
					saveGame();
addStory("You soon realize you're lost.");
await waitForEnter();
addStory("A strange feeling comes over you. Drawn by this strange sensation, you glance down- and there, half-entombed in the dirt, lies a peculiar object.");
await waitForEnter();
addStory("A small, spherical object, crimson in color, gleaming like a polished mirror; its elegance draws your gaze like a campfire to weary eyes...");
await waitForEnter();
addStory("Cautiously, you reach down to pick it up, and you realize that although spherical, its roundness is not smooth, but constructed of exactly twenty flat, triangular surfaces combined symmetrically into a single, bizarre shape, for which no name comes to mind.");
await waitForEnter();
addStory("The instant your fingertips graze its smooth surface, you feel a profound energy surge through you that feels both frightening and strangely familiar...");
await waitForEnter();
addStory("As you stare into the object, you begin to lose yourself within its seemingly infinite depth. Your thoughts are silenced. You feel somehow... connected to it...");
await waitForEnter();
addStory("A faint ember awakens at the heart of the sphere- a soft glow at its core that pulses slowly, as if breathing...");
await waitForEnter();
addStory("You can't shake the distinct feeling that the it's staring back at you. Observing. Peering into your very soul...");
await waitForEnter();
addStory("In a fleeting moment of unease, it crosses your mind to discard it- to leave it in the dirt where you found it and never look back. Yet the notion triggers a sharp sorrow, tears welling in a sudden moment of grief. You feel a deep attachment to it. The object has anchored itself to you, or you to it; the difference no longer matters. Without it, you'd be lost...");
await waitForEnter();
addStory("It holds a strange compulsion over you. You feel as though it's as much a part of you as your own hands...");
await waitForEnter();
addStory("You turn it in your hand, looking curiously upon its many surfaces, pondering its nature, and suddenly you notice symbols beginning to appear upon them. Not just symbols; numbers.");
await waitForEnter();
addStory("A voice permeates your mind, speaking to you in a tongue older than words- a language unknown to you, and yet you understand it clearly. Purpose floods your veins and your path seems to be laid before you as the object plants in your mind images of past, present and future together as one in a glorious unity...");
await waitForEnter();
addStory("It has chosen you. You are now its keeper. It guides you, though you know not whether it's toward your destiny, or your doom...");
addWorldEvent('Bound to the mysterious crimson object', 'lore');
startQuest('lay_of_the_land');
initWorldEconomy();
seedRumorsFromWorldEvents();
await waitForEnter();
if (window.__enableTutorial !== false) {
	// Tutorial UI walkthrough — highlights sidebar, journal, and action wheel
	await runTutorialIntro();
} else {
	player.flags.tutorialComplete = true;
}
				};


				// Expose tutorial hooks so functions outside the closure can reach them
			window.__onFirstSkill = (skillName) => {
				if (typeof _tutFirstSkill === 'function') _tutFirstSkill(skillName);
			};

			// Decide: new vs load — skipped when title screen is handling it
				if (!window.titleScreenActive) {
					if (!localStorage.getItem(SAVE_KEY(_activeSlot))) {
						// Try any existing slot before falling through to char creation
						const _anySlot = Array.from({length: SAVE_SLOT_COUNT}, (_, i) => i).find(i => localStorage.getItem(SAVE_KEY(i)));
						if (_anySlot !== undefined) {
							_activeSlot = _anySlot;
							loadGame(_anySlot);
						} else {
							_bookEnterCharCreation();
						}
					} else {
						loadGame(_activeSlot);
					}
				}

				const avatarEl = document.getElementById('avatar-container');
				avatarEl.style.cursor = 'pointer';
				avatarEl.addEventListener('click', () => {
					bookSwitchSection('character');
				});

				// Hook up save/load UI buttons
				document.getElementById('save-button').onclick = () => saveGame();
				document.getElementById('load-button').onclick = () => _showSaveSlotModal('load');
				document.getElementById('new-game-button').addEventListener('click', () => _showSaveSlotModal('new'));

// ============================================================
// SECTION 15 · MODAL & UI EVENT LISTENERS
// ============================================================

// 15.1 · Modal Close Buttons
			document.querySelectorAll('.close').forEach(btn =>
				btn.onclick = () => {
					const modal = btn.closest('.modal');
					modal.style.display = 'none';
					if (modal.id === 'map-modal') clearCellUI();
				}
			);

// 15.2 · Outside-Click to Close Modals
			window.onclick = e => {
				['journal', 'inventory', 'map', 'character'].forEach(id => {
					const modal = document.getElementById(id + '-modal');
					if (e.target === modal) {
						modal.style.display = 'none';
						// if it's the map, clear our UI
						if (id === 'map') clearCellUI();
					}
				});
			};

// 15.3 · Modal Openers
			document.getElementById('journal-button').onclick = () => document.getElementById('journal-modal').style.display = 'block';
			document.getElementById('inventory-button').onclick = () => {
				document.getElementById('inventory-modal').style.display = 'block';
				updateInventory();
			};
			document.getElementById('map-button').onclick = () => {
				clearCellUI(); // ← drop the old highlight/UI
				document.getElementById('map-modal').style.display = 'block';
				setupMap(); // ← and redraw a clean map
				console.log('🔍 Map opened & setupMap() called');
				checkDiscovery();
				renderWaypointBar();
			};

// 15.3b · Title equip/remove click delegation
			document.getElementById('player-profile-sheet')?.addEventListener('click', e => {
				const btn = e.target.closest('.title-equip-btn');
				if (!btn) return;
				const id = btn.dataset.titleId;
				if (!id) return;
				if (player.activeTitle === id) {
					player.activeTitle = null;
					addStory('You remove your title.');
				} else {
					player.activeTitle = id;
					const entry = (player.titles || []).find(t => t.id === id);
					if (entry) addStory(`You wear the title <em>${entry.name}</em>.`);
				}
				updatePlayerProfile();
			});

// 15.4 · Text Input Handlers
			document.getElementById('submit-button').onclick = submitUserInput;
			document.getElementById('user-input').onkeypress = e => {
				if (e.key === 'Enter') {
					e.preventDefault();
					submitUserInput();
				}
			};

// 15.4b · Inventory view toggle
			document.getElementById('inv-view-arrow')?.addEventListener('click', () => {
				const _at = campSetup && player.campLocation && player.campLocation === player.currentLocation;
				const _cycle = ['inventory'];
				if (_hasHerbPouch())       _cycle.push('herb_pouch');
				if (_hasIngredientPouch()) _cycle.push('ingredient_pouch');
				if (_at) _cycle.push('camp');
				_invView = _cycle[(_cycle.indexOf(_invView) + 1) % _cycle.length];
				updateInventory();
			});

// 15.5 · Map Canvas References
			const mapImage = document.getElementById('map-image'),
				mapCanvas = document.getElementById('map-canvas'),
				playerSymbol = document.getElementById('player-symbol'),
				tooltip = document.getElementById('tooltip'),
				travelInfo = document.getElementById('travel-info');
			let startPoint = null,
				endPoint = null;

			// Preload kingdom banner PNGs
			const kingdomBanners = {};
			['Ardrenhold', 'Brythwen', 'Dwynbroch', 'Feldarún', 'Naradreth', 'Nithrond', 'Orindroth', 'Rendarost', 'Sivanrift', 'Wistravael']
			.forEach(name => {
				const safe = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				const img = new Image();
				img.onload = () => setupMap();
				img.src = `images/banners/${safe}.png`;
				kingdomBanners[name] = img;
			});

			// 👉 Specify exact coords for banners:
			const bannerPlacements = {
				'x150_y425': 'Ardrenhold',
				'x600_y525': 'Brythwen',
				'x200_y200': 'Dwynbroch',
				'x675_y375': 'Feldarún',
				'x1000_y125': 'Naradreth',
				'x975_y425': 'Nithrond',
				'x500_y225': 'Orindroth',
				'x650_y100': 'Rendarost',
				'x400_y425': 'Sivanrift',
				'x375_y75': 'Wistravael',
			};

			const mapModal = document.getElementById('map-modal');
			const mapContainer = document.getElementById('map-container');

		


			
	


// 15.6 · Load Map Data
			function loadMapData() {
					// 1) grab both your template and any local overrides
					const template = window.mapData || {};
					const overrides = JSON.parse(localStorage.getItem(EDITOR_STORAGE_KEY) || '{}');

					// 2) rebuild mapData by merging template + overrides
					mapData = {};
					for (const [key, cell] of Object.entries(template)) {
						mapData[key] = {
							...cell,
							...(overrides[key] || {})
						};
					}

					// 3) completely reset & repopulate both maps
					borderSelections = {};
					biomeSelections = {};
					for (const [key, cell] of Object.entries(mapData)) {
						if (cell.kingdom) borderSelections[key] = kingdomColors[cell.kingdom];
						if (cell.biome) biomeSelections[key] = biomeColors[cell.biome];
					}

					// 4) redraw everything
					setupMap();
				}

			loadMapData();

// 15.7 · Location Markers (stub)
			function addLocationMarkers() {
					// example stub — draw simple dots for each discovered location
					const ctx = mapCanvas.getContext('2d');
					Object.keys(locations).forEach(key => {
						const [, xS, yS] = key.match(/^x(\d+)_y(\d+)$/);
						const x = +xS + GRID_SIZE / 2,
							y = +yS + GRID_SIZE / 2;
						ctx.beginPath();
						ctx.arc(x, y, 4, 0, Math.PI * 2);
						ctx.fill();
					});
				}

// 15.8 · Map Cell Editor Toggle
const mapEditorToggle = document.getElementById('map-editor-toggle');

			mapEditorToggle.onclick = () => {
					editMode = !editMode;
					mapEditorToggle.textContent = editMode ?
						'Map Editor: ON' :
						'Map Editor: OFF';
				};

				// 1️⃣ Wire the image load once, up near where you grab mapImage/mapCanvas:
			mapImage.onload = setupMap;
			mapImage.src = 'images/map3.png';

// 15.9 · Setup / Draw Map Canvas
			function setupMap() {
					// Always persist current location as discovered
					if (player.currentLocation) _markDiscovered(player.currentLocation);

					// Restore fog state from saved data
					if (player.discoveredCells) {
						for (const coord of Object.keys(player.discoveredCells)) {
							if (mapData[coord]) mapData[coord].discovered = true;
						}
					}
					// Restore adjacent-reveal markers ('?' cells from Search Area)
					if (player.fogRevealedCells) {
						for (const coord of Object.keys(player.fogRevealedCells)) {
							if (mapData[coord] && !mapData[coord].discovered) mapData[coord].nearby = true;
						}
					}
					// Silently reveal kingdoms for map items already in inventory
					if (player.inventory) {
						for (const [name, item] of Object.entries(player.inventory)) {
							if (item.type !== 'map') continue;
							const m = name.match(/^Map of (.+)$/);
							if (!m) continue;
							const kingdom = m[1];
							if (!(player.knownKingdoms || {})[kingdom]) {
								if (!player.knownKingdoms) player.knownKingdoms = {};
								player.knownKingdoms[kingdom] = true;
								Object.entries(mapData).forEach(([coord, cell]) => {
									// Fog-of-war only — map purchases don't count for discovery titles.
									if (cell.kingdom === kingdom) mapData[coord].discovered = true;
								});
							}
						}
					}

					// 1) Size canvas — use the container's dimensions directly
					const mapContainer2 = document.getElementById('map-container');
					const w = mapContainer2 ? mapContainer2.clientWidth  : mapImage.clientWidth;
					const h = mapContainer2 ? mapContainer2.clientHeight : mapImage.clientHeight;
					if (w === 0 || h === 0) {
						requestAnimationFrame(setupMap); // retry after layout paints
						return;
					}
					mapCanvas.width  = w;
					mapCanvas.height = h;
					// Scale factors: map data was authored at MAP_AUTH_W × MAP_AUTH_H
					const scX = w / MAP_AUTH_W;
					const scY = h / MAP_AUTH_H;
					const gridSize  = GRID_SIZE * scX;   // cell width in canvas px
					const gridSizeY = GRID_SIZE * scY;   // cell height in canvas px
					const ctx = mapCanvas.getContext('2d');
					ctx.clearRect(0, 0, w, h);
	
					// Kingdom banners at specific cells
					Object.entries(bannerPlacements).forEach(([key, kingdomName]) => {
						const banner = kingdomBanners[kingdomName];
						if (!banner) return; // only skip if no Image object
						// same drawImage code as before:
						const [, xStr, yStr] = key.match(/^x(\d+)_y(\d+)$/);
						const gx = +xStr * scX,
							gy = +yStr * scY;
						const width  = GRID_SIZE * 2.25 * scX;
						const height = GRID_SIZE * 1.25 * scY;
						const xOff = (gridSize  - width)  / 2;
						const yOff = (gridSizeY - height) / 2;

						// 1) draw banner (with transparency, etc)
						ctx.save();
						ctx.globalAlpha = 0.5;
						ctx.drawImage(
							banner,
							gx + xOff,
							gy + yOff,
							width,
							height
						);
						ctx.restore();

						// draw the kingdom name centered above the banner
						ctx.font = `${Math.max(8, Math.round(12 * scX))}px sans-serif`;
						ctx.fillStyle = '#000';
						ctx.textAlign = 'center';
						ctx.textBaseline = 'bottom';

						const cx = gx + gridSize / 2;
						const textY = gy + yOff - 1;
						ctx.fillText(kingdomName, cx, textY);
					});

					// 2) Draw the grid
					ctx.strokeStyle = 'rgba(0,0,0,0.1)';
					ctx.lineWidth = 1;
					for (let x = 0; x <= mapCanvas.width; x += gridSize) {
						ctx.beginPath();
						ctx.moveTo(x, 0);
						ctx.lineTo(x, mapCanvas.height);
						ctx.stroke();
					}
					for (let y = 0; y <= mapCanvas.height; y += gridSizeY) {
						ctx.beginPath();
						ctx.moveTo(0, y);
						ctx.lineTo(mapCanvas.width, y);
						ctx.stroke();
					}

					// 3) Biome overlay
					if (biomesVisible) {
						Object.entries(mapData).forEach(([key, cell]) => {
							if (cell.biome) {
								const [, xStr, yStr] = key.match(/^x(\d+)_y(\d+)$/);
								const gx = +xStr * scX,
									gy = +yStr * scY;
								ctx.fillStyle = biomeColors[cell.biome] || 'rgba(0,0,0,0.1)';
								ctx.fillRect(gx, gy, gridSize, gridSizeY);
							}
						});
					}

					// 4) Border overlay
					if (bordersVisible) {
						Object.entries(borderSelections).forEach(([key, color]) => {
							const [, xStr, yStr] = key.match(/^x(\d+)_y(\d+)$/);
							const gx = +xStr * scX,
								gy = +yStr * scY;
							ctx.fillStyle = color;
							ctx.fillRect(gx, gy, gridSize, gridSizeY);
						});
					}

					// 5) Fog of war — tint undiscovered cells
					if (!iconsVisible) {
						ctx.fillStyle = '#d6b87f';
						Object.entries(mapData).forEach(([key, cell]) => {
							if (cell.discovered || key === player?.currentLocation) return;
							const mf = key.match(/^x(\d+)_y(\d+)$/);
							if (!mf) return;
							ctx.fillRect(+mf[1] * scX, +mf[2] * scY, gridSize, gridSizeY);
						});
					}

					// 6) Zone icons, establishment dots & POI markers
					Object.entries(mapData).forEach(([key, cell]) => {
  const m = key.match(/^x(\d+)_y(\d+)$/);
  if (!m) return;
  const gx = +m[1] * scX;
  const gy = +m[2] * scY;
  const cx = gx + gridSize  / 2;
  const cy = gy + gridSizeY / 2;
						// 5a) hide undiscovered unless iconsVisible is true
						if (!cell.discovered && !iconsVisible && !cell.nearby) return;

  if (cell.nearby && !cell.discovered) {
    ctx.font = `bold ${gridSize * 0.75}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.fillStyle   = '#ffe000';
    ctx.strokeText('?', cx, cy);
    ctx.fillText('?',  cx, cy);
  }

						// nothing to draw?
						if (
							!cell.zone &&
							(!cell.establishments || !cell.establishments.length) &&
							(!cell.pointsOfInterest || !cell.pointsOfInterest.length)
						) return;
						
const canShow = cell.discovered || iconsVisible;

						// 5a) zone icon
					/*  zone icon  */
if (canShow) {
  let icon = '';
  switch ((cell.zone || '').toLowerCase()) {
    case 'city':         icon = '🏘️'; break;
    case 'capital city':
    case 'capitalcity':  icon = '🏰'; break;
    case 'village':      icon = '🏚️'; break;
  }
  if (icon) {
    ctx.font = `${gridSize * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(icon, cx, cy);
  }
}

						// 5b) red dot if any establishments
						if (Array.isArray(cell.establishments) && cell.establishments.length) {
							const r = Math.max(2, gridSize * 0.12);
							ctx.beginPath();
							ctx.fillStyle = 'red';
							ctx.arc(
								gx + gridSize  - r - 2,
								gy + gridSizeY - r - 2,
								r, 0, Math.PI * 2
							);
							ctx.fill();
						}

						// 5c) POI question‑mark
						if (cell.discovered &&
    Array.isArray(cell.pointsOfInterest) &&
    cell.pointsOfInterest.length) {
							ctx.font = `${gridSize * 0.9}px sans-serif bold`;
							ctx.textAlign = 'center';
							ctx.textBaseline = 'middle';
							ctx.lineWidth = 3;
							ctx.strokeStyle = '#000';
							ctx.strokeText('?', cx, cy + gridSize * 0.1);
							ctx.fillStyle = '#fff';
							// a little below the zone icon:
							ctx.fillText('?', cx, cy + gridSize * 0.1);
						}

					});

					// 7) Quest objective markers — red ! on cells with active objectives
					const questCoords = new Set(player.questMarkers || []);
					if (questCoords.size) {
						ctx.font = `bold ${gridSize * 0.85}px sans-serif`;
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						ctx.lineWidth = 2;
						ctx.strokeStyle = '#000';
						ctx.fillStyle = '#e00';
						questCoords.forEach(key => {
							const mq = key.match(/^x(\d+)_y(\d+)$/);
							if (!mq) return;
							const qx = +mq[1] * scX + gridSize / 2;
							const qy = +mq[2] * scY + gridSizeY / 2;
							ctx.strokeText('!', qx, qy);
							ctx.fillText('!',  qx, qy);
						});
					}

					// 8) Camp icon — ⛺ on the active camp tile
					if (player.campLocation) {
						const mc = player.campLocation.match(/^x(\d+)_y(\d+)$/);
						if (mc) {
							const campGx = +mc[1] * scX;
							const campGy = +mc[2] * scY;
							const campCx = campGx + gridSize  / 2;
							const campCy = campGy + gridSizeY / 2;
							// Glow ring so it's visible on any biome
							ctx.beginPath();
							ctx.arc(campCx, campCy, gridSize * 0.55, 0, Math.PI * 2);
							ctx.fillStyle = 'rgba(255, 220, 100, 0.35)';
							ctx.fill();
							ctx.font = `${gridSize * 0.85}px sans-serif`;
							ctx.textAlign    = 'center';
							ctx.textBaseline = 'middle';
							ctx.lineWidth    = 2;
							ctx.strokeStyle  = '#000';
							ctx.strokeText('⛺', campCx, campCy);
							ctx.fillStyle = '#fff';
							ctx.fillText('⛺', campCx, campCy);
						}
					}

					// 8.5) Waypoint pin
					if (player.waypoint) {
						const mw = player.waypoint.match(/^x(\d+)_y(\d+)$/);
						if (mw) {
							const wpGx = +mw[1] * scX;
							const wpGy = +mw[2] * scY;
							const wpCx = wpGx + gridSize  / 2;
							const wpCy = wpGy + gridSizeY / 2;
							ctx.beginPath();
							ctx.arc(wpCx, wpCy, gridSize * 0.45, 0, Math.PI * 2);
							ctx.fillStyle = 'rgba(0, 120, 255, 0.25)';
							ctx.fill();
							ctx.font = `${gridSize * 0.75}px sans-serif`;
							ctx.textAlign    = 'center';
							ctx.textBaseline = 'middle';
							ctx.lineWidth    = 2;
							ctx.strokeStyle  = '#003080';
							ctx.strokeText('📌', wpCx, wpCy);
							ctx.fillStyle = '#fff';
							ctx.fillText('📌', wpCx, wpCy);
						}
					}

					// 8.6) Port anchor icons — fog-gated; tag onto zone icons when present
					if (typeof PORTS !== 'undefined') {
						ctx.textAlign    = 'center';
						ctx.textBaseline = 'middle';
						Object.keys(PORTS).forEach(key => {
							const mp = key.match(/^x(\d+)_y(\d+)$/);
							if (!mp) return;
							const cell = mapData[key];
							if (!cell?.discovered && !iconsVisible) return;

							const gx = +mp[1] * scX;
							const gy = +mp[2] * scY;
							const cx = gx + gridSize  / 2;
							const cy = gy + gridSizeY / 2;

							const zone = (cell?.zone || '').toLowerCase().replace(/\s/g, '');
							const hasZone = zone === 'city' || zone === 'capitalcity' || zone === 'village';

							if (hasZone) {
								// Small tag — bottom-left of the zone icon
								ctx.font        = `${Math.round(gridSize * 0.4)}px sans-serif`;
								ctx.lineWidth    = 1.5;
								ctx.strokeStyle  = 'rgba(255,255,255,0.9)';
								const tagX = cx - gridSize  * 0.28;
								const tagY = cy + gridSizeY * 0.3;
								ctx.strokeText('⚓', tagX, tagY);
								ctx.fillStyle = '#1a3a6e';
								ctx.fillText('⚓', tagX, tagY);
							} else {
								// Standalone port cell — full-size centred anchor
								ctx.font        = `${Math.round(gridSize * 0.72)}px sans-serif`;
								ctx.lineWidth    = 2.5;
								ctx.strokeStyle  = 'rgba(255,255,255,0.85)';
								ctx.strokeText('⚓', cx, cy);
								ctx.fillStyle = '#1a3a6e';
								ctx.fillText('⚓', cx, cy);
							}
						});
					}

					// 9) Highlight selected cell
					if (selectedCellKey) {
						const [, hx, hy] = selectedCellKey.match(/^x(\d+)_y(\d+)$/);
						ctx.strokeStyle = 'yellow';
						ctx.lineWidth = 2;
						ctx.strokeRect(
							+hx * scX + 1,
							+hy * scY + 1,
							gridSize  - 2,
							gridSizeY - 2
						);
					}

					// Reposition player marker now that canvas has its real dimensions
					if (player && player.currentLocation) {
						const _pm = player.currentLocation.match(/^x(\d+)_y(\d+)$/);
						if (_pm) updatePlayerSymbol(+_pm[1], +_pm[2]);
					}

					// 5f) Hover tooltip
					mapCanvas.onmousemove = event => {
						const rect = mapCanvas.getBoundingClientRect();
						const x = event.clientX - rect.left;
						const y = event.clientY - rect.top;
						// snap to grid, convert back to data coords for key lookup
						const gxData = Math.floor(x / gridSize)  * GRID_SIZE;
						const gyData = Math.floor(y / gridSizeY) * GRID_SIZE;
						const key = `x${gxData}_y${gyData}`;
						const cell = mapData[key] || {};

					let html;
					const isDiscovered = cell.discovered || iconsVisible || key === player?.currentLocation;
					if (!isDiscovered) {
						if (cell.nearby) {
							html = `<div class="tooltip-zone"><strong>&#10067; Something Nearby</strong><br><em>A discovery awaits.</em></div>`;
						} else {
							html = `<div class="tooltip-zone"><strong>Unexplored</strong><br><em>Travel here to reveal it.</em></div>`;
						}
					} else if (cell.zone) {
						let icon = '';
						switch ((cell.zone || '').toLowerCase()) {
							case 'city':         icon = '🏘️'; break;
							case 'capital city':
							case 'capitalcity':  icon = '🏰'; break;
							case 'village':      icon = '🏚️'; break;
						}
						const ttKnownLoc     = (player.knownLocations || {})[key];
						const ttKnownKingdom = (player.knownKingdoms  || {})[cell.kingdom];
						const ttName    = ttKnownLoc?.nameKnown && cell.cityVillage ? cell.cityVillage : '???';
						const ttKingdom = ttKnownKingdom && cell.kingdom ? cell.kingdom : 'Uncharted Territory';
						html = `<div class="tooltip-zone"><strong>${icon} ${ttName}</strong><br>`;
						html += `<em>Kingdom:</em> ${ttKingdom}<br>`;
						if (ttKnownLoc?.nameKnown && cell.description) html += `<em>Description:</em> ${cell.description}<br>`;
						if (ttKnownLoc?.nameKnown) {
							const ttNames = (cell.establishments || []).map(e => e.name).filter(n => n).join(', ');
							if (ttNames) html += `<em>Establishments:</em> ${ttNames}<br>`;
						}
						html += `<em>Biome:</em> ${cell.biome || '???'}</div>`;
					} else {
						html = `<div class="tooltip-zone"><em>Biome:</em> ${cell.biome || '???'}</div>`;
					}

					tooltip.innerHTML = html;
					tooltip.style.left = `${event.clientX + 10}px`;
					tooltip.style.top = `${event.clientY + 10}px`;
					tooltip.style.display = 'block';
				};

				mapCanvas.onmouseout = () => {
					tooltip.style.display = 'none';
				};

// 6) Unified click handler (biome / border / edit / travel)
  mapCanvas.onclick = event => {
    const rect  = mapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // data coords (for key lookup and distance math)
    const gridX = Math.floor(x / gridSize)  * GRID_SIZE;
    const gridY = Math.floor(y / gridSizeY) * GRID_SIZE;
    // canvas coords (for drawing feedback)
    const gridXc = gridX * scX;
    const gridYc = gridY * scY;
    const key   = `x${gridX}_y${gridY}`;

				// highlight
				selectedCellKey = key;
				setupMap(); 

				// 6a) Biome mode
				if (biomeMode) {
					const chosen = biomeSel.value;
					const raw = mapData[key] || {
						coordinate: key,
						biome: '',
						kingdom: '',
						zone: '',
						cityVillage: '',
						description: '',
						establishments: [],
						discovered: false
					};
					if (raw.biome === chosen) {
						delete raw.biome;
						ctx.clearRect(gridXc, gridYc, gridSize, gridSizeY);
						ctx.strokeStyle = 'rgba(0,0,0,0.5)';
						ctx.strokeRect(gridXc, gridYc, gridSize, gridSizeY);
					} else {
						raw.biome = chosen;
						ctx.fillStyle = biomeColors[chosen] || 'rgba(0,0,0,0.1)';
						ctx.fillRect(gridXc, gridYc, gridSize, gridSizeY);
					}
					mapData[key] = raw;
					localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(mapData));
					return;
				}

				// 6b) Border mode
				if (borderMode) {
					if (borderSelections[key]) {
						delete borderSelections[key];
						ctx.clearRect(gridXc, gridYc, gridSize, gridSizeY);
						ctx.strokeStyle = 'rgba(0,0,0,0.5)';
						ctx.strokeRect(gridXc, gridYc, gridSize, gridSizeY);
						delete mapData[key].kingdom;
					} else {
						borderSelections[key] = selectedBorderColor;
						ctx.fillStyle = selectedBorderColor;
						ctx.fillRect(gridXc, gridYc, gridSize, gridSizeY);
						const raw = mapData[key] || {
							coordinate: key,
							biome: '',
							kingdom: '',
							zone: '',
							cityVillage: '',
							description: '',
							establishments: [],
							discovered: false
						};
						raw.kingdom = selectedKingdom;
						mapData[key] = raw;
					}
					localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(mapData));
					return;
				}

				// 6c) Edit‐cell mode
				if (editMode) {
					openCellEditor(key);
					return;
				}


				// 6d) Default click → show travel UI
				const destCell  = (typeof mapData !== 'undefined' && mapData[key]) || {};
				const knownDest = (player.knownLocations || {})[key];
				const destName  = knownDest?.nameKnown && destCell.cityVillage
					? `${destCell.cityVillage} (${key})`
					: (destCell.biome ? `${destCell.biome} region` : key);

				// Compute distance in grid squares
				const toX = gridX + GRID_SIZE / 2;
				const toY = gridY + GRID_SIZE / 2;
				const fromMatch = player.currentLocation.match(/^x(\d+)_y(\d+)$/);
				if (!fromMatch) { clearCellUI(); return; }
				const fromX     = +fromMatch[1] + GRID_SIZE / 2;
				const fromY     = +fromMatch[2] + GRID_SIZE / 2;
				const pixelDist   = Math.hypot(toX - fromX, toY - fromY);
				const gridSquares = Math.max(1, Math.round(pixelDist / GRID_SIZE));
				const weightRatio = calculateTotalWeight() / Math.max(1, player.maxCarryWeight);
				const carryExtra  = Math.round(weightRatio * gridSquares);
				const staminaCost = gridSquares * 3 + carryExtra;
				const hoursETA    = gridSquares;

				// Action bar
				let bar = document.getElementById('cell-actions');
				if (!bar) {
					bar = document.createElement('div');
					bar.id = 'cell-actions';
					mapContainer.appendChild(bar);
				}
				const isWaypoint = player.waypoint === key;
				bar.innerHTML = `
					<button id="travel-to-cell">TRAVEL</button>
					<button id="waypoint-cell">${isWaypoint ? 'CLEAR WAYPOINT' : 'SET WAYPOINT'}</button>
				`;
				travelInfo.textContent = `${destName}  •  ${gridSquares} sq  •  ~${hoursETA}h  •  ${staminaCost} stamina`;
				if (typeof _tutCheckMapTravelBtn === 'function') _tutCheckMapTravelBtn();

				document.getElementById('travel-to-cell').onclick = () => {
					if (staminaCost > player.maxStamina) {
						addStory('⛔ That distance is too far to travel in a single journey.');
						clearCellUI(); return;
					}
					if (player.stamina < staminaCost) {
						addStory('⚠️ You are too exhausted for that journey. Rest and recover first.');
						clearCellUI(); return;
					}
					const destCellKnown = !!(player.knownLocations?.[key]?.nameKnown);
					const destLabel = destCellKnown ? (destCell.cityVillage || 'this location') : 'this location';
					confirmText.textContent = `Travel to ${destLabel}? (~${hoursETA}h · ${staminaCost} stamina)`;
					confirmModal.style.display = 'block';

					confirmYesBtn.onclick = async () => {
						confirmModal.style.display = 'none';
						clearCellUI();
						window.__contentPanel.open('pane-story');
						await executeTravelTo(key, toX, toY, gridSquares, staminaCost);
					};
					confirmNoBtn.onclick = () => { confirmModal.style.display = 'none'; };
				};

				document.getElementById('waypoint-cell').onclick = () => {
					if (isWaypoint) {
						delete player.waypoint;
						addStory('📌 Waypoint cleared.');
					} else {
						player.waypoint = key;
						addStory(`📌 Waypoint set: ${destName}`);
					}
					clearCellUI();
					renderWaypointBar();
				};
}
}
// 15.10 · Clear Discovery Indicators
function clearDiscoveryIndicators() {
  const el = document.getElementById('discovery-indicators');
  if (el) el.innerHTML = '';
}

// 15.11 · Open Cell Editor
function openCellEditor(key) {
  const editorModal = document.getElementById('cell-editor-modal');
  const editorForm = document.getElementById('cell-editor-form');
  const saveBtn = document.getElementById('cell-save-button');
  const cancelBtn = document.getElementById('cell-cancel-button');

  // pull whatever's saved (might lack establishments)
  const raw = mapData[key] || {};

  // build a fully-populated data object with defaults
  const data = {
    coordinate: raw.coordinate || key,
    biome: raw.biome || '',
    kingdom: raw.kingdom || '',
    zone: raw.zone || '',
    cityVillage: raw.cityVillage || '',
    description: raw.description || '',
    establishments: Array.isArray(raw.establishments) ? raw.establishments : [],
    pointsOfInterest: Array.isArray(raw.pointsOfInterest) ? raw.pointsOfInterest : [],
    discovered: Boolean(raw.discovered),
  };

  // populate the form fields
  editorForm.elements['coordinate'].value = data.coordinate;
  editorForm.elements['biome'].value = data.biome;
  editorForm.elements['kingdom'].value = data.kingdom;
  editorForm.elements['zone'].value = data.zone;
  editorForm.elements['cityVillage'].value = data.cityVillage;
  editorForm.elements['description'].value = data.description;
  editorForm.elements['discovered'].value = data.discovered ? 'true' : 'false';

  const establishmentInputs = document.querySelectorAll('#establishments-inputs input');
  establishmentInputs.forEach((input, i) => {
    input.value = data.establishments[i] || '';
  });

  // show the modal
  editorModal.style.display = 'block';

  const rows = document.querySelectorAll('#establishments-inputs .establishment-row');
  rows.forEach((row, i) => {
    const e = data.establishments[i] || { name: '', type: '', description: '' };
    row.querySelector('input[name="establishments[name][]"]').value = e.name;
    row.querySelector('select[name="establishments[type][]"]').value = e.type;
    row.querySelector('input[name="establishments[description][]"]').value = e.description;
  });

  // wire up Save
  saveBtn.onclick = () => {
    const updated = {
      coordinate: editorForm.elements['coordinate'].value,
      biome: editorForm.elements['biome'].value,
      kingdom: editorForm.elements['kingdom'].value,
      zone: editorForm.elements['zone'].value,
      cityVillage: editorForm.elements['cityVillage'].value,
      description: editorForm.elements['description'].value,
      discovered: editorForm.elements['discovered'].value === 'true'
    };

    const updatedEsts = Array.from(rows).map(row => ({
      name: row.querySelector('input[name="establishments[name][]"]').value.trim(),
      type: row.querySelector('select[name="establishments[type][]"]').value.trim(),
      description: row.querySelector('input[name="establishments[description][]"]').value.trim()
    })).filter(e => e.name || e.type || e.description);
    updated.establishments = updatedEsts;

    const poiRows = document.querySelectorAll('#poi-inputs .poi-row');
    const updatedPois = Array.from(poiRows).map(row => ({
      name: row.querySelector('input[name="poi[name][]"]').value.trim(),
      description: row.querySelector('input[name="poi[description][]"]').value.trim()
    })).filter(p => p.name || p.description);
    updated.pointsOfInterest = updatedPois;

    mapData[key] = updated;
    localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(mapData));
    editorModal.style.display = 'none';
    redrawFromMapData();
  };

  // wire up Cancel
  cancelBtn.onclick = () => {
    editorModal.style.display = 'none';
  };
}

// 15.12 · Redraw from Map Data
				function redrawFromMapData() {
					// if your setupMap() always applies borderSelections & markers,
					// just call it again. If you need to explicitly read mapData and
					// draw additional overlays (e.g. discovered flags), do it here.
					setupMap();
					checkDiscovery();
				}

	// ============================================================
// SECTION 16 · INITIALIZATION
// ============================================================
				initializeQuickSlots();
				updatePlayerStats();
				updateTopStats();
				_initTradeModal();

	// Auto-roll toggles — both checkboxes stay in sync
	function _syncAutoRoll(checked) {
		autoRoll = checked;
		const a = document.getElementById('auto-roll-toggle');
		const b = document.getElementById('settings-auto-roll');
		if (a) a.checked = checked;
		if (b) b.checked = checked;
	}
	document.getElementById('auto-roll-toggle')?.addEventListener('change', e => _syncAutoRoll(e.target.checked));
	document.getElementById('settings-auto-roll')?.addEventListener('change', e => _syncAutoRoll(e.target.checked));

	window.setupMap = setupMap;
	window.checkDiscovery = checkDiscovery;
	window.renderWaypointBar = renderWaypointBar;

	// Generate and register master guild quests from establishments data
	if (typeof mastersGuilds !== 'undefined' && typeof quests !== 'undefined') {
		for (const guild of mastersGuilds) {
			if (!MASTER_GUILD_CONFIG[guild.profession]) continue;
			const q = generateMasterGuildQuest(guild);
			if (q && !quests.find(x => x.id === q.id)) quests.push(q);
		}
	}

// ============================================================
// SECTION 17 · BOOK ENGINE
// ============================================================

function _bookSetLeftContent(html) {
  const el = document.getElementById('book-left-story-content');
  if (el) el.innerHTML = html || '';
  const num = document.getElementById('book-left-num');
  if (num) {
    const idx = bookState.story.current - 1;
    num.textContent = (bookState.activeSection === 'story' && idx >= 0) ? String(idx + 1) : '';
  }
}

function _bookActivateLeftSection(section) {
  // Hide all left-page section panels
  document.querySelectorAll('.bk-left-sec').forEach(s => s.classList.remove('active'));
  const storyContent = document.getElementById('book-left-story-content');

  if (section === 'story') {
    // Story: show faded prev-page text
    if (storyContent) storyContent.style.display = 'block';
  } else {
    // Non-story: hide story prev-page, show section-specific left panel
    if (storyContent) storyContent.style.display = 'none';
    const leftSec = document.getElementById(`bkleft-${section}`);
    if (leftSec) leftSec.classList.add('active');

    // For character, update the player identity panel
    if (section === 'character') _bookUpdateCharacterLeft();
  }

  // Page number on left footer only meaningful during story pagination
  const num = document.getElementById('book-left-num');
  if (num) num.textContent = '';
}

function _bookUpdateCharacterLeft() {
  const el = document.getElementById('character-left-identity');
  if (!el) return;
  const rows = [
    ['Name',       player?.name       || '—'],
    ['Race',       player?.race       || '—'],
    ['Gender',     player?.gender     || '—'],
    ['Profession', player?.profession || '—'],
    ['Level',      player?.level      || '1'],
    ['Origin',     player?.origin     || '—'],
  ];
  el.innerHTML = rows.map(([label, val]) =>
    `<div class="jli-row"><span class="jli-label">${label}</span><span>${val}</span></div>`
  ).join('');
}

function _bookUpdateNav() {
  const prev = document.getElementById('bk-prev');
  const next = document.getElementById('bk-next');
  const num  = document.getElementById('bk-page-num');
  if (bookState.activeSection === 'story') {
    const total = bookState.story.pages.length;
    const cur   = bookState.story.current;
    if (prev) prev.disabled = (total > 1 ? cur <= 1 : cur <= 0);
    if (next) next.disabled = cur >= total - 1;
    if (num)  num.textContent = `${cur > 0 ? cur : 1} / ${total}`;
  } else {
    if (prev) prev.disabled = true;
    if (next) next.disabled = true;
    if (num)  num.textContent = '';
  }
  _bookDebug();
}

function _bookDebug() { /* no-op */ }

function _bookAnimateTurn(which, earlyFn, lateFn) {
  earlyFn?.();
  lateFn?.();
  _bookUpdateNav();
}

function bookTurnPage(direction) {
  console.log('[bookTurnPage]', direction, 'anim:', bookState.isAnimating, 'sec:', bookState.activeSection, 'cur:', bookState.story.current, 'total:', bookState.story.pages.length);
  if (bookState.isAnimating) { console.log('[bookTurnPage] BLOCKED: isAnimating'); return; }
  if (bookState.activeSection !== 'story') { console.log('[bookTurnPage] BLOCKED: section=' + bookState.activeSection); return; }

  const isNext  = direction === 'next';
  const total   = bookState.story.pages.length;
  const cur     = bookState.story.current;

  if (isNext  && cur >= total - 1) { console.log('[bookTurnPage] BLOCKED: at last page'); return; }
  if (!isNext && (total > 1 ? cur <= 1 : cur <= 0)) { console.log('[bookTurnPage] BLOCKED: at first page'); return; }

  const s = document.getElementById('story');

  const newIdx = isNext ? cur + 1 : cur - 1;

  // Save current right-page content before anything changes.
  if (s) bookState.story.pages[cur] = s.innerHTML;
  bookState.story.current = newIdx;

  _bookAnimateTurn(isNext ? 'fwd' : 'bwd',
    () => {
      // earlyFn: change the page covered by the front face.
      // fwd front covers RIGHT → load new right content (hidden).
      // bwd front covers LEFT  → load new left content (hidden).
      if (isNext) {
        if (s) s.innerHTML = bookState.story.pages[newIdx] || '';
      } else {
        _bookSetLeftContent(newIdx > 0 ? bookState.story.pages[newIdx - 1] : '');
      }
    },
    () => {
      // lateFn (cleanup): change the opposite page once the animation is done.
      // fwd → update left;  bwd → update right.
      if (isNext) {
        _bookSetLeftContent(newIdx > 0 ? bookState.story.pages[newIdx - 1] : '');
      } else {
        if (s) s.innerHTML = bookState.story.pages[newIdx] || '';
      }
    }
  );
}

const SECTION_ORDER = ['story', 'inventory', 'character', 'map', 'settings'];

function bookSwitchSection(section) {
  if (bookState.isAnimating) return;
  if (section === bookState.activeSection) return;

  // Mirror a real book: tabs to the right of the current one turn forward,
  // tabs to the left turn backward (left page peels back).
  const curIdx = SECTION_ORDER.indexOf(bookState.activeSection);
  const newIdx = SECTION_ORDER.indexOf(section);
  const direction = newIdx > curIdx ? 'fwd' : 'bwd';

  bookState.activeSection = section;
  document.getElementById('bk-character-tabs')?.classList.toggle('visible', section === 'character');

  function _activateRightSection() {
    document.querySelectorAll('.bk-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.bk-stab').forEach(b => b.classList.remove('active'));
    document.getElementById(`bksec-${section}`)?.classList.add('active');
    document.querySelector(`.bk-stab[data-bksec="${section}"]`)?.classList.add('active');
    if (section === 'map')       setTimeout(() => { setupMap?.(); checkDiscovery?.(); renderWaypointBar?.(); }, 30);
    if (section === 'inventory') setTimeout(() => updateInventory?.(), 0);
    if (section === 'character') setTimeout(() => { updateJournal?.(); updatePlayerProfile?.(); }, 0);
  }
  function _activateLeftSection() {
    _bookActivateLeftSection(section);
    if (section === 'story') {
      const prev = bookState.story.current > 0 ? bookState.story.pages[bookState.story.current - 1] : '';
      _bookSetLeftContent(prev);
      const num = document.getElementById('book-left-num');
      if (num) { const idx = bookState.story.current - 1; num.textContent = idx >= 0 ? String(idx + 1) : ''; }
    }
  }

  _bookAnimateTurn(direction,
    () => {
      // earlyFn: change the side covered by the front face.
      // fwd front covers RIGHT → switch right section (hidden).
      // bwd front covers LEFT  → switch left panel (hidden).
      if (direction === 'fwd') { _activateRightSection(); } else { _activateLeftSection(); }
      _bookUpdateNav();
    },
    () => {
      // lateFn (cleanup): change the opposite side once the animation is done.
      if (direction === 'fwd') { _activateLeftSection(); } else { _activateRightSection(); }
    }
  );
}

function _bookEnterCharCreation() {
  const overlay = document.getElementById('cc-modal-overlay');
  if (!overlay || overlay.classList.contains('active')) return;
  overlay.classList.add('active');
  if (typeof window.ccResetWizard === 'function') window.ccResetWizard();
}

function _bookExitCharCreation(onSectionReady) {
  const overlay = document.getElementById('cc-modal-overlay');
  if (overlay) overlay.classList.remove('active');
  // Activate the story section in the book behind the (now-hidden) overlay
  document.querySelectorAll('.bk-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.bk-stab').forEach(b => b.classList.remove('active'));
  document.getElementById('bksec-story')?.classList.add('active');
  document.querySelector('.bk-stab[data-bksec="story"]')?.classList.add('active');
  bookState.activeSection = 'story';
  _bookUpdateNav();
  _bookActivateLeftSection('story');
  onSectionReady?.();
}

function bookSwitchJournalTab(tabId) {
  document.querySelectorAll('#bksec-character .tab-content').forEach(tc => tc.classList.remove('active'));
  document.querySelectorAll('.bk-jtab').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId)?.classList.add('active');
  document.querySelector(`.bk-jtab[data-tab="${tabId}"]`)?.classList.add('active');
  bookState.activeJournalTab = tabId;
  try { localStorage.setItem('rpg-journal-tab', tabId); } catch(e) {}
  if (typeof updateJournalTab === 'function') updateJournalTab();
}

function _bookRestoreStoryLog() {
  const s = document.getElementById('story');
  if (!s) return;

  s.innerHTML = '';
  for (const txt of (player.storyLog || [])) {
    if (txt.startsWith('[narration] ')) s.insertAdjacentHTML('beforeend', `<p class="narration">${txt.slice(12)}</p>`);
    else                               s.insertAdjacentHTML('beforeend', `<p>&gt; ${txt}</p>`);
  }
  s.scrollTop = s.scrollHeight;

  bookState.story = { pages: [s.innerHTML], current: 0 };

  // Ensure story section is visually active
  _bookActivateLeftSection('story');

  // Show second-to-last page on the left
  const prev = bookState.story.current > 0 ? bookState.story.pages[bookState.story.current - 1] : '';
  _bookSetLeftContent(prev);

  _bookUpdateNav();
}

// ── Drag-to-turn ─────────────────────────────────────────────
(function _bookDragSetup() {
  // drag is null until a real drag starts (>= DRAG_THRESHOLD px of movement).
  // We intentionally do NOT activate the turner on pointerdown — only on first
  // meaningful movement — so plain clicks never flash the parchment overlay.
  const DRAG_THRESHOLD = 15;
  let drag = null;

  function _getPageWidth() {
    const book = document.getElementById('book');
    return book ? (book.offsetWidth - 22) / 2 : 300;
  }

  function _activateTurner(which) {
    const id     = which === 'fwd' ? 'bk-turner-fwd' : 'bk-turner-bwd';
    const turner = document.getElementById(id);
    if (!turner) return null;

    const pg = turner.querySelector('.turner-pg');
    if (pg) {
      if (which === 'bwd') {
        // Backward: peels from the LEFT page → snapshot left-page content
        pg.innerHTML = document.getElementById('book-left-story-content')?.innerHTML || '';
      } else if (bookState.activeSection === 'story') {
        // Forward in story: peels right page showing current story text
        const storyEl = document.getElementById('story');
        pg.innerHTML  = storyEl ? storyEl.innerHTML : '';
      } else {
        const activeSec = document.getElementById('book-right-inner')
                           ?.querySelector('.bk-section.active');
        pg.innerHTML = activeSec ? activeSec.innerHTML : '';
      }
    }

    turner.style.transition = 'none';
    turner.classList.add('bk-active');
    return turner;
  }

  function _snapDone(turner, completed, which) {
    const pg = turner.querySelector('.turner-pg');
    if (completed) {
      // Drag finished — update page content directly; no second CSS animation.
      turner.style.transition = 'none';
      turner.style.transform  = '';

      const isNext = which === 'fwd';
      const total  = bookState.story.pages.length;
      const cur    = bookState.story.current;
      const newIdx = isNext ? cur + 1 : cur - 1;

      if (newIdx >= 0 && newIdx < total) {
        const s = document.getElementById('story');
        if (s) bookState.story.pages[cur] = s.innerHTML;
        _bookSetLeftContent(newIdx > 0 ? bookState.story.pages[newIdx - 1] : '');
        bookState.story.current = newIdx;
        if (s) s.innerHTML = bookState.story.pages[newIdx] || '';
      }

      turner.classList.remove('bk-active', 'bk-turning');
      if (pg) pg.innerHTML = '';
      bookState.isAnimating = false;
      _bookUpdateNav();
    } else {
      // Snap back — clean up turner after the CSS snap-back transition ends.
      turner.style.transition = '';
      setTimeout(() => {
        turner.classList.remove('bk-active', 'bk-turning');
        turner.style.transform = '';
        if (pg) pg.innerHTML = '';
        bookState.isAnimating = false;
      }, 50);
    }
  }

  const book = document.getElementById('book');
  if (!book) return;

  // pointerdown: record start position only — do NOT activate turner yet.
  book.addEventListener('pointerdown', e => {
    // Never intercept nav button clicks — setPointerCapture would steal the
    // click event away from the button, making nav buttons unresponsive.
    if (e.target.closest('#bk-page-footer')) return;
    if (bookState.isAnimating || bookState.activeSection !== 'story') return;
    const rect    = book.getBoundingClientRect();
    const onRight = e.clientX >= rect.left + rect.width / 2;
    const canNext = bookState.story.current < bookState.story.pages.length - 1;
    const canPrev = bookState.story.current > 0;
    if (onRight && !canNext) return;
    if (!onRight && !canPrev) return;

    drag = { startX: e.clientX, which: onRight ? 'fwd' : 'bwd',
             turner: null, angle: 0, activated: false };
    book.setPointerCapture(e.pointerId);
  });

  // pointermove: activate turner on first movement past threshold.
  book.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;

    if (!drag.activated) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      drag.turner    = _activateTurner(drag.which);
      drag.activated = true;
      if (!drag.turner) { drag = null; return; }
      bookState.isAnimating = true;
    }

    const pw    = _getPageWidth();
    const angle = drag.which === 'fwd'
      ? Math.max(-180, Math.min(0,   (dx / pw) * -180))
      : Math.max(0,    Math.min(180, (dx / pw) * -180));

    drag.turner.style.transform = `rotateY(${angle}deg)`;
    drag.angle = angle;
  });

  // pointerup: plain click (not activated) → do nothing; drag → snap.
  book.addEventListener('pointerup', () => {
    if (!drag) return;
    const { turner, which, angle, activated } = drag;
    drag = null;

    if (!activated) return;  // plain click — turner was never shown

    const completed = which === 'fwd' ? angle < -90 : angle > 90;
    turner.style.transition = 'transform 0.4s ease';

    if (completed) {
      turner.style.transform = `rotateY(${which === 'fwd' ? -180 : 180}deg)`;
      setTimeout(() => _snapDone(turner, true,  which), 420);
    } else {
      turner.style.transform = 'rotateY(0deg)';
      setTimeout(() => _snapDone(turner, false, which), 420);
    }
  });
})();

// ── Export to inline script / external callers ────────────────
window.bookSwitchSection     = bookSwitchSection;
window.bookSwitchJournalTab  = bookSwitchJournalTab;
window.bookTurnPage          = bookTurnPage;
window.bookEnterCharCreation = _bookEnterCharCreation;
window.bookExitCharCreation  = _bookExitCharCreation;
window.showNewGameSlotPicker = () => _showSaveSlotModal('new');

// Initial state: story section is active on both pages
_bookActivateLeftSection('story');
_bookUpdateNav();
});
