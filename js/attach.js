// Screenshots: upload, gallery, full-screen viewer and the Files page.
// Every image is compressed, then encrypted with your data key before it's stored.
import { el, add, clear, uid, fmtDate, fmtTime } from './util.js';
import { modal, confirmBox, toast } from './ui.js';
import { compressImage, askPersistence, storageEstimate } from './files.js';

export const KINDS = {
  schedule: { label: 'Schedule', icon: '🗓' },
  work: { label: 'Class work', icon: '📝' },
  notes: { label: 'Notes', icon: '🗒' },
};

// ---------- decrypted image URLs (memory only, wiped on lock) ----------
const urlCache = new Map();
export function forgetImages() {
  for (const url of urlCache.values()) URL.revokeObjectURL(url);
  urlCache.clear();
}
async function imageUrl(app, key) {
  if (urlCache.has(key)) return urlCache.get(key);
  const bytes = await app.session.loadFile(key);
  if (!bytes) throw new Error('missing');
  const url = URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' }));
  urlCache.set(key, url);
  return url;
}

function niceName(file) {
  const base = (file.name || '').replace(/\.[^.]+$/, '');
  if (!base || /^image$/i.test(base)) return `Screenshot ${fmtDate(new Date())}, ${fmtTime(new Date())}`;
  return base.slice(0, 80);
}

// ---------- upload ----------
export async function uploadFiles(app, fileList, meta = {}) {
  const images = [...(fileList || [])].filter((f) => f.type.startsWith('image/'));
  if (!images.length) {
    toast('Only images (PNG, JPG, screenshots) can be added.');
    return [];
  }
  askPersistence();
  const added = [];
  for (const file of images) {
    try {
      const img = await compressImage(file);
      const id = uid();
      await app.session.saveFile(id, img.full);
      await app.session.saveFile(`${id}.t`, img.thumb);
      const a = {
        id,
        name: niceName(file),
        caption: '',
        kind: meta.kind || 'work',
        classId: meta.classId || null,
        itemId: meta.itemId || null,
        w: img.w,
        h: img.h,
        size: img.full.length,
        createdAt: new Date().toISOString(),
      };
      app.data.attachments.push(a);
      added.push(a);
    } catch (err) {
      console.error(err);
      toast(err.message || `Couldn't save "${file.name}".`);
    }
  }
  if (added.length) {
    app.commit({ render: false });
    toast(`🔒 ${added.length} screenshot${added.length > 1 ? 's' : ''} encrypted & saved`);
  }
  return added;
}

export async function deleteAttachment(app, a) {
  app.data.attachments = app.data.attachments.filter((x) => x.id !== a.id);
  app.commit({ render: false });
  for (const key of [a.id, `${a.id}.t`]) {
    if (urlCache.has(key)) URL.revokeObjectURL(urlCache.get(key));
    urlCache.delete(key);
    await app.session.deleteFile(key).catch(() => {});
  }
}

// ---------- thumbnails + gallery ----------
function thumb(app, a, onOpen) {
  const img = el('img', { alt: a.caption || a.name, loading: 'lazy' });
  imageUrl(app, `${a.id}.t`)
    .then((u) => (img.src = u))
    .catch(() => img.replaceWith(el('div', { class: 'shot-missing' }, '⚠')));
  const cls = app.classById(a.classId);
  return el(
    'button',
    { type: 'button', class: 'shot', onclick: onOpen, title: a.caption || a.name },
    el('div', { class: 'shot-img' }, img),
    el(
      'div',
      { class: 'shot-cap' },
      cls && el('span', { class: 'dot', style: { background: cls.color } }),
      el('span', { class: 'shot-name' }, a.caption || a.name),
    ),
  );
}

function wireDrop(target, onFiles) {
  target.addEventListener('dragover', (e) => {
    if (![...(e.dataTransfer?.types || [])].includes('Files')) return;
    e.preventDefault();
    target.classList.add('drag');
  });
  target.addEventListener('dragleave', (e) => {
    if (!target.contains(e.relatedTarget)) target.classList.remove('drag');
  });
  target.addEventListener('drop', (e) => {
    e.preventDefault();
    target.classList.remove('drag');
    if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
  });
}

