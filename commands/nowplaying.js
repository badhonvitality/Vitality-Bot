const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder().setName("nowplaying").setDescription("Show current track info."),
  async execute(interaction, client) {
    await interaction.deferReply()
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")
    if (!player.queue.current) return messages.error(interaction, "No track is currently playing!")

    messages.nowPlaying(interaction.channel, player.queue.current, player) // Use interaction.channel for nowPlaying
  },
}
