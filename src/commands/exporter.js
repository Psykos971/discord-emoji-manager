import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { PROGRESS_EVERY_MS } from '../config.js';
import { exportGuild, exportSummary } from '../services/exporter.js';
import { isBusy, withGuildLock } from '../utils/guildLock.js';

const data = new SlashCommandBuilder()
  .setName('export')
  .setDescription('Export the server emojis and/or stickers to zip files on the bot computer')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
  .setDMPermission(false)
  .addStringOption((o) => o.setName('type').setDescription('What to export (default: both)')
    .addChoices({ name: 'Emojis', value: 'emojis' }, { name: 'Stickers', value: 'stickers' }, { name: 'Both', value: 'both' }));

async function execute(interaction) {
  const { guild, options } = interaction;
  if (!guild) return interaction.reply({ content: 'This command only works in a server.', flags: MessageFlags.Ephemeral });
  if (isBusy(guild.id)) return interaction.reply({ content: 'An import or export is already running on this server.', flags: MessageFlags.Ephemeral });

  await withGuildLock(guild.id, async () => {
    await interaction.deferReply();
    let lastProgress = 0;
    const onProgress = (kind, done, total) => {
      if (Date.now() - lastProgress < PROGRESS_EVERY_MS) return;
      lastProgress = Date.now();
      return interaction.editReply(`Exporting ${kind}: ${done}/${total}`).catch(() => {});
    };
    const results = await exportGuild(guild, options.getString('type') ?? 'both', { onProgress });
    await interaction.editReply(`Export finished.\n${exportSummary(results)}`.slice(0, 2000));
  });
}

export default { data, execute };
