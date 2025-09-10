const express = require("express");
const router = express.Router();
const doctorAuthMiddleWare = require("../../middleware/doctorAuthMiddleWare");
const doctorAuthController = require("../../controllers/Doctor/doctorAuthController");

router.post("/register", doctorAuthController.doctorRegister);
router.post("/login", doctorAuthController.doctorLogin);
router.post("/forgot-password", doctorAuthController.doctorForgotPassword);
router.post("/verify-otp", doctorAuthController.doctorVerifyOtp);
router.post("/reset-password", doctorAuthController.doctorResetPassword);

router.get(
  "/getUserData",
  doctorAuthMiddleWare,
  doctorAuthController.doctorGetUserData
);
module.exports = router;
