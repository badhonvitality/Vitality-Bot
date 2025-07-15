const { REST, Routes } = require("discord.js")
const fs = require("node:fs")
const path = require("node:path")
const config = require("./config.js")
const emojis = require("./emojis.js")

const commands = []
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file))
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON())
  } else {
    console.log(`${emojis.error} [WARNING] The command at ${file} is missing a required "data" or "execute" property.`)
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.botToken)

// Deploy your commands!
;(async () => {
  try {
    console.log(`${emojis.loading} Started refreshing ${commands.length} application (/) commands.`)

    // The put method is used to fully refresh all commands in the guild with the current set
    // For global commands, use Routes.applicationCommands(clientId)
    // For guild-specific commands (faster for testing), use Routes.applicationGuildCommands(clientId, guildId)
    const data = await rest.put(
      config.guildId
        ? Routes.applicationGuildCommands(config.clientId, config.guildId)
        : Routes.applicationCommands(config.clientId),
      { body: commands },
    )

    console.log(`${emojis.success} Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(`${emojis.error} Error deploying commands:`, error)
  }
})()
