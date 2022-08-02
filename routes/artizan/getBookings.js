const router = require("express").Router()
const checkAuth = require("../../middleware/auth")
const Booking = require('../../models/booking')

router.post("/getBookings", checkAuth, async (req, res) => {
  const { user } = req.body

  try {
    let _user = await Booking.findOne({ user })
    if (_user) {
      return res.status(200).json({
        message: "Bookings found",
        user: _user,
      })
    } else {
      return res.status(401).json({
        message: "Bookings not found",
      })
    }
  } catch (error) {
    return res.status(401).json({
      message: "Bookings not found",
    })
  }
})

module.exports = router