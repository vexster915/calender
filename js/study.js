// Orbit Study — study sets, card generation from PDFs/notes, and the study modes:
//   Flashcards · Learn ("Orbit" adaptive mode) · Test · Match · Daily Review (spaced repetition)
import { el, add, uid, fmtDate, relDay, relDue, fmtMinutes, dayKey, addDays, startOfDay, WEEKDAYS, clamp, fmtTime, sameDay } from './util.js';
import { modal, confirmBox, toast, confetti, svg } from './ui.js';
import { generateCards, parseImport, checkAnswer } from './gen.js';
import { ORBITS, newCard, grade, previewInterval, isNew, mastery, examsSoon, setsForItem, reviewQueue, dueCount, logStudy, studiedToday, shuffle } from './srs.js';
import { streak, logActivity, meetingsOn, TYPE_META } from './logic.js';
import { renderExam, questionBank, courseForSet } from './ap.js';

const enc = new TextEncoder();
const dec = new TextDecoder();

// ------------------------------------------------------------------ shared bits
export const setById = (app, id) => app.data.sets.find((s) => s.id === id);
const NO_CLASS = { name: 'General', code: 'GEN', color: '#8a84b3' };
const classOf = (app, set) => app.classById(set.classId) || NO_CLASS;

export function orbitBar(set, { tall = false } = {}) {
  const m = mastery(set);
  return el(
    'div',
    { class: `orbit-bar${tall ? ' tall' : ''}`, title: ORBITS.map((o, i) => `${o.name}: ${m.counts[i]}`).join(' · ') },
    m.n ? m.counts.map((c, i) => (c ? el('div', { style: { flex: String(c), background: ORBITS[i].color } }) : null)) : el('div', { style: { flex: '1', background: 'var(--line)' } }),
  );
}

