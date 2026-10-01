// Meals — "what should I order tonight?" Type a ZIP code, Orbit finds real restaurants nearby
// (OpenStreetMap), ranks which ones are worth ordering on Uber Eats, and tells you WHAT to order.
// Uber Eats has no public restaurant/menu API, so: places come from OpenStreetMap, "what to order"
// comes from Orbit's food guide (mealdata.js), and the Uber Eats button opens a search for the place.
import { el, add, clear } from './util.js';
import { modal, toast, confetti } from './ui.js';
import { CRAVINGS, MOODS, cuisineInfo, chainFor } from './mealdata.js';
import { examsSoon } from './srs.js';

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const CACHE_MS = 12 * 3600000;
const MI = 1609.34;

export const ubereatsUrl = (q) => `https://www.ubereats.com/search?q=${encodeURIComponent(q)}`;

// ------------------------------------------------------------------ data fetching
async function geocode(zip) {
  let r;
  try {
    r = await fetch(`https://api.zippopotam.us/us/${zip}`, { referrerPolicy: 'no-referrer' });
  } catch {
    throw new Error('Couldn’t reach the ZIP lookup. Check your internet connection.');
  }
  if (r.status === 404) throw new Error(`Couldn’t find ZIP code ${zip}. Double-check it?`);
  if (!r.ok) throw new Error('The ZIP lookup is having trouble. Try again in a minute.');
  const j = await r.json();
  const p = j.places?.[0];
  if (!p) throw new Error(`Couldn’t find ZIP code ${zip}.`);
  return { lat: +p.latitude, lon: +p.longitude, city: p['place name'], state: p['state abbreviation'] };
}

async function fetchPlaces(lat, lon, meters) {
  const q = `[out:json][timeout:25];nwr["amenity"~"^(restaurant|fast_food|cafe|ice_cream|food_court)$"]["name"](around:${Math.round(meters)},${lat.toFixed(5)},${lon.toFixed(5)});out center tags 700;`;
  for (const url of OVERPASS) {
    try {
      const r = await fetch(url, { method: 'POST', body: new window.URLSearchParams({ data: q }), referrerPolicy: 'no-referrer' });
      if (r.ok) return (await r.json()).elements || [];
    } catch {
      /* try the next mirror */
    }
  }
  throw new Error('The restaurant map server is busy. Try again in a minute.');
}

// ------------------------------------------------------------------ opening hours
const DAY = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
// Parses the common OpenStreetMap opening_hours formats. Returns null when unsure.
export function parseHours(str, now = new Date()) {
  if (!str) return null;
  str = str.trim();
  if (str === '24/7') return { open: true, label: 'Open 24/7', late: true };
  const rules = {};
  for (const raw of str.split(';')) {
    const part = raw.trim();
    if (!part) continue;
    if (/\b(PH|SH|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|week|sunrise|sunset)\b/.test(part)) continue;
    const m = part.match(/^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:,(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)?\s*(.*)$/);
    if (!m) return null;
    const days = [];
    if (m[1]) {
      for (const seg of m[1].split(',')) {
        const [a, b] = seg.split('-').map((d) => DAY.indexOf(d));
        if (b === undefined) days.push(a);
        else for (let d = a, n = 0; n < 7; d = (d + 1) % 7, n++) {
          days.push(d);
          if (d === b) break;
        }
      }
    } else days.push(0, 1, 2, 3, 4, 5, 6);
    const t = m[2].trim();
    let ranges = [];
    if (!/^(off|closed)$/i.test(t)) {
      for (const span of t.split(',')) {
        const x = span.trim().match(/^(\d{1,2}):(\d\d)\s*-\s*(\d{1,2}):(\d\d)\+?$/);
        if (!x) return null;
        ranges.push([+x[1] * 60 + +x[2], +x[3] * 60 + +x[4]]);
      }
    }
    for (const d of days) rules[d] = ranges;
  }
  if (!Object.keys(rules).length) return null;
  const today = (now.getDay() + 6) % 7;
  const yest = (today + 6) % 7;
  const mins = now.getHours() * 60 + now.getMinutes();
  const fmt = (m) => {
    const h = Math.floor(m / 60) % 24;
    const mm = String(m % 60).padStart(2, '0');
    return `${h % 12 || 12}${mm === '00' ? '' : `:${mm}`}${h < 12 ? 'am' : 'pm'}`;
  };
  const late = (rules[today] || []).some(([s, e]) => e <= s || e >= 23 * 60);
  for (const [s, e] of rules[today] || []) {
    const overnight = e <= s;
    if ((mins >= s && (overnight || mins < e)) || (s === 0 && e === 24 * 60)) return { open: true, label: `Open until ${fmt(e)}`, late, closesIn: (overnight ? e + 1440 : e) - mins };
  }
  for (const [s, e] of rules[yest] || []) if (e <= s && mins < e) return { open: true, label: `Open until ${fmt(e)}`, late: true, closesIn: e - mins };
  const later = (rules[today] || []).find(([s]) => s > mins);
  return { open: false, label: later ? `Opens at ${fmt(later[0])}` : rules[today]?.length ? 'Closed for the night' : 'Closed today', late };
}

