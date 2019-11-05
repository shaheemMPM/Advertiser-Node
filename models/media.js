const mongoose = require('mongoose')

let mediaSchema = new mongoose.Schema({
  name: String,
  size: Number,
  type: String
})


module.exports = mongoose.model("Media", mediaSchema)
