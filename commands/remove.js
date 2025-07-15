const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a track from queue by position.")
    .addIntegerOption((option) =>
      option.setName("position").setDescription("The position of the track to remove").setRequired(true),
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true })
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")

    const position = interaction.options.getInteger("position")
    if (!position || position < 1 || position > player.queue.length) {
      return messages.error(interaction, `Please provide a valid track position between 1 and ${player.queue.length}!`)
    }

    const removed = player.queue.remove(position - 1)
    messages.success(interaction, `Removed **${removed.info.title}** from the queue!`)
  },
}
