// lute.js
// Self-contained lute instrument system.
// Requires: sound.js loaded first (for volume settings).
// Hooks into script.js via window._NEA (addStory, gainSkillXp, etc.)

const LuteSystem = (() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // NOTE CONSTANTS
  // ═══════════════════════════════════════════════════════════════

  // Chromatic scale using same naming as our .mp3 files
  const NOTE_SEQ = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

  // All available note files
  const NOTE_FILES = {};
  ['3','4','5'].forEach(oct => {
    NOTE_SEQ.forEach(n => { NOTE_FILES[n + oct] = `sounds/lute/${n}${oct}.mp3`; });
  });
  NOTE_FILES['C6'] = 'sounds/lute/C6.mp3';

  // ─── 5-string tuning (high → low) ───────────────────────────
  // A4 E4 C4 G3 D3  (lute-style open tuning)
  const STRINGS = ['A4', 'E4', 'C4', 'G3', 'D3'];
  const NUM_FRETS = 8; // frets 0 (open) through 7

  function getNoteAtFret(openNote, fret) {
    const m = openNote.match(/^([A-G][#b]?)(\d)$/);
    if (!m) return null;
    const baseIdx = NOTE_SEQ.indexOf(m[1]);
    if (baseIdx < 0) return null;
    const total    = baseIdx + fret;
    return NOTE_SEQ[total % 12] + (parseInt(m[2]) + Math.floor(total / 12));
  }

  // ─── Chords ─────────────────────────────────────────────────
  // Each chord lists the notes to play (closest octave chosen at playback)
  const CHORDS = {
    'Am':  { notes: ['A','C','E'],    color: '#1a4a2a' },
    'C':   { notes: ['C','E','G'],    color: '#1a2a4a' },
    'Dm':  { notes: ['D','F','A'],    color: '#3a1a4a' },
    'Em':  { notes: ['E','G','B'],    color: '#2a3a1a' },
    'G':   { notes: ['G','B','D'],    color: '#4a3a1a' },
    'F':   { notes: ['F','A','C'],    color: '#4a1a1a' },
    'D':   { notes: ['D','F#','A'],   color: '#1a3a3a' },
    'E':   { notes: ['E','Ab','B'],   color: '#3a2a1a' },
    'A':   { notes: ['A','C#','E'],   color: '#2a1a3a' },
    'Bm':  { notes: ['B','D','F#'],   color: '#1a3a1a' },
    'G7':  { notes: ['G','B','D','F'],color: '#3a3a1a' },
    'Am7': { notes: ['A','C','E','G'],color: '#1a3a2a' },
  };

  // ─── Scales ─────────────────────────────────────────────────
  const SCALES = {
    'C Major':        ['C','D','E','F','G','A','B'],
    'G Major':        ['G','A','B','C','D','E','F#'],
    'D Major':        ['D','E','F#','G','A','B','C#'],
    'A Major':        ['A','B','C#','D','E','F#','Ab'],
    'F Major':        ['F','G','A','Bb','C','D','E'],
    'A Minor':        ['A','B','C','D','E','F','G'],
    'E Minor':        ['E','F#','G','A','B','C','D'],
    'D Minor':        ['D','E','F','G','A','Bb','C'],
    'G Minor':        ['G','A','Bb','C','D','Eb','F'],
    'C Pentatonic':   ['C','D','E','G','A'],
    'Am Pentatonic':  ['A','C','D','E','G'],
    'G Pentatonic':   ['G','A','B','D','E'],
  };

  // ─── Keyboard → natural note map ────────────────────────────
  // Only natural notes; accidentals via fretboard click
  const KEY_MAP = {
    '1':'C3','2':'D3','3':'E3','4':'F3','5':'G3','6':'A3','7':'B3',
    'q':'C4','w':'D4','e':'E4','r':'F4','t':'G4','y':'A4','u':'B4',
    'a':'C5','s':'D5','d':'E5','f':'F5','g':'G5','h':'A5','j':'B5',
    'z':'C6',
  };

  // ═══════════════════════════════════════════════════════════════
  // BRIDGE TO script.js INTERNALS
  // ═══════════════════════════════════════════════════════════════

  function _nea()           { return window._NEA; }
  function _addStory(t)     { _nea()?.addStory?.(t); }
  function _gainXp(s, tier) { _nea()?.gainSkillXp?.(s, tier); }
  function _skillCheck(s)   { return _nea()?.performSkillCheck?.(s) ?? 3; }
  function _progress(l, ms) { return _nea()?.runInlineProgress?.(l, ms) ?? Promise.resolve(); }
  function _updateStats()   { _nea()?.updateTopStats?.(); }
  function _player()        { return _nea()?.player ?? (typeof player !== 'undefined' ? player : null); }

  function _luteLevel() {
    return _player()?.skills?.Lute?.level ?? 0;
  }

  function _hasLute() {
    const inv = _player()?.inventory ?? {};
    return Object.keys(inv).some(k => /lute/i.test(k));
  }

  function _inSettlement() {
    const p = _player();
    if (!p) return false;
    const cell = (typeof mapData !== 'undefined' && mapData[p.currentLocation]) || {};
    return ['City','CapitalCity','Village'].includes(cell.zone || '');
  }

  // ═══════════════════════════════════════════════════════════════
  // AUDIO ENGINE
  // ═══════════════════════════════════════════════════════════════

  const _pools = {};

  function _getAudio(note) {
    if (!NOTE_FILES[note]) return null;
    if (!_pools[note]) {
      _pools[note] = [1, 2].map(() => {
        const a = new Audio(NOTE_FILES[note]);
        a.preload = 'auto';
        a._busy   = false;
        return a;
      });
    }
    return _pools[note];
  }

  function playNote(note) {
    if (!NOTE_FILES[note]) return;
    if (typeof SoundManager !== 'undefined' && !SoundManager.enabled) return;
    const vol = (typeof SoundManager !== 'undefined') ? SoundManager.sfxVolume : 0.7;

    const pool = _getAudio(note);
    if (!pool) return;
    let audio = pool.find(a => !a._busy) ?? pool[0];
    audio.pause();
    audio.currentTime = 0;
    audio._busy = true;
    audio.volume = vol;
    audio.addEventListener('ended', () => { audio._busy = false; }, { once: true });
    audio.play().catch(() => { audio._busy = false; });

    _flashNote(note);
  }

  function playChord(chordName) {
    const def = CHORDS[chordName];
    if (!def) return;
    // Pick the best octave for each chord note (target octave 3-5)
    def.notes.forEach((noteName, i) => {
      let note = null;
      for (const oct of ['4','3','5']) {
        const candidate = noteName + oct;
        if (NOTE_FILES[candidate]) { note = candidate; break; }
      }
      if (note) setTimeout(() => playNote(note), i * 45);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // XP SYSTEM  (rate-limited to prevent spam leveling)
  // ═══════════════════════════════════════════════════════════════

  let _lastNoteXp  = 0;
  let _noteCounter = 0;

  function _noteXp() {
    _noteCounter++;
    const now = Date.now();
    if (_noteCounter < 8 || now - _lastNoteXp < 6000) return;
    _noteCounter = 0;
    _lastNoteXp  = now;
    _gainXp('Lute', 1);
    _refreshXpBar();
  }

  let _lastChordXp = 0;
  function _chordXp() {
    const now = Date.now();
    if (now - _lastChordXp < 4000) return;
    _lastChordXp = now;
    _gainXp('Lute', 2);
    _refreshXpBar();
  }

  function _songXp() {
    _gainXp('Lute', 3);
    _refreshXpBar();
  }

  function _refreshXpBar() {
    const fill  = document.getElementById('lute-xp-fill');
    const label = document.getElementById('lute-xp-label');
    if (!fill || !label) return;
    const sk  = _player()?.skills?.Lute;
    const lv  = sk?.level  ?? 1;
    const xp  = sk?.xp     ?? 0;
    const max = lv * 5;
    fill.style.width   = Math.min(100, (xp / max) * 100) + '%';
    label.textContent  = `Lv ${lv} · ${xp}/${max} XP`;
  }

  // ═══════════════════════════════════════════════════════════════
  // FRETBOARD FLASH
  // ═══════════════════════════════════════════════════════════════

  function _flashNote(note) {
    document.querySelectorAll(`.lf[data-note="${note}"]`).forEach(el => {
      el.classList.add('lf--lit');
      setTimeout(() => el.classList.remove('lf--lit'), 380);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  let _mode        = 'notes';
  let _activeChord = null;
  let _activeScale = 'A Minor';
  let _scaleOn     = false;

  // Composer
  const BEATS      = 8;
  let _song        = { scale: 'A Minor', tempo: 120, beats: Array(BEATS).fill(null), name: 'My Song' };
  let _songTimers  = [];
  let _isPlaying   = false;
  let _editBeat    = -1;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  function render() {
    const pane = document.getElementById('bksec-lute');
    if (!pane) return;
    const level = _luteLevel();
    pane.innerHTML = `<div class="lute-pane">${_htmlHeader(level)}${_hasLute() ? _htmlMain(level) : _htmlNoLute()}</div>`;
    _wire();
    _refreshXpBar();
  }

  function _htmlHeader(level) {
    return `<div class="lute-header">
      <span class="lute-title">🎸 Lute</span>
      <div class="lute-xp-track"><div class="lute-xp-fill" id="lute-xp-fill"></div></div>
      <span class="lute-xp-label" id="lute-xp-label">Lv ${level}</span>
    </div>`;
  }

  function _htmlNoLute() {
    return `<div class="lute-empty">
      <div class="lute-empty-icon">🎸</div>
      <p>You don't have a lute in your pack.</p>
      <p class="lute-empty-hint">Find one at a traveling merchant or music shop in town.</p>
    </div>`;
  }

  function _htmlMain(level) {
    return _htmlModeTabs(level)
      + `<div class="lute-mode-body">`
      + (_mode === 'compose' && level >= 15 ? _htmlComposer() : _htmlFretboard(level))
      + `</div>`
      + (_mode !== 'compose' ? _htmlKeyLegend() : '')
      + _htmlActions(level);
  }

  // ─── Mode tabs ────────────────────────────────────────────────

  function _htmlModeTabs(level) {
    const tabs = [
      { key: 'notes',   icon: '♩', label: 'Notes',   min: 1  },
      { key: 'chords',  icon: '♫', label: 'Chords',  min: 5  },
      { key: 'scales',  icon: '≋', label: 'Scales',  min: 10 },
      { key: 'compose', icon: '♬', label: 'Compose', min: 15 },
    ];
    return `<div class="lute-tabs">`
      + tabs.map(t => {
          const locked = level < t.min;
          const active = _mode === t.key;
          return `<button class="lute-tab${active?' lute-tab--on':''}${locked?' lute-tab--locked':''}"
            data-lm="${t.key}" ${locked ? `disabled title="Unlocks at Lute Lv ${t.min}"` : ''}
            >${t.icon} ${t.label}${locked ? ` 🔒` : ''}</button>`;
        }).join('')
      + `</div>`;
  }

  // ─── Fretboard ────────────────────────────────────────────────

  function _htmlFretboard(level) {
    const chordNotes = _mode === 'chords' && _activeChord
      ? (CHORDS[_activeChord]?.notes ?? [])
      : [];
    const scaleNotes = (_mode === 'scales' && _scaleOn)
      ? (SCALES[_activeScale] ?? [])
      : [];

    let h = `<div class="lute-fb">`;

    // Header row
    h += `<div class="lf lf-hdr"></div>`;
    for (let f = 0; f < NUM_FRETS; f++) {
      h += `<div class="lf lf-hdr">${f === 0 ? '◦' : f}</div>`;
    }

    // String rows
    STRINGS.forEach(open => {
      h += `<div class="lf lf-str">${open}</div>`;
      for (let f = 0; f < NUM_FRETS; f++) {
        const note     = getNoteAtFret(open, f);
        const name     = note ? note.replace(/\d+$/, '') : '';
        const inChord  = chordNotes.includes(name);
        const inScale  = scaleNotes.includes(name);
        const show     = level >= 3;
        const cls      = ['lf', inChord ? 'lf--chord' : '', inScale ? 'lf--scale' : ''].filter(Boolean).join(' ');
        h += note && NOTE_FILES[note]
          ? `<div class="${cls}" data-note="${note}">${show ? name : '•'}</div>`
          : `<div class="lf lf--x"></div>`;
      }
    });

    h += `</div>`;

    // Chord row
    if (_mode === 'chords') {
      h += `<div class="lute-chord-row">`;
      Object.keys(CHORDS).forEach(name => {
        h += `<button class="lc-chord${_activeChord===name?' lc-chord--on':''}" data-chord="${name}">${name}</button>`;
      });
      h += `</div>`;
    }

    // Scale row
    if (_mode === 'scales') {
      h += `<div class="lute-scale-row">
        <label>Scale <select id="lute-scale">
          ${Object.keys(SCALES).map(s => `<option value="${s}" ${s===_activeScale?'selected':''}>${s}</option>`).join('')}
        </select></label>
        <button id="lute-scale-tog" class="lute-scale-tog${_scaleOn?' lute-scale-tog--on':''}">${_scaleOn?'Highlight ✓':'Highlight'}</button>
      </div>`;
    }

    return h;
  }

  // ─── Song Composer ────────────────────────────────────────────

  function _htmlComposer() {
    const beats = _song.beats;
    return `<div class="lc-wrap">
      <div class="lc-controls">
        <label>Key <select id="lc-scale">
          ${Object.keys(SCALES).map(s => `<option value="${s}" ${s===_song.scale?'selected':''}>${s}</option>`).join('')}
        </select></label>
        <label>BPM <select id="lc-tempo">
          ${[60,80,100,120,140,160].map(t => `<option value="${t}" ${t===_song.tempo?'selected':''}>${t}</option>`).join('')}
        </select></label>
        <input id="lc-name" class="lc-name-in" type="text" value="${_song.name ?? 'My Song'}" maxlength="30" placeholder="Song name…">
        <button id="lc-play" class="lc-btn">${_isPlaying ? '⏹ Stop' : '▶ Play'}</button>
        <button id="lc-save" class="lc-btn">💾 Save</button>
        <button id="lc-clear" class="lc-btn lc-btn--danger">✕ Clear</button>
      </div>
      <div class="lc-beats-grid">
        ${beats.map((b, i) => `<div class="lc-beat${i===_editBeat?' lc-beat--editing':''}" data-bi="${i}">
          <span class="lc-beat-n">${i+1}</span>
          <span class="lc-beat-v">${b ?? '—'}</span>
        </div>`).join('')}
      </div>
      <div id="lc-picker" class="lc-picker" style="display:${_editBeat>=0?'flex':'none'}">
        <div class="lc-picker-hd">Beat ${_editBeat+1} <button id="lc-picker-close">✕</button></div>
        <button class="lc-pick lc-pick--clear" data-pv="null">— Clear</button>
        <div class="lc-pick-sec">Chords</div>
        ${Object.keys(CHORDS).map(c => `<button class="lc-pick" data-pv="${c}">${c}</button>`).join('')}
        <div class="lc-pick-sec">Notes (Octave 4)</div>
        ${['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5'].map(n => `<button class="lc-pick" data-pv="${n}">${n}</button>`).join('')}
      </div>
      ${_htmlSavedSongs()}
    </div>`;
  }

  function _htmlSavedSongs() {
    const songs = _player()?.luteCompositions ?? [];
    if (!songs.length) return '';
    return `<div class="lc-saved">
      <span class="lc-saved-lbl">📜 Saved:</span>
      ${songs.map((s, i) => `<button class="lc-saved-btn" data-si="${i}">${s.name ?? `Song ${i+1}`}</button>`).join('')}
    </div>`;
  }

  // ─── Key legend ───────────────────────────────────────────────

  function _htmlKeyLegend() {
    const rows = [
      ['1=C3','2=D3','3=E3','4=F3','5=G3','6=A3','7=B3'],
      ['Q=C4','W=D4','E=E4','R=F4','T=G4','Y=A4','U=B4'],
      ['A=C5','S=D5','D=E5','F=F5','G=G5','H=A5','J=B5'],
      ['Z=C6'],
    ];
    return `<div class="lute-legend">`
      + rows.map(r => `<div class="lute-legend-row">${r.map(k => `<span class="lk">${k}</span>`).join('')}</div>`).join('')
      + `</div>`;
  }

  // ─── Action buttons ───────────────────────────────────────────

  function _htmlActions(level) {
    const inTown   = _inSettlement();
    const cell     = (typeof mapData !== 'undefined' && mapData[_player()?.currentLocation]) || {};
    const townName = cell.cityVillage || 'Town';
    return `<div class="lute-actions">
      <button id="lute-perform" class="lute-act-btn${!inTown?' lute-act-btn--off':''}"
        ${!inTown ? 'disabled title="Must be in a settlement to perform for an audience"' : ''}
        >🎵 Perform in ${inTown ? townName : 'a Town'}</button>
      <button id="lute-practice" class="lute-act-btn lute-act-btn--minor">🎸 Practice</button>
    </div>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // EVENT WIRING
  // ═══════════════════════════════════════════════════════════════

  function _wire() {
    // Mode tab switches
    document.querySelectorAll('[data-lm]').forEach(btn => {
      btn.addEventListener('click', () => { _mode = btn.dataset.lm; render(); });
    });

    // Fretboard cells
    document.querySelectorAll('.lf[data-note]').forEach(cell => {
      cell.addEventListener('click', () => {
        playNote(cell.dataset.note);
        _noteXp();
      });
    });

    // Chord buttons
    document.querySelectorAll('[data-chord]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.chord;
        _activeChord = (_activeChord === name) ? null : name;
        if (_activeChord) { playChord(_activeChord); _chordXp(); }
        render();
      });
    });

    // Scale controls
    const scaleSel = document.getElementById('lute-scale');
    if (scaleSel) scaleSel.addEventListener('change', e => { _activeScale = e.target.value; render(); });
    const scaleTog = document.getElementById('lute-scale-tog');
    if (scaleTog) scaleTog.addEventListener('click', () => { _scaleOn = !_scaleOn; render(); });

    // Composer controls
    const lcScale = document.getElementById('lc-scale');
    if (lcScale) lcScale.addEventListener('change', e => { _song.scale = e.target.value; });
    const lcTempo = document.getElementById('lc-tempo');
    if (lcTempo) lcTempo.addEventListener('change', e => { _song.tempo = +e.target.value; });
    const lcName = document.getElementById('lc-name');
    if (lcName) lcName.addEventListener('input', e => { _song.name = e.target.value; });

    const lcPlay = document.getElementById('lc-play');
    if (lcPlay) lcPlay.addEventListener('click', () => _isPlaying ? _stopSong() : _playSong());
    const lcSave = document.getElementById('lc-save');
    if (lcSave) lcSave.addEventListener('click', _saveSong);
    const lcClear = document.getElementById('lc-clear');
    if (lcClear) lcClear.addEventListener('click', () => { _song.beats = Array(BEATS).fill(null); render(); });

    // Beat editor
    document.querySelectorAll('.lc-beat').forEach(cell => {
      cell.addEventListener('click', () => {
        const i = +cell.dataset.bi;
        _editBeat = (_editBeat === i) ? -1 : i;
        render();
      });
    });
    document.querySelectorAll('[data-pv]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (_editBeat < 0) return;
        _song.beats[_editBeat] = btn.dataset.pv === 'null' ? null : btn.dataset.pv;
        _editBeat = -1;
        render();
      });
    });
    const pickerClose = document.getElementById('lc-picker-close');
    if (pickerClose) pickerClose.addEventListener('click', () => { _editBeat = -1; render(); });

    // Saved songs
    document.querySelectorAll('[data-si]').forEach(btn => {
      btn.addEventListener('click', () => {
        const songs = _player()?.luteCompositions ?? [];
        const s = songs[+btn.dataset.si];
        if (s) { _song = { ...s, beats: [...(s.beats ?? [])] }; render(); }
      });
    });

    // Action buttons
    const perform  = document.getElementById('lute-perform');
    if (perform)  perform.addEventListener('click', _doPerform);
    const practice = document.getElementById('lute-practice');
    if (practice) practice.addEventListener('click', _doPractice);
  }

  // ═══════════════════════════════════════════════════════════════
  // SONG COMPOSER PLAYBACK
  // ═══════════════════════════════════════════════════════════════

  function _playSong() {
    if (_isPlaying) return;
    _isPlaying = true;
    const btn = document.getElementById('lc-play');
    if (btn) btn.textContent = '⏹ Stop';

    const beatMs = Math.round(60000 / (_song.tempo || 120));
    let delay    = 0;

    _song.beats.forEach((beat, i) => {
      if (!beat) return;
      const t = setTimeout(() => {
        const cell = document.querySelector(`.lc-beat[data-bi="${i}"]`);
        if (cell) { cell.classList.add('lc-beat--playing'); setTimeout(() => cell.classList.remove('lc-beat--playing'), beatMs * 0.85); }
        if (CHORDS[beat]) playChord(beat);
        else               playNote(beat);
      }, delay);
      _songTimers.push(t);
      delay += beatMs;
    });

    const endT = setTimeout(() => { _stopSong(); _songXp(); }, delay + beatMs);
    _songTimers.push(endT);
  }

  function _stopSong() {
    _isPlaying = false;
    _songTimers.forEach(clearTimeout);
    _songTimers = [];
    const btn = document.getElementById('lc-play');
    if (btn) btn.textContent = '▶ Play';
    document.querySelectorAll('.lc-beat--playing').forEach(c => c.classList.remove('lc-beat--playing'));
  }

  function _saveSong() {
    const p = _player();
    if (!p) return;
    if (!Array.isArray(p.luteCompositions)) p.luteCompositions = [];
    const snapshot = { ...JSON.parse(JSON.stringify(_song)) };
    const existing = p.luteCompositions.findIndex(s => s.name === snapshot.name);
    if (existing >= 0) p.luteCompositions[existing] = snapshot;
    else               p.luteCompositions.push(snapshot);
    if (p.luteCompositions.length > 5) p.luteCompositions.shift();
    _addStory(`🎸 Song saved: <em>${snapshot.name || 'Untitled'}</em>`);
    render();
  }

  // ═══════════════════════════════════════════════════════════════
  // PERFORMANCE & PRACTICE
  // ═══════════════════════════════════════════════════════════════

  async function _doPerform() {
    if (typeof bookSwitchSection === 'function') bookSwitchSection('story');
    await new Promise(r => setTimeout(r, 60));
    await _progress('Playing for the crowd…', 3500);

    const cell   = (typeof mapData !== 'undefined' && mapData[_player()?.currentLocation]) || {};
    const place  = cell.cityVillage || 'the settlement';
    const tier   = _skillCheck('Lute');
    const p      = _player();

    if (tier === 1) {
      _addStory(`🎸 You fumble the strings mid-song. A few onlookers wince. No coins, but plenty of sympathy.`);
    } else if (tier === 2) {
      _addStory(`🎸 A passable performance. The crowd listens politely, then moves on.`);
      _gainXp('Lute', 1);
    } else if (tier === 3) {
      const g = 2 + Math.floor(Math.random() * 5);
      if (p) p.gold = (p.gold || 0) + g;
      _updateStats();
      _addStory(`🎸 A pleasant melody drifts through the square. A few coins land at your feet. <em>(+${g}g)</em>`);
      _gainXp('Lute', 2);
    } else if (tier === 4) {
      const g = 6 + Math.floor(Math.random() * 9);
      if (p) p.gold = (p.gold || 0) + g;
      _updateStats();
      _addStory(`🎸 The crowd gathers as your playing fills the air. Some hum along. You earn <em>${g}g</em> and genuine applause.`);
      _gainXp('Lute', 3);
    } else {
      const g = 14 + Math.floor(Math.random() * 18);
      if (p) p.gold = (p.gold || 0) + g;
      _updateStats();
      _addStory(`🎸 A masterful performance. Even the guards step away from their posts to listen. You earn <em>${g}g</em> — and ${place} will speak of this music for days.`);
      _gainXp('Lute', 4);
    }
  }

  async function _doPractice() {
    if (typeof bookSwitchSection === 'function') bookSwitchSection('story');
    await new Promise(r => setTimeout(r, 60));
    await _progress('Practicing scales and chord changes…', 2500);
    const level = _luteLevel();
    if (level < 5) {
      _addStory(`🎸 You run through the natural notes, building muscle memory.`);
    } else if (level < 10) {
      _addStory(`🎸 You work through chord transitions, your fingers finding the shapes faster now.`);
    } else {
      _addStory(`🎸 You practice in ${_activeScale}, feeling the intervals settle into your hands.`);
    }
    _gainXp('Lute', 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // KEYBOARD HANDLER
  // ═══════════════════════════════════════════════════════════════

  function _luteActive() {
    return document.getElementById('bksec-lute')?.classList.contains('active') ?? false;
  }

  function _onKeydown(e) {
    if (!_luteActive()) return;
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    const note = KEY_MAP[e.key?.toLowerCase()];
    if (!note) return;
    e.preventDefault();
    playNote(note);
    _noteXp();
  }

  // ═══════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', _onKeydown);

    // Render when bksec-lute becomes active
    const pane = document.getElementById('bksec-lute');
    if (pane) {
      const obs = new MutationObserver(() => {
        if (pane.classList.contains('active')) {
          render();
        } else {
          if (_isPlaying) _stopSong();
        }
      });
      obs.observe(pane, { attributes: true, attributeFilter: ['class'] });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════
  return { render, playNote, playChord };

})();
