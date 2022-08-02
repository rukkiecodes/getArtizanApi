const router = require("express").Router()
const checkAuth = require("../../middleware/auth")
const Booking = require('../../models/booking')

router.post("/done", checkAuth, async (req, res) => {
  const { _id } = req.body

  try {
    let booking = await Booking.updateOne({ _id }, { $set: { status: 'done' } })
    return res.status(200).json({
      message: "Job finished",
      success: true,
      booking
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Auth failed",
      error,
    })
  }
})

module.exports = router