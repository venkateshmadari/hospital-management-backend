const express = require("express");
const doctorAuthentication = require("./doctorAuthRoutes");
const doctorRouter = require("./doctorRoutes");
const patientRouter = require("./patientRoutes");
const doctorAuthMiddleWare = require("../../middleware/doctorAuthMiddleWare");

const rootRouter = express.Router();

rootRouter.use("/auth", doctorAuthentication);
rootRouter.use("/doctors", doctorAuthMiddleWare, doctorRouter);
rootRouter.use("/patients", doctorAuthMiddleWare, patientRouter);

module.exports = rootRouter;
