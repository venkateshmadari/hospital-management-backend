const prisma = require("../utils/prisma");

const checkPermission = (requiredPermission) => async (req, res, next) => {
    try {
        const doctorId = req.doctors?.id
        if (!doctorId) {
            return res.status(401).json({ message: "Unauthorized: Doctor not found" });
        }

        const checkDoctorPermission = await prisma.doctotPermissions.findFirst({
            where: {
                doctorId,
                permission: {
                    name: requiredPermission
                },
                include: { permission: true },
            }
        })

        if (!checkDoctorPermission) {
            return res.status(403).json({ message: "Forbidden: Permission denied" });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = checkPermission