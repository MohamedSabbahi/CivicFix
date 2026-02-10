const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createReport = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
    }

    try {
        const { title, description, latitude, longitude, categoryId } = req.body;
        const photoUrl = `/uploads/${req.file.filename}`;

        const report = await prisma.report.create({
            data: {
                title,
                description,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                categoryId: parseInt(categoryId),
                userId: req.user.id,
                photoUrl,
            },
        });

        res.status(201).json(report);
    } catch (error) {
        console.error("Report Creation Error:", error);
        res.status(500).json({ message: 'Server error while creating report' });
    }
};