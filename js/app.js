// Orbit — app shell: authentication screens, navigation, saving, auto-lock, quick add.
import { el, add, clear, uid, fmtDate, fmtTime, debounce } from './util.js';
import * as vault from './vault.js';
import { emptyData, autoPlan, TYPE_META, logActivity } from './logic.js';
import { parseQuickAdd } from './parse.js';
import { closeModal, modalOpen, toast, logo, confetti } from './ui.js';
import { forgetImages, uploadFiles } from './attach.js';
import { VIEWS, NAV_ORDER, openItemEditor, openHelp } from './views.js';

const root = document.getElementById('root');

const app = {
  session: null,
  data: null,
  view: 'launch',
  viewState: {},
  focus: { running: false },
  saving: false,
  dirty: false,
  lastActivity: Date.now(),
  pasteTarget: null, // set by whichever screenshot gallery is on screen

  classById(id) {
    return this.data.classes.find((c) => c.id === id);
  },
  itemById(id) {
    return this.data.items.find((i) => i.id === id);
  },

  // Call after any change to data: re-renders and saves (encrypted).
  commit({ render = true } = {}) {
    this.save();
    if (render) this.render();
  },

  async save() {
    if (!this.session?.dek) return;
    if (this.saving) {
      this.dirty = true;
      return;
    }
    this.saving = true;
    setSaveState(true);
    try {
      do {
        this.dirty = false;
        await this.session.save(this.data);
      } while (this.dirty && this.session?.dek);
    } catch (err) {
      console.error(err);
      toast('Could not save — storage may be full.');
    } finally {
      this.saving = false;
      setSaveState(false);
    }
  },

  go(view, state) {
    this.view = view;
    if (state) this.viewState[view] = { ...(this.viewState[view] || {}), ...state };
    this.render();
    window.scrollTo(0, 0);
  },

  toggleDone(item, evt) {
    item.done = !item.done;
    item.doneAt = item.done ? new Date().toISOString() : null;
    if (item.done) {
      logActivity(this.data);
      if (evt) confetti(evt.clientX, evt.clientY);
      toast(`Nice — "${item.title}" done`, {
        action: 'Undo',
        onAction: () => {
          item.done = false;
          item.doneAt = null;
          this.commit();
        },
      });
    }
    this.commit();
  },

  async lock(reason) {
    if (this.saving || this.dirty) await this.save();
    closeModal();
    this.session?.lock();
    this.session = null;
    this.data = null;
    this.viewState = {};
    this.focus = { running: false };
    this.pasteTarget = null;
    forgetImages();
    renderAuth('login', reason);
  },

  render() {
    renderShell();
  },
};

// ------------------------------------------------------------------ theme
function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
  try {
    localStorage.setItem('orbit.theme', theme || 'auto');
  } catch {
    /* ignore */
  }
}
applyTheme(localStorage.getItem('orbit.theme'));
app.applyTheme = applyTheme;

