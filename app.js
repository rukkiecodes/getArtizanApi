require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const bodyParser = require("body-parser")
const connectDB = require("./config/db")

const app = express()

connectDB()

app.use(cors())

app.use(
  bodyParser.urlencoded({
    true: false,
    limit: "50mb",
    extended: true,
  })
)

app.use(bodyParser.json({ limit: "50mb" }))

if (process.env.NODE_ENV === "development") app.use(morgan("dev"))

app.use('/auth', [
  require('./routes/auth/signup'),
  require('./routes/auth/signin'),
  require('./routes/auth/getProfile'),
  require('./routes/auth/updateProfile'),
  require('./routes/auth/updateAvatar')
])

app.use('/artizan', [
  require('./routes/artizan/findArtizan'),
  require('./routes/artizan/booking'),
  require('./routes/artizan/getBookings'),
  require('./routes/artizan/getSingleBooking'),
  require('./routes/artizan/done'),
  require('./routes/artizan/rateArtizan')
])

// Error handling
app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  console.log(error)
  res.status(status).json({ message: message, data: data })
})

const PORT = process.env.PORT || 8000
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`)
)