// ------------------------------------------------------------------ normalize + score
const NAME_HINTS = [
  [/pizz/i, 'pizza'], [/taco|taquer|burrito|cantina|mexican/i, 'mexican'], [/sushi/i, 'sushi'], [/ramen/i, 'ramen'], [/\bpho\b|banh mi/i, 'vietnamese'],
  [/thai/i, 'thai'], [/burger/i, 'burger'], [/wing/i, 'wings'], [/chicken/i, 'chicken'], [/bagel/i, 'bagel'], [/\bdeli\b|sub(s|way)?\b|hoagie/i, 'sandwich'],
  [/bbq|barbecue|smokehouse/i, 'bbq'], [/curry|tandoor|masala|india/i, 'indian'], [/gyro|shawarma|falafel|kebab|mediterr/i, 'mediterranean'], [/poke/i, 'poke'],
  [/boba|bubble tea/i, 'bubble_tea'], [/donut|doughnut/i, 'donut'], [/coffee|espresso|cafe|café/i, 'coffee_shop'], [/china|chinese|wok|dragon|panda|szechuan/i, 'chinese'],
  [/korean|seoul/i, 'korean'], [/diner/i, 'diner'], [/breakfast|pancake/i, 'breakfast'], [/salad/i, 'salad'], [/halal/i, 'halal'], [/ice cream|creamery|gelato/i, 'ice_cream'],
];

