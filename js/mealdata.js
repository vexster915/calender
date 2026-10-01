// Food knowledge for the Meals page.
// CUISINES: what usually travels well in delivery, safe orders, and what to skip.
// CHAINS: specific orders for well-known chains (menus change. Check the app before ordering).
// travel = how well the food survives a 20–40 min ride (0–100).
// moods: study (steady energy, no food coma), healthy, cheap, group, treat, late.

export const CUISINES = {
  pizza: {
    label: 'Pizza', emoji: '🍕', travel: 92, moods: ['cheap', 'group', 'late', 'treat'],
    picks: [['Large pepperoni or a half-and-half pie', 'Pizza is the king of delivery: it holds heat and reheats perfectly.'], ['Garlic knots or breadsticks', 'Cheap, shareable, and they survive the ride.'], ['A white or veggie pie', 'Good change of pace if you order pizza a lot.']],
    avoid: [['Thin, loaded “Neapolitan” pies', 'They go soggy in the box. Better eaten at the restaurant.']],
    tip: 'Order a large, not two mediums. You get more pizza for the money, and leftovers make a good study snack.',
  },
  burger: {
    label: 'Burgers', emoji: '🍔', travel: 68, moods: ['treat', 'late'],
    picks: [['Classic cheeseburger', 'Simple burgers hold up better than tall stacked ones.'], ['Chicken sandwich', 'Crispy chicken stays crunchy longer than fries.'], ['Onion rings or tots instead of fries', 'They survive the trip way better.']],
    avoid: [['Shoestring fries', 'They go limp in about 10 minutes.']],
    tip: 'Ask for sauces on the side so the bun doesn’t get soggy.',
  },
  mexican: {
    label: 'Mexican', emoji: '🌯', travel: 88, moods: ['study', 'cheap', 'group'],
    picks: [['Burrito or burrito bowl with chicken, rice and beans', 'Protein + fiber = steady energy for studying.'], ['Chips with guac or queso', 'Great to share.'], ['Tacos al pastor or carne asada', 'Ask for salsa on the side.']],
    avoid: [['Nachos with everything on top', 'Soggy within minutes.']],
    tip: 'Burritos are wrapped tight, so they’re one of the best foods to order for delivery.',
  },
  'tex-mex': { alias: 'mexican' },
  tacos: { alias: 'mexican' },
  burrito: { alias: 'mexican' },
  chinese: {
    label: 'Chinese', emoji: '🥡', travel: 90, moods: ['group', 'late', 'cheap'],
    picks: [['General Tso’s or orange chicken', 'The crowd-pleaser.'], ['Beef & broccoli or chicken with mixed veggies', 'More balanced, still filling.'], ['Lo mein or fried rice', 'Noodles and rice reheat great tomorrow.'], ['Dumplings (steamed)', 'Steamed ones survive delivery better than fried.']],
    avoid: [['Crispy wontons, egg rolls left in the bag too long', 'Eat these first.']],
    tip: 'Takeout containers were made for this. Chinese food is near the top for delivery.',
  },
  japanese: {
    label: 'Japanese', emoji: '🍱', travel: 74, moods: ['study', 'healthy', 'treat'],
    picks: [['Chicken teriyaki or salmon bento', 'Balanced, steady energy.'], ['Sushi rolls like California or spicy tuna', 'Order from close by. It’s best fresh.'], ['Gyoza', 'Good side to share.']],
    avoid: [['Tempura', 'Loses its crunch in transit.']],
    tip: 'Sushi is great when the place is close (under ~2 miles).',
  },
  sushi: { alias: 'japanese' },
  ramen: {
    label: 'Ramen', emoji: '🍜', travel: 55, moods: ['treat', 'late'],
    picks: [['Tonkotsu or spicy miso ramen', 'Good shops pack noodles and broth separately. Combine at home.'], ['Pork buns or karaage', 'Great side.']],
    avoid: [['Ramen from places that pack it mixed', 'The noodles bloat and get mushy.']],
    tip: 'Only order ramen nearby, and check reviews that mention “packed separately”.',
  },
  noodle: { alias: 'ramen' },
  thai: {
    label: 'Thai', emoji: '🍛', travel: 86, moods: ['study', 'group'],
    picks: [['Green or red curry with chicken + rice', 'Curries travel and reheat really well.'], ['Pad see ew or drunken noodles', 'Wide noodles hold up better than pad thai.'], ['Chicken satay', 'Easy side to share.']],
    avoid: [['Pad thai far away', 'It clumps as it cools. Fine if close.']],
    tip: 'Pick your spice level carefully. “Thai hot” is not a joke.',
  },
  indian: {
    label: 'Indian', emoji: '🍛', travel: 93, moods: ['study', 'group', 'treat'],
    picks: [['Chicken tikka masala or butter chicken + rice', 'Mild, rich, and the ultimate comfort food.'], ['Chana masala or dal', 'Great vegetarian protein.'], ['Garlic naan', 'Order extra. You’ll want it.']],
    avoid: [['Pakoras/samosas if far away', 'They lose their crisp.']],
    tip: 'Curries taste even better the next day, so order enough for leftovers.',
  },
  pakistani: { alias: 'indian' },
  nepalese: { alias: 'indian' },
  italian: {
    label: 'Italian', emoji: '🍝', travel: 72, moods: ['group', 'treat'],
    picks: [['Baked ziti or lasagna', 'Baked pastas travel much better than noodles in sauce.'], ['Chicken parm (sandwich or plate)', 'Hearty and holds up.'], ['Caesar salad', 'Ask for dressing on the side.']],
    avoid: [['Creamy pastas like alfredo', 'The sauce thickens and gets gloppy in transit.']],
    tip: 'Baked dishes > tossed pasta for delivery.',
  },
  american: {
    label: 'American', emoji: '🍽️', travel: 70, moods: ['treat', 'group'],
    picks: [['Chicken tenders', 'Reliable and travel fine.'], ['Burger or club sandwich', 'Classic.'], ['Mac & cheese side', 'Comfort in a cup.']],
    avoid: [['Anything with fries if it’s far', 'Soggy fries are sad.']],
    tip: 'Check the photos in the app. American menus vary a lot.',
  },
  diner: { alias: 'american' },
  chicken: {
    label: 'Chicken', emoji: '🍗', travel: 78, moods: ['cheap', 'treat', 'late'],
    picks: [['Tender combo with dipping sauces', 'Tenders hold their crunch better than wings in sauce.'], ['Chicken sandwich', 'Easy to eat at your desk.'], ['Mac & cheese or slaw side', 'Travels well.']],
    avoid: [['Fries if you’re far away', 'Swap for a side that travels.']],
    tip: 'Ask for extra sauce. It’s free at most places.',
  },
  fried_chicken: { alias: 'chicken' },
  wings: {
    label: 'Wings', emoji: '🍗', travel: 70, moods: ['group', 'late', 'treat'],
    picks: [['Dry-rub wings (lemon pepper, cajun)', 'Dry rubs stay crispy. Sauced wings go soft.'], ['Boneless wings', 'Easier to eat while studying.'], ['Sauce on the side', 'Dip yourself, so they stay crunchy.']],
    avoid: [['Heavily sauced wings from far away', 'Soggy skin.']],
    tip: 'Napkins. So many napkins. Don’t eat wings over your notes.',
  },
  sandwich: {
    label: 'Sandwiches', emoji: '🥪', travel: 90, moods: ['study', 'cheap', 'healthy'],
    picks: [['Turkey or chicken sub on whole wheat', 'Light enough that you won’t crash after.'], ['Italian sub', 'Classic.'], ['A hot sandwich like a philly or melt', 'Holds heat better than you’d think.']],
    avoid: [['Lots of wet toppings with no toasting', 'The bread gets soggy.']],
    tip: 'Cold subs are the ultimate study food: no crumbs, no crash.',
  },
  deli: { alias: 'sandwich' },
  bagel: {
    label: 'Bagels', emoji: '🥯', travel: 88, moods: ['study', 'cheap'],
    picks: [['Bagel with egg & cheese', 'A solid breakfast that holds up.'], ['Everything bagel with cream cheese', 'Classic.']],
    avoid: [],
    tip: 'Order a dozen for a group study session. Cheap and everyone’s happy.',
  },
  breakfast: {
    label: 'Breakfast', emoji: '🥞', travel: 62, moods: ['treat'],
    picks: [['Breakfast burrito or sandwich', 'Travels way better than plates.'], ['Pancakes with syrup on the side', 'Keep syrup separate or they go soggy.']],
    avoid: [['Eggs over easy, waffles', 'Waffles steam in the box and lose their crunch.']],
    tip: 'Wraps and sandwiches > plates for breakfast delivery.',
  },
  mediterranean: {
    label: 'Mediterranean', emoji: '🥙', travel: 90, moods: ['study', 'healthy'],
    picks: [['Chicken shawarma or falafel bowl', 'Protein + grains + veggies = focus food.'], ['Hummus & pita', 'Great snack to graze while studying.'], ['Gyro wrap', 'Ask for tzatziki on the side.']],
    avoid: [],
    tip: 'One of the best “won’t make you sleepy” options.',
  },
  greek: { alias: 'mediterranean' },
  middle_eastern: { alias: 'mediterranean' },
  lebanese: { alias: 'mediterranean' },
  turkish: { alias: 'mediterranean' },
  falafel: { alias: 'mediterranean' },
  kebab: { alias: 'mediterranean' },
  halal: {
    label: 'Halal', emoji: '🥙', travel: 88, moods: ['cheap', 'late', 'group'],
    picks: [['Chicken & rice platter with white sauce', 'Huge portion, very affordable.'], ['Combo (chicken + gyro) platter', 'Can easily be two meals.']],
    avoid: [],
    tip: 'Go easy on the red hot sauce on your first try.',
  },
  vietnamese: {
    label: 'Vietnamese', emoji: '🍜', travel: 70, moods: ['study', 'healthy'],
    picks: [['Banh mi', 'Crunchy, fresh, and travels great.'], ['Vermicelli bowl (bún) with grilled pork or chicken', 'Light and filling.'], ['Pho, if they pack broth separately', 'Order nearby.']],
    avoid: [['Pho from far away', 'The noodles soak up the broth.']],
    tip: 'Banh mi is one of the best value sandwiches anywhere.',
  },
  korean: {
    label: 'Korean', emoji: '🍲', travel: 80, moods: ['treat', 'group'],
    picks: [['Bibimbap', 'Balanced bowl. Mix it all up.'], ['Korean fried chicken (soy garlic)', 'Stays crispier than most fried chicken.'], ['Bulgogi with rice', 'Sweet-savory crowd-pleaser.']],
    avoid: [],
    tip: 'Korean fried chicken is famous for staying crunchy. Try it.',
  },
  poke: {
    label: 'Poke', emoji: '🥗', travel: 82, moods: ['study', 'healthy'],
    picks: [['Salmon or tuna poke bowl over rice', 'Light, protein-packed, no crash.'], ['Half rice, half greens', 'Lighter, if you’ve got a long night ahead.']],
    avoid: [],
    tip: 'Order from close by. It’s raw fish.',
  },
  hawaiian: { alias: 'poke' },
  salad: {
    label: 'Salads & bowls', emoji: '🥗', travel: 84, moods: ['study', 'healthy'],
    picks: [['Grain bowl with chicken', 'Filling enough to actually power a study session.'], ['Any salad with protein, dressing on the side', 'Keeps it crisp.']],
    avoid: [['Salads with no protein', 'You’ll be hungry in an hour.']],
    tip: 'Add a protein. A salad alone won’t carry you through finals week.',
  },
  vegan: { alias: 'salad' },
  vegetarian: { alias: 'salad' },
  healthy: { alias: 'salad' },
  bbq: {
    label: 'BBQ', emoji: '🍖', travel: 85, moods: ['group', 'treat'],
    picks: [['Pulled pork or brisket sandwich', 'Smoked meat holds heat well.'], ['Mac & cheese, beans, cornbread', 'Classic sides that all travel.']],
    avoid: [],
    tip: 'BBQ was basically made to be eaten later. Great delivery pick.',
  },
  barbecue: { alias: 'bbq' },
  seafood: {
    label: 'Seafood', emoji: '🦐', travel: 55, moods: ['treat'],
    picks: [['Grilled fish or shrimp plate', 'Grilled > fried for delivery.'], ['Fish tacos', 'Hold up surprisingly well.']],
    avoid: [['Fried fish & chips from far away', 'Gets soggy fast.']],
    tip: 'Seafood is best when the restaurant is close.',
  },
  fish_and_chips: { alias: 'seafood' },
  caribbean: {
    label: 'Caribbean', emoji: '🍛', travel: 88, moods: ['group', 'treat'],
    picks: [['Jerk chicken with rice & peas', 'Big flavor, travels great.'], ['Oxtail or curry goat', 'Rich and filling.'], ['Beef patty', 'Perfect cheap snack.']],
    avoid: [],
    tip: 'Stews and braised dishes are perfect for delivery.',
  },
  latin_american: {
    label: 'Latin American', emoji: '🫓', travel: 84, moods: ['cheap', 'group'],
    picks: [['Arepas or pupusas', 'Hand-held and filling.'], ['Rice, beans and a grilled protein plate', 'Classic, balanced.'], ['Empanadas', 'Great to share.']],
    avoid: [],
    tip: 'Ask what the house specialty is. Menus vary a lot.',
  },
  peruvian: { alias: 'latin_american' },
  cuban: { alias: 'latin_american' },
  colombian: { alias: 'latin_american' },
  salvadoran: { alias: 'latin_american' },
  venezuelan: { alias: 'latin_american' },
  asian: {
    label: 'Asian', emoji: '🥢', travel: 84, moods: ['group', 'cheap'],
    picks: [['Teriyaki or sesame chicken with rice', 'Reliable crowd-pleaser.'], ['Fried rice or noodles', 'Reheats well.']],
    avoid: [['Anything tempura or crispy if far', 'Loses its crunch.']],
    tip: 'Rice dishes are always the safe bet for delivery.',
  },
  ethiopian: {
    label: 'Ethiopian', emoji: '🫓', travel: 85, moods: ['group', 'healthy'],
    picks: [['Veggie combo platter with injera', 'Lots of variety, very shareable.'], ['Doro wat (chicken stew)', 'The classic.']],
    avoid: [],
    tip: 'Great for a group. Everyone tears injera together.',
  },
  steak_house: {
    label: 'Steakhouse', emoji: '🥩', travel: 50, moods: ['treat'],
    picks: [['Steak sandwich or steak salad', 'Travels better than a full steak.']],
    avoid: [['A whole steak', 'It keeps cooking in the box and arrives overdone.']],
    tip: 'Honestly, steakhouses are better in person.',
  },
  hot_dog: {
    label: 'Hot dogs', emoji: '🌭', travel: 75, moods: ['cheap', 'late'],
    picks: [['Classic or chili-cheese dog', 'Cheap and quick.']],
    avoid: [],
    tip: 'Toppings on the side if it’s far.',
  },
  coffee_shop: {
    label: 'Coffee', emoji: '☕', travel: 70, moods: ['study'],
    picks: [['Cold brew or iced latte', 'Caffeine for the study session.'], ['A breakfast sandwich or egg bites', 'Protein with your caffeine, so you don’t crash.']],
    avoid: [['Blended / whipped drinks from far away', 'They melt.']],
    tip: 'Caffeine before 2–3 pm so it doesn’t wreck your sleep. Sleep is when memory sticks!',
  },
  coffee: { alias: 'coffee_shop' },
  cafe: { alias: 'coffee_shop' },
  tea: { alias: 'bubble_tea' },
  bubble_tea: {
    label: 'Boba', emoji: '🧋', travel: 70, moods: ['treat', 'study'],
    picks: [['Classic milk tea with boba, 50% sweet', 'Less sugar = less crash.'], ['Fruit tea', 'Lighter option.']],
    avoid: [],
    tip: 'Order “less ice” so it’s not watered down by the time it arrives.',
  },
  juice: {
    label: 'Juice & smoothies', emoji: '🥤', travel: 70, moods: ['healthy', 'study'],
    picks: [['Smoothie with protein added', 'Turns a snack into fuel.'], ['Açaí bowl', 'Refreshing treat.']],
    avoid: [],
    tip: 'Add protein or nut butter, or you’ll be hungry again fast.',
  },
  ice_cream: {
    label: 'Ice cream', emoji: '🍦', travel: 45, moods: ['treat'],
    picks: [['Pints', 'Pints survive delivery. Cones don’t.']],
    avoid: [['Soft serve, cones, sundaes', 'They’ll arrive as soup.']],
    tip: 'Pints only. Trust us.',
  },
  dessert: {
    label: 'Desserts', emoji: '🍰', travel: 80, moods: ['treat', 'late'],
    picks: [['Cookies or brownies', 'Travel perfectly.'], ['A slice of cake', 'Treat yourself after an exam.']],
    avoid: [],
    tip: 'A study reward. Order it after you finish, not instead of starting. 😉',
  },
  donut: { alias: 'dessert' },
  bakery: { alias: 'dessert' },
  cookies: { alias: 'dessert' },
  french: {
    label: 'French', emoji: '🥐', travel: 60, moods: ['treat'],
    picks: [['Croque monsieur or a baguette sandwich', 'Sandwiches travel best.'], ['Quiche', 'Reheats nicely.']],
    avoid: [],
    tip: 'Bistro mains are better in person. Stick to sandwiches.',
  },
  spanish: {
    label: 'Spanish', emoji: '🥘', travel: 70, moods: ['treat', 'group'],
    picks: [['Paella', 'Great to share.'], ['A few tapas', 'Patatas bravas, croquetas.']],
    avoid: [],
    tip: 'Order several small plates for a group.',
  },
  filipino: {
    label: 'Filipino', emoji: '🍚', travel: 86, moods: ['group', 'treat'],
    picks: [['Chicken adobo with rice', 'Classic and travels great.'], ['Lumpia', 'Eat these first, while crispy.'], ['Pancit', 'Noodles for the group.']],
    avoid: [],
    tip: 'Braised dishes like adobo are perfect for delivery.',
  },
  soul_food: {
    label: 'Soul food', emoji: '🍗', travel: 80, moods: ['treat', 'group'],
    picks: [['Fried chicken or smothered chicken plate', 'Hearty.'], ['Mac & cheese, collards, cornbread', 'The sides are the star.']],
    avoid: [],
    tip: 'Order sides for everyone. They make the meal.',
  },
  regional: { alias: 'american' },
  fusion: { alias: 'asian' },
  dim_sum: { alias: 'chinese' },
  cantonese: { alias: 'chinese' },
  szechuan: { alias: 'chinese' },
  sichuan: { alias: 'chinese' },
  dumpling: { alias: 'chinese' },
};

