// Parsers for AP material: Course and Exam Descriptions (CEDs), multiple-choice question sheets
// (AP Classroom printouts, teacher handouts, released practice), and free-response prompts.
import { generateCards, cleanText } from './gen.js';

// ---------------- CED ----------------
// CEDs list, for each topic, Learning Objectives (e.g. "ENE-1.D Describe the properties of enzymes.")
// and Essential Knowledge statements (e.g. "ENE-1.D.1 The structure of enzymes includes…").
// History CEDs use key-concept codes like "KC-3.1.I.A". We pull those statements and file them
// under the unit given by the surrounding "TOPIC u.t" heading.
const CODE = /\b((?:[A-Z]{2,5})-\d+(?:\.[A-Z0-9]{1,4}){1,4})\b/g;
const LO_VERB = /^(describe|explain|identify|calculate|determine|represent|compare|analyze|analyse|evaluate|justify|predict|construct|interpret|use|apply|create|develop|define|relate|make|select|articulate|connect|sketch)\b/i;

export function parseCED(raw, course) {
  const text = cleanText(raw).replace(/\s+/g, ' ');
  const units = course.units.map(() => ({ topics: [], los: [], eks: [] }));
  const start = course.unitStart || 1;

  // Topic headings give us positions → unit numbers.
  const markers = [];
  for (const m of text.matchAll(/\bTOPIC\s+(\d{1,2})\.(\d{1,2})\s+([A-Z][^.]{2,90}?)(?=\s+(?:Required|SUGGESTED|Suggested|ENDURING|LEARNING|Learning|THEMATIC|Thematic|Skill|SKILL|AVAILABLE|Available|\d+\.\d|$))/g)) {
    const u = parseInt(m[1], 10) - start;
    if (u >= 0 && u < units.length) {
      markers.push({ at: m.index, u });
      const title = m[3].trim();
      if (!units[u].topics.some((t) => t.num === `${m[1]}.${m[2]}`)) units[u].topics.push({ num: `${m[1]}.${m[2]}`, title });
    }
  }
  for (const m of text.matchAll(/\bUNIT\s+(\d{1,2})\b/g)) {
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

  // Split text at every code; each chunk is "CODE statement…".
  const codes = [...text.matchAll(CODE)];
  const seen = new Set();
  codes.forEach((m, i) => {
    const code = m[1];
    const end = i + 1 < codes.length ? codes[i + 1].index : Math.min(text.length, m.index + 600);
    let body = text
      .slice(m.index + code.length, end)
      .replace(/\b(ESSENTIAL KNOWLEDGE|LEARNING OBJECTIVE|ENDURING UNDERSTANDING|Required Course Content|EXCLUSION STATEMENT|HISTORICAL DEVELOPMENTS?|KEY CONCEPTS?|TOPIC \d+\.\d+.*$|UNIT \d+\b.*$|Illustrative Examples?.*$|AP [A-Z][a-z]+.*Course and Exam Description.*$|Course Framework V\.\d.*$|Return to Table of Contents.*$|© \d{4} College Board.*$)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Keep only the first sentence-ish run for LOs; EKs can be a couple of sentences.
    if (body.length < 12 || seen.has(code)) return;
    const firstStop = body.search(/(?<=[.?!])\s+(?=[A-Z])/);
    const u = unitAt(m.index);
    if (u < 0) return;
    seen.add(code);
    const isLO = /-\d+\.[A-Z]$/.test(code) || (LO_VERB.test(body) && !/\.\d+$/.test(code));
    if (isLO) units[u].los.push({ code, text: firstStop > 0 ? body.slice(0, firstStop) : body.slice(0, 220) });
    else units[u].eks.push({ code, text: body.slice(0, 420) });
  });
  return units;
}

// Turn one parsed CED unit into study cards.
export function cedCards(unit) {
  const cards = [];
  // Learning objective → its essential knowledge (these double as short free-response prompts).
  for (const lo of unit.los) {
    const eks = unit.eks.filter((ek) => ek.code.startsWith(`${lo.code}.`) || ek.code.startsWith(lo.code.replace(/\.[A-Z]$/, '')));
    const own = eks.filter((ek) => ek.code.startsWith(`${lo.code}.`));
    const pick = (own.length ? own : eks).slice(0, 2);
    if (!pick.length) continue;
    cards.push({ term: lo.text.replace(/\.$/, ''), def: pick.map((e) => e.text).join(' '), kind: 'qa', tag: lo.code });
  }
  // Essential knowledge text → definitions & fill-in-the-blank facts.
  const g = generateCards(unit.eks.map((e) => e.text).join('\n\n'), { maxCards: 40 });
  cards.push(...g.cards);
  return { cards, keyPoints: g.keyPoints, topics: unit.topics.map((t) => `${t.num} ${t.title}`) };
}

// ---------------- Multiple-choice sheets ----------------
// Recognises "1. Stem … (A) … (B) … (C) … (D) …" (also "A." / "A)") and answer keys written as
// "Answer: C", "Correct answer (C)", or an answer-key list "1. C 2. A 3. D" at the end.
export function parseMCQ(raw) {
  const text = cleanText(raw).replace(/\r/g, '');
  const keyAt = text.search(/\banswer\s+key\b|\banswers\b\s*\n/i);
  const body = keyAt > 200 ? text.slice(0, keyAt) : text;
  const key = new Map();
  if (keyAt > 200) {
    for (const m of text.slice(keyAt).matchAll(/(\d{1,3})\s*[.):\-]?\s*\(?([A-E])\)?(?=[\s,;]|$)/g)) key.set(parseInt(m[1], 10), m[2]);
  }
  const starts = [...body.matchAll(/(?:^|\n)\s*(?:question\s*)?(\d{1,3})[.)]\s+(?=\S)/gi)];
  const out = [];
  starts.forEach((m, i) => {
    const num = parseInt(m[1], 10);
    const from = m.index + m[0].length;
    const to = i + 1 < starts.length ? starts[i + 1].index : body.length;
    const block = body.slice(from, to);
    const marks = [...block.matchAll(/(?:^|\n|\s)\(?([A-E])[).]\s+(?=\S)/g)].filter((x, j, arr) => x[1] === 'ABCDE'[j] && (j === 0 || arr[j - 1].index < x.index));
    if (marks.length < 3) return;
    const stem = block.slice(0, marks[0].index).replace(/\s+/g, ' ').trim();
    if (stem.length < 8) return;
    const choices = marks.map((mk, j) => {
      const end = j + 1 < marks.length ? marks[j + 1].index : block.length;
      return block
        .slice(mk.index + mk[0].length, end)
        .replace(/\b(correct\s+)?answer\s*[:\-]?\s*\(?[A-E]\)?.*$/is, '')
        .replace(/\s+/g, ' ')
        .trim();
    });
    if (choices.some((c) => !c)) return;
    const inline = block.match(/\b(?:correct\s+)?answer\s*(?:is)?\s*[:\-]?\s*\(?([A-E])\)?(?![a-z])/i);
    const letter = inline?.[1] || key.get(num) || null;
    out.push({ stem, choices, answer: letter ? 'ABCDE'.indexOf(letter.toUpperCase()) : null, num });
  });
  return out;
}

// ---------------- Free-response prompts ----------------
export function splitFRQ(raw) {
  const text = cleanText(raw);
  const parts = text.split(/\n\s*(?=(?:question\s+)?\d{1,2}[.)]\s)/i).map((p) => p.trim()).filter((p) => p.length > 60);
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
