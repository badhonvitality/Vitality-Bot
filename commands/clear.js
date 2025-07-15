const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder().setName("clear").setDescription("Clear the current queue."),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true })
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")
    if (!player.queue.length) return messages.error(interaction, "Queue is already empty!")

    player.queue.clear()
    messages.success(interaction, "Cleared the queue!")
  },
}
