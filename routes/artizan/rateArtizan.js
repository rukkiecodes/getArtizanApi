const router = require("express").Router()
const checkAuth = require("../../middleware/auth")
const User = require('../../models/user')

router.post("/rating", async (req, res) => {
  const { _id, rating } = req.body

  try {
    let user = await User.updateOne({ _id }, { $set: { rating } })
    return res.status(200).json({
      message: "User rated successfull",
      success: true,
      user
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