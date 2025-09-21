const router = require("express").Router();
const appointments = require("../../controllers/Doctor/doctorAppointmentsControllers");
const checkPermission = require("../../middleware/checkPermission")

router.get("/", checkPermission("VIEW_APPOINTMENTS"), appointments.getDoctorAppointments);
router.get("/stats", checkPermission("VIEW_APPOINTMENTS"), appointments.getDoctorAppointmentStats);
router.put("/status/:id", checkPermission("EDIT_APPOINTMENTS"), appointments.updateAppointmentStatus);
router.delete("/", checkPermission("DELETE_APPOINTMENTS"), appointments.deleteAppointments);

module.exports = router;
