const prisma = require('../utils/prisma');
const { generateMagicLinks } = require('../utils/linkGenerator');
const { sendStatusEmail } = require('../utils/mailer');
const { calculateDistance } = require('../utils/geoUtils');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);


const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { department: true },
    });
    res.status(200).json({ status: "success", data: categories });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch categories",
      details: error.message,
    });
  }
};



const createCivicIssue = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Image is required" });
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { title, description, latitude, longitude, categoryId } = req.body;

    if (!title || !latitude || !longitude || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload image to Supabase Storage
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeFileName = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
    const finalFileName = `${uniqueSuffix}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('civicIssue')
      .upload(finalFileName, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return res.status(500).json({ error: "Failed to upload image to cloud storage" });
    }

    const { data: publicUrlData } = supabase.storage
      .from('civicIssue')
      .getPublicUrl(finalFileName);

    const photoUrl = publicUrlData.publicUrl;
    const secret = crypto.randomUUID();

    const civicIssue = await prisma.civicIssue.create({
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
        category: { include: { department: true } },
      },
    });

    const department = civicIssue.category?.department;
    if (!department) {
      return res.status(400).json({ error: "Category has no associated department" });
    }

    const deptLinks = generateMagicLinks(civicIssue, department.id);
    sendStatusEmail(department.email, civicIssue, deptLinks)
      .then(() => console.log("✅ Email sent to primary department:", department.email))
      .catch(err => console.error("❌ Email Error:", err));

    res.status(201).json(civicIssue);

  } catch (error) {
    console.error("❌ Civic Issue Creation Error:", error);
    res.status(500).json({ message: error.message });
  }
};



const getAllCivicIssues = async (req, res) => {
  try {
    const {
      category_id, status, date_debut, date_fin,
      search, sort, order, user_lat, user_lng,
      page, limit, user_id
    } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;
    const whereCondition = {};

    if (category_id) {
      const categoryIdNum = parseInt(category_id);
      if (isNaN(categoryIdNum)) {
        return res.status(400).json({ status: "error", message: "Invalid category_id." });
      }
      whereCondition.categoryId = categoryIdNum;
    }

    if (user_id) {
      const userIdNum = parseInt(user_id);
      if (!isNaN(userIdNum)) whereCondition.userId = userIdNum;
    }

    if (status) whereCondition.status = status.toUpperCase();

    if (date_debut || date_fin) {
      const start = date_debut ? new Date(date_debut) : null;
      const end = date_fin ? new Date(`${date_fin}T23:59:59.999Z`) : null;

      if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))) {
        return res.status(400).json({ status: "error", message: "Invalid date format. Use YYYY-MM-DD." });
      }
      if (start && end && start > end) {
        return res.status(400).json({ status: "error", message: "Start date must be before end date." });
      }
      whereCondition.createdAt = {};
      if (start) whereCondition.createdAt.gte = start;
      if (end) whereCondition.createdAt.lte = end;
    }

    if (search) {
      const trimmedSearch = search.trim();
      if (trimmedSearch.length > 0 && trimmedSearch.length < 3) {
        return res.status(400).json({ status: "error", message: "Search term must be at least 3 characters." });
      }
      if (/[;'"$¿\\]/.test(trimmedSearch)) {
        return res.status(400).json({ status: "error", message: "Search term contains invalid characters." });
      }
      whereCondition.AND = [{
        OR: [
          { title: { contains: trimmedSearch, mode: "insensitive" } },
          { description: { contains: trimmedSearch, mode: "insensitive" } }
        ]
      }];
    }

    let orderByCondition = { createdAt: "desc" };
    if (sort === "date") {
      orderByCondition = { createdAt: order === "asc" ? "asc" : "desc" };
    }

    const [civicIssues, totalCivicIssues] = await Promise.all([
      prisma.civicIssue.findMany({
        where: whereCondition,
        skip,
        take: limitNum,
        orderBy: orderByCondition,
        include: {
          category: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.civicIssue.count({ where: whereCondition }),
    ]);

    let finalData = civicIssues;
    if (user_lat && user_lng) {
      const lat = parseFloat(user_lat);
      const lng = parseFloat(user_lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        finalData = civicIssues.map(issue => ({
          ...issue,
          distance: calculateDistance(lat, lng, issue.latitude, issue.longitude)
        }));
        if (sort === "distance") {
          finalData.sort((a, b) => order === "desc" ? b.distance - a.distance : a.distance - b.distance);
        }
      }
    }

    res.status(200).json({
      status: "success",
      results: finalData.length,
      metadata: {
        total: totalCivicIssues,
        page: pageNum,
        totalPages: Math.ceil(totalCivicIssues / limitNum),
      },
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch civic issues", details: error.message });
  }
};



const getMyCivicIssues = async (req, res) => {
  try {
    const civicIssues = await prisma.civicIssue.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        interventions: {
          include: {
            department: { select: { id: true, name: true } }
          }
        }
      },
    });

    res.status(200).json({
      status: "success",
      results: civicIssues.length,
      data: civicIssues,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch your civic issues", details: error.message });
  }
};



const getCivicIssueById = async (req, res) => {
  try {
    const civicIssue = await prisma.civicIssue.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
        comments: {
          include: { user: { select: { name: true, email: true } } },
        },
        interventions: {
          include: { department: { select: { id: true, name: true } } }
        }
      }
    });

    if (!civicIssue) return res.status(404).json({ message: "Civic issue not found" });

    res.status(200).json({ status: "success", data: civicIssue });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch civic issue", details: error.message });
  }
};



const getNearbyCivicIssues = async (req, res) => {
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

    const civicIssues = await prisma.civicIssue.findMany({
      where: whereCondition,
      include: {
        category: true,
        user: { select: { name: true } }
      }
    });

    const nearbyCivicIssues = civicIssues
      .map(issue => ({
        ...issue,
        distance: calculateDistance(userLat, userLng, issue.latitude, issue.longitude)
      }))
      .filter(issue => issue.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      status: "success",
      results: nearbyCivicIssues.length,
      metadata: { radius_used: `${searchRadius}km`, center: { userLat, userLng } },
      data: nearbyCivicIssues
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch nearby civic issues", details: error.message });
  }
};


const updateCivicIssue = async (req, res) => {
  try {
    const { title, description, categoryId, status } = req.body || {};
    const civicIssueId = parseInt(req.params.id);

    const existing = await prisma.civicIssue.findUnique({ where: { id: civicIssueId } });
    if (!existing) return res.status(404).json({ message: "Civic issue not found" });

    const isOwner = existing.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ status: "error", message: "No permission to modify this civic issue" });
    }

    const updated = await prisma.civicIssue.update({
      where: { id: civicIssueId },
      data: {
        title: title || existing.title,
        description: description || existing.description,
        categoryId: categoryId ? parseInt(categoryId) : existing.categoryId,
        status: status || existing.status,
        resolvedAt: status === 'RESOLVED' ? new Date() : existing.resolvedAt,
      },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
      },
    });

    res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error updating civic issue", details: error.message });
  }
};



const deleteCivicIssue = async (req, res) => {
  try {
    const civicIssueId = parseInt(req.params.id);

    const existing = await prisma.civicIssue.findUnique({ where: { id: civicIssueId } });
    if (!existing) return res.status(404).json({ message: "Civic issue not found" });

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { civicIssueId } }),
      prisma.intervention.deleteMany({ where: { civicIssueId } }),
      prisma.civicIssue.delete({ where: { id: civicIssueId } })
    ]);

    res.status(200).json({ status: "success", message: "Civic issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error deleting civic issue", details: error.message });
  }
};



const updateStatusByMagicLink = async (req, res) => {
  const { id, secret, status, departmentId } = req.query;

  if (!id || !secret || !status || !departmentId) {
    return res.status(400).send("<h1>Missing parameters</h1>");
  }

  const validStatuses = ["IN_PROGRESS", "RESOLVED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).send("<h1>Invalid status</h1>");
  }

  try {
    const civicIssueId = parseInt(id);
    const deptId = parseInt(departmentId);

    // Verify magic link
    const civicIssue = await prisma.civicIssue.findFirst({
      where: { id: civicIssueId, accessSecret: secret },
      include: { category: { include: { department: true } } }
    });

    if (!civicIssue) {
      return res.status(403).send("<h1>Invalid or expired link</h1>");
    }

    const primaryDeptId = civicIssue.category?.department?.id;
    const isPrimaryDept = primaryDeptId === deptId;

    const intervention = await prisma.intervention.findFirst({
      where: { civicIssueId, departmentId: deptId }
    });

    const isSecondaryDept = !!intervention;

    if (!isPrimaryDept && !isSecondaryDept) {
      return res.status(403).send("<h1>Department not assigned to this issue</h1>");
    }

    await prisma.$transaction(async (tx) => {
      if (isPrimaryDept) {
        await tx.civicIssue.update({
          where: { id: civicIssueId },
          data: {
            status: status,
            resolvedAt: status === "RESOLVED" ? new Date() : null,
            accessSecret: status === "RESOLVED" ? null : civicIssue.accessSecret,
          },
        });

      } else if (isSecondaryDept) {
        await tx.intervention.update({
          where: { id: intervention.id },
          data: {
            status: status === "IN_PROGRESS" ? "IN_PROGRESS" : "COMPLETED",
            completedAt: status === "RESOLVED" ? new Date() : null,
          },
        });

        if (status === "RESOLVED") {
          const pendingInterventions = await tx.intervention.count({
            where: { civicIssueId, status: { not: "COMPLETED" } },
          });

          if (pendingInterventions === 0 && civicIssue.status === "RESOLVED") {
            await tx.civicIssue.update({
              where: { id: civicIssueId },
              data: { accessSecret: null },
            });
          }
        }

        if (status === "IN_PROGRESS" && civicIssue.status === "PENDING") {
          await tx.civicIssue.update({
            where: { id: civicIssueId },
            data: { status: "IN_PROGRESS" },
          });
        }
      }
    });

    const deptType = isPrimaryDept ? "Primary" : "Secondary";
    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding-top:50px;">
        <h1 style="color:#059669;">✅ Status Updated Successfully</h1>
        <p>${deptType} department status set to <strong>${status}</strong>.</p>
        <p>You can close this tab.</p>
      </div>
    `);

  } catch (error) {
    console.error("❌ Magic Link Error:", error);
    res.status(500).send("<h1>Server Error</h1>");
  }
};

