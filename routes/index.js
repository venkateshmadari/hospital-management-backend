const express = require("express");
const authRouter = require("./authRoutes");
const userRouter = require("./userRoutes");
const doctorRouter = require("./doctorRoutes");
const authMiddleware = require("../middleware/authMiddleware");

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/doctors", authMiddleware, doctorRouter);

module.exports = rootRouter;
