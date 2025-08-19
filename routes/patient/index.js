const router = require("express").Router();
const patientRoute = require("./authRoutes");
const patientProfileRoute = require("./patientRoute");
const bookingDataRoute = require("./bookingDataRoute");

router.use("/auth", patientRoute);
router.use("/profile", patientProfileRoute);
router.use("/data", bookingDataRoute);

module.exports = router;
