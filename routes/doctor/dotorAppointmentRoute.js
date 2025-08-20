const router = require("express").Router();
const appointments = require("../../controllers/Doctor/AppointmentsController");

router.get("/", appointments.getAllAppointments);
router.get("/stats", appointments.appointmentStats);

module.exports = router;
