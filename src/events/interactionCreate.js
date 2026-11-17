import { Events, MessageFlags } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    if (interaction.isAutocomplete()) return command.autocomplete?.(interaction).catch((err) => console.error(err));
    if (!interaction.isChatInputCommand()) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      const content = `Error: ${err.message}`;
      const reply = interaction.deferred || interaction.replied
        ? interaction.editReply(content)
        : interaction.reply({ content, flags: MessageFlags.Ephemeral });
      await reply.catch(() => {});
    }
  },
};
