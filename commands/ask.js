const { SlashCommandBuilder } = require("discord.js")
const { generateText } = require("../utils/gemini.js")
const messages = require("../utils/messages.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask the Gemini AI a question.")
    .addStringOption((option) =>
      option.setName("question").setDescription("Your question for the AI").setRequired(true),
    ),
  async execute(interaction, client) {
    await interaction.deferReply()
    const question = interaction.options.getString("question")

    try {
      const response = await generateText(question)
      if (response) {
        await interaction.editReply({ content: `**Your Question:** ${question}\n\n**Gemini's Answer:**\n${response}` })
      } else {
        await messages.error(interaction, "Could not get a response from Gemini AI.")
      }
    } catch (error) {
      console.error("Error with Gemini AI:", error)
      await messages.error(interaction, "An error occurred while contacting the AI. Please try again later.")
    }
  },
}
