const mongoose = require('mongoose')

let adSchema = new mongoose.Schema({
  title: String,
  description: String,
  medias: [String],
  users: [String]
})

module.exports = mongoose.model("Ads", adSchema)
