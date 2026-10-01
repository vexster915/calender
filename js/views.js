// All the screens inside Orbit, plus the item and class editors.
import { el, add, clear, uid, addDays, startOfDay, sameDay, dayKey, fromDayKey, fmtTime, fmtDate, relDay, relDue, fmtMinutes, toLocalInput, WEEKDAYS, WEEKDAYS_LONG, MONTHS_LONG, clamp, paint, tone } from './util.js';
import {
  TYPE_META, CLASS_COLORS, priority, sortByPriority, autoPlan, forecast, sessionsOn, classGrade, letter, neededFor,
  streak, meetingsOn, focusMinutesOn, logActivity, remainingMin, toICS, sampleData,
} from './logic.js';
import { TYPES } from './parse.js';
import { modal, confirmBox, toast, svg, confetti } from './ui.js';
import * as vault from './vault.js';
import { gallery, renderFiles, openSchedule } from './attach.js';
import { renderHome, renderLibrary, renderSet, renderStudy, renderReviewHub, deleteSet } from './study.js';
import { renderCourses, renderCourse } from './ap.js';
import { dueCount } from './srs.js';
import { suggestSteps, addXP, applyComfort, stopNoise } from './focus.js';
import { renderMeals } from './meals.js';

// ------------------------------------------------------------------ shared bits
const NO_CLASS = { id: null, name: 'Personal', code: 'ME', color: '#8a84b3' };
const classOf = (app, item) => app.classById(item.classId) || NO_CLASS;

function classChip(cls) {
  return el('span', { class: 'chip cls', style: { ...paint(cls.color) } }, cls.code || cls.name);
}
function priorityChip(item) {
  const p = priority(item);
  return p.level === 'none' ? null : el('span', { class: `chip ${p.level}` }, p.label);
}
function dueText(item) {
  if (!item.due) return 'No date';
  const d = new Date(item.due);
  const time = d.getHours() === 23 && d.getMinutes() === 59 ? '' : ` · ${fmtTime(d)}`;
  return `${relDay(d)}${time}`;
}

function itemRow(app, item, { showDate = true } = {}) {
  const cls = classOf(app, item);
  const subDone = item.subtasks?.filter((s) => s.done).length || 0;
  const subTotal = item.subtasks?.length || 0;
  const check = el('input', {
    type: 'checkbox',
    class: 'check',
    checked: item.done,
    'aria-label': `Mark ${item.title} done`,
    onclick: (e) => {
      e.stopPropagation();
      app.toggleDone(item, e);
    },
  });
  return el(
    'div',
    { class: `item-row${item.done ? ' done' : ''}`, onclick: () => openItemEditor(app, item) },
    check,
    el('div', { class: 'bar', style: { background: cls.color } }),
    el(
      'div',
      { class: 'body' },
      el('div', { class: 'title' }, item.title),
      el(
        'div',
        { class: 'meta' },
        el('span', {}, `${TYPE_META[item.type]?.icon || ''} ${cls.code || cls.name}`),
        showDate && el('span', {}, dueText(item)),
        item.weight ? el('span', {}, `${item.weight}%`) : null,
        !item.done && remainingMin(item) > 0 && item.type !== 'event' ? el('span', {}, `~${fmtMinutes(remainingMin(item))} left`) : null,
        item.score != null && item.maxScore ? el('span', {}, `Score ${item.score}/${item.maxScore}`) : null,
      ),
    ),
    el(
      'div',
      { class: 'right' },
      !item.done && priorityChip(item),
      !item.done && item.due && el('span', {}, relDue(item.due)),
      subTotal > 0 && el('div', { class: 'progress', title: `${subDone}/${subTotal} steps` }, el('div', { style: { width: `${(subDone / subTotal) * 100}%` } })),
    ),
  );
}

function loadColor(minutes, cap) {
  const r = minutes / (cap || 180);
  if (minutes === 0) return 'var(--line)';
  if (r < 0.5) return 'var(--chill)';
  if (r < 1) return 'var(--steady)';
  if (r < 1.3) return 'var(--high)';
  return 'var(--critical)';
}

function pageTitle(title, ...extra) {
  return el('div', { class: 'page-title' }, el('h2', {}, title), el('span', { class: 'spacer' }), ...extra);
}

// ------------------------------------------------------------------ Launchpad
function renderLaunch(app) {
  const { data } = app;
  const now = new Date();
  const open = data.items.filter((i) => !i.done);
  const weekEnd = addDays(startOfDay(now), 7);
  const dueWeek = open.filter((i) => i.due && new Date(i.due) < weekEnd && new Date(i.due) >= now).length;
  const overdue = open.filter((i) => i.due && new Date(i.due) < now);
  const weekAgo = addDays(startOfDay(now), -6);
  const doneWeek = data.items.filter((i) => i.done && i.doneAt && new Date(i.doneAt) >= weekAgo).length;
  let focusWeek = 0;
  for (let i = 0; i < 7; i++) focusWeek += focusMinutesOn(data, dayKey(addDays(now, -i)));
  const s = streak(data);

  const hero = el(
    'div',
    { class: 'hero' },
    el('div', {}, el('div', { class: 'muted' }, fmtDate(now, { year: true })), el('h2', {}, 'Your week ', el('span', { class: 'grad-text' }, 'at a glance'))),
    el(
      'div',
      { class: 'stats' },
      el('div', { class: 'stat' }, el('b', { class: 'streak' }, s ? '🔥 ' : '', String(s)), el('span', {}, 'day streak')),
      el('div', { class: 'stat' }, el('b', {}, String(dueWeek)), el('span', {}, 'due in 7d')),
      el('div', { class: 'stat' }, el('b', {}, String(doneWeek)), el('span', {}, 'done this wk')),
      el('div', { class: 'stat' }, el('b', {}, fmtMinutes(focusWeek)), el('span', {}, 'focused this wk')),
    ),
  );

  if (!data.classes.length && !data.items.length) {
    return el('div', {}, hero, welcomeCard(app));
  }

  // Mission: top 3 by priority
  const mission = sortByPriority(open.filter((i) => i.due)).slice(0, 3);
  const missionCard = el(
    'div',
    { class: 'card' },
    el('h3', {}, '🚀 Mission control', el('span', { class: 'spacer' }), el('span', { class: 'faint small', style: { textTransform: 'none', letterSpacing: 0 } }, 'ranked by urgency × weight × effort')),
    mission.length
      ? el(
          'div',
          { class: 'mission' },
          mission.map((item, i) => {
            const cls = classOf(app, item);
            const p = priority(item);
            return el(
              'div',
              { class: 'mission-item', onclick: () => openItemEditor(app, item) },
              el('div', { class: 'rank grad-text' }, String(i + 1)),
              el(
                'div',
                { class: 'body' },
                el('div', { class: 'title' }, item.title),
                el(
                  'div',
                  { class: 'row small muted', style: { marginTop: '4px', gap: '8px' } },
                  classChip(cls),
                  el('span', { class: `chip ${p.level}` }, p.label),
                  el('span', {}, `${dueText(item)} · ${relDue(item.due)}`),
                ),
              ),
              el(
                'button',
                {
                  class: 'btn sm',
                  title: 'Start a focus session on this',
                  onclick: (e) => {
                    e.stopPropagation();
                    app.focus.itemId = item.id;
                    app.go('focus');
                  },
                },
                '▶ Focus',
              ),
            );
          }),
        )
      : el('div', { class: 'empty' }, el('div', { class: 'big' }, '🌌'), 'Nothing urgent. Enjoy the calm.'),
  );

  // Today timeline
  const todayKey = dayKey(now);
  const entries = [];
  for (const { cls, meeting } of meetingsOn(data, now)) {
    const [h, m] = meeting.start.split(':').map(Number);
    const [eh, em] = meeting.end.split(':').map(Number);
    const start = new Date(now);
    start.setHours(h, m, 0, 0);
    const end = new Date(now);
    end.setHours(eh, em, 0, 0);
    entries.push({ at: start, end, color: cls.color, node: el('div', { class: 'what' }, el('b', {}, cls.name), el('div', { class: 'small muted' }, [meeting.start + '–' + meeting.end, cls.room].filter(Boolean).join(' · '))) });
  }
  for (const item of data.items.filter((i) => i.due && sameDay(new Date(i.due), now))) {
    const cls = classOf(app, item);
    entries.push({
      at: new Date(item.due),
      color: cls.color,
      node: el(
        'div',
        { class: 'what', style: { cursor: 'pointer' }, onclick: () => openItemEditor(app, item) },
        el('b', { style: item.done ? { textDecoration: 'line-through', opacity: 0.5 } : {} }, `${TYPE_META[item.type].icon} ${item.title}`),
        el('div', { class: 'small muted' }, `${item.type === 'event' ? 'Event' : 'Due'} · ${cls.code || cls.name}`),
      ),
    });
  }
  entries.sort((a, b) => a.at - b.at);
  const sessions = sessionsOn(data, todayKey).filter(({ item }) => !item.done);

  const todayCard = el(
    'div',
    { class: 'card' },
    el(
      'h3',
      {},
      '☀️ Today',
      el('span', { class: 'spacer' }),
      app.data.attachments.some((a) => a.kind === 'schedule')
        ? el('button', { class: 'btn sm', style: { textTransform: 'none', letterSpacing: 0 }, onclick: () => openSchedule(app) }, '📷 My schedule')
        : el('button', { class: 'btn sm ghost', style: { textTransform: 'none', letterSpacing: 0 }, onclick: () => app.go('files', { uploadKind: 'schedule' }) }, '📷 Add schedule screenshot'),
    ),
    entries.length
      ? el(
          'div',
          { class: 'timeline' },
          entries.map((e) => {
            const isNow = e.end ? now >= e.at && now <= e.end : false;
            const node = el('div', { class: `tl-item${isNow ? ' now' : ''}` }, el('div', { class: 'time' }, fmtTime(e.at)), e.node);
            node.style.setProperty('--tl-color', e.color);
            if (!e.end && e.at < now) node.style.opacity = 0.55;
            return node;
          }),
        )
      : el('div', { class: 'muted small' }, 'No classes or deadlines today.'),
    el('div', { class: 'section-h', style: { margin: '16px 0 8px' } }, `Study blocks · ${fmtMinutes(sessions.reduce((s, x) => s + (x.session.done ? 0 : x.session.minutes), 0))} left`),
    sessions.length
      ? el('div', { class: 'stack', style: { gap: '6px' } }, sessions.map(({ item, session }) => sessionRow(app, item, session)))
      : el('div', { class: 'muted small' }, 'No study sessions planned today. Add an estimate to an assignment and Orbit will plan them for you.'),
  );

  // Forecast
  const fc = forecast(data, 14, now);
  const cap = data.settings.dailyCapMin;
  const max = Math.max(cap * 1.4, ...fc.map((d) => d.minutes));
  const forecastCard = el(
    'div',
    { class: 'card wide' },
    el('h3', {}, '📈 Workload forecast', el('span', { class: 'spacer' }), el('span', { class: 'faint small', style: { textTransform: 'none', letterSpacing: 0 } }, `daily capacity ${fmtMinutes(cap)}`)),
    el(
      'div',
      { class: 'forecast' },
      fc.map((d, i) =>
        el(
          'div',
          { class: 'fc-col', title: `${fmtDate(d.date)}: ${fmtMinutes(d.minutes)} of work${d.deadlines.length ? `, ${d.deadlines.length} due` : ''}`, onclick: () => app.go('month', { month: d.date.getMonth(), year: d.date.getFullYear(), selected: d.key }) },
          el('div', { class: 'fc-bar', style: { height: `${clamp((d.minutes / max) * 100, 3, 100)}%`, background: loadColor(d.minutes, cap) } }, d.deadlines.length ? el('span', { class: 'dl' }, '◆'.repeat(Math.min(3, d.deadlines.length))) : null),
          el('div', { class: `fc-lbl${i === 0 ? ' today' : ''}` }, WEEKDAYS[d.date.getDay()].slice(0, 2), el('br'), String(d.date.getDate())),
        ),
      ),
    ),
    el(
      'div',
      { class: 'fc-legend' },
      [['var(--chill)', 'Light'], ['var(--steady)', 'Balanced'], ['var(--high)', 'Heavy'], ['var(--critical)', 'Overloaded']].map(([c, l]) => el('span', {}, el('i', { style: { background: c } }), l)),
      el('span', {}, el('span', { style: { color: 'var(--accent-2)' } }, '◆'), ' deadline'),
      el('span', { class: 'spacer' }),
      el('span', {}, 'Tip: heavy day ahead? Open the item and hit “Auto-plan” to spread it out.'),
    ),
  );

  // Up next (7 days)
  const upcoming = open.filter((i) => i.due && new Date(i.due) >= now && new Date(i.due) < weekEnd).sort((a, b) => new Date(a.due) - new Date(b.due));
  const upCard = el(
    'div',
    { class: 'card' },
    el('h3', {}, '🗓 Next 7 days'),
    upcoming.length ? upcoming.slice(0, 8).map((i) => itemRow(app, i)) : el('div', { class: 'muted small' }, 'Nothing due this week.'),
    upcoming.length > 8 && el('button', { class: 'btn sm ghost', onclick: () => app.go('tasks') }, `+${upcoming.length - 8} more →`),
  );

  const overdueCard =
    overdue.length > 0 &&
    el('div', { class: 'card', style: { borderColor: 'rgba(255,93,115,0.4)' } }, el('h3', { style: { color: 'var(--bad)' } }, `⚠ Overdue (${overdue.length})`), overdue.map((i) => itemRow(app, i)));

  return el('div', {}, hero, el('div', { class: 'dash' }, missionCard, todayCard, forecastCard, overdueCard || null, upCard));
}

