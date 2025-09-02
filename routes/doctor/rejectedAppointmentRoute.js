const router = require("express").Router();
const RejectedAppointmentsController = require("../../controllers/Doctor/RejectedAppointmentsController");
const doctorData = require("../../controllers/Patient/doctorsWithSpeciality");

router.get("/", RejectedAppointmentsController.rejectedAppointments);
router.post("/reassign", RejectedAppointmentsController.reAssignAppointments);

router.get("/speciality", doctorData.getDoctorsWithSpeciality);
router.get("/timeslot/:id", doctorData.doctorsTimeSlots);

module.exports = router;