export function ring(pct, color = 'url(#rg)', size = 64, label = `${pct}%`) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return svg(
    'svg',
    { viewBox: '0 0 64 64', width: size, height: size, class: 'ring' },
    svg('defs', {}, svg('linearGradient', { id: 'rg', x1: 0, y1: 0, x2: 1, y2: 1 }, svg('stop', { offset: 0, 'stop-color': '#8b6cff' }), svg('stop', { offset: 1, 'stop-color': '#ff6b8b' }))),
    svg('circle', { cx: 32, cy: 32, r, fill: 'none', stroke: 'rgba(128,128,160,0.2)', 'stroke-width': 6 }),
    svg('circle', { cx: 32, cy: 32, r, fill: 'none', stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': `${(clamp(pct, 0, 100) / 100) * c} ${c}`, transform: 'rotate(-90 32 32)' }),
    svg('text', { x: 32, y: 37, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: 'currentColor' }, label),
  );
}

export function pageTitle(title, ...extra) {
  return el('div', { class: 'page-title' }, el('h2', {}, title), el('span', { class: 'spacer' }), ...extra);
}

function prompt(card, dir) {
  // dir 'term' = show the term, answer with the definition. Fill-in-the-blank cards always show the sentence.
  if (card.kind === 'cloze') return { q: card.term, a: card.def, qLabel: 'Fill in the blank', aLabel: 'Missing word' };
  if (card.kind === 'qa') return { q: card.term, a: card.def, qLabel: 'Question', aLabel: 'Answer' };
  return dir === 'term' ? { q: card.term, a: card.def, qLabel: 'Term', aLabel: 'Definition' } : { q: card.def, a: card.term, qLabel: 'Definition', aLabel: 'Term' };
}

export function startStudy(app, setId, mode, extra = {}) {
  app.viewState.study = { session: createSession(app, setId, mode, extra) };
  app.go('study');
}

function finishSession(app, s, { cards = 0, correct = 0, fresh = 0 } = {}) {
  const minutes = Math.round((Date.now() - s.started) / 60000);
  logStudy(app.data, { cards, correct, fresh, minutes });
  logActivity(app.data);
  const set = s.setId && setById(app, s.setId);
  if (set) set.lastStudied = new Date().toISOString();
  app.save();
}

// ------------------------------------------------------------------ Home (study-first dashboard)
export function renderHome(app) {
  const { data } = app;
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 5 ? 'Up late' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const due = dueCount(data);
  const queue = reviewQueue(data);
  const today = studiedToday(data);
  const goal = data.settings.dailyGoal || 30;
  const allCards = data.sets.reduce((n, s) => n + s.cards.length, 0);
  const mastered = data.sets.reduce((n, s) => n + s.cards.filter((c) => c.lvl >= 4).length, 0);

  const hero = el(
    'div',
    { class: 'hero' },
    el('div', {}, el('div', { class: 'muted' }, fmtDate(now, { year: true })), el('h2', {}, `${greet}, `, el('span', { class: 'grad-text' }, app.session.username))),
    el(
      'div',
      { class: 'stats' },
      el('div', { class: 'stat' }, el('b', {}, streak(data) ? '🔥 ' : '', String(streak(data))), el('span', {}, 'day streak')),
      el('div', { class: 'stat' }, el('b', {}, `${today}/${goal}`), el('span', {}, 'cards today')),
      el('div', { class: 'stat' }, el('b', {}, `${mastered}`), el('span', {}, `of ${allCards} mastered`)),
    ),
  );

  // Daily review CTA
  const reviewCard = el(
    'div',
    { class: 'card review-cta' },
    el(
      'div',
      { class: 'row', style: { gap: '18px' } },
      ring(clamp(Math.round((today / goal) * 100), 0, 100), 'url(#rg)', 86, today >= goal ? '✓' : `${today}`),
      el(
        'div',
        { style: { flex: 1 } },
        el('h3', { style: { marginBottom: '6px' } }, '🧠 Daily review'),
        queue.length
          ? el('div', {}, el('b', { style: { fontSize: '1.4em' } }, `${queue.length} cards`), el('span', { class: 'muted' }, ` ready · ${due} due, ${queue.filter((q) => q.why === 'exam').length} exam-boosted, ${queue.filter((q) => q.why === 'new').length} new`))
          : el('div', { class: 'muted' }, data.sets.length ? "You're all caught up. Orbit will bring cards back right before you'd forget them." : 'Create a study set and Orbit will schedule your reviews.'),
      ),
      queue.length ? el('button', { class: 'btn primary', onclick: () => startStudy(app, null, 'review') }, 'Start review ▶') : null,
    ),
  );

  // Upcoming tests — the planner working in the background
  const exams = examsSoon(data, 21);
  const examCard = el(
    'div',
    { class: 'card' },
    el('h3', {}, '🎯 Coming up', el('span', { class: 'spacer' }), el('button', { class: 'btn sm ghost', style: { textTransform: 'none', letterSpacing: 0 }, onclick: () => app.go('launch') }, 'Planner →')),
    exams.length
      ? exams.slice(0, 5).map((item) => {
          const cls = app.classById(item.classId) || NO_CLASS;
          const sets = setsForItem(data, item);
          const cards = sets.flatMap((s) => s.cards);
          const pct = cards.length ? Math.round((cards.reduce((t, c) => t + Math.min(4, c.lvl || 0), 0) / (4 * cards.length)) * 100) : 0;
          const days = Math.max(0, Math.ceil((new Date(item.due) - now) / 86400000));
          return el(
            'div',
            { class: 'exam-row' },
            el('div', { class: 'exam-days', style: { borderColor: cls.color } }, el('b', {}, String(days)), el('span', {}, days === 1 ? 'day' : 'days')),
            el(
              'div',
              { style: { flex: 1, minWidth: 0 } },
              el('div', { style: { fontWeight: 700 } }, item.title),
              el('div', { class: 'small muted' }, `${cls.name} · ${TYPE_META[item.type].label} · ${relDay(new Date(item.due))}`),
              sets.length ? el('div', { class: 'row small', style: { marginTop: '6px' } }, el('div', { class: 'orbit-bar', style: { flex: 1 } }, el('div', { style: { flex: String(pct), background: 'var(--grad)' } }), el('div', { style: { flex: String(100 - pct), background: 'var(--line)' } })), `${pct}% ready`) : null,
            ),
            sets.length
              ? el('button', { class: 'btn sm primary', onclick: () => startStudy(app, null, 'review', { setIds: sets.map((s) => s.id), title: `Prep: ${item.title}` }) }, 'Study')
              : el('button', { class: 'btn sm', onclick: () => openCreateSet(app, { classId: item.classId }) }, '+ Make a set'),
          );
        })
      : el('div', { class: 'muted small' }, 'No tests in the next 3 weeks. Add exams in the Planner and Orbit will prioritise those cards.'),
  );

  // Recent sets
  const recent = [...data.sets].sort((a, b) => (b.lastStudied || b.createdAt).localeCompare(a.lastStudied || a.createdAt)).slice(0, 6);
  const setsCard = el(
    'div',
    { class: 'card wide' },
    el('h3', {}, '📚 Jump back in', el('span', { class: 'spacer' }), el('button', { class: 'btn sm ghost', style: { textTransform: 'none', letterSpacing: 0 }, onclick: () => app.go('library') }, 'All sets →')),
    recent.length ? el('div', { class: 'set-grid' }, recent.map((s) => setTile(app, s))) : el('div', { class: 'muted small' }, 'No study sets yet.'),
  );

  // Today (compact, from the planner)
  const meets = meetingsOn(data, now);
  const dueToday = data.items.filter((i) => !i.done && i.due && sameDay(new Date(i.due), now));
  const todayCard = el(
    'div',
    { class: 'card' },
    el('h3', {}, '☀️ Today'),
    meets.length || dueToday.length
      ? el(
          'div',
          { class: 'stack', style: { gap: '6px' } },
          meets.map(({ cls, meeting }) => el('div', { class: 'row small' }, el('span', { class: 'dot', style: { background: cls.color } }), el('b', {}, cls.name), el('span', { class: 'muted' }, `${meeting.start}–${meeting.end}`))),
          dueToday.map((i) => el('div', { class: 'row small' }, el('span', {}, TYPE_META[i.type].icon), el('b', {}, i.title), el('span', { class: 'muted' }, `due ${fmtTime(new Date(i.due))}`))),
        )
      : el('div', { class: 'muted small' }, 'Nothing scheduled today.'),
  );

  // Drop a PDF to create a set
  const input = el('input', { type: 'file', accept: '.pdf,application/pdf,.txt,text/plain', multiple: true, class: 'hidden' });
  input.addEventListener('change', () => input.files.length && openCreateSet(app, { files: [...input.files] }));
  const drop = el(
    'div',
    { class: 'card create-drop' },
    el('div', { class: 'big' }, '📄'),
    el('div', { style: { fontWeight: 700 } }, 'Drop class notes or a PDF here'),
    el('div', { class: 'small muted' }, 'Orbit turns it into flashcards, a quiz and key points — right in your browser.'),
    el('div', { class: 'row', style: { justifyContent: 'center', marginTop: '10px' } }, el('button', { class: 'btn primary', onclick: () => input.click() }, 'Upload PDF'), el('button', { class: 'btn', onclick: () => openCreateSet(app, { tab: 'paste' }) }, 'Paste notes')),
    input,
  );
  wireFileDrop(drop, (files) => openCreateSet(app, { files }));

  if (!data.sets.length && !data.classes.length && !data.items.length) {
    return el('div', {}, hero, welcome(app, drop));
  }
  return el('div', {}, hero, el('div', { class: 'dash' }, el('div', { class: 'stack' }, reviewCard, examCard), el('div', { class: 'stack' }, drop, todayCard), setsCard));
}

function welcome(app, drop) {
  return el(
    'div',
    { class: 'dash' },
    el(
      'div',
      { class: 'card', style: { padding: '28px' } },
      el('h2', { style: { marginBottom: '8px' } }, 'Welcome to Orbit 🪐'),
      el('p', { class: 'muted' }, 'Upload your classwork and Orbit builds study sets from it: flashcards, an adaptive Learn mode, practice tests and a match game. Every card moves through orbits — New → Launching → Outer → Inner → Mastered — and comes back for review right before you would forget it.'),
      el('p', { class: 'muted' }, 'Add your tests to the Planner and Orbit prioritises those cards in the days before.'),
      el(
        'div',
        { class: 'row wrap', style: { marginTop: '14px' } },
        el('button', { class: 'btn primary', onclick: () => openCreateSet(app) }, '+ Create a study set'),
        el(
          'button',
          {
            class: 'btn',
            onclick: async () => {
              const { sampleData } = await import('./logic.js');
              sampleData(app.data);
              app.commit();
              toast('Sample semester loaded — explore, then delete anything you like.');
            },
          },
          '✨ Try a sample semester',
        ),
      ),
    ),
    drop,
  );
}

function setTile(app, set) {
  const cls = classOf(app, set);
  const m = mastery(set);
  const dueN = set.cards.filter((c) => c.due && new Date(c.due) <= new Date()).length;
  return el(
    'div',
    { class: 'set-tile', onclick: () => app.go('set', { id: set.id }) },
    el('div', { class: 'band', style: { background: cls.color } }),
    el('div', { class: 'small', style: { color: cls.color, fontWeight: 800, letterSpacing: '0.08em' } }, (cls.code || cls.name).toUpperCase()),
    el('div', { class: 'set-title' }, set.title),
    el('div', { class: 'small muted' }, `${m.n} cards · ${m.pct}% mastered${dueN ? ` · ${dueN} due` : ''}`),
    orbitBar(set),
  );
}

export function wireFileDrop(target, onFiles) {
  target.addEventListener('dragover', (e) => {
    if (![...(e.dataTransfer?.types || [])].includes('Files')) return;
    e.preventDefault();
    target.classList.add('drag');
  });
  target.addEventListener('dragleave', (e) => !target.contains(e.relatedTarget) && target.classList.remove('drag'));
  target.addEventListener('drop', (e) => {
    e.preventDefault();
    target.classList.remove('drag');
    if (e.dataTransfer?.files?.length) onFiles([...e.dataTransfer.files]);
  });
}

// ------------------------------------------------------------------ Library
export function renderLibrary(app) {
  const st = (app.viewState.library ||= { classId: 'all', q: '' });
  let sets = [...app.data.sets];
  if (st.classId !== 'all') sets = sets.filter((s) => (s.classId || 'none') === st.classId);
  if (st.q) {
    const q = st.q.toLowerCase();
    sets = sets.filter((s) => s.title.toLowerCase().includes(q) || s.cards.some((c) => `${c.term} ${c.def}`.toLowerCase().includes(q)));
  }
  sets.sort((a, b) => (b.lastStudied || b.createdAt).localeCompare(a.lastStudied || a.createdAt));

  const search = el('input', { type: 'search', placeholder: 'Search sets and cards…', value: st.q });
  search.addEventListener('input', () => {
    st.q = search.value;
    const pos = search.selectionStart;
    app.render();
    const s = document.querySelector('.filters input[type=search]');
    s?.focus();
    s?.setSelectionRange(pos, pos);
  });
  const cls = el('select', {}, el('option', { value: 'all' }, 'All classes'), app.data.classes.map((c) => el('option', { value: c.id }, c.name)), el('option', { value: 'none' }, 'General'));
  cls.value = st.classId;
  cls.addEventListener('change', () => app.go('library', { classId: cls.value }));

  const total = app.data.sets.reduce((n, s) => n + s.cards.length, 0);
  return el(
    'div',
    {},
    pageTitle('Library', el('span', { class: 'muted' }, `${app.data.sets.length} sets · ${total} cards`), el('button', { class: 'btn primary', onclick: () => openCreateSet(app) }, '+ New study set')),
    el('div', { class: 'filters' }, cls, search),
    sets.length
      ? el('div', { class: 'set-grid big' }, sets.map((s) => setTile(app, s)))
      : el('div', { class: 'card empty' }, el('div', { class: 'big' }, '📚'), app.data.sets.length ? 'No sets match.' : 'No study sets yet — upload a PDF or paste notes to make one.', el('div', { style: { marginTop: '12px' } }, el('button', { class: 'btn primary', onclick: () => openCreateSet(app) }, '+ New study set'))),
  );
}

// ------------------------------------------------------------------ Set page
export function renderSet(app) {
  const st = (app.viewState.set ||= {});
  const set = setById(app, st.id);
  if (!set) {
    app.view = 'library';
    return renderLibrary(app);
  }
  st.tab ||= 'cards';
  const cls = classOf(app, set);
  const m = mastery(set);
  const dueN = set.cards.filter((c) => c.due && new Date(c.due) <= new Date()).length;
  const need = (n, fn) => () => (set.cards.length >= n ? fn() : toast(`Add at least ${n} cards for this mode.`));

  const modeTile = (icon, name, desc, onclick, extra) => el('button', { class: 'mode-tile', onclick }, el('div', { class: 'mode-icon' }, icon), el('div', { style: { fontWeight: 800 } }, name), el('div', { class: 'small muted' }, desc), extra);

  const header = el(
    'div',
    { class: 'set-header' },
    el(
      'div',
      { style: { flex: 1, minWidth: 0 } },
      el('button', { class: 'btn sm ghost', style: { marginLeft: '-10px' }, onclick: () => app.go('library') }, '← Library'),
      el('div', { class: 'small', style: { color: cls.color, fontWeight: 800, letterSpacing: '0.08em', marginTop: '6px' } }, cls.name.toUpperCase()),
      el('h2', { style: { fontSize: '1.9em', letterSpacing: '-0.02em', margin: '2px 0 6px' } }, set.title),
      set.description && el('p', { class: 'muted', style: { margin: '0 0 6px' } }, set.description),
      el('div', { class: 'small muted' }, `${m.n} cards · created ${fmtDate(set.createdAt)}${set.lastStudied ? ` · studied ${relDay(new Date(set.lastStudied)).toLowerCase()}` : ''}`),
    ),
    el('div', { style: { textAlign: 'center' } }, ring(m.pct, 'url(#rg)', 92), el('div', { class: 'small muted' }, 'mastery')),
    el('div', { class: 'stack', style: { gap: '6px' } }, el('button', { class: 'btn sm', onclick: () => openEditSet(app, set) }, '✎ Edit'), el('button', { class: 'btn sm', onclick: () => openCreateSet(app, { addToSet: set }) }, '+ Add material')),
  );

  const modes = el(
    'div',
    { class: 'mode-grid' },
    modeTile('🃏', 'Flashcards', 'Flip & sort into know / still learning', need(1, () => startStudy(app, set.id, 'cards'))),
    modeTile('🪐', 'Learn', 'Adaptive rounds: choices → typing → mastered', need(2, () => startStudy(app, set.id, 'learn'))),
    modeTile('📝', 'Test', 'Practice test with a score', need(2, () => openTestSetup(app, set))),
    modeTile('⚡', 'Match', set.bestMatchMs ? `Best: ${(set.bestMatchMs / 1000).toFixed(1)}s` : 'Race the clock pairing terms', need(3, () => startStudy(app, set.id, 'match'))),
    modeTile('🧠', 'Review', dueN ? `${dueN} due now` : 'Spaced repetition', need(1, () => startStudy(app, set.id, 'review', { setIds: [set.id], title: set.title }))),
  );

  const orbitLegend = el(
    'div',
    { class: 'orbit-legend' },
    ORBITS.map((o, i) => el('div', { class: 'orbit-count' }, el('span', { class: 'dot', style: { background: o.color } }), el('b', {}, String(m.counts[i])), el('span', { class: 'muted small' }, o.name))),
  );

  const tabs = el(
    'div',
    { class: 'seg' },
    [['cards', `Cards (${m.n})`], ['points', 'Key points'], ['sources', `Sources (${(set.docIds || []).length})`]].map(([k, l]) => el('button', { class: st.tab === k ? 'on' : '', onclick: () => app.go('set', { tab: k }) }, l)),
  );

  let body;
  if (st.tab === 'cards') body = cardList(app, set, st);
  else if (st.tab === 'points') body = keyPoints(set);
  else body = sourcesList(app, set);
  body = el('div', {}, body, st.tab === 'cards' && questionBank(app, set));

  const course = courseForSet(app, set);
  return el('div', { class: 'set-page' }, course && el('button', { class: 'btn sm ghost', style: { marginLeft: '-10px', marginBottom: '4px' }, onclick: () => app.go('course', { id: course.id, tab: 'units' }) }, '🎓 Back to course'), header, modes, el('div', { class: 'card', style: { marginBottom: '16px' } }, orbitBar(set, { tall: true }), orbitLegend), el('div', { class: 'row', style: { marginBottom: '12px' } }, tabs), body);
}

function cardList(app, set, st) {
  const list = el('div', { class: 'stack', style: { gap: '8px' } });
  const q = (st.cardQ || '').toLowerCase();
  let cards = set.cards;
  if (st.starOnly) cards = cards.filter((c) => c.star);
  if (q) cards = cards.filter((c) => `${c.term} ${c.def}`.toLowerCase().includes(q));
  for (const card of cards) {
    const editing = st.editing === card.id;
    const orbit = ORBITS[Math.min(4, card.lvl || 0)];
    if (editing) {
      const term = el('textarea', { rows: 2 }, card.term);
      const def = el('textarea', { rows: 2 }, card.def);
      const save = () => {
        card.term = term.value.trim() || card.term;
        card.def = def.value.trim() || card.def;
        st.editing = null;
        app.commit();
      };
      add(
        list,
        el(
          'div',
          { class: 'card-row editing' },
          el('div', { class: 'card-cols' }, el('label', { class: 'field' }, el('span', {}, card.kind === 'cloze' ? 'Sentence (use _____ for the blank)' : 'Term'), term), el('label', { class: 'field' }, el('span', {}, card.kind === 'cloze' ? 'Missing word' : 'Definition'), def)),
          el('div', { class: 'row' }, el('span', { class: 'spacer' }), el('button', { class: 'btn sm', onclick: () => ((st.editing = null), app.render()) }, 'Cancel'), el('button', { class: 'btn sm primary', onclick: save }, 'Save')),
        ),
      );
      setTimeout(() => term.focus());
      continue;
    }
    add(
      list,
      el(
        'div',
        { class: 'card-row' },
        el('div', { class: 'orbit-dot', title: orbit.name, style: { background: orbit.color } }),
        el('div', { class: 'card-cols' }, el('div', { class: 'card-term' }, card.term), el('div', { class: 'card-def' }, card.def)),
        el(
          'div',
          { class: 'row', style: { gap: '2px' } },
          el('button', { class: `btn icon ghost${card.star ? ' starred' : ''}`, title: 'Star', onclick: () => ((card.star = !card.star), app.commit()) }, card.star ? '★' : '☆'),
          el('button', { class: 'btn icon ghost', title: 'Edit', onclick: () => ((st.editing = card.id), app.render()) }, '✎'),
          el(
            'button',
            {
              class: 'btn icon ghost',
              title: 'Delete card',
              onclick: () => {
                const i = set.cards.indexOf(card);
                set.cards.splice(i, 1);
                app.commit();
                toast('Card deleted', { action: 'Undo', onAction: () => (set.cards.splice(i, 0, card), app.commit()) });
              },
            },
            '✕',
          ),
        ),
      ),
    );
  }
  if (!cards.length) add(list, el('div', { class: 'card empty' }, set.cards.length ? 'No cards match.' : 'No cards yet — add some below.'));

  const search = el('input', { type: 'search', placeholder: 'Find a card…', value: st.cardQ || '', style: { maxWidth: '260px' } });
  search.addEventListener('input', () => {
    st.cardQ = search.value;
    const pos = search.selectionStart;
    app.render();
    const s = document.querySelector('.set-page input[type=search]');
    s?.focus();
    s?.setSelectionRange(pos, pos);
  });

  // Quick add
  const nt = el('textarea', { rows: 2, placeholder: 'Term' });
  const nd = el('textarea', { rows: 2, placeholder: 'Definition' });
  const addCard = () => {
    if (!nt.value.trim() || !nd.value.trim()) return toast('Fill in both sides.');
    set.cards.push(newCard(nt.value.trim(), nd.value.trim(), nt.value.includes('_____') ? 'cloze' : 'manual'));
    app.commit();
    setTimeout(() => document.querySelector('.add-card textarea')?.focus());
  };
  nd.addEventListener('keydown', (e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && addCard());

  return el(
    'div',
    {},
    el(
      'div',
      { class: 'row wrap', style: { marginBottom: '10px' } },
      search,
      el('button', { class: `btn sm${st.starOnly ? ' primary' : ''}`, onclick: () => app.go('set', { starOnly: !st.starOnly }) }, '★ Starred only'),
      el('span', { class: 'spacer' }),
      el(
        'button',
        {
          class: 'btn sm',
          title: 'Copy as tab-separated text (works with Quizlet and Anki import)',
          onclick: async () => {
            const tsv = set.cards.map((c) => `${c.term.replace(/\s+/g, ' ')}\t${c.def.replace(/\s+/g, ' ')}`).join('\n');
            try {
              await navigator.clipboard.writeText(tsv);
              toast(`Copied ${set.cards.length} cards`);
            } catch {
              toast('Copy failed');
            }
          },
        },
        '⧉ Export',
      ),
    ),
    list,
    el('div', { class: 'card add-card', style: { marginTop: '12px' } }, el('div', { class: 'section-h', style: { marginBottom: '8px' } }, 'Add a card'), el('div', { class: 'card-cols' }, nt, nd), el('div', { class: 'row', style: { marginTop: '8px' } }, el('span', { class: 'small faint' }, 'Tip: put _____ in the term to make a fill-in-the-blank card. Ctrl+Enter adds.'), el('span', { class: 'spacer' }), el('button', { class: 'btn sm primary', onclick: addCard }, '+ Add card'))),
  );
}

function keyPoints(set) {
  return el(
    'div',
    { class: 'stack' },
    set.topics?.length ? el('div', { class: 'card' }, el('h3', {}, '🏷 Main topics'), el('div', { class: 'row wrap' }, set.topics.map((t) => el('span', { class: 'chip steady' }, t)))) : null,
    el(
      'div',
      { class: 'card' },
      el('h3', {}, '✨ Key points'),
      set.keyPoints?.length ? el('ol', { class: 'key-points' }, set.keyPoints.map((p) => el('li', {}, p))) : el('div', { class: 'muted small' }, 'Key points appear here when you create a set from a PDF or notes.'),
      el('p', { class: 'small faint', style: { marginBottom: 0 } }, 'Picked automatically: the sentences that pack the most of this material’s important terms.'),
    ),
  );
}

function sourcesList(app, set) {
  const docs = (set.docIds || []).map((id) => app.data.docs.find((d) => d.id === id)).filter(Boolean);
  return el(
    'div',
    { class: 'card' },
    docs.length
      ? docs.map((d) =>
          el(
            'div',
            { class: 'row', style: { padding: '8px 0', borderBottom: '1px solid var(--line)' } },
            el('span', { style: { fontSize: '1.4em' } }, d.pdf ? '📄' : '📝'),
            el('div', { style: { flex: 1 } }, el('div', { style: { fontWeight: 700 } }, d.name), el('div', { class: 'small muted' }, `${d.pages ? `${d.pages} pages · ` : ''}${Math.round(d.chars / 1000)}k characters · added ${fmtDate(d.createdAt)} · 🔒 encrypted`)),
            el('button', { class: 'btn sm', onclick: () => viewDocText(app, d) }, 'Read text'),
            d.pdf && el('button', { class: 'btn sm', onclick: () => downloadDoc(app, d) }, '↓ PDF'),
          ),
        )
      : el('div', { class: 'muted small' }, 'No source files. Use “+ Add material” to add a PDF or notes.'),
  );
}

async function viewDocText(app, d) {
  const bytes = await app.session.loadFile(`${d.id}.txt`);
  const text = bytes ? dec.decode(bytes) : 'Text not found on this device.';
  modal(d.name, () => el('div', { class: 'doc-text' }, text), { center: true, wide: true });
}
async function downloadDoc(app, d) {
  const bytes = await app.session.loadFile(`${d.id}.pdf`);
  if (!bytes) return toast('PDF not found on this device.');
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = el('a', { href: url, download: d.name.endsWith('.pdf') ? d.name : `${d.name}.pdf` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function openEditSet(app, set) {
  modal(
    'Edit study set',
    (ctl) => {
      const title = el('input', { type: 'text', value: set.title });
      const desc = el('textarea', { rows: 2, placeholder: 'Optional description' }, set.description || '');
      const cls = el('select', {}, el('option', { value: '' }, 'General / no class'), app.data.classes.map((c) => el('option', { value: c.id }, c.name)));
      cls.value = set.classId || '';
      return el(
        'div',
        { class: 'stack' },
        el('label', { class: 'field' }, el('span', {}, 'Title'), title),
        el('label', { class: 'field' }, el('span', {}, 'Class'), cls),
        el('label', { class: 'field' }, el('span', {}, 'Description'), desc),
        el(
          'div',
          { class: 'row' },
          el(
            'button',
            {
              class: 'btn danger',
              onclick: async () => {
                if (!(await confirmBox(`Delete “${set.title}” and its ${set.cards.length} cards?`, { ok: 'Delete set', danger: true }))) return;
                ctl.close();
                await deleteSet(app, set);
                app.go('library');
              },
            },
            'Delete set',
          ),
          el('span', { class: 'spacer' }),
          el('button', { class: 'btn', onclick: () => ctl.close() }, 'Cancel'),
          el(
            'button',
            {
              class: 'btn primary',
              onclick: () => {
                set.title = title.value.trim() || set.title;
                set.description = desc.value.trim();
                set.classId = cls.value || null;
                ctl.close();
                app.commit();
              },
            },
            'Save',
          ),
        ),
      );
    },
    { center: true },
  );
}

export async function deleteSet(app, set) {
  app.data.sets = app.data.sets.filter((s) => s !== set);
  for (const id of set.docIds || []) {
    app.data.docs = app.data.docs.filter((d) => d.id !== id);
    await app.session.deleteFile(`${id}.pdf`).catch(() => {});
    await app.session.deleteFile(`${id}.txt`).catch(() => {});
  }
  app.commit({ render: false });
}

// ------------------------------------------------------------------ Create a set
export function openCreateSet(app, { files = null, classId = null, addToSet = null, tab = null } = {}) {
  const st = {
    step: 1,
    tab: tab || 'pdf',
    title: '',
    classId: addToSet ? addToSet.classId || '' : classId || '',
    files: files ? [...files] : [],
    paste: '',
    importText: '',
    busy: '',
    error: '',
    result: null,
  };
  const ctl = modal(
    addToSet ? `Add material to “${addToSet.title}”` : 'New study set',
    (m) => (st.step === 1 ? createStep1(app, st, m, addToSet) : createStep2(app, st, m, addToSet)),
    { center: true, wide: true },
  );
  if (files?.length) setTimeout(() => runGenerate(app, st, ctl, addToSet));
  return ctl;
}

function createStep1(app, st, m, addToSet) {
  const title = el('input', { type: 'text', value: st.title, placeholder: 'e.g. Unit 4 — Cellular respiration' });
  title.addEventListener('input', () => (st.title = title.value));
  const cls = el('select', {}, el('option', { value: '' }, 'General / no class'), app.data.classes.map((c) => el('option', { value: c.id }, c.name)));
  cls.value = st.classId;
  cls.addEventListener('change', () => (st.classId = cls.value));

  const tabs = el(
    'div',
    { class: 'seg' },
    [['pdf', '📄 Upload PDF'], ['paste', '📝 Paste notes'], ['import', '📥 Import cards'], ...(addToSet ? [] : [['blank', '✍️ Start blank']])].map(([k, l]) => el('button', { class: st.tab === k ? 'on' : '', onclick: () => ((st.tab = k), m.rebuild()) }, l)),
  );

  let body;
  if (st.tab === 'pdf') {
    const input = el('input', { type: 'file', accept: '.pdf,application/pdf,.txt,text/plain', multiple: true, class: 'hidden' });
    input.addEventListener('change', () => {
      st.files.push(...input.files);
      m.rebuild();
    });
    const zone = el(
      'div',
      { class: 'pdf-drop' },
      el('div', { class: 'big' }, '📄'),
      el('div', {}, el('button', { class: 'btn primary', onclick: () => input.click() }, 'Choose PDFs'), ' or drop them here'),
      el('div', { class: 'small muted' }, 'Class notes, study guides, slides exported to PDF, worksheets. Works with PDFs whose text you can select (not scanned photos).'),
      input,
    );
    wireFileDrop(zone, (fl) => {
      st.files.push(...fl);
      m.rebuild();
    });
    body = el(
      'div',
      { class: 'stack' },
      zone,
      st.files.map((f, i) =>
        el('div', { class: 'row small file-chip' }, el('span', {}, /\.pdf$/i.test(f.name) ? '📄' : '📝'), el('b', {}, f.name), el('span', { class: 'muted' }, `${Math.round(f.size / 1024)} KB`), el('span', { class: 'spacer' }), el('button', { class: 'btn icon ghost', onclick: () => (st.files.splice(i, 1), m.rebuild()) }, '✕')),
      ),
    );
  } else if (st.tab === 'paste') {
    const ta = el('textarea', { rows: 12, placeholder: 'Paste your notes, a study guide, a textbook section…\n\nTip: lines like "Term: definition" or "Term – definition" become cards directly.' }, st.paste);
    ta.addEventListener('input', () => (st.paste = ta.value));
    body = ta;
  } else if (st.tab === 'import') {
    const ta = el('textarea', { rows: 12, placeholder: 'One card per line:\nmitochondria\tpowerhouse of the cell\nosmosis - diffusion of water across a membrane\n\nFrom Quizlet: open a set → ⋯ → Export → Copy text.' }, st.importText);
    ta.addEventListener('input', () => (st.importText = ta.value));
    body = el('div', { class: 'stack' }, ta, el('div', { class: 'small muted' }, 'Separators detected automatically: tab, " - ", ":" or ",".'));
  } else {
    body = el('div', { class: 'muted' }, 'Create an empty set and type your own cards on the set page.');
  }

  return el(
    'div',
    { class: 'stack' },
    !addToSet && el('div', { class: 'grid-2' }, el('label', { class: 'field' }, el('span', {}, 'Title (optional — we’ll suggest one)'), title), el('label', { class: 'field' }, el('span', {}, 'Class'), cls)),
    tabs,
    body,
    st.error && el('div', { class: 'error' }, st.error),
    el(
      'div',
      { class: 'row' },
      st.busy && el('span', { class: 'muted small' }, st.busy),
      el('span', { class: 'spacer' }),
      el('button', { class: 'btn', onclick: () => m.close() }, 'Cancel'),
      el('button', { class: 'btn primary', disabled: !!st.busy, onclick: () => runGenerate(app, st, m, addToSet) }, st.tab === 'blank' ? 'Create set' : st.tab === 'import' ? 'Import →' : '✨ Generate cards →'),
    ),
  );
}

async function runGenerate(app, st, m, addToSet) {
  st.error = '';
  if (st.tab === 'blank') {
    const set = makeSet(app, st, []);
    m.close();
    app.go('set', { id: set.id, tab: 'cards' });
    return;
  }
  try {
    if (st.tab === 'import') {
      const cards = parseImport(st.importText);
      if (!cards.length) throw new Error('Couldn’t find any "term<separator>definition" lines.');
      st.result = { cards: cards.map((c) => ({ ...c, include: true })), keyPoints: [], topics: [], docs: [] };
    } else {
      const docs = [];
      if (st.tab === 'pdf') {
        if (!st.files.length) throw new Error('Choose at least one PDF.');
        const { extractPdfText } = await import('./pdf.js');
        for (const [i, f] of st.files.entries()) {
          st.busy = `Reading ${f.name} (${i + 1}/${st.files.length})…`;
          m.rebuild();
          const bytes = new Uint8Array(await f.arrayBuffer());
          if (/\.txt$/i.test(f.name) || f.type === 'text/plain') {
            docs.push({ name: f.name, text: dec.decode(bytes), pdf: null, pages: 0 });
            continue;
          }
          try {
            const r = await extractPdfText(bytes.slice(), (p) => {
              st.busy = `Reading ${f.name} — ${Math.round(p * 100)}%`;
              const b = m.body.querySelector('.row .muted.small');
              if (b) b.textContent = st.busy;
            });
            docs.push({ name: f.name.replace(/\.pdf$/i, ''), text: r.text, pdf: bytes, pages: r.pages, pdfTitle: r.title });
          } catch (err) {
            throw new Error(`${f.name}: ${err.message || 'could not be read.'}`);
          }
        }
      } else {
        if (st.paste.trim().length < 20) throw new Error('Paste a bit more text first.');
        docs.push({ name: `Pasted notes (${fmtDate(new Date())})`, text: st.paste, pdf: null, pages: 0 });
      }
      st.busy = 'Finding key terms and facts…';
      m.rebuild();
      await new Promise((r) => setTimeout(r, 30));
      const g = generateCards(docs.map((d) => d.text).join('\n\n'), { maxCards: 80 });
      const existing = new Set((addToSet?.cards || []).map((c) => c.term.toLowerCase()));
      st.result = { cards: g.cards.filter((c) => !existing.has(c.term.toLowerCase())).map((c) => ({ ...c, include: true })), keyPoints: g.keyPoints, topics: g.topics, docs };
      if (!st.title) st.title = docs[0]?.pdfTitle || headingOf(docs[0]?.text) || (st.tab === 'pdf' ? docs[0]?.name : '') || (g.topics[0] ? `${g.topics.slice(0, 2).join(' & ')} notes` : 'New set');
    }
    st.busy = '';
    st.step = 2;
    m.rebuild();
  } catch (err) {
    console.error(err);
    st.busy = '';
    st.error = err.message || String(err);
    m.rebuild();
  }
}

// First short heading-like line of a document, title-cased if it was ALL CAPS.
function headingOf(text = '') {
  const line = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 6)
    .find((l) => l.split(/\s+/).length <= 10 && l.length >= 4 && !/[.,;]$/.test(l) && /[A-Za-z]{3}/.test(l));
  if (!line) return '';
  return line === line.toUpperCase() ? line.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()) : line;
}

function createStep2(app, st, m, addToSet) {
  const r = st.result;
  const chosen = r.cards.filter((c) => c.include).length;
  const kinds = { def: 'Definition', qa: 'Q & A', cloze: 'Fill-in', manual: 'Imported' };
  const rows = r.cards.map((c) => {
    const cb = el('input', { type: 'checkbox', class: 'check sq', checked: c.include });
    cb.addEventListener('change', () => {
      c.include = cb.checked;
      m.body.querySelector('.create-count').textContent = `Create with ${r.cards.filter((x) => x.include).length} cards`;
      row.classList.toggle('off', !c.include);
    });
    const term = el('textarea', { rows: 2 }, c.term);
    term.addEventListener('input', () => (c.term = term.value));
    const def = el('textarea', { rows: 2 }, c.def);
    def.addEventListener('input', () => (c.def = def.value));
    const row = el('div', { class: `gen-row${c.include ? '' : ' off'}` }, cb, el('div', { class: 'card-cols' }, term, def), el('span', { class: 'chip' }, kinds[c.kind] || c.kind));
    return row;
  });

  return el(
    'div',
    { class: 'stack' },
    el(
      'div',
      { class: 'row wrap' },
      el('div', {}, el('b', {}, `${r.cards.length} cards found`), r.docs.length ? el('span', { class: 'muted' }, ` in ${r.docs.map((d) => d.name).join(', ')}`) : null),
      el('span', { class: 'spacer' }),
      el('button', { class: 'btn sm ghost', onclick: () => (r.cards.forEach((c) => (c.include = true)), m.rebuild()) }, 'Select all'),
      el('button', { class: 'btn sm ghost', onclick: () => (r.cards.forEach((c) => (c.include = c.kind !== 'cloze')), m.rebuild()) }, 'No fill-ins'),
    ),
    el('p', { class: 'small muted', style: { margin: 0 } }, 'Check the cards over — untick anything off, fix wording, and you can always edit later.'),
    !addToSet && el('label', { class: 'field' }, el('span', {}, 'Set title'), (() => {
      const t = el('input', { type: 'text', value: st.title });
      t.addEventListener('input', () => (st.title = t.value));
      return t;
    })()),
    r.cards.length ? el('div', { class: 'gen-list' }, rows) : el('div', { class: 'card empty' }, 'Orbit couldn’t spot card-shaped facts in this text. You can still create the set (the key points and source are saved) and add cards yourself.'),
    r.keyPoints.length > 0 && el('details', { class: 'small' }, el('summary', { class: 'muted' }, `Key points (${r.keyPoints.length})`), el('ol', { class: 'key-points' }, r.keyPoints.map((p) => el('li', {}, p)))),
    el(
      'div',
      { class: 'row' },
      el('button', { class: 'btn', onclick: () => ((st.step = 1), m.rebuild()) }, '← Back'),
      el('span', { class: 'spacer' }),
      el(
        'button',
        {
          class: 'btn primary create-count',
          onclick: async () => {
            const cards = r.cards.filter((c) => c.include && c.term.trim() && c.def.trim()).map((c) => newCard(c.term.trim(), c.def.trim(), c.kind));
            const docIds = [];
            for (const d of r.docs) {
              const id = uid();
              if (d.pdf) await app.session.saveFile(`${id}.pdf`, d.pdf);
              await app.session.saveFile(`${id}.txt`, enc.encode(d.text));
              app.data.docs.push({ id, name: d.name, pdf: !!d.pdf, pages: d.pages, chars: d.text.length, createdAt: new Date().toISOString() });
              docIds.push(id);
            }
            let set;
            if (addToSet) {
              set = addToSet;
              set.cards.push(...cards);
              set.docIds = [...(set.docIds || []), ...docIds];
              set.keyPoints = [...(set.keyPoints || []), ...r.keyPoints].slice(0, 20);
              set.topics = [...new Set([...(set.topics || []), ...r.topics])].slice(0, 16);
            } else {
              set = makeSet(app, st, cards, { docIds, keyPoints: r.keyPoints, topics: r.topics });
            }
            m.close();
            app.commit({ render: false });
            confetti(window.innerWidth / 2, window.innerHeight / 3, 30);
            toast(`🔒 ${cards.length} cards saved to “${set.title}”`);
            app.go('set', { id: set.id, tab: 'cards', editing: null });
          },
        },
        addToSet ? `Add ${chosen} cards` : `Create with ${chosen} cards`,
      ),
    ),
  );
}

function makeSet(app, st, cards, extra = {}) {
  const set = {
    id: uid(),
    title: st.title.trim() || 'Untitled set',
    classId: st.classId || null,
    description: '',
    createdAt: new Date().toISOString(),
    lastStudied: null,
    cards,
    docIds: [],
    keyPoints: [],
    topics: [],
    bestMatchMs: null,
    tests: [],
    ...extra,
  };
  app.data.sets.push(set);
  app.commit({ render: false });
  return set;
}

// ------------------------------------------------------------------ Study sessions
function createSession(app, setId, mode, extra) {
  const set = setId && setById(app, setId);
  const base = { mode, setId, started: Date.now(), ...extra };
  if (mode === 'cards') {
    return { ...base, order: set.cards.map((c) => c.id), i: 0, flipped: false, known: 0, learning: [], dir: 'term', done: false };
  }
  if (mode === 'learn') {
    // Each card needs to be answered right by multiple-choice, then by typing.
    const pool = shuffle(set.cards).sort((a, b) => (a.lvl || 0) - (b.lvl || 0));
    return { ...base, progress: Object.fromEntries(pool.map((c) => [c.id, 0])), queue: [], round: 0, answered: 0, correct: 0, fresh: 0, feedback: null, dir: 'def', roundDone: false, done: false };
  }
  if (mode === 'match') {
    const pairs = shuffle(set.cards).slice(0, 6);
    const tiles = shuffle(pairs.flatMap((c) => [{ id: `${c.id}:t`, card: c.id, text: c.kind === 'cloze' ? c.term.replace('_____', '___') : c.term }, { id: `${c.id}:d`, card: c.id, text: c.def }]));
    return { ...base, tiles, matched: [], picked: null, wrong: null, penalty: 0, t0: null, done: false };
  }
  if (mode === 'review') {
    const queue = reviewQueue(app.data, { setIds: extra.setIds || null }).map((x) => ({ setId: x.set.id, cardId: x.card.id, why: x.why }));
    return { ...base, queue, i: 0, shown: false, answered: 0, correct: 0, fresh: 0, again: [], done: !queue.length };
  }
  if (mode === 'test') return { ...base, ...extra };
  return base;
}

const cardIn = (app, setId, id) => setById(app, setId)?.cards.find((c) => c.id === id);

export function renderStudy(app) {
  const s = app.viewState.study?.session;
  if (!s) {
    app.view = 'home';
    return renderHome(app);
  }
  const set = s.setId && setById(app, s.setId);
  const titles = { cards: 'Flashcards', learn: 'Learn', test: 'Test', match: 'Match', review: 'Review', exam: s.kind === 'unit' ? 'Unit test' : 'Practice exam' };
  const back = async () => {
    if (s.mode === 'exam' && !['results'].includes(s.phase) && !(await confirmBox('Leave this test? Your answers will be lost.', { ok: 'Leave', danger: true }))) return;
    if (s.timer) clearInterval(s.timer);
    app.viewState.study = null;
    if (s.mode === 'exam') app.go('course', { id: s.courseId });
    else if (set) app.go('set', { id: set.id });
    else app.go('home');
  };
  const top = el(
    'div',
    { class: 'study-top' },
    el('button', { class: 'btn sm', onclick: back }, '✕ Exit'),
    el('div', { class: 'study-title' }, el('b', {}, titles[s.mode]), el('span', { class: 'muted' }, ` · ${s.title || set?.title || 'All sets'}`)),
    el('span', { class: 'spacer' }),
  );
  let body;
  if (s.mode === 'cards') body = renderFlashcards(app, s, set, top);
  else if (s.mode === 'learn') body = renderLearn(app, s, set, top);
  else if (s.mode === 'match') body = renderMatch(app, s, set, top);
  else if (s.mode === 'review') body = renderReview(app, s, top);
  else if (s.mode === 'test') body = renderTest(app, s, set, top);
  else if (s.mode === 'exam') body = renderExam(app, s, top);
  return el('div', { class: 'study' }, top, body);
}

// ---------- Flashcards ----------
function renderFlashcards(app, s, set, top) {
  const cards = s.order.map((id) => set.cards.find((c) => c.id === id)).filter(Boolean);
  if (s.done || s.i >= cards.length) {
    s.done = true;
    return summary(app, s, set, {
      big: `${s.known}/${cards.length}`,
      line: 'cards you know',
      extra: s.learning.length
        ? el('button', { class: 'btn primary', onclick: () => Object.assign(s, { order: shuffle(s.learning), i: 0, known: 0, learning: [], done: false, flipped: false }) && app.render() }, `Study the ${s.learning.length} still-learning cards`)
        : null,
    });
  }
  const card = cards[s.i];
  const p = prompt(card, s.dir);
  add(
    top,
    el('span', { class: 'muted small' }, `${s.i + 1} / ${cards.length}`),
    el('button', { class: 'btn sm', title: 'Shuffle', onclick: () => ((s.order = shuffle(s.order)), (s.i = 0), (s.flipped = false), app.render()) }, '🔀'),
    el('button', { class: 'btn sm', title: 'Swap sides', onclick: () => ((s.dir = s.dir === 'term' ? 'def' : 'term'), (s.flipped = false), app.render()) }, s.dir === 'term' ? 'Term first' : 'Definition first'),
  );
  const flip = el(
    'div',
    { class: `flip${s.flipped ? ' flipped' : ''}`, onclick: () => ((s.flipped = !s.flipped), flip.classList.toggle('flipped')) },
    el('div', { class: 'flip-inner' }, el('div', { class: 'face front' }, el('span', { class: 'face-label' }, p.qLabel), el('div', { class: 'face-text' }, p.q)), el('div', { class: 'face back' }, el('span', { class: 'face-label' }, p.aLabel), el('div', { class: 'face-text' }, p.a))),
  );
  const mark = (knew) => {
    grade(card, knew ? 2 : 0);
    if (knew) s.known++;
    else s.learning.push(card.id);
    logStudy(app.data, { cards: 1, correct: knew ? 1 : 0, fresh: card.seen === 1 ? 1 : 0 });
    s.i++;
    s.flipped = false;
    if (s.i >= cards.length) finishSession(app, s);
    app.commit();
  };
  s.keys = { ' ': () => flip.click(), ArrowUp: () => flip.click(), ArrowDown: () => flip.click(), ArrowLeft: () => mark(false), ArrowRight: () => mark(true), 1: () => mark(false), 2: () => mark(true) };
  return el(
    'div',
    { class: 'study-body' },
    progressBar(s.i / cards.length),
    flip,
    el(
      'div',
      { class: 'row', style: { justifyContent: 'center', gap: '14px' } },
      el('button', { class: 'btn big-btn learning', onclick: () => mark(false) }, '✗ Still learning'),
      el('button', { class: 'btn icon ghost', title: card.star ? 'Unstar' : 'Star', onclick: () => ((card.star = !card.star), app.commit()) }, card.star ? '★' : '☆'),
      el('button', { class: 'btn big-btn know', onclick: () => mark(true) }, 'Know it ✓'),
    ),
    el('div', { class: 'small faint', style: { textAlign: 'center' } }, 'Space to flip · ← still learning · → know it'),
  );
}

function progressBar(frac) {
  return el('div', { class: 'study-progress' }, el('div', { style: { width: `${clamp(frac * 100, 0, 100)}%` } }));
}

function summary(app, s, set, { big, line, extra, details }) {
  if (!s.celebrated) {
    s.celebrated = true;
    setTimeout(() => confetti(window.innerWidth / 2, window.innerHeight / 3, 40), 50);
  }
  return el(
    'div',
    { class: 'study-body' },
    el(
      'div',
      { class: 'card summary' },
      el('div', { class: 'big' }, '🪐'),
      el('div', { class: 'summary-big grad-text' }, big),
      el('div', { class: 'muted' }, line),
      set && el('div', { style: { margin: '18px auto 6px', maxWidth: '420px' } }, orbitBar(set, { tall: true })),
      set && el('div', { class: 'small muted' }, `${mastery(set).pct}% of “${set.title}” mastered`),
      details,
      el(
        'div',
        { class: 'row wrap', style: { justifyContent: 'center', marginTop: '18px' } },
        extra,
        set && el('button', { class: 'btn', onclick: () => startStudy(app, set.id, s.mode === 'test' ? 'learn' : s.mode, s.mode === 'review' ? { setIds: [set.id], title: set.title } : {}) }, s.mode === 'test' ? 'Practise in Learn' : 'Go again'),
        el('button', { class: 'btn', onclick: () => ((app.viewState.study = null), set ? app.go('set', { id: set.id }) : app.go('home')) }, 'Done'),
      ),
    ),
  );
}

// ---------- Learn (adaptive) ----------
const ROUND = 7;
function renderLearn(app, s, set, top) {
  const cards = set.cards;
  const total = cards.length;
  const levels = cards.map((c) => s.progress[c.id] ?? 0);
  const done = levels.filter((l) => l >= 2).length;
  add(
    top,
    el(
      'button',
      { class: 'btn sm', title: 'What you type', onclick: () => ((s.dir = s.dir === 'def' ? 'term' : 'def'), (s.queue = []), (s.feedback = null), app.render()) },
      s.dir === 'def' ? 'Answer with: term' : 'Answer with: definition',
    ),
  );
  const stages = el(
    'div',
    { class: 'learn-stages' },
    [
      ['Not started', levels.filter((l) => l === 0).length, ORBITS[0].color],
      ['Familiar', levels.filter((l) => l === 1).length, ORBITS[2].color],
      ['Mastered', done, ORBITS[4].color],
    ].map(([n, c, col]) => el('div', { class: 'stage' }, el('b', { style: { color: col } }, String(c)), el('span', { class: 'small muted' }, n))),
  );

  if (done >= total) {
    if (!s.done) {
      s.done = true;
      finishSession(app, s, { cards: 0 });
    }
    return summary(app, s, set, { big: `${total}/${total}`, line: 'cards learned — each answered by choice and by typing', extra: el('button', { class: 'btn primary', onclick: () => openTestSetup(app, set) }, 'Take a practice test') });
  }

  if (s.roundDone) {
    return el(
      'div',
      { class: 'study-body' },
      progressBar(done / total),
      stages,
      el(
        'div',
        { class: 'card summary' },
        el('div', { class: 'big' }, '🚀'),
        el('h3', { style: { justifyContent: 'center' } }, `Round ${s.round} complete`),
        el('div', { class: 'muted' }, `${done} of ${total} mastered this session`),
        el('button', { class: 'btn primary', style: { marginTop: '16px' }, onclick: () => ((s.roundDone = false), app.render()) }, 'Next round ▶'),
      ),
    );
  }

  if (!s.queue.length) {
    s.round++;
    const pending = cards.filter((c) => (s.progress[c.id] ?? 0) < 2);
    s.queue = pending.slice(0, ROUND).map((c) => c.id);
    s.inRound = s.queue.length;
  }
  const card = cards.find((c) => c.id === s.queue[0]);
  if (!card) {
    s.queue.shift();
    return renderLearn(app, s, set, top);
  }
  const lvl = s.progress[card.id] ?? 0;
  const written = lvl >= 1 || cards.length < 4;
  // Multiple choice: see the term, pick the definition. Typing: see the definition, type the term (swappable).
  const dirFor = written ? s.dir : s.dir === 'def' ? 'term' : 'def';
  const p = prompt(card, dirFor);
  const group = (c) => (c.kind === 'cloze' ? 'cloze' : c.kind === 'qa' ? 'qa' : 'def');

  const answer = (ok, given) => {
    s.answered++;
    if (ok) s.correct++;
    const wasNew = isNew(card);
    if (ok) s.progress[card.id] = lvl + 1;
    else s.progress[card.id] = 0;
    // Written correct = strong recall; choice correct = partial; wrong = again.
    if (!ok) grade(card, 0);
    else if (written) grade(card, 2);
    logStudy(app.data, { cards: 1, correct: ok ? 1 : 0, fresh: wasNew ? 1 : 0 });
    s.feedback = { ok, given, cardId: card.id, expected: p.a };
    app.commit();
  };

  const next = () => {
    const fb = s.feedback;
    s.feedback = null;
    s.queue.shift();
    if (fb && !fb.ok) s.queue.splice(Math.min(3, s.queue.length), 0, fb.cardId); // see it again soon
    if (!s.queue.length) s.roundDone = true;
    app.render();
  };

  let area;
  if (s.feedback) {
    const fb = s.feedback;
    area = el(
      'div',
      { class: `feedback ${fb.ok ? 'ok' : 'bad'}` },
      el('div', { class: 'fb-head' }, fb.ok ? (fb.close ? '✓ Close enough!' : ['✓ Nailed it!', '✓ Correct!', '✓ Stellar!', '✓ Yes!'][s.answered % 4]) : '✗ Not quite'),
      !fb.ok && fb.given != null && el('div', { class: 'fb-line' }, el('span', { class: 'muted small' }, 'You said'), el('div', { class: 'strike' }, fb.given || '(blank)')),
      el('div', { class: 'fb-line' }, el('span', { class: 'muted small' }, 'Answer'), el('div', { style: { fontWeight: 700 } }, fb.expected)),
      el(
        'div',
        { class: 'row', style: { marginTop: '12px' } },
        !fb.ok &&
          fb.given &&
          el(
            'button',
            {
              class: 'btn sm ghost',
              onclick: () => {
                // Override: count it as right.
                s.correct++;
                s.progress[fb.cardId] = lvl + 1;
                card.wrong = Math.max(0, (card.wrong || 1) - 1);
                grade(card, 2);
                fb.ok = true;
                app.commit();
              },
            },
            'I was right',
          ),
        el('span', { class: 'spacer' }),
        el('button', { class: 'btn primary', id: 'learn-next', onclick: next }, 'Continue ⏎'),
      ),
    );
    s.keys = { Enter: next, ' ': next };
    if (fb.ok) setTimeout(() => s.feedback === fb && next(), fb.close ? 1600 : 900);
  } else if (!written) {
    // Multiple choice
    const others = shuffle(cards.filter((c) => c.id !== card.id && prompt(c, dirFor).a !== p.a));
    const sameKind = others.filter((c) => group(c) === group(card));
    const pool = [...sameKind, ...others.filter((c) => !sameKind.includes(c))];
    const choices = shuffle([p.a, ...[...new Set(pool.map((c) => prompt(c, dirFor).a))].slice(0, 3)]);
    area = el(
      'div',
      { class: 'choices' },
      choices.map((ch, i) =>
        el(
          'button',
          {
            class: 'choice',
            onclick: () => answer(ch === p.a, ch === p.a ? null : ch),
          },
          el('span', { class: 'key' }, String(i + 1)),
          ch,
        ),
      ),
    );
    s.keys = Object.fromEntries(choices.map((ch, i) => [String(i + 1), () => answer(ch === p.a, ch === p.a ? null : ch)]));
  } else {
    const input = el('input', { type: 'text', class: 'answer-input', placeholder: `Type the ${p.aLabel.toLowerCase()}…`, autocomplete: 'off', spellcheck: 'false' });
    const submit = () => {
      const r = checkAnswer(input.value, p.a);
      answer(r !== 'wrong', input.value);
      if (r === 'close') {
        s.feedback.close = true;
        app.render();
      }
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    });
    setTimeout(() => input.focus());
    area = el('div', { class: 'stack' }, input, el('div', { class: 'row' }, el('button', { class: 'btn ghost sm', onclick: () => answer(false, '') }, "Don't know"), el('span', { class: 'spacer' }), el('button', { class: 'btn primary', onclick: submit }, 'Check ⏎')));
    s.keys = {};
  }

  return el(
    'div',
    { class: 'study-body' },
    progressBar(done / total),
    stages,
    el(
      'div',
      { class: 'card question' },
      el('div', { class: 'row small muted' }, el('span', {}, p.qLabel), el('span', { class: 'spacer' }), el('span', { class: 'chip' }, written ? '⌨ Type it' : '☝ Choose')),
      el('div', { class: 'q-text' }, p.q),
      area,
    ),
  );
}

// ---------- Match ----------
function renderMatch(app, s, set, top) {
  const elapsed = () => (s.t0 ? Date.now() - s.t0 : 0) + s.penalty;
  const clock = el('b', { class: 'match-clock' }, `${(elapsed() / 1000).toFixed(1)}s`);
  add(top, clock);
  if (s.done) {
    const best = set.bestMatchMs;
    return summary(app, s, set, { big: `${(s.finalMs / 1000).toFixed(1)}s`, line: s.newBest ? '🏆 New personal best!' : best ? `Best: ${(best / 1000).toFixed(1)}s` : '', extra: el('button', { class: 'btn primary', onclick: () => startStudy(app, set.id, 'match') }, 'Play again') });
  }
  if (!s.t0) s.t0 = Date.now();
  if (!s.timer) {
    s.timer = setInterval(() => {
      const c = document.querySelector('.match-clock');
      if (!c || app.viewState.study?.session !== s) return clearInterval(s.timer);
      c.textContent = `${(elapsed() / 1000).toFixed(1)}s`;
    }, 100);
  }
  const pick = (tile) => {
    if (s.matched.includes(tile.card) || s.wrong) return;
    if (!s.picked) {
      s.picked = tile.id;
    } else if (s.picked === tile.id) {
      s.picked = null;
    } else {
      const first = s.tiles.find((t) => t.id === s.picked);
      if (first.card === tile.card) {
        s.matched.push(tile.card);
        s.picked = null;
        const card = set.cards.find((c) => c.id === tile.card);
        if (card) card.seen = (card.seen || 0) + 1;
        if (s.matched.length * 2 === s.tiles.length) {
          clearInterval(s.timer);
          s.finalMs = elapsed();
          s.done = true;
          if (!set.bestMatchMs || s.finalMs < set.bestMatchMs) {
            s.newBest = true;
            set.bestMatchMs = s.finalMs;
          }
          finishSession(app, s, { cards: s.matched.length, correct: s.matched.length });
        }
      } else {
        s.wrong = [first.id, tile.id];
        s.penalty += 1000;
        s.picked = null;
        setTimeout(() => {
          s.wrong = null;
          app.render();
        }, 450);
      }
    }
    app.render();
  };
  return el(
    'div',
    { class: 'study-body wide' },
    el('div', { class: 'small muted', style: { textAlign: 'center' } }, 'Click a term, then its match. Wrong pairs add 1 second.'),
    el(
      'div',
      { class: 'match-grid' },
      s.tiles.map((t) =>
        el(
          'button',
          {
            class: `match-tile${s.matched.includes(t.card) ? ' gone' : ''}${s.picked === t.id ? ' picked' : ''}${s.wrong?.includes(t.id) ? ' wrong' : ''}`,
            onclick: () => pick(t),
          },
          t.text,
        ),
      ),
    ),
  );
}

// ---------- Review (spaced repetition) ----------
function renderReview(app, s, top) {
  if (s.done || s.i >= s.queue.length) {
    if (!s.done) {
      s.done = true;
      finishSession(app, s);
    }
    const next = nextDueLabel(app);
    return summary(app, s, s.setIds?.length === 1 ? setById(app, s.setIds[0]) : null, {
      big: s.answered ? `${Math.round((s.correct / s.answered) * 100)}%` : '✓',
      line: s.answered ? `recalled · ${s.answered} cards reviewed` : 'Nothing to review right now.',
      details: el('div', { class: 'small muted', style: { marginTop: '8px' } }, next),
    });
  }
  const item = s.queue[s.i];
  const set = setById(app, item.setId);
  const card = cardIn(app, item.setId, item.cardId);
  if (!card) {
    s.i++;
    return renderReview(app, s, top);
  }
  add(top, el('span', { class: 'muted small' }, `${s.i + 1} / ${s.queue.length}`));
  const p = prompt(card, 'term');
  const rate = (q) => {
    const wasNew = isNew(card);
    grade(card, q);
    s.answered++;
    if (q > 0) s.correct++;
    logStudy(app.data, { cards: 1, correct: q > 0 ? 1 : 0, fresh: wasNew ? 1 : 0 });
    if (q === 0) s.queue.push({ ...item, why: 'again' });
    s.i++;
    s.shown = false;
    app.commit();
  };
  const show = () => ((s.shown = true), app.render());
  s.keys = s.shown ? { 1: () => rate(0), 2: () => rate(1), 3: () => rate(2), 4: () => rate(3), ' ': () => rate(2) } : { ' ': show, Enter: show };
  const why = { due: '⏰ Due', exam: '🎯 Exam boost', new: '✨ New', again: '↻ Again' }[item.why];
  const cls = set && app.classById(set.classId);
  return el(
    'div',
    { class: 'study-body' },
    progressBar(s.i / s.queue.length),
    el(
      'div',
      { class: 'card question review' },
      el('div', { class: 'row small muted' }, cls && el('span', { class: 'dot', style: { background: cls.color } }), el('span', {}, set?.title), el('span', { class: 'spacer' }), el('span', { class: 'chip' }, why)),
      el('div', { class: 'q-text' }, p.q),
      s.shown ? el('div', { class: 'answer-reveal' }, el('div', { class: 'small muted' }, p.aLabel), el('div', { class: 'a-text' }, p.a)) : null,
    ),
    s.shown
      ? el(
          'div',
          { class: 'rate-row' },
          [
            [0, 'Again', 'again'],
            [1, 'Hard', 'hard'],
            [2, 'Good', 'good'],
            [3, 'Easy', 'easy'],
          ].map(([q, l, c]) => el('button', { class: `rate ${c}`, onclick: () => rate(q) }, el('b', {}, l), el('span', {}, previewInterval(card, q)), el('kbd', {}, String(q + 1)))),
        )
      : el('div', { class: 'row', style: { justifyContent: 'center' } }, el('button', { class: 'btn primary big-btn', onclick: show }, 'Show answer (space)')),
    el('div', { class: 'small faint', style: { textAlign: 'center' } }, 'Be honest — Orbit uses your rating to decide when you see this card again.'),
  );
}

function nextDueLabel(app) {
  let next = null;
  for (const s of app.data.sets) for (const c of s.cards) if (c.due && new Date(c.due) > new Date() && (!next || new Date(c.due) < next)) next = new Date(c.due);
  return next ? `Next cards come back ${relDue(next).replace('in ', 'in ')}.` : '';
}

// ---------- Test ----------
export function openTestSetup(app, set) {
  const opts = { count: Math.min(20, set.cards.length), mc: true, tf: true, written: true, dir: 'def' };
  modal(
    'Practice test',
    (m) => {
      const count = el('input', { type: 'number', min: 1, max: set.cards.length, value: opts.count });
      count.addEventListener('change', () => (opts.count = clamp(parseInt(count.value, 10) || 1, 1, set.cards.length)));
      const box = (key, label) => {
        const cb = el('input', { type: 'checkbox', class: 'check sq', checked: opts[key] });
        cb.addEventListener('change', () => (opts[key] = cb.checked));
        return el('label', { class: 'row' }, cb, label);
      };
      return el(
        'div',
        { class: 'stack' },
        el('label', { class: 'field' }, el('span', {}, `Questions (max ${set.cards.length})`), count),
        el('div', { class: 'section-h' }, 'Question types'),
        box('mc', 'Multiple choice'),
        box('tf', 'True / false'),
        box('written', 'Written'),
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
                const types = ['mc', 'tf', 'written'].filter((t) => opts[t]);
                if (!types.length) return toast('Pick at least one question type.');
                m.close();
                startStudy(app, set.id, 'test', { questions: buildTest(set, opts.count, types), submitted: false });
              },
            },
            'Start test',
          ),
        ),
      );
    },
    { center: true },
  );
}

