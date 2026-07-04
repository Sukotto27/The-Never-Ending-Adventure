// npcConversationEngine.js
// NPC Conversation Engine — relation management, topic filtering, AI dialogue, outcome application.
// Loaded before script.js. Accesses closure-private symbols via window._NEA bridge set by script.js.

// ── Bridge helpers ────────────────────────────────────────────────────────────

function _nea()          { return window._NEA || {}; }
function _player()       { return (_nea().player) || window.player || {}; }
function _addStory(t)    { (_nea().addStory    || window.addStory    || console.log)(t); }
function _buildWheelC(o,n){ (_nea()._buildWheel || window._buildWheel || (() => {}))(o, n); }
function _goBackC()      { (_nea()._goBack     || window._goBack     || (() => {}))(); }
function _getQuestDef(id){ return (_nea().getQuestDef || window.getQuestDef || (() => null))(id); }
function _bumpImp(id,r,w){ (_nea().bumpImportance || window.bumpImportance || (() => {}))(id,r,w); }

// ── Relation levels ───────────────────────────────────────────────────────────

const RELATION_TIERS = [
  { level: -2, label: 'Hostile',      min: -999, max: -41 },
  { level: -1, label: 'Wary',         min: -40,  max: -11 },
  { level:  0, label: 'Stranger',     min: -10,  max: 19  },
  { level:  1, label: 'Acquaintance', min: 20,   max: 49  },
  { level:  2, label: 'Familiar',     min: 50,   max: 99  },
  { level:  3, label: 'Friend',       min: 100,  max: 159 },
  { level:  4, label: 'Confidant',    min: 160,  max: 219 },
  { level:  5, label: 'Intimate',     min: 220,  max: 999 },
];

function _convRelLevel(score) {
  for (const t of RELATION_TIERS) if (score >= t.min && score <= t.max) return t.level;
  return 0;
}
function _convRelLabel(score) {
  for (const t of RELATION_TIERS) if (score >= t.min && score <= t.max) return t.label;
  return 'Stranger';
}

// ── Relation state ────────────────────────────────────────────────────────────

function _getConvRel(npcId) {
  const p = _player();
  if (!p.relations) p.relations = {};
  if (!p.relations[npcId]) {
    p.relations[npcId] = {
      score:              0,
      unlockedTopics:     [],
      knownFields:        [],
      conversationLog:    [],
      romanceTrack:       false,
      npcMemory:          {},
      sessionTopicsFired: [],
    };
  }
  return p.relations[npcId];
}

// ── Quest NPC detection ───────────────────────────────────────────────────────

function _convIsQuestNpc(npc) {
  const p            = _player();
  const activeQuests = (p.journal?.quests || []).filter(q => q.status === 'Active');
  for (const inst of activeQuests) {
    const def = _getQuestDef(inst.id);
    if (!def) continue;
    const obj       = def.objectives?.[inst.objectiveIndex];
    if (!obj) continue;
    const targetNpc = obj.completion?.npc || obj.target?.npc || '';
    if (targetNpc && targetNpc.toLowerCase() === (npc.name || '').toLowerCase()) return true;
    if ((def.title || '').toLowerCase().includes((npc.name || '').toLowerCase())) return true;
  }
  return false;
}

// ── Topic availability ────────────────────────────────────────────────────────

function _convGetAvailableTopics(npc) {
  const p       = _player();
  const rel     = _getConvRel(npc.name);
  const level   = _convRelLevel(rel.score);
  const isQuest = _convIsQuestNpc(npc);

  return (typeof NPC_TOPIC_DEFS !== 'undefined' ? NPC_TOPIC_DEFS : []).filter(topic => {
    if (level < topic.requireRelation) return false;

    if (topic.requireFlag) {
      const f = topic.requireFlag;
      if (f === 'romanceable')            { if (!npc.flags?.romanceable) return false; }
      else if (f === 'recruitable')       { if (!npc.flags?.recruitable) return false; }
      else if (f === 'quest_delivery_target') { if (!_convIsQuestNpc(npc)) return false; }
      else                                { if (!p.flags?.[f]) return false; }
    }

    if (topic.requireUnlocked && !rel.unlockedTopics.includes(topic.requireUnlocked)) return false;
    if (topic.oncePerSession  && rel.sessionTopicsFired.includes(topic.id)) return false;
    if (isQuest && ['PERSONAL', 'CONFIDE'].includes(topic.category) && level < 3) return false;

    return true;
  });
}

