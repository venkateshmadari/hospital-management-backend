const bcrypt = require("bcrypt");
const prisma = require('../utils/prisma');

async function main() {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await prisma.doctors.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
            designation: 'System Admin',
        },
    });

    console.log('✅ Admin user seeded successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding admin user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
