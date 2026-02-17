const prisma = require('../utils/prisma');

const getDepartmentStats = async (req, res) => {
    try {
        // 1. Ask the Database for the final numbers directly
        const stats = await prisma.$queryRaw`
            SELECT 
                d.name as department,
                COUNT(r.id) as "resolvedReportsCount",
                AVG(EXTRACT(EPOCH FROM (r."resolvedAt" - r."createdAt")) / 3600) as "averageResolutionTime"
            FROM "Report" r
            JOIN "Category" c ON r."categoryId" = c.id
            JOIN "Department" d ON c."departmentId" = d.id
            WHERE r.status = 'RESOLVED'
            GROUP BY d.name;
        `;

        // 2. Format the numbers (BigInt to Number)
        const formattedStats = stats.map(stat => ({
            department: stat.department,
            resolvedReportsCount: Number(stat.resolvedReportsCount),
            averageResolutionTime: parseFloat(stat.averageResolutionTime).toFixed(2) + " hours",
            reportsDetail: [] // Kept empty for performance
        }));

        res.status(200).json(formattedStats);

    } catch (error) {
        console.error("Stats Calculation Error:", error);
        res.status(500).json({ 
            message: "Failed to calculate department statistics" 
        });
    }
};


const getOverviewStats = async (req, res) => {
    try {

        const statusCounts = await prisma.report.groupBy({
            by: ['status'],
            _count: true
        });

        const totalReports = statusCounts.reduce((sum, s) => sum + s._count, 0);
        const pendingReports = statusCounts.find(s => s.status === 'PENDING')?._count || 0;
        const inProgressReports = statusCounts.find(s => s.status === 'IN_PROGRESS')?._count || 0;
        const resolvedReports = statusCounts.find(s => s.status === 'RESOLVED')?._count || 0;


        const totalUsers = await prisma.user.count();
        const citizensCount = await prisma.user.count({ 
            where: { role: 'CITIZEN' } 
        });


        const resolvedWithTime = await prisma.report.findMany({
            where: {
                status: 'RESOLVED',
                resolvedAt: { not: null }
            },
            select: {
                createdAt: true,
                resolvedAt: true
            }
        });


        let overallAvgHours = 0;
        if (resolvedWithTime.length > 0) {
            const totalTime = resolvedWithTime.reduce((sum, r) => {
                return sum + (new Date(r.resolvedAt) - new Date(r.createdAt));
            }, 0);
            const avgMs = totalTime / resolvedWithTime.length;
            overallAvgHours = (avgMs / (1000 * 60 * 60)).toFixed(2);
        }

        const resolutionRate = totalReports > 0 
            ? ((resolvedReports / totalReports) * 100).toFixed(2) 
            : '0.00';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayReports = await prisma.report.count({
            where: {
                createdAt: { gte: today }
            }
        });

        res.status(200).json({
            status: 'success',
            data: {
                totalReports,
                totalUsers,
                citizensCount,
                pendingReports,
                inProgressReports,
                resolvedReports,
                todayReports,
                overallAverageTime: `${overallAvgHours} hours`,
                resolutionRate: `${resolutionRate}%`
            }
        });

    } catch (error) {
        console.error("Overview Stats Error:", error);
        res.status(500).json({ 
            status: 'error',
            message: "Erreur lors du calcul des statistiques" 
        });
    }
};

const addDepartment = async (req, res) => {
    try {
        const { name, email, categories } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Le nom et l'email sont obligatoires" });
        }

        const department = await prisma.department.upsert({
            where: { email: email },
            update: { name: name },
            create: {
                name: name,
                email: email
            }
        });

        if (categories && Array.isArray(categories)) {
            for (const catName of categories) {
                const existingCategory = await prisma.category.findFirst({
                    where: { 
                        name: catName, 
                        departmentId: department.id 
                    }
                });

                if (!existingCategory) {
                    await prisma.category.create({
                        data: {
                            name: catName,
                            departmentId: department.id
                        }
                    });
                }
            }
        }

        res.status(201).json({ 
            status: "success", 
            message: "Département configuré avec succès",
            data: department 
        });

    } catch (error) {
        console.error("Erreur addDepartment:", error);
        res.status(500).json({ error: "Erreur serveur lors de la configuration du département" });
    }
};

// --- 2. Supprimer un Département ---
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const deptId = parseInt(id);

        // ÉTAPE 1 : Supprimer tous les rapports liés aux catégories de ce département
        await prisma.report.deleteMany({
            where: {
                category: {
                    departmentId: deptId
                }
            }
        });

        // ÉTAPE 2 : Supprimer les catégories
        await prisma.category.deleteMany({
            where: { departmentId: deptId }
        });

        // ÉTAPE 3 : Supprimer le département
        await prisma.department.delete({
            where: { id: deptId }
        });

        res.status(200).json({ 
            status: "success", 
            message: "Department and all related data deleted successfully" 
        });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Server error during deletion. Ensure the ID is correct." });
    }
};

module.exports = { getDepartmentStats , getOverviewStats , addDepartment,
    deleteDepartment};