const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/photo.jpg' } }),
      })),
    },
  })),
}));

jest.mock('../utils/linkGenerator', () => ({
  generateMagicLinks: jest.fn().mockReturnValue({}),
}));

jest.mock('../utils/mailer', () => ({
  sendStatusEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../utils/pushNotification', () => ({
  sendPushNotification: jest.fn().mockResolvedValue(true),
}));

jest.mock('../utils/prisma', () => ({
  civicIssue: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  comment: {
    deleteMany: jest.fn(),
  },
  intervention: {
    deleteMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
}));

const prisma = require('../utils/prisma');
const reportController = require('../controllers/reportController');

const mockAuth = (req, res, next) => {
  req.user = { id: 1, role: 'CITIZEN' };
  next();
};

app.get('/api/reports', reportController.getAllCivicIssues);
app.get('/api/reports/nearby', reportController.getNearbyCivicIssues);
app.get('/api/reports/:id', reportController.getCivicIssueById);
app.patch('/api/reports/:id', mockAuth, reportController.updateCivicIssue);
app.delete('/api/reports/:id', mockAuth, reportController.deleteCivicIssue);

describe('Report Controller API Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reports', () => {
    it('should return paginated reports with 200 status', async () => {
      const mockReports = [
        { id: 1, title: 'Pothole', latitude: 35.58, longitude: -5.36 },
        { id: 2, title: 'Broken Light', latitude: 35.59, longitude: -5.37 }
      ];

      prisma.civicIssue.findMany.mockResolvedValue(mockReports);
      prisma.civicIssue.count.mockResolvedValue(2);

      const response = await request(app).get('/api/reports?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBe(2);
      expect(response.body.metadata.totalReports).toBe(2);
      expect(prisma.civicIssue.findMany).toHaveBeenCalledTimes(1);
    });

    it('should calculate distance if user coordinates are provided', async () => {
      prisma.civicIssue.findMany.mockResolvedValue([
        { id: 1, title: 'Pothole', latitude: 35.58, longitude: -5.36 }
      ]);
      prisma.civicIssue.count.mockResolvedValue(1);

      const response = await request(app).get('/api/reports?user_lat=35.57&user_lng=-5.35');

      expect(response.status).toBe(200);
      expect(response.body.data[0]).toHaveProperty('distance');
    });
  });

  describe('GET /api/reports/:id', () => {
    it('should return a specific report by ID', async () => {
      const mockReport = { id: 5, title: 'Leaking pipe' };
      prisma.civicIssue.findUnique.mockResolvedValue(mockReport);

      const response = await request(app).get('/api/reports/5');

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Leaking pipe');
      expect(prisma.civicIssue.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 5 }
      }));
    });

    it('should return 404 if report does not exist', async () => {
      prisma.civicIssue.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/reports/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Civic issue not found');
    });
  });

  describe('GET /api/reports/nearby', () => {
    it('should require latitude and longitude', async () => {
      const response = await request(app).get('/api/reports/nearby');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Coordinates required');
    });

    it('should fetch nearby reports successfully', async () => {
      prisma.civicIssue.findMany.mockResolvedValue([
        { id: 1, latitude: 35.575, longitude: -5.355 }
      ]);

      const response = await request(app).get('/api/reports/nearby?latitude=35.57&longitude=-5.35&radius=5');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.metadata.radius_used).toBe('5km');
    });
  });

  describe('PATCH /api/reports/:id', () => {
    it('should block updates if user is not the owner or admin', async () => {
      prisma.civicIssue.findUnique.mockResolvedValue({ id: 1, userId: 99 });

      const response = await request(app).patch('/api/reports/1').send({ title: 'New Title' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('No permission to modify this civic issue');
    });

    it('should update the report successfully if user is owner', async () => {
      prisma.civicIssue.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      prisma.civicIssue.update.mockResolvedValue({ id: 1, title: 'Updated Title' });

      const response = await request(app).patch('/api/reports/1').send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Title');
      expect(prisma.civicIssue.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/reports/:id', () => {
    it('should delete a report and its comments via a transaction', async () => {
      prisma.civicIssue.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      prisma.$transaction.mockResolvedValue([]);

      const response = await request(app).delete('/api/reports/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Civic issue deleted successfully');
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
