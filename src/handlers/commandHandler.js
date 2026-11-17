import { Collection } from 'discord.js';
import importer from '../commands/importer.js';
import exporter from '../commands/exporter.js';

export const commands = [importer, exporter];

export function loadCommands(client) {
  client.commands = new Collection(commands.map((cmd) => [cmd.data.name, cmd]));
}
