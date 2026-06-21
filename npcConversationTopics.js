// npcConversationTopics.js
// All conversation topic definitions for the NPC conversation tree.
// Prompt/response text is generated at runtime by the AI engine (npcConversationEngine.js).
// This file defines structure: categories, unlock conditions, outcome shapes, and tone options.
//
// requireRelation: minimum relation level (-2 Hostile … 5 Intimate)
// requireUnlocked: topic id that must have already fired in a prior exchange
// requireFlag:     'romanceable' | 'recruitable' | player flag key
// tones:           subset of neutral | friendly | formal | curious | playful | sympathetic | direct | deceptive
// oncePerSession:  topic disappears after firing once per conversation
// endsConversation: triggers farewell and closes the wheel

const NPC_TOPIC_DEFS = [

  // ══════════════════════════════════════════════════════════════
  // GREET
  // ══════════════════════════════════════════════════════════════
  {
    id: 'greet_simple',
    category: 'GREET',
    label: 'Say hello',
    requireRelation: -1,
    tones: ['neutral', 'friendly', 'formal'],
    promptTemplate: 'A simple opening greeting appropriate to the setting and time of day.',
    outcomes: {
      positive: { relationDelta: 5,  unlocksCategory: 'SMALL_TALK' },
      neutral:  { relationDelta: 2 },
      negative: { relationDelta: -2 },
    },
    oncePerSession: true,
  },
  {
    id: 'greet_remark_location',
    category: 'GREET',
    label: 'Remark on the place',
    requireRelation: -1,
    tones: ['neutral', 'curious', 'friendly'],
    promptTemplate: 'Use the current location, weather, or time of day as an icebreaker.',
    outcomes: {
      positive: { relationDelta: 4, unlocksTopics: ['smalltalk_news'] },
      neutral:  { relationDelta: 1 },
      negative: { relationDelta: 0 },
    },
  },
  {
    id: 'greet_reacquaint',
    category: 'GREET',
    label: 'Pick up where we left off',
    requireRelation: 1,
    tones: ['friendly', 'neutral'],
    promptTemplate: 'Acknowledge that you have spoken before and resume naturally.',
    outcomes: {
      positive: { relationDelta: 4 },
      neutral:  { relationDelta: 2 },
    },
    oncePerSession: true,
  },

  // ══════════════════════════════════════════════════════════════
  // SMALL_TALK
  // ══════════════════════════════════════════════════════════════
  {
    id: 'smalltalk_weather',
    category: 'SMALL_TALK',
    label: 'The weather',
    requireRelation: 1,
    tones: ['neutral', 'friendly'],
    promptTemplate: 'Make small talk about the current weather conditions.',
    outcomes: {
      positive: { relationDelta: 3, revealsNpcMood: true },
      neutral:  { relationDelta: 1 },
    },
  },
  {
    id: 'smalltalk_travel',
    category: 'SMALL_TALK',
    label: 'Talk about the road',
    requireRelation: 1,
    tones: ['neutral', 'curious'],
    promptTemplate: 'Chat about travelling, the roads, and what brought you both here.',
    outcomes: {
      positive: { relationDelta: 3, reveals: ['is_local_or_travelling'] },
      neutral:  { relationDelta: 1 },
    },
  },
  {
    id: 'smalltalk_news',
    category: 'SMALL_TALK',
    label: 'Any news?',
    requireRelation: 1,
    tones: ['neutral', 'curious', 'friendly'],
    promptTemplate: 'Ask if there is any local or recent news worth knowing.',
    outcomes: {
      positive: { relationDelta: 2, unlocksInfo: 'world_rumour' },
      neutral:  { relationDelta: 1, unlocksInfo: 'world_rumour' },
      negative: { relationDelta: 0 },
    },
  },
  {
    id: 'smalltalk_compliment',
    category: 'SMALL_TALK',
    label: 'Pay a compliment',
    requireRelation: 1,
    tones: ['friendly', 'playful'],
    promptTemplate: 'Pay a genuine, context-appropriate compliment to the NPC.',
    outcomes: {
      positive: { relationDelta: 6, revealsNpcTrait: true },
      neutral:  { relationDelta: 2 },
      negative: { relationDelta: -4 },
    },
    oncePerSession: true,
  },
  {
    id: 'smalltalk_trade',
    category: 'SMALL_TALK',
    label: 'Trade and prices',
    requireRelation: 1,
    tones: ['neutral', 'curious'],
    promptTemplate: 'Discuss the local economy, trade, and whether prices are fair.',
    outcomes: {
      positive: { relationDelta: 2, unlocksInfo: 'economy_fragment' },
      neutral:  { relationDelta: 1 },
    },
  },
  {
    id: 'smalltalk_local_life',
    category: 'SMALL_TALK',
    label: 'Life around here',
    requireRelation: 1,
    tones: ['friendly', 'curious', 'neutral'],
    promptTemplate: 'Ask what day-to-day life is like in this place.',
    outcomes: {
      positive: { relationDelta: 3, unlocksInfo: 'location_flavour', reveals: ['is_local_or_travelling'] },
      neutral:  { relationDelta: 1 },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ASK_ABOUT
  // ══════════════════════════════════════════════════════════════
  {
    id: 'ask_profession',
    category: 'ASK_ABOUT',
    label: 'What do you do?',
    requireRelation: 1,
    tones: ['neutral', 'curious', 'friendly'],
    promptTemplate: 'Ask the NPC about their profession or role in the world.',
    outcomes: {
      positive: { relationDelta: 3, reveals: ['profession'], unlocksTopics: ['ask_how_long_here'] },
      neutral:  { relationDelta: 1, reveals: ['profession'] },
      negative: { relationDelta: -1 },
    },
  },
  {
    id: 'ask_this_place',
    category: 'ASK_ABOUT',
    label: 'About this place',
    requireRelation: 1,
    tones: ['neutral', 'curious'],
    promptTemplate: 'Ask the NPC what they know about the current location.',
    outcomes: {
      positive: { relationDelta: 2, unlocksInfo: 'location_lore' },
      neutral:  { relationDelta: 1, unlocksInfo: 'location_lore' },
    },
  },
  {
    id: 'ask_rumours',
    category: 'ASK_ABOUT',
    label: 'Heard any rumours?',
    requireRelation: 1,
    tones: ['neutral', 'curious', 'playful'],
    promptTemplate: 'Ask if the NPC has picked up any interesting rumours or gossip.',
    outcomes: {
      positive: { relationDelta: 2, unlocksInfo: 'rumour_or_quest_seed' },
      neutral:  { relationDelta: 0, unlocksInfo: 'rumour_or_quest_seed' },
      negative: { relationDelta: -1 },
    },
  },
  {
    id: 'ask_how_long_here',
    category: 'ASK_ABOUT',
    label: 'How long have you been here?',
    requireRelation: 2,
    requireUnlocked: 'ask_profession',
    tones: ['neutral', 'curious', 'friendly'],
    promptTemplate: 'Ask how long the NPC has lived or worked in this location.',
    outcomes: {
      positive: { relationDelta: 4, reveals: ['backstory_1', 'is_local_or_travelling'] },
      neutral:  { relationDelta: 2, reveals: ['backstory_1'] },
      negative: { relationDelta: -2 },
    },
  },
  {
    id: 'ask_family',
    category: 'ASK_ABOUT',
    label: 'Do you have family?',
    requireRelation: 2,
    tones: ['friendly', 'sympathetic'],
    promptTemplate: 'Ask the NPC carefully about family — it may be a tender topic.',
    outcomes: {
      positive: { relationDelta: 5, reveals: ['family_fragment'] },
      neutral:  { relationDelta: 2, reveals: ['family_fragment'] },
      negative: { relationDelta: -3 },
    },
  },
  {
    id: 'ask_origin',
    category: 'ASK_ABOUT',
    label: 'Where are you from?',
    requireRelation: 2,
    tones: ['neutral', 'curious', 'friendly'],
    promptTemplate: 'Ask where the NPC originally came from.',
    outcomes: {
      positive: { relationDelta: 4, reveals: ['backstory_2'] },
      neutral:  { relationDelta: 2, reveals: ['backstory_2'] },
      negative: { relationDelta: -2 },
    },
  },
  {
    id: 'ask_motivation',
    category: 'ASK_ABOUT',
    label: 'What drives you?',
    requireRelation: 3,
    tones: ['curious', 'friendly', 'direct'],
    promptTemplate: 'Ask the NPC what motivates them in life — what they are working toward.',
    outcomes: {
      positive: { relationDelta: 6, reveals: ['goals', 'motives'] },
      neutral:  { relationDelta: 3, reveals: ['goals'] },
      negative: { relationDelta: -2 },
    },
  },
  {
    id: 'ask_fears',
    category: 'ASK_ABOUT',
    label: 'What do you fear?',
    requireRelation: 3,
    tones: ['sympathetic', 'curious', 'direct'],
    promptTemplate: 'Ask the NPC what frightens or worries them most.',
    outcomes: {
      positive: { relationDelta: 7, reveals: ['fears'] },
      neutral:  { relationDelta: 4 },
      negative: { relationDelta: -4 },
    },
  },
  {
    id: 'ask_past',
    category: 'ASK_ABOUT',
    label: 'Tell me about your past',
    requireRelation: 3,
    requireUnlocked: 'ask_how_long_here',
    tones: ['sympathetic', 'curious', 'friendly'],
    promptTemplate: 'Invite the NPC to share something meaningful from their history.',
    outcomes: {
      positive: { relationDelta: 8, reveals: ['backstory_3'] },
      neutral:  { relationDelta: 4 },
      negative: { relationDelta: -5 },
    },
  },
  {
    id: 'ask_secret_hint',
    category: 'ASK_ABOUT',
    label: "Is there something you're not telling me?",
    requireRelation: 4,
    tones: ['direct', 'sympathetic', 'curious'],
    promptTemplate: 'Gently press the NPC on whether they are hiding something.',
    outcomes: {
      positive: { relationDelta: 5, reveals: ['secret_partial'], unlocksTopics: ['ask_secret_full'] },
      neutral:  { relationDelta: 0 },
      negative: { relationDelta: -6 },
    },
  },
  {
    id: 'ask_secret_full',
    category: 'ASK_ABOUT',
    label: 'Tell me the whole truth',
    requireRelation: 4,
    requireUnlocked: 'ask_secret_hint',
    tones: ['direct', 'sympathetic'],
    promptTemplate: 'Press the NPC for the complete, unguarded truth.',
    outcomes: {
      positive: { relationDelta: 10, reveals: ['secret'] },
      neutral:  { relationDelta: 0 },
      negative: { relationDelta: -10, moodShift: 'hostile' },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // DISCUSS
  // ══════════════════════════════════════════════════════════════
  {
    id: 'discuss_kingdom',
    category: 'DISCUSS',
    label: 'The kingdom',
    requireRelation: 2,
    tones: ['neutral', 'curious', 'direct'],
    promptTemplate: 'Discuss the current kingdom — its ruler, politics, and character.',
    outcomes: {
      positive: { relationDelta: 3, reveals: ['affiliation'], unlocksInfo: 'kingdom_lore' },
      neutral:  { relationDelta: 1 },
      negative: { relationDelta: -2 },
    },
  },
  {
    id: 'discuss_old_days',
    category: 'DISCUSS',
    label: 'The old days',
    requireRelation: 2,
    tones: ['curious', 'friendly', 'sympathetic'],
    promptTemplate: 'Discuss what things were like before recent times — history, change, loss.',
    outcomes: {
      positive: { relationDelta: 5, reveals: ['backstory_2'], unlocksInfo: 'historical_lore' },
      neutral:  { relationDelta: 2, unlocksInfo: 'historical_lore' },
    },
  },
  {
    id: 'discuss_religion',
    category: 'DISCUSS',
    label: 'Religion and the gods',
    requireRelation: 2,
    tones: ['neutral', 'curious', 'friendly'],
    promptTemplate: 'Raise the subject of religion, the gods, or spiritual belief.',
    outcomes: {
      positive: { relationDelta: 3, reveals: ['beliefs'] },
      neutral:  { relationDelta: 1 },
      negative: { relationDelta: -3 },
    },
  },
  {
    id: 'discuss_threats',
    category: 'DISCUSS',
    label: 'Dangers nearby',
    requireRelation: 2,
    tones: ['neutral', 'curious', 'direct'],
    promptTemplate: 'Ask the NPC what dangers or threats exist in the area.',
    outcomes: {
      positive: { relationDelta: 2, unlocksInfo: 'threat_or_quest_seed' },
      neutral:  { relationDelta: 1, unlocksInfo: 'threat_or_quest_seed' },
      negative: { relationDelta: -1 },
    },
  },
  {
    id: 'discuss_corruption',
    category: 'DISCUSS',
    label: 'The old curse',
    requireRelation: 2,
    requireFlag: 'player_knows_corruption_lore',
    tones: ['curious', 'direct', 'sympathetic'],
    promptTemplate: 'Raise the ancient corruption — goblins, orcs, and the old curse.',
    outcomes: {
      positive: { relationDelta: 4, reveals: ['corruption_status'], unlocksInfo: 'corruption_lore_fragment' },
      neutral:  { relationDelta: 1 },
      negative: { relationDelta: -4 },
    },
  },
  {
    id: 'discuss_magic',
    category: 'DISCUSS',
    label: 'Magic and mana',
    requireRelation: 2,
    tones: ['curious', 'neutral'],
    promptTemplate: 'Bring up the subject of magic, mana, and those who wield it.',
    outcomes: {
      positive: { relationDelta: 3, reveals: ['mana_status'], unlocksInfo: 'magic_lore_fragment' },
      neutral:  { relationDelta: 1 },
    },
  },
  {
    id: 'discuss_enemies',
    category: 'DISCUSS',
    label: 'Their enemies',
    requireRelation: 3,
    tones: ['sympathetic', 'direct', 'curious'],
    promptTemplate: 'Ask the NPC who they consider an enemy — carefully.',
    outcomes: {
      positive: { relationDelta: 6, reveals: ['enemies'] },
      neutral:  { relationDelta: 3, reveals: ['enemies'] },
      negative: { relationDelta: -4 },
    },
  },
  {
    id: 'discuss_friends',
    category: 'DISCUSS',
    label: 'People they care about',
    requireRelation: 3,
    tones: ['friendly', 'curious'],
    promptTemplate: 'Ask the NPC who they care about most in the world.',
    outcomes: {
      positive: { relationDelta: 6, reveals: ['friends'], unlocksTopics: ['personal_who_care'] },
      neutral:  { relationDelta: 3, reveals: ['friends'] },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // SHARE
  // ══════════════════════════════════════════════════════════════
  {
    id: 'share_rumour',
    category: 'SHARE',
    label: 'Share a rumour',
    requireRelation: 2,
    tones: ['neutral', 'friendly', 'playful'],
    promptTemplate: 'Share something you have heard on your travels. Watch how the NPC reacts.',
    outcomes: {
      positive: { relationDelta: 4, reveals: ['npc_connection_to_rumour'] },
      neutral:  { relationDelta: 1 },
      negative: { relationDelta: -2 },
    },
  },
  {
    id: 'share_about_yourself',
    category: 'SHARE',
    label: 'Tell them about yourself',
    requireRelation: 2,
    tones: ['friendly', 'neutral'],
    promptTemplate: 'Open up to the NPC about who you are and where you have been.',
    outcomes: {
      positive: { relationDelta: 6, unlocksTopics: ['ask_past'] },
      neutral:  { relationDelta: 2 },
      negative: { relationDelta: -1 },
    },
    oncePerSession: true,
  },
  {
    id: 'share_travels',
    category: 'SHARE',
    label: 'Talk about your travels',
    requireRelation: 2,
    tones: ['friendly', 'playful', 'curious'],
    promptTemplate: 'Describe your recent travels. The NPC may share a parallel experience.',
    outcomes: {
      positive: { relationDelta: 4, reveals: ['is_local_or_travelling'] },
      neutral:  { relationDelta: 2 },
    },
  },
  {
    id: 'share_secret',
    category: 'SHARE',
    label: 'Share something in confidence',
    requireRelation: 3,
    tones: ['direct', 'sympathetic'],
    promptTemplate: 'Reveal something personal and private to the NPC as an act of trust.',
    outcomes: {
      positive: { relationDelta: 10, reveals: ['secret_partial'], unlocksTopics: ['ask_secret_hint'] },
      neutral:  { relationDelta: 0 },
      negative: { relationDelta: -8, moodShift: 'wary' },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // PERSONAL
  // ══════════════════════════════════════════════════════════════
  {
    id: 'personal_past',
    category: 'PERSONAL',
    label: 'Your history',
    requireRelation: 3,
    tones: ['sympathetic', 'curious'],
    promptTemplate: 'Ask the NPC to open up about their personal history.',
    outcomes: {
      positive: { relationDelta: 8, reveals: ['backstory', 'backstory_3'] },
      neutral:  { relationDelta: 3 },
      negative: { relationDelta: -5 },
    },
  },
  {
    id: 'personal_what_happened',
    category: 'PERSONAL',
    label: 'What happened to you?',
    requireRelation: 3,
    requireUnlocked: 'personal_past',
    tones: ['sympathetic'],
    promptTemplate: 'Probe gently about a defining wound or trauma in their past.',
    outcomes: {
      positive: { relationDelta: 10, reveals: ['backstory_trauma'] },
      neutral:  { relationDelta: 4 },
      negative: { relationDelta: -8, moodShift: 'distressed' },
    },
  },
  {
    id: 'personal_who_care',
    category: 'PERSONAL',
    label: 'Who do you love?',
    requireRelation: 3,
    tones: ['sympathetic', 'friendly'],
    promptTemplate: 'Ask who the NPC loves or cares for most deeply.',
    outcomes: {
      positive: { relationDelta: 7, reveals: ['friends', 'family_fragment'] },
      neutral:  { relationDelta: 3 },
    },
  },
  {
    id: 'personal_running_from',
    category: 'PERSONAL',
    label: 'What are you running from?',
    requireRelation: 3,
    requireUnlocked: 'personal_past',
    tones: ['sympathetic', 'direct'],
    promptTemplate: 'Ask whether the NPC is fleeing something — with care and without judgement.',
    outcomes: {
      positive: { relationDelta: 8, reveals: ['enemies', 'backstory_conflict'] },
      neutral:  { relationDelta: 2 },
      negative: { relationDelta: -7 },
    },
  },
  {
    id: 'personal_real_name',
    category: 'PERSONAL',
    label: 'Is that your real name?',
    requireRelation: 4,
    requireUnlocked: 'ask_secret_hint',
    tones: ['direct', 'sympathetic'],
    promptTemplate: 'Gently ask whether the name you know them by is their true name.',
    outcomes: {
      positive: { relationDelta: 10, reveals: ['alias'] },
      neutral:  { relationDelta: 0 },
      negative: { relationDelta: -10, moodShift: 'hostile' },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // CONFIDE
  // ══════════════════════════════════════════════════════════════
  {
    id: 'confide_trust',
    category: 'CONFIDE',
    label: 'I need to trust someone',
    requireRelation: 4,
    tones: ['direct', 'sympathetic'],
    promptTemplate: 'Express that you need to confide in the NPC — a genuine act of vulnerability.',
    outcomes: {
      positive: { relationDelta: 12, unlocksTopics: ['confide_tell_everything', 'confide_real_want'] },
      neutral:  { relationDelta: 3 },
      negative: { relationDelta: -5 },
    },
    oncePerSession: true,
  },
  {
    id: 'confide_tell_everything',
    category: 'CONFIDE',
    label: 'Hold nothing back',
    requireRelation: 4,
    requireUnlocked: 'confide_trust',
    tones: ['direct'],
    promptTemplate: 'Ask the NPC to reveal everything, holding nothing back.',
    outcomes: {
      positive: { relationDelta: 10, reveals: ['secret', 'goals', 'motives'] },
      neutral:  { relationDelta: 0 },
      negative: { relationDelta: -8 },
    },
  },
  {
    id: 'confide_real_want',
    category: 'CONFIDE',
    label: 'What do you really want?',
    requireRelation: 4,
    tones: ['sympathetic', 'direct'],
    promptTemplate: 'Ask the NPC their deepest desire or ambition — what they want when no one is watching.',
    outcomes: {
      positive: { relationDelta: 10, reveals: ['motives', 'goals'] },
      neutral:  { relationDelta: 4 },
      negative: { relationDelta: -6 },
    },
  },
  {
    id: 'confide_corruption',
    category: 'CONFIDE',
    label: 'I know what you are',
    requireRelation: 4,
    requireFlag: 'player_knows_corruption_lore',
    tones: ['direct', 'sympathetic'],
    promptTemplate: 'Confront the NPC directly about their corrupted bloodline or nature.',
    outcomes: {
      positive: { relationDelta: 15, reveals: ['corruption_status', 'secret'] },
      neutral:  { relationDelta: 0 },
      negative: { relationDelta: -15, moodShift: 'hostile' },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ROMANCE
  // ══════════════════════════════════════════════════════════════
  {
    id: 'romance_compliment',
    category: 'ROMANCE',
    label: 'Compliment them',
    requireRelation: 2,
    requireFlag: 'romanceable',
    tones: ['friendly', 'playful'],
    promptTemplate: 'Pay a compliment that hints at romantic interest without being direct.',
    outcomes: {
      positive: { relationDelta: 6, npcMemory: 'player_flirted', unlocksTopics: ['romance_interest'] },
      neutral:  { relationDelta: 2 },
      negative: { relationDelta: -3 },
    },
  },
  {
    id: 'romance_interest',
    category: 'ROMANCE',
    label: 'Express interest',
    requireRelation: 2,
    requireFlag: 'romanceable',
    requireUnlocked: 'romance_compliment',
    tones: ['friendly', 'direct'],
    promptTemplate: 'Make clear you are interested in the NPC as more than a friend.',
    outcomes: {
      positive: { relationDelta: 8, reveals: ['romantic_receptivity'], npcMemory: 'romance_track_open', unlocksTopics: ['romance_flirt'] },
      neutral:  { relationDelta: 0 },
      negative: { relationDelta: -5, moodShift: 'awkward' },
    },
  },
  {
    id: 'romance_flirt',
    category: 'ROMANCE',
    label: 'Flirt',
    requireRelation: 3,
    requireFlag: 'romanceable',
    requireUnlocked: 'romance_interest',
    tones: ['playful', 'direct'],
    promptTemplate: 'Flirt openly and see how the NPC responds.',
    outcomes: {
      positive: { relationDelta: 8, npcMemory: 'romance_progressing' },
      neutral:  { relationDelta: 1 },
      negative: { relationDelta: -6 },
    },
  },
  {
    id: 'romance_confess',
    category: 'ROMANCE',
    label: 'Confess your feelings',
    requireRelation: 4,
    requireFlag: 'romanceable',
    requireUnlocked: 'romance_flirt',
    tones: ['direct', 'sympathetic'],
    promptTemplate: 'Tell the NPC honestly how you feel about them.',
    outcomes: {
      positive: { relationDelta: 20, npcMemory: 'feelings_confessed_accepted', triggerQuestHook: 'romance_quest_start' },
      neutral:  { relationDelta: 0,  npcMemory: 'feelings_confessed_pending' },
      negative: { relationDelta: -10, npcMemory: 'feelings_confessed_rejected' },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // REQUEST
  // ══════════════════════════════════════════════════════════════
  {
    id: 'request_info',
    category: 'REQUEST',
    label: 'I need information',
    requireRelation: 1,
    tones: ['neutral', 'direct', 'formal'],
    promptTemplate: 'Ask the NPC if they can provide useful information, possibly for coin.',
    outcomes: {
      positive: { relationDelta: 2, unlocksInfo: 'paid_rumour_or_quest' },
      neutral:  { relationDelta: 0, unlocksInfo: 'paid_rumour_or_quest' },
      negative: { relationDelta: -1 },
    },
  },
  {
    id: 'request_delivery',
    category: 'REQUEST',
    label: 'I have something for you',
    requireRelation: 0,
    requireFlag: 'quest_delivery_target',
    tones: ['neutral', 'formal'],
    promptTemplate: 'Hand over an item or message that this NPC is waiting for.',
    outcomes: {
      positive: { relationDelta: 5, triggerQuestHook: 'delivery_complete' },
      neutral:  { relationDelta: 2 },
    },
  },
  {
    id: 'request_help',
    category: 'REQUEST',
    label: 'Can you help me?',
    requireRelation: 2,
    tones: ['neutral', 'direct', 'sympathetic'],
    promptTemplate: 'Ask the NPC for their help with something specific.',
    outcomes: {
      positive: { relationDelta: 4, triggerQuestHook: 'help_offered' },
      neutral:  { relationDelta: 0 },
      negative: { relationDelta: -3 },
    },
  },
  {
    id: 'request_recruit',
    category: 'REQUEST',
    label: 'Travel with me',
    requireRelation: 3,
    requireFlag: 'recruitable',
    tones: ['friendly', 'direct'],
    promptTemplate: 'Ask the NPC to join you on your travels.',
    outcomes: {
      positive: { relationDelta: 5, triggerQuestHook: 'recruit_offer' },
      neutral:  { relationDelta: 0 },
      negative: { relationDelta: -3 },
    },
  },
  {
    id: 'request_alliance',
    category: 'REQUEST',
    label: 'Work together',
    requireRelation: 3,
    tones: ['friendly', 'direct', 'formal'],
    promptTemplate: 'Propose a working arrangement or alliance with the NPC.',
    outcomes: {
      positive: { relationDelta: 6, triggerQuestHook: 'alliance_formed' },
      neutral:  { relationDelta: 1 },
      negative: { relationDelta: -4 },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // PART_WAYS
  // ══════════════════════════════════════════════════════════════
  {
    id: 'partways_farewell',
    category: 'PART_WAYS',
    label: 'Farewell',
    requireRelation: -2,
    tones: ['neutral', 'friendly', 'formal'],
    promptTemplate: 'Say a simple goodbye.',
    outcomes: {
      positive: { relationDelta: 1 },
      neutral:  { relationDelta: 0 },
    },
    endsConversation: true,
  },
  {
    id: 'partways_until_next',
    category: 'PART_WAYS',
    label: 'Until next time',
    requireRelation: 2,
    tones: ['friendly'],
    promptTemplate: 'Say a warm goodbye that implies you expect to meet again.',
    outcomes: {
      positive: { relationDelta: 2 },
      neutral:  { relationDelta: 1 },
    },
    endsConversation: true,
  },
  {
    id: 'partways_dismiss',
    category: 'PART_WAYS',
    label: 'End this',
    requireRelation: -2,
    tones: ['direct', 'neutral'],
    promptTemplate: 'End the conversation bluntly.',
    outcomes: {
      neutral:  { relationDelta: -2 },
      negative: { relationDelta: -5 },
    },
    endsConversation: true,
  },

];
