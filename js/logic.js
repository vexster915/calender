// Planning brains: priority scoring, auto-planning study sessions, workload, grades, streaks.
import { addDays, dayKey, daysBetween, startOfDay, uid } from './util.js';
import { generateCards } from './gen.js';
import { newCard } from './srs.js';

const SAMPLE_NOTES = `UNIT 4: CELLULAR RESPIRATION

Cellular respiration is the process by which cells break down glucose to release energy in the form of ATP. It occurs in three main stages and takes place in both plant and animal cells.

Key Vocabulary
ATP: adenosine triphosphate, the main energy currency of the cell
Glycolysis – the first stage of respiration, which splits glucose into two molecules of pyruvate in the cytoplasm
Mitochondria: organelles where the Krebs cycle and electron transport chain take place
Fermentation - an anaerobic process that regenerates NAD+ so glycolysis can continue without oxygen
Aerobic: requiring oxygen
Anaerobic: not requiring oxygen
Pyruvate: the three-carbon molecule produced when glucose is split during glycolysis

The Three Stages
Glycolysis happens in the cytoplasm and produces a net gain of 2 ATP molecules. The Krebs cycle takes place in the matrix of the mitochondria and releases carbon dioxide as a waste product. The electron transport chain is the final stage and produces about 34 ATP molecules by using oxygen as the final electron acceptor.

The Krebs cycle was discovered by Hans Krebs in 1937, who later won the Nobel Prize for this work. Without oxygen, cells rely on fermentation, which produces lactic acid in muscle cells and ethanol in yeast. Lactic acid buildup contributes to muscle fatigue during intense exercise.

Q: Where does glycolysis take place?
A: In the cytoplasm
Q: What is the final electron acceptor in the electron transport chain?
A: Oxygen`;


export const TYPE_META = {
  assignment: { label: 'Assignment', icon: '✎', importance: 1.5, defaultMin: 60 },
  exam: { label: 'Exam', icon: '◆', importance: 3, defaultMin: 240 },
  quiz: { label: 'Quiz', icon: '◇', importance: 2, defaultMin: 60 },
  project: { label: 'Project', icon: '▲', importance: 2.5, defaultMin: 300 },
  reading: { label: 'Reading', icon: '❑', importance: 1, defaultMin: 45 },
  lab: { label: 'Lab', icon: '⚗', importance: 1.5, defaultMin: 90 },
  event: { label: 'Event', icon: '●', importance: 0.5, defaultMin: 0 },
};

export const CLASS_COLORS = ['#7c5cff', '#ff6b8b', '#1fc8a9', '#ffb020', '#3aa0ff', '#ff7a45', '#b55cff', '#43d17a', '#f25f5c', '#00b8d9'];

export function emptyData() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    settings: {
      theme: 'auto',
      autoLockMin: 15,
      sessionMin: 45,
      dailyCapMin: 180,
      focusMin: 25,
      shortBreakMin: 5,
      longBreakMin: 15,
      dailyGoal: 30,
      newPerDay: 15,
    },
    classes: [],
    items: [],
    focusLog: [],
    activity: [],
    attachments: [],
    sets: [],
    docs: [],
    courses: [],
    studyLog: {},
  };
}

export function remainingMin(item) {
  if (item.done) return 0;
  const est = item.estimateMin ?? TYPE_META[item.type]?.defaultMin ?? 60;
  return Math.max(0, est - (item.spentMin || 0));
}

// Priority: how much work is left, divided by how much time is left, scaled by importance.
// Result is roughly "hours of work needed per remaining day" × importance.
export function priority(item, now = new Date()) {
  if (item.done || !item.due) return { score: 0, level: 'none', label: '' };
  const meta = TYPE_META[item.type] || TYPE_META.assignment;
  const importance = item.weight ? 1 + item.weight / 10 : meta.importance;
  const hoursLeft = (new Date(item.due) - now) / 3600000;
  if (hoursLeft < 0) return { score: 1000 + importance, level: 'overdue', label: 'Overdue' };
  const daysLeft = Math.max(hoursLeft / 24, 0.1);
  const workHours = Math.max(remainingMin(item), 15) / 60;
  const score = (importance * (workHours + 0.5)) / (daysLeft + 0.5);
  const level = score > 3 ? 'critical' : score > 1.2 ? 'high' : score > 0.4 ? 'steady' : 'chill';
  const label = { critical: 'Critical', high: 'High', steady: 'Steady', chill: 'Chill' }[level];
  return { score, level, label };
}

export function sortByPriority(items, now = new Date()) {
  return [...items].sort((a, b) => priority(b, now).score - priority(a, now).score || new Date(a.due) - new Date(b.due));
}

