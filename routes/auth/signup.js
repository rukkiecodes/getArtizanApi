const router = require("express").Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../../models/user");
const userOTPVerification = require("../../models/userOTPVerification");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRETE,
    process.env.GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.email,
        pass: process.env.APP_PASSWORD,
    },
});

router.post("/signup", async(req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            res.status(401).json({
                message: "Auth failed",
            });
        } else {
            let _id = new mongoose.Types.ObjectId();

            let newUser = {
                _id,
                email,
                verified: false,
            };
            user = await User.create(newUser);

            // send mail
            const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

            const hashOTP = await bcrypt.hash(otp, 12);

            const newOTPVerification = await new userOTPVerification({
                userId: _id,
                otp: hashOTP,
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,
            });

            await newOTPVerification.save();

            transporter
                .sendMail({
                    to: email,
                    subject: "GetArtizan",
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>OTP Verification</title>
                            <style>
                                body {
                                    width: 100%;
                                    font-family: Arial, sans-serif;
                                    background-color: #f6f6f6;
                                    margin: 0;
                                    padding: 20px;
                                }
                                .container {
                                    background-color: #ffffff;
                                    padding: 20px;
                                    border-radius: 5px;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                    width: 100%;
                                    max-width: 600px;
                                    margin: 0 auto;
                                }
                                .logo {
                                    text-align: center;
                                    margin-bottom: 20px;
                                }
                                .logo img {
                                    width: 42px;
                                    height: 42px;
                                }
                                .banner img {
                                    width: 100%;
                                    height: auto;
                                }
                                .content h2 {
                                    font-size: 20px;
                                    margin: 20px 0;
                                }
                                .content p {
                                    font-size: 14px;
                                    color: #333;
                                }
                                .otp {
                                    display: block;
                                    text-align: center;
                                    font-size: 24px;
                                    font-weight: bold;
                                    margin: 20px 0;
                                }
                                .footer {
                                    text-align: center;
                                    font-size: 12px;
                                    color: #888;
                                    margin-top: 20px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="logo">
                                    <img src="https://res.cloudinary.com/rukkiecodes/image/upload/v1721646706/Group_248_s5d6vu.png" alt="GetArtisan Logo">
                                </div>
                                <div class="content">
                                    <h2>Hi ${email},</h2>
                                    <p>Here is your One Time Password (OTP).</p>
                                    <p>Please enter this code to verify your email address for GetArtisan</p>
                                    <div class="otp">${otp}</div>
                                    <p>OTP will expire in 5 minutes.</p>
                                    <p>Best Regards,</p>
                                    <p>GetArtisan team.</p>
                                </div>
                                <div class="footer">
                                    <p>© 2024 GetArtizan. All rights reserved.</p>
                                    <p>You are receiving this mail because you registered to join the GetArtisan platform as a user or an Artisan. This also shows that you agree to our Terms of use and Privacy Policies. If you no longer want to receive mails from us, click the unsubscribe link below to unsubscribe.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                })
                .then(() => {
                    console.log("Email sent");

                    return res.status(200).json({
                        message: "Authentication was successful",
                        user,
                    });
                })
                .catch((error) => {
                    console.log(error);

                    return res.status(500).json({
                        message: error.message,
                    });
                });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Auth failed",
        });
    }
});

module.exports = router;