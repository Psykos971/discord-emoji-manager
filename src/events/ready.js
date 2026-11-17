import { Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(c) {
    console.log(`Logged in as ${c.user.tag}`);
  },
};