// ---------- auto-planner ----------
// Splits the remaining work for an item into study sessions spread over the days before it's due.
//  * Exams/quizzes use spaced repetition (sessions 1, 2, 4, 7, 11... days before) — spacing beats cramming.
//  * Everything else is front-loaded onto your lightest days, so nothing piles up the night before.
export function autoPlan(item, data, now = new Date()) {
  const keep = (item.plan || []).filter((s) => s.done);
  const remaining = remainingMin(item);
  if (!item.due || remaining <= 0) return keep;

  const sessionLen = data.settings.sessionMin || 45;
  const due = new Date(item.due);
  const start = now.getHours() >= 21 ? addDays(startOfDay(now), 1) : startOfDay(now);
  let end = addDays(startOfDay(due), -1);
  if (due.getHours() >= 17 && !['exam', 'quiz'].includes(item.type)) end = startOfDay(due); // evening deadline: due-day work is fair game
  if (end < start) end = start;
  const span = daysBetween(start, end) + 1;

  const load = dailyLoad(data, now, item.id);
  let days;
  if (item.type === 'exam' || item.type === 'quiz') {
    const offsets = [1, 2, 4, 7, 11, 16, 22];
    days = offsets.map((o) => addDays(startOfDay(due), -o)).filter((d) => d >= start && d <= end);
    if (!days.length) days = [end];
  } else {
    days = [];
    for (let i = 0; i < span; i++) days.push(addDays(start, i));
  }

  const count = Math.max(1, Math.ceil(remaining / sessionLen));
  const minutes = Array(count).fill(sessionLen);
  minutes[count - 1] = remaining - sessionLen * (count - 1);

  const planned = new Map(days.map((d) => [dayKey(d), 0]));
  const sessions = [];
  if (item.type === 'exam' || item.type === 'quiz') {
    // Round-robin across spaced days, nearest-to-exam last so the final review is freshest.
    const ordered = [...days].sort((a, b) => a - b);
    minutes.forEach((m, i) => {
      const d = ordered[i % ordered.length];
      sessions.push({ day: dayKey(d), minutes: m });
    });
  } else {
    // Greedy: each session goes to the day with the lowest total load; ties favour earlier days.
    for (const m of minutes) {
      let best = null;
      let bestScore = Infinity;
      days.forEach((d, i) => {
        const k = dayKey(d);
        const score = (load.get(k) || 0) + planned.get(k) + i * 2; // tiny bias toward earlier days
        if (score < bestScore) {
          bestScore = score;
          best = k;
        }
      });
      planned.set(best, planned.get(best) + m);
      sessions.push({ day: best, minutes: m });
    }
  }

  // Merge sessions landing on the same day.
  const merged = new Map();
  for (const s of sessions) merged.set(s.day, (merged.get(s.day) || 0) + s.minutes);
  const fresh = [...merged.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, mins]) => ({ id: uid(), day, minutes: Math.round(mins), done: false }));
  return [...keep, ...fresh];
}

// Minutes of planned work per day. Unplanned items have their remaining work spread evenly until due.
export function dailyLoad(data, now = new Date(), excludeId = null) {
  const load = new Map();
  const today = startOfDay(now);
  const add = (k, m) => load.set(k, (load.get(k) || 0) + m);
  for (const item of data.items) {
    if (item.id === excludeId || item.done || !item.due) continue;
    const open = (item.plan || []).filter((s) => !s.done);
    if (open.length) {
      for (const s of open) add(s.day, s.minutes);
    } else {
      const rem = remainingMin(item);
      if (!rem) continue;
      const days = Math.max(1, daysBetween(today, item.due));
      for (let i = 0; i < days; i++) add(dayKey(addDays(today, i)), rem / days);
    }
  }
  return load;
}

export function forecast(data, days = 14, now = new Date()) {
  const load = dailyLoad(data, now);
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(today, i);
    const k = dayKey(d);
    const deadlines = data.items.filter((it) => !it.done && it.due && dayKey(it.due) === k);
    return { date: d, key: k, minutes: Math.round(load.get(k) || 0), deadlines };
  });
}

// Sessions scheduled for a given day across all items.
export function sessionsOn(data, key) {
  const out = [];
  for (const item of data.items) {
    for (const s of item.plan || []) if (s.day === key) out.push({ item, session: s });
  }
  return out;
}

// ---------- grades ----------
export function classGrade(data, classId) {
  const graded = data.items.filter((i) => i.classId === classId && i.score != null && i.maxScore > 0);
  if (!graded.length) return null;
  const weighted = graded.filter((i) => i.weight);
  if (weighted.length === graded.length) {
    const w = weighted.reduce((s, i) => s + i.weight, 0);
    const pct = weighted.reduce((s, i) => s + (i.score / i.maxScore) * i.weight, 0) / w;
    return { pct: pct * 100, count: graded.length, method: 'weighted', weightCounted: w };
  }
  const pts = graded.reduce((s, i) => s + i.score, 0);
  const max = graded.reduce((s, i) => s + i.maxScore, 0);
  return { pct: (pts / max) * 100, count: graded.length, method: 'points' };
}

