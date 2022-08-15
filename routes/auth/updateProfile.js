const router = require("express").Router()
const User = require("../../models/user")
const checkAuth = require("../../middleware/auth")

router.post("/updateProfile", checkAuth, async (req, res) => {
  const {
    email,
    name,
    phone,
    gender,
    state,
    lga,
    specialty
  } = req.body

  let _state = state.toLowerCase()
  let _specialty = specialty.toLowerCase()

  try {
    let user = await User.updateOne({ email }, {
      $set: {
        name,
        phone,
        gender,
        state: _state,
        lga,
        specialty: _specialty
      }
    })
    return res.status(200).json({
      message: "User found",
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