// How we group cuisines into "craving" chips.
export const CRAVINGS = [
  ['pizza', '🍕 Pizza', ['pizza']],
  ['burger', '🍔 Burgers', ['burger', 'hot_dog']],
  ['chicken', '🍗 Chicken & wings', ['chicken', 'wings']],
  ['mexican', '🌯 Mexican', ['mexican']],
  ['chinese', '🥡 Chinese', ['chinese']],
  ['japanese', '🍣 Japanese & ramen', ['japanese', 'ramen']],
  ['asianmix', '🍛 Thai · Indian · Korean · Viet', ['thai', 'indian', 'korean', 'vietnamese', 'asian', 'filipino']],
  ['med', '🥙 Mediterranean & halal', ['mediterranean', 'halal']],
  ['sandwich', '🥪 Sandwiches & bagels', ['sandwich', 'bagel']],
  ['healthy', '🥗 Salads & poke', ['salad', 'poke', 'juice']],
  ['comfort', '🍖 BBQ & comfort', ['bbq', 'soul_food', 'american', 'caribbean', 'latin_american']],
  ['breakfast', '🥞 Breakfast', ['breakfast']],
  ['sweet', '🍩 Sweets & boba', ['dessert', 'ice_cream', 'bubble_tea']],
  ['coffee', '☕ Coffee', ['coffee_shop']],
];