function milesBetween(a, b) {
  const R = 3958.8;
  const toR = (x) => (x * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat);
  const dLon = toR(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function normalize(e, origin) {
  const t = e.tags || {};
  const lat = e.lat ?? e.center?.lat;
  const lon = e.lon ?? e.center?.lon;
  if (lat == null || !t.name) return null;
  const chain = chainFor(t.name, t.brand);
  let cuisines = (t.cuisine || '').toLowerCase().split(/[;,]/).map((c) => c.trim().replace(/\s+/g, '_')).filter(Boolean);
  if (!cuisines.length && chain) cuisines = [chain.cuisine];
  if (!cuisines.length) {
    const hint = NAME_HINTS.find(([re]) => re.test(t.name));
    if (hint) cuisines = [hint[1]];
    else if (t.amenity === 'cafe') cuisines = ['coffee_shop'];
    else if (t.amenity === 'ice_cream') cuisines = ['ice_cream'];
  }
  const info = cuisines.map(cuisineInfo).find(Boolean) || null;
  const diet = {};
  for (const d of ['vegetarian', 'vegan', 'halal', 'gluten_free', 'kosher']) if (/yes|only/.test(t[`diet:${d}`] || '')) diet[d] = true;
  if (cuisines.includes('vegan')) diet.vegan = diet.vegetarian = true;
  if (cuisines.includes('vegetarian')) diet.vegetarian = true;
  if (cuisines.includes('halal')) diet.halal = true;
  const addr = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
  return {
    id: `${e.type}/${e.id}`,
    name: t.name,
    amenity: t.amenity,
    cuisines,
    ckey: info?.key || null,
    lat,
    lon,
    dist: milesBetween(origin, { lat, lon }),
    hours: t.opening_hours || '',
    delivery: t.delivery || '',
    takeaway: t.takeaway || '',
    website: t.website || t['contact:website'] || '',
    addr: addr ? `${addr}${t['addr:city'] ? `, ${t['addr:city']}` : ''}` : '',
    diet,
    chain: chain ? chain.names[0] : null,
  };
}

function groupOf(ckey) {
  return CRAVINGS.find(([, , keys]) => keys.includes(ckey))?.[0] || null;
}

// Higher = better to order for delivery right now. Every point comes with a reason.
export function scorePlace(p, { mood = null, meals = {}, now = new Date() } = {}) {
  const info = p.ckey ? cuisineInfo(p.ckey) : null;
  const chain = p.chain ? chainFor(p.chain) : null;
  const hours = parseHours(p.hours, now);
  const why = [];
  let s = 50;
  if (info) {
    s += (info.travel - 70) * 0.5;
    if (info.travel >= 85) why.push(`${info.emoji} ${info.label} travels great`);
    else if (info.travel < 60) why.push(`⚠️ ${info.label} doesn’t travel well`);
  } else s -= 6;
  if (p.dist < 1) (s += 12), why.push(`🚗 ${p.dist.toFixed(1)} mi: arrives fast`);
  else if (p.dist < 2) (s += 8), why.push(`🚗 ${p.dist.toFixed(1)} mi away`);
  else if (p.dist < 3.5) s += 3;
  else if (p.dist > 5) s -= 8;
  if (info && info.travel < 70 && p.dist > 2) s -= 8;
  if (p.delivery === 'yes') (s += 6), why.push('✅ Offers delivery');
  if (p.takeaway === 'yes' || p.takeaway === 'only') s += 3;
  if (hours?.open === true) {
    s += 8;
    why.push(hours.closesIn != null && hours.closesIn < 45 ? `⏰ Closes soon (${hours.label.toLowerCase()})` : `🟢 ${hours.label}`);
    if (hours.closesIn != null && hours.closesIn < 45) s -= 10;
  } else if (hours?.open === false) (s -= 35), why.push(`🔴 ${hours.label}`);
  if (chain) (s += 4), why.push('📋 Menu tips below');
  if (p.amenity === 'cafe' && mood !== 'study') s -= 6;
  if (mood && info?.moods?.includes(mood)) (s += 16), why.push(MOODS.find(([k]) => k === mood)[1]);
  if (mood === 'late') {
    if (hours?.late && hours.open) (s += 14), why.push('🌙 Open late');
    else if (hours && !hours.late) s -= 12;
  }
  if (mood === 'cheap' && p.amenity === 'fast_food') s += 8;
  const rating = meals.ratings?.[p.id];
  if (rating === 1) (s += 18), why.unshift('👍 You liked it');
  if (rating === -1) (s -= 40), why.unshift('👎 You didn’t like it');
  if (meals.favs?.includes(p.id)) (s += 8), why.unshift('⭐ Favorite');
  return { score: Math.max(1, Math.min(99, Math.round(s))), why, hours, info, chain };
}

// ------------------------------------------------------------------ what to order
export function orderAdvice(p) {
  const chain = p.chain ? chainFor(p.chain) : null;
  const info = p.ckey ? cuisineInfo(p.ckey) : null;
  if (chain) return { source: 'chain', picks: chain.order, hack: chain.hack, skip: chain.skip, info };
  if (info) return { source: 'cuisine', picks: info.picks, hack: info.tip, skip: info.avoid.map(([a, b]) => `${a}: ${b}`).join(' '), info };
  return { source: 'none', picks: [['Check the most-ordered items on their Uber Eats page', 'The app shows a “Popular” section, which is usually the safest bet.']], hack: 'Look for dishes with lots of photos and reviews.', skip: '', info: null };
}

// ------------------------------------------------------------------ view
const meals = (app) => (app.data.meals ||= { zip: '', radius: 3, favs: [], ratings: {}, history: [], cache: null });

async function search(app, zip, radius) {
  const m = meals(app);
  const vs = (app.viewState.meals ||= {});
  vs.loading = true;
  vs.error = null;
  app.render();
  try {
    const place = await geocode(zip);
    const raw = await fetchPlaces(place.lat, place.lon, radius * MI);
    const seen = new Set();
    const items = raw
      .map((e) => normalize(e, place))
      .filter((p) => p && !seen.has(p.name.toLowerCase() + Math.round(p.lat * 1000)) && seen.add(p.name.toLowerCase() + Math.round(p.lat * 1000)));
    Object.assign(m, { zip, radius, cache: { zip, radius, at: Date.now(), place, items } });
    vs.loading = false;
    app.commit();
    toast(items.length ? `🍽️ Found ${items.length} places near ${place.city}` : 'No restaurants found. Try a bigger radius.');
  } catch (err) {
    vs.loading = false;
    vs.error = err.message;
    app.render();
  }
}

function defaultMood(app) {
  const h = new Date().getHours();
  if (h >= 22 || h < 4) return 'late';
  if (examsSoon(app.data, 2).length) return 'study';
  return null;
}

export function renderMeals(app) {
  const m = meals(app);
  const vs = (app.viewState.meals ||= {});
  if (vs.mood === undefined) vs.mood = defaultMood(app);
  vs.sort ||= 'score';
  const cache = m.cache;
  const head = el('div', { class: 'page-title' }, el('h2', {}, '🍔 Meals'), el('span', { class: 'spacer' }), cache && el('span', { class: 'muted small' }, `Delivery picks near ${cache.place.city}, ${cache.place.state} ${cache.zip}`));

  // ZIP form
  const zipIn = el('input', { type: 'text', inputmode: 'numeric', maxlength: 5, placeholder: 'ZIP code, e.g. 10001', value: m.zip || '', 'aria-label': 'ZIP code', class: 'zip-input' });
  const radius = el('select', { 'aria-label': 'Search radius' }, [1, 2, 3, 5].map((r) => el('option', { value: r, selected: (m.radius || 3) === r }, `within ${r} mi`)));
  const go = (e) => {
    e?.preventDefault();
    const zip = zipIn.value.trim();
    if (!/^\d{5}$/.test(zip)) return toast('Enter a 5-digit US ZIP code');
    search(app, zip, +radius.value);
  };
  const form = el('form', { class: 'zip-form', onsubmit: go }, zipIn, radius, el('button', { class: 'btn primary', type: 'submit', disabled: !!vs.loading }, vs.loading ? 'Searching…' : cache ? 'Refresh' : 'Find food 🍽️'));

  if (!cache || vs.loading || vs.error) {
    return el(
      'div',
      { class: 'meals' },
      head,
      el(
        'div',
        { class: 'card meals-setup' },
        el('div', { class: 'big' }, vs.loading ? '🛵' : '🍽️'),
        el('h3', { style: { justifyContent: 'center' } }, vs.loading ? 'Scouting restaurants near you…' : 'What should I order tonight?'),
        el('p', { class: 'muted' }, 'Type your ZIP code. Orbit finds the restaurants around you, ranks which are worth ordering on Uber Eats right now, and tells you exactly what to get.'),
        form,
        vs.error && el('div', { class: 'error-box' }, vs.error),
        el('p', { class: 'small faint' }, '🔒 Only your ZIP code and the map area are sent (to zippopotam.us and OpenStreetMap’s Overpass API). Nothing about your account leaves this device.'),
      ),
    );
  }

  const stale = Date.now() - cache.at > CACHE_MS;
  const ctx = { mood: vs.mood, meals: m };
  let list = cache.items.map((p) => ({ p, ...scorePlace(p, ctx) }));
  const counts = {};
  for (const x of list) {
    const g = groupOf(x.p.ckey);
    if (g) counts[g] = (counts[g] || 0) + 1;
  }
  if (vs.craving) list = list.filter((x) => groupOf(x.p.ckey) === vs.craving);
  if (vs.openNow) list = list.filter((x) => x.hours?.open !== false);
  if (vs.diet) list = list.filter((x) => x.p.diet[vs.diet]);
  if (vs.q) {
    const q = vs.q.toLowerCase();
    list = list.filter((x) => x.p.name.toLowerCase().includes(q) || x.p.cuisines.some((c) => c.includes(q)));
  }
  list.sort(vs.sort === 'dist' ? (a, b) => a.p.dist - b.p.dist : vs.sort === 'name' ? (a, b) => a.p.name.localeCompare(b.p.name) : (a, b) => b.score - a.score || a.p.dist - b.p.dist);

  const moodRow = el(
    'div',
    { class: 'mood-row' },
    MOODS.map(([k, label, hint]) => el('button', { class: `mood${vs.mood === k ? ' on' : ''}`, title: hint, 'aria-pressed': String(vs.mood === k), onclick: () => ((vs.mood = vs.mood === k ? null : k), app.render()) }, label)),
  );
  const cravingRow = el(
    'div',
    { class: 'craving-row' },
    el('button', { class: `chip-btn${!vs.craving ? ' on' : ''}`, onclick: () => ((vs.craving = null), app.render()) }, `Everything (${cache.items.length})`),
    CRAVINGS.filter(([k]) => counts[k]).map(([k, label]) => el('button', { class: `chip-btn${vs.craving === k ? ' on' : ''}`, onclick: () => ((vs.craving = vs.craving === k ? null : k), app.render()) }, `${label} · ${counts[k]}`)),
  );
  const qIn = el('input', { type: 'search', placeholder: 'Search places or food…', value: vs.q || '', 'aria-label': 'Search restaurants' });
  qIn.addEventListener('input', () => {
    vs.q = qIn.value;
    clearTimeout(vs.qt);
    vs.qt = setTimeout(() => {
      app.render();
      document.querySelector('.meals-filters input[type=search]')?.focus();
    }, 250);
  });
  const openCb = el('input', { type: 'checkbox', class: 'check sq', checked: !!vs.openNow });
  openCb.addEventListener('change', () => ((vs.openNow = openCb.checked), app.render()));
  const diet = el('select', { 'aria-label': 'Dietary filter' }, [['', 'Any diet'], ['vegetarian', 'Vegetarian'], ['vegan', 'Vegan'], ['halal', 'Halal'], ['gluten_free', 'Gluten-free'], ['kosher', 'Kosher']].map(([v, l]) => el('option', { value: v, selected: (vs.diet || '') === v }, l)));
  diet.addEventListener('change', () => ((vs.diet = diet.value), app.render()));
  const sort = el('select', { 'aria-label': 'Sort' }, [['score', 'Best to order'], ['dist', 'Closest'], ['name', 'A–Z']].map(([v, l]) => el('option', { value: v, selected: vs.sort === v }, l)));
  sort.addEventListener('change', () => ((vs.sort = sort.value), app.render()));
  const filters = el('div', { class: 'meals-filters' }, qIn, el('label', { class: 'row small', style: { gap: '6px' } }, openCb, 'Open now (or unknown)'), diet, sort);

  const top = list.slice(0, 6);
  const decide = el(
    'div',
    { class: 'card decide-card' },
    el('div', { class: 'row' }, el('div', { class: 'big' }, '🎲'), el('div', {}, el('b', {}, 'Can’t decide?'), el('div', { class: 'small muted' }, 'Spin between your best options. No take-backs. 😄'))),
    el('button', { class: 'btn primary big-btn', disabled: !list.length, onclick: () => spin(app, list.slice(0, 10)) }, '🎰 Decide for me'),
  );

  const favs = cache.items.filter((p) => m.favs.includes(p.id));
  const history = (m.history || []).slice(-6).reverse();
  const side = el(
    'div',
    { class: 'stack' },
    decide,
    favs.length > 0 && el('div', { class: 'card' }, el('h3', {}, '⭐ Your favorites'), favs.map((p) => el('button', { class: 'mini-place', onclick: () => openPlace(app, p) }, el('span', {}, emojiOf(p)), el('span', { class: 'mini-name' }, p.name), el('span', { class: 'faint small' }, `${p.dist.toFixed(1)} mi`)))),
    history.length > 0 &&
      el(
        'div',
        { class: 'card' },
        el('h3', {}, '🧾 Recently ordered'),
        history.map((h) =>
          el(
            'div',
            { class: 'mini-place' },
            el('span', { class: 'mini-name' }, h.name),
            el('span', { class: 'faint small' }, new Date(h.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
            el('button', { class: `btn icon ghost${m.ratings[h.id] === 1 ? ' on' : ''}`, 'aria-label': `Liked ${h.name}`, title: 'Liked it, show it more', onclick: () => rate(app, h.id, 1) }, '👍'),
            el('button', { class: `btn icon ghost${m.ratings[h.id] === -1 ? ' on' : ''}`, 'aria-label': `Didn’t like ${h.name}`, title: 'Didn’t like it, show it less', onclick: () => rate(app, h.id, -1) }, '👎'),
          ),
        ),
      ),
    el('div', { class: 'card small muted' }, el('b', {}, '🛵 Delivery tips'), el('ul', { class: 'tips' }, el('li', {}, 'Closer = hotter. Under 2 miles is the sweet spot.'), el('li', {}, 'Soups, curries, burritos, pizza and BBQ travel best. Fries and tempura travel worst.'), el('li', {}, 'Ask for sauces and dressings on the side.'), el('li', {}, 'Compare the Uber Eats price with the restaurant’s own app. Some are cheaper direct.'))),
  );

  return el(
    'div',
    { class: 'meals' },
    head,
    el('div', { class: 'card meals-bar' }, form, stale && el('span', { class: 'small muted' }, 'Results are over 12 hours old. Hit Refresh for fresh hours.')),
    vs.mood && el('div', { class: 'mood-banner' }, moodBanner(app, vs.mood)),
    moodRow,
    cravingRow,
    filters,
    el(
      'div',
      { class: 'meals-grid' },
      el(
        'div',
        {},
        el('div', { class: 'section-h' }, list.length ? `🏆 Top picks${vs.craving ? '' : ' near you'}` : 'Nothing matches those filters'),
        el('div', { class: 'pick-grid' }, top.map((x, i) => pickCard(app, x, i))),
        list.length > 6 && el('div', { class: 'section-h', style: { marginTop: '20px' } }, `Everything else (${list.length - 6})`),
        list.length > 6 && el('div', { class: 'card place-list' }, list.slice(6, 80).map((x) => placeRow(app, x))),
        el('p', { class: 'small faint', style: { marginTop: '18px' } }, 'Restaurant data © OpenStreetMap contributors · ZIP lookup by Zippopotam.us. Orbit isn’t affiliated with Uber Eats. Scores are based on distance, opening hours and how well the food travels, not star ratings. Check ratings and menus in the Uber Eats app before ordering.'),
      ),
      side,
    ),
  );
}

function moodBanner(app, mood) {
  const exam = examsSoon(app.data, 2)[0];
  if (mood === 'study' && exam) return `📚 You’ve got “${exam.title}” coming up. These picks favor steady energy (protein + carbs, not a grease bomb) so you stay sharp.`;
  if (mood === 'study') return '📚 Study fuel: protein + fiber keeps your focus steady. Heavy, greasy meals cause the 3pm-style crash.';
  if (mood === 'late') return '🌙 Late-night mode: places open late rank higher. Don’t forget: sleep is when memories lock in. 😴';
  if (mood === 'cheap') return '💸 Cheap eats: big portions and fast food rank higher. Tip: pickup skips the delivery fee.';
  if (mood === 'group') return '👥 Group order: shareable food that’s easy to split. Uber Eats “Group Order” lets everyone add their own items.';
  if (mood === 'healthy') return '🥗 Light & healthy: bowls, salads and grilled stuff rank higher.';
  return '🎉 Treat yourself. You earned it.';
}

const emojiOf = (p) => (p.ckey ? cuisineInfo(p.ckey)?.emoji : null) || (p.amenity === 'cafe' ? '☕' : '🍽️');
const cuisineLabel = (p) => (p.ckey ? cuisineInfo(p.ckey)?.label : null) || (p.cuisines[0] ? p.cuisines[0].replace(/_/g, ' ') : p.amenity === 'fast_food' ? 'Fast food' : 'Restaurant');

function pickCard(app, x, i) {
  const { p, score, why } = x;
  const adv = orderAdvice(p);
  return el(
    'div',
    { class: `card pick${i === 0 ? ' first' : ''}` },
    el(
      'div',
      { class: 'pick-head' },
      el('div', { class: 'pick-emoji' }, emojiOf(p)),
      el('div', { style: { flex: 1, minWidth: 0 } }, el('div', { class: 'pick-name' }, i === 0 ? '👑 ' : '', p.name), el('div', { class: 'small muted' }, `${cuisineLabel(p)} · ${p.dist.toFixed(1)} mi`)),
      el('div', { class: 'score', title: 'Orbit’s “worth ordering” score' }, String(score)),
    ),
    el('div', { class: 'why' }, why.slice(0, 3).map((w) => el('span', { class: 'why-chip' }, w))),
    el('div', { class: 'order-preview' }, el('span', { class: 'small muted' }, adv.source === 'chain' ? 'Order this:' : 'Safe bet:'), el('b', {}, adv.picks[0][0])),
    el('div', { class: 'row', style: { marginTop: 'auto' } }, el('a', { class: 'btn primary sm', href: ubereatsUrl(p.name), target: '_blank', rel: 'noopener noreferrer' }, 'Open on Uber Eats ↗'), el('button', { class: 'btn sm', onclick: () => openPlace(app, p) }, 'What to order')),
  );
}

function placeRow(app, x) {
  const { p, score, hours } = x;
  return el(
    'button',
    { class: 'place-row', onclick: () => openPlace(app, p) },
    el('span', { class: 'pr-emoji' }, emojiOf(p)),
    el('span', { class: 'pr-name' }, p.name, el('span', { class: 'faint small' }, ` · ${cuisineLabel(p)}`)),
    el('span', { class: 'small muted' }, hours ? hours.label : ''),
    el('span', { class: 'small muted' }, `${p.dist.toFixed(1)} mi`),
    el('span', { class: 'score sm' }, String(score)),
  );
}

function rate(app, id, v) {
  const m = meals(app);
  m.ratings[id] = m.ratings[id] === v ? undefined : v;
  if (m.ratings[id] === undefined) delete m.ratings[id];
  app.commit();
  toast(v === 1 ? '👍 Noted. It’ll rank higher.' : '👎 Got it. It’ll rank lower.');
}

export function openPlace(app, p) {
  const m = meals(app);
  const { score, why, hours, info } = scorePlace(p, { mood: app.viewState.meals?.mood, meals: m });
  const adv = orderAdvice(p);
  const fav = m.favs.includes(p.id);
  modal(
    p.name,
    (ctl) =>
      el(
        'div',
        { class: 'stack place-detail' },
        el(
          'div',
          { class: 'row wrap' },
          el('span', { class: 'pick-emoji' }, emojiOf(p)),
          el('div', { style: { flex: 1 } }, el('div', {}, el('b', {}, cuisineLabel(p)), ` · ${p.dist.toFixed(1)} mi away`), el('div', { class: 'small muted' }, [hours?.label, p.addr].filter(Boolean).join(' · ') || 'Hours not listed. Check the app.')),
          el('div', { class: 'score big-score' }, String(score)),
        ),
        el('div', { class: 'why' }, why.map((w) => el('span', { class: 'why-chip' }, w))),
        Object.keys(p.diet).length > 0 && el('div', { class: 'small' }, '🌱 ', Object.keys(p.diet).map((d) => d.replace('_', '-')).join(', ')),
        el('div', { class: 'section-h' }, adv.source === 'chain' ? '🧾 What to order here' : adv.source === 'cuisine' ? `🧾 What to order at a ${info?.label || ''} place` : '🧾 What to order'),
        el(
          'ol',
          { class: 'order-list' },
          adv.picks.map(([dish, note]) => el('li', {}, el('b', {}, dish), note && el('div', { class: 'small muted' }, note))),
        ),
        adv.hack && el('div', { class: 'tip-box' }, '💡 ', adv.hack),
        adv.skip && el('div', { class: 'skip-box' }, '🚫 Skip: ', adv.skip),
        adv.source === 'cuisine' && el('div', { class: 'small faint' }, 'These are the dishes that usually travel best for this kind of food. Check their actual menu (and the “Most popular” section) in Uber Eats.'),
        adv.source === 'chain' && el('div', { class: 'small faint' }, 'Chain menus change. If something’s gone, look at the “Most popular” section.'),
        el(
          'div',
          { class: 'row wrap' },
          el('a', { class: 'btn primary', href: ubereatsUrl(p.name), target: '_blank', rel: 'noopener noreferrer' }, 'Open on Uber Eats ↗'),
          el(
            'button',
            {
              class: 'btn',
              onclick: (e) => {
                m.history = [...(m.history || []), { id: p.id, name: p.name, at: new Date().toISOString() }].slice(-40);
                const r = e.currentTarget.getBoundingClientRect();
                confetti(r.left + r.width / 2, r.top, 20);
                toast(`🧾 Logged. Rate ${p.name} later on the Meals page.`);
                app.commit();
                ctl.close();
              },
            },
            '🧾 I ordered this',
          ),
          el(
            'button',
            {
              class: `btn${fav ? ' on' : ''}`,
              onclick: () => {
                m.favs = fav ? m.favs.filter((x) => x !== p.id) : [...m.favs, p.id];
                app.commit();
                ctl.close();
                openPlace(app, p);
              },
            },
            fav ? '★ Favorited' : '☆ Favorite',
          ),
          p.website && /^https?:\/\//.test(p.website) && el('a', { class: 'btn', href: p.website, target: '_blank', rel: 'noopener noreferrer' }, 'Website ↗'),
          el('a', { class: 'btn', href: `https://www.openstreetmap.org/${p.id}`, target: '_blank', rel: 'noopener noreferrer' }, 'Map ↗'),
        ),
      ),
    { center: true },
  );
}

// "Decide for me": a quick slot-machine spin that slows to a stop.
function spin(app, options) {
  if (!options.length) return;
  const calm = document.documentElement.dataset.calm === 'on' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const winner = options[crypto.getRandomValues(new Uint32Array(1))[0] % options.length];
  const reel = el('div', { class: 'reel' }, el('div', { class: 'reel-emoji' }, '🎲'), el('div', { class: 'reel-name' }, '…'));
  const ctl = modal('Deciding…', () => el('div', { class: 'stack', style: { alignItems: 'center' } }, reel), { center: true });
  let i = 0;
  let delay = 50;
  const step = () => {
    const x = i++ < 18 && !calm ? options[i % options.length] : winner;
    clear(reel);
    add(reel, el('div', { class: 'reel-emoji' }, emojiOf(x.p)), el('div', { class: 'reel-name' }, x.p.name));
    if (x === winner && (i >= 18 || calm)) {
      reel.classList.add('landed');
      confetti(window.innerWidth / 2, window.innerHeight / 2.5, 40);
      setTimeout(() => {
        ctl.close();
        openPlace(app, winner.p);
      }, calm ? 200 : 900);
      return;
    }
    delay *= 1.14;
    setTimeout(step, delay);
  };
  step();
}

