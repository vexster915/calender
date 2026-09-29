// Orbit account + encryption layer.
//
// Design (everything happens in the browser with the Web Crypto API):
//   * Each account gets a random 256-bit data key (DEK). All planner data is
//     encrypted with the DEK using AES-256-GCM and a fresh random IV per save.
//   * The DEK is "wrapped" (encrypted) twice:
//       - with a key derived from the password  (PBKDF2-SHA256, 600k iterations, random salt)
//       - with a key derived from a one-time recovery code shown at sign-up
//   * The password is never stored, not even as a hash. Logging in means
//     successfully decrypting the wrapped DEK; AES-GCM's authentication tag
//     rejects a wrong password.
//   * The username is bound into every ciphertext as additional authenticated
//     data, so blobs can't be swapped between accounts.

import * as files from './files.js';

const ACCOUNTS_KEY = 'orbit.accounts';
const DATA_PREFIX = 'orbit.data.';
const THROTTLE_PREFIX = 'orbit.throttle.';
export const PBKDF2_ITERATIONS = 600000; // OWASP 2023 recommendation for PBKDF2-HMAC-SHA256
const enc = new TextEncoder();
const dec = new TextDecoder();

// ---------- encoding ----------
function b64(bytes) {
  let s = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}
function unb64(str) {
  const s = atob(str);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
const rand = (n) => crypto.getRandomValues(new Uint8Array(n));

// ---------- storage ----------
function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {};
  } catch {
    return {};
  }
}
function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
export function normalizeUsername(name) {
  return String(name || '').trim().toLowerCase();
}
export function listAccounts() {
  return Object.values(readAccounts()).map((a) => a.username);
}
export function accountExists(username) {
  return !!readAccounts()[normalizeUsername(username)];
}

// ---------- crypto primitives ----------
async function deriveKek(secret, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function seal(key, bytes, aad) {
  const iv = rand(12);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(aad) }, key, bytes);
  return { iv: b64(iv), ct: b64(ct) };
}

async function open(key, box, aad) {
  return new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv), additionalData: enc.encode(aad) }, key, unb64(box.ct)),
  );
}

// Binary variant for files in IndexedDB (no base64 overhead).
async function sealRaw(key, bytes, aad) {
  const iv = rand(12);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(aad) }, key, bytes);
  return { iv, ct: new Uint8Array(ct) };
}
async function openRaw(key, box, aad) {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: box.iv, additionalData: enc.encode(aad) }, key, box.ct));
}

function importDek(raw) {
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

// ---------- recovery codes ----------
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32 (no I, L, O, U)
function makeRecoveryCode() {
  const bytes = rand(15); // 120 bits
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return out.match(/.{4}/g).join('-');
}
export function normalizeRecoveryCode(code) {
  return String(code || '')
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
}

// ---------- validation ----------
const COMMON = [
  'password', '123456', 'qwerty', 'letmein', 'welcome', 'iloveyou', 'admin', 'monkey', 'dragon', 'football',
  'baseball', 'sunshine', 'princess', 'abc123', 'trustno1', 'school', 'student', 'homework', 'calendar', 'orbit',
];

export function validateUsername(name) {
  const n = String(name || '').trim();
  if (n.length < 3) return 'Username must be at least 3 characters.';
  if (n.length > 24) return 'Username must be 24 characters or fewer.';
  if (!/^[A-Za-z0-9_.-]+$/.test(n)) return 'Use only letters, numbers, dot, dash, or underscore.';
  return null;
}

// Rough entropy estimate -> { score 0-4, label, bits, hints[] }
export function passwordStrength(pw, username = '') {
  const hints = [];
  if (!pw) return { score: 0, label: 'Empty', bits: 0, hints: ['Enter a password.'] };
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  const unique = new Set(pw).size;
  let bits = Math.log2(Math.max(pool, 1)) * pw.length * Math.min(1, unique / Math.max(4, pw.length * 0.6));
  const lower = pw.toLowerCase();
  if (COMMON.some((c) => lower.includes(c))) {
    bits *= 0.5;
    hints.push('Avoid common words like "password" or "school".');
  }
  if (username && lower.includes(normalizeUsername(username))) {
    bits *= 0.5;
    hints.push("Don't include your username.");
  }
  if (/(.)\1{2,}/.test(pw)) {
    bits *= 0.8;
    hints.push('Avoid repeated characters.');
  }
  if (/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf)/i.test(pw)) {
    bits *= 0.8;
    hints.push('Avoid keyboard or number sequences.');
  }
  if (pw.length < 10) hints.push('Use at least 10 characters.');
  if (pool < 40 && pw.length < 16) hints.push('Mix in capitals, numbers or symbols — or use a longer passphrase.');
  const score = bits < 28 ? 0 : bits < 40 ? 1 : bits < 55 ? 2 : bits < 75 ? 3 : 4;
  const label = ['Very weak', 'Weak', 'Okay', 'Strong', 'Excellent'][score];
  return { score, label, bits: Math.round(bits), hints };
}

