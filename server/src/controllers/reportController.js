const prisma = require('../utils/prisma');
const { Prisma } = require('@prisma/client');
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

const CivicIssueStatus = Prisma.CivicIssueStatus;

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

const createCivicIssue = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  console.log("USER:", req.user);

  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
  }

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { title, description, latitude, longitude, categoryId } = req.body;
    if (!title || !latitude || !longitude || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
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
        category: {
          include: {
            department: true,
          },
        },
      },
    });

    const department = civicIssue.category?.department;

    if (!department) {
      return res.status(400).json({ error: "Category has no department" });
    }

    // Automated Dispatch Logic: Send an email to the responsible department
    const links = generateMagicLinks(civicIssue);
    if (civicIssue.category?.department?.email) {
        sendStatusEmail(civicIssue.category.department.email, civicIssue, links)
            .catch(err => console.error("Async Email Error:", err));
    }

    await prisma.intervention.upsert({
      where: {
        civicIssueId_departmentId: {
          civicIssueId: civicIssue.id,
          departmentId: department.id,
        },
      },
      update: {},
      create: {
        civicIssueId: civicIssue.id,
        departmentId: department.id,
        title: civicIssue.title,
        description: civicIssue.description,
        img: civicIssue.photoUrl,
      },
    });

    const deptLinks = generateMagicLinks(civicIssue, department.id);
    try {
      await sendStatusEmail(department.email, civicIssue, deptLinks);
      console.log("✅ Email sent to:", department.email);
    } catch (err) {
      console.error("❌ Email Error:", err);
    }
    
    res.status(201).json(civicIssue);

  } catch (error) {
    console.error("❌ Civic Issue Creation Error FULL:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllCivicIssues = async (req, res) => {
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
    const [civicIssues, totalCivicIssues] = await Promise.all([
      prisma.civicIssue.findMany({
        where: whereCondition,
        skip: skip,
        take: limitNum,
        orderBy: orderByCondition,
        include: {
          category: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.civicIssue.count({
        where: whereCondition,
      }),
    ]);

    // Geolocation Sorting Logic
    let finalData = civicIssues;
    if (user_lat && user_lng) {      
        const lat = parseFloat(user_lat);
        const lng = parseFloat(user_lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          finalData = civicIssues.map(civicIssue => {
            const distance = calculateDistance(
              lat,
              lng,
              civicIssue.latitude,
              civicIssue.longitude
            );
            return { ...civicIssue, distance };
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
        total: totalCivicIssues,
        page: pageNum,
        totalPages: Math.ceil(totalCivicIssues / limitNum),
      },
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch civic issues",
      details: error.message,
    });
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
            department: {
              select: { id: true, name: true }
            }
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
    res.status(500).json({
      status: "error",
      message: "Failed to fetch your civic issues",
      details: error.message,
    });
  }
}

const getCivicIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const civicIssue = await prisma.civicIssue.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
        comments: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        interventions: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!civicIssue) {
      return res.status(404).json({ message: "Civic issue not found" });
    }
    res.status(200).json({
      status: "success",
      data: civicIssue
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch civic issue",
      details: error.message,
    });
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
    
    // Limit radius to protect server performance (Min 1km, Max 100km)
    const searchRadius = Math.min(Math.max(parseFloat(radwius) || 5, 1), 100);

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

    const civicIssues = await prisma.civicIssue.findMany({
      where: whereCondition,
      include: {
        category: true,
        user: { select: { name: true } }
      }
    });

    // Precise Haversine Calculation: Filters the rough square down to an exact circle
    const nearbyCivicIssues = civicIssues
      .map(civicIssue => {
        const distance = calculateDistance(userLat, userLng, civicIssue.latitude, civicIssue.longitude);
        return { ...civicIssue, distance };
      })
      .filter(civicIssue => civicIssue.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      status: "success",
      results: nearbyCivicIssues.length,
      metadata: {
        radius_used: `${searchRadius}km`,
        center: { userLat, userLng }
      },
      data: nearbyCivicIssues
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch nearby civic issues",
      details: error.message
    });
  }
};

const updateCivicIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId , status } = req.body || {};

    const existingCivicIssue = await prisma.civicIssue.findUnique({
      where: { id: parseInt(id) } 
    });

    if (!existingCivicIssue) {
      return res.status(404).json({ message: "Civic issue not found" });
    }

    const isOwner = existingCivicIssue.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: "error", 
        message: "You do not have permission to modify this civic issue"
      });
    }

    const updatedCivicIssue = await prisma.civicIssue.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existingCivicIssue.title,
        description: description || existingCivicIssue.description,
        categoryId: categoryId ? parseInt(categoryId) : existingCivicIssue.categoryId,
        status:      status      || existingCivicIssue.status,
        resolvedAt:  status === 'RESOLVED' ? new Date() : existingCivicIssue.resolvedAt,     
      },
      include: {
        category: true,
        user: { select: { name: true, email: true } },
      },
    });
    res.status(200).json({
      status: "success",
      data: updatedCivicIssue
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating civic issue",
      details: error.message,
    });
  }
};

const deleteCivicIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const civicIssueId = parseInt(id);

    const existingCivicIssue = await prisma.civicIssue.findUnique({
      where: { id: civicIssueId }
    });
    if (!existingCivicIssue) {
      return res.status(404).json({ message: "Civic issue not found" });
    }
    
    // Delete associated data securely within a transaction
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { civicIssueId: civicIssueId } }),
      prisma.civicIssue.delete({ where: { id: civicIssueId } })
    ]);

    res.status(200).json({
      status: "success",
      message: "Civic issue and associated comments deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting civic issue",
      details: error.message,
    });
  }
};

const updateStatusByMagicLink = async (req, res) => {
  const { id, secret, status, departmentId } = req.query;
  if (!id || !secret || !status || !departmentId) {
    return res.status(400).send("<h1>Missing parameters</h1>");
  }

  try {
    const civicIssue = await prisma.civicIssue.findFirst({
      where: {
        id: parseInt(id),
        accessSecret: secret,
      },
    });

    if (!civicIssue) {
      return res.status(403).send("<h1>Invalid Link</h1>");
    }

    const intervention = await prisma.intervention.findFirst({
      where: {
        civicIssueId: parseInt(id),
        departmentId: parseInt(departmentId),
      },
    });

    if (!intervention) {
      console.log("❌ No department match", { id, departmentId });
      return res.status(404).send("<h1>Department not assigned</h1>");
    }

    const validStatuses = ["IN_PROGRESS", "RESOLVED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).send("<h1>Invalid status</h1>");
    }

    await prisma.$transaction(async (tx) => {
      await tx.intervention.update({
        where: { id: intervention.id },
        data: {
          status: status === "IN_PROGRESS" ? "IN_PROGRESS" : "COMPLETED",
          completedAt: status === "RESOLVED" ? new Date() : null,
        },
      });

      if (status === "IN_PROGRESS") {
        await tx.civicIssue.update({
          where: { id: parseInt(id) },
          data: { status: "IN_PROGRESS" },
        });
      }

      if (status === "RESOLVED") {
        const pending = await tx.intervention.count({
          where: {
            civicIssueId: parseInt(id),
            status: { not: "COMPLETED" },
          },
        });

        if (pending === 0) {
          await tx.civicIssue.update({
            where: { id: parseInt(id) },
            data: {
              status: "RESOLVED",
              resolvedAt: new Date(),
              accessSecret: null,
            },
          });
        }
      }
    });

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding-top:50px;">
        <h1 style="color:#059669;">✅ Status Updated Successfully</h1>
        <p>You can close this tab.</p>
      </div>
    `);

  } catch (error) {
    console.error("❌ Magic Link Error:", error);
    res.status(500).send("<h1>Server Error</h1>");
  }
};

const showAssignDepartmentForm = async (req, res) => {
  const { civicIssueId } = req.params;
  const { secret ,  departmentId  } = req.query;

  if (departmentId) {
    return assignDepartment(req, res);
  }

  const civicIssue = await prisma.civicIssue.findUnique({
    where: { id: parseInt(civicIssueId) },
    include: { interventions: { include: { department: true } } }
  });

  if (!civicIssue || civicIssue.accessSecret !== secret) {
    return res.status(403).send("Invalid or expired link");
  }

  const assignedIds = civicIssue.interventions.map(d => d.departmentId);
  const available = await prisma.department.findMany({
    where: { id: { notIn: assignedIds } }
  });

  const options = available.map(d =>
    `<option value="${d.id}">${d.name}</option>`
  ).join('');

  res.send(`
    <html><body style="font-family:sans-serif; max-width:400px; margin:40px auto; padding:20px;">
      <h2>Assign Additional Department</h2>
      <p>Civic Issue: <strong>${civicIssue.title}</strong></p>
      <form method="GET" action="/api/civicIssues/${civicIssueId}/assign-department">
        <input type="hidden" name="secret" value="${secret}" />
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
    const { civicIssueId } = req.params;
    const { departmentId, secret } = req.query;

    console.log("Assign Query:", req.query);

    if (!departmentId) {
      return res.status(400).send("Missing departmentId");
    }

    const civicIssue = await prisma.civicIssue.findUnique({
      where: { id: parseInt(civicIssueId) }
    });

    if (!civicIssue || civicIssue.accessSecret !== secret) {
      return res.status(403).send("Invalid or expired link");
    }

    const dept = await prisma.department.findUnique({
      where: { id: parseInt(departmentId) }
    });

    if (!dept) {
      return res.status(404).send("Department not found");
    }

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
        title: civicIssue.title,
        description: civicIssue.description,
        img: civicIssue.photoUrl,
      },
    });

    const updatedCivicIssue = await prisma.civicIssue.findUnique({
      where: { id: parseInt(civicIssueId) }
    });

    const links = generateMagicLinks(updatedCivicIssue, dept.id);

    console.log("📩 Second Email Links:", links);

    sendStatusEmail(dept.email, updatedCivicIssue, links)
      .catch(err => console.error("Email error:", err));

    res.send(`
      <html>
        <body style="font-family:sans-serif; text-align:center; margin-top:50px;">
          <h2>✅ Department Assigned</h2>
          <p>${dept.name} has been notified.</p>
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
    const { id } = req.params;
    const civicIssueId = parseInt(id);
    const civicIssue = await prisma.civicIssue.findUnique({
      where: { id: civicIssueId },
      include: {
        interventions: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    if (!civicIssue) {
      return res.status(404).json({
        status: "error",
        message: "Civic issue not found"
      });
    }
    const interventions = civicIssue.interventions.map(({ id, department, status, assignedAt, completedAt }) => ({
      id,
      department,
      status,
      assignedAt,
      completedAt
    }));
    res.status(200).json({
      status: "success",
      data: interventions
    });
  } catch (error) {
    console.error('Error fetching civic issue interventions:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch civic issue interventions",
      details: error.message
    });
  }
};

const updateCivicIssueStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.user?.departmentId) {
    return res.status(403).json({ error: 'Department user required' });
  }

  const validStatuses = ['IN_PROGRESS', 'RESOLVED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const civicIssueId = parseInt(id);
    const deptId = req.user.departmentId;

    // Fetch civic issue and dept assignment
    const [civicIssue, intervention] = await Promise.all([
      prisma.civicIssue.findUnique({ where: { id: civicIssueId } }),
      prisma.intervention.findUnique({
        where: {
          civicIssueId_departmentId: { civicIssueId, departmentId: deptId }
        }
      })
    ]);

    if (!civicIssue) return res.status(404).json({ error: 'Civic issue not found' });
    if (!intervention) return res.status(403).json({ error: 'Department not assigned to civic issue' });

    const currentDeptStatus = intervention.status;
    const newDeptStatus = status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'COMPLETED';
    if (currentDeptStatus === newDeptStatus) {
      return res.status(200).json({ message: 'Status already up to date', status: status });
    }

    if (status === 'IN_PROGRESS' && civicIssue.status === 'RESOLVED') {
      return res.status(400).json({ error: 'Cannot revert resolved civic issue to in progress' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.intervention.update({
        where: { id: intervention.id },
        data: {
          status: newDeptStatus,
          completedAt: newDeptStatus === 'COMPLETED' ? new Date() : null,
        },
      });

      if (status === 'RESOLVED') {
        const pendingDepts = await tx.intervention.count({
          where: {
            civicIssueId: civicIssueId,
            status: { not: 'COMPLETED' },
          },
        });

        if (pendingDepts === 0) {
          await tx.civicIssue.update({
            where: { id: civicIssueId },
            data: { 
              status: 'RESOLVED', 
              resolvedAt: new Date(), 
              accessSecret: null 
            },
          });
        }
      } else {
        await tx.civicIssue.update({
          where: { id: civicIssueId },
          data: { status: 'IN_PROGRESS' },
        });
      }
    });

    res.json({ 
      success: true, 
      message: 'Status updated successfully',
      status 
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};
const getReportComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const civicIssueId = parseInt(id);

    // Validate that the report exists before fetching comments
    const civicIssue = await prisma.civicIssue.findUnique({
      where: { id: civicIssueId }
    });

    if (!civicIssue) {
      return res.status(404).json({ message: "Civic issue not found" });
    }

    // Execute data fetch and total count in parallel for optimized performance
    const [comments, totalComments] = await Promise.all([
      prisma.comment.findMany({
        where: { civicIssueId: civicIssueId },
        skip: skip,
        take: limitNum,
        orderBy: { createdAt: "desc" }, // Show newest comments first
        include: {
          user: {
            select: {
              id: true,
              name: true,
              // email: true, // Optional: Include if you want to show email avatars
            }
          }
        }
      }),
      prisma.comment.count({
        where: { civicIssueId: civicIssueId }
      })
    ]);

    res.status(200).json({
      status: "success",
      results: comments.length,
      metadata: {
        total: totalComments,
        page: pageNum,
        totalPages: Math.ceil(totalComments / limitNum)
      },
      data: comments
    });

  } catch (error) {
    console.error("Error in getReportComments:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch comments",
      details: error.message
    });
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
    getReportComments
};