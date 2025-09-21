const prisma = require("../../utils/prisma")

const dashboardStatsCount = async (req, res, next) => {
    try {
        const doctorId = req.doctors?.id;
        const { role } = req.doctors
        if (!doctorId) {
            return res.status(401).json({ message: "Unauthorized: Doctor not found" });
        }
        const permissionsRaw = await prisma.doctorPermissions.findMany({
            where: { doctorId },
            include: { permission: true },
        });
        const permissionNames = permissionsRaw.map(p => p.permission.name);

        const data = {};

        if (role === "DOCTOR") {
            data.avabilityDays = await prisma.availability.count({
                where: { doctorId }
            })
            data.pendingDoctorAppointments = await prisma.appointment.count({
                where: {
                    doctorId,
                    status: "PENDING"
                }
            })
            data.pendingCompletedAppointments = await prisma.appointment.count({
                where: {
                    doctorId,
                    status: "COMPLETED"
                }
            })
        }

        if (permissionNames.includes("VIEW_DOCTORS")) {
            data.totalDoctors = await prisma.doctors.count();
        }
        if (permissionNames.includes("VIEW_PATIENTS")) {
            data.totalPatients = await prisma.patient.count();
        }
        if (permissionNames.includes("VIEW_APPOINTMENTS")) {
            data.totalDoctorAppointments = await prisma.appointment.count({
                where: { doctorId }
            });
        }
        if (permissionNames.includes("VIEW_TOTAL_APPOINTMENTS")) {
            data.totalAppointments = await prisma.appointment.count()
        }
        if (permissionNames.includes("VIEW_REJECTED_APPOINTMENTS")) {
            data.rejectedAppointments = await prisma.reassignedHistory.count()
        }

        return res.status(200).json({
            success: true,
            message: "Dashboard stats retrieved successfully",
            data
        })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    dashboardStatsCount
}