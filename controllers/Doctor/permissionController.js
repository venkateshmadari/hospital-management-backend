const prisma = require("../../utils/prisma");

const giveDoctorPermissions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        const doctor = await prisma.doctors.findUnique({
            where: { id },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }

        // Find valid permissions
        const foundPermissions = await prisma.permissions.findMany({
            where: {
                name: { in: permissions },
            },
        });

        if (foundPermissions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid permissions found",
            });
        }

        await prisma.doctorPermissions.deleteMany({
            where: { doctorId: id },
        });

        const newPerms = await Promise.all(
            foundPermissions.map((perm) =>
                prisma.doctorPermissions.create({
                    data: {
                        doctorId: id,
                        permissionId: perm.id,
                    },
                })
            )
        );

        res.status(200).json({
            success: true,
            message: "Permissions updated successfully",
            data: newPerms,
        });
    } catch (error) {
        next(error);
    }
};


const getAllPermissions = async (req, res, next) => {
    try {
        const permissions = await prisma.permissions.findMany()
        return res.status(200).json({
            success: true,
            message: "Fetched all permissions",
            data: permissions,
        });
    } catch (error) {
        next(error)
    }
}

module.exports = {
    giveDoctorPermissions,
    getAllPermissions
}