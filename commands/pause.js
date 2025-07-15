const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")
const emojis = require("../emojis.js") // Declare the emojis variable

module.exports = {
  data: new SlashCommandBuilder().setName("pause").setDescription("Pause the current track."),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true })
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return messages.error(interaction, "Nothing is playing!")
    if (player.paused) return messages.error(interaction, "The player is already paused!")

    player.pause(true)
    messages.success(interaction, "Paused the music!")
  },
  async handleButton(interaction, client) {
    await interaction.deferUpdate()
    const player = client.riffy.players.get(interaction.guild.id)
    if (!player) return interaction.followUp({ content: "Nothing is playing!", ephemeral: true })
    if (player.paused) {
      player.pause(false)
      await interaction.editReply({
        content: `${emojis.success} Resumed the music!`,
        components: [],
        embeds: [],
      }) // Clear buttons after action
      // Re-send now playing message with updated buttons
      const channel = client.channels.cache.get(player.textChannel)
      const newMessage = await messages.nowPlaying(channel, player.queue.current, player)
      if (newMessage) {
        const GuildSettings = require("../models/GuildSettings.js")
        await GuildSettings.findOneAndUpdate(
          { guildId: player.guildId },
          { textChannelId: channel.id, musicMessageId: newMessage.id },
          { upsert: true, new: true },
        )
      }
    } else {
      player.pause(true)
      await interaction.editReply({
        content: `${emojis.success} Paused the music!`,
        components: [],
        embeds: [],
      }) // Clear buttons after action
      // Re-send now playing message with updated buttons
      const channel = client.channels.cache.get(player.textChannel)
      const newMessage = await messages.nowPlaying(channel, player.queue.current, player)
      if (newMessage) {
        const GuildSettings = require("../models/GuildSettings.js")
        await GuildSettings.findOneAndUpdate(
          { guildId: player.guildId },
          { textChannelId: channel.id, musicMessageId: newMessage.id },
          { upsert: true, new: true },
        )
      }
    }
  },
}