function sessionRow(app, item, session, { showItem = true } = {}) {
  const cls = classOf(app, item);
  const check = el('input', {
    type: 'checkbox',
    class: 'check sq',
    checked: session.done,
    'aria-label': 'Mark study block done',
    onclick: (e) => {
      e.stopPropagation();
      toggleSession(app, item, session);
      if (session.done) confetti(e.clientX, e.clientY, 12);
      app.commit();
    },
  });
  return el(
    'div',
    { class: `session-row${session.done ? ' done' : ''}` },
    check,
    el('div', { class: 'bar', style: { width: '4px', alignSelf: 'stretch', borderRadius: '4px', background: cls.color } }),
    el(
      'div',
      { style: { flex: 1, minWidth: 0, cursor: 'pointer' }, onclick: () => openItemEditor(app, item) },
      showItem ? el('div', { style: { fontWeight: 600 } }, item.title) : el('div', { style: { fontWeight: 600 } }, relDay(fromDayKey(session.day))),
      el('div', { class: 'small muted' }, `${fmtMinutes(session.minutes)} · ${showItem ? `${cls.code || cls.name} · due ${relDay(new Date(item.due))}` : fmtDate(fromDayKey(session.day))}`),
    ),
    showItem &&
      !session.done &&
      el(
        'button',
        {
          class: 'btn sm',
          onclick: () => {
            app.focus.itemId = item.id;
            app.go('focus');
          },
        },
        '▶',
      ),
  );
}

function toggleSession(app, item, session) {
  session.done = !session.done;
  item.spentMin = Math.max(0, (item.spentMin || 0) + (session.done ? session.minutes : -session.minutes));
  if (session.done) logActivity(app.data);
}

function welcomeCard(app) {
  return el(
    'div',
    { class: 'card', style: { padding: '30px' } },
    el('h2', { style: { marginBottom: '8px' } }, 'Welcome to your orbit 🪐'),
    el('p', { class: 'muted', style: { maxWidth: '640px' } }, 'Orbit plans your work for you. Add your classes, then drop in assignments with the quick-add bar. Orbit ranks what matters most, splits big work into study sessions on your lightest days, and uses spaced repetition for exams.'),
    el(
      'div',
      { class: 'grid-3', style: { margin: '20px 0' } },
      [
        ['1', 'Add your classes', 'Colour-coded, with meeting times and grades.'],
        ['2', 'Quick-add work', 'Type "Essay fri #eng ~3h 15%" and hit Enter.'],
        ['3', 'Follow the plan', 'Check off study blocks, use Focus mode, keep your streak.'],
      ].map(([n, t, d]) => el('div', { class: 'stat', style: { padding: '16px' } }, el('b', { class: 'grad-text' }, n), el('div', { style: { fontWeight: 700, margin: '4px 0' } }, t), el('div', { class: 'small muted' }, d))),
    ),
    el(
      'div',
      { class: 'row wrap' },
      el('button', { class: 'btn primary', onclick: () => openClassEditor(app, null) }, '+ Add a class'),
      el(
        'button',
        {
          class: 'btn',
          onclick: () => {
            sampleData(app.data);
            app.commit();
            toast('Sample semester loaded — delete anything you like.');
          },
        },
        '✨ Try with a sample semester',
      ),
    ),
  );
}

// ------------------------------------------------------------------ Horizon (timeline lanes)
function renderHorizon(app) {
  const st = (app.viewState.horizon ||= { offset: 0, sessions: true });
  const now = new Date();
  const start = addDays(startOfDay(now), st.offset * 7);
  const DAYS = 21;
  const days = Array.from({ length: DAYS }, (_, i) => addDays(start, i));
  const keys = days.map(dayKey);
  const lanes = [...app.data.classes, NO_CLASS];
  const fc = forecast(app.data, 60, now);
  const loadByKey = new Map(fc.map((d) => [d.key, d.minutes]));

  const grid = el('div', { class: 'hz-grid', style: { gridTemplateColumns: `150px repeat(${DAYS}, 124px)` } });
  add(grid, el('div', { class: 'hz-lane', style: { minHeight: 'auto' } }, el('span', { class: 'muted small' }, 'Class')));
  days.forEach((d, i) => {
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const load = loadByKey.get(keys[i]) || 0;
    add(grid, 
      el(
        'div',
        { class: `hz-head${sameDay(d, now) ? ' today' : ''}${weekend ? ' weekend' : ''}` },
        WEEKDAYS[d.getDay()],
        el('b', {}, String(d.getDate())),
        el('div', { class: 'hz-load', title: `${fmtMinutes(load)} planned`, style: { background: loadColor(load, app.data.settings.dailyCapMin), marginTop: '6px' } }),
      ),
    );
  });

  let anything = false;
  for (const lane of lanes) {
    const laneItems = app.data.items.filter((i) => (i.classId || null) === lane.id);
    if (lane === NO_CLASS && !laneItems.length) continue;
    add(grid, el('div', { class: 'hz-lane' }, el('span', { class: 'sw', style: { background: lane.color } }), el('span', {}, lane.name)));
    days.forEach((d, i) => {
      const weekend = d.getDay() === 0 || d.getDay() === 6;
      const cell = el('div', { class: `hz-cell${weekend ? ' weekend' : ''}` });
      for (const item of laneItems) {
        if (item.due && dayKey(item.due) === keys[i]) {
          anything = true;
          add(cell, 
            el(
              'div',
              { class: `hz-pill${item.done ? ' done' : ''}`, style: { ...paint(lane.color) }, title: `${item.title} — ${dueText(item)}`, onclick: () => openItemEditor(app, item) },
              `${TYPE_META[item.type].icon} ${item.title}`,
            ),
          );
        }
        if (st.sessions && !item.done) {
          for (const s of item.plan || []) {
            if (s.day === keys[i] && !s.done) {
              anything = true;
              add(cell, 
                el('div', { class: 'hz-pill session', style: { color: lane.color }, title: `Study: ${item.title} (${fmtMinutes(s.minutes)})`, onclick: () => openItemEditor(app, item) }, `${fmtMinutes(s.minutes)} · ${item.title}`),
              );
            }
          }
        }
      }
      add(grid, cell);
    });
  }

  const rangeLabel = `${fmtDate(days[0])} – ${fmtDate(days[DAYS - 1])}`;
  return el(
    'div',
    {},
    pageTitle(
      'Horizon',
      el('span', { class: 'muted' }, rangeLabel),
      el(
        'div',
        { class: 'seg' },
        el('button', { onclick: () => app.go('horizon', { offset: st.offset - 1 }), 'aria-label': 'Previous week' }, '◀'),
        el('button', { class: st.offset === 0 ? 'on' : '', onclick: () => app.go('horizon', { offset: 0 }) }, 'Now'),
        el('button', { onclick: () => app.go('horizon', { offset: st.offset + 1 }), 'aria-label': 'Next week' }, '▶'),
      ),
      el('div', { class: 'seg' }, el('button', { class: st.sessions ? 'on' : '', onclick: () => app.go('horizon', { sessions: !st.sessions }) }, 'Study blocks')),
    ),
    el('p', { class: 'muted small', style: { marginTop: '-8px' } }, 'Three weeks, one lane per class. Solid pills are deadlines; dashed ones are the study sessions Orbit planned. The bar under each date shows how heavy that day is.'),
    el('div', { class: 'horizon' }, grid),
    !anything && el('div', { class: 'empty' }, 'Nothing in this window yet.'),
  );
}

