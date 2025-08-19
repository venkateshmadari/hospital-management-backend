const router = require("express").Router();
const doctorData = require("../../controllers/Patient/doctorsWithSpeciality");
const bookAppointmentData = require("../../controllers/Patient/bookAppointmentController");

router.get("/speciality", doctorData.getDoctorsWithSpeciality);
router.get("/timeslot/:id", doctorData.doctorsTimeSlots);
router.post("/book-appointment", bookAppointmentData.bookAppointment);

module.exports = router;
