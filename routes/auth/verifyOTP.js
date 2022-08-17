const router = require("express").Router()
const bcrypt = require("bcrypt")

const user = require("../../models/user")
const userOTPVerification = require("../../models/userOTPVerification")

router.post('/verifyOTP', async (req, res) => {
  try {
    let { userId, otp } = req.body
    if (!userId || !otp) {
      throw Error("Empty otp details are not allowd")
    } else {
      const userOTPVerificationRecords = await userOTPVerification.find({ userId })

      if (userOTPVerificationRecords.length <= 0) {
        // no records found
        throw new Error("Account reccord doesn't exist or has been verified already. Please Sign up or Signin")
      } else {
        const { expiresAt } = userOTPVerificationRecords[0]
        const hashedOTP = userOTPVerificationRecords[0].otp

        if (expiresAt < Date.now()) {
          await userOTPVerification.deleteMany({ userId })
          throw new Error("Code has expired. Please request again")
        } else {
          const valitOTP = await bcrypt.compare(otp, hashedOTP)

          if (!valitOTP) {
            throw new Error("Invalid code passed. Check your inbox")
          } else {
            await user.updateOne({ _id: userId }, { verified: true })
            await userOTPVerification.deleteMany({ userId })
            res.json({
              status: 'VERIFIED',
              message: 'User Email verified successfully.'
            })
          }
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message
    })
  }
})

module.exports = router