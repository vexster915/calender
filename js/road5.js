// Road to a 5: a multi-month AP study plan from today to exam day, plus review videos and strategy.
// The plan is computed (never stored) from the exam date, where the class is in the course, how much
// time the student has each week and their current mastery / test scores, so it re-plans itself as
// they progress. Only check-offs and settings are saved (course.road).
import { el, clamp } from './util.js';
import { unitLabel, weightMid, links } from './apcatalog.js';

// ------------------------------------------------------------------ review videos
// Searches instead of single video links, so they never go stale: each opens the channel's videos for
// that unit. AP Daily (in AP Classroom) and AP Daily: Live Review are the College Board's own.
const CHANNELS = {
  bio: ['Bozeman Science', 'Amoeba Sisters', 'Crash Course Biology'],
  chem: ['The Organic Chemistry Tutor', 'Bozeman Science', 'Crash Course Chemistry'],
  phys1: ['Flipping Physics', 'The Organic Chemistry Tutor', 'Michel van Biezen'],
  phys2: ['Flipping Physics', 'The Organic Chemistry Tutor', 'Michel van Biezen'],
  physcm: ['Flipping Physics', 'Michel van Biezen'],
  apes: ['Bozeman Science', 'Crash Course'],
  calcab: ['The Organic Chemistry Tutor', '3Blue1Brown'],
  calcbc: ['The Organic Chemistry Tutor', '3Blue1Brown'],
  precalc: ['The Organic Chemistry Tutor'],
  stats: ['Stats Medic', 'StatQuest', 'Crash Course Statistics'],
  csa: [],
  csp: [],
  apush: ['Heimler’s History', 'Tom Richey', 'Crash Course US History'],
  world: ['Heimler’s History', 'Crash Course World History'],
  euro: ['Heimler’s History', 'Tom Richey'],
  gov: ['Heimler’s History', 'Tom Richey', 'Crash Course Government'],
  compgov: [],
  hug: ['Mr. Sinn'],
  psych: ['Mr. Sinn', 'Crash Course Psychology'],
  macro: ['Jacob Clifford'],
  micro: ['Jacob Clifford'],
  lang: ['Coach Hall Writes'],
  lit: [],
};
const yt = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const short = (name) => name.replace(/^AP /, 'AP ').replace(/ and Composition$/, '').replace(/: Modern$/, '');

