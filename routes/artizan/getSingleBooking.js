const router = require("express").Router()
const checkAuth = require("../../middleware/auth")
const Booking = require('../../models/booking')

router.post("/getSingleBooking", checkAuth, async (req, res) => {
  const { _id } = req.body

  try {
    let _user = await Booking.findOne({ _id })
    if (_user) {
      return res.status(200).json({
        message: "Booking found",
        user: _user,
      })
    } else {
      return res.status(401).json({
        message: "Booking not found",
      })
    }
  } catch (error) {
    return res.status(401).json({
      message: "Booking not found",
    })
  }
})

module.exports = router