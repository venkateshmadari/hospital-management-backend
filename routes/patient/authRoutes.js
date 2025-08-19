const express = require("express");
const patientAuthController = require("../../controllers/Patient/patientAuthController");
const patientAuthMiddleware = require("../../middleware/patientAuthMiddleware");

const authRouter = express.Router();

authRouter.post("/register", patientAuthController.register);
authRouter.post("/login", patientAuthController.login);
authRouter.post("/forgot-password", patientAuthController.forgotPassword);
authRouter.post("/verify-otp", patientAuthController.verifyOtp);
authRouter.post("/reset-password", patientAuthController.resetPassword);

authRouter.get(
  "/getUserData",
  patientAuthMiddleware,
  patientAuthController.getUserData
);

module.exports = authRouter;
