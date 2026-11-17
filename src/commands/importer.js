import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { PROGRESS_EVERY_MS } from '../config.js';
import { importZip } from '../services/importer.js';
import { ALL_ZIPS, listZips, resolveZips } from '../services/zipFolder.js';
import { progressLine, sendSummary } from '../services/summary.js';
import { isBusy, withGuildLock } from '../utils/guildLock.js';

const data = new SlashCommandBuilder()
  .setName('import')
  .setDescription('Import PNG/GIF images from the zips folder as server emojis or stickers')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
  .setDMPermission(false)
  .addStringOption((o) => o.setName('zip').setDescription('Zip to import (or all of them)').setRequired(true).setAutocomplete(true))
  .addStringOption((o) => o.setName('type').setDescription('Emojis or stickers (default: based on the zip name)')
    .addChoices({ name: 'Emojis', value: 'emojis' }, { name: 'Stickers', value: 'stickers' }))
  .addStringOption((o) => o.setName('duplicates').setDescription('What to do when a name already exists on the server (default: skip)')
    .addChoices({ name: 'Skip', value: 'skip' }, { name: 'Rename (Name_2)', value: 'rename' }))
  .addStringOption((o) => o.setName('tag').setDescription('Stickers only: related emoji name (default: star)').setMaxLength(200));

async function autocomplete(interaction) {
  const typed = interaction.options.getFocused().toLowerCase();
  const choices = [
    { name: 'All zips in the folder', value: ALL_ZIPS },
    ...listZips().filter((z) => z.length <= 100).map((z) => ({ name: z, value: z })),
  ];
  await interaction.respond(choices.filter((c) => c.name.toLowerCase().includes(typed)).slice(0, 25));
}

async function execute(interaction) {
  const { guild, options } = interaction;
  if (!guild) return interaction.reply({ content: 'This command only works in a server.', flags: MessageFlags.Ephemeral });
  if (isBusy(guild.id)) return interaction.reply({ content: 'An import or export is already running on this server.', flags: MessageFlags.Ephemeral });

  const zips = resolveZips([options.getString('zip', true)]);
  const settings = {
    type: options.getString('type'),
    onDuplicate: options.getString('duplicates'),
    tag: options.getString('tag'),
    reason: `Imported by ${interaction.user.tag}`,
  };

  await withGuildLock(guild.id, async () => {
    await interaction.deferReply();
    for (const [n, zipName] of zips.entries()) {
      let lastProgress = 0;
      const onProgress = (i, total, report) => {
        if (Date.now() - lastProgress < PROGRESS_EVERY_MS) return;
        lastProgress = Date.now();
        return interaction.editReply(`Importing **${zipName}** (zip ${n + 1}/${zips.length})\n${progressLine(i, total, report)}`).catch(() => {});
      };
      await sendSummary(interaction, await importZip(guild, zipName, { ...settings, onProgress }));
    }
    await interaction.editReply(`Import finished: ${zips.length} zip(s) processed.`).catch(() => {});
  });
}

export default { data, autocomplete, execute };
