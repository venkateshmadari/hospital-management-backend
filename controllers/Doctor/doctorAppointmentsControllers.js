const prisma = require("../../utils/prisma");

const getDoctorAppointments = async (req, res, next) => {
    try {
        const { role, id } = req.doctors;
        const { search, page = 1, limit = 20, status } = req.query
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const whereClause = {}
        // if (role === "ADMIN") {
        //     return res.status(401).json({
        //         message: "Your are unauthorized"
        //     })
        // }
        if (role === "DOCTOR") {
            whereClause.doctorId = id
        }

        if (search) {
            whereClause.OR = [
                { patient: { name: { contains: search } } },
                { patient: { name: { contains: search } } }
            ]
        }

        if (status) {
            whereClause.status = status
        }

        const [doctorAppointments, totalCount] = await Promise.all([
            await prisma.appointment.findMany({
                where: whereClause,
                include: {
                    patient: { select: { id: true, email: true, name: true, image: true, phoneNumber: true } },
                    ReassignedHistory: true
                },  
                skip,
                take: limitNumber,
                orderBy: { date: "desc" },
            }),
            await prisma.appointment.count({ where: whereClause })
        ])
        const formattedAppointments = doctorAppointments.map((appointment) => ({
            ...appointment,
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
        next(error)
    }
}


const getDoctorAppointmentStats = async (req, res, next) => {
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
            message: "Doctor appointment stats retreived successfully",
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

const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body
        const appointmentId = req.params.id;
        const allowedStatuses = ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"]
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values are: ${allowedStatuses.join(
                    ", "
                )}`,
            });
        }
        const findAppointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
        });

        if (!findAppointment) {
            return res.status(404).json({
                success: false,
                message: `Appointment not found with id of ${appointmentId}`,
            });
        }
        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status }
        })
        return res.status(200).json({
            success: true,
            data: updatedAppointment,
            message: "Appointment status updated successfully",
        });

    } catch (error) {
        next(error)
    }
}

const deleteAppointments = async (req, res, next) => {
    try {
        const { role, id } = req.doctors;
        const { appointmentsId } = req.body;

        if (!appointmentsId || !Array.isArray(appointmentsId) || appointmentsId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Appointments are not in an array"
            });
        }

        let whereClause = { id: { in: appointmentsId } };

        if (role === "DOCTOR") {
            whereClause.doctorId = id;
        }

        const [deleteResult] = await prisma.$transaction([
            prisma.appointment.deleteMany({
                where: whereClause,
            })
        ]);

        if (deleteResult.count === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete these appointments or they do not exist"
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
    getDoctorAppointments,
    getDoctorAppointmentStats,
    updateAppointmentStatus,
    deleteAppointments
}