export function letter(pct) {
  if (pct == null) return '—';
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A−';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B−';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C−';
  if (pct >= 67) return 'D+';
  if (pct >= 60) return 'D';
  return 'F';
}

// "What do I need on the rest to get X?" — assumes weighted grading with weights summing toward 100.
export function neededFor(data, classId, target) {
  const g = classGrade(data, classId);
  const items = data.items.filter((i) => i.classId === classId && i.weight);
  const remainingWeight = items.filter((i) => i.score == null).reduce((s, i) => s + i.weight, 0);
  if (!g || g.method !== 'weighted' || remainingWeight <= 0) return null;
  const earned = (g.pct / 100) * g.weightCounted;
  const needed = ((target / 100) * (g.weightCounted + remainingWeight) - earned) / remainingWeight;
  return { needed: needed * 100, remainingWeight };
}

// ---------- streaks ----------
export function logActivity(data, when = new Date()) {
  const k = dayKey(when);
  if (!data.activity.includes(k)) data.activity.push(k);
  if (data.activity.length > 800) data.activity = data.activity.slice(-800);
}

export function streak(data, now = new Date()) {
  const set = new Set(data.activity);
  let d = startOfDay(now);
  if (!set.has(dayKey(d))) d = addDays(d, -1);
  let n = 0;
  while (set.has(dayKey(d))) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function focusMinutesOn(data, key) {
  return data.focusLog.filter((f) => f.day === key).reduce((s, f) => s + f.minutes, 0);
}

// ---------- class meetings ----------
export function meetingsOn(data, date) {
  const dow = new Date(date).getDay();
  const out = [];
  for (const c of data.classes) {
    for (const m of c.meetings || []) if (m.day === dow) out.push({ cls: c, meeting: m });
  }
  return out.sort((a, b) => a.meeting.start.localeCompare(b.meeting.start));
}

// ---------- export ----------
function icsEscape(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}
function icsDate(d) {
  return new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
export function toICS(data) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Orbit//School Planner//EN', 'CALSCALE:GREGORIAN'];
  const stamp = icsDate(new Date());
  for (const item of data.items) {
    if (!item.due) continue;
    const cls = data.classes.find((c) => c.id === item.classId);
    const start = new Date(item.due);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${item.id}@orbit`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(new Date(start.getTime() + 30 * 60000))}`,
      `SUMMARY:${icsEscape((cls ? `[${cls.code || cls.name}] ` : '') + item.title)}`,
      `DESCRIPTION:${icsEscape(`${TYPE_META[item.type]?.label || ''}${item.notes ? `\n${item.notes}` : ''}`)}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// ---------- sample semester ----------
export function sampleData(data, now = new Date()) {
  const t = startOfDay(now);
  const at = (days, h, m = 0) => {
    const d = addDays(t, days);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const cls = [
    { name: 'Biology', code: 'BIO', teacher: 'Dr. Reyes', room: 'Sci 204', meetings: [1, 3, 5].map((day) => ({ day, start: '09:00', end: '09:50' })) },
    { name: 'Calculus', code: 'MATH', teacher: 'Prof. Chen', room: 'Hall 11', meetings: [2, 4].map((day) => ({ day, start: '10:30', end: '11:45' })) },
    { name: 'World History', code: 'HIST', teacher: 'Ms. Okafor', room: 'Lib 3', meetings: [1, 3].map((day) => ({ day, start: '13:00', end: '14:15' })) },
    { name: 'English Lit', code: 'ENG', teacher: 'Mr. Patel', room: 'Arts 7', meetings: [2, 4].map((day) => ({ day, start: '14:00', end: '15:15' })) },
  ].map((c, i) => ({ id: uid(), color: CLASS_COLORS[i], ...c }));
  const [bio, math, hist, eng] = cls.map((c) => c.id);
  const mk = (o) => ({ id: uid(), createdAt: new Date().toISOString(), spentMin: 0, subtasks: [], plan: [], done: false, notes: '', ...o });
  const items = [
    mk({ title: 'Cell respiration lab report', type: 'lab', classId: bio, due: at(3, 23, 59), estimateMin: 150, weight: 10 }),
    mk({ title: 'Unit 3 exam: derivatives', type: 'exam', classId: math, due: at(8, 10, 30), estimateMin: 300, weight: 20 }),
    mk({ title: 'Problem set 5', type: 'assignment', classId: math, due: at(1, 23, 59), estimateMin: 90, weight: 5 }),
    mk({ title: 'Read ch. 12 — Industrial Revolution', type: 'reading', classId: hist, due: at(2, 13, 0), estimateMin: 50 }),
    mk({
      title: 'Gatsby analytical essay', type: 'project', classId: eng, due: at(12, 23, 59), estimateMin: 420, weight: 15,
      subtasks: [
        { id: uid(), text: 'Pick thesis', done: true },
        { id: uid(), text: 'Gather 5 quotes', done: false },
        { id: uid(), text: 'Outline', done: false },
        { id: uid(), text: 'First draft', done: false },
        { id: uid(), text: 'Revise + cite', done: false },
      ],
    }),
    mk({ title: 'Vocab quiz', type: 'quiz', classId: eng, due: at(4, 14, 0), estimateMin: 40, weight: 3 }),
    mk({ title: 'Study group', type: 'event', classId: bio, due: at(2, 18, 0), estimateMin: 0 }),
    mk({ title: 'Quiz 2: limits', type: 'quiz', classId: math, due: at(-6, 10, 30), estimateMin: 60, weight: 5, done: true, doneAt: at(-6, 11), score: 46, maxScore: 50 }),
    mk({ title: 'Mitosis worksheet', type: 'assignment', classId: bio, due: at(-4, 23, 59), estimateMin: 45, weight: 5, done: true, doneAt: at(-5, 20), score: 18, maxScore: 20 }),
    mk({ title: 'Map project', type: 'project', classId: hist, due: at(-3, 13, 0), estimateMin: 180, weight: 10, done: true, doneAt: at(-3, 9), score: 88, maxScore: 100 }),
  ];
  items.push(mk({ title: 'Unit 4 quiz: cellular respiration', type: 'quiz', classId: bio, due: at(5, 9, 0), estimateMin: 60, weight: 8 }));
  data.classes.push(...cls);
  data.items.push(...items);
  for (const it of data.items) if (!it.done && it.type !== 'event') it.plan = autoPlan(it, data, now);
  for (let i = 1; i <= 4; i++) logActivity(data, addDays(t, -i));

  // Study sets
  const g = generateCards(SAMPLE_NOTES);
  const mkSet = (title, classId, cards, extra = {}) => ({ id: uid(), title, classId, description: '', createdAt: addDays(now, -5).toISOString(), lastStudied: null, cards, docIds: [], keyPoints: [], topics: [], bestMatchMs: null, tests: [], ...extra });
  const bioCards = g.cards.map((c) => newCard(c.term, c.def, c.kind));
  bioCards.slice(0, 5).forEach((c, i) => Object.assign(c, { seen: 2, right: 2, lvl: 1 + (i % 3), ivl: 1 + i, due: addDays(t, i % 2 ? 0 : 2).toISOString() }));
  const calc = [
    ['Power rule', 'd/dx xⁿ = n·xⁿ⁻¹'],
    ['Product rule', "(fg)' = f'g + fg'"],
    ['Quotient rule', "(f/g)' = (f'g − fg') / g²"],
    ['Chain rule', "d/dx f(g(x)) = f'(g(x))·g'(x)"],
    ['Derivative of sin x', 'cos x'],
    ['Derivative of cos x', '−sin x'],
    ['Derivative of eˣ', 'eˣ'],
    ['Derivative of ln x', '1/x'],
  ].map(([a, b]) => newCard(a, b));
  calc.forEach((c, i) => Object.assign(c, { seen: 3, right: 3, lvl: Math.min(4, 1 + i), ivl: 2 + i, due: addDays(t, i < 3 ? 0 : i).toISOString() }));
  const lit = [
    ['Nick Carraway', 'Narrator of The Great Gatsby; Daisy’s cousin from Minnesota'],
    ['Green light', 'Symbol of Gatsby’s hopes and dreams for the future with Daisy'],
    ['Valley of Ashes', 'Desolate area between West Egg and New York, symbolising moral decay'],
    ['Eyes of Doctor T. J. Eckleburg', 'Billboard often read as God watching over a morally empty society'],
    ['West Egg', 'Where “new money” lives, including Gatsby and Nick'],
    ['East Egg', 'Home of “old money”, where Tom and Daisy live'],
  ].map(([a, b]) => newCard(a, b));
  data.sets.push(
    mkSet('Unit 4 — Cellular respiration', bio, bioCards, { keyPoints: g.keyPoints, topics: g.topics }),
    mkSet('Derivative rules', cls[1].id, calc, { lastStudied: addDays(now, -1).toISOString(), bestMatchMs: 14200 }),
    mkSet("The Great Gatsby — symbols & characters", cls[3].id, lit),
  );
  for (let i = 1; i <= 4; i++) data.studyLog[dayKey(addDays(t, -i))] = { cards: 12 + i * 7, correct: 10 + i * 5, fresh: 5, minutes: 10 + i * 3 };
  return data;
}

