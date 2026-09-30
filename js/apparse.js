// Parsers for AP material: Course and Exam Descriptions (CEDs), multiple-choice question sheets
// (AP Classroom printouts, teacher handouts, released practice), and free-response prompts.
import { generateCards, cleanText } from './gen.js';

// ---------------- CED ----------------
// CEDs list, for each topic, Learning Objectives (e.g. "ENE-1.D Describe the properties of enzymes.")
// and Essential Knowledge statements (e.g. "ENE-1.D.1 The structure of enzymes includes…").
// History CEDs use key-concept codes like "KC-3.1.I.A". We pull those statements and file them
// under the unit given by the surrounding "TOPIC u.t" heading.
const CODE = /\b((?:[A-Z]{2,5})-\d+(?:\.[A-Z0-9]{1,4}){1,4})\b/g;
// 2025+ CEDs number everything by unit: "3.1.A" = learning objective, "3.1.A.1" = essential knowledge.
const NUMCODE = /(?<![\w.-])(\d{1,2}\.\d{1,2}\.[A-Z](?:\.\d{1,2})?)(?![\d.A-Za-z])/g;
const LO_VERB = /^(describe|explain|identify|calculate|determine|represent|compare|analyze|analyse|evaluate|justify|predict|construct|interpret|use|apply|create|develop|define|relate|make|select|articulate|connect|sketch)\b/i;

