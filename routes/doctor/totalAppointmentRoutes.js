const router = require("express").Router();
const totalAppointments = require("../../controllers/Doctor/totalAppointmentsController")

router.get("/", totalAppointments.getAllAppointments);
router.get("/stats", totalAppointments.allAppointmentStats);
router.delete("/", totalAppointments.deleteAppointments);

module.exports = router;
