// A practice-exam interface modelled on the College Board's Bluebook testing app: the same layout
// and tools (timer you can hide, Directions, Highlights & Notes, Calculator, Reference, Mark for
// Review, answer eliminator, question navigator, Check Your Work page, breaks, line reader), so the
// real exam feels familiar. All text, formulas and designs here are Orbit's own.
import { el, add, clear, TOUCH } from './util.js';
import { modal, toast } from './ui.js';

const ROMAN = ['I', 'II', 'III', 'IV'];
const LETTERS = 'ABCDE';

export function sectionTitle(s, i = s.sec) {
  const sec = s.sections[i];
  const mcqs = s.sections.filter((x) => x.kind === 'mcq');
  const roman = sec.kind === 'mcq' ? 'I' : ROMAN[Math.min(3, mcqs.length ? 1 : 0)];
  const parts = s.sections.filter((x) => x.kind === sec.kind);
  const part = parts.length > 1 ? `, Part ${'ABCD'[parts.indexOf(sec)]}` : '';
  return `Section ${roman}${part}: ${sec.kind === 'mcq' ? 'Multiple Choice' : 'Free Response'}`;
}

// Which tools a section gets (mirrors what the real exam allows, as far as Orbit can tell).
export function toolsFor(info, sec) {
  const text = `${sec.name} ${sec.note || ''}`;
  const mathSci = /Science/.test(info.area) || (/Math/.test(info.area) && !/Computer Science/.test(info.name));
  const calc = mathSci && !/no[- ]calculator/i.test(text);
  return { calc, ref: !!REFERENCE[refKey(info)], annotate: true };
}

const answered = (sec, it) => (sec.kind === 'mcq' ? it.given !== null && it.given !== undefined : !!it.response?.trim());

