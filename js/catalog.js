// O'Connor course catalog: browse every course offered at Sandra Day O'Connor High School
// (from the DVUSD Academic Planning Guide), pick yours, and Orbit sets each one up with its
// curriculum units, learning-goal checklists and flashcards. AP courses hand off to the AP setup.
import { el, uid, tone } from './util.js';
import { modal, toast, confetti } from './ui.js';
import { DV_SCHOOL, DV_COURSES } from './dvcatalog.js';
import { curriculumFor } from './dvcurriculum.js';
import { courseByKey } from './apcatalog.js';
import { newCard, mastery } from './srs.js';
import { orbitBar, ring, startStudy, pageTitle, setById, openCreateSet, openTestSetup } from './study.js';
import { createCourse } from './ap.js';
import { CLASS_COLORS } from './logic.js';

export const catalogCourse = (cid) => DV_COURSES.find((c) => c.id === cid);
export const dvCourseById = (app, id) => (app.data.dvCourses || []).find((c) => c.id === id);
const DEPT_COLORS = { English: '#3aa0ff', 'English Language Development': '#3aa0ff', Mathematics: '#8b6cff', Science: '#1fc8a9', 'Social Studies': '#ffb020', 'World Languages': '#ff6b8b', 'Physical Education': '#22b07d', 'Visual Arts': '#e0569b', 'Performing Arts': '#c46cff', 'Career & Technical Education': '#f07c3a', 'JROTC (Aerospace Science)': '#5b7bd5', 'Electives & Other': '#8a84b3' };
const colorOf = (c) => DEPT_COLORS[c.dept] || '#8a84b3';
const SOURCE = {
  dvusd: ['DVUSD guide', 'Units and outcomes from DVUSD’s own curriculum guide'],
  orbit: ['Orbit outline', 'Orbit’s study outline (DVUSD doesn’t publish a public guide for this course)'],
  standards: ['Standards plan', 'Study plan built from published standards (DVUSD doesn’t publish a public guide for this course)'],
  none: ['Your PDFs', 'No public curriculum. Study from the description and the PDFs you upload'],
};

function extLink(label, url, title) {
  return el('a', { class: 'btn sm', href: url, target: '_blank', rel: 'noopener noreferrer', title }, label, ' ↗');
}

// ------------------------------------------------------------------ adding courses
export function addCatalogCourses(app, cids) {
  const added = [];
  for (const cid of cids) {
    const c = catalogCourse(cid);
    if (!c) continue;
    if (c.ap) {
      if (app.data.courses.some((x) => x.key === c.ap)) continue;
      const info = courseByKey(c.ap);
      if (info) added.push({ kind: 'ap', course: createCourse(app, info, null) });
      continue;
    }
    if ((app.data.dvCourses ||= []).some((x) => x.cid === cid)) continue;
    added.push({ kind: 'dv', course: createDvCourse(app, c) });
  }
  app.commit();
  return added;
}

function createDvCourse(app, c) {
  const code = c.title.replace(/\b(H|AP|IB|MYP)\b/g, '').replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase() || 'CLS';
  const cls = { id: uid(), name: c.title, code, color: colorOf(c) || CLASS_COLORS[app.data.classes.length % CLASS_COLORS.length], teacher: '', room: '', meetings: [] };
  app.data.classes.push(cls);
  const cur = curriculumFor(c);
  const course = { id: uid(), cid: c.id, classId: cls.id, createdAt: new Date().toISOString(), unitSets: [], covered: {}, curSig: curSig(cur) };
  const units = cur.units.length ? cur.units : [{ title: 'Class notes & handouts', topics: [], terms: [] }];
  units.forEach((unit, i) => {
    const set = unitSet(c, course, cur, unit, i);
    app.data.sets.push(set);
    course.unitSets.push(set.id);
  });
  app.data.dvCourses.push(course);
  return course;
}

