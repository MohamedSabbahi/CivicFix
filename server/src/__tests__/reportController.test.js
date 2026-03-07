const request = require('supertest');
const express = require('express');

// 1. Setup a dummy Express app to test the controller isolated from your main server
const app = express();
app.use(express.json());

// 2. Mock Prisma before importing the controller
jest.mock('../utils/prisma', () => ({
  report: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  comment: {
    deleteMany: jest.fn()
  }
}));

const prisma = require('../utils/prisma');
const reportController = require('../controllers/reportController');

// 3. Mock Auth Middleware (Simulating a logged-in user)
const mockAuth = (req, res, next) => {
  req.user = { id: 1, role: 'CITIZEN' };
  next();
};

// 4. Bind the controller functions to dummy routes for testing
app.get('/api/reports', reportController.getAllReports);
app.get('/api/reports/nearby', reportController.getNearbyReports);
app.get('/api/reports/:id', reportController.getReportById);
app.patch('/api/reports/:id', mockAuth, reportController.updateReport);
app.delete('/api/reports/:id', mockAuth, reportController.deleteReport);

describe('Report Controller API Tests', () => {

  afterEach(() => {
    jest.clearAllMocks(); // Clear memory after each test
  });

  describe('GET /api/reports', () => {
    it('should return paginated reports with 200 status', async () => {
      // Mock the database response
      const mockReports = [
        { id: 1, title: 'Pothole', latitude: 35.58, longitude: -5.36 },
        { id: 2, title: 'Broken Light', latitude: 35.59, longitude: -5.37 }
      ];
      
      prisma.report.findMany.mockResolvedValue(mockReports);
      prisma.report.count.mockResolvedValue(2);

      const response = await request(app).get('/api/reports?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBe(2);
      expect(response.body.metadata.total).toBe(2);
      expect(prisma.report.findMany).toHaveBeenCalledTimes(1);
    });

    it('should calculate distance if user coordinates are provided', async () => {
      prisma.report.findMany.mockResolvedValue([
        { id: 1, title: 'Pothole', latitude: 35.58, longitude: -5.36 }
      ]);
      prisma.report.count.mockResolvedValue(1);

      // Testing geolocation calculation logic
      const response = await request(app).get('/api/reports?user_lat=35.57&user_lng=-5.35');

      expect(response.status).toBe(200);
      expect(response.body.data[0]).toHaveProperty('distance');
    });
  });

  describe('GET /api/reports/:id', () => {
    it('should return a specific report by ID', async () => {
      const mockReport = { id: 5, title: 'Leaking pipe' };
      prisma.report.findUnique.mockResolvedValue(mockReport);

      const response = await request(app).get('/api/reports/5');

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Leaking pipe');
      expect(prisma.report.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 5 }
      }));
    });

    it('should return 404 if report does not exist', async () => {
      prisma.report.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/reports/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Report not found');
    });
  });

  describe('GET /api/reports/nearby', () => {
    it('should require latitude and longitude', async () => {
      const response = await request(app).get('/api/reports/nearby');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Coordinates required');
    });

    it('should fetch nearby reports successfully', async () => {
      prisma.report.findMany.mockResolvedValue([
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
      // Setup mock DB where report belongs to user ID 99 (but mock auth is ID 1)
      prisma.report.findUnique.mockResolvedValue({ id: 1, userId: 99 });

      const response = await request(app).patch('/api/reports/1').send({ title: 'New Title' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('You do not have permission to modify this report');
    });

    it('should update the report successfully if user is owner', async () => {
      // Setup mock DB where report belongs to our mock user (ID 1)
      prisma.report.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      prisma.report.update.mockResolvedValue({ id: 1, title: 'Updated Title' });

      const response = await request(app).patch('/api/reports/1').send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Title');
      expect(prisma.report.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/reports/:id', () => {
    it('should delete a report and its comments via a transaction', async () => {
      prisma.report.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      prisma.$transaction.mockResolvedValue([]);

      const response = await request(app).delete('/api/reports/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Report and associated comments deleted successfully');
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});