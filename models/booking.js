const mongoose = require('mongoose')


const bookingSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String },
  time: { type: String },
  date: { type: String },
  phone: { type: String },
  address: { type: String },
  email: { type: String },
  description: { type: String },
  status: {
    type: String,
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true })

module.exports = mongoose.model("Booking", bookingSchema)