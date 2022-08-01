const router = require('express').Router()
const User = require('../../models/user')

router.post('/getArtizan', async (req, res) => {
  const { name, email, phone, gender, state, lga, specialty } = req.body

  try {
    const users = await User.find({ $or: [{ email }, { name }, { phone }, { gender }, { state }, { lga }, { specialty }] })

    return res.status(200).json({
      users
    })
  } catch (error) {
    throw error
  }
})

module.exports = router