// ------------------------------------------------------------------ main render
export function renderBluebook(app, s, { info, fmtClock, submitSection, exitExam, pauseExam, user }) {
  const sec = s.sections[s.sec];
  const tools = toolsFor(info, sec);
  s.dirSeen ||= {};
  if (!s.dirSeen[s.sec]) {
    s.dirSeen[s.sec] = true;
    s.tool = 'dir';
  }
  const q = sec.items[s.q] ? s.q : 0;
  const item = sec.items[q];
  const title = sectionTitle(s);
  const left = () => (s.timed ? s.secEnds - Date.now() : null);

  // ---- timer
  if (s.timed) {
    clearInterval(s.timer);
    s.timer = setInterval(() => {
      if (app.viewState.study?.session !== s || s.phase !== 'section') return clearInterval(s.timer);
      const ms = left();
      const t = document.querySelector('.bb-time');
      if (t) t.textContent = fmtClock(ms);
      if (ms <= 5 * 60000 && !s.warned) {
        s.warned = true;
        s.hideTimer = false;
        app.render();
        toast('⏱ 5 minutes remaining in this section.', { ms: 6000 });
      }
      document.querySelector('.bb-timer')?.classList.toggle('low', ms <= 5 * 60000);
      if (ms <= 0) {
        clearInterval(s.timer);
        s.tool = null;
        s.review = false;
        app.lastActivity = Date.now(); // the section just ended — don't auto-lock right away
        submitSection();
        modal("Time's up", (m) => el('div', { class: 'stack' }, el('p', {}, `Time ran out for ${title}. Your answers were saved and the section was submitted.`), el('div', { class: 'row' }, el('span', { class: 'spacer' }), el('button', { class: 'btn primary', onclick: () => m.close() }, 'Continue'))), { center: true });
      }
    }, 500);
  }

  const toolBtn = (id, icon, label, on, onclick, disabled) => el('button', { class: `bb-tool${on ? ' on' : ''}`, 'aria-pressed': String(!!on), disabled, onclick, title: label }, el('span', { class: 'bb-ticon', 'aria-hidden': 'true' }, icon), el('span', { class: 'bb-tlabel' }, label));
  const setTool = (t) => ((s.tool = s.tool === t ? null : t), app.render());

  const header = el(
    'header',
    { class: 'bb-head' },
    el('div', { class: 'bb-hl' }, el('h1', { class: 'bb-sec' }, title), el('button', { class: 'bb-link', 'aria-expanded': String(s.tool === 'dir'), onclick: () => setTool('dir') }, 'Directions ', s.tool === 'dir' ? '▴' : '▾')),
    el(
      'div',
      { class: 'bb-hc' },
      s.timed
        ? el('div', { class: `bb-timer${left() <= 5 * 60000 ? ' low' : ''}` }, s.hideTimer ? el('span', { class: 'bb-time-hidden', 'aria-label': 'Timer hidden' }, '⏱') : el('span', { class: 'bb-time', role: 'timer', 'aria-live': 'off' }, fmtClock(left())), el('button', { class: 'bb-hide', onclick: () => ((s.hideTimer = !s.hideTimer), app.render()) }, s.hideTimer ? 'Show' : 'Hide'))
        : el('div', { class: 'bb-timer' }, el('span', { class: 'bb-time' }, 'Untimed')),
    ),
    el(
      'div',
      { class: 'bb-hr' },
      tools.annotate && toolBtn('annotate', '✎', 'Highlights & Notes', false, () => annotate(app, s, sec, item), sec.kind !== 'mcq' && !item?.prompt),
      tools.calc && toolBtn('calc', '▦', 'Calculator', s.tool === 'calc', () => setTool('calc')),
      tools.ref && toolBtn('ref', 'ƒ', 'Reference', s.tool === 'ref', () => setTool('ref')),
      toolBtn('more', '⋮', 'More', s.tool === 'more', () => setTool('more')),
    ),
  );

  // ---- main area
  let main;
  if (s.review) main = reviewPage(app, s, sec, title);
  else if (sec.kind === 'mcq') main = mcqView(app, s, sec, item, q);
  else main = frqView(app, s, sec, item, q, info);

  // ---- footer
  const isLast = q === sec.items.length - 1;
  const footer = el(
    'footer',
    { class: 'bb-foot' },
    el('div', { class: 'bb-fl' }, el('span', { class: 'bb-user' }, user)),
    el('div', { class: 'bb-fc q-nav' }, !s.review && el('button', { class: 'bb-qbtn', 'aria-expanded': String(s.tool === 'nav'), onclick: () => setTool('nav') }, `Question ${q + 1} of ${sec.items.length} `, el('span', { 'aria-hidden': 'true' }, s.tool === 'nav' ? '▾' : '▴'))),
    el(
      'div',
      { class: 'bb-fr' },
      el('button', { class: 'bb-btn', disabled: !s.review && q === 0, onclick: () => (s.review ? ((s.review = false), (s.q = sec.items.length - 1)) : (s.q = q - 1), (s.tool = s.tool === 'nav' ? null : s.tool), app.render()) }, 'Back'),
      s.review
        ? el('button', { class: 'bb-btn primary', onclick: () => confirmSubmit(app, s, sec, title, submitSection) }, s.sec < s.sections.length - 1 ? 'Submit Section' : 'Finish Exam')
        : el('button', { class: 'bb-btn primary', onclick: () => (isLast ? (s.review = true) : (s.q = q + 1), (s.tool = s.tool === 'nav' ? null : s.tool), app.render()) }, 'Next'),
    ),
  );

  // ---- keyboard
  s.keys = {};
  if (!s.review && sec.kind === 'mcq') {
    item.choices.forEach((_, i) => {
      s.keys[LETTERS[i].toLowerCase()] = () => ((item.given = i), item.out && (item.out[i] = false), app.render());
      s.keys[String(i + 1)] = s.keys[LETTERS[i].toLowerCase()];
      s.keys[LETTERS[i]] = () => crossOut(app, item, i); // Shift + letter
    });
  }
  if (!s.review) {
    s.keys.ArrowRight = () => (isLast ? (s.review = true) : (s.q = q + 1), app.render());
    s.keys.ArrowLeft = () => q > 0 && ((s.q = q - 1), app.render());
  }
  s.keys.Escape = () => s.tool && ((s.tool = null), app.render());

  return el(
    'div',
    { class: `bb${s.lineReader ? ' reading' : ''}`, lang: 'en' },
    header,
    el('div', { class: 'bb-rule', 'aria-hidden': 'true' }),
    el('div', { class: 'bb-main', role: 'region', 'aria-label': s.review ? 'Check your work' : `Question ${q + 1}`, onpointermove: s.lineReader ? (e) => moveReader(e) : null }, main, s.lineReader && el('div', { class: 'bb-reader', 'aria-hidden': 'true' }, el('div', { class: 'bb-reader-top' }), el('div', { class: 'bb-reader-win' }), el('div', { class: 'bb-reader-bot' }))),
    el('div', { class: 'bb-rule', 'aria-hidden': 'true' }),
    footer,
    s.tool === 'dir' && panel('Directions', directions(s, sec, info, tools), () => setTool('dir'), 'bb-dir'),
    s.tool === 'nav' && navigator(app, s, sec, q, title),
    s.tool === 'calc' && panel('Calculator', calculator(s), () => setTool('calc'), 'bb-calc'),
    s.tool === 'ref' && panel('Reference', reference(info), () => setTool('ref'), 'bb-ref'),
    s.tool === 'more' && moreMenu(app, s, exitExam, pauseExam),
  );
}

// ------------------------------------------------------------------ question views
function stemWithHighlights(text, hl = []) {
  if (!hl.length) return text;
  const parts = [];
  let at = 0;
  for (const h of [...hl].sort((a, b) => a.s - b.s)) {
    if (h.s < at) continue;
    if (h.s > at) parts.push(text.slice(at, h.s));
    parts.push(el('mark', { class: 'bb-mark-hl', title: h.note ? `Note: ${h.note}` : 'Highlight', 'data-s': h.s }, text.slice(h.s, h.e), h.note ? el('sup', { class: 'bb-note' }, '✎') : null));
    at = h.e;
  }
  parts.push(text.slice(at));
  return parts;
}

