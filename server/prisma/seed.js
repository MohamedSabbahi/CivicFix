const prisma = require('../src/utils/prisma');


async function main() {
    console.log('Starting seeding process...');

    const uiCategories = [
        { name: 'Road', email: 'zakariaeelyaakoubi437@gmail.com', depName: 'Roads & infrastructure' },
        { name: 'Waste', email: 'mohamed.sabbahi21@gmail.com', depName: 'Sanitation & waste' },
        { name: 'Hazard', email: 'zakariae.elyaakoubi1@gmail.com', depName: 'Parks & Green spaces' },
        { name: 'Graffiti', email: 'hamzaair380@gmail.com', depName: 'Public safety' },
        { name: 'Lighting', email: 'hamzaair380@gmail.com', depName: 'Public safety' }
    ];

    for (const cat of uiCategories) {
        const department = await prisma.department.upsert({
            where: { email: cat.email },
            update: {},
            create: { name: cat.depName, email: cat.email }
        });

        // Ensure we don't duplicate
        const existingCategory = await prisma.category.findFirst({
            where: { name: cat.name }
        });

        if (!existingCategory) {
            await prisma.category.create({
                data: { name: cat.name, departmentId: department.id }
            });
            console.log(`Created category: ${cat.name}`);
        }
    }
    console.log('Seeding process completed.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });