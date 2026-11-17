import sharp from 'sharp';

const EMOJI_MAX_BYTES = 256 * 1024;
const STICKER_MAX_BYTES = 512 * 1024;
const STICKER_SIZE = 320;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

export const isAnimatedExt = (ext) => ext === '.gif' || ext === '.webp';
const isApng = (buf) => buf.includes(Buffer.from('acTL'));

const png = (img, colours) => img.png({ compressionLevel: 9, palette: colours < 256, colours }).toBuffer();
const gif = (img, colours) => img.gif({ effort: 10, colours }).toBuffer();
const shrink = (img, size) => img.resize(size, size, { fit: 'inside', withoutEnlargement: true });

async function compress(attempts, maxBytes, encode, error) {
  for (const attempt of attempts) {
    const out = await encode(attempt);
    if (out.length <= maxBytes) return out;
  }
  throw new Error(error);
}

export async function prepareEmoji(buf, ext) {
  if (buf.length <= EMOJI_MAX_BYTES) return buf;
  const animated = isAnimatedExt(ext);
  const attempts = [[128, 256], [112, 256], [96, 256], [96, 128], [80, 128], [64, 128], [64, 64], [48, 64]];
  return compress(attempts, EMOJI_MAX_BYTES,
    ([size, colours]) => (animated ? gif : png)(shrink(sharp(buf, { animated }), size), colours),
    'file too large even after compression');
}

export async function prepareSticker(buf, ext) {
  const underLimit = buf.length <= STICKER_MAX_BYTES;
  if (ext === '.png' && isApng(buf)) {
    if (!underLimit) throw new Error('APNG too large (> 512 KB)');
    return { data: buf, ext };
  }

  const meta = await sharp(buf, { animated: true }).metadata();
  const { width } = meta;
  const height = meta.pageHeight ?? meta.height;

  if ((meta.pages ?? 1) > 1) {
    if (ext === '.gif' && underLimit && width <= STICKER_SIZE && height <= STICKER_SIZE) return { data: buf, ext };
    const data = await compress([256, 128, 64, 32], STICKER_MAX_BYTES,
      (colours) => gif(shrink(sharp(buf, { animated: true }), STICKER_SIZE), colours),
      'GIF too large even after compression');
    return { data, ext: '.gif' };
  }

  if (ext === '.png' && underLimit && width === STICKER_SIZE && height === STICKER_SIZE) return { data: buf, ext };
  const data = await compress([256, 128, 64], STICKER_MAX_BYTES,
    (colours) => png(sharp(buf).resize(STICKER_SIZE, STICKER_SIZE, { fit: 'contain', background: TRANSPARENT }), colours),
    'image too large even after compression');
  return { data, ext: '.png' };
}
