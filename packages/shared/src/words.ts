/**
 * Word bank v2 — tiered by "cluability" rather than category.
 *
 * What actually makes a word easy or hard to give a clue for is its
 * concreteness (can you picture it?) and its polysemy (does it have
 * multiple meanings, giving the clue-giver more bridges to work with?) —
 * not obscurity or category. So words are organized by difficulty tier
 * first; the category groupings below are just how the list was curated,
 * not something the game reads.
 *
 * Tier 1 (easy): concrete, common, and often deliberately double/triple
 * meaning (BAT, SPRING-like words such as CRANE, SEAL, MOLE) — this is the
 * single biggest lever for making clue-giving feel possible and fun. Don't
 * prune these down for being "too easy."
 * Tier 2 (medium): concrete and common, but with fewer alternate meanings.
 * Tier 3 (hard): abstract, lower-frequency, or single-meaning. Use
 * sparingly — an overload of abstract words is what makes a board feel
 * "flat" and clue-resistant.
 *
 * This replaces the earlier flat, category-only 310-word bank outright —
 * some of its words were pruned for being too obscure/single-meaning, and
 * new high-value polysemous words were added in their place. A word
 * appears in exactly one tier even if it would fit more than one category
 * (e.g. Bowl and Door each only appear once, in Tier 1).
 */

export type WordTier = 1 | 2 | 3;

const TIER_1: string[] = [
  // Body & everyday objects
  'Arm', 'Foot', 'Head', 'Eye', 'Nose', 'Mouth', 'Back', 'Hand', 'Nail',
  'Chest', 'Palm', 'Knot',
  // Nature & animals with double meanings
  'Bat', 'Crane', 'Seal', 'Mole', 'Bark', 'Branch', 'Stem', 'Seed', 'Core',
  'Stone', 'Leaf', 'Root',
  // Money & value
  'Bank', 'Pound', 'Bond', 'Note', 'Bill', 'Check', 'Change', 'Cash',
  'Credit', 'Debt', 'Loan', 'Fund', 'Stock', 'Share', 'Market', 'Trade',
  'Deal',
  // Sports & motion
  'Match', 'Pitch', 'Court', 'Field', 'Goal', 'Base', 'Plate', 'Track',
  'Lane', 'Run', 'Jump', 'Dive', 'Swing', 'Kick', 'Shot', 'Stroke', 'Pass',
  'Drive', 'Cast', 'Spin', 'Turn', 'Twist',
  // Light, fire & elements
  'Light', 'Spark', 'Flame', 'Torch', 'Lamp', 'Candle', 'Ice', 'Fire',
  'Smoke', 'Ash', 'Coal', 'Gas', 'Oil', 'Fuel',
  // Home & security
  'Key', 'Lock', 'Safe', 'Vault', 'Door', 'Window', 'Bar', 'Well', 'Deck',
  'Board', 'Frame', 'Clip', 'Bolt',
  // Water & travel
  'Wave', 'Bridge', 'Anchor', 'Hook', 'Line', 'Reel', 'Rod', 'Drift',
  'Sail', 'Port', 'Dock', 'Bay',
  // Land & measurement
  'Yard', 'Lot', 'Plot', 'Plant', 'Ground', 'Space', 'Scale', 'Point',
  'Spot', 'Dash', 'Block',
  // Clothing & appearance
  'Ring', 'Crown', 'Belt', 'Buckle', 'Tie', 'Boot', 'Watch', 'Dress',
  'Tire',
  // Games & performance
  'Stage', 'Play', 'Charge', 'Kid', 'Bowl', 'Figure', 'Trunk', 'Pit',
  'Organ', 'Racket', 'Draft', 'Tab', 'Fan', 'Wind',
  // Food with double meanings
  'Date', 'Fig', 'Orange', 'Lime', 'Grape', 'Pepper', 'Mint', 'Spice',
  // Star & sky words
  'Star', 'Moon', 'Sun', 'Cloud', 'Rainbow',
  // Simple universal nouns
  'Dog', 'Cat', 'Tree', 'House', 'Car', 'Book', 'Table', 'Chair', 'Phone',
  'River', 'Mountain', 'Beach', 'Forest',
];

