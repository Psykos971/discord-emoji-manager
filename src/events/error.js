import { Events } from 'discord.js';

export default {
  name: Events.Error,
  execute(err) {
    console.error('Discord client error:', err);
  },
};
