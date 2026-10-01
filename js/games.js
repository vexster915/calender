// Game modes that make studying feel like playing — built for brains that crave novelty,
// speed and instant feedback (ADHD-friendly): Blitz, Boss Battle, daily quests, combos,
// mystery loot and little sound effects. Everything still feeds the same cards and XP.
import { el, add, dayKey, clamp, TOUCH, kbd } from './util.js';
import { toast, confetti } from './ui.js';
import { grade, isNew, logStudy, shuffle, dueCount } from './srs.js';
import { checkAnswer } from './gen.js';
import { addXP } from './focus.js';

// ------------------------------------------------------------------ question helpers
function qa(card, flip = false) {
  if (card.kind === 'cloze' || card.kind === 'qa' || !flip) return { q: card.term, a: card.def };
  return { q: card.def, a: card.term };
}

// Builds a multiple-choice question; distractors come from the same side of other cards.
function makeChoice(card, cards, flip) {
  const { q, a } = qa(card, flip);
  const pool = shuffle(cards.filter((c) => c.id !== card.id && (c.kind === 'cloze') === (card.kind === 'cloze')).map((c) => qa(c, flip).a));
  const wrong = [];
  for (const x of pool) if (x && x !== a && !wrong.includes(x) && wrong.length < 3) wrong.push(x);
  if (wrong.length < 3) for (const c of shuffle(cards)) if (c.id !== card.id && wrong.length < 3 && !wrong.includes(c.def) && c.def !== a) wrong.push(c.def);
  return { cardId: card.id, q, a, choices: shuffle([a, ...wrong]), t0: Date.now() };
}