// ------------------------------------------------------------------ Month (heat map)
function renderMonth(app) {
  const now = new Date();
  const st = (app.viewState.month ||= { month: now.getMonth(), year: now.getFullYear(), selected: dayKey(now) });
  const first = new Date(st.year, st.month, 1);
  const gridStart = addDays(first, -first.getDay());
  const fc = forecast(app.data, 120, addDays(gridStart, 0) < now ? now : gridStart);
  const load = new Map(fc.map((d) => [d.key, d.minutes]));
  const cap = app.data.settings.dailyCapMin;
  const byDay = new Map();
  for (const it of app.data.items) {
    if (!it.due) continue;
    const k = dayKey(it.due);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(it);
  }

  const shift = (n) => {
    const d = new Date(st.year, st.month + n, 1);
    app.go('month', { month: d.getMonth(), year: d.getFullYear() });
  };

  const grid = el('div', { class: 'month' }, WEEKDAYS.map((d) => el('div', { class: 'dow' }, d)));
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    const k = dayKey(d);
    const items = (byDay.get(k) || []).sort((a, b) => a.done - b.done || new Date(a.due) - new Date(b.due));
    const m = load.get(k) || 0;
    const heat = m ? el('div', { class: 'heat', style: { background: loadColor(m, cap), opacity: clamp(0.08 + (m / cap) * 0.22, 0.08, 0.35) } }) : null;
    const cell = el(
      'div',
      {
        class: `mday${d.getMonth() !== st.month ? ' out' : ''}${sameDay(d, now) ? ' today' : ''}${st.selected === k ? ' sel' : ''}`,
        onclick: () => app.go('month', { selected: k }),
        style: { isolation: 'isolate' },
      },
      heat,
      el('div', { class: 'n' }, String(d.getDate())),
      items.slice(0, 3).map((it) => el('div', { class: `ev${it.done ? ' done' : ''}`, style: paint(classOf(app, it).color) }, it.title)),
      items.length > 3 && el('div', { class: 'more' }, `+${items.length - 3} more`),
    );
    add(grid, cell);
  }

  // Day detail panel
  const sel = fromDayKey(st.selected);
  const selItems = (byDay.get(st.selected) || []).sort((a, b) => new Date(a.due) - new Date(b.due));
  const selSessions = sessionsOn(app.data, st.selected).filter(({ item }) => !item.done);
  const meetings = meetingsOn(app.data, sel);
  const panel = el(
    'div',
    { class: 'card', style: { alignSelf: 'start' } },
    el('h3', {}, relDay(sel) === fmtDate(sel) ? WEEKDAYS_LONG[sel.getDay()] : relDay(sel)),
    el('div', { style: { fontWeight: 700, fontSize: '1.2em', marginTop: '-6px', marginBottom: '12px' } }, fmtDate(sel, { year: true })),
    el('div', { class: 'section-h' }, 'Due'),
    selItems.length ? selItems.map((i) => itemRow(app, i, { showDate: false })) : el('div', { class: 'muted small', style: { padding: '6px 0' } }, 'Nothing due.'),
    el('div', { class: 'section-h', style: { marginTop: '12px' } }, 'Study blocks'),
    selSessions.length ? el('div', { class: 'stack', style: { gap: '6px', marginTop: '6px' } }, selSessions.map(({ item, session }) => sessionRow(app, item, session))) : el('div', { class: 'muted small', style: { padding: '6px 0' } }, 'None planned.'),
    meetings.length > 0 && el('div', { class: 'section-h', style: { marginTop: '12px' } }, 'Classes'),
    meetings.map(({ cls, meeting }) => el('div', { class: 'row small', style: { padding: '4px 0' } }, el('span', { class: 'chip cls', style: { ...paint(cls.color) } }, cls.code || cls.name), `${meeting.start}–${meeting.end}`, cls.room && el('span', { class: 'muted' }, cls.room))),
    el(
      'button',
      {
        class: 'btn sm primary',
        style: { marginTop: '14px' },
        onclick: () => {
          const due = new Date(sel);
          due.setHours(23, 59, 0, 0);
          openItemEditor(app, null, { isNew: true, due: due.toISOString() });
        },
      },
      '+ Add on this day',
    ),
  );

  return el(
    'div',
    {},
    pageTitle(
      `${MONTHS_LONG[st.month]} ${st.year}`,
      el(
        'div',
        { class: 'seg' },
        el('button', { onclick: () => shift(-1), 'aria-label': 'Previous month' }, '◀'),
        el('button', { onclick: () => app.go('month', { month: now.getMonth(), year: now.getFullYear(), selected: dayKey(now) }) }, 'Today'),
        el('button', { onclick: () => shift(1), 'aria-label': 'Next month' }, '▶'),
      ),
    ),
    el('div', { class: 'month-layout' }, el('div', {}, grid, el('p', { class: 'faint small' }, 'Day tint = how much work Orbit expects that day.')), panel),
  );
}

// ------------------------------------------------------------------ Tasks
function renderTasks(app) {
  const st = (app.viewState.tasks ||= { filter: 'upcoming', classId: 'all', sort: 'priority', q: '', type: 'all' });
  const now = new Date();
  let items = app.data.items.slice();
  if (st.filter === 'upcoming') items = items.filter((i) => !i.done);
  if (st.filter === 'overdue') items = items.filter((i) => !i.done && i.due && new Date(i.due) < now);
  if (st.filter === 'done') items = items.filter((i) => i.done);
  if (st.classId !== 'all') items = items.filter((i) => (i.classId || 'none') === st.classId);
  if (st.type !== 'all') items = items.filter((i) => i.type === st.type);
  if (st.q) {
    const q = st.q.toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(q) || (i.notes || '').toLowerCase().includes(q));
  }

  const list = el('div', {});
  if (st.sort === 'priority' && st.filter !== 'done') {
    const sorted = sortByPriority(items.filter((i) => i.due));
    const groups = { overdue: [], critical: [], high: [], steady: [], chill: [], none: [] };
    for (const i of sorted) groups[priority(i).level].push(i);
    groups.none.push(...items.filter((i) => !i.due));
    const names = { overdue: 'Overdue', critical: 'Critical — do these now', high: 'High', steady: 'Steady', chill: 'Chill', none: 'No due date' };
    for (const [k, arr] of Object.entries(groups)) {
      if (!arr.length) continue;
      add(list, el('div', { class: 'group-h' }, `${names[k]} · ${arr.length}`), ...arr.map((i) => itemRow(app, i)));
    }
  } else {
    const sorted = items.sort((a, b) => (st.filter === 'done' ? new Date(b.doneAt || b.due) - new Date(a.doneAt || a.due) : new Date(a.due || 8.64e15) - new Date(b.due || 8.64e15)));
    let last = null;
    for (const i of sorted) {
      const g = i.due ? relDay(new Date(i.due)) : 'No due date';
      if (g !== last) add(list, el('div', { class: 'group-h' }, g));
      last = g;
      add(list, itemRow(app, i));
    }
  }
  if (!items.length) add(list, el('div', { class: 'empty' }, el('div', { class: 'big' }, '✨'), st.filter === 'upcoming' ? 'All clear!' : 'Nothing here.'));

  const search = el('input', { type: 'search', placeholder: 'Search…', 'aria-label': 'Search tasks', value: st.q });
  search.addEventListener('input', () => {
    st.q = search.value;
    const pos = search.selectionStart;
    app.render();
    const s = document.querySelector('.filters input[type=search]');
    s?.focus();
    s?.setSelectionRange(pos, pos);
  });

  const select = (value, options, onchange, label) => {
    const s = el('select', { 'aria-label': label }, options.map(([v, l]) => el('option', { value: v }, l)));
    s.value = value;
    s.addEventListener('change', () => onchange(s.value));
    return s;
  };

  return el(
    'div',
    {},
    pageTitle('Tasks', el('span', { class: 'muted' }, `${app.data.items.filter((i) => !i.done).length} open`)),
    el(
      'div',
      { class: 'filters' },
      el('div', { class: 'seg' }, [['upcoming', 'Open'], ['overdue', 'Overdue'], ['done', 'Done'], ['all', 'All']].map(([v, l]) => el('button', { class: st.filter === v ? 'on' : '', onclick: () => app.go('tasks', { filter: v }) }, l))),
      select(st.classId, [['all', 'All classes'], ...app.data.classes.map((c) => [c.id, c.name]), ['none', 'Personal']], (v) => app.go('tasks', { classId: v }), 'Filter by class'),
      select(st.type, [['all', 'All types'], ...TYPES.map((t) => [t, TYPE_META[t].label])], (v) => app.go('tasks', { type: v }), 'Filter by type'),
      select(st.sort, [['priority', 'Sort: priority'], ['due', 'Sort: due date']], (v) => app.go('tasks', { sort: v }), 'Sort order'),
      search,
    ),
    el('div', { class: 'card', style: { padding: '8px' } }, list),
  );
}

