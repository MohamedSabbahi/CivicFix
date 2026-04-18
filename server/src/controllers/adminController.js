const prisma = require('../utils/prisma');

// Calculates performance metrics per department using optimized raw SQL
const getDepartmentStats = async (req, res) => {
    try {
        // Raw SQL handles complex calculations and joins more efficiently than the ORM for large datasets
        const stats = await prisma.$queryRaw`
            SELECT 
                d.name as department,
                COUNT(ci.id) as "resolvedCivicIssuesCount",
                AVG(EXTRACT(EPOCH FROM (ci."resolvedAt" - ci."createdAt")) / 3600) as "averageResolutionTime"
            FROM "CivicIssue" ci
            JOIN "Category" c ON ci."categoryId" = c.id
            JOIN "Department" d ON c."departmentId" = d.id
            WHERE ci.status = 'RESOLVED'
            GROUP BY d.name;
        `;

        // Formats BigInt counts and float values into a clean, human-readable API response
        const formattedStats = stats.map(stat => ({
            department: stat.department,
            resolvedCivicIssuesCount: Number(stat.resolvedCivicIssuesCount),
            averageResolutionTime: stat.averageResolutionTime 
                ? parseFloat(stat.averageResolutionTime).toFixed(2) + " hours" 
                : "0.00 hours",
            civicIssuesDetail: [] 
        }));

        res.status(200).json(formattedStats);
    } catch (error) {
        console.error("Stats Calculation Error:", error);
        res.status(500).json({ message: "Failed to calculate department statistics" });
    }
};

// Provides a high-level overview of system activity and user distribution
const getOverviewStats = async (req, res) => {
    try {
        // Groups civic issues by their status enum to provide a quick summary
        const statusCounts = await prisma.civicIssue.groupBy({
            by: ['status'],
            _count: true
        });

        const totalCivicIssues = statusCounts.reduce((sum, s) => sum + s._count, 0);
        const pendingCivicIssues = statusCounts.find(s => s.status === 'PENDING')?._count || 0;
        const inProgressCivicIssues = statusCounts.find(s => s.status === 'IN_PROGRESS')?._count || 0;
        const resolvedCivicIssues = statusCounts.find(s => s.status === 'RESOLVED')?._count || 0;

        const totalUsers = await prisma.user.count();
        const citizensCount = await prisma.user.count({ where: { role: 'CITIZEN' } });

        // Calculates the overall system average resolution speed
        const resolvedWithTime = await prisma.civicIssue.findMany({
            where: { status: 'RESOLVED', resolvedAt: { not: null } },
            select: { createdAt: true, resolvedAt: true }
        });

        let overallAvgHours = 0;
        if (resolvedWithTime.length > 0) {
            const totalTime = resolvedWithTime.reduce((sum, ci) => sum + (new Date(ci.resolvedAt) - new Date(ci.createdAt)), 0);
            overallAvgHours = (totalTime / resolvedWithTime.length / (1000 * 60 * 60)).toFixed(2);
        }

        const resolutionRate = totalCivicIssues > 0 ? ((resolvedCivicIssues / totalCivicIssues) * 100).toFixed(2) : '0.00';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCivicIssues = await prisma.civicIssue.count({ where: { createdAt: { gte: today } } });

        res.status(200).json({
            status: 'success',
            data: {
                totalCivicIssues, totalUsers, citizensCount, pendingCivicIssues,
                inProgressCivicIssues, resolvedCivicIssues, todayCivicIssues,
                overallAverageTime: `${overallAvgHours} hours`,
                resolutionRate: `${resolutionRate}%`
            }
        });
    } catch (error) {
        console.error("Overview Stats Error:", error);
        res.status(500).json({ status: 'error', message: "Erreur lors du calcul des statistiques" });
    }
};

