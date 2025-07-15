const axios = require("axios")
const config = require("../config.js.bk")

async function searchYouTube(query, maxResults = 5) {
  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        key: config.youtubeApiKey,
        q: query,
        part: "snippet",
        type: "video",
        maxResults: maxResults,
      },
    })
    return response.data.items
  } catch (error) {
    console.error("Error searching YouTube:", error.response ? error.response.data : error.message)
    return []
  }
}

module.exports = { searchYouTube }
