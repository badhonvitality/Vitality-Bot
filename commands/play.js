const { SlashCommandBuilder, MessageFlags } = require("discord.js")
const messages = require("../utils/messages.js")
const { searchYouTube } = require("../utils/youtube.js") // Import YouTube search utility

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or playlist from a query or URL.")
    .addStringOption(
      (option) =>
        option.setName("query").setDescription("The song name or URL").setRequired(true).setAutocomplete(true), // Enable autocomplete
    ),
  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused()
    let choices = []

    if (focusedValue.length > 0) {
      try {
        const youtubeResults = await searchYouTube(focusedValue, 5) // Get top 5 YouTube results
        choices = youtubeResults.map((item) => {
          const title = `${item.snippet.title} - ${item.snippet.channelTitle}`
          // Truncate the name to fit Discord's 100-character limit
          const truncatedTitle = title.length > 100 ? `${title.substring(0, 97)}...` : title
          return {
            name: truncatedTitle,
            value: item.id.videoId, // Use video ID as the value
          }
        })
      } catch (error) {
        console.error("Error during YouTube autocomplete:", error)
      }
    }

    await interaction.respond(choices)
  },
  async execute(interaction, client) {
    await interaction.deferReply() // Defer reply to allow time for search and selection

    const query = interaction.options.getString("query")
    const player = client.riffy.createConnection({
      guildId: interaction.guild.id,
      voiceChannel: interaction.member.voice.channel.id,
      textChannel: interaction.channel.id,
      deaf: true,
    })

    try {
      // If the query looks like a YouTube video ID from autocomplete, construct the URL
      let finalQuery = query
      if (query.length === 11 && !query.startsWith("http")) {
        // Basic check for YouTube video ID length
        finalQuery = `https://www.youtube.com/watch?v=${query}`
      }

      const resolve = await client.riffy.resolve({
        query: finalQuery, // Use finalQuery
        requester: interaction.user,
      })

      const { loadType, tracks, playlistInfo } = resolve

      if (loadType === "playlist") {
        for (const track of resolve.tracks) {
          track.info.requester = interaction.user
          player.queue.add(track)
        }

        await messages.addedPlaylist(interaction, playlistInfo, tracks) // Use interaction for reply
        if (!player.playing && !player.paused) return player.play()
      } else if (loadType === "search" || loadType === "track") {
        if (tracks.length === 0) {
          return messages.error(interaction, "No results found! Try with a different search term.")
        }

        // If it's a direct track (e.g., from a URL) or only one result from search, play it directly
        if (loadType === "track" || tracks.length === 1) {
          const track = tracks.shift()
          track.info.requester = interaction.user
          const position = player.queue.length + 1
          player.queue.add(track)

          await messages.addedToQueue(interaction, track, position) // Use interaction for reply
          if (!player.playing && !player.paused) return player.play()
        } else {
          // Multiple search results, send selection UI
          const searchMessage = await messages.sendSearchResults(interaction, tracks.slice(0, 5)) // Show top 5 results

          const filter = (i) => i.customId.startsWith("play_select_") && i.user.id === interaction.user.id
          const collector = searchMessage.createMessageComponentCollector({ filter, time: 60000 }) // 60 seconds timeout

          collector.on("collect", async (i) => {
            await i.deferUpdate() // Defer the button interaction update

            const selectedIndex = Number.parseInt(i.customId.split("_")[2])
            const selectedTrack = tracks[selectedIndex]

            if (!selectedTrack) {
              await i.followUp({ content: "Invalid selection. Please try again.", flags: [MessageFlags.Ephemeral] })
              return
            }

            selectedTrack.info.requester = interaction.user
            const position = player.queue.length + 1
            player.queue.add(selectedTrack)

            await messages.addedToQueue(i, selectedTrack, position) // Use button interaction 'i' for reply
            if (!player.playing && !player.paused) player.play()

            // Edit the original search message to remove buttons
            await searchMessage.edit({ components: [] })
            collector.stop() // Stop collecting after a selection is made
          })

          collector.on("end", async (collected, reason) => {
            if (reason === "time") {
              // Edit the original search message to remove buttons and indicate timeout
              await searchMessage.edit({
                content: "No selection made. Search timed out.",
                components: [],
                embeds: [],
              })
            } else if (reason === "messageDelete") {
              // If the message was deleted, no need to edit it
              return
            }
          })
        }
      } else {
        return messages.error(interaction, "No results found! Try with a different search term.")
      }
    } catch (error) {
      console.error(error)
      return messages.error(interaction, "An error occurred while playing the track! Please try again later.")
    }
  },
}
