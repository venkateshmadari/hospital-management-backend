const express = require("express")
const router = express.Router()
const doctorAuthController = require("../controllers/doctorAuthController")

router.post("/register", doctorAuthController.doctorRegister)

module.exports = router