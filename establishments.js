// establishments.js — Business establishments for every settlement on Estranta
// Keyed by settlement name. Each entry has type (city/village/capital),
// kingdom, and an array of establishments.
//
// Establishment types mirror professions and skills:
//   Blacksmith, Armorer, Fletcher, Bowyer, Alchemist, Herbalist, Apothecary,
//   Tavern, Inn, Bakery, Butcher, Brewer, Distillery, Meadery,
//   General Store, Market, Merchant, Trader,
//   Carpenter, Mason, Tanner, Tailor, Cobbler, Weaver, Saddler, Chandler, Cooper,
//   Miner (assay/exchange), Fisher, Farm Supply, Shipyard, Stable,
//   Silversmith, Gem Cutter, Jeweler, Glassblower, Potter, Papermaker,
//   Barber, Sculptor, Painter's Studio, Theatre, Mask Maker, Antiquarian,
//   Temple, Shrine, Chapel, Druid Grove,
//   Library, Scribe, Mage Tower, Observatory, Academy, Rune Crafter,
//   Guard Post, Barracks, Bounty Board, Prison,
//   Thieves Den, Assassins Contact,
//   Ranger Post, Adventurers Guild,
//   Guild Hall (per trade), Masters Guild (continent-wide per profession)
//
// Masters Guilds are listed separately at the bottom and located in capital cities.

// ─────────────────────────────────────────────
//  HELPER — establishment entry shape
// ─────────────────────────────────────────────
// {
//   name:        string   — unique business name
//   type:        string   — profession category
//   description: string   — flavour text
//   owner?:      string   — NPC name
//   buys?:       string[] — item categories purchased
//   sells?:      string[] — item categories sold
//   services?:   string[] — non-item services offered
// }

