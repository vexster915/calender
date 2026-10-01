// Focus & ADHD support. Built around a few well-supported ideas:
//  • Starting is the hardest part → "Just 5 minutes" sprints and ONE suggested next thing (no choice paralysis).
//  • Time blindness → visible elapsed time / countdowns and gentle break check-ins.
//  • Working memory is precious → a parking lot for stray thoughts, small chunks, read-aloud.
//  • Immediate, effort-based rewards → XP for showing up, levels, and forgiving streaks (freezes), never punishment.
import { el, uid, dayKey, addDays, startOfDay, kbd } from './util.js';
import { modal, toast } from './ui.js';
import { reviewQueue, dueCount, examsSoon, setsForItem, isNew } from './srs.js';
import { parseQuickAdd } from './parse.js';
import { TYPE_META } from './logic.js';

// ------------------------------------------------------------------ comfort display
export function applyComfort(settings = {}) {
  const root = document.documentElement;
  root.dataset.text = settings.comfortText || 'normal';
  root.dataset.spacing = settings.comfortSpacing ? 'relaxed' : 'normal';
  root.dataset.calm = settings.calm ? 'on' : 'off';
}

// ------------------------------------------------------------------ XP & levels (effort, not perfection)
export const levelOf = (xp = 0) => Math.floor(Math.sqrt(xp / 40)) + 1;
export const xpForLevel = (lvl) => 40 * (lvl - 1) ** 2;
export function addXP(data, amount) {
  data.xp = Math.max(0, (data.xp || 0) + Math.round(amount));
}
export function levelProgress(xp = 0) {
  const lvl = levelOf(xp);
  const lo = xpForLevel(lvl);
  const hi = xpForLevel(lvl + 1);
  return { lvl, pct: Math.round(((xp - lo) / (hi - lo)) * 100), toNext: hi - xp };
}

// ------------------------------------------------------------------ forgiving streaks
// Every 7-day streak earns a freeze (max 2). A missed day is covered automatically by a freeze,
// so one bad day doesn't wipe out weeks of effort.
export function applyFreezes(data, now = new Date()) {
  data.frozen ||= [];
  data.freezes ??= 1; // everyone starts with one
  const active = new Set([...data.activity, ...data.frozen]);
  const today = startOfDay(now);
  // Find the last active day before today.
  let d = addDays(today, -1);
  let gap = [];
  for (let i = 0; i < 60 && !active.has(dayKey(d)); i++) {
    gap.push(dayKey(d));
    d = addDays(d, -1);
  }
  if (!active.has(dayKey(d))) return; // no history yet
  // Only cover small gaps (1–2 days) and only if we have enough freezes for the whole gap.
  if (gap.length && gap.length <= data.freezes && gap.length <= 2) {
    data.frozen.push(...gap);
    data.freezes -= gap.length;
  }
  data.frozen = data.frozen.slice(-60);
}
export function streakWithFreezes(data, now = new Date()) {
  const active = new Set([...data.activity, ...(data.frozen || [])]);
  let d = startOfDay(now);
  if (!active.has(dayKey(d))) d = addDays(d, -1);
  let n = 0;
  while (active.has(dayKey(d))) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}
export function earnFreezes(data, streakLen) {
  const earnedFor = Math.floor(streakLen / 7);
  if (earnedFor > (data.freezeEarned || 0)) {
    data.freezeEarned = earnedFor;
    if ((data.freezes ?? 1) < 2) {
      data.freezes = (data.freezes ?? 1) + 1;
      return true;
    }
  }
  return false;
}

// ------------------------------------------------------------------ read aloud
export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return toast('Read-aloud isn’t supported in this browser.');
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(String(text).replace(/_{3,}/g, 'blank'));
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
export function speakButton(text) {
  return el('button', { class: 'btn icon ghost speak', title: 'Read aloud (R)', 'aria-label': 'Read aloud', onclick: (e) => (e.stopPropagation(), speak(text)) }, '🔈');
}