const TOPIC_LINE = /^(?:TOPIC\s+)?(\d{1,2})\.(\d{1,2})\s+([A-Z][A-Za-z0-9 ,:;'’()\-–&/]{2,80})$/;
const HISTORY_LO = /\bLearning Objective\s+([A-Z])\s+((?:Explain|Describe|Compare|Analyze|Analyse|Identify|Evaluate)\b[^.]{10,260}\.)/g;
const NOISE = /\b(ESSENTIAL KNOWLEDGE|LEARNING OBJECTIVE|ENDURING UNDERSTANDING|Required Course Content|EXCLUSION STATEMENT|HISTORICAL DEVELOPMENTS?|KEY CONCEPTS?|TOPIC \d+\.\d+.*$|UNIT \d+\b.*$|Illustrative Examples?.*$|AP [A-Z][a-z]+.*Course and Exam Description.*$|Course Framework V\.\d.*$|Return to Table of Contents.*$|© \d{4} College Board.*$|Learning Objective [A-Z]\b.*$|SUGGESTED SKILLS.*$|BIG IDEA \d.*$|AVAILABLE RESOURCES.*$|Course Framework.*$|\bX?\s*EXCLUSION STATEMENT.*$|ILLUSTRATIVE EXAMPLES?.*$|RELEVANT EQUATIONS.*$)/g;

function tidyTopic(t) {
  let s = t
    .replace(/\s*R+equi.*$/i, '')
    .replace(/\s*\w{0,4}n to (?:table of )?contents.*$/i, '')
    .replace(/\s*Course\b[\w\s]{0,12}Framework.*$/i, '')
    .replace(/\s+Course(?:\s+\w{1,5}){1,3}$/, '')
    .replace(/\s+(?:For\s+[A-Z]{2,5}-\d|§).*$/, '')
    .replace(/\bpK a\b/g, 'pKa')
    .replace(/\be x\b/g, 'eˣ')
    .replace(/\s*\b(?:ESSENTIAL KNOWLEDGE|LEARNING OBJECTIVE|Required Course Content).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (/\bbc only\b/i.test(s)) s = `${s.replace(/\s*\bbc only\b.*$/i, '')} (BC only)`;
  return s;
}

export function parseCED(raw, course) {
  // Rebuild the text on one line but remember where each original line started, so line-based
  // headings (topic tables in "Unit at a Glance") can be placed too.
  const lines = cleanText(raw).split('\n');
  let text = '';
  const lineAt = [];
  for (const l of lines) {
    lineAt.push(text.length);
    text += `${l.trim()} `;
  }
  text = text.replace(/ {2,}/g, ' ');
  const units = course.units.map(() => ({ topics: [], los: [], eks: [] }));
  const start = course.unitStart || 1;
  const unitNames = new Set(course.units.map((u) => u.title.toLowerCase()));
  const CONNECTOR = /\b(and|of|the|in|to|for|with|on|by|a|an|or|using)$|[,:]$/i;
  const markers = [];
  const addTopic = (at, un, tn, title, authoritative = false) => {
    const u = parseInt(un, 10) - start;
    if (u < 0 || u >= units.length) return;
    markers.push({ at, u });
    const num = `${un}.${tn}`;
    const clean = title.replace(/\s*continued on next page.*$/i, '').trim();
    const have = units[u].topics.find((t) => t.num === num);
    if (!have) units[u].topics.push({ num, title: clean });
    else if (authoritative) have.title = clean;
  };
  // Authoritative titles come from each topic's own page: a "TOPIC 4.5" line followed by the title
  // (possibly wrapped over a few lines). Unit-at-a-glance tables are only a fallback.
  // Section headings end a title; page furniture (running headers, page numbers) is skipped over.
  const STOP = /^(Required Course Content|LEARNING OBJECTIVE|SUGGESTED|ENDURING|BIG IDEA|THEMATIC|Thematic Focus|AVAILABLE|ESSENTIAL|TOPIC\s+\d|Skills?\b|Science Practice|[A-Z]{2,4}-\d)/i;
  const FURNITURE = /^(UNIT|PERIOD|\d{1,3}|Course\s*Framework.*|Return to.*|©.*|AP [A-Z].*Course and Exam Description.*|.*\|\s*\d+.*)$/i;
  const fromPages = new Map();
  lines.forEach((l, i) => {
    const m = l.trim().match(/^TOPIC\s+(\d{1,2})\.(\d{1,2})\s*(.*)$/);
    if (!m) return;
    const parts = m[3] ? [m[3]] : [];
    for (let j = i + 1; j < Math.min(lines.length, i + 20) && parts.length < 8; j++) {
      const t = lines[j].trim();
      if (!t || FURNITURE.test(t)) continue;
      if (STOP.test(t) || t.length > 55) break; // headings are short; a long line is body text
      // The unit name also appears as a running header — skip it unless the title is mid-phrase.
      if (unitNames.has(t.toLowerCase()) && parts.length && !CONNECTOR.test(parts.join(' '))) continue;
      parts.push(t);
    }
    const title = tidyTopic(parts.join(' '));
    if (title.length >= 3 && title.length <= 120) {
      fromPages.set(`${m[1]}.${m[2]}`, true);
      addTopic(lineAt[i], m[1], m[2], title, true);
    }
  });
  lines.forEach((l, i) => {
    const m = l.trim().match(TOPIC_LINE);
    if (!m || /\d\s*%/.test(l) || fromPages.has(`${m[1]}.${m[2]}`)) return;
    let title = m[3];
    // Table rows wrap too: "1.3 Rates of Change in" + "Linear and Quadratic Functions".
    for (let j = i + 1; CONNECTOR.test(title) && j < Math.min(lines.length, i + 4); j++) {
      const t = lines[j].trim();
      if (!t) continue;
      if (t.length > 45 || /^\d/.test(t) || STOP.test(t)) break;
      title += ` ${t}`;
    }
    addTopic(lineAt[i], m[1], m[2], tidyTopic(title), false);
  });
  for (const m of text.matchAll(/\b(?:UNIT|Unit|PERIOD|Period)\s+(\d{1,2})\b/g)) {
    const u = parseInt(m[1], 10) - start;
    if (u >= 0 && u < units.length) markers.push({ at: m.index, u, weak: true });
  }
  markers.sort((a, b) => a.at - b.at);
  const unitAt = (pos) => {
    let u = -1;
    for (const mk of markers) {
      if (mk.at > pos) break;
      u = mk.u;
    }
    return u;
  };

  // Coded statements: learning objectives ("ENE-1.D …") and essential knowledge ("ENE-1.D.1 …").
  const codes = [...text.matchAll(CODE), ...text.matchAll(NUMCODE)].sort((a, b) => a.index - b.index);
  const byCode = new Map();
  codes.forEach((m, i) => {
    const code = m[1];
    const end = i + 1 < codes.length ? codes[i + 1].index : Math.min(text.length, m.index + 600);
    const body = text
      .slice(m.index + code.length, end)
      .replace(/\s§\s.*$/, '') // illustrative-example lists
      .replace(NOISE, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+(?:i|ii|iii|iv|v|vi)\.?$/, '')
      .replace(/\s+\d\.[A-Z](?=\s|$).*$/, '') // trailing skill codes like "1.C"
      .trim();
    if (body.length < 12) return;
    const numeric = /^\d/.test(code);
    const u = numeric ? parseInt(code, 10) - start : unitAt(m.index);
    if (u < 0 || u >= units.length) return;
    // English CEDs code every statement ("CLE-1.Y") as essential knowledge — no objectives to pair.
    const isLO = course.skillBased ? false : numeric ? /\.[A-Z]$/.test(code) : /-\d+\.[A-Z]$/.test(code) || (LO_VERB.test(body) && !/\.\d+$/.test(code) && !/^KC-/.test(code));
    // First sentence — but don't stop at list markers like "i." / "ii.".
    const firstStop = body.search(/(?<!\b(?:i|ii|iii|iv|v|vi|vii|viii)\.)(?<=[.?!])\s+(?=[A-Z])/);
    const textOut = isLO ? (firstStop > 0 && firstStop < 300 ? body.slice(0, firstStop) : body.slice(0, 300)) : body.slice(0, 480);
    // CEDs repeat codes (tables, summaries) — keep the fullest version.
    const prev = byCode.get(code);
    if (!prev || textOut.length > prev.text.length) byCode.set(code, { code, at: prev?.at ?? m.index, text: textOut, u, isLO });
  });
  for (const x of byCode.values()) (x.isLO ? units[x.u].los : units[x.u].eks).push({ code: x.code, at: x.at, text: x.text });
  for (const u of units) u.eks.sort((a, b) => a.at - b.at);
  // History CEDs: "Learning Objective A  Explain the context in which…"
  for (const m of text.matchAll(HISTORY_LO)) {
    const u = unitAt(m.index);
    if (u < 0) continue;
    const t = m[2].replace(/\s+/g, ' ').trim();
    if (!units[u].los.some((x) => x.text === t)) units[u].los.push({ code: `LO-${u + start}${m[1]}-${m.index}`, at: m.index, text: t });
  }
  for (const u of units) u.los.sort((a, b) => a.at - b.at);
  return units;
}

// Turn one parsed CED unit into study cards.
export function cedCards(unit, { maxCards = 40 } = {}) {
  const cards = [];
  // Learning objective → its essential knowledge (these double as short free-response prompts).
  unit.los.forEach((lo, i) => {
    let pick = unit.eks.filter((ek) => ek.code.startsWith(`${lo.code}.`));
    if (!pick.length) {
      // No shared code (history CEDs): use the statements that follow it, up to the next objective.
      const next = unit.los[i + 1]?.at ?? Infinity;
      pick = unit.eks.filter((ek) => ek.at > lo.at && ek.at < next);
    }
    if (!pick.length) pick = unit.eks.filter((ek) => ek.code.startsWith(lo.code.replace(/\.[A-Z]$/, '')));
    pick = pick.slice(0, 3);
    if (!pick.length) return;
    cards.push({ term: lo.text.replace(/\.$/, ''), def: pick.map((e) => e.text).join(' '), kind: 'qa', tag: lo.code });
  });
  // Essential knowledge text → definitions & fill-in-the-blank facts.
  // Skip formula-sheet fragments and example lists when mining facts.
  const clean = unit.eks.map((e) => e.text).filter((t) => !/[=§]|\bX\s*—/.test(t));
  const g = generateCards(clean.join('\n\n'), { maxCards });
  cards.push(...g.cards);
  return { cards, keyPoints: g.keyPoints, topics: unit.topics.map((t) => `${t.num} ${t.title}`) };
}

// ---------------- Multiple-choice sheets ----------------
// Recognises "1. Stem … (A) … (B) … (C) … (D) …" (also "A." / "A)") and answer keys written as
// "Answer: C", "Correct answer (C)", or an answer-key list "1. C 2. A 3. D" at the end.
export function parseMCQ(raw) {
  const text = cleanText(raw).replace(/\r/g, '');
  const keyAt = text.search(/\banswer\s+key\b|\n\s*answers\s*\n/i);
  const body = keyAt > 200 ? text.slice(0, keyAt) : text;
  const key = new Map();
  if (keyAt > 200) {
    for (const m of text.slice(keyAt).matchAll(/(\d{1,3})\s*[.):\-]?\s*\(?([A-E])\)?(?=[\s,;]|$)/g)) key.set(parseInt(m[1], 10), m[2]);
  }
  // Question starts: "1.", "1)", "Question 1", "Question 1 of 20"
  const starts = [...body.matchAll(/(?:^|\n)\s*(?:question\s+(\d{1,3})(?:\s+of\s+\d+)?\s*[.:)]?|(\d{1,3})[.)])\s+(?=\S)/gi)];
  const out = [];
  const ANSWER = /\b(?:correct\s+answer|answer(?:\s+key)?|key)\s*(?:is)?\s*[:\-]?\s*\(?([A-Ea-e])\)?(?![A-Za-z])/i;
  const EXPLAIN = /\b(?:explanation|rationale|reason|why)\s*[:\-]/i;
  starts.forEach((m, i) => {
    const num = parseInt(m[1] || m[2], 10);
    const from = m.index + m[0].length;
    const to = i + 1 < starts.length ? starts[i + 1].index : body.length;
    const block = body.slice(from, to);
    // Choice markers: "(A) ", "A. ", "A) ", "a) ", or a letter alone on its own line.
    const raw = [...block.matchAll(/(?:^|\n|\s)(?:\(([A-Ea-e])\)|([A-E])[.)]|([a-e])[.)]|([A-E])(?=\s*\n))\s*(?=\S)/g)].map((x) => ({ index: x.index, len: x[0].length, letter: (x[1] || x[2] || x[3] || x[4]).toUpperCase() }));
    const marks = [];
    for (const x of raw) if (x.letter === 'ABCDE'[marks.length]) marks.push(x);
    if (marks.length < 3) return;
    const stem = block.slice(0, marks[0].index).replace(/\s+/g, ' ').trim();
    if (stem.length < 8) return;
    let explain = '';
    const choices = marks.map((mk, j) => {
      const end = j + 1 < marks.length ? marks[j + 1].index : block.length;
      let c = block.slice(mk.index + mk.len, end);
      const cut = c.search(new RegExp(`${ANSWER.source}|${EXPLAIN.source}`, 'i'));
      if (cut >= 0) {
        if (j === marks.length - 1) {
          const tail = c.slice(cut);
          const e = tail.search(EXPLAIN);
          if (e >= 0) explain = tail.slice(e).replace(EXPLAIN, '').replace(/\s+/g, ' ').trim().slice(0, 600);
        }
        c = c.slice(0, cut);
      }
      return c.replace(/\s+/g, ' ').trim();
    });
    if (choices.some((c) => !c)) return;
    const inline = block.slice(marks[0].index).match(ANSWER);
    const letter = inline?.[1] || key.get(num) || null;
    out.push({ stem, choices, answer: letter ? 'ABCDE'.indexOf(letter.toUpperCase()) : null, num, explain });
  });
  return out;
}

