const prisma = require('../src/utils/prisma');

async function main() {
    console.log('Starting seeding process...');

    const uiCategories = [
        { name: 'Road', email: 'zakariaeelyaakoubi437@gmail.com', depName: 'Roads & infrastructure' },
        { name: 'Waste', email: 'mohamed.sabbahi21@gmail.com', depName: 'Sanitation & waste' },
        { name: 'Hazard', email: 'zakariae.elyaakoubi1@gmail.com', depName: 'Parks & Green spaces' },
        { name: 'Graffiti', email: 'hamzaair380@gmail.com', depName: 'Public safety' },
        { name: 'Lighting', email: 'hamzaair380@gmail.com', depName: 'Public safety' },
        { name: 'Water', email: 'simo87802@gmail.com', depName: 'Water & plumbing' }
    ];

    for (const cat of uiCategories) {
        // 1. Ensure the Department exists
        const department = await prisma.department.upsert({
            where: { email: cat.email },
            update: { name: cat.depName }, // Force update the name just in case
            create: { name: cat.depName, email: cat.email }
        });

        // 2. Check for the Category
        const existingCategory = await prisma.category.findFirst({
            where: { name: cat.name }
        });

        if (!existingCategory) {
            // Create it if it's missing
            await prisma.category.create({
                data: { name: cat.name, departmentId: department.id }
            });
            console.log(`Created category: ${cat.name}`);
        } else {
            // SELF-HEALING: If it exists, force it to connect to the right department!
            await prisma.category.update({
                where: { id: existingCategory.id },
                data: { departmentId: department.id }
            });
            console.log(`Verified/Fixed category: ${cat.name} -> ${department.name}`);
        }
    }
    console.log('Seeding process completed.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });