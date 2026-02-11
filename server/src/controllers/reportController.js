const { PrismaClient } = require('@prisma/client');
const { generateMagicLinks } = require('../utils/linkGenerator');
const { sendStatusEmail } = require('../utils/mailer');

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
            include: {
                category: {
                    include: {
                        department: true 
                    }
                }
            }
        });
        const links = generateMagicLinks(report);
        if (report.category?.department?.email) {
            await sendStatusEmail(report.category.department.email, report, links);
        }

        res.status(201).json(report);
    } catch (error) {
        console.error("Report Creation Error:", error);
        res.status(500).json({ message: 'Server error while creating report' });
    }
};

// Function for the Department (Click from Email)
// This function handles the update without authentication using the magic token (accessSecret)
exports.updateStatusByMagicLink = async (req, res) => {
    const { id, secret, status } = req.query;

    try {
        // 1. Verify if the report exists with this ID and the unique secret token [cite: 87, 90]
        const report = await prisma.report.findFirst({
            where: {
                id: parseInt(id),
                accessSecret: secret
            }
        });

        if (!report) {
            return res.status(403).send("<h1>Invalid Link</h1><p>This update link is no longer valid or has expired.</p>");
        }

        // 2. Prepare the update data
        const updateData = { status: status };
        
        // If status is RESOLVED, record the timestamp for admin statistics 
        if (status === 'RESOLVED') {
            updateData.resolvedAt = new Date();
        }

        // 3. Update the database [cite: 91]
        await prisma.report.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // 4. Serve a simple feedback page to the department worker 
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1 style="color: #059669;">Status Updated Successfully!</h1>
                <p>Report #${id} is now marked as: <strong>${status}</strong>.</p>
                <p>You can now close this tab.</p>
            </div>
        `);
    } catch (error) {
        console.error("Magic Link Update Error:", error);
        res.status(500).send("An error occurred while updating the status.");
    }
};

