const express = require("express");
const doctorAuthentication = require("./doctorAuthRoutes")
const userRouter = require("./userRoutes");
const doctorRouter = require("./doctorRoutes");
const authMiddleware = require("../middleware/authMiddleware");

const rootRouter = express.Router();

rootRouter.use("/auth", doctorAuthentication);
rootRouter.use("/users", authMiddleware, userRouter);
rootRouter.use("/doctors", authMiddleware, doctorRouter);

module.exports = rootRouter;
