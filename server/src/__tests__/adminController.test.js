const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

jest.mock('../utils/prisma', () => ({
  $queryRaw: jest.fn(),
  civicIssue: {
    groupBy: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
  },
  user: {
    count: jest.fn(),
  },
  department: {
    upsert: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  category: {
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  comment: {
    deleteMany: jest.fn(),
  },
}));

const prisma = require('../utils/prisma');
const adminController = require('../controllers/adminController');

const mockAdminAuth = (req, res, next) => {
  req.user = { id: 1, role: 'ADMIN' };
  next();
};

app.get('/api/admin/stats/departments', mockAdminAuth, adminController.getDepartmentStats);
app.get('/api/admin/stats/overview', mockAdminAuth, adminController.getOverviewStats);
app.post('/api/admin/departments', mockAdminAuth, adminController.addDepartment);
app.delete('/api/admin/departments/:id', mockAdminAuth, adminController.deleteDepartment);

describe('Admin Controller Tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/admin/stats/departments', () => {
    it('should return formatted department stats using raw SQL', async () => {
      prisma.$queryRaw.mockResolvedValue([
        { department: 'Public Works', resolvedCivicIssuesCount: 10n, averageResolutionTime: '24.5' }
      ]);

      const response = await request(app).get('/api/admin/stats/departments');

      expect(response.status).toBe(200);
      expect(response.body[0].department).toBe('Public Works');
      expect(response.body[0].resolvedCivicIssuesCount).toBe(10);
      expect(response.body[0].averageResolutionTime).toBe('24.50 hours');
    });
  });

  describe('GET /api/admin/stats/overview', () => {
    it('should calculate global dashboard statistics', async () => {
      prisma.civicIssue.groupBy.mockResolvedValue([
        { status: 'PENDING', _count: 5 },
        { status: 'RESOLVED', _count: 15 }
      ]);
      prisma.user.count.mockResolvedValueOnce(50).mockResolvedValueOnce(45);
      prisma.civicIssue.findMany.mockResolvedValue([]);
      prisma.civicIssue.count.mockResolvedValue(2);

      const response = await request(app).get('/api/admin/stats/overview');

      expect(response.status).toBe(200);
      expect(response.body.data.totalCivicIssues).toBe(20);
      expect(response.body.data.resolutionRate).toBe('75.00%');
      expect(response.body.data.citizensCount).toBe(45);
    });
  });

  describe('DELETE /api/admin/departments/:id', () => {
    it('should execute cascading deletes for a department', async () => {
      prisma.comment.deleteMany.mockResolvedValue({ count: 3 });
      prisma.civicIssue.deleteMany.mockResolvedValue({ count: 5 });
      prisma.category.deleteMany.mockResolvedValue({ count: 2 });
      prisma.department.delete.mockResolvedValue({ id: 1 });

      const response = await request(app).delete('/api/admin/departments/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
      expect(prisma.department.delete).toHaveBeenCalledWith({ where: { id: expect.any(Number) } });
    });
  });
});
