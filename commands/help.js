const { SlashCommandBuilder } = require("discord.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Show all available commands."),
  async execute(interaction, client) {
    await interaction.deferReply()
    const commands = Array.from(client.commands.values()).map((cmd) => ({
      name: cmd.data.name,
      description: cmd.data.description,
    }))
    messages.help(interaction, commands)
  },
}