function mcqView(app, s, sec, item, q) {
  item.out ||= item.choices.map(() => false);
  const elim = !!s.elim;
  return el(
    'div',
    { class: 'bb-qwrap' },
    el(
      'div',
      { class: 'bb-q' },
      el(
        'div',
        { class: 'bb-qbar' },
        el('span', { class: 'bb-num' }, String(q + 1)),
        el('button', { class: `bb-markrev${item.flag ? ' on' : ''}`, 'aria-pressed': String(!!item.flag), onclick: () => ((item.flag = !item.flag), app.render()) }, el('span', { class: 'bb-bookmark', 'aria-hidden': 'true' }), item.flag ? 'Marked for Review' : 'Mark for Review'),
        el('span', { class: 'spacer' }),
        el('button', { class: `bb-abc${elim ? ' on' : ''}`, 'aria-pressed': String(elim), title: 'Cross out answer choices', 'aria-label': 'Answer eliminator: cross out answer choices', onclick: () => ((s.elim = !s.elim), app.render()) }, el('s', {}, 'ABC')),
      ),
      el('div', { class: 'bb-stem', onclick: unhighlight(app, item) }, stemWithHighlights(item.stem, item.hl)),
      el(
        'div',
        { class: 'bb-choices', role: 'radiogroup', 'aria-label': `Answer choices for question ${q + 1}` },
        item.choices.map((ch, i) =>
          el(
            'div',
            { class: `bb-crow${item.out[i] ? ' out' : ''}` },
            el(
              'button',
              { class: `bb-choice${item.given === i ? ' sel' : ''}`, role: 'radio', 'aria-checked': String(item.given === i), disabled: item.out[i], onclick: () => ((item.given = i), app.render()) },
              el('span', { class: 'bb-letter' }, LETTERS[i]),
              el('span', { class: 'bb-ctext' }, ch),
            ),
            elim && (item.out[i] ? el('button', { class: 'bb-undo', onclick: () => crossOut(app, item, i) }, 'Undo') : el('button', { class: 'bb-x', 'aria-label': `Cross out choice ${LETTERS[i]}`, onclick: () => crossOut(app, item, i) }, el('span', { class: 'bb-xl' }, LETTERS[i]))),
          ),
        ),
      ),
    ),
  );
}

function crossOut(app, item, i) {
  item.out ||= item.choices.map(() => false);
  item.out[i] = !item.out[i];
  if (item.out[i] && item.given === i) item.given = null;
  app.render();
}

