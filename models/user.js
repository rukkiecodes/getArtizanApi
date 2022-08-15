const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  avatar: { type: String },
  rating: { type: Number },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  state: { type: String, required: true },
  lga: { type: String, required: true },
  specialty: { type: String, required: true },
  password: { type: String, required: true },
  description: { type: String },
  verified: Boolean
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)