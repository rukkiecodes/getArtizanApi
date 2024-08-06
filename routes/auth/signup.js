const router = require("express").Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../../models/user");
const userOTPVerification = require("../../models/userOTPVerification");
const nodemailer = require("nodemailer");

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
                subject: "GetArtizan OTP Verification",
                html: `
                        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>


    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        body {
            width: 600px;
            margin: auto;
        }
        
        .logoContainer {
            padding-top: 3em;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 3em;
        }
        
        .banner {
            width: 100%;
        }
        
        .mainSection {
            margin-top: 3em;
        }
        
        .mainSection h2 {
            margin: 0;
            margin-bottom: 2em;
        }
        
        .mainSection p {
            margin-bottom: .5em;
            color: black;
            font-size: 1rem;
        }
        
        .otpContainer {
            margin: auto;
            width: 400px;
            display: flex;
            justify-content: space-around;
            margin-top: 3em;
        }
        
        .otpContainer p {
            font-size: 2rem;
            font-weight: 600;
            letter-spacing: 1em;
        }
        
        .socialsContainer {
            margin-top: 3em;
            border-top: 1px solid #00000033;
            border-bottom: 1px solid #00000033;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5em 0;
        }
    </style>
</head>

<body>
    <div class="logoContainer">
        <svg class="logo" width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="lettermark logo">
                <path id="Vector"
                    d="M41.9988 21.0473C41.8719 32.7673 32.4474 42.1228 20.8919 41.9988C9.20549 41.8747 -0.115874 32.4306 0.00108877 20.8346C0.120034 9.13036 9.58017 -0.122799 21.3062 0.00123243C32.7666 0.121327 42.1237 9.63634 41.9988 21.0473ZM15.6067 19.3502C14.5917 18.5548 13.2853 18.5607 12.2465 19.2419C9.62378 20.9626 9.46717 25.1757 11.9531 27.0717C13.0018 27.871 12.9959 27.8651 12.0562 28.7077C11.8144 28.9243 11.5963 29.1802 11.4179 29.4519C9.83788 31.8597 11.069 35.3719 13.8939 36.4429C16.7486 37.5258 19.7322 37.9136 22.7514 37.5789C26.6568 37.1478 29.7216 35.2558 31.6902 31.8183C33.3831 28.8632 32.9173 25.6108 30.5681 23.5692C29.2934 22.4628 27.7134 22.2777 26.1116 22.2639C22.7454 22.2384 19.3793 22.26 16.0131 22.2364C15.0596 22.2305 14.1001 22.2128 13.1664 21.9588C12.7739 21.8525 12.5439 21.6064 12.4448 21.2284C12.3318 20.7953 12.6133 20.5728 12.9166 20.3464C13.664 19.7892 14.5263 19.5057 15.6067 19.3502ZM20.1822 19.0529C22.2122 19.1435 24.3175 18.86 26.3059 17.7516C29.7573 15.8281 30.6097 11.4299 27.3486 8.74055C25.6596 7.34864 23.7367 6.59657 21.5778 6.41348C18.6835 6.16935 15.8863 6.44695 13.4816 8.27002C9.6892 11.1464 10.272 16.025 14.6016 18.0134C16.3244 18.8068 18.1482 18.9938 20.1822 19.0529Z"
                    fill="#320E64" />
                <path id="Vector_2"
                    d="M15.6066 19.3502C14.5262 19.5038 13.6639 19.7873 12.9145 20.3484C12.6132 20.5748 12.3297 20.7972 12.4427 21.2304C12.5418 21.6084 12.7718 21.8525 13.1643 21.9608C14.098 22.2147 15.0575 22.2325 16.0111 22.2384C19.3772 22.262 22.7434 22.2403 26.1095 22.2659C27.7113 22.2777 29.2913 22.4648 30.566 23.5712C32.9172 25.6108 33.3811 28.8652 31.6881 31.8203C29.7195 35.2578 26.6527 37.1497 22.7493 37.5809C19.7321 37.9136 16.7485 37.5258 13.8918 36.4449C11.0669 35.3739 9.8358 31.8616 11.4158 29.4539C11.5942 29.1822 11.8123 28.9262 12.0541 28.7097C12.9938 27.8651 12.9997 27.8729 11.951 27.0736C9.4631 25.1777 9.6217 20.9626 12.2444 19.2439C13.2852 18.5607 14.5916 18.5548 15.6066 19.3502ZM21.318 28.2057C21.318 28.2037 21.318 28.2017 21.318 28.1998C19.3356 28.1998 17.3551 28.2254 15.3727 28.186C14.7126 28.1722 14.3478 28.434 14.0485 28.9814C12.6786 31.4836 13.9473 34.4289 16.8417 35.3385C19.8609 36.2874 22.8465 35.9468 25.7923 34.9782C26.8747 34.6218 27.8541 34.0509 28.6094 33.2043C29.5966 32.0959 30.1874 30.767 29.6105 29.3141C29.0931 28.0127 27.7411 28.2706 26.6666 28.2273C24.8864 28.1505 23.1022 28.2057 21.318 28.2057Z"
                    fill="#FFC501" />
                <path id="Vector_3"
                    d="M20.1823 19.053C18.1483 18.9939 16.3245 18.8069 14.6017 18.0155C10.2701 16.027 9.68929 11.1504 13.4817 8.27209C15.8864 6.44902 18.6836 6.17143 21.5779 6.41555C23.7368 6.59668 25.6597 7.34875 27.3487 8.74263C30.6098 11.4319 29.7574 15.8302 26.306 17.7536C24.3176 18.8601 22.2123 19.1436 20.1823 19.053ZM22.4046 9.84119C21.5045 8.35478 19.1911 8.33903 18.0432 9.79788C16.719 11.4792 17.2641 15.0958 19.0265 16.3223C20.4241 17.2969 22.2836 16.5724 22.5869 14.9009C22.2579 14.9698 21.9427 15.0604 21.6235 15.0958C20.9197 15.1746 20.2655 15.086 20.0276 14.2886C19.8076 13.5484 20.1505 13.0247 20.7929 12.6585C21.2885 12.375 21.8217 12.2352 22.3887 12.1761C22.692 12.1446 23.1143 12.2076 23.1123 11.7135C23.1123 11.2685 23.255 10.7704 22.811 10.4358C22.5612 10.2487 22.2598 10.1995 21.9684 10.3354C21.6929 10.4633 21.7662 10.7055 21.8098 10.9339C21.9169 11.5087 21.7583 11.9261 21.0981 11.9596C20.7354 11.9773 20.4558 11.8001 20.3567 11.4339C20.2437 11.0067 20.4023 10.6799 20.7373 10.3944C21.2211 9.98688 21.8891 10.1404 22.4046 9.84119ZM23.1262 13.3239C23.1222 12.9085 23.1559 12.5246 22.5949 12.5581C21.9664 12.5955 21.6195 12.881 21.6453 13.5385C21.6631 13.9992 21.7523 14.4225 22.3332 14.4008C23.0607 14.3713 23.0925 13.8102 23.1262 13.3239Z"
                    fill="#FFC501" />
                <path id="Vector_4"
                    d="M21.3182 28.2055C23.1024 28.2055 24.8866 28.1504 26.6668 28.2252C27.7413 28.2705 29.0953 28.0106 29.6107 29.312C30.1876 30.7649 29.5968 32.0938 28.6096 33.2022C27.8563 34.0488 26.8769 34.6197 25.7926 34.9761C22.8467 35.9447 19.8611 36.2853 16.8419 35.3364C13.9476 34.4268 12.6788 31.4815 14.0487 28.9792C14.348 28.4319 14.7128 28.1701 15.3729 28.1839C17.3534 28.2232 19.3358 28.1976 21.3182 28.1976C21.3182 28.2016 21.3182 28.2036 21.3182 28.2055Z"
                    fill="#320E64" />
                <path id="Vector_5"
                    d="M22.4043 9.84108C21.8869 10.1423 21.2208 9.98676 20.7371 10.3963C20.4021 10.6798 20.2435 11.0085 20.3565 11.4358C20.4536 11.8039 20.7351 11.9811 21.0979 11.9614C21.76 11.928 21.9166 11.5106 21.8096 10.9357C21.768 10.7073 21.6926 10.4652 21.9682 10.3372C22.2616 10.2014 22.5629 10.2506 22.8107 10.4376C23.2548 10.7723 23.112 11.2704 23.112 11.7153C23.112 12.2095 22.6918 12.1465 22.3885 12.178C21.8215 12.2371 21.2882 12.3768 20.7926 12.6603C20.1503 13.0265 19.8073 13.5482 20.0274 14.2905C20.2633 15.0858 20.9195 15.1764 21.6232 15.0977C21.9444 15.0622 22.2576 14.9717 22.5867 14.9028C22.2854 16.5742 20.4259 17.2987 19.0263 16.3242C17.2639 15.0957 16.7187 11.4811 18.043 9.79973C19.1908 8.33891 21.5063 8.35466 22.4043 9.84108Z"
                    fill="#320E64" />
                <path id="Vector_6"
                    d="M23.126 13.3238C23.0923 13.8101 23.0606 14.3712 22.333 14.4007C21.7522 14.4243 21.663 14.001 21.6451 13.5384C21.6194 12.8789 21.9663 12.5934 22.5947 12.5579C23.1557 12.5245 23.122 12.9084 23.126 13.3238Z"
                    fill="#320E64" />
            </g>
        </svg>
    </div>



    <img class="banner" src="https://res.cloudinary.com/rukkiecodes/image/upload/v1721646706/Group_248_s5d6vu.png" alt="">


    <div class="mainSection">
        <h2>Hi ${email},</h2>
        <p>Here is your One Time Password (OTP).
        </p>
        <p>Please enter this code to verify your email address for GetArtisan</p>
    </div>


    <div class="otpContainer">
        <p>${otp}</p>
    </div>

    <p style="margin-top: 3em;">OTP will expire in 5 minutes.</p>
    <p style="margin-top: 3em; margin-bottom: .5em;">Best Regards,</p>
    <p>GetArtisan team.</p>

    <div class="socialsContainer">
        <img src="https://res.cloudinary.com/rukkiecodes/image/upload/v1721648059/Frame_145_jkv5ey.png" alt="">
    </div>

    <p style="margin-top: 3em; text-align: center;">© ${new Date().getFullYear()} GetArtizan. All rights reserved.</p>

    <p style="margin-top: 3em; text-align: center; margin-bottom: 3em;">You are receiving this mail because you registered to join the GetArtisan platform as a user or an Artisan. This also shows that you agree to our Terms of use and Privacy Policies. If you no longer want to receive mails from use, click the unsubscribe
        link below to unsubscribe.</p>
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Auth failed",
        });
    }
});

module.exports = router;