<div align="center">

# Discord Emoji Manager

**Bulk import and export Discord emojis and stickers with zip files.**

Drop a zip, run one command, and hundreds of emojis land on your server.
Back up a whole server's emojis just as easily.

[![Node.js](https://img.shields.io/badge/Node.js-20.6%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## Why?

Discord has **no bulk upload**. Adding 200 emojis means clicking "Upload Emoji" 200 times, and the emoji
settings do not accept zip files.

Discord Emoji Manager fixes that:

- **Import**: reads zip files from a local folder and uploads every image as an emoji or sticker.
- **Export**: downloads every emoji and sticker of a server into clean zip files.
- **Round trip**: an exported zip can be imported as is on another server. Moving emojis between servers takes two commands.

## Features

| | |
|---|---|
| **Bulk import** | Hundreds of emojis or stickers from one or several zips in a single command |
| **Bulk export** | Emojis, stickers or both, saved as separate zip files |
| **Clean names** | `3Head_1017859896173142057.png` becomes `:3Head:` (IDs, accents and invalid characters removed) |
| **Smart duplicates** | Skip names that already exist, or rename them `Name_2`, `Name_3`... |
| **Auto resize** | Oversized emojis are shrunk to fit 256 KB, GIFs stay animated. Stickers are fitted to 320x320 / 512 KB |
| **Type detection** | A zip with "sticker" in its name is imported as stickers, everything else as emojis |
| **Rate-limit aware** | Waits out Discord rate limits on its own, no failed uploads |
| **Two ways to run** | Slash commands on Discord, or plain terminal commands without keeping the bot online |
| **Detailed reports** | Added, skipped and failed items listed for every zip |
| **Local only** | Zips never leave your computer: nothing is uploaded to Discord as a file |

## Quick start

### 1. Create the bot

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. **Bot** tab: click **Reset Token** and copy the token.
3. **General Information** tab: copy the **Application ID**.
4. **OAuth2 > URL Generator**: check `bot` and `applications.commands`, then the **Manage Expressions**
   permission. Open the generated URL to invite the bot to your server.

### 2. Install

```bash
git clone https://github.com/Psykos971/discord-emoji-manager.git
cd discord-emoji-manager
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```

Fill in `.env`:

```ini
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_server_id   # server to import into / export from
ZIPS_DIR=                 # optional: another folder for the zips to import
EXPORTS_DIR=              # optional: another folder for exported zips
```

> To get the server ID, enable **Developer Mode** in Discord settings, then right-click the server and choose **Copy Server ID**.

### 3. Run

```bash
npm run deploy   # register the slash commands (once, and after every update)
npm start        # start the bot
```

## Usage

### Import

Put your zips in the **`zips/`** folder, then:

```bash
# From Discord
/import zip:<pick a zip or "All zips in the folder">

# From the terminal (the bot does not need to be running)
npm run import                                   # every zip in zips/
npm run import -- "my-emojis.zip"                # a single zip
npm run import -- "a.zip" "b.zip" --duplicates rename
npm run import -- --type stickers --tag smile --server 123456789012345678
```

| Option       | Values                     | Default               |
|--------------|----------------------------|-----------------------|
| `type`       | `emojis` / `stickers`      | based on the zip name |
| `duplicates` | `skip` / `rename`          | `skip`                |
| `tag`        | related emoji for stickers | `star`                |
| `server`     | server ID (terminal only)  | `GUILD_ID`            |

On Discord, the bot shows live progress and posts a summary with a `report.txt` for each zip.
In the terminal, reports are saved to the **`reports/`** folder.

### Export

```bash
# From Discord
/export type:<Emojis | Stickers | Both>

# From the terminal
npm run export                    # emojis and stickers
npm run export -- --type emojis
```

Zips are saved to the **`exports/`** folder as `<server>-emojis-<date>.zip` and `<server>-stickers-<date>.zip`.
Files keep the `Name_ID.png` format, so you can drop them straight into `zips/` and import them elsewhere.

## How names are cleaned

| File in the zip                     | Emoji on Discord |
|-------------------------------------|------------------|
| `3Head_1017859896173142057.png`     | `:3Head:`        |
| `blobDance_1017859454974316665.gif` | `:blobDance:`    |
| `Éclair été.png`                    | `:Eclair_ete:`   |
| second `EZ_...png` in the same zip  | `:EZ_2:`         |

Names are case-sensitive: `FubuAwoo` and `fubuAwoo` are two different emojis.

## Discord limits

| Server boost | Static emojis | Animated emojis | Stickers |
|--------------|---------------|-----------------|----------|
| Level 0      | 50            | 50              | 5        |
| Level 1      | 100           | 100             | 15       |
| Level 2      | 150           | 150             | 30       |
| Level 3      | 250           | 250             | 60       |

When a category is full, the bot skips the rest of it and lists those files in the report.

> Lottie stickers (Discord's official animated stickers) are exported as `.json` and cannot be re-imported.

## Project structure

```
src/
  index.js                entry point
  config.js               .env variables and settings
  deploy-commands.js      registers slash commands
  cli/                    terminal commands (import, export, shared helpers)
  commands/               slash commands (/import, /export)
  events/                 Discord events (ready, interactions, errors, rate limits)
  handlers/               command, event and error loaders
  services/               import, export, zip folder and report logic
  utils/                  zip reading, image processing, name cleaning, per-server lock
```

Adding a command: create a file in `src/commands/` exporting `{ data, execute }`, then add it to
`src/handlers/commandHandler.js`.

## License

[ISC](LICENSE)
