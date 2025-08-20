const express = require("express");
const doctorAuthentication = require("./doctorAuthRoutes");
const doctorRouter = require("./doctorRoutes");
const patientRouter = require("./patientRoutes");
const appointmentRouter = require("./dotorAppointmentRoute");
const doctorAuthMiddleWare = require("../../middleware/doctorAuthMiddleWare");

const rootRouter = express.Router();

rootRouter.use("/auth", doctorAuthentication);
rootRouter.use("/appointments", doctorAuthMiddleWare, appointmentRouter);
rootRouter.use("/doctors", doctorAuthMiddleWare, doctorRouter);
rootRouter.use("/patients", doctorAuthMiddleWare, patientRouter);

module.exports = rootRouter;