function buildTest(set, count, types) {
  const cards = shuffle(set.cards).slice(0, count);
  return cards.map((card, i) => {
    let type = types[i % types.length];
    if (type === 'mc' && set.cards.length < 3) type = 'written';
    const p = prompt(card, 'term');
    const q = { cardId: card.id, type, prompt: p.q, answer: p.a, label: p.qLabel, given: null };
    const grp = (c) => (c.kind === 'cloze' ? 'cloze' : c.kind === 'qa' ? 'qa' : 'def');
    const mixed = shuffle(set.cards.filter((c) => c.id !== card.id));
    const others = [...mixed.filter((c) => grp(c) === grp(card)), ...mixed.filter((c) => grp(c) !== grp(card))].map((c) => prompt(c, 'term').a).filter((a) => a !== p.a);
    if (type === 'mc') q.choices = shuffle([p.a, ...[...new Set(others)].slice(0, 3)]);
    if (type === 'tf') {
      q.truth = others.length ? Math.random() < 0.5 : true;
      q.shown = q.truth ? p.a : others[0];
    }
    return q;
  });
}

function renderTest(app, s, set, top) {
  const qs = s.questions;
  const answeredN = qs.filter((q) => q.given !== null && q.given !== '').length;
  if (!s.submitted) add(top, el('span', { class: 'muted small' }, `${answeredN}/${qs.length} answered`));
  const isRight = (q) => (q.type === 'tf' ? q.given === q.truth : q.type === 'mc' ? q.given === q.answer : checkAnswer(q.given || '', q.answer) !== 'wrong');

  const submit = () => {
    s.submitted = true;
    let right = 0;
    for (const q of qs) {
      q.right = isRight(q);
      if (q.right) right++;
      const card = set.cards.find((c) => c.id === q.cardId);
      if (card) grade(card, q.right ? 2 : 0);
    }
    s.score = right;
    set.tests = [...(set.tests || []), { at: new Date().toISOString(), score: right, total: qs.length }].slice(-20);
    finishSession(app, s, { cards: qs.length, correct: right });
    app.commit();
    window.scrollTo(0, 0);
  };

  const block = (q, i) => {
    let answerUi;
    if (q.type === 'mc') {
      answerUi = el(
        'div',
        { class: 'choices' },
        q.choices.map((ch) =>
          el(
            'button',
            {
              class: `choice${q.given === ch ? ' picked' : ''}${s.submitted && ch === q.answer ? ' right' : ''}${s.submitted && q.given === ch && ch !== q.answer ? ' wrong' : ''}`,
              disabled: s.submitted,
              onclick: () => ((q.given = ch), app.render()),
            },
            ch,
          ),
        ),
      );
    } else if (q.type === 'tf') {
      answerUi = el(
        'div',
        {},
        el('div', { class: 'tf-shown' }, el('span', { class: 'muted small' }, 'Matches with: '), q.shown),
        el(
          'div',
          { class: 'row', style: { marginTop: '8px' } },
          [true, false].map((v) =>
            el(
              'button',
              {
                class: `choice tf${q.given === v ? ' picked' : ''}${s.submitted && v === q.truth ? ' right' : ''}${s.submitted && q.given === v && v !== q.truth ? ' wrong' : ''}`,
                disabled: s.submitted,
                onclick: () => ((q.given = v), app.render()),
              },
              v ? 'True' : 'False',
            ),
          ),
        ),
      );
    } else {
      const input = el('input', { type: 'text', value: q.given || '', placeholder: 'Type your answer', disabled: s.submitted, autocomplete: 'off', spellcheck: 'false' });
      input.addEventListener('input', () => {
        q.given = input.value;
        const c = document.querySelector('.study-top .muted.small');
        if (c) c.textContent = `${qs.filter((x) => x.given !== null && x.given !== '').length}/${qs.length} answered`;
      });
      answerUi = el('div', {}, input, s.submitted && !q.right && el('div', { class: 'small', style: { marginTop: '6px' } }, el('span', { class: 'muted' }, 'Answer: '), el('b', {}, q.answer)));
    }
    return el(
      'div',
      { class: `card test-q${s.submitted ? (q.right ? ' right' : ' wrong') : ''}` },
      el('div', { class: 'row small muted' }, el('span', {}, `${i + 1}. ${q.label}`), el('span', { class: 'spacer' }), el('span', { class: 'chip' }, { mc: 'Multiple choice', tf: 'True / false', written: 'Written' }[q.type]), s.submitted && el('b', { style: { color: q.right ? 'var(--good)' : 'var(--bad)' } }, q.right ? '✓' : '✗')),
      el('div', { class: 'q-text small-q' }, q.prompt),
      answerUi,
    );
  };

  s.keys = {};
  const pct = s.submitted ? Math.round((s.score / qs.length) * 100) : 0;
  return el(
    'div',
    { class: 'study-body' },
    s.submitted &&
      el(
        'div',
        { class: 'card summary' },
        el('div', { class: 'summary-big grad-text' }, `${pct}%`),
        el('div', { class: 'muted' }, `${s.score} of ${qs.length} correct${pct >= 90 ? ' — outstanding!' : pct >= 70 ? ' — solid work.' : ' — Learn mode will help with the misses.'}`),
        el(
          'div',
          { class: 'row wrap', style: { justifyContent: 'center', marginTop: '14px' } },
          el('button', { class: 'btn primary', onclick: () => openTestSetup(app, set) }, 'New test'),
          el('button', { class: 'btn', onclick: () => startStudy(app, set.id, 'learn') }, 'Practise in Learn'),
          el('button', { class: 'btn', onclick: () => ((app.viewState.study = null), app.go('set', { id: set.id })) }, 'Done'),
        ),
      ),
    qs.map(block),
    !s.submitted &&
      el(
        'div',
        { class: 'row', style: { justifyContent: 'center' } },
        el(
          'button',
          {
            class: 'btn primary big-btn',
            onclick: async () => {
              if (answeredN < qs.length && !(await confirmBox(`You've answered ${answeredN} of ${qs.length}. Submit anyway?`, { ok: 'Submit' }))) return;
              submit();
            },
          },
          'Submit test',
        ),
      ),
  );
}

