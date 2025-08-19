const prisma = require("../../utils/prisma");

const bookAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, startTime } = req.body;

    const checkPatient = await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

    if (!checkPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const checkDoctor = await prisma.doctors.findUnique({
      where: {
        id: doctorId,
      },
    });
    if (!checkDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const createAppointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date,
        startTime,
      },
    });
    return res.status(201).json({
      message: "Appointment booked successfully, waiting for doctor approval",
      data: createAppointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
};