// ------------------------------------------------------------------ auth screens
function renderAuth(tab = vault.listAccounts().length ? 'login' : 'signup', notice) {
  clear(root);
  const accounts = vault.listAccounts();
  const errorEl = el('div', { class: 'error', role: 'alert' });
  const noticeEl = notice ? el('div', { class: 'chip steady', style: { alignSelf: 'flex-start' } }, `🔒 ${notice}`) : null;

  const tabBtn = (id, label) =>
    el('button', { class: `btn sm ${tab === id ? 'primary' : 'ghost'}`, onclick: () => renderAuth(id), type: 'button' }, label);

  const busy = (btn, on, label) => {
    btn.disabled = on;
    btn.textContent = on ? 'Securing…' : label;
  };

  let form;
  if (tab === 'login') {
    const user = el('input', { type: 'text', autocomplete: 'username', placeholder: 'your-username', value: accounts.length === 1 ? accounts[0] : '' });
    const pass = el('input', { type: 'password', autocomplete: 'current-password', placeholder: '••••••••••' });
    const btn = el('button', { class: 'btn primary', type: 'submit' }, 'Unlock');
    form = el(
      'form',
      {
        class: 'stack',
        onsubmit: async (e) => {
          e.preventDefault();
          errorEl.textContent = '';
          busy(btn, true, 'Unlock');
          try {
            const session = await vault.login(user.value, pass.value);
            pass.value = '';
            await enter(session);
          } catch (err) {
            errorEl.textContent = err.message;
            busy(btn, false, 'Unlock');
            pass.select();
          }
        },
      },
      accounts.length > 1 &&
        el(
          'div',
          { class: 'account-chips' },
          accounts.map((a) =>
            el(
              'button',
              {
                type: 'button',
                onclick: () => {
                  user.value = a;
                  pass.focus();
                },
              },
              `@${a}`,
            ),
          ),
        ),
      el('label', { class: 'field' }, el('span', {}, 'Username'), user),
      el('label', { class: 'field' }, el('span', {}, 'Password'), pass),
      errorEl,
      btn,
      el(
        'div',
        { class: 'row small' },
        el('a', { href: '#', onclick: (e) => (e.preventDefault(), renderAuth('recover')) }, 'Forgot password?'),
        el('span', { class: 'spacer' }),
        el('a', { href: '#', onclick: (e) => (e.preventDefault(), renderAuth('import')) }, 'Restore a backup'),
      ),
    );
    setTimeout(() => (user.value ? pass : user).focus(), 20);
  } else if (tab === 'signup') {
    const user = el('input', { type: 'text', autocomplete: 'username', placeholder: 'pick a username', maxlength: 24 });
    const pass = el('input', { type: 'password', autocomplete: 'new-password', placeholder: 'at least 10 characters' });
    const pass2 = el('input', { type: 'password', autocomplete: 'new-password', placeholder: 'type it again' });
    const meterBar = el('div', { style: { width: '0%' } });
    const meterText = el('div', { class: 'small muted' }, 'Tip: a passphrase like "purple-otter-drinks-tea" is long and easy to remember.');
    const userHint = el('div', { class: 'small muted' });
    const updateMeter = () => {
      const s = vault.passwordStrength(pass.value, user.value);
      const colors = ['#ff5d73', '#ff9f43', '#ffb020', '#1fc8a9', '#34d399'];
      meterBar.style.width = pass.value ? `${(s.score + 1) * 20}%` : '0%';
      meterBar.style.background = colors[s.score];
      meterText.textContent = pass.value ? `${s.label}${s.hints.length ? ' — ' + s.hints[0] : ''}` : meterText.textContent;
    };
    pass.addEventListener('input', updateMeter);
    user.addEventListener(
      'input',
      debounce(() => {
        const problem = vault.validateUsername(user.value);
        userHint.textContent = !user.value ? '' : problem || (vault.accountExists(user.value) ? 'That username is taken on this device.' : '✓ Available');
        userHint.style.color = !problem && !vault.accountExists(user.value) ? 'var(--good)' : 'var(--bad)';
        updateMeter();
      }, 150),
    );
    const btn = el('button', { class: 'btn primary', type: 'submit' }, 'Create my account');
    form = el(
      'form',
      {
        class: 'stack',
        onsubmit: async (e) => {
          e.preventDefault();
          errorEl.textContent = '';
          if (pass.value !== pass2.value) {
            errorEl.textContent = "Passwords don't match.";
            return;
          }
          busy(btn, true, 'Create my account');
          try {
            const { session, recoveryCode } = await vault.createAccount(user.value, pass.value, emptyData());
            pass.value = pass2.value = '';
            showRecoveryCode(session, recoveryCode, true);
          } catch (err) {
            errorEl.textContent = err.message;
            busy(btn, false, 'Create my account');
          }
        },
      },
      el('label', { class: 'field' }, el('span', {}, 'Username'), user, userHint),
      el('label', { class: 'field' }, el('span', {}, 'Password'), pass, el('div', { class: 'meter' }, meterBar), meterText),
      el('label', { class: 'field' }, el('span', {}, 'Confirm password'), pass2),
      errorEl,
      btn,
    );
    setTimeout(() => user.focus(), 20);
  } else if (tab === 'recover') {
    const user = el('input', { type: 'text', autocomplete: 'username', placeholder: 'your-username' });
    const code = el('input', { type: 'text', autocomplete: 'off', placeholder: 'XXXX-XXXX-XXXX-XXXX-XXXX-XXXX', spellcheck: 'false' });
    const pass = el('input', { type: 'password', autocomplete: 'new-password', placeholder: 'new password (10+ characters)' });
    const btn = el('button', { class: 'btn primary', type: 'submit' }, 'Reset password');
    form = el(
      'form',
      {
        class: 'stack',
        onsubmit: async (e) => {
          e.preventDefault();
          errorEl.textContent = '';
          busy(btn, true, 'Reset password');
          try {
            const { session, recoveryCode } = await vault.recoverAccount(user.value, code.value, pass.value);
            pass.value = '';
            showRecoveryCode(session, recoveryCode, false);
          } catch (err) {
            errorEl.textContent = err.message;
            busy(btn, false, 'Reset password');
          }
        },
      },
      el('p', { class: 'small muted' }, 'Enter the recovery code you saved when you created your account. You\'ll get a new code afterwards.'),
      el('label', { class: 'field' }, el('span', {}, 'Username'), user),
      el('label', { class: 'field' }, el('span', {}, 'Recovery code'), code),
      el('label', { class: 'field' }, el('span', {}, 'New password'), pass),
      errorEl,
      btn,
      el('a', { href: '#', class: 'small', onclick: (e) => (e.preventDefault(), renderAuth('login')) }, '← Back to log in'),
    );
  } else if (tab === 'import') {
    const file = el('input', { type: 'file', accept: '.json,application/json', class: 'input' });
    const pass = el('input', { type: 'password', autocomplete: 'current-password', placeholder: 'password for that backup' });
    const btn = el('button', { class: 'btn primary', type: 'submit' }, 'Restore');
    form = el(
      'form',
      {
        class: 'stack',
        onsubmit: async (e) => {
          e.preventDefault();
          errorEl.textContent = '';
          if (!file.files[0]) {
            errorEl.textContent = 'Choose a backup file first.';
            return;
          }
          busy(btn, true, 'Restore');
          try {
            const backup = JSON.parse(await file.files[0].text());
            const session = await vault.importBackup(backup, pass.value);
            pass.value = '';
            await enter(session);
            toast('Backup restored on this device.');
          } catch (err) {
            errorEl.textContent = err instanceof SyntaxError ? 'That file is not valid JSON.' : err.message;
            busy(btn, false, 'Restore');
          }
        },
      },
      el('p', { class: 'small muted' }, 'Move your planner to this device using an encrypted backup file exported from Settings.'),
      el('label', { class: 'field' }, el('span', {}, 'Backup file'), file),
      el('label', { class: 'field' }, el('span', {}, 'Password'), pass),
      errorEl,
      btn,
      el('a', { href: '#', class: 'small', onclick: (e) => (e.preventDefault(), renderAuth('login')) }, '← Back to log in'),
    );
  }

  root.appendChild(
    el(
      'div',
      { class: 'auth' },
      el(
        'div',
        { class: 'card auth-card stack' },
        el('div', { class: 'orbit-hero', 'aria-hidden': 'true' }, el('div', { class: 'ring r3' }), el('div', { class: 'ring r2' }), el('div', { class: 'ring r1' }), el('div', { class: 'core' })),
        el('div', { style: { textAlign: 'center' } }, el('h1', { class: 'grad-text', style: { fontSize: '2.2em', letterSpacing: '-0.03em' } }, 'Orbit'), el('div', { class: 'muted' }, 'Your school life, in one encrypted place.')),
        noticeEl,
        (tab === 'login' || tab === 'signup') && el('div', { class: 'tabs seg' }, tabBtn('login', 'Log in'), tabBtn('signup', 'Create account')),
        form,
        el(
          'div',
          { class: 'security-note' },
          el('span', {}, '🔐'),
          el('span', {}, 'Your data is encrypted in this browser with AES-256 using a key derived from your password. Your password is never stored or sent anywhere.'),
        ),
      ),
    ),
  );
}