const TIER_2: string[] = [
  // Animals
  'Lion', 'Tiger', 'Bear', 'Wolf', 'Fox', 'Rabbit', 'Deer', 'Horse', 'Cow',
  'Pig', 'Sheep', 'Goat', 'Chicken', 'Duck', 'Eagle', 'Owl', 'Shark',
  'Whale', 'Dolphin', 'Octopus', 'Snake', 'Lizard', 'Frog', 'Turtle',
  'Elephant', 'Monkey', 'Penguin', 'Kangaroo',
  // Food & drink
  'Pizza', 'Burger', 'Pasta', 'Bread', 'Cheese', 'Apple', 'Banana',
  'Strawberry', 'Chocolate', 'Cake', 'Cookie', 'Sandwich', 'Coffee', 'Tea',
  'Milk', 'Juice', 'Soup', 'Salad', 'Rice', 'Noodles', 'Egg', 'Bacon',
  'Honey', 'Sugar', 'Butter',
  // Household objects (Chair, Lamp, Candle are Tier 1 already)
  'Mirror', 'Clock', 'Pillow', 'Blanket', 'Paper', 'Pen', 'Pencil',
  'Scissors', 'Knife', 'Spoon', 'Fork', 'Cup', 'Bottle', 'Box', 'Bag',
  'Umbrella', 'Ladder', 'Rope',
  // Nature & weather
  'Flower', 'Desert', 'Island', 'Volcano', 'Rain', 'Snow', 'Storm',
  'Lightning', 'Sand', 'Grass',
  // Transportation
  'Truck', 'Bus', 'Train', 'Plane', 'Boat', 'Ship', 'Bike', 'Motorcycle',
  'Subway', 'Helicopter', 'Rocket', 'Submarine', 'Scooter', 'Taxi',
  'Canoe', 'Skateboard',
  // Sports & games
  'Soccer', 'Basketball', 'Baseball', 'Football', 'Tennis', 'Golf',
  'Boxing', 'Swimming', 'Chess', 'Cards', 'Dice', 'Puzzle', 'Darts',
  'Bowling', 'Hockey', 'Volleyball', 'Skiing', 'Surfing', 'Wrestling',
  // Places (Market is Tier 1 already)
  'School', 'Hospital', 'Library', 'Museum', 'Church', 'Castle', 'Tower',
  'Palace', 'Park', 'Zoo', 'Airport', 'Station', 'Farm', 'Factory',
  'Restaurant', 'Hotel', 'Stadium', 'Theater', 'Garden', 'Cave', 'Temple',
  // Clothing
  'Shirt', 'Pants', 'Shoes', 'Hat', 'Gloves', 'Scarf', 'Jacket', 'Socks',
  'Mask', 'Cape',
  // Tools
  'Hammer', 'Saw', 'Drill', 'Wrench', 'Shovel', 'Axe', 'Brush', 'Guitar',
  'Piano', 'Drum', 'Violin', 'Flute', 'Trumpet', 'Camera',
];

const TIER_3: string[] = [
  // Abstract concepts
  'Time', 'Dream', 'Secret', 'Mystery', 'Freedom', 'Peace', 'Luck', 'Fate',
  'Silence', 'Echo', 'Memory', 'Instinct',
  // Professions & technical
  'Scientist', 'Astronaut', 'Algorithm', 'Satellite', 'Antenna',
  'Network', 'Signal', 'Virus',
  // Entertainment / abstract
  'Melody', 'Rhythm', 'Costume', 'Puppet', 'Festival', 'Carnival',
  // Fantasy / mythical
  'Dragon', 'Skeleton', 'Werewolf', 'Curse', 'Spell', 'Potion', 'Phantom',
  // Misc lower-frequency
  'Voltage', 'Magnet', 'Compass', 'Telescope', 'Prism', 'Eclipse',
];

export const WORD_TIERS: Record<WordTier, string[]> = {
  1: TIER_1,
  2: TIER_2,
  3: TIER_3,
};

/** Flat view of the whole bank — for anything that genuinely wants "every
 * word" rather than a tiered draw (e.g. a last-resort exhaustion fallback). */
export const WORDS: string[] = [...TIER_1, ...TIER_2, ...TIER_3];
