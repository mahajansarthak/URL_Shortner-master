const mongoose = require('mongoose')
const shortId = require('shortid')



const User = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    default: shortId.generate
},
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
})

module.exports = mongoose.model('User', User)