// ------------------------------------------------------------------ sound effects
let actx = null;
export function sfx(app, kind) {
  if (app.data.settings.sfx === false) return;
  try {
    actx ||= new (window.AudioContext || window.webkitAudioContext)();
    const notes = { ok: [660, 880], combo: [660, 880, 1175], bad: [220, 160], hit: [140, 90], win: [523, 659, 784, 1047], tick: [1200] }[kind] || [440];
    notes.forEach((f, i) => {
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = kind === 'bad' || kind === 'hit' ? 'square' : 'triangle';
      o.frequency.value = f;
      const t = actx.currentTime + i * 0.07;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(kind === 'tick' ? 0.03 : 0.08, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(actx.destination);
      o.start(t);
      o.stop(t + 0.18);
    });
  } catch {
    /* sound is a bonus */
  }
}

// ------------------------------------------------------------------ daily tallies + quests
export function daily(data) {
  const k = dayKey(new Date());
  if (data.daily?.day !== k) data.daily = { day: k, blitz: 0, bestCombo: 0, bosses: 0, rounds: 0, reviews: 0, sets: [], claimed: [], chest: false };
  return data.daily;
}
export function tally(data, key, n = 1) {
  const d = daily(data);
  if (key === 'bestCombo') d.bestCombo = Math.max(d.bestCombo, n);
  else if (key === 'set') {
    if (n && !d.sets.includes(n)) d.sets.push(n);
  } else d[key] = (d[key] || 0) + n;
}

const QUESTS = [
  { id: 'cards', icon: '🃏', text: (t) => `Answer ${t} cards`, target: 25, get: (data) => data.studyLog[dayKey(new Date())]?.cards || 0 },
  { id: 'correct', icon: '🎯', text: (t) => `Get ${t} answers right`, target: 15, get: (data) => data.studyLog[dayKey(new Date())]?.correct || 0 },
  { id: 'combo', icon: '🔥', text: (t) => `Hit a ${t}× combo in Blitz`, target: 8, get: (data) => daily(data).bestCombo },
  { id: 'blitz', icon: '⚡', text: (t) => `Play ${t} Blitz rounds`, target: 2, get: (data) => daily(data).blitz },
  { id: 'boss', icon: '🐉', text: () => 'Defeat a boss', target: 1, get: (data) => daily(data).bosses },
  { id: 'rounds', icon: '🪐', text: (t) => `Finish ${t} Learn rounds`, target: 2, get: (data) => daily(data).rounds },
  { id: 'sets', icon: '📚', text: (t) => `Study ${t} different sets`, target: 2, get: (data) => daily(data).sets.length },
  { id: 'reviews', icon: '🧠', text: (t) => `Do ${t} spaced reviews`, target: 10, get: (data) => daily(data).reviews },
  { id: 'focus', icon: '⏱', text: () => 'Finish a focus-timer session', target: 1, get: (data) => data.focusLog.filter((f) => f.day === dayKey(new Date())).length },
];
const QUEST_XP = 30;
const CHEST_XP = 60;

// Same 3 quests all day; a different mix tomorrow.
export function todaysQuests(data) {
  const k = dayKey(new Date());
  let h = 0;
  for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const pool = QUESTS.filter((q) => (q.id === 'sets' ? data.sets.length >= 2 : q.id === 'reviews' ? dueCount(data) > 0 || daily(data).reviews > 0 : true));
  const picked = [];
  while (picked.length < 3 && pool.length) {
    h = (h * 1103515245 + 12345) >>> 0;
    picked.push(pool.splice(h % pool.length, 1)[0]);
  }
  return picked.map((q) => {
    const have = q.get(data);
    return { ...q, label: q.text(q.target), have: Math.min(have, q.target), done: have >= q.target, claimed: daily(data).claimed.includes(q.id) };
  });
}

export function questCard(app) {
  const { data } = app;
  if (!data.sets.some((s) => s.cards.length)) return null;
  const quests = todaysQuests(data);
  const d = daily(data);
  const allClaimed = quests.every((q) => q.claimed);
  const claim = (q, btn) => {
    d.claimed.push(q.id);
    addXP(data, QUEST_XP);
    sfx(app, 'win');
    const r = btn.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top, 24);
    toast(`${q.icon} Quest complete! +${QUEST_XP} XP`);
    app.commit();
  };
  return el(
    'div',
    { class: 'card quests' },
    el('h3', {}, '🗺️ Daily quests', el('span', { class: 'spacer' }), el('span', { class: 'faint small', style: { textTransform: 'none', letterSpacing: 0 } }, 'new ones every day')),
    quests.map((q) =>
      el(
        'div',
        { class: `quest${q.done ? ' done' : ''}` },
        el('div', { class: 'quest-icon' }, q.icon),
        el('div', { style: { flex: 1, minWidth: 0 } }, el('div', { class: 'quest-name' }, q.label), el('div', { class: 'quest-bar' }, el('div', { style: { width: `${(q.have / q.target) * 100}%` } }))),
        q.claimed ? el('span', { class: 'quest-claimed' }, '✓') : q.done ? el('button', { class: 'btn sm primary', onclick: (e) => claim(q, e.currentTarget) }, `Claim +${QUEST_XP}`) : el('span', { class: 'small muted' }, `${q.have}/${q.target}`),
      ),
    ),
    allClaimed &&
      (d.chest
        ? el('div', { class: 'small muted', style: { textAlign: 'center' } }, '🏆 All quests done today. Legendary!')
        : el(
            'button',
            {
              class: 'btn primary chest-btn',
              onclick: (e) => {
                d.chest = true;
                addXP(data, CHEST_XP);
                sfx(app, 'win');
                const r = e.currentTarget.getBoundingClientRect();
                confetti(r.left + r.width / 2, r.top, 60);
                toast(`🎁 Quest chest opened: +${CHEST_XP} XP!`);
                app.commit();
              },
            },
            '🎁 Open the quest chest',
          )),
  );
}

