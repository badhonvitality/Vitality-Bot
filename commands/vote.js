const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const config = require("../config.js.bk")
const emojis = require("../emojis.js")

module.exports = {
  data: new SlashCommandBuilder().setName("vote").setDescription("Get the link to vote for the bot on Top.gg."),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${emojis.info} Support Vitality Bot!`)
      .setDescription("Love Vitality Bot? Show your support by voting for us on Top.gg!")
      .addFields({
        name: "Why Vote?",
        value: "Voting helps us climb the ranks on Top.gg, reaching more users and growing our community!",
        inline: false,
      })
      .setFooter({ text: `Dev by ${config.devBy}` })

    const voteButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Vote on Top.gg").setStyle(ButtonStyle.Link).setURL(config.topggUrl),
    )

    await interaction.reply({ embeds: [embed], components: [voteButton] })
  },
}
