const router = require("express").Router();
const RejectedAppointmentsController = require("../../controllers/Doctor/RejectedAppointmentsController");
const doctorData = require("../../controllers/Patient/doctorsWithSpeciality");
const checkPermission = require("../../middleware/checkPermission")

router.get("/", checkPermission("VIEW_REJECTED_APPOINTMENTS"), RejectedAppointmentsController.rejectedAppointments);
router.post("/reassign", checkPermission("REASSIGN_REJECTED_APPOINTMENTS"), RejectedAppointmentsController.reAssignAppointments);

router.get("/speciality", doctorData.getDoctorsWithSpeciality);
router.get("/timeslot/:id", doctorData.doctorsTimeSlots);

module.exports = router;
