const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const User = require("../../models/user")

const nodemailer = require('nodemailer')
const userOTPVerification = require("../../models/userOTPVerification")

let transporter = nodemailer.createTransport({
  host: process.env.PORT,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
})

router.post("/signup", async (req, res) => {
  const { name, email, phone, gender, state, lga, specialty, password } = req.body

  try {
    let user = await User.findOne({ email })

    if (user) {
      console.log("User exists")
      res.status(401).json({
        message: "Auth failed",
      })
    } else {
      bcrypt.hash(password, 12, async (err, hash) => {
        if (err) {
          res.status(401).json({
            message: "Auth failed",
          })
        } else {
          let newUser = {
            _id: new mongoose.Types.ObjectId(),
            name,
            email,
            phone,
            gender,
            state,
            lga,
            specialty,
            password: hash,
            verified: false
          }
          user = await User.create(newUser)
          // await sendOTPVerificationEmail(user, res)

          res.status(201).json({
            message: "Auth successful",
            user
          })
        }
      })
    }
  } catch (error) {
    console.error(error)
    res.status(401).json({
      message: "Auth failed",
    })
  }
})

// send otp verification email
// const sendOTPVerificationEmail = async ({ _id, email }, res) => {
//   try {
//     const otp = `${Math.floor(1000 + Math.random() * 9000)}`

//     const mailOptions = {
//       from: process.env.EMAIL,
//       to: email,
//       subject: 'Verify Your Email',
//       html: `
//       <p>Enter <b>${otp}</b> in the app to verify your email address and complete the signup</p>
//       <br/>
//       <p>This code <b>expires in 1 hour</b></p>
//       `
//     }

//     const hashOTP = await bcrypt.hash(otp, 12)

//     const newOTPVerification = await new userOTPVerification({
//       userId: _id,
//       otp: hashOTP,
//       createdAt: Date.now(),
//       expiresAt: Date.now() + 3600000
//     })

//     await newOTPVerification.save()
//     await transporter.sendMail(mailOptions)
//     res.json({
//       status: 'PENDING',
//       message: 'Verification otp email sent',
//       data: {
//         userId: _id,
//         email
//       }
//     })
//   } catch (error) {
//     res.json({
//       status: 'FAILED',
//       message: error.message
//     })
//   }
// }

module.exports = router