// ------------------------------------------------------------------ Classes
function gradeRing(pct, color) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const v = pct == null ? 0 : clamp(pct, 0, 100);
  return svg(
    'svg',
    { viewBox: '0 0 64 64', class: 'grade-ring' },
    svg('circle', { cx: 32, cy: 32, r, fill: 'none', stroke: 'rgba(128,128,160,0.2)', 'stroke-width': 6 }),
    svg('circle', { cx: 32, cy: 32, r, fill: 'none', stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': `${(v / 100) * c} ${c}`, transform: 'rotate(-90 32 32)' }),
    svg('text', { x: 32, y: 37, 'text-anchor': 'middle', 'font-size': 15 }, letter(pct)),
  );
}

function shotCount(app, classId) {
  const n = app.data.attachments.filter((a) => a.classId === classId).length;
  return n ? el('span', { class: 'muted' }, ` · 📎 ${n}`) : null;
}

function renderClasses(app) {
  const { data } = app;
  const cards = data.classes.map((c) => {
    const g = classGrade(data, c.id);
    const open = data.items.filter((i) => i.classId === c.id && !i.done);
    const next = open.filter((i) => i.due).sort((a, b) => new Date(a.due) - new Date(b.due))[0];
    const need = neededFor(data, c.id, 90);
    return el(
      'div',
      { class: 'card class-card', onclick: () => openClassEditor(app, c) },
      el('div', { class: 'band', style: { background: c.color } }),
      el(
        'div',
        { class: 'row', style: { alignItems: 'flex-start' } },
        el(
          'div',
          { style: { flex: 1, minWidth: 0 } },
          el('div', { class: 'code', style: { color: tone(c.color) } }, c.code || ''),
          el('h3', { class: 'class-name' }, c.name),
          el('div', { class: 'small muted' }, [c.teacher, c.room].filter(Boolean).join(' · ') || '—'),
          el('div', { class: 'small muted', style: { marginTop: '4px' } }, (c.meetings || []).length ? c.meetings.map((m) => `${WEEKDAYS[m.day]} ${m.start}`).join(', ') : 'No meeting times'),
        ),
        el('div', { style: { textAlign: 'center' } }, gradeRing(g?.pct, c.color), el('div', { class: 'small muted' }, g ? `${g.pct.toFixed(1)}%` : 'no grades')),
      ),
      el(
        'div',
        { class: 'small', style: { marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--line)' } },
        el('div', {}, el('b', {}, String(open.length)), ' open', shotCount(app, c.id), next ? el('span', { class: 'muted' }, ` · next: ${next.title} (${relDay(new Date(next.due))})`) : null),
        need && el('div', { class: 'muted', style: { marginTop: '4px' } }, need.needed <= 0 ? '🎯 You\'ve locked in an A− or better.' : need.needed > 100 ? '🎯 A 90% is out of reach — aim to maximise what\'s left.' : `🎯 Need ${need.needed.toFixed(0)}% avg on the remaining ${need.remainingWeight}% to reach 90%.`),
      ),
    );
  });

  // Weekly schedule (Mon–Fri, 7am–7pm)
  const H0 = 7;
  const H1 = 19;
  const height = 480;
  const y = (t) => {
    const [h, m] = t.split(':').map(Number);
    return ((h + m / 60 - H0) / (H1 - H0)) * height;
  };
  const hasMeetings = data.classes.some((c) => c.meetings?.length);
  const weekends = data.classes.some((c) => c.meetings?.some((m) => m.day === 0 || m.day === 6));
  const dayList = weekends ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
  const sched = el('div', { class: 'week-sched', style: { gridTemplateColumns: `50px repeat(${dayList.length}, 1fr)` } });
  add(sched, el('div'), ...dayList.map((d) => el('div', { class: 'ws-head' }, WEEKDAYS[d])));
  const hours = el('div', { class: 'ws-hours' });
  for (let h = H0; h <= H1; h += 2) add(hours, el('span', { style: { top: `${y(`${h}:00`)}px` } }, fmtTime(new Date(2000, 0, 1, h))));
  add(sched, hours);
  for (const d of dayList) {
    const col = el('div', { class: 'ws-col' });
    for (const c of data.classes) {
      for (const m of c.meetings || []) {
        if (m.day !== d) continue;
        const top = clamp(y(m.start), 0, height);
        const bottom = clamp(y(m.end), 0, height);
        add(col, el('div', { class: 'ws-block', style: { top: `${top}px`, height: `${Math.max(18, bottom - top)}px`, ...paint(c.color) }, title: `${c.name} ${m.start}–${m.end}`, onclick: () => openClassEditor(app, c) }, c.code || c.name));
      }
    }
    add(sched, col);
  }

  return el(
    'div',
    {},
    pageTitle('Classes', el('button', { class: 'btn primary', onclick: () => openClassEditor(app, null) }, '+ Add class')),
    data.classes.length
      ? el('div', { class: 'class-grid' }, cards)
      : el('div', { class: 'card empty' }, el('div', { class: 'big' }, '🎒'), 'No classes yet.', el('div', { style: { marginTop: '12px' } }, el('button', { class: 'btn primary', onclick: () => openClassEditor(app, null) }, '+ Add your first class'))),
    hasMeetings && el('div', { class: 'card', style: { marginTop: '16px' } }, el('h3', {}, '🗓 Weekly schedule'), sched),
  );
}

export function openClassEditor(app, cls) {
  const isNew = !cls;
  const draft = cls ? structuredClone(cls) : { id: uid(), name: '', code: '', color: CLASS_COLORS[app.data.classes.length % CLASS_COLORS.length], teacher: '', room: '', meetings: [] };
  const prevPaste = app.pasteTarget;
  modal(isNew ? 'New class' : 'Edit class', (ctl) => {
    const bind = (key, attrs = {}) => {
      const input = el('input', { type: 'text', value: draft[key] || '', ...attrs });
      input.addEventListener('input', () => (draft[key] = input.value));
      return input;
    };
    const swatches = el(
      'div',
      { class: 'row wrap', style: { gap: '6px' } },
      CLASS_COLORS.map((c) =>
        el('button', {
          type: 'button',
          'aria-label': `Colour ${c}`,
          style: { width: '28px', height: '28px', borderRadius: '50%', background: c, border: draft.color === c ? '3px solid var(--text)' : '2px solid transparent', cursor: 'pointer' },
          onclick: () => {
            draft.color = c;
            ctl.rebuild();
          },
        }),
      ),
      (() => {
        const pick = el('input', { type: 'color', value: draft.color, 'aria-label': 'Custom colour' });
        pick.addEventListener('change', () => {
          draft.color = pick.value;
          ctl.rebuild();
        });
        return pick;
      })(),
    );
    const meetingRows = draft.meetings.map((m, idx) => {
      const day = el('select', {}, WEEKDAYS_LONG.map((d, i) => el('option', { value: i }, d)));
      day.value = m.day;
      day.addEventListener('change', () => (m.day = parseInt(day.value, 10)));
      const start = el('input', { type: 'time', value: m.start });
      start.addEventListener('change', () => (m.start = start.value));
      const end = el('input', { type: 'time', value: m.end });
      end.addEventListener('change', () => (m.end = end.value));
      return el(
        'div',
        { class: 'meeting-row' },
        day,
        start,
        end,
        el(
          'button',
          {
            class: 'btn icon ghost',
            'aria-label': 'Remove meeting time',
            onclick: () => {
              draft.meetings.splice(idx, 1);
              ctl.rebuild();
            },
          },
          '✕',
        ),
      );
    });
    const err = el('div', { class: 'error' });
    return el(
      'div',
      { class: 'stack' },
      el('div', { class: 'grid-2' }, el('label', { class: 'field' }, el('span', {}, 'Class name'), bind('name', { placeholder: 'Biology' })), el('label', { class: 'field' }, el('span', {}, 'Short code (for #tags)'), bind('code', { placeholder: 'BIO', maxlength: 10 }))),
      el('div', { class: 'grid-2' }, el('label', { class: 'field' }, el('span', {}, 'Teacher'), bind('teacher', { placeholder: 'Dr. Reyes' })), el('label', { class: 'field' }, el('span', {}, 'Room'), bind('room', { placeholder: 'Sci 204' }))),
      el('div', { class: 'field' }, el('span', {}, 'Colour'), swatches),
      el('div', { class: 'section-h' }, 'Meeting times'),
      meetingRows.length ? meetingRows : el('div', { class: 'muted small' }, 'Add when this class meets so it shows on your Today timeline.'),
      el(
        'button',
        {
          class: 'btn sm',
          style: { alignSelf: 'flex-start' },
          onclick: () => {
            const prev = draft.meetings[draft.meetings.length - 1];
            draft.meetings.push(prev ? { ...prev, day: (prev.day % 6) + 1 } : { day: 1, start: '09:00', end: '09:50' });
            ctl.rebuild();
          },
        },
        '+ Add meeting time',
      ),
      !isNew && el('div', { class: 'section-h' }, 'Screenshots'),
      !isNew &&
        gallery(app, {
          filter: (a) => a.classId === cls.id && !a.itemId,
          meta: () => ({ kind: 'notes', classId: cls.id }),
          empty: 'Syllabus, notes, handouts — keep them with the class.',
          compact: true,
        }),
      err,
      el(
        'div',
        { class: 'row' },
        !isNew &&
          el(
            'button',
            {
              class: 'btn danger',
              onclick: async () => {
                const count = app.data.items.filter((i) => i.classId === cls.id).length;
                if (!(await confirmBox(`Delete ${cls.name}? ${count ? `Its ${count} item(s) will move to Personal.` : ''}`, { ok: 'Delete class', danger: true }))) return;
                ctl.close();
                app.data.classes = app.data.classes.filter((c) => c.id !== cls.id);
                for (const a of app.data.attachments) if (a.classId === cls.id) a.classId = null;
                for (const i of app.data.items) if (i.classId === cls.id) i.classId = null;
                app.commit();
              },
            },
            'Delete',
          ),
        el('span', { class: 'spacer' }),
        el('button', { class: 'btn', onclick: () => ctl.close() }, 'Cancel'),
        el(
          'button',
          {
            class: 'btn primary',
            onclick: () => {
              draft.name = draft.name.trim();
              draft.code = draft.code.trim().toUpperCase().replace(/\s+/g, '');
              if (!draft.name) {
                err.textContent = 'Give the class a name.';
                return;
              }
              if (!draft.code) draft.code = draft.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
              if (isNew) app.data.classes.push(draft);
              else Object.assign(cls, draft);
              ctl.close();
              app.commit();
            },
          },
          isNew ? 'Add class' : 'Save',
        ),
      ),
    );
  }, { onClose: () => (app.pasteTarget = prevPaste) });
}

// Exams and quizzes show the study sets for their class, so prep is one click away.
function studyLinks(app, draft, ctl) {
  const sets = app.data.sets.filter((s) => draft.classId && s.classId === draft.classId);
  return el(
    'div',
    { class: 'study-links' },
    el('span', { class: 'small muted' }, '🧠 Study for this:'),
    sets.length
      ? sets.map((s) => el('button', { class: 'btn sm', onclick: () => (ctl.close(), app.go('set', { id: s.id })) }, s.title))
      : el('button', { class: 'btn sm', onclick: () => (ctl.close(), app.go('library')) }, '+ Make a study set'),
  );
}

// ------------------------------------------------------------------ Item editor
export function openItemEditor(app, item, opts = {}) {
  const isNew = !!opts.isNew;
  const base = item || {
    id: uid(),
    title: '',
    type: 'assignment',
    classId: app.data.classes[0]?.id || null,
    due:
      opts.due ||
      (() => {
        const d = addDays(startOfDay(new Date()), 1);
        d.setHours(23, 59, 0, 0);
        return d.toISOString();
      })(),
    estimateMin: TYPE_META.assignment.defaultMin,
    weight: null,
    spentMin: 0,
    subtasks: [],
    plan: [],
    notes: '',
    done: false,
    createdAt: new Date().toISOString(),
  };
  const draft = structuredClone(base);
  draft.subtasks ||= [];
  draft.plan ||= [];

  let saved = false;
  const prevPaste = app.pasteTarget;
  modal(isNew ? 'New item' : 'Edit item', (ctl) => {
    const title = el('input', { type: 'text', value: draft.title, placeholder: 'What needs doing?' });
    title.addEventListener('input', () => (draft.title = title.value));

    const type = el('select', {}, TYPES.map((t) => el('option', { value: t }, `${TYPE_META[t].icon} ${TYPE_META[t].label}`)));
    type.value = draft.type;
    type.addEventListener('change', () => {
      const wasDefault = draft.estimateMin === TYPE_META[draft.type].defaultMin;
      draft.type = type.value;
      if (wasDefault) draft.estimateMin = TYPE_META[draft.type].defaultMin;
      ctl.rebuild();
    });

    const cls = el('select', {}, [...app.data.classes.map((c) => el('option', { value: c.id }, c.name)), el('option', { value: '' }, 'Personal / none')]);
    cls.value = draft.classId || '';
    cls.addEventListener('change', () => (draft.classId = cls.value || null));

    const due = el('input', { type: 'datetime-local', value: draft.due ? toLocalInput(draft.due) : '' });
    due.addEventListener('change', () => (draft.due = due.value ? new Date(due.value).toISOString() : null));

    const est = el('input', { type: 'number', min: 0, step: 5, value: draft.estimateMin ?? '' });
    est.addEventListener('input', () => (draft.estimateMin = est.value === '' ? null : Math.max(0, parseInt(est.value, 10) || 0)));
    const weight = el('input', { type: 'number', min: 0, max: 100, step: 0.5, value: draft.weight ?? '', placeholder: '—' });
    weight.addEventListener('input', () => (draft.weight = weight.value === '' ? null : clamp(parseFloat(weight.value) || 0, 0, 100)));

    const notes = el('textarea', { placeholder: 'Notes, links, instructions…' }, draft.notes || '');
    notes.addEventListener('input', () => (draft.notes = notes.value));

    // Subtasks
    const newSub = el('input', { type: 'text', placeholder: '+ Add a step and press Enter' });
    newSub.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && newSub.value.trim()) {
        e.preventDefault();
        draft.subtasks.push({ id: uid(), text: newSub.value.trim(), done: false });
        ctl.rebuild();
        setTimeout(() => ctl.body.querySelector('.subtasks input[type=text]:last-of-type')?.focus());
      }
    });
    const subtasks = el(
      'div',
      { class: 'subtasks' },
      draft.subtasks.map((s, idx) => {
        const cb = el('input', { type: 'checkbox', class: 'check sq', checked: s.done });
        cb.addEventListener('change', () => {
          s.done = cb.checked;
          ctl.rebuild();
        });
        const txt = el('input', { type: 'text', value: s.text });
        txt.addEventListener('input', () => (s.text = txt.value));
        return el(
          'div',
          { class: `subtask${s.done ? ' done' : ''}` },
          cb,
          txt,
          el(
            'button',
            {
              class: 'btn icon ghost',
              'aria-label': 'Remove step',
              onclick: () => {
                draft.subtasks.splice(idx, 1);
                ctl.rebuild();
              },
            },
            '✕',
          ),
        );
      }),
      newSub,
      !draft.subtasks.length &&
        el(
          'button',
          {
            class: 'btn sm ghost',
            title: 'Break this into small starter steps (you can edit or delete them)',
            onclick: () => {
              draft.subtasks = suggestSteps(draft.type);
              ctl.rebuild();
            },
          },
          '✨ Suggest small steps',
        ),
    );

    // Study plan
    const planned = draft.plan.reduce((s, p) => s + p.minutes, 0);
    const planList = draft.plan
      .slice()
      .sort((a, b) => (a.day < b.day ? -1 : 1))
      .map((s) => {
        const cb = el('input', { type: 'checkbox', class: 'check sq', checked: s.done });
        cb.addEventListener('change', () => {
          s.done = cb.checked;
          draft.spentMin = Math.max(0, (draft.spentMin || 0) + (s.done ? s.minutes : -s.minutes));
          ctl.rebuild();
        });
        const day = el('input', { type: 'date', value: s.day, class: 'input', style: { width: 'auto', padding: '5px 8px' } });
        day.addEventListener('change', () => day.value && (s.day = day.value));
        const mins = el('input', { type: 'number', min: 5, step: 5, value: s.minutes, style: { width: '76px', padding: '5px 8px' } });
        mins.addEventListener('change', () => (s.minutes = Math.max(5, parseInt(mins.value, 10) || 5)));
        return el(
          'div',
          { class: `session-row${s.done ? ' done' : ''}` },
          cb,
          day,
          mins,
          el('span', { class: 'small muted' }, 'min'),
          el('span', { class: 'spacer' }),
          el(
            'button',
            {
              class: 'btn icon ghost',
              'aria-label': 'Remove session',
              onclick: () => {
                draft.plan = draft.plan.filter((p) => p !== s);
                ctl.rebuild();
              },
            },
            '✕',
          ),
        );
      });

    const isGradable = draft.type !== 'event';
    const score = el('input', { type: 'number', min: 0, step: 0.5, value: draft.score ?? '', placeholder: 'score' });
    score.addEventListener('input', () => (draft.score = score.value === '' ? null : parseFloat(score.value)));
    const maxScore = el('input', { type: 'number', min: 0, step: 0.5, value: draft.maxScore ?? '', placeholder: 'out of' });
    maxScore.addEventListener('input', () => (draft.maxScore = maxScore.value === '' ? null : parseFloat(maxScore.value)));

    const err = el('div', { class: 'error' });
    const p = priority(draft);

    return el(
      'div',
      { class: 'stack' },
      el('label', { class: 'field' }, el('span', {}, 'Title'), title),
      el('div', { class: 'grid-2' }, el('label', { class: 'field' }, el('span', {}, 'Type'), type), el('label', { class: 'field' }, el('span', {}, 'Class'), cls)),
      el('label', { class: 'field' }, el('span', {}, draft.type === 'event' ? 'When' : 'Due'), due),
      draft.type !== 'event' &&
        el(
          'div',
          { class: 'grid-2' },
          el('label', { class: 'field' }, el('span', {}, 'Estimated effort (minutes)'), est),
          el('label', { class: 'field' }, el('span', {}, 'Grade weight %'), weight),
        ),
      ['exam', 'quiz'].includes(draft.type) && studyLinks(app, draft, ctl),
      !draft.done && p.level !== 'none' && el('div', { class: 'row small' }, el('span', { class: `chip ${p.level}` }, `${p.label} priority`), el('span', { class: 'muted' }, draft.due ? relDue(draft.due) : '')),

      el('div', { class: 'section-h' }, 'Screenshots'),
      gallery(app, {
        filter: (a) => a.itemId === draft.id,
        meta: () => ({ kind: 'work', itemId: draft.id, classId: draft.classId }),
        empty: 'Attach the assignment sheet, instructions, or a photo of your work.',
        compact: true,
      }),
      draft.type !== 'event' && el('div', { class: 'section-h' }, `Steps${draft.subtasks.length ? ` · ${draft.subtasks.filter((s) => s.done).length}/${draft.subtasks.length}` : ''}`),
      draft.type !== 'event' && subtasks,

      draft.type !== 'event' &&
        el(
          'div',
          { class: 'row' },
          el('div', { class: 'section-h' }, `Study plan · ${fmtMinutes(planned)} planned · ${fmtMinutes(draft.spentMin || 0)} done`),
          el('span', { class: 'spacer' }),
          el(
            'button',
            {
              class: 'btn sm',
              title: draft.type === 'exam' || draft.type === 'quiz' ? 'Spaced-repetition sessions before the exam' : 'Spread the remaining work over your lightest days',
              onclick: () => {
                if (!draft.due) {
                  err.textContent = 'Set a due date first.';
                  return;
                }
                draft.plan = autoPlan(draft, app.data);
                ctl.rebuild();
              },
            },
            '✨ Auto-plan',
          ),
          el(
            'button',
            {
              class: 'btn sm ghost',
              onclick: () => {
                draft.plan.push({ id: uid(), day: dayKey(new Date()), minutes: app.data.settings.sessionMin, done: false });
                ctl.rebuild();
              },
            },
            '+',
          ),
        ),
      draft.type !== 'event' && (planList.length ? el('div', { class: 'stack', style: { gap: '6px' } }, planList) : el('div', { class: 'muted small' }, 'No sessions yet. Hit Auto-plan and Orbit will schedule them — exams get spaced repetition, everything else lands on your lightest days.')),

      isGradable && el('div', { class: 'section-h' }, 'Grade (once returned)'),
      isGradable && el('div', { class: 'grid-2' }, score, maxScore),

      el('label', { class: 'field' }, el('span', {}, 'Notes'), notes),
      err,
      el(
        'div',
        { class: 'row wrap' },
        !isNew &&
          el(
            'button',
            {
              class: 'btn danger',
              onclick: () => {
                const idx = app.data.items.indexOf(item);
                app.data.items.splice(idx, 1);
                // Keep its screenshots (they move to the class in Files).
                const linked = app.data.attachments.filter((a) => a.itemId === item.id);
                linked.forEach((a) => (a.itemId = null));
                saved = true;
                ctl.close();
                app.commit();
                toast(`Deleted "${item.title}"`, {
                  action: 'Undo',
                  onAction: () => {
                    app.data.items.splice(idx, 0, item);
                    linked.forEach((a) => (a.itemId = item.id));
                    app.commit();
                  },
                });
              },
            },
            'Delete',
          ),
        !isNew &&
          el(
            'button',
            {
              class: 'btn',
              onclick: () => {
                const copy = structuredClone(draft);
                copy.id = uid();
                copy.title = `${draft.title} (copy)`;
                copy.done = false;
                copy.plan = [];
                copy.spentMin = 0;
                copy.score = null;
                copy.subtasks.forEach((s) => (s.done = false));
                app.data.items.push(copy);
                saved = true;
                ctl.close();
                app.commit();
                toast('Duplicated');
              },
            },
            'Duplicate',
          ),
        el('span', { class: 'spacer' }),
        el('button', { class: 'btn', onclick: () => ctl.close() }, 'Cancel'),
        el(
          'button',
          {
            class: 'btn primary',
            onclick: () => {
              draft.title = draft.title.trim();
              if (!draft.title) {
                err.textContent = 'Give it a title.';
                return;
              }
              if (draft.score != null && !(draft.maxScore > 0)) {
                err.textContent = 'Enter what the score is out of.';
                return;
              }
              if (isNew) {
                if (draft.due && draft.type !== 'event' && !draft.plan.length) draft.plan = autoPlan(draft, app.data);
                app.data.items.push(draft);
              } else {
                const dueChanged = item.due !== draft.due;
                Object.assign(item, draft);
                if (dueChanged && item.plan.some((s) => !s.done)) item.plan = autoPlan(item, app.data);
              }
              for (const a of app.data.attachments) if (a.itemId === draft.id) a.classId = draft.classId;
              saved = true;
              ctl.close();
              app.commit();
            },
          },
          isNew ? 'Add' : 'Save',
        ),
      ),
    );
  }, {
    onClose: () => {
      app.pasteTarget = prevPaste;
      if (saved) return;
      // Screenshots are saved immediately; keep them linked to the item's class.
      for (const a of app.data.attachments) if (a.itemId === draft.id) a.classId = draft.classId;
      if (isNew) for (const a of app.data.attachments) if (a.itemId === draft.id) a.itemId = null;
      app.commit({ render: !isNew });
    },
  });
}