function _convTopicsByCategory(npc) {
  const groups = {};
  for (const t of _convGetAvailableTopics(npc)) {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  }
  return groups;
}

// ── AI context builder ────────────────────────────────────────────────────────

function _convBuildContext(npc, topic, tone) {
  const p        = _player();
  const rel      = _getConvRel(npc.name);
  const relLevel = _convRelLevel(rel.score);
  const relLabel = _convRelLabel(rel.score);
  const cell     = (typeof mapData !== 'undefined' && mapData[p.currentLocation]) || {};
  const known    = rel.knownFields || [];

  const playerKnows = { name: npc.name, race: npc.race, gender: npc.gender };
  if (known.includes('profession'))                                 playerKnows.profession   = npc.profession;
  if (known.includes('backstory_1') || known.includes('backstory')) playerKnows.backstory    = npc.backstory;
  if (known.includes('goals'))                                      playerKnows.goals        = npc.goals;
  if (known.includes('motives'))                                    playerKnows.motives      = npc.motives;
  if (known.includes('fears'))                                      playerKnows.fears        = '(known)';
  if (known.includes('secret'))                                     playerKnows.secret       = npc.secret;
  if (known.includes('secret_partial'))                             playerKnows.secret_hint  = '(player suspects a secret)';
  if (known.includes('friends'))                                    playerKnows.friends      = npc.friends;
  if (known.includes('enemies'))                                    playerKnows.enemies      = npc.enemies;
  if (known.includes('affiliation'))                                playerKnows.affiliation  = npc.affiliation;
  if (known.includes('alias'))                                      playerKnows.alias        = npc.alias;
  if (known.includes('beliefs'))                                    playerKnows.beliefs      = '(discussed)';
  if (known.includes('corruption_status'))                          playerKnows.corruption   = '(player aware)';
  if (known.includes('is_local_or_travelling'))                     playerKnows.local_status = '(established)';
  if (known.includes('family_fragment'))                            playerKnows.family       = '(touched on)';

  const recentLog = (rel.conversationLog || []).slice(-6).map(e =>
    `[${e.topicLabel}] Player (${e.tone}): "${e.playerLine}" → NPC: "${e.npcLine}" [${e.outcome}]`
  );

  let questContext = null;
  if (_convIsQuestNpc(npc)) {
    const activeQuests = (p.journal?.quests || []).filter(q => q.status === 'Active');
    const relQuests = activeQuests.map(inst => {
      const def = _getQuestDef(inst.id);
      if (!def) return null;
      const obj       = def.objectives?.[inst.objectiveIndex];
      const targetNpc = obj?.completion?.npc || obj?.target?.npc || '';
      if (!targetNpc || targetNpc.toLowerCase() !== (npc.name || '').toLowerCase()) return null;
      return { questTitle: def.title, currentObjective: obj?.description };
    }).filter(Boolean);
    if (relQuests.length) questContext = relQuests;
  }

  return {
    setting: {
      locationName:        cell.cityVillage || cell.biome || p.currentLocation || 'unknown',
      kingdom:             cell.kingdom     || p.currentKingdom || 'unknown',
      locationDescription: cell.description || '',
      biome:               cell.biome       || '',
      timeOfDay:           p.timeOfDay      || 'daytime',
      weather:             p.weather        || 'Clear',
    },
    player: {
      name:       p.name,
      race:       p.race,
      gender:     p.gender,
      profession: p.profession,
      level:      p.level,
      relation:   { label: relLabel, level: relLevel, score: rel.score },
      npcMemory:  rel.npcMemory || {},
    },
    npc: {
      name:        npc.name,
      race:        npc.race,
      gender:      npc.gender,
      alias:       npc.alias,
      socialClass: npc.socialClass,
      profession:  npc.profession,
      appearance:  npc.appearance,
      morality:    npc.morality,
      backstory:   npc.backstory,
      description: npc.description,
      goals:       npc.goals,
      motives:     npc.motives,
      secret:      npc.secret,
      traits:      npc.traits,
      friends:     npc.friends,
      enemies:     npc.enemies,
      affiliation: npc.affiliation,
      reputation:  npc.reputation,
      disposition: npc.disposition ?? 0,
      flags:       npc.flags,
    },
    playerKnowsAboutNpc: playerKnows,
    topic: {
      id:             topic.id,
      category:       topic.category,
      label:          topic.label,
      promptTemplate: topic.promptTemplate,
      tone,
    },
    conversationHistory: recentLog,
    questContext,
    sessionTopicsFired: rel.sessionTopicsFired || [],
  };
}

