import { AttachmentBuilder, PermissionFlagsBits } from 'discord.js';
import { MAX_REACHED_CODES } from '../config.js';
import { readImagesFromZip } from '../utils/zip.js';
import { cleanName, uniqueName } from '../utils/names.js';
import { isAnimatedExt, prepareEmoji, prepareSticker } from '../utils/images.js';
import { guessType, zipPath } from './zipFolder.js';

export async function importZip(guild, zipName, { type, onDuplicate, tag, reason, onProgress } = {}) {
  const me = await guild.members.fetchMe();
  if (!me.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
    throw new Error(`I need the "Manage Expressions" permission on ${guild.name}.`);
  }

  type ??= guessType(zipName);
  onDuplicate ??= 'skip';
  tag ??= 'star';
  const isSticker = type === 'stickers';
  const maxNameLen = isSticker ? 30 : 32;
  const images = readImagesFromZip(zipPath(zipName));

  const existing = await (isSticker ? guild.stickers : guild.emojis).fetch();
  const serverNames = new Set(existing.map((e) => e.name));
  const taken = new Set(serverNames);

  const create = isSticker
    ? async (img, name) => {
      const { data, ext } = await prepareSticker(img.data, img.ext);
      return guild.stickers.create({ file: new AttachmentBuilder(data, { name: name + ext }), name, tags: tag, reason });
    }
    : async (img, name) => guild.emojis.create({ attachment: await prepareEmoji(img.data, img.ext), name, reason });

  const report = { added: [], skipped: [], failed: [] };
  const full = { static: false, animated: false, stickers: false };
  const log = (i, msg) => console.log(`[${guild.name}] (${i + 1}/${images.length}) ${msg}`);

  for (const [i, img] of images.entries()) {
    await onProgress?.(i, images.length, report);

    const category = isSticker ? 'stickers' : isAnimatedExt(img.ext) ? 'animated' : 'static';
    const base = cleanName(img.filename, maxNameLen);
    if (full[category]) { report.failed.push(`${img.filename} -> no room left on the server`); continue; }
    if (serverNames.has(base) && onDuplicate === 'skip') { report.skipped.push(`${base} (already exists)`); continue; }

    const name = uniqueName(base, taken, maxNameLen);
    try {
      await create(img, name);
      taken.add(name);
      report.added.push(name);
      log(i, `+ ${name}`);
    } catch (err) {
      if (MAX_REACHED_CODES.includes(err.code)) full[category] = true;
      report.failed.push(`${img.filename} -> ${err.message}`);
      log(i, `! ${img.filename}: ${err.message}`);
    }
  }

  return { zipName, type, total: images.length, report, full };
}
