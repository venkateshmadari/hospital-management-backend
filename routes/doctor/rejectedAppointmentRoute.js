const router = require("express").Router();
const RejectedAppointmentsController = require("../../controllers/Doctor/RejectedAppointmentsController");

router.get("/", RejectedAppointmentsController.rejectedAppointments);

module.exports = router;
