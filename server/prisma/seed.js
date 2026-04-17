const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');


async function main() {
    console.log('Starting seeding process...');

  // ADMINS
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admins = [
    { name: 'Admin', email: 'admin@civicfix.com', password: adminPassword },
    { name: 'Super Admin', email: 'superadmin@civicfix.com', password: adminPassword },
    { name: 'Manager', email: 'manager@civicfix.com', password: adminPassword },
    ];

    for (const admin of admins) {
    const existingAdmin = await prisma.user.findUnique({
        where: { email: admin.email },
    });

    if (!existingAdmin) {
        await prisma.user.create({
        data: {
            name: admin.name,
            email: admin.email,
            password: admin.password,
            role: 'ADMIN',
        },
        });
        console.log(`Created admin: ${admin.email}`);
    } else {
        console.log(`Admin already exists: ${admin.email}`);
    }
    }

  // ui categories + departments

    const uiCategories = [

    { name: 'Road', email: 'outakubenomar37@gmail.com', depName: 'Roads & infrastructure' },
    { name: 'Waste', email: 'mohamed.sabbahi21@gmail.com', depName: 'Sanitation & waste' },
    { name: 'Hazard', email: 'zakariae.elyaakoubi1@gmail.com', depName: 'Parks & Green spaces' },
    { name: 'Graffiti', email: 'outakubenomar35@gmail.com', depName: 'Public safety' },
    { name: 'Lighting', email: 'hamzaair380@gmail.com', depName: 'Electrical maintenance' },
    ];

    for (const cat of uiCategories) {
    const department = await prisma.department.upsert({
        where: { email: cat.email },
        update: {
        name: cat.depName,
        },
        create: {
        name: cat.depName,
        email: cat.email,
        },
    });

    const existingCategory = await prisma.category.findFirst({
        where: { name: cat.name },
    });

    if (!existingCategory) {
        await prisma.category.create({
        data: {
            name: cat.name,
            departmentId: department.id,
        },
        });
        console.log(`Created category: ${cat.name}`);
    } else {
        await prisma.category.update({
        where: { id: existingCategory.id },
        data: { departmentId: department.id },
        });

        console.log(`Updated category: ${cat.name}`);

    }
    }

    console.log('Seeding process completed.');
}

main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
    })
    .finally(async () => {
    await prisma.$disconnect();
    });