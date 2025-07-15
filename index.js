const { Client, GatewayDispatchEvents, Collection, REST, Routes, MessageFlags } = require("discord.js") // Import MessageFlags
const { Riffy } = require("riffy")
const { Spotify } = require("riffy-spotify")
const config = require("./config.js.bk")
const messages = require("./utils/messages.js")
const emojis = require("./emojis.js")
const connectDB = require("./database/connect.js")
const GuildSettings = require("./models/GuildSettings.js")
const path = require("node:path")
const fs = require("node:fs")

const client = new Client({
  intents: ["Guilds", "GuildMessages", "GuildVoiceStates", "GuildMessageReactions", "MessageContent", "DirectMessages"],
})

const spotify = new Spotify({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret,
})

client.riffy = new Riffy(client, config.nodes, {
  send: (payload) => {
    const guild = client.guilds.cache.get(payload.d.guild_id)
    if (guild) guild.shard.send(payload)
  },
  defaultSearchPlatform: "ytmsearch",
  restVersion: "v4",
  plugins: [spotify],
})

// Load commands
client.commands = new Collection()
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(
      `${emojis.error} [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
    )
  }
}

client.on("ready", async () => {
  client.riffy.init(client.user.id)
  console.log(`${emojis.success} Logged in as ${client.user.tag}`)

  // Connect to MongoDB
  await connectDB()

  // Deploy slash commands globally
  const rest = new REST().setToken(config.botToken)
  const commandsToDeploy = []
  for (const command of client.commands.values()) {
    commandsToDeploy.push(command.data.toJSON())
  }

  try {
    console.log(`${emojis.loading} Started refreshing ${commandsToDeploy.length} application (/) commands.`)
    const data = await rest.put(Routes.applicationCommands(config.clientId), { body: commandsToDeploy })
    console.log(`${emojis.success} Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    console.error(`${emojis.error} Error deploying commands:`, error)
  }
})

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    // Check if user is in a voice channel for music commands
    const musicCommands = [
      "play",
      "skip",
      "stop",
      "pause",
      "resume",
      "queue",
      "nowplaying",
      "volume",
      "shuffle",
      "loop",
      "remove",
      "clear",
    ]
    if (musicCommands.includes(interaction.commandName)) {
      if (!interaction.member.voice.channel) {
        return messages.error(interaction, "You must be in a voice channel!")
      }
    }

    try {
      await command.execute(interaction, client)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: [MessageFlags.Ephemeral], // Use flags instead of ephemeral
        })
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: [MessageFlags.Ephemeral], // Use flags instead of ephemeral
        })
      }
    }
  } else if (interaction.isAutocomplete()) {
    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      await command.autocomplete(interaction, client)
    } catch (error) {
      console.error(error)
    }
  } else if (interaction.isButton()) {
    // Handle buttons from the music controller (pause/resume, skip, stop, queue, shuffle)
    // Buttons for search selection (play_select_X) are handled within the play command's collector
    if (interaction.customId.startsWith("play_select_")) {
      // This interaction is handled by the collector in commands/play.js
      // Do nothing here, as the collector will process it.
      return
    }

    const [commandName, ...args] = interaction.customId.split("_")
    const command = client.commands.get(commandName)

    if (!command || !command.handleButton) {
      console.error(`No button handler for ${commandName} or command not found.`)
      return interaction.reply({ content: "This button action is not recognized.", flags: [MessageFlags.Ephemeral] }) // Use flags
    }

    try {
      await command.handleButton(interaction, client, args)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while processing this button action!",
          flags: [MessageFlags.Ephemeral], // Use flags
        })
      } else {
        await interaction.reply({
          content: "There was an error while processing this button action!",
          flags: [MessageFlags.Ephemeral], // Use flags
        })
      }
    }
  }
})

client.riffy.on("nodeConnect", (node) => {
  console.log(`${emojis.success} Node "${node.name}" connected.`)
})

client.riffy.on("nodeError", (node, error) => {
  console.log(`${emojis.error} Node "${node.name}" encountered an error: ${error.message}.`)
})

client.riffy.on("trackStart", async (player, track) => {
  const channel = client.channels.cache.get(player.textChannel)
  const guildSettings = await GuildSettings.findOne({ guildId: player.guildId })

  if (guildSettings && guildSettings.musicMessageId) {
    try {
      const oldMessage = await channel.messages.fetch(guildSettings.musicMessageId)
      await oldMessage.delete()
    } catch (error) {
      console.error("Could not delete old music message:", error.message)
    }
  }

  const newMessage = await messages.nowPlaying(channel, track, player)
  if (newMessage) {
    await GuildSettings.findOneAndUpdate(
      { guildId: player.guildId },
      { textChannelId: channel.id, musicMessageId: newMessage.id },
      { upsert: true, new: true },
    )
  }
})

client.riffy.on("queueEnd", async (player) => {
  const channel = client.channels.cache.get(player.textChannel)
  player.destroy()
  messages.queueEnded(channel)

  const guildSettings = await GuildSettings.findOne({ guildId: player.guildId })
  if (guildSettings && guildSettings.musicMessageId) {
    try {
      const oldMessage = await channel.messages.fetch(guildSettings.musicMessageId)
      await oldMessage.delete()
      await GuildSettings.findOneAndUpdate({ guildId: player.guildId }, { musicMessageId: null })
    } catch (error) {
      console.error("Could not delete old music message on queue end:", error.message)
    }
  }
})

client.on("raw", (d) => {
  if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) return
  client.riffy.updateVoiceState(d)
})

client.login(config.botToken)
