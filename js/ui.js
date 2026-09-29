// Shared UI pieces: modals, toasts, confetti, SVG.
import { el, add, clear } from './util.js';

// Modals stack, so e.g. a screenshot viewer can open on top of the item editor.
const stack = [];

export function modal(title, build, { center = false, wide = false, onClose } = {}) {
  const body = el('div', { class: `modal${wide ? ' wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
  const back = el('div', { class: `modal-back${center ? ' center' : ''}` }, body);
  const close = () => {
    const i = stack.indexOf(ctl);
    if (i === -1) return;
    stack.splice(i, 1);
    back.remove();
    document.removeEventListener('keydown', onKey, true);
    onClose?.();
  };
  const onKey = (e) => {
    if (e.key === 'Escape' && stack[stack.length - 1] === ctl) {
      e.stopPropagation();
      close();
    }
  };
  const ctl = { close, body, rebuild: () => render() };
  const render = () => {
    clear(body);
    add(
      body,
      el('div', { class: 'modal-head' }, el('h3', {}, title), el('button', { class: 'btn icon ghost', 'aria-label': 'Close', onclick: close }, '✕')),
      build(ctl),
    );
  };
  back.addEventListener('mousedown', (e) => {
    if (e.target === back) close();
  });
  document.addEventListener('keydown', onKey, true);
  render();
  document.body.appendChild(back);
  stack.push(ctl);
  setTimeout(() => body.querySelector('input:not([type=checkbox]):not([type=file]), select, textarea')?.focus(), 30);
  return ctl;
}

export function closeModal() {
  while (stack.length) stack[stack.length - 1].close();
}
export function modalOpen() {
  return stack.length > 0;
}

export function confirmBox(message, { ok = 'Confirm', danger = false } = {}) {
  return new Promise((resolve) => {
    let answered = false;
    const m = modal(
      'Are you sure?',
      (ctl) =>
        el(
          'div',
          { class: 'stack' },
          el('p', { class: 'muted' }, message),
          el(
            'div',
            { class: 'row' },
            el('span', { class: 'spacer' }),
            el('button', { class: 'btn', onclick: () => ctl.close() }, 'Cancel'),
            el(
              'button',
              {
                class: `btn ${danger ? 'danger' : 'primary'}`,
                onclick: () => {
                  answered = true;
                  resolve(true);
                  ctl.close();
                },
              },
              ok,
            ),
          ),
        ),
      { center: true, onClose: () => !answered && resolve(false) },
    );
    return m;
  });
}

export function toast(message, { action, onAction, ms = 3200 } = {}) {
  const box = document.getElementById('toasts');
  const t = el(
    'div',
    { class: 'toast' },
    el('span', {}, message),
    action &&
      el(
        'button',
        {
          onclick: () => {
            onAction?.();
            t.remove();
          },
        },
        action,
      ),
  );
  box.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

const CONFETTI_COLORS = ['#8b6cff', '#ff6b8b', '#1fc8a9', '#ffb020', '#3aa0ff'];
export function confetti(x, y, n = 22) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
    const p = el('div', {
      class: 'confetti',
      style: {
        left: `${x}px`,
        top: `${y}px`,
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      },
    });
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist - 30}px`);
    p.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

const SVGNS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, String(v));
  for (const c of children) if (c) node.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  return node;
}

export function logo(cls = 'logo') {
  return svg(
    'svg',
    { viewBox: '0 0 64 64', class: cls, 'aria-hidden': 'true' },
    svg(
      'defs',
      {},
      svg(
        'linearGradient',
        { id: 'lg', x1: 0, y1: 0, x2: 1, y2: 1 },
        svg('stop', { offset: 0, 'stop-color': '#8b6cff' }),
        svg('stop', { offset: 1, 'stop-color': '#ff6b8b' }),
      ),
    ),
    svg('ellipse', { cx: 32, cy: 32, rx: 26, ry: 10, fill: 'none', stroke: 'url(#lg)', 'stroke-width': 3.5, transform: 'rotate(-25 32 32)' }),
    svg('circle', { cx: 32, cy: 32, r: 10, fill: 'url(#lg)' }),
    svg('circle', { cx: 55, cy: 21, r: 4, fill: '#1fc8a9' }),
  );
}

