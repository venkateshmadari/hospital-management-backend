const prisma = require("../../utils/prisma");

const rejectedAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, search, speciality } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause = {
      status: "REJECTED",
    };

    if (search) {
      whereClause.OR = [
        { patient: { name: { contains: search } } },
        { patient: { email: { contains: search } } },
        { doctor: { name: { contains: search } } },
        { doctor: { email: { contains: search } } },
        {
          doctor: {
            speciality: { contains: search },
          },
        },
      ];
    }
    if (speciality) {
      whereClause.doctor = {
        speciality: {
          equals: speciality,
        },
      };
    }

    const [rejectedData, totalCount] = await Promise.all([
      await prisma.appointment.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              name: true,
              phoneNumber: true,
              image: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              speciality: true,
              image: true,
            },
          },
        },
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: "desc",
        },
      }),
      await prisma.appointment.count({ where: whereClause }),
    ]);

    const formattedAppointments = rejectedData.map((appointment) => ({
      ...appointment,
      doctor: {
        ...appointment.doctor,
        image: appointment.doctor?.image
          ? `${req.protocol}://${req.get(
              "host"
            )}${appointment.doctor.image.replace(/\\/g, "/")}`
          : null,
      },
      patient: {
        ...appointment.patient,
        image: appointment.patient?.image
          ? `${req.protocol}://${req.get(
              "host"
            )}${appointment.patient.image.replace(/\\/g, "/")}`
          : null,
      },
    }));

    const totalPages = Math.ceil(totalCount / limitNumber);

    return res.status(200).json({
      success: true,
      message: "Rejected appointments retrieved successfully",
      data: formattedAppointments,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalCount,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
        limit: limitNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

const reAssignAppointments = async (req, res, next) => {
  try {
    const { id } = req.doctors;
    const { oldDoctorId, newDoctorId } = req.body;
    // const reassignAppointment = await prisma.appointment.update({
    //   where: { id: appointmentId },
    //   data: {
    //     doctorId: newDoctorId, // assign to new doctor
    //     status: "REASSIGNED", // mark globally as reassigned
    //     reassignmentHistory: {
    //       create: {
    //         fromDoctorId: oldDoctorId,
    //         toDoctorId: newDoctorId,
    //         reassignedBy: adminId,
    //       },
    //     },
    //   },
    //   include: {
    //     patient: true,
    //     doctor: true,
    //     reassignmentHistory: true,
    //   },
    // });
  } catch (error) {
    next(error);
  }
};

module.exports = { rejectedAppointments };
