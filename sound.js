// sound.js — Sound Manager for The Never-Ending Adventure

const SoundManager = (() => {
  'use strict';

  const LS_KEY = 'rpg-sound-settings';

  let _sfxVol  = 0.7;
  let _ambVol  = 0.25;
  let _enabled = true;

  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    if (typeof saved.sfx     === 'number')  _sfxVol  = saved.sfx;
    if (typeof saved.amb     === 'number')  _ambVol  = saved.amb;
    if (typeof saved.enabled === 'boolean') _enabled = saved.enabled;
  } catch (_e) {}

  function _save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ sfx: _sfxVol, amb: _ambVol, enabled: _enabled })); } catch (_e) {}
  }

  // ── Sound file registry ───────────────────────────────────────
  const SOUNDS = {
    // Actions
    chop_wood:                'sounds/actions/chop_wood_single.mp3',
    chop_wood_continuous:     'sounds/actions/chop_wood_continuous.mp3',
    chop_wood_continuous2:    'sounds/actions/chop_wood_continuous2.mp3',
    gather:                   'sounds/actions/gather.mp3',
    drink:                    'sounds/actions/drink.mp3',
    drop_item:                'sounds/actions/drop_item.mp3',
    hammer_strikes_anvil_single:     'sounds/actions/hammer_strikes_anvil_single.mp3',
    hammer_strikes_anvil_continuous: 'sounds/actions/hammer_strikes_anvil_continuous.mp3',
    fire_arrow:               'sounds/actions/fire_arrow.mp3',
    mine:                     'sounds/actions/mine.mp3',
    craft_with_hammer:        'sounds/actions/craft_with_hammer.mp3',
    craft_with_saw:           'sounds/actions/craft_with_saw.mp3',
    fill_water:               'sounds/actions/fill_water.mp3',
    fire_start:               'sounds/actions/fire_start.mp3',
    dig:                      'sounds/actions/dig.mp3',
    eat:                      'sounds/actions/eat.mp3',
    unlock:                   'sounds/actions/unlock.mp3',
    // Animals
    cow:                      'sounds/animals/cow.mp3',
    chicken:                  'sounds/animals/chicken.mp3',
    wolf:                     'sounds/animals/wolf.mp3',
    // Effects
    knock:                    'sounds/effects/knock.mp3',
    receive_coin:             'sounds/effects/receive_coin.mp3',
    spend_coin:               'sounds/effects/spend_coin.mp3',
    armor_impact:             'sounds/effects/armor_impact.mp3',
    notice:                   'sounds/effects/notice.mp3',
    level_up:                 'sounds/effects/level_up.mp3',
    turn_page:                'sounds/effects/turn_page.mp3',
    // UI
    menu_select:              'sounds/ui/menu_select.mp3',
    button_press:             'sounds/ui/button_press.mp3',
    option_hover:             'sounds/ui/option_hover.mp3',
    error:                    'sounds/ui/error.mp3',
    dice_roll:                'sounds/ui/dice_roll.mp3',
    log_entry:                'sounds/ui/log_entry.mp3',
    // Exploration / quests
    item_pickup:              'sounds/actions/receive_item.mp3',
    quest_update:             'sounds/effects/quest_update.mp3',
    quest_complete:           'sounds/effects/quest_complete.mp3',
    equip:                    'sounds/actions/equip_item.mp3',
    // Combat (placeholder — files not yet created)
    sword_swing:              'sounds/actions/sword_swing.mp3',
    shield_block:             'sounds/actions/shield_block.mp3',
    combat_flee:              'sounds/actions/combat_flee.mp3',
    combat_victory:           'sounds/actions/combat_victory.mp3',
    combat_defeat:            'sounds/actions/combat_defeat.mp3',
    // Magic / Spells (placeholder — files not yet created)
    spell_fire:               'sounds/actions/spell_fire.mp3',
    spell_dark:               'sounds/actions/spell_dark.mp3',
    spell_heal:               'sounds/actions/spell_heal.mp3',
    spell_meditate:           'sounds/actions/spell_meditate.mp3',
    spell_ward:               'sounds/actions/spell_ward.mp3',
    spell_dark_sight:         'sounds/actions/spell_dark_sight.mp3',
    blood_ritual:             'sounds/actions/blood_ritual.mp3',
    // Fishing / Hunting (placeholder — files not yet created)
    fish_bite:                'sounds/actions/fish_bite.mp3',
    fish_catch:               'sounds/actions/fish_catch.mp3',
    hunt_kill:                'sounds/actions/hunt_kill.mp3',
    // Social / Town (placeholder — files not yet created)
    crowd_cheer:              'sounds/effects/crowd_cheer.mp3',
    pickpocket_success:       'sounds/effects/pickpocket_success.mp3',
    pickpocket_fail:          'sounds/effects/pickpocket_fail.mp3',
    // Alchemy / Cooking (placeholder — files not yet created)
    brew_potion:              'sounds/actions/brew_potion.mp3',
    cooking_sizzle:           'sounds/actions/cooking_sizzle.mp3',
    // Exploration / Travel (placeholder — files not yet created)
    discovery:                'sounds/effects/discovery.mp3',
    sail:                     'sounds/actions/sail.mp3',
    // UI feedback (placeholder — files not yet created)
    critical_success:         'sounds/ui/critical_success.mp3',
    critical_fail:            'sounds/ui/critical_fail.mp3',
  };

  // ── One-shot SFX ─────────────────────────────────────────────
  // 3 pre-loaded instances per sound. The ended handler resets currentTime to 0
  // immediately after playback finishes, so the element is already at the start
  // when play() needs it — no seek-then-play race.
  const _pools = {};
  Object.entries(SOUNDS).forEach(([key, src]) => {
    const pool = [];
    for (let i = 0; i < 3; i++) {
      const a = new Audio(src);
      a.preload = 'auto';
      a._busy = false;
      a.addEventListener('ended', () => {
        a._busy = false;
        a.currentTime = 0;
      });
      pool.push(a);
    }
    _pools[key] = pool;
  });

  // Deduplicate: suppress the same key if triggered twice within 60 ms
  const _lastPlay = {};

  function play(key, scale = 1) {
    if (!_enabled) return;
    const pool = _pools[key];
    if (!pool) return;
    const now = Date.now();
    if (_lastPlay[key] && now - _lastPlay[key] < 60) return;
    _lastPlay[key] = now;

    let audio = pool.find(a => !a._busy);
    if (!audio) {
      // All busy — interrupt the first one
      audio = pool[0];
      audio.pause();
      audio.currentTime = 0;
    }
    audio._busy = true;
    audio.volume = Math.max(0, Math.min(1, _sfxVol * scale));
    audio.play().catch(() => { audio._busy = false; });
  }

  // ── Ambience (HTML Audio, looping, crossfade) ─────────────────
  // Long streaming files stay on HTML Audio — AudioContext buffers would
  // require loading the entire file into memory first.
  let _currentAudio = null;
  let _currentKey   = null;
  const FADE_MS = 1500;

  const AMBIENCE = {
    ambience_campfire:        'sounds/ambience/ambience_campfire.mp3',
    ambience_night1:          'sounds/ambience/ambience_night1.mp3',
    ambience_forest_day:      'sounds/ambience/ambience_forest_day.mp3',
    ambience_forest_day2:     'sounds/ambience/ambience_forest_day2.mp3',
    ambience_forest_day3:     'sounds/ambience/ambience_forest_day3.mp3',
    ambience_forest_day4:     'sounds/ambience/ambience_forest_day4.mp3',
    ambience_rain_light:      'sounds/ambience/ambience_rain_light.mp3',
    ambience_rain:            'sounds/ambience/ambience_rain.mp3',
    ambience_rain_heavy:      'sounds/ambience/ambience_rain_heavy.mp3',
    ambience_thunder_light:   'sounds/ambience/ambience_thunder_light.mp3',
    ambience_thunder_severe:  'sounds/ambience/ambience_thunder_severe.mp3',
    ambience_thunder_severe2: 'sounds/ambience/ambience_thunder_severe2.mp3',
    ambience_common_day:      'sounds/ambience/ambience_common_day.mp3',
    ambience_common_night:    'sounds/ambience/ambience_common_night.mp3',
    ambience_plains_day:      'sounds/ambience/ambience_plains_day.mp3',
    ambience_town_day:        'sounds/ambience/ambience_town_day.mp3',
    ambience_campfire1:              'sounds/ambience/ambience_campfire1.mp3',
    ambience_village_chopping_wood:  'sounds/ambience/ambience_village_chopping_wood.mp3',
    ambience_town_blacksmith:        'sounds/ambience/ambience_town_blacksmith.mp3',
    ambience_town_blacksmith1:       'sounds/ambience/ambience_town_blackwmith1.mp3',
    ambience_mine:                   'sounds/ambience/ambience_mine.mp3',
    // Placeholder ambience — files not yet created
    ambience_coastal:         'sounds/ambience/ambience_coastal.mp3',
    ambience_mountain:        'sounds/ambience/ambience_mountain.mp3',
    ambience_river:           'sounds/ambience/ambience_river.mp3',
    ambience_town_night:      'sounds/ambience/ambience_town_night.mp3',
  };

  function _fade(audio, from, to) {
    const steps = FADE_MS / 50;
    const delta = (to - from) / steps;
    let vol = from;
    const id = setInterval(() => {
      vol = Math.max(0, Math.min(1, vol + delta));
      audio.volume = vol;
      if ((delta > 0 && vol >= to) || (delta < 0 && vol <= to)) {
        clearInterval(id);
        if (to <= 0) { audio.pause(); audio.currentTime = 0; }
      }
    }, 50);
  }

  function setAmbience(key) {
    if (key === _currentKey) return;
    const src = AMBIENCE[key];
    if (!src) return;

    const prev  = _currentAudio;
    _currentKey   = key;
    const next    = new Audio(src);
    next.loop     = true;
    next.volume   = 0;
    _currentAudio = next;

    if (_enabled) {
      next.play().catch(() => {});
      _fade(next, 0, _ambVol);
      if (prev) _fade(prev, prev.volume, 0);
    }
  }

  function stopAmbience() {
    if (!_currentAudio) return;
    const a    = _currentAudio;
    _currentKey   = null;
    _currentAudio = null;
    if (_enabled) _fade(a, a.volume, 0);
    else { a.pause(); a.currentTime = 0; }
  }

  // ── Ambience auto-selector ────────────────────────────────────
  function updateAmbience() {
    if (typeof player === 'undefined') return;

    const weather = (player.weather   || '').toLowerCase();
    const time    = (player.timeOfDay || '').toLowerCase();
    const hasFire = !!player.hasFire;
    const cell    = (typeof mapData !== 'undefined' && mapData[player.currentLocation]) || {};
    const biome   = (cell.biome || '').toLowerCase();
    const zone    = (cell.zone  || '').toLowerCase();
    const isNight = /night|midnight|dusk/.test(time);

    if (/thunderstorm|severe storm/.test(weather)) {
      setAmbience(Math.random() < 0.5 ? 'ambience_thunder_severe' : 'ambience_thunder_severe2');
      return;
    }
    if (/thunder/.test(weather))              { setAmbience('ambience_thunder_light'); return; }
    if (/heavy rain|downpour/.test(weather))  { setAmbience('ambience_rain_heavy');   return; }
    if (/rain|drizzle/.test(weather)) {
      setAmbience(Math.random() < 0.5 ? 'ambience_rain' : 'ambience_rain_light');
      return;
    }

    if (/city|capitalcity/.test(zone)) {
      setAmbience(isNight ? 'ambience_town_night' : 'ambience_town_day');
      return;
    }
    if (/village/.test(zone)) {
      if (isNight) { setAmbience('ambience_town_night'); return; }
      const vKeys = ['ambience_town_day', 'ambience_village_chopping_wood'];
      if (!vKeys.includes(_currentKey)) setAmbience(vKeys[Math.floor(Math.random() * vKeys.length)]);
      return;
    }

    if (hasFire) {
      const cfKeys = ['ambience_campfire', 'ambience_campfire1'];
      if (!cfKeys.includes(_currentKey)) setAmbience(cfKeys[Math.floor(Math.random() * cfKeys.length)]);
      return;
    }

    if (/forest|wetlands|swamp/.test(biome)) {
      if (!isNight) {
        const k = ['ambience_forest_day','ambience_forest_day2','ambience_forest_day3','ambience_forest_day4'];
        setAmbience(k[Math.floor(Math.random() * k.length)]);
      } else {
        setAmbience('ambience_common_night');
      }
      return;
    }

    if (/coastal|ocean/.test(biome))  { setAmbience('ambience_coastal'); return; }
    if (/mountain/.test(biome))        { setAmbience(!isNight ? 'ambience_mountain' : 'ambience_common_night'); return; }
    if (/lake|river/.test(biome))      { setAmbience('ambience_river'); return; }

    if (!isNight) {
      if (/plains|grassland|hills|tundra/.test(biome)) { setAmbience('ambience_plains_day'); return; }
      setAmbience('ambience_common_day');
      return;
    }

    setAmbience(Math.random() < 0.5 ? 'ambience_night1' : 'ambience_common_night');
  }

  // ── Volume / enable controls ──────────────────────────────────
  function setSfxVolume(v) {
    _sfxVol = Math.max(0, Math.min(1, v));
    _save();
  }

  function setAmbienceVolume(v) {
    _ambVol = Math.max(0, Math.min(1, v));
    if (_currentAudio && _enabled) _currentAudio.volume = _ambVol;
    _save();
  }

  function setEnabled(v) {
    _enabled = !!v;
    if (_currentAudio) {
      if (_enabled) { _currentAudio.volume = _ambVol; _currentAudio.play().catch(() => {}); }
      else          { _currentAudio.volume = 0; _currentAudio.pause(); }
    }
    _save();
  }

  return {
    play,
    setAmbience,
    stopAmbience,
    updateAmbience,
    setSfxVolume,
    setAmbienceVolume,
    setEnabled,
    get sfxVolume()      { return _sfxVol; },
    get ambienceVolume() { return _ambVol; },
    get enabled()        { return _enabled; },
  };
})();