export function validatePassword(pw, username) {
  if (!pw || pw.length < 10) return 'Password must be at least 10 characters.';
  if (pw.length > 256) return 'Password is too long.';
  if (passwordStrength(pw, username).score < 2) return 'Password is too easy to guess — try a longer passphrase.';
  return null;
}

// ---------- throttling (slows down guessing on this device) ----------
function throttleState(user) {
  try {
    return JSON.parse(localStorage.getItem(THROTTLE_PREFIX + user)) || { fails: 0, until: 0 };
  } catch {
    return { fails: 0, until: 0 };
  }
}
export function lockoutRemaining(username) {
  const t = throttleState(normalizeUsername(username));
  return Math.max(0, t.until - Date.now());
}
function recordFailure(user) {
  const t = throttleState(user);
  t.fails += 1;
  if (t.fails >= 3) t.until = Date.now() + Math.min(15 * 60000, 5000 * 2 ** (t.fails - 3));
  localStorage.setItem(THROTTLE_PREFIX + user, JSON.stringify(t));
}
function clearFailures(user) {
  localStorage.removeItem(THROTTLE_PREFIX + user);
}

// ---------- session ----------
// A Session holds the decrypted data key in memory only. Locking drops it.
export class Session {
  constructor(user, username, dek) {
    this.user = user;
    this.username = username;
    this.dek = dek;
  }
  async load() {
    const raw = localStorage.getItem(DATA_PREFIX + this.user);
    if (!raw) return null;
    const bytes = await open(this.dek, JSON.parse(raw), `data:${this.user}`);
    return JSON.parse(dec.decode(bytes));
  }
  async save(data) {
    const box = await seal(this.dek, enc.encode(JSON.stringify(data)), `data:${this.user}`);
    localStorage.setItem(DATA_PREFIX + this.user, JSON.stringify(box));
  }
  async changePassword(currentPw, newPw) {
    const accounts = readAccounts();
    const rec = accounts[this.user];
    // Verify current password first.
    const oldKek = await deriveKek(currentPw, unb64(rec.kdf.salt), rec.kdf.iterations);
    let raw;
    try {
      raw = await open(oldKek, rec.pwWrap, `dek:${this.user}`);
    } catch {
      throw new Error('Current password is incorrect.');
    }
    const problem = validatePassword(newPw, this.username);
    if (problem) throw new Error(problem);
    const salt = rand(16);
    const kek = await deriveKek(newPw, salt, PBKDF2_ITERATIONS);
    rec.kdf = { name: 'PBKDF2', hash: 'SHA-256', iterations: PBKDF2_ITERATIONS, salt: b64(salt) };
    rec.pwWrap = await seal(kek, raw, `dek:${this.user}`);
    raw.fill(0);
    writeAccounts(accounts);
  }
  async regenerateRecoveryCode(password) {
    const accounts = readAccounts();
    const rec = accounts[this.user];
    const kek = await deriveKek(password, unb64(rec.kdf.salt), rec.kdf.iterations);
    let raw;
    try {
      raw = await open(kek, rec.pwWrap, `dek:${this.user}`);
    } catch {
      throw new Error('Password is incorrect.');
    }
    const code = makeRecoveryCode();
    const salt = rand(16);
    const rk = await deriveKek(normalizeRecoveryCode(code), salt, PBKDF2_ITERATIONS);
    rec.recKdf = { iterations: PBKDF2_ITERATIONS, salt: b64(salt) };
    rec.recWrap = await seal(rk, raw, `dek:${this.user}`);
    raw.fill(0);
    writeAccounts(accounts);
    return code;
  }
  // ----- encrypted files (screenshots) -----
  fileKey(id) {
    return `${this.user}/${id}`;
  }
  async saveFile(id, bytes) {
    await files.putBlob(this.fileKey(id), await sealRaw(this.dek, bytes, `file:${this.user}:${id}`));
  }
  async loadFile(id) {
    const box = await files.getBlob(this.fileKey(id));
    if (!box) return null;
    return openRaw(this.dek, box, `file:${this.user}:${id}`);
  }
  async deleteFile(id) {
    await files.deleteBlob(this.fileKey(id));
  }
  async exportBackup() {
    // The backup stays encrypted — it's useless without the password or recovery code.
    const prefix = `${this.user}/`;
    const blobs = {};
    for (const key of await files.keysWithPrefix(prefix)) {
      const box = await files.getBlob(key);
      blobs[key.slice(prefix.length)] = { iv: b64(box.iv), ct: b64(box.ct) };
    }
    return {
      format: 'orbit-backup',
      version: 2,
      exportedAt: new Date().toISOString(),
      account: readAccounts()[this.user],
      data: JSON.parse(localStorage.getItem(DATA_PREFIX + this.user)),
      files: blobs,
    };
  }
  async deleteAccount() {
    const accounts = readAccounts();
    delete accounts[this.user];
    writeAccounts(accounts);
    localStorage.removeItem(DATA_PREFIX + this.user);
    clearFailures(this.user);
    await files.deletePrefix(`${this.user}/`).catch(() => {});
    this.dek = null;
  }
  lock() {
    this.dek = null;
  }
}

