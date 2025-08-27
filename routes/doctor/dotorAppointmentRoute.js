const router = require("express").Router();
const appointments = require("../../controllers/Doctor/doctorAppointmentsControllers");

router.get("/", appointments.getDoctorAppointments);
router.get("/stats", appointments.getDoctorAppointmentStats);
router.put("/status/:id", appointments.updateAppointmentStatus);
router.delete("/", appointments.deleteAppointments)

module.exports = router;
