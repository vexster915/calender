// Small DOM + date helpers. All user text goes through textContent, never innerHTML.

// Touch devices (iPhone/iPad) have no keyboard shortcuts, so hints adapt.
export const TOUCH = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
export const kbd = (hint) => (TOUCH ? '' : hint);

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'style') Object.assign(node.style, value);
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'value') node.value = value;
    else if (key === 'checked') node.checked = !!value;
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }
  appendChildren(node, children);
  return node;
}

function appendChildren(node, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) appendChildren(node, child);
    else if (child instanceof Node) node.appendChild(child);
    else node.appendChild(document.createTextNode(String(child)));
  }
}

// Like node.append(), but skips null/false and flattens arrays.
export function add(node, ...children) {
  appendChildren(node, children);
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function uid() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 14);
}

// ---------- dates ----------
export const DAY = 86400000;
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function dayKey(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

export function fromDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY);
}

export function fmtTime(d) {
  const x = new Date(d);
  let h = x.getHours();
  const m = x.getMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return m ? `${h}:${String(m).padStart(2, '0')}${ampm}` : `${h}${ampm}`;
}

export function fmtDate(d, opts = {}) {
  const x = new Date(d);
  const base = `${WEEKDAYS[x.getDay()]}, ${MONTHS[x.getMonth()]} ${x.getDate()}`;
  return opts.year ? `${base}, ${x.getFullYear()}` : base;
}

export function relDay(d, now = new Date()) {
  const n = daysBetween(now, d);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n > 1 && n < 7) return WEEKDAYS_LONG[new Date(d).getDay()];
  if (n < 0) return `${-n} days ago`;
  return fmtDate(d);
}

export function relDue(d, now = new Date()) {
  const ms = new Date(d) - now;
  const abs = Math.abs(ms);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / DAY);
  let s;
  if (mins < 60) s = `${mins}m`;
  else if (hours < 36) s = `${hours}h`;
  else s = `${days}d`;
  return ms < 0 ? `${s} overdue` : `in ${s}`;
}

export function fmtMinutes(min) {
  min = Math.round(min);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// yyyy-mm-ddThh:mm for <input type="datetime-local">
export function toLocalInput(d) {
  const x = new Date(d);
  return `${dayKey(x)}T${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`;
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

// ---------- color contrast ----------
function luminance(hex) {
  const h = String(hex).replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
// Text color for something drawn ON a colored background: whichever of white / ink has more contrast.
export function ink(bg) {
  if (!/^#[0-9a-f]{3,6}$/i.test(String(bg))) return '#fff';
  const L = luminance(bg);
  return (1.05 / (L + 0.05) >= (L + 0.05) / (luminance('#1c1640') + 0.05) ? '#fff' : '#1c1640');
}
// Background + text for a colored pill/block. Mid-tone colors that can't reach 4.5:1 with
// either text color get darkened slightly so labels stay readable.
export function paint(bg) {
  const color = ink(bg);
  if (color === '#fff' && /^#[0-9a-f]{3,6}$/i.test(String(bg)) && 1.05 / (luminance(bg) + 0.05) < 4.6) return { background: `color-mix(in srgb, ${bg} 80%, #000)`, color };
  return { background: bg, color };
}
// A class color used AS text: blended toward the theme's text color so it stays readable in light and dark.
export function tone(color) {
  return `color-mix(in srgb, ${color} 62%, var(--text))`;
}