const unitDesc = (cur, unit) => (cur.source === 'none' ? 'Upload your class PDFs or notes to make cards.' : `${SOURCE[cur.source][0]} · ${unit.topics.length} learning goals`);
const curSig = (cur) => cur.units.map((u) => `${u.title}|${u.topics.length}|${u.terms.length}`).join('~');
function unitSet(c, course, cur, unit, i) {
  return { id: uid(), title: `${c.title} · ${unit.title}`, classId: course.classId, dvCourseId: course.id, unit: i, description: unitDesc(cur, unit), createdAt: new Date().toISOString(), lastStudied: null, cards: unit.terms.map(([t, d]) => newCard(t, d, 'def')), questions: [], docIds: [], keyPoints: unit.topics.slice(), topics: [], bestMatchMs: null, tests: [] };
}

// When a course's curriculum gets deeper (new units, goals or terms), bring courses students already
// added up to date without losing anything: units are matched by title, missing cards and goals are
// added, checked-off goals stay checked, and units no longer in the plan are kept at the end.
export function syncDvCourses(data) {
  let changed = false;
  for (const course of data.dvCourses || []) {
    const c = catalogCourse(course.cid);
    if (!c) continue;
    const cur = curriculumFor(c);
    const sig = curSig(cur);
    if (course.curSig === sig) continue;
    course.curSig = sig;
    changed = true;
    if (!cur.units.length) continue;
    const oldSets = course.unitSets.map((id) => data.sets.find((x) => x.id === id) || null);
    const oldGoals = oldSets.map((x) => (x ? (x.keyPoints || []).slice() : []));
    const used = new Set();
    const order = cur.units.map((unit, n) => {
      const k = oldSets.findIndex((x, j) => x && !used.has(j) && x.title === `${c.title} · ${unit.title}`);
      if (k < 0) {
        const set = unitSet(c, course, cur, unit, n);
        data.sets.push(set);
        return { set, from: -1 };
      }
      used.add(k);
      const set = oldSets[k];
      const fronts = new Set(set.cards.map((x) => String(x.term || '').trim().toLowerCase()));
      for (const [t, d] of unit.terms) if (!fronts.has(t.trim().toLowerCase())) set.cards.push(newCard(t, d, 'def'));
      const goals = unit.topics.slice();
      for (const g of set.keyPoints || []) if (!goals.includes(g)) goals.push(g);
      set.keyPoints = goals;
      set.description = unitDesc(cur, unit);
      return { set, from: k };
    });
    oldSets.forEach((x, j) => x && !used.has(j) && order.push({ set: x, from: j }));
    const covered = {};
    order.forEach(({ set, from }, n) => {
      set.unit = n;
      if (from < 0) return;
      oldGoals[from].forEach((g, k) => {
        if (!course.covered?.[`${from}:${k}`]) return;
        const k2 = set.keyPoints.indexOf(g);
        if (k2 >= 0) covered[`${n}:${k2}`] = true;
      });
    });
    course.covered = covered;
    course.unitSets = order.map((x) => x.set.id);
  }
  return changed;
}

