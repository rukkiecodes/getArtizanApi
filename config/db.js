const mongoose = require("mongoose")
require("dotenv").config()
const db = process.env.MONGO_URI

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      db, {
      // @ts-ignore
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
    )
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

module.exports = connectDB