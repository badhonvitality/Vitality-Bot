const mongoose = require("mongoose")

const GuildSettingsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  textChannelId: {
    type: String,
    default: null, // Default text channel for music messages
  },
  musicMessageId: {
    type: String,
    default: null, // ID of the last sent music control message
  },
  // Add other guild-specific settings here if needed
  // For example, defaultVolume: { type: Number, default: 50 }
})

module.exports = mongoose.model("GuildSettings", GuildSettingsSchema)
