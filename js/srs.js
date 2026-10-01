// Memory model: every card sits in an "orbit" (0–4) and has a next-review date.
// It's a light version of the SM-2 spaced-repetition algorithm (the one behind Anki/SuperMemo):
// each correct recall pushes the next review further out; a miss pulls it back in.
import { addDays, dayKey, startOfDay, uid } from './util.js';

export const ORBITS = [
  { name: 'New', short: 'New', color: '#8a84b3' },
  { name: 'Launching', short: 'Launch', color: '#ff6b8b' },
  { name: 'Outer orbit', short: 'Outer', color: '#ffb020' },
  { name: 'Inner orbit', short: 'Inner', color: '#3aa0ff' },
  { name: 'Mastered', short: 'Core', color: '#1fc8a9' },
];

export function newCard(term, def, kind = 'manual') {
  return { id: uid(), term, def, kind, star: false, lvl: 0, due: null, ivl: 0, ease: 2.5, seen: 0, right: 0, wrong: 0, last: null };
}

// q: 0 = again (wrong), 1 = hard, 2 = good, 3 = easy
export function grade(card, q, now = new Date()) {
  card.seen = (card.seen || 0) + 1;
  card.last = now.toISOString();
  card.ease ??= 2.5;
  card.ivl ??= 0;
  if (q === 0) {
    card.wrong = (card.wrong || 0) + 1;
    card.ease = Math.max(1.3, card.ease - 0.2);
    card.ivl = 0;
    card.lvl = Math.max(card.lvl > 0 ? 1 : 0, (card.lvl || 0) - 1);
    card.due = new Date(now.getTime() + 10 * 60000).toISOString(); // try again in 10 minutes
    return;
  }
  card.right = (card.right || 0) + 1;
  if (q === 1) {
    card.ease = Math.max(1.3, card.ease - 0.15);
    card.ivl = Math.max(1, card.ivl * 1.2);
  } else if (q === 2) {
    card.ivl = card.ivl ? card.ivl * card.ease : 1;
    card.lvl = Math.min(4, (card.lvl || 0) + 1);
  } else {
    card.ease += 0.15;
    card.ivl = card.ivl ? card.ivl * card.ease * 1.3 : 3;
    card.lvl = Math.min(4, (card.lvl || 0) + 2);
  }
  card.ivl = Math.min(card.ivl, 180);
  if (card.lvl === 0) card.lvl = 1;
  card.due = startOfDay(addDays(now, Math.round(card.ivl))).toISOString();
}

// Human label for the interval a grade would give (shown on review buttons).
export function previewInterval(card, q) {
  const c = { ...card };
  const now = new Date();
  grade(c, q, now);
  const mins = (new Date(c.due) - now) / 60000;
  if (mins < 60) return `${Math.max(1, Math.round(mins))}m`;
  const days = Math.round(mins / 1440);
  if (days < 1) return 'tmrw';
  if (days < 30) return `${days}d`;
  return `${Math.round(days / 30)}mo`;
}

export const isNew = (card) => !card.seen;
export const isDue = (card, now = new Date()) => !!card.due && new Date(card.due) <= now;

export function mastery(set) {
  const counts = [0, 0, 0, 0, 0];
  for (const c of set.cards) counts[Math.min(4, c.lvl || 0)]++;
  const n = set.cards.length;
  const pct = n ? Math.round((set.cards.reduce((s, c) => s + Math.min(4, c.lvl || 0), 0) / (4 * n)) * 100) : 0;
  return { counts, pct, n, mastered: counts[4] };
}

// Upcoming exams/quizzes per class — the calendar quietly steers what you review.
export function examsSoon(data, days = 14, now = new Date()) {
  const end = addDays(now, days);
  return data.items
    .filter((i) => !i.done && i.due && ['exam', 'quiz'].includes(i.type) && new Date(i.due) >= now && new Date(i.due) <= end)
    .sort((a, b) => new Date(a.due) - new Date(b.due));
}

export function setsForItem(data, item) {
  return data.sets.filter((s) => (item.setIds || []).includes(s.id) || (s.classId && s.classId === item.classId));
}

// Today's review queue: cards that are due, then an "exam boost" for classes with a test within
// a week (not-yet-mastered cards get pulled forward), then a few new cards.
export function reviewQueue(data, { setIds = null, now = new Date() } = {}) {
  const inScope = data.sets.filter((s) => !setIds || setIds.includes(s.id));
  const due = [];
  const boost = [];
  const fresh = [];
  const examClasses = new Set(examsSoon(data, 7, now).map((i) => i.classId).filter(Boolean));
  for (const set of inScope) {
    for (const card of set.cards) {
      if (isDue(card, now)) due.push({ set, card, why: 'due' });
      else if (!isNew(card) && card.lvl < 4 && examClasses.has(set.classId)) boost.push({ set, card, why: 'exam' });
      else if (isNew(card)) fresh.push({ set, card, why: 'new' });
    }
  }
  due.sort((a, b) => new Date(a.card.due) - new Date(b.card.due));
  boost.sort((a, b) => (a.card.lvl || 0) - (b.card.lvl || 0));
  const newToday = newCardsStudiedToday(data, now);
  const newLimit = Math.max(0, (data.settings.newPerDay ?? 15) - newToday);
  const q = [...due, ...boost.slice(0, 30), ...fresh.slice(0, setIds ? fresh.length : newLimit)];
  return q;
}

export function dueCount(data, now = new Date()) {
  let n = 0;
  for (const s of data.sets) for (const c of s.cards) if (isDue(c, now)) n++;
  return n;
}

// ---------- daily log ----------
export function logStudy(data, { cards = 0, correct = 0, fresh = 0, minutes = 0 } = {}, now = new Date()) {
  const k = dayKey(now);
  const day = (data.studyLog[k] ||= { cards: 0, correct: 0, fresh: 0, minutes: 0 });
  day.cards += cards;
  day.correct += correct;
  day.fresh += fresh;
  day.minutes += minutes;
  // XP rewards effort (showing up and doing reps), not just being right.
  data.xp = (data.xp || 0) + cards * 2 + correct + minutes;
}
export function studiedToday(data, now = new Date()) {
  return data.studyLog[dayKey(now)]?.cards || 0;
}
function newCardsStudiedToday(data, now) {
  return data.studyLog[dayKey(now)]?.fresh || 0;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
