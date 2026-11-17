import fs from 'node:fs';
import path from 'node:path';
import { ZIPS_DIR } from '../config.js';

export const ALL_ZIPS = '*';

export function listZips() {
  fs.mkdirSync(ZIPS_DIR, { recursive: true });
  return fs.readdirSync(ZIPS_DIR).filter((f) => f.toLowerCase().endsWith('.zip')).sort();
}

export function resolveZips(names) {
  const available = listZips();
  if (names.length === 0 || names.includes(ALL_ZIPS)) {
    if (available.length === 0) throw new Error(`No zip files in ${ZIPS_DIR}`);
    return available;
  }
  const missing = names.filter((n) => !available.includes(n));
  if (missing.length) throw new Error(`Zip not found in ${ZIPS_DIR}: ${missing.join(', ')}`);
  return names;
}

export const zipPath = (name) => path.join(ZIPS_DIR, name);
export const guessType = (name) => (/sticker/i.test(name) ? 'stickers' : 'emojis');
