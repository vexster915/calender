// PDF → text, using Mozilla's pdf.js (bundled in /vendor so no outside servers are contacted).
let lib = null;

async function load() {
  if (lib) return lib;
  lib = await import('../vendor/pdfjs/pdf.min.mjs');
  lib.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
  return lib;
}

// Returns { text, pages, title }. Throws a friendly error for scanned/image-only PDFs.
export async function extractPdfText(bytes, onProgress) {
  const pdfjs = await load();
  const base = new URL('../vendor/pdfjs/', import.meta.url).href;
  const task = pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    verbosity: 0,
    cMapUrl: `${base}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${base}standard_fonts/`,
    useSystemFonts: false,
  });
  let doc;
  try {
    doc = await task.promise;
  } catch (err) {
    if (/password/i.test(err?.name || err?.message)) throw new Error('This PDF is password-protected — open it, save an unlocked copy, and try again.');
    throw new Error('That file isn’t a readable PDF (it may be damaged, or a web page saved with a .pdf name).');
  }
  let meta = null;
  try {
    meta = await doc.getMetadata();
  } catch {
    /* no metadata */
  }
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    let text = '';
    let lastY = null;
    let lastX = null;
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const [, , , , x, y] = item.transform;
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        // New visual line; a big vertical gap means a new paragraph.
        const want = Math.abs(y - lastY) > (item.height || 10) * 1.9 ? '\n\n' : '\n';
        text = text.replace(/\n*$/, '') + want;
      } else if (lastX !== null && text && !/\s$/.test(text) && item.str && !/^\s/.test(item.str) && x - lastX > 1) {
        text += ' ';
      }
      text += item.str;
      if (item.hasEOL && !text.endsWith('\n')) text += '\n';
      lastY = y;
      lastX = x + (item.width || 0);
    }
    pages.push(text.replace(/[ \t]+\n/g, '\n'));
    page.cleanup();
    onProgress?.(p / doc.numPages);
  }
  await task.destroy();
  const text = pages.join('\n\n');
  if (text.replace(/\s/g, '').length < 40) {
    throw new Error('This PDF has no selectable text (it looks scanned). Try a PDF you can highlight text in, or paste the notes instead.');
  }
  return { text, pages: pages.length, title: meta?.info?.Title || '' };
}
