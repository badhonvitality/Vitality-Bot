const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js")
const emojis = require("../emojis.js")
const config = require("../config.js.bk")

function formatDuration(ms) {
  // Return 'LIVE' for streams
  if (!ms || ms <= 0 || ms === "Infinity") return "LIVE"

  // Convert to seconds
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor(ms / (1000 * 60 * 60))

  // Format based on length
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function getDurationString(track) {
  if (track.info.isStream) return "LIVE"
  if (!track.info.duration) return "N/A"
  return formatDuration(track.info.duration)
}

// Helper function to get the common footer text
function getFooterText() {
  return `Dev by ${config.devBy}`
}

// Helper function to get the common vote button row
function getVoteButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Vote on Top.gg").setStyle(ButtonStyle.Link).setURL(config.topggUrl),
  )
}

module.exports = {
  success: async (interaction, message) => {
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ content: `${emojis.success} | ${message}` })
    } else {
      return interaction.reply({ content: `${emojis.success} | ${message}` })
    }
  },

  error: async (interaction, message) => {
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ content: `${emojis.error} | ${message}`, flags: [MessageFlags.Ephemeral] })
    } else {
      return interaction.reply({ content: `${emojis.error} | ${message}`, flags: [MessageFlags.Ephemeral] })
    }
  },

  nowPlaying: async (channel, track, player) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.music} Now Playing`)
      .setDescription(`[${track.info.title}](${track.info.uri})`)

    if (track.info.thumbnail && typeof track.info.thumbnail === "string") {
      embed.setThumbnail(track.info.thumbnail)
    }

    embed
      .addFields([
        { name: "Artist", value: `${emojis.info} ${track.info.author}`, inline: true },
        { name: "Duration", value: `${emojis.time} ${getDurationString(track)}`, inline: true },
        { name: "Requested By", value: `${emojis.info} ${track.info.requester.tag}`, inline: true },
      ])
      .setFooter({ text: getFooterText() }) // Use the helper function for footer

    const controlRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("pause_resume")
        .setLabel(player.paused ? "Resume" : "Pause")
        .setStyle(ButtonStyle.Primary)
        .setEmoji(player.paused ? emojis.play : emojis.pause),
      new ButtonBuilder().setCustomId("skip").setLabel("Skip").setStyle(ButtonStyle.Primary).setEmoji(emojis.skip),
      new ButtonBuilder().setCustomId("stop").setLabel("Stop").setStyle(ButtonStyle.Danger).setEmoji(emojis.stop),
      new ButtonBuilder().setCustomId("queue").setLabel("Queue").setStyle(ButtonStyle.Secondary).setEmoji(emojis.queue),
      new ButtonBuilder()
        .setCustomId("shuffle")
        .setLabel("Shuffle")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(emojis.shuffle),
    )

    return channel.send({ embeds: [embed], components: [controlRow, getVoteButtonRow()] }) // Add vote button
  },

  addedToQueue: async (interaction, track, position) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setDescription(`${emojis.success} Added to queue: [${track.info.title}](${track.info.uri})`)

    if (track.info.thumbnail && typeof track.info.thumbnail === "string") {
      embed.setThumbnail(track.info.thumbnail)
    }

    embed
      .addFields([
        { name: "Artist", value: `${emojis.info} ${track.info.author}`, inline: true },
        { name: "Duration", value: `${emojis.time} ${getDurationString(track)}`, inline: true },
        { name: "Position", value: `${emojis.queue} #${position}`, inline: true },
      ])
      .setFooter({ text: getFooterText() }) // Use the helper function for footer

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    } else {
      return interaction.reply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    }
  },

  addedPlaylist: async (interaction, playlistInfo, tracks) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.success} Added Playlist`)
      .setDescription(`**${playlistInfo.name}**`)

    if (playlistInfo.thumbnail && typeof playlistInfo.thumbnail === "string") {
      embed.setThumbnail(playlistInfo.thumbnail)
    }

    const totalDuration = tracks.reduce((acc, track) => {
      if (!track.info.isStream && track.info.duration) {
        return acc + track.info.duration
      }
      return acc
    }, 0)

    embed
      .addFields([
        { name: "Total Tracks", value: `${emojis.queue} ${tracks.length} tracks`, inline: true },
        { name: "Total Duration", value: `${emojis.time} ${formatDuration(totalDuration)}`, inline: true },
        {
          name: "Stream Count",
          value: `${emojis.info} ${tracks.filter((t) => t.info.isStream).length} streams`,
          inline: true,
        },
      ])
      .setFooter({ text: `The playlist will start playing soon. ${getFooterText()}` }) // Use the helper function for footer

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    } else {
      return interaction.reply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    }
  },

  queueEnded: (channel) => {
    return channel.send({
      content: `${emojis.info} | Queue has ended. Leaving voice channel.`,
      components: [getVoteButtonRow()],
    }) // Add vote button
  },

  queueList: async (interaction, queue, currentTrack, currentPage = 1, totalPages = 1) => {
    const embed = new EmbedBuilder().setColor(config.embedColor).setTitle(`${emojis.queue} Queue List`)

    if (currentTrack) {
      embed.setDescription(
        `**Now Playing:**\n${emojis.play} [${currentTrack.info.title}](${currentTrack.info.uri}) - ${getDurationString(
          currentTrack,
        )}\n\n**Up Next:**`,
      )

      if (currentTrack.info.thumbnail && typeof currentTrack.info.thumbnail === "string") {
        embed.setThumbnail(currentTrack.info.thumbnail)
      }
    } else {
      embed.setDescription("**Queue:**")
    }

    if (queue.length) {
      const tracks = queue
        .map(
          (track, i) =>
            `\`${(i + 1).toString().padStart(2, "0")}\` ${emojis.song} [${track.info.title}](${
              track.info.uri
            }) - ${getDurationString(track)}`,
        )
        .join("\n")
      embed.addFields({ name: "\u200b", value: tracks })

      const totalDuration = queue.reduce((acc, track) => {
        if (!track.info.isStream && track.info.duration) {
          return acc + track.info.duration
        }
        return acc
      }, 0)

      const streamCount = queue.filter((t) => t.info.isStream).length
      const durationText =
        streamCount > 0
          ? `Total Duration: ${formatDuration(totalDuration)} (${streamCount} streams)`
          : `Total Duration: ${formatDuration(totalDuration)}`

      embed.setFooter({
        text: `Total Tracks: ${queue.length} • ${durationText} • Page ${currentPage}/${totalPages}`,
      })
    } else {
      embed.addFields({ name: "\u200b", value: "No tracks in queue" })
      embed.setFooter({ text: `Page ${currentPage}/${totalPages}` })
    }
    embed.setFooter({ text: getFooterText() }) // Use the helper function for footer

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    } else {
      return interaction.reply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    }
  },

  playerStatus: async (interaction, player) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.info} Player Status`)
      .addFields([
        {
          name: "Status",
          value: player.playing ? `${emojis.play} Playing` : `${emojis.pause} Paused`,
          inline: true,
        },
        {
          name: "Volume",
          value: `${emojis.volume} ${player.volume}%`,
          inline: true,
        },
        {
          name: "Loop Mode",
          value: `${emojis.repeat} ${player.loop === "queue" ? "Queue" : "Disabled"}`,
          inline: true,
        },
      ])

    if (player.queue.current) {
      const track = player.queue.current
      embed.setDescription(
        `**Currently Playing:**\n${emojis.music} [${track.info.title}](${track.info.uri})\n` +
          `${emojis.time} Duration: ${getDurationString(track)}`,
      )

      if (track.info.thumbnail && typeof track.info.thumbnail === "string") {
        embed.setThumbnail(track.info.thumbnail)
      }
    }
    embed.setFooter({ text: getFooterText() }) // Use the helper function for footer

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    } else {
      return interaction.reply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    }
  },

  help: async (interaction, commands) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.info} Available Commands`)
      .setDescription(commands.map((cmd) => `${emojis.music} \`/${cmd.name}\` - ${cmd.description}`).join("\n"))
      .setFooter({ text: getFooterText() }) // Use the helper function for footer
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    } else {
      return interaction.reply({ embeds: [embed], components: [getVoteButtonRow()] }) // Add vote button
    }
  },

  sendSearchResults: async (interaction, tracks) => {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.music} Search Results`)
      .setDescription("Select a track from the list below:")
      .setFooter({ text: getFooterText() }) // Use the helper function for footer

    const rows = []
    for (let i = 0; i < Math.min(tracks.length, 5); i++) {
      const track = tracks[i]
      embed.addFields({
        name: `${i + 1}. ${track.info.title}`,
        value: `Artist: ${track.info.author} | Duration: ${getDurationString(track)}`,
        inline: false,
      })
      if (i % 5 === 0) {
        rows.push(new ActionRowBuilder())
      }
      rows[rows.length - 1].addComponents(
        new ButtonBuilder()
          .setCustomId(`play_select_${i}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Primary),
      )
    }

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ embeds: [embed], components: [...rows, getVoteButtonRow()] }) // Add vote button
    } else {
      return interaction.reply({ embeds: [embed], components: [...rows, getVoteButtonRow()] }) // Add vote button
    }
  },
}