// ------------------------------------------------------------------ catalog page
export function renderCatalog(app) {
  const st = (app.viewState.catalog ||= { q: '', dept: '', grade: '', picked: [] });
  const haveDv = new Set((app.data.dvCourses || []).map((c) => c.cid));
  const haveAp = new Set(app.data.courses.map((c) => c.key));
  const has = (c) => (c.ap ? haveAp.has(c.ap) : haveDv.has(c.id));
  const depts = [...new Set(DV_COURSES.map((c) => c.dept))];
  const q = st.q.trim().toLowerCase();
  const inGrade = (c) => {
    if (!st.grade) return true;
    const m = (c.grade || '').match(/(\d+)(?:-(\d+))?/);
    if (!m) return true;
    const lo = +m[1];
    const hi = +(m[2] || m[1]);
    return +st.grade >= lo && +st.grade <= hi;
  };
  const list = DV_COURSES.filter((c) => (!st.dept || c.dept === st.dept) && inGrade(c) && (!q || c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || (c.program || '').toLowerCase().includes(q)));
  const search = el('input', { type: 'search', placeholder: 'Search 274 courses (e.g. biology, spanish, film)…', value: st.q, 'aria-label': 'Search the course catalog' });
  search.addEventListener('input', () => {
    st.q = search.value;
    clearTimeout(st.t);
    st.t = setTimeout(() => {
      const pos = search.selectionStart;
      app.render();
      const s = document.querySelector('.catalog-bar input[type=search]');
      s?.focus();
      s?.setSelectionRange(pos, pos);
    }, 200);
  });
  const grade = el('select', { 'aria-label': 'Grade' }, [['', 'All grades'], ['9', 'Grade 9'], ['10', 'Grade 10'], ['11', 'Grade 11'], ['12', 'Grade 12']].map(([v, l]) => el('option', { value: v, selected: st.grade === v }, l)));
  grade.addEventListener('change', () => ((st.grade = grade.value), app.render()));
  const toggle = (c) => {
    st.picked = st.picked.includes(c.id) ? st.picked.filter((x) => x !== c.id) : [...st.picked, c.id];
    app.render();
  };
  const row = (c) => {
    const cur = c.ap ? null : curriculumFor(c);
    const open = st.open === c.id;
    const added = has(c);
    const cb = el('input', { type: 'checkbox', class: 'check sq', checked: added || st.picked.includes(c.id), disabled: added, 'aria-label': `Select ${c.title}` });
    cb.addEventListener('change', () => toggle(c));
    return el(
      'div',
      { class: `cat-row${open ? ' open' : ''}${added ? ' added' : ''}` },
      el(
        'div',
        { class: 'cat-main' },
        cb,
        el(
          'button',
          { class: 'cat-title', 'aria-expanded': String(open), onclick: () => ((st.open = open ? null : c.id), app.render()) },
          el('span', { class: 'dot', style: { background: colorOf(c) } }),
          el('span', { class: 'cat-name' }, c.title),
          el('span', { class: 'cat-meta' }, [c.grade && `Gr ${c.grade}`, c.length, c.credit && `${c.credit} cr`].filter(Boolean).join(' · ')),
        ),
        el(
          'span',
          { class: 'cat-badges' },
          c.ap && el('span', { class: 'chip ap-chip', title: 'Sets up the full AP course with practice AP exams' }, 'AP exam prep'),
          cur && el('span', { class: `chip src-${cur.source}`, title: SOURCE[cur.source][1] }, SOURCE[cur.source][0]),
          c.check && el('span', { class: 'chip', title: 'The planning guide doesn’t list O’Connor for this CTE course. Check with your counselor.' }, 'check availability'),
          added && el('span', { class: 'chip added-chip' }, '✓ added'),
        ),
      ),
      open &&
        el(
          'div',
          { class: 'cat-detail' },
          el('p', {}, c.desc || (c.see ? `See ${c.see}.` : '')),
          el('div', { class: 'small muted' }, [c.program && `CTE program: ${c.program}`, c.prereq && `Prerequisite: ${c.prereq}`].filter(Boolean).join(' · ')),
          c.ap
            ? el('div', { class: 'small' }, `Adds the full ${courseByKey(c.ap)?.name || 'AP'} course: official units, CED import, unit tests and Bluebook-style practice exams.`)
            : cur.units.length
              ? el('div', { class: 'cat-units' }, el('div', { class: 'section-h' }, `${cur.units.length} units · ${SOURCE[cur.source][1]}`), cur.sources && el('div', { class: 'small muted' }, `Built from: ${cur.sources.map((x) => x.name).join(' · ')}`), el('ol', {}, cur.units.map((x) => el('li', {}, x.title, el('span', { class: 'faint' }, ` · ${x.topics.length ? `${x.topics.length} goal${x.topics.length === 1 ? '' : 's'}` : ''}${x.topics.length && x.terms.length ? ', ' : ''}${x.terms.length ? `${x.terms.length} cards` : ''}`)))))
              : el('div', { class: 'small muted' }, 'No public curriculum for this course. Add it, then upload your class PDFs to make cards.'),
        ),
    );
  };
  const groups = st.dept ? [st.dept] : depts;
  const pickedN = st.picked.filter((id) => !has(catalogCourse(id))).length;
  return el(
    'div',
    { class: 'catalog' },
    el('button', { class: 'btn sm ghost', style: { marginLeft: '-10px' }, onclick: () => app.go('courses') }, '← AP & Courses'),
    pageTitle(`🏫 ${DV_SCHOOL.short} course catalog`, el('span', { class: 'small muted' }, `${DV_SCHOOL.year} · ${DV_COURSES.length} courses`)),
    el('p', { class: 'small muted', style: { marginTop: '-6px' } }, `Every course offered at ${DV_SCHOOL.name} (${DV_SCHOOL.district}), from the district’s ${DV_SCHOOL.year} Academic Planning Guide. Check the courses you take and Orbit builds each one: units, learning goals and flashcards from the curriculum, plus anything you upload. AP courses keep their full AP setup.`),
    el('div', { class: 'row wrap', style: { marginBottom: '10px' } }, extLink('Academic Planning Guide (PDF)', DV_SCHOOL.guide, 'DVUSD 2026-27 Academic Planning Guide'), extLink('O’Connor counseling page', DV_SCHOOL.site)),
    el('div', { class: 'catalog-bar' }, search, grade),
    el('div', { class: 'craving-row dept-row' }, el('button', { class: `chip-btn${!st.dept ? ' on' : ''}`, onclick: () => ((st.dept = ''), app.render()) }, 'All departments'), depts.map((d) => el('button', { class: `chip-btn${st.dept === d ? ' on' : ''}`, onclick: () => ((st.dept = st.dept === d ? '' : d), app.render()) }, d))),
    list.length
      ? groups.map((d) => {
          const rows = list.filter((c) => c.dept === d);
          return rows.length ? el('div', { class: 'card cat-group' }, el('h3', {}, el('span', { class: 'dot', style: { background: DEPT_COLORS[d] || '#8a84b3' } }), ` ${d}`, el('span', { class: 'spacer' }), el('span', { class: 'faint small' }, `${rows.length}`)), rows.map(row)) : null;
        })
      : el('div', { class: 'card muted' }, 'No courses match. Try a different search.'),
    pickedN > 0 &&
      el(
        'div',
        { class: 'cat-cart' },
        el('span', {}, `${pickedN} course${pickedN > 1 ? 's' : ''} selected`),
        el('button', { class: 'btn ghost sm', onclick: () => ((st.picked = []), app.render()) }, 'Clear'),
        el(
          'button',
          {
            class: 'btn primary',
            onclick: () => {
              const added = addCatalogCourses(app, st.picked);
              st.picked = [];
              confetti(window.innerWidth / 2, window.innerHeight / 2, 40);
              toast(`🎒 Added ${added.length} course${added.length === 1 ? '' : 's'} to your classes`);
              app.go('courses');
            },
          },
          `Add ${pickedN} to my courses`,
        ),
      ),
  );
}