// ── Claude API call ───────────────────────────────────────────────────────────

async function _convCallAI(context) {
  const apiKey = localStorage.getItem('nea_claude_key') || '';
  if (!apiKey) {
    return {
      playerLine:    `[Add your Claude API key in Settings → AI Dialogue to enable dynamic conversation.]`,
      npcLine:       `${context.npc.name} regards you with a measured look, saying nothing for a moment.`,
      outcome:       'neutral',
      outcomeReason: '',
    };
  }

  const systemPrompt = `You are a dialogue writer for a medieval fantasy text RPG called "The Never-Ending Adventure."
Write a short, immersive conversation exchange between the player character and an NPC.

STRICT RULES:
- The NPC's words must reflect their personality, morality, backstory, social class, and current disposition.
- The player's line must match the tone: ${context.topic.tone}.
- Each line must be 1-3 sentences max. No purple prose.
- The NPC must NOT reveal information absent from playerKnowsAboutNpc.
- If questContext exists, the NPC is aware of that shared situation — weave it in naturally if the topic allows.
- conversationHistory shows prior exchanges — do NOT repeat them; build on them.
- Setting (weather, location, time of day) should subtly colour the exchange when relevant.
- outcome must honestly reflect how the NPC reacted: "positive", "neutral", or "negative".
- outcomeReason is one short phrase (under 8 words) explaining why.

Output ONLY valid JSON, no markdown:
{"playerLine":"...","npcLine":"...","outcome":"positive|neutral|negative","outcomeReason":"..."}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':                                 apiKey,
        'anthropic-version':                         '2023-06-01',
        'content-type':                              'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 350,
        system:     systemPrompt,
        messages: [{ role: 'user', content: JSON.stringify(context) }],
      }),
    });

    if (!resp.ok) {
      console.error('Conversation AI HTTP', resp.status, await resp.text().catch(() => ''));
      throw new Error(`API ${resp.status}`);
    }

    const data = await resp.json();
    const raw  = (data.content?.[0]?.text || '').trim();
    const s    = raw.indexOf('{');
    const e    = raw.lastIndexOf('}');
    if (s === -1 || e === -1) throw new Error('No JSON in response');
    return JSON.parse(raw.slice(s, e + 1));
  } catch (err) {
    console.error('Conversation AI error:', err);
    return {
      playerLine:    `[${context.topic.label}]`,
      npcLine:       `${context.npc.name} seems distracted and doesn't respond clearly.`,
      outcome:       'neutral',
      outcomeReason: '',
    };
  }
}

// ── Outcome application ───────────────────────────────────────────────────────

