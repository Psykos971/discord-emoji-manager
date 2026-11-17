import { parseArgs } from 'node:util';
import { Client, GatewayIntentBits } from 'discord.js';
import { DISCORD_TOKEN, GUILD_ID } from '../config.js';
import rateLimited from '../events/rateLimited.js';

export function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

export function parseCli(options, usage) {
  let args;
  try {
    args = parseArgs({ allowPositionals: true, options: { ...options, server: { type: 'string' } } });
  } catch (err) {
    fail(`${err.message}\n${usage}`);
  }
  if (!DISCORD_TOKEN) fail('DISCORD_TOKEN is missing from your .env file.');
  if (!(args.values.server ?? GUILD_ID)) fail('Set the server: GUILD_ID in .env or --server <id>.');
  return args;
}

export async function withGuild(guildId, fn) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.rest.on(rateLimited.name, rateLimited.execute);
  try {
    await client.login(DISCORD_TOKEN);
    await fn(await client.guilds.fetch(guildId ?? GUILD_ID));
  } catch (err) {
    console.error(`\nError: ${err.code === 'TokenInvalid' ? 'Invalid token: check DISCORD_TOKEN in your .env file.' : err.message}`);
    process.exitCode = 1;
  } finally {
    await client.destroy();
  }
}
