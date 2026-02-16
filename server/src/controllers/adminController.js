const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDepartmentStats = async (req, res) => {
    try {
        // 1. Récupérer uniquement les rapports résolus avec les infos de département
        const resolvedReports = await prisma.report.findMany({
            where: {
                status: 'RESOLVED',
                resolvedAt: { not: null } // Sécurité supplémentaire
            },
            include: {
                category: {
                    include: { department: true }
                }
            }
        });

        // 2. Organiser les données par département
        const statsMap = {};

        resolvedReports.forEach(report => {
            const deptName = report.category.department.name;
            const timeDiff = new Date(report.resolvedAt) - new Date(report.createdAt); // Résultat en millisecondes

            const durationInHours = (timeDiff / (1000 * 60 * 60)).toFixed(2);

            if (!statsMap[deptName]) {
                statsMap[deptName] = { totalTime: 0, count: 0, individualReports: []};
            }

            statsMap[deptName].totalTime += timeDiff;
            statsMap[deptName].count += 1;


            statsMap[deptName].individualReports.push({
                reportId: report.id,
                title: report.title,
                duration: `${durationInHours} hours`
            });
        });

        // 3. Calculer la moyenne pour chaque département
        const finalStats = Object.keys(statsMap).map(name => {
            const averageMs = statsMap[name].totalTime / statsMap[name].count;
            
            // Convertir les millisecondes en format lisible (ex: Heures)
            const averageHours = (averageMs / (1000 * 60 * 60)).toFixed(2);

            return {
                department: name,
                resolvedReportsCount: statsMap[name].count,
                averageResolutionTime: `${averageHours} hours`,
                reportsDetail: statsMap[name].individualReports
            };
        });

        res.status(200).json(finalStats);
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({
            message: "Erreur lors du calcul des statistiques" 
        });
    }
};


const getOverviewStats = async (req, res) => {
    try {
        // 1. عدد التقارير حسب الحالة
        const statusCounts = await prisma.report.groupBy({
            by: ['status'],
            _count: true
        });

        const totalReports = statusCounts.reduce((sum, s) => sum + s._count, 0);
        const pendingReports = statusCounts.find(s => s.status === 'PENDING')?._count || 0;
        const inProgressReports = statusCounts.find(s => s.status === 'IN_PROGRESS')?._count || 0;
        const resolvedReports = statusCounts.find(s => s.status === 'RESOLVED')?._count || 0;

        // 2. عدد المستخدمين
        const totalUsers = await prisma.user.count();
        const citizensCount = await prisma.user.count({ 
            where: { role: 'CITIZEN' } 
        });

        // 3. التقارير المحلولة
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

        // 4. حساب متوسط الوقت العام
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