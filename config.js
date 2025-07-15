require("dotenv").config(); // Load environment variables from .env file

module.exports = {
  prefix: process.env.PREFIX || "!",

  nodes: [
    {
      host: process.env.LAVALINK_HOST,
      password: process.env.LAVALINK_PASSWORD,
      port: parseInt(process.env.LAVALINK_PORT, 10),
      secure: process.env.LAVALINK_SECURE === "true", // ✅ Convert string to boolean
      name: "Main Node",
    },
  ],

  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  },

  botToken: process.env.BOT_TOKEN,
  embedColor: process.env.EMBED_COLOR || "#0061ff",
  mongoUri: process.env.MONGO_URI,
  geminiApiKey: process.env.GEMINI_API_KEY,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  clientId: process.env.CLIENT_ID,
  topggUrl: process.env.TOPGG_URL,

  // Optional fallbacks
  devBy: process.env.DEV_BY || "Badhon Vitality",
  devInviteLink: process.env.DEV_INVITE_LINK || "",
};
