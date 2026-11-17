import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';
import { EXPORTS_DIR } from '../config.js';

const CONCURRENCY = 8;

export const EXPORT_KINDS = { emojis: ['emojis'], stickers: ['stickers'], both: ['emojis', 'stickers'] };

const sources = {
  emojis: async (guild) => (await guild.emojis.fetch())
    .map((e) => ({ name: e.name, id: e.id, url: e.imageURL({ extension: e.animated ? 'gif' : 'png' }) })),
  stickers: async (guild) => (await guild.stickers.fetch())
    .map((s) => ({ name: s.name, id: s.id, url: s.url })),
};

const safeName = (s) => s.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim() || 'server';

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function forEachLimited(items, fn) {
  let next = 0;
  const worker = async () => { while (next < items.length) await fn(items[next++]); };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
}

export async function exportGuild(guild, type, { onProgress } = {}) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const results = [];

  for (const kind of EXPORT_KINDS[type]) {
    const items = await sources[kind](guild);
    const zip = new AdmZip();
    const failed = [];
    let done = 0;

    await forEachLimited(items, async (item) => {
      try {
        const ext = path.extname(new URL(item.url).pathname);
        zip.addFile(`${safeName(item.name)}_${item.id}${ext}`, await download(item.url));
      } catch (err) {
        failed.push(`${item.name} -> ${err.message}`);
      }
      await onProgress?.(kind, ++done, items.length);
    });

    const exported = items.length - failed.length;
    const file = exported > 0 ? path.join(EXPORTS_DIR, `${safeName(guild.name)}-${kind}-${stamp}.zip`) : null;
    if (file) zip.writeZip(file);
    results.push({ kind, file, total: items.length, exported, failed });
  }

  return results;
}

export const exportSummary = (results) => results.map(({ kind, file, total, exported, failed }) => [
  `**${kind}**: ${exported}/${total} exported${failed.length ? `, ${failed.length} failed` : ''}`,
  file ? `  -> ${file}` : '  -> nothing to export',
  ...failed.map((f) => `  ! ${f}`),
].join('\n')).join('\n');
