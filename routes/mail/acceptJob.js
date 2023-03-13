const router = require("express").Router()

const User = require("../../models/user")


const nodemailer = require('nodemailer')
const { google } = require('googleapis')

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRETE, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN } = process.env

const oAuth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRETE, GOOGLE_REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN })

router.post("/acceptJob", async (req, res) => {
        const { name, email, phone, specialty, location } = req.body

        try {
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
                        subject: 'Task accepted 🎉🎉',
                        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      
      <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify your login</title>
      </head>
      
      <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
              <table role="presentation"
                      style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
                      <tbody>
                              <tr>
                                      <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
                                              <table role="presentation"
                                                      style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                                                      <tbody>
                                                              <tr>
                                                                      <td style="padding: 40px 0px 0px;">
                                                                              <div style="text-align: left;">
                                                                                      <div style="padding-bottom: 20px;"><img
                                                                                                      src="https://www.getartizan.com/metrofinancetrading/logo.png"
                                                                                                      alt="Company"
                                                                                                      style="width: 100px;">
                                                                                      </div>
                                                                              </div>
                                                                              <div
                                                                                      style="padding: 20px; background-color: rgb(255, 255, 255);">
                                                                                      <div
                                                                                              style="color: rgb(48, 48, 48); text-align: right;">
                                                                                              <h1 style="margin: 1rem 0">
                                                                                                      Job accepted</h1>
                                                                                              <p style="padding-bottom: 16px">
                                                                                                      An artizan as accepted
                                                                                                      your task.</p>
      
                                                                                              <div>      
                                                                                                      <div
                                                                                                              style="margin-bottom: .5em;">
                                                                                                              <span
                                                                                                                      style="margin-right: 40px; font-size: .8rem;">Artizan
                                                                                                                      Name:</span>
                                                                                                              <span style="font-size: .8rem;">${name}</span>
                                                                                                      </div>
                                                                                                      <div
                                                                                                              style="margin-bottom: .5em; font-size: .8rem;">
                                                                                                              <span
                                                                                                                      style="margin-right: 40px;">Artizan
                                                                                                                      Phone:</span>
                                                                                                              <a
                                                                                                                      href="tel:${phone}">${phone}</a>
                                                                                                      </div>
                                                                                                      <div
                                                                                                              style="margin-bottom: .5em; font-size: .8rem;">
                                                                                                              <span
                                                                                                                      style="margin-right: 40px;">Artizan
                                                                                                                      Location:</span>
                                                                                                              <span>${location}</span>
                                                                                                      </div>
                                                                                                      <div
                                                                                                              style="margin-bottom: .5em; font-size: .8rem;">
                                                                                                              <span
                                                                                                                      style="margin-right: 40px;">Artizan
                                                                                                                      Specialty:</span>
                                                                                                              <span>${specialty}</span>
                                                                                                      </div>
                                                                                              </div>
      
                                                                                              <p
                                                                                                      style="padding-bottom: 16px; margin-top: 2em;">
                                                                                                      Thank you for using
                                                                                                      GetArtizan. <br> Your
                                                                                                      Artizan
                                                                                                      will be in contact with
                                                                                                      you shortly.</p>
                                                                                              <p style="padding-bottom: 16px">
                                                                                                      Thanks,<br>The
                                                                                                      GetArtizan team</p>
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

                console.log('check 4')

                await transporter.sendMail(mailOptions)

                console.log('Email sent')

                res.status(200).json({
                        message: "Email sent",
                })
        } catch (error) {
                console.error(error)
                res.status(401).json({
                        message: "Auth failed",
                })
        }
})

module.exports = router