function _convApplyOutcomes(npc, topic, tone, aiResult) {
  const p         = _player();
  const rel       = _getConvRel(npc.name);
  const prevLevel = _convRelLevel(rel.score);
  const outDef    = topic.outcomes?.[aiResult.outcome] || topic.outcomes?.neutral || {};

  if (outDef.relationDelta) {
    rel.score = Math.max(-60, Math.min(300, rel.score + outDef.relationDelta));
  }

  if (outDef.reveals) {
    for (const f of outDef.reveals) if (!rel.knownFields.includes(f)) rel.knownFields.push(f);
  }

  if (outDef.unlocksTopics) {
    for (const tid of outDef.unlocksTopics) {
      if (!rel.unlockedTopics.includes(tid)) rel.unlockedTopics.push(tid);
    }
  }
  if (!rel.unlockedTopics.includes(topic.id)) rel.unlockedTopics.push(topic.id);

  if (outDef.unlocksInfo) {
    _addStory(`\u{1F4D6} <em>You've learned something — a ${outDef.unlocksInfo.replace(/_/g, ' ')}.</em>`);
  }

  if (outDef.npcMemory) rel.npcMemory[outDef.npcMemory] = true;
  if (outDef.moodShift) rel.npcMemory._currentMood = outDef.moodShift;
  if (outDef.npcMemory === 'romance_track_open') rel.romanceTrack = true;

  if (outDef.triggerQuestHook) {
    _addStory(`\u{1F5FA}️ <em>[Quest hook: ${outDef.triggerQuestHook}]</em>`);
  }

  if (topic.oncePerSession && !rel.sessionTopicsFired.includes(topic.id)) {
    rel.sessionTopicsFired.push(topic.id);
  }

  rel.conversationLog.push({
    timestamp:  Date.now(),
    topicId:    topic.id,
    topicLabel: topic.label,
    tone,
    playerLine: aiResult.playerLine,
    npcLine:    aiResult.npcLine,
    outcome:    aiResult.outcome,
    location:   p.currentLocation,
  });

  const newLevel = _convRelLevel(rel.score);
  if (newLevel !== prevLevel) {
    const lbl = _convRelLabel(rel.score);
    _addStory(newLevel > prevLevel
      ? `\u{1F49B} Your relationship with <strong>${npc.name}</strong> has deepened — <em>${lbl}</em>.`
      : `\u{1F494} Your relationship with <strong>${npc.name}</strong> has cooled — <em>${lbl}</em>.`
    );
  }

  if (npc._worldId) _bumpImp(npc._worldId, `conversation: ${topic.id}`, 1);

  if (p.traitCounters) {
    p.traitCounters.npcInteractions = (p.traitCounters.npcInteractions || 0) + 1;
  }

  return topic.endsConversation ? 'end' : 'continue';
}

// ── Conversation UI ───────────────────────────────────────────────────────────

let _convActiveNpc = null;

const _CATEGORY_META = {
  GREET:      { icon: '\u{1F44B}', label: 'Greet'      },
  SMALL_TALK: { icon: '\u{1F4AC}', label: 'Small Talk' },
  ASK_ABOUT:  { icon: '❓',    label: 'Ask About'  },
  DISCUSS:    { icon: '\u{1F5E3}️', label: 'Discuss' },
  SHARE:      { icon: '\u{1F91D}', label: 'Share'      },
  PERSONAL:   { icon: '\u{1F49B}', label: 'Personal'   },
  CONFIDE:    { icon: '\u{1F512}', label: 'Confide'    },
  ROMANCE:    { icon: '❤️', label: 'Romance'  },
  REQUEST:    { icon: '\u{1F4CB}', label: 'Request'    },
  PART_WAYS:  { icon: '\u{1F6B6}', label: 'Part Ways'  },
};

const _TONE_META = {
  neutral:     { icon: '\u{1F937}', label: 'Neutral'     },
  friendly:    { icon: '\u{1F60A}', label: 'Friendly'    },
  formal:      { icon: '\u{1F3A9}', label: 'Formal'      },
  curious:     { icon: '\u{1F50D}', label: 'Curious'     },
  playful:     { icon: '\u{1F604}', label: 'Playful'     },
  sympathetic: { icon: '\u{1F499}', label: 'Sympathetic' },
  direct:      { icon: '⚡',    label: 'Direct'      },
  deceptive:   { icon: '\u{1F3AD}', label: 'Deceptive'   },
};

