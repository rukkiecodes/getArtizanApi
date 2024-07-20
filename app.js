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

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET")
        return res.status(200).json({})
    }
    next()
})

if (process.env.NODE_ENV === "development") app.use(morgan("dev"))

app.use('/auth', [
    require('./routes/auth/signup'),
    require('./routes/auth/verifyOTP'),
    require('./routes/auth/resendVerification'),
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

app.use('/waitlist', [
    require('./routes/waitlist/waitlist'),
    require('./routes/waitlist/getList')
])

app.use('/mail', [
    require('./routes/mail/acceptJob')
])

// Error handling
app.use((error, req, res, next) => {
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    console.log(error)
    res.status(status).json({ message: message, data: data })
})

app.use((req, res, next) => {
    const error = new Error("Not found")
        // @ts-ignore
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message,
        },
    })
})

const PORT = process.env.PORT || 8000
app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`)
)