// ------------------------------------------------------------------ background noise (generated, no files)
let audio = null;
export function noiseOn() {
  return !!audio;
}
export function startNoise(kind = 'brown') {
  stopNoise();
  try {
    const ctx = new AudioContext();
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w * 0.25;
      else if (kind === 'pink') {
        b0 = 0.99765 * b0 + w * 0.099046;
        b1 = 0.963 * b1 + w * 0.2965164;
        b2 = 0.57 * b2 + w * 1.0526913;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.08;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 2.8;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.35;
    src.connect(gain).connect(ctx.destination);
    src.start();
    audio = { ctx, src, kind };
  } catch {
    toast('Couldn’t start audio in this browser.');
  }
}
export function stopNoise() {
  if (!audio) return;
  try {
    audio.src.stop();
    audio.ctx.close();
  } catch {
    /* ignore */
  }
  audio = null;
}

// ------------------------------------------------------------------ parking lot (brain dump)
export function openParkingLot(app) {
  modal(
    '🅿️ Park a thought',
    (m) => {
      const input = el('input', { type: 'text', placeholder: 'Whatever popped into your head — deal with it later', maxlength: 300 });
      const save = () => {
        const t = input.value.trim();
        if (!t) return m.close();
        app.data.inbox.push({ id: uid(), text: t, at: new Date().toISOString() });
        app.commit({ render: app.view !== 'study' });
        m.close();
        toast('Parked. Back to it! 🚀');
      };
      input.addEventListener('keydown', (e) => e.key === 'Enter' && (e.preventDefault(), save()));
      return el(
        'div',
        { class: 'stack' },
        el('p', { class: 'small muted', style: { margin: 0 } }, 'Get it out of your head so it stops tugging at you. It waits on your Home page.'),
        input,
        el('div', { class: 'row' }, el('span', { class: 'spacer' }), el('button', { class: 'btn primary', onclick: save }, `Park it${kbd(' (Enter)')}`)),
      );
    },
    { center: true },
  );
}

export function parkingCard(app) {
  const items = app.data.inbox;
  if (!items.length) return null;
  return el(
    'div',
    { class: 'card' },
    el('h3', {}, `🅿️ Parking lot (${items.length})`, el('span', { class: 'spacer' }), el('span', { class: 'faint small', style: { textTransform: 'none', letterSpacing: 0 } }, 'thoughts you parked while focusing')),
    items.slice(-6).map((it) =>
      el(
        'div',
        { class: 'park-row' },
        el('span', { style: { flex: 1 } }, it.text),
        el(
          'button',
          {
            class: 'btn sm',
            title: 'Turn into a planner task',
            onclick: () => {
              const p = parseQuickAdd(it.text, app.data.classes);
              app.data.items.push({ id: uid(), title: p.title || it.text, type: p.type, classId: p.classId, due: p.due ? p.due.toISOString() : null, estimateMin: p.estimateMin ?? TYPE_META[p.type].defaultMin, weight: p.weight, spentMin: 0, subtasks: [], plan: [], notes: '', done: false, createdAt: new Date().toISOString() });
              app.data.inbox = app.data.inbox.filter((x) => x !== it);
              app.commit();
              toast('Added to your Planner');
            },
          },
          '→ Task',
        ),
        el('button', { class: 'btn icon ghost', title: 'Done / dismiss', 'aria-label': 'Dismiss', onclick: () => ((app.data.inbox = app.data.inbox.filter((x) => x !== it)), app.commit()) }, '✓'),
      ),
    ),
  );
}

// ------------------------------------------------------------------ one next thing
// Picks a single, concrete next step so you don't have to decide.
export function nextAction(app, { startStudy, openItemEditor, openCreateSet }) {
  const { data } = app;
  const now = new Date();
  const overdue = data.items.filter((i) => !i.done && i.due && new Date(i.due) < now && i.type !== 'event').sort((a, b) => new Date(a.due) - new Date(b.due))[0];
  const dueN = dueCount(data);
  const soon = examsSoon(data, 4).find((it) => setsForItem(data, it).some((s) => s.cards.length));
  const today = data.items.filter((i) => !i.done && i.due && new Date(i.due) >= now && new Date(i.due) - now < 36 * 3600000 && i.type !== 'event').sort((a, b) => new Date(a.due) - new Date(b.due))[0];
  const freshSet = [...data.sets].filter((s) => s.cards.some(isNew)).sort((a, b) => (b.lastStudied || b.createdAt).localeCompare(a.lastStudied || a.createdAt))[0];
  const mins = Math.max(1, Math.round((dueN * 8) / 60));
  if (soon) {
    const sets = setsForItem(data, soon).filter((s) => s.cards.length);
    const days = Math.max(0, Math.ceil((new Date(soon.due) - now) / 86400000));
    return { icon: '🎯', title: `Prep for “${soon.title}”`, why: days ? `It’s in ${days} day${days > 1 ? 's' : ''}. A short focused review now beats a long cram later.` : 'It’s today — a quick review will settle your nerves.', label: 'Start a 5-min sprint', run: () => startSprint(app, startStudy, sets.map((s) => s.id)) };
  }
  if (overdue) return { icon: '⏰', title: `Finish “${overdue.title}”`, why: 'It’s past due. Open it and do just the first small step.', label: 'Open it', run: () => openItemEditor(app, overdue) };
  if (dueN) return { icon: '🧠', title: `Review ${dueN} card${dueN > 1 ? 's' : ''}`, why: `About ${mins} minute${mins > 1 ? 's' : ''}. These are right at the edge of forgetting — the most valuable reviews you can do.`, label: 'Start a 5-min sprint', run: () => startSprint(app, startStudy) };
  if (today) return { icon: '📌', title: `Work on “${today.title}”`, why: 'It’s due soon. Set a 15-minute timer and only do the next tiny step.', label: 'Open it', run: () => openItemEditor(app, today) };
  if (freshSet) return { icon: '✨', title: `Learn a few new cards from “${freshSet.title}”`, why: 'Five new cards is plenty. Small and done beats big and avoided.', label: 'Start a 5-min sprint', run: () => startSprint(app, startStudy, [freshSet.id]) };
  return { icon: '📄', title: 'Add something to study', why: 'Drop in a PDF or paste notes — Orbit makes the cards.', label: 'Create a set', run: () => openCreateSet(app) };
}

// ------------------------------------------------------------------ sprints
export function startSprint(app, startStudy, setIds = null) {
  const minutes = app.data.settings.sprintMin || 5;
  const queue = reviewQueue(app.data, { setIds });
  if (!queue.length) return toast('Nothing to review right now — you’re all caught up! 🌟');
  startStudy(app, null, 'review', { setIds, sprint: true, sprintMin: minutes, endsAt: Date.now() + minutes * 60000, title: `${minutes}-minute sprint` });
}

// ------------------------------------------------------------------ break steps for big tasks
const STEP_TEMPLATES = {
  project: ['Re-read the instructions and highlight what’s required (10 min)', 'Pick a topic / angle (10 min)', 'Find 3 sources or pieces of evidence (15 min)', 'Make a rough outline (15 min)', 'Write the messy first draft of one section (15 min)', 'Finish the draft, one section at a time (15 min each)', 'Revise with a checklist (15 min)', 'Proofread + cite + submit (10 min)'],
  assignment: ['Open it and read the first question only (5 min)', 'Do the easiest questions first (15 min)', 'Do the next chunk (15 min)', 'Mark anything you’re stuck on to ask about (5 min)', 'Check answers + submit (5 min)'],
  exam: ['List the topics that will be on it (10 min)', 'Make or import a study set (10 min)', 'First Learn round on the weakest topic (15 min)', 'Practice test under time (20 min)', 'Review your mistakes (10 min)', 'Quick review the night before — then sleep (10 min)'],
  quiz: ['List what the quiz covers (5 min)', 'Learn round on that set (15 min)', 'Quick practice test (10 min)', 'Review mistakes (5 min)'],
  reading: ['Skim headings and bold words first (5 min)', 'Read the first section (10 min)', 'Write 2 sentences: what was it about? (5 min)', 'Read the next section (10 min)', 'Make 5 flashcards from it (5 min)'],
  lab: ['Re-read the procedure + rubric (10 min)', 'Organize your data into a table (10 min)', 'Make the graph (15 min)', 'Write results (15 min)', 'Write the conclusion + error analysis (15 min)'],
};
export function suggestSteps(type) {
  return (STEP_TEMPLATES[type] || STEP_TEMPLATES.assignment).map((text) => ({ id: uid(), text, done: false }));
}

// ------------------------------------------------------------------ study session chrome
// Elapsed time (time blindness), park-a-thought, noise toggle and a gentle break check-in.
let chromeTimer = null;
export function sessionChrome(app, s) {
  const settings = app.data.settings;
  s.started ||= Date.now();
  const elapsedMin = () => Math.floor((Date.now() - s.started) / 60000);
  const sprintLeft = () => Math.max(0, s.endsAt - Date.now());
  const clock = el('span', { class: 'session-clock', title: s.sprint ? 'Time left in this sprint' : 'Time studying' }, s.sprint ? fmtLeft(sprintLeft()) : `⏱ ${elapsedMin()} min`);
  const bar = s.sprint ? el('div', { class: 'sprint-bar' }, el('div', { style: { width: `${100 - (sprintLeft() / (s.sprintMin * 60000)) * 100}%` } })) : null;
  clearInterval(chromeTimer);
  chromeTimer = setInterval(() => {
    if (app.viewState.study?.session !== s || app.view !== 'study') return clearInterval(chromeTimer);
    const c = document.querySelector('.session-clock');
    if (c) c.textContent = s.sprint ? fmtLeft(sprintLeft()) : `⏱ ${elapsedMin()} min`;
    const b = document.querySelector('.sprint-bar > div');
    if (b && s.sprint) b.style.width = `${100 - (sprintLeft() / (s.sprintMin * 60000)) * 100}%`;
    if (s.sprint && sprintLeft() <= 0 && !s.done && !s.timeUp) {
      s.timeUp = true;
      app.render();
    }
    // Gentle check-in every N minutes (not during timed exams).
    const every = settings.breakMin || 0;
    if (every && s.mode !== 'exam' && !s.sprint && elapsedMin() >= every * ((s.breaksOffered || 0) + 1)) {
      s.breaksOffered = (s.breaksOffered || 0) + 1;
      toast(`You’ve been focusing ${elapsedMin()} min — nice! Stretch, water, 5-minute break?`, { ms: 9000 });
    }
  }, 1000);
  return {
    tools: el(
      'div',
      { class: 'row', style: { gap: '6px' } },
      clock,
      el('button', { class: 'btn sm ghost', title: 'Park a distracting thought (P)', onclick: () => openParkingLot(app) }, '🅿️ Park'),
      el(
        'button',
        {
          class: `btn sm ghost${noiseOn() ? ' on' : ''}`,
          title: 'Background noise — can help some people stay focused',
          onclick: (e) => {
            if (noiseOn()) stopNoise();
            else startNoise(settings.noise && settings.noise !== 'off' ? settings.noise : 'brown');
            e.currentTarget.classList.toggle('on', noiseOn());
            e.currentTarget.textContent = noiseOn() ? '🔊 Noise' : '🔈 Noise';
          },
        },
        noiseOn() ? '🔊 Noise' : '🔈 Noise',
      ),
    ),
    bar,
  };
}
function fmtLeft(ms) {
  const s = Math.ceil(ms / 1000);
  return `⏳ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} left`;
}
