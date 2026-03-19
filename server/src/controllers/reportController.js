const prisma = require('../utils/prisma');
const { generateMagicLinks } = require('../utils/linkGenerator');
const { sendStatusEmail } = require('../utils/mailer');
const { calculateDistance } = require('../utils/geoUtils');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client for cloud storage operations
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        department: true,
      },
    });
    res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch categories",
      details: error.message,
    });
  }
};

const createReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
  }

  try {
    const { title, description, latitude, longitude, categoryId } = req.body;
    let photoUrl = null;
    
    // Generate a unique, URL-safe filename to prevent overwriting in the storage bucket
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeFileName = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
    const finalFileName = `${uniqueSuffix}-${safeFileName}`;

    // Upload the file buffer (from memory) directly to the Supabase 'reports' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports') 
        .upload(finalFileName, req.file.buffer, {
            contentType: req.file.mimetype,
        });

    if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        return res.status(500).json({ error: "Failed to upload image to cloud storage" });
    }

    // Retrieve the permanent public URL to store in our PostgreSQL database
    const { data: publicUrlData } = supabase.storage
        .from('reports')
        .getPublicUrl(finalFileName);

    photoUrl = publicUrlData.publicUrl;
    const secret = crypto.randomUUID();

    const report = await prisma.report.create({
      data: {
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        categoryId: parseInt(categoryId),
        userId: req.user.id,
        photoUrl, 
        accessSecret: secret,
      },
      include: {
        category: {
          include: {
            department: true
          }
        }
      }
    });
    
    // Automated Dispatch Logic: Send an email to the responsible department
    const links = generateMagicLinks(report);
    if (report.category?.department?.email) {
        sendStatusEmail(report.category.department.email, report, links)
            .catch(err => console.error("Async Email Error:", err));
    }

    res.status(201).json(report);

  } catch (error) {
    console.error("Report Creation Error:", error);
    res.status(500).json({ message: "Server error while creating report" });
  }
};

const getAllReports = async (req, res) => {
  try {
    // Parameter extraction and normalization
    const { category_id, status, date_debut,
            date_fin, search, sort, order ,
            user_lat, user_lng , page, limit, user_id }
            = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Dynamic construction of the WHERE condition
    const whereCondition = {};

    if (category_id) {
      const categoryIdNum = parseInt(category_id);
      if (!isNaN(categoryIdNum)) {
      whereCondition.categoryId = categoryIdNum;
      } else {
        return res.status(400).json({
          status: "error",
          message: "Invalid category_id. It must be a number."
        });
      }
    }

    if (user_id) {
      const userIdNum = parseInt(user_id);
      if (!isNaN(userIdNum)) {
        whereCondition.userId = userIdNum;
      }
    }
    
    if (status) {
        const upperStatus = status.toUpperCase();
        // Assuming ReportStatus is defined elsewhere or this is a basic validation
        // if (!ReportStatus[upperStatus]) { ... }
        whereCondition.status = upperStatus;
    }
    
    // Date Range Filtering
    if (date_debut || date_fin) {
      const start = date_debut ? new Date(date_debut) : null;
      const end = date_fin ? new Date(`${date_fin}T23:59:59.999Z`) : null;
    
    if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime())))  {
        return res.status(400).json({
          status: "error",
          message: "Invalid date format. Use YYYY-MM-DD." 
        });
      }
    if(start && end && start > end) {
        return res.status(400).json({
          status: "error",
          message: "The start date must be before the end date."
        });
      }
      whereCondition.createdAt = {};
      if (start) whereCondition.createdAt.gte = start;
      if (end) whereCondition.createdAt.lte = end;
    }

    // Keyword Search Filtering
    if (search) {
        const trimmedSearch = search.trim();
          
          if(trimmedSearch.length > 0 && trimmedSearch.length < 3) {
            return res.status(400).json({
              status: "error",
              message: "Search term must be at least 3 characters long."
            });
          }
          const forbiddenChars = /[;'"$¿\\]/;
          if (forbiddenChars.test(trimmedSearch)) {
            return res.status(400).json({
              status: "error",
              message: "Search term contains invalid characters."
            });
          }

          whereCondition.AND = [{
          OR: [
          { title: { contains: trimmedSearch, mode: "insensitive" } },
          { description: { contains: trimmedSearch, mode: "insensitive" } }
        ]
      }];
    }

    // Dynamic Sorting 
    let orderByCondition = { createdAt: "desc" };
    if (sort === "date"){
      const sortOrder = order === "asc" ? "asc" : "desc";
      orderByCondition = { createdAt: sortOrder };
    }

    // Execute data fetch and total count in parallel for performance
    const [reports, totalReports] = await Promise.all([
      prisma.report.findMany({
        where: whereCondition,
        skip: skip,
        take: limitNum,
        orderBy: orderByCondition,
        include: {
          category: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.report.count({
        where: whereCondition,
      }),
    ]);

    // Geolocation Sorting Logic
    let finalData = reports;
    if (user_lat && user_lng) {      
        const lat = parseFloat(user_lat);
        const lng = parseFloat(user_lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          finalData = reports.map(report => {
            const distance = calculateDistance(
              lat,
              lng,
              report.latitude,
              report.longitude
            );
            return { ...report, distance };
          });
          
          if (sort === "distance") {
            finalData.sort((a, b) => {
              return order === "desc" ? b.distance - a.distance : a.distance - b.distance;
            });
          }
        }
      }

    res.status(200).json({
      status: "success",
      results: finalData.length,
      metadata: {
        total: totalReports,
        page: pageNum,
        totalPages: Math.ceil(totalReports / limitNum),
      },
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reports",
      details: error.message,
    });
  }
};

const getMyReports = async (req, res) => {
  try{
    const reports = await prisma.report.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    });

    res.status(200).json({
      status: "success",
      results: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch your reports",
      details: error.message,
    });
  }
}

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
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

