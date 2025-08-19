const prisma = require("../../utils/prisma");
const { generateSlots } = require("../../utils/timeUtils");

const getDoctorsWithSpeciality = async (req, res, next) => {
  try {
    const { speciality } = req.query;
    const requiredDoctors = await prisma.doctors.findMany({
      where: {
        speciality: speciality,
        status: "ACTIVE",
      },
    });

    return res.status(200).json({
      message: "Dcotors retreived successfully",
      data: requiredDoctors,
    });
  } catch (error) {
    next(error);
  }
};

const doctorsTimeSlots = async (req, res, next) => {
  try {
    const id = req.params.id;
    const checkDoctor = await prisma.doctors.findUnique({
      where: { id },
      include: { Avability: true },
    });

    if (!checkDoctor) {
      return res.status(404).json({ message: "No doctor found" });
    }
    let allSlots = [];

    checkDoctor.Avability.forEach((availability) => {
      const { startTime, endTime, breakStartTime, breakEndTime, day } =
        availability;

      const slots = generateSlots(
        startTime,
        endTime,
        breakStartTime,
        breakEndTime
      );

      allSlots.push({
        day,
        slots,
      });
    });

    return res.json({
      doctorId: id,
      name: checkDoctor.name,
      slots: allSlots,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorsWithSpeciality,
  doctorsTimeSlots,
};