// Handles department configuration and ensures categories are correctly linked
const addDepartment = async (req, res) => {
    try {
        const { name, email, categories } = req.body;
        if (!name || !email) return res.status(400).json({ error: "Le nom et l'email sont obligatoires" });

        // Creates or updates the department record to prevent duplicates
        const department = await prisma.department.upsert({
            where: { email: email },
            update: { name: name },
            create: { name, email }
        });

        // Iteratively adds categories associated with the department
        if (categories && Array.isArray(categories)) {
            for (const catName of categories) {
                await prisma.category.create({
                    data: { name: catName, departmentId: department.id }
                });
            }
        }

        res.status(201).json({ status: "success", message: "Département configuré", data: department });
    } catch (error) {
        console.error("Erreur addDepartment:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Removes a department and cleans up all related categories and civic issues
const deleteDepartment = async (req, res) => {
    try {
        const { id }  = req.params;
        const deptId  = parseInt(id);

        await prisma.comment.deleteMany({
            where: {
                civicIssue: {
                    category: { departmentId: deptId }
                }
            }
        });

        await prisma.civicIssue.deleteMany({
            where: {
                category: { departmentId: deptId }
            }
        });

        await prisma.category.deleteMany({
            where: { departmentId: deptId }
        });

        await prisma.department.delete({
            where: { id: deptId }
        });

        res.status(200).json({ 
            status: "success", 
            message: "Department and all related data deleted successfully" 
        });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Server error during deletion" });
    }
};

const updateCivicIssueStatus = async (req, res) => {
    try {
        const { id }     = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ 
                status: "error", 
                message: "Status is required" 
            });
        }

        const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                status: "error", 
                message: "Invalid status value" 
            });
        }

        const updated = await prisma.civicIssue.update({
            where: { id: parseInt(id) },
            data: {
                status,
                resolvedAt: status === 'RESOLVED' ? new Date() : null,
            },
        });

        res.status(200).json({ 
            status: 'success', 
            data: updated 
        });

    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            include: { categories: true }
        });
        res.status(200).json({ 
            status: 'success', 
            data: departments 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, categoriesToAdd, categoriesToDelete } = req.body;

        // Met à jour nom et email du département
        const updated = await prisma.department.update({
            where: { id: parseInt(id) },
            data: { name, email },
        });

        // Supprime les catégories cochées pour suppression
        if (categoriesToDelete && categoriesToDelete.length > 0) {
            await prisma.category.deleteMany({
                where: { id: { in: categoriesToDelete } }
            });
        }

        // Ajoute les nouvelles catégories
        if (categoriesToAdd && categoriesToAdd.length > 0) {
            for (const catName of categoriesToAdd) {
                await prisma.category.create({
                    data: { name: catName, departmentId: updated.id }
                });
            }
        }

        const result = await prisma.department.findUnique({
            where: { id: parseInt(id) },
            include: { categories: true }
        });

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        console.error("Update Department Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getCivicIssuesByPeriod = async (req, res) => {
    try {
        const { period } = req.query; // day / month / year

        const now   = new Date();
        let start, groupBy, labels = [];

        if (period === "day") {
            // 7 derniers jours
            start = new Date(now);
            start.setDate(now.getDate() - 6);
            start.setHours(0, 0, 0, 0);

            const civicIssues = await prisma.civicIssue.findMany({
                where: { createdAt: { gte: start } },
                select: { createdAt: true }
            });

            const counts = {};
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const key = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                counts[key] = 0;
            }
            civicIssues.forEach(ci => {
                const key = new Date(ci.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                if (counts[key] !== undefined) counts[key]++;
            });
            return res.json({ status: "success", data: Object.entries(counts).map(([label, count]) => ({ label, count })) });
        }

        if (period === "month") {
            // 12 derniers mois
            start = new Date(now);
            start.setMonth(now.getMonth() - 11);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);

            const civicIssues = await prisma.civicIssue.findMany({
                where: { createdAt: { gte: start } },
                select: { createdAt: true }
            });

            const counts = {};
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now);
                d.setMonth(now.getMonth() - i);
                const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                counts[key] = 0;
            }
            civicIssues.forEach(ci => {
                const key = new Date(ci.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
                if (counts[key] !== undefined) counts[key]++;
            });
            return res.json({ status: "success", data: Object.entries(counts).map(([label, count]) => ({ label, count })) });
        }

        if (period === "year") {
            // 5 dernières années
            start = new Date(now);
            start.setFullYear(now.getFullYear() - 4);
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);

            const civicIssues = await prisma.civicIssue.findMany({
                where: { createdAt: { gte: start } },
                select: { createdAt: true }
            });

            const counts = {};
            for (let i = 4; i >= 0; i--) {
                const key = String(now.getFullYear() - i);
                counts[key] = 0;
            }
            civicIssues.forEach(ci => {
                const key = String(new Date(ci.createdAt).getFullYear());
                if (counts[key] !== undefined) counts[key]++;
            });
            return res.json({ status: "success", data: Object.entries(counts).map(([label, count]) => ({ label, count })) });
        }

        res.status(400).json({ status: "error", message: "Invalid period" });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = { 
    getDepartmentStats, 
    getOverviewStats, 
    addDepartment, 
    deleteDepartment, 
    updateCivicIssueStatus, 
    getDepartments,
    updateDepartment,
    getCivicIssuesByPeriod
};