// ------------------------------------------------------------------ mystery loot (variable rewards)
const LOOT = [
  { w: 60, rarity: 'Common', xp: 10, icon: '🔹' },
  { w: 30, rarity: 'Rare', xp: 25, icon: '💎' },
  { w: 10, rarity: 'Epic', xp: 60, icon: '🌟' },
];
export function rollLoot(app, s, count) {
  if (s.loot !== undefined) return s.loot;
  const [r] = crypto.getRandomValues(new Uint32Array(1));
  if (count < 3 || r % 100 >= 40) return (s.loot = null);
  let roll = (r >>> 8) % 100;
  const drop = LOOT.find((l) => (roll -= l.w) < 0) || LOOT[0];
  addXP(app.data, drop.xp);
  s.loot = drop;
  app.save();
  return drop;
}
export function lootBanner(loot) {
  if (!loot) return null;
  return el('div', { class: `loot loot-${loot.rarity.toLowerCase()}` }, el('span', { class: 'loot-icon' }, loot.icon), el('div', {}, el('b', {}, `Mystery orb — ${loot.rarity}!`), el('div', { class: 'small' }, `+${loot.xp} bonus XP`)));
}

// ------------------------------------------------------------------ sessions
const BLITZ_MS = 60000;
const BOSSES = [
  ['🐉', 'The Deadline Dragon'],
  ['👾', 'Brain Fog Golem'],
  ['🦑', 'The Procrastinkraken'],
  ['🤖', 'Captain Cram-Bot'],
  ['👻', 'The Pop-Quiz Phantom'],
  ['🧌', 'Distraction Troll'],
  ['🦖', 'Tyranno-Test-Rex'],
];
const TAUNTS = ['“Is that all you’ve got?”', '“My scales are made of homework!”', '“You’ll never pass me!”', '“I feed on unread notes!”'];
const OUCH = ['“ARGH!”', '“Lucky guess…”', '“Impossible!”', '“Not my weak spot!”', '“Ow ow ow!”'];

export function newGame(set, mode) {
  const order = shuffle(set.cards.map((c) => c.id));
  if (mode === 'blitz') return { order, i: 0, score: 0, combo: 0, maxCombo: 0, answered: 0, correct: 0, missed: [], q: null, endsAt: null, flash: null, done: false };
  const [emoji, name] = BOSSES[Math.floor(Math.random() * BOSSES.length)];
  const maxHp = 10 * clamp(set.cards.length, 6, 14);
  return { order, i: 0, boss: { emoji, name, hp: maxHp, maxHp }, hearts: 5, answered: 0, correct: 0, combo: 0, missed: [], q: null, log: [`${emoji} ${name} appears! Answer questions to attack.`], flash: null, done: false };
}

function nextQ(s, set) {
  if (s.i >= s.order.length) {
    s.order = shuffle(s.order);
    s.i = 0;
  }
  const id = s.order[s.i++];
  const card = set.cards.find((c) => c.id === id);
  if (!card) return set.cards.length ? makeChoice(set.cards[0], set.cards, false) : null;
  return makeChoice(card, set.cards, Math.random() < 0.35);
}
// Little flame that grows with your streak (Learn & Review).
export function comboChip(combo) {
  if (!combo || combo < 3) return null;
  return el('span', { class: `combo-badge m${mult(combo)}`, title: 'Correct in a row' }, `🔥 ${combo}`);
}
const mult = (combo) => (combo >= 10 ? 4 : combo >= 6 ? 3 : combo >= 3 ? 2 : 1);

