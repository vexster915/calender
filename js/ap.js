// AP courses: official unit structure, CED import, AP Classroom material, unit tests and
// full practice AP exams built on the real exam format.
import { el, add, uid, fmtDate, clamp, tone } from './util.js';
import { modal, confirmBox, toast, confetti } from './ui.js';
import { AP_COURSES, courseByKey, unitLabel, weightMid, links, resourcesFor, TASK_VERBS } from './apcatalog.js';
import { parseCED, cedCards, parseMCQ, splitFRQ, detectUnit } from './apparse.js';
import { AP_TOPICS } from './aptopics.js';
import { generateCards } from './gen.js';
import { newCard, grade, mastery, shuffle, logStudy } from './srs.js';
import { orbitBar, ring, startStudy, wireFileDrop, pageTitle, setById, openCreateSet } from './study.js';
import { logActivity, CLASS_COLORS } from './logic.js';

const dec = new TextDecoder();
const enc = new TextEncoder();
export const courseById = (app, id) => app.data.courses.find((c) => c.id === id);
const infoOf = (course) => courseByKey(course.key);
const unitSet = (app, course, u) => setById(app, course.unitSets[u]);

function extLink(label, url, title) {
  return el('a', { class: 'btn sm', href: url, target: '_blank', rel: 'noopener noreferrer', title }, label, ' ↗');
}

// ------------------------------------------------------------------ Courses hub
export function renderCourses(app) {
  const mine = app.data.courses;
  const regular = app.data.classes.filter((c) => !mine.some((m) => m.classId === c.id));
  return el(
    'div',
    {},
    pageTitle('AP & Courses', el('button', { class: 'btn primary', onclick: () => openAddCourse(app) }, '+ Add AP course')),
    mine.length
      ? el('div', { class: 'set-grid big' }, mine.map((c) => courseTile(app, c)))
      : el(
          'div',
          { class: 'card', style: { padding: '28px' } },
          el('h3', {}, '🎓 AP courses, built on the official framework'),
          el('p', { class: 'muted' }, 'Pick your AP classes and Orbit sets up every unit from the College Board Course and Exam Description, with the real exam weightings and exam format. Add material per unit — the CED itself, AP Classroom printouts, class notes — and you get unit tests plus full practice AP exams timed like the real thing.'),
          el('button', { class: 'btn primary', onclick: () => openAddCourse(app) }, '+ Add your first AP course'),
        ),
    el(
      'div',
      { class: 'card', style: { marginTop: '18px' } },
      el('h3', {}, '📘 Regular classes — free public material'),
      el('p', { class: 'small muted', style: { marginTop: 0 } }, 'No handouts? Grab a free, openly-licensed textbook chapter as a PDF and upload it to make a study set. Your own class PDFs always come first.'),
      regular.length
        ? regular.map((cls) =>
            el(
              'div',
              { class: 'res-row' },
              el('span', { class: 'dot', style: { background: cls.color } }),
              el('b', { style: { width: '180px' } }, cls.name),
              el('div', { class: 'row wrap', style: { flex: 1 } }, resourcesFor(cls.name).map((r) => extLink(r.label, r.url, r.note))),
              el('button', { class: 'btn sm primary', onclick: () => openCreateSet(app, { classId: cls.id }) }, '+ Upload PDF'),
            ),
          )
        : el('div', { class: 'muted small' }, 'Add classes in the Planner to see suggested free material here.'),
    ),
  );
}

function courseTile(app, course) {
  const info = infoOf(course);
  const sets = course.unitSets.map((id) => setById(app, id)).filter(Boolean);
  const cards = sets.reduce((n, s) => n + s.cards.length, 0);
  const qs = sets.reduce((n, s) => n + (s.questions?.length || 0), 0);
  const ready = readiness(app, course);
  const last = course.exams.at(-1);
  return el(
    'div',
    { class: 'set-tile', onclick: () => app.go('course', { id: course.id }) },
    el('div', { class: 'band', style: { background: info.color } }),
    el('div', { class: 'row' }, el('div', { style: { flex: 1 } }, el('div', { class: 'small', style: { color: tone(info.color), fontWeight: 800, letterSpacing: '0.08em' } }, info.area.toUpperCase()), el('div', { class: 'set-title' }, info.name)), ring(ready, info.color, 54)),
    el('div', { class: 'small muted' }, `${info.units.length} ${(info.unitWord || 'unit').toLowerCase()}s · ${cards} cards · ${qs} questions`),
    last ? el('div', { class: 'small' }, `Last ${last.kind === 'unit' ? 'unit test' : 'practice exam'}: `, el('b', {}, last.apScore ? `${last.apScore} (est.)` : `${Math.round(last.pct)}%`)) : el('div', { class: 'small faint' }, 'No tests taken yet'),
  );
}

// Weighted mastery across units, using the exam weighting.
function readiness(app, course) {
  const info = infoOf(course);
  let tot = 0;
  let got = 0;
  info.units.forEach((u, i) => {
    const w = weightMid(u.weight) || 1;
    const set = unitSet(app, course, i);
    if (!set) return;
    tot += w;
    got += w * (set.cards.length ? mastery(set).pct / 100 : 0);
  });
  return tot ? Math.round((got / tot) * 100) : 0;
}

// ------------------------------------------------------------------ Add a course
function openAddCourse(app) {
  const st = { q: '', key: null, classId: '' };
  modal(
    'Add an AP course',
    (m) => {
      if (st.key) return addStep2(app, st, m);
      const search = el('input', { type: 'search', placeholder: 'Search AP courses…', value: st.q });
      search.addEventListener('input', () => {
        st.q = search.value;
        const pos = search.selectionStart;
        m.rebuild();
        const s = m.body.querySelector('input[type=search]');
        s.focus();
        s.setSelectionRange(pos, pos);
      });
      const have = new Set(app.data.courses.map((c) => c.key));
      const list = AP_COURSES.filter((c) => c.name.toLowerCase().includes(st.q.toLowerCase()));
      const areas = [...new Set(list.map((c) => c.area))];
      return el(
        'div',
        { class: 'stack' },
        search,
        areas.map((a) =>
          el(
            'div',
            {},
            el('div', { class: 'section-h', style: { margin: '6px 0' } }, a),
            el(
              'div',
              { class: 'course-pick' },
              list
                .filter((c) => c.area === a)
                .map((c) =>
                  el('button', { class: 'course-opt', disabled: have.has(c.key), onclick: () => ((st.key = c.key), m.rebuild()) }, el('span', { class: 'dot', style: { background: c.color } }), el('span', {}, c.name), have.has(c.key) ? el('span', { class: 'small faint' }, 'added') : el('span', { class: 'small faint' }, `${c.units.length} units`)),
                ),
            ),
          ),
        ),
      );
    },
    { center: true, wide: true },
  );
}

function addStep2(app, st, m) {
  const info = courseByKey(st.key);
  const guess = app.data.classes.find((c) => c.name.toLowerCase().replace(/^ap\s+/, '').includes(info.name.toLowerCase().replace(/^ap\s+/, '').split(/[:\s]/)[0]));
  if (!st.classId && guess) st.classId = guess.id;
  const cls = el('select', {}, el('option', { value: '' }, `Create a new class "${info.name}"`), app.data.classes.map((c) => el('option', { value: c.id }, `Use my class: ${c.name}`)));
  cls.value = st.classId;
  cls.addEventListener('change', () => (st.classId = cls.value));
  return el(
    'div',
    { class: 'stack' },
    el('div', { class: 'row' }, el('span', { class: 'dot', style: { background: info.color, width: '14px', height: '14px' } }), el('h3', { style: { margin: 0, textTransform: 'none', letterSpacing: 0, fontSize: '1.3em', color: 'var(--text)' } }, info.name)),
    el('div', { class: 'unit-preview' }, info.units.map((u, i) => el('div', { class: 'row small' }, el('b', { style: { width: '72px' } }, unitLabel(info, i)), el('span', { style: { flex: 1 } }, u.title), AP_TOPICS[info.key]?.[i]?.length ? el('span', { class: 'faint' }, `${AP_TOPICS[info.key][i].length} topics`) : null, el('span', { class: 'muted', style: { width: '70px', textAlign: 'right' } }, u.weight)))),
    el('div', { class: 'small muted' }, 'Exam: ', info.exam.map((s) => `${s.name} — ${s.count} q, ${s.minutes} min, ${s.weight}%`).join(' · ')),
    el('label', { class: 'field' }, el('span', {}, 'Link to a class (for your schedule, grades and exam boost)'), cls),
    el(
      'div',
      { class: 'row' },
      el('button', { class: 'btn', onclick: () => ((st.key = null), m.rebuild()) }, '← Back'),
      el('span', { class: 'spacer' }),
      el(
        'button',
        {
          class: 'btn primary',
          onclick: () => {
            const course = createCourse(app, info, st.classId || null);
            m.close();
            confetti(window.innerWidth / 2, window.innerHeight / 3, 30);
            app.go('course', { id: course.id, tab: 'units' });
          },
        },
        `Add ${info.name}`,
      ),
    ),
  );
}