function frqView(app, s, sec, item, q, info) {
  const ta = el('textarea', { class: 'frq-answer bb-editor', 'aria-label': `Response to question ${q + 1}`, spellcheck: 'false', placeholder: 'Type your response here.' }, item.response);
  const count = el('span', { class: 'bb-wc' }, wordCount(item.response));
  ta.addEventListener('input', () => {
    item.response = ta.value;
    count.textContent = wordCount(ta.value);
  });
  const handwritten = /Science/.test(info.area) || (/Math/.test(info.area) && !/Computer Science/.test(info.name));
  const split = s.split ?? 50;
  const wrap = el(
    'div',
    { class: 'bb-split', style: { gridTemplateColumns: `${split}fr 10px ${100 - split}fr` } },
    el(
      'div',
      { class: 'bb-pane bb-left' },
      el('div', { class: 'bb-qbar' }, el('span', { class: 'bb-num' }, String(q + 1)), el('button', { class: `bb-markrev${item.flag ? ' on' : ''}`, 'aria-pressed': String(!!item.flag), onclick: () => ((item.flag = !item.flag), app.render()) }, el('span', { class: 'bb-bookmark', 'aria-hidden': 'true' }), item.flag ? 'Marked for Review' : 'Mark for Review')),
      el('div', { class: 'bb-stem frq-prompt', onclick: unhighlight(app, item) }, stemWithHighlights(item.prompt, item.hl)),
      handwritten && el('p', { class: 'bb-hint' }, 'On exam day, answers for subjects like this are handwritten in a paper free-response booklet while Bluebook shows the questions. Typing here is fine for practice.'),
    ),
    el('div', { class: 'bb-divider', role: 'separator', 'aria-orientation': 'vertical', tabindex: 0, 'aria-label': 'Resize panes (arrow keys)', 'aria-valuenow': split, 'aria-valuemin': 25, 'aria-valuemax': 75, onpointerdown: (e) => dragSplit(e, app, s), onkeydown: (e) => (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && (e.preventDefault(), (s.split = Math.max(25, Math.min(75, split + (e.key === 'ArrowLeft' ? -5 : 5)))), app.render()) }, el('span', { 'aria-hidden': 'true' }, '⋮')),
    el(
      'div',
      { class: 'bb-pane bb-right' },
      el('div', { class: 'bb-edbar' }, el('button', { class: 'bb-edbtn', title: 'Undo', 'aria-label': 'Undo', onclick: () => (ta.focus(), document.execCommand?.('undo')) }, '↶'), el('button', { class: 'bb-edbtn', title: 'Redo', 'aria-label': 'Redo', onclick: () => (ta.focus(), document.execCommand?.('redo')) }, '↷'), el('span', { class: 'spacer' }), count),
      ta,
    ),
  );
  return wrap;
}

function wordCount(t = '') {
  const n = (t.trim().match(/\S+/g) || []).length;
  return `${n} word${n === 1 ? '' : 's'}`;
}

function dragSplit(e, app, s) {
  const box = e.currentTarget.parentElement.getBoundingClientRect();
  const move = (ev) => {
    s.split = Math.max(25, Math.min(75, Math.round(((ev.clientX - box.left) / box.width) * 100)));
    e.target.closest('.bb-split').style.gridTemplateColumns = `${s.split}fr 10px ${100 - s.split}fr`;
  };
  const up = () => (window.removeEventListener('pointermove', move), window.removeEventListener('pointerup', up));
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
}

// ------------------------------------------------------------------ review page & navigator
function grid(app, s, sec, q, onPick) {
  return el(
    'div',
    { class: 'bb-grid' },
    sec.items.map((it, i) =>
      el(
        'button',
        { class: `bb-cell${answered(sec, it) ? ' done' : ''}${it.flag ? ' flag' : ''}${i === q && !s.review ? ' here' : ''}`, 'aria-label': `Question ${i + 1}${answered(sec, it) ? ', answered' : ', unanswered'}${it.flag ? ', marked for review' : ''}`, onclick: () => onPick(i) },
        i === q && !s.review ? el('span', { class: 'bb-pin', 'aria-hidden': 'true' }, '⌖') : null,
        String(i + 1),
        it.flag ? el('span', { class: 'bb-flag', 'aria-hidden': 'true' }) : null,
      ),
    ),
  );
}
const legend = () => el('div', { class: 'bb-legend' }, el('span', {}, el('span', { class: 'bb-pin' }, '⌖'), ' Current'), el('span', {}, el('span', { class: 'bb-cell mini' }), ' Unanswered'), el('span', {}, el('span', { class: 'bb-flag static' }), ' For Review'));

function navigator(app, s, sec, q, title) {
  return el(
    'div',
    { class: 'bb-pop bb-navpop', role: 'dialog', 'aria-label': `${title} questions` },
    el('div', { class: 'bb-pophead' }, el('b', {}, `${title} Questions`), el('button', { class: 'bb-close', 'aria-label': 'Close', onclick: () => ((s.tool = null), app.render()) }, '✕')),
    legend(),
    grid(app, s, sec, q, (i) => ((s.q = i), (s.tool = null), app.render())),
    el('button', { class: 'bb-btn outline', onclick: () => ((s.review = true), (s.tool = null), app.render()) }, 'Go to Review Page'),
  );
}

function reviewPage(app, s, sec, title) {
  const blank = sec.items.filter((it) => !answered(sec, it)).length;
  const flagged = sec.items.filter((it) => it.flag).length;
  return el(
    'div',
    { class: 'bb-review' },
    el('h2', {}, 'Check Your Work'),
    el('p', {}, 'On the real exam you can review and change answers until you submit the section or time runs out. Click a question number to go back to it.'),
    el('p', { class: 'bb-hint' }, `${blank ? `${blank} unanswered` : 'All questions answered'}${flagged ? ` · ${flagged} marked for review` : ''}. There’s no penalty for guessing, so answer every question.`),
    el('div', { class: 'bb-card' }, el('div', { class: 'bb-pophead' }, el('b', {}, `${title} Questions`)), legend(), grid(app, s, sec, -1, (i) => ((s.review = false), (s.q = i), app.render()))),
  );
}

function confirmSubmit(app, s, sec, title, submitSection) {
  const blank = sec.items.filter((it) => !answered(sec, it)).length;
  modal(
    s.sec < s.sections.length - 1 ? 'Submit this section?' : 'Finish the exam?',
    (m) =>
      el(
        'div',
        { class: 'stack' },
        el('p', {}, blank ? `You have ${blank} unanswered question${blank > 1 ? 's' : ''} in ${title}.` : `All questions in ${title} are answered.`),
        el('p', { class: 'small muted', style: { margin: 0 } }, 'After you submit, you can’t return to this section.'),
        el('div', { class: 'row' }, el('span', { class: 'spacer' }), el('button', { class: 'btn', onclick: () => m.close() }, 'Keep working'), el('button', { class: 'btn primary', onclick: () => (m.close(), (s.review = false), submitSection()) }, s.sec < s.sections.length - 1 ? 'Submit Section' : 'Finish Exam')),
      ),
    { center: true },
  );
}

// ------------------------------------------------------------------ break screen
export function renderBreak(app, s, { fmtClock, next }) {
  s.breakEnds ||= Date.now() + 10 * 60000;
  clearInterval(s.timer);
  s.timer = setInterval(() => {
    if (app.viewState.study?.session !== s || s.phase !== 'break') return clearInterval(s.timer);
    const t = document.querySelector('.bb-break-time');
    if (t) t.textContent = fmtClock(Math.max(0, s.breakEnds - Date.now()));
  }, 500);
  const resume = () => {
    clearInterval(s.timer);
    s.breakEnds = null;
    next();
  };
  s.keys = {};
  return el(
    'div',
    { class: 'bb bb-break' },
    el(
      'div',
      { class: 'bb-break-l' },
      el('div', { class: 'bb-break-label' }, 'Remaining Break Time:'),
      el('div', { class: 'bb-break-time', role: 'timer' }, fmtClock(Math.max(0, s.breakEnds - Date.now()))),
      el('button', { class: 'bb-btn primary big', onclick: resume }, 'Resume Testing'),
    ),
    el(
      'div',
      { class: 'bb-break-r' },
      el('h2', {}, 'Practice Exam Break'),
      el('p', {}, `You’ve finished ${sectionTitle(s, s.sec - 1)}. Up next: ${sectionTitle(s)} (${s.sections[s.sec].items.length} question${s.sections[s.sec].items.length > 1 ? 's' : ''}, ${s.sections[s.sec].minutes} minutes).`),
      el('p', {}, 'On exam day the break is timed and the next section starts when you return. For practice you can resume whenever you’re ready.'),
      el('h3', {}, 'During a real break'),
      el('ul', {}, el('li', {}, 'Don’t close the app or turn off your device.'), el('li', {}, 'Don’t talk about the exam or use your phone.'), el('li', {}, 'Stretch, drink water, eat a snack. Your brain works better after a reset.')),
    ),
  );
}

// ------------------------------------------------------------------ panels
function panel(title, body, close, cls) {
  return el('div', { class: `bb-pop bb-panel ${cls}`, role: 'dialog', 'aria-label': title }, el('div', { class: 'bb-pophead' }, el('b', {}, title), el('button', { class: 'bb-close', 'aria-label': `Close ${title}`, onclick: close }, '✕')), body);
}

function directions(s, sec, info, tools) {
  const n = sec.items.length;
  const mins = sec.minutes;
  return el(
    'div',
    { class: 'bb-dirtext' },
    el('p', {}, el('b', {}, `${sectionTitle(s)}`), ` · ${n} question${n > 1 ? 's' : ''} · ${s.timed ? `${mins} minutes` : 'untimed'}`),
    sec.kind === 'mcq'
      ? el('p', {}, 'Each question or incomplete statement is followed by answer choices. Select the one that is best in each case. There is no penalty for wrong answers, so answer every question.')
      : el('p', {}, 'Read each question carefully and answer all parts. Show your reasoning and use specific evidence and course vocabulary. Responses are scored with the rubric when you finish.'),
    sec.note && el('p', { class: 'bb-hint' }, sec.note),
    el('p', {}, 'Tools: ', [tools.annotate && 'Highlights & Notes (select text, then click the tool)', tools.calc && 'Calculator', tools.ref && 'Reference', 'Mark for Review', sec.kind === 'mcq' && 'answer eliminator (ABC)', 'Line Reader (More menu)'].filter(Boolean).join(' · ')),
    !TOUCH && el('p', { class: 'small muted' }, 'Shortcuts: A–E select · Shift + A–E cross out · ← / → previous / next · Esc closes a panel.'),
  );
}

function moreMenu(app, s, exitExam, pauseExam) {
  const item = (label, onclick) => el('button', { class: 'bb-menuitem', role: 'menuitem', onclick }, label);
  return el(
    'div',
    { class: 'bb-pop bb-more', role: 'menu' },
    item(s.lineReader ? 'Turn off Line Reader' : 'Line Reader', () => ((s.lineReader = !s.lineReader), (s.tool = null), app.render())),
    item('Help', () => {
      s.tool = null;
      app.render();
      modal('Help', () => el('div', { class: 'stack small' }, el('p', {}, 'Mark for Review flags a question so it stands out in the question navigator and on the Check Your Work page.'), el('p', {}, 'Turn on ABC (answer eliminator) to cross out choices you’ve ruled out. Crossing out the selected answer clears it.'), el('p', {}, 'Highlights & Notes: select words in a question, then click the tool to highlight them and add an optional note. Click a highlight to remove it.'), el('p', {}, 'Hide the timer if it stresses you out. It comes back automatically when 5 minutes are left.'), !TOUCH && el('p', {}, 'Keyboard: A–E select · Shift+A–E cross out · ←/→ move between questions · Esc close panels.')), { center: true });
    }),
    item('Pause & exit', () => ((s.tool = null), pauseExam())),
    item('Quit exam', () => ((s.tool = null), exitExam())),
  );
}

// ------------------------------------------------------------------ highlights & notes
function annotate(app, s, sec, item) {
  const sel = window.getSelection();
  const stem = document.querySelector('.bb-stem');
  if (!sel || sel.isCollapsed || !stem || !stem.contains(sel.anchorNode) || !stem.contains(sel.focusNode)) {
    toast('Select some words in the question first, then click Highlights & Notes.');
    return;
  }
  const offset = (node, off) => {
    const r = document.createRange();
    r.selectNodeContents(stem);
    r.setEnd(node, off);
    return r.toString().replace(/✎/g, '').length;
  };
  let a = offset(sel.anchorNode, sel.anchorOffset);
  let b = offset(sel.focusNode, sel.focusOffset);
  if (a > b) [a, b] = [b, a];
  if (b - a < 1) return;
  const text = sec.kind === 'mcq' ? item.stem : item.prompt;
  item.hl = (item.hl || []).filter((h) => h.e <= a || h.s >= b);
  const h = { s: a, e: Math.min(b, text.length), note: '' };
  item.hl.push(h);
  sel.removeAllRanges();
  app.render();
  modal('Add a note (optional)', (m) => {
    const ta = el('textarea', { rows: 3, 'aria-label': 'Note', placeholder: `Note about “${text.slice(h.s, h.e).slice(0, 60)}”` });
    return el('div', { class: 'stack' }, ta, el('div', { class: 'row' }, el('button', { class: 'btn ghost', onclick: () => ((item.hl = item.hl.filter((x) => x !== h)), m.close(), app.render()) }, 'Remove highlight'), el('span', { class: 'spacer' }), el('button', { class: 'btn', onclick: () => m.close() }, 'Skip'), el('button', { class: 'btn primary', onclick: () => ((h.note = ta.value.trim()), m.close(), app.render()) }, 'Save')));
  }, { center: true });
}

// Clicking a highlight removes it.
function unhighlight(app, item) {
  return (e) => {
    const mk = e.target.closest?.('.bb-mark-hl');
    if (!mk) return;
    item.hl = (item.hl || []).filter((h) => h.s !== +mk.dataset.s);
    app.render();
  };
}

// ------------------------------------------------------------------ line reader
function moveReader(e) {
  const r = document.querySelector('.bb-reader');
  if (!r) return;
  const box = r.parentElement.getBoundingClientRect();
  r.style.setProperty('--y', `${Math.max(0, e.clientY - box.top - 30)}px`);
}

// ------------------------------------------------------------------ calculator (scientific)
// A small expression evaluator (no eval): + − × ÷ ^ ( ) !, sin cos tan asin acos atan, ln log √ abs exp, π e, ans.
export function evaluate(src, { deg = false, ans = 0 } = {}) {
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/\s+/g, '');
  let i = 0;
  const peek = () => s[i];
  const toRad = (x) => (deg ? (x * Math.PI) / 180 : x);
  const fromRad = (x) => (deg ? (x * 180) / Math.PI : x);
  const FN = { sin: (x) => Math.sin(toRad(x)), cos: (x) => Math.cos(toRad(x)), tan: (x) => Math.tan(toRad(x)), asin: (x) => fromRad(Math.asin(x)), acos: (x) => fromRad(Math.acos(x)), atan: (x) => fromRad(Math.atan(x)), ln: Math.log, log: Math.log10, sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp };
  const fact = (n) => {
    if (n < 0 || !Number.isInteger(n) || n > 170) throw new Error('Factorial needs a whole number 0–170');
    let r = 1;
    for (let k = 2; k <= n; k++) r *= k;
    return r;
  };
  const startsFactor = () => /[\d.a-z(]/i.test(peek() || '');
  function expr() {
    let v = term();
    while (peek() === '+' || peek() === '-') v = s[i++] === '+' ? v + term() : v - term();
    return v;
  }
  function term() {
    let v = power();
    for (;;) {
      if (peek() === '*' || peek() === '/') {
        const op = s[i++];
        const r = power();
        v = op === '*' ? v * r : v / r;
      } else if (startsFactor()) v *= power(); // implicit multiplication: 2pi, 3(4)
      else return v;
    }
  }
  // Negation binds looser than ^, so -2^2 = -4 (like a real calculator).
  function power() {
    if (peek() === '-') return i++, -power();
    if (peek() === '+') return i++, power();
    const b = postfix();
    if (peek() === '^') {
      i++;
      return b ** power();
    }
    return b;
  }
  function postfix() {
    let v = primary();
    while (peek() === '!') i++, (v = fact(v));
    return v;
  }
  function primary() {
    if (peek() === '(') {
      i++;
      const v = expr();
      if (peek() !== ')') throw new Error('Missing )');
      i++;
      return v;
    }
    const num = s.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
    if (num) return (i += num[0].length), parseFloat(num[0]);
    const id = s.slice(i).match(/^[a-z]+/i);
    if (id) {
      const name = id[0].toLowerCase();
      i += name.length;
      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;
      if (name === 'ans') return ans;
      if (FN[name]) {
        if (peek() === '(') {
          i++;
          const v = expr();
          if (peek() !== ')') throw new Error('Missing )');
          i++;
          return FN[name](v);
        }
        return FN[name](power());
      }
      throw new Error(`Unknown: ${name}`);
    }
    throw new Error('Check your expression');
  }
  if (!s) return ans;
  const v = expr();
  if (i < s.length) throw new Error('Check your expression');
  if (!Number.isFinite(v)) throw new Error('Undefined');
  return v;
}

const fmtNum = (v) => {
  if (Number.isInteger(v)) return String(v);
  const r = Number.parseFloat(v.toPrecision(10));
  return Math.abs(r) >= 1e10 || (Math.abs(r) < 1e-6 && r !== 0) ? r.toExponential(6) : String(r);
};

function calculator(s) {
  const c = (s.calc ||= { expr: '', out: '', deg: false, ans: 0, hist: [] });
  const input = el('input', { type: 'text', class: 'bb-calc-in', value: c.expr, 'aria-label': 'Calculator expression', autocomplete: 'off', inputmode: TOUCH ? 'none' : 'text' });
  const out = el('div', { class: 'bb-calc-out', 'aria-live': 'polite' }, c.out);
  const hist = el('div', { class: 'bb-calc-hist' }, c.hist.slice(-4).map(([e, r]) => el('div', {}, el('span', { class: 'muted' }, `${e} =`), ` ${r}`)));
  const run = () => {
    try {
      const v = evaluate(input.value, c);
      c.ans = v;
      c.out = fmtNum(v);
      c.hist.push([input.value, c.out]);
      c.expr = '';
    } catch (err) {
      c.out = err.message;
      c.expr = input.value;
    }
    refresh();
  };
  const refresh = () => {
    input.value = c.expr;
    out.textContent = c.out;
    clear(hist);
    add(hist, c.hist.slice(-4).map(([e, r]) => el('div', {}, el('span', { class: 'muted' }, `${e} =`), ` ${r}`)));
    degBtn.textContent = c.deg ? 'DEG' : 'RAD';
  };
  input.addEventListener('input', () => (c.expr = input.value));
  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') (e.preventDefault(), run());
  });
  const put = (t) => {
    const p = input.selectionStart ?? input.value.length;
    c.expr = input.value.slice(0, p) + t + input.value.slice(input.selectionEnd ?? p);
    input.value = c.expr;
    input.focus();
    input.setSelectionRange(p + t.length, p + t.length);
  };
  const degBtn = el('button', { class: 'bb-key fn', 'aria-label': 'Angle mode', onclick: () => ((c.deg = !c.deg), refresh()) }, c.deg ? 'DEG' : 'RAD');
  const ROWS = [['MODE', 'C', '(', ')', '⌫'], ['sin(', 'cos(', 'tan(', '^', '√('], ['asin(', 'acos(', 'atan(', 'x²', '!'], ['ln(', 'log(', 'π', 'e', 'ans'], ['7', '8', '9', '÷', 'abs('], ['4', '5', '6', '×', '−'], ['1', '2', '3', '+', '='], ['0', '.']];
  const LABEL = { '⌫': 'Backspace', 'x²': 'Squared', '√(': 'Square root', '^': 'Power', '!': 'Factorial', '(': 'Open parenthesis', ')': 'Close parenthesis', C: 'Clear', '−': 'Minus', '×': 'Times', '÷': 'Divide', '=': 'Equals' };
  const key = (k) => {
    if (k === 'MODE') return degBtn;
    const text = k.length > 1 ? k.replace(/\($/, '') : k;
    const act = () => {
      if (k === '=') return run();
      if (k === 'C') return (c.expr = ''), (c.out = ''), refresh();
      if (k === '⌫') return (c.expr = input.value.slice(0, -1)), refresh();
      put(k === 'x²' ? '^2' : k);
    };
    return el('button', { class: `bb-key${/^[\d.]$/.test(k) ? ' num' : k === '=' ? ' eq' : ' fn'}${k === '0' ? ' wide3' : k === '.' ? ' wide2' : ''}`, 'aria-label': LABEL[k] || text, onclick: act }, text);
  };
  const pad = el('div', { class: 'bb-calc-pad' }, ROWS.flat().map(key));
  return el('div', { class: 'bb-calcbox' }, hist, input, out, pad, el('div', { class: 'small muted' }, 'Scientific calculator. The real exam provides its own graphing calculator for subjects that allow one.'));
}

