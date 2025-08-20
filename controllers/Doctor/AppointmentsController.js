const prisma = require("../../utils/prisma");

const getAllAppointments = async (req, res, next) => {
  try {
    const { role, id } = req.doctors;
    const { status, speciality, search, page = 1, limit = 20 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let where = {};

    if (role === "DOCTOR") {
      where.doctorId = id;
    }

    if (search) {
      where.OR = [
        { patient: { name: { contains: search } } },
        { patient: { email: { contains: search } } },
        ...(role === "ADMIN"
          ? [
              { doctor: { name: { contains: search } } },
              { doctor: { email: { contains: search } } },
              {
                doctor: {
                  speciality: { contains: search },
                },
              },
            ]
          : []),
      ];
    }

    if (status) {
      where.status = status;
    }
    if (role === "ADMIN" && speciality) {
      where.doctor = {
        speciality: {
          equals: speciality,
        },
      };
    }

    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { id: true, email: true, name: true } },
          doctor: {
            select: { id: true, name: true, email: true, speciality: true },
          },
        },
        skip,
        take: limitNumber,
        orderBy: { date: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNumber);

    return res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments,
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

const appointmentStats = async (req, res, error) => {
  try {
    const { role, id } = req.doctors;
    const where = {};

    if (role === "DOCTOR") {
      where.doctorId = id;
    }
    const [
      totalAppointments,
      pendingAppointments,
      acceptedAppointments,
      rejectedAppointments,
      completedAppointments,
    ] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.count({ where: { ...where, status: "PENDING" } }),
      prisma.appointment.count({ where: { ...where, status: "ACCEPTED" } }),
      prisma.appointment.count({ where: { ...where, status: "REJECTED" } }),
      prisma.appointment.count({ where: { ...where, status: "COMPLETED" } }),
    ]);

    return res.status(200).json({
      message: "Appointment stats retreived successfully",
      data: {
        totalAppointments,
        pendingAppointments,
        acceptedAppointments,
        rejectedAppointments,
        completedAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAppointments,
  appointmentStats,
};
