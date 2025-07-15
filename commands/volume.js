const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Adjust player volume.")
    .addIntegerOption((option) =>
      option
        .setName("percent")
        .setDescription("Volume percentage (0-100)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100),
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true })
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")

    const volume = interaction.options.getInteger("percent")

    player.setVolume(volume)
    messages.success(interaction, `Set volume to ${volume}%`)
  },
}
