const busy = new Set();

export const isBusy = (guildId) => busy.has(guildId);

export async function withGuildLock(guildId, fn) {
  busy.add(guildId);
  try {
    return await fn();
  } finally {
    busy.delete(guildId);
  }
}