// A drop zone + thumbnail grid for whatever `filter` selects. New uploads get `meta()`.
export function gallery(app, { filter, meta, empty, compact = false, onChange }) {
  const grid = el('div', { class: `shots${compact ? ' compact' : ''}` });
  const input = el('input', { type: 'file', accept: 'image/*', multiple: true, class: 'hidden' });
  const status = el('span', { class: 'small muted' });

  const refresh = () => {
    clear(grid);
    const list = app.data.attachments.filter(filter).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (!list.length && empty) add(grid, el('div', { class: 'muted small shots-empty' }, empty));
    list.forEach((a, i) =>
      add(
        grid,
        thumb(app, a, () =>
          openViewer(app, list, i, () => {
            refresh();
            onChange?.();
          }),
        ),
      ),
    );
  };

  const upload = async (fileList) => {
    status.textContent = 'Encrypting…';
    await uploadFiles(app, fileList, meta());
    status.textContent = '';
    refresh();
    onChange?.();
  };
  input.addEventListener('change', () => {
    upload(input.files);
    input.value = '';
  });

  const zone = el(
    'div',
    { class: 'dropzone' },
    el('button', { type: 'button', class: 'btn sm', onclick: () => input.click() }, '📷 Add screenshots'),
    el('span', { class: 'small muted' }, 'or drag & drop · paste with Ctrl/⌘+V'),
    status,
    input,
  );
  const wrap = el('div', { class: 'gallery' }, zone, grid);
  wireDrop(wrap, upload);
  refresh();
  app.pasteTarget = upload;
  return wrap;
}

// ---------- viewer ----------
export function openViewer(app, list, index, onChange) {
  let i = index;
  const onKey = (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' && i < list.length - 1) {
      i++;
      ctl.rebuild();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      i--;
      ctl.rebuild();
    }
  };
  document.addEventListener('keydown', onKey);

  const ctl = modal(
    'Screenshot',
    (m) => {
      const a = list[i];
      const img = el('img', { alt: a.caption || a.name, class: 'viewer-img' });
      const frame = el('div', { class: 'viewer-frame' }, el('div', { class: 'muted small' }, 'Decrypting…'));
      imageUrl(app, a.id)
        .then((u) => {
          img.src = u;
          clear(frame).appendChild(img);
          img.addEventListener('click', () => img.classList.toggle('zoom'));
        })
        .catch(() => (clear(frame).textContent = 'This image is missing on this device.'));

      const caption = el('input', { type: 'text', value: a.caption, placeholder: a.name });
      caption.addEventListener('change', () => {
        a.caption = caption.value.trim();
        app.commit({ render: false });
        onChange?.();
      });
      const cls = el('select', {}, el('option', { value: '' }, 'No class'), app.data.classes.map((c) => el('option', { value: c.id }, c.name)));
      cls.value = a.classId || '';
      cls.addEventListener('change', () => {
        a.classId = cls.value || null;
        app.commit({ render: false });
        onChange?.();
      });
      const kind = el('select', {}, Object.entries(KINDS).map(([k, v]) => el('option', { value: k }, `${v.icon} ${v.label}`)));
      kind.value = a.kind;
      kind.addEventListener('change', () => {
        a.kind = kind.value;
        app.commit({ render: false });
        onChange?.();
      });
      const item = a.itemId && app.itemById(a.itemId);

      return el(
        'div',
        { class: 'stack' },
        frame,
        list.length > 1 &&
          el(
            'div',
            { class: 'row' },
            el('button', { class: 'btn sm', disabled: i === 0, onclick: () => (i--, m.rebuild()) }, '◀ Prev'),
            el('span', { class: 'spacer muted small', style: { textAlign: 'center' } }, `${i + 1} of ${list.length}`),
            el('button', { class: 'btn sm', disabled: i === list.length - 1, onclick: () => (i++, m.rebuild()) }, 'Next ▶'),
          ),
        el('label', { class: 'field' }, el('span', {}, 'Caption'), caption),
        el('div', { class: 'grid-2' }, el('label', { class: 'field' }, el('span', {}, 'Class'), cls), el('label', { class: 'field' }, el('span', {}, 'Type'), kind)),
        el(
          'div',
          { class: 'small muted' },
          `Added ${fmtDate(a.createdAt, { year: true })} · ${a.w}×${a.h} · ${Math.round(a.size / 1024)} KB · 🔒 encrypted`,
          item ? ` · attached to “${item.title}”` : '',
        ),
        el(
          'div',
          { class: 'row' },
          el(
            'button',
            {
              class: 'btn danger',
              onclick: async () => {
                if (!(await confirmBox('Delete this screenshot? This can’t be undone.', { ok: 'Delete', danger: true }))) return;
                await deleteAttachment(app, a);
                list.splice(i, 1);
                onChange?.();
                if (!list.length) return m.close();
                i = Math.min(i, list.length - 1);
                m.rebuild();
              },
            },
            'Delete',
          ),
          el('span', { class: 'spacer' }),
          el(
            'button',
            {
              class: 'btn',
              onclick: async () => {
                const url = await imageUrl(app, a.id);
                const link = el('a', { href: url, download: `${(a.caption || a.name).replace(/[^\w .-]+/g, '_')}.jpg` });
                document.body.appendChild(link);
                link.click();
                link.remove();
              },
            },
            '↓ Download',
          ),
          el('button', { class: 'btn primary', onclick: () => m.close() }, 'Done'),
        ),
      );
    },
    { center: true, wide: true, onClose: () => document.removeEventListener('keydown', onKey) },
  );
  return ctl;
}