// ------------------------------------------------------------------ "My courses" tiles on the hub
export function catalogTiles(app) {
  return (app.data.dvCourses || []).map((course) => {
    const c = catalogCourse(course.cid);
    if (!c) return null;
    const sets = course.unitSets.map((id) => setById(app, id)).filter(Boolean);
    const cards = sets.reduce((n, s) => n + s.cards.length, 0);
    const goals = sets.reduce((n, s) => n + (s.keyPoints?.length || 0), 0);
    const done = Object.keys(course.covered || {}).length;
    const pct = readiness(app, course);
    return el(
      'div',
      { class: 'set-tile', onclick: () => app.go('dvcourse', { id: course.id, tab: 'units' }) },
      el('div', { class: 'band', style: { background: colorOf(c) } }),
      el('div', { class: 'row' }, el('div', { style: { flex: 1, minWidth: 0 } }, el('div', { class: 'small', style: { color: tone(colorOf(c)), fontWeight: 800, letterSpacing: '0.08em' } }, c.dept.toUpperCase()), el('div', { class: 'set-title' }, c.title)), ring(pct, colorOf(c), 54)),
      el('div', { class: 'small muted' }, `${sets.length} unit${sets.length === 1 ? '' : 's'} · ${cards} cards${goals ? ` · ${done}/${goals} goals covered` : ''}`),
    );
  });
}

function readiness(app, course) {
  const sets = course.unitSets.map((id) => setById(app, id)).filter((s) => s && s.cards.length);
  if (!sets.length) return 0;
  return Math.round(sets.reduce((n, s) => n + mastery(s).pct, 0) / sets.length);
}