const establishments = {

  // ══════════════════════════════════════════
  //  ARDRENHOLD  (Human — Western coast)
  // ══════════════════════════════════════════

  'Ardrenkeep': {
    type: 'CapitalCity', kingdom: 'Ardrenhold',
    establishments: [
      { name: "The Knight's Rest", type: 'Inn', owner: 'Aldric Hewn',
        description: 'A historic inn frequented by knights and adventurers. Rooms are named after legendary heroes.',
        sells: ['meals', 'ale', 'lodging'], services: ['rumour board', 'courier'] },
      { name: 'The Gilded Flagon', type: 'Tavern', owner: 'Marta Brindle',
        description: 'Loud and lively, packed every evening with soldiers and merchants.',
        sells: ['ale', 'wine', 'meals'] },
      { name: "Ironhide Armory", type: 'Blacksmith', owner: 'Torvald Ironhide',
        description: 'The finest smithy in the west, supplying arms and armour to the royal guard.',
        buys: ['weapons', 'armor', 'metal'], sells: ['weapons', 'armor', 'tools'], services: ['repair', 'commission'] },
      { name: "Hewell's Blades", type: 'Armorer', owner: 'Seren Hewell',
        description: 'Specialises in light armour and finely balanced swords.',
        buys: ['armor'], sells: ['armor', 'weapons'], services: ['fitting', 'repair'] },
      { name: "The Quiver & Crown", type: 'Fletcher', owner: 'Edwyn Quill',
        description: 'Royal warrant fletcher — arrows, bows, and crossbow bolts.',
        buys: ['wood', 'feathers'], sells: ['arrows', 'bows', 'fletching supplies'] },
      { name: "Aldara's Remedies", type: 'Apothecary', owner: 'Aldara Moss',
        description: 'Potions and herbal cures from across the continent.',
        buys: ['herbs', 'ingredients'], sells: ['potions', 'herbs', 'antidotes'] },
      { name: 'The Arcane Registry', type: 'Mage Tower', owner: 'Magister Falwen',
        description: 'A slender tower where licensed mages register spells and sell minor enchantments.',
        sells: ['scrolls', 'mana potions'], services: ['enchanting', 'identify'] },
      { name: 'The Royal Scriptorium', type: 'Library', owner: 'Archivist Dunmore',
        description: 'Royal archive open to scholars. Maps and kingdom records stored here.',
        sells: ['maps', 'books'], services: ['research', 'translation'] },
      { name: "Stonecroft Carpenter", type: 'Carpenter', owner: 'Brynn Stonecroft',
        description: 'Furniture, wagon repairs, and structural timber work.',
        buys: ['wood'], sells: ['furniture', 'tools'], services: ['repairs', 'construction'] },
      { name: 'The Tannery District', type: 'Tanner', owner: 'Oswin Girth',
        description: 'Processes hides from the royal hunts into leather goods.',
        buys: ['hides', 'animal parts'], sells: ['leather', 'leather armor'] },
      { name: "Merchant's Row", type: 'Market', owner: 'Various',
        description: 'An open-air market running daily except holy days.',
        buys: ['anything'], sells: ['general goods', 'food', 'clothing'] },
      { name: 'The Cathedral of the Flame', type: 'Temple', owner: 'High Priest Aldron',
        description: 'Grand stone cathedral — spiritual heart of Ardrenhold.',
        services: ['healing', 'blessing', 'burial rites'] },
      { name: 'The Royal Falconry', type: 'Specialty', owner: 'Falconer Wren',
        description: 'Trains falcons for hunting and long-distance messaging.',
        sells: ['trained birds'], services: ['messaging', 'hunting leases'] },
      { name: 'The Watch House', type: 'Barracks', owner: 'Captain Halverd',
        description: 'City guard headquarters. Bounty board posted outside.',
        services: ['bounty board', 'guard hire', 'reporting crimes'] },
      { name: "Silkthread Tailors", type: 'Tailor', owner: 'Elspeth Needham',
        description: 'Fine garments and practical travelling clothes.',
        buys: ['cloth', 'leather'], sells: ['clothing', 'cloaks', 'bags'] },
      { name: "Cobblemaster Wynn", type: 'Cobbler', owner: 'Davan Wynn',
        description: 'Boots and footwear for every occasion.',
        buys: ['leather'], sells: ['boots', 'shoes', 'sandals'] },
      { name: "The Brewer's Cellar", type: 'Brewer', owner: 'Holt Barleigh',
        description: 'Produces the famous Ardrenhold amber ale sold across the west.',
        buys: ['grain', 'herbs'], sells: ['ale', 'beer', 'malt'] },
      { name: "Goldscale Exchange", type: 'Merchant', owner: 'Torwin Geld',
        description: 'Currency exchange and bulk commodity trading.',
        services: ['currency exchange', 'loans', 'bulk trade'] },
      { name: "The King's Stable", type: 'Stable', owner: 'Stablemaster Bram Coldwell',
        description: 'Royal stables housing warhorses and courier mounts. Horse hire and boarding available.',
        sells: ['horse hire'], services: ['boarding', 'farrier', 'horse trade'] },
      { name: "Wynn the Barber", type: 'Barber', owner: 'Wynn Cutter',
        description: 'Haircuts, shaves, tooth-pulling, and minor wound dressings. The barber knows every rumour in the city.',
        services: ['haircut', 'shave', 'tooth extraction', 'wound dressing'] },
      { name: "The Adventurers' Posting House", type: 'Adventurers Guild', owner: 'Guildmaster Orryn Thatch',
        description: 'A chapter of the continental Adventurers\' Fellowship. Job boards, equipment loans, and a common room for those between contracts.',
        services: ['contract board', 'equipment loans', 'fellowship membership'] },
      { name: "The City Gaol", type: 'Prison', owner: 'Jailer Dunstable Crowe',
        description: 'Stone cells beneath the watch house. Fines, bail, and complaints handled at the guard desk above.',
        services: ['bail processing', 'prisoner visit'] },
      { name: "Arren the Chandler", type: 'Chandler', owner: 'Arren Wick',
        description: 'Candles, lamp oil, and tallow goods of every grade. Supplies the castle and most of the city\'s temples.',
        sells: ['candles', 'lamp oil', 'tallow goods'] },
      { name: "The Ranger Post", type: 'Ranger Post', owner: 'Ranger Captain Edwynn',
        description: 'Continental ranger outpost. Scouts and trackers accept contracts, report threats, and share intelligence on the surrounding region.',
        services: ['scouting contracts', 'threat reports', 'tracking hire'] },
    ]
  },

  'Ealdenford': {
    type: 'City', kingdom: 'Ardrenhold',
    establishments: [
      { name: 'The Ford & Firkin', type: 'Tavern', owner: 'Nan Lightfoot',
        description: 'A tavern built over the old river crossing, famous for river fish.',
        sells: ['ale', 'meals'] },
      { name: "Crossriver Inn", type: 'Inn', owner: 'Pell Ashen',
        description: 'Comfortable rooms for travellers using the ford road.',
        sells: ['lodging', 'meals'] },
      { name: "Orvyn's Forge", type: 'Blacksmith', owner: 'Orvyn Spark',
        description: 'Farm tools, horseshoes, and basic weapons.',
        buys: ['metal'], sells: ['tools', 'weapons'], services: ['repair'] },
      { name: 'Weld Apothecary', type: 'Apothecary', owner: 'Gwenna Weld',
        description: 'Local herb cures and wound dressings.',
        sells: ['potions', 'herbs'] },
      { name: 'The Golden Arrow Hall', type: 'Guild Hall',
        description: 'Home of the regional archery guild — hosts the annual competition.',
        services: ['archery training', 'competition registration'] },
      { name: "Millstone Bakery", type: 'Bakery', owner: 'Hilda Crum',
        description: 'Fresh bread and pies, a staple of the ford district.',
        sells: ['food', 'bread'] },
      { name: "Redfern General Store", type: 'General Store', owner: 'Calder Redfern',
        description: 'Everyday supplies for villagers and travellers.',
        buys: ['general goods'], sells: ['food', 'tools', 'rope', 'torches'] },
      { name: 'Chapel of the Old Oak', type: 'Chapel', owner: 'Brother Tomlin',
        description: 'Small riverside chapel tended by a lone priest.',
        services: ['blessing', 'healing'] },
      { name: "Trapper's Post", type: 'Trader', owner: 'Dunna Fell',
        description: 'Buys pelts and game from local hunters.',
        buys: ['pelts', 'animal parts'], sells: ['hunting supplies'] },
      { name: "The Ford Stable", type: 'Stable', owner: 'Stablemaster Colwyn Roan',
        description: 'Busy stabling on the ford road — travellers stop here to rest horses before or after the river crossing.',
        sells: ['horse hire'], services: ['boarding', 'farrier'] },
      { name: "Ald the Barber", type: 'Barber', owner: 'Ald Shorn',
        description: 'Quick cuts and close shaves at reasonable prices. Ald knows who owes whom and will share if you ask.',
        services: ['haircut', 'shave', 'wound dressing'] },
      { name: "Barleyside Cooper", type: 'Cooper', owner: 'Cass Hoopwright',
        description: 'Makes barrels and casks for the local brewery and river traders. Also does tubs and buckets.',
        sells: ['barrels', 'casks', 'tubs', 'buckets'] },
    ]
  },

  'Wulfhelm': {
    type: 'City', kingdom: 'Ardrenhold',
    establishments: [
      { name: "The Wolf's Den", type: 'Tavern', owner: 'Brant Gregor',
        description: 'Rough-edged tavern popular with soldiers and mercenaries.',
        sells: ['ale', 'meals'] },
      { name: "Ironwall Arms", type: 'Blacksmith', owner: 'Sigrun Vael',
        description: 'Military-grade weapons and heavy armour.',
        buys: ['metal', 'weapons', 'armor'], sells: ['weapons', 'armor'], services: ['repair', 'commission'] },
      { name: "Wulfhelm Barracks", type: 'Barracks', owner: 'Commander Drest',
        description: 'Garrison for the western defence forces. Bounty board maintained.',
        services: ['bounty board', 'mercenary contracts'] },
      { name: "The Waystone Inn", type: 'Inn', owner: 'Brisa Cord',
        description: 'Solid and no-frills lodging for soldiers and couriers.',
        sells: ['lodging', 'meals'] },
      { name: "Hewn & Haft Carpenter", type: 'Carpenter', owner: 'Aldus Hewn',
        description: 'Siege equipment repairs and structural carpentry.',
        sells: ['tools', 'timber'], services: ['construction', 'repairs'] },
      { name: "Grimhide Tanner", type: 'Tanner', owner: 'Rowan Grimhide',
        description: 'Military leather goods and shield covers.',
        buys: ['hides'], sells: ['leather', 'leather armor'] },
      { name: 'The Shrine of the Wulf', type: 'Shrine', owner: 'Shrine Keeper Maud',
        description: 'A small stone shrine to the patron spirit of the city.',
        services: ['blessing', 'offering'] },
      { name: "Wulfhelm Garrison Stable", type: 'Stable', owner: 'Stablemaster Brek Spur',
        description: 'Military stabling attached to the barracks. Also boards travellers\' horses during the night.',
        sells: ['horse hire'], services: ['boarding', 'farrier', 'tack repair'] },
      { name: "The Garrison Gaol", type: 'Prison', owner: 'Jailer Rodric Wall',
        description: 'Cells beneath the barracks. Holds deserters, criminals, and occasionally prisoners of war.',
        services: ['bail processing', 'prisoner visit'] },
      { name: "Slade the Barber", type: 'Barber', owner: 'Slade Clip',
        description: 'Soldiers shave here before inspection. Slade also sets broken bones for those reluctant to see a healer.',
        services: ['haircut', 'shave', 'wound dressing', 'tooth extraction'] },
    ]
  },

  'Aethelstow': {
    type: 'City', kingdom: 'Ardrenhold',
    establishments: [
      { name: "The Noble Hart Inn", type: 'Inn', owner: 'Lady Corva',
        description: 'An upscale inn catering to nobles and wealthy merchants.',
        sells: ['lodging', 'fine meals', 'wine'] },
      { name: "Aethel's Fine Clothiers", type: 'Tailor', owner: 'Mira Aethel',
        description: 'Court fashion and ceremonial dress.',
        sells: ['clothing', 'cloaks', 'formal wear'] },
      { name: "The Gilt Scribe", type: 'Scribe', owner: 'Osmund Penn',
        description: 'Legal documents, letters of introduction, and map copies.',
        sells: ['books', 'maps', 'scrolls'], services: ['translation', 'legal documents'] },
      { name: "Aethelstow Market Hall", type: 'Market', owner: 'Market Master Fenn',
        description: 'Covered weekly market with vendors from across the kingdom.',
        sells: ['general goods', 'food', 'cloth'] },
      { name: "Wellspring Apothecary", type: 'Apothecary', owner: 'Seraphina Herb',
        description: 'Refined potions and noble wellness remedies.',
        sells: ['potions', 'herbs'] },
      { name: "Cobbled Lane Shoewright", type: 'Cobbler', owner: 'Finn Cobble',
        description: 'Fine shoes and riding boots.',
        sells: ['boots', 'shoes'] },
      { name: 'Temple of the Ancestors', type: 'Temple', owner: 'Priest Aldwen',
        description: 'A temple honouring the noble lineages of Ardrenhold.',
        services: ['genealogy records', 'blessing', 'burial rites'] },
      { name: "Aethelstow Silverworks", type: 'Silversmith', owner: 'Marta Brightmetal',
        description: 'Silversmithing for the noble quarter — ceremonial pieces, monogrammed tableware, and family crests in silver.',
        sells: ['silver jewellery', 'silverware', 'crested items'], services: ['commission', 'engraving'] },
      { name: "Renwick's Curiosities", type: 'Antiquarian', owner: 'Renwick Dustwell',
        description: 'Dealer in old maps, rare coins, heraldic artefacts, and historical pieces. Popular with the local nobility.',
        buys: ['relics', 'old coins', 'heraldic items'], sells: ['artefacts', 'curios', 'old maps'],
        services: ['appraisal'] },
      { name: "The Noble Barber", type: 'Barber', owner: 'Pip Suave',
        description: 'Fashionable grooming for Aethelstow\'s upper class. Pip cultivates an air of discretion.',
        services: ['haircut', 'shave', 'grooming', 'powder and pomade'] },
      { name: "The Aethelstow Stable", type: 'Stable', owner: 'Stablemaster Garret Roan',
        description: 'Quality stabling for visiting nobles and their mounts. Saddler services available on request.',
        sells: ['horse hire'], services: ['boarding', 'farrier', 'saddle fitting'] },
    ]
  },

  'Grimscastel': {
    type: 'City', kingdom: 'Ardrenhold',
    establishments: [
      { name: "The Dark Keep Tavern", type: 'Tavern', owner: 'Ulric Dregs',
        description: 'Shadowy tavern beneath the castle walls. Rumours abound.',
        sells: ['ale', 'meals'], services: ['rumour board'] },
      { name: "Grimforge", type: 'Blacksmith', owner: 'Keld Grimm',
        description: 'Produces dark-finished arms with a fearsome reputation.',
        buys: ['metal'], sells: ['weapons', 'armor'], services: ['repair'] },
      { name: "The Raven's Eye", type: 'Thieves Den', owner: 'Unknown',
        description: 'A back-alley pawn shop. Asks no questions.',
        buys: ['stolen goods', 'valuables'], sells: ['lockpicks', 'poisons', 'disguises'] },
      { name: "Castle Gate Inn", type: 'Inn', owner: 'Nessa Blackwell',
        description: 'Reliable lodging next to the castle gatehouse.',
        sells: ['lodging', 'meals'] },
      { name: "Grimstone Mason", type: 'Mason', owner: 'Durward Stone',
        description: 'Stonework repairs and castle maintenance contracts.',
        sells: ['stone', 'materials'], services: ['construction'] },
      { name: 'Shrine of Grim', type: 'Shrine', owner: 'Watcher Helve',
        description: 'A moody shrine honouring the castle\'s legendary founder.',
        services: ['blessing', 'lore'] },
      { name: "The Castle Gaol", type: 'Prison', owner: 'Jailer Mord Ashgate',
        description: 'Deep cells beneath the castle keep. Rumours say some prisoners have been there since the founding.',
        services: ['bail processing', 'prisoner visit'] },
      { name: "Grimwall Chandler", type: 'Chandler', owner: 'Petra Soot',
        description: 'Candles and oil lamps for the castle district. Business is steady — the dark corners need lighting.',
        sells: ['candles', 'lamp oil'] },
    ]
  },

  'Kinsburg': {
    type: 'Village', kingdom: 'Ardrenhold',
    establishments: [
      { name: 'The Kin & Cup', type: 'Tavern', owner: 'Bess Milner',
        description: 'Village gathering hall and tavern.',
        sells: ['ale', 'meals'] },
      { name: "Kinsburg Smithy", type: 'Blacksmith', owner: 'Hund Forge',
        description: 'Basic tools and farm implements.',
        sells: ['tools'], services: ['repair'] },
      { name: "Root & Remedy", type: 'Herbalist', owner: 'Agnes Moss',
        description: 'Locally gathered herbs and simple remedies.',
        sells: ['herbs', 'potions'] },
      { name: 'Village Store', type: 'General Store', owner: 'Tol Brim',
        description: 'Everyday necessities.',
        sells: ['food', 'tools', 'rope'] },
    ]
  },

  'Hearthmere': {
    type: 'Village', kingdom: 'Ardrenhold',
    establishments: [
      { name: 'The Hearth & Ember', type: 'Tavern', owner: 'Willa Tallow',
        description: 'Warm village inn — the only heated building in winter.',
        sells: ['ale', 'meals', 'lodging'] },
      { name: "Thornblade Trapper", type: 'Trader', owner: 'Skel Thornblade',
        description: 'Buys game from hunters venturing into Ardrenwood.',
        buys: ['pelts', 'meat'], sells: ['hunting supplies'] },
      { name: 'Hearthfire Chapel', type: 'Chapel', owner: 'Sister Mara',
        description: 'Small chapel offering warmth and healing to travellers.',
        services: ['healing', 'blessing'] },
    ]
  },

  'Wyrmwood': {
    type: 'Village', kingdom: 'Ardrenhold',
    establishments: [
      { name: "The Wyrmwood Alehouse", type: 'Tavern', owner: 'Gord Ashback',
        description: 'Named for the wyvern sightings nearby. Trophies on the walls.',
        sells: ['ale', 'meals'] },
      { name: "Woodwright's Post", type: 'Carpenter', owner: 'Coll Woodwright',
        description: 'Timber cutting and basic carpentry.',
        sells: ['wood', 'tools'], services: ['construction'] },
      { name: 'Village Well & Store', type: 'General Store', owner: 'Ela Rushby',
        description: 'Provisions for travellers heading toward Raven\'s Perch.',
        sells: ['food', 'rope', 'torches'] },
    ]
  },

  'Brigstow': {
    type: 'Village', kingdom: 'Ardrenhold',
    establishments: [
      { name: 'The Bridge Inn', type: 'Inn', owner: 'Owen Stow',
        description: 'Sits beside the old stone bridge — well-trafficked stopping point.',
        sells: ['lodging', 'meals'] },
      { name: "Fisher's Wharf", type: 'Fisher', owner: 'Donal Net',
        description: 'Sells fresh river fish and rents fishing gear.',
        buys: ['fish'], sells: ['fish', 'fishing gear'] },
    ]
  },

  'Eorlingstead': {
    type: 'Village', kingdom: 'Ardrenhold',
    establishments: [
      { name: "The Eorl's Table", type: 'Tavern', owner: 'Bran Eorling',
        description: 'Claims descent from the founding settlers. Old and proud.',
        sells: ['ale', 'meals'] },
      { name: "Farmstead Supply", type: 'Farm Supply', owner: 'Tilda Grain',
        description: 'Seeds, feed, and agricultural tools.',
        sells: ['seeds', 'tools', 'animal feed'] },
    ]
  },

  'Alderwood': {
    type: 'Village', kingdom: 'Ardrenhold',
    establishments: [
      { name: "The Alder Arms", type: 'Tavern', owner: 'Nat Alders',
        description: 'Quiet village tavern on the forest road.',
        sells: ['ale', 'meals'] },
      { name: "Greenleaf Herbalist", type: 'Herbalist', owner: 'Fern Wild',
        description: 'Wild-harvested herbs from the nearby forest.',
        buys: ['herbs'], sells: ['herbs', 'remedies'] },
    ]
  },

  // ══════════════════════════════════════════
  //  DWYNBROCH  (Human/Dwarf — Northwestern)
  // ══════════════════════════════════════════

  'Aberwyn': {
    type: 'CapitalCity', kingdom: 'Dwynbroch',
    establishments: [
      { name: "The River Mouth Lodge", type: 'Inn', owner: 'Fiona Wynd',
        description: 'A sprawling riverside inn popular with river traders.',
        sells: ['lodging', 'meals', 'ale'] },
      { name: "The Dragon's Breath Tavern", type: 'Tavern', owner: 'Brogan Mac',
        description: 'The liveliest tavern in the north — bards perform every night.',
        sells: ['ale', 'mead', 'meals'], services: ['live music', 'gambling'] },
      { name: "Highland Forge", type: 'Blacksmith', owner: 'Rory Hammerstone',
        description: 'Heavy dwarven-influenced metalwork meets Celtic craftsmanship.',
        buys: ['metal'], sells: ['weapons', 'armor', 'tools'], services: ['repair', 'commission'] },
      { name: "The Highland Meadery", type: 'Meadery', owner: 'Siobhan Comb',
        description: 'Famous for exquisite honey mead brewed in copper vats.',
        buys: ['honey', 'herbs'], sells: ['mead', 'honey'] },
      { name: "Cairn & Quill Scribes", type: 'Scribe', owner: 'Alasdair Penn',
        description: 'Historical records and bardic manuscripts.',
        sells: ['books', 'scrolls', 'maps'], services: ['translation', 'history research'] },
      { name: "Thornweave Tailors", type: 'Tailor', owner: 'Moira Thornweave',
        description: 'Tartan-patterned cloaks and highland garments.',
        sells: ['clothing', 'cloaks', 'cloth'] },
      { name: "Mossroot Apothecary", type: 'Apothecary', owner: 'Bridget Mossroot',
        description: 'Remedies from the highland bogs and pine forests.',
        sells: ['potions', 'herbs'] },
      { name: "Aberwyn Market Cross", type: 'Market', owner: 'Market Warden Ceallan',
        description: 'Weekly market around the ancient stone cross in the city centre.',
        sells: ['general goods', 'food', 'crafts'] },
      { name: 'Cathedral of the Emerald Flame', type: 'Temple', owner: 'High Priest Cian',
        description: 'Celtic-style cathedral with flame motifs carved in emerald stone.',
        services: ['healing', 'blessing', 'lore'] },
      { name: "The Minstrel's Hall", type: 'Guild Hall',
        description: 'Regional bard guild — music lessons, performance licensing, story archives.',
        services: ['music lessons', 'performance hire', 'lore'] },
      { name: "Bogwood Carpenter", type: 'Carpenter', owner: 'Donal Bogwood',
        description: 'Traditional woodcraft using pine and bog-oak.',
        sells: ['furniture', 'timber', 'tools'], services: ['construction'] },
      { name: "Aberwyn Watch Post", type: 'Barracks', owner: 'Captain Sorcha',
        description: 'City guard and bounty board for the northwestern region.',
        services: ['bounty board', 'guard hire'] },
      { name: "The Highland Playhouse", type: 'Theatre', owner: 'Director Brigid Fael',
        description: 'Celtic-style performance hall hosting bardic competitions, theatrical productions, and festivals.',
        sells: ['tickets'], services: ['performance hire', 'bardic competition registration'] },
      { name: "The Druid Circle of Aberwyn", type: 'Druid Grove', owner: 'Elder Druid Caolinn',
        description: 'A sacred grove just beyond the city walls tended by resident druids. Open to those who respect the old ways.',
        services: ['nature blessing', 'herb consultation', 'communion with the wild'] },
      { name: "Aberwyn Ranger Station", type: 'Ranger Post', owner: 'Ranger Captain Fionn Mac',
        description: 'Northwestern ranger outpost tracking threats in the Thornwood Forest and Misty Moors.',
        services: ['scouting contracts', 'wilderness guidance', 'monster reports'] },
      { name: "Saoirse's Mask & Craft", type: 'Mask Maker', owner: 'Saoirse Vel',
        description: 'Festival masks, ritual masks, and theatrical props crafted with traditional highland artistry.',
        sells: ['masks', 'props', 'costume accessories'] },
      { name: "The Highland Cooper", type: 'Cooper', owner: 'Donal Hoop',
        description: 'Cooperage supplying the famous Highland Meadery and local breweries. Also makes casks for the river trade.',
        sells: ['barrels', 'mead casks', 'storage tubs'] },
      { name: "Ceallan the Saddler", type: 'Saddler', owner: 'Ceallan Strap',
        description: 'Traditional Celtic saddle-making and tack. Supplies highland riders and courier services.',
        buys: ['leather'], sells: ['saddles', 'bridles', 'riding tack', 'saddlebags'], services: ['repair', 'custom fitting'] },
    ]
  },

  'Lochvale': {
    type: 'City', kingdom: 'Dwynbroch',
    establishments: [
      { name: "The Arena Grill", type: 'Tavern', owner: 'Fergus Pit',
        description: 'Fight-goers crowd this tavern before and after bouts.',
        sells: ['ale', 'meals'], services: ['fight betting'] },
      { name: "The Champion's Rest", type: 'Inn', owner: 'Una Braw',
        description: 'Favoured by arena fighters and their entourages.',
        sells: ['lodging', 'meals'] },
      { name: "Lochvale Armaments", type: 'Blacksmith', owner: 'Cormac Steel',
        description: 'Specialises in arena weapons — dulled for sparring, sharp for real.',
        sells: ['weapons', 'armor'], services: ['repair', 'commission'] },
      { name: "The Pit Apothecary", type: 'Apothecary', owner: 'Nessa Salve',
        description: 'Healing potions and wound dressings sold to fighters.',
        sells: ['potions', 'bandages'] },
      { name: "Lochvale Betting House", type: 'Merchant', owner: 'Grald Odds',
        description: 'Takes bets on arena bouts and other contests.',
        services: ['gambling', 'odds board'] },
      { name: "The Arena Stable", type: 'Stable', owner: 'Stablemaster Conn Rory',
        description: 'Stabling for fighters arriving by horse and spectators from outlying areas.',
        sells: ['horse hire'], services: ['boarding', 'farrier'] },
      { name: "The Lochvale Saddler", type: 'Saddler', owner: 'Brigid Strap',
        description: 'Makes saddles and tack for fighters, couriers, and nobles passing through for the arena season.',
        buys: ['leather'], sells: ['saddles', 'bridles', 'harnesses', 'saddlebags'], services: ['repair'] },
      { name: "The Champion's Barber", type: 'Barber', owner: 'Fionnuala Razor',
        description: 'Fighters shave their heads here before bouts. Fionnuala also treats minor arena wounds.',
        services: ['haircut', 'shave', 'wound dressing'] },
    ]
  },

  'Morvarth': {
    type: 'City', kingdom: 'Dwynbroch',
    establishments: [
      { name: "Sea View Inn", type: 'Inn', owner: 'Catriona Shore',
        description: 'A coastal inn with commanding views of the western sea.',
        sells: ['lodging', 'meals', 'seafood'] },
      { name: "The Sailor's Knot", type: 'Tavern', owner: 'Angus Tide',
        description: 'Rough maritime tavern serving sailors and fishermen.',
        sells: ['ale', 'seafood'] },
      { name: "Morvarth Docksmith", type: 'Blacksmith', owner: 'Iain Seaforge',
        description: 'Anchors, chains, and shipwright ironwork.',
        sells: ['tools', 'metal goods'], services: ['repair'] },
      { name: "The Net & Hook", type: 'Fisher', owner: 'Dara Net',
        description: 'Fresh sea catch and fishing equipment.',
        buys: ['fish'], sells: ['fish', 'fishing gear'] },
      { name: "Coastal Trading Post", type: 'Merchant', owner: 'Elma Trade',
        description: 'Imports and exports by sea — exotic goods available.',
        sells: ['exotic goods', 'cloth', 'spices'] },
      { name: "Morvarth Shipyard", type: 'Shipyard', owner: 'Shipwright Caolan Keelwright',
        description: 'Builds and repairs fishing vessels and coastal traders. Only shipyard on the northwestern coast.',
        services: ['ship construction', 'ship repair', 'sailmaking', 'timber supply'] },
      { name: "The Morvarth Stable", type: 'Stable', owner: 'Stablemaster Niall Groom',
        description: 'Stabling for travellers arriving by road. Horse hire for coastal routes.',
        sells: ['horse hire'], services: ['boarding', 'farrier'] },
    ]
  },

  'Glencairn': {
    type: 'City', kingdom: 'Dwynbroch',
    establishments: [
      { name: "The Cairn Alehouse", type: 'Tavern', owner: 'Seamus Croft',
        description: 'Nestled in the valley famous for ancient cairns.',
        sells: ['ale', 'mead', 'meals'] },
      { name: "Stonewright Masons", type: 'Mason', owner: 'Findlay Stone',
        description: 'Specialists in cairn restoration and traditional stonework.',
        sells: ['stone', 'materials'], services: ['construction', 'restoration'] },
      { name: "Glencairn Herbalist", type: 'Herbalist', owner: 'Shona Bloom',
        description: 'Valley herbs with natural healing properties.',
        sells: ['herbs', 'remedies'] },
      { name: "The Scholar\'s Cairn", type: 'Library', owner: 'Historian Brodie',
        description: 'Dedicated to recording the history of the cairn valley.',
        sells: ['books'], services: ['research', 'guided tours'] },
      { name: "The Cairn Stable", type: 'Stable', owner: 'Stablemaster Ewan Shoe',
        description: 'Reliable stabling for those exploring the cairn valley on horseback.',
        sells: ['horse hire'], services: ['boarding', 'farrier'] },
      { name: "Glencairn Barber", type: 'Barber', owner: 'Tadhg Trim',
        description: 'Village barber who also serves as the local tooth-puller. Welcomes curious travellers.',
        services: ['haircut', 'shave', 'tooth extraction'] },
      { name: "Glencairn Chandler", type: 'Chandler', owner: 'Mona Tallow',
        description: 'Candles and rush lights for homes and the library. Supplies beeswax for sealing documents.',
        sells: ['candles', 'rush lights', 'beeswax'] },
    ]
  },

  'Glenvarloch': {
    type: 'City', kingdom: 'Dwynbroch',
    establishments: [
      { name: "The Loch's Edge Tavern", type: 'Tavern', owner: 'Niamh Shore',
        description: 'Sits on the banks of the mysterious deep lake.',
        sells: ['ale', 'meals'], services: ['boat hire'] },
      { name: "Deepwater Fishery", type: 'Fisher', owner: 'Calum Deep',
        description: 'Catches unusual deep-lake fish found nowhere else.',
        buys: ['fish'], sells: ['fish', 'rare fish'] },
      { name: "Varloch Alchemist", type: 'Alchemist', owner: 'Muirne Glass',
        description: 'Uses lake minerals in unusual alchemical experiments.',
        sells: ['potions', 'alchemical supplies'], services: ['identify', 'alchemy lessons'] },
      { name: "The Loch Ranger Post", type: 'Ranger Post', owner: 'Ranger Ciarán Shore',
        description: 'Small ranger post monitoring the strange activity around the deep lake and surrounding moors.',
        services: ['scouting contracts', 'wilderness guidance', 'monster reports'] },
      { name: "Deepwater Potter", type: 'Potter', owner: 'Niamh Clay',
        description: 'Uses mineral-rich lake clay to make distinctive blue-grey ceramics prized across Dwynbroch.',
        sells: ['pottery', 'clay vessels', 'blue-grey ceramics'] },
    ]
  },

  'Dalmore': {
    type: 'Village', kingdom: 'Dwynbroch',
    establishments: [
      { name: "The Moorside Inn", type: 'Inn', owner: 'Ewan Peat',
        description: 'A peat-fire warmed inn on the moor road.',
        sells: ['lodging', 'meals'] },
      { name: "Dalmore General", type: 'General Store', owner: 'Isla Stock',
        description: 'Basic supplies for bog and moorland travellers.',
        sells: ['food', 'tools', 'torches'] },
    ]
  },

  'Thornwood': {
    type: 'Village', kingdom: 'Dwynbroch',
    establishments: [
      { name: "The Thorny Branch", type: 'Tavern', owner: 'Tam Bristle',
        description: 'On the edge of the Thornwood Forest. Adventurers gather here.',
        sells: ['ale', 'meals'], services: ['rumour board'] },
      { name: "Huntsman's Lodge", type: 'Trader', owner: 'Bairn Track',
        description: 'Buys game and sells hunting supplies for forest expeditions.',
        buys: ['pelts', 'meat'], sells: ['hunting supplies', 'traps'] },
    ]
  },

  'Braefern': {
    type: 'Village', kingdom: 'Dwynbroch',
    establishments: [
      { name: "The Fern & Flagon", type: 'Tavern', owner: 'Maggie Fern',
        description: 'Small village tavern known for good whisky.',
        sells: ['ale', 'whisky', 'meals'] },
      { name: "Braefern Farmstead", type: 'Farm Supply', owner: 'Duncan Plough',
        description: 'Agricultural supplies for highland farming.',
        sells: ['seeds', 'tools', 'animal feed'] },
    ]
  },

  'Dunleith': {
    type: 'Village', kingdom: 'Dwynbroch',
    establishments: [
      { name: "The Fort Inn", type: 'Inn', owner: 'Meg Dunwall',
        description: 'Built within the ruins of an old fort.',
        sells: ['lodging', 'meals'] },
      { name: "Dunleith Smithy", type: 'Blacksmith', owner: 'Rabbie Iron',
        description: 'Basic smithing in a single-hearth forge.',
        sells: ['tools'], services: ['repair'] },
    ]
  },

  'Glenmire': {
    type: 'Village', kingdom: 'Dwynbroch',
    establishments: [
      { name: "The Mire Tap", type: 'Tavern', owner: 'Finn Mire',
        description: 'A bog-side tavern with peat-smoked ale.',
        sells: ['ale', 'meals'] },
      { name: "Bogherb Remedies", type: 'Herbalist', owner: 'Saoirse Bog',
        description: 'Herbs unique to the boglands — some have unusual properties.',
        sells: ['herbs', 'remedies'] },
    ]
  },

  // ══════════════════════════════════════════
  //  BRYTHWEN  (Human — Southern coast)
  // ══════════════════════════════════════════

  'Brythford': {
    type: 'CapitalCity', kingdom: 'Brythwen',
    establishments: [
      { name: "The Grand Wharf Tavern", type: 'Tavern', owner: 'Harland Quay',
        description: 'The busiest tavern on the continent — traders from all lands.',
        sells: ['ale', 'wine', 'exotic drinks', 'meals'] },
      { name: "The Merchant Prince Inn", type: 'Inn', owner: 'Sylva Brocade',
        description: 'Opulent inn catering to the wealthy merchant class.',
        sells: ['lodging', 'fine meals', 'wine'] },
      { name: "Continental Forge", type: 'Blacksmith', owner: 'Baldric Sear',
        description: 'Imports steel from Feldarún and works it into the finest blades.',
        buys: ['metal'], sells: ['weapons', 'armor'], services: ['commission', 'repair'] },
      { name: "Brythford Grand Market", type: 'Market', owner: 'Market Overseer Denn',
        description: 'The largest marketplace on the continent — everything available.',
        sells: ['all categories'] },
      { name: "The Spice Exchange", type: 'Merchant', owner: 'Valdo Spice',
        description: 'Rare spices, exotic ingredients, and foreign curiosities.',
        sells: ['spices', 'exotic ingredients', 'foreign goods'] },
      { name: "The Loom Quarter", type: 'Weaver', owner: 'Guild Mistress Petra',
        description: 'Entire city district of weavers producing fine cloth.',
        buys: ['wool', 'flax'], sells: ['cloth', 'clothing', 'tapestries'] },
      { name: "Tide & Tincture Apothecary", type: 'Apothecary', owner: 'Mira Salts',
        description: 'Sea-mineral remedies and rare coastal herbs.',
        sells: ['potions', 'herbs', 'exotic remedies'] },
      { name: "The Navigator's Library", type: 'Library', owner: 'Cartographer Elsin',
        description: 'The best map collection on Estranta.',
        sells: ['maps', 'books', 'charts'], services: ['cartography', 'navigation lessons'] },
      { name: "Brythford Mage College", type: 'Mage Tower', owner: 'Arch-Mage Valdris',
        description: 'The premier magical institution on the continent.',
        sells: ['scrolls', 'mana potions', 'spell components'], services: ['magic lessons', 'enchanting', 'identify'] },
      { name: "The Treasury Exchange", type: 'Merchant', owner: 'Guildmaster Corvin',
        description: 'Currency, loans, and investment in merchant ventures.',
        services: ['currency exchange', 'loans', 'investment'] },
      { name: "Brythford Tannery", type: 'Tanner', owner: 'Edgar Hide',
        description: 'Large-scale leather processing for the maritime trade.',
        buys: ['hides'], sells: ['leather', 'leather goods'] },
      { name: "The Cobbler's Mile", type: 'Cobbler', owner: 'Marc Sole',
        description: 'A street of cobblers — every style of footwear available.',
        sells: ['boots', 'shoes', 'sandals'] },
      { name: "Sea Temple of Brythwen", type: 'Temple', owner: 'High Priest Calder',
        description: 'Grand coastal temple — sailors pray here before long voyages.',
        services: ['blessing', 'healing', 'burial rites'] },
      { name: "Port Watch Barracks", type: 'Barracks', owner: 'Harbormaster Greith',
        description: 'Port authority and city watch. Smuggler bounties posted.',
        services: ['bounty board', 'port permits', 'guard hire'] },
      { name: "Brythford Distillery", type: 'Distillery', owner: 'Osric Still',
        description: 'Produces the continent\'s finest brandy and spirits.',
        buys: ['grain', 'fruits'], sells: ['spirits', 'wine', 'brandy'] },
      { name: "The Tailor's Quarter", type: 'Tailor', owner: 'Guild Master Elara',
        description: 'Fashion capital of Estranta — sets the continental style.',
        sells: ['clothing', 'fine garments', 'accessories'] },
      { name: "The Grand Theatre of Brythford", type: 'Theatre', owner: 'Director Cassian Pell',
        description: 'The largest stage on the continent. Home to the Performers\' Grand Company. Plays, concerts, and masquerades year-round.',
        sells: ['tickets'], services: ['performance hire', 'rehearsal space', 'auditions'] },
      { name: "Mira's Glassworks", type: 'Glassblower', owner: 'Mira Clearblown',
        description: 'Fine glassware, windows, alchemical vessels, and decorative art. Trained in the old traditions.',
        sells: ['glassware', 'vials', 'windows', 'decorative glass'] },
      { name: "The Antiquarian's Cabinet", type: 'Antiquarian', owner: 'Oldwyn Verst',
        description: 'Dealer in ancient relics, curios, and authenticated artefacts. Will also appraise and authenticate finds.',
        buys: ['relics', 'artefacts', 'ancient coins'], sells: ['relics', 'artefacts', 'curios'],
        services: ['appraisal', 'authentication'] },
      { name: "Dael's Silverworks", type: 'Silversmith', owner: 'Dael Brighthand',
        description: 'Silver jewellery, tableware, and decorative commissions. Also does silverwork repairs.',
        sells: ['silver jewellery', 'silverware', 'decorative pieces'], services: ['commission', 'repair'] },
      { name: "The Brythford Academy", type: 'Academy', owner: 'Provost Aldric Vane',
        description: 'A centre of philosophical and scholarly learning. Lectures, debates, and research fellowships.',
        services: ['lectures', 'research access', 'fellowships', 'tuition'] },
      { name: "Harlan's Paper Mill", type: 'Papermaker', owner: 'Harlan Pulp',
        description: 'Produces writing paper and parchment for the continent\'s scribes and scholars.',
        sells: ['paper', 'parchment', 'writing materials'] },
      { name: "The Brythford Adventurers' Hall", type: 'Adventurers Guild', owner: 'Guildmaster Soren Ashvale',
        description: 'Continental headquarters of the Adventurers\' Fellowship. The most complete contract board on Estranta.',
        services: ['contract board', 'equipment loans', 'fellowship membership', 'expedition funding'] },
      { name: "Coppice & Sons Shipyard", type: 'Shipyard', owner: 'Master Shipwright Ollen Coppice',
        description: 'The largest shipyard on the southern coast. Constructs and repairs ocean-going vessels.',
        services: ['ship construction', 'ship repair', 'timber supply', 'commission'] },
      { name: "The Crown Stable", type: 'Stable', owner: 'Stablemaster Petra Roan',
        description: 'Large commercial stables near the Grand Market. Horse hire, boarding, and sale.',
        sells: ['horse hire', 'horses'], services: ['boarding', 'farrier', 'saddle fitting'] },
      { name: "The Potter's Quarter", type: 'Potter', owner: 'Guild Senior Wissa Clay',
        description: 'A district of potters producing utilitarian and decorative ceramics for trade.',
        sells: ['pottery', 'ceramic vessels', 'tiles'] },
    ]
  },

  'Eldenbrook': {
    type: 'City', kingdom: 'Brythwen',
    establishments: [
      { name: "The Brook & Barrel", type: 'Tavern', owner: 'Perry Stream',
        description: 'A cheerful tavern on the brook road.',
        sells: ['ale', 'cider', 'meals'] },
      { name: "Eldenbrook Smithy", type: 'Blacksmith', owner: 'Holt Anvilson',
        description: 'Quality tools and blades for the merchant road.',
        sells: ['tools', 'weapons'], services: ['repair'] },
      { name: "Streamside Herbalist", type: 'Herbalist', owner: 'Rosa Waters',
        description: 'Waterside herbs with gentle healing properties.',
        sells: ['herbs', 'remedies'] },
      { name: "The Brook Inn", type: 'Inn', owner: 'Ned Quiet',
        description: 'A peaceful inn on the road to Brythford.',
        sells: ['lodging', 'meals'] },
      { name: "The Brook Stable", type: 'Stable', owner: 'Stablemaster Tomas Hoof',
        description: 'Decent stabling on the merchant road. Easy access for traders heading to Brythford.',
        sells: ['horse hire'], services: ['boarding', 'farrier'] },
      { name: "Eldenbrook Barber", type: 'Barber', owner: 'Cicely Cut',
        description: 'Friendly barber serving the merchant road. Good for a clean-up before arriving at the capital.',
        services: ['haircut', 'shave', 'wound dressing'] },
      { name: "Millstone Cooper", type: 'Cooper', owner: 'Bram Hoop',
        description: 'Cooperage producing barrels for the local brewer and casks for river traders.',
        sells: ['barrels', 'casks', 'buckets'] },
    ]
  },

  'Valdara': {
    type: 'City', kingdom: 'Brythwen',
    establishments: [
      { name: "The Valdara Exchange", type: 'Merchant', owner: 'Cressida Gold',
        description: 'Regional commodity trading post for southern goods.',
        sells: ['trade goods', 'exotic items'] },
      { name: "The South Wind Inn", type: 'Inn', owner: 'Bera Sail',
        description: 'Named for the warm coastal wind.',
        sells: ['lodging', 'meals'] },
      { name: "Valdara Arms", type: 'Blacksmith', owner: 'Finn Temper',
        description: 'Coastal city smithy with marine ironwork.',
        sells: ['weapons', 'tools'], services: ['repair'] },
      { name: "Sailor's Apothecary", type: 'Apothecary', owner: 'Dena Brine',
        description: 'Sea-sickness cures and wound dressings for sailors.',
        sells: ['potions', 'herbs'] },
      { name: "The Valdara Stable", type: 'Stable', owner: 'Stablemaster Oswin Mare',
        description: 'Stabling for road and coastal couriers. A regular stop on the southern merchant circuit.',
        sells: ['horse hire'], services: ['boarding', 'farrier'] },
      { name: "Valdara Shipyard", type: 'Shipyard', owner: 'Shipwright Leofric Keel',
        description: 'Small coastal shipyard specialising in fishing boats and coastal traders.',
        services: ['ship construction', 'ship repair', 'sailmaking'] },
      { name: "Valdara Saddler", type: 'Saddler', owner: 'Petra Strap',
        description: 'Leather saddles and tack for the coastal trade road. Also makes waterproofed saddlebags.',
        buys: ['leather'], sells: ['saddles', 'bridles', 'waterproofed bags'], services: ['repair'] },
    ]
  },

  'Greystone': {
    type: 'City', kingdom: 'Brythwen',
    establishments: [
      { name: "The Grey Flagstone", type: 'Tavern', owner: 'Weston Grey',
        description: 'Named for the local grey stone. A solid, dependable tavern.',
        sells: ['ale', 'meals'] },
      { name: "Greystone Quarry Office", type: 'Miner', owner: 'Overseer Thane',
        description: 'Sells cut stone and operates the local quarry.',
        buys: ['raw stone'], sells: ['stone', 'gravel', 'building materials'] },
      { name: "Mason's Lodge", type: 'Mason', owner: 'Aldus Mortar',
        description: 'Expert stonecutters serving the coast\'s buildings.',
        sells: ['stone work'], services: ['construction'] },
      { name: "The Grey Inn", type: 'Inn', owner: 'Willa Grey',
        description: 'Sturdy stonework inn — practically impregnable.',
        sells: ['lodging', 'meals'] },
      { name: "Greystone Potter", type: 'Potter', owner: 'Aldric Clay',
        description: 'Uses local grey clay from the quarry to make distinctive utilitarian ceramics — tough and cheap.',
        sells: ['pottery', 'stone-grey ceramics', 'clay vessels'] },
      { name: "Greystone Barber", type: 'Barber', owner: 'Rosie Clip',
        description: 'Quarry workers come here to clean up after shifts. Practical and no-fuss.',
        services: ['haircut', 'shave', 'wound dressing'] },
      { name: "The Greystone Gaol", type: 'Prison', owner: 'Jailer Wulfric Hold',
        description: 'Stone cells naturally integrated into the quarry district. Solid as the rock around them.',
        services: ['bail processing', 'prisoner visit'] },
    ]
  },

  'Windhall': {
    type: 'City', kingdom: 'Brythwen',
    establishments: [
      { name: "The Windhall Brewhouse", type: 'Brewer', owner: 'Gale Hops',
        description: 'Wind-powered mill feeds this large coastal brewery.',
        sells: ['ale', 'beer'] },
      { name: "The Gale Inn", type: 'Inn', owner: 'Mira Wind',
        description: 'The sign swings wildly in the constant sea breeze.',
        sells: ['lodging', 'meals'] },
      { name: "Windhall Fletcher", type: 'Fletcher', owner: 'Arrow Wynn',
        description: 'Quality bows and arrows for coastal hunters.',
        sells: ['bows', 'arrows'] },
      { name: "The Wind Stable", type: 'Stable', owner: 'Stablemaster Gale Trot',
        description: 'Stabling in a sheltered yard protected from the coastal wind. Popular with couriers.',
        sells: ['horse hire'], services: ['boarding', 'farrier'] },
      { name: "Windhall Glassworks", type: 'Glassblower', owner: 'Mael Breeze',
        description: 'Uses coastal sand and wind-powered kilns. Specialises in bottle glass for the local distillery.',
        sells: ['glass bottles', 'glassware', 'windows'] },
      { name: "The Windhall Theatre", type: 'Theatre', owner: 'Director Pell Wind',
        description: 'Coastal playhouse where merchant-sponsored troupes perform. The open roof creates unique acoustics.',
        sells: ['tickets'], services: ['performance hire'] },
    ]
  },

  'Thornwick': { type: 'Village', kingdom: 'Brythwen', establishments: [
    { name: "The Thorn Bush", type: 'Tavern', owner: 'Wick Bramble', description: 'Village tavern on the southern road.', sells: ['ale', 'meals'] },
    { name: "Thornwick Store", type: 'General Store', owner: 'Ella Thorn', description: 'Basic provisions.', sells: ['food', 'tools'] },
  ]},

  'Brambleton': { type: 'Village', kingdom: 'Brythwen', establishments: [
    { name: "The Bramble Inn", type: 'Inn', owner: 'Joss Bramble', description: 'Comfortable village inn.', sells: ['lodging', 'meals'] },
    { name: "Brambleton Herbalist", type: 'Herbalist', owner: 'Ivy Green', description: 'Hedgerow herbs and simple cures.', sells: ['herbs', 'remedies'] },
  ]},

  'Oakshire': { type: 'Village', kingdom: 'Brythwen', establishments: [
    { name: "The Oak & Ale", type: 'Tavern', owner: 'Brandin Oak', description: 'Under a great old oak tree.', sells: ['ale', 'meals'] },
    { name: "Oakshire Carpenter", type: 'Carpenter', owner: 'Tim Oak', description: 'Oak timber and furniture.', sells: ['wood', 'furniture'] },
  ]},

  'Riverwell': { type: 'Village', kingdom: 'Brythwen', establishments: [
    { name: "The Well House", type: 'Tavern', owner: 'Pell Well', description: 'Built around the ancient village well.', sells: ['ale', 'meals'] },
    { name: "Riverwell Fisher", type: 'Fisher', owner: 'Nol River', description: 'River catch and bait sold here.', sells: ['fish', 'bait'] },
  ]},

  'Meadowford': { type: 'Village', kingdom: 'Brythwen', establishments: [
    { name: "The Meadow Inn", type: 'Inn', owner: 'Bess Meadow', description: 'Quiet meadow-side lodging.', sells: ['lodging', 'meals'] },
    { name: "Meadowford Farm Supply", type: 'Farm Supply', owner: 'Rufus Hay', description: 'Agricultural supplies for southern farmers.', sells: ['seeds', 'tools'] },
  ]},

  'Drunmar': { type: 'Village', kingdom: 'Brythwen', establishments: [
    { name: "The Drunken Mare", type: 'Tavern', owner: 'Lela Drune', description: 'The name is not an accident.', sells: ['ale', 'meals'] },
    { name: "Drunmar Smithy", type: 'Blacksmith', owner: 'Oran Coals', description: 'Coastal repair smithy.', sells: ['tools'], services: ['repair'] },
  ]},

  // ══════════════════════════════════════════
  //  NITHROND  (Elf — Southeastern)
  // ══════════════════════════════════════════

  'Thalorion': {
    type: 'CapitalCity', kingdom: 'Nithrond',
    establishments: [
      { name: "The Silver Bough Inn", type: 'Inn', owner: 'Aelindra Bough',
        description: 'Elven inn grown from living trees — rooms are hollow heartwood chambers.',
        sells: ['lodging', 'elven meals', 'herbal tea'] },
      { name: "Starfire Forge", type: 'Blacksmith', owner: 'Vaelthen Ember',
        description: 'Elven smithing using star-iron and forest alloys.',
        buys: ['metal', 'star iron'], sells: ['weapons', 'armor', 'tools'], services: ['enchanting', 'commission'] },
      { name: "The Loremaster's Archive", type: 'Library', owner: 'Loremaster Sylris',
        description: 'Ancient elven library containing histories dating back millennia.',
        sells: ['books', 'scrolls', 'maps'], services: ['research', 'translation', 'lore'] },
      { name: "Elven Loremasters Society", type: 'Guild Hall',
        description: 'Scholarly guild for elven historians and natural philosophers.',
        services: ['research', 'lore commission', 'apprenticeships'] },
      { name: "Moonbloom Apothecary", type: 'Apothecary', owner: 'Faerwyn Moon',
        description: 'Rare elven herbs and moonlight-brewed potions.',
        buys: ['moonbloom', 'rare herbs'], sells: ['potions', 'rare herbs', 'elven remedies'] },
      { name: "Thalorion Weavers", type: 'Weaver', owner: 'Lirien Silk',
        description: 'Produces enchanted elven textiles with protective properties.',
        sells: ['cloth', 'enchanted clothing', 'silk'] },
      { name: "The Wandering Leaf Market", type: 'Market', owner: 'Market Elder Vith',
        description: 'Open-air elven market held under ancient canopy trees.',
        sells: ['general goods', 'elven crafts', 'herbs'] },
      { name: "Thalorion Mage Spire", type: 'Mage Tower', owner: 'Arch-Mage Aethos',
        description: 'Elven magic university and research spire.',
        sells: ['scrolls', 'spell components', 'mana potions'], services: ['magic tuition', 'enchanting'] },
      { name: "Temple of the Ancient Wood", type: 'Temple', owner: 'High Priest Sylvara',
        description: 'Living temple grown from thousand-year-old trees.',
        services: ['healing', 'nature blessing', 'communion'] },
      { name: "Elven Watch Glade", type: 'Barracks', owner: 'Captain Araveil',
        description: 'Elven ranger station and bounty board.',
        services: ['bounty board', 'ranger contracts'] },
      { name: "The Star Canopy Observatory", type: 'Observatory', owner: 'Chief Astrologer Ithindel',
        description: 'A living-wood observatory grown above the canopy. Elven astrologers map star paths and read celestial portents here.',
        services: ['star chart reading', 'celestial consultation', 'astronomical records'] },
      { name: "The Loremasters' Academy", type: 'Academy', owner: 'Chancellor Aelveth',
        description: 'Premier centre of philosophical and historical learning in Nithrond. Open to scholars of all races by invitation.',
        services: ['lectures', 'research access', 'translation', 'philosophical debate'] },
      { name: "The Rune Weave", type: 'Rune Crafter', owner: 'Runemaster Caladren',
        description: 'Workshop for runic inscriptions and enchanted carvings. Commissions weapons, armour, and architectural stonework.',
        sells: ['rune-inscribed items'], services: ['rune commission', 'inscription', 'identify'] },
      { name: "Velindra's Antiquities", type: 'Antiquarian', owner: 'Velindra Syl',
        description: 'Elven antiquarian specialising in pre-Rending relics and elder civilisation artefacts.',
        buys: ['ancient relics', 'star iron', 'elder artefacts'],
        sells: ['authenticated relics', 'historical curios'], services: ['appraisal', 'authentication'] },
    ]
  },

  'Sylvaen': { type: 'City', kingdom: 'Nithrond', establishments: [
    { name: "The Canopy Rest", type: 'Inn', owner: 'Elorin Leaf', description: 'Treetop inn with rope bridges between rooms.', sells: ['lodging', 'meals'] },
    { name: "Sylvaen Herbalist", type: 'Herbalist', owner: 'Mira Green', description: 'Deep-forest herbs for healing.', sells: ['herbs', 'remedies'] },
    { name: "The Green Glade Tavern", type: 'Tavern', owner: 'Wyn Bark', description: 'Quiet elven tavern.', sells: ['elven wine', 'meals'] },
    { name: "The Sylvaen Grove", type: 'Druid Grove', owner: 'Druid Elder Celiveth',
      description: 'A circle of ancient elder trees tended by Nithrond druids. Visitors may commune with nature spirits here.',
      services: ['nature blessing', 'herb consecration', 'seasonal rites'] },
    { name: "Sylvaen Ranger Post", type: 'Ranger Post', owner: 'Ranger Thalindor',
      description: 'Forest ranger station tracking threats from the southeastern borders.',
      services: ['scouting contracts', 'forest guidance', 'threat reports'] },
  ]},

  'Virelysar': { type: 'City', kingdom: 'Nithrond', establishments: [
    { name: "Starweave Tailors", type: 'Tailor', owner: 'Aela Thread', description: 'Elven star-pattern fabrics.', sells: ['clothing', 'cloth'] },
    { name: "The Moonrise Inn", type: 'Inn', owner: 'Tiran Silver', description: 'Inn that opens only at dusk.', sells: ['lodging', 'meals'] },
    { name: "Virelysar Apothecary", type: 'Apothecary', owner: 'Lisiel Vial', description: 'Night-bloom herb remedies.', sells: ['potions', 'herbs'] },
    { name: "The Star Reader's Tower", type: 'Observatory', owner: 'Astrologer Naelindra',
      description: 'A small observatory in the city\'s highest tree, used for star-chart readings and nocturnal observation.',
      services: ['star chart reading', 'celestial consultation'] },
    { name: "Virelysar Antiquarian", type: 'Antiquarian', owner: 'Caladren Dustbind',
      description: 'Elven dealer in night-era artefacts and moonlight-era relics. Open only after dusk.',
      buys: ['ancient relics', 'elven artefacts'], sells: ['elven curios', 'star-marked relics'],
      services: ['appraisal', 'authentication'] },
  ]},

  'Caeleth': { type: 'City', kingdom: 'Nithrond', establishments: [
    { name: "The Sky Hearth", type: 'Tavern', owner: 'Aeron Sky', description: 'High-canopy tavern with open roof.', sells: ['wine', 'meals'] },
    { name: "Caeleth Smithy", type: 'Blacksmith', owner: 'Daren Forge', description: 'Light elven metalwork.', sells: ['tools', 'weapons'], services: ['repair'] },
    { name: "Caeleth Rune Crafter", type: 'Rune Crafter', owner: 'Runewright Silandor',
      description: 'Elven rune inscriptions using sky-iron and canopy-oak. Specialises in ward runes for homes and buildings.',
      sells: ['rune-inscribed items'], services: ['rune commission', 'ward inscriptions'] },
    { name: "The Caeleth Stable", type: 'Stable', owner: 'Stablemaster Galiveth',
      description: 'Elven stabling for horses and the occasional tamed forest creature.',
      sells: ['horse hire'], services: ['boarding', 'farrier'] },
  ]},

  'Namorelith': { type: 'City', kingdom: 'Nithrond', establishments: [
    { name: "The Whispering Inn", type: 'Inn', owner: 'Sael Whisper', description: 'Built around a sacred whispering tree.', sells: ['lodging', 'meals'] },
    { name: "Namorelith Market", type: 'Market', owner: 'Elder Mirith', description: 'Monthly elven gathering market.', sells: ['crafts', 'herbs', 'food'] },
    { name: "The Whispering Grove", type: 'Druid Grove', owner: 'Druid Faelindra',
      description: 'The sacred whispering tree at the city\'s centre is also a druid site of importance. Visitors may petition the druids here.',
      services: ['nature blessing', 'tree commune', 'herb consultation'] },
    { name: "Namorelith Adventurers Post", type: 'Adventurers Guild', owner: 'Guildmaster Ithrandel',
      description: 'A small fellowship outpost where adventurers take southeastern ruin contracts.',
      services: ['contract board', 'expedition membership'] },
  ]},

  'Elmyralen': { type: 'Village', kingdom: 'Nithrond', establishments: [
    { name: "The Elm Hollow", type: 'Tavern', owner: 'Fael Elm', description: 'Village tavern inside a hollow elm.', sells: ['wine', 'meals'] },
    { name: "Elmyralen Store", type: 'General Store', owner: 'Nira Leaf', description: 'Basic elven provisions.', sells: ['food', 'herbs'] },
  ]},

  'Firaelis': { type: 'Village', kingdom: 'Nithrond', establishments: [
    { name: "The Fireside Glade", type: 'Tavern', owner: 'Ara Fire', description: 'Lit by firefly lanterns.', sells: ['wine', 'meals'] },
    { name: "Firaelis Herbalist", type: 'Herbalist', owner: 'Elia Bloom', description: 'Rare fire-herbs of the southeastern woods.', sells: ['herbs'] },
  ]},

  "Tirwynn Hollow": { type: 'Village', kingdom: 'Nithrond', establishments: [
    { name: "Hollow Rest", type: 'Inn', owner: 'Til Wynn', description: 'Small inn in the hollow.', sells: ['lodging', 'meals'] },
  ]},

  "Liraen's Cross": { type: 'Village', kingdom: 'Nithrond', establishments: [
    { name: "The Crossroads Tavern", type: 'Tavern', owner: 'Lira Cross', description: 'Travellers\' meeting point.', sells: ['wine', 'meals'] },
    { name: "Crossroads Store", type: 'General Store', owner: 'Fen Liraen', description: 'Supplies for elven travellers.', sells: ['food', 'tools'] },
  ]},

  'Thandelmere': { type: 'Village', kingdom: 'Nithrond', establishments: [
    { name: "The Mere Lantern", type: 'Tavern', owner: 'Mere Wyn', description: 'Lakeside village tavern.', sells: ['wine', 'fish meals'] },
    { name: "Thandelmere Fisher", type: 'Fisher', owner: 'Syl Net', description: 'Lake fishing and freshwater catch.', sells: ['fish'] },
  ]},

  // ══════════════════════════════════════════
  //  SIVANRIFT  (Elf — Southwestern)
  // ══════════════════════════════════════════

  'Myrthill': {
    type: 'CapitalCity', kingdom: 'Sivanrift',
    establishments: [
      { name: "The Vineyard Terrace Inn", type: 'Inn', owner: 'Elara Vine',
        description: 'Built into a hillside vineyard — wine is drawn directly from the walls.',
        sells: ['lodging', 'fine meals', 'elven wine'] },
      { name: "The Silken Wheel", type: 'Weaver', owner: 'Yvara Silk',
        description: 'Produces enchanted textiles traded across the continent.',
        sells: ['cloth', 'enchanted cloth', 'silk tapestries'] },
      { name: "Myrthill Alchemist", type: 'Alchemist', owner: 'Cerul Dew',
        description: 'Rare herb and exotic wine-infused potions.',
        sells: ['potions', 'alchemical goods'], services: ['alchemy lessons', 'identify'] },
      { name: "The Exotic Herb Exchange", type: 'Herbalist', owner: 'Nira Blossom',
        description: 'Rare herbs from across the rift — moonbloom, ember root, and more.',
        buys: ['rare herbs'], sells: ['rare herbs', 'herb seeds'] },
      { name: "The Elven Cellar", type: 'Distillery', owner: 'Gilveth Pour',
        description: 'Fine elven wines and herb-infused spirits.',
        sells: ['wine', 'spirits', 'mead'] },
      { name: "Myrthill Mage Circle", type: 'Mage Tower', owner: 'Arch-Mage Sorel',
        description: 'Elven magical circle — specialises in nature and light magic.',
        sells: ['scrolls', 'spell components'], services: ['magic tuition', 'enchanting'] },
      { name: "The Grove Temple", type: 'Temple', owner: 'High Priest Elwyn',
        description: 'Open-air grove temple where nature and spirit are honoured.',
        services: ['healing', 'nature blessing', 'divination'] },
      { name: "Silverthread Tailors", type: 'Tailor', owner: 'Aria Thread',
        description: 'Elven fashion capital — sets the style for the rift.',
        sells: ['clothing', 'enchanted garments'] },
      { name: "Myrthill Market Glade", type: 'Market', owner: 'Trade Elder Sylvin',
        description: 'Trade hub for exotic wares flowing in from beyond the rift.',
        sells: ['exotic goods', 'herbs', 'crafts', 'wine'] },
      { name: "The Rift Observatory", type: 'Observatory', owner: 'Astrologer Sorel Dawn',
        description: 'A high rift-top observatory for reading celestial signs above the treeline. Famous for predicting the Rift Storm of the second age.',
        services: ['star chart reading', 'celestial consultation'] },
      { name: "The Druid Glade of the Rift", type: 'Druid Grove', owner: 'Druid Elder Sylvin',
        description: 'An ancient sacred clearing where rift druids commune with the natural forces of the southwestern lands.',
        services: ['nature blessing', 'druidic rites', 'herb consecration'] },
    ]
  },

  'Aurelwyn': { type: 'City', kingdom: 'Sivanrift', establishments: [
    { name: "The Golden Leaf Inn", type: 'Inn', owner: 'Aurel Wyn', description: 'Named for the golden-leafed trees.', sells: ['lodging', 'wine'] },
    { name: "Aurelwyn Apothecary", type: 'Apothecary', owner: 'Fae Petal', description: 'Flower-based remedies.', sells: ['potions', 'herbs'] },
    { name: "The Leaf & Loom", type: 'Weaver', owner: 'Lyra Cloth', description: 'Local weaving cooperative.', sells: ['cloth', 'clothing'] },
    { name: "The Golden Grove", type: 'Druid Grove', owner: 'Druid Elder Sylvin Petal',
      description: 'A grove of golden-leafed elder trees sacred to the rift druids. Open to respectful visitors during daylight.',
      services: ['nature blessing', 'seasonal rites', 'herb consultation'] },
    { name: "Aurelwyn Silversmith", type: 'Silversmith', owner: 'Aria Brightleaf',
      description: 'Elven silverwork inspired by leaf patterns. Produces jewellery and decorative pieces for the rift nobility.',
      sells: ['silver jewellery', 'leaf-pattern silverware'], services: ['commission', 'engraving'] },
  ]},

  'Talandras': { type: 'City', kingdom: 'Sivanrift', establishments: [
    { name: "The Stone Rift Tavern", type: 'Tavern', owner: 'Talan Cross', description: 'Built into the rift rock face.', sells: ['wine', 'meals'] },
    { name: "Talandras Smithy", type: 'Blacksmith', owner: 'Dren Spark', description: 'Rift-stone enhanced metalwork.', sells: ['weapons', 'tools'], services: ['repair'] },
    { name: "The Rift Stable", type: 'Stable', owner: 'Stablemaster Vel Roan',
      description: 'Stabling carved into the rift rock face. Cool in summer, sheltered in winter.',
      sells: ['horse hire'], services: ['boarding', 'farrier'] },
    { name: "Talandras Rune Crafter", type: 'Rune Crafter', owner: 'Runewright Daelindir',
      description: 'Elven rune carvings using rift-stone. Specialises in protective door and weapon runes.',
      sells: ['rune-inscribed items'], services: ['rune commission', 'inscription'] },
    { name: "Rift Stone Potter", type: 'Potter', owner: 'Celiveth Clay',
      description: 'Uses rift clay to produce ceramics with a distinctive red-grey marbling.',
      sells: ['pottery', 'rift-clay ceramics'] },
  ]},

  'Velendar': { type: 'City', kingdom: 'Sivanrift', establishments: [
    { name: "The Velvet Canopy", type: 'Inn', owner: 'Vel Endara', description: 'Luxurious canopy-draped inn.', sells: ['lodging', 'fine meals'] },
    { name: "Velendar Market", type: 'Market', owner: 'Elder Vend', description: 'Regional trade market.', sells: ['herbs', 'crafts', 'wine'] },
    { name: "The Velendar Playhouse", type: 'Theatre', owner: 'Director Galathiel',
      description: 'Elven canopy theatre where travelling performers and local bards stage seasonal productions.',
      sells: ['tickets'], services: ['performance hire', 'rehearsal space'] },
    { name: "Velendar Adventurers Post", type: 'Adventurers Guild', owner: 'Guildmaster Vaelindra',
      description: 'Fellowship outpost handling rift ruin delving contracts and regional exploration commissions.',
      services: ['contract board', 'expedition membership', 'rift guide hire'] },
  ]},

  'Iriandel': { type: 'City', kingdom: 'Sivanrift', establishments: [
    { name: "The Iris Inn", type: 'Inn', owner: 'Iri Andel', description: 'Iris flowers decorate every room.', sells: ['lodging', 'meals'] },
    { name: "Iriandel Alchemist", type: 'Alchemist', owner: 'Del Vial', description: 'Iris-infused potions and perfumes.', sells: ['potions', 'perfumes'] },
    { name: "Iris Grove", type: 'Druid Grove', owner: 'Druid Galiveth',
      description: 'A druidic grove centred around the famous iris meadow the city is named for.',
      services: ['nature blessing', 'flower herb consultation', 'seasonal rites'] },
    { name: "Iriandel Barber", type: 'Barber', owner: 'Nila Fine',
      description: 'Elven barber offering precise grooming and flower-oil hair treatments.',
      services: ['haircut', 'grooming', 'flower-oil treatment'] },
  ]},

  'Willowfen': { type: 'Village', kingdom: 'Sivanrift', establishments: [
    { name: "The Willow Rest", type: 'Tavern', owner: 'Fen Willow', description: 'Beside the weeping willows.', sells: ['wine', 'meals'] },
  ]},

  'Duskwatch': { type: 'Village', kingdom: 'Sivanrift', establishments: [
    { name: "The Dusk Lantern", type: 'Tavern', owner: 'Watch Dusk', description: 'Lit at dusk, closed by dawn.', sells: ['wine', 'meals'] },
    { name: "Duskwatch Store", type: 'General Store', owner: 'Fen Dusk', description: 'Night-shift provisions.', sells: ['food', 'torches'] },
  ]},

  "Elowen's Field": { type: 'Village', kingdom: 'Sivanrift', establishments: [
    { name: "The Field Hearth", type: 'Tavern', owner: 'Elowen Field', description: 'A warm hearthside tavern.', sells: ['wine', 'meals'] },
    { name: "Elowen's Farm", type: 'Farm Supply', owner: 'Syl Field', description: 'Herb seeds and farming supplies.', sells: ['seeds', 'tools'] },
  ]},

  'Halorin Cross': { type: 'Village', kingdom: 'Sivanrift', establishments: [
    { name: "The Crossroads Glade", type: 'Tavern', owner: 'Hal Cross', description: 'Junction tavern on the rift road.', sells: ['wine', 'meals'] },
  ]},

  'Rivensong': { type: 'Village', kingdom: 'Sivanrift', establishments: [
    { name: "The Song & River", type: 'Tavern', owner: 'Riven Song', description: 'Music plays here every evening.', sells: ['wine', 'meals'] },
    { name: "Rivensong Fisher", type: 'Fisher', owner: 'Net Riven', description: 'River fishing with song.', sells: ['fish'] },
  ]},

  // ══════════════════════════════════════════
  //  NARADRETH  (Elf — Eastern coast)
  // ══════════════════════════════════════════

  "Velra'syl": {
    type: 'CapitalCity', kingdom: 'Naradreth',
    establishments: [
      { name: "The Tidal Spire Inn", type: 'Inn', owner: 'Vel Rasyl',
        description: 'Coastal elven inn built on stilts over the eastern sea.',
        sells: ['lodging', 'seafood', 'wine'] },
      { name: "The Pearl Market", type: 'Market', owner: 'Elder Ilrae',
        description: 'Eastern coastal market — sea pearls and deep-sea goods.',
        sells: ['pearls', 'seafood', 'sea herbs', 'crafts'] },
      { name: "Velra Tide Forge", type: 'Blacksmith', owner: 'Ilden Forge',
        description: 'Seawater-cooled blades with a distinctive salt-blue sheen.',
        sells: ['weapons', 'armor'], services: ['repair', 'commission'] },
      { name: "The Sea-Herb Apothecary", type: 'Apothecary', owner: 'Nira Tide',
        description: 'Coastal elven remedies using sea plants and minerals.',
        sells: ['potions', 'herbs'] },
      { name: "Eastern Star Library", type: 'Library', owner: 'Archivist Vael',
        description: 'Star charts and eastern navigation archives.',
        sells: ['books', 'maps', 'star charts'] },
      { name: "Naradreth Temple of Tides", type: 'Temple', owner: 'High Priest Seralyn',
        description: 'Tidal temple where the sea enters at high tide — an elven sacred place.',
        services: ['sea blessing', 'healing', 'divination'] },
      { name: "The Tidal Stable", type: 'Stable', owner: 'Stablemaster Vel',
        description: 'Stabling on the coastal road for those arriving by land rather than sea.',
        sells: ['horse hire'], services: ['boarding', 'farrier'] },
      { name: "The Pearl Antiquarian", type: 'Antiquarian', owner: 'Ilrae Dustbind',
        description: 'Premier dealer in coastal elven relics, tidal artefacts, and deep-sea curiosities.',
        buys: ['sea relics', 'tidal artefacts', 'ancient coins'], sells: ['authenticated relics', 'sea curios'],
        services: ['appraisal', 'authentication'] },
      { name: "Velra'syl Shipyard", type: 'Shipyard', owner: 'Master Shipwright Vaelthen',
        description: 'Elven shipyard building slender ocean-going vessels. The ships are faster than anything else on the eastern sea.',
        services: ['ship construction', 'ship repair', 'sailmaking', 'commission'] },
      { name: "The Naradreth Ranger Post", type: 'Ranger Post', owner: 'Ranger Captain Caelveth',
        description: 'Coastal ranger station monitoring threats along the eastern shore and cliff approaches.',
        services: ['coastal patrol contracts', 'cliff guidance', 'threat reports'] },
    ]
  },

  'Ilryndor': { type: 'City', kingdom: 'Naradreth', establishments: [
    { name: "The Eastern Gale", type: 'Tavern', owner: 'Ilryn Door', description: 'Coastal elven tavern.', sells: ['wine', 'seafood'] },
    { name: "Ilryndor Fisher", type: 'Fisher', owner: 'Dor Net', description: 'Deep-sea catch.', sells: ['fish', 'sea goods'] },
    { name: "Ilryndor Shipyard", type: 'Shipyard', owner: 'Shipwright Vaelindor',
      description: 'Elven shipyard constructing slender coastal vessels and deep-sea fishing boats.',
      services: ['ship construction', 'ship repair', 'sailmaking'] },
    { name: "The Tide Stable", type: 'Stable', owner: 'Stablemaster Sael',
      description: 'Coastal stabling for those arriving by road rather than sea.',
      sells: ['horse hire'], services: ['boarding', 'farrier'] },
    { name: "The Sea Glass Antiquarian", type: 'Antiquarian', owner: 'Ilrae Dustbind',
      description: 'Deals in sea-salvaged relics, coastal elven artefacts, and tidal treasure. Always buying interesting finds.',
      buys: ['sea relics', 'coastal artefacts'], sells: ['sea curios', 'salvaged relics'],
      services: ['appraisal'] },
  ]},

  "Draes'ythil": { type: 'City', kingdom: 'Naradreth', establishments: [
    { name: "The Ythil Rest", type: 'Inn', owner: 'Drae Sythil', description: 'Coastal inn with sea-glass windows.', sells: ['lodging', 'meals'] },
    { name: "Draes Market", type: 'Market', owner: 'Elder Draes', description: 'Eastern trade market.', sells: ['sea goods', 'crafts'] },
    { name: "The Draes Barber", type: 'Barber', owner: 'Nira Salt',
      description: 'Maritime barber serving sailors and coastal travellers. Also treats saltwater wounds.',
      services: ['haircut', 'shave', 'wound dressing'] },
    { name: "Draes Cooper", type: 'Cooper', owner: 'Syl Hoop',
      description: 'Makes watertight barrels and casks for coastal traders and fishing vessels.',
      sells: ['barrels', 'watertight casks', 'brine tubs'] },
  ]},

  "Tiryll's Hollow": { type: 'Village', kingdom: 'Naradreth', establishments: [
    { name: "Hollow Sea", type: 'Tavern', owner: 'Tir Yll', description: 'Simple coastal village tavern.', sells: ['wine', 'meals'] },
  ]},

  "Mythren's Gate": { type: 'Village', kingdom: 'Naradreth', establishments: [
    { name: "The Gate Rest", type: 'Inn', owner: 'Mythren Gate', description: 'Village inn at the old elven gate.', sells: ['lodging', 'meals'] },
    { name: "Gate Herbalist", type: 'Herbalist', owner: 'Ren Myrth', description: 'Coastal elven herbs.', sells: ['herbs'] },
  ]},

  'Vaerlyn Reach': { type: 'Village', kingdom: 'Naradreth', establishments: [
    { name: "The Reach Tavern", type: 'Tavern', owner: 'Vaer Lyn', description: 'On the cliff\'s reach, looking east.', sells: ['wine', 'seafood'] },
  ]},

  // ══════════════════════════════════════════
  //  FELDARÚN  (Dwarf — Central mountainous)
  // ══════════════════════════════════════════

  'Khúralgron': {
    type: 'CapitalCity', kingdom: 'Feldarún',
    establishments: [
      { name: "The Deep Hearth", type: 'Inn', owner: 'Thurda Hearthstone',
        description: 'Carved entirely from mountain granite — the warmest place in Feldarún.',
        sells: ['lodging', 'dwarven meals', 'ale'] },
      { name: "The Forge King's Arms", type: 'Tavern', owner: 'Bruldar Keg',
        description: 'Enormous underground tavern where forge workers drink after shifts.',
        sells: ['dwarf ale', 'stout', 'hearty meals'] },
      { name: "The Grand Deep Forge", type: 'Blacksmith', owner: 'Forgemeister Duldrak',
        description: 'Dwarven masterwork — the finest weapons and armour on the continent.',
        buys: ['ore', 'metal', 'gems'], sells: ['master weapons', 'master armor'], services: ['master commission', 'repair', 'enchanting'] },
      { name: "The Gem Exchange", type: 'Merchant', owner: 'Gildreth Goldvein',
        description: 'Appraises and trades in gems, precious metals, and ores.',
        buys: ['gems', 'ore', 'precious metals'], sells: ['gems', 'jewelry'], services: ['appraisal', 'currency exchange'] },
      { name: "Deep Mine Office", type: 'Miner', owner: 'Mine Warden Thrak',
        description: 'Mining permits, ore assay, and mine shaft access.',
        buys: ['ore', 'raw gems'], sells: ['mining tools', 'permits'], services: ['assay', 'mine contracts'] },
      { name: "Dwarven Archive Vault", type: 'Library', owner: 'Keeper Grundar',
        description: 'Stone-tablet archives of all dwarven history.',
        sells: ['books', 'maps'], services: ['research', 'genealogy'] },
      { name: "The Stonemason's Hall", type: 'Mason', owner: 'Guildmaster Keldrak',
        description: 'Finest stonecutters on the continent — mountain architecture.',
        sells: ['stone', 'carved stone'], services: ['construction', 'tunnel carving'] },
      { name: "Mountain Temple of the Forge", type: 'Temple', owner: 'High Priest Dorrin',
        description: 'Dwarven temple where the forge is sacred.',
        services: ['blessing', 'forge rites', 'healing'] },
      { name: "Khúralgron Barracks", type: 'Barracks', owner: 'Commander Vurdak',
        description: 'Mountain guard and bounty board for Feldarún.',
        services: ['bounty board', 'guard hire', 'mine protection'] },
      { name: "The Brewmaster's Hall", type: 'Brewer', owner: 'Brewer Thordak',
        description: 'Dwarven ales brewed from mountain spring water.',
        sells: ['dwarf ale', 'stout', 'dark beer'] },
      { name: "Deep Tanner", type: 'Tanner', owner: 'Leather Krak',
        description: 'Processes mountain beast hides for dwarven armour.',
        sells: ['leather', 'leather armor'] },
      { name: "Feldarún Market Hall", type: 'Market', owner: 'Market Master Brin',
        description: 'Underground market hall lit by glowing crystals.',
        sells: ['general goods', 'gems', 'metals', 'food'] },
      { name: "The Runewright's Hall", type: 'Rune Crafter', owner: 'Grand Runewright Duldrik',
        description: 'The foremost rune crafting facility on the continent. Inscribes weapons, armour, and structural stonework with dwarven runes of power.',
        sells: ['rune-inscribed weapons', 'rune-inscribed armor'],
        services: ['rune commission', 'inscription certification', 'identify'] },
      { name: "The Silver Hammer", type: 'Silversmith', owner: 'Silvermaster Keldra Brightwork',
        description: 'Dwarven silversmithing of the highest order — ceremonial pieces, fine jewellery, and ritual silverware.',
        sells: ['silver jewellery', 'silverware', 'ceremonial items'], services: ['commission', 'repair', 'engraving'] },
      { name: "The Gem Cutter's Hall", type: 'Gem Cutter', owner: 'Gem Cutter Thordrik',
        description: 'Master gem cutting from raw stones to finished jewels. The finest precision work in Feldarún.',
        buys: ['rough gems'], sells: ['cut gems', 'polished stones'], services: ['gem appraisal', 'custom cutting'] },
      { name: "The Deep Stable", type: 'Stable', owner: 'Stablemaster Gorva Brock',
        description: 'Dwarven mountain stabling for pack animals and mules used in mine transport and mountain trade.',
        sells: ['mule hire'], services: ['boarding', 'farrier'] },
      { name: "The Khúralgron Gaol", type: 'Prison', owner: 'Chief Jailer Ulvach Stone',
        description: 'Deep mountain cells carved into bedrock. The most secure cells in all of Feldarún.',
        services: ['bail processing', 'prisoner visit'] },
    ]
  },

  'Darakthul': { type: 'City', kingdom: 'Feldarún', establishments: [
    { name: "The Hammer & Helm", type: 'Tavern', owner: 'Darak Hul', description: 'Dwarven mining city tavern.', sells: ['ale', 'meals'] },
    { name: "Darakthul Forge", type: 'Blacksmith', owner: 'Thul Spark', description: 'Mining and construction metalwork.', sells: ['tools', 'mining equipment'], services: ['repair'] },
    { name: "Deep Vein Assay", type: 'Miner', owner: 'Ore Warden Drak', description: 'Ore buying and mining supplies.', buys: ['ore', 'gems'], sells: ['mining tools'] },
    { name: "The Stone Inn", type: 'Inn', owner: 'Bren Stone', description: 'Carved-stone dwarven lodging.', sells: ['lodging', 'meals'] },
    { name: "The Deep Rune Hall", type: 'Rune Crafter', owner: 'Runewright Caidhal',
      description: 'Dwarven rune inscriptions for mining equipment, tunnel supports, and weapons.',
      sells: ['rune-inscribed tools', 'rune-inscribed armor'], services: ['rune commission', 'tunnel ward inscriptions'] },
    { name: "The Gem Bench", type: 'Gem Cutter', owner: 'Gem Cutter Dervach',
      description: 'Cuts raw ore gems from the local mines into tradeable finished stones.',
      buys: ['rough gems'], sells: ['cut gems'], services: ['gem appraisal'] },
    { name: "Darakthul Gaol", type: 'Prison', owner: 'Jailer Brochan Bars',
      description: 'Rock-walled cells in the mining district. Mine saboteurs and claim jumpers end up here.',
      services: ['bail processing', 'prisoner visit'] },
    { name: "Darakthul Chandler", type: 'Chandler', owner: 'Gorva Tallow',
      description: 'Supplies mine-rated tallow candles and oil lanterns. Essential for underground work.',
      sells: ['mine candles', 'tallow lamps', 'lamp oil'] },
  ]},

  'Brondrak Kazel': { type: 'City', kingdom: 'Feldarún', establishments: [
    { name: "The Kazel Arms", type: 'Tavern', owner: 'Kaz Brondrak', description: 'Mountain pass tavern.', sells: ['ale', 'meals'] },
    { name: "Pass Forge", type: 'Blacksmith', owner: 'Bron Drak', description: 'Pass-route smithy.', sells: ['tools', 'weapons'], services: ['repair'] },
    { name: "The Pass Stable", type: 'Stable', owner: 'Stablemaster Nuldach',
      description: 'Essential stabling at the mountain pass. Mules and horses rested and shod before the climb.',
      sells: ['mule hire', 'horse hire'], services: ['boarding', 'farrier', 'cold-weather tack'] },
    { name: "The Pass Gaol", type: 'Prison', owner: 'Jailer Corrach Wall',
      description: 'Small holding cells for smugglers and bandits caught on the mountain pass route.',
      services: ['bail processing', 'prisoner visit'] },
    { name: "Kazel Saddler", type: 'Saddler', owner: 'Halvach Strap',
      description: 'Mountain-grade saddles and pack harnesses for the pass route. Specialises in cold-weather tack.',
      buys: ['leather'], sells: ['mountain saddles', 'pack harnesses', 'cold-weather bridles'], services: ['repair'] },
  ]},

  'Vurndrim': { type: 'City', kingdom: 'Feldarún', establishments: [
    { name: "The Rim Hearth", type: 'Inn', owner: 'Vurn Drim', description: 'Deep mountain inn.', sells: ['lodging', 'meals'] },
    { name: "Vurndrim Crystal Exchange", type: 'Merchant', owner: 'Gem Vurn', description: 'Crystal and gem trading.', buys: ['gems', 'crystals'], sells: ['gems', 'crystals'] },
    { name: "The Crystal Bench", type: 'Gem Cutter', owner: 'Gem Cutter Lorvach',
      description: 'Cuts and facets the famous Vurndrim crystals. Some say the cut affects the crystals\' resonance.',
      buys: ['rough crystals', 'rough gems'], sells: ['cut crystals', 'faceted gems'], services: ['gem appraisal'] },
    { name: "Vurndrim Rune Crafter", type: 'Rune Crafter', owner: 'Runewright Sindach',
      description: 'Rune carvings using crystal-inlaid tools. Specialises in light runes for underground illumination.',
      sells: ['crystal rune-stones', 'light runes'], services: ['rune commission', 'light rune inscription'] },
    { name: "The Deep Chandler", type: 'Chandler', owner: 'Morva Wax',
      description: 'Crystal-enhanced candles that burn longer and brighter. A Vurndrim speciality.',
      sells: ['crystal candles', 'long-burn tallow', 'lamp oil'] },
  ]},

  'Tharnhold': { type: 'City', kingdom: 'Feldarún', establishments: [
    { name: "The Hold Barrel", type: 'Tavern', owner: 'Tharn Hold', description: 'Near the mountain hold gates.', sells: ['ale', 'meals'] },
    { name: "Tharnhold Apothecary", type: 'Apothecary', owner: 'Mosra Herb', description: 'Mountain herb remedies.', sells: ['potions', 'herbs'] },
    { name: "The Hold Stable", type: 'Stable', owner: 'Stablemaster Grannoch',
      description: 'Stabling next to the hold gates. Travellers stable here before entering the mountain hold.',
      sells: ['mule hire'], services: ['boarding', 'farrier'] },
    { name: "Tharnhold Cooper", type: 'Cooper', owner: 'Furnach Hoop',
      description: 'Makes barrels for the hold\'s ale production and storage casks for the mine supply chain.',
      sells: ['barrels', 'mine storage casks', 'tubs'] },
    { name: "The Hold Gaol", type: 'Prison', owner: 'Jailer Kordach Stone',
      description: 'Cells carved into the hold gatehouse. Holds those who cause trouble at the mountain entrance.',
      services: ['bail processing', 'prisoner visit'] },
  ]},

  'Stonebraith': { type: 'Village', kingdom: 'Feldarún', establishments: [
    { name: "The Braith Stone", type: 'Tavern', owner: 'Stone Braith', description: 'Village tavern cut from one piece of rock.', sells: ['ale', 'meals'] },
    { name: "Stonebraith Store", type: 'General Store', owner: 'Grub Brin', description: 'Basic mountain provisions.', sells: ['food', 'tools'] },
  ]},

  "Molgrin's Deep": { type: 'Village', kingdom: 'Feldarún', establishments: [
    { name: "The Deep Tap", type: 'Tavern', owner: 'Molgrin Deep', description: 'Underground village tavern.', sells: ['ale', 'meals'] },
  ]},

  'Emberstead': { type: 'Village', kingdom: 'Feldarún', establishments: [
    { name: "The Ember Inn", type: 'Inn', owner: 'Stead Ember', description: 'Glowing ember-lit inn.', sells: ['lodging', 'meals'] },
    { name: "Emberstead Forge", type: 'Blacksmith', owner: 'Coal Stead', description: 'Basic smithy near the ember veins.', sells: ['tools'], services: ['repair'] },
  ]},

  'Grummveir': { type: 'Village', kingdom: 'Feldarún', establishments: [
    { name: "The Grumm Barrel", type: 'Tavern', owner: 'Grumm Veir', description: 'Typical dwarven village alehouse.', sells: ['ale', 'meals'] },
  ]},

  'Kaerbryn Hollow': { type: 'Village', kingdom: 'Feldarún', establishments: [
    { name: "The Hollow Flask", type: 'Tavern', owner: 'Kaer Bryn', description: 'Village tavern in the hollow.', sells: ['ale', 'meals'] },
    { name: "Kaerbryn Herbalist", type: 'Herbalist', owner: 'Mosra Root', description: 'Mountain herbs from the hollow.', sells: ['herbs'] },
  ]},

  // ══════════════════════════════════════════
  //  WISTRAVAEL  (Dwarf — Northern)
  // ══════════════════════════════════════════

  'Durkendal': {
    type: 'CapitalCity', kingdom: 'Wistravael',
    establishments: [
      { name: "The Northern Keep Tavern", type: 'Tavern', owner: 'Durk Endal',
        description: 'Vast dwarven tavern inside the mountain keep.',
        sells: ['stout', 'ale', 'hearty meals'] },
      { name: "Durkendal Grand Forge", type: 'Blacksmith', owner: 'Forgemeister Vordak',
        description: 'Cold-iron dwarven smithing — northern quality.',
        sells: ['weapons', 'armor', 'tools'], services: ['commission', 'repair'] },
      { name: "The Stone Library", type: 'Library', owner: 'Keeper Theld',
        description: 'Northern dwarven history carved into stone panels.',
        sells: ['books', 'maps'] },
      { name: "Wistravael Market Hall", type: 'Market', owner: 'Market Master Brak',
        description: 'Northern trading hall lit by fire crystals.',
        sells: ['general goods', 'metals', 'gems'] },
      { name: "Durkendal Temple", type: 'Temple', owner: 'High Priest Durra',
        description: 'Northern dwarven temple honoring mountain ancestors.',
        services: ['healing', 'blessing', 'burial rites'] },
      { name: "Northern Watch Barracks", type: 'Barracks', owner: 'Commander Kreig',
        description: 'Northern defence and bounty board.',
        services: ['bounty board', 'guard hire'] },
      { name: "Wistravael Gem Office", type: 'Miner', owner: 'Warden Thrak',
        description: 'Northern gem and ore exchange.',
        buys: ['ore', 'gems'], sells: ['mining tools', 'gems'] },
      { name: "The Durkendal Rune Hall", type: 'Rune Crafter', owner: 'Grand Runewright Halvach',
        description: 'Northern dwarven rune hall specialising in cold-iron weapon runes and frost-ward inscriptions.',
        sells: ['rune-inscribed weapons', 'frost-ward stones'], services: ['rune commission', 'frost-ward inscription'] },
      { name: "The Durkendal Adventurers Post", type: 'Adventurers Guild', owner: 'Guildmaster Vorrath',
        description: 'Northern fellowship chapter. Posts bounties on frost giants, trolls, and deep-mountain threats.',
        services: ['contract board', 'expedition membership', 'northern threat board'] },
      { name: "The Northern Gaol", type: 'Prison', owner: 'Chief Jailer Sindach Bars',
        description: 'Deep northern cells. Cold-iron doors. Escape is inadvisable for reasons beyond the locks.',
        services: ['bail processing', 'prisoner visit'] },
    ]
  },

  'Tharnvyr': { type: 'City', kingdom: 'Wistravael', establishments: [
    { name: "The Vyr Hearth", type: 'Inn', owner: 'Tharn Vyr', description: 'Cold-weather lodge.', sells: ['lodging', 'meals'] },
    { name: "Tharnvyr Smithy", type: 'Blacksmith', owner: 'Vyr Forge', description: 'Northern metalwork.', sells: ['tools', 'weapons'], services: ['repair'] },
    { name: "The Vyr Stable", type: 'Stable', owner: 'Stablemaster Keldach',
      description: 'Heavily insulated stabling in the northern hills. Specialises in cold-hardy mounts.',
      sells: ['horse hire'], services: ['boarding', 'farrier', 'cold-weather tack'] },
    { name: "Tharnvyr Barber", type: 'Barber', owner: 'Silda Trim',
      description: 'Dwarven barber known for beard braiding and cold-weather skin treatments.',
      services: ['haircut', 'beard braiding', 'shave', 'skin treatment'] },
    { name: "Tharnvyr Chandler", type: 'Chandler', owner: 'Orva Tallow',
      description: 'Cold-weather candles and oil lamps rated for northern winters.',
      sells: ['cold-weather candles', 'lamp oil', 'lanterns'] },
  ]},

  'Vordrun Keep': { type: 'City', kingdom: 'Wistravael', establishments: [
    { name: "The Keep Alehouse", type: 'Tavern', owner: 'Vordrun Keep', description: 'Keep-side tavern.', sells: ['ale', 'meals'] },
    { name: "Keep Armory", type: 'Blacksmith', owner: 'Ord Run', description: 'Military-grade northern arms.', sells: ['weapons', 'armor'], services: ['repair'] },
    { name: "The Keep Gaol", type: 'Prison', owner: 'Jailer Corrach Bars',
      description: 'Military holding cells inside the keep wall. Prisoners of the northern campaigns are held here.',
      services: ['bail processing', 'prisoner visit'] },
    { name: "The Keep Stable", type: 'Stable', owner: 'Stablemaster Brochan',
      description: 'Military stabling for the keep garrison. Civilian horse boarding available in the outer yard.',
      sells: ['horse hire'], services: ['boarding', 'farrier'] },
    { name: "Vordrun Saddler", type: 'Saddler', owner: 'Halvra Strap',
      description: 'Military-grade saddles and cold-weather horse equipment for the northern keep garrison.',
      buys: ['leather'], sells: ['military saddles', 'cold-weather tack'], services: ['repair', 'armour strap work'] },
  ]},

  'Stonewake': { type: 'City', kingdom: 'Wistravael', establishments: [
    { name: "The Wakestone Inn", type: 'Inn', owner: 'Stone Wake', description: 'Mountain wake lodge.', sells: ['lodging', 'meals'] },
    { name: "Stonewake Apothecary", type: 'Apothecary', owner: 'Herb Wake', description: 'Northern remedies.', sells: ['potions', 'herbs'] },
    { name: "The Stone Rune Hall", type: 'Rune Crafter', owner: 'Runewright Darnoch',
      description: 'Ancient dwarven rune tradition practised here since the founding of Wistravael. Specialises in stone-ward and earth-bind runes.',
      sells: ['rune-inscribed items'], services: ['rune commission', 'earth-ward inscription'] },
    { name: "Stonewake Ranger Post", type: 'Ranger Post', owner: 'Ranger Caldach',
      description: 'Northern ranger post monitoring threats in the surrounding mountain terrain.',
      services: ['scouting contracts', 'mountain guidance', 'monster reports'] },
    { name: "Stonewake Adventurers Post", type: 'Adventurers Guild', owner: 'Guildmaster Ulva',
      description: 'Fellowship outpost for northern ruin exploration and mountain creature bounties.',
      services: ['contract board', 'expedition membership'] },
  ]},

  'Kragmire Hold': { type: 'City', kingdom: 'Wistravael', establishments: [
    { name: "The Mire Hold", type: 'Tavern', owner: 'Krag Mire', description: 'Northern mire-side tavern.', sells: ['stout', 'meals'] },
    { name: "Kragmire Tanner", type: 'Tanner', owner: 'Hide Krag', description: 'Northern beast leather working.', sells: ['leather', 'furs'] },
    { name: "The Mire Stable", type: 'Stable', owner: 'Stablemaster Ranna',
      description: 'Stabling for travellers crossing the mire. Bog-resistant hoof care available.',
      sells: ['horse hire'], services: ['boarding', 'farrier', 'bog tack'] },
    { name: "Mire Cooper", type: 'Cooper', owner: 'Tordha Hoop',
      description: 'Produces waterproofed barrels for mire-area trade and peat storage.',
      sells: ['waterproofed barrels', 'peat casks', 'buckets'] },
  ]},

  'Flinthollow': { type: 'Village', kingdom: 'Wistravael', establishments: [
    { name: "The Flint & Flask", type: 'Tavern', owner: 'Flint Hollow', description: 'Sparks literally fly near the forge next door.', sells: ['ale', 'meals'] },
    { name: "Flinthollow Smithy", type: 'Blacksmith', owner: 'Spark Flin', description: 'Flint-sparked forge.', sells: ['tools'], services: ['repair'] },
  ]},

  'Silverdeep': { type: 'Village', kingdom: 'Wistravael', establishments: [
    { name: "The Silver Tap", type: 'Tavern', owner: 'Deep Silver', description: 'Near the silver veins.', sells: ['ale', 'meals'] },
    { name: "Silverdeep Assay", type: 'Miner', owner: 'Vein Ward', description: 'Buys silver ore and sells mining tools.', buys: ['silver ore'], sells: ['mining tools'] },
  ]},

  "Bramgar's Rest": { type: 'Village', kingdom: 'Wistravael', establishments: [
    { name: "Bramgar's Alehouse", type: 'Tavern', owner: 'Bramgar Rest', description: 'Named for a legendary dwarven hero.', sells: ['ale', 'meals'] },
  ]},

  'Hearthglen': { type: 'Village', kingdom: 'Wistravael', establishments: [
    { name: "The Glen Hearth", type: 'Inn', owner: 'Hearth Glen', description: 'Warm northern inn.', sells: ['lodging', 'meals'] },
    { name: "Hearthglen Store", type: 'General Store', owner: 'Glen Stock', description: 'Northern provisions.', sells: ['food', 'tools', 'furs'] },
  ]},

  'Wyrshade': { type: 'Village', kingdom: 'Wistravael', establishments: [
    { name: "The Shade Barrel", type: 'Tavern', owner: 'Wyr Shade', description: 'Under perpetual mountain shadow.', sells: ['ale', 'meals'] },
  ]},

  // ══════════════════════════════════════════
  //  ORINDROTH  (Elf — Central forest)
  // ══════════════════════════════════════════

  'Elarien': {
    type: 'CapitalCity', kingdom: 'Orindroth',
    establishments: [
      { name: "The Heartwood Inn", type: 'Inn', owner: 'Elar Ien',
        description: 'An inn grown inside a living elder tree.',
        sells: ['lodging', 'forest meals', 'herbal tea'] },
      { name: "The Deep Wood Market", type: 'Market', owner: 'Elder Oryn',
        description: 'Forest market where goods are traded for favours as often as gold.',
        sells: ['herbs', 'crafts', 'wood goods', 'food'] },
      { name: "Forest Forge", type: 'Blacksmith', owner: 'Dren Ember',
        description: 'Elven smithing using forest-iron and green flame.',
        sells: ['weapons', 'tools'], services: ['repair', 'commission'] },
      { name: "The Herbalist's Grove", type: 'Herbalist', owner: 'Nira Grove',
        description: 'The most extensive herb collection in the central forest.',
        buys: ['herbs'], sells: ['all herbs', 'seeds', 'remedies'] },
      { name: "Elarien Mage Spire", type: 'Mage Tower', owner: 'Arch-Mage Elithos',
        description: 'Nature and blood magic research spire.',
        sells: ['scrolls', 'spell components'], services: ['magic tuition', 'identify'] },
      { name: "Temple of the Ancient Forest", type: 'Temple', owner: 'High Priest Orindra',
        description: 'Ancient forest temple tended by druids.',
        services: ['healing', 'nature communion', 'blessing'] },
      { name: "Orindroth Watch Post", type: 'Barracks', owner: 'Captain Sylvin',
        description: 'Forest ranger station and bounty board.',
        services: ['bounty board', 'ranger hire'] },
      { name: "The Elder Circle Grove", type: 'Druid Grove', owner: 'Arch-Druid Orindra',
        description: 'Sacred druidic grove at the heart of the forest capital. Druids of all traditions gather here.',
        services: ['nature blessing', 'druidic communion', 'seasonal rites', 'herb blessing'] },
      { name: "The Woodland Ranger Outpost", type: 'Ranger Post', owner: 'Ranger Captain Vaelindor',
        description: 'Orindroth ranger headquarters. Manages forest patrol contracts and monster tracking in the central forest.',
        services: ['forest patrol contracts', 'wilderness guidance', 'monster bounty board'] },
      { name: "The Pathfinder's Rest", type: 'Adventurers Guild', owner: 'Guildmaster Nira Fallow',
        description: 'A chapter of the Adventurers\' Fellowship specialising in forest exploration and ruin delving.',
        services: ['contract board', 'expedition membership', 'forest guide hire'] },
    ]
  },

  'Valorin': { type: 'City', kingdom: 'Orindroth', establishments: [
    { name: "The Valor Inn", type: 'Inn', owner: 'Val Orin', description: 'Forest city inn.', sells: ['lodging', 'meals'] },
    { name: "Valorin Herbalist", type: 'Herbalist', owner: 'Herb Val', description: 'Central forest herbs.', sells: ['herbs'] },
    { name: "The Valorin Grove", type: 'Druid Grove', owner: 'Druid Orindel',
      description: 'A druid grove maintained as a waypoint for travellers through the central forest.',
      services: ['nature blessing', 'herb consultation', 'forest guidance'] },
    { name: "Valorin Ranger Post", type: 'Ranger Post', owner: 'Ranger Elarindor',
      description: 'Forest ranger station monitoring the central forest for threats and trail conditions.',
      services: ['scouting contracts', 'trail guidance', 'forest threat reports'] },
    { name: "Valorin Adventurers Post", type: 'Adventurers Guild', owner: 'Guildmaster Silandor',
      description: 'Forest ruin delving contracts and exploration commissions for the central Orindroth region.',
      services: ['contract board', 'expedition membership', 'forest guide hire'] },
  ]},

  'Ilietha': { type: 'City', kingdom: 'Orindroth', establishments: [
    { name: "The Ietha Canopy", type: 'Tavern', owner: 'Ili Etha', description: 'Canopy-level tavern.', sells: ['wine', 'meals'] },
    { name: "Ilietha Apothecary", type: 'Apothecary', owner: 'Etha Herb', description: 'Forest remedies.', sells: ['potions', 'herbs'] },
    { name: "The Canopy Silversmith", type: 'Silversmith', owner: 'Thalindra Brightwork',
      description: 'Elven silverwork using forest motifs — leaves, roots, and running water rendered in silver.',
      sells: ['silver jewellery', 'forest-pattern silverware'], services: ['commission', 'engraving'] },
    { name: "Ilietha Barber", type: 'Barber', owner: 'Luindor Fine',
      description: 'Elven barber specialising in long-hair braiding and forest-herb hair treatments.',
      services: ['haircut', 'braiding', 'herb hair treatment'] },
    { name: "The Canopy Mask Maker", type: 'Mask Maker', owner: 'Aelindra Craft',
      description: 'Ritual and festival masks carved from forest wood and decorated with natural dyes.',
      sells: ['ritual masks', 'festival masks', 'carved wooden masks'] },
  ]},

  'Tirelyn Reach': { type: 'City', kingdom: 'Orindroth', establishments: [
    { name: "The Reach Inn", type: 'Inn', owner: 'Tire Lyn', description: 'Deep forest city inn.', sells: ['lodging', 'meals'] },
    { name: "Tirelyn Market", type: 'Market', owner: 'Elder Tir', description: 'Forest trade market.', sells: ['herbs', 'crafts'] },
    { name: "Tirelyn Ranger Post", type: 'Ranger Post', owner: 'Ranger Faelindor',
      description: 'Deep forest ranger station at the far reach of Orindroth patrol routes.',
      services: ['scouting contracts', 'deep forest guidance', 'monster reports'] },
    { name: "The Reach Adventurers Post", type: 'Adventurers Guild', owner: 'Guildmaster Lunaveth',
      description: 'Deep forest fellowship outpost. Posts ruin access contracts for the most remote parts of Orindroth.',
      services: ['contract board', 'expedition membership', 'deep forest guide hire'] },
    { name: "Tirelyn Glassblower", type: 'Glassblower', owner: 'Oriliveth Clear',
      description: 'Elven glassblower using forest ash in the mix — produces glass with a distinctive green tint.',
      sells: ['green-tinted glass', 'glassware', 'vials'] },
  ]},

  "Norowynn's Veil": { type: 'City', kingdom: 'Orindroth', establishments: [
    { name: "The Veil Tavern", type: 'Tavern', owner: 'Noro Wynn', description: 'Behind the enchanted veil.', sells: ['wine', 'meals'] },
    { name: "The Veil Alchemist", type: 'Alchemist', owner: 'Wynn Vial', description: 'Veil-enchanted potions.', sells: ['potions'], services: ['identify'] },
    { name: "Norowynn Antiquarian", type: 'Antiquarian', owner: 'Silindra Verst',
      description: 'Specialises in veil-era relics and enchanted artefacts recovered from behind the enchanted veil.',
      buys: ['veil relics', 'enchanted artefacts'], sells: ['authenticated relics', 'veil curios'],
      services: ['appraisal', 'authentication', 'identify'] },
    { name: "The Veil Rune Crafter", type: 'Rune Crafter', owner: 'Runewright Naelindra',
      description: 'Rune inscriptions using veil-stone. Produces protective and concealment runes.',
      sells: ['veil-rune items'], services: ['rune commission', 'concealment inscription'] },
  ]},

  'Larethwyn': { type: 'Village', kingdom: 'Orindroth', establishments: [
    { name: "The Lare Tree", type: 'Tavern', owner: 'Lare Wyn', description: 'Inside a hollowed lare tree.', sells: ['wine', 'meals'] },
  ]},

  "Feyran's Nest": { type: 'Village', kingdom: 'Orindroth', establishments: [
    { name: "The Nest Hearth", type: 'Tavern', owner: 'Feyran Nest', description: 'High in the canopy, warm within.', sells: ['wine', 'meals'] },
    { name: "Feyran Herbalist", type: 'Herbalist', owner: 'Ran Fey', description: 'Rare canopy herbs.', sells: ['herbs'] },
  ]},

  'Thiriel Glen': { type: 'Village', kingdom: 'Orindroth', establishments: [
    { name: "The Glen Rest", type: 'Inn', owner: 'Thiriel Glen', description: 'Peaceful glen inn.', sells: ['lodging', 'meals'] },
  ]},

  "Mireth's Bloom": { type: 'Village', kingdom: 'Orindroth', establishments: [
    { name: "The Bloom Tavern", type: 'Tavern', owner: 'Mireth Bloom', description: 'Surrounded by flowering vines.', sells: ['wine', 'meals'] },
    { name: "Mireth's Herbalist", type: 'Herbalist', owner: 'Bloom Mireth', description: 'Flowering herb varieties.', sells: ['herbs', 'flower remedies'] },
  ]},

  'Wendralis Shade': { type: 'Village', kingdom: 'Orindroth', establishments: [
    { name: "The Shade Rest", type: 'Tavern', owner: 'Wendralis Shade', description: 'Under the deep forest shade.', sells: ['wine', 'meals'] },
  ]},

  // ══════════════════════════════════════════
  //  RENDAROST  (Dwarf — Far northern)
  // ══════════════════════════════════════════

  'Kragmoor': {
    type: 'CapitalCity', kingdom: 'Rendarost',
    establishments: [
      { name: "The Frost Hall Tavern", type: 'Tavern', owner: 'Krag Moor',
        description: 'Enormous frost-stone great hall — the social heart of Rendarost.',
        sells: ['frost ale', 'stout', 'hearty northern meals'] },
      { name: "Kragmoor Grand Forge", type: 'Blacksmith', owner: 'Forgemeister Dravun',
        description: 'Far northern dwarven smithing — cold-steel weapons.',
        sells: ['weapons', 'armor', 'cold-iron tools'], services: ['commission', 'repair'] },
      { name: "The Frostbrew Hall", type: 'Brewer', owner: 'Brewmaster Thuldren',
        description: 'Produces the famous secret-recipe frost ale of Rendarost.',
        sells: ['frost ale', 'dark stout', 'winter mead'] },
      { name: "Kragmoor Gem Vault", type: 'Merchant', owner: 'Gem Lord Vark',
        description: 'Far northern gems and precious stones, including frost-gems.',
        buys: ['gems', 'frost-gems'], sells: ['gems', 'jewelry'] },
      { name: "Northern Deep Mine", type: 'Miner', owner: 'Mine Lord Iskrol',
        description: 'Deepest mines in the north — iron, coal, and frost-gems.',
        sells: ['mining tools', 'permits'], services: ['assay', 'mine contracts'] },
      { name: "The Ice Library", type: 'Library', owner: 'Keeper Thuldren',
        description: 'Northern history preserved in ice-carved stone tablets.',
        sells: ['books', 'maps'] },
      { name: "Temple of the Frozen Forge", type: 'Temple', owner: 'High Priest Varkol',
        description: 'Rendarost\'s sacred temple — the forge flame never freezes.',
        services: ['blessing', 'forge rites', 'healing'] },
      { name: "Northern Barracks", type: 'Barracks', owner: 'Commander Iskroldir',
        description: 'Far northern defence force. Monster bounties posted.',
        services: ['bounty board', 'guard hire', 'expedition permits'] },
      { name: "Kragmoor Market Hall", type: 'Market', owner: 'Market Master Bryn',
        description: 'Northern market lit by frost-crystal lanterns.',
        sells: ['general goods', 'furs', 'cold-weather gear', 'gems'] },
      { name: "Frost Tanner", type: 'Tanner', owner: 'Fur Drav', description: 'Northern beast furs and cold-weather leather.', sells: ['furs', 'leather', 'cold-weather gear'] },
      { name: "The Frost Stable", type: 'Stable', owner: 'Stablemaster Brynna Cold',
        description: 'Heavily insulated stabling for northern mounts and sled beasts. Essential for expeditions into the far north.',
        sells: ['mount hire'], services: ['boarding', 'cold-weather gear fitting'] },
      { name: "The Kragmoor Gaol", type: 'Prison', owner: 'Jailer Iskroldir Tharn',
        description: 'Far northern cells carved from permafrost stone. Escape attempts are discouraged by the surrounding landscape.',
        services: ['bail processing', 'prisoner visit'] },
    ]
  },

  'Dravundar': { type: 'City', kingdom: 'Rendarost', establishments: [
    { name: "The Dravun Hearth", type: 'Inn', owner: 'Drav Undar', description: 'Cold-stone northern inn.', sells: ['lodging', 'meals'] },
    { name: "Dravundar Forge", type: 'Blacksmith', owner: 'Undar Forge', description: 'Northern cold-iron work.', sells: ['tools', 'weapons'], services: ['repair'] },
    { name: "The Frost Tap", type: 'Tavern', owner: 'Dar Frost', description: 'Frost ale on tap.', sells: ['frost ale', 'meals'] },
    { name: "Dravundar Stable", type: 'Stable', owner: 'Stablemaster Brenha',
      description: 'Insulated stabling for the far north. Specialises in cold-hardy mounts and sled beasts.',
      sells: ['mount hire'], services: ['boarding', 'farrier', 'cold-weather tack'] },
    { name: "Dravundar Barber", type: 'Barber', owner: 'Caldha Trim',
      description: 'Far northern barber known for beard-braiding in traditional dwarven patterns.',
      services: ['haircut', 'beard braiding', 'shave'] },
    { name: "The Frost Cooper", type: 'Cooper', owner: 'Furna Hoop',
      description: 'Makes frost-sealed barrels for the famous Rendarost frost ale. Also supplies mine storage casks.',
      sells: ['frost-sealed barrels', 'storage casks', 'brew tubs'] },
  ]},

  'Iskroldir': { type: 'City', kingdom: 'Rendarost', establishments: [
    { name: "The Iskrol Arms", type: 'Tavern', owner: 'Iskrol Dir', description: 'City tavern near the deep mines.', sells: ['ale', 'meals'] },
    { name: "Iskroldir Assay", type: 'Miner', owner: 'Dir Ore', description: 'Deep ore buying and mining exchange.', buys: ['ore', 'gems'], sells: ['mining tools'] },
    { name: "The Deep Gaol", type: 'Prison', owner: 'Jailer Granna Bars',
      description: 'Mine-level cells cut from permafrost. Holds mine workers convicted of theft or sabotage.',
      services: ['bail processing', 'prisoner visit'] },
    { name: "Iskroldir Rune Crafter", type: 'Rune Crafter', owner: 'Runewright Lurgan',
      description: 'Rune inscriptions using frost-gem inlay. Specialises in mine-support runes and cold-ward weapon inscriptions.',
      sells: ['rune-inscribed mining tools', 'cold-ward items'], services: ['rune commission'] },
    { name: "Iskroldir Gem Cutter", type: 'Gem Cutter', owner: 'Gem Cutter Halvoch',
      description: 'Cuts the rare frost-gems from the deep northern mines into polished gemstones.',
      buys: ['rough frost-gems', 'rough gems'], sells: ['cut frost-gems', 'cut gems'], services: ['gem appraisal'] },
  ]},

  'Thuldrenheim': { type: 'City', kingdom: 'Rendarost', establishments: [
    { name: "The Heim Hearth", type: 'Inn', owner: 'Thul Dren', description: 'Northern heim lodge.', sells: ['lodging', 'meals'] },
    { name: "Thuldrenheim Apothecary", type: 'Apothecary', owner: 'Frost Herb', description: 'Northern frost-herb remedies.', sells: ['potions', 'herbs'] },
    { name: "The Heim Rune Hall", type: 'Rune Crafter', owner: 'Runewright Korrach',
      description: 'Traditional rune crafting in the far north. Specialises in survival runes and frost-ward inscriptions.',
      sells: ['frost-ward items', 'survival rune stones'], services: ['rune commission', 'frost-ward inscription'] },
    { name: "The Heim Stable", type: 'Stable', owner: 'Stablemaster Lurha',
      description: 'Cold-climate stabling with heated stalls. The warmest place for a horse in Thuldrenheim.',
      sells: ['mount hire'], services: ['boarding', 'farrier', 'heated boarding'] },
    { name: "The Heim Barber", type: 'Barber', owner: 'Granna Trim',
      description: 'Northern barber. Specialises in frost-resistant beard wax and practical military cuts.',
      services: ['haircut', 'beard waxing', 'shave', 'wound dressing'] },
  ]},

  "Varkol's Crown": { type: 'City', kingdom: 'Rendarost', establishments: [
    { name: "The Crown & Frost", type: 'Tavern', owner: 'Varkol Crown', description: 'At the northern crown, cold and proud.', sells: ['frost ale', 'meals'] },
    { name: "Crown Market", type: 'Market', owner: 'Elder Var', description: 'Northern trade market.', sells: ['furs', 'gems', 'food'] },
    { name: "The Crown Stable", type: 'Stable', owner: 'Stablemaster Halvra',
      description: 'Northern crown stabling for traders and expedition parties heading into the far reaches.',
      sells: ['mount hire'], services: ['boarding', 'farrier', 'expedition provisioning'] },
    { name: "Crown Chandler", type: 'Chandler', owner: 'Nulva Wick',
      description: 'Frost-rated candles and lanterns for the northern crown settlements.',
      sells: ['frost candles', 'lanterns', 'lamp oil'] },
    { name: "The Crown Gaol", type: 'Prison', owner: 'Jailer Sindach Frost',
      description: 'Far northern holding cells. The cold does half the jailer\'s work.',
      services: ['bail processing', 'prisoner visit'] },
  ]},

  'Brynfrost': { type: 'Village', kingdom: 'Rendarost', establishments: [
    { name: "The Frost Den", type: 'Tavern', owner: 'Bryn Frost', description: 'Cold little village tavern.', sells: ['frost ale', 'meals'] },
  ]},

  'Tarnshield': { type: 'Village', kingdom: 'Rendarost', establishments: [
    { name: "The Shield Rest", type: 'Inn', owner: 'Tarn Shield', description: 'Shielded from the northern wind.', sells: ['lodging', 'meals'] },
    { name: "Tarnshield Smithy", type: 'Blacksmith', owner: 'Shield Smith', description: 'Basic northern smithing.', sells: ['tools'], services: ['repair'] },
  ]},

  'Frostmere Hold': { type: 'Village', kingdom: 'Rendarost', establishments: [
    { name: "The Frostmere Tap", type: 'Tavern', owner: 'Frost Hold', description: 'Ice-cold ale in an ice-cold village.', sells: ['frost ale', 'meals'] },
  ]},

  'Hearthvault': { type: 'Village', kingdom: 'Rendarost', establishments: [
    { name: "The Vault Hearth", type: 'Inn', owner: 'Hearth Vault', description: 'The warmest place in the north.', sells: ['lodging', 'meals'] },
    { name: "Hearthvault Store", type: 'General Store', owner: 'Stock Vault', description: 'Northern provisions.', sells: ['food', 'cold-weather gear', 'tools'] },
  ]},

  'Icevein Hollow': { type: 'Village', kingdom: 'Rendarost', establishments: [
    { name: "The Icevein Alehouse", type: 'Tavern', owner: 'Ice Vein', description: 'Named for the blue ice veins in the cave walls.', sells: ['frost ale', 'meals'] },
    { name: "Icevein Herbalist", type: 'Herbalist', owner: 'Frost Root', description: 'Frost-herbs and cold-climate remedies.', sells: ['herbs', 'cold remedies'] },
  ]},

};

