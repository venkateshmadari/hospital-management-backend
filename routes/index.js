const express = require("express");
const doctorAuthentication = require("./doctorAuthRoutes")
const patientRouter = require("./patientRoutes");
const doctorRouter = require("./doctorRoutes");
const authBothMiddleware = require("../middleware/doctorAuthMiddleWare")

const rootRouter = express.Router();

rootRouter.use("/auth", doctorAuthentication);
rootRouter.use("/patients", authBothMiddleware, patientRouter);
rootRouter.use("/doctors", authBothMiddleware, doctorRouter);

module.exports = rootRouter;
