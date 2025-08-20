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
      include: {
        Avability: true,
        Appointment: {
          where: {
            status: {
              in: ["PENDING", "ACCEPTED"],
            },
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });

    if (!checkDoctor) {
      return res.status(404).json({ message: "No doctor found" });
    }

    const currentDate = new Date();

    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      next7Days.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleString("en-IN", { weekday: "long" }),
        fullDate: date,
      });
    }

    const availabilityByDay = {};
    checkDoctor.Avability.forEach((availability) => {
      availabilityByDay[availability.day] = availability;
    });

    const bookedSlotsByDate = {};
    checkDoctor.Appointment.forEach((appointment) => {
      const dateKey = appointment.date.toISOString().split("T")[0];
      if (!bookedSlotsByDate[dateKey]) {
        bookedSlotsByDate[dateKey] = new Set();
      }
      bookedSlotsByDate[dateKey].add(appointment.startTime);
    });

    let allSlots = [];
    next7Days.forEach((dayInfo) => {
      const availability = availabilityByDay[dayInfo.day];

      if (availability) {
        const { startTime, endTime, breakStartTime, breakEndTime } =
          availability;
        const slots = generateSlots(
          startTime,
          endTime,
          breakStartTime,
          breakEndTime
        );

        const enhancedSlots = slots.map((slot) => {
          const isBooked = bookedSlotsByDate[dayInfo.date]?.has(slot) || false;
          return {
            time: slot,
            available: !isBooked,
          };
        });

        allSlots.push({
          date: dayInfo.date,
          day: dayInfo.day,
          slots: enhancedSlots,
        });
      } else {
        allSlots.push({
          date: dayInfo.date,
          day: dayInfo.day,
          slots: [],
        });
      }
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
