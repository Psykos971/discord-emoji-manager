import fs from 'node:fs';
import path from 'node:path';
import { REPORTS_DIR } from '../config.js';
import { importZip } from '../services/importer.js';
import { resolveZips } from '../services/zipFolder.js';
import { buildSummary } from '../services/summary.js';
import { fail, parseCli, withGuild } from './session.js';

const { values, positionals } = parseCli(
  { type: { type: 'string' }, duplicates: { type: 'string' }, tag: { type: 'string' } },
  'Usage: npm run import -- ["file.zip" ...] [--type emojis|stickers] [--duplicates skip|rename] [--tag name] [--server ID]',
);
if (values.type && !['emojis', 'stickers'].includes(values.type)) fail('--type must be emojis or stickers.');
if (values.duplicates && !['skip', 'rename'].includes(values.duplicates)) fail('--duplicates must be skip or rename.');

let zips;
try {
  zips = resolveZips(positionals.map((p) => path.basename(p)));
} catch (err) {
  fail(err.message);
}

await withGuild(values.server, async (guild) => {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  for (const zipName of zips) {
    console.log(`\n== ${zipName} ==`);
    const result = await importZip(guild, zipName, {
      type: values.type, onDuplicate: values.duplicates, tag: values.tag, reason: 'Imported from the terminal',
    });
    const { content, reportText } = buildSummary(result);
    const reportFile = path.join(REPORTS_DIR, `${zipName.replace(/\.zip$/i, '')}.txt`);
    fs.writeFileSync(reportFile, reportText);
    console.log(`\n${content.replaceAll('**', '')}\nReport: ${reportFile}`);
  }
});