// ---------- Blitz: 60 seconds, combo multipliers, fever mode ----------
export function renderBlitz(app, s, set, top, finish, summary) {
  if (!s.endsAt) {
    // Ready screen — a beat to get set before the clock starts.
    const start = () => ((s.endsAt = Date.now() + BLITZ_MS), (s.started = Date.now()), (s.q = nextQ(s, set)), app.render());
    s.keys = { ' ': start, Enter: start };
    return el(
      'div',
      { class: 'study-body' },
      el(
        'div',
        { class: 'card summary game-intro' },
        el('div', { class: 'big' }, '⚡'),
        el('h3', { style: { justifyContent: 'center' } }, 'Blitz'),
        el('p', { class: 'muted' }, `60 seconds. ${TOUCH ? 'Tap fast.' : 'Pick fast with keys 1–4.'} Right answers chain a combo (×2 at 3, ×3 at 6, ×4 FEVER at 10) and add +1s. Misses cost 3s.`),
        set.bestBlitz ? el('div', { class: 'small' }, `🏆 Your best: ${set.bestBlitz.toLocaleString()}`) : null,
        el('button', { class: 'btn primary big-btn', style: { marginTop: '14px' }, onclick: start }, `Start!${kbd(' (space)')}`),
      ),
    );
  }
  const left = () => Math.max(0, s.endsAt - Date.now());
  if (!s.done && left() <= 0) {
    s.done = true;
    clearInterval(s.timer);
    const xp = Math.round(s.score / 100);
    addXP(app.data, xp);
    tally(app.data, 'blitz');
    tally(app.data, 'bestCombo', s.maxCombo);
    tally(app.data, 'set', set.id);
    s.record = s.score > (set.bestBlitz || 0) && s.score > 0;
    if (s.record) set.bestBlitz = s.score;
    s.xp = xp;
    sfx(app, 'win');
    finish({ cards: s.answered, correct: s.correct });
  }
  if (s.done) {
    return summary({
      big: s.score.toLocaleString(),
      line: s.record ? '🏆 NEW PERSONAL BEST!' : `points · best ${(set.bestBlitz || 0).toLocaleString()}`,
      details: el(
        'div',
        { class: 'game-stats' },
        el('div', {}, el('b', {}, `${s.answered ? Math.round((s.correct / s.answered) * 100) : 0}%`), el('span', {}, 'accuracy')),
        el('div', {}, el('b', {}, `${s.maxCombo}×`), el('span', {}, 'best combo')),
        el('div', {}, el('b', {}, String(s.correct)), el('span', {}, 'correct')),
        el('div', {}, el('b', {}, `+${s.xp}`), el('span', {}, 'XP')),
      ),
      missed: s.missed,
      again: () => Object.assign(s, newGame(set, 'blitz'), { started: Date.now(), celebrated: false, loot: undefined }) && app.render(),
    });
  }

  clearInterval(s.timer);
  s.timer = setInterval(() => {
    if (app.viewState.study?.session !== s || app.view !== 'study') return clearInterval(s.timer);
    const t = document.querySelector('.blitz-time');
    const bar = document.querySelector('.blitz-bar > div');
    if (t) t.textContent = `${(left() / 1000).toFixed(1)}s`;
    if (bar) bar.style.width = `${(left() / BLITZ_MS) * 100}%`;
    if (left() <= 0) app.render();
  }, 100);

  const q = s.q;
  const m = mult(s.combo);
  const pick = (choice) => {
    if (s.done) return;
    const card = set.cards.find((c) => c.id === q.cardId);
    s.answered++;
    if (choice === q.a) {
      s.correct++;
      s.combo++;
      s.maxCombo = Math.max(s.maxCombo, s.combo);
      const speed = Date.now() - q.t0 < 2000 ? 50 : 0;
      s.score += 100 * mult(s.combo) + speed;
      s.endsAt += 1000;
      s.flash = speed ? 'ok fast' : 'ok';
      sfx(app, [3, 6, 10].includes(s.combo) ? 'combo' : 'ok');
      if ([3, 6, 10].includes(s.combo)) s.pop = s.combo === 10 ? '🔥 FEVER ×4!' : `Combo ×${mult(s.combo)}!`;
    } else {
      s.combo = 0;
      s.endsAt -= 3000;
      s.flash = 'bad';
      if (card && !s.missed.includes(card.id)) s.missed.push(card.id);
      if (card) grade(card, 0);
      sfx(app, 'bad');
      s.lastMiss = { q: q.q, a: q.a };
    }
    if (card) logStudy(app.data, { cards: 1, correct: choice === q.a ? 1 : 0, fresh: isNew(card) ? 1 : 0 });
    s.q = nextQ(s, set);
    app.render();
  };
  s.keys = Object.fromEntries(q.choices.map((c, i) => [String(i + 1), () => pick(c)]));
  const flash = s.flash;
  const pop = s.pop;
  s.flash = null;
  s.pop = null;
  add(top, el('span', { class: 'blitz-time' }, `${(left() / 1000).toFixed(1)}s`));
  return el(
    'div',
    { class: `study-body blitz${s.combo >= 10 ? ' fever' : ''}` },
    el('div', { class: 'blitz-bar' }, el('div', { style: { width: `${(left() / BLITZ_MS) * 100}%` } })),
    el(
      'div',
      { class: 'blitz-hud' },
      el('div', { class: `blitz-score${flash?.startsWith('ok') ? ' bump' : ''}` }, s.score.toLocaleString()),
      el('div', { class: `combo-badge m${m}` }, s.combo ? `🔥 ${s.combo} combo · ×${m}` : 'Build a combo!'),
      pop && el('div', { class: 'combo-pop' }, pop),
    ),
    el(
      'div',
      { class: `card game-q${flash === 'bad' ? ' shake' : flash ? ' glow' : ''}` },
      el('div', { class: 'face-text' }, q.q),
      s.lastMiss && flash === 'bad' && el('div', { class: 'small miss-note' }, `✗ “${s.lastMiss.q.slice(0, 60)}” → ${s.lastMiss.a.slice(0, 80)}`),
    ),
    el(
      'div',
      { class: 'choice-grid' },
      q.choices.map((c, i) => el('button', { class: 'choice', onclick: () => pick(c) }, el('span', { class: 'key' }, String(i + 1)), el('span', {}, c))),
    ),
  );
}