const showAssignDepartmentForm = async (req, res) => {
  const { reportId: civicIssueId } = req.params;
  const { secret, departmentId } = req.query;

  if (departmentId) {
    return assignDepartment(req, res);
  }

  try {
    const civicIssue = await prisma.civicIssue.findUnique({
      where: { id: parseInt(civicIssueId) },
      include: {
        interventions: { include: { department: true } },
        category: { include: { department: true } }
      }
    });

    if (!civicIssue || civicIssue.accessSecret !== secret) {
      return res.status(403).send("Invalid or expired link");
    }

    const primaryDeptId = civicIssue.category?.department?.id;
    const assignedIds = civicIssue.interventions.map(i => i.departmentId);
    const excludeIds = [...new Set([primaryDeptId, ...assignedIds].filter(Boolean))];

    const available = await prisma.department.findMany({
      where: { id: { notIn: excludeIds } }
    });

    if (available.length === 0) {
      return res.send(`
        <html><body style="font-family:sans-serif; text-align:center; padding:40px;">
          <h2>No additional departments available</h2>
          <p>All departments are already assigned to this issue.</p>
        </body></html>
      `);
    }

    const options = available.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

    res.send(`
      <html><body style="font-family:sans-serif; max-width:400px; margin:40px auto; padding:20px;">
        <h2>Assign Additional Department</h2>
        <p>Civic Issue: <strong>${civicIssue.title}</strong></p>
        <form method="GET" action="/api/reports/${civicIssueId}/assign-department">
          <input type="hidden" name="secret" value="${secret}" />
          <select name="departmentId" style="width:100%; padding:8px; margin:10px 0; border-radius:4px;">
            ${options}
          </select><br/>
          <button type="submit" style="background:#17a2b8; color:white; padding:10px 20px; border:none; border-radius:4px; cursor:pointer; margin-top:10px;">
            Assign Department
          </button>
        </form>
      </body></html>
    `);
  } catch (error) {
    console.error("showAssignDepartmentForm Error:", error);
    res.status(500).send("Server error");
  }
};