// ------------------------------------------------------------------ Focus (orbit timer)
let ticker = null;
let audioCtx = null;

function focusState(app) {
  const f = app.focus;
  if (!f.mode) {
    Object.assign(f, { mode: 'focus', running: false, remainingMs: app.data.settings.focusMin * 60000, endsAt: null, count: 0 });
  }
  return f;
}
function modeLength(app, mode) {
  const s = app.data.settings;
  return (mode === 'focus' ? s.focusMin : mode === 'short' ? s.shortBreakMin : s.longBreakMin) * 60000;
}
function remaining(f) {
  return f.running ? Math.max(0, f.endsAt - Date.now()) : f.remainingMs;
}

function chime() {
  try {
    audioCtx ||= new AudioContext();
    const t = audioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.frequency.value = freq;
      o.type = 'sine';
      g.gain.setValueAtTime(0.0001, t + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 0.6);
      o.connect(g).connect(audioCtx.destination);
      o.start(t + i * 0.18);
      o.stop(t + i * 0.18 + 0.7);
    });
  } catch {
    /* audio not available */
  }
}

function startTicker(app) {
  if (ticker) return;
  ticker = setInterval(() => {
    const f = app.focus;
    if (!app.session || !f.running) {
      clearInterval(ticker);
      ticker = null;
      document.title = 'Orbit · Study';
      return;
    }
    const ms = remaining(f);
    const readout = document.getElementById('focus-readout');
    const prog = document.getElementById('focus-prog');
    const label = `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
    if (readout) readout.textContent = label;
    if (prog) prog.setAttribute('stroke-dashoffset', String(prog.dataset.c * (ms / modeLength(app, f.mode))));
    document.title = `${label} · ${f.mode === 'focus' ? 'Focus' : 'Break'} · Orbit`;
    if (ms <= 0) finishPhase(app);
  }, 500);
}

function finishPhase(app) {
  const f = app.focus;
  f.running = false;
  chime();
  if (f.mode === 'focus') {
    const minutes = app.data.settings.focusMin;
    app.data.focusLog.push({ day: dayKey(new Date()), minutes, itemId: f.itemId || null, at: new Date().toISOString() });
    if (app.data.focusLog.length > 3000) app.data.focusLog = app.data.focusLog.slice(-3000);
    const item = f.itemId && app.itemById(f.itemId);
    if (item) {
      item.spentMin = (item.spentMin || 0) + minutes;
      // Tick off the earliest open study block this covers.
      const s = (item.plan || []).filter((p) => !p.done && p.day <= dayKey(new Date())).sort((a, b) => (a.day < b.day ? -1 : 1))[0];
      if (s && s.minutes <= minutes + 5) {
        s.done = true;
        item.spentMin -= minutes;
        item.spentMin += s.minutes;
      }
    }
    logActivity(app.data);
    addXP(app.data, minutes);
    f.count += 1;
    f.mode = f.count % 4 === 0 ? 'long' : 'short';
    notify('Focus session complete', `+${minutes} min${item ? ` on ${item.title}` : ''}. Take a break!`);
    toast(`🎉 ${minutes} min focus logged`);
  } else {
    f.mode = 'focus';
    notify('Break over', 'Ready for another round?');
  }
  f.remainingMs = modeLength(app, f.mode);
  app.commit({ render: app.view === 'focus' });
}

function notify(title, body) {
  if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
    try {
      new Notification(title, { body, icon: 'icons/icon.svg' });
    } catch {
      /* ignore */
    }
  }
}

function renderFocus(app) {
  const f = focusState(app);
  const ms = remaining(f);
  const total = modeLength(app, f.mode);
  const r = 140;
  const c = 2 * Math.PI * r;
  const colors = { focus: 'url(#fg)', short: 'var(--accent-3)', long: 'var(--warn)' };
  const prog = svg('circle', { id: 'focus-prog', cx: 160, cy: 160, r, fill: 'none', stroke: colors[f.mode], 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-dasharray': c, 'stroke-dashoffset': c * (ms / total), class: 'prog' });
  prog.dataset.c = c;

  const setMode = (mode) => {
    f.mode = mode;
    f.running = false;
    f.remainingMs = modeLength(app, mode);
    app.render();
  };

  const openItems = sortByPriority(app.data.items.filter((i) => !i.done && i.type !== 'event'));
  const pick = el('select', {}, el('option', { value: '' }, '— Just focusing —'), openItems.map((i) => el('option', { value: i.id }, `${classOf(app, i).code} · ${i.title}`)));
  pick.value = f.itemId && app.itemById(f.itemId) ? f.itemId : '';
  pick.addEventListener('change', () => {
    f.itemId = pick.value || null;
    app.render();
  });

  const toggle = () => {
    if (f.running) {
      f.remainingMs = remaining(f);
      f.running = false;
    } else {
      f.endsAt = Date.now() + f.remainingMs;
      f.running = true;
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
      startTicker(app);
    }
    app.render();
  };

  const today = focusMinutesOn(app.data, dayKey(new Date()));
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i - 6));
  const maxDay = Math.max(60, ...days.map((d) => focusMinutesOn(app.data, dayKey(d))));
  const item = f.itemId && app.itemById(f.itemId);

  const labels = { focus: 'Focus', short: 'Short break', long: 'Long break' };
  const stage = el(
    'div',
    { class: 'card focus-stage' },
    el('div', { class: 'seg' }, Object.entries(labels).map(([k, l]) => el('button', { class: f.mode === k ? 'on' : '', onclick: () => setMode(k) }, l))),
    el(
      'div',
      { class: `timer${f.running ? ' running' : ''}` },
      svg(
        'svg',
        { viewBox: '0 0 320 320' },
        svg('defs', {}, svg('linearGradient', { id: 'fg', x1: 0, y1: 0, x2: 1, y2: 1 }, svg('stop', { offset: 0, 'stop-color': '#8b6cff' }), svg('stop', { offset: 1, 'stop-color': '#ff6b8b' }))),
        svg('circle', { cx: 160, cy: 160, r, fill: 'none', 'stroke-width': 12, class: 'track' }),
        prog,
      ),
      el('div', { class: 'satellite' }),
      el(
        'div',
        { class: 'readout' },
        el('span', { class: 'muted small' }, labels[f.mode]),
        el('b', { id: 'focus-readout' }, `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`),
        el('div', { class: 'pips' }, [0, 1, 2, 3].map((i) => el('i', { class: i < f.count % 4 || (f.count && f.count % 4 === 0 && f.mode === 'long') ? 'on' : '' }))),
      ),
    ),
    el(
      'div',
      { class: 'row' },
      el('button', { class: 'btn primary', style: { minWidth: '130px' }, onclick: toggle }, f.running ? '❚❚ Pause' : '▶ Start'),
      el('button', { class: 'btn', onclick: () => setMode(f.mode) }, '↺ Reset'),
      el(
        'button',
        {
          class: 'btn ghost',
          title: 'Skip to next phase',
          onclick: () => {
            f.running = false;
            if (f.mode === 'focus') setMode(f.count % 4 === 3 ? 'long' : 'short');
            else setMode('focus');
          },
        },
        '⏭',
      ),
    ),
    el('label', { class: 'field', style: { width: 'min(420px, 100%)' } }, el('span', {}, 'Working on'), pick),
    item && el('div', { class: 'small muted' }, `${fmtMinutes(item.spentMin || 0)} logged · ~${fmtMinutes(remainingMin(item))} left · due ${dueText(item)}`),
  );

  const side = el(
    'div',
    { class: 'stack' },
    el(
      'div',
      { class: 'card' },
      el('h3', {}, '⏱ Focus log'),
      el('div', { class: 'row', style: { alignItems: 'baseline' } }, el('b', { style: { fontSize: '2em' } }, fmtMinutes(today)), el('span', { class: 'muted' }, 'today')),
      el(
        'div',
        { class: 'forecast', style: { gridTemplateColumns: 'repeat(7, 1fr)', height: '110px', marginTop: '12px' } },
        days.map((d) => {
          const m = focusMinutesOn(app.data, dayKey(d));
          return el(
            'div',
            { class: 'fc-col', title: `${fmtDate(d)}: ${fmtMinutes(m)}` },
            el('div', { class: 'fc-bar', style: { height: `${clamp((m / maxDay) * 100, 3, 100)}%`, background: m ? 'var(--grad)' : 'var(--line)' } }),
            el('div', { class: `fc-lbl${sameDay(d, new Date()) ? ' today' : ''}` }, WEEKDAYS[d.getDay()].slice(0, 2)),
          );
        }),
      ),
    ),
    el(
      'div',
      { class: 'card small muted' },
      el('h3', {}, '🧠 How it works'),
      el('p', { style: { margin: 0 } }, `Work for ${app.data.settings.focusMin} minutes, break for ${app.data.settings.shortBreakMin}. Every 4th break is a longer ${app.data.settings.longBreakMin}-minute one. Time you log counts against the item's estimate and ticks off planned study blocks, so your forecast stays honest.`),
    ),
  );

  if (f.running) startTicker(app);
  return el('div', {}, pageTitle('Focus'), el('div', { class: 'focus-wrap' }, stage, side));
}

