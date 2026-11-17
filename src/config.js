import { fileURLToPath } from 'node:url';

const fromRoot = (dir) => fileURLToPath(new URL(`../${dir}/`, import.meta.url));

export const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

export const ZIPS_DIR = process.env.ZIPS_DIR || fromRoot('zips');
export const REPORTS_DIR = fromRoot('reports');
export const EXPORTS_DIR = process.env.EXPORTS_DIR || fromRoot('exports');
export const PROGRESS_EVERY_MS = 4000;
export const MAX_REACHED_CODES = [30008, 30039]; // emoji slots full, sticker slots full
