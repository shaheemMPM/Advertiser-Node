const mongoose              = require('mongoose'),
      passportLocalMongoose = require('passport-local-mongoose')

let adminSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true}
})

adminSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("Admin", adminSchema)
