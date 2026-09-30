// Encrypted file storage for screenshots.
// Images are too big for localStorage, so their ciphertext lives in IndexedDB.
// Nothing here ever sees plaintext except compressImage(); vault.js does the encrypting.

const DB_NAME = 'orbit-files';
const STORE = 'blobs';
let dbPromise = null;

function db() {
  dbPromise ||= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode, fn) {
  return db().then(
    (d) =>
      new Promise((resolve, reject) => {
        const t = d.transaction(STORE, mode);
        const result = fn(t.objectStore(STORE));
        // A missing key must resolve to undefined (not the request object).
        t.oncomplete = () => resolve(result instanceof IDBRequest ? result.result : result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error || new Error('Storage aborted — the device may be out of space.'));
      }),
  );
}

export const putBlob = (key, value) => tx('readwrite', (s) => s.put(value, key));
export const getBlob = (key) => tx('readonly', (s) => s.get(key));
export const deleteBlob = (key) => tx('readwrite', (s) => s.delete(key));

export function keysWithPrefix(prefix) {
  return tx('readonly', (s) => s.getAllKeys(IDBKeyRange.bound(prefix, `${prefix}￿`)));
}

export async function deletePrefix(prefix) {
  const keys = await keysWithPrefix(prefix);
  await tx('readwrite', (s) => keys.forEach((k) => s.delete(k)));
}

// Shrink an image so screenshots stay legible but small (~100–400 KB).
// Returns { full: Uint8Array, thumb: Uint8Array, type, w, h }.
export async function compressImage(file, maxSide = 2000) {
  if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" isn't an image.`);
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`Couldn't read "${file.name}". Try a PNG or JPG screenshot.`);
  }
  const encode = async (side, quality) => {
    const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // JPEG has no transparency
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
    return { bytes: new Uint8Array(await blob.arrayBuffer()), w, h };
  };
  const full = await encode(maxSide, 0.86);
  const thumb = await encode(360, 0.72);
  bitmap.close?.();
  return { full: full.bytes, thumb: thumb.bytes, type: 'image/jpeg', w: full.w, h: full.h };
}

export async function storageEstimate() {
  try {
    return await navigator.storage.estimate();
  } catch {
    return null;
  }
}

export async function askPersistence() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    /* best effort */
  }
}
