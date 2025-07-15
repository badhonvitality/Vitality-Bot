const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")
const emojis = require("../emojis.js") // Declare the emojis variable

module.exports = {
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip the current track."),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true })
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")
    if (!player.queue.length && !player.queue.current)
      return messages.error(interaction, "No more tracks in queue to skip to!")

    player.stop()
    messages.success(interaction, "Skipped the current track!")
  },
  async handleButton(interaction, client) {
    await interaction.deferUpdate()
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return interaction.followUp({ content: "Nothing is playing!", ephemeral: true })
    if (!player.queue.length && !player.queue.current)
      return interaction.followUp({ content: "No more tracks in queue to skip to!", ephemeral: true })

    player.stop()
    await interaction.editReply({ content: `${emojis.success} Skipped the current track!`, components: [], embeds: [] })
  },
}
