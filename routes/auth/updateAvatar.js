const router = require("express").Router()
const fs = require("fs")
const cloudinary = require("../../middleware/cloud")
const upload = require("../../middleware/multer")
const checkAuth = require("../../middleware/auth")

const User = require("../../models/user")

router.post("/avatar", upload.single("avatar"), checkAuth, async (req, res) => {
  const { email } = req.body

  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: process.env.CLOUDINARY_FOLDER,
    })

    let user
    user = await User.updateOne({ email }, { $set: { avatar: result.secure_url } })

    res.status(200).json({
      message: "Avatar updated",
      success: true,
      user,
      result,
    })
  } catch (err) {
    console.log(err)
  }
})

module.exports = router