export function videoLinks(info, u) {
  const unit = u === null || u === undefined ? null : info.units[u];
  const topic = unit ? `${unitLabel(info, u)} ${unit.title}` : 'full course review';
  const out = [
    { label: 'AP Daily (AP Classroom)', url: links(info).classroom, note: 'Official short videos for every topic in every unit, by AP teachers. Sign in with your College Board account.', official: true },
    { label: 'AP Daily: Live Review', url: yt(`${info.name} AP Daily Live Review ${unit ? unit.title : ''}`.trim()), note: 'The College Board’s own review sessions on the Advanced Placement YouTube channel.', official: true },
  ];
  for (const ch of CHANNELS[info.key] || []) out.push({ label: ch, url: yt(`${ch} ${short(info.name)} ${topic}`), note: `${ch} on YouTube` });
  out.push({ label: `YouTube: ${short(info.name)} ${unit ? unitLabel(info, u) : ''} review`.replace(/\s+/g, ' '), url: yt(`${short(info.name)} ${topic} review`), note: 'Every review video for this unit' });
  out.push({ label: 'Khan Academy', url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(`${info.name} ${unit ? unit.title : ''}`.trim())}`, note: 'Free lessons and practice questions' });
  return out;
}

// ------------------------------------------------------------------ strategy
const AREA = {
  Science: [
    'Learn the science practices, not just facts: most multiple-choice questions give you a graph, data table or experiment to interpret.',
    'For every FRQ, underline the task verb (identify, describe, explain, justify, calculate) and answer exactly that. “Explain” needs a because.',
    'Show every calculation with units and the equation you started from; partial credit is given for setup.',
    'Practise designing experiments: independent/dependent variables, controls, and how you would measure the outcome.',
  ],
  'Math & CS': [
    'Do problems, not notes: aim for a set of mixed practice problems every week, untimed early and timed later.',
    'On FRQs, show the method and justify with the definition or theorem; a correct answer without work often earns little.',
    'Keep an error log: for every missed problem, write the mistake type (concept, algebra, misread, time) and redo it 3 days later.',
    'Know when the calculator is allowed and practise both parts under the real timing.',
  ],
  'History & Social Science': [
    'Learn the big picture first (causes, effects, turning points), then the specific evidence that proves it.',
    'Write a thesis that takes a position and sets up your line of reasoning; a restatement of the prompt earns nothing.',
    'Use specific evidence (names, laws, events, data) and explain how each piece supports your argument.',
    'Practise stimulus questions: identify the source’s point of view, purpose, audience and historical situation.',
  ],
  English: [
    'Read and annotate a little every day: a short passage or poem, asking what choices the writer made and why.',
    'Write a defensible thesis in one sentence before you start each essay, and plan your line of reasoning.',
    'Commentary wins points: explain how each piece of evidence supports your claim. Never just summarize.',
    'Do timed essays every week in the last two months; read the scoring guidelines and sample essays for each prompt.',
  ],
};
const EXTRA = {
  apush: ['DBQ (7 points): thesis, contextualization, evidence from at least four documents, evidence beyond the documents, sourcing for two documents, and complexity.', 'LEQ (6 points): thesis, contextualization, two pieces of specific evidence used to support an argument, historical reasoning, and complexity.'],
  world: ['DBQ (7 points): thesis, contextualization, evidence from at least four documents, evidence beyond the documents, sourcing for two documents, and complexity.', 'LEQ (6 points): thesis, contextualization, two pieces of specific evidence used to support an argument, historical reasoning, and complexity.'],
  euro: ['DBQ (7 points): thesis, contextualization, evidence from at least four documents, evidence beyond the documents, sourcing for two documents, and complexity.', 'LEQ (6 points): thesis, contextualization, two pieces of specific evidence used to support an argument, historical reasoning, and complexity.'],
  gov: ['Know the required foundational documents and Supreme Court cases cold. FRQs ask you to apply them to new scenarios.', 'The argument essay needs a defensible claim, evidence from a foundational document plus one more, reasoning, and a response to an opposing view.'],
  compgov: ['Learn the six course countries side by side (UK, Mexico, Russia, Iran, China, Nigeria) with a comparison chart per concept.'],
  calcab: ['Memorize the derivative and integral rules so the no-calculator part is fast.', 'For justification questions (increasing, extrema, concavity, MVT, IVT), name the theorem and state the condition it needs.'],
  calcbc: ['Memorize the derivative and integral rules so the no-calculator part is fast.', 'BC adds series: practise convergence tests and Taylor polynomials with error bounds every week in spring.'],
  stats: ['Every conclusion needs context: name the parameter, the test, check the conditions, and state the conclusion about the population.', 'Practise the investigative task (the last FRQ). It is worth more and asks something new.'],
  macro: ['Draw every graph with correct labels on both axes and show the shift with arrows; graphs earn many FRQ points.'],
  micro: ['Draw every graph with correct labels on both axes and show the shift with arrows; graphs earn many FRQ points.'],
  psych: ['Apply concepts to scenarios: for each term, be able to give a new example, not just the definition.'],
  hug: ['Learn models (demographic transition, von Thünen, Burgess, Rostow…) and their limitations. FRQs often ask where a model fails.'],
  lang: ['Rhetorical analysis: name the writer’s choices and explain how each serves their purpose for this audience.', 'For argument, build your evidence bank now: history, current events, literature and personal experience you can use on any prompt.'],
  lit: ['Build a short list of 3–4 novels or plays you know deeply, with themes, key scenes and quotations, for the literary argument essay.', 'Poetry: read for the shift, and tie every device you name to meaning.'],
  csa: ['Write code by hand on paper sometimes: FRQs are typed in Bluebook without an IDE to catch errors.', 'Trace loops and array/ArrayList code with a table of variable values. Most MCQs test tracing.'],
  csp: ['Start your Create performance task early and keep your program code and personalized project reference ready for the exam.'],
  bio: ['Statistics on the exam: know when to use chi-square and how to read error bars.'],
  chem: ['Practise particulate diagrams and explaining with intermolecular forces, Coulomb’s law and equilibrium (Q vs K).'],
  phys1: ['Start each problem with a diagram (free-body or energy bar chart). The exam rewards reasoning and qualitative-quantitative translation.'],
  phys2: ['Start each problem with a diagram; practise ranking tasks and explaining why, not just calculating.'],
  physcm: ['Practise deriving expressions symbolically before plugging in numbers; calculus-based setups are common.'],
  apes: ['FRQs often ask you to calculate (show units, no calculator tricks) and to propose a solution with a benefit and a drawback.'],
};
export const strategyFor = (info) => [...(AREA[info.area] || []), ...(EXTRA[info.key] || [])];

// ------------------------------------------------------------------ plan
export const INTENSITY = {
  steady: { label: 'Steady', hint: '≈2–3 h a week', mult: 1 },
  committed: { label: 'Committed', hint: '≈3–5 h a week', mult: 1.5 },
  allin: { label: 'All in', hint: '≈5–7 h a week', mult: 2 },
};
export const TARGET_PCT = 72; // Orbit's practice-exam estimate for a 5 (see apEstimate in ap.js)
const DAY = 86400000;
export const weekStart = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x;
};
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Default exam date when none is set: the second Monday of May (AP Exams run over the first two weeks).
export function defaultExamDate(now = new Date()) {
  const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  const d = new Date(year, 4, 1, 8, 0);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + 7);
  return d;
}

export const PHASES = {
  learn: { name: 'Learn & keep up', icon: '🌱', about: 'Learn each unit as your class covers it, review older units with spaced practice, and test yourself when a unit ends.' },
  review: { name: 'Content review', icon: '🔁', about: 'Every unit gets reviewed again, weighted by exam weight and how weak you are, with FRQ practice twice a week.' },
  exam: { name: 'Exam practice', icon: '🏁', about: 'A full timed practice exam every week, then fix the mistakes and your weakest units.' },
  final: { name: 'Exam week', icon: '🎯', about: 'Light review, sleep and logistics. No new material the night before.' },
};

// opts: { now, examDate, currentUnit, intensity, mastery: [0..1] per unit, tests: [pct|null] per unit, weakest: [unit] }
export function buildRoad(info, opts) {
  const now = new Date(opts.now || Date.now());
  now.setHours(0, 0, 0, 0);
  const exam = new Date(opts.examDate || defaultExamDate(now));
  const examDay = new Date(exam);
  examDay.setHours(0, 0, 0, 0);
  // Weeks count back from exam day, so the last week is the seven days right before the exam.
  const W = Math.max(1, Math.ceil((examDay - now) / (7 * DAY)));
  const m = INTENSITY[opts.intensity]?.mult || 1;
  const budget = { 1: 180, 1.5: 300, 2: 420 }[m] || 180; // minutes a week
  const n = info.units.length;
  const scored = info.units.map((u, i) => ({ i, w: /not/i.test(u.weight) ? 0 : weightMid(u.weight) || 100 / n }));
  const cur = clamp(opts.currentUnit ?? 0, 0, n); // units before `cur` are already taught; n = all done
  const mastery = opts.mastery || [];
  const tests = opts.tests || [];
  const need = (i) => (scored[i].w || 100 / n) * (1.15 - (mastery[i] || 0)) * (tests[i] == null ? 1.1 : 1.3 - tests[i] / 100);
  const remaining = n - cur;
  const frqs = info.exam.filter((x) => x.kind === 'frq');
  const frqMin = frqs.length ? Math.round(frqs.reduce((t, x) => t + x.minutes / x.count, 0) / frqs.length) + 10 : 25; // one question + scoring

  // Phase lengths, compressed when there is little time. With every unit already taught, the time
  // that would have gone to learning goes to review.
  const finalW = 1;
  const examW = W >= 10 ? 4 : W >= 6 ? 3 : W >= 4 ? 2 : W >= 2 ? 1 : 0;
  let reviewW = W >= 14 ? 4 : Math.max(0, Math.min(4, W - finalW - examW - (remaining ? Math.max(1, Math.ceil(remaining / 2)) : 0)));
  let learnW = Math.max(0, W - finalW - examW - reviewW);
  if (!remaining) (reviewW += learnW), (learnW = 0);
  // Remaining units are taught evenly across the learn phase (or the review phase if there's no room).
  // No new units over winter break: teaching weeks skip it, and break weeks become catch-up weeks.
  const wkStart = (w) => new Date(Math.max(now.getTime(), examDay.getTime() - (W - w) * 7 * DAY));
  const isBreak = (w) => {
    const a = wkStart(w);
    const b = new Date(examDay.getTime() - (W - w - 1) * 7 * DAY - DAY);
    const y = a.getMonth() === 0 ? a.getFullYear() - 1 : a.getFullYear();
    const from = new Date(y, 11, 22);
    const to = new Date(y + 1, 0, 2);
    return a <= to && b >= from && (Math.min(b, to) - Math.max(a, from)) / DAY >= 3;
  };
  const span = Math.max(1, learnW || reviewW || 1);
  const isSummer = (w) => {
    const d = wkStart(w);
    return d.getMonth() === 5 || (d.getMonth() === 6 && d.getDate() <= 27); // June through late July
  };
  let teachWeeks = [...Array(span).keys()].filter((w) => !isBreak(w) && !isSummer(w));
  if (!teachWeeks.length) teachWeeks = [0];
  const tIdx = (u) => Math.min(teachWeeks.length - 1, Math.floor(((u - cur) * teachWeeks.length) / Math.max(1, remaining)));
  const teachWeek = (u) => (u < cur ? -1 : teachWeeks[tIdx(u)]);
  const lastTeach = (u) => (u < cur ? -1 : u + 1 < n && tIdx(u + 1) > tIdx(u) ? teachWeeks[tIdx(u + 1)] - 1 : u + 1 < n ? teachWeek(u) : teachWeeks.at(-1));

  const phase0 = (w) => {
    const left = W - w;
    return left <= finalW ? 'final' : left <= finalW + examW ? 'exam' : left <= finalW + examW + reviewW ? 'review' : 'learn';
  };
  const weeks = [];
  const lastPicked = {};
  const picked = {};
  const testPlanned = new Set();
  let summerN = 0;
  // Review-phase slots: allocate unit reviews by need, then interleave strongest-need first.
  const reviewSlots = Math.max(0, Math.round(reviewW * 2 * m));
  const needs = scored.map((s) => (s.w ? need(s.i) : 0));
  const total = needs.reduce((a, b) => a + b, 0) || 1;
  const counts = needs.map((x) => (x ? Math.max(1, Math.round((x / total) * reviewSlots)) : 0));
  const queue = [];
  for (let k = 0; queue.length < counts.reduce((a, b) => a + b, 0); k++) for (const s of [...scored].sort((a, b) => needs[b.i] - needs[a.i])) if (counts[s.i] > k) queue.push(s.i);
  // Next `k` distinct units from the queue (duplicates stay queued for later weeks).
  const takeDistinct = (k) => {
    const picks = [];
    const rest = [];
    while (picks.length < k && queue.length) {
      const u = queue.shift();
      (picks.includes(u) ? rest : picks).push(u);
    }
    queue.unshift(...rest);
    return picks;
  };
  const weakest = (opts.weakest?.length ? opts.weakest : [...scored].filter((s) => s.w).sort((a, b) => needs[b.i] - needs[a.i]).map((s) => s.i)).slice(0, 3);

  for (let w = 0; w < W; w++) {
    const start = wkStart(w);
    const end = new Date(examDay.getTime() - (W - w - 1) * 7 * DAY - DAY);
    const holiday = phase0(w) === 'learn' && isBreak(w);
    if (phase0(w) === 'learn' && isSummer(w) && cur < n) {
      // Before school starts: light, optional prep so the first unit feels familiar.
      const tasks = [];
      const id = (k) => `${iso(start)}:${k}::0`;
      const k = summerN++;
      const pu = Math.min(n - 1, cur + Math.floor(k / 2));
      if (k === 0) tasks.push({ opt: 0, id: id('skills'), kind: 'skills', unit: null, title: 'Summer prep: read the exam format and FRQ task verbs', minutes: 20, why: 'Optional — know what the exam looks like before class starts.' });
      tasks.push({ opt: 0, id: id('video'), kind: 'video', unit: pu, title: `Summer prep: preview ${unitLabel(info, pu)} — ${info.units[pu].title}`, minutes: 20, why: 'Optional — a video or two so the unit feels familiar when class starts.' });
      weeks.push({ start, end, left: W - w, phase: 'learn', tasks, summer: true });
      continue;
    }
    const left = W - w; // weeks to go, 1 = exam week
    const phase = phase0(w);
    const tasks = [];
    const add = (kind, unit, title, minutes, why, opt = 0) => (kind === 'unittest' && testPlanned.add(unit), tasks.push({ opt, id: `${iso(start)}:${kind}:${unit ?? ''}:${tasks.filter((t) => t.kind === kind && t.unit === unit).length}`, kind, unit, title, minutes: Math.round(minutes), why }));
    const U = (i) => `${unitLabel(info, i)} — ${info.units[i].title}`;
    const teaching = scored.filter((s) => teachWeek(s.i) <= w && lastTeach(s.i) >= w && s.i >= cur).map((s) => s.i);
    const finished = scored.filter((s) => s.i >= cur && lastTeach(s.i) === w - 1).map((s) => s.i);
    const taughtBefore = scored.filter((s) => s.i < cur || lastTeach(s.i) < w).map((s) => s.i);

    if (holiday) {
      const gap = (u) => w - (lastPicked[u] ?? -5);
      const old = taughtBefore.filter((u) => scored[u].w).sort((a, b) => needs[b] * gap(b) - needs[a] * gap(a));
      for (const u of old.slice(0, Math.round(2 * m))) {
        lastPicked[u] = w;
        add('review', u, `Winter break catch-up: ${U(u)}`, 30, 'No new units over break — catch up on your weakest heavily weighted unit so far.');
      }
      for (const u of old.filter((u) => tests[u] == null && !testPlanned.has(u)).slice(0, 1)) add('unittest', u, `Unit test: ${U(u)}`, 30, 'Haven’t tested this unit yet — a quick check over break.');
      if (old.length) add('frq', null, 'Free-response drill (timed)', frqMin, 'One timed free-response question, then score it with the rubric.');
      add('daily', null, 'Daily review queue — a few days over break', 30, 'Short spaced-repetition sessions so nothing fades over break.');
      weeks.push({ start, end, left, phase, tasks, holiday: true });
      continue;
    }
    if (phase === 'learn' || (phase === 'review' && teaching.length)) {
      // Several units in one week (a fast class, or catching up late): shorter sessions, one video.
      const per = teaching.length > 1 ? Math.max(15, Math.round((40 * m) / teaching.length)) : 25 * m;
      for (const u of teaching) add('learn', u, `Learn ${U(u)}`, per, teaching.length > 1 ? 'Several units this week — keep each session short and focused on the cards you miss.' : 'Learn the cards for what you covered in class this week — two short sessions beat one long one.');
      if (teaching.length) add('video', teaching[0], `Watch a review video: ${U(teaching[0])}`, 15, 'One AP Daily or review video on the topics you found hardest.', 2);
      for (const u of finished) add('unittest', u, `Unit test: ${U(u)}`, 30, 'Test yourself as soon as the unit ends — it shows what to fix before it fades.');
    }
    if (phase === 'learn') {
      const old = taughtBefore.filter((u) => scored[u].w && !teaching.includes(u));
      const picks = Math.round(m >= 1.5 ? 2 : 1);
      // Expanding intervals (1, 2, 4, 6 weeks after it was taught or last reviewed), then need × how
      // overdue it is: big, weak units come back first, but every unit keeps coming back.
      const due = (u) => w - (lastPicked[u] ?? Math.max(-1, lastTeach(u))) - Math.min(6, 2 ** (picked[u] || 0));
      const ready = old.filter((u) => due(u) >= 0).sort((a, b) => needs[b] * (1 + due(b)) - needs[a] * (1 + due(a)));
      for (const u of ready.slice(0, picks)) {
        lastPicked[u] = w;
        picked[u] = (picked[u] || 0) + 1;
        add('review', u, `Spaced review: ${U(u)}`, 20 * m, 'Revisit an older unit before you forget it (spaced retrieval). Weighted to big, weak units.');
      }
      if (w % 2 === 1 && taughtBefore.length) add('frq', null, 'Free-response drill (timed)', frqMin, 'One timed free-response question (Orbit rotates through the exam’s FRQ types), then score it with the rubric.');
      if (!teaching.length && !old.length) add('skills', null, 'Get ahead: read the exam format and FRQ task verbs', 20, 'Know what the exam asks before you start reviewing.');
    }
    if (phase === 'review') {
      // Enough reviews each week that every unit is covered before exam practice starts.
      const base = Math.max(1, Math.round(2 * m));
      const per = Math.max(base, Math.ceil(new Set(queue).size / Math.max(1, left - finalW - examW)));
      takeDistinct(per).forEach((u, k) => {
        if (k < base) {
          add('review', u, `Review ${U(u)}`, 30, 'Re-learn the unit with Learn + a review video, then check yourself with the unit test.', k ? 1 : 0);
          add('unittest', u, `Unit test: ${U(u)}`, 25, 'Aim for 80%+. Anything you miss goes to your Mistakes set.', k ? 1 : 0);
        } else add('review', u, `Quick review: ${U(u)}`, 20, 'A fast pass so no unit is skipped: Learn the cards you miss, then move on.');
      });
      add('frq', null, 'Free-response drill (timed)', frqMin, 'Practise writing under time pressure, then score with the rubric.');
      if (m >= 1.5) add('frq', null, 'Free-response drill (timed)', frqMin, 'A second FRQ set this week.', 3);
      if (left % 2 === 0) add('half', null, 'Half-length practice exam', 90, 'Builds stamina and shows which units still need work.', 2);
    }
    if (phase === 'exam') {
      add('full', null, 'Full practice exam — timed, in one sitting', info.exam.reduce((t, s) => t + s.minutes, 0), `Same sections and timing as the real exam. Target: ${TARGET_PCT}%+ for a 5.`);
      add('mistakes', null, 'Fix your mistakes from the practice exam', 40 * m, 'Re-learn every missed question (Study my mistakes) — this is where points come from.');
      // Units the review phase didn't reach come first, then the current weakest.
      const want = Math.max(Math.round(2 * m) - 1 || 1, Math.ceil(new Set(queue).size / Math.max(1, left - finalW)));
      const targets = [...new Set([...takeDistinct(want), ...weakest])].slice(0, want);
      targets.forEach((u, k) => add('review', u, weakest.includes(u) && k < 2 ? `Target weak spot: ${U(u)}` : `Review ${U(u)}`, k < 2 ? 30 : 20, weakest.includes(u) ? 'One of your weakest heavily weighted units right now.' : 'Not reviewed yet this spring — cover it before the exam.'));
      add('frq', null, 'Free-response drill (timed)', frqMin, 'Keep writing under time pressure.');
      add('videoall', null, 'Watch an AP Daily: Live Review session', 45, 'Official review sessions often cover the most-missed skills.', 2);
    }
    if (phase === 'final') {
      add('daily', null, 'Daily review queue — 10–15 minutes a day', 60, 'Keep cards fresh without cramming.');
      add('skills', null, 'Re-read the exam format, timing and FRQ task verbs', 15, 'Know exactly how long you have per question.');
      add('mcq', null, 'One timed multiple-choice section', 45, 'A last calibration — then stop testing and rest.');
      add('logistics', null, 'Exam-day checklist', 15, 'Bluebook installed and exam set up on your device, room and start time, photo ID, sleep 8+ hours, breakfast. No new material the night before.');
    } else if (phase !== 'final') {
      add('daily', null, 'Daily review queue — 5 days this week', 10 * 5, 'Ten minutes of spaced-repetition cards a day keeps every unit fresh.');
    }
    // Keep the week inside the time budget: drop optional tasks first (highest opt first).
    const cap = budget + (phase === 'exam' ? info.exam.reduce((t, x) => t + x.minutes, 0) : 0);
    const sum = () => tasks.reduce((t, x) => t + x.minutes, 0);
    for (let o = 3; o > 0 && sum() > cap * 1.1; o--)
      for (let k = tasks.length - 1; k >= 0 && sum() > cap * 1.1; k--)
        if (tasks[k].opt === o) {
          const [gone] = tasks.splice(k, 1);
          if (gone.kind === 'review' && phase === 'review') queue.unshift(gone.unit); // review it next week instead
        }
    weeks.push({ start, end, left, phase, tasks, over: sum() > cap * 1.1 ? sum() : 0 });
  }
  const phases = ['learn', 'review', 'exam', 'final'].map((p) => {
    const ws = weeks.filter((x) => x.phase === p);
    return ws.length ? { key: p, ...PHASES[p], from: ws[0].start, to: ws.at(-1).end, weeks: ws.length } : null;
  }).filter(Boolean);
  return { weeks, phases, exam, W, minutesPerWeek: Math.round(weeks.reduce((t, x) => t + x.tasks.reduce((a, b) => a + b.minutes, 0), 0) / W) };
}

// Was this task done during its week? (Unit tests, exams and study sessions count automatically.)
export function autoDone(task, week, course, setOf) {
  const inWeek = (t) => {
    const d = new Date(t);
    return d >= week.start && d < new Date(week.end.getTime() + 86400000);
  };
  const ex = (pred) => course.exams.some((e) => inWeek(e.at) && pred(e));
  switch (task.kind) {
    case 'unittest': return ex((e) => e.kind === 'unit' && e.unit === task.unit);
    case 'full': return ex((e) => e.kind === 'full');
    case 'half': return ex((e) => e.kind === 'half' || e.kind === 'full');
    case 'mcq': return ex((e) => e.kind === 'mcq' || e.kind === 'full');
    case 'frq': return ex((e) => e.kind === 'frq');
    case 'learn':
    case 'review': {
      // A finished session on the unit, or 5+ of its cards practised that week.
      const s = setOf(task.unit);
      return !!s && ((s.lastStudied && inWeek(s.lastStudied)) || s.cards.filter((c) => c.last && inWeek(c.last)).length >= 5);
    }
    default: return false;
  }
}

export const monthName = (d) => d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
const md = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
export const weekLabel = (wk) => `${md(wk.start)} – ${md(wk.end)}`;
export const videoList = (items) => el('ul', { class: 'video-list' }, items.map((v) => el('li', {}, el('a', { href: v.url, target: '_blank', rel: 'noopener noreferrer' }, v.official ? '▶ ' : '▷ ', v.label, ' ↗'), el('span', { class: 'small muted' }, ` — ${v.note}`))));

// ------------------------------------------------------------------ the "Road to a 5" tab
// act: { setOf(u), study(u), test(u), exam(kind), mistakes(), daily(), material(u), format(), setDate(), planner(weeks) }
const KIND_ICON = { learn: '🌱', video: '▶', unittest: '📝', review: '🔁', frq: '✍️', full: '🏁', half: '⏱', mcq: '🔘', mistakes: '🩹', videoall: '📺', daily: '🧠', skills: '🧾', logistics: '🎒' };
const PHASE_COLOR = { learn: '#43d17a', review: '#3aa0ff', exam: '#ff7a45', final: '#ff6b8b' };

export function roadInputs(app, course, info, act, apExam) {
  const road = (course.road ||= { intensity: 'steady', currentUnit: null, done: {} });
  const mastery = info.units.map((_, i) => {
    const s = act.setOf(i);
    return s && s.cards.length ? act.masteryPct(s) / 100 : 0;
  });
  const tests = info.units.map((_, i) => course.exams.filter((e) => e.kind === 'unit' && e.unit === i).at(-1)?.pct ?? null);
  const lastFull = course.exams.filter((e) => e.kind === 'full' || e.kind === 'half').at(-1);
  let weakest = [];
  if (lastFull?.byUnit) weakest = Object.entries(lastFull.byUnit).map(([u, b]) => ({ u: +u, p: b.right / b.total })).filter((x) => !Number.isNaN(x.u)).sort((a, b) => a.p - b.p).map((x) => x.u);
  const examDate = apExam ? new Date(apExam.due) : road.examDate ? new Date(road.examDate) : defaultExamDate();
  return { road, mastery, tests, weakest, examDate, estimated: !apExam && !road.examDate };
}

export function renderRoad(app, course, info, act, apExam) {
  const { road, mastery, tests, weakest, examDate, estimated } = roadInputs(app, course, info, act, apExam);
  const st = (app.viewState.road ||= {});
  const setup = road.currentUnit === null || st.editing;
  const settings = settingsCard(app, course, info, road, act, examDate, estimated, setup);
  if (road.currentUnit === null) return el('div', { class: 'road' }, intro(info), settings, videosCard(info, st, app), strategyCard(info));
  const plan = buildRoad(info, { examDate, currentUnit: road.currentUnit, intensity: road.intensity, mastery, tests, weakest });
  const isDone = (t, wk) => road.done[t.id] ?? autoDone(t, wk, course, act.setOf);
  const today = new Date();
  const thisWeek = plan.weeks.find((w) => today >= w.start && today < new Date(w.end.getTime() + DAY)) || plan.weeks[0];
  const daysLeft = Math.max(0, Math.ceil((new Date(examDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY));

  const header = el(
    'div',
    { class: 'card road-head wide' },
    el('div', { class: 'row wrap', style: { alignItems: 'baseline' } }, el('h3', { style: { margin: 0 } }, `🏆 Your road to a 5 in ${info.name}`), el('span', { class: 'spacer' }), el('span', { class: 'small muted' }, `${daysLeft} days · ${plan.W} week${plan.W === 1 ? '' : 's'} to the exam${estimated ? ' (estimated date)' : ''} · about ${Math.round(plan.minutesPerWeek / 6) / 10} h a week`)),
    phaseBar(plan, thisWeek),
    plan.weeks.some((w) => w.over) && el('div', { class: 'small road-warn', role: 'note' }, `⚠️ Short on time: to cover every unit, ${plan.weeks.filter((w) => w.over).length} week${plan.weeks.filter((w) => w.over).length === 1 ? ' needs' : 's need'} more than your chosen pace (up to ${Math.round(Math.max(...plan.weeks.map((w) => w.over)) / 6) / 10} h). Pick a faster pace in Plan settings if you can.`),
    el('div', { class: 'road-phases' }, plan.phases.map((p) => el('div', { class: `road-phase${p.key === thisWeek.phase ? ' on' : ''}`, style: { '--pc': PHASE_COLOR[p.key] } }, el('b', {}, `${p.icon} ${p.name}`), el('div', { class: 'small muted' }, `${md(p.from)} – ${md(p.to)} · ${p.weeks} wk`), el('div', { class: 'small' }, p.about)))),
  );
  return el(
    'div',
    { class: 'road dash' },
    header,
    weekCard(app, course, info, act, thisWeek, isDone, road, st, true),
    scoreCard(course, info, mastery, tests),
    settings,
    timeline(app, course, info, act, plan, thisWeek, isDone, road, st),
    videosCard(info, st, app),
    strategyCard(info),
  );
}

function intro(info) {
  return el(
    'div',
    { class: 'card wide road-intro' },
    el('h3', {}, `🏆 Road to a 5 — ${info.name}`),
    el('p', { class: 'small', style: { margin: 0 } }, 'A week-by-week plan from today to exam day: learn each unit as your class covers it, review older units on a spaced schedule, switch to unit reviews in March, and take a full timed practice exam every week in the last month. It adapts as you go, to your scores, your weakest units and the time you have.'),
    el('div', { class: 'road-phases' }, ['learn', 'review', 'exam', 'final'].map((k) => el('div', { class: 'road-phase', style: { '--pc': PHASE_COLOR[k] } }, el('b', {}, `${PHASES[k].icon} ${PHASES[k].name}`), el('div', { class: 'small' }, PHASES[k].about)))),
  );
}

function settingsCard(app, course, info, road, act, examDate, estimated, open) {
  const st = (app.viewState.road ||= {});
  if (!open) {
    return el(
      'div',
      { class: 'card road-settings' },
      el('h3', {}, '⚙️ Plan settings'),
      el('div', { class: 'small' }, `Class is on: ${road.currentUnit >= info.units.length ? 'all units covered' : `${unitLabel(info, road.currentUnit)} — ${info.units[road.currentUnit].title}`}`),
      el('div', { class: 'small' }, `Pace: ${INTENSITY[road.intensity].label} (${INTENSITY[road.intensity].hint})`),
      el('div', { class: 'small' }, `Exam: ${examDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}${estimated ? ' — estimated' : ''}`),
      el('div', { class: 'row wrap', style: { marginTop: '8px' } }, el('button', { class: 'btn sm', onclick: () => ((st.editing = true), app.render()) }, 'Change'), estimated && el('button', { class: 'btn sm', onclick: () => act.setDate() }, '📅 Set my exam date'), el('button', { class: 'btn sm primary', onclick: () => act.planner() }, '🗓 Put the next 4 weeks in my Planner')),
    );
  }
  const unitSel = el('select', { 'aria-label': 'Where your class is now' }, [...info.units.map((u, i) => el('option', { value: String(i), selected: (road.currentUnit ?? 0) === i }, `${unitLabel(info, i)} — ${u.title}`)), el('option', { value: String(info.units.length), selected: road.currentUnit === info.units.length }, 'We’ve covered every unit')]);
  let inten = road.intensity || 'steady';
  const seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Weekly study time' });
  const paint = () => {
    seg.replaceChildren(...Object.entries(INTENSITY).map(([k, v]) => el('button', { class: inten === k ? 'on' : '', 'aria-pressed': String(inten === k), onclick: () => ((inten = k), paint()) }, `${v.label} · ${v.hint}`)));
  };
  paint();
  return el(
    'div',
    { class: 'card road-settings wide' },
    el('h3', {}, road.currentUnit === null ? '🧭 Set up your plan (30 seconds)' : '⚙️ Plan settings'),
    el('label', { class: 'stack', style: { gap: '4px' } }, el('b', { class: 'small' }, 'Which unit is your class on right now?'), unitSel, el('span', { class: 'small muted' }, 'Earlier units count as taught; the rest are spread over the weeks until your class usually finishes, in April.')),
    el('div', { class: 'stack', style: { gap: '4px', marginTop: '10px' } }, el('b', { class: 'small' }, 'How much time can you give this class each week, outside homework?'), seg),
    el('div', { class: 'small', style: { marginTop: '10px' } }, `Exam date: ${examDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}${estimated ? ' (estimated — AP Exams are in the first two weeks of May)' : ''} `, el('button', { class: 'btn sm', onclick: () => act.setDate() }, estimated ? '📅 Set my exact date' : '📅 Change')),
    el(
      'div',
      { class: 'row', style: { marginTop: '12px' } },
      el('span', { class: 'spacer' }),
      road.currentUnit !== null && el('button', { class: 'btn', onclick: () => ((st.editing = false), app.render()) }, 'Cancel'),
      el('button', { class: 'btn primary', onclick: () => { road.currentUnit = parseInt(unitSel.value, 10); road.intensity = inten; st.editing = false; app.commit(); } }, road.currentUnit === null ? 'Build my road to a 5' : 'Save'),
    ),
  );
}

function phaseBar(plan, thisWeek) {
  const idx = plan.weeks.indexOf(thisWeek);
  return el(
    'div',
    { class: 'road-bar', role: 'img', 'aria-label': `Week ${idx + 1} of ${plan.W}: ${PHASES[thisWeek.phase].name}` },
    plan.weeks.map((w, i) => el('span', { class: i === idx ? 'now' : i < idx ? 'past' : '', style: { background: PHASE_COLOR[w.phase] }, title: `${weekLabel(w)} · ${PHASES[w.phase].name}` })),
  );
}

function taskRow(app, course, info, act, t, wk, isDone, road, st, live) {
  const done = isDone(t, wk);
  const cb = el('input', { type: 'checkbox', class: 'check sq', checked: done, 'aria-label': `Done: ${t.title}` });
  cb.addEventListener('change', () => {
    road.done[t.id] = cb.checked;
    app.commit();
  });
  const set = t.unit !== null && t.unit !== undefined ? act.setOf(t.unit) : null;
  const empty = set && !set.cards.length && !set.questions?.length;
  const btn = (label, fn, primary) => el('button', { class: `btn sm${primary ? ' primary' : ''}`, onclick: fn }, label);
  let action = null;
  if (live) {
    if (['learn', 'review'].includes(t.kind)) action = empty ? btn('+ Add material', () => act.material(t.unit), true) : btn(t.kind === 'learn' ? 'Learn' : 'Review', () => act.study(t.unit), true);
    else if (t.kind === 'unittest') action = empty ? btn('+ Add material', () => act.material(t.unit)) : btn('Start test', () => act.test(t.unit), true);
    else if (['frq', 'full', 'half', 'mcq'].includes(t.kind)) action = btn('Start', () => act.exam(t.kind), true);
    else if (t.kind === 'mistakes') action = btn('Study my mistakes', () => act.mistakes(), true);
    else if (t.kind === 'daily') action = btn('Review now', () => act.daily(), true);
    else if (t.kind === 'skills') action = btn('Open', () => act.format());
  }
  const vidKey = `${t.id}`;
  const showVids = live && st.vids === vidKey;
  const hasVids = ['learn', 'review', 'video', 'videoall'].includes(t.kind);
  // Official CED topics for the unit, with the same "covered" checkboxes as the Units tab.
  const topics = ['learn', 'review'].includes(t.kind) ? act.topics(t.unit) : [];
  const showTopics = live && st.topics === vidKey;
  const tDone = topics.filter(([num]) => act.covered[num]).length;
  return el(
    'div',
    { class: `road-task${done ? ' done' : ''}` },
    el(
      'div',
      { class: 'road-task-main' },
      cb,
      el('span', { class: 'road-ic', 'aria-hidden': 'true' }, KIND_ICON[t.kind] || '•'),
      el('div', { class: 'road-task-text' }, el('div', {}, t.title, el('span', { class: 'faint small' }, ` · ${t.minutes} min`)), live && el('div', { class: 'small muted' }, t.why)),
      el('div', { class: 'row', style: { gap: '6px' } }, live && topics.length > 0 && el('button', { class: 'btn sm', 'aria-expanded': String(showTopics), onclick: () => ((st.topics = showTopics ? null : vidKey), app.render()) }, `📋 Topics ${tDone}/${topics.length}`), live && hasVids && el('button', { class: 'btn sm', 'aria-expanded': String(showVids), onclick: () => ((st.vids = showVids ? null : vidKey), app.render()) }, showVids ? 'Hide videos' : '▶ Videos'), action),
    ),
    showVids && videoList(videoLinks(info, t.kind === 'videoall' ? null : t.unit)),
    showTopics &&
      el(
        'div',
        { class: 'road-topics' },
        el('div', { class: 'small muted' }, 'Official topics in this unit (from the Course and Exam Description). Check each one off once you can explain it without notes.'),
        topics.map(([num, title]) => {
          const box = el('input', { type: 'checkbox', class: 'check sq', checked: !!act.covered[num], 'aria-label': `Topic ${num} ${title}` });
          box.addEventListener('change', () => {
            if (box.checked) act.covered[num] = true;
            else delete act.covered[num];
            app.commit();
          });
          return el('label', { class: `topic${act.covered[num] ? ' done' : ''}` }, box, el('b', {}, num), el('span', {}, title));
        }),
      ),
  );
}

function weekCard(app, course, info, act, wk, isDone, road, st) {
  const n = wk.tasks.filter((t) => isDone(t, wk)).length;
  return el(
    'div',
    { class: 'card wide road-week' },
    el('div', { class: 'row wrap', style: { alignItems: 'baseline' } }, el('h3', { style: { margin: 0 } }, `📅 This week · ${weekLabel(wk)}`), el('span', { class: 'chip', style: { background: `color-mix(in srgb, ${PHASE_COLOR[wk.phase]} 18%, transparent)` } }, wk.summer ? '☀️ Summer prep (optional)' : wk.holiday ? '❄️ Winter break · catch-up' : `${PHASES[wk.phase].icon} ${PHASES[wk.phase].name}`), el('span', { class: 'spacer' }), el('b', { class: 'small' }, `${n}/${wk.tasks.length} done`)),
    el('div', { class: 'weight-bar', style: { margin: '8px 0 4px' } }, el('div', { style: { width: `${(n / Math.max(1, wk.tasks.length)) * 100}%`, background: PHASE_COLOR[wk.phase] } })),
    el('div', { class: 'small faint' }, 'Tests, practice exams and study sessions tick themselves off when you do them in Orbit.'),
    wk.over > 0 && el('div', { class: 'small road-warn' }, `⚠️ A heavy week: about ${Math.round(wk.over / 6) / 10} h, so every unit gets covered before the exam.`),
    wk.tasks.map((t) => taskRow(app, course, info, act, t, wk, isDone, road, st, true)),
  );
}

function scoreCard(course, info, mastery, tests) {
  const fulls = course.exams.filter((e) => e.kind === 'full');
  const best = fulls.reduce((b, e) => Math.max(b, e.pct), 0);
  const last = course.exams.filter((e) => e.apScore).at(-1);
  const counted = info.units.map((u, i) => i).filter((i) => !/not/i.test(info.units[i].weight));
  const tested = counted.filter((i) => tests[i] !== null);
  const strong = counted.filter((i) => (tests[i] ?? 0) >= 80);
  const learned = counted.filter((i) => mastery[i] >= 0.6);
  const checks = [
    [learned.length === counted.length, `Learn every unit (60%+ of cards mastered): ${learned.length}/${counted.length}`],
    [tested.length === counted.length, `Take every unit test: ${tested.length}/${counted.length}`],
    [strong.length === counted.length, `80%+ on every unit test: ${strong.length}/${counted.length}`],
    [fulls.length > 0, 'Take a baseline full practice exam (early in the exam-practice phase)'],
    [fulls.length >= 3, `Three or more full timed practice exams: ${fulls.length}/3`],
    [best >= TARGET_PCT, `Score ${TARGET_PCT}%+ on a full practice exam${best ? ` (best so far: ${Math.round(best)}%)` : ''}`],
  ];
  return el(
    'div',
    { class: 'card road-score' },
    el('h3', {}, '🎯 What a 5 takes'),
    el('div', { class: 'road-est' }, el('div', { class: 'road-est-n' }, last ? `≈ ${last.apScore}` : '—'), el('div', { class: 'small muted' }, last ? `Latest estimate (${Math.round(last.pct)}% on a practice exam)` : 'Take a practice exam to get an estimate')),
    el('ul', { class: 'road-checks' }, checks.map(([ok, label]) => el('li', { class: ok ? 'ok' : '' }, el('span', { 'aria-hidden': 'true' }, ok ? '✅' : '⬜'), ` ${label}`))),
    el('div', { class: 'small faint' }, `Orbit estimates a 5 at about ${TARGET_PCT}% of practice-exam points. Real cut scores vary by subject and year, so aim above it.`),
  );
}

function timeline(app, course, info, act, plan, thisWeek, isDone, road, st) {
  const months = [];
  for (const w of plan.weeks) {
    const key = monthName(w.start);
    if (!months.length || months.at(-1).key !== key) months.push({ key, weeks: [] });
    months.at(-1).weeks.push(w);
  }
  const openM = (st.months ||= {});
  return el(
    'div',
    { class: 'card wide road-timeline' },
    el('h3', {}, '🗺 The whole plan, month by month'),
    months.map((mo) => {
      const nowHere = mo.weeks.includes(thisWeek);
      const isOpen = openM[mo.key] ?? nowHere;
      const all = mo.weeks.flatMap((w) => w.tasks.map((t) => [t, w]));
      const done = all.filter(([t, w]) => isDone(t, w)).length;
      const past = mo.weeks.at(-1).end < new Date(new Date().setHours(0, 0, 0, 0));
      return el(
        'div',
        { class: 'road-month' },
        el(
          'button',
          { class: 'road-month-h', 'aria-expanded': String(isOpen), onclick: () => ((openM[mo.key] = !isOpen), app.render()) },
          el('span', {}, `${isOpen ? '▾' : '▸'} ${mo.key}`),
          el('span', { class: 'road-dots', 'aria-hidden': 'true' }, [...new Set(mo.weeks.map((w) => w.phase))].map((p) => el('i', { style: { background: PHASE_COLOR[p] } }))),
          el('span', { class: 'small muted' }, `${[...new Set(mo.weeks.map((w) => PHASES[w.phase].name))].join(' → ')} · ${past || done ? `${done}/${all.length} done` : `${all.length} tasks`}`),
        ),
        isOpen &&
          mo.weeks.map((w) =>
            el(
              'div',
              { class: `road-wk${w === thisWeek ? ' now' : ''}` },
              el('div', { class: 'small', style: { fontWeight: 700 } }, `${weekLabel(w)} · ${w.summer ? '☀️ Summer prep' : w.holiday ? '❄️ Winter break' : PHASES[w.phase].name}${w === thisWeek ? ' · this week' : ''} · ${w.left === 1 ? 'exam next' : `${w.left} weeks out`}`),
              w.tasks.map((t) => taskRow(app, course, info, act, t, w, isDone, road, st, false)),
            ),
          ),
      );
    }),
  );
}

function videosCard(info, st, app) {
  const u = st.vidUnit ?? 0;
  const sel = el('select', { 'aria-label': 'Unit for review videos' }, [...info.units.map((x, i) => el('option', { value: String(i), selected: u === i }, `${unitLabel(info, i)} — ${x.title}`)), el('option', { value: '-1', selected: u === -1 }, 'Whole course / exam review')]);
  sel.addEventListener('change', () => {
    st.vidUnit = parseInt(sel.value, 10);
    app.render();
  });
  return el(
    'div',
    { class: 'card road-videos' },
    el('h3', {}, '📺 Review videos'),
    el('p', { class: 'small muted', style: { margin: 0 } }, 'Official AP Daily videos plus the free channels students rely on for this course. Each link opens videos for the unit you pick.'),
    sel,
    videoList(videoLinks(info, u < 0 ? null : u)),
  );
}

function strategyCard(info) {
  return el('div', { class: 'card road-strategy' }, el('h3', {}, `💡 How to earn a 5 in ${info.name.replace(/^AP /, 'AP ')}`), el('ul', { class: 'tips' }, [...strategyFor(info), ...info.tips].map((t) => el('li', {}, t))));
}
