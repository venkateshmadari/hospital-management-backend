const bcrypt = require("bcrypt");
const prisma = require('../utils/prisma');
const { PERMISSIONS } = require('../data/Permissions')

async function main() {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = await prisma.doctors.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
            designation: 'System Admin',
            speciality: "owner"
        },
    });

    console.log('✅ Admin user seeded successfully.');

    for (const perm of PERMISSIONS) {
        await prisma.permissions.upsert({
            where: { name: perm.name },
            update: {},
            create: perm,
        })
    }
    console.log("✅ Permissions seeded successfully.");

    const allPermissions = await prisma.permissions.findMany()
    for (const perm of allPermissions) {
        await prisma.doctorPermissions.upsert({
            where: {
                doctorId_permissionId: {
                    doctorId: admin.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                doctorId: admin.id,
                permissionId: perm.id,
            }
        })
    }

    console.log("✅ Admin granted all permissions.");
    const defaultDoctorPerms = ["VIEW_PROFILE", "VIEW_APPOINTMENTS", "EDIT_APPOINTMENTS", "DELETE_APPOINTMENTS"];
    const doctorRoleUsers = await prisma.doctors.findMany({ where: { role: "DOCTOR" } });

    for (const doctor of doctorRoleUsers) {
        for (const permName of defaultDoctorPerms) {
            const perm = await prisma.permissions.findUnique({ where: { name: permName } });
            if (perm) {
                await prisma.doctorPermissions.upsert({
                    where: {
                        doctorId_permissionId: {
                            doctorId: doctor.id,
                            permissionId: perm.id,
                        },
                    },
                    update: {},
                    create: {
                        doctorId: doctor.id,
                        permissionId: perm.id,
                    },
                })
            }
        }
    }
    console.log("✅ Default doctor permissions assigned.");
}

main()
    .catch((e) => {
        console.error('❌ Error seeding admin user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
