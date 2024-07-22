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
        user: "rukkiecodes@gmail.com",
        pass: "toik phtn etlw fate",
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
                    subject: "Toto",
                    html: `<h1>${otp}</h1>`,
                })
                .then(() => {
                    console.log("Email sent 1");

                    return res.status(401).json({
                        message: "Authentication was successful",
                        user,
                    });
                })
                .catch((error) => {
                    console.log(error);

                    return res.status(401).json({
                        message: error,
                    });
                });
        }
    } catch (error) {
        console.error(error);
        res.status(401).json({
            message: "Auth failed",
        });
    }
});

module.exports = router;