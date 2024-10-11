const nodemailer = require("nodemailer");
const router = require("express").Router();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "getartizan@gmail.com",
        pass: "toik phtn etlw fate",
    },
});

router.get("/sendMail", (req, res) => {
    transporter
        .sendMail({
            to: "rukkiecodes2@gmail.com",
            subject: "Toto",
            html: `<h1>hello</h1>`,
        })
        .then(() => {
            console.log("Email sent 1");

            return res.status(401).json({
                message: "Email sent 22",
            });
        }).catch(error => {
            console.log(error)

            return res.status(401).json({
                message: error,
            });
        })
});

module.exports = router;