function showRecoveryCode(session, code, isNew) {
  clear(root);
  const confirm = el('input', { type: 'checkbox', class: 'check sq', id: 'saved-code' });
  const go = el('button', { class: 'btn primary', disabled: true, onclick: () => enter(session) }, 'Continue to Orbit →');
  confirm.addEventListener('change', () => (go.disabled = !confirm.checked));
  const download = () => {
    const blob = new Blob(
      [`Orbit recovery code for @${session.username}\n\n${code}\n\nKeep this somewhere safe. It's the only way to reset your password.\n`],
      { type: 'text/plain' },
    );
    const a = el('a', { href: URL.createObjectURL(blob), download: `orbit-recovery-${session.username}.txt` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  root.appendChild(
    el(
      'div',
      { class: 'auth' },
      el(
        'div',
        { class: 'card auth-card stack' },
        el('div', { class: 'brand' }, logo(), el('h1', {}, isNew ? 'Account created' : 'Password reset')),
        el(
          'p',
          { class: 'muted' },
          "Here's your recovery code. If you ever forget your password, this is the ",
          el('b', {}, 'only'),
          ' way back in — nobody (not even the site owner) can reset it for you.',
        ),
        el('div', { class: 'recovery-code' }, code),
        el(
          'div',
          { class: 'row' },
          el(
            'button',
            {
              class: 'btn sm',
              onclick: async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  toast('Copied');
                } catch {
                  toast('Copy failed — select the code and copy it manually.');
                }
              },
            },
            '⧉ Copy',
          ),
          el('button', { class: 'btn sm', onclick: download }, '↓ Download .txt'),
        ),
        el('label', { class: 'row', for: 'saved-code' }, confirm, el('span', {}, "I've saved my recovery code somewhere safe")),
        go,
      ),
    ),
  );
}

async function enter(session) {
  let data = await session.load();
  if (!data) data = emptyData();
  // Fill in any settings added in newer versions.
  data.settings = { ...emptyData().settings, ...data.settings };
  for (const key of ['classes', 'items', 'focusLog', 'activity', 'attachments']) data[key] ||= [];
  app.session = session;
  app.data = data;
  app.view = 'launch';
  app.lastActivity = Date.now();
  applyTheme(data.settings.theme);
  app.render();
}

// ------------------------------------------------------------------ shell
let saveStateEl = null;
function setSaveState(saving) {
  if (!saveStateEl) return;
  saveStateEl.classList.toggle('saving', saving);
  saveStateEl.lastChild.textContent = saving ? 'Encrypting…' : 'Encrypted & saved';
}

function renderShell() {
  if (!app.session) return;
  const activeEl = document.activeElement;
  const keepQuick = activeEl?.id === 'quick-input' ? { value: activeEl.value, pos: activeEl.selectionStart } : null;
  clear(root);

  const navBtn = (id, i) => {
    const v = VIEWS[id];
    return el(
      'button',
      { class: `nav-btn${app.view === id ? ' on' : ''}`, onclick: () => app.go(id), 'aria-current': app.view === id ? 'page' : null },
      el('span', { class: 'ico' }, v.icon),
      el('span', {}, v.label),
      el('span', { class: 'kbd' }, String(i + 1)),
    );
  };

  saveStateEl = el('div', { class: 'save-state' }, el('span', { class: 'dot' }), el('span', {}, 'Encrypted & saved'));

  const sidebar = el(
    'aside',
    { class: 'sidebar' },
    el('div', { class: 'brand' }, logo(), el('h1', { class: 'grad-text' }, 'Orbit')),
    NAV_ORDER.map(navBtn),
    el(
      'div',
      { class: 'foot' },
      el('div', { class: 'muted' }, `@${app.session.username}`),
      saveStateEl,
      el('button', { class: 'btn sm', onclick: () => app.lock() }, '🔒 Lock'),
      el('button', { class: 'btn sm ghost', onclick: () => openHelp() }, 'Shortcuts  ?'),
    ),
  );

  if (!modalOpen()) app.pasteTarget = null;
  const main = el('main', { class: 'main' }, quickAddBar(keepQuick), VIEWS[app.view].render(app));

  const mobileNav = el(
    'nav',
    { class: 'mobile-nav' },
    NAV_ORDER.filter((id) => VIEWS[id].mobile).map((id) =>
      el('button', { class: app.view === id ? 'on' : '', onclick: () => app.go(id) }, el('span', { class: 'ico' }, VIEWS[id].icon), VIEWS[id].short || VIEWS[id].label),
    ),
  );

  root.appendChild(el('div', { class: 'shell' }, sidebar, main, mobileNav));
}

function quickAddBar(keep) {
  const input = el('input', {
    type: 'text',
    id: 'quick-input',
    placeholder: 'Quick add — e.g. "Bio lab report fri 11:59pm #bio ~2h 10%"',
    autocomplete: 'off',
    'aria-label': 'Quick add',
  });
  const preview = el('div', { class: 'quick-preview hidden' });
  const wrap = el('div', { class: 'quick' }, el('span', { class: 'plus' }, '+'), input, preview);

  const update = () => {
    const v = input.value.trim();
    clear(preview);
    if (!v) return preview.classList.add('hidden');
    preview.classList.remove('hidden');
    const p = parseQuickAdd(v, app.data.classes);
    const cls = app.classById(p.classId);
    add(preview, 
      el('b', {}, p.title || '(untitled)'),
      el('span', { class: 'chip' }, `${TYPE_META[p.type].icon} ${TYPE_META[p.type].label}`),
      cls && el('span', { class: 'chip cls', style: { background: cls.color } }, cls.code || cls.name),
      p.due ? el('span', { class: 'chip steady' }, `📅 ${fmtDate(p.due)}${p.hasTime ? ' · ' + fmtTime(p.due) : ''}`) : el('span', { class: 'chip' }, 'no date'),
      p.estimateMin && el('span', { class: 'chip' }, `⏱ ${p.estimateMin}m`),
      p.weight && el('span', { class: 'chip' }, `⚖ ${p.weight}%`),
      el('div', { class: 'hint' }, 'Enter to add · Shift+Enter to add with details · #class  !exam  ~2h  20%'),
    );
  };

  input.addEventListener('input', update);
  input.addEventListener('blur', () => setTimeout(() => preview.classList.add('hidden'), 150));
  input.addEventListener('focus', update);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      update();
      input.blur();
    }
    if (e.key !== 'Enter' || !input.value.trim()) return;
    e.preventDefault();
    const p = parseQuickAdd(input.value.trim(), app.data.classes);
    const item = {
      id: uid(),
      title: p.title || 'Untitled',
      type: p.type,
      classId: p.classId,
      due: p.due ? p.due.toISOString() : null,
      estimateMin: p.estimateMin ?? (p.type === 'event' ? 0 : TYPE_META[p.type].defaultMin),
      weight: p.weight,
      spentMin: 0,
      subtasks: [],
      plan: [],
      notes: '',
      done: false,
      createdAt: new Date().toISOString(),
    };
    input.value = '';
    if (e.shiftKey) {
      openItemEditor(app, item, { isNew: true });
      return;
    }
    if (item.due && item.type !== 'event') item.plan = autoPlan(item, app.data);
    app.data.items.push(item);
    app.commit();
    toast(`Added "${item.title}"${item.plan.length ? ` · ${item.plan.length} study session${item.plan.length > 1 ? 's' : ''} planned` : ''}`, {
      action: 'Open',
      onAction: () => openItemEditor(app, item),
    });
    document.getElementById('quick-input')?.focus();
  });

  if (keep) {
    setTimeout(() => {
      input.value = keep.value;
      input.focus();
      input.setSelectionRange(keep.pos, keep.pos);
    });
  }

  return el(
    'div',
    { class: 'topbar' },
    wrap,
    el('button', { class: 'btn primary', onclick: () => openItemEditor(app, null, { isNew: true }) }, '+ New'),
    el('button', { class: 'btn icon lock-label', title: 'Lock (L)', 'aria-label': 'Lock', onclick: () => app.lock() }, '🔒'),
  );
}

