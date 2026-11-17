import { REST, Routes } from 'discord.js';
import { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } from './config.js';
import { commands } from './handlers/commandHandler.js';

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('DISCORD_TOKEN and CLIENT_ID must be set in your .env file.');
  process.exit(1);
}

const route = GUILD_ID ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) : Routes.applicationCommands(CLIENT_ID);
const body = commands.map((cmd) => cmd.data.toJSON());

try {
  await new REST().setToken(DISCORD_TOKEN).put(route, { body });
  console.log(`${body.length} command(s) registered ${GUILD_ID ? `on server ${GUILD_ID}` : 'globally'}.`);
} catch (err) {
  console.error(`Could not register commands: ${err.message}`);
  if (err.status === 401) console.error('-> Invalid DISCORD_TOKEN.');
  if (err.status === 403 || err.status === 404) console.error('-> Check CLIENT_ID / GUILD_ID and that the bot is in the server.');
  process.exit(1);
}