export const MOODS = [
  ['study', '📚 Study fuel', 'Steady energy, no food coma'],
  ['cheap', '💸 Cheap eats', 'Most food for the least money'],
  ['late', '🌙 Late night', 'Open late, made for midnight cramming'],
  ['healthy', '🥗 Light & healthy', 'Feel good after'],
  ['group', '👥 Group order', 'Shareable for a study group'],
  ['treat', '🎉 Treat yourself', 'You earned it (finished an exam?)'],
];

// Resolve an OSM cuisine tag to our entry.
export function cuisineInfo(key) {
  let c = CUISINES[key];
  let k = key;
  for (let i = 0; c?.alias && i < 3; i++) {
    k = c.alias;
    c = CUISINES[k];
  }
  return c ? { key: k, ...c } : null;
}

// ---------------------------------------------------------------- chains
// order: [item, why]. hack: a tip. skip: what to avoid.
export const CHAINS = [
  { names: ['chipotle'], cuisine: 'mexican', order: [['Burrito bowl: chicken or steak, white rice, black beans, fajita veggies, mild + corn salsa, cheese, lettuce', 'Bowls travel better than burritos and you can save half.'], ['Chips & guac', 'The classic side.']], hack: 'Fajita veggies are free. Always add them.', skip: 'Tacos. The shells crack and go soft.' },
  { names: ['chick-fil-a', 'chick fil a', 'chickfila'], cuisine: 'chicken', order: [['Chick-fil-A Chicken Sandwich or Spicy Deluxe', 'The signature.'], ['12-count nuggets with Chick-fil-A sauce', 'Great for sharing or two meals.'], ['Mac & cheese', 'Travels better than waffle fries.']], hack: 'Closed on Sundays, so plan ahead.', skip: 'Waffle fries if you’re far away.' },
  { names: ['panera'], cuisine: 'sandwich', order: [['Broccoli cheddar soup in a bread bowl', 'Iconic comfort food.'], ['“You Pick Two”: half sandwich + soup or salad', 'Perfect study-lunch portion.'], ['Mac & cheese', 'Kid favorite, adult favorite.']], hack: 'The You Pick Two combo is the best value.', skip: '' },
  { names: ['taco bell'], cuisine: 'mexican', order: [['Crunchwrap Supreme', 'Folded shut, so it travels perfectly.'], ['Cheesy Gordita Crunch', 'Fan favorite.'], ['Mexican Pizza', 'Shareable.']], hack: 'Customize it: add potatoes or swap beans for beef, usually cheap.', skip: 'Plain hard tacos. They crack and get soggy.' },
  { names: ['mcdonald', "mcdonald's", 'mcdonalds'], cuisine: 'burger', order: [['Big Mac or Quarter Pounder with Cheese', 'The classics.'], ['10-piece McNuggets', 'Travel better than fries.'], ['McChicken', 'Cheap and reliable.']], hack: 'Order from the closest one. McDonald’s fries are only good for about 10 minutes.', skip: 'Fries from far away; McFlurries melt.' },
  { names: ['subway'], cuisine: 'sandwich', order: [['Footlong turkey or Italian B.M.T., toasted', 'Toasting keeps the bread from going soggy.'], ['Rotisserie-style chicken sub', 'Lean protein for long study nights.']], hack: 'A footlong = lunch now + dinner later.', skip: '' },
  { names: ['panda express'], cuisine: 'chinese', order: [['Plate: Orange Chicken + Beijing Beef, half chow mein / half fried rice', 'The fan-favorite combo.'], ['Honey Walnut Shrimp', 'Premium, but people love it.'], ['String Bean Chicken Breast', 'Lighter option.']], hack: 'Get “half and half” sides. Most locations allow it.', skip: '' },
  { names: ["domino's", 'dominos', 'domino'], cuisine: 'pizza', order: [['Large hand-tossed or pan pizza (pepperoni + one topping)', 'Reliable delivery pizza.'], ['Parmesan Bread Bites', 'Cheap, shareable side.']], hack: 'Domino’s almost always has a deal. Check their app vs. Uber Eats prices.', skip: '' },
  { names: ['pizza hut'], cuisine: 'pizza', order: [['Original Pan Pizza', 'The thing they’re known for.'], ['Breadsticks', 'Classic side.']], hack: 'Pan crust holds up best in the box.', skip: '' },
  { names: ["papa john's", 'papa johns'], cuisine: 'pizza', order: [['Large pepperoni', 'Classic.'], ['Extra garlic sauce cups', 'Dunk everything.']], hack: 'Garlic sauce is the whole point.', skip: '' },
  { names: ['little caesars'], cuisine: 'pizza', order: [['Classic pepperoni', 'Cheapest pizza that feeds a group.'], ['Crazy Bread', 'Iconic side.']], hack: 'Best “feed the study group” value around.', skip: '' },
  { names: ["wendy's", 'wendys'], cuisine: 'burger', order: [['Dave’s Single or Baconator', 'Square fresh-beef burgers.'], ['Spicy Chicken Sandwich', 'Fan favorite.'], ['Frosty', 'Dip fries in it. Trust.']], hack: 'Check the value menu/bundles in the app.', skip: 'Fries far away.' },
  { names: ['burger king'], cuisine: 'burger', order: [['Whopper', 'The classic.'], ['Chicken Fries', 'Easy to eat while studying.']], hack: 'Onion rings travel better than fries.', skip: '' },
  { names: ['five guys'], cuisine: 'burger', order: [['Little cheeseburger (one patty) with your toppings', 'The “little” is plenty.'], ['Regular Cajun fries', 'A regular feeds two people.']], hack: 'Toppings are free. Load it up (grilled onions + mushrooms).', skip: 'Large fries for one person.' },
  { names: ['shake shack'], cuisine: 'burger', order: [['ShackBurger', 'Signature burger.'], ['Chicken Shack', 'Crispy chicken sandwich.'], ['Crinkle-cut fries', 'Crinkle cut holds up OK.']], hack: 'Shakes might melt a bit. Order from nearby.', skip: '' },
  { names: ['in-n-out', 'in n out'], cuisine: 'burger', order: [['Double-Double, Animal Style', 'The legend.']], hack: 'In-N-Out limits delivery, so it may not show up in Uber Eats.', skip: 'Fries for delivery.' },
  { names: ['whataburger'], cuisine: 'burger', order: [['Whataburger with jalapeños', 'Classic.'], ['Honey Butter Chicken Biscuit (breakfast/late night)', 'Cult favorite.']], hack: 'Spicy ketchup is a must.', skip: '' },
  { names: ["culver's", 'culvers'], cuisine: 'burger', order: [['ButterBurger', 'Signature.'], ['Wisconsin cheese curds', 'Eat them first!']], hack: 'Frozen custard melts in delivery. Get it in person.', skip: 'Custard for delivery.' },
  { names: ['sonic'], cuisine: 'burger', order: [['Tots', 'Way better than fries for travel.'], ['Cherry limeade', 'Signature drink.']], hack: '', skip: '' },
  { names: ["arby's", 'arbys'], cuisine: 'sandwich', order: [['Classic Roast Beef', 'What they’re known for.'], ['Curly fries', 'Hold up better than regular fries.']], hack: 'Arby’s sauce + Horsey sauce.', skip: '' },
  { names: ['jack in the box'], cuisine: 'burger', order: [['Two tacos', 'Weird, cheap, beloved.'], ['Curly fries', '']], hack: 'Late-night friendly at many locations.', skip: '' },
  { names: ['kfc'], cuisine: 'chicken', order: [['Famous Bowl', 'Mashed potatoes, corn, chicken, gravy, cheese. Peak comfort.'], ['8-piece bucket + sides', 'Group order.']], hack: 'Fried chicken travels really well.', skip: '' },
  { names: ['popeyes'], cuisine: 'chicken', order: [['Chicken sandwich (classic or spicy)', 'Famous for a reason.'], ['Red beans & rice or mac & cheese', 'Best sides.'], ['Biscuits', 'Must order.']], hack: 'Bonafide spicy chicken is great value.', skip: 'Cajun fries if far.' },
  { names: ["raising cane's", 'raising canes', 'canes'], cuisine: 'chicken', order: [['The Box Combo: 4 fingers, fries, Texas toast, slaw, Cane’s sauce', 'The classic.'], ['Extra Cane’s sauce', 'You will want it.']], hack: 'Ask for extra sauce. Toast travels better than fries.', skip: '' },
  { names: ['wingstop'], cuisine: 'wings', order: [['Lemon pepper or garlic parmesan wings', 'Dry-ish flavors stay crispy.'], ['Louisiana Voodoo Fries', 'Loaded and shareable.']], hack: 'Boneless = easier studying. Get sauce on the side.', skip: 'Heavily sauced flavors from far away.' },
  { names: ['buffalo wild wings', 'bww'], cuisine: 'wings', order: [['Traditional wings with Honey BBQ or Asian Zing', 'Popular choices.'], ['Boneless wings', 'Less mess.']], hack: 'Sauce on the side keeps them crunchy.', skip: '' },
  { names: ["zaxby's", 'zaxbys'], cuisine: 'chicken', order: [['Chicken Fingerz Plate with Zax sauce', 'Signature.']], hack: '', skip: '' },
  { names: ['bojangles'], cuisine: 'chicken', order: [['Cajun Filet Biscuit', 'Cult favorite.'], ['Bo-Rounds', 'Potato rounds travel well.']], hack: '', skip: '' },
  { names: ["dave's hot chicken", 'daves hot chicken'], cuisine: 'chicken', order: [['Tenders, “Medium” heat for your first time', 'Hot levels are seriously hot.'], ['Kale slaw + mac & cheese', 'Cool things down.']], hack: 'Start mild. “Reaper” is no joke.', skip: '' },
  { names: ["jersey mike's", 'jersey mikes'], cuisine: 'sandwich', order: [['#13 Original Italian, “Mike’s Way”', 'The signature.'], ['#17 Mike’s Famous Philly', 'Best hot sub.']], hack: 'Mike’s Way = onions, lettuce, tomato, vinegar, oil, spices.', skip: '' },
  { names: ["jimmy john's", 'jimmy johns'], cuisine: 'sandwich', order: [['#9 Italian Night Club', 'Fan favorite.'], ['Beach Club', 'Turkey, avocado, provolone.']], hack: 'Fast, and their bread holds up.', skip: '' },
  { names: ['firehouse subs'], cuisine: 'sandwich', order: [['Hook & Ladder', 'Turkey + ham, hot.'], ['Smokehouse Beef & Cheddar Brisket', 'Hearty.']], hack: 'Hot subs travel well here.', skip: '' },
  { names: ['wawa'], cuisine: 'sandwich', order: [['Shorti or classic hoagie, built your way', 'Their hoagies are famous.'], ['Mac & cheese bowl', 'Comfort.']], hack: '', skip: '' },
  { names: ['sweetgreen'], cuisine: 'salad', order: [['Harvest Bowl', 'Their best-seller.'], ['Kale Caesar', 'Classic.']], hack: 'Dressing on the side.', skip: '' },
  { names: ['cava'], cuisine: 'mediterranean', order: [['Greens + grains bowl: harissa honey chicken, hummus, crazy feta, pickled onions', 'Fan-favorite build.'], ['Pita chips', 'For the dips.']], hack: 'Crazy Feta is the move.', skip: '' },
  { names: ['the halal guys', 'halal guys'], cuisine: 'halal', order: [['Combo platter (chicken + gyro) over rice', 'The legend.'], ['Extra white sauce', 'Essential.']], hack: 'Hot sauce is very spicy. Start with a little.', skip: '' },
  { names: ['qdoba'], cuisine: 'mexican', order: [['Burrito bowl with chicken and 3-cheese queso', 'Queso is included at no extra cost.']], hack: 'Queso and guac don’t cost extra here.', skip: '' },
  { names: ["moe's southwest grill", 'moes'], cuisine: 'mexican', order: [['Homewrecker burrito', 'Loaded.'], ['Chips & queso', 'Great to share.']], hack: '', skip: '' },
  { names: ["torchy's tacos", 'torchys'], cuisine: 'mexican', order: [['Trailer Park, “get it trashy”', 'Fried chicken taco, cult classic.'], ['Green chile queso', 'Famous.']], hack: '', skip: '' },
  { names: ['noodles & company', 'noodles and company'], cuisine: 'italian', order: [['Wisconsin Mac & Cheese', 'Classic.'], ['Japanese Pan Noodles', 'Travels well.'], ['Pesto Cavatappi', 'Popular.']], hack: '', skip: '' },
  { names: ['olive garden'], cuisine: 'italian', order: [['Chicken Parmigiana', 'Hearty and travels.'], ['Zuppa Toscana soup', 'Comfort in a cup.']], hack: 'Breadsticks come with entrées.', skip: 'Fettuccine Alfredo far away (the sauce thickens).' },
  { names: ["p.f. chang's", 'pf changs', 'p.f. changs'], cuisine: 'chinese', order: [['Chang’s Spicy Chicken', 'Signature.'], ['Mongolian Beef', 'Crowd-pleaser.'], ['Chicken lettuce wraps', 'Famous starter.']], hack: '', skip: '' },
  { names: ['starbucks'], cuisine: 'coffee_shop', order: [['Iced coffee or cold brew, light ice', 'Light ice so it isn’t watery.'], ['Bacon & Gruyère egg bites', 'Protein with your caffeine.']], hack: 'Blended drinks melt. Stick to iced or hot.', skip: 'Frappuccinos for delivery.' },
  { names: ["dunkin'", 'dunkin', 'dunkin donuts'], cuisine: 'coffee_shop', order: [['Iced coffee', 'Classic.'], ['Wake-Up Wrap', 'Small protein snack.'], ['Munchkins', 'Share with your study group.']], hack: '', skip: '' },
  { names: ['ihop'], cuisine: 'breakfast', order: [['Original buttermilk pancakes, syrup on the side', 'The classic.'], ['Breakfast combo with eggs and bacon', 'Filling.']], hack: '', skip: 'Waffles (they steam).' },
  { names: ["denny's", 'dennys'], cuisine: 'breakfast', order: [['Grand Slam', 'Classic breakfast any time.']], hack: 'Many are open late. Good for all-nighters.', skip: '' },
  { names: ['insomnia cookies'], cuisine: 'dessert', order: [['A mixed 6-pack of warm cookies', 'Delivered warm, late.']], hack: 'Open late, made for study nights.', skip: '' },
  { names: ['crumbl'], cuisine: 'dessert', order: [['Whatever the weekly lineup is (plus milk chocolate chip)', 'Flavors rotate weekly.']], hack: 'Cookies are huge. Split one.', skip: '' },
];

export function chainFor(name = '', brand = '') {
  // Whole-word match so "Canes" doesn't match "Hurricanes".
  const n = ` ${brand} ${name} `.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'&.-]+/g, ' ');
  return CHAINS.find((c) => c.names.some((x) => n.includes(` ${x} `) || n.includes(` ${x}'s `))) || null;
}
