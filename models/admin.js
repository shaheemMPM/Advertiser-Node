const mongoose              = require('mongoose'),
      passportLocalMongoose = require('passport-local-mongoose')

let adminSchema = new mongoose.Schema({
  username: String,
  password: String
})

adminSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("Admin", adminSchema)
