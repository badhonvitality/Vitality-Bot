const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder().setName("queue").setDescription("Show the current queue."),
  async execute(interaction, client) {
    await interaction.deferReply()
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")

    const queue = player.queue
    if (!queue.length && !player.queue.current) {
      return messages.error(interaction, "Queue is empty! Add some tracks with the play command.")
    }

    messages.queueList(interaction, queue, player.queue.current)
  },
  async handleButton(interaction, client) {
    await interaction.deferUpdate()
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return interaction.followUp({ content: "Nothing is playing!", ephemeral: true })

    const queue = player.queue
    if (!queue.length && !player.queue.current) {
      return interaction.followUp({
        content: "Queue is empty! Add some tracks with the play command.",
        ephemeral: true,
      })
    }

    messages.queueList(interaction, queue, player.queue.current)
  },
}
