const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")
const emojis = require("../emojis.js")

module.exports = {
  data: new SlashCommandBuilder().setName("shuffle").setDescription("Shuffle the current queue."),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true })
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")
    if (!player.queue.length) return messages.error(interaction, "Not enough tracks in queue to shuffle!")

    player.queue.shuffle()
    messages.success(interaction, `${emojis.shuffle} Shuffled the queue!`)
  },
  async handleButton(interaction, client) {
    await interaction.deferUpdate()
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return interaction.followUp({ content: "Nothing is playing!", ephemeral: true })
    if (!player.queue.length)
      return interaction.followUp({ content: "Not enough tracks in queue to shuffle!", ephemeral: true })

    player.queue.shuffle()
    await interaction.editReply({ content: `${emojis.success} Shuffled the queue!`, components: [], embeds: [] })
  },
}
