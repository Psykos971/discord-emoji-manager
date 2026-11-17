import { AttachmentBuilder } from 'discord.js';

const FULL_LABELS = { static: 'static emojis', animated: 'animated emojis', stickers: 'stickers' };

export const progressLine = (i, total, report) =>
  `${i}/${total} | ${report.added.length} added, ${report.skipped.length} skipped, ${report.failed.length} errors`;

export function buildSummary({ zipName, type, total, report, full }) {
  const content = [
    `**${zipName}**: ${type} import finished (${total} images)`,
    `- Added: **${report.added.length}**`,
    `- Skipped (already exist): **${report.skipped.length}**`,
    `- Errors: **${report.failed.length}**`,
    ...Object.entries(FULL_LABELS)
      .filter(([key]) => full[key])
      .map(([, label]) => `Warning: no room left for **${label}** (boost the server to get more slots).`),
  ].join('\n');

  const reportText = [['ADDED', report.added], ['SKIPPED', report.skipped], ['ERRORS', report.failed]]
    .map(([title, list]) => [`${title} (${list.length})`, ...list].join('\n'))
    .join('\n\n');

  return { content, reportText };
}

export async function sendSummary(interaction, result) {
  const { content, reportText } = buildSummary(result);
  const files = [new AttachmentBuilder(Buffer.from(reportText, 'utf8'), { name: 'report.txt' })];

  await interaction.followUp({ content, files }).catch(() =>
    interaction.channel?.send({ content: `${interaction.user}\n${content}`, files })
      .catch((err) => console.error('Could not send the summary:', err.message)));
}
