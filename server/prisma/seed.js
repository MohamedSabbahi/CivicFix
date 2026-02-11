const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
    console.log('Starting seeding process...');

    const hiereachies =[
        {
            name: 'Roads & infrastructure',
            email: 'zakariaeelyaakoubi437@gmail.com',
            categories: [
                'Potholes',
                'Damaged sidewalks',
                'Street lighting issues',
                'Road Blockages',
                'Faded road markings',
                'Other Road Issues'
            ]
        },
        {
            name: 'Sanitation & waste',
            email: 'mohamed.sabbahi21@gmail.com',
            categories: [
                'Overflowing garbage bins',
                'Illegal dumping',
                'Dead animal',
                'Dog Fouling',
                'Unwashed streets',
                'Other Sanitation Issues'
            ]
        },
        {
            name: 'Public safety',
            email: 'hamzaair380@gmail.com',
            categories: [
                'Broken traffic lights',
                'Vandalism',
                'Graffiti',
                'Abandoned vehicles',
                'Exposed electrical wires',
                'Other Public Safety Issues'
            ]
        },
        {
            name: 'Parks & Green spaces',
            email: 'zakariae.elyaakoubi1@gmail.com',
            categories: [
                'Fallen trees',
                'Damaged park equipment',
                'Pest infestations',
                'Overgrown vegetation',
                'Littering in parks',
                'Other Park Issues'
            ]
        }
    ];
    for (const depData of hiereachies){
        const department = await prisma.department.upsert({
            where:{ email: depData.email },
            update: {},
            create:{
                name: depData.name,
                email: depData.email
            }
        });
        console.log(`Upserted department: ${department.name}`);

        for (const catName of depData.categories){
            const existingCategory = await prisma.category.findFirst({
                where: { name: catName, departmentId: department.id }
            });
            if (!existingCategory){
                const category = await prisma.category.create({
                    data:{
                        name: catName,
                        departmentId: department.id
                    }
                });
                console.log(`  Created category: ${category.name}`);
            }
        }
    }
    console.log('Seeding process completed.');
}
main()
    .catch((e)=>{
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async()=>{
        await prisma.$disconnect();
    });