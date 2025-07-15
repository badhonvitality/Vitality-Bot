const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")
const emojis = require("../emojis.js") // Declare the emojis variable

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("Stop playback and clear queue."),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true })
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")

    player.destroy()
    messages.success(interaction, "Stopped the music and cleared the queue!")
  },
  async handleButton(interaction, client) {
    await interaction.deferUpdate()
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return interaction.followUp({ content: "Nothing is playing!", ephemeral: true })

    player.destroy()
    await interaction.editReply({
      content: `${emojis.success} Stopped the music and cleared the queue!`,
      components: [],
      embeds: [],
    })
  },
}