// ------------------------------------------------------------------ reference (Orbit's own formula lists)
const refKey = (info) => ({ phys1: 'physics', phys2: 'physics', physcm: 'physics', chem: 'chem', stats: 'stats', calcab: 'calc', calcbc: 'calc', precalc: 'precalc', bio: 'bio', apes: 'apes' })[info.key];
const REFERENCE = {
  physics: [['Kinematics', ['v = v₀ + at', 'x = x₀ + v₀t + ½at²', 'v² = v₀² + 2a(x − x₀)']], ['Forces & energy', ['ΣF = ma', 'f ≤ μN', 'K = ½mv²', 'U_g = mgh', 'W = Fd cos θ', 'P = W/t']], ['Momentum & rotation', ['p = mv', 'J = FΔt = Δp', 'a_c = v²/r', 'τ = rF sin θ']], ['Gravity, waves, circuits', ['F_g = Gm₁m₂/r²', 'v = fλ', 'V = IR', 'P = IV']], ['Constants', ['g = 9.8 m/s²', 'G = 6.67 × 10⁻¹¹ N·m²/kg²']]],
  chem: [['Gases', ['PV = nRT', 'R = 0.08206 L·atm/(mol·K) = 8.314 J/(mol·K)', 'STP: 273 K, 1 atm']], ['Solutions & acids', ['M = mol solute / L solution', 'pH = −log[H⁺]', 'pH + pOH = 14 (25 °C)', 'K_w = 1.0 × 10⁻¹⁴']], ['Thermo & kinetics', ['q = mcΔT', 'ΔG° = ΔH° − TΔS°', 'ΔG° = −RT ln K', 'ln[A] = −kt + ln[A]₀ (first order)']], ['Light & atoms', ['E = hν', 'c = λν', 'h = 6.626 × 10⁻³⁴ J·s', 'N_A = 6.022 × 10²³ mol⁻¹']]],
  stats: [['Describing data', ['x̄ = Σx / n', 's = √(Σ(x − x̄)² / (n − 1))', 'z = (x − μ) / σ']], ['Probability', ['P(A ∪ B) = P(A) + P(B) − P(A ∩ B)', 'P(A | B) = P(A ∩ B) / P(B)', 'Binomial: μ = np, σ = √(np(1 − p))']], ['Inference', ['Statistic ± (critical value)(standard error)', 'SE(p̂) = √(p̂(1 − p̂)/n)', 'SE(x̄) = s/√n', 'Test statistic = (statistic − parameter) / SE']], ['Regression', ['ŷ = a + bx', 'b = r(s_y / s_x)', 'residual = y − ŷ']]],
  calc: [['Derivatives', ['d/dx xⁿ = nxⁿ⁻¹', 'd/dx sin x = cos x', 'd/dx cos x = −sin x', 'd/dx eˣ = eˣ', 'd/dx ln x = 1/x', 'Product: (fg)′ = f′g + fg′', 'Chain: (f(g(x)))′ = f′(g(x))g′(x)']], ['Integrals', ['∫xⁿ dx = xⁿ⁺¹/(n + 1) + C', '∫1/x dx = ln|x| + C', '∫_a^b f′(x) dx = f(b) − f(a)']], ['Theorems', ['MVT: f′(c) = (f(b) − f(a))/(b − a)', 'Average value = (1/(b − a))∫_a^b f(x) dx']]],
  precalc: [['Functions', ['Average rate of change = (f(b) − f(a))/(b − a)', 'Exponential: f(x) = abˣ', 'log_b(x) = y ⇔ bʸ = x']], ['Trig', ['sin²θ + cos²θ = 1', 'Period of sin(bx) = 2π/|b|', 'x = r cos θ, y = r sin θ']]],
  bio: [['Quantitative skills', ['Hardy-Weinberg: p + q = 1, p² + 2pq + q² = 1', 'Chi-square: χ² = Σ(o − e)²/e', 'Mean, standard deviation, standard error = s/√n', 'Rate = change in y / change in x', 'Water potential Ψ = Ψ_P + Ψ_S']]],
  apes: [['Quantitative skills', ['Percent change = (new − old)/old × 100', 'Rule of 70: doubling time ≈ 70 / growth rate (%)', '1 kWh = 3.6 × 10⁶ J', 'Population growth rate = (birth rate − death rate)/10 (per 1,000 → %)']]],
};
function reference(info) {
  const r = REFERENCE[refKey(info)] || [];
  return el('div', { class: 'bb-refbox' }, r.map(([h, list]) => el('div', {}, el('div', { class: 'bb-refh' }, h), el('ul', {}, list.map((f) => el('li', {}, f))))), el('p', { class: 'small muted' }, 'Orbit’s own quick reference. On exam day use the official formula sheet for your subject.'));
}