export function createCourse(app, info, classId) {
  if (!classId) {
    const code = `AP${info.name.replace(/^AP\s+/, '').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}`;
    const cls = { id: uid(), name: info.name, code, color: info.color || CLASS_COLORS[app.data.classes.length % CLASS_COLORS.length], teacher: '', room: '', meetings: [] };
    app.data.classes.push(cls);
    classId = cls.id;
  }
  const course = { id: uid(), key: info.key, classId, createdAt: new Date().toISOString(), unitSets: [], frqs: [], exams: [] };
  info.units.forEach((u, i) => {
    const set = { id: uid(), title: `${info.name.replace(/^AP /, 'AP ')} · ${unitLabel(info, i)}: ${u.title}`, classId, courseId: course.id, unit: i, description: `Exam weighting ${u.weight}`, createdAt: new Date().toISOString(), lastStudied: null, cards: [], questions: [], docIds: [], keyPoints: [], topics: [], bestMatchMs: null, tests: [] };
    app.data.sets.push(set);
    course.unitSets.push(set.id);
  });
  app.data.courses.push(course);
  app.commit({ render: false });
  return course;
}

// ------------------------------------------------------------------ Course page
export function renderCourse(app) {
  const st = (app.viewState.course ||= {});
  const course = courseById(app, st.id);
  if (!course) {
    app.view = 'courses';
    return renderCourses(app);
  }
  st.tab ||= 'units';
  const info = infoOf(course);
  const L = links(info);
  const apExam = app.data.items.find((i) => i.classId === course.classId && i.type === 'exam' && /AP Exam/.test(i.title) && !i.done);

  const header = el(
    'div',
    { class: 'set-header' },
    el(
      'div',
      { style: { flex: 1, minWidth: 0 } },
      el('button', { class: 'btn sm ghost', style: { marginLeft: '-10px' }, onclick: () => app.go('courses') }, '← AP & Courses'),
      el('div', { class: 'small', style: { color: tone(info.color), fontWeight: 800, letterSpacing: '0.08em', marginTop: '6px' } }, info.area.toUpperCase()),
      el('h2', { style: { fontSize: '1.9em', letterSpacing: '-0.02em', margin: '2px 0 8px' } }, info.name),
      el(
        'div',
        { class: 'row wrap' },
        extLink('AP Classroom', L.classroom, 'Opens AP Classroom (sign in with your College Board account)'),
        extLink('Course & CED', L.course, 'Official course page — download the Course and Exam Description PDF here'),
        extLink('Past FRQs', L.pastFrq, 'Released free-response questions with scoring guidelines'),
        extLink('Khan Academy', L.khan),
        L.openstax && extLink('Free textbook', L.openstax, 'OpenStax — free PDF'),
      ),
    ),
    el(
      'div',
      { style: { textAlign: 'center' } },
      ring(readiness(app, course), info.color, 92),
      el('div', { class: 'small muted' }, 'exam-weighted mastery'),
      apExam
        ? el(
            'div',
            { class: 'stack', style: { gap: '6px', marginTop: '6px' } },
            el('div', { class: 'small' }, el('b', {}, `${Math.max(0, Math.ceil((new Date(apExam.due) - new Date()) / 86400000))} days`), ` to the AP Exam (${fmtDate(apExam.due)})`),
            el('button', { class: 'btn sm primary', onclick: () => buildStudyPlan(app, course, apExam) }, course.planBuilt ? '🗺 Rebuild study plan' : '🗺 Build my study plan'),
          )
        : el('button', { class: 'btn sm', style: { marginTop: '6px' }, onclick: () => addExamDate(app, course) }, '📅 Add AP exam date'),
    ),
  );

  const tabs = el(
    'div',
    { class: 'seg' },
    [['units', `${info.unitWord || 'Unit'}s`], ['exam', 'Practice exams'], ['import', 'Import material'], ['format', 'Exam format & tips']].map(([k, l]) => el('button', { class: st.tab === k ? 'on' : '', onclick: () => app.go('course', { tab: k }) }, l)),
  );

  let body;
  if (st.tab === 'units') body = unitsTab(app, course, info);
  else if (st.tab === 'exam') body = examTab(app, course, info);
  else if (st.tab === 'import') body = importTab(app, course, info);
  else body = formatTab(info);

  const live = app.viewState.study?.session;
  const resume =
    live?.mode === 'exam' && live.courseId === course.id && live.phase !== 'results'
      ? el('div', { class: 'resume-banner' }, el('span', {}, `⏱ “${live.title}” is still in progress${live.timed ? ' — the clock is running' : ''}.`), el('span', { class: 'spacer' }), el('button', { class: 'btn sm primary', onclick: () => app.go('study') }, 'Resume'))
      : null;
  return el('div', {}, resume, header, el('div', { style: { marginBottom: '14px' } }, tabs), body);
}

