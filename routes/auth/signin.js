const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const User = require("../../models/user")

router.post("/signin", async (req, res) => {
  const { email, password } = req.body

  User.findOne({ email })
    .exec()
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed",
            })
          }
          if (result) {
            const token = jwt.sign(
              {
                email,
                userId: user._id,
              },
              process.env.SESSION_SECRET,
              {
                expiresIn: "1h",
              }
            )
            return res.status(200).json({
              message: "Auth successful",
              token,
              user
            })
          }
          return res.status(401).json({
            message: "Auth failed",
          })
        })
      } else {
        return res.status(401).json({
          message: "Auth failed",
        })
      }
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Auth failed",
      })
    })
})

module.exports = router