// ------------------------------------------------------------------ Review hub
export function renderReviewHub(app) {
  const { data } = app;
  const now = new Date();
  const queue = reviewQueue(data);
  const bySet = data.sets
    .map((set) => ({ set, due: set.cards.filter((c) => c.due && new Date(c.due) <= now).length, fresh: set.cards.filter(isNew).length }))
    .sort((a, b) => b.due - a.due || b.fresh - a.fresh);
  const exams = examsSoon(data, 7);
  return el(
    'div',
    {},
    pageTitle('Review', weekStrip(app)),
    el(
      'div',
      { class: 'dash' },
      el(
        'div',
        { class: 'card review-cta' },
        el('h3', {}, '🧠 Today’s review'),
        el('div', { class: 'summary-big grad-text', style: { fontSize: '3em' } }, String(queue.length)),
        el('div', { class: 'muted' }, `cards ready — ${queue.filter((q) => q.why === 'due').length} due, ${queue.filter((q) => q.why === 'exam').length} exam-boosted, ${queue.filter((q) => q.why === 'new').length} new`),
        el('div', { class: 'row', style: { marginTop: '14px' } }, el('button', { class: 'btn primary', disabled: !queue.length, onclick: () => startStudy(app, null, 'review') }, 'Start review ▶')),
        exams.length > 0 && el('div', { class: 'small muted', style: { marginTop: '12px' } }, `🎯 Exam boost is on for ${[...new Set(exams.map((e) => app.classById(e.classId)?.name).filter(Boolean))].join(', ') || 'your upcoming tests'} — cards you haven't mastered come back early.`),
      ),
      el(
        'div',
        { class: 'card' },
        el('h3', {}, '🪐 How orbits work'),
        el('div', { class: 'orbit-explain' }, ORBITS.map((o, i) => el('div', { class: 'row small' }, el('span', { class: 'dot', style: { background: o.color } }), el('b', { style: { width: '100px' } }, o.name), el('span', { class: 'muted' }, ['never studied', 'seen, still shaky', 'recalled once or twice', 'solid — reviews spaced out', 'long-term memory'][i])))),
        el('p', { class: 'small muted', style: { marginBottom: 0 } }, 'Each correct recall pushes a card to a higher orbit and spaces out its next review (1 day → 3 → a week → a month…). Miss it and it drops back in. This spacing effect is one of the best-proven ways to remember things long-term.'),
      ),
      el(
        'div',
        { class: 'card wide' },
        el('h3', {}, 'By set'),
        bySet.length
          ? bySet.map(({ set, due, fresh }) =>
              el(
                'div',
                { class: 'row', style: { padding: '8px 0', borderBottom: '1px solid var(--line)' } },
                el('span', { class: 'dot', style: { background: classOf(app, set).color } }),
                el('div', { style: { flex: 1, cursor: 'pointer' }, onclick: () => app.go('set', { id: set.id }) }, el('b', {}, set.title), el('div', { class: 'small muted' }, `${due} due · ${fresh} new · ${mastery(set).pct}% mastered`)),
                el('div', { style: { width: '180px' } }, orbitBar(set)),
                el('button', { class: 'btn sm', disabled: !set.cards.length, onclick: () => startStudy(app, set.id, 'review', { setIds: [set.id], title: set.title }) }, 'Review'),
              ),
            )
          : el('div', { class: 'muted small' }, 'No study sets yet.'),
      ),
    ),
  );
}

// Keyboard shortcuts inside study sessions. Returns true if handled.
export function studyKey(app, e) {
  if (app.view !== 'study') return false;
  const s = app.viewState.study?.session;
  const fn = s?.keys?.[e.key];
  if (!fn) return false;
  e.preventDefault();
  fn();
  return true;
}

// Daily study stats (for the week strip in the header of Review etc.)
export function weekStrip(app) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i - 6));
  return el(
    'div',
    { class: 'week-strip' },
    days.map((d) => {
      const n = app.data.studyLog[dayKey(d)]?.cards || 0;
      return el('div', { class: `ws-day${n ? ' on' : ''}`, title: `${n} cards` }, el('span', {}, WEEKDAYS[d.getDay()][0]), el('b', {}, n ? String(n) : '·'));
    }),
  );
}

export function studyMinutes(app) {
  return fmtMinutes(Object.values(app.data.studyLog).reduce((t, d) => t + (d.minutes || 0), 0));
}