// ------------------------------------------------------------------ Settings
function download(name, text, type) {
  const blob = new Blob([text], { type });
  const a = el('a', { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Focus & ADHD support settings — every one of these is optional and reversible.
function focusCard(app, num, card) {
  const s = app.data.settings;
  const toggle = (key, label, hint, after) => {
    const cb = el('input', { type: 'checkbox', class: 'check sq', checked: !!s[key] });
    cb.addEventListener('change', () => {
      s[key] = cb.checked;
      after?.();
      app.commit({ render: false });
      toast('Saved');
    });
    return el('label', { class: 'toggle-row' }, cb, el('span', {}, el('b', {}, label), el('span', { class: 'small muted' }, ` — ${hint}`)));
  };
  const pick = (key, label, options, after) => {
    const sel = el('select', { 'aria-label': label }, options.map(([v, l]) => el('option', { value: v, selected: s[key] === v }, l)));
    sel.addEventListener('change', () => {
      s[key] = sel.value;
      after?.();
      app.commit({ render: false });
      toast('Saved');
    });
    return el('label', { class: 'field' }, el('span', {}, label), sel);
  };
  const comfort = () => applyComfort(s);
  return card(
    '🎮 Focus & games',
    el('p', { class: 'small muted', style: { margin: 0 } }, 'Blitz, Boss battles, daily quests and loot live on every study set and on Home. Shortcuts: G = quick game, J = quick sprint, P = park a distracting thought, R = read a card aloud.'),
    toggle('sfx', 'Game sounds', 'little blips for right answers, combos and boss hits'),
    toggle('focusMode', 'Focus mode while studying', 'hides the sidebar and everything except the card in front of you'),
    toggle('timeBuffer', 'Time-blindness buffer', 'auto-plans assume work takes 1.5× your estimate'),
    toggle('calm', 'Calm mode', 'no confetti or motion', comfort),
    toggle('comfortSpacing', 'Relaxed spacing', 'extra line and letter spacing for easier reading', comfort),
    el(
      'div',
      { class: 'grid-3' },
      num('sprintMin', 'Sprint length (min)', 2, 30, 1),
      num('chunk', 'Cards per Learn round', 3, 20, 1),
      num('breakMin', 'Break check-in every (min, 0 = off)', 0, 90, 5),
    ),
    el(
      'div',
      { class: 'grid-2' },
      pick('noise', 'Focus noise', [['brown', 'Brown noise (deep, soft)'], ['pink', 'Pink noise (balanced)'], ['white', 'White noise (bright)']], () => stopNoise()),
      pick('comfortText', 'Text size', [['normal', 'Normal'], ['large', 'Large'], ['xl', 'Extra large']], comfort),
    ),
  );
}

function renderSettings(app) {
  const s = app.data.settings;
  const num = (key, label, min, max, step = 5) => {
    const input = el('input', { type: 'number', min, max, step, value: s[key] });
    input.addEventListener('change', () => {
      const v = clamp(parseInt(input.value, 10) || min, min, max);
      s[key] = v;
      input.value = v;
      app.commit({ render: false });
      toast('Saved');
    });
    return el('label', { class: 'field' }, el('span', {}, label), input);
  };

  const autolock = el('select', {}, [[5, '5 minutes'], [10, '10 minutes'], [15, '15 minutes'], [30, '30 minutes'], [60, '1 hour'], [0, 'Never (not recommended)']].map(([v, l]) => el('option', { value: v }, l)));
  autolock.value = s.autoLockMin;
  autolock.addEventListener('change', () => {
    s.autoLockMin = parseInt(autolock.value, 10);
    app.commit({ render: false });
    toast('Saved');
  });

  // Change password
  const cur = el('input', { type: 'password', autocomplete: 'current-password', placeholder: 'current password' });
  const nw = el('input', { type: 'password', autocomplete: 'new-password', placeholder: 'new password (10+ characters)' });
  const nw2 = el('input', { type: 'password', autocomplete: 'new-password', placeholder: 'confirm new password' });
  const pwErr = el('div', { class: 'error' });
  const pwBtn = el('button', { class: 'btn primary', type: 'submit' }, 'Change password');
  const pwForm = el(
    'form',
    {
      class: 'stack',
      onsubmit: async (e) => {
        e.preventDefault();
        pwErr.textContent = '';
        if (nw.value !== nw2.value) {
          pwErr.textContent = "New passwords don't match.";
          return;
        }
        pwBtn.disabled = true;
        pwBtn.textContent = 'Re-encrypting…';
        try {
          await app.session.changePassword(cur.value, nw.value);
          cur.value = nw.value = nw2.value = '';
          toast('Password changed');
        } catch (err) {
          pwErr.textContent = err.message;
        }
        pwBtn.disabled = false;
        pwBtn.textContent = 'Change password';
      },
    },
    el('input', { type: 'text', autocomplete: 'username', value: app.session.username, class: 'hidden', 'aria-hidden': 'true', tabindex: -1 }),
    cur,
    el('div', { class: 'grid-2' }, nw, nw2),
    pwErr,
    el('div', {}, pwBtn),
  );

  const card = (title, ...body) => el('div', { class: 'card stack' }, el('h3', { style: { marginBottom: 0 } }, title), ...body);

  return el(
    'div',
    {},
    pageTitle('Settings'),
    el(
      'div',
      { class: 'dash' },
      card(
        '🎨 Appearance',
        el(
          'div',
          { class: 'seg', style: { alignSelf: 'flex-start' } },
          [['auto', 'Auto'], ['dark', 'Dark'], ['light', 'Light']].map(([v, l]) =>
            el(
              'button',
              {
                class: s.theme === v ? 'on' : '',
                onclick: () => {
                  s.theme = v;
                  app.applyTheme(v);
                  app.commit();
                },
              },
              l,
            ),
          ),
        ),
      ),
      card(
        '🧠 Studying',
        el('div', { class: 'grid-2' }, num('dailyGoal', 'Daily goal (cards)', 5, 500, 5), num('newPerDay', 'New cards per day in Review', 0, 200, 5)),
        el('p', { class: 'small muted', style: { margin: 0 } }, 'New cards are introduced gradually so reviews never pile up. Exams in the Planner automatically pull their class’s cards forward.'),
      ),
      focusCard(app, num, card),
      card(
        '🧭 Planning',
        el('div', { class: 'grid-2' }, num('sessionMin', 'Study session length (min)', 15, 180), num('dailyCapMin', 'Daily capacity (min)', 30, 720, 15)),
        el('div', { class: 'grid-3' }, num('focusMin', 'Focus (min)', 5, 120, 5), num('shortBreakMin', 'Short break', 1, 30, 1), num('longBreakMin', 'Long break', 5, 60, 5)),
        el('p', { class: 'small muted', style: { margin: 0 } }, 'Daily capacity is how much homework you can realistically do per day. The forecast turns orange/red when you go past it.'),
      ),
      card(
        '🔐 Security',
        el('div', { class: 'small muted' }, `Signed in as @${app.session.username}. Your planner is encrypted with AES-256-GCM; the key is derived from your password with PBKDF2-SHA256 (${vault.PBKDF2_ITERATIONS.toLocaleString()} iterations).`),
        el('label', { class: 'field' }, el('span', {}, 'Auto-lock after inactivity'), autolock),
        el('div', { class: 'section-h' }, 'Change password'),
        pwForm,
        el('div', { class: 'section-h' }, 'Recovery code'),
        el('div', { class: 'row wrap' }, el('button', { class: 'btn', onclick: () => regenRecovery(app) }, 'Generate a new recovery code'), el('button', { class: 'btn', onclick: () => app.lock() }, '🔒 Lock now')),
      ),
      card(
        '💾 Your data',
        el('p', { class: 'small muted', style: { margin: 0 } }, 'Everything lives encrypted in this browser only — nothing is uploaded. To move to another device (or keep a safety copy), export an encrypted backup and restore it from the login screen there.'),
        el(
          'div',
          { class: 'row wrap' },
          el(
            'button',
            {
              class: 'btn primary',
              onclick: async () => {
                await app.save();
                download(`orbit-backup-${app.session.username}-${dayKey(new Date())}.json`, JSON.stringify(await app.session.exportBackup()), 'application/json');
                toast('Encrypted backup downloaded');
              },
            },
            '↓ Encrypted backup',
          ),
          el(
            'button',
            {
              class: 'btn',
              title: 'Deadlines as a calendar file (not encrypted)',
              onclick: () => {
                download(`orbit-${dayKey(new Date())}.ics`, toICS(app.data), 'text/calendar');
                toast('Calendar file downloaded (not encrypted)');
              },
            },
            '↓ Deadlines (.ics)',
          ),
          el(
            'button',
            {
              class: 'btn',
              onclick: () => {
                sampleData(app.data);
                app.commit();
                toast('Sample semester added');
              },
            },
            '✨ Add sample semester',
          ),
        ),
        el('div', { class: 'section-h' }, 'Danger zone'),
        el(
          'div',
          { class: 'row wrap' },
          el(
            'button',
            {
              class: 'btn danger',
              onclick: async () => {
                if (!(await confirmBox('Remove all study sets, classes, items, screenshots and history? Your account stays.', { ok: 'Clear everything', danger: true }))) return;
                const settings = app.data.settings;
                app.data.classes = [];
                app.data.items = [];
                app.data.focusLog = [];
                app.data.activity = [];
                for (const a of app.data.attachments) {
                  await app.session.deleteFile(a.id).catch(() => {});
                  await app.session.deleteFile(`${a.id}.t`).catch(() => {});
                }
                app.data.attachments = [];
                for (const set of [...app.data.sets]) await deleteSet(app, set);
                app.data.docs = [];
                app.data.courses = [];
                app.data.studyLog = {};
                app.data.settings = settings;
                app.commit();
              },
            },
            'Clear all data',
          ),
          el('button', { class: 'btn danger', onclick: () => deleteAccount(app) }, 'Delete account'),
        ),
      ),
    ),
  );
}

function regenRecovery(app) {
  modal(
    'New recovery code',
    (ctl) => {
      const pw = el('input', { type: 'password', autocomplete: 'current-password', placeholder: 'your password' });
      const err = el('div', { class: 'error' });
      const out = el('div', {});
      const btn = el('button', { class: 'btn primary', type: 'submit' }, 'Generate');
      return el(
        'form',
        {
          class: 'stack',
          onsubmit: async (e) => {
            e.preventDefault();
            btn.disabled = true;
            try {
              const code = await app.session.regenerateRecoveryCode(pw.value);
              pw.value = '';
              add(clear(out), el('p', { class: 'small muted' }, 'Your old code no longer works. Save this one:'), el('div', { class: 'recovery-code' }, code));
              btn.remove();
            } catch (ex) {
              err.textContent = ex.message;
              btn.disabled = false;
            }
          },
        },
        el('p', { class: 'small muted', style: { margin: 0 } }, 'Confirm your password to create a new recovery code. The old one stops working.'),
        el('input', { type: 'text', autocomplete: 'username', value: app.session.username, class: 'hidden', 'aria-hidden': 'true', tabindex: -1 }),
        pw,
        err,
        out,
        el('div', { class: 'row' }, el('span', { class: 'spacer' }), el('button', { class: 'btn', type: 'button', onclick: () => ctl.close() }, 'Close'), btn),
      );
    },
    { center: true },
  );
}

function deleteAccount(app) {
  modal(
    'Delete account',
    (ctl) => {
      const confirmInput = el('input', { type: 'text', placeholder: app.session.username, autocomplete: 'off' });
      const btn = el('button', { class: 'btn danger', disabled: true }, 'Delete forever');
      confirmInput.addEventListener('input', () => (btn.disabled = confirmInput.value !== app.session.username));
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        await app.session.deleteAccount();
        app.session = null;
        ctl.close();
        location.reload();
      });
      return el(
        'div',
        { class: 'stack' },
        el('p', { class: 'muted', style: { margin: 0 } }, 'This permanently erases your account and planner from this browser. Export a backup first if you might want it back.'),
        el('label', { class: 'field' }, el('span', {}, `Type "${app.session.username}" to confirm`), confirmInput),
        el('div', { class: 'row' }, el('span', { class: 'spacer' }), el('button', { class: 'btn', onclick: () => ctl.close() }, 'Cancel'), btn),
      );
    },
    { center: true },
  );
}

// ------------------------------------------------------------------ Help
export function openHelp() {
  const row = (k, d) => el('div', { class: 'row', style: { padding: '4px 0' } }, el('span', { style: { width: '120px' } }, k), el('span', { class: 'muted' }, d));
  modal(
    'Shortcuts & quick add',
    () =>
      el(
        'div',
        { class: 'stack' },
        el('div', { class: 'section-h' }, 'Keyboard'),
        row(el('span', {}, el('kbd', {}, 'N'), ' or ', el('kbd', {}, '/')), 'Quick add'),
        row(el('span', {}, el('kbd', {}, '1'), '–', el('kbd', {}, String(NAV_ORDER.length))), 'Switch views'),
        row(el('kbd', {}, 'G'), 'Quick game (Blitz or Boss battle)'),
        row(el('kbd', {}, 'J'), 'Quick review sprint'),
        row(el('kbd', {}, 'P'), 'Park a distracting thought'),
        row(el('kbd', {}, 'L'), 'Lock Orbit'),
        row(el('kbd', {}, 'Esc'), 'Close a panel'),
        row(el('kbd', {}, '?'), 'This help'),
        el('div', { class: 'section-h' }, 'Quick-add syntax'),
        row(el('code', {}, '#bio'), 'Class (by code or name)'),
        row(el('code', {}, '!exam'), 'Type: exam, quiz, project, reading, lab, event, hw'),
        row(el('code', {}, '~2h  ~90m'), 'Estimated effort'),
        row(el('code', {}, '15%'), 'Grade weight'),
        row(el('code', {}, 'fri 3pm'), 'Dates: today, tmr, fri, next week, in 3 days, oct 12, 10/12'),
        el('div', { class: 'card small', style: { padding: '12px' } }, 'Example: ', el('code', {}, 'Calc midterm oct 14 9am #math ~5h 25%')),
      ),
    { center: true },
  );
}

// ------------------------------------------------------------------ registry
// ------------------------------------------------------------------ Planner (calendar, in the background)
export const PLANNER_TABS = ['launch', 'horizon', 'month', 'tasks'];
function renderPlanner(app) {
  const tab = PLANNER_TABS.includes(app.plannerTab) ? app.plannerTab : 'launch';
  const labels = { launch: '🚀 Overview', horizon: '🌅 Horizon', month: '🗓 Month', tasks: '✓ Tasks' };
  return el(
    'div',
    {},
    el('div', { class: 'planner-tabs' }, el('div', { class: 'seg' }, PLANNER_TABS.map((t) => el('button', { class: t === tab ? 'on' : '', onclick: () => app.go(t) }, labels[t])))),
    { launch: renderLaunch, horizon: renderHorizon, month: renderMonth, tasks: renderTasks }[tab](app),
  );
}

export const VIEWS = {
  home: { label: 'Home', icon: '🏠', render: renderHome, mobile: true },
  library: { label: 'Library', icon: '📚', render: renderLibrary, mobile: true },
  review: { label: 'Review', icon: '🧠', render: renderReviewHub, mobile: true, badge: (app) => dueCount(app.data) },
  courses: { label: 'AP & Courses', short: 'AP', icon: '🎓', render: renderCourses, mobile: false },
  course: { label: 'Course', icon: '🎓', render: renderCourse },
  planner: { label: 'Planner', icon: '🗓', render: renderPlanner, mobile: true },
  classes: { label: 'Classes', icon: '🎒', render: renderClasses, mobile: false },
  files: { label: 'Files', icon: '📎', render: (app) => renderFiles(app, pageTitle), mobile: false },
  focus: { label: 'Focus timer', icon: '⏱', render: renderFocus, mobile: false },
  meals: { label: 'Meals', icon: '🍔', render: renderMeals, mobile: false },
  settings: { label: 'Settings', short: 'More', icon: '⚙', render: renderSettings, mobile: true },
  set: { label: 'Study set', icon: '📚', render: renderSet },
  study: { label: 'Study', icon: '🪐', render: renderStudy },
};
export const NAV_GROUPS = [
  ['Study', ['home', 'library', 'review', 'courses']],
  ['Plan', ['planner', 'classes', 'files']],
  ['Tools', ['focus', 'settings', 'meals']],
];
export const NAV_ORDER = NAV_GROUPS.flatMap(([, ids]) => ids);
