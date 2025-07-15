const mongoose = require("mongoose")
const config = require("../config.js.bk")
const emojis = require("../emojis.js")

module.exports = async () => {
  try {
    // Removed deprecated options useNewUrlParser and useUnifiedTopology
    await mongoose.connect(config.mongoUri)
    console.log(`${emojis.success} Connected to MongoDB!`)
  } catch (error) {
    console.error(`${emojis.error} Could not connect to MongoDB:`, error.message)
    process.exit(1) // Exit the process if unable to connect
  }
}
