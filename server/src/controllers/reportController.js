const prisma = require('../utils/prisma');
const { Prisma } = require('@prisma/client');
const { generateMagicLinks } = require('../utils/linkGenerator');
const { sendStatusEmail } = require('../utils/mailer');
const { calculateDistance } = require('../utils/geoUtils');
const crypto = require('crypto');

const ReportStatus = Prisma.ReportStatus;

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
    
    const photoUrl = `/uploads/${req.file.filename}`;

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

    const { category_id, status, date_debut,
            date_fin, search, sort, order ,
            user_lat, user_lng , page, limit, user_id }
            = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

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

      if (!ReportStatus[upperStatus]) {
          return res.status(400).json({
            status: "error",
            message: "Invalid status value."
          });
        }

        whereCondition.status = upperStatus;
    }
    

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
    let orderByCondition = { createdAt: "desc" };
    if (sort === "date"){
      const sortOrder = order === "asc" ? "asc" : "desc";
      orderByCondition = { createdAt: sortOrder };
    }
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
            message: "Failed to fetch reports with distance calculation",
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
    
    const searchRadius = Math.min(Math.max(parseFloat(radius) || 5, 1), 100);

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

const showAssignDepartmentForm = async (req, res) => {
  const { reportId } = req.params;
  const { secret } = req.query;

  // Validate secret
  const report = await prisma.report.findUnique({
    where: { id: parseInt(reportId) },
    include: { departments: { include: { department: true } } }
  });

  if (!report || report.accessSecret !== secret) {
    return res.status(403).send("Invalid or expired link");
  }

  // Only show departments NOT already assigned
  const assignedIds = report.departments.map(d => d.departmentId);
  const available = await prisma.department.findMany({
    where: { id: { notIn: assignedIds } }
  });

  const options = available.map(d =>
    `<option value="${d.id}">${d.name}</option>`
  ).join('');

  res.send(`
    <html><body style="font-family:sans-serif; max-width:400px; margin:40px auto; padding:20px;">
      <h2>Assign Additional Department</h2>
      <p>Report: <strong>${report.title}</strong></p>
      <form method="POST" 
            action="/api/reports/${reportId}/assign-department?secret=${secret}">
        <select name="departmentId" 
                style="width:100%; padding:8px; margin:10px 0; border-radius:4px;">
          ${options}
        </select><br/>
        <button type="submit" 
                style="background:#17a2b8; color:white; padding:10px 20px; 
                      border:none; border-radius:4px; cursor:pointer; margin-top:10px;">
          Assign Department
        </button>
      </form>
    </body></html>
  `);
};

const assignDepartment = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { secret } = req.query;
    const { departmentId } = req.body || {};
    console.log("departmentId from body:", departmentId);  // ← check terminal

    if (!departmentId) {
      return res.status(400).send("Department ID is missing from form submission");
    }

    console.log("=== ASSIGN DEPARTMENT DEBUG ===");
    console.log("reportId:", reportId);
    console.log("secret:", secret);
    console.log("departmentId:", departmentId);

    // Step 1: find report
    const report = await prisma.report.findUnique({
      where: { id: parseInt(reportId) }
    });
    console.log("report found:", report?.id, "| secret match:", report?.accessSecret === secret);

    if (!report || report.accessSecret !== secret) {
      return res.status(403).send("Invalid or expired link");
    }

    // Step 2: find department
    const dept = await prisma.department.findUnique({
      where: { id: parseInt(departmentId) }
    });
    console.log("department found:", dept?.id, dept?.name, dept?.email);

    if (!dept) {
      return res.status(404).send("Department not found");
    }

    // Step 3: create assignment
    await prisma.reportDepartment.create({
      data: {
        reportId: parseInt(reportId),
        departmentId: parseInt(departmentId),
      },
    });
    console.log("Assignment created successfully");

    // Step 4: send email
    const links = generateMagicLinks(report);
    await sendStatusEmail(dept.email, report, links);
    console.log("Email sent to:", dept.email);

    res.send(`
      <html><body style="font-family:sans-serif; max-width:400px; margin:40px auto; padding:20px;">
        <h2>✅ Department Assigned</h2>
        <p><strong>${dept.name}</strong> has been notified by email.</p>
      </body></html>
    `);

  } catch (error) {
    console.error("=== ASSIGN ERROR DETAILS ===");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Stack:", error.stack);
    
    if (error.code === "P2002") {
      return res.status(400).send("Department already assigned to this report");
    }
    res.status(500).send(`Server error: ${error.message}`);
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
    getAllCategories,
    assignDepartment,
    showAssignDepartmentForm
};

