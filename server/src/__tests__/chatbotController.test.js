const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

jest.mock('../utils/prisma', () => ({
  civicIssue: {
    groupBy: jest.fn(),
    count: jest.fn(),
  },
  $queryRaw: jest.fn(),
}));

jest.mock('axios');

const prisma = require('../utils/prisma');
const axios = require('axios');
const chatbotController = require('../controllers/chatbotController');

app.get('/api/chatbot/analytics', chatbotController.getAnalyticsSummary);
app.get('/api/chatbot/warmup', chatbotController.warmupAiService);
app.post('/api/chatbot/message', chatbotController.handleChatMessage);

describe('Chatbot Controller Tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/chatbot/analytics', () => {
    it('should return formatted overview and departments data with 200', async () => {
      prisma.civicIssue.groupBy.mockResolvedValue([
        { status: 'RESOLVED', _count: 10 },
        { status: 'IN_PROGRESS', _count: 5 },
        { status: 'PENDING', _count: 3 },
      ]);
      prisma.$queryRaw.mockResolvedValue([
        { department: 'Roads', resolvedCount: '10', avgHours: '2.5' },
      ]);
      prisma.civicIssue.count.mockResolvedValue(2);

      const response = await request(app).get('/api/chatbot/analytics');

      expect(response.status).toBe(200);
      expect(response.body.overview.total).toBe(18);
      expect(response.body.overview.resolved).toBe(10);
      expect(response.body.overview.inProgress).toBe(5);
      expect(response.body.overview.pending).toBe(3);
      expect(response.body.overview.todayCount).toBe(2);
      expect(response.body.overview.resolutionRate).toBe('55.6%');
      expect(response.body.departments).toHaveLength(1);
      expect(response.body.departments[0].name).toBe('Roads');
      expect(response.body.departments[0].resolved).toBe(10);
      expect(response.body.departments[0].avgTime).toBe('2.5h');
    });
  });

  describe('GET /api/chatbot/warmup', () => {
    it('should respond 200 immediately with warmup_initiated', async () => {
      const response = await request(app).get('/api/chatbot/warmup');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('warmup_initiated');
    });
  });

  describe('POST /api/chatbot/message', () => {
    it('should return 400 with bot_reply when message is missing', async () => {
      const response = await request(app)
        .post('/api/chatbot/message')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.bot_reply).toBe('Message cannot be empty.');
    });

    it('should return 500 with AI config error when PYTHON_AI_URL is not set', async () => {
      const original = process.env.PYTHON_AI_URL;
      delete process.env.PYTHON_AI_URL;

      const response = await request(app)
        .post('/api/chatbot/message')
        .send({ message: 'Hello' });

      expect(response.status).toBe(500);
      expect(response.body.bot_reply).toBe('AI Server configuration error.');
      expect(response.body.intent).toBe('UNKNOWN');

      process.env.PYTHON_AI_URL = original;
    });

    it('should return 200 with graceful bot_reply on axios ECONNABORTED timeout', async () => {
      process.env.PYTHON_AI_URL = 'http://fake-ai-service';
      const timeoutError = new Error('timeout');
      timeoutError.code = 'ECONNABORTED';
      axios.post.mockRejectedValue(timeoutError);

      const response = await request(app)
        .post('/api/chatbot/message')
        .send({ message: 'Fix the road' });

      expect(response.status).toBe(200);
      expect(response.body.bot_reply).toMatch(/temporarily offline/i);
      expect(response.body.intent).toBe('UNKNOWN');

      delete process.env.PYTHON_AI_URL;
    });

    it('should forward message and return Python service response on success', async () => {
      process.env.PYTHON_AI_URL = 'http://fake-ai-service';
      const pythonData = {
        intent: 'REPORT_ISSUE',
        bot_reply: 'I can help you report that.',
        category: 'Roads',
        confidence: 0.95,
      };
      axios.post.mockResolvedValue({ data: pythonData });

      const response = await request(app)
        .post('/api/chatbot/message')
        .send({ message: 'There is a pothole on my street' });

      expect(response.status).toBe(200);
      expect(response.body.intent).toBe('REPORT_ISSUE');
      expect(response.body.bot_reply).toBe('I can help you report that.');
      expect(axios.post).toHaveBeenCalledWith(
        'http://fake-ai-service/parse',
        { message: 'There is a pothole on my street' },
        { timeout: 65000 }
      );

      delete process.env.PYTHON_AI_URL;
    });
  });
});
