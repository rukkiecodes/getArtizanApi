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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRETE,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
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
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your login</title>
      <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
    </head>
    
    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
      <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
          <tr>
            <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
              <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                  <tr>
                    <td style="padding: 40px 0px 0px;">
                      <div style="text-align: left;">
                        <div style="padding-bottom: 20px;"><img src="https://www.getartizan.com/metrofinancetrading/logo.png" alt="Company" style="width: 100px;"></div>
                      </div>
                      <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                        <div style="color: rgb(48, 48, 48); text-align: right;">
                          <h1 style="margin: 1rem 0">Verification code</h1>
                          <p style="padding-bottom: 16px">Please use the verification code below to sign in.</p>
                          <p style="padding-bottom: 16px">This code expires In <strong>1 hour</strong> </p>
                          <p style="padding-bottom: 16px"><strong style="font-size: 130%">${otp}</strong></p>
                          <p style="padding-bottom: 16px">If you didn’t request this, you can ignore this email.</p>
                          <p style="padding-bottom: 16px">Thanks,<br>The GetArtizan team</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
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