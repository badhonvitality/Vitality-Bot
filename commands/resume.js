const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("Resume the current track."),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true })
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")
    if (!player.paused) return messages.error(interaction, "The player is already playing!")

    player.pause(false)
    messages.success(interaction, "Resumed the music!")
  },
}
