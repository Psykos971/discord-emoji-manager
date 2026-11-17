import AdmZip from 'adm-zip';
import path from 'node:path';

const IMAGE_EXT = new Set(['.png', '.gif', '.jpg', '.jpeg', '.webp']);

function openZip(file) {
  try {
    return new AdmZip(file).getEntries();
  } catch {
    throw new Error(`${path.basename(file)} is not a valid zip file (corrupted or wrong format).`);
  }
}

export function readImagesFromZip(file) {
  const images = [];

  for (const entry of openZip(file)) {
    const name = path.posix.basename(entry.entryName.replace(/\\/g, '/'));
    const ext = path.extname(name).toLowerCase();
    if (entry.isDirectory || entry.entryName.includes('__MACOSX') || name.startsWith('.') || !IMAGE_EXT.has(ext)) continue;

    try {
      images.push({ filename: name, ext, data: entry.getData() });
    } catch (err) {
      console.warn(`Skipping unreadable image (${name}): ${err.message}`);
    }
  }

  return images.sort((a, b) => a.filename.localeCompare(b.filename));
}