// ------------------------------------------------------------------ course page
export function renderDvCourse(app) {
  const st = (app.viewState.dvcourse ||= {});
  const course = dvCourseById(app, st.id);
  const c = course && catalogCourse(course.cid);
  if (!c) {
    app.view = 'courses';
    return el('div', {}, 'Course not found.');
  }
  const cur = curriculumFor(c);
  const sets = course.unitSets.map((id) => setById(app, id));
  const live = sets.filter(Boolean);
  const allCards = live.reduce((n, s) => n + s.cards.length, 0);
  const covered = (course.covered ||= {});
  const open = ((st.openBy ||= {})[course.id] ||= {}); // expanded units, per course
  const header = el(
    'div',
    { class: 'set-header' },
    el(
      'div',
      { style: { flex: 1, minWidth: 0 } },
      el('button', { class: 'btn sm ghost', style: { marginLeft: '-10px' }, onclick: () => app.go('courses') }, '← AP & Courses'),
      el('div', { class: 'small', style: { color: tone(colorOf(c)), fontWeight: 800, letterSpacing: '0.08em', marginTop: '6px' } }, `${c.dept.toUpperCase()} · ${DV_SCHOOL.short.toUpperCase()}`),
      el('h2', { style: { fontSize: '1.9em', letterSpacing: '-0.02em', margin: '2px 0 6px' } }, c.title),
      el('div', { class: 'small muted' }, [c.grade && `Grade ${c.grade}`, c.length, c.credit && `${c.credit} credit`, c.prereq && `Prerequisite: ${c.prereq}`].filter(Boolean).join(' · ')),
    ),
    el('div', { style: { textAlign: 'center' } }, ring(readiness(app, course), colorOf(c), 92), el('div', { class: 'small muted' }, 'mastery')),
  );
  const NOTE = {
    dvusd: ['📗 From DVUSD’s curriculum guide', `Units and learning goals come from “${cur.sourceName}”.`],
    orbit: ['🧭 Orbit study outline', `DVUSD doesn’t publish this course’s curriculum publicly${/Science|Social Studies/.test(c.dept) ? ' (its high school guides for this department are staff-only)' : ''}, so Orbit built an outline from the course description${cur.standards && /Arizona/.test(cur.standards) ? ` and the ${cur.standards}` : ''}. Your teacher’s order may differ. Upload class handouts to make it match.`],
    standards: ['📐 Built from published standards', `DVUSD doesn’t publish this course’s curriculum publicly${/Science|Social Studies/.test(c.dept) ? ' (its high school guides for this department are staff-only)' : ''}, so Orbit built the study plan from the standards below. Goals tagged “AZ …” come from the Arizona standard with that code; AP and national frameworks are paraphrased. Key terms are Orbit’s own. Your teacher’s order may differ, so upload class handouts to make it match.`],
    none: ['📄 Study from your own material', 'DVUSD has no public curriculum for this course. Upload class PDFs, notes or study guides and Orbit makes the cards.'],
  }[cur.source];
  const srcNote = el(
    'div',
    { class: `card src-note src-${cur.source}` },
    el('b', {}, NOTE[0]),
    el('div', { class: 'small muted' }, NOTE[1]),
    el(
      'div',
      { class: 'row wrap', style: { marginTop: '6px' } },
      cur.source === 'standards' ? cur.sources.map((x) => extLink(x.name, x.url, 'Opens the standards in a new tab')) : cur.sourceUrl && extLink('Open the DVUSD guide', cur.sourceUrl),
      extLink('Course description (planning guide)', DV_SCHOOL.guide),
    ),
  );
  const actions = el(
    'div',
    { class: 'mode-grid' },
    el('button', { class: 'mode-tile', disabled: !allCards, onclick: () => startStudy(app, null, 'review', { setIds: course.unitSets, title: c.title }) }, el('div', { class: 'mode-icon' }, '🧠'), el('div', { style: { fontWeight: 800 } }, 'Review the course'), el('div', { class: 'small muted' }, `${allCards} cards across all units`)),
    el('button', { class: 'mode-tile', onclick: () => openCreateSet(app, { addToSet: live[0], classId: course.classId }) }, el('div', { class: 'mode-icon' }, '📄'), el('div', { style: { fontWeight: 800 } }, 'Upload a PDF'), el('div', { class: 'small muted' }, 'Notes, study guides, worksheets → cards')),
    el('button', { class: 'mode-tile', onclick: () => app.go('planner') }, el('div', { class: 'mode-icon' }, '🗓'), el('div', { style: { fontWeight: 800 } }, 'Add tests & homework'), el('div', { class: 'small muted' }, 'Exams here boost this course’s cards')),
  );
  const units = el(
    'div',
    { class: 'stack', style: { gap: '10px' } },
    sets.map((set, i) => {
      if (!set) return null;
      const m = mastery(set);
      const goals = set.keyPoints || [];
      const done = goals.filter((_, k) => covered[`${i}:${k}`]).length;
      const rowEl = el(
        'div',
        { class: 'unit-row' },
        el('div', { class: 'unit-num', style: { borderColor: colorOf(c), color: tone(colorOf(c)) } }, String(i + 1)),
        el('div', { style: { flex: 1, minWidth: 0 } }, el('b', {}, set.title.replace(`${c.title} · `, '')), el('div', { class: 'small muted', style: { margin: '2px 0 6px' } }, set.cards.length ? `${m.n} cards · ${m.pct}% mastered${goals.length ? ` · ${done}/${goals.length} goals covered` : ''}` : goals.length ? `${goals.length} learning goals · add a PDF to make cards` : 'No cards yet. Upload a PDF or add cards.'), set.cards.length > 0 && orbitBar(set)),
        el(
          'div',
          { class: 'row', style: { gap: '6px' } },
          el('button', { class: 'btn sm', onclick: () => openCreateSet(app, { addToSet: set, classId: course.classId }) }, '+ PDF'),
          el('button', { class: 'btn sm', onclick: () => app.go('set', { id: set.id }) }, 'Study'),
          el('button', { class: 'btn sm primary', disabled: set.cards.length < 2, onclick: () => openTestSetup(app, set) }, 'Quiz'),
        ),
      );
      if (!goals.length) return rowEl;
      return el(
        'div',
        { class: 'unit-wrap' },
        rowEl,
        el(
          'div',
          { class: 'topic-panel' },
          el('button', { class: 'topic-toggle', 'aria-expanded': String(!!open[i]), onclick: () => ((open[i] = !open[i]), app.render()) }, `${open[i] ? "▾" : "▸"} ${goals.length} learning goal${goals.length === 1 ? "" : "s"}`, done ? el('span', { class: 'muted' }, ` · ${done}/${goals.length} covered`) : null),
          open[i] &&
            el(
              'div',
              { class: 'topic-list' },
              goals.map((g, k) => {
                const key = `${i}:${k}`;
                const cb = el('input', { type: 'checkbox', class: 'check sq', checked: !!covered[key], 'aria-label': `Covered: ${g}` });
                cb.addEventListener('change', () => {
                  if (cb.checked) covered[key] = true;
                  else delete covered[key];
                  app.commit();
                });
                return el('label', { class: `topic${covered[key] ? ' done' : ''}` }, cb, el('span', {}, g));
              }),
            ),
        ),
      );
    }),
  );
  return el(
    'div',
    {},
    header,
    el('p', { class: 'muted', style: { maxWidth: '820px' } }, c.desc || (c.see ? `See ${c.see}.` : '')),
    srcNote,
    actions,
    units,
    el(
      'div',
      { class: 'row', style: { marginTop: '18px' } },
      el('span', { class: 'spacer' }),
      el(
        'button',
        {
          class: 'btn sm ghost danger',
          onclick: () =>
            modal('Remove course?', (m) =>
              el(
                'div',
                { class: 'stack' },
                el('p', {}, `Remove ${c.title} from your courses? Its class stays in your Planner. Its study sets are kept in your Library.`),
                el('div', { class: 'row' }, el('span', { class: 'spacer' }), el('button', { class: 'btn', onclick: () => m.close() }, 'Cancel'), el('button', { class: 'btn danger', onclick: () => ((app.data.dvCourses = app.data.dvCourses.filter((x) => x !== course)), m.close(), app.commit(), app.go('courses')) }, 'Remove')),
              ),
            ),
        },
        'Remove course',
      ),
    ),
  );
}
