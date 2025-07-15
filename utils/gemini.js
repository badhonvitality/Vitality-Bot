const axios = require("axios")
const config = require("../config.js.bk")

async function generateText(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    // The response structure for direct API calls might be different.
    // We need to access the 'candidates' array and then 'parts' to get the text.
    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const firstCandidate = response.data.candidates[0]
      if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
        return firstCandidate.content.parts[0].text
      }
    }
    return null
  } catch (error) {
    console.error("Error generating text with Gemini:", error.response ? error.response.data : error.message)
    return null
  }
}

module.exports = { generateText }
