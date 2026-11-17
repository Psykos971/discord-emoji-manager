export function cleanName(filename, maxLen = 32) {
  let base = filename
    .replace(/\.[^.]+$/, '')
    .replace(/_\d{15,21}$/, '')
    .normalize('NFKD').replace(/\p{M}/gu, '')
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '');
  if (base.length < 2) base = `${base}_emoji`.replace(/^_/, '');
  return base.slice(0, maxLen);
}

export function uniqueName(name, taken, maxLen = 32) {
  let candidate = name;
  for (let i = 2; taken.has(candidate); i++) candidate = name.slice(0, maxLen - `_${i}`.length) + `_${i}`;
  return candidate;
}
