const router = require("express").Router();
const totalAppointments = require("../../controllers/Doctor/totalAppointmentsController")
const checkPermission = require("../../middleware/checkPermission")

router.get("/", checkPermission("VIEW_TOTAL_APPOINTMENTS"), totalAppointments.getAllAppointments);
router.get("/stats", checkPermission("VIEW_TOTAL_APPOINTMENTS"), totalAppointments.allAppointmentStats);
router.delete("/", checkPermission("DELETE_TOTAL_APPOINTMENTS"), totalAppointments.deleteAppointments);

module.exports = router;
