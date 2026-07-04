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

    { name: 'Bandage',
      skill: 'Healing',
      requires: [{ item: 'Branch', qty: 2 }, { item: 'Rare Herb', qty: 1 }],
      produces: { item: 'Bandage', qty: 2 } },

    // Materials
    { name: 'Leather Wrap',
      skill: 'Sewing',
      requires: [{ item: 'Deer Hide', qty: 1 }],
      produces: { item: 'Leather Wrap', qty: 1 } },

    { name: 'Stick Bundle',
      skill: 'Crafting',
      requires: [{ item: 'Branch', qty: 3 }],
      produces: { item: 'Stick Bundle', qty: 1 } },
  ],

  // ── Cooking (complex multi-ingredient — simple cooking uses the fire wheel) ─
  Cooking: [

    { name: 'Berry Stew',
      skill: 'Cooking',
      requires: [{ item: 'Wild Berries', qty: 3 }, { item: 'Edible Mushrooms', qty: 1 }],
      produces: { item: 'Berry Stew', qty: 1 } },

    { name: 'Mushroom Broth',
      skill: 'Cooking',
      requires: [{ item: 'Edible Mushrooms', qty: 3 }],
      produces: { item: 'Mushroom Broth', qty: 1 } },

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

    { name: 'Hunter\'s Stew',
      skill: 'Cooking',
      requires: [{ item: 'Raw Venison', qty: 1 }, { item: 'Wild Berries', qty: 2 }, { item: 'Edible Mushrooms', qty: 1 }],
      produces: { item: 'Hunter\'s Stew', qty: 1 } },
  ],

  // ── Alchemy ────────────────────────────────────────────────────────────────
  Alchemy: [

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

  ],

};