// ---------- Boss battle: answer to attack, typed answers are power attacks ----------
export function renderBoss(app, s, set, top, finish, summary) {
  const b = s.boss;
  if (s.done) {
    return summary({
      big: s.won ? 'VICTORY!' : 'Defeated…',
      line: s.won ? `${b.name} is down. +${s.xp} XP` : 'Bosses are supposed to be hard. Every hit still counted — try again?',
      details: el(
        'div',
        { class: 'game-stats' },
        el('div', {}, el('b', {}, `${s.answered ? Math.round((s.correct / s.answered) * 100) : 0}%`), el('span', {}, 'accuracy')),
        el('div', {}, el('b', {}, `${b.maxHp - b.hp}`), el('span', {}, 'damage dealt')),
        el('div', {}, el('b', {}, `${'❤️'.repeat(s.hearts) || '💔'}`), el('span', {}, 'hearts left')),
      ),
      missed: s.missed,
      again: () => Object.assign(s, newGame(set, 'boss'), { started: Date.now(), celebrated: false, loot: undefined }) && app.render(),
    });
  }
  s.q ||= nextQ(s, set);
  const q = s.q;
  // Every 3rd attack is a POWER attack: type the answer for double damage.
  const power = s.answered % 3 === 2;
  const enraged = b.hp <= b.maxHp / 2;
  const end = (won) => {
    s.done = true;
    s.won = won;
    s.xp = won ? 40 + s.correct * 2 : s.correct * 2;
    addXP(app.data, s.xp);
    if (won) tally(app.data, 'bosses');
    tally(app.data, 'set', set.id);
    sfx(app, won ? 'win' : 'bad');
    finish({ cards: s.answered, correct: s.correct });
  };
  const resolve = (ok, given) => {
    const card = set.cards.find((c) => c.id === q.cardId);
    s.answered++;
    if (ok) {
      s.correct++;
      s.combo++;
      const fast = Date.now() - q.t0 < 5000;
      const dmg = Math.round((power ? 20 : 10) * (fast ? 1.5 : 1) * (s.combo >= 5 ? 1.25 : 1));
      b.hp = Math.max(0, b.hp - dmg);
      s.flash = 'hit';
      s.log.unshift(`${power ? '💥 POWER ATTACK' : fast ? '⚡ Critical hit' : '⚔️ Hit'} for ${dmg}! ${b.emoji} ${OUCH[s.answered % OUCH.length]}`);
      sfx(app, power ? 'combo' : 'ok');
      if (card && power) grade(card, 2);
      // A 5-answer streak heals a heart — comebacks are always possible.
      if (s.combo % 5 === 0 && s.hearts < 5) {
        s.hearts++;
        s.log.unshift('💚 5 in a row — you healed a heart!');
      }
    } else {
      s.combo = 0;
      s.hearts--;
      s.flash = 'hurt';
      s.log.unshift(`${b.emoji} strikes back! ${TAUNTS[s.answered % TAUNTS.length]} (Answer: ${q.a.slice(0, 80)})`);
      if (card && !s.missed.includes(card.id)) s.missed.push(card.id);
      if (card) grade(card, 0);
      sfx(app, 'hit');
    }
    if (card) logStudy(app.data, { cards: 1, correct: ok ? 1 : 0, fresh: isNew(card) ? 1 : 0 });
    s.log = s.log.slice(0, 4);
    s.q = nextQ(s, set);
    if (b.hp <= 0) end(true);
    else if (s.hearts <= 0) end(false);
    app.render();
    return given;
  };

  // Enraged bosses put a fuse on each question.
  clearInterval(s.timer);
  if (enraged) {
    const FUSE = power ? 25000 : 12000;
    s.timer = setInterval(() => {
      if (app.viewState.study?.session !== s || app.view !== 'study' || s.q !== q) return clearInterval(s.timer);
      const f = document.querySelector('.fuse > div');
      const pct = 100 - ((Date.now() - q.t0) / FUSE) * 100;
      if (f) f.style.width = `${Math.max(0, pct)}%`;
      if (pct <= 0) {
        clearInterval(s.timer);
        resolve(false);
      }
    }, 100);
  }

  let area;
  if (power) {
    const input = el('input', { type: 'text', class: 'input', placeholder: 'Type the answer for a POWER ATTACK 💥', autocomplete: 'off', 'aria-label': 'Your answer' });
    const go = (e) => {
      e?.preventDefault();
      resolve(checkAnswer(input.value, q.a) !== 'wrong', input.value);
    };
    area = el('form', { class: 'row', onsubmit: go }, input, el('button', { class: 'btn primary', type: 'submit' }, 'Attack!'));
    setTimeout(() => input.focus(), 30);
    s.keys = {};
  } else {
    area = el(
      'div',
      { class: 'choice-grid' },
      q.choices.map((c, i) => el('button', { class: 'choice', onclick: () => resolve(c === q.a) }, el('span', { class: 'key' }, String(i + 1)), el('span', {}, c))),
    );
    s.keys = Object.fromEntries(q.choices.map((c, i) => [String(i + 1), () => resolve(c === q.a)]));
  }
  const flash = s.flash;
  s.flash = null;
  add(top, el('span', { class: 'hearts', title: 'Hearts' }, '❤️'.repeat(s.hearts) + '🖤'.repeat(Math.max(0, 5 - s.hearts))));
  return el(
    'div',
    { class: 'study-body boss' },
    el(
      'div',
      { class: `card boss-arena${enraged ? ' enraged' : ''}${flash === 'hurt' ? ' shake' : ''}` },
      el('div', { class: `boss-emoji${flash === 'hit' ? ' hit' : ''}` }, b.emoji),
      el('div', { style: { flex: 1 } }, el('div', { class: 'boss-name' }, b.name, enraged ? ' — ENRAGED 😤' : ''), el('div', { class: 'hp-bar' }, el('div', { style: { width: `${(b.hp / b.maxHp) * 100}%` } })), el('div', { class: 'small muted' }, `${b.hp} / ${b.maxHp} HP${s.combo >= 5 ? ` · 🔥 ${s.combo} streak: +25% damage` : ''}`)),
    ),
    el('div', { class: 'battle-log' }, s.log.map((l, i) => el('div', { class: i ? 'faint small' : 'small' }, l))),
    el(
      'div',
      { class: `card game-q${power ? ' power' : ''}` },
      power && el('div', { class: 'power-tag' }, '💥 POWER ATTACK — type it for double damage'),
      el('div', { class: 'face-text' }, q.q),
      enraged && el('div', { class: 'fuse' }, el('div', { style: { width: '100%' } })),
    ),
    area,
  );
}
