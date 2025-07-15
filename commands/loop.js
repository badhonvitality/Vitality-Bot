const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Toggle queue loop mode.")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("The loop mode to set")
        .setRequired(true)
        .addChoices(
          { name: "Off", value: "none" },
          { name: "Track", value: "track" },
          { name: "Queue", value: "queue" },
        ),
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true })
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")

    const newMode = interaction.options.getString("mode")
    player.setLoop(newMode)
    messages.success(interaction, `${newMode === "none" ? "Disabled" : `Set to ${newMode}`} loop mode!`)
  },
}
