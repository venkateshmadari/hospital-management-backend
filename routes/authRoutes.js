const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const  authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/verify-otp", authController.verifyOtp);
authRouter.post("/reset-password", authController.resetPassword);

authRouter.get("/getUserData", authMiddleware, authController.getUserData);

module.exports = authRouter;
