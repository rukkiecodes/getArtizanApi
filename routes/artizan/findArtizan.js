const router = require('express').Router()
const User = require('../../models/user')

router.post('/getArtizan', async (req, res) => {
  const { state, specialty } = req.body

  const _state = state?.toLowerCase()
  const _specialty = specialty?.toLowerCase()

  try {
    const users = await User.find({ $or: [{ state: _state }, { specialty: _specialty }] })

    return res.status(200).json({
      users
    })
  } catch (error) {
    throw error
  }
})

module.exports = router