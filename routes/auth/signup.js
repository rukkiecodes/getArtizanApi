const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const User = require("../../models/user")

const userOTPVerification = require("../../models/userOTPVerification")

const nodemailer = require('nodemailer')
const { google } = require('googleapis')

const { email, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRETE, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN } = process.env

const oAuth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRETE, GOOGLE_REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN })

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

          sendOTPVerificationEmail(user, res)

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
const sendOTPVerificationEmail = async ({ _id, email, name }, res) => {
  // try {
  const accessToken = await oAuth2Client.getAccessToken()
  console.log('check 1')

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.email,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRETE,
      refreshToken: GOOGLE_REFRESH_TOKEN,
      accessToken
    }
  })

  console.log('check 2')

  const otp = `${Math.floor(1000 + Math.random() * 9000)}`

  const mailOptions = {
    from: process.env.email,
    to: email,
    subject: 'Verify Your Email',
    html: `
    <html lang="en">

    <body style="width: 600px; max-width: 98%; margin: 20px auto;">
        <style>
            * {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
        </style>
        <nav style="background-color: #4169e1; padding: 1em; display: flex; justify-content: center; border-radius: 8px;">
            <span style="font-weight: 600; font-size: 1rem; color: #fff;">GETARTIZAN</span>
        </nav>

        <div style="margin-top: 2em;">
            <p style="width: 100%; margin-bottom: .5em; font-size: .8rem;"><span
                    style="font-weight: 600; margin-right: 50px;">Name</span><span>Terry Amagboro</span></p>
            <p style="width: 100%; margin-bottom: .5em; font-size: .8rem;"><span
                    style="font-weight: 600; margin-right: 50px;">Name</span><span>Terry Amagboro</span></p>
            <p style="width: 100%; margin-bottom: .5em; font-size: .8rem;"><span
                    style="font-weight: 600; margin-right: 50px;">Name</span><span>Terry Amagboro</span></p>
            <p style="width: 100%; margin-bottom: .5em; font-size: .8rem;"><span
                    style="font-weight: 600; margin-right: 50px;">Name</span><span>Terry Amagboro</span></p>
            <p style="width: 100%; margin-bottom: 2em; font-size: .8rem;"><span
                    style="font-weight: 600; margin-right: 50px;">Name</span><span>Terry Amagboro</span></p>
            <p style="width: 100%; margin-bottom: .5em;"><span style="font-weight: 600; margin-right: 50px;">One Time
                    password (OTP)</span><span style="font-size: 2em; font-weight: 600; letter-spacing: 2px;">${otp}</span></p>

            <p style="margin-top: 2em; font-size: .8rem;">This password <span style="font-weight: 700;">expires in 1
                    hour</span>. if you did not apply for a One Time Password please ignore this
                message. <br> This password will be used to verify your account</p>
        </div>
    </body>
    </html>`
  }

  console.log('check 3')

  const hashOTP = await bcrypt.hash(otp, 12)

  const newOTPVerification = await new userOTPVerification({
    userId: _id,
    otp: hashOTP,
    createdAt: Date.now(),
    expiresAt: Date.now() + 3600000
  })

  console.log('check 4')

  await newOTPVerification.save()
  await transporter.sendMail(mailOptions)

  console.log('Email sent')
}

module.exports = router