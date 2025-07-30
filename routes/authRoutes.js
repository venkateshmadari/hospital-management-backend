const express = require("express");
const patientAuthController = require("../controllers/patientAuthController");
const patientAuthMiddleware = require("../middleware/patientAuthMiddleware");

const authRouter = express.Router();

authRouter.post("/auth/register", patientAuthController.register);
authRouter.post("/auth/login", patientAuthController.login);
authRouter.post("/auth/forgot-password", patientAuthController.forgotPassword);
authRouter.post("/auth/verify-otp", patientAuthController.verifyOtp);
authRouter.post("/auth/reset-password", patientAuthController.resetPassword);

authRouter.get("/getUserData", patientAuthMiddleware, patientAuthController.getUserData);

module.exports = authRouter;
