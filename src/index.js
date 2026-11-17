import { Client, GatewayIntentBits } from 'discord.js';
import { DISCORD_TOKEN } from './config.js';
import { loadErrorHandlers } from './handlers/errorHandler.js';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';

if (!DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN is missing: copy .env.example to .env and fill it in.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

loadErrorHandlers();
loadCommands(client);
loadEvents(client);

client.login(DISCORD_TOKEN).catch((err) => {
  console.error(err.code === 'TokenInvalid'
    ? 'Invalid token: check DISCORD_TOKEN in your .env file.'
    : `Could not connect to Discord: ${err.message}`);
  process.exit(1);
});
