const mongoose = require('mongoose')

let adSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  medias: [String],
  users: [String]
})

module.exports = mongoose.model("Ads", adSchema)
