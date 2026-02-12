const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { generateMagicLinks } = require('../utils/linkGenerator');
const { sendStatusEmail } = require('../utils/mailer');

const prisma = new PrismaClient();

const createReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
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
    
    // Automated Dispatch Logic
    const links = generateMagicLinks(report);
    if (report.category?.department?.email) {
        await sendStatusEmail(report.category.department.email, report, links);
    }

    res.status(201).json(report);

  } catch (error) {
    console.error("Report Creation Error:", error);
    res.status(500).json({ message: "Server error while creating report" });
  }
};

const getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reports, totalReports] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.report.count(),
    ]);

    res.status(200).json({
      status: "success",
      results: reports.length,
      metadata: {
        total: totalReports,
        page,
        totalPages: Math.ceil(totalReports / limit),
      },
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reports",
      details: error.message,
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    // FIXED: Cleaned up the nested includes and braces
    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
        comments: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      }
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json({
      status: "success",
      data: report
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch report",
      details: error.message,
    });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId } = req.body || {};

    const existingReport = await prisma.report.findUnique({
      where: { id: parseInt(id) } 
    });

    if (!existingReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    const isOwner = existingReport.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: "error", 
        message: "You do not have permission to modify this report"
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existingReport.title,
        description: description || existingReport.description,
        categoryId: categoryId ? parseInt(categoryId) : existingReport.categoryId,
      },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
      },
    });
    res.status(200).json({
      status: "success",
      data: updatedReport
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating report",
      details: error.message,
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const reportId = parseInt(id);

    const existingReport = await prisma.report.findUnique({
      where: { id: reportId }
    });
    if (!existingReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Deleting associated data within a transaction
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { reportId } }),
      prisma.report.delete({ where: { id: reportId } })
    ]);

    res.status(200).json({
      status: "success",
      message: "Report and associated comments deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting report",
      details: error.message,
    });
  }
};

const updateStatusByMagicLink = async (req, res) => {
    const { id, secret, status } = req.query;
    try {
        const report = await prisma.report.findFirst({
            where: {
                id: parseInt(id),
                accessSecret: secret
            }
        });

        if (!report) {
            return res.status(403).send("<h1>Invalid Link</h1><p>This update link is no longer valid or has expired.</p>");
        }

        const updateData = { status: status };
        if (status === 'RESOLVED') {
            updateData.resolvedAt = new Date();
        }

        await prisma.report.update({
            where: { id: parseInt(id) },
            data: updateData
        });

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

module.exports = {
    createReport, 
    getAllReports,
    getReportById,
    updateReport,
    deleteReport,
    updateStatusByMagicLink
};