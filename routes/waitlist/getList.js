const router = require("express").Router()
const Waitlist = require("../../models/waitlist")

router.get("/list", async (req, res) => {
  try {
    let user = await Waitlist.find()
    if (user) {
      return res.status(200).json({
        message: "Email found",
        user,
      })
    } else {
      return res.status(401).json({
        message: "Auth failed",
      })
    }
  } catch (error) {
    return res.status(401).json({
      message: "Auth failed",
    })
  }
})

module.exports = router