import { EXPORT_KINDS, exportGuild, exportSummary } from '../services/exporter.js';
import { fail, parseCli, withGuild } from './session.js';

const { values } = parseCli(
  { type: { type: 'string', default: 'both' } },
  'Usage: npm run export -- [--type emojis|stickers|both] [--server ID]',
);
if (!EXPORT_KINDS[values.type]) fail('--type must be emojis, stickers or both.');

await withGuild(values.server, async (guild) => {
  console.log(`Exporting ${values.type} from ${guild.name}...`);
  const results = await exportGuild(guild, values.type, {
    onProgress: (kind, done, total) => { if (done === total || done % 25 === 0) console.log(`${kind}: ${done}/${total}`); },
  });
  console.log(`\n${exportSummary(results).replaceAll('**', '')}`);
});
