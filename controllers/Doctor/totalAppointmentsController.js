const prisma = require("../../utils/prisma");

const getAllAppointments = async (req, res, next) => {
  try {
    const { role } = req.doctors;
    const { status, speciality, search, page = 1, limit = 20 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    if (role === "DOCTOR") {
      return res.status(401).json({
        message: "Your are unauthorized"
      })
    }

    let where = {};

    if (search) {
      where.OR = [
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
      where.doctor = {
        speciality: {
          equals: speciality,
        },
      };
    }
    if (status) {
      if (["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"].includes(status.toUpperCase())) {
        where.status = status.toUpperCase();
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid status value: ${status}.`,
        });
      }
    }

    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: { id: true, email: true, name: true, phoneNumber: true, image: true }
          },
          doctor: {
            select: { id: true, name: true, email: true, speciality: true, image: true },
          },
        },
        skip,
        take: limitNumber,
        orderBy: { date: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]);

    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment,
      doctor: {
        ...appointment.doctor,
        image: appointment.doctor?.image
          ? `${req.protocol}://${req.get("host")}${appointment.doctor.image.replace(/\\/g, "/")}`
          : null,
      },
      patient: {
        ...appointment.patient,
        image: appointment.patient?.image
          ? `${req.protocol}://${req.get("host")}${appointment.patient.image.replace(/\\/g, "/")}`
          : null,
      },
    }));

    const totalPages = Math.ceil(totalCount / limitNumber);

    return res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
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

const allAppointmentStats = async (req, res, next) => {
  try {
    const { role } = req.doctors;

    if (role === "DOCTOR") {
      return res.status(401).json({
        message: "Your are unauthorized"
      })
    }

    const [
      totalAppointments,
      pendingAppointments,
      acceptedAppointments,
      rejectedAppointments,
      completedAppointments,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { status: "ACCEPTED" } }),
      prisma.appointment.count({ where: { status: "REJECTED" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
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

const deleteAppointments = async (req, res, next) => {
  try {
    const { role } = req.doctors;
    const { appointmentsId } = req.body;

    if (!appointmentsId || !Array.isArray(appointmentsId) || appointmentsId.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Appointments are not in an array"
      });
    }

    if (role === "DOCTOR") {
      return res.status(403).json({
        success: false,
        message: "Doctors are not allowed to delete appointments"
      });
    }

    const [deleteResult] = await prisma.$transaction([
      prisma.appointment.deleteMany({
        where: {
          id: {
            in: appointmentsId
          }
        }
      })
    ]);

    if (deleteResult.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointments not found or already deleted"
      });
    }

    return res.status(200).json({
      success: true,
      message: `${deleteResult.count} appointment(s) deleted successfully`
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllAppointments,
  allAppointmentStats,
  deleteAppointments
};