// ------------------------------------------------------------------ Study plan → Planner
// Spreads unit reviews over the weeks before the AP Exam (more sessions for heavily weighted and
// weaker units), then switches to weekly full practice exams for the final stretch.
function buildStudyPlan(app, course, apExam) {
  const info = infoOf(course);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDay = new Date(apExam.due);
  const days = Math.floor((examDay - today) / 86400000);
  if (days < 3) return toast('The exam is too close for a plan — do a practice exam and review your mistakes.');
  // Remove the previous plan's unfinished sessions.
  app.data.items = app.data.items.filter((i) => !(i.apPlan === course.id && !i.done));
  const at = (d, h) => {
    const x = new Date(today);
    x.setDate(x.getDate() + d);
    x.setHours(h, 0, 0, 0);
    return x;
  };
  const item = (title, date, type, minutes, notes) => ({ id: uid(), title, type, classId: course.classId, due: date.toISOString(), estimateMin: minutes, weight: null, spentMin: 0, subtasks: [], plan: [{ id: uid(), day: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`, minutes, done: false }], notes, done: false, apPlan: course.id, createdAt: new Date().toISOString() });
  const finalDays = Math.min(28, Math.floor(days / 3));
  const reviewDays = days - finalDays;
  const added = [];

  // Priority per unit: exam weight × how much is still unmastered.
  const units = info.units
    .map((u, i) => ({ i, w: /not/i.test(u.weight) ? 0 : weightMid(u.weight) || 10 })) // skills-based units count equally
    .filter((u) => u.w > 0)
    .map((u) => {
      const set = unitSet(app, course, u.i);
      const m = set && set.cards.length ? mastery(set).pct / 100 : 0;
      return { ...u, p: u.w * (1.15 - m) };
    });
  const slots = Math.max(units.length, Math.min(units.length * 3, Math.floor((reviewDays * 3) / 7)));
  const per = allocate(slots, units.map((u) => u.p)).map((n) => Math.max(1, n));
  const order = units.flatMap((u, k) => Array(per[k]).fill(u.i)).sort((a, b) => a - b);
  order.forEach((ui, k) => {
    const d = 1 + Math.floor((k * Math.max(1, reviewDays - 1)) / order.length);
    added.push(item(`${info.name}: review ${unitLabel(info, ui)} — ${info.units[ui].title}`, at(d, 19), 'reading', 40, 'Orbit → AP & Courses: study the unit set, then take the unit test.'));
  });
  // Final stretch: a full practice exam every week, plus a mistakes session mid-week.
  for (let d = reviewDays + 1; d < days; d += 7) {
    added.push(item(`${info.name}: full practice exam`, at(Math.min(d + 2, days - 1), 9), 'exam', info.exam.reduce((t, s) => t + s.minutes, 0), 'Orbit → AP & Courses → Practice exams. Timed, like the real thing.'));
    if (d + 5 < days) added.push(item(`${info.name}: review mistakes + weakest unit`, at(d + 5, 19), 'reading', 40, 'Use “Study my mistakes” and Focus next.'));
  }
  app.data.items.push(...added);
  course.planBuilt = new Date().toISOString();
  app.commit();
  toast(`🗺 Added ${added.length} study sessions to your Planner, up to ${fmtDate(examDay)}`, { action: 'View', onAction: () => app.go('horizon') });
}

// The unit most worth your time right now.
function focusNext(app, course, info) {
  const scored = info.units
    .map((u, i) => {
      const set = unitSet(app, course, i);
      const w = /not/i.test(u.weight) ? 0 : weightMid(u.weight) || 10;
      if (!set || !w) return null;
      const has = set.cards.length || set.questions?.length;
      const m = set.cards.length ? mastery(set).pct / 100 : 0;
      const last = course.exams.filter((e) => e.kind === 'unit' && e.unit === i).at(-1);
      const testGap = last ? 1 - last.pct / 100 : 0.6;
      return { i, set, has, score: w * (1 - m) * (0.5 + testGap), m, last };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 2);
  if (!top.length) return null;
  return el(
    'div',
    { class: 'card focus-next' },
    el('h3', {}, '🎯 Focus next', el('span', { class: 'spacer' }), el('span', { class: 'faint small', style: { textTransform: 'none', letterSpacing: 0 } }, 'exam weight × what you haven’t mastered × recent test scores')),
    top.map(({ i, set, has, m, last }) =>
      el(
        'div',
        { class: 'row', style: { padding: '6px 0' } },
        el('b', { style: { width: '80px' } }, unitLabel(info, i)),
        el('div', { style: { flex: 1 } }, el('div', {}, info.units[i].title), el('div', { class: 'small muted' }, has ? `${Math.round(m * 100)}% mastered${last ? ` · last test ${Math.round(last.pct)}%` : ' · no unit test yet'} · ${info.units[i].weight} of the exam` : `No material yet · ${info.units[i].weight} of the exam`)),
        has
          ? el('div', { class: 'row', style: { gap: '6px' } }, el('button', { class: 'btn sm', disabled: set.cards.length < 2, onclick: () => startStudy(app, set.id, 'learn') }, 'Learn'), el('button', { class: 'btn sm primary', onclick: () => startExam(app, course, { kind: 'unit', unit: i }) }, 'Unit test'))
          : el('button', { class: 'btn sm primary', onclick: () => openAddMaterial(app, course, i) }, '+ Add material'),
      ),
    ),
  );
}

function trendChart(exams) {
  const pts = exams.slice(-12);
  if (pts.length < 2) return null;
  const W = 520;
  const H = 110;
  const x = (i) => 20 + (i * (W - 40)) / (pts.length - 1);
  const y = (p) => H - 14 - (p / 100) * (H - 28);
  const ns = 'http://www.w3.org/2000/svg';
  const svgEl = document.createElementNS(ns, 'svg');
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svgEl.setAttribute('class', 'trend');
  const mk = (tag, attrs) => {
    const n = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svgEl.appendChild(n);
    return n;
  };
  [30, 45, 58, 72].forEach((g, k) => {
    mk('line', { x1: 20, x2: W - 20, y1: y(g), y2: y(g), stroke: 'currentColor', 'stroke-opacity': 0.12, 'stroke-dasharray': '3 4' });
    mk('text', { x: W - 16, y: y(g) + 3, 'font-size': 9, fill: 'currentColor', 'fill-opacity': 0.5 }).textContent = String(k + 2);
  });
  mk('polyline', { points: pts.map((e, i) => `${x(i)},${y(e.pct)}`).join(' '), fill: 'none', stroke: '#8b6cff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  pts.forEach((e, i) => mk('circle', { cx: x(i), cy: y(e.pct), r: 4, fill: e.kind === 'unit' ? '#1fc8a9' : '#ff6b8b' }));
  return el('div', {}, svgEl, el('div', { class: 'small faint' }, '● pink = practice exam · ● teal = unit test · dashed lines = rough 2/3/4/5 thresholds'));
}

function unitsTab(app, course, info) {
  const open = (app.viewState.course.open ||= {});
  const covered = (course.covered ||= {});
  const skills = app.data.sets.find((x) => x.courseId === course.id && x.skills);
  return el(
    'div',
    { class: 'stack', style: { gap: '10px' } },
    focusNext(app, course, info),
    skills &&
      el(
        'div',
        { class: 'unit-row' },
        el('div', { class: 'unit-num', style: { borderColor: info.color, color: tone(info.color) } }, '★'),
        el('div', { style: { flex: 1 } }, el('b', {}, 'Skills (from the CED)'), el('div', { class: 'small muted' }, `${skills.cards.length} cards · ${mastery(skills).pct}% mastered — used in every unit`)),
        el('button', { class: 'btn sm primary', onclick: () => app.go('set', { id: skills.id }) }, 'Study'),
      ),
    info.units.map((u, i) => {
      const set = unitSet(app, course, i);
      if (!set) return null;
      const m = mastery(set);
      const qn = set.questions?.length || 0;
      const empty = !set.cards.length && !qn;
      const lastTest = course.exams.filter((e) => e.kind === 'unit' && e.unit === i).at(-1);
      const topics = AP_TOPICS[course.key]?.[i] || [];
      const done = topics.filter(([n]) => covered[n]).length;
      const row = el(
        'div',
        { class: 'unit-row' },
        el('div', { class: 'unit-num', style: { borderColor: info.color, color: tone(info.color) } }, String((info.unitStart || 1) + i)),
        el(
          'div',
          { style: { flex: 1, minWidth: 0 } },
          el('div', { class: 'row' }, el('b', {}, u.title), el('span', { class: 'chip' }, u.weight)),
          el('div', { class: 'small muted', style: { margin: '2px 0 6px' } }, empty ? 'No material yet — import the CED or add class notes / AP Classroom printouts.' : `${m.n} cards · ${qn} questions · ${m.pct}% mastered${lastTest ? ` · last unit test ${Math.round(lastTest.pct)}%` : ''}`),
          !empty && orbitBar(set),
        ),
        el(
          'div',
          { class: 'row', style: { gap: '6px' } },
          el('button', { class: 'btn sm', onclick: () => openAddMaterial(app, course, i) }, '+ Material'),
          el('button', { class: 'btn sm', disabled: !set.cards.length, onclick: () => app.go('set', { id: set.id }) }, 'Study'),
          el('button', { class: 'btn sm primary', disabled: empty, onclick: () => startExam(app, course, { kind: 'unit', unit: i }) }, 'Unit test'),
        ),
      );
      if (!topics.length) return row;
      // Official topic list, with "covered in class" checkboxes.
      const toggle = el('button', { class: 'topic-toggle', onclick: () => ((open[i] = !open[i]), app.render()) }, `${open[i] ? '▾' : '▸'} ${topics.length} official topics`, done ? el('span', { class: 'muted' }, ` · ${done}/${topics.length} covered in class`) : null);
      return el(
        'div',
        { class: 'unit-wrap' },
        row,
        el(
          'div',
          { class: 'topic-panel' },
          toggle,
          open[i] &&
            el(
              'div',
              { class: 'topic-list' },
              topics.map(([n, t]) => {
                const cb = el('input', { type: 'checkbox', class: 'check sq', checked: !!covered[n] });
                cb.addEventListener('change', () => {
                  if (cb.checked) covered[n] = true;
                  else delete covered[n];
                  app.commit();
                });
                return el('label', { class: `topic${covered[n] ? ' done' : ''}` }, cb, el('b', {}, n), el('span', {}, t));
              }),
              el('div', { class: 'row small', style: { marginTop: '6px' } }, el('button', { class: 'btn sm ghost', onclick: () => (topics.forEach(([n]) => (covered[n] = true)), app.commit()) }, 'Mark all covered'), el('button', { class: 'btn sm ghost', onclick: () => (topics.forEach(([n]) => delete covered[n]), app.commit()) }, 'Clear')),
            ),
        ),
      );
    }),
  );
}

function examTab(app, course, info) {
  const total = [...course.unitSets.map((id) => setById(app, id)), app.data.sets.find((x) => x.courseId === course.id && x.skills)].filter(Boolean);
  const content = total.reduce((n, s) => n + s.cards.length + (s.questions?.length || 0), 0);
  const covered = total.filter((s) => s.cards.length || s.questions?.length).length;
  const hist = [...course.exams].reverse();
  return el(
    'div',
    { class: 'dash' },
    el(
      'div',
      { class: 'card stack' },
      el('h3', { style: { marginBottom: 0 } }, '🏁 Practice AP exam'),
      el('p', { class: 'small muted', style: { margin: 0 } }, `Built like the real ${info.name} exam: the same sections, question counts and timing, with multiple-choice questions spread across units by their official exam weighting. Questions come from your material (${covered}/${info.units.length} units have content).`),
      formatTable(info),
      el(
        'div',
        { class: 'row wrap' },
        el('button', { class: 'btn primary', disabled: content < 8, onclick: () => startExam(app, course, { kind: 'full' }) }, 'Full-length exam'),
        el('button', { class: 'btn', disabled: content < 8, onclick: () => startExam(app, course, { kind: 'half' }) }, 'Half-length'),
        el('button', { class: 'btn', disabled: content < 8, onclick: () => startExam(app, course, { kind: 'mcq' }) }, 'Multiple choice only'),
      ),
      content < 8 && el('div', { class: 'small muted' }, 'Add material to a few units first (Import material tab).'),
      el('div', { class: 'small faint' }, 'Units without material are skipped and their share goes to the others. Your score is converted to an estimated 1–5 — real cut scores vary by subject and year.'),
    ),
    el(
      'div',
      { class: 'card stack' },
      el('h3', { style: { marginBottom: 0 } }, `✍️ Free-response bank (${course.frqs.length})`),
      el('p', { class: 'small muted', style: { margin: 0 } }, 'Add released free-response questions (free on the College Board “Past FRQs” page) or your teacher’s prompts. They’re used in the FRQ sections; otherwise Orbit uses the CED learning objectives as prompts.'),
      el('div', { class: 'row wrap' }, el('button', { class: 'btn sm', onclick: () => openAddFrq(app, course) }, '+ Add FRQ prompts'), extLink('Past FRQs', links(info).pastFrq)),
      course.frqs.slice(-5).map((f) => el('div', { class: 'frq-mini' }, el('div', { class: 'small' }, f.prompt.slice(0, 180), f.prompt.length > 180 ? '…' : ''), el('button', { class: 'btn icon ghost', title: 'Remove', onclick: () => ((course.frqs = course.frqs.filter((x) => x !== f)), app.commit()) }, '✕'))),
    ),
    el(
      'div',
      { class: 'card wide' },
      el('h3', {}, '📈 History'),
      trendChart(course.exams),
      hist.length
        ? hist.map((e) =>
            el(
              'div',
              { class: 'row', style: { padding: '8px 0', borderBottom: '1px solid var(--line)' } },
              el('b', { style: { width: '170px' } }, e.kind === 'unit' ? `${unitLabel(info, e.unit)} test` : { full: 'Full exam', half: 'Half exam', mcq: 'MCQ section' }[e.kind]),
              el('span', { class: 'muted small', style: { width: '120px' } }, fmtDate(e.at)),
              el('span', { style: { flex: 1 } }, `MCQ ${e.mcq.right}/${e.mcq.total}${e.frq.max ? ` · FRQ ${e.frq.pts}/${e.frq.max}` : ''}`),
              el('b', {}, e.apScore ? `≈ ${e.apScore}` : `${Math.round(e.pct)}%`),
            ),
          )
        : el('div', { class: 'muted small' }, 'Take a unit test or practice exam to track progress here.'),
    ),
  );
}

function formatTable(info) {
  return el(
    'table',
    { class: 'fmt-table' },
    el('thead', {}, el('tr', {}, ['Section', 'Questions', 'Time', 'Weight'].map((h) => el('th', {}, h)))),
    el('tbody', {}, info.exam.map((s) => el('tr', {}, el('td', {}, el('b', {}, s.name), s.note ? el('div', { class: 'small muted' }, s.note) : null), el('td', {}, String(s.count)), el('td', {}, `${s.minutes} min`), el('td', {}, `${s.weight}%`)))),
  );
}

function formatTab(info) {
  return el(
    'div',
    { class: 'dash' },
    el('div', { class: 'card' }, el('h3', {}, '🧾 Exam format'), formatTable(info), el('p', { class: 'small faint' }, 'From the official Course and Exam Description. AP Exams are taken digitally in the Bluebook app.')),
    el('div', { class: 'card wide' }, el('h3', {}, '🗣 FRQ task verbs — what each one asks for'), el('div', { class: 'verbs' }, TASK_VERBS.map(([v, d]) => el('div', { class: 'verb' }, el('b', {}, v), el('span', { class: 'small muted' }, d))))),
    el('div', { class: 'card' }, el('h3', {}, '💡 How to study for this exam'), el('ul', { class: 'tips' }, info.tips.map((t) => el('li', {}, t)), el('li', {}, 'Use Review daily (spaced repetition) and a unit test after each unit; switch to full practice exams in the last 4–6 weeks.'))),
    el(
      'div',
      { class: 'card wide' },
      el('h3', {}, '📚 Units & exam weighting'),
      info.units.map((u, i) => {
        const w = weightMid(u.weight);
        return el('div', { class: 'row small', style: { padding: '5px 0' } }, el('b', { style: { width: '80px' } }, unitLabel(info, i)), el('span', { style: { flex: 1 } }, u.title), el('div', { class: 'weight-bar' }, el('div', { style: { width: `${clamp(w * 2.5, 0, 100)}%`, background: info.color } })), el('span', { class: 'muted', style: { width: '80px', textAlign: 'right' } }, u.weight));
      }),
    ),
  );
}

function importTab(app, course, info) {
  const L = links(info);
  const cedInput = el('input', { type: 'file', accept: '.pdf,application/pdf', class: 'hidden' });
  cedInput.addEventListener('change', () => cedInput.files[0] && importCED(app, course, cedInput.files[0]));
  const cedZone = el(
    'div',
    { class: 'card pdf-drop' },
    el('div', { class: 'big' }, '📘'),
    el('b', {}, 'Import the Course and Exam Description (CED)'),
    el('div', { class: 'small muted' }, 'The CED is the College Board’s free official PDF for the course. Orbit reads every unit’s topics, learning objectives and essential knowledge and turns them into cards for each unit.'),
    el('div', { class: 'row', style: { justifyContent: 'center' } }, extLink('1. Get the CED PDF', L.course, 'Look for “Course and Exam Description” on the course page'), el('button', { class: 'btn primary', onclick: () => cedInput.click() }, '2. Upload it')),
    cedInput,
  );
  wireFileDrop(cedZone, (files) => files[0] && importCED(app, course, files[0]));

  const matZone = el(
    'div',
    { class: 'card pdf-drop' },
    el('div', { class: 'big' }, '🏫'),
    el('b', {}, 'Add AP Classroom or class material'),
    el('div', { class: 'small muted' }, 'Progress checks, topic questions, teacher handouts, notes, study guides. Orbit detects the unit, pulls out multiple-choice questions (with answer keys) for your tests and makes flashcards from the rest.'),
    el('button', { class: 'btn primary', onclick: () => openAddMaterial(app, course, null) }, 'Add material'),
  );
  wireFileDrop(matZone, (files) => openAddMaterial(app, course, null, files));

  return el(
    'div',
    { class: 'stack' },
    el('div', { class: 'dash' }, cedZone, matZone),
    el(
      'div',
      { class: 'card' },
      el('h3', {}, '🔐 Getting material out of AP Classroom'),
      el('p', { class: 'small muted', style: { marginTop: 0 } }, 'AP Classroom sits behind your College Board sign-in and doesn’t offer a way for other apps to read it, so Orbit can’t log in for you (and shouldn’t — your password stays yours). It takes seconds to bring material over yourself:'),
      el(
        'ol',
        { class: 'tips' },
        el('li', {}, 'Open ', extLink('AP Classroom', L.classroom), ' and go to the progress check, topic questions or resource you want.'),
        el('li', {}, 'Press Ctrl+P (⌘+P on Mac) and choose “Save as PDF” — or select the text and copy it.'),
        el('li', {}, 'Click “Add material” above and drop in the PDF (or paste the text). Include the answers/explanations page if you have it, so questions are auto-graded.'),
      ),
      el('p', { class: 'small faint', style: { marginBottom: 0 } }, 'Everything you import stays encrypted on your device. Please keep AP Classroom material for your own studying.'),
    ),
  );
}

async function readFiles(files, onStatus) {
  const docs = [];
  for (const f of files) {
    const bytes = new Uint8Array(await f.arrayBuffer());
    if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf') {
      onStatus?.(`Reading ${f.name}…`);
      const { extractPdfText } = await import('./pdf.js');
      const r = await extractPdfText(bytes.slice(), (p) => onStatus?.(`Reading ${f.name} — ${Math.round(p * 100)}%`));
      docs.push({ name: f.name.replace(/\.pdf$/i, ''), text: r.text, pdf: bytes, pages: r.pages });
    } else {
      docs.push({ name: f.name, text: dec.decode(bytes), pdf: null, pages: 0 });
    }
  }
  return docs;
}

async function saveDoc(app, d, set) {
  const id = uid();
  if (d.pdf) await app.session.saveFile(`${id}.pdf`, d.pdf);
  await app.session.saveFile(`${id}.txt`, enc.encode(d.text));
  app.data.docs.push({ id, name: d.name, pdf: !!d.pdf, pages: d.pages, chars: d.text.length, createdAt: new Date().toISOString() });
  if (set) set.docIds = [...(set.docIds || []), id];
  return id;
}

function addCardsToSet(set, cards) {
  const have = new Set(set.cards.map((c) => c.term.toLowerCase()));
  let n = 0;
  for (const c of cards) {
    if (!c.term || !c.def || have.has(c.term.toLowerCase())) continue;
    have.add(c.term.toLowerCase());
    set.cards.push(newCard(c.term, c.def, c.kind));
    n++;
  }
  return n;
}

async function importCED(app, course, file) {
  const info = infoOf(course);
  const t = toast(`Reading the ${info.name} CED — large PDFs take a moment…`, { ms: 60000 });
  try {
    const [doc] = await readFiles([file]);
    const units = parseCED(doc.text, info);
    const found = units.reduce((n, u) => n + u.los.length + u.eks.length, 0);
    t?.remove?.();
    if (found < 3) {
      toast('Couldn’t find CED learning objectives in that PDF. Is it the Course and Exam Description? You can still add it as regular material.', { ms: 6000 });
      return;
    }
    // Skill-based courses (English) repeat the same skills in every unit: one Skills deck instead.
    const summary = info.skillBased
      ? [{ i: -1, ...cedCards({ topics: [], los: units.flatMap((u) => u.los), eks: units.flatMap((u) => u.eks).sort((a, b) => a.at - b.at) }, { maxCards: 120 }) }]
      : units.map((u, i) => ({ i, ...cedCards(u), los: u.los.length, eks: u.eks.length }));
    const setFor = (s) => {
      if (s.i >= 0) return unitSet(app, course, s.i);
      let set = app.data.sets.find((x) => x.courseId === course.id && x.skills);
      if (!set) {
        set = { id: uid(), title: `${info.name} · Skills (from the CED)`, classId: course.classId, courseId: course.id, skills: true, description: 'Official skills and essential knowledge for the course.', createdAt: new Date().toISOString(), lastStudied: null, cards: [], questions: [], docIds: [], keyPoints: [], topics: [], bestMatchMs: null, tests: [] };
        app.data.sets.push(set);
      }
      return set;
    };
    modal(
      'CED import',
      (m) =>
        el(
          'div',
          { class: 'stack' },
          el('p', { class: 'muted', style: { margin: 0 } }, `Found ${found} learning objectives and essential-knowledge statements. Here’s what each unit gets:`),
          el('div', { class: 'unit-preview' }, summary.map((s) => el('div', { class: 'row small' }, el('b', { style: { width: '80px' } }, s.i < 0 ? 'Skills' : unitLabel(info, s.i)), el('span', { style: { flex: 1 } }, s.i < 0 ? 'One deck of the course’s official skills (they repeat across all 9 units)' : info.units[s.i].title), el('span', { class: 'muted' }, s.cards.length ? `${s.topics.length} topics · ${s.cards.length} cards` : '—')))),
          el(
            'div',
            { class: 'row' },
            el('span', { class: 'spacer' }),
            el('button', { class: 'btn', onclick: () => m.close() }, 'Cancel'),
            el(
              'button',
              {
                class: 'btn primary',
                onclick: async () => {
                  let total = 0;
                  const docId = await saveDoc(app, doc, null);
                  for (const s of summary) {
                    if (!s.cards.length) continue;
                    const set = setFor(s);
                    if (!set) continue;
                    total += addCardsToSet(set, s.cards);
                    set.topics = [...new Set([...(set.topics || []), ...s.topics])];
                    set.keyPoints = [...(set.keyPoints || []), ...s.keyPoints].slice(0, 20);
                    set.docIds = [...new Set([...(set.docIds || []), docId])];
                  }
                  course.cedImported = new Date().toISOString();
                  m.close();
                  app.commit();
                  confetti(window.innerWidth / 2, window.innerHeight / 3, 30);
                  toast(info.skillBased ? `🔒 Added ${total} skill cards` : `🔒 Added ${total} cards across ${summary.filter((s) => s.cards.length).length} units`);
                  if (info.skillBased) app.go('set', { id: setFor(summary[0]).id });
                  else app.go('course', { tab: 'units' });
                },
              },
              'Add to units',
            ),
          ),
        ),
      { center: true, wide: true },
    );
  } catch (err) {
    t?.remove?.();
    toast(err.message || 'Could not read that PDF.', { ms: 6000 });
  }
}

// Material for one unit (or auto-detected): PDF or pasted text → MC questions + cards.
function openAddMaterial(app, course, unit, files = null) {
  const info = infoOf(course);
  const st = { files: files ? [...files] : [], paste: '', unit, busy: '', error: '', result: null };
  const ctl = modal(
    unit === null ? `Add material — ${info.name}` : `Add material — ${unitLabel(info, unit)}: ${info.units[unit].title}`,
    (m) => {
      if (st.result) {
        const r = st.result;
        const sel = el('select', {}, info.units.map((u, i) => el('option', { value: i }, `${unitLabel(info, i)}: ${u.title}`)));
        sel.value = st.unit ?? 0;
        sel.addEventListener('change', () => (st.unit = parseInt(sel.value, 10)));
        const answered = r.questions.filter((q) => q.answer !== null).length;
        return el(
          'div',
          { class: 'stack' },
          el('div', { class: 'grid-3' }, stat(r.questions.length, 'multiple-choice questions'), stat(answered, 'with answers'), stat(r.cards.length + answered, 'flashcards')),
          r.questions.length > answered && el('div', { class: 'small muted' }, `${r.questions.length - answered} questions have no answer key yet — you can set answers on the unit’s question list later. Until then they’re skipped in tests.`),
          el('label', { class: 'field' }, el('span', {}, r.detected >= 0 ? 'Unit (auto-detected — change if wrong)' : 'Which unit is this?'), sel),
          r.questions.length > 0 && el('details', {}, el('summary', { class: 'small muted' }, 'Preview questions'), el('ol', { class: 'key-points small' }, r.questions.slice(0, 8).map((q) => el('li', {}, q.stem, el('div', { class: 'faint' }, q.choices.map((c, i) => `${'ABCDE'[i]}) ${c}${q.answer === i ? ' ✓' : ''}`).join('   ')))))),
          el(
            'div',
            { class: 'row' },
            el('button', { class: 'btn', onclick: () => ((st.result = null), m.rebuild()) }, '← Back'),
            el('span', { class: 'spacer' }),
            el(
              'button',
              {
                class: 'btn primary',
                onclick: async () => {
                  const set = unitSet(app, course, st.unit ?? 0);
                  for (const d of r.docs) await saveDoc(app, d, set);
                  set.questions = [...(set.questions || []), ...r.questions.map((q) => ({ id: uid(), stem: q.stem, choices: q.choices, answer: q.answer, explain: q.explain || '', source: r.docs[0]?.name || 'pasted' }))];
                  // Answered questions also become flashcards (question → correct answer).
                  const qa = r.questions.filter((q) => q.answer !== null).map((q) => ({ term: q.stem, def: q.choices[q.answer], kind: 'qa' }));
                  const n = addCardsToSet(set, [...qa, ...r.cards]);
                  set.keyPoints = [...(set.keyPoints || []), ...r.keyPoints].slice(0, 20);
                  m.close();
                  app.commit();
                  toast(`🔒 ${unitLabel(info, st.unit ?? 0)}: +${r.questions.length} questions, +${n} cards`);
                },
              },
              'Add to unit',
            ),
          ),
        );
      }
      const input = el('input', { type: 'file', accept: '.pdf,application/pdf,.txt,text/plain', multiple: true, class: 'hidden' });
      input.addEventListener('change', () => (st.files.push(...input.files), m.rebuild()));
      const zone = el('div', { class: 'pdf-drop' }, el('div', { class: 'big' }, '📄'), el('div', {}, el('button', { class: 'btn primary', onclick: () => input.click() }, 'Choose PDFs'), ' or drop them here'), input);
      wireFileDrop(zone, (fl) => (st.files.push(...fl), m.rebuild()));
      const ta = el('textarea', { rows: 6, placeholder: '…or paste text: progress-check questions (with “Answer: B” lines or an answer key), notes, a study guide…' }, st.paste);
      ta.addEventListener('input', () => (st.paste = ta.value));
      return el(
        'div',
        { class: 'stack' },
        zone,
        st.files.map((f, i) => el('div', { class: 'row small file-chip' }, el('span', {}, '📄'), el('b', {}, f.name), el('span', { class: 'spacer' }), el('button', { class: 'btn icon ghost', onclick: () => (st.files.splice(i, 1), m.rebuild()) }, '✕'))),
        ta,
        st.error && el('div', { class: 'error' }, st.error),
        el(
          'div',
          { class: 'row' },
          st.busy && el('span', { class: 'muted small status' }, st.busy),
          el('span', { class: 'spacer' }),
          el(
            'button',
            {
              class: 'btn primary',
              disabled: !!st.busy,
              onclick: async () => {
                st.error = '';
                try {
                  if (!st.files.length && st.paste.trim().length < 20) throw new Error('Add a PDF or paste some text.');
                  st.busy = 'Reading…';
                  m.rebuild();
                  const docs = await readFiles(st.files, (s) => {
                    const b = m.body.querySelector('.status');
                    if (b) b.textContent = s;
                  });
                  if (st.paste.trim()) docs.push({ name: `Pasted (${fmtDate(new Date())})`, text: st.paste, pdf: null, pages: 0 });
                  const all = docs.map((d) => d.text).join('\n\n');
                  const questions = parseMCQ(all);
                  // If it's mostly a question sheet, don't also mine it for flashcards.
                  const g = questions.length >= 3 ? { cards: [], keyPoints: [] } : generateCards(all, { maxCards: 60 });
                  const detected = detectUnit(all, info);
                  if (st.unit === null) st.unit = detected >= 0 ? detected : 0;
                  st.result = { docs, questions, cards: g.cards, keyPoints: g.keyPoints, detected };
                  if (!questions.length && !g.cards.length) throw new Error('Couldn’t find questions or card-shaped facts in that material.');
                  st.busy = '';
                  m.rebuild();
                } catch (err) {
                  st.busy = '';
                  st.result = null;
                  st.error = err.message;
                  m.rebuild();
                }
              },
            },
            'Read material →',
          ),
        ),
      );
    },
    { center: true, wide: true },
  );
  return ctl;
}

function stat(n, label) {
  return el('div', { class: 'stat', style: { textAlign: 'center' } }, el('b', {}, String(n)), el('span', {}, label));
}

function openAddFrq(app, course) {
  const info = infoOf(course);
  const st = { text: '', unit: '' };
  modal(
    'Add free-response prompts',
    (m) => {
      const ta = el('textarea', { rows: 10, placeholder: 'Paste one or more FRQs. Numbered questions (1., 2., …) are split automatically.\n\nTip: include the scoring guideline after each prompt as “Rubric: …” to compare your answer against it.' }, st.text);
      ta.addEventListener('input', () => (st.text = ta.value));
      const input = el('input', { type: 'file', accept: '.pdf,application/pdf', class: 'hidden' });
      input.addEventListener('change', async () => {
        const [d] = await readFiles([input.files[0]]);
        st.text = d.text;
        m.rebuild();
      });
      const unit = el('select', {}, el('option', { value: '' }, 'Any / mixed units'), info.units.map((u, i) => el('option', { value: i }, `${unitLabel(info, i)}: ${u.title}`)));
      unit.value = st.unit;
      unit.addEventListener('change', () => (st.unit = unit.value));
      return el(
        'div',
        { class: 'stack' },
        el('div', { class: 'row' }, el('button', { class: 'btn sm', onclick: () => input.click() }, '📄 Load from PDF'), extLink('Released FRQs', links(info).pastFrq), input),
        ta,
        el('label', { class: 'field' }, el('span', {}, 'Unit'), unit),
        el(
          'div',
          { class: 'row' },
          el('span', { class: 'spacer' }),
          el('button', { class: 'btn', onclick: () => m.close() }, 'Cancel'),
          el(
            'button',
            {
              class: 'btn primary',
              onclick: () => {
                const parts = splitFRQ(st.text).filter((p) => p.length > 40);
                if (!parts.length) return toast('Paste at least one prompt.');
                for (const p of parts) {
                  const [prompt, rubric] = p.split(/\n?\s*rubric\s*:\s*/i);
                  course.frqs.push({ id: uid(), prompt: prompt.trim(), rubric: rubric?.trim() || '', unit: st.unit === '' ? null : parseInt(st.unit, 10) });
                }
                m.close();
                app.commit();
                toast(`Added ${parts.length} FRQ prompt${parts.length > 1 ? 's' : ''}`);
              },
            },
            'Add prompts',
          ),
        ),
      );
    },
    { center: true, wide: true },
  );
}

function addExamDate(app, course) {
  const info = infoOf(course);
  // AP Exams run over the first two full weeks of May.
  const now = new Date();
  const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  const guess = new Date(year, 4, 8, 8, 0);
  modal(
    'AP exam date',
    (m) => {
      const input = el('input', { type: 'datetime-local', value: `${year}-05-${String(guess.getDate()).padStart(2, '0')}T08:00` });
      return el(
        'div',
        { class: 'stack' },
        el('p', { class: 'small muted', style: { margin: 0 } }, 'AP Exams are held in the first two weeks of May — check the official schedule on AP Students for your exact date. Orbit adds it to your Planner and boosts this course’s reviews in the final week.'),
        input,
        el(
          'div',
          { class: 'row' },
          el('span', { class: 'spacer' }),
          el(
            'button',
            {
              class: 'btn primary',
              onclick: () => {
                if (!input.value) return;
                app.data.items.push({ id: uid(), title: `${info.name} AP Exam`, type: 'exam', classId: course.classId, due: new Date(input.value).toISOString(), estimateMin: 600, weight: null, spentMin: 0, subtasks: [], plan: [], notes: 'Official AP Exam', done: false, createdAt: new Date().toISOString() });
                m.close();
                app.commit();
                toast('AP exam added to your Planner');
              },
            },
            'Add to Planner',
          ),
        ),
      );
    },
    { center: true },
  );
}

// ------------------------------------------------------------------ Exam engine
function allocate(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * total);
  const out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => left-- > 0 && out[i]++);
  return out;
}

// Distractors come from the same kind of card AND a similar answer length, so the right answer
// can't be spotted just because it's the only long (or short) option.
const ptsFor = (spec, i) => (Array.isArray(spec.pts) ? spec.pts[i % spec.pts.length] : spec.pts || 4);

const grp = (c) => `${c.kind === 'cloze' ? 'cloze' : c.kind === 'qa' ? 'qa' : 'def'}:${c.def.length > 90 ? 'long' : 'short'}`;

function cardQuestion(card, unitCards, courseCards) {
  const same = shuffle(unitCards.filter((c) => c.id !== card.id && grp(c) === grp(card)));
  const others = shuffle(courseCards.filter((c) => c.id !== card.id && grp(c) === grp(card) && !same.includes(c)));
  const kindOnly = (c) => grp(c).split(':')[0] === grp(card).split(':')[0];
  const fallback = shuffle(courseCards.filter((c) => c.id !== card.id && kindOnly(c) && !same.includes(c) && !others.includes(c)));
  const pool = [...same, ...others, ...fallback];
  let stem;
  let answer;
  let distract;
  if (card.kind === 'cloze') {
    stem = `Which of the following correctly completes the statement? “${card.term}”`;
    answer = card.def;
    distract = pool.map((c) => c.def);
  } else if (card.kind === 'qa') {
    stem = card.term;
    answer = card.def;
    distract = pool.map((c) => c.def);
  } else if (Math.random() < 0.5) {
    stem = `Which of the following best describes ${card.term.replace(/\.$/, '')}?`;
    answer = card.def;
    distract = pool.map((c) => c.def);
  } else {
    stem = `Which term is described by the following? “${card.def}”`;
    answer = card.term;
    distract = pool.map((c) => c.term);
  }
  const uniq = [...new Set(distract.filter((d) => d && d !== answer))].slice(0, 3);
  if (uniq.length < 2) return null;
  const choices = shuffle([answer, ...uniq]);
  return { stem, choices, answer: choices.indexOf(answer), cardId: card.id };
}

function buildExam(app, course, { kind, unit }) {
  const info = infoOf(course);
  const sets = info.units.map((_, i) => unitSet(app, course, i));
  const courseCards = sets.flatMap((s) => s?.cards || []);
  const scale = kind === 'half' ? 0.5 : 1;
  const sections = [];

  // --- multiple choice ---
  // Some exams split multiple choice into timed parts (e.g. Calculus: no-calculator + calculator).
  const mcqSpecs = info.exam.filter((s) => s.kind === 'mcq');
  const mcqTotal = mcqSpecs.reduce((t, s) => t + s.count, 0);
  const perQ = mcqSpecs.reduce((t, s) => t + s.minutes, 0) / mcqTotal;
  const unitsInScope = kind === 'unit' ? [unit] : info.units.map((_, i) => i);
  const available = unitsInScope.map((i) => (sets[i]?.questions || []).filter((q) => q.answer !== null).length + (sets[i]?.cards.length || 0));
  const target = kind === 'unit' ? Math.min(20, available[0]) : Math.round(mcqTotal * scale);
  const weights = unitsInScope.map((i, k) => (available[k] ? weightMid(info.units[i].weight) || 1 : 0));
  const per = allocate(target, weights);
  const mcqItems = [];
  unitsInScope.forEach((u, k) => {
    const set = sets[u];
    if (!set || !per[k]) return;
    const bank = shuffle((set.questions || []).filter((q) => q.answer !== null)).map((q) => ({ stem: q.stem, choices: q.choices, answer: q.answer, explain: q.explain || '', bank: true }));
    // Answered bank questions also exist as flashcards — don't ask the same thing twice.
    const bankStems = new Set(bank.map((q) => q.stem.toLowerCase()));
    const made = shuffle(set.cards.filter((c) => !bankStems.has(c.term.toLowerCase())))
      .map((c) => cardQuestion(c, set.cards, courseCards))
      .filter(Boolean);
    const take = [...bank, ...made].slice(0, per[k]);
    take.forEach((q) => mcqItems.push({ ...q, unit: u, setId: set.id, given: null, flag: false }));
  });
  // Skills-based courses (English): the Skills deck supplies questions for full exams.
  const skills = app.data.sets.find((x) => x.courseId === course.id && x.skills);
  if (skills && kind !== 'unit' && mcqItems.length < target) {
    const need = target - mcqItems.length;
    shuffle(skills.cards)
      .map((c) => cardQuestion(c, skills.cards, [...courseCards, ...skills.cards]))
      .filter(Boolean)
      .slice(0, need)
      .forEach((q) => mcqItems.push({ ...q, unit: null, setId: skills.id, given: null, flag: false }));
  }
  const pool = shuffle(mcqItems);
  if (kind === 'unit' || mcqSpecs.length === 1) {
    const spec = mcqSpecs[0];
    const w = mcqSpecs.reduce((t, x) => t + x.weight, 0);
    if (pool.length) sections.push({ kind: 'mcq', name: 'Multiple choice', note: kind === 'unit' ? '' : spec.note, items: pool, minutes: Math.max(5, Math.round(perQ * pool.length)), weight: w });
  } else {
    const split = allocate(pool.length, mcqSpecs.map((x) => x.count));
    let at = 0;
    mcqSpecs.forEach((spec, k) => {
      const items = pool.slice(at, at + split[k]);
      at += split[k];
      if (items.length) sections.push({ kind: 'mcq', name: spec.name, note: spec.note, items, minutes: Math.max(3, Math.round((spec.minutes / spec.count) * items.length)), weight: spec.weight });
    });
  }

  // --- free response ---
  if (kind !== 'mcq') {
    const frqSpecs = info.exam.filter((s) => s.kind === 'frq');
    const loCards = unitsInScope.flatMap((u) => (sets[u]?.cards || []).filter((c) => c.kind === 'qa' && c.def.length > 60).map((c) => ({ c, u })));
    const bank = course.frqs.filter((f) => kind !== 'unit' || f.unit === null || f.unit === unit);
    let bankPool = shuffle(bank);
    let loPool = shuffle(loCards);
    const built = shuffle(info.prompts || []);
    for (const spec of frqSpecs) {
      const count = kind === 'unit' ? 1 : Math.max(1, Math.round(spec.count * scale));
      const items = [];
      for (let i = 0; i < count; i++) {
        if (bankPool.length) {
          const f = bankPool.shift();
          items.push({ prompt: f.prompt, model: f.rubric || '', unit: f.unit, response: '', max: ptsFor(spec, items.length), pts: null });
        } else if (loPool.length) {
          const { c, u } = loPool.shift();
          items.push({ prompt: `${c.term}. Use specific evidence and course vocabulary in your answer.`, model: c.def, unit: u, response: '', max: ptsFor(spec, items.length), pts: null });
        } else if (built.length) {
          const b = built.shift();
          items.push({ prompt: b.prompt, model: b.rubric, unit: null, response: '', max: ptsFor(spec, items.length), pts: null });
        }
      }
      if (items.length) sections.push({ kind: 'frq', name: spec.name, note: spec.note, items, minutes: Math.max(5, Math.round((spec.minutes / spec.count) * items.length)), weight: spec.weight });
      if (kind === 'unit') break;
    }
  }
  return sections;
}

export function startExam(app, course, { kind, unit = null }) {
  const sections = buildExam(app, course, { kind, unit });
  if (!sections.length || !sections[0].items.length) return toast('Not enough material yet — add cards or questions to this unit first.');
  const info = infoOf(course);
  const title = kind === 'unit' ? `${unitLabel(info, unit)} test — ${info.units[unit].title}` : `${info.name} · ${{ full: 'Full practice exam', half: 'Half-length practice exam', mcq: 'Multiple-choice practice' }[kind]}`;
  modal(
    kind === 'unit' ? 'Unit test' : 'Practice AP exam',
    (m) => {
      const timed = el('input', { type: 'checkbox', class: 'check sq', checked: true });
      return el(
        'div',
        { class: 'stack' },
        el('b', {}, title),
        el('div', { class: 'unit-preview' }, sections.map((s) => el('div', { class: 'row small' }, el('b', { style: { flex: 1 } }, s.name), el('span', {}, `${s.items.length} question${s.items.length > 1 ? 's' : ''}`), el('span', { class: 'muted', style: { width: '80px', textAlign: 'right' } }, `${s.minutes} min`)))),
        el('label', { class: 'row' }, timed, 'Timed like the real exam (sections auto-submit when time runs out)'),
        el('p', { class: 'small muted', style: { margin: 0 } }, 'Multiple-choice is auto-graded. For free response, write your answer, then score yourself against the model answer / rubric when you finish.'),
        el(
          'div',
          { class: 'row' },
          el('span', { class: 'spacer' }),
          el('button', { class: 'btn', onclick: () => m.close() }, 'Cancel'),
          el(
            'button',
            {
              class: 'btn primary',
              onclick: () => {
                m.close();
                app.viewState.study = { session: { mode: 'exam', courseId: course.id, kind, unit, title, sections, sec: 0, started: Date.now(), secEnds: null, timed: timed.checked, phase: 'section', q: 0 } };
                app.go('study');
              },
            },
            'Begin',
          ),
        ),
      );
    },
    { center: true },
  );
}

function fmtClock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h ? `${h}:` : ''}${String(mm).padStart(h ? 2 : 1, '0')}:${String(ss).padStart(2, '0')}`;
}

export function renderExam(app, s, top) {
  const course = courseById(app, s.courseId);
  const info = infoOf(course);
  if (s.phase === 'results') return renderResults(app, s, course, info);
  if (s.phase === 'score') return renderSelfScore(app, s, course, info);

  const sec = s.sections[s.sec];
  if (s.timed && !s.secEnds) s.secEnds = Date.now() + sec.minutes * 60000;
  if (s.phase === 'break') {
    return el(
      'div',
      { class: 'study-body' },
      el(
        'div',
        { class: 'card summary' },
        el('div', { class: 'big' }, '☕'),
        el('h3', { style: { justifyContent: 'center' } }, `Section ${s.sec} done`),
        el('div', { class: 'muted' }, `Next: ${sec.name} — ${sec.items.length} question${sec.items.length > 1 ? 's' : ''}, ${sec.minutes} minutes`),
        el('button', { class: 'btn primary', style: { marginTop: '14px' }, onclick: () => ((s.phase = 'section'), (s.secEnds = s.timed ? Date.now() + sec.minutes * 60000 : null), app.render()) }, 'Start section ▶'),
      ),
    );
  }

  const clock = el('b', { class: 'match-clock exam-clock' }, s.timed ? fmtClock(s.secEnds - Date.now()) : 'untimed');
  add(top, el('span', { class: 'muted small' }, `Section ${s.sec + 1} of ${s.sections.length}: ${sec.name}`), clock);
  if (s.timed) {
    clearInterval(s.timer);
    s.timer = setInterval(() => {
      if (app.viewState.study?.session !== s || s.phase !== 'section') return clearInterval(s.timer);
      const left = s.secEnds - Date.now();
      const c = document.querySelector('.exam-clock');
      if (c) {
        c.textContent = fmtClock(left);
        c.classList.toggle('low', left < 5 * 60000);
      }
      if (left <= 0) {
        clearInterval(s.timer);
        toast('⏰ Time — section submitted');
        nextSection(app, s);
      }
    }, 500);
  }

  const q = sec.items[s.q] ? s.q : 0;
  const item = sec.items[q];
  const nav = el(
    'div',
    { class: 'q-nav' },
    sec.items.map((it, i) =>
      el('button', { class: `q-dot${i === q ? ' on' : ''}${(sec.kind === 'mcq' ? it.given !== null : it.response.trim()) ? ' done' : ''}${it.flag ? ' flag' : ''}`, onclick: () => ((s.q = i), app.render()) }, String(i + 1)),
    ),
  );

  let body;
  if (sec.kind === 'mcq') {
    body = el(
      'div',
      { class: 'card question' },
      el('div', { class: 'row small muted' }, el('span', {}, `Question ${q + 1} of ${sec.items.length}`), el('span', { class: 'spacer' }), el('button', { class: `btn sm${item.flag ? ' primary' : ''}`, onclick: () => ((item.flag = !item.flag), app.render()) }, item.flag ? '⚑ Marked for review' : '⚐ Mark for review')),
      el('div', { class: 'q-text small-q' }, item.stem),
      el('div', { class: 'choices one-col' }, item.choices.map((ch, i) => el('button', { class: `choice${item.given === i ? ' picked' : ''}`, onclick: () => ((item.given = i), app.render()) }, el('span', { class: 'key' }, 'ABCDE'[i]), ch))),
    );
    s.keys = Object.fromEntries([
      ...item.choices.map((_, i) => ['abcde'[i], () => ((item.given = i), app.render())]),
      ...item.choices.map((_, i) => [String(i + 1), () => ((item.given = i), app.render())]),
      ['ArrowRight', () => ((s.q = Math.min(sec.items.length - 1, q + 1)), app.render())],
      ['ArrowLeft', () => ((s.q = Math.max(0, q - 1)), app.render())],
    ]);
  } else {
    const ta = el('textarea', { rows: 14, class: 'frq-answer', placeholder: 'Write your response…' }, item.response);
    ta.addEventListener('input', () => {
      item.response = ta.value;
      const d = document.querySelectorAll('.q-dot')[q];
      d?.classList.toggle('done', !!ta.value.trim());
    });
    body = el('div', { class: 'card question' }, el('div', { class: 'row small muted' }, el('span', {}, `${sec.name} ${q + 1} of ${sec.items.length}`), item.unit !== null && item.unit !== undefined ? el('span', { class: 'chip' }, unitLabel(info, item.unit)) : null), el('div', { class: 'frq-prompt' }, item.prompt), ta);
    s.keys = {};
  }

  const unanswered = sec.items.filter((it) => (sec.kind === 'mcq' ? it.given === null : !it.response.trim())).length;
  return el(
    'div',
    { class: 'study-body wide exam-body' },
    sec.note && el('div', { class: 'small muted' }, sec.note),
    nav,
    body,
    el(
      'div',
      { class: 'row' },
      el('button', { class: 'btn', disabled: q === 0, onclick: () => ((s.q = q - 1), app.render()) }, '← Back'),
      el('span', { class: 'spacer' }),
      q < sec.items.length - 1 && el('button', { class: 'btn', onclick: () => ((s.q = q + 1), app.render()) }, 'Next →'),
      el(
        'button',
        {
          class: 'btn primary',
          onclick: async () => {
            if (unanswered && !(await confirmBox(`${unanswered} question${unanswered > 1 ? 's' : ''} unanswered in this section. Submit anyway?`, { ok: 'Submit section' }))) return;
            nextSection(app, s);
          },
        },
        s.sec < s.sections.length - 1 ? 'Submit section' : 'Finish exam',
      ),
    ),
  );
}

function nextSection(app, s) {
  clearInterval(s.timer);
  s.q = 0;
  if (s.sec < s.sections.length - 1) {
    s.sec++;
    s.secEnds = null;
    s.phase = 'break';
  } else {
    s.phase = s.sections.some((x) => x.kind === 'frq') ? 'score' : 'results';
    if (s.phase === 'results') finalize(app, s);
  }
  app.render();
  window.scrollTo(0, 0);
}

function renderSelfScore(app, s, course, info) {
  const frqs = s.sections.filter((x) => x.kind === 'frq').flatMap((x) => x.items.map((it) => ({ it, sec: x })));
  const all = frqs.every(({ it }) => it.pts !== null);
  s.keys = {};
  return el(
    'div',
    { class: 'study-body wide' },
    el('div', { class: 'card' }, el('h3', {}, '✍️ Score your free responses'), el('p', { class: 'small muted', style: { margin: 0 } }, 'Compare your answer with the model answer or rubric and award yourself points honestly on the real rubric scale. AP readers reward specific, accurate evidence and answering exactly what each task verb asks.')),
    frqs.map(({ it, sec }, i) =>
      el(
        'div',
        { class: 'card stack' },
        el('div', { class: 'row small muted' }, el('span', {}, `${sec.name} ${i + 1}`), it.unit !== null && it.unit !== undefined ? el('span', { class: 'chip' }, unitLabel(info, it.unit)) : null),
        el('div', { class: 'frq-prompt' }, it.prompt),
        el('div', { class: 'grid-2' }, el('div', {}, el('div', { class: 'section-h' }, 'Your answer'), el('div', { class: 'frq-box' }, it.response || '(blank)')), el('div', {}, el('div', { class: 'section-h' }, it.model ? 'Model answer / rubric' : 'Model answer'), el('div', { class: 'frq-box model' }, it.model || 'No rubric saved for this prompt — check the scoring guideline from the College Board “Past FRQs” page.'))),
        el('div', { class: 'row' }, el('span', { class: 'small muted' }, 'Points:'), Array.from({ length: it.max + 1 }, (_, p) => p).map((p) => el('button', { class: `btn sm${it.pts === p ? ' primary' : ''}`, onclick: () => ((it.pts = p), app.render()) }, String(p))), el('span', { class: 'small faint' }, `/ ${it.max}`)),
      ),
    ),
    el('div', { class: 'row' }, el('span', { class: 'spacer' }), el('button', { class: 'btn primary big-btn', disabled: !all, onclick: () => ((s.phase = 'results'), finalize(app, s), app.render(), window.scrollTo(0, 0)) }, all ? 'See my results' : 'Score every response to continue')),
  );
}

function apEstimate(pct) {
  return pct >= 72 ? 5 : pct >= 58 ? 4 : pct >= 45 ? 3 : pct >= 30 ? 2 : 1;
}

function finalize(app, s) {
  if (s.result) return;
  const course = courseById(app, s.courseId);
  const mcqItems = s.sections.filter((x) => x.kind === 'mcq').flatMap((x) => x.items);
  const right = mcqItems.filter((it) => it.given === it.answer).length;
  const frqItems = s.sections.filter((x) => x.kind === 'frq').flatMap((x) => x.items);
  const pts = frqItems.reduce((t, it) => t + (it.pts || 0), 0);
  const max = frqItems.reduce((t, it) => t + it.max, 0);
  // Composite = each section's % weighted by its official share of the exam score.
  let wsum = 0;
  let comp = 0;
  for (const sec of s.sections) {
    const frac = sec.kind === 'mcq' ? sec.items.filter((it) => it.given === it.answer).length / sec.items.length : sec.items.reduce((t, it) => t + (it.pts || 0), 0) / sec.items.reduce((t, it) => t + it.max, 0);
    comp += frac * sec.weight;
    wsum += sec.weight;
  }
  const pct = wsum ? (comp / wsum) * 100 : 0;
  const byUnit = {};
  for (const it of mcqItems) {
    const b = (byUnit[it.unit] ||= { right: 0, total: 0 });
    b.total++;
    if (it.given === it.answer) b.right++;
    // Card-based questions feed spaced repetition too.
    if (it.cardId) {
      const card = setById(app, it.setId)?.cards.find((c) => c.id === it.cardId);
      if (card) grade(card, it.given === it.answer ? 2 : 0);
    }
  }
  s.result = { right, total: mcqItems.length, pts, max, pct, byUnit, apScore: s.kind === 'unit' ? null : apEstimate(pct) };
  course.exams.push({ at: new Date().toISOString(), kind: s.kind, unit: s.unit, mcq: { right, total: mcqItems.length }, frq: { pts, max }, pct, apScore: s.result.apScore });
  if (course.exams.length > 60) course.exams = course.exams.slice(-60);
  logStudy(app.data, { cards: mcqItems.length, correct: right, minutes: Math.round((Date.now() - s.started) / 60000) });
  logActivity(app.data);
  app.save();
  setTimeout(() => confetti(window.innerWidth / 2, window.innerHeight / 3, 40), 60);
}

const missed = (s) => s.sections.filter((x) => x.kind === 'mcq').flatMap((x) => x.items).filter((it) => it.given !== it.answer);

// Missed questions become starred cards in a per-course "Mistakes" set, then straight into Learn.
function studyMistakes(app, course, s) {
  const info = infoOf(course);
  let set = app.data.sets.find((x) => x.courseId === course.id && x.mistakes);
  if (!set) {
    set = { id: uid(), title: `${info.name} · Mistakes`, classId: course.classId, courseId: course.id, mistakes: true, description: 'Questions you missed on unit tests and practice exams.', createdAt: new Date().toISOString(), lastStudied: null, cards: [], questions: [], docIds: [], keyPoints: [], topics: [], bestMatchMs: null, tests: [] };
    app.data.sets.push(set);
  }
  const have = new Set(set.cards.map((c) => c.term));
  for (const it of missed(s)) {
    if (have.has(it.stem)) continue;
    const card = newCard(it.stem, it.choices[it.answer] + (it.explain ? ` — ${it.explain}` : ''), 'qa');
    card.star = true;
    set.cards.push(card);
    have.add(it.stem);
  }
  app.viewState.study = null;
  app.commit({ render: false });
  if (set.cards.length >= 2) startStudy(app, set.id, 'learn');
  else app.go('set', { id: set.id });
}

function renderResults(app, s, course, info) {
  const r = s.result;
  s.keys = {};
  const weak = Object.entries(r.byUnit)
    .map(([u, b]) => ({ u: parseInt(u, 10), ...b, pct: (b.right / b.total) * 100 }))
    .filter((w) => !Number.isNaN(w.u)) // skills-deck questions have no unit
    .sort((a, b) => a.pct - b.pct);
  const mcq = s.sections.filter((x) => x.kind === 'mcq').flatMap((x) => x.items);
  return el(
    'div',
    { class: 'study-body wide' },
    el(
      'div',
      { class: 'card summary' },
      r.apScore ? el('div', { class: 'ap-score' }, el('span', {}, 'Estimated AP score'), el('b', { class: 'grad-text' }, String(r.apScore))) : el('div', { class: 'summary-big grad-text' }, `${Math.round(r.pct)}%`),
      el('div', { class: 'muted' }, `Multiple choice ${r.right}/${r.total}${r.max ? ` · Free response ${r.pts}/${r.max}` : ''} · composite ${Math.round(r.pct)}%`),
      r.apScore && el('div', { class: 'small faint', style: { marginTop: '6px' } }, 'Estimate only — real cut scores differ by subject and year.'),
      el(
        'div',
        { class: 'row wrap', style: { justifyContent: 'center', marginTop: '16px' } },
        missed(s).length > 0 && el('button', { class: 'btn primary', onclick: () => studyMistakes(app, course, s) }, `📌 Study my ${missed(s).length} mistake${missed(s).length > 1 ? 's' : ''}`),
        el('button', { class: `btn${missed(s).length ? '' : ' primary'}`, onclick: () => ((app.viewState.study = null), app.go('course', { id: course.id, tab: s.kind === 'unit' ? 'units' : 'exam' })) }, 'Back to course'),
      ),
    ),
    weak.length > 0 &&
      el(
        'div',
        { class: 'card' },
        el('h3', {}, '🎯 By unit'),
        weak.map((w) =>
          el(
            'div',
            { class: 'row small', style: { padding: '5px 0' } },
            el('b', { style: { width: '90px' } }, unitLabel(info, w.u)),
            el('span', { style: { flex: 1 } }, info.units[w.u].title),
            el('div', { class: 'weight-bar' }, el('div', { style: { width: `${w.pct}%`, background: w.pct >= 70 ? 'var(--good)' : w.pct >= 50 ? 'var(--warn)' : 'var(--bad)' } })),
            el('span', { style: { width: '70px', textAlign: 'right' } }, `${w.right}/${w.total}`),
            el('button', { class: 'btn sm', disabled: (unitSet(app, course, w.u)?.cards.length || 0) < 2, onclick: () => ((app.viewState.study = null), startStudy(app, course.unitSets[w.u], 'learn')) }, 'Practise'),
          ),
        ),
      ),
    el(
      'div',
      { class: 'stack' },
      el('div', { class: 'section-h' }, 'Review multiple choice'),
      mcq.map((it, i) =>
        el(
          'div',
          { class: `card test-q ${it.given === it.answer ? 'right' : 'wrong'}` },
          el('div', { class: 'row small muted' }, el('span', {}, `${i + 1}. ${unitLabel(info, it.unit)}`), el('span', { class: 'spacer' }), el('b', { style: { color: it.given === it.answer ? 'var(--good)' : 'var(--bad)' } }, it.given === it.answer ? '✓' : it.given === null ? 'blank' : '✗')),
          el('div', { class: 'q-text small-q' }, it.stem),
          el('div', { class: 'choices one-col' }, it.choices.map((ch, j) => el('div', { class: `choice${j === it.answer ? ' right' : ''}${it.given === j && j !== it.answer ? ' wrong' : ''}` }, el('span', { class: 'key' }, 'ABCDE'[j]), ch))),
          it.explain && el('div', { class: 'explain' }, el('b', {}, 'Why: '), it.explain),
        ),
      ),
    ),
  );
}

// Question list for a unit set (to fix missing answer keys) — shown on the set page.
export function questionBank(app, set) {
  if (!set.questions?.length) return null;
  return el(
    'div',
    { class: 'card', style: { marginTop: '16px' } },
    el('h3', {}, `❓ Question bank (${set.questions.length})`),
    set.questions.map((q, i) =>
      el(
        'div',
        { class: 'bank-q' },
        el('div', { class: 'small' }, el('b', {}, `${i + 1}. `), q.stem),
        el(
          'div',
          { class: 'row wrap small', style: { marginTop: '4px' } },
          q.choices.map((c, j) => el('button', { class: `btn sm${q.answer === j ? ' primary' : ''}`, title: 'Set as correct answer', onclick: () => ((q.answer = j), app.commit()) }, `${'ABCDE'[j]}) ${c.length > 40 ? `${c.slice(0, 40)}…` : c}`)),
          q.answer === null && el('span', { class: 'chip high' }, 'no answer — click the right one'),
          el('button', { class: 'btn icon ghost', title: 'Remove', onclick: () => ((set.questions = set.questions.filter((x) => x !== q)), app.commit()) }, '✕'),
        ),
      ),
    ),
  );
}

export function courseForSet(app, set) {
  return set.courseId ? courseById(app, set.courseId) : null;
}

