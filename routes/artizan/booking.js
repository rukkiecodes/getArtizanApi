const router = require('express').Router()
const Booking = require('../../models/booking')
const mongoose = require('mongoose')

router.post('/bookArtizan', async (req, res) => {
  const { _id, name, time, date, phone, address, email, description, user } = req.body

  try {
    const booking = await new Booking({
      _id: new mongoose.Types.ObjectId(),
      user,
      name,
      time,
      date,
      phone,
      address,
      email,
      description
    })

    await booking.save()

    res.status(201).json({
      message: "Artizan booked successfully",
      success: true,
      booking
    })
  } catch (error) {
    throw error
  }
})

module.exports = router