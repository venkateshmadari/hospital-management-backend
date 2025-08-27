const router = require("express").Router();
const patientRoute = require("./authRoutes");
const patientProfileRoute = require("./patientRoute");
const bookingDataRoute = require("./bookingDataRoute");
const patientAuthMiddleware = require("../../middleware/patientAuthMiddleware")

router.use("/auth", patientRoute);
router.use("/profile", patientAuthMiddleware, patientProfileRoute);
router.use("/data", patientAuthMiddleware, bookingDataRoute);

module.exports = router;
