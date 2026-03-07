const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

jest.mock('../utils/prisma', () => ({
  report: {
    findUnique: jest.fn(),
  },
  comment: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  }
}));

const prisma = require('../utils/prisma');
const commentController = require('../controllers/commentController');

const mockAuth = (req, res, next) => {
  req.user = { id: 1, role: 'CITIZEN' };
  next();
};

app.get('/api/reports/:id/comments', commentController.getReportComments);
app.post('/api/reports/:id/comments', mockAuth, commentController.createComment);
app.delete('/api/reports/:id/comments/:commentId', mockAuth, commentController.deleteComment);

describe('Comment Controller Tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/reports/:id/comments', () => {
    it('should block user if they exceed the anti-spam limit of 5 comments/hour', async () => {
      prisma.comment.count.mockResolvedValue(5); // Simulate 5 recent comments

      const response = await request(app)
        .post('/api/reports/1/comments')
        .send({ content: 'Hello' });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('reached the comment limit');
    });

    it('should return 400 if comment content is empty', async () => {
      prisma.comment.count.mockResolvedValue(1); 

      const response = await request(app)
        .post('/api/reports/1/comments')
        .send({ content: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Comment content cannot be empty');
    });

    it('should create a comment if validation passes', async () => {
      prisma.comment.count.mockResolvedValue(1);
      prisma.report.findUnique.mockResolvedValue({ id: 1 });
      prisma.comment.create.mockResolvedValue({ text: 'Good report!' });

      const response = await request(app)
        .post('/api/reports/1/comments')
        .send({ content: 'Good report!' });

      expect(response.status).toBe(201);
      expect(response.body.data.text).toBe('Good report!');
    });
  });

  describe('DELETE /api/reports/:id/comments/:commentId', () => {
    it('should prevent deletion if user is not the owner or admin', async () => {
      // Database says comment belongs to user 99, but mock auth is user 1
      prisma.comment.findUnique.mockResolvedValue({ id: 5, reportId: 1, userId: 99 });

      const response = await request(app).delete('/api/reports/1/comments/5');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('You do not have permission to delete this comment');
    });

    it('should delete comment if user is the owner', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 5, reportId: 1, userId: 1 });
      prisma.comment.delete.mockResolvedValue({});

      const response = await request(app).delete('/api/reports/1/comments/5');

      expect(response.status).toBe(200);
      expect(prisma.comment.delete).toHaveBeenCalled();
    });
  });
});