// ---------- public API ----------
export async function createAccount(username, password, initialData) {
  const problem = validateUsername(username) || validatePassword(password, username);
  if (problem) throw new Error(problem);
  const user = normalizeUsername(username);
  const accounts = readAccounts();
  if (accounts[user]) throw new Error('That username is already taken on this device.');

  const raw = rand(32);
  const salt = rand(16);
  const kek = await deriveKek(password, salt, PBKDF2_ITERATIONS);
  const recoveryCode = makeRecoveryCode();
  const recSalt = rand(16);
  const rkek = await deriveKek(normalizeRecoveryCode(recoveryCode), recSalt, PBKDF2_ITERATIONS);

  accounts[user] = {
    v: 1,
    username: username.trim(),
    createdAt: new Date().toISOString(),
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: PBKDF2_ITERATIONS, salt: b64(salt) },
    pwWrap: await seal(kek, raw, `dek:${user}`),
    recKdf: { iterations: PBKDF2_ITERATIONS, salt: b64(recSalt) },
    recWrap: await seal(rkek, raw, `dek:${user}`),
  };
  const dek = await importDek(raw);
  raw.fill(0);
  writeAccounts(accounts);
  const session = new Session(user, username.trim(), dek);
  await session.save(initialData);
  return { session, recoveryCode };
}