// ---------- Files page ----------
export function renderFiles(app, pageTitle) {
  const st = (app.viewState.files ||= { classId: 'all', kind: 'all', uploadKind: 'schedule', uploadClass: '' });
  const filter = (a) => (st.classId === 'all' || (a.classId || 'none') === st.classId) && (st.kind === 'all' || a.kind === st.kind);

  const kindSel = el('select', { 'aria-label': 'Screenshot type' }, Object.entries(KINDS).map(([k, v]) => el('option', { value: k }, `${v.icon} ${v.label}`)));
  kindSel.value = st.uploadKind;
  kindSel.addEventListener('change', () => (st.uploadKind = kindSel.value));
  const classSel = el('select', { 'aria-label': 'Class' }, el('option', { value: '' }, 'No class / general'), app.data.classes.map((c) => el('option', { value: c.id }, c.name)));
  classSel.value = st.uploadClass;
  classSel.addEventListener('change', () => (st.uploadClass = classSel.value));

  const usage = el('span', { class: 'small faint' });
  storageEstimate().then((e) => {
    if (e?.quota) usage.textContent = `Using ${(e.usage / 1048576).toFixed(1)} MB of ~${Math.round(e.quota / 1048576)} MB available on this device`;
  });

  const chip = (value, label, key) =>
    el('button', { class: st[key] === value ? 'on' : '', onclick: () => app.go('files', { [key]: value }) }, label);

  const total = app.data.attachments.length;
  const filtered = app.data.attachments.filter(filter).length;

  return el(
    'div',
    {},
    pageTitle('Files', el('span', { class: 'muted' }, `${total} screenshot${total === 1 ? '' : 's'}`)),
    el(
      'div',
      { class: 'card stack', style: { marginBottom: '16px' } },
      el('h3', { style: { marginBottom: 0 } }, '📷 Upload screenshots'),
      el('p', { class: 'small muted', style: { margin: 0 } }, 'Snap your class schedule, a syllabus, homework sheets, whiteboard notes — anything. Each image is shrunk and encrypted with your password before it’s saved. On a phone you can take a photo directly.'),
      el('div', { class: 'grid-2' }, el('label', { class: 'field' }, el('span', {}, 'This is a…'), kindSel), el('label', { class: 'field' }, el('span', {}, 'For class'), classSel)),
      gallery(app, {
        filter: () => false,
        meta: () => ({ kind: st.uploadKind, classId: st.uploadClass || null }),
        onChange: () => app.render(),
      }),
      usage,
    ),
    el(
      'div',
      { class: 'filters' },
      el('div', { class: 'seg' }, chip('all', 'All', 'kind'), Object.entries(KINDS).map(([k, v]) => chip(k, `${v.icon} ${v.label}`, 'kind'))),
      (() => {
        const s = el('select', { 'aria-label': 'Filter by class' }, el('option', { value: 'all' }, 'All classes'), app.data.classes.map((c) => el('option', { value: c.id }, c.name)), el('option', { value: 'none' }, 'No class'));
        s.value = st.classId;
        s.addEventListener('change', () => app.go('files', { classId: s.value }));
        return s;
      })(),
    ),
    total
      ? filtered
        ? groupedGalleries(app, filter)
        : el('div', { class: 'card empty' }, 'No screenshots match these filters.')
      : el('div', { class: 'card empty' }, el('div', { class: 'big' }, '🖼'), 'No screenshots yet. Add your class schedule above to get started.'),
  );
}

function groupedGalleries(app, filter) {
  const groups = [...app.data.classes.map((c) => ({ id: c.id, name: c.name, color: c.color })), { id: null, name: 'No class', color: 'var(--faint)' }];
  const out = el('div', { class: 'stack' });
  for (const g of groups) {
    const has = app.data.attachments.some((a) => filter(a) && (a.classId || null) === g.id);
    if (!has) continue;
    add(
      out,
      el(
        'div',
        { class: 'card' },
        el('h3', {}, el('span', { class: 'dot', style: { background: g.color } }), g.name),
        galleryGrid(app, (a) => filter(a) && (a.classId || null) === g.id),
      ),
    );
  }
  return out;
}

// Grid only (no upload zone).
function galleryGrid(app, filter) {
  const grid = el('div', { class: 'shots' });
  const list = app.data.attachments.filter(filter).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  list.forEach((a, i) => add(grid, thumb(app, a, () => openViewer(app, list, i, () => app.render()))));
  return grid;
}

// Opens all schedule screenshots (used from the Launchpad).
export function openSchedule(app) {
  const list = app.data.attachments.filter((a) => a.kind === 'schedule').sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (list.length) openViewer(app, list, 0, () => app.render());
}