// ════════════════════════════════════════════════════════════
//  MASTERS GUILDS  — One per profession, seated in capitals
//  Each guild spans all kingdoms. Local guild halls (above)
//  are chapters; the Masters Guild is the continental authority.
// ════════════════════════════════════════════════════════════

const mastersGuilds = [
  {
    name: "The Grand Smiths' Brotherhood",
    profession: 'Blacksmith',
    seat: 'Khúralgron',   // dwarven capital — best smiths on the continent
    description: 'The supreme authority on metalwork across Estranta. Grants Master Smith titles, sets quality standards, and controls ore trade agreements between kingdoms.',
    skills: ['Smithing'],
    services: ['Master commission', 'Apprenticeship', 'Quality certification', 'Ore trade arbitration'],
    chapters: ['Ardrenkeep', 'Brythford', 'Aberwyn', 'Durkendal', 'Kragmoor', 'Thalorion'],
    rankTitles: ['Apprentice', 'Journeyman', 'Smith', 'Master Smith', 'Grand Forgemaster'],
  },
  {
    name: "The Armorers' Grand Chapter",
    profession: 'Armorer',
    seat: 'Khúralgron',
    description: 'Oversees armour standards and warrior outfitting across the continent. Works closely with the Smiths\' Brotherhood but focuses exclusively on protective gear.',
    skills: ['Smithing', 'Sewing', 'Crafting'],
    services: ['Armour commission', 'Fitting', 'Battle-grade certification'],
    chapters: ['Ardrenkeep', 'Brythford', 'Wulfhelm', 'Durkendal'],
    rankTitles: ['Apprentice', 'Journeyman', 'Armourer', 'Master Armourer', 'Grand Armourer'],
  },
  {
    name: "The Continental Fletchers' Guild",
    profession: 'Fletcher',
    seat: 'Ealdenford',   // home of the Golden Arrow archery competition
    description: 'Governs the crafting and sale of all ranged weaponry. The annual Golden Arrow competition determines the Guild Champion who sets arrow quality standards for the year.',
    skills: ['Fletching', 'Archery', 'Crafting'],
    services: ['Competition registration', 'Quality certification', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Brythford', 'Aberwyn', 'Windhall'],
    rankTitles: ['Apprentice', 'Bowyer', 'Fletcher', 'Master Fletcher', 'Arrow Champion'],
  },
  {
    name: "The Grand Alchemists' Conclave",
    profession: 'Alchemist',
    seat: 'Brythford',    // continental hub with mage college
    description: 'Regulates alchemy practice, potion standards, and dangerous reagent trade. Issues licenses to practice and funds expeditions to recover rare ingredients.',
    skills: ['Alchemy', 'Herbalism'],
    services: ['Potion certification', 'Reagent licensing', 'Apprenticeship', 'Research funding'],
    chapters: ['Thalorion', 'Myrthill', 'Ardrenkeep', 'Elarien', 'Glenvarloch'],
    rankTitles: ['Novice', 'Apprentice Alchemist', 'Alchemist', 'Master Alchemist', 'Grand Conclave Member'],
  },
  {
    name: "The Apothecaries' Society",
    profession: 'Apothecary',
    seat: 'Brythford',
    description: 'Licenses healers and herbal remedy sellers. Distinct from the Alchemists — the Society focuses on accessible healing rather than experimental potioncraft.',
    skills: ['Herbalism', 'Healing', 'Alchemy'],
    services: ['Healer licensing', 'Apprenticeship', 'Remedy standards', 'Herb supply network'],
    chapters: ['Ardrenkeep', 'Aberwyn', 'Thalorion', 'Khúralgron', 'Kragmoor'],
    rankTitles: ['Apprentice', 'Herbalist', 'Apothecary', 'Master Apothecary', 'Society Elder'],
  },
  {
    name: "The Grand Herbalists' Circle",
    profession: 'Herbalist',
    seat: 'Thalorion',    // elven capital — best herbalists on the continent
    description: 'Catalogues and protects rare plant species. Grants foraging rights in protected groves and funds new herb discovery expeditions.',
    skills: ['Herbalism', 'Foraging', 'Survival'],
    services: ['Foraging permits', 'Herb identification', 'Grove access', 'Apprenticeship'],
    chapters: ['Elarien', 'Myrthill', 'Brythford', 'Aberwyn'],
    rankTitles: ['Gatherer', 'Herbalist', 'Grove Keeper', 'Master Herbalist', 'Circle Elder'],
  },
  {
    name: "The Continental Brewers' Guild",
    profession: 'Brewer',
    seat: 'Kragmoor',     // home of the legendary frost ale
    description: 'Controls brewing standards, hop and grain trade, and the naming rights to regional ales. The frost ale formula is the Guild\'s most protected secret.',
    skills: ['Brewing', 'Cooking'],
    services: ['Recipe certification', 'Trade agreements', 'Apprenticeship', 'Quality stamps'],
    chapters: ['Ardrenkeep', 'Aberwyn', 'Brythford', 'Khúralgron'],
    rankTitles: ['Fermenter', 'Brewer', 'Master Brewer', 'Brewmaster', 'Grand Brewmaster'],
  },
  {
    name: "The Grand Distillers' Brotherhood",
    profession: 'Distiller',
    seat: 'Brythford',
    description: 'Oversees spirits production and the import of exotic wine from elven territories. Issues export licenses and fights counterfeit branding.',
    skills: ['Brewing', 'Cooking'],
    services: ['Spirits certification', 'Export licensing', 'Apprenticeship'],
    chapters: ['Aberwyn', 'Myrthill', 'Kragmoor'],
    rankTitles: ['Apprentice', 'Distiller', 'Master Distiller', 'Grand Distiller'],
  },
  {
    name: "The Merchants' Grand Exchange",
    profession: 'Merchant',
    seat: 'Brythford',    // continental trade hub
    description: 'The most powerful guild on Estranta. Controls trade routes, sets tariffs, and arbitrates commercial disputes between kingdoms. Membership is expensive but opens every door.',
    skills: ['Negotiating', 'Persuasion'],
    services: ['Trade licensing', 'Route protection', 'Commercial arbitration', 'Loans', 'Currency exchange'],
    chapters: ['Ardrenkeep', 'Aberwyn', 'Thalorion', 'Khúralgron', 'Kragmoor', 'Myrthill'],
    rankTitles: ['Trader', 'Merchant', 'Senior Merchant', 'Trade Master', 'Grand Exchange Member'],
  },
  {
    name: "The Continental Weavers' Loom",
    profession: 'Weaver',
    seat: 'Brythford',
    description: 'Controls cloth standards and the enchanted textile trade — particularly the elven silk agreements. Fights against counterfeit enchanted fabrics.',
    skills: ['Sewing', 'Crafting'],
    services: ['Cloth certification', 'Enchanted textile licensing', 'Apprenticeship'],
    chapters: ['Thalorion', 'Myrthill', 'Ardrenkeep'],
    rankTitles: ['Spinner', 'Weaver', 'Cloth Master', 'Grand Weaver'],
  },
  {
    name: "The Tailors' Grand Society",
    profession: 'Tailor',
    seat: 'Brythford',    // fashion capital
    description: 'Sets continental fashion standards and controls the sale of fine garments. The annual fashion season in Brythford is sponsored by the Society.',
    skills: ['Sewing', 'Crafting'],
    services: ['Fashion licensing', 'Apprenticeship', 'Commission brokerage'],
    chapters: ['Ardrenkeep', 'Thalorion', 'Myrthill', 'Aberwyn'],
    rankTitles: ['Apprentice', 'Tailor', 'Senior Tailor', 'Master Tailor', 'Grand Couturier'],
  },
  {
    name: "The Cobblers' Continental Union",
    profession: 'Cobbler',
    seat: 'Brythford',
    description: 'Maintains footwear quality standards. Less glamorous than other guilds but surprisingly influential — every soldier, merchant, and noble needs boots.',
    skills: ['Crafting', 'Sewing'],
    services: ['Quality certification', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Aberwyn', 'Khúralgron'],
    rankTitles: ['Apprentice', 'Cobbler', 'Master Cobbler', 'Grand Cobbler'],
  },
  {
    name: "The Grand Tanners' League",
    profession: 'Tanner',
    seat: 'Khúralgron',
    description: 'Controls the hide trade from hunting grounds to finished leather. Arbitrates between hunters and tanners over fair pricing.',
    skills: ['Crafting', 'Hunting'],
    services: ['Hide trade agreements', 'Quality stamps', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Brythford', 'Kragmoor'],
    rankTitles: ['Skinner', 'Tanner', 'Leather Master', 'Grand Tanner'],
  },
  {
    name: "The Carpenters' Continental Brotherhood",
    profession: 'Carpenter',
    seat: 'Ardrenkeep',   // Ardrenhold's forests supply the continent
    description: 'Regulates timber rights, construction standards, and the training of woodworkers across Estranta. Controls access to the great forests.',
    skills: ['Carpentry', 'Crafting'],
    services: ['Timber rights', 'Construction certification', 'Apprenticeship'],
    chapters: ['Aberwyn', 'Brythford', 'Khúralgron', 'Elarien'],
    rankTitles: ['Apprentice', 'Carpenter', 'Master Carpenter', 'Grand Woodwright'],
  },
  {
    name: "The Masons' Grand Lodge",
    profession: 'Mason',
    seat: 'Khúralgron',
    description: 'Dwarven-dominated masonry guild governing all major construction. Has exclusive contracts for castle and city expansion across the continent.',
    skills: ['Carpentry', 'Mining', 'Crafting'],
    services: ['Construction contracts', 'Stone supply', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Brythford', 'Greystone', 'Durkendal'],
    rankTitles: ['Apprentice', 'Mason', 'Senior Mason', 'Master Mason', 'Grand Lodgemaster'],
  },
  {
    name: "The Miners' Deep Union",
    profession: 'Miner',
    seat: 'Khúralgron',
    description: 'The dwarven mining authority for the entire continent. Controls mine permits, ore pricing, and workers\' safety standards. The most politically powerful guild in Feldarún.',
    skills: ['Mining'],
    services: ['Mining permits', 'Ore assay', 'Safety standards', 'Workers\' disputes'],
    chapters: ['Darakthul', 'Durkendal', 'Iskroldir', 'Kragmoor'],
    rankTitles: ['Tunneller', 'Miner', 'Vein Master', 'Master Miner', 'Deep Warden'],
  },
  {
    name: "The Hunters' Continental Lodge",
    profession: 'Hunter',
    seat: 'Ardrenkeep',
    description: 'Grants hunting licenses in protected territories, tracks population of hunted species, and funds monster-hunting expeditions. The golden arrow motif is borrowed from the Fletchers\' Guild.',
    skills: ['Hunting', 'Tracking', 'Archery', 'Survival'],
    services: ['Hunting licenses', 'Monster contracts', 'Tracking training', 'Trophy certification'],
    chapters: ['Thornwood', 'Aberwyn', 'Kragmoor', 'Elarien'],
    rankTitles: ['Trapper', 'Hunter', 'Tracker', 'Master Hunter', 'Lodge Champion'],
  },
  {
    name: "The Fishers' Continental Fleet",
    profession: 'Fisher',
    seat: 'Brythford',
    description: 'Governs fishing rights across all coastal and inland waters. Issues seasonal licenses and polices illegal netting.',
    skills: ['Fishing'],
    services: ['Fishing licenses', 'Seasonal rights', 'Catch arbitration'],
    chapters: ['Morvarth', 'Valdara', 'Brigstow', "Velra'syl"],
    rankTitles: ['Apprentice', 'Fisher', 'Net Master', 'Master Fisher', 'Fleet Warden'],
  },
  {
    name: "The Healers' Sacred Order",
    profession: 'Healer',
    seat: 'Thalorion',
    description: 'Part guild, part religious order. Licenses healers and ensures treatment is not withheld for lack of payment. Has diplomatic immunity in most kingdoms.',
    skills: ['Healing', 'Herbalism'],
    services: ['Healer licensing', 'Medical training', 'Emergency contracts', 'Diplomatic requests'],
    chapters: ['Ardrenkeep', 'Brythford', 'Aberwyn', 'Khúralgron', 'Kragmoor'],
    rankTitles: ['Healer\'s Aid', 'Healer', 'Senior Healer', 'Master Healer', 'Order Elder'],
  },
  {
    name: "The Scribes' & Scholars' Convocation",
    profession: 'Scholar',
    seat: 'Thalorion',
    description: 'Controls the production and distribution of written knowledge. Licences scribes and maintains the continental library network. Has been known to suppress dangerous texts.',
    skills: ['Decrypting'],
    services: ['Publishing rights', 'Map certification', 'Translation', 'Research funding', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Brythford', 'Aberwyn', 'Elarien', 'Khúralgron'],
    rankTitles: ['Apprentice Scribe', 'Scribe', 'Scholar', 'Senior Scholar', 'Convocation Master'],
  },
  {
    name: "The Mages' Continental Conclave",
    profession: 'Mage',
    seat: 'Brythford',    // home of the Brythford Mage College
    description: 'Regulates magical practice across Estranta. Licenses mages, classifies dangerous spells, and sends Conclave agents to investigate unsanctioned magic use.',
    skills: ['Light Magic', 'Black Magic', 'Blood Magic', 'Alchemy'],
    services: ['Magic licensing', 'Spell certification', 'Apprenticeship', 'Dangerous magic investigation'],
    chapters: ['Thalorion', 'Myrthill', 'Ardrenkeep', 'Elarien'],
    rankTitles: ['Apprentice', 'Mage', 'Arcane Master', 'Grand Mage', 'Arch-Mage'],
  },
  {
    name: "The Priests' Sacred Covenant",
    profession: 'Priest',
    seat: 'Ardrenkeep',   // Cathedral of the Flame
    description: 'The ecclesiastical authority connecting all temples and shrines on Estranta. Ordains priests, resolves religious disputes, and organises holy festivals.',
    skills: ['Healing', 'Persuasion'],
    services: ['Ordination', 'Temple registration', 'Holy festival coordination', 'Blessing ceremonies'],
    chapters: ['Brythford', 'Aberwyn', 'Thalorion', 'Khúralgron', 'Kragmoor', 'Elarien'],
    rankTitles: ['Acolyte', 'Priest', 'Senior Priest', 'High Priest', 'Sacred Elder'],
  },
  {
    name: "The Bards' Continental Society",
    profession: 'Bard',
    seat: 'Aberwyn',      // Dwynbroch — music and art capital
    description: 'Licenses performers, protects bardic works, and maintains the oral history of Estranta. Every bard who travels freely carries a Society seal.',
    skills: ['Persuasion'],
    services: ['Performance licensing', 'Story archive', 'Travel seal', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Brythford', 'Thalorion', 'Myrthill'],
    rankTitles: ['Apprentice', 'Minstrel', 'Bard', 'Master Bard', 'Society Grandmaster'],
  },
  {
    name: "The Assassins' Silent Contract",
    profession: 'Assassin',
    seat: 'Grimscastel',  // grim city under the castle
    description: 'The hidden authority for sanctioned removal. Operates through a network of contacts in every city. Officially it does not exist. Membership is by invitation only.',
    skills: ['Stealth', 'Lockpicking', 'Archery', 'Brawling'],
    services: ['Contracts', 'Poison supply', 'Disguise provision', 'Safe houses'],
    chapters: ['Unknown — rumoured in every capital'],
    rankTitles: ['Shadow', 'Blade', 'Viper', 'Phantom', 'Silent Master'],
  },
  {
    name: "The Thieves' Continental Network",
    profession: 'Thief',
    seat: 'Grimscastel',
    description: 'An open secret in every city. The Network resolves disputes between thieves, sets territory boundaries, and provides fencing for stolen goods.',
    skills: ['Stealth', 'Lockpicking', 'Persuasion'],
    services: ['Fence services', 'Territory agreements', 'Safe houses', 'Intelligence brokerage'],
    chapters: ['Brythford', 'Aberwyn', 'Ardrenkeep'],
    rankTitles: ['Cutpurse', 'Thief', 'Fence', 'Shadow Master', 'Network Elder'],
  },
  {
    name: "The Farmers' Continental Covenant",
    profession: 'Farmer',
    seat: 'Ardrenkeep',   // Goldenfields
    description: 'Protects farmers\' land rights, negotiates grain prices, and organises the continent-wide Harvest Festival. The oldest guild on Estranta.',
    skills: ['Survival', 'Foraging'],
    services: ['Land rights', 'Grain price board', 'Crop insurance', 'Harvest Festival coordination'],
    chapters: ['Ealdenford', 'Brythford', 'Meadowford', 'Eorlingstead'],
    rankTitles: ['Farmhand', 'Farmer', 'Yeoman', 'Master Farmer', 'Covenant Elder'],
  },
  {
    name: "The Cooks' Grand Kitchen",
    profession: 'Cook',
    seat: 'Brythford',
    description: 'Licenses chefs and food sellers, maintains food safety standards, and runs the continental cooking competition. Every royal kitchen must use a Guild-licensed chef.',
    skills: ['Cooking', 'Brewing'],
    services: ['Chef licensing', 'Recipe registration', 'Food standards', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Aberwyn', 'Khúralgron', 'Kragmoor'],
    rankTitles: ['Kitchen Hand', 'Cook', 'Chef', 'Master Chef', 'Grand Chef'],
  },
  {
    name: "The Knights' Continental Order",
    profession: 'Knight',
    seat: 'Ardrenkeep',   // known for brave and valiant knights
    description: 'The chivalric authority of Estranta. Ordains knights, strips titles for dishonour, and coordinates continent-wide military responses to major threats.',
    skills: ['Swordsmanship', 'Polearms', 'Spears', 'Archery', 'Brawling'],
    services: ['Knighthood ceremony', 'Title registration', 'Military coordination', 'Squire training'],
    chapters: ['Wulfhelm', 'Grimscastel', 'Brythford', 'Durkendal'],
    rankTitles: ['Squire', 'Knight', 'Knight Commander', 'Knight Captain', 'Grand Marshal'],
  },
  {
    name: "The Bakers' Continental Guild",
    profession: 'Baker',
    seat: 'Brythford',
    description: 'Governs the trade of bread, pastry, and grain-based food across Estranta. Licenses bakers, sets flour pricing, and runs the annual Harvest Bread competition.',
    skills: ['Cooking'],
    services: ['Baker licensing', 'Recipe registration', 'Flour price board', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Aberwyn', 'Khúralgron'],
    rankTitles: ['Dough Boy', 'Baker', 'Senior Baker', 'Master Baker', 'Grand Baker'],
  },
  {
    name: "The Jewelers' Grand Guild",
    profession: 'Jeweller',
    seat: 'Khúralgron',  // dwarven gem expertise
    description: 'Controls the certification of precious stones and metalwork jewellery across the continent. Authenticates gems and fights the trade in counterfeits.',
    skills: ['Crafting'],
    services: ['Gem certification', 'Jewellery authentication', 'Apprenticeship', 'Gem appraisal'],
    chapters: ['Brythford', 'Ardrenkeep', 'Thalorion'],
    rankTitles: ['Apprentice', 'Gemcutter', 'Jeweller', 'Master Jeweller', 'Grand Jeweller'],
  },
  {
    name: "The Barber-Surgeons' Brotherhood",
    profession: 'Barber',
    seat: 'Brythford',
    description: 'Licenses barbers and barber-surgeons across Estranta. The Brotherhood maintains standards for both cosmetic services and the minor medical procedures barbers have traditionally performed.',
    skills: ['Healing'],
    services: ['Barber licensing', 'Medical procedure standards', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Aberwyn', 'Khúralgron'],
    rankTitles: ['Apprentice', 'Barber', 'Barber-Surgeon', 'Master Barber', 'Grand Barber'],
  },
  {
    name: "The Sailors' Maritime Guild",
    profession: 'Sailor',
    seat: 'Brythford',   // continental port hub
    description: 'Represents the interests of sailors, navigators, and maritime workers across all coastal kingdoms. Issues seaworthiness licenses and resolves wage disputes.',
    skills: ['Navigation', 'Fishing', 'Survival'],
    services: ['Seamanship certification', 'Navigation licensing', 'Maritime law arbitration', 'Crew hire'],
    chapters: ['Morvarth', 'Valdara', "Velra'syl", 'Brythford'],
    rankTitles: ['Deckhand', 'Sailor', 'First Mate', 'Captain', 'Harbourmaster'],
  },
  {
    name: "The Shipwrights' Continental Guild",
    profession: 'Shipwright',
    seat: 'Brythford',
    description: 'Certifies shipwrights and shipyards across the continent. Controls ship design standards and timber rights for shipbuilding.',
    skills: ['Carpentry', 'Crafting'],
    services: ['Shipwright certification', 'Ship design approval', 'Timber contracts', 'Apprenticeship'],
    chapters: ['Morvarth', 'Valdara', 'Brythford'],
    rankTitles: ['Apprentice', 'Shipwright', 'Senior Shipwright', 'Master Shipwright', 'Grand Shipwright'],
  },
  {
    name: "The Adventurers' Continental Fellowship",
    profession: 'Adventurer',
    seat: 'Brythford',   // most active contract board on the continent
    description: 'The loose but functional organisation connecting adventurers, dungeon delvers, explorers, and relic hunters across Estranta. Maintains a contract board system, certifies dangerous-location access, and mediates disputes over claimed ruins.',
    skills: ['Survival', 'Tracking', 'Stealth', 'Brawling'],
    services: ['Contract board', 'Ruin access certification', 'Expedition funding', 'Equipment loans', 'Fellowship membership'],
    chapters: ['Ardrenkeep', 'Aberwyn', 'Thalorion', 'Elarien', 'Khúralgron'],
    rankTitles: ['Greenhorn', 'Adventurer', 'Veteran Adventurer', 'Master Adventurer', 'Fellowship Champion'],
  },
  {
    name: "The Performers' Grand Company",
    profession: 'Performer',
    seat: 'Aberwyn',     // Dwynbroch — music and arts capital
    description: 'The continental authority for theatrical and performing arts. Licenses performers, protects performance works, and organises the annual Grand Festival of Estranta.',
    skills: ['Persuasion'],
    services: ['Performance licensing', 'Theatre registration', 'Festival organisation', 'Apprenticeship'],
    chapters: ['Brythford', 'Ardrenkeep', 'Thalorion', 'Myrthill'],
    rankTitles: ['Apprentice', 'Player', 'Performer', 'Lead Performer', 'Grand Player'],
  },
  {
    name: "The Rangers' Continental Compact",
    profession: 'Ranger',
    seat: 'Ardrenkeep',
    description: 'Coordinates ranger posts across all kingdoms. Shares threat intelligence, issues territorial patrol contracts, and funds monster suppression operations.',
    skills: ['Tracking', 'Survival', 'Archery', 'Hunting'],
    services: ['Patrol contracts', 'Threat intelligence', 'Monster suppression', 'Wilderness certification'],
    chapters: ['Aberwyn', 'Elarien', 'Thalorion', 'Khúralgron', 'Kragmoor'],
    rankTitles: ['Scout', 'Ranger', 'Senior Ranger', 'Ranger Captain', 'Compact Warden'],
  },
  {
    name: "The Architects' Society",
    profession: 'Architect',
    seat: 'Khúralgron',  // dwarven architectural mastery
    description: 'Certifies architects and approves major construction projects. Works closely with the Masons\' Lodge on large contracts. The Society\'s approval is required for any fortification or royal commission.',
    skills: ['Carpentry', 'Mining', 'Crafting'],
    services: ['Design certification', 'Structural review', 'Royal commission arbitration', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Brythford', 'Durkendal'],
    rankTitles: ['Apprentice', 'Draughtsman', 'Architect', 'Senior Architect', 'Grand Architect'],
  },
  {
    name: "The Druid's Ancient Circle",
    profession: 'Druid',
    seat: 'Elarien',     // central forest — oldest druidic tradition
    description: 'The oldest organisation on Estranta, predating all kingdoms. Connects druidic groves across the continent. The Circle enforces protection of sacred sites and the natural balance.',
    skills: ['Herbalism', 'Survival', 'Foraging'],
    services: ['Grove registration', 'Sacred site protection', 'Nature arbitration', 'Seasonal rites'],
    chapters: ['Aberwyn', 'Myrthill', 'Thalorion'],
    rankTitles: ['Grove Keeper', 'Druid', 'Senior Druid', 'Elder Druid', 'Arch-Druid'],
  },
  {
    name: "The Potters' Craft Union",
    profession: 'Potter',
    seat: 'Brythford',
    description: 'Governs pottery and ceramics trade across Estranta. Certifies kilns, sets quality standards for food-safe vessels, and fights undercutting by foreign imports.',
    skills: ['Crafting'],
    services: ['Potter certification', 'Kiln registration', 'Quality standards', 'Apprenticeship'],
    chapters: ['Ardrenkeep', 'Aberwyn'],
    rankTitles: ['Clay Boy', 'Potter', 'Senior Potter', 'Master Potter', 'Grand Potter'],
  },
  {
    name: "The Silversmiths' Precious Guild",
    profession: 'Silversmith',
    seat: 'Khúralgron',
    description: 'Controls silver goods certification and fights the silver-plating fraud trade. Works with the Jewelers\' Guild on precious metal standards.',
    skills: ['Crafting'],
    services: ['Silver certification', 'Anti-fraud investigation', 'Apprenticeship'],
    chapters: ['Brythford', 'Ardrenkeep', 'Thalorion'],
    rankTitles: ['Apprentice', 'Silversmith', 'Silver Artisan', 'Master Silversmith', 'Grand Silversmith'],
  },
];

// ═══════════════════════════════════
//  LOOKUP HELPER
// ═══════════════════════════════════

// Get all establishments for a given settlement name.
function getEstablishments(settlementName) {
  return establishments[settlementName] || null;
}

// Get all establishments of a given type across all settlements.
function getEstablishmentsByType(type) {
  const results = [];
  for (const [settlement, data] of Object.entries(establishments)) {
    for (const est of data.establishments) {
      if (est.type === type) results.push({ settlement, kingdom: data.kingdom, ...est });
    }
  }
  return results;
}

// Get the masters guild for a given profession name.
function getMastersGuild(profession) {
  return mastersGuilds.find(g => g.profession.toLowerCase() === profession.toLowerCase()) || null;
}