const getNearbyReports = async (req, res) => {
  try {
    const { latitude, longitude, radius, category_id } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ status: "error", message: "Coordinates required" });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    
    // Limit radius to protect server performance (Min 1km, Max 100km)
    const searchRadius = Math.min(Math.max(parseFloat(radius) || 5, 1), 100);

    // Bounding Box Calculation: Creates a rough square to quickly filter the DB via indexes
    // 1 degree of latitude is roughly 111km
    const latDelta = searchRadius / 111;
    const lngDelta = searchRadius / (111 * Math.cos(userLat * (Math.PI / 180)));

    const whereCondition = {
      status: { not: "RESOLVED" },
      latitude: { gte: userLat - latDelta, lte: userLat + latDelta },
      longitude: { gte: userLng - lngDelta, lte: userLng + lngDelta },
    };

    if (category_id) {
      const categoryIdNum = parseInt(category_id);
      if (!isNaN(categoryIdNum)) whereCondition.categoryId = categoryIdNum;
    }

    const reports = await prisma.report.findMany({
      where: whereCondition,
      include: {
        category: true,
        user: { select: { name: true } }
      }
    });

    // Precise Haversine Calculation: Filters the rough square down to an exact circle
    const nearbyReports = reports
      .map(report => {
        const distance = calculateDistance(userLat, userLng, report.latitude, report.longitude);
        return { ...report, distance };
      })
      .filter(report => report.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      status: "success",
      results: nearbyReports.length,
      metadata: {
        radius_used: `${searchRadius}km`,
        center: { userLat, userLng }
      },
      data: nearbyReports
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch nearby reports",
      details: error.message
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

    // Delete associated data securely within a transaction
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
            return res.status(403).send("<h1>Invalid Link</h1><p>This link is no longer valid or has already been used.</p>");
        }

        const updateData = { 
          status: status,
        };

        if (status === 'RESOLVED') {
            updateData.resolvedAt = new Date();
            updateData.accessSecret = null; 
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
    getMyReports,
    getReportById,
    updateReport,
    deleteReport,
    updateStatusByMagicLink,
    getNearbyReports,
    getAllCategories
};