export async function login(username, password) {
  const user = normalizeUsername(username);
  const wait = lockoutRemaining(user);
  if (wait > 0) throw new Error(`Too many attempts. Try again in ${Math.ceil(wait / 1000)}s.`);
  const rec = readAccounts()[user];
  if (!rec) {
    // Spend comparable time so response timing doesn't reveal which usernames exist.
    await deriveKek(password || 'x', rand(16), PBKDF2_ITERATIONS);
    throw new Error('Wrong username or password.');
  }
  const kek = await deriveKek(password, unb64(rec.kdf.salt), rec.kdf.iterations);
  let raw;
  try {
    raw = await open(kek, rec.pwWrap, `dek:${user}`);
  } catch {
    recordFailure(user);
    throw new Error('Wrong username or password.');
  }
  clearFailures(user);
  const dek = await importDek(raw);
  raw.fill(0);
  return new Session(user, rec.username, dek);
}

// Reset a forgotten password using the recovery code. Returns a new recovery code (old one is burned).
export async function recoverAccount(username, recoveryCode, newPassword) {
  const user = normalizeUsername(username);
  const wait = lockoutRemaining(user);
  if (wait > 0) throw new Error(`Too many attempts. Try again in ${Math.ceil(wait / 1000)}s.`);
  const accounts = readAccounts();
  const rec = accounts[user];
  if (!rec) throw new Error('Wrong username or recovery code.');
  const problem = validatePassword(newPassword, rec.username);
  if (problem) throw new Error(problem);
  const rkek = await deriveKek(normalizeRecoveryCode(recoveryCode), unb64(rec.recKdf.salt), rec.recKdf.iterations);
  let raw;
  try {
    raw = await open(rkek, rec.recWrap, `dek:${user}`);
  } catch {
    recordFailure(user);
    throw new Error('Wrong username or recovery code.');
  }
  clearFailures(user);
  const salt = rand(16);
  const kek = await deriveKek(newPassword, salt, PBKDF2_ITERATIONS);
  rec.kdf = { name: 'PBKDF2', hash: 'SHA-256', iterations: PBKDF2_ITERATIONS, salt: b64(salt) };
  rec.pwWrap = await seal(kek, raw, `dek:${user}`);
  const newCode = makeRecoveryCode();
  const recSalt = rand(16);
  const rk2 = await deriveKek(normalizeRecoveryCode(newCode), recSalt, PBKDF2_ITERATIONS);
  rec.recKdf = { iterations: PBKDF2_ITERATIONS, salt: b64(recSalt) };
  rec.recWrap = await seal(rk2, raw, `dek:${user}`);
  const dek = await importDek(raw);
  raw.fill(0);
  writeAccounts(accounts);
  return { session: new Session(user, rec.username, dek), recoveryCode: newCode };
}

// Import an encrypted backup file onto this device. Requires the password to prove ownership.
export async function importBackup(backup, password) {
  if (!backup || backup.format !== 'orbit-backup' || !backup.account || !backup.data) {
    throw new Error('That file is not an Orbit backup.');
  }
  const rec = backup.account;
  const user = normalizeUsername(rec.username);
  const kek = await deriveKek(password, unb64(rec.kdf.salt), rec.kdf.iterations);
  let raw;
  try {
    raw = await open(kek, rec.pwWrap, `dek:${user}`);
  } catch {
    throw new Error('Password does not match this backup.');
  }
  const dek = await importDek(raw);
  raw.fill(0);
  // Make sure the data actually decrypts before overwriting anything.
  await open(dek, backup.data, `data:${user}`);
  const accounts = readAccounts();
  if (accounts[user] && accounts[user].createdAt !== rec.createdAt) {
    throw new Error('A different account with that username already exists on this device.');
  }
  const blobs = Object.entries(backup.files || {});
  // Check every file decrypts with this key before writing anything.
  for (const [id, box] of blobs) await open(dek, box, `file:${user}:${id}`);
  accounts[user] = rec;
  writeAccounts(accounts);
  localStorage.setItem(DATA_PREFIX + user, JSON.stringify(backup.data));
  await files.deletePrefix(`${user}/`);
  for (const [id, box] of blobs) await files.putBlob(`${user}/${id}`, { iv: unb64(box.iv), ct: unb64(box.ct) });
  clearFailures(user);
  return new Session(user, rec.username, dek);
}
