// recipes.js — Crafting and cooking recipe definitions.
// Loaded before script.js; all categories are on the global Recipes object.
//
// requires[] fields:
//   item    — inventory item name (case-sensitive)
//   qty     — amount consumed per craft
//   tool    — true means item must be present but is NOT consumed
//
// produces fields:
//   item    — item name added to inventory on success
//   qty     — base quantity produced (tier 5 gives +50% rounded up)
//
// skill    — which player skill is checked via performSkillCheck()

const Recipes = {

  // ── Crafting ───────────────────────────────────────────────────────────────
  Crafting: [

    // Fire & Light
    { name: 'Torch',
      skill: 'Fire-making',
      requires: [{ item: 'Stick Bundle', qty: 1 }, { item: 'Kindling', qty: 1 }],
      produces: { item: 'Torch', qty: 2 } },

    // Ranged
    { name: 'Arrows',
      skill: 'Fletching',
      requires: [{ item: 'Wood Bundle', qty: 1 }, { item: 'Crafting Knife', qty: 1, tool: true }],
      produces: { item: 'Arrow', qty: 5 } },

    { name: 'Bone Arrows',
      skill: 'Fletching',
      requires: [{ item: 'Bones', qty: 3 }, { item: 'Wood Bundle', qty: 1 }, { item: 'Crafting Knife', qty: 1, tool: true }],
      produces: { item: 'Arrow', qty: 8 } },

    { name: 'Simple Bow',
      skill: 'Fletching',
      requires: [{ item: 'Wood Bundle', qty: 2 }, { item: 'Rope', qty: 1 }],
      produces: { item: 'Simple Bow', qty: 1 } },

    // Melee
    { name: 'Wooden Spear',
      skill: 'Crafting',
      requires: [{ item: 'Wood Bundle', qty: 1 }, { item: 'Crafting Knife', qty: 1, tool: true }],
      produces: { item: 'Wooden Spear', qty: 1 } },

    { name: 'Simple Club',
      skill: 'Crafting',
      requires: [{ item: 'Large Wood Bundle', qty: 1 }],
      produces: { item: 'Simple Club', qty: 1 } },

    { name: 'Stone Knife',
      skill: 'Crafting',
      requires: [{ item: 'Stone', qty: 3 }],
      produces: { item: 'Stone Knife', qty: 1 } },

    // Utility
    { name: 'Rope',
      skill: 'Crafting',
      requires: [{ item: 'Branch', qty: 5 }],
      produces: { item: 'Rope', qty: 1 } },

    { name: 'Hunting Trap',
      skill: 'Survival',
      requires: [{ item: 'Stick Bundle', qty: 3 }, { item: 'Stone', qty: 2 }],
      produces: { item: 'Hunting Trap', qty: 1 } },

    { name: 'Stone Campfire Ring',
      skill: 'Crafting',
      requires: [{ item: 'Stone', qty: 8 }],
      produces: { item: 'Campfire Stones', qty: 1 } },

    // Medicine
    { name: 'Herb Poultice',
      skill: 'Herbalism',
      requires: [{ item: 'Rare Herb', qty: 1 }, { item: 'Edible Mushrooms', qty: 1 }],
      produces: { item: 'Herb Poultice', qty: 1 } },

    { name: 'Healing Leaf Poultice',
      skill: 'Herbalism',
      requires: [{ item: 'Healing Leaves', qty: 2 }, { item: 'Yarrow', qty: 1 }],
      produces: { item: 'Herb Poultice', qty: 2 } },

    { name: 'Bandage',
      skill: 'Healing',
      requires: [{ item: 'Branch', qty: 2 }, { item: 'Rare Herb', qty: 1 }],
      produces: { item: 'Bandage', qty: 2 } },

    { name: 'Thornleaf Wrap',
      skill: 'Healing',
      requires: [{ item: 'Thornleaf', qty: 2 }, { item: 'Lungwort', qty: 1 }],
      produces: { item: 'Bandage', qty: 3 } },

    // Materials
    { name: 'Leather Wrap',
      skill: 'Sewing',
      requires: [{ item: 'Deer Hide', qty: 1 }],
      produces: { item: 'Leather Wrap', qty: 1 } },

    { name: 'Stick Bundle',
      skill: 'Crafting',
      requires: [{ item: 'Branch', qty: 3 }],
      produces: { item: 'Stick Bundle', qty: 1 } },

    { name: 'Fire Bundle',
      skill: 'Fire-making',
      requires: [{ item: 'Dry Leaves', qty: 3 }, { item: 'Branch Bundle', qty: 1 }],
      produces: { item: 'Kindling', qty: 2 } },
  ],

  // ── Cooking (complex multi-ingredient — simple cooking uses the fire wheel) ─
  Cooking: [

    // ─ Existing stews & broths ──────────────────────────────────────────────
    { name: 'Berry Stew',
      skill: 'Cooking',
      requires: [{ item: 'Wild Berries', qty: 3 }, { item: 'Edible Mushrooms', qty: 1 }],
      produces: { item: 'Berry Stew', qty: 1 } },

    { name: 'Mushroom Broth',
      skill: 'Cooking',
      requires: [{ item: 'Edible Mushrooms', qty: 3 }],
      produces: { item: 'Mushroom Broth', qty: 1 } },

    { name: 'Hunter\'s Stew',
      skill: 'Cooking',
      requires: [{ item: 'Raw Venison', qty: 1 }, { item: 'Wild Berries', qty: 2 }, { item: 'Edible Mushrooms', qty: 1 }],
      produces: { item: 'Hunter\'s Stew', qty: 1 } },

    // ─ Existing simple meat cooking ─────────────────────────────────────────
    { name: 'Cooked Venison',
      skill: 'Cooking',
      requires: [{ item: 'Raw Venison', qty: 1 }],
      produces: { item: 'Cooked Venison', qty: 1 } },

    { name: 'Cooked Rabbit',
      skill: 'Cooking',
      requires: [{ item: 'Raw Rabbit Meat', qty: 1 }],
      produces: { item: 'Cooked Rabbit Meat', qty: 1 } },

    { name: 'Cooked Boar',
      skill: 'Cooking',
      requires: [{ item: 'Raw Boar Meat', qty: 1 }],
      produces: { item: 'Cooked Boar Meat', qty: 1 } },

    // ─ New simple meat cooking ───────────────────────────────────────────────
    { name: 'Cooked Bear Meat',
      skill: 'Cooking',
      requires: [{ item: 'Raw Bear Meat', qty: 1 }],
      produces: { item: 'Cooked Bear Meat', qty: 1 } },

    { name: 'Cooked Wolf Meat',
      skill: 'Cooking',
      requires: [{ item: 'Raw Wolf Meat', qty: 1 }],
      produces: { item: 'Cooked Wolf Meat', qty: 1 } },

    { name: 'Roasted Chicken',
      skill: 'Cooking',
      requires: [{ item: 'Raw Chicken Leg', qty: 1 }],
      produces: { item: 'Roasted Chicken', qty: 1 } },

    // ─ Fish cooking ──────────────────────────────────────────────────────────
    { name: 'Cooked Fish',
      skill: 'Cooking',
      requires: [{ item: 'Raw Fish', qty: 1 }],
      produces: { item: 'Cooked Fish', qty: 1 } },

    { name: 'Cooked Trout',
      skill: 'Cooking',
      requires: [{ item: 'Raw Trout', qty: 1 }],
      produces: { item: 'Cooked Trout', qty: 1 } },

    { name: 'Cooked Perch',
      skill: 'Cooking',
      requires: [{ item: 'Raw Perch', qty: 1 }],
      produces: { item: 'Cooked Perch', qty: 1 } },

    { name: 'Cooked Carp',
      skill: 'Cooking',
      requires: [{ item: 'Raw Carp', qty: 1 }],
      produces: { item: 'Cooked Carp', qty: 1 } },

    { name: 'Cooked Pike',
      skill: 'Cooking',
      requires: [{ item: 'Raw Pike', qty: 1 }],
      produces: { item: 'Cooked Pike', qty: 1 } },

    { name: 'Cooked Bass',
      skill: 'Cooking',
      requires: [{ item: 'Raw Bass', qty: 1 }],
      produces: { item: 'Cooked Bass', qty: 1 } },

    { name: 'Cooked Catfish',
      skill: 'Cooking',
      requires: [{ item: 'Raw Catfish', qty: 1 }],
      produces: { item: 'Cooked Catfish', qty: 1 } },

    { name: 'Cooked Mackerel',
      skill: 'Cooking',
      requires: [{ item: 'Raw Mackerel', qty: 1 }],
      produces: { item: 'Cooked Mackerel', qty: 1 } },

    { name: 'Cooked Herring',
      skill: 'Cooking',
      requires: [{ item: 'Raw Herring', qty: 1 }],
      produces: { item: 'Cooked Herring', qty: 1 } },

    { name: 'Cooked Eel',
      skill: 'Cooking',
      requires: [{ item: 'Raw Eel', qty: 1 }],
      produces: { item: 'Cooked Eel', qty: 1 } },

    { name: 'Cooked Tuna',
      skill: 'Cooking',
      requires: [{ item: 'Raw Tuna', qty: 1 }],
      produces: { item: 'Cooked Tuna', qty: 1 } },

    { name: 'Cooked Salmon',
      skill: 'Cooking',
      requires: [{ item: 'Salmon', qty: 1 }],
      produces: { item: 'Cooked Salmon', qty: 1 } },

    // ─ Processed fish ────────────────────────────────────────────────────────
    { name: 'Smoked Fish',
      skill: 'Cooking',
      requires: [{ item: 'Fresh Fish', qty: 1 }, { item: 'Dry Leaves', qty: 1 }],
      produces: { item: 'Smoked Fish', qty: 1 } },

    { name: 'Dried Fish',
      skill: 'Cooking',
      requires: [{ item: 'Raw Fish', qty: 2 }],
      produces: { item: 'Dried Fish', qty: 1 } },

    { name: 'Fried Red Fish',
      skill: 'Cooking',
      requires: [{ item: 'Red Fish', qty: 1 }, { item: 'Plant Oil', qty: 1 }],
      produces: { item: 'Fried Red Fish', qty: 1 } },

    { name: 'Lemon Fish',
      skill: 'Cooking',
      requires: [{ item: 'Raw Fish', qty: 1 }, { item: 'Lemon', qty: 1 }],
      produces: { item: 'Cooked Fish', qty: 1 } },

    // ─ Vegetable cooking ─────────────────────────────────────────────────────
    { name: 'Roasted Carrot',
      skill: 'Cooking',
      requires: [{ item: 'Carrot', qty: 2 }],
      produces: { item: 'Roasted Carrot', qty: 1 } },

    { name: 'Glazed Cherries',
      skill: 'Cooking',
      requires: [{ item: 'Cherries', qty: 2 }],
      produces: { item: 'Glazed Cherries', qty: 1 } },

    { name: 'Chanterelle Sauté',
      skill: 'Cooking',
      requires: [{ item: 'Chanterelle', qty: 2 }],
      produces: { item: 'Cooked Mushrooms', qty: 1 } },

    // ─ Complex multi-ingredient dishes ───────────────────────────────────────
    { name: 'Herb Venison Roast',
      skill: 'Cooking',
      requires: [{ item: 'Raw Venison', qty: 1 }, { item: 'Sage', qty: 1 }, { item: 'Garlic', qty: 1 }],
      produces: { item: 'Herb Venison Roast', qty: 1 } },

    { name: 'Spiced Boar Roast',
      skill: 'Cooking',
      requires: [{ item: 'Raw Boar Meat', qty: 1 }, { item: 'Black Pepper', qty: 1 }, { item: 'Garlic', qty: 1 }],
      produces: { item: 'Spiced Boar Roast', qty: 1 } },

    { name: 'Fish Soup',
      skill: 'Cooking',
      requires: [{ item: 'Raw Fish', qty: 1 }, { item: 'Onion', qty: 1 }, { item: 'Edible Mushrooms', qty: 1 }],
      produces: { item: 'Fish Soup', qty: 1 } },

    { name: 'Bone Broth',
      skill: 'Cooking',
      requires: [{ item: 'Bones', qty: 2 }, { item: 'Carrot', qty: 1 }, { item: 'Onion', qty: 1 }],
      produces: { item: 'Bone Broth', qty: 1 } },

    { name: 'Venison & Mushroom Stew',
      skill: 'Cooking',
      requires: [{ item: 'Raw Venison', qty: 1 }, { item: 'Edible Mushrooms', qty: 2 }, { item: 'Onion', qty: 1 }],
      produces: { item: 'Venison & Mushroom Stew', qty: 1 } },

    { name: 'Mushroom Medley',
      skill: 'Cooking',
      requires: [{ item: 'Chanterelle', qty: 1 }, { item: 'Edible Mushrooms', qty: 2 }, { item: 'Sage', qty: 1 }],
      produces: { item: 'Mushroom Medley', qty: 1 } },

    { name: 'Herbed Mushroom Broth',
      skill: 'Cooking',
      requires: [{ item: 'Edible Mushrooms', qty: 2 }, { item: 'Sage', qty: 1 }, { item: 'Garlic', qty: 1 }],
      produces: { item: 'Herbed Mushroom Broth', qty: 1 } },

    { name: 'Wilderness Salad',
      skill: 'Cooking',
      requires: [{ item: 'Wild Berries', qty: 2 }, { item: 'Nuts', qty: 1 }, { item: 'Lemon', qty: 1 }],
      produces: { item: 'Wilderness Salad', qty: 1 } },

    { name: 'Vegetable Soup',
      skill: 'Cooking',
      requires: [{ item: 'Carrot', qty: 2 }, { item: 'Turnip', qty: 1 }, { item: 'Onion', qty: 1 }],
      produces: { item: 'Vegetable Soup', qty: 1 } },

    { name: 'Traveller\'s Ration',
      skill: 'Cooking',
      requires: [{ item: 'Nuts', qty: 2 }, { item: 'Dried Fish', qty: 1 }, { item: 'Wild Berries', qty: 1 }],
      produces: { item: 'Rations', qty: 2 } },
  ],

  // ── Alchemy ────────────────────────────────────────────────────────────────
  Alchemy: [

    // ─ Existing recipes ──────────────────────────────────────────────────────
    { name: 'Health Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Healing Herb', qty: 2 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Health Potion', qty: 1 } },

    { name: 'Greater Health Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Healing Herb', qty: 3 }, { item: 'Rare Herb', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Greater Health Potion', qty: 1 } },

    { name: 'Mana Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Moonbloom', qty: 2 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Mana Potion', qty: 1 } },

    { name: 'Greater Mana Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Moonbloom', qty: 3 }, { item: 'Rare Herb', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Greater Mana Potion', qty: 1 } },

    { name: 'Stamina Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Ginseng Root', qty: 2 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Stamina Potion', qty: 1 } },

    { name: 'Antidote',
      skill: 'Alchemy',
      requires: [{ item: 'Milkweed', qty: 3 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Antidote', qty: 1 } },

    { name: 'Warmth Elixir',
      skill: 'Alchemy',
      requires: [{ item: 'Ember Root', qty: 2 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Warmth Elixir', qty: 1 } },

    { name: 'Fortifying Tonic',
      skill: 'Alchemy',
      requires: [{ item: 'Ironbark Resin', qty: 1 }, { item: 'Healing Herb', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Fortifying Tonic', qty: 1 } },

    { name: 'Focused Draught',
      skill: 'Alchemy',
      requires: [{ item: 'Eyebright', qty: 2 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Focused Draught', qty: 1 } },

    { name: 'Rejuvenation Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Goldenmoss', qty: 2 }, { item: 'Rare Herb', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Rejuvenation Potion', qty: 1 } },

    // ─ Missing recipes for existing potions ──────────────────────────────────
    { name: 'Greater Stamina Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Ginseng Root', qty: 3 }, { item: 'Deep Roots Leaf', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Greater Stamina Potion', qty: 1 } },

    { name: 'Mana Draught',
      skill: 'Alchemy',
      requires: [{ item: 'Mana Leaves', qty: 2 }, { item: 'Mana Mushroom', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Mana Draught', qty: 1 } },

    { name: 'Rejuvenation Vial',
      skill: 'Alchemy',
      requires: [{ item: 'Goldenmoss', qty: 1 }, { item: 'Healing Herb', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Rejuvenation Vial', qty: 1 } },

    { name: 'Greater Rejuvenation Flask',
      skill: 'Alchemy',
      requires: [{ item: 'Goldenmoss', qty: 3 }, { item: 'Healing Herb', qty: 2 }, { item: 'Moonbloom', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Greater Rejuvenation Flask', qty: 1 } },

    { name: 'Warmth Vial',
      skill: 'Alchemy',
      requires: [{ item: 'Ember Root', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Warmth Vial', qty: 1 } },

    { name: 'Greater Warmth Elixir',
      skill: 'Alchemy',
      requires: [{ item: 'Ember Root', qty: 3 }, { item: 'Firebloom', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Greater Warmth Elixir', qty: 1 } },

    { name: 'Poison',
      skill: 'Alchemy',
      requires: [{ item: 'Poison Mushroom', qty: 2 }, { item: 'Poisonous Herb', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Poison', qty: 1 } },

    { name: 'Large Poison Vial',
      skill: 'Alchemy',
      requires: [{ item: 'Death Cap', qty: 1 }, { item: 'Shadowpetal', qty: 1 }, { item: 'Wormwood', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Large Poison Vial', qty: 1 } },

    // ─ New potions from unused ingredients ───────────────────────────────────
    { name: 'Healing Salve',
      skill: 'Alchemy',
      requires: [{ item: 'Healing Leaves', qty: 2 }, { item: 'Yarrow', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Healing Salve', qty: 1 } },

    { name: 'Wound Seal',
      skill: 'Alchemy',
      requires: [{ item: 'Elderberry', qty: 2 }, { item: 'Lungwort', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Wound Seal', qty: 1 } },

    { name: 'Greater Antidote',
      skill: 'Alchemy',
      requires: [{ item: 'Wild Violet', qty: 2 }, { item: 'Milkweed', qty: 2 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Greater Antidote', qty: 1 } },

    { name: 'Sleep Draught',
      skill: 'Alchemy',
      requires: [{ item: 'Valerian Root', qty: 2 }, { item: 'Chamomile', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Sleep Draught', qty: 1 } },

    { name: 'Calm Tonic',
      skill: 'Alchemy',
      requires: [{ item: 'Chamomile', qty: 2 }, { item: 'Wild Violet', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Calm Tonic', qty: 1 } },

    { name: 'Energizing Brew',
      skill: 'Alchemy',
      requires: [{ item: 'Energizing Bloom', qty: 2 }, { item: 'Ginseng Root', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Energizing Brew', qty: 1 } },

    { name: 'Fire Resistance Tonic',
      skill: 'Alchemy',
      requires: [{ item: 'Dragonherb', qty: 2 }, { item: 'Ember Root', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Fire Resistance Tonic', qty: 1 } },

    { name: 'Shadow Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Shadowpetal', qty: 2 }, { item: 'Shadow Mushroom', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Shadow Potion', qty: 1 } },

    { name: 'Vision Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Shimmerleaf', qty: 1 }, { item: 'Monster Eye', qty: 1 }, { item: 'Eyebright', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Vision Potion', qty: 1 } },

    { name: 'Mana Tea',
      skill: 'Alchemy',
      requires: [{ item: 'Mana Leaves', qty: 2 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Mana Tea', qty: 1 } },

    { name: 'Arcane Surge',
      skill: 'Alchemy',
      requires: [{ item: 'Mana Mushroom', qty: 2 }, { item: 'Spiritbloom', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Arcane Surge', qty: 1 } },

    { name: 'Sorcerer\'s Elixir',
      skill: 'Alchemy',
      requires: [{ item: 'King\'s Blossom', qty: 1 }, { item: 'Moonbloom', qty: 2 }, { item: 'Magic Dust', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Sorcerer\'s Elixir', qty: 1 } },

    { name: 'Strong Poison',
      skill: 'Alchemy',
      requires: [{ item: 'Demon Mushroom', qty: 1 }, { item: 'Death Cap', qty: 1 }, { item: 'Wormwood', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Strong Poison', qty: 1 } },

    { name: 'Hallucinogenic Brew',
      skill: 'Alchemy',
      requires: [{ item: 'Fly Agaric', qty: 1 }, { item: 'Duskbloom Petal', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Hallucinogenic Brew', qty: 1 } },

    { name: 'Smoke Bomb',
      skill: 'Alchemy',
      requires: [{ item: 'Dustbloom', qty: 2 }, { item: 'Giant Stinkhorn', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Smoke Bomb', qty: 1 } },

    { name: 'Stealth Tonic',
      skill: 'Alchemy',
      requires: [{ item: 'Veilwort', qty: 1 }, { item: 'Shadowpetal', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Stealth Tonic', qty: 1 } },

    { name: 'Thornspire Extract',
      skill: 'Alchemy',
      requires: [{ item: 'Thornspire', qty: 2 }, { item: 'Ash Powder', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Thornspire Extract', qty: 1 } },

    { name: 'Arcane Sight Potion',
      skill: 'Alchemy',
      requires: [{ item: 'Shimmerleaf', qty: 2 }, { item: 'Gloomcap', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Arcane Sight Potion', qty: 1 } },

    { name: 'Mana Regulation Draught',
      skill: 'Alchemy',
      requires: [{ item: 'Gloomcap', qty: 2 }, { item: 'Indigo Milk Cap', qty: 1 }, { item: 'Empty Vial', qty: 1 }],
      produces: { item: 'Mana Regulation Draught', qty: 1 } },
  ],

  // ── Smelting (ore → ingot, requires Coal as fuel) ─────────────────────────
  Smelting: [

    { name: 'Smelt Copper',
      skill: 'Crafting',
      requires: [{ item: 'Copper Ore', qty: 3 }, { item: 'Coal', qty: 1 }],
      produces: { item: 'Copper Ingot', qty: 1 } },

    { name: 'Smelt Iron',
      skill: 'Crafting',
      requires: [{ item: 'Iron Ore', qty: 3 }, { item: 'Coal', qty: 1 }],
      produces: { item: 'Iron Ingot', qty: 1 } },

    { name: 'Smelt Iron (Fragments)',
      skill: 'Crafting',
      requires: [{ item: 'Iron Ore Fragments', qty: 6 }, { item: 'Coal', qty: 1 }],
      produces: { item: 'Iron Ingot', qty: 1 } },

    { name: 'Smelt Clear Iron',
      skill: 'Smithing',
      requires: [{ item: 'Clear Iron Ore', qty: 2 }, { item: 'Coal', qty: 1 }],
      produces: { item: 'Iron Ingot', qty: 1 } },

    { name: 'Smelt Black Iron',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ore', qty: 2 }, { item: 'Coal', qty: 3 }],
      produces: { item: 'Black Iron Ingot', qty: 1 } },

    { name: 'Smelt Silver',
      skill: 'Crafting',
      requires: [{ item: 'Silver Ore', qty: 3 }, { item: 'Coal', qty: 1 }],
      produces: { item: 'Silver Ingot', qty: 1 } },

    { name: 'Smelt Gold',
      skill: 'Crafting',
      requires: [{ item: 'Gold Ore', qty: 3 }, { item: 'Coal', qty: 1 }],
      produces: { item: 'Gold Ingot', qty: 1 } },

    { name: 'Smelt Gold (Chunk)',
      skill: 'Crafting',
      requires: [{ item: 'Gold Ore Chunk', qty: 1 }, { item: 'Coal', qty: 1 }],
      produces: { item: 'Gold Ingot', qty: 2 } },
  ],

  // ── Smithing (ingot + materials → weapons, armor, tools) ──────────────────
  Smithing: [

    // ─ Knives & Daggers ──────────────────────────────────────────────────────
    { name: 'Forge Hunting Knife',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Hunting Knife', qty: 1 } },

    { name: 'Forge Dagger',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Dagger', qty: 1 } },

    { name: 'Forge Fine Dagger',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 1 }, { item: 'Silver Ingot', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Fine Dagger', qty: 1 } },

    // ─ Swords ────────────────────────────────────────────────────────────────
    { name: 'Forge Iron Sword',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 3 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Iron Sword', qty: 1 } },

    { name: 'Forge Long Sword',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 4 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Long Sword', qty: 1 } },

    // ─ Axes ──────────────────────────────────────────────────────────────────
    { name: 'Forge Battle Axe',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 2 }, { item: 'Wood Bundle', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Battle Axe', qty: 1 } },

    { name: 'Forge Great Axe',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 3 }, { item: 'Wood Bundle', qty: 2 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Great Axe', qty: 1 } },

    // ─ Blunt Weapons ─────────────────────────────────────────────────────────
    { name: 'Forge Mace',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 2 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Mace', qty: 1 } },

    { name: 'Forge Iron Mace',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 2 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Iron Mace', qty: 1 } },

    { name: 'Forge War Hammer',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 3 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'War Hammer', qty: 1 } },

    { name: 'Forge Flail',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 2 }, { item: 'Iron Chain', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Flail', qty: 1 } },

    // ─ Polearms ──────────────────────────────────────────────────────────────
    { name: 'Forge Iron Spear',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 1 }, { item: 'Wood Bundle', qty: 2 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Iron Spear', qty: 1 } },

    { name: 'Forge Halberd',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 2 }, { item: 'Wood Bundle', qty: 2 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Halberd', qty: 1 } },

    // ─ Ranged & Ammo ─────────────────────────────────────────────────────────
    { name: 'Forge Iron Arrows',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 1 }, { item: 'Wood Bundle', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Arrow', qty: 10 } },

    { name: 'Forge Bolts',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 1 }, { item: 'Wood Bundle', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Bolts', qty: 10 } },

    { name: 'Forge Crossbow',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 2 }, { item: 'Wood Bundle', qty: 2 }, { item: 'Rope', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Crossbow', qty: 1 } },

    // ─ Shields ───────────────────────────────────────────────────────────────
    { name: 'Forge Round Shield',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 1 }, { item: 'Wood Bundle', qty: 2 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Round Shield', qty: 1 } },

    { name: 'Forge Heater Shield',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 2 }, { item: 'Wood Bundle', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Heater Shield', qty: 1 } },

    { name: 'Forge Iron Kite Shield',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 3 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Iron Kite Shield', qty: 1 } },

    // ─ Armor ─────────────────────────────────────────────────────────────────
    // Pouches
    { name: 'Herb Pouch (Large)',
      skill: 'Sewing',
      requires: [{ item: 'Deer Hide', qty: 2 }, { item: 'Crafting Knife', qty: 1, tool: true }],
      produces: { item: 'Herb Pouch (Large)', qty: 1 } },

    { name: 'Ingredient Pouch (Large)',
      skill: 'Sewing',
      requires: [{ item: 'Boar Hide', qty: 2 }, { item: 'Crafting Knife', qty: 1, tool: true }],
      produces: { item: 'Ingredient Pouch (Large)', qty: 1 } },

    { name: 'Craft Leather Armor',
      skill: 'Sewing',
      requires: [{ item: 'Leather', qty: 3 }],
      produces: { item: 'Leather Armor', qty: 1 } },

    { name: 'Craft Leather Helmet',
      skill: 'Sewing',
      requires: [{ item: 'Leather', qty: 1 }],
      produces: { item: 'Leather Helmet', qty: 1 } },

    { name: 'Craft Leather Bracers',
      skill: 'Sewing',
      requires: [{ item: 'Leather', qty: 1 }],
      produces: { item: 'Leather Bracers', qty: 1 } },

    { name: 'Craft Gambeson',
      skill: 'Sewing',
      requires: [{ item: 'Cloth Roll', qty: 2 }, { item: 'Leather', qty: 1 }],
      produces: { item: 'Gambeson', qty: 1 } },

    { name: 'Craft Chainmail Shirt',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 4 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Chainmail Shirt', qty: 1 } },

    // ─ Tools ─────────────────────────────────────────────────────────────────
    { name: 'Forge Crafting Knife',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Crafting Knife', qty: 1 } },

    { name: 'Forge Hammer',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 1 }, { item: 'Wood Bundle', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Hammer', qty: 1 } },

    { name: 'Forge Iron Chain',
      skill: 'Smithing',
      requires: [{ item: 'Iron Ingot', qty: 2 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Iron Chain', qty: 1 } },

    // ─ Black Iron (high-tier) ────────────────────────────────────────────────
    { name: 'Forge Black Iron Sword',
      skill: 'Smithing',
      requires: [{ item: 'Black Iron Ingot', qty: 3 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Iron Sword', qty: 1 } },

    { name: 'Forge Black Iron Shield',
      skill: 'Smithing',
      requires: [{ item: 'Black Iron Ingot', qty: 3 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Black Iron Shield', qty: 1 } },

    // ─ Copper (entry-tier) ───────────────────────────────────────────────────
    { name: 'Forge Copper Knife',
      skill: 'Smithing',
      requires: [{ item: 'Copper Ingot', qty: 1 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Hunting Knife', qty: 1 } },

    { name: 'Forge Copper Mace',
      skill: 'Smithing',
      requires: [{ item: 'Copper Ingot', qty: 2 }, { item: 'Hammer', qty: 1, tool: true }],
      produces: { item: 'Mace', qty: 1 } },
  ],

};