// ------------------------------------------------------------------ keyboard + auto-lock
// Paste a screenshot anywhere: it goes to the gallery on screen, or to Files if there isn't one.
document.addEventListener('paste', async (e) => {
  if (!app.session) return;
  const images = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/'));
  if (!images.length) return;
  e.preventDefault();
  if (app.pasteTarget) return app.pasteTarget(images);
  await uploadFiles(app, images, { kind: 'work' });
  if (app.view === 'files') app.render();
  else toast('Screenshot saved to Files', { action: 'View', onAction: () => app.go('files') });
});

document.addEventListener('keydown', (e) => {
  if (!app.session || modalOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= NAV_ORDER.length) {
    app.go(NAV_ORDER[n - 1]);
  } else if (e.key === 'n' || e.key === '/') {
    e.preventDefault();
    document.getElementById('quick-input')?.focus();
  } else if (e.key === 'l' || e.key === 'L') {
    app.lock();
  } else if (e.key === '?') {
    openHelp();
  }
});

const bump = () => (app.lastActivity = Date.now());
['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => document.addEventListener(ev, bump, { passive: true }));

setInterval(() => {
  if (!app.session) return;
  const mins = app.data?.settings?.autoLockMin;
  if (!mins || app.focus.running) return;
  if (Date.now() - app.lastActivity > mins * 60000) app.lock('Locked after inactivity');
}, 10000);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && app.session) app.save();
});

// Keep the "today" views fresh when midnight passes or the tab comes back.
let lastDay = new Date().getDate();
setInterval(() => {
  if (app.session && new Date().getDate() !== lastDay) {
    lastDay = new Date().getDate();
    if (!modalOpen()) app.render();
  }
}, 60000);

// ------------------------------------------------------------------ boot
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
if (!window.crypto?.subtle) {
  root.appendChild(
    el('div', { class: 'auth' }, el('div', { class: 'card auth-card' }, el('h2', {}, 'Secure context required'), el('p', { class: 'muted' }, 'Orbit needs HTTPS (or localhost) to use the browser\'s encryption. Open it from its GitHub Pages https:// address.'))),
  );
} else {
  renderAuth();
}
