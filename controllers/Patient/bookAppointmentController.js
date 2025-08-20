const prisma = require("../../utils/prisma");

const bookAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, startTime } = req.body;

    if (!patientId || !doctorId || !date || !startTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

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
    if (checkDoctor.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Doctor is not available for appointments" });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const checkAvability = await prisma.availability.findFirst({
      where: {
        doctorId: doctorId,
        day: dayOfWeek,
      },
    });

    if (!checkAvability) {
      return res.status(404).json({
        message: "Doctor is not available on this day",
      });
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        date: appointmentDate,
        startTime: startTime,
        status: {
          in: ["PENDING", "ACCEPTED"],
        },
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: "Time slot already booked. Please choose another time slot.",
      });
    }

    const createAppointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date,
        startTime,
      },
      include: {
        patient: {
          select: { name: true, email: true },
        },
        doctor: {
          select: { name: true, speciality: true },
        },
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
