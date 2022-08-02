const mongoose = require("mongoose")

const WaitlistSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true })

module.exports = mongoose.model("Waitlist", WaitlistSchema)