// ---------------- Free-response prompts ----------------
export function splitFRQ(raw) {
  // Drop page furniture from released exams (copyright lines, headers, "GO ON TO THE NEXT PAGE").
  const text = cleanText(raw)
    .split('\n')
    .filter((l) => !/©\s*\d{4} College Board|Visit College Board|collegeboard\.org|GO ON TO THE NEXT PAGE|^\s*AP [A-Z ]+\d{4}.*FREE-RESPONSE QUESTIONS\s*$|^\s*STOP\s*$|^\s*END OF EXAM\s*$/i.test(l))
    .join('\n');
  const parts = text
    .split(/\n\s*(?=(?:question\s+)?\d{1,2}[.)]\s)/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 60)
    // Skip cover pages and directions blocks.
    .filter((p) => !/\bDirections:|Free-Response Questions\s*$|^\d{4}\s+AP\b/i.test(p.slice(0, 400)) || /\?|\b(describe|explain|identify|justify|predict|calculate)\b/i.test(p.slice(0, 600)));
  return (parts.length ? parts : [text]).slice(0, 30).map((p) => p.replace(/^(?:question\s+)?\d{1,2}[.)]\s+/i, '').replace(/\n{3,}/g, '\n\n'));
}

// ---------------- Which unit is this material about? ----------------
export function detectUnit(raw, course) {
  const text = raw.slice(0, 20000);
  const start = course.unitStart || 1;
  const votes = new Array(course.units.length).fill(0);
  for (const m of text.matchAll(/\b(?:unit|period|big idea)\s+(\d{1,2})\b/gi)) {
    const u = parseInt(m[1], 10) - start;
    if (u >= 0 && u < votes.length) votes[u] += m.index < 1500 ? 5 : 1;
  }
  for (const m of text.matchAll(/\btopic\s+(\d{1,2})\.\d{1,2}\b/gi)) {
    const u = parseInt(m[1], 10) - start;
    if (u >= 0 && u < votes.length) votes[u] += 2;
  }
  const lower = text.toLowerCase();
  course.units.forEach((unit, i) => {
    const words = unit.title.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 4);
    for (const w of words) {
      const n = lower.split(w).length - 1;
      votes[i] += Math.min(n, 6) * 0.4;
    }
  });
  const best = votes.indexOf(Math.max(...votes));
  return votes[best] >= 1.2 ? best : -1;
}
