const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mock Prisma
jest.mock('../utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
}));

// Mock bcrypt and jwt to avoid heavy cryptographic operations in tests
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_jwt_token'),
}));

// Mock email utility so it doesn't actually email people
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

// Mock express-validator to simulate empty errors
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: () => true,
    array: () => []
  }))
}));

const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const authController = require('../controllers/authController');

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/forgotpassword', authController.forgotPassword);

describe('Auth Controller Tests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('should return 400 if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ email: 'test@test.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should hash password and create user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1, name: 'Test', email: 'test@test.com', role: 'CITIZEN'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.token).toBe('fake_jwt_token');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for invalid credentials (wrong password)', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed_password' });
      bcrypt.compare.mockResolvedValue(false); // Simulate bad password

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      
    });

    it('should return a token if credentials are valid', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed_password' });
      bcrypt.compare.mockResolvedValue(true); 

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'correctpassword' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('fake_jwt_token');
    });
  });

  describe('POST /api/auth/forgotpassword', () => {
    it('should return 404 if email is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgotpassword')
        .send({ email: 'nobody@test.com' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('There is no user with that email');
    });
  });
});