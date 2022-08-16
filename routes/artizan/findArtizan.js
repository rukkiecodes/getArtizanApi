const router = require('express').Router()
const User = require('../../models/user')

router.post('/getArtizan', async (req, res) => {
  const { state, specialty } = req.body

  try {
    const users = await User.find({ $and: [{ state }, { specialty }] })

    return res.status(200).json({ users })
  } catch (error) {
    throw error
  }
})

module.exports = router