const assignDepartment = async (req, res) => {
  try {
    const { reportId: civicIssueId } = req.params;
    const { departmentId, secret } = req.query;

    if (!departmentId) return res.status(400).send("Missing departmentId");

    const civicIssue = await prisma.civicIssue.findUnique({
      where: { id: parseInt(civicIssueId) }
    });

    if (!civicIssue || civicIssue.accessSecret !== secret) {
      return res.status(403).send("Invalid or expired link");
    }

    const dept = await prisma.department.findUnique({
      where: { id: parseInt(departmentId) }
    });

    if (!dept) return res.status(404).send("Department not found");

    await prisma.intervention.upsert({
      where: {
        civicIssueId_departmentId: {
          civicIssueId: parseInt(civicIssueId),
          departmentId: parseInt(departmentId),
        },
      },
      update: {},
      create: {
        civicIssueId: parseInt(civicIssueId),
        departmentId: parseInt(departmentId),
        description: civicIssue.description,
      },
    });


    const links = generateMagicLinks(civicIssue, dept.id);
    sendStatusEmail(dept.email, civicIssue, links)
      .then(() => console.log("✅ Email sent to secondary department:", dept.email))
      .catch(err => console.error("Email error:", err));

    res.send(`
      <html>
        <body style="font-family:sans-serif; text-align:center; margin-top:50px;">
          <h2>✅ Department Assigned</h2>
          <p>${dept.name} has been notified by email.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Assign Department Error:", error);
    res.status(500).send("Server error");
  }
};

const getCivicIssueInterventions = async (req, res) => {
  try {
    const civicIssueId = parseInt(req.params.id);

    const civicIssue = await prisma.civicIssue.findUnique({
      where: { id: civicIssueId },
      include: {
        interventions: {
          include: { department: { select: { id: true, name: true } } }
        }
      }
    });

    if (!civicIssue) {
      return res.status(404).json({ status: "error", message: "Civic issue not found" });
    }

    const interventions = civicIssue.interventions.map(({ id, department, status, assignedAt, completedAt }) => ({
      id, department, status, assignedAt, completedAt
    }));

    res.status(200).json({ status: "success", data: interventions });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch interventions", details: error.message });
  }
};



const updateCivicIssueStatus = async (req, res) => {
  const { status } = req.body;
  const civicIssueId = parseInt(req.params.id);

  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const validStatuses = ['IN_PROGRESS', 'RESOLVED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const civicIssue = await prisma.civicIssue.findUnique({ where: { id: civicIssueId } });
    if (!civicIssue) return res.status(404).json({ error: 'Civic issue not found' });

    if (status === 'IN_PROGRESS' && civicIssue.status === 'RESOLVED') {
      return res.status(400).json({ error: 'Cannot revert a resolved civic issue' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.intervention.updateMany({
        where: { civicIssueId },
        data: {
          status: status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'COMPLETED',
          completedAt: status === 'RESOLVED' ? new Date() : null,
        },
      });

      await tx.civicIssue.update({
        where: { id: civicIssueId },
        data: {
          status,
          resolvedAt: status === 'RESOLVED' ? new Date() : null,
          accessSecret: status === 'RESOLVED' ? null : civicIssue.accessSecret,
        },
      });
    });

    res.json({ success: true, message: 'Status updated successfully', status });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};



const getReportComments = async (req, res) => {
  try {
    const civicIssueId = parseInt(req.params.id);
    const pageNum = Math.max(parseInt(req.query.page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const civicIssue = await prisma.civicIssue.findUnique({ where: { id: civicIssueId } });
    if (!civicIssue) return res.status(404).json({ message: "Civic issue not found" });

    const [comments, totalComments] = await Promise.all([
      prisma.comment.findMany({
        where: { civicIssueId },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } }
      }),
      prisma.comment.count({ where: { civicIssueId } })
    ]);

    res.status(200).json({
      status: "success",
      results: comments.length,
      metadata: { total: totalComments, page: pageNum, totalPages: Math.ceil(totalComments / limitNum) },
      data: comments
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch comments", details: error.message });
  }
};



module.exports = {
  createCivicIssue,
  getAllCivicIssues,
  getMyCivicIssues,
  getCivicIssueById,
  getCivicIssueInterventions,
  updateCivicIssue,
  deleteCivicIssue,
  updateStatusByMagicLink,
  getNearbyCivicIssues,
  getAllCategories,
  assignDepartment,
  showAssignDepartmentForm,
  updateCivicIssueStatus,
  getReportComments,
};