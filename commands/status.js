const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder().setName("status").setDescription("Show player status."),
  async execute(interaction, client) {
    await interaction.deferReply()
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "No active player found!")

    messages.playerStatus(interaction, player)
  },
}