function openNpcConversation(npc) {
  if (!npc || !npc.name) return;
  _convActiveNpc = npc;
  const rel = _getConvRel(npc.name);
  rel.sessionTopicsFired = [];
  _convShowCategoryWheel(npc);
}

function _convShowCategoryWheel(npc) {
  const byCategory = _convTopicsByCategory(npc);
  const rel        = _getConvRel(npc.name);
  const relLabel   = _convRelLabel(rel.score);

  const categoryOrder = ['GREET','SMALL_TALK','ASK_ABOUT','DISCUSS','SHARE','PERSONAL','CONFIDE','ROMANCE','REQUEST','PART_WAYS'];
  const options = categoryOrder
    .filter(cat => (byCategory[cat] || []).length > 0)
    .map(cat => {
      const meta = _CATEGORY_META[cat] || { icon: '●', label: cat };
      return {
        label:  `${meta.icon} ${meta.label}`,
        action: () => _convShowTopicWheel(npc, cat, byCategory[cat]),
      };
    });

  if (options.length === 0) {
    _addStory(`${npc.name} doesn't seem to want to talk right now.`);
    _goBackC();
    return;
  }

  options.push({
    label:  '← Leave',
    action: () => { _convActiveNpc = null; _goBackC(); },
    isBack: true,
  });

  _addStory(`<strong>Talking to ${npc.name}</strong> &mdash; <em>${relLabel}</em>`);
  _buildWheelC(options, npc.name);
}

function _convShowTopicWheel(npc, category, topics) {
  const meta    = _CATEGORY_META[category] || { icon: '', label: category };
  const options = topics.map(topic => ({
    label:  topic.label.length > 24 ? topic.label.slice(0, 22) + '…' : topic.label,
    action: () => _convSelectTopic(npc, topic),
  }));
  options.push({
    label:  '← Back',
    action: () => _convShowCategoryWheel(npc),
    isBack: true,
  });
  _buildWheelC(options, `${meta.icon} ${meta.label}`);
}

function _convSelectTopic(npc, topic) {
  const tones = topic.tones || ['neutral'];
  if (tones.length === 1) {
    _convFireTopic(npc, topic, tones[0]);
    return;
  }
  const options = tones.map(tone => {
    const m = _TONE_META[tone] || { icon: '●', label: tone };
    return {
      label:  `${m.icon} ${m.label}`,
      action: () => _convFireTopic(npc, topic, tone),
    };
  });
  options.push({
    label:  '← Back',
    action: () => {
      const byCategory = _convTopicsByCategory(npc);
      _convShowTopicWheel(npc, topic.category, byCategory[topic.category] || []);
    },
    isBack: true,
  });
  _buildWheelC(options, 'How do you say it?');
}

async function _convFireTopic(npc, topic, tone) {
  _buildWheelC([{ label: '\u{1F4AC} …', action: () => {} }]);

  const context  = _convBuildContext(npc, topic, tone);
  const aiResult = await _convCallAI(context);

  _addStory(`<strong>You</strong> <em>(${tone})</em>: &ldquo;${aiResult.playerLine}&rdquo;`);
  _addStory(`<strong>${npc.name}</strong>: &ldquo;${aiResult.npcLine}&rdquo;`);
  if (aiResult.outcomeReason) _addStory(`<em>${aiResult.outcomeReason}</em>`);

  const status = _convApplyOutcomes(npc, topic, tone, aiResult);

  const sg = _nea().saveGame || window.saveGame;
  if (typeof sg === 'function') sg();

  if (status === 'end') {
    _convActiveNpc = null;
    _goBackC();
    return;
  }

  await new Promise(r => setTimeout(r, 300));
  _convShowCategoryWheel(npc);
}
