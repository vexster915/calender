// Natural-language quick add.
//   "Bio lab report due fri 11:59pm #bio !project ~2h 15%"
//   "Calc exam oct 14 9am #math !exam"
//   "Read ch 4 tomorrow #hist ~45m"
import { addDays, startOfDay } from './util.js';

export const TYPES = ['assignment', 'exam', 'quiz', 'project', 'reading', 'lab', 'event'];
const TYPE_ALIASES = { hw: 'assignment', homework: 'assignment', test: 'exam', midterm: 'exam', final: 'exam', paper: 'project', essay: 'project', read: 'reading' };
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function parseQuickAdd(input, classes = [], now = new Date()) {
  let text = ` ${input} `;
  const out = { title: '', type: null, classId: null, due: null, hasTime: false, estimateMin: null, weight: null };

  const take = (re, fn) => {
    text = text.replace(re, (...m) => {
      const r = fn(...m);
      return r === false ? m[0] : ' ';
    });
  };

  // #class
  take(/\s#([\w.-]+)/g, (_, tag) => {
    const t = tag.toLowerCase();
    const cls =
      classes.find((c) => (c.code || '').toLowerCase().replace(/\s+/g, '') === t) ||
      classes.find((c) => c.name.toLowerCase().replace(/\s+/g, '').startsWith(t)) ||
      classes.find((c) => (c.code || '').toLowerCase().startsWith(t));
    if (!cls) return false;
    out.classId = cls.id;
  });

  // !type
  take(/\s!(\w+)/g, (_, t) => {
    const k = t.toLowerCase();
    const type = TYPES.find((x) => x.startsWith(k)) || TYPE_ALIASES[k];
    if (!type) return false;
    out.type = type;
  });

  // ~2h ~90m ~1.5h ~1h30m
  take(/\s~(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?|m|min|mins)?(?:\s*(\d+)\s*m(?:in)?)?(?=\s)/gi, (_, n, unit, extra) => {
    const num = parseFloat(n);
    const isMin = unit && unit.toLowerCase().startsWith('m');
    out.estimateMin = Math.round(isMin ? num : num * 60 + (extra ? parseInt(extra, 10) : 0));
  });

  // 20%
  take(/\s(\d{1,3}(?:\.\d+)?)%(?=\s)/g, (_, n) => {
    out.weight = Math.min(100, parseFloat(n));
  });

  // ---- time ----
  let hour = null;
  let minute = 0;
  take(/\s(?:at\s+|@\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)(?=\s)/gi, (_, h, m, ap) => {
    hour = parseInt(h, 10) % 12;
    if (ap.toLowerCase().startsWith('p')) hour += 12;
    minute = m ? parseInt(m, 10) : 0;
  });
  if (hour === null) {
    take(/\s(?:at\s+|@\s*)?([01]?\d|2[0-3]):([0-5]\d)(?=\s)/g, (_, h, m) => {
      hour = parseInt(h, 10);
      minute = parseInt(m, 10);
    });
  }
  if (hour === null) {
    take(/\s(?:at\s+)?(noon|midnight|eod|end of day|morning|tonight)(?=\s)/gi, (_, w) => {
      const k = w.toLowerCase();
      if (k === 'noon') hour = 12;
      else if (k === 'morning') hour = 8;
      else if (k === 'tonight') hour = 21;
      else {
        hour = 23;
        minute = 59;
      }
    });
  }

  // ---- date ----
  const today = startOfDay(now);
  let date = null;
  take(/\s(today|tonight)(?=\s)/gi, () => {
    date = today;
  });
  if (!date) take(/\s(tomorrow|tmrw?|tmr)(?=\s)/gi, () => (date = addDays(today, 1)));
  if (!date)
    take(/\sin\s+(\d+)\s+(days?|weeks?)(?=\s)/gi, (_, n, u) => {
      date = addDays(today, parseInt(n, 10) * (u.toLowerCase().startsWith('w') ? 7 : 1));
    });
  if (!date)
    take(/\s(next\s+week)(?=\s)/gi, () => {
      date = addDays(today, 7);
    });
  if (!date)
    take(/\s(next\s+|this\s+)?(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)[a-z]*\.?(?=\s)/gi, (_, _modifier, d) => {
      const target = DAYS.indexOf(d.toLowerCase().slice(0, 3));
      let diff = (target - today.getDay() + 7) % 7;
      if (diff === 0) diff = 7; // "fri" on a Friday means next Friday
      date = addDays(today, diff);
    });
  if (!date)
    take(/\s(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?(?=\s)/gi, (_, mon, d, y) => {
      date = buildDate(MONTHS.indexOf(mon.toLowerCase().slice(0, 3)), parseInt(d, 10), y, today);
    });
  if (!date)
    take(/\s(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?(?:\s+(\d{4}))?(?=\s)/gi, (_, d, mon, y) => {
      date = buildDate(MONTHS.indexOf(mon.toLowerCase().slice(0, 3)), parseInt(d, 10), y, today);
    });
  if (!date)
    take(/\s(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?=\s)/g, (_, m, d, y) => {
      date = buildDate(parseInt(m, 10) - 1, parseInt(d, 10), y && (y.length === 2 ? `20${y}` : y), today);
    });

  if (date || hour !== null) {
    const d = new Date(date || today);
    if (hour !== null) {
      d.setHours(hour, minute, 0, 0);
      out.hasTime = true;
      // A time with no date that's already passed today means tomorrow.
      if (!date && d < now) d.setDate(d.getDate() + 1);
    } else {
      d.setHours(23, 59, 0, 0);
    }
    out.due = d;
  }

  // Leftover connector words
  text = text.replace(/\s(due|on|at|by|before)(?=\s+$|\s{2,})/gi, ' ');
  out.title = text.replace(/\s+/g, ' ').replace(/\s(due|by|on|at)$/i, '').trim();
  if (!out.type) out.type = guessType(out.title);
  return out;
}

function buildDate(month, day, year, today) {
  let y = year ? parseInt(year, 10) : today.getFullYear();
  let d = new Date(y, month, day);
  // No year given and date already passed (by more than a week)? Assume next year.
  if (!year && d < addDays(today, -7)) d = new Date(y + 1, month, day);
  return d;
}

function guessType(title) {
  const t = title.toLowerCase();
  if (/\b(exam|midterm|final|test)\b/.test(t)) return 'exam';
  if (/\bquiz\b/.test(t)) return 'quiz';
  if (/\b(project|essay|paper|presentation)\b/.test(t)) return 'project';
  if (/\b(read|reading|chapter|ch\.?)\b/.test(t)) return 'reading';
  if (/\blab\b/.test(t)) return 'lab';
  if (/\b(club|practice|game|meeting|party|appointment)\b/.test(t)) return 'event';
  return 'assignment';
}
