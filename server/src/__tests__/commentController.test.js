const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

jest.mock('../utils/prisma', () => ({
  civicIssue: {
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

app.get('/api/reports/:id/comments', commentController.getCivicIssueComments);
app.post('/api/reports/:id/comments', mockAuth, commentController.createComment);
app.delete('/api/reports/:id/comments/:commentId', mockAuth, commentController.deleteComment);

describe('Comment Controller Tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/reports/:id/comments', () => {
    it('should return 404 if civic issue does not exist', async () => {
      prisma.civicIssue.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/reports/999/comments');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Civic issue not found');
    });

    it('should return comments list for a valid civic issue', async () => {
      prisma.civicIssue.findUnique.mockResolvedValue({ id: 1 });
      prisma.comment.findMany.mockResolvedValue([
        { id: 1, text: 'Nice report', user: { name: 'Alice' } }
      ]);

      const response = await request(app).get('/api/reports/1/comments');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBe(1);
    });
  });

  describe('POST /api/reports/:id/comments', () => {
    it('should block user if they exceed the anti-spam limit of 5 comments/hour', async () => {
      prisma.comment.count.mockResolvedValue(5);

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
      prisma.civicIssue.findUnique.mockResolvedValue({ id: 1 });
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
      prisma.comment.findUnique.mockResolvedValue({ id: 5, civicIssueId: 1, userId: 99 });

      const response = await request(app).delete('/api/reports/1/comments/5');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('You do not have permission to delete this comment');
    });

    it('should delete comment if user is the owner', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 5, civicIssueId: 1, userId: 1 });
      prisma.comment.delete.mockResolvedValue({});

      const response = await request(app).delete('/api/reports/1/comments/5');

      expect(response.status).toBe(200);
      expect(prisma.comment.delete).toHaveBeenCalled();
    });
  });
});
