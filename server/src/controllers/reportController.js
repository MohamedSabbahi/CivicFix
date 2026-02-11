const { PrismaClient } = require("@prisma/client");
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
    });

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

module.exports = {
    createReport, 
    getAllReports
};